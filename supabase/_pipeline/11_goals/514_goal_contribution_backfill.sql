-- G-514: Einmaliger Nachzug der zwei Module, die bereits einen Tagesscore
-- liefern koennen. Die Rechnung bleibt in den Quellmodulen; dieser Schritt
-- ruft nur die beiden service-role-Schreibwege auf.

DO $$
DECLARE
  v_user record;
BEGIN
  FOR v_user IN
    SELECT DISTINCT source_users.user_id
    FROM (
      SELECT s.user_id
      FROM recovery.scores s
      WHERE s.entry_date <= CURRENT_DATE
      UNION
      SELECT s.user_id
      FROM supplements.daily_intake_summary s
      WHERE s.intake_date <= CURRENT_DATE
    ) source_users
    JOIN goals.user_goals g
      ON g.user_id = source_users.user_id
     AND g.status = 'active'
    WHERE source_users.user_id IS NOT NULL
    ORDER BY source_users.user_id
  LOOP
    PERFORM goals.refresh_recovery_contributions(
      v_user.user_id,
      CURRENT_DATE
    );
    PERFORM goals.refresh_supplement_contributions(
      v_user.user_id,
      CURRENT_DATE
    );
  END LOOP;
END;
$$;
