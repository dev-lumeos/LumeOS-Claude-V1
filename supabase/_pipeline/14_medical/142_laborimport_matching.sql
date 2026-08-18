-- =============================================================
-- 142 -- Medical-Laborimport: Marker-Matching (C-72)
-- Datum: 2026-08-18
-- Zweck: Aus extrahierten Befundzeilen (Rohname, Wert, Einheit) sichere,
--        mehrdeutige oder unbekannte Messwert-Zeilen erzeugen.
--
-- Kein PDF/OCR. Dieser Schritt ist die Zuordnungsschicht nach der
-- Dateiverarbeitung: Rohtext rein, Kandidaten/Status raus.
-- =============================================================

BEGIN;

CREATE TABLE IF NOT EXISTS medical.biomarker_aliases (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alias                 TEXT NOT NULL,
  alias_folded          TEXT NOT NULL,
  locale                TEXT NOT NULL DEFAULT 'und' CHECK (locale IN ('de', 'en', 'th', 'und')),
  loinc_code            TEXT NOT NULL REFERENCES medical.biomarker_catalog(loinc_code) ON DELETE CASCADE,
  canonical_name        TEXT,
  source                TEXT NOT NULL CHECK (source IN ('predecessor_synonym', 'curated_ambiguous')),
  match_policy          TEXT NOT NULL DEFAULT 'exact' CHECK (match_policy IN ('exact', 'ambiguous')),
  confidence            NUMERIC(3,2) NOT NULL DEFAULT 0.95 CHECK (confidence BETWEEN 0 AND 1),
  already_in_loinc      BOOLEAN NOT NULL DEFAULT false,
  notes                 TEXT,
  imported_at           TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (alias_folded, loinc_code, source, match_policy)
);

CREATE INDEX IF NOT EXISTS biomarker_aliases_folded_idx
  ON medical.biomarker_aliases(alias_folded);
CREATE INDEX IF NOT EXISTS biomarker_aliases_loinc_idx
  ON medical.biomarker_aliases(loinc_code);

ALTER TABLE medical.lab_result_values
  ALTER COLUMN loinc_code DROP NOT NULL;

ALTER TABLE medical.lab_result_values
  ADD COLUMN IF NOT EXISTS raw_marker_name TEXT,
  ADD COLUMN IF NOT EXISTS match_status TEXT NOT NULL DEFAULT 'exact',
  ADD COLUMN IF NOT EXISTS match_candidates JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS match_source TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'lab_result_values_match_status_check'
      AND conrelid = 'medical.lab_result_values'::regclass
  ) THEN
    ALTER TABLE medical.lab_result_values
      ADD CONSTRAINT lab_result_values_match_status_check
      CHECK (match_status IN ('exact', 'ambiguous', 'unknown', 'manual_verified'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'lab_result_values_match_candidates_json_check'
      AND conrelid = 'medical.lab_result_values'::regclass
  ) THEN
    ALTER TABLE medical.lab_result_values
      ADD CONSTRAINT lab_result_values_match_candidates_json_check
      CHECK (jsonb_typeof(match_candidates) = 'array');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'lab_result_values_match_integrity_check'
      AND conrelid = 'medical.lab_result_values'::regclass
  ) THEN
    ALTER TABLE medical.lab_result_values
      ADD CONSTRAINT lab_result_values_match_integrity_check
      CHECK (
        (match_status IN ('exact', 'manual_verified') AND loinc_code IS NOT NULL)
        OR (match_status IN ('ambiguous', 'unknown') AND loinc_code IS NULL AND needs_verification)
      );
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS lab_result_values_match_status_idx
  ON medical.lab_result_values(user_id, match_status)
  WHERE needs_verification;

CREATE OR REPLACE FUNCTION medical.biomarker_marker_candidates(
  p_marker_name TEXT,
  p_unit TEXT DEFAULT NULL
)
RETURNS TABLE (
  loinc_code TEXT,
  match_source TEXT,
  match_policy TEXT,
  confidence NUMERIC,
  canonical_name TEXT,
  display_name TEXT,
  system TEXT,
  example_ucum_units TEXT,
  common_test_rank INTEGER
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  WITH q AS (
    SELECT nutrition.search_fold(p_marker_name) AS folded,
           NULLIF(btrim(lower(coalesce(p_unit, ''))), '') AS unit_folded
  ),
  alias_candidates AS (
    SELECT
      a.loinc_code,
      a.source AS match_source,
      a.match_policy,
      a.confidence
        + CASE
            WHEN q.unit_folded IS NOT NULL
             AND lower(coalesce(c.example_ucum_units, '')) = q.unit_folded
            THEN 0.03 ELSE 0
          END AS confidence,
      a.canonical_name,
      c.display_name,
      c.system,
      c.example_ucum_units,
      c.common_test_rank
    FROM q
    JOIN medical.biomarker_aliases a
      ON a.alias_folded = q.folded
    JOIN medical.biomarker_catalog c
      ON c.loinc_code = a.loinc_code
  ),
  catalog_terms AS (
    SELECT c.loinc_code,
           'loinc_catalog'::text AS match_source,
           'exact'::text AS match_policy,
           CASE
             WHEN q.unit_folded IS NOT NULL
              AND lower(coalesce(c.example_ucum_units, '')) = q.unit_folded
             THEN 0.83::numeric
             ELSE 0.80::numeric
           END AS confidence,
           c.long_common_name AS canonical_name,
           c.display_name,
           c.system,
           c.example_ucum_units,
           c.common_test_rank
    FROM q
    JOIN medical.biomarker_catalog c ON true
    JOIN LATERAL (
      SELECT term
      FROM (
        VALUES
          (c.component),
          (c.long_common_name),
          (c.short_name),
          (c.display_name),
          (c.consumer_name),
          (c.german_component),
          (c.german_long_name),
          (c.german_display_name)
      ) AS direct_terms(term)
      WHERE nutrition.search_fold(term) = q.folded
      UNION ALL
      SELECT s.value
      FROM jsonb_array_elements_text(coalesce(c.synonyms->'loinc_related_names', '[]'::jsonb)) AS s(value)
      WHERE nutrition.search_fold(s.value) = q.folded
    ) matched ON true
  ),
  combined AS (
    SELECT * FROM alias_candidates
    UNION ALL
    SELECT * FROM catalog_terms
  )
  SELECT
    c.loinc_code,
    (array_agg(c.match_source ORDER BY c.confidence DESC, c.common_test_rank))[1] AS match_source,
    CASE
      WHEN bool_or(c.match_policy = 'ambiguous') THEN 'ambiguous'
      ELSE 'exact'
    END AS match_policy,
    max(c.confidence)::numeric(3,2) AS confidence,
    (array_agg(c.canonical_name ORDER BY c.confidence DESC, c.common_test_rank))[1] AS canonical_name,
    (array_agg(c.display_name ORDER BY c.confidence DESC, c.common_test_rank))[1] AS display_name,
    (array_agg(c.system ORDER BY c.confidence DESC, c.common_test_rank))[1] AS system,
    (array_agg(c.example_ucum_units ORDER BY c.confidence DESC, c.common_test_rank))[1] AS example_ucum_units,
    min(c.common_test_rank) AS common_test_rank
  FROM combined c
  GROUP BY c.loinc_code
  ORDER BY confidence DESC, common_test_rank NULLS LAST, loinc_code
  LIMIT 10;
$$;

CREATE OR REPLACE FUNCTION medical.import_lab_report_rows(
  p_user_id UUID,
  p_report_date DATE,
  p_report_time TIME,
  p_lab_name TEXT,
  p_title TEXT,
  p_source TEXT,
  p_rows JSONB
)
RETURNS TABLE (
  report_id UUID,
  inserted_count INTEGER,
  exact_count INTEGER,
  ambiguous_count INTEGER,
  unknown_count INTEGER
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_report_id UUID;
  v_row JSONB;
  v_raw_name TEXT;
  v_unit TEXT;
  v_candidates JSONB;
  v_candidate_count INTEGER;
  v_top JSONB;
  v_second JSONB;
  v_status TEXT;
  v_loinc TEXT;
  v_confidence NUMERIC(3,2);
  v_exact INTEGER := 0;
  v_ambiguous INTEGER := 0;
  v_unknown INTEGER := 0;
  v_auth_user UUID;
BEGIN
  v_auth_user := nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;

  IF p_user_id <> v_auth_user THEN
    RAISE EXCEPTION 'medical import: user mismatch';
  END IF;
  IF jsonb_typeof(p_rows) <> 'array' THEN
    RAISE EXCEPTION 'medical import: rows must be an array';
  END IF;

  INSERT INTO medical.lab_reports (
    user_id, report_date, report_time, lab_name, title, source, source_detail
  )
  VALUES (
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
    )
    VALUES (
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

GRANT SELECT ON medical.biomarker_aliases TO authenticated;
GRANT EXECUTE ON FUNCTION medical.biomarker_marker_candidates(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION medical.import_lab_report_rows(UUID, DATE, TIME, TEXT, TEXT, TEXT, JSONB) TO authenticated;

GRANT ALL ON medical.biomarker_aliases TO service_role;
GRANT EXECUTE ON FUNCTION medical.biomarker_marker_candidates(TEXT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION medical.import_lab_report_rows(UUID, DATE, TIME, TEXT, TEXT, TEXT, JSONB) TO service_role;

ALTER TABLE medical.biomarker_aliases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS biomarker_aliases_select ON medical.biomarker_aliases;
CREATE POLICY biomarker_aliases_select ON medical.biomarker_aliases
  FOR SELECT TO authenticated USING (true);

COMMIT;
