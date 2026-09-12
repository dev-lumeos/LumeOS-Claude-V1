// G-431/A4 — Gruppe aufgeschluesselt, Kind nur dieses.
//
// **Tom, 2026-09-08:** *„wenn gruppe, wird im modal aufgeschluesselt,
// und wenn child, dann nur dieses."*
//
// ══ WARUM DIESE PROBE DIE ENTSCHEIDUNG AUFRUFT ═════════════════════
//
// `[read]` **Die Entscheidung ist EINE Zeile** — `flaechen.length > 1`.
// **Ein Waechter, der im Quelltext nach `istGruppe` sucht, bleibt
// gruen, wenn daraus `false` wird.**
//
// `[read]` **Also wird gerechnet, was das Modal rechnet:**
// `flaechenFuer(slug)` bestimmt, ob aufgeschluesselt wird — und die
// Probe prueft beide Richtungen an echten Kuerzeln.
//
// `[cmd]` **Am Schirm belegt** (`tools/_g431-modal.mjs`, 2026-09-12):
//
//     Klick auf latissimus   „Group · 3 muscles"   3 Bloecke
//     Klick auf chest        „Muscle ·"            1 Block
import { test } from 'node:test'
import assert from 'node:assert/strict'

import { flaechenFuer, KARTE_ZU_RECOVERY } from '../muskel-zuordnung'
import { muskelnZurFlaeche } from '../muskel-ebenen'
import { MUSCLE_GROUPS_BODYMAP, MUSCLE_STATE } from '../motor'

/**
 * Die Entscheidung des Modals, als reine Rechnung.
 *
 * `[read]` **Dieselbe Bedingung wie in `modale.tsx`** — die Probe
 * darunter haelt beide aneinander.
 */
function aufschluesselung(slug: string) {
  const flaechen = flaechenFuer(slug)
  return { flaechen, istGruppe: flaechen.length > 1 }
}

test('G-431/A4: ein Gruppen-Kuerzel wird aufgeschluesselt', () => {
  // `[cmd]` **`upper_back` traegt seit G-430 DREI Flaechen**,
  // `hamstring` und `gluteal` seit G-431 je ZWEI.
  for (const [slug, anzahl] of [
    ['upper_back', 3], ['lower_back', 2], ['hamstring', 2], ['gluteal', 2],
  ] as Array<[string, number]>) {
    const a = aufschluesselung(slug)
    assert.equal(a.flaechen.length, anzahl,
      `"${slug}" traegt ${a.flaechen.length} Flaechen, erwartet ${anzahl}.`)
    assert.equal(a.istGruppe, true,
      `"${slug}" muss als Gruppe gelten und aufgeschluesselt werden.`)
    // `[read]` **Je Flaeche ein eigener Block mit eigenen Muskeln** —
    // sonst waere die Aufschluesselung nur eine laengere Liste.
    for (const f of a.flaechen) {
      assert.ok(muskelnZurFlaeche(f).length > 0,
        `Die Flaeche "${f}" von "${slug}" traegt keinen Muskel — dann `
        + 'bliebe ihr Block im Modal leer.')
    }
  }
})

test('G-431/A4: ein Kind-Kuerzel zeigt NUR sich selbst', () => {
  // `[read]` **Die Gegenrichtung** — ohne sie waere eine Fassung
  // gruen, die ALLES aufschluesselt.
  for (const slug of ['chest', 'biceps', 'triceps', 'abs', 'calves']) {
    const a = aufschluesselung(slug)
    assert.equal(a.flaechen.length, 1,
      `"${slug}" traegt ${a.flaechen.length} Flaechen, erwartet genau 1.`)
    assert.equal(a.istGruppe, false,
      `"${slug}" ist ein einzelner Muskel und darf NICHT als Gruppe `
      + 'aufgeschluesselt werden.')
  }
})

test('G-431/A4: die Bedingung im Modal ist dieselbe Rechnung', () => {
  // `[read]` **Haelt die Kopie oben an `modale.tsx` gebunden** —
  // sonst koennte dort etwas anderes stehen.
  const fs = require('node:fs') as typeof import('node:fs')
  const path = require('node:path') as typeof import('node:path')
  const roh = fs.readFileSync(
    path.join(process.cwd(), 'src/app/v2/recovery/modale.tsx'), 'utf8')
  // Kommentarzeilen weg — sonst faende die Suche ihre eigene
  // Begruendung (die Lehre aus G-389).
  const code = roh.split('\n').filter(z => !z.trim().startsWith('//')).join('\n')
  assert.match(code, /const istGruppe = flaechen\.length > 1/,
    'Die Gruppen-Bedingung in `modale.tsx` sieht anders aus als die '
    + 'Rechnung in diesem Test. Eine von beiden ist veraltet.')
  // `[cmd]` **Und je Kind sein eigener Wert** — das ist der
  // Unterschied zwischen Aufschluesselung und blosser Liste.
  assert.match(code, /MUSCLE_STATE\[KARTE_ZU_RECOVERY\[f\]/,
    'Das Modal liest je Flaeche keinen eigenen Wert mehr — dann ist '
    + 'die Aufschluesselung nur eine laengere Namensliste.')
})

test('G-431/A4: jedes Recovery-Kuerzel findet seinen Wert zurueck', () => {
  // `[cmd]` **Die Aufschluesselung zeigt je Flaeche
  // `MUSCLE_STATE[KARTE_ZU_RECOVERY[f]]`** — geht der Rueckweg
  // verloren, steht ueberall ein Strich.
  let mitWert = 0
  for (const slug of MUSCLE_GROUPS_BODYMAP) {
    for (const f of flaechenFuer(slug)) {
      const zurueck = KARTE_ZU_RECOVERY[f]
      assert.ok(zurueck,
        `Die Flaeche "${f}" (aus "${slug}") findet kein Recovery-Kuerzel `
        + 'zurueck — im Modal bliebe ihr Wert leer.')
      if (MUSCLE_STATE[zurueck]) mitWert += 1
    }
  }
  assert.ok(mitWert >= 20,
    `Nur ${mitWert} Flaechen tragen einen Wert — erwartet mindestens 20.`)
})


test('G-432/A4: der Klick waehlt den MUSKEL, nicht die Gruppe', () => {
  // ══ Toms Abgrenzung, als Zusage ═══════════════════════════════
  //
  // **„auf der grafik muss jeder angezeigte muskel anwaehlbar sein
  // (NICHT die gruppe)."**
  //
  // `[cmd]` **Am Schirm belegt** (`tools/_g432-anwaehlbar.mjs`,
  // 2026-09-12): ein Klick auf `latissimus` hebt GENAU
  // `["latissimus"]` hervor — **vorher waren es drei**, weil
  // `flaechenFuer('upper_back')` die ganze Gruppe zurueckgab.
  //
  // `[read]` **Ohne diesen Waechter blieb die Sabotage
  // *„der Klick waehlt wieder die GRUPPE"* GRUEN** — die
  // Schirmprobe faengt sie, aber keine Probe im Gate.
  const fs = require('node:fs') as typeof import('node:fs')
  const path = require('node:path') as typeof import('node:path')
  const roh = fs.readFileSync(
    path.join(process.cwd(), 'src/app/v2/recovery/tab-checkin.tsx'), 'utf8')
  // Kommentarzeilen weg — sonst faende die Suche ihre eigene
  // Begruendung (die Lehre aus G-389).
  const code = roh.split(String.fromCharCode(10))
    .filter(z => !z.trim().startsWith('//') && !z.trim().startsWith('*'))
    .join(String.fromCharCode(10))

  // `[cmd]` **Der Klick setzt die GEKLICKTE Flaeche** — `[id]`,
  // nicht die Gruppe des Kuerzels.
  assert.match(code, /setSelFlaeche\(\[id\]\)/,
    'Der Klick setzt nicht mehr die geklickte Flaeche — dann faerbt '
    + 'er wieder die ganze Gruppe (Toms Befund aus G-432).')
  // `[read]` **Und die Hervorhebung nimmt sie VOR dem Kuerzel.**
  assert.match(code, /ausgewaehlt=\{selFlaeche \?\?/,
    'Die Hervorhebung liest `selFlaeche` nicht mehr zuerst — dann '
    + 'gewinnt wieder die Gruppe.')
  // `[cmd]` **Die Gegenrichtung:** `flaechenFuer(sel)` darf NICHT
  // mehr allein die Auswahl bestimmen.
  assert.ok(!/ausgewaehlt=\{sel \? flaechenFuer\(sel\) : null\}/.test(code),
    'Die alte Fassung ist zurueck — ein Klick faerbt damit die ganze '
    + 'Gruppe statt des Muskels.')
})
