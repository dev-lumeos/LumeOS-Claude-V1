-- G-625: Auch mehrphasige Planarten muessen durch die G-626-Befundfunktion.
-- Die vier Richtungsphasen behalten ihren bereits installierten G-626-Trigger.
BEGIN;

CREATE FUNCTION goals.g625_guard_plan_phase()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE
  v_position goals.goal_program_positions%ROWTYPE;
  v_goal goals.user_goals%ROWTYPE;
  v_profile public.profiles%ROWTYPE;
  v_tdee numeric;
  v_start numeric;
  v_program text;
  v_own jsonb;
  v_confirmed jsonb;
  v_blocks text[];
  v_unconfirmed text[];
BEGIN
  IF NEW.phase_type IN ('fat_loss','mini_cut','lean_bulk','maintenance') THEN
    RETURN NEW;
  END IF;
  IF NEW.goal_id IS NULL OR NOT (NEW.parameters ? 'g625_position_id') THEN
    RAISE EXCEPTION 'G626_BLOCK:plan_position_fehlt' USING ERRCODE='23514';
  END IF;
  SELECT pos.* INTO v_position FROM goals.goal_program_positions pos
  JOIN goals.goal_programs plan ON plan.id=pos.program_id
  WHERE pos.id=(NEW.parameters->>'g625_position_id')::uuid
    AND plan.goal_id=NEW.goal_id AND plan.user_id=NEW.user_id;
  IF NOT FOUND OR v_position.phase_type<>NEW.phase_type THEN
    RAISE EXCEPTION 'G626_BLOCK:plan_position_passt_nicht'
      USING ERRCODE='23514';
  END IF;
  SELECT * INTO v_goal FROM goals.user_goals
  WHERE id=NEW.goal_id AND user_id=NEW.user_id;
  IF NOT FOUND OR v_goal.goal_type<>'body_composition' THEN
    RAISE EXCEPTION 'G626_BLOCK:steuerziel_fehlt' USING ERRCODE='23514';
  END IF;
  SELECT * INTO v_profile FROM public.profiles WHERE id=NEW.user_id;
  SELECT tdee INTO v_tdee FROM goals.tdee_basis_am(NEW.user_id,NEW.gueltig_ab);
  v_start := coalesce(
    CASE WHEN v_goal.target_unit='kg' THEN v_goal.start_value END,
    v_profile.body_weight_kg);
  IF NEW.strategie_code='custom' THEN
    v_own := NEW.parameters->'g626_eigene_werte';
  ELSE
    v_program := NEW.strategie_code;
    IF NEW.parameters ? 'g626_eigene_werte' THEN
      RAISE EXCEPTION 'G626_BLOCK:vorgehen_doppelt' USING ERRCODE='23514';
    END IF;
  END IF;
  v_confirmed := coalesce(
    NEW.parameters->'g626_confirmed_warnings','[]'::jsonb);
  IF jsonb_typeof(v_confirmed)<>'array' THEN
    RAISE EXCEPTION 'G626_BLOCK:bestaetigungen_ungueltig'
      USING ERRCODE='23514';
  END IF;
  SELECT
    array_agg(f.schluessel ORDER BY f.schluessel)
      FILTER (WHERE f.art='sperre'),
    array_agg(f.schluessel ORDER BY f.schluessel)
      FILTER (WHERE f.art='warnung'
        AND NOT v_confirmed ? f.schluessel)
  INTO v_blocks,v_unconfirmed
  FROM goals.ziel_grenzen_pruefen(
    v_profile.experience_level,v_position.richtung,v_start,
    CASE WHEN v_goal.target_unit='kg' THEN v_goal.target_value END,
    NEW.gueltig_ab,coalesce(v_goal.target_date,NEW.projected_end_date),
    v_program,v_own,v_profile.biological_sex,v_profile.height_cm,
    v_tdee,CASE WHEN v_program IS NOT NULL THEN
      coalesce(NEW.zielrate_pct_kg_woche,
        (NEW.parameters->>'g625_catalog_rate')::numeric) END
  ) f;
  IF v_blocks IS NOT NULL THEN
    RAISE EXCEPTION 'G626_BLOCK:%',array_to_string(v_blocks,',')
      USING ERRCODE='23514';
  END IF;
  IF v_unconfirmed IS NOT NULL THEN
    RAISE EXCEPTION 'G626_CONFIRM:%',array_to_string(v_unconfirmed,',')
      USING ERRCODE='23514';
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER g625_guard_plan_phase
  BEFORE INSERT OR UPDATE OF goal_id,phase_type,strategie_code,
    zielrate_pct_kg_woche,gueltig_ab,projected_end_date,parameters
  ON goals.goal_phases FOR EACH ROW
  EXECUTE FUNCTION goals.g625_guard_plan_phase();
REVOKE ALL ON FUNCTION goals.g625_guard_plan_phase()
  FROM PUBLIC,anon,authenticated;
COMMIT;
