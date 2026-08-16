-- encoding-pruefung:absicht — diese Datei sucht nach beschaedigten
-- Sequenzen und traegt sie deshalb selbst. Kein Schaden.
-- P1-005 local-only validation for V2xxxx -> Wild category apply

SELECT
  COUNT(*) AS foods,
  COUNT(*) FILTER (WHERE category_id IS NOT NULL) AS categorized_foods,
  COUNT(*) FILTER (WHERE category_id IS NULL) AS unassigned_foods
FROM nutrition.foods;

SELECT COUNT(*) AS v2_wild_foods
FROM nutrition.foods f
JOIN nutrition.food_categories c ON c.id = f.category_id
WHERE f.bls_code LIKE 'V2%'
  AND c.slug = 'wild';

SELECT COUNT(*) AS v2_unassigned_foods
FROM nutrition.foods
WHERE category_id IS NULL
  AND bls_code LIKE 'V2%';

SELECT COUNT(*) AS food_nutrients
FROM nutrition.food_nutrients;

SELECT COUNT(*) AS missing_nutrient_fk
FROM nutrition.food_nutrients fn
LEFT JOIN nutrition.nutrient_defs nd ON nd.code = fn.nutrient_code
WHERE nd.code IS NULL;

SELECT COUNT(*) AS orphan_food_nutrients
FROM nutrition.food_nutrients fn
LEFT JOIN nutrition.foods f ON f.id = fn.food_id
WHERE f.id IS NULL;

SELECT COUNT(*) AS orphan_category_parents
FROM nutrition.food_categories c
LEFT JOIN nutrition.food_categories p ON p.id = c.parent_id
WHERE c.parent_id IS NOT NULL
  AND p.id IS NULL;

SELECT COUNT(*) AS utf8_suspect_foods
FROM nutrition.foods
WHERE name_de LIKE '%??%'
   OR name_de LIKE '%�%';
