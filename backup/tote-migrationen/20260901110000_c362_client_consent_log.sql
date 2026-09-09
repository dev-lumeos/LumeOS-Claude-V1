-- C-362/E-20: Zweckgebundene Einwilligungsereignisse, ohne Dialog oder
-- Schreibpfad. OAuth und Berechtigungs-Aenderungsprotokolle bleiben getrennt.

BEGIN;

CREATE TABLE IF NOT EXISTS coach.client_consent_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_type text NOT NULL,
  recipient_id uuid,
  purpose_code text NOT NULL,
  policy_version text NOT NULL,
  event_kind text NOT NULL,
  revokes_consent_id uuid REFERENCES coach.client_consent_log(id) ON DELETE RESTRICT,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT client_consent_log_recipient_check CHECK (
    (recipient_type = 'lumeos' AND recipient_id IS NULL)
    OR (recipient_type = 'coach' AND recipient_id IS NOT NULL)
  ),
  CONSTRAINT client_consent_log_purpose_check CHECK (
    purpose_code ~ '^[a-z][a-z0-9_]*$'
  ),
  CONSTRAINT client_consent_log_policy_version_check CHECK (
    length(trim(policy_version)) > 0
  ),
  CONSTRAINT client_consent_log_event_check CHECK (
    (event_kind = 'granted' AND revokes_consent_id IS NULL)
    OR (event_kind = 'revoked' AND revokes_consent_id IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS client_consent_log_client_purpose_idx
  ON coach.client_consent_log (client_id, purpose_code, recorded_at DESC);
CREATE INDEX IF NOT EXISTS client_consent_log_coach_recipient_idx
  ON coach.client_consent_log (recipient_id, recorded_at DESC)
  WHERE recipient_type = 'coach';

REVOKE ALL ON coach.client_consent_log FROM PUBLIC;
REVOKE ALL ON coach.client_consent_log FROM anon;
REVOKE ALL ON coach.client_consent_log FROM authenticated;
REVOKE ALL ON coach.client_consent_log FROM service_role;
GRANT SELECT ON coach.client_consent_log TO authenticated;
GRANT SELECT, INSERT ON coach.client_consent_log TO service_role;

ALTER TABLE coach.client_consent_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS client_consent_log_client_select ON coach.client_consent_log;
CREATE POLICY client_consent_log_client_select ON coach.client_consent_log
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = client_id);

DROP POLICY IF EXISTS client_consent_log_coach_select ON coach.client_consent_log;
CREATE POLICY client_consent_log_coach_select ON coach.client_consent_log
  FOR SELECT TO authenticated
  USING (
    recipient_type = 'coach'
    AND (SELECT auth.uid()) = recipient_id
  );

COMMENT ON TABLE coach.client_consent_log IS
  'C-362/E-20: Append-only Protokoll von Einwilligung und Widerruf je Klient, Empfaenger, Zweck und Fassung. OAuth und Rechteaenderungen sind andere Vorgange.';
COMMENT ON COLUMN coach.client_consent_log.recipient_type IS
  'Empfaenger der Einwilligung: lumeos fuer eigene Zwecke oder coach fuer Coach-Datenzugang.';
COMMENT ON COLUMN coach.client_consent_log.purpose_code IS
  'Maschinenlesbarer, zweckgebundener Code; E-20 nutzt mealcam_analysis und mealcam_model_improvement getrennt.';
COMMENT ON COLUMN coach.client_consent_log.revokes_consent_id IS
  'Bei event_kind=revoked die referenzierte Erteilung; eine erneute Einwilligung ist ein neues granted-Ereignis.';

COMMIT;
