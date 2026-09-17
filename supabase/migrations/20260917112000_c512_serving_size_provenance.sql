BEGIN;

CREATE OR REPLACE VIEW supplements.supplier_product_nutrient_serving_options
WITH (security_invoker = true)
AS
WITH mapped AS (
  SELECT c.product_id, c.source_serving_size, c.ingredient_name, c.amount_per_serving,
         lower(btrim(c.unit)) AS unit_normalized, c.unit,
         m.target_column, m.target_unit, m.conversion_rule, f.vitamin_e_form
  FROM supplements.product_contents c
  JOIN supplements.supplier_product_nutrient_name_mappings m ON lower(m.dsld_name) = lower(c.ingredient_name)
  LEFT JOIN supplements.supplier_product_vitamin_e_forms f ON f.product_id = c.product_id
  WHERE c.source_serving_size IS NOT NULL
), converted AS (
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
), deduplicated AS (
  -- DSLD may repeat an otherwise identical Facts-Zeile for another
  -- Zielgruppe. Sie ist keine zweite Menge derselben Portion.
  SELECT DISTINCT product_id, source_serving_size, target_column, value_per_serving
  FROM converted
)
SELECT product_id, source_serving_size AS serving_size,
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
  sum(value_per_serving) FILTER (WHERE target_column = 'mn_ug') AS mn_ug
FROM deduplicated
GROUP BY product_id, source_serving_size;

CREATE OR REPLACE VIEW supplements.produkt_naehrwerte
WITH (security_invoker = true)
AS
WITH serving_cardinality AS (
  SELECT product_id,
         array_agg(DISTINCT source_serving_size ORDER BY source_serving_size) FILTER (WHERE source_serving_size IS NOT NULL) AS serving_sizes
  FROM supplements.product_contents c
  JOIN supplements.supplier_product_nutrient_name_mappings m ON lower(m.dsld_name) = lower(c.ingredient_name)
  WHERE c.source = 'dsld' AND c.amount_per_serving IS NOT NULL
  GROUP BY product_id
), safe_values AS (
  SELECT o.*
  FROM supplements.supplier_product_nutrient_serving_options o
  JOIN serving_cardinality s ON s.product_id = o.product_id
  WHERE cardinality(s.serving_sizes) = 1
), gaps AS (
  SELECT c.product_id,
    coalesce(jsonb_agg(jsonb_build_object(
      'ingredient_name', c.ingredient_name,
      'target_column', m.target_column,
      'amount_per_serving', c.amount_per_serving,
      'unit', c.unit,
      'reason', CASE
        WHEN c.amount_per_serving IS NULL THEN 'missing_amount'
        WHEN m.conversion_rule = 'iu_form_required' AND lower(btrim(c.unit)) = 'iu' AND f.vitamin_e_form IS NULL THEN 'vitamin_e_iu_form_unknown'
        WHEN m.conversion_rule = 'equivalent_not_mass' AND lower(btrim(c.unit)) IN ('mcg dfe', 'mcg rae', 'mg ne', 'mg rae', 'mg re', 'mcg re') THEN 'equivalent_unit_not_mass'
        WHEN lower(btrim(c.unit)) = 'iu' THEN 'iu_not_convertible_for_nutrient'
        ELSE 'unit_not_convertible' END
    ) ORDER BY c.ingredient_name) FILTER (WHERE c.amount_per_serving IS NULL
      OR (m.conversion_rule = 'iu_form_required' AND lower(btrim(c.unit)) = 'iu' AND f.vitamin_e_form IS NULL)
      OR (m.conversion_rule = 'equivalent_not_mass' AND lower(btrim(c.unit)) IN ('mcg dfe', 'mcg rae', 'mg ne', 'mg rae', 'mg re', 'mcg re'))
      OR (m.target_column = 'enercc' AND lower(btrim(c.unit)) NOT IN ('calorie(s)', '{calories}', 'calories', 'cal', 'kcal', 'kcal(s)'))
    ), '[]'::jsonb) AS not_convertible
  FROM supplements.product_contents c
  JOIN supplements.supplier_product_nutrient_name_mappings m ON lower(m.dsld_name) = lower(c.ingredient_name)
  LEFT JOIN supplements.supplier_product_vitamin_e_forms f ON f.product_id = c.product_id
  GROUP BY c.product_id
)
SELECT p.id AS product_id,
  CASE WHEN p.portionseinheit ~* '^[[:space:]]*(g|gram)' THEN p.portionsgroesse END AS portionsgroesse_g,
  v.enercc, v.prot625, v.fat, v.cho, v.fibt, v.sugar, v.fasat, v.nacl, v.water_g, v.alc,
  v.vita_ug, v.vitd_ug, v.vite_mg, v.vitk_ug, v.vitc_mg, v.thia_mg, v.ribf_mg, v.nia_mg,
  v.vitb6_ug, v.fol_ug, v.vitb12_ug, v.na_mg, v.k_mg, v.ca_mg, v.mg_mg, v.p_mg, v.fe_mg,
  v.zn_mg, v.id_ug, v.cu_ug, v.mn_ug,
  'aus DSLD-Etikett'::text AS quelle,
  jsonb_build_object('not_convertible', coalesce(g.not_convertible, '[]'::jsonb)) ||
    CASE WHEN cardinality(s.serving_sizes) > 1 THEN jsonb_build_object('multiple_serving_sizes', to_jsonb(s.serving_sizes)) ELSE '{}'::jsonb END AS luecken
FROM supplements.supplier_products p
JOIN serving_cardinality s ON s.product_id = p.id
LEFT JOIN safe_values v ON v.product_id = p.id
LEFT JOIN gaps g ON g.product_id = p.id;

COMMENT ON VIEW supplements.supplier_product_nutrient_serving_options IS
  'C-512: DSLD-Naehrwerte pro expliziter Facts-Serving-Size. Mehrportionen bleiben getrennt; keine Auswahl wird geraten.';
COMMENT ON VIEW supplements.produkt_naehrwerte IS
  'C-512: Einzelportionen sind berechnet. Mehrere DSLD-Serving-Sizes je Produkt werden nicht summiert; luecken.multiple_serving_sizes zeigt die sichere Auswahl an.';

REVOKE ALL ON TABLE supplements.supplier_product_nutrient_serving_options FROM PUBLIC, anon;
GRANT SELECT ON TABLE supplements.supplier_product_nutrient_serving_options TO authenticated;
GRANT ALL ON TABLE supplements.supplier_product_nutrient_serving_options TO service_role;

COMMIT;
