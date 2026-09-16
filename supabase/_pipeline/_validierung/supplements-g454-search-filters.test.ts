import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const container = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const db = process.env.LUMEOS_G454_DATABASE
if (!db || db === 'postgres') throw new Error('G-454 braucht LUMEOS_G454_DATABASE als Wegwerf-Datenbank.')

function one<T>(sql: string): T {
  const output = execFileSync('docker', [
    'exec', container, 'psql', '-X', '-q', '-v', 'ON_ERROR_STOP=1', '-U', 'postgres', '-d', db,
    '-t', '-A', '-c', sql,
  ], { encoding: 'utf8' }).trim()
  const payload = output.match(/\{[\s\S]*\}/)?.[0]
  if (!payload) throw new Error(`Kein JSON-Ergebnis: ${output}`)
  return JSON.parse(payload) as T
}

function augmentedSearchExists() {
  return one<{ exists: boolean }>(`
    SELECT json_build_object(
      'exists', to_regprocedure('supplements.search_supplier_products(text,text,text,integer,text,text)') IS NOT NULL
    );
  `).exists
}

test('G-454: Suche akzeptiert Kategorie und Form als Produktfilter', () => {
  const exists = augmentedSearchExists()
  assert.equal(exists, true)
  if (!exists) return

  const result = one<{ count: number; invalidCategory: number; allProtein: boolean; allSameForm: boolean }>(`
    WITH selected_form AS (
      SELECT p.produktform
      FROM supplements.supplier_products p
      WHERE p.market_status = 'On Market'
        AND p.produktform IS NOT NULL
        AND ('whey' <% p.name_en OR 'whey' <% p.marke)
        AND EXISTS (
          SELECT 1 FROM supplements.product_contents c
          WHERE c.product_id = p.id AND c.ingredient_category = 'protein'
        )
      ORDER BY p.produktform, p.id
      LIMIT 1
    ), hits AS (
      SELECT s.*
      FROM selected_form f
      CROSS JOIN LATERAL supplements.search_supplier_products(
        'whey', p_kategorie => 'protein', p_form => f.produktform, p_limit => 100
      ) s
    )
    SELECT json_build_object(
      'count', (SELECT count(*) FROM hits),
      'invalidCategory', (SELECT count(*) FROM supplements.search_supplier_products('whey', p_kategorie => 'g454_erfunden', p_limit => 100)),
      'allProtein', NOT EXISTS (
        SELECT 1 FROM hits h
        WHERE NOT EXISTS (
          SELECT 1 FROM supplements.product_contents c
          WHERE c.product_id = h.id AND c.ingredient_category = 'protein'
        )
      ),
      'allSameForm', NOT EXISTS (
        SELECT 1 FROM hits h CROSS JOIN selected_form f
        WHERE h.id IS NOT NULL AND (SELECT produktform FROM supplements.supplier_products WHERE id = h.id) IS DISTINCT FROM f.produktform
      )
    );
  `)

  assert.ok(result.count > 0)
  assert.equal(result.invalidCategory, 0)
  assert.equal(result.allProtein, true)
  assert.equal(result.allSameForm, true)
})

test('G-454: nur authenticated darf den erweiterten Suchweg ausfuehren', () => {
  const exists = augmentedSearchExists()
  assert.equal(exists, true)
  if (!exists) return

  const result = one<{ anon: boolean; authenticated: boolean }>(`
    SELECT json_build_object(
      'anon', has_function_privilege('anon', 'supplements.search_supplier_products(text,text,text,integer,text,text)', 'EXECUTE'),
      'authenticated', has_function_privilege('authenticated', 'supplements.search_supplier_products(text,text,text,integer,text,text)', 'EXECUTE')
    );
  `)
  assert.deepEqual(result, { anon: false, authenticated: true })
})
