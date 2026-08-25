DO $$
DECLARE
  v_graded INTEGER;
BEGIN
  SELECT count(*) INTO v_graded
  FROM supplements.supplement_evidence
  WHERE overall_grade IS NOT NULL;

  IF v_graded <> 291 THEN
    RAISE EXCEPTION 'C-240 Negativprobe rot: supplement_evidence overall_grade % statt 291', v_graded;
  END IF;
END $$;
