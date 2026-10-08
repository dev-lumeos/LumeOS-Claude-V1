-- G-617 erweitert: Messziele fuer Koerper, Gewohnheit und Eigenes.
-- Dieser Nachtrag liegt nach der historischen G-617-Probe und vor G-622.
BEGIN;

ALTER TABLE goals.user_goals
  ADD COLUMN measurement_site text,
  ADD COLUMN measurement_rhythm text NOT NULL DEFAULT 'once'
    CHECK (measurement_rhythm IN ('once', 'weekly')),
  ADD COLUMN better_direction text
    CHECK (better_direction IS NULL OR better_direction IN ('more', 'less')),
  ADD COLUMN start_source text,
  ADD COLUMN start_source_id uuid,
  ADD COLUMN start_measured_at date;

ALTER TABLE goals.user_goals DROP CONSTRAINT user_goals_measurement_type_check;
ALTER TABLE goals.user_goals ADD CONSTRAINT user_goals_measurement_type_check
  CHECK (measurement_type IS NULL OR measurement_type IN (
    'e1rm', 'weight_reps', 'duration', 'distance', 'pace',
    'body_weight', 'body_fat', 'circumference',
    'training_sessions_week', 'cardio_sessions_week', 'sleep_hours_night',
    'steps_day', 'custom'));
ALTER TABLE goals.user_goals DROP CONSTRAINT user_goals_measurement_source_check;
ALTER TABLE goals.user_goals ADD CONSTRAINT user_goals_measurement_source_check
  CHECK (
    (measurement_type IS NULL OR measurement_type NOT IN
      ('e1rm','weight_reps','duration','distance','pace') OR exercise_id IS NOT NULL)
    AND (measurement_type IS NOT DISTINCT FROM 'weight_reps') = (measurement_reps IS NOT NULL)
    AND (measurement_type IS NOT DISTINCT FROM 'circumference') = (measurement_site IS NOT NULL)
    AND (measurement_type IS DISTINCT FROM 'custom') = (better_direction IS NULL)
    AND (measurement_type IS NULL OR measurement_type NOT IN
      ('e1rm','weight_reps','duration','distance','pace') OR measurement_rhythm = 'once')
    AND (measurement_type IS NULL OR measurement_type NOT IN
      ('training_sessions_week','cardio_sessions_week','sleep_hours_night','steps_day')
      OR measurement_rhythm = 'weekly')
  );

-- Die 13 Stellen entsprechen exakt goals.body_circumferences.
CREATE VIEW goals.measurement_source_options WITH (security_invoker = true) AS
SELECT v.measurement_type, v.availability, v.source_name
FROM (VALUES
  ('body_weight','available','goals.body_measurements'),
  ('body_fat','available','goals.body_measurements'),
  ('circumference','available','goals.body_circumferences'),
  ('e1rm','available','training.workout_sets'),
  ('weight_reps','available','training.workout_sets'),
  ('training_sessions_week','available','training.workout_sessions'),
  ('cardio_sessions_week','pending','no_cardio_session_source'),
  ('sleep_hours_night','available','recovery.checkins'),
  ('custom','available','goals.manual_goal_values'),
  ('steps_day','pending','no_step_source'),
  ('health','pending','medical_goal_source'),
  ('endurance','pending','cardio_measurement_source')
) v(measurement_type,availability,source_name);
GRANT SELECT ON goals.measurement_source_options TO authenticated, service_role;

CREATE VIEW goals.measurement_circumference_sites WITH (security_invoker = true) AS
SELECT site FROM (VALUES
  ('neck_cm'),('shoulders_cm'),('chest_cm'),('upper_arm_left_cm'),
  ('upper_arm_right_cm'),('forearm_left_cm'),('forearm_right_cm'),
  ('waist_cm'),('hip_cm'),('thigh_left_cm'),('thigh_right_cm'),
  ('calf_left_cm'),('calf_right_cm')
) v(site);
GRANT SELECT ON goals.measurement_circumference_sites TO authenticated, service_role;

CREATE TABLE goals.manual_goal_values (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id uuid NOT NULL REFERENCES goals.user_goals(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  measured_on date NOT NULL,
  value numeric(12,3) NOT NULL,
  recorded_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX manual_goal_values_goal_day_idx
  ON goals.manual_goal_values(goal_id, measured_on DESC, recorded_at DESC);
ALTER TABLE goals.manual_goal_values ENABLE ROW LEVEL SECURITY;
CREATE POLICY manual_goal_values_select_own ON goals.manual_goal_values
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() AND EXISTS (
    SELECT 1 FROM goals.user_goals g WHERE g.id = goal_id
      AND g.user_id = auth.uid() AND g.measurement_type = 'custom'));
CREATE POLICY manual_goal_values_insert_own ON goals.manual_goal_values
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND EXISTS (
    SELECT 1 FROM goals.user_goals g WHERE g.id = goal_id
      AND g.user_id = auth.uid() AND g.measurement_type = 'custom'));
CREATE POLICY manual_goal_values_update_own ON goals.manual_goal_values
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid() AND EXISTS (
    SELECT 1 FROM goals.user_goals g WHERE g.id = goal_id
      AND g.user_id = auth.uid() AND g.measurement_type = 'custom'))
  WITH CHECK (user_id = auth.uid() AND EXISTS (
    SELECT 1 FROM goals.user_goals g WHERE g.id = goal_id
      AND g.user_id = auth.uid() AND g.measurement_type = 'custom'));
CREATE POLICY manual_goal_values_delete_own ON goals.manual_goal_values
  FOR DELETE TO authenticated
  USING (user_id = auth.uid() AND EXISTS (
    SELECT 1 FROM goals.user_goals g WHERE g.id = goal_id
      AND g.user_id = auth.uid() AND g.measurement_type = 'custom'));
GRANT SELECT, INSERT, UPDATE, DELETE ON goals.manual_goal_values TO authenticated;
GRANT ALL ON goals.manual_goal_values TO service_role;

-- Rohpunkte behalten den Bezug zum Quellsatz. Der Titel ist nie Suchkriterium.
CREATE FUNCTION goals.measurement_points(p_goal_id uuid, p_through date DEFAULT CURRENT_DATE)
RETURNS TABLE(measured_on date, value numeric, source_name text,
  source_id uuid, measured_time time)
LANGUAGE sql STABLE SECURITY INVOKER SET search_path = '' AS $$
  WITH g AS (SELECT * FROM goals.user_goals WHERE id = p_goal_id),
  points AS (
    SELECT bm.measurement_date AS measured_on, bm.weight_kg::numeric AS value,
      'goals.body_measurements'::text AS source_name, bm.id AS source_id,
      bm.measurement_time AS measured_time
    FROM g JOIN goals.body_measurements bm ON bm.user_id = g.user_id
    WHERE (g.measurement_type = 'body_weight' OR
      (g.measurement_type IS NULL AND g.goal_type = 'body_composition'
        AND g.target_unit = 'kg'))
      AND bm.measurement_date <= p_through
    UNION ALL
    SELECT bm.measurement_date, bm.body_fat_pct::numeric,
      'goals.body_measurements.body_fat_pct'::text, bm.id, bm.measurement_time
    FROM g JOIN goals.body_measurements bm ON bm.user_id = g.user_id
    WHERE g.measurement_type = 'body_fat' AND bm.body_fat_pct IS NOT NULL
      AND bm.measurement_date <= p_through
    UNION ALL
    SELECT bc.measurement_date,
      (to_jsonb(bc)->>g.measurement_site)::numeric,
      'goals.body_circumferences.' || g.measurement_site, bc.id,
      bc.measurement_time
    FROM g JOIN goals.body_circumferences bc ON bc.user_id = g.user_id
    WHERE g.measurement_type = 'circumference'
      AND to_jsonb(bc)->>g.measurement_site IS NOT NULL
      AND bc.measurement_date <= p_through
    UNION ALL
    SELECT s.session_date,
      CASE g.measurement_type
        WHEN 'e1rm' THEN ws.estimated_1rm
        WHEN 'weight_reps' THEN CASE WHEN ws.reps >= g.measurement_reps THEN ws.weight_kg END
        WHEN 'duration' THEN ws.duration_seconds::numeric
        WHEN 'distance' THEN ws.distance_meters
        WHEN 'pace' THEN ws.duration_seconds::numeric * 1000 /
          nullif(ws.distance_meters,0)
      END,
      CASE g.measurement_type
        WHEN 'e1rm' THEN 'training.workout_sets.estimated_1rm'
        WHEN 'weight_reps' THEN 'training.workout_sets.weight_kg'
        WHEN 'duration' THEN 'training.workout_sets.duration_seconds'
        WHEN 'distance' THEN 'training.workout_sets.distance_meters'
        WHEN 'pace' THEN 'training.workout_sets.duration_seconds/distance_meters'
      END, ws.id, s.started_time
    FROM g JOIN training.workout_sessions s ON s.user_id = g.user_id
      AND s.status = 'completed' AND s.session_date <= p_through
    JOIN training.workout_exercises we ON we.workout_session_id = s.id
      AND we.exercise_id = g.exercise_id
    JOIN training.workout_sets ws ON ws.workout_exercise_id = we.id
    WHERE g.measurement_type IN ('e1rm','weight_reps','duration','distance','pace')
    UNION ALL
    SELECT s.session_date, 1::numeric,
      'training.workout_sessions'::text, s.id, s.started_time
    FROM g JOIN training.workout_sessions s ON s.user_id = g.user_id
      AND s.status = 'completed' AND s.session_date <= p_through
    WHERE g.measurement_type = 'training_sessions_week'
    UNION ALL
    SELECT s.session_date, 1::numeric,
      'training.workout_sessions.cardio'::text, s.id, s.started_time
    FROM g JOIN training.workout_sessions s ON s.user_id = g.user_id
      AND s.status = 'completed' AND s.session_date <= p_through
    WHERE g.measurement_type = 'cardio_sessions_week'
      AND EXISTS (SELECT 1 FROM training.workout_exercises we
        JOIN training.exercises e ON e.id = we.exercise_id
        WHERE we.workout_session_id = s.id AND e.exercise_type = 'cardio')
    UNION ALL
    SELECT c.entry_date, c.sleep_hours::numeric,
      'recovery.checkins.sleep_hours'::text, c.id, c.checkin_time
    FROM g JOIN recovery.checkins c ON c.user_id = g.user_id
    WHERE g.measurement_type = 'sleep_hours_night'
      AND c.sleep_hours IS NOT NULL AND c.entry_date <= p_through
    UNION ALL
    SELECT g.gueltig_ab, g.start_value,
      'goals.user_goals.start_value'::text, g.id, NULL::time
    FROM g WHERE g.measurement_type = 'custom' AND g.start_value IS NOT NULL
      AND g.gueltig_ab <= p_through
    UNION ALL
    SELECT m.measured_on, m.value, 'goals.manual_goal_values'::text,
      m.id, m.recorded_at::time
    FROM g JOIN goals.manual_goal_values m ON m.goal_id = g.id
    WHERE g.measurement_type = 'custom' AND m.measured_on <= p_through
  )
  SELECT * FROM points WHERE value IS NOT NULL;
$$;
GRANT EXECUTE ON FUNCTION goals.measurement_points(uuid,date)
  TO authenticated, service_role;

CREATE FUNCTION goals.measurement_weeks(p_goal_id uuid, p_through date DEFAULT CURRENT_DATE)
RETURNS TABLE(week_start date, observed_value numeric, quota_pct numeric,
  streak_weeks integer, target_met boolean)
LANGUAGE plpgsql STABLE SECURITY INVOKER SET search_path = '' AS $$
DECLARE
  v_goal goals.user_goals%ROWTYPE;
  v_week date;
  v_count integer;
  v_hit_count integer;
  v_streak integer := 0;
BEGIN
  SELECT * INTO v_goal FROM goals.user_goals WHERE id = p_goal_id;
  IF NOT FOUND OR v_goal.measurement_rhythm <> 'weekly'
    OR p_through < v_goal.gueltig_ab THEN RETURN; END IF;
  FOR v_week IN SELECT generate_series(
    date_trunc('week',v_goal.gueltig_ab)::date,
    date_trunc('week',p_through)::date, interval '1 week')::date LOOP
    week_start := v_week;
    SELECT count(*), count(*) FILTER (WHERE value >= v_goal.target_value),
      CASE WHEN v_goal.measurement_type = 'sleep_hours_night' THEN avg(value)
        WHEN v_goal.measurement_type IN ('training_sessions_week','cardio_sessions_week')
          THEN count(*)::numeric
        ELSE (array_agg(value ORDER BY measured_on DESC, measured_time DESC,
          source_id DESC))[1] END
    INTO v_count, v_hit_count, observed_value
    FROM goals.measurement_points(p_goal_id,p_through) p
    WHERE p.measured_on >= v_week AND p.measured_on < v_week + 7
      AND p.measured_on >= v_goal.gueltig_ab;
    IF v_goal.measurement_type = 'sleep_hours_night' THEN
      quota_pct := round(v_hit_count::numeric / 7 * 100,1);
      target_met := v_hit_count = 7;
    ELSIF v_goal.measurement_type IN ('training_sessions_week','cardio_sessions_week') THEN
      quota_pct := round(v_count::numeric / nullif(v_goal.target_value,0) * 100,1);
      target_met := v_count >= v_goal.target_value;
    ELSE
      quota_pct := CASE WHEN observed_value IS NULL THEN 0
        WHEN coalesce(v_goal.better_direction,
          CASE WHEN v_goal.target_value < v_goal.start_value THEN 'less' ELSE 'more' END) = 'less'
          THEN round(v_goal.target_value / nullif(observed_value,0) * 100,1)
        ELSE round(observed_value / nullif(v_goal.target_value,0) * 100,1) END;
      target_met := observed_value IS NOT NULL AND
        CASE WHEN coalesce(v_goal.better_direction,
          CASE WHEN v_goal.target_value < v_goal.start_value THEN 'less' ELSE 'more' END) = 'less'
          THEN observed_value <= v_goal.target_value
          ELSE observed_value >= v_goal.target_value END;
    END IF;
    v_streak := CASE WHEN target_met THEN v_streak + 1 ELSE 0 END;
    streak_weeks := v_streak;
    RETURN NEXT;
  END LOOP;
END;
$$;
GRANT EXECUTE ON FUNCTION goals.measurement_weeks(uuid,date)
  TO authenticated, service_role;

CREATE FUNCTION goals.g617_measurement_goal_snapshot()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
DECLARE
  v_point record;
  v_type text := NEW.measurement_type;
BEGIN
  IF v_type IS NULL THEN RETURN NEW; END IF;
  IF v_type IN ('steps_day','cardio_sessions_week') THEN
    RAISE EXCEPTION 'G617_SOURCE_PENDING: diese Gewohnheit ist vorgemerkt'
      USING ERRCODE = '23514';
  END IF;
  IF v_type = 'circumference' AND NOT EXISTS (
    SELECT 1 FROM goals.measurement_circumference_sites
    WHERE site = NEW.measurement_site) THEN
    RAISE EXCEPTION 'G617_SITE: eine der 13 Koerperstellen waehlen'
      USING ERRCODE = '23514';
  END IF;
  IF v_type IN ('body_weight','body_fat','circumference') THEN
    IF (v_type = 'body_weight' AND NEW.target_unit IS DISTINCT FROM 'kg')
      OR (v_type = 'body_fat' AND NEW.target_unit IS DISTINCT FROM '%')
      OR (v_type = 'circumference' AND NEW.target_unit IS DISTINCT FROM 'cm') THEN
      RAISE EXCEPTION 'G617_UNIT: feste Koerpereinheit verwenden'
        USING ERRCODE = '23514';
    END IF;
    IF v_type = 'circumference' THEN
      SELECT (to_jsonb(bc)->>NEW.measurement_site)::numeric AS value,
        bc.measurement_date AS day, bc.id AS source_id,
        'goals.body_circumferences.' || NEW.measurement_site AS source_name
      INTO v_point FROM goals.body_circumferences bc
      WHERE bc.user_id = NEW.user_id AND bc.measurement_date <= NEW.gueltig_ab
        AND to_jsonb(bc)->>NEW.measurement_site IS NOT NULL
      ORDER BY bc.measurement_date DESC, bc.measurement_time DESC,
        bc.created_at DESC, bc.id DESC LIMIT 1;
    ELSE
      SELECT CASE WHEN v_type = 'body_weight' THEN bm.weight_kg
        ELSE bm.body_fat_pct END AS value,
        bm.measurement_date AS day, bm.id AS source_id,
        CASE WHEN v_type = 'body_weight' THEN 'goals.body_measurements'
          ELSE 'goals.body_measurements.body_fat_pct' END AS source_name
      INTO v_point FROM goals.body_measurements bm
      WHERE bm.user_id = NEW.user_id AND bm.measurement_date <= NEW.gueltig_ab
        AND (v_type = 'body_weight' OR bm.body_fat_pct IS NOT NULL)
      ORDER BY bm.measurement_date DESC, bm.measurement_time DESC,
        bm.created_at DESC, bm.id DESC LIMIT 1;
    END IF;
    IF v_point.value IS NULL THEN
      RAISE EXCEPTION 'G617_FIRST_MEASURE: erst messen'
        USING ERRCODE = '23514';
    END IF;
  ELSIF v_type IN ('e1rm','weight_reps','duration','distance','pace') THEN
    IF TG_OP = 'INSERT' AND NEW.target_unit IS DISTINCT FROM
      (CASE WHEN v_type IN ('e1rm','weight_reps') THEN 'kg'
        WHEN v_type = 'duration' THEN 'seconds'
        WHEN v_type = 'distance' THEN 'm' ELSE 'sec_per_km' END) THEN
      RAISE EXCEPTION 'G617_UNIT: feste Krafteinheit verwenden'
        USING ERRCODE = '23514';
    END IF;
    IF NEW.exercise_id IS NULL OR NEW.measurement_rhythm <> 'once' THEN
      RAISE EXCEPTION 'G617_STRENGTH: Uebung und einmaliger Rhythmus erforderlich'
        USING ERRCODE = '23514';
    END IF;
    SELECT CASE v_type WHEN 'e1rm' THEN ws.estimated_1rm
      WHEN 'weight_reps' THEN ws.weight_kg
      WHEN 'duration' THEN ws.duration_seconds::numeric
      WHEN 'distance' THEN ws.distance_meters
      WHEN 'pace' THEN ws.duration_seconds::numeric * 1000 /
        nullif(ws.distance_meters,0) END AS value,
      s.session_date AS day, ws.id AS source_id,
      'training.workout_sets'::text AS source_name
    INTO v_point FROM training.workout_sessions s
    JOIN training.workout_exercises we ON we.workout_session_id = s.id
      AND we.exercise_id = NEW.exercise_id
    JOIN training.workout_sets ws ON ws.workout_exercise_id = we.id
    WHERE s.user_id = NEW.user_id AND s.status = 'completed'
      AND s.session_date <= NEW.gueltig_ab
      AND (v_type <> 'weight_reps' OR ws.reps >= NEW.measurement_reps)
    ORDER BY CASE WHEN v_type = 'pace' THEN
        ws.duration_seconds::numeric * 1000 / nullif(ws.distance_meters,0)
      END ASC NULLS LAST,
      CASE WHEN v_type <> 'pace' THEN CASE v_type
        WHEN 'e1rm' THEN ws.estimated_1rm WHEN 'weight_reps' THEN ws.weight_kg
        WHEN 'duration' THEN ws.duration_seconds::numeric
        WHEN 'distance' THEN ws.distance_meters END END DESC NULLS LAST,
      s.session_date DESC, ws.id DESC LIMIT 1;
  ELSIF v_type IN ('training_sessions_week','cardio_sessions_week') THEN
    IF NEW.target_unit IS DISTINCT FROM 'sessions_per_week'
      OR NEW.target_value <= 0 THEN
      RAISE EXCEPTION 'G617_HABIT: positive Sitzungen pro Woche angeben'
        USING ERRCODE = '23514';
    END IF;
    SELECT round(count(*)::numeric / 4,2) AS value,
      NEW.gueltig_ab AS day, NULL::uuid AS source_id,
      'training.workout_sessions.4week_average'::text AS source_name
    INTO v_point FROM training.workout_sessions s
    WHERE s.user_id = NEW.user_id AND s.status = 'completed'
      AND s.session_date >= NEW.gueltig_ab - 28
      AND s.session_date < NEW.gueltig_ab
      AND (v_type = 'training_sessions_week' OR EXISTS (
        SELECT 1 FROM training.workout_exercises we
        JOIN training.exercises e ON e.id = we.exercise_id
        WHERE we.workout_session_id = s.id AND e.exercise_type = 'cardio'));
  ELSIF v_type = 'sleep_hours_night' THEN
    IF NEW.target_unit IS DISTINCT FROM 'h/night'
      OR NEW.target_value <= 0 OR NEW.target_value > 14 THEN
      RAISE EXCEPTION 'G617_HABIT: Schlafziel in Stunden pro Nacht angeben'
        USING ERRCODE = '23514';
    END IF;
    SELECT round(avg(c.sleep_hours),2) AS value,
      NEW.gueltig_ab AS day, NULL::uuid AS source_id,
      'recovery.checkins.4week_average'::text AS source_name
    INTO v_point FROM recovery.checkins c
    WHERE c.user_id = NEW.user_id AND c.entry_date >= NEW.gueltig_ab - 28
      AND c.entry_date < NEW.gueltig_ab AND c.sleep_hours IS NOT NULL;
  ELSIF v_type = 'custom' THEN
    IF NEW.start_value IS NULL OR nullif(btrim(NEW.target_unit),'') IS NULL
      OR NEW.better_direction IS NULL THEN
      RAISE EXCEPTION 'G617_CUSTOM: Start, Einheit und Richtung angeben'
        USING ERRCODE = '23514';
    END IF;
    NEW.current_value := NEW.start_value;
    NEW.start_source := 'goals.user_goals.start_value';
    NEW.start_source_id := NEW.id;
    NEW.start_measured_at := NEW.gueltig_ab;
    RETURN NEW;
  END IF;
  IF v_type IN ('training_sessions_week','cardio_sessions_week','sleep_hours_night')
    AND NEW.measurement_rhythm <> 'weekly' THEN
    RAISE EXCEPTION 'G617_HABIT: Gewohnheit ist wiederkehrend'
      USING ERRCODE = '23514';
  END IF;
  NEW.start_value := v_point.value;
  NEW.current_value := v_point.value;
  NEW.start_source := v_point.source_name;
  NEW.start_source_id := v_point.source_id;
  NEW.start_measured_at := v_point.day;
  RETURN NEW;
END;
$$;
CREATE TRIGGER b617_measurement_goal_snapshot
  BEFORE INSERT OR UPDATE OF measurement_type, measurement_site, exercise_id,
    measurement_reps ON goals.user_goals
  FOR EACH ROW EXECUTE FUNCTION goals.g617_measurement_goal_snapshot();
REVOKE ALL ON FUNCTION goals.g617_measurement_goal_snapshot()
  FROM PUBLIC, anon, authenticated;

CREATE FUNCTION goals.measurement_goal_create(
  p_measurement_type text, p_title text, p_target_value numeric,
  p_target_unit text, p_gueltig_ab date DEFAULT CURRENT_DATE,
  p_target_date date DEFAULT NULL, p_exercise_id uuid DEFAULT NULL,
  p_measurement_reps smallint DEFAULT NULL, p_measurement_site text DEFAULT NULL,
  p_measurement_rhythm text DEFAULT NULL, p_better_direction text DEFAULT NULL,
  p_start_value numeric DEFAULT NULL
) RETURNS uuid LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
DECLARE v_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'G617_AUTH: Anmeldung erforderlich' USING ERRCODE = '42501';
  END IF;
  IF p_target_value IS NULL OR p_gueltig_ab IS NULL
    OR nullif(btrim(p_title),'') IS NULL THEN
    RAISE EXCEPTION 'G617_INPUT: Titel, Zielwert und Datum erforderlich'
      USING ERRCODE = '23514';
  END IF;
  IF p_measurement_type NOT IN ('body_weight','body_fat','circumference',
    'e1rm','weight_reps','duration','distance','pace',
    'training_sessions_week','cardio_sessions_week','sleep_hours_night',
    'steps_day','custom') OR p_measurement_type IS NULL THEN
    RAISE EXCEPTION 'G617_TYPE: unbekannte Messart' USING ERRCODE = '23514';
  END IF;
  INSERT INTO goals.user_goals (
    user_id, goal_type, subtype, title, target_value, target_unit,
    start_value, gueltig_ab, target_date, status, priority,
    exercise_id, measurement_type, measurement_reps, measurement_site,
    measurement_rhythm, better_direction
  ) VALUES (
    auth.uid(), CASE WHEN p_measurement_type IN
      ('body_weight','body_fat','circumference') THEN 'body_composition'
      WHEN p_measurement_type IN ('e1rm','weight_reps','duration','distance','pace')
        THEN 'performance' ELSE 'lifestyle' END,
    p_measurement_type, btrim(p_title), p_target_value, p_target_unit,
    p_start_value, p_gueltig_ab, p_target_date, 'active', 5,
    p_exercise_id, p_measurement_type, p_measurement_reps, p_measurement_site,
    coalesce(p_measurement_rhythm, CASE WHEN p_measurement_type IN
      ('training_sessions_week','cardio_sessions_week','sleep_hours_night','steps_day')
      THEN 'weekly' ELSE 'once' END), p_better_direction
  ) RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;
REVOKE ALL ON FUNCTION goals.measurement_goal_create(text,text,numeric,text,date,date,uuid,smallint,text,text,text,numeric)
  FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION goals.measurement_goal_create(text,text,numeric,text,date,date,uuid,smallint,text,text,text,numeric)
  TO authenticated, service_role;

CREATE OR REPLACE FUNCTION goals.goal_progress_at(
  p_goal_id uuid, p_stichtag date DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  goal_id uuid, user_id uuid, goal_type text, subtype text, title text,
  target_value numeric, target_unit text, start_value numeric,
  current_value numeric, current_source text, progress_pct numeric,
  progress_status text, measured_at date
)
LANGUAGE sql STABLE SECURITY INVOKER SET search_path = '' AS $$
  SELECT g.id, g.user_id, g.goal_type, g.subtype, g.title,
    g.target_value, g.target_unit, g.start_value,
    CASE WHEN g.measurement_rhythm = 'weekly' THEN w.observed_value
      ELSE p.value END,
    CASE WHEN g.measurement_rhythm = 'weekly' THEN
      CASE g.measurement_type
        WHEN 'training_sessions_week' THEN 'training.workout_sessions'
        WHEN 'cardio_sessions_week' THEN 'training.workout_sessions.cardio'
        WHEN 'sleep_hours_night' THEN 'recovery.checkins.sleep_hours'
        ELSE p.source_name END
      ELSE p.source_name END,
    CASE
      WHEN g.measurement_rhythm = 'weekly' THEN w.quota_pct
      WHEN p.value IS NULL OR g.start_value IS NULL OR g.target_value IS NULL
        OR g.target_value = g.start_value THEN NULL
      ELSE round(least(100,greatest(0,
        (p.value-g.start_value) / (g.target_value-g.start_value) * 100)),1)
    END,
    CASE
      WHEN g.measurement_rhythm = 'weekly' AND w.week_start IS NOT NULL
        THEN 'measured'
      WHEN p.value IS NOT NULL THEN 'measured'
      WHEN g.measurement_type IN ('body_weight','body_fat','circumference')
        OR (g.measurement_type IS NULL AND g.goal_type = 'body_composition'
          AND g.target_unit = 'kg') THEN 'no_measurement'
      WHEN g.measurement_type IN ('e1rm','weight_reps','duration','distance','pace')
        THEN 'no_workout_sets'
      ELSE 'not_measurable' END,
    CASE WHEN g.measurement_rhythm = 'weekly' THEN least(p_stichtag,w.week_start+6)
      ELSE p.measured_on END
  FROM goals.user_goals g
  LEFT JOIN LATERAL (
    SELECT mp.* FROM goals.measurement_points(g.id,p_stichtag) mp
    ORDER BY
      CASE WHEN g.measurement_type IN ('e1rm','weight_reps','duration','distance')
        THEN mp.value END DESC NULLS LAST,
      CASE WHEN g.measurement_type = 'pace' THEN mp.value END ASC NULLS LAST,
      mp.measured_on DESC, mp.measured_time DESC NULLS LAST, mp.source_id DESC
    LIMIT 1
  ) p ON true
  LEFT JOIN LATERAL (
    SELECT mw.* FROM goals.measurement_weeks(g.id,p_stichtag) mw
    ORDER BY mw.week_start DESC LIMIT 1
  ) w ON g.measurement_rhythm = 'weekly'
  WHERE g.id = p_goal_id;
$$;
COMMENT ON FUNCTION goals.goal_progress_at(uuid,date) IS
  'G-617 erweitert: Istwert aus Koerper-, Trainings-, Recovery- oder eigenen Datenpunkten; Wochenziele liefern die aktuelle Quote.';

CREATE OR REPLACE FUNCTION goals.refresh_user_goal_progress(
  p_goal_id uuid, p_stichtag date DEFAULT CURRENT_DATE
) RETURNS boolean LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
DECLARE
  v_progress record;
  v_first record;
BEGIN
  SELECT * INTO v_progress FROM goals.goal_progress_at(p_goal_id,p_stichtag);
  IF NOT FOUND OR v_progress.progress_status IS DISTINCT FROM 'measured' THEN
    RETURN false;
  END IF;
  IF v_progress.start_value IS NULL THEN
    SELECT mp.* INTO v_first
    FROM goals.user_goals g
    JOIN LATERAL goals.measurement_points(g.id,p_stichtag) mp ON true
    WHERE g.id = p_goal_id
      AND g.measurement_type IN ('e1rm','weight_reps','duration','distance','pace')
      AND mp.measured_on >= g.gueltig_ab
    ORDER BY mp.measured_on, mp.measured_time NULLS LAST, mp.source_id
    LIMIT 1;
    IF FOUND THEN
      UPDATE goals.user_goals SET start_value = v_first.value,
        start_source = v_first.source_name,
        start_source_id = v_first.source_id,
        start_measured_at = v_first.measured_on
      WHERE id = p_goal_id AND start_value IS NULL;
      SELECT * INTO v_progress FROM goals.goal_progress_at(p_goal_id,p_stichtag);
    END IF;
  END IF;
  UPDATE goals.user_goals
  SET current_value = v_progress.current_value,
    progress_pct = coalesce(v_progress.progress_pct,0), updated_at = now()
  WHERE id = p_goal_id AND auto_update;
  RETURN FOUND;
END;
$$;

CREATE FUNCTION goals.g617_manual_value_guard()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
DECLARE v_start date;
BEGIN
  SELECT gueltig_ab INTO v_start FROM goals.user_goals
  WHERE id = NEW.goal_id AND user_id = NEW.user_id
    AND measurement_type = 'custom';
  IF NOT FOUND OR NEW.measured_on < v_start THEN
    RAISE EXCEPTION 'G617_MANUAL: nur eigenes Ziel ab Startdatum'
      USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER g617_manual_value_guard
  BEFORE INSERT OR UPDATE ON goals.manual_goal_values
  FOR EACH ROW EXECUTE FUNCTION goals.g617_manual_value_guard();
REVOKE ALL ON FUNCTION goals.g617_manual_value_guard()
  FROM PUBLIC, anon, authenticated;

-- Zusätzliche Quellschreibwege aktualisieren denselben Progress-Snapshot.
CREATE FUNCTION goals.g617_refresh_from_measurement_source()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
BEGIN
  IF TG_OP IN ('INSERT','UPDATE') THEN
    PERFORM goals.refresh_user_goals_progress_for_user(NEW.user_id,CURRENT_DATE);
  END IF;
  IF TG_OP IN ('UPDATE','DELETE') AND
    (TG_OP = 'DELETE' OR OLD.user_id IS DISTINCT FROM NEW.user_id) THEN
    PERFORM goals.refresh_user_goals_progress_for_user(OLD.user_id,CURRENT_DATE);
  END IF;
  RETURN coalesce(NEW,OLD);
END;
$$;
CREATE TRIGGER g617_circumference_progress
  AFTER INSERT OR UPDATE OR DELETE ON goals.body_circumferences
  FOR EACH ROW EXECUTE FUNCTION goals.g617_refresh_from_measurement_source();
CREATE TRIGGER g617_training_session_progress
  AFTER INSERT OR UPDATE OR DELETE ON training.workout_sessions
  FOR EACH ROW EXECUTE FUNCTION goals.g617_refresh_from_measurement_source();
CREATE TRIGGER g617_recovery_checkin_progress
  AFTER INSERT OR UPDATE OR DELETE ON recovery.checkins
  FOR EACH ROW EXECUTE FUNCTION goals.g617_refresh_from_measurement_source();
CREATE TRIGGER g617_manual_value_progress
  AFTER INSERT OR UPDATE OR DELETE ON goals.manual_goal_values
  FOR EACH ROW EXECUTE FUNCTION goals.g617_refresh_from_measurement_source();
REVOKE ALL ON FUNCTION goals.g617_refresh_from_measurement_source()
  FROM PUBLIC, anon, authenticated;

-- Der beim Anlegen eingefrorene Anfangswert darf nicht als Handwert
-- ueberschrieben werden. Bei Kraft ohne Altwert ist genau der erste Satz
-- die eine erlaubte spaetere Initialisierung.
CREATE FUNCTION goals.g617_measurement_snapshot_immutable()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
DECLARE
  v_first record;
  v_current numeric;
BEGIN
  IF OLD.measurement_type IS NULL THEN RETURN NEW; END IF;
  IF NEW.measurement_type IS DISTINCT FROM OLD.measurement_type THEN
    RAISE EXCEPTION 'G617_TYPE_FIXED: Messart nach Anlage festgehalten'
      USING ERRCODE = '23514';
  END IF;
  IF NEW.start_value IS DISTINCT FROM OLD.start_value
    OR NEW.start_source IS DISTINCT FROM OLD.start_source
    OR NEW.start_source_id IS DISTINCT FROM OLD.start_source_id
    OR NEW.start_measured_at IS DISTINCT FROM OLD.start_measured_at THEN
    IF OLD.start_value IS NOT NULL OR OLD.measurement_type NOT IN
      ('e1rm','weight_reps','duration','distance','pace') THEN
      RAISE EXCEPTION 'G617_START_FIXED: Startwert ist festgehalten'
        USING ERRCODE = '23514';
    END IF;
    SELECT mp.* INTO v_first FROM goals.measurement_points(OLD.id,CURRENT_DATE) mp
    WHERE mp.measured_on >= OLD.gueltig_ab
    ORDER BY mp.measured_on, mp.measured_time NULLS LAST, mp.source_id LIMIT 1;
    IF NOT FOUND OR NEW.start_value IS DISTINCT FROM v_first.value
      OR NEW.start_source IS DISTINCT FROM v_first.source_name
      OR NEW.start_source_id IS DISTINCT FROM v_first.source_id
      OR NEW.start_measured_at IS DISTINCT FROM v_first.measured_on THEN
      RAISE EXCEPTION 'G617_START_FIXED: nur der erste Trainingswert'
        USING ERRCODE = '23514';
    END IF;
  END IF;
  IF NEW.current_value IS DISTINCT FROM OLD.current_value THEN
    SELECT p.current_value INTO v_current
    FROM goals.goal_progress_at(OLD.id,CURRENT_DATE) p;
    IF NEW.current_value IS DISTINCT FROM v_current THEN
      RAISE EXCEPTION 'G617_SOURCE_ONLY: Istwert kommt aus der Messquelle'
        USING ERRCODE = '23514';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER c617_measurement_snapshot_immutable
  BEFORE UPDATE OF measurement_type, start_value, start_source, start_source_id,
    start_measured_at, current_value ON goals.user_goals
  FOR EACH ROW EXECUTE FUNCTION goals.g617_measurement_snapshot_immutable();
REVOKE ALL ON FUNCTION goals.g617_measurement_snapshot_immutable()
  FROM PUBLIC, anon, authenticated;

COMMIT;
