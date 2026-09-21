import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const container = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const db = process.env.LUMEOS_C524_DATABASE
if (!db || db === 'postgres') throw new Error('C-524 braucht LUMEOS_C524_DATABASE als Wegwerf-Datenbank.')

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
  return one<{ references: boolean; rules: boolean; eligibility: boolean }>(`
    SELECT json_build_object(
      'references', to_regclass('supplements.meal_plan_product_references') IS NOT NULL,
      'rules', to_regclass('supplements.product_form_placement_rules') IS NOT NULL,
      'eligibility', to_regprocedure('supplements.supplier_product_meal_eligibility(uuid)') IS NOT NULL
    );
  `)
}

test('C-524: ein Meal-Planeintrag hält eine Produktabsicht, keine vorgezogene Einnahme', () => {
  const available = availability()
  assert.deepEqual(available, { references: true, rules: true, eligibility: true })
  if (!available.references || !available.rules || !available.eligibility) return

  const result = one<{
    supplementEntry: number
    reference: number
    intakeLog: number
    powderAllowed: boolean
  }>(`
    BEGIN;
    WITH product AS (
      SELECT sp.id FROM supplements.supplier_products sp
      JOIN supplements.supplier_product_nutrients n ON n.product_id = sp.id
      WHERE sp.produktform = 'Powder [E0162]'
      LIMIT 1
    ), user_row AS (
      INSERT INTO auth.users (id, email)
      VALUES ('00000000-0000-0000-0000-000000000524', 'c524@lumeos.local')
      RETURNING id
    ), plan AS (
      INSERT INTO nutrition.meal_plans (id, user_id, name, status)
      SELECT '10000000-0000-0000-0000-000000000524', id, 'C524', 'active' FROM user_row
      RETURNING id, user_id
    ), week AS (
      INSERT INTO nutrition.meal_plan_weeks (id, plan_id, user_id, week_start)
      SELECT '20000000-0000-0000-0000-000000000524', id, user_id, DATE '2026-09-21' FROM plan
      RETURNING id, user_id
    ), day AS (
      INSERT INTO nutrition.meal_plan_days (id, week_id, user_id, plan_date, day_index)
      SELECT '30000000-0000-0000-0000-000000000524', id, user_id, DATE '2026-09-21', 1 FROM week
      RETURNING id, user_id
    ), entry AS (
      INSERT INTO nutrition.meal_plan_entries (id, day_id, user_id, meal_type, entry_type)
      SELECT '40000000-0000-0000-0000-000000000524', id, user_id, 'breakfast', 'supplement' FROM day
      RETURNING id, user_id
    ), reference AS (
      INSERT INTO supplements.meal_plan_product_references
        (meal_plan_entry_id, user_id, supplier_product_id, serving_quantity, nutrient_status)
      SELECT entry.id, entry.user_id, product.id, 1, 'available' FROM entry CROSS JOIN product
      RETURNING id, supplier_product_id
    ), meal AS (
      INSERT INTO nutrition.meals (id, user_id, entry_date, meal_type)
      SELECT '50000000-0000-0000-0000-000000000524', id, DATE '2026-09-21', 'breakfast' FROM user_row
      RETURNING id
    ), intake AS (
      SELECT supplements.record_supplier_product_intake(
        reference.supplier_product_id, DATE '2026-09-21', NULL, 1, NULL, meal.id
      ) AS id
      FROM reference CROSS JOIN meal
    )
    SELECT json_build_object(
      'supplementEntry', (SELECT count(*) FROM entry),
      'reference', (SELECT count(*) FROM reference),
      'intakeLog', (SELECT count(*) FROM intake),
      'powderAllowed', (SELECT is_meal_eligible FROM supplements.supplier_product_meal_eligibility((SELECT supplier_product_id FROM reference)))
    );
    ROLLBACK;
  `)
  assert.deepEqual(result, {
    supplementEntry: 1, reference: 1, intakeLog: 1, powderAllowed: true,
  })
})

test('C-524: eine Kapsel wird an der Planreferenz durch die Datenbank abgewiesen', () => {
  const available = availability()
  if (!available.references || !available.rules || !available.eligibility) return

  const result = one<{ rejected: boolean; placement: string }>(`
    BEGIN;
    DO $block$
    DECLARE v_user uuid := '00000000-0000-0000-0000-000000000524';
            v_product uuid;
            v_plan uuid := '10000000-0000-0000-0000-000000000524';
            v_week uuid := '20000000-0000-0000-0000-000000000524';
            v_day uuid := '30000000-0000-0000-0000-000000000524';
            v_entry uuid := '40000000-0000-0000-0000-000000000524';
    BEGIN
      INSERT INTO auth.users (id, email) VALUES (v_user, 'c524-capsule@lumeos.local');
      INSERT INTO nutrition.meal_plans (id, user_id, name, status) VALUES (v_plan, v_user, 'C524', 'active');
      INSERT INTO nutrition.meal_plan_weeks (id, plan_id, user_id, week_start) VALUES (v_week, v_plan, v_user, DATE '2026-09-21');
      INSERT INTO nutrition.meal_plan_days (id, week_id, user_id, plan_date, day_index) VALUES (v_day, v_week, v_user, DATE '2026-09-21', 1);
      INSERT INTO nutrition.meal_plan_entries (id, day_id, user_id, meal_type, entry_type) VALUES (v_entry, v_day, v_user, 'breakfast', 'supplement');
      SELECT id INTO v_product FROM supplements.supplier_products WHERE produktform = 'Capsule [E0159]' LIMIT 1;
      BEGIN
        INSERT INTO supplements.meal_plan_product_references (meal_plan_entry_id, user_id, supplier_product_id, serving_quantity, nutrient_status)
        VALUES (v_entry, v_user, v_product, 1, 'available');
      EXCEPTION WHEN check_violation THEN
        NULL;
      END;
    END;
    $block$;
    SELECT json_build_object(
      'rejected', NOT EXISTS (SELECT 1 FROM supplements.meal_plan_product_references WHERE meal_plan_entry_id = '40000000-0000-0000-0000-000000000524'),
      'placement', (SELECT placement FROM supplements.supplier_product_meal_eligibility((SELECT id FROM supplements.supplier_products WHERE produktform = 'Capsule [E0159]' LIMIT 1)))
    );
    ROLLBACK;
  `)
  assert.deepEqual(result, { rejected: true, placement: 'stack' })
})

test('C-524: ein Plan ohne Supplement behält seinen BLS-Eintrag unverändert', () => {
  const available = availability()
  if (!available.references || !available.rules || !available.eligibility) return

  const result = one<{ blsEntry: number }>(`
    BEGIN;
    WITH user_row AS (
      INSERT INTO auth.users (id, email)
      VALUES ('00000000-0000-0000-0000-000000000524', 'c524-bls@lumeos.local')
      RETURNING id
    ), plan AS (
      INSERT INTO nutrition.meal_plans (id, user_id, name, status)
      SELECT '10000000-0000-0000-0000-000000000524', id, 'C524', 'active' FROM user_row
      RETURNING id, user_id
    ), week AS (
      INSERT INTO nutrition.meal_plan_weeks (id, plan_id, user_id, week_start)
      SELECT '20000000-0000-0000-0000-000000000524', id, user_id, DATE '2026-09-21' FROM plan
      RETURNING id, user_id
    ), day AS (
      INSERT INTO nutrition.meal_plan_days (id, week_id, user_id, plan_date, day_index)
      SELECT '30000000-0000-0000-0000-000000000524', id, user_id, DATE '2026-09-21', 1 FROM week
      RETURNING id, user_id
    ), entry AS (
      INSERT INTO nutrition.meal_plan_entries (day_id, user_id, meal_type, entry_type, food_id, amount_g)
      SELECT day.id, day.user_id, 'breakfast', 'bls', f.id, 100
      FROM day CROSS JOIN LATERAL (SELECT id FROM nutrition.foods LIMIT 1) f
      RETURNING id
    )
    SELECT json_build_object('blsEntry', (SELECT count(*) FROM entry));
    ROLLBACK;
  `)
  assert.deepEqual(result, { blsEntry: 1 })
})

test('C-524: nur authenticated darf Regeln lesen und eigene Planreferenzen bearbeiten', () => {
  const available = availability()
  if (!available.references || !available.rules || !available.eligibility) return

  const result = one<{
    rulesAuthenticated: boolean
    rulesAnon: boolean
    referencesAuthenticated: boolean
    referencesAnon: boolean
    eligibilityAuthenticated: boolean
    eligibilityAnon: boolean
  }>(`
    SELECT json_build_object(
      'rulesAuthenticated', has_table_privilege('authenticated', 'supplements.product_form_placement_rules', 'SELECT'),
      'rulesAnon', has_table_privilege('anon', 'supplements.product_form_placement_rules', 'SELECT'),
      'referencesAuthenticated', has_table_privilege('authenticated', 'supplements.meal_plan_product_references', 'SELECT,INSERT,UPDATE,DELETE'),
      'referencesAnon', has_table_privilege('anon', 'supplements.meal_plan_product_references', 'SELECT'),
      'eligibilityAuthenticated', has_function_privilege('authenticated', 'supplements.supplier_product_meal_eligibility(uuid)', 'EXECUTE'),
      'eligibilityAnon', has_function_privilege('anon', 'supplements.supplier_product_meal_eligibility(uuid)', 'EXECUTE')
    );
  `)
  assert.deepEqual(result, {
    rulesAuthenticated: true, rulesAnon: false,
    referencesAuthenticated: true, referencesAnon: false,
    eligibilityAuthenticated: true, eligibilityAnon: false,
  })
})
