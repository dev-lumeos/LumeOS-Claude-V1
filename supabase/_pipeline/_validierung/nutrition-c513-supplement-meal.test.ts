import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const container = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const db = process.env.PGDATABASE
if (!db || db === 'postgres') throw new Error('C-513 braucht PGDATABASE als Wegwerf-Datenbank.')

function one<T>(sql: string): T {
  const out = execFileSync('docker', [
    'exec', container, 'psql', '-X', '-q', '-v', 'ON_ERROR_STOP=1', '-U', 'postgres', '-d', db,
    '-t', '-A', '-c', sql,
  ], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }).trim()
  return JSON.parse(out.split(/\r?\n/).at(-1) ?? '') as T
}

test.skip('C-513: durch C-519/E-84 ersetzt; der fruehere Meal-Snapshot verletzt den Modulvertrag', () => {
  const result = one<any>(`BEGIN;
    INSERT INTO auth.users (id, email, raw_app_meta_data, created_at) VALUES
      ('51300000-0000-0000-0000-000000000001', 'c513-owner@example.test', '{}'::jsonb, now()),
      ('51300000-0000-0000-0000-000000000002', 'c513-other@example.test', '{}'::jsonb, now());
    INSERT INTO public.profiles (id, birth_date, biological_sex) VALUES
      ('51300000-0000-0000-0000-000000000001', DATE '1990-01-01', 'male'),
      ('51300000-0000-0000-0000-000000000002', DATE '1990-01-01', 'male')
    ON CONFLICT (id) DO UPDATE SET birth_date=EXCLUDED.birth_date, biological_sex=EXCLUDED.biological_sex;
    INSERT INTO nutrition.meals (id, user_id, entry_date, meal_type, meal_time) VALUES
      ('51300000-0000-0000-0000-000000000010', '51300000-0000-0000-0000-000000000001', DATE '2026-09-17', 'breakfast', TIME '08:00'),
      ('51300000-0000-0000-0000-000000000011', '51300000-0000-0000-0000-000000000002', DATE '2026-09-17', 'breakfast', TIME '08:00');
    INSERT INTO nutrition.meal_items (id, meal_id, user_id, food_source, food_name, amount_g, enercc, prot625, nutrients)
    VALUES ('51300000-0000-0000-0000-000000000012', '51300000-0000-0000-0000-000000000010', '51300000-0000-0000-0000-000000000001', 'manual', 'C513 Nahrung', 100, 100, 5, '{}'::jsonb);
    INSERT INTO supplements.suppliers (id, name, source) VALUES
      ('51300000-0000-0000-0000-000000000020', 'C513 Supplier', 'test:c513');
    INSERT INTO supplements.supplier_products (id, supplier_id, name_en, portionsgroesse, portionseinheit, source) VALUES
      ('51300000-0000-0000-0000-000000000021', '51300000-0000-0000-0000-000000000020', 'C513 Whey', 30, 'Gram(s)', 'test:c513'),
      ('51300000-0000-0000-0000-000000000022', '51300000-0000-0000-0000-000000000020', 'C513 Multiple Servings', 30, 'Gram(s)', 'test:c513'),
      ('51300000-0000-0000-0000-000000000023', '51300000-0000-0000-0000-000000000020', 'C513 No Nutrients', 1, 'Capsule(s)', 'test:c513');
    INSERT INTO supplements.product_contents (product_id, ingredient_name, amount_per_serving, unit, source, source_serving_size) VALUES
      ('51300000-0000-0000-0000-000000000021', 'Calories', 120, 'Calorie(s)', 'dsld', '30 Gram(s)'),
      ('51300000-0000-0000-0000-000000000021', 'Protein', 24, 'Gram(s)', 'dsld', '30 Gram(s)'),
      ('51300000-0000-0000-0000-000000000021', 'Magnesium', 50, 'mg', 'dsld', '30 Gram(s)'),
      ('51300000-0000-0000-0000-000000000022', 'Calories', 120, 'Calorie(s)', 'dsld', '30 Gram(s)'),
      ('51300000-0000-0000-0000-000000000022', 'Protein', 24, 'Gram(s)', 'dsld', '30 Gram(s)'),
      ('51300000-0000-0000-0000-000000000022', 'Calories', 240, 'Calorie(s)', 'dsld', '60 Gram(s)'),
      ('51300000-0000-0000-0000-000000000022', 'Protein', 48, 'Gram(s)', 'dsld', '60 Gram(s)');
    INSERT INTO supplements.user_stacks (id, user_id, name, is_active)
    VALUES ('51300000-0000-0000-0000-000000000030', '51300000-0000-0000-0000-000000000001', 'C513 Stack', false);
    INSERT INTO supplements.stack_items (id, stack_id, supplement_id, dose, dose_unit, frequency, timing)
    SELECT '51300000-0000-0000-0000-000000000031', '51300000-0000-0000-0000-000000000030', id, 25, 'g', 'daily', 'morning'
    FROM supplements.supplements WHERE slug='whey-protein';
    INSERT INTO supplements.intake_logs (id, user_id, stack_item_id, intake_date, intake_time, status, supplement_name_snapshot, dose_snapshot, dose_unit_snapshot, supplier_product_id)
    VALUES ('51300000-0000-0000-0000-000000000032', '51300000-0000-0000-0000-000000000001', '51300000-0000-0000-0000-000000000031', DATE '2026-09-17', TIME '08:30', 'taken', 'C513 Whey Stack', 25, 'g', '51300000-0000-0000-0000-000000000021');
    CREATE TEMP TABLE c513_seen (subject text PRIMARY KEY, payload jsonb) ON COMMIT DROP;
    GRANT SELECT, INSERT ON c513_seen TO authenticated;
    SET LOCAL ROLE authenticated;
    SELECT set_config('request.jwt.claim.sub', '51300000-0000-0000-0000-000000000001', true);
    INSERT INTO c513_seen
    SELECT 'add_single', jsonb_build_object('item_id', nutrition.add_supplement_product_to_meal('51300000-0000-0000-0000-000000000010', '51300000-0000-0000-0000-000000000021', 1, NULL));
    INSERT INTO c513_seen
    SELECT 'add_no_nutrients', jsonb_build_object('item_id', nutrition.add_supplement_product_to_meal('51300000-0000-0000-0000-000000000010', '51300000-0000-0000-0000-000000000023', 1, NULL));
    DO $block$
    BEGIN
      PERFORM nutrition.add_supplement_product_to_meal('51300000-0000-0000-0000-000000000010', '51300000-0000-0000-0000-000000000022', 1, NULL);
      RAISE EXCEPTION 'C513 multi-serving selection was accepted without an explicit serving size';
    EXCEPTION WHEN SQLSTATE 'P0001' THEN
      INSERT INTO c513_seen VALUES ('multi_requires_choice', jsonb_build_object('message', SQLERRM));
    END $block$;
    INSERT INTO c513_seen
    SELECT 'add_multi_selected', jsonb_build_object('item_id', nutrition.add_supplement_product_to_meal('51300000-0000-0000-0000-000000000010', '51300000-0000-0000-0000-000000000022', 1, '60 Gram(s)'));
    INSERT INTO c513_seen
    SELECT 'owner', jsonb_build_object(
      'items', (SELECT jsonb_agg(jsonb_build_object('source', food_source, 'product', supplement_product_id, 'name', food_name, 'energy', enercc, 'protein', prot625, 'magnesium', nutrients->>'MG', 'amountG', amount_g, 'serving', supplement_serving_size, 'quantity', supplement_serving_quantity, 'status', supplement_nutrient_status) ORDER BY supplement_product_id) FROM nutrition.meal_items WHERE meal_id='51300000-0000-0000-0000-000000000010' AND food_source='supplement'),
      'energy', (SELECT jsonb_build_object('food', food_amount, 'mealSupplement', meal_supplement_amount, 'stackSupplement', stack_supplement_amount, 'supplement', supplement_amount, 'missing', meal_supplement_missing_count) FROM nutrition.nutrient_intake_source_breakdown_for_day('51300000-0000-0000-0000-000000000001', DATE '2026-09-17') WHERE nutrient_code='ENERCC'),
      'protein', (SELECT jsonb_build_object('food', food_amount, 'mealSupplement', meal_supplement_amount, 'stackSupplement', stack_supplement_amount, 'supplement', supplement_amount) FROM nutrition.nutrient_intake_source_breakdown_for_day('51300000-0000-0000-0000-000000000001', DATE '2026-09-17') WHERE nutrient_code='PROT625'),
      'overlaps', (SELECT jsonb_agg(jsonb_build_object('product', product_id, 'delta', time_distance_minutes, 'mealItem', meal_item_id, 'log', intake_log_id)) FROM nutrition.supplement_product_meal_stack_overlap_candidates_for_day('51300000-0000-0000-0000-000000000001', DATE '2026-09-17'))
    );
    DO $block$
    BEGIN
      INSERT INTO nutrition.meal_items (meal_id, user_id, food_source, food_name, amount_g, enercc, nutrients, supplement_product_id, supplement_serving_size, supplement_serving_quantity, supplement_nutrient_status)
      VALUES ('51300000-0000-0000-0000-000000000010', '51300000-0000-0000-0000-000000000001', 'supplement', 'forged C513 snapshot', NULL, 999, '{}'::jsonb, '51300000-0000-0000-0000-000000000021', '30 Gram(s)', 1, 'available');
      RAISE EXCEPTION 'C513 forged supplement snapshot was accepted';
    EXCEPTION WHEN SQLSTATE '23514' THEN
      INSERT INTO c513_seen VALUES ('forged_snapshot', jsonb_build_object('blocked', true));
    END $block$;
    SELECT set_config('request.jwt.claim.sub', '51300000-0000-0000-0000-000000000002', true);
    DO $block$
    BEGIN
      PERFORM nutrition.add_supplement_product_to_meal('51300000-0000-0000-0000-000000000010', '51300000-0000-0000-0000-000000000021', 1, NULL);
      RAISE EXCEPTION 'C513 foreign meal was writable';
    EXCEPTION WHEN SQLSTATE 'P0002' THEN
      INSERT INTO c513_seen VALUES ('foreign_write', jsonb_build_object('blocked', true));
    END $block$;
    INSERT INTO c513_seen
    SELECT 'foreign_read', jsonb_build_object('rows', count(*)) FROM nutrition.supplement_product_meal_stack_overlap_candidates_for_day('51300000-0000-0000-0000-000000000001', DATE '2026-09-17');
    RESET ROLE;
    SELECT json_build_object(
      'addSingle', (SELECT payload FROM c513_seen WHERE subject='add_single'),
      'addNoNutrients', (SELECT payload FROM c513_seen WHERE subject='add_no_nutrients'),
      'multiRequiresChoice', (SELECT payload FROM c513_seen WHERE subject='multi_requires_choice'),
      'addMultiSelected', (SELECT payload FROM c513_seen WHERE subject='add_multi_selected'),
      'owner', (SELECT payload FROM c513_seen WHERE subject='owner'),
      'forgedSnapshot', (SELECT payload FROM c513_seen WHERE subject='forged_snapshot'),
      'foreignWrite', (SELECT payload FROM c513_seen WHERE subject='foreign_write'),
      'foreignRead', (SELECT payload FROM c513_seen WHERE subject='foreign_read'),
      'anonAdd', has_function_privilege('anon', 'nutrition.add_supplement_product_to_meal(uuid,uuid,numeric,text)', 'EXECUTE'),
      'anonBreakdown', has_function_privilege('anon', 'nutrition.nutrient_intake_source_breakdown_for_day(uuid,date)', 'EXECUTE'),
      'anonOverlap', has_function_privilege('anon', 'nutrition.supplement_product_meal_stack_overlap_candidates_for_day(uuid,date,integer)', 'EXECUTE')
    );
    ROLLBACK;`)

  assert.match(result.addSingle.item_id, /^[0-9a-f-]{36}$/)
  assert.match(result.addNoNutrients.item_id, /^[0-9a-f-]{36}$/)
  assert.match(result.multiRequiresChoice.message, /multiple serving sizes/i)
  assert.match(result.addMultiSelected.item_id, /^[0-9a-f-]{36}$/)
  assert.deepEqual(result.owner.items.map((item: any) => ({
    energy: item.energy, protein: item.protein, magnesium: item.magnesium,
    amountG: item.amountG, serving: item.serving, quantity: item.quantity, status: item.status,
  })), [
    { energy: 120, protein: 24, magnesium: '50', amountG: null, serving: '30 Gram(s)', quantity: 1, status: 'available' },
    { energy: 240, protein: 48, magnesium: null, amountG: null, serving: '60 Gram(s)', quantity: 1, status: 'available' },
    { energy: null, protein: null, magnesium: null, amountG: null, serving: null, quantity: 1, status: 'no_nutrients_available' },
  ])
  assert.deepEqual(result.owner.energy, { food: 100, mealSupplement: 360, stackSupplement: null, supplement: 360, missing: 1 })
  assert.deepEqual(result.owner.protein, { food: 5, mealSupplement: 72, stackSupplement: 25, supplement: 97 })
  assert.deepEqual(result.owner.overlaps, [{ product: '51300000-0000-0000-0000-000000000021', delta: 30, mealItem: result.addSingle.item_id, log: '51300000-0000-0000-0000-000000000032' }])
  assert.deepEqual(result.forgedSnapshot, { blocked: true })
  assert.deepEqual(result.foreignWrite, { blocked: true })
  assert.deepEqual(result.foreignRead, { rows: 0 })
  assert.equal(result.anonAdd, false)
  assert.equal(result.anonBreakdown, false)
  assert.equal(result.anonOverlap, false)
})
