-- =============================================================
-- 151 — Coach-Beziehung mit Anbahnung, Annahme und Ende (F-07)
-- Datum: 2026-08-20
-- Zweck:
--   Die Beziehung existierte bisher nur implizit als Zeile in
--   client_permissions/client_autonomy (Entwurf F-06, 3.2) — ohne
--   Status, ohne Anbahnung, ohne Ende. Der fehlende Beendigungspfad
--   war laut F-03 die groesste inhaltliche Luecke der Spec und fehlte
--   im Vorgaengerrepo genauso. Hier ist er von Anfang an dabei.
--
-- T3 (offen, Tom): Wer laedt wen ein? Die Vorlage kennt beide
--   Richtungen (Athlet "Invite coach", Portal "Invite new client").
--   Konservative Wahl bis zur Entscheidung: BEIDE Seiten duerfen die
--   Beziehung anlegen (invited_by = auth.uid()), die Annahme setzt
--   die Anwendung. Die Datenbank erzwingt nur Konsistenz je Status.
--
-- Kein DELETE: Beziehungen enden (status='ended'), sie verschwinden
--   nicht — die Historie schreibt ein Trigger, wie bei 150.
-- =============================================================

BEGIN;

CREATE TABLE IF NOT EXISTS coach.relationships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'invited' CHECK (status IN ('invited', 'active', 'ended')),
  invited_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  invite_note text,
  started_at timestamptz,
  ended_at timestamptz,
  ended_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  end_reason text,
  changed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT relationships_pair_uq UNIQUE (coach_id, client_id),
  CONSTRAINT relationships_not_self_ck CHECK (coach_id <> client_id),
  CONSTRAINT relationships_active_ck CHECK (
    status <> 'active' OR started_at IS NOT NULL
  ),
  CONSTRAINT relationships_ended_ck CHECK (
    status <> 'ended' OR (ended_at IS NOT NULL AND ended_by IS NOT NULL)
  )
);

COMMENT ON TABLE coach.relationships IS
  'Coach-Klient-Beziehung: invited -> active -> ended. Kein Loeschen, nur Beenden — die Historie schreibt der Trigger.';
COMMENT ON COLUMN coach.relationships.invited_by IS
  'Wer die Beziehung angelegt hat. T3 (Richtung der Einladung) ist offen; bis dahin duerfen beide Seiten anlegen.';

CREATE TABLE IF NOT EXISTS coach.relationship_change_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  relationship_id uuid REFERENCES coach.relationships(id) ON DELETE SET NULL,
  coach_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  changed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  changed_at timestamptz NOT NULL DEFAULT now(),
  change_kind text NOT NULL CHECK (change_kind IN ('insert', 'update', 'delete')),
  old_value jsonb,
  new_value jsonb
);

COMMENT ON TABLE coach.relationship_change_log IS
  'Append-only Historie der Beziehung — auch das Ende hat eine Spur.';

CREATE INDEX IF NOT EXISTS relationships_client_idx ON coach.relationships(client_id);
CREATE INDEX IF NOT EXISTS relationships_coach_status_idx ON coach.relationships(coach_id, status);
CREATE INDEX IF NOT EXISTS relationship_change_log_pair_idx
  ON coach.relationship_change_log(coach_id, client_id, changed_at DESC);

CREATE OR REPLACE FUNCTION coach.log_relationship_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO coach.relationship_change_log (
    relationship_id, coach_id, client_id, changed_by, change_kind, old_value, new_value
  )
  VALUES (
    COALESCE(NEW.id, OLD.id),
    COALESCE(NEW.coach_id, OLD.coach_id),
    COALESCE(NEW.client_id, OLD.client_id),
    COALESCE(auth.uid(), NEW.changed_by, OLD.changed_by),
    lower(TG_OP),
    CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END
  );

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS relationships_set_changed_by ON coach.relationships;
CREATE TRIGGER relationships_set_changed_by
  BEFORE INSERT OR UPDATE ON coach.relationships
  FOR EACH ROW EXECUTE FUNCTION coach.set_changed_by();

DROP TRIGGER IF EXISTS relationships_touch_updated_at ON coach.relationships;
CREATE TRIGGER relationships_touch_updated_at
  BEFORE UPDATE ON coach.relationships
  FOR EACH ROW EXECUTE FUNCTION coach.touch_updated_at();

DROP TRIGGER IF EXISTS relationships_change_log ON coach.relationships;
CREATE TRIGGER relationships_change_log
  AFTER INSERT OR UPDATE OR DELETE ON coach.relationships
  FOR EACH ROW EXECUTE FUNCTION coach.log_relationship_change();

GRANT SELECT, INSERT, UPDATE ON coach.relationships TO authenticated;
GRANT SELECT, INSERT ON coach.relationship_change_log TO authenticated;
GRANT ALL ON coach.relationships TO service_role;
GRANT ALL ON coach.relationship_change_log TO service_role;

ALTER TABLE coach.relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach.relationship_change_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS relationships_select ON coach.relationships;
DROP POLICY IF EXISTS relationships_insert ON coach.relationships;
DROP POLICY IF EXISTS relationships_update ON coach.relationships;
CREATE POLICY relationships_select ON coach.relationships
  FOR SELECT TO authenticated USING ((SELECT auth.uid()) IN (coach_id, client_id));
CREATE POLICY relationships_insert ON coach.relationships
  FOR INSERT TO authenticated WITH CHECK (
    (SELECT auth.uid()) IN (coach_id, client_id)
    AND invited_by = (SELECT auth.uid())
  );
CREATE POLICY relationships_update ON coach.relationships
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) IN (coach_id, client_id))
  WITH CHECK ((SELECT auth.uid()) IN (coach_id, client_id));

DROP POLICY IF EXISTS relationship_change_log_select ON coach.relationship_change_log;
DROP POLICY IF EXISTS relationship_change_log_insert ON coach.relationship_change_log;
CREATE POLICY relationship_change_log_select ON coach.relationship_change_log
  FOR SELECT TO authenticated USING ((SELECT auth.uid()) IN (coach_id, client_id));
CREATE POLICY relationship_change_log_insert ON coach.relationship_change_log
  FOR INSERT TO authenticated
  WITH CHECK (
    (SELECT auth.uid()) = changed_by
    AND (SELECT auth.uid()) IN (coach_id, client_id)
  );

DO $$
DECLARE
  v_tables integer;
  v_rls integer;
  v_policies integer;
BEGIN
  SELECT count(*) INTO v_tables
  FROM information_schema.tables
  WHERE table_schema = 'coach'
    AND table_name IN ('relationships', 'relationship_change_log');

  IF v_tables <> 2 THEN
    RAISE EXCEPTION '151: % Tabellen statt 2', v_tables;
  END IF;

  SELECT count(*) INTO v_rls
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'coach'
    AND c.relname IN ('relationships', 'relationship_change_log')
    AND c.relrowsecurity;

  IF v_rls <> 2 THEN
    RAISE EXCEPTION '151: % Tabellen mit RLS statt 2', v_rls;
  END IF;

  SELECT count(*) INTO v_policies
  FROM pg_policies
  WHERE schemaname = 'coach'
    AND tablename IN ('relationships', 'relationship_change_log');

  IF v_policies <> 5 THEN
    RAISE EXCEPTION '151: % Policies statt 5', v_policies;
  END IF;

  RAISE NOTICE 'OK: coach.relationships mit Ende, Historie und RLS';
END $$;

COMMIT;
