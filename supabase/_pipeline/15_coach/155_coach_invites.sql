-- =============================================================
-- 155 — Coach-Einladungen: Ruecknahme und E-Mail-Aufloesung (C-269/C-268)
-- Datum: 2026-08-25
-- Zweck:
--   Eine Einladung ist ein Vorgang, kein Nichts. Deshalb wird eine
--   zurueckgenommene Einladung als status='withdrawn' gespeichert,
--   statt die Zeile zu loeschen. Der relationship_change_log bleibt
--   damit append-only und nachvollziehbar.
--
--   Namen gibt es nicht: coach_profiles existiert nicht und
--   public.profiles fuehrt kein Namensfeld. Die kleinste tragende
--   Aufloesung ist E-Mail -> user_id fuer den Invite-Pfad. Die
--   Funktion gibt weder E-Mail noch Metadaten zurueck.
-- =============================================================

BEGIN;

ALTER TABLE coach.relationships
  ADD COLUMN IF NOT EXISTS withdrawn_at timestamptz,
  ADD COLUMN IF NOT EXISTS withdrawn_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS withdraw_reason text;

ALTER TABLE coach.relationships
  DROP CONSTRAINT IF EXISTS relationships_status_check,
  DROP CONSTRAINT IF EXISTS relationships_withdrawn_ck;

ALTER TABLE coach.relationships
  ADD CONSTRAINT relationships_status_check
    CHECK (status IN ('invited', 'active', 'ended', 'withdrawn')),
  ADD CONSTRAINT relationships_withdrawn_ck
    CHECK (status <> 'withdrawn' OR (withdrawn_at IS NOT NULL AND withdrawn_by IS NOT NULL));

COMMENT ON COLUMN coach.relationships.withdrawn_at IS
  'Zeitpunkt, zu dem eine noch nicht angenommene Einladung zurueckgenommen wurde.';
COMMENT ON COLUMN coach.relationships.withdrawn_by IS
  'Nutzer, der die Einladung zurueckgenommen hat. Muss bei status=withdrawn gesetzt sein.';
COMMENT ON COLUMN coach.relationships.withdraw_reason IS
  'Optionaler Nutzergrund fuer die Ruecknahme der Einladung.';

CREATE OR REPLACE FUNCTION coach.resolve_invite_user_id(p_email text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_email text := lower(btrim(coalesce(p_email, '')));
  v_user_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'not_authenticated' USING ERRCODE = '42501';
  END IF;

  IF v_email = '' OR position('@' in v_email) = 0 THEN
    RETURN NULL;
  END IF;

  SELECT u.id INTO v_user_id
  FROM auth.users u
  WHERE lower(u.email) = v_email
  LIMIT 1;

  RETURN v_user_id;
END;
$$;

COMMENT ON FUNCTION coach.resolve_invite_user_id(text) IS
  'C-268: SECURITY-DEFINER-Aufloesung fuer Einladungen. Liefert nur user_id oder NULL, nie E-Mail, Namen oder Metadaten.';

CREATE OR REPLACE FUNCTION coach.withdraw_relationship_invite(
  p_relationship_id uuid,
  p_reason text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_changed integer;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'not_authenticated' USING ERRCODE = '42501';
  END IF;

  UPDATE coach.relationships r
  SET
    status = 'withdrawn',
    withdrawn_at = now(),
    withdrawn_by = auth.uid(),
    withdraw_reason = NULLIF(btrim(p_reason), ''),
    ended_at = NULL,
    ended_by = NULL,
    end_reason = NULL
  WHERE r.id = p_relationship_id
    AND r.status = 'invited'
    AND r.invited_by = auth.uid();

  GET DIAGNOSTICS v_changed = ROW_COUNT;
  RETURN v_changed = 1;
END;
$$;

COMMENT ON FUNCTION coach.withdraw_relationship_invite(uuid, text) IS
  'C-269: nimmt eine eigene offene Einladung per Statuswechsel zurueck. Gibt false fuer nicht gefunden, nicht erlaubt oder nicht invited zurueck.';

REVOKE ALL ON FUNCTION coach.resolve_invite_user_id(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION coach.withdraw_relationship_invite(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION coach.resolve_invite_user_id(text) TO authenticated;
GRANT EXECUTE ON FUNCTION coach.withdraw_relationship_invite(uuid, text) TO authenticated;

DO $$
DECLARE
  v_status_constraint text;
  v_functions integer;
  v_columns integer;
BEGIN
  SELECT pg_get_constraintdef(oid) INTO v_status_constraint
  FROM pg_constraint
  WHERE conrelid = 'coach.relationships'::regclass
    AND conname = 'relationships_status_check';

  IF v_status_constraint NOT LIKE '%withdrawn%' THEN
    RAISE EXCEPTION '155: relationships_status_check kennt withdrawn nicht: %', v_status_constraint;
  END IF;

  SELECT count(*) INTO v_columns
  FROM information_schema.columns
  WHERE table_schema = 'coach'
    AND table_name = 'relationships'
    AND column_name IN ('withdrawn_at', 'withdrawn_by', 'withdraw_reason');

  IF v_columns <> 3 THEN
    RAISE EXCEPTION '155: % Withdrawal-Spalten statt 3', v_columns;
  END IF;

  SELECT count(*) INTO v_functions
  FROM information_schema.routines
  WHERE routine_schema = 'coach'
    AND routine_name IN ('resolve_invite_user_id', 'withdraw_relationship_invite');

  IF v_functions <> 2 THEN
    RAISE EXCEPTION '155: % Invite-Funktionen statt 2', v_functions;
  END IF;

  RAISE NOTICE 'OK: Coach-Einladungen mit withdrawn-Status und E-Mail-Aufloesung';
END $$;

COMMIT;
