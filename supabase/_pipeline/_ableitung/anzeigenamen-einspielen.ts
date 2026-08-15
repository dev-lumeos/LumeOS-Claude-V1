#!/usr/bin/env node
// C-41: curated display names from supabase/_pipeline/daten/anzeigenamen.jsonl.
//
// SQL alone cannot robustly read the repo-local JSONL file from the DB
// container. This host-side chain step validates the file, streams it into a
// temporary psql table, and updates only the two display-name columns.
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'

const CONTAINER = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const DB = process.env.PGDATABASE ?? 'postgres'
const INPUT = 'supabase/_pipeline/daten/anzeigenamen.jsonl'
const EXPECTED_LINES = 5775

type Anzeigename = {
  bls_code: string
  name_display_de: string
  name_display_en: string
  sicher: boolean
}

function fail(message: string): never {
  console.error(message)
  process.exit(1)
}

function readRows(): { rows: Anzeigename[]; lines: string[]; sicherFalse: number } {
  const text = fs.readFileSync(INPUT, 'utf8')
  const lines = text.split('\n').filter(line => line.length > 0)
  if (lines.length !== EXPECTED_LINES) {
    fail(`${INPUT}: ${lines.length} Zeilen, erwartet ${EXPECTED_LINES}. Abbruch.`)
  }

  const seen = new Set<string>()
  const rows: Anzeigename[] = []
  let sicherFalse = 0

  lines.forEach((line, index) => {
    let parsed: unknown
    try {
      parsed = JSON.parse(line)
    } catch (error) {
      fail(`${INPUT}:${index + 1}: ungueltiges JSON: ${error instanceof Error ? error.message : String(error)}`)
    }
    if (!parsed || typeof parsed !== 'object') {
      fail(`${INPUT}:${index + 1}: JSON-Zeile ist kein Objekt`)
    }
    const row = parsed as Record<string, unknown>
    const blsCode = row.bls_code
    const nameDisplayDe = row.name_display_de
    const nameDisplayEn = row.name_display_en
    const sicher = row.sicher
    if (typeof blsCode !== 'string' || !blsCode.trim()) fail(`${INPUT}:${index + 1}: bls_code fehlt`)
    if (typeof nameDisplayDe !== 'string' || !nameDisplayDe.trim()) {
      fail(`${INPUT}:${index + 1}: name_display_de fehlt`)
    }
    if (typeof nameDisplayEn !== 'string' || !nameDisplayEn.trim()) {
      fail(`${INPUT}:${index + 1}: name_display_en fehlt`)
    }
    if (typeof sicher !== 'boolean') fail(`${INPUT}:${index + 1}: sicher ist kein Boolean`)
    if (seen.has(blsCode)) fail(`${INPUT}:${index + 1}: doppelter bls_code ${blsCode}`)
    seen.add(blsCode)
    if (!sicher) sicherFalse++
    rows.push({ bls_code: blsCode, name_display_de: nameDisplayDe, name_display_en: nameDisplayEn, sicher })
  })

  return { rows, lines, sicherFalse }
}

function csvCell(value: string): string {
  return `"${value.replace(/"/g, '""')}"`
}

function runPsql(lines: string[]): void {
  const sql = `\\set ON_ERROR_STOP on
BEGIN;

CREATE TEMP TABLE tmp_anzeigenamen_jsonl (
  payload text NOT NULL
) ON COMMIT DROP;

COPY tmp_anzeigenamen_jsonl (payload) FROM STDIN WITH (FORMAT csv);
${lines.map(csvCell).join('\n')}
\\.

DO $$
DECLARE
  v_input int;
  v_missing int;
  v_updated int;
  v_sicher_false int;
BEGIN
  SELECT COUNT(*) INTO v_input FROM tmp_anzeigenamen_jsonl;
  IF v_input <> ${EXPECTED_LINES} THEN
    RAISE EXCEPTION 'anzeigenamen.jsonl: % Zeilen, erwartet ${EXPECTED_LINES}', v_input;
  END IF;

  WITH parsed AS (
    SELECT payload::jsonb->>'bls_code' AS bls_code
    FROM tmp_anzeigenamen_jsonl
  )
  SELECT COUNT(*) INTO v_missing
  FROM parsed p
  LEFT JOIN nutrition.foods f ON f.bls_code = p.bls_code
  WHERE f.id IS NULL;

  IF v_missing <> 0 THEN
    RAISE EXCEPTION 'anzeigenamen.jsonl: % Codes fehlen in nutrition.foods', v_missing;
  END IF;

  WITH parsed AS (
    SELECT payload::jsonb->>'bls_code' AS bls_code,
           payload::jsonb->>'name_display_de' AS name_display_de,
           payload::jsonb->>'name_display_en' AS name_display_en
    FROM tmp_anzeigenamen_jsonl
  )
  UPDATE nutrition.foods f
  SET name_display_de = p.name_display_de,
      name_display_en = p.name_display_en
  FROM parsed p
  WHERE f.bls_code = p.bls_code;

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  IF v_updated <> v_input THEN
    RAISE EXCEPTION 'anzeigenamen.jsonl: % aktualisiert, erwartet %', v_updated, v_input;
  END IF;

  SELECT COUNT(*) INTO v_sicher_false
  FROM tmp_anzeigenamen_jsonl
  WHERE (payload::jsonb->>'sicher')::boolean = false;

  RAISE NOTICE 'OK: % Anzeigenamen aktualisiert, % sicher=false', v_updated, v_sicher_false;
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
  if (result.status !== 0) {
    process.exit(result.status ?? 1)
  }
}

const { lines, sicherFalse } = readRows()
console.log(`${INPUT}: ${lines.length} Zeilen, ${sicherFalse} sicher=false`)
runPsql(lines)
