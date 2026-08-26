#!/usr/bin/env node
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const CONTAINER = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const DB = process.env.PGDATABASE ?? 'postgres'
const BASE = 'backup/kimi-research/Kimi_Agent/supplement_performance_database/data/evidence'

type Json = Record<string, unknown>

function readJsonl(file: string): Json[] {
  return fs.readFileSync(path.join(BASE, file), 'utf8').split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line))
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
  pk: readJsonl('medication_pk_enrichment_crawl_038.jsonl'),
  renalHepatic: readJsonl('medication_renal_hepatic_enrichment.jsonl'),
  reproductive: readJsonl('medication_reproductive_enrichment.jsonl'),
  clinicalContext: readJsonl('medication_clinical_context_enrichment.jsonl'),
  thailand: readJsonl('thailand_medication_regulatory_enrichment.jsonl'),
}

const sql = `\\set ON_ERROR_STOP on
BEGIN;

DROP TABLE IF EXISTS tmp_c286_payload;
CREATE TEMP TABLE tmp_c286_payload (payload jsonb NOT NULL);
\\copy tmp_c286_payload(payload) FROM STDIN WITH (FORMAT csv)
${csvJson([payload])}
\\.

DO $$
DECLARE missing_count integer;
BEGIN
  SELECT count(*) INTO missing_count
  FROM (
    SELECT r->>'entity_id' AS id FROM tmp_c286_payload, jsonb_array_elements(payload->'pk') AS r
    UNION ALL SELECT r->>'entity_id' FROM tmp_c286_payload, jsonb_array_elements(payload->'renalHepatic') AS r
    UNION ALL SELECT r->>'entity_id' FROM tmp_c286_payload, jsonb_array_elements(payload->'reproductive') AS r
    UNION ALL SELECT r->>'entity_id' FROM tmp_c286_payload, jsonb_array_elements(payload->'clinicalContext') AS r
    UNION ALL SELECT r->>'entity_id' FROM tmp_c286_payload, jsonb_array_elements(payload->'thailand') AS r WHERE r ? 'entity_id'
  ) source_rows
  LEFT JOIN medical.medication_active_substances catalog ON catalog.id = source_rows.id
  WHERE catalog.id IS NULL;
  IF missing_count <> 0 THEN
    RAISE EXCEPTION 'C-286: % Enrichment-IDs fehlen im Medikamentenkatalog', missing_count;
  END IF;
END $$;

UPDATE medical.medication_active_substances
SET atc_code = COALESCE(
  NULLIF(btrim(raw->'external_ids'->>'ATC_all'), ''),
  NULLIF(btrim(raw->'external_ids'->>'ATC_level3'), ''),
  NULLIF(btrim(raw->>'ATC'), '')
), updated_at = now();

WITH rows AS (
  SELECT r FROM tmp_c286_payload, jsonb_array_elements(payload->'reproductive') AS r
)
INSERT INTO medical.medication_reproductive_evidence(
  active_substance_id, pregnancy, lactation, fertility, missing_pregnancy_lactation,
  missing_fertility_sex, sources, raw, source
)
SELECT r->>'entity_id', r->'pregnancy', r->'lactation', r->'fertility',
  COALESCE(r->'missing_pregnancy_lactation', '{}'::jsonb),
  COALESCE(r->'missing_fertility_sex', '{}'::jsonb),
  COALESCE(r->'sources_pregnancy_lactation', '[]'::jsonb), r,
  'kimi:medication_reproductive_enrichment'
FROM rows
ON CONFLICT (active_substance_id) DO UPDATE SET
  pregnancy = EXCLUDED.pregnancy, lactation = EXCLUDED.lactation, fertility = EXCLUDED.fertility,
  missing_pregnancy_lactation = EXCLUDED.missing_pregnancy_lactation,
  missing_fertility_sex = EXCLUDED.missing_fertility_sex, sources = EXCLUDED.sources,
  raw = EXCLUDED.raw, source = EXCLUDED.source, updated_at = now();

WITH rows AS (
  SELECT r FROM tmp_c286_payload, jsonb_array_elements(payload->'pk') AS r
)
INSERT INTO medical.medication_pk_evidence(active_substance_id, pk_fields, active_metabolites, missing, raw, source)
SELECT r->>'entity_id', COALESCE(r->'pk_fields', '{}'::jsonb), r->'active_metabolites',
  COALESCE(r->'missing', '{}'::jsonb), r, 'kimi:medication_pk_enrichment_crawl_038'
FROM rows
ON CONFLICT (active_substance_id) DO UPDATE SET
  pk_fields = EXCLUDED.pk_fields, active_metabolites = EXCLUDED.active_metabolites,
  missing = EXCLUDED.missing, raw = EXCLUDED.raw, source = EXCLUDED.source, updated_at = now();

WITH rows AS (
  SELECT r FROM tmp_c286_payload, jsonb_array_elements(payload->'renalHepatic') AS r
)
INSERT INTO medical.medication_renal_hepatic_evidence(
  active_substance_id, renal, missing_renal, hepatic, missing_hepatic, raw, source
)
SELECT r->>'entity_id', r->'renal', COALESCE(r->'missing_renal', '{}'::jsonb),
  r->'hepatic', COALESCE(r->'missing_hepatic', '{}'::jsonb), r,
  'kimi:medication_renal_hepatic_enrichment'
FROM rows
ON CONFLICT (active_substance_id) DO UPDATE SET
  renal = EXCLUDED.renal, missing_renal = EXCLUDED.missing_renal, hepatic = EXCLUDED.hepatic,
  missing_hepatic = EXCLUDED.missing_hepatic, raw = EXCLUDED.raw,
  source = EXCLUDED.source, updated_at = now();

WITH rows AS (
  SELECT r FROM tmp_c286_payload, jsonb_array_elements(payload->'clinicalContext') AS r
)
INSERT INTO medical.medication_clinical_context_evidence(active_substance_id, payload, source)
SELECT r->>'entity_id', r, 'kimi:medication_clinical_context_enrichment'
FROM rows
ON CONFLICT (active_substance_id) DO UPDATE SET
  payload = EXCLUDED.payload, source = EXCLUDED.source, updated_at = now();

WITH rows AS (
  SELECT r FROM tmp_c286_payload, jsonb_array_elements(payload->'thailand') AS r
)
INSERT INTO medical.medication_thailand_regulatory_evidence(record_key, active_substance_id, payload, source)
SELECT COALESCE(r->>'entity_id', 'source_registry'), r->>'entity_id', r,
  'kimi:thailand_medication_regulatory_enrichment'
FROM rows
ON CONFLICT (record_key) DO UPDATE SET
  active_substance_id = EXCLUDED.active_substance_id, payload = EXCLUDED.payload,
  source = EXCLUDED.source, updated_at = now();

DELETE FROM supplements.entity_pk
WHERE source = 'kimi:medication_pk_enrichment_crawl_038' AND entity_id LIKE 'drug_%';
DELETE FROM supplements.entity_renal_hepatic
WHERE source IN ('kimi:medication_renal_hepatic_enrichment', 'kimi:medication_reproductive_enrichment')
  AND entity_id LIKE 'drug_%';

COMMIT;
`

run(sql)
