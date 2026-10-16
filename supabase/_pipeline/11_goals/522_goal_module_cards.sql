-- G-522: vier Kacheln aus geschriebenen Beitraegen, mit Herkunft und
-- ausdruecklichem Grund fuer fehlende Werte.
BEGIN;

CREATE OR REPLACE FUNCTION goals.goal_module_cards_at(
  p_goal_id uuid,p_stichtag date DEFAULT CURRENT_DATE
) RETURNS jsonb LANGUAGE sql STABLE SECURITY INVOKER SET search_path='' AS $$
  WITH ziel AS (
    SELECT g.*,
      least(p_stichtag,coalesce(s.frozen_on,p_stichtag)) AS bis,
      CASE WHEN g.goal_type='performance' THEN 'performance_strength'
        WHEN g.goal_type='body_composition' AND (
          g.subtype IN ('cut','fat_loss','body_fat')
          OR g.target_value<g.start_value) THEN 'body_composition_loss'
        WHEN g.goal_type='body_composition' THEN 'body_composition_gain'
        ELSE 'health' END AS goal_kind
    FROM goals.user_goals g
    LEFT JOIN LATERAL goals.goal_state_at(g.id,p_stichtag) s ON true
    WHERE g.id=p_goal_id AND g.user_id=auth.uid()
      AND p_stichtag IS NOT NULL AND p_stichtag<=CURRENT_DATE
  ), sieben_tage AS (
    SELECT c.* FROM goals.goal_contributions c JOIN ziel z ON z.id=c.goal_id
    WHERE c.contribution_date BETWEEN z.bis-6 AND z.bis
  ), mittel AS (
    SELECT module,round(avg(contribution_score),1) AS wert,
      count(contribution_score)::integer AS tage
    FROM sieben_tage GROUP BY module
  ), letzte AS (
    SELECT DISTINCT ON (module) module,contribution_score,missing_reason,
      details,contribution_date
    FROM sieben_tage ORDER BY module,contribution_date DESC
  ), kacheln AS (
    SELECT z.goal_kind,z.bis,
      jsonb_build_object(
        'wert',n.wert,'einheit','%',
        'tage',coalesce(n.tage,0),
        'grund',CASE WHEN n.wert IS NULL THEN
          coalesce(n_last.missing_reason,'kein_kalorienlog') END,
        'quelle','goals.goal_contributions:nutrition.daily_summary+goals.berechne_zielwerte',
        'zeitraum','7_tage') AS nutrition,
      jsonb_build_object(
        'wert',(t_last.details->>'sessions_week')::integer,
        'wochenziel',(t_last.details->>'weekly_target')::numeric,
        'score',t_last.contribution_score,
        'grund',CASE WHEN t_last.contribution_score IS NULL THEN
          coalesce(t_last.missing_reason,'kein_wochenziel') END,
        'quelle','goals.goal_contributions:training.workout_sessions+goals.user_goals',
        'zeitraum','diese_woche') AS training,
      jsonb_build_object(
        'wert',r.wert,'tage',coalesce(r.tage,0),
        'schlaf_stunden',(
          SELECT round(avg((c.details->>'sleep_hours_used')::numeric),1)
          FROM sieben_tage c WHERE c.module='recovery'
            AND jsonb_typeof(c.details->'sleep_hours_used')='number'),
        'grund',CASE WHEN r.wert IS NULL THEN
          coalesce(r_last.missing_reason,'kein_recovery_score') END,
        'quelle','goals.goal_contributions:recovery.scores',
        'zeitraum','7_tage') AS recovery,
      jsonb_build_object(
        'wert',su.wert,'einheit','%',
        'tage',coalesce(su.tage,0),
        'grund',CASE WHEN su.wert IS NULL THEN
          coalesce(su_last.missing_reason,'keine_entschiedene_einnahme') END,
        'quelle','goals.goal_contributions:supplements.daily_intake_summary',
        'zeitraum','7_tage') AS supplements
    FROM ziel z
    LEFT JOIN mittel n ON n.module='nutrition'
    LEFT JOIN mittel r ON r.module='recovery'
    LEFT JOIN mittel su ON su.module='supplements'
    LEFT JOIN letzte n_last ON n_last.module='nutrition'
    LEFT JOIN letzte r_last ON r_last.module='recovery'
    LEFT JOIN letzte su_last ON su_last.module='supplements'
    LEFT JOIN letzte t_last ON t_last.module='training'
      AND t_last.contribution_date>=date_trunc('week',z.bis)::date
  ), engpass AS (
    SELECT k.*,
      goals.goal_bottleneck(k.goal_kind,jsonb_build_object(
        'nutrition',k.nutrition->'wert',
        'training',k.training->'score',
        'recovery',k.recovery->'wert',
        'supplements',k.supplements->'wert')) AS fund
    FROM kacheln k
  )
  SELECT jsonb_build_object(
    'stand_am',e.bis,
    'nutrition',e.nutrition,'training',e.training,
    'recovery',e.recovery,'supplements',e.supplements,
    'engpass_grund',CASE WHEN e.fund IS NOT NULL THEN NULL
      WHEN e.nutrition->>'wert' IS NULL AND e.training->>'score' IS NULL
        AND e.recovery->>'wert' IS NULL
        AND e.supplements->>'wert' IS NULL THEN 'keine_modulwerte'
      ELSE 'kein_deutlicher_engpass' END,
    'engpass',CASE WHEN e.fund IS NULL THEN NULL ELSE
      e.fund || jsonb_build_object('grund',CASE e.fund->>'module'
        WHEN 'recovery' THEN 'Recovery-Score Ø '
          ||replace(coalesce(e.recovery->>'wert','?'),'.',',')
          ||'; Schlaf Ø '
          ||replace(coalesce(e.recovery->>'schlaf_stunden','?'),'.',',')||' h'
        WHEN 'nutrition' THEN 'Kalorien-Treue Ø '
          ||replace(coalesce(e.nutrition->>'wert','?'),'.',',')||' %'
        WHEN 'training' THEN 'Training '
          ||coalesce(e.training->>'wert','?')||' / '
          ||coalesce(e.training->>'wochenziel','?')||' Einheiten'
        WHEN 'supplements' THEN 'Einnahme-Treue Ø '
          ||replace(coalesce(e.supplements->>'wert','?'),'.',',')||' %' END)
      END)
  FROM engpass e;
$$;
REVOKE ALL ON FUNCTION goals.goal_module_cards_at(uuid,date)
  FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION goals.goal_module_cards_at(uuid,date)
  TO authenticated,service_role;
COMMENT ON FUNCTION goals.goal_module_cards_at(uuid,date) IS
  'G-522: Kalorien-Treue, Trainingswoche, Recovery und Supplements mit Nullgruenden; Engpass nach SCORING.md.';

COMMIT;
