import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const container = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const db = process.env.PGDATABASE
if (!db || db === 'postgres') throw new Error('C-510 braucht PGDATABASE als Wegwerf-Datenbank.')

function one<T>(sql: string): T {
  const output = execFileSync('docker', [
    'exec', container, 'psql', '-X', '-q', '-v', 'ON_ERROR_STOP=1', '-U', 'postgres', '-d', db,
    '-t', '-A', '-c', sql,
  ], { encoding: 'utf8' }).trim()
  const payload = output.match(/\{[\s\S]*\}/)?.[0]
  if (!payload) throw new Error(`Kein JSON-Ergebnis: ${output}`)
  return JSON.parse(payload) as T
}

test('C-510: Thiamin ist Naehrstoffschreibvariante und Nährstoffzeilen erhalten nur eindeutige Katalogwurzeln', () => {
  const result = one<{
    mappingCount: number
    thiamin: boolean
    linkedNutrients: number
    requiredRowsLinked: boolean
    rootOnly: boolean
    invented: boolean
  }>(`
    WITH required(name) AS (
      VALUES ('Calcium'), ('Iron'), ('Zinc'), ('Vitamin C'), ('Vitamin B6'), ('Magnesium'),
             ('Thiamin'), ('Thiamine'), ('Vitamin B1')
    ), mapped AS (
      SELECT pc.id, pc.ingredient_name, pc.supplement_id
      FROM supplements.product_contents pc
      JOIN supplements.supplier_product_nutrient_name_mappings nm
        ON lower(nm.dsld_name) = lower(pc.ingredient_name)
    )
    SELECT json_build_object(
      'mappingCount', (SELECT count(*) FROM supplements.supplier_product_nutrient_name_mappings),
      'thiamin', EXISTS (
        SELECT 1 FROM supplements.supplier_product_nutrient_name_mappings
        WHERE dsld_name = 'Thiamin' AND nutrient_code = 'THIA' AND target_column = 'thia_mg'
      ),
      'linkedNutrients', (SELECT count(*) FROM mapped WHERE supplement_id IS NOT NULL),
      'requiredRowsLinked', NOT EXISTS (
        SELECT 1 FROM required r
        JOIN mapped m ON m.ingredient_name = r.name
        WHERE m.supplement_id IS NULL
      ),
      'rootOnly', NOT EXISTS (
        SELECT 1 FROM mapped m
        JOIN supplements.supplements s ON s.id = m.supplement_id
        WHERE NOT s.im_katalog OR s.parent_id IS NOT NULL
      ),
      'invented', EXISTS (
        SELECT 1 FROM supplements.supplier_product_nutrient_name_mappings
        WHERE dsld_name = 'C510 erfundener Nährstoff'
      )
    );
  `)

  // A-87: C-516 ergaenzte 14 weitere eindeutig belegte Schreibweisen.
  assert.equal(result.mappingCount, 54)
  assert.equal(result.thiamin, true)
  assert.ok(result.linkedNutrients > 0)
  assert.equal(result.requiredRowsLinked, true)
  assert.equal(result.rootOnly, true)
  assert.equal(result.invented, false)
})
