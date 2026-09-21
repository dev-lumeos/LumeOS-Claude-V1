-- C-525: Suchbegriffe sind bewusst vom Produkt-Aliaskatalog getrennt.
-- Quelle je Zeile: EU 1169/2011 Annex II bestimmt die Allergenklasse;
-- nutrition.foods und nutrition.food_aliases belegen die deutsche
-- Nutzervokabel im BLS-Bestand (Messung 2026-09-21). Die Begriffe behaupten
-- keinen Produktinhalt und fliessen nicht in Produkt-Allergiematches ein.
BEGIN;

INSERT INTO public.allergy_search_terms (
  tag_code, search_term, source_id, evidence_class
) VALUES
  ('contains_gluten', 'Brot', 'eu_1169_2011_annex_ii+nutrition_foods:2026-09-21', 'B'),
  ('contains_gluten', 'Weizen', 'eu_1169_2011_annex_ii+nutrition_foods:2026-09-21', 'B'),
  ('contains_gluten', 'Roggen', 'eu_1169_2011_annex_ii+nutrition_foods:2026-09-21', 'B'),
  ('contains_gluten', 'Gerste', 'eu_1169_2011_annex_ii+nutrition_foods:2026-09-21', 'B'),
  ('contains_gluten', 'Dinkel', 'eu_1169_2011_annex_ii+nutrition_foods:2026-09-21', 'B'),
  ('contains_gluten', 'Nudel', 'eu_1169_2011_annex_ii+nutrition_foods:2026-09-21', 'B'),
  ('contains_gluten', 'Mehl', 'eu_1169_2011_annex_ii+nutrition_foods:2026-09-21', 'B'),

  ('contains_lactose', 'Milch', 'eu_1169_2011_annex_ii+nutrition_foods:2026-09-21', 'B'),
  ('contains_lactose', 'Käse', 'eu_1169_2011_annex_ii+nutrition_foods:2026-09-21', 'B'),
  ('contains_lactose', 'Joghurt', 'eu_1169_2011_annex_ii+nutrition_foods:2026-09-21', 'B'),
  ('contains_lactose', 'Sahne', 'eu_1169_2011_annex_ii+nutrition_foods:2026-09-21', 'B'),
  ('contains_lactose', 'Milchzucker', 'bls:S116000+nutrition_foods:2026-09-21', 'A'),

  ('contains_nuts', 'Nuss', 'eu_1169_2011_annex_ii+nutrition_foods:2026-09-21', 'B'),
  ('contains_nuts', 'Nüsse', 'eu_1169_2011_annex_ii+nutrition_foods:2026-09-21', 'B'),
  ('contains_nuts', 'Mandel', 'eu_1169_2011_annex_ii+nutrition_foods:2026-09-21', 'B'),
  ('contains_nuts', 'Walnuss', 'eu_1169_2011_annex_ii+nutrition_foods:2026-09-21', 'B'),
  ('contains_nuts', 'Haselnuss', 'eu_1169_2011_annex_ii+nutrition_foods:2026-09-21', 'B'),
  ('contains_nuts', 'Cashew', 'eu_1169_2011_annex_ii+nutrition_foods:2026-09-21', 'B'),
  ('contains_nuts', 'Pistazie', 'eu_1169_2011_annex_ii+nutrition_foods:2026-09-21', 'B'),

  ('contains_soy', 'Soja', 'eu_1169_2011_annex_ii+nutrition_foods:2026-09-21', 'B'),
  ('contains_soy', 'Tofu', 'eu_1169_2011_annex_ii+nutrition_foods:2026-09-21', 'B'),
  ('contains_soy', 'Edamame', 'eu_1169_2011_annex_ii+nutrition_foods:2026-09-21', 'B'),
  ('contains_soy', 'Sojasauce', 'eu_1169_2011_annex_ii+nutrition_foods:2026-09-21', 'B')
ON CONFLICT (tag_code, search_term) DO UPDATE SET
  source_id = EXCLUDED.source_id,
  evidence_class = EXCLUDED.evidence_class
WHERE public.allergy_search_terms.source_id IS DISTINCT FROM EXCLUDED.source_id
   OR public.allergy_search_terms.evidence_class IS DISTINCT FROM EXCLUDED.evidence_class;

DO $$
BEGIN
  IF (SELECT count(*) FROM public.allergy_search_terms) <> 23 THEN
    RAISE EXCEPTION 'C-525: erwartete 23 kuratierte Food-Allergie-Suchbegriffe';
  END IF;
  IF EXISTS (
    SELECT 1 FROM public.allergy_search_terms
    WHERE tag_code = 'contains_nuts'
      AND nutrition.search_fold(search_term) = 'erdnuss'
  ) THEN
    RAISE EXCEPTION 'C-525: Erdnuss ist kein Baumnuss-Suchbegriff';
  END IF;
END;
$$;

COMMIT;
