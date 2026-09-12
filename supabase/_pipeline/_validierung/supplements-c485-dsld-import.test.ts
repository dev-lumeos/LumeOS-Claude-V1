import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const container = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const db = process.env.LUMEOS_C485_DATABASE
if (!db || db === 'postgres') throw new Error('C-485 braucht LUMEOS_C485_DATABASE als Wegwerf-Datenbank.')

function one<T>(sql: string): T {
  const output = execFileSync('docker', [
    'exec', container, 'psql', '-X', '-q', '-v', 'ON_ERROR_STOP=1', '-U', 'postgres', '-d', db,
    '-t', '-A', '-c', sql,
  ], { encoding: 'utf8' }).trim()
  return JSON.parse(output.split(/\r?\n/).at(-1) ?? '') as T
}

test('C-485: DSLD-Produkte behalten Marke, Rollen, Reihenfolge und feldgenaue Herkunft bei', () => {
  const result = one<{
    columns: string[]
    product_suppliers: boolean
    product_sources: boolean
    normalized_supplier_name: boolean
  }>(`
    SELECT json_build_object(
      'columns', (
        SELECT coalesce(json_agg(column_name ORDER BY column_name), '[]'::json)
        FROM information_schema.columns
        WHERE table_schema = 'supplements' AND table_name = 'supplier_products'
          AND column_name = ANY (ARRAY['marke','dsld_id','product_type','market_status','date_entered','suggested_use'])
      ),
      'product_suppliers', to_regclass('supplements.product_suppliers') IS NOT NULL,
      'product_sources', EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'supplements' AND table_name = 'supplement_field_sources'
          AND column_name = 'supplier_product_id'
      ),
      'normalized_supplier_name', EXISTS (
        SELECT 1
        FROM pg_attribute
        WHERE attrelid = 'supplements.suppliers'::regclass
          AND attname = 'name_normalized'
          AND attgenerated = 's'
      )
    );
  `)
  assert.deepEqual(result.columns, ['date_entered', 'dsld_id', 'marke', 'market_status', 'product_type', 'suggested_use'])
  assert.equal(result.product_suppliers, true)
  assert.equal(result.product_sources, true)
  assert.equal(result.normalized_supplier_name, true)
})

test('C-485: Blend-Kinder bleiben ohne erfundene Einzelmenge und anon bleibt ausgeschlossen', () => {
  const result = one<{
    content_columns: string[]
    role_check: boolean
    auth_select: boolean
    anon_select: boolean
  }>(`
    SELECT json_build_object(
      'content_columns', (
        SELECT coalesce(json_agg(column_name ORDER BY column_name), '[]'::json)
        FROM information_schema.columns
        WHERE table_schema = 'supplements' AND table_name = 'product_contents'
          AND column_name = ANY (ARRAY['blend_id','reihenfolge','ingredient_name'])
      ),
      'role_check', EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conrelid = 'supplements.product_suppliers'::regclass
          AND pg_get_constraintdef(oid) LIKE '%manufacturer%'
          AND pg_get_constraintdef(oid) LIKE '%reseller%'
      ),
      'auth_select', has_table_privilege('authenticated', 'supplements.product_suppliers', 'SELECT'),
      'anon_select', has_table_privilege('anon', 'supplements.product_suppliers', 'SELECT')
    );
  `)
  assert.deepEqual(result.content_columns, ['blend_id', 'ingredient_name', 'reihenfolge'])
  assert.equal(result.role_check, true)
  assert.equal(result.auth_select, true)
  assert.equal(result.anon_select, false)
})

test('C-485: nicht-exakte DSLD-Mengen behalten Operator und Rohtext', () => {
  const columns = one<string[]>(`
    SELECT coalesce(json_agg(column_name ORDER BY column_name), '[]'::json)
    FROM information_schema.columns
    WHERE table_schema = 'supplements' AND table_name = 'product_contents'
      AND column_name = ANY (ARRAY['amount_qualifier','amount_raw']);
  `)
  assert.deepEqual(columns, ['amount_qualifier', 'amount_raw'])
})

test('C-485: DSLD-Mengen werden nicht auf die alte 14,6-Grenze gekuerzt', () => {
  const result = one<{ precision: number | null }>(`
    SELECT json_build_object('precision', numeric_precision)
    FROM information_schema.columns
    WHERE table_schema = 'supplements' AND table_name = 'product_contents' AND column_name = 'amount_per_serving';
  `)
  assert.equal(result.precision, null)
})

test('C-485: einzeichige DSLD-Zutaten bleiben Kandidaten statt verworfen zu werden', () => {
  const definition = one<{ definition: string }>(`
    SELECT json_build_object('definition', pg_get_constraintdef(oid))
    FROM pg_constraint
    WHERE conrelid = 'supplements.product_content_candidates'::regclass
      AND conname = 'product_content_candidates_ingredient_name_check';
  `)
  assert.match(definition.definition, />= 1/)
})
