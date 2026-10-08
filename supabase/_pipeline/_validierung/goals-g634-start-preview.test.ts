import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const db = process.env.PGDATABASE
if (!db || db === 'postgres') throw new Error('G-634 braucht eine Wegwerf-Datenbank.')
const container = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
function sql(query: string): string {
  return execFileSync('docker', [
    'exec', container, 'psql', '-X', '-q', '-v', 'ON_ERROR_STOP=1',
    '-U', 'postgres', '-d', db, '-t', '-A', '-c', query,
  ], { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 }).trim()
}

test('G-634: Vorschau und Snapshot lesen alle Startwerte aus derselben Quelle', () => {
  const [got, foreign] = sql(`
    BEGIN;
    INSERT INTO auth.users(id,email,raw_app_meta_data,created_at) VALUES
      ('63400000-0000-0000-0000-000000000001','g634-a@example.test','{}',now()),
      ('63400000-0000-0000-0000-000000000002','g634-b@example.test','{}',now());
    INSERT INTO goals.body_measurements
      (user_id,measurement_date,measurement_time,weight_kg,body_fat_pct)
    VALUES ('63400000-0000-0000-0000-000000000001',
      DATE '2026-10-07',TIME '08:00',80,20);
    INSERT INTO goals.body_circumferences
      (user_id,measurement_date,measurement_time,waist_cm)
    VALUES ('63400000-0000-0000-0000-000000000001',
      DATE '2026-10-07',TIME '08:00',84);
    INSERT INTO training.workout_sessions
      (id,user_id,session_date,started_time,status)
    VALUES ('63400000-0000-0000-0000-000000000011',
      '63400000-0000-0000-0000-000000000001',
      DATE '2026-10-07',TIME '10:00','completed');
    INSERT INTO training.workout_exercises
      (id,workout_session_id,exercise_id,exercise_order,exercise_name)
    VALUES ('63400000-0000-0000-0000-000000000012',
      '63400000-0000-0000-0000-000000000011',
      '765e7a54-1bfe-4bb0-b1d3-e029994d81d7',1,'Bench');
    INSERT INTO training.workout_sets
      (workout_exercise_id,set_number,reps,weight_kg)
    VALUES ('63400000-0000-0000-0000-000000000012',1,5,80);
    INSERT INTO recovery.checkins(user_id,entry_date,sleep_hours)
    VALUES ('63400000-0000-0000-0000-000000000001',
      DATE '2026-10-07',8.2);
    SELECT set_config('request.jwt.claim.sub',
      '63400000-0000-0000-0000-000000000001',true);
    SET LOCAL ROLE authenticated;
    CREATE TEMP TABLE g634_previews AS
      SELECT x.art,p.wert,p.datum,p.quelle,p.kennung
      FROM (VALUES
        ('body_weight',NULL::uuid,NULL::text,NULL::smallint,NULL::numeric),
        ('circumference',NULL::uuid,'waist_cm',NULL::smallint,NULL::numeric),
        ('e1rm','765e7a54-1bfe-4bb0-b1d3-e029994d81d7'::uuid,
          NULL::text,NULL::smallint,NULL::numeric),
        ('weight_reps','765e7a54-1bfe-4bb0-b1d3-e029994d81d7'::uuid,
          NULL::text,5::smallint,NULL::numeric),
        ('training_sessions_week',NULL::uuid,NULL::text,NULL::smallint,NULL::numeric),
        ('sleep_hours_night',NULL::uuid,NULL::text,NULL::smallint,NULL::numeric),
        ('custom',NULL::uuid,NULL::text,NULL::smallint,7::numeric)
      ) x(art,uebung,stelle,wdh,handwert)
      CROSS JOIN LATERAL goals.measurement_goal_start_preview(
        x.art,DATE '2026-10-08',x.uebung,x.stelle,x.wdh,x.handwert) p;
    SELECT goals.measurement_goal_create('body_weight','Gewicht',75,'kg',DATE '2026-10-08');
    SELECT goals.measurement_goal_create('circumference','Taille',80,'cm',
      DATE '2026-10-08',NULL,NULL,NULL,'waist_cm');
    SELECT goals.measurement_goal_create('e1rm','Bankdruecken',120,'kg',
      DATE '2026-10-08',NULL,
      '765e7a54-1bfe-4bb0-b1d3-e029994d81d7');
    SELECT goals.measurement_goal_create('weight_reps','Bankdruecken 5 Wdh',90,'kg',
      DATE '2026-10-08',NULL,
      '765e7a54-1bfe-4bb0-b1d3-e029994d81d7',5::smallint);
    SELECT goals.measurement_goal_create('training_sessions_week','Training',2,
      'sessions_per_week',DATE '2026-10-08');
    SELECT goals.measurement_goal_create('sleep_hours_night','Schlaf',8,
      'h/night',DATE '2026-10-08');
    SELECT goals.measurement_goal_create('custom','Eigenes',10,'punkte',
      DATE '2026-10-08',NULL,NULL,NULL,NULL,'once','more',7);
    SELECT json_build_object(
      'matches',(SELECT count(*) FROM g634_previews p
        JOIN goals.user_goals g ON g.user_id=auth.uid()
          AND g.measurement_type=p.art
        WHERE p.wert IS NOT DISTINCT FROM g.start_value
          AND p.datum IS NOT DISTINCT FROM g.start_measured_at
          AND p.quelle IS NOT DISTINCT FROM g.start_source),
      'categories',(SELECT count(*) FROM g634_previews),
      'weight',(SELECT wert FROM g634_previews WHERE art='body_weight'),
      'waist',(SELECT wert FROM g634_previews WHERE art='circumference'),
      'reps',(SELECT wert FROM g634_previews WHERE art='weight_reps'),
      'strength',(SELECT wert FROM g634_previews WHERE art='e1rm'),
      'habit',(SELECT wert FROM g634_previews WHERE art='training_sessions_week'),
      'manual',(SELECT wert FROM g634_previews WHERE art='custom'),
      'missing',(SELECT kennung FROM goals.measurement_goal_start_preview(
        'body_fat',DATE '2026-09-01')));
    SELECT set_config('request.jwt.claim.sub',
      '63400000-0000-0000-0000-000000000002',true);
    SELECT json_build_object(
      'foreign_value',(SELECT wert FROM goals.measurement_goal_start_preview(
        'body_weight',DATE '2026-10-08')),
      'foreign_marker',(SELECT kennung FROM goals.measurement_goal_start_preview(
        'body_weight',DATE '2026-10-08')));
    ROLLBACK;
  `).split(/\r?\n/).filter(x => x.startsWith('{')).map(x => JSON.parse(x))
  assert.equal(got.matches, 7)
  assert.equal(got.categories, 7)
  assert.equal(got.weight, 80)
  assert.equal(got.waist, 84)
  assert.equal(got.reps, 80)
  assert.ok(got.strength > 80)
  assert.equal(got.habit, 0.25)
  assert.equal(got.manual, 7)
  assert.equal(got.missing, 'erst_messen')
  assert.equal(foreign.foreign_value, null)
  assert.equal(foreign.foreign_marker, 'erst_messen')
})
