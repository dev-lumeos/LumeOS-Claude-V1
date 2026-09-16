BEGIN;

CREATE OR REPLACE VIEW supplements.supplier_product_content_catalog
WITH (security_invoker = true)
AS
SELECT
  pc.id AS product_content_id,
  pc.product_id,
  pc.ingredient_name,
  pc.ingredient_category,
  pc.amount_per_serving,
  pc.unit,
  pc.amount_qualifier,
  pc.ist_wirkstoff,
  pc.supplement_id,
  nm.nutrient_code,
  CASE
    WHEN nm.dsld_name IS NOT NULL THEN 'naehrwert'
    WHEN NOT pc.ist_wirkstoff THEN 'hilfsstoff'
    WHEN pc.supplement_id IS NOT NULL THEN 'wirkstoff'
    ELSE 'kandidat'
  END AS content_class
FROM supplements.product_contents pc
LEFT JOIN supplements.supplier_product_nutrient_name_mappings nm
  ON lower(nm.dsld_name) = lower(pc.ingredient_name);

REVOKE ALL ON TABLE supplements.supplier_product_content_catalog FROM PUBLIC, anon;
GRANT SELECT ON TABLE supplements.supplier_product_content_catalog TO authenticated;

COMMENT ON VIEW supplements.supplier_product_content_catalog IS
  'C-505: eine DSLD-Etikettenzeile ist Naehrwert, Wirkstoff, Hilfsstoff oder bewusst Kandidat. Hilfsstoffe sind die DSLD Other Ingredients und werden nie in die Naehrstoffbilanz aufgenommen.';

COMMIT;
