// Wieviele der 106 auf jede Flaeche fallen (G-55; bis G-443: 96).
//
// `[read]` Der Auftrag verlangt „die Zahl je Flaeche" im Bericht.
// Eine Zahl im Bericht veraltet still — diese hier faellt auf, sobald
// jemand die Zuordnung aendert.
import { test } from 'node:test'
import assert from 'node:assert/strict'

import { MUSKEL_ZU_FLAECHE, FLAECHEN, muskelnZurFlaeche, flaechenVonMuskel } from '../muskel-ebenen'

/**
 * `[cmd]` **Am 2026-09-13 gezaehlt** (G-443; davor G-433, 2026-09-12).
 *
 * `[read]` **Summe 142 bei 106 Namen** — Namen decken mehrere
 * Flaechen, seit die Gruppen in ihre Straenge zerfallen sind.
 *
 * **Was G-433 geaendert hat:** acht Flaechen wurden zu
 * dreiundzwanzig — `quadriceps`, `adductors`, `calves`, `abs`,
 * `obliques`, `triceps`, `forearm`, `neck`.
 *
 * ══ G-443: 132 -> 142, bei 96 -> 106 Namen ═══════════════════════
 *
 * `[cmd]` **C-482 hat zehn Namen angelegt, und jeder bekam hier
 * seine EIGENE Flaeche** — neun anatomische Einzelmuskeln plus
 * `Posterior Neck Muscles` auf `nacken`.
 *
 * `[cmd]` **Genau +10, je Name +1** — keine dieser zehn deckt
 * mehrere Flaechen:
 *
 *     gastrocnemius-lateralis  9 -> 10   Lateral Head
 *     gastrocnemius-medialis   9 -> 10   Medial Head
 *     vastus-lateralis         8 ->  9   Vastus Lateralis
 *     vastus-medialis          4 ->  5   Vastus Medialis
 *     nacken                   3 ->  4   Posterior Neck Muscles
 *     external-oblique         2 ->  3   External Oblique
 *     serratus-anterior        1 ->  2   Serratus Anterior
 *     triceps-longum           1 ->  2   Long Head
 *     triceps-lateralis        1 ->  2   Lateral Head
 *     triceps-mediale          1 ->  2   Medial Head
 *
 * `[read]` **Keine Flaeche kam hinzu und keine fiel weg** — die
 * Pfade gab es seit G-430 alle. **Erreichbar waren sie bis G-443
 * nur ueber die Elterngruppe, die alle Geschwister mitfaerbte.**
 */
const ERWARTET: Record<string, number> = {
  'forearm-flexors': 10,
  'gastrocnemius-lateralis': 10,
  'gastrocnemius-medialis': 10,
  'vastus-lateralis': 9,
  deltoids: 7,
  'adductor-longus': 6,
  'forearm-extensors': 6,
  'gluteus-medius': 6,
  chest: 5,
  'rectus-abdominis': 5,
  'rectus-femoris': 5,
  'vastus-medialis': 5,
  'adductor-brevis': 4,
  'adductor-magnus': 4,
  'gluteus-maximus': 4,
  latissimus: 4,
  nacken: 4,
  biceps: 3,
  'external-oblique': 3,
  semitendinosus: 3,
  trapezius: 3,
  'biceps-femoris': 2,
  brachioradialis: 2,
  'erector-spinae': 2,
  'forearm-extensors-ulnar': 2,
  'serratus-anterior': 2,
  sternocleidomastoid: 2,
  'tendinous-inscriptions': 2,
  tibialis: 2,
  'triceps-lateralis': 2,
  'triceps-longum': 2,
  'triceps-mediale': 2,
  achillessehne: 1,
  flanke: 1,
  'teres-major': 1,
  'teres-minor': 1,
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

test('jeder der 106 Muskeln landet auf mindestens einer Flaeche', () => {
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
  // `[cmd]` **G-443: 96 -> 106** — die zehn Namen aus C-482.
  assert.equal(Object.keys(MUSKEL_ZU_FLAECHE).length, 106,
    'Die Zuordnung selbst muss 106 Eintraege fuehren.')

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
