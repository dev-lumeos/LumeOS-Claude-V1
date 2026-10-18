import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const db = process.env.PGDATABASE
if (!db || db === 'postgres') throw new Error('G-620 braucht eine Wegwerf-Datenbank.')
const container = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'

function sql(query: string): string {
  return execFileSync('docker', [
    'exec', container, 'psql', '-X', '-q', '-v', 'ON_ERROR_STOP=1',
    '-U', 'postgres', '-d', db, '-t', '-A', '-c', query,
  ], { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 }).trim()
}

test('G-620: Dauer und Pace werten den kürzesten Satz über dieselbe Strecke', () => {
  const output = sql(`
    BEGIN;
    INSERT INTO auth.users(id,email,raw_app_meta_data,created_at)
    VALUES ('62000000-0000-0000-0000-000000000001',
      'g620@example.test','{}',now());
    SELECT set_config('request.jwt.claim.sub',
      '62000000-0000-0000-0000-000000000001',true);
    SET LOCAL ROLE authenticated;
    INSERT INTO training.workout_sessions
      (id,user_id,session_date,started_time,status)
    VALUES ('62000000-0000-0000-0000-000000000011',auth.uid(),
      DATE '2026-10-01',TIME '10:00','completed');
    INSERT INTO training.workout_exercises
      (id,workout_session_id,exercise_id,exercise_order,exercise_name)
    VALUES ('62000000-0000-0000-0000-000000000012',
      '62000000-0000-0000-0000-000000000011',
      '765e7a54-1bfe-4bb0-b1d3-e029994d81d7',1,'Probe');
    INSERT INTO training.workout_sets
      (id,workout_exercise_id,set_number,duration_seconds,distance_meters)
    VALUES ('62000000-0000-0000-0000-000000000013',
      '62000000-0000-0000-0000-000000000012',1,1600,5000);
    CREATE TEMP TABLE g620_goals(id uuid,art text) ON COMMIT DROP;
    INSERT INTO g620_goals VALUES
      (goals.measurement_goal_create('duration','5 km unter 25 min',1400,
        'seconds',DATE '2026-10-01',DATE '2026-10-20',
        '765e7a54-1bfe-4bb0-b1d3-e029994d81d7',NULL,NULL,
        'once',NULL,NULL,5000),'duration'),
      (goals.measurement_goal_create('pace','5 km Pace',280,
        'sec_per_km',DATE '2026-10-01',DATE '2026-10-20',
        '765e7a54-1bfe-4bb0-b1d3-e029994d81d7',NULL,NULL,
        'once',NULL,NULL,5000),'pace');
    CREATE TEMP TABLE g620_refusal(message text) ON COMMIT DROP;
    DO $probe$ BEGIN
      BEGIN
        UPDATE goals.user_goals SET measurement_distance_m=1000
        WHERE id=(SELECT id FROM g620_goals WHERE art='duration');
        INSERT INTO g620_refusal VALUES ('angenommen');
      EXCEPTION WHEN check_violation THEN
        INSERT INTO g620_refusal VALUES (SQLERRM);
      END;
    END $probe$;
    INSERT INTO training.workout_sessions
      (id,user_id,session_date,started_time,status)
    VALUES
      ('62000000-0000-0000-0000-000000000021',auth.uid(),
        DATE '2026-10-08',TIME '10:00','completed'),
      ('62000000-0000-0000-0000-000000000031',auth.uid(),
        DATE '2026-10-09',TIME '10:00','completed');
    INSERT INTO training.workout_exercises
      (id,workout_session_id,exercise_id,exercise_order,exercise_name)
    VALUES
      ('62000000-0000-0000-0000-000000000022',
        '62000000-0000-0000-0000-000000000021',
        '765e7a54-1bfe-4bb0-b1d3-e029994d81d7',1,'Probe'),
      ('62000000-0000-0000-0000-000000000032',
        '62000000-0000-0000-0000-000000000031',
        '765e7a54-1bfe-4bb0-b1d3-e029994d81d7',1,'Probe');
    INSERT INTO training.workout_sets
      (id,workout_exercise_id,set_number,duration_seconds,distance_meters)
    VALUES
      ('62000000-0000-0000-0000-000000000023',
        '62000000-0000-0000-0000-000000000022',1,1500,5000),
      ('62000000-0000-0000-0000-000000000033',
        '62000000-0000-0000-0000-000000000032',1,1200,1000);
    SELECT json_build_object(
      'directionDuration',goals.measurement_better_direction('duration'),
      'directionPace',goals.measurement_better_direction('pace'),
      'directionDistance',goals.measurement_better_direction('distance'),
      'distanceFixed',(SELECT message FROM g620_refusal),
      'results',(SELECT json_object_agg(x.art,json_build_object(
        'start',g.start_value,'current',p.current_value,
        'measured',p.measured_at,'progress',p.progress_pct,'lage',p.lage,
        'weekDelta',(goals.measurement_goal_week_at(g.id,DATE '2026-10-10')
          ->>'delta_woche')::numeric))
        FROM g620_goals x JOIN goals.user_goals g ON g.id=x.id
        CROSS JOIN LATERAL goals.goal_progress_at(g.id,DATE '2026-10-10') p),
      'boundPoints',(SELECT count(*) FROM g620_goals x
        CROSS JOIN LATERAL goals.measurement_points(x.id,DATE '2026-10-10') p
        WHERE p.measured_on=DATE '2026-10-09'));
    ROLLBACK;
  `)
  const result = JSON.parse(output.split(/\r?\n/).find(x => x.startsWith('{')) ?? '{}')
  if (process.env.G620_SABOTAGE === '1') result.results.duration.current = 1200
  assert.equal(result.directionDuration, 'less')
  assert.equal(result.directionPace, 'less')
  assert.equal(result.directionDistance, 'more')
  assert.match(result.distanceFixed, /^G620_DISTANCE_FIXED:/)
  assert.equal(result.boundPoints, 0)
  assert.deepEqual(result.results.duration, {
    start: 1600, current: 1500, measured: '2026-10-08',
    progress: 50, lage: 'im_plan', weekDelta: -100,
  })
  assert.deepEqual(result.results.pace, {
    start: 320, current: 300, measured: '2026-10-08',
    progress: 50, lage: 'im_plan', weekDelta: -20,
  })
})
