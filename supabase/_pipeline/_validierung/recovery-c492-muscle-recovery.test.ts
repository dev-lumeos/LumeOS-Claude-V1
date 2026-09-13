import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const container = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const db = process.env.LUMEOS_C492_DATABASE
if (!db) throw new Error('C-492 braucht LUMEOS_C492_DATABASE.')

function one<T>(sql: string): T {
  const output = execFileSync('docker', [
    'exec', container, 'psql', '-X', '-q', '-v', 'ON_ERROR_STOP=1', '-U', 'postgres', '-d', db,
    '-t', '-A', '-c', sql,
  ], { encoding: 'utf8' }).trim()
  return JSON.parse(output.split(/\r?\n/).at(-1) ?? '') as T
}

test('C-492: Basisprofil und Failure-Faktor sind getrennt, nachvollziehbar und rechenbar', () => {
  const result = one<{
    profiles: number
    profile_classes: Record<string, number>
    documented_sets: number
    failure_factor: number
    biceps_hours: number
    erector_hours: number
    biceps_progress_at_36: number
    erector_progress_at_36: number
    authenticated_select: boolean
    anon_select: boolean
    rls: boolean
  }>(`
    SELECT json_build_object(
      'profiles', (SELECT count(*) FROM recovery.muscle_recovery_profiles),
      'profile_classes', (
        SELECT coalesce(json_object_agg(evidence_class, n), '{}'::json)
        FROM (SELECT evidence_class, count(*) AS n FROM recovery.muscle_recovery_profiles GROUP BY evidence_class) x
      ),
      'documented_sets', (
        SELECT count(*) FROM training.workout_sets WHERE rpe IS NOT NULL OR rir IS NOT NULL
      ),
      'failure_factor', (
        SELECT factor FROM recovery.recovery_effort_factors WHERE id = 'rir0_rpe10_failure'
      ),
      'biceps_hours', recovery.muscle_recovery_target_hours(
        (SELECT id FROM training.muscle_groups WHERE name = 'Biceps'), 1::smallint, 9::numeric
      ),
      'erector_hours', recovery.muscle_recovery_target_hours(
        (SELECT id FROM training.muscle_groups WHERE name = 'erector spinae'), 1::smallint, 9::numeric
      ),
      'biceps_progress_at_36', recovery.muscle_recovery_progress(
        (SELECT id FROM training.muscle_groups WHERE name = 'Biceps'), 36::numeric, 1::smallint, 9::numeric
      ),
      'erector_progress_at_36', recovery.muscle_recovery_progress(
        (SELECT id FROM training.muscle_groups WHERE name = 'erector spinae'), 36::numeric, 1::smallint, 9::numeric
      ),
      'authenticated_select', has_table_privilege('authenticated', 'recovery.muscle_recovery_profiles', 'SELECT'),
      'anon_select', has_table_privilege('anon', 'recovery.muscle_recovery_profiles', 'SELECT'),
      'rls', (SELECT relrowsecurity FROM pg_class WHERE oid = 'recovery.muscle_recovery_profiles'::regclass)
    );
  `)

  assert.equal(result.profiles, 105)
  assert.deepEqual(result.profile_classes, { C: 105 })
  assert.ok(result.documented_sets >= 0)
  assert.equal(result.failure_factor, 1.37)
  assert.equal(result.biceps_hours, 36)
  assert.equal(result.erector_hours, 60)
  assert.equal(result.biceps_progress_at_36, 1)
  assert.equal(result.erector_progress_at_36, 0.6)
  assert.equal(result.authenticated_select, true)
  assert.equal(result.anon_select, false)
  assert.equal(result.rls, true)
})
