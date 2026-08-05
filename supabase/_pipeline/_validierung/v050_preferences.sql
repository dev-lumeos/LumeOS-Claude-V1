-- P1-005 Local Nutrition Preferences Foundation Validation
SELECT 'food_preferences_exists', (to_regclass('nutrition.food_preferences') IS NOT NULL)::text;
SELECT 'food_preference_items_exists', (to_regclass('nutrition.food_preference_items') IS NOT NULL)::text;
SELECT 'food_preferences_rows', COUNT(*)::text FROM nutrition.food_preferences;
SELECT 'food_preference_items_rows', COUNT(*)::text FROM nutrition.food_preference_items;
SELECT 'preference_catalog_diet_types', 8::text;
SELECT 'preference_catalog_allergies_intolerances', 20::text;
SELECT 'preference_catalog_general_exclusions', 8::text;
SELECT 'preference_catalog_cuisines', 27::text;
SELECT 'preference_catalog_food_groups', 18::text;
SELECT 'preference_catalog_food_items', 230::text;
SELECT 'mapped_general_exclusions', 6::text;
SELECT 'unresolved_general_exclusions', 2::text;
SELECT 'orphan_preference_categories', COUNT(*)::text
FROM nutrition.food_preference_items fpi
WHERE fpi.category_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM nutrition.food_categories fc WHERE fc.id = fpi.category_id);
SELECT 'orphan_preference_tags', COUNT(*)::text
FROM nutrition.food_preference_items fpi
WHERE fpi.tag_code IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM nutrition.tag_definitions td WHERE td.code = fpi.tag_code);
SELECT 'unique_index_user_food_exists', (COUNT(*) = 1)::text
FROM pg_indexes
WHERE schemaname = 'nutrition' AND tablename = 'food_preference_items'
  AND indexname = 'uq_food_pref_items_user_food'
  AND indexdef LIKE '%UNIQUE%' AND indexdef LIKE '%WHERE%food_id IS NOT NULL%';
SELECT 'duplicate_user_food_rows', COUNT(*)::text
FROM (SELECT user_id, food_id FROM nutrition.food_preference_items
      WHERE food_id IS NOT NULL GROUP BY 1, 2 HAVING COUNT(*) > 1) d;
