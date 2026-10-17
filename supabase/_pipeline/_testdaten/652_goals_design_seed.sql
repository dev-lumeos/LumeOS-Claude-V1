-- G-652: Entwurfsdaten fuer das Pro-Nachweiskonto, live fuer dev.
-- Navy-Werte nutzen vorhandene Tageszeilen; Ziele und Plaene gehen durch RPCs.
BEGIN;

DO $konto$
DECLARE v_user uuid;
BEGIN
  SELECT id INTO v_user FROM auth.users WHERE email='dev@lumeos.app';
  IF v_user IS NULL THEN
    SELECT id INTO v_user FROM auth.users
    WHERE email='test-user@lumeos.local';
  END IF;
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'G652_STOP:konto_fehlt';
  END IF;
  PERFORM set_config('request.jwt.claim.sub',v_user::text,true);
END $konto$;
SET LOCAL ROLE authenticated;

DO $seed$
DECLARE
  v_user uuid := auth.uid();
  v_control uuid;
  v_squat uuid := '797158aa-daa0-42cd-acc9-9da2fefd9c6f';
  v_deadlift uuid := 'c048a6f9-96ae-4178-864c-e8e4e24bc8a8';
  v_session uuid;
  v_exercise uuid;
  v_day date;
  v_week integer;
  v_index integer;
  v_weight numeric;
  v_body_weight numeric;
  v_height numeric;
  v_waist numeric;
  v_fat numeric;
  v_goal uuid;
  v_prep uuid;
  v_off uuid;
  v_cut uuid;
  v_old_prep uuid;
  v_shell uuid;
  v_custom uuid;
  v_event uuid;
  v_plan_position goals.goal_program_positions%ROWTYPE;
  v_start date;
BEGIN
  IF (SELECT experience_level FROM public.profiles WHERE id=v_user)<>'pro' THEN
    RAISE EXCEPTION 'G652_STOP:dev_muss_pro_sein';
  END IF;
  SELECT g.id INTO v_control FROM goals.user_goals g
  JOIN goals.goal_programs p ON p.goal_id=g.id AND p.status='aktiv'
  WHERE g.user_id=v_user AND g.status='active' AND g.goal_role='controlling';
  IF v_control IS NULL OR (SELECT count(*) FROM goals.goal_programs
      WHERE user_id=v_user AND status='aktiv')<>1 THEN
    RAISE EXCEPTION 'G652_STOP:aktiver_plan_abweichend';
  END IF;
  IF EXISTS (SELECT 1 FROM goals.user_goals WHERE user_id=v_user
      AND title IN ('Kniebeuge 1RM 160 kg','Kreuzheben 150 kg × 5',
        'Körperfett 14 %','Training 4× pro Woche','Contest Prep 2025',
        'Frühjahrs-Cut 2026'))
    OR EXISTS (SELECT 1 FROM goals.goal_programs WHERE user_id=v_user
      AND name IN ('Contest Prep 2027','Off-Season 2027',
        'Frühjahrs-Cut 2026','Contest Prep 2025'))
    OR EXISTS (SELECT 1 FROM training.workout_sessions
      WHERE user_id=v_user AND notes='G-652 Entwurfsverlauf')
    OR EXISTS (SELECT 1 FROM goals.body_measurements
      WHERE user_id=v_user AND (source_detail='G-652 Navy-Verlauf'
        OR notes LIKE '%G-652 Navy-Verlauf%')) THEN
    RAISE EXCEPTION 'G652_STOP:seed_schon_vorhanden';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM training.exercises WHERE id=v_squat)
    OR NOT EXISTS (SELECT 1 FROM training.exercises WHERE id=v_deadlift) THEN
    RAISE EXCEPTION 'G652_STOP:uebung_fehlt';
  END IF;
  SELECT weight_kg INTO v_body_weight FROM goals.body_measurements
  WHERE user_id=v_user AND measurement_date<=CURRENT_DATE
  ORDER BY measurement_date DESC,measurement_time DESC,id DESC LIMIT 1;
  IF v_body_weight IS NULL THEN
    RAISE EXCEPTION 'G652_STOP:gewicht_fehlt';
  END IF;
  SELECT height_cm INTO v_height FROM public.profiles WHERE id=v_user;
  IF v_height IS NULL THEN RAISE EXCEPTION 'G652_STOP:groesse_fehlt'; END IF;

  -- Drei abgeschlossene Wochen mit je vier Trainingseinheiten.
  FOR v_week IN -3..-1 LOOP
    FOR v_index IN 0..3 LOOP
      v_day := date_trunc('week',CURRENT_DATE)::date+v_week*7
        +(ARRAY[0,2,4,6])[v_index+1];
      v_weight := 126+(v_week+3)*4+v_index;
      INSERT INTO training.workout_sessions
        (user_id,session_date,started_time,ended_time,name,status,
          duration_minutes,notes)
      VALUES (v_user,v_day,time '17:30',time '18:30',
        'Krafttraining · Entwurf','completed',60,'G-652 Entwurfsverlauf')
      RETURNING id INTO v_session;
      INSERT INTO training.workout_exercises
        (workout_session_id,exercise_id,exercise_order,exercise_name)
      SELECT v_session,id,1,name FROM training.exercises WHERE id=v_squat
      RETURNING id INTO v_exercise;
      INSERT INTO training.workout_sets
        (workout_exercise_id,set_number,reps,weight_kg,set_type)
      VALUES (v_exercise,1,1,v_weight,'working');
      IF v_index=2 THEN
        INSERT INTO training.workout_exercises
          (workout_session_id,exercise_id,exercise_order,exercise_name)
        SELECT v_session,id,2,name FROM training.exercises WHERE id=v_deadlift
        RETURNING id INTO v_exercise;
        INSERT INTO training.workout_sets
          (workout_exercise_id,set_number,reps,weight_kg,set_type)
        VALUES (v_exercise,1,5,125+(v_week+3)*5,'working');
      END IF;
    END LOOP;
  END LOOP;

  -- G-655 Testdaten: acht woechentliche Navy-Messungen statt einer
  -- taeglich aus GO-10 kopierten KFA. Die letzten vier Wochen ergeben
  -- etwa -0,3 Prozentpunkte pro Woche.
  FOR v_week IN 1..6 LOOP
    v_day := CURRENT_DATE-(8-v_week)*7;
    v_weight := (ARRAY[17.3,17.3,17.3,17.3,17.1,16.8])[v_week];
    v_waist := round(41+2.54*power(10::numeric,
      (v_weight+70.041*ln(v_height/2.54)/ln(10::numeric)-36.76)/86.010),1);
    PERFORM goals.body_circumference_write(
      p_measurement_date=>v_day,p_measurement_time=>time '08:30',
      p_measurement_source=>'admin',p_source_detail=>'G-655 Navy-Wochentestdaten',
      p_neck_cm=>41.0,p_waist_cm=>v_waist);
    SELECT body_fat_pct INTO v_fat FROM goals.body_composition_navy(v_user,v_day);
    IF abs(v_fat-v_weight)>0.08 THEN
      RAISE EXCEPTION 'G655_STOP:navy_woche_%_abweichend % statt %',v_week,v_fat,v_weight;
    END IF;
    UPDATE goals.body_measurements SET body_fat_pct=v_fat,bf_method='navy',
      notes=concat_ws(' · ',nullif(notes,''),
        'G-655 Navy-Wochentestdaten · Navy-Woche '||v_week),
      updated_at=now()
    WHERE id=(SELECT id FROM goals.body_measurements
      WHERE user_id=v_user AND measurement_date=v_day
      ORDER BY measurement_time DESC,created_at DESC,id DESC LIMIT 1);
    IF NOT FOUND THEN
      INSERT INTO goals.body_measurements
        (user_id,measurement_date,measurement_time,weight_kg,body_fat_pct,
          bf_method,measurement_source,source_detail,notes)
      VALUES (v_user,v_day,time '08:35',v_body_weight,v_fat,
        'navy','admin','G-655 Navy-Wochentestdaten',
        'G-655 Testdaten · Navy-Woche '||v_week);
    END IF;
  END LOOP;

  -- Der Navy-Startwert stammt aus Umfang und Gewicht, nicht aus dem Ziel.
  v_waist := round(41+2.54*power(10::numeric,
    (16.5+70.041*ln(v_height/2.54)/ln(10::numeric)-36.76)/86.010),1);
  PERFORM goals.body_circumference_write(
    p_measurement_date=>CURRENT_DATE-7,p_measurement_time=>time '08:30',
    p_measurement_source=>'admin',p_source_detail=>'G-652 Navy-Verlauf',
    p_neck_cm=>41.0,p_waist_cm=>v_waist);
  SELECT body_fat_pct INTO v_fat FROM goals.body_composition_navy(
    v_user,CURRENT_DATE-7);
  IF round(v_fat,1)<>16.5 THEN
    RAISE EXCEPTION 'G652_STOP:navy_start_abweichend %',v_fat;
  END IF;
  UPDATE goals.body_measurements SET body_fat_pct=v_fat,bf_method='navy',
    notes=concat_ws(' · ',nullif(notes,''),
      'G-652 Navy-Verlauf · Navy-Messung Start'),updated_at=now()
  WHERE id=(SELECT id FROM goals.body_measurements
    WHERE user_id=v_user AND measurement_date=CURRENT_DATE-7
    ORDER BY measurement_time DESC,created_at DESC,id DESC LIMIT 1);
  IF NOT FOUND THEN
    INSERT INTO goals.body_measurements
      (user_id,measurement_date,measurement_time,weight_kg,body_fat_pct,
        bf_method,measurement_source,source_detail,notes)
    VALUES (v_user,CURRENT_DATE-7,time '08:35',v_body_weight,v_fat,
      'navy','admin','G-652 Navy-Verlauf','Navy-Messung · Start');
  END IF;

  -- Der Zielstart am Wochenanfang muss seinen eigenen gemessenen Wert sehen.
  v_waist := round(41+2.54*power(10::numeric,
    (16.3+70.041*ln(v_height/2.54)/ln(10::numeric)-36.76)/86.010),1);
  PERFORM goals.body_circumference_write(
    p_measurement_date=>date_trunc('week',CURRENT_DATE)::date,
    p_measurement_time=>time '23:58',
    p_measurement_source=>'admin',p_source_detail=>'G-652 Navy-Verlauf',
    p_neck_cm=>41.0,p_waist_cm=>v_waist);
  SELECT body_fat_pct INTO v_fat FROM goals.body_composition_navy(
    v_user,date_trunc('week',CURRENT_DATE)::date);
  IF round(v_fat,1)<>16.3 THEN
    RAISE EXCEPTION 'G652_STOP:navy_zielstart_abweichend %',v_fat;
  END IF;
  UPDATE goals.body_measurements SET body_fat_pct=v_fat,bf_method='navy',
    notes=concat_ws(' · ',nullif(notes,''),
      'G-652 Navy-Verlauf · Navy-Messung Zielstart'),updated_at=now()
  WHERE id=(SELECT id FROM goals.body_measurements
    WHERE user_id=v_user
      AND measurement_date=date_trunc('week',CURRENT_DATE)::date
    ORDER BY measurement_time DESC,created_at DESC,id DESC LIMIT 1);
  IF NOT FOUND THEN
    INSERT INTO goals.body_measurements
      (user_id,measurement_date,measurement_time,weight_kg,body_fat_pct,
        bf_method,measurement_source,source_detail,notes)
    VALUES (v_user,date_trunc('week',CURRENT_DATE)::date,time '23:59',
      v_body_weight,v_fat,'navy','admin','G-652 Navy-Verlauf',
      'Navy-Messung · Zielstart');
  END IF;

  SELECT goals.measurement_goal_create(
    p_measurement_type=>'e1rm',p_title=>'Kniebeuge 1RM 160 kg',
    p_target_value=>160,p_target_unit=>'kg',
    p_gueltig_ab=>date_trunc('week',CURRENT_DATE)::date,
    p_target_date=>date '2027-03-31',p_exercise_id=>v_squat)
    INTO v_goal;
  SELECT goals.measurement_goal_create(
    p_measurement_type=>'weight_reps',
    p_title=>'Kreuzheben 150 kg × 5',p_target_value=>150,
    p_target_unit=>'kg',p_gueltig_ab=>date_trunc('week',CURRENT_DATE)::date,
    p_exercise_id=>v_deadlift,p_measurement_reps=>5::smallint)
    INTO v_goal;
  SELECT goals.measurement_goal_create(
    p_measurement_type=>'body_fat',p_title=>'Körperfett 14 %',
    p_target_value=>14,p_target_unit=>'%',
    p_gueltig_ab=>date_trunc('week',CURRENT_DATE)::date,
    p_target_date=>date '2027-03-01')
    INTO v_goal;
  SELECT goals.measurement_goal_create(
    p_measurement_type=>'training_sessions_week',
    p_title=>'Training 4× pro Woche',p_target_value=>4,
    p_target_unit=>'sessions_per_week',
    p_gueltig_ab=>date_trunc('week',CURRENT_DATE)::date-21,
    p_measurement_rhythm=>'weekly')
    INTO v_goal;

  -- Die laufende Woche liefert drei neue Einheiten und die Bestwerte.
  FOR v_index IN 0..2 LOOP
    v_day := CURRENT_DATE-(2-v_index);
    IF v_day<date_trunc('week',CURRENT_DATE)::date THEN CONTINUE; END IF;
    v_weight := 138+v_index;
    INSERT INTO training.workout_sessions
      (user_id,session_date,started_time,ended_time,name,status,
        duration_minutes,notes)
    VALUES (v_user,v_day,time '17:30',time '18:30',
      'Krafttraining · Entwurf','completed',60,'G-652 Entwurfsverlauf')
    RETURNING id INTO v_session;
    INSERT INTO training.workout_exercises
      (workout_session_id,exercise_id,exercise_order,exercise_name)
    SELECT v_session,id,1,name FROM training.exercises WHERE id=v_squat
    RETURNING id INTO v_exercise;
    INSERT INTO training.workout_sets
      (workout_exercise_id,set_number,reps,weight_kg,set_type)
    VALUES (v_exercise,1,1,v_weight,'working');
    IF v_index=2 THEN
      INSERT INTO training.workout_exercises
        (workout_session_id,exercise_id,exercise_order,exercise_name)
      SELECT v_session,id,2,name FROM training.exercises WHERE id=v_deadlift
      RETURNING id INTO v_exercise;
      INSERT INTO training.workout_sets
        (workout_exercise_id,set_number,reps,weight_kg,set_type)
      VALUES (v_exercise,1,5,140,'working');
    END IF;
  END LOOP;
  v_waist := round(41+2.54*power(10::numeric,
    (16.2+70.041*ln(v_height/2.54)/ln(10::numeric)-36.76)/86.010),1);
  PERFORM goals.body_circumference_write(
    p_measurement_date=>CURRENT_DATE,p_measurement_time=>time '08:30',
    p_measurement_source=>'admin',p_source_detail=>'G-652 Navy-Verlauf',
    p_neck_cm=>41.0,p_waist_cm=>v_waist);
  SELECT body_fat_pct INTO v_fat FROM goals.body_composition_navy(
    v_user,CURRENT_DATE);
  IF round(v_fat,1)<>16.2 THEN
    RAISE EXCEPTION 'G652_STOP:navy_ist_abweichend %',v_fat;
  END IF;
  UPDATE goals.body_measurements SET body_fat_pct=v_fat,bf_method='navy',
    notes=concat_ws(' · ',nullif(notes,''),
      'G-652 Navy-Verlauf · Navy-Messung aktuell'),updated_at=now()
  WHERE id=(SELECT id FROM goals.body_measurements
    WHERE user_id=v_user AND measurement_date=CURRENT_DATE
    ORDER BY measurement_time DESC,created_at DESC,id DESC LIMIT 1);
  IF NOT FOUND THEN
    INSERT INTO goals.body_measurements
      (user_id,measurement_date,measurement_time,weight_kg,body_fat_pct,
        bf_method,measurement_source,source_detail,notes)
    VALUES (v_user,CURRENT_DATE,time '08:35',v_body_weight,v_fat,
      'navy','admin','G-652 Navy-Verlauf','Navy-Messung · aktuell');
  END IF;

  -- Zwei Entwürfe am bestehenden steuernden Ziel.
  SELECT goals.goal_plan_create(v_control,'Contest Prep 2027',
    'prep',date '2027-02-04') INTO v_prep;
  SELECT id INTO v_event FROM goals.goal_program_events
  WHERE program_id=v_prep AND kind='A';
  PERFORM goals.goal_plan_event_save(v_prep,v_event,
    'NPC Classic Bangkok','A',date '2027-02-04');
  PERFORM goals.goal_plan_event_save(v_prep,NULL::uuid,
    'Samui Open','B',date '2027-03-04');
  PERFORM goals.goal_plan_event_save(v_prep,NULL::uuid,
    'Urlaub Familie','S',date '2026-12-20');

  SELECT goals.goal_plan_create(v_control,'Off-Season 2027',
    'annual',date '2027-03-15') INTO v_off;
  SELECT goals.goal_plan_position_save(v_off,NULL::uuid,6::smallint,
    NULL::text,
    '{"kcal_pct_erhaltung":-10,"protein_g_kg":2.6,"fett_g_kg":0.7,"cardio_pro_woche":4,"refeed_pro_woche":2,"max_duration_weeks":6}'::jsonb,
    'abnehmen','fat_loss',6::smallint,
    date '2028-03-13',date '2028-04-23') INTO v_custom;
  PERFORM goals.goal_plan_position_move(v_custom,3::smallint);
  v_start := date '2027-03-15'+28*7;
  FOR v_plan_position IN SELECT * FROM goals.goal_program_positions
    WHERE program_id=v_off AND position>=3 ORDER BY position LOOP
    PERFORM goals.goal_plan_position_save(
      v_off,v_plan_position.id,v_plan_position.position,
      v_plan_position.strategie_code,v_plan_position.eigene_werte,
      v_plan_position.richtung,v_plan_position.phase_type,
      v_plan_position.duration_weeks,v_start,
      v_start+v_plan_position.duration_weeks*7-1,
      v_plan_position.confirmed_warnings,v_plan_position.sub_phase_code,
      v_plan_position.zielrate_pct_kg_woche);
    v_start := v_start+v_plan_position.duration_weeks*7;
  END LOOP;

  -- Historische Ziele entstehen ebenfalls ueber active_goal_create.
  SELECT (goals.active_goal_create(
    'body_composition','Frühjahrs-Cut 2026',date '2026-01-06',
    'cut','Moderate Cut · Ziel erreicht',84,'kg',date '2026-03-25')
      ->'goal'->>'id')::uuid INTO v_goal;
  UPDATE goals.user_goals SET status='achieved',start_value=88.6,
    current_value=84,achievement_date=date '2026-03-25'
  WHERE id=v_goal AND user_id=v_user;
  SELECT goals.goal_plan_create(v_goal,'Frühjahrs-Cut 2026') INTO v_cut;
  PERFORM goals.goal_plan_position_save(v_cut,NULL::uuid,1::smallint,
    'moderate_cut',NULL::jsonb,'abnehmen','fat_loss',11::smallint,
    date '2026-01-06',date '2026-03-24');
  PERFORM goals.goal_plan_event_save(v_cut,NULL::uuid,
    'Ziel erreicht','X',date '2026-03-25');
  PERFORM goals.goal_plan_complete(v_cut);

  SELECT (goals.active_goal_create(
    'body_composition','Contest Prep 2025',date '2025-06-02',
    'contest_prep','Bühnengewicht 79,4 kg · Termin gehalten',
    79.4,'kg',date '2025-09-22')
      ->'goal'->>'id')::uuid INTO v_goal;
  UPDATE goals.user_goals SET status='achieved',start_value=88.6,
    current_value=79.4,achievement_date=date '2025-09-22'
  WHERE id=v_goal AND user_id=v_user;
  -- Der Zwei-Argument-Weg macht das Ziel steuernd; die Vorlage erzeugt
  -- danach den eigentlichen historischen Entwurf.
  SELECT goals.goal_plan_create(v_goal,'Contest Prep 2025 · Zuordnung')
    INTO v_shell;
  SELECT goals.goal_plan_create(v_goal,'Contest Prep 2025',
    'prep',date '2025-09-22') INTO v_old_prep;
  PERFORM goals.goal_plan_delete(v_shell);
  SELECT id INTO v_event FROM goals.goal_program_events
  WHERE program_id=v_old_prep AND kind='A';
  PERFORM goals.goal_plan_event_save(v_old_prep,v_event,
    'Wettkampf 2025 · Termin gehalten','A',date '2025-09-22');
  PERFORM goals.goal_plan_complete(v_old_prep);

  -- Sieben Tage Einnahmen: sechs protokollierte Dosen je Tag.
  -- Die vorhandene C-413-Dosis ergibt zusammen etwa 88 % Treue.
  WITH items AS (
    SELECT si.id,si.dose,si.dose_unit,
      coalesce(nullif(btrim(si.custom_name),''),nullif(btrim(s.name_de),''),
        nullif(btrim(s.name_en),'')) AS display_name,
      row_number() OVER (ORDER BY si.sort_order,si.id) AS n
    FROM supplements.stack_items si
    JOIN supplements.user_stacks st ON st.id=si.stack_id
    LEFT JOIN supplements.supplements s ON s.id=si.supplement_id
    WHERE st.user_id=v_user AND si.is_active
  )
  INSERT INTO supplements.intake_logs (
    user_id,stack_item_id,intake_date,intake_time,status,
    supplement_name_snapshot,dose_snapshot,dose_unit_snapshot,
    actual_dose,actual_dose_unit,notes,measurement_source,source_detail)
  SELECT v_user,i.id,CURRENT_DATE-d,
    (time '07:00'+i.n*interval '1 hour')::time,
    CASE WHEN d BETWEEN 1 AND 5 AND i.n=6 THEN 'skipped' ELSE 'taken' END,
    i.display_name,i.dose,i.dose_unit,
    CASE WHEN d BETWEEN 1 AND 5 AND i.n=6 THEN NULL ELSE i.dose END,
    CASE WHEN d BETWEEN 1 AND 5 AND i.n=6 THEN NULL ELSE i.dose_unit END,
    'G-652 Entwurf · Einnahme','seed','G-652 Einnahmeverlauf'
  FROM generate_series(0,6) AS d CROSS JOIN items i
  WHERE i.display_name IS NOT NULL;
  RAISE NOTICE 'G652_EINNAHMEN_OHNE_NAMEN: % Zeilen ausgelassen',
    (SELECT count(*)*7 FROM supplements.stack_items si
      JOIN supplements.user_stacks st ON st.id=si.stack_id
      LEFT JOIN supplements.supplements s ON s.id=si.supplement_id
      WHERE st.user_id=v_user AND si.is_active
        AND coalesce(nullif(btrim(si.custom_name),''),
          nullif(btrim(s.name_de),''),nullif(btrim(s.name_en),'')) IS NULL);
END $seed$;

COMMIT;
