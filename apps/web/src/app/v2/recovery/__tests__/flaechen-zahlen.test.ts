// Wieviele der 96 auf jede Flaeche fallen (G-55).
//
// `[read]` Der Auftrag verlangt „die Zahl je Flaeche" im Bericht.
// Eine Zahl im Bericht veraltet still — diese hier faellt auf, sobald
// jemand die Zuordnung aendert.
import { test } from 'node:test'
import assert from 'node:assert/strict'

import { MUSKEL_ZU_FLAECHE, FLAECHEN, muskelnZurFlaeche, flaechenVonMuskel } from '../muskel-ebenen'

/**
 * `[cmd]` **Am 2026-09-12 gezaehlt** (G-433, mit Nachtrag).
 *
 * `[read]` **Summe 132 bei 96 Namen** — 25 Namen decken mehrere
 * Flaechen, seit die Gruppen in ihre Straenge zerfallen sind.
 *
 * **Was G-433 geaendert hat:** acht Flaechen wurden zu
 * dreiundzwanzig — `quadriceps`, `adductors`, `calves`, `abs`,
 * `obliques`, `triceps`, `forearm`, `neck`.
 */
const ERWARTET: Record<string, number> = {
  'forearm-flexors': 10,
  'gastrocnemius-lateralis': 9,
  'gastrocnemius-medialis': 9,
  'vastus-lateralis': 8,
  deltoids: 7,
  'adductor-longus': 6,
  'forearm-extensors': 6,
  'gluteus-medius': 6,
  chest: 5,
  'rectus-abdominis': 5,
  'rectus-femoris': 5,
  'adductor-brevis': 4,
  'adductor-magnus': 4,
  'gluteus-maximus': 4,
  latissimus: 4,
  'vastus-medialis': 4,
  biceps: 3,
  nacken: 3,
  semitendinosus: 3,
  trapezius: 3,
  'biceps-femoris': 2,
  brachioradialis: 2,
  'erector-spinae': 2,
  'external-oblique': 2,
  'forearm-extensors-ulnar': 2,
  sternocleidomastoid: 2,
  'tendinous-inscriptions': 2,
  tibialis: 2,
  achillessehne: 1,
  flanke: 1,
  'serratus-anterior': 1,
  'teres-major': 1,
  'teres-minor': 1,
  'triceps-lateralis': 1,
  'triceps-longum': 1,
  'triceps-mediale': 1,
}

test('die Zahl je Flaeche stimmt mit dem Bericht ueberein', () => {
  const ist: Record<string, number> = {}
  for (const f of FLAECHEN) {
    const n = muskelnZurFlaeche(f).length
    if (n > 0) ist[f] = n
  }
  assert.deepEqual(ist, ERWARTET,
    'Die Verteilung hat sich geaendert — dann auch den Bericht '
    + '(docs/ssot/104-muskelkarte.md) nachziehen.')
})

test('jeder der 96 Muskeln landet auf mindestens einer Flaeche', () => {
  // [cmd] Die Gegenprobe: keine verloren.
  //
  // ══ G-430: 96 -> 97 Zuordnungen bei 96 Namen ═══════════════════
  //
  // `[cmd]` **Hier stand `assert.equal(summe, 96)`.** `[read]` **Die
  // Summe war nur solange gleich der Namenszahl, wie JEDER Name genau
  // EINE Flaeche traf.** `Obliques` **trifft seit G-430 zwei**
  // (Bauchseite und Flanke).
  //
  // `[read]` **Die Frage, die der Test wirklich stellt, ist:
  // faellt ein Muskel durch?** — und die wird jetzt direkt
  // gestellt, statt ueber eine Summe, die aus zwei Gruenden
  // abweichen kann.
  assert.equal(Object.keys(MUSKEL_ZU_FLAECHE).length, 96,
    'Die Zuordnung selbst muss 96 Eintraege fuehren.')

  const ohne = Object.keys(MUSKEL_ZU_FLAECHE)
    .filter(name => flaechenVonMuskel(name).length === 0)
  assert.deepEqual(ohne, [],
    `Diese Muskeln landen auf keiner Flaeche: ${ohne.join(', ')}. `
    + 'Ein Muskel ohne Flaeche wird am Bildschirm nie sichtbar.')

  // Und die Summe bleibt nachpruefbar — nur als Folge, nicht als Regel.
  //
  // `[cmd]` **G-433: `96 + Anzahl Mehrfache` stimmt nicht mehr.**
  // **Die Rechnung galt, solange ein Name HOECHSTENS zwei Flaechen
  // traf.** Seit der Aufteilung faerbt `Quadriceps` DREI, `Adductors`
  // drei, `Calves` zwei — **also wird die Summe der Flaechen je Name
  // gezaehlt, nicht die Zahl der Namen mit mehr als einer.**
  const summe = Object.values(ERWARTET).reduce((a, b) => a + b, 0)
  const zuordnungen = Object.keys(MUSKEL_ZU_FLAECHE)
    .reduce((a, name) => a + flaechenVonMuskel(name).length, 0)
  assert.equal(summe, zuordnungen,
    `Summe der Verteilung ${summe}, Summe der Zuordnungen `
    + `${zuordnungen} — sie sind auseinandergelaufen.`)
})
