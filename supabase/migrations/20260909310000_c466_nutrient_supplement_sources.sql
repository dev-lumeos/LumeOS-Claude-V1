BEGIN;

-- C-466/E-35: Die Katalogportion allein reicht nicht, wenn ein Log eine
-- abweichende Dosis in seiner Originaleinheit festhaelt. Die beiden Werte
-- stammen wortgetreu aus supplement-naehrstoffcodes.json (C-158).
ALTER TABLE supplements.supplement_nutrients
  ADD COLUMN IF NOT EXISTS amount_original numeric(14,6),
  ADD COLUMN IF NOT EXISTS unit_original text;
ALTER TABLE supplements.supplement_nutrients
  DROP CONSTRAINT IF EXISTS supplement_nutrients_original_amount_unit_ck,
  ADD CONSTRAINT supplement_nutrients_original_amount_unit_ck CHECK (
    (amount_original IS NULL AND unit_original IS NULL)
    OR (amount_original IS NOT NULL AND amount_original > 0 AND btrim(unit_original) <> '')
  );

WITH source_values(slug, nutrient_code, amount_original, unit_original) AS (
  VALUES
    ('biotin','BIOT',5000::numeric,'mcg'), ('calcium','CA',500::numeric,'mg'),
    ('collagen','PROT625',10::numeric,'g'), ('fiber-psyllium-husk','FIBT',5::numeric,'g'),
    ('folate-b9','FOL',400::numeric,'mcg'), ('iron','FE',18::numeric,'mg'),
    ('magnesium','MG',400::numeric,'mg'), ('sub_4480fcfa86','FAPUN3',2::numeric,'g'),
    ('sub_8d8a87d263','GLU',5::numeric,'g'), ('sub_f8dec97a40','GLY',3::numeric,'g'),
    ('vitamin-b12','VITB12',1000::numeric,'mcg'), ('vitamin-b6','VITB6',50::numeric,'mg'),
    ('vitamin-c','VITC',1000::numeric,'mg'), ('vitamin-d3','VITD',5000::numeric,'IU'),
    ('vitamin-k2-mk7','VITK2',200::numeric,'mcg'), ('whey-protein','PROT625',25::numeric,'g'),
    ('zinc','ZN',15::numeric,'mg')
)
UPDATE supplements.supplement_nutrients n
SET amount_original = v.amount_original, unit_original = v.unit_original
FROM source_values v JOIN supplements.supplements s ON s.slug = v.slug
WHERE n.supplement_id = s.id AND n.nutrient_code = v.nutrient_code;

DO $$
BEGIN
  IF (SELECT count(*) FROM supplements.supplement_nutrients WHERE amount_original IS NOT NULL AND unit_original IS NOT NULL) <> 17 THEN
    RAISE EXCEPTION 'C-466: erwartete 17 belegte Originalportionen';
  END IF;
END $$;

COMMENT ON COLUMN supplements.supplement_nutrients.amount_original IS
  'C-466: belegte Katalogportion vor conversion_factor, aus supplement-naehrstoffcodes.json.';
COMMENT ON COLUMN supplements.supplement_nutrients.unit_original IS
  'C-466: Einheit der belegten Katalogportion; erlaubt die Rechnung aus intake_logs ohne Dosisraten.';

-- Ein Produkt ist optional: die Ruecksicht bleibt primaer der Name-/Dosis-
-- Schnappschuss im Log. Der FK ergaenzt ihn nur um die Produktbezeichnung.
ALTER TABLE supplements.intake_logs
  ADD COLUMN IF NOT EXISTS supplier_product_id uuid
    REFERENCES supplements.supplier_products(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS intake_logs_supplier_product_idx
  ON supplements.intake_logs(supplier_product_id) WHERE supplier_product_id IS NOT NULL;
COMMENT ON COLUMN supplements.intake_logs.supplier_product_id IS
  'C-466: optionales C-467-Produkt zur Detailanzeige; supplement_name_snapshot bleibt die historische Einnahmequelle.';

CREATE OR REPLACE VIEW supplements.daily_nutrient_summary_long
WITH (security_invoker = true) AS
WITH logs AS (
  SELECT il.user_id, il.intake_date, il.status,
    coalesce(il.actual_dose, il.dose_snapshot) AS dose_amount,
    coalesce(il.actual_dose_unit, il.dose_unit_snapshot) AS dose_unit,
    si.supplement_id
  FROM supplements.intake_logs il
  LEFT JOIN supplements.stack_items si ON si.id = il.stack_item_id
), mapped AS (
  SELECT l.user_id, l.intake_date, n.nutrient_code, nd.unit AS nutrient_unit,
    CASE
      WHEN replace(replace(replace(lower(l.dose_unit), chr(181), 'u'), chr(956), 'u'), 'mcg', 'ug') =
           replace(replace(replace(lower(n.unit_original), chr(181), 'u'), chr(956), 'u'), 'mcg', 'ug')
        THEN l.dose_amount * n.conversion_factor
      WHEN replace(replace(replace(lower(l.dose_unit), chr(181), 'u'), chr(956), 'u'), 'mcg', 'ug') =
           replace(replace(replace(lower(n.unit), chr(181), 'u'), chr(956), 'u'), 'mcg', 'ug')
        THEN l.dose_amount
      ELSE n.amount_per_serving
    END AS amount
  FROM logs l
  JOIN supplements.supplement_nutrients n ON n.supplement_id = l.supplement_id
  JOIN nutrition.nutrient_defs nd ON nd.code = n.nutrient_code
  WHERE l.status = 'taken' AND n.status = 'bekannt' AND n.amount_per_serving IS NOT NULL
), counts AS (
  SELECT user_id, intake_date,
    count(*) FILTER (WHERE status = 'taken')::integer AS taken_log_count,
    count(*) FILTER (WHERE status = 'skipped')::integer AS skipped_log_count,
    count(*) FILTER (WHERE status = 'taken' AND supplement_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM supplements.supplement_nutrients n WHERE n.supplement_id = logs.supplement_id AND n.status = 'bekannt' AND n.amount_per_serving IS NOT NULL
    ))::integer AS mapped_taken_log_count,
    count(*) FILTER (WHERE status = 'taken' AND NOT (supplement_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM supplements.supplement_nutrients n WHERE n.supplement_id = logs.supplement_id AND n.status = 'bekannt' AND n.amount_per_serving IS NOT NULL
    )))::integer AS unmapped_taken_log_count
  FROM logs GROUP BY user_id, intake_date
)
SELECT m.user_id, m.intake_date AS entry_date, m.nutrient_code, m.nutrient_unit,
  sum(m.amount) AS total_amount, c.taken_log_count, c.skipped_log_count,
  c.mapped_taken_log_count, c.unmapped_taken_log_count
FROM mapped m JOIN counts c USING (user_id, intake_date)
GROUP BY m.user_id, m.intake_date, m.nutrient_code, m.nutrient_unit,
  c.taken_log_count, c.skipped_log_count, c.mapped_taken_log_count, c.unmapped_taken_log_count;
GRANT SELECT ON supplements.daily_nutrient_summary_long TO authenticated, service_role;
COMMENT ON VIEW supplements.daily_nutrient_summary_long IS
  'C-466/E-35: eigene Supplements-Tagesbilanz, nur aus taken intake_logs und belegten supplement_nutrients; keine Nutrition-Zeilen.';

CREATE OR REPLACE FUNCTION supplements.supplement_nutrient_intake_for_day(p_user_id uuid, p_entry_date date DEFAULT current_date)
RETURNS TABLE (user_id uuid, entry_date date, nutrient_code text, nutrient_unit text, total_amount numeric, taken_log_count integer, skipped_log_count integer, mapped_taken_log_count integer, unmapped_taken_log_count integer)
LANGUAGE sql STABLE SECURITY INVOKER SET search_path = '' AS $$
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
$$;
REVOKE ALL ON FUNCTION supplements.supplement_nutrient_intake_for_day(uuid,date) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION supplements.supplement_nutrient_intake_for_day(uuid,date) TO authenticated, service_role;

CREATE FUNCTION nutrition.nutrient_intake_source_totals_for_day(p_user_id uuid, p_entry_date date)
RETURNS TABLE (nutrient_code text, nutrient_unit text, food_amount numeric, food_missing_count integer, supplement_amount numeric, supplement_taken_log_count integer, supplement_unmapped_taken_log_count integer)
LANGUAGE sql STABLE SECURITY INVOKER SET search_path = '' AS $$
  WITH food AS (
    SELECT nutrient_code, nutrient_unit, total_value, missing_count
    FROM nutrition.daily_nutrient_summary_long WHERE user_id=p_user_id AND entry_date=p_entry_date
  ), supp AS (
    SELECT nutrient_code, nutrient_unit, total_amount, taken_log_count, unmapped_taken_log_count
    FROM supplements.daily_nutrient_summary_long WHERE user_id=p_user_id AND entry_date=p_entry_date
  ), counts AS (
    SELECT count(*) FILTER (WHERE status='taken')::integer AS taken_count
    FROM supplements.intake_logs WHERE user_id=p_user_id AND intake_date=p_entry_date
  )
  SELECT nd.code, nd.unit, f.total_value, f.missing_count, s.total_amount,
    coalesce(s.taken_log_count, c.taken_count, 0), coalesce(s.unmapped_taken_log_count, c.taken_count, 0)
  FROM nutrition.nutrient_defs nd
  LEFT JOIN food f ON f.nutrient_code=nd.code
  LEFT JOIN supp s ON s.nutrient_code=nd.code
  CROSS JOIN counts c;
$$;
REVOKE ALL ON FUNCTION nutrition.nutrient_intake_source_totals_for_day(uuid,date) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION nutrition.nutrient_intake_source_totals_for_day(uuid,date) TO authenticated, service_role;

CREATE FUNCTION nutrition.nutrient_upper_limit_assessment_with_supplements(p_user_id uuid, p_entry_date date)
RETURNS TABLE (nutrient_code text, nutrient_unit text, upper_limit_value numeric, upper_limit_scope text, upper_limit_amount numeric, upper_limit_pct numeric, upper_limit_status text, above_upper_limit boolean, reference_applies_to_intake_sources text[], notes text)
LANGUAGE sql STABLE SECURITY INVOKER SET search_path = '' AS $$
  WITH refs AS (
    SELECT DISTINCT ON (nutrient_code) * FROM nutrition.daily_reference_assessment(p_user_id,p_entry_date)
    WHERE reference_direction='upper_limit' ORDER BY nutrient_code, reference_value_max DESC
  ), totals AS (SELECT * FROM nutrition.nutrient_intake_source_totals_for_day(p_user_id,p_entry_date)), base AS (
    SELECT r.*, t.food_amount, t.food_missing_count, t.supplement_amount, t.supplement_unmapped_taken_log_count,
      CASE WHEN r.reference_applies_to_intake_sources @> ARRAY['supplements']::text[]
                 AND NOT r.reference_applies_to_intake_sources @> ARRAY['foods']::text[]
                 AND NOT r.reference_applies_to_intake_sources @> ARRAY['fortified_foods']::text[] THEN 'supplements_only'
           WHEN r.reference_applies_to_intake_sources @> ARRAY['supplements','fortified_foods']::text[]
                 AND NOT r.reference_applies_to_intake_sources @> ARRAY['foods']::text[] THEN 'supplements_plus_fortified_foods_unresolved'
           ELSE 'all_recorded_intake_sources' END AS scope
    FROM refs r JOIN totals t USING (nutrient_code)
  )
  SELECT nutrient_code, nutrient_unit, reference_value_max, scope,
    CASE WHEN scope='supplements_only' AND supplement_unmapped_taken_log_count=0 THEN coalesce(supplement_amount,0)
         WHEN scope='all_recorded_intake_sources' AND food_missing_count=0 AND supplement_unmapped_taken_log_count=0 THEN food_amount + coalesce(supplement_amount,0)
         ELSE NULL END,
    CASE WHEN scope='supplements_only' AND supplement_unmapped_taken_log_count=0 THEN round(coalesce(supplement_amount,0)/nullif(reference_value_max,0)*100,1)
         WHEN scope='all_recorded_intake_sources' AND food_missing_count=0 AND supplement_unmapped_taken_log_count=0 THEN round((food_amount+coalesce(supplement_amount,0))/nullif(reference_value_max,0)*100,1)
         ELSE NULL END,
    CASE WHEN scope='supplements_plus_fortified_foods_unresolved' THEN 'unresolved_fortified_food'
         WHEN supplement_unmapped_taken_log_count>0 THEN 'incomplete_supplements'
         WHEN scope='all_recorded_intake_sources' AND (food_amount IS NULL OR food_missing_count>0) THEN 'incomplete_foods'
         ELSE 'complete' END,
    CASE WHEN scope='supplements_only' AND supplement_unmapped_taken_log_count=0 THEN coalesce(supplement_amount,0)>reference_value_max
         WHEN scope='all_recorded_intake_sources' AND food_missing_count=0 AND supplement_unmapped_taken_log_count=0 THEN food_amount+coalesce(supplement_amount,0)>reference_value_max
         ELSE NULL END,
    reference_applies_to_intake_sources, notes
  FROM base;
$$;
REVOKE ALL ON FUNCTION nutrition.nutrient_upper_limit_assessment_with_supplements(uuid,date) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION nutrition.nutrient_upper_limit_assessment_with_supplements(uuid,date) TO authenticated, service_role;

CREATE FUNCTION nutrition.micronutrient_snapshot_with_supplements(p_user_id uuid, p_entry_date date)
RETURNS TABLE (display_order integer, nutrient_code text, label_de text, label_en text, nutrient_name_de text, unit text, food_amount numeric, supplement_amount numeric, reference_value numeric, reference_pct numeric, reference_kind text, reference_status text, supplement_status text, source_note text)
LANGUAGE sql STABLE SECURITY INVOKER SET search_path = '' AS $$
  WITH target AS (
    SELECT *, row_number() OVER (PARTITION BY nutrient_code ORDER BY CASE reference_kind WHEN 'PRI' THEN 1 WHEN 'AI' THEN 2 WHEN 'FORMULA' THEN 3 WHEN 'RI' THEN 4 ELSE 9 END) rn
    FROM nutrition.daily_reference_assessment(p_user_id,p_entry_date) WHERE reference_direction='target'
  ), totals AS (SELECT * FROM nutrition.nutrient_intake_source_totals_for_day(p_user_id,p_entry_date))
  SELECT i.display_order,i.nutrient_code,i.label_de,i.label_en,nd.name_de,nd.unit,
    t.food_amount,t.supplement_amount,a.reference_value_min,
    CASE WHEN a.reference_status='complete' AND t.supplement_unmapped_taken_log_count=0 THEN round((t.food_amount+coalesce(t.supplement_amount,0))/nullif(a.reference_value_min,0)*100,1) ELSE NULL END,
    a.reference_kind,
    CASE WHEN a.reference_status IS DISTINCT FROM 'complete' THEN coalesce(a.reference_status,'no_food_value')
         WHEN t.supplement_unmapped_taken_log_count>0 THEN 'incomplete_supplements' ELSE 'complete' END,
    CASE WHEN t.supplement_taken_log_count=0 THEN 'no_intake' WHEN t.supplement_unmapped_taken_log_count>0 THEN 'incomplete' WHEN t.supplement_amount IS NULL THEN 'no_mapping_for_nutrient' ELSE 'complete' END,
    i.source_note
  FROM nutrition.micronutrient_overview_items i JOIN nutrition.nutrient_defs nd ON nd.code=i.nutrient_code
  LEFT JOIN target a ON a.nutrient_code=i.nutrient_code AND a.rn=1
  JOIN totals t ON t.nutrient_code=i.nutrient_code ORDER BY i.display_order;
$$;
REVOKE ALL ON FUNCTION nutrition.micronutrient_snapshot_with_supplements(uuid,date) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION nutrition.micronutrient_snapshot_with_supplements(uuid,date) TO authenticated, service_role;

CREATE FUNCTION nutrition.nutrient_intake_detail_for_day(p_user_id uuid, p_entry_date date, p_nutrient_code text)
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
      nd.unit, coalesce(il.actual_dose,il.dose_snapshot), coalesce(il.actual_dose_unit,il.dose_unit_snapshot), si.supplement_id, sp.id, sp.name
    FROM supplements.intake_logs il JOIN supplements.stack_items si ON si.id=il.stack_item_id JOIN supplements.supplement_nutrients n ON n.supplement_id=si.supplement_id
    JOIN nutrition.nutrient_defs nd ON nd.code=n.nutrient_code LEFT JOIN supplements.supplier_products sp ON sp.id=il.supplier_product_id
    WHERE il.user_id=p_user_id AND il.intake_date=p_entry_date AND il.status='taken' AND n.status='bekannt' AND n.nutrient_code=p_nutrient_code
  ), rows AS (SELECT * FROM food UNION ALL SELECT * FROM supplement)
  SELECT r.*, u.upper_limit_scope,u.upper_limit_amount,u.upper_limit_status FROM rows r LEFT JOIN upper_limit u ON true WHERE r.amount IS NOT NULL ORDER BY r.source_kind,r.source_name;
$$;
REVOKE ALL ON FUNCTION nutrition.nutrient_intake_detail_for_day(uuid,date,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION nutrition.nutrient_intake_detail_for_day(uuid,date,text) TO authenticated, service_role;

COMMENT ON FUNCTION nutrition.nutrient_intake_detail_for_day(uuid,date,text) IS
  'C-466: Herkunft je Nährstoffzeile; food_name und supplement_name_snapshot sind historische Quellen, Produkt optional aus C-467.';
COMMIT;
