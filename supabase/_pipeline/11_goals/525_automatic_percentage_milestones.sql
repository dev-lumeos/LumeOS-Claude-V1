-- G-525: new goals receive four derived milestones. Existing goals are not
-- backfilled. Weight goals use trend weight when a threshold is evaluated.
BEGIN;
CREATE UNIQUE INDEX goal_milestones_derived_percentage_uq
  ON goals.goal_milestones(goal_id,threshold_pct)
  WHERE source='derived' AND milestone_type='percentage';

CREATE FUNCTION goals.g525_create_milestones()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
BEGIN
  IF NEW.target_value IS NULL THEN RETURN NEW; END IF;
  INSERT INTO goals.goal_milestones
    (goal_id,user_id,milestone_type,title,threshold_pct,status,
      auto_generated,source,source_detail)
  SELECT NEW.id,NEW.user_id,'percentage',
    CASE WHEN p=100 THEN 'Ziel' ELSE p::text||' %' END,p,'open',true,
    'derived','G-525'
  FROM unnest(ARRAY[25,50,75,100]) p
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END $$;
CREATE TRIGGER g525_create_milestones AFTER INSERT ON goals.user_goals
  FOR EACH ROW EXECUTE FUNCTION goals.g525_create_milestones();
REVOKE ALL ON FUNCTION goals.g525_create_milestones() FROM PUBLIC,anon,authenticated;

-- Generated thresholds alone are not a user history requiring delete consent.
DO $g525_delete$
DECLARE v_def text; v_old text; v_new text;
BEGIN
  v_def:=pg_get_functiondef('goals.goal_delete(uuid,boolean)'::regprocedure);
  v_old:='OR EXISTS (SELECT 1 FROM goals.goal_milestones WHERE goal_id=p_goal_id)';
  v_new:='OR EXISTS (SELECT 1 FROM goals.goal_milestones WHERE goal_id=p_goal_id AND source<>''derived'')';
  IF (length(v_def)-length(replace(v_def,v_old,'')))/length(v_old)<>1 THEN
    RAISE EXCEPTION 'G525_SCHEMA: goal_delete history guard differs';
  END IF;
  EXECUTE replace(v_def,v_old,v_new);
END $g525_delete$;

CREATE OR REPLACE FUNCTION goals.goal_milestone_status(
  p_milestone_id uuid,p_stichtag date DEFAULT CURRENT_DATE)
RETURNS TABLE (
  milestone_id uuid,goal_id uuid,user_id uuid,title text,
  milestone_type text,target_value numeric,target_unit text,
  target_date date,stored_status text,computed_status text,
  current_value numeric,current_source text,progress_pct numeric,
  progress_status text,source text,source_detail text)
LANGUAGE sql STABLE SECURITY INVOKER SET search_path='' AS $$
  WITH m AS (SELECT * FROM goals.goal_milestones WHERE id=p_milestone_id),
  g AS (SELECT ug.* FROM m JOIN goals.user_goals ug ON ug.id=m.goal_id),
  p AS (
    SELECT gp.progress_status,
      CASE WHEN g.target_unit='kg' AND g.goal_type='body_composition'
        THEN CASE WHEN trend.quelle='trend_ema' THEN trend.wert END
        ELSE gp.current_value END
        AS current_value,
      CASE WHEN g.target_unit='kg' AND g.goal_type='body_composition'
        THEN CASE WHEN trend.quelle='trend_ema'
          THEN 'goals.trendgewicht_am:trend_ema' END
        ELSE gp.current_source END AS current_source,
      CASE WHEN g.target_unit='kg' AND g.goal_type='body_composition'
        THEN CASE WHEN trend.quelle IS DISTINCT FROM 'trend_ema'
            OR g.start_value IS NULL
            OR g.target_value IS NULL OR g.start_value=g.target_value
            THEN NULL ELSE round(least(100,greatest(0,
              (trend.wert-g.start_value)/(g.target_value-g.start_value)*100)),1)
          END
        ELSE gp.progress_pct END AS progress_pct
    FROM g
    LEFT JOIN LATERAL goals.goal_progress_at(g.id,p_stichtag) gp ON true
    LEFT JOIN LATERAL goals.trendgewicht_am(g.user_id,p_stichtag) trend
      ON g.target_unit='kg' AND g.goal_type='body_composition'
  )
  SELECT m.id,m.goal_id,m.user_id,m.title,m.milestone_type,m.target_value,
    m.target_unit,m.target_date,m.status,
    CASE
      WHEN m.status IN ('achieved','missed','abandoned') THEN m.status
      WHEN m.milestone_type='percentage' AND p.progress_pct>=m.threshold_pct
        THEN 'achieved'
      WHEN m.milestone_type='percentage' AND p.progress_pct IS NOT NULL
        THEN 'open'
      WHEN p.progress_status IS DISTINCT FROM 'measured'
        THEN p.progress_status
      WHEN m.milestone_type='absolute_value' AND g.start_value IS NOT NULL
        AND g.target_value>=g.start_value
        AND p.current_value>=m.target_value THEN 'achieved'
      WHEN m.milestone_type='absolute_value' AND g.start_value IS NOT NULL
        AND g.target_value<g.start_value
        AND p.current_value<=m.target_value THEN 'achieved'
      WHEN m.target_date IS NOT NULL AND m.target_date<p_stichtag THEN 'missed'
      ELSE 'open' END,
    p.current_value,p.current_source,p.progress_pct,p.progress_status,
    m.source,m.source_detail
  FROM m JOIN g ON true LEFT JOIN p ON true;
$$;
REVOKE ALL ON FUNCTION goals.goal_milestone_status(uuid,date) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION goals.goal_milestone_status(uuid,date)
  TO authenticated,service_role;

CREATE FUNCTION goals.g525_sync_milestones(p_user_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
BEGIN
  IF auth.uid() IS DISTINCT FROM p_user_id THEN RETURN; END IF;
  WITH states AS (
    SELECT m.id,state.current_value
    FROM goals.goal_milestones m
    JOIN LATERAL goals.goal_milestone_status(m.id,CURRENT_DATE) state ON true
    WHERE m.user_id=p_user_id AND m.source='derived'
      AND m.milestone_type='percentage' AND m.status='open'
      AND state.computed_status='achieved'
  )
  UPDATE goals.goal_milestones m SET status='achieved',
    achieved_date=CURRENT_DATE,achieved_value=states.current_value
  FROM states WHERE m.id=states.id;
END $$;
REVOKE ALL ON FUNCTION goals.g525_sync_milestones(uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION goals.g525_sync_milestones(uuid)
  TO authenticated,service_role;

CREATE FUNCTION goals.g525_sync_from_measurement()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE v_user uuid;
BEGIN
  IF TG_TABLE_NAME='body_measurements' THEN
    v_user:=coalesce(NEW.user_id,OLD.user_id);
  ELSE
    SELECT s.user_id INTO v_user
    FROM training.workout_exercises we
    JOIN training.workout_sessions s ON s.id=we.workout_session_id
    WHERE we.id=coalesce(NEW.workout_exercise_id,OLD.workout_exercise_id);
  END IF;
  IF v_user IS NOT NULL THEN PERFORM goals.g525_sync_milestones(v_user); END IF;
  RETURN coalesce(NEW,OLD);
END $$;
CREATE TRIGGER g525_sync_body_milestones
  AFTER INSERT OR UPDATE ON goals.body_measurements
  FOR EACH ROW EXECUTE FUNCTION goals.g525_sync_from_measurement();
CREATE TRIGGER g525_sync_strength_milestones
  AFTER INSERT OR UPDATE ON training.workout_sets
  FOR EACH ROW EXECUTE FUNCTION goals.g525_sync_from_measurement();
REVOKE ALL ON FUNCTION goals.g525_sync_from_measurement()
  FROM PUBLIC,anon,authenticated;
COMMIT;
