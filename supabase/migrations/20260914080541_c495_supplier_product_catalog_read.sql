BEGIN;

CREATE INDEX supplier_products_name_en_trgm_idx
  ON supplements.supplier_products
  USING gin (name_en gin_trgm_ops);
CREATE INDEX supplier_products_marke_trgm_idx
  ON supplements.supplier_products
  USING gin (marke gin_trgm_ops)
  WHERE marke IS NOT NULL;

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
  WHERE (p_market_status IS NULL OR p.market_status = p_market_status)
    AND (p_marke IS NULL OR p.marke = p_marke)
    AND (p_query <% p.name_en OR p_query <% p.marke)
  ORDER BY
    CASE WHEN p_query <% p.name_en THEN 0 ELSE 1 END,
    similarity DESC,
    p.name_en ASC
  LIMIT least(greatest(coalesce(p_limit, 50), 1), 100);
END;
$$;

CREATE OR REPLACE FUNCTION supplements.supplier_product_detail(p_product_id uuid)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = pg_catalog, public, supplements
AS $$
  SELECT jsonb_build_object(
    'header', jsonb_build_object(
      'marke', p.marke,
      'name_en', p.name_en,
      'portionsgroesse', p.portionsgroesse,
      'portionseinheit', p.portionseinheit,
      'packungsgroesse', p.packungsgroesse,
      'packungseinheit', p.packungseinheit,
      'market_status', p.market_status,
      'gtin', p.gtin
    ),
    'contents', (
      SELECT coalesce(jsonb_agg(jsonb_build_object(
        'ingredient_name', c.ingredient_name,
        'amount_per_serving', c.amount_per_serving,
        'unit', c.unit,
        'amount_qualifier', c.amount_qualifier,
        'ingredient_category', c.ingredient_category,
        'blend_id', c.blend_id,
        'reihenfolge', c.reihenfolge,
        'supplement_name_en', s.name_en
      ) ORDER BY c.reihenfolge NULLS LAST, c.id), '[]'::jsonb)
      FROM supplements.product_contents c
      LEFT JOIN supplements.supplements s ON s.id = c.supplement_id
      WHERE c.product_id = p.id
    ),
    'suppliers', (
      SELECT coalesce(jsonb_agg(jsonb_build_object(
        'name', s.name,
        'land', s.land,
        'rolle', ps.rolle
      ) ORDER BY s.name, ps.rolle), '[]'::jsonb)
      FROM supplements.product_suppliers ps
      JOIN supplements.suppliers s ON s.id = ps.supplier_id
      WHERE ps.product_id = p.id
    )
  )
  FROM supplements.supplier_products p
  WHERE p.id = p_product_id;
$$;

CREATE OR REPLACE VIEW supplements.supplier_product_brands
WITH (security_invoker = true)
AS
  SELECT p.marke, count(*)::integer AS product_count
  FROM supplements.supplier_products p
  WHERE p.market_status = 'On Market'
    AND p.marke IS NOT NULL
  GROUP BY p.marke
  ORDER BY p.marke;

REVOKE ALL ON FUNCTION supplements.search_supplier_products(text, text, text, integer) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION supplements.supplier_product_detail(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION supplements.search_supplier_products(text, text, text, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION supplements.supplier_product_detail(uuid) TO authenticated;

REVOKE ALL ON supplements.supplier_product_brands FROM PUBLIC, anon;
GRANT SELECT ON supplements.supplier_product_brands TO authenticated;

COMMENT ON FUNCTION supplements.search_supplier_products(text, text, text, integer) IS
  'C-495: On-Market-Produktsuche mit pg_trgm word_similarity 0.30 ueber englischen Produkt- und Markennamen; Marke und Marktstatus sind optionale Filter.';
COMMENT ON FUNCTION supplements.supplier_product_detail(uuid) IS
  'C-495: vollstaendliche Labelansicht mit Kopf, ungekuerzten Inhaltszeilen samt Katalogname und Firmenrollen.';
COMMENT ON VIEW supplements.supplier_product_brands IS
  'C-495: Markenfilterliste ausschliesslich fuer On-Market-Produkte.';

COMMIT;
