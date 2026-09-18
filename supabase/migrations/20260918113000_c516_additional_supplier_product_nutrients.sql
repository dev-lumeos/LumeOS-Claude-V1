BEGIN;

-- C-516: Die 31 breiten Altspalten bleiben fuer ihre etablierten Makros
-- bestehen. Weitere vorhandene nutrient_defs werden feldgenau im JSON der
-- Mahlzeit-/Portionsprojektion gefuehrt, statt neue food-Spalten zu erfinden.
ALTER TABLE supplements.supplier_product_nutrient_name_mappings
  DROP CONSTRAINT supplier_product_nutrient_name_mappings_target_column_check;

ALTER TABLE supplements.supplier_product_nutrient_name_mappings
  ADD CONSTRAINT supplier_product_nutrient_name_mappings_target_column_check
  CHECK (target_column IN (
    'enercc', 'prot625', 'fat', 'cho', 'fibt', 'sugar', 'fasat', 'nacl',
    'water_g', 'alc', 'vita_ug', 'vitd_ug', 'vite_mg', 'vitk_ug', 'vitc_mg',
    'thia_mg', 'ribf_mg', 'nia_mg', 'vitb6_ug', 'fol_ug', 'vitb12_ug',
    'na_mg', 'k_mg', 'ca_mg', 'mg_mg', 'p_mg', 'fe_mg', 'zn_mg', 'id_ug',
    'cu_ug', 'mn_ug', 'nutrients_json'
  ));

CREATE OR REPLACE VIEW supplements.supplier_product_nutrient_serving_options
WITH (security_invoker = true)
AS
WITH mapped AS (
  SELECT c.product_id, c.source_serving_size, c.ingredient_name, c.amount_per_serving,
         lower(btrim(c.unit)) AS unit_normalized, c.unit,
         m.nutrient_code, m.target_column, m.target_unit, m.conversion_rule, f.vitamin_e_form
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
  -- Eine gleichlautende DSLD-Zeile fuer eine zweite Zielgruppe ist keine
  -- zweite Menge derselben belegten Portion (C-512).
  SELECT DISTINCT product_id, source_serving_size, target_column, nutrient_code, value_per_serving
  FROM converted
), wide_values AS (
  SELECT product_id, source_serving_size,
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
  GROUP BY product_id, source_serving_size
), generic_values AS (
  SELECT product_id, source_serving_size, nutrient_code, sum(value_per_serving) AS value_per_serving
  FROM deduplicated
  WHERE target_column = 'nutrients_json' AND value_per_serving IS NOT NULL
  GROUP BY product_id, source_serving_size, nutrient_code
), generic_json AS (
  SELECT product_id, source_serving_size, jsonb_object_agg(nutrient_code, value_per_serving) AS nutrients
  FROM generic_values
  GROUP BY product_id, source_serving_size
)
SELECT w.product_id, w.source_serving_size AS serving_size,
  w.enercc, w.prot625, w.fat, w.cho, w.fibt, w.sugar, w.fasat, w.nacl, w.water_g, w.alc,
  w.vita_ug, w.vitd_ug, w.vite_mg, w.vitk_ug, w.vitc_mg, w.thia_mg, w.ribf_mg, w.nia_mg,
  w.vitb6_ug, w.fol_ug, w.vitb12_ug, w.na_mg, w.k_mg, w.ca_mg, w.mg_mg, w.p_mg, w.fe_mg,
  w.zn_mg, w.id_ug, w.cu_ug, w.mn_ug,
  coalesce(g.nutrients, '{}'::jsonb) AS nutrients
FROM wide_values w
LEFT JOIN generic_json g USING (product_id, source_serving_size);

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
      'nutrient_code', m.nutrient_code,
      'target_column', m.target_column,
      'amount_per_serving', c.amount_per_serving,
      'unit', c.unit,
      'reason', CASE
        WHEN c.amount_per_serving IS NULL THEN 'missing_amount'
        WHEN m.conversion_rule = 'iu_form_required' AND lower(btrim(c.unit)) = 'iu' AND f.vitamin_e_form IS NULL THEN 'vitamin_e_iu_form_unknown'
        WHEN m.conversion_rule = 'equivalent_not_mass' AND lower(btrim(c.unit)) IN ('mcg dfe', 'mcg rae', 'mg ne', 'mg rae', 'mg re', 'mcg re') THEN 'equivalent_unit_not_mass'
        WHEN lower(btrim(c.unit)) = 'iu' THEN 'iu_not_convertible_for_nutrient'
        WHEN m.target_column = 'enercc' AND lower(btrim(c.unit)) NOT IN ('calorie(s)', '{calories}', 'calories', 'cal', 'kcal', 'kcal(s)') THEN 'energy_unit_not_convertible'
        ELSE 'unit_not_convertible' END
    ) ORDER BY c.ingredient_name) FILTER (WHERE c.amount_per_serving IS NULL
      OR (m.conversion_rule = 'iu_form_required' AND lower(btrim(c.unit)) = 'iu' AND f.vitamin_e_form IS NULL)
      OR (m.conversion_rule = 'equivalent_not_mass' AND lower(btrim(c.unit)) IN ('mcg dfe', 'mcg rae', 'mg ne', 'mg rae', 'mg re', 'mcg re'))
      OR (m.target_column = 'enercc' AND lower(btrim(c.unit)) NOT IN ('calorie(s)', '{calories}', 'calories', 'cal', 'kcal', 'kcal(s)'))
      OR (m.target_column = 'nutrients_json' AND c.amount_per_serving IS NOT NULL AND (
        (m.target_unit = 'g' AND lower(btrim(c.unit)) NOT IN ('g', 'gram(s)', 'grams', 'gm', 'mg', 'mcg', 'ug', 'micrograms'))
        OR (m.target_unit = 'mg' AND lower(btrim(c.unit)) NOT IN ('mg', 'g', 'gram(s)', 'grams', 'gm', 'mcg', 'ug', 'micrograms'))
        OR (m.target_unit = 'ug' AND lower(btrim(c.unit)) NOT IN ('mcg', 'ug', 'micrograms', 'mg', 'g', 'gram(s)', 'grams', 'gm'))
      ))), '[]'::jsonb) AS not_convertible
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
    CASE WHEN cardinality(s.serving_sizes) > 1 THEN jsonb_build_object('multiple_serving_sizes', to_jsonb(s.serving_sizes)) ELSE '{}'::jsonb END AS luecken,
  coalesce(v.nutrients, '{}'::jsonb) AS nutrients
FROM supplements.supplier_products p
JOIN serving_cardinality s ON s.product_id = p.id
LEFT JOIN safe_values v ON v.product_id = p.id
LEFT JOIN gaps g ON g.product_id = p.id;

CREATE OR REPLACE VIEW supplements.supplier_product_nutrients
WITH (security_invoker = true)
AS SELECT * FROM supplements.produkt_naehrwerte;

CREATE OR REPLACE FUNCTION nutrition.add_supplement_product_to_meal(
  p_meal_id uuid, p_supplier_product_id uuid, p_serving_quantity numeric DEFAULT 1, p_serving_size text DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql SECURITY INVOKER SET search_path = ''
AS $function$
DECLARE
  v_user_id uuid; v_product record; v_option supplements.supplier_product_nutrient_serving_options%ROWTYPE;
  v_option_count integer; v_item_id uuid; v_status text; v_expected_nutrients jsonb; v_generic_nutrients jsonb;
BEGIN
  IF p_serving_quantity IS NULL OR p_serving_quantity <= 0 THEN RAISE EXCEPTION 'C513: serving quantity must be greater than zero' USING ERRCODE = '22023'; END IF;
  SELECT m.user_id INTO v_user_id FROM nutrition.meals m WHERE m.id = p_meal_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'C513: meal % not found or not readable', p_meal_id USING ERRCODE = 'P0002'; END IF;
  SELECT sp.id, sp.marke, sp.name_en INTO v_product FROM supplements.supplier_products sp WHERE sp.id = p_supplier_product_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'C513: supplier product % not found', p_supplier_product_id USING ERRCODE = 'P0002'; END IF;
  SELECT count(*) INTO v_option_count FROM supplements.supplier_product_nutrient_serving_options o WHERE o.product_id = p_supplier_product_id;
  IF v_option_count > 1 AND NULLIF(btrim(p_serving_size), '') IS NULL THEN RAISE EXCEPTION 'C513: product % has multiple serving sizes; choose one explicitly', p_supplier_product_id USING ERRCODE = 'P0001'; END IF;
  IF v_option_count > 0 THEN
    SELECT o.* INTO v_option FROM supplements.supplier_product_nutrient_serving_options o WHERE o.product_id = p_supplier_product_id AND (v_option_count = 1 OR o.serving_size = btrim(p_serving_size));
    IF NOT FOUND THEN RAISE EXCEPTION 'C513: serving size % is not an evidenced option for product %', p_serving_size, p_supplier_product_id USING ERRCODE = '22023'; END IF;
    v_status := 'available';
  ELSE
    IF NULLIF(btrim(p_serving_size), '') IS NOT NULL THEN RAISE EXCEPTION 'C513: product % has no evidenced nutrient serving size', p_supplier_product_id USING ERRCODE = '22023'; END IF;
    v_status := 'no_nutrients_available';
  END IF;
  SELECT coalesce(jsonb_object_agg(k, (v::numeric * p_serving_quantity)), '{}'::jsonb) INTO v_generic_nutrients
  FROM jsonb_each_text(coalesce(v_option.nutrients, '{}'::jsonb)) AS generic_value(k, v);
  v_expected_nutrients := jsonb_strip_nulls(jsonb_build_object(
    'ALC', v_option.alc * p_serving_quantity, 'VITA', v_option.vita_ug * p_serving_quantity, 'VITD', v_option.vitd_ug * p_serving_quantity,
    'VITE', v_option.vite_mg * p_serving_quantity, 'VITK', v_option.vitk_ug * p_serving_quantity, 'VITC', v_option.vitc_mg * p_serving_quantity,
    'THIA', v_option.thia_mg * p_serving_quantity, 'RIBF', v_option.ribf_mg * p_serving_quantity, 'NIA', v_option.nia_mg * p_serving_quantity,
    'VITB6', v_option.vitb6_ug * p_serving_quantity, 'FOL', v_option.fol_ug * p_serving_quantity, 'VITB12', v_option.vitb12_ug * p_serving_quantity,
    'NA', v_option.na_mg * p_serving_quantity, 'K', v_option.k_mg * p_serving_quantity, 'CA', v_option.ca_mg * p_serving_quantity,
    'MG', v_option.mg_mg * p_serving_quantity, 'P', v_option.p_mg * p_serving_quantity, 'FE', v_option.fe_mg * p_serving_quantity,
    'ZN', v_option.zn_mg * p_serving_quantity, 'ID', v_option.id_ug * p_serving_quantity, 'CU', v_option.cu_ug * p_serving_quantity,
    'MN', v_option.mn_ug * p_serving_quantity
  )) || v_generic_nutrients;
  INSERT INTO nutrition.meal_items (meal_id, user_id, food_source, food_name, amount_g, enercc, prot625, fat, cho, fibt, sugar, fasat, nacl, water_g, nutrients, supplement_product_id, supplement_serving_size, supplement_serving_quantity, supplement_nutrient_status, source_detail)
  VALUES (p_meal_id, v_user_id, 'supplement', concat_ws(' ', nullif(v_product.marke, ''), v_product.name_en), NULL,
    v_option.enercc * p_serving_quantity, v_option.prot625 * p_serving_quantity, v_option.fat * p_serving_quantity, v_option.cho * p_serving_quantity,
    v_option.fibt * p_serving_quantity, v_option.sugar * p_serving_quantity, v_option.fasat * p_serving_quantity, v_option.nacl * p_serving_quantity,
    v_option.water_g * p_serving_quantity, v_expected_nutrients, p_supplier_product_id, v_option.serving_size, p_serving_quantity, v_status,
    'C-513: supplier-product nutrient snapshot') RETURNING id INTO v_item_id;
  RETURN v_item_id;
END;
$function$;

CREATE OR REPLACE FUNCTION nutrition.meal_items_supplement_snapshot_guard()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path = ''
AS $function$
DECLARE
  v_option supplements.supplier_product_nutrient_serving_options%ROWTYPE; v_expected_nutrients jsonb; v_generic_nutrients jsonb;
BEGIN
  IF NEW.food_source <> 'supplement' THEN RETURN NEW; END IF;
  SELECT o.* INTO v_option FROM supplements.supplier_product_nutrient_serving_options o WHERE o.product_id = NEW.supplement_product_id AND o.serving_size = NEW.supplement_serving_size;
  IF NOT FOUND THEN
    IF EXISTS (SELECT 1 FROM supplements.supplier_product_nutrient_serving_options o WHERE o.product_id = NEW.supplement_product_id) THEN RAISE EXCEPTION 'C513: supplement snapshot requires an evidenced serving size' USING ERRCODE = '23514'; END IF;
    IF NEW.supplement_nutrient_status <> 'no_nutrients_available' OR NEW.supplement_serving_size IS NOT NULL OR NEW.enercc IS NOT NULL OR NEW.prot625 IS NOT NULL OR NEW.fat IS NOT NULL OR NEW.cho IS NOT NULL OR NEW.fibt IS NOT NULL OR NEW.sugar IS NOT NULL OR NEW.fasat IS NOT NULL OR NEW.nacl IS NOT NULL OR NEW.water_g IS NOT NULL OR NEW.nutrients <> '{}'::jsonb THEN RAISE EXCEPTION 'C513: product without measured nutrients must remain visibly unknown' USING ERRCODE = '23514'; END IF;
    RETURN NEW;
  END IF;
  SELECT coalesce(jsonb_object_agg(k, (v::numeric * NEW.supplement_serving_quantity)), '{}'::jsonb) INTO v_generic_nutrients
  FROM jsonb_each_text(coalesce(v_option.nutrients, '{}'::jsonb)) AS generic_value(k, v);
  v_expected_nutrients := jsonb_strip_nulls(jsonb_build_object(
    'ALC', v_option.alc * NEW.supplement_serving_quantity, 'VITA', v_option.vita_ug * NEW.supplement_serving_quantity, 'VITD', v_option.vitd_ug * NEW.supplement_serving_quantity,
    'VITE', v_option.vite_mg * NEW.supplement_serving_quantity, 'VITK', v_option.vitk_ug * NEW.supplement_serving_quantity, 'VITC', v_option.vitc_mg * NEW.supplement_serving_quantity,
    'THIA', v_option.thia_mg * NEW.supplement_serving_quantity, 'RIBF', v_option.ribf_mg * NEW.supplement_serving_quantity, 'NIA', v_option.nia_mg * NEW.supplement_serving_quantity,
    'VITB6', v_option.vitb6_ug * NEW.supplement_serving_quantity, 'FOL', v_option.fol_ug * NEW.supplement_serving_quantity, 'VITB12', v_option.vitb12_ug * NEW.supplement_serving_quantity,
    'NA', v_option.na_mg * NEW.supplement_serving_quantity, 'K', v_option.k_mg * NEW.supplement_serving_quantity, 'CA', v_option.ca_mg * NEW.supplement_serving_quantity,
    'MG', v_option.mg_mg * NEW.supplement_serving_quantity, 'P', v_option.p_mg * NEW.supplement_serving_quantity, 'FE', v_option.fe_mg * NEW.supplement_serving_quantity,
    'ZN', v_option.zn_mg * NEW.supplement_serving_quantity, 'ID', v_option.id_ug * NEW.supplement_serving_quantity, 'CU', v_option.cu_ug * NEW.supplement_serving_quantity,
    'MN', v_option.mn_ug * NEW.supplement_serving_quantity
  )) || v_generic_nutrients;
  IF NEW.supplement_nutrient_status <> 'available' OR NEW.enercc IS DISTINCT FROM v_option.enercc * NEW.supplement_serving_quantity OR NEW.prot625 IS DISTINCT FROM v_option.prot625 * NEW.supplement_serving_quantity OR NEW.fat IS DISTINCT FROM v_option.fat * NEW.supplement_serving_quantity OR NEW.cho IS DISTINCT FROM v_option.cho * NEW.supplement_serving_quantity OR NEW.fibt IS DISTINCT FROM v_option.fibt * NEW.supplement_serving_quantity OR NEW.sugar IS DISTINCT FROM v_option.sugar * NEW.supplement_serving_quantity OR NEW.fasat IS DISTINCT FROM v_option.fasat * NEW.supplement_serving_quantity OR NEW.nacl IS DISTINCT FROM v_option.nacl * NEW.supplement_serving_quantity OR NEW.water_g IS DISTINCT FROM v_option.water_g * NEW.supplement_serving_quantity OR NEW.nutrients IS DISTINCT FROM v_expected_nutrients THEN RAISE EXCEPTION 'C513: supplement nutrient snapshot differs from its evidenced product serving' USING ERRCODE = '23514'; END IF;
  RETURN NEW;
END;
$function$;

COMMENT ON VIEW supplements.supplier_product_nutrient_serving_options IS
  'C-512/C-516: DSLD-Naehrwerte pro belegter Facts-Portion; weitere vorhandene nutrition.nutrient_defs stehen feldgenau in nutrients. Mehrportionen bleiben getrennt.';
COMMENT ON VIEW supplements.produkt_naehrwerte IS
  'C-512/C-516: Einzelportionen sind berechnet; nutrients fuehrt vorhandene, nicht breite nutrition.nutrient_defs. Mehrportionen und nicht umrechenbare Einheiten bleiben sichtbar offen.';

REVOKE ALL ON TABLE supplements.supplier_product_nutrient_serving_options FROM PUBLIC, anon;
GRANT SELECT ON TABLE supplements.supplier_product_nutrient_serving_options TO authenticated;
GRANT ALL ON TABLE supplements.supplier_product_nutrient_serving_options TO service_role;
REVOKE ALL ON TABLE supplements.produkt_naehrwerte FROM PUBLIC, anon;
GRANT SELECT ON TABLE supplements.produkt_naehrwerte TO authenticated;
REVOKE ALL ON TABLE supplements.supplier_product_nutrients FROM PUBLIC, anon;
GRANT SELECT ON TABLE supplements.supplier_product_nutrients TO authenticated;
REVOKE ALL ON FUNCTION nutrition.add_supplement_product_to_meal(uuid,uuid,numeric,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION nutrition.add_supplement_product_to_meal(uuid,uuid,numeric,text) TO authenticated, service_role;

COMMIT;
