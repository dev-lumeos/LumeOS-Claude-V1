BEGIN;

CREATE FUNCTION public.user_allergy_treffer(p_user_id uuid)
RETURNS TABLE (
  allergy_id uuid,
  stoff_code text,
  treffer_lebensmittel bigint,
  treffer_produkte bigint,
  treffer_medikamente bigint
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = pg_catalog, public, nutrition, supplements, medical
AS $$
  WITH own_allergies AS MATERIALIZED (
    SELECT ua.id, ua.stoff_code
    FROM public.user_allergies ua
    WHERE ua.user_id = p_user_id
      AND ua.stoff_code IS NOT NULL
  ), food_counts AS (
    SELECT oa.id AS allergy_id, count(DISTINCT ft.food_id)::bigint AS hit_count
    FROM own_allergies oa
    JOIN nutrition.food_tags ft
      ON oa.stoff_code LIKE 'nutrition:%'
     AND ft.tag_code = substr(oa.stoff_code, length('nutrition:') + 1)
    GROUP BY oa.id
  ), product_counts AS (
    SELECT oa.id AS allergy_id, count(DISTINCT pc.product_id)::bigint AS hit_count
    FROM own_allergies oa
    JOIN public.allergen_aliases aa ON aa.stoff_code = oa.stoff_code
    JOIN supplements.product_contents pc
      ON nutrition.search_fold(pc.ingredient_name) = nutrition.search_fold(aa.alias_text)
    GROUP BY oa.id
  ), medication_counts AS (
    SELECT oa.id AS allergy_id, count(DISTINCT mf.id)::bigint AS hit_count
    FROM own_allergies oa
    JOIN medical.medication_formulations mf
      ON oa.stoff_code LIKE 'medical:%'
     AND mf.active_substance_id::text = substr(oa.stoff_code, length('medical:') + 1)
    GROUP BY oa.id
  )
  SELECT oa.id, oa.stoff_code,
         coalesce(fc.hit_count, 0::bigint),
         coalesce(pc.hit_count, 0::bigint),
         coalesce(mc.hit_count, 0::bigint)
  FROM own_allergies oa
  LEFT JOIN food_counts fc ON fc.allergy_id = oa.id
  LEFT JOIN product_counts pc ON pc.allergy_id = oa.id
  LEFT JOIN medication_counts mc ON mc.allergy_id = oa.id
  ORDER BY oa.stoff_code;
$$;

REVOKE ALL ON FUNCTION public.user_allergy_treffer(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.user_allergy_treffer(uuid) TO authenticated;

COMMENT ON FUNCTION public.user_allergy_treffer(uuid) IS
  'C-508: zaehlt in einer RLS-gebundenen Abfrage alle kataloggebundenen Lebensmittel-, Lieferprodukt- und Medikamententreffer der angeforderten eigenen Allergien.';

COMMIT;
