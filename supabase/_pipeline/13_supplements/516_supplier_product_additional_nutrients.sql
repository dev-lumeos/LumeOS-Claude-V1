BEGIN;

-- C-516: Nur exakte DSLD-Naehrwertlabels mit vorhandenem nutrition-Code.
-- Blendnamen sowie Trans Fat/Added Sugars bleiben absichtlich ohne Mapping:
-- fuer letztere existiert kein nutrition.nutrient_defs-Ziel.
INSERT INTO supplements.supplier_product_nutrient_name_mappings (
  dsld_name, nutrient_code, target_column, target_unit, conversion_rule,
  source_id, evidence_class, source_note
) VALUES
  ('Cholesterol', 'CHORL', 'nutrients_json', 'mg', 'mass_or_label', 'dsld_nutrition_facts_exact_label_c516', 'A', 'DSLD Nutrition Facts: exaktes Cholesterol-Label.'),
  ('{Cholesterol}', 'CHORL', 'nutrients_json', 'mg', 'mass_or_label', 'dsld_nutrition_facts_exact_label_c516', 'A', 'DSLD Nutrition Facts: Klammer-Schreibvariante von Cholesterol.'),
  ('Cholesterols', 'CHORL', 'nutrients_json', 'mg', 'mass_or_label', 'dsld_nutrition_facts_exact_label_c516', 'A', 'DSLD Nutrition Facts: Plural-Schreibvariante von Cholesterol.'),
  ('Total Cholesterol', 'CHORL', 'nutrients_json', 'mg', 'mass_or_label', 'dsld_nutrition_facts_exact_label_c516', 'A', 'DSLD Nutrition Facts: expliziter Gesamtcholesterinwert.'),
  ('Monounsaturated', 'FAMS', 'nutrients_json', 'g', 'mass_or_label', 'dsld_nutrition_facts_exact_label_c516', 'A', 'DSLD Nutrition Facts: Kurzschreibweise fuer einfach ungesaettigte Fette.'),
  ('Monounsaturated {Fat}', 'FAMS', 'nutrients_json', 'g', 'mass_or_label', 'dsld_nutrition_facts_exact_label_c516', 'A', 'DSLD Nutrition Facts: Klammer-Schreibvariante von Monounsaturated Fat.'),
  ('Monounsaturated Fat', 'FAMS', 'nutrients_json', 'g', 'mass_or_label', 'dsld_nutrition_facts_exact_label_c516', 'A', 'DSLD Nutrition Facts: einfach ungesaettigte Fette.'),
  ('Monounsaturated Fats', 'FAMS', 'nutrients_json', 'g', 'mass_or_label', 'dsld_nutrition_facts_exact_label_c516', 'A', 'DSLD Nutrition Facts: Plural-Schreibvariante von Monounsaturated Fat.'),
  ('Monounsaturated Fatty Acids', 'FAMS', 'nutrients_json', 'g', 'mass_or_label', 'dsld_nutrition_facts_exact_label_c516', 'A', 'DSLD Nutrition Facts: ausformulierter Name fuer einfach ungesaettigte Fette.'),
  ('Polyunsaturated {Fat}', 'FAPU', 'nutrients_json', 'g', 'mass_or_label', 'dsld_nutrition_facts_exact_label_c516', 'A', 'DSLD Nutrition Facts: Klammer-Schreibvariante von Polyunsaturated Fat.'),
  ('Polyunsaturated Fat', 'FAPU', 'nutrients_json', 'g', 'mass_or_label', 'dsld_nutrition_facts_exact_label_c516', 'A', 'DSLD Nutrition Facts: mehrfach ungesaettigte Fette.'),
  ('Polyunsaturated Fatty Acids', 'FAPU', 'nutrients_json', 'g', 'mass_or_label', 'dsld_nutrition_facts_exact_label_c516', 'A', 'DSLD Nutrition Facts: ausformulierter Name fuer mehrfach ungesaettigte Fette.'),
  ('Soluble Fiber', 'FIBSOL', 'nutrients_json', 'g', 'mass_or_label', 'dsld_nutrition_facts_exact_label_c516', 'A', 'DSLD Nutrition Facts: wasserloesliche Ballaststoffe.'),
  ('Insoluble Fiber', 'FIBINS', 'nutrients_json', 'g', 'mass_or_label', 'dsld_nutrition_facts_exact_label_c516', 'A', 'DSLD Nutrition Facts: wasserunloesliche Ballaststoffe.')
ON CONFLICT (dsld_name) DO UPDATE SET
  nutrient_code = EXCLUDED.nutrient_code,
  target_column = EXCLUDED.target_column,
  target_unit = EXCLUDED.target_unit,
  conversion_rule = EXCLUDED.conversion_rule,
  source_id = EXCLUDED.source_id,
  evidence_class = EXCLUDED.evidence_class,
  source_note = EXCLUDED.source_note
WHERE (supplements.supplier_product_nutrient_name_mappings.nutrient_code,
       supplements.supplier_product_nutrient_name_mappings.target_column,
       supplements.supplier_product_nutrient_name_mappings.target_unit,
       supplements.supplier_product_nutrient_name_mappings.conversion_rule,
       supplements.supplier_product_nutrient_name_mappings.source_id,
       supplements.supplier_product_nutrient_name_mappings.evidence_class,
       supplements.supplier_product_nutrient_name_mappings.source_note)
  IS DISTINCT FROM
      (EXCLUDED.nutrient_code, EXCLUDED.target_column, EXCLUDED.target_unit,
       EXCLUDED.conversion_rule, EXCLUDED.source_id, EXCLUDED.evidence_class,
       EXCLUDED.source_note);

COMMIT;
