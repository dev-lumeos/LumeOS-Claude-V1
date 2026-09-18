BEGIN;

-- This migration is ordered after the C-519 pipeline backfill in kette.json.
-- Keeping the backfill outside migrations satisfies D-17; the assertion turns
-- an accidental direct migration run into a clear, recoverable instruction.
DO $do$
BEGIN
  IF EXISTS (SELECT 1 FROM nutrition.meal_items WHERE supplement_product_id IS NOT NULL) THEN
    RAISE EXCEPTION 'C519: run 519_migrate_meal_supplement_references.sql before removing C-513 meal snapshots';
  END IF;
END;
$do$;

DROP TRIGGER IF EXISTS meal_items_supplement_snapshot_guard_trg ON nutrition.meal_items;
DROP FUNCTION IF EXISTS nutrition.meal_items_supplement_snapshot_guard();
DROP FUNCTION IF EXISTS nutrition.add_supplement_product_to_meal(uuid,uuid,numeric,text);
DROP FUNCTION IF EXISTS nutrition.supplement_product_meal_stack_overlap_candidates_for_day(uuid,date,integer);

ALTER TABLE nutrition.meal_items
  DROP CONSTRAINT IF EXISTS meal_items_supplement_product_id_fkey,
  DROP CONSTRAINT IF EXISTS meal_items_amount_g_check,
  DROP CONSTRAINT IF EXISTS meal_items_source_target_check,
  DROP CONSTRAINT IF EXISTS meal_items_supplement_snapshot_check,
  ADD CONSTRAINT meal_items_amount_g_check CHECK (
    (food_source = 'supplement' AND amount_g IS NULL)
    OR (food_source <> 'supplement' AND amount_g > 0)
  ),
  ADD CONSTRAINT meal_items_source_target_check CHECK (
    (food_source = 'bls' AND food_id IS NOT NULL AND custom_food_id IS NULL
      AND supplement_intake_log_id IS NULL)
    OR (food_source = 'custom' AND food_id IS NULL AND custom_food_id IS NOT NULL
      AND supplement_intake_log_id IS NULL)
    OR (food_source = 'manual' AND food_id IS NULL AND custom_food_id IS NULL
      AND supplement_intake_log_id IS NULL)
    OR (food_source = 'supplement' AND food_id IS NULL AND custom_food_id IS NULL
      AND supplement_intake_log_id IS NOT NULL
      AND food_name IS NULL
      AND enercc IS NULL AND prot625 IS NULL AND fat IS NULL AND cho IS NULL
      AND fibt IS NULL AND sugar IS NULL AND fasat IS NULL AND nacl IS NULL
      AND water_g IS NULL AND nutrients = '{}'::jsonb)
  );

CREATE OR REPLACE FUNCTION nutrition.recipe_nutrition(
  p_recipe_id uuid,
  p_servings numeric DEFAULT NULL
)
RETURNS TABLE (
  recipe_id uuid,
  servings_used numeric,
  ingredient_count integer,
  amount_g numeric,
  enercc numeric,
  prot625 numeric,
  fat numeric,
  cho numeric,
  fibt numeric,
  sugar numeric,
  fasat numeric,
  nacl numeric,
  water_g numeric,
  nutrients jsonb
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $function$
WITH recipe AS (
  SELECT r.id, r.servings, coalesce(p_servings, r.servings) AS servings_used
  FROM nutrition.recipes r WHERE r.id = p_recipe_id
), food_scaled AS (
  SELECT ri.id, ri.recipe_id,
    ri.amount_g * recipe.servings_used / recipe.servings AS amount_g,
    jsonb_strip_nulls(jsonb_build_object(
      'ENERCC', snap.enercc, 'PROT625', snap.prot625, 'FAT', snap.fat,
      'CHO', snap.cho, 'FIBT', snap.fibt, 'SUGAR', snap.sugar,
      'FASAT', snap.fasat, 'NACL', snap.nacl, 'WATER', snap.water_g
    )) || coalesce(snap.nutrients, '{}'::jsonb) AS values_json
  FROM recipe
  JOIN nutrition.recipe_ingredients ri ON ri.recipe_id = recipe.id AND ri.food_source <> 'supplement'
  CROSS JOIN LATERAL nutrition.food_nutrient_snapshot(
    ri.food_source, ri.food_id, ri.custom_food_id,
    ri.amount_g * recipe.servings_used / recipe.servings
  ) snap
), supplement_scaled AS (
  SELECT ri.id, ri.recipe_id, NULL::numeric AS amount_g, snap.nutrients AS values_json
  FROM recipe
  JOIN nutrition.recipe_ingredients ri ON ri.recipe_id = recipe.id AND ri.food_source = 'supplement'
  JOIN supplements.recipe_product_references ref ON ref.recipe_ingredient_id = ri.id
  CROSS JOIN LATERAL supplements.supplier_product_nutrient_snapshot(
    ref.supplier_product_id,
    ref.serving_quantity * recipe.servings_used / recipe.servings,
    ref.serving_size
  ) snap
), scaled AS (
  SELECT * FROM food_scaled UNION ALL SELECT * FROM supplement_scaled
), totals AS (
  SELECT s.recipe_id, kv.key AS nutrient_code, sum(kv.value::numeric) AS amount
  FROM scaled s CROSS JOIN LATERAL jsonb_each_text(s.values_json) kv
  WHERE kv.value ~ '^-?[0-9]+([.][0-9]+)?$'
  GROUP BY s.recipe_id, kv.key
), total_json AS (
  SELECT recipe_id, jsonb_object_agg(nutrient_code, round(amount, 5)) AS values_json
  FROM totals GROUP BY recipe_id
)
SELECT recipe.id, recipe.servings_used, count(scaled.id)::integer, sum(scaled.amount_g),
  (tj.values_json->>'ENERCC')::numeric, (tj.values_json->>'PROT625')::numeric,
  (tj.values_json->>'FAT')::numeric, (tj.values_json->>'CHO')::numeric,
  (tj.values_json->>'FIBT')::numeric, (tj.values_json->>'SUGAR')::numeric,
  (tj.values_json->>'FASAT')::numeric, (tj.values_json->>'NACL')::numeric,
  (tj.values_json->>'WATER')::numeric,
  coalesce(tj.values_json - ARRAY['ENERCC','PROT625','FAT','CHO','FIBT','SUGAR','FASAT','NACL','WATER'], '{}'::jsonb)
FROM recipe
LEFT JOIN scaled ON scaled.recipe_id = recipe.id
LEFT JOIN total_json tj ON tj.recipe_id = recipe.id
GROUP BY recipe.id, recipe.servings_used, tj.values_json;
$function$;

CREATE OR REPLACE VIEW supplements.intake_log_nutrient_values
WITH (security_invoker = true) AS
WITH product_values AS (
  SELECT il.id AS intake_log_id, il.user_id, il.intake_date, il.meal_id,
    'supplier_product'::text AS source_kind, kv.key AS nutrient_code, kv.value::numeric AS amount
  FROM supplements.intake_logs il
  CROSS JOIN LATERAL jsonb_each_text(coalesce(il.supplier_product_nutrients_snapshot, '{}'::jsonb)) kv
  WHERE il.status = 'taken' AND il.supplier_product_id IS NOT NULL
    AND kv.value ~ '^-?[0-9]+([.][0-9]+)?$'
), stack_values AS (
  SELECT il.id AS intake_log_id, il.user_id, il.intake_date, il.meal_id,
    'stack'::text AS source_kind, n.nutrient_code,
    CASE
      WHEN replace(replace(replace(lower(coalesce(il.actual_dose_unit,il.dose_unit_snapshot)),chr(181),'u'),chr(956),'u'),'mcg','ug') =
           replace(replace(replace(lower(n.unit_original),chr(181),'u'),chr(956),'u'),'mcg','ug')
        THEN coalesce(il.actual_dose,il.dose_snapshot)*n.conversion_factor
      WHEN replace(replace(replace(lower(coalesce(il.actual_dose_unit,il.dose_unit_snapshot)),chr(181),'u'),chr(956),'u'),'mcg','ug') =
           replace(replace(replace(lower(n.unit),chr(181),'u'),chr(956),'u'),'mcg','ug')
        THEN coalesce(il.actual_dose,il.dose_snapshot)
      ELSE n.amount_per_serving
    END AS amount
  FROM supplements.intake_logs il
  JOIN supplements.stack_items si ON si.id = il.stack_item_id
  JOIN supplements.supplement_nutrients n ON n.supplement_id = si.supplement_id
  WHERE il.status = 'taken' AND il.supplier_product_nutrients_snapshot IS NULL
    AND n.status = 'bekannt' AND n.amount_per_serving IS NOT NULL
)
SELECT * FROM product_values UNION ALL SELECT * FROM stack_values;
GRANT SELECT ON supplements.intake_log_nutrient_values TO authenticated, service_role;

CREATE OR REPLACE VIEW supplements.daily_nutrient_summary_long
WITH (security_invoker = true) AS
WITH values_by_log AS (
  SELECT * FROM supplements.intake_log_nutrient_values
), totals AS (
  SELECT v.user_id, v.intake_date, v.nutrient_code, nd.unit AS nutrient_unit, sum(v.amount) AS total_amount
  FROM values_by_log v JOIN nutrition.nutrient_defs nd ON nd.code = v.nutrient_code
  GROUP BY v.user_id, v.intake_date, v.nutrient_code, nd.unit
), counts AS (
  SELECT il.user_id, il.intake_date,
    count(*) FILTER (WHERE il.status = 'taken')::integer AS taken_log_count,
    count(*) FILTER (WHERE il.status = 'skipped')::integer AS skipped_log_count,
    count(*) FILTER (WHERE il.status = 'taken' AND EXISTS (
      SELECT 1 FROM values_by_log v WHERE v.intake_log_id = il.id
    ))::integer AS mapped_taken_log_count,
    count(*) FILTER (WHERE il.status = 'taken' AND NOT EXISTS (
      SELECT 1 FROM values_by_log v WHERE v.intake_log_id = il.id
    ))::integer AS unmapped_taken_log_count
  FROM supplements.intake_logs il GROUP BY il.user_id, il.intake_date
)
SELECT t.user_id, t.intake_date AS entry_date, t.nutrient_code, t.nutrient_unit,
  t.total_amount, c.taken_log_count, c.skipped_log_count,
  c.mapped_taken_log_count, c.unmapped_taken_log_count
FROM totals t JOIN counts c USING (user_id, intake_date);
GRANT SELECT ON supplements.daily_nutrient_summary_long TO authenticated, service_role;

CREATE OR REPLACE FUNCTION supplements.supplement_nutrient_intake_for_day(p_user_id uuid, p_entry_date date DEFAULT current_date)
RETURNS TABLE (user_id uuid, entry_date date, nutrient_code text, nutrient_unit text, total_amount numeric, taken_log_count integer, skipped_log_count integer, mapped_taken_log_count integer, unmapped_taken_log_count integer)
LANGUAGE sql STABLE SECURITY INVOKER SET search_path = '' AS $function$
  WITH counts AS (
    SELECT count(*) FILTER (WHERE status='taken')::integer AS taken_log_count,
      count(*) FILTER (WHERE status='skipped')::integer AS skipped_log_count
    FROM supplements.intake_logs WHERE user_id=p_user_id AND intake_date=p_entry_date
  ), rows AS (
    SELECT * FROM supplements.daily_nutrient_summary_long WHERE user_id=p_user_id AND entry_date=p_entry_date
  )
  SELECT * FROM rows
  UNION ALL
  SELECT p_user_id, p_entry_date, NULL::text, NULL::text, NULL::numeric,
    c.taken_log_count, c.skipped_log_count, 0, c.taken_log_count
  FROM counts c WHERE NOT EXISTS (SELECT 1 FROM rows);
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
    ms.amount,(mc.item_count-coalesce(ms.value_count,0))::integer,mc.item_count,
    ss.amount,sc.taken_log_count,sc.unmapped_count,
    CASE WHEN ms.amount IS NULL AND ss.amount IS NULL THEN NULL ELSE coalesce(ms.amount,0)+coalesce(ss.amount,0) END
  FROM nutrition.nutrient_defs nd
  LEFT JOIN food f ON f.nutrient_code=nd.code
  LEFT JOIN meal_totals ms ON ms.nutrient_code=nd.code
  LEFT JOIN stack_totals ss ON ss.nutrient_code=nd.code
  CROSS JOIN food_count fc CROSS JOIN meal_count mc CROSS JOIN stack_count sc;
$function$;

CREATE OR REPLACE FUNCTION nutrition.nutrient_intake_source_totals_for_day(p_user_id uuid, p_entry_date date)
RETURNS TABLE (nutrient_code text, nutrient_unit text, food_amount numeric, food_missing_count integer, supplement_amount numeric, supplement_taken_log_count integer, supplement_unmapped_taken_log_count integer)
LANGUAGE sql STABLE SECURITY INVOKER SET search_path = '' AS $function$
  SELECT nutrient_code,nutrient_unit,food_amount,food_missing_count,supplement_amount,
    stack_taken_log_count + meal_supplement_item_count,
    stack_unmapped_taken_log_count + meal_supplement_missing_count
  FROM nutrition.nutrient_intake_source_breakdown_for_day(p_user_id,p_entry_date);
$function$;

CREATE OR REPLACE FUNCTION nutrition.nutrient_intake_detail_for_day(p_user_id uuid, p_entry_date date, p_nutrient_code text)
RETURNS TABLE (source_kind text, source_name text, amount numeric, nutrient_unit text, dose_amount numeric, dose_unit text, supplement_id uuid, product_id uuid, product_name text, upper_limit_scope text, upper_limit_amount numeric, upper_limit_status text)
LANGUAGE sql STABLE SECURITY INVOKER SET search_path = '' AS $function$
  WITH upper_limit AS (
    SELECT * FROM nutrition.nutrient_upper_limit_assessment_with_supplements(p_user_id,p_entry_date)
    WHERE nutrient_code=p_nutrient_code
  ), food(source_kind,source_name,amount,nutrient_unit,dose_amount,dose_unit,supplement_id,product_id,product_name) AS (
    SELECT 'food'::text,mi.food_name,
      CASE p_nutrient_code WHEN 'ENERCC' THEN mi.enercc WHEN 'PROT625' THEN mi.prot625 WHEN 'FAT' THEN mi.fat
        WHEN 'CHO' THEN mi.cho WHEN 'FIBT' THEN mi.fibt WHEN 'SUGAR' THEN mi.sugar WHEN 'FASAT' THEN mi.fasat
        WHEN 'NACL' THEN mi.nacl WHEN 'WATER' THEN mi.water_g
        ELSE CASE WHEN (mi.nutrients->>p_nutrient_code) ~ '^-?[0-9]+([.][0-9]+)?$' THEN (mi.nutrients->>p_nutrient_code)::numeric END END,
      nd.unit,mi.amount_g,'g'::text,NULL::uuid,NULL::uuid,NULL::text
    FROM nutrition.meals m JOIN nutrition.meal_items mi ON mi.meal_id=m.id
    JOIN nutrition.nutrient_defs nd ON nd.code=p_nutrient_code
    WHERE m.user_id=p_user_id AND m.entry_date=p_entry_date AND mi.food_source <> 'supplement'
  ), supplement(source_kind,source_name,amount,nutrient_unit,dose_amount,dose_unit,supplement_id,product_id,product_name) AS (
    SELECT CASE WHEN il.meal_id IS NULL THEN 'supplement'::text ELSE 'meal_supplement'::text END,
      il.supplement_name_snapshot,v.amount,nd.unit,
      coalesce(il.supplier_product_serving_quantity,il.actual_dose,il.dose_snapshot),
      coalesce(il.supplier_product_serving_size,il.actual_dose_unit,il.dose_unit_snapshot),
      si.supplement_id,il.supplier_product_id,il.supplement_name_snapshot
    FROM supplements.intake_log_nutrient_values v
    JOIN supplements.intake_logs il ON il.id=v.intake_log_id
    LEFT JOIN supplements.stack_items si ON si.id=il.stack_item_id
    JOIN nutrition.nutrient_defs nd ON nd.code=v.nutrient_code
    WHERE il.user_id=p_user_id AND il.intake_date=p_entry_date AND v.nutrient_code=p_nutrient_code
  ), rows AS (SELECT * FROM food UNION ALL SELECT * FROM supplement)
  SELECT r.*,u.upper_limit_scope,u.upper_limit_amount,u.upper_limit_status
  FROM rows r LEFT JOIN upper_limit u ON true WHERE r.amount IS NOT NULL
  ORDER BY r.source_kind,r.source_name;
$function$;

ALTER TABLE nutrition.meal_items
  DROP COLUMN IF EXISTS supplement_product_id,
  DROP COLUMN IF EXISTS supplement_serving_size,
  DROP COLUMN IF EXISTS supplement_serving_quantity,
  DROP COLUMN IF EXISTS supplement_nutrient_status;
DROP INDEX IF EXISTS nutrition.meal_items_supplement_product_idx;

REVOKE ALL ON FUNCTION nutrition.nutrient_intake_source_breakdown_for_day(uuid,date) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION nutrition.nutrient_intake_source_totals_for_day(uuid,date) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION supplements.supplement_nutrient_intake_for_day(uuid,date) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION nutrition.nutrient_intake_source_breakdown_for_day(uuid,date) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION nutrition.nutrient_intake_source_totals_for_day(uuid,date) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION supplements.supplement_nutrient_intake_for_day(uuid,date) TO authenticated, service_role;

COMMENT ON TABLE supplements.recipe_product_references IS
  'C-519/E-84: Rezeptpositionen verweisen im Supplements-Schema auf Katalogprodukte; Nutrition speichert keinen Produktdatensatz.';
COMMENT ON FUNCTION supplements.record_supplier_product_intake(uuid,date,time,numeric,text,uuid) IS
  'C-519: erstellt eine Produkt-Einnahme samt historischem Supplements-Snapshot; bei meal_id wird nur ein Nutrition-Verweis erzeugt.';
COMMENT ON FUNCTION nutrition.recipe_nutrition(uuid,numeric) IS
  'C-519: Rezeptwerte lesen Lebensmittel aus Nutrition und Supplement-Referenzen aus Supplements; ein Rezept ist kein Einnahmesnapshot.';

COMMIT;
