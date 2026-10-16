-- G-644: Phasen und Status waehlen unter mehreren Plaenen eindeutig aus.
BEGIN;

CREATE OR REPLACE FUNCTION goals.g625_phase_to_plan()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE v_plan goals.goal_programs%ROWTYPE; v_goal goals.user_goals%ROWTYPE;
  v_position_id uuid; v_source text; v_own jsonb; v_richtung text;
BEGIN
  SELECT * INTO v_goal FROM goals.user_goals WHERE id=NEW.goal_id;
  v_position_id := nullif(NEW.parameters->>'g625_position_id','')::uuid;
  IF v_position_id IS NOT NULL THEN
    SELECT plan.* INTO v_plan FROM goals.goal_programs plan
    JOIN goals.goal_program_positions pos ON pos.program_id=plan.id
    WHERE pos.id=v_position_id AND plan.goal_id=NEW.goal_id
      AND plan.status='aktiv';
    IF NOT FOUND THEN
      RAISE EXCEPTION 'G644_BLOCK:aktive_position_fehlt' USING ERRCODE='23514';
    END IF;
  ELSE
    SELECT * INTO v_plan FROM goals.goal_programs
    WHERE goal_id=NEW.goal_id AND status='aktiv';
    IF NOT FOUND THEN
      INSERT INTO goals.goal_programs(goal_id,user_id,name,status)
      VALUES (NEW.goal_id,NEW.user_id,v_goal.title,
        CASE WHEN v_goal.status='active' THEN 'aktiv' ELSE 'pausiert' END)
      RETURNING * INTO v_plan;
    END IF;
  END IF;
  v_richtung := CASE NEW.phase_type
    WHEN 'fat_loss' THEN 'abnehmen' WHEN 'mini_cut' THEN 'abnehmen'
    WHEN 'lean_bulk' THEN 'aufbauen' ELSE 'halten' END;
  IF NEW.strategie_code='custom' THEN
    v_source := NULL;
    v_own := '{"cardio_pro_woche":0,"refeed_pro_woche":0}'::jsonb
      || (NEW.parameters->'g626_eigene_werte');
  ELSE
    v_source := NEW.strategie_code;
    v_own := NULL;
  END IF;
  IF v_position_id IS NOT NULL THEN
    UPDATE goals.goal_program_positions SET goal_phase_id=NEW.id,
      gueltig_ab=NEW.gueltig_ab,projected_end_date=NEW.projected_end_date,
      zielrate_pct_kg_woche=CASE WHEN eigene_werte IS NULL
        THEN coalesce(zielrate_pct_kg_woche,NEW.zielrate_pct_kg_woche)
        ELSE NULL END
    WHERE id=v_position_id AND program_id=v_plan.id AND goal_phase_id IS NULL;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'G625_BLOCK:position_passt_nicht' USING ERRCODE='23514';
    END IF;
  ELSE
    INSERT INTO goals.goal_program_positions(
      program_id,position,strategie_code,eigene_werte,richtung,phase_type,
      duration_weeks,goal_phase_id,gueltig_ab,projected_end_date,
      zielrate_pct_kg_woche)
    VALUES (v_plan.id,
      (SELECT coalesce(max(position),0)+1 FROM goals.goal_program_positions
        WHERE program_id=v_plan.id),
      v_source,v_own,v_richtung,NEW.phase_type,
      CASE WHEN NEW.projected_end_date IS NOT NULL THEN
        greatest(1,ceil((NEW.projected_end_date-NEW.gueltig_ab)::numeric/7))::smallint
        ELSE NULL END,
      NEW.id,NEW.gueltig_ab,NEW.projected_end_date,
      CASE WHEN v_own IS NULL THEN NEW.zielrate_pct_kg_woche END);
  END IF;
  RETURN NULL;
END $$;

CREATE OR REPLACE FUNCTION goals.g625_sync_plan_after_goal_status()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE v_resume uuid;
BEGIN
  IF NEW.status IN ('achieved','missed','abandoned') THEN
    UPDATE goals.goal_programs SET status='abgeschlossen'
    WHERE goal_id=NEW.id AND status IN ('aktiv','pausiert');
  ELSIF NEW.status IN ('paused','on_hold') THEN
    UPDATE goals.goal_programs SET status='pausiert'
    WHERE goal_id=NEW.id AND status='aktiv';
  ELSIF NEW.status='active' AND OLD.status IN ('paused','on_hold') THEN
    IF current_setting('g644.activating_plan',true) IS DISTINCT FROM 'yes' THEN
      SELECT id INTO v_resume FROM goals.goal_programs
      WHERE goal_id=NEW.id AND status='pausiert'
      ORDER BY updated_at DESC,created_at DESC,id DESC LIMIT 1;
      IF v_resume IS NOT NULL THEN
        UPDATE goals.goal_programs SET status='aktiv' WHERE id=v_resume;
      END IF;
    END IF;
  END IF;
  RETURN NULL;
END $$;

CREATE FUNCTION goals.g644_catalog_rate(
  p_user_id uuid,p_code text,p_sub_phase text,p_day date)
RETURNS numeric LANGUAGE sql STABLE SECURITY INVOKER SET search_path='' AS $$
  SELECT coalesce(s.weight_change_target_percent,
    round(coalesce((part.value->>'tdee_multiplier')::numeric-1,
      s.tdee_modifier)*t.tdee/(11*nullif(profile.body_weight_kg,0)),3),
    CASE WHEN s.auswahl_gruppe='halten' THEN 0 END)
  FROM goals.goal_strategies s
  JOIN public.profiles profile ON profile.id=p_user_id
  LEFT JOIN LATERAL goals.tdee_basis_am(p_user_id,p_day) t ON true
  LEFT JOIN LATERAL jsonb_array_elements(s.sub_phases) part(value)
    ON part.value->>'name'=p_sub_phase
  WHERE s.code=p_code AND p_user_id=auth.uid();
$$;
REVOKE ALL ON FUNCTION goals.g644_catalog_rate(uuid,text,text,date)
  FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION goals.g644_catalog_rate(uuid,text,text,date)
  TO authenticated,service_role;

ALTER FUNCTION goals.goal_plan_position_start(uuid)
  RENAME TO g625_goal_plan_position_start_basis;
CREATE FUNCTION goals.goal_plan_position_start(p_position_id uuid)
RETURNS uuid LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE v_position goals.goal_program_positions%ROWTYPE;
  v_user uuid := auth.uid(); v_rate numeric;
BEGIN
  SELECT pos.* INTO v_position FROM goals.goal_program_positions pos
  JOIN goals.goal_programs plan ON plan.id=pos.program_id
  WHERE pos.id=p_position_id AND plan.user_id=v_user FOR UPDATE OF pos;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'G625_BLOCK:position_fremd' USING ERRCODE='42501';
  END IF;
  IF v_position.strategie_code IS NOT NULL
     AND v_position.zielrate_pct_kg_woche IS NULL THEN
    v_rate := goals.g644_catalog_rate(v_user,v_position.strategie_code,
      v_position.sub_phase_code,coalesce(v_position.gueltig_ab,CURRENT_DATE));
    IF v_rate IS NOT NULL THEN
      UPDATE goals.goal_program_positions
      SET zielrate_pct_kg_woche=v_rate WHERE id=p_position_id;
    END IF;
  END IF;
  RETURN goals.g625_goal_plan_position_start_basis(p_position_id);
END $$;
REVOKE ALL ON FUNCTION goals.goal_plan_position_start(uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION goals.goal_plan_position_start(uuid)
  TO authenticated,service_role;

CREATE FUNCTION goals.g644_plan_activation_check(p_plan_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE v_plan goals.goal_programs%ROWTYPE; v_goal goals.user_goals%ROWTYPE;
  v_profile public.profiles%ROWTYPE; v_pos goals.goal_program_positions%ROWTYPE;
  v_start numeric; v_end numeric; v_rate numeric; v_tdee numeric;
  v_own jsonb; v_kcal numeric;
  v_blocks text[]; v_unconfirmed text[];
BEGIN
  SELECT * INTO v_plan FROM goals.goal_programs
  WHERE id=p_plan_id AND user_id=auth.uid();
  IF NOT FOUND THEN
    RAISE EXCEPTION 'G644_BLOCK:plan_fremd' USING ERRCODE='42501';
  END IF;
  SELECT * INTO v_goal FROM goals.user_goals WHERE id=v_plan.goal_id;
  SELECT * INTO v_profile FROM public.profiles WHERE id=v_plan.user_id;
  v_start := coalesce(v_profile.body_weight_kg,v_goal.start_value);
  FOR v_pos IN SELECT * FROM goals.goal_program_positions
    WHERE program_id=p_plan_id AND (goal_phase_id IS NULL OR EXISTS (
      SELECT 1 FROM goals.goal_phases ph
      WHERE ph.id=goal_phase_id AND ph.actual_end_date IS NULL))
    ORDER BY position LOOP
    SELECT tdee INTO v_tdee FROM goals.tdee_basis_am(v_plan.user_id,
      coalesce(v_pos.gueltig_ab,CURRENT_DATE));
    v_own := v_pos.eigene_werte;
    v_rate := coalesce(v_pos.zielrate_pct_kg_woche,
      CASE WHEN v_pos.strategie_code IS NOT NULL THEN
        goals.g644_catalog_rate(v_plan.user_id,v_pos.strategie_code,
          v_pos.sub_phase_code,coalesce(v_pos.gueltig_ab,CURRENT_DATE)) END,
      CASE WHEN v_pos.eigene_werte ? 'tempo_pct_kg_woche' THEN
        (v_pos.eigene_werte->>'tempo_pct_kg_woche')::numeric
          * CASE WHEN v_pos.richtung='abnehmen' THEN -1 ELSE 1 END END,
      CASE WHEN v_pos.richtung='halten' THEN 0 ELSE NULL END);
    IF v_own ? 'kcal_pct_erhaltung' THEN
      v_kcal := round(v_tdee*(1+
        (v_own->>'kcal_pct_erhaltung')::numeric/100),1);
      v_rate := (v_kcal-v_tdee)/(11*nullif(v_start,0));
      v_own := v_own || jsonb_build_object(
        'tempo_pct_kg_woche',abs(v_rate),'kcal',v_kcal);
    ELSIF v_own IS NOT NULL AND v_rate IS NOT NULL THEN
      v_kcal := round(v_tdee
        +goals.kcal_delta_aus_zielrate(v_rate,v_start),1);
      v_own := v_own || jsonb_build_object('kcal',v_kcal);
    END IF;
    v_end := CASE WHEN v_start IS NOT NULL AND v_rate IS NOT NULL THEN
      v_start*(1+v_rate*coalesce(
        (v_pos.projected_end_date-v_pos.gueltig_ab)::numeric/7,
        v_pos.duration_weeks)/100) END;
    SELECT array_agg(f.schluessel ORDER BY f.schluessel)
        FILTER (WHERE f.art='sperre'),
      array_agg(f.schluessel ORDER BY f.schluessel)
        FILTER (WHERE f.art='warnung' AND NOT v_pos.confirmed_warnings ? f.schluessel)
    INTO v_blocks,v_unconfirmed
    FROM goals.ziel_grenzen_pruefen(
      v_profile.experience_level,v_pos.richtung,v_start,
      CASE WHEN v_pos.richtung='halten' THEN NULL ELSE v_end END,
      coalesce(v_pos.gueltig_ab,CURRENT_DATE),
      v_pos.projected_end_date,v_pos.strategie_code,v_own,
      v_profile.biological_sex,v_profile.height_cm,v_tdee,v_rate) f;
    IF v_blocks IS NOT NULL THEN
      RAISE EXCEPTION 'G626_BLOCK:%',array_to_string(v_blocks,',')
        USING ERRCODE='23514';
    END IF;
    IF v_unconfirmed IS NOT NULL THEN
      RAISE EXCEPTION 'G626_CONFIRM:%',array_to_string(v_unconfirmed,',')
        USING ERRCODE='23514';
    END IF;
    v_start := coalesce(v_end,v_start);
  END LOOP;
END $$;

CREATE FUNCTION goals.g644_plan_status_limit_guard()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
BEGIN
  IF NEW.status='aktiv' AND OLD.status IS DISTINCT FROM NEW.status
    AND NOT (OLD.status='pausiert' AND EXISTS (
      SELECT 1 FROM goals.goal_program_positions pos
      WHERE pos.program_id=NEW.id AND pos.goal_phase_id IS NOT NULL)) THEN
    PERFORM goals.g644_plan_activation_check(NEW.id);
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER g644_plan_status_limit_guard
  BEFORE UPDATE OF status ON goals.goal_programs FOR EACH ROW
  EXECUTE FUNCTION goals.g644_plan_status_limit_guard();
REVOKE ALL ON FUNCTION goals.g644_plan_status_limit_guard()
  FROM PUBLIC,anon,authenticated;

CREATE OR REPLACE FUNCTION goals.goal_plan_activate(p_plan_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE v_plan goals.goal_programs%ROWTYPE;
  v_first goals.goal_program_positions%ROWTYPE; v_user uuid := auth.uid();
BEGIN
  SELECT * INTO v_plan FROM goals.goal_programs
  WHERE id=p_plan_id AND user_id=v_user FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'G625_BLOCK:plan_fremd' USING ERRCODE='42501';
  END IF;
  IF v_plan.status='abgeschlossen' THEN
    RAISE EXCEPTION 'G625_BLOCK:plan_abgeschlossen' USING ERRCODE='23514';
  END IF;
  IF v_plan.status='aktiv' THEN RETURN; END IF;
  SELECT * INTO v_first FROM goals.goal_program_positions
  WHERE program_id=p_plan_id ORDER BY position LIMIT 1;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'G625_BLOCK:plan_ohne_position' USING ERRCODE='23514';
  END IF;
  PERFORM goals.g644_plan_activation_check(p_plan_id);
  UPDATE goals.goal_programs SET status='pausiert'
  WHERE user_id=v_user AND status='aktiv' AND id<>p_plan_id;
  UPDATE goals.user_goals SET status='on_hold'
  WHERE user_id=v_user AND status='active' AND goal_role='controlling'
    AND id<>v_plan.goal_id;
  PERFORM set_config('g644.activating_plan','yes',true);
  UPDATE goals.user_goals SET status='active' WHERE id=v_plan.goal_id;
  PERFORM set_config('g644.activating_plan','',true);
  UPDATE goals.goal_programs SET status='aktiv' WHERE id=p_plan_id;
  IF v_first.goal_phase_id IS NULL THEN
    UPDATE goals.goal_phases SET actual_end_date=
      greatest(gueltig_ab,least(CURRENT_DATE,
        coalesce(v_first.gueltig_ab,CURRENT_DATE))-1)
    WHERE goal_id=v_plan.goal_id AND actual_end_date IS NULL;
    PERFORM goals.goal_plan_position_start(v_first.id);
  END IF;
END $$;

CREATE OR REPLACE FUNCTION goals.goal_plan_complete(p_plan_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE v_plan goals.goal_programs%ROWTYPE;
BEGIN
  SELECT * INTO v_plan FROM goals.goal_programs
  WHERE id=p_plan_id AND user_id=auth.uid() FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'G625_BLOCK:plan_fremd' USING ERRCODE='42501';
  END IF;
  UPDATE goals.goal_programs SET status='abgeschlossen' WHERE id=p_plan_id;
  IF v_plan.status='aktiv' THEN
    UPDATE goals.user_goals SET status='abandoned' WHERE id=v_plan.goal_id;
  END IF;
END $$;
REVOKE ALL ON FUNCTION goals.g644_plan_activation_check(uuid)
  FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION goals.g644_plan_activation_check(uuid)
  TO authenticated,service_role;

-- Der alte Zwei-Argument-Aufruf bleibt fuer bestehende App-Leser verfuegbar.
-- Der neue Aufruf mit Ausgangspunkt und Anker erzeugt den Vorlagenentwurf.
COMMENT ON FUNCTION goals.goal_plan_create(uuid,text,text,date) IS
  'G-644: legt aus einer freigegebenen Katalogvorlage einen Planentwurf an.';
COMMIT;
