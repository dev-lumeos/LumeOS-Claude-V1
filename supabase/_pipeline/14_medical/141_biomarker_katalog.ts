#!/usr/bin/env node
// C-69: Importiert den C-70/C-70b-LOINC-Masterkatalog und die kuratierten
// Referenzbereich-Kandidaten in das medical-Schema. Die Werte werden aus
// den versionierten Datendateien gelesen; LOINC-Quelldateien werden fuer
// diesen Kettenschritt nicht benoetigt.
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const CONTAINER = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const DB = process.env.PGDATABASE ?? 'postgres'
const LOINC_DIR = 'supabase/_pipeline/daten/biomarker-loinc'
const LOINC_INDEX = path.join(LOINC_DIR, 'index.json')
const CURATED = 'supabase/_pipeline/daten/biomarker-katalog.json'
const EXPECTED_LOINC = 11676
const LICENSE_NOTICE =
  'This material contains content from LOINC (http://loinc.org). LOINC is copyright (c) Regenstrief Institute, Inc. and the Logical Observation Identifiers Names and Codes (LOINC) Committee and is available at no cost under the license at http://loinc.org/license. LOINC is a registered United States trademark of Regenstrief Institute, Inc.'

type LoincFile = {
  records: unknown[]
}

type LoincIndex = {
  total_records: number
  files: Array<{ file: string; records: number }>
}

type CuratedCatalog = {
  records: Array<{
    loinc_code?: string
    reference_ranges?: Array<Record<string, unknown>>
  }>
}

function fail(message: string): never {
  console.error(message)
  process.exit(1)
}

function readJson<T>(file: string): T {
  if (!fs.existsSync(file)) fail(`${file} fehlt`)
  return JSON.parse(fs.readFileSync(file, 'utf8')) as T
}

function csvCell(value: string): string {
  return `"${value.replace(/"/g, '""')}"`
}

function sqlLiteral(value: string): string {
  return `'${value.replace(/'/g, "''")}'`
}

function runPsql(input: string): string {
  const result = spawnSync(
    'docker',
    ['exec', '-i', CONTAINER, 'psql', '-U', 'postgres', '-d', DB, '-v', 'ON_ERROR_STOP=1', '-f', '-'],
    { input, encoding: 'utf8', maxBuffer: 512 * 1024 * 1024 },
  )
  if (result.stdout) process.stdout.write(result.stdout)
  if (result.stderr) process.stderr.write(result.stderr)
  if (result.status !== 0) process.exit(result.status ?? 1)
  return result.stdout
}

const index = readJson<LoincIndex>(LOINC_INDEX)
if (index.total_records !== EXPECTED_LOINC) {
  fail(`${LOINC_INDEX}: total_records ${index.total_records}, erwartet ${EXPECTED_LOINC}`)
}

const loincRecords: unknown[] = []
for (const entry of index.files) {
  const file = path.join(LOINC_DIR, entry.file)
  const data = readJson<LoincFile>(file)
  if (!Array.isArray(data.records)) fail(`${file}: records fehlt`)
  if (data.records.length !== entry.records) {
    fail(`${file}: ${data.records.length} records, Index erwartet ${entry.records}`)
  }
  loincRecords.push(...data.records)
}

if (loincRecords.length !== EXPECTED_LOINC) {
  fail(`LOINC-Import: ${loincRecords.length} Records, erwartet ${EXPECTED_LOINC}`)
}

const curated = readJson<CuratedCatalog>(CURATED)
const rangeRows: Array<Record<string, unknown> & {
  loinc_code?: string
  curated_slug?: string
  canonical_name_en?: string
}> = []
for (const record of curated.records) {
  if (!Array.isArray(record.reference_ranges)) continue
  for (const range of record.reference_ranges) {
    rangeRows.push({
      loinc_code: record.loinc_code,
      curated_slug: (record as Record<string, unknown>).slug as string | undefined,
      canonical_name_en: (record as Record<string, unknown>).canonical_name_en as string | undefined,
      ...range,
    })
  }
}

const loincPayload = loincRecords.map(record => csvCell(JSON.stringify(record))).join('\n')
const rangePayload = rangeRows.map(record => csvCell(JSON.stringify(record))).join('\n')

const sql = `
BEGIN;

CREATE TEMP TABLE tmp_medical_loinc (payload jsonb NOT NULL) ON COMMIT DROP;
\\copy tmp_medical_loinc(payload) FROM STDIN WITH (FORMAT csv)
${loincPayload}
\\.

INSERT INTO medical.biomarker_catalog (
  loinc_code,
  loinc_status,
  common_test_rank,
  class_type,
  class_type_name,
  loinc_class,
  panel_type,
  order_observation,
  component,
  long_common_name,
  short_name,
  display_name,
  consumer_name,
  german_component,
  german_long_name,
  german_display_name,
  german_class_name,
  example_units,
  example_ucum_units,
  units_required,
  property,
  time_aspect,
  system,
  scale_type,
  method,
  definition,
  synonyms,
  panels,
  external_copyright_notice,
  reference_range_status,
  source_file,
  loinc_version,
  license_notice
)
SELECT
  payload->>'loinc_code',
  payload->>'status',
  (payload->>'common_test_rank')::integer,
  (payload->>'class_type')::smallint,
  payload->>'class_type_name',
  payload->>'class',
  payload->>'panel_type',
  payload->>'order_observation',
  payload #>> '{names,component}',
  payload #>> '{names,long_common_name}',
  payload #>> '{names,short_name}',
  payload #>> '{names,display_name}',
  payload #>> '{names,consumer_name}',
  payload #>> '{names,german,component}',
  payload #>> '{names,german,long_name}',
  payload #>> '{names,german,display_name}',
  payload #>> '{names,german,class_name}',
  payload #>> '{units,example_units}',
  payload #>> '{units,example_ucum_units}',
  payload #>> '{units,units_required}',
  payload->>'property',
  payload->>'time_aspect',
  payload->>'system',
  payload->>'scale',
  payload->>'method',
  payload->>'definition',
  COALESCE(payload->'synonyms', '{}'::jsonb),
  COALESCE(payload->'panels', '[]'::jsonb),
  payload->>'external_copyright_notice',
  COALESCE(payload #>> '{reference_ranges,status}', 'not_in_loinc'),
  payload #>> '{source,source_file}',
  COALESCE(payload #>> '{source,version}', '2.82'),
  ${sqlLiteral(LICENSE_NOTICE)}
FROM tmp_medical_loinc
ON CONFLICT (loinc_code) DO UPDATE SET
  loinc_status = EXCLUDED.loinc_status,
  common_test_rank = EXCLUDED.common_test_rank,
  class_type = EXCLUDED.class_type,
  class_type_name = EXCLUDED.class_type_name,
  loinc_class = EXCLUDED.loinc_class,
  panel_type = EXCLUDED.panel_type,
  order_observation = EXCLUDED.order_observation,
  component = EXCLUDED.component,
  long_common_name = EXCLUDED.long_common_name,
  short_name = EXCLUDED.short_name,
  display_name = EXCLUDED.display_name,
  consumer_name = EXCLUDED.consumer_name,
  german_component = EXCLUDED.german_component,
  german_long_name = EXCLUDED.german_long_name,
  german_display_name = EXCLUDED.german_display_name,
  german_class_name = EXCLUDED.german_class_name,
  example_units = EXCLUDED.example_units,
  example_ucum_units = EXCLUDED.example_ucum_units,
  units_required = EXCLUDED.units_required,
  property = EXCLUDED.property,
  time_aspect = EXCLUDED.time_aspect,
  system = EXCLUDED.system,
  scale_type = EXCLUDED.scale_type,
  method = EXCLUDED.method,
  definition = EXCLUDED.definition,
  synonyms = EXCLUDED.synonyms,
  panels = EXCLUDED.panels,
  external_copyright_notice = EXCLUDED.external_copyright_notice,
  reference_range_status = EXCLUDED.reference_range_status,
  source_file = EXCLUDED.source_file,
  loinc_version = EXCLUDED.loinc_version,
  license_notice = EXCLUDED.license_notice,
  imported_at = now();

CREATE TEMP TABLE tmp_medical_ranges (payload jsonb NOT NULL) ON COMMIT DROP;
\\copy tmp_medical_ranges(payload) FROM STDIN WITH (FORMAT csv)
${rangePayload}
\\.

DELETE FROM medical.biomarker_reference_ranges;

INSERT INTO medical.biomarker_reference_ranges (
  loinc_code,
  curated_slug,
  canonical_name_en,
  range_type,
  sex,
  age_min_years,
  age_max_years,
  population,
  min_value,
  max_value,
  value_text,
  unit,
  source,
  source_path,
  source_status,
  decision_status,
  is_active
)
SELECT
  CASE
    WHEN EXISTS (
      SELECT 1
      FROM medical.biomarker_catalog c
      WHERE c.loinc_code = NULLIF(payload->>'loinc_code', '')
    )
    THEN NULLIF(payload->>'loinc_code', '')
    ELSE NULL
  END,
  NULLIF(payload->>'curated_slug', ''),
  NULLIF(payload->>'canonical_name_en', ''),
  CASE payload->>'range_type'
    WHEN 'threshold' THEN 'threshold'
    WHEN 'optimal' THEN 'optimal'
    ELSE 'lab'
  END,
  COALESCE(NULLIF(payload->>'sex', ''), 'all'),
  NULLIF(payload->>'age_min', '')::numeric,
  NULLIF(payload->>'age_max', '')::numeric,
  COALESCE(NULLIF(payload->>'population', ''), 'general'),
  NULLIF(payload->>'min', '')::numeric,
  NULLIF(payload->>'max', '')::numeric,
  payload->>'value_text',
  payload->>'unit',
  COALESCE(NULLIF(payload->>'source', ''), 'unknown'),
  payload->>'source_path',
  COALESCE(NULLIF(payload->>'source_status', ''), 'unknown'),
  COALESCE(NULLIF(payload->>'decision_status', ''), 'unknown'),
  COALESCE(payload->>'decision_status', '') <> 'do_not_import_without_source'
FROM tmp_medical_ranges;

COMMIT;
`

const started = Date.now()
runPsql(sql)
const seconds = ((Date.now() - started) / 1000).toFixed(1)

const check = runPsql(`
SELECT
  (SELECT count(*) FROM medical.biomarker_catalog)::text AS catalog,
  (SELECT count(*) FROM medical.biomarker_reference_ranges)::text AS ranges,
  (SELECT count(*) FROM medical.biomarker_catalog WHERE example_ucum_units IS NOT NULL)::text AS with_ucum,
  (SELECT count(*) FROM medical.biomarker_catalog WHERE german_long_name IS NOT NULL OR german_component IS NOT NULL)::text AS with_german;
`)

console.log(`Medical-Katalog importiert: ${EXPECTED_LOINC} LOINC-Records, ${rangeRows.length} Referenzbereich-Kandidaten (${seconds}s).`)
console.log(check.trim())
