BEGIN;

-- C-542: A supplier-product label can explicitly name a nutrient but omit its
-- quantity. Preserve those named holes at intake time; a nutrient absent from
-- an otherwise available label remains a known zero.
ALTER TABLE supplements.intake_logs
  ADD COLUMN IF NOT EXISTS supplier_product_unmeasured_nutrient_codes text[];

CREATE OR REPLACE FUNCTION supplements.supplier_product_unmeasured_nutrient_codes(
  p_supplier_product_id uuid,
  p_serving_size text
)
RETURNS text[]
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $function$
  SELECT coalesce(array_agg(DISTINCT mapped.nutrient_code ORDER BY mapped.nutrient_code), ARRAY[]::text[])
  FROM (
    SELECT mapping.nutrient_code
    FROM supplements.product_contents content
    JOIN supplements.supplier_product_nutrient_name_mappings mapping
      ON lower(mapping.dsld_name) = lower(content.ingredient_name)
    WHERE content.product_id = p_supplier_product_id
      AND content.source_serving_size = p_serving_size
      AND content.amount_per_serving IS NULL
      AND content.amount_qualifier = 'not_stated'
      AND NOT EXISTS (
        SELECT 1
        FROM supplements.product_contents measured_content
        JOIN supplements.supplier_product_nutrient_name_mappings measured_mapping
          ON lower(measured_mapping.dsld_name) = lower(measured_content.ingredient_name)
        WHERE measured_content.product_id = content.product_id
          AND measured_content.source_serving_size = content.source_serving_size
          AND measured_mapping.nutrient_code = mapping.nutrient_code
          AND measured_content.amount_per_serving IS NOT NULL
      )
  ) mapped;
$function$;

CREATE OR REPLACE FUNCTION supplements.record_supplier_product_intake(
  p_supplier_product_id uuid,
  p_intake_date date DEFAULT current_date,
  p_intake_time time DEFAULT NULL,
  p_serving_quantity numeric DEFAULT 1,
  p_serving_size text DEFAULT NULL,
  p_meal_id uuid DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $function$
DECLARE
  v_user_id uuid;
  v_meal record;
  v_product record;
  v_snapshot record;
  v_unmeasured_nutrient_codes text[];
  v_log_id uuid;
BEGIN
  IF p_meal_id IS NOT NULL THEN
    SELECT m.user_id, m.entry_date INTO v_meal FROM nutrition.meals m WHERE m.id = p_meal_id;
    IF NOT FOUND THEN RAISE EXCEPTION 'C519: meal % not found or not readable', p_meal_id USING ERRCODE = 'P0002'; END IF;
    v_user_id := v_meal.user_id;
    IF auth.uid() IS NOT NULL AND auth.uid() <> v_user_id THEN RAISE EXCEPTION 'C519: foreign meal' USING ERRCODE = '42501'; END IF;
    IF p_intake_date IS DISTINCT FROM v_meal.entry_date THEN RAISE EXCEPTION 'C519: intake date must match meal date' USING ERRCODE = '22023'; END IF;
  ELSE
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN RAISE EXCEPTION 'C519: authentication required for an intake without meal' USING ERRCODE = '42501'; END IF;
  END IF;
  SELECT sp.id, sp.marke, sp.name_en INTO v_product FROM supplements.supplier_products sp WHERE sp.id = p_supplier_product_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'C519: supplier product % not found', p_supplier_product_id USING ERRCODE = 'P0002'; END IF;
  SELECT * INTO v_snapshot FROM supplements.supplier_product_nutrient_snapshot(p_supplier_product_id, p_serving_quantity, p_serving_size);
  SELECT supplements.supplier_product_unmeasured_nutrient_codes(p_supplier_product_id, v_snapshot.serving_size)
  INTO v_unmeasured_nutrient_codes;
  INSERT INTO supplements.intake_logs (
    user_id, stack_item_id, meal_id, intake_date, intake_time, status,
    supplement_name_snapshot, dose_snapshot, dose_unit_snapshot, supplier_product_id,
    supplier_product_serving_size, supplier_product_serving_quantity,
    supplier_product_nutrient_status, supplier_product_nutrients_snapshot,
    supplier_product_unmeasured_nutrient_codes, source_detail
  ) VALUES (
    v_user_id, NULL, p_meal_id, p_intake_date, p_intake_time, 'taken',
    concat_ws(' ', nullif(v_product.marke, ''), v_product.name_en), p_serving_quantity, 'serving', p_supplier_product_id,
    v_snapshot.serving_size, p_serving_quantity, v_snapshot.nutrient_status, v_snapshot.nutrients,
    v_unmeasured_nutrient_codes, 'C-519/C-542: supplier product intake snapshot'
  ) RETURNING id INTO v_log_id;
  IF p_meal_id IS NOT NULL THEN
    INSERT INTO nutrition.meal_items (
      meal_id, user_id, food_source, food_name, amount_g, nutrients,
      supplement_intake_log_id, source_detail
    ) VALUES (p_meal_id, v_user_id, 'supplement', NULL, NULL, '{}'::jsonb, v_log_id,
      'C-519: supplement intake reference');
  END IF;
  RETURN v_log_id;
END;
$function$;

CREATE OR REPLACE FUNCTION nutrition.nutrient_intake_source_breakdown_for_day(p_user_id uuid, p_entry_date date)
RETURNS TABLE (
  nutrient_code text, nutrient_unit text, food_amount numeric, food_missing_count integer,
  meal_supplement_amount numeric, meal_supplement_missing_count integer, meal_supplement_item_count integer,
  stack_supplement_amount numeric, stack_taken_log_count integer, stack_unmapped_taken_log_count integer,
  supplement_amount numeric
)
LANGUAGE sql STABLE SECURITY INVOKER SET search_path = '' AS $function$
  WITH food_items AS (
    SELECT mi.* FROM nutrition.meals m JOIN nutrition.meal_items mi ON mi.meal_id=m.id
    WHERE m.user_id=p_user_id AND m.entry_date=p_entry_date AND mi.food_source <> 'supplement'
  ), food_values AS (
    SELECT v.nutrient_code, v.value FROM food_items mi CROSS JOIN LATERAL (VALUES
      ('ENERCC',mi.enercc),('PROT625',mi.prot625),('FAT',mi.fat),('CHO',mi.cho),('FIBT',mi.fibt),
      ('SUGAR',mi.sugar),('FASAT',mi.fasat),('NACL',mi.nacl),('WATER',mi.water_g)
    ) v(nutrient_code,value) WHERE v.value IS NOT NULL
    UNION ALL
    SELECT kv.key,kv.value::numeric FROM food_items mi CROSS JOIN LATERAL jsonb_each_text(mi.nutrients) kv
    WHERE kv.key NOT IN ('ENERCC','PROT625','FAT','CHO','FIBT','SUGAR','FASAT','NACL','WATER')
      AND kv.value ~ '^-?[0-9]+([.][0-9]+)?$'
  ), food AS (
    SELECT nutrient_code,sum(value) amount,count(*)::integer value_count FROM food_values GROUP BY nutrient_code
  ), food_count AS (SELECT count(*)::integer item_count FROM food_items),
  meal_refs AS (
    SELECT mi.id, mi.supplement_intake_log_id FROM nutrition.meals m
    JOIN nutrition.meal_items mi ON mi.meal_id=m.id
    WHERE m.user_id=p_user_id AND m.entry_date=p_entry_date AND mi.food_source='supplement'
  ), meal_values AS (
    SELECT v.nutrient_code,v.amount FROM meal_refs mr JOIN supplements.intake_log_nutrient_values v ON v.intake_log_id=mr.supplement_intake_log_id
  ), meal_totals AS (
    SELECT nutrient_code,sum(amount) amount,count(*)::integer value_count FROM meal_values GROUP BY nutrient_code
  ), meal_unavailable AS (
    SELECT count(*)::integer AS item_count
    FROM meal_refs mr JOIN supplements.intake_logs intake ON intake.id=mr.supplement_intake_log_id
    WHERE intake.supplier_product_nutrient_status IS DISTINCT FROM 'available'
  ), meal_unmeasured AS (
    SELECT mr.supplement_intake_log_id AS intake_log_id, code.nutrient_code
    FROM meal_refs mr JOIN supplements.intake_logs intake ON intake.id=mr.supplement_intake_log_id
    CROSS JOIN LATERAL unnest(coalesce(intake.supplier_product_unmeasured_nutrient_codes, ARRAY[]::text[])) AS code(nutrient_code)
  ), meal_missing AS (
    SELECT nutrient_code,count(DISTINCT intake_log_id)::integer AS item_count
    FROM meal_unmeasured GROUP BY nutrient_code
  ), meal_count AS (SELECT count(*)::integer item_count FROM meal_refs),
  all_supplement_logs AS (
    SELECT il.id FROM supplements.intake_logs il
    WHERE il.user_id=p_user_id AND il.intake_date=p_entry_date AND il.status='taken'
  ), other_logs AS (
    SELECT l.id FROM all_supplement_logs l WHERE NOT EXISTS (SELECT 1 FROM meal_refs mr WHERE mr.supplement_intake_log_id=l.id)
  ), stack_values AS (
    SELECT v.nutrient_code,v.amount FROM other_logs ol JOIN supplements.intake_log_nutrient_values v ON v.intake_log_id=ol.id
  ), stack_totals AS (
    SELECT nutrient_code,sum(amount) amount FROM stack_values GROUP BY nutrient_code
  ), stack_count AS (
    SELECT count(*)::integer taken_log_count,
      count(*) FILTER (WHERE NOT EXISTS (SELECT 1 FROM supplements.intake_log_nutrient_values v WHERE v.intake_log_id=ol.id))::integer AS unmapped_count
    FROM other_logs ol
  )
  SELECT nd.code,nd.unit,f.amount,(fc.item_count-coalesce(f.value_count,0))::integer,
    ms.amount,(mu.item_count + coalesce(mm.item_count,0))::integer,mc.item_count,
    ss.amount,sc.taken_log_count,sc.unmapped_count,
    CASE WHEN ms.amount IS NULL AND ss.amount IS NULL THEN NULL ELSE coalesce(ms.amount,0)+coalesce(ss.amount,0) END
  FROM nutrition.nutrient_defs nd
  LEFT JOIN food f ON f.nutrient_code=nd.code
  LEFT JOIN meal_totals ms ON ms.nutrient_code=nd.code
  LEFT JOIN meal_missing mm ON mm.nutrient_code=nd.code
  LEFT JOIN stack_totals ss ON ss.nutrient_code=nd.code
  CROSS JOIN food_count fc CROSS JOIN meal_count mc CROSS JOIN meal_unavailable mu CROSS JOIN stack_count sc;
$function$;

REVOKE ALL ON FUNCTION supplements.supplier_product_unmeasured_nutrient_codes(uuid,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION supplements.supplier_product_unmeasured_nutrient_codes(uuid,text) TO authenticated, service_role;
COMMENT ON COLUMN supplements.intake_logs.supplier_product_unmeasured_nutrient_codes IS
  'C-542: Nährstoffcodes, die das aufgenommene Produktetikett nennt, aber ohne Mengenwert. Nicht genannte Codes sind kein fehlender Messwert.';
COMMENT ON FUNCTION supplements.supplier_product_unmeasured_nutrient_codes(uuid,text) IS
  'C-542: Überträgt nur not_stated-Etikettzeilen ohne Menge in den Intake-Snapshot; die Abwesenheit einer Zeile bedeutet null, nicht unbekannt.';

COMMIT;
