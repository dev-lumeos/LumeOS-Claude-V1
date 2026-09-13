-- C-493 — zusaetzliche, absichtlich unterschiedliche Kartenlasten.
--
-- Aufruf: NACH testdaten-einspielen.ts und eigenes-konto-fuellen.sql.
-- Letzteres entfernt vorher alle Sitzungen des Dev-Kontos. Dieser getrennte
-- Folgeschritt ergaenzt deshalb dessen 30 Sitzungen, statt sie zu verlieren.
-- Idempotent: genau die zehn mit notes = 'seed-c493' markierten Sitzungen
-- werden aktualisiert. Ausschliesslich dev@lumeos.app; dessen bestehende
-- Sitzungen und die beiden anderen Konten bleiben unangetastet.
\set ON_ERROR_STOP on

BEGIN;

-- C-493 lief einmal auf dem falschen Nachweiskonto. Nur die eindeutig
-- markierten eigenen Zeilen wegnehmen; die sechs urspruenglichen Sitzungen
-- von test-user bleiben unveraendert.
DELETE FROM training.workout_sessions ws
USING auth.users u
WHERE ws.user_id = u.id
  AND u.email = 'test-user@lumeos.local'
  AND ws.notes = 'seed-c493';

-- Eine UUID aus einem stabilen C-493-Schluessel. Dadurch aktualisiert ein
-- erneuter Kettenlauf exakt diese Zeilen statt weitere Sitzungen anzulegen.
WITH plan(session_date, started_time, session_name, exercise_name, set_count, reps, weight_kg, rpe, rir) AS (
  VALUES
    (DATE '2026-09-03', TIME '07:00', 'C-493 Karten-Seed', 'Adductor dynamic stretch', 3, 12, 0::numeric, 6::numeric, 5::smallint),
    (DATE '2026-09-03', TIME '07:00', 'C-493 Karten-Seed', '5 Sec Fist Against Chin', 3, 10, 0::numeric, 6::numeric, 5::smallint),
    (DATE '2026-09-03', TIME '07:00', 'C-493 Karten-Seed', 'Alternate superman', 3, 12, 0::numeric, 6::numeric, 5::smallint),
    (DATE '2026-09-04', TIME '07:15', 'C-493 Karten-Seed', 'Dumbbell lying external shoulder rotation', 4, 12, 4::numeric, 7::numeric, 4::smallint),
    (DATE '2026-09-04', TIME '07:15', 'C-493 Karten-Seed', 'Backward Forward Turn to Side Neck Stretch', 3, 10, 0::numeric, 6::numeric, 5::smallint),
    (DATE '2026-09-06', TIME '07:30', 'C-493 Karten-Seed', '45 degree hyperextension (arms in front of chest)', 5, 12, 15::numeric, 7::numeric, 3::smallint),
    (DATE '2026-09-06', TIME '07:30', 'C-493 Karten-Seed', 'Assisted chin up normal width reverse grip', 4, 8, 35::numeric, 7::numeric, 3::smallint),
    (DATE '2026-09-07', TIME '07:00', 'C-493 Karten-Seed', 'Barbell Lateral Lunge', 3, 10, 25::numeric, 6::numeric, 5::smallint),
    (DATE '2026-09-08', TIME '07:20', 'C-493 Karten-Seed', 'Alternate Bicep Curl Resistance Band', 5, 12, 12::numeric, 7.5::numeric, 3::smallint),
    (DATE '2026-09-08', TIME '07:20', 'C-493 Karten-Seed', 'Barbell standing back wrist curl', 5, 15, 15::numeric, 7.5::numeric, 3::smallint),
    (DATE '2026-09-09', TIME '07:10', 'C-493 Karten-Seed', 'Resistance Band Side Plank Glute Raise', 6, 12, 0::numeric, 8::numeric, 2::smallint),
    (DATE '2026-09-09', TIME '07:10', 'C-493 Karten-Seed', 'Exercise ball hip flexor stretch', 3, 12, 0::numeric, 6::numeric, 5::smallint),
    (DATE '2026-09-10', TIME '07:00', 'C-493 Karten-Seed', 'Alternate superman', 8, 12, 0::numeric, 8.5::numeric, 2::smallint),
    (DATE '2026-09-10', TIME '07:00', 'C-493 Karten-Seed', 'Barbell Lateral Lunge', 8, 10, 30::numeric, 8::numeric, 2::smallint),
    (DATE '2026-09-11', TIME '07:00', 'C-493 Karten-Seed', 'Gym Rowing Machine Normal Speed', 10, 12, 45::numeric, 8.5::numeric, 1::smallint),
    (DATE '2026-09-11', TIME '07:00', 'C-493 Karten-Seed', 'Superman pulls Resistance band', 8, 12, 0::numeric, 8::numeric, 2::smallint),
    (DATE '2026-09-12', TIME '07:00', 'C-493 Karten-Seed', 'Barbell clean and press', 12, 6, 35::numeric, 9::numeric, 1::smallint),
    (DATE '2026-09-12', TIME '07:00', 'C-493 Karten-Seed', 'Cable twisting overhead press', 6, 12, 15::numeric, 7::numeric, 4::smallint),
    (DATE '2026-09-13', TIME '07:00', 'C-493 Karten-Seed', 'Gym Rowing Machine Normal Speed', 20, 10, 50::numeric, 10::numeric, 0::smallint),
    (DATE '2026-09-13', TIME '07:00', 'C-493 Karten-Seed', 'Chair frog feet elevated glute bridge bodyweight', 10, 12, 0::numeric, 9::numeric, 1::smallint),
    (DATE '2026-09-13', TIME '07:00', 'C-493 Karten-Seed', 'Barbell clean and press', 3, 6, 20::numeric, 6::numeric, 5::smallint)
), sessions AS (
  SELECT DISTINCT session_date, started_time, session_name
  FROM plan
)
INSERT INTO training.workout_sessions (
  id, user_id, session_date, started_time, ended_time, name, status, notes, duration_minutes
)
SELECT
  (substr(md5('c493/session/' || session_date::text), 1, 8) || '-' || substr(md5('c493/session/' || session_date::text), 9, 4) || '-' || substr(md5('c493/session/' || session_date::text), 13, 4) || '-' || substr(md5('c493/session/' || session_date::text), 17, 4) || '-' || substr(md5('c493/session/' || session_date::text), 21, 12))::uuid,
  u.id, session_date, started_time, started_time + INTERVAL '50 minutes', session_name, 'completed', 'seed-c493', 50
FROM sessions
CROSS JOIN (SELECT id FROM auth.users WHERE email = 'dev@lumeos.app') u
ON CONFLICT (id) DO UPDATE SET
  started_time = EXCLUDED.started_time, ended_time = EXCLUDED.ended_time,
  name = EXCLUDED.name, status = EXCLUDED.status, notes = EXCLUDED.notes,
  duration_minutes = EXCLUDED.duration_minutes;

WITH plan(session_date, exercise_name, exercise_order, set_count, reps, weight_kg) AS (
  VALUES
    (DATE '2026-09-03', 'Adductor dynamic stretch', 1, 3, 12, 0::numeric), (DATE '2026-09-03', '5 Sec Fist Against Chin', 2, 3, 10, 0::numeric), (DATE '2026-09-03', 'Alternate superman', 3, 3, 12, 0::numeric),
    (DATE '2026-09-04', 'Dumbbell lying external shoulder rotation', 1, 4, 12, 4::numeric), (DATE '2026-09-04', 'Backward Forward Turn to Side Neck Stretch', 2, 3, 10, 0::numeric),
    (DATE '2026-09-06', '45 degree hyperextension (arms in front of chest)', 1, 5, 12, 15::numeric), (DATE '2026-09-06', 'Assisted chin up normal width reverse grip', 2, 4, 8, 35::numeric),
    (DATE '2026-09-07', 'Barbell Lateral Lunge', 1, 3, 10, 25::numeric),
    (DATE '2026-09-08', 'Alternate Bicep Curl Resistance Band', 1, 5, 12, 12::numeric), (DATE '2026-09-08', 'Barbell standing back wrist curl', 2, 5, 15, 15::numeric),
    (DATE '2026-09-09', 'Resistance Band Side Plank Glute Raise', 1, 6, 12, 0::numeric), (DATE '2026-09-09', 'Exercise ball hip flexor stretch', 2, 3, 12, 0::numeric),
    (DATE '2026-09-10', 'Alternate superman', 1, 8, 12, 0::numeric), (DATE '2026-09-10', 'Barbell Lateral Lunge', 2, 8, 10, 30::numeric),
    (DATE '2026-09-11', 'Gym Rowing Machine Normal Speed', 1, 10, 12, 45::numeric), (DATE '2026-09-11', 'Superman pulls Resistance band', 2, 8, 12, 0::numeric),
    (DATE '2026-09-12', 'Barbell clean and press', 1, 12, 6, 35::numeric), (DATE '2026-09-12', 'Cable twisting overhead press', 2, 6, 12, 15::numeric),
    (DATE '2026-09-13', 'Gym Rowing Machine Normal Speed', 1, 20, 10, 50::numeric), (DATE '2026-09-13', 'Chair frog feet elevated glute bridge bodyweight', 2, 10, 12, 0::numeric), (DATE '2026-09-13', 'Barbell clean and press', 3, 3, 6, 20::numeric)
)
INSERT INTO training.workout_exercises (
  id, workout_session_id, exercise_id, exercise_order, exercise_name,
  planned_sets, planned_reps, planned_weight_kg
)
SELECT
  (substr(md5('c493/exercise/' || p.session_date::text || '/' || p.exercise_order), 1, 8) || '-' || substr(md5('c493/exercise/' || p.session_date::text || '/' || p.exercise_order), 9, 4) || '-' || substr(md5('c493/exercise/' || p.session_date::text || '/' || p.exercise_order), 13, 4) || '-' || substr(md5('c493/exercise/' || p.session_date::text || '/' || p.exercise_order), 17, 4) || '-' || substr(md5('c493/exercise/' || p.session_date::text || '/' || p.exercise_order), 21, 12))::uuid,
  (substr(md5('c493/session/' || p.session_date::text), 1, 8) || '-' || substr(md5('c493/session/' || p.session_date::text), 9, 4) || '-' || substr(md5('c493/session/' || p.session_date::text), 13, 4) || '-' || substr(md5('c493/session/' || p.session_date::text), 17, 4) || '-' || substr(md5('c493/session/' || p.session_date::text), 21, 12))::uuid,
  e.id, p.exercise_order, p.exercise_name, p.set_count, p.reps::text, p.weight_kg
FROM plan p
JOIN training.exercises e ON e.name = p.exercise_name
ON CONFLICT (id) DO UPDATE SET
  exercise_id = EXCLUDED.exercise_id, exercise_order = EXCLUDED.exercise_order,
  exercise_name = EXCLUDED.exercise_name, planned_sets = EXCLUDED.planned_sets,
  planned_reps = EXCLUDED.planned_reps, planned_weight_kg = EXCLUDED.planned_weight_kg;

WITH plan(session_date, exercise_order, set_count, reps, weight_kg, rpe, rir) AS (
  VALUES
    (DATE '2026-09-03', 1, 3, 12, 0::numeric, 6::numeric, 5::smallint), (DATE '2026-09-03', 2, 3, 10, 0::numeric, 6::numeric, 5::smallint), (DATE '2026-09-03', 3, 3, 12, 0::numeric, 6::numeric, 5::smallint),
    (DATE '2026-09-04', 1, 4, 12, 4::numeric, 7::numeric, 4::smallint), (DATE '2026-09-04', 2, 3, 10, 0::numeric, 6::numeric, 5::smallint),
    (DATE '2026-09-06', 1, 5, 12, 15::numeric, 7::numeric, 3::smallint), (DATE '2026-09-06', 2, 4, 8, 35::numeric, 7::numeric, 3::smallint),
    (DATE '2026-09-07', 1, 3, 10, 25::numeric, 6::numeric, 5::smallint),
    (DATE '2026-09-08', 1, 5, 12, 12::numeric, 7.5::numeric, 3::smallint), (DATE '2026-09-08', 2, 5, 15, 15::numeric, 7.5::numeric, 3::smallint),
    (DATE '2026-09-09', 1, 6, 12, 0::numeric, 8::numeric, 2::smallint), (DATE '2026-09-09', 2, 3, 12, 0::numeric, 6::numeric, 5::smallint),
    (DATE '2026-09-10', 1, 8, 12, 0::numeric, 8.5::numeric, 2::smallint), (DATE '2026-09-10', 2, 8, 10, 30::numeric, 8::numeric, 2::smallint),
    (DATE '2026-09-11', 1, 10, 12, 45::numeric, 8.5::numeric, 1::smallint), (DATE '2026-09-11', 2, 8, 12, 0::numeric, 8::numeric, 2::smallint),
    (DATE '2026-09-12', 1, 12, 6, 35::numeric, 9::numeric, 1::smallint), (DATE '2026-09-12', 2, 6, 12, 15::numeric, 7::numeric, 4::smallint),
    (DATE '2026-09-13', 1, 20, 10, 50::numeric, 10::numeric, 0::smallint), (DATE '2026-09-13', 2, 10, 12, 0::numeric, 9::numeric, 1::smallint), (DATE '2026-09-13', 3, 3, 6, 20::numeric, 6::numeric, 5::smallint)
)
INSERT INTO training.workout_sets (
  id, workout_exercise_id, set_number, reps, weight_kg, rpe, rir, set_type,
  rest_seconds, logged_via, completed_at
)
SELECT
  (substr(md5('c493/set/' || p.session_date::text || '/' || p.exercise_order || '/' || n), 1, 8) || '-' || substr(md5('c493/set/' || p.session_date::text || '/' || p.exercise_order || '/' || n), 9, 4) || '-' || substr(md5('c493/set/' || p.session_date::text || '/' || p.exercise_order || '/' || n), 13, 4) || '-' || substr(md5('c493/set/' || p.session_date::text || '/' || p.exercise_order || '/' || n), 17, 4) || '-' || substr(md5('c493/set/' || p.session_date::text || '/' || p.exercise_order || '/' || n), 21, 12))::uuid,
  (substr(md5('c493/exercise/' || p.session_date::text || '/' || p.exercise_order), 1, 8) || '-' || substr(md5('c493/exercise/' || p.session_date::text || '/' || p.exercise_order), 9, 4) || '-' || substr(md5('c493/exercise/' || p.session_date::text || '/' || p.exercise_order), 13, 4) || '-' || substr(md5('c493/exercise/' || p.session_date::text || '/' || p.exercise_order), 17, 4) || '-' || substr(md5('c493/exercise/' || p.session_date::text || '/' || p.exercise_order), 21, 12))::uuid,
  n::smallint, p.reps, p.weight_kg, p.rpe, p.rir, 'working', 90, 'manual',
  ((p.session_date + TIME '07:00') + (n - 1) * INTERVAL '2 minutes') AT TIME ZONE 'Asia/Bangkok'
FROM plan p
CROSS JOIN LATERAL generate_series(1, p.set_count) AS n
ON CONFLICT (id) DO UPDATE SET
  reps = EXCLUDED.reps, weight_kg = EXCLUDED.weight_kg, rpe = EXCLUDED.rpe,
  rir = EXCLUDED.rir, set_type = EXCLUDED.set_type, rest_seconds = EXCLUDED.rest_seconds,
  logged_via = EXCLUDED.logged_via, completed_at = EXCLUDED.completed_at;

DO $$
DECLARE
  session_count integer;
  set_count integer;
  foreign_count integer;
BEGIN
  SELECT count(*) INTO session_count
  FROM training.workout_sessions ws
  JOIN auth.users u ON u.id = ws.user_id
  WHERE ws.notes = 'seed-c493' AND u.email = 'dev@lumeos.app';

  SELECT count(*) INTO set_count
  FROM training.workout_sets s
  JOIN training.workout_exercises we ON we.id = s.workout_exercise_id
  JOIN training.workout_sessions ws ON ws.id = we.workout_session_id
  WHERE ws.notes = 'seed-c493';

  SELECT count(*) INTO foreign_count
  FROM training.workout_sessions ws
  JOIN auth.users u ON u.id = ws.user_id
  WHERE ws.notes = 'seed-c493' AND u.email <> 'dev@lumeos.app';

  IF session_count <> 10 OR set_count <> 132 OR foreign_count <> 0 THEN
    RAISE EXCEPTION 'C-493 erwartete 10 Sitzungen, 132 Saetze, 0 fremde Konten; ist: %, %, %',
      session_count, set_count, foreign_count;
  END IF;
END $$;

COMMIT;
