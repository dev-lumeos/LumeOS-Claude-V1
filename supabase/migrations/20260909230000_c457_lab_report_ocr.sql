-- C-457: OCR ist ein privater, pruefbarer Zustand des vorhandenen Laborberichts.
-- Es gibt bewusst keine OCR-Nebentabelle und keine automatische Uebernahme in
-- lab_result_values: Rohdaten bleiben bis zur Nutzerbestaetigung Rohdaten.
BEGIN;

ALTER TABLE medical.lab_reports
  ADD COLUMN IF NOT EXISTS ocr_status text,
  ADD COLUMN IF NOT EXISTS ocr_results jsonb,
  ADD COLUMN IF NOT EXISTS extracted_values jsonb,
  ADD COLUMN IF NOT EXISTS review_required boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS total_markers_found integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS markers_needs_review integer NOT NULL DEFAULT 0;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'medical.lab_reports'::regclass
      AND conname = 'lab_reports_ocr_status_check'
  ) THEN
    ALTER TABLE medical.lab_reports
      ADD CONSTRAINT lab_reports_ocr_status_check
      CHECK (ocr_status IS NULL OR ocr_status IN ('pending', 'processing', 'completed', 'failed', 'needs_review'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'medical.lab_reports'::regclass
      AND conname = 'lab_reports_ocr_results_json_check'
  ) THEN
    ALTER TABLE medical.lab_reports
      ADD CONSTRAINT lab_reports_ocr_results_json_check
      CHECK (ocr_results IS NULL OR jsonb_typeof(ocr_results) IN ('object', 'array'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'medical.lab_reports'::regclass
      AND conname = 'lab_reports_extracted_values_json_check'
  ) THEN
    ALTER TABLE medical.lab_reports
      ADD CONSTRAINT lab_reports_extracted_values_json_check
      CHECK (extracted_values IS NULL OR jsonb_typeof(extracted_values) = 'array');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'medical.lab_reports'::regclass
      AND conname = 'lab_reports_ocr_counts_check'
  ) THEN
    ALTER TABLE medical.lab_reports
      ADD CONSTRAINT lab_reports_ocr_counts_check
      CHECK (
        total_markers_found >= 0
        AND markers_needs_review >= 0
        AND markers_needs_review <= total_markers_found
      );
  END IF;
END;
$$;

CREATE INDEX IF NOT EXISTS lab_reports_ocr_queue_idx
  ON medical.lab_reports(user_id, ocr_status, updated_at)
  WHERE ocr_status IN ('pending', 'processing', 'needs_review');

-- NULL bedeutet: Fuer diesen (auch historischen) Bericht wurde nie OCR angefordert.
-- So werden bestehende manuelle, Seed- und PDF-Berichte nicht nachtraeglich als OCR
-- ausgegeben. Der Startweg verlangt ein bereits privat verknuepftes Original.
CREATE OR REPLACE FUNCTION medical.start_lab_report_ocr(
  p_report_id uuid
)
RETURNS TABLE (
  report_id uuid,
  ocr_status text
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_user_id uuid;
  v_report_id uuid;
BEGIN
  v_user_id := nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'medical OCR: authentication required' USING ERRCODE = '28000';
  END IF;

  UPDATE medical.lab_reports AS report
  SET ocr_status = 'processing',
      ocr_results = NULL,
      extracted_values = NULL,
      review_required = false,
      total_markers_found = 0,
      markers_needs_review = 0
  WHERE report.id = p_report_id
    AND report.user_id = v_user_id
    AND report.file_ref IS NOT NULL
  RETURNING report.id INTO v_report_id;

  IF v_report_id IS NULL THEN
    RAISE EXCEPTION 'medical OCR: own report with original not found' USING ERRCODE = 'P0002';
  END IF;

  RETURN QUERY SELECT v_report_id, 'processing'::text;
END;
$$;

CREATE OR REPLACE FUNCTION medical.store_lab_report_ocr_result(
  p_report_id uuid,
  p_ocr_results jsonb,
  p_extracted_values jsonb
)
RETURNS TABLE (
  report_id uuid,
  ocr_status text,
  total_markers_found integer,
  markers_needs_review integer
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_user_id uuid;
  v_total integer;
  v_needs_review integer;
  v_report_id uuid;
  v_status text;
BEGIN
  v_user_id := nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'medical OCR: authentication required' USING ERRCODE = '28000';
  END IF;
  IF p_ocr_results IS NULL OR jsonb_typeof(p_ocr_results) NOT IN ('object', 'array') THEN
    RAISE EXCEPTION 'medical OCR: raw result must be a JSON object or array' USING ERRCODE = '22023';
  END IF;
  IF p_extracted_values IS NULL OR jsonb_typeof(p_extracted_values) <> 'array' THEN
    RAISE EXCEPTION 'medical OCR: extracted values must be a JSON array' USING ERRCODE = '22023';
  END IF;
  IF EXISTS (
    SELECT 1
    FROM jsonb_array_elements(p_extracted_values) AS item(value)
    WHERE jsonb_typeof(item.value) <> 'object'
       OR nullif(btrim(item.value ->> 'biomarker_name'), '') IS NULL
       OR nullif(btrim(item.value ->> 'unit'), '') IS NULL
       OR jsonb_typeof(item.value -> 'confidence') <> 'number'
       OR (item.value ->> 'confidence')::numeric NOT BETWEEN 0 AND 1
       OR (item.value ? 'needs_review' AND jsonb_typeof(item.value -> 'needs_review') <> 'boolean')
  ) THEN
    RAISE EXCEPTION 'medical OCR: every extracted value needs biomarker_name, unit and confidence from 0 to 1' USING ERRCODE = '22023';
  END IF;

  v_total := jsonb_array_length(p_extracted_values);
  SELECT count(*)::integer INTO v_needs_review
  FROM jsonb_array_elements(p_extracted_values) AS item(value)
  WHERE coalesce((item.value ->> 'needs_review')::boolean, false)
     OR (item.value ->> 'confidence')::numeric < 0.85;

  v_status := CASE WHEN v_needs_review > 0 THEN 'needs_review' ELSE 'completed' END;
  UPDATE medical.lab_reports AS report
  SET ocr_status = v_status,
      ocr_results = p_ocr_results,
      extracted_values = p_extracted_values,
      review_required = v_needs_review > 0,
      total_markers_found = v_total,
      markers_needs_review = v_needs_review
  WHERE report.id = p_report_id
    AND report.user_id = v_user_id
    AND report.ocr_status = 'processing'
  RETURNING report.id, report.ocr_status INTO v_report_id, v_status;

  IF v_report_id IS NULL THEN
    RAISE EXCEPTION 'medical OCR: own processing report not found' USING ERRCODE = 'P0002';
  END IF;

  RETURN QUERY SELECT v_report_id, v_status, v_total, v_needs_review;
END;
$$;

REVOKE ALL ON FUNCTION medical.start_lab_report_ocr(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION medical.store_lab_report_ocr_result(uuid, jsonb, jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION medical.start_lab_report_ocr(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION medical.store_lab_report_ocr_result(uuid, jsonb, jsonb) TO authenticated, service_role;

COMMENT ON COLUMN medical.lab_reports.ocr_status IS
  'C-457: NULL ohne OCR; sonst Zustand des privaten OCR-Importwegs.';
COMMENT ON COLUMN medical.lab_reports.ocr_results IS
  'C-457: unveraendertes Rohresultat der OCR, keine medizinische Ableitung.';
COMMENT ON COLUMN medical.lab_reports.extracted_values IS
  'C-457: extrahierte OCR-Zeilen bis zur Nutzerpruefung; schreibt keine lab_result_values automatisch.';
COMMENT ON FUNCTION medical.store_lab_report_ocr_result(uuid, jsonb, jsonb) IS
  'C-457: speichert nur das OCR-Ergebnis am eigenen Bericht und leitet Review ab; keine automatische medizinische Wertuebernahme.';

COMMIT;
