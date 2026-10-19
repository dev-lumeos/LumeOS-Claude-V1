-- G-675: executed plan phases are history. Only their planned end may move.
BEGIN;

CREATE FUNCTION goals.g675_phase_edit_guard()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
BEGIN
  IF current_setting('goals.g675_purge',true)='on' THEN
    RETURN CASE WHEN TG_OP='DELETE' THEN OLD ELSE NEW END;
  END IF;
  IF TG_OP='DELETE' AND current_user<>'authenticated' THEN RETURN OLD; END IF;
  IF TG_OP='DELETE' THEN
    IF OLD.gueltig_ab<=CURRENT_DATE THEN
      RAISE EXCEPTION 'G675_BLOCK:phase_verlauf' USING ERRCODE='23514';
    END IF;
    RETURN OLD;
  END IF;
  IF OLD.gueltig_ab>CURRENT_DATE THEN RETURN NEW; END IF;
  IF OLD.actual_end_date IS NOT NULL THEN
    RAISE EXCEPTION 'G675_BLOCK:phase_verlauf' USING ERRCODE='23514';
  END IF;
  IF (to_jsonb(NEW)-'updated_at'-'projected_end_date'-'actual_end_date'
       -'transition_reason'-'parameters') IS DISTINCT FROM
     (to_jsonb(OLD)-'updated_at'-'projected_end_date'-'actual_end_date'
       -'transition_reason'-'parameters')
     OR (NEW.parameters-'g626_confirmed_warnings') IS DISTINCT FROM
        (OLD.parameters-'g626_confirmed_warnings') THEN
    RAISE EXCEPTION 'G675_BLOCK:laufend_nur_laenge' USING ERRCODE='23514';
  END IF;
  IF NEW.actual_end_date IS DISTINCT FROM OLD.actual_end_date THEN
    IF NEW.actual_end_date<>CURRENT_DATE OR NEW.transition_reason IS NULL
       OR btrim(NEW.transition_reason)='' THEN
      RAISE EXCEPTION 'G675_BLOCK:nur_heute_beenden' USING ERRCODE='23514';
    END IF;
  ELSIF NEW.transition_reason IS DISTINCT FROM OLD.transition_reason THEN
    RAISE EXCEPTION 'G675_BLOCK:laufend_nur_laenge' USING ERRCODE='23514';
  END IF;
  IF NEW.projected_end_date IS DISTINCT FROM OLD.projected_end_date
     AND (NEW.projected_end_date IS NULL OR NEW.projected_end_date<CURRENT_DATE) THEN
    RAISE EXCEPTION 'G675_BLOCK:ende_vor_heute' USING ERRCODE='23514';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER g675_phase_edit_guard
  BEFORE UPDATE OR DELETE ON goals.goal_phases FOR EACH ROW
  EXECUTE FUNCTION goals.g675_phase_edit_guard();
REVOKE ALL ON FUNCTION goals.g675_phase_edit_guard() FROM PUBLIC,anon,authenticated;

CREATE FUNCTION goals.g675_position_edit_guard()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE v_phase goals.goal_phases%ROWTYPE;
BEGIN
  IF current_setting('goals.g675_purge',true)='on' THEN
    RETURN CASE WHEN TG_OP='DELETE' THEN OLD ELSE NEW END;
  END IF;
  IF TG_OP='DELETE' AND current_user<>'authenticated' THEN RETURN OLD; END IF;
  IF OLD.goal_phase_id IS NULL THEN
    RETURN CASE WHEN TG_OP='DELETE' THEN OLD ELSE NEW END;
  END IF;
  SELECT * INTO v_phase FROM goals.goal_phases WHERE id=OLD.goal_phase_id;
  IF v_phase.gueltig_ab>CURRENT_DATE AND v_phase.actual_end_date IS NULL THEN
    RETURN CASE WHEN TG_OP='DELETE' THEN OLD ELSE NEW END;
  END IF;
  IF NOT FOUND OR v_phase.actual_end_date IS NOT NULL OR TG_OP='DELETE' THEN
    RAISE EXCEPTION 'G675_BLOCK:position_verlauf' USING ERRCODE='23514';
  END IF;
  IF (to_jsonb(NEW)-'updated_at'-'duration_weeks'-'projected_end_date')
       IS DISTINCT FROM
     (to_jsonb(OLD)-'updated_at'-'duration_weeks'-'projected_end_date') THEN
    RAISE EXCEPTION 'G675_BLOCK:laufend_nur_laenge' USING ERRCODE='23514';
  END IF;
  IF NEW.projected_end_date IS NULL OR NEW.projected_end_date<CURRENT_DATE THEN
    RAISE EXCEPTION 'G675_BLOCK:ende_vor_heute' USING ERRCODE='23514';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER g675_position_edit_guard
  BEFORE UPDATE OR DELETE ON goals.goal_program_positions FOR EACH ROW
  EXECUTE FUNCTION goals.g675_position_edit_guard();
REVOKE ALL ON FUNCTION goals.g675_position_edit_guard() FROM PUBLIC,anon,authenticated;

CREATE OR REPLACE FUNCTION goals.goal_plan_position_revise(
  p_position_id uuid,p_strategie_code text,p_eigene_werte jsonb,
  p_duration_weeks smallint DEFAULT NULL,
  p_confirmed_warnings jsonb DEFAULT '[]'::jsonb,
  p_stichtag date DEFAULT CURRENT_DATE,
  p_sub_phase_code text DEFAULT NULL,
  p_zielrate_pct_kg_woche numeric DEFAULT NULL
) RETURNS uuid LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE v_pos goals.goal_program_positions%ROWTYPE;
  v_phase goals.goal_phases%ROWTYPE; v_end date; v_weeks smallint;
BEGIN
  SELECT pos.* INTO v_pos FROM goals.goal_program_positions pos
  JOIN goals.goal_programs plan ON plan.id=pos.program_id
  WHERE pos.id=p_position_id AND plan.user_id=auth.uid()
    AND plan.status='aktiv' FOR UPDATE OF pos;
  IF NOT FOUND THEN RAISE EXCEPTION 'G675_BLOCK:position_fremd_oder_inaktiv'
    USING ERRCODE='42501'; END IF;
  SELECT * INTO v_phase FROM goals.goal_phases
  WHERE id=v_pos.goal_phase_id AND actual_end_date IS NULL
    AND gueltig_ab<=CURRENT_DATE FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'G675_BLOCK:position_nicht_laufend'
    USING ERRCODE='23514'; END IF;
  IF p_stichtag IS DISTINCT FROM CURRENT_DATE
     OR p_strategie_code IS DISTINCT FROM v_pos.strategie_code
     OR p_eigene_werte IS DISTINCT FROM v_pos.eigene_werte
     OR p_sub_phase_code IS DISTINCT FROM v_pos.sub_phase_code
     OR p_zielrate_pct_kg_woche IS DISTINCT FROM v_pos.zielrate_pct_kg_woche THEN
    RAISE EXCEPTION 'G675_BLOCK:laufend_nur_laenge' USING ERRCODE='23514';
  END IF;
  v_weeks:=coalesce(p_duration_weeks,v_pos.duration_weeks);
  IF v_weeks IS NULL OR v_weeks<1 THEN
    RAISE EXCEPTION 'G675_BLOCK:dauer' USING ERRCODE='23514';
  END IF;
  v_end:=v_phase.gueltig_ab+v_weeks*7-1;
  IF v_end<CURRENT_DATE THEN
    RAISE EXCEPTION 'G675_BLOCK:ende_vor_heute' USING ERRCODE='23514';
  END IF;
  UPDATE goals.goal_phases SET projected_end_date=v_end,
    parameters=jsonb_set(parameters,'{g626_confirmed_warnings}',
      coalesce(p_confirmed_warnings,'[]'::jsonb),true)
  WHERE id=v_phase.id;
  UPDATE goals.goal_program_positions SET duration_weeks=v_weeks,
    projected_end_date=v_end WHERE id=v_pos.id;
  RETURN v_pos.id;
END $$;
COMMENT ON FUNCTION goals.goal_plan_position_revise(
  uuid,text,jsonb,smallint,jsonb,date,text,numeric) IS
  'G-675: laufende Position und Phase duerfen atomar nur in der Laenge geaendert werden; Ende nicht vor heute.';

CREATE OR REPLACE FUNCTION goals.goal_phase_end(
  p_phase_id uuid,p_transition_reason text,p_actual_end_date date DEFAULT CURRENT_DATE
) RETURNS uuid LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE v_phase goals.goal_phases%ROWTYPE;
BEGIN
  SELECT * INTO v_phase FROM goals.goal_phases
  WHERE id=p_phase_id AND user_id=auth.uid() AND actual_end_date IS NULL
    AND gueltig_ab<=CURRENT_DATE FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'G675_BLOCK:phase_nicht_laufend'
    USING ERRCODE='23514'; END IF;
  IF p_actual_end_date IS DISTINCT FROM CURRENT_DATE
     OR nullif(btrim(p_transition_reason),'') IS NULL THEN
    RAISE EXCEPTION 'G675_BLOCK:nur_heute_beenden' USING ERRCODE='23514';
  END IF;
  UPDATE goals.goal_program_positions SET
    projected_end_date=CURRENT_DATE,
    duration_weeks=greatest(1,ceil((CURRENT_DATE-v_phase.gueltig_ab+1)::numeric/7))::smallint
  WHERE goal_phase_id=p_phase_id;
  UPDATE goals.goal_phases SET actual_end_date=CURRENT_DATE,
    transition_reason=btrim(p_transition_reason) WHERE id=p_phase_id;
  RETURN p_phase_id;
END $$;
COMMIT;
