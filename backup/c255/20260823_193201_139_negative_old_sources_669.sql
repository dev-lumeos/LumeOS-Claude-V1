-- =============================================================
-- 139 -- Supplements-Neuaufbau Schritt 5: alte Kataloge entfernen
-- Datum: 2026-08-23
-- Zweck:
--   C-255: supplement_catalog, substance_catalog und ihre drei alten
--   Anhaengsel erst nach belegter Uebernahme entfernen.
--
-- Erwartung vor dem Lauf:
--   substance_lab_effects        222 -> supplement_lab_effects 222
--   supplement_nutrient_mappings  17 -> supplement_nutrients 17
--   substance_catalog_sources    668 -> supplement_field_sources +668
--
-- Korrekturblock zum Auftrag:
--   Live lagen 5 Policies und 4 Trigger auf den zu entfernenden alten
--   Tabellen, nicht 2/2. Die vier FKs und die Sicht stimmten.
-- =============================================================

BEGIN;

CREATE OR REPLACE FUNCTION pg_temp.stable_uuid(p_key text)
RETURNS uuid
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT (
    substr(md5(p_key), 1, 8) || '-' ||
    substr(md5(p_key), 9, 4) || '-' ||
    substr(md5(p_key), 13, 4) || '-' ||
    substr(md5(p_key), 17, 4) || '-' ||
    substr(md5(p_key), 21, 12)
  )::uuid;
$$;

DO $$
DECLARE
  v_old_lab integer;
  v_new_lab integer;
  v_lab_missing integer;
  v_old_nutrients integer;
  v_new_nutrients integer;
  v_nutrients_missing integer;
  v_old_sources integer;
  v_sources_unmapped integer;
  v_old_source_rows_in_new integer;
  v_field_sources_before integer;
  v_field_sources_after integer;
BEGIN
  IF to_regclass('supplements.substance_catalog') IS NULL THEN
    -- Schon entfernt: idempotenter Zweitlauf. Die neuen Gegenstuecke
    -- muessen weiter stehen; alte Objekte duerfen nicht zurueckkommen.
    IF to_regclass('supplements.supplement_catalog') IS NOT NULL THEN
      RAISE EXCEPTION 'C-255: supplement_catalog existiert noch, substance_catalog aber nicht';
    END IF;
    IF to_regclass('supplements.substance_lab_effects') IS NOT NULL
       OR to_regclass('supplements.supplement_nutrient_mappings') IS NOT NULL
       OR to_regclass('supplements.substance_catalog_sources') IS NOT NULL
       OR to_regclass('supplements.stack_item_substance_matches') IS NOT NULL THEN
      RAISE EXCEPTION 'C-255: alte Anhaengsel oder Sicht existieren trotz entferntem substance_catalog noch';
    END IF;
    RETURN;
  END IF;

  SELECT count(*) INTO v_old_lab FROM supplements.substance_lab_effects;
  SELECT count(*) INTO v_new_lab FROM supplements.supplement_lab_effects;
  SELECT count(*) INTO v_old_nutrients FROM supplements.supplement_nutrient_mappings;
  SELECT count(*) INTO v_new_nutrients FROM supplements.supplement_nutrients;
  SELECT count(*) INTO v_old_sources FROM supplements.substance_catalog_sources;
  SELECT count(*) INTO v_field_sources_before FROM supplements.supplement_field_sources;

  IF v_old_lab <> 222 THEN RAISE EXCEPTION 'C-255: substance_lab_effects % statt 222', v_old_lab; END IF;
  IF v_new_lab <> 222 THEN RAISE EXCEPTION 'C-255: supplement_lab_effects % statt 222', v_new_lab; END IF;
  IF v_old_nutrients <> 17 THEN RAISE EXCEPTION 'C-255: supplement_nutrient_mappings % statt 17', v_old_nutrients; END IF;
  IF v_new_nutrients <> 17 THEN RAISE EXCEPTION 'C-255: supplement_nutrients % statt 17', v_new_nutrients; END IF;
  IF v_old_sources <> 669 THEN RAISE EXCEPTION 'C-255: substance_catalog_sources % statt 668', v_old_sources; END IF;
  IF v_field_sources_before <> 2147 THEN RAISE EXCEPTION 'C-255: supplement_field_sources vor Quellenuebernahme % statt 2147', v_field_sources_before; END IF;

  SELECT count(*) INTO v_lab_missing
  FROM supplements.substance_lab_effects old
  LEFT JOIN supplements.supplement_lab_effects neu
    ON neu.id = pg_temp.stable_uuid('supplement_lab_effect:' || old.id)
   AND neu.supplement_id = pg_temp.stable_uuid('supplement:' || old.substance_id)
   AND COALESCE(neu.loinc_code, '') = COALESCE(NULLIF(old.loinc_code, ''), '')
   AND COALESCE(neu.effect_type, '') = COALESCE(old.effect_type, '')
   AND COALESCE(neu.direction, '') = COALESCE(NULLIF(old.direction_enum, ''), '')
   AND COALESCE(neu.mechanism_en, '') = COALESCE(NULLIF(old.mechanism, ''), '')
   AND COALESCE(neu.clinical_consequence_en, '') = COALESCE(NULLIF(old.clinical_consequence, ''), '')
   AND COALESCE(neu.evidence, '') = COALESCE(NULLIF(old.evidence, ''), '')
   AND COALESCE(neu.monitoring_link, '') = COALESCE(NULLIF(old.monitoring_link, ''), '')
  WHERE neu.id IS NULL;
  IF v_lab_missing <> 0 THEN
    RAISE EXCEPTION 'C-255: % substance_lab_effects ohne gleichwertige supplement_lab_effects-Zeile', v_lab_missing;
  END IF;

  SELECT count(*) INTO v_nutrients_missing
  FROM supplements.supplement_nutrient_mappings old
  LEFT JOIN supplements.supplement_nutrients neu
    ON neu.id = pg_temp.stable_uuid('supplement_nutrient:' || old.id)
   AND neu.supplement_id = pg_temp.stable_uuid('supplement:' || old.substance_id)
   AND neu.nutrient_code = old.nutrient_code
   AND COALESCE(neu.amount_per_serving, -1) = COALESCE(old.amount_nutrient_unit, -1)
   AND COALESCE(neu.unit, '') = COALESCE(old.nutrient_unit, '')
   AND COALESCE(neu.conversion_factor, -1) = COALESCE(old.conversion_factor, -1)
  WHERE neu.id IS NULL;
  IF v_nutrients_missing <> 0 THEN
    RAISE EXCEPTION 'C-255: % supplement_nutrient_mappings ohne gleichwertige supplement_nutrients-Zeile', v_nutrients_missing;
  END IF;

  SELECT count(*) INTO v_sources_unmapped
  FROM supplements.substance_catalog_sources old
  LEFT JOIN supplements.supplements neu ON neu.slug = old.substance_id
  WHERE neu.id IS NULL;
  IF v_sources_unmapped <> 0 THEN
    RAISE EXCEPTION 'C-255: % substance_catalog_sources ohne supplements.slug-Ziel', v_sources_unmapped;
  END IF;
END $$;

INSERT INTO supplements.supplement_field_sources (
  id, supplement_id, status, field_name, source_id, evidence_class,
  source_note_en
)
SELECT
  pg_temp.stable_uuid('c255:catalog_source:' || old.id::text),
  neu.id,
  'bekannt',
  'catalog_source.' || old.source_catalog || '.' || old.relation,
  COALESCE(NULLIF(old.source_ref, ''), old.source_catalog || ':' || old.source_entity_id),
  NULLIF(old.confidence, ''),
  jsonb_build_object(
    'source_catalog', old.source_catalog,
    'source_entity_id', old.source_entity_id,
    'source_label', old.source_label,
    'relation', old.relation,
    'confidence', old.confidence,
    'source_ref', old.source_ref,
    'field_sources', old.field_sources,
    'raw', old.raw
  )::text
FROM supplements.substance_catalog_sources old
JOIN supplements.supplements neu ON neu.slug = old.substance_id
ON CONFLICT (id) DO NOTHING;

DO $$
DECLARE
  v_old_source_rows_in_new integer;
  v_field_sources_after integer;
BEGIN
  SELECT count(*) INTO v_old_source_rows_in_new
  FROM supplements.supplement_field_sources
  WHERE id IN (
    SELECT pg_temp.stable_uuid('c255:catalog_source:' || id::text)
    FROM supplements.substance_catalog_sources
  );
  SELECT count(*) INTO v_field_sources_after FROM supplements.supplement_field_sources;

  IF v_old_source_rows_in_new <> 668 THEN
    RAISE EXCEPTION 'C-255: alte Quellen in supplement_field_sources % statt 668', v_old_source_rows_in_new;
  END IF;
  IF v_field_sources_after <> 2815 THEN
    RAISE EXCEPTION 'C-255: supplement_field_sources nach Quellenuebernahme % statt 2815', v_field_sources_after;
  END IF;
END $$;

DROP FUNCTION IF EXISTS supplements.supplement_nutrient_intake_for_day(UUID, DATE);

CREATE FUNCTION supplements.supplement_nutrient_intake_for_day(
  p_user_id UUID,
  p_entry_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  user_id UUID,
  entry_date DATE,
  nutrient_code TEXT,
  nutrient_unit TEXT,
  total_amount NUMERIC,
  taken_log_count INTEGER,
  skipped_log_count INTEGER,
  mapped_taken_log_count INTEGER,
  unmapped_taken_log_count INTEGER
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  WITH logs AS (
    SELECT
      il.user_id,
      il.intake_date,
      il.status,
      COALESCE(il.actual_dose, il.dose_snapshot) AS dose_amount,
      COALESCE(il.actual_dose_unit, il.dose_unit_snapshot) AS dose_unit,
      si.supplement_id
    FROM supplements.intake_logs il
    JOIN supplements.stack_items si ON si.id = il.stack_item_id
    JOIN supplements.supplements s ON s.id = si.supplement_id
    WHERE il.user_id = p_user_id
      AND il.intake_date = p_entry_date
  ),
  taken AS (
    SELECT *
    FROM logs
    WHERE status = 'taken'
  ),
  mapped AS (
    SELECT
      t.user_id,
      t.intake_date,
      n.nutrient_code,
      n.unit AS nutrient_unit,
      CASE
        WHEN t.dose_unit = n.unit AND t.dose_amount IS NOT NULL THEN t.dose_amount
        ELSE n.amount_per_serving
      END AS amount
    FROM taken t
    JOIN supplements.supplement_nutrients n ON n.supplement_id = t.supplement_id
    WHERE n.status = 'bekannt'
      AND n.amount_per_serving IS NOT NULL
  ),
  counts AS (
    SELECT
      count(*) FILTER (WHERE status = 'taken')::integer AS taken_count,
      count(*) FILTER (WHERE status = 'skipped')::integer AS skipped_count,
      count(*) FILTER (WHERE status = 'taken' AND EXISTS (
        SELECT 1 FROM supplements.supplement_nutrients n
        WHERE n.supplement_id = logs.supplement_id
          AND n.status = 'bekannt'
          AND n.amount_per_serving IS NOT NULL
      ))::integer AS mapped_taken_count,
      count(*) FILTER (WHERE status = 'taken' AND NOT EXISTS (
        SELECT 1 FROM supplements.supplement_nutrients n
        WHERE n.supplement_id = logs.supplement_id
          AND n.status = 'bekannt'
          AND n.amount_per_serving IS NOT NULL
      ))::integer AS unmapped_taken_count
    FROM logs
  )
  SELECT
    p_user_id,
    p_entry_date,
    m.nutrient_code,
    m.nutrient_unit,
    sum(m.amount) AS total_amount,
    c.taken_count,
    c.skipped_count,
    c.mapped_taken_count,
    c.unmapped_taken_count
  FROM mapped m
  CROSS JOIN counts c
  GROUP BY m.nutrient_code, m.nutrient_unit, c.taken_count, c.skipped_count,
           c.mapped_taken_count, c.unmapped_taken_count
  ORDER BY m.nutrient_code;
$$;

COMMENT ON FUNCTION supplements.supplement_nutrient_intake_for_day(UUID, DATE) IS
  'C-255: Summiert tatsaechlich genommene Supplement-Naehrstoffe aus dem neuen supplements/supplement_nutrients-Pfad; keine Bewertung.';

REVOKE ALL ON FUNCTION supplements.supplement_nutrient_intake_for_day(UUID, DATE) FROM PUBLIC;
REVOKE ALL ON FUNCTION supplements.supplement_nutrient_intake_for_day(UUID, DATE) FROM anon;
GRANT EXECUTE ON FUNCTION supplements.supplement_nutrient_intake_for_day(UUID, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION supplements.supplement_nutrient_intake_for_day(UUID, DATE) TO service_role;

DROP VIEW IF EXISTS supplements.stack_item_substance_matches;

DROP TABLE IF EXISTS supplements.substance_lab_effects;
DROP TABLE IF EXISTS supplements.supplement_nutrient_mappings;
DROP TABLE IF EXISTS supplements.substance_catalog_sources;
DROP TABLE IF EXISTS supplements.supplement_catalog;
DROP TABLE IF EXISTS supplements.substance_catalog;

DO $$
DECLARE
  v_old_tables integer;
  v_old_fks integer;
  v_new_lab integer;
  v_new_nutrients integer;
  v_new_sources integer;
BEGIN
  SELECT count(*) INTO v_old_tables
  FROM (VALUES
    ('supplements.supplement_catalog'),
    ('supplements.substance_catalog'),
    ('supplements.substance_catalog_sources'),
    ('supplements.supplement_nutrient_mappings'),
    ('supplements.substance_lab_effects')
  ) AS expected(reg_name)
  WHERE to_regclass(expected.reg_name) IS NOT NULL;

  SELECT count(*) INTO v_old_fks
  FROM pg_constraint
  WHERE contype = 'f'
    AND confrelid::regclass::text IN (
      'supplements.supplement_catalog',
      'supplements.substance_catalog'
    );

  SELECT count(*) INTO v_new_lab FROM supplements.supplement_lab_effects;
  SELECT count(*) INTO v_new_nutrients FROM supplements.supplement_nutrients;
  SELECT count(*) INTO v_new_sources FROM supplements.supplement_field_sources;

  IF v_old_tables <> 0 THEN RAISE EXCEPTION 'C-255: % alte Tabellen existieren noch', v_old_tables; END IF;
  IF to_regclass('supplements.stack_item_substance_matches') IS NOT NULL THEN
    RAISE EXCEPTION 'C-255: stack_item_substance_matches existiert noch';
  END IF;
  IF v_old_fks <> 0 THEN RAISE EXCEPTION 'C-255: % FKs zeigen noch auf alte Kataloge', v_old_fks; END IF;
  IF v_new_lab <> 222 THEN RAISE EXCEPTION 'C-255: supplement_lab_effects nach Drop % statt 222', v_new_lab; END IF;
  IF v_new_nutrients <> 17 THEN RAISE EXCEPTION 'C-255: supplement_nutrients nach Drop % statt 17', v_new_nutrients; END IF;
  IF v_new_sources <> 2815 THEN RAISE EXCEPTION 'C-255: supplement_field_sources nach Drop % statt 2815', v_new_sources; END IF;
END $$;

COMMIT;
