BEGIN;

CREATE TABLE supplements.supplier_product_vitamin_e_forms (
  -- Abgeleitete, ausschliesslich produktbezogene Evidenz; der Katalog selbst
  -- wird nicht geloescht, daher bleibt die Referenz in Neuaufbauten konsistent.
  product_id uuid PRIMARY KEY REFERENCES supplements.supplier_products(id) ON DELETE CASCADE,
  vitamin_e_form text NOT NULL CHECK (vitamin_e_form IN ('natuerlich', 'synthetisch', 'unbekannt')),
  source_id text NOT NULL CHECK (btrim(source_id) <> ''),
  source_url text,
  evidence_class text NOT NULL CHECK (evidence_class IN ('A', 'B', 'C')),
  evidence_text text NOT NULL CHECK (btrim(evidence_text) <> ''),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT vitamin_e_form_not_unbekannt_ck CHECK (vitamin_e_form <> 'unbekannt')
);

COMMENT ON TABLE supplements.supplier_product_vitamin_e_forms IS
  'C-500: nur belegte Vitamin-E-Formen je Produkt. Fehlender Nachweis bleibt bewusst ohne Zeile und damit in der Naehrwertsicht als Luecke sichtbar.';

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

CREATE OR REPLACE VIEW supplements.produkt_naehrwerte
WITH (security_invoker = true)
AS
WITH mapped AS (
  SELECT
    c.product_id, c.ingredient_name, c.amount_per_serving,
    lower(btrim(c.unit)) AS unit_normalized, c.unit,
    m.target_column, m.target_unit, m.conversion_rule,
    f.vitamin_e_form
  FROM supplements.product_contents c
  JOIN supplements.supplier_product_nutrient_name_mappings m
    ON lower(m.dsld_name) = lower(c.ingredient_name)
  LEFT JOIN supplements.supplier_product_vitamin_e_forms f ON f.product_id = c.product_id
), conversion_amount AS (
  SELECT *, CASE
    WHEN amount_per_serving IS NULL THEN NULL
    WHEN target_column = 'enercc' AND unit_normalized IN ('calorie(s)', '{calories}', 'calories', 'cal', 'kcal', 'kcal(s)') THEN amount_per_serving
    WHEN target_unit = 'g' AND unit_normalized IN ('g', 'gram(s)', 'grams', 'gm') THEN amount_per_serving
    WHEN target_unit = 'g' AND unit_normalized = 'mg' THEN amount_per_serving / 1000.0
    WHEN target_unit = 'g' AND unit_normalized IN ('mcg', 'ug', 'micrograms') THEN amount_per_serving / 1000000.0
    WHEN target_unit = 'mg' AND unit_normalized = 'mg' THEN amount_per_serving
    WHEN target_unit = 'mg' AND unit_normalized IN ('g', 'gram(s)', 'grams', 'gm') THEN amount_per_serving * 1000.0
    WHEN target_unit = 'mg' AND unit_normalized IN ('mcg', 'ug', 'micrograms') THEN amount_per_serving / 1000.0
    WHEN target_unit = 'ug' AND unit_normalized IN ('mcg', 'ug', 'micrograms') THEN amount_per_serving
    WHEN target_unit = 'ug' AND unit_normalized = 'mg' THEN amount_per_serving * 1000.0
    WHEN target_unit = 'ug' AND unit_normalized IN ('g', 'gram(s)', 'grams', 'gm') THEN amount_per_serving * 1000000.0
    WHEN conversion_rule = 'vitamin_d_iu_to_ug' AND unit_normalized = 'iu' THEN amount_per_serving * 0.025
    WHEN conversion_rule = 'iu_form_required' AND unit_normalized = 'iu' AND vitamin_e_form = 'natuerlich' THEN amount_per_serving * 0.67
    WHEN conversion_rule = 'iu_form_required' AND unit_normalized = 'iu' AND vitamin_e_form = 'synthetisch' THEN amount_per_serving * 0.45
    ELSE NULL END AS value_per_serving
  FROM mapped
), converted AS (
  SELECT *, CASE
    WHEN amount_per_serving IS NULL THEN 'missing_amount'
    WHEN conversion_rule = 'iu_form_required' AND unit_normalized = 'iu' AND vitamin_e_form IS NULL THEN 'vitamin_e_iu_form_unknown'
    WHEN conversion_rule = 'equivalent_not_mass' AND unit_normalized IN ('mcg dfe', 'mcg rae', 'mg ne', 'mg rae', 'mg re', 'mcg re') THEN 'equivalent_unit_not_mass'
    WHEN unit_normalized = 'iu' THEN 'iu_not_convertible_for_nutrient'
    WHEN target_column = 'enercc' AND unit_normalized NOT IN ('calorie(s)', '{calories}', 'calories', 'cal', 'kcal', 'kcal(s)') THEN 'energy_unit_not_convertible'
    WHEN value_per_serving IS NULL THEN 'unit_not_convertible'
    ELSE NULL END AS gap_reason
  FROM conversion_amount
), values_per_product AS (
  SELECT product_id,
    sum(value_per_serving) FILTER (WHERE target_column = 'enercc') AS enercc,
    sum(value_per_serving) FILTER (WHERE target_column = 'prot625') AS prot625,
    sum(value_per_serving) FILTER (WHERE target_column = 'fat') AS fat,
    sum(value_per_serving) FILTER (WHERE target_column = 'cho') AS cho,
    sum(value_per_serving) FILTER (WHERE target_column = 'fibt') AS fibt,
    sum(value_per_serving) FILTER (WHERE target_column = 'sugar') AS sugar,
    sum(value_per_serving) FILTER (WHERE target_column = 'fasat') AS fasat,
    sum(value_per_serving) FILTER (WHERE target_column = 'nacl') AS nacl,
    sum(value_per_serving) FILTER (WHERE target_column = 'water_g') AS water_g,
    sum(value_per_serving) FILTER (WHERE target_column = 'alc') AS alc,
    sum(value_per_serving) FILTER (WHERE target_column = 'vita_ug') AS vita_ug,
    sum(value_per_serving) FILTER (WHERE target_column = 'vitd_ug') AS vitd_ug,
    sum(value_per_serving) FILTER (WHERE target_column = 'vite_mg') AS vite_mg,
    sum(value_per_serving) FILTER (WHERE target_column = 'vitk_ug') AS vitk_ug,
    sum(value_per_serving) FILTER (WHERE target_column = 'vitc_mg') AS vitc_mg,
    sum(value_per_serving) FILTER (WHERE target_column = 'thia_mg') AS thia_mg,
    sum(value_per_serving) FILTER (WHERE target_column = 'ribf_mg') AS ribf_mg,
    sum(value_per_serving) FILTER (WHERE target_column = 'nia_mg') AS nia_mg,
    sum(value_per_serving) FILTER (WHERE target_column = 'vitb6_ug') AS vitb6_ug,
    sum(value_per_serving) FILTER (WHERE target_column = 'fol_ug') AS fol_ug,
    sum(value_per_serving) FILTER (WHERE target_column = 'vitb12_ug') AS vitb12_ug,
    sum(value_per_serving) FILTER (WHERE target_column = 'na_mg') AS na_mg,
    sum(value_per_serving) FILTER (WHERE target_column = 'k_mg') AS k_mg,
    sum(value_per_serving) FILTER (WHERE target_column = 'ca_mg') AS ca_mg,
    sum(value_per_serving) FILTER (WHERE target_column = 'mg_mg') AS mg_mg,
    sum(value_per_serving) FILTER (WHERE target_column = 'p_mg') AS p_mg,
    sum(value_per_serving) FILTER (WHERE target_column = 'fe_mg') AS fe_mg,
    sum(value_per_serving) FILTER (WHERE target_column = 'zn_mg') AS zn_mg,
    sum(value_per_serving) FILTER (WHERE target_column = 'id_ug') AS id_ug,
    sum(value_per_serving) FILTER (WHERE target_column = 'cu_ug') AS cu_ug,
    sum(value_per_serving) FILTER (WHERE target_column = 'mn_ug') AS mn_ug,
    coalesce(jsonb_agg(jsonb_build_object('ingredient_name', ingredient_name, 'target_column', target_column, 'amount_per_serving', amount_per_serving, 'unit', unit, 'vitamin_e_form', coalesce(vitamin_e_form, 'unbekannt'), 'reason', gap_reason) ORDER BY ingredient_name) FILTER (WHERE gap_reason IS NOT NULL), '[]'::jsonb) AS not_convertible
  FROM converted GROUP BY product_id
)
SELECT p.id AS product_id,
  CASE WHEN p.portionseinheit ~* '^[[:space:]]*(g|gram)' THEN p.portionsgroesse END AS portionsgroesse_g,
  v.enercc, v.prot625, v.fat, v.cho, v.fibt, v.sugar, v.fasat, v.nacl, v.water_g, v.alc,
  v.vita_ug, v.vitd_ug, v.vite_mg, v.vitk_ug, v.vitc_mg, v.thia_mg, v.ribf_mg, v.nia_mg,
  v.vitb6_ug, v.fol_ug, v.vitb12_ug, v.na_mg, v.k_mg, v.ca_mg, v.mg_mg, v.p_mg, v.fe_mg, v.zn_mg, v.id_ug, v.cu_ug, v.mn_ug,
  'aus DSLD-Etikett'::text AS quelle,
  jsonb_build_object('not_convertible', v.not_convertible) AS luecken
FROM supplements.supplier_products p
JOIN values_per_product v ON v.product_id = p.id;

REVOKE ALL ON TABLE supplements.supplier_product_vitamin_e_forms FROM PUBLIC, anon;
GRANT SELECT ON TABLE supplements.supplier_product_vitamin_e_forms TO authenticated;
GRANT ALL ON TABLE supplements.supplier_product_vitamin_e_forms TO service_role;

COMMIT;
