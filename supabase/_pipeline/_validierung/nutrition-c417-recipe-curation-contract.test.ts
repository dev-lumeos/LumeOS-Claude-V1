// C-417/C-31: Annahme ist eine atomare Admin-Entscheidung. Sie erzeugt
// Katalogmaterial, aber nie still ein privates Nutzerrezept.
import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import test from 'node:test'

const CONTAINER = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const DB = process.env.PGDATABASE

if (!DB || DB === 'postgres') {
  throw new Error('C-417-Test braucht explizit eine Wegwerf-Datenbank, nie postgres.')
}

function one<T>(sql: string): T {
  return JSON.parse(execFileSync('docker', [
    'exec', CONTAINER, 'psql', '-X', '-q', '-U', 'postgres', '-d', DB,
    '-t', '-A', '-c', sql,
  ], { encoding: 'utf8' }).trim()) as T
}

function psql(sql: string) {
  return spawnSync('docker', [
    'exec', CONTAINER, 'psql', '-X', '-v', 'ON_ERROR_STOP=1', '-q', '-U', 'postgres', '-d', DB,
    '-c', sql,
  ], { encoding: 'utf8' })
}

const ADMIN_CLAIMS =
  '{"sub":"00000000-0000-0000-0000-000000000417","app_metadata":{"role":"admin"}}'
const USER_CLAIMS =
  '{"sub":"00000000-0000-0000-0000-000000000418","app_metadata":{"role":"user"}}'

test('C-417: Annahme kopiert einen BLS-Kandidaten atomar in den Rezeptkatalog, nie nach recipes', () => {
  const result = one<{
    catalogId: string
    candidateStatus: string
    decisions: number
    catalogIngredients: number
    catalogSource: string
    privateRecipes: number
  }>(`
    BEGIN;
    CREATE TEMP TABLE c417_context ON COMMIT DROP AS
      SELECT
        '00000000-0000-0000-0000-000000000417'::uuid AS owner_id,
        (SELECT id FROM nutrition.foods ORDER BY bls_code LIMIT 1) AS food_id;
    CREATE TEMP TABLE c417_candidate ON COMMIT DROP AS
      WITH inserted AS (
        INSERT INTO nutrition.recipe_curation_candidates (
          recipe_owner_id, name_de, servings, reason
        )
        SELECT owner_id, 'C417 Katalogrezept', 2, 'C-417 Gegenprobe'
        FROM c417_context
        RETURNING id
      )
      SELECT id FROM inserted;
    GRANT SELECT ON c417_candidate TO authenticated;
    INSERT INTO nutrition.recipe_curation_candidate_ingredients (
      candidate_id, sort_order, food_source, food_id, food_name_snapshot, amount_g
    )
    SELECT c.id, 0, 'bls', x.food_id, 'C417 BLS-Snapshot', 120
    FROM c417_candidate c CROSS JOIN c417_context x;
    CREATE TEMP TABLE c417_claim ON COMMIT DROP AS
      SELECT set_config('request.jwt.claims', '${ADMIN_CLAIMS}', true);
    SET LOCAL ROLE authenticated;
    CREATE TEMP TABLE c417_result ON COMMIT DROP AS
      SELECT nutrition.decide_recipe_curation_candidate(id, 'accepted', 'fachlich geprueft') AS catalog_id
      FROM c417_candidate;
    RESET ROLE;
    SELECT json_build_object(
      'catalogId', (SELECT catalog_id FROM c417_result)::text,
      'candidateStatus', (SELECT status FROM nutrition.recipe_curation_candidates
                          WHERE id = (SELECT id FROM c417_candidate)),
      'decisions', (SELECT count(*)::integer FROM nutrition.recipe_curation_decisions
                    WHERE candidate_id = (SELECT id FROM c417_candidate)),
      'catalogIngredients', (SELECT count(*)::integer FROM nutrition.recipe_curation_catalog_ingredients
                             WHERE catalog_recipe_id = (SELECT catalog_id FROM c417_result)),
      'catalogSource', (SELECT source FROM nutrition.recipe_curation_catalog
                        WHERE id = (SELECT catalog_id FROM c417_result)),
      'privateRecipes', (SELECT count(*)::integer FROM nutrition.recipes
                         WHERE name_de = 'C417 Katalogrezept')
    );
    ROLLBACK;
  `)

  assert.ok(result.catalogId)
  assert.equal(result.candidateStatus, 'accepted')
  assert.equal(result.decisions, 1)
  assert.equal(result.catalogIngredients, 1)
  assert.equal(result.catalogSource, 'mealcam_curation')
  assert.equal(result.privateRecipes, 0)
})

test('C-417: Ablehnung protokolliert nur die Entscheidung und Nicht-Admins duerfen nicht entscheiden', () => {
  const denied = psql(`
    BEGIN;
    SET LOCAL ROLE authenticated;
    SELECT set_config('request.jwt.claims', '${USER_CLAIMS}', true);
    SELECT nutrition.decide_recipe_curation_candidate(gen_random_uuid(), 'rejected', 'keine Rolle');
    ROLLBACK;
  `)
  assert.notEqual(denied.status, 0, 'Nicht-Admin darf keinen Kandidaten entscheiden')

  const result = one<{
    status: string
    decision: string
    catalogRows: number
    directWriteDenied: boolean
  }>(`
    BEGIN;
    CREATE TEMP TABLE c417_context ON COMMIT DROP AS
      SELECT '00000000-0000-0000-0000-000000000417'::uuid AS owner_id;
    CREATE TEMP TABLE c417_candidate ON COMMIT DROP AS
      WITH inserted AS (
        INSERT INTO nutrition.recipe_curation_candidates (
          recipe_owner_id, name_de, servings, reason
        )
        SELECT owner_id, 'C417 Ablehnung', 1, 'C-417 Gegenprobe'
        FROM c417_context
        RETURNING id
      )
      SELECT id FROM inserted;
    GRANT SELECT ON c417_candidate TO authenticated;
    CREATE TEMP TABLE c417_claim ON COMMIT DROP AS
      SELECT set_config('request.jwt.claims', '${ADMIN_CLAIMS}', true);
    SET LOCAL ROLE authenticated;
    SELECT nutrition.decide_recipe_curation_candidate(id, 'rejected', 'nicht katalogtauglich')
    FROM c417_candidate;
    RESET ROLE;
    SELECT json_build_object(
      'status', (SELECT status FROM nutrition.recipe_curation_candidates
                 WHERE id = (SELECT id FROM c417_candidate)),
      'decision', (SELECT decision FROM nutrition.recipe_curation_decisions
                   WHERE candidate_id = (SELECT id FROM c417_candidate)),
      'catalogRows', (SELECT count(*)::integer FROM nutrition.recipe_curation_catalog
                      WHERE candidate_id = (SELECT id FROM c417_candidate)),
      'directWriteDenied', NOT has_table_privilege(
        'authenticated', 'nutrition.recipe_curation_catalog', 'INSERT'
      )
    );
    ROLLBACK;
  `)

  assert.deepEqual(result, {
    status: 'rejected',
    decision: 'rejected',
    catalogRows: 0,
    directWriteDenied: true,
  })
})

test('C-417: ein nicht BLS-gebundener Kandidat bleibt nach fehlgeschlagener Annahme vollstaendig pending', () => {
  const result = one<{
    failed: boolean
    status: string
    decisions: number
    catalogRows: number
  }>(`
    BEGIN;
    CREATE TEMP TABLE c417_context ON COMMIT DROP AS
      SELECT '00000000-0000-0000-0000-000000000417'::uuid AS owner_id;
    CREATE TEMP TABLE c417_candidate ON COMMIT DROP AS
      WITH inserted AS (
        INSERT INTO nutrition.recipe_curation_candidates (
          recipe_owner_id, name_de, servings, reason
        )
        SELECT owner_id, 'C417 Kein Katalog', 1, 'C-417 Gegenprobe'
        FROM c417_context
        RETURNING id
      )
      SELECT id FROM inserted;
    GRANT SELECT ON c417_candidate TO authenticated;
    INSERT INTO nutrition.recipe_curation_candidate_ingredients (
      candidate_id, sort_order, food_source, food_name_snapshot, amount_g
    )
    SELECT id, 0, 'custom', 'Nicht globales Custom Food', 100 FROM c417_candidate;
    CREATE TEMP TABLE c417_claim ON COMMIT DROP AS
      SELECT set_config('request.jwt.claims', '${ADMIN_CLAIMS}', true);
    SET LOCAL ROLE authenticated;
    CREATE TEMP TABLE c417_failed ON COMMIT DROP AS
      SELECT false AS value;
    DO $$
    BEGIN
      PERFORM nutrition.decide_recipe_curation_candidate(
        (SELECT id FROM c417_candidate), 'accepted', 'darf nicht passieren'
      );
    EXCEPTION WHEN OTHERS THEN
      UPDATE c417_failed SET value = true;
    END $$;
    RESET ROLE;
    SELECT json_build_object(
      'failed', (SELECT value FROM c417_failed),
      'status', (SELECT status FROM nutrition.recipe_curation_candidates
                 WHERE id = (SELECT id FROM c417_candidate)),
      'decisions', (SELECT count(*)::integer FROM nutrition.recipe_curation_decisions
                    WHERE candidate_id = (SELECT id FROM c417_candidate)),
      'catalogRows', (SELECT count(*)::integer FROM nutrition.recipe_curation_catalog
                      WHERE candidate_id = (SELECT id FROM c417_candidate))
    );
    ROLLBACK;
  `)

  assert.deepEqual(result, {
    failed: true,
    status: 'pending',
    decisions: 0,
    catalogRows: 0,
  })
})
