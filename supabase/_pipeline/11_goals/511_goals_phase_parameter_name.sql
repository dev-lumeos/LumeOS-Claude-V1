-- G-511: Ein kanonischer Name fuer den exakten Lean-Bulk-Zuschlag.
--
-- PHASE_MODELS.md, API.md und die kuratierte Parameterdatei verwenden
-- calorie_surplus. calorie_surplus_kcal ist der einzelne abweichende Name
-- aus GO-07. Zwei Namen fuer denselben Wert waeren zwei Wahrheiten.
-- Widersprechen sich beide Werte, wird nicht geraten.

BEGIN;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM goals.goal_phases
    WHERE parameters ? 'calorie_surplus_kcal'
      AND parameters ? 'calorie_surplus'
      AND parameters -> 'calorie_surplus_kcal'
          IS DISTINCT FROM parameters -> 'calorie_surplus'
  ) THEN
    RAISE EXCEPTION
      'goal_phases.parameters: calorie_surplus und calorie_surplus_kcal widersprechen sich';
  END IF;
END $$;

UPDATE goals.goal_phases
SET parameters = (parameters - 'calorie_surplus_kcal')
                 || jsonb_build_object(
                      'calorie_surplus',
                      parameters -> 'calorie_surplus_kcal'
                    )
WHERE parameters ? 'calorie_surplus_kcal';

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM goals.goal_phases
    WHERE parameters ? 'calorie_surplus_kcal'
  ) THEN
    RAISE EXCEPTION
      'goal_phases.parameters: alter Schluessel calorie_surplus_kcal blieb zurueck';
  END IF;
END $$;

COMMIT;
