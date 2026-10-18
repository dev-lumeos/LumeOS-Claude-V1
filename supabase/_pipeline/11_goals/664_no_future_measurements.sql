-- G-664: Quellmessungen nach heute duerfen keine Leser oder das Profil
-- beeinflussen. Historische Stichtage bleiben unveraendert.
BEGIN;

CREATE OR REPLACE FUNCTION goals.measurement_points(p_goal_id uuid, p_through date DEFAULT CURRENT_DATE)
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
      AND bm.measurement_date <= least(p_through,CURRENT_DATE)
    UNION ALL
    SELECT bm.measurement_date, bm.body_fat_pct::numeric,
      'goals.body_measurements.body_fat_pct'::text, bm.id, bm.measurement_time
    FROM g JOIN goals.body_measurements bm ON bm.user_id = g.user_id
    WHERE g.measurement_type = 'body_fat' AND bm.body_fat_pct IS NOT NULL
      AND bm.measurement_date <= least(p_through,CURRENT_DATE)
    UNION ALL
    SELECT bc.measurement_date,
      (to_jsonb(bc)->>g.measurement_site)::numeric,
      'goals.body_circumferences.' || g.measurement_site, bc.id,
      bc.measurement_time
    FROM g JOIN goals.body_circumferences bc ON bc.user_id = g.user_id
    WHERE g.measurement_type = 'circumference'
      AND to_jsonb(bc)->>g.measurement_site IS NOT NULL
      AND bc.measurement_date <= least(p_through,CURRENT_DATE)
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
      AND s.status = 'completed' AND s.session_date <= least(p_through,CURRENT_DATE)
    JOIN training.workout_exercises we ON we.workout_session_id = s.id
      AND we.exercise_id = g.exercise_id
    JOIN training.workout_sets ws ON ws.workout_exercise_id = we.id
    WHERE g.measurement_type IN ('e1rm','weight_reps','duration','distance','pace')
    UNION ALL
    SELECT s.session_date, 1::numeric,
      'training.workout_sessions'::text, s.id, s.started_time
    FROM g JOIN training.workout_sessions s ON s.user_id = g.user_id
      AND s.status = 'completed' AND s.session_date <= least(p_through,CURRENT_DATE)
    WHERE g.measurement_type = 'training_sessions_week'
    UNION ALL
    SELECT s.session_date, 1::numeric,
      'training.workout_sessions.cardio'::text, s.id, s.started_time
    FROM g JOIN training.workout_sessions s ON s.user_id = g.user_id
      AND s.status = 'completed' AND s.session_date <= least(p_through,CURRENT_DATE)
    WHERE g.measurement_type = 'cardio_sessions_week'
      AND EXISTS (SELECT 1 FROM training.workout_exercises we
        JOIN training.exercises e ON e.id = we.exercise_id
        WHERE we.workout_session_id = s.id AND e.exercise_type = 'cardio')
    UNION ALL
    SELECT c.entry_date, c.sleep_hours::numeric,
      'recovery.checkins.sleep_hours'::text, c.id, c.checkin_time
    FROM g JOIN recovery.checkins c ON c.user_id = g.user_id
    WHERE g.measurement_type = 'sleep_hours_night'
      AND c.sleep_hours IS NOT NULL AND c.entry_date <= least(p_through,CURRENT_DATE)
    UNION ALL
    SELECT g.gueltig_ab, g.start_value,
      'goals.user_goals.start_value'::text, g.id, NULL::time
    FROM g WHERE g.measurement_type = 'custom' AND g.start_value IS NOT NULL
      AND g.gueltig_ab <= least(p_through,CURRENT_DATE)
    UNION ALL
    SELECT m.measured_on, m.value, 'goals.manual_goal_values'::text,
      m.id, m.recorded_at::time
    FROM g JOIN goals.manual_goal_values m ON m.goal_id = g.id
    WHERE g.measurement_type = 'custom' AND m.measured_on <= least(p_through,CURRENT_DATE)
  )
  SELECT * FROM points WHERE value IS NOT NULL;
$$;
CREATE OR REPLACE FUNCTION goals.measurement_weeks(p_goal_id uuid, p_through date DEFAULT CURRENT_DATE)
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
    date_trunc('week',least(p_through,CURRENT_DATE))::date, interval '1 week')::date LOOP
    week_start := v_week;
    SELECT count(*), count(*) FILTER (WHERE value >= v_goal.target_value),
      CASE WHEN v_goal.measurement_type = 'sleep_hours_night' THEN avg(value)
        WHEN v_goal.measurement_type IN ('training_sessions_week','cardio_sessions_week')
          THEN count(*)::numeric
        ELSE (array_agg(value ORDER BY measured_on DESC, measured_time DESC,
          source_id DESC))[1] END
    INTO v_count, v_hit_count, observed_value
    FROM goals.measurement_points(p_goal_id,least(p_through,CURRENT_DATE)) p
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
CREATE OR REPLACE FUNCTION goals.measurement_goal_start_preview(
  p_measurement_type text,p_as_of date DEFAULT CURRENT_DATE,
  p_exercise_id uuid DEFAULT NULL,p_measurement_site text DEFAULT NULL,
  p_measurement_reps smallint DEFAULT NULL,p_manual_start numeric DEFAULT NULL
)
RETURNS TABLE (
  wert numeric,datum date,quelle text,quelle_id uuid,kennung text
)
LANGUAGE plpgsql STABLE SECURITY INVOKER SET search_path='' AS $$
DECLARE
  v_user uuid := auth.uid();
  v_wert numeric;
  v_datum date;
  v_quelle text;
  v_quelle_id uuid;
BEGIN
  IF v_user IS NULL THEN RETURN; END IF;
  IF p_measurement_type='circumference' AND NOT EXISTS (
    SELECT 1 FROM goals.measurement_circumference_sites
    WHERE site=p_measurement_site
  ) THEN
    RAISE EXCEPTION 'G617_SITE: eine der 13 Koerperstellen waehlen'
      USING ERRCODE='23514';
  END IF;
  IF p_measurement_type IN ('steps_day','cardio_sessions_week') THEN
    RETURN QUERY SELECT NULL::numeric,NULL::date,NULL::text,NULL::uuid,
      'vorgemerkt'::text;
    RETURN;
  ELSIF p_measurement_type='circumference' THEN
    SELECT (to_jsonb(bc)->>p_measurement_site)::numeric,
      bc.measurement_date,'goals.body_circumferences.'||p_measurement_site,
      bc.id
    INTO v_wert,v_datum,v_quelle,v_quelle_id
    FROM goals.body_circumferences bc
    WHERE bc.user_id=v_user AND bc.measurement_date<=least(p_as_of,CURRENT_DATE)
      AND to_jsonb(bc)->>p_measurement_site IS NOT NULL
    ORDER BY bc.measurement_date DESC,bc.measurement_time DESC,
      bc.created_at DESC,bc.id DESC LIMIT 1;
  ELSIF p_measurement_type IN ('body_weight','body_fat') THEN
    SELECT CASE WHEN p_measurement_type='body_weight' THEN bm.weight_kg
        ELSE bm.body_fat_pct END,
      bm.measurement_date,
      CASE WHEN p_measurement_type='body_weight'
        THEN 'goals.body_measurements'
        ELSE 'goals.body_measurements.body_fat_pct' END,
      bm.id
    INTO v_wert,v_datum,v_quelle,v_quelle_id
    FROM goals.body_measurements bm
    WHERE bm.user_id=v_user AND bm.measurement_date<=least(p_as_of,CURRENT_DATE)
      AND (p_measurement_type='body_weight' OR bm.body_fat_pct IS NOT NULL)
    ORDER BY bm.measurement_date DESC,bm.measurement_time DESC,
      bm.created_at DESC,bm.id DESC LIMIT 1;
  ELSIF p_measurement_type IN
    ('e1rm','weight_reps','duration','distance','pace') THEN
    SELECT CASE p_measurement_type WHEN 'e1rm' THEN ws.estimated_1rm
        WHEN 'weight_reps' THEN ws.weight_kg
        WHEN 'duration' THEN ws.duration_seconds::numeric
        WHEN 'distance' THEN ws.distance_meters
        WHEN 'pace' THEN ws.duration_seconds::numeric*1000/
          nullif(ws.distance_meters,0) END,
      s.session_date,'training.workout_sets'::text,ws.id
    INTO v_wert,v_datum,v_quelle,v_quelle_id
    FROM training.workout_sessions s
    JOIN training.workout_exercises we ON we.workout_session_id=s.id
      AND we.exercise_id=p_exercise_id
    JOIN training.workout_sets ws ON ws.workout_exercise_id=we.id
    WHERE s.user_id=v_user AND s.status='completed'
      AND s.session_date<=least(p_as_of,CURRENT_DATE)
      AND (p_measurement_type<>'weight_reps'
        OR ws.reps>=p_measurement_reps)
    ORDER BY CASE WHEN p_measurement_type='pace' THEN
        ws.duration_seconds::numeric*1000/nullif(ws.distance_meters,0)
      END ASC NULLS LAST,
      CASE WHEN p_measurement_type<>'pace' THEN
        CASE p_measurement_type WHEN 'e1rm' THEN ws.estimated_1rm
          WHEN 'weight_reps' THEN ws.weight_kg
          WHEN 'duration' THEN ws.duration_seconds::numeric
          WHEN 'distance' THEN ws.distance_meters END
      END DESC NULLS LAST,
      s.session_date DESC,ws.id DESC LIMIT 1;
  ELSIF p_measurement_type IN
    ('training_sessions_week','cardio_sessions_week') THEN
    SELECT round(count(*)::numeric/4,2),least(p_as_of,CURRENT_DATE),
      'training.workout_sessions.4week_average'::text,NULL::uuid
    INTO v_wert,v_datum,v_quelle,v_quelle_id
    FROM training.workout_sessions s
    WHERE s.user_id=v_user AND s.status='completed'
      AND s.session_date>=least(p_as_of,CURRENT_DATE)-28 AND s.session_date<least(p_as_of,CURRENT_DATE)
      AND (p_measurement_type='training_sessions_week' OR EXISTS (
        SELECT 1 FROM training.workout_exercises we
        JOIN training.exercises e ON e.id=we.exercise_id
        WHERE we.workout_session_id=s.id AND e.exercise_type='cardio'));
  ELSIF p_measurement_type='sleep_hours_night' THEN
    SELECT round(avg(c.sleep_hours),2),least(p_as_of,CURRENT_DATE),
      'recovery.checkins.4week_average'::text,NULL::uuid
    INTO v_wert,v_datum,v_quelle,v_quelle_id
    FROM recovery.checkins c
    WHERE c.user_id=v_user AND c.entry_date>=least(p_as_of,CURRENT_DATE)-28
      AND c.entry_date<least(p_as_of,CURRENT_DATE) AND c.sleep_hours IS NOT NULL;
  ELSIF p_measurement_type='custom' THEN
    v_wert := p_manual_start;
    v_datum := p_as_of;
    v_quelle := 'goals.user_goals.start_value';
  ELSE
    RAISE EXCEPTION 'G617_TYPE: unbekannte Messart' USING ERRCODE='23514';
  END IF;
  RETURN QUERY SELECT v_wert,v_datum,v_quelle,v_quelle_id,
    CASE WHEN v_wert IS NULL THEN 'erst_messen' ELSE 'gemessen' END::text;
END $$;

CREATE OR REPLACE FUNCTION goals.refresh_profile_body_weight(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_weight numeric;
BEGIN
  SELECT bm.weight_kg
    INTO v_weight
  FROM goals.body_measurements bm
  WHERE bm.user_id = p_user_id
    AND bm.measurement_date <= CURRENT_DATE
  ORDER BY bm.measurement_date DESC, bm.measurement_time DESC, bm.created_at DESC, bm.id DESC
  LIMIT 1;

  IF v_weight IS NOT NULL THEN
    UPDATE public.profiles p
       SET body_weight_kg = v_weight,
           updated_at = now()
     WHERE p.id = p_user_id;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION goals.body_composition_navy(
  p_user_id uuid,
  p_date date DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  user_id uuid,
  measurement_date date,
  measurement_time time,
  body_fat_pct numeric,
  body_fat_pct_min numeric,
  body_fat_pct_max numeric,
  standard_error_pct_points numeric,
  ffmi numeric,
  lean_mass_kg numeric,
  weight_kg numeric,
  method text,
  source text,
  input_source text,
  input_source_detail text,
  caution text
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
WITH circumference AS (
  SELECT bc.*
  FROM goals.body_circumferences bc
  WHERE bc.user_id = p_user_id
    AND bc.measurement_date <= least(p_date,CURRENT_DATE)
  ORDER BY bc.measurement_date DESC, bc.measurement_time DESC, bc.created_at DESC, bc.id DESC
  LIMIT 1
),
latest_weight AS (
  SELECT bm.weight_kg
  FROM goals.body_measurements bm
  WHERE bm.user_id = p_user_id
    AND bm.measurement_date <= least(p_date,CURRENT_DATE)
  ORDER BY bm.measurement_date DESC, bm.measurement_time DESC, bm.created_at DESC, bm.id DESC
  LIMIT 1
),
input AS (
  SELECT
    p.id AS user_id,
    p.biological_sex,
    p.height_cm,
    COALESCE(lw.weight_kg, p.body_weight_kg) AS weight_kg,
    c.measurement_date,
    c.measurement_time,
    c.neck_cm,
    c.waist_cm,
    c.hip_cm,
    c.measurement_source,
    c.source_detail
  FROM public.profiles p
  JOIN circumference c ON c.user_id = p.id
  LEFT JOIN latest_weight lw ON true
  WHERE p.id = p_user_id
    AND p.biological_sex IN ('male', 'female')
    AND p.height_cm IS NOT NULL
    AND c.neck_cm IS NOT NULL
    AND c.waist_cm IS NOT NULL
    AND (p.biological_sex = 'male' OR c.hip_cm IS NOT NULL)
    AND CASE
      WHEN p.biological_sex = 'male' THEN c.waist_cm > c.neck_cm
      ELSE (c.waist_cm + c.hip_cm) > c.neck_cm
    END
),
calculated AS (
  SELECT
    i.*,
    CASE
      WHEN i.biological_sex = 'male' THEN
        86.010 * (ln((i.waist_cm - i.neck_cm) / 2.54) / ln(10::numeric))
        - 70.041 * (ln(i.height_cm / 2.54) / ln(10::numeric))
        + 36.76
      ELSE
        163.205 * (ln((i.waist_cm + i.hip_cm - i.neck_cm) / 2.54) / ln(10::numeric))
        - 97.684 * (ln(i.height_cm / 2.54) / ln(10::numeric))
        - 78.387
    END AS navy_pct
  FROM input i
),
rounded AS (
  SELECT
    c.*,
    round(c.navy_pct::numeric, 2) AS navy_pct_rounded
  FROM calculated c
)
SELECT
  r.user_id,
  r.measurement_date,
  r.measurement_time,
  r.navy_pct_rounded AS body_fat_pct,
  greatest(0, round((r.navy_pct_rounded - 3.5)::numeric, 2)) AS body_fat_pct_min,
  round((r.navy_pct_rounded + 3.5)::numeric, 2) AS body_fat_pct_max,
  3.5::numeric AS standard_error_pct_points,
  CASE
    WHEN r.weight_kg IS NULL THEN NULL
    ELSE round((
      (r.weight_kg * (1 - r.navy_pct_rounded / 100))
      / ((r.height_cm / 100.0) * (r.height_cm / 100.0))
      + 6.1 * (1.8 - (r.height_cm / 100.0))
    )::numeric, 2)
  END AS ffmi,
  CASE
    WHEN r.weight_kg IS NULL THEN NULL
    ELSE round((r.weight_kg * (1 - r.navy_pct_rounded / 100))::numeric, 2)
  END AS lean_mass_kg,
  r.weight_kg,
  'navy_circumference'::text AS method,
  'derived_navy'::text AS source,
  r.measurement_source AS input_source,
  r.source_detail AS input_source_detail,
  'Umfangsverfahren: Standardfehler ca. +/-3,5 Prozentpunkte; kann Athleten mit hoher Muskelmasse ueberschaetzen; Quellen nicht mischen.'::text AS caution
FROM rounded r;
$$;

CREATE OR REPLACE FUNCTION goals.phase_start_weight_selection(p_user_id uuid,p_day date)
RETURNS TABLE (weight_kg numeric,measurement_date date,selected_id uuid,
  measurement_count integer,spread_kg numeric)
LANGUAGE sql STABLE SECURITY INVOKER SET search_path='' AS $$
  WITH latest_day AS (
    SELECT max(b.measurement_date) AS day
    FROM goals.body_measurements b
    WHERE b.user_id=p_user_id AND b.measurement_date<=least(p_day,CURRENT_DATE)
      AND b.weight_kg>0
  ), day_values AS (
    SELECT b.id,b.measurement_date,b.measurement_time,b.created_at,b.weight_kg
    FROM goals.body_measurements b JOIN latest_day d
      ON b.measurement_date=d.day
    WHERE b.user_id=p_user_id AND b.weight_kg>0
  ), metrics AS (
    SELECT count(*)::integer AS n,max(weight_kg)-min(weight_kg) AS spread
    FROM day_values
  )
  SELECT chosen.weight_kg,chosen.measurement_date,chosen.id,
    metrics.n,metrics.spread
  FROM metrics LEFT JOIN LATERAL (
    SELECT d.* FROM day_values d
    ORDER BY d.measurement_time DESC,d.created_at DESC,d.id DESC LIMIT 1
  ) chosen ON true;
$$;
REVOKE ALL ON FUNCTION goals.measurement_points(uuid,date),
  goals.measurement_weeks(uuid,date),
  goals.measurement_goal_start_preview(text,date,uuid,text,smallint,numeric),
  goals.refresh_profile_body_weight(uuid),
  goals.body_composition_navy(uuid,date),
  goals.phase_start_weight_selection(uuid,date) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION goals.measurement_points(uuid,date),
  goals.measurement_weeks(uuid,date),
  goals.measurement_goal_start_preview(text,date,uuid,text,smallint,numeric),
  goals.body_composition_navy(uuid,date),
  goals.phase_start_weight_selection(uuid,date) TO authenticated,service_role;
GRANT EXECUTE ON FUNCTION goals.refresh_profile_body_weight(uuid)
  TO authenticated,service_role;
COMMIT;
