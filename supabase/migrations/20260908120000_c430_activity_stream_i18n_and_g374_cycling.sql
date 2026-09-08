-- C-430/G-374: Jede Datenbankantwort liefert die drei UI-Sprachen; ein
-- konfigurierter Einnahmezyklus hat seinen Beginn im zusammenhaengenden JSONB.

BEGIN;

CREATE OR REPLACE VIEW public.activity_stream
WITH (security_invoker = true) AS
SELECT
  m.user_id, m.entry_date AS event_date, m.meal_time AS event_time,
  m.entry_date + m.meal_time AS occurred_at,
  'nutrition'::text AS module, 'meal'::text AS event_type, m.id AS event_id,
  'Mahlzeit erfasst: ' || CASE m.meal_type
    WHEN 'breakfast' THEN 'Fruehstueck' WHEN 'lunch' THEN 'Mittagessen'
    WHEN 'dinner' THEN 'Abendessen' WHEN 'snack' THEN 'Snack' ELSE m.meal_type END AS summary_de,
  'Meal logged: ' || CASE m.meal_type
    WHEN 'breakfast' THEN 'Breakfast' WHEN 'lunch' THEN 'Lunch'
    WHEN 'dinner' THEN 'Dinner' WHEN 'snack' THEN 'Snack' ELSE m.meal_type END AS summary_en,
  'บันทึกมื้ออาหาร: ' || CASE m.meal_type
    WHEN 'breakfast' THEN 'อาหารเช้า' WHEN 'lunch' THEN 'อาหารกลางวัน'
    WHEN 'dinner' THEN 'อาหารเย็น' WHEN 'snack' THEN 'ของว่าง' ELSE m.meal_type END AS summary_th
FROM nutrition.meals m

UNION ALL
SELECT
  w.user_id, w.entry_date, (w.logged_at AT TIME ZONE 'UTC')::time,
  w.logged_at AT TIME ZONE 'UTC',
  'nutrition'::text, 'water'::text, w.id,
  'Wasser erfasst: ' || w.amount_ml::text || ' ml',
  'Water logged: ' || w.amount_ml::text || ' ml',
  'บันทึกน้ำ: ' || w.amount_ml::text || ' มล.'
FROM nutrition.water_logs w

UNION ALL
SELECT
  il.user_id, il.intake_date, il.intake_time, il.intake_date + il.intake_time,
  'supplements'::text, 'supplement_intake'::text, il.id,
  CASE il.status WHEN 'taken' THEN 'Supplement eingenommen: '
                 WHEN 'skipped' THEN 'Supplement ausgelassen: ' ELSE 'Supplement erfasst: ' END || il.supplement_name_snapshot,
  CASE il.status WHEN 'taken' THEN 'Supplement taken: '
                 WHEN 'skipped' THEN 'Supplement skipped: ' ELSE 'Supplement logged: ' END || il.supplement_name_snapshot,
  CASE il.status WHEN 'taken' THEN 'รับประทานอาหารเสริม: '
                 WHEN 'skipped' THEN 'ข้ามอาหารเสริม: ' ELSE 'บันทึกอาหารเสริม: ' END || il.supplement_name_snapshot
FROM supplements.intake_logs il

UNION ALL
SELECT
  ws.user_id, ws.session_date, ws.started_time, ws.session_date + ws.started_time,
  'training'::text, 'workout_session'::text, ws.id,
  'Trainingseinheit: ' || COALESCE(NULLIF(btrim(ws.name), ''), 'ohne Titel'),
  'Workout: ' || COALESCE(NULLIF(btrim(ws.name), ''), 'untitled'),
  'การฝึก: ' || COALESCE(NULLIF(btrim(ws.name), ''), 'ไม่มีชื่อ')
FROM training.workout_sessions ws

UNION ALL
SELECT
  rc.user_id, rc.entry_date, rc.checkin_time,
  CASE WHEN rc.checkin_time IS NULL THEN NULL ELSE rc.entry_date + rc.checkin_time END,
  'recovery'::text, 'recovery_checkin'::text, rc.id,
  'Recovery-Check-in erfasst'::text, 'Recovery check-in logged'::text, 'บันทึกการเช็กอินการฟื้นตัว'::text
FROM recovery.checkins rc

UNION ALL
SELECT
  lr.user_id, lr.report_date, lr.report_time,
  CASE WHEN lr.report_time IS NULL THEN NULL ELSE lr.report_date + lr.report_time END,
  'medical'::text, 'lab_report'::text, lr.id,
  'Laborbefund: ' || COALESCE(NULLIF(btrim(lr.title), ''), NULLIF(btrim(lr.lab_name), ''), 'ohne Titel'),
  'Lab report: ' || COALESCE(NULLIF(btrim(lr.title), ''), NULLIF(btrim(lr.lab_name), ''), 'untitled'),
  'รายงานผลแล็บ: ' || COALESCE(NULLIF(btrim(lr.title), ''), NULLIF(btrim(lr.lab_name), ''), 'ไม่มีชื่อ')
FROM medical.lab_reports lr;

GRANT SELECT ON public.activity_stream TO authenticated, service_role;

ALTER TABLE supplements.stack_items
  DROP CONSTRAINT IF EXISTS stack_items_cycling_check;
ALTER TABLE supplements.stack_items
  ADD CONSTRAINT stack_items_cycling_check CHECK (
    cycling IS NULL OR (
      jsonb_typeof(cycling) = 'object'
      AND jsonb_typeof(cycling -> 'on_weeks') = 'number'
      AND (cycling ->> 'on_weeks')::numeric > 0
      AND jsonb_typeof(cycling -> 'off_weeks') = 'number'
      AND (cycling ->> 'off_weeks')::numeric >= 0
      AND jsonb_typeof(cycling -> 'started_on') = 'string'
      AND cycling ->> 'started_on' ~ '^\d{4}-\d{2}-\d{2}$'
    ) IS TRUE
  );

COMMENT ON VIEW public.activity_stream IS
  'C-414/C-430/G-152/E-52: Dreisprachige security-invoker-Querschnittssicht ueber sechs Ereignisquellen; keine Bewertung aus einer Luecke.';
COMMENT ON CONSTRAINT stack_items_cycling_check ON supplements.stack_items IS
  'G-374: Ein vorhandener cycling-Block ist nur mit on_weeks, off_weeks und started_on vollstaendig; NULL bleibt kein Zyklus.';

COMMIT;
