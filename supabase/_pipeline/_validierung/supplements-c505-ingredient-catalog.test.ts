import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const container = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const db = process.env.PGDATABASE
if (!db || db === 'postgres') throw new Error('C-505 braucht PGDATABASE als Wegwerf-Datenbank.')

function one<T>(sql: string): T {
  const output = execFileSync('docker', [
    'exec', container, 'psql', '-X', '-q', '-v', 'ON_ERROR_STOP=1', '-U', 'postgres', '-d', db,
    '-t', '-A', '-c', sql,
  ], { encoding: 'utf8' }).trim()
  const payload = output.match(/\{[\s\S]*\}/)?.[0]
  if (!payload) throw new Error(`Kein JSON-Ergebnis: ${output}`)
  return JSON.parse(payload) as T
}

test('C-505: Etikettenzeilen werden ohne Raten als Naehrwert, Wirkstoff, Hilfsstoff oder Kandidat gelesen', () => {
  const available = one<{ view: boolean }>(`
    SELECT json_build_object(
      'view', to_regclass('supplements.supplier_product_content_catalog') IS NOT NULL
    );
  `)
  assert.deepEqual(available, { view: true })
  if (!available.view) return

  const result = one<{
    nutrient: boolean
    active: boolean
    excipient: boolean
    candidate: boolean
    activeWithoutCatalogLink: number
  }>(`
    SELECT json_build_object(
      'nutrient', EXISTS (
        SELECT 1 FROM supplements.supplier_product_content_catalog c
        WHERE c.ingredient_name = 'Calories'
          AND c.content_class = 'naehrwert'
          AND c.nutrient_code = 'ENERCC'
      ),
      'active', EXISTS (
        SELECT 1 FROM supplements.supplier_product_content_catalog c
        WHERE c.ingredient_name = 'Taurine'
          AND c.content_class = 'wirkstoff'
          AND c.supplement_id IS NOT NULL
      ),
      'excipient', EXISTS (
        SELECT 1 FROM supplements.supplier_product_content_catalog c
        WHERE c.ingredient_name = 'Magnesium Stearate'
          AND c.content_class = 'hilfsstoff'
          AND c.supplement_id IS NULL
      ),
      'candidate', EXISTS (
        SELECT 1 FROM supplements.supplier_product_content_catalog c
        WHERE c.ingredient_name = 'Proprietary Blend'
          AND c.content_class = 'kandidat'
          AND c.supplement_id IS NULL
      ),
      'activeWithoutCatalogLink', (
        SELECT count(*) FROM supplements.supplier_product_content_catalog c
        WHERE c.ist_wirkstoff AND c.content_class = 'kandidat'
      )
    );
  `)

  assert.equal(result.nutrient, true)
  assert.equal(result.active, true)
  assert.equal(result.excipient, true)
  assert.equal(result.candidate, true)
  assert.ok(result.activeWithoutCatalogLink > 0)
})
