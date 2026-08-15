#!/usr/bin/env node
import { readFileSync } from 'node:fs'

const DATA_PATH = 'supabase/_pipeline/daten/lebensmittel-tags.jsonl'

type TagEntry = {
  tag: string
  grund: string
}

type Row = {
  bls_code: string
  tags: TagEntry[]
}

const VALID_TAGS = new Set([
  'contains_nuts',
  'contains_gluten',
  'contains_lactose',
  'vegan',
  'vegetarian',
  'whole_food',
  'halal',
  'kosher',
  'thai_food',
  'ultra_processed',
])

const FORBIDDEN_TAGS = new Set([
  'nut_free',
  'gluten_free',
  'lactose_free',
  'processed_food',
  'spicy',
  'mediterranean',
])

const EXPECTED_PRESENT: [string, string, string][] = [
  ['H120100', 'contains_nuts', 'Walnuss'],
  ['B101000', 'contains_gluten', 'Vollkornbrot'],
  ['M111300', 'contains_lactose', 'Vollmilch'],
  ['Q120000', 'vegan', 'Olivenoel'],
  ['Q120000', 'vegetarian', 'Olivenoel'],
  ['H150100', 'vegan', 'Kokos Fruchtfleisch'],
  ['C352000', 'vegan', 'Reis poliert, roh'],
  ['F110100', 'whole_food', 'Apfel roh'],
  ['C352000', 'whole_food', 'Reis poliert, roh'],
  ['Q120000', 'whole_food', 'Olivenoel'],
  ['X912033', 'ultra_processed', 'Pizza Margherita'],
]

const EXPECTED_ABSENT: [string, string, string][] = [
  ['H150100', 'contains_nuts', 'Kokosnuss ist kein Baumnuss-Allergen'],
  ['H154000', 'contains_nuts', 'Kokosmilch/Kokosnussmilch ist kein Baumnuss-Allergen'],
  ['C352000', 'contains_gluten', 'Reis poliert, roh'],
  ['B101000', 'whole_food', 'Vollkornbrot ist NOVA 3'],
  ['B101000', 'ultra_processed', 'Vollkornbrot ist NOVA 3'],
  ['F090100', 'whole_food', 'Fruchtmischung gezuckert, roh'],
  ['U010100', 'vegan', 'Rind Hackfleisch, roh'],
  ['U010100', 'vegetarian', 'Rind Hackfleisch, roh'],
  ['Q120000', 'contains_lactose', 'Olivenoel'],
]

const text = readFileSync(DATA_PATH, 'utf8')
const errors: string[] = []
const rows: Row[] = []
const byCode = new Map<string, Row>()
const counts = new Map<string, number>()

text.split(/\r?\n/).forEach((line, index) => {
  const lineNo = index + 1
  if (!line.trim()) return

  let parsed: unknown
  try {
    parsed = JSON.parse(line)
  } catch (error) {
    errors.push(`Zeile ${lineNo}: kein gueltiges JSON (${String(error)})`)
    return
  }

  const row = parsed as Partial<Row>
  if (typeof row.bls_code !== 'string' || !/^[A-Z0-9]{7}$/.test(row.bls_code)) {
    errors.push(`Zeile ${lineNo}: bls_code fehlt oder ist ungueltig`)
  }
  if (!Array.isArray(row.tags)) {
    errors.push(`Zeile ${lineNo}: tags fehlt oder ist kein Array`)
    return
  }

  const seenTags = new Set<string>()
  for (const tagEntry of row.tags as Partial<TagEntry>[]) {
    if (typeof tagEntry.tag !== 'string' || tagEntry.tag.trim() === '') {
      errors.push(`Zeile ${lineNo} ${row.bls_code ?? ''}: tag fehlt`)
      continue
    }
    if (typeof tagEntry.grund !== 'string' || tagEntry.grund.trim() === '') {
      errors.push(`Zeile ${lineNo} ${row.bls_code ?? ''}: grund fehlt fuer ${tagEntry.tag}`)
    }
    if (FORBIDDEN_TAGS.has(tagEntry.tag)) {
      errors.push(`Zeile ${lineNo} ${row.bls_code ?? ''}: verbotener Tag ${tagEntry.tag}`)
    }
    if (!VALID_TAGS.has(tagEntry.tag)) {
      errors.push(`Zeile ${lineNo} ${row.bls_code ?? ''}: unbekannter Tag ${tagEntry.tag}`)
    }
    if (tagEntry.tag === 'thai_food') {
      errors.push(`Zeile ${lineNo} ${row.bls_code ?? ''}: thai_food darf im BLS-Bestand nicht vergeben werden`)
    }
    if (seenTags.has(tagEntry.tag)) {
      errors.push(`Zeile ${lineNo} ${row.bls_code ?? ''}: doppelter Tag ${tagEntry.tag}`)
    }
    seenTags.add(tagEntry.tag)
    counts.set(tagEntry.tag, (counts.get(tagEntry.tag) ?? 0) + 1)
  }

  if (seenTags.has('whole_food') && seenTags.has('ultra_processed')) {
    errors.push(`Zeile ${lineNo} ${row.bls_code ?? ''}: whole_food und ultra_processed schliessen sich aus`)
  }

  if (row.tags.length === 0) {
    errors.push(`Zeile ${lineNo} ${row.bls_code ?? ''}: leeres tags-Array, Zeile sollte entfallen`)
  }

  if (typeof row.bls_code === 'string') {
    if (byCode.has(row.bls_code)) {
      errors.push(`Zeile ${lineNo}: doppelter bls_code ${row.bls_code}`)
    }
    byCode.set(row.bls_code, row as Row)
  }
  rows.push(row as Row)
})

function hasTag(code: string, tag: string) {
  return byCode.get(code)?.tags.some((entry) => entry.tag === tag) ?? false
}

for (const [code, tag, label] of EXPECTED_PRESENT) {
  if (!hasTag(code, tag)) {
    errors.push(`Soll fehlt: ${code} ${label} muss ${tag} tragen`)
  }
}

for (const [code, tag, label] of EXPECTED_ABSENT) {
  if (hasTag(code, tag)) {
    errors.push(`Soll verletzt: ${code} ${label} darf ${tag} nicht tragen`)
  }
}

console.log(`Datendatei: ${DATA_PATH}`)
console.log(`Zeilen mit Tags: ${rows.length}`)
console.log(`Bewusst unmarkiert: ${7140 - rows.length}`)
console.log('')
console.log('Tags:')
for (const [tag, count] of [...counts.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
  console.log(`  ${tag.padEnd(18)} ${count}`)
}

if (errors.length > 0) {
  console.error('')
  console.error(`FEHLER: ${errors.length}`)
  for (const error of errors) console.error(`  ${error}`)
  process.exit(1)
}

console.log('')
console.log('OK: Pflichtfaelle, Struktur und NOVA-Konsistenz stimmen.')
