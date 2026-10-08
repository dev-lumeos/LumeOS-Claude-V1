-- G-634: Vorschau und Snapshot verwenden dieselbe Startwertabfrage.
BEGIN;

CREATE FUNCTION goals.measurement_goal_start_preview(
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
    WHERE bc.user_id=v_user AND bc.measurement_date<=p_as_of
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
    WHERE bm.user_id=v_user AND bm.measurement_date<=p_as_of
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
      AND s.session_date<=p_as_of
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
    SELECT round(count(*)::numeric/4,2),p_as_of,
      'training.workout_sessions.4week_average'::text,NULL::uuid
    INTO v_wert,v_datum,v_quelle,v_quelle_id
    FROM training.workout_sessions s
    WHERE s.user_id=v_user AND s.status='completed'
      AND s.session_date>=p_as_of-28 AND s.session_date<p_as_of
      AND (p_measurement_type='training_sessions_week' OR EXISTS (
        SELECT 1 FROM training.workout_exercises we
        JOIN training.exercises e ON e.id=we.exercise_id
        WHERE we.workout_session_id=s.id AND e.exercise_type='cardio'));
  ELSIF p_measurement_type='sleep_hours_night' THEN
    SELECT round(avg(c.sleep_hours),2),p_as_of,
      'recovery.checkins.4week_average'::text,NULL::uuid
    INTO v_wert,v_datum,v_quelle,v_quelle_id
    FROM recovery.checkins c
    WHERE c.user_id=v_user AND c.entry_date>=p_as_of-28
      AND c.entry_date<p_as_of AND c.sleep_hours IS NOT NULL;
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

CREATE OR REPLACE FUNCTION goals.g617_measurement_goal_snapshot()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE
  v_point record;
  v_type text := NEW.measurement_type;
BEGIN
  IF v_type IS NULL THEN RETURN NEW; END IF;
  IF v_type IN ('body_weight','body_fat','circumference') AND (
      (v_type='body_weight' AND NEW.target_unit IS DISTINCT FROM 'kg')
      OR (v_type='body_fat' AND NEW.target_unit IS DISTINCT FROM '%')
      OR (v_type='circumference' AND NEW.target_unit IS DISTINCT FROM 'cm')
    ) THEN
    RAISE EXCEPTION 'G617_UNIT: feste Koerpereinheit verwenden'
      USING ERRCODE='23514';
  END IF;
  IF v_type IN ('e1rm','weight_reps','duration','distance','pace') THEN
    IF TG_OP='INSERT' AND NEW.target_unit IS DISTINCT FROM
      (CASE WHEN v_type IN ('e1rm','weight_reps') THEN 'kg'
        WHEN v_type='duration' THEN 'seconds'
        WHEN v_type='distance' THEN 'm' ELSE 'sec_per_km' END) THEN
      RAISE EXCEPTION 'G617_UNIT: feste Krafteinheit verwenden'
        USING ERRCODE='23514';
    END IF;
    IF NEW.exercise_id IS NULL OR NEW.measurement_rhythm<>'once' THEN
      RAISE EXCEPTION 'G617_STRENGTH: Uebung und einmaliger Rhythmus erforderlich'
        USING ERRCODE='23514';
    END IF;
  END IF;
  IF v_type IN ('training_sessions_week','cardio_sessions_week') AND (
    NEW.target_unit IS DISTINCT FROM 'sessions_per_week'
    OR NEW.target_value<=0
  ) THEN
    RAISE EXCEPTION 'G617_HABIT: positive Sitzungen pro Woche angeben'
      USING ERRCODE='23514';
  END IF;
  IF v_type='sleep_hours_night' AND (
    NEW.target_unit IS DISTINCT FROM 'h/night'
    OR NEW.target_value<=0 OR NEW.target_value>14
  ) THEN
    RAISE EXCEPTION 'G617_HABIT: Schlafziel in Stunden pro Nacht angeben'
      USING ERRCODE='23514';
  END IF;
  IF v_type IN
    ('training_sessions_week','cardio_sessions_week','sleep_hours_night')
    AND NEW.measurement_rhythm<>'weekly' THEN
    RAISE EXCEPTION 'G617_HABIT: Gewohnheit ist wiederkehrend'
      USING ERRCODE='23514';
  END IF;
  IF v_type='custom' AND (
    NEW.start_value IS NULL OR nullif(btrim(NEW.target_unit),'') IS NULL
    OR NEW.better_direction IS NULL
  ) THEN
    RAISE EXCEPTION 'G617_CUSTOM: Start, Einheit und Richtung angeben'
      USING ERRCODE='23514';
  END IF;
  SELECT * INTO v_point FROM goals.measurement_goal_start_preview(
    v_type,NEW.gueltig_ab,NEW.exercise_id,NEW.measurement_site,
    NEW.measurement_reps,NEW.start_value);
  IF NOT FOUND THEN
    RAISE EXCEPTION 'G617_AUTH: Anmeldung erforderlich' USING ERRCODE='42501';
  END IF;
  IF v_point.kennung='vorgemerkt' THEN
    RAISE EXCEPTION 'G617_SOURCE_PENDING: diese Gewohnheit ist vorgemerkt'
      USING ERRCODE='23514';
  END IF;
  IF v_point.kennung='erst_messen' AND v_type IN
    ('body_weight','body_fat','circumference') THEN
    RAISE EXCEPTION 'G617_FIRST_MEASURE: erst messen' USING ERRCODE='23514';
  END IF;
  NEW.start_value := v_point.wert;
  NEW.current_value := v_point.wert;
  NEW.start_source := v_point.quelle;
  NEW.start_source_id := CASE WHEN v_type='custom'
    THEN NEW.id ELSE v_point.quelle_id END;
  NEW.start_measured_at := v_point.datum;
  RETURN NEW;
END $$;

REVOKE ALL ON FUNCTION goals.measurement_goal_start_preview(
  text,date,uuid,text,smallint,numeric
) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION goals.measurement_goal_start_preview(
  text,date,uuid,text,smallint,numeric
) TO authenticated,service_role;
COMMENT ON FUNCTION goals.measurement_goal_start_preview(
  text,date,uuid,text,smallint,numeric
) IS 'G-634: RLS-konforme Startwertvorschau, dieselbe Quelle wie der G-617-Snapshot.';
COMMIT;
