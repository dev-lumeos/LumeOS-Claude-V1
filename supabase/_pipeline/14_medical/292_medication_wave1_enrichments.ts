#!/usr/bin/env node
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const CONTAINER = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const DB = process.env.PGDATABASE ?? 'postgres'
const BASE = 'docs/kimi_research/supplement_performance_database/data/evidence'

type Json = Record<string, unknown>

const expected = {
  identifiers: { rows: 465, uniqueIds: 442, cas: 433, atc: 21, missing: 11 },
  mechanism: { rows: 302, content: 298, missing: 4 },
  precautions: { rows: 385, content: 381, missing: 4 },
  reproductive: { rows: 81, pregnancy: 81, lactation: 81, fertility: 81, sexSpecific: 0 },
}

function readJsonl(file: string): Json[] {
  return fs.readFileSync(path.join(BASE, file), 'utf8')
    .split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line) as Json)
}

function present(value: unknown): boolean {
  if (value === null || value === undefined) return false
  if (typeof value === 'string') return value.trim() !== ''
  if (Array.isArray(value)) return value.length > 0
  if (typeof value === 'object') return Object.keys(value).length > 0
  return true
}

function countPresent(rows: Json[], field: string): number {
  return rows.filter((row) => present(row[field])).length
}

function requireCount(name: string, actual: number, required: number): void {
  if (actual !== required) throw new Error(`${name}: ${actual}, erwartet ${required}`)
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
}

const identifiers = readJsonl('medication_identifiers_enrichment.jsonl')
const mechanism = readJsonl('medication_moa_enrichment.jsonl')
const precautions = readJsonl('medication_precautions_enrichment.jsonl')
const reproductive = readJsonl('medication_reproductive_enrichment_rest.jsonl')

requireCount('identifiers.rows', identifiers.length, expected.identifiers.rows)
requireCount('identifiers.uniqueIds', new Set(identifiers.map((row) => row.entity_id)).size, expected.identifiers.uniqueIds)
requireCount('identifiers.cas', countPresent(identifiers, 'cas'), expected.identifiers.cas)
requireCount('identifiers.atc', countPresent(identifiers, 'atc'), expected.identifiers.atc)
requireCount('identifiers.missing', countPresent(identifiers, 'missing_reason'), expected.identifiers.missing)
requireCount('mechanism.rows', mechanism.length, expected.mechanism.rows)
requireCount('mechanism.content', countPresent(mechanism, 'mechanism_of_action'), expected.mechanism.content)
requireCount('mechanism.missing', countPresent(mechanism, 'missing_reason'), expected.mechanism.missing)
requireCount('precautions.rows', precautions.length, expected.precautions.rows)
requireCount('precautions.content', countPresent(precautions, 'precautions'), expected.precautions.content)
requireCount('precautions.missing', countPresent(precautions, 'missing_reason'), expected.precautions.missing)
requireCount('reproductive.rows', reproductive.length, expected.reproductive.rows)
requireCount('reproductive.pregnancy', countPresent(reproductive, 'pregnancy'), expected.reproductive.pregnancy)
requireCount('reproductive.lactation', countPresent(reproductive, 'lactation'), expected.reproductive.lactation)
requireCount('reproductive.fertility', countPresent(reproductive, 'fertility'), expected.reproductive.fertility)
requireCount('reproductive.sexSpecific', countPresent(reproductive, 'sex_specific'), expected.reproductive.sexSpecific)

const payload = { identifiers, mechanism, precautions, reproductive }

const sql = `\\set ON_ERROR_STOP on
BEGIN;

DROP TABLE IF EXISTS tmp_c292_payload;
CREATE TEMP TABLE tmp_c292_payload (payload jsonb NOT NULL);
\\copy tmp_c292_payload(payload) FROM STDIN WITH (FORMAT csv)
${csvJson([payload])}
\\.

DO $$
DECLARE missing_count integer;
BEGIN
  SELECT count(*) INTO missing_count
  FROM (
    SELECT r->>'entity_id' AS id FROM tmp_c292_payload, jsonb_array_elements(payload->'identifiers') AS r
    UNION ALL SELECT r->>'entity_id' FROM tmp_c292_payload, jsonb_array_elements(payload->'mechanism') AS r
    UNION ALL SELECT r->>'entity_id' FROM tmp_c292_payload, jsonb_array_elements(payload->'precautions') AS r
    UNION ALL SELECT r->>'entity_id' FROM tmp_c292_payload, jsonb_array_elements(payload->'reproductive') AS r
  ) source_rows
  LEFT JOIN medical.medication_active_substances catalog ON catalog.id = source_rows.id
  WHERE catalog.id IS NULL;
  IF missing_count <> 0 THEN
    RAISE EXCEPTION 'C-292: % Enrichment-IDs fehlen im Medikamentenkatalog', missing_count;
  END IF;
END $$;

WITH rows AS (
  SELECT r->>'entity_id' AS id,
    max(NULLIF(btrim(r->>'cas'), '')) AS cas,
    max(NULLIF(btrim(r->>'atc'), '')) AS atc,
    jsonb_agg(r ORDER BY r->>'generated_by') AS evidence
  FROM tmp_c292_payload, jsonb_array_elements(payload->'identifiers') AS r
  GROUP BY r->>'entity_id'
)
UPDATE medical.medication_active_substances substance
SET cas_number = COALESCE(NULLIF(btrim(substance.cas_number), ''), rows.cas),
    atc_code = COALESCE(NULLIF(btrim(substance.atc_code), ''), rows.atc),
    evidence_provenance = substance.evidence_provenance || jsonb_build_object('c292_identifiers', rows.evidence),
    updated_at = now()
FROM rows
WHERE substance.id = rows.id;

WITH rows AS (
  SELECT r->>'entity_id' AS id, r
  FROM tmp_c292_payload, jsonb_array_elements(payload->'mechanism') AS r
)
UPDATE medical.medication_active_substances substance
SET pharmacology = CASE
      WHEN NULLIF(btrim(rows.r->>'mechanism_of_action'), '') IS NOT NULL
        AND NULLIF(btrim(substance.pharmacology->>'mechanism_of_action'), '') IS NULL
      THEN substance.pharmacology || jsonb_build_object('mechanism_of_action', rows.r->>'mechanism_of_action')
      ELSE substance.pharmacology
    END,
    evidence_provenance = substance.evidence_provenance || jsonb_build_object('c292_mechanism_of_action', rows.r),
    updated_at = now()
FROM rows
WHERE substance.id = rows.id;

WITH rows AS (
  SELECT r->>'entity_id' AS id, r
  FROM tmp_c292_payload, jsonb_array_elements(payload->'precautions') AS r
)
UPDATE medical.medication_active_substances substance
SET precautions = CASE
      WHEN jsonb_typeof(rows.r->'precautions') = 'array'
        AND jsonb_array_length(rows.r->'precautions') > 0
        AND (substance.precautions = '[]'::jsonb OR substance.precautions = '{}'::jsonb OR substance.precautions = 'null'::jsonb)
      THEN rows.r->'precautions'
      ELSE substance.precautions
    END,
    evidence_provenance = substance.evidence_provenance || jsonb_build_object('c292_precautions', rows.r),
    updated_at = now()
FROM rows
WHERE substance.id = rows.id;

WITH rows AS (
  SELECT r FROM tmp_c292_payload, jsonb_array_elements(payload->'reproductive') AS r
)
INSERT INTO medical.medication_reproductive_evidence(
  active_substance_id, pregnancy, lactation, fertility, missing_pregnancy_lactation,
  missing_fertility_sex, sources, raw, source
)
SELECT r->>'entity_id', r->'pregnancy', r->'lactation', r->'fertility',
  COALESCE(r->'missing_pregnancy_lactation', '{}'::jsonb),
  COALESCE(r->'missing_fertility_sex', '{}'::jsonb),
  COALESCE(r->'sources_pregnancy_lactation', '[]'::jsonb), r,
  'kimi:medication_reproductive_enrichment_rest'
FROM rows
ON CONFLICT (active_substance_id) DO NOTHING;

DO $$
DECLARE
  cas_count integer;
  atc_count integer;
  mechanism_count integer;
  precaution_count integer;
  reproduction_count integer;
  missing_reason_errors integer;
BEGIN
  SELECT
    count(*) FILTER (WHERE NULLIF(btrim(cas_number), '') IS NOT NULL),
    count(*) FILTER (WHERE NULLIF(btrim(atc_code), '') IS NOT NULL),
    count(*) FILTER (WHERE NULLIF(btrim(pharmacology->>'mechanism_of_action'), '') IS NOT NULL),
    count(*) FILTER (WHERE precautions <> '{}'::jsonb AND precautions <> '[]'::jsonb AND precautions <> 'null'::jsonb)
  INTO cas_count, atc_count, mechanism_count, precaution_count
  FROM medical.medication_active_substances;
  SELECT count(*) INTO reproduction_count FROM medical.medication_reproductive_evidence;

  SELECT count(*) INTO missing_reason_errors
  FROM (
    SELECT 1
    FROM medical.medication_active_substances substance
    CROSS JOIN LATERAL jsonb_array_elements(COALESCE(substance.evidence_provenance->'c292_identifiers', '[]'::jsonb)) AS identifier(record)
    WHERE NULLIF(btrim(identifier.record->>'cas'), '') IS NULL
      AND NULLIF(btrim(identifier.record->>'atc'), '') IS NULL
      AND NULLIF(btrim(identifier.record->>'missing_reason'), '') IS NULL
    UNION ALL
    SELECT 1
    FROM medical.medication_active_substances substance
    WHERE substance.evidence_provenance ? 'c292_mechanism_of_action'
      AND NULLIF(btrim(substance.evidence_provenance->'c292_mechanism_of_action'->>'mechanism_of_action'), '') IS NULL
      AND NULLIF(btrim(substance.evidence_provenance->'c292_mechanism_of_action'->>'missing_reason'), '') IS NULL
    UNION ALL
    SELECT 1
    FROM medical.medication_active_substances substance
    WHERE substance.evidence_provenance ? 'c292_precautions'
      AND (substance.evidence_provenance->'c292_precautions'->'precautions' IS NULL
        OR substance.evidence_provenance->'c292_precautions'->'precautions' = '[]'::jsonb)
      AND NULLIF(btrim(substance.evidence_provenance->'c292_precautions'->>'missing_reason'), '') IS NULL
  ) missing_records;

  IF cas_count < 489 OR atc_count < 497 OR mechanism_count < 494 OR precaution_count < 393 OR reproduction_count < 498 THEN
    RAISE EXCEPTION 'C-292: Inhalt unvollstaendig (CAS %, ATC %, MoA %, Vorsicht %, Reproduktion %)',
      cas_count, atc_count, mechanism_count, precaution_count, reproduction_count;
  END IF;
  IF missing_reason_errors <> 0 THEN
    RAISE EXCEPTION 'C-292: % leere Enrichment-Werte ohne missing_reason', missing_reason_errors;
  END IF;
END $$;

COMMIT;
`

run(sql)
