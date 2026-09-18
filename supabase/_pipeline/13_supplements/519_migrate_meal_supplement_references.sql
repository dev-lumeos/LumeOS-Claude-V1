BEGIN;

-- C-519/E-84: exactly one C-513 meal item exists in the live database. Its
-- historical product label and values become the supplements-owned intake-log
-- snapshot; Nutrition retains only the log reference. The WHERE clause makes
-- the data step safe to repeat.
WITH legacy AS (
  SELECT mi.*, m.entry_date, m.meal_time
  FROM nutrition.meal_items mi
  JOIN nutrition.meals m ON m.id = mi.meal_id
  WHERE mi.food_source = 'supplement'
    AND mi.supplement_product_id IS NOT NULL
    AND mi.supplement_intake_log_id IS NULL
), inserted AS (
  INSERT INTO supplements.intake_logs (
    user_id, stack_item_id, meal_id, intake_date, intake_time, status,
    supplement_name_snapshot, dose_snapshot, dose_unit_snapshot,
    supplier_product_id, supplier_product_serving_size,
    supplier_product_serving_quantity, supplier_product_nutrient_status,
    supplier_product_nutrients_snapshot, measurement_source, source_detail
  )
  SELECT
    l.user_id, NULL, l.meal_id, l.entry_date, l.meal_time, 'taken',
    l.food_name, l.supplement_serving_quantity, 'serving',
    l.supplement_product_id, l.supplement_serving_size,
    l.supplement_serving_quantity, l.supplement_nutrient_status,
    jsonb_strip_nulls(jsonb_build_object(
      'ENERCC', l.enercc, 'PROT625', l.prot625, 'FAT', l.fat,
      'CHO', l.cho, 'FIBT', l.fibt, 'SUGAR', l.sugar,
      'FASAT', l.fasat, 'NACL', l.nacl, 'WATER', l.water_g
    )) || coalesce(l.nutrients, '{}'::jsonb),
    'import', 'C-519: migrated from meal_item ' || l.id::text
  FROM legacy l
  RETURNING id, source_detail
), linked AS (
  UPDATE nutrition.meal_items mi
  SET supplement_intake_log_id = il.id,
      food_name = NULL,
      enercc = NULL, prot625 = NULL, fat = NULL, cho = NULL, fibt = NULL,
      sugar = NULL, fasat = NULL, nacl = NULL, water_g = NULL,
      nutrients = '{}'::jsonb,
      supplement_product_id = NULL,
      supplement_serving_size = NULL,
      supplement_serving_quantity = NULL,
      supplement_nutrient_status = NULL,
      source_detail = 'C-519: supplement intake reference'
  FROM inserted il
  WHERE il.source_detail = 'C-519: migrated from meal_item ' || mi.id::text
  RETURNING mi.id
)
SELECT count(*) AS migrated_meal_item_count FROM linked;

DO $do$
BEGIN
  IF EXISTS (SELECT 1 FROM nutrition.meal_items WHERE food_source='supplement' AND supplement_product_id IS NOT NULL) THEN
    RAISE EXCEPTION 'C519: a legacy meal supplement snapshot remains after migration';
  END IF;
  IF EXISTS (
    SELECT 1 FROM nutrition.meal_items mi
    WHERE mi.food_source='supplement' AND mi.supplement_intake_log_id IS NULL
  ) THEN
    RAISE EXCEPTION 'C519: a meal supplement has no intake-log reference after migration';
  END IF;
END;
$do$;

COMMIT;
