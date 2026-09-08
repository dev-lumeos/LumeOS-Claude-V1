-- C-268: Eine Einladung benennt den Coach, nicht den noch nicht
-- registrierten Eingeladenen. Der Name ist deshalb ein Snapshot aus dem
-- Coach-Profil auf der Beziehungszeile, nicht eine Klientensuche.

BEGIN;

CREATE TABLE IF NOT EXISTS coach.coach_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL CHECK (btrim(display_name) <> ''),
  email text NOT NULL CHECK (btrim(email) <> ''),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS coach_profiles_active_idx
  ON coach.coach_profiles(user_id) WHERE is_active;

ALTER TABLE coach.coach_profiles ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON coach.coach_profiles FROM PUBLIC, anon;
GRANT SELECT, INSERT, UPDATE ON coach.coach_profiles TO authenticated;
GRANT ALL ON coach.coach_profiles TO service_role;

DROP POLICY IF EXISTS coach_profiles_select_own ON coach.coach_profiles;
DROP POLICY IF EXISTS coach_profiles_insert_own ON coach.coach_profiles;
DROP POLICY IF EXISTS coach_profiles_update_own ON coach.coach_profiles;
CREATE POLICY coach_profiles_select_own ON coach.coach_profiles
  FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
CREATE POLICY coach_profiles_insert_own ON coach.coach_profiles
  FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY coach_profiles_update_own ON coach.coach_profiles
  FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP TRIGGER IF EXISTS coach_profiles_touch_updated_at ON coach.coach_profiles;
CREATE TRIGGER coach_profiles_touch_updated_at
  BEFORE UPDATE ON coach.coach_profiles
  FOR EACH ROW EXECUTE FUNCTION coach.touch_updated_at();

ALTER TABLE coach.relationships
  ADD COLUMN IF NOT EXISTS coach_display_name text;

-- Historische Einladungen haben noch keinen Snapshot. NOT VALID erzwingt den
-- Namen fuer jede neue oder geaenderte invited-Zeile, ohne alte Auditdaten
-- umzuschreiben oder vorzutäuschen.
ALTER TABLE coach.relationships
  DROP CONSTRAINT IF EXISTS relationships_invited_coach_name_ck;
ALTER TABLE coach.relationships
  ADD CONSTRAINT relationships_invited_coach_name_ck
  CHECK (status <> 'invited' OR coach_display_name IS NOT NULL)
  NOT VALID;

COMMENT ON COLUMN coach.relationships.coach_display_name IS
  'C-268: Snapshot aus coach.coach_profiles.display_name zum Zeitpunkt der Einladung. Der Eingeladene sieht, wer ihn einlaedt; kein Klientenname vor Annahme.';

CREATE OR REPLACE FUNCTION coach.create_relationship_invite(
  p_coach_id uuid,
  p_note text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $function$
DECLARE
  v_client_id uuid := auth.uid();
  v_coach_name text;
  v_relationship_id uuid;
BEGIN
  IF v_client_id IS NULL THEN
    RAISE EXCEPTION 'Anmeldung erforderlich' USING ERRCODE = '42501';
  END IF;

  IF p_coach_id = v_client_id THEN
    RAISE EXCEPTION 'Sich selbst einladen geht nicht' USING ERRCODE = '22023';
  END IF;

  SELECT cp.display_name INTO v_coach_name
  FROM coach.coach_profiles AS cp
  WHERE cp.user_id = p_coach_id
    AND cp.is_active;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Aktives Coach-Profil nicht gefunden' USING ERRCODE = 'P0002';
  END IF;

  INSERT INTO coach.relationships (
    coach_id, client_id, status, invited_by, invite_note, coach_display_name
  ) VALUES (
    p_coach_id, v_client_id, 'invited', v_client_id,
    NULLIF(btrim(p_note), ''), v_coach_name
  )
  RETURNING id INTO v_relationship_id;

  RETURN v_relationship_id;
END;
$function$;

REVOKE ALL ON FUNCTION coach.create_relationship_invite(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION coach.create_relationship_invite(uuid, text)
  TO authenticated, service_role;

COMMENT ON FUNCTION coach.create_relationship_invite(uuid, text) IS
  'C-268: Legt eine Client-zu-Coach-Einladung atomar an und nimmt coach_display_name ausschliesslich aus dem aktiven Coach-Profil. Keine Klientensuche und kein Browser-Snapshot.';

DO $$
DECLARE
  v_column_count integer;
BEGIN
  SELECT count(*) INTO v_column_count
  FROM information_schema.columns
  WHERE table_schema = 'coach'
    AND table_name = 'relationships'
    AND column_name = 'coach_display_name';

  IF v_column_count <> 1
     OR to_regclass('coach.coach_profiles') IS NULL
     OR to_regprocedure('coach.create_relationship_invite(uuid,text)') IS NULL THEN
    RAISE EXCEPTION '156: Coach-Profil, Namenssnapshot oder Invite-RPC fehlt';
  END IF;
END;
$$;

COMMIT;
