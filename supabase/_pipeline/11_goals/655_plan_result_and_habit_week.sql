-- G-655: Abgeschlossene Plaene benennen ihr Ergebnis; Wochengewohnheiten
-- zeigen den Wochenstand und die Serie statt eines Tempo-Ausblicks.
BEGIN;

ALTER TABLE goals.goal_programs
  ADD COLUMN ergebnis text
  CHECK (ergebnis IS NULL OR
    (status='abgeschlossen' AND ergebnis IN
      ('erreicht','termin_gehalten','beendet')));

UPDATE goals.goal_programs p SET ergebnis=CASE p.name
    WHEN 'Frühjahrs-Cut 2026' THEN 'erreicht'
    WHEN 'Contest Prep 2025' THEN 'termin_gehalten' END
FROM goals.user_goals g JOIN auth.users u ON u.id=g.user_id
WHERE p.goal_id=g.id AND p.status='abgeschlossen'
  AND p.ergebnis IS NULL
  AND p.name IN ('Frühjahrs-Cut 2026','Contest Prep 2025')
  AND u.email IN ('dev@lumeos.app','test-user@lumeos.local');

CREATE FUNCTION goals.goal_plan_result_at(p_plan_id uuid)
RETURNS jsonb LANGUAGE sql STABLE SECURITY INVOKER SET search_path='' AS $$
  SELECT jsonb_build_object('status',p.status,'ergebnis',p.ergebnis,
    'grund',CASE WHEN p.status='abgeschlossen' AND p.ergebnis IS NULL
      THEN 'ergebnis_nicht_erfasst' END,
    'quelle','goals.goal_programs.ergebnis')
  FROM goals.goal_programs p
  WHERE p.id=p_plan_id AND p.user_id=auth.uid();
$$;
REVOKE ALL ON FUNCTION goals.goal_plan_result_at(uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION goals.goal_plan_result_at(uuid)
  TO authenticated,service_role;

ALTER FUNCTION goals.measurement_goal_week_at(uuid,date)
  RENAME TO measurement_goal_week_at_g655_basis;
CREATE FUNCTION goals.measurement_goal_week_at(
  p_goal_id uuid,p_stichtag date DEFAULT CURRENT_DATE
) RETURNS jsonb LANGUAGE sql STABLE SECURITY INVOKER SET search_path='' AS $$
  SELECT CASE WHEN g.measurement_rhythm='weekly' THEN
    basis.wert || jsonb_build_object(
      'tempo_pro_woche',NULL,'tempo_quelle',NULL,
      'prognose_status',NULL,'prognose_datum',NULL,'prognose_quelle',NULL,
      'wochenstand',w.observed_value,'wochenziel',g.target_value,
      'serie',w.streak_weeks,
      'wochen_quelle','goals.measurement_weeks')
    ELSE basis.wert END
  FROM goals.user_goals g
  CROSS JOIN LATERAL (SELECT goals.measurement_goal_week_at_g655_basis(
    p_goal_id,p_stichtag) AS wert) basis
  LEFT JOIN LATERAL (
    SELECT mw.observed_value,mw.streak_weeks
    FROM goals.measurement_weeks(g.id,p_stichtag) mw
    WHERE mw.week_start=date_trunc('week',p_stichtag)::date
    LIMIT 1
  ) w ON g.measurement_rhythm='weekly'
  WHERE g.id=p_goal_id AND g.user_id=auth.uid()
    AND p_stichtag IS NOT NULL AND p_stichtag<=CURRENT_DATE;
$$;
REVOKE ALL ON FUNCTION goals.measurement_goal_week_at(uuid,date)
  FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION goals.measurement_goal_week_at(uuid,date)
  TO authenticated,service_role;
COMMENT ON FUNCTION goals.measurement_goal_week_at(uuid,date) IS
  'G-655: wiederkehrende Messziele zeigen den Wochenstand und die Serie; Tempo und Prognose gelten nur fuer einmalige Messziele.';

COMMIT;
