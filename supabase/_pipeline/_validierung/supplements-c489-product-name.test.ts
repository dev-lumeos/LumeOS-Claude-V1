import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const container = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const db = process.env.LUMEOS_C489_DATABASE
if (!db || db === 'postgres') throw new Error('C-489 braucht LUMEOS_C489_DATABASE als Wegwerf-Datenbank.')

function one<T>(sql: string): T {
  const output = execFileSync('docker', [
    'exec', container, 'psql', '-X', '-q', '-v', 'ON_ERROR_STOP=1', '-U', 'postgres', '-d', db,
    '-t', '-A', '-c', sql,
  ], { encoding: 'utf8' }).trim()
  return JSON.parse(output.split(/\r?\n/).at(-1) ?? '') as T
}

test('C-489: DSLD-Produktnamen haben eigene EN/DE/TH-Spalten, Firmen- und Markennamen bleiben', () => {
  const result = one<{
    product_columns: string[]
    product_name_check: boolean
    suppliers_name: boolean
    marke: boolean
    translated_values: number
    old_source_fields: number
    english_source_fields: number
  }>(`
    SELECT json_build_object(
      'product_columns', (
        SELECT coalesce(json_agg(column_name ORDER BY column_name), '[]'::json)
        FROM information_schema.columns
        WHERE table_schema = 'supplements' AND table_name = 'supplier_products'
          AND column_name = ANY (ARRAY['name','name_en','name_de','name_th'])
      ),
      'product_name_check', EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conrelid = 'supplements.supplier_products'::regclass
          AND conname = 'supplier_products_name_en_check'
      ),
      'suppliers_name', EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'supplements' AND table_name = 'suppliers' AND column_name = 'name'
      ),
      'marke', EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'supplements' AND table_name = 'supplier_products' AND column_name = 'marke'
      ),
      'translated_values', (
        SELECT count(*) FROM supplements.supplier_products
        WHERE to_jsonb(supplier_products)->>'name_de' IS NOT NULL
           OR to_jsonb(supplier_products)->>'name_th' IS NOT NULL
      ),
      'old_source_fields', (
        SELECT count(*) FROM supplements.supplement_field_sources
        WHERE source = 'dsld' AND supplier_product_id IS NOT NULL AND field_name = 'name'
      ),
      'english_source_fields', (
        SELECT count(*) FROM supplements.supplement_field_sources
        WHERE source = 'dsld' AND supplier_product_id IS NOT NULL AND field_name = 'name_en'
      )
    );
  `)
  assert.deepEqual(result.product_columns, ['name_de', 'name_en', 'name_th'])
  assert.equal(result.product_name_check, true)
  assert.equal(result.suppliers_name, true)
  assert.equal(result.marke, true)
  assert.equal(result.translated_values, 0)
  assert.equal(result.old_source_fields, 0)
  assert.equal(result.english_source_fields, 214780)
})
