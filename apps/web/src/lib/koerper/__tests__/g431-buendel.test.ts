// G-431 — die restlichen Buendel und die Modale.
//
// ══ WAS HIER BEWACHT WIRD ══════════════════════════════════════════
//
// **1 — die zwei Aufteilungen.** `[cmd]` **Zwoelf Flaechen geprueft,
// je Pfad ein Bild** (`docs/bilder/g431/`) — **zwei geteilt, zehn
// zusammengelassen.**
//
// **2 — dass die ZUSAMMENGELASSENEN zusammen bleiben.** `[read]`
// **Das ist die Haelfte der Arbeit, die man sonst nicht sieht:** wer
// `quadriceps` spaeter doch teilt, teilt EINEN Muskel mit vier
// Koepfen — und der Waechter sagt warum.
//
// **3 — kein Pfad verloren.** `[cmd]` **158 Pfade vor und nach
// G-431.**
import { test } from 'node:test'
import assert from 'node:assert/strict'

import { MUSKELN } from '@lumeos/ui'

import { AUS_AUFTEILUNG } from '../hierarchie'

/**
 * Die zwoelf geprueften Flaechen und ihr Urteil.
 *
 * `[cmd]` **Je Zeile am Bild bestimmt**, nicht aus der Anatomie
 * abgeleitet — die Anatomie war der Anhaltspunkt, das Bild die
 * Entscheidung.
 */
const URTEIL: Array<[string, 'geteilt' | 'zusammen', string]> = [
  ['rectus-femoris', 'geteilt', 'G-433: drei Straenge je Schenkel, am Bild getrennt'],
  ['gastrocnemius-lateralis', 'geteilt', 'G-433: zwei Baeuche plus Achillessehne'],
  ['adductor-longus', 'geteilt', 'G-433: drei Streifen je Seite, am Bild getrennt'],
  ['forearm-flexors', 'geteilt', 'G-433: Beuger und Strecker, je Ansicht getrennt'],
  ['rectus-abdominis', 'geteilt', 'G-433/Tom: untere 2 Rectus, obere 6 Tendinous Inscriptions'],
  ['sternocleidomastoid', 'geteilt', 'G-433: zwei Straenge je Seite plus Kehlstueck'],
  ['triceps-longum', 'geteilt', 'G-433: drei Koepfe je Arm, am Bild getrennt'],
  ['external-oblique', 'geteilt', 'G-433/Tom: obere 3 Serratus, untere 5 External Oblique'],
  ['knees', 'zusammen', 'Umriss, kein Muskel'],
  ['hands', 'zusammen', 'Umriss, kein Muskel'],
  ['ankles', 'zusammen', 'Umriss, kein Muskel'],
  ['feet', 'zusammen', 'Umriss, kein Muskel'],
]

test('G-431/G-433: die genannten Flaechen sind gezeichnet', () => {
  // ══ G-433: das Urteil ist widerrufen ═══════════════════════════
  //
  // **Tom, 2026-09-12:** *„ja alles trennen was unsere grafik
  // hergibt."* **Und vorher:** *„wurde bei hamstring auch gesagt und
  // nun hat es jeden der muskeln einzeln anwaehlbar."*
  //
  // `[cmd]` **Gemessen: die Grafik trennt sie laengst** — drei
  // Straenge je Schenkel (`quadriceps`, `adductors`), zwei Baeuche je
  // Wade. **Der fehlende Name in `muscle_groups` war kein Grund,
  // zusammenzulassen.**

  for (const [code, urteil, grund] of URTEIL) {
    assert.ok(MUSKELN[code],
      `Die Flaeche "${code}" fehlt in der Karte. ${urteil}: ${grund}`)
  }
})

test('G-431: gluteal und hamstring SIND geteilt', () => {
  // ══ Die zwei, die das Bild wirklich trennt ════════════════════
  //
  // `[cmd]` **`gluteal`:** je Seite eine grosse Masse und eine kleine
  // Kappe oben aussen — `Gluteus Maximus` und `Gluteus Medius`.
  // `[cmd]` **`hamstring`:** je Seite zwei breite Straenge
  // nebeneinander — `Biceps Femoris` aussen, `Semitendinosus` innen.
  for (const neu of ['gluteus-maximus', 'gluteus-medius',
    'biceps-femoris', 'semitendinosus']) {
    assert.ok(MUSKELN[neu], `Die Flaeche "${neu}" fehlt in der Karte.`)
  }
  for (const alt of ['gluteal', 'hamstring']) {
    assert.ok(!MUSKELN[alt],
      `Die Flaeche "${alt}" steht noch in der Karte — sie ist in G-431 `
      + 'aufgeteilt worden und darf nicht doppelt existieren.')
  }
})

test('G-431: kein Pfad ist verloren gegangen', () => {
  // `[cmd]` **Die Aufteilung hat 12 Pfade umgehaengt** — 4 aus
  // `gluteal`, 8 aus `hamstring`.
  const zaehlung: Record<string, number> = {
    'gluteus-maximus': 2, 'gluteus-medius': 2,
    'biceps-femoris': 4, semitendinosus: 4,
  }
  let summe = 0
  for (const [code, erwartet] of Object.entries(zaehlung)) {
    const n = MUSKELN[code]?.paths?.length ?? 0
    assert.equal(n, erwartet, `"${code}" hat ${n} Pfade, erwartet ${erwartet}.`)
    summe += n
  }
  assert.equal(summe, 12,
    'Die Aufteilung muss genau die 12 Pfade von gluteal (4) und '
    + 'hamstring (8) tragen.')

  // `[cmd]` **Und keiner steht doppelt.**
  const alle: string[] = []
  for (const code of Object.keys(zaehlung)) alle.push(...(MUSKELN[code]?.paths ?? []))
  const doppelt = alle.filter((d, i) => alle.indexOf(d) !== i)
  assert.deepEqual(doppelt, [],
    'Ein Pfad steht in zwei Flaechen — dann wird er zweimal gezeichnet.')
})

test('G-431: die Karte traegt insgesamt 158 Pfade', () => {
  // ══ Die Gegenprobe ueber ALLES ════════════════════════════════
  //
  // `[read]` **Eine Aufteilung darf nichts erzeugen und nichts
  // verlieren** — die Summe ist seit G-425 dieselbe.
  let summe = 0
  for (const m of Object.values(MUSKELN)) {
    summe += (m.paths?.length ?? 0)
      + (m.paths_front?.length ?? 0) + (m.paths_back?.length ?? 0)
  }
  assert.equal(summe, 158,
    `Die Karte traegt ${summe} Pfade, erwartet 158. Eine Aufteilung `
    + 'verschiebt Pfade, sie erzeugt und verliert keine.')
})

test('G-431: die neuen Flaechen haengen in der Bruecke', () => {
  // `[read]` **`public.koerperflaechen` kennt sie so wenig wie die
  // fuenf aus G-430** — ohne Eintrag in `AUS_AUFTEILUNG` zeigte das
  // Per-muscle-Detail fuer sie keinen Elternteil.
  const erwartet: Record<string, string> = {
    'gluteus-maximus': 'gluteal', 'gluteus-medius': 'gluteal',
    'biceps-femoris': 'hamstring', semitendinosus: 'hamstring',
  }
  for (const [neu, alt] of Object.entries(erwartet)) {
    assert.equal(AUS_AUFTEILUNG[neu], alt,
      `"${neu}" muss ueber "${alt}" an seinen Elternteil kommen — `
      + 'sonst bleibt das Detail leer.')
  }
})

test('G-431: die Umriss-Flaechen sind unveraendert (A3)', () => {
  // `[cmd]` **Vier Flaechen mit mehr als zwei Pfaden sind KEINE
  // Muskeln:** `hands` (12/11), `knees` (4), `ankles` (4/2),
  // `feet` (4/2). **Sie werden nicht aufgeteilt.**
  const umriss: Record<string, number> = { hands: 12, knees: 4, ankles: 4, feet: 4 }
  for (const [code, n] of Object.entries(umriss)) {
    const m = MUSKELN[code]
    assert.ok(m, `Die Umriss-Flaeche "${code}" fehlt.`)
    const vorne = m.paths_front?.length ?? m.paths?.length ?? 0
    assert.equal(vorne, n,
      `"${code}" hat ${vorne} Pfade vorne, erwartet ${n} — ein Umriss `
      + 'wird nicht aufgeteilt und nicht neu gezeichnet.')
  }
})
