-- C-500/G-458: belegte Produktformen sind abgeleitete Katalogdaten.
BEGIN;

WITH vitamin_e_iu AS (
  SELECT DISTINCT c.product_id
  FROM supplements.product_contents c
  JOIN supplements.supplier_product_nutrient_name_mappings m
    ON lower(m.dsld_name) = lower(c.ingredient_name)
  WHERE c.unit = 'IU'
    AND m.target_column = 'vite_mg'
), evidence AS (
  SELECT
    e.product_id,
    bool_or(lower(c.ingredient_name) ~ '(^|[^[:alpha:]])dl[- ]?alpha[^[:alpha:]]*(tocopher|tocopheryl)') AS has_synthetic,
    bool_or(
      lower(c.ingredient_name) ~ '(^|[^[:alpha:]])d[- ]?alpha[^[:alpha:]]*(tocopher|tocopheryl)'
      AND lower(c.ingredient_name) !~ '(^|[^[:alpha:]])dl[- ]?alpha'
    ) AS has_natural,
    bool_or(lower(c.ingredient_name) ~ '(vitamin e[^[:alpha:]]*natural|natural[^[:alpha:]]*vitamin e)') AS has_natural_word,
    bool_or(lower(c.ingredient_name) ~ '(vitamin e[^[:alpha:]]*synthetic|synthetic[^[:alpha:]]*vitamin e)') AS has_synthetic_word,
    min(c.ingredient_name) FILTER (WHERE lower(c.ingredient_name) ~ '(^|[^[:alpha:]])dl[- ]?alpha[^[:alpha:]]*(tocopher|tocopheryl)') AS synthetic_evidence,
    min(c.ingredient_name) FILTER (WHERE lower(c.ingredient_name) ~ '(^|[^[:alpha:]])d[- ]?alpha[^[:alpha:]]*(tocopher|tocopheryl)' AND lower(c.ingredient_name) !~ '(^|[^[:alpha:]])dl[- ]?alpha') AS natural_evidence
  FROM vitamin_e_iu e
  JOIN supplements.product_contents c ON c.product_id = e.product_id
  GROUP BY e.product_id
), resolved AS (
  SELECT
    product_id,
    CASE
      WHEN has_synthetic OR has_synthetic_word THEN 'synthetisch'
      ELSE 'natuerlich'
    END AS vitamin_e_form,
    COALESCE(synthetic_evidence, natural_evidence, 'explicit vitamin e form on DSLD ingredient line') AS evidence_text
  FROM evidence
  WHERE (has_synthetic OR has_synthetic_word)::integer
      + (has_natural OR has_natural_word)::integer = 1
)
INSERT INTO supplements.supplier_product_vitamin_e_forms (
  product_id, vitamin_e_form, source_id, evidence_class, evidence_text
)
SELECT product_id, vitamin_e_form, 'dsld_same_product_ingredient_line', 'A', evidence_text
FROM resolved
ON CONFLICT (product_id) DO NOTHING;

INSERT INTO supplements.supplier_product_vitamin_e_forms (
  product_id, vitamin_e_form, source_id, source_url, evidence_class, evidence_text
)
SELECT
  p.id,
  'natuerlich',
  'nowfoods_product_page_2026',
  CASE
    WHEN p.gtin = '733739008374' THEN 'https://www.nowfoods.com/products/supplements/vitamin-e-400-d-alpha-tocopheryl-softgels'
    WHEN p.gtin = '733739008503' THEN 'https://www.nowfoods.com/products/supplements/vitamin-e-400-vegetarian-dry-veg-capsules'
    WHEN p.gtin = '733739009067' THEN 'https://www.nowfoods.com/products/supplements/vitamin-e-400-softgels'
    ELSE 'https://www.nowfoods.com/products/supplements/vitamin-e-400-mixed-tocopherols-softgels'
  END,
  'A',
  'Herstellerseite nennt d-alpha-Tocopherol bzw. d-alpha-Tocopheryl-Acetate/Succinate fuer diese GTIN.'
FROM supplements.supplier_products p
JOIN supplements.product_contents c ON c.product_id = p.id
JOIN supplements.supplier_product_nutrient_name_mappings m
  ON lower(m.dsld_name) = lower(c.ingredient_name)
WHERE p.marke = 'NOW'
  AND p.gtin IN ('733739008374', '733739008503', '733739009067', '733739008909', '733739008923', '733739008947')
  AND c.unit = 'IU'
  AND m.target_column = 'vite_mg'
ON CONFLICT (product_id) DO NOTHING;

DO $$
BEGIN
  IF (SELECT count(*) FROM supplements.supplier_product_vitamin_e_forms) <> 1433 THEN
    RAISE EXCEPTION 'C-500/G-458: erwartete 1.433 belegte Vitamin-E-Formen';
  END IF;
END $$;

COMMIT;
