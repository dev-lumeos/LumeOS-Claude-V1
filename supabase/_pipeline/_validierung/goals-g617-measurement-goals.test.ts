// G-617: Nur gegen eine Wegwerf-Datenbank, alle Schreibproben rollen zurueck.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const container = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const db = process.env.PGDATABASE
if (!db || db === 'postgres') throw new Error('G-617 braucht eine Wegwerf-Datenbank.')

function one<T>(sql: string): T {
  const output = execFileSync('docker', [
    'exec', container, 'psql', '-X', '-q', '-v', 'ON_ERROR_STOP=1',
    '-U', 'postgres', '-d', db, '-t', '-A', '-c', sql,
  ], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }).trim()
  return JSON.parse(output.split(/\r?\n/).findLast(line => line.startsWith('{')) ?? '') as T
}

test('G-617/B: gespeicherte Rolle entspricht fuer jeden Bestandsdatensatz Phase oder Plan', () => {
  const result = one<{ mismatches: number; bodyWithoutLink: number }>(`
    SELECT json_build_object(
      'mismatches', (SELECT count(*) FROM goals.user_goals g
        WHERE (g.goal_role = 'controlling') IS DISTINCT FROM (
          EXISTS (SELECT 1 FROM goals.goal_phases gp WHERE gp.goal_id = g.id)
          OR EXISTS (SELECT 1 FROM goals.goal_programs program WHERE program.goal_id = g.id)
        )),
      'bodyWithoutLink', (SELECT count(*) FROM goals.user_goals g
        WHERE g.goal_type = 'body_composition' AND g.goal_role = 'measurement'
          AND NOT EXISTS (SELECT 1 FROM goals.goal_phases gp WHERE gp.goal_id = g.id)
          AND NOT EXISTS (SELECT 1 FROM goals.goal_programs program WHERE program.goal_id = g.id))
    );
  `)
  assert.equal(result.mismatches, 0)
  assert.ok(result.bodyWithoutLink > 0)
})

test('G-617: Bankdruecken mit Umlaut und gewaehlte Kniebeuge lesen die Uebungs-ID', () => {
  const result = one<{
    mapped: number; unmapped: string[]; benchValue: number; benchSource: string
    squatValue: number; wrongExerciseValue: number | null; wrongExerciseStatus: string
    restoredValue: number
  }>(`
    BEGIN;
    UPDATE goals.user_goals SET title = 'Bankdrücken mit Umlaut'
    WHERE id = '30000000-0000-0000-0000-000000000102';
    INSERT INTO goals.user_goals (
      user_id, goal_type, subtype, title, gueltig_ab, status, priority,
      goal_role, exercise_id, measurement_type, target_unit
    ) SELECT id, 'performance', 'strength', 'Kniebeuge 1RM',
      DATE '2026-01-01', 'active', 3, 'measurement',
      '797158aa-daa0-42cd-acc9-9da2fefd9c6f'::uuid, 'e1rm', 'kg'
    FROM auth.users WHERE email = 'tom.seed@example.com';
    CREATE TEMP TABLE g617_before AS
      SELECT p.current_value, p.current_source
      FROM goals.goal_progress_at('30000000-0000-0000-0000-000000000102',
        DATE '2026-10-08') p;
    CREATE TEMP TABLE g617_squat AS
      SELECT p.current_value FROM goals.user_goals g
      CROSS JOIN LATERAL goals.goal_progress_at(g.id, DATE '2026-10-08') p
      WHERE g.title = 'Kniebeuge 1RM';
    UPDATE goals.user_goals
    SET exercise_id = (SELECT id FROM training.exercises
                       WHERE name = 'Barbell Bench Squat' LIMIT 1)
    WHERE id = '30000000-0000-0000-0000-000000000102';
    CREATE TEMP TABLE g617_wrong AS
      SELECT current_value, progress_status
      FROM goals.goal_progress_at('30000000-0000-0000-0000-000000000102',
        DATE '2026-10-08');
    UPDATE goals.user_goals SET exercise_id =
      '765e7a54-1bfe-4bb0-b1d3-e029994d81d7'
    WHERE id = '30000000-0000-0000-0000-000000000102';
    SELECT json_build_object(
      'mapped', (SELECT count(*) FROM goals.user_goals
        WHERE id IN ('30000000-0000-0000-0000-000000000102',
          '30000000-0000-0000-0000-000000000104')
          AND exercise_id = '765e7a54-1bfe-4bb0-b1d3-e029994d81d7'
          AND measurement_type = 'e1rm'),
      'unmapped', (SELECT coalesce(json_agg(title ORDER BY title), '[]'::json)
        FROM goals.user_goals WHERE title = 'Mehr Trainingsleistung'
          AND exercise_id IS NULL),
      'benchValue', (SELECT current_value FROM g617_before),
      'benchSource', (SELECT current_source FROM g617_before),
      'squatValue', (SELECT current_value FROM g617_squat),
      'wrongExerciseValue', (SELECT current_value FROM g617_wrong),
      'wrongExerciseStatus', (SELECT progress_status FROM g617_wrong),
      'restoredValue', (SELECT current_value FROM goals.goal_progress_at(
        '30000000-0000-0000-0000-000000000102', DATE '2026-10-08'))
    );
    ROLLBACK;
  `)
  assert.equal(result.mapped, 2)
  assert.deepEqual(result.unmapped, ['Mehr Trainingsleistung'])
  assert.ok(result.benchValue > 0)
  assert.equal(result.benchSource, 'training.workout_sets.estimated_1rm')
  assert.equal(result.squatValue, 126)
  assert.equal(result.wrongExerciseValue, null)
  assert.equal(result.wrongExerciseStatus, 'no_workout_sets')
  assert.equal(result.restoredValue, result.benchValue)
})

test('G-617/B: Koerperfettziel wechselt mit Phase oder Plan; aktive Steuerung bleibt einmalig', () => {
  const result = one<{
    before: { cut: string; body: string; measurements: number; controls: number }
    blockedPhase: { state: string; constraint: string }
    blockedPlan: { state: string; constraint: string }
    afterPause: { cut: string; body: string; active_controls: number }
    afterPhaseDelete: string
    withPlan: string
    afterPlanDelete: string
    forgedRole: string
    blockedAgain: { state: string; constraint: string }
  }>(`
    BEGIN;
    INSERT INTO auth.users (id, email, raw_app_meta_data, created_at)
    VALUES ('61700000-0000-0000-0000-000000000001',
      'g617@example.test', '{}'::jsonb, now());
    SET LOCAL ROLE authenticated;
    SELECT set_config('request.jwt.claim.sub',
      '61700000-0000-0000-0000-000000000001', true);
    SELECT goals.active_goal_create('body_composition', 'Aktiver Cut', DATE '2099-01-01');
    SELECT goals.active_goal_create('body_composition', '12 % Körperfett', DATE '2099-01-01');
    SELECT goals.active_goal_create('performance', 'Messziel ' || n, DATE '2099-01-01')
    FROM generate_series(1, 4) n;
    INSERT INTO goals.goal_phases (user_id, goal_id, phase_type, gueltig_ab,
      strategie_code, zielrate_pct_kg_woche)
    SELECT auth.uid(), id, 'fat_loss', DATE '2099-01-01', 'moderate_cut', -0.500
    FROM goals.user_goals WHERE user_id = auth.uid() AND title = 'Aktiver Cut';
    CREATE TEMP TABLE g617_before AS SELECT
      (SELECT goal_role FROM goals.user_goals WHERE title = 'Aktiver Cut') cut,
      (SELECT goal_role FROM goals.user_goals WHERE title = '12 % Körperfett') body,
      (SELECT count(*) FROM goals.user_goals WHERE user_id = auth.uid()
        AND status = 'active' AND goal_role = 'measurement') measurements,
      (SELECT count(*) FROM goals.user_goals WHERE user_id = auth.uid()
        AND status = 'active' AND goal_role = 'controlling') controls;
    CREATE TEMP TABLE g617_errors (label text, state text, constraint_name text)
      ON COMMIT DROP;
    GRANT SELECT, INSERT ON g617_errors TO authenticated;
    DO $probe$
    DECLARE v_body uuid;
      v_state text;
      v_constraint text;
    BEGIN
      SELECT id INTO v_body FROM goals.user_goals
      WHERE user_id = auth.uid() AND title = '12 % Körperfett';
      BEGIN
        INSERT INTO goals.goal_phases (user_id, goal_id, phase_type, gueltig_ab)
        VALUES (auth.uid(), v_body, 'peak_week', DATE '2099-01-01');
        INSERT INTO g617_errors VALUES ('phase', 'unexpected_success', '');
      EXCEPTION WHEN OTHERS THEN
        GET STACKED DIAGNOSTICS v_state = RETURNED_SQLSTATE,
          v_constraint = CONSTRAINT_NAME;
        INSERT INTO g617_errors VALUES ('phase', v_state, v_constraint);
      END;
      BEGIN
        INSERT INTO goals.goal_programs (goal_id, name)
        VALUES (v_body, 'Plan waehrend Cut');
        INSERT INTO g617_errors VALUES ('program', 'unexpected_success', '');
      EXCEPTION WHEN OTHERS THEN
        GET STACKED DIAGNOSTICS v_state = RETURNED_SQLSTATE,
          v_constraint = CONSTRAINT_NAME;
        INSERT INTO g617_errors VALUES ('program', v_state, v_constraint);
      END;
    END $probe$;
    UPDATE goals.user_goals SET status = 'paused'
    WHERE user_id = auth.uid() AND title = 'Aktiver Cut';
    INSERT INTO goals.goal_phases (user_id, goal_id, phase_type, gueltig_ab)
    SELECT auth.uid(), id, 'peak_week', DATE '2099-01-01'
    FROM goals.user_goals WHERE user_id = auth.uid() AND title = '12 % Körperfett';
    CREATE TEMP TABLE g617_after_pause AS SELECT
      (SELECT goal_role FROM goals.user_goals WHERE title = 'Aktiver Cut') cut,
      (SELECT goal_role FROM goals.user_goals WHERE title = '12 % Körperfett') body,
      (SELECT count(*) FROM goals.user_goals WHERE user_id = auth.uid()
        AND status = 'active' AND goal_role = 'controlling') active_controls;
    DELETE FROM goals.goal_phases WHERE goal_id =
      (SELECT id FROM goals.user_goals WHERE title = '12 % Körperfett');
    CREATE TEMP TABLE g617_after_phase_delete AS
      SELECT goal_role FROM goals.user_goals WHERE title = '12 % Körperfett';
    INSERT INTO goals.goal_programs (goal_id, name)
    SELECT id, 'Koerperfett-Plan' FROM goals.user_goals
    WHERE title = '12 % Körperfett';
    CREATE TEMP TABLE g617_with_plan AS
      SELECT goal_role FROM goals.user_goals WHERE title = '12 % Körperfett';
    DELETE FROM goals.goal_programs WHERE name = 'Koerperfett-Plan';
    CREATE TEMP TABLE g617_after_plan_delete AS
      SELECT goal_role FROM goals.user_goals WHERE title = '12 % Körperfett';
    UPDATE goals.user_goals SET goal_role = 'controlling'
    WHERE title = '12 % Körperfett';
    CREATE TEMP TABLE g617_forged AS
      SELECT goal_role FROM goals.user_goals WHERE title = '12 % Körperfett';
    UPDATE goals.user_goals SET status = 'active'
    WHERE title = 'Aktiver Cut';
    DO $probe$
    DECLARE v_state text;
      v_constraint text;
    BEGIN
      BEGIN
        INSERT INTO goals.goal_programs (goal_id, name)
        SELECT id, 'Zweiter aktiver Plan' FROM goals.user_goals
        WHERE title = '12 % Körperfett';
        INSERT INTO g617_errors VALUES ('again', 'unexpected_success', '');
      EXCEPTION WHEN OTHERS THEN
        GET STACKED DIAGNOSTICS v_state = RETURNED_SQLSTATE,
          v_constraint = CONSTRAINT_NAME;
        INSERT INTO g617_errors VALUES ('again', v_state, v_constraint);
      END;
    END $probe$;
    SELECT json_build_object(
      'before', (SELECT row_to_json(s) FROM g617_before s),
      'blockedPhase', (SELECT json_build_object('state', state,
        'constraint', constraint_name) FROM g617_errors WHERE label = 'phase'),
      'blockedPlan', (SELECT json_build_object('state', state,
        'constraint', constraint_name) FROM g617_errors WHERE label = 'program'),
      'afterPause', (SELECT row_to_json(s) FROM g617_after_pause s),
      'afterPhaseDelete', (SELECT goal_role FROM g617_after_phase_delete),
      'withPlan', (SELECT goal_role FROM g617_with_plan),
      'afterPlanDelete', (SELECT goal_role FROM g617_after_plan_delete),
      'forgedRole', (SELECT goal_role FROM g617_forged),
      'blockedAgain', (SELECT json_build_object('state', state,
        'constraint', constraint_name) FROM g617_errors WHERE label = 'again')
    );
    ROLLBACK;
  `)
  assert.deepEqual(result.before, {
    cut: 'controlling', body: 'measurement', measurements: 5, controls: 1,
  })
  const blocked = { state: '23505', constraint: 'uq_user_goals_one_active_controlling' }
  assert.deepEqual(result.blockedPhase, blocked)
  assert.deepEqual(result.blockedPlan, blocked)
  assert.deepEqual(result.afterPause, {
    cut: 'controlling', body: 'controlling', active_controls: 1,
  })
  assert.equal(result.afterPhaseDelete, 'measurement')
  assert.equal(result.withPlan, 'controlling')
  assert.equal(result.afterPlanDelete, 'measurement')
  assert.equal(result.forgedRole, 'measurement')
  assert.deepEqual(result.blockedAgain, blocked)
})

test('G-617: Messart statt Titel waehlt Gewicht mal Wiederholungen und Cardio-Metriken', () => {
  const result = one<{
    weightReps: number; duration: number; distance: number; pace: number;
    invalidRepsState: string
  }>(`
    BEGIN;
    UPDATE goals.user_goals SET measurement_type = 'weight_reps',
      measurement_reps = 5, title = 'Beliebiger Name'
    WHERE id = '30000000-0000-0000-0000-000000000102';
    CREATE TEMP TABLE g617_weight AS
      SELECT current_value FROM goals.goal_progress_at(
        '30000000-0000-0000-0000-000000000102', DATE '2026-10-08');
    UPDATE training.workout_sets SET duration_seconds = 600,
      distance_meters = 2000
    WHERE id = (
      SELECT ws.id FROM training.workout_sets ws
      JOIN training.workout_exercises we ON we.id = ws.workout_exercise_id
      JOIN training.workout_sessions s ON s.id = we.workout_session_id
      JOIN auth.users u ON u.id = s.user_id
      WHERE u.email = 'tom.seed@example.com'
        AND we.exercise_id = '797158aa-daa0-42cd-acc9-9da2fefd9c6f'
        AND s.status = 'completed'
      ORDER BY ws.id LIMIT 1
    );
    UPDATE goals.user_goals SET exercise_id =
      '797158aa-daa0-42cd-acc9-9da2fefd9c6f',
      measurement_type = 'duration', measurement_reps = NULL
    WHERE id = '30000000-0000-0000-0000-000000000102';
    CREATE TEMP TABLE g617_cardio (kind text, value numeric) ON COMMIT DROP;
    INSERT INTO g617_cardio SELECT 'duration', current_value
      FROM goals.goal_progress_at(
        '30000000-0000-0000-0000-000000000102', DATE '2026-10-08');
    UPDATE goals.user_goals SET measurement_type = 'distance'
    WHERE id = '30000000-0000-0000-0000-000000000102';
    INSERT INTO g617_cardio SELECT 'distance', current_value
      FROM goals.goal_progress_at(
        '30000000-0000-0000-0000-000000000102', DATE '2026-10-08');
    UPDATE goals.user_goals SET measurement_type = 'pace'
    WHERE id = '30000000-0000-0000-0000-000000000102';
    INSERT INTO g617_cardio SELECT 'pace', current_value
      FROM goals.goal_progress_at(
        '30000000-0000-0000-0000-000000000102', DATE '2026-10-08');
    CREATE TEMP TABLE g617_invalid_reps (state text) ON COMMIT DROP;
    DO $probe$
    BEGIN
      BEGIN
        UPDATE goals.user_goals SET measurement_type = 'weight_reps'
        WHERE id = '30000000-0000-0000-0000-000000000102';
        INSERT INTO g617_invalid_reps VALUES ('unexpected_success');
      EXCEPTION WHEN OTHERS THEN
        INSERT INTO g617_invalid_reps VALUES (SQLSTATE);
      END;
    END $probe$;
    SELECT json_build_object(
      'weightReps', (SELECT current_value FROM g617_weight),
      'duration', (SELECT value FROM g617_cardio WHERE kind = 'duration'),
      'distance', (SELECT value FROM g617_cardio WHERE kind = 'distance'),
      'pace', (SELECT value FROM g617_cardio WHERE kind = 'pace'),
      'invalidRepsState', (SELECT state FROM g617_invalid_reps)
    );
    ROLLBACK;
  `)
  assert.ok(result.weightReps > 0)
  assert.equal(result.duration, 600)
  assert.equal(result.distance, 2000)
  assert.equal(result.pace, 300)
  assert.equal(result.invalidRepsState, '23514')
})
