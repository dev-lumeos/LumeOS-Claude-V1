import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const container = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const db = process.env.PGDATABASE
if (!db || db === 'postgres') throw new Error('C-526 braucht PGDATABASE als Wegwerf-Datenbank.')

function one<T>(sql: string): T {
  const output = execFileSync('docker', [
    'exec', container, 'psql', '-X', '-q', '-v', 'ON_ERROR_STOP=1', '-U', 'postgres', '-d', db,
    '-t', '-A', '-c', sql,
  ], { encoding: 'utf8' }).trim()
  const payload = output.match(/\{[\s\S]*\}/)?.[0]
  if (!payload) throw new Error(`Kein JSON-Ergebnis: ${output}`)
  return JSON.parse(payload) as T
}

test('C-526: ein zweiter aktiver Plan für denselben Tag wird abgewiesen', () => {
  const available = one<{ guard: boolean }>(`
    SELECT json_build_object(
      'guard', to_regprocedure('nutrition.meal_plan_active_overlap_guard()') IS NOT NULL
    );
  `)
  assert.deepEqual(available, { guard: true })
  if (!available.guard) return

  const result = one<{
    assignedOverlapAllowed: boolean
    activationRejected: boolean
    activePlans: number
    activeCoverage: number
  }>(`
    BEGIN;
    DO $block$
    DECLARE
      v_user uuid := '00000000-0000-0000-0000-000000000526';
      v_first uuid := '10000000-0000-0000-0000-000000000526';
      v_second uuid := '10000000-0000-0000-0000-000000000527';
    BEGIN
      INSERT INTO auth.users (id, email) VALUES (v_user, 'c526@lumeos.local');
      INSERT INTO nutrition.meal_plans (id, user_id, name, status, start_date, days_count, plan_origin)
      VALUES
        (v_first, v_user, 'C526 aktiv', 'active', DATE '2026-09-21', 7, 'coach_created'),
        (v_second, v_user, 'C526 zugeteilt', 'assigned', DATE '2026-09-21', 7, 'coach_created');
      INSERT INTO nutrition.meal_plan_weeks (id, plan_id, user_id, week_start)
      VALUES
        ('20000000-0000-0000-0000-000000000526', v_first, v_user, DATE '2026-09-21'),
        ('20000000-0000-0000-0000-000000000527', v_second, v_user, DATE '2026-09-21');
      INSERT INTO nutrition.meal_plan_days (id, week_id, user_id, plan_date, day_index)
      VALUES
        ('30000000-0000-0000-0000-000000000526', '20000000-0000-0000-0000-000000000526', v_user, DATE '2026-09-21', 1),
        ('30000000-0000-0000-0000-000000000527', '20000000-0000-0000-0000-000000000527', v_user, DATE '2026-09-21', 1);
      BEGIN
        UPDATE nutrition.meal_plans SET status = 'active' WHERE id = v_second;
      EXCEPTION WHEN check_violation THEN
        NULL;
      END;
    END;
    $block$;
    SELECT json_build_object(
      'assignedOverlapAllowed', (SELECT count(*) = 1 FROM nutrition.meal_plans WHERE id = '10000000-0000-0000-0000-000000000527' AND status = 'assigned'),
      'activationRejected', (SELECT count(*) = 1 FROM nutrition.meal_plans WHERE id = '10000000-0000-0000-0000-000000000527' AND status = 'assigned'),
      'activePlans', (SELECT count(*) FROM nutrition.meal_plans WHERE user_id = '00000000-0000-0000-0000-000000000526' AND status = 'active'),
      'activeCoverage', (
        SELECT count(DISTINCT p.id)
        FROM nutrition.meal_plans p
        JOIN nutrition.meal_plan_weeks w ON w.plan_id = p.id
        JOIN nutrition.meal_plan_days d ON d.week_id = w.id
        WHERE p.user_id = '00000000-0000-0000-0000-000000000526'
          AND p.status = 'active'
          AND d.plan_date = DATE '2026-09-21'
      )
    );
    ROLLBACK;
  `)
  assert.deepEqual(result, {
    assignedOverlapAllowed: true,
    activationRejected: true,
    activePlans: 1,
    activeCoverage: 1,
  })
})

test('C-526: bestehende aktive Planabdeckung ist bereits eindeutig', () => {
  const result = one<{ conflictingDates: number }>(`
    SELECT json_build_object(
      'conflictingDates', count(*)
    )
    FROM (
      SELECT d.user_id, d.plan_date
      FROM nutrition.meal_plans p
      JOIN nutrition.meal_plan_weeks w ON w.plan_id = p.id
      JOIN nutrition.meal_plan_days d ON d.week_id = w.id
      WHERE p.status = 'active'
      GROUP BY d.user_id, d.plan_date
      HAVING count(DISTINCT p.id) > 1
    ) conflicts;
  `)
  assert.deepEqual(result, { conflictingDates: 0 })
})
