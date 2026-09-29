-- G-514: Zwei vorhandene Tagesscores werden in den gemeinsamen Vertrag
-- uebersetzt. Die Funktionen rechnen keinen neuen Score und schreiben nur
-- Tage ab Zielbeginn bis zum ausdruecklichen Stichtag.

BEGIN;

CREATE FUNCTION goals.refresh_recovery_contributions(
  p_user_id uuid,
  p_stichtag date
)
RETURNS integer
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_rows integer;
BEGIN
  IF p_user_id IS NULL OR p_stichtag IS NULL THEN
    RAISE EXCEPTION 'refresh_recovery_contributions: Nutzer und Stichtag sind Pflicht'
      USING ERRCODE = '22004';
  END IF;

  INSERT INTO goals.goal_contributions (
    goal_id,
    user_id,
    contribution_date,
    module,
    contribution_score,
    missing_reason,
    details
  )
  SELECT
    g.id,
    g.user_id,
    s.entry_date,
    'recovery',
    s.score,
    NULL,
    jsonb_build_object(
      'recovery_score', s.score,
      'sleep_quality_score', s.sleep_quality_score,
      'sleep_duration_score', s.sleep_duration_score,
      'subjective_feeling_score', s.subjective_feeling_score,
      'soreness_score', s.soreness_score,
      'training_load_score', s.training_load_score,
      'nutrition_score', s.nutrition_score,
      'mood_score', s.mood_score,
      'sleep_hours_used', s.sleep_hours_used,
      'algorithm_version', s.algorithm_version,
      'measurement_source', s.measurement_source
    )
  FROM goals.user_goals g
  JOIN recovery.scores s
    ON s.user_id = g.user_id
   AND s.entry_date >= g.gueltig_ab
   AND s.entry_date <= p_stichtag
  WHERE g.user_id = p_user_id
    AND g.status = 'active'
  ON CONFLICT (goal_id, module, contribution_date) DO UPDATE
  SET
    user_id = EXCLUDED.user_id,
    contribution_score = EXCLUDED.contribution_score,
    missing_reason = EXCLUDED.missing_reason,
    details = EXCLUDED.details,
    updated_at = now();

  GET DIAGNOSTICS v_rows = ROW_COUNT;
  RETURN v_rows;
END;
$$;

CREATE FUNCTION goals.refresh_supplement_contributions(
  p_user_id uuid,
  p_stichtag date
)
RETURNS integer
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_rows integer;
BEGIN
  IF p_user_id IS NULL OR p_stichtag IS NULL THEN
    RAISE EXCEPTION 'refresh_supplement_contributions: Nutzer und Stichtag sind Pflicht'
      USING ERRCODE = '22004';
  END IF;

  INSERT INTO goals.goal_contributions (
    goal_id,
    user_id,
    contribution_date,
    module,
    contribution_score,
    missing_reason,
    details
  )
  SELECT
    g.id,
    g.user_id,
    s.intake_date,
    'supplements',
    s.compliance_pct,
    CASE
      WHEN s.compliance_pct IS NULL THEN 'keine_entschiedene_einnahme'
      ELSE NULL
    END,
    jsonb_build_object(
      'compliance_score', s.compliance_pct,
      'items_taken', s.total_taken,
      'items_scheduled', s.total_logged,
      'items_skipped', s.total_skipped,
      'items_snoozed', s.total_snoozed,
      'items_planned', s.total_planned
    )
  FROM goals.user_goals g
  JOIN supplements.daily_intake_summary s
    ON s.user_id = g.user_id
   AND s.intake_date >= g.gueltig_ab
   AND s.intake_date <= p_stichtag
  WHERE g.user_id = p_user_id
    AND g.status = 'active'
  ON CONFLICT (goal_id, module, contribution_date) DO UPDATE
  SET
    user_id = EXCLUDED.user_id,
    contribution_score = EXCLUDED.contribution_score,
    missing_reason = EXCLUDED.missing_reason,
    details = EXCLUDED.details,
    updated_at = now();

  GET DIAGNOSTICS v_rows = ROW_COUNT;
  RETURN v_rows;
END;
$$;

REVOKE ALL ON FUNCTION goals.refresh_recovery_contributions(uuid, date)
  FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION goals.refresh_supplement_contributions(uuid, date)
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION goals.refresh_recovery_contributions(uuid, date)
  TO service_role;
GRANT EXECUTE ON FUNCTION goals.refresh_supplement_contributions(uuid, date)
  TO service_role;

COMMENT ON FUNCTION goals.refresh_recovery_contributions(uuid, date) IS
  'G-514: uebernimmt vorhandene recovery.scores fuer aktive Ziele ab Zielbeginn bis zum Stichtag; keine neue Score-Rechnung.';
COMMENT ON FUNCTION goals.refresh_supplement_contributions(uuid, date) IS
  'G-514: uebernimmt supplements.daily_intake_summary fuer aktive Ziele ab Zielbeginn bis zum Stichtag; 0 bleibt Wert, NULL bekommt einen Grund.';

COMMIT;
