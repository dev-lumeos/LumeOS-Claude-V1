-- 412 -- G-152/E-52: ein gemeinsamer, zeitlich sortierbarer Aktivitaetsstrom
--
-- Sechs Ereignisquellen aus fuenf Modulen. Sie liegt in public, dem bereits
-- exponierten Plattform-Schema: Die Fachschemas bleiben geschlossen, waehrend
-- ein neues quer-Schema fuer diese eine Sicht nur eine zweite API-Exposition
-- schaffen wuerde. Nutrition stellt Mahlzeiten und Wasser, daneben
-- Supplements, Training, Recovery und Medical. Die Sicht
-- vereinheitlicht nur den Leseweg; sie bewertet weder fehlende Ereignisse
-- noch erzeugt sie Daten. Insbesondere bedeutet ein leeres Zeitfenster nicht,
-- dass in einem Modul nichts getan wurde (C-412).

\set ON_ERROR_STOP on

BEGIN;

-- C-414: Der alte Fachschema-Name darf nach einem Kettenlauf nicht neben der
-- Querschnittssicht bestehen bleiben.
DROP VIEW IF EXISTS nutrition.activity_stream;

CREATE OR REPLACE VIEW public.activity_stream
WITH (security_invoker = true) AS
SELECT
  m.user_id,
  m.entry_date AS event_date,
  m.meal_time AS event_time,
  m.entry_date + m.meal_time AS occurred_at,
  'nutrition'::text AS module,
  'meal'::text AS event_type,
  m.id AS event_id,
  'Mahlzeit erfasst: ' || CASE m.meal_type
    WHEN 'breakfast' THEN 'Fruehstueck'
    WHEN 'lunch' THEN 'Mittagessen'
    WHEN 'dinner' THEN 'Abendessen'
    WHEN 'snack' THEN 'Snack'
    ELSE m.meal_type
  END AS summary_de
FROM nutrition.meals m

UNION ALL

SELECT
  w.user_id,
  w.entry_date AS event_date,
  (w.logged_at AT TIME ZONE 'UTC')::time AS event_time,
  w.logged_at AT TIME ZONE 'UTC' AS occurred_at,
  'nutrition'::text AS module,
  'water'::text AS event_type,
  w.id AS event_id,
  'Wasser erfasst: ' || w.amount_ml::text || ' ml' AS summary_de
FROM nutrition.water_logs w

UNION ALL

SELECT
  il.user_id,
  il.intake_date AS event_date,
  il.intake_time AS event_time,
  il.intake_date + il.intake_time AS occurred_at,
  'supplements'::text AS module,
  'supplement_intake'::text AS event_type,
  il.id AS event_id,
  CASE il.status
    WHEN 'taken' THEN 'Supplement eingenommen: '
    WHEN 'skipped' THEN 'Supplement ausgelassen: '
    ELSE 'Supplement erfasst: '
  END || il.supplement_name_snapshot AS summary_de
FROM supplements.intake_logs il

UNION ALL

SELECT
  ws.user_id,
  ws.session_date AS event_date,
  ws.started_time AS event_time,
  ws.session_date + ws.started_time AS occurred_at,
  'training'::text AS module,
  'workout_session'::text AS event_type,
  ws.id AS event_id,
  'Trainingseinheit: ' || COALESCE(NULLIF(btrim(ws.name), ''), 'ohne Titel') AS summary_de
FROM training.workout_sessions ws

UNION ALL

SELECT
  rc.user_id,
  rc.entry_date AS event_date,
  rc.checkin_time AS event_time,
  CASE WHEN rc.checkin_time IS NULL THEN NULL
       ELSE rc.entry_date + rc.checkin_time END AS occurred_at,
  'recovery'::text AS module,
  'recovery_checkin'::text AS event_type,
  rc.id AS event_id,
  'Recovery-Check-in erfasst'::text AS summary_de
FROM recovery.checkins rc

UNION ALL

SELECT
  lr.user_id,
  lr.report_date AS event_date,
  lr.report_time AS event_time,
  CASE WHEN lr.report_time IS NULL THEN NULL
       ELSE lr.report_date + lr.report_time END AS occurred_at,
  'medical'::text AS module,
  'lab_report'::text AS event_type,
  lr.id AS event_id,
  'Laborbefund: ' || COALESCE(
    NULLIF(btrim(lr.title), ''),
    NULLIF(btrim(lr.lab_name), ''),
    'ohne Titel'
  ) AS summary_de
FROM medical.lab_reports lr;

GRANT SELECT ON public.activity_stream TO authenticated, service_role;

COMMENT ON VIEW public.activity_stream IS
  'C-414/G-152/E-52: Querschnittssicht im Plattform-Schema public ueber Mahlzeiten, Wasser, Supplements, Training, Recovery und Medical. event_date und event_time sind die fachlichen Zeitwerte; occurred_at bleibt bei fehlender Uhrzeit NULL statt eine Uhrzeit zu erfinden. C-412: Leere Zeitraeume beschreiben nur den Bestand, keine Einnahme- oder Aktivitaetsaussage.';

COMMIT;
