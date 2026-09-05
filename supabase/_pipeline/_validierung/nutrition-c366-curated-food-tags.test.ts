// C-366 / E-55: Import-Tags und menschliche Entscheidungen bleiben getrennt.
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

test('C-366: Entfernt-Kuration ueberdeckt den Import auch nach dessen erneuter Zeile', () => {
  const structure = one<{
    exists: boolean
    rls: boolean
    policies: string[]
    effectiveReaders: number
    importOnlyReaders: number
  }>(`
    SELECT json_build_object(
      'exists', to_regclass('nutrition.food_tags_kuriert') IS NOT NULL,
      'rls', (SELECT relrowsecurity FROM pg_class WHERE oid='nutrition.food_tags_kuriert'::regclass),
      'policies', (SELECT coalesce(json_agg(policyname order by policyname), '[]'::json)
                   FROM pg_policies WHERE schemaname='nutrition' AND tablename='food_tags_kuriert'),
      'effectiveReaders', (SELECT count(*) FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
                           WHERE n.nspname='nutrition'
                             AND p.proname IN ('food_search', 'preference_search_preview', 'refresh_food_preference_search_targets')
                             AND pg_get_functiondef(p.oid) LIKE '%nutrition.food_tags_effective%'),
      'importOnlyReaders', (SELECT count(*) FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
                            WHERE n.nspname='nutrition'
                              AND p.proname IN ('food_search', 'preference_search_preview', 'refresh_food_preference_search_targets')
                              AND pg_get_functiondef(p.oid) LIKE '%nutrition.food_tags %')
    );
  `)
  assert.equal(structure.exists, true)
  assert.equal(structure.rls, true)
  assert.deepEqual(structure.policies, ['food_tags_kuriert_select'])
  assert.equal(structure.effectiveReaders, 3)
  assert.equal(structure.importOnlyReaders, 0)

  const effective = one<{ afterRemove: number; afterImport: number; curatedSet: number; source: string }>(`
    BEGIN;
    CREATE TEMP TABLE c366_probe ON COMMIT DROP AS
      SELECT f.id AS food_id, td.code AS tag_code
      FROM nutrition.foods f CROSS JOIN nutrition.tag_definitions td
      WHERE NOT EXISTS (
        SELECT 1 FROM nutrition.food_tags ft WHERE ft.food_id=f.id AND ft.tag_code=td.code
      )
      LIMIT 1
    ;
    INSERT INTO nutrition.food_tags(food_id, tag_code, confidence)
      SELECT food_id, tag_code, 0.5 FROM c366_probe;
    INSERT INTO nutrition.food_tags_kuriert(food_id, tag_code, action)
      SELECT food_id, tag_code, 'removed' FROM c366_probe;
    CREATE TEMP TABLE c366_after_remove ON COMMIT DROP AS
      SELECT count(*) AS value FROM nutrition.food_tags_effective e JOIN c366_probe p USING(food_id, tag_code);
    DELETE FROM nutrition.food_tags ft USING c366_probe p WHERE ft.food_id=p.food_id AND ft.tag_code=p.tag_code;
    INSERT INTO nutrition.food_tags(food_id, tag_code, confidence)
      SELECT food_id, tag_code, 1.0 FROM c366_probe;
    CREATE TEMP TABLE c366_after_import ON COMMIT DROP AS
      SELECT count(*) AS value FROM nutrition.food_tags_effective e JOIN c366_probe p USING(food_id, tag_code);
    UPDATE nutrition.food_tags_kuriert ft SET action='set'
      FROM c366_probe p WHERE ft.food_id=p.food_id AND ft.tag_code=p.tag_code;
    SELECT json_build_object(
      'afterRemove', (SELECT value FROM c366_after_remove),
      'afterImport', (SELECT value FROM c366_after_import),
      'curatedSet', (SELECT count(*) FROM nutrition.food_tags_effective e JOIN c366_probe p USING(food_id, tag_code)),
      'source', (SELECT e.source FROM nutrition.food_tags_effective e JOIN c366_probe p USING(food_id, tag_code))
    );
    ROLLBACK;
  `)
  assert.deepEqual(effective, { afterRemove: 0, afterImport: 0, curatedSet: 1, source: 'curated' })

  const anon = psql(`
    SET LOCAL ROLE anon;
    SELECT * FROM nutrition.food_tags_kuriert;
  `)
  assert.notEqual(anon.status, 0, 'anon darf keine Kuration lesen')
})

test('C-410: eine gesetzte Kuration wirkt zugleich in food_search und im Preference-Refresh', () => {
  const result = one<{ foodSearchSeesCurated: boolean; refreshSeesCurated: boolean }>(`
    BEGIN;
    CREATE TEMP TABLE c410_probe ON COMMIT DROP AS
      SELECT
        (SELECT id FROM auth.users WHERE email = 'dev@lumeos.app') AS user_id,
        (SELECT f.id
         FROM nutrition.foods f
         WHERE NOT EXISTS (
           SELECT 1 FROM nutrition.food_tags ft
           WHERE ft.food_id = f.id AND ft.tag_code = 'contains_nuts'
         )
         ORDER BY f.bls_code
         LIMIT 1) AS food_id;
    INSERT INTO nutrition.food_tags_kuriert(food_id, tag_code, action)
      SELECT food_id, 'contains_nuts', 'set' FROM c410_probe;
    SELECT nutrition.refresh_food_preference_search_targets(user_id)
    FROM c410_probe;
    SELECT json_build_object(
      'foodSearchSeesCurated', EXISTS (
        SELECT 1
        FROM json_array_elements(
          nutrition.food_search(
            '', '', ARRAY[]::text[], NULL, '', NULL, 'contains_nuts', 'relevance',
            1000, 0, NULL, NULL, false, NULL, NULL, NULL
          )->'foods'
        ) AS result(food)
        JOIN c410_probe p ON (result.food->>'id')::uuid = p.food_id
      ),
      'refreshSeesCurated', EXISTS (
        SELECT 1
        FROM nutrition.food_preference_search_targets target
        JOIN c410_probe p ON p.user_id = target.user_id AND p.food_id = target.food_id
        WHERE target.source = 'profile_allergy' AND target.match_type = 'allergy'
      )
    );
    ROLLBACK;
  `)

  assert.deepEqual(result, {
    foodSearchSeesCurated: true,
    refreshSeesCurated: true,
  })
})
