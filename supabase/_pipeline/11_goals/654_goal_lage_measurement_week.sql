-- G-654: Planlage des Steuerziels und Wochenbewegung eines Messziels.
BEGIN;

CREATE FUNCTION goals.controlling_goal_lage_at(
  p_goal_id uuid,p_stichtag date DEFAULT CURRENT_DATE
) RETURNS jsonb LANGUAGE sql STABLE SECURITY INVOKER SET search_path='' AS $$
  WITH basis AS (
    SELECT g.id,g.start_value,g.target_value,
      t.wert AS trend_kg,t.quelle AS trend_art,
      s.wert AS soll_kg,s.quelle AS soll_art,
      abs(g.target_value-g.start_value)*0.10 AS toleranz_kg
    FROM goals.user_goals g
    JOIN LATERAL goals.goal_state_at(g.id,p_stichtag) state
      ON state.state='active'
    LEFT JOIN LATERAL goals.trendgewicht_am(g.user_id,p_stichtag) t ON true
    LEFT JOIN LATERAL goals.plan_soll_am(g.id,p_stichtag) s ON true
    WHERE g.id=p_goal_id AND g.user_id=auth.uid()
      AND g.goal_role='controlling' AND g.status='active'
      AND p_stichtag IS NOT NULL AND p_stichtag<=CURRENT_DATE
  ), wertung AS (
    SELECT b.*,(b.trend_kg-b.soll_kg)
      *sign(b.target_value-b.start_value) AS abweichung_kg
    FROM basis b
  )
  SELECT jsonb_build_object(
    'lage',CASE WHEN w.trend_art<>'trend_ema'
        OR w.trend_kg IS NULL OR w.soll_kg IS NULL
        OR w.toleranz_kg IS NULL OR w.toleranz_kg=0 THEN NULL
      WHEN w.abweichung_kg>w.toleranz_kg THEN 'voraus'
      WHEN w.abweichung_kg< -w.toleranz_kg THEN 'hinterher'
      ELSE 'im_plan' END,
    'trend_kg',w.trend_kg,
    'trend_quelle',CASE WHEN w.trend_kg IS NOT NULL
      THEN 'goals.trendgewicht_am:'||w.trend_art END,
    'soll_kg',w.soll_kg,'soll_quelle',w.soll_art,
    'abweichung_kg',round(w.abweichung_kg,3),
    'toleranz_kg',round(w.toleranz_kg,3),
    'toleranz_anteil',0.10,
    'toleranz_quelle','G-643:10_prozent_des_zielwegs',
    'stand_am',p_stichtag)
  FROM wertung w;
$$;
REVOKE ALL ON FUNCTION goals.controlling_goal_lage_at(uuid,date) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION goals.controlling_goal_lage_at(uuid,date)
  TO authenticated,service_role;

CREATE FUNCTION goals.measurement_goal_week_at(
  p_goal_id uuid,p_stichtag date DEFAULT CURRENT_DATE
) RETURNS jsonb LANGUAGE sql STABLE SECURITY INVOKER SET search_path='' AS $$
  WITH goal AS (
    SELECT g.*,
      date_trunc('week',p_stichtag)::date AS week_start
    FROM goals.user_goals g
    WHERE g.id=p_goal_id AND g.user_id=auth.uid()
      AND g.goal_role='measurement' AND p_stichtag IS NOT NULL
      AND p_stichtag<=CURRENT_DATE
  ), points AS (
    SELECT g.id,min(p.measured_on) AS first_day,
      max(p.measured_on) AS last_day
    FROM goal g LEFT JOIN LATERAL goals.measurement_points(
      g.id,p_stichtag) p ON p.measured_on>=p_stichtag-28
    GROUP BY g.id
  ), vals AS (
    SELECT g.id,g.target_value,g.target_date,g.start_value,
      g.measurement_rhythm,g.week_start,
      now_value.current_value AS current_value,
      now_value.current_source AS current_source,
      CASE WHEN g.measurement_rhythm='weekly'
        THEN before_week.current_value ELSE before_point.value END
        AS previous_value,
      first_point.value AS first_value,
      p.first_day,p.last_day
    FROM goal g JOIN points p ON p.id=g.id
    LEFT JOIN LATERAL goals.goal_progress_at(g.id,p_stichtag)
      now_value ON true
    LEFT JOIN LATERAL goals.goal_progress_at(g.id,g.week_start-1)
      before_week ON true
    LEFT JOIN LATERAL (
      SELECT mp.value FROM goals.measurement_points(g.id,g.week_start-1) mp
      ORDER BY CASE WHEN g.measurement_type IN
        ('e1rm','weight_reps','duration','distance') THEN mp.value END
          DESC NULLS LAST,
        CASE WHEN g.measurement_type='pace' THEN mp.value END
          ASC NULLS LAST,
        mp.measured_on DESC,mp.measured_time DESC NULLS LAST LIMIT 1
    ) before_point ON g.measurement_rhythm='once'
    LEFT JOIN LATERAL (
      SELECT mp.value FROM goals.measurement_points(g.id,p.first_day) mp
      WHERE mp.measured_on=p.first_day
      ORDER BY CASE WHEN g.measurement_type IN
        ('e1rm','weight_reps','duration','distance') THEN mp.value END
          DESC NULLS LAST,
        CASE WHEN g.measurement_type='pace' THEN mp.value END
          ASC NULLS LAST,
        mp.measured_time DESC NULLS LAST LIMIT 1
    ) first_point ON p.first_day IS NOT NULL
  ), figures AS (
    SELECT v.*,
      CASE WHEN v.measurement_rhythm='weekly'
        THEN v.current_value-v.previous_value
        WHEN v.first_day IS NOT NULL AND v.last_day-v.first_day>=7
        AND v.current_value IS NOT NULL AND v.first_value IS NOT NULL
        THEN (v.current_value-v.first_value)*7
          /(v.last_day-v.first_day) END AS pace_per_week,
      CASE WHEN v.target_date>=v.week_start
        AND v.previous_value IS NOT NULL
        THEN (v.target_value-v.previous_value)
          *least(7,v.target_date-v.week_start+1)
          /nullif(v.target_date-(v.week_start-1),0) END AS target_delta
    FROM vals v
  ), forecast AS (
    SELECT f.*,
      CASE WHEN f.measurement_rhythm='once'
        AND f.pace_per_week IS NOT NULL
        AND f.pace_per_week*sign(f.target_value-f.current_value)>0
        THEN ceil(abs(f.target_value-f.current_value)
          /abs(f.pace_per_week)*7) END AS days_remaining
    FROM figures f
  )
  SELECT jsonb_build_object(
    'woche_ab',f.week_start,'stand_am',p_stichtag,
    'ist',f.current_value,'ist_quelle',f.current_source,
    'delta_woche',round(f.current_value-f.previous_value,3),
    'delta_quelle',CASE WHEN f.current_value IS NOT NULL
      AND f.previous_value IS NOT NULL THEN 'goals.goal_progress_at' END,
    'soll_delta_woche',round(f.target_delta,3),
    'soll_quelle',CASE WHEN f.target_delta IS NOT NULL THEN
      'goals.user_goals.target_date,target_value+goals.goal_progress_at'
      END,
    'tempo_pro_woche',round(f.pace_per_week,3),
    'tempo_quelle',CASE WHEN f.pace_per_week IS NOT NULL
      THEN CASE WHEN f.measurement_rhythm='weekly'
        THEN 'goals.measurement_weeks:vorwoche'
        ELSE 'goals.measurement_points:28_tage' END END,
    'prognose_status',CASE WHEN f.days_remaining BETWEEN 0 AND 3650
      THEN 'datum' ELSE 'nicht_absehbar' END,
    'prognose_datum',CASE WHEN f.days_remaining BETWEEN 0 AND 3650
      THEN p_stichtag+f.days_remaining::integer END,
    'prognose_quelle',CASE WHEN f.pace_per_week IS NOT NULL
      AND f.measurement_rhythm='once'
      THEN 'goals.measurement_points:28_tage' END)
  FROM forecast f;
$$;
REVOKE ALL ON FUNCTION goals.measurement_goal_week_at(uuid,date) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION goals.measurement_goal_week_at(uuid,date)
  TO authenticated,service_role;
COMMIT;
