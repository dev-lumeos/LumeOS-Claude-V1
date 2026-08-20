#!/usr/bin/env node
// C-134: konsolidierter Substanzkatalog aus LumeOS, F-05 und Kimi.
// Chemische Formen bleiben getrennt. Das alte supplement_catalog bleibt
// der konkrete Stack-Katalog; substance_catalog ist die fachliche
// Substanzebene mit Herkunft je Feld/Zeile.
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const CONTAINER = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const DB = process.env.PGDATABASE ?? 'postgres'

const KIMI_BASE = 'backup/kimi-research/Kimi_Agent/supplement_performance_database/data'
const LOCAL_CATALOG = 'supabase/_pipeline/daten/supplement-katalog.json'
const F05_CATALOG = 'supabase/_pipeline/daten/substanz-katalog.json'
const CROSS_DOMAIN = path.join(KIMI_BASE, 'indexes', 'cross_domain_substance_mapping.json')
const KIMI_ALIASES = path.join(KIMI_BASE, 'indexes', 'aliases.json')

type JsonObject = Record<string, unknown>
type LocalSupplement = JsonObject & {
  slug: string
  name: string
  name_de?: string
  name_en?: string
}
type F05Substance = JsonObject & { name: string }
type KimiSubstance = JsonObject & {
  id: string
  canonical_name: string
  aliases?: string[]
  cas_number?: string | null
  compound_type?: string
  category?: string
  subcategory?: string | null
  chemical_form?: string | null
  external_ids?: JsonObject
  platform_classes?: string[]
  platform?: JsonObject
  evidence?: JsonObject
  dosing?: JsonObject
  pharmacology?: JsonObject
  cyp?: JsonObject
  lab_effects?: unknown[]
}
type SubstanceRow = {
  id: string
  canonical_name: string
  domain: string
  compound_type: string | null
  category: string | null
  subcategory: string | null
  chemical_form: string | null
  aliases: string[]
  cas_number: string | null
  external_ids: JsonObject
  platform_classes: string[]
  platform: JsonObject
  evidence: JsonObject
  official_label_dose: unknown
  guideline_dose: unknown
  tolerable_upper_intake_level: unknown
  studied_dose_ranges: unknown
  anecdotal_dose_ranges: unknown
  dosing: JsonObject
  pharmacology: JsonObject
  half_life: unknown
  half_life_status: string
  cyp: JsonObject
  lab_effects: unknown
  nutrients_provided: JsonObject
  nutrient_mapping_status: string
  source_primary: string
  raw: JsonObject
}
type SourceRow = {
  substance_id: string
  source_catalog: string
  source_entity_id: string
  source_label: string
  relation: string
  confidence: string
  source_ref: string
  field_sources: JsonObject
  raw: JsonObject
}

function fail(message: string): never {
  console.error(message)
  process.exit(1)
}

function readJson(file: string): JsonObject {
  if (!fs.existsSync(file)) fail(`${file} fehlt. C-134 braucht alle drei Bestaende.`)
  return JSON.parse(fs.readFileSync(file, 'utf8')) as JsonObject
}

function readJsonl(file: string): JsonObject[] {
  if (!fs.existsSync(file)) fail(`${file} fehlt. C-134 braucht crawl_022.`)
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

function fold(value: unknown): string {
  return String(value ?? '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ')
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

function deterministicId(prefix: string, value: string): string {
  return `${prefix}_${fold(value).replace(/\s+/g, '_').slice(0, 120)}`
}

function dosePart(dosing: JsonObject, key: string): unknown {
  return dosing[key] ?? null
}

function buildKimiRows(): Array<KimiSubstance & { domain: string; sourceFile: string }> {
  const specs = [
    { domain: 'kimi_supplement', file: 'supplements.jsonl', expected: 154 },
    { domain: 'kimi_peptide', file: 'peptides.jsonl', expected: 62 },
    { domain: 'kimi_performance', file: 'performance_compounds.jsonl', expected: 75 },
  ]
  const rows: Array<KimiSubstance & { domain: string; sourceFile: string }> = []
  for (const spec of specs) {
    const file = path.join(KIMI_BASE, 'substances', spec.file)
    const parsed = readJsonl(file) as KimiSubstance[]
    if (parsed.length !== spec.expected) {
      fail(`${file}: ${parsed.length} Zeilen, erwartet ${spec.expected}`)
    }
    for (const row of parsed) rows.push({ ...row, domain: spec.domain, sourceFile: file })
  }
  const ids = new Set(rows.map(row => row.id))
  if (rows.length !== 291 || ids.size !== 291) {
    fail(`Kimi crawl_022: ${rows.length} Zeilen / ${ids.size} IDs, erwartet 291 eindeutig`)
  }
  return rows
}

function aliasesForKimi(row: KimiSubstance): string[] {
  const external = objectValue(row.external_ids)
  const aliases = [
    row.canonical_name,
    ...textArray(row.aliases),
    row.cas_number,
    external.UNII,
    external.PubChem_CID,
    external.ChEMBL_ID,
    external.InChIKey,
    ...textArray(external.cas_candidates),
  ].filter(Boolean).map(String)
  return [...new Set(aliases)]
}

function addSource(rows: SourceRow[], row: SourceRow): void {
  rows.push(row)
}

const kimiRows = buildKimiRows()
const local = readJson(LOCAL_CATALOG) as JsonObject & { supplements?: LocalSupplement[] }
const f05 = readJson(F05_CATALOG) as JsonObject & { substances?: F05Substance[] }
const kimiAliases = readJson(KIMI_ALIASES) as Record<string, string>
const crossDomain = readJson(CROSS_DOMAIN) as JsonObject & { mappings?: JsonObject[] }

if (!Array.isArray(local.supplements) || local.supplements.length !== 44) {
  fail(`${LOCAL_CATALOG}: 44 Supplements erwartet`)
}
if (!Array.isArray(f05.substances) || f05.substances.length !== 320) {
  fail(`${F05_CATALOG}: 320 Substanzkandidaten erwartet`)
}

const kimiIds = new Set(kimiRows.map(row => row.id))
const aliasToKimi = new Map<string, Set<string>>()
function mapAlias(alias: unknown, id: string): void {
  const key = fold(alias)
  if (!key) return
  if (!aliasToKimi.has(key)) aliasToKimi.set(key, new Set())
  aliasToKimi.get(key)!.add(id)
}
for (const row of kimiRows) {
  for (const alias of aliasesForKimi(row)) mapAlias(alias, row.id)
}
for (const [alias, id] of Object.entries(kimiAliases)) {
  if (kimiIds.has(id)) mapAlias(alias, id)
}

function uniqueKimiMatch(aliases: unknown[]): string | null {
  const ids = new Set<string>()
  for (const alias of aliases) {
    for (const id of aliasToKimi.get(fold(alias)) ?? []) ids.add(id)
  }
  return ids.size === 1 ? [...ids][0]! : null
}

const substances = new Map<string, SubstanceRow>()
const sources: SourceRow[] = []

for (const row of kimiRows) {
  const dosing = objectValue(row.dosing)
  const pharmacology = objectValue(row.pharmacology)
  const hasHalfLife = pharmacology.half_life !== undefined && pharmacology.half_life !== null && pharmacology.half_life !== ''
  substances.set(row.id, {
    id: row.id,
    canonical_name: row.canonical_name,
    domain: row.domain,
    compound_type: row.compound_type ? String(row.compound_type) : null,
    category: row.category ? String(row.category) : null,
    subcategory: row.subcategory ? String(row.subcategory) : null,
    chemical_form: row.chemical_form ? String(row.chemical_form) : null,
    aliases: textArray(row.aliases),
    cas_number: row.cas_number ? String(row.cas_number) : null,
    external_ids: objectValue(row.external_ids),
    platform_classes: textArray(row.platform_classes),
    platform: objectValue(row.platform),
    evidence: objectValue(row.evidence),
    official_label_dose: dosePart(dosing, 'official_label_dose'),
    guideline_dose: dosePart(dosing, 'guideline_dose'),
    tolerable_upper_intake_level: dosePart(dosing, 'tolerable_upper_intake_level'),
    studied_dose_ranges: dosePart(dosing, 'studied_dose_ranges') ?? [],
    anecdotal_dose_ranges: dosePart(dosing, 'anecdotal_dose_ranges') ?? [],
    dosing,
    pharmacology,
    half_life: hasHalfLife ? pharmacology.half_life : null,
    half_life_status: hasHalfLife ? 'from_kimi_source' : 'not_available_in_free_authoritative_source',
    cyp: objectValue(row.cyp),
    lab_effects: row.lab_effects ?? [],
    nutrients_provided: {},
    nutrient_mapping_status: 'not_provided_by_kimi_crawl_022',
    source_primary: row.domain,
    raw: row,
  })
  addSource(sources, {
    substance_id: row.id,
    source_catalog: row.domain,
    source_entity_id: row.id,
    source_label: row.canonical_name,
    relation: 'primary',
    confidence: 'source_record',
    source_ref: `${row.sourceFile}#${row.id}`,
    field_sources: {
      identifiers: 'crawl_022.external_ids',
      dosing: 'crawl_022.dosing',
      half_life: hasHalfLife ? 'crawl_022.pharmacology.half_life' : 'explicit_null_no_free_authoritative_source',
      cyp: row.cyp ? 'crawl_022.chembl_assays' : null,
    },
    raw: row,
  })
}

let localMatched = 0
let localOwn = 0
for (const row of local.supplements) {
  const match = uniqueKimiMatch([row.slug, row.name, row.name_de, row.name_en])
  const id = match ?? deterministicId('local', row.slug)
  if (!match) {
    localOwn++
    substances.set(id, {
      id,
      canonical_name: row.name,
      domain: 'lumeos_local',
      compound_type: null,
      category: row.category ? String(row.category) : null,
      subcategory: null,
      chemical_form: null,
      aliases: [row.slug, row.name, row.name_de, row.name_en].filter(Boolean).map(String),
      cas_number: null,
      external_ids: {},
      platform_classes: [],
      platform: {},
      evidence: {},
      official_label_dose: null,
      guideline_dose: null,
      tolerable_upper_intake_level: null,
      studied_dose_ranges: [],
      anecdotal_dose_ranges: [],
      dosing: {},
      pharmacology: {},
      half_life: null,
      half_life_status: 'not_available_in_local_catalog',
      cyp: {},
      lab_effects: [],
      nutrients_provided: objectValue(row.nutrients_provided),
      nutrient_mapping_status: Object.keys(objectValue(row.nutrients_provided)).length > 0
        ? 'local_catalog'
        : 'not_provided_by_local_catalog',
      source_primary: 'lumeos_supplement_catalog',
      raw: row,
    })
  } else {
    localMatched++
    const existing = substances.get(id)!
    const nutrients = objectValue(row.nutrients_provided)
    if (Object.keys(nutrients).length > 0 && Object.keys(existing.nutrients_provided).length === 0) {
      existing.nutrients_provided = nutrients
      existing.nutrient_mapping_status = 'local_catalog'
    }
  }
  addSource(sources, {
    substance_id: id,
    source_catalog: 'lumeos_supplement_catalog',
    source_entity_id: row.slug,
    source_label: row.name,
    relation: match ? 'alias_match_to_kimi' : 'own_record_no_kimi_match',
    confidence: match ? 'exact_alias_unique' : 'unmatched',
    source_ref: `${LOCAL_CATALOG}#${row.slug}`,
    field_sources: {
      nutrients_provided: row.nutrients_provided ? 'lumeos_supplement_catalog.nutrients_provided' : null,
    },
    raw: row,
  })
}

let f05Matched = 0
let f05Own = 0
for (const row of f05.substances) {
  const match = uniqueKimiMatch([row.name])
  const id = match ?? deterministicId('f05', row.name)
  if (!match) {
    f05Own++
    substances.set(id, {
      id,
      canonical_name: row.name,
      domain: 'f05_candidate',
      compound_type: row.class ? String(row.class) : null,
      category: row.category_source ? String(row.category_source) : null,
      subcategory: null,
      chemical_form: null,
      aliases: [row.name],
      cas_number: null,
      external_ids: {},
      platform_classes: [],
      platform: {},
      evidence: {},
      official_label_dose: null,
      guideline_dose: null,
      tolerable_upper_intake_level: row.upper_limit ?? null,
      studied_dose_ranges: [],
      anecdotal_dose_ranges: row.dose_range ? [{ range: row.dose_range, not_medical_recommendation: true, source: 'f05_candidate' }] : [],
      dosing: {
        upper_limit: row.upper_limit ?? null,
        upper_limit_source: row.upper_limit_source ?? null,
        dose_range: row.dose_range ?? null,
        note: 'F-05-Dosiswerte bleiben getrennt und sind keine Empfehlung.',
      },
      pharmacology: {},
      half_life: null,
      half_life_status: row.half_life_hours ? 'f05_value_not_imported_without_primary_source' : 'not_available_in_f05',
      cyp: {},
      lab_effects: [],
      nutrients_provided: {},
      nutrient_mapping_status: 'not_provided_by_f05',
      source_primary: 'f05_substance_candidate',
      raw: row,
    })
  } else {
    f05Matched++
  }
  addSource(sources, {
    substance_id: id,
    source_catalog: 'f05_substance_candidate',
    source_entity_id: row.name,
    source_label: row.name,
    relation: match ? 'alias_match_to_kimi' : 'own_record_no_kimi_match',
    confidence: match ? 'exact_alias_unique' : 'unmatched',
    source_ref: `${F05_CATALOG}#${row.name}`,
    field_sources: {
      half_life: row.half_life_hours ? 'not_imported_without_primary_source' : null,
      dose_range: row.dose_range ? 'f05_substance_catalog.dose_range' : null,
      upper_limit: row.upper_limit ? 'f05_substance_catalog.upper_limit' : null,
    },
    raw: row,
  })
}

let crossLinks = 0
let crossSkippedMedicationOwned = 0
for (const mapping of crossDomain.mappings ?? []) {
  const substanceId = typeof mapping.substance_id === 'string' ? mapping.substance_id : null
  const links = Array.isArray(mapping.medication_links) ? mapping.medication_links as JsonObject[] : []
  if (!substanceId) {
    crossSkippedMedicationOwned += links.length
    continue
  }
  for (const link of links) {
    crossLinks++
    addSource(sources, {
      substance_id: substanceId,
      source_catalog: 'cross_domain_substance_mapping',
      source_entity_id: String(link.drug_id ?? ''),
      source_label: String(link.medication_canonical_name ?? mapping.canonical_entity ?? substanceId),
      relation: String(link.relation ?? 'related'),
      confidence: 'curated_cross_domain_mapping',
      source_ref: `${CROSS_DOMAIN}#${substanceId}:${String(link.drug_id ?? '')}`,
      field_sources: { policy: mapping.policy ?? null },
      raw: { mapping, link },
    })
  }
}

const substanceRows = [...substances.values()].sort((a, b) => a.id.localeCompare(b.id))
const sourceRows = sources.sort((a, b) => `${a.substance_id}|${a.source_catalog}|${a.source_entity_id}`.localeCompare(`${b.substance_id}|${b.source_catalog}|${b.source_entity_id}`))

if (substanceRows.length !== 567) fail(`substance_catalog: ${substanceRows.length}, erwartet 567`)
if (sourceRows.length !== 667) fail(`substance_catalog_sources: ${sourceRows.length}, erwartet 667`)
if (localMatched !== 16 || localOwn !== 28) fail(`LumeOS Mapping ${localMatched}/${localOwn}, erwartet 16/28`)
if (f05Matched !== 72 || f05Own !== 248) fail(`F05 Mapping ${f05Matched}/${f05Own}, erwartet 72/248`)
if (crossLinks !== 12 || crossSkippedMedicationOwned !== 16) {
  fail(`Cross-Domain Links ${crossLinks}, medication-owned uebersprungen ${crossSkippedMedicationOwned}; erwartet 12/16`)
}

const substancePayload = substanceRows.map(row => csvCell(JSON.stringify(row))).join('\n')
const sourcePayload = sourceRows.map(row => csvCell(JSON.stringify(row))).join('\n')

const sql = `\\set ON_ERROR_STOP on
BEGIN;

CREATE TABLE IF NOT EXISTS supplements.substance_catalog (
  id                            TEXT PRIMARY KEY,
  canonical_name                TEXT NOT NULL CHECK (btrim(canonical_name) <> ''),
  domain                        TEXT NOT NULL CHECK (domain IN (
                                  'kimi_supplement', 'kimi_peptide', 'kimi_performance',
                                  'lumeos_local', 'f05_candidate'
                                )),
  compound_type                 TEXT,
  category                      TEXT,
  subcategory                   TEXT,
  chemical_form                 TEXT,
  aliases                       TEXT[] NOT NULL DEFAULT '{}',
  cas_number                    TEXT,
  external_ids                  JSONB NOT NULL DEFAULT '{}'::jsonb,
  platform_classes              TEXT[] NOT NULL DEFAULT '{}',
  platform                      JSONB NOT NULL DEFAULT '{}'::jsonb,
  evidence                      JSONB NOT NULL DEFAULT '{}'::jsonb,
  official_label_dose           JSONB,
  guideline_dose                JSONB,
  tolerable_upper_intake_level  JSONB,
  studied_dose_ranges           JSONB NOT NULL DEFAULT '[]'::jsonb,
  anecdotal_dose_ranges         JSONB NOT NULL DEFAULT '[]'::jsonb,
  dosing                        JSONB NOT NULL DEFAULT '{}'::jsonb,
  pharmacology                  JSONB NOT NULL DEFAULT '{}'::jsonb,
  half_life                     JSONB,
  half_life_status              TEXT NOT NULL,
  cyp                           JSONB NOT NULL DEFAULT '{}'::jsonb,
  lab_effects                   JSONB NOT NULL DEFAULT '[]'::jsonb,
  nutrients_provided            JSONB NOT NULL DEFAULT '{}'::jsonb,
  nutrient_mapping_status       TEXT NOT NULL,
  source_primary                TEXT NOT NULL,
  raw                           JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active                     BOOLEAN NOT NULL DEFAULT true,
  created_at                    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                    TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (jsonb_typeof(external_ids) = 'object'),
  CHECK (jsonb_typeof(platform) = 'object'),
  CHECK (jsonb_typeof(evidence) = 'object'),
  CHECK (official_label_dose IS NULL OR jsonb_typeof(official_label_dose) IN ('string', 'number', 'object', 'array')),
  CHECK (guideline_dose IS NULL OR jsonb_typeof(guideline_dose) IN ('string', 'number', 'object', 'array')),
  CHECK (tolerable_upper_intake_level IS NULL OR jsonb_typeof(tolerable_upper_intake_level) IN ('string', 'number', 'object', 'array')),
  CHECK (jsonb_typeof(studied_dose_ranges) = 'array'),
  CHECK (jsonb_typeof(anecdotal_dose_ranges) = 'array'),
  CHECK (jsonb_typeof(dosing) = 'object'),
  CHECK (jsonb_typeof(pharmacology) = 'object'),
  CHECK (half_life IS NULL OR jsonb_typeof(half_life) IN ('string', 'number', 'object', 'array')),
  CHECK (jsonb_typeof(cyp) = 'object'),
  CHECK (jsonb_typeof(lab_effects) = 'array'),
  CHECK (jsonb_typeof(nutrients_provided) = 'object'),
  CHECK (jsonb_typeof(raw) = 'object')
);

CREATE TABLE IF NOT EXISTS supplements.substance_catalog_sources (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  substance_id     TEXT NOT NULL REFERENCES supplements.substance_catalog(id) ON DELETE CASCADE,
  source_catalog   TEXT NOT NULL CHECK (source_catalog IN (
                   'kimi_supplement', 'kimi_peptide', 'kimi_performance',
                   'lumeos_supplement_catalog', 'f05_substance_candidate',
                   'cross_domain_substance_mapping'
                 )),
  source_entity_id TEXT NOT NULL,
  source_label     TEXT NOT NULL,
  relation         TEXT NOT NULL,
  confidence       TEXT NOT NULL,
  source_ref       TEXT NOT NULL,
  field_sources    JSONB NOT NULL DEFAULT '{}'::jsonb,
  raw              JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (source_catalog, source_entity_id, substance_id, relation),
  CHECK (jsonb_typeof(field_sources) = 'object'),
  CHECK (jsonb_typeof(raw) = 'object')
);

CREATE INDEX IF NOT EXISTS substance_catalog_domain_idx
  ON supplements.substance_catalog(domain);
CREATE INDEX IF NOT EXISTS substance_catalog_name_idx
  ON supplements.substance_catalog(canonical_name);
CREATE INDEX IF NOT EXISTS substance_catalog_external_ids_idx
  ON supplements.substance_catalog USING gin(external_ids);
CREATE INDEX IF NOT EXISTS substance_catalog_platform_classes_idx
  ON supplements.substance_catalog USING gin(platform_classes);
CREATE INDEX IF NOT EXISTS substance_catalog_sources_substance_idx
  ON supplements.substance_catalog_sources(substance_id);
CREATE INDEX IF NOT EXISTS substance_catalog_sources_source_idx
  ON supplements.substance_catalog_sources(source_catalog, source_entity_id);

DROP TRIGGER IF EXISTS substance_catalog_touch_updated_at
  ON supplements.substance_catalog;
CREATE TRIGGER substance_catalog_touch_updated_at
  BEFORE UPDATE ON supplements.substance_catalog
  FOR EACH ROW EXECUTE FUNCTION supplements.touch_updated_at();

DROP TRIGGER IF EXISTS substance_catalog_sources_touch_updated_at
  ON supplements.substance_catalog_sources;
CREATE TRIGGER substance_catalog_sources_touch_updated_at
  BEFORE UPDATE ON supplements.substance_catalog_sources
  FOR EACH ROW EXECUTE FUNCTION supplements.touch_updated_at();

ALTER TABLE supplements.substance_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplements.substance_catalog_sources ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS substance_catalog_select ON supplements.substance_catalog;
CREATE POLICY substance_catalog_select
  ON supplements.substance_catalog FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS substance_catalog_sources_select ON supplements.substance_catalog_sources;
CREATE POLICY substance_catalog_sources_select
  ON supplements.substance_catalog_sources FOR SELECT TO authenticated USING (true);

GRANT SELECT ON supplements.substance_catalog TO authenticated;
GRANT SELECT ON supplements.substance_catalog_sources TO authenticated;
GRANT ALL ON supplements.substance_catalog TO service_role;
GRANT ALL ON supplements.substance_catalog_sources TO service_role;

CREATE TEMP TABLE tmp_substance_catalog (
  payload JSONB NOT NULL
) ON COMMIT DROP;

\\copy tmp_substance_catalog(payload) FROM STDIN WITH (FORMAT csv)
${substancePayload}
\\.

CREATE TEMP TABLE tmp_substance_catalog_sources (
  payload JSONB NOT NULL
) ON COMMIT DROP;

\\copy tmp_substance_catalog_sources(payload) FROM STDIN WITH (FORMAT csv)
${sourcePayload}
\\.

INSERT INTO supplements.substance_catalog (
  id, canonical_name, domain, compound_type, category, subcategory,
  chemical_form, aliases, cas_number, external_ids, platform_classes,
  platform, evidence, official_label_dose, guideline_dose,
  tolerable_upper_intake_level, studied_dose_ranges, anecdotal_dose_ranges,
  dosing, pharmacology, half_life, half_life_status, cyp, lab_effects,
  nutrients_provided, nutrient_mapping_status, source_primary, raw
)
SELECT
  payload->>'id',
  payload->>'canonical_name',
  payload->>'domain',
  NULLIF(payload->>'compound_type', ''),
  NULLIF(payload->>'category', ''),
  NULLIF(payload->>'subcategory', ''),
  NULLIF(payload->>'chemical_form', ''),
  COALESCE(ARRAY(SELECT jsonb_array_elements_text(COALESCE(payload->'aliases', '[]'::jsonb))), '{}'),
  NULLIF(payload->>'cas_number', ''),
  COALESCE(payload->'external_ids', '{}'::jsonb),
  COALESCE(ARRAY(SELECT jsonb_array_elements_text(COALESCE(payload->'platform_classes', '[]'::jsonb))), '{}'),
  COALESCE(payload->'platform', '{}'::jsonb),
  COALESCE(payload->'evidence', '{}'::jsonb),
  NULLIF(payload->'official_label_dose', 'null'::jsonb),
  NULLIF(payload->'guideline_dose', 'null'::jsonb),
  NULLIF(payload->'tolerable_upper_intake_level', 'null'::jsonb),
  COALESCE(payload->'studied_dose_ranges', '[]'::jsonb),
  COALESCE(payload->'anecdotal_dose_ranges', '[]'::jsonb),
  COALESCE(payload->'dosing', '{}'::jsonb),
  COALESCE(payload->'pharmacology', '{}'::jsonb),
  NULLIF(payload->'half_life', 'null'::jsonb),
  payload->>'half_life_status',
  COALESCE(payload->'cyp', '{}'::jsonb),
  COALESCE(payload->'lab_effects', '[]'::jsonb),
  COALESCE(payload->'nutrients_provided', '{}'::jsonb),
  payload->>'nutrient_mapping_status',
  payload->>'source_primary',
  COALESCE(payload->'raw', '{}'::jsonb)
FROM tmp_substance_catalog
ON CONFLICT (id) DO UPDATE SET
  canonical_name = EXCLUDED.canonical_name,
  domain = EXCLUDED.domain,
  compound_type = EXCLUDED.compound_type,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  chemical_form = EXCLUDED.chemical_form,
  aliases = EXCLUDED.aliases,
  cas_number = EXCLUDED.cas_number,
  external_ids = EXCLUDED.external_ids,
  platform_classes = EXCLUDED.platform_classes,
  platform = EXCLUDED.platform,
  evidence = EXCLUDED.evidence,
  official_label_dose = EXCLUDED.official_label_dose,
  guideline_dose = EXCLUDED.guideline_dose,
  tolerable_upper_intake_level = EXCLUDED.tolerable_upper_intake_level,
  studied_dose_ranges = EXCLUDED.studied_dose_ranges,
  anecdotal_dose_ranges = EXCLUDED.anecdotal_dose_ranges,
  dosing = EXCLUDED.dosing,
  pharmacology = EXCLUDED.pharmacology,
  half_life = EXCLUDED.half_life,
  half_life_status = EXCLUDED.half_life_status,
  cyp = EXCLUDED.cyp,
  lab_effects = EXCLUDED.lab_effects,
  nutrients_provided = EXCLUDED.nutrients_provided,
  nutrient_mapping_status = EXCLUDED.nutrient_mapping_status,
  source_primary = EXCLUDED.source_primary,
  raw = EXCLUDED.raw,
  is_active = true,
  updated_at = now();

DELETE FROM supplements.substance_catalog_sources;

INSERT INTO supplements.substance_catalog_sources (
  substance_id, source_catalog, source_entity_id, source_label,
  relation, confidence, source_ref, field_sources, raw
)
SELECT
  payload->>'substance_id',
  payload->>'source_catalog',
  payload->>'source_entity_id',
  payload->>'source_label',
  payload->>'relation',
  payload->>'confidence',
  payload->>'source_ref',
  COALESCE(payload->'field_sources', '{}'::jsonb),
  COALESCE(payload->'raw', '{}'::jsonb)
FROM tmp_substance_catalog_sources
ON CONFLICT (source_catalog, source_entity_id, substance_id, relation) DO UPDATE SET
  source_label = EXCLUDED.source_label,
  confidence = EXCLUDED.confidence,
  source_ref = EXCLUDED.source_ref,
  field_sources = EXCLUDED.field_sources,
  raw = EXCLUDED.raw,
  updated_at = now();

DO $$
DECLARE
  v_substances integer;
  v_sources integer;
  v_kimi integer;
  v_local_sources integer;
  v_f05_sources integer;
  v_with_nutrients integer;
  v_with_half_life integer;
BEGIN
  SELECT count(*) INTO v_substances FROM supplements.substance_catalog;
  SELECT count(*) INTO v_sources FROM supplements.substance_catalog_sources;
  SELECT count(*) INTO v_kimi FROM supplements.substance_catalog WHERE domain LIKE 'kimi_%';
  SELECT count(*) INTO v_local_sources FROM supplements.substance_catalog_sources WHERE source_catalog = 'lumeos_supplement_catalog';
  SELECT count(*) INTO v_f05_sources FROM supplements.substance_catalog_sources WHERE source_catalog = 'f05_substance_candidate';
  SELECT count(*) INTO v_with_nutrients FROM supplements.substance_catalog WHERE nutrients_provided <> '{}'::jsonb;
  SELECT count(*) INTO v_with_half_life FROM supplements.substance_catalog WHERE half_life IS NOT NULL;

  IF v_substances <> ${substanceRows.length} THEN
    RAISE EXCEPTION 'substance_catalog: %, erwartet ${substanceRows.length}', v_substances;
  END IF;
  IF v_sources <> ${sourceRows.length} THEN
    RAISE EXCEPTION 'substance_catalog_sources: %, erwartet ${sourceRows.length}', v_sources;
  END IF;
  IF v_kimi <> 291 THEN
    RAISE EXCEPTION 'substance_catalog Kimi: %, erwartet 291', v_kimi;
  END IF;
  IF v_local_sources <> 44 THEN
    RAISE EXCEPTION 'substance_catalog_sources LumeOS: %, erwartet 44', v_local_sources;
  END IF;
  IF v_f05_sources <> 320 THEN
    RAISE EXCEPTION 'substance_catalog_sources F05: %, erwartet 320', v_f05_sources;
  END IF;

  RAISE NOTICE 'OK C-134: % Substanzen, % Herkunftszeilen, % mit nutrients_provided, % mit Halbwertszeit',
    v_substances, v_sources, v_with_nutrients, v_with_half_life;
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

console.log(`C-134: ${substanceRows.length} Substanzen; Kimi 291, LumeOS 44 (${localMatched} gemappt, ${localOwn} eigen), F-05 320 (${f05Matched} gemappt, ${f05Own} eigen), Cross-Domain ${crossLinks} Links`)
