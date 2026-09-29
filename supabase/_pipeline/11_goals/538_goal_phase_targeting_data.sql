-- G-538: Der einzige offene Seed ohne Ziel wird beendet, nicht erfunden
-- zugeordnet. Danach kann die Regel fuer alle Bestandszeilen validiert werden.

BEGIN;

DO $g538_data$
BEGIN
  UPDATE goals.goal_phases
  SET actual_end_date = DATE '2026-09-29',
      transition_reason =
        'Seed ohne Zielbindung, beendet bei der Strukturumstellung G-538'
  WHERE id = '31000000-0000-0000-0000-000000000201'
    AND goal_id IS NULL
    AND actual_end_date IS NULL;

  IF NOT EXISTS (
    SELECT 1
    FROM goals.goal_phases
    WHERE id = '31000000-0000-0000-0000-000000000201'
      AND goal_id IS NULL
      AND actual_end_date = DATE '2026-09-29'
      AND transition_reason =
        'Seed ohne Zielbindung, beendet bei der Strukturumstellung G-538'
  ) THEN
    RAISE EXCEPTION
      'G-538: Max-Seedphase fehlt oder traegt einen unerwarteten Zustand';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM goals.goal_phases
    WHERE actual_end_date IS NULL
      AND goal_id IS NULL
  ) THEN
    RAISE EXCEPTION 'G-538: mindestens eine offene Phase hat kein Ziel';
  END IF;

  UPDATE goals.goal_strategies
  SET max_duration_weeks = 20
  WHERE code = 'moderate_cut'
    AND max_duration_weeks IS DISTINCT FROM 20;

  IF NOT EXISTS (
    SELECT 1
    FROM goals.goal_strategies
    WHERE code = 'moderate_cut'
      AND max_duration_weeks = 20
  ) THEN
    RAISE EXCEPTION 'G-538: moderate_cut konnte nicht auf 20 Wochen gesetzt werden';
  END IF;
END
$g538_data$;

ALTER TABLE goals.goal_phases
  VALIDATE CONSTRAINT goal_phases_open_requires_goal;

COMMIT;
