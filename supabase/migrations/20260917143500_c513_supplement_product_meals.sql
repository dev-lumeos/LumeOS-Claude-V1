BEGIN;

-- C-513: Ein DSLD-Produkt wird als eigene Mahlzeitenquelle eingefroren.
-- amount_g bleibt fuer Nahrung reserviert: Kapseln, Scoops und Milliliter
-- sind keine Grammangaben und duerfen nicht als solche vorgetaeuscht werden.
ALTER TABLE nutrition.meal_items
  ADD COLUMN IF NOT EXISTS supplement_product_id uuid,
  ADD COLUMN IF NOT EXISTS supplement_serving_size text,
  ADD COLUMN IF NOT EXISTS supplement_serving_quantity numeric(10,3),
  ADD COLUMN IF NOT EXISTS supplement_nutrient_status text;

DO $do$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'nutrition.meal_items'::regclass
      AND conname = 'meal_items_supplement_product_id_fkey'
  ) THEN
    ALTER TABLE nutrition.meal_items
      ADD CONSTRAINT meal_items_supplement_product_id_fkey
      FOREIGN KEY (supplement_product_id)
      REFERENCES supplements.supplier_products(id) ON DELETE RESTRICT;
  END IF;
END $do$;

CREATE INDEX IF NOT EXISTS meal_items_supplement_product_idx
  ON nutrition.meal_items(supplement_product_id)
  WHERE supplement_product_id IS NOT NULL;

ALTER TABLE nutrition.meal_items
  ALTER COLUMN amount_g DROP NOT NULL,
  DROP CONSTRAINT IF EXISTS meal_items_amount_g_check,
  DROP CONSTRAINT IF EXISTS meal_items_food_source_check,
  DROP CONSTRAINT IF EXISTS meal_items_source_target_check,
  DROP CONSTRAINT IF EXISTS meal_items_supplement_snapshot_check;

ALTER TABLE nutrition.meal_items
  ADD CONSTRAINT meal_items_amount_g_check CHECK (
    (food_source = 'supplement' AND amount_g IS NULL)
    OR (food_source <> 'supplement' AND amount_g > 0)
  ),
  ADD CONSTRAINT meal_items_food_source_check CHECK (
    food_source IN ('bls', 'manual', 'custom', 'supplement')
  ),
  ADD CONSTRAINT meal_items_source_target_check CHECK (
    (food_source = 'bls' AND food_id IS NOT NULL AND custom_food_id IS NULL AND supplement_product_id IS NULL)
    OR (food_source = 'custom' AND food_id IS NULL AND custom_food_id IS NOT NULL AND supplement_product_id IS NULL)
    OR (food_source = 'manual' AND food_id IS NULL AND custom_food_id IS NULL AND supplement_product_id IS NULL)
    OR (food_source = 'supplement' AND food_id IS NULL AND custom_food_id IS NULL AND supplement_product_id IS NOT NULL)
  ),
  ADD CONSTRAINT meal_items_supplement_snapshot_check CHECK (
    (food_source = 'supplement'
      AND supplement_serving_quantity IS NOT NULL
      AND supplement_serving_quantity > 0
      AND supplement_nutrient_status IN ('available', 'no_nutrients_available'))
    OR (food_source <> 'supplement'
      AND supplement_serving_size IS NULL
      AND supplement_serving_quantity IS NULL
      AND supplement_nutrient_status IS NULL)
  );

COMMENT ON COLUMN nutrition.meal_items.supplement_product_id IS
  'C-513: Lieferantenprodukt einer Mahlzeit; der Nährwert-Snapshot bleibt die historische Wahrheit.';
COMMENT ON COLUMN nutrition.meal_items.supplement_serving_size IS
  'C-513: explizit gewählte DSLD-Facts-Portion. NULL bei einem Produkt ohne belegte Nährwerte.';
COMMENT ON COLUMN nutrition.meal_items.supplement_serving_quantity IS
  'C-513: Anzahl der gewählten Produktportionen; kein Gramm-Ersatz.';
COMMENT ON COLUMN nutrition.meal_items.supplement_nutrient_status IS
  'C-513: available = belegter Snapshot; no_nutrients_available = Produkt ist notiert, seine Bilanz bleibt sichtbar offen.';

CREATE OR REPLACE FUNCTION nutrition.add_supplement_product_to_meal(
  p_meal_id uuid,
  p_supplier_product_id uuid,
  p_serving_quantity numeric DEFAULT 1,
  p_serving_size text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $function$
DECLARE
  v_user_id uuid;
  v_product record;
  v_option supplements.supplier_product_nutrient_serving_options%ROWTYPE;
  v_option_count integer;
  v_item_id uuid;
  v_status text;
BEGIN
  IF p_serving_quantity IS NULL OR p_serving_quantity <= 0 THEN
    RAISE EXCEPTION 'C513: serving quantity must be greater than zero'
      USING ERRCODE = '22023';
  END IF;

  -- RLS auf meals macht fremde Mahlzeiten unsichtbar; die explizite
  -- P0002-Antwort verhindert dabei eine ungeschützte Zielzeile.
  SELECT m.user_id INTO v_user_id
  FROM nutrition.meals m
  WHERE m.id = p_meal_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'C513: meal % not found or not readable', p_meal_id
      USING ERRCODE = 'P0002';
  END IF;

  SELECT sp.id, sp.marke, sp.name_en INTO v_product
  FROM supplements.supplier_products sp
  WHERE sp.id = p_supplier_product_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'C513: supplier product % not found', p_supplier_product_id
      USING ERRCODE = 'P0002';
  END IF;

  SELECT count(*) INTO v_option_count
  FROM supplements.supplier_product_nutrient_serving_options o
  WHERE o.product_id = p_supplier_product_id;

  IF v_option_count > 1 AND NULLIF(btrim(p_serving_size), '') IS NULL THEN
    RAISE EXCEPTION 'C513: product % has multiple serving sizes; choose one explicitly', p_supplier_product_id
      USING ERRCODE = 'P0001';
  END IF;

  IF v_option_count > 0 THEN
    SELECT o.* INTO v_option
    FROM supplements.supplier_product_nutrient_serving_options o
    WHERE o.product_id = p_supplier_product_id
      AND (v_option_count = 1 OR o.serving_size = btrim(p_serving_size));
    IF NOT FOUND THEN
      RAISE EXCEPTION 'C513: serving size % is not an evidenced option for product %', p_serving_size, p_supplier_product_id
        USING ERRCODE = '22023';
    END IF;
    v_status := 'available';
  ELSE
    IF NULLIF(btrim(p_serving_size), '') IS NOT NULL THEN
      RAISE EXCEPTION 'C513: product % has no evidenced nutrient serving size', p_supplier_product_id
        USING ERRCODE = '22023';
    END IF;
    v_status := 'no_nutrients_available';
  END IF;

  INSERT INTO nutrition.meal_items (
    meal_id, user_id, food_source, food_name, amount_g,
    enercc, prot625, fat, cho, fibt, sugar, fasat, nacl, water_g,
    nutrients, supplement_product_id, supplement_serving_size,
    supplement_serving_quantity, supplement_nutrient_status, source_detail
  ) VALUES (
    p_meal_id, v_user_id, 'supplement', concat_ws(' ', nullif(v_product.marke, ''), v_product.name_en), NULL,
    v_option.enercc * p_serving_quantity,
    v_option.prot625 * p_serving_quantity,
    v_option.fat * p_serving_quantity,
    v_option.cho * p_serving_quantity,
    v_option.fibt * p_serving_quantity,
    v_option.sugar * p_serving_quantity,
    v_option.fasat * p_serving_quantity,
    v_option.nacl * p_serving_quantity,
    v_option.water_g * p_serving_quantity,
    jsonb_strip_nulls(jsonb_build_object(
      'ALC', v_option.alc * p_serving_quantity,
      'VITA', v_option.vita_ug * p_serving_quantity,
      'VITD', v_option.vitd_ug * p_serving_quantity,
      'VITE', v_option.vite_mg * p_serving_quantity,
      'VITK', v_option.vitk_ug * p_serving_quantity,
      'VITC', v_option.vitc_mg * p_serving_quantity,
      'THIA', v_option.thia_mg * p_serving_quantity,
      'RIBF', v_option.ribf_mg * p_serving_quantity,
      'NIA', v_option.nia_mg * p_serving_quantity,
      'VITB6', v_option.vitb6_ug * p_serving_quantity,
      'FOL', v_option.fol_ug * p_serving_quantity,
      'VITB12', v_option.vitb12_ug * p_serving_quantity,
      'NA', v_option.na_mg * p_serving_quantity,
      'K', v_option.k_mg * p_serving_quantity,
      'CA', v_option.ca_mg * p_serving_quantity,
      'MG', v_option.mg_mg * p_serving_quantity,
      'P', v_option.p_mg * p_serving_quantity,
      'FE', v_option.fe_mg * p_serving_quantity,
      'ZN', v_option.zn_mg * p_serving_quantity,
      'ID', v_option.id_ug * p_serving_quantity,
      'CU', v_option.cu_ug * p_serving_quantity,
      'MN', v_option.mn_ug * p_serving_quantity
    )),
    p_supplier_product_id,
    v_option.serving_size,
    p_serving_quantity,
    v_status,
    'C-513: supplier-product nutrient snapshot'
  )
  RETURNING id INTO v_item_id;

  RETURN v_item_id;
END;
$function$;

-- Directe Table-Writes bleiben fuer normale Nahrung moeglich. Fuer die neue
-- Supplementquelle erzwingt der Trigger dagegen denselben belegten Snapshot
-- wie der RPC; eine beliebige Kalorienzahl kann nicht eingeschleust werden.
CREATE OR REPLACE FUNCTION nutrition.meal_items_supplement_snapshot_guard()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $function$
DECLARE
  v_option supplements.supplier_product_nutrient_serving_options%ROWTYPE;
  v_expected_nutrients jsonb;
BEGIN
  IF NEW.food_source <> 'supplement' THEN
    RETURN NEW;
  END IF;

  SELECT o.* INTO v_option
  FROM supplements.supplier_product_nutrient_serving_options o
  WHERE o.product_id = NEW.supplement_product_id
    AND o.serving_size = NEW.supplement_serving_size;

  IF NOT FOUND THEN
    IF EXISTS (
      SELECT 1 FROM supplements.supplier_product_nutrient_serving_options o
      WHERE o.product_id = NEW.supplement_product_id
    ) THEN
      RAISE EXCEPTION 'C513: supplement snapshot requires an evidenced serving size'
        USING ERRCODE = '23514';
    END IF;
    IF NEW.supplement_nutrient_status <> 'no_nutrients_available'
      OR NEW.supplement_serving_size IS NOT NULL
      OR NEW.enercc IS NOT NULL OR NEW.prot625 IS NOT NULL OR NEW.fat IS NOT NULL
      OR NEW.cho IS NOT NULL OR NEW.fibt IS NOT NULL OR NEW.sugar IS NOT NULL
      OR NEW.fasat IS NOT NULL OR NEW.nacl IS NOT NULL OR NEW.water_g IS NOT NULL
      OR NEW.nutrients <> '{}'::jsonb THEN
      RAISE EXCEPTION 'C513: product without measured nutrients must remain visibly unknown'
        USING ERRCODE = '23514';
    END IF;
    RETURN NEW;
  END IF;

  v_expected_nutrients := jsonb_strip_nulls(jsonb_build_object(
    'ALC', v_option.alc * NEW.supplement_serving_quantity,
    'VITA', v_option.vita_ug * NEW.supplement_serving_quantity,
    'VITD', v_option.vitd_ug * NEW.supplement_serving_quantity,
    'VITE', v_option.vite_mg * NEW.supplement_serving_quantity,
    'VITK', v_option.vitk_ug * NEW.supplement_serving_quantity,
    'VITC', v_option.vitc_mg * NEW.supplement_serving_quantity,
    'THIA', v_option.thia_mg * NEW.supplement_serving_quantity,
    'RIBF', v_option.ribf_mg * NEW.supplement_serving_quantity,
    'NIA', v_option.nia_mg * NEW.supplement_serving_quantity,
    'VITB6', v_option.vitb6_ug * NEW.supplement_serving_quantity,
    'FOL', v_option.fol_ug * NEW.supplement_serving_quantity,
    'VITB12', v_option.vitb12_ug * NEW.supplement_serving_quantity,
    'NA', v_option.na_mg * NEW.supplement_serving_quantity,
    'K', v_option.k_mg * NEW.supplement_serving_quantity,
    'CA', v_option.ca_mg * NEW.supplement_serving_quantity,
    'MG', v_option.mg_mg * NEW.supplement_serving_quantity,
    'P', v_option.p_mg * NEW.supplement_serving_quantity,
    'FE', v_option.fe_mg * NEW.supplement_serving_quantity,
    'ZN', v_option.zn_mg * NEW.supplement_serving_quantity,
    'ID', v_option.id_ug * NEW.supplement_serving_quantity,
    'CU', v_option.cu_ug * NEW.supplement_serving_quantity,
    'MN', v_option.mn_ug * NEW.supplement_serving_quantity
  ));

  IF NEW.supplement_nutrient_status <> 'available'
    OR NEW.enercc IS DISTINCT FROM v_option.enercc * NEW.supplement_serving_quantity
    OR NEW.prot625 IS DISTINCT FROM v_option.prot625 * NEW.supplement_serving_quantity
    OR NEW.fat IS DISTINCT FROM v_option.fat * NEW.supplement_serving_quantity
    OR NEW.cho IS DISTINCT FROM v_option.cho * NEW.supplement_serving_quantity
    OR NEW.fibt IS DISTINCT FROM v_option.fibt * NEW.supplement_serving_quantity
    OR NEW.sugar IS DISTINCT FROM v_option.sugar * NEW.supplement_serving_quantity
    OR NEW.fasat IS DISTINCT FROM v_option.fasat * NEW.supplement_serving_quantity
    OR NEW.nacl IS DISTINCT FROM v_option.nacl * NEW.supplement_serving_quantity
    OR NEW.water_g IS DISTINCT FROM v_option.water_g * NEW.supplement_serving_quantity
    OR NEW.nutrients IS DISTINCT FROM v_expected_nutrients THEN
    RAISE EXCEPTION 'C513: supplement nutrient snapshot differs from its evidenced product serving'
      USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS meal_items_supplement_snapshot_guard_trg ON nutrition.meal_items;
CREATE TRIGGER meal_items_supplement_snapshot_guard_trg
  BEFORE INSERT OR UPDATE OF food_source, supplement_product_id, supplement_serving_size,
    supplement_serving_quantity, supplement_nutrient_status, enercc, prot625, fat, cho,
    fibt, sugar, fasat, nacl, water_g, nutrients
  ON nutrition.meal_items
  FOR EACH ROW EXECUTE FUNCTION nutrition.meal_items_supplement_snapshot_guard();

CREATE FUNCTION nutrition.nutrient_intake_source_breakdown_for_day(
  p_user_id uuid,
  p_entry_date date
)
RETURNS TABLE (
  nutrient_code text,
  nutrient_unit text,
  food_amount numeric,
  food_missing_count integer,
  meal_supplement_amount numeric,
  meal_supplement_missing_count integer,
  meal_supplement_item_count integer,
  stack_supplement_amount numeric,
  stack_taken_log_count integer,
  stack_unmapped_taken_log_count integer,
  supplement_amount numeric
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $function$
  WITH food_items AS (
    SELECT mi.* FROM nutrition.meals m
    JOIN nutrition.meal_items mi ON mi.meal_id = m.id
    WHERE m.user_id = p_user_id AND m.entry_date = p_entry_date
      AND mi.food_source <> 'supplement'
  ), meal_supplement_items AS (
    SELECT mi.* FROM nutrition.meals m
    JOIN nutrition.meal_items mi ON mi.meal_id = m.id
    WHERE m.user_id = p_user_id AND m.entry_date = p_entry_date
      AND mi.food_source = 'supplement'
  ), food_values AS (
    SELECT v.nutrient_code, v.value FROM food_items mi
    CROSS JOIN LATERAL (VALUES
      ('ENERCC', mi.enercc), ('PROT625', mi.prot625), ('FAT', mi.fat), ('CHO', mi.cho),
      ('FIBT', mi.fibt), ('SUGAR', mi.sugar), ('FASAT', mi.fasat), ('NACL', mi.nacl), ('WATER', mi.water_g)
    ) v(nutrient_code, value) WHERE v.value IS NOT NULL
    UNION ALL
    SELECT kv.key, kv.value::numeric FROM food_items mi
    CROSS JOIN LATERAL jsonb_each_text(mi.nutrients) kv(key, value)
    WHERE kv.key NOT IN ('ENERCC','PROT625','FAT','CHO','FIBT','SUGAR','FASAT','NACL','WATER')
      AND kv.value ~ '^-?[0-9]+([.][0-9]+)?$'
  ), meal_supplement_values AS (
    SELECT v.nutrient_code, v.value FROM meal_supplement_items mi
    CROSS JOIN LATERAL (VALUES
      ('ENERCC', mi.enercc), ('PROT625', mi.prot625), ('FAT', mi.fat), ('CHO', mi.cho),
      ('FIBT', mi.fibt), ('SUGAR', mi.sugar), ('FASAT', mi.fasat), ('NACL', mi.nacl), ('WATER', mi.water_g)
    ) v(nutrient_code, value) WHERE v.value IS NOT NULL
    UNION ALL
    SELECT kv.key, kv.value::numeric FROM meal_supplement_items mi
    CROSS JOIN LATERAL jsonb_each_text(mi.nutrients) kv(key, value)
    WHERE kv.key NOT IN ('ENERCC','PROT625','FAT','CHO','FIBT','SUGAR','FASAT','NACL','WATER')
      AND kv.value ~ '^-?[0-9]+([.][0-9]+)?$'
  ), food AS (
    SELECT nutrient_code, sum(value) AS amount, count(*)::integer AS value_count
    FROM food_values GROUP BY nutrient_code
  ), meal_supplement AS (
    SELECT nutrient_code, sum(value) AS amount, count(*)::integer AS value_count
    FROM meal_supplement_values GROUP BY nutrient_code
  ), food_count AS (
    SELECT count(*)::integer AS item_count FROM food_items
  ), meal_supplement_count AS (
    SELECT count(*)::integer AS item_count FROM meal_supplement_items
  ), stack AS (
    SELECT nutrient_code, total_amount, taken_log_count, unmapped_taken_log_count
    FROM supplements.daily_nutrient_summary_long
    WHERE user_id = p_user_id AND entry_date = p_entry_date
  ), stack_count AS (
    SELECT count(*) FILTER (WHERE status = 'taken')::integer AS taken_log_count
    FROM supplements.intake_logs
    WHERE user_id = p_user_id AND intake_date = p_entry_date
  )
  SELECT nd.code, nd.unit,
    f.amount,
    (fc.item_count - coalesce(f.value_count, 0))::integer,
    ms.amount,
    (msc.item_count - coalesce(ms.value_count, 0))::integer,
    msc.item_count,
    s.total_amount,
    coalesce(s.taken_log_count, sc.taken_log_count, 0),
    coalesce(s.unmapped_taken_log_count, sc.taken_log_count, 0),
    CASE WHEN ms.amount IS NULL AND s.total_amount IS NULL THEN NULL
         ELSE coalesce(ms.amount, 0) + coalesce(s.total_amount, 0) END
  FROM nutrition.nutrient_defs nd
  LEFT JOIN food f ON f.nutrient_code = nd.code
  LEFT JOIN meal_supplement ms ON ms.nutrient_code = nd.code
  LEFT JOIN stack s ON s.nutrient_code = nd.code
  CROSS JOIN food_count fc
  CROSS JOIN meal_supplement_count msc
  CROSS JOIN stack_count sc;
$function$;

CREATE OR REPLACE FUNCTION nutrition.nutrient_intake_source_totals_for_day(p_user_id uuid, p_entry_date date)
RETURNS TABLE (nutrient_code text, nutrient_unit text, food_amount numeric, food_missing_count integer, supplement_amount numeric, supplement_taken_log_count integer, supplement_unmapped_taken_log_count integer)
LANGUAGE sql STABLE SECURITY INVOKER SET search_path = '' AS $function$
  SELECT nutrient_code, nutrient_unit, food_amount, food_missing_count, supplement_amount,
    stack_taken_log_count, stack_unmapped_taken_log_count
  FROM nutrition.nutrient_intake_source_breakdown_for_day(p_user_id, p_entry_date);
$function$;

CREATE OR REPLACE FUNCTION nutrition.nutrient_upper_limit_assessment_with_supplements(p_user_id uuid, p_entry_date date)
RETURNS TABLE (nutrient_code text, nutrient_unit text, upper_limit_value numeric, upper_limit_scope text, upper_limit_amount numeric, upper_limit_pct numeric, upper_limit_status text, above_upper_limit boolean, reference_applies_to_intake_sources text[], notes text)
LANGUAGE sql STABLE SECURITY INVOKER SET search_path = '' AS $function$
  WITH refs AS (
    SELECT DISTINCT ON (nutrient_code) * FROM nutrition.daily_reference_assessment(p_user_id,p_entry_date)
    WHERE reference_direction='upper_limit' ORDER BY nutrient_code, reference_value_max DESC
  ), totals AS (
    SELECT * FROM nutrition.nutrient_intake_source_breakdown_for_day(p_user_id,p_entry_date)
  ), base AS (
    SELECT r.*, t.food_amount, t.food_missing_count, t.supplement_amount,
      t.stack_unmapped_taken_log_count, t.meal_supplement_missing_count,
      CASE WHEN r.reference_applies_to_intake_sources @> ARRAY['supplements']::text[]
                 AND NOT r.reference_applies_to_intake_sources @> ARRAY['foods']::text[]
                 AND NOT r.reference_applies_to_intake_sources @> ARRAY['fortified_foods']::text[] THEN 'supplements_only'
           WHEN r.reference_applies_to_intake_sources @> ARRAY['supplements','fortified_foods']::text[]
                 AND NOT r.reference_applies_to_intake_sources @> ARRAY['foods']::text[] THEN 'supplements_plus_fortified_foods_unresolved'
           ELSE 'all_recorded_intake_sources' END AS scope
    FROM refs r JOIN totals t USING (nutrient_code)
  )
  SELECT nutrient_code, nutrient_unit, reference_value_max, scope,
    CASE WHEN scope='supplements_only' AND stack_unmapped_taken_log_count=0 AND meal_supplement_missing_count=0 THEN coalesce(supplement_amount,0)
         WHEN scope='all_recorded_intake_sources' AND food_missing_count=0 AND stack_unmapped_taken_log_count=0 AND meal_supplement_missing_count=0 THEN food_amount + coalesce(supplement_amount,0)
         ELSE NULL END,
    CASE WHEN scope='supplements_only' AND stack_unmapped_taken_log_count=0 AND meal_supplement_missing_count=0 THEN round(coalesce(supplement_amount,0)/nullif(reference_value_max,0)*100,1)
         WHEN scope='all_recorded_intake_sources' AND food_missing_count=0 AND stack_unmapped_taken_log_count=0 AND meal_supplement_missing_count=0 THEN round((food_amount+coalesce(supplement_amount,0))/nullif(reference_value_max,0)*100,1)
         ELSE NULL END,
    CASE WHEN scope='supplements_plus_fortified_foods_unresolved' THEN 'unresolved_fortified_food'
         WHEN stack_unmapped_taken_log_count>0 OR meal_supplement_missing_count>0 THEN 'incomplete_supplements'
         WHEN scope='all_recorded_intake_sources' AND (food_amount IS NULL OR food_missing_count>0) THEN 'incomplete_foods'
         ELSE 'complete' END,
    CASE WHEN scope='supplements_only' AND stack_unmapped_taken_log_count=0 AND meal_supplement_missing_count=0 THEN coalesce(supplement_amount,0)>reference_value_max
         WHEN scope='all_recorded_intake_sources' AND food_missing_count=0 AND stack_unmapped_taken_log_count=0 AND meal_supplement_missing_count=0 THEN food_amount+coalesce(supplement_amount,0)>reference_value_max
         ELSE NULL END,
    reference_applies_to_intake_sources, notes
  FROM base;
$function$;

CREATE OR REPLACE FUNCTION nutrition.micronutrient_snapshot_with_supplements(p_user_id uuid, p_entry_date date)
RETURNS TABLE (display_order integer, nutrient_code text, label_de text, label_en text, nutrient_name_de text, unit text, food_amount numeric, supplement_amount numeric, reference_value numeric, reference_pct numeric, reference_kind text, reference_status text, supplement_status text, source_note text)
LANGUAGE sql STABLE SECURITY INVOKER SET search_path = '' AS $function$
  WITH target AS (
    SELECT *, row_number() OVER (PARTITION BY nutrient_code ORDER BY CASE reference_kind WHEN 'PRI' THEN 1 WHEN 'AI' THEN 2 WHEN 'FORMULA' THEN 3 WHEN 'RI' THEN 4 ELSE 9 END) rn
    FROM nutrition.daily_reference_assessment(p_user_id,p_entry_date) WHERE reference_direction='target'
  ), totals AS (SELECT * FROM nutrition.nutrient_intake_source_breakdown_for_day(p_user_id,p_entry_date))
  SELECT i.display_order,i.nutrient_code,i.label_de,i.label_en,nd.name_de,nd.unit,
    t.food_amount,t.supplement_amount,a.reference_value_min,
    CASE WHEN a.reference_status='complete' AND t.stack_unmapped_taken_log_count=0 AND t.meal_supplement_missing_count=0 THEN round((t.food_amount+coalesce(t.supplement_amount,0))/nullif(a.reference_value_min,0)*100,1) ELSE NULL END,
    a.reference_kind,
    CASE WHEN a.reference_status IS DISTINCT FROM 'complete' THEN coalesce(a.reference_status,'no_food_value')
         WHEN t.stack_unmapped_taken_log_count>0 OR t.meal_supplement_missing_count>0 THEN 'incomplete_supplements' ELSE 'complete' END,
    CASE WHEN t.stack_taken_log_count=0 AND t.meal_supplement_item_count=0 THEN 'no_intake'
         WHEN t.stack_unmapped_taken_log_count>0 OR t.meal_supplement_missing_count>0 THEN 'incomplete'
         WHEN t.supplement_amount IS NULL THEN 'no_mapping_for_nutrient' ELSE 'complete' END,
    i.source_note
  FROM nutrition.micronutrient_overview_items i JOIN nutrition.nutrient_defs nd ON nd.code=i.nutrient_code
  LEFT JOIN target a ON a.nutrient_code=i.nutrient_code AND a.rn=1
  JOIN totals t ON t.nutrient_code=i.nutrient_code ORDER BY i.display_order;
$function$;

CREATE OR REPLACE FUNCTION nutrition.nutrient_intake_detail_for_day(p_user_id uuid, p_entry_date date, p_nutrient_code text)
RETURNS TABLE (source_kind text, source_name text, amount numeric, nutrient_unit text, dose_amount numeric, dose_unit text, supplement_id uuid, product_id uuid, product_name text, upper_limit_scope text, upper_limit_amount numeric, upper_limit_status text)
LANGUAGE sql STABLE SECURITY INVOKER SET search_path = '' AS $function$
  WITH upper_limit AS (SELECT * FROM nutrition.nutrient_upper_limit_assessment_with_supplements(p_user_id,p_entry_date) WHERE nutrient_code=p_nutrient_code),
  food(source_kind, source_name, amount, nutrient_unit, dose_amount, dose_unit, supplement_id, product_id, product_name) AS (
    SELECT 'food'::text, mi.food_name,
      CASE p_nutrient_code WHEN 'ENERCC' THEN mi.enercc WHEN 'PROT625' THEN mi.prot625 WHEN 'FAT' THEN mi.fat WHEN 'CHO' THEN mi.cho WHEN 'FIBT' THEN mi.fibt WHEN 'SUGAR' THEN mi.sugar WHEN 'FASAT' THEN mi.fasat WHEN 'NACL' THEN mi.nacl WHEN 'WATER' THEN mi.water_g ELSE CASE WHEN (mi.nutrients->>p_nutrient_code) ~ '^-?[0-9]+([.][0-9]+)?$' THEN (mi.nutrients->>p_nutrient_code)::numeric END END,
      nd.unit, mi.amount_g, 'g'::text, NULL::uuid, NULL::uuid, NULL::text
    FROM nutrition.meals m JOIN nutrition.meal_items mi ON mi.meal_id=m.id JOIN nutrition.nutrient_defs nd ON nd.code=p_nutrient_code
    WHERE m.user_id=p_user_id AND m.entry_date=p_entry_date AND mi.food_source <> 'supplement'
  ), meal_supplement(source_kind, source_name, amount, nutrient_unit, dose_amount, dose_unit, supplement_id, product_id, product_name) AS (
    SELECT 'meal_supplement'::text, mi.food_name,
      CASE p_nutrient_code WHEN 'ENERCC' THEN mi.enercc WHEN 'PROT625' THEN mi.prot625 WHEN 'FAT' THEN mi.fat WHEN 'CHO' THEN mi.cho WHEN 'FIBT' THEN mi.fibt WHEN 'SUGAR' THEN mi.sugar WHEN 'FASAT' THEN mi.fasat WHEN 'NACL' THEN mi.nacl WHEN 'WATER' THEN mi.water_g ELSE CASE WHEN (mi.nutrients->>p_nutrient_code) ~ '^-?[0-9]+([.][0-9]+)?$' THEN (mi.nutrients->>p_nutrient_code)::numeric END END,
      nd.unit, mi.supplement_serving_quantity, 'serving'::text, NULL::uuid, mi.supplement_product_id, mi.food_name
    FROM nutrition.meals m JOIN nutrition.meal_items mi ON mi.meal_id=m.id JOIN nutrition.nutrient_defs nd ON nd.code=p_nutrient_code
    WHERE m.user_id=p_user_id AND m.entry_date=p_entry_date AND mi.food_source='supplement'
  ), stack_supplement AS (
    SELECT 'supplement'::text, il.supplement_name_snapshot,
      CASE WHEN replace(replace(replace(lower(coalesce(il.actual_dose_unit,il.dose_unit_snapshot)),chr(181),'u'),chr(956),'u'),'mcg','ug')=replace(replace(replace(lower(n.unit_original),chr(181),'u'),chr(956),'u'),'mcg','ug') THEN coalesce(il.actual_dose,il.dose_snapshot)*n.conversion_factor
           WHEN replace(replace(replace(lower(coalesce(il.actual_dose_unit,il.dose_unit_snapshot)),chr(181),'u'),chr(956),'u'),'mcg','ug')=replace(replace(replace(lower(n.unit),chr(181),'u'),chr(956),'u'),'mcg','ug') THEN coalesce(il.actual_dose,il.dose_snapshot) ELSE n.amount_per_serving END,
      nd.unit, coalesce(il.actual_dose,il.dose_snapshot), coalesce(il.actual_dose_unit,il.dose_unit_snapshot), si.supplement_id, sp.id, sp.name_en
    FROM supplements.intake_logs il JOIN supplements.stack_items si ON si.id=il.stack_item_id JOIN supplements.supplement_nutrients n ON n.supplement_id=si.supplement_id
    JOIN nutrition.nutrient_defs nd ON nd.code=n.nutrient_code LEFT JOIN supplements.supplier_products sp ON sp.id=il.supplier_product_id
    WHERE il.user_id=p_user_id AND il.intake_date=p_entry_date AND il.status='taken' AND n.status='bekannt' AND n.nutrient_code=p_nutrient_code
  ), rows AS (SELECT * FROM food UNION ALL SELECT * FROM meal_supplement UNION ALL SELECT * FROM stack_supplement)
  SELECT r.*, u.upper_limit_scope,u.upper_limit_amount,u.upper_limit_status FROM rows r LEFT JOIN upper_limit u ON true WHERE r.amount IS NOT NULL ORDER BY r.source_kind,r.source_name;
$function$;

CREATE FUNCTION nutrition.supplement_product_meal_stack_overlap_candidates_for_day(
  p_user_id uuid,
  p_entry_date date,
  p_window_minutes integer DEFAULT 60
)
RETURNS TABLE (
  meal_id uuid,
  meal_item_id uuid,
  product_id uuid,
  product_name text,
  meal_time time,
  intake_log_id uuid,
  intake_time time,
  time_distance_minutes integer
)
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $function$
BEGIN
  IF p_window_minutes NOT BETWEEN 1 AND 60 THEN
    RAISE EXCEPTION 'C513: overlap window must be between 1 and 60 minutes'
      USING ERRCODE = '22023';
  END IF;
  RETURN QUERY
    SELECT m.id, mi.id, mi.supplement_product_id, mi.food_name, m.meal_time,
      il.id, il.intake_time,
      abs(extract(epoch FROM (m.meal_time - il.intake_time)) / 60)::integer
    FROM nutrition.meals m
    JOIN nutrition.meal_items mi ON mi.meal_id = m.id AND mi.food_source = 'supplement'
    JOIN supplements.intake_logs il
      ON il.user_id = m.user_id
      AND il.intake_date = m.entry_date
      AND il.status = 'taken'
      AND il.supplier_product_id = mi.supplement_product_id
    WHERE m.user_id = p_user_id
      AND m.entry_date = p_entry_date
      AND m.meal_time IS NOT NULL
      AND il.intake_time IS NOT NULL
      AND abs(extract(epoch FROM (m.meal_time - il.intake_time)) / 60) <= p_window_minutes
    ORDER BY m.meal_time, il.intake_time, mi.id, il.id;
END;
$function$;

REVOKE ALL ON FUNCTION nutrition.add_supplement_product_to_meal(uuid,uuid,numeric,text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION nutrition.nutrient_intake_source_breakdown_for_day(uuid,date) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION nutrition.supplement_product_meal_stack_overlap_candidates_for_day(uuid,date,integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION nutrition.add_supplement_product_to_meal(uuid,uuid,numeric,text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION nutrition.nutrient_intake_source_breakdown_for_day(uuid,date) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION nutrition.supplement_product_meal_stack_overlap_candidates_for_day(uuid,date,integer) TO authenticated, service_role;

COMMENT ON FUNCTION nutrition.add_supplement_product_to_meal(uuid,uuid,numeric,text) IS
  'C-513: erstellt einen unveränderlichen Mahlzeiten-Snapshot aus genau einer belegten DSLD-Facts-Portion; Mehrportionen erfordern Auswahl, fehlende Werte bleiben sichtbar.';
COMMENT ON FUNCTION nutrition.nutrient_intake_source_breakdown_for_day(uuid,date) IS
  'C-513: Tageswerte getrennt nach Nahrung, Supplement in Mahlzeit und Stack; supplement_amount ist die Summe beider Supplementquellen.';
COMMENT ON FUNCTION nutrition.supplement_product_meal_stack_overlap_candidates_for_day(uuid,date,integer) IS
  'C-513: UI-Hinweis, keine Entscheidung: nur dieselbe supplier_product_id binnen maximal 60 Minuten.';

COMMIT;
