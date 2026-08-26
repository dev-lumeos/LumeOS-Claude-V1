#!/usr/bin/env node
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const CONTAINER = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const DB = process.env.PGDATABASE ?? 'postgres'
const BASE = 'backup/kimi-research/Kimi_Agent/supplement_performance_database/data'

function readJsonl(rel: string): Record<string, any>[] {
  return fs.readFileSync(path.join(BASE, rel), 'utf8').split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line))
}
function readJson(rel: string): Record<string, any> {
  return JSON.parse(fs.readFileSync(path.join(BASE, rel), 'utf8'))
}
function csvJson(rows: any[]): string {
  return rows.map((row) => `"${JSON.stringify(row).replace(/"/g, '""')}"`).join('\n')
}
function run(sql: string): void {
  const result = spawnSync('docker', ['exec', '-i', CONTAINER, 'psql', '-U', 'postgres', '-d', DB, '-v', 'ON_ERROR_STOP=1', '-f', '-'], {
    input: sql,
    encoding: 'utf8',
    maxBuffer: 256 * 1024 * 1024,
  })
  if (result.status !== 0) {
    process.stderr.write(result.stdout)
    process.stderr.write(result.stderr)
    process.exit(result.status ?? 1)
  }
  process.stdout.write(result.stdout)
  process.stderr.write(result.stderr)
}

const payload = {
  active: readJsonl('medications/medication_active_substances.jsonl'),
  formulations: readJsonl('medications/medication_formulations.jsonl'),
  products: readJsonl('medications/medication_products.jsonl'),
  rules: readJsonl('platform/medication_rules.jsonl'),
  traitMapping: readJson('platform/rule_trait_mapping.json'),
}

const sql = `\\set ON_ERROR_STOP on
BEGIN;

CREATE SCHEMA IF NOT EXISTS medical;

DROP TABLE IF EXISTS tmp_c262_wave4;
CREATE TEMP TABLE tmp_c262_wave4 (payload jsonb NOT NULL);
\\copy tmp_c262_wave4(payload) FROM STDIN WITH (FORMAT csv)
${csvJson([payload])}
\\.

WITH rows AS (
  SELECT payload, jsonb_array_elements(payload->'active') AS r FROM tmp_c262_wave4
)
INSERT INTO medical.medication_active_substances(
  id, canonical_name, generic_names, synonyms, atc_code, cas_number,
  rxnorm_code, unii_code, drug_class, raw_drug_class, cyp_profile,
  cyp_raw, routes, dosage_forms, risk_flags, lab_effects,
  contraindications, precautions, regulatory_state, sources, raw, source
)
SELECT
  r->>'id',
  r->>'canonical_name',
  coalesce(ARRAY(SELECT jsonb_array_elements_text(r->'generic_names')), '{}'),
  coalesce(ARRAY(SELECT jsonb_array_elements_text(r->'synonyms')), '{}'),
  coalesce(nullif(btrim(r->>'ATC'), ''), r->>'atc_code', r->'external_ids'->>'ATC'),
  coalesce(nullif(btrim(r->>'CAS'), ''), r->>'cas_number', r->'external_ids'->>'CAS'),
  coalesce(nullif(btrim(r->>'RxNorm_salt_rxcui'), ''), r->'external_ids'->>'RxNorm_salt_rxcui', r->>'rxnorm_code', r->'external_ids'->>'RxNorm'),
  coalesce(nullif(btrim(r->>'UNII'), ''), r->'external_ids'->>'UNII', r->>'unii_code'),
  coalesce(ARRAY(
    SELECT DISTINCT x
    FROM (
      SELECT jsonb_array_elements_text(coalesce(r->'drug_class', '[]'::jsonb)) AS x
      UNION
      SELECT jsonb_array_elements_text(coalesce(r->'raw_drug_class', '[]'::jsonb)) AS x
      UNION
      SELECT jsonb_array_elements_text(coalesce(payload->'traitMapping'->'name_to_rule_traits'->lower(r->>'canonical_name'), '[]'::jsonb)) AS x
      UNION
      SELECT jsonb_array_elements_text(coalesce(payload->'traitMapping'->'class_to_rule_traits'->lower(cls), '[]'::jsonb)) AS x
      FROM jsonb_array_elements_text(coalesce(r->'drug_class', '[]'::jsonb)) cls
      UNION
      SELECT key || '_substrate' AS x
      FROM jsonb_each_text(coalesce(r->'cyp'->'substrate', '{}'::jsonb))
      WHERE value NOT IN ('unknown', 'not_relevant', 'not_studied', '')
      UNION
      SELECT key || '_inhibitor' AS x
      FROM jsonb_each_text(coalesce(r->'cyp'->'inhibitor', '{}'::jsonb))
      WHERE value NOT IN ('unknown', 'not_relevant', 'not_studied', '')
      UNION
      SELECT key || '_inducer' AS x
      FROM jsonb_each_text(coalesce(r->'cyp'->'inducer', '{}'::jsonb))
      WHERE value NOT IN ('unknown', 'not_relevant', 'not_studied', '')
    ) traits
    WHERE x IS NOT NULL AND x <> ''
  ), '{}'),
  coalesce(ARRAY(SELECT jsonb_array_elements_text(coalesce(r->'drug_class', r->'raw_drug_class', '[]'::jsonb))), '{}'),
  coalesce(ARRAY(
    SELECT DISTINCT x
    FROM (
      SELECT jsonb_array_elements_text(coalesce(r->'cyp_profile', '[]'::jsonb)) AS x
      UNION
      SELECT key || '_substrate' AS x
      FROM jsonb_each_text(coalesce(r->'cyp'->'substrate', '{}'::jsonb))
      WHERE value NOT IN ('unknown', 'not_relevant', 'not_studied', '')
      UNION
      SELECT key || '_inhibitor' AS x
      FROM jsonb_each_text(coalesce(r->'cyp'->'inhibitor', '{}'::jsonb))
      WHERE value NOT IN ('unknown', 'not_relevant', 'not_studied', '')
      UNION
      SELECT key || '_inducer' AS x
      FROM jsonb_each_text(coalesce(r->'cyp'->'inducer', '{}'::jsonb))
      WHERE value NOT IN ('unknown', 'not_relevant', 'not_studied', '')
    ) cyp_traits
    WHERE x IS NOT NULL AND x <> ''
  ), '{}'),
  coalesce(r->'cyp', r->'cyp_raw', '{}'::jsonb),
  coalesce(ARRAY(SELECT jsonb_array_elements_text(coalesce(r->'routes_of_administration', r->'routes', '[]'::jsonb))), '{}'),
  coalesce(ARRAY(SELECT jsonb_array_elements_text(r->'dosage_forms')), '{}'),
  coalesce(r->'risk_flags', '{}'::jsonb),
  coalesce(r->'lab_effects', '[]'::jsonb),
  coalesce(r->'contraindications', '[]'::jsonb),
  coalesce(r->'precautions', '[]'::jsonb),
  coalesce(r->'regulatory_state', '{}'::jsonb),
  coalesce(r->'sources', '[]'::jsonb),
  r,
  'kimi:medication_active_substances'
FROM rows
ON CONFLICT (id) DO UPDATE SET
  canonical_name = excluded.canonical_name,
  generic_names = excluded.generic_names,
  synonyms = excluded.synonyms,
  atc_code = excluded.atc_code,
  cas_number = excluded.cas_number,
  rxnorm_code = excluded.rxnorm_code,
  unii_code = excluded.unii_code,
  drug_class = excluded.drug_class,
  raw_drug_class = excluded.raw_drug_class,
  cyp_profile = excluded.cyp_profile,
  cyp_raw = excluded.cyp_raw,
  routes = excluded.routes,
  dosage_forms = excluded.dosage_forms,
  risk_flags = excluded.risk_flags,
  lab_effects = excluded.lab_effects,
  contraindications = excluded.contraindications,
  precautions = excluded.precautions,
  regulatory_state = excluded.regulatory_state,
  sources = excluded.sources,
  raw = excluded.raw,
  source = excluded.source,
  updated_at = now();

UPDATE medical.user_medications um
SET drug_class = s.drug_class,
    cyp_profile = s.cyp_profile,
    updated_at = now()
FROM medical.medication_active_substances s
WHERE um.active_substance_id = s.id
  AND um.measurement_source = 'seed';

WITH rows AS (
  SELECT jsonb_array_elements(payload->'formulations') AS r FROM tmp_c262_wave4
)
INSERT INTO medical.medication_formulations(id, active_substance_id, strength_value, strength_unit, dosage_form, route, salt_or_ester, release, indication, raw, source)
SELECT
  r->>'id',
  r->>'active_substance_id',
  NULLIF(r->>'strength_value','')::numeric,
  r->>'strength_unit',
  r->>'dosage_form',
  r->>'route',
  r->>'salt_or_ester',
  r->>'release',
  r->>'indication',
  r,
  'kimi:medication_formulations'
FROM rows
ON CONFLICT (id) DO UPDATE SET
  active_substance_id = excluded.active_substance_id,
  strength_value = excluded.strength_value,
  strength_unit = excluded.strength_unit,
  dosage_form = excluded.dosage_form,
  route = excluded.route,
  salt_or_ester = excluded.salt_or_ester,
  release = excluded.release,
  indication = excluded.indication,
  raw = excluded.raw,
  source = excluded.source,
  updated_at = now();

WITH rows AS (
  SELECT jsonb_array_elements(payload->'products') AS r FROM tmp_c262_wave4
)
INSERT INTO medical.medication_products(id, formulation_id, brand_name, manufacturer, jurisdictions, identifiers, packaging, raw, source)
SELECT
  r->>'id',
  r->>'formulation_id',
  r->>'brand_name',
  r->>'manufacturer',
  coalesce(ARRAY(SELECT jsonb_array_elements_text(r->'jurisdictions')), '{}'),
  coalesce(r->'identifiers', '{}'::jsonb),
  r->>'packaging',
  r,
  'kimi:medication_products'
FROM rows
ON CONFLICT (id) DO UPDATE SET
  formulation_id = excluded.formulation_id,
  brand_name = excluded.brand_name,
  manufacturer = excluded.manufacturer,
  jurisdictions = excluded.jurisdictions,
  identifiers = excluded.identifiers,
  packaging = excluded.packaging,
  raw = excluded.raw,
  source = excluded.source,
  updated_at = now();

WITH rows AS (
  SELECT jsonb_array_elements(payload->'rules') AS r FROM tmp_c262_wave4
)
INSERT INTO supplements.rule_catalog(
  rule_id, rule_type, rule_kind, severity, priority_lane, priority_rank,
  conditions, effects, message_key, message_de, recommended_action_type,
  modules_involved, input_paths, input_coverage_status, missing_input_paths,
  substance_ids, substance_group_ids, substance_names_for_display,
  evidence, source_file, source_version, raw, source
)
SELECT
  r->>'id',
  'medication',
  'medication',
  r->>'severity',
  r->>'priority_lane',
  NULLIF(r->>'priority_rank','')::int,
  coalesce(r->'conditions', '[]'::jsonb),
  coalesce(r->'effects', '[]'::jsonb),
  r->>'message_key',
  r->>'message_de',
  r->>'recommended_action_type',
  coalesce(ARRAY(SELECT jsonb_array_elements_text(r->'modules_involved')), '{}'),
  coalesce(ARRAY(SELECT DISTINCT jsonb_array_elements_text(jsonb_path_query_array(r, '$.conditions[*].field'))), '{}'),
  'auswertbar',
  '{}',
  coalesce(ARRAY(SELECT jsonb_array_elements_text(r->'substance_ids')), '{}'),
  coalesce(ARRAY(SELECT jsonb_array_elements_text(r->'substance_group_ids')), '{}'),
  coalesce(ARRAY(SELECT jsonb_array_elements_text(r->'substance_names_for_display')), '{}'),
  coalesce(r->'evidence', '[]'::jsonb),
  'data/platform/medication_rules.jsonl',
  NULLIF(r->>'version','')::int,
  r,
  'kimi:medication_rules'
FROM rows
ON CONFLICT (rule_id) DO UPDATE SET
  rule_type = excluded.rule_type,
  rule_kind = excluded.rule_kind,
  severity = excluded.severity,
  priority_lane = excluded.priority_lane,
  priority_rank = excluded.priority_rank,
  conditions = excluded.conditions,
  effects = excluded.effects,
  message_key = excluded.message_key,
  message_de = excluded.message_de,
  recommended_action_type = excluded.recommended_action_type,
  modules_involved = excluded.modules_involved,
  input_paths = excluded.input_paths,
  input_coverage_status = excluded.input_coverage_status,
  missing_input_paths = excluded.missing_input_paths,
  substance_ids = excluded.substance_ids,
  substance_group_ids = excluded.substance_group_ids,
  substance_names_for_display = excluded.substance_names_for_display,
  evidence = excluded.evidence,
  source_file = excluded.source_file,
  source_version = excluded.source_version,
  raw = excluded.raw,
  source = excluded.source,
  updated_at = now();

COMMIT;
`

run(sql)
