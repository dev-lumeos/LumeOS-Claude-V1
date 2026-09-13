BEGIN;

ALTER TABLE supplements.supplier_products
  RENAME COLUMN name TO name_en;
ALTER TABLE supplements.supplier_products
  RENAME CONSTRAINT supplier_products_name_check TO supplier_products_name_en_check;
ALTER TABLE supplements.supplier_products
  ADD COLUMN name_de text,
  ADD COLUMN name_th text;

CREATE OR REPLACE FUNCTION supplements.create_supplier_product(p_supplier_name text, p_land text, p_product_name text, p_produktform text, p_packungsgroesse text, p_packungseinheit text, p_gtin text, p_artikelnummer text, p_portionsgroesse text, p_portionseinheit text, p_contents jsonb, p_source text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
DECLARE v_supplier uuid; v_product uuid; v_item jsonb; v_supplement uuid;
BEGIN
  IF coalesce(nullif(btrim(p_supplier_name),''),'')='' OR coalesce(nullif(btrim(p_product_name),''),'')='' OR coalesce(nullif(btrim(p_source),''),'')='' OR jsonb_typeof(p_contents) <> 'array' THEN RAISE EXCEPTION 'supplier, product, source and contents array are required' USING ERRCODE='22023'; END IF;
  SELECT id INTO v_supplier FROM supplements.suppliers WHERE name=btrim(p_supplier_name);
  IF v_supplier IS NULL THEN INSERT INTO supplements.suppliers(name,land,source) VALUES (btrim(p_supplier_name),nullif(btrim(p_land),''),p_source) RETURNING id INTO v_supplier; END IF;
  INSERT INTO supplements.supplier_products(supplier_id,name_en,produktform,packungsgroesse,packungseinheit,gtin,artikelnummer,portionsgroesse,portionseinheit,source)
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

CREATE OR REPLACE FUNCTION nutrition.nutrient_intake_detail_for_day(p_user_id uuid, p_entry_date date, p_nutrient_code text)
RETURNS TABLE (source_kind text, source_name text, amount numeric, nutrient_unit text, dose_amount numeric, dose_unit text, supplement_id uuid, product_id uuid, product_name text, upper_limit_scope text, upper_limit_amount numeric, upper_limit_status text)
LANGUAGE sql STABLE SECURITY INVOKER SET search_path = '' AS $$
  WITH upper_limit AS (SELECT * FROM nutrition.nutrient_upper_limit_assessment_with_supplements(p_user_id,p_entry_date) WHERE nutrient_code=p_nutrient_code),
  food(source_kind, source_name, amount, nutrient_unit, dose_amount, dose_unit, supplement_id, product_id, product_name) AS (
    SELECT 'food'::text, mi.food_name,
      CASE p_nutrient_code WHEN 'ENERCC' THEN mi.enercc WHEN 'PROT625' THEN mi.prot625 WHEN 'FAT' THEN mi.fat WHEN 'CHO' THEN mi.cho WHEN 'FIBT' THEN mi.fibt WHEN 'SUGAR' THEN mi.sugar WHEN 'FASAT' THEN mi.fasat WHEN 'NACL' THEN mi.nacl WHEN 'WATER' THEN mi.water_g ELSE CASE WHEN (mi.nutrients->>p_nutrient_code) ~ '^-?[0-9]+([.][0-9]+)?$' THEN (mi.nutrients->>p_nutrient_code)::numeric END END,
      nd.unit, mi.amount_g, 'g'::text, NULL::uuid, NULL::uuid, NULL::text
    FROM nutrition.meals m JOIN nutrition.meal_items mi ON mi.meal_id=m.id JOIN nutrition.nutrient_defs nd ON nd.code=p_nutrient_code
    WHERE m.user_id=p_user_id AND m.entry_date=p_entry_date
  ), supplement AS (
    SELECT 'supplement'::text, il.supplement_name_snapshot,
      CASE WHEN replace(replace(replace(lower(coalesce(il.actual_dose_unit,il.dose_unit_snapshot)),chr(181),'u'),chr(956),'u'),'mcg','ug')=replace(replace(replace(lower(n.unit_original),chr(181),'u'),chr(956),'u'),'mcg','ug') THEN coalesce(il.actual_dose,il.dose_snapshot)*n.conversion_factor
           WHEN replace(replace(replace(lower(coalesce(il.actual_dose_unit,il.dose_unit_snapshot)),chr(181),'u'),chr(956),'u'),'mcg','ug')=replace(replace(replace(lower(n.unit),chr(181),'u'),chr(956),'u'),'mcg','ug') THEN coalesce(il.actual_dose,il.dose_snapshot) ELSE n.amount_per_serving END,
      nd.unit, coalesce(il.actual_dose,il.dose_snapshot), coalesce(il.actual_dose_unit,il.dose_unit_snapshot), si.supplement_id, sp.id, sp.name_en
    FROM supplements.intake_logs il JOIN supplements.stack_items si ON si.id=il.stack_item_id JOIN supplements.supplement_nutrients n ON n.supplement_id=si.supplement_id
    JOIN nutrition.nutrient_defs nd ON nd.code=n.nutrient_code LEFT JOIN supplements.supplier_products sp ON sp.id=il.supplier_product_id
    WHERE il.user_id=p_user_id AND il.intake_date=p_entry_date AND il.status='taken' AND n.status='bekannt' AND n.nutrient_code=p_nutrient_code
  ), rows AS (SELECT * FROM food UNION ALL SELECT * FROM supplement)
  SELECT r.*, u.upper_limit_scope,u.upper_limit_amount,u.upper_limit_status FROM rows r LEFT JOIN upper_limit u ON true WHERE r.amount IS NOT NULL ORDER BY r.source_kind,r.source_name;
$$;

COMMENT ON COLUMN supplements.supplier_products.name_en IS
  'C-489: DSLD Product Overview.Product Name, unveraenderter englischer Etikettentext.';
COMMENT ON COLUMN supplements.supplier_products.name_de IS
  'C-489: deutscher Produktname; bewusst leer bis eine belegte deutsche Quelle vorliegt.';
COMMENT ON COLUMN supplements.supplier_products.name_th IS
  'C-489: thailaendischer Produktname; bewusst leer bis eine belegte thailaendische Quelle vorliegt.';

COMMIT;
