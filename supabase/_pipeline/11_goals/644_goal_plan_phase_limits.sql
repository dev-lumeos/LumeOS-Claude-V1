-- G-644: G-626 bleibt beim Start jeder geplanten Phase wirksam.
BEGIN;

CREATE OR REPLACE FUNCTION goals.g626_guard_controlling_phase()
RETURNS trigger
LANGUAGE plpgsql SECURITY INVOKER SET search_path = ''
AS $$
DECLARE
  v_goal goals.user_goals%ROWTYPE;
  v_profile public.profiles%ROWTYPE;
  v_direction text;
  v_start_kg numeric;
  v_target_kg numeric;
  v_tdee numeric;
  v_program_code text;
  v_own_values jsonb;
  v_confirmed jsonb;
  v_blocks text[];
  v_unconfirmed text[];
  v_position goals.goal_program_positions%ROWTYPE;
  v_local_rate numeric;
  v_check_date date;
BEGIN
  -- Direkte Zielphasen verwenden die drei Richtungen von Ziel setzen;
  -- Planpositionen bringen ihre eigene Richtung und ihr lokales Ziel mit.
  IF NEW.goal_id IS NULL OR NEW.phase_type NOT IN
    ('fat_loss', 'mini_cut', 'lean_bulk', 'maintenance') THEN
    RETURN NEW;
  END IF;

  SELECT * INTO v_goal FROM goals.user_goals WHERE id = NEW.goal_id
    AND user_id = NEW.user_id;
  IF NOT FOUND OR v_goal.goal_type <> 'body_composition' THEN
    RETURN NEW;
  END IF;
  SELECT * INTO v_profile FROM public.profiles WHERE id = NEW.user_id;
  v_direction := CASE NEW.phase_type
    WHEN 'fat_loss' THEN 'abnehmen'
    WHEN 'mini_cut' THEN 'abnehmen'
    WHEN 'lean_bulk' THEN 'aufbauen'
    ELSE 'halten' END;
  v_start_kg := coalesce(
    CASE WHEN v_goal.target_unit = 'kg' THEN v_goal.start_value END,
    v_profile.body_weight_kg);
  v_target_kg := CASE WHEN v_goal.target_unit = 'kg' THEN v_goal.target_value END;
  v_check_date := coalesce(v_goal.target_date,NEW.projected_end_date);
  IF NEW.parameters ? 'g625_position_id' THEN
    SELECT pos.* INTO v_position FROM goals.goal_program_positions pos
    JOIN goals.goal_programs plan ON plan.id=pos.program_id
    WHERE pos.id=(NEW.parameters->>'g625_position_id')::uuid
      AND plan.goal_id=NEW.goal_id AND plan.user_id=NEW.user_id
      AND plan.status='aktiv';
    IF NOT FOUND THEN
      RAISE EXCEPTION 'G626_BLOCK:plan_position_passt_nicht'
        USING ERRCODE='23514';
    END IF;
    v_direction := v_position.richtung;
    v_start_kg := coalesce(v_profile.body_weight_kg,v_start_kg);
    v_local_rate := coalesce(NEW.zielrate_pct_kg_woche,
      (NEW.parameters->>'g625_catalog_rate')::numeric);
    v_target_kg := CASE WHEN v_direction='halten' THEN NULL
      WHEN v_start_kg IS NOT NULL AND v_local_rate IS NOT NULL THEN
        v_start_kg*(1+v_local_rate*coalesce(
          (NEW.projected_end_date-NEW.gueltig_ab)::numeric/7,
          v_position.duration_weeks)/100) END;
    v_check_date := NEW.projected_end_date;
  END IF;
  SELECT b.tdee INTO v_tdee
  FROM goals.tdee_basis_am(NEW.user_id, NEW.gueltig_ab) b;

  IF NEW.strategie_code = 'custom' THEN
    v_own_values := NEW.parameters -> 'g626_eigene_werte';
  ELSE
    v_program_code := NEW.strategie_code;
    IF NEW.parameters ? 'g626_eigene_werte' THEN
      RAISE EXCEPTION 'G626_BLOCK:vorgehen_doppelt'
        USING ERRCODE = '23514';
    END IF;
  END IF;
  v_confirmed := coalesce(NEW.parameters -> 'g626_confirmed_warnings', '[]'::jsonb);
  IF jsonb_typeof(v_confirmed) <> 'array' THEN
    RAISE EXCEPTION 'G626_BLOCK:bestaetigungen_ungueltig'
      USING ERRCODE = '23514';
  END IF;

  SELECT
    array_agg(f.schluessel ORDER BY f.schluessel) FILTER (WHERE f.art = 'sperre'),
    array_agg(f.schluessel ORDER BY f.schluessel) FILTER (
      WHERE f.art = 'warnung' AND NOT v_confirmed ? f.schluessel)
  INTO v_blocks, v_unconfirmed
  FROM goals.ziel_grenzen_pruefen(
    v_profile.experience_level, v_direction, v_start_kg, v_target_kg,
    NEW.gueltig_ab, v_check_date,
    v_program_code, v_own_values, v_profile.biological_sex,
    v_profile.height_cm, v_tdee,
    CASE WHEN v_program_code IS NOT NULL
      THEN NEW.zielrate_pct_kg_woche END
  ) f;

  IF v_blocks IS NOT NULL THEN
    RAISE EXCEPTION 'G626_BLOCK:%', array_to_string(v_blocks, ',')
      USING ERRCODE = '23514';
  END IF;
  IF v_unconfirmed IS NOT NULL THEN
    RAISE EXCEPTION 'G626_CONFIRM:%', array_to_string(v_unconfirmed, ',')
      USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$;


CREATE OR REPLACE FUNCTION goals.g625_guard_plan_phase()
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
  v_local_rate numeric;
  v_target numeric;
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
    v_profile.body_weight_kg,
    CASE WHEN v_goal.target_unit='kg' THEN v_goal.start_value END);
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
  v_local_rate := coalesce(NEW.zielrate_pct_kg_woche,
    (NEW.parameters->>'g625_catalog_rate')::numeric);
  v_target := CASE WHEN v_position.richtung='halten' THEN NULL
    WHEN v_start IS NOT NULL AND v_local_rate IS NOT NULL THEN
      v_start*(1+v_local_rate*coalesce(
        (NEW.projected_end_date-NEW.gueltig_ab)::numeric/7,
        v_position.duration_weeks)/100) END;
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
    v_target,
    NEW.gueltig_ab,NEW.projected_end_date,
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


COMMIT;
