-- C-498/G-458: Alias-Katalog und einmalige Uebernahme der bestehenden
-- Nutrition-Allergien; Struktur bleibt in der Migration.
BEGIN;

INSERT INTO public.allergen_aliases (stoff_code, alias_text, source_id, evidence_class) VALUES
  ('magnesium_stearate', 'Magnesium Stearate', 'dsld_product_contents', 'A'),
  ('magnesium_stearate', 'Magnesium Stearate (Mg Stearate)', 'dsld_product_contents', 'A'),
  ('magnesium_stearate', 'Vegetable Magnesium Stearate', 'dsld_product_contents', 'A')
ON CONFLICT (stoff_code, alias_text) DO NOTHING;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'nutrition'
      AND table_name = 'food_preferences'
      AND column_name = 'allergies'
  ) THEN
    EXECUTE $migration$
      INSERT INTO public.user_allergies (user_id, stoff_code, stoff_text, art, schwere, quelle)
      SELECT
        fp.user_id,
        lower(btrim(allergy.stoff_code)),
        replace(lower(btrim(allergy.stoff_code)), '_', ' '),
        'nahrung',
        'allergie',
        'nutrition_preferences'
      FROM nutrition.food_preferences fp
      CROSS JOIN LATERAL unnest(COALESCE(fp.allergies, '{}'::text[])) AS allergy(stoff_code)
      WHERE btrim(allergy.stoff_code) <> ''
      ON CONFLICT (user_id, stoff_code, art) WHERE stoff_code IS NOT NULL DO NOTHING
    $migration$;
  END IF;
END $$;

DO $$
BEGIN
  IF (SELECT count(*) FROM public.allergen_aliases WHERE stoff_code = 'magnesium_stearate') <> 3 THEN
    RAISE EXCEPTION 'C-498/G-458: erwartete drei Magnesiumstearat-Aliase';
  END IF;
END $$;

COMMIT;
