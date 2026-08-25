#!/usr/bin/env node
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const CONTAINER = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const DB = process.env.PGDATABASE ?? 'postgres'
const BASE = 'backup/kimi-research/Kimi_Agent/supplement_performance_database/data'

type Json = Record<string, any>

function readJsonl(rel: string): Json[] {
  const file = path.join(BASE, rel)
  return fs.readFileSync(file, 'utf8').split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line))
}

function csvJson(rows: Json[]): string {
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
  cyp: readJsonl('evidence/cyp_enrichment.jsonl'),
  transporters: readJsonl('evidence/transporter_enrichment.jsonl'),
  pk: readJsonl('evidence/medication_pk_enrichment_crawl_038.jsonl'),
  renalHepatic: readJsonl('evidence/medication_renal_hepatic_enrichment.jsonl'),
  reproductive: readJsonl('evidence/medication_reproductive_enrichment.jsonl'),
  dosing: readJsonl('evidence/supplement_dosing_enrichment.jsonl'),
  evidenceFlags: readJsonl('evidence/human_evidence_flags.jsonl'),
  wada: readJsonl('evidence/wada_status_enrichment.jsonl'),
  thMed: readJsonl('evidence/thailand_medication_regulatory_enrichment.jsonl'),
  thProduct: readJsonl('evidence/thailand_product_regulatory_enrichment.jsonl'),
}

const sql = `\\set ON_ERROR_STOP on
BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE SCHEMA IF NOT EXISTS supplements;

CREATE TABLE IF NOT EXISTS supplements.entity_cyp (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id text NOT NULL,
  entity_type text,
  supplement_id uuid REFERENCES supplements.supplements(id) ON DELETE CASCADE,
  canonical_name text,
  enzyme text NOT NULL,
  role text NOT NULL,
  evidence text,
  note text,
  source_ids text[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'bekannt' CHECK (status IN ('bekannt','unbekannt','nicht_zutreffend')),
  source text NOT NULL,
  raw jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (entity_id, enzyme, source)
);

CREATE TABLE IF NOT EXISTS supplements.entity_transporters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id text NOT NULL,
  entity_type text,
  supplement_id uuid REFERENCES supplements.supplements(id) ON DELETE CASCADE,
  canonical_name text,
  transporter text NOT NULL,
  role text NOT NULL,
  evidence text,
  note text,
  source_ids text[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'bekannt' CHECK (status IN ('bekannt','unbekannt','nicht_zutreffend')),
  source text NOT NULL,
  raw jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (entity_id, transporter, source)
);

CREATE TABLE IF NOT EXISTS supplements.entity_pk (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id text NOT NULL,
  entity_type text,
  supplement_id uuid REFERENCES supplements.supplements(id) ON DELETE CASCADE,
  canonical_name text,
  pk_field text NOT NULL,
  value text,
  evidence_scope text,
  source_detail jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'bekannt' CHECK (status IN ('bekannt','unbekannt','nicht_zutreffend')),
  source text NOT NULL,
  raw jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (entity_id, pk_field, source)
);

CREATE TABLE IF NOT EXISTS supplements.entity_renal_hepatic (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id text NOT NULL,
  entity_type text,
  supplement_id uuid REFERENCES supplements.supplements(id) ON DELETE CASCADE,
  canonical_name text,
  organ text NOT NULL CHECK (organ IN ('renal','hepatic','reproductive')),
  field_name text NOT NULL,
  value jsonb,
  status text NOT NULL DEFAULT 'bekannt' CHECK (status IN ('bekannt','unbekannt','nicht_zutreffend')),
  source text NOT NULL,
  raw jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (entity_id, organ, field_name, source)
);

ALTER TABLE supplements.entity_cyp ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplements.entity_transporters ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplements.entity_pk ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplements.entity_renal_hepatic ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS entity_cyp_read ON supplements.entity_cyp;
CREATE POLICY entity_cyp_read ON supplements.entity_cyp FOR SELECT USING (true);
DROP POLICY IF EXISTS entity_transporters_read ON supplements.entity_transporters;
CREATE POLICY entity_transporters_read ON supplements.entity_transporters FOR SELECT USING (true);
DROP POLICY IF EXISTS entity_pk_read ON supplements.entity_pk;
CREATE POLICY entity_pk_read ON supplements.entity_pk FOR SELECT USING (true);
DROP POLICY IF EXISTS entity_renal_hepatic_read ON supplements.entity_renal_hepatic;
CREATE POLICY entity_renal_hepatic_read ON supplements.entity_renal_hepatic FOR SELECT USING (true);

GRANT SELECT ON supplements.entity_cyp TO authenticated;
GRANT SELECT ON supplements.entity_transporters TO authenticated;
GRANT SELECT ON supplements.entity_pk TO authenticated;
GRANT SELECT ON supplements.entity_renal_hepatic TO authenticated;
GRANT ALL ON supplements.entity_cyp TO service_role;
GRANT ALL ON supplements.entity_transporters TO service_role;
GRANT ALL ON supplements.entity_pk TO service_role;
GRANT ALL ON supplements.entity_renal_hepatic TO service_role;

DROP TABLE IF EXISTS tmp_c262_wave1;
CREATE TEMP TABLE tmp_c262_wave1 (payload jsonb NOT NULL);
\\copy tmp_c262_wave1(payload) FROM STDIN WITH (FORMAT csv)
${csvJson([payload])}
\\.

DELETE FROM supplements.entity_cyp WHERE source LIKE 'kimi:%';
DELETE FROM supplements.entity_transporters WHERE source LIKE 'kimi:%';
DELETE FROM supplements.entity_pk WHERE source LIKE 'kimi:%';
DELETE FROM supplements.entity_renal_hepatic WHERE source LIKE 'kimi:%';
DELETE FROM supplements.supplement_wada WHERE source = 'kimi:wada_status_enrichment';
DELETE FROM supplements.supplement_regulatory WHERE source IN ('kimi:thailand_medication_regulatory_enrichment', 'kimi:thailand_product_regulatory_enrichment');

WITH rows AS (
  SELECT jsonb_array_elements(payload->'cyp') AS r FROM tmp_c262_wave1
), enzymes AS (
  SELECT r, key AS enzyme, value AS v FROM rows, jsonb_each(r->'cyp')
)
INSERT INTO supplements.entity_cyp(entity_id, entity_type, supplement_id, canonical_name, enzyme, role, evidence, note, source_ids, status, source, raw)
SELECT
  r->>'entity_id',
  coalesce(r->>'entity_type', r->>'domain'),
  s.id,
  r->>'canonical_name',
  enzyme,
  coalesce(v->>'role', 'unknown'),
  v->>'evidence',
  v->>'note',
  coalesce(ARRAY(SELECT jsonb_array_elements_text(v->'source_ids')), '{}'),
  CASE WHEN coalesce(v->>'role','') = 'not_relevant' THEN 'nicht_zutreffend'
       WHEN coalesce(v->>'role','') IN ('unknown','not_studied','') THEN 'unbekannt'
       ELSE 'bekannt' END,
  'kimi:cyp_enrichment',
  v
FROM enzymes
LEFT JOIN supplements.supplements s ON s.slug = r->>'entity_id';

WITH rows AS (
  SELECT jsonb_array_elements(payload->'transporters') AS r FROM tmp_c262_wave1
), transporters AS (
  SELECT r, key AS transporter, value AS v FROM rows, jsonb_each(r->'transporters')
)
INSERT INTO supplements.entity_transporters(entity_id, entity_type, supplement_id, canonical_name, transporter, role, evidence, note, source_ids, status, source, raw)
SELECT
  r->>'entity_id',
  coalesce(r->>'entity_type', r->>'domain'),
  s.id,
  r->>'canonical_name',
  transporter,
  coalesce(v->>'role', 'unknown'),
  v->>'evidence',
  v->>'note',
  coalesce(ARRAY(SELECT jsonb_array_elements_text(v->'source_ids')), '{}'),
  CASE WHEN coalesce(v->>'role','') = 'not_relevant' THEN 'nicht_zutreffend'
       WHEN coalesce(v->>'role','') IN ('unknown','not_studied','') THEN 'unbekannt'
       ELSE 'bekannt' END,
  'kimi:transporter_enrichment',
  v
FROM transporters
LEFT JOIN supplements.supplements s ON s.slug = r->>'entity_id';

WITH rows AS (
  SELECT jsonb_array_elements(payload->'pk') AS r FROM tmp_c262_wave1
), pk AS (
  SELECT r, key AS pk_field, value AS v FROM rows, jsonb_each(r->'pk_fields')
)
INSERT INTO supplements.entity_pk(entity_id, entity_type, supplement_id, canonical_name, pk_field, value, evidence_scope, source_detail, status, source, raw)
SELECT
  r->>'entity_id',
  coalesce(r->>'entity_type', 'medication'),
  s.id,
  r->>'canonical_name',
  pk_field,
  v->>'value',
  v->>'evidence_scope',
  coalesce(v->'source', '{}'::jsonb),
  CASE WHEN coalesce(v->>'value','') = '' OR coalesce(v->>'value','') = 'unknown' THEN 'unbekannt' ELSE 'bekannt' END,
  'kimi:medication_pk_enrichment_crawl_038',
  v
FROM pk
LEFT JOIN supplements.supplements s ON s.slug = r->>'entity_id';

WITH rows AS (
  SELECT jsonb_array_elements(payload->'renalHepatic') AS r FROM tmp_c262_wave1
), parts AS (
  SELECT r, 'renal' AS organ, key AS field_name, value AS v FROM rows, jsonb_each(r->'renal')
  UNION ALL
  SELECT r, 'hepatic' AS organ, key AS field_name, value AS v FROM rows, jsonb_each(r->'hepatic')
)
INSERT INTO supplements.entity_renal_hepatic(entity_id, entity_type, supplement_id, canonical_name, organ, field_name, value, status, source, raw)
SELECT
  r->>'entity_id',
  coalesce(r->>'entity_type', 'medication'),
  s.id,
  r->>'canonical_name',
  organ,
  field_name,
  v,
  CASE WHEN v IS NULL OR v = 'null'::jsonb OR v = '""'::jsonb THEN 'unbekannt' ELSE 'bekannt' END,
  'kimi:medication_renal_hepatic_enrichment',
  r
FROM parts
LEFT JOIN supplements.supplements s ON s.slug = r->>'entity_id';

WITH rows AS (
  SELECT jsonb_array_elements(payload->'reproductive') AS r FROM tmp_c262_wave1
), parts AS (
  SELECT r, key AS field_name, value AS v FROM rows, jsonb_each(r - 'crawl_id' - 'layer' - 'generated_at' - 'strict_mode' - 'generated_by' - 'integration_note' - 'entity_id' - 'canonical_name' - 'entity_type' - 'record_type')
)
INSERT INTO supplements.entity_renal_hepatic(entity_id, entity_type, supplement_id, canonical_name, organ, field_name, value, status, source, raw)
SELECT
  r->>'entity_id',
  coalesce(r->>'entity_type', 'medication'),
  s.id,
  r->>'canonical_name',
  'reproductive',
  field_name,
  v,
  CASE WHEN v IS NULL OR v = 'null'::jsonb OR v = '""'::jsonb THEN 'unbekannt' ELSE 'bekannt' END,
  'kimi:medication_reproductive_enrichment',
  r
FROM parts
LEFT JOIN supplements.supplements s ON s.slug = r->>'entity_id';

WITH rows AS (
  SELECT jsonb_array_elements(payload->'dosing') AS r FROM tmp_c262_wave1
)
UPDATE supplements.supplement_dosing d
SET
  studied_dose_ranges = coalesce(r.r->'studied_dose_ranges', d.studied_dose_ranges),
  anecdotal_dose_ranges = coalesce(r.r->'anecdotal_dose_ranges', d.anecdotal_dose_ranges),
  upper_limit = coalesce(r.r->'upper_limit', r.r->'tolerable_upper_intake_level', d.upper_limit),
  source = 'kimi:supplement_dosing_enrichment',
  updated_at = now()
FROM rows r
WHERE d.supplement_id::text = r.r->>'entity_id';

WITH rows AS (
  SELECT jsonb_array_elements(payload->'evidenceFlags') AS r FROM tmp_c262_wave1
)
UPDATE supplements.supplement_evidence e
SET
  overall_grade = coalesce(r.r->>'overall_grade', r.r->>'evidence_grade', e.overall_grade),
  summary_en = coalesce(r.r->>'summary', r.r->>'note', e.summary_en),
  human_trials = coalesce(NULLIF(r.r->>'human_trials','')::int, e.human_trials),
  randomized_trials = coalesce(NULLIF(r.r->>'randomized_trials','')::int, e.randomized_trials),
  meta_analyses = coalesce(NULLIF(r.r->>'meta_analyses','')::int, e.meta_analyses),
  animal_only = coalesce(NULLIF(r.r->>'animal_only','')::boolean, e.animal_only),
  in_vitro_only = coalesce(NULLIF(r.r->>'in_vitro_only','')::boolean, e.in_vitro_only),
  source = 'kimi:human_evidence_flags',
  updated_at = now()
FROM rows r
WHERE e.supplement_id::text = r.r->>'entity_id';

WITH rows AS (
  SELECT jsonb_array_elements(payload->'wada') AS r FROM tmp_c262_wave1
)
INSERT INTO supplements.supplement_wada(supplement_id, status, wada_status, wada_category, note_en, source)
SELECT
  s.id,
  CASE WHEN coalesce(r->>'wada_status','') IN ('unknown','') THEN 'unbekannt' ELSE 'bekannt' END,
  r->>'wada_status',
  r->>'wada_category',
  coalesce(r->>'note', r->>'boundary_note'),
  'kimi:wada_status_enrichment'
FROM rows
JOIN supplements.supplements s ON s.slug = r->>'entity_id';

WITH rows AS (
  SELECT jsonb_array_elements(payload->'thMed') AS r FROM tmp_c262_wave1
)
INSERT INTO supplements.supplement_regulatory(supplement_id, status, jurisdiction, legal_status, prescription_required, approved_drug, approved_supplement_ingredient, note_en, source)
SELECT
  s.id,
  CASE WHEN coalesce(r->>'status', r->>'legal_status','') IN ('unknown','') THEN 'unbekannt' ELSE 'bekannt' END,
  'thailand',
  coalesce(r->>'legal_status', r->>'status'),
  CASE WHEN lower(coalesce(r->>'prescription_required','')) IN ('true','yes') THEN true WHEN lower(coalesce(r->>'prescription_required','')) IN ('false','no') THEN false ELSE NULL END,
  CASE WHEN lower(coalesce(r->>'approved_drug','')) IN ('true','yes') THEN true WHEN lower(coalesce(r->>'approved_drug','')) IN ('false','no') THEN false ELSE NULL END,
  CASE WHEN lower(coalesce(r->>'approved_supplement_ingredient','')) IN ('true','yes') THEN true WHEN lower(coalesce(r->>'approved_supplement_ingredient','')) IN ('false','no') THEN false ELSE NULL END,
  coalesce(r->>'note', r->>'regulatory_note'),
  'kimi:thailand_medication_regulatory_enrichment'
FROM rows
JOIN supplements.supplements s ON s.slug = r->>'entity_id';

COMMIT;
`

run(sql)
