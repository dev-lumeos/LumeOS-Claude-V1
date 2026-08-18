#!/usr/bin/env node
// C-72: curated biomarker aliases for lab-report marker matching.
//
// This imports predecessor synonyms as medical.biomarker_aliases. It does not
// parse PDFs or run OCR; it only prepares the name -> LOINC mapping layer.
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'

const CONTAINER = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const DB = process.env.PGDATABASE ?? 'postgres'
const INPUT = 'supabase/_pipeline/daten/biomarker-aliases.json'

type AliasRow = {
  alias: string
  alias_folded: string
  locale: 'de' | 'en' | 'th' | 'und'
  target_loinc_code: string
  target_canonical_name: string
  source: 'predecessor_synonym' | 'curated_ambiguous'
  confidence: number
  already_in_loinc_catalog?: boolean
  match_policy?: 'exact' | 'ambiguous'
  reason?: string
}

type AliasData = {
  coverage: {
    legacy_text_pairs: number
    active_pairs: number
    active_thai_pairs: number
    importable_aliases: number
    imported_alias_rows: number
    ambiguous_alias_rows: number
    not_imported_aliases: number
    already_in_loinc_catalog: number
    missing_from_loinc_catalog: number
  }
  aliases: AliasRow[]
  ambiguous_aliases: AliasRow[]
}

function fail(message: string): never {
  console.error(message)
  process.exit(1)
}

function csvCell(value: string): string {
  return `"${value.replace(/"/g, '""')}"`
}

function readAliases(): { data: AliasData; aliases: AliasRow[] } {
  const data = JSON.parse(fs.readFileSync(INPUT, 'utf8')) as AliasData
  if (!Array.isArray(data.aliases)) fail(`${INPUT}: aliases fehlt`)
  if (!Array.isArray(data.ambiguous_aliases)) fail(`${INPUT}: ambiguous_aliases fehlt`)
  if (!data.coverage) fail(`${INPUT}: coverage fehlt`)

  const aliases = [
    ...data.aliases.map(row => ({ ...row, match_policy: row.match_policy ?? 'exact' as const })),
    ...data.ambiguous_aliases.map(row => ({ ...row, match_policy: 'ambiguous' as const })),
  ]

  if (data.coverage.legacy_text_pairs !== 457) {
    fail(`${INPUT}: legacy_text_pairs ${data.coverage.legacy_text_pairs}, erwartet 457`)
  }
  if (data.coverage.active_pairs !== 454) {
    fail(`${INPUT}: active_pairs ${data.coverage.active_pairs}, erwartet 454`)
  }
  if (data.coverage.importable_aliases !== data.aliases.length) {
    fail(`${INPUT}: coverage.importable_aliases passt nicht zu aliases.length`)
  }
  if (data.coverage.imported_alias_rows !== aliases.length) {
    fail(`${INPUT}: coverage.imported_alias_rows passt nicht zu Alias-Zeilen`)
  }
  if (data.coverage.ambiguous_alias_rows !== data.ambiguous_aliases.length) {
    fail(`${INPUT}: coverage.ambiguous_alias_rows passt nicht zu ambiguous_aliases.length`)
  }

  for (const [index, row] of aliases.entries()) {
    if (!row.alias?.trim()) fail(`${INPUT}: Alias ${index} ohne alias`)
    if (!row.alias_folded?.trim()) fail(`${INPUT}: Alias ${index} ohne alias_folded`)
    if (!row.target_loinc_code?.trim()) fail(`${INPUT}: Alias ${index} ohne target_loinc_code`)
    if (!['de', 'en', 'th', 'und'].includes(row.locale)) fail(`${INPUT}: Alias ${index} mit ungueltiger locale`)
    if (!['predecessor_synonym', 'curated_ambiguous'].includes(row.source)) {
      fail(`${INPUT}: Alias ${index} mit ungueltiger source`)
    }
    if (!['exact', 'ambiguous'].includes(row.match_policy ?? 'exact')) {
      fail(`${INPUT}: Alias ${index} mit ungueltiger match_policy`)
    }
  }

  return { data, aliases }
}

function runPsql(aliases: AliasRow[]): void {
  const payload = aliases.map(row => csvCell(JSON.stringify(row))).join('\n')
  const sql = `\\set ON_ERROR_STOP on
BEGIN;

CREATE TEMP TABLE tmp_biomarker_aliases (
  payload text NOT NULL
) ON COMMIT DROP;

COPY tmp_biomarker_aliases (payload) FROM STDIN WITH (FORMAT csv);
${payload}
\\.

DO $$
DECLARE
  v_input int;
  v_missing int;
  v_inserted int;
BEGIN
  SELECT COUNT(*) INTO v_input FROM tmp_biomarker_aliases;
  IF v_input <> ${aliases.length} THEN
    RAISE EXCEPTION 'biomarker_aliases: % Zeilen, erwartet ${aliases.length}', v_input;
  END IF;

  WITH parsed AS (
    SELECT payload::jsonb->>'target_loinc_code' AS loinc_code
    FROM tmp_biomarker_aliases
  )
  SELECT COUNT(*) INTO v_missing
  FROM parsed p
  LEFT JOIN medical.biomarker_catalog c ON c.loinc_code = p.loinc_code
  WHERE c.loinc_code IS NULL;

  IF v_missing <> 0 THEN
    RAISE EXCEPTION 'biomarker_aliases: % LOINC-Ziele fehlen im Katalog', v_missing;
  END IF;

  DELETE FROM medical.biomarker_aliases
  WHERE source IN ('predecessor_synonym', 'curated_ambiguous');

  WITH parsed AS (
    SELECT
      payload::jsonb->>'alias' AS alias,
      payload::jsonb->>'alias_folded' AS alias_folded,
      payload::jsonb->>'locale' AS locale,
      payload::jsonb->>'target_loinc_code' AS loinc_code,
      payload::jsonb->>'target_canonical_name' AS canonical_name,
      payload::jsonb->>'source' AS source,
      COALESCE(payload::jsonb->>'match_policy', 'exact') AS match_policy,
      COALESCE((payload::jsonb->>'confidence')::numeric, 0.95) AS confidence,
      COALESCE((payload::jsonb->>'already_in_loinc_catalog')::boolean, false) AS already_in_loinc,
      payload::jsonb->>'reason' AS notes
    FROM tmp_biomarker_aliases
  )
  INSERT INTO medical.biomarker_aliases (
    alias,
    alias_folded,
    locale,
    loinc_code,
    canonical_name,
    source,
    match_policy,
    confidence,
    already_in_loinc,
    notes
  )
  SELECT
    alias,
    alias_folded,
    locale,
    loinc_code,
    canonical_name,
    source,
    match_policy,
    confidence,
    already_in_loinc,
    notes
  FROM parsed
  ON CONFLICT (alias_folded, loinc_code, source, match_policy) DO UPDATE
  SET alias = EXCLUDED.alias,
      locale = EXCLUDED.locale,
      canonical_name = EXCLUDED.canonical_name,
      confidence = EXCLUDED.confidence,
      already_in_loinc = EXCLUDED.already_in_loinc,
      notes = EXCLUDED.notes,
      imported_at = now();

  GET DIAGNOSTICS v_inserted = ROW_COUNT;
  RAISE NOTICE 'OK: % Biomarker-Aliaszeilen importiert/aktualisiert', v_inserted;
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

const { data, aliases } = readAliases()
console.log(
  `${INPUT}: ${data.coverage.active_pairs} aktive Legacy-Paare, ` +
  `${data.coverage.importable_aliases} eindeutige Aliaszeilen, ` +
  `${data.coverage.ambiguous_alias_rows} Mehrdeutigkeitszeilen, ` +
  `${data.coverage.not_imported_aliases} nicht importiert.`,
)
console.log(
  `LOINC-Deckung: ${data.coverage.already_in_loinc_catalog} bereits im Katalog, ` +
  `${data.coverage.missing_from_loinc_catalog} durch Legacy-Kuration zusaetzlich.`,
)
runPsql(aliases)
