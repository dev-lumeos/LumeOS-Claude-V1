BEGIN;

INSERT INTO medical.biomarker_reference_ranges (
  curated_slug,
  loinc_code,
  canonical_name_en,
  range_type,
  sex,
  population,
  value_text,
  source,
  source_path,
  source_status,
  decision_status,
  is_active
) VALUES (
  'c248_negative_duplicate',
  '1884-6',
  'C-248 negative duplicate',
  'lab',
  'all',
  'general',
  'negative probe',
  'C-248 negative probe',
  'backup/c248/negative_multislug_c248.sql',
  'negative_probe',
  'negative_probe',
  true
);

DO $$
DECLARE
  v_multi_slug INTEGER;
BEGIN
  SELECT count(*) INTO v_multi_slug
  FROM (
    SELECT loinc_code
    FROM medical.biomarker_reference_ranges
    WHERE NULLIF(loinc_code, '') IS NOT NULL
    GROUP BY loinc_code
    HAVING count(DISTINCT curated_slug) > 1
  ) d;

  IF v_multi_slug <> 0 THEN
    RAISE EXCEPTION 'C-248 Negativprobe rot: % LOINC-Codes mit mehreren curated_slug', v_multi_slug;
  END IF;
END $$;

ROLLBACK;
