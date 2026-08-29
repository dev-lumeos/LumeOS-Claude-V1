// C-347: Generelle Ausschluesse filtern nur ohne Suchbegriff und staffeln mit Suchbegriff.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const CONTAINER = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const DB = process.env.PGDATABASE ?? 'postgres'
const GENERAL_USER = 'c3470000-0000-0000-0000-000000000001'
const ALLERGY_USER = 'c3470000-0000-0000-0000-000000000002'
const CLEAN_USER = 'c3470000-0000-0000-0000-000000000003'

function probe(): {
  baseTotal: number
  generalTotal: number
  generalNames: string[]
  generalDepths: number[]
  genericSources: string[]
  emptyBaseTotal: number
  emptyGeneralTotal: number
  allergyTotal: number
  noPreferenceIds: string[]
  cleanUserIds: string[]
} {
  const sql = `
    BEGIN;
    DELETE FROM nutrition.food_preference_search_targets
    WHERE user_id IN ('${GENERAL_USER}'::uuid, '${ALLERGY_USER}'::uuid, '${CLEAN_USER}'::uuid);
    DELETE FROM nutrition.food_preferences
    WHERE user_id IN ('${GENERAL_USER}'::uuid, '${ALLERGY_USER}'::uuid, '${CLEAN_USER}'::uuid);

    INSERT INTO nutrition.food_preferences (user_id, allergies, general_exclusions)
    VALUES
      ('${GENERAL_USER}'::uuid, '{}'::text[], ARRAY['ultra_processed', 'contains_nuts']),
      ('${ALLERGY_USER}'::uuid, ARRAY['tree_nuts'], '{}'::text[]),
      ('${CLEAN_USER}'::uuid, '{}'::text[], '{}'::text[]);

    SELECT nutrition.refresh_food_preference_search_targets('${GENERAL_USER}'::uuid);
    SELECT nutrition.refresh_food_preference_search_targets('${ALLERGY_USER}'::uuid);
    SELECT nutrition.refresh_food_preference_search_targets('${CLEAN_USER}'::uuid);

    WITH searches AS (
      SELECT
        nutrition.food_search('schokolade', 'schokolade', ARRAY['schokolade'], NULL, NULL, NULL, NULL, 'relevance', 100, 0, NULL, NULL, false, NULL, NULL, NULL)::jsonb AS base_search,
        nutrition.food_search('schokolade', 'schokolade', ARRAY['schokolade'], NULL, NULL, NULL, NULL, 'relevance', 100, 0, NULL, NULL, false, NULL, '${GENERAL_USER}'::uuid, NULL)::jsonb AS general_search,
        nutrition.food_search('schokolade', 'schokolade', ARRAY['schokolade'], NULL, NULL, NULL, NULL, 'relevance', 100, 150, NULL, NULL, false, NULL, '${GENERAL_USER}'::uuid, NULL)::jsonb AS general_tail_search,
        nutrition.food_search('schokolade', 'schokolade', ARRAY['schokolade'], NULL, NULL, NULL, NULL, 'relevance', 100, 0, NULL, NULL, false, NULL, '${ALLERGY_USER}'::uuid, NULL)::jsonb AS allergy_search,
        nutrition.food_search('', '', ARRAY[]::text[], NULL, NULL, NULL, NULL, 'relevance', 100, 0, NULL, NULL, false, NULL, NULL, NULL)::jsonb AS empty_base_search,
        nutrition.food_search('', '', ARRAY[]::text[], NULL, NULL, NULL, NULL, 'relevance', 100, 0, NULL, NULL, false, NULL, '${GENERAL_USER}'::uuid, NULL)::jsonb AS empty_general_search,
        nutrition.food_search('schokolade', 'schokolade', ARRAY['schokolade'], NULL, NULL, NULL, NULL, 'relevance', 100, 0, NULL, NULL, false, NULL, '${CLEAN_USER}'::uuid, NULL)::jsonb AS clean_search
    ), general_foods AS (
      SELECT (f->>'id')::uuid AS food_id, f->>'name_de' AS name_de, n AS rank
      FROM searches, jsonb_array_elements(general_search->'foods') WITH ORDINALITY AS x(f, n)
      UNION ALL
      SELECT (f->>'id')::uuid, f->>'name_de', 100 + n
      FROM searches, jsonb_array_elements(general_tail_search->'foods') WITH ORDINALITY AS x(f, n)
    ), general_depths AS (
      SELECT gf.rank, gf.name_de,
             count(DISTINCT t.source) FILTER (WHERE t.source LIKE 'profile_general_exclusion:%')::int AS depth
      FROM general_foods gf
      LEFT JOIN nutrition.food_preference_search_targets t
        ON t.user_id = '${GENERAL_USER}'::uuid AND t.food_id = gf.food_id
      GROUP BY gf.rank, gf.name_de
    )
    SELECT json_build_object(
      'baseTotal', (base_search->>'total')::int,
      'generalTotal', (general_search->>'total')::int,
      'generalNames', (SELECT COALESCE(json_agg(name_de ORDER BY rank), '[]'::json) FROM general_depths),
      'generalDepths', (SELECT COALESCE(json_agg(depth ORDER BY rank), '[]'::json) FROM general_depths),
      'genericSources', (SELECT COALESCE(json_agg(DISTINCT source ORDER BY source), '[]'::json)
                         FROM nutrition.food_preference_search_targets
                         WHERE user_id = '${GENERAL_USER}'::uuid
                           AND source LIKE 'profile_general_exclusion%'),
      'emptyBaseTotal', (empty_base_search->>'total')::int,
      'emptyGeneralTotal', (empty_general_search->>'total')::int,
      'allergyTotal', (allergy_search->>'total')::int,
      'noPreferenceIds', COALESCE(base_search->'foods', '[]'::jsonb),
      'cleanUserIds', COALESCE(clean_search->'foods', '[]'::jsonb)
    )
    FROM searches;
    ROLLBACK;`

  const output = execFileSync('docker', [
    'exec', CONTAINER,
    'psql', '-X', '-q', '-U', 'postgres', '-d', DB,
    '-t', '-A', '-c', sql,
  ], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }).trim()
  return JSON.parse(output)
}

test('C-347: generelle Ausschluesse ranken mit Textsuche ab, Allergien bleiben hart', () => {
  const result = probe()

  // Alle 162 Schokoladen tragen ultra_processed. Auch wenn es keine
  // unbelasteten Treffer gibt, bleibt die Suche vollstaendig und die
  // bestehende Relevanzordnung entscheidet innerhalb derselben Tiefe.
  assert.equal(result.baseTotal, 162)
  assert.equal(result.generalTotal, result.baseTotal)
  assert.ok(result.generalDepths.includes(1))
  assert.ok(result.generalDepths.includes(2))
  assert.deepEqual([...result.generalDepths].sort((a, b) => a - b), result.generalDepths)
  assert.deepEqual(result.genericSources, [
    'profile_general_exclusion:contains_nuts',
    'profile_general_exclusion:ultra_processed',
  ])

  // Ohne Suchabsicht bleiben generelle Ausschluesse Filter. Die Allergie
  // wird dagegen auch mit Suchbegriff nicht nach hinten gestellt.
  assert.ok(result.emptyGeneralTotal < result.emptyBaseTotal)
  assert.equal(result.allergyTotal, result.baseTotal - 10)

  // Ein Profil ohne Ausschluesse veraendert die vorhandene Rangfolge nicht.
  assert.deepEqual(result.cleanUserIds, result.noPreferenceIds)
})
