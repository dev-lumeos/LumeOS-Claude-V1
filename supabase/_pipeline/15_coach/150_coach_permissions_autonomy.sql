-- =============================================================
-- 150 — Coach-Rechte und Autonomy (C-119)
-- Datum: 2026-08-20
-- Zweck:
--   Permissions: Der Nutzer setzt, was ein Coach sehen darf und ob
--   der Coach je Modul ohne Bestaetigung aendern darf.
--   Autonomy: Der Coach setzt den Reifegrad seines Athleten je Modul.
--
-- Nicht gebaut:
--   Keine Coach-Portal-Oberflaeche, keine Autonomy-Wirkung, keine
--   automatische Ausfuehrung von Pending Actions.
-- =============================================================

BEGIN;

CREATE SCHEMA IF NOT EXISTS coach;

CREATE OR REPLACE FUNCTION coach.touch_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION coach.set_changed_by()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  NEW.changed_by := COALESCE(auth.uid(), NEW.changed_by);
  RETURN NEW;
END;
$$;

CREATE TABLE IF NOT EXISTS coach.client_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nutrition_visibility text NOT NULL DEFAULT 'none',
  training_visibility text NOT NULL DEFAULT 'none',
  recovery_visibility text NOT NULL DEFAULT 'none',
  goals_visibility text NOT NULL DEFAULT 'none',
  supplements_visibility text NOT NULL DEFAULT 'none',
  medical_visibility text NOT NULL DEFAULT 'none',
  buddy_visibility text NOT NULL DEFAULT 'none',
  nutrition_auto_apply boolean NOT NULL DEFAULT false,
  training_auto_apply boolean NOT NULL DEFAULT false,
  recovery_auto_apply boolean NOT NULL DEFAULT false,
  goals_auto_apply boolean NOT NULL DEFAULT false,
  supplements_auto_apply boolean NOT NULL DEFAULT false,
  medical_auto_apply boolean NOT NULL DEFAULT false,
  buddy_auto_apply boolean NOT NULL DEFAULT false,
  client_note text,
  expires_at timestamptz,
  changed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT client_permissions_pair_uq UNIQUE (coach_id, client_id),
  CONSTRAINT client_permissions_not_self_ck CHECK (coach_id <> client_id),
  CONSTRAINT client_permissions_visibility_ck CHECK (
    nutrition_visibility IN ('none', 'summary', 'full')
    AND training_visibility IN ('none', 'summary', 'full')
    AND recovery_visibility IN ('none', 'summary', 'full')
    AND goals_visibility IN ('none', 'summary', 'full')
    AND supplements_visibility IN ('none', 'summary', 'full')
    AND medical_visibility IN ('none', 'summary', 'full')
    AND buddy_visibility IN ('none', 'summary', 'full')
  )
);

CREATE TABLE IF NOT EXISTS coach.client_autonomy (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nutrition_level smallint NOT NULL DEFAULT 2,
  training_level smallint NOT NULL DEFAULT 2,
  recovery_level smallint NOT NULL DEFAULT 2,
  goals_level smallint NOT NULL DEFAULT 2,
  supplements_level smallint NOT NULL DEFAULT 2,
  medical_level smallint NOT NULL DEFAULT 2,
  buddy_level smallint NOT NULL DEFAULT 2,
  safety_level smallint NOT NULL DEFAULT 1,
  coach_note text,
  changed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT client_autonomy_pair_uq UNIQUE (coach_id, client_id),
  CONSTRAINT client_autonomy_not_self_ck CHECK (coach_id <> client_id),
  CONSTRAINT client_autonomy_levels_ck CHECK (
    nutrition_level BETWEEN 1 AND 5
    AND training_level BETWEEN 1 AND 5
    AND recovery_level BETWEEN 1 AND 5
    AND goals_level BETWEEN 1 AND 5
    AND supplements_level BETWEEN 1 AND 5
    AND medical_level BETWEEN 1 AND 5
    AND buddy_level BETWEEN 1 AND 5
    AND safety_level BETWEEN 1 AND 3
  )
);

CREATE TABLE IF NOT EXISTS coach.permission_change_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  permission_id uuid REFERENCES coach.client_permissions(id) ON DELETE SET NULL,
  coach_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  changed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  changed_at timestamptz NOT NULL DEFAULT now(),
  change_kind text NOT NULL CHECK (change_kind IN ('insert', 'update', 'delete')),
  old_value jsonb,
  new_value jsonb
);

CREATE TABLE IF NOT EXISTS coach.autonomy_change_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  autonomy_id uuid REFERENCES coach.client_autonomy(id) ON DELETE SET NULL,
  coach_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  changed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  changed_at timestamptz NOT NULL DEFAULT now(),
  change_kind text NOT NULL CHECK (change_kind IN ('insert', 'update', 'delete')),
  old_value jsonb,
  new_value jsonb
);

CREATE TABLE IF NOT EXISTS coach.pending_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module text NOT NULL CHECK (module IN ('nutrition', 'training', 'recovery', 'goals', 'supplements', 'medical', 'buddy')),
  action_type text NOT NULL,
  preview jsonb NOT NULL DEFAULT '{}'::jsonb,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected', 'expired', 'cancelled')),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '10 minutes'),
  confirmed_at timestamptz,
  confirmed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT pending_actions_not_self_ck CHECK (coach_id <> client_id),
  CONSTRAINT pending_actions_confirmed_ck CHECK (
    (status = 'confirmed' AND confirmed_at IS NOT NULL AND confirmed_by IS NOT NULL)
    OR (status <> 'confirmed')
  )
);

CREATE TABLE IF NOT EXISTS coach.action_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pending_action_id uuid REFERENCES coach.pending_actions(id) ON DELETE SET NULL,
  coach_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module text NOT NULL CHECK (module IN ('nutrition', 'training', 'recovery', 'goals', 'supplements', 'medical', 'buddy')),
  action_type text NOT NULL,
  payload_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  undo_data jsonb,
  executed_at timestamptz NOT NULL DEFAULT now(),
  executed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  undone_at timestamptz,
  undone_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS client_permissions_client_idx ON coach.client_permissions(client_id);
CREATE INDEX IF NOT EXISTS client_autonomy_client_idx ON coach.client_autonomy(client_id);
CREATE INDEX IF NOT EXISTS permission_change_log_pair_idx ON coach.permission_change_log(coach_id, client_id, changed_at DESC);
CREATE INDEX IF NOT EXISTS autonomy_change_log_pair_idx ON coach.autonomy_change_log(coach_id, client_id, changed_at DESC);
CREATE INDEX IF NOT EXISTS pending_actions_client_status_idx ON coach.pending_actions(client_id, status, expires_at);
CREATE INDEX IF NOT EXISTS action_log_pair_idx ON coach.action_log(coach_id, client_id, executed_at DESC);

CREATE OR REPLACE FUNCTION coach.log_permission_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO coach.permission_change_log (
    permission_id, coach_id, client_id, changed_by, change_kind, old_value, new_value
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

CREATE OR REPLACE FUNCTION coach.log_autonomy_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO coach.autonomy_change_log (
    autonomy_id, coach_id, client_id, changed_by, change_kind, old_value, new_value
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

DROP TRIGGER IF EXISTS client_permissions_set_changed_by ON coach.client_permissions;
CREATE TRIGGER client_permissions_set_changed_by
  BEFORE INSERT OR UPDATE ON coach.client_permissions
  FOR EACH ROW EXECUTE FUNCTION coach.set_changed_by();

DROP TRIGGER IF EXISTS client_permissions_touch_updated_at ON coach.client_permissions;
CREATE TRIGGER client_permissions_touch_updated_at
  BEFORE UPDATE ON coach.client_permissions
  FOR EACH ROW EXECUTE FUNCTION coach.touch_updated_at();

DROP TRIGGER IF EXISTS client_permissions_change_log ON coach.client_permissions;
CREATE TRIGGER client_permissions_change_log
  AFTER INSERT OR UPDATE OR DELETE ON coach.client_permissions
  FOR EACH ROW EXECUTE FUNCTION coach.log_permission_change();

DROP TRIGGER IF EXISTS client_autonomy_set_changed_by ON coach.client_autonomy;
CREATE TRIGGER client_autonomy_set_changed_by
  BEFORE INSERT OR UPDATE ON coach.client_autonomy
  FOR EACH ROW EXECUTE FUNCTION coach.set_changed_by();

DROP TRIGGER IF EXISTS client_autonomy_touch_updated_at ON coach.client_autonomy;
CREATE TRIGGER client_autonomy_touch_updated_at
  BEFORE UPDATE ON coach.client_autonomy
  FOR EACH ROW EXECUTE FUNCTION coach.touch_updated_at();

DROP TRIGGER IF EXISTS client_autonomy_change_log ON coach.client_autonomy;
CREATE TRIGGER client_autonomy_change_log
  AFTER INSERT OR UPDATE OR DELETE ON coach.client_autonomy
  FOR EACH ROW EXECUTE FUNCTION coach.log_autonomy_change();

DROP TRIGGER IF EXISTS pending_actions_touch_updated_at ON coach.pending_actions;
CREATE TRIGGER pending_actions_touch_updated_at
  BEFORE UPDATE ON coach.pending_actions
  FOR EACH ROW EXECUTE FUNCTION coach.touch_updated_at();

GRANT USAGE ON SCHEMA coach TO authenticated, service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON coach.client_permissions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON coach.client_autonomy TO authenticated;
GRANT SELECT, INSERT ON coach.permission_change_log TO authenticated;
GRANT SELECT, INSERT ON coach.autonomy_change_log TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON coach.pending_actions TO authenticated;
GRANT SELECT, INSERT, UPDATE ON coach.action_log TO authenticated;

GRANT ALL ON coach.client_permissions TO service_role;
GRANT ALL ON coach.client_autonomy TO service_role;
GRANT ALL ON coach.permission_change_log TO service_role;
GRANT ALL ON coach.autonomy_change_log TO service_role;
GRANT ALL ON coach.pending_actions TO service_role;
GRANT ALL ON coach.action_log TO service_role;

ALTER TABLE coach.client_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach.client_autonomy ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach.permission_change_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach.autonomy_change_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach.pending_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach.action_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS client_permissions_select ON coach.client_permissions;
DROP POLICY IF EXISTS client_permissions_insert ON coach.client_permissions;
DROP POLICY IF EXISTS client_permissions_update ON coach.client_permissions;
DROP POLICY IF EXISTS client_permissions_delete ON coach.client_permissions;
CREATE POLICY client_permissions_select ON coach.client_permissions
  FOR SELECT TO authenticated USING ((SELECT auth.uid()) IN (coach_id, client_id));
CREATE POLICY client_permissions_insert ON coach.client_permissions
  FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = client_id);
CREATE POLICY client_permissions_update ON coach.client_permissions
  FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = client_id) WITH CHECK ((SELECT auth.uid()) = client_id);
CREATE POLICY client_permissions_delete ON coach.client_permissions
  FOR DELETE TO authenticated USING ((SELECT auth.uid()) = client_id);

DROP POLICY IF EXISTS client_autonomy_select ON coach.client_autonomy;
DROP POLICY IF EXISTS client_autonomy_insert ON coach.client_autonomy;
DROP POLICY IF EXISTS client_autonomy_update ON coach.client_autonomy;
DROP POLICY IF EXISTS client_autonomy_delete ON coach.client_autonomy;
CREATE POLICY client_autonomy_select ON coach.client_autonomy
  FOR SELECT TO authenticated USING ((SELECT auth.uid()) IN (coach_id, client_id));
CREATE POLICY client_autonomy_insert ON coach.client_autonomy
  FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = coach_id);
CREATE POLICY client_autonomy_update ON coach.client_autonomy
  FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = coach_id) WITH CHECK ((SELECT auth.uid()) = coach_id);
CREATE POLICY client_autonomy_delete ON coach.client_autonomy
  FOR DELETE TO authenticated USING ((SELECT auth.uid()) = coach_id);

DROP POLICY IF EXISTS permission_change_log_select ON coach.permission_change_log;
DROP POLICY IF EXISTS permission_change_log_insert ON coach.permission_change_log;
CREATE POLICY permission_change_log_select ON coach.permission_change_log
  FOR SELECT TO authenticated USING ((SELECT auth.uid()) IN (coach_id, client_id));
CREATE POLICY permission_change_log_insert ON coach.permission_change_log
  FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = changed_by AND (SELECT auth.uid()) IN (coach_id, client_id));

DROP POLICY IF EXISTS autonomy_change_log_select ON coach.autonomy_change_log;
DROP POLICY IF EXISTS autonomy_change_log_insert ON coach.autonomy_change_log;
CREATE POLICY autonomy_change_log_select ON coach.autonomy_change_log
  FOR SELECT TO authenticated USING ((SELECT auth.uid()) IN (coach_id, client_id));
CREATE POLICY autonomy_change_log_insert ON coach.autonomy_change_log
  FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = changed_by AND (SELECT auth.uid()) IN (coach_id, client_id));

DROP POLICY IF EXISTS pending_actions_select ON coach.pending_actions;
DROP POLICY IF EXISTS pending_actions_insert ON coach.pending_actions;
DROP POLICY IF EXISTS pending_actions_update ON coach.pending_actions;
DROP POLICY IF EXISTS pending_actions_delete ON coach.pending_actions;
CREATE POLICY pending_actions_select ON coach.pending_actions
  FOR SELECT TO authenticated USING ((SELECT auth.uid()) IN (coach_id, client_id));
CREATE POLICY pending_actions_insert ON coach.pending_actions
  FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = coach_id);
CREATE POLICY pending_actions_update ON coach.pending_actions
  FOR UPDATE TO authenticated USING ((SELECT auth.uid()) IN (coach_id, client_id)) WITH CHECK ((SELECT auth.uid()) IN (coach_id, client_id));
CREATE POLICY pending_actions_delete ON coach.pending_actions
  FOR DELETE TO authenticated USING ((SELECT auth.uid()) = coach_id);

DROP POLICY IF EXISTS action_log_select ON coach.action_log;
DROP POLICY IF EXISTS action_log_insert ON coach.action_log;
DROP POLICY IF EXISTS action_log_update ON coach.action_log;
CREATE POLICY action_log_select ON coach.action_log
  FOR SELECT TO authenticated USING ((SELECT auth.uid()) IN (coach_id, client_id));
CREATE POLICY action_log_insert ON coach.action_log
  FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) IN (coach_id, client_id));
CREATE POLICY action_log_update ON coach.action_log
  FOR UPDATE TO authenticated USING ((SELECT auth.uid()) IN (coach_id, client_id)) WITH CHECK ((SELECT auth.uid()) IN (coach_id, client_id));

COMMENT ON TABLE coach.client_permissions IS
  'Vom Klienten gesetzte Coach-Rechte je Modul: Sichtbarkeit und Aenderung ohne Bestaetigung.';
COMMENT ON TABLE coach.client_autonomy IS
  'Vom Coach gesetzter Autonomy-Level des Athleten je Modul. Speichert Reifegrad, keine Coach-Rechte.';
COMMENT ON TABLE coach.permission_change_log IS
  'Append-only Widerrufs- und Aenderungshistorie fuer Coach-Rechte.';
COMMENT ON TABLE coach.autonomy_change_log IS
  'Append-only Aenderungshistorie fuer Coach-Autonomy.';
COMMENT ON TABLE coach.pending_actions IS
  'Coach-Aenderungsvorschlaege mit Vorschau, 10-Minuten-Verfall und Nutzerbestaetigung.';
COMMENT ON TABLE coach.action_log IS
  'Ausgefuehrte Coach-Aktionen mit Undo-Snapshot.';

DO $$
DECLARE
  v_tables integer;
  v_rls integer;
  v_policies integer;
BEGIN
  SELECT count(*) INTO v_tables
  FROM information_schema.tables
  WHERE table_schema = 'coach'
    AND table_name IN (
      'client_permissions',
      'client_autonomy',
      'permission_change_log',
      'autonomy_change_log',
      'pending_actions',
      'action_log'
    );

  IF v_tables <> 6 THEN
    RAISE EXCEPTION 'coach: % Tabellen statt 6', v_tables;
  END IF;

  SELECT count(*) INTO v_rls
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'coach'
    AND c.relname IN (
      'client_permissions',
      'client_autonomy',
      'permission_change_log',
      'autonomy_change_log',
      'pending_actions',
      'action_log'
    )
    AND c.relrowsecurity;

  IF v_rls <> 6 THEN
    RAISE EXCEPTION 'coach: % Tabellen mit RLS statt 6', v_rls;
  END IF;

  SELECT count(*) INTO v_policies
  FROM pg_policies
  WHERE schemaname = 'coach';

  IF v_policies <> 19 THEN
    RAISE EXCEPTION 'coach: % Policies statt 19', v_policies;
  END IF;

  RAISE NOTICE 'OK: coach Permissions, Autonomy, Logs und Pending Actions mit RLS';
END $$;

COMMIT;
