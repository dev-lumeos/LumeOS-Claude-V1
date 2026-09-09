-- C-440: Ein Coach entscheidet sich bewusst fuer ein Profil, bevor er
-- Einladungen versendet. Das Anlegen eines Kontos erzeugt kein Profil.
BEGIN;

CREATE OR REPLACE FUNCTION coach.onboard_coach(p_display_name text)
RETURNS coach.coach_profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_display_name text := btrim(coalesce(p_display_name, ''));
  v_email text;
  v_profile coach.coach_profiles%ROWTYPE;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'not_authenticated' USING ERRCODE = '42501';
  END IF;
  IF v_display_name = '' THEN
    RAISE EXCEPTION 'display_name_required' USING ERRCODE = '22023';
  END IF;

  -- Die Adresse stammt ausschliesslich aus dem angemeldeten Auth-Konto;
  -- der Aufrufer kann weder die Profilinhaberschaft noch die Adresse setzen.
  SELECT lower(btrim(u.email)) INTO v_email
  FROM auth.users AS u
  WHERE u.id = v_user_id;
  IF NOT FOUND OR v_email IS NULL OR v_email = '' THEN
    RAISE EXCEPTION 'authenticated_email_not_found' USING ERRCODE = 'P0002';
  END IF;

  INSERT INTO coach.coach_profiles (user_id, display_name, email)
  VALUES (v_user_id, v_display_name, v_email)
  ON CONFLICT (user_id) DO NOTHING
  RETURNING * INTO v_profile;

  IF NOT FOUND THEN
    SELECT * INTO v_profile
    FROM coach.coach_profiles
    WHERE user_id = v_user_id;
  END IF;

  RETURN v_profile;
END;
$$;

REVOKE ALL ON FUNCTION coach.onboard_coach(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION coach.onboard_coach(text) TO authenticated, service_role;

COMMENT ON FUNCTION coach.onboard_coach(text) IS
  'C-440: Explizites Coach-Onboarding. Legt nur fuer auth.uid() ein aktives Profil mit Auth-E-Mail an; Kontoanlage und Rollen bleiben unveraendert. Die Invite-RPCs pruefen das aktive Profil weiterhin selbst.';

DO $$
BEGIN
  IF to_regprocedure('coach.onboard_coach(text)') IS NULL THEN
    RAISE EXCEPTION 'C-440: Onboarding-RPC fehlt';
  END IF;
END;
$$;

COMMIT;
