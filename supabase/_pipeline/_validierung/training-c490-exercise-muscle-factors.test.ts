import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const container = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const db = process.env.PGDATABASE
if (!db || db === 'postgres') throw new Error('C-490 braucht PGDATABASE.')

function one<T>(sql: string): T {
  const output = execFileSync('docker', [
    'exec', container, 'psql', '-X', '-q', '-v', 'ON_ERROR_STOP=1', '-U', 'postgres', '-d', db,
    '-t', '-A', '-c', sql,
  ], { encoding: 'utf8' }).trim()
  return JSON.parse(output.split(/\r?\n/).at(-1) ?? '') as T
}

test('C-490/C-551: konkrete Aktivierung ist optional und belegt', () => {
  const result = one<{
    fields: string[]
    measured: number
    unmeasured: number
    invalid: number
    conventionMixedIn: number
    bench: Array<{ muscle: string; factor: number; evidence_class: string; source_id: string }>
  }>(`
    SELECT json_build_object(
      'fields', (
        SELECT coalesce(json_agg(column_name ORDER BY column_name), '[]'::json)
        FROM information_schema.columns
        WHERE table_schema = 'training' AND table_name = 'exercise_muscles'
          AND column_name = ANY (ARRAY[
            'activation_factor',
            'activation_source_id',
            'activation_evidence_class'
          ])
      ),
      'measured', (
        SELECT count(*) FROM training.exercise_muscles
        WHERE activation_factor IS NOT NULL
      ),
      'unmeasured', (
        SELECT count(*) FROM training.exercise_muscles
        WHERE activation_factor IS NULL
      ),
      'invalid', (
        SELECT count(*) FROM training.exercise_muscles
        WHERE num_nonnulls(
          activation_factor,
          activation_source_id,
          activation_evidence_class
        ) NOT IN (0, 3)
           OR activation_factor <= 0
           OR activation_evidence_class NOT IN ('A', 'B')
      ),
      'conventionMixedIn', (
        SELECT count(*) FROM training.exercise_muscles
        WHERE activation_source_id = 'pelland_2026_fractional_sets'
      ),
      'bench', (
        SELECT coalesce(json_agg(json_build_object(
          'muscle', mg.name, 'factor', em.activation_factor,
          'evidence_class', em.activation_evidence_class,
          'source_id', em.activation_source_id
        ) ORDER BY mg.name), '[]'::json)
        FROM training.exercise_muscles em
        JOIN training.exercises e ON e.id = em.exercise_id
        JOIN training.muscle_groups mg ON mg.id = em.muscle_group_id
        WHERE e.name = 'Barbell Bench Press'
          AND em.activation_factor IS NOT NULL
      )
    );
  `)

  assert.deepEqual(result.fields, [
    'activation_evidence_class',
    'activation_factor',
    'activation_source_id',
  ])
  assert.equal(result.measured, 3)
  assert.equal(result.unmeasured, 6723)
  assert.equal(result.invalid, 0)
  assert.equal(result.conventionMixedIn, 0)
  assert.deepEqual(result.bench, [
    { muscle: 'Anterior Deltoid', factor: 0.79, evidence_class: 'A', source_id: 'pmc4327372_bench_press_emg' },
    { muscle: 'Pectoralis Major', factor: 0.95, evidence_class: 'A', source_id: 'pmc4327372_bench_press_emg' },
    { muscle: 'Triceps', factor: 0.67, evidence_class: 'A', source_id: 'pmc4327372_bench_press_emg' },
  ])
})
