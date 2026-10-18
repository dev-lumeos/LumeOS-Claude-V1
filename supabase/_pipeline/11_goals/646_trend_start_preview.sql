-- G-646: the shared start snapshot reader uses the existing EMA reader.
BEGIN;
DO $g646$
DECLARE v_def text; v_old text; v_new text;
BEGIN
  v_def := pg_get_functiondef(
    'goals.measurement_goal_start_preview(text,date,uuid,text,smallint,numeric)'::regprocedure);
  v_old := 'ELSIF p_measurement_type IN (''body_weight'',''body_fat'') THEN';
  IF (length(v_def)-length(replace(v_def,v_old,'')))/length(v_old)<>1 THEN
    RAISE EXCEPTION 'G646_SCHEMA: shared start preview differs';
  END IF;
  v_new := $part$ELSIF p_measurement_type='body_weight' THEN
    SELECT t.wert,t.letzte_messung_am,
      'goals.trendgewicht_am:'||t.quelle,NULL::uuid
    INTO v_wert,v_datum,v_quelle,v_quelle_id
    FROM goals.trendgewicht_am(v_user,least(p_as_of,CURRENT_DATE)) t;
  ELSIF p_measurement_type='body_fat' THEN$part$;
  EXECUTE replace(v_def,v_old,v_new);
END $g646$;
COMMENT ON FUNCTION goals.measurement_goal_start_preview(text,date,uuid,text,smallint,numeric)
  IS 'G-646: weight start value and snapshot use trendgewicht_am; source marks EMA or last measurement.';
COMMIT;
