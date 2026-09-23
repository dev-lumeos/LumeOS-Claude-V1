import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const container = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const db = process.env.LUMEOS_C531_DATABASE
if (!db) throw new Error('C-531 braucht LUMEOS_C531_DATABASE.')

function one<T>(sql: string): T {
  const output = execFileSync('docker', [
    'exec', container, 'psql', '-X', '-q', '-v', 'ON_ERROR_STOP=1', '-U', 'postgres', '-d', db,
    '-t', '-A', '-c', sql,
  ], { encoding: 'utf8' }).trim()
  const payload = output.match(/\{[\s\S]*\}/)?.[0]
  if (!payload) throw new Error(`Kein JSON-Ergebnis: ${output}`)
  return JSON.parse(payload) as T
}

test('C-531: der aliasbereinigte Muskelbaum ist ein eigener Leseweg', () => {
  const result = one<{ treeViewExists: boolean }>(`
    SELECT json_build_object(
      'treeViewExists', to_regclass('training.muscle_group_tree') IS NOT NULL
    );
  `)

  assert.deepEqual(result, { treeViewExists: true })
})

test('C-531: der Baum versteckt Aliaszeilen und die Namenssuche liefert ihr kanonisches Ziel', () => {
  const result = one<{
    treeRows: number
    aliasesInTree: number
    aliasesResolved: number
    upperChestCanonical: boolean
    anonCanSelect: boolean
    anonCanExecute: boolean
    authenticatedCanSelect: boolean
    authenticatedCanExecute: boolean
    serviceRoleCanSelect: boolean
    serviceRoleCanUpdate: boolean
  }>(`
    SELECT json_build_object(
      'treeRows', (SELECT count(*) FROM training.muscle_group_tree),
      'aliasesInTree', (
        SELECT count(*)
        FROM training.muscle_group_tree AS tree
        JOIN training.muscle_groups AS source ON source.id = tree.id
        WHERE source.canonical_muscle_group_id IS NOT NULL
      ),
      'aliasesResolved', (
        SELECT count(*)
        FROM training.muscle_groups AS alias_group
        CROSS JOIN LATERAL training.search_muscle_groups(alias_group.name) AS found
        WHERE alias_group.canonical_muscle_group_id IS NOT NULL
          AND found.id = alias_group.canonical_muscle_group_id
          AND found.matched_as_alias
      ),
      'upperChestCanonical', EXISTS (
        SELECT 1
        FROM training.search_muscle_groups('Upper Chest') AS found
        WHERE found.name = 'Clavicular Head of Pectoralis Major'
          AND found.matched_name = 'Upper Chest'
          AND found.matched_as_alias
      ),
      'anonCanSelect', has_table_privilege('anon', 'training.muscle_group_tree', 'SELECT'),
      'anonCanExecute', has_function_privilege('anon', 'training.search_muscle_groups(text)', 'EXECUTE'),
      'authenticatedCanSelect', has_table_privilege('authenticated', 'training.muscle_group_tree', 'SELECT'),
      'authenticatedCanExecute', has_function_privilege('authenticated', 'training.search_muscle_groups(text)', 'EXECUTE'),
      'serviceRoleCanSelect', has_table_privilege('service_role', 'training.muscle_group_tree', 'SELECT'),
      'serviceRoleCanUpdate', has_table_privilege('service_role', 'training.muscle_group_tree', 'UPDATE')
    );
  `)

  assert.deepEqual(result, {
    treeRows: 108,
    aliasesInTree: 0,
    aliasesResolved: 4,
    upperChestCanonical: true,
    anonCanSelect: false,
    anonCanExecute: false,
    authenticatedCanSelect: true,
    authenticatedCanExecute: true,
    serviceRoleCanSelect: true,
    serviceRoleCanUpdate: false,
  })
})
