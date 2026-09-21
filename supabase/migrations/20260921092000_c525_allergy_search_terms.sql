BEGIN;

CREATE TABLE public.allergy_search_terms (
  tag_code text NOT NULL REFERENCES nutrition.tag_definitions(code) ON DELETE RESTRICT,
  search_term text NOT NULL CHECK (btrim(search_term) <> ''),
  source_id text NOT NULL CHECK (btrim(source_id) <> ''),
  evidence_class text NOT NULL CHECK (evidence_class IN ('A', 'B', 'C')),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (tag_code, search_term)
);

CREATE INDEX allergy_search_terms_fold_trgm_idx
  ON public.allergy_search_terms
  USING gin (nutrition.search_fold(search_term) gin_trgm_ops);

CREATE OR REPLACE FUNCTION public.validate_allergy_search_term_tag()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM nutrition.tag_definitions td
    WHERE td.code = NEW.tag_code
      AND td.tag_type = 'allergen'
      AND td.is_exclusion_relevant
  ) THEN
    RAISE EXCEPTION 'allergy_search_terms.tag_code muss ein ausschlussrelevanter Allergentag sein';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER allergy_search_terms_tag_guard
  BEFORE INSERT OR UPDATE OF tag_code ON public.allergy_search_terms
  FOR EACH ROW EXECUTE FUNCTION public.validate_allergy_search_term_tag();

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
SET search_path = pg_catalog, public, nutrition, supplements, medical
AS $$
  WITH input AS (
    SELECT nutrition.search_fold(p_query) AS query,
           greatest(1, least(coalesce(p_limit, 20), 100)) AS result_limit,
           nutrition.search_fold(p_query) !~ '(^| )(glutenfrei|gluten frei)( |$)' AS nutrition_query_allowed
  ), nutrition_terms AS (
    SELECT 'nutrition:' || td.code AS catalog_code, td.name_de AS display_name,
           nutrition.search_fold(v.term) AS term, tag_count.count AS occurrence_count
    FROM nutrition.tag_definitions td
    JOIN LATERAL (
      SELECT count(*)::bigint AS count FROM nutrition.food_tags ft WHERE ft.tag_code = td.code
    ) tag_count ON true
    CROSS JOIN LATERAL unnest(ARRAY[td.code, td.name_de, td.name_en, td.name_th]) v(term)
    WHERE td.is_exclusion_relevant
      AND td.tag_type = 'allergen'
      AND tag_count.count > 0

    UNION ALL

    SELECT 'nutrition:' || ast.tag_code, td.name_de, nutrition.search_fold(ast.search_term), tag_count.count
    FROM public.allergy_search_terms ast
    JOIN nutrition.tag_definitions td ON td.code = ast.tag_code
    JOIN LATERAL (
      SELECT count(*)::bigint AS count FROM nutrition.food_tags ft WHERE ft.tag_code = td.code
    ) tag_count ON true
    WHERE td.is_exclusion_relevant
      AND td.tag_type = 'allergen'
      AND tag_count.count > 0

    UNION ALL

    SELECT aa.stoff_code, td.name_de, nutrition.search_fold(aa.alias_text), tag_count.count
    FROM public.allergen_aliases aa
    JOIN nutrition.tag_definitions td ON aa.stoff_code = 'nutrition:' || td.code
    JOIN LATERAL (
      SELECT count(*)::bigint AS count FROM nutrition.food_tags ft WHERE ft.tag_code = td.code
    ) tag_count ON true
    WHERE td.is_exclusion_relevant
      AND td.tag_type = 'allergen'
      AND tag_count.count > 0
  ), nutrition_candidates AS (
    SELECT nt.catalog_code, max(nt.display_name) AS display_name,
           (array_agg(nt.term ORDER BY similarity(nt.term, i.query) DESC, nt.term))[1] AS matched_text,
           max(nt.occurrence_count)::bigint AS occurrence_count,
           max(similarity(nt.term, i.query))::real AS similarity_score
    FROM nutrition_terms nt
    CROSS JOIN input i
    WHERE i.query <> ''
      AND i.nutrition_query_allowed
      AND nt.term % i.query
    GROUP BY nt.catalog_code
  ), supplement_content AS (
    SELECT 'supplements:' || replace(nutrition.search_fold(pc.ingredient_name), ' ', '_') AS catalog_code,
           min(btrim(pc.ingredient_name)) AS display_name, count(*)::bigint AS occurrence_count,
           max(similarity(nutrition.search_fold(pc.ingredient_name), i.query))::real AS similarity_score
    FROM supplements.product_contents pc
    CROSS JOIN input i
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
  ), medication_terms AS (
    SELECT 'medical:' || mas.id AS catalog_code, mas.canonical_name AS display_name,
           nutrition.search_fold(term) AS term, formulation_count.count AS occurrence_count
    FROM medical.medication_active_substances mas
    CROSS JOIN LATERAL unnest(
      ARRAY[mas.canonical_name] || coalesce(mas.generic_names, '{}'::text[]) || coalesce(mas.synonyms, '{}'::text[])
    ) AS term
    CROSS JOIN LATERAL (
      SELECT count(*)::bigint AS count
      FROM medical.medication_formulations mf
      WHERE mf.active_substance_id = mas.id
    ) formulation_count
    WHERE nullif(btrim(term), '') IS NOT NULL
  ), medication_candidates AS (
    SELECT mt.catalog_code, max(mt.display_name) AS display_name,
           (array_agg(mt.term ORDER BY similarity(mt.term, i.query) DESC, mt.term))[1] AS matched_text,
           max(mt.occurrence_count)::bigint AS occurrence_count,
           max(similarity(mt.term, i.query))::real AS similarity_score
    FROM medication_terms mt
    CROSS JOIN input i
    WHERE i.query <> '' AND mt.term % i.query
    GROUP BY mt.catalog_code
  )
  SELECT catalog_code, display_name, matched_text, occurrence_count,
         'nutrition.tag_definitions'::text, true, NULL::text, similarity_score
  FROM nutrition_candidates WHERE p_art = 'nahrung'
  UNION ALL
  SELECT catalog_code, display_name, display_name, occurrence_count,
         'supplements.product_contents_or_warnings'::text, true, NULL::text, similarity_score
  FROM supplement_candidates WHERE p_art = 'supplement'
  UNION ALL
  SELECT catalog_code, display_name, matched_text, occurrence_count,
         'medical.medication_active_substances'::text, true, NULL::text, similarity_score
  FROM medication_candidates WHERE p_art = 'medikament'
  ORDER BY similarity_score DESC, occurrence_count DESC NULLS LAST, display_name
  LIMIT (SELECT result_limit FROM input);
$$;

ALTER TABLE public.allergy_search_terms ENABLE ROW LEVEL SECURITY;

CREATE POLICY allergy_search_terms_select ON public.allergy_search_terms
  FOR SELECT TO authenticated USING (true);

REVOKE ALL ON TABLE public.allergy_search_terms FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.validate_allergy_search_term_tag() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.allergy_catalog_suggestions(text, text, integer) FROM PUBLIC, anon;
GRANT SELECT ON TABLE public.allergy_search_terms TO authenticated;
GRANT EXECUTE ON FUNCTION public.allergy_catalog_suggestions(text, text, integer) TO authenticated;
GRANT ALL ON TABLE public.allergy_search_terms TO service_role;

COMMENT ON TABLE public.allergy_search_terms IS
  'C-525: kuratierte menschliche Suchbegriffe für Food-Allergentags. Von Produkt-Aliastexten getrennt; kein Produktmatch-Material.';
COMMENT ON FUNCTION public.allergy_catalog_suggestions(text, text, integer) IS
  'C-503/C-506/C-525: Vorschläge stammen aus dem Katalog der Allergieart; Food sucht nur allergene Tags und getrennte, kuratierte Suchbegriffe.';

COMMIT;
