import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const container = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const db = process.env.LUMEOS_C521_DATABASE

if (!db || db === 'postgres') {
  throw new Error('C-521 braucht LUMEOS_C521_DATABASE als Wegwerf-Datenbank.')
}

function one<T>(sql: string): T {
  const out = execFileSync('docker', [
    'exec', container, 'psql', '-X', '-q', '-v', 'ON_ERROR_STOP=1', '-U', 'postgres', '-d', db,
    '-t', '-A', '-c', sql,
  ], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }).trim()
  return JSON.parse(out.split(/\r?\n/).at(-1) ?? '') as T
}

test('C-521: daily_summary summiert drei Meal-Supplement-Snapshots und laesst einen Tag ohne Supplement unveraendert', () => {
  const result = one<any>(`BEGIN;
    INSERT INTO auth.users (id,email,raw_app_meta_data,created_at) VALUES
      ('52100000-0000-0000-0000-000000000001','c521-owner@example.test','{}',now());
    INSERT INTO nutrition.meals (id,user_id,entry_date,meal_type,meal_time) VALUES
      ('52100000-0000-0000-0000-000000000010','52100000-0000-0000-0000-000000000001',DATE '2026-09-18','breakfast',TIME '07:30'),
      ('52100000-0000-0000-0000-000000000011','52100000-0000-0000-0000-000000000001',DATE '2026-09-19','breakfast',TIME '07:30');
    INSERT INTO nutrition.meal_items (meal_id,user_id,food_source,food_name,amount_g,enercc,prot625,nutrients) VALUES
      ('52100000-0000-0000-0000-000000000010','52100000-0000-0000-0000-000000000001','manual','Food with whey',100,2007.53,142.4322,'{}'),
      ('52100000-0000-0000-0000-000000000011','52100000-0000-0000-0000-000000000001','manual','Food only',100,437.5,16.022,'{}');
    INSERT INTO supplements.suppliers (id,name,source) VALUES
      ('52100000-0000-0000-0000-000000000020','C521 supplier','test:c521');
    INSERT INTO supplements.supplier_products (id,supplier_id,name_en,portionsgroesse,portionseinheit,source) VALUES
      ('52100000-0000-0000-0000-000000000021','52100000-0000-0000-0000-000000000020','C521 Whey',30,'Gram(s)','test:c521');
    INSERT INTO supplements.product_contents (product_id,ingredient_name,amount_per_serving,unit,source,source_serving_size) VALUES
      ('52100000-0000-0000-0000-000000000021','Calories',120,'Calorie(s)','dsld','30 Gram(s)'),
      ('52100000-0000-0000-0000-000000000021','Protein',24,'Gram(s)','dsld','30 Gram(s)');
    CREATE TEMP TABLE c521_seen (id uuid PRIMARY KEY) ON COMMIT DROP;
    GRANT SELECT, INSERT ON c521_seen TO authenticated;
    SET LOCAL ROLE authenticated;
    SELECT set_config('request.jwt.claim.sub','52100000-0000-0000-0000-000000000001',true);
    INSERT INTO c521_seen SELECT supplements.record_supplier_product_intake(
      '52100000-0000-0000-0000-000000000021',DATE '2026-09-18',TIME '07:30',1,NULL,
      '52100000-0000-0000-0000-000000000010');
    INSERT INTO c521_seen SELECT supplements.record_supplier_product_intake(
      '52100000-0000-0000-0000-000000000021',DATE '2026-09-18',TIME '12:00',1,NULL,
      '52100000-0000-0000-0000-000000000010');
    INSERT INTO c521_seen SELECT supplements.record_supplier_product_intake(
      '52100000-0000-0000-0000-000000000021',DATE '2026-09-18',TIME '18:00',1,NULL,
      '52100000-0000-0000-0000-000000000010');
    RESET ROLE;
    SELECT json_build_object(
      'withSupplements',(SELECT json_build_object('kcal',enercc,'protein',prot625,'items',item_count,
        'kcalMissing',enercc_missing,'proteinMissing',prot625_missing)
        FROM nutrition.daily_summary WHERE user_id='52100000-0000-0000-0000-000000000001'::uuid AND entry_date=DATE '2026-09-18'),
      'withoutSupplements',(SELECT json_build_object('kcal',enercc,'protein',prot625,'items',item_count,
        'kcalMissing',enercc_missing,'proteinMissing',prot625_missing)
        FROM nutrition.daily_summary WHERE user_id='52100000-0000-0000-0000-000000000001'::uuid AND entry_date=DATE '2026-09-19'),
      'mealSupplementLines',(SELECT count(*) FROM nutrition.meal_items WHERE meal_id='52100000-0000-0000-0000-000000000010'::uuid AND food_source='supplement'),
      'sourceBreakdown',(SELECT jsonb_object_agg(nutrient_code,jsonb_build_object('food',food_amount,'meal',meal_supplement_amount))
        FROM nutrition.nutrient_intake_source_breakdown_for_day('52100000-0000-0000-0000-000000000001',DATE '2026-09-18')
        WHERE nutrient_code IN ('ENERCC','PROT625'))
    );
    ROLLBACK;`)

  assert.deepEqual(result.withSupplements, {
    kcal: 2367.53, protein: 214.4322, items: 4, kcalMissing: 0, proteinMissing: 0,
  })
  assert.deepEqual(result.withoutSupplements, {
    kcal: 437.5, protein: 16.022, items: 1, kcalMissing: 0, proteinMissing: 0,
  })
  assert.equal(result.mealSupplementLines, 3)
  assert.deepEqual(result.sourceBreakdown, {
    ENERCC: { food: 2007.53, meal: 360 },
    PROT625: { food: 142.4322, meal: 72 },
  })
})
