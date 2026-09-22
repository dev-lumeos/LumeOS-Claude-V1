BEGIN;

CREATE TABLE supplements.supplier_product_label_statements (
  product_id uuid NOT NULL REFERENCES supplements.supplier_products(id) ON DELETE CASCADE,
  statement_type text NOT NULL CHECK (length(btrim(statement_type)) >= 1),
  statement_text text NOT NULL CHECK (length(btrim(statement_text)) >= 1),
  source text NOT NULL CHECK (btrim(source) <> ''),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (product_id, statement_type)
);

CREATE INDEX supplier_product_label_statements_type_idx
  ON supplements.supplier_product_label_statements (statement_type);

ALTER TABLE supplements.supplier_product_label_statements ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON supplements.supplier_product_label_statements FROM PUBLIC, anon;
GRANT SELECT ON supplements.supplier_product_label_statements TO authenticated;
GRANT ALL ON supplements.supplier_product_label_statements TO service_role;
CREATE POLICY supplier_product_label_statements_select
  ON supplements.supplier_product_label_statements
  FOR SELECT TO authenticated
  USING (true);

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
      'gtin', p.gtin,
      'label_url', CASE
        WHEN p.dsld_id IS NULL THEN NULL
        ELSE 'https://dsld.od.nih.gov/label/' || p.dsld_id::text
      END
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
    ),
    'label_statements', (
      SELECT coalesce(jsonb_agg(jsonb_build_object(
        'statement_type', ls.statement_type,
        'statement_text', ls.statement_text
      ) ORDER BY ls.statement_type), '[]'::jsonb)
      FROM supplements.supplier_product_label_statements ls
      WHERE ls.product_id = p.id
    )
  )
  FROM supplements.supplier_products p
  WHERE p.id = p_product_id;
$$;

REVOKE ALL ON FUNCTION supplements.supplier_product_detail(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION supplements.supplier_product_detail(uuid) TO authenticated;

COMMENT ON TABLE supplements.supplier_product_label_statements IS
  'C-532: unveraenderte DSLD Label Statements je Produkt und Statement-Art. Der Text ist Anzeigebeleg, keine Allergenentwarnung oder medizinische Auswertung.';
COMMENT ON COLUMN supplements.supplier_product_label_statements.statement_type IS
  'C-532/DSLD Label Statements.Statement Type; unveraenderter Quelltyp.';
COMMENT ON COLUMN supplements.supplier_product_label_statements.statement_text IS
  'C-532/DSLD Label Statements.Statement; unveraenderter Etiketttext ohne fachliche Interpretation.';
COMMENT ON FUNCTION supplements.supplier_product_detail(uuid) IS
  'C-532: vollstaendige Labelansicht mit Kopf, Inhaltszeilen, Firmenrollen, deterministischer DSLD-Labelseite und rohen Label Statements; keine Statement-Auswertung.';

COMMIT;
