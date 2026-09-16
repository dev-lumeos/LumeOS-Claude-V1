import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const container = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const db = process.env.LUMEOS_C504_DATABASE
if (!db || db === 'postgres') throw new Error('C-504 braucht LUMEOS_C504_DATABASE als Wegwerf-Datenbank.')

function one<T>(sql: string): T {
  const output = execFileSync('docker', [
    'exec', container, 'psql', '-X', '-q', '-v', 'ON_ERROR_STOP=1', '-U', 'postgres', '-d', db,
    '-t', '-A', '-c', sql,
  ], { encoding: 'utf8' }).trim()
  const payload = output.match(/\{[\s\S]*\}/)?.[0]
  if (!payload) throw new Error(`Kein JSON-Ergebnis: ${output}`)
  return JSON.parse(payload) as T
}

function availability() {
  return one<{ search: boolean; read: boolean; write: boolean }>(`
    SELECT json_build_object(
      'search', to_regprocedure('supplements.search_supplier_products(text,text,text,integer,text,text,boolean,text[],text[],boolean)') IS NOT NULL,
      'read', to_regprocedure('supplements.supplier_product_filter_preferences_read()') IS NOT NULL,
      'write', to_regprocedure('supplements.supplier_product_filter_preferences_write(text,text,text,text[],boolean)') IS NOT NULL
    );
  `)
}

test('C-504: Allergien entfernen Produkte, Meidestoffe markieren und mehrere Marken bleiben Datenbankfilter', () => {
  const available = availability()
  assert.deepEqual(available, { search: true, read: true, write: true })
  if (!available.search) return

  const result = one<{
    baseContainsCandidate: boolean
    allergyContainsCandidate: boolean
    avoidMarksCandidate: boolean
    ratedContainsCandidate: boolean
    multiBrandCount: number
    multiBrandOnly: boolean
    invalidBrandCount: number
  }>(`
    BEGIN;
    CREATE TEMP TABLE c504_candidate ON COMMIT DROP AS
    SELECT p.id, p.name_en, p.marke
    FROM supplements.supplier_products p
    WHERE p.is_active AND p.market_status = 'On Market' AND p.marke IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM supplements.product_contents c
        WHERE c.product_id = p.id
          AND nutrition.search_fold(c.ingredient_name) = 'magnesium stearate'
      )
    ORDER BY p.id
    LIMIT 1;
    CREATE TEMP TABLE c504_brands ON COMMIT DROP AS
    SELECT marke
    FROM supplements.supplier_products
    WHERE is_active AND market_status = 'On Market' AND marke IS NOT NULL
      AND name_en ILIKE '%whey%'
    GROUP BY marke
    ORDER BY count(*) DESC, marke
    LIMIT 2;
    GRANT SELECT ON c504_candidate, c504_brands TO authenticated;
    INSERT INTO auth.users (id, email)
    VALUES ('00000000-0000-0000-0000-000000000504', 'c504@lumeos.local');
    SET LOCAL ROLE authenticated;
    SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000504', true);
    INSERT INTO public.user_allergies (user_id, stoff_code, stoff_text, art, schwere, quelle)
    VALUES ('00000000-0000-0000-0000-000000000504', 'supplements:magnesium_stearate', 'Magnesium Stearate', 'supplement', 'allergie', 'test');
    INSERT INTO nutrition.food_preference_items
      (user_id, preference, strength, target_type, supplement_product_id, source)
    SELECT '00000000-0000-0000-0000-000000000504', 'liked', 'like', 'supplement_product', id, 'test'
    FROM c504_candidate;
    SELECT json_build_object(
      'baseContainsCandidate', EXISTS (
        SELECT 1 FROM supplements.search_supplier_products(
          (SELECT name_en FROM c504_candidate), p_allergien_ausblenden => false, p_limit => 100
        ) s WHERE s.id = (SELECT id FROM c504_candidate)
      ),
      'allergyContainsCandidate', EXISTS (
        SELECT 1 FROM supplements.search_supplier_products(
          (SELECT name_en FROM c504_candidate), p_allergien_ausblenden => true, p_limit => 100
        ) s WHERE s.id = (SELECT id FROM c504_candidate)
      ),
      'avoidMarksCandidate', EXISTS (
        SELECT 1 FROM supplements.search_supplier_products(
          (SELECT name_en FROM c504_candidate), p_allergien_ausblenden => false,
          p_meidestoffe => ARRAY['magnesium_stearate'], p_limit => 100
        ) s WHERE s.id = (SELECT id FROM c504_candidate)
          AND 'magnesium_stearate' = ANY(s.meidestoff_treffer)
      ),
      'ratedContainsCandidate', EXISTS (
        SELECT 1 FROM supplements.search_supplier_products(
          (SELECT name_en FROM c504_candidate), p_allergien_ausblenden => false,
          p_nur_bewertet => true, p_limit => 100
        ) s WHERE s.id = (SELECT id FROM c504_candidate)
      ),
      'multiBrandCount', (SELECT count(*) FROM supplements.search_supplier_products(
        'whey', p_marken => ARRAY(SELECT marke FROM c504_brands), p_allergien_ausblenden => false, p_limit => 100
      )),
      'multiBrandOnly', NOT EXISTS (
        SELECT 1 FROM supplements.search_supplier_products(
          'whey', p_marken => ARRAY(SELECT marke FROM c504_brands), p_allergien_ausblenden => false, p_limit => 100
        ) s WHERE NOT (s.marke = ANY(ARRAY(SELECT marke FROM c504_brands)))
      ),
      'invalidBrandCount', (SELECT count(*) FROM supplements.search_supplier_products(
        'whey', p_marken => ARRAY['c504_erfundene_marke'], p_allergien_ausblenden => false, p_limit => 100
      ))
    );
    ROLLBACK;
  `)

  assert.equal(result.baseContainsCandidate, true)
  assert.equal(result.allergyContainsCandidate, false)
  assert.equal(result.avoidMarksCandidate, true)
  assert.equal(result.ratedContainsCandidate, true)
  assert.ok(result.multiBrandCount > 0)
  assert.equal(result.multiBrandOnly, true)
  assert.equal(result.invalidBrandCount, 0)
})

test('C-504: Filtereinstellungen speichern nur die dauerhaften Filter des angemeldeten Nutzers', () => {
  const available = availability()
  assert.deepEqual(available, { search: true, read: true, write: true })
  if (!available.read || !available.write) return

  const result = one<{ saved: Record<string, unknown>; read: Record<string, unknown>; anonymous: boolean }>(`
    BEGIN;
    INSERT INTO auth.users (id, email)
    VALUES ('00000000-0000-0000-0000-000000000505', 'c504-preferences@lumeos.local');
    SET LOCAL ROLE authenticated;
    SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000505', true);
    CREATE TEMP TABLE c504_preferences(result jsonb) ON COMMIT DROP;
    INSERT INTO c504_preferences
    SELECT supplements.supplier_product_filter_preferences_write(
      'Off Market', 'protein', 'Capsule [E0159]', ARRAY['NOW', 'NOW', 'BulkSupplements.com'], false
    );
    SELECT json_build_object(
      'saved', (SELECT result FROM c504_preferences),
      'read', supplements.supplier_product_filter_preferences_read(),
      'anonymous', has_function_privilege('anon', 'supplements.supplier_product_filter_preferences_read()', 'EXECUTE')
    );
    ROLLBACK;
  `)

  assert.deepEqual(result.saved, {
    marktstatus: 'Off Market', kategorie: 'protein', form: 'Capsule [E0159]',
    marken: ['BulkSupplements.com', 'NOW'], allergien_ausblenden: false,
  })
  assert.deepEqual(result.read, result.saved)
  assert.equal(result.anonymous, false)
  assert.equal('suche' in result.read, false)
})
