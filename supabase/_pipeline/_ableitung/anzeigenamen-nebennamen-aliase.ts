#!/usr/bin/env node
// C-41: curated secondary names from anzeigenamen.jsonl into food_aliases.
//
// This supplements 022_alias_ableitung.sql. It never derives aliases from
// name_display_de; the only source is the curated nebennamen array.
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import { erwarteteZeilen } from './anzeigenamen-erwartung'

const CONTAINER = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const DB = process.env.PGDATABASE ?? 'postgres'
const INPUT = 'supabase/_pipeline/daten/anzeigenamen.jsonl'

// ABGELEITET wie in 025 — siehe ./anzeigenamen-erwartung.ts.
// ACHTUNG, nicht verwechseln: geprueft wird die Zeilenzahl der
// EINGABE. Die Zahl der erzeugten Aliase ist naturgemaess kleiner,
// weil nur Zeilen mit `nebennamen` etwas beitragen — `[cmd]` 663
// kuratierte Namen aus 576 Foods.
const EXPECTED_LINES = erwarteteZeilen(CONTAINER, DB)
const SOURCE = 'curated_nebenname'

type AliasRow = {
  bls_code: string
  alias: string
}

function fail(message: string): never {
  console.error(message)
  process.exit(1)
}

function readAliases(): { aliases: AliasRow[]; rowsWithAliases: number; lines: number } {
  const text = fs.readFileSync(INPUT, 'utf8')
  const lines = text.split('\n').filter(line => line.length > 0)
  if (lines.length !== EXPECTED_LINES) {
    fail(`${INPUT}: ${lines.length} Zeilen, erwartet ${EXPECTED_LINES}. Abbruch.`)
  }

  const aliases: AliasRow[] = []
  const seen = new Set<string>()
  let rowsWithAliases = 0

  lines.forEach((line, index) => {
    let parsed: unknown
    try {
      parsed = JSON.parse(line)
    } catch (error) {
      fail(`${INPUT}:${index + 1}: ungueltiges JSON: ${error instanceof Error ? error.message : String(error)}`)
    }
    if (!parsed || typeof parsed !== 'object') fail(`${INPUT}:${index + 1}: JSON-Zeile ist kein Objekt`)
    const row = parsed as Record<string, unknown>
    const blsCode = row.bls_code
    if (typeof blsCode !== 'string' || !blsCode.trim()) fail(`${INPUT}:${index + 1}: bls_code fehlt`)
    if (!Array.isArray(row.nebennamen)) fail(`${INPUT}:${index + 1}: nebennamen fehlt oder ist kein Array`)
    if (row.nebennamen.length) rowsWithAliases++

    for (const value of row.nebennamen) {
      if (typeof value !== 'string' || !value.trim()) {
        fail(`${INPUT}:${index + 1}: leerer Nebenname bei ${blsCode}`)
      }
      if (/[(),]/.test(value)) {
        fail(`${INPUT}:${index + 1}: Nebenname enthaelt Klammer oder Komma: ${value}`)
      }
      const key = `${blsCode}\u0000${value.trim().toLocaleLowerCase('de-DE')}`
      if (seen.has(key)) continue
      seen.add(key)
      aliases.push({ bls_code: blsCode, alias: value.trim() })
    }
  })

  return { aliases, rowsWithAliases, lines: lines.length }
}

function csvCell(value: string): string {
  return `"${value.replace(/"/g, '""')}"`
}

function runPsql(aliases: AliasRow[]): void {
  const payload = aliases.map(alias => csvCell(JSON.stringify(alias))).join('\n')
  const sql = `\\set ON_ERROR_STOP on
BEGIN;

ALTER TABLE nutrition.food_aliases
  -- 2026-08-15 [cmd]: Die Liste traegt AUCH curated_suchbegriff, obwohl
  -- dieser Schritt ihn nicht erzeugt. Grund: 028 setzt dieselbe Bedingung
  -- mit seiner eigenen Liste. Auf leerer Datenbank faellt das nicht auf,
  -- weil 028 spaeter laeuft und erweitert — gegen einen Bestand, in dem
  -- 028 bereits Zeilen angelegt hat, bricht dieser Schritt ab.
  -- Dieselbe Bedingung an zwei Orten: beide Listen muessen vollstaendig
  -- sein, sonst entscheidet die Reihenfolge ueber den Erfolg.
  DROP CONSTRAINT IF EXISTS food_aliases_source_check;
ALTER TABLE nutrition.food_aliases
  ADD CONSTRAINT food_aliases_source_check
  CHECK (source = ANY (ARRAY['editorial','ai_generated','user','derived',
                             'curated_nebenname','curated_suchbegriff']));

COMMENT ON COLUMN nutrition.food_aliases.source IS
  'editorial = von Hand gepflegt; ai_generated = von einem Modell vorgeschlagen; user = aus Nutzereingabe; derived = mechanisch aus dem Bestandsnamen abgeleitet; curated_nebenname = kuratierter Nebenname aus anzeigenamen.jsonl.';

CREATE TEMP TABLE tmp_anzeigenamen_nebennamen (
  payload text NOT NULL
) ON COMMIT DROP;

COPY tmp_anzeigenamen_nebennamen (payload) FROM STDIN WITH (FORMAT csv);
${payload}
\\.

DO $$
DECLARE
  v_input int;
  v_missing int;
  v_overlap int;
  v_inserted int;
BEGIN
  SELECT COUNT(*) INTO v_input FROM tmp_anzeigenamen_nebennamen;

  WITH parsed AS (
    SELECT payload::jsonb->>'bls_code' AS bls_code,
           payload::jsonb->>'alias' AS alias
    FROM tmp_anzeigenamen_nebennamen
  )
  SELECT COUNT(*) INTO v_missing
  FROM parsed p
  LEFT JOIN nutrition.foods f ON f.bls_code = p.bls_code
  WHERE f.id IS NULL;

  IF v_missing <> 0 THEN
    RAISE EXCEPTION 'nebennamen: % Codes fehlen in nutrition.foods', v_missing;
  END IF;

  WITH parsed AS (
    SELECT f.id AS food_id,
           payload::jsonb->>'alias' AS alias
    FROM tmp_anzeigenamen_nebennamen t
    JOIN nutrition.foods f ON f.bls_code = t.payload::jsonb->>'bls_code'
  )
  SELECT COUNT(*) INTO v_overlap
  FROM parsed p
  WHERE EXISTS (
    SELECT 1
    FROM nutrition.food_aliases fa
    WHERE fa.food_id = p.food_id
      AND fa.locale = 'de'
      AND nutrition.search_fold(fa.alias) = nutrition.search_fold(p.alias)
  );

  WITH parsed AS (
    SELECT f.id AS food_id,
           payload::jsonb->>'alias' AS alias
    FROM tmp_anzeigenamen_nebennamen t
    JOIN nutrition.foods f ON f.bls_code = t.payload::jsonb->>'bls_code'
  )
  INSERT INTO nutrition.food_aliases (food_id, alias, locale, source)
  SELECT p.food_id, p.alias, 'de', '${SOURCE}'
  FROM parsed p
  WHERE NOT EXISTS (
    SELECT 1
    FROM nutrition.food_aliases fa
    WHERE fa.food_id = p.food_id
      AND fa.locale = 'de'
      AND nutrition.search_fold(fa.alias) = nutrition.search_fold(p.alias)
  )
  ON CONFLICT DO NOTHING;

  GET DIAGNOSTICS v_inserted = ROW_COUNT;
  RAISE NOTICE 'OK: % kuratierte Nebennamen, % bereits vorhanden, % eingefuegt', v_input, v_overlap, v_inserted;
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

const { aliases, rowsWithAliases, lines } = readAliases()
console.log(`${INPUT}: ${lines} Zeilen, ${rowsWithAliases} mit nebennamen, ${aliases.length} kuratierte Nebennamen`)
runPsql(aliases)
