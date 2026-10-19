-- G-675: Goals trash roots. No retention timer. Purging is explicit.
BEGIN;
ALTER TABLE goals.user_goals ADD COLUMN deleted_at timestamptz,
  ADD COLUMN deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN deleted_previous_status text;
ALTER TABLE goals.goal_programs ADD COLUMN deleted_at timestamptz,
  ADD COLUMN deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN deleted_previous_status text;
ALTER TABLE goals.goal_program_events ADD COLUMN deleted_at timestamptz,
  ADD COLUMN deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN deleted_previous_status text;
CREATE INDEX g675_user_goals_trash ON goals.user_goals(user_id,deleted_at DESC)
  WHERE deleted_at IS NOT NULL;
CREATE INDEX g675_goal_programs_trash ON goals.goal_programs(user_id,deleted_at DESC)
  WHERE deleted_at IS NOT NULL;
CREATE INDEX g675_goal_program_events_trash ON goals.goal_program_events(program_id,deleted_at DESC)
  WHERE deleted_at IS NOT NULL;

CREATE FUNCTION goals.g675_phase_visible(p_phase_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
  SELECT EXISTS (SELECT 1 FROM goals.goal_phases ph
    JOIN goals.user_goals g ON g.id=ph.goal_id
    WHERE ph.id=p_phase_id AND g.user_id=auth.uid()
      AND g.deleted_at IS NULL
      AND NOT EXISTS (SELECT 1 FROM goals.goal_program_positions pos
        JOIN goals.goal_programs plan ON plan.id=pos.program_id
        WHERE pos.goal_phase_id=ph.id AND plan.deleted_at IS NOT NULL));
$$;
REVOKE ALL ON FUNCTION goals.g675_phase_visible(uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION goals.g675_phase_visible(uuid) TO authenticated;

-- Existing permissive SELECT policies remain; this policy is ANDed to all.
CREATE POLICY g675_user_goals_visible ON goals.user_goals
  AS RESTRICTIVE FOR SELECT TO authenticated USING (deleted_at IS NULL);
CREATE POLICY g675_goal_programs_visible ON goals.goal_programs
  AS RESTRICTIVE FOR SELECT TO authenticated USING (
    deleted_at IS NULL AND EXISTS (SELECT 1 FROM goals.user_goals g
      WHERE g.id=goal_id AND g.deleted_at IS NULL));
CREATE POLICY g675_goal_program_events_visible ON goals.goal_program_events
  AS RESTRICTIVE FOR SELECT TO authenticated USING (
    deleted_at IS NULL AND EXISTS (SELECT 1 FROM goals.goal_programs p
      WHERE p.id=program_id AND p.deleted_at IS NULL));
CREATE POLICY g675_goal_phases_visible ON goals.goal_phases
  AS RESTRICTIVE FOR SELECT TO authenticated USING (
    goals.g675_phase_visible(id));
CREATE POLICY g675_goal_program_positions_visible ON goals.goal_program_positions
  AS RESTRICTIVE FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM goals.goal_programs p WHERE p.id=program_id
      AND p.deleted_at IS NULL));
CREATE POLICY g675_goal_milestones_visible ON goals.goal_milestones
  AS RESTRICTIVE FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM goals.user_goals g WHERE g.id=goal_id
      AND g.deleted_at IS NULL));
CREATE POLICY g675_goal_contributions_visible ON goals.goal_contributions
  AS RESTRICTIVE FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM goals.user_goals g WHERE g.id=goal_id
      AND g.deleted_at IS NULL));
CREATE POLICY g675_manual_goal_values_visible ON goals.manual_goal_values
  AS RESTRICTIVE FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM goals.user_goals g WHERE g.id=goal_id
      AND g.deleted_at IS NULL));
CREATE POLICY g675_goal_weekly_adjustments_visible ON goals.goal_weekly_adjustments
  AS RESTRICTIVE FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM goals.goal_programs p WHERE p.id=program_id
      AND p.deleted_at IS NULL));
CREATE POLICY g675_nutrition_targets_visible ON goals.nutrition_targets
  AS RESTRICTIVE FOR SELECT TO authenticated USING (
    goals.g675_phase_visible(phase_id));
CREATE POLICY g675_phase_transition_responses_visible
  ON goals.phase_transition_responses
  AS RESTRICTIVE FOR SELECT TO authenticated USING (
    goals.g675_phase_visible(phase_id));

-- A direct DELETE must never bypass the trash or the confirmation RPC.
CREATE FUNCTION goals.g675_hard_delete_guard()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
BEGIN
  IF current_user='authenticated'
     AND current_setting('goals.g675_purge',true) IS DISTINCT FROM 'on' THEN
    RAISE EXCEPTION 'G675_BLOCK:nur_papierkorb_oder_endgueltig'
      USING ERRCODE='23514';
  END IF;
  RETURN OLD;
END $$;
CREATE TRIGGER g675_user_goals_hard_delete BEFORE DELETE ON goals.user_goals
  FOR EACH ROW EXECUTE FUNCTION goals.g675_hard_delete_guard();
CREATE TRIGGER g675_goal_programs_hard_delete BEFORE DELETE ON goals.goal_programs
  FOR EACH ROW EXECUTE FUNCTION goals.g675_hard_delete_guard();
CREATE TRIGGER g675_goal_program_events_hard_delete BEFORE DELETE ON goals.goal_program_events
  FOR EACH ROW EXECUTE FUNCTION goals.g675_hard_delete_guard();
REVOKE ALL ON FUNCTION goals.g675_hard_delete_guard() FROM PUBLIC,anon,authenticated;

CREATE FUNCTION goals.g675_trash_write_guard()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
BEGIN
  IF current_user='authenticated' AND (
    OLD.deleted_at IS NOT NULL
    OR NEW.deleted_at IS DISTINCT FROM OLD.deleted_at
    OR NEW.deleted_by IS DISTINCT FROM OLD.deleted_by
    OR NEW.deleted_previous_status IS DISTINCT FROM OLD.deleted_previous_status
  ) THEN
    RAISE EXCEPTION 'G675_BLOCK:papierkorb_nur_funktion' USING ERRCODE='23514';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER g675_user_goals_trash_write BEFORE UPDATE ON goals.user_goals
  FOR EACH ROW EXECUTE FUNCTION goals.g675_trash_write_guard();
CREATE TRIGGER g675_goal_programs_trash_write BEFORE UPDATE ON goals.goal_programs
  FOR EACH ROW EXECUTE FUNCTION goals.g675_trash_write_guard();
CREATE TRIGGER g675_goal_program_events_trash_write
  BEFORE UPDATE ON goals.goal_program_events
  FOR EACH ROW EXECUTE FUNCTION goals.g675_trash_write_guard();
REVOKE ALL ON FUNCTION goals.g675_trash_write_guard() FROM PUBLIC,anon,authenticated;

CREATE FUNCTION goals.goal_trash(p_goal_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE v_goal goals.user_goals%ROWTYPE;
BEGIN
  SELECT * INTO v_goal FROM goals.user_goals
  WHERE id=p_goal_id AND user_id=auth.uid() AND deleted_at IS NULL FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'G675_BLOCK:ziel_fremd_oder_im_papierkorb'
    USING ERRCODE='42501'; END IF;
  UPDATE goals.goal_programs SET deleted_previous_status=status
    WHERE goal_id=p_goal_id AND status='aktiv' AND deleted_at IS NULL;
  UPDATE goals.user_goals SET deleted_at=now(),deleted_by=auth.uid(),
    deleted_previous_status=status,status='paused' WHERE id=p_goal_id;
END $$;

CREATE FUNCTION goals.goal_restore(p_goal_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE v_goal goals.user_goals%ROWTYPE;
BEGIN
  SELECT * INTO v_goal FROM goals.user_goals
  WHERE id=p_goal_id AND user_id=auth.uid() AND deleted_at IS NOT NULL FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'G675_BLOCK:ziel_nicht_im_papierkorb'
    USING ERRCODE='42501'; END IF;
  UPDATE goals.user_goals SET deleted_at=NULL,deleted_by=NULL,
    deleted_previous_status=NULL,status='paused',archived_at=NULL
  WHERE id=p_goal_id;
  UPDATE goals.goal_programs SET status='entwurf',deleted_previous_status=NULL
    WHERE goal_id=p_goal_id AND deleted_at IS NULL
      AND deleted_previous_status='aktiv';
END $$;

CREATE FUNCTION goals.goal_purge(p_goal_id uuid,p_confirm boolean DEFAULT false)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE v_before text;
BEGIN
  IF p_confirm IS DISTINCT FROM true THEN
    RAISE EXCEPTION 'G675_CONFIRM:ziel_endgueltig_loeschen'
      USING ERRCODE='23514'; END IF;
  IF NOT EXISTS (SELECT 1 FROM goals.user_goals WHERE id=p_goal_id
    AND user_id=auth.uid() AND deleted_at IS NOT NULL) THEN
    RAISE EXCEPTION 'G675_BLOCK:ziel_nicht_im_papierkorb'
      USING ERRCODE='42501'; END IF;
  v_before:=current_setting('goals.g675_purge',true);
  PERFORM set_config('goals.g675_purge','on',true);
  DELETE FROM goals.user_goals WHERE id=p_goal_id;
  PERFORM set_config('goals.g675_purge',coalesce(v_before,''),true);
END $$;

CREATE FUNCTION goals.goal_plan_trash(p_plan_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE v_plan goals.goal_programs%ROWTYPE;
BEGIN
  SELECT * INTO v_plan FROM goals.goal_programs WHERE id=p_plan_id
    AND user_id=auth.uid() AND deleted_at IS NULL FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'G675_BLOCK:plan_fremd_oder_im_papierkorb'
    USING ERRCODE='42501'; END IF;
  UPDATE goals.goal_programs SET deleted_at=now(),deleted_by=auth.uid(),
    deleted_previous_status=coalesce(deleted_previous_status,status),
    status=CASE WHEN status='aktiv' THEN 'entwurf' ELSE status END
  WHERE id=p_plan_id;
END $$;

CREATE FUNCTION goals.goal_plan_restore(p_plan_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE v_plan goals.goal_programs%ROWTYPE;
BEGIN
  SELECT * INTO v_plan FROM goals.goal_programs WHERE id=p_plan_id
    AND user_id=auth.uid() AND deleted_at IS NOT NULL FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'G675_BLOCK:plan_nicht_im_papierkorb'
    USING ERRCODE='42501'; END IF;
  IF EXISTS (SELECT 1 FROM goals.user_goals WHERE id=v_plan.goal_id
    AND deleted_at IS NOT NULL) THEN
    PERFORM goals.goal_restore(v_plan.goal_id);
  END IF;
  UPDATE goals.goal_programs SET deleted_at=NULL,deleted_by=NULL,
    status=CASE WHEN deleted_previous_status='aktiv' THEN 'entwurf'
      ELSE coalesce(deleted_previous_status,status) END,
    deleted_previous_status=NULL WHERE id=p_plan_id;
END $$;

CREATE FUNCTION goals.goal_plan_purge(p_plan_id uuid,p_confirm boolean DEFAULT false)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE v_before text;
BEGIN
  IF p_confirm IS DISTINCT FROM true THEN
    RAISE EXCEPTION 'G675_CONFIRM:plan_endgueltig_loeschen'
      USING ERRCODE='23514'; END IF;
  IF NOT EXISTS (SELECT 1 FROM goals.goal_programs WHERE id=p_plan_id
    AND user_id=auth.uid() AND deleted_at IS NOT NULL) THEN
    RAISE EXCEPTION 'G675_BLOCK:plan_nicht_im_papierkorb'
      USING ERRCODE='42501'; END IF;
  v_before:=current_setting('goals.g675_purge',true);
  PERFORM set_config('goals.g675_purge','on',true);
  DELETE FROM goals.goal_phases ph WHERE ph.id IN (
    SELECT goal_phase_id FROM goals.goal_program_positions
    WHERE program_id=p_plan_id AND goal_phase_id IS NOT NULL);
  DELETE FROM goals.goal_programs WHERE id=p_plan_id;
  PERFORM set_config('goals.g675_purge',coalesce(v_before,''),true);
END $$;

CREATE FUNCTION goals.goal_plan_event_trash(p_event_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
  UPDATE goals.goal_program_events e SET deleted_at=now(),deleted_by=auth.uid()
  FROM goals.goal_programs p WHERE e.id=p_event_id AND e.program_id=p.id
    AND p.user_id=auth.uid() AND p.deleted_at IS NULL
    AND e.deleted_at IS NULL;
  IF NOT FOUND THEN RAISE EXCEPTION 'G675_BLOCK:termin_fremd_oder_im_papierkorb'
    USING ERRCODE='42501'; END IF;
END $$;

CREATE FUNCTION goals.goal_plan_event_restore(p_event_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE v_program_id uuid; v_plan_deleted timestamptz;
BEGIN
  SELECT p.id,p.deleted_at INTO v_program_id,v_plan_deleted
  FROM goals.goal_program_events e JOIN goals.goal_programs p ON p.id=e.program_id
  WHERE e.id=p_event_id AND p.user_id=auth.uid() AND e.deleted_at IS NOT NULL;
  IF NOT FOUND THEN RAISE EXCEPTION 'G675_BLOCK:termin_nicht_im_papierkorb'
    USING ERRCODE='42501'; END IF;
  IF v_plan_deleted IS NOT NULL THEN
    PERFORM goals.goal_plan_restore(v_program_id);
  ELSIF EXISTS (SELECT 1 FROM goals.goal_programs p
    JOIN goals.user_goals g ON g.id=p.goal_id
    WHERE p.id=v_program_id AND g.deleted_at IS NOT NULL) THEN
    PERFORM goals.goal_restore((SELECT goal_id FROM goals.goal_programs
      WHERE id=v_program_id));
  END IF;
  UPDATE goals.goal_program_events e SET deleted_at=NULL,deleted_by=NULL
  FROM goals.goal_programs p JOIN goals.user_goals g ON g.id=p.goal_id
  WHERE e.id=p_event_id AND e.program_id=p.id AND p.user_id=auth.uid()
    AND e.deleted_at IS NOT NULL AND p.deleted_at IS NULL
    AND g.deleted_at IS NULL;
  IF NOT FOUND THEN RAISE EXCEPTION 'G675_BLOCK:plan_und_ziel_zuerst_wiederherstellen'
    USING ERRCODE='23514'; END IF;
END $$;

CREATE FUNCTION goals.goal_plan_event_purge(p_event_id uuid,p_confirm boolean DEFAULT false)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE v_before text;
BEGIN
  IF p_confirm IS DISTINCT FROM true THEN
    RAISE EXCEPTION 'G675_CONFIRM:termin_endgueltig_loeschen'
      USING ERRCODE='23514'; END IF;
  v_before:=current_setting('goals.g675_purge',true);
  PERFORM set_config('goals.g675_purge','on',true);
  DELETE FROM goals.goal_program_events e USING goals.goal_programs p
  WHERE e.id=p_event_id AND e.program_id=p.id AND p.user_id=auth.uid()
    AND e.deleted_at IS NOT NULL;
  IF NOT FOUND THEN RAISE EXCEPTION 'G675_BLOCK:termin_nicht_im_papierkorb'
    USING ERRCODE='42501'; END IF;
  PERFORM set_config('goals.g675_purge',coalesce(v_before,''),true);
END $$;

CREATE FUNCTION goals.goal_trash_list()
RETURNS TABLE(object_type text,object_id uuid,object_name text,
  deleted_at timestamptz,previous_status text,parent_id uuid)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
  SELECT 'goal'::text AS object_type,g.id AS object_id,
    g.title AS object_name,g.deleted_at,
    g.deleted_previous_status AS previous_status,
    NULL::uuid AS parent_id FROM goals.user_goals g
  WHERE g.user_id=auth.uid() AND g.deleted_at IS NOT NULL
  UNION ALL
  SELECT 'plan',p.id,p.name,p.deleted_at,p.deleted_previous_status,p.goal_id
  FROM goals.goal_programs p
  WHERE p.user_id=auth.uid() AND p.deleted_at IS NOT NULL
  UNION ALL
  SELECT 'termin',e.id,e.name,e.deleted_at,e.deleted_previous_status,
    e.program_id FROM goals.goal_program_events e
  JOIN goals.goal_programs p ON p.id=e.program_id
  WHERE p.user_id=auth.uid() AND e.deleted_at IS NOT NULL
  ORDER BY deleted_at DESC,object_id;
$$;

-- Existing app RPCs now mean trash. Permanent removal has distinct names.
CREATE OR REPLACE FUNCTION goals.goal_delete(p_goal_id uuid,
  p_confirm_history boolean DEFAULT false)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN PERFORM goals.goal_trash(p_goal_id); END $$;
CREATE OR REPLACE FUNCTION goals.goal_plan_delete(p_plan_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
BEGIN PERFORM goals.goal_plan_trash(p_plan_id); END $$;
CREATE OR REPLACE FUNCTION goals.goal_plan_delete_completed(p_plan_id uuid,
  p_confirm boolean DEFAULT false)
RETURNS void LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
BEGIN PERFORM goals.goal_plan_trash(p_plan_id); END $$;
CREATE OR REPLACE FUNCTION goals.goal_plan_event_delete(p_event_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
BEGIN PERFORM goals.goal_plan_event_trash(p_event_id); END $$;

REVOKE ALL ON FUNCTION goals.goal_trash(uuid),goals.goal_restore(uuid),
  goals.goal_purge(uuid,boolean),goals.goal_plan_trash(uuid),
  goals.goal_plan_restore(uuid),goals.goal_plan_purge(uuid,boolean),
  goals.goal_plan_event_trash(uuid),goals.goal_plan_event_restore(uuid),
  goals.goal_plan_event_purge(uuid,boolean),goals.goal_trash_list()
  FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION goals.goal_trash(uuid),goals.goal_restore(uuid),
  goals.goal_purge(uuid,boolean),goals.goal_plan_trash(uuid),
  goals.goal_plan_restore(uuid),goals.goal_plan_purge(uuid,boolean),
  goals.goal_plan_event_trash(uuid),goals.goal_plan_event_restore(uuid),
  goals.goal_plan_event_purge(uuid,boolean),goals.goal_trash_list()
  TO authenticated;
COMMIT;
