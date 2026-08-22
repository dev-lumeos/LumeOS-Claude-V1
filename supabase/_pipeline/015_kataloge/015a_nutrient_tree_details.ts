#!/usr/bin/env node
// C-161: Naehrstoffbaum und Detailtexte.
//
// parent_code ist die echte Eltern-Kind-Beziehung. display_tier bleibt
// eine Anzeigeprioritaet und darf daraus nicht mehr Hierarchie ableiten.
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'

const CONTAINER = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const DB = process.env.PGDATABASE ?? 'postgres'
const DETAILS_SOURCE = 'referenz/lumeos-2026/apps/app/modules/nutrition/data/nutrientDetails.ts'

type Detail = {
  key: string
  function_de?: string
  function_en?: string
  function_th?: string
  deficiency_de?: string
  deficiency_en?: string
  deficiency_th?: string
  rda_standard?: string
  rda_athlete?: string
  top_sources_de?: string[]
  top_sources_en?: string[]
  top_sources_th?: string[]
  tip_de?: string
  tip_en?: string
  tip_th?: string
  excess_de?: string
  excess_en?: string
  excess_th?: string
  detail_de?: string
  detail_en?: string
  detail_th?: string
  interactions_de?: string
  interactions_en?: string
  interactions_th?: string
  ul?: string
}

const PARENT: Record<string, string | null> = {
  ENERCJ: null,
  ENERCC: null,
  WATER: null,
  PROT625: null,
  NT: 'PROT625',
  AAE9: 'PROT625',
  ALA: 'PROT625',
  ARG: 'PROT625',
  ASP: 'PROT625',
  CYSTE: 'PROT625',
  GLU: 'PROT625',
  GLY: 'PROT625',
  PRO: 'PROT625',
  SER: 'PROT625',
  TYR: 'PROT625',
  HIS: 'AAE9',
  ILE: 'AAE9',
  LEU: 'AAE9',
  LYS: 'AAE9',
  MET: 'AAE9',
  PHE: 'AAE9',
  THR: 'AAE9',
  TRP: 'AAE9',
  VAL: 'AAE9',

  FAT: null,
  FASAT: 'FAT',
  FAMS: 'FAT',
  FAPU: 'FAT',
  FAX: 'FAT',
  'F4:0': 'FASAT',
  'F6:0': 'FASAT',
  'F8:0': 'FASAT',
  'F10:0': 'FASAT',
  'F12:0': 'FASAT',
  'F14:0': 'FASAT',
  'F15:0': 'FASAT',
  'F16:0': 'FASAT',
  'F17:0': 'FASAT',
  'F18:0': 'FASAT',
  'F20:0': 'FASAT',
  'F22:0': 'FASAT',
  'F24:0': 'FASAT',
  'F14:1CN5': 'FAMS',
  'F16:1CN7': 'FAMS',
  'F18:1CN7': 'FAMS',
  'F18:1CN9': 'FAMS',
  'F20:1CN9': 'FAMS',
  'F22:1CN9': 'FAMS',
  FAPUN3: 'FAPU',
  FAPUN6: 'FAPU',
  'F18:2C9T11': 'FAPU',
  'F18:3CN3': 'FAPUN3',
  'F18:4CN3': 'FAPUN3',
  'F20:5CN3': 'FAPUN3',
  'F22:5CN3': 'FAPUN3',
  'F22:6CN3': 'FAPUN3',
  'F18:2CN6': 'FAPUN6',
  'F20:2CN6': 'FAPUN6',
  'F18:3CN6': 'FAPUN6',
  'F20:3CN6': 'FAPUN6',
  'F20:4CN6': 'FAPUN6',

  CHO: null,
  SUGAR: 'CHO',
  STARCH: 'CHO',
  OLSAC: 'CHO',
  POLYL: 'CHO',
  MNSAC: 'SUGAR',
  DISAC: 'SUGAR',
  GLUS: 'MNSAC',
  FRUS: 'MNSAC',
  GALS: 'MNSAC',
  SUCS: 'DISAC',
  MALS: 'DISAC',
  LACS: 'DISAC',
  MANTL: 'POLYL',
  SORTL: 'POLYL',
  XYLTL: 'POLYL',

  FIBT: null,
  FIBHMW: 'FIBT',
  FIBLMW: 'FIBT',
  FIBINS: 'FIBT',
  FIBSOL: 'FIBT',
  FIBHMWS: 'FIBHMW',
  FIBHMWI: 'FIBHMW',

  ALC: null,
  OA: null,
  ACEAC: 'OA',
  CITAC: 'OA',
  LACAC: 'OA',
  MALAC: 'OA',
  TARAC: 'OA',
  ASH: null,

  VITA: null,
  VITAA: 'VITA',
  RETOL: 'VITA',
  CARTB: 'VITA',
  CAROTPAXB: 'VITA',
  VITD: null,
  CHOCAL: 'VITD',
  ERGCAL: 'VITD',
  VITE: null,
  TOCPHA: 'VITE',
  TOCPHB: 'VITE',
  TOCPHG: 'VITE',
  TOCPHD: 'VITE',
  TOCTRA: 'VITE',
  VITK: null,
  VITK1: 'VITK',
  VITK2: 'VITK',
  THIA: null,
  RIBF: null,
  NIAEQ: null,
  NIA: 'NIAEQ',
  PANTAC: null,
  VITB6: null,
  BIOT: null,
  FOL: null,
  FOLFD: 'FOL',
  FOLAC: 'FOL',
  VITB12: null,
  VITC: null,

  NACL: null,
  NA: null,
  CLD: null,
  K: null,
  CA: null,
  MG: null,
  P: null,
  S: null,
  FE: null,
  ZN: null,
  ID: null,
  CU: null,
  MN: null,
  FD: null,
  CR: null,
  MO: null,
  CHORL: null,
}

const LEGACY_KEY_MAP: Record<string, string> = {
  CHOL: 'CHORL',
  F: 'FD',
  F18D2N6: 'F18:2CN6',
  F20D5N3: 'F20:5CN3',
  F22D6N3: 'F22:6CN3',
  FIBTG: 'FIBT',
}

function fail(message: string): never {
  console.error(message)
  process.exit(1)
}

function psql(args: string[], input?: string): string {
  const result = spawnSync('docker', ['exec', ...(input ? ['-i'] : []), CONTAINER, 'psql', '-U', 'postgres', '-d', DB, ...args], {
    input,
    encoding: 'utf8',
    maxBuffer: 128 * 1024 * 1024,
  })
  if (result.status !== 0) fail(result.stderr || 'psql fehlgeschlagen')
  return result.stdout
}

function csvCell(value: string): string {
  return `"${value.replace(/"/g, '""')}"`
}

async function readDetails(): Promise<Record<string, Detail>> {
  if (!fs.existsSync(DETAILS_SOURCE)) fail(`${DETAILS_SOURCE} fehlt`)
  const mod = await import(`../../../${DETAILS_SOURCE}`)
  const details = mod.nutrientDetails ?? mod.default?.nutrientDetails
  if (!details || typeof details !== 'object') fail(`${DETAILS_SOURCE}: nutrientDetails nicht gefunden`)
  return details as Record<string, Detail>
}

function validateTree(defCodes: string[]): void {
  const defs = new Set(defCodes)
  const treeCodes = Object.keys(PARENT).sort()
  const missing = defCodes.filter(code => !(code in PARENT))
  const extra = treeCodes.filter(code => !defs.has(code))
  if (missing.length > 0) fail(`parent_code: Codes ohne Eintrag: ${missing.join(', ')}`)
  if (extra.length > 0) fail(`parent_code: unbekannte Codes im Baum: ${extra.join(', ')}`)

  for (const [code, parent] of Object.entries(PARENT)) {
    if (parent !== null && !defs.has(parent)) fail(`parent_code: ${code} zeigt auf unbekannten Parent ${parent}`)
    if (parent === code) fail(`parent_code: ${code} zeigt auf sich selbst`)
  }

  for (const code of defCodes) {
    const seen = new Set<string>()
    let cursor: string | null = code
    while (cursor !== null) {
      if (seen.has(cursor)) fail(`parent_code: Zyklus bei ${code}`)
      seen.add(cursor)
      cursor = PARENT[cursor] ?? null
    }
  }

  const aae9Children = Object.entries(PARENT)
    .filter(([, parent]) => parent === 'AAE9')
    .map(([code]) => code)
    .sort()
  const expectedEaa = ['HIS', 'ILE', 'LEU', 'LYS', 'MET', 'PHE', 'THR', 'TRP', 'VAL']
  if (aae9Children.join(',') !== expectedEaa.join(',')) {
    fail(`AAE9-Kinder: ${aae9Children.join(', ')} statt ${expectedEaa.join(', ')}`)
  }
}

function buildSql(details: Record<string, Detail>, defCodes: string[]): string {
  const defs = new Set(defCodes)
  const detailRows: Array<{ sourceKey: string; nutrientCode: string; detail: Detail }> = []
  const seenTargets = new Set<string>()
  for (const [sourceKey, detail] of Object.entries(details)) {
    if (defs.has(sourceKey)) {
      detailRows.push({ sourceKey, nutrientCode: sourceKey, detail })
      seenTargets.add(sourceKey)
    }
  }
  for (const [sourceKey, detail] of Object.entries(details)) {
    const nutrientCode = LEGACY_KEY_MAP[sourceKey]
    if (!nutrientCode || !defs.has(nutrientCode) || seenTargets.has(nutrientCode)) continue
    detailRows.push({ sourceKey, nutrientCode, detail })
    seenTargets.add(nutrientCode)
  }

  const treePayload = defCodes
    .map(code => csvCell(JSON.stringify({ code, parent_code: PARENT[code] })))
    .join('\n')
  const detailPayload = detailRows
    .map(row => csvCell(JSON.stringify({
      nutrient_code: row.nutrientCode,
      source_key: row.sourceKey,
      ...row.detail,
    })))
    .join('\n')

  return `\\set ON_ERROR_STOP on
BEGIN;

ALTER TABLE nutrition.nutrient_defs
  ADD COLUMN IF NOT EXISTS parent_code TEXT;

ALTER TABLE nutrition.nutrient_defs
  DROP CONSTRAINT IF EXISTS nutrient_defs_parent_code_fkey;

ALTER TABLE nutrition.nutrient_defs
  ADD CONSTRAINT nutrient_defs_parent_code_fkey
  FOREIGN KEY (parent_code) REFERENCES nutrition.nutrient_defs(code);

COMMENT ON COLUMN nutrition.nutrient_defs.parent_code IS
  'C-161: Echte Eltern-Kind-Beziehung fuer die Naehrstoffanzeige. NULL bedeutet Wurzel; display_tier bleibt nur Anzeigeprioritaet.';

CREATE TEMP TABLE nutrient_tree_import (payload JSONB NOT NULL) ON COMMIT DROP;
COPY nutrient_tree_import(payload) FROM STDIN WITH (FORMAT csv);
${treePayload}
\\.

WITH rows AS (
  SELECT
    payload->>'code' AS code,
    NULLIF(payload->>'parent_code', '') AS parent_code
  FROM nutrient_tree_import
)
UPDATE nutrition.nutrient_defs nd
SET parent_code = rows.parent_code
FROM rows
WHERE nd.code = rows.code;

CREATE TABLE IF NOT EXISTS nutrition.nutrient_details (
  nutrient_code        TEXT PRIMARY KEY REFERENCES nutrition.nutrient_defs(code) ON DELETE CASCADE,
  source_key           TEXT NOT NULL,
  function_de          TEXT,
  function_en          TEXT,
  function_th          TEXT,
  deficiency_de        TEXT,
  deficiency_en        TEXT,
  deficiency_th        TEXT,
  excess_de            TEXT,
  excess_en            TEXT,
  excess_th            TEXT,
  detail_de            TEXT,
  detail_en            TEXT,
  detail_th            TEXT,
  interactions_de      TEXT,
  interactions_en      TEXT,
  interactions_th      TEXT,
  tip_de               TEXT,
  tip_en               TEXT,
  tip_th               TEXT,
  top_sources_de       TEXT[] NOT NULL DEFAULT '{}',
  top_sources_en       TEXT[] NOT NULL DEFAULT '{}',
  top_sources_th       TEXT[] NOT NULL DEFAULT '{}',
  rda_standard_text    TEXT,
  rda_athlete_text     TEXT,
  upper_limit_text     TEXT,
  source               TEXT NOT NULL,
  source_path          TEXT NOT NULL,
  raw                  JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE nutrition.nutrient_details IS
  'C-161: Dreisprachige Erklaerungen aus dem Vorgaengerrepo. Quelle, Rohwert und source_key bleiben erhalten; keine Bewertung und keine Diagnose.';
COMMENT ON COLUMN nutrition.nutrient_details.rda_standard_text IS
  'Text aus dem Vorgaengerrepo, nicht numerisch normalisiert. Abgleich mit nutrient_reference_values erfolgt separat.';
COMMENT ON COLUMN nutrition.nutrient_details.rda_athlete_text IS
  'Athleten-Hinweis aus dem Vorgaengerrepo, nicht als Zielwert interpretiert.';

CREATE INDEX IF NOT EXISTS nutrient_details_source_key_idx
  ON nutrition.nutrient_details(source_key);

ALTER TABLE nutrition.nutrient_details ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS nutrient_details_select ON nutrition.nutrient_details;
CREATE POLICY nutrient_details_select
  ON nutrition.nutrient_details
  FOR SELECT
  TO authenticated
  USING (true);

GRANT SELECT ON nutrition.nutrient_details TO authenticated;
GRANT ALL ON nutrition.nutrient_details TO service_role;

TRUNCATE nutrition.nutrient_details;
CREATE TEMP TABLE nutrient_details_import (payload JSONB NOT NULL) ON COMMIT DROP;
COPY nutrient_details_import(payload) FROM STDIN WITH (FORMAT csv);
${detailPayload}
\\.

INSERT INTO nutrition.nutrient_details (
  nutrient_code, source_key,
  function_de, function_en, function_th,
  deficiency_de, deficiency_en, deficiency_th,
  excess_de, excess_en, excess_th,
  detail_de, detail_en, detail_th,
  interactions_de, interactions_en, interactions_th,
  tip_de, tip_en, tip_th,
  top_sources_de, top_sources_en, top_sources_th,
  rda_standard_text, rda_athlete_text, upper_limit_text,
  source, source_path, raw
)
SELECT
  payload->>'nutrient_code',
  payload->>'source_key',
  payload->>'function_de',
  payload->>'function_en',
  payload->>'function_th',
  payload->>'deficiency_de',
  payload->>'deficiency_en',
  payload->>'deficiency_th',
  payload->>'excess_de',
  payload->>'excess_en',
  payload->>'excess_th',
  payload->>'detail_de',
  payload->>'detail_en',
  payload->>'detail_th',
  payload->>'interactions_de',
  payload->>'interactions_en',
  payload->>'interactions_th',
  payload->>'tip_de',
  payload->>'tip_en',
  payload->>'tip_th',
  COALESCE(ARRAY(SELECT jsonb_array_elements_text(payload->'top_sources_de')), '{}'),
  COALESCE(ARRAY(SELECT jsonb_array_elements_text(payload->'top_sources_en')), '{}'),
  COALESCE(ARRAY(SELECT jsonb_array_elements_text(payload->'top_sources_th')), '{}'),
  payload->>'rda_standard',
  payload->>'rda_athlete',
  payload->>'ul',
  'Vorgaengerrepo nutrientDetails.ts',
  '${DETAILS_SOURCE}',
  payload
FROM nutrient_details_import
ORDER BY payload->>'nutrient_code';

DO $$
DECLARE
  v_total INTEGER;
  v_roots INTEGER;
  v_children INTEGER;
  v_details INTEGER;
BEGIN
  SELECT count(*) INTO v_total FROM nutrition.nutrient_defs;
  IF v_total <> 138 THEN
    RAISE EXCEPTION 'nutrient_defs: %, erwartet 138', v_total;
  END IF;

  SELECT count(*) FILTER (WHERE parent_code IS NULL),
         count(*) FILTER (WHERE parent_code IS NOT NULL)
    INTO v_roots, v_children
  FROM nutrition.nutrient_defs;
  IF v_roots <> 40 OR v_children <> 98 THEN
    RAISE EXCEPTION 'nutrient_defs parent_code: % Wurzeln/% Kinder, erwartet 40/98', v_roots, v_children;
  END IF;

  SELECT count(*) INTO v_details FROM nutrition.nutrient_details;
  IF v_details <> ${detailRows.length} THEN
    RAISE EXCEPTION 'nutrient_details: %, erwartet ${detailRows.length}', v_details;
  END IF;
END $$;

COMMIT;
`
}

async function main(): Promise<void> {
  const defCodes = psql(['-t', '-A', '-c', 'SELECT code FROM nutrition.nutrient_defs ORDER BY code;'])
    .split('\n').map(line => line.trim()).filter(Boolean)
  validateTree(defCodes)

  const details = await readDetails()
  const detailKeys = Object.keys(details).sort()
  const exact = detailKeys.filter(key => defCodes.includes(key))
  const mapped = detailKeys.filter(key => LEGACY_KEY_MAP[key] && defCodes.includes(LEGACY_KEY_MAP[key]))
  const mappedShadowed = mapped.filter(key => exact.includes(LEGACY_KEY_MAP[key]))
  const unmatched = detailKeys.filter(key => !defCodes.includes(key) && !LEGACY_KEY_MAP[key])
  console.log(
    `nutrientDetails: ${detailKeys.length} Schluessel, ${exact.length} exakt, ` +
    `${mapped.length} ueber Legacy-Map (${mappedShadowed.length} durch exakte Zielcodes ersetzt), ` +
    `${unmatched.length} ohne Zielcode`
  )
  if (unmatched.join(',') !== 'SE') fail(`Unerwartete nutrientDetails-Schluessel ohne Zielcode: ${unmatched.join(', ')}`)

  const sql = buildSql(details, defCodes)
  psql(['-v', 'ON_ERROR_STOP=1', '-f', '-'], sql)
  console.log('C-161: parent_code und nutrient_details eingespielt')
}

main().catch(error => fail(error instanceof Error ? error.message : String(error)))
