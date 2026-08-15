-- =============================================================
-- 090 — Identität: public.profiles + Anlage-Trigger (M3 Login)
-- Datum: 2026-08-04 · Anker: 919f2bd
-- Zweck: Profilzeile je Identität, angelegt per Trigger auf auth.users.
--        C-47 ergänzt die Profilachsen, die für Referenzwerte und spätere
--        Makro-Zielberechnung nötig sind. Alle neuen Felder bleiben nullable:
--        der Trigger darf Registrierungen weiterhin nie blockieren.
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

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS birth_date DATE,
  ADD COLUMN IF NOT EXISTS biological_sex TEXT,
  ADD COLUMN IF NOT EXISTS height_cm NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS body_weight_kg NUMERIC(6,3),
  ADD COLUMN IF NOT EXISTS activity_level TEXT,
  ADD COLUMN IF NOT EXISTS nutrition_goal TEXT,
  ADD COLUMN IF NOT EXISTS pregnancy_started_on DATE,
  ADD COLUMN IF NOT EXISTS pregnancy_ended_on DATE,
  ADD COLUMN IF NOT EXISTS lactation_started_on DATE,
  ADD COLUMN IF NOT EXISTS lactation_ended_on DATE;

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_birth_date_check,
  DROP CONSTRAINT IF EXISTS profiles_biological_sex_check,
  DROP CONSTRAINT IF EXISTS profiles_height_cm_check,
  DROP CONSTRAINT IF EXISTS profiles_body_weight_kg_check,
  DROP CONSTRAINT IF EXISTS profiles_activity_level_check,
  DROP CONSTRAINT IF EXISTS profiles_nutrition_goal_check,
  DROP CONSTRAINT IF EXISTS profiles_pregnancy_period_check,
  DROP CONSTRAINT IF EXISTS profiles_lactation_period_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_birth_date_check CHECK (
    birth_date IS NULL OR (birth_date >= DATE '1900-01-01' AND birth_date <= CURRENT_DATE)
  ),
  ADD CONSTRAINT profiles_biological_sex_check CHECK (
    biological_sex IS NULL OR biological_sex IN ('male', 'female')
  ),
  ADD CONSTRAINT profiles_height_cm_check CHECK (
    height_cm IS NULL OR (height_cm >= 80 AND height_cm <= 260)
  ),
  ADD CONSTRAINT profiles_body_weight_kg_check CHECK (
    body_weight_kg IS NULL OR (body_weight_kg >= 20 AND body_weight_kg <= 400)
  ),
  ADD CONSTRAINT profiles_activity_level_check CHECK (
    activity_level IS NULL OR activity_level IN (
      'sedentary',
      'light',
      'moderate',
      'active',
      'very_active'
    )
  ),
  ADD CONSTRAINT profiles_nutrition_goal_check CHECK (
    nutrition_goal IS NULL OR nutrition_goal IN (
      'lose_weight',
      'maintain',
      'gain_muscle',
      'recomposition',
      'performance',
      'health'
    )
  ),
  ADD CONSTRAINT profiles_pregnancy_period_check CHECK (
    pregnancy_started_on IS NULL OR pregnancy_ended_on IS NULL OR pregnancy_ended_on >= pregnancy_started_on
  ),
  ADD CONSTRAINT profiles_lactation_period_check CHECK (
    lactation_started_on IS NULL OR lactation_ended_on IS NULL OR lactation_ended_on >= lactation_started_on
  );

COMMENT ON COLUMN public.profiles.birth_date IS
  'C-47: Geburtsdatum statt Alter; Alter wird fuer Referenzwerte zum abgefragten Tag berechnet.';
COMMENT ON COLUMN public.profiles.biological_sex IS
  'C-47: biologisches Geschlecht male/female fuer Naehrstoff-Referenzwerte. E-07 ist getrennt und betrifft nur Trainingsmedien.';
COMMENT ON COLUMN public.profiles.height_cm IS
  'C-47: Koerpergroesse fuer spaetere Makro-/TDEE-Berechnung; nullable, weil Profil unvollstaendig sein darf.';
COMMENT ON COLUMN public.profiles.body_weight_kg IS
  'C-47: aktuelles Koerpergewicht fuer spaetere Makro-/TDEE-Berechnung; Verlauf gehoert in Goals/Measurements.';
COMMENT ON COLUMN public.profiles.activity_level IS
  'C-47: grobes Aktivitaetsniveau fuer spaetere Makro-/TDEE-Berechnung; konkrete Ziele bleiben bei Goals.';
COMMENT ON COLUMN public.profiles.nutrition_goal IS
  'C-47: grobe Zielrichtung fuer spaetere Makroberechnung. nutrition_targets bleibt laut Sollliste bei Goals.';
COMMENT ON COLUMN public.profiles.pregnancy_started_on IS
  'C-47: Schwangerschaft ist ein Zeitraum, kein dauerhaftes Profilmerkmal.';
COMMENT ON COLUMN public.profiles.pregnancy_ended_on IS
  'C-47: Ende des Schwangerschaftszeitraums; Zustand wird fuer einen Stichtag berechnet.';
COMMENT ON COLUMN public.profiles.lactation_started_on IS
  'C-47: Stillzeit ist ein Zeitraum, kein dauerhaftes Profilmerkmal.';
COMMENT ON COLUMN public.profiles.lactation_ended_on IS
  'C-47: Ende des Stillzeitraums; Zustand wird fuer einen Stichtag berechnet.';

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

-- 2026-08-15 [cmd]: Der Trigger greift nur bei NEUEN Anmeldungen. Nach
-- einem Kettenneuaufbau standen beide bestehenden auth.users ohne Profil
-- da -- die Anmeldung schlug fehl, ohne dass jemand die Ursache sah.
-- Dieser Nachzug macht den Schritt selbstheilend: er legt fuer jeden
-- vorhandenen Nutzer ohne Profil eines an. Ohne ihn ist die Kette nur
-- fuer eine leere auth.users vollstaendig.
INSERT INTO public.profiles (id)
SELECT u.id
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

DO $$
DECLARE
  v_ohne integer;
BEGIN
  SELECT count(*) INTO v_ohne
  FROM auth.users u
  LEFT JOIN public.profiles p ON p.id = u.id
  WHERE p.id IS NULL;
  IF v_ohne > 0 THEN
    RAISE EXCEPTION '% auth.users ohne Profil -- der Nachzug hat nicht gegriffen', v_ohne;
  END IF;
  RAISE NOTICE 'OK: jeder auth.users-Eintrag hat ein Profil';
END $$;

COMMIT;
