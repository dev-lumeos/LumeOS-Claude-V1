// C-391/C-390: Der Suchvertrag legt den Treffergrund offen; die Taggruppe lebt an der Definition.
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

type Probe = {
  potatoCodes: string[]
  potatoReasons: Array<Record<string, string> | null>
  potatoTop: { blsCode: string; sortWeight: number }
  nameReason: Record<string, string>
  aliasReason: Record<string, string>
  tagGroups: Record<string, string | null>
}

test('C-391/C-390: Suchtreffer erklären ihren Weg, Tagdefinitionen ihre Filtergruppe', () => {
  const result = one<Probe>(`
    WITH potato AS (
      SELECT nutrition.food_search(
        'kartoffelstock', 'kartoffelstock', ARRAY['kartoffelstock'], NULL, '', NULL, '',
        'relevance', 20, 0, NULL, NULL, false,
        '[["kartoffelbrei", "kartoffelpueree"]]'::jsonb, NULL, '{}'::jsonb
      )::jsonb AS value
    ), exact_name AS (
      SELECT nutrition.food_search(
        'Kartoffelpüree Instantpulver', 'kartoffelpueree instantpulver', ARRAY['kartoffelpueree', 'instantpulver'], NULL, '', NULL, '',
        'relevance', 1, 0, NULL, NULL, false, NULL, NULL, '{}'::jsonb
      )::jsonb AS value
    ), exact_alias AS (
      SELECT nutrition.food_search(
        'basmatireis', 'basmatireis', ARRAY['basmatireis'], NULL, '', NULL, '',
        'relevance', 1, 0, NULL, NULL, false, NULL, NULL, '{}'::jsonb
      )::jsonb AS value
    )
    SELECT json_build_object(
      'potatoCodes', (
        SELECT json_agg(food->>'bls_code' ORDER BY position)
        FROM potato
        CROSS JOIN LATERAL jsonb_array_elements(value->'foods') WITH ORDINALITY AS item(food, position)
      ),
      'potatoReasons', (
        SELECT json_agg(food->'match_reason' ORDER BY position)
        FROM potato
        CROSS JOIN LATERAL jsonb_array_elements(value->'foods') WITH ORDINALITY AS item(food, position)
      ),
      'potatoTop', (
        SELECT json_build_object('blsCode', food->>'bls_code', 'sortWeight', (food->>'sort_weight')::integer)
        FROM potato
        CROSS JOIN LATERAL jsonb_array_elements(value->'foods') WITH ORDINALITY AS item(food, position)
        WHERE position = 1
      ),
      'nameReason', (SELECT value->'foods'->0->'match_reason' FROM exact_name),
      'aliasReason', (SELECT value->'foods'->0->'match_reason' FROM exact_alias),
      'tagGroups', (
        SELECT json_object_agg(code, to_jsonb(td)->>'filter_group' ORDER BY code)
        FROM nutrition.tag_definitions td
      )
    );
  `)

  assert.equal(result.potatoReasons.length, 16)
  assert.deepEqual(result.potatoCodes, [
    'K213000', 'X6A2000', 'X5B1100', 'X635053', 'X639012', 'X634012', 'X698212', 'X638012',
    'X636012', 'X637012', 'X636043', 'X5B1130', 'X5B1140', 'X5B1110', 'X5B1120', 'X5B1160',
  ])
  assert.deepEqual(result.potatoReasons[0], {
    kind: 'synonym',
    term: 'kartoffelstock',
    matched_term: 'kartoffelpueree',
    source: 'openthesaurus',
  })
  assert.ok(result.potatoReasons.every(Boolean), 'jeder Treffer hat einen match_reason')
  assert.deepEqual(result.potatoTop, { blsCode: 'K213000', sortWeight: 450 })
  assert.deepEqual(result.nameReason, { kind: 'name_exact' })
  assert.deepEqual(result.aliasReason, { kind: 'alias_exact', source: 'curated_suchbegriff' })
  assert.deepEqual(result.tagGroups, {
    contains_gluten: 'allergen',
    contains_lactose: 'allergen',
    contains_nuts: 'allergen',
    halal: 'dietary_pattern',
    high_fiber: 'nutrient',
    high_protein: 'nutrient',
    kosher: 'dietary_pattern',
    low_carb: 'nutrient',
    low_fat: 'nutrient',
    thai_food: 'dietary_pattern',
    ultra_processed: 'processing',
    vegan: 'dietary_pattern',
    vegetarian: 'dietary_pattern',
    whole_food: 'processing',
  })
})
