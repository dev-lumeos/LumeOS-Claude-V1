#!/usr/bin/env node
// Prueft eine Anzeigenamen-JSONL gegen die Eingabe.
//
// AUFRUF:
//   pnpm exec tsx supabase/_pipeline/_validierung/anzeigenamen-pruefen.ts \
//     supabase/_pipeline/daten/anzeigenamen-eingabe.jsonl \
//     supabase/_pipeline/daten/anzeigenamen.jsonl \
//     supabase/_pipeline/daten/anzeigenamen-probe.jsonl
import fs from 'node:fs'

type Eingabe = {
  bls_code: string
  name_de: string
  name_en: string
  warengruppe: string
}

type Ausgabe = {
  bls_code: string
  name_display_de: string
  name_display_en: string
  nebennamen: string[]
  sicher: boolean
}

const [eingabePfad, ausgabePfad, probePfad] = process.argv.slice(2)
if (!eingabePfad || !ausgabePfad) {
  console.error('Aufruf: pnpm exec tsx supabase/_pipeline/_validierung/anzeigenamen-pruefen.ts <eingabe.jsonl> <ausgabe.jsonl>')
  process.exit(2)
}

function readJsonl<T>(path: string) {
  return fs.readFileSync(path, 'utf8')
    .split('\n')
    .map((line, i) => ({ line: line.trim(), nr: i + 1 }))
    .filter(x => x.line)
    .map(({ line, nr }) => {
      try {
        return JSON.parse(line) as T
      } catch (err) {
        throw new Error(`${path}:${nr}: ungueltiges JSON: ${(err as Error).message}`)
      }
    })
}

const eingabe = readJsonl<Eingabe>(eingabePfad)
const ausgabe = readJsonl<Ausgabe>(ausgabePfad)
const probe = probePfad && fs.existsSync(probePfad) ? readJsonl<Ausgabe>(probePfad) : []
const inputByCode = new Map(eingabe.map(r => [r.bls_code, r]))
const probeByCode = new Map(probe.map(r => [r.bls_code, r]))
const seen = new Map<string, Ausgabe[]>()
const errors: string[] = []

function transliterateGermanWord(word: string) {
  return word
    .toLowerCase()
    .replace(/\u00e4/g, 'ae')
    .replace(/\u00f6/g, 'oe')
    .replace(/\u00fc/g, 'ue')
    .replace(/\u00df/g, 'ss')
}

function findCorruptChars(value: string) {
  const found: string[] = []
  if (value.includes('?')) found.push('?')
  if (value.includes('\uFFFD')) found.push('\\uFFFD')
  if (value.includes('\u0000')) found.push('\\u0000')
  return found
}

for (const [index, row] of ausgabe.entries()) {
  const lineNr = index + 1
  const corruptFields: string[] = []
  if (!row.bls_code || typeof row.bls_code !== 'string') errors.push(`fehlender bls_code: ${JSON.stringify(row)}`)
  if (!row.name_display_de || typeof row.name_display_de !== 'string') errors.push(`${row.bls_code}: name_display_de fehlt/leer`)
  if (!row.name_display_en || typeof row.name_display_en !== 'string') errors.push(`${row.bls_code}: name_display_en fehlt/leer`)
  if (typeof row.name_display_de === 'string') {
    const corrupt = findCorruptChars(row.name_display_de)
    if (corrupt.length) corruptFields.push(`name_display_de (${corrupt.join(', ')})`)
  }
  if (typeof row.name_display_en === 'string') {
    const corrupt = findCorruptChars(row.name_display_en)
    if (corrupt.length) corruptFields.push(`name_display_en (${corrupt.join(', ')})`)
  }
  if (!Array.isArray(row.nebennamen)) {
    errors.push(`${row.bls_code}: nebennamen fehlt/ist kein Array`)
  } else {
    for (const [aliasIndex, alias] of row.nebennamen.entries()) {
      if (typeof alias !== 'string' || !alias.trim()) errors.push(`${row.bls_code}: leerer/ungueltiger Nebenname`)
      if (/[(),]/.test(alias)) errors.push(`${row.bls_code}: Nebenname enthaelt Klammer oder Komma (${alias})`)
      if (typeof alias === 'string') {
        const corrupt = findCorruptChars(alias)
        if (corrupt.length) corruptFields.push(`nebennamen[${aliasIndex}] (${corrupt.join(', ')})`)
      }
    }
  }
  if (corruptFields.length) {
    errors.push(`Zeile ${lineNr}, ${row.bls_code}: enthaelt ungueltige Zeichen in ${corruptFields.join('; ')}`)
  }
  if (typeof row.sicher !== 'boolean') errors.push(`${row.bls_code}: sicher ist kein boolean`)
  if (!inputByCode.has(row.bls_code)) errors.push(`${row.bls_code}: nicht in Eingabe`)
  const list = seen.get(row.bls_code) ?? []
  list.push(row)
  seen.set(row.bls_code, list)
}

const missing = eingabe.filter(r => !seen.has(r.bls_code)).map(r => r.bls_code)
const duplicates = [...seen.entries()].filter(([, rows]) => rows.length > 1)
if (missing.length) errors.push(`fehlende Codes: ${missing.join(', ')}`)
if (duplicates.length) errors.push(`doppelte Codes: ${duplicates.map(([c, rows]) => `${c} (${rows.length})`).join(', ')}`)

const unchangedByGroup = new Map<string, { total: number, unchanged: number }>()
const sicherByGroup = new Map<string, { total: number, sicher: number }>()
const nebenByGroup = new Map<string, { total: number, withNeben: number }>()
for (const row of ausgabe) {
  const original = inputByCode.get(row.bls_code)
  if (!original) continue
  const unchanged = row.name_display_de === original.name_de
  const unchangedStat = unchangedByGroup.get(original.warengruppe) ?? { total: 0, unchanged: 0 }
  unchangedStat.total++
  if (unchanged) unchangedStat.unchanged++
  unchangedByGroup.set(original.warengruppe, unchangedStat)

  const sicherStat = sicherByGroup.get(original.warengruppe) ?? { total: 0, sicher: 0 }
  sicherStat.total++
  if (row.sicher) sicherStat.sicher++
  sicherByGroup.set(original.warengruppe, sicherStat)

  const nebenStat = nebenByGroup.get(original.warengruppe) ?? { total: 0, withNeben: 0 }
  nebenStat.total++
  if (Array.isArray(row.nebennamen) && row.nebennamen.length > 0) nebenStat.withNeben++
  nebenByGroup.set(original.warengruppe, nebenStat)

  if (row.name_display_de === original.name_de) {
    continue
  }
  if (/\((allgemein|standard|normal)\)/i.test(row.name_display_de)) {
    errors.push(`${row.bls_code}: verbotener Platzhalter in name_display_de`)
  }
  const displayFolded = row.name_display_de.toLowerCase()
  const umlautWords = original.name_de.match(/[A-Za-z\u00c4\u00d6\u00dc\u00e4\u00f6\u00fc\u00df]+[\u00c4\u00d6\u00dc\u00e4\u00f6\u00fc\u00df][A-Za-z\u00c4\u00d6\u00dc\u00e4\u00f6\u00fc\u00df]*/g) ?? []
  for (const word of umlautWords) {
    const transliterated = transliterateGermanWord(word)
    if (transliterated !== word.toLowerCase() && displayFolded.includes(transliterated)) {
      errors.push(`${row.bls_code}: moeglich umschriebener Umlaut in name_display_de (${transliterated})`)
      break
    }
  }
}

const displayGroups = new Map<string, string[]>()
for (const row of ausgabe) {
  const codes = displayGroups.get(row.name_display_de) ?? []
  codes.push(row.bls_code)
  displayGroups.set(row.name_display_de, codes)
}
const duplicateGroups = [...displayGroups.entries()]
  .filter(([, codes]) => codes.length > 1)
  .sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]))

const oldLengths = eingabe.map(r => r.name_de.length).sort((a, b) => a - b)
const newLengths = ausgabe.map(r => r.name_display_de.length).sort((a, b) => a - b)
function pct(values: number[], p: number) {
  if (!values.length) return 0
  return values[Math.floor((values.length - 1) * p)]
}

const deviations = ausgabe
  .filter(row => {
    const probeRow = probeByCode.get(row.bls_code)
    return probeRow && (
      probeRow.name_display_de !== row.name_display_de ||
      probeRow.name_display_en !== row.name_display_en ||
      probeRow.sicher !== row.sicher
    )
  })
  .map(row => ({ row, probeRow: probeByCode.get(row.bls_code)! }))

const longestNeben = ausgabe
  .filter(row => Array.isArray(row.nebennamen) && row.nebennamen.length > 0)
  .sort((a, b) => b.nebennamen.length - a.nebennamen.length || a.bls_code.localeCompare(b.bls_code))
  .slice(0, 20)

console.log(`Eingabe: ${eingabe.length}`)
console.log(`Ausgabe: ${ausgabe.length}`)
console.log(`Fehlende Codes: ${missing.length}`)
console.log(`Doppelte Codes: ${duplicates.length}`)
console.log(`Doppelte Anzeigenamen: ${duplicateGroups.length}`)
console.log('\nDoppelte Anzeigenamen:')
for (const [name, codes] of duplicateGroups) {
  console.log(`  ${codes.length}x ${name}`)
  for (const code of codes) {
    const input = inputByCode.get(code)
    console.log(`    ${code}: ${input?.name_de ?? '?'}`)
  }
}
console.log('\nsicher:true je Warengruppe:')
for (const [group, stat] of [...sicherByGroup.entries()].sort()) {
  const pctTrue = stat.total ? (100 * stat.sicher / stat.total).toFixed(1) : '0.0'
  console.log(`  ${group}: ${stat.sicher}/${stat.total} (${pctTrue} %)`)
}
console.log('\nunveraendert uebernommen je Warengruppe:')
for (const [group, stat] of [...unchangedByGroup.entries()].sort()) {
  const pctUnchanged = stat.total ? (100 * stat.unchanged / stat.total).toFixed(1) : '0.0'
  console.log(`  ${group}: ${stat.unchanged}/${stat.total} (${pctUnchanged} %)`)
}
console.log('\nnebennamen nicht leer je Warengruppe:')
for (const [group, stat] of [...nebenByGroup.entries()].sort()) {
  const pctNeben = stat.total ? (100 * stat.withNeben / stat.total).toFixed(1) : '0.0'
  console.log(`  ${group}: ${stat.withNeben}/${stat.total} (${pctNeben} %)`)
}
console.log('\n20 laengste nebennamen-Listen:')
for (const row of longestNeben) {
  const input = inputByCode.get(row.bls_code)
  console.log(`  ${row.bls_code}: ${row.nebennamen.length} [${row.nebennamen.join('; ')}]`)
  console.log(`    amtlich: ${input?.name_de ?? '?'}`)
}
console.log('\nLaengen name_de -> name_display_de:')
console.log(`  alt p50/p90/max: ${pct(oldLengths, 0.5)}/${pct(oldLengths, 0.9)}/${oldLengths.at(-1) ?? 0}`)
console.log(`  neu p50/p90/max: ${pct(newLengths, 0.5)}/${pct(newLengths, 0.9)}/${newLengths.at(-1) ?? 0}`)
if (probePfad) {
  console.log(`\nAbweichungen zur Probe: ${deviations.length}`)
  for (const { row, probeRow } of deviations) {
    console.log(`  ${row.bls_code}:`)
    console.log(`    Probe DE: ${probeRow.name_display_de}`)
    console.log(`    Voll DE : ${row.name_display_de}`)
    console.log(`    Probe EN: ${probeRow.name_display_en}`)
    console.log(`    Voll EN : ${row.name_display_en}`)
    console.log(`    sicher  : ${probeRow.sicher} -> ${row.sicher}`)
  }
}

if (errors.length) {
  console.error('\nFEHLER:')
  for (const err of errors) console.error(`  - ${err}`)
  process.exit(1)
}
