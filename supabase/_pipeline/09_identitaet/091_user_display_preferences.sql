-- =============================================================
-- 091 — Anzeigeeinstellungen je Nutzer (C-161 Teil D)
-- Zweck: Allgemeine Key-Value-Ablage fuer gespeicherte Ansichten.
--        Beispiel: Nährstoffbaum mit offenen Knoten, Zeitfenster und
--        Filter. Nicht browserspezifisch, damit Rechner und Telefon
--        denselben Zustand lesen.
-- =============================================================

BEGIN;

CREATE TABLE IF NOT EXISTS public.user_display_preferences (
  user_id        UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  preference_key TEXT NOT NULL,
  value          JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, preference_key),
  CONSTRAINT user_display_preferences_key_check CHECK (
    preference_key ~ '^[a-z0-9_.:-]{3,120}$'
  ),
  CONSTRAINT user_display_preferences_value_object_check CHECK (
    jsonb_typeof(value) = 'object'
  )
);

COMMENT ON TABLE public.user_display_preferences IS
  'C-161 Teil D: Allgemeine gespeicherte Anzeigeeinstellungen je Nutzer. Key-Value mit JSONB, nicht nur fuer den Naehrstoffbaum.';
COMMENT ON COLUMN public.user_display_preferences.preference_key IS
  'Stabiler Schluessel, z. B. nutrition.nutrient_tree. Keine eigene Spalte je Ansicht.';
COMMENT ON COLUMN public.user_display_preferences.value IS
  'JSONB-Zustand der Ansicht, z. B. offene Knoten, Zeitfenster und Filter. Die Anwendung validiert die konkrete Form je Key.';

CREATE INDEX IF NOT EXISTS user_display_preferences_user_idx
  ON public.user_display_preferences(user_id);

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS user_display_preferences_touch_updated_at
  ON public.user_display_preferences;
CREATE TRIGGER user_display_preferences_touch_updated_at
  BEFORE UPDATE ON public.user_display_preferences
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

REVOKE ALL ON public.user_display_preferences FROM PUBLIC;
REVOKE ALL ON public.user_display_preferences FROM anon;
REVOKE ALL ON public.user_display_preferences FROM authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_display_preferences TO authenticated;
GRANT ALL ON public.user_display_preferences TO service_role;

ALTER TABLE public.user_display_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS user_display_preferences_select ON public.user_display_preferences;
CREATE POLICY user_display_preferences_select
  ON public.user_display_preferences
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS user_display_preferences_insert ON public.user_display_preferences;
CREATE POLICY user_display_preferences_insert
  ON public.user_display_preferences
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS user_display_preferences_update ON public.user_display_preferences;
CREATE POLICY user_display_preferences_update
  ON public.user_display_preferences
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS user_display_preferences_delete ON public.user_display_preferences;
CREATE POLICY user_display_preferences_delete
  ON public.user_display_preferences
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

DO $$
DECLARE
  v_rls BOOLEAN;
  v_policies INTEGER;
BEGIN
  SELECT rowsecurity INTO v_rls
  FROM pg_tables
  WHERE schemaname = 'public'
    AND tablename = 'user_display_preferences';
  IF v_rls IS DISTINCT FROM true THEN
    RAISE EXCEPTION 'user_display_preferences: RLS ist nicht aktiv';
  END IF;

  SELECT count(*) INTO v_policies
  FROM pg_policies
  WHERE schemaname = 'public'
    AND tablename = 'user_display_preferences';
  IF v_policies <> 4 THEN
    RAISE EXCEPTION 'user_display_preferences: % Policies, erwartet 4', v_policies;
  END IF;
END $$;

COMMIT;
