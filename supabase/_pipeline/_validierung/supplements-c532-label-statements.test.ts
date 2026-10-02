import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const container = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const db = process.env.PGDATABASE
if (!db || db === 'postgres') throw new Error('C-532 braucht PGDATABASE als Wegwerf-Datenbank.')

function one<T>(sql: string): T {
  const output = execFileSync('docker', [
    'exec', container, 'psql', '-X', '-q', '-v', 'ON_ERROR_STOP=1', '-U', 'postgres', '-d', db,
    '-t', '-A', '-c', sql,
  ], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }).trim()
  const payload = output.match(/\{[\s\S]*\}/)?.[0]
  if (!payload) throw new Error(`Kein JSON-Ergebnis: ${output}`)
  return JSON.parse(payload) as T
}

test('C-532: Label Statements sind eine eigene roh lesbare Produktrelation', () => {
  const relation = one<{ exists: boolean }>(`
    SELECT json_build_object(
      'exists', to_regclass('supplements.supplier_product_label_statements') IS NOT NULL
    );
  `)
  assert.equal(relation.exists, true)

  const result = one<{
    primaryKey: boolean
    rls: boolean
    authenticated: boolean
    anon: boolean
    types: Record<string, number>
    detail: { label_url: string; statements: Array<{ statement_type: string; statement_text: string }> }
  }>(`
    WITH expected(statement_type, product_count) AS (
      VALUES
        ('Suggested Use', 210388),
        ('Statement of Identity', 207942),
        ('Precautions', 197190),
        ('Other', 176000),
        ('Formulation', 197915),
        ('Product/Version Code', 75533),
        ('Product Specific Information', 159282),
        ('Seals/Symbols', 116779),
        ('Branding Statement(s)', 111195),
        ('Formulation re: Organic', 14884),
        ('Formulation re: Homeopathic', 68)
    ), target AS (
      SELECT id, dsld_id
      FROM supplements.supplier_products
      WHERE dsld_id = 63829
    )
    SELECT json_build_object(
      'primaryKey', EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conrelid = 'supplements.supplier_product_label_statements'::regclass
          AND contype = 'p'
          AND pg_get_constraintdef(oid) LIKE '%product_id, statement_type%'
      ),
      'rls', (SELECT relrowsecurity FROM pg_class WHERE oid = 'supplements.supplier_product_label_statements'::regclass),
      'authenticated', has_table_privilege('authenticated', 'supplements.supplier_product_label_statements', 'SELECT'),
      'anon', has_table_privilege('anon', 'supplements.supplier_product_label_statements', 'SELECT'),
      'types', (
        SELECT coalesce(json_object_agg(e.statement_type, actual.product_count), '{}'::json)
        FROM expected e
        LEFT JOIN LATERAL (
          SELECT count(DISTINCT l.product_id)::integer AS product_count
          FROM supplements.supplier_product_label_statements l
          WHERE l.statement_type = e.statement_type
        ) actual ON true
      ),
      'detail', (
        SELECT json_build_object(
          'label_url', supplements.supplier_product_detail(t.id)->'header'->>'label_url',
          'statements', supplements.supplier_product_detail(t.id)->'label_statements'
        )
        FROM target t
      )
    );
  `)

  assert.equal(result.primaryKey, true)
  assert.equal(result.rls, true)
  assert.equal(result.authenticated, true)
  assert.equal(result.anon, false)
  assert.deepEqual(result.types, {
    'Suggested Use': 210388,
    'Statement of Identity': 207942,
    Precautions: 197190,
    Other: 176000,
    Formulation: 197915,
    'Product/Version Code': 75533,
    'Product Specific Information': 159282,
    'Seals/Symbols': 116779,
    'Branding Statement(s)': 111195,
    'Formulation re: Organic': 14884,
    'Formulation re: Homeopathic': 68,
  })
  assert.equal(result.detail.label_url, 'https://dsld.od.nih.gov/label/63829')
  assert.ok(result.detail.statements.some((row) => row.statement_type === 'Formulation' && row.statement_text.includes('no Soy')))
})

test('C-532: widersprüchliche No-Soy-Claims bleiben roh, die positive Allergiebrücke bleibt wirksam', () => {
  const relation = one<{ exists: boolean }>(`
    SELECT json_build_object(
      'exists', to_regclass('supplements.supplier_product_label_statements') IS NOT NULL
    );
  `)
  if (!relation.exists) return

  const result = one<{
    rawClaims: number
    soyIngredients: number
    allergyAliasMatches: number
  }>(`
    WITH products AS (
      SELECT id FROM supplements.supplier_products WHERE dsld_id IN (63829, 260885)
    )
    SELECT json_build_object(
      'rawClaims', (
        SELECT count(*) FROM supplements.supplier_product_label_statements l
        JOIN products p ON p.id = l.product_id
        WHERE l.statement_type = 'Formulation' AND lower(l.statement_text) LIKE '%no soy%'
      ),
      'soyIngredients', (
        SELECT count(*) FROM supplements.product_contents c
        JOIN products p ON p.id = c.product_id
        WHERE c.ingredient_name = 'Soy Lecithin'
      ),
      'allergyAliasMatches', (
        SELECT count(*)
        FROM supplements.product_contents c
        JOIN products p ON p.id = c.product_id
        JOIN public.allergen_aliases a
          ON nutrition.search_fold(a.alias_text) = nutrition.search_fold(c.ingredient_name)
        WHERE a.stoff_code = 'nutrition:contains_soy'
      )
    );
  `)

  assert.equal(result.rawClaims, 2)
  assert.equal(result.soyIngredients, 2)
  assert.equal(result.allergyAliasMatches, 2)
})
