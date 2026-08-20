-- =============================================================
-- 153 — Check-ins: Vorlagen und Instanzen (F-07)
-- Datum: 2026-08-20
-- Zweck:
--   Der Check-in-Review ist die gemessene Zeitsenke des Coach-Alltags
--   (F-04, 5.3: 2-3 gegen 10-15 Minuten je Klient). Der Vorgaenger
--   hatte den Kreislauf — und seine Auto-Analyse schrieb zwei
--   Spalten, die in keiner Migration existierten, verschluckt vom
--   catch{} (F-06, 5.1). Konsequenzen hier:
--
--   * Statusmaschine als CHECK, nicht als Konvention.
--   * KEINE persistierte Analyse: die deterministische Vorauswertung
--     rechnet die Anwendung beim Lesen aus auto_data/client_data —
--     eine reine, getestete Funktion. Kein Schema-Drift moeglich.
--   * Der Prefill (auto_data) entsteht in der Anwendung ueber die
--     summary-Funktionen aus 152 — er respektiert damit die
--     Sichtmatrix per Konstruktion: ein Modul auf none erscheint als
--     freigegeben=false, nie als leeres Feld.
--
-- T6 (offen, Tom): ob die Kadenz an der Autonomiestufe haengt.
--   Bis dahin ist cadence ein freies Attribut der Vorlage.
-- =============================================================

BEGIN;

CREATE TABLE IF NOT EXISTS coach.checkin_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  cadence text NOT NULL DEFAULT 'weekly' CHECK (cadence IN ('weekly', 'biweekly', 'monthly')),
  -- Felder, die der Klient ausfuellt: [{"key":"energie","label":"Energie (1-10)","typ":"zahl"}, ...]
  fields jsonb NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(fields) = 'array'),
  is_active boolean NOT NULL DEFAULT true,
  changed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT checkin_templates_not_self_ck CHECK (coach_id <> client_id),
  CONSTRAINT checkin_templates_name_uq UNIQUE (coach_id, client_id, name)
);

COMMENT ON TABLE coach.checkin_templates IS
  'Check-in-Vorlage je Coach-Klient-Paar: Feldliste und Kadenz. T6 (Kopplung an Autonomiestufe) ist offen.';

CREATE TABLE IF NOT EXISTS coach.checkins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id uuid REFERENCES coach.checkin_templates(id) ON DELETE SET NULL,
  due_date date NOT NULL,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'submitted', 'reviewed', 'missed')),
  -- Vom Portal beim Anlegen gefuellt, ueber coach.summary_* (152):
  -- je Modul das Aggregat oder {"freigegeben": false}.
  auto_data jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(auto_data) = 'object'),
  -- Die Antworten des Klienten auf die Template-Felder.
  client_data jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(client_data) = 'object'),
  client_note text,
  coach_feedback text,   -- geht an den Klienten
  coach_notes text,      -- intern; Trennung nach dem Vorgaenger-Muster (F-06, 5.1)
  submitted_at timestamptz,
  reviewed_at timestamptz,
  changed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT checkins_not_self_ck CHECK (coach_id <> client_id),
  CONSTRAINT checkins_submitted_ck CHECK (
    status NOT IN ('submitted', 'reviewed') OR submitted_at IS NOT NULL
  ),
  CONSTRAINT checkins_reviewed_ck CHECK (
    status <> 'reviewed' OR reviewed_at IS NOT NULL
  )
);

COMMENT ON TABLE coach.checkins IS
  'Check-in-Instanz: pending -> submitted -> reviewed (oder missed). Keine persistierte Analyse — die Vorauswertung rechnet die Anwendung beim Lesen.';
COMMENT ON COLUMN coach.checkins.coach_feedback IS
  'Antwort an den Klienten. coach_notes bleibt intern — zwei Felder, ein Unterschied.';

CREATE INDEX IF NOT EXISTS checkin_templates_pair_idx
  ON coach.checkin_templates(coach_id, client_id);
CREATE INDEX IF NOT EXISTS checkins_coach_status_idx
  ON coach.checkins(coach_id, status, due_date DESC);
CREATE INDEX IF NOT EXISTS checkins_client_idx
  ON coach.checkins(client_id, due_date DESC);

DROP TRIGGER IF EXISTS checkin_templates_set_changed_by ON coach.checkin_templates;
CREATE TRIGGER checkin_templates_set_changed_by
  BEFORE INSERT OR UPDATE ON coach.checkin_templates
  FOR EACH ROW EXECUTE FUNCTION coach.set_changed_by();

DROP TRIGGER IF EXISTS checkin_templates_touch_updated_at ON coach.checkin_templates;
CREATE TRIGGER checkin_templates_touch_updated_at
  BEFORE UPDATE ON coach.checkin_templates
  FOR EACH ROW EXECUTE FUNCTION coach.touch_updated_at();

DROP TRIGGER IF EXISTS checkins_set_changed_by ON coach.checkins;
CREATE TRIGGER checkins_set_changed_by
  BEFORE INSERT OR UPDATE ON coach.checkins
  FOR EACH ROW EXECUTE FUNCTION coach.set_changed_by();

DROP TRIGGER IF EXISTS checkins_touch_updated_at ON coach.checkins;
CREATE TRIGGER checkins_touch_updated_at
  BEFORE UPDATE ON coach.checkins
  FOR EACH ROW EXECUTE FUNCTION coach.touch_updated_at();

GRANT SELECT, INSERT, UPDATE, DELETE ON coach.checkin_templates TO authenticated;
GRANT SELECT, INSERT, UPDATE ON coach.checkins TO authenticated;
GRANT ALL ON coach.checkin_templates TO service_role;
GRANT ALL ON coach.checkins TO service_role;

ALTER TABLE coach.checkin_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach.checkins ENABLE ROW LEVEL SECURITY;

-- Vorlagen: Werkzeug des Coaches. Der Klient liest sie (er sieht,
-- was gefragt wird), aendern tut sie nur der Coach.
DROP POLICY IF EXISTS checkin_templates_select ON coach.checkin_templates;
DROP POLICY IF EXISTS checkin_templates_insert ON coach.checkin_templates;
DROP POLICY IF EXISTS checkin_templates_update ON coach.checkin_templates;
DROP POLICY IF EXISTS checkin_templates_delete ON coach.checkin_templates;
CREATE POLICY checkin_templates_select ON coach.checkin_templates
  FOR SELECT TO authenticated USING ((SELECT auth.uid()) IN (coach_id, client_id));
CREATE POLICY checkin_templates_insert ON coach.checkin_templates
  FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = coach_id);
CREATE POLICY checkin_templates_update ON coach.checkin_templates
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = coach_id)
  WITH CHECK ((SELECT auth.uid()) = coach_id);
CREATE POLICY checkin_templates_delete ON coach.checkin_templates
  FOR DELETE TO authenticated USING ((SELECT auth.uid()) = coach_id);

-- Instanzen: der Coach legt an (Portal), beide aktualisieren —
-- der Klient reicht ein (client_data, submitted), der Coach
-- antwortet (feedback, reviewed). Welche Felder wer schreibt,
-- diszipliniert die Anwendung; die Statuskonsistenz erzwingen die
-- CHECKs. Kein Loeschen: ein verpasster Check-in ist ein Befund.
DROP POLICY IF EXISTS checkins_select ON coach.checkins;
DROP POLICY IF EXISTS checkins_insert ON coach.checkins;
DROP POLICY IF EXISTS checkins_update ON coach.checkins;
CREATE POLICY checkins_select ON coach.checkins
  FOR SELECT TO authenticated USING ((SELECT auth.uid()) IN (coach_id, client_id));
CREATE POLICY checkins_insert ON coach.checkins
  FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = coach_id);
CREATE POLICY checkins_update ON coach.checkins
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) IN (coach_id, client_id))
  WITH CHECK ((SELECT auth.uid()) IN (coach_id, client_id));

DO $$
DECLARE
  v_tables integer;
  v_rls integer;
  v_policies integer;
BEGIN
  SELECT count(*) INTO v_tables
  FROM information_schema.tables
  WHERE table_schema = 'coach'
    AND table_name IN ('checkin_templates', 'checkins');

  IF v_tables <> 2 THEN
    RAISE EXCEPTION '153: % Tabellen statt 2', v_tables;
  END IF;

  SELECT count(*) INTO v_rls
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'coach'
    AND c.relname IN ('checkin_templates', 'checkins')
    AND c.relrowsecurity;

  IF v_rls <> 2 THEN
    RAISE EXCEPTION '153: % Tabellen mit RLS statt 2', v_rls;
  END IF;

  SELECT count(*) INTO v_policies
  FROM pg_policies
  WHERE schemaname = 'coach'
    AND tablename IN ('checkin_templates', 'checkins');

  IF v_policies <> 7 THEN
    RAISE EXCEPTION '153: % Policies statt 7', v_policies;
  END IF;

  RAISE NOTICE 'OK: Check-in-Vorlagen und -Instanzen mit Statusmaschine und RLS';
END $$;

COMMIT;
