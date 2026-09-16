BEGIN;

CREATE OR REPLACE FUNCTION supplements.search_supplier_products(
  p_query text,
  p_market_status text DEFAULT 'On Market',
  p_marke text DEFAULT NULL,
  p_limit integer DEFAULT 50
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
    AND (p_query <% p.name_en OR p_query <% p.marke)
  ORDER BY
    CASE preference.preference WHEN 'liked' THEN 0 WHEN 'disliked' THEN 2 ELSE 1 END,
    CASE WHEN p_query <% p.name_en THEN 0 ELSE 1 END,
    similarity DESC,
    p.name_en ASC
  LIMIT least(greatest(coalesce(p_limit, 50), 1), 100);
END;
$$;

CREATE OR REPLACE VIEW supplements.supplier_product_brands
WITH (security_invoker = true)
AS
  SELECT p.marke, count(*)::integer AS product_count
  FROM supplements.supplier_products p
  WHERE p.is_active
    AND p.market_status = 'On Market'
    AND p.marke IS NOT NULL
  GROUP BY p.marke
  ORDER BY p.marke;

COMMENT ON FUNCTION supplements.search_supplier_products(text, text, text, integer) IS
  'C-495/C-497/C-499: aktive Produktsuche mit pg_trgm; eigene liked Produkte vor neutralen, disliked danach. Off-Market-Produkte bleiben per Detailweg erreichbar.';
COMMENT ON VIEW supplements.supplier_product_brands IS
  'C-495/C-499: Markenfilterliste ausschliesslich fuer aktive On-Market-Produkte.';

REVOKE ALL ON FUNCTION supplements.search_supplier_products(text, text, text, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION supplements.search_supplier_products(text, text, text, integer) TO authenticated;
REVOKE ALL ON TABLE supplements.supplier_product_brands FROM PUBLIC, anon;
GRANT SELECT ON TABLE supplements.supplier_product_brands TO authenticated;

COMMIT;
