BEGIN;

-- C-503 loest die Aliaszeile exakt auf. Der B-Tree macht diesen Gleichheits-
-- Join produktbezogen, statt die 3 Mio. Inhaltszeilen erneut zu durchsuchen.
CREATE INDEX product_contents_ingredient_name_fold_product_idx
  ON supplements.product_contents (nutrition.search_fold(ingredient_name), product_id);

-- G-454 hat die urspruengliche Vier-Parameter-Signatur bereits ersetzt.
-- Die sechs bestehenden Argumente bleiben in gleicher Reihenfolge; die vier
-- neuen Filter erhalten Defaults, damit die bisherigen RPC-Aufrufe weitergehen.
DROP FUNCTION supplements.search_supplier_products(text, text, text, integer, text, text);

CREATE FUNCTION supplements.search_supplier_products(
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
  LIMIT least(greatest(coalesce(p_limit, 50), 1), 100);
END;
$$;

CREATE FUNCTION supplements.supplier_product_filter_preferences_read()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = pg_catalog, public
AS $$
  SELECT coalesce(
    (
      SELECT udp.value
      FROM public.user_display_preferences udp
      WHERE udp.user_id = auth.uid()
        AND udp.preference_key = 'supplements.products_filters'
    ),
    jsonb_build_object(
      'marktstatus', 'On Market',
      'kategorie', NULL,
      'form', NULL,
      'marken', jsonb_build_array(),
      'allergien_ausblenden', true
    )
  );
$$;

CREATE FUNCTION supplements.supplier_product_filter_preferences_write(
  p_marktstatus text DEFAULT 'On Market',
  p_kategorie text DEFAULT NULL,
  p_form text DEFAULT NULL,
  p_marken text[] DEFAULT '{}'::text[],
  p_allergien_ausblenden boolean DEFAULT true
)
RETURNS jsonb
LANGUAGE plpgsql
VOLATILE
SECURITY INVOKER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_marktstatus text := nullif(btrim(p_marktstatus), '');
  v_marken text[] := ARRAY(
    SELECT DISTINCT btrim(brand_input.value)
    FROM unnest(coalesce(p_marken, '{}'::text[])) AS brand_input(value)
    WHERE nullif(btrim(brand_input.value), '') IS NOT NULL
    ORDER BY btrim(brand_input.value)
  );
  v_value jsonb;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'supplier_product_filter_preferences_write braucht einen angemeldeten Nutzer';
  END IF;

  IF v_marktstatus IS NOT NULL AND v_marktstatus NOT IN ('On Market', 'Off Market') THEN
    RAISE EXCEPTION 'marktstatus muss On Market, Off Market oder leer sein';
  END IF;

  v_value := jsonb_build_object(
    'marktstatus', v_marktstatus,
    'kategorie', nullif(btrim(p_kategorie), ''),
    'form', nullif(btrim(p_form), ''),
    'marken', to_jsonb(v_marken),
    'allergien_ausblenden', coalesce(p_allergien_ausblenden, true)
  );

  INSERT INTO public.user_display_preferences (user_id, preference_key, value)
  VALUES (v_user_id, 'supplements.products_filters', v_value)
  ON CONFLICT (user_id, preference_key) DO UPDATE
    SET value = EXCLUDED.value,
        updated_at = now();

  RETURN v_value;
END;
$$;

REVOKE ALL ON FUNCTION supplements.search_supplier_products(text, text, text, integer, text, text, boolean, text[], text[], boolean) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION supplements.supplier_product_filter_preferences_read() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION supplements.supplier_product_filter_preferences_write(text, text, text, text[], boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION supplements.search_supplier_products(text, text, text, integer, text, text, boolean, text[], text[], boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION supplements.supplier_product_filter_preferences_read() TO authenticated;
GRANT EXECUTE ON FUNCTION supplements.supplier_product_filter_preferences_write(text, text, text, text[], boolean) TO authenticated;

COMMENT ON INDEX supplements.product_contents_ingredient_name_fold_product_idx IS
  'C-504: exakte, produktbezogene Aliasaufloesung fuer Allergieausschluesse; ergaenzt den C-503-Trigramindex fuer Fehlertoleranz.';
COMMENT ON FUNCTION supplements.search_supplier_products(text, text, text, integer, text, text, boolean, text[], text[], boolean) IS
  'C-504: Produktfilter liegen in der Datenbank. Allergien schliessen aus, Meidestoffe markieren nur; Marken, Kategorie, Form und bewertete Produkte filtern serverseitig.';
COMMENT ON FUNCTION supplements.supplier_product_filter_preferences_read() IS
  'C-504: liest ausschliesslich die dauerhaften Produktfilter; die Sucheingabe wird bewusst nie gespeichert.';

COMMIT;
