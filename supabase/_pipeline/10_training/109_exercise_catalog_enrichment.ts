#!/usr/bin/env node
// C-83: Enrich the existing exercise catalog from the local XLSX source.
//
// The XLSX contains useful source metadata (muscle labels with common and
// anatomical names, raw equipment and categories). Existing exercises,
// instructions, tips and exercise_muscles stay untouched.
import { spawnSync } from 'node:child_process'

const CONTAINER = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const DB = process.env.PGDATABASE ?? 'postgres'
const XLSX = 'media/exercises/katalog/1500+ exercise data.xlsx'
const SHEET = 'Sheet1'

type Exercise = {
  id: string
  name: string
  instructions: string
  tips: string
}

type XlsxRow = {
  row_number: number
  categories: string
  exercise: string
  instructions: string
  tips: string
  primary_muscles: string
  secondary_muscles: string
  equipment: string
}

type MatchStatus = 'unique' | 'duplicate_identical' | 'duplicate_one_filled'

type EnrichmentRow = {
  exercise_id: string
  source_file: string
  source_sheet: string
  source_row: number
  source_rows: number[]
  match_status: MatchStatus
  xlsx_exercise: string
  instructions_same_as_exercises: boolean
  tips_same_as_exercises: boolean
  primary_activating_muscles: string
  secondary_activating_muscles: string
  equipment_raw: string
  equipment_canonical: string
  categories_raw: string
  categories_canonical: string
}

function fail(message: string): never {
  console.error(message)
  process.exit(1)
}

function runDockerPsql(args: string[], input?: string): string {
  const result = spawnSync(
    'docker',
    ['exec', '-i', CONTAINER, 'psql', '-U', 'postgres', '-d', DB, ...args],
    { input, encoding: 'utf8', maxBuffer: 512 * 1024 * 1024 },
  )
  if (result.stderr) process.stderr.write(result.stderr)
  if (result.status !== 0) process.exit(result.status ?? 1)
  return result.stdout
}

function readExercises(): Exercise[] {
  const out = runDockerPsql([
    '-t',
    '-A',
    '-c',
    `SELECT COALESCE(
       jsonb_agg(
         jsonb_build_object(
           'id', id,
           'name', name,
           'instructions', COALESCE(instructions, ''),
           'tips', COALESCE(tips, '')
         )
         ORDER BY name
       ),
       '[]'::jsonb
     )::text
     FROM training.exercises;`,
  ])
  return JSON.parse(out.trim()) as Exercise[]
}

function readXlsxRows(): XlsxRow[] {
  const python = String.raw`
import json
import sys
from pathlib import Path

try:
    import openpyxl
except Exception as exc:
    print(f"openpyxl fehlt: {exc}", file=sys.stderr)
    sys.exit(2)

path = Path(sys.argv[1])
if not path.exists():
    print(f"XLSX fehlt: {path}", file=sys.stderr)
    sys.exit(1)

wb = openpyxl.load_workbook(path, read_only=True, data_only=True)
ws = wb.active
headers = [cell.value for cell in next(ws.iter_rows(min_row=1, max_row=1))]
index = {header: i for i, header in enumerate(headers)}
required = [
    "Categories",
    "Exercise",
    "Exercise Instructions (step by step)",
    "Exercise Tips",
    "Primary Activating Muscles",
    "Secondary Activating Muscles",
    "Equipment",
]
missing = [header for header in required if header not in index]
if missing:
    print(f"XLSX-Spalten fehlen: {', '.join(missing)}", file=sys.stderr)
    sys.exit(1)

def text(value):
    if value is None:
        return ""
    return str(value)

rows = []
for row_number, values in enumerate(ws.iter_rows(min_row=2, values_only=True), start=2):
    exercise = text(values[index["Exercise"]]).strip()
    if not exercise:
        continue
    rows.append({
        "row_number": row_number,
        "categories": text(values[index["Categories"]]),
        "exercise": text(values[index["Exercise"]]),
        "instructions": text(values[index["Exercise Instructions (step by step)"]]),
        "tips": text(values[index["Exercise Tips"]]),
        "primary_muscles": text(values[index["Primary Activating Muscles"]]),
        "secondary_muscles": text(values[index["Secondary Activating Muscles"]]),
        "equipment": text(values[index["Equipment"]]),
    })

json.dump(rows, sys.stdout, ensure_ascii=False)
`
  const result = spawnSync('python', ['-c', python, XLSX], {
    encoding: 'utf8',
    maxBuffer: 512 * 1024 * 1024,
  })
  if (result.stderr) process.stderr.write(result.stderr)
  if (result.status !== 0) process.exit(result.status ?? 1)
  return JSON.parse(result.stdout) as XlsxRow[]
}

function stripGenderSuffix(value: string): string {
  return value.replace(/_(Male|Female)$/i, '').trim()
}

function normalizeText(value: string): string {
  return value.replace(/\s+/g, ' ').trim()
}

function relevantKey(row: XlsxRow): string {
  return [
    normalizeText(row.instructions),
    normalizeText(row.tips),
    normalizeText(row.primary_muscles),
    normalizeText(row.secondary_muscles),
    normalizeText(row.equipment),
    normalizeText(row.categories),
  ].join('\u0000')
}

function hasRelevantContent(row: XlsxRow): boolean {
  return [
    row.instructions,
    row.tips,
    row.primary_muscles,
    row.secondary_muscles,
    row.equipment,
    row.categories,
  ].some(value => normalizeText(value).length > 0)
}

function canonicalEquipment(value: string): string {
  const trimmed = normalizeText(value)
  if (!trimmed) return ''
  if (trimmed === 'None (Bodyweight)' || trimmed.toLowerCase() === 'none') return 'None'
  if (trimmed.toLowerCase() === 'ski ergometer') return 'Ski Ergometer'
  if (trimmed.toLowerCase() === 'ez bar') return 'EZ Bar'
  if (trimmed.toLowerCase() === 'ab wheel') return 'Ab Wheel'
  if (trimmed.toLowerCase() === 'chair') return 'Chair'
  return trimmed
}

function canonicalCategory(value: string): string {
  const trimmed = normalizeText(value)
  if (trimmed.toLowerCase() === 'bodyweight') return 'Bodyweight'
  return trimmed
}

function selectSafeRow(matches: XlsxRow[]): { status: MatchStatus; row: XlsxRow } | null {
  if (matches.length === 1) return { status: 'unique', row: matches[0] }

  const keys = new Set(matches.map(relevantKey))
  if (keys.size === 1) return { status: 'duplicate_identical', row: matches[0] }

  const filled = matches.filter(hasRelevantContent)
  if (filled.length === 1) return { status: 'duplicate_one_filled', row: filled[0] }

  return null
}

function buildRows(exercises: Exercise[], xlsxRows: XlsxRow[]): {
  rows: EnrichmentRow[]
  missing: string[]
  ambiguous: string[]
} {
  const byName = new Map<string, XlsxRow[]>()
  for (const row of xlsxRows) {
    const key = stripGenderSuffix(row.exercise)
    if (!byName.has(key)) byName.set(key, [])
    byName.get(key)!.push(row)
  }

  const rows: EnrichmentRow[] = []
  const missing: string[] = []
  const ambiguous: string[] = []

  for (const exercise of exercises) {
    const matches = byName.get(stripGenderSuffix(exercise.name)) ?? []
    if (matches.length === 0) {
      missing.push(exercise.name)
      continue
    }
    const selected = selectSafeRow(matches)
    if (!selected) {
      ambiguous.push(exercise.name)
      continue
    }

    const row = selected.row
    rows.push({
      exercise_id: exercise.id,
      source_file: XLSX,
      source_sheet: SHEET,
      source_row: row.row_number,
      source_rows: matches.map(match => match.row_number).sort((a, b) => a - b),
      match_status: selected.status,
      xlsx_exercise: row.exercise,
      instructions_same_as_exercises: normalizeText(row.instructions) === normalizeText(exercise.instructions),
      tips_same_as_exercises: normalizeText(row.tips) === normalizeText(exercise.tips),
      primary_activating_muscles: normalizeText(row.primary_muscles),
      secondary_activating_muscles: normalizeText(row.secondary_muscles),
      equipment_raw: row.equipment,
      equipment_canonical: canonicalEquipment(row.equipment),
      categories_raw: row.categories,
      categories_canonical: canonicalCategory(row.categories),
    })
  }

  return { rows, missing, ambiguous }
}

function csvCell(value: string): string {
  return `"${value.replace(/"/g, '""')}"`
}

function insertRows(rows: EnrichmentRow[]): void {
  const payload = rows.map(row => csvCell(JSON.stringify(row))).join('\n')
  const sql = `\\set ON_ERROR_STOP on
BEGIN;

CREATE TABLE IF NOT EXISTS training.exercise_catalog_enrichment (
  exercise_id uuid PRIMARY KEY REFERENCES training.exercises(id) ON DELETE CASCADE,
  source_file text NOT NULL,
  source_sheet text NOT NULL,
  source_row integer NOT NULL,
  source_rows integer[] NOT NULL,
  match_status text NOT NULL
    CHECK (match_status IN ('unique','duplicate_identical','duplicate_one_filled')),
  xlsx_exercise text NOT NULL,
  instructions_same_as_exercises boolean NOT NULL,
  tips_same_as_exercises boolean NOT NULL,
  primary_activating_muscles text NOT NULL DEFAULT '',
  secondary_activating_muscles text NOT NULL DEFAULT '',
  equipment_raw text NOT NULL DEFAULT '',
  equipment_canonical text NOT NULL DEFAULT '',
  categories_raw text NOT NULL DEFAULT '',
  categories_canonical text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE training.exercise_catalog_enrichment IS
  'C-83: reproduzierbare Anreicherung aus media/exercises/katalog/1500+ exercise data.xlsx; nur eindeutig gematchte Bestandsuebungen.';
COMMENT ON COLUMN training.exercise_catalog_enrichment.primary_activating_muscles IS
  'Rohtext aus XLSX, z.B. Alltagsname plus anatomischer Name in Klammern; keine deutsche Kuration.';
COMMENT ON COLUMN training.exercise_catalog_enrichment.equipment_canonical IS
  'Konservativ normalisierter XLSX-Geraetewert fuer spaetere Filter; training.equipment bleibt unveraendert.';

CREATE INDEX IF NOT EXISTS idx_exercise_catalog_enrichment_equipment
  ON training.exercise_catalog_enrichment(equipment_canonical);
CREATE INDEX IF NOT EXISTS idx_exercise_catalog_enrichment_category
  ON training.exercise_catalog_enrichment(categories_canonical);

GRANT SELECT, INSERT, UPDATE, DELETE ON training.exercise_catalog_enrichment TO authenticated;
GRANT ALL ON training.exercise_catalog_enrichment TO service_role;

ALTER TABLE training.exercise_catalog_enrichment ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS exercise_catalog_enrichment_select ON training.exercise_catalog_enrichment;
CREATE POLICY exercise_catalog_enrichment_select ON training.exercise_catalog_enrichment
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS exercise_catalog_enrichment_admin_insert ON training.exercise_catalog_enrichment;
DROP POLICY IF EXISTS exercise_catalog_enrichment_admin_update ON training.exercise_catalog_enrichment;
DROP POLICY IF EXISTS exercise_catalog_enrichment_admin_delete ON training.exercise_catalog_enrichment;
CREATE POLICY exercise_catalog_enrichment_admin_insert ON training.exercise_catalog_enrichment
  FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY exercise_catalog_enrichment_admin_update ON training.exercise_catalog_enrichment
  FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY exercise_catalog_enrichment_admin_delete ON training.exercise_catalog_enrichment
  FOR DELETE TO authenticated USING (public.is_admin());

CREATE TEMP TABLE tmp_exercise_catalog_enrichment (
  payload text NOT NULL
) ON COMMIT DROP;

COPY tmp_exercise_catalog_enrichment (payload) FROM STDIN WITH (FORMAT csv);
${payload}
\\.

TRUNCATE training.exercise_catalog_enrichment;

WITH parsed AS (
  SELECT payload::jsonb AS row
  FROM tmp_exercise_catalog_enrichment
)
INSERT INTO training.exercise_catalog_enrichment (
  exercise_id,
  source_file,
  source_sheet,
  source_row,
  source_rows,
  match_status,
  xlsx_exercise,
  instructions_same_as_exercises,
  tips_same_as_exercises,
  primary_activating_muscles,
  secondary_activating_muscles,
  equipment_raw,
  equipment_canonical,
  categories_raw,
  categories_canonical
)
SELECT
  (row->>'exercise_id')::uuid,
  row->>'source_file',
  row->>'source_sheet',
  (row->>'source_row')::integer,
  ARRAY(SELECT jsonb_array_elements_text(row->'source_rows')::integer ORDER BY 1),
  row->>'match_status',
  row->>'xlsx_exercise',
  (row->>'instructions_same_as_exercises')::boolean,
  (row->>'tips_same_as_exercises')::boolean,
  COALESCE(row->>'primary_activating_muscles', ''),
  COALESCE(row->>'secondary_activating_muscles', ''),
  COALESCE(row->>'equipment_raw', ''),
  COALESCE(row->>'equipment_canonical', ''),
  COALESCE(row->>'categories_raw', ''),
  COALESCE(row->>'categories_canonical', '')
FROM parsed;

DO $$
DECLARE
  v_exercises int;
  v_links int;
  v_rows int;
  v_distinct int;
  v_instruction_diff int;
  v_tip_diff int;
  v_bad_equipment int;
  v_bad_category int;
  v_orphans int;
BEGIN
  SELECT COUNT(*) INTO v_exercises FROM training.exercises;
  SELECT COUNT(*) INTO v_links FROM training.exercise_muscles;
  SELECT COUNT(*) INTO v_rows FROM training.exercise_catalog_enrichment;
  SELECT COUNT(DISTINCT exercise_id) INTO v_distinct FROM training.exercise_catalog_enrichment;
  SELECT COUNT(*) INTO v_instruction_diff FROM training.exercise_catalog_enrichment WHERE NOT instructions_same_as_exercises;
  SELECT COUNT(*) INTO v_tip_diff FROM training.exercise_catalog_enrichment WHERE NOT tips_same_as_exercises;
  SELECT COUNT(*) INTO v_bad_equipment
  FROM training.exercise_catalog_enrichment
  WHERE equipment_canonical LIKE '%  %'
     OR equipment_canonical <> btrim(equipment_canonical)
     OR equipment_canonical = 'None (Bodyweight)';
  SELECT COUNT(*) INTO v_bad_category
  FROM training.exercise_catalog_enrichment
  WHERE categories_canonical = 'bodyweight'
     OR categories_canonical <> btrim(categories_canonical);
  SELECT COUNT(*) INTO v_orphans
  FROM training.exercise_catalog_enrichment x
  LEFT JOIN training.exercises e ON e.id = x.exercise_id
  WHERE e.id IS NULL;

  IF v_exercises <> 1416 THEN
    RAISE EXCEPTION 'exercises: % statt 1416', v_exercises;
  END IF;
  IF v_links <> 6588 THEN
    RAISE EXCEPTION 'exercise_muscles: % statt 6588', v_links;
  END IF;
  IF v_rows <> ${rows.length} OR v_distinct <> ${rows.length} THEN
    RAISE EXCEPTION 'exercise_catalog_enrichment: % Zeilen / % distinct, erwartet ${rows.length}', v_rows, v_distinct;
  END IF;
  IF v_instruction_diff > 1 THEN
    RAISE EXCEPTION 'instructions weichen bei % sicheren XLSX-Matches ab, erwartet hoechstens 1 bekannten Zeichensatzfall', v_instruction_diff;
  END IF;
  IF v_tip_diff > 6 THEN
    RAISE EXCEPTION 'tips weichen bei % sicheren XLSX-Matches ab, erwartet hoechstens 6 bekannte Legacy-Textfaelle', v_tip_diff;
  END IF;
  IF v_bad_equipment <> 0 THEN
    RAISE EXCEPTION 'Geraete-Normalisierung unvollstaendig: %', v_bad_equipment;
  END IF;
  IF v_bad_category <> 0 THEN
    RAISE EXCEPTION 'Kategorie-Normalisierung unvollstaendig: %', v_bad_category;
  END IF;
  IF v_orphans <> 0 THEN
    RAISE EXCEPTION 'Waisen in exercise_catalog_enrichment: %', v_orphans;
  END IF;

  RAISE NOTICE 'OK: % XLSX-Anreicherungen, 1416 Uebungen, 6588 Muskelzuordnungen, 0 Waisen, % Instruction-Abweichung(en), % Tip-Abweichung(en)', v_rows, v_instruction_diff, v_tip_diff;
END $$;

COMMIT;
`
  runDockerPsql(['-v', 'ON_ERROR_STOP=1', '-f', '-'], sql)
}

const exercises = readExercises()
const xlsxRows = readXlsxRows()
const { rows, missing, ambiguous } = buildRows(exercises, xlsxRows)

if (exercises.length !== 1416) fail(`training.exercises: ${exercises.length} statt 1416`)
if (xlsxRows.length !== 2343) fail(`XLSX: ${xlsxRows.length} Zeilen statt 2343`)
if (rows.length !== 1407) fail(`Sichere Matches: ${rows.length} statt 1407`)
if (missing.length !== 1 || missing[0] !== 'MAJOR GROUPS Muscle body') {
  fail(`Unerwartete fehlende Matches: ${missing.join(', ')}`)
}
if (ambiguous.length !== 8) fail(`Unerwartete mehrdeutige Matches: ${ambiguous.length}`)

insertRows(rows)

console.log(`C-83 OK: ${rows.length} sichere XLSX-Anreicherungen, ${ambiguous.length} mehrdeutig, ${missing.length} fehlend.`)
