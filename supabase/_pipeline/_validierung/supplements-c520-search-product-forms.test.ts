import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const container = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const db = process.env.PGDATABASE
if (!db || db === 'postgres') throw new Error('C-520 braucht PGDATABASE als Wegwerf-Datenbank.')

function one<T>(sql: string): T {
  const output = execFileSync('docker', [
    'exec', container, 'psql', '-X', '-q', '-v', 'ON_ERROR_STOP=1', '-U', 'postgres', '-d', db,
    '-t', '-A', '-c', sql,
  ], { encoding: 'utf8' }).trim()
  const payload = output.match(/\{[\s\S]*\}/)?.[0]
  if (!payload) throw new Error(`Kein JSON-Ergebnis: ${output}`)
  return JSON.parse(payload) as T
}

function multiFormSearchExists() {
  return one<{ exists: boolean }>(`
    SELECT json_build_object(
      'exists', to_regprocedure('supplements.search_supplier_products(text,text,text,integer,text,text,boolean,text[],text[],boolean,text[])') IS NOT NULL
    );
  `).exists
}

test('C-520: die neue Suche liefert Produktform und akzeptiert mehrere normalisierte Formen', () => {
  const exists = multiFormSearchExists()
  assert.equal(exists, true)
  if (!exists) return

  const result = one<{
    exists: boolean
    legacyHasProductForm: boolean
    hasProductForm: boolean
    selectedPowderReturned: boolean
    powderCount: number
    allPowderNormalized: boolean
    multiFormCount: number
    multiHasPowder: boolean
    multiHasCapsule: boolean
    allMultiFormNormalized: boolean
    inventedCount: number
  }>(`
    WITH powder AS (
      SELECT p.id, p.name_en
      FROM supplements.supplier_products p
      WHERE p.is_active
        AND p.market_status = 'On Market'
        AND p.produktform LIKE 'Powder [%]'
      ORDER BY p.id
      LIMIT 1
    ), powder_hits AS (
      SELECT s.*
      FROM powder p
      CROSS JOIN LATERAL supplements.search_supplier_products(
        p_query => p.name_en,
        p_market_status => 'On Market',
        p_marke => NULL,
        p_limit => 500,
        p_kategorie => NULL,
        p_form => NULL,
        p_allergien_ausblenden => false,
        p_meidestoffe => NULL,
        p_marken => NULL,
        p_nur_bewertet => false,
        p_formen => ARRAY['Powder']::text[]
      ) s
    ), legacy_hits AS (
      SELECT s.*
      FROM powder p
      CROSS JOIN LATERAL supplements.search_supplier_products(
        p.name_en, 'On Market', NULL, 500, NULL, 'Powder', false, NULL, NULL, false
      ) s
    ), multi_hits AS (
      SELECT *
      FROM supplements.search_supplier_products(
        p_query => 'NOW',
        p_market_status => 'On Market',
        p_marke => NULL,
        p_limit => 500,
        p_kategorie => NULL,
        p_form => NULL,
        p_allergien_ausblenden => false,
        p_meidestoffe => NULL,
        p_marken => NULL,
        p_nur_bewertet => false,
        p_formen => ARRAY['Powder', 'Capsule']::text[]
      )
    )
    SELECT json_build_object(
      'hasProductForm', EXISTS (SELECT 1 FROM powder_hits WHERE produktform IS NOT NULL),
      'legacyHasProductForm', EXISTS (SELECT 1 FROM legacy_hits WHERE produktform IS NOT NULL),
      'selectedPowderReturned', EXISTS (
        SELECT 1 FROM powder p JOIN powder_hits h ON h.id = p.id
      ),
      'powderCount', (SELECT count(*) FROM powder_hits),
      'allPowderNormalized', NOT EXISTS (
        SELECT 1 FROM powder_hits
        WHERE regexp_replace(produktform, '\\s*\\[[^]]+\\]\\s*$', '') <> 'Powder'
      ),
      'multiFormCount', (SELECT count(*) FROM multi_hits),
      'multiHasPowder', EXISTS (
        SELECT 1 FROM multi_hits
        WHERE regexp_replace(produktform, '\\s*\\[[^]]+\\]\\s*$', '') = 'Powder'
      ),
      'multiHasCapsule', EXISTS (
        SELECT 1 FROM multi_hits
        WHERE regexp_replace(produktform, '\\s*\\[[^]]+\\]\\s*$', '') = 'Capsule'
      ),
      'allMultiFormNormalized', NOT EXISTS (
        SELECT 1 FROM multi_hits
        WHERE regexp_replace(produktform, '\\s*\\[[^]]+\\]\\s*$', '') NOT IN ('Powder', 'Capsule')
      ),
      'inventedCount', (
        SELECT count(*)
        FROM powder p
        CROSS JOIN LATERAL supplements.search_supplier_products(
          p_query => p.name_en,
          p_market_status => 'On Market',
          p_marke => NULL,
          p_limit => 500,
          p_kategorie => NULL,
          p_form => NULL,
          p_allergien_ausblenden => false,
          p_meidestoffe => NULL,
          p_marken => NULL,
          p_nur_bewertet => false,
          p_formen => ARRAY['c520_erfundene_form']::text[]
        ) s
      )
    );
  `)

  assert.equal(result.hasProductForm, true)
  assert.equal(result.legacyHasProductForm, true)
  assert.equal(result.selectedPowderReturned, true)
  assert.ok(result.powderCount > 0)
  assert.equal(result.allPowderNormalized, true)
  assert.ok(result.multiFormCount >= result.powderCount)
  assert.equal(result.multiHasPowder, true)
  assert.equal(result.multiHasCapsule, true)
  assert.equal(result.allMultiFormNormalized, true)
  assert.equal(result.inventedCount, 0)
})

test('C-520: nur authenticated darf den neuen Mehrfach-Form-Suchweg ausfuehren', () => {
  const exists = multiFormSearchExists()
  assert.equal(exists, true)
  if (!exists) return

  const result = one<{ anon: boolean; authenticated: boolean }>(`
    SELECT json_build_object(
      'anon', has_function_privilege('anon', 'supplements.search_supplier_products(text,text,text,integer,text,text,boolean,text[],text[],boolean,text[])', 'EXECUTE'),
      'authenticated', has_function_privilege('authenticated', 'supplements.search_supplier_products(text,text,text,integer,text,text,boolean,text[],text[],boolean,text[])', 'EXECUTE')
    );
  `)
  assert.deepEqual(result, { anon: false, authenticated: true })
})
