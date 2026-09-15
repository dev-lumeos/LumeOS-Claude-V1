import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const container = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const db = process.env.LUMEOS_C496_DATABASE
if (!db || db === 'postgres') throw new Error('C-496/C-497 braucht LUMEOS_C496_DATABASE als Wegwerf-Datenbank.')

function one<T>(sql: string): T {
  const output = execFileSync('docker', [
    'exec', container, 'psql', '-X', '-q', '-v', 'ON_ERROR_STOP=1', '-U', 'postgres', '-d', db,
    '-t', '-A', '-c', sql,
  ], { encoding: 'utf8' }).trim()
  const payload = output.match(/\{[\s\S]*\}/)?.[0]
  if (!payload) throw new Error(`Kein JSON-Ergebnis: ${output}`)
  return JSON.parse(payload) as T
}

test('C-496: DSLD-Labelwerte werden je Portion in LumeOS-Naehrwerte gerechnet, ohne IU zu raten', () => {
  const result = one<{
    mappingCount: number
    supplierProductNutrientsExists: boolean
    drMercola: { portionsgroesse_g: number | null; enercc: number | null; prot625: number | null; luecken: unknown[] } | null
    vitaminDIu: number
    vitaminEIu: number
    vitaminEIuReportedAsGap: boolean
  }>(`
    SELECT json_build_object(
      'mappingCount', (SELECT count(*) FROM supplements.supplier_product_nutrient_name_mappings),
      'supplierProductNutrientsExists', to_regclass('supplements.supplier_product_nutrients') IS NOT NULL,
      'drMercola', (
        SELECT json_build_object(
          'portionsgroesse_g', n.portionsgroesse_g,
          'enercc', n.enercc,
          'prot625', n.prot625,
          'luecken', n.luecken
        )
        FROM supplements.produkt_naehrwerte n
        WHERE n.product_id = (
          SELECT id FROM supplements.supplier_products
          WHERE marke = 'Dr. Mercola' AND name_en = 'Miracle Whey Protein Powder Original'
            AND EXISTS (
              SELECT 1 FROM supplements.product_contents c
              WHERE c.product_id = supplier_products.id
                AND c.ingredient_name = 'Calories' AND c.amount_per_serving = 160
            )
          ORDER BY id LIMIT 1
        )
      ),
      'vitaminDIu', (
        SELECT count(*) FROM supplements.product_contents c
        JOIN supplements.supplier_product_nutrient_name_mappings m
          ON lower(m.dsld_name) = lower(c.ingredient_name)
        WHERE c.unit = 'IU' AND m.conversion_rule = 'vitamin_d_iu_to_ug'
      ),
      'vitaminEIu', (
        SELECT count(*) FROM supplements.product_contents c
        JOIN supplements.supplier_product_nutrient_name_mappings m
          ON lower(m.dsld_name) = lower(c.ingredient_name)
        WHERE c.unit = 'IU' AND m.target_column = 'vite_mg'
      ),
      'vitaminEIuReportedAsGap', EXISTS (
        SELECT 1
        FROM supplements.produkt_naehrwerte n
        JOIN supplements.product_contents c ON c.product_id = n.product_id
        WHERE c.ingredient_name = 'Vitamin E' AND c.unit = 'IU'
          AND jsonb_path_exists(n.luecken, '$.not_convertible[*] ? (@.reason == "vitamin_e_iu_form_unknown")')
      )
    );
  `)

  assert.ok(result.mappingCount >= 30)
  assert.equal(result.supplierProductNutrientsExists, true)
  assert.ok(result.drMercola)
  assert.equal(Number(result.drMercola.portionsgroesse_g), 40)
  assert.equal(Number(result.drMercola.enercc), 160)
  assert.equal(Number(result.drMercola.prot625), 32)
  assert.equal(Number(result.drMercola.enercc) / Number(result.drMercola.portionsgroesse_g) * 100, 400)
  assert.equal(Number(result.drMercola.prot625) / Number(result.drMercola.portionsgroesse_g) * 100, 80)
  assert.ok(result.vitaminDIu > 0)
  assert.ok(result.vitaminEIu > 0)
  assert.equal(result.vitaminEIuReportedAsGap, true)
})

test('C-497: Produktvorlieben nutzen die vorhandene Nutzerpraeferenz-Bauform, bleiben per RLS getrennt und sortieren liked zuerst', () => {
  const result = one<{
    userOne: { ownItems: number; likedProduct: string; firstSearchProduct: string }
    userTwo: { ownItems: number; seesUserOne: number }
    anonCanWrite: boolean
  }>(`
    BEGIN;
    CREATE TEMP TABLE c497_result (key text PRIMARY KEY, value jsonb NOT NULL) ON COMMIT DROP;
    GRANT SELECT, INSERT ON c497_result TO authenticated;

    SET LOCAL ROLE authenticated;
    SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000496', true);
    INSERT INTO c497_result
    SELECT 'write_liked', supplements.supplier_product_preference_write(
      (SELECT id FROM supplements.supplier_products WHERE name_en ILIKE '%Gold Standard%Whey%' AND market_status = 'On Market' ORDER BY name_en DESC LIMIT 1),
      'liked'
    );
    INSERT INTO c497_result
    SELECT 'write_disliked', supplements.supplier_product_preference_write(
      (SELECT id FROM supplements.supplier_products WHERE name_en ILIKE '%Gold Standard%Whey%' AND market_status = 'On Market' ORDER BY name_en LIMIT 1),
      'disliked'
    );
    INSERT INTO c497_result
    SELECT 'user_one', json_build_object(
      'ownItems', (SELECT count(*) FROM nutrition.food_preference_items WHERE target_type = 'supplement_product'),
      'likedProduct', (
        SELECT supplement_product_id::text FROM nutrition.food_preference_items
        WHERE target_type = 'supplement_product' AND preference = 'liked'
      ),
      'firstSearchProduct', (SELECT id::text FROM supplements.search_supplier_products('gold standard whey') LIMIT 1)
    );

    RESET ROLE;
    SET LOCAL ROLE authenticated;
    SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000497', true);
    INSERT INTO c497_result
    SELECT 'write_two_disliked', supplements.supplier_product_preference_write(
      (SELECT id FROM supplements.supplier_products WHERE name_en ILIKE '%Gold Standard%Whey%' AND market_status = 'On Market' ORDER BY name_en DESC LIMIT 1),
      'disliked'
    );
    INSERT INTO c497_result
    SELECT 'user_two', json_build_object(
      'ownItems', (SELECT count(*) FROM nutrition.food_preference_items WHERE target_type = 'supplement_product'),
      'seesUserOne', (SELECT count(*) FROM nutrition.food_preference_items WHERE user_id = '00000000-0000-0000-0000-000000000496'::uuid)
    );

    RESET ROLE;
    SELECT json_build_object(
      'userOne', (SELECT value FROM c497_result WHERE key = 'user_one'),
      'userTwo', (SELECT value FROM c497_result WHERE key = 'user_two'),
      'anonCanWrite', has_function_privilege('anon', 'supplements.supplier_product_preference_write(uuid,text)', 'EXECUTE')
    );
    ROLLBACK;
  `)

  assert.equal(result.userOne.ownItems, 2)
  assert.equal(result.userOne.firstSearchProduct, result.userOne.likedProduct)
  assert.equal(result.userTwo.ownItems, 1)
  assert.equal(result.userTwo.seesUserOne, 0)
  assert.equal(result.anonCanWrite, false)
})
