BEGIN;

ALTER TABLE supplements.supplements
  DROP CONSTRAINT IF EXISTS supplements_evidence_grade_check;
ALTER TABLE supplements.supplements
  ADD CONSTRAINT supplements_evidence_grade_check
  CHECK (evidence_grade IS NULL OR evidence_grade IN ('S','A','B','C','D','E','F'));

ALTER TABLE supplements.supplement_evidence
  DROP CONSTRAINT IF EXISTS supplement_evidence_overall_grade_check;
ALTER TABLE supplements.supplement_evidence
  ADD CONSTRAINT supplement_evidence_overall_grade_check
  CHECK (overall_grade IS NULL OR overall_grade IN ('S','A','B','C','D','E','F'));

UPDATE supplements.supplements s
SET evidence_grade = sc.evidence->>'overall_grade',
    updated_at = now()
FROM supplements.substance_catalog sc
WHERE sc.id = s.slug
  AND sc.source_primary IN ('kimi_supplement','kimi_performance','kimi_peptide')
  AND sc.evidence->>'overall_grade' IN ('S','A','B','C','D','E','F')
  AND s.evidence_grade IS DISTINCT FROM sc.evidence->>'overall_grade';

UPDATE supplements.supplement_evidence se
SET overall_grade = sc.evidence->>'overall_grade',
    updated_at = now()
FROM supplements.supplements s
JOIN supplements.substance_catalog sc ON sc.id = s.slug
WHERE se.supplement_id = s.id
  AND sc.source_primary IN ('kimi_supplement','kimi_performance','kimi_peptide')
  AND sc.evidence->>'overall_grade' IN ('S','A','B','C','D','E','F')
  AND se.overall_grade IS DISTINCT FROM sc.evidence->>'overall_grade';

DELETE FROM medical.biomarker_reference_ranges
WHERE loinc_code = '1869-7'
  AND curated_slug = 'apob'
  AND canonical_name_en = 'ApoB';

WITH canonical(loinc_code, curated_slug, canonical_name_en) AS (
  VALUES
    ('2085-9', 'hdl_cholesterol', 'HDL Cholesterol'),
    ('2089-1', 'ldl_cholesterol', 'LDL Cholesterol'),
    ('2093-3', 'cholesterol_total', 'Cholesterol, Total'),
    ('2243-4', 'estradiol', 'Estradiol'),
    ('2986-8', 'testosterone_total', 'Testosterone, Total'),
    ('3024-7', 'free_t4', 'Free T4'),
    ('3051-0', 'free_t3', 'Free T3'),
    ('30522-7', 'crp_high_sensitivity', 'CRP, High Sensitivity'),
    ('4548-4', 'hemoglobin_a1c', 'Hemoglobin A1c'),
    ('6690-2', 'white_blood_cell_count', 'White Blood Cell Count'),
    ('777-3', 'platelet_count', 'Platelet Count'),
    ('789-8', 'red_blood_cell_count', 'Red Blood Cell Count')
)
UPDATE medical.biomarker_reference_ranges r
SET curated_slug = c.curated_slug,
    canonical_name_en = c.canonical_name_en
FROM canonical c
WHERE r.loinc_code = c.loinc_code;

DO $$
DECLARE
  v_ranges integer;
  v_multi_slug integer;
  v_supplement_grades integer;
  v_evidence_grades integer;
BEGIN
  SELECT count(*) INTO v_ranges FROM medical.biomarker_reference_ranges;
  IF v_ranges <> 560 THEN
    RAISE EXCEPTION 'C-248: biomarker_reference_ranges % statt 560', v_ranges;
  END IF;

  SELECT count(*) INTO v_multi_slug
  FROM (
    SELECT loinc_code
    FROM medical.biomarker_reference_ranges
    WHERE NULLIF(loinc_code, '') IS NOT NULL
    GROUP BY loinc_code
    HAVING count(DISTINCT curated_slug) > 1
  ) d;
  IF v_multi_slug <> 0 THEN
    RAISE EXCEPTION 'C-248: % LOINC-Codes tragen mehrere curated_slug', v_multi_slug;
  END IF;

  SELECT count(*) INTO v_supplement_grades FROM supplements.supplements WHERE evidence_grade IS NOT NULL;
  SELECT count(*) INTO v_evidence_grades FROM supplements.supplement_evidence WHERE overall_grade IS NOT NULL;
  IF v_supplement_grades <> 290 THEN
    RAISE EXCEPTION 'C-240: supplements.evidence_grade % statt 290', v_supplement_grades;
  END IF;
  IF v_evidence_grades <> 290 THEN
    RAISE EXCEPTION 'C-240: supplement_evidence.overall_grade % statt 290', v_evidence_grades;
  END IF;
END $$;

COMMIT;
