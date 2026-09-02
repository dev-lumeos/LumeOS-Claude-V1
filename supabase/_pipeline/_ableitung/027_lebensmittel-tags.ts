#!/usr/bin/env node
// C-46: curated food tags from supabase/_pipeline/daten/lebensmittel-tags.jsonl.
//
// This step supplements 020_food_human_layer.sql. It replaces only the
// curated C-44 tag set and leaves the macro-derived tags from 020 intact.
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import { foodsImBestand } from './anzeigenamen-erwartung'

const CONTAINER = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const DB = process.env.PGDATABASE ?? 'postgres'
const INPUT = 'supabase/_pipeline/daten/lebensmittel-tags.jsonl'
// `[cmd]` 2026-08-15: Hier stand `7140` fest. Derselbe Defekt wie in 025
// und 026, ein Schritt spaeter — er haette beim naechsten
// Bestandsnachtrag genauso zugeschlagen. Die Zahl wird jetzt aus dem
// Bestand gelesen; die Absicherung gegen einen stillen Teilimport
// bleibt, weil die Kuration weiterhin gegen diese Zahl geprueft wird.
const EXPECTED_FOODS = foodsImBestand(CONTAINER, DB)

const TAG_DEFINITIONS = [
  ['whole_food', 'Grundnahrungsmittel', 'Whole food', 'processing', false, 50, 'processing'],
  ['ultra_processed', 'Hochverarbeitet', 'Ultra-processed', 'processing', false, 60, 'processing'],
  ['vegan', 'Vegan', 'Vegan', 'diet', true, 70, 'dietary_pattern'],
  ['vegetarian', 'Vegetarisch', 'Vegetarian', 'diet', true, 80, 'dietary_pattern'],
  ['contains_nuts', 'Enthält Nüsse', 'Contains nuts', 'allergen', true, 90, 'allergen'],
  ['contains_gluten', 'Enthält Gluten', 'Contains gluten', 'allergen', true, 100, 'allergen'],
  ['contains_lactose', 'Enthält Laktose', 'Contains lactose', 'allergen', true, 110, 'allergen'],
  ['thai_food', 'Thai Food', 'Thai food', 'diet', false, 120, 'dietary_pattern'],
  ['halal', 'Halal', 'Halal', 'diet', false, 130, 'dietary_pattern'],
  ['kosher', 'Koscher', 'Kosher', 'diet', false, 140, 'dietary_pattern'],
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
    .map(([code, nameDe, nameEn, type, exclusion, order, filterGroup]) =>
      `('${code}','${nameDe}','${nameEn}','${type}',${exclusion},'','${order}'::int,false,NULL::jsonb,'${filterGroup}')`)
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
  (code, name_de, name_en, tag_type, is_exclusion_relevant, icon, sort_order, requires_macro_check, macro_rule, filter_group)
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
  macro_rule = EXCLUDED.macro_rule,
  filter_group = EXCLUDED.filter_group;

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

  CREATE TEMP TABLE tmp_processing_level ON COMMIT DROP AS
  WITH tag_flags AS (
    SELECT f.id AS food_id,
           f.bls_code,
           nutrition.search_fold(f.name_de) AS name_folded,
           EXISTS (
             SELECT 1
             FROM nutrition.food_tags ft
             WHERE ft.food_id = f.id
               AND ft.tag_code = 'ultra_processed'
           ) AS is_ultra_processed
    FROM nutrition.foods f
  )
  SELECT food_id,
         CASE
           WHEN is_ultra_processed THEN 'ultra_processed'
           WHEN name_folded ~ '\\m(geraeuchert|rauch)\\M' THEN 'smoked'
           WHEN name_folded ~ '\\mkonserve\\M' THEN 'canned'
           WHEN name_folded ~ '\\m(getrocknet|trocken)\\M' THEN 'dried'
           WHEN name_folded ~ '\\m(fermentiert|sauerkraut|kimchi|joghurt|kefir)\\M' THEN 'fermented'
           WHEN name_folded ~ '\\m(gebraten|gekocht|gegrillt|gebacken|geduenstet|geschmort|frittiert|pochiert|paniert)\\M' THEN 'cooked'
           WHEN name_folded ~ '\\mtiefgefroren\\M' THEN 'minimally_processed'
           WHEN name_folded ~ '\\m(geschaelt|zerkleinert|passiert|pasteurisiert|homogenisiert|flocken|mehl|griess|schrot|graupen|saft|nektar)\\M' THEN 'minimally_processed'
           ELSE 'raw'
         END AS processing_level,
         CASE
           WHEN is_ultra_processed THEN 'tag:ultra_processed'
           WHEN name_folded ~ '\\m(geraeuchert|rauch)\\M' THEN 'name:geraeuchert'
           WHEN name_folded ~ '\\mkonserve\\M' THEN 'name:konserve'
           WHEN name_folded ~ '\\m(getrocknet|trocken)\\M' THEN 'name:getrocknet'
           WHEN name_folded ~ '\\m(fermentiert|sauerkraut|kimchi|joghurt|kefir)\\M' THEN 'name:fermentiert'
           WHEN name_folded ~ '\\m(gebraten|gekocht|gegrillt|gebacken|geduenstet|geschmort|frittiert|pochiert|paniert)\\M' THEN 'name:gekocht-gebraten'
           WHEN name_folded ~ '\\mtiefgefroren\\M' THEN 'name:tiefgefroren'
           WHEN name_folded ~ '\\m(geschaelt|zerkleinert|passiert|pasteurisiert|homogenisiert|flocken|mehl|griess|schrot|graupen|saft|nektar)\\M' THEN 'name:minimal'
           ELSE 'default:raw'
         END AS rule
  FROM tag_flags;

  UPDATE nutrition.foods f
  SET processing_level = p.processing_level
  FROM tmp_processing_level p
  WHERE p.food_id = f.id;

  RAISE NOTICE 'processing_level nach C-100: %',
    (
      SELECT string_agg(processing_level || '=' || anzahl, ', ' ORDER BY processing_level)
      FROM (
        SELECT processing_level, COUNT(*) AS anzahl
        FROM tmp_processing_level
        GROUP BY processing_level
      ) x
    );

  RAISE NOTICE 'processing_level-Regeln nach C-100: %',
    (
      SELECT string_agg(rule || '=' || anzahl, ', ' ORDER BY rule)
      FROM (
        SELECT rule, COUNT(*) AS anzahl
        FROM tmp_processing_level
        GROUP BY rule
      ) x
    );

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

const refresh = spawnSync(
  process.execPath,
  ['node_modules/tsx/dist/cli.cjs', 'supabase/_pipeline/_ableitung/sortweight-berechnen.ts', '--anwenden'],
  { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 },
)
if (refresh.error) {
  console.error(refresh.error)
  process.exit(1)
}
if (refresh.stdout) process.stdout.write(refresh.stdout)
if (refresh.stderr) process.stderr.write(refresh.stderr)
if (refresh.status !== 0) process.exit(refresh.status ?? 1)
