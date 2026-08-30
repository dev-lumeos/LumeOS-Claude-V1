// C-163/C-351/E-35: Die Supplementbilanz summiert nur belegte Mengen und
// verliert Einnahmen ohne Katalogverknuepfung nicht als scheinbare Null.
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

test('C-163/C-351: belegte FAPUN3-Menge und alle unbekannten Einnahmen eines Tages bleiben getrennt', () => {
  const result = one<Array<{
    nutrient_code: string | null
    nutrient_unit: string | null
    total_amount: number | null
    taken_log_count: number
    skipped_log_count: number
    mapped_taken_log_count: number
    unmapped_taken_log_count: number
  }>>(`
    SELECT COALESCE(json_agg(json_build_object(
      'nutrient_code', nutrient_code,
      'nutrient_unit', nutrient_unit,
      'total_amount', total_amount,
      'taken_log_count', taken_log_count,
      'skipped_log_count', skipped_log_count,
      'mapped_taken_log_count', mapped_taken_log_count,
      'unmapped_taken_log_count', unmapped_taken_log_count
    ) ORDER BY nutrient_code NULLS LAST), '[]'::json)
    FROM supplements.supplement_nutrient_intake_for_day(
      '${USER_ID}'::uuid, DATE '2026-08-19'
    );
  `)

  assert.deepEqual(result, [{
    nutrient_code: 'FAPUN3',
    nutrient_unit: 'g',
    total_amount: 2,
    taken_log_count: 4,
    skipped_log_count: 0,
    mapped_taken_log_count: 1,
    unmapped_taken_log_count: 3,
  }])
})

test('C-163/C-351: ein Tag ohne belegte Nährstoffmenge bleibt als unbekannt sichtbar', () => {
  const result = one<Array<{
    nutrient_code: string | null
    nutrient_unit: string | null
    total_amount: number | null
    taken_log_count: number
    unmapped_taken_log_count: number
  }>>(`
    SELECT COALESCE(json_agg(json_build_object(
      'nutrient_code', nutrient_code,
      'nutrient_unit', nutrient_unit,
      'total_amount', total_amount,
      'taken_log_count', taken_log_count,
      'unmapped_taken_log_count', unmapped_taken_log_count
    )), '[]'::json)
    FROM supplements.supplement_nutrient_intake_for_day(
      '61e9f10a-4e40-4162-8a92-a19479b40615'::uuid, DATE '2026-08-19'
    );
  `)

  assert.deepEqual(result, [{
    nutrient_code: null,
    nutrient_unit: null,
    total_amount: null,
    taken_log_count: 2,
    unmapped_taken_log_count: 2,
  }])
})
