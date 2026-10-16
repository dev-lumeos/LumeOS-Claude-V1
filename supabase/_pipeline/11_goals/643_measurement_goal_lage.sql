-- G-643: Lage eines einmaligen Messziels entlang seiner eigenen Soll-Linie.
BEGIN;

ALTER FUNCTION goals.goal_progress_at(uuid,date)
  RENAME TO goal_progress_at_g643_basis;

CREATE FUNCTION goals.goal_progress_at(
  p_goal_id uuid, p_stichtag date DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  goal_id uuid, user_id uuid, goal_type text, subtype text, title text,
  target_value numeric, target_unit text, start_value numeric,
  current_value numeric, current_source text, progress_pct numeric,
  progress_status text, measured_at date, lage text
)
LANGUAGE sql STABLE SECURITY INVOKER SET search_path = '' AS $$
  SELECT p.goal_id,p.user_id,p.goal_type,p.subtype,p.title,p.target_value,
    p.target_unit,p.start_value,p.current_value,p.current_source,
    p.progress_pct,p.progress_status,p.measured_at,
    CASE
      WHEN g.goal_role <> 'measurement' OR g.measurement_rhythm <> 'once'
        OR p.progress_status = 'frozen'
        THEN NULL::text
      WHEN p.current_value IS NULL OR p.start_value IS NULL
        OR p.target_value IS NULL OR g.target_date IS NULL
        OR g.target_date <= coalesce(g.start_measured_at,g.gueltig_ab)
        OR p.target_value = p.start_value THEN 'offen'
      -- 0,10 des gesamten Zielwegs: dieselbe Toleranz fuer kg, %, cm und e1RM.
      -- Die Tagesstreuung einzelner Messungen soll nicht sofort die Lage kippen.
      WHEN (p.current_value-p.start_value)
        / (p.target_value-p.start_value)
        > least(1::numeric,greatest(0::numeric,
            (p_stichtag-coalesce(g.start_measured_at,g.gueltig_ab))::numeric
            / (g.target_date-coalesce(g.start_measured_at,g.gueltig_ab))::numeric)) + 0.10::numeric
        THEN 'voraus'
      WHEN (p.current_value-p.start_value)
        / (p.target_value-p.start_value)
        < least(1::numeric,greatest(0::numeric,
            (p_stichtag-coalesce(g.start_measured_at,g.gueltig_ab))::numeric
            / (g.target_date-coalesce(g.start_measured_at,g.gueltig_ab))::numeric)) - 0.10::numeric
        THEN 'hinterher'
      ELSE 'im_plan'
    END
  FROM goals.goal_progress_at_g643_basis(p_goal_id,p_stichtag) p
  JOIN goals.user_goals g ON g.id=p.goal_id;
$$;

REVOKE ALL ON FUNCTION goals.goal_progress_at(uuid,date) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION goals.goal_progress_at(uuid,date)
  TO authenticated,service_role;
COMMENT ON FUNCTION goals.goal_progress_at(uuid,date) IS
  'G-643: Istwert und Lage einmaliger Messziele; Toleranz 10 Prozentpunkte des Zielwegs.';

COMMIT;
