#!/usr/bin/env node
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const CONTAINER = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const DB = process.env.PGDATABASE ?? 'postgres'
const SOURCE = 'docs/kimi_research/supplement_performance_database/reports/med_texts_ws/master_de_meds.jsonl'

type Json = Record<string, unknown>

const expected = {
  records: 498,
  faq: 2313,
  zuWenigNull: 40,
  mythenNull: 115,
  sources: 1342,
  verifiedSources: 193,
  unverifiedSources: 1149,
}

const requiredTextFields = [
  'kurz_was_de', 'wie_wirkt_de', 'was_bringt_es_de', 'zu_viel_de', 'wann_wie_de',
  'verschreibungspflicht_klartext_de', 'absetzen_de', 'wechselwirkung_alltag_de',
]

function readJsonl(file: string): Json[] {
  return fs.readFileSync(file, 'utf8').split(/\r?\n/).filter(Boolean)
    .map((line) => JSON.parse(line) as Json)
}

function present(value: unknown): boolean {
  if (value === null || value === undefined) return false
  if (typeof value === 'string') return value.trim() !== ''
  if (Array.isArray(value)) return value.length > 0
  if (typeof value === 'object') return Object.keys(value as Json).length > 0
  return true
}

function requireCount(name: string, actual: number, required: number): void {
  if (actual !== required) throw new Error(`${name}: ${actual}, erwartet ${required}`)
}

function requireText(value: unknown, context: string): void {
  if (typeof value !== 'string' || value.trim() === '') throw new Error(`${context}: Text fehlt`)
}

function requireStringArray(value: unknown, context: string): void {
  if (!Array.isArray(value) || value.length === 0 || value.some((entry) => typeof entry !== 'string' || entry.trim() === '')) {
    throw new Error(`${context}: nichtleeres String-Array erwartet`)
  }
}

function requireMyths(value: unknown, context: string): void {
  if (typeof value === 'string') {
    requireText(value, context)
    return
  }
  if (!Array.isArray(value) || value.length === 0) throw new Error(`${context}: Text oder nichtleeres Array erwartet`)
  for (const [index, entry] of value.entries()) {
    if (typeof entry === 'string') {
      requireText(entry, `${context}[${index}]`)
    } else if (typeof entry === 'object' && entry !== null && !Array.isArray(entry)) {
      requireText((entry as Json).mythos_de, `${context}[${index}].mythos_de`)
      requireText((entry as Json).fakt_de, `${context}[${index}].fakt_de`)
    } else {
      throw new Error(`${context}[${index}]: Text oder Mythos/Fakt-Objekt erwartet`)
    }
  }
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

const records = readJsonl(SOURCE)
requireCount('records', records.length, expected.records)
requireCount('entity_id', new Set(records.map((record) => record.entity_id)).size, expected.records)
requireCount('missing_reason keys', records.filter((record) => Object.hasOwn(record, 'missing_reason')).length, 0)
requireCount('kurz_was_de', records.filter((record) => present(record.kurz_was_de)).length, expected.records)
requireCount('zu_wenig_de null', records.filter((record) => record.zu_wenig_de === null).length, expected.zuWenigNull)
requireCount('mythen_de null', records.filter((record) => record.mythen_de === null).length, expected.mythenNull)

for (const record of records) {
  requireText(record.entity_id, 'entity_id')
  requireText(record.canonical_name, `${record.entity_id}.canonical_name`)
  for (const field of requiredTextFields) requireText(record[field], `${record.entity_id}.${field}`)
  requireStringArray(record.wofuer_de, `${record.entity_id}.wofuer_de`)
  requireStringArray(record.wer_nicht_de, `${record.entity_id}.wer_nicht_de`)
  if (record.mythen_de !== null) requireMyths(record.mythen_de, `${record.entity_id}.mythen_de`)
  if (!Array.isArray(record.faq_de)) throw new Error(`${record.entity_id}.faq_de: Array erwartet`)
  for (const [index, faq] of record.faq_de.entries()) {
    if (typeof faq !== 'object' || faq === null || Array.isArray(faq)) throw new Error(`${record.entity_id}.faq_de[${index}]: Objekt erwartet`)
    requireText((faq as Json).frage_de, `${record.entity_id}.faq_de[${index}].frage_de`)
    requireText((faq as Json).antwort_de, `${record.entity_id}.faq_de[${index}].antwort_de`)
  }
  if (!Array.isArray(record.sources)) throw new Error(`${record.entity_id}.sources: Array erwartet`)
}

const faqCount = records.reduce((total, record) => total + (record.faq_de as unknown[]).length, 0)
const sourceRows = records.flatMap((record) => record.sources as Json[])
requireCount('faq', faqCount, expected.faq)
requireCount('sources', sourceRows.length, expected.sources)
requireCount('verified sources', sourceRows.filter((source) => source.verified === true).length, expected.verifiedSources)
requireCount('unverified sources', sourceRows.filter((source) => source.verified === false).length, expected.unverifiedSources)

const payload = { records }
const sql = `\\set ON_ERROR_STOP on
BEGIN;

DROP TABLE IF EXISTS tmp_c293_payload;
CREATE TEMP TABLE tmp_c293_payload (payload jsonb NOT NULL);
\\copy tmp_c293_payload(payload) FROM STDIN WITH (FORMAT csv)
${csvJson([payload])}
\\.

DO $$
DECLARE missing_count integer;
BEGIN
  SELECT count(*) INTO missing_count
  FROM tmp_c293_payload, jsonb_array_elements(payload->'records') AS source_row(record)
  LEFT JOIN medical.medication_active_substances catalog ON catalog.id = source_row.record->>'entity_id'
  WHERE catalog.id IS NULL;
  IF missing_count <> 0 THEN
    RAISE EXCEPTION 'C-293: % entity_id fehlen im Medikamentenkatalog', missing_count;
  END IF;
END $$;

WITH rows AS (
  SELECT record AS r FROM tmp_c293_payload, jsonb_array_elements(payload->'records') AS source_row(record)
)
INSERT INTO medical.medication_user_texts (
  active_substance_id,
  kurz_was_de, wofuer_de, wie_wirkt_de, was_bringt_es_de, zu_viel_de, zu_wenig_de,
  wann_wie_de, wer_nicht_de, mythen_de, verschreibungspflicht_klartext_de, absetzen_de,
  wechselwirkung_alltag_de, null_context, sources, source
)
SELECT
  r->>'entity_id',
  r->>'kurz_was_de',
  ARRAY(SELECT jsonb_array_elements_text(r->'wofuer_de')),
  r->>'wie_wirkt_de', r->>'was_bringt_es_de', r->>'zu_viel_de', r->>'zu_wenig_de',
  r->>'wann_wie_de',
  ARRAY(SELECT jsonb_array_elements_text(r->'wer_nicht_de')),
  CASE WHEN jsonb_typeof(r->'mythen_de') = 'null' THEN NULL ELSE r->'mythen_de' END,
  r->>'verschreibungspflicht_klartext_de', r->>'absetzen_de', r->>'wechselwirkung_alltag_de',
  jsonb_strip_nulls(jsonb_build_object(
    'zu_wenig_de', CASE WHEN r->>'zu_wenig_de' IS NULL THEN jsonb_build_object(
      'source_value', 'null', 'reason_status', 'not_supplied',
      'reason_basis', 'master_de_meds.jsonl has no missing_reason field; no safe clinical inference'
    ) END,
    'mythen_de', CASE WHEN jsonb_typeof(r->'mythen_de') = 'null' THEN jsonb_build_object(
      'source_value', 'null', 'reason_status', 'not_supplied',
      'reason_basis', 'master_de_meds.jsonl has no missing_reason field; no safe clinical inference'
    ) END
  )),
  r->'sources',
  '${SOURCE}'
FROM rows
ON CONFLICT (active_substance_id) DO UPDATE SET
  kurz_was_de = EXCLUDED.kurz_was_de,
  wofuer_de = EXCLUDED.wofuer_de,
  wie_wirkt_de = EXCLUDED.wie_wirkt_de,
  was_bringt_es_de = EXCLUDED.was_bringt_es_de,
  zu_viel_de = EXCLUDED.zu_viel_de,
  zu_wenig_de = EXCLUDED.zu_wenig_de,
  wann_wie_de = EXCLUDED.wann_wie_de,
  wer_nicht_de = EXCLUDED.wer_nicht_de,
  mythen_de = EXCLUDED.mythen_de,
  verschreibungspflicht_klartext_de = EXCLUDED.verschreibungspflicht_klartext_de,
  absetzen_de = EXCLUDED.absetzen_de,
  wechselwirkung_alltag_de = EXCLUDED.wechselwirkung_alltag_de,
  null_context = EXCLUDED.null_context,
  sources = EXCLUDED.sources,
  source = EXCLUDED.source,
  updated_at = now();

WITH rows AS (
  SELECT record AS r FROM tmp_c293_payload, jsonb_array_elements(payload->'records') AS source_row(record)
)
INSERT INTO medical.medication_faq (
  active_substance_id, frage_de, antwort_de, sort_order, sources, source
)
SELECT
  r->>'entity_id', faq.item->>'frage_de', faq.item->>'antwort_de', faq.sort_order::integer,
  r->'sources', '${SOURCE}'
FROM rows
CROSS JOIN LATERAL jsonb_array_elements(r->'faq_de') WITH ORDINALITY AS faq(item, sort_order)
ON CONFLICT (active_substance_id, sort_order) DO UPDATE SET
  frage_de = EXCLUDED.frage_de,
  antwort_de = EXCLUDED.antwort_de,
  sources = EXCLUDED.sources,
  source = EXCLUDED.source,
  updated_at = now();

DO $$
DECLARE
  text_count integer;
  faq_count integer;
  missing_text_count integer;
  missing_faq_count integer;
  zu_wenig_null_count integer;
  mythen_null_count integer;
  null_context_count integer;
  source_count integer;
  verified_source_count integer;
  unverified_source_count integer;
BEGIN
  SELECT count(*),
    count(*) FILTER (WHERE btrim(kurz_was_de) = '' OR cardinality(wofuer_de) = 0
      OR btrim(wie_wirkt_de) = '' OR btrim(was_bringt_es_de) = '' OR btrim(zu_viel_de) = ''
      OR btrim(wann_wie_de) = '' OR cardinality(wer_nicht_de) = 0
      OR btrim(verschreibungspflicht_klartext_de) = '' OR btrim(absetzen_de) = ''
      OR btrim(wechselwirkung_alltag_de) = '')
  INTO text_count, missing_text_count
  FROM medical.medication_user_texts;
  SELECT count(*), count(*) FILTER (WHERE btrim(frage_de) = '' OR btrim(antwort_de) = '')
  INTO faq_count, missing_faq_count
  FROM medical.medication_faq;
  SELECT count(*) FILTER (WHERE zu_wenig_de IS NULL), count(*) FILTER (WHERE mythen_de IS NULL)
  INTO zu_wenig_null_count, mythen_null_count
  FROM medical.medication_user_texts;
  SELECT count(*) INTO null_context_count
  FROM medical.medication_user_texts text_row
  CROSS JOIN LATERAL jsonb_object_keys(text_row.null_context) AS null_field;
  SELECT count(*), count(*) FILTER (WHERE source_ref.item->>'verified' = 'true'), count(*) FILTER (WHERE source_ref.item->>'verified' = 'false')
  INTO source_count, verified_source_count, unverified_source_count
  FROM medical.medication_user_texts text_row
  CROSS JOIN LATERAL jsonb_array_elements(text_row.sources) AS source_ref(item);

  IF text_count <> ${expected.records} OR faq_count <> ${expected.faq} OR missing_text_count <> 0 OR missing_faq_count <> 0 THEN
    RAISE EXCEPTION 'C-293: Texte %, FAQ %, leere Texte %, leere FAQ %', text_count, faq_count, missing_text_count, missing_faq_count;
  END IF;
  IF zu_wenig_null_count <> ${expected.zuWenigNull} OR mythen_null_count <> ${expected.mythenNull} OR null_context_count <> ${expected.zuWenigNull + expected.mythenNull} THEN
    RAISE EXCEPTION 'C-293: Nullwerte zu_wenig %, mythen %, Kontext %', zu_wenig_null_count, mythen_null_count, null_context_count;
  END IF;
  IF source_count <> ${expected.sources} OR verified_source_count <> ${expected.verifiedSources} OR unverified_source_count <> ${expected.unverifiedSources} THEN
    RAISE EXCEPTION 'C-293: Quellen %, verified %, unverified %', source_count, verified_source_count, unverified_source_count;
  END IF;
END $$;

COMMIT;
`

run(sql)
