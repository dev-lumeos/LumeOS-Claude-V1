import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const container = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const db = process.env.LUMEOS_C490_DATABASE
if (!db) throw new Error('C-490 braucht LUMEOS_C490_DATABASE.')

function one<T>(sql: string): T {
  const output = execFileSync('docker', [
    'exec', container, 'psql', '-X', '-q', '-v', 'ON_ERROR_STOP=1', '-U', 'postgres', '-d', db,
    '-t', '-A', '-c', sql,
  ], { encoding: 'utf8' }).trim()
  return JSON.parse(output.split(/\r?\n/).at(-1) ?? '') as T
}

test('C-490: jede Uebung-Muskel-Zuordnung hat belegten Faktor und Herkunft', () => {
  const result = one<{
    fields: string[]
    missing: number
    invalid: number
    fallback: number
    bench: Array<{ muscle: string; factor: number; evidence_class: string; source_id: string }>
  }>(`
    SELECT json_build_object(
      'fields', (
        SELECT coalesce(json_agg(column_name ORDER BY column_name), '[]'::json)
        FROM information_schema.columns
        WHERE table_schema = 'training' AND table_name = 'exercise_muscles'
          AND column_name = ANY (ARRAY['faktor', 'source_id', 'evidence_class'])
      ),
      'missing', (
        SELECT count(*) FROM training.exercise_muscles
        WHERE faktor IS NULL OR source_id IS NULL OR evidence_class IS NULL
      ),
      'invalid', (
        SELECT count(*) FROM training.exercise_muscles
        WHERE faktor <= 0 OR evidence_class NOT IN ('A', 'C')
           OR (faktor NOT IN (1.0, 0.5) AND source_id IS NULL)
      ),
      'fallback', (
        SELECT count(*) FROM training.exercise_muscles
        WHERE evidence_class = 'C'
          AND source_id = 'pelland_2026_fractional_sets'
          AND faktor = CASE role WHEN 'primary' THEN 1.0 WHEN 'secondary' THEN 0.5 END
      ),
      'bench', (
        SELECT coalesce(json_agg(json_build_object(
          'muscle', mg.name, 'factor', em.faktor,
          'evidence_class', em.evidence_class, 'source_id', em.source_id
        ) ORDER BY mg.name), '[]'::json)
        FROM training.exercise_muscles em
        JOIN training.exercises e ON e.id = em.exercise_id
        JOIN training.muscle_groups mg ON mg.id = em.muscle_group_id
        WHERE e.name = 'Barbell Bench Press'
      )
    );
  `)

  assert.deepEqual(result.fields, ['evidence_class', 'faktor', 'source_id'])
  assert.equal(result.missing, 0)
  assert.equal(result.invalid, 0)
  assert.ok(result.fallback > 0)
  assert.deepEqual(result.bench, [
    { muscle: 'Anterior Deltoid', factor: 0.79, evidence_class: 'A', source_id: 'pmc4327372_bench_press_emg' },
    { muscle: 'Pectoralis Major', factor: 0.95, evidence_class: 'A', source_id: 'pmc4327372_bench_press_emg' },
    { muscle: 'Triceps', factor: 0.67, evidence_class: 'A', source_id: 'pmc4327372_bench_press_emg' },
  ])
})
