import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const container = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const db = process.env.LUMEOS_C529_DATABASE
if (!db || db === 'postgres') throw new Error('C-529 braucht LUMEOS_C529_DATABASE als Wegwerf-Datenbank.')

const owner = '52900000-0000-0000-0000-000000000001'
const stack = '52900000-0000-0000-0000-000000000002'
const legacyItem = '52900000-0000-0000-0000-000000000003'
const noteItem = '52900000-0000-0000-0000-000000000004'
const existingItem = '52900000-0000-0000-0000-000000000005'

function sql<T>(query: string): T {
  const output = execFileSync('docker', [
    'exec', container, 'psql', '-X', '-q', '-v', 'ON_ERROR_STOP=1', '-U', 'postgres', '-d', db,
    '-t', '-A', '-c', query,
  ], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }).trim()
  return JSON.parse(output.split(/\r?\n/).at(-1) ?? '') as T
}

function pipeline(): void {
  const source = readFileSync('supabase/_pipeline/13_supplements/529_stack_item_product_reference.sql', 'utf8')
  execFileSync('docker', [
    'exec', '-i', container, 'psql', '-X', '-q', '-v', 'ON_ERROR_STOP=1', '-U', 'postgres', '-d', db,
  ], { input: source, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
}

test('C-529: Produktreferenz ist optional und ersetzt die eindeutige G-484-Notes-Kruecke', () => {
  const schema = sql<{
    nullable: string | null
    product_only_allowed: boolean
    foreign_key: string | null
    index: boolean
  }>(`
    SELECT json_build_object(
      'nullable', (SELECT is_nullable FROM information_schema.columns
        WHERE table_schema='supplements' AND table_name='stack_items' AND column_name='supplier_product_id'),
      'product_only_allowed', (SELECT pg_get_constraintdef(c.oid) LIKE '%supplier_product_id IS NOT NULL%'
        FROM pg_constraint c WHERE c.conrelid='supplements.stack_items'::regclass AND c.conname='stack_items_check'),
      'foreign_key', (SELECT confrelid::regclass::text FROM pg_constraint
        WHERE conrelid='supplements.stack_items'::regclass AND conname='stack_items_supplier_product_id_fkey'),
      'index', EXISTS(SELECT 1 FROM pg_indexes WHERE schemaname='supplements'
        AND tablename='stack_items' AND indexname='stack_items_supplier_product_idx')
    );
  `)
  assert.deepEqual(schema, {
    nullable: 'YES', product_only_allowed: true,
    foreign_key: 'supplements.supplier_products', index: true,
  })
})

test('C-529: nur der strukturierte Produkt-Id-Marker wird umgezogen und liefert Naehrwerte', () => {
  try {
    const setup = sql<{ product_id: string }>(`
      WITH product AS (
        SELECT spn.product_id
        FROM supplements.supplier_product_nutrients spn
        JOIN supplements.supplier_products sp ON sp.id=spn.product_id
        WHERE spn.nutrients <> '{}'::jsonb
        ORDER BY spn.product_id LIMIT 1
      ), created_user AS (
        INSERT INTO auth.users (id,email,raw_app_meta_data,created_at)
        VALUES ('${owner}','c529-owner@example.test','{}',now())
        ON CONFLICT (id) DO UPDATE SET email=EXCLUDED.email
        RETURNING id
      ), created_stack AS (
        INSERT INTO supplements.user_stacks (id,user_id,name,is_active)
        VALUES ('${stack}','${owner}','C529 Test Stack',false)
        ON CONFLICT (id) DO UPDATE SET user_id=EXCLUDED.user_id
        RETURNING id
      ), legacy AS (
        INSERT INTO supplements.stack_items (id,stack_id,custom_name,dose,dose_unit,frequency,timing,notes)
        SELECT '${legacyItem}','${stack}','C529 legacy product',1,'serving','daily','any','Produkt-Id ' || product_id
        FROM product
        RETURNING id
      ), plain_note AS (
        INSERT INTO supplements.stack_items (id,stack_id,custom_name,dose,dose_unit,frequency,timing,notes)
        VALUES ('${noteItem}','${stack}','C529 plain note',1,'serving','daily','any','Eigene Notiz ohne Produktreferenz')
        ON CONFLICT (id) DO UPDATE SET notes=EXCLUDED.notes, supplier_product_id=NULL
        RETURNING id
      ), existing_item AS (
        INSERT INTO supplements.stack_items (id,stack_id,custom_name,dose,dose_unit,frequency,timing,notes)
        VALUES ('${existingItem}','${stack}','C529 existing item',2,'capsules','daily','morning','Bestehende Notiz')
        ON CONFLICT (id) DO UPDATE SET custom_name=EXCLUDED.custom_name, dose=EXCLUDED.dose,
          dose_unit=EXCLUDED.dose_unit, frequency=EXCLUDED.frequency, timing=EXCLUDED.timing,
          notes=EXCLUDED.notes, supplier_product_id=NULL
        RETURNING id
      )
      SELECT json_build_object('product_id',(SELECT product_id FROM product));
    `)

    pipeline()

    const result = sql<{
      migrated: { product: string; notes: string | null; nutrient_rows: number; nutrients: Record<string, unknown> }
      unchanged_note: { product: string | null; notes: string | null }
      unchanged_existing: { name: string; dose: number; unit: string; timing: string; notes: string | null; product: string | null }
      anon_select: boolean
    }>(`
      SELECT json_build_object(
        'migrated', (SELECT json_build_object(
          'product',si.supplier_product_id,
          'notes',si.notes,
          'nutrient_rows',(SELECT count(*) FROM supplements.supplier_product_nutrients spn WHERE spn.product_id=si.supplier_product_id),
          'nutrients',(SELECT spn.nutrients FROM supplements.supplier_product_nutrients spn WHERE spn.product_id=si.supplier_product_id)
        ) FROM supplements.stack_items si WHERE si.id='${legacyItem}'),
        'unchanged_note', (SELECT json_build_object('product',supplier_product_id,'notes',notes)
          FROM supplements.stack_items WHERE id='${noteItem}'),
        'unchanged_existing', (SELECT json_build_object('name',custom_name,'dose',dose,'unit',dose_unit,
          'timing',timing,'notes',notes,'product',supplier_product_id)
          FROM supplements.stack_items WHERE id='${existingItem}'),
        'anon_select',has_table_privilege('anon','supplements.stack_items','SELECT')
      );
    `)

    assert.equal(result.migrated.product, setup.product_id)
    assert.equal(result.migrated.notes, null)
    assert.ok(result.migrated.nutrient_rows > 0)
    assert.ok(Object.keys(result.migrated.nutrients).length > 0)
    assert.deepEqual(result.unchanged_note, { product: null, notes: 'Eigene Notiz ohne Produktreferenz' })
    assert.deepEqual(result.unchanged_existing, {
      name: 'C529 existing item', dose: 2, unit: 'capsules', timing: 'morning',
      notes: 'Bestehende Notiz', product: null,
    })
    assert.equal(result.anon_select, false)
  } finally {
    execFileSync('docker', [
      'exec', container, 'psql', '-X', '-q', '-v', 'ON_ERROR_STOP=1', '-U', 'postgres', '-d', db,
      '-c', `DELETE FROM supplements.user_stacks WHERE id='${stack}'; DELETE FROM auth.users WHERE id='${owner}';`,
    ], { encoding: 'utf8' })
  }
})
