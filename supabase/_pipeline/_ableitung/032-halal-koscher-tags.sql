-- =============================================================
-- 031 -- halal- und kosher-Tags aus den Ausschluss-Presets (C-93)
-- Datum: 2026-08-19
-- Zweck: Die beiden Tag-Definitionen aus C-98 bekommen Zuordnungen.
-- Laeuft nach 018 (Presets) und 027 (kuratierte Tags).
--
-- `[read]` WAS DAS TAG BEDEUTET, und was nicht:
--   Es sagt "enthaelt keine Zutat, die diese Regel ausschliesst".
--   Es sagt NICHT "ist halal" oder "ist koscher" — das haengt an der
--   Schlachtung und, bei kashrut, an der Trennung von Fleisch und
--   Milch. Beides steht in den BLS-Daten nicht.
--
--   Deshalb traegt jedes Preset einen `caveat_de`, der in der
--   Oberflaeche am Preset steht (G-65). Die Tags sind eine
--   Vorauswahl, keine Zertifizierung.
-- =============================================================

BEGIN;

-- Nur die eigenen Zuordnungen ersetzen, die kuratierten aus 027
-- bleiben unberuehrt.
DELETE FROM nutrition.food_tags WHERE tag_code IN ('halal', 'kosher');

-- `confidence` bewusst unter 1: die Aussage ist eine Ableitung aus
-- Zutaten, keine gepruefte Eigenschaft.
INSERT INTO nutrition.food_tags (food_id, tag_code, confidence)
SELECT f.id, 'halal', 0.60
FROM nutrition.foods f
WHERE NOT EXISTS (
  SELECT 1 FROM nutrition.exclusion_preset_matches m
  WHERE m.food_id = f.id AND m.preset_code = 'halal'
);

INSERT INTO nutrition.food_tags (food_id, tag_code, confidence)
SELECT f.id, 'kosher', 0.60
FROM nutrition.foods f
WHERE NOT EXISTS (
  SELECT 1 FROM nutrition.exclusion_preset_matches m
  WHERE m.food_id = f.id AND m.preset_code = 'kosher'
);

DO $$
DECLARE
  v_halal INTEGER;
  v_kosher INTEGER;
  v_foods INTEGER;
BEGIN
  SELECT count(*) INTO v_halal FROM nutrition.food_tags WHERE tag_code='halal';
  SELECT count(*) INTO v_kosher FROM nutrition.food_tags WHERE tag_code='kosher';
  SELECT count(*) INTO v_foods FROM nutrition.foods;

  IF v_halal = 0 OR v_kosher = 0 THEN
    RAISE EXCEPTION 'halal/kosher ohne Zuordnungen: % / %', v_halal, v_kosher;
  END IF;
  -- Ein Tag, das ALLES trifft, sagt nichts.
  IF v_halal >= v_foods OR v_kosher >= v_foods THEN
    RAISE EXCEPTION 'halal/kosher trifft den ganzen Bestand — die Regel greift nicht';
  END IF;
  -- Gegenprobe: Schweinefleisch darf NICHT halal sein.
  IF EXISTS (
    SELECT 1 FROM nutrition.food_tags t
    JOIN nutrition.foods f ON f.id = t.food_id
    WHERE t.tag_code='halal' AND f.name_de ~* 'schweineschnitzel'
  ) THEN
    RAISE EXCEPTION 'Schweineschnitzel traegt halal — die Regel greift nicht';
  END IF;

  RAISE NOTICE 'OK: halal % Zuordnungen, kosher %', v_halal, v_kosher;
END $$;

COMMIT;
