import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const container = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const db = process.env.LUMEOS_C506_DATABASE
if (!db || db === 'postgres') throw new Error('C-506 braucht LUMEOS_C506_DATABASE als Wegwerf-Datenbank.')

function one<T>(sql: string): T {
  const output = execFileSync('docker', [
    'exec', container, 'psql', '-X', '-q', '-v', 'ON_ERROR_STOP=1', '-U', 'postgres', '-d', db,
    '-t', '-A', '-c', sql,
  ], { encoding: 'utf8' }).trim()
  const payload = output.match(/\{[\s\S]*\}/)?.[0]
  if (!payload) throw new Error(`Kein JSON-Ergebnis: ${output}`)
  return JSON.parse(payload) as T
}

test('C-506: Medikamentenallergien schlagen nur vorhandene Wirkstoffe mit Formulierungszahl vor', () => {
  const result = one<{
    penicillin: number
    ibuprofen: number
    aspirin: number
    unknown: number
    hasFormulationCount: boolean
    validCode: boolean
    invalidCode: boolean
  }>(`
    WITH penicillin AS (SELECT * FROM public.allergy_catalog_suggestions('medikament', 'penicillin', 20)),
    ibuprofen AS (SELECT * FROM public.allergy_catalog_suggestions('medikament', 'ibuprofen', 20)),
    aspirin AS (SELECT * FROM public.allergy_catalog_suggestions('medikament', 'aspirin', 20))
    SELECT json_build_object(
      'penicillin', (SELECT count(*) FROM penicillin WHERE catalog_code LIKE 'medical:%'),
      'ibuprofen', (SELECT count(*) FROM ibuprofen WHERE catalog_code LIKE 'medical:%'),
      'aspirin', (SELECT count(*) FROM aspirin WHERE catalog_code LIKE 'medical:%'),
      'unknown', (SELECT count(*) FROM public.allergy_catalog_suggestions('medikament', 'qzvwxjplk', 20)),
      'hasFormulationCount', EXISTS (SELECT 1 FROM ibuprofen WHERE occurrence_count > 0),
      'validCode', public.allergy_catalog_code_is_valid(
        'medikament', (SELECT catalog_code FROM ibuprofen WHERE catalog_code LIKE 'medical:%' LIMIT 1)
      ),
      'invalidCode', public.allergy_catalog_code_is_valid('medikament', 'medical:nicht_im_katalog')
    );
  `)

  assert.ok(result.penicillin > 0)
  assert.ok(result.ibuprofen > 0)
  assert.ok(result.aspirin > 0)
  assert.equal(result.unknown, 0)
  assert.equal(result.hasFormulationCount, true)
  assert.equal(result.validCode, true)
  assert.equal(result.invalidCode, false)
})

