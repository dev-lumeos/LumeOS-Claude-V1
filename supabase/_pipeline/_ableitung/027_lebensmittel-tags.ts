#!/usr/bin/env node
// C-46: curated food tags from supabase/_pipeline/daten/lebensmittel-tags.jsonl.
//
// This step supplements 020_food_human_layer.sql. It replaces only the
// curated C-44 tag set and leaves the macro-derived tags from 020 intact.
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'

const CONTAINER = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const DB = process.env.PGDATABASE ?? 'postgres'
const INPUT = 'supabase/_pipeline/daten/lebensmittel-tags.jsonl'
const EXPECTED_FOODS = 7140

const TAG_DEFINITIONS = [
  ['whole_food', 'Grundnahrungsmittel', 'Whole food', 'processing', false, 50],
  ['ultra_processed', 'Hochverarbeitet', 'Ultra-processed', 'processing', false, 60],
  ['vegan', 'Vegan', 'Vegan', 'diet', true, 70],
  ['vegetarian', 'Vegetarisch', 'Vegetarian', 'diet', true, 80],
  ['contains_nuts', 'Enthält Nüsse', 'Contains nuts', 'allergen', true, 90],
  ['contains_gluten', 'Enthält Gluten', 'Contains gluten', 'allergen', true, 100],
  ['contains_lactose', 'Enthält Laktose', 'Contains lactose', 'allergen', true, 110],
  ['thai_food', 'Thai Food', 'Thai food', 'diet', false, 120],
  ['halal', 'Halal', 'Halal', 'diet', false, 130],
  ['kosher', 'Koscher', 'Kosher', 'diet', false, 140],
] as const

const MANAGED_TAGS = TAG_DEFINITIONS.map(([code]) => code)
const OBSOLETE_TAGS = [
  'processed_food',
  'mediterranean',
  'spicy',
  'nut_free',
  'gluten_free',
  'lactose_free',
]
const VALID_TAGS = new Set(MANAGED_TAGS)

type ParsedTag = {
  bls_code: string
  tag: string
}

function fail(message: string): never {
  console.error(message)
  process.exit(1)
}

function csvCell(value: string): string {
  return `"${value.replace(/"/g, '""')}"`
}

function readRows(): { rows: ParsedTag[]; taggedFoods: number; assignments: number } {
  const text = fs.readFileSync(INPUT, 'utf8')
  const lines = text.split(/\r?\n/).filter(line => line.length > 0)
  const rows: ParsedTag[] = []
  const seen = new Set<string>()

  for (const [index, line] of lines.entries()) {
    let parsed: unknown
    try {
      parsed = JSON.parse(line)
    } catch (error) {
      fail(`${INPUT}:${index + 1}: ungueltiges JSON: ${error instanceof Error ? error.message : String(error)}`)
    }
    if (!parsed || typeof parsed !== 'object') fail(`${INPUT}:${index + 1}: JSON-Zeile ist kein Objekt`)
    const row = parsed as Record<string, unknown>
    if (typeof row.bls_code !== 'string' || !row.bls_code.trim()) fail(`${INPUT}:${index + 1}: bls_code fehlt`)
    if (!Array.isArray(row.tags) || row.tags.length === 0) fail(`${INPUT}:${index + 1}: tags fehlt oder leer`)

    for (const tagEntry of row.tags) {
      if (!tagEntry || typeof tagEntry !== 'object') fail(`${INPUT}:${index + 1}: tag-Eintrag ist kein Objekt`)
      const tag = (tagEntry as Record<string, unknown>).tag
      if (typeof tag !== 'string' || !VALID_TAGS.has(tag)) {
        fail(`${INPUT}:${index + 1}: unbekannter Tag ${String(tag)}`)
      }
      const key = `${row.bls_code}\u0000${tag}`
      if (seen.has(key)) fail(`${INPUT}:${index + 1}: doppelter Tag ${tag} bei ${row.bls_code}`)
      seen.add(key)
      rows.push({ bls_code: row.bls_code, tag })
    }
  }

  return { rows, taggedFoods: lines.length, assignments: rows.length }
}

function runPsql(rows: ParsedTag[]): void {
  const payload = rows.map(row => csvCell(JSON.stringify(row))).join('\n')
  const tagValues = TAG_DEFINITIONS
    .map(([code, nameDe, nameEn, type, exclusion, order]) =>
      `('${code}','${nameDe}','${nameEn}','${type}',${exclusion},'','${order}'::int,false,NULL::jsonb)`)
    .join(',\n    ')
  const managedArray = `ARRAY[${MANAGED_TAGS.map(tag => `'${tag}'`).join(',')}]`
  const obsoleteArray = `ARRAY[${OBSOLETE_TAGS.map(tag => `'${tag}'`).join(',')}]`

  const sql = `\\set ON_ERROR_STOP on
BEGIN;

CREATE TEMP TABLE tmp_lebensmittel_tags (
  payload text NOT NULL
) ON COMMIT DROP;

COPY tmp_lebensmittel_tags (payload) FROM STDIN WITH (FORMAT csv);
${payload}
\\.

INSERT INTO nutrition.tag_definitions
  (code, name_de, name_en, tag_type, is_exclusion_relevant, icon, sort_order, requires_macro_check, macro_rule)
VALUES
    ${tagValues}
ON CONFLICT (code) DO UPDATE SET
  name_de = EXCLUDED.name_de,
  name_en = EXCLUDED.name_en,
  tag_type = EXCLUDED.tag_type,
  is_exclusion_relevant = EXCLUDED.is_exclusion_relevant,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  requires_macro_check = EXCLUDED.requires_macro_check,
  macro_rule = EXCLUDED.macro_rule;

DO $$
DECLARE
  v_input int;
  v_missing int;
  v_deleted int;
  v_inserted int;
  v_foods int;
BEGIN
  SELECT COUNT(*) INTO v_input FROM tmp_lebensmittel_tags;
  IF v_input <> ${rows.length} THEN
    RAISE EXCEPTION 'lebensmittel-tags.jsonl: % Tagzeilen, erwartet ${rows.length}', v_input;
  END IF;

  WITH parsed AS (
    SELECT payload::jsonb->>'bls_code' AS bls_code
    FROM tmp_lebensmittel_tags
  )
  SELECT COUNT(*) INTO v_missing
  FROM parsed p
  LEFT JOIN nutrition.foods f ON f.bls_code = p.bls_code
  WHERE f.id IS NULL;
  IF v_missing <> 0 THEN
    RAISE EXCEPTION 'lebensmittel-tags.jsonl: % Codes fehlen in nutrition.foods', v_missing;
  END IF;

  DELETE FROM nutrition.food_tags
  WHERE tag_code = ANY (${managedArray});
  GET DIAGNOSTICS v_deleted = ROW_COUNT;

  WITH parsed AS (
    SELECT f.id AS food_id,
           payload::jsonb->>'tag' AS tag_code
    FROM tmp_lebensmittel_tags t
    JOIN nutrition.foods f ON f.bls_code = t.payload::jsonb->>'bls_code'
  )
  INSERT INTO nutrition.food_tags (food_id, tag_code, confidence)
  SELECT food_id, tag_code, 1.0
  FROM parsed
  ON CONFLICT DO NOTHING;
  GET DIAGNOSTICS v_inserted = ROW_COUNT;

  IF v_inserted <> v_input THEN
    RAISE EXCEPTION 'lebensmittel-tags.jsonl: % eingefuegt, erwartet %', v_inserted, v_input;
  END IF;

  DELETE FROM nutrition.tag_definitions
  WHERE code = ANY (${obsoleteArray});

  SELECT COUNT(*) INTO v_foods FROM nutrition.foods;
  IF v_foods <> ${EXPECTED_FOODS} THEN
    RAISE EXCEPTION 'nutrition.foods: % Zeilen, erwartet ${EXPECTED_FOODS}', v_foods;
  END IF;

  RAISE NOTICE 'OK: % kuratierte Tagzuordnungen eingefuegt, % alte kuratierte Zuordnungen ersetzt', v_inserted, v_deleted;
END $$;

COMMIT;
`

  const result = spawnSync(
    'docker',
    ['exec', '-i', CONTAINER, 'psql', '-U', 'postgres', '-d', DB, '-f', '-'],
    { input: sql, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 },
  )
  if (result.stdout) process.stdout.write(result.stdout)
  if (result.stderr) process.stderr.write(result.stderr)
  if (result.status !== 0) process.exit(result.status ?? 1)
}

const { rows, taggedFoods, assignments } = readRows()
console.log(`${INPUT}: ${taggedFoods} Foods mit Tags, ${assignments} kuratierte Tagzuordnungen`)
runPsql(rows)
