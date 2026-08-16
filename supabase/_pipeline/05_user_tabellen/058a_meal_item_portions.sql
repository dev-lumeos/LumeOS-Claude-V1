-- =============================================================
-- 058a — Gewaehlte Portion in meal_items festhalten (C-51)
-- Zweck: Protokoll der Eingabe speichern, ohne amount_g als
--        kanonische Rechengroesse aufzugeben.
--
-- Entscheidung:
--   * Kein FK auf foods_portions. Schritt 029 baut diese Tabelle aus
--     der Datendatei neu auf; zufaellige Portion-UUIDs duerfen alte
--     Tagebucheintraege nicht nachtraeglich verschieben.
--   * Stattdessen Snapshot: portion_name, portion_quantity,
--     portion_amount_g. Damit bleibt "2 Scheiben" sichtbar, und
--     amount_g bleibt eingefroren.
--   * Dasselbe Feldmodell gilt fuer BLS-Portionen und Custom-Food-
--     servings. foods_custom.serving_name/serving_size_g werden beim
--     Erfassen in dieselben Snapshot-Spalten kopiert.
-- =============================================================

\set ON_ERROR_STOP on

BEGIN;

ALTER TABLE nutrition.meal_items
  ADD COLUMN IF NOT EXISTS portion_name TEXT,
  ADD COLUMN IF NOT EXISTS portion_quantity NUMERIC(10,3),
  ADD COLUMN IF NOT EXISTS portion_amount_g NUMERIC(10,2);

ALTER TABLE nutrition.meal_items
  DROP CONSTRAINT IF EXISTS meal_items_portion_input_check;

ALTER TABLE nutrition.meal_items
  ADD CONSTRAINT meal_items_portion_input_check CHECK (
    (
      portion_name IS NULL
      AND portion_quantity IS NULL
      AND portion_amount_g IS NULL
    )
    OR
    (
      portion_name IS NOT NULL
      AND length(trim(portion_name)) > 0
      AND portion_quantity IS NOT NULL
      AND portion_quantity > 0
      AND portion_amount_g IS NOT NULL
      AND portion_amount_g > 0
      AND abs(amount_g - (portion_quantity * portion_amount_g)) <= 0.01
    )
  );

CREATE INDEX IF NOT EXISTS idx_meal_items_portion_name
  ON nutrition.meal_items(user_id, portion_name)
  WHERE portion_name IS NOT NULL;

COMMENT ON COLUMN nutrition.meal_items.portion_name IS
  'C-51: Gewaehlte Portion als Snapshot, z.B. "1 Scheibe" oder Custom serving_name. NULL = direkte Grammeingabe.';
COMMENT ON COLUMN nutrition.meal_items.portion_quantity IS
  'C-51: Anzahl der gewaehlten Portionen. NULL = direkte Grammeingabe.';
COMMENT ON COLUMN nutrition.meal_items.portion_amount_g IS
  'C-51: Gramm pro Portion zum Zeitpunkt des Erfassens. Bleibt stehen, auch wenn die Portionsdefinition spaeter korrigiert wird.';

COMMIT;
