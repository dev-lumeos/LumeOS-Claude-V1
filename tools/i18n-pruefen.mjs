#!/usr/bin/env node
// A-15: Vollstaendigkeit der Uebersetzungen.
//
// ANLASS. `[read]` next-intl erkennt fehlende Schluessel in
// Zweitsprachen NICHT zur Uebersetzungszeit — sie fallen erst zur
// Laufzeit auf, und dort wird stillschweigend auf die Hauptsprache
// zurueckgefallen. Ein Schluessel, den nur `de` kennt, sieht in `en`
// aus wie eine Uebersetzung und ist keine.
//
// WAS DIESE PRUEFUNG TUT:
//   * Ein Schluessel in `de` ohne Entsprechung in `en` -> ROT.
//     Und umgekehrt: `en` ohne `de` -> ebenfalls ROT.
//   * Thai wird GEZAEHLT, nicht erzwungen. Die Zahl steht in der
//     Ausgabe, damit sichtbar ist, wie gross ein Uebersetzungsauftrag
//     waere. `[read]` „Thai sehen wir vor und ziehen wir bei Bedarf
//     nach" — eine leere Datei ist hier der Sollzustand, kein Mangel.
//   * Leere Zeichenketten zaehlen als FEHLEND. Ein Schluessel mit ''
//     ist keine Uebersetzung, sondern eine Luecke mit Deckmantel.
//
// Muster und Platz nach `tools/encoding-pruefen.mjs`: laeuft in
// `pnpm gate` VOR Turbo, damit die Zahl der Tasks unveraendert bleibt.
import { readFileSync, existsSync } from 'node:fs'
import path from 'node:path'

const WURZEL = process.cwd()
const VERZEICHNIS = path.join(WURZEL, 'apps/web/messages')

/** Die Sprachen, die befuellt sein MUESSEN. */
const PFLICHT = ['de', 'en']
/** Vorgesehen, aber nicht erzwungen. */
const OPTIONAL = ['th']

/** Baum zu flacher Schluesselliste: { "Nutrition.titel": "Wert" }. */
function flach(baum, praefix = '') {
  const aus = new Map()
  for (const [k, v] of Object.entries(baum)) {
    const voll = praefix ? `${praefix}.${k}` : k
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      for (const [kk, vv] of flach(v, voll)) aus.set(kk, vv)
    } else {
      aus.set(voll, v)
    }
  }
  return aus
}

function lies(sprache) {
  const p = path.join(VERZEICHNIS, `${sprache}.json`)
  if (!existsSync(p)) return { fehltDatei: true, schluessel: new Map() }
  let roh
  try {
    roh = JSON.parse(readFileSync(p, 'utf8'))
  } catch (e) {
    return { kaputt: e.message, schluessel: new Map() }
  }
  return { schluessel: flach(roh) }
}

const daten = {}
for (const s of [...PFLICHT, ...OPTIONAL]) daten[s] = lies(s)

const fehler = []

// 1. Datei fehlt oder ist kein gueltiges JSON.
for (const s of [...PFLICHT, ...OPTIONAL]) {
  if (daten[s].fehltDatei) {
    fehler.push(`Die Datei apps/web/messages/${s}.json fehlt.`)
  } else if (daten[s].kaputt) {
    fehler.push(`apps/web/messages/${s}.json ist kein gueltiges JSON: ${daten[s].kaputt}`)
  }
}

// 2. Pflichtsprachen gegeneinander — in BEIDE Richtungen.
const luecken = new Map()
if (!fehler.length) {
  for (const a of PFLICHT) {
    for (const b of PFLICHT) {
      if (a === b) continue
      for (const [k, v] of daten[a].schluessel) {
        const gegen = daten[b].schluessel
        const fehlt = !gegen.has(k)
        const leer = gegen.has(k) && (gegen.get(k) === '' || gegen.get(k) === null)
        if (fehlt || leer) {
          if (!luecken.has(b)) luecken.set(b, [])
          luecken.get(b).push({ k, grund: fehlt ? 'fehlt' : 'leer', vorbild: a, wert: v })
        }
      }
      // Leere Werte in `a` selbst sind auch eine Luecke.
      for (const [k, v] of daten[a].schluessel) {
        if (v === '' || v === null) {
          if (!luecken.has(a)) luecken.set(a, [])
          if (!luecken.get(a).some(x => x.k === k)) {
            luecken.get(a).push({ k, grund: 'leer', vorbild: a, wert: '' })
          }
        }
      }
    }
  }
}

const gesamt = daten[PFLICHT[0]]?.schluessel.size ?? 0

// 3. Optionale Sprachen: zaehlen, nicht erzwingen.
const optionalStand = OPTIONAL.map(s => {
  const habe = daten[s].schluessel
  const belegt = [...habe].filter(([, v]) => v !== '' && v !== null).length
  return { s, belegt, offen: Math.max(0, gesamt - belegt) }
})

const anzahlLuecken = [...luecken.values()].reduce((n, l) => n + l.length, 0)

if (!fehler.length && anzahlLuecken === 0) {
  console.log(`[i18n] ${gesamt} Schluessel je Pflichtsprache (${PFLICHT.join(', ')}), vollstaendig.`)
  for (const o of optionalStand) {
    console.log(`[i18n] ${o.s}: ${o.belegt} von ${gesamt} belegt — ${o.offen} offen (vorgesehen, nicht erzwungen).`)
  }
  process.exit(0)
}

console.error('[i18n] ROT.')
for (const f of fehler) console.error(`  ${f}`)
for (const [sprache, liste] of [...luecken].sort()) {
  console.error(`  ${sprache}.json — ${liste.length} Luecke(n):`)
  for (const l of liste.slice(0, 12)) {
    console.error(`      ${l.k}  (${l.grund}; ${l.vorbild} hat: ${JSON.stringify(l.wert).slice(0, 48)})`)
  }
  if (liste.length > 12) console.error(`      … und ${liste.length - 12} weitere`)
}
console.error('')
console.error('[i18n] Pflichtsprachen sind de und en — beide Richtungen zaehlen.')
for (const o of optionalStand) {
  console.error(`[i18n] ${o.s}: ${o.belegt} von ${gesamt} belegt (nicht erzwungen).`)
}
process.exit(1)
