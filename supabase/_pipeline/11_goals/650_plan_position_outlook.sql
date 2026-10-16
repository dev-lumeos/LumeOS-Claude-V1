-- G-650 Korrektur: Die Soll-Linie folgt den Positionen des aktiven Plans.
BEGIN;

CREATE OR REPLACE FUNCTION goals.plan_soll_am(p_goal_id uuid, p_tag date)
RETURNS TABLE (wert numeric, rate_pct numeric, quelle text)
LANGUAGE sql STABLE SECURITY INVOKER SET search_path='' AS $$
  WITH basis AS (
    SELECT CASE WHEN first_pos.von>g.gueltig_ab THEN anchor.wert
        ELSE g.start_value END AS start_value,
      greatest(g.gueltig_ab,first_pos.von) AS gueltig_ab,
      g.user_id,p.id AS plan_id
    FROM goals.user_goals g
    JOIN goals.goal_programs p ON p.goal_id=g.id AND p.status='aktiv'
    LEFT JOIN LATERAL (
      SELECT min(gueltig_ab) AS von FROM goals.goal_program_positions
      WHERE program_id=p.id
    ) first_pos ON true
    LEFT JOIN LATERAL goals.trendgewicht_am(g.user_id,first_pos.von)
      anchor ON first_pos.von>g.gueltig_ab
    WHERE g.id=p_goal_id AND g.user_id=auth.uid()
      AND g.target_unit='kg' AND g.start_value>0
      AND p_tag>=greatest(g.gueltig_ab,first_pos.von)
  ),
  positionen AS (
    SELECT b.start_value,b.gueltig_ab,x.id,x.position,
      greatest(b.gueltig_ab,coalesce(x.gueltig_ab,
        lag(x.projected_end_date+1) OVER (ORDER BY x.position),
        b.gueltig_ab)) AS von,
      coalesce(lead(x.gueltig_ab) OVER (ORDER BY x.position),
        CASE WHEN ph.id IS NOT NULL AND ph.actual_end_date IS NULL
          THEN greatest(coalesce(x.projected_end_date+1,p_tag+1),p_tag+1)
          ELSE coalesce(ph.actual_end_date+1,x.projected_end_date+1,
            x.gueltig_ab+x.duration_weeks*7) END) AS bis,
      coalesce(x.zielrate_pct_kg_woche,ph.zielrate_pct_kg_woche,
        s.weight_change_target_percent,
        round(coalesce((part.value->>'tdee_multiplier')::numeric-1,
          s.tdee_modifier)*t.tdee/(11*nullif(profile.body_weight_kg,0)),3),
        CASE WHEN x.richtung='halten' THEN 0 END) AS rate
    FROM basis b
    JOIN goals.goal_program_positions x ON x.program_id=b.plan_id
    LEFT JOIN goals.goal_phases ph ON ph.id=x.goal_phase_id
    LEFT JOIN goals.goal_strategies s ON s.code=x.strategie_code
    LEFT JOIN public.profiles profile ON profile.id=b.user_id
    LEFT JOIN LATERAL goals.tdee_basis_am(
      b.user_id,coalesce(x.gueltig_ab,b.gueltig_ab)) t ON true
    LEFT JOIN LATERAL jsonb_array_elements(s.sub_phases) part(value)
      ON part.value->>'name'=x.sub_phase_code
  ),
  segmente AS (
    SELECT p.*,
      greatest(0,least(p_tag+1,p.bis)-p.von) AS tage
    FROM positionen p WHERE p.von<=p_tag AND p.bis>p.von
  )
  SELECT CASE WHEN b.start_value IS NULL
      OR count(*) FILTER (WHERE s.tage>0 AND s.rate IS NULL)>0
      THEN NULL ELSE round(b.start_value*exp(coalesce(sum(
        ln(1+s.rate/100)*s.tage/7.0),0)),3) END,
    CASE WHEN current_part.id IS NULL THEN 0 ELSE current_part.rate END,
    CASE WHEN current_part.id IS NULL THEN 'plan_luecke:erhaltung'
      ELSE 'plan_position:'||current_part.id::text END
  FROM basis b LEFT JOIN segmente s ON true
  LEFT JOIN LATERAL (
    SELECT x.id,x.rate FROM segmente x
    WHERE x.von<=p_tag AND p_tag<x.bis
    ORDER BY x.position DESC LIMIT 1
  ) current_part ON true
  GROUP BY b.start_value,current_part.id,current_part.rate;
$$;

REVOKE ALL ON FUNCTION goals.plan_soll_am(uuid,date) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION goals.plan_soll_am(uuid,date) TO authenticated;

CREATE OR REPLACE FUNCTION goals.plan_zieldatum(p_goal_id uuid)
RETURNS date LANGUAGE sql STABLE SECURITY INVOKER SET search_path='' AS $$
  SELECT min(d.tag)::date
  FROM goals.user_goals g
  JOIN goals.goal_programs p ON p.goal_id=g.id AND p.status='aktiv'
  JOIN LATERAL (
    SELECT CASE WHEN bool_or(ph.id IS NOT NULL
      AND ph.actual_end_date IS NULL) THEN g.gueltig_ab+3650
      ELSE max(coalesce(pos.projected_end_date,
        pos.gueltig_ab+pos.duration_weeks*7-1)) END AS ende
    FROM goals.goal_program_positions pos
    LEFT JOIN goals.goal_phases ph ON ph.id=pos.goal_phase_id
    WHERE pos.program_id=p.id
  ) ende ON true
  CROSS JOIN LATERAL generate_series(g.gueltig_ab,
    least(ende.ende,g.gueltig_ab+3650),interval '1 day') AS d(tag)
  CROSS JOIN LATERAL goals.plan_soll_am(g.id,d.tag::date) soll
  WHERE g.id=p_goal_id AND g.user_id=auth.uid()
    AND g.target_unit='kg' AND g.target_value IS NOT NULL
    AND g.start_value IS NOT NULL
    AND (g.target_value-g.start_value)*(soll.wert-g.target_value)>=0;
$$;
REVOKE ALL ON FUNCTION goals.plan_zieldatum(uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION goals.plan_zieldatum(uuid) TO authenticated;
COMMIT;
