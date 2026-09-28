-- G-524: Der spaeter aufgerufene service_role-Schreibweg steht getrennt von
-- der Strukturmigration. Beim Anlegen der Funktion wird keine Historie
-- geschrieben; erst ein ausdruecklicher Aufruf erzeugt den Reihenwert.

BEGIN;

CREATE FUNCTION goals.record_adaptive_tdee(
  p_user_id uuid,
  p_stichtag date DEFAULT CURRENT_DATE,
  p_window_days integer DEFAULT 14
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_result record;
  v_previous record;
  v_id uuid;
BEGIN
  SELECT * INTO STRICT v_result
  FROM goals.adaptive_tdee(p_user_id, p_stichtag, p_window_days);

  SELECT * INTO STRICT v_previous
  FROM goals.tdee_previous_value(
    p_user_id,
    p_stichtag,
    p_window_days,
    v_result.formula_tdee_kcal
  );

  INSERT INTO goals.tdee_history (
    user_id,
    stichtag,
    window_days,
    complete_intake_days,
    weight_measurement_count,
    weight_start_kg,
    weight_end_kg,
    weight_delta_kg,
    measurement_span_days,
    avg_intake_kcal,
    formula_tdee_kcal,
    raw_tdee_kcal,
    previous_tdee_kcal,
    previous_source,
    adaptive_tdee_kcal,
    delta_to_formula_kcal,
    alpha,
    confidence,
    reliable,
    status,
    method
  ) VALUES (
    v_result.user_id,
    v_result.period_end,
    v_result.window_days,
    v_result.complete_intake_days,
    v_result.weight_measurement_count,
    v_result.weight_start_kg,
    v_result.weight_end_kg,
    v_result.weight_delta_kg,
    v_result.measurement_span_days,
    v_result.avg_intake_kcal,
    v_result.formula_tdee_kcal,
    v_result.raw_tdee_kcal,
    v_previous.previous_tdee_kcal,
    v_previous.previous_source,
    v_result.adaptive_tdee_kcal,
    v_result.delta_to_formula_kcal,
    v_result.alpha,
    v_result.confidence,
    v_result.reliable,
    v_result.status,
    v_result.method
  )
  ON CONFLICT (user_id, stichtag, window_days) DO UPDATE
  SET
    complete_intake_days = EXCLUDED.complete_intake_days,
    weight_measurement_count = EXCLUDED.weight_measurement_count,
    weight_start_kg = EXCLUDED.weight_start_kg,
    weight_end_kg = EXCLUDED.weight_end_kg,
    weight_delta_kg = EXCLUDED.weight_delta_kg,
    measurement_span_days = EXCLUDED.measurement_span_days,
    avg_intake_kcal = EXCLUDED.avg_intake_kcal,
    formula_tdee_kcal = EXCLUDED.formula_tdee_kcal,
    raw_tdee_kcal = EXCLUDED.raw_tdee_kcal,
    previous_tdee_kcal = EXCLUDED.previous_tdee_kcal,
    previous_source = EXCLUDED.previous_source,
    adaptive_tdee_kcal = EXCLUDED.adaptive_tdee_kcal,
    delta_to_formula_kcal = EXCLUDED.delta_to_formula_kcal,
    alpha = EXCLUDED.alpha,
    confidence = EXCLUDED.confidence,
    reliable = EXCLUDED.reliable,
    status = EXCLUDED.status,
    method = EXCLUDED.method
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

REVOKE ALL ON FUNCTION goals.record_adaptive_tdee(uuid, date, integer)
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION goals.record_adaptive_tdee(uuid, date, integer)
  TO service_role;

COMMENT ON FUNCTION goals.record_adaptive_tdee(uuid, date, integer) IS
  'Berechnet und speichert einen datierten TDEE-Reihenwert. Ausschliesslich service_role darf den Schreibweg aufrufen.';

COMMIT;
