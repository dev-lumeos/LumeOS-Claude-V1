-- G-625: Auch eine spaetere Zielaenderung darf die Grenzen einer
-- mehrphasigen Planposition nicht umgehen.
BEGIN;

CREATE FUNCTION goals.g625_guard_plan_goal_update()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE
  v_phase goals.goal_phases%ROWTYPE;
  v_position goals.goal_program_positions%ROWTYPE;
  v_profile public.profiles%ROWTYPE;
  v_tdee numeric;
  v_start numeric;
  v_program text;
  v_own jsonb;
  v_confirmed jsonb;
  v_blocks text[];
  v_unconfirmed text[];
BEGIN
  SELECT phase.* INTO v_phase
  FROM goals.goal_phases phase
  JOIN goals.goal_program_positions pos ON pos.goal_phase_id=phase.id
  JOIN goals.goal_programs plan ON plan.id=pos.program_id
  WHERE phase.goal_id=NEW.id AND phase.user_id=NEW.user_id
    AND phase.actual_end_date IS NULL
    AND phase.phase_type NOT IN
      ('fat_loss','mini_cut','lean_bulk','maintenance')
    AND plan.status='aktiv'
  ORDER BY phase.gueltig_ab DESC,phase.created_at DESC LIMIT 1;
  IF NOT FOUND THEN RETURN NEW; END IF;
  SELECT pos.* INTO v_position
  FROM goals.goal_program_positions pos
  WHERE pos.goal_phase_id=v_phase.id;
  IF NEW.goal_type<>'body_composition' THEN
    RAISE EXCEPTION 'G626_BLOCK:steuerziel_fehlt' USING ERRCODE='23514';
  END IF;
  SELECT * INTO v_profile FROM public.profiles WHERE id=NEW.user_id;
  SELECT tdee INTO v_tdee FROM goals.tdee_basis_am(
    NEW.user_id,v_phase.gueltig_ab);
  v_start := coalesce(
    CASE WHEN NEW.target_unit='kg' THEN NEW.start_value END,
    v_profile.body_weight_kg);
  IF v_phase.strategie_code='custom' THEN
    v_own := v_phase.parameters->'g626_eigene_werte';
  ELSE
    v_program := v_phase.strategie_code;
  END IF;
  v_confirmed := coalesce(
    v_phase.parameters->'g626_confirmed_warnings','[]'::jsonb);
  SELECT
    array_agg(f.schluessel ORDER BY f.schluessel)
      FILTER (WHERE f.art='sperre'),
    array_agg(f.schluessel ORDER BY f.schluessel)
      FILTER (WHERE f.art='warnung' AND NOT v_confirmed ? f.schluessel)
  INTO v_blocks,v_unconfirmed
  FROM goals.ziel_grenzen_pruefen(
    v_profile.experience_level,v_position.richtung,v_start,
    CASE WHEN NEW.target_unit='kg' THEN NEW.target_value END,
    v_phase.gueltig_ab,coalesce(NEW.target_date,v_phase.projected_end_date),
    v_program,v_own,v_profile.biological_sex,v_profile.height_cm,
    v_tdee,CASE WHEN v_program IS NOT NULL THEN
      coalesce(v_phase.zielrate_pct_kg_woche,
        (v_phase.parameters->>'g625_catalog_rate')::numeric) END
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

CREATE TRIGGER g625_guard_plan_goal_update
  BEFORE UPDATE OF target_value,target_unit,start_value,target_date,goal_type
  ON goals.user_goals FOR EACH ROW
  EXECUTE FUNCTION goals.g625_guard_plan_goal_update();
REVOKE ALL ON FUNCTION goals.g625_guard_plan_goal_update()
  FROM PUBLIC,anon,authenticated;
COMMIT;
