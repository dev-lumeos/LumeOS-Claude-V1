-- G-670: complete the design account's timeline, module links and 12 weeks.
-- Guard the existing seed before changing dev data; repeat runs are rejected.
BEGIN;
SET CONSTRAINTS ALL DEFERRED;
DO $g670$
DECLARE v_user uuid; v_plan uuid; v_email text; v_week date; v_day date;
  v_count integer; v_added integer; v_offset integer; v_target integer;
BEGIN
  SELECT id INTO v_user FROM auth.users WHERE email='dev@lumeos.app';
  v_email:='dev@lumeos.app';
  IF v_user IS NULL THEN
    SELECT id INTO v_user FROM auth.users WHERE email='test-user@lumeos.local';
    v_email:='test-user@lumeos.local';
  END IF;
  IF v_user IS NULL THEN RAISE EXCEPTION 'G670_STOP:dev_missing'; END IF;
  SELECT id INTO v_plan FROM goals.goal_programs
  WHERE user_id=v_user AND name='Lean Bulk auf 88 kg' AND status='aktiv';
  IF EXISTS (SELECT 1 FROM training.workout_sessions
      WHERE user_id=v_user AND notes='G-670 Entwurfswochen') THEN
    RAISE EXCEPTION 'G670_STOP:seed_diverged';
  END IF;
  IF v_plan IS NOT NULL THEN
    IF (SELECT count(*) FROM goals.goal_program_positions
        WHERE program_id=v_plan)<>3
      OR NOT EXISTS (SELECT 1 FROM goals.goal_program_positions
        WHERE program_id=v_plan AND position=2 AND strategie_code='lean_bulk'
          AND projected_end_date=DATE '2026-07-18')
      OR NOT EXISTS (SELECT 1 FROM goals.goal_program_positions
        WHERE program_id=v_plan AND position=3 AND strategie_code='lean_bulk'
          AND gueltig_ab=DATE '2026-10-10') THEN
      RAISE EXCEPTION 'G670_STOP:live_plan_diverged';
    END IF;
    UPDATE goals.goal_program_positions SET position=4
    WHERE program_id=v_plan AND position=3;
    INSERT INTO goals.goal_program_positions
      (program_id,position,strategie_code,duration_weeks,richtung,phase_type,
        zielrate_pct_kg_woche,gueltig_ab,projected_end_date)
    VALUES (v_plan,3,'maintain',12,'halten','maintenance',0,
      DATE '2026-07-19',DATE '2026-10-09');
  ELSIF v_email='test-user@lumeos.local' THEN
    -- The fresh chain has the design measurements on test-user; its single
    -- open controlling position has no gap to fill.
    IF (SELECT count(*) FROM goals.goal_programs p
        JOIN goals.goal_program_positions pos ON pos.program_id=p.id
        WHERE p.user_id=v_user AND p.status='aktiv'
          AND p.name='G-559 Abbauziel' AND pos.position=1
          AND pos.projected_end_date IS NULL)<>1 THEN
      RAISE EXCEPTION 'G670_STOP:chain_plan_diverged';
    END IF;
  ELSE
    RAISE EXCEPTION 'G670_STOP:dev_plan_missing';
  END IF;

  ALTER TABLE goals.user_goals DROP CONSTRAINT user_goals_linked_modules_check;
  ALTER TABLE goals.user_goals ADD CONSTRAINT user_goals_linked_modules_check
    CHECK (linked_modules <@ ARRAY['nutrition','training','recovery',
      'supplements','medical','measurements']::text[]
      AND array_position(linked_modules,NULL::text) IS NULL);
  UPDATE goals.user_goals SET linked_modules=CASE title
    WHEN 'Kniebeuge 1RM 160 kg' THEN ARRAY['training','nutrition','recovery']
    WHEN 'Kreuzheben 150 kg × 5' THEN ARRAY['training','recovery']
    WHEN 'Körperfett 14 %' THEN ARRAY['measurements','nutrition']
    WHEN 'Training 4× pro Woche' THEN ARRAY['training'] END
  WHERE user_id=v_user AND title IN
    ('Kniebeuge 1RM 160 kg','Kreuzheben 150 kg × 5',
      'Körperfett 14 %','Training 4× pro Woche')
    AND linked_modules='{}'::text[];
  GET DIAGNOSTICS v_count=ROW_COUNT;
  IF v_count<>4 THEN RAISE EXCEPTION 'G670_STOP:module_rows_%',v_count; END IF;
  UPDATE goals.user_goals
  SET gueltig_ab=date_trunc('week',CURRENT_DATE)::date-77
  WHERE user_id=v_user AND title='Training 4× pro Woche'
    AND gueltig_ab=date_trunc('week',CURRENT_DATE)::date-21;
  IF NOT FOUND THEN RAISE EXCEPTION 'G670_STOP:habit_start_diverged'; END IF;

  -- Fill only missing days. The existing sessions remain the source of truth.
  FOR v_offset IN -11..0 LOOP
    v_week:=date_trunc('week',CURRENT_DATE)::date+v_offset*7;
    v_target:=CASE WHEN v_offset>=-5 THEN 4 ELSE 2 END;
    SELECT count(*) INTO v_count FROM training.workout_sessions
    WHERE user_id=v_user AND status='completed'
      AND session_date BETWEEN v_week AND least(v_week+6,CURRENT_DATE);
    v_added:=0;
    FOR v_day IN SELECT (v_week+n)::date FROM generate_series(0,6) n LOOP
      EXIT WHEN v_count+v_added>=v_target;
      IF v_day>CURRENT_DATE OR EXISTS (
        SELECT 1 FROM training.workout_sessions
        WHERE user_id=v_user AND status='completed' AND session_date=v_day
      ) THEN CONTINUE; END IF;
      INSERT INTO training.workout_sessions
        (user_id,session_date,started_time,ended_time,name,status,
          duration_minutes,notes)
      VALUES (v_user,v_day,time '17:30',time '18:30',
        'Krafttraining · Entwurfswochen','completed',60,'G-670 Entwurfswochen');
      v_added:=v_added+1;
    END LOOP;
    IF v_count+v_added<v_target THEN
      RAISE EXCEPTION 'G670_STOP:week_%_only_%',v_week,v_count+v_added;
    END IF;
  END LOOP;
END $g670$;
COMMIT;
