-- =============================================================
-- 154 — Nachrichten und Alerts (F-07)
-- Datum: 2026-08-20
-- Zweck:
--   Nachrichten: der Kanal Coach <-> Klient. Der Vorgaenger hatte
--   den Chat als Tabelle ohne RLS bei GRANT an authenticated — jeder
--   angemeldete Nutzer haette jeden Chat gelesen (Spec-Befund N-20).
--   Hier: RLS beide Richtungen, sender als CHECK ans Paar gebunden.
--
--   Alerts: die Arbeitsliste des Coaches. BEWUSST OHNE SCHWEREGRAD:
--   ein Alert traegt Titel, Sachverhalt und die Zahlen dahinter
--   (metric), aber keine Stufe und keine Ampel — die Regel "Zahlen
--   ja, Urteile nein" gilt auch fuer die Arbeitsliste. Sortiert wird
--   nach Datum und Status. Ob Alerts je eine Dringlichkeit tragen,
--   gehoert zu T7 (Tom, offen).
--
--   Der Klient LIEST die Alerts ueber sich (Transparenz — dieselbe
--   Sichtbarkeit wie bei pending_actions und Historien aus 150).
-- =============================================================

BEGIN;

CREATE TABLE IF NOT EXISTS coach.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body text NOT NULL CHECK (length(btrim(body)) > 0),
  sent_at timestamptz NOT NULL DEFAULT now(),
  read_at timestamptz,
  CONSTRAINT messages_not_self_ck CHECK (coach_id <> client_id),
  CONSTRAINT messages_sender_ck CHECK (sender_id IN (coach_id, client_id))
);

COMMENT ON TABLE coach.messages IS
  'Nachrichten Coach <-> Klient. sender_id ist per CHECK ans Paar gebunden — kein Diskriminator-Raetsel wie im Vorgaenger (N-20).';

CREATE TABLE IF NOT EXISTS coach.alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module text NOT NULL CHECK (module IN (
    'nutrition', 'training', 'recovery', 'goals',
    'supplements', 'medical', 'buddy', 'general'
  )),
  title text NOT NULL,
  detail text,
  -- Die Zahlen hinter dem Alert, z. B. {"gewicht_delta_7d_kg": -2.1,
  -- "schwelle_kg": 1.5}. Fakten, keine Bewertung.
  metric jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(metric) = 'object'),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'read', 'done')),
  read_at timestamptz,
  done_at timestamptz,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT alerts_not_self_ck CHECK (coach_id <> client_id),
  CONSTRAINT alerts_done_ck CHECK (status <> 'done' OR done_at IS NOT NULL)
);

COMMENT ON TABLE coach.alerts IS
  'Arbeitsliste des Coaches: Sachverhalt plus Zahlen (metric), bewusst ohne Schweregrad und ohne Ampel — Dringlichkeitsstufen sind T7 (offen).';

CREATE INDEX IF NOT EXISTS messages_pair_sent_idx
  ON coach.messages(coach_id, client_id, sent_at DESC);
CREATE INDEX IF NOT EXISTS alerts_coach_status_idx
  ON coach.alerts(coach_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS alerts_client_idx
  ON coach.alerts(client_id, created_at DESC);

DROP TRIGGER IF EXISTS alerts_touch_updated_at ON coach.alerts;
CREATE TRIGGER alerts_touch_updated_at
  BEFORE UPDATE ON coach.alerts
  FOR EACH ROW EXECUTE FUNCTION coach.touch_updated_at();

GRANT SELECT, INSERT, UPDATE ON coach.messages TO authenticated;
GRANT SELECT, INSERT, UPDATE ON coach.alerts TO authenticated;
GRANT ALL ON coach.messages TO service_role;
GRANT ALL ON coach.alerts TO service_role;

ALTER TABLE coach.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach.alerts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS messages_select ON coach.messages;
DROP POLICY IF EXISTS messages_insert ON coach.messages;
DROP POLICY IF EXISTS messages_update ON coach.messages;
CREATE POLICY messages_select ON coach.messages
  FOR SELECT TO authenticated USING ((SELECT auth.uid()) IN (coach_id, client_id));
CREATE POLICY messages_insert ON coach.messages
  FOR INSERT TO authenticated WITH CHECK (
    (SELECT auth.uid()) = sender_id
    AND (SELECT auth.uid()) IN (coach_id, client_id)
  );
-- Update nur zum Lesen-Markieren durch die Empfaengerseite: wer NICHT
-- gesendet hat, darf die Zeile anfassen (read_at). Der Inhalt bleibt
-- dem Absender entzogen — Nachrichten werden nicht umgeschrieben.
CREATE POLICY messages_update ON coach.messages
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) IN (coach_id, client_id) AND (SELECT auth.uid()) <> sender_id)
  WITH CHECK ((SELECT auth.uid()) IN (coach_id, client_id) AND (SELECT auth.uid()) <> sender_id);

DROP POLICY IF EXISTS alerts_select ON coach.alerts;
DROP POLICY IF EXISTS alerts_insert ON coach.alerts;
DROP POLICY IF EXISTS alerts_update ON coach.alerts;
CREATE POLICY alerts_select ON coach.alerts
  FOR SELECT TO authenticated USING ((SELECT auth.uid()) IN (coach_id, client_id));
CREATE POLICY alerts_insert ON coach.alerts
  FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = coach_id);
CREATE POLICY alerts_update ON coach.alerts
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = coach_id)
  WITH CHECK ((SELECT auth.uid()) = coach_id);

DO $$
DECLARE
  v_tables integer;
  v_rls integer;
  v_policies integer;
BEGIN
  SELECT count(*) INTO v_tables
  FROM information_schema.tables
  WHERE table_schema = 'coach'
    AND table_name IN ('messages', 'alerts');

  IF v_tables <> 2 THEN
    RAISE EXCEPTION '154: % Tabellen statt 2', v_tables;
  END IF;

  SELECT count(*) INTO v_rls
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'coach'
    AND c.relname IN ('messages', 'alerts')
    AND c.relrowsecurity;

  IF v_rls <> 2 THEN
    RAISE EXCEPTION '154: % Tabellen mit RLS statt 2', v_rls;
  END IF;

  SELECT count(*) INTO v_policies
  FROM pg_policies
  WHERE schemaname = 'coach'
    AND tablename IN ('messages', 'alerts');

  IF v_policies <> 6 THEN
    RAISE EXCEPTION '154: % Policies statt 6', v_policies;
  END IF;

  RAISE NOTICE 'OK: Nachrichten und Alerts mit RLS, ohne Ampeln';
END $$;

COMMIT;
