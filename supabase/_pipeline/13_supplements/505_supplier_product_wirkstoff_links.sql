-- C-505: Nur DSLD-Facts mit exakter, eindeutiger bestehender Katalogbezeichnung
-- erhalten einen Wirkstofflink. Other Ingredients bleiben Hilfsstoffe; jede
-- mehrdeutige oder unbekannte Zeile bleibt Kandidat.
BEGIN;

WITH catalog_names AS (
  SELECT nutrition.search_fold(s.name_en) AS folded_name, s.id AS supplement_id
  FROM supplements.supplements s
  WHERE s.name_en IS NOT NULL
  UNION ALL
  SELECT nutrition.search_fold(sa.alias) AS folded_name, sa.supplement_id
  FROM supplements.supplement_aliases sa
  WHERE sa.alias IS NOT NULL
), unique_catalog_names AS (
  SELECT folded_name, (array_agg(DISTINCT supplement_id))[1] AS supplement_id
  FROM catalog_names
  WHERE folded_name <> ''
  GROUP BY folded_name
  HAVING count(DISTINCT supplement_id) = 1
), nutrient_names AS (
  SELECT lower(dsld_name) AS ingredient_name
  FROM supplements.supplier_product_nutrient_name_mappings
)
UPDATE supplements.product_contents pc
SET supplement_id = ucn.supplement_id,
    updated_at = now()
FROM unique_catalog_names ucn
WHERE pc.source = 'dsld'
  AND pc.ist_wirkstoff
  AND pc.supplement_id IS NULL
  AND nutrition.search_fold(pc.ingredient_name) = ucn.folded_name
  AND NOT EXISTS (
    SELECT 1
    FROM nutrient_names nn
    WHERE nn.ingredient_name = lower(pc.ingredient_name)
  );

COMMIT;
