-- =============================================================
-- 137 -- Supplements-Neuaufbau: Zieltabellen befuellen (C-235)
-- Datum: 2026-08-23
-- Zweck: Die in 136 angelegten Zieltabellen aus den bestehenden
--        Supplements-Quellen befuellen. Kein Umhaengen von stack_items,
--        kein Loeschen alter Tabellen, keine Lesepfade.
--
-- Quelle: docs/specs/Supplements/SCHEMA_NEUAUFBAU.md, Abschnitt 8.
--
-- Entscheidung zu 276 Nicht-Kimi-Zeilen:
-- dosing, pharmacology und evidence erhalten fuer alle 566 Substanzen
-- eine Zeile. Die 276 F-05/LumeOS-Zeilen tragen dort status='unbekannt',
-- weil die Frage im Zielschema gestellt wird, aber kein Kimi-Satz dahinter
-- liegt. Safety, Regulatory, Warnings, Quality, Monitoring und Organrisiken
-- werden nur fuer die 290 Kimi-Zeilen befuellt; dort ist die Quelle gefragt.
--
-- Befund zu supplement_interactions:
-- Die vorhandene Huelle aus Schritt 130 zeigte noch auf supplement_catalog
-- und hatte supplement1_name/supplement2_name. Damit waere C-235
-- ("Namensspalten nicht mitnehmen") nicht erfuellbar. Dieser Schritt zieht
-- die leere Huelle auf supplement_id + partner_type/partner_label.
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

CREATE OR REPLACE FUNCTION pg_temp.info_status(p_value jsonb)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN p_value IS NULL THEN 'unbekannt'
    WHEN p_value IN ('{}'::jsonb, '[]'::jsonb, 'null'::jsonb) THEN 'unbekannt'
    WHEN jsonb_typeof(p_value) = 'string'
      AND btrim(p_value #>> '{}') IN ('', 'unknown', 'Unknown', 'UNKNOWN') THEN 'unbekannt'
    ELSE 'bekannt'
  END;
$$;

ALTER TABLE supplements.supplement_interactions
  DROP CONSTRAINT IF EXISTS supplement_interactions_check,
  DROP CONSTRAINT IF EXISTS supplement_interactions_supplement1_id_fkey,
  DROP CONSTRAINT IF EXISTS supplement_interactions_supplement2_id_fkey;

ALTER TABLE supplements.supplement_interactions
  DROP COLUMN IF EXISTS supplement1_id,
  DROP COLUMN IF EXISTS supplement1_name,
  DROP COLUMN IF EXISTS supplement2_id,
  DROP COLUMN IF EXISTS supplement2_name,
  ADD COLUMN IF NOT EXISTS supplement_id UUID REFERENCES supplements.supplements(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS partner_type TEXT,
  ADD COLUMN IF NOT EXISTS partner_label TEXT,
  ADD COLUMN IF NOT EXISTS mechanism TEXT,
  ADD COLUMN IF NOT EXISTS direction TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'bekannt'
    CHECK (status IN ('bekannt','unbekannt','nicht_zutreffend'));

ALTER TABLE supplements.supplement_interactions
  DROP CONSTRAINT IF EXISTS supplement_interactions_partner_type_check;
ALTER TABLE supplements.supplement_interactions
  ADD CONSTRAINT supplement_interactions_partner_type_check
  CHECK (partner_type IS NULL OR partner_type IN ('supplement','drug','food','alcohol','disease'));

CREATE INDEX IF NOT EXISTS idx_supplement_interactions_supplement
  ON supplements.supplement_interactions(supplement_id);
CREATE INDEX IF NOT EXISTS idx_supplement_interactions_partner_type
  ON supplements.supplement_interactions(partner_type);

ALTER TABLE supplements.supplement_lab_effects
  ALTER COLUMN lab_marker_id TYPE TEXT USING lab_marker_id::text;
ALTER TABLE supplements.supplement_monitoring
  ALTER COLUMN lab_marker_id TYPE TEXT USING lab_marker_id::text;

TRUNCATE
  supplements.supplement_field_sources,
  supplements.supplement_nutrients,
  supplements.supplement_monitoring,
  supplements.supplement_lab_effects,
  supplements.supplement_identifiers,
  supplements.supplement_regulatory,
  supplements.supplement_organ_risks,
  supplements.supplement_wada,
  supplements.supplement_evidence,
  supplements.supplement_warnings,
  supplements.supplement_quality,
  supplements.supplement_safety,
  supplements.supplement_pharmacology,
  supplements.supplement_dosing,
  supplements.supplement_portions,
  supplements.supplement_tags,
  supplements.supplement_aliases,
  supplements.supplement_interactions,
  supplements.supplements,
  supplements.supplement_categories,
  supplements.supplement_groups
RESTART IDENTITY CASCADE;

INSERT INTO supplements.supplement_groups (id, code, label_de, label_en, label_th, sort_order, is_active)
VALUES
  (pg_temp.stable_uuid('supplement_group:supplement'), 'supplement', 'Supplement', 'Supplement', NULL, 10, true),
  (pg_temp.stable_uuid('supplement_group:enhanced'), 'enhanced', 'Enhanced', 'Enhanced', NULL, 20, true),
  (pg_temp.stable_uuid('supplement_group:peptide'), 'peptide', 'Peptid', 'Peptide', NULL, 30, true);

INSERT INTO supplements.supplement_categories (id, slug, group_id, name_de, name_en, name_th, sort_order, is_active)
SELECT
  pg_temp.stable_uuid('supplement_category:' || gruppe || ':' || filter),
  filter,
  pg_temp.stable_uuid('supplement_group:' || gruppe),
  NULL,
  filter,
  NULL,
  dense_rank() OVER (PARTITION BY gruppe ORDER BY filter),
  true
FROM supplements.substance_catalog
GROUP BY gruppe, filter;

INSERT INTO supplements.supplements (
  id, slug, group_id, category_id, name_de, name_en, name_th,
  description_de, description_en, description_th, form, evidence_grade,
  source, is_active
)
SELECT
  pg_temp.stable_uuid('supplement:' || sc.id),
  sc.id,
  pg_temp.stable_uuid('supplement_group:' || sc.gruppe),
  pg_temp.stable_uuid('supplement_category:' || sc.gruppe || ':' || sc.filter),
  NULL,
  sc.canonical_name,
  NULL,
  NULL,
  NULLIF(sc.description, ''),
  NULL,
  NULLIF(sc.chemical_form, ''),
  CASE WHEN sc.evidence->>'overall_grade' IN ('S','A','B','C','D','F') THEN sc.evidence->>'overall_grade' ELSE NULL END,
  sc.source_primary,
  sc.is_active
FROM supplements.substance_catalog sc;

INSERT INTO supplements.supplement_aliases (id, supplement_id, alias, locale, source, confidence)
SELECT
  pg_temp.stable_uuid('supplement_alias:' || sa.id),
  pg_temp.stable_uuid('supplement:' || COALESCE(sc.id, src.substance_id)),
  sa.alias,
  NULLIF(sa.raw->>'locale', ''),
  sa.source,
  NULL
FROM supplements.substance_aliases sa
LEFT JOIN supplements.substance_catalog sc ON sc.id = sa.entity_id
LEFT JOIN supplements.substance_catalog_sources src
  ON src.source_entity_id = sa.entity_id
 AND src.source_catalog = CASE sa.source
   WHEN 'f05_substance_catalog' THEN 'f05_substance_candidate'
   WHEN 'lumeos_supplement_catalog' THEN 'lumeos_supplement_catalog'
   ELSE sa.source
 END
WHERE btrim(sa.alias) <> ''
  AND COALESCE(sc.id, src.substance_id) IS NOT NULL;

INSERT INTO supplements.supplement_lab_effects (
  id, supplement_id, status, lab_marker_id, loinc_code, effect_type,
  analyte_de, analyte_en, analyte_th, direction,
  mechanism_de, mechanism_en, mechanism_th,
  clinical_consequence_de, clinical_consequence_en, clinical_consequence_th,
  evidence, monitoring_link, source
)
SELECT
  pg_temp.stable_uuid('supplement_lab_effect:' || sle.id),
  pg_temp.stable_uuid('supplement:' || sle.substance_id),
  CASE WHEN sle.mapping_status = 'effect_without_marker_id' THEN 'unbekannt' ELSE 'bekannt' END,
  lm.marker_id,
  NULLIF(sle.loinc_code, ''),
  sle.effect_type,
  NULL,
  sle.raw->>'analyte',
  NULL,
  NULLIF(sle.direction_enum, ''),
  NULL,
  NULLIF(sle.mechanism, ''),
  NULL,
  NULL,
  NULLIF(sle.clinical_consequence, ''),
  NULL,
  NULLIF(sle.evidence, ''),
  NULLIF(sle.monitoring_link, ''),
  COALESCE(NULLIF(sle.source, ''), 'c235_substance_lab_effects')
FROM supplements.substance_lab_effects sle
JOIN supplements.substance_catalog sc ON sc.id = sle.substance_id
LEFT JOIN medical.lab_marker_catalog lm ON lm.marker_id = NULLIF(sle.lab_marker_id, '');

INSERT INTO supplements.supplement_nutrients (
  id, supplement_id, status, nutrient_code, amount_per_serving, unit,
  conversion_factor, source
)
SELECT
  pg_temp.stable_uuid('supplement_nutrient:' || snm.id),
  pg_temp.stable_uuid('supplement:' || snm.substance_id),
  'bekannt',
  snm.nutrient_code,
  snm.amount_nutrient_unit,
  snm.nutrient_unit,
  snm.conversion_factor,
  snm.source
FROM supplements.supplement_nutrient_mappings snm
JOIN supplements.substance_catalog sc ON sc.id = snm.substance_id;

WITH kimi AS (
  SELECT * FROM supplements.substance_catalog
  WHERE source_primary IN ('kimi_supplement','kimi_performance','kimi_peptide')
)
INSERT INTO supplements.supplement_safety (
  id, supplement_id, status, pregnancy_status, pregnancy_note_en, lactation_status,
  common_side_effects_en, serious_side_effects_en, contraindications_en, source
)
SELECT
  pg_temp.stable_uuid('supplement_safety:' || id),
  pg_temp.stable_uuid('supplement:' || id),
  CASE
    WHEN safety IS NULL OR safety = '{}'::jsonb THEN 'unbekannt'
    WHEN COALESCE(NULLIF(safety#>>'{pregnancy,status}', ''), 'unknown') = 'unknown'
      AND COALESCE(NULLIF(safety#>>'{pregnancy,note}', ''), '') = ''
      AND COALESCE(jsonb_array_length(COALESCE(safety->'common_side_effects','[]'::jsonb)),0) = 0
      AND COALESCE(jsonb_array_length(COALESCE(safety->'serious_side_effects','[]'::jsonb)),0) = 0
      AND COALESCE(jsonb_array_length(COALESCE(safety->'contraindications','[]'::jsonb)),0) = 0
    THEN 'unbekannt'
    ELSE 'bekannt'
  END,
  NULLIF(safety#>>'{pregnancy,status}', ''),
  NULLIF(safety#>>'{pregnancy,note}', ''),
  NULLIF(safety#>>'{pregnancy,lactation}', ''),
  ARRAY(SELECT jsonb_array_elements_text(COALESCE(safety->'common_side_effects','[]'::jsonb))),
  ARRAY(SELECT jsonb_array_elements_text(COALESCE(safety->'serious_side_effects','[]'::jsonb))),
  ARRAY(SELECT jsonb_array_elements_text(COALESCE(safety->'contraindications','[]'::jsonb))),
  source_primary
FROM kimi;

WITH source_rows AS (
  SELECT * FROM supplements.substance_catalog
)
INSERT INTO supplements.supplement_dosing (
  id, supplement_id, status, official_label_dose, guideline_dose,
  studied_dose_ranges, anecdotal_dose_ranges, upper_limit, dose_unit,
  usage_hint_en, source
)
SELECT
  pg_temp.stable_uuid('supplement_dosing:' || id),
  pg_temp.stable_uuid('supplement:' || id),
  CASE WHEN source_primary IN ('kimi_supplement','kimi_performance','kimi_peptide')
    AND dosing IS NOT NULL AND dosing <> '{}'::jsonb THEN 'bekannt' ELSE 'unbekannt' END,
  official_label_dose,
  guideline_dose,
  studied_dose_ranges,
  anecdotal_dose_ranges,
  tolerable_upper_intake_level,
  NULLIF(dosing->>'dose_units', ''),
  NULLIF(dosing->>'comments', ''),
  source_primary
FROM source_rows;

INSERT INTO supplements.supplement_pharmacology (
  id, supplement_id, status, route, half_life,
  metabolism_en, bioavailability, time_to_peak, duration_of_action,
  elimination_en, source
)
SELECT
  pg_temp.stable_uuid('supplement_pharmacology:' || id),
  pg_temp.stable_uuid('supplement:' || id),
  CASE WHEN source_primary IN ('kimi_supplement','kimi_performance','kimi_peptide')
    AND pharmacology IS NOT NULL AND pharmacology <> '{}'::jsonb THEN 'bekannt' ELSE 'unbekannt' END,
  array_to_string(canonical_routes, ','),
  half_life,
  NULLIF(pharmacology->>'metabolism', ''),
  pharmacology->'bioavailability',
  pharmacology->'time_to_peak',
  pharmacology->'duration_of_action',
  NULLIF(pharmacology->>'elimination', ''),
  source_primary
FROM supplements.substance_catalog;

INSERT INTO supplements.supplement_evidence (
  id, supplement_id, status, overall_grade, summary_en, human_trials,
  randomized_trials, meta_analyses, animal_only, in_vitro_only, source
)
SELECT
  pg_temp.stable_uuid('supplement_evidence:' || id),
  pg_temp.stable_uuid('supplement:' || id),
  CASE WHEN evidence IS NOT NULL AND evidence <> '{}'::jsonb THEN 'bekannt' ELSE 'unbekannt' END,
  CASE WHEN evidence->>'overall_grade' IN ('S','A','B','C','D','F') THEN evidence->>'overall_grade' ELSE NULL END,
  NULLIF(evidence->>'summary', ''),
  NULLIF(evidence->>'human_trials', '')::integer,
  NULLIF(evidence->>'randomized_trials', '')::integer,
  NULLIF(evidence->>'meta_analyses', '')::integer,
  NULLIF(evidence->>'animal_only', '')::boolean,
  NULLIF(evidence->>'in_vitro_only', '')::boolean,
  source_primary
FROM supplements.substance_catalog;

WITH kimi AS (
  SELECT * FROM supplements.substance_catalog
  WHERE source_primary IN ('kimi_supplement','kimi_performance','kimi_peptide')
)
INSERT INTO supplements.supplement_warnings (
  id, supplement_id, status, dose_ceiling, doctor_consult_flags,
  no_ceiling_reason_en, warning_en, source
)
SELECT
  pg_temp.stable_uuid('supplement_warnings:' || id),
  pg_temp.stable_uuid('supplement:' || id),
  CASE WHEN warning_triggers IS NOT NULL AND warning_triggers <> '{}'::jsonb THEN 'bekannt' ELSE 'unbekannt' END,
  warning_triggers->'dose_ceiling',
  ARRAY(SELECT jsonb_array_elements_text(COALESCE(warning_triggers->'doctor_consult_flags','[]'::jsonb))),
  NULLIF(warning_triggers->>'no_ceiling_reason', ''),
  NULL,
  source_primary
FROM kimi;

WITH kimi AS (
  SELECT * FROM supplements.substance_catalog
  WHERE source_primary IN ('kimi_supplement','kimi_performance','kimi_peptide')
    AND quality IS NOT NULL
)
INSERT INTO supplements.supplement_quality (
  id, supplement_id, status, counterfeit_risk, contamination_risk,
  purity_considerations_en, storage_en, light_sensitive,
  temperature_sensitive, stability_en, source
)
SELECT
  pg_temp.stable_uuid('supplement_quality:' || id),
  pg_temp.stable_uuid('supplement:' || id),
  CASE WHEN quality = '{}'::jsonb THEN 'unbekannt' ELSE 'bekannt' END,
  NULLIF(quality->>'counterfeit_risk', ''),
  NULLIF(quality->>'contamination_risk', ''),
  NULLIF(quality->>'purity_considerations', ''),
  NULLIF(quality->>'storage', ''),
  NULLIF(quality->>'light_sensitive', '')::boolean,
  NULLIF(quality->>'temperature_sensitive', '')::boolean,
  NULLIF(quality->>'stability', ''),
  source_primary
FROM kimi;

WITH kimi AS (
  SELECT * FROM supplements.substance_catalog
  WHERE source_primary IN ('kimi_supplement','kimi_performance','kimi_peptide')
)
INSERT INTO supplements.supplement_wada (
  id, supplement_id, status, wada_status, wada_category, note_en, source
)
SELECT
  pg_temp.stable_uuid('supplement_wada:' || id),
  pg_temp.stable_uuid('supplement:' || id),
  pg_temp.info_status(to_jsonb(wada_status)),
  NULLIF(wada_status, ''),
  NULLIF(regulatory->>'wada_category', ''),
  NULL,
  source_primary
FROM kimi;

WITH kimi AS (
  SELECT * FROM supplements.substance_catalog
  WHERE source_primary IN ('kimi_supplement','kimi_performance','kimi_peptide')
), organs AS (
  SELECT id, source_primary, 'kidney' organ, safety->'kidney_considerations' value FROM kimi UNION ALL
  SELECT id, source_primary, 'liver', safety->'liver_considerations' FROM kimi UNION ALL
  SELECT id, source_primary, 'cardiovascular', safety->'cardiovascular_considerations' FROM kimi UNION ALL
  SELECT id, source_primary, 'endocrine', safety->'endocrine_considerations' FROM kimi UNION ALL
  SELECT id, source_primary, 'neurological', safety->'neurological_considerations' FROM kimi
)
INSERT INTO supplements.supplement_organ_risks (
  id, supplement_id, status, organ, risk_level, mechanism_en, note_en, source
)
SELECT
  pg_temp.stable_uuid('supplement_organ_risk:' || id || ':' || organ),
  pg_temp.stable_uuid('supplement:' || id),
  CASE WHEN value IS NULL OR value = '[]'::jsonb THEN 'unbekannt' ELSE 'bekannt' END,
  organ,
  CASE WHEN value IS NULL OR value = '[]'::jsonb THEN 'unknown' ELSE 'noted' END,
  CASE WHEN value IS NULL OR value = '[]'::jsonb THEN NULL ELSE value::text END,
  NULL,
  source_primary
FROM organs;

WITH kimi AS (
  SELECT * FROM supplements.substance_catalog
  WHERE source_primary IN ('kimi_supplement','kimi_performance','kimi_peptide')
), ids AS (
  SELECT id, source_primary, evidence_provenance, 'UNII' typ, unii::text val, to_jsonb(unii) raw FROM kimi WHERE unii IS NOT NULL AND unii<>'' UNION ALL
  SELECT id, source_primary, evidence_provenance, 'molecular_formula', molecular_formula, to_jsonb(molecular_formula) FROM kimi WHERE molecular_formula IS NOT NULL AND molecular_formula<>'' UNION ALL
  SELECT id, source_primary, evidence_provenance, 'PubChem_CID', pubchem_cid::text, to_jsonb(pubchem_cid) FROM kimi WHERE pubchem_cid IS NOT NULL UNION ALL
  SELECT id, source_primary, evidence_provenance, 'InChIKey', inchikey, to_jsonb(inchikey) FROM kimi WHERE inchikey IS NOT NULL AND inchikey<>'' UNION ALL
  SELECT id, source_primary, evidence_provenance, 'ChEMBL_ID', chembl_id, to_jsonb(chembl_id) FROM kimi WHERE chembl_id IS NOT NULL AND chembl_id<>'' UNION ALL
  SELECT id, source_primary, evidence_provenance, 'cas_candidates', array_to_json(cas_candidates)::text, to_jsonb(cas_candidates) FROM kimi WHERE cas_candidates IS NOT NULL AND cardinality(cas_candidates)>0
)
INSERT INTO supplements.supplement_identifiers (
  id, supplement_id, status, identifier_type, identifier_value,
  evidence_provenance, source
)
SELECT
  pg_temp.stable_uuid('supplement_identifier:' || id || ':' || typ),
  pg_temp.stable_uuid('supplement:' || id),
  'bekannt',
  typ,
  val,
  COALESCE(evidence_provenance->('external_ids.' || typ), evidence_provenance->typ, raw),
  source_primary
FROM ids;

WITH kimi AS (
  SELECT * FROM supplements.substance_catalog
  WHERE source_primary IN ('kimi_supplement','kimi_performance','kimi_peptide')
), regs AS (
  SELECT id, source_primary, jurisdiction, value
  FROM kimi
  CROSS JOIN LATERAL (
    VALUES
      ('usa', regulatory->'usa'),
      ('eu', regulatory->'eu'),
      ('uk', regulatory->'uk'),
      ('thailand', regulatory->'thailand'),
      ('australia', regulatory->'australia')
  ) AS r(jurisdiction, value)
  WHERE value IS NOT NULL
    AND NOT (jsonb_typeof(value) = 'string' AND btrim(value #>> '{}') = '')
)
INSERT INTO supplements.supplement_regulatory (
  id, supplement_id, status, jurisdiction, legal_status,
  prescription_required, approved_drug, approved_supplement_ingredient,
  note_en, source
)
SELECT
  pg_temp.stable_uuid('supplement_regulatory:' || id || ':' || jurisdiction),
  pg_temp.stable_uuid('supplement:' || id),
  pg_temp.info_status(value),
  jurisdiction,
  NULLIF(value #>> '{}', ''),
  kimi.prescription_required,
  NULLIF(kimi.regulatory->>'approved_drug', '')::boolean,
  NULLIF(kimi.regulatory->>'approved_supplement_ingredient', '')::boolean,
  NULL,
  source_primary
FROM regs
JOIN kimi USING (id, source_primary);

WITH kimi AS (
  SELECT * FROM supplements.substance_catalog
  WHERE source_primary IN ('kimi_supplement','kimi_performance','kimi_peptide')
)
INSERT INTO supplements.supplement_monitoring (
  id, supplement_id, status, lab_marker_id, loinc_code,
  frequency_en, rationale_en, source
)
SELECT
  pg_temp.stable_uuid('supplement_monitoring:' || id),
  pg_temp.stable_uuid('supplement:' || id),
  CASE WHEN monitoring IS NULL OR monitoring = '{}'::jsonb THEN 'unbekannt' ELSE 'bekannt' END,
  NULL,
  NULL,
  array_to_string(ARRAY(SELECT jsonb_array_elements_text(COALESCE(monitoring->'relevant_blood_tests','[]'::jsonb))), '; '),
  array_to_string(ARRAY(SELECT jsonb_array_elements_text(COALESCE(monitoring->'clinical_monitoring','[]'::jsonb))), '; '),
  source_primary
FROM kimi
WHERE monitoring IS NOT NULL;

WITH kimi AS (
  SELECT * FROM supplements.substance_catalog
  WHERE source_primary IN ('kimi_supplement','kimi_performance','kimi_peptide')
), sources AS (
  SELECT id, source_primary, key AS field_name, value
  FROM kimi
  CROSS JOIN LATERAL jsonb_each(evidence_provenance) ep(key, value)
)
INSERT INTO supplements.supplement_field_sources (
  id, supplement_id, status, field_name, source_id, as_of,
  evidence_class, source_note_en
)
SELECT
  pg_temp.stable_uuid('supplement_field_source:' || id || ':' || field_name),
  pg_temp.stable_uuid('supplement:' || id),
  'bekannt',
  field_name,
  NULLIF(value->>'source_id', ''),
  NULLIF(value->>'as_of', '')::date,
  NULLIF(value->>'evidence_class', ''),
  NULLIF(value->>'note', '')
FROM sources;

WITH kimi AS (
  SELECT * FROM supplements.substance_catalog
  WHERE source_primary IN ('kimi_supplement','kimi_performance','kimi_peptide')
), ints AS (
  SELECT id, source_primary, 'drug' AS partner_type, jsonb_array_elements_text(interactions->'drug_interactions') AS partner_label FROM kimi WHERE interactions ? 'drug_interactions'
  UNION ALL
  SELECT id, source_primary, 'supplement', jsonb_array_elements_text(interactions->'supplement_interactions') FROM kimi WHERE interactions ? 'supplement_interactions'
  UNION ALL
  SELECT id, source_primary, 'food', jsonb_array_elements_text(interactions->'food_interactions') FROM kimi WHERE interactions ? 'food_interactions'
  UNION ALL
  SELECT id, source_primary, 'alcohol', jsonb_array_elements_text(interactions->'alcohol_interactions') FROM kimi WHERE interactions ? 'alcohol_interactions'
  UNION ALL
  SELECT id, source_primary, 'disease', jsonb_array_elements_text(interactions->'disease_interactions') FROM kimi WHERE interactions ? 'disease_interactions'
), numbered AS (
  SELECT *, row_number() OVER (PARTITION BY id ORDER BY partner_type, partner_label) AS rn
  FROM ints
  WHERE btrim(partner_label) <> ''
)
INSERT INTO supplements.supplement_interactions (
  id, supplement_id, partner_type, partner_label, interaction_type, severity,
  description_en, recommendation_en, evidence_level, source, is_active,
  mechanism, direction, status
)
SELECT
  pg_temp.stable_uuid('supplement_interaction:' || id || ':' || partner_type || ':' || rn),
  pg_temp.stable_uuid('supplement:' || id),
  partner_type,
  partner_label,
  'contraindication',
  'caution',
  partner_label,
  NULL,
  'low',
  'import',
  true,
  NULL,
  NULL,
  'bekannt'
FROM numbered
WHERE rn = 1;

DO $$
DECLARE
  v_counts jsonb;
  v_reg_expected integer := 1185;
  v_reg_actual integer;
BEGIN
  SELECT jsonb_object_agg(table_name, row_count ORDER BY table_name)
    INTO v_counts
  FROM (
    SELECT 'supplement_groups' table_name, count(*) row_count FROM supplements.supplement_groups UNION ALL
    SELECT 'supplement_categories', count(*) FROM supplements.supplement_categories UNION ALL
    SELECT 'supplements', count(*) FROM supplements.supplements UNION ALL
    SELECT 'supplement_aliases', count(*) FROM supplements.supplement_aliases UNION ALL
    SELECT 'supplement_lab_effects', count(*) FROM supplements.supplement_lab_effects UNION ALL
    SELECT 'supplement_nutrients', count(*) FROM supplements.supplement_nutrients UNION ALL
    SELECT 'supplement_safety', count(*) FROM supplements.supplement_safety UNION ALL
    SELECT 'supplement_warnings', count(*) FROM supplements.supplement_warnings UNION ALL
    SELECT 'supplement_wada', count(*) FROM supplements.supplement_wada UNION ALL
    SELECT 'supplement_quality', count(*) FROM supplements.supplement_quality UNION ALL
    SELECT 'supplement_pharmacology', count(*) FROM supplements.supplement_pharmacology UNION ALL
    SELECT 'supplement_dosing', count(*) FROM supplements.supplement_dosing UNION ALL
    SELECT 'supplement_evidence', count(*) FROM supplements.supplement_evidence UNION ALL
    SELECT 'supplement_monitoring', count(*) FROM supplements.supplement_monitoring UNION ALL
    SELECT 'supplement_organ_risks', count(*) FROM supplements.supplement_organ_risks UNION ALL
    SELECT 'supplement_identifiers', count(*) FROM supplements.supplement_identifiers UNION ALL
    SELECT 'supplement_regulatory', count(*) FROM supplements.supplement_regulatory UNION ALL
    SELECT 'supplement_field_sources', count(*) FROM supplements.supplement_field_sources UNION ALL
    SELECT 'supplement_interactions', count(*) FROM supplements.supplement_interactions
  ) c;

  v_reg_actual := (v_counts->>'supplement_regulatory')::integer;
  IF v_reg_actual <> v_reg_expected THEN
    RAISE NOTICE 'C-235 Befund: supplement_regulatory hat %, erwartet waren %. Aktuelle Quelle enthaelt 331 leere UK/Australia-Strings; unknown wird als unbekannt importiert, leere Strings nicht.', v_reg_actual, v_reg_expected;
  END IF;

  IF (v_counts->>'supplement_groups')::integer <> 3 THEN RAISE EXCEPTION 'C-235: supplement_groups % statt 3', v_counts->>'supplement_groups'; END IF;
  IF (v_counts->>'supplement_categories')::integer <> 23 THEN RAISE EXCEPTION 'C-235: supplement_categories % statt 23', v_counts->>'supplement_categories'; END IF;
  IF (v_counts->>'supplements')::integer <> 566 THEN RAISE EXCEPTION 'C-235: supplements % statt 566', v_counts->>'supplements'; END IF;
  IF (v_counts->>'supplement_aliases')::integer <> 1541 THEN RAISE EXCEPTION 'C-235: supplement_aliases % statt 1541', v_counts->>'supplement_aliases'; END IF;
  IF (v_counts->>'supplement_lab_effects')::integer <> 222 THEN RAISE EXCEPTION 'C-235: supplement_lab_effects % statt 222', v_counts->>'supplement_lab_effects'; END IF;
  IF (v_counts->>'supplement_nutrients')::integer <> 17 THEN RAISE EXCEPTION 'C-235: supplement_nutrients % statt 17', v_counts->>'supplement_nutrients'; END IF;
  IF (v_counts->>'supplement_safety')::integer <> 290 THEN RAISE EXCEPTION 'C-235: supplement_safety % statt 290', v_counts->>'supplement_safety'; END IF;
  IF (v_counts->>'supplement_warnings')::integer <> 290 THEN RAISE EXCEPTION 'C-235: supplement_warnings % statt 290', v_counts->>'supplement_warnings'; END IF;
  IF (v_counts->>'supplement_wada')::integer <> 290 THEN RAISE EXCEPTION 'C-235: supplement_wada % statt 290', v_counts->>'supplement_wada'; END IF;
  IF (v_counts->>'supplement_quality')::integer <> 237 THEN RAISE EXCEPTION 'C-235: supplement_quality % statt 237', v_counts->>'supplement_quality'; END IF;
  IF (v_counts->>'supplement_pharmacology')::integer <> 566 THEN RAISE EXCEPTION 'C-235: supplement_pharmacology % statt 566', v_counts->>'supplement_pharmacology'; END IF;
  IF (v_counts->>'supplement_dosing')::integer <> 566 THEN RAISE EXCEPTION 'C-235: supplement_dosing % statt 566', v_counts->>'supplement_dosing'; END IF;
  IF (v_counts->>'supplement_evidence')::integer <> 566 THEN RAISE EXCEPTION 'C-235: supplement_evidence % statt 566', v_counts->>'supplement_evidence'; END IF;
  IF (v_counts->>'supplement_monitoring')::integer <> 46 THEN RAISE EXCEPTION 'C-235: supplement_monitoring % statt 46', v_counts->>'supplement_monitoring'; END IF;
  IF (v_counts->>'supplement_organ_risks')::integer <> 1450 THEN RAISE EXCEPTION 'C-235: supplement_organ_risks % statt 1450', v_counts->>'supplement_organ_risks'; END IF;
  IF (v_counts->>'supplement_identifiers')::integer <> 1226 THEN RAISE EXCEPTION 'C-235: supplement_identifiers % statt 1226', v_counts->>'supplement_identifiers'; END IF;
  IF (v_counts->>'supplement_field_sources')::integer <> 2147 THEN RAISE EXCEPTION 'C-235: supplement_field_sources % statt 2147', v_counts->>'supplement_field_sources'; END IF;
  IF (v_counts->>'supplement_interactions')::integer <> 78 THEN RAISE EXCEPTION 'C-235: supplement_interactions % statt 78', v_counts->>'supplement_interactions'; END IF;

  RAISE NOTICE 'OK C-235: Supplements-Zieltabellen befuellt. Counts: %', v_counts;
END $$;

COMMIT;
