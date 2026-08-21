#!/usr/bin/env node
// Prueft, ob Servercode im Browserbuendel gelandet ist.
//
// `[read]` Der Anlass: viermal brach der Build, weil ein Wert-Import aus
// einer Datei mit `next/headers` in eine `'use client'`-Datei geriet
// (G-74, G-79, G-97, A-30). Der Typecheck sieht das nicht — er kennt
// keine Buendelgrenzen. Erst der Build meldet es, und die Meldung nennt
// die Ursache nicht.
//
// `[cmd]` Auf `next/headers` zu pruefen taugt NICHT: am 2026-08-21
// gemessen steht die Zeichenkette in 0 von 104 Serverdateien und 0 von
// 49 Client-Chunks — Next loest den Import beim Buendeln auf. Eine
// Pruefung darauf waere immer gruen.
//
// Gemessen wird deshalb, was das Buendeln ueberlebt: `createServerClient`
// (Server 3 / Client 0) und `cookies()` (Server 4 / Client 0). Beide
// stehen ausschliesslich in Servercode. `createBrowserClient` taugt
// nicht — es steht erwartungsgemaess in beiden.
import fs from 'node:fs'
import path from 'node:path'

const basis = process.argv[2] ?? path.join('apps', 'web', '.next-gate')

// Marken, die nur in Servercode vorkommen duerfen.
const MARKEN = ['createServerClient', 'cookies()']

function sammle(wurzel) {
  const raus = []
  if (!fs.existsSync(wurzel)) return raus
  for (const eintrag of fs.readdirSync(wurzel, { withFileTypes: true })) {
    const p = path.join(wurzel, eintrag.name)
    if (eintrag.isDirectory()) raus.push(...sammle(p))
    else if (eintrag.name.endsWith('.js')) raus.push(p)
  }
  return raus
}

const clientWurzel = path.join(basis, 'static', 'chunks')
const serverWurzel = path.join(basis, 'server')

if (!fs.existsSync(clientWurzel)) {
  console.error(`[serverimport] FEHLER: kein Build unter ${basis}`)
  console.error('')
  console.error('  `[cmd]` Am 2026-08-21 gegengeprobt: Genau DIESER Fall tritt ein,')
  console.error('  wenn der Fehler wieder eingebaut wird — der Build bricht ab und')
  console.error('  raeumt `.next-gate` weg, bevor diese Pruefung laeuft. Die')
  console.error('  Buildmeldung nennt die Ursache dann selbst:')
  console.error("    \"You're importing a component that needs next/headers\"")
  console.error('    + \"Import trace for requested module\"')
  console.error('')
  console.error('  Wenn der Build gruen war und trotzdem nichts dasteht:')
  console.error('  `pnpm --filter @lumeos/web build` laufen lassen — nie `next build`')
  console.error('  direkt, das schreibt nach `.next` (B-18).')
  process.exit(1)
}

const clientDateien = sammle(clientWurzel)
const serverDateien = sammle(serverWurzel)

// Die Gegenrichtung: stehen die Marken ueberhaupt irgendwo? Sonst misst
// die Pruefung nichts und meldet faelschlich "sauber".
const serverTreffer = new Map(MARKEN.map(m => [m, 0]))
for (const datei of serverDateien) {
  const text = fs.readFileSync(datei, 'utf8')
  for (const m of MARKEN) if (text.includes(m)) serverTreffer.set(m, serverTreffer.get(m) + 1)
}

const stumpf = MARKEN.filter(m => serverTreffer.get(m) === 0)
if (stumpf.length) {
  console.error('[serverimport] FEHLER: die Pruefung misst nichts mehr.')
  console.error(`  Keine Serverdatei enthaelt: ${stumpf.join(', ')}`)
  console.error('  Entweder hat sich der Supabase-Einstieg geaendert, oder der')
  console.error('  Build ist unvollstaendig. Marken in dieser Datei nachziehen.')
  process.exit(1)
}

// Die eigentliche Richtung: nichts davon gehoert in den Browser.
const funde = []
for (const datei of clientDateien) {
  const text = fs.readFileSync(datei, 'utf8')
  for (const m of MARKEN) {
    if (text.includes(m)) funde.push({ datei: path.relative(basis, datei), marke: m })
  }
}

if (funde.length) {
  console.error('[serverimport] FEHLER: Servercode steht im Browserbuendel.')
  for (const f of funde) console.error(`  ${f.datei}  enthaelt  ${f.marke}`)
  console.error('')
  console.error('  Ursache ist fast immer ein WERT-Import aus einer Datei, die')
  console.error('  `next/headers` zieht, in eine `\'use client\'`-Datei.')
  console.error('  Muster: Werte und Typen in eine serverfreie Datei ziehen')
  console.error('  (Vorbild: `lib/coach/rechte-modell.ts` neben `rechte-read.ts`).')
  process.exit(1)
}

const zaehlung = MARKEN.map(m => `${m} ${serverTreffer.get(m)}x Server`).join(', ')
console.log(
  `[serverimport] ${clientDateien.length} Client-Chunks geprueft, 0 Treffer; ` +
  `Gegenprobe: ${zaehlung}.`
)
