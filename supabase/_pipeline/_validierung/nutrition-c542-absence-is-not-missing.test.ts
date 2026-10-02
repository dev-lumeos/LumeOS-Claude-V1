import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const container = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const db = process.env.PGDATABASE
if (!db || db === 'postgres') throw new Error('C-542 braucht eine Wegwerf-Datenbank.')

function one<T>(sql: string): T {
  const out = execFileSync('docker', [
    'exec', container, 'psql', '-X', '-q', '-v', 'ON_ERROR_STOP=1', '-U', 'postgres', '-d', db,
    '-t', '-A', '-c', sql,
  ], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }).trim()
  return JSON.parse(out.split(/\r?\n/).at(-1) ?? '') as T
}

test('C-542: absent nutrients are zero, named nutrients without an amount remain missing', () => {
  const result = one<{
    protein: { amount: number; missing: number }
    vitaminK: { amount: null; missing: number }
    namedWithoutAmount: string[]
  }>(`BEGIN;
    INSERT INTO auth.users (id, email, raw_app_meta_data, created_at) VALUES
      ('54200000-0000-0000-0000-000000000001', 'c542-owner@example.test', '{}'::jsonb, now());
    -- A-87/C-541: Ein Profil ohne Erfahrungsgrad ist kein gueltiger Testnutzer mehr.
    INSERT INTO public.profiles (id, birth_date, biological_sex, experience_level)
    VALUES ('54200000-0000-0000-0000-000000000001', DATE '1990-01-01', 'male', 'beginner')
    ON CONFLICT (id) DO UPDATE SET birth_date=EXCLUDED.birth_date,
      biological_sex=EXCLUDED.biological_sex, experience_level=EXCLUDED.experience_level;
    INSERT INTO nutrition.meals (id, user_id, entry_date, meal_type)
    VALUES ('54200000-0000-0000-0000-000000000005', '54200000-0000-0000-0000-000000000001', DATE '2026-09-22', 'other');
    INSERT INTO supplements.suppliers (id, name, source)
    VALUES ('54200000-0000-0000-0000-000000000002', 'C542 Supplier', 'test:c542');
    INSERT INTO supplements.supplier_products (id, supplier_id, name_en, portionsgroesse, portionseinheit, source)
    VALUES
      ('54200000-0000-0000-0000-000000000003', '54200000-0000-0000-0000-000000000002', 'C542 Whey', 30, 'Gram(s)', 'test:c542'),
      ('54200000-0000-0000-0000-000000000004', '54200000-0000-0000-0000-000000000002', 'C542 Declared Without Amount', 30, 'Gram(s)', 'test:c542');
    INSERT INTO supplements.product_contents
      (product_id, ingredient_name, amount_per_serving, unit, amount_qualifier, source, source_serving_size)
    VALUES
      ('54200000-0000-0000-0000-000000000003', 'Protein', 24, 'Gram(s)', 'exact', 'test:c542', '30 Gram(s)'),
      ('54200000-0000-0000-0000-000000000004', 'Protein', 24, 'Gram(s)', 'exact', 'test:c542', '30 Gram(s)'),
      ('54200000-0000-0000-0000-000000000004', 'Vitamin K', NULL, 'Microgram(s)', 'not_stated', 'test:c542', '30 Gram(s)');
    SET LOCAL ROLE authenticated;
    SELECT set_config('request.jwt.claim.sub', '54200000-0000-0000-0000-000000000001', true);
    SELECT supplements.record_supplier_product_intake('54200000-0000-0000-0000-000000000003', DATE '2026-09-22', NULL, 1, NULL, '54200000-0000-0000-0000-000000000005');
    SELECT supplements.record_supplier_product_intake('54200000-0000-0000-0000-000000000004', DATE '2026-09-22', NULL, 1, NULL, '54200000-0000-0000-0000-000000000005');
    RESET ROLE;
    SELECT json_build_object(
      'protein', (SELECT json_build_object('amount', supplement_amount, 'missing', meal_supplement_missing_count)
                  FROM nutrition.nutrient_intake_source_breakdown_for_day('54200000-0000-0000-0000-000000000001', DATE '2026-09-22')
                  WHERE nutrient_code = 'PROT625'),
      'vitaminK', (SELECT json_build_object('amount', supplement_amount, 'missing', meal_supplement_missing_count)
                   FROM nutrition.nutrient_intake_source_breakdown_for_day('54200000-0000-0000-0000-000000000001', DATE '2026-09-22')
                   WHERE nutrient_code = 'VITK'),
      'namedWithoutAmount', (SELECT coalesce(to_jsonb(il)->'supplier_product_unmeasured_nutrient_codes', '[]'::jsonb)
                              FROM supplements.intake_logs il
                              WHERE il.supplier_product_id = '54200000-0000-0000-0000-000000000004')
    );
    ROLLBACK;`)

  assert.deepEqual(result.protein, { amount: 48, missing: 0 })
  assert.deepEqual(result.vitaminK, { amount: null, missing: 1 })
  assert.deepEqual(result.namedWithoutAmount, ['VITK'])
})
