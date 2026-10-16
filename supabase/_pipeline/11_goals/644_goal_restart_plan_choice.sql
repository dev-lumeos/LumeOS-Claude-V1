-- G-644: Neustart waehlt den Plan mit dem juengsten echten Phasenverlauf.
BEGIN;

CREATE OR REPLACE FUNCTION goals.goal_restart(p_goal_id uuid,p_start_date date,p_target_date date)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE v_old goals.user_goals%ROWTYPE; v_new uuid; v_reason text;
  v_frozen_on date;
  v_plan goals.goal_programs%ROWTYPE; v_position goals.goal_program_positions%ROWTYPE;
  v_new_plan uuid;
BEGIN
  SELECT * INTO v_old FROM goals.user_goals
  WHERE id=p_goal_id AND user_id=auth.uid() FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'G611_BLOCK:ziel_fremd: Das Ziel fehlt oder gehört nicht zu deinem Konto.' USING ERRCODE='42501'; END IF;
  SELECT reason,frozen_on INTO v_reason,v_frozen_on
    FROM goals.goal_state_at(p_goal_id,CURRENT_DATE)
    WHERE state='eingefroren';
  IF v_reason IS NULL THEN
    RAISE EXCEPTION 'G611_BLOCK:nur_eingefroren_neustarten: Nur eingefrorene Ziele können neu gestartet werden.' USING ERRCODE='23514';
  END IF;
  IF p_start_date IS NULL OR p_start_date<CURRENT_DATE
     OR p_target_date IS NULL OR p_target_date<p_start_date THEN
    RAISE EXCEPTION 'G611_BLOCK:neue_frist: Der neue Zeitraum muss heute oder später beginnen und das Ende darf nicht vor dem Start liegen.' USING ERRCODE='23514';
  END IF;
  UPDATE goals.user_goals SET status=CASE v_reason WHEN 'erreicht'
      THEN 'achieved' WHEN 'frist_abgelaufen' THEN 'missed' ELSE 'abandoned' END,
    achievement_date=coalesce(achievement_date,v_frozen_on,CURRENT_DATE)
  WHERE id=p_goal_id;
  INSERT INTO goals.user_goals(user_id,goal_type,subtype,title,description,
    target_value,target_unit,start_value,current_value,gueltig_ab,target_date,
    status,priority,is_primary,motivation_reason,difficulty_level,auto_update,
    celebration_enabled,linked_modules,exercise_id,measurement_type,
    measurement_reps,measurement_site,measurement_rhythm,better_direction)
  VALUES (v_old.user_id,v_old.goal_type,v_old.subtype,v_old.title,
    v_old.description,v_old.target_value,v_old.target_unit,v_old.current_value,
    v_old.current_value,p_start_date,p_target_date,'on_hold',v_old.priority,
    false,v_old.motivation_reason,v_old.difficulty_level,v_old.auto_update,
    v_old.celebration_enabled,v_old.linked_modules,v_old.exercise_id,
    v_old.measurement_type,v_old.measurement_reps,v_old.measurement_site,
    v_old.measurement_rhythm,v_old.better_direction)
  RETURNING id INTO v_new;
  IF v_old.goal_role='controlling' THEN
    SELECT plan.* INTO v_plan FROM goals.goal_programs plan LEFT JOIN LATERAL (SELECT max(ph.gueltig_ab) AS letzte_phase FROM goals.goal_program_positions pos JOIN goals.goal_phases ph ON ph.id=pos.goal_phase_id WHERE pos.program_id=plan.id) history ON true WHERE plan.goal_id=p_goal_id ORDER BY history.letzte_phase DESC NULLS LAST,plan.updated_at DESC,plan.id DESC LIMIT 1;
    INSERT INTO goals.goal_programs(goal_id,user_id,name,status)
    VALUES (v_new,v_old.user_id,coalesce(v_plan.name,v_old.title),'entwurf')
    RETURNING id INTO v_new_plan;
    SELECT * INTO v_position FROM goals.goal_program_positions
    WHERE program_id=v_plan.id ORDER BY (goal_phase_id IS NOT NULL) DESC,position DESC LIMIT 1;
    IF FOUND THEN
      INSERT INTO goals.goal_program_positions(program_id,position,
        strategie_code,sub_phase_code,duration_weeks,eigene_werte,richtung,
        phase_type,zielrate_pct_kg_woche,gueltig_ab,projected_end_date,
        confirmed_warnings)
      VALUES (v_new_plan,1,v_position.strategie_code,v_position.sub_phase_code,
        v_position.duration_weeks,v_position.eigene_werte,v_position.richtung,
        v_position.phase_type,v_position.zielrate_pct_kg_woche,
        p_start_date,p_target_date,v_position.confirmed_warnings);
    END IF;
  END IF;
  RETURN v_new;
END $$;

COMMIT;
