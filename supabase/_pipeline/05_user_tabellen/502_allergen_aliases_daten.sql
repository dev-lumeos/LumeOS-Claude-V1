-- C-502: Nur explizit belegte Inhaltsnamen. Keine Zutatenmuster, keine
-- hochraffinierten Oele und kein Coconut (FDA Edition 5: nicht Tree-Nut-Liste).
BEGIN;

INSERT INTO public.allergen_aliases (stoff_code, alias_text, source_id, evidence_class) VALUES
  ('nutrition:contains_lactose', 'Lactose', 'dsld_product_contents:exact_lactose', 'A'),
  ('nutrition:contains_lactose', 'Lactose Monohydrate', 'dsld_product_contents:exact_lactose_monohydrate', 'A'),
  ('nutrition:contains_lactose', 'Milk Protein Isolate', 'c502_task_boundary:milk_protein_isolate', 'B'),

  ('nutrition:contains_nuts', 'Almond', 'fda_food_allergens_edition5_tree_nuts', 'A'),
  ('nutrition:contains_nuts', 'Almonds', 'fda_food_allergens_edition5_tree_nuts', 'A'),
  ('nutrition:contains_nuts', 'Black Walnut', 'fda_food_allergens_edition5_tree_nuts', 'A'),
  ('nutrition:contains_nuts', 'Brazil Nut', 'fda_food_allergens_edition5_tree_nuts', 'A'),
  ('nutrition:contains_nuts', 'Brazil Nuts', 'fda_food_allergens_edition5_tree_nuts', 'A'),
  ('nutrition:contains_nuts', 'Cashew', 'fda_food_allergens_edition5_tree_nuts', 'A'),
  ('nutrition:contains_nuts', 'Cashews', 'fda_food_allergens_edition5_tree_nuts', 'A'),
  ('nutrition:contains_nuts', 'Hazelnut', 'fda_food_allergens_edition5_tree_nuts', 'A'),
  ('nutrition:contains_nuts', 'Hazelnuts', 'fda_food_allergens_edition5_tree_nuts', 'A'),
  ('nutrition:contains_nuts', 'Macadamia Nut', 'fda_food_allergens_edition5_tree_nuts', 'A'),
  ('nutrition:contains_nuts', 'Pistachio', 'fda_food_allergens_edition5_tree_nuts', 'A'),
  ('nutrition:contains_nuts', 'Walnut', 'fda_food_allergens_edition5_tree_nuts', 'A'),
  ('nutrition:contains_nuts', 'Walnuts', 'fda_food_allergens_edition5_tree_nuts', 'A'),

  ('nutrition:contains_soy', 'Soy', 'fda_food_allergies_soybeans', 'A'),
  ('nutrition:contains_soy', 'Soya', 'fda_food_allergies_soybeans', 'A'),
  ('nutrition:contains_soy', 'Soybean', 'fda_food_allergies_soybeans', 'A'),
  ('nutrition:contains_soy', 'Soybeans', 'fda_food_allergies_soybeans', 'A'),
  ('nutrition:contains_soy', 'Soy Lecithin', 'fda_food_allergies_lecithin_soy', 'A'),
  ('nutrition:contains_soy', 'Lecithin (Soy)', 'fda_food_allergies_lecithin_soy', 'A'),
  ('nutrition:contains_soy', 'Soy Protein Isolate', 'fda_food_allergies_soybeans', 'A')
ON CONFLICT (stoff_code, alias_text) DO NOTHING;

DO $$
BEGIN
  IF (SELECT count(*) FROM public.allergen_aliases WHERE stoff_code = 'nutrition:contains_lactose') <> 6 THEN
    RAISE EXCEPTION 'C-502: sechs Laktose-Aliase erwartet';
  END IF;
  IF (SELECT count(*) FROM public.allergen_aliases WHERE stoff_code = 'nutrition:contains_nuts') <> 13 THEN
    RAISE EXCEPTION 'C-502: dreizehn Baum-Nuss-Aliase erwartet';
  END IF;
  IF (SELECT count(*) FROM public.allergen_aliases WHERE stoff_code = 'nutrition:contains_soy') <> 7 THEN
    RAISE EXCEPTION 'C-502: sieben Soja-Aliase erwartet';
  END IF;
  IF EXISTS (
    SELECT 1 FROM public.allergen_aliases
    WHERE stoff_code = 'nutrition:contains_nuts'
      AND nutrition.search_fold(alias_text) = 'coconut'
  ) THEN
    RAISE EXCEPTION 'C-502: Coconut ist kein Tree-Nut-Alias';
  END IF;
END $$;

COMMIT;
