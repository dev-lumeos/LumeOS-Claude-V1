-- C-381: Strukturale Absicherung der Schreibnaht fuer Coach-Aktionen.
-- Der Ausfuehrer selbst liegt als Datenlogik in
-- _pipeline/15_coach/381_sichere_aktionsbestaetigung.sql.

BEGIN;

REVOKE UPDATE ON coach.pending_actions FROM authenticated;
DROP POLICY IF EXISTS pending_actions_update ON coach.pending_actions;

REVOKE INSERT, UPDATE ON coach.action_log FROM authenticated;
DROP POLICY IF EXISTS action_log_insert ON coach.action_log;
DROP POLICY IF EXISTS action_log_update ON coach.action_log;

COMMIT;
