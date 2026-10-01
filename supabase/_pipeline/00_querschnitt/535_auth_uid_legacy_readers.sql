-- G-535: Anwendungsfunktionen lesen die Sitzung ueber Supabases zentralen
-- auth.uid()-Helper. Nur der Helper selbst traegt den Singular-GUC noch als
-- Rueckfall fuer alte PostgREST-Versionen; die Fachfunktionen duplizieren
-- diesen Kompatibilitaetsweg nicht.
BEGIN;

CREATE OR REPLACE FUNCTION coach.raise_alert(
  p_client uuid,
  p_kind text,
  p_severity text,
  p_title text,
  p_detail text,
  p_metric jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_coach uuid := auth.uid();
  v_id uuid;
BEGIN
  IF v_coach IS NULL OR NOT EXISTS (
    SELECT 1
    FROM coach.relationships
    WHERE coach_id = v_coach
      AND client_id = p_client
      AND status = 'active'
  ) THEN
    RAISE EXCEPTION 'active own relationship required' USING ERRCODE = '42501';
  END IF;

  IF p_kind NOT IN (
    'checkin_overdue', 'inactivity', 'adherence_low',
    'progress_stagnation', 'engagement_low'
  ) THEN
    RAISE EXCEPTION 'medical or unknown alert kinds are not generated'
      USING ERRCODE = '23514';
  END IF;

  IF p_severity NOT IN ('info', 'low', 'medium', 'high', 'critical')
     OR jsonb_typeof(p_metric) <> 'object' THEN
    RAISE EXCEPTION 'invalid factual alert' USING ERRCODE = '23514';
  END IF;

  PERFORM pg_advisory_xact_lock(
    hashtextextended(v_coach::text || p_client::text || p_kind, 0)
  );

  SELECT id
  INTO v_id
  FROM coach.alerts
  WHERE coach_id = v_coach
    AND client_id = p_client
    AND kind = p_kind
    AND created_at >= now() - interval '24 hours'
    AND status <> 'done'
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_id IS NOT NULL THEN
    RETURN v_id;
  END IF;

  INSERT INTO coach.alerts (
    coach_id, client_id, module, kind, severity,
    title, detail, metric, created_by
  ) VALUES (
    v_coach, p_client, 'general', p_kind, p_severity,
    p_title, p_detail, p_metric, v_coach
  )
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION goals.body_circumference_write(
  p_measurement_date date,
  p_measurement_time time,
  p_measurement_source text DEFAULT 'manual',
  p_source_detail text DEFAULT NULL,
  p_notes text DEFAULT NULL,
  p_neck_cm numeric DEFAULT NULL,
  p_shoulders_cm numeric DEFAULT NULL,
  p_chest_cm numeric DEFAULT NULL,
  p_upper_arm_left_cm numeric DEFAULT NULL,
  p_upper_arm_right_cm numeric DEFAULT NULL,
  p_forearm_left_cm numeric DEFAULT NULL,
  p_forearm_right_cm numeric DEFAULT NULL,
  p_waist_cm numeric DEFAULT NULL,
  p_hip_cm numeric DEFAULT NULL,
  p_thigh_left_cm numeric DEFAULT NULL,
  p_thigh_right_cm numeric DEFAULT NULL,
  p_calf_left_cm numeric DEFAULT NULL,
  p_calf_right_cm numeric DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_measurement_id uuid;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'body_circumference_write: Anmeldung erforderlich'
      USING ERRCODE = '42501';
  END IF;

  INSERT INTO goals.body_circumferences (
    user_id, measurement_date, measurement_time,
    neck_cm, shoulders_cm, chest_cm,
    upper_arm_left_cm, upper_arm_right_cm,
    forearm_left_cm, forearm_right_cm,
    waist_cm, hip_cm, thigh_left_cm, thigh_right_cm, calf_left_cm, calf_right_cm,
    measurement_source, source_detail, notes
  ) VALUES (
    v_user_id, p_measurement_date, p_measurement_time,
    p_neck_cm, p_shoulders_cm, p_chest_cm,
    p_upper_arm_left_cm, p_upper_arm_right_cm,
    p_forearm_left_cm, p_forearm_right_cm,
    p_waist_cm, p_hip_cm, p_thigh_left_cm, p_thigh_right_cm,
    p_calf_left_cm, p_calf_right_cm,
    p_measurement_source, p_source_detail, p_notes
  )
  RETURNING id INTO v_measurement_id;

  RETURN v_measurement_id;
END;
$$;

CREATE OR REPLACE FUNCTION medical.import_lab_report_rows(
  p_user_id uuid,
  p_report_date date,
  p_report_time time,
  p_lab_name text,
  p_title text,
  p_source text,
  p_rows jsonb
)
RETURNS TABLE (
  report_id uuid,
  inserted_count integer,
  exact_count integer,
  ambiguous_count integer,
  unknown_count integer
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_report_id uuid;
  v_row jsonb;
  v_raw_name text;
  v_unit text;
  v_candidates jsonb;
  v_candidate_count integer;
  v_top jsonb;
  v_second jsonb;
  v_status text;
  v_loinc text;
  v_confidence numeric(3,2);
  v_exact integer := 0;
  v_ambiguous integer := 0;
  v_unknown integer := 0;
  v_auth_user uuid;
BEGIN
  v_auth_user := auth.uid();

  IF p_user_id <> v_auth_user THEN
    RAISE EXCEPTION 'medical import: user mismatch';
  END IF;
  IF jsonb_typeof(p_rows) <> 'array' THEN
    RAISE EXCEPTION 'medical import: rows must be an array';
  END IF;

  INSERT INTO medical.lab_reports (
    user_id, report_date, report_time, lab_name, title, source, source_detail
  ) VALUES (
    p_user_id, p_report_date, p_report_time, p_lab_name, p_title, p_source,
    'medical.import_lab_report_rows'
  )
  RETURNING id INTO v_report_id;

  FOR v_row IN SELECT value FROM jsonb_array_elements(p_rows)
  LOOP
    v_raw_name := NULLIF(btrim(v_row->>'marker_name'), '');
    v_unit := NULLIF(btrim(v_row->>'unit'), '');
    IF v_raw_name IS NULL THEN
      RAISE EXCEPTION 'medical import: marker_name missing';
    END IF;
    IF v_unit IS NULL THEN
      RAISE EXCEPTION 'medical import: unit missing';
    END IF;

    SELECT coalesce(jsonb_agg(to_jsonb(c)), '[]'::jsonb), count(*)
    INTO v_candidates, v_candidate_count
    FROM medical.biomarker_marker_candidates(v_raw_name, v_unit) c;

    v_top := CASE WHEN v_candidate_count > 0 THEN v_candidates->0 ELSE NULL END;
    v_second := CASE WHEN v_candidate_count > 1 THEN v_candidates->1 ELSE NULL END;

    IF v_candidate_count = 0 THEN
      v_status := 'unknown';
      v_loinc := NULL;
      v_confidence := 0.00;
      v_unknown := v_unknown + 1;
    ELSIF coalesce(v_top->>'match_policy', 'exact') = 'exact'
      AND (
        v_candidate_count = 1
        OR (
          (v_top->>'confidence')::numeric >= 0.95
          AND (v_second->>'confidence')::numeric < (v_top->>'confidence')::numeric
        )
      ) THEN
      v_status := 'exact';
      v_loinc := v_top->>'loinc_code';
      v_confidence := (v_top->>'confidence')::numeric(3,2);
      v_exact := v_exact + 1;
    ELSE
      v_status := 'ambiguous';
      v_loinc := NULL;
      v_confidence := 0.50;
      v_ambiguous := v_ambiguous + 1;
    END IF;

    INSERT INTO medical.lab_result_values (
      report_id,
      user_id,
      loinc_code,
      raw_marker_name,
      match_status,
      match_candidates,
      match_source,
      marker_name_snapshot,
      unit_snapshot,
      value_numeric,
      value_text,
      value_operator,
      lab_reference_low,
      lab_reference_high,
      lab_reference_text,
      lab_reference_unit,
      lab_reference_source,
      source,
      entry_confidence,
      needs_verification,
      notes
    ) VALUES (
      v_report_id,
      p_user_id,
      v_loinc,
      v_raw_name,
      v_status,
      v_candidates,
      CASE WHEN v_top IS NULL THEN NULL ELSE v_top->>'match_source' END,
      coalesce(v_top->>'canonical_name', v_raw_name),
      v_unit,
      NULLIF(v_row->>'value_numeric', '')::numeric,
      NULLIF(v_row->>'value_text', ''),
      coalesce(NULLIF(v_row->>'value_operator', ''), '='),
      NULLIF(v_row->>'lab_reference_low', '')::numeric,
      NULLIF(v_row->>'lab_reference_high', '')::numeric,
      NULLIF(v_row->>'lab_reference_text', ''),
      NULLIF(v_row->>'lab_reference_unit', ''),
      NULLIF(v_row->>'lab_reference_source', ''),
      p_source,
      v_confidence,
      v_status <> 'exact',
      NULLIF(v_row->>'notes', '')
    );
  END LOOP;

  report_id := v_report_id;
  inserted_count := jsonb_array_length(p_rows);
  exact_count := v_exact;
  ambiguous_count := v_ambiguous;
  unknown_count := v_unknown;
  RETURN NEXT;
END;
$$;

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
  v_user_id := auth.uid();
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
  v_user_id := auth.uid();
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
       OR (
         item.value ? 'needs_review'
         AND jsonb_typeof(item.value -> 'needs_review') <> 'boolean'
       )
  ) THEN
    RAISE EXCEPTION 'medical OCR: every extracted value needs biomarker_name, unit and confidence from 0 to 1'
      USING ERRCODE = '22023';
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

CREATE OR REPLACE FUNCTION nutrition.meal_plan_set_next_plan(
  p_plan_id uuid,
  p_next_plan_id uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $function$
DECLARE
  v_user_id uuid := auth.uid();
  v_next_plan_id uuid;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'meal_plan_set_next_plan: Anmeldung erforderlich'
      USING ERRCODE = '42501';
  END IF;

  IF p_plan_id IS NULL OR p_next_plan_id IS NULL OR p_plan_id = p_next_plan_id THEN
    RAISE EXCEPTION 'meal_plan_set_next_plan: Quelle und unterschiedlicher Folgeplan sind erforderlich'
      USING ERRCODE = '22023';
  END IF;

  PERFORM 1
  FROM nutrition.meal_plans mp
  WHERE mp.id = p_plan_id
    AND mp.user_id = v_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'meal_plan_set_next_plan: eigener Quellplan nicht gefunden'
      USING ERRCODE = 'P0002';
  END IF;

  PERFORM 1
  FROM nutrition.meal_plans mp
  WHERE mp.id = p_next_plan_id
    AND mp.user_id = v_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'meal_plan_set_next_plan: eigener Folgeplan nicht gefunden'
      USING ERRCODE = 'P0002';
  END IF;

  UPDATE nutrition.meal_plans mp
  SET lifecycle_type = 'sequence',
      next_plan_id = p_next_plan_id
  WHERE mp.id = p_plan_id
    AND mp.user_id = v_user_id
  RETURNING mp.next_plan_id INTO v_next_plan_id;

  RETURN v_next_plan_id;
END;
$function$;

COMMIT;
