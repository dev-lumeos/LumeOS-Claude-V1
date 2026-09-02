-- C-366 / E-55: Eine menschliche Entscheidung hat stets Vorrang vor dem Import.
CREATE OR REPLACE VIEW nutrition.food_tags_effective
WITH (security_invoker = true)
AS
  SELECT
    ft.food_id,
    ft.tag_code,
    ft.confidence,
    'import'::text AS source
  FROM nutrition.food_tags ft
  WHERE NOT EXISTS (
    SELECT 1
    FROM nutrition.food_tags_kuriert k
    WHERE k.food_id = ft.food_id
      AND k.tag_code = ft.tag_code
  )

  UNION ALL

  SELECT
    k.food_id,
    k.tag_code,
    NULL::numeric AS confidence,
    'curated'::text AS source
  FROM nutrition.food_tags_kuriert k
  WHERE k.action = 'set';
