BEGIN;

ALTER TABLE supplements.suppliers
  ADD COLUMN name_normalized text GENERATED ALWAYS AS
    (lower(regexp_replace(btrim(name), '\\s+', ' ', 'g'))) STORED;
CREATE UNIQUE INDEX suppliers_name_normalized_key
  ON supplements.suppliers (name_normalized);

ALTER TABLE supplements.supplier_products
  ALTER COLUMN supplier_id DROP NOT NULL,
  ADD COLUMN marke text,
  ADD COLUMN dsld_id bigint,
  ADD COLUMN product_type text,
  ADD COLUMN market_status text,
  ADD COLUMN date_entered date,
  ADD COLUMN suggested_use text,
  ADD CONSTRAINT supplier_products_dsld_id_ck CHECK (dsld_id IS NULL OR dsld_id > 0),
  ADD CONSTRAINT supplier_products_dsld_id_key UNIQUE (dsld_id);

ALTER TABLE supplements.supplier_products
  DROP CONSTRAINT supplier_products_supplier_id_gtin_key;
CREATE UNIQUE INDEX supplier_products_supplier_gtin_key
  ON supplements.supplier_products (supplier_id, gtin)
  WHERE supplier_id IS NOT NULL AND gtin IS NOT NULL;

ALTER TABLE supplements.supplier_products
  DROP CONSTRAINT supplier_products_name_check,
  ADD CONSTRAINT supplier_products_name_check CHECK (length(btrim(name)) >= 1);

CREATE INDEX supplier_products_marke_idx
  ON supplements.supplier_products (marke)
  WHERE marke IS NOT NULL;
CREATE INDEX supplier_products_market_status_idx
  ON supplements.supplier_products (market_status)
  WHERE market_status IS NOT NULL;

CREATE TABLE supplements.product_suppliers (
  product_id uuid NOT NULL REFERENCES supplements.supplier_products(id) ON DELETE CASCADE,
  supplier_id uuid NOT NULL REFERENCES supplements.suppliers(id) ON DELETE RESTRICT,
  rolle text NOT NULL CHECK (rolle IN ('manufacturer','distributor','packager','reseller','other')),
  source text NOT NULL CHECK (btrim(source) <> ''),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (product_id, supplier_id, rolle)
);
CREATE INDEX product_suppliers_supplier_idx ON supplements.product_suppliers (supplier_id, rolle);

ALTER TABLE supplements.product_contents
  ALTER COLUMN supplement_id DROP NOT NULL,
  ADD COLUMN ingredient_name text,
  ADD COLUMN ingredient_category text,
  ADD COLUMN amount_raw text,
  ADD COLUMN amount_qualifier text CHECK (amount_qualifier IN ('exact','less_than','greater_than','not_stated')),
  ADD COLUMN blend_id uuid,
  ADD COLUMN reihenfolge integer,
  ADD CONSTRAINT product_contents_reihenfolge_ck CHECK (reihenfolge IS NULL OR reihenfolge > 0),
  ADD CONSTRAINT product_contents_blend_fk
    FOREIGN KEY (blend_id) REFERENCES supplements.product_contents(id) ON DELETE RESTRICT;

ALTER TABLE supplements.product_contents
  DROP CONSTRAINT product_contents_product_id_supplement_id_key;
ALTER TABLE supplements.product_contents
  ALTER COLUMN amount_per_serving TYPE numeric;
CREATE INDEX product_contents_blend_idx ON supplements.product_contents (blend_id)
  WHERE blend_id IS NOT NULL;
CREATE UNIQUE INDEX product_contents_dsld_order_key
  ON supplements.product_contents (product_id, reihenfolge)
  WHERE reihenfolge IS NOT NULL;

ALTER TABLE supplements.product_content_candidates
  ADD COLUMN product_content_id uuid REFERENCES supplements.product_contents(id) ON DELETE CASCADE,
  ADD COLUMN amount_raw text,
  ADD COLUMN amount_qualifier text CHECK (amount_qualifier IN ('exact','less_than','greater_than','not_stated'));
ALTER TABLE supplements.product_content_candidates
  DROP CONSTRAINT product_content_candidates_ingredient_name_check,
  ADD CONSTRAINT product_content_candidates_ingredient_name_check CHECK (length(btrim(ingredient_name)) >= 1);
ALTER TABLE supplements.product_content_candidates
  DROP CONSTRAINT product_content_candidates_product_id_ingredient_name_key;
ALTER TABLE supplements.product_content_candidates
  ALTER COLUMN amount_per_serving TYPE numeric;
CREATE UNIQUE INDEX product_content_candidates_content_key
  ON supplements.product_content_candidates (product_content_id)
  WHERE product_content_id IS NOT NULL;

ALTER TABLE supplements.supplement_field_sources
  ALTER COLUMN supplement_id DROP NOT NULL,
  ADD COLUMN supplier_product_id uuid REFERENCES supplements.supplier_products(id) ON DELETE CASCADE,
  ADD COLUMN source text NOT NULL DEFAULT 'catalog',
  ADD CONSTRAINT supplement_field_sources_subject_ck
    CHECK (num_nonnulls(supplement_id, supplier_product_id) = 1);
CREATE INDEX supplement_field_sources_supplier_product_idx
  ON supplements.supplement_field_sources (supplier_product_id)
  WHERE supplier_product_id IS NOT NULL;

ALTER TABLE supplements.product_suppliers ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON supplements.product_suppliers TO authenticated;
GRANT ALL ON supplements.product_suppliers TO service_role;
CREATE POLICY product_suppliers_select ON supplements.product_suppliers
  FOR SELECT TO authenticated USING (true);

COMMENT ON COLUMN supplements.supplier_products.marke IS
  'C-485/DSLD Product Overview.Brand Name: sichtbarer Markenname auf der Packung, getrennt von der Firmenzeile.';
COMMENT ON COLUMN supplements.supplier_products.dsld_id IS
  'C-485/DSLD Product Overview.DSLD ID: stabile NIH-Labelkennung, keine Artikelnummer.';
COMMENT ON COLUMN supplements.suppliers.name_normalized IS
  'C-485: technisch normalisierter Firmenname fuer die DSLD-Deduplizierung; name bleibt der erste unveraenderte Etikettentext.';
COMMENT ON COLUMN supplements.supplier_products.product_type IS
  'C-485/DSLD Product Overview.Product Type [LanguaL].';
COMMENT ON COLUMN supplements.supplier_products.produktform IS
  'C-467; C-485 befuellt aus DSLD Product Overview.Supplement Form [LanguaL].';
COMMENT ON COLUMN supplements.supplier_products.market_status IS
  'C-485/DSLD Product Overview.Market Status; nicht auf das boolesche is_active reduzieren.';
COMMENT ON COLUMN supplements.supplier_products.date_entered IS
  'C-485/DSLD Product Overview.Date Entered into DSLD.';
COMMENT ON COLUMN supplements.supplier_products.suggested_use IS
  'C-485/DSLD Product Overview.Suggested Use, unveraenderter Etikettentext.';
COMMENT ON TABLE supplements.product_suppliers IS
  'C-485: DSLD Company Information kann mehrere Firmen und mehrere Rollen pro Produkt tragen.';
COMMENT ON COLUMN supplements.product_contents.blend_id IS
  'C-485: verweist bei mengenlosen Blendbestandteilen auf die mengenbelegte Blendzeile; Einzelmenge bleibt NULL.';
COMMENT ON COLUMN supplements.product_contents.reihenfolge IS
  'C-485: Etikettenreihenfolge aus Dietary Supplement Facts.';
COMMENT ON COLUMN supplements.product_contents.ingredient_name IS
  'C-485: unveraenderter DSLD Ingredient-Text; supplement_id ist nur bei eindeutigem Katalogtreffer gesetzt.';
COMMENT ON COLUMN supplements.product_contents.amount_qualifier IS
  'C-485: DSLD-Mengenoperator. less_than/greater_than bewahrt z.B. <1 ohne eine exakte Menge zu behaupten.';
COMMENT ON COLUMN supplements.supplement_field_sources.supplier_product_id IS
  'C-485: Produktfeld-Herkunft; supplement_id und supplier_product_id sind gegenseitig exklusiv.';

COMMIT;
