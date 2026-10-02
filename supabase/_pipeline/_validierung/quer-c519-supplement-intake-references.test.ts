import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const container = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const db = process.env.PGDATABASE
if (!db || db === 'postgres') throw new Error('C-519 braucht PGDATABASE als Wegwerf-Datenbank.')

function one<T>(sql: string): T {
  const out = execFileSync('docker', [
    'exec', container, 'psql', '-X', '-q', '-v', 'ON_ERROR_STOP=1', '-U', 'postgres', '-d', db,
    '-t', '-A', '-c', sql,
  ], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }).trim()
  return JSON.parse(out.split(/\r?\n/).at(-1) ?? '') as T
}

test('C-519/E-84: Produkt-Snapshot bleibt im Supplement-Log; Meal und Rezept halten nur Verweise', () => {
  const result = one<any>(`BEGIN;
    INSERT INTO auth.users (id,email,raw_app_meta_data,created_at) VALUES
      ('51900000-0000-0000-0000-000000000001','c519-owner@example.test','{}',now()),
      ('51900000-0000-0000-0000-000000000002','c519-other@example.test','{}',now());
    INSERT INTO nutrition.meals (id,user_id,entry_date,meal_type,meal_time) VALUES
      ('51900000-0000-0000-0000-000000000010','51900000-0000-0000-0000-000000000001',DATE '2026-09-18','breakfast',TIME '07:30'),
      ('51900000-0000-0000-0000-000000000011','51900000-0000-0000-0000-000000000002',DATE '2026-09-18','breakfast',TIME '07:30');
    INSERT INTO nutrition.meal_items (meal_id,user_id,food_source,food_name,amount_g,enercc,prot625,nutrients)
    VALUES ('51900000-0000-0000-0000-000000000010','51900000-0000-0000-0000-000000000001','manual','C519 breakfast foods',100,437.5,16.022,'{}');
    INSERT INTO supplements.suppliers (id,name,source) VALUES
      ('51900000-0000-0000-0000-000000000020','C519 supplier','test:c519');
    INSERT INTO supplements.supplier_products (id,supplier_id,name_en,portionsgroesse,portionseinheit,source) VALUES
      ('51900000-0000-0000-0000-000000000021','51900000-0000-0000-0000-000000000020','C519 Whey',30,'Gram(s)','test:c519');
    INSERT INTO supplements.product_contents (product_id,ingredient_name,amount_per_serving,unit,source,source_serving_size) VALUES
      ('51900000-0000-0000-0000-000000000021','Calories',120,'Calorie(s)','dsld','30 Gram(s)'),
      ('51900000-0000-0000-0000-000000000021','Protein',24,'Gram(s)','dsld','30 Gram(s)');
    INSERT INTO nutrition.recipes (id,user_id,name_de,servings) VALUES
      ('51900000-0000-0000-0000-000000000030','51900000-0000-0000-0000-000000000001','C519 Shake',1);
    CREATE TEMP TABLE c519_seen (subject text PRIMARY KEY,payload jsonb) ON COMMIT DROP;
    GRANT SELECT, INSERT ON c519_seen TO authenticated;
    SET LOCAL ROLE authenticated;
    SELECT set_config('request.jwt.claim.sub','51900000-0000-0000-0000-000000000001',true);
    INSERT INTO c519_seen
    SELECT 'meal_log',jsonb_build_object('id',supplements.record_supplier_product_intake(
      '51900000-0000-0000-0000-000000000021',DATE '2026-09-18',TIME '07:30',1,NULL,
      '51900000-0000-0000-0000-000000000010'));
    INSERT INTO c519_seen
    SELECT 'recipe_ingredient',jsonb_build_object('id',supplements.add_supplier_product_to_recipe(
      '51900000-0000-0000-0000-000000000030','51900000-0000-0000-0000-000000000021',1,NULL));
    INSERT INTO c519_seen
    SELECT 'direct_log',jsonb_build_object('id',supplements.record_supplier_product_intake(
      '51900000-0000-0000-0000-000000000021',DATE '2026-09-18',NULL,1,NULL,NULL));
    DO $block$
    BEGIN
      PERFORM supplements.record_supplier_product_intake(
        '51900000-0000-0000-0000-000000000021',DATE '2026-09-18',NULL,1,NULL,
        '51900000-0000-0000-0000-000000000011');
      RAISE EXCEPTION 'C519 foreign meal accepted';
    EXCEPTION WHEN SQLSTATE '42501' OR SQLSTATE 'P0002' THEN
      INSERT INTO c519_seen VALUES ('foreign_meal',jsonb_build_object('blocked',true));
    END $block$;
    RESET ROLE;
    SELECT json_build_object(
      'intakeColumns',(SELECT jsonb_object_agg(column_name,is_nullable) FROM information_schema.columns
        WHERE table_schema='supplements' AND table_name='intake_logs' AND column_name IN ('meal_id','stack_item_id')),
      'mealReference',(SELECT jsonb_build_object('reference',mi.supplement_intake_log_id,'productColumn',
        EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema='nutrition' AND table_name='meal_items' AND column_name='supplement_product_id'),
        'kcal',mi.enercc,'protein',mi.prot625,'nutrients',mi.nutrients)
        FROM nutrition.meal_items mi WHERE mi.food_source='supplement' AND mi.meal_id='51900000-0000-0000-0000-000000000010'),
      'logSnapshot',(SELECT jsonb_build_object('meal',il.meal_id,'stack',il.stack_item_id,'product',il.supplier_product_id,
        'serving',il.supplier_product_serving_size,'kcal',il.supplier_product_nutrients_snapshot->>'ENERCC',
        'protein',il.supplier_product_nutrients_snapshot->>'PROT625') FROM supplements.intake_logs il
        WHERE il.id=((SELECT payload->>'id' FROM c519_seen WHERE subject='meal_log')::uuid)),
      'breakdown',(SELECT jsonb_object_agg(nutrient_code,jsonb_build_object('food',food_amount,'meal',meal_supplement_amount,'other',stack_supplement_amount,'supplement',supplement_amount))
        FROM nutrition.nutrient_intake_source_breakdown_for_day('51900000-0000-0000-0000-000000000001',DATE '2026-09-18')
        WHERE nutrient_code IN ('ENERCC','PROT625')),
      'recipe',(SELECT jsonb_build_object('items',ingredient_count,'kcal',enercc,'protein',prot625)
        FROM nutrition.recipe_nutrition('51900000-0000-0000-0000-000000000030',1)),
      'directNotInMeal',(SELECT count(*) FROM nutrition.meal_items WHERE supplement_intake_log_id=((SELECT payload->>'id' FROM c519_seen WHERE subject='direct_log')::uuid)),
      'foreignMeal',(SELECT payload FROM c519_seen WHERE subject='foreign_meal'),
      'anonRecord',has_function_privilege('anon','supplements.record_supplier_product_intake(uuid,date,time,numeric,text,uuid)','EXECUTE'),
      'anonRecipe',has_function_privilege('anon','supplements.add_supplier_product_to_recipe(uuid,uuid,numeric,text)','EXECUTE')
    );
    ROLLBACK;`)

  assert.deepEqual(result.intakeColumns, { meal_id: 'YES', stack_item_id: 'YES' })
  assert.equal(result.mealReference.productColumn, false)
  assert.match(result.mealReference.reference, /^[0-9a-f-]{36}$/)
  assert.equal(result.mealReference.kcal, null)
  assert.equal(result.mealReference.protein, null)
  assert.deepEqual(result.mealReference.nutrients, {})
  assert.deepEqual(result.logSnapshot, {
    meal: '51900000-0000-0000-0000-000000000010', stack: null,
    product: '51900000-0000-0000-0000-000000000021', serving: '30 Gram(s)', kcal: '120', protein: '24',
  })
  assert.deepEqual(result.breakdown, {
    ENERCC: { food: 437.5, meal: 120, other: 120, supplement: 240 },
    PROT625: { food: 16.022, meal: 24, other: 24, supplement: 48 },
  })
  assert.equal(result.breakdown.ENERCC.food + result.breakdown.ENERCC.meal, 557.5)
  assert.equal(result.breakdown.PROT625.food + result.breakdown.PROT625.meal, 40.022)
  assert.deepEqual(result.recipe, { items: 1, kcal: 120, protein: 24 })
  assert.equal(result.directNotInMeal, 0)
  assert.deepEqual(result.foreignMeal, { blocked: true })
  assert.equal(result.anonRecord, false)
  assert.equal(result.anonRecipe, false)
})
