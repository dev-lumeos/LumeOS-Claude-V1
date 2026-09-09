-- C-366 / E-55: Suche und Vorschau muessen dieselbe Ueberlagerung lesen.
DO $$
DECLARE
  reader RECORD;
  definition TEXT;
BEGIN
  FOR reader IN
    SELECT p.oid
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'nutrition'
      AND p.proname IN (
        'food_search',
        'preference_search_preview',
        'refresh_food_preference_search_targets'
      )
  LOOP
    definition := replace(
      pg_get_functiondef(reader.oid),
      'nutrition.food_tags',
      'nutrition.food_tags_effective'
    );
    -- Der Migrationslauf darf einen bereits umgestellten Leser nicht noch
    -- einmal ersetzen: sonst entstuende food_tags_effective_effective.
    IF pg_get_functiondef(reader.oid) LIKE '%nutrition.food_tags_effective%' THEN
      CONTINUE;
    END IF;
    EXECUTE definition;
  END LOOP;
END $$;
