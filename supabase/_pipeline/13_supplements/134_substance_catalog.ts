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
const MIN_KIMI_SUBSTANCE_COUNT = 290

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
  safety?: JsonObject
  interactions?: JsonObject
  regulatory?: JsonObject
  quality?: JsonObject
  warning_triggers?: JsonObject
  evidence_provenance?: JsonObject
  monitoring?: JsonObject
  cyp?: JsonObject
  lab_effects?: unknown[]
  missing_fields?: unknown[]
  missing_reason?: JsonObject
  last_verified?: string | null
  needs_review?: unknown[]
  confidence?: unknown
  source_count?: unknown
  primary_source_count?: unknown
  molecular_weight?: unknown
  peptide_sequence?: string | null
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
  safety: JsonObject | null
  interactions: JsonObject | null
  regulatory: JsonObject | null
  quality: JsonObject | null
  warning_triggers: JsonObject | null
  evidence_provenance: JsonObject | null
  wada_status: string | null
  prescription_required: boolean | null
  dose_ceiling_value: number | null
  dose_ceiling_unit: string | null
  recommendable: boolean | null
  warning_only: boolean | null
  physician_referral: boolean | null
  athlete_flag: boolean | null
  missing_fields: unknown[] | null
  missing_reason: JsonObject | null
  last_verified: string | null
  needs_review: unknown[] | null
  confidence: number | null
  source_count: number | null
  primary_source_count: number | null
  unii: string | null
  pubchem_cid: number | null
  chembl_id: string | null
  inchikey: string | null
  molecular_formula: string | null
  cas_candidates: string[] | null
  molecular_weight: number | null
  peptide_sequence: string | null
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
  if (!fs.existsSync(file)) fail(`${file} fehlt. C-134 braucht den Kimi-Bestand.`)
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

function meaningful(value: unknown): boolean {
  if (value === null || value === undefined || value === '') return false
  if (Array.isArray(value)) return value.some(meaningful)
  if (typeof value === 'object') return Object.values(value as JsonObject).some(meaningful)
  return true
}

function nullableObject(value: unknown): JsonObject | null {
  const object = objectValue(value)
  return meaningful(object) ? object : null
}

function nullableArray(value: unknown): unknown[] | null {
  return Array.isArray(value) && meaningful(value) ? value : null
}

function nullableText(value: unknown): string | null {
  return value === null || value === undefined || value === '' ? null : String(value)
}

function nullableNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && /^-?\d+(\.\d+)?$/.test(value.trim())) return Number(value.trim())
  return null
}

function nullableBoolean(value: unknown): boolean | null {
  return typeof value === 'boolean' ? value : null
}

function doseCeilingParts(warningTriggers: JsonObject): { value: number | null; unit: string | null } {
  const ceiling = objectValue(warningTriggers.dose_ceiling)
  const rawValue = ceiling.value
  if (typeof rawValue === 'number' && Number.isFinite(rawValue)) {
    return { value: rawValue, unit: nullableText(ceiling.unit) }
  }
  if (typeof rawValue !== 'string') return { value: null, unit: null }
  const match = rawValue.match(/(\d+(?:[.,]\d+)?)\s*([a-zA-Zµμ]+(?:\s*RAE|\s*DFE)?(?:\/(?:d|day))?)/)
  if (!match) return { value: null, unit: nullableText(ceiling.unit) }
  return {
    value: Number(match[1]!.replace(',', '.')),
    unit: nullableText(ceiling.unit) ?? match[2]!.replace(/\s+/g, ' ').trim(),
  }
}

function deterministicId(prefix: string, value: string): string {
  return `${prefix}_${fold(value).replace(/\s+/g, '_').slice(0, 120)}`
}

function dosePart(dosing: JsonObject, key: string): unknown {
  return dosing[key] ?? null
}

function emptyLiftedFields(): Pick<SubstanceRow,
  'safety' | 'interactions' | 'regulatory' | 'quality' | 'warning_triggers' | 'evidence_provenance' |
  'wada_status' | 'prescription_required' | 'dose_ceiling_value' | 'dose_ceiling_unit' |
  'recommendable' | 'warning_only' | 'physician_referral' | 'athlete_flag' |
  'missing_fields' | 'missing_reason' | 'last_verified' | 'needs_review' | 'confidence' |
  'source_count' | 'primary_source_count' | 'unii' | 'pubchem_cid' | 'chembl_id' |
  'inchikey' | 'molecular_formula' | 'cas_candidates' | 'molecular_weight' | 'peptide_sequence'
> {
  return {
    safety: null,
    interactions: null,
    regulatory: null,
    quality: null,
    warning_triggers: null,
    evidence_provenance: null,
    wada_status: null,
    prescription_required: null,
    dose_ceiling_value: null,
    dose_ceiling_unit: null,
    recommendable: null,
    warning_only: null,
    physician_referral: null,
    athlete_flag: null,
    missing_fields: null,
    missing_reason: null,
    last_verified: null,
    needs_review: null,
    confidence: null,
    source_count: null,
    primary_source_count: null,
    unii: null,
    pubchem_cid: null,
    chembl_id: null,
    inchikey: null,
    molecular_formula: null,
    cas_candidates: null,
    molecular_weight: null,
    peptide_sequence: null,
  }
}

function liftedFields(row: KimiSubstance & { domain: string }): ReturnType<typeof emptyLiftedFields> {
  const regulatory = nullableObject(row.regulatory)
  const warningTriggers = nullableObject(row.warning_triggers)
  const platform = objectValue(row.platform)
  const external = nullableObject(row.external_ids)
  const doseCeiling = doseCeilingParts(warningTriggers ?? {})
  const isPerformance = row.domain === 'kimi_performance'
  return {
    safety: nullableObject(row.safety),
    interactions: nullableObject(row.interactions),
    regulatory,
    quality: nullableObject(row.quality),
    warning_triggers: warningTriggers,
    evidence_provenance: nullableObject(row.evidence_provenance),
    wada_status: nullableText(regulatory?.wada_status),
    prescription_required: isPerformance ? null : nullableBoolean(regulatory?.prescription_required),
    dose_ceiling_value: doseCeiling.value,
    dose_ceiling_unit: doseCeiling.unit,
    recommendable: nullableBoolean(platform.recommendable),
    warning_only: nullableBoolean(platform.warning_only),
    physician_referral: nullableBoolean(platform.physician_referral),
    athlete_flag: nullableBoolean(platform.athlete_flag),
    missing_fields: nullableArray(row.missing_fields),
    missing_reason: nullableObject(row.missing_reason),
    last_verified: nullableText(row.last_verified),
    needs_review: nullableArray(row.needs_review),
    confidence: nullableNumber(row.confidence),
    source_count: nullableNumber(row.source_count),
    primary_source_count: nullableNumber(row.primary_source_count),
    unii: nullableText(external?.UNII),
    pubchem_cid: nullableNumber(external?.PubChem_CID),
    chembl_id: nullableText(external?.ChEMBL_ID),
    inchikey: nullableText(external?.InChIKey),
    molecular_formula: nullableText(external?.molecular_formula),
    cas_candidates: textArray(external?.cas_candidates).length ? textArray(external?.cas_candidates) : null,
    molecular_weight: nullableNumber(row.molecular_weight),
    peptide_sequence: nullableText(row.peptide_sequence),
  }
}

function buildKimiRows(): Array<KimiSubstance & { domain: string; sourceFile: string }> {
  const specs = [
    { domain: 'kimi_supplement', file: 'supplements.jsonl', expected: 154 },
    { domain: 'kimi_peptide', file: 'peptides.jsonl', expected: 61 },
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
  if (rows.length < MIN_KIMI_SUBSTANCE_COUNT || ids.size < MIN_KIMI_SUBSTANCE_COUNT || rows.length !== ids.size) {
    fail(`Kimi-Bestand: ${rows.length} Zeilen / ${ids.size} IDs, erwartet mindestens ${MIN_KIMI_SUBSTANCE_COUNT} eindeutig`)
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
  const lifted = liftedFields(row)
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
    external_ids: nullableObject(row.external_ids) ?? {},
    platform_classes: textArray(row.platform_classes),
    platform: objectValue(row.platform),
    evidence: objectValue(row.evidence),
    official_label_dose: dosePart(dosing, 'official_label_dose'),
    guideline_dose: dosePart(dosing, 'guideline_dose'),
    tolerable_upper_intake_level: dosePart(dosing, 'tolerable_upper_intake_level'),
    studied_dose_ranges: dosePart(dosing, 'studied_dose_ranges') ?? [],
    anecdotal_dose_ranges: dosePart(dosing, 'anecdotal_dose_ranges') ?? [],
    dosing: nullableObject(row.dosing) ?? {},
    pharmacology: nullableObject(row.pharmacology) ?? {},
    half_life: hasHalfLife ? pharmacology.half_life : null,
    half_life_status: hasHalfLife ? 'from_kimi_source' : 'not_available_in_free_authoritative_source',
    cyp: objectValue(row.cyp),
    lab_effects: row.lab_effects ?? [],
    nutrients_provided: {},
    nutrient_mapping_status: 'not_provided_by_kimi_crawl_027',
    ...lifted,
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
      identifiers: 'crawl_027.external_ids',
      dosing: 'crawl_027.dosing',
      half_life: hasHalfLife ? 'crawl_027.pharmacology.half_life' : 'explicit_null_no_free_authoritative_source',
      cyp: row.cyp ? 'crawl_027.chembl_assays' : null,
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
      ...emptyLiftedFields(),
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
      dosing: {},
      pharmacology: {},
      half_life: null,
      half_life_status: row.half_life_hours ? 'f05_value_not_imported_without_primary_source' : 'not_available_in_f05',
      cyp: {},
      lab_effects: [],
      nutrients_provided: {},
      nutrient_mapping_status: 'not_provided_by_f05',
      ...emptyLiftedFields(),
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

const expectedSubstanceRows = kimiRows.length + localOwn + f05Own
const expectedSourceRows = kimiRows.length + local.supplements.length + f05.substances.length + crossLinks

if (substanceRows.length !== expectedSubstanceRows) fail(`substance_catalog: ${substanceRows.length}, erwartet ${expectedSubstanceRows}`)
if (sourceRows.length !== expectedSourceRows) fail(`substance_catalog_sources: ${sourceRows.length}, erwartet ${expectedSourceRows}`)
if (localMatched < 16 || localOwn + localMatched !== 44) fail(`LumeOS Mapping ${localMatched}/${localOwn}, erwartet mindestens 16 Treffer und 44 gesamt`)
if (f05Matched < 72 || f05Own + f05Matched !== 320) fail(`F05 Mapping ${f05Matched}/${f05Own}, erwartet mindestens 72 Treffer und 320 gesamt`)
if (crossLinks < 12 || crossSkippedMedicationOwned < 16) {
  fail(`Cross-Domain Links ${crossLinks}, medication-owned uebersprungen ${crossSkippedMedicationOwned}; erwartet mindestens 12/16`)
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
  safety                        JSONB,
  interactions                  JSONB,
  regulatory                    JSONB,
  quality                       JSONB,
  warning_triggers              JSONB,
  evidence_provenance           JSONB,
  wada_status                   TEXT,
  prescription_required         BOOLEAN,
  dose_ceiling_value            NUMERIC,
  dose_ceiling_unit             TEXT,
  recommendable                 BOOLEAN,
  warning_only                  BOOLEAN,
  physician_referral            BOOLEAN,
  athlete_flag                  BOOLEAN,
  missing_fields                JSONB,
  missing_reason                JSONB,
  last_verified                 DATE,
  needs_review                  JSONB,
  confidence                    NUMERIC,
  source_count                  INTEGER,
  primary_source_count          INTEGER,
  unii                          TEXT,
  pubchem_cid                   BIGINT,
  chembl_id                     TEXT,
  inchikey                      TEXT,
  molecular_formula             TEXT,
  cas_candidates                TEXT[],
  molecular_weight              NUMERIC,
  peptide_sequence              TEXT,
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
  CHECK (safety IS NULL OR jsonb_typeof(safety) = 'object'),
  CHECK (interactions IS NULL OR jsonb_typeof(interactions) = 'object'),
  CHECK (regulatory IS NULL OR jsonb_typeof(regulatory) = 'object'),
  CHECK (quality IS NULL OR jsonb_typeof(quality) = 'object'),
  CHECK (warning_triggers IS NULL OR jsonb_typeof(warning_triggers) = 'object'),
  CHECK (evidence_provenance IS NULL OR jsonb_typeof(evidence_provenance) = 'object'),
  CHECK (missing_fields IS NULL OR jsonb_typeof(missing_fields) = 'array'),
  CHECK (missing_reason IS NULL OR jsonb_typeof(missing_reason) = 'object'),
  CHECK (needs_review IS NULL OR jsonb_typeof(needs_review) = 'array'),
  CHECK (confidence IS NULL OR (confidence >= 0 AND confidence <= 1)),
  CHECK (source_count IS NULL OR source_count >= 0),
  CHECK (primary_source_count IS NULL OR primary_source_count >= 0),
  CHECK (wada_status IS NULL OR wada_status IN ('prohibited', 'monitored', 'not_prohibited')),
  CHECK (jsonb_typeof(raw) = 'object')
);

ALTER TABLE supplements.substance_catalog
  ADD COLUMN IF NOT EXISTS safety JSONB,
  ADD COLUMN IF NOT EXISTS interactions JSONB,
  ADD COLUMN IF NOT EXISTS regulatory JSONB,
  ADD COLUMN IF NOT EXISTS quality JSONB,
  ADD COLUMN IF NOT EXISTS warning_triggers JSONB,
  ADD COLUMN IF NOT EXISTS evidence_provenance JSONB,
  ADD COLUMN IF NOT EXISTS wada_status TEXT,
  ADD COLUMN IF NOT EXISTS prescription_required BOOLEAN,
  ADD COLUMN IF NOT EXISTS dose_ceiling_value NUMERIC,
  ADD COLUMN IF NOT EXISTS dose_ceiling_unit TEXT,
  ADD COLUMN IF NOT EXISTS recommendable BOOLEAN,
  ADD COLUMN IF NOT EXISTS warning_only BOOLEAN,
  ADD COLUMN IF NOT EXISTS physician_referral BOOLEAN,
  ADD COLUMN IF NOT EXISTS athlete_flag BOOLEAN,
  ADD COLUMN IF NOT EXISTS missing_fields JSONB,
  ADD COLUMN IF NOT EXISTS missing_reason JSONB,
  ADD COLUMN IF NOT EXISTS last_verified DATE,
  ADD COLUMN IF NOT EXISTS needs_review JSONB,
  ADD COLUMN IF NOT EXISTS confidence NUMERIC,
  ADD COLUMN IF NOT EXISTS source_count INTEGER,
  ADD COLUMN IF NOT EXISTS primary_source_count INTEGER,
  ADD COLUMN IF NOT EXISTS unii TEXT,
  ADD COLUMN IF NOT EXISTS pubchem_cid BIGINT,
  ADD COLUMN IF NOT EXISTS chembl_id TEXT,
  ADD COLUMN IF NOT EXISTS inchikey TEXT,
  ADD COLUMN IF NOT EXISTS molecular_formula TEXT,
  ADD COLUMN IF NOT EXISTS cas_candidates TEXT[],
  ADD COLUMN IF NOT EXISTS molecular_weight NUMERIC,
  ADD COLUMN IF NOT EXISTS peptide_sequence TEXT;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'substance_catalog_safety_json_check') THEN
    ALTER TABLE supplements.substance_catalog
      ADD CONSTRAINT substance_catalog_safety_json_check
      CHECK (safety IS NULL OR jsonb_typeof(safety) = 'object');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'substance_catalog_interactions_json_check') THEN
    ALTER TABLE supplements.substance_catalog
      ADD CONSTRAINT substance_catalog_interactions_json_check
      CHECK (interactions IS NULL OR jsonb_typeof(interactions) = 'object');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'substance_catalog_regulatory_json_check') THEN
    ALTER TABLE supplements.substance_catalog
      ADD CONSTRAINT substance_catalog_regulatory_json_check
      CHECK (regulatory IS NULL OR jsonb_typeof(regulatory) = 'object');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'substance_catalog_quality_json_check') THEN
    ALTER TABLE supplements.substance_catalog
      ADD CONSTRAINT substance_catalog_quality_json_check
      CHECK (quality IS NULL OR jsonb_typeof(quality) = 'object');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'substance_catalog_warning_triggers_json_check') THEN
    ALTER TABLE supplements.substance_catalog
      ADD CONSTRAINT substance_catalog_warning_triggers_json_check
      CHECK (warning_triggers IS NULL OR jsonb_typeof(warning_triggers) = 'object');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'substance_catalog_evidence_provenance_json_check') THEN
    ALTER TABLE supplements.substance_catalog
      ADD CONSTRAINT substance_catalog_evidence_provenance_json_check
      CHECK (evidence_provenance IS NULL OR jsonb_typeof(evidence_provenance) = 'object');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'substance_catalog_missing_fields_json_check') THEN
    ALTER TABLE supplements.substance_catalog
      ADD CONSTRAINT substance_catalog_missing_fields_json_check
      CHECK (missing_fields IS NULL OR jsonb_typeof(missing_fields) = 'array');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'substance_catalog_missing_reason_json_check') THEN
    ALTER TABLE supplements.substance_catalog
      ADD CONSTRAINT substance_catalog_missing_reason_json_check
      CHECK (missing_reason IS NULL OR jsonb_typeof(missing_reason) = 'object');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'substance_catalog_needs_review_json_check') THEN
    ALTER TABLE supplements.substance_catalog
      ADD CONSTRAINT substance_catalog_needs_review_json_check
      CHECK (needs_review IS NULL OR jsonb_typeof(needs_review) = 'array');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'substance_catalog_confidence_range_check') THEN
    ALTER TABLE supplements.substance_catalog
      ADD CONSTRAINT substance_catalog_confidence_range_check
      CHECK (confidence IS NULL OR (confidence >= 0 AND confidence <= 1));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'substance_catalog_source_count_check') THEN
    ALTER TABLE supplements.substance_catalog
      ADD CONSTRAINT substance_catalog_source_count_check
      CHECK (source_count IS NULL OR source_count >= 0);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'substance_catalog_primary_source_count_check') THEN
    ALTER TABLE supplements.substance_catalog
      ADD CONSTRAINT substance_catalog_primary_source_count_check
      CHECK (primary_source_count IS NULL OR primary_source_count >= 0);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'substance_catalog_wada_status_check') THEN
    ALTER TABLE supplements.substance_catalog
      ADD CONSTRAINT substance_catalog_wada_status_check
      CHECK (wada_status IS NULL OR wada_status IN ('prohibited', 'monitored', 'not_prohibited'));
  END IF;
END $$;

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
CREATE INDEX IF NOT EXISTS substance_catalog_wada_status_idx
  ON supplements.substance_catalog(wada_status)
  WHERE wada_status IS NOT NULL;
CREATE INDEX IF NOT EXISTS substance_catalog_prescription_required_idx
  ON supplements.substance_catalog(prescription_required)
  WHERE prescription_required IS NOT NULL;
CREATE INDEX IF NOT EXISTS substance_catalog_platform_flags_idx
  ON supplements.substance_catalog(recommendable, warning_only, physician_referral, athlete_flag);
CREATE INDEX IF NOT EXISTS substance_catalog_dose_ceiling_idx
  ON supplements.substance_catalog(dose_ceiling_value)
  WHERE dose_ceiling_value IS NOT NULL;
CREATE INDEX IF NOT EXISTS substance_catalog_unii_idx
  ON supplements.substance_catalog(unii)
  WHERE unii IS NOT NULL;
CREATE INDEX IF NOT EXISTS substance_catalog_pubchem_idx
  ON supplements.substance_catalog(pubchem_cid)
  WHERE pubchem_cid IS NOT NULL;
CREATE INDEX IF NOT EXISTS substance_catalog_chembl_idx
  ON supplements.substance_catalog(chembl_id)
  WHERE chembl_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS substance_catalog_inchikey_idx
  ON supplements.substance_catalog(inchikey)
  WHERE inchikey IS NOT NULL;
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

DELETE FROM supplements.substance_catalog
WHERE id NOT IN (
  SELECT payload->>'id'
  FROM tmp_substance_catalog
);

INSERT INTO supplements.substance_catalog (
  id, canonical_name, domain, compound_type, category, subcategory,
  chemical_form, aliases, cas_number, external_ids, platform_classes,
  platform, evidence, official_label_dose, guideline_dose,
  tolerable_upper_intake_level, studied_dose_ranges, anecdotal_dose_ranges,
  dosing, pharmacology, half_life, half_life_status, cyp, lab_effects,
  nutrients_provided, nutrient_mapping_status,
  safety, interactions, regulatory, quality, warning_triggers, evidence_provenance,
  wada_status, prescription_required, dose_ceiling_value, dose_ceiling_unit,
  recommendable, warning_only, physician_referral, athlete_flag,
  missing_fields, missing_reason, last_verified, needs_review, confidence,
  source_count, primary_source_count, unii, pubchem_cid, chembl_id,
  inchikey, molecular_formula, cas_candidates, molecular_weight, peptide_sequence,
  source_primary, raw
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
  NULLIF(payload->'safety', 'null'::jsonb),
  NULLIF(payload->'interactions', 'null'::jsonb),
  NULLIF(payload->'regulatory', 'null'::jsonb),
  NULLIF(payload->'quality', 'null'::jsonb),
  NULLIF(payload->'warning_triggers', 'null'::jsonb),
  NULLIF(payload->'evidence_provenance', 'null'::jsonb),
  NULLIF(payload->>'wada_status', ''),
  NULLIF(payload->>'prescription_required', '')::boolean,
  NULLIF(payload->>'dose_ceiling_value', '')::numeric,
  NULLIF(payload->>'dose_ceiling_unit', ''),
  NULLIF(payload->>'recommendable', '')::boolean,
  NULLIF(payload->>'warning_only', '')::boolean,
  NULLIF(payload->>'physician_referral', '')::boolean,
  NULLIF(payload->>'athlete_flag', '')::boolean,
  NULLIF(payload->'missing_fields', 'null'::jsonb),
  NULLIF(payload->'missing_reason', 'null'::jsonb),
  NULLIF(payload->>'last_verified', '')::date,
  NULLIF(payload->'needs_review', 'null'::jsonb),
  NULLIF(payload->>'confidence', '')::numeric,
  NULLIF(payload->>'source_count', '')::integer,
  NULLIF(payload->>'primary_source_count', '')::integer,
  NULLIF(payload->>'unii', ''),
  NULLIF(payload->>'pubchem_cid', '')::bigint,
  NULLIF(payload->>'chembl_id', ''),
  NULLIF(payload->>'inchikey', ''),
  NULLIF(payload->>'molecular_formula', ''),
  CASE
    WHEN payload->'cas_candidates' IS NULL OR payload->'cas_candidates' = 'null'::jsonb THEN NULL::text[]
    ELSE ARRAY(SELECT jsonb_array_elements_text(payload->'cas_candidates'))
  END,
  NULLIF(payload->>'molecular_weight', '')::numeric,
  NULLIF(payload->>'peptide_sequence', ''),
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
  safety = EXCLUDED.safety,
  interactions = EXCLUDED.interactions,
  regulatory = EXCLUDED.regulatory,
  quality = EXCLUDED.quality,
  warning_triggers = EXCLUDED.warning_triggers,
  evidence_provenance = EXCLUDED.evidence_provenance,
  wada_status = EXCLUDED.wada_status,
  prescription_required = EXCLUDED.prescription_required,
  dose_ceiling_value = EXCLUDED.dose_ceiling_value,
  dose_ceiling_unit = EXCLUDED.dose_ceiling_unit,
  recommendable = EXCLUDED.recommendable,
  warning_only = EXCLUDED.warning_only,
  physician_referral = EXCLUDED.physician_referral,
  athlete_flag = EXCLUDED.athlete_flag,
  missing_fields = EXCLUDED.missing_fields,
  missing_reason = EXCLUDED.missing_reason,
  last_verified = EXCLUDED.last_verified,
  needs_review = EXCLUDED.needs_review,
  confidence = EXCLUDED.confidence,
  source_count = EXCLUDED.source_count,
  primary_source_count = EXCLUDED.primary_source_count,
  unii = EXCLUDED.unii,
  pubchem_cid = EXCLUDED.pubchem_cid,
  chembl_id = EXCLUDED.chembl_id,
  inchikey = EXCLUDED.inchikey,
  molecular_formula = EXCLUDED.molecular_formula,
  cas_candidates = EXCLUDED.cas_candidates,
  molecular_weight = EXCLUDED.molecular_weight,
  peptide_sequence = EXCLUDED.peptide_sequence,
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
  v_columns integer;
  v_non_kimi_lifted integer;
  v_safety integer;
  v_regulatory integer;
  v_warning_triggers integer;
  v_evidence_provenance integer;
  v_external_ids integer;
  v_quality integer;
  v_pharmacology integer;
  v_dosing integer;
  v_interactions integer;
  v_wada_status integer;
  v_prescription_required integer;
  v_dose_ceiling_value integer;
  v_recommendable integer;
  v_warning_only integer;
  v_physician_referral integer;
  v_athlete_flag integer;
  v_unii integer;
  v_pubchem_cid integer;
  v_chembl_id integer;
  v_inchikey integer;
  v_molecular_formula integer;
  v_cas_candidates integer;
  v_molecular_weight integer;
  v_peptide_sequence integer;
BEGIN
  SELECT count(*) INTO v_substances FROM supplements.substance_catalog;
  SELECT count(*) INTO v_sources FROM supplements.substance_catalog_sources;
  SELECT count(*) INTO v_kimi FROM supplements.substance_catalog WHERE domain LIKE 'kimi_%';
  SELECT count(*) INTO v_local_sources FROM supplements.substance_catalog_sources WHERE source_catalog = 'lumeos_supplement_catalog';
  SELECT count(*) INTO v_f05_sources FROM supplements.substance_catalog_sources WHERE source_catalog = 'f05_substance_candidate';
  SELECT count(*) INTO v_with_nutrients FROM supplements.substance_catalog WHERE nutrients_provided <> '{}'::jsonb;
  SELECT count(*) INTO v_with_half_life FROM supplements.substance_catalog WHERE half_life IS NOT NULL;
  SELECT count(*) INTO v_columns
  FROM information_schema.columns
  WHERE table_schema = 'supplements'
    AND table_name = 'substance_catalog';
  SELECT count(*) INTO v_non_kimi_lifted
  FROM supplements.substance_catalog
  WHERE domain NOT LIKE 'kimi_%'
    AND (
      safety IS NOT NULL
      OR interactions IS NOT NULL
      OR regulatory IS NOT NULL
      OR quality IS NOT NULL
      OR warning_triggers IS NOT NULL
      OR evidence_provenance IS NOT NULL
      OR wada_status IS NOT NULL
      OR prescription_required IS NOT NULL
      OR dose_ceiling_value IS NOT NULL
      OR dose_ceiling_unit IS NOT NULL
      OR recommendable IS NOT NULL
      OR warning_only IS NOT NULL
      OR physician_referral IS NOT NULL
      OR athlete_flag IS NOT NULL
      OR missing_fields IS NOT NULL
      OR missing_reason IS NOT NULL
      OR last_verified IS NOT NULL
      OR needs_review IS NOT NULL
      OR confidence IS NOT NULL
      OR source_count IS NOT NULL
      OR primary_source_count IS NOT NULL
      OR unii IS NOT NULL
      OR pubchem_cid IS NOT NULL
      OR chembl_id IS NOT NULL
      OR inchikey IS NOT NULL
      OR molecular_formula IS NOT NULL
      OR cas_candidates IS NOT NULL
      OR molecular_weight IS NOT NULL
      OR peptide_sequence IS NOT NULL
    );
  SELECT count(*) INTO v_safety FROM supplements.substance_catalog WHERE safety IS NOT NULL;
  SELECT count(*) INTO v_regulatory FROM supplements.substance_catalog WHERE regulatory IS NOT NULL;
  SELECT count(*) INTO v_warning_triggers FROM supplements.substance_catalog WHERE warning_triggers IS NOT NULL;
  SELECT count(*) INTO v_evidence_provenance FROM supplements.substance_catalog WHERE evidence_provenance IS NOT NULL;
  SELECT count(*) INTO v_external_ids FROM supplements.substance_catalog WHERE external_ids <> '{}'::jsonb;
  SELECT count(*) INTO v_quality FROM supplements.substance_catalog WHERE quality IS NOT NULL;
  SELECT count(*) INTO v_pharmacology FROM supplements.substance_catalog WHERE pharmacology <> '{}'::jsonb;
  SELECT count(*) INTO v_dosing FROM supplements.substance_catalog WHERE dosing <> '{}'::jsonb;
  SELECT count(*) INTO v_interactions FROM supplements.substance_catalog WHERE interactions IS NOT NULL;
  SELECT count(*) INTO v_wada_status FROM supplements.substance_catalog WHERE wada_status IS NOT NULL;
  SELECT count(*) INTO v_prescription_required FROM supplements.substance_catalog WHERE prescription_required IS NOT NULL;
  SELECT count(*) INTO v_dose_ceiling_value FROM supplements.substance_catalog WHERE dose_ceiling_value IS NOT NULL;
  SELECT count(*) INTO v_recommendable FROM supplements.substance_catalog WHERE recommendable IS NOT NULL;
  SELECT count(*) INTO v_warning_only FROM supplements.substance_catalog WHERE warning_only IS NOT NULL;
  SELECT count(*) INTO v_physician_referral FROM supplements.substance_catalog WHERE physician_referral IS NOT NULL;
  SELECT count(*) INTO v_athlete_flag FROM supplements.substance_catalog WHERE athlete_flag IS NOT NULL;
  SELECT count(*) INTO v_unii FROM supplements.substance_catalog WHERE unii IS NOT NULL;
  SELECT count(*) INTO v_pubchem_cid FROM supplements.substance_catalog WHERE pubchem_cid IS NOT NULL;
  SELECT count(*) INTO v_chembl_id FROM supplements.substance_catalog WHERE chembl_id IS NOT NULL;
  SELECT count(*) INTO v_inchikey FROM supplements.substance_catalog WHERE inchikey IS NOT NULL;
  SELECT count(*) INTO v_molecular_formula FROM supplements.substance_catalog WHERE molecular_formula IS NOT NULL;
  SELECT count(*) INTO v_cas_candidates FROM supplements.substance_catalog WHERE cas_candidates IS NOT NULL;
  SELECT count(*) INTO v_molecular_weight FROM supplements.substance_catalog WHERE molecular_weight IS NOT NULL;
  SELECT count(*) INTO v_peptide_sequence FROM supplements.substance_catalog WHERE peptide_sequence IS NOT NULL;

  IF v_substances <> ${substanceRows.length} THEN
    RAISE EXCEPTION 'substance_catalog: %, erwartet ${substanceRows.length}', v_substances;
  END IF;
  IF v_sources <> ${sourceRows.length} THEN
    RAISE EXCEPTION 'substance_catalog_sources: %, erwartet ${sourceRows.length}', v_sources;
  END IF;
  IF v_kimi < ${MIN_KIMI_SUBSTANCE_COUNT} THEN
    RAISE EXCEPTION 'substance_catalog Kimi: %, erwartet mindestens ${MIN_KIMI_SUBSTANCE_COUNT}', v_kimi;
  END IF;
  IF v_local_sources <> 44 THEN
    RAISE EXCEPTION 'substance_catalog_sources LumeOS: %, erwartet 44', v_local_sources;
  END IF;
  IF v_f05_sources <> 320 THEN
    RAISE EXCEPTION 'substance_catalog_sources F05: %, erwartet 320', v_f05_sources;
  END IF;
  IF v_columns <> 60 THEN
    RAISE EXCEPTION 'substance_catalog Spalten: %, erwartet 60', v_columns;
  END IF;
  IF v_non_kimi_lifted <> 0 THEN
    RAISE EXCEPTION 'C-196: % nicht-Kimi-Zeilen haben gehobene Kimi-Spalten befuellt', v_non_kimi_lifted;
  END IF;

  RAISE NOTICE 'OK C-196: % Substanzen, % Herkunftszeilen, % Spalten, % mit nutrients_provided, % mit Halbwertszeit',
    v_substances, v_sources, v_columns, v_with_nutrients, v_with_half_life;
  RAISE NOTICE 'C-196 Fuellgrade: safety %, regulatory %, warning_triggers %, evidence_provenance %, external_ids %, quality %, pharmacology %, dosing %, interactions %',
    v_safety, v_regulatory, v_warning_triggers, v_evidence_provenance, v_external_ids, v_quality, v_pharmacology, v_dosing, v_interactions;
  RAISE NOTICE 'C-196 flach: wada_status %, prescription_required %, dose_ceiling_value %, recommendable %, warning_only %, physician_referral %, athlete_flag %',
    v_wada_status, v_prescription_required, v_dose_ceiling_value, v_recommendable, v_warning_only, v_physician_referral, v_athlete_flag;
  RAISE NOTICE 'C-196 Kennungen: unii %, pubchem_cid %, chembl_id %, inchikey %, molecular_formula %, cas_candidates %, molecular_weight %, peptide_sequence %',
    v_unii, v_pubchem_cid, v_chembl_id, v_inchikey, v_molecular_formula, v_cas_candidates, v_molecular_weight, v_peptide_sequence;
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

console.log(`C-134: ${substanceRows.length} Substanzen; Kimi ${kimiRows.length}, LumeOS 44 (${localMatched} gemappt, ${localOwn} eigen), F-05 320 (${f05Matched} gemappt, ${f05Own} eigen), Cross-Domain ${crossLinks} Links`)
