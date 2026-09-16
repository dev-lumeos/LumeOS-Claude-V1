import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const container = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const db = process.env.LUMEOS_C503_DATABASE
if (!db || db === 'postgres') throw new Error('C-503 braucht LUMEOS_C503_DATABASE als Wegwerf-Datenbank.')

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
  return one<{ suggestions: boolean; validator: boolean; matcher: boolean }>(`
    SELECT json_build_object(
      'suggestions', to_regprocedure('public.allergy_catalog_suggestions(text,text,integer)') IS NOT NULL,
      'validator', to_regprocedure('public.allergy_catalog_code_is_valid(text,text)') IS NOT NULL,
      'matcher', to_regprocedure('public.user_allergy_catalog_matches(uuid)') IS NOT NULL
    );
  `)
}

test('C-503: Vorschlagsfunktion liefert getaggte Nahrungskatalogeintraege auch fuer Schreibvarianten', () => {
  const available = availability()
  assert.equal(available.suggestions, true)
  if (!available.suggestions) return

  const result = one<{ lactose: number; milkSugar: number; nuts: number; untagged: number }>(`
    SELECT json_build_object(
      'lactose', (SELECT count(*) FROM public.allergy_catalog_suggestions('nahrung', 'laktose', 10) WHERE catalog_code = 'nutrition:contains_lactose'),
      'milkSugar', (SELECT count(*) FROM public.allergy_catalog_suggestions('nahrung', 'milchzucker', 10) WHERE catalog_code = 'nutrition:contains_lactose'),
      'nuts', (SELECT count(*) FROM public.allergy_catalog_suggestions('nahrung', 'nuesse', 10) WHERE catalog_code = 'nutrition:contains_nuts'),
      'untagged', (SELECT count(*) FROM public.allergy_catalog_suggestions('nahrung', 'thai', 10) WHERE catalog_code = 'nutrition:thai_food')
    );
  `)
  assert.deepEqual(result, { lactose: 1, milkSugar: 1, nuts: 1, untagged: 0 })
})

test('C-503: ein ausschlussrelevanter Tag ohne food_tags wird nicht vorgeschlagen', () => {
  const result = one<{ untagged: number }>(`
    BEGIN;
    INSERT INTO nutrition.tag_definitions
      (code, name_de, name_en, tag_type, is_exclusion_relevant, sort_order, filter_group)
    VALUES
      ('c503_untagged_allergen', 'C503 Ungelabeltes Allergen', 'C503 untagged allergen', 'allergen', true, 999, 'allergen');
    SELECT json_build_object(
      'untagged', (
        SELECT count(*)
        FROM public.allergy_catalog_suggestions('nahrung', 'c503 ungelabeltes allergen', 10)
        WHERE catalog_code = 'nutrition:c503_untagged_allergen'
      )
    );
    ROLLBACK;
  `)
  assert.deepEqual(result, { untagged: 0 })
})

test('C-503: kanonische Codes validieren Katalogbezug und melden die Medikamentenluecke', () => {
  const available = availability()
  assert.equal(available.validator, true)
  if (!available.validator || !available.suggestions) return

  const result = one<{ lactoseCode: boolean; madeUpCode: boolean; medicationNotice: number }>(`
    SELECT json_build_object(
      'lactoseCode', public.allergy_catalog_code_is_valid('nahrung', 'nutrition:contains_lactose'),
      'madeUpCode', public.allergy_catalog_code_is_valid('nahrung', 'nutrition:does_not_exist'),
      'medicationNotice', (SELECT count(*) FROM public.allergy_catalog_suggestions('medikament', 'penicillin', 10) WHERE catalog_code IS NULL AND product_check_available = false)
    );
  `)
  assert.deepEqual(result, { lactoseCode: true, madeUpCode: false, medicationNotice: 1 })
})

test('C-503: die drei kanonisch angebundenen Allergien liefern Katalogtreffer', () => {
  const available = availability()
  assert.equal(available.matcher, true)
  if (!available.matcher) return

  const result = one<{ lactose: number; magnesiumStearate: number; soy: number }>(`
    BEGIN;
    INSERT INTO auth.users (id, email) VALUES ('00000000-0000-0000-0000-000000000503', 'c503@lumeos.local');
    INSERT INTO public.user_allergies (user_id, stoff_code, stoff_text, art, schwere, quelle) VALUES
      ('00000000-0000-0000-0000-000000000503', 'nutrition:contains_lactose', 'Laktose', 'nahrung', 'allergie', 'test'),
      ('00000000-0000-0000-0000-000000000503', 'nutrition:contains_soy', 'Soja', 'nahrung', 'allergie', 'test'),
      ('00000000-0000-0000-0000-000000000503', 'supplements:magnesium_stearate', 'Magnesium Stearate', 'supplement', 'allergie', 'test');
    SELECT json_build_object(
      'lactose', (SELECT count(*) FROM public.user_allergy_catalog_matches('00000000-0000-0000-0000-000000000503') WHERE stoff_code = 'nutrition:contains_lactose'),
      'magnesiumStearate', (SELECT count(*) FROM public.user_allergy_catalog_matches('00000000-0000-0000-0000-000000000503') WHERE stoff_code = 'supplements:magnesium_stearate'),
      'soy', (SELECT count(*) FROM public.user_allergy_catalog_matches('00000000-0000-0000-0000-000000000503') WHERE stoff_code = 'nutrition:contains_soy')
    );
    ROLLBACK;
  `)
  assert.ok(result.lactose > 0)
  assert.ok(result.magnesiumStearate > 0)
  assert.ok(result.soy > 0)
})
