#!/usr/bin/env node
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const CONTAINER = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const DB = process.env.PGDATABASE ?? 'postgres'
const BASE = 'backup/kimi-research/Kimi_Agent/supplement_performance_database'

function readJsonl(rel: string): Record<string, any>[] {
  return fs.readFileSync(path.join(BASE, rel), 'utf8').split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line))
}
function readJson(rel: string): any {
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
  biomarkerExplanations: readJsonl('data/evidence/biomarker_explanations.jsonl'),
  symptomMap: readJsonl('data/evidence/symptom_biomarker_map.jsonl'),
  symptoms: readJson('taxonomy/symptom_ids.json'),
}

const sql = `\\set ON_ERROR_STOP on
BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE SCHEMA IF NOT EXISTS medical;

DROP TABLE IF EXISTS medical.symptom_biomarker_map;
DROP TABLE IF EXISTS medical.biomarker_explanations;
DROP TABLE IF EXISTS medical.symptoms;

CREATE TABLE medical.biomarker_explanations (
  marker_id text PRIMARY KEY,
  loinc_code text,
  biomarker_loinc_code text REFERENCES medical.biomarker_catalog(loinc_code) ON DELETE SET NULL,
  analyte text,
  category text,
  what_it_measures_de text,
  major_physiological_role_de text,
  common_reasons_high_de jsonb NOT NULL DEFAULT '[]'::jsonb,
  common_reasons_low_de jsonb NOT NULL DEFAULT '[]'::jsonb,
  exercise_effects_de text,
  fasting_effects_de text,
  time_of_day_effects_de text,
  medication_supplement_effects_de text,
  important_confounders_de jsonb NOT NULL DEFAULT '[]'::jsonb,
  interpretation_caveats_de text,
  linked_evidence_ids text[] NOT NULL DEFAULT '{}',
  source_ids text[] NOT NULL DEFAULT '{}',
  loinc_match_status text NOT NULL DEFAULT 'not_checked',
  raw jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE medical.symptoms (
  symptom_id text PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  name_de text,
  name_en text,
  name_th text,
  source text NOT NULL DEFAULT 'kimi:taxonomy/symptom_ids',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE medical.symptom_biomarker_map (
  edge_id text PRIMARY KEY,
  symptom_id text NOT NULL,
  symptom_match_status text NOT NULL DEFAULT 'not_checked',
  marker_id text NOT NULL,
  marker_match_status text NOT NULL DEFAULT 'not_checked',
  biomarker_loinc_code text REFERENCES medical.biomarker_catalog(loinc_code) ON DELETE SET NULL,
  relation_type text,
  reason_de text,
  specificity text,
  source_ids text[] NOT NULL DEFAULT '{}',
  is_diagnosis_claim boolean NOT NULL DEFAULT false,
  boundary_note_de text,
  raw jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE medical.biomarker_explanations ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical.symptoms ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical.symptom_biomarker_map ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS biomarker_explanations_read ON medical.biomarker_explanations;
CREATE POLICY biomarker_explanations_read ON medical.biomarker_explanations FOR SELECT USING (true);
DROP POLICY IF EXISTS symptoms_read ON medical.symptoms;
CREATE POLICY symptoms_read ON medical.symptoms FOR SELECT USING (true);
DROP POLICY IF EXISTS symptom_biomarker_map_read ON medical.symptom_biomarker_map;
CREATE POLICY symptom_biomarker_map_read ON medical.symptom_biomarker_map FOR SELECT USING (true);

GRANT SELECT ON medical.biomarker_explanations TO anon, authenticated;
GRANT SELECT ON medical.symptoms TO anon, authenticated;
GRANT SELECT ON medical.symptom_biomarker_map TO anon, authenticated;
GRANT ALL ON medical.biomarker_explanations TO service_role;
GRANT ALL ON medical.symptoms TO service_role;
GRANT ALL ON medical.symptom_biomarker_map TO service_role;

DROP TABLE IF EXISTS tmp_c262_wave2;
CREATE TEMP TABLE tmp_c262_wave2 (payload jsonb NOT NULL);
\\copy tmp_c262_wave2(payload) FROM STDIN WITH (FORMAT csv)
${csvJson([payload])}
\\.

WITH source AS (
  SELECT key AS slug, value::text AS symptom_id
  FROM tmp_c262_wave2, jsonb_each_text(payload->'symptoms'->'symptoms')
)
INSERT INTO medical.symptoms(symptom_id, slug, name_de, name_en)
SELECT symptom_id, slug, NULL, NULL
FROM source;

WITH rows AS (
  SELECT jsonb_array_elements(payload->'biomarkerExplanations') AS r FROM tmp_c262_wave2
), loinc AS (
  SELECT
    rows.r,
    coalesce(
      rows.r->>'loinc_code',
      rows.r->>'candidate_loinc',
      rows.r->'loinc_candidates'->>0,
      lm.loinc_code
    ) AS loinc_code
  FROM rows
  LEFT JOIN medical.lab_marker_catalog lm ON lm.marker_id = rows.r->>'marker_id'
)
INSERT INTO medical.biomarker_explanations(
  marker_id, loinc_code, biomarker_loinc_code, analyte, category,
  what_it_measures_de, major_physiological_role_de, common_reasons_high_de,
  common_reasons_low_de, exercise_effects_de, fasting_effects_de,
  time_of_day_effects_de, medication_supplement_effects_de,
  important_confounders_de, interpretation_caveats_de,
  linked_evidence_ids, source_ids, loinc_match_status, raw
)
SELECT
  r->>'marker_id',
  l.loinc_code,
  b.loinc_code,
  r->>'analyte',
  r->>'category',
  r->>'what_it_measures',
  r->>'major_physiological_role',
  coalesce(r->'common_reasons_high', '[]'::jsonb),
  coalesce(r->'common_reasons_low', '[]'::jsonb),
  r->>'exercise_effects',
  r->>'fasting_effects',
  r->>'time_of_day_effects',
  r->>'medication_supplement_effects',
  coalesce(r->'important_confounders', '[]'::jsonb),
  r->>'interpretation_caveats',
  coalesce(ARRAY(SELECT jsonb_array_elements_text(r->'linked_evidence_ids')), '{}'),
  coalesce(ARRAY(SELECT jsonb_array_elements_text(r->'source_ids')), '{}'),
  CASE WHEN l.loinc_code IS NULL THEN 'no_candidate'
       WHEN b.loinc_code IS NULL THEN 'candidate_not_in_catalog'
       ELSE 'matched' END,
  r
FROM loinc l
LEFT JOIN medical.biomarker_catalog b ON b.loinc_code = l.loinc_code;

WITH rows AS (
  SELECT jsonb_array_elements(payload->'symptomMap') AS r FROM tmp_c262_wave2
)
INSERT INTO medical.symptom_biomarker_map(
  edge_id, symptom_id, symptom_match_status, marker_id, marker_match_status,
  biomarker_loinc_code, relation_type, reason_de, specificity, source_ids,
  is_diagnosis_claim, boundary_note_de, raw
)
SELECT
  r->>'edge_id',
  r->>'symptom_id',
  CASE WHEN s.symptom_id IS NULL THEN 'symptom_not_in_catalog' ELSE 'matched' END,
  r->>'marker_id',
  CASE WHEN be.marker_id IS NULL THEN 'marker_not_in_explanations' ELSE 'matched' END,
  be.biomarker_loinc_code,
  r->>'relation_type',
  r->>'reason',
  r->>'specificity',
  coalesce(ARRAY(SELECT jsonb_array_elements_text(r->'source_ids')), '{}'),
  coalesce((r->>'is_diagnosis_claim')::boolean, false),
  r->>'boundary_note',
  r
FROM rows
LEFT JOIN medical.biomarker_explanations be ON be.marker_id = r->>'marker_id'
LEFT JOIN medical.symptoms s ON s.symptom_id = r->>'symptom_id';

COMMIT;
`

run(sql)
