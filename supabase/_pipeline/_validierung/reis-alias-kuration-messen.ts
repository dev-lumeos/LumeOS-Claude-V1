#!/usr/bin/env node
// Misst vorbereitete C-32-Aliasdaten gegen nutrition.food_search.
// Keine Writes, kein Kettenschritt, kein Neuaufbau.
//
// AUFRUF:
//   pnpm exec tsx supabase/_pipeline/_validierung/reis-alias-kuration-messen.ts
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { buildFoodSearchGroups } from '../../../apps/web/src/lib/nutrition/food-search'

type AliasEintrag = {
  suchbegriff: string
  ziel_bls_code: string
  status: string
  begruendung: string
}

type Abnahme = {
  suchbegriff: string
  ziel_bls_code: string
}

type Kuration = {
  eintraege: AliasEintrag[]
  strittige_zuordnungen: AliasEintrag[]
  ausgeschlossen: { suchbegriff: string, status: string, begruendung: string }[]
  abnahme: Abnahme[]
}

const C = 'supabase_db_LumeOS-Claude-V1'
const DB = process.env.PGDATABASE ?? 'postgres'
const DATA_PATH = path.join('supabase', '_pipeline', 'daten', 'reis-alias-kuration.json')

function sqlString(value: string) {
  return `'${value.replace(/'/g, "''")}'`
}

function suche(q: string) {
  const groups = JSON.stringify(buildFoodSearchGroups(q))
  const sql = `
    select o,
           coalesce(x->>'bls_code','') as bls_code,
           left(coalesce(x->>'name_display_de', x->>'name_de', ''), 80) as name
    from (
      select (nutrition.food_search(
        ${sqlString(q)}, ${sqlString(q)}, ARRAY[]::text[],
        NULL,NULL,NULL,NULL,NULL,10,0,NULL,NULL,NULL,
        ${sqlString(groups)}::jsonb
      ))::jsonb j
    ) t,
    lateral jsonb_array_elements(j->'foods') with ordinality e(x,o);
  `
  const out = execFileSync('docker', [
    'exec', C, 'psql', '-U', 'postgres', '-d', DB,
    '-t', '-A', '-F', '\u0001', '-c', sql,
  ], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })

  return out
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => {
      const [rank, blsCode, name] = line.split('\u0001')
      return { rank: Number(rank), blsCode, name }
    })
}

const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8')) as Kuration
const expected = data.abnahme

let platz1 = 0
let top3 = 0
let top10 = 0
let leer = 0

console.log(`Datendatei: ${DATA_PATH}`)
console.log(`Abnahmebegriffe: ${expected.length}\n`)

for (const item of expected) {
  const result = suche(item.suchbegriff)
  const foundIndex = result.findIndex(row => row.blsCode === item.ziel_bls_code)
  const top = result[0]

  if (!result.length) {
    leer++
    console.log(`LEER    ${item.suchbegriff.padEnd(22)} soll ${item.ziel_bls_code}`)
    continue
  }

  if (foundIndex === 0) {
    platz1++
    top3++
    top10++
    console.log(`OK      ${item.suchbegriff.padEnd(22)} ${top.blsCode} ${top.name}`)
  } else if (foundIndex > 0 && foundIndex < 3) {
    top3++
    top10++
    console.log(`PLATZ${foundIndex + 1}  ${item.suchbegriff.padEnd(22)} oben ${top.blsCode} ${top.name}; soll ${item.ziel_bls_code}`)
  } else if (foundIndex >= 0) {
    top10++
    console.log(`PLATZ${foundIndex + 1}  ${item.suchbegriff.padEnd(22)} oben ${top.blsCode} ${top.name}; soll ${item.ziel_bls_code}`)
  } else {
    console.log(`FEHL    ${item.suchbegriff.padEnd(22)} oben ${top.blsCode} ${top.name}; soll ${item.ziel_bls_code}`)
  }
}

console.log('\nZusammenfassung:')
console.log(`  Sollwert auf Platz 1     : ${platz1} von ${expected.length}`)
console.log(`  in den ersten drei       : ${top3}`)
console.log(`  ueberhaupt in den Top 10 : ${top10}`)
console.log(`  gar keine Treffer        : ${leer}`)

console.log('\nInformativ, nicht abnahmewirksam:')
const extraTerms = [
  ...new Set([
    ...data.strittige_zuordnungen.map(row => row.suchbegriff),
    ...data.ausgeschlossen.map(row => row.suchbegriff),
  ]),
]
for (const term of extraTerms) {
  const result = suche(term)
  const top = result[0]
  if (!top) {
    console.log(`  LEER    ${term}`)
  } else {
    console.log(`  TOP     ${term.padEnd(14)} ${top.blsCode} ${top.name}`)
  }
}

if (platz1 !== expected.length) {
  process.exit(1)
}
