// G-438 - Toms drei Auflagen zum geliehenen Wert.
//
// **Tom, 2026-09-12** (zu Weg 1, „Namen eintragen, Wert von der
// Gruppe"):
//
//   1. *„‚Wert von Triceps' steht AM KIND, nicht nur die Zahl.
//      Sonst sieht es aus wie eine eigene Messung."*
//   2. *„Der Schnitt der Gruppe rechnet NICHT ueber diese Kinder.
//      Triceps Ø ueber drei Koepfe, die alle 41% von Triceps
//      geliehen haben, gibt 41% — eine Scheinrechnung."*
//   3. *„Ein geliehener Wert ist KEIN Engpass."*
//
// `[cmd]` **Und:** *„trag eine Gegenprobe ein, die genau das
// prueft: ein geliehener Wert, der in den Schnitt oder in den
// Engpass einfliesst, muss rot werden."*
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import { baueBaum, mitWerten, type MuskelKnoten } from '../muskelbaum'

const HIER = dirname(fileURLToPath(import.meta.url))

/** Der Trizepsfall aus Toms Beispiel. */
function baum(): MuskelKnoten[] {
  return [
    { id: '1', name: 'Arms', parent_id: null },
    { id: '2', name: 'Triceps', parent_id: '1' },
    { id: '3', name: 'Triceps Brachii Long Head', parent_id: '2' },
    { id: '4', name: 'Triceps Brachii Lateral Head', parent_id: '2' },
    { id: '5', name: 'Triceps Brachii Medial Head', parent_id: '2' },
    { id: '6', name: 'Biceps', parent_id: '1' },
  ]
}

/**
 * `Triceps` misst 41 selbst, die drei Koepfe LEIHEN diesen Wert,
 * `Biceps` misst 80.
 */
function gerechnet() {
  return mitWerten(baueBaum(baum(), {}), a => {
    if (a.name === 'Triceps') return 41
    if (a.name === 'Biceps') return 80
    if (a.name.startsWith('Triceps Brachii')) {
      return { wert: 41, vonGruppe: 'Triceps' }
    }
    return null
  })
}

test('G-438/Auflage 1: der geliehene Wert traegt seine Herkunft', () => {
  const [arms] = gerechnet()
  const tri = arms.kinder.find(k => k.name === 'Triceps')!
  const kopf = tri.kinder[0]
  assert.equal(kopf.wert, 41, 'Der Kopf zeigt den Wert der Gruppe.')
  assert.equal(kopf.vonGruppe, 'Triceps',
    'Ohne `vonGruppe` sieht der Wert aus wie eine eigene Messung.')
  // Die Gegenrichtung: ein GEMESSENER Wert traegt keine Herkunft.
  assert.equal(tri.vonGruppe, null, '`Triceps` misst selbst.')
  assert.equal(arms.kinder.find(k => k.name === 'Biceps')!.vonGruppe, null)
})

test('G-438/Auflage 2: geliehene Kinder gehen NICHT in den Schnitt', () => {
  // ══ Toms Scheinrechnung ═══════════════════════════════════════
  //
  // **Drei Koepfe, alle 41 von `Triceps` geliehen.** `[read]`
  // **Zaehlte man sie mit, waere der Schnitt (41+41+41)/3 = 41** —
  // **eine Zahl, die den Wert der Gruppe gegen sich selbst
  // mittelt und dabei wie eine Messung ueber drei Muskeln
  // aussieht.**
  const [arms] = gerechnet()
  const tri = arms.kinder.find(k => k.name === 'Triceps')!
  assert.equal(tri.schnitt, null,
    'Alle drei Kinder sind geliehen — dann gibt es KEINEN Schnitt. '
    + '41 waere eine Scheinrechnung.')
  assert.equal(tri.schnittAus, 0)

  // `Arms` mittelt ueber `Triceps` (41, gemessen) und `Biceps`
  // (80, gemessen) — die Koepfe sind zwei Ebenen tiefer und
  // zaehlen ohnehin nicht direkt.
  assert.equal(arms.schnitt, 61, '(41 + 80) / 2 = 60.5 -> 61.')
  assert.equal(arms.schnittAus, 2)
})

test('G-438/Auflage 3: ein geliehener Wert ist KEIN Engpass', () => {
  // **Tom:** *„Wenn die Trizepskoepfe 41% geliehen tragen, duerfen
  // sie nicht als ‚schwaechstes: Triceps Br. Long Head'
  // erscheinen."*
  const [arms] = gerechnet()
  const tri = arms.kinder.find(k => k.name === 'Triceps')!
  assert.equal(tri.engpass, null,
    'Unter `Triceps` haengen nur geliehene Werte — kein Engpass.')

  assert.ok(arms.engpass, 'Unter `Arms` gibt es gemessene Werte.')
  assert.equal(arms.engpass!.name, 'Triceps',
    'Der Engpass ist `Triceps` selbst (41, gemessen) — NICHT einer '
    + 'seiner Koepfe, die denselben Wert nur geliehen tragen.')
  assert.equal(arms.engpass!.wert, 41)
})

test('G-438: ein geliehener Wert verdeckt keinen echten Engpass', () => {
  // ══ Die Gegenrichtung ═════════════════════════════════════════
  //
  // `[read]` **Waere die Regel „geliehene ueberspringen" zu grob
  // gefasst, fiele auch ein echter Engpass darunter weg.**
  const aeste = mitWerten(baueBaum(baum(), {}), a => {
    if (a.name === 'Triceps') return 90
    if (a.name === 'Biceps') return 12          // der echte Engpass
    if (a.name.startsWith('Triceps Brachii')) {
      return { wert: 90, vonGruppe: 'Triceps' }
    }
    return null
  })
  assert.deepEqual(aeste[0].engpass, { name: 'Biceps', wert: 12 },
    'Der gemessene Bizeps mit 12 bleibt der Engpass.')
})

test('G-438: ein gemessenes Kind zaehlt weiter normal', () => {
  // `[read]` **Die Regel darf NUR geliehene Werte ausschliessen** —
  // sonst rechnete keine Gruppe mehr.
  const aeste = mitWerten(baueBaum(baum(), {}), a => {
    if (a.name === 'Triceps Brachii Long Head') return 20
    if (a.name === 'Triceps Brachii Lateral Head') return 40
    if (a.name.startsWith('Triceps Brachii')) {
      return { wert: 99, vonGruppe: 'Triceps' }   // der dritte: geliehen
    }
    return null
  })
  const tri = aeste[0].kinder.find(k => k.name === 'Triceps')!
  assert.equal(tri.schnitt, 30, '(20 + 40) / 2 = 30 — der geliehene faellt raus.')
  assert.equal(tri.schnittAus, 2)
  assert.deepEqual(tri.engpass, { name: 'Triceps Brachii Long Head', wert: 20 })
})

test('G-438/A3: die Liste schreibt die Herkunft AN DIE ZEILE', () => {
  // `[read]` **Die Proben oben pruefen die Rechnung.** **Eine
  // Ansicht, die `vonGruppe` ignoriert, bliebe gruen** — und genau
  // das war Toms Befund (orange auf der Karte, „--" in der Liste).
  const kachel = readFileSync(
    join(HIER, '..', '..', '..', 'app', 'v2', 'recovery', 'tab-messwerte.tsx'), 'utf8')
  assert.match(kachel, /Wert von \{a\.vonGruppe\}/,
    'Die Zeile nennt die Herkunft des geliehenen Werts nicht — '
    + 'dann sieht er aus wie eine eigene Messung (Auflage 1).')
  // ══ G-446: die SACHE, nicht der Funktionsname ═══════════════
  //
  // `[cmd]` **Hier stand `/wertKommtVonGruppe\(/`.** `[cmd]` **G-446
  // hat die Herkunft von der KARTENflaeche auf den BAUM umgestellt**
  // — `wertKommtVonGruppe` wird nicht mehr gerufen, die Entscheidung
  // trifft `muskelLage` ueber die Sippe.
  //
  // `[read]` **Die Probe blieb trotzdem gruen** — der Name steht
  // noch in einem Kommentar, und `assert.match` sucht die ganze
  // Datei ab (die Lehre `waechter-liest-die-eigene-begruendung`).
  // **Sie war also blind, nicht erfuellt.**
  //
  // `[read]` **Die Frage ist: bestimmt die Kachel die Herkunft
  // ueberhaupt?** **Nicht: ruft sie diese eine Funktion?**
  const ohneKommentare = kachel
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n')
    .filter(z => !z.trim().startsWith('//') && !z.trim().startsWith('*'))
    .join('\n')
  assert.match(ohneKommentare, /vonGruppe:\s*\w/,
    'Die Kachel bestimmt die Herkunft gar nicht erst — dann sieht '
    + 'ein geliehener Wert aus wie eine eigene Messung.')
})
