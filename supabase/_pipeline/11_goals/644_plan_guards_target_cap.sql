-- G-644 Teil 2: Die Soll-Linie endet am Ziel; aktuelle Phasenwachen lesen Istwerte.
BEGIN;

CREATE OR REPLACE FUNCTION goals.plan_soll_am(p_goal_id uuid, p_tag date)
RETURNS TABLE (wert numeric, rate_pct numeric, quelle text)
LANGUAGE sql STABLE SECURITY INVOKER SET search_path='' AS $$
  WITH basis AS (
    SELECT CASE WHEN first_pos.von>g.gueltig_ab THEN anchor.wert
        ELSE g.start_value END AS start_value,
      g.start_value AS goal_start_value,g.target_value,
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
    SELECT b.start_value,b.goal_start_value,b.target_value,
      b.gueltig_ab,x.id,x.position,
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
  ), raw AS (
  SELECT b.start_value,b.goal_start_value,b.target_value,
    CASE WHEN b.start_value IS NULL
      OR count(*) FILTER (WHERE s.tage>0 AND s.rate IS NULL)>0
      THEN NULL ELSE round(b.start_value*exp(coalesce(sum(
        ln(1+s.rate/100)*s.tage/7.0),0)),3) END AS roh,
    CASE WHEN current_part.id IS NULL THEN 0 ELSE current_part.rate END AS rate,
    CASE WHEN current_part.id IS NULL THEN 'plan_luecke:erhaltung'
      ELSE 'plan_position:'||current_part.id::text END AS quelle
  FROM basis b LEFT JOIN segmente s ON true
  LEFT JOIN LATERAL (
    SELECT x.id,x.rate FROM segmente x
    WHERE x.von<=p_tag AND p_tag<x.bis
    ORDER BY x.position DESC LIMIT 1
  ) current_part ON true
  GROUP BY b.start_value,b.goal_start_value,b.target_value,
    current_part.id,current_part.rate
  )
  SELECT CASE WHEN r.target_value IS NULL OR r.goal_start_value IS NULL
      OR r.target_value=r.goal_start_value THEN r.roh
    WHEN r.target_value>r.goal_start_value
      THEN least(r.roh,r.target_value)
    ELSE greatest(r.roh,r.target_value) END,
    r.rate,r.quelle FROM raw r;
$$;

REVOKE ALL ON FUNCTION goals.plan_soll_am(uuid,date) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION goals.plan_soll_am(uuid,date) TO authenticated;

CREATE FUNCTION goals.goal_phase_guards_at(
  p_goal_id uuid,p_stichtag date DEFAULT CURRENT_DATE
) RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY INVOKER SET search_path='' AS $$
DECLARE v_phase goals.goal_phases%ROWTYPE; v_user uuid;
  v_strength numeric; v_strength_day date;
  v_trend_count integer; v_trend_behind integer; v_trend_ahead integer;
  v_fat numeric; v_fat_day date; v_fat_limit numeric;
  v_fat_direction text; v_sex text;
BEGIN
  SELECT ph.* INTO v_phase
  FROM goals.goal_phases ph JOIN goals.user_goals g ON g.id=ph.goal_id
  JOIN LATERAL goals.goal_state_at(g.id,p_stichtag) state
    ON state.state='active'
  WHERE ph.goal_id=p_goal_id AND g.user_id=auth.uid()
    AND g.status='active' AND ph.gueltig_ab<=p_stichtag
    AND (ph.actual_end_date IS NULL OR ph.actual_end_date>=p_stichtag)
  ORDER BY ph.gueltig_ab DESC LIMIT 1;
  IF NOT FOUND OR p_stichtag IS NULL OR p_stichtag>CURRENT_DATE THEN
    RETURN NULL;
  END IF;
  v_user := v_phase.user_id;
  WITH strength AS (
    SELECT we.exercise_id,
      max(ws.estimated_1rm) FILTER (WHERE s.session_date
        BETWEEN p_stichtag-28 AND p_stichtag-8) AS prior,
      max(ws.estimated_1rm) FILTER (WHERE s.session_date
        BETWEEN p_stichtag-7 AND p_stichtag) AS recent,
      max(s.session_date) FILTER (WHERE s.session_date
        BETWEEN p_stichtag-7 AND p_stichtag) AS recent_day
    FROM training.workout_sessions s
    JOIN training.workout_exercises we ON we.workout_session_id=s.id
    JOIN training.workout_sets ws ON ws.workout_exercise_id=we.id
    WHERE s.user_id=v_user AND s.status='completed'
      AND s.session_date BETWEEN p_stichtag-28 AND p_stichtag
      AND ws.estimated_1rm IS NOT NULL
    GROUP BY we.exercise_id
  )
  SELECT round((prior-recent)/prior*100,1),recent_day
    INTO v_strength,v_strength_day FROM strength
  WHERE prior>0 AND recent IS NOT NULL
  ORDER BY (prior-recent)/prior DESC LIMIT 1;
  SELECT count(*) FILTER (WHERE x.lage IS NOT NULL),
    count(*) FILTER (WHERE x.lage='hinterher'),
    count(*) FILTER (WHERE x.lage='voraus')
  INTO v_trend_count,v_trend_behind,v_trend_ahead
  FROM generate_series(0,2) n
  LEFT JOIN LATERAL (
    SELECT goals.controlling_goal_lage_at(p_goal_id,
      date_trunc('week',p_stichtag)::date-1-n*7)->>'lage' AS lage
  ) x ON true;
  SELECT body_fat_pct,measurement_date INTO v_fat,v_fat_day
  FROM goals.body_measurements
  WHERE user_id=v_user AND measurement_date<=p_stichtag
    AND body_fat_pct IS NOT NULL
  ORDER BY measurement_date DESC,measurement_time DESC,id DESC LIMIT 1;
  SELECT biological_sex INTO v_sex FROM public.profiles WHERE id=v_user;
  IF v_phase.strategie_code='contest_prep' THEN
    v_fat_limit := CASE WHEN v_sex='female' THEN 10 ELSE 5 END;
    v_fat_direction := 'min';
  ELSIF v_phase.phase_type='lean_bulk'
    OR v_phase.strategie_code IN ('lean_bulk','clean_bulk','aggressive_bulk') THEN
    v_fat_limit := 18;
    v_fat_direction := 'max';
  END IF;
  RETURN jsonb_build_array(
    jsonb_build_object('key','kraftverlust_4w',
      'status',CASE WHEN v_strength IS NULL THEN 'keine_daten'
        WHEN v_strength>10 THEN 'ausgeloest' ELSE 'ok' END,
      'wert_pct',v_strength,'grenze_pct',10,
      'quelle','training.workout_sets.estimated_1rm:28_tage',
      'stand_am',coalesce(v_strength_day,p_stichtag)),
    jsonb_build_object('key','trend_3w',
      'status',CASE WHEN v_trend_count<3 THEN 'keine_daten'
        WHEN v_trend_behind=3 OR v_trend_ahead=3 THEN 'ausgeloest'
        ELSE 'ok' END,
      'wochen_neben_soll',greatest(v_trend_behind,v_trend_ahead),
      'grenze_wochen',3,
      'quelle','goals.controlling_goal_lage_at:10_prozent_des_zielwegs',
      'stand_am',date_trunc('week',p_stichtag)::date-1),
    jsonb_build_object('key','koerperfett_grenze',
      'status',CASE WHEN v_fat_limit IS NULL THEN 'nicht_anwendbar'
        WHEN v_fat IS NULL THEN 'keine_daten'
        WHEN (v_fat_direction='max' AND v_fat>v_fat_limit)
          OR (v_fat_direction='min' AND v_fat<v_fat_limit)
          THEN 'ausgeloest' ELSE 'ok' END,
      'wert_pct',v_fat,'grenze_pct',v_fat_limit,
      'richtung',v_fat_direction,
      'quelle','goals.body_measurements.body_fat_pct',
      'stand_am',coalesce(v_fat_day,p_stichtag)));
END $$;
REVOKE ALL ON FUNCTION goals.goal_phase_guards_at(uuid,date)
  FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION goals.goal_phase_guards_at(uuid,date)
  TO authenticated,service_role;
COMMIT;
