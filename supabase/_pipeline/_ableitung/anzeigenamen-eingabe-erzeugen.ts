#!/usr/bin/env node
// Erzeugt die Eingabe fuer C-39 Phase 2 und die deterministische 200er-Probe.
//
// AUFRUF:
//   pnpm exec tsx supabase/_pipeline/_ableitung/anzeigenamen-eingabe-erzeugen.ts
//
// Schreibt:
//   supabase/_pipeline/daten/anzeigenamen-eingabe.jsonl
//   supabase/_pipeline/daten/anzeigenamen-probe-eingabe.jsonl
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'

const C = 'supabase_db_LumeOS-Claude-V1'
const DB = process.env.PGDATABASE ?? 'postgres'
const DATEN = 'supabase/_pipeline/daten'
const REGEL_GRUPPEN = new Set(['C', 'F', 'G', 'H', 'K'])
const GERICHTE = new Set(['X', 'Y'])

type Food = {
  bls_code: string
  name_de: string
  name_en: string
  warengruppe: string
}

const MEALCAM_CODES = [
  'V416100', 'V486100', 'U010100', 'U131100', 'T410100', 'T121100',
  'T753100', 'E113100', 'E112100', 'M713100', 'M711100', 'M710100',
  'M111300', 'M0A1000', 'B101000', 'Q120000',
]

function psql(sql: string) {
  return execFileSync('docker', [
    'exec', C, 'psql', '-U', 'postgres', '-d', DB, '-t', '-A', '-c', sql,
  ], { encoding: 'utf8', maxBuffer: 128 * 1024 * 1024 })
}

function jsonl(rows: Food[]) {
  return rows.map(r => JSON.stringify(r)).join('\n') + '\n'
}

const sql = `
select jsonb_build_object(
  'bls_code', bls_code,
  'name_de', name_de,
  'name_en', coalesce(name_en, ''),
  'warengruppe', left(bls_code, 1)
)::text
from nutrition.foods
where left(bls_code, 1) not in ('C', 'F', 'G', 'H', 'K')
order by bls_code;
`

const rows = psql(sql)
  .split('\n')
  .map(s => s.trim())
  .filter(Boolean)
  .map(s => JSON.parse(s) as Food)

fs.mkdirSync(DATEN, { recursive: true })
fs.writeFileSync(`${DATEN}/anzeigenamen-eingabe.jsonl`, jsonl(rows), 'utf8')

const byCode = new Map(rows.map(r => [r.bls_code, r]))
const sample = new Map<string, Food>()

for (const code of MEALCAM_CODES) {
  const row = byCode.get(code)
  if (row && !REGEL_GRUPPEN.has(row.warengruppe)) sample.set(code, row)
}

for (const row of rows.filter(r => GERICHTE.has(r.warengruppe)).slice(0, 50)) {
  sample.set(row.bls_code, row)
}

const restGroups = [...new Set(rows.map(r => r.warengruppe))]
  .filter(g => !REGEL_GRUPPEN.has(g) && !GERICHTE.has(g))
  .sort()
const restTarget = 200 - sample.size
const base = Math.floor(restTarget / restGroups.length)
let extra = restTarget % restGroups.length

for (const group of restGroups) {
  const n = base + (extra-- > 0 ? 1 : 0)
  const candidates = rows.filter(r => r.warengruppe === group && !sample.has(r.bls_code))
  const stride = Math.max(1, Math.floor(candidates.length / n))
  let picked = 0
  for (let i = 0; i < candidates.length && picked < n; i += stride) {
    sample.set(candidates[i].bls_code, candidates[i])
    picked++
  }
  for (const row of candidates) {
    if (picked >= n) break
    if (!sample.has(row.bls_code)) {
      sample.set(row.bls_code, row)
      picked++
    }
  }
}

const sampleRows = [...sample.values()].sort((a, b) => a.bls_code.localeCompare(b.bls_code))
fs.writeFileSync(`${DATEN}/anzeigenamen-probe-eingabe.jsonl`, jsonl(sampleRows), 'utf8')

console.log(`anzeigenamen-eingabe.jsonl: ${rows.length}`)
console.log(`anzeigenamen-probe-eingabe.jsonl: ${sampleRows.length}`)
console.log(`MealCam-Codes in Probe: ${MEALCAM_CODES.filter(c => sample.has(c)).length}`)
console.log(`Gerichte X/Y in Probe: ${sampleRows.filter(r => GERICHTE.has(r.warengruppe)).length}`)
