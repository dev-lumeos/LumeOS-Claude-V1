BEGIN;

CREATE OR REPLACE FUNCTION supplements.search_supplier_products(
  p_query text,
  p_market_status text DEFAULT 'On Market',
  p_marke text DEFAULT NULL,
  p_limit integer DEFAULT 50,
  p_kategorie text DEFAULT NULL,
  p_form text DEFAULT NULL,
  p_allergien_ausblenden boolean DEFAULT true,
  p_meidestoffe text[] DEFAULT NULL,
  p_marken text[] DEFAULT NULL,
  p_nur_bewertet boolean DEFAULT false
)
RETURNS TABLE (
  id uuid,
  marke text,
  name_en text,
  portionsgroesse numeric,
  portionseinheit text,
  packungsgroesse numeric,
  packungseinheit text,
  market_status text,
  gtin text,
  similarity real,
  meidestoff_treffer text[]
)
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = pg_catalog, public, supplements, nutrition
AS $$
DECLARE
  v_kategorie text := nullif(btrim(p_kategorie), '');
  v_form text := nullif(btrim(p_form), '');
  v_marken text[] := ARRAY(
    SELECT DISTINCT btrim(brand_input.value)
    FROM unnest(coalesce(p_marken, '{}'::text[])) AS brand_input(value)
    WHERE nullif(btrim(brand_input.value), '') IS NOT NULL
    ORDER BY btrim(brand_input.value)
  );
BEGIN
  IF nullif(btrim(p_query), '') IS NULL THEN
    RETURN;
  END IF;

  PERFORM set_config('pg_trgm.word_similarity_threshold', '0.30', true);

  RETURN QUERY
  WITH allergy_products AS MATERIALIZED (
    SELECT DISTINCT m.product_id
    FROM public.supplier_product_allergy_matches(auth.uid()) m
    WHERE coalesce(p_allergien_ausblenden, true)
  ), avoid_codes AS MATERIALIZED (
    SELECT DISTINCT
      btrim(code) AS code,
      regexp_replace(nutrition.search_fold(btrim(code)), '^(contains|is|has) ', '') AS term
    FROM unnest(coalesce(p_meidestoffe, '{}'::text[])) AS code
    WHERE nullif(btrim(code), '') IS NOT NULL
  )
  SELECT
    p.id,
    p.marke,
    p.name_en,
    p.portionsgroesse,
    p.portionseinheit,
    p.packungsgroesse,
    p.packungseinheit,
    p.market_status,
    p.gtin,
    greatest(
      word_similarity(p_query, p.name_en),
      word_similarity(p_query, coalesce(p.marke, ''))
    )::real AS similarity,
    coalesce(avoid_matches.codes, '{}'::text[]) AS meidestoff_treffer
  FROM supplements.supplier_products p
  LEFT JOIN LATERAL (
    SELECT fpi.preference
    FROM nutrition.food_preference_items fpi
    WHERE fpi.user_id = auth.uid()
      AND fpi.target_type = 'supplement_product'
      AND fpi.supplement_product_id = p.id
    LIMIT 1
  ) preference ON true
  LEFT JOIN LATERAL (
    SELECT array_agg(ac.code ORDER BY ac.code) AS codes
    FROM avoid_codes ac
    WHERE EXISTS (
      SELECT 1
      FROM supplements.product_contents pc
      WHERE pc.product_id = p.id
        AND position(ac.term IN nutrition.search_fold(pc.ingredient_name)) > 0
    )
  ) avoid_matches ON true
  WHERE p.is_active
    AND (p_market_status IS NULL OR p.market_status = p_market_status)
    AND (p_marke IS NULL OR p.marke = p_marke)
    AND (cardinality(v_marken) = 0 OR p.marke = ANY(v_marken))
    AND (v_form IS NULL OR p.produktform = v_form)
    AND (p_query <% p.name_en OR p_query <% p.marke)
    AND (v_kategorie IS NULL OR EXISTS (
      SELECT 1
      FROM supplements.product_contents c
      WHERE c.product_id = p.id
        AND c.ingredient_category = v_kategorie
    ))
    AND (NOT coalesce(p_allergien_ausblenden, true) OR NOT EXISTS (
      SELECT 1
      FROM allergy_products ap
      WHERE ap.product_id = p.id
    ))
    AND (NOT coalesce(p_nur_bewertet, false) OR preference.preference IS NOT NULL)
  ORDER BY
    CASE preference.preference WHEN 'liked' THEN 0 WHEN 'disliked' THEN 2 ELSE 1 END,
    CASE WHEN p_query <% p.name_en THEN 0 ELSE 1 END,
    similarity DESC,
    p.name_en ASC
  LIMIT least(greatest(coalesce(p_limit, 50), 1), 500);
END;
$$;

CREATE FUNCTION supplements.supplier_product_search_meta(
  p_query text,
  p_market_status text DEFAULT 'On Market',
  p_marke text DEFAULT NULL,
  p_kategorie text DEFAULT NULL,
  p_form text DEFAULT NULL,
  p_allergien_ausblenden boolean DEFAULT true,
  p_meidestoffe text[] DEFAULT NULL,
  p_marken text[] DEFAULT NULL,
  p_nur_bewertet boolean DEFAULT false
)
RETURNS TABLE (total_count bigint, category_counts jsonb)
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = pg_catalog, public, supplements, nutrition
AS $$
DECLARE
  v_kategorie text := nullif(btrim(p_kategorie), '');
  v_form text := nullif(btrim(p_form), '');
  v_marken text[] := ARRAY(
    SELECT DISTINCT btrim(brand_input.value)
    FROM unnest(coalesce(p_marken, '{}'::text[])) AS brand_input(value)
    WHERE nullif(btrim(brand_input.value), '') IS NOT NULL
    ORDER BY btrim(brand_input.value)
  );
BEGIN
  IF nullif(btrim(p_query), '') IS NULL THEN
    RETURN QUERY SELECT 0::bigint, '{}'::jsonb;
    RETURN;
  END IF;

  PERFORM set_config('pg_trgm.word_similarity_threshold', '0.30', true);

  RETURN QUERY
  WITH allergy_products AS MATERIALIZED (
    SELECT DISTINCT m.product_id
    FROM public.supplier_product_allergy_matches(auth.uid()) m
    WHERE coalesce(p_allergien_ausblenden, true)
  ), eligible AS MATERIALIZED (
    SELECT p.id
    FROM supplements.supplier_products p
    WHERE p.is_active
      AND (p_market_status IS NULL OR p.market_status = p_market_status)
      AND (p_marke IS NULL OR p.marke = p_marke)
      AND (cardinality(v_marken) = 0 OR p.marke = ANY(v_marken))
      AND (v_form IS NULL OR p.produktform = v_form)
      AND (p_query <% p.name_en OR p_query <% p.marke)
      AND (v_kategorie IS NULL OR EXISTS (
        SELECT 1
        FROM supplements.product_contents c
        WHERE c.product_id = p.id
          AND c.ingredient_category = v_kategorie
      ))
      AND (NOT coalesce(p_allergien_ausblenden, true) OR NOT EXISTS (
        SELECT 1 FROM allergy_products ap WHERE ap.product_id = p.id
      ))
      AND (NOT coalesce(p_nur_bewertet, false) OR EXISTS (
        SELECT 1
        FROM nutrition.food_preference_items fpi
        WHERE fpi.user_id = auth.uid()
          AND fpi.target_type = 'supplement_product'
          AND fpi.supplement_product_id = p.id
      ))
  ), category_totals AS (
    SELECT pc.ingredient_category, count(DISTINCT e.id)::bigint AS product_count
    FROM eligible e
    JOIN supplements.product_contents pc ON pc.product_id = e.id
    WHERE pc.ingredient_category IS NOT NULL
    GROUP BY pc.ingredient_category
  )
  SELECT
    (SELECT count(*)::bigint FROM eligible),
    coalesce(
      (SELECT jsonb_object_agg(ct.ingredient_category, ct.product_count) FROM category_totals ct),
      '{}'::jsonb
    );
END;
$$;

REVOKE ALL ON FUNCTION supplements.search_supplier_products(text, text, text, integer, text, text, boolean, text[], text[], boolean) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION supplements.supplier_product_search_meta(text, text, text, text, text, boolean, text[], text[], boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION supplements.search_supplier_products(text, text, text, integer, text, text, boolean, text[], text[], boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION supplements.supplier_product_search_meta(text, text, text, text, text, boolean, text[], text[], boolean) TO authenticated;

COMMENT ON FUNCTION supplements.search_supplier_products(text, text, text, integer, text, text, boolean, text[], text[], boolean) IS
  'G-463: aktive Produktsuche mit einem sichtbaren Fenster bis 500. Die Gesamt- und Kategorienzahlen liefert supplier_product_search_meta mit denselben Datenbankfiltern.';
COMMENT ON FUNCTION supplements.supplier_product_search_meta(text, text, text, text, text, boolean, text[], text[], boolean) IS
  'G-463: Gesamtzahl und mit den aktiven DB-Filtern mitwandernde Kategorienzahlen fuer die Lieferantenproduktsuche; Meidestoffe bleiben Markierung und beeinflussen die Menge nicht.';

COMMIT;
