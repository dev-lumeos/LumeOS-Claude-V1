-- C-428: Eine Einladung an eine noch nicht registrierte E-Mail ist noch
-- keine Beziehung. Deshalb bleibt coach.relationships unveraendert mit
-- client_id NOT NULL; diese Tabelle endet bei der Annahme atomar in einer
-- echten Beziehung samt Rechten und Autonomy.

BEGIN;

-- Dev nutzt extensions, die Aufbaukette kann pgcrypto aber aus der Baseline
-- bereits in public haben. Die RPCs loesen das registrierte Erweiterungs-
-- Schema deshalb unten explizit aus pg_extension auf.
CREATE SCHEMA IF NOT EXISTS extensions;
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

CREATE TABLE IF NOT EXISTS coach.pending_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  coach_display_name text NOT NULL CHECK (btrim(coach_display_name) <> ''),
  email_normalized text NOT NULL CHECK (
    email_normalized = lower(btrim(email_normalized))
    AND email_normalized ~ '^[^[:space:]@]+@[^[:space:]@]+$'
  ),
  -- Ausschliesslich der SHA-256-Hash ist persistent. Der Klartext wird nur
  -- einmalig aus create_pending_invite() an den Mailversand zurueckgegeben.
  token_hash text,
  expires_at timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'expired')),
  permission_draft jsonb NOT NULL,
  autonomy_draft jsonb NOT NULL,
  accepted_at timestamptz,
  accepted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  accepted_relationship_id uuid REFERENCES coach.relationships(id) ON DELETE SET NULL,
  expired_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT pending_invites_state_ck CHECK (
    (status = 'pending'
      AND token_hash IS NOT NULL
      AND accepted_at IS NULL
      AND accepted_by IS NULL
      AND accepted_relationship_id IS NULL
      AND expired_at IS NULL)
    OR (status = 'accepted'
      AND token_hash IS NULL
      AND accepted_at IS NOT NULL
      AND accepted_by IS NOT NULL
      AND accepted_relationship_id IS NOT NULL
      AND expired_at IS NULL)
    OR (status = 'expired'
      AND token_hash IS NULL
      AND accepted_at IS NULL
      AND accepted_by IS NULL
      AND accepted_relationship_id IS NULL
      AND expired_at IS NOT NULL)
  ),
  CONSTRAINT pending_invites_drafts_object_ck CHECK (
    jsonb_typeof(permission_draft) = 'object'
    AND jsonb_typeof(autonomy_draft) = 'object'
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS pending_invites_token_hash_uq
  ON coach.pending_invites(token_hash) WHERE token_hash IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS pending_invites_open_email_uq
  ON coach.pending_invites(coach_id, email_normalized) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS pending_invites_coach_status_idx
  ON coach.pending_invites(coach_id, status, expires_at);

ALTER TABLE coach.pending_invites ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON coach.pending_invites FROM PUBLIC, anon;
GRANT SELECT ON coach.pending_invites TO authenticated;
GRANT ALL ON coach.pending_invites TO service_role;

DROP POLICY IF EXISTS pending_invites_select_own ON coach.pending_invites;
CREATE POLICY pending_invites_select_own ON coach.pending_invites
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = coach_id);

DROP TRIGGER IF EXISTS pending_invites_touch_updated_at ON coach.pending_invites;
CREATE TRIGGER pending_invites_touch_updated_at
  BEFORE UPDATE ON coach.pending_invites
  FOR EACH ROW EXECUTE FUNCTION coach.touch_updated_at();

CREATE OR REPLACE FUNCTION coach.create_pending_invite(
  p_client_email text,
  p_expires_at timestamptz,
  p_initial_autonomy smallint DEFAULT 2
)
RETURNS TABLE(invite_id uuid, token text, expires_at timestamptz)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog
AS $$
DECLARE
  v_coach_id uuid := auth.uid();
  v_email text := lower(btrim(coalesce(p_client_email, '')));
  v_coach_name text;
  v_pgcrypto_schema name;
  v_token text;
  v_token_hash text;
  v_invite_id uuid;
  v_permissions jsonb := jsonb_build_object(
    'nutrition_visibility', 'full',
    'training_visibility', 'full',
    'recovery_visibility', 'summary',
    'goals_visibility', 'full',
    'supplements_visibility', 'full',
    'medical_visibility', 'none',
    'buddy_visibility', 'summary',
    'nutrition_auto_apply', false,
    'training_auto_apply', false,
    'recovery_auto_apply', false,
    'goals_auto_apply', false,
    'supplements_auto_apply', false,
    'medical_auto_apply', false,
    'buddy_auto_apply', false
  );
  v_autonomy jsonb;
BEGIN
  IF v_coach_id IS NULL THEN
    RAISE EXCEPTION 'not_authenticated' USING ERRCODE = '42501';
  END IF;
  IF v_email !~ '^[^[:space:]@]+@[^[:space:]@]+$' THEN
    RAISE EXCEPTION 'invalid_invite_email' USING ERRCODE = '22023';
  END IF;
  IF p_expires_at IS NULL OR p_expires_at <= now() THEN
    RAISE EXCEPTION 'invite_expiry_must_be_future' USING ERRCODE = '22023';
  END IF;
  IF p_initial_autonomy NOT BETWEEN 1 AND 5 THEN
    RAISE EXCEPTION 'invalid_initial_autonomy' USING ERRCODE = '22023';
  END IF;

  SELECT cp.display_name INTO v_coach_name
  FROM coach.coach_profiles AS cp
  WHERE cp.user_id = v_coach_id AND cp.is_active;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'active_coach_profile_not_found' USING ERRCODE = 'P0002';
  END IF;

  -- Eine abgelaufene, nie angenommene Einladung ist kein offener Zugang und
  -- blockiert auch keine erneute Einladung an dieselbe Adresse.
  UPDATE coach.pending_invites AS pi
  SET status = 'expired', token_hash = NULL, expired_at = now()
  WHERE pi.coach_id = v_coach_id
    AND pi.email_normalized = v_email
    AND pi.status = 'pending'
    AND pi.expires_at <= now();

  v_autonomy := jsonb_build_object(
    'nutrition_level', p_initial_autonomy,
    'training_level', p_initial_autonomy,
    'recovery_level', p_initial_autonomy,
    'goals_level', p_initial_autonomy,
    'supplements_level', p_initial_autonomy,
    'medical_level', p_initial_autonomy,
    'buddy_level', p_initial_autonomy,
    'safety_level', 1
  );
  SELECT n.nspname INTO v_pgcrypto_schema
  FROM pg_catalog.pg_extension AS e
  JOIN pg_catalog.pg_namespace AS n ON n.oid = e.extnamespace
  WHERE e.extname = 'pgcrypto';
  IF NOT FOUND THEN
    RAISE EXCEPTION 'pgcrypto_not_installed' USING ERRCODE = 'P0002';
  END IF;

  EXECUTE format('SELECT encode(%I.gen_random_bytes(32), ''hex'')', v_pgcrypto_schema)
    INTO v_token;
  EXECUTE format('SELECT encode(%I.digest($1, ''sha256''), ''hex'')', v_pgcrypto_schema)
    INTO v_token_hash USING v_token;

  INSERT INTO coach.pending_invites (
    coach_id, coach_display_name, email_normalized, token_hash, expires_at,
    permission_draft, autonomy_draft
  ) VALUES (
    v_coach_id, v_coach_name, v_email,
    v_token_hash, p_expires_at,
    v_permissions, v_autonomy
  ) RETURNING id INTO v_invite_id;

  RETURN QUERY SELECT v_invite_id, v_token, p_expires_at;
END;
$$;

CREATE OR REPLACE FUNCTION coach.accept_pending_invite(p_token text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog
AS $$
DECLARE
  v_client_id uuid := auth.uid();
  v_client_email text;
  v_pgcrypto_schema name;
  v_token_hash text;
  v_invite coach.pending_invites%ROWTYPE;
  v_relationship_id uuid;
BEGIN
  IF v_client_id IS NULL THEN
    RAISE EXCEPTION 'not_authenticated' USING ERRCODE = '42501';
  END IF;
  IF NULLIF(btrim(p_token), '') IS NULL THEN
    RAISE EXCEPTION 'invalid_invite_token' USING ERRCODE = '22023';
  END IF;

  SELECT n.nspname INTO v_pgcrypto_schema
  FROM pg_catalog.pg_extension AS e
  JOIN pg_catalog.pg_namespace AS n ON n.oid = e.extnamespace
  WHERE e.extname = 'pgcrypto';
  IF NOT FOUND THEN
    RAISE EXCEPTION 'pgcrypto_not_installed' USING ERRCODE = 'P0002';
  END IF;

  EXECUTE format('SELECT encode(%I.digest($1, ''sha256''), ''hex'')', v_pgcrypto_schema)
    INTO v_token_hash USING p_token;
  SELECT * INTO v_invite
  FROM coach.pending_invites
  WHERE token_hash = v_token_hash AND status = 'pending'
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'invalid_invite_token' USING ERRCODE = 'P0002';
  END IF;

  IF v_invite.expires_at <= now() THEN
    UPDATE coach.pending_invites
    SET status = 'expired', token_hash = NULL, expired_at = now()
    WHERE id = v_invite.id;
    RETURN NULL;
  END IF;

  SELECT lower(btrim(u.email)) INTO v_client_email
  FROM auth.users AS u
  WHERE u.id = v_client_id;
  IF NOT FOUND OR v_client_email <> v_invite.email_normalized THEN
    RAISE EXCEPTION 'invite_email_mismatch' USING ERRCODE = '42501';
  END IF;

  INSERT INTO coach.relationships (
    coach_id, client_id, status, invited_by, coach_display_name, started_at
  ) VALUES (
    v_invite.coach_id, v_client_id, 'active', v_invite.coach_id,
    v_invite.coach_display_name, now()
  ) RETURNING id INTO v_relationship_id;

  INSERT INTO coach.client_permissions (
    coach_id, client_id,
    nutrition_visibility, training_visibility, recovery_visibility,
    goals_visibility, supplements_visibility, medical_visibility, buddy_visibility,
    nutrition_auto_apply, training_auto_apply, recovery_auto_apply,
    goals_auto_apply, supplements_auto_apply, medical_auto_apply, buddy_auto_apply,
    changed_by
  ) VALUES (
    v_invite.coach_id, v_client_id,
    v_invite.permission_draft->>'nutrition_visibility',
    v_invite.permission_draft->>'training_visibility',
    v_invite.permission_draft->>'recovery_visibility',
    v_invite.permission_draft->>'goals_visibility',
    v_invite.permission_draft->>'supplements_visibility',
    v_invite.permission_draft->>'medical_visibility',
    v_invite.permission_draft->>'buddy_visibility',
    (v_invite.permission_draft->>'nutrition_auto_apply')::boolean,
    (v_invite.permission_draft->>'training_auto_apply')::boolean,
    (v_invite.permission_draft->>'recovery_auto_apply')::boolean,
    (v_invite.permission_draft->>'goals_auto_apply')::boolean,
    (v_invite.permission_draft->>'supplements_auto_apply')::boolean,
    (v_invite.permission_draft->>'medical_auto_apply')::boolean,
    (v_invite.permission_draft->>'buddy_auto_apply')::boolean,
    v_client_id
  );

  INSERT INTO coach.client_autonomy (
    coach_id, client_id,
    nutrition_level, training_level, recovery_level, goals_level,
    supplements_level, medical_level, buddy_level, safety_level, changed_by
  ) VALUES (
    v_invite.coach_id, v_client_id,
    (v_invite.autonomy_draft->>'nutrition_level')::smallint,
    (v_invite.autonomy_draft->>'training_level')::smallint,
    (v_invite.autonomy_draft->>'recovery_level')::smallint,
    (v_invite.autonomy_draft->>'goals_level')::smallint,
    (v_invite.autonomy_draft->>'supplements_level')::smallint,
    (v_invite.autonomy_draft->>'medical_level')::smallint,
    (v_invite.autonomy_draft->>'buddy_level')::smallint,
    (v_invite.autonomy_draft->>'safety_level')::smallint,
    v_invite.coach_id
  );

  UPDATE coach.pending_invites
  SET status = 'accepted', token_hash = NULL,
      accepted_at = now(), accepted_by = v_client_id,
      accepted_relationship_id = v_relationship_id
  WHERE id = v_invite.id;

  RETURN v_relationship_id;
END;
$$;

REVOKE ALL ON FUNCTION coach.create_pending_invite(text, timestamptz, smallint) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION coach.accept_pending_invite(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION coach.create_pending_invite(text, timestamptz, smallint)
  TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION coach.accept_pending_invite(text)
  TO authenticated, service_role;

COMMENT ON TABLE coach.pending_invites IS
  'C-428: Coach-Einladung an eine normalisierte E-Mail ohne vorhandene client_id. Kein Klartext-Token; Annahme erzeugt atomar Beziehung, Rechte und Autonomy.';
COMMENT ON COLUMN coach.pending_invites.permission_draft IS
  'C-428/SPEC_08: beim Einladen festgelegter Rechteentwurf. medical_visibility bleibt standardmaessig none.';
COMMENT ON FUNCTION coach.create_pending_invite(text, timestamptz, smallint) IS
  'C-428: Erzeugt einen einmalig rueckgegebenen Zufallstoken, speichert ausschliesslich dessen SHA-256-Hash und verlangt einen expliziten Ablaufzeitpunkt.';
COMMENT ON FUNCTION coach.accept_pending_invite(text) IS
  'C-428: SECURITY-DEFINER-Annahme nur fuer die zum Token passende eingeloggte E-Mail. Beziehung, Rechte, Autonomy und Token-Invalidierung bilden eine atomare Datenbankoperation.';

DO $$
DECLARE
  v_columns integer;
BEGIN
  SELECT count(*) INTO v_columns
  FROM information_schema.columns
  WHERE table_schema = 'coach' AND table_name = 'pending_invites'
    AND column_name IN (
      'coach_id', 'email_normalized', 'token_hash', 'expires_at', 'status',
      'permission_draft', 'autonomy_draft', 'accepted_relationship_id'
    );
  IF v_columns <> 8
     OR to_regprocedure('coach.create_pending_invite(text,timestamp with time zone,smallint)') IS NULL
     OR to_regprocedure('coach.accept_pending_invite(text)') IS NULL THEN
    RAISE EXCEPTION 'C-428: Pending-Invite-Struktur oder Annahmefunktion fehlt';
  END IF;
END;
$$;

COMMIT;
