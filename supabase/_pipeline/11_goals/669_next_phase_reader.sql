-- G-669: expose a recommendation only when the existing transition rule
-- has recorded a program and a reason on the running phase.
BEGIN;
CREATE FUNCTION goals.goal_als_naechstes(p_goal_id uuid,p_stichtag date DEFAULT CURRENT_DATE)
RETURNS jsonb LANGUAGE sql STABLE SECURITY INVOKER SET search_path='' AS $$
  SELECT jsonb_build_object(
    'startdatum',ph.projected_end_date+1,
    'programm',ph.recommended_next,
    'dauer_wochen',strategy.max_duration_weeks,
    'grund',ph.transition_reason,
    'quelle','goals.goal_phases.recommended_next+transition_reason;goals.goal_strategies.max_duration_weeks')
  FROM goals.user_goals g
  JOIN goals.goal_phases ph ON ph.goal_id=g.id AND ph.gueltig_ab<=p_stichtag
    AND ph.actual_end_date IS NULL
  JOIN goals.goal_strategies strategy ON strategy.code=ph.recommended_next
  WHERE g.id=p_goal_id AND g.user_id=auth.uid() AND g.status='active'
    AND g.goal_role='controlling' AND p_stichtag<=CURRENT_DATE
    AND ph.recommended_next IS NOT NULL
    AND nullif(btrim(ph.transition_reason),'') IS NOT NULL
    AND ph.projected_end_date IS NOT NULL
    AND strategy.max_duration_weeks IS NOT NULL
  ORDER BY ph.gueltig_ab DESC LIMIT 1;
$$;
REVOKE ALL ON FUNCTION goals.goal_als_naechstes(uuid,date) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION goals.goal_als_naechstes(uuid,date)
  TO authenticated,service_role;
COMMENT ON FUNCTION goals.goal_als_naechstes(uuid,date) IS
  'G-669: read the recorded transition recommendation; NULL if the rule has not recorded program, reason, end date or catalog duration.';
COMMIT;
