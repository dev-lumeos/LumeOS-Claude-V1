BEGIN;

ALTER TABLE nutrition.food_preference_items
  ADD COLUMN supplement_product_id uuid REFERENCES supplements.supplier_products(id);

ALTER TABLE nutrition.food_preference_items
  DROP CONSTRAINT food_preference_items_exactly_one_target,
  DROP CONSTRAINT food_preference_items_target_type_check;

ALTER TABLE nutrition.food_preference_items
  ADD CONSTRAINT food_preference_items_exactly_one_target CHECK (
    ((food_id IS NOT NULL)::integer
      + (category_id IS NOT NULL)::integer
      + (tag_code IS NOT NULL)::integer
      + (NULLIF(cuisine_code, '') IS NOT NULL)::integer
      + (NULLIF(exclusion_preset_code, '') IS NOT NULL)::integer
      + (NULLIF(catalog_item_code, '') IS NOT NULL)::integer
      + (supplement_product_id IS NOT NULL)::integer) = 1
  ),
  ADD CONSTRAINT food_preference_items_target_type_check CHECK (
    target_type IN (
      'food', 'category', 'tag', 'cuisine', 'exclusion_preset', 'catalog_item', 'supplement_product'
    )
  ),
  ADD CONSTRAINT food_preference_items_target_matches_column CHECK (
    (target_type = 'food' AND food_id IS NOT NULL)
    OR (target_type = 'category' AND category_id IS NOT NULL)
    OR (target_type = 'tag' AND tag_code IS NOT NULL)
    OR (target_type = 'cuisine' AND NULLIF(cuisine_code, '') IS NOT NULL)
    OR (target_type = 'exclusion_preset' AND NULLIF(exclusion_preset_code, '') IS NOT NULL)
    OR (target_type = 'catalog_item' AND NULLIF(catalog_item_code, '') IS NOT NULL)
    OR (target_type = 'supplement_product' AND supplement_product_id IS NOT NULL)
  );

CREATE UNIQUE INDEX food_preference_items_user_supplement_product_uq
  ON nutrition.food_preference_items (user_id, supplement_product_id)
  WHERE supplement_product_id IS NOT NULL;

CREATE OR REPLACE FUNCTION supplements.supplier_product_preference_write(
  p_product_id uuid,
  p_preference text
)
RETURNS jsonb
LANGUAGE plpgsql
VOLATILE
SECURITY INVOKER
SET search_path = pg_catalog, public, supplements, nutrition
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_row nutrition.food_preference_items;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'supplier_product_preference_write: authenticated user required';
  END IF;
  IF p_product_id IS NULL THEN
    RAISE EXCEPTION 'supplier_product_preference_write: product_id is required';
  END IF;
  IF p_preference IS NULL THEN
    DELETE FROM nutrition.food_preference_items
    WHERE user_id = v_user_id
      AND target_type = 'supplement_product'
      AND supplement_product_id = p_product_id;
    RETURN jsonb_build_object('product_id', p_product_id, 'preference', NULL);
  END IF;
  IF p_preference NOT IN ('liked', 'disliked') THEN
    RAISE EXCEPTION 'supplier_product_preference_write: preference must be liked, disliked or null';
  END IF;

  INSERT INTO nutrition.food_preference_items (
    user_id, preference, strength, target_type, supplement_product_id, source
  )
  VALUES (
    v_user_id,
    p_preference,
    CASE p_preference WHEN 'liked' THEN 'like' ELSE 'soft_dislike' END,
    'supplement_product',
    p_product_id,
    'supplement_product'
  )
  ON CONFLICT (user_id, supplement_product_id) WHERE supplement_product_id IS NOT NULL
  DO UPDATE SET
    preference = EXCLUDED.preference,
    strength = EXCLUDED.strength,
    source = EXCLUDED.source
  RETURNING * INTO v_row;

  RETURN jsonb_build_object(
    'product_id', v_row.supplement_product_id,
    'preference', v_row.preference,
    'strength', v_row.strength
  );
END;
$$;

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
  WHERE (p_market_status IS NULL OR p.market_status = p_market_status)
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

COMMENT ON FUNCTION supplements.supplier_product_preference_write(uuid, text) IS
  'C-497: setzt oder entfernt die eigene liked/disliked-Vorliebe fuer ein Lieferantenprodukt. SECURITY INVOKER laesst die vorhandene RLS auf nutrition.food_preference_items wirken.';
COMMENT ON FUNCTION supplements.search_supplier_products(text, text, text, integer) IS
  'C-495/C-497: On-Market-Produktsuche mit pg_trgm; eigene liked Produkte werden vor neutralen, disliked Produkte danach sortiert.';

REVOKE ALL ON FUNCTION supplements.supplier_product_preference_write(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION supplements.supplier_product_preference_write(uuid, text) TO authenticated;
REVOKE ALL ON FUNCTION supplements.search_supplier_products(text, text, text, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION supplements.search_supplier_products(text, text, text, integer) TO authenticated;

COMMIT;
