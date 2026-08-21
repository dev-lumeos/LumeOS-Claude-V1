#!/usr/bin/env node
// Prueft die Nummernvergabe in docs/todo/.
//
// Anlass (2026-08-21): Neun Nummern waren gleichzeitig doppelt vergeben \u2014
// darunter A-18, das selbst "Berichtsnummern kollidieren" heisst. Die Regel
// stand in CLAUDE.md und griff nicht, weil sie ein Absatz war und kein
// Werkzeug.
//
// Prueft:
//   1. Dubletten innerhalb von TODO.md
//   2. Dubletten innerhalb von ERLEDIGT.md
//   3. Nummern, die in beiden Dateien stehen
//   4. Den Zaehler im TODO-Kopf gegen die Datei
//
// Gibt ausserdem die hoechste Nummer je Reihe aus, damit der Orchestrator
// nicht raten muss.
//
// Gegenprobe: LUMEOS_NUMMERN_SELBSTTEST=1 baut eine Dublette ein und
// erwartet Exitcode 1.

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const WURZEL = resolve(process.cwd())
const TODO = resolve(WURZEL, 'docs/todo/TODO.md')
const ERLEDIGT = resolve(WURZEL, 'docs/todo/ERLEDIGT.md')
const SELBSTTEST = process.env.LUMEOS_NUMMERN_SELBSTTEST === '1'

const ZEILE = /^- \[( |x|~)\] \*\*([A-Z]+-\d+[a-z]?):/

function punkte(pfad, zusatz = '') {
  const text = readFileSync(pfad, 'utf8') + zusatz
  const aus = []
  text.split('\n').forEach((z, i) => {
    const m = z.match(ZEILE)
    if (m) aus.push({ nr: m[2], zeile: i + 1, titel: z.slice(0, 90) })
  })
  return aus
}

function dubletten(liste) {
  const zaehler = new Map()
  for (const p of liste) {
    if (!zaehler.has(p.nr)) zaehler.set(p.nr, [])
    zaehler.get(p.nr).push(p)
  }
  return [...zaehler.entries()].filter(([, v]) => v.length > 1)
}

const zusatz = SELBSTTEST ? '\n- [ ] **A-01: eingebaute Dublette fuer den Selbsttest**\n' : ''
const offen = punkte(TODO, zusatz)
const fertig = punkte(ERLEDIGT)

let fehler = 0

for (const [datei, liste] of [['TODO.md', offen], ['ERLEDIGT.md', fertig]]) {
  for (const [nr, vor] of dubletten(liste)) {
    console.error(`[nummern] ${datei}: ${nr} steht ${vor.length}x`)
    vor.forEach(v => console.error(`            Zeile ${v.zeile}: ${v.titel}`))
    fehler++
  }
}

const fertigNr = new Set(fertig.map(p => p.nr))
for (const p of offen) {
  if (fertigNr.has(p.nr)) {
    console.error(`[nummern] ${p.nr} steht offen UND erledigt \u2014 TODO Zeile ${p.zeile}`)
    fehler++
  }
}

// Zaehler im Kopf
const kopf = readFileSync(TODO, 'utf8').slice(0, 600)
const m = kopf.match(/\*\*Stand:[^*]*\*\*\s*(\d+)\s+offen/)
const echtOffen = offen.filter(p => p.titel.startsWith('- [ ]')).length
  - (SELBSTTEST ? 1 : 0)
if (m) {
  const behauptet = Number(m[1])
  if (behauptet !== echtOffen) {
    console.error(`[nummern] Kopf sagt ${behauptet} offen, gezaehlt sind ${echtOffen}`)
    fehler++
  }
} else {
  console.error('[nummern] Kein Zaehler im Kopf gefunden \u2014 Format "**Stand: DATUM.** N offen"')
  fehler++
}

if (fehler === 0) {
  const hoch = new Map()
  for (const p of [...offen, ...fertig]) {
    const [pre, num] = p.nr.split(/-(?=\d)/)
    const n = parseInt(num, 10)
    hoch.set(pre, Math.max(hoch.get(pre) ?? 0, n))
  }
  const liste = [...hoch.entries()].sort().map(([k, v]) => `${k}-${v}`).join(' \u00b7 ')
  console.log(`[nummern] ${offen.length} offen, ${fertig.length} erledigt, keine Dublette.`)
  console.log(`[nummern] Naechste freie Nummer je Reihe nach: ${liste}`)
}

if (SELBSTTEST) {
  if (fehler === 0) {
    console.error('[nummern] SELBSTTEST: die eingebaute Dublette wurde NICHT gefunden.')
    process.exit(1)
  }
  console.log('[nummern] SELBSTTEST bestanden \u2014 die Dublette wurde gefunden.')
  process.exit(0)
}

process.exit(fehler > 0 ? 1 : 0)
