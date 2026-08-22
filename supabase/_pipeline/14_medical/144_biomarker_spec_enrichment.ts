#!/usr/bin/env node
// C-84: Extract panel/display metadata and numeric ranges from SPEC_05.
//
// The LOINC master catalog stays untouched. This step stores the spec-derived
// panel/name metadata beside it and imports only those numeric ranges whose
// LOINC identity and unit basis are usable.
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'

const CONTAINER = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const DB = process.env.PGDATABASE ?? 'postgres'
const SPEC = 'docs/specs/Medical/SPEC_05_BIOMARKER_CATALOG.md'
const SPEC_SOURCE = 'docs/specs/Medical/SPEC_05_BIOMARKER_CATALOG.md'
const EXPECTED_SPEC_MARKERS = 47
const EXPECTED_DIRECT_PRESENT_IN_CATALOG = 44
const EXPECTED_PRESENT_IN_CATALOG = 51
const EXPECTED_DISPLAY_USABLE = 47
const EXPECTED_RANGE_MARKERS = 41
const EXPECTED_RANGE_ROWS = 102

type SpecMarker = {
  loinc_code: string
  name: string
  name_de: string
  common_name: string
  category: string
  biomarker_group: string
  unit: string
  lab_range_min: number | null
  lab_range_max: number | null
  optimal_range_min: number | null
  optimal_range_max: number | null
  critical_low_value: number | null
  critical_high_value: number | null
  gender_specific_ranges: Record<string, Record<string, number>> | null
  measurement_frequency_recommended: string
  evidence_level: string
  system_groups: string[]
}

type CatalogRow = {
  loinc_code: string
  long_common_name: string
  short_name: string | null
  display_name: string | null
  component: string | null
  example_units: string | null
  example_ucum_units: string | null
  loinc_class: string
  system: string | null
}

type EnrichmentRow = SpecMarker & {
  source_status: 'spec_ai_generated' | 'spec_loinc_alias_c140' | 'repo_validated_c191'
  catalog_match_status: 'accepted' | 'identity_mismatch' | 'unit_mismatch'
  catalog_mismatch_reason: string | null
  catalog_long_common_name: string
  catalog_short_name: string | null
  catalog_display_name: string | null
  catalog_component: string | null
  catalog_unit: string | null
  catalog_class: string
  catalog_system: string | null
  display_usable: boolean
  ranges_imported: boolean
}

type RangeRow = {
  loinc_code: string
  curated_slug: string
  canonical_name_en: string
  range_type: 'lab' | 'optimal'
  sex: 'all' | 'male' | 'female'
  min_value: number | null
  max_value: number | null
  unit: string
}

const IDENTITY_MISMATCH: Record<string, string> = {
  '1869-7': 'Spec nennt Apolipoprotein B, LOINC 1869-7 ist Apolipoprotein A-I.',
  '3053-6': 'Spec nennt Reverse T3, LOINC 3053-6 ist Triiodothyronine (T3).',
  '5385-0': 'Spec nennt TPO Antibodies, LOINC 5385-0 ist Thyrotropin receptor Ab.',
  '2614-6': 'Spec nennt Magnesium RBC, LOINC 2614-6 ist Methemoglobin/Hemoglobin.total.',
}

const UNIT_MISMATCH_NOT_IMPORTED: Record<string, string> = {
  '62238-1': 'Spec nutzt mL/min, LOINC-Katalog mL/min/{1.73_m2}; Bezugsflaeche fehlt.',
  '10835-7': 'Spec nutzt nmol/L, LOINC-Katalog mg/dL; ohne Umrechnung kein sicherer Fallback.',
}

const LOINC_DISPLAY_ALIASES: Record<string, {
  target: string
  reason: string
  importRanges: boolean
}> = {
  '1869-7': {
    target: '1884-6',
    reason: 'C-191/C-178: Spec-Zeile meinte ApoB; LOINC 1869-7 ist Apo A-I, der belegte Katalogcode fuer ApoB ist 1884-6.',
    importRanges: true,
  },
  '2345-7': {
    target: '1558-6',
    reason: 'C-140/G-84: Befunddaten nutzen den spezifischen Fasting-Glucose-Code 1558-6 statt der Spec-Zeile 2345-7.',
    importRanges: false,
  },
  '2089-1': {
    target: '13457-7',
    reason: 'C-140/G-84: Befunddaten nutzen LDL berechnet 13457-7 statt der Spec-Zeile 2089-1.',
    importRanges: true,
  },
  '20570-8': {
    target: '4544-3',
    reason: 'C-140/G-84: Befunddaten nutzen Haematokrit per automatischem Blutbild 4544-3 statt berechnet 20570-8.',
    importRanges: true,
  },
  '1989-3': {
    target: '14635-7',
    reason: 'C-140/G-84: Befunddaten nutzen 25-OH-Vitamin-D3 14635-7; nur Gruppierung, weil LOINC nmol/L und Seed ng/mL auseinanderlaufen.',
    importRanges: false,
  },
  '2614-6': {
    target: '2601-3',
    reason: 'C-140/G-84: Befunddaten nutzen Magnesium 2601-3 statt der falschen Spec-Zeile 2614-6.',
    importRanges: false,
  },
}

const EXTRA_ENRICHMENT_CODES: Record<string, {
  spec_name: string
  name_de: string
  common_name: string
  category: string
  biomarker_group: string
  unit: string
  measurement_frequency_recommended: string
  evidence_level: string
  system_groups: string[]
  reason: string
}> = {
  '2842-3': {
    spec_name: 'Prolactin',
    name_de: 'Prolaktin',
    common_name: 'PRL',
    category: 'hormones',
    biomarker_group: 'hormones',
    unit: 'ng/mL',
    measurement_frequency_recommended: 'not_specified',
    evidence_level: 'repo_validated',
    system_groups: ['hormonal'],
    reason: 'C-191/C-178: Prolactin liegt im LOINC-Katalog und lab_marker_catalog, fehlte aber in biomarker_spec_enrichment.',
  },
}

function fail(message: string): never {
  console.error(message)
  process.exit(1)
}

function runPsql(args: string[], input?: string): string {
  const result = spawnSync(
    'docker',
    ['exec', '-i', CONTAINER, 'psql', '-U', 'postgres', '-d', DB, ...args],
    { input, encoding: 'utf8', maxBuffer: 512 * 1024 * 1024 },
  )
  if (result.stdout) process.stdout.write(result.stdout)
  if (result.stderr) process.stderr.write(result.stderr)
  if (result.status !== 0) process.exit(result.status ?? 1)
  return result.stdout
}

function csvCell(value: string): string {
  return `"${value.replace(/"/g, '""')}"`
}

function extractInsertBlocks(markdown: string): string[] {
  const blocks: string[] = []
  const re = /INSERT\s+INTO\s+medical\.biomarkers(?:\s*\([^;]*?\))?\s*VALUES\s*([\s\S]*?);/gi
  let match: RegExpExecArray | null
  while ((match = re.exec(markdown)) !== null) blocks.push(match[1])
  return blocks
}

function splitTuples(text: string): string[] {
  const tuples: string[] = []
  let start = -1
  let depth = 0
  let inString = false

  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    const next = text[i + 1]
    if (inString) {
      if (char === "'" && next === "'") {
        i++
        continue
      }
      if (char === "'") inString = false
      continue
    }
    if (char === "'") {
      inString = true
      continue
    }
    if (char === '(') {
      if (depth === 0) start = i
      depth++
    } else if (char === ')') {
      depth--
      if (depth === 0 && start >= 0) {
        tuples.push(text.slice(start + 1, i))
        start = -1
      }
    }
  }

  return tuples
}

function splitFields(tuple: string): Array<string | null> {
  const fields: string[] = []
  let current = ''
  let inString = false

  for (let i = 0; i < tuple.length; i++) {
    const char = tuple[i]
    const next = tuple[i + 1]
    if (inString) {
      if (char === "'" && next === "'") {
        current += "'"
        i++
        continue
      }
      if (char === "'") {
        inString = false
        continue
      }
      current += char
      continue
    }
    if (char === "'") {
      inString = true
      continue
    }
    if (char === ',') {
      fields.push(current.trim())
      current = ''
      continue
    }
    current += char
  }
  fields.push(current.trim())

  return fields
    .map(value => value.replace(/::jsonb$/i, '').trim())
    .map(value => /^NULL$/i.test(value) ? null : value)
}

function parseNumber(value: string | null): number | null {
  if (value === null) return null
  if (!/^[-+]?\d+(\.\d+)?$/.test(value)) fail(`Zahl erwartet, bekommen: ${value}`)
  return Number(value)
}

function parseJson(value: string | null): Record<string, Record<string, number>> | null {
  if (value === null) return null
  return JSON.parse(value) as Record<string, Record<string, number>>
}

function parseSystemMarkers(markdown: string): Record<string, string[]> {
  const block = markdown.match(/const SYSTEM_MARKERS:[\s\S]*?\{([\s\S]*?)\};/)
  if (!block) fail(`${SPEC}: SYSTEM_MARKERS fehlt`)
  const out: Record<string, string[]> = {}
  const re = /([a-z_]+):\s*\[([^\]]*)\]/g
  let match: RegExpExecArray | null
  while ((match = re.exec(block[1])) !== null) {
    out[match[1]] = [...match[2].matchAll(/'([^']+)'/g)].map(m => m[1])
  }
  return out
}

function normalizeName(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9äöüß]+/gi, '')
}

function systemGroupsFor(marker: Pick<SpecMarker, 'name' | 'common_name'>, systemMarkers: Record<string, string[]>): string[] {
  const names = new Set([
    normalizeName(marker.name),
    normalizeName(marker.common_name),
    normalizeName(marker.name.replace(/^(.+),\s*(Total|Free)$/i, '$2 $1')),
  ])
  const groups: string[] = []
  for (const [group, terms] of Object.entries(systemMarkers)) {
    if (terms.some(term => names.has(normalizeName(term)))) groups.push(group)
  }
  return groups.sort()
}

function parseSpec(): SpecMarker[] {
  const markdown = fs.readFileSync(SPEC, 'utf8')
  const systemMarkers = parseSystemMarkers(markdown)
  const rows: SpecMarker[] = []

  for (const block of extractInsertBlocks(markdown.replace(/--.*$/gm, ''))) {
    for (const tuple of splitTuples(block)) {
      const fields = splitFields(tuple)
      if (fields.length !== 16) {
        fail(`${SPEC}: ${fields.length} Felder statt 16 in Tupel ${tuple.slice(0, 80)}`)
      }
      const marker: SpecMarker = {
        loinc_code: fields[0] ?? fail('loinc_code fehlt'),
        name: fields[1] ?? fail('name fehlt'),
        name_de: fields[2] ?? fail('name_de fehlt'),
        common_name: fields[3] ?? fail('common_name fehlt'),
        category: fields[4] ?? fail('category fehlt'),
        biomarker_group: fields[5] ?? fail('biomarker_group fehlt'),
        unit: fields[6] ?? fail('unit fehlt'),
        lab_range_min: parseNumber(fields[7]),
        lab_range_max: parseNumber(fields[8]),
        optimal_range_min: parseNumber(fields[9]),
        optimal_range_max: parseNumber(fields[10]),
        critical_low_value: parseNumber(fields[11]),
        critical_high_value: parseNumber(fields[12]),
        gender_specific_ranges: parseJson(fields[13]),
        measurement_frequency_recommended: fields[14] ?? fail('measurement_frequency_recommended fehlt'),
        evidence_level: fields[15] ?? fail('evidence_level fehlt'),
        system_groups: [],
      }
      marker.system_groups = systemGroupsFor(marker, systemMarkers)
      rows.push(marker)
    }
  }

  return rows
}

function readCatalog(codes: string[]): Map<string, CatalogRow> {
  const quoted = codes.map(code => `'${code.replace(/'/g, "''")}'`).join(',')
  const out = spawnSync(
    'docker',
    [
      'exec', CONTAINER, 'psql', '-U', 'postgres', '-d', DB,
      '-t', '-A',
      '-c',
      `SELECT COALESCE(jsonb_agg(to_jsonb(c)), '[]'::jsonb)::text
       FROM (
         SELECT loinc_code, long_common_name, short_name, display_name, component,
                example_units, example_ucum_units, loinc_class, system
         FROM medical.biomarker_catalog
         WHERE loinc_code IN (${quoted})
       ) c;`,
    ],
    { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 },
  )
  if (out.stderr) process.stderr.write(out.stderr)
  if (out.status !== 0) process.exit(out.status ?? 1)
  const rows = JSON.parse(out.stdout.trim() || '[]') as CatalogRow[]
  return new Map(rows.map(row => [row.loinc_code, row]))
}

function unitKey(value: string | null): string {
  return (value ?? '')
    .replace(/µ/g, 'u')
    .replace(/³/g, '*3')
    .replace(/⁶/g, '*6')
    .replace(/\[IU\]/gi, 'IU')
    .replace(/hr/gi, 'h')
    .replace(/\s+/g, '')
    .toLowerCase()
}

function unitCompatible(specUnit: string, catalogUnit: string | null): boolean {
  const spec = unitKey(specUnit)
  const catalog = unitKey(catalogUnit)
  if (!catalog) return true
  return catalog.split(';').map(part => part.trim()).includes(spec)
}

function slug(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

function appendRanges(ranges: RangeRow[], marker: SpecMarker): void {
  const base = {
    loinc_code: marker.loinc_code,
    curated_slug: slug(marker.name),
    canonical_name_en: marker.name,
    unit: marker.unit,
  }

  ranges.push({
    ...base,
    range_type: 'lab',
    sex: 'all',
    min_value: marker.lab_range_min,
    max_value: marker.lab_range_max,
  })
  ranges.push({
    ...base,
    range_type: 'optimal',
    sex: 'all',
    min_value: marker.optimal_range_min,
    max_value: marker.optimal_range_max,
  })

  for (const sex of ['male', 'female'] as const) {
    const sexRange = marker.gender_specific_ranges?.[sex]
    if (!sexRange) continue
    if ('lab_min' in sexRange || 'lab_max' in sexRange) {
      ranges.push({
        ...base,
        range_type: 'lab',
        sex,
        min_value: sexRange.lab_min ?? marker.lab_range_min,
        max_value: sexRange.lab_max ?? marker.lab_range_max,
      })
    }
    if ('optimal_min' in sexRange || 'optimal_max' in sexRange) {
      ranges.push({
        ...base,
        range_type: 'optimal',
        sex,
        min_value: sexRange.optimal_min ?? marker.optimal_range_min,
        max_value: sexRange.optimal_max ?? marker.optimal_range_max,
      })
    }
  }
}

function buildRows(markers: SpecMarker[], catalog: Map<string, CatalogRow>): { enrichment: EnrichmentRow[]; ranges: RangeRow[]; missing: SpecMarker[] } {
  const enrichment: EnrichmentRow[] = []
  const ranges: RangeRow[] = []
  const missing: SpecMarker[] = []
  const markerByCode = new Map(markers.map(marker => [marker.loinc_code, marker]))

  for (const marker of markers) {
    const catalogRow = catalog.get(marker.loinc_code)
    if (!catalogRow) {
      missing.push(marker)
      continue
    }

    const identityReason = IDENTITY_MISMATCH[marker.loinc_code]
    const unitReason = UNIT_MISMATCH_NOT_IMPORTED[marker.loinc_code]
    const status: EnrichmentRow['catalog_match_status'] = identityReason
      ? 'identity_mismatch'
      : unitReason || !unitCompatible(marker.unit, catalogRow.example_ucum_units ?? catalogRow.example_units)
        ? 'unit_mismatch'
        : 'accepted'
    const reason = identityReason ?? unitReason ?? (
      status === 'unit_mismatch'
        ? `Spec-Einheit ${marker.unit}, LOINC-Beispieleinheit ${catalogRow.example_ucum_units ?? catalogRow.example_units}.`
        : null
    )

    enrichment.push({
      ...marker,
      source_status: 'spec_ai_generated',
      catalog_match_status: status,
      catalog_mismatch_reason: reason,
      catalog_long_common_name: catalogRow.long_common_name,
      catalog_short_name: catalogRow.short_name,
      catalog_display_name: catalogRow.display_name,
      catalog_component: catalogRow.component,
      catalog_unit: catalogRow.example_ucum_units ?? catalogRow.example_units,
      catalog_class: catalogRow.loinc_class,
      catalog_system: catalogRow.system,
      display_usable: status !== 'identity_mismatch',
      ranges_imported: status === 'accepted',
    })

    if (status !== 'accepted') continue

    appendRanges(ranges, marker)
  }

  for (const [specCode, alias] of Object.entries(LOINC_DISPLAY_ALIASES)) {
    const marker = markerByCode.get(specCode)
    const catalogRow = catalog.get(alias.target)
    if (!marker) fail(`C-140 LOINC-Alias: Spec-Code ${specCode} fehlt`)
    if (!catalogRow) fail(`C-140 LOINC-Alias: Zielcode ${alias.target} fehlt im Katalog`)

    const aliasMarker: SpecMarker = { ...marker, loinc_code: alias.target }
    const compatible = unitCompatible(marker.unit, catalogRow.example_ucum_units ?? catalogRow.example_units)
    const status: EnrichmentRow['catalog_match_status'] =
      alias.importRanges && compatible ? 'accepted' : 'unit_mismatch'
    const reason = status === 'accepted'
      ? alias.reason
      : `${alias.reason} Kein Bereichsimport: Spec-Einheit ${marker.unit}, LOINC-Beispieleinheit ${catalogRow.example_ucum_units ?? catalogRow.example_units}.`

    enrichment.push({
      ...aliasMarker,
      source_status: 'spec_loinc_alias_c140',
      catalog_match_status: status,
      catalog_mismatch_reason: reason,
      catalog_long_common_name: catalogRow.long_common_name,
      catalog_short_name: catalogRow.short_name,
      catalog_display_name: catalogRow.display_name,
      catalog_component: catalogRow.component,
      catalog_unit: catalogRow.example_ucum_units ?? catalogRow.example_units,
      catalog_class: catalogRow.loinc_class,
      catalog_system: catalogRow.system,
      display_usable: true,
      ranges_imported: status === 'accepted',
    })

    if (status === 'accepted') {
      appendRanges(ranges, aliasMarker)
    }
  }

  for (const [loincCode, extra] of Object.entries(EXTRA_ENRICHMENT_CODES)) {
    const catalogRow = catalog.get(loincCode)
    if (!catalogRow) fail(`C-191 Extra-Enrichment: ${loincCode} fehlt im Katalog`)

    enrichment.push({
      loinc_code: loincCode,
      name: extra.spec_name,
      name_de: extra.name_de,
      common_name: extra.common_name,
      category: extra.category,
      biomarker_group: extra.biomarker_group,
      unit: extra.unit,
      lab_range_min: null,
      lab_range_max: null,
      optimal_range_min: null,
      optimal_range_max: null,
      critical_low_value: null,
      critical_high_value: null,
      gender_specific_ranges: null,
      measurement_frequency_recommended: extra.measurement_frequency_recommended,
      evidence_level: extra.evidence_level,
      system_groups: extra.system_groups,
      source_status: 'repo_validated_c191',
      catalog_match_status: 'accepted',
      catalog_mismatch_reason: extra.reason,
      catalog_long_common_name: catalogRow.long_common_name,
      catalog_short_name: catalogRow.short_name,
      catalog_display_name: catalogRow.display_name,
      catalog_component: catalogRow.component,
      catalog_unit: catalogRow.example_ucum_units ?? catalogRow.example_units,
      catalog_class: catalogRow.loinc_class,
      catalog_system: catalogRow.system,
      display_usable: true,
      ranges_imported: false,
    })
  }

  return { enrichment, ranges, missing }
}

function insertRows(enrichment: EnrichmentRow[], ranges: RangeRow[]): void {
  const enrichmentPayload = enrichment.map(row => csvCell(JSON.stringify(row))).join('\n')
  const rangePayload = ranges.map(row => csvCell(JSON.stringify(row))).join('\n')
  const sql = `\\set ON_ERROR_STOP on
BEGIN;

CREATE TABLE IF NOT EXISTS medical.biomarker_spec_enrichment (
  loinc_code text PRIMARY KEY REFERENCES medical.biomarker_catalog(loinc_code) ON DELETE CASCADE,
  source_file text NOT NULL,
  source_status text NOT NULL DEFAULT 'spec_ai_generated',
  spec_name text NOT NULL,
  name_de text NOT NULL,
  common_name text NOT NULL,
  category text NOT NULL,
  biomarker_group text NOT NULL,
  unit text NOT NULL,
  lab_range_min numeric,
  lab_range_max numeric,
  optimal_range_min numeric,
  optimal_range_max numeric,
  critical_low_value numeric,
  critical_high_value numeric,
  gender_specific_ranges jsonb,
  measurement_frequency_recommended text NOT NULL,
  evidence_level text NOT NULL,
  system_groups text[] NOT NULL DEFAULT ARRAY[]::text[],
  catalog_match_status text NOT NULL CHECK (catalog_match_status IN ('accepted','identity_mismatch','unit_mismatch')),
  catalog_mismatch_reason text,
  catalog_long_common_name text NOT NULL,
  catalog_short_name text,
  catalog_display_name text,
  catalog_component text,
  catalog_unit text,
  catalog_class text NOT NULL,
  catalog_system text,
  display_usable boolean NOT NULL,
  ranges_imported boolean NOT NULL,
  imported_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE medical.biomarker_spec_enrichment IS
  'C-84: reproduzierbar aus docs/specs/Medical/SPEC_05_BIOMARKER_CATALOG.md extrahierte Panel-, Kurzname- und Bereichsmetadaten neben dem LOINC-Katalog.';
COMMENT ON COLUMN medical.biomarker_spec_enrichment.source_status IS
  'spec_ai_generated = repo-interne, KI-erzeugte Spec; spec_loinc_alias_c140 = dieselbe Spec-Zeile auf einen belegten Daten-LOINC gespiegelt; repo_validated_c191 = Marker aus Katalog/lab_marker_catalog ergaenzt. Werte sind nicht als externe Laborquelle belegt.';
COMMENT ON COLUMN medical.biomarker_spec_enrichment.catalog_match_status IS
  'accepted = LOINC-Code und Einheit nutzbar; identity_mismatch = Spec-Code zeigt auf anderen Test; unit_mismatch = Bereich nicht als Fallback importiert.';

ALTER TABLE medical.biomarker_spec_enrichment ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS biomarker_spec_enrichment_select ON medical.biomarker_spec_enrichment;
CREATE POLICY biomarker_spec_enrichment_select ON medical.biomarker_spec_enrichment
  FOR SELECT TO authenticated USING (true);

GRANT SELECT ON medical.biomarker_spec_enrichment TO authenticated;
GRANT ALL ON medical.biomarker_spec_enrichment TO service_role;

CREATE TEMP TABLE tmp_biomarker_spec_enrichment (
  payload text NOT NULL
) ON COMMIT DROP;

CREATE TEMP TABLE tmp_biomarker_spec_ranges (
  payload text NOT NULL
) ON COMMIT DROP;

COPY tmp_biomarker_spec_enrichment (payload) FROM STDIN WITH (FORMAT csv);
${enrichmentPayload}
\\.

COPY tmp_biomarker_spec_ranges (payload) FROM STDIN WITH (FORMAT csv);
${rangePayload}
\\.

DELETE FROM medical.biomarker_reference_ranges
WHERE source = '${SPEC_SOURCE.replace(/'/g, "''")}';

TRUNCATE medical.biomarker_spec_enrichment;

WITH parsed AS (
  SELECT payload::jsonb AS row
  FROM tmp_biomarker_spec_enrichment
)
INSERT INTO medical.biomarker_spec_enrichment (
  loinc_code,
  source_file,
  source_status,
  spec_name,
  name_de,
  common_name,
  category,
  biomarker_group,
  unit,
  lab_range_min,
  lab_range_max,
  optimal_range_min,
  optimal_range_max,
  critical_low_value,
  critical_high_value,
  gender_specific_ranges,
  measurement_frequency_recommended,
  evidence_level,
  system_groups,
  catalog_match_status,
  catalog_mismatch_reason,
  catalog_long_common_name,
  catalog_short_name,
  catalog_display_name,
  catalog_component,
  catalog_unit,
  catalog_class,
  catalog_system,
  display_usable,
  ranges_imported
)
SELECT
  row->>'loinc_code',
  '${SPEC_SOURCE.replace(/'/g, "''")}',
  COALESCE(NULLIF(row->>'source_status', ''), 'spec_ai_generated'),
  row->>'name',
  row->>'name_de',
  row->>'common_name',
  row->>'category',
  row->>'biomarker_group',
  row->>'unit',
  NULLIF(row->>'lab_range_min', '')::numeric,
  NULLIF(row->>'lab_range_max', '')::numeric,
  NULLIF(row->>'optimal_range_min', '')::numeric,
  NULLIF(row->>'optimal_range_max', '')::numeric,
  NULLIF(row->>'critical_low_value', '')::numeric,
  NULLIF(row->>'critical_high_value', '')::numeric,
  COALESCE(row->'gender_specific_ranges', 'null'::jsonb),
  row->>'measurement_frequency_recommended',
  row->>'evidence_level',
  ARRAY(SELECT jsonb_array_elements_text(COALESCE(row->'system_groups', '[]'::jsonb)) ORDER BY 1),
  row->>'catalog_match_status',
  NULLIF(row->>'catalog_mismatch_reason', ''),
  row->>'catalog_long_common_name',
  NULLIF(row->>'catalog_short_name', ''),
  NULLIF(row->>'catalog_display_name', ''),
  NULLIF(row->>'catalog_component', ''),
  NULLIF(row->>'catalog_unit', ''),
  row->>'catalog_class',
  NULLIF(row->>'catalog_system', ''),
  (row->>'display_usable')::boolean,
  (row->>'ranges_imported')::boolean
FROM parsed;

WITH parsed AS (
  SELECT payload::jsonb AS row
  FROM tmp_biomarker_spec_ranges
)
INSERT INTO medical.biomarker_reference_ranges (
  loinc_code,
  curated_slug,
  canonical_name_en,
  range_type,
  sex,
  population,
  min_value,
  max_value,
  unit,
  source,
  source_path,
  source_status,
  decision_status,
  is_active
)
SELECT
  row->>'loinc_code',
  row->>'curated_slug',
  row->>'canonical_name_en',
  row->>'range_type',
  row->>'sex',
  'general',
  NULLIF(row->>'min_value', '')::numeric,
  NULLIF(row->>'max_value', '')::numeric,
  row->>'unit',
  '${SPEC_SOURCE.replace(/'/g, "''")}',
  '${SPEC_SOURCE.replace(/'/g, "''")}#insert-into-medical-biomarkers',
  'spec_ai_generated',
  'spec_ai_generated_c84',
  true
FROM parsed;

DO $$
DECLARE
  v_catalog int;
  v_enrichment int;
  v_display_usable int;
  v_range_markers int;
  v_spec_ranges int;
  v_total_ranges int;
  v_loinc int;
BEGIN
  SELECT COUNT(*) INTO v_catalog FROM medical.biomarker_catalog;
  SELECT COUNT(*) INTO v_enrichment FROM medical.biomarker_spec_enrichment;
  SELECT COUNT(*) INTO v_display_usable FROM medical.biomarker_spec_enrichment WHERE display_usable;
  SELECT COUNT(*) INTO v_range_markers FROM medical.biomarker_spec_enrichment WHERE ranges_imported;
  SELECT COUNT(*) INTO v_spec_ranges FROM medical.biomarker_reference_ranges WHERE source = '${SPEC_SOURCE.replace(/'/g, "''")}';
  SELECT COUNT(*) INTO v_total_ranges FROM medical.biomarker_reference_ranges;

  IF v_catalog <> 11676 THEN
    RAISE EXCEPTION 'biomarker_catalog: % statt 11676', v_catalog;
  END IF;
  IF v_enrichment <> ${EXPECTED_PRESENT_IN_CATALOG} THEN
    RAISE EXCEPTION 'biomarker_spec_enrichment: % statt ${EXPECTED_PRESENT_IN_CATALOG}', v_enrichment;
  END IF;
  IF v_display_usable <> ${EXPECTED_DISPLAY_USABLE} THEN
    RAISE EXCEPTION 'display_usable: % statt ${EXPECTED_DISPLAY_USABLE}', v_display_usable;
  END IF;
  IF v_range_markers <> ${EXPECTED_RANGE_MARKERS} THEN
    RAISE EXCEPTION 'ranges_imported Marker: % statt ${EXPECTED_RANGE_MARKERS}', v_range_markers;
  END IF;
  IF v_spec_ranges <> ${EXPECTED_RANGE_ROWS} THEN
    RAISE EXCEPTION 'Spec-Referenzbereiche: % statt ${EXPECTED_RANGE_ROWS}', v_spec_ranges;
  END IF;
  IF v_total_ranges <> 566 THEN
    RAISE EXCEPTION 'biomarker_reference_ranges gesamt: % statt 566', v_total_ranges;
  END IF;

  SELECT COUNT(DISTINCT loinc_code) INTO v_loinc FROM medical.biomarker_spec_enrichment;
  IF v_loinc <> v_enrichment THEN
    RAISE EXCEPTION 'Doppelte LOINC-Codes in biomarker_spec_enrichment';
  END IF;

  RAISE NOTICE 'OK: % Spec-Marker im Katalog, % display-nutzbar, % Marker mit % Spec-Bereichszeilen, Referenzbereiche gesamt %',
    v_enrichment, v_display_usable, v_range_markers, v_spec_ranges, v_total_ranges;
END $$;

COMMIT;
`
  runPsql(['-v', 'ON_ERROR_STOP=1', '-f', '-'], sql)
}

const markers = parseSpec()
if (markers.length !== EXPECTED_SPEC_MARKERS) {
  fail(`${SPEC}: ${markers.length} Marker statt ${EXPECTED_SPEC_MARKERS}`)
}

const catalog = readCatalog([
  ...markers.map(row => row.loinc_code),
  ...Object.values(LOINC_DISPLAY_ALIASES).map(alias => alias.target),
  ...Object.keys(EXTRA_ENRICHMENT_CODES),
])
const { enrichment, ranges, missing } = buildRows(markers, catalog)
const displayUsable = enrichment.filter(row => row.display_usable).length
const rangeMarkers = enrichment.filter(row => row.ranges_imported).length

if (missing.length !== EXPECTED_SPEC_MARKERS - EXPECTED_DIRECT_PRESENT_IN_CATALOG) {
  fail(`LOINC-fehlend: ${missing.length}, erwartet ${EXPECTED_SPEC_MARKERS - EXPECTED_DIRECT_PRESENT_IN_CATALOG}`)
}
if (enrichment.length !== EXPECTED_PRESENT_IN_CATALOG) {
  fail(`Spec-Marker im Katalog: ${enrichment.length}, erwartet ${EXPECTED_PRESENT_IN_CATALOG}`)
}
if (displayUsable !== EXPECTED_DISPLAY_USABLE) {
  fail(`Display-nutzbar: ${displayUsable}, erwartet ${EXPECTED_DISPLAY_USABLE}`)
}
if (rangeMarkers !== EXPECTED_RANGE_MARKERS) {
  fail(`Range-Marker: ${rangeMarkers}, erwartet ${EXPECTED_RANGE_MARKERS}`)
}
if (ranges.length !== EXPECTED_RANGE_ROWS) {
  fail(`Range-Zeilen: ${ranges.length}, erwartet ${EXPECTED_RANGE_ROWS}`)
}

insertRows(enrichment, ranges)

const panels = new Map<string, number>()
for (const marker of markers) panels.set(marker.category, (panels.get(marker.category) ?? 0) + 1)

console.log(
  `C-84 OK: ${markers.length} Spec-Marker, ${enrichment.length} im LOINC-Katalog, ` +
  `${displayUsable} display-nutzbar, ${rangeMarkers} mit ${ranges.length} Spec-Referenzbereichszeilen.`,
)
console.log(`Panels: ${[...panels.entries()].map(([panel, count]) => `${panel}=${count}`).join(', ')}`)
if (missing.length) {
  console.log(`Nicht im LOINC-Zuschnitt: ${missing.map(row => `${row.loinc_code} ${row.name}`).join('; ')}`)
}
