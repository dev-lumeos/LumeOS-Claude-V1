BEGIN;

CREATE OR REPLACE FUNCTION public.user_allergy_catalog_matches(p_user_id uuid)
RETURNS TABLE (
  allergy_id uuid,
  stoff_code text,
  catalog_kind text,
  catalog_item_id uuid,
  product_id uuid,
  matched_name text
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = pg_catalog, public, nutrition, supplements
AS $$
  WITH own_allergies AS MATERIALIZED (
    SELECT ua.id, ua.stoff_code
    FROM public.user_allergies ua
    WHERE ua.user_id = p_user_id
      AND ua.stoff_code IS NOT NULL
  )
  SELECT oa.id, oa.stoff_code, 'food'::text, f.id, NULL::uuid, f.name_de
  FROM own_allergies oa
  JOIN nutrition.food_tags ft
    ON ft.tag_code = substr(oa.stoff_code, length('nutrition:') + 1)
  JOIN nutrition.foods f ON f.id = ft.food_id
  WHERE oa.stoff_code LIKE 'nutrition:%'

  UNION ALL

  SELECT oa.id, oa.stoff_code, 'supplier_product'::text, NULL::uuid,
         pc.product_id, pc.ingredient_name
  FROM own_allergies oa
  JOIN public.allergen_aliases aa ON aa.stoff_code = oa.stoff_code
  JOIN supplements.product_contents pc
    ON nutrition.search_fold(pc.ingredient_name) = nutrition.search_fold(aa.alias_text);
$$;

REVOKE ALL ON FUNCTION public.user_allergy_catalog_matches(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.user_allergy_catalog_matches(uuid) TO authenticated;

COMMENT ON FUNCTION public.user_allergy_catalog_matches(uuid) IS
  'C-502: kataloggebundene Nahrungallergien treffen Food-Tags und nur explizit belegte, exakt normalisierte DSLD-Inhaltsnamen; Freitext bleibt ohne Produktabgleich.';

COMMIT;
