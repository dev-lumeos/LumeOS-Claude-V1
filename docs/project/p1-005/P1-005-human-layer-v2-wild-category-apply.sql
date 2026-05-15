-- P1-005 local-only Human Layer category apply
-- Scope: deterministic BLS prefix V2xxxx -> SPEC_05 game_meat / Wild
-- Environment: local Supabase/Test DB only
-- Forbidden: DEV/LIVE, Supabase Cloud, production DB, other category rules,
-- aliases, display names, tags, food values, nutrient values, RDA changes.

WITH target AS (
  SELECT id
  FROM nutrition.food_categories
  WHERE slug = 'wild'
    AND level = 2
),
updated AS (
  UPDATE nutrition.foods AS f
  SET category_id = (SELECT id FROM target)
  WHERE f.category_id IS NULL
    AND f.bls_code LIKE 'V2%'
  RETURNING f.bls_code, f.name_de
)
SELECT COUNT(*) AS affected_rows
FROM updated;
