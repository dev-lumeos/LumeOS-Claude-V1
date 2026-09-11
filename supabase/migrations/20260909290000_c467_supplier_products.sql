BEGIN;

CREATE TABLE supplements.suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  name text NOT NULL CHECK (length(btrim(name)) >= 2), land text, website text, notiz text,
  is_active boolean NOT NULL DEFAULT true, source text NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (name)
);
CREATE TABLE supplements.supplier_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), supplier_id uuid NOT NULL REFERENCES supplements.suppliers(id) ON DELETE RESTRICT,
  name text NOT NULL CHECK (length(btrim(name)) >= 2), produktform text, packungsgroesse numeric(14,4), packungseinheit text,
  gtin text, artikelnummer text, portionsgroesse numeric(14,4), portionseinheit text,
  im_katalog boolean NOT NULL DEFAULT false, is_active boolean NOT NULL DEFAULT true, source text NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE NULLS NOT DISTINCT (supplier_id, gtin), CHECK (gtin IS NULL OR gtin ~ '^[0-9]{8,14}$')
);
CREATE TABLE supplements.product_contents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), product_id uuid NOT NULL REFERENCES supplements.supplier_products(id) ON DELETE CASCADE,
  supplement_id uuid NOT NULL REFERENCES supplements.supplements(id) ON DELETE RESTRICT,
  amount_per_serving numeric(14,6), unit text, conversion_factor numeric(14,6), ist_wirkstoff boolean NOT NULL DEFAULT true,
  source text NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (product_id, supplement_id), CHECK (amount_per_serving IS NULL OR amount_per_serving >= 0), CHECK (conversion_factor IS NULL OR conversion_factor > 0)
);
CREATE TABLE supplements.product_content_candidates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), product_id uuid NOT NULL REFERENCES supplements.supplier_products(id) ON DELETE CASCADE,
  ingredient_name text NOT NULL CHECK (length(btrim(ingredient_name)) >= 2), amount_per_serving numeric(14,6), unit text,
  status text NOT NULL DEFAULT 'offen' CHECK (status IN ('offen','geprueft','angereichert','abgelehnt')),
  source text NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (product_id, ingredient_name)
);
CREATE INDEX supplier_products_supplier_idx ON supplements.supplier_products(supplier_id, is_active, im_katalog);
CREATE INDEX product_contents_product_idx ON supplements.product_contents(product_id);
CREATE INDEX product_contents_supplement_idx ON supplements.product_contents(supplement_id);
CREATE INDEX product_content_candidates_status_idx ON supplements.product_content_candidates(status, created_at);
ALTER TABLE supplements.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplements.supplier_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplements.product_contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplements.product_content_candidates ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON supplements.suppliers, supplements.supplier_products, supplements.product_contents, supplements.product_content_candidates TO authenticated;
GRANT ALL ON supplements.suppliers, supplements.supplier_products, supplements.product_contents, supplements.product_content_candidates TO service_role;
CREATE POLICY suppliers_select ON supplements.suppliers FOR SELECT TO authenticated USING (true);
CREATE POLICY supplier_products_select ON supplements.supplier_products FOR SELECT TO authenticated USING (true);
CREATE POLICY product_contents_select ON supplements.product_contents FOR SELECT TO authenticated USING (true);
CREATE POLICY product_content_candidates_select ON supplements.product_content_candidates FOR SELECT TO authenticated USING (true);

CREATE FUNCTION supplements.create_supplier_product(p_supplier_name text, p_land text, p_product_name text, p_produktform text, p_packungsgroesse text, p_packungseinheit text, p_gtin text, p_artikelnummer text, p_portionsgroesse text, p_portionseinheit text, p_contents jsonb, p_source text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
DECLARE v_supplier uuid; v_product uuid; v_item jsonb; v_supplement uuid;
BEGIN
  IF coalesce(nullif(btrim(p_supplier_name),''),'')='' OR coalesce(nullif(btrim(p_product_name),''),'')='' OR coalesce(nullif(btrim(p_source),''),'')='' OR jsonb_typeof(p_contents) <> 'array' THEN RAISE EXCEPTION 'supplier, product, source and contents array are required' USING ERRCODE='22023'; END IF;
  SELECT id INTO v_supplier FROM supplements.suppliers WHERE name=btrim(p_supplier_name);
  IF v_supplier IS NULL THEN INSERT INTO supplements.suppliers(name,land,source) VALUES (btrim(p_supplier_name),nullif(btrim(p_land),''),p_source) RETURNING id INTO v_supplier; END IF;
  INSERT INTO supplements.supplier_products(supplier_id,name,produktform,packungsgroesse,packungseinheit,gtin,artikelnummer,portionsgroesse,portionseinheit,source)
  VALUES(v_supplier,btrim(p_product_name),nullif(btrim(p_produktform),''),nullif(btrim(p_packungsgroesse),'')::numeric,nullif(btrim(p_packungseinheit),''),nullif(btrim(p_gtin),''),nullif(btrim(p_artikelnummer),''),nullif(btrim(p_portionsgroesse),'')::numeric,nullif(btrim(p_portionseinheit),''),p_source) RETURNING id INTO v_product;
  FOR v_item IN SELECT value FROM jsonb_array_elements(p_contents) LOOP
    v_supplement := nullif(v_item->>'supplement_id','')::uuid;
    IF v_supplement IS NOT NULL AND EXISTS (SELECT 1 FROM supplements.supplements WHERE id=v_supplement) THEN
      INSERT INTO supplements.product_contents(product_id,supplement_id,amount_per_serving,unit,conversion_factor,ist_wirkstoff,source) VALUES(v_product,v_supplement,nullif(v_item->>'amount_per_serving','')::numeric,nullif(v_item->>'unit',''),nullif(v_item->>'conversion_factor','')::numeric,coalesce((v_item->>'ist_wirkstoff')::boolean,true),p_source);
    ELSE
      INSERT INTO supplements.product_content_candidates(product_id,ingredient_name,amount_per_serving,unit,source) VALUES(v_product,coalesce(nullif(btrim(v_item->>'ingredient_name'),''),'unbenannter Etiketteneintrag'),nullif(v_item->>'amount_per_serving','')::numeric,nullif(v_item->>'unit',''),p_source);
    END IF;
  END LOOP;
  RETURN v_product;
END $$;
REVOKE ALL ON FUNCTION supplements.create_supplier_product(text,text,text,text,text,text,text,text,text,text,jsonb,text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION supplements.create_supplier_product(text,text,text,text,text,text,text,text,text,text,jsonb,text) TO service_role;
COMMIT;
