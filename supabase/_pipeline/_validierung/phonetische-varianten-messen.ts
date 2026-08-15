#!/usr/bin/env node
// Misst vorbereitete C-22-Phonetikdaten gegen nutrition.food_search.
// Keine Writes, kein Kettenschritt, kein Neuaufbau.
//
// AUFRUF:
//   pnpm exec tsx supabase/_pipeline/_validierung/phonetische-varianten-messen.ts
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import {
  buildFoodSearchGroups,
  buildFoodSearchTokens,
  normalizeFoodSearchText,
} from '../../../apps/web/src/lib/nutrition/food-search'

type Abnahme = {
  suchbegriff: string
  referenzbegriff: string
  ziel_bls_code: string
}

type Daten = {
  abnahme: Abnahme[]
}

type Treffer = {
  rank: number
  blsCode: string
  name: string
}

const C = 'supabase_db_LumeOS-Claude-V1'
const DB = process.env.PGDATABASE ?? 'postgres'
const DATA_PATH = path.join('supabase', '_pipeline', 'daten', 'phonetische-varianten.json')

function sqlString(value: string) {
  return `'${value.replace(/'/g, "''")}'`
}

function sqlTextArray(values: string[]) {
  return `ARRAY[${values.map(sqlString).join(',')}]::text[]`
}

function suche(q: string): Treffer[] {
  const norm = normalizeFoodSearchText(q)
  const tokens = buildFoodSearchTokens(q)
  const groups = JSON.stringify(buildFoodSearchGroups(q))
  const sql = `
    select o,
           coalesce(x->>'bls_code','') as bls_code,
           left(coalesce(x->>'name_display_de', x->>'name_de', ''), 90) as name
    from (
      select (nutrition.food_search(
        ${sqlString(q)}, ${sqlString(norm)}, ${sqlTextArray(tokens)},
        NULL,NULL,NULL,NULL,'relevance',10,0,NULL,NULL,false,
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

const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8')) as Daten

let referenzPlatz1 = 0
let variantePlatz1 = 0
let varianteLeer = 0
let varianteTop10 = 0

console.log(`Datendatei: ${DATA_PATH}`)
console.log(`Abnahmebegriffe: ${data.abnahme.length}\n`)

for (const item of data.abnahme) {
  const referenz = suche(item.referenzbegriff)
  const variante = suche(item.suchbegriff)
  const refTop = referenz[0]
  const varTop = variante[0]
  const varIndex = variante.findIndex(row => row.blsCode === item.ziel_bls_code)

  if (refTop?.blsCode === item.ziel_bls_code) referenzPlatz1++
  if (varIndex === 0) variantePlatz1++
  if (varIndex >= 0 && varIndex < 10) varianteTop10++
  if (variante.length === 0) varianteLeer++

  const refText = refTop ? `${refTop.blsCode} ${refTop.name}` : 'LEER'
  const varText = varTop ? `${varTop.blsCode} ${varTop.name}` : 'LEER'
  const status = varIndex === 0 ? 'OK' : varIndex > 0 ? `PLATZ${varIndex + 1}` : 'FEHL'

  console.log(`${status.padEnd(7)} ${item.suchbegriff.padEnd(14)} soll ${item.ziel_bls_code}`)
  console.log(`        Referenz ${item.referenzbegriff.padEnd(12)} -> ${refText}`)
  console.log(`        Variante ${item.suchbegriff.padEnd(12)} -> ${varText}`)
}

console.log('\nZusammenfassung:')
console.log(`  Referenzbegriff auf Platz 1 : ${referenzPlatz1} von ${data.abnahme.length}`)
console.log(`  Variante auf Platz 1        : ${variantePlatz1} von ${data.abnahme.length}`)
console.log(`  Variante in Top 10          : ${varianteTop10}`)
console.log(`  Variante ohne Treffer       : ${varianteLeer}`)

if (variantePlatz1 !== data.abnahme.length) {
  process.exit(1)
}
