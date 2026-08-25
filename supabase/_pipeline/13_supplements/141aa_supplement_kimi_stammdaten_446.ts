#!/usr/bin/env node
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const CONTAINER = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const DB = process.env.PGDATABASE ?? 'postgres'
const BASE = 'docs/kimi_research/supplement_performance_database/data/substances'

type Json = Record<string, any>

function readJsonl(rel: string): Json[] {
  const file = path.join(BASE, rel)
  return fs.readFileSync(file, 'utf8').split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line))
}

function csvJson(rows: Json[]): string {
  return rows.map((row) => `"${JSON.stringify(row).replace(/"/g, '""')}"`).join('\n')
}

function present(value: unknown): boolean {
  if (value == null) return false
  if (typeof value === 'string') return value.trim() !== ''
  if (Array.isArray(value)) return value.length > 0
  if (typeof value === 'object') return Object.keys(value).length > 0
  return true
}

function slugify(value: string): string {
  return value.toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

function filterFor(group: string, row: Json): string {
  const raw = `${row.filter ?? ''} ${row.subcategory ?? ''} ${row.compound_type ?? ''} ${row.category ?? ''}`.toLowerCase()
  if (group === 'supplement') {
    if (raw.includes('botanical') || raw.includes('herbal')) return 'botanicals'
    if (raw.includes('longevity') || raw.includes('anti_aging')) return 'longevity'
    if (raw.includes('mineral')) return 'mineralstoffe'
    if (raw.includes('vitamin')) return 'vitamine'
    if (raw.includes('nootropic') || raw.includes('racetam')) return 'nootropika'
    if (raw.includes('sports') || raw.includes('performance') || raw.includes('stimulant')) return 'sportnahrung'
    if (raw.includes('adaptogen')) return 'adaptogene'
    if (raw.includes('protein') || raw.includes('amino')) return 'protein_aminos'
    return 'uebrige'
  }
  if (group === 'peptide') {
    if (raw.includes('growth hormone') || raw.includes('hgh') || raw.includes('somatropin') || raw.includes('myostatin')) return 'wachstumshormon'
    if (raw.includes('incretin') || raw.includes('glp') || raw.includes('metabolic')) return 'stoffwechsel'
    if (raw.includes('muscle') || raw.includes('recovery') || raw.includes('tissue')) return 'muskel_gewebe'
    if (raw.includes('neuro')) return 'neuro'
    if (raw.includes('reproductive') || raw.includes('melanocortin') || raw.includes('insulin')) return 'hormone'
    if (raw.includes('immune') || raw.includes('longevity') || raw.includes('mitochondrial') || raw.includes('antioxidant') || raw.includes('antimicrobial')) return 'longevity_immun'
    return 'ohne_zuordnung'
  }
  if (raw.includes('injectable') || raw.includes('injectable_aas') || raw.includes('steroid_injectable')) return 'injizierbare_aas'
  if (raw.includes('oral aas') || raw.includes('oral_aas') || raw.includes('17aa') || raw.includes('steroid_oral')) return 'orale_aas'
  if (raw.includes('sarm')) return 'sarm'
  if (raw.includes('designer') || raw.includes('prohormone')) return 'prohormone'
  if (raw.includes('ancill') || raw.includes('pct') || raw.includes('estrogen') || raw.includes('aromatase') || raw.includes('serm') || raw.includes('insulin') || raw.includes('thyroid') || raw.includes('cabergoline') || raw.includes('letrozole') || raw.includes('clomiphene')) return 'begleitmedikation'
  if (raw.includes('fat') || raw.includes('stimulant') || raw.includes('diuretic') || raw.includes('uncoupler')) return 'fatburner'
  return 'sonstige'
}

function prepare(rows: Json[], group: 'supplement' | 'peptide' | 'enhanced', source: string): Json[] {
  return rows.map((row) => {
    const evidence = row.evidence ?? {}
    const id = row.id ?? row.entity_id
    const canonicalName = row.canonical_name ?? row.name_en ?? row.name
    return {
      entity_id: id,
      canonical_name: canonicalName,
      group_code: group,
      filter: filterFor(group, row),
      source_primary: source,
      description_en: row.description ?? null,
      evidence_grade: ['S', 'A', 'B', 'C', 'D', 'E', 'F'].includes(evidence.overall_grade) ? evidence.overall_grade : null,
      form: row.chemical_form ?? null,
      aliases: Array.isArray(row.aliases) ? row.aliases.filter(present) : [],
      raw: row,
      target_slug: null,
    }
  })
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

const supplements = readJsonl('supplements.jsonl')
const peptides = readJsonl('peptides.jsonl')
const performance = readJsonl('performance_compounds.jsonl')
const texts = readJsonl('substance_user_texts.jsonl')
const faq = readJsonl('substance_faq.jsonl')

if (supplements.length !== 243) throw new Error(`supplements.jsonl ${supplements.length}, erwartet 243`)
if (peptides.length !== 79) throw new Error(`peptides.jsonl ${peptides.length}, erwartet 79`)
if (performance.length !== 124) throw new Error(`performance_compounds.jsonl ${performance.length}, erwartet 124`)
if (texts.length !== 446) throw new Error(`substance_user_texts.jsonl ${texts.length}, erwartet 446`)
if (faq.length !== 1970) throw new Error(`substance_faq.jsonl ${faq.length}, erwartet 1970`)

const records = [
  ...prepare(supplements, 'supplement', 'kimi_supplement'),
  ...prepare(peptides, 'peptide', 'kimi_peptide'),
  ...prepare(performance, 'enhanced', 'kimi_performance'),
]

const payload = {
  records,
  expected: {
    sourceRecords: Number(process.env.C275_EXPECT_SOURCE_RECORDS ?? 446),
    finalSupplements: Number(process.env.C275_EXPECT_FINAL_SUPPLEMENTS ?? 596),
    finalVisible: Number(process.env.C275_EXPECT_FINAL_VISIBLE ?? 416),
    finalTextsSource: Number(process.env.C275_EXPECT_TEXT_SOURCE ?? 446),
    finalFaqSource: Number(process.env.C275_EXPECT_FAQ_SOURCE ?? 1970),
    duplicateVisibleNames: Number(process.env.C275_EXPECT_DUPLICATE_VISIBLE_NAMES ?? 0),
  },
}

const sql = `\\set ON_ERROR_STOP on
BEGIN;

CREATE OR REPLACE FUNCTION pg_temp.stable_uuid(p_key text)
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

CREATE OR REPLACE FUNCTION pg_temp.norm_name(p_value text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT regexp_replace(lower(coalesce(p_value, '')), '[^a-z0-9]+', '', 'g');
$$;

DROP TABLE IF EXISTS tmp_c275_records;
CREATE TEMP TABLE tmp_c275_records (payload jsonb NOT NULL);
\\copy tmp_c275_records(payload) FROM STDIN WITH (FORMAT csv)
${csvJson([payload])}
\\.

CREATE TEMP TABLE tmp_c275_rows AS
SELECT
  r,
  r->>'entity_id' AS entity_id,
  r->>'canonical_name' AS canonical_name,
  pg_temp.norm_name(r->>'canonical_name') AS norm_name,
  r->>'group_code' AS group_code,
  r->>'filter' AS filter,
  r->>'source_primary' AS source_primary,
  NULLIF(r->>'description_en', '') AS description_en,
  NULLIF(r->>'evidence_grade', '') AS evidence_grade,
  NULLIF(r->>'form', '') AS form,
  NULLIF(r->>'target_slug', '') AS target_slug,
  coalesce(r->'aliases', '[]'::jsonb) AS aliases,
  r->'raw' AS raw
FROM tmp_c275_records t
CROSS JOIN LATERAL jsonb_array_elements(t.payload->'records') AS r;

CREATE TEMP TABLE tmp_c275_ranked AS
WITH candidates AS (
  SELECT
    r.entity_id,
    s.id AS supplement_id,
    s.slug,
    s.name_en,
    s.source,
    s.im_katalog,
    CASE
      WHEN s.slug = r.entity_id THEN 0
      WHEN r.target_slug IS NOT NULL AND s.slug = r.target_slug THEN 1
      WHEN pg_temp.norm_name(s.name_en) = r.norm_name THEN 2
      WHEN pg_temp.norm_name(s.name_de) = r.norm_name THEN 3
      WHEN pg_temp.norm_name(s.slug) = r.norm_name THEN 4
      WHEN EXISTS (
        SELECT 1 FROM supplements.supplement_aliases a
        WHERE a.supplement_id = s.id
          AND pg_temp.norm_name(a.alias) = r.norm_name
      ) THEN 5
      ELSE 9
    END AS rank
  FROM tmp_c275_rows r
  JOIN supplements.supplements s
    ON s.slug = r.entity_id
    OR (r.target_slug IS NOT NULL AND s.slug = r.target_slug)
    OR pg_temp.norm_name(s.name_en) = r.norm_name
    OR pg_temp.norm_name(s.name_de) = r.norm_name
    OR pg_temp.norm_name(s.slug) = r.norm_name
    OR EXISTS (
      SELECT 1 FROM supplements.supplement_aliases a
      WHERE a.supplement_id = s.id
        AND pg_temp.norm_name(a.alias) = r.norm_name
    )
), ranked AS (
  SELECT
    r.*,
    c.supplement_id,
    c.slug AS matched_slug,
    c.source AS matched_source,
    c.im_katalog AS matched_visible,
    row_number() OVER (
      PARTITION BY r.entity_id
      ORDER BY
        c.rank,
        CASE WHEN c.im_katalog THEN 0 ELSE 1 END,
        c.slug
    ) AS rn
  FROM tmp_c275_rows r
  LEFT JOIN candidates c ON c.entity_id = r.entity_id
)
SELECT * FROM ranked WHERE rn = 1;

CREATE TEMP TABLE tmp_c275_new AS
SELECT * FROM tmp_c275_ranked WHERE supplement_id IS NULL;

INSERT INTO supplements.supplement_categories (id, slug, group_id, name_de, name_en, name_th, sort_order, is_active)
SELECT
  pg_temp.stable_uuid('supplement_category:' || r.group_code || ':' || r.filter),
  r.filter,
  pg_temp.stable_uuid('supplement_group:' || r.group_code),
  NULL,
  r.filter,
  NULL,
  900 + dense_rank() OVER (PARTITION BY r.group_code ORDER BY r.filter),
  true
FROM tmp_c275_rows r
WHERE NOT EXISTS (SELECT 1 FROM supplements.supplement_categories c WHERE c.slug = r.filter)
GROUP BY r.group_code, r.filter;

INSERT INTO supplements.supplements (
  id, slug, group_id, category_id, name_de, name_en, name_th,
  description_de, description_en, description_th, form, evidence_grade,
  source, is_active
)
SELECT
  pg_temp.stable_uuid('supplement:' || entity_id),
  entity_id,
  pg_temp.stable_uuid('supplement_group:' || group_code),
  pg_temp.stable_uuid('supplement_category:' || group_code || ':' || filter),
  NULL,
  canonical_name,
  NULL,
  NULL,
  description_en,
  NULL,
  form,
  evidence_grade,
  source_primary,
  true
FROM tmp_c275_new;

UPDATE supplements.supplements s
SET
  group_id = pg_temp.stable_uuid('supplement_group:' || r.group_code),
  category_id = pg_temp.stable_uuid('supplement_category:' || r.group_code || ':' || r.filter),
  name_en = r.canonical_name,
  description_en = r.description_en,
  form = r.form,
  evidence_grade = r.evidence_grade,
  source = r.source_primary,
  is_active = true,
  updated_at = now()
FROM tmp_c275_ranked r
WHERE s.id = r.supplement_id
  AND r.supplement_id IS NOT NULL
  AND NOT coalesce(r.matched_visible, false);

CREATE TEMP TABLE tmp_c275_targets AS
SELECT
  r.entity_id,
  r.canonical_name,
  coalesce(r.supplement_id, pg_temp.stable_uuid('supplement:' || r.entity_id)) AS supplement_id,
  r.source_primary,
  r.aliases
FROM tmp_c275_ranked r;

INSERT INTO supplements.supplement_aliases (id, supplement_id, alias, locale, source, confidence)
SELECT
  pg_temp.stable_uuid('supplement_alias:kimi_entity:' || t.entity_id),
  t.supplement_id,
  t.entity_id,
  NULL,
  'kimi_entity_id',
  1
FROM tmp_c275_targets t
ON CONFLICT (supplement_id, alias, source) DO NOTHING;

INSERT INTO supplements.supplement_aliases (id, supplement_id, alias, locale, source, confidence)
SELECT
  pg_temp.stable_uuid('supplement_alias:c275:' || t.entity_id || ':' || ordinality::text || ':' || alias_value),
  t.supplement_id,
  alias_value,
  NULL,
  t.source_primary,
  0.95
FROM tmp_c275_targets t
CROSS JOIN LATERAL jsonb_array_elements_text(t.aliases) WITH ORDINALITY AS a(alias_value, ordinality)
WHERE btrim(alias_value) <> ''
ON CONFLICT (supplement_id, alias, source) DO NOTHING;

INSERT INTO supplements.supplement_dosing (id, supplement_id, status, source)
SELECT
  pg_temp.stable_uuid('supplement_dosing:' || n.entity_id),
  pg_temp.stable_uuid('supplement:' || n.entity_id),
  'unbekannt',
  'c275_kimi_stammdaten_446'
FROM tmp_c275_new n
ON CONFLICT DO NOTHING;

INSERT INTO supplements.supplement_evidence (id, supplement_id, status, overall_grade, source)
SELECT
  pg_temp.stable_uuid('supplement_evidence:' || n.entity_id),
  pg_temp.stable_uuid('supplement:' || n.entity_id),
  CASE WHEN n.evidence_grade IS NULL THEN 'unbekannt' ELSE 'bekannt' END,
  n.evidence_grade,
  'c275_kimi_stammdaten_446'
FROM tmp_c275_new n
ON CONFLICT DO NOTHING;

DO $$
DECLARE
  v_expected jsonb;
  v_sources int;
  v_total int;
  v_visible int;
  v_duplicate_names int;
  v_missing_mapped int;
  v_text_source int;
  v_faq_source int;
  v_testosterone_enanthate int;
  v_insulin_glargine int;
  v_humatrope int;
  v_magnesium_slug text;
  v_bpc int;
BEGIN
  SELECT payload->'expected' INTO v_expected FROM tmp_c275_records;

  SELECT count(*) INTO v_sources FROM tmp_c275_rows;
  SELECT count(*) INTO v_total FROM supplements.supplements;
  SELECT count(*) INTO v_visible FROM supplements.supplements WHERE im_katalog;
  SELECT count(*) INTO v_text_source FROM tmp_c275_records t, jsonb_array_elements(t.payload->'records');
  SELECT count(*) INTO v_faq_source FROM jsonb_array_elements((SELECT payload FROM tmp_c275_records)->'records');

  SELECT count(*) INTO v_missing_mapped
  FROM tmp_c275_targets t
  WHERE NOT EXISTS (SELECT 1 FROM supplements.supplements s WHERE s.id = t.supplement_id);

  SELECT count(*) INTO v_duplicate_names
  FROM (
    SELECT name_en
    FROM supplements.supplements
    WHERE im_katalog
    GROUP BY name_en
    HAVING count(*) > 1
  ) d;

  SELECT count(*) INTO v_testosterone_enanthate
  FROM supplements.supplements
  WHERE lower(name_en) = 'testosterone enanthate' AND im_katalog AND slug = 'f05_testosterone_enanthate';

  SELECT count(*) INTO v_insulin_glargine
  FROM supplements.supplements
  WHERE lower(name_en) = 'insulin glargine' AND im_katalog AND slug = 'sub_4288c6b5be';

  SELECT count(*) INTO v_humatrope
  FROM supplements.supplements
  WHERE lower(name_en) = 'humatrope (somatropin)' AND im_katalog AND slug = 'sub_3933b0551e';

  SELECT slug INTO v_magnesium_slug
  FROM supplements.supplements
  WHERE lower(name_en) = 'magnesium' AND im_katalog
  ORDER BY slug
  LIMIT 1;

  SELECT count(*) INTO v_bpc
  FROM supplements.supplements
  WHERE lower(name_en) = 'bpc-157' AND im_katalog;

  IF v_sources <> (v_expected->>'sourceRecords')::int THEN RAISE EXCEPTION 'C-275 Quellen %, erwartet %', v_sources, v_expected->>'sourceRecords'; END IF;
  IF v_total <> (v_expected->>'finalSupplements')::int THEN RAISE EXCEPTION 'C-275 supplements %, erwartet %', v_total, v_expected->>'finalSupplements'; END IF;
  IF v_visible <> (v_expected->>'finalVisible')::int THEN RAISE EXCEPTION 'C-275 im_katalog %, erwartet %', v_visible, v_expected->>'finalVisible'; END IF;
  IF v_missing_mapped <> 0 THEN RAISE EXCEPTION 'C-275 % Kimi-Records ohne Zielzeile', v_missing_mapped; END IF;
  IF v_duplicate_names <> (v_expected->>'duplicateVisibleNames')::int THEN RAISE EXCEPTION 'C-275 sichtbare Namensdubletten %, erwartet %', v_duplicate_names, v_expected->>'duplicateVisibleNames'; END IF;
  IF v_testosterone_enanthate <> 1 THEN RAISE EXCEPTION 'C-275 Gegenprobe Testosterone Enanthate fehlt oder falscher Slug'; END IF;
  IF v_insulin_glargine <> 1 THEN RAISE EXCEPTION 'C-275 Gegenprobe Insulin Glargine fehlt'; END IF;
  IF v_humatrope <> 1 THEN RAISE EXCEPTION 'C-275 Gegenprobe Humatrope fehlt'; END IF;
  IF v_magnesium_slug <> 'magnesium' THEN RAISE EXCEPTION 'C-275 Gegenprobe Magnesium veraendert: %', v_magnesium_slug; END IF;
  IF v_bpc <> 1 THEN RAISE EXCEPTION 'C-275 Gegenprobe BPC-157 Dublette oder fehlt: %', v_bpc; END IF;

  RAISE NOTICE 'OK: C-275 Stammdaten %, supplements %, sichtbar %, Dubletten %, Testosterone Enanthate/Insulin Glargine/Humatrope ok',
    v_sources, v_total, v_visible, v_duplicate_names;
END $$;

COMMIT;
`

run(sql)
