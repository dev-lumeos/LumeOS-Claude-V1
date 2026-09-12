-- C-473: Rechteabweichungen des Schema-Waechters und die ausstehende
-- Monitoring-Erweiterung an medical.user_medications.
--
-- public-Defaults gelten fuer Tabellen UND Sichten. Neue public-Objekte aus
-- LumeOS-Migrationen (Owner postgres oder supabase_admin) erhalten deshalb
-- keine App-Rechte mehr implizit; jeder Quellschritt vergibt seine benoetigten
-- Rechte explizit.

BEGIN;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE ALL ON TABLES FROM anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public
  REVOKE ALL ON TABLES FROM anon, authenticated, service_role;

ALTER TABLE medical.user_medications
  ADD COLUMN IF NOT EXISTS monitoring BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS monitoring_frequency TEXT
    CHECK (monitoring_frequency IS NULL OR monitoring_frequency IN (
      'weekly', 'monthly', 'quarterly', 'annually', 'as_needed'
    )),
  ADD COLUMN IF NOT EXISTS last_test DATE,
  ADD COLUMN IF NOT EXISTS next_due DATE,
  ADD COLUMN IF NOT EXISTS monitoring_overdue BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS targets TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS side_effects TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS physician TEXT,
  ADD COLUMN IF NOT EXISTS rx TEXT,
  ADD COLUMN IF NOT EXISTS prescription_ref TEXT;

REVOKE DELETE ON nutrition.shopping_lists FROM authenticated;

REVOKE ALL ON public.activity_stream FROM anon, authenticated, service_role;
GRANT SELECT ON public.activity_stream TO authenticated, service_role;

REVOKE ALL ON public.muscle_training_loads FROM anon, authenticated, service_role;
GRANT SELECT ON public.muscle_training_loads TO authenticated, service_role;

DO $$
DECLARE
  v_monitoring_columns integer;
BEGIN
  SELECT count(*) INTO v_monitoring_columns
  FROM information_schema.columns
  WHERE table_schema = 'medical'
    AND table_name = 'user_medications'
    AND column_name IN (
      'monitoring', 'monitoring_frequency', 'last_test', 'next_due',
      'monitoring_overdue', 'targets', 'side_effects', 'physician',
      'rx', 'prescription_ref'
    );

  IF v_monitoring_columns <> 10 THEN
    RAISE EXCEPTION 'C-473: % Monitoring-Spalten, erwartet 10', v_monitoring_columns;
  END IF;
END $$;

COMMIT;
