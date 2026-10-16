-- G-617: Ein steuerndes Ziel, beliebig viele Messziele mit expliziter Messquelle.
-- Liegt nach den historischen C-432/G-602/G-604-Proben: deren alte
-- Drei-Slot-Vertraege bleiben als historische Nachweise erhalten.
BEGIN;

ALTER TABLE goals.user_goals
  ADD COLUMN goal_role text,
  ADD COLUMN exercise_id uuid REFERENCES training.exercises(id) ON DELETE RESTRICT,
  ADD COLUMN measurement_type text,
  ADD COLUMN measurement_reps smallint;

-- Variante B: Nur ein tatsaechlicher Phasen- oder Planbezug steuert.
UPDATE goals.user_goals g
SET goal_role = CASE
  WHEN EXISTS (
    SELECT 1 FROM goals.goal_phases gp WHERE gp.goal_id = g.id
  ) OR EXISTS (
    SELECT 1 FROM goals.goal_programs program WHERE program.goal_id = g.id
  ) THEN 'controlling'
  ELSE 'measurement'
END;

-- Zwei fachliche Bankdrueck-Ziele sind in den Grunddaten auch fuer dev
-- gespiegelt. Nur diese vier gemessenen IDs werden zugeordnet.
DO $g617_backfill$
DECLARE
  v_exercise_id uuid;
  v_count integer;
BEGIN
  SELECT count(*) INTO v_count
  FROM training.exercises WHERE name = 'Barbell Bench Press';
  IF v_count <> 1 THEN
    RAISE EXCEPTION 'G-617: Barbell Bench Press ist nicht eindeutig (%)', v_count;
  END IF;
  SELECT id INTO v_exercise_id
  FROM training.exercises WHERE name = 'Barbell Bench Press';
  UPDATE goals.user_goals
  SET exercise_id = v_exercise_id, measurement_type = 'e1rm'
  WHERE id IN (
    '30000000-0000-0000-0000-000000000102',
    '30000000-0000-0000-0000-000000000104',
    '56cc042e-7d74-47b7-b4fb-974c397b4f62',
    '8f8f2114-6173-4bce-90d9-40e43c2e934f'
  )
    AND goal_role = 'measurement'
    AND goal_type = 'performance'
    AND subtype = 'strength'
    AND title IN ('Bankdrücken stabilisieren', '120 kg Bankdrücken bis Juli',
      'Bankdruecken stabilisieren', '120 kg Bankdruecken bis Juli');
END;
$g617_backfill$;

ALTER TABLE goals.user_goals
  ALTER COLUMN goal_role SET NOT NULL,
  ADD CONSTRAINT user_goals_goal_role_check
    CHECK (goal_role IN ('controlling', 'measurement')),
  ADD CONSTRAINT user_goals_measurement_type_check
    CHECK (measurement_type IS NULL OR measurement_type IN
      ('e1rm', 'weight_reps', 'duration', 'distance', 'pace')),
  ADD CONSTRAINT user_goals_measurement_reps_check
    CHECK (measurement_reps IS NULL OR measurement_reps > 0),
  ADD CONSTRAINT user_goals_measurement_source_check
    CHECK (
      (measurement_type IS NULL OR exercise_id IS NOT NULL)
      AND (measurement_type IS NOT DISTINCT FROM 'weight_reps') = (measurement_reps IS NOT NULL)
    );

ALTER TABLE goals.user_goals DROP CONSTRAINT user_goals_check1;
DROP INDEX goals.uq_user_goals_active_slot;
CREATE UNIQUE INDEX uq_user_goals_one_active_controlling
  ON goals.user_goals(user_id)
  WHERE status = 'active' AND goal_role = 'controlling';

CREATE OR REPLACE FUNCTION goals.g617_goal_role_guard()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  -- Die Spalte ist nur ein Index-faehiger Cache. Aufrufer koennen die Rolle
  -- nicht selbst festlegen; auch ein direktes UPDATE wird neu abgeleitet.
  NEW.goal_role := CASE WHEN
    EXISTS (SELECT 1 FROM goals.goal_phases gp WHERE gp.goal_id = NEW.id)
    OR EXISTS (SELECT 1 FROM goals.goal_programs program WHERE program.goal_id = NEW.id)
    THEN 'controlling' ELSE 'measurement' END;
  RETURN NEW;
END;
$$;

CREATE TRIGGER a617_goal_role_guard
  BEFORE INSERT OR UPDATE ON goals.user_goals
  FOR EACH ROW EXECUTE FUNCTION goals.g617_goal_role_guard();

CREATE OR REPLACE FUNCTION goals.g617_sync_goal_role(p_goal_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_role text;
BEGIN
  IF p_goal_id IS NULL THEN
    RETURN;
  END IF;
  v_role := CASE WHEN
    EXISTS (SELECT 1 FROM goals.goal_phases gp WHERE gp.goal_id = p_goal_id)
    OR EXISTS (SELECT 1 FROM goals.goal_programs program WHERE program.goal_id = p_goal_id)
    THEN 'controlling' ELSE 'measurement' END;
  UPDATE goals.user_goals g SET goal_role = v_role
  WHERE g.id = p_goal_id AND g.goal_role IS DISTINCT FROM v_role;
END;
$$;

CREATE OR REPLACE FUNCTION goals.g617_sync_role_after_link_write()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM goals.g617_sync_goal_role(NEW.goal_id);
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM goals.g617_sync_goal_role(OLD.goal_id);
  ELSE
    PERFORM goals.g617_sync_goal_role(OLD.goal_id);
    IF NEW.goal_id IS DISTINCT FROM OLD.goal_id THEN
      PERFORM goals.g617_sync_goal_role(NEW.goal_id);
    END IF;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER a617_phase_role_sync
  AFTER INSERT OR UPDATE OF goal_id OR DELETE ON goals.goal_phases
  FOR EACH ROW EXECUTE FUNCTION goals.g617_sync_role_after_link_write();

CREATE TRIGGER a617_program_role_sync
  AFTER INSERT OR UPDATE OF goal_id OR DELETE ON goals.goal_programs
  FOR EACH ROW EXECUTE FUNCTION goals.g617_sync_role_after_link_write();

REVOKE ALL ON FUNCTION goals.g617_goal_role_guard() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION goals.g617_sync_goal_role(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION goals.g617_sync_goal_role(uuid) TO authenticated, service_role;
REVOKE ALL ON FUNCTION goals.g617_sync_role_after_link_write() FROM PUBLIC, anon, authenticated;

COMMENT ON COLUMN goals.user_goals.goal_role IS
  'G-617/B: nachgefuehrter Cache aus goal_phases und goal_programs; nur deren Existenz macht ein Ziel steuernd. Ein aktives Steuerziel pro Nutzer.';
COMMENT ON COLUMN goals.user_goals.exercise_id IS
  'G-617: gewaehlte Kataloguebung fuer trainingsbasierte Messziele, keine Titelableitung.';
COMMENT ON COLUMN goals.user_goals.measurement_type IS
  'G-617: e1rm, Gewicht bei Wiederholungszahl, Dauer, Distanz oder Pace.';

DO $g617_role_consistency$
BEGIN
  IF EXISTS (
    SELECT 1 FROM goals.user_goals g
    WHERE (g.goal_role = 'controlling') IS DISTINCT FROM (
      EXISTS (SELECT 1 FROM goals.goal_phases gp WHERE gp.goal_id = g.id)
      OR EXISTS (SELECT 1 FROM goals.goal_programs program WHERE program.goal_id = g.id)
    )
  ) THEN
    RAISE EXCEPTION 'G-617: Zielrolle und Phasen-/Planbezug weichen ab';
  END IF;
END;
$g617_role_consistency$;

CREATE OR REPLACE FUNCTION goals.goal_progress_at(
  p_goal_id uuid, p_stichtag date DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  goal_id uuid, user_id uuid, goal_type text, subtype text, title text,
  target_value numeric, target_unit text, start_value numeric,
  current_value numeric, current_source text, progress_pct numeric,
  progress_status text, measured_at date
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  WITH goal_row AS (
    SELECT g.* FROM goals.user_goals g WHERE g.id = p_goal_id
  ),
  body_value AS (
    SELECT bm.weight_kg AS value, bm.measurement_date AS measured_at
    FROM goal_row g
    JOIN LATERAL (
      SELECT bm.weight_kg, bm.measurement_date
      FROM goals.body_measurements bm
      WHERE bm.user_id = g.user_id
        AND bm.measurement_date <= p_stichtag
        AND bm.weight_kg IS NOT NULL
      ORDER BY bm.measurement_date DESC, bm.measurement_time DESC,
               bm.created_at DESC, bm.id DESC
      LIMIT 1
    ) bm ON true
    WHERE g.goal_type = 'body_composition' AND g.target_unit = 'kg'
  ),
  performance_value AS (
    SELECT
      CASE g.measurement_type
        WHEN 'e1rm' THEN max(ws.estimated_1rm)
        WHEN 'weight_reps' THEN max(ws.weight_kg)
          FILTER (WHERE ws.reps >= g.measurement_reps)
        WHEN 'duration' THEN max(ws.duration_seconds)::numeric
        WHEN 'distance' THEN max(ws.distance_meters)
        WHEN 'pace' THEN min(ws.duration_seconds::numeric * 1000
          / nullif(ws.distance_meters, 0))
      END AS value,
      max(s.session_date)::date AS measured_at
    FROM goal_row g
    JOIN training.workout_sessions s
      ON s.user_id = g.user_id AND s.session_date <= p_stichtag
      AND s.status = 'completed'
    JOIN training.workout_exercises we
      ON we.workout_session_id = s.id AND we.exercise_id = g.exercise_id
    JOIN training.workout_sets ws ON ws.workout_exercise_id = we.id
    WHERE g.goal_role = 'measurement'
      AND g.exercise_id IS NOT NULL
      AND g.measurement_type IS NOT NULL
    GROUP BY g.measurement_type, g.measurement_reps
  ),
  selected_value AS (
    SELECT
      CASE
        WHEN g.goal_type = 'body_composition'
          AND g.target_unit = 'kg' THEN bv.value
        WHEN g.goal_role = 'measurement' AND g.exercise_id IS NOT NULL
          THEN pv.value
      END AS current_value,
      CASE
        WHEN g.goal_type = 'body_composition'
          AND g.target_unit = 'kg' AND bv.value IS NOT NULL
          THEN 'goals.body_measurements'
        WHEN g.goal_role = 'measurement' AND pv.value IS NOT NULL
          THEN CASE g.measurement_type
            WHEN 'e1rm' THEN 'training.workout_sets.estimated_1rm'
            WHEN 'weight_reps' THEN 'training.workout_sets.weight_kg'
            WHEN 'duration' THEN 'training.workout_sets.duration_seconds'
            WHEN 'distance' THEN 'training.workout_sets.distance_meters'
            WHEN 'pace' THEN 'training.workout_sets.duration_seconds/distance_meters'
          END
      END AS current_source,
      CASE
        WHEN g.goal_type = 'body_composition'
          AND g.target_unit = 'kg' THEN bv.measured_at
        WHEN g.goal_role = 'measurement' THEN pv.measured_at
      END AS measured_at
    FROM goal_row g
    LEFT JOIN body_value bv ON true
    LEFT JOIN performance_value pv ON true
  )
  SELECT g.id, g.user_id, g.goal_type, g.subtype, g.title,
         g.target_value, g.target_unit, g.start_value,
         v.current_value, v.current_source,
         CASE WHEN v.current_value IS NULL OR g.start_value IS NULL
                OR g.target_value IS NULL OR g.target_value = g.start_value
           THEN NULL
           ELSE round(least(100, greatest(0,
             ((v.current_value - g.start_value)
              / (g.target_value - g.start_value)) * 100))::numeric, 1)
         END AS progress_pct,
         CASE
           WHEN g.goal_type = 'body_composition'
             AND g.target_unit = 'kg' AND v.current_value IS NULL
             THEN 'no_measurement'
           WHEN g.goal_type = 'body_composition'
             AND g.target_unit = 'kg' THEN 'measured'
           WHEN g.goal_role = 'measurement' AND g.exercise_id IS NOT NULL
             AND g.measurement_type IS NOT NULL AND v.current_value IS NULL
             THEN 'no_workout_sets'
           WHEN g.goal_role = 'measurement' AND g.exercise_id IS NOT NULL
             AND g.measurement_type IS NOT NULL THEN 'measured'
           ELSE 'not_measurable'
         END AS progress_status,
         v.measured_at
  FROM goal_row g CROSS JOIN selected_value v;
$$;

COMMENT ON FUNCTION goals.goal_progress_at(uuid, date) IS
  'G-617: Istwert aus expliziter Uebungs-ID und Messart statt aus dem Zieltitel.';

CREATE OR REPLACE FUNCTION goals.active_goal_create(
  p_goal_type text, p_title text, p_gueltig_ab date DEFAULT CURRENT_DATE,
  p_subtype text DEFAULT NULL, p_description text DEFAULT NULL,
  p_target_value numeric DEFAULT NULL, p_target_unit text DEFAULT NULL,
  p_target_date date DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_priority smallint;
  v_goal goals.user_goals%ROWTYPE;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'active_goal_create: Anmeldung erforderlich'
      USING ERRCODE = '42501';
  END IF;
  IF NULLIF(btrim(p_title), '') IS NULL OR p_gueltig_ab IS NULL THEN
    RAISE EXCEPTION 'active_goal_create: Titel und gueltig_ab sind erforderlich'
      USING ERRCODE = '22023';
  END IF;
  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(v_user_id::text, 432));

  -- Ohne Phase/Plan ist auch ein Koerperziel zunaechst ein Messziel.
  SELECT least(10, count(*) + 1)::smallint INTO v_priority
  FROM goals.user_goals
  WHERE user_id = v_user_id AND status = 'active';

  INSERT INTO goals.user_goals (
    user_id, goal_type, subtype, title, description,
    target_value, target_unit, gueltig_ab, target_date,
    status, priority
  ) VALUES (
    v_user_id, p_goal_type, p_subtype, btrim(p_title), p_description,
    p_target_value, p_target_unit, p_gueltig_ab, p_target_date,
    'active', v_priority
  ) RETURNING * INTO v_goal;

  RETURN jsonb_build_object('ok', true, 'goal', jsonb_build_object(
    'id', v_goal.id, 'title', v_goal.title, 'priority', v_goal.priority,
    'is_primary', v_goal.is_primary, 'goal_role', v_goal.goal_role));
END;
$$;

COMMENT ON FUNCTION goals.active_goal_create(text, text, date, text, text, numeric, text, date) IS
  'G-617/B: Ziel beginnt ohne Phase/Plan als Messziel; bei spaeterem Link-Wechsel erzwingt der partielle Index maximal ein aktives Steuerziel.';

-- Die alte Ordnungsfunktion darf Messziele nicht mehr auf drei Slots begrenzen.
CREATE OR REPLACE FUNCTION goals.ziel_reihenfolge_setzen(p_reihenfolge jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_count integer;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'ziel_reihenfolge_setzen: Anmeldung erforderlich'
      USING ERRCODE = '42501';
  END IF;
  IF p_reihenfolge IS NULL OR jsonb_typeof(p_reihenfolge) <> 'array'
     OR jsonb_array_length(p_reihenfolge) = 0 THEN
    RAISE EXCEPTION 'ziel_reihenfolge_setzen: Reihenfolge muss eine nichtleere Liste sein'
      USING ERRCODE = '23514';
  END IF;
  IF EXISTS (
    SELECT 1 FROM jsonb_array_elements(p_reihenfolge) item
    WHERE jsonb_typeof(item) <> 'object'
      OR coalesce(item->>'goal_id', '') !~
        '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
      OR coalesce(item->>'priority', '') !~ '^(10|[1-9])$'
  ) THEN
    RAISE EXCEPTION 'ziel_reihenfolge_setzen: goal_id und priority 1 bis 10 erforderlich'
      USING ERRCODE = '23514';
  END IF;
  SELECT count(*) INTO v_count FROM jsonb_array_elements(p_reihenfolge);
  IF v_count <> (
    SELECT count(DISTINCT (item->>'goal_id')::uuid)
    FROM jsonb_array_elements(p_reihenfolge) item
  ) THEN
    RAISE EXCEPTION 'ziel_reihenfolge_setzen: goal_ids sind nicht eindeutig'
      USING ERRCODE = '23514';
  END IF;
  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(v_user_id::text, 432));
  IF v_count <> (
    SELECT count(*) FROM goals.user_goals
    WHERE user_id = v_user_id AND status = 'active'
  ) OR EXISTS (
    SELECT 1 FROM jsonb_array_elements(p_reihenfolge) item
    WHERE NOT EXISTS (
      SELECT 1 FROM goals.user_goals g
      WHERE g.id = (item->>'goal_id')::uuid
        AND g.user_id = v_user_id AND g.status = 'active')
  ) THEN
    RAISE EXCEPTION 'ziel_reihenfolge_setzen: Alle aktiven eigenen Ziele muessen genannt sein'
      USING ERRCODE = '42501';
  END IF;
  UPDATE goals.user_goals g
  SET priority = (item->>'priority')::smallint
  FROM jsonb_array_elements(p_reihenfolge) item
  WHERE g.id = (item->>'goal_id')::uuid AND g.user_id = v_user_id
    AND g.status = 'active';
END;
$$;

COMMENT ON FUNCTION goals.ziel_reihenfolge_setzen(jsonb) IS
  'G-617: aktualisiert Darstellungsprioritaeten 1-10 aller aktiven eigenen Ziele ohne Drei-Slot-Grenze.';

COMMIT;
