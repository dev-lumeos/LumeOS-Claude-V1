#!/usr/bin/env node
// C-46: curated search-term aliases from reis-alias-kuration.json.
//
// These are not secondary names from display-name curation. They are curated
// search terms such as rice varieties that intentionally point to existing BLS
// entries. Keep the source distinct from derived aliases and curated_nebenname.
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'

const CONTAINER = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const DB = process.env.PGDATABASE ?? 'postgres'
const INPUT = 'supabase/_pipeline/daten/reis-alias-kuration.json'
const SOURCE = 'curated_suchbegriff'

type AliasEntry = {
  suchbegriff: string
  ziel_bls_code: string
  zweitziel_bls_code?: string
  status: string
  begruendung: string
}

type DataFile = {
  eintraege: AliasEntry[]
}

type AliasRow = {
  bls_code: string
  alias: string
}

function fail(message: string): never {
  console.error(message)
  process.exit(1)
}

function csvCell(value: string): string {
  return `"${value.replace(/"/g, '""')}"`
}

function readAliases(): AliasRow[] {
  const data = JSON.parse(fs.readFileSync(INPUT, 'utf8')) as DataFile
  if (!Array.isArray(data.eintraege)) fail(`${INPUT}: eintraege fehlt`)

  const rows: AliasRow[] = []
  const seen = new Set<string>()
  for (const [index, entry] of data.eintraege.entries()) {
    if (entry.status !== 'gesetzt') continue
    if (typeof entry.suchbegriff !== 'string' || !entry.suchbegriff.trim()) {
      fail(`${INPUT}: eintraege[${index}].suchbegriff fehlt`)
    }
    if (typeof entry.ziel_bls_code !== 'string' || !entry.ziel_bls_code.trim()) {
      fail(`${INPUT}: eintraege[${index}].ziel_bls_code fehlt`)
    }

    const targets = [entry.ziel_bls_code]
    if (entry.zweitziel_bls_code) targets.push(entry.zweitziel_bls_code)
    for (const target of targets) {
      const key = `${target}\u0000${entry.suchbegriff.trim().toLocaleLowerCase('de-DE')}`
      if (seen.has(key)) continue
      seen.add(key)
      rows.push({ bls_code: target, alias: entry.suchbegriff.trim() })
    }
  }
  return rows
}

function runPsql(aliases: AliasRow[]): void {
  const payload = aliases.map(alias => csvCell(JSON.stringify(alias))).join('\n')
  const sql = `\\set ON_ERROR_STOP on
BEGIN;

ALTER TABLE nutrition.food_aliases
  DROP CONSTRAINT IF EXISTS food_aliases_source_check;
ALTER TABLE nutrition.food_aliases
  ADD CONSTRAINT food_aliases_source_check
  CHECK (source = ANY (ARRAY['editorial','ai_generated','user','derived','curated_nebenname','${SOURCE}']));

COMMENT ON COLUMN nutrition.food_aliases.source IS
  'editorial = von Hand gepflegt; ai_generated = von einem Modell vorgeschlagen; user = aus Nutzereingabe; derived = mechanisch aus dem Bestandsnamen abgeleitet; curated_nebenname = kuratierter Nebenname aus anzeigenamen.jsonl; curated_suchbegriff = kuratierter Suchbegriff/Sortenalias aus Datendatei.';

CREATE TEMP TABLE tmp_kuratierte_aliase (
  payload text NOT NULL
) ON COMMIT DROP;

COPY tmp_kuratierte_aliase (payload) FROM STDIN WITH (FORMAT csv);
${payload}
\\.

DO $$
DECLARE
  v_input int;
  v_missing int;
  v_overlap int;
  v_inserted int;
BEGIN
  SELECT COUNT(*) INTO v_input FROM tmp_kuratierte_aliase;
  IF v_input <> ${aliases.length} THEN
    RAISE EXCEPTION 'kuratierte Aliase: % Zeilen, erwartet ${aliases.length}', v_input;
  END IF;

  WITH parsed AS (
    SELECT payload::jsonb->>'bls_code' AS bls_code,
           payload::jsonb->>'alias' AS alias
    FROM tmp_kuratierte_aliase
  )
  SELECT COUNT(*) INTO v_missing
  FROM parsed p
  LEFT JOIN nutrition.foods f ON f.bls_code = p.bls_code
  WHERE f.id IS NULL;
  IF v_missing <> 0 THEN
    RAISE EXCEPTION 'kuratierte Aliase: % Codes fehlen in nutrition.foods', v_missing;
  END IF;

  WITH parsed AS (
    SELECT f.id AS food_id,
           payload::jsonb->>'alias' AS alias
    FROM tmp_kuratierte_aliase t
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
    FROM tmp_kuratierte_aliase t
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
  RAISE NOTICE 'OK: % kuratierte Suchbegriffe, % bereits vorhanden, % eingefuegt', v_input, v_overlap, v_inserted;
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

const aliases = readAliases()
console.log(`${INPUT}: ${aliases.length} kuratierte Suchbegriff-Zuordnungen`)
runPsql(aliases)
