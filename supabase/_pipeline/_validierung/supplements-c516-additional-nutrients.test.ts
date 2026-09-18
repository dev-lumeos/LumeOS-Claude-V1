import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const container = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const db = process.env.LUMEOS_C516_DATABASE
if (!db || db === 'postgres') throw new Error('C-516 braucht LUMEOS_C516_DATABASE als Wegwerf-Datenbank.')

const mappings = [
  ['Cholesterol', 'CHORL', 'mg'], ['{Cholesterol}', 'CHORL', 'mg'], ['Cholesterols', 'CHORL', 'mg'], ['Total Cholesterol', 'CHORL', 'mg'],
  ['Monounsaturated', 'FAMS', 'g'], ['Monounsaturated {Fat}', 'FAMS', 'g'], ['Monounsaturated Fat', 'FAMS', 'g'], ['Monounsaturated Fats', 'FAMS', 'g'], ['Monounsaturated Fatty Acids', 'FAMS', 'g'],
  ['Polyunsaturated {Fat}', 'FAPU', 'g'], ['Polyunsaturated Fat', 'FAPU', 'g'], ['Polyunsaturated Fatty Acids', 'FAPU', 'g'],
  ['Soluble Fiber', 'FIBSOL', 'g'], ['Insoluble Fiber', 'FIBINS', 'g'],
] as const

function one<T>(sql: string): T {
  const output = execFileSync('docker', [
    'exec', container, 'psql', '-X', '-q', '-v', 'ON_ERROR_STOP=1', '-U', 'postgres', '-d', db,
    '-t', '-A', '-c', sql,
  ], { encoding: 'utf8' }).trim()
  const payload = output.match(/\{[\s\S]*\}/)?.[0]
  if (!payload) throw new Error(`Kein JSON-Ergebnis: ${output}`)
  return JSON.parse(payload) as T
}

function transactionalOne<T>(sql: string): T {
  return one<T>(`BEGIN; ${sql} ROLLBACK;`)
}

test('C-516: nur belegte DSLD-Naehrwertschreibweisen erhalten vorhandene nutrition-Codes', () => {
  const values = mappings.map(([name, code, unit]) =>
    `('${name.replaceAll("'", "''")}', '${code}', '${unit}')`).join(',\n')
  const result = one<{
    mapped: number
    missingDefs: number
    noTransFat: boolean
    noAddedSugars: boolean
    artifactMappings: number
    optionsHaveNutrients: boolean
    hasConvertedGenericValue: boolean
    visibleGenericUnitGaps: number
    anonCanReadOptions: boolean
    authenticatedCanReadOptions: boolean
  }>(`
    WITH expected(dsld_name, nutrient_code, target_unit) AS (VALUES ${values})
    SELECT json_build_object(
      'mapped', (
        SELECT count(*) FROM expected e
        JOIN supplements.supplier_product_nutrient_name_mappings m USING (dsld_name, nutrient_code, target_unit)
        WHERE m.target_column = 'nutrients_json'
          AND m.conversion_rule = 'mass_or_label'
          AND m.source_id = 'dsld_nutrition_facts_exact_label_c516'
          AND m.evidence_class = 'A'
      ),
      'missingDefs', (
        SELECT count(*) FROM expected e
        LEFT JOIN nutrition.nutrient_defs d ON d.code = e.nutrient_code
        WHERE d.code IS NULL
      ),
      'noTransFat', NOT EXISTS (
        SELECT 1 FROM supplements.supplier_product_nutrient_name_mappings
        WHERE nutrition.search_fold(dsld_name) IN ('trans fat', 'trans fats', 'trans fatty acids')
      ),
      'noAddedSugars', NOT EXISTS (
        SELECT 1 FROM supplements.supplier_product_nutrient_name_mappings
        WHERE nutrition.search_fold(dsld_name) IN ('added sugar', 'added sugars', 'total added sugars')
      ),
      'artifactMappings', (
        SELECT count(*) FROM supplements.supplier_product_nutrient_name_mappings
        WHERE nutrition.search_fold(dsld_name) IN (
          'cholesterol support blend', 'cholesterol health(tm)', 'cholesterol d-fense blend',
          'trans fats & saturated fats'
        )
      ),
      'optionsHaveNutrients', EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'supplements'
          AND table_name = 'supplier_product_nutrient_serving_options'
          AND column_name = 'nutrients'
      ),
      'hasConvertedGenericValue', EXISTS (
        SELECT 1 FROM supplements.supplier_product_nutrient_serving_options
        WHERE product_id = 'dc743650-d21f-48a3-88c8-b01c2a6df8e2'
          AND serving_size = '1 Softgel(s)'
          AND nutrients @> '{"CHORL": 30}'::jsonb
      ),
      'visibleGenericUnitGaps', (
        SELECT count(*)
        FROM supplements.product_contents c
        JOIN supplements.supplier_product_nutrient_name_mappings m
          ON lower(m.dsld_name) = lower(c.ingredient_name)
        WHERE m.source_id = 'dsld_nutrition_facts_exact_label_c516'
          AND c.amount_per_serving IS NOT NULL
          AND lower(btrim(c.unit)) NOT IN ('mg', 'g', 'gram(s)', 'grams', 'gm', 'mcg', 'ug', 'micrograms')
      ),
      'anonCanReadOptions', has_table_privilege('anon', 'supplements.supplier_product_nutrient_serving_options', 'SELECT'),
      'authenticatedCanReadOptions', has_table_privilege('authenticated', 'supplements.supplier_product_nutrient_serving_options', 'SELECT')
    );
  `)

  assert.equal(result.mapped, mappings.length)
  assert.equal(result.missingDefs, 0)
  assert.equal(result.noTransFat, true)
  assert.equal(result.noAddedSugars, true)
  assert.equal(result.artifactMappings, 0)
  assert.equal(result.optionsHaveNutrients, true)
  assert.equal(result.hasConvertedGenericValue, true)
  assert.ok(result.visibleGenericUnitGaps > 0)
  assert.equal(result.anonCanReadOptions, false)
  assert.equal(result.authenticatedCanReadOptions, true)
})

test('C-516: ein vorhandener Zusatznaehrstoff bleibt beim Mahlzeiten-Snapshot in seinem nutrition-Code erhalten', () => {
  const result = transactionalOne<{ expected: number, snapshot: number }>(`
    INSERT INTO auth.users (id, email, raw_app_meta_data, created_at)
    VALUES ('51600000-0000-0000-0000-000000000001', 'c516-owner@example.test', '{}'::jsonb, now());
    INSERT INTO public.profiles (id, birth_date, biological_sex)
    VALUES ('51600000-0000-0000-0000-000000000001', DATE '1990-01-01', 'male')
    ON CONFLICT (id) DO UPDATE SET birth_date = EXCLUDED.birth_date, biological_sex = EXCLUDED.biological_sex;
    INSERT INTO nutrition.meals (id, user_id, entry_date, meal_type)
    VALUES ('51600000-0000-0000-0000-000000000010', '51600000-0000-0000-0000-000000000001', DATE '2026-09-18', 'breakfast');
    SET LOCAL ROLE authenticated;
    SELECT set_config('request.jwt.claim.sub', '51600000-0000-0000-0000-000000000001', true);
    SELECT nutrition.add_supplement_product_to_meal(
      '51600000-0000-0000-0000-000000000010',
      'dc743650-d21f-48a3-88c8-b01c2a6df8e2',
      2,
      '1 Softgel(s)'
    );
    SELECT json_build_object(
      'expected', 60::numeric,
      'snapshot', (SELECT (nutrients->>'CHORL')::numeric FROM nutrition.meal_items WHERE meal_id = '51600000-0000-0000-0000-000000000010')
    );
  `)

  assert.equal(result.snapshot, result.expected)
})
