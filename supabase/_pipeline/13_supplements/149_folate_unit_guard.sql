-- =============================================================
-- 149 -- C-149: Folat ohne belegte DFE-Umrechnung nicht bilanzieren
--
-- Vitamin D liegt bereits als quellenbelegte Umrechnung in der
-- kanonischen nutrient_defs-Einheit vor. Die Folat-Katalogzeile nennt
-- dagegen weder Folatform noch Einnahmebezug. Ohne beides ist die
-- Umrechnung von mcg Folsäure nach DFE nicht eindeutig. Die Zeile bleibt
-- im Katalog erhalten, wird aber nicht als bekannte Nährstoffmenge
-- ausgegeben, bis die fehlende Provenienz vorliegt.
-- =============================================================

BEGIN;

UPDATE supplements.supplement_nutrients n
SET
  status = 'unbekannt',
  amount_per_serving = NULL,
  unit = NULL,
  conversion_factor = NULL,
  source = concat_ws('; ', NULLIF(n.source, ''),
    'C-149: Folatform und Einnahmebezug fehlen; keine DFE-Umrechnung')
FROM supplements.supplements s
WHERE n.supplement_id = s.id
  AND s.slug = 'folate-b9'
  AND n.nutrient_code = 'FOL';

DO $$
DECLARE
  v_rows INTEGER;
BEGIN
  SELECT count(*) INTO v_rows
  FROM supplements.supplement_nutrients n
  JOIN supplements.supplements s ON s.id = n.supplement_id
  WHERE s.slug = 'folate-b9'
    AND n.nutrient_code = 'FOL'
    AND n.status = 'unbekannt'
    AND n.amount_per_serving IS NULL
    AND n.unit IS NULL
    AND n.conversion_factor IS NULL;

  IF v_rows <> 1 THEN
    RAISE EXCEPTION 'C-149: Folat-Guard % statt 1', v_rows;
  END IF;
END $$;

COMMENT ON TABLE supplements.supplement_nutrients IS
  'Kuratierte Nährstoffmengen je Supplementportion. C-149: Folat bleibt unbekannt, solange Folatform und Einnahmebezug keine belastbare DFE-Umrechnung erlauben.';

COMMIT;
