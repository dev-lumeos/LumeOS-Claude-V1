-- G-667: one best strength value per completed session and calendar day.
BEGIN;
DO $g667$
DECLARE v_def text; v_old text; v_new text; v_start integer; v_end integer;
BEGIN
  v_def := pg_get_functiondef('goals.measurement_points(uuid,date)'::regprocedure);
  v_start := strpos(v_def,'    SELECT s.session_date,'||chr(10)||'      CASE g.measurement_type');
  v_end := strpos(v_def,'    UNION ALL'||chr(10)||'    SELECT s.session_date, 1::numeric,');
  IF v_start=0 OR v_end<=v_start THEN
    RAISE EXCEPTION 'G667_SCHEMA: strength source differs';
  END IF;
  v_old := substring(v_def FROM v_start FOR
    v_end-v_start+length('    UNION ALL'||chr(10)||'    SELECT s.session_date, 1::numeric,'));
  IF (length(v_def)-length(replace(v_def,v_old,'')))/length(v_old)<>1 THEN
    RAISE EXCEPTION 'G667_SCHEMA: strength source is ambiguous';
  END IF;
  v_new := $branch$    SELECT s.session_date,best.value,
      'training.workout_sessions'::text,s.id,s.started_time
    FROM g JOIN training.workout_sessions s ON s.user_id=g.user_id
      AND s.status='completed' AND s.session_date<=least(p_through,CURRENT_DATE)
    CROSS JOIN LATERAL (
      SELECT choice.value FROM (
        SELECT CASE g.measurement_type
          WHEN 'e1rm' THEN ws.estimated_1rm
          WHEN 'weight_reps' THEN CASE WHEN ws.reps>=g.measurement_reps
            THEN ws.weight_kg END
          WHEN 'duration' THEN ws.duration_seconds::numeric
          WHEN 'distance' THEN ws.distance_meters
          WHEN 'pace' THEN ws.duration_seconds::numeric*1000/
            nullif(ws.distance_meters,0)
        END AS value,ws.id
        FROM training.workout_exercises we
        JOIN training.workout_sets ws ON ws.workout_exercise_id=we.id
        WHERE we.workout_session_id=s.id AND we.exercise_id=g.exercise_id
          AND (g.measurement_type NOT IN ('duration','pace')
            OR g.measurement_distance_m IS NULL
            OR ws.distance_meters=g.measurement_distance_m)
      ) choice
      WHERE choice.value IS NOT NULL
      ORDER BY CASE WHEN g.measurement_type IN ('duration','pace')
          THEN choice.value END ASC NULLS LAST,
        CASE WHEN g.measurement_type NOT IN ('duration','pace')
          THEN choice.value END DESC NULLS LAST,choice.id DESC
      LIMIT 1
    ) best
    WHERE g.measurement_type IN
      ('e1rm','weight_reps','duration','distance','pace')
    UNION ALL
    SELECT s.session_date, 1::numeric,$branch$;
  EXECUTE replace(v_def,v_old,v_new);
END $g667$;
COMMENT ON FUNCTION goals.measurement_points(uuid,date) IS
  'G-667: one best value per training session; source_id identifies the session.';
COMMIT;
