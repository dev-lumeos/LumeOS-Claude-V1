BEGIN;

CREATE INDEX product_contents_ingredient_name_lower_idx
  ON supplements.product_contents (lower(btrim(ingredient_name)));

CREATE OR REPLACE FUNCTION public.supplier_product_allergy_matches(p_user_id uuid)
RETURNS TABLE (
  allergy_id uuid,
  product_id uuid,
  ingredient_name text,
  stoff_code text,
  stoff_text text
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = pg_catalog, public, supplements
AS $$
  SELECT
    ua.id AS allergy_id,
    c.product_id,
    c.ingredient_name,
    ua.stoff_code,
    ua.stoff_text
  FROM public.user_allergies ua
  JOIN public.allergen_aliases aa ON aa.stoff_code = ua.stoff_code
  JOIN supplements.product_contents c
    ON lower(btrim(c.ingredient_name)) = lower(btrim(aa.alias_text))
  WHERE ua.user_id = p_user_id

  UNION ALL

  SELECT
    ua.id AS allergy_id,
    c.product_id,
    c.ingredient_name,
    ua.stoff_code,
    ua.stoff_text
  FROM public.user_allergies ua
  JOIN supplements.product_contents c
    ON ua.stoff_code IS NULL
   AND lower(btrim(c.ingredient_name)) = lower(btrim(ua.stoff_text))
  WHERE ua.user_id = p_user_id;
$$;

COMMENT ON FUNCTION public.supplier_product_allergy_matches(uuid) IS
  'C-498: liefert fuer die eigenen bzw. explizit freigegebenen Allergien alle DSLD-Inhaltszeilen, die ueber den Stoffcode und dessen Aliasliste treffen.';

REVOKE ALL ON FUNCTION public.supplier_product_allergy_matches(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.supplier_product_allergy_matches(uuid) TO authenticated;

COMMIT;
