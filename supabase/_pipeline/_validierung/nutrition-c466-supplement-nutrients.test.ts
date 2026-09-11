import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const container = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const db = process.env.LUMEOS_C466_DATABASE
if (!db || db === 'postgres') throw new Error('C-466 braucht eine Wegwerf-Datenbank.')

function one<T>(sql: string): T {
  const out = execFileSync('docker', [
    'exec', container, 'psql', '-X', '-q', '-v', 'ON_ERROR_STOP=1', '-U', 'postgres', '-d', db,
    '-t', '-A', '-c', sql,
  ], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }).trim()
  return JSON.parse(out.split(/\r?\n/).at(-1) ?? '') as T
}

test('C-466: Nahrung und genommene Praeparate bleiben getrennt, mit Herkunft und passender UL-Quelle', () => {
  const r = one<any>(`BEGIN;
    INSERT INTO auth.users (id, email, raw_app_meta_data, created_at) VALUES
      ('46600000-0000-0000-0000-000000000010', 'c466-owner@example.test', '{}'::jsonb, now()),
      ('46600000-0000-0000-0000-000000000011', 'c466-other@example.test', '{}'::jsonb, now());
    INSERT INTO public.profiles (id, birth_date, biological_sex)
    VALUES ('46600000-0000-0000-0000-000000000010', DATE '1990-01-01', 'male')
    ON CONFLICT (id) DO UPDATE SET birth_date = EXCLUDED.birth_date, biological_sex = EXCLUDED.biological_sex;
    INSERT INTO nutrition.meals (id, user_id, entry_date, meal_type)
    VALUES ('46600000-0000-0000-0000-000000000001', '46600000-0000-0000-0000-000000000010', DATE '2026-09-10', 'other');
    INSERT INTO nutrition.meal_items (id, meal_id, user_id, food_source, food_name, amount_g, nutrients)
    VALUES ('46600000-0000-0000-0000-000000000002', '46600000-0000-0000-0000-000000000001', '46600000-0000-0000-0000-000000000010', 'manual', 'C466 Lebensmittel', 100, '{"VITD":10,"MG":50}'::jsonb);
    INSERT INTO supplements.user_stacks (id, user_id, name, is_active)
    VALUES ('46600000-0000-0000-0000-000000000003', '46600000-0000-0000-0000-000000000010', 'C466 Stack', false);
    INSERT INTO supplements.suppliers (id, name, source)
    VALUES ('46600000-0000-0000-0000-000000000004', 'C466 Supplier', 'test:c466');
    INSERT INTO supplements.supplier_products (id, supplier_id, name, produktform, portionsgroesse, portionseinheit, source)
    VALUES ('46600000-0000-0000-0000-000000000005', '46600000-0000-0000-0000-000000000004', 'C466 Vitamin D3 5000 IU', 'capsule', 1, 'capsule', 'test:c466');
    INSERT INTO supplements.product_contents (product_id, supplement_id, amount_per_serving, unit, conversion_factor, source)
    SELECT '46600000-0000-0000-0000-000000000005', id, 5000, 'IU', 1, 'test:c466'
    FROM supplements.supplements WHERE slug = 'vitamin-d3';
    INSERT INTO supplements.stack_items (id, stack_id, supplement_id, dose, dose_unit, frequency, timing)
    SELECT '46600000-0000-0000-0000-000000000006', '46600000-0000-0000-0000-000000000003', id, 5000, 'IU', 'daily', 'morning'
    FROM supplements.supplements WHERE slug = 'vitamin-d3';
    INSERT INTO supplements.stack_items (id, stack_id, supplement_id, dose, dose_unit, frequency, timing)
    SELECT '46600000-0000-0000-0000-000000000007', '46600000-0000-0000-0000-000000000003', id, 400, 'mg', 'daily', 'evening'
    FROM supplements.supplements WHERE slug = 'magnesium';
    INSERT INTO supplements.intake_logs (id, user_id, stack_item_id, intake_date, status, supplement_name_snapshot, dose_snapshot, dose_unit_snapshot, supplier_product_id)
    VALUES
      ('46600000-0000-0000-0000-000000000008', '46600000-0000-0000-0000-000000000010', '46600000-0000-0000-0000-000000000006', DATE '2026-09-10', 'taken', 'Vitamin D3', 5000, 'IU', '46600000-0000-0000-0000-000000000005'),
      ('46600000-0000-0000-0000-000000000009', '46600000-0000-0000-0000-000000000010', '46600000-0000-0000-0000-000000000007', DATE '2026-09-10', 'taken', 'C466 Magnesium', 400, 'mg', NULL);
    CREATE TEMP TABLE c466_seen (subject text primary key, rows integer, payload jsonb) ON COMMIT DROP;
    GRANT SELECT, INSERT ON c466_seen TO authenticated;
    SET LOCAL ROLE authenticated;
    SELECT set_config('request.jwt.claim.sub', '46600000-0000-0000-0000-000000000010', true);
    INSERT INTO c466_seen
    SELECT 'own', count(*), jsonb_build_object(
      'overview', (SELECT jsonb_agg(jsonb_build_object('code', nutrient_code, 'food', food_amount, 'supplement', supplement_amount, 'pct', reference_pct) ORDER BY nutrient_code)
                   FROM nutrition.micronutrient_snapshot_with_supplements('46600000-0000-0000-0000-000000000010', DATE '2026-09-10') WHERE nutrient_code IN ('VITD', 'MG')),
      'detail', (SELECT jsonb_agg(jsonb_build_object('kind', source_kind, 'name', source_name, 'amount', amount, 'product', product_name, 'dose', dose_amount, 'unit', dose_unit, 'scope', upper_limit_scope, 'referenceAmount', upper_limit_amount) ORDER BY source_kind, source_name)
                 FROM nutrition.nutrient_intake_detail_for_day('46600000-0000-0000-0000-000000000010', DATE '2026-09-10', 'VITD')),
      'mg', (SELECT jsonb_build_object('scope', upper_limit_scope, 'amount', upper_limit_amount, 'above', above_upper_limit)
             FROM nutrition.nutrient_upper_limit_assessment_with_supplements('46600000-0000-0000-0000-000000000010', DATE '2026-09-10') WHERE nutrient_code = 'MG'),
      'mgDetail', (SELECT jsonb_agg(jsonb_build_object('kind', source_kind, 'name', source_name, 'product', product_name, 'dose', dose_amount, 'unit', dose_unit) ORDER BY source_name)
                   FROM nutrition.nutrient_intake_detail_for_day('46600000-0000-0000-0000-000000000010', DATE '2026-09-10', 'MG') WHERE source_kind = 'supplement'),
      'nia', (SELECT jsonb_build_object('scope', upper_limit_scope, 'status', upper_limit_status)
              FROM nutrition.nutrient_upper_limit_assessment_with_supplements('46600000-0000-0000-0000-000000000010', DATE '2026-09-10') WHERE nutrient_code = 'NIA')
    ) FROM nutrition.micronutrient_snapshot_with_supplements('46600000-0000-0000-0000-000000000010', DATE '2026-09-10');
    SELECT set_config('request.jwt.claim.sub', '46600000-0000-0000-0000-000000000011', true);
    INSERT INTO c466_seen
    SELECT 'foreign', count(*), NULL FROM nutrition.nutrient_intake_detail_for_day('46600000-0000-0000-0000-000000000010', DATE '2026-09-10', 'VITD');
    RESET ROLE;
    SELECT json_build_object(
      'own', (SELECT payload FROM c466_seen WHERE subject = 'own'),
      'foreignRows', (SELECT rows FROM c466_seen WHERE subject = 'foreign'),
      'anonOverview', has_function_privilege('anon', 'nutrition.micronutrient_snapshot_with_supplements(uuid,date)', 'EXECUTE'),
      'anonDetail', has_function_privilege('anon', 'nutrition.nutrient_intake_detail_for_day(uuid,date,text)', 'EXECUTE'),
      'anonUpper', has_function_privilege('anon', 'nutrition.nutrient_upper_limit_assessment_with_supplements(uuid,date)', 'EXECUTE')
    );
    ROLLBACK;`)

  const values = Object.fromEntries(r.own.overview.map((row: any) => [row.code, row]))
  assert.equal(Number(values.VITD.food), 10)
  assert.equal(Number(values.VITD.supplement), 125) // 5,000 IU × 0.025 µg/IU
  assert.equal(Number(values.MG.food), 50)
  assert.equal(Number(values.MG.supplement), 400)
  assert.deepEqual(r.own.detail, [
    { kind: 'food', name: 'C466 Lebensmittel', amount: 10, product: null, dose: 100, unit: 'g', scope: 'all_recorded_intake_sources', referenceAmount: 135 },
    { kind: 'supplement', name: 'Vitamin D3', amount: 125, product: 'C466 Vitamin D3 5000 IU', dose: 5000, unit: 'IU', scope: 'all_recorded_intake_sources', referenceAmount: 135 },
  ])
  assert.deepEqual(r.own.mg, { scope: 'supplements_only', amount: 400, above: true })
  assert.deepEqual(r.own.mgDetail, [
    { kind: 'supplement', name: 'C466 Magnesium', product: null, dose: 400, unit: 'mg' },
  ])
  assert.deepEqual(r.own.nia, { scope: 'supplements_plus_fortified_foods_unresolved', status: 'unresolved_fortified_food' })
  assert.equal(r.foreignRows, 0)
  assert.equal(r.anonOverview, false)
  assert.equal(r.anonDetail, false)
  assert.equal(r.anonUpper, false)
})
