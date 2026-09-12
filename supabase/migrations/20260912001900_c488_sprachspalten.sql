BEGIN;

ALTER TABLE nutrition.recipes ADD COLUMN name_th text;
ALTER TABLE nutrition.preparation_kinds ADD COLUMN label_en text, ADD COLUMN label_th text;
ALTER TABLE nutrition.tag_definitions ADD COLUMN name_th text;
ALTER TABLE nutrition.micronutrient_overview_items ADD COLUMN label_th text;
ALTER TABLE nutrition.exclusion_presets ADD COLUMN name_th text, ADD COLUMN caveat_en text, ADD COLUMN caveat_th text;
ALTER TABLE nutrition.food_groups ADD COLUMN label_en text, ADD COLUMN label_th text;
DO $$
BEGIN
  IF to_regclass('nutrition.recipe_curation_catalog') IS NOT NULL THEN
    ALTER TABLE nutrition.recipe_curation_catalog ADD COLUMN name_en text, ADD COLUMN name_th text;
  END IF;
END $$;
ALTER TABLE public.koerperflaechen ADD COLUMN name_th text;

ALTER TABLE medical.symptom_biomarker_map
  ADD COLUMN reason_en text, ADD COLUMN reason_th text,
  ADD COLUMN boundary_note_en text, ADD COLUMN boundary_note_th text;
ALTER TABLE medical.biomarker_explanations
  ADD COLUMN common_reasons_high_en jsonb, ADD COLUMN common_reasons_high_th jsonb,
  ADD COLUMN common_reasons_low_en jsonb, ADD COLUMN common_reasons_low_th jsonb,
  ADD COLUMN exercise_effects_en text, ADD COLUMN exercise_effects_th text,
  ADD COLUMN fasting_effects_en text, ADD COLUMN fasting_effects_th text,
  ADD COLUMN important_confounders_en jsonb, ADD COLUMN important_confounders_th jsonb,
  ADD COLUMN interpretation_caveats_en text, ADD COLUMN interpretation_caveats_th text,
  ADD COLUMN major_physiological_role_en text, ADD COLUMN major_physiological_role_th text,
  ADD COLUMN medication_supplement_effects_en text, ADD COLUMN medication_supplement_effects_th text,
  ADD COLUMN time_of_day_effects_en text, ADD COLUMN time_of_day_effects_th text,
  ADD COLUMN what_it_measures_en text, ADD COLUMN what_it_measures_th text;
ALTER TABLE medical.biomarker_spec_enrichment ADD COLUMN name_en text, ADD COLUMN name_th text;

ALTER TABLE training.equipment
  ADD COLUMN name_en text, ADD COLUMN name_th text, ADD COLUMN equipment_group_th text;

ALTER TABLE supplements.rule_catalog ADD COLUMN message_en text, ADD COLUMN message_th text;
ALTER TABLE supplements.supplement_interactions ADD COLUMN description_th text, ADD COLUMN recommendation_th text;
ALTER TABLE supplements.supplement_protocol_templates ADD COLUMN description_en text, ADD COLUMN description_th text;

CREATE OR REPLACE VIEW supplements.supplement_forms_read
WITH (security_invoker = true) AS
SELECT p.id AS parent_id, p.slug AS parent_slug, p.name_de AS parent_name_de,
  p.name_en AS parent_name_en, c.id AS form_id, c.slug AS form_slug,
  c.name_de AS form_name_de, c.name_en AS form_name_en, c.form,
  c.form_note_de, c.form_note_en, c.evidence_grade, c.im_katalog,
  p.name_th AS parent_name_th, c.name_th AS form_name_th, c.form_note_th
FROM supplements.supplements p JOIN supplements.supplements c ON c.parent_id = p.id;

CREATE OR REPLACE VIEW nutrition.daily_nutrient_summary_long
WITH (security_invoker = true) AS
WITH day_base AS (
  SELECT m.user_id, m.entry_date, count(DISTINCT m.id)::integer AS meal_count,
    count(mi.id)::integer AS item_count
  FROM nutrition.meals m LEFT JOIN nutrition.meal_items mi ON mi.meal_id = m.id
  GROUP BY m.user_id, m.entry_date
), item_base AS (
  SELECT m.user_id, m.entry_date, mi.id AS item_id, mi.enercc, mi.prot625,
    mi.fat, mi.cho, mi.fibt, mi.sugar, mi.fasat, mi.nacl, mi.water_g, mi.nutrients
  FROM nutrition.meals m JOIN nutrition.meal_items mi ON mi.meal_id = m.id
), item_values AS (
  SELECT ib.user_id, ib.entry_date, ib.item_id, v.nutrient_code, v.value
  FROM item_base ib CROSS JOIN LATERAL (VALUES
    ('ENERCC', ib.enercc), ('PROT625', ib.prot625), ('FAT', ib.fat), ('CHO', ib.cho),
    ('FIBT', ib.fibt), ('SUGAR', ib.sugar), ('FASAT', ib.fasat), ('NACL', ib.nacl), ('WATER', ib.water_g)
  ) AS v(nutrient_code, value) WHERE v.value IS NOT NULL
  UNION ALL
  SELECT ib.user_id, ib.entry_date, ib.item_id, kv.key, kv.value::numeric
  FROM item_base ib CROSS JOIN LATERAL jsonb_each_text(ib.nutrients) kv(key, value)
  WHERE kv.key <> ALL (ARRAY['ENERCC','PROT625','FAT','CHO','FIBT','SUGAR','FASAT','NACL','WATER'])
    AND kv.value ~ '^-?[0-9]+([.][0-9]+)?$'
), agg AS (
  SELECT user_id, entry_date, nutrient_code, count(*)::integer AS value_count, sum(value) AS total_value
  FROM item_values GROUP BY user_id, entry_date, nutrient_code
)
SELECT db.user_id, db.entry_date, nd.code AS nutrient_code, nd.name_de AS nutrient_name_de,
  nd.unit AS nutrient_unit, nd.group_de, nd.display_tier, nd.sort_index, db.meal_count,
  db.item_count, coalesce(a.value_count, 0)::integer AS value_count,
  (db.item_count - coalesce(a.value_count, 0))::integer AS missing_count, a.total_value,
  (db.item_count > 0 AND db.item_count = coalesce(a.value_count, 0)) AS value_complete,
  nd.name_en AS nutrient_name_en, nd.name_th AS nutrient_name_th,
  nd.group_en, nd.group_th
FROM day_base db CROSS JOIN nutrition.nutrient_defs nd
LEFT JOIN agg a ON a.user_id = db.user_id AND a.entry_date = db.entry_date
  AND a.nutrient_code = nd.code;

COMMENT ON VIEW nutrition.daily_nutrient_summary_long IS
  'C-488: Tagesbilanz mit unveraenderten Werten und durchgereichten name/group-Sprachvarianten aus nutrient_defs.';
COMMENT ON COLUMN public.koerperflaechen.name_th IS
  'C-488: Thai-Anzeigename; bewusst leer bis eine belegte Uebersetzung vorliegt.';
COMMENT ON COLUMN medical.biomarker_explanations.what_it_measures_th IS
  'C-488: Thai-Erklaerungsfeld; bewusst leer bis eine belegte Uebersetzung vorliegt.';

COMMIT;
