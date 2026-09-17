import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const container = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const db = process.env.LUMEOS_C502_C508_DATABASE
if (!db || db === 'postgres') throw new Error('C-502/C-508 braucht eine Wegwerf-Datenbank.')

function one<T>(sql: string): T {
  const output = execFileSync('docker', [
    'exec', container, 'psql', '-X', '-q', '-v', 'ON_ERROR_STOP=1', '-U', 'postgres', '-d', db,
    '-t', '-A', '-c', sql,
  ], { encoding: 'utf8' }).trim()
  const payload = output.match(/\{[\s\S]*\}/)?.[0]
  if (!payload) throw new Error(`Kein JSON-Ergebnis: ${output}`)
  return JSON.parse(payload) as T
}

test('C-502: kataloggebundene Nahrungallergien treffen auch exakte DSLD-Zutaten', () => {
  const result = one<{
    aliases: boolean
    lactoseProducts: number
    soyProducts: number
    coconutAlias: boolean
  }>(`
    BEGIN;
    INSERT INTO auth.users (id, email, raw_app_meta_data, created_at)
    VALUES ('c5020000-0000-0000-0000-000000000001', 'c502-owner@example.test', '{}'::jsonb, now());
    INSERT INTO public.user_allergies (user_id, stoff_code, stoff_text, art, schwere, quelle) VALUES
      ('c5020000-0000-0000-0000-000000000001', 'nutrition:contains_lactose', 'Lactose', 'nahrung', 'allergie', 'c502-test'),
      ('c5020000-0000-0000-0000-000000000001', 'nutrition:contains_soy', 'Soy', 'nahrung', 'allergie', 'c502-test');
    SET LOCAL ROLE authenticated;
    SELECT set_config('request.jwt.claim.sub', 'c5020000-0000-0000-0000-000000000001', true);
    SELECT json_build_object(
      'aliases', (SELECT count(*) = 3 FROM public.allergen_aliases
        WHERE (stoff_code, alias_text) IN (
          ('nutrition:contains_lactose', 'Lactose'),
          ('nutrition:contains_nuts', 'Almond'),
          ('nutrition:contains_soy', 'Soy Lecithin')
        )),
      'lactoseProducts', (SELECT count(DISTINCT product_id)
        FROM public.user_allergy_catalog_matches('c5020000-0000-0000-0000-000000000001')
        WHERE stoff_code = 'nutrition:contains_lactose' AND catalog_kind = 'supplier_product'),
      'soyProducts', (SELECT count(DISTINCT product_id)
        FROM public.user_allergy_catalog_matches('c5020000-0000-0000-0000-000000000001')
        WHERE stoff_code = 'nutrition:contains_soy' AND catalog_kind = 'supplier_product'),
      'coconutAlias', EXISTS (SELECT 1 FROM public.allergen_aliases
        WHERE stoff_code = 'nutrition:contains_nuts' AND nutrition.search_fold(alias_text) = 'coconut')
    );
    ROLLBACK;
  `)

  assert.equal(result.aliases, true)
  assert.ok(result.lactoseProducts > 0)
  assert.ok(result.soyProducts > 0)
  assert.equal(result.coconutAlias, false)
})

test('C-508: eine Abfrage zaehlt alle eigenen Katalogtreffer', () => {
  const result = one<{
    functionExists: boolean
    rows: number
    foodCounts: number[]
    magnesiumProducts: number
    noAllergies: number
    foreignRows: number
    anonExecute: boolean
  }>(`
    BEGIN;
    INSERT INTO auth.users (id, email, raw_app_meta_data, created_at) VALUES
      ('c5080000-0000-0000-0000-000000000001', 'c508-owner@example.test', '{}'::jsonb, now()),
      ('c5080000-0000-0000-0000-000000000002', 'c508-other@example.test', '{}'::jsonb, now());
    INSERT INTO public.user_allergies (user_id, stoff_code, stoff_text, art, schwere, quelle) VALUES
      ('c5080000-0000-0000-0000-000000000001', 'nutrition:contains_lactose', 'Lactose', 'nahrung', 'allergie', 'c508-test'),
      ('c5080000-0000-0000-0000-000000000001', 'nutrition:contains_soy', 'Soy', 'nahrung', 'allergie', 'c508-test'),
      ('c5080000-0000-0000-0000-000000000001', 'supplements:magnesium_stearate', 'Magnesium Stearate', 'supplement', 'allergie', 'c508-test');
    SET LOCAL ROLE authenticated;
    SELECT set_config('request.jwt.claim.sub', 'c5080000-0000-0000-0000-000000000001', true);
    CREATE TEMP TABLE c508_counts ON COMMIT DROP AS
      SELECT * FROM public.user_allergy_treffer('c5080000-0000-0000-0000-000000000001');
    SELECT set_config('request.jwt.claim.sub', 'c5080000-0000-0000-0000-000000000002', true);
    CREATE TEMP TABLE c508_foreign ON COMMIT DROP AS
      SELECT count(*)::integer AS rows
      FROM public.user_allergy_treffer('c5080000-0000-0000-0000-000000000001');
    RESET ROLE;
    SELECT json_build_object(
      'functionExists', to_regprocedure('public.user_allergy_treffer(uuid)') IS NOT NULL,
      'rows', (SELECT count(*) FROM c508_counts),
      'foodCounts', (SELECT array_agg(treffer_lebensmittel ORDER BY stoff_code) FROM c508_counts),
      'magnesiumProducts', (SELECT treffer_produkte FROM c508_counts WHERE stoff_code = 'supplements:magnesium_stearate'),
      'noAllergies', (SELECT count(*) FROM public.user_allergy_treffer(gen_random_uuid()))
      ,'foreignRows', (SELECT rows FROM c508_foreign)
      ,'anonExecute', has_function_privilege('anon', 'public.user_allergy_treffer(uuid)', 'EXECUTE')
    );
    ROLLBACK;
  `)

  assert.equal(result.functionExists, true)
  assert.equal(result.rows, 3)
  assert.deepEqual(result.foodCounts, [1021, 60, 0])
  assert.ok(result.magnesiumProducts > 0)
  assert.equal(result.noAllergies, 0)
  assert.equal(result.foreignRows, 0)
  assert.equal(result.anonExecute, false)
})
