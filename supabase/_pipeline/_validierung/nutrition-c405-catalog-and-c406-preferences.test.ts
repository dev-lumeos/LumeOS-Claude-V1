// C-405/E-63 und C-406: Kataloggruppen und nicht erreichbare Praeferenzstufe.
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

test('C-405: CHORL und NT leeren Sonstige ohne falschen Protein-Ast', () => {
  const result = one<{
    rows: Array<{ code: string; group_de: string; parent_code: string | null }>
    sonstige: number
    roots: number
    children: number
    chorlDefinition: boolean
  }>(`
    SELECT json_build_object(
      'rows', (
        SELECT json_agg(json_build_object(
          'code', code, 'group_de', group_de, 'parent_code', parent_code
        ) ORDER BY code)
        FROM nutrition.nutrient_defs
        WHERE code IN ('CHORL', 'NT')
      ),
      'sonstige', (
        SELECT count(*)::integer
        FROM nutrition.nutrient_defs
        WHERE group_de = 'Sonstige Nährstoffe'
      ),
      'roots', (
        SELECT count(*)::integer FROM nutrition.nutrient_defs WHERE parent_code IS NULL
      ),
      'children', (
        SELECT count(*)::integer FROM nutrition.nutrient_defs WHERE parent_code IS NOT NULL
      ),
      'chorlDefinition', (
        SELECT EXISTS(SELECT 1 FROM nutrition.nutrient_defs WHERE code = 'CHORL')
      )
    );
  `)

  assert.deepEqual(result.rows, [
    { code: 'CHORL', group_de: 'Fettbegleitstoffe', parent_code: null },
    { code: 'NT', group_de: 'Makronährstoffe', parent_code: null },
  ])
  assert.equal(result.sonstige, 0)
  assert.equal(result.roots, 41)
  assert.equal(result.children, 97)
  assert.equal(result.chorlDefinition, true)
})

test('C-406: strong_avoid ist kein Datenwert und Intoleranzen bleiben im Suchpfad', () => {
  const result = one<{
    strengthCheck: string
    functionsWithStrongAvoid: number
    functionsWithIntolerances: number
  }>(`
    SELECT json_build_object(
      'strengthCheck', (
        SELECT pg_get_constraintdef(oid)
        FROM pg_constraint
        WHERE conrelid = 'nutrition.food_preference_items'::regclass
          AND conname = 'food_preference_items_strength_check'
      ),
      'functionsWithStrongAvoid', (
        SELECT count(*)::integer
        FROM pg_proc p
        JOIN pg_namespace n ON n.oid = p.pronamespace
        WHERE n.nspname = 'nutrition'
          AND p.prokind = 'f'
          AND pg_get_functiondef(p.oid) LIKE '%strong_avoid%'
      ),
      'functionsWithIntolerances', (
        SELECT count(*)::integer
        FROM pg_proc p
        JOIN pg_namespace n ON n.oid = p.pronamespace
        WHERE n.nspname = 'nutrition'
          AND p.prokind = 'f'
          AND pg_get_functiondef(p.oid) LIKE '%intolerances%'
      )
    );
  `)

  assert.doesNotMatch(result.strengthCheck, /strong_avoid/)
  assert.equal(result.functionsWithStrongAvoid, 0)
  assert.ok(result.functionsWithIntolerances > 0)
})
