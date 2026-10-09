-- G-638: Zielstatus und bestehender Plan laufen auch beim Fortsetzen
-- wieder zusammen. G-611 verhindert die Aktivierung eingefrorener Ziele.
BEGIN;

CREATE FUNCTION goals.g638_plan_resume_preflight()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM 'active' AND NEW.status='active' THEN
    IF NEW.archived_at IS NOT NULL OR EXISTS (
      SELECT 1 FROM goals.goal_state_at(OLD.id,CURRENT_DATE)
      WHERE state='eingefroren'
    ) THEN
      RAISE EXCEPTION 'G638_BLOCK:ziel_eingefroren_oder_archiviert: Eingefrorene oder archivierte Ziele koennen keinen Plan aktivieren; bitte neu starten.'
        USING ERRCODE='23514';
    END IF;
    IF OLD.status IN ('paused','on_hold') AND EXISTS (
      SELECT 1 FROM goals.goal_programs p
      WHERE p.goal_id=OLD.id AND p.status='pausiert'
    ) AND EXISTS (
      SELECT 1 FROM goals.goal_programs p
      WHERE p.user_id=NEW.user_id AND p.goal_id<>OLD.id AND p.status='aktiv'
    ) THEN
      RAISE EXCEPTION 'G638_BLOCK:anderer_aktiver_plan: Ein anderer Plan dieses Nutzers ist bereits aktiv.'
        USING ERRCODE='23514';
    END IF;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER g638_plan_resume_preflight
  BEFORE UPDATE OF status ON goals.user_goals
  FOR EACH ROW EXECUTE FUNCTION goals.g638_plan_resume_preflight();
REVOKE ALL ON FUNCTION goals.g638_plan_resume_preflight()
  FROM PUBLIC,anon,authenticated;

CREATE OR REPLACE FUNCTION goals.g625_sync_plan_after_goal_status()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
BEGIN
  IF NEW.status IN ('achieved','missed','abandoned') THEN
    UPDATE goals.goal_programs SET status='abgeschlossen'
    WHERE goal_id=NEW.id AND status<>'abgeschlossen';
  ELSIF NEW.status IN ('paused','on_hold') THEN
    UPDATE goals.goal_programs SET status='pausiert'
    WHERE goal_id=NEW.id AND status='aktiv';
  ELSIF NEW.status='active' AND OLD.status IN ('paused','on_hold') THEN
    UPDATE goals.goal_programs SET status='aktiv'
    WHERE goal_id=NEW.id AND status='pausiert';
  END IF;
  RETURN NULL;
END $$;
COMMENT ON FUNCTION goals.g625_sync_plan_after_goal_status() IS
  'G-638: pausiertes Ziel pausiert seinen aktiven Plan, Fortsetzen aktiviert den pausierten Plan, Abschluss schliesst jeden Planstatus.';
COMMIT;
