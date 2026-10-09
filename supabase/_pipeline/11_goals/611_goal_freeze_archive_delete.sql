-- G-611: Frist und Zielerreichung wirken auch ohne Schreibereignis.
-- Der gespeicherte Status bleibt für Verlauf/Plan erhalten; Leser nutzen
-- goal_state_at. Archivieren und Neustart materialisieren den Abschluss.
BEGIN;

ALTER TABLE goals.user_goals ADD COLUMN archived_at timestamptz;
CREATE INDEX user_goals_visible_by_user ON goals.user_goals(user_id,gueltig_ab DESC)
  WHERE archived_at IS NULL;

CREATE FUNCTION goals.goal_state_at(p_goal_id uuid,p_stichtag date DEFAULT CURRENT_DATE)
RETURNS TABLE (goal_id uuid,state text,reason text,frozen_on date,archived boolean)
LANGUAGE sql STABLE SECURITY INVOKER SET search_path='' AS $$
  SELECT g.id,
    CASE WHEN g.status IN ('achieved','missed','abandoned')
      OR hit.measured_on IS NOT NULL OR g.target_date<p_stichtag
      THEN 'eingefroren' ELSE g.status END,
    CASE WHEN g.status='achieved' THEN 'erreicht'
      WHEN g.status='missed' THEN 'frist_abgelaufen'
      WHEN g.status='abandoned' THEN 'beendet'
      WHEN hit.measured_on IS NOT NULL THEN 'erreicht'
      WHEN g.target_date<p_stichtag THEN 'frist_abgelaufen' END,
    CASE WHEN g.status='missed'
      THEN coalesce(g.achievement_date,g.target_date,g.updated_at::date)
      WHEN g.status IN ('achieved','abandoned')
      THEN coalesce(g.achievement_date,g.updated_at::date,g.target_date)
      ELSE coalesce(hit.measured_on,g.target_date) END,
    g.archived_at IS NOT NULL
  FROM goals.user_goals g
  LEFT JOIN LATERAL (
    SELECT min(mp.measured_on) AS measured_on
    FROM goals.measurement_points(g.id,least(p_stichtag,
      coalesce(g.target_date,p_stichtag))) mp
    WHERE g.measurement_rhythm IS DISTINCT FROM 'weekly'
      AND g.target_value IS NOT NULL
      AND mp.measured_on>=g.gueltig_ab
      AND CASE
        WHEN g.better_direction='less' THEN mp.value<=g.target_value
        WHEN g.better_direction='more' THEN mp.value>=g.target_value
        WHEN g.start_value IS NOT NULL AND g.target_value<g.start_value
          THEN mp.value<=g.target_value
        ELSE mp.value>=g.target_value END
  ) hit ON true
  WHERE g.id=p_goal_id AND g.gueltig_ab<=p_stichtag;
$$;
REVOKE ALL ON FUNCTION goals.goal_state_at(uuid,date) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION goals.goal_state_at(uuid,date) TO authenticated,service_role;

CREATE FUNCTION goals.goal_list_at(p_user_id uuid,p_stichtag date DEFAULT CURRENT_DATE)
RETURNS TABLE (goal_id uuid,title text,stored_status text,effective_status text,
  freeze_reason text,frozen_on date,goal_role text)
LANGUAGE sql STABLE SECURITY INVOKER SET search_path='' AS $$
  SELECT g.id,g.title,g.status,s.state,s.reason,s.frozen_on,g.goal_role
  FROM goals.user_goals g
  LEFT JOIN LATERAL goals.goal_state_at(g.id,p_stichtag) s ON true
  WHERE g.user_id=p_user_id AND g.archived_at IS NULL
  ORDER BY g.gueltig_ab DESC,g.id;
$$;
REVOKE ALL ON FUNCTION goals.goal_list_at(uuid,date) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION goals.goal_list_at(uuid,date) TO authenticated,service_role;

CREATE OR REPLACE FUNCTION goals.phase_am(p_user_id uuid,p_stichtag date DEFAULT CURRENT_DATE)
RETURNS TABLE (phase_id uuid,user_id uuid,goal_id uuid,phase_type text,
  variant text,parameters jsonb,gueltig_ab date,projected_end_date date,
  actual_end_date date,transitioned_from text,recommended_next text,
  transition_reason text,created_at timestamptz,updated_at timestamptz)
LANGUAGE sql STABLE SECURITY INVOKER SET search_path='' AS $$
  SELECT gp.id,gp.user_id,gp.goal_id,gp.phase_type,gp.variant,gp.parameters,
    gp.gueltig_ab,gp.projected_end_date,gp.actual_end_date,
    gp.transitioned_from,gp.recommended_next,gp.transition_reason,
    gp.created_at,gp.updated_at
  FROM goals.goal_phases gp
  JOIN goals.user_goals g ON g.id=gp.goal_id AND g.user_id=gp.user_id
    AND g.status='active' AND g.archived_at IS NULL
  JOIN LATERAL goals.goal_state_at(g.id,p_stichtag) s ON s.state='active'
  WHERE gp.user_id=p_user_id AND gp.gueltig_ab<=p_stichtag
    AND (gp.actual_end_date IS NULL OR gp.actual_end_date>=p_stichtag)
  ORDER BY gp.gueltig_ab DESC,gp.created_at DESC,gp.id DESC;
$$;
CREATE OR REPLACE FUNCTION goals.phase_eines_ziels_am(
  p_goal_id uuid,p_stichtag date DEFAULT CURRENT_DATE)
RETURNS TABLE (phase_id uuid,user_id uuid,goal_id uuid,phase_type text,
  variant text,parameters jsonb,gueltig_ab date,projected_end_date date,
  actual_end_date date,transitioned_from text,recommended_next text,
  transition_reason text,created_at timestamptz,updated_at timestamptz)
LANGUAGE sql STABLE SECURITY INVOKER SET search_path='' AS $$
  SELECT p.* FROM goals.phase_am(
    (SELECT user_id FROM goals.user_goals WHERE id=p_goal_id),p_stichtag) p
  WHERE p.goal_id=p_goal_id LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION goals.ziel_ohne_laufende_phase_am(
  p_user_id uuid,p_stichtag date DEFAULT CURRENT_DATE)
RETURNS TABLE (goal_id uuid,letzte_phase_id uuid,letzte_phase_ende date,
  recommended_next text)
LANGUAGE sql STABLE SECURITY INVOKER SET search_path='' AS $$
  SELECT g.id,letzte.id,letzte.actual_end_date,letzte.recommended_next
  FROM goals.user_goals g
  JOIN LATERAL goals.goal_state_at(g.id,p_stichtag) s ON s.state='active'
  LEFT JOIN LATERAL (
    SELECT p.id,p.actual_end_date,p.recommended_next
    FROM goals.goal_phases p WHERE p.goal_id=g.id AND p.user_id=g.user_id
      AND p.actual_end_date<p_stichtag
    ORDER BY p.gueltig_ab DESC,p.created_at DESC,p.id DESC LIMIT 1
  ) letzte ON true
  WHERE g.user_id=p_user_id AND g.goal_role='controlling'
    AND g.status='active' AND g.archived_at IS NULL
    AND NOT EXISTS (SELECT 1 FROM goals.phase_am(p_user_id,p_stichtag))
  LIMIT 1;
$$;

ALTER FUNCTION goals.berechne_zielwerte(uuid,date)
  RENAME TO berechne_zielwerte_g611_basis;
CREATE FUNCTION goals.berechne_zielwerte(p_user_id uuid,p_stichtag date DEFAULT CURRENT_DATE)
RETURNS TABLE (bmr numeric,tdee numeric,kcal numeric,protein_g numeric,
  carbs_g numeric,fat_g numeric,fiber_g numeric,linoleic_acid_g numeric,
  alpha_linolenic_acid_g numeric,nutrition_goal text,kalorienfaktor numeric,
  hindernis text,fehlende_felder text[],tdee_herkunft text,
  tdee_history_id uuid,zielrate_pct_kg_woche numeric,body_weight_kg numeric,
  goal_id uuid,letzte_phase_id uuid,letzte_phase_ende date,recommended_next text)
LANGUAGE sql STABLE SECURITY INVOKER SET search_path='' AS $$
  SELECT b.bmr,b.tdee,b.kcal,b.protein_g,b.carbs_g,b.fat_g,b.fiber_g,
    b.linoleic_acid_g,b.alpha_linolenic_acid_g,b.nutrition_goal,
    b.kalorienfaktor,
    CASE WHEN frozen.id IS NOT NULL AND b.hindernis='kein_aktives_ziel'
      THEN 'ziel_eingefroren' ELSE b.hindernis END,
    b.fehlende_felder,b.tdee_herkunft,b.tdee_history_id,
    b.zielrate_pct_kg_woche,b.body_weight_kg,
    coalesce(frozen.id,b.goal_id),b.letzte_phase_id,b.letzte_phase_ende,
    b.recommended_next
  FROM goals.berechne_zielwerte_g611_basis(p_user_id,p_stichtag) b
  LEFT JOIN LATERAL (
    SELECT g.id FROM goals.user_goals g
    JOIN LATERAL goals.goal_state_at(g.id,p_stichtag) s
      ON s.state='eingefroren'
    WHERE g.user_id=p_user_id AND g.goal_role='controlling'
    ORDER BY s.frozen_on DESC NULLS LAST,g.id DESC LIMIT 1
  ) frozen ON true;
$$;
REVOKE ALL ON FUNCTION goals.berechne_zielwerte(uuid,date) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION goals.berechne_zielwerte(uuid,date)
  TO authenticated,service_role;

ALTER FUNCTION goals.zielwerte_am(uuid,date) RENAME TO zielwerte_am_g611_basis;
CREATE FUNCTION goals.zielwerte_am(p_user_id uuid,p_stichtag date DEFAULT CURRENT_DATE)
RETURNS TABLE (gueltig_ab date,kcal numeric,protein_g numeric,carbs_g numeric,
  fat_g numeric,fiber_g numeric,linoleic_acid_g numeric,
  alpha_linolenic_acid_g numeric,herkunft text,tdee numeric,nutrition_goal text)
LANGUAGE sql STABLE SECURITY INVOKER SET search_path='' AS $$
  SELECT p_stichtag,z.kcal,z.protein_g,z.carbs_g,z.fat_g,z.fiber_g,
    z.linoleic_acid_g,z.alpha_linolenic_acid_g,z.hindernis,z.tdee,z.nutrition_goal
  FROM goals.berechne_zielwerte(p_user_id,p_stichtag) z
  WHERE z.hindernis='ziel_eingefroren'
  UNION ALL
  SELECT b.* FROM goals.zielwerte_am_g611_basis(p_user_id,p_stichtag) b
  WHERE NOT EXISTS (SELECT 1 FROM goals.berechne_zielwerte(
    p_user_id,p_stichtag) z WHERE z.hindernis='ziel_eingefroren');
$$;
REVOKE ALL ON FUNCTION goals.zielwerte_am(uuid,date) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION goals.zielwerte_am(uuid,date)
  TO authenticated,service_role;

ALTER FUNCTION nutrition.daily_reference_assessment(uuid,date)
  RENAME TO daily_reference_assessment_g611_basis;
CREATE FUNCTION nutrition.daily_reference_assessment(
  p_user_id uuid,p_entry_date date)
RETURNS TABLE (user_id uuid,entry_date date,nutrient_code text,
  nutrient_name_de text,nutrient_unit text,nutrient_display_tier integer,
  actual_value numeric,missing_count integer,value_complete boolean,
  reference_kind text,reference_direction text,reference_value_min numeric,
  reference_value_max numeric,reference_unit text,reference_basis text,
  reference_applies_to_intake_sources text[],reference_pct numeric,
  reference_pct_min numeric,reference_pct_max numeric,reference_status text,
  profile_age_years integer,profile_biological_sex text,
  profile_is_pregnant boolean,profile_is_lactating boolean,source text,
  source_locator text,notes text)
LANGUAGE sql STABLE SECURITY INVOKER SET search_path='' AS $$
  SELECT a.user_id,a.entry_date,a.nutrient_code,a.nutrient_name_de,
    a.nutrient_unit,a.nutrient_display_tier,a.actual_value,a.missing_count,
    a.value_complete,a.reference_kind,a.reference_direction,
    a.reference_value_min,a.reference_value_max,a.reference_unit,
    CASE WHEN a.nutrient_code IN ('F18:2CN6','F18:3CN3')
      AND a.reference_kind='AI'
      AND a.reference_basis IN ('goals_target_from_energy_percent',
        'maintenance_no_active_goal')
      AND EXISTS (SELECT 1 FROM goals.zielwerte_am(p_user_id,p_entry_date)
        WHERE herkunft='ziel_eingefroren')
      THEN 'maintenance_frozen_goal' ELSE a.reference_basis END,
    a.reference_applies_to_intake_sources,a.reference_pct,
    a.reference_pct_min,a.reference_pct_max,a.reference_status,
    a.profile_age_years,a.profile_biological_sex,a.profile_is_pregnant,
    a.profile_is_lactating,a.source,a.source_locator,a.notes
  FROM nutrition.daily_reference_assessment_g611_basis(p_user_id,p_entry_date) a;
$$;
REVOKE ALL ON FUNCTION nutrition.daily_reference_assessment(uuid,date)
  FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION nutrition.daily_reference_assessment(uuid,date)
  TO authenticated,service_role;

ALTER FUNCTION goals.goal_progress_at(uuid,date) RENAME TO goal_progress_at_g611_basis;
CREATE FUNCTION goals.goal_progress_at(p_goal_id uuid,p_stichtag date DEFAULT CURRENT_DATE)
RETURNS TABLE (goal_id uuid,user_id uuid,goal_type text,subtype text,title text,
  target_value numeric,target_unit text,start_value numeric,current_value numeric,
  current_source text,progress_pct numeric,progress_status text,measured_at date)
LANGUAGE sql STABLE SECURITY INVOKER SET search_path='' AS $$
  SELECT p.goal_id,p.user_id,p.goal_type,p.subtype,p.title,p.target_value,
    p.target_unit,p.start_value,p.current_value,p.current_source,p.progress_pct,
    CASE WHEN s.state='eingefroren' THEN 'frozen' ELSE p.progress_status END,
    p.measured_at
  FROM goals.goal_state_at(p_goal_id,p_stichtag) s
  CROSS JOIN LATERAL goals.goal_progress_at_g611_basis(
    p_goal_id,CASE WHEN s.state='eingefroren'
      THEN least(p_stichtag,s.frozen_on) ELSE p_stichtag END) p;
$$;
REVOKE ALL ON FUNCTION goals.goal_progress_at(uuid,date) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION goals.goal_progress_at(uuid,date)
  TO authenticated,service_role;

CREATE FUNCTION goals.g611_frozen_phase_write_guard()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM goals.goal_state_at(NEW.goal_id,CURRENT_DATE)
    WHERE state='eingefroren') THEN
    RAISE EXCEPTION 'G611_BLOCK:ziel_eingefroren: Dieses Ziel ist eingefroren und kann nicht mehr geändert werden.' USING ERRCODE='23514';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER g611_frozen_phase_write_guard
  BEFORE INSERT OR UPDATE OF goal_id,phase_type,strategie_code,
    gueltig_ab,projected_end_date,parameters ON goals.goal_phases
  FOR EACH ROW EXECUTE FUNCTION goals.g611_frozen_phase_write_guard();
REVOKE ALL ON FUNCTION goals.g611_frozen_phase_write_guard()
  FROM PUBLIC,anon,authenticated;

CREATE FUNCTION goals.g611_frozen_plan_write_guard()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
BEGIN
  IF NEW.status='aktiv' AND EXISTS (
    SELECT 1 FROM goals.goal_state_at(NEW.goal_id,CURRENT_DATE)
    WHERE state='eingefroren') THEN
    RAISE EXCEPTION 'G611_BLOCK:ziel_eingefroren: Dieses Ziel ist eingefroren und kann nicht mehr geändert werden.' USING ERRCODE='23514';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER g611_frozen_plan_write_guard
  BEFORE INSERT OR UPDATE OF status ON goals.goal_programs
  FOR EACH ROW EXECUTE FUNCTION goals.g611_frozen_plan_write_guard();
REVOKE ALL ON FUNCTION goals.g611_frozen_plan_write_guard()
  FROM PUBLIC,anon,authenticated;

CREATE OR REPLACE FUNCTION goals.refresh_user_goal_progress(
  p_goal_id uuid,p_stichtag date DEFAULT CURRENT_DATE)
RETURNS boolean LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE v_progress record; v_first record;
BEGIN
  IF EXISTS (SELECT 1 FROM goals.goal_state_at(p_goal_id,p_stichtag)
    WHERE state='eingefroren') THEN RETURN false; END IF;
  SELECT * INTO v_progress FROM goals.goal_progress_at(p_goal_id,p_stichtag);
  IF NOT FOUND OR v_progress.progress_status IS DISTINCT FROM 'measured'
    THEN RETURN false; END IF;
  IF v_progress.start_value IS NULL THEN
    SELECT mp.* INTO v_first FROM goals.user_goals g
    JOIN LATERAL goals.measurement_points(g.id,p_stichtag) mp ON true
    WHERE g.id=p_goal_id
      AND g.measurement_type IN ('e1rm','weight_reps','duration','distance','pace')
      AND mp.measured_on>=g.gueltig_ab
    ORDER BY mp.measured_on,mp.measured_time NULLS LAST,mp.source_id LIMIT 1;
    IF FOUND THEN
      UPDATE goals.user_goals SET start_value=v_first.value,
        start_source=v_first.source_name,start_source_id=v_first.source_id,
        start_measured_at=v_first.measured_on
      WHERE id=p_goal_id AND start_value IS NULL;
      SELECT * INTO v_progress FROM goals.goal_progress_at(p_goal_id,p_stichtag);
    END IF;
  END IF;
  UPDATE goals.user_goals SET current_value=v_progress.current_value,
    progress_pct=coalesce(v_progress.progress_pct,0),updated_at=now()
  WHERE id=p_goal_id AND auto_update;
  RETURN FOUND;
END $$;

-- Direkte DELETE-Rechte würden die Bestätigung umgehen. Die Funktion
-- prüft die Identität selbst; Quellmessungen anderer Ziele bleiben stehen.
REVOKE DELETE ON goals.user_goals FROM authenticated;
ALTER TABLE goals.goal_phases DROP CONSTRAINT goal_phases_goal_id_fkey;
ALTER TABLE goals.goal_phases ADD CONSTRAINT goal_phases_goal_id_fkey
  FOREIGN KEY (goal_id) REFERENCES goals.user_goals(id) ON DELETE CASCADE;
ALTER TABLE goals.nutrition_targets DROP CONSTRAINT nutrition_targets_phase_user_fk;
ALTER TABLE goals.nutrition_targets ADD CONSTRAINT nutrition_targets_phase_user_fk
  FOREIGN KEY (phase_id,user_id) REFERENCES goals.goal_phases(id,user_id)
  ON DELETE CASCADE;
ALTER TABLE goals.phase_transition_responses
  DROP CONSTRAINT phase_transition_responses_phase_id_fkey;
ALTER TABLE goals.phase_transition_responses
  ADD CONSTRAINT phase_transition_responses_phase_id_fkey
  FOREIGN KEY (phase_id) REFERENCES goals.goal_phases(id) ON DELETE CASCADE;

CREATE FUNCTION goals.goal_archive(p_goal_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE v_goal goals.user_goals%ROWTYPE; v_reason text; v_frozen_on date;
BEGIN
  SELECT * INTO v_goal FROM goals.user_goals
  WHERE id=p_goal_id AND user_id=auth.uid() FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'G611_BLOCK:ziel_fremd: Das Ziel fehlt oder gehört nicht zu deinem Konto.' USING ERRCODE='42501'; END IF;
  SELECT reason,frozen_on INTO v_reason,v_frozen_on
    FROM goals.goal_state_at(p_goal_id,CURRENT_DATE)
    WHERE state='eingefroren';
  IF v_reason IS NULL THEN
    RAISE EXCEPTION 'G611_BLOCK:erst_beenden: Dieses Ziel ist noch nicht abgeschlossen. Bitte erst beenden.' USING ERRCODE='23514';
  END IF;
  UPDATE goals.user_goals SET archived_at=now(),
    status=CASE v_reason WHEN 'erreicht' THEN 'achieved'
      WHEN 'frist_abgelaufen' THEN 'missed' ELSE 'abandoned' END,
    achievement_date=coalesce(achievement_date,v_frozen_on,CURRENT_DATE)
  WHERE id=p_goal_id;
END $$;

CREATE FUNCTION goals.g611_archive_column_guard()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
BEGIN
  IF NEW.archived_at IS DISTINCT FROM OLD.archived_at
     AND current_user <> 'postgres' THEN
    RAISE EXCEPTION 'G611_BLOCK:archiv_nur_funktion: Bitte die Archivfunktion verwenden.' USING ERRCODE='42501';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER g611_archive_column_guard
  BEFORE UPDATE OF archived_at ON goals.user_goals
  FOR EACH ROW EXECUTE FUNCTION goals.g611_archive_column_guard();
REVOKE ALL ON FUNCTION goals.g611_archive_column_guard() FROM PUBLIC,anon,authenticated;

CREATE FUNCTION goals.goal_delete(p_goal_id uuid,p_confirm_history boolean DEFAULT false)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE v_goal goals.user_goals%ROWTYPE; v_history boolean;
BEGIN
  SELECT * INTO v_goal FROM goals.user_goals
  WHERE id=p_goal_id AND user_id=auth.uid() FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'G611_BLOCK:ziel_fremd: Das Ziel fehlt oder gehört nicht zu deinem Konto.' USING ERRCODE='42501'; END IF;
  SELECT coalesce(v_goal.progress_pct,0)>0
    OR v_goal.current_value IS NOT NULL
    OR v_goal.achievement_date IS NOT NULL
    OR EXISTS (SELECT 1 FROM goals.goal_phases WHERE goal_id=p_goal_id)
    OR EXISTS (SELECT 1 FROM goals.goal_programs WHERE goal_id=p_goal_id)
    OR EXISTS (SELECT 1 FROM goals.goal_milestones WHERE goal_id=p_goal_id)
    OR EXISTS (SELECT 1 FROM goals.goal_contributions WHERE goal_id=p_goal_id)
    OR EXISTS (SELECT 1 FROM goals.manual_goal_values WHERE goal_id=p_goal_id)
    OR EXISTS (SELECT 1 FROM goals.measurement_points(p_goal_id,CURRENT_DATE)
      WHERE measured_on>=v_goal.gueltig_ab)
    INTO v_history;
  IF v_history AND p_confirm_history IS DISTINCT FROM true THEN
    RAISE EXCEPTION 'G611_CONFIRM:beenden_statt_loeschen: Dieses Ziel hat einen Verlauf. Bitte beenden statt löschen oder das Löschen ausdrücklich bestätigen.'
      USING ERRCODE='23514';
  END IF;
  DELETE FROM goals.user_goals WHERE id=p_goal_id;
END $$;

CREATE FUNCTION goals.goal_restart(p_goal_id uuid,p_start_date date,p_target_date date)
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
    SELECT * INTO v_plan FROM goals.goal_programs WHERE goal_id=p_goal_id;
    INSERT INTO goals.goal_programs(goal_id,user_id,name,status)
    VALUES (v_new,v_old.user_id,coalesce(v_plan.name,v_old.title),'entwurf')
    RETURNING id INTO v_new_plan;
    SELECT * INTO v_position FROM goals.goal_program_positions
    WHERE program_id=v_plan.id ORDER BY position DESC LIMIT 1;
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
REVOKE ALL ON FUNCTION goals.goal_archive(uuid),goals.goal_delete(uuid,boolean),
  goals.goal_restart(uuid,date,date) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION goals.goal_archive(uuid),goals.goal_delete(uuid,boolean),
  goals.goal_restart(uuid,date,date) TO authenticated,service_role;

COMMENT ON COLUMN goals.user_goals.archived_at IS
  'G-611: Archiv blendet das Ziel aus goal_list_at aus; Verlauf bleibt erhalten.';
COMMIT;
