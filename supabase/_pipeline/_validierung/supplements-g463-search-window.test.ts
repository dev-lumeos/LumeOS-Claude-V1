import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const container = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const db = process.env.LUMEOS_G463_DATABASE
if (!db || db === 'postgres') throw new Error('G-463 braucht eine Wegwerf-Datenbank.')

function one<T>(sql: string): T {
  const output = execFileSync('docker', [
    'exec', container, 'psql', '-X', '-q', '-v', 'ON_ERROR_STOP=1', '-U', 'postgres', '-d', db,
    '-t', '-A', '-c', sql,
  ], { encoding: 'utf8' }).trim()
  const payload = output.match(/\{[\s\S]*\}/)?.[0]
  if (!payload) throw new Error(`Kein JSON-Ergebnis: ${output}`)
  return JSON.parse(payload) as T
}

test('G-463: Suche liefert bis 500 Treffer und die Datenbank meldet die Gesamt- und Kategorienzahl', () => {
  const result = one<{
    shown: number
    total: number
    protein: number
    exactHundredShown: number
    exactHundredTotal: number
    capped1500: number
    anonCanExecuteMeta: boolean
  }>(`
    WITH rows AS (
      SELECT * FROM supplements.search_supplier_products(
        'whey', 'On Market', NULL, 500, 'protein', NULL, false, NULL, NULL, false
      )
    ), meta AS (
      SELECT * FROM supplements.supplier_product_search_meta(
        'whey', 'On Market', NULL, 'protein', NULL, false, NULL, NULL, false
      )
    ), exact_rows AS (
      SELECT * FROM supplements.search_supplier_products(
        'whey', 'On Market', NULL, 100, 'protein', NULL, false, NULL, NULL, false
      )
    ), capped_rows AS (
      SELECT * FROM supplements.search_supplier_products(
        'whey', 'On Market', NULL, 1500, 'protein', NULL, false, NULL, NULL, false
      )
    )
    SELECT json_build_object(
      'shown', (SELECT count(*) FROM rows),
      'total', (SELECT total_count FROM meta),
      'protein', (SELECT coalesce((category_counts ->> 'protein')::bigint, 0) FROM meta),
      'exactHundredShown', (SELECT count(*) FROM exact_rows),
      'exactHundredTotal', (SELECT total_count FROM meta),
      'capped1500', (SELECT count(*) FROM capped_rows),
      'anonCanExecuteMeta', has_function_privilege(
        'anon',
        'supplements.supplier_product_search_meta(text,text,text,text,text,boolean,text[],text[],boolean)',
        'EXECUTE'
      )
    );
  `)

  assert.equal(result.shown, 500)
  assert.ok(result.total >= result.shown)
  assert.equal(result.protein, result.total)
  assert.equal(result.exactHundredShown, 100)
  assert.ok(result.exactHundredTotal >= 100)
  assert.equal(result.capped1500, 500)
  assert.equal(result.anonCanExecuteMeta, false)
})
