#!/usr/bin/env node
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const CONTAINER = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const DB = process.env.PGDATABASE ?? 'postgres'
const BASE = 'docs/kimi_research/supplement_performance_database/data/substances'

type Json = Record<string, any>

const fields = [
  'irreversibel_de',
  'irreversibel_en',
  'irreversibel_th',
  'ueberwachung_de',
  'ueberwachung_en',
  'ueberwachung_th',
  'nicht_im_blut_de',
  'nicht_im_blut_en',
  'nicht_im_blut_th',
  'reinheit_de',
  'reinheit_en',
  'reinheit_th',
  'rechtslage_klartext_de',
  'rechtslage_klartext_en',
  'rechtslage_klartext_th',
] as const

const expected = {
  irreversibel_de: 174,
  ueberwachung_de: 159,
  reinheit_de: 201,
  nicht_im_blut_de: 201,
  rechtslage_klartext_de: 203,
}

function readJsonl(rel: string): Json[] {
  const file = path.join(BASE, rel)
  return fs.readFileSync(file, 'utf8').split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line))
}

function present(value: unknown): boolean {
  if (value == null) return false
  if (typeof value === 'string') return value.trim() !== ''
  if (Array.isArray(value)) return value.length > 0
  if (typeof value === 'object') return Object.keys(value).length > 0
  return true
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
if (texts.length !== 446) throw new Error(`substance_user_texts: ${texts.length}, erwartet 446`)

for (const [field, count] of Object.entries(expected)) {
  const actual = texts.filter((row) => present(row[field])).length
  if (actual !== count) throw new Error(`${field}: ${actual}, erwartet ${count}`)
}

const payload = texts.map((row) => {
  const out: Json = { entity_id: row.entity_id, canonical_name: row.canonical_name }
  for (const field of fields) out[field] = row[field] ?? null
  return out
})

const sql = `\\set ON_ERROR_STOP on
BEGIN;

DROP TABLE IF EXISTS tmp_c266_texts;
CREATE TEMP TABLE tmp_c266_texts (payload jsonb NOT NULL);
\\copy tmp_c266_texts(payload) FROM STDIN WITH (FORMAT csv)
${csvJson([{ texts: payload }])}
\\.

WITH rows AS (
  SELECT jsonb_array_elements(payload->'texts') AS r FROM tmp_c266_texts
), mapped AS (
  SELECT r, supplement_id
  FROM (
    SELECT
      rows.r,
      s.id AS supplement_id,
      row_number() OVER (
        PARTITION BY rows.r->>'entity_id'
        ORDER BY
          CASE
            WHEN s.slug = rows.r->>'entity_id' THEN 0
            WHEN EXISTS (
              SELECT 1 FROM supplements.supplement_aliases a
              WHERE a.supplement_id = s.id
                AND lower(a.alias) = lower(rows.r->>'entity_id')
            ) THEN 1
            WHEN regexp_replace(lower(s.slug), '[^a-z0-9]+', '', 'g')
               = regexp_replace(lower(rows.r->>'canonical_name'), '[^a-z0-9]+', '', 'g') THEN 2
            WHEN lower(s.name_en) = lower(rows.r->>'canonical_name') THEN 3
            WHEN EXISTS (
              SELECT 1 FROM supplements.supplement_aliases a
              WHERE a.supplement_id = s.id
                AND lower(a.alias) = lower(rows.r->>'canonical_name')
            ) THEN 4
            ELSE 9
          END,
          CASE WHEN s.im_katalog THEN 0 ELSE 1 END,
          s.slug
      ) AS rank
    FROM rows
    LEFT JOIN supplements.supplements s
      ON s.slug = rows.r->>'entity_id'
      OR EXISTS (
        SELECT 1 FROM supplements.supplement_aliases a
        WHERE a.supplement_id = s.id
          AND lower(a.alias) = lower(rows.r->>'entity_id')
      )
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
), missing AS (
  SELECT r->>'entity_id' AS entity_id
  FROM mapped
  WHERE supplement_id IS NULL
)
UPDATE supplements.supplement_user_texts t
SET
  irreversibel_de = nullif(m.r->>'irreversibel_de', ''),
  irreversibel_en = nullif(m.r->>'irreversibel_en', ''),
  irreversibel_th = nullif(m.r->>'irreversibel_th', ''),
  ueberwachung_de = nullif(m.r->>'ueberwachung_de', ''),
  ueberwachung_en = nullif(m.r->>'ueberwachung_en', ''),
  ueberwachung_th = nullif(m.r->>'ueberwachung_th', ''),
  nicht_im_blut_de = nullif(m.r->>'nicht_im_blut_de', ''),
  nicht_im_blut_en = nullif(m.r->>'nicht_im_blut_en', ''),
  nicht_im_blut_th = nullif(m.r->>'nicht_im_blut_th', ''),
  reinheit_de = nullif(m.r->>'reinheit_de', ''),
  reinheit_en = nullif(m.r->>'reinheit_en', ''),
  reinheit_th = nullif(m.r->>'reinheit_th', ''),
  rechtslage_klartext_de = nullif(m.r->>'rechtslage_klartext_de', ''),
  rechtslage_klartext_en = nullif(m.r->>'rechtslage_klartext_en', ''),
  rechtslage_klartext_th = nullif(m.r->>'rechtslage_klartext_th', ''),
  updated_at = now()
FROM mapped m
WHERE t.supplement_id = m.supplement_id;

DO $$
DECLARE
  v_missing int;
  v_rows int;
  v_irreversibel int;
  v_ueberwachung int;
  v_reinheit int;
  v_nicht_im_blut int;
  v_rechtslage int;
BEGIN
  SELECT count(*) INTO v_missing
  FROM (
    WITH rows AS (
      SELECT jsonb_array_elements(payload->'texts') AS r FROM tmp_c266_texts
    ), mapped AS (
      SELECT r, supplement_id
      FROM (
        SELECT
          rows.r,
          s.id AS supplement_id,
          row_number() OVER (
            PARTITION BY rows.r->>'entity_id'
            ORDER BY
              CASE
                WHEN s.slug = rows.r->>'entity_id' THEN 0
                WHEN EXISTS (
                  SELECT 1 FROM supplements.supplement_aliases a
                  WHERE a.supplement_id = s.id
                    AND lower(a.alias) = lower(rows.r->>'entity_id')
                ) THEN 1
                WHEN regexp_replace(lower(s.slug), '[^a-z0-9]+', '', 'g')
                   = regexp_replace(lower(rows.r->>'canonical_name'), '[^a-z0-9]+', '', 'g') THEN 2
                WHEN lower(s.name_en) = lower(rows.r->>'canonical_name') THEN 3
                WHEN EXISTS (
                  SELECT 1 FROM supplements.supplement_aliases a
                  WHERE a.supplement_id = s.id
                    AND lower(a.alias) = lower(rows.r->>'canonical_name')
                ) THEN 4
                ELSE 9
              END,
              CASE WHEN s.im_katalog THEN 0 ELSE 1 END,
              s.slug
          ) AS rank
        FROM rows
        LEFT JOIN supplements.supplements s
          ON s.slug = rows.r->>'entity_id'
          OR EXISTS (
            SELECT 1 FROM supplements.supplement_aliases a
            WHERE a.supplement_id = s.id
              AND lower(a.alias) = lower(rows.r->>'entity_id')
          )
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

  SELECT count(*) INTO v_rows FROM supplements.supplement_user_texts;
  SELECT count(*) FILTER (WHERE nullif(irreversibel_de, '') IS NOT NULL),
         count(*) FILTER (WHERE nullif(ueberwachung_de, '') IS NOT NULL),
         count(*) FILTER (WHERE nullif(reinheit_de, '') IS NOT NULL),
         count(*) FILTER (WHERE nullif(nicht_im_blut_de, '') IS NOT NULL),
         count(*) FILTER (WHERE nullif(rechtslage_klartext_de, '') IS NOT NULL)
    INTO v_irreversibel, v_ueberwachung, v_reinheit, v_nicht_im_blut, v_rechtslage
  FROM supplements.supplement_user_texts;

  IF v_missing <> 0 THEN
    RAISE EXCEPTION 'C-266: % Text-entity_id nicht in supplements.supplements', v_missing;
  END IF;
  IF v_rows <> 446 THEN
    RAISE EXCEPTION 'C-266/C-275: supplement_user_texts %, erwartet 446', v_rows;
  END IF;
  IF v_irreversibel <> 174 OR v_ueberwachung <> 159 OR v_reinheit <> 201
     OR v_nicht_im_blut <> 201 OR v_rechtslage <> 203 THEN
    RAISE EXCEPTION 'C-266: Enhanced-Zaehler abweichend: irreversibel %, ueberwachung %, reinheit %, nicht_im_blut %, rechtslage %',
      v_irreversibel, v_ueberwachung, v_reinheit, v_nicht_im_blut, v_rechtslage;
  END IF;
END $$;

COMMIT;
`

run(sql)
