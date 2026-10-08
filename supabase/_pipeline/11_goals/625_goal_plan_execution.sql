-- G-625: Eine vorbereitete Position wird ueber den bewachten Phasenstart aktiv.
BEGIN;

-- Ziel setzen darf die Richtung ohne Strategie uebergeben. Die drei
-- Richtungsstandards kommen aus dem Katalog; die G-626-Pruefung sieht
-- anschliessend denselben Code wie bei einer ausdruecklichen Auswahl.
CREATE FUNCTION goals.g625_default_direction_strategy()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE
  v_group text;
BEGIN
  IF NEW.strategie_code IS NOT NULL OR NEW.phase_type NOT IN
    ('fat_loss','lean_bulk','maintenance') THEN
    RETURN NEW;
  END IF;
  v_group := CASE NEW.phase_type
    WHEN 'fat_loss' THEN 'abnehmen'
    WHEN 'lean_bulk' THEN 'aufbauen'
    ELSE 'halten' END;
  SELECT code INTO NEW.strategie_code FROM goals.goal_strategies
  WHERE auswahl_gruppe=v_group AND standard;
  IF NEW.strategie_code IS NULL THEN
    RAISE EXCEPTION 'G625_BLOCK:richtungsstandard_fehlt'
      USING ERRCODE='23514';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER g625_default_direction_strategy
  BEFORE INSERT ON goals.goal_phases FOR EACH ROW
  EXECUTE FUNCTION goals.g625_default_direction_strategy();
REVOKE ALL ON FUNCTION goals.g625_default_direction_strategy()
  FROM PUBLIC,anon,authenticated;

CREATE FUNCTION goals.goal_plan_position_start(p_position_id uuid)
RETURNS uuid LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE
  v_position goals.goal_program_positions%ROWTYPE;
  v_plan goals.goal_programs%ROWTYPE;
  v_profile public.profiles%ROWTYPE;
  v_tdee numeric;
  v_kcal numeric;
  v_rate numeric;
  v_own jsonb;
  v_params jsonb;
  v_phase_id uuid;
  v_expected_direction text;
BEGIN
  SELECT pos.* INTO v_position FROM goals.goal_program_positions pos
  JOIN goals.goal_programs plan ON plan.id=pos.program_id
  WHERE pos.id=p_position_id AND plan.user_id=auth.uid()
  FOR UPDATE OF pos;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'G625_BLOCK:position_fremd' USING ERRCODE='42501';
  END IF;
  SELECT * INTO v_plan FROM goals.goal_programs WHERE id=v_position.program_id;
  IF v_plan.status<>'aktiv' OR NOT EXISTS (
    SELECT 1 FROM goals.user_goals g
    WHERE g.id=v_plan.goal_id AND g.status='active'
  ) THEN
    RAISE EXCEPTION 'G625_BLOCK:plan_nicht_aktiv' USING ERRCODE='23514';
  END IF;
  IF v_position.goal_phase_id IS NOT NULL THEN
    RAISE EXCEPTION 'G625_BLOCK:position_bereits_gestartet' USING ERRCODE='23514';
  END IF;
  v_expected_direction := CASE v_position.phase_type
    WHEN 'fat_loss' THEN 'abnehmen'
    WHEN 'mini_cut' THEN 'abnehmen'
    WHEN 'lean_bulk' THEN 'aufbauen'
    WHEN 'maintenance' THEN 'halten'
    WHEN 'recomp' THEN 'halten'
    ELSE v_position.richtung END;
  IF v_expected_direction<>v_position.richtung THEN
    RAISE EXCEPTION 'G625_BLOCK:phase_richtung' USING ERRCODE='23514';
  END IF;
  v_params := jsonb_build_object(
    'g625_position_id',v_position.id,
    'g626_confirmed_warnings',v_position.confirmed_warnings
  );
  IF v_position.eigene_werte IS NOT NULL THEN
    SELECT * INTO v_profile FROM public.profiles WHERE id=v_plan.user_id;
    SELECT tdee INTO v_tdee FROM goals.tdee_basis_am(
      v_plan.user_id,coalesce(v_position.gueltig_ab,current_date));
    IF v_profile.body_weight_kg IS NULL OR v_profile.body_weight_kg<=0
       OR v_tdee IS NULL OR v_tdee<=0 THEN
      RAISE EXCEPTION 'G625_BLOCK:erhaltung_nicht_berechenbar'
        USING ERRCODE='23514';
    END IF;
    v_own := v_position.eigene_werte;
    IF v_own ? 'tempo_pct_kg_woche' THEN
      v_rate := CASE v_position.richtung
        WHEN 'abnehmen' THEN -(v_own->>'tempo_pct_kg_woche')::numeric
        WHEN 'aufbauen' THEN (v_own->>'tempo_pct_kg_woche')::numeric
        ELSE 0 END;
      v_kcal := round(v_tdee
        + goals.kcal_delta_aus_zielrate(v_rate,v_profile.body_weight_kg),1);
    ELSE
      v_kcal := round(v_tdee * (1
        + (v_own->>'kcal_pct_erhaltung')::numeric / 100),1);
      v_rate := (v_kcal-v_tdee)/(11*v_profile.body_weight_kg);
      v_own := v_own || jsonb_build_object(
        'tempo_pct_kg_woche',abs(v_rate));
    END IF;
    IF v_kcal<=0 THEN
      RAISE EXCEPTION 'G626_BLOCK:kalorien_ungueltig' USING ERRCODE='23514';
    END IF;
    v_own := v_own || jsonb_build_object('kcal',v_kcal);
    v_params := v_params || jsonb_build_object(
      'g626_eigene_werte',v_own,
      'protein_per_kg',(v_own->>'protein_g_kg')::numeric,
      'fat_percent',round(
        (v_own->>'fett_g_kg')::numeric*v_profile.body_weight_kg*9/v_kcal,6)
    );
  ELSE
    v_rate := v_position.zielrate_pct_kg_woche;
    IF v_rate IS NULL AND v_position.sub_phase_code IS NOT NULL THEN
      SELECT tdee INTO v_tdee FROM goals.tdee_basis_am(
        v_plan.user_id,coalesce(v_position.gueltig_ab,current_date));
      SELECT body_weight_kg INTO v_profile.body_weight_kg
      FROM public.profiles WHERE id=v_plan.user_id;
      SELECT round(((part.value->>'tdee_multiplier')::numeric-1)
        *v_tdee/(11*v_profile.body_weight_kg),3)
      INTO v_rate
      FROM goals.goal_strategies s
      CROSS JOIN LATERAL jsonb_array_elements(s.sub_phases) AS part(value)
      WHERE s.code=v_position.strategie_code
        AND part.value->>'name'=v_position.sub_phase_code
        AND jsonb_typeof(part.value->'tdee_multiplier')='number';
    END IF;
    IF v_rate IS NOT NULL THEN
      v_params := v_params || jsonb_build_object('g625_catalog_rate',v_rate);
    END IF;
  END IF;
  v_phase_id := goals.goal_phase_start(
    v_position.phase_type,v_plan.goal_id,
    coalesce(v_position.gueltig_ab,current_date),
    v_position.projected_end_date,NULL,v_params,
    CASE WHEN v_position.phase_type IN
      ('fat_loss','mini_cut','lean_bulk','maintenance')
      THEN v_rate ELSE NULL END,
    CASE WHEN v_position.eigene_werte IS NULL
      THEN v_position.strategie_code ELSE 'custom' END
  );
  RETURN v_phase_id;
END $$;

REVOKE ALL ON FUNCTION goals.goal_plan_position_start(uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION goals.goal_plan_position_start(uuid)
  TO authenticated,service_role;
COMMIT;
