// C-343/E-38: BLS-Zensur wird als Lower Bound eingefroren, echte Luecken bleiben offen.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const CONTAINER = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const DB = process.env.PGDATABASE ?? 'postgres'
const USER_ID = 'd15fb34f-62e6-43e5-9d1c-ec8bab6ae1a6'

function one<T>(sql: string): T {
  return JSON.parse(execFileSync('docker', [
    'exec', CONTAINER,
    'psql', '-X', '-q', '-U', 'postgres', '-d', DB,
    '-t', '-A', '-c', sql,
  ], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }).trim()) as T
}

test('C-343: BLS-Wertstatus bewahrt Zensur, Luecke, Spur und logische Null', () => {
  const result = one<{
    statusCounts: Record<string, number>
    vitc: Array<{ bls_code: string; value: number | null; bls_value_status: string }>
  }>(`
    SELECT json_build_object(
      'statusCounts', (
        SELECT json_object_agg(bls_value_status, row_count)
        FROM (
          SELECT bls_value_status, count(*)::integer AS row_count
          FROM nutrition.food_nutrients
          GROUP BY bls_value_status
        ) counts
      ),
      'vitc', (
        SELECT json_agg(json_build_object(
          'bls_code', f.bls_code,
          'value', fn.value,
          'bls_value_status', fn.bls_value_status
        ) ORDER BY f.bls_code)
        FROM nutrition.food_nutrients fn
        JOIN nutrition.foods f ON f.id = fn.food_id
        WHERE fn.nutrient_code = 'VITC'
          AND f.bls_code IN ('E111100', 'V122100')
      )
    );
  `)

  assert.deepEqual(result.statusCounts, {
    censored: 3870,
    logical_zero: 18566,
    measured: 850896,
    missing: 110188,
    trace: 1800,
  })
  assert.deepEqual(result.vitc, [
    { bls_code: 'E111100', value: 0, bls_value_status: 'censored' },
    { bls_code: 'V122100', value: null, bls_value_status: 'missing' },
  ])
})

test('C-343: zensierte VITC-Posten vervollstaendigen den Tag, Ziegenfleisch nicht', () => {
  const result = one<Array<{
    entry_date: string
    item_count: number
    value_count: number
    missing_count: number
    value_complete: boolean
  }>>(`
    SELECT COALESCE(json_agg(json_build_object(
      'entry_date', d.entry_date,
      'item_count', d.item_count,
      'value_count', d.value_count,
      'missing_count', d.missing_count,
      'value_complete', d.value_complete
    ) ORDER BY d.entry_date), '[]'::json)
    FROM nutrition.daily_nutrient_summary_long d
    WHERE d.user_id = '${USER_ID}'::uuid
      AND d.nutrient_code = 'VITC'
      AND d.entry_date IN (DATE '2026-08-03', DATE '2026-08-01');
  `)

  assert.deepEqual(result, [
    { entry_date: '2026-08-01', item_count: 13, value_count: 12, missing_count: 1, value_complete: false },
    { entry_date: '2026-08-03', item_count: 13, value_count: 13, missing_count: 0, value_complete: true },
  ])
})

test('C-343: ein Naehrstoff ohne Zensur bleibt vollstaendig', () => {
  const result = one<{
    censoredRows: number
    completeDays: number
    missingPositions: number
  }>(`
    SELECT json_build_object(
      'censoredRows', (
        SELECT count(*)::integer
        FROM nutrition.food_nutrients
        WHERE nutrient_code = 'PROT625' AND bls_value_status = 'censored'
      ),
      'completeDays', (
        SELECT count(*) FILTER (WHERE value_complete)::integer
        FROM nutrition.daily_nutrient_summary_long
        WHERE user_id = '${USER_ID}'::uuid
          AND nutrient_code = 'PROT625'
          AND entry_date BETWEEN DATE '2026-08-01' AND DATE '2026-08-30'
      ),
      'missingPositions', (
        SELECT COALESCE(sum(missing_count), 0)::integer
        FROM nutrition.daily_nutrient_summary_long
        WHERE user_id = '${USER_ID}'::uuid
          AND nutrient_code = 'PROT625'
          AND entry_date BETWEEN DATE '2026-08-01' AND DATE '2026-08-30'
      )
    );
  `)

  assert.deepEqual(result, {
    censoredRows: 0,
    completeDays: 30,
    missingPositions: 0,
  })
})

test('C-402: zensierter FIBT-Wert vervollstaendigt den eingefrorenen Flachwert', () => {
  const result = one<{
    censoredLachs: number
    completeDays: number
    loggedDays: number
    missingPositions: number
  }>(`
    SELECT json_build_object(
      'censoredLachs', (
        SELECT count(*)::integer
        FROM nutrition.food_nutrients fn
        JOIN nutrition.foods f ON f.id = fn.food_id
        WHERE f.bls_code = 'T410100'
          AND fn.nutrient_code = 'FIBT'
          AND fn.value = 0
          AND fn.bls_value_status = 'censored'
      ),
      'completeDays', (
        SELECT count(*) FILTER (WHERE fibt_missing = 0)::integer
        FROM nutrition.daily_summary
        WHERE user_id = '${USER_ID}'::uuid
          AND entry_date BETWEEN DATE '2026-05-06' AND DATE '2026-09-02'
      ),
      'loggedDays', (
        SELECT count(*)::integer
        FROM nutrition.daily_summary
        WHERE user_id = '${USER_ID}'::uuid
          AND entry_date BETWEEN DATE '2026-05-06' AND DATE '2026-09-02'
      ),
      'missingPositions', (
        SELECT COALESCE(sum(fibt_missing), 0)::integer
        FROM nutrition.daily_summary
        WHERE user_id = '${USER_ID}'::uuid
          AND entry_date BETWEEN DATE '2026-05-06' AND DATE '2026-09-02'
      )
    );
  `)

  assert.equal(result.censoredLachs, 1)
  assert.equal(result.missingPositions, 0)
  assert.equal(result.completeDays, result.loggedDays)
})
