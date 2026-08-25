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

const texts = readJsonl('substance_user_texts.jsonl')
const faq = readJsonl('substance_faq.jsonl')
if (texts.length !== 318) throw new Error(`substance_user_texts: ${texts.length}, erwartet 318`)
if (faq.length !== 1421) throw new Error(`substance_faq: ${faq.length}, erwartet 1421`)

const payload = { texts, faq }

const sql = `\\set ON_ERROR_STOP on
BEGIN;

ALTER TABLE supplements.supplement_user_texts
  ADD COLUMN IF NOT EXISTS sources jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE supplements.supplement_faq
  ADD COLUMN IF NOT EXISTS sources jsonb NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE supplements.supplement_user_texts
  DROP CONSTRAINT IF EXISTS supplement_user_texts_wofuer_de_check,
  DROP CONSTRAINT IF EXISTS supplement_user_texts_wofuer_en_check;
ALTER TABLE supplements.supplement_user_texts
  ADD CONSTRAINT supplement_user_texts_wofuer_de_check
    CHECK (array_length(wofuer_de, 1) BETWEEN 1 AND 4),
  ADD CONSTRAINT supplement_user_texts_wofuer_en_check
    CHECK (array_length(wofuer_en, 1) BETWEEN 1 AND 4);

DROP TABLE IF EXISTS tmp_c264_texts;
CREATE TEMP TABLE tmp_c264_texts (payload jsonb NOT NULL);
\\copy tmp_c264_texts(payload) FROM STDIN WITH (FORMAT csv)
${csvJson([payload])}
\\.

DELETE FROM supplements.supplement_faq;
DELETE FROM supplements.supplement_user_texts;

WITH rows AS (
  SELECT jsonb_array_elements(payload->'texts') AS r FROM tmp_c264_texts
), mapped AS (
  SELECT r, supplement_id
  FROM (
    SELECT
      rows.r,
      s.id AS supplement_id,
      row_number() OVER (
        PARTITION BY rows.r->>'entity_id'
        ORDER BY
          CASE WHEN s.slug = rows.r->>'entity_id' THEN 0 ELSE 1 END,
          CASE
            WHEN regexp_replace(lower(s.slug), '[^a-z0-9]+', '', 'g')
               = regexp_replace(lower(rows.r->>'canonical_name'), '[^a-z0-9]+', '', 'g')
            THEN 0 ELSE 1
          END,
          CASE WHEN s.im_katalog THEN 0 ELSE 1 END,
          s.slug
      ) AS rank,
      count(*) OVER (PARTITION BY rows.r->>'entity_id') AS matches
    FROM rows
    LEFT JOIN supplements.supplements s
      ON s.slug = rows.r->>'entity_id'
      OR regexp_replace(lower(s.slug), '[^a-z0-9]+', '', 'g')
       = regexp_replace(lower(rows.r->>'canonical_name'), '[^a-z0-9]+', '', 'g')
      OR lower(s.name_en) = lower(rows.r->>'canonical_name')
      OR EXISTS (
        SELECT 1 FROM supplements.supplement_aliases a
        WHERE a.supplement_id = s.id
          AND lower(a.alias) = lower(rows.r->>'canonical_name')
      )
  ) ranked
  WHERE rank = 1
    AND (
      matches = 1
      OR supplement_id IS NOT NULL
    )
), missing AS (
  SELECT r->>'entity_id' AS entity_id, r->>'canonical_name' AS canonical_name
  FROM rows
  WHERE NOT EXISTS (
    SELECT 1 FROM mapped
    WHERE mapped.r->>'entity_id' = rows.r->>'entity_id'
      AND mapped.supplement_id IS NOT NULL
  )
)
INSERT INTO supplements.supplement_user_texts (
  supplement_id, status,
  kurz_was_de, kurz_was_en, kurz_was_th,
  wofuer_de, wofuer_en, wofuer_th,
  wie_wirkt_de, wie_wirkt_en, wie_wirkt_th,
  was_bringt_es_de, was_bringt_es_en, was_bringt_es_th,
  zu_viel_de, zu_viel_en, zu_viel_th,
  zu_wenig_de, zu_wenig_en, zu_wenig_th,
  wann_wie_de, wann_wie_en, wann_wie_th,
  wer_nicht_de, wer_nicht_en, wer_nicht_th,
  mythen_de, mythen_en, mythen_th,
  source, sources
)
SELECT
  supplement_id,
  'bekannt',
  r->>'kurz_was_de', r->>'kurz_was_en', r->>'kurz_was_th',
  coalesce(ARRAY(SELECT jsonb_array_elements_text(r->'wofuer_de')), '{}'),
  coalesce(ARRAY(SELECT jsonb_array_elements_text(r->'wofuer_en')), '{}'),
  coalesce(ARRAY(SELECT jsonb_array_elements_text(r->'wofuer_th')), '{}'),
  r->>'wie_wirkt_de', r->>'wie_wirkt_en', r->>'wie_wirkt_th',
  r->>'was_bringt_es_de', r->>'was_bringt_es_en', r->>'was_bringt_es_th',
  r->>'zu_viel_de', r->>'zu_viel_en', r->>'zu_viel_th',
  r->>'zu_wenig_de', r->>'zu_wenig_en', r->>'zu_wenig_th',
  r->>'wann_wie_de', r->>'wann_wie_en', r->>'wann_wie_th',
  coalesce(ARRAY(SELECT jsonb_array_elements_text(r->'wer_nicht_de')), '{}'),
  coalesce(ARRAY(SELECT jsonb_array_elements_text(r->'wer_nicht_en')), '{}'),
  coalesce(ARRAY(SELECT jsonb_array_elements_text(r->'wer_nicht_th')), '{}'),
  r->>'mythen_de', r->>'mythen_en', r->>'mythen_th',
  'docs/kimi_research/substance_user_texts.jsonl',
  coalesce(r->'sources', '[]'::jsonb)
FROM mapped
WHERE supplement_id IS NOT NULL;

DO $$
DECLARE
  v_missing int;
  v_inserted int;
BEGIN
  SELECT count(*) INTO v_missing
  FROM (
    WITH rows AS (
      SELECT jsonb_array_elements(payload->'texts') AS r FROM tmp_c264_texts
    ), mapped AS (
      SELECT r, supplement_id
      FROM (
        SELECT
          rows.r,
          s.id AS supplement_id,
          row_number() OVER (
            PARTITION BY rows.r->>'entity_id'
            ORDER BY
              CASE WHEN s.slug = rows.r->>'entity_id' THEN 0 ELSE 1 END,
              CASE
                WHEN regexp_replace(lower(s.slug), '[^a-z0-9]+', '', 'g')
                   = regexp_replace(lower(rows.r->>'canonical_name'), '[^a-z0-9]+', '', 'g')
                THEN 0 ELSE 1
              END,
              CASE WHEN s.im_katalog THEN 0 ELSE 1 END,
              s.slug
          ) AS rank
        FROM rows
        LEFT JOIN supplements.supplements s
          ON s.slug = rows.r->>'entity_id'
          OR regexp_replace(lower(s.slug), '[^a-z0-9]+', '', 'g')
           = regexp_replace(lower(rows.r->>'canonical_name'), '[^a-z0-9]+', '', 'g')
          OR lower(s.name_en) = lower(rows.r->>'canonical_name')
          OR EXISTS (
            SELECT 1 FROM supplements.supplement_aliases a
            WHERE a.supplement_id = s.id
              AND lower(a.alias) = lower(rows.r->>'canonical_name')
          )
      ) ranked
      WHERE rank = 1
    )
    SELECT rows.r->>'entity_id' AS entity_id
    FROM rows
    WHERE NOT EXISTS (
      SELECT 1 FROM mapped
      WHERE mapped.r->>'entity_id' = rows.r->>'entity_id'
        AND mapped.supplement_id IS NOT NULL
    )
  ) x;
  SELECT count(*) INTO v_inserted FROM supplements.supplement_user_texts;
  IF v_missing <> 0 THEN
    RAISE EXCEPTION 'C-264: % Text-entity_id nicht in supplements.supplements', v_missing;
  END IF;
  IF v_inserted <> 318 THEN
    RAISE EXCEPTION 'C-264/C-265 Nachtrag: supplement_user_texts %, erwartet 318', v_inserted;
  END IF;
END $$;

WITH rows AS (
  SELECT jsonb_array_elements(payload->'faq') AS r FROM tmp_c264_texts
), text_sources AS (
  SELECT
    t->>'entity_id' AS entity_id,
    t->>'canonical_name' AS canonical_name,
    coalesce(t->'sources', '[]'::jsonb) AS sources
  FROM tmp_c264_texts, jsonb_array_elements(payload->'texts') AS t
), mapped AS (
  SELECT r, supplement_id, sources
  FROM (
    SELECT
      rows.r,
      s.id AS supplement_id,
      coalesce(rows.r->'sources', ts.sources, '[]'::jsonb) AS sources,
      row_number() OVER (
        PARTITION BY rows.r->>'entity_id', rows.r->>'frage_de', rows.r->>'antwort_de', rows.r->>'sort_order'
        ORDER BY
          CASE WHEN s.slug = rows.r->>'entity_id' THEN 0 ELSE 1 END,
          CASE
            WHEN regexp_replace(lower(s.slug), '[^a-z0-9]+', '', 'g')
               = regexp_replace(lower(ts.canonical_name), '[^a-z0-9]+', '', 'g')
            THEN 0 ELSE 1
          END,
          CASE WHEN s.im_katalog THEN 0 ELSE 1 END,
          s.slug
      ) AS rank
    FROM rows
    LEFT JOIN text_sources ts ON ts.entity_id = rows.r->>'entity_id'
    LEFT JOIN supplements.supplements s
      ON s.slug = rows.r->>'entity_id'
      OR regexp_replace(lower(s.slug), '[^a-z0-9]+', '', 'g')
       = regexp_replace(lower(ts.canonical_name), '[^a-z0-9]+', '', 'g')
      OR lower(s.name_en) = lower(ts.canonical_name)
      OR EXISTS (
        SELECT 1 FROM supplements.supplement_aliases a
        WHERE a.supplement_id = s.id
          AND lower(a.alias) = lower(ts.canonical_name)
      )
  ) ranked
  WHERE rank = 1
)
INSERT INTO supplements.supplement_faq (
  supplement_id, frage_de, frage_en, frage_th,
  antwort_de, antwort_en, antwort_th,
  sort_order, source, sources
)
SELECT
  supplement_id,
  r->>'frage_de', r->>'frage_en', r->>'frage_th',
  r->>'antwort_de', r->>'antwort_en', r->>'antwort_th',
  NULLIF(r->>'sort_order','')::int,
  'docs/kimi_research/substance_faq.jsonl',
  sources
FROM mapped
WHERE supplement_id IS NOT NULL;

DO $$
DECLARE
  v_missing int;
  v_inserted int;
BEGIN
  SELECT count(*) INTO v_missing
  FROM (
    WITH rows AS (
      SELECT jsonb_array_elements(payload->'faq') AS r FROM tmp_c264_texts
    ), text_sources AS (
      SELECT t->>'entity_id' AS entity_id, t->>'canonical_name' AS canonical_name
      FROM tmp_c264_texts, jsonb_array_elements(payload->'texts') AS t
    ), mapped AS (
      SELECT r, supplement_id
      FROM (
        SELECT
          rows.r,
          s.id AS supplement_id,
          row_number() OVER (
            PARTITION BY rows.r->>'entity_id', rows.r->>'frage_de', rows.r->>'antwort_de', rows.r->>'sort_order'
            ORDER BY
              CASE WHEN s.slug = rows.r->>'entity_id' THEN 0 ELSE 1 END,
              CASE
                WHEN regexp_replace(lower(s.slug), '[^a-z0-9]+', '', 'g')
                   = regexp_replace(lower(ts.canonical_name), '[^a-z0-9]+', '', 'g')
                THEN 0 ELSE 1
              END,
              CASE WHEN s.im_katalog THEN 0 ELSE 1 END,
              s.slug
          ) AS rank
        FROM rows
        LEFT JOIN text_sources ts ON ts.entity_id = rows.r->>'entity_id'
        LEFT JOIN supplements.supplements s
          ON s.slug = rows.r->>'entity_id'
          OR regexp_replace(lower(s.slug), '[^a-z0-9]+', '', 'g')
           = regexp_replace(lower(ts.canonical_name), '[^a-z0-9]+', '', 'g')
          OR lower(s.name_en) = lower(ts.canonical_name)
          OR EXISTS (
            SELECT 1 FROM supplements.supplement_aliases a
            WHERE a.supplement_id = s.id
              AND lower(a.alias) = lower(ts.canonical_name)
          )
      ) ranked
      WHERE rank = 1
    )
    SELECT rows.r->>'entity_id' AS entity_id
    FROM rows
    WHERE NOT EXISTS (
      SELECT 1 FROM mapped
      WHERE mapped.r->>'entity_id' = rows.r->>'entity_id'
        AND mapped.supplement_id IS NOT NULL
    )
  ) x;
  SELECT count(*) INTO v_inserted FROM supplements.supplement_faq;
  IF v_missing <> 0 THEN
    RAISE EXCEPTION 'C-264: % FAQ-entity_id nicht in supplements.supplements', v_missing;
  END IF;
  IF v_inserted <> 1421 THEN
    RAISE EXCEPTION 'C-264/C-265 Nachtrag: supplement_faq %, erwartet 1421', v_inserted;
  END IF;
END $$;

COMMIT;
`

run(sql)
