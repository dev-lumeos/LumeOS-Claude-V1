import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const container = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const db = process.env.LUMEOS_C491_DATABASE
if (!db) throw new Error('C-491 braucht LUMEOS_C491_DATABASE.')

function one<T>(sql: string): T {
  const output = execFileSync('docker', [
    'exec', container, 'psql', '-X', '-q', '-v', 'ON_ERROR_STOP=1', '-U', 'postgres', '-d', db,
    '-t', '-A', '-c', sql,
  ], { encoding: 'utf8' }).trim()
  return JSON.parse(output.split(/\r?\n/).at(-1) ?? '') as T
}

test('C-491: jede verbliebene Wurzelzuordnung ist einzeln begruendet', () => {
  const result = one<{
    notes: number
    resolved: number
    unresolved: number
    remaining_roots: number
    unnoted_roots: number
    seed_leaf_heads: number
  }>(`
    WITH roots AS (
      SELECT em.exercise_id, em.muscle_group_id, em.role
      FROM training.exercise_muscles em
      JOIN training.muscle_groups mg ON mg.id = em.muscle_group_id
      WHERE mg.parent_id IS NULL
    )
    SELECT json_build_object(
      'notes', (SELECT count(*) FROM training.exercise_muscle_resolution_notes),
      'resolved', (SELECT count(*) FROM training.exercise_muscle_resolution_notes WHERE resolution = 'resolved'),
      'unresolved', (SELECT count(*) FROM training.exercise_muscle_resolution_notes WHERE resolution = 'unresolved'),
      'remaining_roots', (SELECT count(*) FROM roots),
      'unnoted_roots', (
        SELECT count(*) FROM roots r
        LEFT JOIN training.exercise_muscle_resolution_notes n
          ON n.exercise_id = r.exercise_id
         AND n.original_muscle_group_id = r.muscle_group_id
         AND n.role = r.role
        WHERE n.resolution <> 'unresolved' OR n.exercise_id IS NULL
      ),
      'seed_leaf_heads', (
        SELECT count(*)
        FROM training.exercise_muscles em
        JOIN training.exercises e ON e.id = em.exercise_id
        JOIN training.muscle_groups mg ON mg.id = em.muscle_group_id
        WHERE e.name IN ('Band Deadlift', 'Barbell  squat back POV', 'Barbell bench press incline')
          AND mg.name IN ('Clavicular Head', 'Gluteus Medius', 'Semimembranosus', 'Semitendinosus')
      )
    );
  `)

  assert.equal(result.notes, 1105)
  assert.equal(result.resolved, 1101)
  assert.equal(result.unresolved, 4)
  assert.equal(result.remaining_roots, 4)
  assert.equal(result.unnoted_roots, 0)
  assert.equal(result.seed_leaf_heads, 0)
})
