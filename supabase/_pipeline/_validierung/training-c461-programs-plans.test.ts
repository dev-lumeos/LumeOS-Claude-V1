import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const DB = process.env.LUMEOS_C461_DATABASE
if (!DB || DB === 'postgres') throw new Error('C-461 braucht LUMEOS_C461_DATABASE als Wegwerf-Datenbank.')

function sql<T>(statement: string): T {
  const out = execFileSync('docker', [
    'exec', 'supabase_db_LumeOS-Claude-V1', 'psql', '-X', '-q', '-v', 'ON_ERROR_STOP=1',
    '-U', 'postgres', '-d', DB, '-t', '-A', '-c', statement,
  ], { encoding: 'utf8' }).trim()
  return JSON.parse(out.slice(out.indexOf('{'))) as T
}

test('C-461: Programm, Zuweisung und Programmtag gehoeren nur dem zugewiesenen Nutzer', () => {
  const result = sql<{
    program: number
    block: number
    day: number
    routineExercise: number
    assignment: string
    linkedSession: number
    foreignPrograms: number
    foreignAssignments: number
    foreignRoutineLinkDenied: boolean
    anonTriggerExecute: number
    anonProgramDayTriggerExecute: number
    baselineUnlinkedSessions: number
    oldSessions: number
  }>(`
    BEGIN;
    INSERT INTO auth.users(id, email, raw_app_meta_data, created_at) VALUES
      ('c4610000-0000-0000-0000-000000000001', 'owner@example.test', '{}', now()),
      ('c4610000-0000-0000-0000-000000000002', 'other@example.test', '{}', now());
    SET LOCAL ROLE authenticated;
    SELECT set_config('request.jwt.claim.sub', 'c4610000-0000-0000-0000-000000000001', true);
    CREATE TEMP TABLE baseline(unlinked_sessions integer);
    INSERT INTO baseline SELECT count(*) FROM training.workout_sessions WHERE program_assignment_id IS NULL AND program_day_id IS NULL;
    INSERT INTO training.routines(id, user_id, source, name, days_per_week)
    VALUES ('c4610000-0000-0000-0000-000000000010', 'c4610000-0000-0000-0000-000000000001', 'self', 'PPL Push', 3);
    INSERT INTO training.programs(id, user_id, source, name, duration_weeks)
    VALUES ('c4610000-0000-0000-0000-000000000020', 'c4610000-0000-0000-0000-000000000001', 'self', 'PPL 12 Wochen', 12);
    INSERT INTO training.program_blocks(id, program_id, week_start, week_end, label)
    VALUES ('c4610000-0000-0000-0000-000000000030', 'c4610000-0000-0000-0000-000000000020', 1, 4, 'Hypertrophy');
    INSERT INTO training.program_days(id, program_id, routine_id, week_number, day_of_week, label)
    VALUES ('c4610000-0000-0000-0000-000000000040', 'c4610000-0000-0000-0000-000000000020', 'c4610000-0000-0000-0000-000000000010', 1, 1, 'Push');
    INSERT INTO training.routine_exercises(id, routine_id, exercise_id, exercise_order, target_sets, target_reps)
    SELECT 'c4610000-0000-0000-0000-000000000050', 'c4610000-0000-0000-0000-000000000010', id, 1, 3, '8-12'
    FROM training.exercises ORDER BY id LIMIT 1;
    INSERT INTO training.program_assignments(id, program_id, user_id, status, proposed_at)
    VALUES ('c4610000-0000-0000-0000-000000000060', 'c4610000-0000-0000-0000-000000000020', 'c4610000-0000-0000-0000-000000000001', 'proposed', now());
    UPDATE training.program_assignments SET status='confirmed', confirmed_at=now()
    WHERE id='c4610000-0000-0000-0000-000000000060';
    UPDATE training.program_assignments SET status='running', started_at=current_date
    WHERE id='c4610000-0000-0000-0000-000000000060';
    INSERT INTO training.workout_sessions(
      user_id, session_date, started_time, status, total_volume_kg, total_sets, total_reps,
      measurement_source, program_assignment_id, program_day_id
    )
    VALUES ('c4610000-0000-0000-0000-000000000001', current_date, current_time, 'completed',
           0, 0, 0, 'manual', 'c4610000-0000-0000-0000-000000000060', 'c4610000-0000-0000-0000-000000000040');
    SELECT set_config('request.jwt.claim.sub', 'c4610000-0000-0000-0000-000000000002', true);
    INSERT INTO training.routines(id, user_id, source, name)
    VALUES ('c4610000-0000-0000-0000-000000000070', 'c4610000-0000-0000-0000-000000000002', 'self', 'Fremde Routine');
    CREATE TEMP TABLE foreign_read(programs integer, assignments integer);
    INSERT INTO foreign_read SELECT (SELECT count(*) FROM training.programs), (SELECT count(*) FROM training.program_assignments);
    SELECT set_config('request.jwt.claim.sub', 'c4610000-0000-0000-0000-000000000001', true);
    CREATE TEMP TABLE cross_link(denied boolean NOT NULL DEFAULT false);
    INSERT INTO cross_link DEFAULT VALUES;
    GRANT SELECT, UPDATE ON cross_link TO authenticated;
    DO $$ BEGIN
      BEGIN
        INSERT INTO training.program_days(id, program_id, routine_id, week_number, day_of_week, label)
        VALUES ('c4610000-0000-0000-0000-000000000080', 'c4610000-0000-0000-0000-000000000020', 'c4610000-0000-0000-0000-000000000070', 1, 2, 'Nicht erlaubt');
      EXCEPTION WHEN insufficient_privilege THEN
        UPDATE cross_link SET denied = true;
      END;
    END $$;
    RESET ROLE;
    SELECT json_build_object(
      'program', (SELECT count(*) FROM training.programs WHERE name='PPL 12 Wochen'),
      'block', (SELECT count(*) FROM training.program_blocks WHERE label='Hypertrophy'),
      'day', (SELECT count(*) FROM training.program_days WHERE label='Push'),
      'routineExercise', (SELECT count(*) FROM training.routine_exercises),
      'assignment', (SELECT status FROM training.program_assignments),
      'linkedSession', (SELECT count(*) FROM training.workout_sessions WHERE program_assignment_id IS NOT NULL AND program_day_id IS NOT NULL),
      'foreignPrograms', (SELECT programs FROM foreign_read),
      'foreignAssignments', (SELECT assignments FROM foreign_read),
      'foreignRoutineLinkDenied', (SELECT denied FROM cross_link),
      'anonTriggerExecute', (SELECT count(*) FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='training' AND p.proname='validate_program_session_link' AND has_function_privilege('anon', p.oid, 'EXECUTE')),
      'anonProgramDayTriggerExecute', (SELECT count(*) FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='training' AND p.proname='validate_program_day_routine_owner' AND has_function_privilege('anon', p.oid, 'EXECUTE')),
      'baselineUnlinkedSessions', (SELECT unlinked_sessions FROM baseline),
      'oldSessions', (SELECT count(*) FROM training.workout_sessions WHERE program_assignment_id IS NULL AND program_day_id IS NULL)
    );
    ROLLBACK;
  `)
  assert.equal(result.program, 1)
  assert.equal(result.block, 1)
  assert.equal(result.day, 1)
  assert.equal(result.routineExercise, 1)
  assert.equal(result.assignment, 'running')
  assert.equal(result.linkedSession, 1)
  assert.equal(result.foreignPrograms, 0)
  assert.equal(result.foreignAssignments, 0)
  assert.equal(result.foreignRoutineLinkDenied, true)
  assert.equal(result.anonTriggerExecute, 0)
  assert.equal(result.anonProgramDayTriggerExecute, 0)
  assert.equal(result.oldSessions, result.baselineUnlinkedSessions)
})
