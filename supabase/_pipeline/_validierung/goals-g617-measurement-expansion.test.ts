// G-617 erweitert: nur Wegwerf-Datenbank; Schreibproben rollen zurueck.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const db = process.env.PGDATABASE
const container = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
if (!db || db === 'postgres') throw new Error('G-617 Erweiterung braucht eine Wegwerf-Datenbank.')

function one<T>(sql: string): T {
  const output = execFileSync('docker', [
    'exec', container, 'psql', '-X', '-q', '-v', 'ON_ERROR_STOP=1',
    '-U', 'postgres', '-d', db, '-t', '-A', '-c', sql,
  ], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }).trim()
  return JSON.parse(output.split(/\r?\n/).findLast(line => line.startsWith('{')) ?? '') as T
}

test('G-617 erweitert: 13 Umfangstellen, gemessene und vorgemerkte Quellen', () => {
  const got = one<{ sites: number; training: string; sleep: string; steps: string; cardio: string }>(`
    SELECT json_build_object(
      'sites',(SELECT count(*) FROM goals.measurement_circumference_sites),
      'training',(SELECT availability FROM goals.measurement_source_options
        WHERE measurement_type='training_sessions_week'),
      'sleep',(SELECT availability FROM goals.measurement_source_options
        WHERE measurement_type='sleep_hours_night'),
      'steps',(SELECT availability FROM goals.measurement_source_options
        WHERE measurement_type='steps_day'),
      'cardio',(SELECT availability FROM goals.measurement_source_options
        WHERE measurement_type='cardio_sessions_week'));
  `)
  assert.deepEqual(got, {
    sites: 13, training: 'available', sleep: 'available',
    steps: 'pending', cardio: 'pending',
  })
})

test('G-617 erweitert: Koerper braucht Messung; Kraft startet mit erstem Wert', () => {
  const got = one<{
    bodyError: string; stepsError: string; cardioError: string
    strengthStart: number | null; strengthAfter: number; strengthSource: string
    strengthRhythm: string; manualError: string
    startTamper: string; currentTamper: string; typeTamper: string
  }>(`
    BEGIN;
    INSERT INTO auth.users (id,email,raw_app_meta_data,created_at)
    VALUES ('61710000-0000-0000-0000-000000000001','g617-ext-a@example.test','{}',now());
    SELECT set_config('request.jwt.claim.sub',
      '61710000-0000-0000-0000-000000000001',true);
    SET LOCAL ROLE authenticated;
    CREATE TEMP TABLE g617x_errors(label text, message text) ON COMMIT DROP;
    GRANT SELECT, INSERT ON g617x_errors TO authenticated;
    DO $probe$ BEGIN
      BEGIN
        PERFORM goals.measurement_goal_create('body_fat','Koerperfett',15,'%',
          DATE '2026-10-08');
        INSERT INTO g617x_errors VALUES ('body','angenommen');
      EXCEPTION WHEN check_violation THEN
        INSERT INTO g617x_errors VALUES ('body',SQLERRM);
      END;
      BEGIN
        PERFORM goals.measurement_goal_create('steps_day','Schritte',8000,'steps/day',
          DATE '2026-10-08');
        INSERT INTO g617x_errors VALUES ('steps','angenommen');
      EXCEPTION WHEN check_violation THEN
        INSERT INTO g617x_errors VALUES ('steps',SQLERRM);
      END;
      BEGIN
        PERFORM goals.measurement_goal_create('cardio_sessions_week','Cardio',2,'sessions_per_week',
          DATE '2026-10-08');
        INSERT INTO g617x_errors VALUES ('cardio','angenommen');
      EXCEPTION WHEN check_violation THEN
        INSERT INTO g617x_errors VALUES ('cardio',SQLERRM);
      END;
    END $probe$;
    SELECT goals.measurement_goal_create('e1rm','Bankdruecken',120,'kg',
      DATE '2026-10-08',NULL,
      '765e7a54-1bfe-4bb0-b1d3-e029994d81d7');
    DO $probe$ BEGIN
      BEGIN
        INSERT INTO goals.manual_goal_values (goal_id,user_id,measured_on,value)
        SELECT id,auth.uid(),DATE '2026-10-08',99 FROM goals.user_goals
        WHERE user_id=auth.uid() AND measurement_type='e1rm';
        INSERT INTO g617x_errors VALUES ('manual','angenommen');
      EXCEPTION WHEN OTHERS THEN
        INSERT INTO g617x_errors VALUES ('manual',SQLERRM);
      END;
    END $probe$;
    CREATE TEMP TABLE g617x_strength_before AS SELECT start_value
      FROM goals.user_goals WHERE user_id=auth.uid() AND measurement_type='e1rm';
    INSERT INTO training.workout_sessions
      (id,user_id,session_date,started_time,status)
    VALUES ('61710000-0000-0000-0000-000000000011',auth.uid(),
      DATE '2026-10-08',TIME '10:00','completed');
    INSERT INTO training.workout_exercises
      (id,workout_session_id,exercise_id,exercise_order,exercise_name)
    VALUES ('61710000-0000-0000-0000-000000000012',
      '61710000-0000-0000-0000-000000000011',
      '765e7a54-1bfe-4bb0-b1d3-e029994d81d7',1,'Bench');
    INSERT INTO training.workout_sets
      (id,workout_exercise_id,set_number,reps,weight_kg)
    VALUES ('61710000-0000-0000-0000-000000000013',
      '61710000-0000-0000-0000-000000000012',1,5,80);
    DO $probe$ BEGIN
      BEGIN
        UPDATE goals.user_goals SET start_value=999
        WHERE user_id=auth.uid() AND measurement_type='e1rm';
        INSERT INTO g617x_errors VALUES ('start_tamper','angenommen');
      EXCEPTION WHEN check_violation THEN
        INSERT INTO g617x_errors VALUES ('start_tamper',SQLERRM);
      END;
      BEGIN
        UPDATE goals.user_goals SET current_value=999
        WHERE user_id=auth.uid() AND measurement_type='e1rm';
        INSERT INTO g617x_errors VALUES ('current_tamper','angenommen');
      EXCEPTION WHEN check_violation THEN
        INSERT INTO g617x_errors VALUES ('current_tamper',SQLERRM);
      END;
      BEGIN
        UPDATE goals.user_goals SET measurement_type=NULL
        WHERE user_id=auth.uid() AND measurement_type='e1rm';
        INSERT INTO g617x_errors VALUES ('type_tamper','angenommen');
      EXCEPTION WHEN check_violation THEN
        INSERT INTO g617x_errors VALUES ('type_tamper',SQLERRM);
      END;
    END $probe$;
    SELECT json_build_object(
      'bodyError',(SELECT message FROM g617x_errors WHERE label='body'),
      'stepsError',(SELECT message FROM g617x_errors WHERE label='steps'),
      'cardioError',(SELECT message FROM g617x_errors WHERE label='cardio'),
      'strengthStart',(SELECT start_value FROM g617x_strength_before),
      'strengthAfter',(SELECT start_value FROM goals.user_goals
        WHERE user_id=auth.uid() AND measurement_type='e1rm'),
      'strengthSource',(SELECT start_source FROM goals.user_goals
        WHERE user_id=auth.uid() AND measurement_type='e1rm'),
      'strengthRhythm',(SELECT measurement_rhythm FROM goals.user_goals
        WHERE user_id=auth.uid() AND measurement_type='e1rm'),
      'manualError',(SELECT message FROM g617x_errors WHERE label='manual'),
      'startTamper',(SELECT message FROM g617x_errors WHERE label='start_tamper'),
      'currentTamper',(SELECT message FROM g617x_errors WHERE label='current_tamper'),
      'typeTamper',(SELECT message FROM g617x_errors WHERE label='type_tamper'));
    ROLLBACK;
  `)
  assert.match(got.bodyError, /G617_FIRST_MEASURE: erst messen/)
  assert.match(got.stepsError, /G617_SOURCE_PENDING/)
  assert.match(got.cardioError, /G617_SOURCE_PENDING/)
  assert.equal(got.strengthStart, null)
  assert.ok(got.strengthAfter > 80)
  assert.equal(got.strengthSource, 'training.workout_sets.estimated_1rm')
  assert.equal(got.strengthRhythm, 'once')
  assert.notEqual(got.manualError, 'angenommen')
  assert.match(got.startTamper, /G617_START_FIXED/)
  assert.match(got.currentTamper, /G617_SOURCE_ONLY/)
  assert.match(got.typeTamper, /G617_TYPE_FIXED/)
})

test('G-617 erweitert: Koerperpunkte, Trainingsserie und eigener Handwert', () => {
  const got = one<{
    weightStart: number; fatStart: number; waistStart: number
    weightCurrent: number; fatCurrent: number; waistCurrent: number
    waistSource: string; waistPointId: string; trainingStart: number
    trainingWeek: number; trainingQuota: number; trainingStreak: number
    trainingStreakAfterGap: number
    customStart: number; customCurrent: number; customPointId: string
    sleepWeek: number; sleepQuota: number
  }>(`
    BEGIN;
    INSERT INTO auth.users (id,email,raw_app_meta_data,created_at)
    VALUES ('61720000-0000-0000-0000-000000000001','g617-ext-b@example.test','{}',now());
    INSERT INTO goals.body_measurements
      (id,user_id,measurement_date,measurement_time,weight_kg,body_fat_pct)
    VALUES ('61720000-0000-0000-0000-000000000011',
      '61720000-0000-0000-0000-000000000001',DATE '2026-10-01',TIME '08:00',80,20);
    INSERT INTO goals.body_circumferences
      (id,user_id,measurement_date,measurement_time,waist_cm)
    VALUES ('61720000-0000-0000-0000-000000000012',
      '61720000-0000-0000-0000-000000000001',DATE '2026-10-01',TIME '08:05',84);
    SELECT set_config('request.jwt.claim.sub',
      '61720000-0000-0000-0000-000000000001',true);
    SET LOCAL ROLE authenticated;
    SELECT goals.measurement_goal_create('body_weight','Gewicht',75,'kg',DATE '2026-10-08');
    SELECT goals.measurement_goal_create('body_fat','Koerperfett',17,'%',DATE '2026-10-08');
    SELECT goals.measurement_goal_create('circumference','Taille',80,'cm',
      DATE '2026-10-08',NULL,NULL,NULL,'waist_cm');
    SELECT goals.measurement_goal_create('training_sessions_week','Training',2,'sessions_per_week',
      DATE '2026-09-14');
    SELECT goals.measurement_goal_create('sleep_hours_night','Schlaf',8,'h/night',
      DATE '2026-10-05');
    SELECT goals.measurement_goal_create('custom','Eigenes',10,'punkte',
      DATE '2026-10-08',NULL,NULL,NULL,NULL,'weekly','more',7);
    CREATE TEMP TABLE g617x_start AS
      SELECT measurement_type,start_value FROM goals.user_goals WHERE user_id=auth.uid();
    INSERT INTO goals.body_measurements
      (id,user_id,measurement_date,measurement_time,weight_kg,body_fat_pct)
    VALUES ('61720000-0000-0000-0000-000000000021',auth.uid(),
      DATE '2026-10-09',TIME '08:00',79.4,19.5);
    INSERT INTO goals.body_circumferences
      (id,user_id,measurement_date,measurement_time,waist_cm)
    VALUES ('61720000-0000-0000-0000-000000000022',auth.uid(),
      DATE '2026-10-09',TIME '08:05',82);
    INSERT INTO training.workout_sessions
      (user_id,session_date,started_time,status)
    SELECT auth.uid(), DATE '2026-09-14' + (n/2)*7 + (n%2),
      TIME '10:00','completed' FROM generate_series(0,7) n;
    INSERT INTO recovery.checkins
      (user_id,entry_date,sleep_hours)
    SELECT auth.uid(), DATE '2026-10-05' + n, 8.2
    FROM generate_series(0,3) n;
    INSERT INTO goals.manual_goal_values
      (id,goal_id,user_id,measured_on,value)
    SELECT '61720000-0000-0000-0000-000000000023',id,auth.uid(),
      DATE '2026-10-09',9 FROM goals.user_goals
    WHERE user_id=auth.uid() AND measurement_type='custom';
    CREATE TEMP TABLE g617x_series_before AS
      SELECT observed_value,quota_pct,streak_weeks
      FROM goals.measurement_weeks(
        (SELECT id FROM goals.user_goals WHERE user_id=auth.uid()
          AND measurement_type='training_sessions_week'),DATE '2026-10-08')
      ORDER BY week_start DESC LIMIT 1;
    DELETE FROM training.workout_sessions
    WHERE user_id=auth.uid() AND session_date BETWEEN
      DATE '2026-09-21' AND DATE '2026-09-27';
    SELECT json_build_object(
      'weightStart',(SELECT start_value FROM g617x_start WHERE measurement_type='body_weight'),
      'fatStart',(SELECT start_value FROM g617x_start WHERE measurement_type='body_fat'),
      'waistStart',(SELECT start_value FROM g617x_start WHERE measurement_type='circumference'),
      'weightCurrent',(SELECT current_value FROM goals.goal_progress_at(
        (SELECT id FROM goals.user_goals WHERE user_id=auth.uid() AND measurement_type='body_weight'),
        DATE '2026-10-10')),
      'fatCurrent',(SELECT current_value FROM goals.goal_progress_at(
        (SELECT id FROM goals.user_goals WHERE user_id=auth.uid() AND measurement_type='body_fat'),
        DATE '2026-10-10')),
      'waistCurrent',(SELECT current_value FROM goals.goal_progress_at(
        (SELECT id FROM goals.user_goals WHERE user_id=auth.uid() AND measurement_type='circumference'),
        DATE '2026-10-10')),
      'waistSource',(SELECT source_name FROM goals.measurement_points(
        (SELECT id FROM goals.user_goals WHERE user_id=auth.uid() AND measurement_type='circumference'),
        DATE '2026-10-10') ORDER BY measured_on DESC LIMIT 1),
      'waistPointId',(SELECT source_id FROM goals.measurement_points(
        (SELECT id FROM goals.user_goals WHERE user_id=auth.uid() AND measurement_type='circumference'),
        DATE '2026-10-10') ORDER BY measured_on DESC LIMIT 1),
      'trainingStart',(SELECT start_value FROM g617x_start WHERE measurement_type='training_sessions_week'),
      'trainingWeek',(SELECT observed_value FROM g617x_series_before),
      'trainingQuota',(SELECT quota_pct FROM g617x_series_before),
      'trainingStreak',(SELECT streak_weeks FROM g617x_series_before),
      'trainingStreakAfterGap',(SELECT streak_weeks FROM goals.measurement_weeks(
        (SELECT id FROM goals.user_goals WHERE user_id=auth.uid() AND measurement_type='training_sessions_week'),
        DATE '2026-10-08') ORDER BY week_start DESC LIMIT 1),
      'customStart',(SELECT start_value FROM g617x_start WHERE measurement_type='custom'),
      'customCurrent',(SELECT current_value FROM goals.goal_progress_at(
        (SELECT id FROM goals.user_goals WHERE user_id=auth.uid() AND measurement_type='custom'),
        DATE '2026-10-10')),
      'customPointId',(SELECT source_id FROM goals.measurement_points(
        (SELECT id FROM goals.user_goals WHERE user_id=auth.uid() AND measurement_type='custom'),
        DATE '2026-10-10') ORDER BY measured_on DESC LIMIT 1),
      'sleepWeek',(SELECT observed_value FROM goals.measurement_weeks(
        (SELECT id FROM goals.user_goals WHERE user_id=auth.uid() AND measurement_type='sleep_hours_night'),
        DATE '2026-10-08') ORDER BY week_start DESC LIMIT 1),
      'sleepQuota',(SELECT quota_pct FROM goals.measurement_weeks(
        (SELECT id FROM goals.user_goals WHERE user_id=auth.uid() AND measurement_type='sleep_hours_night'),
        DATE '2026-10-08') ORDER BY week_start DESC LIMIT 1));
    ROLLBACK;
  `)
  assert.equal(got.weightStart, 80)
  assert.equal(got.fatStart, 20)
  assert.equal(got.waistStart, 84)
  assert.equal(got.weightCurrent, 79.4)
  assert.equal(got.fatCurrent, 19.5)
  assert.equal(got.waistCurrent, 82)
  assert.equal(got.waistSource, 'goals.body_circumferences.waist_cm')
  assert.equal(got.waistPointId, '61720000-0000-0000-0000-000000000022')
  assert.equal(got.trainingStart, 0)
  assert.equal(got.trainingWeek, 2)
  assert.equal(got.trainingQuota, 100)
  assert.equal(got.trainingStreak, 4)
  assert.equal(got.trainingStreakAfterGap, 2)
  assert.equal(got.customStart, 7)
  assert.equal(got.customCurrent, 9)
  assert.equal(got.customPointId, '61720000-0000-0000-0000-000000000023')
  assert.equal(got.sleepWeek, 8.2)
  assert.equal(got.sleepQuota, 57.1)
})
