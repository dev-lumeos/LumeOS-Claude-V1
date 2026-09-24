-- C-541: Der Erfahrungsgrad ist aenderbar, aber nicht loeschbar.
-- Der separate Pipeline-Schritt fuellt bestehende NULL-Zeilen vorab.
-- Kein Spalten-Default: gewoehnliche Profil-Inserts muessen den Grad nennen.
-- Der Auth-Trigger setzt bis zum verpflichtenden Onboarding ausdruecklich
-- die konservative Stufe beginner, damit die Registrierung nicht blockiert.

BEGIN;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE experience_level IS NULL
  ) THEN
    RAISE EXCEPTION 'C-541: vor SET NOT NULL zuerst 541_experience_level_backfill.sql ausfuehren';
  END IF;
END $$;

ALTER TABLE public.profiles
  ALTER COLUMN experience_level SET NOT NULL;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, experience_level)
  VALUES (NEW.id, 'beginner')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;

COMMENT ON COLUMN public.profiles.experience_level IS
  'C-118/C-140/C-541: verpflichtende Selbstauskunft beginner/advanced/pro/elite; aenderbar, nicht loeschbar. Der Auth-Trigger setzt bis zum Onboarding konservativ beginner.';

COMMIT;
