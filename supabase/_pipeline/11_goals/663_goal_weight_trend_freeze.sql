-- G-663: Ein steuerndes Gewichtsziel erreicht sein Ziel erst mit einem
-- belegten EMA-Trend. Messziele behalten ihre Rohpunkte als Zielnachweis.
BEGIN;

CREATE OR REPLACE FUNCTION goals.goal_state_at(
  p_goal_id uuid,p_stichtag date DEFAULT CURRENT_DATE)
RETURNS TABLE (goal_id uuid,state text,reason text,frozen_on date,archived boolean)
LANGUAGE sql STABLE SECURITY INVOKER SET search_path='' AS $$
  SELECT g.id,
    CASE WHEN g.status IN ('achieved','missed','abandoned')
      OR hit.measured_on IS NOT NULL OR g.target_date<p_stichtag
      THEN 'eingefroren' ELSE g.status END,
    CASE WHEN g.status='achieved' THEN 'erreicht'
      WHEN g.status='missed' THEN 'frist_abgelaufen'
      WHEN g.status='abandoned' THEN 'beendet'
      WHEN hit.measured_on IS NOT NULL THEN 'erreicht'
      WHEN g.target_date<p_stichtag THEN 'frist_abgelaufen' END,
    CASE WHEN g.status='missed'
      THEN coalesce(g.achievement_date,g.target_date,g.updated_at::date)
      WHEN g.status IN ('achieved','abandoned')
      THEN coalesce(g.achievement_date,g.updated_at::date,g.target_date)
      ELSE coalesce(hit.measured_on,g.target_date) END,
    g.archived_at IS NOT NULL
  FROM goals.user_goals g
  LEFT JOIN LATERAL (
    SELECT min(mp.measured_on) AS measured_on
    FROM goals.measurement_points(g.id,least(p_stichtag,CURRENT_DATE,
      coalesce(g.target_date,p_stichtag))) mp
    WHERE NOT (g.goal_role='controlling' AND
      g.goal_type='body_composition' AND g.target_unit='kg')
      AND g.measurement_rhythm IS DISTINCT FROM 'weekly'
      AND g.target_value IS NOT NULL
      AND mp.measured_on>=g.gueltig_ab
      AND CASE
        WHEN g.better_direction='less' THEN mp.value<=g.target_value
        WHEN g.better_direction='more' THEN mp.value>=g.target_value
        WHEN g.start_value IS NOT NULL AND g.target_value<g.start_value
          THEN mp.value<=g.target_value
        ELSE mp.value>=g.target_value END
  ) raw_hit ON true
  LEFT JOIN LATERAL (
    SELECT min(d.measurement_date) AS measured_on
    FROM (
      SELECT DISTINCT bm.measurement_date
      FROM goals.body_measurements bm
      WHERE bm.user_id=g.user_id
        AND bm.measurement_date BETWEEN g.gueltig_ab AND
          least(p_stichtag,CURRENT_DATE,
            coalesce(g.target_date,p_stichtag))
        -- Vor der ersten Rohmessung jenseits des Ziels kann die EMA
        -- mathematisch nicht auf die Zielseite gelangen.
        AND bm.measurement_date >= (
          SELECT min(x.measurement_date)
          FROM goals.body_measurements x
          WHERE x.user_id=g.user_id
            AND x.measurement_date BETWEEN g.gueltig_ab AND
              least(p_stichtag,CURRENT_DATE,
                coalesce(g.target_date,p_stichtag))
            AND CASE WHEN g.better_direction='less' OR
                (g.better_direction IS NULL AND g.start_value>g.target_value)
              THEN x.weight_kg<=g.target_value
              ELSE x.weight_kg>=g.target_value END)
    ) d
    JOIN LATERAL goals.trendgewicht_am(g.user_id,d.measurement_date) trend
      ON trend.quelle='trend_ema'
    WHERE g.goal_role='controlling' AND g.goal_type='body_composition'
      AND g.target_unit='kg' AND g.measurement_rhythm IS DISTINCT FROM 'weekly'
      AND g.target_value IS NOT NULL
      AND CASE WHEN g.better_direction='less' OR
          (g.better_direction IS NULL AND g.start_value>g.target_value)
        THEN trend.wert<=g.target_value
        ELSE trend.wert>=g.target_value END
  ) trend_hit ON true
  CROSS JOIN LATERAL (SELECT CASE WHEN g.goal_role='controlling' AND
      g.goal_type='body_composition' AND g.target_unit='kg'
    THEN trend_hit.measured_on ELSE raw_hit.measured_on END AS measured_on) hit
  WHERE g.id=p_goal_id AND g.gueltig_ab<=p_stichtag;
$$;

REVOKE ALL ON FUNCTION goals.goal_state_at(uuid,date) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION goals.goal_state_at(uuid,date)
  TO authenticated,service_role;
COMMENT ON FUNCTION goals.goal_state_at(uuid,date) IS
  'G-663: Steuernde kg-Ziele erreichen ihr Ziel am ersten belegten EMA-Trendtag; Messziele weiter am Rohwert.';
COMMIT;
