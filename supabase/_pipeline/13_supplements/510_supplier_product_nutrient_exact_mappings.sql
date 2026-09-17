-- C-510: belegte DSLD-Schreibvariante sowie die explizite Bruecke von
-- Nährstoff-Labelnamen auf eindeutige LumeOS-Katalogwurzeln.
BEGIN;

INSERT INTO supplements.supplier_product_nutrient_name_mappings (
  dsld_name, nutrient_code, target_column, target_unit, conversion_rule,
  source_id, evidence_class, source_note
) VALUES (
  'Thiamin', 'THIA', 'thia_mg', 'mg', 'mass_or_label',
  'dsld_product_label', 'A',
  'DSLD-Labelschreibvariante von Thiamine; Vitamin B1 ist bereits als eigene Labelvariante belegt.'
)
ON CONFLICT (dsld_name) DO NOTHING;

WITH thiamin_root AS (
  SELECT DISTINCT s.id
  FROM supplements.supplement_aliases sa
  JOIN supplements.supplements s ON s.id = sa.supplement_id
  WHERE s.im_katalog
    AND s.parent_id IS NULL
    AND nutrition.search_fold(sa.alias) = 'thiamin'
)
INSERT INTO supplements.supplement_aliases (
  supplement_id, alias, source, confidence
)
SELECT tr.id, variant.alias, 'c510_dsld_label_spelling', 1.0
FROM thiamin_root tr
CROSS JOIN (VALUES ('Thiamine'), ('Vitamin B1')) AS variant(alias)
ON CONFLICT (supplement_id, alias, source) DO NOTHING;

WITH catalog_names AS (
  SELECT nutrition.search_fold(s.name_en) AS folded_name, s.id AS supplement_id
  FROM supplements.supplements s
  WHERE s.im_katalog
    AND s.parent_id IS NULL
    AND s.name_en IS NOT NULL
  UNION ALL
  SELECT nutrition.search_fold(sa.alias) AS folded_name, s.id AS supplement_id
  FROM supplements.supplement_aliases sa
  JOIN supplements.supplements s ON s.id = sa.supplement_id
  WHERE s.im_katalog
    AND s.parent_id IS NULL
    AND sa.alias IS NOT NULL
), unique_catalog_names AS (
  SELECT folded_name, (array_agg(DISTINCT supplement_id))[1] AS supplement_id
  FROM catalog_names
  WHERE folded_name <> ''
  GROUP BY folded_name
  HAVING count(DISTINCT supplement_id) = 1
)
UPDATE supplements.product_contents pc
SET supplement_id = ucn.supplement_id,
    updated_at = now()
FROM supplements.supplier_product_nutrient_name_mappings nm
JOIN unique_catalog_names ucn
  ON ucn.folded_name = nutrition.search_fold(nm.dsld_name)
WHERE pc.supplement_id IS NULL
  AND lower(pc.ingredient_name) = lower(nm.dsld_name);

DO $$
BEGIN
  IF (SELECT count(*) FROM supplements.supplier_product_nutrient_name_mappings) <> 40 THEN
    RAISE EXCEPTION 'C-510: erwartete 40 DSLD-Naehrstoffzuordnungen';
  END IF;
END $$;

COMMIT;
