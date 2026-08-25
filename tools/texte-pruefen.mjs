#!/usr/bin/env node
// Prueft die deutschen Nutzertexte auf FORMULIERUNGSVIELFALT (C-263).
//
// ── WARUM NICHT `count(distinct)` ───────────────────────────────────
//
// `[read]` **Die im Auftrag genannte Pruefung waere heute schon
// gruen.** `[cmd]` Gemessen am 2026-08-24: `select count(distinct
// kurz_was_de)` ergibt **289 von 289** — obwohl es sechs Schablonen
// mit eingesetztem Namen sind. Jeder Text ist als Zeichenkette
// verschieden, weil der Substanzname darin steht.
//
// `[cmd]` **Erst wenn man den Namen herausrechnet, wird es sichtbar:
// 289 werden zu 121.** Und ein Blick auf die Texte zeigt, warum:
//
//     "6-OXO ist ein leistungs- oder hormonbezogener Wirkstoff;
//      der Katalog beschreibt Fakten, keine Anwendung."
//     "Bromocriptine ist ein leistungs- oder hormonbezogener
//      Wirkstoff; der Katalog beschreibt Fakten, keine Anwendung."
//
// `[read]` **Deshalb misst diese Pruefung drei Dinge, die eine
// Schablone nicht besteht:**
//
//   1. verschiedene Texte NACH Entfernen des Substanznamens
//   2. der laengste gemeinsame Schluss ueber alle Kurztexte
//   3. haeufigste Wortfolge — eine Schablone wiederholt sie
//
// `[read]` Die Laengenpruefung aus C-257 fehlt hier bewusst: **sie
// besteht jede Schablone muehelos** und hat genau deshalb nichts
// gemessen.
import { readFileSync } from 'node:fs'

const ARG = Object.fromEntries(process.argv.slice(2)
  .map(a => a.split('=')).map(([k, v]) => [k.replace(/^--/, ''), v ?? true]))

const datei = ARG.datei ?? 'backup/c263/texte.json'
const daten = JSON.parse(readFileSync(datei, 'utf8'))

/** Der Text ohne seinen Substanznamen — Schablonen fallen zusammen. */
function ohneNamen(text, name) {
  if (!text) return ''
  let t = text
  // Auch Wortbestandteile des Namens einzeln entfernen: „Vitamin B12
  // (cyanocobalamin)" trifft sonst nur als Ganzes.
  const teile = [name, ...String(name).split(/[\s(),/]+/)]
    .filter(s => s && s.length >= 4)
    .sort((a, b) => b.length - a.length)
  for (const s of teile) {
    t = t.split(s).join('§')
  }
  return t.toLowerCase().replace(/\s+/g, ' ').trim()
}

/** Der laengste gemeinsame Schluss zweier Texte, in Woertern. */
function gemeinsamerSchluss(texte) {
  const woerter = texte.map(t => t.toLowerCase().replace(/\s+/g, ' ').trim().split(' '))
  if (woerter.length < 2) return 0
  let n = 0
  for (;;) {
    const kandidat = woerter[0][woerter[0].length - 1 - n]
    if (kandidat === undefined) break
    if (!woerter.every(w => w[w.length - 1 - n] === kandidat)) break
    n += 1
    if (n > 40) break
  }
  return n
}

const kurz = daten.texte.map(t => ({ text: t.kurz_was_de ?? '', name: t.name ?? '' }))
const kurzOhne = new Set(kurz.map(k => ohneNamen(k.text, k.name)).filter(Boolean))
const antworten = new Set(daten.faq.map(f => f.antwort_de).filter(Boolean))
const fragen = new Set(daten.faq.map(f => f.frage_de).filter(Boolean))
const schluss = gemeinsamerSchluss(kurz.map(k => k.text).filter(Boolean))

// Die haeufigste Fuenf-Wort-Folge ueber alle Kurztexte.
const folgen = new Map()
for (const k of kurz) {
  const w = ohneNamen(k.text, k.name).split(' ')
  for (let i = 0; i + 5 <= w.length; i++) {
    const f = w.slice(i, i + 5).join(' ')
    folgen.set(f, (folgen.get(f) ?? 0) + 1)
  }
}
const haeufigste = [...folgen.entries()].sort((a, b) => b[1] - a[1])[0] ?? ['—', 0]

const PRUEFUNGEN = [
  { name: 'verschiedene kurz_was_de (ohne Namen)', ist: kurzOhne.size,
    soll: Number(ARG.kurz ?? 280), art: 'min' },
  { name: 'verschiedene antwort_de', ist: antworten.size,
    soll: Number(ARG.antwort ?? 700), art: 'min' },
  { name: 'verschiedene frage_de', ist: fragen.size,
    soll: Number(ARG.frage ?? 400), art: 'min' },
  { name: 'gemeinsamer Schluss (Woerter)', ist: schluss,
    soll: Number(ARG.schluss ?? 3), art: 'max' },
  { name: `haeufigste 5-Wort-Folge ("${haeufigste[0].slice(0, 42)}")`,
    ist: haeufigste[1], soll: Number(ARG.folge ?? 25), art: 'max' },
]

let rot = 0
console.log(`[texte] ${daten.texte.length} Texte, ${daten.faq.length} FAQ-Zeilen`)
for (const p of PRUEFUNGEN) {
  const ok = p.art === 'min' ? p.ist >= p.soll : p.ist <= p.soll
  if (!ok) rot += 1
  console.log(`  ${ok ? 'ok  ' : 'ROT '} ${p.name}: ${p.ist} `
    + `(${p.art === 'min' ? 'mindestens' : 'hoechstens'} ${p.soll})`)
}

if (rot > 0) {
  console.error(`[texte] ${rot} Pruefung(en) rot.`)
  process.exit(1)
}
