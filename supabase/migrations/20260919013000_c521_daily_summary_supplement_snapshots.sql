-- C-521: Seit C-519 liegen die Nahrwert-Snapshots von Meal-Supplementen
-- in supplements.intake_logs. Die Tagesansicht muss dieselben Snapshots
-- statt der absichtlich geleerten nutrition.meal_items-Spalten summieren.
BEGIN;

DO $c521$
DECLARE
  v_definition text;
  v_old_source_pattern constant text := E'FROM nutrition\\.meals m\\s+LEFT JOIN nutrition\\.meal_items mi ON mi\\.meal_id = m\\.id';
  v_item_values constant text := $sql$
WITH item_values AS (
  SELECT
    mi.id,
    mi.meal_id,
    CASE WHEN mi.food_source = 'supplement'
      THEN (il.supplier_product_nutrients_snapshot->>'ENERCC')::numeric ELSE mi.enercc END AS enercc,
    CASE WHEN mi.food_source = 'supplement'
      THEN (il.supplier_product_nutrients_snapshot->>'PROT625')::numeric ELSE mi.prot625 END AS prot625,
    CASE WHEN mi.food_source = 'supplement'
      THEN (il.supplier_product_nutrients_snapshot->>'FAT')::numeric ELSE mi.fat END AS fat,
    CASE WHEN mi.food_source = 'supplement'
      THEN (il.supplier_product_nutrients_snapshot->>'CHO')::numeric ELSE mi.cho END AS cho,
    CASE WHEN mi.food_source = 'supplement'
      THEN (il.supplier_product_nutrients_snapshot->>'FIBT')::numeric ELSE mi.fibt END AS fibt,
    CASE WHEN mi.food_source = 'supplement'
      THEN (il.supplier_product_nutrients_snapshot->>'SUGAR')::numeric ELSE mi.sugar END AS sugar,
    CASE WHEN mi.food_source = 'supplement'
      THEN (il.supplier_product_nutrients_snapshot->>'FASAT')::numeric ELSE mi.fasat END AS fasat,
    CASE WHEN mi.food_source = 'supplement'
      THEN (il.supplier_product_nutrients_snapshot->>'NACL')::numeric ELSE mi.nacl END AS nacl,
    CASE WHEN mi.food_source = 'supplement'
      THEN (il.supplier_product_nutrients_snapshot->>'WATER')::numeric ELSE mi.water_g END AS water_g,
    CASE WHEN mi.food_source = 'supplement'
      THEN il.supplier_product_nutrients_snapshot ELSE mi.nutrients END AS nutrients
  FROM nutrition.meal_items mi
  LEFT JOIN supplements.intake_logs il ON il.id = mi.supplement_intake_log_id
)
$sql$;
BEGIN
  SELECT pg_get_viewdef('nutrition.daily_summary'::regclass, true) INTO v_definition;

  IF position('supplier_product_nutrients_snapshot' IN v_definition) > 0 THEN
    RETURN;
  END IF;

  IF v_definition !~ v_old_source_pattern THEN
    RAISE EXCEPTION 'C-521: daily_summary has an unknown source clause; no safe replacement possible';
  END IF;

  EXECUTE 'CREATE OR REPLACE VIEW nutrition.daily_summary '
    || 'WITH (security_invoker = true) AS '
    || v_item_values
    || regexp_replace(v_definition, v_old_source_pattern, 'FROM nutrition.meals m LEFT JOIN item_values mi ON mi.meal_id = m.id');
END
$c521$;

COMMENT ON VIEW nutrition.daily_summary IS
  'Tagessummen aus den eingefrorenen Meal-Werten und C-519-Intake-Snapshots. '
  'security_invoker=true; <wert>_missing zaehlt Positionen ohne gemessenen Wert. '
  'C-521 liest Meal-Supplemente aus supplements.intake_logs, nicht aus den geleerten meal_items-Spalten.';

GRANT SELECT ON nutrition.daily_summary TO authenticated, service_role;

COMMIT;
