-- G-528 A1 / G-529 A9: GO-07-Testphasen an den E1-Vertrag anpassen.
-- Die beiden Lean-Bulk-Raten werden aus dem bisherigen 250-kcal-Testwert
-- und demselben Profilgewicht hergeleitet. Das ist Bestandserhalt, kein
-- fachliches Ratenband. Notizen in parameters bleiben erhalten.

BEGIN;

DO $$
BEGIN
  IF (SELECT count(*) FROM goals.goal_phases
      WHERE parameters ->> 'source' = 'GO-07 testdata') NOT IN (0, 5) THEN
    RAISE EXCEPTION 'G-528: erwartet 0 oder 5 GO-07-Testphasen';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM goals.goal_phases gp
    JOIN public.profiles p ON p.id = gp.user_id
    WHERE gp.parameters ->> 'source' = 'GO-07 testdata'
      AND gp.phase_type = 'lean_bulk'
      AND (
        p.body_weight_kg IS NULL
        OR p.body_weight_kg <= 0
        OR COALESCE(
          gp.parameters ->> 'calorie_surplus',
          gp.parameters ->> 'calorie_surplus_kcal'
        ) IS NULL
      )
  ) THEN
    RAISE EXCEPTION 'G-528: Lean-Bulk-Testwert kann nicht verlustfrei in Rate umgerechnet werden';
  END IF;
END $$;

UPDATE goals.goal_phases gp
SET
  variant = NULL,
  zielrate_pct_kg_woche = CASE
    WHEN gp.phase_type = 'lean_bulk' THEN round((
      COALESCE(
        gp.parameters ->> 'calorie_surplus',
        gp.parameters ->> 'calorie_surplus_kcal'
      )::numeric / (11 * p.body_weight_kg)
    )::numeric, 3)
    ELSE gp.zielrate_pct_kg_woche
  END,
  parameters = gp.parameters
    - 'calorie_surplus'
    - 'calorie_surplus_kcal'
    - 'calorie_deficit'
FROM public.profiles p
WHERE p.id = gp.user_id
  AND gp.parameters ->> 'source' = 'GO-07 testdata';

DO $$
BEGIN
  IF (SELECT count(*) FROM goals.goal_phases
      WHERE parameters ->> 'source' = 'GO-07 testdata'
        AND variant IS NOT NULL) <> 0 THEN
    RAISE EXCEPTION 'G-528: ungueltige Test-variant blieb zurueck';
  END IF;

  IF (SELECT count(*) FROM goals.goal_phases
      WHERE parameters ->> 'source' = 'GO-07 testdata') = 5
     AND (SELECT count(*) FROM goals.goal_phases
          WHERE parameters ->> 'source' = 'GO-07 testdata'
            AND phase_type = 'lean_bulk'
            AND zielrate_pct_kg_woche IS NOT NULL) <> 2 THEN
    RAISE EXCEPTION 'G-528: erwartet zwei Lean-Bulk-Testphasen mit Rate';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM goals.goal_phases
    WHERE parameters ->> 'source' = 'GO-07 testdata'
      AND parameters ?| ARRAY[
        'calorie_surplus', 'calorie_surplus_kcal', 'calorie_deficit'
      ]
  ) THEN
    RAISE EXCEPTION 'G-528: gespeichertes Kaloriendelta blieb zurueck';
  END IF;
END $$;

ALTER TABLE goals.goal_phases
  VALIDATE CONSTRAINT goal_phases_zielrate_passt_zur_art;

DO $$
BEGIN
  IF NOT COALESCE((
    SELECT convalidated
    FROM pg_constraint
    WHERE conrelid = 'goals.goal_phases'::regclass
      AND conname = 'goal_phases_zielrate_passt_zur_art'
  ), false) THEN
    RAISE EXCEPTION 'G-529: Phasenart-CHECK ist nicht VALID';
  END IF;
END $$;

COMMIT;
