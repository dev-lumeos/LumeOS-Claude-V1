#!/usr/bin/env node
// specs-pruefen - haelt `docs/specs/` davon ab, einen fremden Zustand
// zu behaupten. A-76.
//
// DER ANLASS
//
// `[cmd]` **Gemessen am 2026-09-27 ueber 159 Dateien in
// `docs/specs/`:** 16 nennen einen Port, den es hier nicht gibt, 11
// nennen Hono, 10 nennen `apps/app/`, und zwei sagten woertlich
// ,,Status: Vollstaendig implementiert (2026-04-14)".
//
// `[cmd]` **Im Repo:** `apps/app/` gibt es nicht, Hono hat null
// Treffer in allen `package.json`, die Ports sind 3200 und 3220.
// `FEATURES.md` fuehrte zehn Features mit `Code:`-Zeile - keine
// dieser Dateien existiert.
//
// `[read]` **Das ist die Ursache, nicht der Schoenheitsfehler.** Ein
// Agent liest ,,vollstaendig implementiert" und sucht nicht mehr. Er
// nimmt die Feldnamen statt der Absicht und haelt fuer vorhanden, was
// in einem anderen Repo stand. Die Quellensichtung Goals hat die
// Differenz an vier Stellen gefunden: G-522 bis G-525.
//
// WAS DIESER WAECHTER TUT
//
//     1  Geltungszeile    jede Spec-Datei traegt `> GELTUNG:`
//        (Sollstand, weil 149 Dateien sie noch nicht haben)
//     2  Statusbehauptung eine Zeile mit ,,Status" UND
//        ,,implementiert" - Soll 0, sofort rot
//
// `[read]` **`docs/specs/` bleibt massgeblich.** Die Entscheidungen
// darin sind getroffen. Falsch ist nur die eine Ebene: was davon
// schon steht und wo. Die Spec beantwortet ,,wie es sein soll", nicht
// ,,wo es liegt".

import fs from 'node:fs'
import path from 'node:path'

const WURZEL = process.cwd()
const SPECS = path.join(WURZEL, 'docs', 'specs')

// `[cmd]` **Stand 2026-09-28:** 159 Dateien, 10 mit Geltungszeile
// (Goals, weil dort gerade gearbeitet wird), 149 ohne.
//
// **HIER nachziehen, mit Datum und Anlass** - je Modul, das seine
// Zeilen bekommt, sinkt die Zahl. Sie darf nur sinken.
const SOLL_OHNE_GELTUNG = 149

const MARKE = '> GELTUNG:'

if (!fs.existsSync(SPECS)) {
  console.log('[specs] docs/specs/ gibt es nicht - nichts zu pruefen.')
  process.exit(0)
}

function mdDateien(ort) {
  const aus = []
  for (const e of fs.readdirSync(ort, { withFileTypes: true })) {
    const p = path.join(ort, e.name)
    if (e.isDirectory()) aus.push(...mdDateien(p))
    else if (e.name.endsWith('.md')) aus.push(p)
  }
  return aus.sort()
}

const dateien = mdDateien(SPECS)
const ohneGeltung = []
const behauptungen = []

for (const voll of dateien) {
  const rel = path.relative(WURZEL, voll).replace(/\\/g, '/')
  const text = fs.readFileSync(voll, 'utf8')
  const zeilen = text.split(/\r?\n/)

  // `[read]` **Die Marke muss ein Zitatblock sein.** Sonst zaehlt
  // auch eine Datei, die das Wort nur erwaehnt.
  if (!zeilen.some(z => z.trimStart().startsWith(MARKE))) {
    ohneGeltung.push(rel)
  }

  // `[read]` **Beides in einer Zeile, nicht eines von beiden.**
  // `Supplements/SPEC_01:177` sagt ,,vollstaendig implementiert" ueber
  // den Enhanced Mode - eine Aussage ueber ein Feature, kein Status.
  // Wer nur nach ,,implementiert" sucht, faengt sie falsch ein; das
  // war mein eigener Fehler am 27.09.
  zeilen.forEach((z, i) => {
    if (/Status/i.test(z) && /implementiert/i.test(z)) {
      behauptungen.push({ rel, nr: i + 1, text: z.trim().slice(0, 100) })
    }
  })
}

// ── Die Aufschluesselung, immer ─────────────────────────────────────
console.log(`[specs] ${dateien.length} Spec-Dateien geprueft.`)
console.log(`[specs] ${ohneGeltung.length} ohne Geltungszeile `
  + `(Soll ${SOLL_OHNE_GELTUNG}) · ${behauptungen.length} `
  + 'Statusbehauptung(en) (Soll 0)')

if (behauptungen.length > 0) {
  console.log('')
  for (const b of behauptungen) {
    console.log(`  ${b.rel}:${b.nr}`)
    console.log(`    ${b.text}`)
  }
}

const zuviel = ohneGeltung.length - SOLL_OHNE_GELTUNG
if (zuviel > 0) {
  console.log('')
  console.log('[specs] neu ohne Geltungszeile (bis zu 10):')
  for (const r of ohneGeltung.slice(-Math.min(zuviel, 10))) {
    console.log(`  ${r}`)
  }
}

// ── Das Urteil ──────────────────────────────────────────────────────
if (behauptungen.length > 0) {
  console.error('')
  console.error(`[specs] ROT: ${behauptungen.length} Statusbehauptung(en), `
    + 'Soll 0.')
  console.error('')
  console.error('  Eine Spec darf nicht sagen, was schon gebaut ist. Was')
  console.error('  gebaut ist, sagt der Code; was offen ist, sagt')
  console.error('  docs/punkte/00-INDEX.md. Ein Agent, der ,,vollstaendig')
  console.error('  implementiert" liest, sucht nicht mehr (A-76).')
  process.exit(1)
}

if (ohneGeltung.length > SOLL_OHNE_GELTUNG) {
  console.error('')
  console.error(`[specs] ROT: ${ohneGeltung.length} Dateien ohne `
    + `Geltungszeile, Soll ${SOLL_OHNE_GELTUNG} - ${zuviel} neu.`)
  console.error('')
  console.error('  Jede neue Spec-Datei traegt oben:')
  console.error('')
  console.error('    > GELTUNG: Die Entscheidungen in dieser Datei gelten.')
  console.error('    > Pfade, Ports, Dateinamen und Angaben darueber, was')
  console.error('    > schon gebaut ist, beschreiben das Vorgaengerrepo')
  console.error('    > lumeos-2026 und gelten NICHT.')
  process.exit(1)
}

if (ohneGeltung.length < SOLL_OHNE_GELTUNG) {
  console.error('')
  console.error(`[specs] ROT: nur noch ${ohneGeltung.length} ohne `
    + `Geltungszeile, Soll ${SOLL_OHNE_GELTUNG} - `
    + `${SOLL_OHNE_GELTUNG - ohneGeltung.length} nachgetragen.`)
  console.error('')
  console.error('  Gute Nachricht mit einer Pflicht: SOLL_OHNE_GELTUNG in')
  console.error(`  tools/specs-pruefen.mjs auf ${ohneGeltung.length} `
    + 'nachziehen, mit Datum.')
  console.error('  Sonst faellt der naechste Rueckschritt nicht auf.')
  process.exit(1)
}

console.log('')
console.log(`[specs] gruen: ${ohneGeltung.length} ohne Geltungszeile, genau `
  + 'der Sollstand, keine Statusbehauptung.')
process.exit(0)
