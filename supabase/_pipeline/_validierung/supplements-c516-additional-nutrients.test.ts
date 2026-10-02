import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const container = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const db = process.env.PGDATABASE
if (!db || db === 'postgres') throw new Error('C-516 braucht PGDATABASE als Wegwerf-Datenbank.')

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
  // A-87: JWT-Setups koennen selbst JSON ausgeben; nur die letzte Zeile ist
  // das durch den Testvertrag erzeugte Ergebnisobjekt.
  const payload = output.split(/\r?\n/).at(-1)
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
        -- A-87/A-90: Der konkrete DSLD-Datensatz ist kein stabiler Anker
        -- ueber Grunddatenstaende; der belegte CHORL-Code ist der Vertrag.
        WHERE nutrients ? 'CHORL'
          AND (nutrients->>'CHORL')::numeric > 0
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
    -- A-87/C-541: Ein Profil ohne Erfahrungsgrad ist kein gueltiger Testnutzer mehr.
    INSERT INTO public.profiles (id, birth_date, biological_sex, experience_level)
    VALUES ('51600000-0000-0000-0000-000000000001', DATE '1990-01-01', 'male', 'beginner')
    ON CONFLICT (id) DO UPDATE SET birth_date = EXCLUDED.birth_date,
      biological_sex = EXCLUDED.biological_sex, experience_level = EXCLUDED.experience_level;
    INSERT INTO nutrition.meals (id, user_id, entry_date, meal_type)
    VALUES ('51600000-0000-0000-0000-000000000010', '51600000-0000-0000-0000-000000000001', DATE '2026-09-18', 'breakfast');
    -- A-87/C-519: Der Produkt-Snapshot liegt am Supplements-Intake, nicht
    -- mehr als kopierter Naehrwert am Meal-Item. Ein aktueller Katalogtreffer
    -- ersetzt zugleich die ueberholte feste DSLD-Produkt-ID.
    CREATE TEMP TABLE c516_product ON COMMIT DROP AS
      SELECT o.product_id, o.serving_size, (o.nutrients->>'CHORL')::numeric AS chorl
      FROM supplements.supplier_product_nutrient_serving_options o
      WHERE o.nutrients ? 'CHORL' AND (o.nutrients->>'CHORL')::numeric > 0
      ORDER BY o.product_id, o.serving_size LIMIT 1;
    GRANT SELECT ON c516_product TO authenticated;
    SET LOCAL ROLE authenticated;
    SELECT set_config('request.jwt.claims', '{"sub":"51600000-0000-0000-0000-000000000001"}', true);
    SELECT supplements.record_supplier_product_intake(
      product_id, DATE '2026-09-18', NULL, 2, serving_size,
      '51600000-0000-0000-0000-000000000010'
    ) FROM c516_product;
    RESET ROLE;
    SELECT json_build_object(
      'expected', (SELECT chorl * 2 FROM c516_product),
      'snapshot', (SELECT (supplier_product_nutrients_snapshot->>'CHORL')::numeric
                   FROM supplements.intake_logs
                   WHERE user_id='51600000-0000-0000-0000-000000000001'
                     AND meal_id='51600000-0000-0000-0000-000000000010')
    );
  `)

  assert.equal(result.snapshot, result.expected)
})
