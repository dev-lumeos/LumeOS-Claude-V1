-- C-496/G-458: kuratierte DSLD-Labelnamen sind Katalogdaten und werden
-- ausschliesslich in der Aufbaukette eingespielt.
BEGIN;

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
  ('Manganese', 'MN', 'mn_ug', 'ug', 'mass_or_label', 'dsld_product_label', 'A', 'DSLD Nutrition-Facts-Label.')
ON CONFLICT (dsld_name) DO NOTHING;

DO $$
BEGIN
  IF (SELECT count(*) FROM supplements.supplier_product_nutrient_name_mappings) <> 39 THEN
    RAISE EXCEPTION 'C-496/G-458: erwartete 39 DSLD-Naehrstoffzuordnungen';
  END IF;
END $$;

COMMIT;
