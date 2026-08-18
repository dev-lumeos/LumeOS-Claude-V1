-- =============================================================
-- 140 -- Medical-Schema (C-69)
-- Datum: 2026-08-18
-- Zweck: Medical-Katalog, Laborbefunde und einzelne Messwerte.
-- Idempotent: CREATE IF NOT EXISTS, Policies per DROP + CREATE.
--
-- Zuschnitt:
--   [read] SPEC_06 beschreibt acht Tabellen. C-69 baut nur Katalog,
--          Befund und Messwert; Insights, Reports, Symptome,
--          Medikamente, Alerts und Scores bleiben Folgeschritte.
--   [read] UserMedicalInsight und UserHealthReport stehen in SPEC_02,
--          aber nicht in SPEC_06. Der Widerspruch wird nicht aufgeloest.
--   [cmd]  Im aktuellen Repo existiert vor diesem Schritt kein
--          medical-Schema.
--
-- Entscheidungen:
--   1. LOINC-Katalog und kuratierte Katalog-Referenzbereiche sind
--      Stammdaten: authenticated darf lesen, nicht schreiben.
--   2. Laborberichte und Messwerte sind Gesundheitsdaten:
--      eigene_zeilen mit auth.uid(), DML nur auf eigene Zeilen.
--   3. Markername und Einheit werden am Messwert eingefroren. Katalog-
--      korrekturen verschieben alte Befunde dadurch nicht.
--   4. Labor-eigene Referenzbereiche stehen am Messwert. Katalogbereiche
--      sind nur Fallback und werden von der Lesefunktion als solche
--      gekennzeichnet.
--   5. Zeit wie bei nutrition.meals: lokaler Tag + lokale Uhrzeit,
--      nicht nur timestamptz. Der Server laeuft in UTC.
-- =============================================================

BEGIN;

CREATE SCHEMA IF NOT EXISTS medical;

CREATE OR REPLACE FUNCTION medical.touch_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TABLE IF NOT EXISTS medical.biomarker_catalog (
  loinc_code                 TEXT PRIMARY KEY,
  loinc_status               TEXT NOT NULL,
  common_test_rank           INTEGER NOT NULL CHECK (common_test_rank > 0),
  class_type                 SMALLINT NOT NULL CHECK (class_type IN (1, 2)),
  class_type_name            TEXT NOT NULL,
  loinc_class                TEXT NOT NULL,
  panel_type                 TEXT,
  order_observation          TEXT,

  component                  TEXT,
  long_common_name           TEXT NOT NULL,
  short_name                 TEXT,
  display_name               TEXT,
  consumer_name              TEXT,
  german_component           TEXT,
  german_long_name           TEXT,
  german_display_name        TEXT,
  german_class_name          TEXT,

  example_units              TEXT,
  example_ucum_units         TEXT,
  units_required             TEXT,
  property                   TEXT,
  time_aspect                TEXT,
  system                     TEXT,
  scale_type                 TEXT,
  method                     TEXT,
  definition                 TEXT,
  synonyms                   JSONB NOT NULL DEFAULT '{}'::jsonb,
  panels                     JSONB NOT NULL DEFAULT '[]'::jsonb,
  external_copyright_notice  TEXT,
  reference_range_status     TEXT NOT NULL DEFAULT 'not_in_loinc',
  source_file                TEXT NOT NULL,
  loinc_version              TEXT NOT NULL DEFAULT '2.82',
  license_notice             TEXT NOT NULL,
  imported_at                TIMESTAMPTZ NOT NULL DEFAULT now(),

  CHECK (jsonb_typeof(synonyms) = 'object'),
  CHECK (jsonb_typeof(panels) = 'array')
);

CREATE INDEX IF NOT EXISTS biomarker_catalog_rank_idx
  ON medical.biomarker_catalog(common_test_rank);
CREATE INDEX IF NOT EXISTS biomarker_catalog_class_idx
  ON medical.biomarker_catalog(loinc_class, common_test_rank);
CREATE INDEX IF NOT EXISTS biomarker_catalog_system_idx
  ON medical.biomarker_catalog(system);
CREATE TABLE IF NOT EXISTS medical.biomarker_reference_ranges (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loinc_code         TEXT REFERENCES medical.biomarker_catalog(loinc_code) ON DELETE CASCADE,
  curated_slug       TEXT,
  canonical_name_en  TEXT,
  range_type         TEXT NOT NULL CHECK (range_type IN ('lab', 'optimal', 'threshold')),
  sex                TEXT NOT NULL DEFAULT 'all' CHECK (sex IN ('all', 'male', 'female')),
  age_min_years      NUMERIC(5,2),
  age_max_years      NUMERIC(5,2),
  population         TEXT NOT NULL DEFAULT 'general',
  min_value          NUMERIC(14,4),
  max_value          NUMERIC(14,4),
  value_text         TEXT,
  unit               TEXT,
  source             TEXT NOT NULL,
  source_path        TEXT,
  source_status      TEXT NOT NULL,
  decision_status    TEXT NOT NULL,
  is_active          BOOLEAN NOT NULL DEFAULT true,
  imported_at        TIMESTAMPTZ NOT NULL DEFAULT now(),

  CHECK (age_min_years IS NULL OR age_max_years IS NULL OR age_min_years <= age_max_years),
  CHECK (min_value IS NULL OR max_value IS NULL OR min_value <= max_value),
  CHECK (min_value IS NOT NULL OR max_value IS NOT NULL OR value_text IS NOT NULL),
  CHECK (loinc_code IS NOT NULL OR curated_slug IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS biomarker_reference_ranges_loinc_idx
  ON medical.biomarker_reference_ranges(loinc_code, range_type, sex)
  WHERE is_active AND loinc_code IS NOT NULL;

CREATE TABLE IF NOT EXISTS medical.lab_reports (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  report_date            DATE NOT NULL,
  report_time            TIME,
  lab_name               TEXT,
  title                  TEXT,
  source                 TEXT NOT NULL DEFAULT 'manual'
    CHECK (source IN ('manual', 'pdf_upload', 'photo_ocr', 'lab_import', 'seed')),
  source_detail          TEXT,
  file_ref               TEXT,
  notes                  TEXT,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (id, user_id),
  CHECK (report_time IS NULL OR EXTRACT(SECOND FROM report_time) = 0)
);

CREATE INDEX IF NOT EXISTS lab_reports_user_date_idx
  ON medical.lab_reports(user_id, report_date DESC, report_time DESC);

CREATE TABLE IF NOT EXISTS medical.lab_result_values (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id                UUID NOT NULL,
  user_id                  UUID NOT NULL,
  loinc_code               TEXT NOT NULL REFERENCES medical.biomarker_catalog(loinc_code) ON DELETE RESTRICT,

  marker_name_snapshot     TEXT NOT NULL,
  unit_snapshot            TEXT NOT NULL,
  value_numeric            NUMERIC(14,4),
  value_text               TEXT,
  value_operator           TEXT NOT NULL DEFAULT '=' CHECK (value_operator IN ('=', '<', '<=', '>', '>=')),

  lab_reference_low        NUMERIC(14,4),
  lab_reference_high       NUMERIC(14,4),
  lab_reference_text       TEXT,
  lab_reference_unit       TEXT,
  lab_reference_source     TEXT,

  fasting_status           TEXT NOT NULL DEFAULT 'unknown'
    CHECK (fasting_status IN ('fasting', 'non_fasting', 'unknown')),
  source                   TEXT NOT NULL DEFAULT 'manual'
    CHECK (source IN ('manual', 'pdf_upload', 'photo_ocr', 'lab_import', 'seed')),
  source_detail            TEXT,
  entry_confidence         NUMERIC(3,2) NOT NULL DEFAULT 1.00 CHECK (entry_confidence BETWEEN 0 AND 1),
  needs_verification       BOOLEAN NOT NULL DEFAULT false,
  notes                    TEXT,
  frozen_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT now(),

  FOREIGN KEY (report_id, user_id)
    REFERENCES medical.lab_reports(id, user_id) ON DELETE CASCADE,
  CHECK (value_numeric IS NOT NULL OR value_text IS NOT NULL),
  CHECK (lab_reference_low IS NULL OR lab_reference_high IS NULL OR lab_reference_low <= lab_reference_high)
);

CREATE INDEX IF NOT EXISTS lab_result_values_report_idx
  ON medical.lab_result_values(report_id);
CREATE INDEX IF NOT EXISTS lab_result_values_user_loinc_idx
  ON medical.lab_result_values(user_id, loinc_code, created_at DESC);
CREATE INDEX IF NOT EXISTS lab_result_values_verify_idx
  ON medical.lab_result_values(user_id)
  WHERE needs_verification;

DROP TRIGGER IF EXISTS lab_reports_touch_updated_at ON medical.lab_reports;
CREATE TRIGGER lab_reports_touch_updated_at
  BEFORE UPDATE ON medical.lab_reports
  FOR EACH ROW EXECUTE FUNCTION medical.touch_updated_at();

DROP TRIGGER IF EXISTS lab_result_values_touch_updated_at ON medical.lab_result_values;
CREATE TRIGGER lab_result_values_touch_updated_at
  BEFORE UPDATE ON medical.lab_result_values
  FOR EACH ROW EXECUTE FUNCTION medical.touch_updated_at();

CREATE OR REPLACE FUNCTION medical.lab_result_values_read(
  p_user_id UUID,
  p_report_id UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  report_id UUID,
  report_date DATE,
  report_time TIME,
  lab_name TEXT,
  loinc_code TEXT,
  marker_name TEXT,
  unit TEXT,
  value_numeric NUMERIC,
  value_text TEXT,
  value_operator TEXT,
  reference_low NUMERIC,
  reference_high NUMERIC,
  reference_text TEXT,
  reference_unit TEXT,
  reference_source TEXT,
  reference_range_id UUID,
  source TEXT,
  frozen_at TIMESTAMPTZ
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT
    v.id,
    v.report_id,
    r.report_date,
    r.report_time,
    r.lab_name,
    v.loinc_code,
    v.marker_name_snapshot AS marker_name,
    v.unit_snapshot AS unit,
    v.value_numeric,
    v.value_text,
    v.value_operator,
    COALESCE(v.lab_reference_low, rr.min_value) AS reference_low,
    COALESCE(v.lab_reference_high, rr.max_value) AS reference_high,
    COALESCE(v.lab_reference_text, rr.value_text) AS reference_text,
    COALESCE(v.lab_reference_unit, rr.unit) AS reference_unit,
    CASE
      WHEN v.lab_reference_low IS NOT NULL
        OR v.lab_reference_high IS NOT NULL
        OR v.lab_reference_text IS NOT NULL
      THEN 'lab_report'
      WHEN rr.id IS NOT NULL THEN 'catalog_fallback'
      ELSE 'none'
    END AS reference_source,
    rr.id AS reference_range_id,
    v.source,
    v.frozen_at
  FROM medical.lab_result_values v
  JOIN medical.lab_reports r
    ON r.id = v.report_id
   AND r.user_id = v.user_id
  LEFT JOIN LATERAL (
    SELECT br.*
    FROM medical.biomarker_reference_ranges br
    WHERE br.loinc_code = v.loinc_code
      AND br.is_active
      AND br.decision_status <> 'do_not_import_without_source'
      AND br.range_type = 'lab'
      AND br.sex IN ('all', (
        SELECT p.biological_sex
        FROM public.profiles p
        WHERE p.id = v.user_id
      ))
    ORDER BY
      CASE br.sex WHEN 'all' THEN 1 ELSE 0 END,
      br.age_min_years NULLS FIRST,
      br.id
    LIMIT 1
  ) rr ON true
  WHERE v.user_id = p_user_id
    AND (p_report_id IS NULL OR v.report_id = p_report_id)
  ORDER BY r.report_date DESC, r.report_time DESC NULLS LAST, v.created_at, v.id;
$$;

GRANT USAGE ON SCHEMA medical TO authenticated, service_role;

GRANT SELECT ON medical.biomarker_catalog TO authenticated;
GRANT SELECT ON medical.biomarker_reference_ranges TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON medical.lab_reports TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON medical.lab_result_values TO authenticated;
GRANT EXECUTE ON FUNCTION medical.lab_result_values_read(UUID, UUID) TO authenticated;

GRANT ALL ON medical.biomarker_catalog TO service_role;
GRANT ALL ON medical.biomarker_reference_ranges TO service_role;
GRANT ALL ON medical.lab_reports TO service_role;
GRANT ALL ON medical.lab_result_values TO service_role;
GRANT EXECUTE ON FUNCTION medical.lab_result_values_read(UUID, UUID) TO service_role;

ALTER TABLE medical.biomarker_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical.biomarker_reference_ranges ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical.lab_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical.lab_result_values ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS biomarker_catalog_select ON medical.biomarker_catalog;
DROP POLICY IF EXISTS biomarker_reference_ranges_select ON medical.biomarker_reference_ranges;
DROP POLICY IF EXISTS lab_reports_select ON medical.lab_reports;
DROP POLICY IF EXISTS lab_reports_insert ON medical.lab_reports;
DROP POLICY IF EXISTS lab_reports_update ON medical.lab_reports;
DROP POLICY IF EXISTS lab_reports_delete ON medical.lab_reports;
DROP POLICY IF EXISTS lab_result_values_select ON medical.lab_result_values;
DROP POLICY IF EXISTS lab_result_values_insert ON medical.lab_result_values;
DROP POLICY IF EXISTS lab_result_values_update ON medical.lab_result_values;
DROP POLICY IF EXISTS lab_result_values_delete ON medical.lab_result_values;

CREATE POLICY biomarker_catalog_select ON medical.biomarker_catalog
  FOR SELECT TO authenticated USING (true);
CREATE POLICY biomarker_reference_ranges_select ON medical.biomarker_reference_ranges
  FOR SELECT TO authenticated USING (true);

CREATE POLICY lab_reports_select ON medical.lab_reports
  FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
CREATE POLICY lab_reports_insert ON medical.lab_reports
  FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY lab_reports_update ON medical.lab_reports
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY lab_reports_delete ON medical.lab_reports
  FOR DELETE TO authenticated USING ((SELECT auth.uid()) = user_id);

CREATE POLICY lab_result_values_select ON medical.lab_result_values
  FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
CREATE POLICY lab_result_values_insert ON medical.lab_result_values
  FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY lab_result_values_update ON medical.lab_result_values
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY lab_result_values_delete ON medical.lab_result_values
  FOR DELETE TO authenticated USING ((SELECT auth.uid()) = user_id);

COMMIT;
