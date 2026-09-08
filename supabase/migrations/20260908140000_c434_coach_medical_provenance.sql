-- C-434/E-74: Neue Medical-Zeilen bleiben bei einer ausdruecklichen
-- Full-Freigabe lesbar und tragen ihre Herkunft. Originale bleiben privat.
BEGIN;

ALTER TABLE medical.user_medications
  ADD COLUMN IF NOT EXISTS source_kind text,
  ADD COLUMN IF NOT EXISTS source_actor text,
  ADD COLUMN IF NOT EXISTS source_recorded_at timestamptz,
  ADD COLUMN IF NOT EXISTS source_lab_report_id uuid REFERENCES medical.lab_reports(id) ON DELETE SET NULL;

ALTER TABLE medical.user_conditions
  ADD COLUMN IF NOT EXISTS source_kind text,
  ADD COLUMN IF NOT EXISTS source_actor text,
  ADD COLUMN IF NOT EXISTS source_recorded_at timestamptz,
  ADD COLUMN IF NOT EXISTS source_lab_report_id uuid REFERENCES medical.lab_reports(id) ON DELETE SET NULL;

ALTER TABLE medical.appointments
  ADD COLUMN IF NOT EXISTS source_kind text,
  ADD COLUMN IF NOT EXISTS source_actor text,
  ADD COLUMN IF NOT EXISTS source_recorded_at timestamptz,
  ADD COLUMN IF NOT EXISTS source_lab_report_id uuid REFERENCES medical.lab_reports(id) ON DELETE SET NULL;

-- Altbestand wird nicht erfunden: Die nullable Spalten bleiben fuer schon
-- gespeicherte Zeilen leer. Jeder neue oder geaenderte Datensatz muss aber
-- klar sagen, wer ihn wann aus welcher Herkunft festgehalten hat.
CREATE OR REPLACE FUNCTION medical.validate_provenance()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  IF NEW.source_kind IS NULL
     OR NEW.source_kind NOT IN ('user', 'clinician', 'document', 'import', 'seed') THEN
    RAISE EXCEPTION 'medical provenance source_kind is required'
      USING ERRCODE = '23514';
  END IF;
  IF NULLIF(btrim(NEW.source_actor), '') IS NULL THEN
    RAISE EXCEPTION 'medical provenance source_actor is required'
      USING ERRCODE = '23514';
  END IF;
  IF NEW.source_recorded_at IS NULL THEN
    RAISE EXCEPTION 'medical provenance source_recorded_at is required'
      USING ERRCODE = '23514';
  END IF;
  IF NEW.source_lab_report_id IS NOT NULL AND NOT EXISTS (
    SELECT 1
    FROM medical.lab_reports
    WHERE id = NEW.source_lab_report_id
      AND user_id = NEW.user_id
  ) THEN
    RAISE EXCEPTION 'medical provenance lab report must belong to user'
      USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS user_medications_validate_provenance ON medical.user_medications;
CREATE TRIGGER user_medications_validate_provenance
  BEFORE INSERT OR UPDATE ON medical.user_medications
  FOR EACH ROW EXECUTE FUNCTION medical.validate_provenance();

DROP TRIGGER IF EXISTS user_conditions_validate_provenance ON medical.user_conditions;
CREATE TRIGGER user_conditions_validate_provenance
  BEFORE INSERT OR UPDATE ON medical.user_conditions
  FOR EACH ROW EXECUTE FUNCTION medical.validate_provenance();

DROP TRIGGER IF EXISTS appointments_validate_provenance ON medical.appointments;
CREATE TRIGGER appointments_validate_provenance
  BEFORE INSERT OR UPDATE ON medical.appointments
  FOR EACH ROW EXECUTE FUNCTION medical.validate_provenance();

DROP POLICY IF EXISTS appointments_coach_read ON medical.appointments;
CREATE POLICY appointments_coach_read ON medical.appointments
  FOR SELECT TO authenticated
  USING (coach.hat_sicht(user_id, 'medical', 'full'));

DROP POLICY IF EXISTS health_events_coach_read ON medical.health_events;
CREATE POLICY health_events_coach_read ON medical.health_events
  FOR SELECT TO authenticated
  USING (coach.hat_sicht(user_id, 'medical', 'full'));

COMMENT ON FUNCTION medical.validate_provenance() IS
  'C-434/E-74: Neue oder geaenderte Medical-Zeilen brauchen Herkunft, Akteur und Erfassungszeit; ein optionaler Befundbezug muss dem Nutzer gehoeren. Altbestand wird nicht erdacht.';
COMMENT ON POLICY appointments_coach_read ON medical.appointments IS
  'C-434: Coach-Lesezugriff nur bei der ausdruecklichen medizinischen Full-Freigabe des Klienten.';
COMMENT ON POLICY health_events_coach_read ON medical.health_events IS
  'C-434: Coach-Lesezugriff nur bei der ausdruecklichen medizinischen Full-Freigabe des Klienten.';

COMMIT;
