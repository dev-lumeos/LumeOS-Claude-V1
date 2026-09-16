BEGIN;

-- C-498/G-458: Der Kettenschritt 498_global_allergies_daten uebernimmt
-- zuerst den Altbestand. Auf bereits migrierten Umgebungen ist dies ein No-op.
ALTER TABLE nutrition.food_preferences DROP COLUMN IF EXISTS allergies;

COMMIT;
