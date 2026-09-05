// C-411/E-66: Rezeptvorschlaege sind keine polymorphen Food-Kandidaten;
// ihre Zutaten und Mengen bleiben als eigener Snapshot fuer die Admin-Pruefung erhalten.
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

test('C-411: Rezeptkandidaten haben einen eigenen Zutaten-Snapshot statt proposed_value', () => {
  const schema = one<{
    tables: string[]
    candidateColumns: string[]
    ingredientColumns: string[]
    foodCandidateColumns: string[]
  }>(`
    SELECT json_build_object(
      'tables', (
        SELECT COALESCE(json_agg(c.relname ORDER BY c.relname), '[]'::json)
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'nutrition'
          AND c.relname IN (
            'recipe_curation_candidates',
            'recipe_curation_candidate_ingredients',
            'recipe_curation_decisions'
          )
      ),
      'candidateColumns', (
        SELECT COALESCE(json_agg(column_name ORDER BY column_name), '[]'::json)
        FROM information_schema.columns
        WHERE table_schema = 'nutrition' AND table_name = 'recipe_curation_candidates'
          AND column_name IN ('recipe_id', 'recipe_owner_id', 'name_de', 'servings', 'status')
      ),
      'ingredientColumns', (
        SELECT COALESCE(json_agg(column_name ORDER BY column_name), '[]'::json)
        FROM information_schema.columns
        WHERE table_schema = 'nutrition' AND table_name = 'recipe_curation_candidate_ingredients'
          AND column_name IN ('candidate_id', 'food_source', 'food_id', 'custom_food_id', 'food_name_snapshot', 'amount_g', 'sort_order')
      ),
      'foodCandidateColumns', (
        SELECT COALESCE(json_agg(column_name ORDER BY column_name), '[]'::json)
        FROM information_schema.columns
        WHERE table_schema = 'nutrition' AND table_name = 'food_curation_candidates'
          AND column_name = 'food_id'
      )
    );
  `)

  assert.deepEqual(schema.tables, [
    'recipe_curation_candidate_ingredients',
    'recipe_curation_candidates',
    'recipe_curation_decisions',
  ])
  assert.deepEqual(schema.candidateColumns, [
    'name_de', 'recipe_id', 'recipe_owner_id', 'servings', 'status',
  ])
  assert.deepEqual(schema.ingredientColumns, [
    'amount_g', 'candidate_id', 'custom_food_id', 'food_id', 'food_name_snapshot', 'food_source', 'sort_order',
  ])
  assert.deepEqual(schema.foodCandidateColumns, ['food_id'])
})

test('C-411: ein Rezeptkandidat kopiert Zutaten und Mengen und bleibt nach der Probe nicht bestehen', () => {
  const snapshot = one<{
    status: string
    ingredientCount: number
    amountG: number
  }>(`
    BEGIN;
    CREATE TEMP TABLE c411_recipe_probe ON COMMIT DROP AS
      SELECT r.*
      FROM nutrition.recipes r
      WHERE EXISTS (
        SELECT 1 FROM nutrition.recipe_ingredients ri WHERE ri.recipe_id = r.id
      )
      ORDER BY r.id
      LIMIT 1;
    CREATE TEMP TABLE c411_candidate_probe (
      id uuid PRIMARY KEY
    ) ON COMMIT DROP;
    WITH inserted AS (
      INSERT INTO nutrition.recipe_curation_candidates (
        recipe_id, recipe_owner_id, name_de, description, instructions,
        cuisine_code, cooking_skill, prep_time_min, cook_time_min, servings, tags, reason
      )
      SELECT
        r.id, r.user_id, r.name_de, r.description, r.instructions,
        r.cuisine_code, r.cooking_skill, r.prep_time_min, r.cook_time_min, r.servings, r.tags,
        'C-411 Gegenprobe'
      FROM c411_recipe_probe r
      RETURNING id
    )
    INSERT INTO c411_candidate_probe (id)
    SELECT id FROM inserted;
    INSERT INTO nutrition.recipe_curation_candidate_ingredients (
      candidate_id, sort_order, food_source, food_id, custom_food_id,
      food_name_snapshot, amount_g, portion_name, portion_quantity, portion_amount_g, notes
    )
    SELECT
      c.id, ri.sort_order, ri.food_source, ri.food_id, ri.custom_food_id,
      COALESCE(NULLIF(ri.food_name_snapshot, ''), 'C-411 Zutaten-Snapshot'),
      ri.amount_g, ri.portion_name, ri.portion_quantity, ri.portion_amount_g, ri.notes
    FROM c411_candidate_probe c
    JOIN c411_recipe_probe r ON true
    JOIN nutrition.recipe_ingredients ri ON ri.recipe_id = r.id;
    SELECT json_build_object(
      'status', (SELECT status FROM nutrition.recipe_curation_candidates
                 WHERE id = (SELECT id FROM c411_candidate_probe)),
      'ingredientCount', (SELECT count(*)::integer
                          FROM nutrition.recipe_curation_candidate_ingredients
                          WHERE candidate_id = (SELECT id FROM c411_candidate_probe)),
      'amountG', (SELECT sum(amount_g)::numeric
                  FROM nutrition.recipe_curation_candidate_ingredients
                  WHERE candidate_id = (SELECT id FROM c411_candidate_probe))
    );
    ROLLBACK;
  `)

  assert.equal(snapshot.status, 'pending')
  assert.ok(snapshot.ingredientCount > 0)
  assert.ok(snapshot.amountG > 0)
  assert.equal(one<number>('SELECT count(*)::integer FROM nutrition.recipe_curation_candidates;'), 0)
})
