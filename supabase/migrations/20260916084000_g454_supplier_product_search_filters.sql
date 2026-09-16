BEGIN;

CREATE INDEX product_contents_ingredient_category_product_idx
  ON supplements.product_contents (ingredient_category, product_id);

-- G-454 ersetzt die Vier-Parameter-Signatur. Alle bisherigen Aufrufe mit
-- vier Argumenten bleiben durch die neuen Defaultwerte kompatibel.
DROP FUNCTION supplements.search_supplier_products(text, text, text, integer);

CREATE FUNCTION supplements.search_supplier_products(
  p_query text,
  p_market_status text DEFAULT 'On Market',
  p_marke text DEFAULT NULL,
  p_limit integer DEFAULT 50,
  p_kategorie text DEFAULT NULL,
  p_form text DEFAULT NULL
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
  similarity real
)
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = pg_catalog, public, supplements
AS $$
DECLARE
  v_kategorie text := nullif(btrim(p_kategorie), '');
  v_form text := nullif(btrim(p_form), '');
BEGIN
  IF nullif(btrim(p_query), '') IS NULL THEN
    RETURN;
  END IF;

  PERFORM set_config('pg_trgm.word_similarity_threshold', '0.30', true);

  RETURN QUERY
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
    )::real AS similarity
  FROM supplements.supplier_products p
  LEFT JOIN LATERAL (
    SELECT fpi.preference
    FROM nutrition.food_preference_items fpi
    WHERE fpi.user_id = auth.uid()
      AND fpi.target_type = 'supplement_product'
      AND fpi.supplement_product_id = p.id
    LIMIT 1
  ) preference ON true
  WHERE p.is_active
    AND (p_market_status IS NULL OR p.market_status = p_market_status)
    AND (p_marke IS NULL OR p.marke = p_marke)
    AND (v_form IS NULL OR p.produktform = v_form)
    AND (p_query <% p.name_en OR p_query <% p.marke)
    AND (v_kategorie IS NULL OR EXISTS (
      SELECT 1
      FROM supplements.product_contents c
      WHERE c.product_id = p.id
        AND c.ingredient_category = v_kategorie
    ))
  ORDER BY
    CASE preference.preference WHEN 'liked' THEN 0 WHEN 'disliked' THEN 2 ELSE 1 END,
    CASE WHEN p_query <% p.name_en THEN 0 ELSE 1 END,
    similarity DESC,
    p.name_en ASC
  LIMIT least(greatest(coalesce(p_limit, 50), 1), 100);
END;
$$;

REVOKE ALL ON FUNCTION supplements.search_supplier_products(text, text, text, integer, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION supplements.search_supplier_products(text, text, text, integer, text, text) TO authenticated;

COMMENT ON FUNCTION supplements.search_supplier_products(text, text, text, integer, text, text) IS
  'C-495/C-497/C-499/G-454: aktive Produktsuche mit pg_trgm, eigenen Vorlieben sowie optionalen Produktfiltern p_kategorie (EXISTS auf Inhaltszeilen) und p_form.';
COMMENT ON INDEX supplements.product_contents_ingredient_category_product_idx IS
  'G-454: Produkt-Kategorienfilter. ingredient_category ist vollstaendig belegt; der Vollindex erlaubt EXISTS(category, product_id) ohne Heap-Filter.';

COMMIT;
