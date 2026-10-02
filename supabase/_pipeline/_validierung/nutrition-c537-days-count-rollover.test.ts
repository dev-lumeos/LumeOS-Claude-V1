import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const container = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const db = process.env.PGDATABASE
if (!db || db === 'postgres') throw new Error('C-537 braucht PGDATABASE als Wegwerf-Datenbank.')

function one<T>(sql: string): T {
  const output = execFileSync('docker', [
    'exec', container, 'psql', '-X', '-q', '-v', 'ON_ERROR_STOP=1', '-U', 'postgres', '-d', db,
    '-t', '-A', '-c', sql,
  ], { encoding: 'utf8' }).trim()
  const payload = output.match(/\{[\s\S]*\}/)?.[0]
  if (!payload) throw new Error(`Kein JSON-Ergebnis: ${output}`)
  return JSON.parse(payload) as T
}

test('C-537: days_count folgt den materialisierten Plantagen', () => {
  const result = one<{
    countFunction: boolean
    planGuard: boolean
    dayTrigger: boolean
    rolloverTrigger: boolean
    materializedPlans: number
    deviations: number
  }>(`
    SELECT json_build_object(
      'countFunction', to_regprocedure('nutrition.meal_plan_materialized_days_count(uuid)') IS NOT NULL,
      'planGuard', to_regprocedure('nutrition.meal_plan_days_count_guard()') IS NOT NULL,
      'dayTrigger', EXISTS (
        SELECT 1 FROM pg_trigger
        WHERE tgrelid = 'nutrition.meal_plan_days'::regclass
          AND tgname = 'meal_plan_days_count_sync_trg' AND NOT tgisinternal
      ),
      'rolloverTrigger', EXISTS (
        SELECT 1 FROM pg_trigger
        WHERE tgrelid = 'nutrition.meal_plans'::regclass
          AND tgname = 'meal_plans_rollover_days_count_sync_trg' AND NOT tgisinternal
      ),
      'materializedPlans', (
        SELECT count(*)
        FROM nutrition.meal_plans p
        WHERE nutrition.meal_plan_materialized_days_count(p.id) > 0
      ),
      'deviations', (
        SELECT count(*)
        FROM nutrition.meal_plans p
        WHERE nutrition.meal_plan_materialized_days_count(p.id) > 0
          AND p.days_count IS DISTINCT FROM nutrition.meal_plan_materialized_days_count(p.id)
      )
    );
  `)

  assert.deepEqual(result, {
    countFunction: true,
    planGuard: true,
    dayTrigger: true,
    rolloverTrigger: true,
    materializedPlans: result.materializedPlans,
    deviations: 0,
  })
})

test('C-537: Sabotage und zweiter Rollover bleiben in einer Transaktion korrekt und rollen zurueck', () => {
  const result = one<{
    firstRollover: { daysCount: number; materializedDays: number; rollovers: number }
    sabotageNormalized: boolean
    secondRollover: { daysCount: number; materializedDays: number; rollovers: number }
  }>(`
    BEGIN;
    INSERT INTO auth.users (id, email)
    VALUES ('00000000-0000-0000-0000-000000005370', 'c537@lumeos.local');
    INSERT INTO nutrition.meal_plans
      (id, user_id, name, status, days_count, rollover_count, plan_origin)
    VALUES
      ('10000000-0000-0000-0000-000000005370', '00000000-0000-0000-0000-000000005370',
       'C537 Rollover', 'assigned', 28, 0, 'self_created');
    INSERT INTO nutrition.meal_plan_weeks (id, plan_id, user_id, week_start)
    SELECT
      ('20000000-0000-0000-0001-' || lpad(series::text, 12, '0'))::uuid,
      '10000000-0000-0000-0000-000000005370',
      '00000000-0000-0000-0000-000000005370',
      DATE '2026-09-21' + ((series - 1) * 7)
    FROM generate_series(1, 4) AS series;
    INSERT INTO nutrition.meal_plan_days (week_id, user_id, plan_date, day_index)
    SELECT w.id, w.user_id, w.week_start + (day_index - 1), day_index
    FROM nutrition.meal_plan_weeks w
    CROSS JOIN generate_series(1, 7) AS day_index
    WHERE w.plan_id = '10000000-0000-0000-0000-000000005370';
    SELECT nutrition.copy_meal_plan_week(
      '20000000-0000-0000-0001-000000000004', DATE '2026-10-19'
    );
    UPDATE nutrition.meal_plans
    SET rollover_count = rollover_count + 1
    WHERE id = '10000000-0000-0000-0000-000000005370';
    CREATE TEMP TABLE c537_result (payload jsonb) ON COMMIT DROP;
    INSERT INTO c537_result
    SELECT jsonb_build_object(
      'firstRollover', jsonb_build_object(
        'daysCount', p.days_count,
        'materializedDays', nutrition.meal_plan_materialized_days_count(p.id),
        'rollovers', p.rollover_count
      )
    )
    FROM nutrition.meal_plans p
    WHERE p.id = '10000000-0000-0000-0000-000000005370';
    UPDATE nutrition.meal_plans
    SET days_count = 999
    WHERE id = '10000000-0000-0000-0000-000000005370';
    SELECT nutrition.copy_meal_plan_week(
      (SELECT id FROM nutrition.meal_plan_weeks
       WHERE plan_id = '10000000-0000-0000-0000-000000005370'
       ORDER BY week_start DESC LIMIT 1),
      DATE '2026-10-26'
    );
    UPDATE nutrition.meal_plans
    SET rollover_count = rollover_count + 1
    WHERE id = '10000000-0000-0000-0000-000000005370';
    UPDATE c537_result SET payload = payload || jsonb_build_object(
      'sabotageNormalized', (
        SELECT p.days_count = nutrition.meal_plan_materialized_days_count(p.id)
        FROM nutrition.meal_plans p
            WHERE p.id = '10000000-0000-0000-0000-000000005370'
      ),
      'secondRollover', (
        SELECT jsonb_build_object(
          'daysCount', p.days_count,
          'materializedDays', nutrition.meal_plan_materialized_days_count(p.id),
          'rollovers', p.rollover_count
        )
        FROM nutrition.meal_plans p
        WHERE p.id = '10000000-0000-0000-0000-000000005370'
      )
    );
    SELECT payload::text FROM c537_result;
    ROLLBACK;
  `)

  const rollback = one<{ rolledBack: boolean }>(`
    SELECT json_build_object(
      'rolledBack', NOT EXISTS (
        SELECT 1 FROM auth.users WHERE id = '00000000-0000-0000-0000-000000005370'
      )
    );
  `)

  assert.deepEqual(result, {
    firstRollover: { daysCount: 35, materializedDays: 35, rollovers: 1 },
    sabotageNormalized: true,
    secondRollover: { daysCount: 42, materializedDays: 42, rollovers: 2 },
  })
  assert.deepEqual(rollback, { rolledBack: true })
})
