-- G-668: the capped historical target and the uncapped forward rate line
-- have different meanings. The forward line starts at today's trend.
BEGIN;
CREATE FUNCTION goals.plan_soll_vorwaerts_am(p_goal_id uuid,p_tag date)
RETURNS TABLE(wert numeric,rate_pct numeric,quelle text)
LANGUAGE sql STABLE SECURITY INVOKER SET search_path='' AS $$
  WITH basis AS (
    SELECT g.id,g.user_id,p.id AS plan_id,t.wert AS trend_kg,t.quelle AS trend_quelle,
      max(pos.projected_end_date) AS plan_ende
    FROM goals.user_goals g
    JOIN goals.goal_programs p ON p.goal_id=g.id AND p.status='aktiv'
    JOIN goals.goal_program_positions pos ON pos.program_id=p.id
    LEFT JOIN LATERAL goals.trendgewicht_am(g.user_id,CURRENT_DATE) t ON true
    WHERE g.id=p_goal_id AND g.user_id=auth.uid() AND g.status='active'
      AND g.goal_role='controlling' AND g.target_unit='kg'
    GROUP BY g.id,g.user_id,p.id,t.wert,t.quelle
  ), tage AS (
    SELECT b.id,d.tag::date AS tag,s.rate_pct,s.quelle
    FROM basis b
    CROSS JOIN LATERAL generate_series(
      CURRENT_DATE+1,least(p_tag,b.plan_ende),interval '1 day') d(tag)
    LEFT JOIN LATERAL goals.plan_soll_am(b.id,d.tag::date-1) s ON true
  ), faktor AS (
    SELECT t.id,count(*) FILTER (WHERE t.rate_pct IS NULL OR t.rate_pct<=-100)
      AS fehlende_rate,sum(ln(1+t.rate_pct/100)/7) AS log_faktor
    FROM tage t GROUP BY t.id
  )
  SELECT CASE WHEN b.trend_kg IS NULL OR coalesce(f.fehlende_rate,0)>0
      THEN NULL ELSE round(b.trend_kg*exp(coalesce(f.log_faktor,0)),3) END,
    rate.rate_pct,
    CASE WHEN b.trend_kg IS NOT NULL THEN
      'goals.trendgewicht_am:'||b.trend_quelle||'+'||rate.quelle END
  FROM basis b
  LEFT JOIN faktor f ON f.id=b.id
  LEFT JOIN LATERAL goals.plan_soll_am(b.id,p_tag) rate ON true
  WHERE p_tag BETWEEN CURRENT_DATE AND b.plan_ende;
$$;
REVOKE ALL ON FUNCTION goals.plan_soll_vorwaerts_am(uuid,date) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION goals.plan_soll_vorwaerts_am(uuid,date)
  TO authenticated,service_role;
COMMENT ON FUNCTION goals.plan_soll_vorwaerts_am(uuid,date) IS
  'G-668: forward uncapped target from today''s trend and position rates; plan_soll_am remains the capped historical target used for Lage.';

CREATE FUNCTION goals.planlinien_am(p_goal_id uuid,p_tag date)
RETURNS jsonb LANGUAGE sql STABLE SECURITY INVOKER SET search_path='' AS $$
  SELECT jsonb_build_object(
    'tag',p_tag,
    'historisch_kg',h.wert,'historisch_quelle',h.quelle,
    'historisch_bedeutung','gedeckelter Sollweg seit Zielbeginn für die Lage',
    'vorwaerts_kg',v.wert,'vorwaerts_quelle',v.quelle,
    'vorwaerts_bedeutung','ab heutigem Trend mit den Raten der Planpositionen',
    'rate_pct_woche',v.rate_pct)
  FROM goals.user_goals g
  LEFT JOIN LATERAL goals.plan_soll_am(g.id,p_tag) h ON true
  LEFT JOIN LATERAL goals.plan_soll_vorwaerts_am(g.id,p_tag) v ON true
  WHERE g.id=p_goal_id AND g.user_id=auth.uid();
$$;
REVOKE ALL ON FUNCTION goals.planlinien_am(uuid,date) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION goals.planlinien_am(uuid,date)
  TO authenticated,service_role;
COMMIT;
