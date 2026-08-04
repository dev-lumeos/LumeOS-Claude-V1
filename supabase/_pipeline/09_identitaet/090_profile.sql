-- =============================================================
-- 090 — Identität: public.profiles + Anlage-Trigger (M3 Login)
-- Datum: 2026-08-04 · Anker: 919f2bd
-- Zweck: Profilzeile je Identität, angelegt per Trigger auf auth.users.
--        Minimal nach Vorgabe: nur id/created_at/updated_at — Name,
--        Sprache, Einheiten kommen später über Settings.
-- Idempotent: CREATE TABLE IF NOT EXISTS, CREATE OR REPLACE FUNCTION,
--        DROP POLICY/TRIGGER IF EXISTS + CREATE. Läuft NACH 060/070
--        (fachlich unabhängig, aber Kettenreihenfolge ist verbindlich).
--
-- WICHTIG (Spez. login/00-modul-login.md §10): Der Trigger MUSS unter
-- allen Umständen gelingen — ein Fehler blockiert jede Registrierung
-- mit einem 500er. Deshalb: ON CONFLICT DO NOTHING, keine Pflichtfelder
-- ausser id, kein Zugriff auf Fehlbares, search_path explizit gesetzt.
--
-- Rechte: SELECT/INSERT/UPDATE für authenticated, KEIN DELETE (Vorgabe).
-- Die DELETE-Policy existiert trotzdem (Muster: 4 Policies je Operation,
-- 10-plattform/datenzugriff §5) — ohne Grant bleibt sie wirkungslos,
-- Rechte werden VOR Policies geprüft.
-- REVOKE vorab: Supabase vergibt in `public` Default-Privileges an
-- anon/authenticated — die würden sonst stillschweigend DELETE und
-- anon-Zugriff gewähren.
-- =============================================================

BEGIN;

-- -------------------------------------------------------------
-- 1. Tabelle.
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id         uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- -------------------------------------------------------------
-- 2. Rechte (vor RLS — Rechte werden zuerst geprüft).
-- -------------------------------------------------------------
REVOKE ALL ON public.profiles FROM PUBLIC;
REVOKE ALL ON public.profiles FROM anon;
REVOKE ALL ON public.profiles FROM authenticated;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

-- -------------------------------------------------------------
-- 3. Row Level Security: vier getrennte Policies, auth.uid() = id.
-- -------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS profiles_select ON public.profiles;
CREATE POLICY profiles_select ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS profiles_insert ON public.profiles;
CREATE POLICY profiles_insert ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS profiles_update ON public.profiles;
CREATE POLICY profiles_update ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS profiles_delete ON public.profiles;
CREATE POLICY profiles_delete ON public.profiles
  FOR DELETE TO authenticated USING (auth.uid() = id);

-- -------------------------------------------------------------
-- 4. Anlage-Trigger auf auth.users.
--    SECURITY DEFINER: läuft mit den Rechten des Anlegenden (postgres),
--    weil der Auth-Dienst selbst kein INSERT-Recht auf public braucht.
--    search_path leer + vollqualifizierte Namen: kein Objekt-Hijacking,
--    kein Zugriff auf etwas, das fehlen könnte.
-- -------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

COMMIT;
