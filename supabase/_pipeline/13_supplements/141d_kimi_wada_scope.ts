#!/usr/bin/env node
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const CONTAINER = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const DB = process.env.PGDATABASE ?? 'postgres'
const BASE = 'docs/kimi_research/supplement_performance_database/data/evidence'

type Json = Record<string, any>

function readJsonl(file: string): Json[] {
  const full = path.join(BASE, file)
  return fs.readFileSync(full, 'utf8').split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line))
}

function csvJson(rows: Json[]): string {
  return rows.map((row) => `"${JSON.stringify(row).replace(/"/g, '""')}"`).join('\n')
}

function run(sql: string): void {
  const result = spawnSync('docker', ['exec', '-i', CONTAINER, 'psql', '-U', 'postgres', '-d', DB, '-v', 'ON_ERROR_STOP=1', '-f', '-'], {
    input: sql,
    encoding: 'utf8',
    maxBuffer: 512 * 1024 * 1024,
  })
  process.stdout.write(result.stdout)
  process.stderr.write(result.stderr)
  if (result.status !== 0) process.exit(result.status ?? 1)
}

const payload = {
  wadaScope: readJsonl('wada_scope_enrichment.jsonl'),
  wadaNotes: readJsonl('wada_scope_notes_enrichment.jsonl'),
  wadaStatus: readJsonl('wada_status_enrichment.jsonl'),
  labEffects: readJsonl('lab_effects_enrichment.jsonl'),
  humanEvidence: readJsonl('human_evidence_flags.jsonl'),
  thailandRegulatory: readJsonl('thailand_regulatory_enrichment.jsonl'),
  thailandProducts: readJsonl('thailand_product_regulatory_enrichment.jsonl'),
  thailandMedications: readJsonl('thailand_medication_regulatory_enrichment.jsonl'),
  cyp: readJsonl('cyp_enrichment.jsonl'),
  transporters: readJsonl('transporter_enrichment.jsonl'),
  studies: readJsonl('studies.jsonl'),
  aliases: readJsonl('alias_resolution_candidates.jsonl'),
  pubchemConflicts: readJsonl('conflict_records_gap_fill_pubchem.jsonl'),
}

const expected = {
  wadaScopeRecords: 446,
  wadaNoteRecords: 318,
  wadaScopeMapped: Number(process.env.C272_EXPECT_WADA_SCOPE_MAPPED ?? 320),
  wadaNotesMapped: Number(process.env.C272_EXPECT_WADA_NOTES_MAPPED ?? 290),
  wadaNoteDe: Number(process.env.C272_EXPECT_WADA_NOTE_DE ?? 320),
  wadaScopeNoteDe: Number(process.env.C272_EXPECT_WADA_SCOPE_NOTE_DE ?? 290),
  wadaConflicts: Number(process.env.C272_EXPECT_WADA_CONFLICTS ?? 6),
  wadaMismatches: Number(process.env.C272_EXPECT_WADA_MISMATCHES ?? 0),
  labEffects: 47,
  labEffectsMapped: Number(process.env.C272_EXPECT_LAB_EFFECTS_MAPPED ?? 3),
  humanEvidence: 293,
  humanEvidenceMapped: 290,
  thailandRecords: 1061,
  cypRecords: 666,
  cypRows: Number(process.env.C272_EXPECT_CYP_ROWS ?? 3001),
  transporterRecords: 513,
  transporterRows: Number(process.env.C272_EXPECT_TRANSPORTER_ROWS ?? 4617),
  studies: 43,
  studySubjects: 47,
  aliases: 64,
  pubchemConflicts: 20,
  pubchemTrueConflicts: 6,
  imKatalogAllowed: [412, 416],
  visibleChildren: 0,
}

for (const [name, value] of [
  ['wadaScopeRecords', payload.wadaScope.length],
  ['wadaNoteRecords', payload.wadaNotes.length],
  ['labEffects', payload.labEffects.length],
  ['humanEvidence', payload.humanEvidence.length],
  ['thailandRecords', payload.thailandRegulatory.length + payload.thailandProducts.length + payload.thailandMedications.length],
  ['cypRecords', payload.cyp.length],
  ['transporterRecords', payload.transporters.length],
  ['studies', payload.studies.length],
  ['aliases', payload.aliases.length],
  ['pubchemConflicts', payload.pubchemConflicts.length],
] as const) {
  if (value !== expected[name]) throw new Error(`${name}: ${value}, erwartet ${expected[name]}`)
}

const sql = `\\set ON_ERROR_STOP on
BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION pg_temp.c272_uuid(p_key text)
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

ALTER TABLE supplements.supplement_lab_effects
  ADD COLUMN IF NOT EXISTS effect_class text,
  ADD COLUMN IF NOT EXISTS magnitude_context text,
  ADD COLUMN IF NOT EXISTS clinical_relevance text,
  ADD COLUMN IF NOT EXISTS source_ids text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS enrichment_raw jsonb NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE supplements.supplement_evidence
  ADD COLUMN IF NOT EXISTS human_evidence_available boolean,
  ADD COLUMN IF NOT EXISTS rct_evidence_available boolean,
  ADD COLUMN IF NOT EXISTS meta_analysis_available boolean,
  ADD COLUMN IF NOT EXISTS model_note text,
  ADD COLUMN IF NOT EXISTS missing_reason text,
  ADD COLUMN IF NOT EXISTS evidence_source_ids text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS evidence_linked_files text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS human_evidence_raw jsonb NOT NULL DEFAULT '{}'::jsonb;

CREATE TABLE IF NOT EXISTS supplements.wada_conflict_records (
  id uuid PRIMARY KEY,
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

CREATE TABLE IF NOT EXISTS supplements.lab_effect_enrichment_records (
  id uuid PRIMARY KEY,
  substance_id text NOT NULL,
  supplement_id uuid REFERENCES supplements.supplements(id) ON DELETE CASCADE,
  substance_name text,
  domain text,
  marker_id text,
  marker_name text,
  direction text,
  effect_class text NOT NULL,
  magnitude_context text,
  clinical_relevance text,
  source_ids text[] NOT NULL DEFAULT '{}',
  raw jsonb NOT NULL DEFAULT '{}'::jsonb,
  source text NOT NULL DEFAULT 'kimi:lab_effects_enrichment',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (substance_id, marker_id, effect_class, source)
);

CREATE TABLE IF NOT EXISTS supplements.supplement_human_evidence_flags (
  id uuid PRIMARY KEY,
  entity_id text,
  supplement_id uuid REFERENCES supplements.supplements(id) ON DELETE CASCADE,
  entity_type text,
  canonical_name text,
  record_type text NOT NULL DEFAULT 'human_evidence_flag',
  human_evidence_available boolean,
  rct_evidence_available boolean,
  meta_analysis_available boolean,
  model_note text,
  missing_reason text,
  source_ids text[] NOT NULL DEFAULT '{}',
  linked_files text[] NOT NULL DEFAULT '{}',
  raw jsonb NOT NULL DEFAULT '{}'::jsonb,
  source text NOT NULL DEFAULT 'kimi:human_evidence_flags',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS supplements.thailand_regulatory_records (
  id uuid PRIMARY KEY,
  source_file text NOT NULL,
  record_type text,
  entity_id text,
  entity_ref text,
  product_id text,
  supplement_id uuid REFERENCES supplements.supplements(id) ON DELETE CASCADE,
  domain text,
  jurisdiction text NOT NULL DEFAULT 'TH',
  regulatory_status text,
  controlled_status text,
  classification text,
  last_verified date,
  source_ids text[] NOT NULL DEFAULT '{}',
  raw jsonb NOT NULL DEFAULT '{}'::jsonb,
  source text NOT NULL DEFAULT 'kimi:thailand_regulatory',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS supplements.supplement_studies (
  id uuid PRIMARY KEY,
  study_id text NOT NULL UNIQUE,
  title text NOT NULL,
  study_type text,
  evidence_level text,
  url text,
  pmid text,
  citation text,
  notes text,
  raw jsonb NOT NULL DEFAULT '{}'::jsonb,
  source text NOT NULL DEFAULT 'kimi:studies',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS supplements.supplement_study_subjects (
  id uuid PRIMARY KEY,
  study_id text NOT NULL REFERENCES supplements.supplement_studies(study_id) ON DELETE CASCADE,
  subject text NOT NULL,
  supplement_id uuid REFERENCES supplements.supplements(id) ON DELETE SET NULL,
  source text NOT NULL DEFAULT 'kimi:studies',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (study_id, subject)
);

CREATE TABLE IF NOT EXISTS supplements.alias_resolution_candidates (
  id uuid PRIMARY KEY,
  resolution_state text NOT NULL,
  alias text,
  entity_id text,
  supplement_id uuid REFERENCES supplements.supplements(id) ON DELETE SET NULL,
  term text,
  category text,
  resolution_type text,
  missing_reason text,
  source_ids text[] NOT NULL DEFAULT '{}',
  canonical_ids text[] NOT NULL DEFAULT '{}',
  raw jsonb NOT NULL DEFAULT '{}'::jsonb,
  source text NOT NULL DEFAULT 'kimi:alias_resolution_candidates',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS supplements.pubchem_conflict_records (
  id uuid PRIMARY KEY,
  conflict_id text NOT NULL UNIQUE,
  domain text,
  entity_id text NOT NULL,
  supplement_id uuid REFERENCES supplements.supplements(id) ON DELETE SET NULL,
  field_conflict text NOT NULL,
  old_value jsonb,
  new_value text,
  old_source text,
  new_source text,
  resolution_status text NOT NULL,
  detail text,
  raw jsonb NOT NULL DEFAULT '{}'::jsonb,
  source text NOT NULL DEFAULT 'kimi:conflict_records_gap_fill_pubchem',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

DO $rls$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'wada_conflict_records',
    'lab_effect_enrichment_records',
    'supplement_human_evidence_flags',
    'thailand_regulatory_records',
    'supplement_studies',
    'supplement_study_subjects',
    'alias_resolution_candidates',
    'pubchem_conflict_records'
  ] LOOP
    EXECUTE format('ALTER TABLE supplements.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON supplements.%I', t || '_read', t);
    EXECUTE format('CREATE POLICY %I ON supplements.%I FOR SELECT TO authenticated USING (true)', t || '_read', t);
    EXECUTE format('GRANT SELECT ON supplements.%I TO authenticated', t);
    EXECUTE format('GRANT ALL ON supplements.%I TO service_role', t);
  END LOOP;
END $rls$;

DROP TABLE IF EXISTS tmp_c272_payload;
CREATE TEMP TABLE tmp_c272_payload (payload jsonb NOT NULL);
\\copy tmp_c272_payload(payload) FROM STDIN WITH (FORMAT csv)
${csvJson([{ ...payload, expected }])}
\\.

DELETE FROM supplements.wada_conflict_records WHERE source = 'kimi:wada_status_enrichment';
DELETE FROM supplements.lab_effect_enrichment_records WHERE source = 'kimi:lab_effects_enrichment';
DELETE FROM supplements.supplement_human_evidence_flags WHERE source = 'kimi:human_evidence_flags';
DELETE FROM supplements.thailand_regulatory_records WHERE source = 'kimi:thailand_regulatory';
DELETE FROM supplements.supplement_study_subjects WHERE source = 'kimi:studies';
DELETE FROM supplements.supplement_studies WHERE source = 'kimi:studies';
DELETE FROM supplements.alias_resolution_candidates WHERE source = 'kimi:alias_resolution_candidates';
DELETE FROM supplements.pubchem_conflict_records WHERE source = 'kimi:conflict_records_gap_fill_pubchem';
DELETE FROM supplements.entity_cyp WHERE source IN ('kimi:cyp_enrichment','kimi:c272_cyp_enrichment');
DELETE FROM supplements.entity_transporters WHERE source IN ('kimi:transporter_enrichment','kimi:c272_transporter_enrichment');
DELETE FROM supplements.supplement_lab_effects WHERE source = 'kimi:lab_effects_enrichment';

WITH rows AS (
  SELECT jsonb_array_elements(payload->'wadaScope') AS r FROM tmp_c272_payload
), mapped AS (
  SELECT s.id, r
  FROM rows
  JOIN supplements.supplements s ON s.slug = r->>'entity_id'
)
UPDATE supplements.supplement_wada w
SET
  status = CASE WHEN coalesce(mapped.r->>'wada_status','') IN ('', 'unknown') THEN 'unbekannt' ELSE 'bekannt' END,
  wada_status = mapped.r->>'wada_status',
  wada_category = mapped.r->>'wada_category',
  note_de = nullif(mapped.r->>'note_de', ''),
  scope_class = nullif(mapped.r->>'scope_class', ''),
  sources = coalesce(mapped.r->'sources', '[]'::jsonb),
  raw = mapped.r,
  source = 'kimi:wada_scope_enrichment',
  updated_at = now()
FROM mapped
WHERE w.supplement_id = mapped.id;

WITH rows AS (
  SELECT jsonb_array_elements(payload->'wadaScope') AS r FROM tmp_c272_payload
), mapped AS (
  SELECT s.id, r
  FROM rows
  JOIN supplements.supplements s ON s.slug = r->>'entity_id'
)
INSERT INTO supplements.supplement_wada(id, supplement_id, status, wada_status, wada_category, note_de, scope_class, sources, raw, source)
SELECT
  pg_temp.c272_uuid('wada:' || id::text),
  id,
  CASE WHEN coalesce(r->>'wada_status','') IN ('', 'unknown') THEN 'unbekannt' ELSE 'bekannt' END,
  r->>'wada_status',
  r->>'wada_category',
  nullif(r->>'note_de', ''),
  nullif(r->>'scope_class', ''),
  coalesce(r->'sources', '[]'::jsonb),
  r,
  'kimi:wada_scope_enrichment'
FROM mapped
WHERE NOT EXISTS (
  SELECT 1 FROM supplements.supplement_wada w WHERE w.supplement_id = mapped.id
);

WITH rows AS (
  SELECT jsonb_array_elements(payload->'wadaNotes') AS r FROM tmp_c272_payload
), mapped AS (
  SELECT s.id, r
  FROM rows
  JOIN supplements.supplements s ON s.slug = r->>'entity_id'
)
UPDATE supplements.supplement_wada w
SET
  scope_note_de = nullif(m.r->>'scope_note_de', ''),
  last_verified = nullif(m.r->>'last_verified', '')::date,
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

WITH rows AS (
  SELECT jsonb_array_elements(payload->'wadaStatus') AS r FROM tmp_c272_payload
), corrections AS (
  SELECT row_number() over (order by r->>'entity_id', r->>'field') AS rn, r
  FROM rows
  WHERE r->>'record_type' = 'correction_record'
)
INSERT INTO supplements.wada_conflict_records(
  id, conflict_id, entity_id, canonical_name, field_name, current_value, corrected_value,
  category, reason, list_year, last_verified, source_url, application_note, raw
)
SELECT
  pg_temp.c272_uuid('wada_conflict:' || coalesce((r->>'conflict_id'), rn::text)),
  coalesce(r->>'conflict_id', 'wada_correction_' || rn::text),
  r->>'entity_id',
  r->>'canonical_name',
  r->>'field',
  r->>'current_value',
  r->>'corrected_value',
  r->>'category',
  r->>'reason',
  r->>'list_year',
  nullif(r->>'last_verified', '')::date,
  r->>'source_url',
  r->>'application_note',
  r
FROM corrections;

WITH rows AS (
  SELECT jsonb_array_elements(payload->'labEffects') AS r FROM tmp_c272_payload
), mapped AS (
  SELECT r, s.id AS supplement_id FROM rows LEFT JOIN supplements.supplements s ON s.slug = r->>'substance_id'
)
INSERT INTO supplements.lab_effect_enrichment_records(
  id, substance_id, supplement_id, substance_name, domain, marker_id, marker_name,
  direction, effect_class, magnitude_context, clinical_relevance, source_ids, raw
)
SELECT
  pg_temp.c272_uuid('lab_effect_enrichment:' || (r->>'substance_id') || ':' || (r->>'marker_id') || ':' || (r->>'effect_class')),
  r->>'substance_id',
  supplement_id,
  r->>'substance_name',
  r->>'domain',
  r->>'marker_id',
  r->>'marker_name',
  r->>'direction',
  r->>'effect_class',
  r->>'magnitude_context',
  r->>'clinical_relevance',
  coalesce(ARRAY(SELECT jsonb_array_elements_text(coalesce(r->'source_ids','[]'::jsonb))), '{}'),
  r
FROM mapped;

WITH rows AS (
  SELECT jsonb_array_elements(payload->'labEffects') AS r FROM tmp_c272_payload
), mapped AS (
  SELECT r, s.id AS supplement_id FROM rows JOIN supplements.supplements s ON s.slug = r->>'substance_id'
)
INSERT INTO supplements.supplement_lab_effects(
  id, supplement_id, status, lab_marker_id, loinc_code, effect_type, analyte_en,
  direction, clinical_consequence_en, evidence, source, effect_class, magnitude_context,
  clinical_relevance, source_ids, enrichment_raw
)
SELECT
  pg_temp.c272_uuid('supplement_lab_effect:' || (r->>'substance_id') || ':' || (r->>'marker_id') || ':' || (r->>'effect_class')),
  supplement_id,
  'bekannt',
  r->>'marker_id',
  null,
  r->>'effect_class',
  r->>'marker_name',
  r->>'direction',
  r->>'clinical_relevance',
  'kimi:crawl_037',
  'kimi:lab_effects_enrichment',
  r->>'effect_class',
  r->>'magnitude_context',
  r->>'clinical_relevance',
  coalesce(ARRAY(SELECT jsonb_array_elements_text(coalesce(r->'source_ids','[]'::jsonb))), '{}'),
  r
FROM mapped;

WITH rows AS (
  SELECT jsonb_array_elements(payload->'humanEvidence') AS r FROM tmp_c272_payload
), numbered AS (
  SELECT row_number() over () AS rn, r FROM rows
)
INSERT INTO supplements.supplement_human_evidence_flags(
  id, entity_id, supplement_id, entity_type, canonical_name, record_type,
  human_evidence_available, rct_evidence_available, meta_analysis_available,
  model_note, missing_reason, source_ids, linked_files, raw
)
SELECT
  pg_temp.c272_uuid('human_evidence:' || rn::text || ':' || coalesce((r->>'entity_id'), (r->>'record_type'), '')),
  r->>'entity_id',
  s.id,
  r->>'entity_type',
  r->>'canonical_name',
  coalesce(r->>'record_type', 'human_evidence_flag'),
  nullif(r->>'human_evidence_available', '')::boolean,
  nullif(r->>'rct_evidence_available', '')::boolean,
  nullif(r->>'meta_analysis_available', '')::boolean,
  r->>'model_note',
  r->>'missing_reason',
  coalesce(ARRAY(SELECT jsonb_array_elements_text(coalesce(r->'source_ids','[]'::jsonb))), '{}'),
  coalesce(ARRAY(SELECT jsonb_array_elements_text(coalesce(r->'linked_files','[]'::jsonb))), '{}'),
  r
FROM numbered
LEFT JOIN supplements.supplements s ON s.slug = r->>'entity_id';

WITH rows AS (
  SELECT 'thailand_regulatory_enrichment.jsonl' AS source_file, jsonb_array_elements(payload->'thailandRegulatory') AS r FROM tmp_c272_payload
  UNION ALL
  SELECT 'thailand_product_regulatory_enrichment.jsonl', jsonb_array_elements(payload->'thailandProducts') FROM tmp_c272_payload
  UNION ALL
  SELECT 'thailand_medication_regulatory_enrichment.jsonl', jsonb_array_elements(payload->'thailandMedications') FROM tmp_c272_payload
), numbered AS (
  SELECT row_number() over (order by source_file, coalesce(r->>'entity_id', r->>'entity_ref', r->>'product_id', r->>'record_type', '')) AS rn, source_file, r
  FROM rows
)
INSERT INTO supplements.thailand_regulatory_records(
  id, source_file, record_type, entity_id, entity_ref, product_id, supplement_id, domain,
  jurisdiction, regulatory_status, controlled_status, classification, last_verified,
  source_ids, raw
)
SELECT
  pg_temp.c272_uuid('thailand:' || source_file || ':' || rn::text),
  source_file,
  r->>'record_type',
  r->>'entity_id',
  r->>'entity_ref',
  r->>'product_id',
  s.id,
  coalesce(r->>'entity_domain_hint', r->>'product_domain'),
  coalesce(r#>>'{thailand,jurisdiction}', 'TH'),
  coalesce(r#>>'{thailand,registration_status}', r#>>'{thailand,status}', r#>>'{thailand,narcotic_psychotropic_status}'),
  coalesce(r#>>'{thailand,controlled_status}', r#>>'{thailand,narcotic_psychotropic_status}'),
  coalesce(r#>>'{thailand,classification}', r#>>'{thailand,classification,normalized_translation}', r#>>'{thailand,classification,original_text}'),
  nullif(coalesce(r#>>'{thailand,last_verified}', r->>'last_verified'), '')::date,
  coalesce(ARRAY(SELECT jsonb_array_elements_text(coalesce(r#>'{thailand,source_ids}','[]'::jsonb))), '{}'),
  r
FROM numbered
LEFT JOIN supplements.supplements s ON s.slug = coalesce(r->>'entity_id', r->>'entity_ref', r->>'product_id');

WITH rows AS (
  SELECT jsonb_array_elements(payload->'cyp') AS r FROM tmp_c272_payload
), enzymes AS (
  SELECT r, key AS enzyme, value AS v FROM rows, jsonb_each(r->'cyp')
)
INSERT INTO supplements.entity_cyp(entity_id, entity_type, supplement_id, canonical_name, enzyme, role, evidence, note, source_ids, status, source, raw)
SELECT
  r->>'entity_id',
  r->>'entity_type',
  s.id,
  r->>'canonical_name',
  enzyme,
  coalesce(v->>'role', 'unknown'),
  v->>'evidence',
  v->>'note',
  coalesce(ARRAY(SELECT jsonb_array_elements_text(coalesce(v->'source_ids','[]'::jsonb))), '{}'),
  CASE WHEN coalesce(v->>'role','') = 'not_relevant' THEN 'nicht_zutreffend'
       WHEN coalesce(v->>'role','') IN ('unknown','not_studied','') THEN 'unbekannt'
       ELSE 'bekannt' END,
  'kimi:c272_cyp_enrichment',
  v
FROM enzymes
LEFT JOIN supplements.supplements s ON s.slug = r->>'entity_id';

WITH rows AS (
  SELECT jsonb_array_elements(payload->'transporters') AS r FROM tmp_c272_payload
), transporters AS (
  SELECT r, key AS transporter, value AS v FROM rows, jsonb_each(r->'transporters')
)
INSERT INTO supplements.entity_transporters(entity_id, entity_type, supplement_id, canonical_name, transporter, role, evidence, note, source_ids, status, source, raw)
SELECT
  r->>'entity_id',
  r->>'domain',
  s.id,
  r->>'canonical_name',
  transporter,
  coalesce(v->>'role', 'unknown'),
  v->>'evidence',
  v->>'note',
  coalesce(ARRAY(SELECT jsonb_array_elements_text(coalesce(v->'source_ids','[]'::jsonb))), '{}'),
  CASE WHEN coalesce(v->>'role','') = 'not_relevant' THEN 'nicht_zutreffend'
       WHEN coalesce(v->>'role','') IN ('unknown','not_studied','') THEN 'unbekannt'
       ELSE 'bekannt' END,
  'kimi:c272_transporter_enrichment',
  v
FROM transporters
LEFT JOIN supplements.supplements s ON s.slug = r->>'entity_id';

WITH rows AS (
  SELECT jsonb_array_elements(payload->'studies') AS r FROM tmp_c272_payload
)
INSERT INTO supplements.supplement_studies(id, study_id, title, study_type, evidence_level, url, pmid, citation, notes, raw)
SELECT
  pg_temp.c272_uuid('study:' || (r->>'study_id')),
  r->>'study_id',
  r->>'title',
  r->>'type',
  r->>'evidence_level',
  r->>'url',
  r->>'pmid',
  r->>'citation',
  r->>'notes',
  r
FROM rows;

WITH rows AS (
  SELECT jsonb_array_elements(payload->'studies') AS r FROM tmp_c272_payload
), subjects AS (
  SELECT r->>'study_id' AS study_id, jsonb_array_elements_text(coalesce(r->'subjects','[]'::jsonb)) AS subject
  FROM rows
)
INSERT INTO supplements.supplement_study_subjects(id, study_id, subject, supplement_id)
SELECT
  pg_temp.c272_uuid('study_subject:' || study_id || ':' || subject),
  study_id,
  subject,
  s.id
FROM subjects
LEFT JOIN supplements.supplements s
  ON lower(coalesce(s.name_en, s.name_de, s.slug)) = lower(subject)
  OR lower(s.slug) = lower(regexp_replace(subject, '[^a-zA-Z0-9]+', '-', 'g'));

WITH rows AS (
  SELECT jsonb_array_elements(payload->'aliases') AS r FROM tmp_c272_payload
), numbered AS (
  SELECT row_number() over () AS rn, r FROM rows
)
INSERT INTO supplements.alias_resolution_candidates(
  id, resolution_state, alias, entity_id, supplement_id, term, category,
  resolution_type, missing_reason, source_ids, canonical_ids, raw
)
SELECT
  pg_temp.c272_uuid('alias_candidate:' || rn::text || ':' || coalesce((r->>'alias'), (r->>'term'), (r->>'entity_id'), '')),
  r->>'resolution_state',
  r->>'alias',
  r->>'entity_id',
  s.id,
  r->>'term',
  r->>'category',
  r->>'resolution_type',
  r->>'missing_reason',
  coalesce(ARRAY(SELECT jsonb_array_elements_text(coalesce(r->'source_ids','[]'::jsonb))), '{}'),
  coalesce(ARRAY(SELECT jsonb_array_elements_text(coalesce(r->'canonical_id','[]'::jsonb))), '{}'),
  r
FROM numbered
LEFT JOIN supplements.supplements s ON s.slug = r->>'entity_id';

WITH rows AS (
  SELECT jsonb_array_elements(payload->'pubchemConflicts') AS r FROM tmp_c272_payload
)
INSERT INTO supplements.pubchem_conflict_records(
  id, conflict_id, domain, entity_id, supplement_id, field_conflict, old_value,
  new_value, old_source, new_source, resolution_status, detail, raw
)
SELECT
  pg_temp.c272_uuid('pubchem_conflict:' || (r->>'conflict_id')),
  r->>'conflict_id',
  r->>'domain',
  r->>'entity_id',
  s.id,
  r->>'field_conflict',
  CASE WHEN jsonb_typeof(r->'old_value') IS NULL THEN to_jsonb(r->>'old_value') ELSE r->'old_value' END,
  CASE WHEN jsonb_typeof(r->'new_value') IN ('object','array') THEN (r->'new_value')::text ELSE r->>'new_value' END,
  r->>'old_source',
  r->>'new_source',
  r->>'resolution_status',
  r->>'detail',
  r
FROM rows
LEFT JOIN supplements.supplements s ON s.slug = r->>'entity_id';

DO $$
DECLARE
  e jsonb;
  v_im int;
  v_children int;
  v_wada_note int;
  v_wada_scope_note int;
  v_wada_scope_mapped int;
  v_wada_notes_mapped int;
  v_wada_conflicts int;
  v_wada_mismatches int;
  v_lab_records int;
  v_lab_mapped int;
  v_lab_class int;
  v_human int;
  v_human_mapped int;
  v_thailand int;
  v_cyp int;
  v_transporters int;
  v_transporters_not_relevant int;
  v_studies int;
  v_subjects int;
  v_aliases int;
  v_pubchem int;
  v_pubchem_true int;
BEGIN
  SELECT payload->'expected' INTO e FROM tmp_c272_payload;

  SELECT count(*) FILTER (WHERE im_katalog), count(*) FILTER (WHERE im_katalog AND parent_id IS NOT NULL)
  INTO v_im, v_children
  FROM supplements.supplements;
  IF NOT EXISTS (
    SELECT 1
    FROM jsonb_array_elements_text(e->'imKatalogAllowed') AS allowed(value)
    WHERE allowed.value::int = v_im
  ) OR v_children <> (e->>'visibleChildren')::int THEN
    RAISE EXCEPTION 'C-272 im_katalog %, sichtbare Unterformen %, erwartet eines von %/%', v_im, v_children, e->'imKatalogAllowed', e->>'visibleChildren';
  END IF;

  WITH rows AS (SELECT jsonb_array_elements(payload->'wadaScope') AS r FROM tmp_c272_payload)
  SELECT count(*) INTO v_wada_scope_mapped FROM rows JOIN supplements.supplements s ON s.slug = r->>'entity_id';
  WITH rows AS (SELECT jsonb_array_elements(payload->'wadaNotes') AS r FROM tmp_c272_payload)
  SELECT count(*) INTO v_wada_notes_mapped FROM rows JOIN supplements.supplements s ON s.slug = r->>'entity_id';
  SELECT count(*) FILTER (WHERE nullif(note_de,'') IS NOT NULL), count(*) FILTER (WHERE nullif(scope_note_de,'') IS NOT NULL)
  INTO v_wada_note, v_wada_scope_note FROM supplements.supplement_wada;
  SELECT count(*) INTO v_wada_conflicts FROM supplements.wada_conflict_records WHERE source = 'kimi:wada_status_enrichment';
  WITH scope_rows AS (SELECT r FROM tmp_c272_payload, jsonb_array_elements(payload->'wadaScope') r),
       note_rows AS (SELECT r FROM tmp_c272_payload, jsonb_array_elements(payload->'wadaNotes') r)
  SELECT count(*) INTO v_wada_mismatches
  FROM scope_rows s
  JOIN note_rows n ON n.r->>'entity_id' = s.r->>'entity_id'
  WHERE coalesce(s.r->>'wada_status','') <> coalesce(n.r->>'wada_status','')
     OR coalesce(s.r->>'wada_category','') <> coalesce(n.r->>'wada_category','');

  SELECT count(*), count(*) FILTER (WHERE supplement_id IS NOT NULL) INTO v_lab_records, v_lab_mapped
  FROM supplements.lab_effect_enrichment_records WHERE source = 'kimi:lab_effects_enrichment';
  SELECT count(*) INTO v_lab_class FROM supplements.supplement_lab_effects WHERE effect_class IS NOT NULL;
  SELECT count(*), count(*) FILTER (WHERE supplement_id IS NOT NULL) INTO v_human, v_human_mapped
  FROM supplements.supplement_human_evidence_flags WHERE source = 'kimi:human_evidence_flags';
  SELECT count(*) INTO v_thailand FROM supplements.thailand_regulatory_records WHERE source = 'kimi:thailand_regulatory';
  SELECT count(*) INTO v_cyp FROM supplements.entity_cyp;
  SELECT count(*), count(*) FILTER (WHERE role = 'not_relevant') INTO v_transporters, v_transporters_not_relevant
  FROM supplements.entity_transporters;
  SELECT count(*) INTO v_studies FROM supplements.supplement_studies WHERE source = 'kimi:studies';
  SELECT count(*) INTO v_subjects FROM supplements.supplement_study_subjects WHERE source = 'kimi:studies';
  SELECT count(*) INTO v_aliases FROM supplements.alias_resolution_candidates WHERE source = 'kimi:alias_resolution_candidates';
  SELECT count(*), count(*) FILTER (WHERE resolution_status = 'OPEN_TRUE_CONFLICT') INTO v_pubchem, v_pubchem_true
  FROM supplements.pubchem_conflict_records WHERE source = 'kimi:conflict_records_gap_fill_pubchem';

  IF v_wada_scope_mapped <> (e->>'wadaScopeMapped')::int THEN RAISE EXCEPTION 'C-272 WADA scope mapped % statt %', v_wada_scope_mapped, e->>'wadaScopeMapped'; END IF;
  IF v_wada_notes_mapped <> (e->>'wadaNotesMapped')::int THEN RAISE EXCEPTION 'C-272 WADA notes mapped % statt %', v_wada_notes_mapped, e->>'wadaNotesMapped'; END IF;
  IF v_wada_note <> (e->>'wadaNoteDe')::int THEN RAISE EXCEPTION 'C-272 WADA note_de % statt %', v_wada_note, e->>'wadaNoteDe'; END IF;
  IF v_wada_scope_note <> (e->>'wadaScopeNoteDe')::int THEN RAISE EXCEPTION 'C-272 WADA scope_note_de % statt %', v_wada_scope_note, e->>'wadaScopeNoteDe'; END IF;
  IF v_wada_conflicts <> (e->>'wadaConflicts')::int THEN RAISE EXCEPTION 'C-272 WADA conflicts % statt %', v_wada_conflicts, e->>'wadaConflicts'; END IF;
  IF v_wada_mismatches <> (e->>'wadaMismatches')::int THEN RAISE EXCEPTION 'C-272 WADA mismatches % statt %', v_wada_mismatches, e->>'wadaMismatches'; END IF;
  IF v_lab_records <> (e->>'labEffects')::int OR v_lab_mapped <> (e->>'labEffectsMapped')::int OR v_lab_class < (e->>'labEffectsMapped')::int THEN RAISE EXCEPTION 'C-272 Lab records %, mapped %, class %', v_lab_records, v_lab_mapped, v_lab_class; END IF;
  IF v_human <> (e->>'humanEvidence')::int OR v_human_mapped <> (e->>'humanEvidenceMapped')::int THEN RAISE EXCEPTION 'C-272 Human Evidence %, mapped %', v_human, v_human_mapped; END IF;
  IF v_thailand <> (e->>'thailandRecords')::int THEN RAISE EXCEPTION 'C-272 Thailand % statt %', v_thailand, e->>'thailandRecords'; END IF;
  IF v_cyp <> (e->>'cypRows')::int THEN RAISE EXCEPTION 'C-272 CYP rows % statt %', v_cyp, e->>'cypRows'; END IF;
  IF v_transporters <> (e->>'transporterRows')::int THEN RAISE EXCEPTION 'C-272 Transporter rows % statt %', v_transporters, e->>'transporterRows'; END IF;
  IF v_transporters_not_relevant = 0 THEN RAISE EXCEPTION 'C-272 Transporter not_relevant nicht importiert'; END IF;
  IF v_studies <> (e->>'studies')::int OR v_subjects <> (e->>'studySubjects')::int THEN RAISE EXCEPTION 'C-272 Studien %, Subjects %', v_studies, v_subjects; END IF;
  IF v_aliases <> (e->>'aliases')::int THEN RAISE EXCEPTION 'C-272 Aliase % statt %', v_aliases, e->>'aliases'; END IF;
  IF v_pubchem <> (e->>'pubchemConflicts')::int OR v_pubchem_true <> (e->>'pubchemTrueConflicts')::int THEN RAISE EXCEPTION 'C-272 PubChem %, true %', v_pubchem, v_pubchem_true; END IF;

  RAISE NOTICE 'OK C-272: WADA note_de %, scope_note %, conflicts %, lab %/% mapped, human %/% mapped, thailand %, cyp %, transporters % (not_relevant %), studies %/% subjects, aliases %, pubchem % true %',
    v_wada_note, v_wada_scope_note, v_wada_conflicts, v_lab_records, v_lab_mapped, v_human, v_human_mapped,
    v_thailand, v_cyp, v_transporters, v_transporters_not_relevant, v_studies, v_subjects, v_aliases, v_pubchem, v_pubchem_true;
END $$;

COMMIT;
`

run(sql)
