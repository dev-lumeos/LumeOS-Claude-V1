-- G-625: Planaktionen und die automatische Zuordnung neuer Phasen.
BEGIN;

ALTER TABLE goals.goal_program_positions
  DROP CONSTRAINT goal_program_positions_program_id_position_key;
ALTER TABLE goals.goal_program_positions
  ADD CONSTRAINT goal_program_positions_program_id_position_key
  UNIQUE (program_id, position) DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE goals.goal_phases ADD CONSTRAINT g625_new_phase_requires_goal
  CHECK (goal_id IS NOT NULL) NOT VALID;

CREATE FUNCTION goals.goal_plan_create(p_goal_id uuid, p_name text)
RETURNS uuid LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE v_user uuid := auth.uid(); v_id uuid;
BEGIN
  IF v_user IS NULL OR NOT EXISTS (
    SELECT 1 FROM goals.user_goals WHERE id=p_goal_id AND user_id=v_user
  ) THEN
    RAISE EXCEPTION 'G625_BLOCK:ziel_fremd' USING ERRCODE='42501';
  END IF;
  INSERT INTO goals.goal_programs(goal_id,user_id,name,status)
  VALUES (p_goal_id,v_user,p_name,'entwurf') RETURNING id INTO v_id;
  RETURN v_id;
END $$;

CREATE FUNCTION goals.goal_plan_activate(p_plan_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE
  v_plan goals.goal_programs%ROWTYPE;
  v_user uuid := auth.uid();
  v_first goals.goal_program_positions%ROWTYPE;
BEGIN
  SELECT * INTO v_plan FROM goals.goal_programs
  WHERE id=p_plan_id AND user_id=v_user FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'G625_BLOCK:plan_fremd' USING ERRCODE='42501';
  END IF;
  IF v_plan.status='abgeschlossen' THEN
    RAISE EXCEPTION 'G625_BLOCK:plan_abgeschlossen' USING ERRCODE='23514';
  END IF;
  SELECT * INTO v_first FROM goals.goal_program_positions
  WHERE program_id=p_plan_id ORDER BY position LIMIT 1;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'G625_BLOCK:plan_ohne_position' USING ERRCODE='23514';
  END IF;
  UPDATE goals.goal_programs SET status='pausiert'
  WHERE user_id=v_user AND status='aktiv' AND id<>p_plan_id;
  UPDATE goals.user_goals SET status='on_hold'
  WHERE user_id=v_user AND status='active' AND goal_role='controlling'
    AND id<>v_plan.goal_id;
  UPDATE goals.user_goals SET status='active' WHERE id=v_plan.goal_id;
  UPDATE goals.goal_programs SET status='aktiv' WHERE id=p_plan_id;
  IF v_first.goal_phase_id IS NULL THEN
    PERFORM goals.goal_plan_position_start(v_first.id);
  END IF;
END $$;

CREATE FUNCTION goals.goal_plan_pause(p_plan_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE v_plan goals.goal_programs%ROWTYPE;
BEGIN
  SELECT * INTO v_plan FROM goals.goal_programs
  WHERE id=p_plan_id AND user_id=auth.uid() FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'G625_BLOCK:plan_fremd' USING ERRCODE='42501'; END IF;
  IF v_plan.status<>'aktiv' THEN
    RAISE EXCEPTION 'G625_BLOCK:plan_nicht_aktiv' USING ERRCODE='23514';
  END IF;
  UPDATE goals.goal_programs SET status='pausiert' WHERE id=p_plan_id;
  UPDATE goals.user_goals SET status='on_hold' WHERE id=v_plan.goal_id;
END $$;

CREATE FUNCTION goals.goal_plan_complete(p_plan_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE v_plan goals.goal_programs%ROWTYPE;
BEGIN
  SELECT * INTO v_plan FROM goals.goal_programs
  WHERE id=p_plan_id AND user_id=auth.uid() FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'G625_BLOCK:plan_fremd' USING ERRCODE='42501'; END IF;
  UPDATE goals.goal_programs SET status='abgeschlossen' WHERE id=p_plan_id;
  UPDATE goals.user_goals SET status='abandoned' WHERE id=v_plan.goal_id;
END $$;

CREATE FUNCTION goals.goal_plan_delete(p_plan_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
BEGIN
  DELETE FROM goals.goal_programs
  WHERE id=p_plan_id AND user_id=auth.uid() AND status='entwurf';
  IF NOT FOUND THEN
    RAISE EXCEPTION 'G625_BLOCK:nur_entwurf_loeschbar' USING ERRCODE='23514';
  END IF;
END $$;

CREATE FUNCTION goals.goal_plan_position_save(
  p_plan_id uuid, p_position_id uuid, p_position smallint,
  p_strategie_code text, p_eigene_werte jsonb, p_richtung text,
  p_phase_type text, p_duration_weeks smallint,
  p_gueltig_ab date, p_projected_end_date date,
  p_confirmed_warnings jsonb DEFAULT '[]'::jsonb,
  p_sub_phase_code text DEFAULT NULL,
  p_zielrate_pct_kg_woche numeric DEFAULT NULL
)
RETURNS uuid LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE v_id uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM goals.goal_programs
    WHERE id=p_plan_id AND user_id=auth.uid()) THEN
    RAISE EXCEPTION 'G625_BLOCK:plan_fremd' USING ERRCODE='42501';
  END IF;
  IF p_position_id IS NULL THEN
    INSERT INTO goals.goal_program_positions(
      program_id,position,strategie_code,eigene_werte,richtung,phase_type,
      duration_weeks,gueltig_ab,projected_end_date,confirmed_warnings,
      sub_phase_code,zielrate_pct_kg_woche
    ) VALUES (
      p_plan_id,p_position,p_strategie_code,p_eigene_werte,p_richtung,p_phase_type,
      p_duration_weeks,p_gueltig_ab,p_projected_end_date,p_confirmed_warnings,
      p_sub_phase_code,p_zielrate_pct_kg_woche
    ) RETURNING id INTO v_id;
  ELSE
    UPDATE goals.goal_program_positions SET
      position=p_position,strategie_code=p_strategie_code,
      eigene_werte=p_eigene_werte,richtung=p_richtung,phase_type=p_phase_type,
      duration_weeks=p_duration_weeks,gueltig_ab=p_gueltig_ab,
      projected_end_date=p_projected_end_date,
      confirmed_warnings=p_confirmed_warnings,
      sub_phase_code=p_sub_phase_code,
      zielrate_pct_kg_woche=p_zielrate_pct_kg_woche
    WHERE id=p_position_id AND program_id=p_plan_id
      AND goal_phase_id IS NULL
    RETURNING id INTO v_id;
    IF v_id IS NULL THEN
      RAISE EXCEPTION 'G625_BLOCK:position_nicht_editierbar'
        USING ERRCODE='23514';
    END IF;
  END IF;
  RETURN v_id;
END $$;

CREATE FUNCTION goals.goal_plan_position_move(
  p_position_id uuid, p_new_position smallint
)
RETURNS void LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE v_old smallint; v_plan_id uuid; v_max smallint;
BEGIN
  SELECT pos.position,pos.program_id INTO v_old,v_plan_id
  FROM goals.goal_program_positions pos
  JOIN goals.goal_programs plan ON plan.id=pos.program_id
  WHERE pos.id=p_position_id AND plan.user_id=auth.uid()
  FOR UPDATE OF pos;
  IF NOT FOUND THEN RAISE EXCEPTION 'G625_BLOCK:position_fremd' USING ERRCODE='42501'; END IF;
  SELECT max(position) INTO v_max FROM goals.goal_program_positions
  WHERE program_id=v_plan_id;
  IF p_new_position<1 OR p_new_position>v_max THEN
    RAISE EXCEPTION 'G625_BLOCK:position_ausserhalb' USING ERRCODE='23514';
  END IF;
  SET CONSTRAINTS goals.goal_program_positions_program_id_position_key DEFERRED;
  UPDATE goals.goal_program_positions
  SET position=CASE
    WHEN id=p_position_id THEN p_new_position
    WHEN v_old<p_new_position THEN position-1
    ELSE position+1 END
  WHERE program_id=v_plan_id AND
    (id=p_position_id OR
      (v_old<p_new_position AND position>v_old AND position<=p_new_position) OR
      (v_old>p_new_position AND position>=p_new_position AND position<v_old));
  SET CONSTRAINTS goals.goal_program_positions_program_id_position_key IMMEDIATE;
END $$;

CREATE FUNCTION goals.goal_plan_event_save(
  p_plan_id uuid, p_event_id uuid, p_name text, p_kind text, p_event_date date
)
RETURNS uuid LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE v_id uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM goals.goal_programs
    WHERE id=p_plan_id AND user_id=auth.uid()) THEN
    RAISE EXCEPTION 'G625_BLOCK:plan_fremd' USING ERRCODE='42501';
  END IF;
  IF p_event_id IS NULL THEN
    INSERT INTO goals.goal_program_events(program_id,name,kind,event_date)
    VALUES (p_plan_id,p_name,p_kind,p_event_date) RETURNING id INTO v_id;
  ELSE
    UPDATE goals.goal_program_events SET
      name=p_name,kind=p_kind,event_date=p_event_date
    WHERE id=p_event_id AND program_id=p_plan_id RETURNING id INTO v_id;
    IF v_id IS NULL THEN RAISE EXCEPTION 'G625_BLOCK:termin_fremd' USING ERRCODE='42501'; END IF;
  END IF;
  RETURN v_id;
END $$;

CREATE FUNCTION goals.goal_plan_event_delete(p_event_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
BEGIN
  DELETE FROM goals.goal_program_events event
  USING goals.goal_programs plan
  WHERE event.id=p_event_id AND plan.id=event.program_id
    AND plan.user_id=auth.uid();
  IF NOT FOUND THEN RAISE EXCEPTION 'G625_BLOCK:termin_fremd' USING ERRCODE='42501'; END IF;
END $$;

-- Der Phasenstart bleibt der einzige Weg zur Ausfuehrungszeile. Sein INSERT
-- legt einen einfachen Plan an oder verbindet die vorbereitete Position.
CREATE FUNCTION goals.g625_phase_to_plan()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE
  v_plan goals.goal_programs%ROWTYPE;
  v_goal goals.user_goals%ROWTYPE;
  v_position_id uuid;
  v_source text;
  v_own jsonb;
  v_richtung text;
BEGIN
  SELECT * INTO v_goal FROM goals.user_goals WHERE id=NEW.goal_id;
  SELECT * INTO v_plan FROM goals.goal_programs WHERE goal_id=NEW.goal_id;
  IF NOT FOUND THEN
    INSERT INTO goals.goal_programs(goal_id,user_id,name,status)
    VALUES (NEW.goal_id,NEW.user_id,v_goal.title,
      CASE WHEN v_goal.status='active' THEN 'aktiv' ELSE 'pausiert' END)
    RETURNING * INTO v_plan;
  END IF;
  v_richtung := CASE NEW.phase_type
    WHEN 'fat_loss' THEN 'abnehmen'
    WHEN 'mini_cut' THEN 'abnehmen'
    WHEN 'lean_bulk' THEN 'aufbauen'
    ELSE 'halten' END;
  v_position_id := NULLIF(NEW.parameters->>'g625_position_id','')::uuid;
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
      gueltig_ab=NEW.gueltig_ab,projected_end_date=NEW.projected_end_date
    WHERE id=v_position_id AND program_id=v_plan.id AND goal_phase_id IS NULL;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'G625_BLOCK:position_passt_nicht' USING ERRCODE='23514';
    END IF;
  ELSE
    INSERT INTO goals.goal_program_positions(
      program_id,position,strategie_code,eigene_werte,richtung,phase_type,
      duration_weeks,goal_phase_id,gueltig_ab,projected_end_date
    ) VALUES (
      v_plan.id,
      (SELECT coalesce(max(position),0)+1 FROM goals.goal_program_positions
        WHERE program_id=v_plan.id),
      v_source,v_own,v_richtung,NEW.phase_type,
      CASE WHEN NEW.projected_end_date IS NOT NULL THEN
        greatest(1,ceil((NEW.projected_end_date-NEW.gueltig_ab)::numeric/7))::smallint
        ELSE NULL END,
      NEW.id,NEW.gueltig_ab,NEW.projected_end_date
    );
  END IF;
  RETURN NULL;
END $$;
CREATE TRIGGER g625_phase_to_plan
  AFTER INSERT ON goals.goal_phases
  FOR EACH ROW EXECUTE FUNCTION goals.g625_phase_to_plan();

-- Die Rollenquelle bleibt G-617: Phase oder Plan. Ein direkter Zielstatus-
-- Wechsel darf keinen aktiven Plan am pausierten Ziel zuruecklassen.
CREATE FUNCTION goals.g625_sync_plan_after_goal_status()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
BEGIN
  IF NEW.status<>'active' THEN
    UPDATE goals.goal_programs SET status=
      CASE WHEN NEW.status IN ('achieved','missed','abandoned')
        THEN 'abgeschlossen' ELSE 'pausiert' END
    WHERE goal_id=NEW.id AND status='aktiv';
  END IF;
  RETURN NULL;
END $$;
CREATE TRIGGER g625_sync_plan_after_goal_status
  AFTER UPDATE OF status ON goals.user_goals
  FOR EACH ROW EXECUTE FUNCTION goals.g625_sync_plan_after_goal_status();

REVOKE ALL ON FUNCTION goals.g625_phase_to_plan(),
  goals.g625_sync_plan_after_goal_status() FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION goals.goal_plan_create(uuid,text),
  goals.goal_plan_activate(uuid),goals.goal_plan_pause(uuid),
  goals.goal_plan_complete(uuid),goals.goal_plan_delete(uuid),
  goals.goal_plan_position_save(uuid,uuid,smallint,text,jsonb,text,text,smallint,date,date,jsonb,text,numeric),
  goals.goal_plan_position_move(uuid,smallint),
  goals.goal_plan_event_save(uuid,uuid,text,text,date),
  goals.goal_plan_event_delete(uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION goals.goal_plan_create(uuid,text),
  goals.goal_plan_activate(uuid),goals.goal_plan_pause(uuid),
  goals.goal_plan_complete(uuid),goals.goal_plan_delete(uuid),
  goals.goal_plan_position_save(uuid,uuid,smallint,text,jsonb,text,text,smallint,date,date,jsonb,text,numeric),
  goals.goal_plan_position_move(uuid,smallint),
  goals.goal_plan_event_save(uuid,uuid,text,text,date),
  goals.goal_plan_event_delete(uuid) TO authenticated,service_role;
COMMIT;
