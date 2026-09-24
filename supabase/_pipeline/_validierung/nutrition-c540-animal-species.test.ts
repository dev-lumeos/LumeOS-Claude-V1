// C-540: Explicitly named animal kinds become a read-only, multi-value catalog
// relation. This test runs only against the disposable pipeline database.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const container = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const database = process.env.LUMEOS_C540_DATABASE

if (!database || database === 'postgres') {
  throw new Error('C-540 braucht LUMEOS_C540_DATABASE als Wegwerf-Datenbank.')
}

function one<T>(sql: string): T {
  const output = execFileSync('docker', [
    'exec', container, 'psql', '-X', '-q', '-v', 'ON_ERROR_STOP=1', '-U', 'postgres', '-d', database,
    '-t', '-A', '-c', sql,
  ], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }).trim()
  return JSON.parse(output.split(/\r?\n/).at(-1) ?? '') as T
}

test('C-540: animal species are canonical, read-only, multi-value and do not enter food search', () => {
  const result = one<{
    speciesTable: boolean
    relationTable: boolean
    speciesColumns: string[]
    relationColumns: string[]
    speciesRls: boolean
    relationRls: boolean
    speciesPolicies: string[]
    relationPolicies: string[]
    speciesCount: number
    scopeFoods: number
    assignedFoods: number
    unassignedFoods: number
    pairs: number
    triples: number
    chickenAndPouletSame: boolean
    chickenAndTurkeyDifferent: boolean
    anonCanReadSpecies: boolean
    anonCanReadRelations: boolean
    haselnussIsHare: boolean
    foodSearchUsesAnimalSpecies: boolean
  }>(`
    WITH RECURSIVE category_tree AS (
      SELECT id FROM nutrition.food_categories WHERE slug = 'fleisch-gefluegel'
      UNION ALL
      SELECT child.id
      FROM nutrition.food_categories child
      JOIN category_tree parent ON child.parent_id = parent.id
    ), scope AS (
      SELECT f.id FROM nutrition.foods f JOIN category_tree c ON c.id = f.category_id
    ), assignment_count AS (
      SELECT fas.food_id, count(*)::integer AS count
      FROM nutrition.food_animal_species fas
      GROUP BY fas.food_id
    ), scope_assignment_count AS (
      SELECT assignments.food_id, assignments.count
      FROM assignment_count assignments
      JOIN scope s ON s.id = assignments.food_id
    )
    SELECT json_build_object(
      'speciesTable', to_regclass('nutrition.animal_species') IS NOT NULL,
      'relationTable', to_regclass('nutrition.food_animal_species') IS NOT NULL,
      'speciesColumns', (SELECT coalesce(json_agg(column_name ORDER BY ordinal_position), '[]'::json)
                         FROM information_schema.columns
                         WHERE table_schema = 'nutrition' AND table_name = 'animal_species'),
      'relationColumns', (SELECT coalesce(json_agg(column_name ORDER BY ordinal_position), '[]'::json)
                          FROM information_schema.columns
                          WHERE table_schema = 'nutrition' AND table_name = 'food_animal_species'),
      'speciesRls', (SELECT relrowsecurity FROM pg_class WHERE oid = 'nutrition.animal_species'::regclass),
      'relationRls', (SELECT relrowsecurity FROM pg_class WHERE oid = 'nutrition.food_animal_species'::regclass),
      'speciesPolicies', (SELECT coalesce(json_agg(policyname ORDER BY policyname), '[]'::json)
                          FROM pg_policies WHERE schemaname = 'nutrition' AND tablename = 'animal_species'),
      'relationPolicies', (SELECT coalesce(json_agg(policyname ORDER BY policyname), '[]'::json)
                           FROM pg_policies WHERE schemaname = 'nutrition' AND tablename = 'food_animal_species'),
      'speciesCount', (SELECT count(*)::integer FROM nutrition.animal_species),
      'scopeFoods', (SELECT count(*)::integer FROM scope),
      'assignedFoods', (SELECT count(*)::integer FROM scope_assignment_count),
      'unassignedFoods', (SELECT count(*)::integer FROM scope s
                          WHERE NOT EXISTS (SELECT 1 FROM scope_assignment_count a WHERE a.food_id = s.id)),
      'pairs', (SELECT count(*)::integer FROM assignment_count WHERE count = 2),
      'triples', (SELECT count(*)::integer FROM assignment_count WHERE count = 3),
      'chickenAndPouletSame', (
        SELECT count(DISTINCT code) = 1
        FROM nutrition.animal_species
        WHERE 'huhn' = ANY(synonyms) OR 'poulet' = ANY(synonyms)
      ),
      'chickenAndTurkeyDifferent', (
        SELECT count(DISTINCT code) = 2
        FROM nutrition.animal_species
        WHERE 'huhn' = ANY(synonyms) OR 'pute' = ANY(synonyms)
      ),
      'anonCanReadSpecies', has_table_privilege('anon', 'nutrition.animal_species', 'SELECT'),
      'anonCanReadRelations', has_table_privilege('anon', 'nutrition.food_animal_species', 'SELECT'),
      'haselnussIsHare', EXISTS (
        SELECT 1
        FROM nutrition.food_animal_species relation
        JOIN nutrition.foods food ON food.id = relation.food_id
        WHERE relation.animal_species_code = 'hare'
          AND nutrition.search_fold(food.name_de) ~ '\\mhaselnuss'
      ),
      'foodSearchUsesAnimalSpecies', (
        SELECT pg_get_functiondef(p.oid) ILIKE '%animal_species%'
        FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
        WHERE n.nspname = 'nutrition' AND p.proname = 'food_search'
        ORDER BY p.oid DESC LIMIT 1
      )
    );
  `)

  assert.equal(result.speciesTable, true)
  assert.equal(result.relationTable, true)
  assert.deepEqual(result.speciesColumns, ['code', 'name_de', 'name_en', 'name_th', 'synonyms'])
  assert.deepEqual(result.relationColumns, ['food_id', 'animal_species_code', 'source'])
  assert.equal(result.speciesRls, true)
  assert.equal(result.relationRls, true)
  assert.deepEqual(result.speciesPolicies, ['animal_species_select'])
  assert.deepEqual(result.relationPolicies, ['food_animal_species_select'])
  assert.ok(result.speciesCount >= 18)
  assert.equal(result.scopeFoods, 1449)
  assert.ok(result.assignedFoods > 0)
  assert.ok(result.unassignedFoods > 0, 'nicht explizite Tiere bleiben gemeldet statt geraten')
  assert.ok(result.pairs >= 53, 'alle 53 gemessenen Zweifach-Foods tragen beide Arten')
  assert.equal(result.triples, 1)
  assert.equal(result.chickenAndPouletSame, true)
  assert.equal(result.chickenAndTurkeyDifferent, true)
  assert.equal(result.anonCanReadSpecies, false)
  assert.equal(result.anonCanReadRelations, false)
  assert.equal(result.haselnussIsHare, false, 'Haselnuss darf nie als Hase zugeordnet werden')
  assert.equal(result.foodSearchUsesAnimalSpecies, false)
})
