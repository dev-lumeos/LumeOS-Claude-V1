import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import test from 'node:test'

const CONTAINER = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'

function one<T>(sql: string): T {
  return JSON.parse(execFileSync('docker', [
    'exec', CONTAINER, 'psql', '-X', '-q', '-U', 'postgres', '-d', 'postgres',
    '-t', '-A', '-c', sql,
  ], { encoding: 'utf8' }).trim()) as T
}

function psql(sql: string) {
  return spawnSync('docker', [
    'exec', CONTAINER, 'psql', '-X', '-v', 'ON_ERROR_STOP=1', '-q', '-U', 'postgres', '-d', 'postgres',
    '-c', sql,
  ], { encoding: 'utf8' })
}

test('C-409: nutrition_reorder ist ein erlaubter, referenzfreier Listenursprung', () => {
  const result = one<{ sourceCheck: boolean; targetCheck: boolean; createdSource: string }>(`
    BEGIN;
    CREATE TEMP TABLE c409_reorder_context ON COMMIT DROP AS
      SELECT id AS user_id FROM auth.users WHERE email = 'dev@lumeos.app';
    INSERT INTO nutrition.shopping_lists (user_id, name, source_type, measurement_source)
      SELECT user_id, 'C409 Gegenprobe', 'nutrition_reorder', 'manual'
      FROM c409_reorder_context;
    SELECT json_build_object(
      'sourceCheck', (SELECT pg_get_constraintdef(oid) LIKE '%nutrition_reorder%'
                      FROM pg_constraint
                      WHERE conrelid = 'nutrition.shopping_lists'::regclass
                        AND conname = 'shopping_lists_source_type_check'),
      'targetCheck', (SELECT pg_get_constraintdef(oid) LIKE '%nutrition_reorder%'
                      FROM pg_constraint
                      WHERE conrelid = 'nutrition.shopping_lists'::regclass
                        AND conname = 'shopping_lists_source_target_check'),
      'createdSource', (SELECT source_type FROM nutrition.shopping_lists
                        WHERE name = 'C409 Gegenprobe')
    );
    ROLLBACK;
  `)

  assert.deepEqual(result, {
    sourceCheck: true,
    targetCheck: true,
    createdSource: 'nutrition_reorder',
  })
})

test('G-279: die Sicht zaehlt eine manuelle Position als einen Tag', () => {
  const result = one<{
    viewExists: boolean
    rowsPerMealType: boolean
    foodSource: string
    foodId: null
    daysUsed: number
    daysWithMealType: number
  }>(`
    BEGIN;
    CREATE TEMP TABLE c409_frequent_context ON COMMIT DROP AS
      SELECT u.id AS user_id
      FROM auth.users u
      WHERE NOT EXISTS (
        SELECT 1 FROM nutrition.meals m
        WHERE m.user_id = u.id
          AND m.entry_date = CURRENT_DATE
          AND m.meal_type = 'snack'
      )
      ORDER BY u.id
      LIMIT 1;
    INSERT INTO nutrition.meals (user_id, entry_date, meal_type)
      SELECT user_id, CURRENT_DATE, 'snack' FROM c409_frequent_context;
    INSERT INTO nutrition.meal_items (
      meal_id, user_id, food_source, food_name, amount_g, nutrients, measurement_source
    )
      SELECT m.id, c.user_id, 'manual', 'C409 manueller Posten', 100, '{}'::jsonb, 'manual'
      FROM c409_frequent_context c
      JOIN nutrition.meals m ON m.user_id = c.user_id
        AND m.entry_date = CURRENT_DATE AND m.meal_type = 'snack';
    SELECT json_build_object(
      'viewExists', to_regclass('nutrition.frequent_food_positions') IS NOT NULL,
      'rowsPerMealType', NOT EXISTS (
        SELECT 1 FROM nutrition.frequent_food_positions
        GROUP BY user_id, meal_type HAVING count(*) <> 1
      ),
      'foodSource', (SELECT food_source FROM nutrition.frequent_food_positions
                     WHERE user_id = (SELECT user_id FROM c409_frequent_context)
                       AND meal_type = 'snack'),
      'foodId', (SELECT food_id FROM nutrition.frequent_food_positions
                 WHERE user_id = (SELECT user_id FROM c409_frequent_context)
                   AND meal_type = 'snack'),
      'daysUsed', (SELECT days_used FROM nutrition.frequent_food_positions
                   WHERE user_id = (SELECT user_id FROM c409_frequent_context)
                     AND meal_type = 'snack'),
      'daysWithMealType', (SELECT days_with_meal_type FROM nutrition.frequent_food_positions
                           WHERE user_id = (SELECT user_id FROM c409_frequent_context)
                             AND meal_type = 'snack')
    );
    ROLLBACK;
  `)

  assert.equal(result.viewExists, true)
  assert.equal(result.rowsPerMealType, true)
  assert.equal(result.foodSource, 'manual')
  assert.equal(result.foodId, null)
  assert.equal(result.daysUsed, 1)
  assert.equal(result.daysWithMealType, 1)
})

test('C-31: nur die Admin-Mutation schreibt das Tag-Overlay und sie wirkt in food_tags_effective', () => {
  const denied = psql(`
    BEGIN;
    SET LOCAL ROLE authenticated;
    SELECT set_config('request.jwt.claims',
      '{"sub":"00000000-0000-0000-0000-000000000001","app_metadata":{"role":"user"}}', true);
    SELECT nutrition.curate_food_tag(
      (SELECT id FROM nutrition.foods ORDER BY bls_code LIMIT 1),
      (SELECT code FROM nutrition.tag_definitions ORDER BY code LIMIT 1),
      'removed'
    );
    ROLLBACK;
  `)
  assert.notEqual(denied.status, 0, 'Nicht-Admin darf keine Kurationsmutation ausfuehren')

  const result = one<{ action: string; effectiveCount: number; source: string; directWriteDenied: boolean }>(`
    BEGIN;
    CREATE TEMP TABLE c409_curation_probe ON COMMIT DROP AS
      SELECT ft.food_id, ft.tag_code
      FROM nutrition.food_tags ft
      ORDER BY ft.food_id, ft.tag_code
      LIMIT 1;
    GRANT SELECT ON c409_curation_probe TO authenticated;
    CREATE TEMP TABLE c409_curation_claim ON COMMIT DROP AS
      SELECT set_config('request.jwt.claims',
        '{"sub":"00000000-0000-0000-0000-000000000001","app_metadata":{"role":"admin"}}', true);
    SET LOCAL ROLE authenticated;
    SELECT nutrition.curate_food_tag(food_id, tag_code, 'removed')
    FROM c409_curation_probe;
    CREATE TEMP TABLE c409_curation_result ON COMMIT DROP AS
      SELECT json_build_object(
        'action', (SELECT action FROM nutrition.food_tags_kuriert k
                   JOIN c409_curation_probe p USING (food_id, tag_code)),
        'effectiveCount', (SELECT count(*) FROM nutrition.food_tags_effective e
                           JOIN c409_curation_probe p USING (food_id, tag_code)),
        'source', (SELECT source FROM nutrition.food_tags_effective e
                   JOIN c409_curation_probe p USING (food_id, tag_code))
      ) AS value;
    RESET ROLE;
    SELECT json_build_object(
      'action', value->>'action',
      'effectiveCount', (value->>'effectiveCount')::integer,
      'source', value->>'source',
      'directWriteDenied', NOT has_table_privilege('authenticated', 'nutrition.food_tags_kuriert', 'INSERT')
    )
    FROM c409_curation_result;
    ROLLBACK;
  `)

  assert.deepEqual(result, {
    action: 'removed',
    effectiveCount: 0,
    source: null,
    directWriteDenied: true,
  })
})
