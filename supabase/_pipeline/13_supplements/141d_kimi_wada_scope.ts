#!/usr/bin/env node
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'

const CONTAINER = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const DB = process.env.PGDATABASE ?? 'postgres'
const BASE = 'docs/kimi_research/supplement_performance_database/data/evidence'

type Json = Record<string, any>

function readJsonl(file: string): Json[] {
  return fs.readFileSync(`${BASE}/${file}`, 'utf8').split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line))
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
  process.stdout.write(result.stdout)
  process.stderr.write(result.stderr)
  if (result.status !== 0) process.exit(result.status ?? 1)
}

const scope = readJsonl('wada_scope_enrichment.jsonl')
const notes = readJsonl('wada_scope_notes_enrichment.jsonl')
const status = readJsonl('wada_status_enrichment.jsonl')

const expected = {
  scopeRecords: Number(process.env.C272_EXPECT_WADA_SCOPE_RECORDS ?? 446),
  noteRecords: Number(process.env.C272_EXPECT_WADA_NOTE_RECORDS ?? 318),
  mappedScope: Number(process.env.C272_EXPECT_WADA_MAPPED_SCOPE ?? 290),
  mappedNotes: Number(process.env.C272_EXPECT_WADA_MAPPED_NOTES ?? 290),
  scopeNoteDe: Number(process.env.C272_EXPECT_WADA_SCOPE_NOTE_DE ?? 290),
  noteDe: Number(process.env.C272_EXPECT_WADA_NOTE_DE ?? 290),
  corrections: Number(process.env.C272_EXPECT_WADA_CORRECTIONS ?? 6),
  mismatches: Number(process.env.C272_EXPECT_WADA_SCOPE_MISMATCHES ?? 0),
}

if (scope.length !== expected.scopeRecords) throw new Error(`wada_scope_enrichment ${scope.length}, erwartet ${expected.scopeRecords}`)
if (notes.length !== expected.noteRecords) throw new Error(`wada_scope_notes_enrichment ${notes.length}, erwartet ${expected.noteRecords}`)

const payload = { scope, notes, status, expected }

const sql = `\\set ON_ERROR_STOP on
BEGIN;

ALTER TABLE supplements.supplement_wada
  ADD COLUMN IF NOT EXISTS scope_class text,
  ADD COLUMN IF NOT EXISTS scope_note_de text,
  ADD COLUMN IF NOT EXISTS scope_note_en text,
  ADD COLUMN IF NOT EXISTS scope_note_th text,
  ADD COLUMN IF NOT EXISTS sports_scope text,
  ADD COLUMN IF NOT EXISTS tue_relevance text,
  ADD COLUMN IF NOT EXISTS list_year text,
  ADD COLUMN IF NOT EXISTS last_verified date,
  ADD COLUMN IF NOT EXISTS sources jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS raw jsonb NOT NULL DEFAULT '{}'::jsonb;

CREATE TABLE IF NOT EXISTS supplements.wada_conflict_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conflict_id text NOT NULL UNIQUE,
  entity_id text NOT NULL,
  canonical_name text,
  field_name text,
  current_value text,
  corrected_value text,
  category text,
  reason text,
  list_year text,
  last_verified date,
  source_url text,
  application_note text,
  raw jsonb NOT NULL DEFAULT '{}'::jsonb,
  source text NOT NULL DEFAULT 'kimi:wada_status_enrichment',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE supplements.wada_conflict_records ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS wada_conflict_records_select ON supplements.wada_conflict_records;
CREATE POLICY wada_conflict_records_select ON supplements.wada_conflict_records FOR SELECT TO authenticated USING (true);
GRANT SELECT ON supplements.wada_conflict_records TO authenticated;
GRANT ALL ON supplements.wada_conflict_records TO service_role;

DROP TABLE IF EXISTS tmp_c272_wada;
CREATE TEMP TABLE tmp_c272_wada (payload jsonb NOT NULL);
\\copy tmp_c272_wada(payload) FROM STDIN WITH (FORMAT csv)
${csvJson([payload])}
\\.

WITH rows AS (
  SELECT jsonb_array_elements(payload->'scope') AS r FROM tmp_c272_wada
), mapped AS (
  SELECT s.id, r
  FROM rows
  JOIN supplements.supplements s ON s.slug = r->>'entity_id'
)
UPDATE supplements.supplement_wada w
SET
  status = CASE WHEN coalesce(m.r->>'wada_status','') IN ('', 'unknown') THEN 'unbekannt' ELSE 'bekannt' END,
  wada_status = m.r->>'wada_status',
  wada_category = m.r->>'wada_category',
  note_de = NULLIF(m.r->>'note_de', ''),
  scope_class = NULLIF(m.r->>'scope_class', ''),
  sources = coalesce(m.r->'sources', '[]'::jsonb),
  raw = m.r,
  source = 'kimi:wada_scope_enrichment',
  updated_at = now()
FROM mapped m
WHERE w.supplement_id = m.id;

WITH rows AS (
  SELECT jsonb_array_elements(payload->'notes') AS r FROM tmp_c272_wada
), mapped AS (
  SELECT s.id, r
  FROM rows
  JOIN supplements.supplements s ON s.slug = r->>'entity_id'
)
UPDATE supplements.supplement_wada w
SET
  scope_note_de = NULLIF(m.r->>'scope_note_de', ''),
  sources = (
    SELECT coalesce(jsonb_agg(DISTINCT item), '[]'::jsonb)
    FROM (
      SELECT jsonb_array_elements(coalesce(w.sources, '[]'::jsonb)) AS item
      UNION
      SELECT jsonb_array_elements(coalesce(m.r->'sources', '[]'::jsonb)) AS item
    ) x
  ),
  raw = jsonb_build_object('scope', w.raw, 'notes', m.r),
  updated_at = now()
FROM mapped m
WHERE w.supplement_id = m.id;

DELETE FROM supplements.wada_conflict_records WHERE source = 'kimi:wada_status_enrichment';
WITH rows AS (
  SELECT jsonb_array_elements(payload->'status') AS r FROM tmp_c272_wada
), corrections AS (
  SELECT row_number() over (order by r->>'entity_id', r->>'field') AS rn, r
  FROM rows
  WHERE r->>'record_type' = 'correction_record'
)
INSERT INTO supplements.wada_conflict_records(
  conflict_id, entity_id, canonical_name, field_name, current_value, corrected_value,
  category, reason, list_year, last_verified, source_url, application_note, raw
)
SELECT
  coalesce(r->>'conflict_id', 'wada_correction_' || rn::text),
  r->>'entity_id',
  r->>'canonical_name',
  r->>'field',
  r->>'current_value',
  r->>'corrected_value',
  r->>'category',
  r->>'reason',
  r->>'list_year',
  NULLIF(r->>'last_verified', '')::date,
  r->>'source_url',
  r->>'application_note',
  r
FROM corrections;

DO $$
DECLARE
  v_expected jsonb;
  v_scope int;
  v_notes int;
  v_note_de int;
  v_scope_note_de int;
  v_corrections int;
  v_mismatches int;
BEGIN
  SELECT payload->'expected' INTO v_expected FROM tmp_c272_wada;

  WITH rows AS (SELECT jsonb_array_elements(payload->'scope') AS r FROM tmp_c272_wada)
  SELECT count(*) INTO v_scope FROM rows JOIN supplements.supplements s ON s.slug = r->>'entity_id';

  WITH rows AS (SELECT jsonb_array_elements(payload->'notes') AS r FROM tmp_c272_wada)
  SELECT count(*) INTO v_notes FROM rows JOIN supplements.supplements s ON s.slug = r->>'entity_id';

  SELECT count(*) FILTER (WHERE NULLIF(note_de, '') IS NOT NULL),
         count(*) FILTER (WHERE NULLIF(scope_note_de, '') IS NOT NULL)
  INTO v_note_de, v_scope_note_de
  FROM supplements.supplement_wada;

  SELECT count(*) INTO v_corrections FROM supplements.wada_conflict_records WHERE source = 'kimi:wada_status_enrichment';

  WITH scope_rows AS (
    SELECT r FROM tmp_c272_wada, jsonb_array_elements(payload->'scope') r
  ), note_rows AS (
    SELECT r FROM tmp_c272_wada, jsonb_array_elements(payload->'notes') r
  )
  SELECT count(*) INTO v_mismatches
  FROM scope_rows s
  JOIN note_rows n ON n.r->>'entity_id' = s.r->>'entity_id'
  WHERE coalesce(s.r->>'wada_status','') <> coalesce(n.r->>'wada_status','')
     OR coalesce(s.r->>'wada_category','') <> coalesce(n.r->>'wada_category','');

  IF v_scope <> (v_expected->>'mappedScope')::int THEN RAISE EXCEPTION 'C-272 WADA mapped scope % statt %', v_scope, v_expected->>'mappedScope'; END IF;
  IF v_notes <> (v_expected->>'mappedNotes')::int THEN RAISE EXCEPTION 'C-272 WADA mapped notes % statt %', v_notes, v_expected->>'mappedNotes'; END IF;
  IF v_note_de <> (v_expected->>'noteDe')::int THEN RAISE EXCEPTION 'C-272 WADA note_de % statt %', v_note_de, v_expected->>'noteDe'; END IF;
  IF v_scope_note_de <> (v_expected->>'scopeNoteDe')::int THEN RAISE EXCEPTION 'C-272 WADA scope_note_de % statt %', v_scope_note_de, v_expected->>'scopeNoteDe'; END IF;
  IF v_corrections <> (v_expected->>'corrections')::int THEN RAISE EXCEPTION 'C-272 WADA corrections % statt %', v_corrections, v_expected->>'corrections'; END IF;
  IF v_mismatches <> (v_expected->>'mismatches')::int THEN RAISE EXCEPTION 'C-272 WADA mismatches % statt %', v_mismatches, v_expected->>'mismatches'; END IF;

  RAISE NOTICE 'OK: C-272 WADA scope %, notes %, note_de %, scope_note_de %, corrections %, mismatches %',
    v_scope, v_notes, v_note_de, v_scope_note_de, v_corrections, v_mismatches;
END $$;

COMMIT;
`

run(sql)
