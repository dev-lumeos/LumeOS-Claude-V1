-- =============================================================================
-- NUTRITION MIGRATION — PRE-MIGRATION AUDIT
-- =============================================================================
-- Run this file BEFORE starting Phase 0 of the migration.
-- Each block returns rows → decision needed.
-- Zero rows = safe to proceed for that block.
--
-- Referenced from: NUTRITION_MIGRATION_ANALYSIS_PART2.md §C
-- =============================================================================

\echo '=== C.1 ORPHANED REFERENCES ==='

\echo '--- C.1.1 Orphaned meal_items (bls source, no matching food) ---'
SELECT mi.id, mi.meal_id, mi.food_id, mi.food_name, m.user_id
FROM nutrition.meal_items mi
JOIN nutrition.meals m ON m.id = mi.meal_id
WHERE mi.food_source = 'bls'
  AND mi.food_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM nutrition.foods f WHERE f.id = mi.food_id);

\echo '--- C.1.2 Orphaned meal_items (custom source, no matching custom food) ---'
SELECT mi.id, mi.meal_id, mi.food_id, mi.food_name, m.user_id
FROM nutrition.meal_items mi
JOIN nutrition.meals m ON m.id = mi.meal_id
WHERE mi.food_source = 'custom'
  AND mi.food_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM nutrition.foods_custom fc WHERE fc.id = mi.food_id);

\echo '--- C.1.3 Ghost MealItems (no food_id at all) — R-21 ---'
SELECT mi.id, mi.meal_id, mi.food_source, mi.food_name,
       m.user_id, m.date, mi.kcal, mi.protein_g, mi.carbs_g, mi.fat_g
FROM nutrition.meal_items mi
JOIN nutrition.meals m ON m.id = mi.meal_id
WHERE mi.food_id IS NULL;

\echo '--- C.1.4 Meals without any items (empty meals) ---'
SELECT m.id, m.user_id, m.date, m.meal_type, m.created_at
FROM nutrition.meals m
WHERE NOT EXISTS (SELECT 1 FROM nutrition.meal_items mi WHERE mi.meal_id = m.id);


\echo ''
\echo '=== C.2 MEAL_PLAN_ITEMS INTEGRITY — R-07 ==='

SELECT id, day_id, meal_type, food_id, custom_food_id, recipe_id, name,
       (food_id IS NOT NULL)::int + (custom_food_id IS NOT NULL)::int + (recipe_id IS NOT NULL)::int AS ref_count
FROM public.meal_plan_items
WHERE (food_id IS NOT NULL)::int
    + (custom_food_id IS NOT NULL)::int
    + (recipe_id IS NOT NULL)::int
    != 1;


\echo ''
\echo '=== C.3 FOOD_PREFERENCES JSONB STRUCTURES — R-09 ==='

\echo '--- C.3.1 Sample liked_foods / disliked_foods / food_ratings ---'
SELECT user_id,
       jsonb_pretty(liked_foods)    AS liked_sample,
       jsonb_pretty(disliked_foods) AS disliked_sample,
       jsonb_pretty(food_ratings)   AS ratings_sample
FROM public.user_food_preferences
WHERE liked_foods    != '[]'::jsonb
   OR disliked_foods != '[]'::jsonb
   OR food_ratings   != '{}'::jsonb
LIMIT 5;

\echo '--- C.3.2 food_ratings key inventory ---'
SELECT DISTINCT jsonb_object_keys(food_ratings) AS ratings_key
FROM public.user_food_preferences
WHERE food_ratings IS NOT NULL AND food_ratings != '{}'::jsonb;

\echo '--- C.3.3 liked_foods typical structure (inspect element shapes) ---'
SELECT DISTINCT jsonb_typeof(elem) AS elem_type,
                jsonb_object_keys(elem) AS keys
FROM public.user_food_preferences,
     jsonb_array_elements(liked_foods) AS elem
WHERE jsonb_typeof(elem) = 'object';


\echo ''
\echo '=== C.4 DEV-UUID AUDIT — R-03 ==='

WITH dev AS (SELECT '00000000-0000-0000-0000-000000000001'::uuid AS uid)
SELECT 'meals'                   AS tbl, COUNT(*) AS dev_rows FROM nutrition.meals           , dev WHERE user_id = dev.uid
UNION ALL
SELECT 'foods_custom'                 , COUNT(*)             FROM nutrition.foods_custom    , dev WHERE user_id = dev.uid
UNION ALL
SELECT 'nutrition_targets'            , COUNT(*)             FROM nutrition.nutrition_targets, dev WHERE user_id = dev.uid
UNION ALL
SELECT 'nutrition_micro_flags'        , COUNT(*)             FROM nutrition.nutrition_micro_flags, dev WHERE user_id = dev.uid
UNION ALL
SELECT 'water_logs'                   , COUNT(*)             FROM nutrition.water_logs      , dev WHERE user_id = dev.uid
UNION ALL
SELECT 'weight_logs'                  , COUNT(*)             FROM nutrition.weight_logs     , dev WHERE user_id = dev.uid
UNION ALL
SELECT 'recipes'                      , COUNT(*)             FROM public.recipes            , dev WHERE user_id = dev.uid
UNION ALL
SELECT 'meal_plans'                   , COUNT(*)             FROM public.meal_plans         , dev WHERE user_id = dev.uid
UNION ALL
SELECT 'food_favorites'               , COUNT(*)             FROM public.food_favorites     , dev WHERE user_id = dev.uid
UNION ALL
SELECT 'user_nutrition_goals'         , COUNT(*)             FROM public.user_nutrition_goals, dev WHERE user_id = dev.uid
UNION ALL
SELECT 'tdee_history'                 , COUNT(*)             FROM public.tdee_history       , dev WHERE user_id = dev.uid
UNION ALL
SELECT 'user_food_preferences'        , COUNT(*)             FROM public.user_food_preferences, dev WHERE user_id = dev.uid
ORDER BY tbl;


\echo ''
\echo '=== C.4b ORPHAN USER-IDs (user_id not in auth.users) ==='

SELECT 'meals' AS src, user_id, COUNT(*) AS n FROM nutrition.meals
WHERE NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.id = meals.user_id)
GROUP BY user_id
UNION ALL
SELECT 'foods_custom', user_id, COUNT(*) FROM nutrition.foods_custom
WHERE NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.id = foods_custom.user_id)
GROUP BY user_id
UNION ALL
SELECT 'water_logs', user_id, COUNT(*) FROM nutrition.water_logs
WHERE NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.id = water_logs.user_id)
GROUP BY user_id
ORDER BY src, n DESC;


\echo ''
\echo '=== C.5 SCHEMA STATE VERIFICATION ==='

\echo '--- C.5.1 daily_nutrition_aggregates: Tabelle oder VIEW? ---'
SELECT 'table' AS kind, schemaname, tablename AS name FROM pg_tables WHERE tablename = 'daily_nutrition_aggregates'
UNION ALL
SELECT 'view' , schemaname, viewname       FROM pg_views  WHERE viewname  = 'daily_nutrition_aggregates';

\echo '--- C.5.2 daily_nutrition_summary VIEW present? ---'
SELECT schemaname, viewname FROM pg_views WHERE viewname = 'daily_nutrition_summary';

\echo '--- C.5.3 Core Nutrition-Tables: in nutrition oder public schema? ---'
SELECT schemaname, tablename
FROM pg_tables
WHERE tablename IN ('foods','foods_custom','foods_portions','meals','meal_items',
                    'nutrition_targets','nutrition_micro_flags','water_logs','weight_logs')
ORDER BY tablename, schemaname;

\echo '--- C.5.4 Double-Migration 071 vs 20250322030003 — R-13 ---'
-- Works if supabase_migrations schema exists (standard Supabase setup)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables
             WHERE table_schema = 'supabase_migrations' AND table_name = 'schema_migrations') THEN
    RAISE NOTICE 'supabase_migrations.schema_migrations exists — query it manually:';
    RAISE NOTICE '  SELECT * FROM supabase_migrations.schema_migrations';
    RAISE NOTICE '  WHERE name ILIKE ''%%nutrition_schema_split%%'' ORDER BY version;';
  ELSE
    RAISE NOTICE 'No supabase_migrations schema found — check files manually';
  END IF;
END$$;


\echo ''
\echo '=== C.6 UNIT-SANITY-CHECK — R-01 ==='
\echo '--- C.6.1 Foods with suspicious mineral values (indicates wrong unit) ---'

SELECT bls_code, name_de,
       copper_mg, manganese_mg, vitamin_b6_mg,
       CASE
         WHEN copper_mg > 50 OR manganese_mg > 50 OR vitamin_b6_mg > 50
         THEN 'suspicious_maybe_ug'
         ELSE 'ok_mg_scale'
       END AS unit_hint
FROM nutrition.foods
WHERE copper_mg > 10   -- foods with Cu > 10 mg/100g — physikalisch fast unmöglich
   OR manganese_mg > 10
   OR vitamin_b6_mg > 10
ORDER BY GREATEST(COALESCE(copper_mg,0), COALESCE(manganese_mg,0), COALESCE(vitamin_b6_mg,0)) DESC
LIMIT 20;

\echo '--- C.6.2 Distribution check: median values ---'
SELECT
  'copper_mg'    AS col, percentile_cont(0.5) WITHIN GROUP (ORDER BY copper_mg)    AS p50,
  percentile_cont(0.95) WITHIN GROUP (ORDER BY copper_mg)    AS p95,
  MAX(copper_mg) AS max
FROM nutrition.foods WHERE copper_mg IS NOT NULL
UNION ALL
SELECT 'manganese_mg',
  percentile_cont(0.5) WITHIN GROUP (ORDER BY manganese_mg),
  percentile_cont(0.95) WITHIN GROUP (ORDER BY manganese_mg),
  MAX(manganese_mg)
FROM nutrition.foods WHERE manganese_mg IS NOT NULL
UNION ALL
SELECT 'vitamin_b6_mg',
  percentile_cont(0.5) WITHIN GROUP (ORDER BY vitamin_b6_mg),
  percentile_cont(0.95) WITHIN GROUP (ORDER BY vitamin_b6_mg),
  MAX(vitamin_b6_mg)
FROM nutrition.foods WHERE vitamin_b6_mg IS NOT NULL;

-- Interpretation:
--   p50 Cu ≈ 0.1 mg → Unit ist mg → ×1000 für µg-Migration OK
--   p50 Cu ≈ 100   → Unit ist schon µg → KEIN ×1000, direkt kopieren!


\echo ''
\echo '=== C.7 FOOD SNAPSHOTS vs LIVE CALCULATION (Sanity) ==='

\echo '--- C.7.1 Drift zwischen meal_items.kcal Snapshot und food.kcal * amount/100 ---'
WITH drift AS (
  SELECT
    mi.id,
    mi.food_name,
    mi.amount_g,
    mi.kcal AS snap_kcal,
    ROUND(f.kcal * mi.amount_g / 100.0, 2) AS recalc_kcal,
    ROUND(mi.kcal - f.kcal * mi.amount_g / 100.0, 2) AS diff_kcal
  FROM nutrition.meal_items mi
  JOIN nutrition.foods f ON f.id = mi.food_id
  WHERE mi.food_source = 'bls'
    AND f.kcal IS NOT NULL
)
SELECT
  COUNT(*) AS total_items,
  SUM(CASE WHEN ABS(diff_kcal) <= 1 THEN 1 ELSE 0 END) AS within_1kcal,
  SUM(CASE WHEN ABS(diff_kcal) > 1 AND ABS(diff_kcal) <= 5 THEN 1 ELSE 0 END) AS drift_1_to_5,
  SUM(CASE WHEN ABS(diff_kcal) > 5 AND ABS(diff_kcal) <= 50 THEN 1 ELSE 0 END) AS drift_5_to_50,
  SUM(CASE WHEN ABS(diff_kcal) > 50 THEN 1 ELSE 0 END) AS drift_over_50
FROM drift;

\echo '--- C.7.2 Worst offenders — höchste Drift ---'
WITH drift AS (
  SELECT
    mi.id,
    mi.food_name,
    mi.amount_g,
    mi.kcal AS snap_kcal,
    ROUND(f.kcal * mi.amount_g / 100.0, 2) AS recalc_kcal,
    ROUND(mi.kcal - f.kcal * mi.amount_g / 100.0, 2) AS diff_kcal
  FROM nutrition.meal_items mi
  JOIN nutrition.foods f ON f.id = mi.food_id
  WHERE mi.food_source = 'bls' AND f.kcal IS NOT NULL
)
SELECT * FROM drift
WHERE ABS(diff_kcal) > 10
ORDER BY ABS(diff_kcal) DESC
LIMIT 20;


\echo ''
\echo '=== EXTRA: UNMAPPED food.allergens VALUES ==='
\echo '--- Allergene in Legacy-Foods, die im Neu-Tag-Vokabular nicht existieren ---'

SELECT DISTINCT a AS allergen_value_in_legacy
FROM nutrition.foods, unnest(allergens) AS a
WHERE a NOT IN ('gluten','dairy','eggs','nuts','peanuts','soy','fish','shellfish')
ORDER BY a;


\echo ''
\echo '=== EXTRA: MISSING NUTRIENT CODES IN nutrients_full JSONB ==='
\echo '--- Welche BLS-Codes kommen in foods.nutrients_full vor ---'

SELECT DISTINCT kv.key AS bls_code, COUNT(*) AS n_foods
FROM nutrition.foods, jsonb_each_text(nutrients_full) AS kv
WHERE jsonb_typeof(nutrients_full) = 'object'
GROUP BY kv.key
ORDER BY n_foods DESC;


\echo ''
\echo '=== EXTRA: meal_items food_source distribution ==='
SELECT food_source, COUNT(*) AS n,
       SUM(CASE WHEN food_id IS NULL THEN 1 ELSE 0 END) AS null_food_id
FROM nutrition.meal_items
GROUP BY food_source
ORDER BY n DESC;


\echo ''
\echo '=== AUDIT COMPLETE ==='
\echo 'Review each block above. Decisions needed before Phase 0 start:'
\echo '  C.1.3 — Ghost-Items: → R-21 mitigation choice'
\echo '  C.2   — MealPlanItems with invalid ref count: fix manually'
\echo '  C.3   — food_ratings schema: choose migration strategy'
\echo '  C.4   — Dev-UUID rows: migrate as dev-data or drop'
\echo '  C.6   — Unit check: confirm mg vs ug to avoid x1000 error'
\echo '  C.7   — Snapshot drift: accept historic values as-is'
