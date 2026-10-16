-- G-644 Teil 2: Herkunft, Neuberechnung und Lebenszyklus fertiger Pläne.
BEGIN;

ALTER TABLE goals.goal_programs
  ADD COLUMN ausgangspunkt_code text NOT NULL DEFAULT 'einfach',
  ADD COLUMN ausgangspunkt_name text NOT NULL DEFAULT 'Einfacher Plan · aus Goals',
  ADD COLUMN ausgangspunkt_quelle text NOT NULL DEFAULT 'goals'
    CHECK (ausgangspunkt_quelle IN ('goals','lumeos','eigen','coach'));

-- Nur eindeutige Katalog-Signaturen werden dem Bestand zugeordnet.
-- Eine zusätzliche eigene Position darf die Vorlagenherkunft nicht löschen.
WITH plan_signatur AS (
  SELECT p.id,string_agg(pos.strategie_code||':'||
    coalesce(pos.sub_phase_code,'')||':'||pos.duration_weeks::text,
    '|' ORDER BY pos.position) FILTER (WHERE pos.strategie_code IS NOT NULL)
    AS katalog,
    count(*) FILTER (WHERE pos.eigene_werte IS NOT NULL) AS eigene
  FROM goals.goal_programs p
  JOIN goals.goal_program_positions pos ON pos.program_id=p.id
  GROUP BY p.id
), vorlagen AS (
  SELECT t.code,t.name,t.quelle,
    string_agg((part.value->>'strategie_code')||':'||
      coalesce(part.value->>'unterphase','')||':'||
      (part.value->>'dauer_wochen'),'|' ORDER BY part.ordinality) AS katalog
  FROM goals.goal_plan_templates t
  CROSS JOIN LATERAL jsonb_array_elements(t.positionen)
    WITH ORDINALITY part(value,ordinality)
  WHERE t.quelle='lumeos'
  GROUP BY t.code,t.name,t.quelle
)
UPDATE goals.goal_programs p SET
  ausgangspunkt_code=v.code,
  ausgangspunkt_name=v.name,
  ausgangspunkt_quelle=v.quelle
FROM plan_signatur s JOIN vorlagen v ON v.katalog=s.katalog
WHERE p.id=s.id AND s.eigene<=1;

CREATE OR REPLACE FUNCTION goals.goal_plan_create(
  p_goal_id uuid,p_name text,p_ausgangspunkt text,p_anker_datum date
) RETURNS uuid LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE v_user uuid := auth.uid(); v_template goals.goal_plan_templates%ROWTYPE;
  v_id uuid; v_start date; v_part jsonb; v_code text; v_direction text;
  v_weeks smallint; v_pos smallint := 0; v_rate numeric;
  v_own jsonb; v_phase_type text;
BEGIN
  IF v_user IS NULL OR NOT EXISTS (
    SELECT 1 FROM goals.user_goals WHERE id=p_goal_id AND user_id=v_user
      AND goal_role='controlling') THEN
    RAISE EXCEPTION 'G644_BLOCK:steuerziel_fremd' USING ERRCODE='42501';
  END IF;
  SELECT * INTO v_template FROM goals.goal_plan_templates
  WHERE code=p_ausgangspunkt AND (quelle='lumeos' OR user_id=v_user);
  IF NOT FOUND THEN
    RAISE EXCEPTION 'G644_BLOCK:vorlage_fehlt' USING ERRCODE='42501';
  END IF;
  IF p_anker_datum IS NULL THEN
    RAISE EXCEPTION 'G644_BLOCK:anker_datum_fehlt' USING ERRCODE='23514';
  END IF;
  IF v_template.anker_art='A' THEN
    SELECT p_anker_datum-sum((x->>'dauer_wochen')::integer)::integer*7
      INTO v_start FROM jsonb_array_elements(v_template.positionen) x;
  ELSE
    v_start := p_anker_datum;
  END IF;
  INSERT INTO goals.goal_programs(goal_id,user_id,name,status,
    ausgangspunkt_code,ausgangspunkt_name,ausgangspunkt_quelle)
  VALUES (p_goal_id,v_user,p_name,'entwurf',
    v_template.code,v_template.name,v_template.quelle) RETURNING id INTO v_id;
  IF v_template.anker_art='A' THEN
    INSERT INTO goals.goal_program_events(program_id,name,kind,event_date)
    VALUES (v_id,'Hauptwettkampf','A',p_anker_datum);
  END IF;
  FOR v_part IN SELECT value FROM jsonb_array_elements(v_template.positionen) LOOP
    v_pos := v_pos+1;
    v_code := v_part->>'strategie_code';
    v_own := v_part->'eigene_werte';
    v_weeks := (v_part->>'dauer_wochen')::smallint;
    IF v_code IS NOT NULL THEN
      SELECT CASE WHEN auswahl_gruppe='abnehmen'
          OR code IN ('contest_prep','peak_week')
          THEN 'abnehmen' WHEN auswahl_gruppe='aufbauen' THEN 'aufbauen'
          WHEN code='reverse_diet' THEN 'aufbauen'
          ELSE 'halten' END,
        CASE WHEN auswahl_gruppe='halten' THEN 0
          ELSE weight_change_target_percent END
      INTO v_direction,v_rate FROM goals.goal_strategies WHERE code=v_code;
      v_phase_type := CASE v_code WHEN 'maintain' THEN 'maintenance'
        ELSE v_code END;
    ELSE
      v_direction := v_part->>'richtung';
      v_phase_type := v_part->>'phase_type';
      v_rate := NULL;
    END IF;
    INSERT INTO goals.goal_program_positions(
      program_id,position,strategie_code,eigene_werte,
      sub_phase_code,duration_weeks,
      richtung,phase_type,zielrate_pct_kg_woche,gueltig_ab,projected_end_date)
    VALUES (v_id,v_pos,v_code,v_own,v_part->>'unterphase',v_weeks,
      v_direction,v_phase_type,v_rate,v_start,v_start+v_weeks*7-1);
    v_start := v_start+v_weeks*7;
  END LOOP;
  RETURN v_id;
END $$;
REVOKE ALL ON FUNCTION goals.goal_plan_create(uuid,text,text,date)
  FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION goals.goal_plan_create(uuid,text,text,date)
  TO authenticated,service_role;

CREATE FUNCTION goals.goal_plan_type_at(p_plan_id uuid)
RETURNS jsonb LANGUAGE sql STABLE SECURITY INVOKER SET search_path='' AS $$
  SELECT jsonb_build_object('code',p.ausgangspunkt_code,
    'name',p.ausgangspunkt_name,'quelle',p.ausgangspunkt_quelle,
    'herkunft','goals.goal_programs.ausgangspunkt_code')
  FROM goals.goal_programs p WHERE p.id=p_plan_id AND p.user_id=auth.uid();
$$;
REVOKE ALL ON FUNCTION goals.goal_plan_type_at(uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION goals.goal_plan_type_at(uuid)
  TO authenticated,service_role;

CREATE FUNCTION goals.goal_plan_position_recalculate(
  p_position_id uuid,p_strategie_code text,p_eigene_werte jsonb,
  p_duration_weeks smallint
) RETURNS uuid LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE v_target goals.goal_program_positions%ROWTYPE;
  v_plan goals.goal_programs%ROWTYPE;
  v_pos goals.goal_program_positions%ROWTYPE;
  v_strategy goals.goal_strategies%ROWTYPE;
  v_start date; v_anchor date; v_fixed_end date;
  v_weeks integer; v_rate numeric; v_direction text; v_phase_type text;
  v_code text; v_own jsonb; v_sub text; v_confirm jsonb;
BEGIN
  SELECT pos.* INTO v_target FROM goals.goal_program_positions pos
  JOIN goals.goal_programs plan ON plan.id=pos.program_id
  WHERE pos.id=p_position_id AND plan.user_id=auth.uid()
  FOR UPDATE OF pos;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'G644_BLOCK:position_fremd' USING ERRCODE='42501';
  END IF;
  SELECT * INTO v_plan FROM goals.goal_programs WHERE id=v_target.program_id
    FOR UPDATE;
  IF v_plan.status='abgeschlossen' OR v_target.goal_phase_id IS NOT NULL THEN
    RAISE EXCEPTION 'G644_BLOCK:nur_geplante_position'
      USING ERRCODE='23514';
  END IF;
  IF (p_strategie_code IS NULL)=(p_eigene_werte IS NULL)
    OR p_duration_weeks IS NULL OR p_duration_weeks NOT BETWEEN 1 AND 520 THEN
    RAISE EXCEPTION 'G644_BLOCK:programm_oder_dauer'
      USING ERRCODE='23514';
  END IF;
  IF EXISTS (SELECT 1 FROM goals.goal_program_positions pos
    WHERE pos.program_id=v_plan.id AND pos.goal_phase_id IS NOT NULL
      AND pos.position>v_target.position) THEN
    RAISE EXCEPTION 'G644_BLOCK:historische_position_nach_planung'
      USING ERRCODE='23514';
  END IF;
  SELECT max(coalesce(ph.actual_end_date,pos.projected_end_date))
    INTO v_fixed_end
  FROM goals.goal_program_positions pos
  LEFT JOIN goals.goal_phases ph ON ph.id=pos.goal_phase_id
  WHERE pos.program_id=v_plan.id AND pos.goal_phase_id IS NOT NULL;
  SELECT event_date INTO v_anchor FROM goals.goal_program_events
    WHERE program_id=v_plan.id AND kind='A'
    ORDER BY event_date LIMIT 1;
  SELECT sum(CASE WHEN id=p_position_id THEN p_duration_weeks
      ELSE duration_weeks END) INTO v_weeks
  FROM goals.goal_program_positions WHERE program_id=v_plan.id
    AND goal_phase_id IS NULL;
  IF v_weeks IS NULL OR EXISTS (
    SELECT 1 FROM goals.goal_program_positions
    WHERE program_id=v_plan.id AND goal_phase_id IS NULL
      AND duration_weeks IS NULL AND id<>p_position_id) THEN
    RAISE EXCEPTION 'G644_BLOCK:dauer_fehlt' USING ERRCODE='23514';
  END IF;
  IF v_fixed_end IS NOT NULL THEN
    v_start := v_fixed_end+1;
    IF v_anchor IS NOT NULL AND v_start+v_weeks*7<>v_anchor THEN
      RAISE EXCEPTION 'G644_BLOCK:anker_mit_laufender_phase'
        USING ERRCODE='23514';
    END IF;
  ELSIF v_anchor IS NOT NULL THEN
    v_start := v_anchor-v_weeks*7;
  ELSE
    SELECT min(gueltig_ab) INTO v_start
    FROM goals.goal_program_positions WHERE program_id=v_plan.id;
    v_start := coalesce(v_start,CURRENT_DATE);
  END IF;
  FOR v_pos IN SELECT * FROM goals.goal_program_positions
      WHERE program_id=v_plan.id AND goal_phase_id IS NULL
      ORDER BY position FOR UPDATE LOOP
    v_code := CASE WHEN v_pos.id=p_position_id THEN p_strategie_code
      ELSE v_pos.strategie_code END;
    v_own := CASE WHEN v_pos.id=p_position_id THEN p_eigene_werte
      ELSE v_pos.eigene_werte END;
    v_sub := CASE WHEN v_pos.id=p_position_id THEN NULL
      ELSE v_pos.sub_phase_code END;
    v_confirm := CASE WHEN v_pos.id=p_position_id THEN '[]'::jsonb
      ELSE v_pos.confirmed_warnings END;
    IF v_code IS NOT NULL THEN
      SELECT * INTO v_strategy FROM goals.goal_strategies WHERE code=v_code;
      IF NOT FOUND THEN
        RAISE EXCEPTION 'G644_BLOCK:programm_fehlt' USING ERRCODE='23514';
      END IF;
      v_direction := CASE WHEN v_strategy.auswahl_gruppe='abnehmen'
        OR v_code IN ('contest_prep','peak_week') THEN 'abnehmen'
        WHEN v_strategy.auswahl_gruppe IN ('aufbauen','uebergang')
          THEN 'aufbauen' ELSE 'halten' END;
      v_phase_type := CASE WHEN v_code='maintain' THEN 'maintenance'
        ELSE v_code END;
      v_rate := goals.g644_catalog_rate(
        v_plan.user_id,v_code,v_sub,v_start);
    ELSE
      v_direction := v_pos.richtung;
      v_phase_type := v_pos.phase_type;
      v_rate := NULL;
    END IF;
    PERFORM goals.goal_plan_position_save(
      v_plan.id,v_pos.id,v_pos.position,v_code,v_own,
      v_direction,v_phase_type,
      CASE WHEN v_pos.id=p_position_id THEN p_duration_weeks
        ELSE v_pos.duration_weeks END,
      v_start,v_start+
        (CASE WHEN v_pos.id=p_position_id THEN p_duration_weeks
          ELSE v_pos.duration_weeks END)*7-1,
      v_confirm,v_sub,v_rate);
    v_start := v_start+
      (CASE WHEN v_pos.id=p_position_id THEN p_duration_weeks
        ELSE v_pos.duration_weeks END)*7;
  END LOOP;
  RETURN p_position_id;
END $$;
REVOKE ALL ON FUNCTION goals.goal_plan_position_recalculate(
  uuid,text,jsonb,smallint) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION goals.goal_plan_position_recalculate(
  uuid,text,jsonb,smallint) TO authenticated,service_role;

CREATE FUNCTION goals.goal_plan_restart(
  p_plan_id uuid,p_name text,p_start_date date
) RETURNS uuid LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE v_old goals.goal_programs%ROWTYPE; v_new uuid;
  v_pos goals.goal_program_positions%ROWTYPE;
  v_event goals.goal_program_events%ROWTYPE;
  v_first date; v_day date;
BEGIN
  SELECT * INTO v_old FROM goals.goal_programs
  WHERE id=p_plan_id AND user_id=auth.uid() AND status='abgeschlossen';
  IF NOT FOUND THEN
    RAISE EXCEPTION 'G644_BLOCK:nur_abgeschlossenen_plan_neustarten'
      USING ERRCODE='23514';
  END IF;
  IF p_start_date IS NULL OR btrim(coalesce(p_name,''))='' THEN
    RAISE EXCEPTION 'G644_BLOCK:name_oder_start_fehlt' USING ERRCODE='23514';
  END IF;
  SELECT min(gueltig_ab) INTO v_first FROM goals.goal_program_positions
    WHERE program_id=p_plan_id;
  IF v_first IS NULL OR EXISTS (SELECT 1 FROM goals.goal_program_positions
    WHERE program_id=p_plan_id AND duration_weeks IS NULL) THEN
    RAISE EXCEPTION 'G644_BLOCK:neustart_braucht_dauer'
      USING ERRCODE='23514';
  END IF;
  v_new := goals.goal_plan_create(v_old.goal_id,p_name);
  UPDATE goals.goal_programs SET
    ausgangspunkt_code=v_old.ausgangspunkt_code,
    ausgangspunkt_name=v_old.ausgangspunkt_name,
    ausgangspunkt_quelle=v_old.ausgangspunkt_quelle
  WHERE id=v_new;
  v_day := p_start_date;
  FOR v_pos IN SELECT * FROM goals.goal_program_positions
    WHERE program_id=p_plan_id ORDER BY position LOOP
    PERFORM goals.goal_plan_position_save(
      v_new,NULL,v_pos.position,v_pos.strategie_code,v_pos.eigene_werte,
      v_pos.richtung,v_pos.phase_type,v_pos.duration_weeks,
      v_day,v_day+v_pos.duration_weeks*7-1,
      '[]'::jsonb,v_pos.sub_phase_code,v_pos.zielrate_pct_kg_woche);
    v_day := v_day+v_pos.duration_weeks*7;
  END LOOP;
  FOR v_event IN SELECT * FROM goals.goal_program_events
    WHERE program_id=p_plan_id LOOP
    PERFORM goals.goal_plan_event_save(v_new,NULL,
      v_event.name,v_event.kind,p_start_date+(v_event.event_date-v_first));
  END LOOP;
  RETURN v_new;
END $$;
REVOKE ALL ON FUNCTION goals.goal_plan_restart(uuid,text,date)
  FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION goals.goal_plan_restart(uuid,text,date)
  TO authenticated,service_role;

CREATE FUNCTION goals.goal_plan_delete_completed(
  p_plan_id uuid,p_confirm boolean DEFAULT false
) RETURNS void LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
BEGIN
  IF p_confirm IS DISTINCT FROM true THEN
    RAISE EXCEPTION 'G644_CONFIRM:abgeschlossenen_plan_loeschen'
      USING ERRCODE='23514';
  END IF;
  DELETE FROM goals.goal_programs
  WHERE id=p_plan_id AND user_id=auth.uid() AND status='abgeschlossen';
  IF NOT FOUND THEN
    RAISE EXCEPTION 'G644_BLOCK:nur_eigenen_abgeschlossenen_plan_loeschen'
      USING ERRCODE='42501';
  END IF;
END $$;
REVOKE ALL ON FUNCTION goals.goal_plan_delete_completed(uuid,boolean)
  FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION goals.goal_plan_delete_completed(uuid,boolean)
  TO authenticated,service_role;
COMMIT;
