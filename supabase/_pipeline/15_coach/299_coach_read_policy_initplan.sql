-- C-299: Die Freigabe wird je Abfrage als Unterabfrage materialisiert,
-- nicht fuer jede Zeile ueber coach.hat_sicht() aufgerufen.
-- SECURITY INVOKER bleibt erhalten: RLS auf coach.client_permissions
-- begrenzt die Unterabfrage weiterhin auf die eigenen Coach-Freigaben.

BEGIN;

DROP POLICY IF EXISTS intake_logs_coach_read ON supplements.intake_logs;
CREATE POLICY intake_logs_coach_read ON supplements.intake_logs
  FOR SELECT TO authenticated USING (
    user_id IN (
      SELECT p.client_id
      FROM coach.client_permissions p
      WHERE p.coach_id = (SELECT auth.uid())
        AND (p.expires_at IS NULL OR p.expires_at > now())
        AND p.supplements_visibility = 'full'
    )
  );

DROP POLICY IF EXISTS user_stacks_coach_read ON supplements.user_stacks;
CREATE POLICY user_stacks_coach_read ON supplements.user_stacks
  FOR SELECT TO authenticated USING (
    user_id IN (
      SELECT p.client_id
      FROM coach.client_permissions p
      WHERE p.coach_id = (SELECT auth.uid())
        AND (p.expires_at IS NULL OR p.expires_at > now())
        AND p.supplements_visibility = 'full'
    )
  );

DROP POLICY IF EXISTS lab_result_values_coach_read ON medical.lab_result_values;
CREATE POLICY lab_result_values_coach_read ON medical.lab_result_values
  FOR SELECT TO authenticated USING (
    user_id IN (
      SELECT p.client_id
      FROM coach.client_permissions p
      WHERE p.coach_id = (SELECT auth.uid())
        AND (p.expires_at IS NULL OR p.expires_at > now())
        AND p.medical_visibility = 'full'
    )
  );

DROP POLICY IF EXISTS user_medications_coach_read ON medical.user_medications;
CREATE POLICY user_medications_coach_read ON medical.user_medications
  FOR SELECT TO authenticated USING (
    user_id IN (
      SELECT p.client_id
      FROM coach.client_permissions p
      WHERE p.coach_id = (SELECT auth.uid())
        AND (p.expires_at IS NULL OR p.expires_at > now())
        AND p.medical_visibility = 'full'
    )
  );

DROP POLICY IF EXISTS user_conditions_coach_read ON medical.user_conditions;
CREATE POLICY user_conditions_coach_read ON medical.user_conditions
  FOR SELECT TO authenticated USING (
    user_id IN (
      SELECT p.client_id
      FROM coach.client_permissions p
      WHERE p.coach_id = (SELECT auth.uid())
        AND (p.expires_at IS NULL OR p.expires_at > now())
        AND p.medical_visibility = 'full'
    )
  );

COMMIT;
