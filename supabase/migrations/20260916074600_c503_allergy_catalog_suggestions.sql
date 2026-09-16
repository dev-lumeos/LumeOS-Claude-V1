BEGIN;

CREATE INDEX product_contents_ingredient_name_fold_trgm_idx
  ON supplements.product_contents
  USING gin (nutrition.search_fold(ingredient_name) gin_trgm_ops);

CREATE INDEX allergen_aliases_alias_fold_trgm_idx
  ON public.allergen_aliases
  USING gin (nutrition.search_fold(alias_text) gin_trgm_ops);

CREATE OR REPLACE FUNCTION public.allergy_catalog_code_is_valid(p_art text, p_stoff_code text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = pg_catalog, public, nutrition, supplements
AS $$
  SELECT CASE
    WHEN p_art = 'nahrung' AND p_stoff_code LIKE 'nutrition:%' THEN EXISTS (
      SELECT 1
      FROM nutrition.tag_definitions td
      WHERE td.code = substr(p_stoff_code, length('nutrition:') + 1)
        AND td.is_exclusion_relevant
        AND EXISTS (SELECT 1 FROM nutrition.food_tags ft WHERE ft.tag_code = td.code)
    )
    WHEN p_art = 'supplement' AND p_stoff_code LIKE 'supplements:%' THEN EXISTS (
      SELECT 1
      FROM supplements.product_contents pc
      WHERE replace(nutrition.search_fold(pc.ingredient_name), ' ', '_') = substr(p_stoff_code, length('supplements:') + 1)
    ) OR EXISTS (
      SELECT 1
      FROM supplements.supplement_warnings sw
      JOIN supplements.supplements s ON s.id = sw.supplement_id
      WHERE replace(nutrition.search_fold(s.name_en), ' ', '_') = substr(p_stoff_code, length('supplements:') + 1)
    )
    ELSE false
  END;
$$;

CREATE OR REPLACE FUNCTION public.validate_user_allergy_catalog_code()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = pg_catalog, public
AS $$
BEGIN
  IF NEW.stoff_code IS NOT NULL
     AND NOT public.allergy_catalog_code_is_valid(NEW.art, NEW.stoff_code) THEN
    RAISE EXCEPTION 'user_allergies.stoff_code muss auf einen vorhandenen Katalogeintrag der Art zeigen';
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.validate_allergen_alias_catalog_code()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_art text := split_part(NEW.stoff_code, ':', 1);
BEGIN
  IF v_art = 'nutrition' THEN v_art := 'nahrung'; END IF;
  IF v_art = 'supplements' THEN v_art := 'supplement'; END IF;
  IF NOT public.allergy_catalog_code_is_valid(v_art, NEW.stoff_code) THEN
    RAISE EXCEPTION 'allergen_aliases.stoff_code muss auf einen vorhandenen Katalogeintrag zeigen';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS user_allergies_catalog_code_guard ON public.user_allergies;
CREATE TRIGGER user_allergies_catalog_code_guard
  BEFORE INSERT OR UPDATE OF stoff_code, art ON public.user_allergies
  FOR EACH ROW EXECUTE FUNCTION public.validate_user_allergy_catalog_code();

DROP TRIGGER IF EXISTS allergen_aliases_catalog_code_guard ON public.allergen_aliases;
CREATE TRIGGER allergen_aliases_catalog_code_guard
  BEFORE INSERT OR UPDATE OF stoff_code ON public.allergen_aliases
  FOR EACH ROW EXECUTE FUNCTION public.validate_allergen_alias_catalog_code();

CREATE OR REPLACE FUNCTION public.allergy_catalog_suggestions(
  p_art text,
  p_query text,
  p_limit integer DEFAULT 20
)
RETURNS TABLE (
  catalog_code text,
  display_name text,
  matched_text text,
  occurrence_count bigint,
  catalog_source text,
  product_check_available boolean,
  notice text,
  similarity_score real
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = pg_catalog, public, nutrition, supplements
AS $$
  WITH input AS (
    SELECT nutrition.search_fold(p_query) AS query, greatest(1, least(coalesce(p_limit, 20), 100)) AS result_limit
  ), nutrition_terms AS (
    SELECT 'nutrition:' || td.code AS catalog_code, td.name_de AS display_name,
           nutrition.search_fold(v.term) AS term, tag_count.count AS occurrence_count
    FROM nutrition.tag_definitions td
    JOIN LATERAL (SELECT count(*)::bigint AS count FROM nutrition.food_tags ft WHERE ft.tag_code = td.code) tag_count ON true
    CROSS JOIN LATERAL unnest(ARRAY[td.code, td.name_de, td.name_en, td.name_th]) v(term)
    WHERE td.is_exclusion_relevant AND tag_count.count > 0
    UNION ALL
    SELECT aa.stoff_code, td.name_de, nutrition.search_fold(aa.alias_text), tag_count.count
    FROM public.allergen_aliases aa
    JOIN nutrition.tag_definitions td ON aa.stoff_code = 'nutrition:' || td.code
    JOIN LATERAL (SELECT count(*)::bigint AS count FROM nutrition.food_tags ft WHERE ft.tag_code = td.code) tag_count ON true
    WHERE td.is_exclusion_relevant AND tag_count.count > 0
  ), nutrition_candidates AS (
    SELECT nt.catalog_code, max(nt.display_name) AS display_name,
           (array_agg(nt.term ORDER BY similarity(nt.term, i.query) DESC, nt.term))[1] AS matched_text,
           max(nt.occurrence_count) AS occurrence_count,
           max(similarity(nt.term, i.query))::real AS similarity_score
    FROM nutrition_terms nt CROSS JOIN input i
    WHERE i.query <> '' AND nt.term % i.query
    GROUP BY nt.catalog_code
  ), supplement_content AS (
    SELECT 'supplements:' || replace(nutrition.search_fold(pc.ingredient_name), ' ', '_') AS catalog_code,
           min(btrim(pc.ingredient_name)) AS display_name,
           count(*)::bigint AS occurrence_count,
           max(similarity(nutrition.search_fold(pc.ingredient_name), i.query))::real AS similarity_score
    FROM supplements.product_contents pc CROSS JOIN input i
    WHERE i.query <> '' AND nutrition.search_fold(pc.ingredient_name) % i.query
    GROUP BY replace(nutrition.search_fold(pc.ingredient_name), ' ', '_')
  ), supplement_warning AS (
    SELECT 'supplements:' || replace(nutrition.search_fold(s.name_en), ' ', '_') AS catalog_code,
           s.name_en AS display_name, count(*)::bigint AS occurrence_count,
           max(similarity(nutrition.search_fold(s.name_en), i.query))::real AS similarity_score
    FROM supplements.supplement_warnings sw
    JOIN supplements.supplements s ON s.id = sw.supplement_id
    CROSS JOIN input i
    WHERE i.query <> '' AND nutrition.search_fold(s.name_en) % i.query
    GROUP BY s.name_en
  ), supplement_candidates AS (
    SELECT catalog_code, min(display_name) AS display_name, sum(occurrence_count)::bigint AS occurrence_count,
           max(similarity_score)::real AS similarity_score
    FROM (SELECT * FROM supplement_content UNION ALL SELECT * FROM supplement_warning) x
    GROUP BY catalog_code
  )
  SELECT catalog_code, display_name, matched_text, occurrence_count, 'nutrition.tag_definitions'::text,
         true, NULL::text, similarity_score
  FROM nutrition_candidates
  WHERE p_art = 'nahrung'
  UNION ALL
  SELECT catalog_code, display_name, display_name, occurrence_count, 'supplements.product_contents_or_warnings'::text,
         true, NULL::text, similarity_score
  FROM supplement_candidates
  WHERE p_art = 'supplement'
  UNION ALL
  SELECT NULL::text, NULL::text, NULL::text, 0::bigint, 'medical'::text,
         false, 'Kein Medikamentenkatalog mit Allergie-Verknuepfung vorhanden; Freitext wird nicht gegen Medikamente geprueft.', 0::real
  WHERE p_art = 'medikament'
  ORDER BY similarity_score DESC, occurrence_count DESC NULLS LAST, display_name
  LIMIT (SELECT result_limit FROM input);
$$;

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
  SELECT ua.id, ua.stoff_code, 'food'::text, f.id, NULL::uuid, f.name_de
  FROM public.user_allergies ua
  JOIN nutrition.food_tags ft ON ft.tag_code = substr(ua.stoff_code, length('nutrition:') + 1)
  JOIN nutrition.foods f ON f.id = ft.food_id
  WHERE ua.user_id = p_user_id AND ua.stoff_code LIKE 'nutrition:%'
  UNION ALL
  SELECT ua.id, ua.stoff_code, 'supplier_product'::text, NULL::uuid, pc.product_id, pc.ingredient_name
  FROM public.user_allergies ua
  JOIN public.allergen_aliases aa ON aa.stoff_code = ua.stoff_code
  JOIN supplements.product_contents pc ON nutrition.search_fold(pc.ingredient_name) = nutrition.search_fold(aa.alias_text)
  WHERE ua.user_id = p_user_id AND ua.stoff_code LIKE 'supplements:%';
$$;

CREATE OR REPLACE FUNCTION public.supplier_product_allergy_matches(p_user_id uuid)
RETURNS TABLE (allergy_id uuid, product_id uuid, ingredient_name text, stoff_code text, stoff_text text)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = pg_catalog, public
AS $$
  SELECT m.allergy_id, m.product_id, m.matched_name, m.stoff_code, ua.stoff_text
  FROM public.user_allergy_catalog_matches(p_user_id) m
  JOIN public.user_allergies ua ON ua.id = m.allergy_id
  WHERE m.catalog_kind = 'supplier_product';
$$;

CREATE OR REPLACE FUNCTION public.user_allergy_codes(p_user_id uuid)
RETURNS text[]
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = pg_catalog, public
AS $$
  SELECT COALESCE(array_agg(
    CASE ua.stoff_code
      WHEN 'nutrition:contains_lactose' THEN 'lactose'
      WHEN 'nutrition:contains_nuts' THEN 'nuts'
      WHEN 'nutrition:contains_gluten' THEN 'gluten'
      WHEN 'nutrition:contains_soy' THEN 'soja'
      ELSE ua.stoff_code
    END ORDER BY ua.stoff_code
  ), '{}'::text[])
  FROM public.user_allergies ua
  WHERE ua.user_id = p_user_id AND ua.art = 'nahrung' AND ua.stoff_code IS NOT NULL;
$$;

REVOKE ALL ON FUNCTION public.allergy_catalog_code_is_valid(text, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.allergy_catalog_suggestions(text, text, integer) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.user_allergy_catalog_matches(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.validate_user_allergy_catalog_code() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.validate_allergen_alias_catalog_code() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.supplier_product_allergy_matches(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.user_allergy_codes(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.allergy_catalog_code_is_valid(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.allergy_catalog_suggestions(text, text, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_allergy_catalog_matches(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.supplier_product_allergy_matches(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_allergy_codes(uuid) TO authenticated;

COMMENT ON FUNCTION public.allergy_catalog_suggestions(text, text, integer) IS
  'C-503: Vorschlaege kommen ausschliesslich aus dem zur Allergieart passenden Katalog; medication liefert eine sichtbare Katalogluecke.';
COMMENT ON FUNCTION public.user_allergy_catalog_matches(uuid) IS
  'C-503: kataloggebundene Food- und DSLD-Produkt-Treffer. Stofftext ohne stoff_code liefert bewusst keine Treffer.';

COMMIT;
