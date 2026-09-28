BEGIN;

INSERT INTO training.muscle_role_volume_rules (
  role,
  weekly_volume_factor,
  source_id,
  source_locator
)
VALUES
  (
    'primary',
    1.0,
    'pelland_2026_fractional_sets',
    'Pelland et al. 2026, fractional set counting: direct sets'
  ),
  (
    'secondary',
    0.5,
    'pelland_2026_fractional_sets',
    'Pelland et al. 2026, fractional set counting: indirect sets'
  )
ON CONFLICT (role) DO UPDATE
SET weekly_volume_factor = EXCLUDED.weekly_volume_factor,
    source_id = EXCLUDED.source_id,
    source_locator = EXCLUDED.source_locator,
    updated_at = now();

UPDATE training.exercise_muscles
SET activation_factor = NULL,
    activation_source_id = NULL,
    activation_evidence_class = NULL
WHERE activation_source_id = 'pelland_2026_fractional_sets'
  AND activation_evidence_class = 'C';

ALTER TABLE training.exercise_muscles
  VALIDATE CONSTRAINT exercise_muscles_activation_evidence_class_check;
ALTER TABLE training.exercise_muscles
  VALIDATE CONSTRAINT exercise_muscles_activation_measurement_complete;

DO $$
DECLARE
  v_rules integer;
  v_measured integer;
  v_unmeasured integer;
  v_convention_measurements integer;
  v_incomplete integer;
  v_role_volume numeric;
BEGIN
  SELECT count(*) INTO v_rules
  FROM training.muscle_role_volume_rules
  WHERE (role, weekly_volume_factor, source_id) IN (
    ('primary', 1.0::numeric, 'pelland_2026_fractional_sets'),
    ('secondary', 0.5::numeric, 'pelland_2026_fractional_sets')
  );

  SELECT
    count(*) FILTER (WHERE activation_factor IS NOT NULL),
    count(*) FILTER (WHERE activation_factor IS NULL),
    count(*) FILTER (WHERE activation_source_id = 'pelland_2026_fractional_sets'),
    count(*) FILTER (
      WHERE num_nonnulls(
        activation_factor,
        activation_source_id,
        activation_evidence_class
      ) NOT IN (0, 3)
    )
  INTO v_measured, v_unmeasured, v_convention_measurements, v_incomplete
  FROM training.exercise_muscles;

  SELECT sum(rule.weekly_volume_factor)
  INTO v_role_volume
  FROM training.exercise_muscles AS mapping
  JOIN training.muscle_role_volume_rules AS rule
    ON rule.role = mapping.role;

  IF v_rules <> 2
     OR v_measured <> 3
     OR v_unmeasured <> 6723
     OR v_convention_measurements <> 0
     OR v_incomplete <> 0
     OR v_role_volume <> 4941.0 THEN
    RAISE EXCEPTION
      'C-551: rules %, measured %, unmeasured %, convention %, incomplete %, role volume %',
      v_rules,
      v_measured,
      v_unmeasured,
      v_convention_measurements,
      v_incomplete,
      v_role_volume;
  END IF;
END $$;

COMMIT;
