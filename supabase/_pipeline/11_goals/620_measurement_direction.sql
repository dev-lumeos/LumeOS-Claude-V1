-- G-620: Dauer und Pace sind bei einem Zeit-Ziel kleiner besser.
-- Eine optionale Distanz bindet den Satz an genau die ausgeschriebene Strecke.
BEGIN;

ALTER TABLE goals.user_goals
  ADD COLUMN measurement_distance_m numeric;
ALTER TABLE goals.user_goals
  ADD CONSTRAINT user_goals_measurement_distance_ck CHECK (
    measurement_distance_m IS NULL OR
    (measurement_type IN ('duration','pace') AND measurement_distance_m > 0)
  );
COMMENT ON COLUMN goals.user_goals.measurement_distance_m IS
  'G-620: Optionale exakte Streckenbindung in Metern für Dauer/Pace.';

CREATE FUNCTION goals.measurement_better_direction(p_type text)
RETURNS text LANGUAGE sql IMMUTABLE SET search_path='' AS $$
  SELECT CASE WHEN p_type IN ('duration','pace') THEN 'less'
    WHEN p_type IN ('e1rm','weight_reps','distance') THEN 'more'
    ELSE NULL END;
$$;
REVOKE ALL ON FUNCTION goals.measurement_better_direction(text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION goals.measurement_better_direction(text)
  TO authenticated,service_role;

-- Die vier vorhandenen Leser behalten ihre Signaturen und ihre übrigen Regeln.
DO $g620$
DECLARE
  v_def text;
  v_old text;
  v_new text;
  v_signature regprocedure;
  v_count integer;
BEGIN
  FOREACH v_signature IN ARRAY ARRAY[
    'goals.measurement_points(uuid,date)'::regprocedure,
    'goals.goal_progress_at_g611_basis(uuid,date)'::regprocedure,
    'goals.measurement_goal_start_preview(text,date,uuid,text,smallint,numeric)'::regprocedure,
    'goals.measurement_goal_week_at_g655_basis(uuid,date)'::regprocedure,
    'goals.g617_measurement_goal_snapshot()'::regprocedure
  ] LOOP
    v_def := pg_get_functiondef(v_signature);
    IF v_signature = 'goals.measurement_points(uuid,date)'::regprocedure THEN
      v_old := 'WHERE g.measurement_type IN (''e1rm'',''weight_reps'',''duration'',''distance'',''pace'')';
      v_new := v_old || E'\n      AND (g.measurement_type NOT IN (''duration'',''pace'')\n        OR g.measurement_distance_m IS NULL\n        OR ws.distance_meters = g.measurement_distance_m)';
    ELSIF v_signature = 'goals.goal_progress_at_g611_basis(uuid,date)'::regprocedure THEN
      v_old := 'IN (''e1rm'',''weight_reps'',''duration'',''distance'')';
      v_new := 'IN (''e1rm'',''weight_reps'',''distance'')';
    ELSIF v_signature = 'goals.measurement_goal_start_preview(text,date,uuid,text,smallint,numeric)'::regprocedure THEN
      v_old := 'p_measurement_type=''pace'' THEN';
      v_new := 'p_measurement_type IN (''pace'',''duration'') THEN';
    ELSIF v_signature = 'goals.measurement_goal_week_at_g655_basis(uuid,date)'::regprocedure THEN
      v_old := '(''e1rm'',''weight_reps'',''duration'',''distance'')';
      v_new := '(''e1rm'',''weight_reps'',''distance'')';
    ELSE
      v_old := 'NEW.measurement_reps,NEW.start_value);';
      v_new := 'NEW.measurement_reps,NEW.start_value,NEW.measurement_distance_m);';
    END IF;
    v_count := (length(v_def)-length(replace(v_def,v_old,''))) / length(v_old);
    IF v_count <> (CASE WHEN v_signature =
      'goals.measurement_goal_week_at_g655_basis(uuid,date)'::regprocedure THEN 2 ELSE 1 END) THEN
      RAISE EXCEPTION 'G620_SCHEMA: Ausdruck in % unerwartet oft: %',v_signature,v_count;
    END IF;
    v_def := replace(v_def,v_old,v_new);
    IF v_signature = 'goals.goal_progress_at_g611_basis(uuid,date)'::regprocedure THEN
      v_def := replace(v_def,
        'g.measurement_type = ''pace'' THEN mp.value',
        'g.measurement_type IN (''pace'',''duration'') THEN mp.value');
    ELSIF v_signature = 'goals.measurement_goal_start_preview(text,date,uuid,text,smallint,numeric)'::regprocedure THEN
      v_def := replace(v_def,
        'p_measurement_type<>''pace'' THEN',
        'p_measurement_type NOT IN (''pace'',''duration'') THEN');
    ELSIF v_signature = 'goals.measurement_goal_week_at_g655_basis(uuid,date)'::regprocedure THEN
      v_def := replace(v_def,
        'g.measurement_type=''pace'' THEN mp.value',
        'g.measurement_type IN (''pace'',''duration'') THEN mp.value');
    END IF;
    EXECUTE v_def;
  END LOOP;
END $g620$;

-- Die sechsstellige Vorschau bleibt für vorhandene Aufrufer erhalten.
CREATE FUNCTION goals.measurement_goal_start_preview(
  p_measurement_type text,p_as_of date,p_exercise_id uuid,
  p_measurement_site text,p_measurement_reps smallint,
  p_manual_start numeric,p_distance_m numeric
) RETURNS TABLE(wert numeric,datum date,quelle text,quelle_id uuid,kennung text)
LANGUAGE plpgsql STABLE SECURITY INVOKER SET search_path='' AS $$
BEGIN
  IF p_distance_m IS NULL THEN
    RETURN QUERY SELECT p.wert,p.datum,p.quelle,p.quelle_id,p.kennung
      FROM goals.measurement_goal_start_preview(
        p_measurement_type,p_as_of,p_exercise_id,p_measurement_site,
        p_measurement_reps,p_manual_start) p;
    RETURN;
  END IF;
  IF auth.uid() IS NULL THEN RETURN; END IF;
  IF p_measurement_type NOT IN ('duration','pace') OR p_distance_m <= 0 THEN
    RAISE EXCEPTION 'G620_DISTANCE: Strecke nur für Dauer und Pace'
      USING ERRCODE='23514';
  END IF;
  RETURN QUERY
    SELECT CASE WHEN p_measurement_type='duration'
        THEN ws.duration_seconds::numeric
        ELSE ws.duration_seconds::numeric*1000/nullif(ws.distance_meters,0) END,
      s.session_date,'training.workout_sets'::text,ws.id,
      'gemessen'::text
    FROM training.workout_sessions s
    JOIN training.workout_exercises we ON we.workout_session_id=s.id
      AND we.exercise_id=p_exercise_id
    JOIN training.workout_sets ws ON ws.workout_exercise_id=we.id
    WHERE s.user_id=auth.uid() AND s.status='completed'
      AND s.session_date<=least(p_as_of,CURRENT_DATE)
      AND ws.distance_meters=p_distance_m
      AND ws.duration_seconds IS NOT NULL
    ORDER BY ws.duration_seconds, s.session_date DESC,ws.id DESC LIMIT 1;
  IF NOT FOUND THEN
    RETURN QUERY SELECT NULL::numeric,NULL::date,NULL::text,NULL::uuid,
      'erst_messen'::text;
  END IF;
END $$;
REVOKE ALL ON FUNCTION goals.measurement_goal_start_preview(
  text,date,uuid,text,smallint,numeric,numeric) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION goals.measurement_goal_start_preview(
  text,date,uuid,text,smallint,numeric,numeric) TO authenticated,service_role;

-- Der neue Schreibweg transportiert die Strecke vor dem Startwert-Snapshot.
CREATE FUNCTION goals.measurement_goal_create(
  p_measurement_type text,p_title text,p_target_value numeric,
  p_target_unit text,p_gueltig_ab date,p_target_date date,
  p_exercise_id uuid,p_measurement_reps smallint,p_measurement_site text,
  p_measurement_rhythm text,p_better_direction text,p_start_value numeric,
  p_distance_m numeric
) RETURNS uuid LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE v_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'G617_AUTH: Anmeldung erforderlich' USING ERRCODE='42501';
  END IF;
  IF p_distance_m IS NULL THEN
    RETURN goals.measurement_goal_create(p_measurement_type,p_title,
      p_target_value,p_target_unit,p_gueltig_ab,p_target_date,p_exercise_id,
      p_measurement_reps,p_measurement_site,p_measurement_rhythm,
      p_better_direction,p_start_value);
  END IF;
  IF p_measurement_type NOT IN ('duration','pace') OR p_distance_m <= 0
    OR p_target_value IS NULL OR p_gueltig_ab IS NULL
    OR nullif(btrim(p_title),'') IS NULL THEN
    RAISE EXCEPTION 'G620_INPUT: Messart, Strecke, Titel, Zielwert und Datum erforderlich'
      USING ERRCODE='23514';
  END IF;
  INSERT INTO goals.user_goals(
    user_id,goal_type,subtype,title,target_value,target_unit,start_value,
    gueltig_ab,target_date,status,priority,exercise_id,measurement_type,
    measurement_reps,measurement_site,measurement_rhythm,better_direction,
    measurement_distance_m
  ) VALUES (
    auth.uid(),'performance',p_measurement_type,btrim(p_title),
    p_target_value,p_target_unit,p_start_value,p_gueltig_ab,p_target_date,
    'active',5,p_exercise_id,p_measurement_type,p_measurement_reps,
    p_measurement_site,coalesce(p_measurement_rhythm,'once'),
    p_better_direction,p_distance_m
  ) RETURNING id INTO v_id;
  RETURN v_id;
END $$;
REVOKE ALL ON FUNCTION goals.measurement_goal_create(
  text,text,numeric,text,date,date,uuid,smallint,text,text,text,numeric,numeric)
  FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION goals.measurement_goal_create(
  text,text,numeric,text,date,date,uuid,smallint,text,text,text,numeric,numeric)
  TO authenticated,service_role;

-- Ein nachträglicher Streckenwechsel würde den festgehaltenen Startwert
-- gegen andere Sätze vergleichen. Dafür ist ein neues Messziel nötig.
CREATE FUNCTION goals.g620_measurement_distance_immutable()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
BEGIN
  IF NEW.measurement_distance_m IS DISTINCT FROM OLD.measurement_distance_m THEN
    RAISE EXCEPTION 'G620_DISTANCE_FIXED: Strecke nach Anlage festgehalten'
      USING ERRCODE='23514';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER g620_measurement_distance_immutable
  BEFORE UPDATE OF measurement_distance_m ON goals.user_goals
  FOR EACH ROW EXECUTE FUNCTION goals.g620_measurement_distance_immutable();
REVOKE ALL ON FUNCTION goals.g620_measurement_distance_immutable()
  FROM PUBLIC,anon,authenticated;

COMMIT;
