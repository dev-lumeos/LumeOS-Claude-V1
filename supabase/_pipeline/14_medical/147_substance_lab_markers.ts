#!/usr/bin/env node
// C-162: Kimi lab_effects als abfragbare Bruecke
// Substanz -> Lab-Marker -> LOINC -> Referenzbereich.
//
// Kimi hat die Marker bewusst als repo-only gekennzeichnet. Dieser Schritt
// validiert die LOINC-Codes gegen medical.biomarker_catalog und raet nicht:
// nicht eindeutige Marker bleiben ohne LOINC sichtbar.
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const CONTAINER = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const DB = process.env.PGDATABASE ?? 'postgres'
const KIMI_BASE = 'backup/kimi-research/Kimi_Agent/supplement_performance_database/data'
const MARKERS_FILE = path.join(KIMI_BASE, 'platform', 'lab_markers.json')
const SUBSTANCE_FILES = [
  path.join(KIMI_BASE, 'substances', 'supplements.jsonl'),
  path.join(KIMI_BASE, 'substances', 'peptides.jsonl'),
  path.join(KIMI_BASE, 'substances', 'performance_compounds.jsonl'),
]

const EXPECTED_MARKERS = 66
const EXPECTED_KIMI_CANDIDATE_MARKERS = 46
const EXPECTED_REPO_RESOLVED_WITHOUT_CANDIDATE = 18
const EXPECTED_UNRESOLVED_MARKERS = 2
const EXPECTED_SUBSTANCES_WITH_EFFECTS = 90
const EXPECTED_EFFECT_ENTRIES = 156
const EXPECTED_EFFECT_ROWS = 222
const EXPECTED_MARKER_LINK_ROWS = 203
const EXPECTED_NO_MARKER_ROWS = 19

type JsonObject = Record<string, unknown>
type KimiMarker = {
  id: string
  analyte: string
  category: string
  loinc_candidates?: string[]
  needs_repo_validation?: boolean
  aliases?: string[]
}
type KimiSubstance = {
  id: string
  canonical_name: string
  lab_effects?: LabEffect[]
}
type LabEffect = {
  analyte?: string
  direction?: string
  direction_enum?: string
  mechanism?: string
  clinical_consequence?: string
  evidence?: string
  effect_type?: string
  lab_marker_ids?: string[]
  monitoring_link?: string
  source?: string
}
type MarkerRow = {
  marker_id: string
  analyte: string
  category: string
  loinc_code: string | null
  loinc_candidates: string[]
  aliases: string[]
  needs_repo_validation: boolean
  validation_status: string
  resolution_source: string
  unresolved_reason: string | null
  raw: JsonObject
}
type EffectRow = {
  id: string
  substance_id: string
  substance_name: string
  effect_index: number
  marker_index: number
  lab_marker_id: string | null
  loinc_code: string | null
  effect_type: string
  direction: string | null
  direction_enum: string | null
  mechanism: string | null
  clinical_consequence: string | null
  evidence: string | null
  monitoring_link: string | null
  source: string | null
  mapping_status: string
  raw: JsonObject
}

// Nur eindeutige Treffer fuer Marker, bei denen Kimi keinen Kandidaten gesetzt
// hat. Konzepte mit mehreren Messwerten (hCG, Blood pressure) bleiben offen.
const REPO_ONLY_LOINC: Record<string, { loinc: string; reason: string }> = {
  lab_egfr: {
    loinc: '62238-1',
    reason: 'repo_existing_c84_egfr_creatinine_based_ckd_epi',
  },
  lab_igf1: {
    loinc: '2484-4',
    reason: 'repo_search_exact_igf1_serum_plasma',
  },
  lab_tsat: {
    loinc: '2502-3',
    reason: 'repo_search_exact_iron_saturation_mass_fraction',
  },
  lab_magnesium: {
    loinc: '2601-3',
    reason: 'repo_existing_c140_magnesium_serum_plasma_moles',
  },
  lab_zinc: {
    loinc: '5763-8',
    reason: 'repo_search_exact_zinc_serum_plasma',
  },
  lab_copper: {
    loinc: '5631-7',
    reason: 'repo_search_exact_copper_serum_plasma',
  },
  lab_selenium: {
    loinc: '5724-0',
    reason: 'repo_search_exact_selenium_serum_plasma',
  },
  lab_folate: {
    loinc: '2284-8',
    reason: 'repo_search_exact_folate_serum_plasma',
  },
  lab_dheas: {
    loinc: '2191-5',
    reason: 'repo_search_exact_dhea_s_serum_plasma',
  },
  lab_plp_b6: {
    loinc: '62236-5',
    reason: 'repo_search_exact_pyridoxal_phosphate_serum_plasma',
  },
  lab_digoxin_level: {
    loinc: '10535-3',
    reason: 'repo_search_exact_digoxin_serum_plasma',
  },
  lab_retinol: {
    loinc: '2923-1',
    reason: 'repo_search_exact_retinol_serum_plasma',
  },
  lab_calcitonin: {
    loinc: '1992-7',
    reason: 'repo_search_exact_calcitonin_serum_plasma',
  },
  lab_heart_rate: {
    loinc: '8867-4',
    reason: 'repo_search_exact_heart_rate',
  },
  lab_fobt: {
    loinc: '50196-5',
    reason: 'repo_search_exact_occult_blood_stool_panel',
  },
  lab_urinary_oxalate: {
    loinc: '2701-1',
    reason: 'repo_search_exact_oxalate_24h_urine',
  },
  lab_urinary_iodine: {
    loinc: '2495-0',
    reason: 'repo_search_exact_iodine_urine',
  },
  lab_bleeding_time: {
    loinc: '11067-6',
    reason: 'repo_search_exact_bleeding_time',
  },
}

const UNRESOLVED_REASONS: Record<string, string> = {
  lab_hcg: 'kein eindeutiger Einzeltest: qualitativ/quantitativ, Urin/Serum und Beta/gesamt moeglich',
  lab_blood_pressure: 'Sammelmarker: LOINC trennt systolisch und diastolisch',
}

function fail(message: string): never {
  console.error(message)
  process.exit(1)
}

function readJson(file: string): JsonObject {
  if (!fs.existsSync(file)) fail(`${file} fehlt. C-162 braucht crawl_024.`)
  return JSON.parse(fs.readFileSync(file, 'utf8')) as JsonObject
}

function readJsonl(file: string): JsonObject[] {
  if (!fs.existsSync(file)) fail(`${file} fehlt. C-162 braucht Kimi-Substanzen.`)
  return fs.readFileSync(file, 'utf8')
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line, index) => {
      try {
        return JSON.parse(line) as JsonObject
      } catch (error) {
        fail(`${file}:${index + 1}: JSON ungueltig (${String(error)})`)
      }
    })
}

function csvCell(value: string): string {
  return `"${value.replace(/"/g, '""')}"`
}

function textArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map(String).filter(Boolean) : []
}

function objectValue(value: unknown): JsonObject {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as JsonObject : {}
}

function normalizeEffectType(value: unknown): string {
  const text = String(value ?? 'physiological_lab_effect')
  if (['physiological_lab_effect', 'monitoring_requirement', 'assay_interference'].includes(text)) return text
  fail(`Unbekannter effect_type: ${text}`)
}

function normalizeDirection(value: unknown): string | null {
  const text = value === undefined || value === null || value === '' ? null : String(value)
  if (text === null) return null
  if ([
    'increase', 'decrease', 'monitor', 'false_low', 'false_high',
    'interference_unspecified', 'unaffected',
  ].includes(text)) return text
  fail(`Unbekannter direction_enum: ${text}`)
}

function loadMarkers(): KimiMarker[] {
  const data = readJson(MARKERS_FILE)
  const markers = objectValue(data.markers)
  const rows = Object.entries(markers).map(([id, value]) => ({
    id,
    ...objectValue(value),
  })) as KimiMarker[]

  if (rows.length !== EXPECTED_MARKERS) fail(`lab_markers: ${rows.length}, erwartet ${EXPECTED_MARKERS}`)
  const withCandidates = rows.filter(row => textArray(row.loinc_candidates).length > 0).length
  if (withCandidates !== EXPECTED_KIMI_CANDIDATE_MARKERS) {
    fail(`lab_markers mit Kimi-Kandidat: ${withCandidates}, erwartet ${EXPECTED_KIMI_CANDIDATE_MARKERS}`)
  }
  const needsValidation = rows.filter(row => row.needs_repo_validation === true).length
  if (needsValidation !== EXPECTED_MARKERS) {
    fail(`lab_markers needs_repo_validation: ${needsValidation}, erwartet ${EXPECTED_MARKERS}`)
  }
  return rows.sort((a, b) => a.id.localeCompare(b.id))
}

function loadSubstances(): KimiSubstance[] {
  const rows = SUBSTANCE_FILES.flatMap(file => readJsonl(file)) as KimiSubstance[]
  if (rows.length !== 291) fail(`Kimi-Substanzen: ${rows.length}, erwartet 291`)
  return rows.sort((a, b) => a.id.localeCompare(b.id))
}

function runPsqlJson(sql: string): unknown[] {
  const result = spawnSync(
    'docker',
    ['exec', '-i', CONTAINER, 'psql', '-U', 'postgres', '-d', DB, '-t', '-A', '-c', sql],
    { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 },
  )
  if (result.stderr) process.stderr.write(result.stderr)
  if (result.status !== 0) process.exit(result.status ?? 1)
  return JSON.parse(result.stdout.trim() || '[]') as unknown[]
}

function assertCatalogCodes(codes: string[]): void {
  const unique = [...new Set(codes)].sort()
  const quoted = unique.map(code => `'${code.replace(/'/g, "''")}'`).join(',')
  const found = runPsqlJson(
    `SELECT COALESCE(jsonb_agg(loinc_code ORDER BY loinc_code), '[]'::jsonb)::text ` +
    `FROM medical.biomarker_catalog WHERE loinc_code IN (${quoted});`,
  ) as string[]
  const missing = unique.filter(code => !found.includes(code))
  if (missing.length) fail(`LOINC-Codes nicht im medical.biomarker_catalog: ${missing.join(', ')}`)
}

function buildMarkerRows(markers: KimiMarker[]): MarkerRow[] {
  const rows = markers.map(marker => {
    const candidates = textArray(marker.loinc_candidates)
    const repo = REPO_ONLY_LOINC[marker.id]
    const loinc = candidates[0] ?? repo?.loinc ?? null
    const validationStatus = candidates.length > 0
      ? 'kimi_candidate_validated'
      : repo
        ? 'repo_resolved_without_kimi_candidate'
        : 'unresolved_no_unique_loinc'

    return {
      marker_id: marker.id,
      analyte: String(marker.analyte ?? marker.id),
      category: String(marker.category ?? 'unknown'),
      loinc_code: loinc,
      loinc_candidates: candidates,
      aliases: textArray(marker.aliases),
      needs_repo_validation: marker.needs_repo_validation === true,
      validation_status: validationStatus,
      resolution_source: candidates.length > 0 ? 'kimi_loinc_candidates_validated_against_repo' : (repo?.reason ?? 'not_resolved'),
      unresolved_reason: loinc ? null : (UNRESOLVED_REASONS[marker.id] ?? 'kein eindeutiger LOINC-Code im Repo'),
      raw: marker as unknown as JsonObject,
    }
  })

  const resolvedWithoutCandidates = rows.filter(row => row.validation_status === 'repo_resolved_without_kimi_candidate').length
  const unresolved = rows.filter(row => row.validation_status === 'unresolved_no_unique_loinc').length
  if (resolvedWithoutCandidates !== EXPECTED_REPO_RESOLVED_WITHOUT_CANDIDATE) {
    fail(`Repo-only Markeraufloesungen: ${resolvedWithoutCandidates}, erwartet ${EXPECTED_REPO_RESOLVED_WITHOUT_CANDIDATE}`)
  }
  if (unresolved !== EXPECTED_UNRESOLVED_MARKERS) {
    fail(`Ungelesene Marker: ${unresolved}, erwartet ${EXPECTED_UNRESOLVED_MARKERS}`)
  }

  assertCatalogCodes(rows.map(row => row.loinc_code).filter(Boolean) as string[])
  return rows
}

function buildEffectRows(substances: KimiSubstance[], markerRows: MarkerRow[]): EffectRow[] {
  const markerById = new Map(markerRows.map(marker => [marker.marker_id, marker]))
  const out: EffectRow[] = []
  let effectEntries = 0
  const substancesWithEffects = substances.filter(substance => (substance.lab_effects ?? []).length > 0).length

  for (const substance of substances) {
    for (const [effectIndex, effect] of (substance.lab_effects ?? []).entries()) {
      effectEntries++
      const markerIds = textArray(effect.lab_marker_ids)
      const rowMarkerIds = markerIds.length > 0 ? markerIds : [null]
      for (const [markerIndex, markerId] of rowMarkerIds.entries()) {
        const marker = markerId ? markerById.get(markerId) : null
        if (markerId && !marker) fail(`${substance.id}: unbekannte lab_marker_id ${markerId}`)
        const mappingStatus = !markerId
          ? 'effect_without_marker_id'
          : marker?.loinc_code
            ? 'loinc_validated'
            : 'marker_without_loinc'

        out.push({
          id: `${substance.id}:${effectIndex}:${markerId ?? 'no_marker'}:${markerIndex}`,
          substance_id: substance.id,
          substance_name: substance.canonical_name,
          effect_index: effectIndex,
          marker_index: markerIndex,
          lab_marker_id: markerId,
          loinc_code: marker?.loinc_code ?? null,
          effect_type: normalizeEffectType(effect.effect_type),
          direction: effect.direction === undefined || effect.direction === null ? null : String(effect.direction),
          direction_enum: normalizeDirection(effect.direction_enum),
          mechanism: effect.mechanism === undefined || effect.mechanism === null ? null : String(effect.mechanism),
          clinical_consequence: effect.clinical_consequence === undefined || effect.clinical_consequence === null ? null : String(effect.clinical_consequence),
          evidence: effect.evidence === undefined || effect.evidence === null ? null : String(effect.evidence),
          monitoring_link: effect.monitoring_link === undefined || effect.monitoring_link === null ? null : String(effect.monitoring_link),
          source: effect.source === undefined || effect.source === null ? null : String(effect.source),
          mapping_status: mappingStatus,
          raw: effect as unknown as JsonObject,
        })
      }
    }
  }

  if (substancesWithEffects !== EXPECTED_SUBSTANCES_WITH_EFFECTS) {
    fail(`Substanzen mit lab_effects: ${substancesWithEffects}, erwartet ${EXPECTED_SUBSTANCES_WITH_EFFECTS}`)
  }
  if (effectEntries !== EXPECTED_EFFECT_ENTRIES) {
    fail(`lab_effects Eintraege: ${effectEntries}, erwartet ${EXPECTED_EFFECT_ENTRIES}`)
  }
  if (out.length !== EXPECTED_EFFECT_ROWS) {
    fail(`substance_lab_effects Zeilen: ${out.length}, erwartet ${EXPECTED_EFFECT_ROWS}`)
  }
  const markerLinks = out.filter(row => row.lab_marker_id !== null).length
  const noMarker = out.filter(row => row.lab_marker_id === null).length
  if (markerLinks !== EXPECTED_MARKER_LINK_ROWS) {
    fail(`Substanz-Marker-Verbindungen: ${markerLinks}, erwartet ${EXPECTED_MARKER_LINK_ROWS}`)
  }
  if (noMarker !== EXPECTED_NO_MARKER_ROWS) {
    fail(`Effekte ohne Marker-ID: ${noMarker}, erwartet ${EXPECTED_NO_MARKER_ROWS}`)
  }

  return out
}

function runPsql(markerRows: MarkerRow[], effectRows: EffectRow[]): void {
  const markerPayload = markerRows.map(row => csvCell(JSON.stringify(row))).join('\n')
  const effectPayload = effectRows.map(row => csvCell(JSON.stringify(row))).join('\n')

  const sql = `\\set ON_ERROR_STOP on
BEGIN;

CREATE TABLE IF NOT EXISTS medical.lab_marker_catalog (
  marker_id              TEXT PRIMARY KEY,
  analyte                TEXT NOT NULL,
  category               TEXT NOT NULL,
  loinc_code             TEXT REFERENCES medical.biomarker_catalog(loinc_code) ON DELETE RESTRICT,
  loinc_candidates       TEXT[] NOT NULL DEFAULT '{}',
  aliases                TEXT[] NOT NULL DEFAULT '{}',
  needs_repo_validation  BOOLEAN NOT NULL DEFAULT true,
  validation_status      TEXT NOT NULL CHECK (validation_status IN (
                           'kimi_candidate_validated',
                           'repo_resolved_without_kimi_candidate',
                           'unresolved_no_unique_loinc'
                         )),
  resolution_source      TEXT NOT NULL,
  unresolved_reason      TEXT,
  source_file            TEXT NOT NULL DEFAULT '${MARKERS_FILE.replace(/'/g, "''")}',
  raw                    JSONB NOT NULL DEFAULT '{}'::jsonb,
  imported_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (jsonb_typeof(raw) = 'object'),
  CHECK (
    (validation_status = 'unresolved_no_unique_loinc' AND loinc_code IS NULL AND unresolved_reason IS NOT NULL)
    OR (validation_status <> 'unresolved_no_unique_loinc' AND loinc_code IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS lab_marker_catalog_loinc_idx
  ON medical.lab_marker_catalog(loinc_code)
  WHERE loinc_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS lab_marker_catalog_category_idx
  ON medical.lab_marker_catalog(category);

CREATE TABLE IF NOT EXISTS supplements.substance_lab_effects (
  id                    TEXT PRIMARY KEY,
  substance_id          TEXT NOT NULL REFERENCES supplements.substance_catalog(id) ON DELETE CASCADE,
  substance_name        TEXT NOT NULL,
  effect_index          INTEGER NOT NULL CHECK (effect_index >= 0),
  marker_index          INTEGER NOT NULL CHECK (marker_index >= 0),
  lab_marker_id         TEXT REFERENCES medical.lab_marker_catalog(marker_id) ON DELETE RESTRICT,
  loinc_code            TEXT REFERENCES medical.biomarker_catalog(loinc_code) ON DELETE RESTRICT,
  effect_type           TEXT NOT NULL CHECK (effect_type IN (
                          'physiological_lab_effect',
                          'monitoring_requirement',
                          'assay_interference'
                        )),
  direction             TEXT,
  direction_enum        TEXT CHECK (direction_enum IN (
                          'increase',
                          'decrease',
                          'monitor',
                          'false_low',
                          'false_high',
                          'interference_unspecified',
                          'unaffected'
                        )),
  mechanism             TEXT,
  clinical_consequence  TEXT,
  evidence              TEXT,
  monitoring_link       TEXT,
  source                TEXT,
  mapping_status        TEXT NOT NULL CHECK (mapping_status IN (
                          'loinc_validated',
                          'marker_without_loinc',
                          'effect_without_marker_id'
                        )),
  raw                   JSONB NOT NULL DEFAULT '{}'::jsonb,
  imported_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (substance_id, effect_index, marker_index, lab_marker_id),
  CHECK (jsonb_typeof(raw) = 'object'),
  CHECK (
    (mapping_status = 'loinc_validated' AND lab_marker_id IS NOT NULL AND loinc_code IS NOT NULL)
    OR (mapping_status = 'marker_without_loinc' AND lab_marker_id IS NOT NULL AND loinc_code IS NULL)
    OR (mapping_status = 'effect_without_marker_id' AND lab_marker_id IS NULL AND loinc_code IS NULL)
  )
);

CREATE INDEX IF NOT EXISTS substance_lab_effects_substance_idx
  ON supplements.substance_lab_effects(substance_id);
CREATE INDEX IF NOT EXISTS substance_lab_effects_marker_idx
  ON supplements.substance_lab_effects(lab_marker_id)
  WHERE lab_marker_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS substance_lab_effects_loinc_idx
  ON supplements.substance_lab_effects(loinc_code)
  WHERE loinc_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS substance_lab_effects_type_idx
  ON supplements.substance_lab_effects(effect_type);

ALTER TABLE medical.lab_marker_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplements.substance_lab_effects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS lab_marker_catalog_select ON medical.lab_marker_catalog;
CREATE POLICY lab_marker_catalog_select
  ON medical.lab_marker_catalog FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS substance_lab_effects_select ON supplements.substance_lab_effects;
CREATE POLICY substance_lab_effects_select
  ON supplements.substance_lab_effects FOR SELECT TO authenticated USING (true);

GRANT SELECT ON medical.lab_marker_catalog TO authenticated;
GRANT ALL ON medical.lab_marker_catalog TO service_role;
GRANT SELECT ON supplements.substance_lab_effects TO authenticated;
GRANT ALL ON supplements.substance_lab_effects TO service_role;

CREATE TEMP TABLE tmp_lab_marker_catalog (
  payload JSONB NOT NULL
) ON COMMIT DROP;

\\copy tmp_lab_marker_catalog(payload) FROM STDIN WITH (FORMAT csv)
${markerPayload}
\\.

CREATE TEMP TABLE tmp_substance_lab_effects (
  payload JSONB NOT NULL
) ON COMMIT DROP;

\\copy tmp_substance_lab_effects(payload) FROM STDIN WITH (FORMAT csv)
${effectPayload}
\\.

TRUNCATE supplements.substance_lab_effects, medical.lab_marker_catalog;

INSERT INTO medical.lab_marker_catalog (
  marker_id, analyte, category, loinc_code, loinc_candidates, aliases,
  needs_repo_validation, validation_status, resolution_source,
  unresolved_reason, raw
)
SELECT
  payload->>'marker_id',
  payload->>'analyte',
  payload->>'category',
  NULLIF(payload->>'loinc_code', ''),
  COALESCE(ARRAY(SELECT jsonb_array_elements_text(COALESCE(payload->'loinc_candidates', '[]'::jsonb))), '{}'),
  COALESCE(ARRAY(SELECT jsonb_array_elements_text(COALESCE(payload->'aliases', '[]'::jsonb))), '{}'),
  (payload->>'needs_repo_validation')::boolean,
  payload->>'validation_status',
  payload->>'resolution_source',
  NULLIF(payload->>'unresolved_reason', ''),
  COALESCE(payload->'raw', '{}'::jsonb)
FROM tmp_lab_marker_catalog;

INSERT INTO supplements.substance_lab_effects (
  id, substance_id, substance_name, effect_index, marker_index,
  lab_marker_id, loinc_code, effect_type, direction, direction_enum,
  mechanism, clinical_consequence, evidence, monitoring_link, source,
  mapping_status, raw
)
SELECT
  payload->>'id',
  payload->>'substance_id',
  payload->>'substance_name',
  (payload->>'effect_index')::integer,
  (payload->>'marker_index')::integer,
  NULLIF(payload->>'lab_marker_id', ''),
  NULLIF(payload->>'loinc_code', ''),
  payload->>'effect_type',
  NULLIF(payload->>'direction', ''),
  NULLIF(payload->>'direction_enum', ''),
  NULLIF(payload->>'mechanism', ''),
  NULLIF(payload->>'clinical_consequence', ''),
  NULLIF(payload->>'evidence', ''),
  NULLIF(payload->>'monitoring_link', ''),
  NULLIF(payload->>'source', ''),
  payload->>'mapping_status',
  COALESCE(payload->'raw', '{}'::jsonb)
FROM tmp_substance_lab_effects;

COMMENT ON TABLE medical.lab_marker_catalog IS
  'C-162: Kimi crawl_024 lab_markers.json, gegen medical.biomarker_catalog repo-validiert. Ungeloeste Marker bleiben sichtbar.';
COMMENT ON TABLE supplements.substance_lab_effects IS
  'C-162: Katalogbruecke Substanz -> Lab-Marker -> LOINC. Physiologische Effekte, Monitoringanforderungen und Assay-Interferenzen bleiben getrennt; keine Bewertung.';

DO $$
DECLARE
  v_markers integer;
  v_candidates integer;
  v_repo_resolved integer;
  v_unresolved integer;
  v_effect_rows integer;
  v_links integer;
  v_no_marker integer;
  v_phys integer;
  v_monitor integer;
  v_interference integer;
BEGIN
  SELECT count(*) INTO v_markers FROM medical.lab_marker_catalog;
  SELECT count(*) INTO v_candidates FROM medical.lab_marker_catalog
    WHERE validation_status = 'kimi_candidate_validated';
  SELECT count(*) INTO v_repo_resolved FROM medical.lab_marker_catalog
    WHERE validation_status = 'repo_resolved_without_kimi_candidate';
  SELECT count(*) INTO v_unresolved FROM medical.lab_marker_catalog
    WHERE validation_status = 'unresolved_no_unique_loinc';
  SELECT count(*) INTO v_effect_rows FROM supplements.substance_lab_effects;
  SELECT count(*) INTO v_links FROM supplements.substance_lab_effects
    WHERE lab_marker_id IS NOT NULL;
  SELECT count(*) INTO v_no_marker FROM supplements.substance_lab_effects
    WHERE lab_marker_id IS NULL;
  SELECT count(*) INTO v_phys FROM supplements.substance_lab_effects
    WHERE effect_type = 'physiological_lab_effect';
  SELECT count(*) INTO v_monitor FROM supplements.substance_lab_effects
    WHERE effect_type = 'monitoring_requirement';
  SELECT count(*) INTO v_interference FROM supplements.substance_lab_effects
    WHERE effect_type = 'assay_interference';

  IF v_markers <> ${markerRows.length} THEN
    RAISE EXCEPTION 'lab_marker_catalog: %, erwartet ${markerRows.length}', v_markers;
  END IF;
  IF v_candidates <> ${EXPECTED_KIMI_CANDIDATE_MARKERS} THEN
    RAISE EXCEPTION 'Kimi-Kandidaten: %, erwartet ${EXPECTED_KIMI_CANDIDATE_MARKERS}', v_candidates;
  END IF;
  IF v_repo_resolved <> ${EXPECTED_REPO_RESOLVED_WITHOUT_CANDIDATE} THEN
    RAISE EXCEPTION 'Repo-only Marker: %, erwartet ${EXPECTED_REPO_RESOLVED_WITHOUT_CANDIDATE}', v_repo_resolved;
  END IF;
  IF v_unresolved <> ${EXPECTED_UNRESOLVED_MARKERS} THEN
    RAISE EXCEPTION 'Ungeloeste Marker: %, erwartet ${EXPECTED_UNRESOLVED_MARKERS}', v_unresolved;
  END IF;
  IF v_effect_rows <> ${effectRows.length} THEN
    RAISE EXCEPTION 'substance_lab_effects: %, erwartet ${effectRows.length}', v_effect_rows;
  END IF;
  IF v_links <> ${EXPECTED_MARKER_LINK_ROWS} THEN
    RAISE EXCEPTION 'Substanz-Marker-Links: %, erwartet ${EXPECTED_MARKER_LINK_ROWS}', v_links;
  END IF;
  IF v_no_marker <> ${EXPECTED_NO_MARKER_ROWS} THEN
    RAISE EXCEPTION 'Effekte ohne Marker-ID: %, erwartet ${EXPECTED_NO_MARKER_ROWS}', v_no_marker;
  END IF;
  IF v_phys <> 161 OR v_monitor <> 42 OR v_interference <> 19 THEN
    RAISE EXCEPTION 'Effect-Type-Verteilung falsch: phys %, monitor %, interference %',
      v_phys, v_monitor, v_interference;
  END IF;

  RAISE NOTICE 'OK C-162: % Marker (% Kimi, % repo-only, % offen), % Effektzeilen, % Markerlinks',
    v_markers, v_candidates, v_repo_resolved, v_unresolved, v_effect_rows, v_links;
END $$;

COMMIT;
`

  const result = spawnSync(
    'docker',
    ['exec', '-i', CONTAINER, 'psql', '-U', 'postgres', '-d', DB, '-v', 'ON_ERROR_STOP=1', '-f', '-'],
    { input: sql, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 },
  )
  if (result.stdout) process.stdout.write(result.stdout)
  if (result.stderr) process.stderr.write(result.stderr)
  if (result.status !== 0) process.exit(result.status ?? 1)
}

const markers = loadMarkers()
const markerRows = buildMarkerRows(markers)
const substances = loadSubstances()
const effectRows = buildEffectRows(substances, markerRows)
runPsql(markerRows, effectRows)

console.log(
  `C-162: ${markerRows.length} Marker, ${markerRows.filter(row => row.loinc_code).length} mit LOINC, ` +
  `${effectRows.length} Effektzeilen, ${effectRows.filter(row => row.lab_marker_id).length} Substanz-Marker-Verbindungen.`,
)
