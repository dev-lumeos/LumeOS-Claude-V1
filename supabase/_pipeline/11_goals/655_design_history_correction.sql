-- G-655: der G-652-Entwurfsverlauf bekommt ein fallendes KFA-Tempo
-- und eine Kniebeuge-Reihe um etwa 2,5 kg/Woche. Nur eindeutig
-- markierte Testdaten der beiden Nachweiskonten werden beruehrt.
BEGIN;

DO $g655$
DECLARE v_user record; v_count integer; v_height numeric;
  v_weight numeric; v_waist numeric; v_fat numeric;
BEGIN
  FOR v_user IN
    SELECT DISTINCT g.user_id FROM goals.user_goals g
    JOIN auth.users u ON u.id=g.user_id
    WHERE g.title='Kniebeuge 1RM 160 kg'
      AND u.email IN ('dev@lumeos.app','test-user@lumeos.local')
  LOOP
    SELECT count(*) INTO v_count
    FROM training.workout_sets ws
    JOIN training.workout_exercises we ON we.id=ws.workout_exercise_id
    JOIN training.workout_sessions s ON s.id=we.workout_session_id
    WHERE s.user_id=v_user.user_id AND s.notes='G-652 Entwurfsverlauf'
      AND we.exercise_id='797158aa-daa0-42cd-acc9-9da2fefd9c6f'
      AND s.session_date BETWEEN date_trunc('week',CURRENT_DATE)::date-21
        AND date_trunc('week',CURRENT_DATE)::date-1;
    IF v_count<>12 THEN
      RAISE EXCEPTION 'G655_STOP:kniebeuge_quellsaetze %',v_count;
    END IF;
    IF EXISTS (
      SELECT 1 FROM training.workout_sets ws
      JOIN training.workout_exercises we ON we.id=ws.workout_exercise_id
      JOIN training.workout_sessions s ON s.id=we.workout_session_id
      WHERE s.user_id=v_user.user_id AND s.notes='G-652 Entwurfsverlauf'
        AND we.exercise_id='797158aa-daa0-42cd-acc9-9da2fefd9c6f'
        AND s.session_date BETWEEN date_trunc('week',CURRENT_DATE)::date-21
          AND date_trunc('week',CURRENT_DATE)::date-1
        AND ws.weight_kg<>126+((date_trunc('week',s.session_date)::date
          -date_trunc('week',CURRENT_DATE)::date)/7+3)*4
          +(extract(isodow FROM s.session_date)::integer-1)/2
    ) THEN
      RAISE EXCEPTION 'G655_STOP:kniebeuge_live_abgewichen';
    END IF;
    UPDATE training.workout_sets ws
      SET weight_kg=ws.weight_kg-1-2*((
        date_trunc('week',s.session_date)::date
        -date_trunc('week',CURRENT_DATE)::date)/7)
    FROM training.workout_exercises we
    JOIN training.workout_sessions s ON s.id=we.workout_session_id
    WHERE ws.workout_exercise_id=we.id
      AND s.user_id=v_user.user_id AND s.notes='G-652 Entwurfsverlauf'
      AND we.exercise_id='797158aa-daa0-42cd-acc9-9da2fefd9c6f'
      AND s.session_date BETWEEN date_trunc('week',CURRENT_DATE)::date-21
        AND date_trunc('week',CURRENT_DATE)::date-1;

    SELECT height_cm INTO v_height FROM public.profiles WHERE id=v_user.user_id;
    SELECT weight_kg INTO v_weight FROM goals.body_measurements
    WHERE user_id=v_user.user_id AND measurement_date<=CURRENT_DATE-28
    ORDER BY measurement_date DESC,measurement_time DESC,id DESC LIMIT 1;
    IF v_weight IS NULL THEN
      SELECT weight_kg INTO v_weight FROM goals.body_measurements
      WHERE user_id=v_user.user_id AND measurement_date<=CURRENT_DATE
      ORDER BY measurement_date DESC,measurement_time DESC,id DESC LIMIT 1;
    END IF;
    IF v_height IS NULL OR v_weight IS NULL OR EXISTS (
      SELECT 1 FROM goals.body_measurements
      WHERE user_id=v_user.user_id AND source_detail='G-655 KFA-Verlauf') THEN
      RAISE EXCEPTION 'G655_STOP:kfa_ausgangsdaten';
    END IF;

    PERFORM set_config('request.jwt.claim.sub',v_user.user_id::text,true);
    v_waist := round(41+2.54*power(10::numeric,
      (17.3+70.041*ln(v_height/2.54)/ln(10::numeric)-36.76)/86.010),1);
    PERFORM goals.body_circumference_write(
      p_measurement_date=>CURRENT_DATE-28,
      p_measurement_time=>time '23:58',
      p_measurement_source=>'admin',
      p_source_detail=>'G-655 KFA-Verlauf',
      p_neck_cm=>41.0,p_waist_cm=>v_waist);
    SELECT body_fat_pct INTO v_fat FROM goals.body_composition_navy(
      v_user.user_id,CURRENT_DATE-28);
    IF v_fat IS NULL OR abs(v_fat-17.3)>0.1 THEN
      RAISE EXCEPTION 'G655_STOP:navy_abweichung %',v_fat;
    END IF;
    INSERT INTO goals.body_measurements(
      user_id,measurement_date,measurement_time,weight_kg,body_fat_pct,
      bf_method,measurement_source,source_detail,notes)
    VALUES (v_user.user_id,CURRENT_DATE-28,time '23:59',v_weight,v_fat,
      'navy','admin','G-655 KFA-Verlauf','Navy-Messung · Verlauf');
  END LOOP;
END $g655$;

COMMIT;
