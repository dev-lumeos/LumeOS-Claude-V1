import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const container = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const db = process.env.PGDATABASE
if (!db || db === 'postgres') throw new Error('C-543 braucht PGDATABASE.')

function one<T>(sql: string): T {
  const output = execFileSync('docker', [
    'exec', container, 'psql', '-X', '-q', '-v', 'ON_ERROR_STOP=1', '-U', 'postgres', '-d', db,
    '-t', '-A', '-c', sql,
  ], { encoding: 'utf8' }).trim()
  const payload = output.match(/\{[\s\S]*\}/)?.[0]
  if (!payload) throw new Error(`Kein JSON-Ergebnis: ${output}`)
  return JSON.parse(payload) as T
}

test('C-543: die Vererbung ist ein Leseweg und veraendert keine Grundzuordnung', () => {
  const result = one<{
    viewExists: boolean
    baseMappings: number
    effectivePairs: number
    duplicatePairs: number
    aliasTargets: number
    aliasSources: number
  }>(`
    SELECT json_build_object(
      'viewExists', to_regclass('training.muscle_exercises_effective') IS NOT NULL,
      'baseMappings', (SELECT count(*) FROM training.exercise_muscles),
      'effectivePairs', (SELECT count(*) FROM training.muscle_exercises_effective),
      'duplicatePairs', (
        SELECT count(*) FROM (
          SELECT muscle_group_id, exercise_id
          FROM training.muscle_exercises_effective
          GROUP BY muscle_group_id, exercise_id
          HAVING count(*) > 1
        ) AS duplicates
      ),
      'aliasTargets', (
        SELECT count(*)
        FROM training.muscle_exercises_effective effective
        JOIN training.muscle_groups muscle ON muscle.id = effective.muscle_group_id
        WHERE muscle.canonical_muscle_group_id IS NOT NULL
      ),
      'aliasSources', (
        SELECT count(*)
        FROM training.muscle_exercises_effective effective
        CROSS JOIN LATERAL jsonb_array_elements(effective.contributions) contribution
        JOIN training.muscle_groups muscle
          ON muscle.id = (contribution->>'source_muscle_group_id')::uuid
        WHERE muscle.canonical_muscle_group_id IS NOT NULL
      )
    );
  `)

  assert.deepEqual(result, {
    viewExists: true,
    baseMappings: 6726,
    effectivePairs: 23402,
    duplicatePairs: 0,
    aliasTargets: 0,
    aliasSources: 0,
  })
})

test('C-543: Kinder erben, Eltern sammeln und direkte Fakten schlagen indirekte', () => {
  const result = one<{
    vastusLateralis: number
    vastusInherited: number
    legs: number
    pectoralisMajor: number
    clavicularHead: number
    directMixedWithIndirect: number
  }>(`
    SELECT json_build_object(
      'vastusLateralis', (
        SELECT count(*)
        FROM training.muscle_exercises_effective effective
        JOIN training.muscle_groups muscle ON muscle.id = effective.muscle_group_id
        WHERE muscle.name = 'Vastus Lateralis'
      ),
      'vastusInherited', (
        SELECT count(*)
        FROM training.muscle_exercises_effective effective
        JOIN training.muscle_groups muscle ON muscle.id = effective.muscle_group_id
        WHERE muscle.name = 'Vastus Lateralis'
          AND effective.is_inherited
      ),
      'legs', (
        SELECT count(*)
        FROM training.muscle_exercises_effective effective
        JOIN training.muscle_groups muscle ON muscle.id = effective.muscle_group_id
        WHERE muscle.name = 'Legs'
      ),
      'pectoralisMajor', (
        SELECT count(*)
        FROM training.muscle_exercises_effective effective
        JOIN training.muscle_groups muscle ON muscle.id = effective.muscle_group_id
        WHERE muscle.name = 'Pectoralis Major'
      ),
      'clavicularHead', (
        SELECT count(*)
        FROM training.muscle_exercises_effective effective
        JOIN training.muscle_groups muscle ON muscle.id = effective.muscle_group_id
        WHERE muscle.name = 'Clavicular Head of Pectoralis Major'
      ),
      'directMixedWithIndirect', (
        SELECT count(*)
        FROM training.muscle_exercises_effective effective
        WHERE effective.is_direct
          AND EXISTS (
            SELECT 1
            FROM jsonb_array_elements(effective.contributions) contribution
            WHERE contribution->>'relation_kind' <> 'direct'
          )
      )
    );
  `)

  assert.deepEqual(result, {
    vastusLateralis: 356,
    vastusInherited: 356,
    legs: 613,
    pectoralisMajor: 252,
    clavicularHead: 252,
    directMixedWithIndirect: 0,
  })
})

test('C-543/C-551: geerbte Rollenregel und Messung entsprechen ihrer Grundzuordnung', () => {
  const result = one<{
    inheritedContributions: number
    changedRoleFactors: number
    changedMeasurements: number
    unmarkedIndirect: number
  }>(`
    WITH expanded AS (
      SELECT
        effective.muscle_group_id,
        effective.exercise_id,
        contribution
      FROM training.muscle_exercises_effective effective
      CROSS JOIN LATERAL jsonb_array_elements(effective.contributions) contribution
    )
    SELECT json_build_object(
      'inheritedContributions', count(*) FILTER (
        WHERE contribution->>'relation_kind' = 'inherited_ancestor'
      ),
      'changedRoleFactors', count(*) FILTER (
        WHERE (contribution->>'weekly_volume_factor')::numeric
          IS DISTINCT FROM rule.weekly_volume_factor
      ),
      'changedMeasurements', count(*) FILTER (
        WHERE (contribution->>'activation_factor')::numeric
          IS DISTINCT FROM source.activation_factor
      ),
      'unmarkedIndirect', count(*) FILTER (
        WHERE contribution->>'relation_kind' <> 'direct'
          AND NOT coalesce((contribution->>'inherited')::boolean, false)
      )
    )
    FROM expanded
    JOIN training.exercise_muscles source
      ON source.exercise_id = expanded.exercise_id
     AND source.muscle_group_id = (expanded.contribution->>'source_muscle_group_id')::uuid
     AND source.role = expanded.contribution->>'role'
    JOIN training.muscle_role_volume_rules rule ON rule.role = source.role;
  `)

  assert.ok(result.inheritedContributions > 0)
  assert.equal(result.changedRoleFactors, 0)
  assert.equal(result.changedMeasurements, 0)
  assert.equal(result.unmarkedIndirect, 0)
})

test('C-543: nur authentifizierte Leser und service_role duerfen die Sicht lesen', () => {
  const result = one<{
    anonCanSelect: boolean
    authenticatedCanSelect: boolean
    serviceRoleCanSelect: boolean
    serviceRoleCanUpdate: boolean
  }>(`
    SELECT json_build_object(
      'anonCanSelect', has_table_privilege('anon', 'training.muscle_exercises_effective', 'SELECT'),
      'authenticatedCanSelect', has_table_privilege('authenticated', 'training.muscle_exercises_effective', 'SELECT'),
      'serviceRoleCanSelect', has_table_privilege('service_role', 'training.muscle_exercises_effective', 'SELECT'),
      'serviceRoleCanUpdate', has_table_privilege('service_role', 'training.muscle_exercises_effective', 'UPDATE')
    );
  `)

  assert.deepEqual(result, {
    anonCanSelect: false,
    authenticatedCanSelect: true,
    serviceRoleCanSelect: true,
    serviceRoleCanUpdate: false,
  })
})
