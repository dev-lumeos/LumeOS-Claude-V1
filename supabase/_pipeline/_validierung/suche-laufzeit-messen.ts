#!/usr/bin/env node
// C-17: Laufzeit der VOLLSTAENDIGEN Suchfunktion.
//
// `[read]` Die Lehre aus dem verworfenen Slot-Versuch: isoliert schnell
// heisst nicht eingebaut schnell. Gemessen wird deshalb immer der
// ganze Aufruf von nutrition.food_search, nie ein Teilausdruck.
//
// Median aus mehreren Laeufen — ein Einzelwert misst die Maschine,
// nicht die Abfrage.
//
// AUFRUF: pnpm exec tsx supabase/_pipeline/_validierung/suche-laufzeit-messen.ts
//         PGDATABASE=wegwerf_c17 pnpm exec tsx …
import { execFileSync } from 'node:child_process'
import { buildFoodSearchGroups } from '../../../apps/web/src/lib/nutrition/food-search'

const C = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const DB = process.env.PGDATABASE ?? 'postgres'
const LAEUFE = Number(process.env.LAEUFE ?? '5')

const ANFRAGEN = [
  '',                       // leer — die Grundkosten
  'spinat',                 // einwortig
  'reis',                   // einwortig, viele Treffer
  'huhn',                   // einwortig, Synonymgruppe
  'huehnerbrust',           // zweiwortig nach Zerlegung
  'haehnchen brust roh',    // dreiwortig
]

const q1 = (s: string) => "'" + String(s).replace(/'/g, "''") + "'"

function messe(anfrage: string): { median: number; treffer: number } {
  const g = JSON.stringify(buildFoodSearchGroups(anfrage)).replace(/'/g, "''")
  const gj = g === '[]' ? 'NULL' : `'${g}'::jsonb`
  const a = q1(anfrage)
  const stmt = `EXPLAIN (ANALYZE, TIMING OFF, COSTS OFF, FORMAT JSON)
    SELECT nutrition.food_search(${a},${a},ARRAY[]::text[],NULL,NULL,NULL,NULL,'relevance',25,0,NULL,NULL,false,${gj});`
  const zeiten: number[] = []
  for (let i = 0; i < LAEUFE; i++) {
    const out = execFileSync('docker',
      ['exec', C, 'psql', '-U', 'postgres', '-d', DB, '-t', '-A', '-c', stmt],
      { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
    zeiten.push(JSON.parse(out.trim())[0]['Execution Time'])
  }
  zeiten.sort((x, y) => x - y)
  const treffer = Number(execFileSync('docker',
    ['exec', C, 'psql', '-U', 'postgres', '-d', DB, '-t', '-A', '-c',
     `SELECT (nutrition.food_search(${a},${a},ARRAY[]::text[],NULL,NULL,NULL,NULL,'relevance',25,0,NULL,NULL,false,${gj})::jsonb)->>'total';`],
    { encoding: 'utf8' }).trim())
  return { median: zeiten[Math.floor(zeiten.length / 2)], treffer }
}

console.log(`Suchlaufzeit — Datenbank: ${DB}, Median aus ${LAEUFE} Laeufen`)
console.log('')
console.log('Anfrage                  Median ms   Treffer')
console.log('-'.repeat(48))
for (const a of ANFRAGEN) {
  const r = messe(a)
  console.log((a || '(leer)').padEnd(24) + r.median.toFixed(1).padStart(9) + String(r.treffer).padStart(10))
}
