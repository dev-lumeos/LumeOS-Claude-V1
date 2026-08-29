// C-346: Kollisionen im Vorgaenger-Schluessel duerfen keine Details uebersteuern.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const CONTAINER = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const DB = process.env.PGDATABASE ?? 'postgres'

function rows(sql: string): Array<{ nutrient_code: string; source_key: string; function_de: string }> {
  return JSON.parse(execFileSync('docker', [
    'exec', CONTAINER,
    'psql', '-X', '-U', 'postgres', '-d', DB,
    '-t', '-A', '-c', sql,
  ], { encoding: 'utf8' }))
}

test('C-346: Fluorid und Cholesterin bevorzugen die belegten Legacy-Texte', () => {
  const result = rows(`
    SELECT COALESCE(json_agg(row_to_json(d) ORDER BY d.nutrient_code), '[]'::json)
    FROM (
      SELECT nutrient_code, source_key, function_de
      FROM nutrition.nutrient_details
      WHERE nutrient_code IN ('FD', 'CHORL')
    ) d;`)

  assert.deepEqual(result, [
    { nutrient_code: 'CHORL', source_key: 'CHOL', function_de: 'Hormone, Zellmembranen' },
    { nutrient_code: 'FD', source_key: 'F', function_de: 'Zahnschutz' },
  ])
})
