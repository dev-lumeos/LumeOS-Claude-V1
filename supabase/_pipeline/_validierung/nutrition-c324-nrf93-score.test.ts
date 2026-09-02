// C-324/E-25: NRF9.3 bleibt die Originalformel. Fehlende Eingaben liefern
// keinen niedrigen Ersatzscore; Vitamin A kommt ausschliesslich aus E-34.
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

test('C-324: NRF9.3 deckelt Protein und bewertet hohe Natriumzufuhr schlechter', () => {
  const result = one<{ baseline: number; highProtein: number; highSodium: number }>(`
    SELECT json_build_object(
      'baseline', nutrition.nrf93_score_from_amounts(
        50, 25, 5000, 60, 20, 1000, 18, 400, 3500, 0, 0, 0
      ),
      'highProtein', nutrition.nrf93_score_from_amounts(
        500, 25, 5000, 60, 20, 1000, 18, 400, 3500, 0, 0, 0
      ),
      'highSodium', nutrition.nrf93_score_from_amounts(
        50, 25, 5000, 60, 20, 1000, 18, 400, 3500, 0, 0, 2400
      )
    );
  `)

  assert.deepEqual(result, {
    baseline: 900,
    highProtein: 900,
    highSodium: 800,
  })
})

test('C-398/E-61: eine unvollstaendige Vitamin-A-Komponente blockiert den NRF9.3-Score nicht', () => {
  const result = one<{
    status: string
    score: number | null
    reference_set: string
    sugar_input: string
    incomplete_input_codes: string[]
  }>(`
    SELECT json_build_object(
      'status', d.status,
      'score', d.score,
      'reference_set', d.reference_set,
      'sugar_input', d.sugar_input,
      'incomplete_input_codes', d.incomplete_input_codes
    )
    FROM nutrition.nrf93_daily('${USER_ID}'::uuid, DATE '2026-08-02') d;
  `)

  assert.equal(result.status, 'complete')
  assert.notEqual(result.score, null)
  assert.equal(result.reference_set, 'NRF9.3 original US Daily Values')
  assert.equal(result.sugar_input, 'total_sugar')
  assert.deepEqual(result.incomplete_input_codes, [])
})

test('C-324: ein Tag ohne Positionen ist no_data und kein Null-Score', () => {
  const result = one<{ status: string; score: number | null; incomplete_input_codes: string[] }>(`
    SELECT json_build_object(
      'status', d.status,
      'score', d.score,
      'incomplete_input_codes', d.incomplete_input_codes
    )
    FROM nutrition.nrf93_daily('61e9f10a-4e40-4162-8a92-a19479b40615'::uuid, DATE '2026-08-17') d;
  `)

  assert.deepEqual(result, {
    status: 'no_data',
    score: null,
    incomplete_input_codes: [],
  })
})
