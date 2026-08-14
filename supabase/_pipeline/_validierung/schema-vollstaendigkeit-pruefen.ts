#!/usr/bin/env node
// ABSCHLUSSPRUEFUNG DER KETTE: steht nach einem vollstaendigen Lauf
// alles da, was dastehen muss?
//
// ANLASS (2026-08-16): `[cmd]` Nach dem Neuaufbau fuer C-38 fehlten
// nutrition.meals, meal_items, water_logs und zwei Sichten — dazu 12
// Policies, 2 Funktionen und 4 Trigger. **Kein Kettenlauf hat sich
// beschwert.** Die damalige Abschlusspruefung zaehlte nur foods,
// food_nutrients, food_aliases, food_tags, search_synonyms und die
// sort_weight-Stufen; was in keiner Erwartungsliste stand, konnte
// spurlos fehlen.
//
// DER ENTSCHEIDENDE PUNKT: Die Sollliste steht im REPO
// (supabase/_pipeline/daten/schema-sollstand.json), nicht in der
// Datenbank. `[read]` Genau dieser Fehler ist hier schon einmal
// passiert — eine Rechtepruefung, die ihre Sollliste vom Prueflig bezog
// und deshalb jeden Zustand bestaetigte. Eine Pruefung, die ihre
// Erwartung aus dem Prueflig ableitet, prueft nichts.
//
// AUFRUF: pnpm exec tsx supabase/_pipeline/_validierung/schema-vollstaendigkeit-pruefen.ts
// Exit 0 = vollstaendig, Exit 1 = etwas fehlt.
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'

const C = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const DB = process.env.PGDATABASE ?? 'postgres'
const SEP = ''

function sql(text: string): string[][] {
  return execFileSync('docker',
    ['exec', C, 'psql', '-U', 'postgres', '-d', DB, '-t', '-A', '-F', SEP, '-c', text],
    { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
    .split('\n').map(z => z.trimEnd()).filter(Boolean).map(z => z.split(SEP))
}

const SOLL = JSON.parse(
  fs.readFileSync('supabase/_pipeline/daten/schema-sollstand.json', 'utf8'))

const istTabellen = new Set(sql(
  `SELECT table_name FROM information_schema.tables
   WHERE table_schema='nutrition' AND table_type='BASE TABLE';`).map(r => r[0]))
const istSichten = new Set(sql(
  `SELECT table_name FROM information_schema.tables
   WHERE table_schema='nutrition' AND table_type='VIEW';`).map(r => r[0]))
const istFunktionen = new Set(sql(
  `SELECT DISTINCT p.proname FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
   WHERE n.nspname='nutrition';`).map(r => r[0]))

console.log('Schema-Vollstaendigkeit — Datenbank:', DB)
console.log('Sollliste: supabase/_pipeline/daten/schema-sollstand.json (von Hand gepflegt)')
console.log('')

const fehler: string[] = []
const warnung: string[] = []

function pruefe(art: string, soll: Array<{ name: string; schritt: string }>, ist: Set<string>) {
  const fehlend = soll.filter(s => !ist.has(s.name))
  const zuviel = [...ist].filter(n => !soll.some(s => s.name === n))
  console.log(`${art.padEnd(12)} ${soll.length - fehlend.length}/${soll.length} vorhanden`)
  for (const f of fehlend) {
    fehler.push(`${art}: ${f.name} FEHLT — erzeugt von Schritt ${f.schritt}`)
  }
  for (const z of zuviel) {
    // Unerwartetes ist kein Fehler, aber es gehoert genannt: entweder
    // ist die Liste veraltet oder es liegt Ausschuss im Schema.
    const bekannt = SOLL.nicht_erwartet[z]
    warnung.push(bekannt
      ? `${art}: ${z} steht da und ist als "nicht erwartet" vermerkt (${bekannt})`
      : `${art}: ${z} steht da, aber NICHT in der Sollliste — Liste veraltet oder Ausschuss`)
  }
}

pruefe('Tabellen', SOLL.tabellen, istTabellen)
pruefe('Sichten', SOLL.sichten, istSichten)
pruefe('Funktionen', SOLL.funktionen, istFunktionen)

// Mindestzeilen: eine Tabelle kann existieren und trotzdem leer sein.
console.log('')
console.log('Mindestzeilen:')
for (const [tab, min] of Object.entries(SOLL.mindestzeilen)) {
  if (tab.startsWith('_')) continue
  if (!istTabellen.has(tab)) continue          // Fehlen ist oben schon gemeldet
  const n = Number(sql(`SELECT count(*) FROM nutrition.${tab};`)[0][0])
  const ok = n >= (min as number)
  console.log(`  ${tab.padEnd(20)} ${String(n).padStart(7)} / ${String(min).padStart(7)}  ${ok ? 'ok' : 'ZU WENIG'}`)
  if (!ok) fehler.push(`Zeilen: nutrition.${tab} hat ${n}, erwartet mindestens ${min}`)
}

console.log('')
if (warnung.length) {
  console.log('Hinweise:')
  for (const w of warnung) console.log('  · ' + w)
  console.log('')
}

if (fehler.length) {
  console.log('FEHLT:')
  for (const f of fehler) console.log('  · ' + f)
  console.log('')
  console.log(`SCHEMA UNVOLLSTAENDIG — ${fehler.length} Abweichung(en)`)
  process.exit(1)
}

console.log('SCHEMA VOLLSTAENDIG')
