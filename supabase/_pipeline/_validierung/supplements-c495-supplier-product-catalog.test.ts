import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const container = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const db = process.env.LUMEOS_C495_DATABASE
if (!db || db === 'postgres') throw new Error('C-495 braucht LUMEOS_C495_DATABASE als Wegwerf-Datenbank.')

function one<T>(sql: string): T {
  const output = execFileSync('docker', [
    'exec', container, 'psql', '-X', '-q', '-v', 'ON_ERROR_STOP=1', '-U', 'postgres', '-d', db,
    '-t', '-A', '-c', sql,
  ], { encoding: 'utf8' }).trim()
  const payload = output.match(/\{[\s\S]*\}/)?.[0]
  if (!payload) throw new Error(`Kein JSON-Ergebnis: ${output}`)
  return JSON.parse(payload) as T
}

test('C-495: drei Fehleingaben finden On-Market Gold Standard Whey, eine Gegenprobe nichts', () => {
  const result = one<{
    searches: Array<Array<{ name_en: string; marke: string | null; market_status: string | null; similarity: number }>>
    noMatch: number
  }>(`
    SELECT json_build_object(
      'searches', json_build_array(
        (SELECT coalesce(json_agg(x), '[]'::json) FROM supplements.search_supplier_products('gold standart wey') x),
        (SELECT coalesce(json_agg(x), '[]'::json) FROM supplements.search_supplier_products('optimum nutriton gold standart') x),
        (SELECT coalesce(json_agg(x), '[]'::json) FROM supplements.search_supplier_products('optimum nutrtion gold standrad whey') x)
      ),
      'noMatch', (SELECT count(*) FROM supplements.search_supplier_products('qzvwxjplk'))
    );
  `)

  for (const rows of result.searches) {
    assert.ok(rows.some(row => /gold standard.*whey/i.test(row.name_en)), JSON.stringify(rows))
    assert.ok(rows.every(row => row.market_status === 'On Market'), JSON.stringify(rows))
    assert.ok(rows.every(row => row.similarity >= 0.3), JSON.stringify(rows))
  }
  assert.equal(result.noMatch, 0)
})

test('C-495: Detail liefert Dr. Mercola Miracle Whey vollstaendig und Markenliste bleibt On Market', () => {
  const result = one<{
    detail: { header: Record<string, unknown>; contents: Array<Record<string, unknown>>; suppliers: Array<Record<string, unknown>> } | null
    brandCount: number
    brandFilterCount: number
  }>(`
    SELECT json_build_object(
      'detail', supplements.supplier_product_detail((
        SELECT id FROM supplements.supplier_products
        WHERE marke = 'Dr. Mercola' AND name_en = 'Miracle Whey Protein Powder Original'
          AND (SELECT count(*) FROM supplements.product_contents c WHERE c.product_id = supplier_products.id) = 18
        ORDER BY id LIMIT 1
      )),
      'brandCount', (SELECT count(*) FROM supplements.supplier_product_brands),
      'brandFilterCount', (SELECT count(*) FROM supplements.search_supplier_products('gold', p_marke => 'Optimum Nutrition'))
    );
  `)

  assert.ok(result.detail)
  assert.equal(result.detail.header.name_en, 'Miracle Whey Protein Powder Original')
  assert.equal(result.detail.header.marke, 'Dr. Mercola')
  assert.equal(Number(result.detail.header.portionsgroesse), 40)
  assert.match(String(result.detail.header.portionseinheit), /g.*2\s*scoop/i)
  assert.equal(result.detail.contents.length, 18)
  assert.ok(result.detail.contents.some(row => row.ingredient_name === 'Calories' && Number(row.amount_per_serving) === 160))
  assert.ok(result.detail.contents.some(row => row.ingredient_name === 'Protein' && Number(row.amount_per_serving) === 32 && row.unit === 'g'))
  assert.ok(result.detail.contents.every(row => 'supplement_name_en' in row && 'blend_id' in row && 'reihenfolge' in row))
  assert.ok(result.detail.suppliers.every(row => 'name' in row && 'land' in row && 'rolle' in row))
  assert.ok(result.brandCount > 0)
  assert.ok(result.brandFilterCount > 0)
})

test('C-495: nur authenticated darf Such-, Detail- und Markenleseweg nutzen', () => {
  const result = one<{
    authenticated: { search: number; detail: number; brands: number }
    anon: { search: boolean; detail: boolean; brands: boolean }
  }>(`
    BEGIN;
    CREATE TEMP TABLE c495_access(role_name text PRIMARY KEY, search_rows integer, detail_rows integer, brand_rows integer) ON COMMIT DROP;
    GRANT SELECT, INSERT ON c495_access TO authenticated;
    SET LOCAL ROLE authenticated;
    SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000495', true);
    INSERT INTO c495_access
    SELECT 'authenticated',
      (SELECT count(*) FROM supplements.search_supplier_products('gold')),
      (SELECT count(*) FROM supplements.supplier_product_detail((
        SELECT id FROM supplements.supplier_products
        WHERE marke = 'Dr. Mercola' AND name_en = 'Miracle Whey Protein Powder Original'
          AND (SELECT count(*) FROM supplements.product_contents c WHERE c.product_id = supplier_products.id) = 18
        ORDER BY id LIMIT 1
      ))),
      (SELECT count(*) FROM supplements.supplier_product_brands);
    RESET ROLE;
    SELECT json_build_object(
      'authenticated', (SELECT json_build_object('search', search_rows, 'detail', detail_rows, 'brands', brand_rows) FROM c495_access),
      'anon', json_build_object(
        'search', has_function_privilege('anon', 'supplements.search_supplier_products(text,text,text,integer,text,text)', 'EXECUTE'),
        'detail', has_function_privilege('anon', 'supplements.supplier_product_detail(uuid)', 'EXECUTE'),
        'brands', has_table_privilege('anon', 'supplements.supplier_product_brands', 'SELECT')
      )
    );
    ROLLBACK;
  `)

  assert.ok(result.authenticated.search > 0)
  assert.equal(result.authenticated.detail, 1)
  assert.ok(result.authenticated.brands > 0)
  assert.deepEqual(result.anon, { search: false, detail: false, brands: false })
})
