// Zaehlt SEQUENZIELLE `await` in den Seitenkomponenten.
//
// ══ WARUM ES DIESE PRUEFUNG GIBT ═══════════════════════════════════
//
// `[cmd]` **Der Anlass, gemessen am 2026-08-25:**
// `v2/supplements/page.tsx` lud sechs unabhaengige Abfragen
// NACHEINANDER — **1373–1531 ms**, wo parallel **993–1011 ms**
// gereicht haetten.
//
// `[cmd]` **Die Kette ist in fuenf Auftraegen gewachsen**, je zwei
// Abfragen: 0 → 2 → 2 → 4 → 6. Jeder Schritt war fuer sich klein und
// vertretbar; keiner hat die Summe gemessen. **Genau so entsteht
// dieser Fehler** — nicht durch eine falsche Entscheidung, sondern
// durch fuenf richtige hintereinander.
//
// `[read]` **C-189 hat dieselbe Lehre schon einmal hinterlassen** —
// ein Aufruf in der Schleife, 7.641 ms → 144 ms, *„fuenf Auftraege
// haben ihn angefasst, keiner hat es gemessen."* Sie steht seither als
// Merksatz in `CLAUDE.md` und hat nicht getragen.
//
// **Eine Lehre, die keine Pruefung wird, wiederholt sich.** Deshalb
// zaehlt das hier eine Maschine und nicht ein Mensch beim Nachdenken.
//
// ══ WOHER DIE SCHWELLE KOMMT ══════════════════════════════════════
//
// `[cmd]` **Aus den Daten, nicht aus dem Bauch.** Gemessen ueber alle
// `page.tsx` unter `app/v2` am 2026-08-25 — die Zahlen stehen unten
// im Lauf. Die Schwelle liegt bei 3: sie laesst jedes Modul durch,
// das seine unabhaengigen Abfragen buendelt, und faengt den Fall, der
// hier aufgetreten ist.
//
// Aufruf: node tools/ladekette-pruefen.mjs
import { readFileSync } from 'node:fs'
import { globSync } from 'node:fs'
import { relative } from 'node:path'

const WURZEL = process.cwd()
const SCHWELLE = 3

/**
 * Was beim Anlegen der Pruefung schon zu lang war.
 *
 * `[cmd]` **Gemessen 2026-08-25, alle 13 Seiten unter `app/v2`:**
 * acht liegen bei 0–2, Medical bei 2 — **dann der Sprung auf Training
 * 5 und Nutrition 10.** Die Schwelle 3 sitzt in dieser Luecke; sie ist
 * aus den Zahlen abgeleitet, nicht geschaetzt.
 *
 * `[read]` **Die beiden stehen hier, damit die Pruefung ab heute
 * gruen ist.** Ein Waechter, der vom ersten Tag an rot leuchtet, wird
 * nach einer Woche abgeschaltet — dann haette er nichts bewirkt. Sie
 * sind KEINE Freigabe: beide sind echte Funde und gehoeren behoben,
 * dann faellt die Zeile hier weg.
 *
 * **Wer eine Zeile hinzufuegt, statt eine zu streichen, tut das
 * Falsche.**
 */
const UEBERGANG = new Map([
  ['nutrition/page.tsx', 10],
  ['training/page.tsx', 5],
])

/** Kommentare und Zeichenketten raus — sonst zaehlt ein `await` im
 *  Fliesstext mit. Genau dieser Fehler ist mir in G-186 dreimal
 *  passiert. */
function entkleiden(s) {
  return s
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^[ \t]*\/\/.*$/gm, '')
    .replace(/`(?:[^`\\]|\\.)*`/g, '``')
    .replace(/'(?:[^'\\\n]|\\.)*'/g, "''")
    .replace(/"(?:[^"\\\n]|\\.)*"/g, '""')
}

/**
 * Wer die Identitaet holt, ist ein echter Vorgaenger.
 *
 * `[cmd]` **Fuenf Seiten tun das** — die UUID oder der Client wird
 * gebraucht, BEVOR die naechste Abfrage laufen kann. Das ist kein
 * Versaeumnis, sondern eine Abhaengigkeit.
 *
 * `[read]` **Ohne diese Ausnahme bestraft der Waechter richtigen
 * Code**, und ein Waechter, der auf korrektem Code rot ist, wird
 * abgeschaltet statt befolgt.
 */
const VORGAENGER = /await\s+(angemeldeteNutzerin|createSessionClient|createServerClient)\b|await\s+\w*[Ss]upabase\.auth\.|await\s+client\.auth\./

/**
 * Sequenzielle `await` im Rumpf der Standardausfuhr.
 *
 * `[read]` **Ein `await` in einem `Promise.all` zaehlt nicht** — es
 * wartet auf ein Buendel, nicht auf einen Vorgaenger. Gezaehlt werden
 * nur `await`, die ALLEIN in ihrer Zeile auf einen Aufruf warten.
 */
function zaehlen(quelle) {
  const s = entkleiden(quelle)
  const treffer = []
  const zeilen = s.split('\n')
  let inBuendel = 0

  for (let i = 0; i < zeilen.length; i++) {
    const z = zeilen[i]
    // Ein Buendel erstreckt sich ueber mehrere Zeilen.
    if (/await\s+Promise\.(all|allSettled)\s*\(/.test(z)) inBuendel = 1
    if (inBuendel > 0) {
      inBuendel += (z.match(/\(/g) ?? []).length
      inBuendel -= (z.match(/\)/g) ?? []).length
      if (inBuendel <= 1 && /\)/.test(z)) inBuendel = 0
      continue
    }
    if (VORGAENGER.test(z)) continue
    if (/\bawait\s+[A-Za-z_$][\w$.]*\s*\(/.test(z)) {
      treffer.push({ zeile: i + 1, text: z.trim().slice(0, 70) })
    }
  }
  return treffer
}

const dateien = globSync('apps/web/src/app/v2/**/page.tsx', { cwd: WURZEL })
  .sort()

let rot = 0
const zeilenAus = []

const besser = []

for (const d of dateien) {
  const quelle = readFileSync(d, 'utf8')
  const t = zaehlen(quelle)
  const name = relative('apps/web/src/app/v2', d).replace(/\\/g, '/')
  const geduldet = UEBERGANG.get(name)

  let marke = ''
  if (geduldet !== undefined) {
    if (t.length > geduldet) {
      // Schlechter als beim Anlegen — das faengt die Pruefung, auch
      // wenn die Seite auf der Uebergangsliste steht.
      marke = `  <-- SCHLECHTER (war ${geduldet})`
      rot++
      zeilenAus.push({ name, t, geduldet })
    } else if (t.length <= SCHWELLE) {
      marke = '  <-- behoben, Zeile in UEBERGANG streichen'
      besser.push({ name, jetzt: t.length })
    } else {
      marke = `  (Uebergang, war ${geduldet})`
      if (t.length < geduldet) besser.push({ name, jetzt: t.length })
    }
  } else if (t.length > SCHWELLE) {
    marke = '  <-- ZU VIELE'
    rot++
    zeilenAus.push({ name, t })
  }
  console.log(`  ${String(t.length).padStart(2)}  ${name}${marke}`)
}

console.log()
for (const { name, jetzt } of besser) {
  console.log(`[ladekette] ${name} ist besser geworden (jetzt ${jetzt}) — `
    + 'UEBERGANG anpassen oder streichen.')
}

if (rot === 0) {
  const u = UEBERGANG.size
  console.log(`[ladekette] ${dateien.length} Seiten geprueft, keine ueber `
    + `${SCHWELLE} sequenziellen Abfragen`
    + (u ? ` (${u} auf der Uebergangsliste, siehe Dateikopf).` : '.'))
  process.exit(0)
}

console.log(`[ladekette] ${rot} Seite(n) laden zu viele Abfragen `
  + 'NACHEINANDER:')
for (const { name, t, geduldet } of zeilenAus) {
  console.log(`\n  ${name}`
    + (geduldet !== undefined ? `  (geduldet waren ${geduldet})` : ''))
  for (const x of t) console.log(`    Zeile ${x.zeile}: ${x.text}`)
}
console.log('\n  Bauen die Abfragen NICHT aufeinander auf, gehoeren sie in')
console.log('  ein `Promise.all` — mit eigenem Rueckfall je Abfrage, damit')
console.log('  ein Fehler nicht die ganze Seite leert. Muster:')
console.log('  apps/web/src/app/v2/supplements/page.tsx')
process.exit(1)
