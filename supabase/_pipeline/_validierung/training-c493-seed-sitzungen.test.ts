import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const container = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const database = process.env.LUMEOS_C493_DATABASE ?? 'postgres'

function scalar(sql: string): string {
  return execFileSync('docker', [
    'exec', container, 'psql', '-X', '-q', '-v', 'ON_ERROR_STOP=1',
    '-U', 'postgres', '-d', database, '-t', '-A', '-c', sql,
  ], { encoding: 'utf8' }).trim()
}

test('C-493: Karten-Seed gehoert nur dev und deckt Last, Pausen und RIR ab', () => {
  assert.equal(scalar(`
    SELECT count(*)
    FROM training.workout_sessions ws
    JOIN auth.users u ON u.id = ws.user_id
    WHERE u.email = 'dev@lumeos.app' AND ws.notes = 'seed-c493';
  `), '10')

  assert.equal(scalar(`
    SELECT count(*)
    FROM training.workout_sessions ws
    JOIN auth.users u ON u.id = ws.user_id
    WHERE u.email = 'dev@lumeos.app';
  `), '40', 'die dreissig vorhandenen dev-Sitzungen bleiben erhalten')

  assert.equal(scalar(`
    SELECT count(*)
    FROM training.workout_sessions ws
    JOIN auth.users u ON u.id = ws.user_id
    WHERE u.email <> 'dev@lumeos.app' AND ws.notes = 'seed-c493';
  `), '0')

  assert.equal(scalar(`
    SELECT min(s.rir) || '|' || max(s.rir) || '|' || min(s.rpe) || '|' || max(s.rpe)
    FROM training.workout_sets s
    JOIN training.workout_exercises we ON we.id = s.workout_exercise_id
    JOIN training.workout_sessions ws ON ws.id = we.workout_session_id
    WHERE ws.notes = 'seed-c493';
  `), '0|5|6.0|10.0')

  assert.equal(scalar(`
    SELECT min(set_count) || '|' || max(set_count)
    FROM (
      SELECT we.id, count(*) AS set_count
      FROM training.workout_exercises we
      JOIN training.workout_sessions ws ON ws.id = we.workout_session_id
      JOIN training.workout_sets s ON s.workout_exercise_id = we.id
      WHERE ws.notes = 'seed-c493'
      GROUP BY we.id
    ) counts;
  `), '3|20')

  assert.equal(scalar(`
    SELECT count(*)
    FROM training.workout_sets s
    JOIN training.workout_exercises we ON we.id = s.workout_exercise_id
    JOIN training.workout_sessions ws ON ws.id = we.workout_session_id
    WHERE ws.notes = 'seed-c493';
  `), '132')

  assert.equal(scalar(`
    SELECT count(DISTINCT session_date)
    FROM training.workout_sessions
    WHERE notes = 'seed-c493'
      AND session_date BETWEEN DATE '2026-09-03' AND DATE '2026-09-13';
  `), '10')
})
