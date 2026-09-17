import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const container = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const db = process.env.LUMEOS_C512_DATABASE
if (!db || db === 'postgres') throw new Error('C-512 braucht LUMEOS_C512_DATABASE als Wegwerf-Datenbank.')

function one<T>(sql: string): T {
  const output = execFileSync('docker', [
    'exec', container, 'psql', '-X', '-q', '-v', 'ON_ERROR_STOP=1', '-U', 'postgres', '-d', db,
    '-t', '-A', '-c', sql,
  ], { encoding: 'utf8' }).trim()
  const payload = output.match(/\{[\s\S]*\}/)?.[0]
  if (!payload) throw new Error(`Kein JSON-Ergebnis: ${output}`)
  return JSON.parse(payload) as T
}

test('C-512: mehrere DSLD-Portionen werden getrennt geliefert und nicht mehr summiert', () => {
  const result = one<{
    hasServingSize: boolean
    unsafe: { enercc: number | null; fe_mg: number | null; luecken: { multiple_serving_sizes?: string[] } } | null
    options: Array<{ serving_size: string; enercc: number | null; fe_mg: number | null }>
    anonCanReadOptions: boolean
    authenticatedCanReadOptions: boolean
  }>(`
    SELECT json_build_object(
      'hasServingSize', EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'supplements' AND table_name = 'product_contents'
          AND column_name = 'source_serving_size'
      ),
      'unsafe', (
        SELECT json_build_object('enercc', n.enercc, 'fe_mg', n.fe_mg, 'luecken', n.luecken)
        FROM supplements.supplier_product_nutrients n
        JOIN supplements.supplier_products p ON p.id = n.product_id
        WHERE p.dsld_id = 327737
      ),
      'options', (
        SELECT coalesce(json_agg(json_build_object(
          'serving_size', o.serving_size, 'enercc', o.enercc, 'fe_mg', o.fe_mg
        ) ORDER BY o.serving_size), '[]'::json)
        FROM supplements.supplier_product_nutrient_serving_options o
        JOIN supplements.supplier_products p ON p.id = o.product_id
        WHERE p.dsld_id = 327737
      ),
      'anonCanReadOptions', has_table_privilege('anon', 'supplements.supplier_product_nutrient_serving_options', 'SELECT'),
      'authenticatedCanReadOptions', has_table_privilege('authenticated', 'supplements.supplier_product_nutrient_serving_options', 'SELECT')
    );
  `)

  assert.equal(result.hasServingSize, true)
  assert.equal(result.unsafe?.enercc, null)
  assert.equal(result.unsafe?.fe_mg, null)
  assert.deepEqual(result.unsafe?.luecken.multiple_serving_sizes, ['10 mL', '15 mL', '5 mL'])
  assert.deepEqual(result.options, [
    { serving_size: '10 mL', enercc: 15, fe_mg: 12 },
    { serving_size: '15 mL', enercc: 20, fe_mg: 18 },
    { serving_size: '5 mL', enercc: 10, fe_mg: 6 },
  ])
  assert.equal(result.anonCanReadOptions, false)
  assert.equal(result.authenticatedCanReadOptions, true)
})
