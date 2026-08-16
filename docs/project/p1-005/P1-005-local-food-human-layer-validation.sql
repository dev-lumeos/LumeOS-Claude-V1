-- encoding-pruefung:absicht — diese Datei sucht nach beschaedigten
-- Sequenzen und traegt sie deshalb selbst. Kein Schaden.

SELECT 'foods_total', COUNT(*)::text FROM nutrition.foods
UNION ALL SELECT 'food_nutrients_total', COUNT(*)::text FROM nutrition.food_nutrients
UNION ALL SELECT 'food_categories_total', COUNT(*)::text FROM nutrition.food_categories
UNION ALL SELECT 'food_categories_level_1', COUNT(*)::text FROM nutrition.food_categories WHERE level=1
UNION ALL SELECT 'food_categories_level_2', COUNT(*)::text FROM nutrition.food_categories WHERE level=2
UNION ALL SELECT 'food_categories_level_3', COUNT(*)::text FROM nutrition.food_categories WHERE level=3
UNION ALL SELECT 'food_categories_level_4', COUNT(*)::text FROM nutrition.food_categories WHERE level=4
UNION ALL SELECT 'orphan_category_parents', COUNT(*)::text FROM nutrition.food_categories c WHERE c.parent_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM nutrition.food_categories p WHERE p.id=c.parent_id)
UNION ALL SELECT 'tag_definitions_total', COUNT(*)::text FROM nutrition.tag_definitions
UNION ALL SELECT 'food_tags_total', COUNT(*)::text FROM nutrition.food_tags
UNION ALL SELECT 'food_aliases_total', COUNT(*)::text FROM nutrition.food_aliases
UNION ALL SELECT 'foods_categorized', COUNT(*)::text FROM nutrition.foods WHERE category_id IS NOT NULL
UNION ALL SELECT 'foods_uncategorized', COUNT(*)::text FROM nutrition.foods WHERE category_id IS NULL
UNION ALL SELECT 'sort_weight_populated', COUNT(*)::text FROM nutrition.foods WHERE sort_weight IS NOT NULL
UNION ALL SELECT 'sort_weight_missing', COUNT(*)::text FROM nutrition.foods WHERE sort_weight IS NULL
UNION ALL SELECT 'missing_nutrient_fk', COUNT(*)::text FROM nutrition.food_nutrients fn WHERE NOT EXISTS (SELECT 1 FROM nutrition.nutrient_defs nd WHERE nd.code=fn.nutrient_code)
UNION ALL SELECT 'orphan_food_nutrients', COUNT(*)::text FROM nutrition.food_nutrients fn WHERE NOT EXISTS (SELECT 1 FROM nutrition.foods f WHERE f.id=fn.food_id)
UNION ALL SELECT 'utf8_suspect_foods', COUNT(*)::text FROM nutrition.foods WHERE name_de LIKE '%??%' OR name_de LIKE '%�%'
ORDER BY 1;
