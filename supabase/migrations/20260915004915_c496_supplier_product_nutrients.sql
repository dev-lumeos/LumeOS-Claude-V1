BEGIN;

CREATE TABLE supplements.supplier_product_nutrient_name_mappings (
  dsld_name text PRIMARY KEY,
  nutrient_code text NOT NULL REFERENCES nutrition.nutrient_defs(code),
  target_column text NOT NULL CHECK (target_column IN (
    'enercc', 'prot625', 'fat', 'cho', 'fibt', 'sugar', 'fasat', 'nacl',
    'water_g', 'alc', 'vita_ug', 'vitd_ug', 'vite_mg', 'vitk_ug', 'vitc_mg',
    'thia_mg', 'ribf_mg', 'nia_mg', 'vitb6_ug', 'fol_ug', 'vitb12_ug',
    'na_mg', 'k_mg', 'ca_mg', 'mg_mg', 'p_mg', 'fe_mg', 'zn_mg', 'id_ug',
    'cu_ug', 'mn_ug'
  )),
  target_unit text NOT NULL CHECK (target_unit IN ('kcal', 'g', 'mg', 'ug')),
  conversion_rule text NOT NULL CHECK (conversion_rule IN (
    'mass_or_label', 'vitamin_d_iu_to_ug', 'iu_form_required', 'equivalent_not_mass'
  )),
  source_id text NOT NULL,
  evidence_class text NOT NULL CHECK (evidence_class IN ('A', 'B', 'C')),
  source_note text NOT NULL
);

COMMENT ON TABLE supplements.supplier_product_nutrient_name_mappings IS
  'C-496: DSLD-Etikettnamen auf die kanonischen LumeOS-Naehrstoffcodes und die breite Leseprojektion. Keine Produktwerte werden hier gespeichert.';

INSERT INTO supplements.supplier_product_nutrient_name_mappings (
  dsld_name, nutrient_code, target_column, target_unit, conversion_rule,
  source_id, evidence_class, source_note
) VALUES
  ('Calories', 'ENERCC', 'enercc', 'kcal', 'mass_or_label', 'dsld_product_label', 'A', 'DSLD Nutrition-Facts-Label; Calorie(s) und {Calories} sind kcal.'),
  ('Protein', 'PROT625', 'prot625', 'g', 'mass_or_label', 'dsld_product_label', 'A', 'DSLD Nutrition-Facts-Label.'),
  ('Total Fat', 'FAT', 'fat', 'g', 'mass_or_label', 'dsld_product_label', 'A', 'DSLD Nutrition-Facts-Label.'),
  ('Total Carbohydrates', 'CHO', 'cho', 'g', 'mass_or_label', 'dsld_product_label', 'A', 'DSLD Nutrition-Facts-Label.'),
  ('Total Carbohydrate', 'CHO', 'cho', 'g', 'mass_or_label', 'dsld_product_label', 'A', 'DSLD Nutrition-Facts-Label.'),
  ('Dietary Fiber', 'FIBT', 'fibt', 'g', 'mass_or_label', 'dsld_product_label', 'A', 'DSLD Nutrition-Facts-Label.'),
  ('Sugar', 'SUGAR', 'sugar', 'g', 'mass_or_label', 'dsld_product_label', 'A', 'DSLD Nutrition-Facts-Label.'),
  ('Total Sugars', 'SUGAR', 'sugar', 'g', 'mass_or_label', 'dsld_product_label', 'A', 'DSLD Nutrition-Facts-Label.'),
  ('Saturated Fat', 'FASAT', 'fasat', 'g', 'mass_or_label', 'dsld_product_label', 'A', 'DSLD Nutrition-Facts-Label.'),
  ('Salt', 'NACL', 'nacl', 'g', 'mass_or_label', 'dsld_product_label', 'A', 'DSLD Label: salt/sodium chloride, nicht Sodium.'),
  ('Water', 'WATER', 'water_g', 'g', 'mass_or_label', 'dsld_product_label', 'A', 'DSLD-Label, nur bei Mengenangabe.'),
  ('Alcohol', 'ALC', 'alc', 'g', 'mass_or_label', 'dsld_product_label', 'A', 'DSLD-Label, nur bei Mengenangabe.'),
  ('Vitamin A', 'VITA', 'vita_ug', 'ug', 'equivalent_not_mass', 'dsld_product_label', 'A', 'DSLD-Label; RAE/RE bleiben Aequivalente, IU wird nicht geraten.'),
  ('Vitamin D', 'VITD', 'vitd_ug', 'ug', 'vitamin_d_iu_to_ug', 'dsld_product_label', 'A', 'DSLD-Label; 1 IU Vitamin D = 0.025 ug.'),
  ('Vitamin D3', 'VITD', 'vitd_ug', 'ug', 'vitamin_d_iu_to_ug', 'dsld_product_label', 'A', 'DSLD-Label; 1 IU Vitamin D3 = 0.025 ug.'),
  ('Vitamin E', 'VITE', 'vite_mg', 'mg', 'iu_form_required', 'dsld_product_label', 'A', 'DSLD-Label; Vitamin-E-IU ohne natuerliche/synthetische Form nicht umrechenbar.'),
  ('Vitamin K', 'VITK', 'vitk_ug', 'ug', 'mass_or_label', 'dsld_product_label', 'A', 'DSLD-Label.'),
  ('Vitamin K2', 'VITK', 'vitk_ug', 'ug', 'mass_or_label', 'dsld_product_label', 'A', 'DSLD-Label.'),
  ('Vitamin C', 'VITC', 'vitc_mg', 'mg', 'mass_or_label', 'dsld_product_label', 'A', 'DSLD-Label.'),
  ('Thiamine', 'THIA', 'thia_mg', 'mg', 'mass_or_label', 'dsld_product_label', 'A', 'DSLD-Label.'),
  ('Vitamin B1', 'THIA', 'thia_mg', 'mg', 'mass_or_label', 'dsld_product_label', 'A', 'DSLD-Label.'),
  ('Riboflavin', 'RIBF', 'ribf_mg', 'mg', 'mass_or_label', 'dsld_product_label', 'A', 'DSLD-Label.'),
  ('Vitamin B2', 'RIBF', 'ribf_mg', 'mg', 'mass_or_label', 'dsld_product_label', 'A', 'DSLD-Label.'),
  ('Niacin', 'NIA', 'nia_mg', 'mg', 'equivalent_not_mass', 'dsld_product_label', 'A', 'DSLD-Label; mg NE bleibt ein Aequivalent.'),
  ('Vitamin B3', 'NIA', 'nia_mg', 'mg', 'equivalent_not_mass', 'dsld_product_label', 'A', 'DSLD-Label; mg NE bleibt ein Aequivalent.'),
  ('Vitamin B6', 'VITB6', 'vitb6_ug', 'ug', 'mass_or_label', 'dsld_product_label', 'A', 'DSLD-Label.'),
  ('Folic Acid', 'FOL', 'fol_ug', 'ug', 'equivalent_not_mass', 'dsld_product_label', 'A', 'DSLD-Label; mcg DFE bleibt ein Aequivalent.'),
  ('Folate', 'FOL', 'fol_ug', 'ug', 'equivalent_not_mass', 'dsld_product_label', 'A', 'DSLD-Label; mcg DFE bleibt ein Aequivalent.'),
  ('Vitamin B12', 'VITB12', 'vitb12_ug', 'ug', 'mass_or_label', 'dsld_product_label', 'A', 'DSLD-Label.'),
  ('Sodium', 'NA', 'na_mg', 'mg', 'mass_or_label', 'dsld_product_label', 'A', 'DSLD Nutrition-Facts-Label.'),
  ('Potassium', 'K', 'k_mg', 'mg', 'mass_or_label', 'dsld_product_label', 'A', 'DSLD Nutrition-Facts-Label.'),
  ('Calcium', 'CA', 'ca_mg', 'mg', 'mass_or_label', 'dsld_product_label', 'A', 'DSLD Nutrition-Facts-Label.'),
  ('Magnesium', 'MG', 'mg_mg', 'mg', 'mass_or_label', 'dsld_product_label', 'A', 'DSLD Nutrition-Facts-Label.'),
  ('Phosphorus', 'P', 'p_mg', 'mg', 'mass_or_label', 'dsld_product_label', 'A', 'DSLD Nutrition-Facts-Label.'),
  ('Iron', 'FE', 'fe_mg', 'mg', 'mass_or_label', 'dsld_product_label', 'A', 'DSLD Nutrition-Facts-Label.'),
  ('Zinc', 'ZN', 'zn_mg', 'mg', 'mass_or_label', 'dsld_product_label', 'A', 'DSLD Nutrition-Facts-Label.'),
  ('Iodine', 'ID', 'id_ug', 'ug', 'mass_or_label', 'dsld_product_label', 'A', 'DSLD Nutrition-Facts-Label.'),
  ('Copper', 'CU', 'cu_ug', 'ug', 'mass_or_label', 'dsld_product_label', 'A', 'DSLD Nutrition-Facts-Label.'),
  ('Manganese', 'MN', 'mn_ug', 'ug', 'mass_or_label', 'dsld_product_label', 'A', 'DSLD Nutrition-Facts-Label.');

CREATE OR REPLACE VIEW supplements.produkt_naehrwerte
WITH (security_invoker = true)
AS
WITH mapped AS (
  SELECT
    c.product_id,
    c.ingredient_name,
    c.amount_per_serving,
    lower(btrim(c.unit)) AS unit_normalized,
    c.unit,
    m.target_column,
    m.target_unit,
    m.conversion_rule
  FROM supplements.product_contents c
  JOIN supplements.supplier_product_nutrient_name_mappings m
    ON lower(m.dsld_name) = lower(c.ingredient_name)
), conversion_amount AS (
  SELECT
    *,
    CASE
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
      ELSE NULL
    END AS value_per_serving
  FROM mapped
), converted AS (
  SELECT *,
    CASE
      WHEN amount_per_serving IS NULL THEN 'missing_amount'
      WHEN conversion_rule = 'iu_form_required' AND unit_normalized = 'iu' THEN 'vitamin_e_iu_form_unknown'
      WHEN conversion_rule = 'equivalent_not_mass' AND unit_normalized IN ('mcg dfe', 'mcg rae', 'mg ne', 'mg rae', 'mg re', 'mcg re') THEN 'equivalent_unit_not_mass'
      WHEN unit_normalized = 'iu' THEN 'iu_not_convertible_for_nutrient'
      WHEN target_column = 'enercc' AND unit_normalized NOT IN ('calorie(s)', '{calories}', 'calories', 'cal', 'kcal', 'kcal(s)') THEN 'energy_unit_not_convertible'
      WHEN value_per_serving IS NULL THEN 'unit_not_convertible'
      ELSE NULL
    END AS gap_reason
  FROM conversion_amount
), values_per_product AS (
  SELECT
    product_id,
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
    coalesce(jsonb_agg(jsonb_build_object(
      'ingredient_name', ingredient_name,
      'target_column', target_column,
      'amount_per_serving', amount_per_serving,
      'unit', unit,
      'reason', gap_reason
    ) ORDER BY ingredient_name) FILTER (WHERE gap_reason IS NOT NULL), '[]'::jsonb) AS not_convertible
  FROM converted
  GROUP BY product_id
)
SELECT
  p.id AS product_id,
  CASE WHEN p.portionseinheit ~* '^[[:space:]]*(g|gram)' THEN p.portionsgroesse END AS portionsgroesse_g,
  v.enercc, v.prot625, v.fat, v.cho, v.fibt, v.sugar, v.fasat, v.nacl, v.water_g, v.alc,
  v.vita_ug, v.vitd_ug, v.vite_mg, v.vitk_ug, v.vitc_mg, v.thia_mg, v.ribf_mg, v.nia_mg,
  v.vitb6_ug, v.fol_ug, v.vitb12_ug, v.na_mg, v.k_mg, v.ca_mg, v.mg_mg, v.p_mg, v.fe_mg,
  v.zn_mg, v.id_ug, v.cu_ug, v.mn_ug,
  'aus DSLD-Etikett'::text AS quelle,
  jsonb_build_object('not_convertible', v.not_convertible) AS luecken
FROM supplements.supplier_products p
JOIN values_per_product v ON v.product_id = p.id;

COMMENT ON VIEW supplements.produkt_naehrwerte IS
  'C-496: berechnete DSLD-Etikettnaehrwerte je Produkt und Portion; keine Kopie nach nutrition.foods. luecken nennt nicht umgerechnete Mengen samt Grund.';

CREATE OR REPLACE VIEW supplements.supplier_product_nutrients
WITH (security_invoker = true)
AS
SELECT *
FROM supplements.produkt_naehrwerte;

COMMENT ON VIEW supplements.supplier_product_nutrients IS
  'C-496: englische Lese-Schnittstelle fuer supplements.produkt_naehrwerte.';

REVOKE ALL ON TABLE supplements.supplier_product_nutrient_name_mappings FROM PUBLIC, anon;
GRANT SELECT ON TABLE supplements.supplier_product_nutrient_name_mappings TO authenticated;
GRANT ALL ON TABLE supplements.supplier_product_nutrient_name_mappings TO service_role;
REVOKE ALL ON TABLE supplements.produkt_naehrwerte FROM PUBLIC, anon;
GRANT SELECT ON TABLE supplements.produkt_naehrwerte TO authenticated;
REVOKE ALL ON TABLE supplements.supplier_product_nutrients FROM PUBLIC, anon;
GRANT SELECT ON TABLE supplements.supplier_product_nutrients TO authenticated;

COMMIT;
