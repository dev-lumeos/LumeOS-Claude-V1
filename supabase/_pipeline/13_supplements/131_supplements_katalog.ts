#!/usr/bin/env node
// C-68: import curated standard supplement catalog from
// supabase/_pipeline/daten/supplement-katalog.json.
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'

const CONTAINER = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const DB = process.env.PGDATABASE ?? 'postgres'
const INPUT = 'supabase/_pipeline/daten/supplement-katalog.json'

type SupplementRow = {
  slug: string
  name: string
  name_de?: string
  name_en?: string
  name_th?: string
  category: string
  form?: string
  serving_size?: number
  serving_unit?: string
  evidence_grade: string
  timing_default: string
  requires_food?: boolean
  requires_empty_stomach?: boolean
  cost_per_serving?: number
  nutrients_provided?: Record<string, unknown>
  benefits?: string[]
}

type DataFile = {
  version: number
  source: string
  source_note: string
  supplements: SupplementRow[]
}

function fail(message: string): never {
  console.error(message)
  process.exit(1)
}

function csvCell(value: string): string {
  return `"${value.replace(/"/g, '""')}"`
}

function readData(): DataFile {
  const data = JSON.parse(fs.readFileSync(INPUT, 'utf8')) as DataFile
  if (data.version !== 1) fail(`${INPUT}: version muss 1 sein`)
  if (!data.source || !data.source_note) fail(`${INPUT}: source/source_note fehlt`)
  if (!Array.isArray(data.supplements) || data.supplements.length === 0) {
    fail(`${INPUT}: supplements fehlt oder ist leer`)
  }

  const slugs = new Set<string>()
  for (const [index, row] of data.supplements.entries()) {
    if (!row.slug || slugs.has(row.slug)) fail(`${INPUT}:${index + 1}: slug fehlt oder ist doppelt`)
    slugs.add(row.slug)
    if (!row.name) fail(`${INPUT}:${row.slug}: name fehlt`)
    if (!row.category) fail(`${INPUT}:${row.slug}: category fehlt`)
    if (!row.evidence_grade) fail(`${INPUT}:${row.slug}: evidence_grade fehlt`)
    if (!row.timing_default) fail(`${INPUT}:${row.slug}: timing_default fehlt`)
    if (row.serving_size !== undefined && (!Number.isFinite(row.serving_size) || row.serving_size <= 0)) {
      fail(`${INPUT}:${row.slug}: serving_size ungueltig`)
    }
  }
  return data
}

function runPsql(data: DataFile): void {
  const payload = data.supplements.map(row => csvCell(JSON.stringify(row))).join('\n')
  const sql = `\\set ON_ERROR_STOP on
BEGIN;

CREATE TEMP TABLE tmp_supplement_catalog (
  payload text NOT NULL
) ON COMMIT DROP;

COPY tmp_supplement_catalog (payload) FROM STDIN WITH (FORMAT csv);
${payload}
\\.

WITH parsed AS (
  SELECT payload::jsonb AS p
  FROM tmp_supplement_catalog
)
INSERT INTO supplements.supplement_catalog (
  slug, name, name_de, name_en, name_th,
  category, form, evidence_grade,
  serving_size, serving_unit, timing_default,
  requires_food, requires_empty_stomach,
  nutrients_provided, benefits, cost_per_serving, source
)
SELECT
  p->>'slug',
  p->>'name',
  NULLIF(p->>'name_de', ''),
  COALESCE(NULLIF(p->>'name_en', ''), p->>'name'),
  NULLIF(p->>'name_th', ''),
  p->>'category',
  NULLIF(p->>'form', ''),
  p->>'evidence_grade',
  NULLIF(p->>'serving_size', '')::numeric,
  NULLIF(p->>'serving_unit', ''),
  p->>'timing_default',
  COALESCE((p->>'requires_food')::boolean, false),
  COALESCE((p->>'requires_empty_stomach')::boolean, false),
  COALESCE(p->'nutrients_provided', '{}'::jsonb),
  COALESCE(ARRAY(SELECT jsonb_array_elements_text(COALESCE(p->'benefits', '[]'::jsonb))), '{}'),
  NULLIF(p->>'cost_per_serving', '')::numeric,
  'legacy_seed'
FROM parsed
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  name_de = EXCLUDED.name_de,
  name_en = EXCLUDED.name_en,
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  form = EXCLUDED.form,
  evidence_grade = EXCLUDED.evidence_grade,
  serving_size = EXCLUDED.serving_size,
  serving_unit = EXCLUDED.serving_unit,
  timing_default = EXCLUDED.timing_default,
  requires_food = EXCLUDED.requires_food,
  requires_empty_stomach = EXCLUDED.requires_empty_stomach,
  nutrients_provided = EXCLUDED.nutrients_provided,
  benefits = EXCLUDED.benefits,
  cost_per_serving = EXCLUDED.cost_per_serving,
  source = EXCLUDED.source,
  is_active = true,
  updated_at = now();

DO $$
DECLARE
  v_input integer;
  v_active integer;
  v_total integer;
BEGIN
  SELECT count(*) INTO v_input FROM tmp_supplement_catalog;
  SELECT count(*) INTO v_total FROM supplements.supplement_catalog;
  SELECT count(*) INTO v_active FROM supplements.supplement_catalog WHERE is_active;

  IF v_input <> ${data.supplements.length} THEN
    RAISE EXCEPTION 'supplement-katalog.json: % Zeilen gelesen, erwartet ${data.supplements.length}', v_input;
  END IF;
  IF v_active < ${data.supplements.length} THEN
    RAISE EXCEPTION 'supplement_catalog: nur % aktive Supplements, erwartet mindestens ${data.supplements.length}', v_active;
  END IF;

  RAISE NOTICE 'OK: % aktive Supplements im Katalog (% insgesamt)', v_active, v_total;
END $$;

COMMIT;
`

  const result = spawnSync(
    'docker',
    ['exec', '-i', CONTAINER, 'psql', '-U', 'postgres', '-d', DB, '-f', '-'],
    { input: sql, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 },
  )
  if (result.stdout) process.stdout.write(result.stdout)
  if (result.stderr) process.stderr.write(result.stderr)
  if (result.status !== 0) process.exit(result.status ?? 1)
}

const data = readData()
console.log(`${INPUT}: ${data.supplements.length} Standard-Supplements aus ${data.source}`)
runPsql(data)

