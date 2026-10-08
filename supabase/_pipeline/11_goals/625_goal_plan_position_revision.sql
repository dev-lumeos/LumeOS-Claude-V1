-- G-625 Teil 2: Eine laufende Position wird ab einem Stichtag abgeloest.
-- Der alte Abschnitt bleibt mit seiner Phase erhalten. Die Funktion ist
-- ein atomarer Schreibweg: eine fehlgeschlagene G-626-Pruefung rollt auch
-- das Phasenende und die Positionsverschiebung zurueck.
BEGIN;

CREATE FUNCTION goals.goal_plan_position_revise(
  p_position_id uuid,p_strategie_code text,p_eigene_werte jsonb,
  p_duration_weeks smallint DEFAULT NULL,
  p_confirmed_warnings jsonb DEFAULT '[]'::jsonb,
  p_stichtag date DEFAULT CURRENT_DATE,
  p_sub_phase_code text DEFAULT NULL,
  p_zielrate_pct_kg_woche numeric DEFAULT NULL
)
RETURNS uuid LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE
  v_old goals.goal_program_positions%ROWTYPE;
  v_plan goals.goal_programs%ROWTYPE;
  v_phase goals.goal_phases%ROWTYPE;
  v_new_id uuid;
  v_duration smallint;
  v_end date;
BEGIN
  SELECT pos.* INTO v_old FROM goals.goal_program_positions pos
  JOIN goals.goal_programs plan ON plan.id=pos.program_id
  WHERE pos.id=p_position_id AND plan.user_id=auth.uid()
  FOR UPDATE OF pos;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'G625_BLOCK:position_fremd' USING ERRCODE='42501';
  END IF;
  SELECT * INTO v_plan FROM goals.goal_programs WHERE id=v_old.program_id
    FOR UPDATE;
  IF v_plan.status<>'aktiv' OR NOT EXISTS (
    SELECT 1 FROM goals.user_goals g
    WHERE g.id=v_plan.goal_id AND g.status='active'
  ) THEN
    RAISE EXCEPTION 'G625_BLOCK:plan_nicht_aktiv' USING ERRCODE='23514';
  END IF;
  SELECT * INTO v_phase FROM goals.goal_phases
  WHERE id=v_old.goal_phase_id AND goal_id=v_plan.goal_id
    AND actual_end_date IS NULL FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'G625_BLOCK:position_nicht_laufend'
      USING ERRCODE='23514';
  END IF;
  IF p_stichtag IS NULL OR p_stichtag<CURRENT_DATE
     OR p_stichtag<v_phase.gueltig_ab THEN
    RAISE EXCEPTION 'G625_BLOCK:stichtag_nach_beginn'
      USING ERRCODE='23514';
  END IF;
  v_duration := coalesce(p_duration_weeks,v_old.duration_weeks);
  IF v_duration IS NOT NULL AND v_duration<=0 THEN
    RAISE EXCEPTION 'G625_BLOCK:dauer' USING ERRCODE='23514';
  END IF;
  v_end := CASE WHEN v_duration IS NOT NULL THEN
    p_stichtag+v_duration*7-1 ELSE NULL END;

  -- Am ersten Tag existiert noch kein vergangener Kalendertag. Die
  -- Startphase kann ersetzt werden; referenzierte Phasen duerfen nicht
  -- geloescht werden und brechen den gesamten Aufruf atomar ab.
  IF p_stichtag=v_phase.gueltig_ab THEN
    BEGIN
      DELETE FROM goals.goal_phases WHERE id=v_phase.id;
    EXCEPTION WHEN foreign_key_violation THEN
      RAISE EXCEPTION 'G625_BLOCK:startphase_hat_abhaengige_daten'
        USING ERRCODE='23514';
    END;
    DELETE FROM goals.goal_program_positions WHERE id=v_old.id;
    v_new_id := goals.goal_plan_position_save(
      v_plan.id,NULL,v_old.position,
      p_strategie_code,p_eigene_werte,v_old.richtung,v_old.phase_type,
      v_duration,p_stichtag,v_end,p_confirmed_warnings,
      p_sub_phase_code,p_zielrate_pct_kg_woche
    );
    PERFORM goals.goal_plan_position_start(v_new_id);
    RETURN v_new_id;
  END IF;

  -- Der alte Phasen-Datensatz behaelt seine Werte. Alle Leser waehlen ihn
  -- bis einschliesslich zum Vortag des Stichtags.
  UPDATE goals.goal_phases SET actual_end_date=p_stichtag-1
  WHERE id=v_phase.id;
  UPDATE goals.goal_program_positions SET
    duration_weeks=greatest(1,
      ceil((p_stichtag-v_phase.gueltig_ab)::numeric/7))::smallint,
    projected_end_date=p_stichtag-1
  WHERE id=v_old.id;

  SET CONSTRAINTS goals.goal_program_positions_program_id_position_key DEFERRED;
  UPDATE goals.goal_program_positions SET position=position+1
  WHERE program_id=v_plan.id AND position>v_old.position;
  v_new_id := goals.goal_plan_position_save(
    v_plan.id,NULL,(v_old.position+1)::smallint,
    p_strategie_code,p_eigene_werte,v_old.richtung,v_old.phase_type,
    v_duration,p_stichtag,v_end,p_confirmed_warnings,
    p_sub_phase_code,p_zielrate_pct_kg_woche
  );
  SET CONSTRAINTS goals.goal_program_positions_program_id_position_key IMMEDIATE;
  PERFORM goals.goal_plan_position_start(v_new_id);
  RETURN v_new_id;
END $$;

REVOKE ALL ON FUNCTION goals.goal_plan_position_revise(
  uuid,text,jsonb,smallint,jsonb,date,text,numeric
) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION goals.goal_plan_position_revise(
  uuid,text,jsonb,smallint,jsonb,date,text,numeric
) TO authenticated,service_role;
COMMENT ON FUNCTION goals.goal_plan_position_revise(
  uuid,text,jsonb,smallint,jsonb,date,text,numeric
) IS 'G-625: atomare Planpositionsrevision ab Stichtag mit neuer bewachter Phase und unveraenderten vergangenen Tagen.';
COMMIT;
