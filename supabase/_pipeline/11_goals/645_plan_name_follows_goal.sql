-- G-645: automatisch vergebene Plannamen folgen dem Titel ihres Ziels.
BEGIN;

ALTER TABLE goals.goal_programs
  ADD COLUMN name_is_custom boolean NOT NULL DEFAULT false;

-- Nur die bekannte dev-Abweichung stammt von der spaeteren Ziel-Umbenennung.
-- Andere bestehende Abweichungen gelten als bewusst vergebene Plannamen.
DO $g645_backfill$
DECLARE v_dev_goal uuid := 'dc5f4d6f-9df0-45f4-bbf8-f1e0620ef50b';
  v_dev_plan uuid := '62500000-0000-0000-0000-000000000903';
BEGIN
  IF EXISTS (
    SELECT 1 FROM goals.goal_programs p
    JOIN goals.user_goals g ON g.id=p.goal_id
    WHERE p.id=v_dev_plan AND (
      p.goal_id<>v_dev_goal
      OR p.name NOT IN ('Lean Bulk bis September','Lean Bulk auf 88 kg')
      OR g.title NOT IN ('Lean Bulk bis September','Lean Bulk auf 88 kg'))
  ) THEN
    RAISE EXCEPTION 'G645_BACKFILL: dev-Plan weicht vom gemessenen Bestand ab';
  END IF;

  UPDATE goals.goal_programs p SET name_is_custom=true
  FROM goals.user_goals g
  WHERE p.goal_id=g.id AND p.name IS DISTINCT FROM g.title
    AND p.id<>v_dev_plan;

  UPDATE goals.goal_programs p SET name=g.title
  FROM goals.user_goals g
  WHERE p.id=v_dev_plan AND p.goal_id=v_dev_goal
    AND p.name='Lean Bulk bis September'
    AND g.title='Lean Bulk auf 88 kg';
END $g645_backfill$;

CREATE FUNCTION goals.g645_mark_custom_plan_name()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE v_title text;
BEGIN
  SELECT title INTO v_title FROM goals.user_goals WHERE id=NEW.goal_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'G645_PLAN: Ziel des Plans fehlt' USING ERRCODE='23503';
  END IF;
  NEW.name_is_custom := NEW.name IS DISTINCT FROM v_title;
  RETURN NEW;
END $$;
CREATE TRIGGER g645_mark_custom_plan_name
  BEFORE INSERT OR UPDATE OF goal_id,name,name_is_custom ON goals.goal_programs
  FOR EACH ROW EXECUTE FUNCTION goals.g645_mark_custom_plan_name();

CREATE FUNCTION goals.g645_sync_plan_name_from_goal()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
BEGIN
  UPDATE goals.goal_programs
  SET name=NEW.title
  WHERE goal_id=NEW.id AND name_is_custom=false;
  RETURN NEW;
END $$;
CREATE TRIGGER g645_sync_plan_name_from_goal
  AFTER UPDATE OF title ON goals.user_goals
  FOR EACH ROW WHEN (OLD.title IS DISTINCT FROM NEW.title)
  EXECUTE FUNCTION goals.g645_sync_plan_name_from_goal();

REVOKE ALL ON FUNCTION goals.g645_mark_custom_plan_name()
  FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION goals.g645_sync_plan_name_from_goal()
  FROM PUBLIC,anon,authenticated;
COMMENT ON COLUMN goals.goal_programs.name_is_custom IS
  'G-645: Ein selbst vergebener Name bleibt bei Ziel-Umbenennung erhalten.';

COMMIT;
