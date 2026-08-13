#!/usr/bin/env node
// Gegenprobe: laufen die beiden Faltungsregeln auseinander?
//
// ANLASS: `food_search` nimmt die gefaltete Anfrage als PARAMETER — die
// Regel steht deshalb zweimal da, einmal in der Datenbank
// (`nutrition.search_fold`), einmal im Anwendungscode
// (`normalizeFoodSearchText`). `[cmd]` 2026-08-14 wichen sie bei 4.769
// von 7.140 Namen (67 %) voneinander ab.
//
// Das ist eine STILLE Fehlerklasse: keine Fehlermeldung, nur leere oder
// falsch sortierte Ergebnisse. Genau dagegen ist diese Pruefung da.
//
// SIE VERGLEICHT NICHT DEN CODE, SONDERN DAS ERGEBNIS. Beide Regeln
// werden auf dieselben Eingaben angewandt und die Ausgaben verglichen —
// aus der Aehnlichkeit zweier Quelltexte folgt nicht dasselbe Verhalten.
//
// WO SIE LEBT: hier, nicht im `pnpm gate` — sie braucht die Datenbank.
//
// AUFRUF:  node supabase/_pipeline/_validierung/normalisierung-pruefen.mjs
//          PGDATABASE=b29probe node …
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

const DB = process.env.PGDATABASE || 'postgres'
const CONTAINER = process.env.LUMEOS_DB_CONTAINER || 'supabase_db_LumeOS-Claude-V1'

// --- Die Anwendungsregel, aus der Quelldatei GELESEN statt kopiert ---
// So kann sie sich nicht unbemerkt von der geprueften Fassung
// entfernen: aendert jemand food-search.ts, prueft diese Datei die
// geaenderte Regel.
const quelle = readFileSync('apps/web/src/lib/nutrition/food-search.ts', 'utf8')
const block = quelle.match(
  /export function normalizeFoodSearchText\(value: string\): string \{([\s\S]*?)\n\}/)
if (!block) {
  console.error('normalizeFoodSearchText nicht gefunden — Quelldatei umgebaut?')
  process.exit(2)
}
// eslint-disable-next-line no-new-func
const appFold = new Function('value', block[1] + '\n')

// --- Eingaben: der echte Bestand plus Grenzfaelle ---
function sql(q) {
  return execFileSync('docker',
    ['exec', '-i', CONTAINER, 'psql', '-U', 'postgres', '-d', DB,
     '-q', '-t', '-A', '-F', '\t', '-c', q],
    { encoding: 'utf8', maxBuffer: 128 * 1024 * 1024 })
}

const grenzfaelle = [
  'Hähnchen Brustfilet, roh', 'Gouda 48 %', 'Karotte/Möhre, roh',
  'Weiße Rübe/Wasserrübe', '  Apfel  ', 'Öl', 'Müsli (mit Nüssen)',
  'Rind Hals/Kamm/Nacken, gekocht', 'ABC', '', 'a  b', 'Straße',
]

console.log('Normalisierung — Gegenprobe beider Regeln')
console.log('Datenbank:', DB)
console.log('')

let geprueft = 0, abweichend = 0
const beispiele = []

// 1. Grenzfaelle einzeln
for (const s of grenzfaelle) {
  const db = sql(`SELECT nutrition.search_fold($q$${s}$q$)`).replace(/\n$/, '')
  const app = appFold(s)
  geprueft++
  if (db !== app) {
    abweichend++
    if (beispiele.length < 10) beispiele.push({ s, db, app })
  }
}

// 2. Der ganze Bestand
const zeilen = sql(
  'SELECT name_de, nutrition.search_fold(name_de) FROM nutrition.foods WHERE name_de IS NOT NULL'
).trim().split('\n')

for (const z of zeilen) {
  const i = z.indexOf('\t')
  const name = z.slice(0, i)
  const db = z.slice(i + 1)
  const app = appFold(name)
  geprueft++
  if (db !== app) {
    abweichend++
    if (beispiele.length < 10) beispiele.push({ s: name, db, app })
  }
}

console.log('Eingaben geprueft :', geprueft)
console.log('Abweichungen      :', abweichend)

if (abweichend) {
  console.log('')
  console.log('Die beiden Regeln laufen auseinander. Beispiele:')
  for (const b of beispiele) {
    console.log('  Eingabe: ' + JSON.stringify(b.s))
    console.log('      DB : ' + JSON.stringify(b.db))
    console.log('      App: ' + JSON.stringify(b.app))
  }
  console.log('')
  console.log('FEHLER: search_fold und normalizeFoodSearchText stimmen nicht ueberein.')
  console.log('Die Suche bricht dadurch STILL — leere oder falsch sortierte')
  console.log('Ergebnisse ohne Fehlermeldung. Eine der beiden Seiten angleichen:')
  console.log('  Datenbank: supabase/_pipeline/07_lesefunktionen/072_normalisierung.sql')
  console.log('  Anwendung: apps/web/src/lib/nutrition/food-search.ts')
  process.exit(1)
}

console.log('')
console.log('OK — beide Regeln liefern auf allen Eingaben dasselbe.')
process.exit(0)
