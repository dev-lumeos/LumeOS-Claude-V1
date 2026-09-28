import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const container = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const db = process.env.LUMEOS_C551_DATABASE
if (!db) throw new Error('C-551 braucht LUMEOS_C551_DATABASE.')

function one<T>(sql: string): T {
  const output = execFileSync('docker', [
    'exec', container, 'psql', '-X', '-q', '-v', 'ON_ERROR_STOP=1', '-U', 'postgres', '-d', db,
    '-t', '-A', '-c', sql,
  ], { encoding: 'utf8' }).trim()
  return JSON.parse(output.split(/\r?\n/).at(-1) ?? '') as T
}

test('C-551: Rollenregel und Aktivierungsmessung sind getrennte Wahrheiten', () => {
  const result = one<{
    rules: Array<{ role: string; factor: number; source: string }>
    measured: number
    unmeasured: number
    conventionInMeasurement: number
    incompleteMeasurement: number
  }>(`
    SELECT json_build_object(
      'rules', (
        SELECT coalesce(json_agg(json_build_object(
          'role', role,
          'factor', weekly_volume_factor,
          'source', source_id
        ) ORDER BY role), '[]'::json)
        FROM training.muscle_role_volume_rules
      ),
      'measured', count(*) FILTER (WHERE activation_factor IS NOT NULL),
      'unmeasured', count(*) FILTER (WHERE activation_factor IS NULL),
      'conventionInMeasurement', count(*) FILTER (
        WHERE activation_source_id = 'pelland_2026_fractional_sets'
      ),
      'incompleteMeasurement', count(*) FILTER (
        WHERE num_nonnulls(activation_factor, activation_source_id, activation_evidence_class) NOT IN (0, 3)
      )
    )
    FROM training.exercise_muscles;
  `)

  assert.deepEqual(result.rules, [
    { role: 'primary', factor: 1, source: 'pelland_2026_fractional_sets' },
    { role: 'secondary', factor: 0.5, source: 'pelland_2026_fractional_sets' },
  ])
  assert.equal(result.measured, 3)
  assert.equal(result.unmeasured, 6723)
  assert.equal(result.conventionInMeasurement, 0)
  assert.equal(result.incompleteMeasurement, 0)
})

test('C-551: die drei EMG-Messungen bleiben unveraendert', () => {
  const result = one<Array<{
    muscle: string
    factor: number
    evidence_class: string
    source_id: string
  }>>(`
    SELECT coalesce(json_agg(json_build_object(
      'muscle', muscle.name,
      'factor', mapping.activation_factor,
      'evidence_class', mapping.activation_evidence_class,
      'source_id', mapping.activation_source_id
    ) ORDER BY muscle.name), '[]'::json)
    FROM training.exercise_muscles AS mapping
    JOIN training.exercises AS exercise ON exercise.id = mapping.exercise_id
    JOIN training.muscle_groups AS muscle ON muscle.id = mapping.muscle_group_id
    WHERE exercise.name = 'Barbell Bench Press'
      AND mapping.activation_factor IS NOT NULL;
  `)

  assert.deepEqual(result, [
    { muscle: 'Anterior Deltoid', factor: 0.79, evidence_class: 'A', source_id: 'pmc4327372_bench_press_emg' },
    { muscle: 'Pectoralis Major', factor: 0.95, evidence_class: 'A', source_id: 'pmc4327372_bench_press_emg' },
    { muscle: 'Triceps', factor: 0.67, evidence_class: 'A', source_id: 'pmc4327372_bench_press_emg' },
  ])
})

test('C-551: das Rollen-Volumen bleibt 4941 und ignoriert EMG', () => {
  const result = one<{ weightedMappings: number; legacyRoleCalculation: number }>(`
    SELECT json_build_object(
      'weightedMappings', sum(rule.weekly_volume_factor),
      'legacyRoleCalculation', sum(
        CASE mapping.role WHEN 'primary' THEN 1.0 ELSE 0.5 END
      )
    )
    FROM training.exercise_muscles AS mapping
    JOIN training.muscle_role_volume_rules AS rule ON rule.role = mapping.role;
  `)

  assert.equal(result.weightedMappings, 4941)
  assert.equal(result.legacyRoleCalculation, 4941)
})

test('C-551: die effektive Sicht benennt Konvention und Messung getrennt', () => {
  const result = one<{
    contributions: number
    wrongRoleFactor: number
    lostMeasurement: number
    legacyKeys: number
  }>(`
    WITH expanded AS (
      SELECT effective.exercise_id, contribution
      FROM training.muscle_exercises_effective AS effective
      CROSS JOIN LATERAL jsonb_array_elements(effective.contributions) AS contribution
    )
    SELECT json_build_object(
      'contributions', count(*),
      'wrongRoleFactor', count(*) FILTER (
        WHERE (contribution->>'weekly_volume_factor')::numeric
          IS DISTINCT FROM CASE contribution->>'role'
            WHEN 'primary' THEN 1.0 ELSE 0.5
          END
      ),
      'lostMeasurement', count(*) FILTER (
        WHERE source.activation_factor IS NOT NULL
          AND (contribution->>'activation_factor')::numeric IS DISTINCT FROM source.activation_factor
      ),
      'legacyKeys', count(*) FILTER (
        WHERE contribution ? 'faktor'
           OR contribution ? 'source_id'
           OR contribution ? 'evidence_class'
      )
    )
    FROM expanded
    JOIN training.exercise_muscles AS source
      ON source.exercise_id = expanded.exercise_id
     AND source.muscle_group_id = (expanded.contribution->>'source_muscle_group_id')::uuid
     AND source.role = expanded.contribution->>'role';
  `)

  assert.ok(result.contributions > 0)
  assert.equal(result.wrongRoleFactor, 0)
  assert.equal(result.lostMeasurement, 0)
  assert.equal(result.legacyKeys, 0)
})

test('C-551: Katalogregeln sind lesbar, aber nicht anonym oder clientseitig schreibbar', () => {
  const result = one<{
    anonSelect: boolean
    authenticatedSelect: boolean
    authenticatedInsert: boolean
    serviceRoleAll: boolean
    authenticatedSchemaUsage: boolean
  }>(`
    SELECT json_build_object(
      'anonSelect', has_table_privilege('anon', 'training.muscle_role_volume_rules', 'SELECT'),
      'authenticatedSelect', has_table_privilege('authenticated', 'training.muscle_role_volume_rules', 'SELECT'),
      'authenticatedInsert', has_table_privilege('authenticated', 'training.muscle_role_volume_rules', 'INSERT'),
      'serviceRoleAll', has_table_privilege('service_role', 'training.muscle_role_volume_rules', 'SELECT,INSERT,UPDATE,DELETE'),
      'authenticatedSchemaUsage', has_schema_privilege('authenticated', 'training', 'USAGE')
    );
  `)

  assert.deepEqual(result, {
    anonSelect: false,
    authenticatedSelect: true,
    authenticatedInsert: false,
    serviceRoleAll: true,
    authenticatedSchemaUsage: true,
  })
})
