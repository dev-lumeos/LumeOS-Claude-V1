#!/usr/bin/env node
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const CONTAINER = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const DB = process.env.PGDATABASE ?? 'postgres'
const SOURCE = 'docs/kimi_research/supplement_performance_database/data/evidence/supplement_dosing_enrichment.jsonl'

type Json = Record<string, any>

function readJsonl(file: string): Json[] {
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
    process.stdout.write(result.stdout)
    process.stderr.write(result.stderr)
    process.exit(result.status ?? 1)
  }
  process.stdout.write(result.stdout)
  process.stderr.write(result.stderr)
}

const records = readJsonl(SOURCE)
if (records.length !== 290) throw new Error(`supplement_dosing_enrichment: ${records.length}, erwartet 290`)

const expected = {
  mapped: Number(process.env.C270_EXPECT_MAPPED ?? 290),
  guidelineDose: Number(process.env.C270_EXPECT_GUIDELINE_DOSE ?? 290),
  officialLabelDose: Number(process.env.C270_EXPECT_OFFICIAL_LABEL_DOSE ?? 290),
  upperLimit: Number(process.env.C270_EXPECT_UPPER_LIMIT ?? 252),
  studiedDoseRanges: Number(process.env.C270_EXPECT_STUDIED_DOSE_RANGES ?? 206),
  doseUnit: Number(process.env.C270_EXPECT_DOSE_UNIT ?? 58),
  frequency: Number(process.env.C270_EXPECT_FREQUENCY ?? 58),
  durationStudied: Number(process.env.C270_EXPECT_DURATION_STUDIED ?? 58),
  statusUnknownKimi: Number(process.env.C270_EXPECT_STATUS_UNKNOWN_KIMI ?? 0),
}

const payload = { records, expected }

const sql = `\\set ON_ERROR_STOP on
BEGIN;

ALTER TABLE supplements.supplement_dosing
  ADD COLUMN IF NOT EXISTS frequency_de text,
  ADD COLUMN IF NOT EXISTS frequency_en text,
  ADD COLUMN IF NOT EXISTS frequency_th text,
  ADD COLUMN IF NOT EXISTS duration_studied_de text,
  ADD COLUMN IF NOT EXISTS duration_studied_en text,
  ADD COLUMN IF NOT EXISTS duration_studied_th text,
  ADD COLUMN IF NOT EXISTS provenance_note text,
  ADD COLUMN IF NOT EXISTS integration_note text,
  ADD COLUMN IF NOT EXISTS sources jsonb NOT NULL DEFAULT '[]'::jsonb;

DROP TABLE IF EXISTS tmp_c270_dosing;
CREATE TEMP TABLE tmp_c270_dosing (payload jsonb NOT NULL);
\\copy tmp_c270_dosing(payload) FROM STDIN WITH (FORMAT csv)
${csvJson([payload])}
\\.

WITH rows AS (
  SELECT jsonb_array_elements(payload->'records') AS r
  FROM tmp_c270_dosing
), mapped AS (
  SELECT
    s.id AS supplement_id,
    r,
    r->'fields' AS fields
  FROM rows
  JOIN supplements.supplements s ON s.slug = r->>'entity_id'
), prepared AS (
  SELECT
    supplement_id,
    r,
    fields,
    CASE
      WHEN fields ? 'guideline_dose' THEN fields->'guideline_dose'
      ELSE NULL
    END AS guideline_dose,
    CASE
      WHEN fields ? 'official_label_dose' THEN fields->'official_label_dose'
      ELSE NULL
    END AS official_label_dose,
    CASE
      WHEN fields ? 'studied_dose_ranges' THEN fields->'studied_dose_ranges'
      ELSE NULL
    END AS studied_dose_ranges,
    CASE
      WHEN fields ? 'upper_limit' THEN fields->'upper_limit'
      ELSE NULL
    END AS upper_limit,
    NULLIF(btrim(fields#>>'{dose_units,value}'), '') AS dose_unit,
    NULLIF(btrim(fields#>>'{frequency,value}'), '') AS frequency_en,
    NULLIF(btrim(fields#>>'{duration_studied,value}'), '') AS duration_studied_en,
    (
      SELECT coalesce(jsonb_agg(DISTINCT source_item), '[]'::jsonb)
      FROM jsonb_each(fields) AS e(field_name, field_value)
      CROSS JOIN LATERAL jsonb_array_elements(coalesce(field_value->'source_ids', '[]'::jsonb)) AS source_item
    ) AS sources
  FROM mapped
)
UPDATE supplements.supplement_dosing d
SET
  status = 'bekannt',
  official_label_dose = p.official_label_dose,
  guideline_dose = p.guideline_dose,
  studied_dose_ranges = p.studied_dose_ranges,
  upper_limit = p.upper_limit,
  dose_unit = p.dose_unit,
  frequency_de = NULL,
  frequency_en = p.frequency_en,
  frequency_th = NULL,
  duration_studied_de = NULL,
  duration_studied_en = p.duration_studied_en,
  duration_studied_th = NULL,
  provenance_note = NULLIF(p.r->>'provenance_note', ''),
  integration_note = NULLIF(p.r->>'integration_note', ''),
  sources = p.sources,
  source = 'kimi:supplement_dosing_enrichment',
  updated_at = now()
FROM prepared p
WHERE d.supplement_id = p.supplement_id;

DO $$
DECLARE
  v_expected jsonb;
  v_mapped int;
  v_guideline int;
  v_official int;
  v_upper int;
  v_studied int;
  v_dose_unit int;
  v_frequency int;
  v_duration int;
  v_unknown int;
BEGIN
  SELECT payload->'expected' INTO v_expected FROM tmp_c270_dosing;

  WITH rows AS (
    SELECT jsonb_array_elements(payload->'records') AS r FROM tmp_c270_dosing
  )
  SELECT count(*) INTO v_mapped
  FROM rows
  JOIN supplements.supplements s ON s.slug = r->>'entity_id';

  SELECT
    count(*) FILTER (WHERE d.guideline_dose IS NOT NULL),
    count(*) FILTER (WHERE d.official_label_dose IS NOT NULL),
    count(*) FILTER (WHERE d.upper_limit IS NOT NULL),
    count(*) FILTER (WHERE d.studied_dose_ranges IS NOT NULL),
    count(*) FILTER (WHERE NULLIF(d.dose_unit, '') IS NOT NULL),
    count(*) FILTER (WHERE NULLIF(d.frequency_en, '') IS NOT NULL),
    count(*) FILTER (WHERE NULLIF(d.duration_studied_en, '') IS NOT NULL),
    count(*) FILTER (WHERE d.status = 'unbekannt')
  INTO v_guideline, v_official, v_upper, v_studied, v_dose_unit, v_frequency, v_duration, v_unknown
  FROM tmp_c270_dosing t
  CROSS JOIN LATERAL jsonb_array_elements(t.payload->'records') AS r
  JOIN supplements.supplements s ON s.slug = r->>'entity_id'
  JOIN supplements.supplement_dosing d ON d.supplement_id = s.id;

  IF v_mapped <> (v_expected->>'mapped')::int THEN
    RAISE EXCEPTION 'C-270: mapped %, erwartet %', v_mapped, v_expected->>'mapped';
  END IF;
  IF v_guideline <> (v_expected->>'guidelineDose')::int THEN
    RAISE EXCEPTION 'C-270: guideline_dose %, erwartet %', v_guideline, v_expected->>'guidelineDose';
  END IF;
  IF v_official <> (v_expected->>'officialLabelDose')::int THEN
    RAISE EXCEPTION 'C-270: official_label_dose %, erwartet %', v_official, v_expected->>'officialLabelDose';
  END IF;
  IF v_upper <> (v_expected->>'upperLimit')::int THEN
    RAISE EXCEPTION 'C-270: upper_limit %, erwartet %', v_upper, v_expected->>'upperLimit';
  END IF;
  IF v_studied <> (v_expected->>'studiedDoseRanges')::int THEN
    RAISE EXCEPTION 'C-270: studied_dose_ranges %, erwartet %', v_studied, v_expected->>'studiedDoseRanges';
  END IF;
  IF v_dose_unit <> (v_expected->>'doseUnit')::int THEN
    RAISE EXCEPTION 'C-270: dose_unit %, erwartet %', v_dose_unit, v_expected->>'doseUnit';
  END IF;
  IF v_frequency <> (v_expected->>'frequency')::int THEN
    RAISE EXCEPTION 'C-270: frequency_en %, erwartet %', v_frequency, v_expected->>'frequency';
  END IF;
  IF v_duration <> (v_expected->>'durationStudied')::int THEN
    RAISE EXCEPTION 'C-270: duration_studied_en %, erwartet %', v_duration, v_expected->>'durationStudied';
  END IF;
  IF v_unknown <> (v_expected->>'statusUnknownKimi')::int THEN
    RAISE EXCEPTION 'C-270: status unbekannt %, erwartet %', v_unknown, v_expected->>'statusUnknownKimi';
  END IF;

  RAISE NOTICE 'OK: C-270 Dosis-Enrichment %, guideline %, upper %, studied %, unit %, frequency %, duration %, unknown %',
    v_mapped, v_guideline, v_upper, v_studied, v_dose_unit, v_frequency, v_duration, v_unknown;
END $$;

COMMIT;
`

run(sql)
