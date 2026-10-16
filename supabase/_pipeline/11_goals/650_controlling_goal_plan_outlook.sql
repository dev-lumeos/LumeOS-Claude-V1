-- G-650 Korrektur: Planpositionen bestimmen Soll und geplantes Erreichen.
BEGIN;

CREATE OR REPLACE FUNCTION goals.controlling_goal_outlook(
  p_goal_id uuid, p_stichtag date DEFAULT CURRENT_DATE
)
RETURNS jsonb
LANGUAGE sql STABLE SECURITY INVOKER SET search_path='' AS $$
  WITH goal AS (
    SELECT g.id,g.user_id,g.title,g.gueltig_ab,g.target_date,
      g.start_value,g.target_value,g.target_unit,
      least(p_stichtag,CURRENT_DATE,
        coalesce(s.frozen_on,p_stichtag)) AS stichtag,s.state
    FROM goals.user_goals g
    JOIN LATERAL goals.goal_state_at(g.id,least(p_stichtag,CURRENT_DATE)) s
      ON true
    WHERE g.id=p_goal_id AND g.goal_role='controlling'
      AND g.user_id=auth.uid() AND p_stichtag IS NOT NULL
      AND g.gueltig_ab<=least(p_stichtag,CURRENT_DATE)
  ),
  measured AS (
    SELECT g.*,now_weight.wert AS trend_kg,
      now_weight.quelle AS trend_quelle,
      now_weight.letzte_messung_am AS trend_messung_am,
      earlier.wert AS trend_4w_zuvor,
      earlier.quelle AS trend_4w_quelle
    FROM goal g
    LEFT JOIN LATERAL goals.trendgewicht_am(g.user_id,g.stichtag)
      now_weight ON true
    LEFT JOIN LATERAL goals.trendgewicht_am(g.user_id,g.stichtag-28)
      earlier ON g.stichtag-28>=g.gueltig_ab
  ),
  figures AS (
    SELECT m.*,
      coalesce(m.target_unit='kg' AND m.start_value IS NOT NULL
        AND m.target_value IS NOT NULL
        AND m.target_value<>m.start_value
        ,false) AS has_line,
      CASE WHEN m.trend_quelle='trend_ema'
          AND m.trend_4w_quelle='trend_ema'
        THEN (m.trend_kg-m.trend_4w_zuvor)/4 END AS pace_4w_raw
    FROM measured m
  ),
  calculated AS (
    SELECT f.*,
      CASE WHEN f.has_line THEN round(
        coalesce(f.trend_kg,now_plan.wert)*now_plan.rate_pct/100,3)
        END AS target_per_week,
      CASE WHEN f.trend_kg IS NOT NULL THEN now_plan.quelle
        ||'+goals.trendgewicht_am:'||f.trend_quelle
        ELSE now_plan.quelle END AS plan_quelle,
      goals.plan_zieldatum(f.id) AS plan_datum,
      CASE WHEN f.has_line AND f.trend_kg IS NOT NULL THEN
        greatest(0::numeric,
          (f.target_value-f.trend_kg)*sign(f.target_value-f.start_value))
        END AS remaining_raw
    FROM figures f
    LEFT JOIN LATERAL goals.plan_soll_am(f.id,f.stichtag) now_plan ON true
  ),
  forecast AS (
    -- Mehr als zehn Jahre aus einem Vierwochentempo sind keine brauchbare
    -- Datumsprognose; der Leser liefert dann einen ausdruecklichen Grund.
    SELECT c.*,
      CASE WHEN c.remaining_raw>0
          AND c.pace_4w_raw*sign(c.target_value-c.start_value)>0
        THEN ceil(c.remaining_raw/abs(c.pace_4w_raw)*7) END AS days_to_target
    FROM calculated c
  ),
  weeks AS (
    SELECT f.*,w.week_start,
      least(w.week_start+6,f.stichtag) AS week_end,
      wt.wert AS week_trend,wt.quelle AS week_trend_source,
      wt.letzte_messung_am AS week_last_measurement,
      intake.log_days,intake.kcal_days,intake.average_kcal,
      CASE WHEN f.has_line THEN plan_week.wert END AS week_target,
      plan_week.quelle AS week_target_source
    FROM forecast f
    CROSS JOIN LATERAL generate_series(
      date_trunc('week',f.gueltig_ab)::date,f.stichtag,interval '7 days'
    ) AS series(day)
    CROSS JOIN LATERAL (SELECT series.day::date AS week_start) w
    LEFT JOIN LATERAL goals.trendgewicht_am(
      f.user_id,least(w.week_start+6,f.stichtag)) wt ON true
    LEFT JOIN LATERAL goals.plan_soll_am(
      f.id,least(w.week_start+6,f.stichtag)) plan_week ON true
    LEFT JOIN LATERAL (
      SELECT count(*) FILTER (WHERE d.item_count>0)::integer AS log_days,
        count(*) FILTER (WHERE d.item_count>0 AND d.enercc IS NOT NULL
          AND d.enercc_missing=0)::integer AS kcal_days,
        round(avg(d.enercc) FILTER (WHERE d.item_count>0
          AND d.enercc_missing=0),1) AS average_kcal
      FROM nutrition.daily_summary d
      WHERE d.user_id=f.user_id
        AND d.entry_date BETWEEN greatest(w.week_start,f.gueltig_ab)
          AND least(w.week_start+6,f.stichtag)
    ) intake ON true
  ),
  week_deltas AS (
    SELECT w.*,
      lag(w.week_trend) OVER (ORDER BY w.week_start) AS previous_trend,
      lag(w.week_trend_source) OVER (ORDER BY w.week_start)
        AS previous_trend_source,
      lag(w.week_target) OVER (ORDER BY w.week_start) AS previous_target
    FROM weeks w
  ),
  week_array AS (
    SELECT coalesce(jsonb_agg(jsonb_build_object(
      'woche_ab',week_start,'woche_bis',week_end,
      'vollstaendig',week_end=week_start+6,
      'trend_kg',week_trend,
      'trend_quelle',CASE WHEN week_trend IS NOT NULL
        THEN 'goals.trendgewicht_am:'||week_trend_source END,
      'trend_messung_am',week_last_measurement,
      'soll_kg',week_target,
      'soll_quelle',week_target_source,
      'trend_delta_kg',CASE WHEN previous_trend IS NOT NULL
        AND week_trend IS NOT NULL THEN round(week_trend-previous_trend,3) END,
      'trend_delta_quelle',CASE WHEN previous_trend IS NOT NULL
        AND week_trend IS NOT NULL THEN 'goals.trendgewicht_am:'
          ||previous_trend_source||'/'||week_trend_source END,
      'soll_delta_kg',CASE WHEN week_target IS NOT NULL THEN
        round(week_target-coalesce(previous_target,start_value),3) END,
      'soll_delta_quelle',week_target_source,
      'durchschnitt_kcal',average_kcal,
      'kcal_quelle','nutrition.daily_summary.enercc:vollstaendige_logtage',
      'kcal_logtage',kcal_days,
      'logtage',log_days,
      'logtage_quelle','nutrition.daily_summary.item_count',
      'anpassung_kcal',NULL,
      'anpassung_quelle','G-627 ausstehend'
    ) ORDER BY week_start),'[]'::jsonb) AS items
    FROM week_deltas
  )
  SELECT jsonb_build_object(
    'goal_id',f.id,'stichtag',f.stichtag,'zielstatus',f.state,
    'wochen',wa.items,
    'kennzahlen',jsonb_build_object(
      'start_kg',f.start_value,'start_quelle','goals.user_goals.start_value',
      'ziel_kg',f.target_value,'ziel_quelle','goals.user_goals.target_value',
      'trend_kg',f.trend_kg,
      'trend_quelle',CASE WHEN f.trend_kg IS NOT NULL THEN
        'goals.trendgewicht_am:'||f.trend_quelle END,
      'veraenderung_gesamt_kg',CASE WHEN f.trend_kg IS NOT NULL
        AND f.start_value IS NOT NULL THEN round(f.trend_kg-f.start_value,3) END,
      'veraenderung_quelle',CASE WHEN f.trend_kg IS NOT NULL
        AND f.start_value IS NOT NULL THEN
        'goals.user_goals.start_value+goals.trendgewicht_am:'||f.trend_quelle END,
      'tempo_4w_kg_pro_woche',round(f.pace_4w_raw,3),
      'tempo_4w_quelle',CASE WHEN f.pace_4w_raw IS NOT NULL THEN
        'goals.trendgewicht_am:trend_ema/28_tage' END,
      'soll_kg_pro_woche',f.target_per_week,
      'soll_quelle',f.plan_quelle,
      'verbleibend_kg',round(f.remaining_raw,3),
      'verbleibend_quelle',CASE WHEN f.remaining_raw IS NOT NULL THEN
        'goals.user_goals.target_value+goals.trendgewicht_am:'||f.trend_quelle END,
      'fortschritt_pct',CASE WHEN f.has_line AND f.trend_kg IS NOT NULL
        THEN round(least(100::numeric,greatest(0::numeric,
          (f.trend_kg-f.start_value)/(f.target_value-f.start_value)*100)),1) END,
      'fortschritt_quelle',CASE WHEN f.has_line AND f.trend_kg IS NOT NULL
        THEN 'goals.user_goals:start_value,target_value+goals.trendgewicht_am:'
          ||f.trend_quelle END
    ),
    'prognose',jsonb_build_object(
      'plan_datum',f.plan_datum,
      'plan_quelle',CASE WHEN f.plan_datum IS NOT NULL THEN
        (SELECT quelle FROM goals.plan_soll_am(f.id,f.plan_datum)) END,
      'status',CASE WHEN f.state='active' AND f.has_line
          AND f.trend_kg IS NOT NULL
          AND (f.remaining_raw=0 OR (f.days_to_target>0
            AND f.days_to_target<=3650)) THEN 'datum'
        ELSE 'nicht_absehbar' END,
      'datum',CASE WHEN f.state='active' AND f.has_line
          AND f.trend_kg IS NOT NULL
          AND f.remaining_raw=0 THEN f.stichtag
        WHEN f.state='active' AND f.days_to_target BETWEEN 1 AND 3650
          THEN f.stichtag+f.days_to_target::integer END,
      'grund',CASE
        WHEN f.state<>'active' THEN 'ziel_nicht_aktiv'
        WHEN NOT f.has_line THEN 'kein_gewichts_ziel'
        WHEN f.trend_kg IS NULL THEN 'keine_gewichtsmessung'
        WHEN f.remaining_raw=0 THEN NULL
        WHEN f.pace_4w_raw IS NULL THEN 'zu_wenig_trenddaten'
        WHEN f.pace_4w_raw*sign(f.target_value-f.start_value)<=0
          THEN 'tempo_entgegen_ziel'
        WHEN f.days_to_target>3650 THEN 'tempo_zu_gering'
        ELSE NULL END,
      'quelle',CASE WHEN f.pace_4w_raw IS NOT NULL THEN
        'goals.trendgewicht_am:trend_ema/28_tage+goals.user_goals.target_value' END
    )
  )
  FROM forecast f CROSS JOIN week_array wa;
$$;

REVOKE ALL ON FUNCTION goals.controlling_goal_outlook(uuid,date)
  FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION goals.controlling_goal_outlook(uuid,date)
  TO authenticated;
COMMENT ON FUNCTION goals.controlling_goal_outlook(uuid,date) IS
  'G-650: Wochenverlauf und Prognose eines eigenen Steuerziels; nur belegte Messungen und vollstaendige kcal-Logtage, Anpassung bis G-627 NULL.';

COMMIT;
