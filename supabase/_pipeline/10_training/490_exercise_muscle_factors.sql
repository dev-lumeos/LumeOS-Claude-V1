BEGIN;

UPDATE training.exercise_muscles
SET faktor = CASE role
      WHEN 'primary' THEN 1.0
      WHEN 'secondary' THEN 0.5
    END,
    source_id = 'pelland_2026_fractional_sets',
    evidence_class = 'C'
WHERE role IN ('primary', 'secondary');

-- PMC4327372 reports the three bench-press EMG means directly. These
-- rows are kept as A even when C-491 moves Chest/Shoulders to their
-- anatomically useful descendants.
UPDATE training.exercise_muscles em
SET faktor = CASE mg.name
      WHEN 'Chest' THEN 0.95
      WHEN 'Shoulders' THEN 0.79
      WHEN 'Triceps' THEN 0.67
    END,
    source_id = 'pmc4327372_bench_press_emg',
    evidence_class = 'A'
FROM training.exercises e,
     training.muscle_groups mg
WHERE em.exercise_id = e.id
  AND mg.id = em.muscle_group_id
  AND e.name = 'Barbell Bench Press'
  AND mg.name IN ('Chest', 'Shoulders', 'Triceps');

DO $$
DECLARE
  v_missing integer;
  v_bad integer;
  v_bench integer;
BEGIN
  SELECT count(*) INTO v_missing
  FROM training.exercise_muscles
  WHERE faktor IS NULL OR source_id IS NULL OR evidence_class IS NULL;

  SELECT count(*) INTO v_bad
  FROM training.exercise_muscles
  WHERE faktor <= 0
     OR evidence_class NOT IN ('A', 'C')
     OR (faktor NOT IN (1.0, 0.5) AND source_id IS NULL);

  SELECT count(*) INTO v_bench
  FROM training.exercise_muscles em
  JOIN training.exercises e ON e.id = em.exercise_id
  JOIN training.muscle_groups mg ON mg.id = em.muscle_group_id
  WHERE e.name = 'Barbell Bench Press'
    AND (mg.name, em.faktor, em.evidence_class, em.source_id) IN (
      ('Chest', 0.95::numeric, 'A', 'pmc4327372_bench_press_emg'),
      ('Shoulders', 0.79::numeric, 'A', 'pmc4327372_bench_press_emg'),
      ('Triceps', 0.67::numeric, 'A', 'pmc4327372_bench_press_emg')
    );

  IF v_missing <> 0 OR v_bad <> 0 OR v_bench <> 3 THEN
    RAISE EXCEPTION 'C-490: missing %, bad %, bench %', v_missing, v_bad, v_bench;
  END IF;
END $$;

COMMIT;
