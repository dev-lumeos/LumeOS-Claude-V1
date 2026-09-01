// C-239/C-238/C-348: Lifecycle und Ghost-Ausfuehrungen sind Schema;
// die Flag-Antwort verdichtet die vorhandene Referenzfunktion.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const CONTAINER = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const DB = process.env.PGDATABASE ?? 'postgres'
const USER_ID = '10000000-0000-0000-0000-000000000101'

function one<T>(sql: string): T {
  return JSON.parse(execFileSync('docker', [
    'exec', CONTAINER,
    'psql', '-X', '-q', '-U', 'postgres', '-d', DB,
    '-t', '-A', '-c', sql,
  ], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }).trim()) as T
}

test('C-239/C-238: Lifecycle und Ghost-Ausfuehrung sind getrennt modelliert', () => {
  const schema = one<{
    planColumns: string[]
    logColumns: string[]
    lifecycleCheck: string | null
    executionCheck: string | null
    plans: { lifecycle_type: string | null; rollover_count: number | null; status: string }[]
  }>(`
    SELECT json_build_object(
      'planColumns', (SELECT COALESCE(json_agg(column_name ORDER BY column_name), '[]'::json)
                      FROM information_schema.columns
                      WHERE table_schema = 'nutrition' AND table_name = 'meal_plans'
                        AND column_name IN ('lifecycle_type', 'start_date', 'days_count', 'next_plan_id', 'rollover_count', 'status')),
      'logColumns', (SELECT COALESCE(json_agg(column_name ORDER BY column_name), '[]'::json)
                     FROM information_schema.columns
                     WHERE table_schema = 'nutrition' AND table_name = 'meal_plan_logs'
                       AND column_name IN ('plan_id', 'plan_entry_id', 'execution_date', 'status', 'actual_meal_id', 'confirmation_mode', 'confirmed_at', 'skipped_at')),
      'lifecycleCheck', (SELECT pg_get_constraintdef(c.oid)
                         FROM pg_constraint c
                         JOIN pg_class t ON t.oid = c.conrelid
                         JOIN pg_namespace n ON n.oid = t.relnamespace
                         WHERE n.nspname = 'nutrition' AND t.relname = 'meal_plans'
                           AND c.conname = 'meal_plans_lifecycle_type_check'),
      'executionCheck', (SELECT pg_get_constraintdef(c.oid)
                         FROM pg_constraint c
                         JOIN pg_class t ON t.oid = c.conrelid
                         JOIN pg_namespace n ON n.oid = t.relnamespace
                         WHERE n.nspname = 'nutrition' AND t.relname = 'meal_plan_logs'
                           AND c.conname = 'meal_plan_logs_status_check'),
      'plans', (SELECT COALESCE(json_agg(json_build_object(
                    'lifecycle_type', to_jsonb(mp)->>'lifecycle_type',
                    'rollover_count', (to_jsonb(mp)->>'rollover_count')::integer,
                    'status', to_jsonb(mp)->>'status') ORDER BY mp.id), '[]'::json)
                 FROM nutrition.meal_plans mp)
    );`)

  assert.deepEqual(schema.planColumns, [
    'days_count', 'lifecycle_type', 'next_plan_id', 'rollover_count', 'start_date', 'status',
  ])
  assert.deepEqual(schema.logColumns, [
    'actual_meal_id', 'confirmation_mode', 'confirmed_at', 'execution_date',
    'plan_entry_id', 'plan_id', 'skipped_at', 'status',
  ])
  assert.match(schema.lifecycleCheck ?? '', /once.*rollover.*sequence/)
  assert.match(schema.executionCheck ?? '', /pending.*confirmed.*deviated.*skipped/)
  assert.ok(schema.plans.every(p => p.lifecycle_type === null
    || ['once', 'rollover', 'sequence'].includes(p.lifecycle_type)))
  assert.ok(schema.plans.some(p => p.lifecycle_type !== null))
  assert.ok(schema.plans.some(p => (p.rollover_count ?? 0) > 0))
  assert.ok(schema.plans.every(p => ['assigned', 'active', 'completed', 'paused', 'archived'].includes(p.status)))
})

test('C-348: Flag-Funktion verdichtet exakt dieselbe Fensterbewertung', () => {
  const exists = one<{ exists: boolean }>(`
    SELECT json_build_object(
      'exists', to_regprocedure('nutrition.reference_assessment_window_flags(uuid,date,integer)') IS NOT NULL
    );`)
  assert.equal(exists.exists, true)

  const result = one<{ expected: unknown[]; actual: unknown[] }>(`
    WITH expected AS (
      SELECT
        w.nutrient_code,
        w.nutrient_name_de,
        w.reference_direction,
        count(*) FILTER (WHERE d.reference_status = 'complete' AND d.reference_pct IS NOT NULL
          AND ((w.reference_direction = 'upper_limit' AND d.reference_pct > 100)
            OR (w.reference_direction = 'target' AND d.reference_pct < 80)))::integer AS triggered_day_count,
        count(*) FILTER (WHERE d.reference_status = 'complete' AND d.reference_pct IS NOT NULL)::integer AS assessed_day_count,
        count(*) FILTER (WHERE d.reference_status = 'incomplete')::integer AS incomplete_day_count
      FROM nutrition.reference_assessment_window('${USER_ID}'::uuid, DATE '2026-08-29', 90) w
      CROSS JOIN LATERAL jsonb_to_recordset(w.daily_assessments) AS d(
        reference_pct numeric, reference_status text
      )
      WHERE w.reference_direction IN ('target', 'upper_limit')
      GROUP BY w.nutrient_code, w.nutrient_name_de, w.reference_direction
      HAVING count(*) FILTER (WHERE d.reference_status = 'complete' AND d.reference_pct IS NOT NULL) >= 4
         AND count(*) FILTER (WHERE d.reference_status = 'complete' AND d.reference_pct IS NOT NULL
              AND ((w.reference_direction = 'upper_limit' AND d.reference_pct > 100)
                OR (w.reference_direction = 'target' AND d.reference_pct < 80)))
             >= count(*) FILTER (WHERE d.reference_status = 'complete' AND d.reference_pct IS NOT NULL) * 0.5
    )
    SELECT json_build_object(
      'expected', (SELECT COALESCE(json_agg(row_to_json(e) ORDER BY nutrient_code, reference_direction), '[]'::json) FROM expected e),
      'actual', (SELECT COALESCE(json_agg(row_to_json(a) ORDER BY nutrient_code, reference_direction), '[]'::json)
                 FROM nutrition.reference_assessment_window_flags('${USER_ID}'::uuid, DATE '2026-08-29', 90) a)
    );`)

  assert.ok(result.expected.length > 0)
  assert.deepEqual(result.actual, result.expected)
})
