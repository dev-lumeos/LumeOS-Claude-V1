-- C-429/E-74: Nutzer verwalten Originalbefunde, Termine und fremde
-- medizinische Aussagen mit eingefrorener Herkunft. Das System bewertet oder
-- erzeugt keinen dieser Inhalte.

BEGIN;

CREATE SCHEMA IF NOT EXISTS medical;

-- SPEC_02:151, SPEC_04:40 und SPEC_06:117 nennen Supabase Storage fuer das
-- Original. Ein privater Bucket plus pfadgebundene Objekt-Policies ist der
-- Schreibweg; die Bytes gehen ueber die Storage-API, nicht durch SQL.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'medical-originals',
  'medical-originals',
  false,
  20971520,
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/heic']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS medical_originals_select_own ON storage.objects;
DROP POLICY IF EXISTS medical_originals_insert_own ON storage.objects;
DROP POLICY IF EXISTS medical_originals_update_own ON storage.objects;
DROP POLICY IF EXISTS medical_originals_delete_own ON storage.objects;

CREATE POLICY medical_originals_select_own ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'medical-originals'
    AND owner_id = (SELECT auth.uid())::text
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );
CREATE POLICY medical_originals_insert_own ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'medical-originals'
    AND owner_id = (SELECT auth.uid())::text
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );
CREATE POLICY medical_originals_update_own ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'medical-originals'
    AND owner_id = (SELECT auth.uid())::text
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  )
  WITH CHECK (
    bucket_id = 'medical-originals'
    AND owner_id = (SELECT auth.uid())::text
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );
CREATE POLICY medical_originals_delete_own ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'medical-originals'
    AND owner_id = (SELECT auth.uid())::text
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );

-- Der Upload erfolgt zuerst ueber Storage. Diese Funktion kann nur ein
-- bestehendes, eigenes Objekt im festen Reportpfad an den eigenen Befund
-- anheften. file_ref bleibt damit der bestehende Lesepfad der Spec.
CREATE OR REPLACE FUNCTION medical.attach_lab_report_original(
  p_report_id uuid,
  p_object_name text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_user_id uuid := auth.uid();
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'authentication required' USING ERRCODE = '42501';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM medical.lab_reports
    WHERE id = p_report_id AND user_id = v_user_id
  ) THEN
    RAISE EXCEPTION 'lab report not found' USING ERRCODE = 'P0002';
  END IF;

  IF p_object_name !~ ('^' || v_user_id::text || '/' || p_report_id::text || '/[^/]+$') THEN
    RAISE EXCEPTION 'object path must be inside the report owner path' USING ERRCODE = '22023';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM storage.objects
    WHERE bucket_id = 'medical-originals'
      AND name = p_object_name
      AND owner_id = v_user_id::text
  ) THEN
    RAISE EXCEPTION 'uploaded original not found' USING ERRCODE = 'P0002';
  END IF;

  UPDATE medical.lab_reports
  SET file_ref = p_object_name
  WHERE id = p_report_id AND user_id = v_user_id;
END;
$$;

REVOKE ALL ON FUNCTION medical.attach_lab_report_original(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION medical.attach_lab_report_original(uuid, text) TO authenticated, service_role;

CREATE TABLE IF NOT EXISTS medical.appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  appointment_type text NOT NULL
    CHECK (appointment_type IN ('doctor', 'labor', 'other')),
  starts_at timestamptz NOT NULL,
  time_zone text NOT NULL CHECK (btrim(time_zone) <> ''),
  status text NOT NULL DEFAULT 'scheduled'
    CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  title text,
  notes text,
  lab_report_id uuid REFERENCES medical.lab_reports(id) ON DELETE SET NULL,
  medication_id uuid REFERENCES medical.user_medications(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS appointments_user_starts_at_idx
  ON medical.appointments(user_id, starts_at);

CREATE OR REPLACE FUNCTION medical.appointments_validate_owner_links()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NEW.lab_report_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM medical.lab_reports WHERE id = NEW.lab_report_id AND user_id = NEW.user_id
  ) THEN
    RAISE EXCEPTION 'appointment lab report must belong to user' USING ERRCODE = '23514';
  END IF;
  IF NEW.medication_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM medical.user_medications WHERE id = NEW.medication_id AND user_id = NEW.user_id
  ) THEN
    RAISE EXCEPTION 'appointment medication must belong to user' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS appointments_validate_owner_links ON medical.appointments;
CREATE TRIGGER appointments_validate_owner_links
  BEFORE INSERT OR UPDATE OF user_id, lab_report_id, medication_id ON medical.appointments
  FOR EACH ROW EXECUTE FUNCTION medical.appointments_validate_owner_links();
DROP TRIGGER IF EXISTS appointments_touch_updated_at ON medical.appointments;
CREATE TRIGGER appointments_touch_updated_at
  BEFORE UPDATE ON medical.appointments
  FOR EACH ROW EXECUTE FUNCTION medical.touch_updated_at();

CREATE TABLE IF NOT EXISTS medical.health_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type text NOT NULL CHECK (event_type IN ('diagnosis', 'treatment', 'operation')),
  occurred_on date NOT NULL,
  occurred_at timestamptz,
  title text NOT NULL CHECK (btrim(title) <> ''),
  details text,
  source_kind text NOT NULL
    CHECK (source_kind IN ('user', 'clinician', 'document', 'import', 'seed')),
  source_actor text NOT NULL CHECK (btrim(source_actor) <> ''),
  source_recorded_at timestamptz NOT NULL,
  source_lab_report_id uuid REFERENCES medical.lab_reports(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS health_events_user_occurred_idx
  ON medical.health_events(user_id, occurred_on DESC, created_at DESC);

CREATE OR REPLACE FUNCTION medical.health_events_validate_source_report()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NEW.source_lab_report_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM medical.lab_reports
    WHERE id = NEW.source_lab_report_id AND user_id = NEW.user_id
  ) THEN
    RAISE EXCEPTION 'source lab report must belong to user' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS health_events_validate_source_report ON medical.health_events;
CREATE TRIGGER health_events_validate_source_report
  BEFORE INSERT OR UPDATE OF user_id, source_lab_report_id ON medical.health_events
  FOR EACH ROW EXECUTE FUNCTION medical.health_events_validate_source_report();
DROP TRIGGER IF EXISTS health_events_touch_updated_at ON medical.health_events;
CREATE TRIGGER health_events_touch_updated_at
  BEFORE UPDATE ON medical.health_events
  FOR EACH ROW EXECUTE FUNCTION medical.touch_updated_at();

ALTER TABLE medical.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical.health_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS appointments_select_own ON medical.appointments;
DROP POLICY IF EXISTS appointments_insert_own ON medical.appointments;
DROP POLICY IF EXISTS appointments_update_own ON medical.appointments;
DROP POLICY IF EXISTS appointments_delete_own ON medical.appointments;
CREATE POLICY appointments_select_own ON medical.appointments
  FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
CREATE POLICY appointments_insert_own ON medical.appointments
  FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY appointments_update_own ON medical.appointments
  FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY appointments_delete_own ON medical.appointments
  FOR DELETE TO authenticated USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS health_events_select_own ON medical.health_events;
DROP POLICY IF EXISTS health_events_insert_own ON medical.health_events;
DROP POLICY IF EXISTS health_events_update_own ON medical.health_events;
DROP POLICY IF EXISTS health_events_delete_own ON medical.health_events;
CREATE POLICY health_events_select_own ON medical.health_events
  FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
CREATE POLICY health_events_insert_own ON medical.health_events
  FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY health_events_update_own ON medical.health_events
  FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY health_events_delete_own ON medical.health_events
  FOR DELETE TO authenticated USING ((SELECT auth.uid()) = user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON medical.appointments, medical.health_events TO authenticated;
GRANT ALL ON medical.appointments, medical.health_events TO service_role;

-- C-429: Die Zeitachse ist aus Quellen abgeleitet, nicht selbst speichernd.
-- Sie zitiert den vom Nutzer festgehaltenen Inhalt samt Herkunft.
CREATE OR REPLACE VIEW medical.health_timeline
WITH (security_invoker = true) AS
SELECT
  e.user_id,
  e.id AS entry_id,
  e.event_type AS entry_type,
  e.occurred_on,
  e.occurred_at,
  e.title,
  e.details,
  e.source_kind,
  e.source_actor,
  e.source_recorded_at,
  e.source_lab_report_id,
  e.created_at
FROM medical.health_events e

UNION ALL

SELECT
  r.user_id,
  r.id AS entry_id,
  'lab_report'::text AS entry_type,
  r.report_date AS occurred_on,
  CASE WHEN r.report_time IS NULL THEN NULL ELSE r.report_date + r.report_time END AS occurred_at,
  COALESCE(NULLIF(btrim(r.title), ''), NULLIF(btrim(r.lab_name), ''), 'Laborbefund') AS title,
  r.notes AS details,
  r.source AS source_kind,
  COALESCE(NULLIF(btrim(r.source_detail), ''), r.source) AS source_actor,
  r.created_at AS source_recorded_at,
  r.id AS source_lab_report_id,
  r.created_at
FROM medical.lab_reports r;

GRANT SELECT ON medical.health_timeline TO authenticated, service_role;

COMMENT ON TABLE medical.health_events IS
  'C-429/E-74: Vom Nutzer erfasste Zitate fremder medizinischer Aussagen. Keine Diagnose oder Bewertung durch LumeOS; Herkunft ist verpflichtend.';
COMMENT ON VIEW medical.health_timeline IS
  'C-429: security-invoker-Zeitachse aus Nutzerzitaten und Laborbefunden; speichert keine abgeleiteten Aussagen.';

COMMIT;
