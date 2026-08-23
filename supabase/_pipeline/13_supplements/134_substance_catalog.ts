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
  description?: string | null
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
  gruppe: string | null
  kategorie: string | null
  filter: string | null
  description: string | null
  canonical_category: string | null
  canonical_compound_type: string | null
  canonical_routes: string[] | null
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
  monitoring: JsonObject | null
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

function addRoute(routes: Set<string>, value: string): void {
  const folded = fold(value)
  if (!folded) return
  if (folded.includes('subcutaneous') || /\bsubq\b/.test(folded)) routes.add('subcutaneous')
  if (folded.includes('intranasal') || folded.includes('nasal')) routes.add('intranasal')
  if (folded.includes('intravenous') || /\biv\b/.test(folded)) routes.add('intravenous')
  if (folded.includes('intramuscular') || /\bim\b/.test(folded)) routes.add('intramuscular')
  if (folded.includes('transdermal')) routes.add('transdermal')
  if (folded.includes('topical')) routes.add('topical')
  if (folded.includes('sublingual')) routes.add('sublingual')
  if (folded.includes('inhalation')) routes.add('inhalation')
  if (folded.includes('rectal')) routes.add('rectal')
  if (folded.includes('oral')) routes.add('oral')
}

function canonicalRoutes(row: KimiSubstance): string[] | null {
  const routes = new Set<string>()
  const pharmacology = objectValue(row.pharmacology)
  for (const route of textArray(pharmacology.route_of_administration)) addRoute(routes, route)
  const compoundType = fold(row.compound_type)
  if (compoundType === 'aas oral') routes.add('oral')
  if (compoundType === 'aas injectable') routes.add('intramuscular')
  return routes.size ? [...routes].sort() : null
}

function performanceCompoundType(row: KimiSubstance): string {
  const name = fold(row.canonical_name)
  if (/(ostarine|enobosarm|rad 140|testolone|lgd 4033|ligandrol|andarine|yk 11|s 23|acp 105|lgd 3303|ac 262356)/.test(name)) {
    return 'sarm'
  }
  if (/(ibutamoren|mk 677)/.test(name)) return 'gh_secretagogue'
  return 'performance_compound'
}

function canonicalCompoundType(row: KimiSubstance): string | null {
  const compoundType = fold(row.compound_type)
  switch (compoundType) {
    case 'aas injectable':
    case 'aas oral':
      return 'aas'
    case 'herb botanical':
    case 'herb':
      return 'botanical'
    case 'protein amino acid':
      return 'protein_amino_acid'
    case 'peptide incretin':
      return 'incretin_peptide'
    case 'peptide experimental':
      return 'experimental_peptide'
    case 'peptide hormone':
      return 'peptide_hormone'
    case 'performance compound':
      return performanceCompoundType(row)
    case 'vitamin':
    case 'mineral':
    case 'sports ingredient':
    case 'longevity':
    case 'metabolic':
    case 'nootropic':
    case 'hormonal':
    case 'sleep':
    case 'peptide':
    case 'polysaccharide drug':
    case 'aromatase inhibitor':
    case 'serm':
    case 'dopamine agonist':
    case 'gonadotropin':
    case 'beta2 agonist':
    case 'metabolic uncoupler':
    case 'sympathomimetic':
    case 'cb1 antagonist':
    case 'monoamine reuptake inhibitor':
      return compoundType.replace(/\s+/g, '_')
    default:
      return null
  }
}

function canonicalCategory(row: KimiSubstance, type: string | null): string | null {
  if (type) {
    if (type === 'protein_amino_acid') return 'protein_amino_acid'
    if (type === 'incretin_peptide' || type === 'experimental_peptide' || type === 'peptide_hormone') return 'peptide'
    if (type === 'gh_secretagogue') return 'hormone'
    if (type === 'performance_compound') return 'performance'
    if ([
      'sarm', 'aas', 'botanical', 'vitamin', 'mineral', 'sports_ingredient',
      'longevity', 'metabolic', 'nootropic', 'hormonal', 'sleep', 'peptide',
      'polysaccharide_drug', 'aromatase_inhibitor', 'serm', 'dopamine_agonist',
      'gonadotropin', 'beta2_agonist', 'metabolic_uncoupler', 'sympathomimetic',
      'cb1_antagonist', 'monoamine_reuptake_inhibitor',
    ].includes(type)) return type
  }
  const category = fold(row.category)
  switch (category) {
    case 'vitamins efas':
      return 'essential_fatty_acid'
    case 'protein amino acids':
      return 'protein_amino_acid'
    case 'herbal botanical':
      return 'botanical'
    case 'sports performance':
      return 'sports_ingredient'
    case 'metabolic weight':
      return 'metabolic'
    case 'hormonal support':
      return 'hormonal'
    case 'performance enhancement':
      return 'performance'
    case 'peptides':
      return 'peptide'
    case 'vitamins':
      return 'vitamin'
    case 'minerals':
      return 'mineral'
    case 'longevity':
    case 'metabolic':
    case 'sleep':
    case 'nootropics':
      return category.replace(/s$/, '')
    default:
      return null
  }
}

function canonicalTaxonomy(row: KimiSubstance): {
  canonical_category: string | null
  canonical_compound_type: string | null
  canonical_routes: string[] | null
} {
  const type = canonicalCompoundType(row)
  return {
    canonical_category: canonicalCategory(row, type),
    canonical_compound_type: type,
    canonical_routes: canonicalRoutes(row),
  }
}

function groupFromSource(domain: string, category: string | null): string | null {
  if (domain === 'kimi_supplement' || domain === 'lumeos_local') return 'supplement'
  if (domain === 'kimi_peptide') return 'peptide'
  if (domain === 'kimi_performance') return 'enhanced'
  const foldedCategory = fold(category)
  if (domain === 'f05_candidate') {
    if ([
      'herbal', 'nootropic', 'anti aging', 'adaptogen', 'spec 05',
    ].includes(foldedCategory)) return 'supplement'
    if (['peptide', 'hgh gh mimetic'].includes(foldedCategory)) return 'peptide'
    if ([
      'steroid injectable', 'steroid oral', 'sarm', 'diuretic',
      'insulin glucose', 'pct hpta', 'estrogen control', 'fat burner',
      'thyroid',
    ].includes(foldedCategory)) return 'enhanced'
  }
  return null
}

function normalizeCategoryLabel(value: string | null): string | null {
  const folded = fold(value)
  if (!folded) return null
  switch (folded) {
    case 'herbal botanical':
    case 'botanical kraeuter':
    case 'herbal':
    case 'herb botanical':
    case 'herb':
      return 'botanical'
    case 'minerals':
    case 'mineral':
      return 'mineral'
    case 'vitamins':
    case 'vitamin':
      return 'vitamin'
    case 'vitamins efas':
      return 'essential_fatty_acid'
    case 'protein amino acids':
    case 'protein amino acid':
    case 'amino acids':
      return 'protein_amino_acid'
    case 'nootropics':
    case 'nootropic':
    case 'nootropikum':
      return 'nootropic'
    case 'adaptogens':
    case 'adaptogen':
      return 'adaptogen'
    case 'longevity':
    case 'anti aging':
    case 'longevity anti aging':
      return 'longevity'
    case 'sports performance':
    case 'sports ingredient':
    case 'performance':
      return 'sports_performance'
    case 'metabolic weight':
    case 'metabolic':
      return 'metabolic'
    case 'hormonal support':
    case 'hormonal':
      return 'hormonal'
    case 'sleep':
      return 'sleep'
    case 'gut health':
      return 'gut_health'
    case 'recovery':
      return 'recovery'
    case 'other':
      return 'other'
    case 'aas':
    case 'steroid injectable':
      return 'injectable_aas'
    case 'aas 17aa oral':
    case 'steroid oral':
      return 'oral_aas'
    case 'peptides':
    case 'peptide':
      return 'peptide'
    case 'sarm':
      return 'sarm'
    case 'gh gh sekretagog':
    case 'hgh gh mimetic':
      return 'growth_hormone_axis'
    case 'diuretikum':
    case 'diuretic':
      return 'diuretic'
    case 'insulin glucose modulator':
    case 'insulin glucose':
      return 'insulin_glucose'
    case 'serm hpta modulator':
    case 'pct hpta':
      return 'pct_hpta'
    case 'aromatasehemmer estrogen kontrolle':
    case 'estrogen control':
      return 'estrogen_control'
    case 'fatburner stimulans':
    case 'fat burner':
      return 'fat_loss_stimulants'
    case 'schilddruesenhormon':
    case 'thyroid':
      return 'thyroid'
    case 'stimulans':
      return 'stimulant'
    default:
      return folded.replace(/\s+/g, '_')
  }
}

function normalizeSubcategory(value: string | null): string | null {
  const folded = fold(value)
  if (!folded) return null
  if (folded.startsWith('growth hormone axis')) return 'growth_hormone_axis'
  if (folded.startsWith('metabolic incretin')) return 'metabolic_incretin'
  if (folded.startsWith('recovery tissue')) return 'recovery_tissue'
  if (folded.startsWith('neuro cognitive')) return 'neuro_cognitive'
  if (folded.startsWith('designer steroid')) return 'designer_steroids'
  if (folded.startsWith('prohormone')) return 'prohormones'
  if (folded.startsWith('aromatase inhibitor')) return 'aromatase_inhibitor'
  if (folded.startsWith('fat loss stimulants')) return 'fat_loss_stimulants'
  if (folded.startsWith('stimulant')) return 'stimulant'
  if (folded.startsWith('sarm adjacent')) return 'sarm_adjacent'
  if (folded.startsWith('gh secretagogue')) return 'gh_secretagogue'
  return normalizeCategoryLabel(value)
}

function categoryFromSource(domain: string, category: string | null, compoundType: string | null, subcategory: string | null): string | null {
  const group = groupFromSource(domain, category)
  if ((group === 'peptide' || group === 'enhanced') && normalizeSubcategory(subcategory)) {
    return normalizeSubcategory(subcategory)
  }
  if (domain === 'f05_candidate' && fold(category) === 'spec 05') return normalizeCategoryLabel(compoundType)
  if (domain === 'f05_candidate') return normalizeCategoryLabel(category) ?? normalizeCategoryLabel(compoundType)
  return normalizeCategoryLabel(category) ?? normalizeCategoryLabel(compoundType)
}

function filterFromGroupCategory(gruppe: string | null, kategorie: string | null): string | null {
  if (!gruppe || !kategorie) return null
  // C-230: Filter sind Produktbuendelungen fuer die Leiste:
  // nie unter fuenf Substanzen ein eigener Filter; gebuendelt wird nach Zweck, nicht nach Wirkmechanismus.
  if (gruppe === 'peptide') {
    if (['growth_hormone_axis', 'metabolic_hgh_fragment', 'myostatin_pathway'].includes(kategorie)) return 'wachstumshormon'
    if (kategorie === 'metabolic_incretin') return 'stoffwechsel'
    if (['muscle_growth_axis', 'recovery_tissue', 'recovery_anti_inflammatory'].includes(kategorie)) return 'muskel_gewebe'
    if (['neuro_cognitive', 'neuropeptides', 'neuro_bioregulator'].includes(kategorie)) return 'neuro'
    if (['reproductive', 'reproductive_axis', 'reproductive_social', 'melanocortin'].includes(kategorie)) return 'hormone'
    if ([
      'longevity_immune', 'longevity', 'immune_bioregulator', 'antimicrobial_immune',
      'hematopoietic', 'antioxidant', 'mitochondrial', 'vascular_bioregulator',
    ].includes(kategorie)) return 'longevity_immun'
    if (['peptide', 'other'].includes(kategorie)) return 'ohne_zuordnung'
  }
  if (gruppe === 'enhanced') {
    if (kategorie === 'injectable_aas') return 'injizierbare_aas'
    if (kategorie === 'oral_aas') return 'orale_aas'
    if (['sarm', 'sarm_adjacent'].includes(kategorie)) return 'sarm'
    if (['designer_steroids', 'prohormones'].includes(kategorie)) return 'prohormone'
    if ([
      'ancillaries', 'pct_hpta', 'estrogen_control', 'aromatase_inhibitor',
      'serm', 'insulin_glucose', 'thyroid',
    ].includes(kategorie)) return 'begleitmedikation'
    if (['fat_loss_stimulants', 'stimulant', 'diuretic', 'mitochondrial_uncoupler'].includes(kategorie)) return 'fatburner'
    if ([
      'ppar_agonist', 'rev_erb_agonist', 'gh_secretagogue',
      'gaba_b_agonist', 'atypical_antidepressant_opioid_agonist',
    ].includes(kategorie)) return 'sonstige'
  }
  if (gruppe === 'supplement') {
    if (kategorie === 'botanical') return 'botanicals'
    if (kategorie === 'longevity') return 'longevity'
    if (kategorie === 'mineral') return 'mineralstoffe'
    if (kategorie === 'vitamin') return 'vitamine'
    if (kategorie === 'nootropic') return 'nootropika'
    if (['sports_performance', 'stimulant'].includes(kategorie)) return 'sportnahrung'
    if (kategorie === 'adaptogen') return 'adaptogene'
    if (kategorie === 'protein_amino_acid') return 'protein_aminos'
    if ([
      'metabolic', 'hormonal', 'sleep', 'recovery',
      'gut_health', 'essential_fatty_acid', 'other',
    ].includes(kategorie)) return 'uebrige'
  }
  return null
}

function emptyLiftedFields(): Pick<SubstanceRow,
  'safety' | 'interactions' | 'regulatory' | 'quality' | 'warning_triggers' | 'monitoring' | 'evidence_provenance' |
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
    monitoring: null,
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
    monitoring: nullableObject(row.monitoring),
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
  const taxonomy = canonicalTaxonomy(row)
  const category = row.category ? String(row.category) : null
  const compoundType = row.compound_type ? String(row.compound_type) : null
  const subcategory = row.subcategory ? String(row.subcategory) : null
  const gruppe = groupFromSource(row.domain, category)
  const kategorie = categoryFromSource(row.domain, category, compoundType, subcategory)
  substances.set(row.id, {
    id: row.id,
    canonical_name: row.canonical_name,
    domain: row.domain,
    compound_type: compoundType,
    category,
    subcategory,
    gruppe,
    kategorie,
    filter: filterFromGroupCategory(gruppe, kategorie),
    description: nullableText(row.description),
    ...taxonomy,
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
    const category = row.category ? String(row.category) : null
    const gruppe = groupFromSource('lumeos_local', category)
    const kategorie = categoryFromSource('lumeos_local', category, null, null)
    substances.set(id, {
      id,
      canonical_name: row.name,
      domain: 'lumeos_local',
      compound_type: null,
      category,
      subcategory: null,
      gruppe,
      kategorie,
      filter: filterFromGroupCategory(gruppe, kategorie),
      description: null,
      canonical_category: null,
      canonical_compound_type: null,
      canonical_routes: null,
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
    const category = row.category_source ? String(row.category_source) : null
    const compoundType = row.class ? String(row.class) : null
    const gruppe = groupFromSource('f05_candidate', category)
    const kategorie = categoryFromSource('f05_candidate', category, compoundType, null)
    substances.set(id, {
      id,
      canonical_name: row.name,
      domain: 'f05_candidate',
      compound_type: compoundType,
      category,
      subcategory: null,
      gruppe,
      kategorie,
      filter: filterFromGroupCategory(gruppe, kategorie),
      description: null,
      canonical_category: null,
      canonical_compound_type: null,
      canonical_routes: null,
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
const expectedCanonicalCategory = substanceRows.filter(row => row.canonical_category !== null).length
const expectedCanonicalCompoundType = substanceRows.filter(row => row.canonical_compound_type !== null).length
const expectedCanonicalRoutes = substanceRows.filter(row => row.canonical_routes !== null).length
const expectedGroups = {
  supplement: substanceRows.filter(row => row.gruppe === 'supplement').length,
  peptide: substanceRows.filter(row => row.gruppe === 'peptide').length,
  enhanced: substanceRows.filter(row => row.gruppe === 'enhanced').length,
}
const expectedKategorie = substanceRows.filter(row => row.kategorie !== null).length
const expectedFilter = substanceRows.filter(row => row.filter !== null).length
const expectedDescription = substanceRows.filter(row => row.description !== null).length
const expectedMonitoring = substanceRows.filter(row => row.monitoring !== null).length
const expectedFilterCounts = [
  ['peptide', 'wachstumshormon', 25],
  ['peptide', 'stoffwechsel', 10],
  ['peptide', 'muskel_gewebe', 10],
  ['peptide', 'neuro', 9],
  ['peptide', 'hormone', 7],
  ['peptide', 'longevity_immun', 11],
  ['peptide', 'ohne_zuordnung', 10],
  ['enhanced', 'injizierbare_aas', 36],
  ['enhanced', 'orale_aas', 32],
  ['enhanced', 'sarm', 22],
  ['enhanced', 'prohormone', 16],
  ['enhanced', 'begleitmedikation', 41],
  ['enhanced', 'fatburner', 25],
  ['enhanced', 'sonstige', 5],
  ['supplement', 'botanicals', 68],
  ['supplement', 'longevity', 40],
  ['supplement', 'mineralstoffe', 36],
  ['supplement', 'vitamine', 34],
  ['supplement', 'nootropika', 31],
  ['supplement', 'sportnahrung', 26],
  ['supplement', 'adaptogene', 22],
  ['supplement', 'protein_aminos', 19],
  ['supplement', 'uebrige', 31],
] as const
const expectedFilterValuesSql = expectedFilterCounts
  .map(([gruppe, filter, count]) => `('${gruppe}', '${filter}', ${count})`)
  .join(',\n      ')
const actualFilterCounts = new Map<string, number>()
for (const row of substanceRows) {
  if (!row.gruppe || !row.filter) continue
  const key = `${row.gruppe}|${row.filter}`
  actualFilterCounts.set(key, (actualFilterCounts.get(key) ?? 0) + 1)
}
if (expectedGroups.supplement !== 307 || expectedGroups.peptide !== 82 || expectedGroups.enhanced !== 177) {
  fail(`C-228 Gruppen-Erwartung verfehlt: supplement ${expectedGroups.supplement}, peptide ${expectedGroups.peptide}, enhanced ${expectedGroups.enhanced}; erwartet 307/82/177`)
}
if (expectedKategorie !== substanceRows.length) {
  fail(`C-228 Kategorien: ${expectedKategorie}, erwartet ${substanceRows.length}`)
}
if (expectedFilter !== substanceRows.length) {
  fail(`C-230 Filter: ${expectedFilter}, erwartet ${substanceRows.length}`)
}
for (const [gruppe, filter, count] of expectedFilterCounts) {
  const actual = actualFilterCounts.get(`${gruppe}|${filter}`) ?? 0
  if (actual !== count) fail(`C-230 Filter ${gruppe}/${filter}: ${actual}, erwartet ${count}`)
}
if (expectedDescription !== 290) fail(`C-228 description: ${expectedDescription}, erwartet 290`)
if (expectedMonitoring !== 46) fail(`C-228 monitoring: ${expectedMonitoring}, erwartet 46`)

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
  source_primary                TEXT NOT NULL,
  raw                           JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active                     BOOLEAN NOT NULL DEFAULT true,
  created_at                    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                    TIMESTAMPTZ NOT NULL DEFAULT now(),
  safety                        JSONB,
  canonical_category            TEXT,
  canonical_compound_type       TEXT,
  canonical_routes              TEXT[],
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
  gruppe                        TEXT,
  kategorie                     TEXT,
  description                   TEXT,
  monitoring                    JSONB,
  filter                        TEXT,
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
  CHECK (monitoring IS NULL OR jsonb_typeof(monitoring) = 'object'),
  CHECK (evidence_provenance IS NULL OR jsonb_typeof(evidence_provenance) = 'object'),
  CHECK (missing_fields IS NULL OR jsonb_typeof(missing_fields) = 'array'),
  CHECK (missing_reason IS NULL OR jsonb_typeof(missing_reason) = 'object'),
  CHECK (needs_review IS NULL OR jsonb_typeof(needs_review) = 'array'),
  CHECK (confidence IS NULL OR (confidence >= 0 AND confidence <= 1)),
  CHECK (source_count IS NULL OR source_count >= 0),
  CHECK (primary_source_count IS NULL OR primary_source_count >= 0),
  CHECK (wada_status IS NULL OR wada_status IN ('prohibited', 'monitored', 'not_prohibited')),
  CHECK (gruppe IS NULL OR gruppe IN ('supplement', 'peptide', 'enhanced')),
  CHECK (kategorie IS NULL OR btrim(kategorie) <> ''),
  CHECK (filter IS NULL OR btrim(filter) <> ''),
  CHECK (jsonb_typeof(raw) = 'object')
);

ALTER TABLE supplements.substance_catalog
  ADD COLUMN IF NOT EXISTS safety JSONB,
  ADD COLUMN IF NOT EXISTS canonical_category TEXT,
  ADD COLUMN IF NOT EXISTS canonical_compound_type TEXT,
  ADD COLUMN IF NOT EXISTS canonical_routes TEXT[],
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
  ADD COLUMN IF NOT EXISTS peptide_sequence TEXT,
  ADD COLUMN IF NOT EXISTS gruppe TEXT,
  ADD COLUMN IF NOT EXISTS kategorie TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS monitoring JSONB,
  ADD COLUMN IF NOT EXISTS filter TEXT;

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
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'substance_catalog_monitoring_json_check') THEN
    ALTER TABLE supplements.substance_catalog
      ADD CONSTRAINT substance_catalog_monitoring_json_check
      CHECK (monitoring IS NULL OR jsonb_typeof(monitoring) = 'object');
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
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'substance_catalog_gruppe_check') THEN
    ALTER TABLE supplements.substance_catalog
      ADD CONSTRAINT substance_catalog_gruppe_check
      CHECK (gruppe IS NULL OR gruppe IN ('supplement', 'peptide', 'enhanced'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'substance_catalog_kategorie_not_blank_check') THEN
    ALTER TABLE supplements.substance_catalog
      ADD CONSTRAINT substance_catalog_kategorie_not_blank_check
      CHECK (kategorie IS NULL OR btrim(kategorie) <> '');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'substance_catalog_filter_not_blank_check') THEN
    ALTER TABLE supplements.substance_catalog
      ADD CONSTRAINT substance_catalog_filter_not_blank_check
      CHECK (filter IS NULL OR btrim(filter) <> '');
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
CREATE INDEX IF NOT EXISTS substance_catalog_canonical_category_idx
  ON supplements.substance_catalog(canonical_category)
  WHERE canonical_category IS NOT NULL;
CREATE INDEX IF NOT EXISTS substance_catalog_canonical_compound_type_idx
  ON supplements.substance_catalog(canonical_compound_type)
  WHERE canonical_compound_type IS NOT NULL;
CREATE INDEX IF NOT EXISTS substance_catalog_canonical_routes_idx
  ON supplements.substance_catalog USING gin(canonical_routes);
CREATE INDEX IF NOT EXISTS substance_catalog_gruppe_idx
  ON supplements.substance_catalog(gruppe)
  WHERE gruppe IS NOT NULL;
CREATE INDEX IF NOT EXISTS substance_catalog_kategorie_idx
  ON supplements.substance_catalog(gruppe, kategorie)
  WHERE gruppe IS NOT NULL AND kategorie IS NOT NULL;
CREATE INDEX IF NOT EXISTS substance_catalog_filter_idx
  ON supplements.substance_catalog(gruppe, filter)
  WHERE gruppe IS NOT NULL AND filter IS NOT NULL;
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
  canonical_category, canonical_compound_type, canonical_routes,
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
  gruppe, kategorie, description, monitoring, filter, source_primary, raw
)
SELECT
  payload->>'id',
  payload->>'canonical_name',
  payload->>'domain',
  NULLIF(payload->>'compound_type', ''),
  NULLIF(payload->>'category', ''),
  NULLIF(payload->>'subcategory', ''),
  NULLIF(payload->>'canonical_category', ''),
  NULLIF(payload->>'canonical_compound_type', ''),
  CASE
    WHEN payload->'canonical_routes' IS NULL OR payload->'canonical_routes' = 'null'::jsonb THEN NULL::text[]
    ELSE ARRAY(SELECT jsonb_array_elements_text(payload->'canonical_routes'))
  END,
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
  NULLIF(payload->>'gruppe', ''),
  NULLIF(payload->>'kategorie', ''),
  NULLIF(payload->>'description', ''),
  NULLIF(payload->'monitoring', 'null'::jsonb),
  NULLIF(payload->>'filter', ''),
  payload->>'source_primary',
  COALESCE(payload->'raw', '{}'::jsonb)
FROM tmp_substance_catalog
ON CONFLICT (id) DO UPDATE SET
  canonical_name = EXCLUDED.canonical_name,
  domain = EXCLUDED.domain,
  compound_type = EXCLUDED.compound_type,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  canonical_category = EXCLUDED.canonical_category,
  canonical_compound_type = EXCLUDED.canonical_compound_type,
  canonical_routes = EXCLUDED.canonical_routes,
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
  gruppe = EXCLUDED.gruppe,
  kategorie = EXCLUDED.kategorie,
  description = EXCLUDED.description,
  monitoring = EXCLUDED.monitoring,
  filter = EXCLUDED.filter,
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
  v_non_kimi_taxonomy integer;
  v_canonical_category integer;
  v_canonical_compound_type integer;
  v_canonical_routes integer;
  v_gruppe_null integer;
  v_gruppe_supplement integer;
  v_gruppe_peptide integer;
  v_gruppe_enhanced integer;
  v_kategorie integer;
  v_filter integer;
  v_filter_mismatches integer;
  v_description integer;
  v_monitoring integer;
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
      OR canonical_category IS NOT NULL
      OR canonical_compound_type IS NOT NULL
      OR canonical_routes IS NOT NULL
      OR interactions IS NOT NULL
      OR regulatory IS NOT NULL
      OR quality IS NOT NULL
      OR warning_triggers IS NOT NULL
      OR monitoring IS NOT NULL
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
  SELECT count(*) INTO v_non_kimi_taxonomy
  FROM supplements.substance_catalog
  WHERE domain NOT LIKE 'kimi_%'
    AND (
      canonical_category IS NOT NULL
      OR canonical_compound_type IS NOT NULL
      OR canonical_routes IS NOT NULL
    );
  SELECT count(*) INTO v_canonical_category FROM supplements.substance_catalog WHERE canonical_category IS NOT NULL;
  SELECT count(*) INTO v_canonical_compound_type FROM supplements.substance_catalog WHERE canonical_compound_type IS NOT NULL;
  SELECT count(*) INTO v_canonical_routes FROM supplements.substance_catalog WHERE canonical_routes IS NOT NULL;
  SELECT count(*) INTO v_gruppe_null FROM supplements.substance_catalog WHERE gruppe IS NULL;
  SELECT count(*) INTO v_gruppe_supplement FROM supplements.substance_catalog WHERE gruppe = 'supplement';
  SELECT count(*) INTO v_gruppe_peptide FROM supplements.substance_catalog WHERE gruppe = 'peptide';
  SELECT count(*) INTO v_gruppe_enhanced FROM supplements.substance_catalog WHERE gruppe = 'enhanced';
  SELECT count(*) INTO v_kategorie FROM supplements.substance_catalog WHERE kategorie IS NOT NULL;
  SELECT count(*) INTO v_filter FROM supplements.substance_catalog WHERE filter IS NOT NULL;
  SELECT count(*) INTO v_description FROM supplements.substance_catalog WHERE description IS NOT NULL;
  SELECT count(*) INTO v_monitoring FROM supplements.substance_catalog WHERE monitoring IS NOT NULL;
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
  IF v_columns <> 68 THEN
    RAISE EXCEPTION 'substance_catalog Spalten: %, erwartet 68', v_columns;
  END IF;
  IF v_non_kimi_lifted <> 0 THEN
    RAISE EXCEPTION 'C-196: % nicht-Kimi-Zeilen haben gehobene Kimi-Spalten befuellt', v_non_kimi_lifted;
  END IF;
  IF v_non_kimi_taxonomy <> 0 THEN
    RAISE EXCEPTION 'C-197: % nicht-Kimi-Zeilen haben kanonische Taxonomie befuellt', v_non_kimi_taxonomy;
  END IF;
  IF v_canonical_category <> ${expectedCanonicalCategory} THEN
    RAISE EXCEPTION 'C-197 canonical_category: %, erwartet ${expectedCanonicalCategory}', v_canonical_category;
  END IF;
  IF v_canonical_compound_type <> ${expectedCanonicalCompoundType} THEN
    RAISE EXCEPTION 'C-197 canonical_compound_type: %, erwartet ${expectedCanonicalCompoundType}', v_canonical_compound_type;
  END IF;
  IF v_canonical_routes <> ${expectedCanonicalRoutes} THEN
    RAISE EXCEPTION 'C-197 canonical_routes: %, erwartet ${expectedCanonicalRoutes}', v_canonical_routes;
  END IF;
  IF v_gruppe_null <> 0 THEN
    RAISE EXCEPTION 'C-228: % Substanzen ohne Gruppe', v_gruppe_null;
  END IF;
  IF v_gruppe_supplement <> ${expectedGroups.supplement} THEN
    RAISE EXCEPTION 'C-228 gruppe supplement: %, erwartet ${expectedGroups.supplement}', v_gruppe_supplement;
  END IF;
  IF v_gruppe_peptide <> ${expectedGroups.peptide} THEN
    RAISE EXCEPTION 'C-228 gruppe peptide: %, erwartet ${expectedGroups.peptide}', v_gruppe_peptide;
  END IF;
  IF v_gruppe_enhanced <> ${expectedGroups.enhanced} THEN
    RAISE EXCEPTION 'C-228 gruppe enhanced: %, erwartet ${expectedGroups.enhanced}', v_gruppe_enhanced;
  END IF;
  IF v_kategorie <> ${expectedKategorie} THEN
    RAISE EXCEPTION 'C-228 kategorie: %, erwartet ${expectedKategorie}', v_kategorie;
  END IF;
  IF v_filter <> ${expectedFilter} THEN
    RAISE EXCEPTION 'C-230 filter: %, erwartet ${expectedFilter}', v_filter;
  END IF;
  WITH expected(gruppe, filter, expected_count) AS (
    VALUES
      ${expectedFilterValuesSql}
  ),
  actual AS (
    SELECT gruppe, filter, count(*)::integer AS actual_count
    FROM supplements.substance_catalog
    GROUP BY gruppe, filter
  ),
  compared AS (
    SELECT
      COALESCE(expected.gruppe, actual.gruppe) AS gruppe,
      COALESCE(expected.filter, actual.filter) AS filter,
      COALESCE(expected.expected_count, 0) AS expected_count,
      COALESCE(actual.actual_count, 0) AS actual_count
    FROM expected
    FULL OUTER JOIN actual
      ON actual.gruppe = expected.gruppe
     AND actual.filter = expected.filter
    WHERE COALESCE(expected.expected_count, 0) <> COALESCE(actual.actual_count, 0)
  )
  SELECT count(*) INTO v_filter_mismatches FROM compared;
  IF v_filter_mismatches <> 0 THEN
    RAISE EXCEPTION 'C-230 Filter-Zaehlung hat % Abweichungen', v_filter_mismatches;
  END IF;
  IF v_description <> ${expectedDescription} THEN
    RAISE EXCEPTION 'C-228 description: %, erwartet ${expectedDescription}', v_description;
  END IF;
  IF v_monitoring <> ${expectedMonitoring} THEN
    RAISE EXCEPTION 'C-228 monitoring: %, erwartet ${expectedMonitoring}', v_monitoring;
  END IF;

  RAISE NOTICE 'OK C-228/C-230: % Substanzen, % Herkunftszeilen, % Spalten, % mit nutrients_provided, % mit Halbwertszeit',
    v_substances, v_sources, v_columns, v_with_nutrients, v_with_half_life;
  RAISE NOTICE 'C-228/C-230 Gruppen: supplement %, peptide %, enhanced %, ohne Gruppe %, kategorie %, filter %, description %, monitoring %',
    v_gruppe_supplement, v_gruppe_peptide, v_gruppe_enhanced, v_gruppe_null, v_kategorie, v_filter, v_description, v_monitoring;
  RAISE NOTICE 'C-197 Taxonomie: canonical_category %, canonical_compound_type %, canonical_routes %, nicht-Kimi %',
    v_canonical_category, v_canonical_compound_type, v_canonical_routes, v_non_kimi_taxonomy;
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
