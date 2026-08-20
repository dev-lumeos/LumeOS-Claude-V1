-- F-07: Prueft, dass der Coach-Lesepfad (152) die Freigabe DURCHSETZT —
-- beide Richtungen, je Modul, unter RLS.
--
-- Aufruf (Wegwerf-DB, Seed-Konten):
--   docker exec -i supabase_db_LumeOS-Claude-V1 psql -U postgres -d lumeos_f07 \
--     < supabase/_pipeline/_validierung/coach-lesepfad-pruefen.sql
-- Live (angelegtes Portal-Konto):
--   ... -d postgres -v coach_email="'coach@lumeos.app'" -v voll_email="'dev@lumeos.app'" ...
--
-- Erwartete Rechtelage (C-147/F-07-Seeds):
--   voll  (tom.seed bzw. dev):  nutrition full, training full,
--                               recovery summary, medical none
--   teil  (max.seed):           training/recovery summary, sonst none
--   ohne  (sarah.seed):         eingeladen, keine Rechte
--
-- Laeuft in EINER Transaktion und rollt zurueck — nur Lesen.
\set ON_ERROR_STOP on

\if :{?coach_email} \else \set coach_email '''coach.seed@example.com''' \endif
\if :{?voll_email}  \else \set voll_email  '''tom.seed@example.com'''   \endif
\if :{?teil_email}  \else \set teil_email  '''max.seed@example.com'''   \endif
\if :{?ohne_email}  \else \set ohne_email  '''sarah.seed@example.com''' \endif

BEGIN;

SELECT id AS coach_id FROM auth.users WHERE email = :coach_email \gset
SELECT id AS voll_id FROM auth.users WHERE email = :voll_email \gset
SELECT id AS teil_id FROM auth.users WHERE email = :teil_email \gset
SELECT id AS ohne_id FROM auth.users WHERE email = :ohne_email \gset

CREATE TEMP TABLE pruefkonten (rolle text PRIMARY KEY, id uuid NOT NULL) ON COMMIT DROP;
INSERT INTO pruefkonten VALUES
  ('coach', :'coach_id'::uuid),
  ('voll', :'voll_id'::uuid),
  ('teil', :'teil_id'::uuid),
  ('ohne', :'ohne_id'::uuid);

-- Die DO-Bloecke laufen als authenticated und lesen die Kontenliste.
GRANT SELECT ON pruefkonten TO authenticated;

-- Wegwerf-DB: der Auth-Stub der Kette vergibt kein USAGE auf auth —
-- live ist beides laengst da (No-op). Ohne das faellt auth.uid().
GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT EXECUTE ON FUNCTION auth.uid() TO authenticated;

-- ============ Sicht des COACHES ============
-- Beide Schreibweisen setzen: der Auth-Stub der Wegwerf-DB liest
-- request.jwt.claim.sub (alt), das Live-auth.uid() request.jwt.claims.
SET LOCAL ROLE authenticated;
SELECT
  set_config('request.jwt.claims',
    json_build_object('sub', (SELECT id FROM pruefkonten WHERE rolle = 'coach'),
                      'role', 'authenticated')::text, true),
  set_config('request.jwt.claim.sub',
    (SELECT id FROM pruefkonten WHERE rolle = 'coach')::text, true) \gset _

DO $$
DECLARE
  voll uuid := (SELECT id FROM pruefkonten WHERE rolle = 'voll');
  teil uuid := (SELECT id FROM pruefkonten WHERE rolle = 'teil');
  ohne uuid := (SELECT id FROM pruefkonten WHERE rolle = 'ohne');
  n bigint;
  j jsonb;
BEGIN
  -- full oeffnet Zeilen
  SELECT count(*) INTO n FROM nutrition.meals WHERE user_id = voll;
  IF n = 0 THEN RAISE EXCEPTION 'Coach sieht 0 Mahlzeiten trotz nutrition=full'; END IF;
  RAISE NOTICE 'OK Coach: nutrition full -> % Mahlzeiten', n;

  SELECT count(*) INTO n
  FROM training.workout_sets ws
  JOIN training.workout_exercises we ON we.id = ws.workout_exercise_id
  JOIN training.workout_sessions s ON s.id = we.workout_session_id
  WHERE s.user_id = voll;
  IF n = 0 THEN RAISE EXCEPTION 'Coach sieht 0 Saetze trotz training=full'; END IF;
  RAISE NOTICE 'OK Coach: training full -> % Saetze (doppelter Join)', n;

  -- summary oeffnet KEINE Zeilen, aber das Aggregat
  SELECT count(*) INTO n FROM recovery.scores WHERE user_id = voll;
  IF n <> 0 THEN RAISE EXCEPTION 'Coach sieht % Recovery-Zeilen trotz recovery=summary', n; END IF;
  SELECT coach.summary_recovery(voll) INTO j;
  IF (j->>'freigegeben')::boolean IS NOT TRUE THEN
    RAISE EXCEPTION 'summary_recovery verweigert trotz recovery=summary: %', j;
  END IF;
  RAISE NOTICE 'OK Coach: recovery summary -> 0 Zeilen, Aggregat %', j;

  -- none oeffnet nichts, auch kein Aggregat
  SELECT count(*) INTO n FROM medical.lab_reports WHERE user_id = voll;
  IF n <> 0 THEN RAISE EXCEPTION 'Coach sieht % Befunde trotz medical=none', n; END IF;
  SELECT coach.summary_medical(voll) INTO j;
  IF (j->>'freigegeben')::boolean IS NOT FALSE THEN
    RAISE EXCEPTION 'summary_medical liefert trotz medical=none: %', j;
  END IF;
  RAISE NOTICE 'OK Coach: medical none -> 0 Zeilen, Aggregat verweigert';

  -- zweiter Athlet: summary heisst nicht full
  SELECT count(*) INTO n FROM nutrition.meals WHERE user_id = teil;
  IF n <> 0 THEN RAISE EXCEPTION 'Coach sieht % Mahlzeiten von Teil trotz nutrition=none', n; END IF;
  SELECT count(*) INTO n FROM training.workout_sessions WHERE user_id = teil;
  IF n <> 0 THEN RAISE EXCEPTION 'Coach sieht % Einheiten von Teil trotz training=summary', n; END IF;
  SELECT coach.summary_training(teil) INTO j;
  IF (j->>'freigegeben')::boolean IS NOT TRUE THEN
    RAISE EXCEPTION 'summary_training verweigert trotz training=summary: %', j;
  END IF;
  RAISE NOTICE 'OK Coach: Teil-Athlet -> keine Zeilen, Training-Aggregat %', j;

  -- eingeladen ohne Rechte: gar nichts
  SELECT count(*) INTO n FROM nutrition.meals WHERE user_id = ohne;
  IF n <> 0 THEN RAISE EXCEPTION 'Coach sieht % Mahlzeiten des Eingeladenen', n; END IF;
  SELECT coach.summary_nutrition(ohne) INTO j;
  IF (j->>'freigegeben')::boolean IS NOT FALSE THEN
    RAISE EXCEPTION 'summary_nutrition liefert ohne Freigabe: %', j;
  END IF;
  RAISE NOTICE 'OK Coach: Eingeladener ohne Rechte -> nichts';

  -- Arbeitsobjekte des Portals
  SELECT count(*) INTO n FROM coach.checkins;
  IF n < 3 THEN RAISE EXCEPTION 'Coach sieht nur % Check-ins statt >= 3', n; END IF;
  SELECT count(*) INTO n FROM coach.relationships;
  IF n < 3 THEN RAISE EXCEPTION 'Coach sieht nur % Beziehungen statt >= 3', n; END IF;
  RAISE NOTICE 'OK Coach: Check-ins und Beziehungen sichtbar';
END $$;

-- ============ Sicht eines DRITTEN (Teil-Athlet als Abfragender) ============
SELECT
  set_config('request.jwt.claims',
    json_build_object('sub', (SELECT id FROM pruefkonten WHERE rolle = 'teil'),
                      'role', 'authenticated')::text, true),
  set_config('request.jwt.claim.sub',
    (SELECT id FROM pruefkonten WHERE rolle = 'teil')::text, true) \gset _

DO $$
DECLARE
  voll uuid := (SELECT id FROM pruefkonten WHERE rolle = 'voll');
  n bigint;
  j jsonb;
BEGIN
  SELECT count(*) INTO n FROM nutrition.meals WHERE user_id = voll;
  IF n <> 0 THEN RAISE EXCEPTION 'Dritter sieht % fremde Mahlzeiten', n; END IF;

  SELECT count(*) INTO n FROM coach.checkins WHERE client_id = voll;
  IF n <> 0 THEN RAISE EXCEPTION 'Dritter sieht % fremde Check-ins', n; END IF;

  SELECT coach.summary_nutrition(voll) INTO j;
  IF (j->>'freigegeben')::boolean IS NOT FALSE THEN
    RAISE EXCEPTION 'summary_nutrition liefert einem Dritten: %', j;
  END IF;

  SELECT count(*) INTO n FROM coach.relationships;
  IF n <> 1 THEN RAISE EXCEPTION 'Dritter sieht % Beziehungen statt nur der eigenen 1', n; END IF;

  RAISE NOTICE 'OK Dritter: fremde Zeilen 0, Aggregat verweigert, nur eigene Beziehung';
END $$;

-- ============ Sicht des EIGENTUEMERS (unversehrt) ============
SELECT
  set_config('request.jwt.claims',
    json_build_object('sub', (SELECT id FROM pruefkonten WHERE rolle = 'voll'),
                      'role', 'authenticated')::text, true),
  set_config('request.jwt.claim.sub',
    (SELECT id FROM pruefkonten WHERE rolle = 'voll')::text, true) \gset _

DO $$
DECLARE
  voll uuid := (SELECT id FROM pruefkonten WHERE rolle = 'voll');
  n_meals bigint;
  n_checkins bigint;
BEGIN
  SELECT count(*) INTO n_meals FROM nutrition.meals WHERE user_id = voll;
  IF n_meals = 0 THEN RAISE EXCEPTION 'Eigentuemer sieht seine Mahlzeiten nicht mehr'; END IF;
  SELECT count(*) INTO n_checkins FROM coach.checkins WHERE client_id = voll;
  IF n_checkins < 3 THEN RAISE EXCEPTION 'Eigentuemer sieht nur % eigene Check-ins', n_checkins; END IF;
  RAISE NOTICE 'OK Eigentuemer: % Mahlzeiten, % Check-ins unveraendert sichtbar', n_meals, n_checkins;
END $$;

ROLLBACK;
\echo LESEPFAD-PRUEFUNG BESTANDEN
