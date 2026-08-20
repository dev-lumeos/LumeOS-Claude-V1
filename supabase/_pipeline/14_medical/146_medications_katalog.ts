#!/usr/bin/env node
// C-130: importiert den Kimi-Medikamentenbestand in medical.
// Quelle bleibt backup/kimi-research/...; der Schritt bricht ab, wenn
// der Quellordner fehlt. Es werden keine Regeln und keine Bewertungen
// importiert.
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const CONTAINER = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const DB = process.env.PGDATABASE ?? 'postgres'
const SOURCE_DIR =
  'backup/kimi-research/Kimi_Agent/supplement_performance_database/data/medications'
const TRAIT_MAPPING_FILE =
  'backup/kimi-research/Kimi_Agent/supplement_performance_database/data/platform/rule_trait_mapping.json'
const ACTIVE_FILE = 'medication_active_substances.jsonl'
const FORMULATIONS_FILE = 'medication_formulations.jsonl'
const PRODUCTS_FILE = 'medication_products.jsonl'
const EXPECTED_ACTIVE = 56
const EXPECTED_FORMULATIONS = 119
const EXPECTED_PRODUCTS = 124

type JsonObject = Record<string, unknown>
type TraitMapping = {
  class_to_rule_traits?: Record<string, string[]>
  name_to_rule_traits?: Record<string, string[]>
}

function fail(message: string): never {
  console.error(message)
  process.exit(1)
}

function readJsonl(fileName: string): JsonObject[] {
  const file = path.join(SOURCE_DIR, fileName)
  if (!fs.existsSync(file)) {
    fail(`${file} fehlt. Der Kimi-Quellordner wird fuer C-130 gebraucht.`)
  }
  return fs.readFileSync(file, 'utf8')
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      try {
        return JSON.parse(line) as JsonObject
      } catch (error) {
        fail(`${file}:${index + 1}: JSON ungueltig (${String(error)})`)
      }
    })
}

function readJson(file: string): JsonObject {
  if (!fs.existsSync(file)) {
    fail(`${file} fehlt. C-133/C-130 braucht die Kimi-Trait-Bruecke fuer Medikamentenregeln.`)
  }
  return JSON.parse(fs.readFileSync(file, 'utf8')) as JsonObject
}

function asTextArray(value: unknown): string[] {
  if (!Array.isArray(value)) return value ? [String(value)] : []
  return value
    .map(item => String(item).trim())
    .filter(Boolean)
}

function cypProfile(row: JsonObject): string[] {
  const raw = row.cyp
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return []
  const cyp = raw as JsonObject
  const out = new Set<string>()
  for (const role of ['substrate', 'inhibitor', 'inducer']) {
    const byRole = cyp[role]
    if (!byRole || typeof byRole !== 'object' || Array.isArray(byRole)) continue
    for (const [enzyme, strength] of Object.entries(byRole as JsonObject)) {
      if (!strength || ['none', 'unknown'].includes(String(strength))) continue
      out.add(`${enzyme}_${role}`)
    }
  }
  return [...out].sort()
}

function normalizedDrugClass(row: JsonObject): string[] {
  const raw = asTextArray(row.drug_class)
  const mapping = traitMapping()
  const classes = new Set(raw)
  const name = String(row.canonical_name ?? '').toLowerCase()

  for (const rawClass of raw) {
    for (const trait of mapping.class_to_rule_traits?.[rawClass] ?? []) {
      classes.add(trait)
    }
  }
  for (const [needle, traits] of Object.entries(mapping.name_to_rule_traits ?? {})) {
    if (name.includes(needle)) {
      for (const trait of traits) classes.add(trait)
    }
  }

  // rule_trait_mapping.json maps class names only. CYP rule traits come
  // exclusively from the record's cyp object, never from class names.
  for (const cyp of cypProfile(row)) classes.add(cyp)
  return [...classes].sort()
}

let cachedTraitMapping: TraitMapping | null = null
function traitMapping(): TraitMapping {
  if (cachedTraitMapping) return cachedTraitMapping
  const raw = readJson(TRAIT_MAPPING_FILE) as TraitMapping
  cachedTraitMapping = {
    class_to_rule_traits: raw.class_to_rule_traits ?? {},
    name_to_rule_traits: raw.name_to_rule_traits ?? {},
  }
  return cachedTraitMapping
}

function enrichActive(row: JsonObject): JsonObject {
  const external = row.external_ids
  const externalIds =
    external && typeof external === 'object' && !Array.isArray(external)
      ? external as JsonObject
      : {}
  return {
    ...row,
    drug_class_normalized: normalizedDrugClass(row),
    raw_drug_class: asTextArray(row.drug_class),
    cyp_profile: cypProfile(row),
    atc_code: row.ATC ?? externalIds.ATC ?? null,
    cas_number: row.CAS ?? externalIds.CAS ?? null,
    rxnorm_code: row.RxNorm ?? externalIds.RxNorm ?? null,
    unii_code: row.UNII ?? externalIds.UNII ?? null,
  }
}

function csvCell(value: string): string {
  return `"${value.replace(/"/g, '""')}"`
}

function sqlLiteral(value: string): string {
  return `'${value.replace(/'/g, "''")}'`
}

function copyPayload(rows: JsonObject[]): string {
  return rows.map(row => csvCell(JSON.stringify(row))).join('\n')
}

function runPsql(sql: string): void {
  const result = spawnSync(
    'docker',
    ['exec', '-i', CONTAINER, 'psql', '-U', 'postgres', '-d', DB, '-v', 'ON_ERROR_STOP=1', '-f', '-'],
    { input: sql, encoding: 'utf8', maxBuffer: 128 * 1024 * 1024 },
  )
  if (result.stdout) process.stdout.write(result.stdout)
  if (result.stderr) process.stderr.write(result.stderr)
  if (result.status !== 0) process.exit(result.status ?? 1)
}

const active = readJsonl(ACTIVE_FILE).map(enrichActive)
const formulations = readJsonl(FORMULATIONS_FILE)
const products = readJsonl(PRODUCTS_FILE)

if (active.length < EXPECTED_ACTIVE) {
  fail(`${ACTIVE_FILE}: ${active.length} Zeilen, erwartet mindestens ${EXPECTED_ACTIVE}`)
}
if (formulations.length < EXPECTED_FORMULATIONS) {
  fail(`${FORMULATIONS_FILE}: ${formulations.length} Zeilen, erwartet mindestens ${EXPECTED_FORMULATIONS}`)
}
if (products.length < EXPECTED_PRODUCTS) {
  fail(`${PRODUCTS_FILE}: ${products.length} Zeilen, erwartet mindestens ${EXPECTED_PRODUCTS}`)
}

const ids = new Set<string>()
for (const row of active) {
  const id = String(row.id ?? '')
  if (!id || ids.has(id)) fail(`${ACTIVE_FILE}: id fehlt oder ist doppelt (${id})`)
  ids.add(id)
  if (!row.canonical_name) fail(`${ACTIVE_FILE}:${id}: canonical_name fehlt`)
}
for (const row of formulations) {
  if (!row.id) fail(`${FORMULATIONS_FILE}: id fehlt`)
  if (!ids.has(String(row.active_substance_id))) {
    fail(`${FORMULATIONS_FILE}:${String(row.id)}: active_substance_id fehlt im Wirkstoffkatalog`)
  }
}
const formulationIds = new Set(formulations.map(row => String(row.id)))
for (const row of products) {
  if (!row.id) fail(`${PRODUCTS_FILE}: id fehlt`)
  if (!formulationIds.has(String(row.formulation_id))) {
    fail(`${PRODUCTS_FILE}:${String(row.id)}: formulation_id fehlt im Formulierungskatalog`)
  }
}

const activePayload = copyPayload(active)
const formulationPayload = copyPayload(formulations)
const productPayload = copyPayload(products)
const sourceDirLiteral = sqlLiteral(SOURCE_DIR)

const sql = `
BEGIN;

CREATE TEMP TABLE tmp_medication_active (payload jsonb NOT NULL) ON COMMIT DROP;
\\copy tmp_medication_active(payload) FROM STDIN WITH (FORMAT csv)
${activePayload}
\\.

CREATE TEMP TABLE tmp_medication_formulations (payload jsonb NOT NULL) ON COMMIT DROP;
\\copy tmp_medication_formulations(payload) FROM STDIN WITH (FORMAT csv)
${formulationPayload}
\\.

CREATE TEMP TABLE tmp_medication_products (payload jsonb NOT NULL) ON COMMIT DROP;
\\copy tmp_medication_products(payload) FROM STDIN WITH (FORMAT csv)
${productPayload}
\\.

INSERT INTO medical.medication_active_substances (
  id, canonical_name, generic_names, synonyms, atc_code, cas_number,
  rxnorm_code, unii_code, drug_class, raw_drug_class, cyp_profile,
  cyp_raw, routes, dosage_forms, risk_flags, lab_effects,
  contraindications, precautions, regulatory_state, sources, raw, source
)
SELECT
  payload->>'id',
  payload->>'canonical_name',
  COALESCE(ARRAY(SELECT jsonb_array_elements_text(COALESCE(payload->'generic_names', '[]'::jsonb))), '{}'),
  COALESCE(ARRAY(SELECT jsonb_array_elements_text(COALESCE(payload->'synonyms', '[]'::jsonb))), '{}'),
  NULLIF(payload->>'atc_code', ''),
  NULLIF(payload->>'cas_number', ''),
  NULLIF(payload->>'rxnorm_code', ''),
  NULLIF(payload->>'unii_code', ''),
  COALESCE(ARRAY(SELECT jsonb_array_elements_text(COALESCE(payload->'drug_class_normalized', '[]'::jsonb))), '{}'),
  COALESCE(ARRAY(SELECT jsonb_array_elements_text(COALESCE(payload->'raw_drug_class', '[]'::jsonb))), '{}'),
  COALESCE(ARRAY(SELECT jsonb_array_elements_text(COALESCE(payload->'cyp_profile', '[]'::jsonb))), '{}'),
  COALESCE(payload->'cyp', '{}'::jsonb),
  COALESCE(ARRAY(SELECT jsonb_array_elements_text(COALESCE(payload->'routes_of_administration', '[]'::jsonb))), '{}'),
  COALESCE(ARRAY(SELECT jsonb_array_elements_text(COALESCE(payload->'dosage_forms', '[]'::jsonb))), '{}'),
  COALESCE(payload->'risk_flags', '{}'::jsonb),
  COALESCE(payload->'lab_effects', '[]'::jsonb),
  COALESCE(payload->'contraindications', '[]'::jsonb),
  COALESCE(payload->'precautions', '[]'::jsonb),
  COALESCE(payload->'regulatory_state', '[]'::jsonb),
  COALESCE(payload->'sources', '[]'::jsonb),
  payload,
  'kimi_medications_2026_08_19'
FROM tmp_medication_active
ON CONFLICT (id) DO UPDATE SET
  canonical_name = EXCLUDED.canonical_name,
  generic_names = EXCLUDED.generic_names,
  synonyms = EXCLUDED.synonyms,
  atc_code = EXCLUDED.atc_code,
  cas_number = EXCLUDED.cas_number,
  rxnorm_code = EXCLUDED.rxnorm_code,
  unii_code = EXCLUDED.unii_code,
  drug_class = EXCLUDED.drug_class,
  raw_drug_class = EXCLUDED.raw_drug_class,
  cyp_profile = EXCLUDED.cyp_profile,
  cyp_raw = EXCLUDED.cyp_raw,
  routes = EXCLUDED.routes,
  dosage_forms = EXCLUDED.dosage_forms,
  risk_flags = EXCLUDED.risk_flags,
  lab_effects = EXCLUDED.lab_effects,
  contraindications = EXCLUDED.contraindications,
  precautions = EXCLUDED.precautions,
  regulatory_state = EXCLUDED.regulatory_state,
  sources = EXCLUDED.sources,
  raw = EXCLUDED.raw,
  source = EXCLUDED.source,
  updated_at = now();

INSERT INTO medical.medication_formulations (
  id, active_substance_id, strength_value, strength_unit, dosage_form,
  route, salt_or_ester, release, indication, raw, source
)
SELECT
  payload->>'id',
  payload->>'active_substance_id',
  NULLIF(payload #>> '{strength,value}', '')::numeric,
  NULLIF(payload #>> '{strength,unit}', ''),
  NULLIF(payload->>'dosage_form', ''),
  NULLIF(payload->>'route', ''),
  NULLIF(payload->>'salt_or_ester', ''),
  NULLIF(payload->>'release', ''),
  NULLIF(payload->>'indication', ''),
  payload,
  'kimi_medications_2026_08_19'
FROM tmp_medication_formulations
ON CONFLICT (id) DO UPDATE SET
  active_substance_id = EXCLUDED.active_substance_id,
  strength_value = EXCLUDED.strength_value,
  strength_unit = EXCLUDED.strength_unit,
  dosage_form = EXCLUDED.dosage_form,
  route = EXCLUDED.route,
  salt_or_ester = EXCLUDED.salt_or_ester,
  release = EXCLUDED.release,
  indication = EXCLUDED.indication,
  raw = EXCLUDED.raw,
  source = EXCLUDED.source,
  updated_at = now();

INSERT INTO medical.medication_products (
  id, formulation_id, brand_name, manufacturer, jurisdictions,
  identifiers, packaging, raw, source
)
SELECT
  payload->>'id',
  payload->>'formulation_id',
  payload->>'brand_name',
  NULLIF(payload->>'manufacturer', ''),
  COALESCE(ARRAY(SELECT jsonb_array_elements_text(COALESCE(payload->'jurisdictions', '[]'::jsonb))), '{}'),
  COALESCE(payload->'identifiers', '{}'::jsonb),
  NULLIF(payload->>'packaging', ''),
  payload,
  'kimi_medications_2026_08_19'
FROM tmp_medication_products
ON CONFLICT (id) DO UPDATE SET
  formulation_id = EXCLUDED.formulation_id,
  brand_name = EXCLUDED.brand_name,
  manufacturer = EXCLUDED.manufacturer,
  jurisdictions = EXCLUDED.jurisdictions,
  identifiers = EXCLUDED.identifiers,
  packaging = EXCLUDED.packaging,
  raw = EXCLUDED.raw,
  source = EXCLUDED.source,
  updated_at = now();

DO $$
DECLARE
  v_active integer;
  v_formulations integer;
  v_products integer;
  v_contract jsonb;
BEGIN
  SELECT count(*) INTO v_active FROM medical.medication_active_substances;
  SELECT count(*) INTO v_formulations FROM medical.medication_formulations;
  SELECT count(*) INTO v_products FROM medical.medication_products;
  SELECT jsonb_object_agg(contract_key, count_rows ORDER BY contract_key)
    INTO v_contract
  FROM (
    SELECT key AS contract_key,
           (SELECT count(*)
            FROM medical.medication_active_substances s
            WHERE key = ANY(s.drug_class)) AS count_rows
    FROM unnest(ARRAY[
      'anticoagulant:warfarin',
      'SSRI',
      'RAAS_inhibitor',
      'CYP3A4_substrate',
      'sedative',
      'antidiabetic',
      'MAOI'
    ]) key
  ) d;

  IF v_active < ${EXPECTED_ACTIVE} THEN
    RAISE EXCEPTION 'medication_active_substances: %, erwartet mindestens ${EXPECTED_ACTIVE}', v_active;
  END IF;
  IF v_formulations < ${EXPECTED_FORMULATIONS} THEN
    RAISE EXCEPTION 'medication_formulations: %, erwartet mindestens ${EXPECTED_FORMULATIONS}', v_formulations;
  END IF;
  IF v_products < ${EXPECTED_PRODUCTS} THEN
    RAISE EXCEPTION 'medication_products: %, erwartet mindestens ${EXPECTED_PRODUCTS}', v_products;
  END IF;

  RAISE NOTICE 'OK C-130 Katalog aus %: Wirkstoffe %, Formulierungen %, Produkte %, Vertrag %',
    ${sourceDirLiteral}, v_active, v_formulations, v_products, v_contract;
END $$;

COMMIT;
`

console.log(`${SOURCE_DIR}: ${active.length} Wirkstoffe, ${formulations.length} Formulierungen, ${products.length} Produkte`)
runPsql(sql)
