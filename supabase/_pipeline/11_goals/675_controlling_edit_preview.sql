-- G-675: read-only comparison for an existing controlling goal.
BEGIN;
CREATE FUNCTION goals.controlling_goal_edit_preview(
  p_goal_id uuid,p_programm_code text DEFAULT NULL,p_eigene_werte jsonb DEFAULT NULL,
  p_zielrate_pct_kg_woche numeric DEFAULT NULL,p_duration_weeks smallint DEFAULT NULL,
  p_target_value numeric DEFAULT NULL,p_target_date date DEFAULT NULL,
  p_stichtag date DEFAULT CURRENT_DATE
) RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY INVOKER SET search_path='' AS $$
DECLARE v_goal goals.user_goals%ROWTYPE; v_plan goals.goal_programs%ROWTYPE;
  v_pos goals.goal_program_positions%ROWTYPE; v_item goals.goal_program_positions%ROWTYPE;
  v_profile public.profiles%ROWTYPE; v_before record; v_tdee numeric;
  v_weight numeric; v_rate numeric; v_protein numeric; v_kcal numeric;
  v_code text; v_own jsonb; v_weeks smallint; v_end date;
  v_target numeric; v_target_date date; v_findings jsonb; v_block boolean;
  v_rate_findings jsonb; v_rate_block boolean;
  v_date date; v_projected date; v_plan_end date; v_days integer;
  v_run_weight numeric; v_run_rate numeric; v_step integer;
BEGIN
  IF p_stichtag IS NULL OR p_stichtag>CURRENT_DATE THEN
    RAISE EXCEPTION 'G675_BLOCK:vorschau_stichtag' USING ERRCODE='22023';
  END IF;
  SELECT * INTO v_goal FROM goals.user_goals WHERE id=p_goal_id
    AND user_id=auth.uid() AND goal_role='controlling';
  IF NOT FOUND THEN RAISE EXCEPTION 'G675_BLOCK:ziel_fremd'
    USING ERRCODE='42501'; END IF;
  SELECT * INTO v_plan FROM goals.goal_programs
    WHERE goal_id=p_goal_id AND status='aktiv' ORDER BY created_at DESC LIMIT 1;
  SELECT pos.* INTO v_pos FROM goals.goal_program_positions pos
    JOIN goals.goal_phases ph ON ph.id=pos.goal_phase_id
    WHERE pos.program_id=v_plan.id AND ph.gueltig_ab<=p_stichtag
      AND (ph.actual_end_date IS NULL OR ph.actual_end_date>=p_stichtag)
    ORDER BY pos.position DESC LIMIT 1;
  IF v_pos.id IS NULL THEN RAISE EXCEPTION 'G675_BLOCK:keine_laufende_position'
    USING ERRCODE='23514'; END IF;
  SELECT * INTO v_profile FROM public.profiles WHERE id=v_goal.user_id;
  SELECT * INTO v_before FROM goals.berechne_zielwerte(
    v_goal.user_id,p_goal_id,p_stichtag);
  SELECT tdee INTO v_tdee FROM goals.tdee_basis_am(v_goal.user_id,p_stichtag);
  SELECT wert INTO v_weight FROM goals.trendgewicht_am(v_goal.user_id,p_stichtag);
  v_weight:=coalesce(v_weight,v_before.body_weight_kg);
  v_code:=coalesce(p_programm_code,v_pos.strategie_code);
  v_own:=coalesce(p_eigene_werte,v_pos.eigene_werte);
  IF v_code='custom' THEN v_code:=NULL;
  ELSE v_own:=NULL; END IF;
  v_weeks:=coalesce(p_duration_weeks,v_pos.duration_weeks);
  IF v_weeks IS NULL OR v_weeks<1 THEN
    RAISE EXCEPTION 'G675_BLOCK:dauer' USING ERRCODE='23514';
  END IF;
  v_target:=coalesce(p_target_value,v_goal.target_value);
  v_target_date:=coalesce(p_target_date,v_goal.target_date);
  v_end:=v_pos.gueltig_ab+v_weeks*7-1;
  IF v_code IS NOT NULL THEN
    SELECT coalesce(p_zielrate_pct_kg_woche,s.weight_change_target_percent),
      s.protein_per_kg INTO v_rate,v_protein
    FROM goals.goal_strategies s WHERE s.code=v_code;
  ELSE
    v_rate:=CASE v_pos.richtung WHEN 'abnehmen' THEN
      -(v_own->>'tempo_pct_kg_woche')::numeric
      WHEN 'aufbauen' THEN (v_own->>'tempo_pct_kg_woche')::numeric
      ELSE 0 END;
    v_protein:=(v_own->>'protein_g_kg')::numeric;
  END IF;
  SELECT coalesce(jsonb_agg(jsonb_build_object('schluessel',schluessel,
      'art',art,'hinweis',hinweis)),'[]'::jsonb),
    coalesce(bool_or(art='sperre'),false),
    coalesce(jsonb_agg(jsonb_build_object('schluessel',schluessel,
      'art',art,'hinweis',hinweis)) FILTER (WHERE schluessel IN
      ('tempo_standard','tempo','tempo_richtung','vorgehen_zu_langsam')),
      '[]'::jsonb),
    coalesce(bool_or(art='sperre' AND schluessel IN
      ('tempo_standard','tempo','tempo_richtung','vorgehen_zu_langsam')),false)
  INTO v_findings,v_block,v_rate_findings,v_rate_block
  FROM goals.ziel_grenzen_pruefen(v_profile.experience_level,
    v_pos.richtung,v_weight,v_target,p_stichtag,v_target_date,
    v_code,v_own,v_profile.biological_sex,v_profile.height_cm,
    v_tdee,CASE WHEN v_code IS NOT NULL THEN v_rate END);
  IF v_end<p_stichtag THEN
    v_findings:=v_findings||jsonb_build_array(jsonb_build_object(
      'schluessel','ende_vor_heute','art','sperre',
      'hinweis','Das Phasenende liegt vor heute.'));
    v_block:=true;
  END IF;
  IF v_weight IS NOT NULL AND v_tdee IS NOT NULL AND v_rate IS NOT NULL
     AND v_protein IS NOT NULL THEN
    v_kcal:=CASE WHEN v_own ? 'kcal_pct_erhaltung' THEN
      round(v_tdee*(1+(v_own->>'kcal_pct_erhaltung')::numeric/100),1)
      ELSE round(v_tdee+goals.kcal_delta_aus_zielrate(v_rate,v_weight),1) END;
  END IF;
  v_run_weight:=v_weight;
  v_date:=p_stichtag;
  IF v_weight IS NOT NULL AND v_target IS NOT NULL
    AND v_goal.start_value IS NOT NULL
    AND v_target<>v_goal.start_value
    AND (v_weight-v_target)*sign(v_target-v_goal.start_value)>=0 THEN
    v_projected:=p_stichtag;
  END IF;
  FOR v_item IN SELECT * FROM goals.goal_program_positions
    WHERE program_id=v_plan.id AND position>=v_pos.position
    ORDER BY position LOOP
    IF v_item.id<>v_pos.id AND v_item.gueltig_ab IS NOT NULL
      AND v_item.gueltig_ab>v_date+1 THEN
      v_date:=v_item.gueltig_ab-1;
    END IF;
    v_run_rate:=CASE WHEN v_item.id=v_pos.id THEN v_rate ELSE
      coalesce(v_item.zielrate_pct_kg_woche,
        (SELECT weight_change_target_percent FROM goals.goal_strategies
         WHERE code=v_item.strategie_code),
        CASE v_item.richtung
          WHEN 'abnehmen' THEN -(v_item.eigene_werte->>'tempo_pct_kg_woche')::numeric
          WHEN 'aufbauen' THEN (v_item.eigene_werte->>'tempo_pct_kg_woche')::numeric
          WHEN 'halten' THEN 0 END) END;
    v_days:=CASE WHEN v_item.id=v_pos.id THEN v_end-p_stichtag
      ELSE coalesce(v_item.duration_weeks,0)*7 END;
    IF v_run_rate IS NULL OR v_run_rate<=-100 OR v_run_weight IS NULL THEN EXIT; END IF;
    IF v_days<1 THEN CONTINUE; END IF;
    FOR v_step IN 1..least(v_days,3650) LOOP
      v_date:=v_date+1;
      v_run_weight:=v_run_weight*power(1+v_run_rate/100,1.0/7);
      IF v_target IS NOT NULL AND v_projected IS NULL
        AND v_goal.start_value IS NOT NULL
        AND (v_run_weight-v_target)
          *sign(v_target-v_goal.start_value)>=0 THEN
        v_projected:=v_date;
      END IF;
    END LOOP;
  END LOOP;
  v_plan_end:=v_date;
  RETURN jsonb_build_object(
    'ziel_id',p_goal_id,'stichtag',p_stichtag,
    'bisher',jsonb_build_object('kcal',v_before.kcal,
      'protein_g',v_before.protein_g,
      'tempo_pct_kg_woche',v_before.zielrate_pct_kg_woche,
      'nach_plan_erreicht',goals.plan_zieldatum(p_goal_id),
      'phasenlaenge_wochen',v_pos.duration_weeks),
    'neu',jsonb_build_object('kcal',v_kcal,
      'protein_g',CASE WHEN v_kcal IS NOT NULL THEN
        round(v_weight*v_protein,1) END,
      'tempo_pct_kg_woche',v_rate,'nach_plan_erreicht',v_projected,
      'plan_ende',v_plan_end,'phasenlaenge_wochen',v_weeks),
    'rate_innerhalb_grenzen',CASE WHEN v_profile.experience_level IS NULL
      OR v_rate IS NULL THEN NULL ELSE NOT v_rate_block END,
    'rate_hinweise',v_rate_findings,
    'speichern_erlaubt',NOT v_block,'befunde',v_findings,
    'quelle','tdee_basis_am+goal_strategies+ziel_grenzen_pruefen+plan_positionen');
END $$;
REVOKE ALL ON FUNCTION goals.controlling_goal_edit_preview(
  uuid,text,jsonb,numeric,smallint,numeric,date,date) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION goals.controlling_goal_edit_preview(
  uuid,text,jsonb,numeric,smallint,numeric,date,date) TO authenticated,service_role;
COMMIT;
