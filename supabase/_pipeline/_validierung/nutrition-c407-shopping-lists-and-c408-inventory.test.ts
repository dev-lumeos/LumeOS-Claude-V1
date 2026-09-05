import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const CONTAINER = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const DB = process.env.PGDATABASE ?? 'postgres'

function one<T>(sql: string): T {
  return JSON.parse(execFileSync('docker', [
    'exec', CONTAINER,
    'psql', '-X', '-q', '-U', 'postgres', '-d', DB,
    '-t', '-A', '-c', sql,
  ], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }).trim()) as T
}

test('C-407: eine Planwoche wird je food_id aggregiert und bleibt nach Archivierung lesbar', () => {
  const result = one<{
    listSource: string
    weekIdPresent: boolean
    itemCount: number
    amountG: number
    quantity: null
    unitDisplay: string
    sameNamedManualItems: number
    archivedStatus: string
    archivedItemCount: number
  }>(`
    BEGIN;
    CREATE TEMP TABLE c407_context ON COMMIT DROP AS
      SELECT
        (SELECT id FROM auth.users WHERE email = 'dev@lumeos.app') AS user_id,
        (SELECT id FROM nutrition.foods ORDER BY bls_code LIMIT 1) AS food_id;
    CREATE TEMP TABLE c407_plan(id uuid, week_id uuid, user_id uuid) ON COMMIT DROP;
    WITH plan AS (
      INSERT INTO nutrition.meal_plans (user_id, name, status, is_active)
      SELECT user_id, 'C407 Aggregationsplan', 'paused', false FROM c407_context
      RETURNING id, user_id
    ), week AS (
      INSERT INTO nutrition.meal_plan_weeks (plan_id, user_id, week_start, name)
      SELECT id, user_id, DATE '2099-01-05', 'C407 Woche' FROM plan
      RETURNING id, user_id
    )
    INSERT INTO c407_plan (id, week_id, user_id)
    SELECT plan.id, week.id, plan.user_id FROM plan CROSS JOIN week;
    INSERT INTO nutrition.meal_plan_days (week_id, user_id, plan_date, day_index)
    SELECT p.week_id, p.user_id, DATE '2099-01-05' + (d - 1), d
    FROM c407_plan p CROSS JOIN generate_series(1, 7) AS d;
    INSERT INTO nutrition.meal_plan_entries (day_id, user_id, meal_type, entry_type, food_id, amount_g)
    SELECT d.id, d.user_id, 'lunch', 'bls', c.food_id, 100
    FROM nutrition.meal_plan_days d
    JOIN c407_context c ON true
    WHERE d.week_id = (SELECT week_id FROM c407_plan);
    CREATE TEMP TABLE c407_list(id uuid) ON COMMIT DROP;
    GRANT SELECT ON c407_context, c407_plan TO authenticated;
    GRANT SELECT, INSERT ON c407_list TO authenticated;
    CREATE TEMP TABLE c407_auth ON COMMIT DROP AS
      SELECT set_config('request.jwt.claim.sub', user_id::text, true) FROM c407_context;
    SET LOCAL ROLE authenticated;
    INSERT INTO c407_list
      SELECT nutrition.shopping_list_from_meal_plan_week(week_id) FROM c407_plan;
    INSERT INTO nutrition.shopping_list_items (
      shopping_list_id, user_id, sort_order, item_source, food_name, quantity, unit_display
    )
    SELECT id, (SELECT user_id FROM c407_context), 90, 'free_text', 'C407 Gleich benannt', 1, 'Stueck'
    FROM c407_list
    UNION ALL
    SELECT id, (SELECT user_id FROM c407_context), 91, 'free_text', 'C407 Gleich benannt', 1, 'Stueck'
    FROM c407_list;
    CREATE TEMP TABLE c407_archive ON COMMIT DROP AS
      SELECT nutrition.shopping_list_archive(id) FROM c407_list;
    SELECT json_build_object(
      'listSource', (SELECT source_type FROM nutrition.shopping_lists WHERE id = (SELECT id FROM c407_list)),
      'weekIdPresent', (SELECT meal_plan_week_id IS NOT NULL FROM nutrition.shopping_lists WHERE id = (SELECT id FROM c407_list)),
      'itemCount', jsonb_array_length(nutrition.shopping_list_read((SELECT id FROM c407_list)) -> 'items'),
      'amountG', (SELECT amount_g FROM nutrition.shopping_list_items WHERE shopping_list_id = (SELECT id FROM c407_list) AND food_id = (SELECT food_id FROM c407_context)),
      'quantity', (SELECT quantity FROM nutrition.shopping_list_items WHERE shopping_list_id = (SELECT id FROM c407_list) AND food_id = (SELECT food_id FROM c407_context)),
      'unitDisplay', (SELECT unit_display FROM nutrition.shopping_list_items WHERE shopping_list_id = (SELECT id FROM c407_list) AND food_id = (SELECT food_id FROM c407_context)),
      'sameNamedManualItems', (SELECT count(*)::integer FROM nutrition.shopping_list_items WHERE shopping_list_id = (SELECT id FROM c407_list) AND food_name = 'C407 Gleich benannt'),
      'archivedStatus', (SELECT status FROM nutrition.shopping_lists WHERE id = (SELECT id FROM c407_list)),
      'archivedItemCount', jsonb_array_length(nutrition.shopping_list_read((SELECT id FROM c407_list)) -> 'items')
    );
    ROLLBACK;
  `)

  assert.equal(result.listSource, 'meal_plan')
  assert.equal(result.weekIdPresent, true)
  assert.equal(result.itemCount, 3)
  assert.equal(result.amountG, 700)
  assert.equal(result.quantity, null)
  assert.equal(result.unitDisplay, 'g')
  assert.equal(result.sameNamedManualItems, 2)
  assert.equal(result.archivedStatus, 'archived')
  assert.equal(result.archivedItemCount, 3)
})

test('C-408: Nutrition-Vorrat ist RLS-geschuetzt, editierbar und wird bei neuem Meal-Item in Gramm reduziert', () => {
  const result = one<{
    table: boolean
    otherUserCannotRead: boolean
    amountAfterFirstMeal: number
    amountAfterManualEditAndNextMeal: number
    reorderFlagAfterFirstMeal: boolean
    reorderFlag: boolean
    foreignKeyOutsideNutrition: boolean
  }>(`
    BEGIN;
    CREATE TEMP TABLE c408_context ON COMMIT DROP AS
      SELECT
        (SELECT id FROM auth.users WHERE email = 'dev@lumeos.app') AS owner_id,
        (SELECT id FROM auth.users WHERE email = 'test-user@lumeos.local') AS other_id,
        (SELECT id FROM nutrition.foods ORDER BY bls_code LIMIT 1) AS food_id,
        (SELECT id FROM nutrition.meals WHERE user_id = (SELECT id FROM auth.users WHERE email = 'dev@lumeos.app') ORDER BY created_at LIMIT 1) AS meal_id;
    INSERT INTO nutrition.user_inventory (user_id, food_id, menge_g, schwelle_g)
    SELECT owner_id, food_id, 500, 450 FROM c408_context;
    INSERT INTO nutrition.meal_items (
      meal_id, user_id, food_id, food_source, food_name, amount_g, nutrients, measurement_source
    )
    SELECT c.meal_id, c.owner_id, c.food_id, 'bls', f.name_de, 100, '{}'::jsonb, 'manual'
    FROM c408_context c JOIN nutrition.foods f ON f.id = c.food_id;
    CREATE TEMP TABLE c408_after_first ON COMMIT DROP AS
      SELECT menge_g, reorder_flag
      FROM nutrition.user_inventory
      WHERE user_id = (SELECT owner_id FROM c408_context)
        AND food_id = (SELECT food_id FROM c408_context);
    UPDATE nutrition.user_inventory SET menge_g = 300
    WHERE user_id = (SELECT owner_id FROM c408_context) AND food_id = (SELECT food_id FROM c408_context);
    INSERT INTO nutrition.meal_items (
      meal_id, user_id, food_id, food_source, food_name, amount_g, nutrients, measurement_source
    )
    SELECT c.meal_id, c.owner_id, c.food_id, 'bls', f.name_de, 25, '{}'::jsonb, 'manual'
    FROM c408_context c JOIN nutrition.foods f ON f.id = c.food_id;
    CREATE TEMP TABLE c408_after_second ON COMMIT DROP AS
      SELECT menge_g, reorder_flag
      FROM nutrition.user_inventory
      WHERE user_id = (SELECT owner_id FROM c408_context)
        AND food_id = (SELECT food_id FROM c408_context);
    GRANT SELECT ON c408_context, c408_after_first, c408_after_second TO authenticated;
    CREATE TEMP TABLE c408_auth ON COMMIT DROP AS
      SELECT set_config('request.jwt.claim.sub', other_id::text, true) FROM c408_context;
    SET LOCAL ROLE authenticated;
    SELECT json_build_object(
      'table', to_regclass('nutrition.user_inventory') IS NOT NULL,
      'otherUserCannotRead', NOT EXISTS (SELECT 1 FROM nutrition.user_inventory),
      'amountAfterFirstMeal', (SELECT menge_g FROM c408_after_first),
      'amountAfterManualEditAndNextMeal', (SELECT menge_g FROM c408_after_second),
      'reorderFlagAfterFirstMeal', (SELECT reorder_flag FROM c408_after_first),
      'reorderFlag', (SELECT reorder_flag FROM c408_after_second),
      'foreignKeyOutsideNutrition', EXISTS (
        SELECT 1
        FROM pg_constraint c
        JOIN pg_class target ON target.oid = c.confrelid
        JOIN pg_namespace target_schema ON target_schema.oid = target.relnamespace
        WHERE c.conrelid = 'nutrition.user_inventory'::regclass
          AND c.contype = 'f'
          AND target_schema.nspname NOT IN ('nutrition', 'auth')
      )
    );
    ROLLBACK;
  `)

  assert.equal(result.table, true)
  assert.equal(result.otherUserCannotRead, true)
  assert.equal(result.amountAfterFirstMeal, 400)
  assert.equal(result.amountAfterManualEditAndNextMeal, 275)
  assert.equal(result.reorderFlagAfterFirstMeal, true)
  assert.equal(result.reorderFlag, true)
  assert.equal(result.foreignKeyOutsideNutrition, false)
})
