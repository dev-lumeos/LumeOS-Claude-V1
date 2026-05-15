-- P1-005 local-only curation persistence validation.
-- Run against local Supabase/Test DB only.

SELECT 'food_curation_candidates_exists' AS check_name,
       (to_regclass('nutrition.food_curation_candidates') IS NOT NULL)::text AS result;

SELECT 'food_curation_decisions_exists' AS check_name,
       (to_regclass('nutrition.food_curation_decisions') IS NOT NULL)::text AS result;

SELECT 'food_curation_candidates_count' AS check_name,
       COUNT(*)::text AS result
FROM nutrition.food_curation_candidates;

SELECT 'food_curation_decisions_count' AS check_name,
       COUNT(*)::text AS result
FROM nutrition.food_curation_decisions;

SELECT 'foods_total_unchanged' AS check_name,
       COUNT(*)::text AS result
FROM nutrition.foods;

SELECT 'food_nutrients_total_unchanged' AS check_name,
       COUNT(*)::text AS result
FROM nutrition.food_nutrients;

SELECT 'orphan_candidate_foods' AS check_name,
       COUNT(*)::text AS result
FROM nutrition.food_curation_candidates c
LEFT JOIN nutrition.foods f ON f.id = c.food_id
WHERE c.food_id IS NOT NULL
  AND f.id IS NULL;

SELECT 'orphan_decisions' AS check_name,
       COUNT(*)::text AS result
FROM nutrition.food_curation_decisions d
LEFT JOIN nutrition.food_curation_candidates c ON c.id = d.candidate_id
WHERE c.id IS NULL;
