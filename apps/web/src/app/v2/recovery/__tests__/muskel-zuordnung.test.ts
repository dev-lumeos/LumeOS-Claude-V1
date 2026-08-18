// Die Zuordnung Recovery-Kuerzel -> Muskel-ID der Koerperkarte (G-26).
//
// WARUM DIESER TEST: `[cmd]` Eine falsche ID faellt NICHT auf. Die
// Karte sucht `MUSKELN[id]`, findet nichts und zeichnet die Gruppe
// einfach nicht ein — kein Fehler, keine Warnung, nur ein Muskel, der
// grau bleibt. Bei 18 Kuerzeln sieht das niemand.
import { test } from 'node:test'
import assert from 'node:assert/strict'

import { MUSKELN } from '@lumeos/ui'
import { MUSCLE_GROUPS_BODYMAP } from '../motor'
import {
  RECOVERY_ZU_KARTE, KARTE_ZU_RECOVERY, OHNE_ENTSPRECHUNG,
  alsErmuedung, katerAlsMuskeln,
} from '../muskel-zuordnung'

test('jedes Recovery-Kuerzel steht in der Zuordnung', () => {
  for (const slug of MUSCLE_GROUPS_BODYMAP) {
    assert.ok(slug in RECOVERY_ZU_KARTE,
      `"${slug}" fehlt in RECOVERY_ZU_KARTE. Neue Gruppe? Dann zuordnen `
      + 'oder ausdruecklich auf null setzen — nicht weglassen.')
  }
})

test('jede zugeordnete ID gibt es in der Karte wirklich', () => {
  // [cmd] Das ist der Kern: ein Tippfehler wie `quadricep` statt
  // `quadriceps` faellt am Bildschirm nicht auf.
  for (const [slug, id] of Object.entries(RECOVERY_ZU_KARTE)) {
    if (id === null) continue
    assert.ok(MUSKELN[id],
      `"${slug}" zeigt auf "${id}" — diese Gruppe gibt es in der `
      + 'Koerperkarte nicht. Vertippt?')
  }
})

test('die Rueckrichtung trifft wieder ein gueltiges Kuerzel', () => {
  const gueltig = new Set<string>(MUSCLE_GROUPS_BODYMAP)
  for (const [id, slug] of Object.entries(KARTE_ZU_RECOVERY)) {
    assert.ok(gueltig.has(slug),
      `Die Karte meldet "${id}" -> "${slug}", aber Recovery kennt `
      + 'dieses Kuerzel nicht. Das Muskeldetail-Fenster bliebe leer.')
  }
})

test('die Luecken sind benannt, nicht stillschweigend', () => {
  // [cmd] EIN Kuerzel hat die Karte nicht: `abductors` (Aussenseite
  // des Oberschenkels). Sie fuehrt nur `adductors` (Innenseite).
  //
  // `upper_back` und `lower_back` standen hier zuerst mit drin — zu
  // Unrecht. Die Karte hat sie, nur mit Bindestrich geschrieben. Der
  // Fehler fiel erst beim Zaehlen der gerenderten Gruppen im Browser
  // auf, nicht beim Lesen. Deshalb prueft dieser Test die Liste
  // ausdruecklich gegen eine feste Erwartung: wer sie aendert, muss
  // begruenden.
  assert.deepEqual([...OHNE_ENTSPRECHUNG].sort(), ['abductors'],
    'Die Liste der nicht darstellbaren Gruppen hat sich geaendert.')
})

test('alle 18 Recovery-Kuerzel bis auf die benannte Luecke landen auf der Karte', () => {
  // [cmd] Die Gegenprobe zum Test oben: 17 von 18 muessen ankommen.
  // Ein stillschweigend auf `null` gesetztes Kuerzel faellt hier auf.
  const werte = Object.fromEntries(MUSCLE_GROUPS_BODYMAP.map(s => [s, 50]))
  const raus = alsErmuedung(werte)
  const zugeordnet = MUSCLE_GROUPS_BODYMAP.filter(s => RECOVERY_ZU_KARTE[s])
  assert.equal(zugeordnet.length, 17,
    `${zugeordnet.length} von 18 Kuerzeln sind zugeordnet, erwartet 17.`)
  // Die beiden Deltoid-Kuerzel fallen auf eine Gruppe zusammen.
  assert.equal(raus.length, 16,
    `${raus.length} Gruppen eingefaerbt, erwartet 16 (17 minus die `
    + 'zusammenfallenden Deltoids).')
})

test('Bereitschaft wird zu Ermuedung umgedreht', () => {
  // [cmd] DER FEHLER, DEN DAS VERHINDERT: Recovery fuehrt
  // BEREITSCHAFT (100 = erholt), die Karte ERMUEDUNG (100 = platt).
  // Ohne Umkehr stuende ein erholter Koerper auf Rot.
  const raus = alsErmuedung({ chest: 95 })
  assert.equal(raus.length, 1)
  assert.equal(raus[0].id, 'chest')
  assert.equal(raus[0].fatigue, 5, '95 % bereit sind 5 % ermuedet.')
})

test('beide Deltoid-Kuerzel treffen dieselbe Gruppe, der schlechtere Wert gewinnt', () => {
  // [cmd] Die Karte fuehrt `deltoids` einmal (side:'both'), Recovery
  // trennt vorne/hinten. Wer den besseren Wert zeigt, beruhigt
  // faelschlich.
  const raus = alsErmuedung({ front_deltoids: 90, back_deltoids: 40 })
  assert.equal(raus.length, 1, 'Eine Gruppe, nicht zwei.')
  assert.equal(raus[0].id, 'deltoids')
  assert.equal(raus[0].fatigue, 60, 'Der schlechtere Wert (40 % bereit) gewinnt.')
})

test('nicht darstellbare Kuerzel fallen weg statt falsch zu landen', () => {
  // `abductors` kennt die Karte nicht — der Wert verschwindet, statt
  // auf `adductors` oder `gluteal` zu rutschen. Eine erfundene
  // Zuordnung waere eine Falschaussage ueber den Koerper.
  const raus = alsErmuedung({ abductors: 10 })
  assert.deepEqual(raus, [],
    'Kein Wert darf auf einen benachbarten Muskel rutschen.')
})

test('der Ruecken landet auf den Bindestrich-Gruppen der Karte', () => {
  // [cmd] Die Regressionswache zum beinahe-Fehler: Recovery schreibt
  // `upper_back`, die Karte `upper-back`. Wer das wieder auf `null`
  // setzt, laesst zwei Gruppen grau — ohne Fehlermeldung.
  const raus = alsErmuedung({ upper_back: 40, lower_back: 30 })
  assert.deepEqual(raus.map(r => r.id).sort(), ['lower-back', 'upper-back'])
})

test('der Muskelkater behaelt seine Richtung', () => {
  // [cmd] Stufe 0 = kein Kater. Das ist bereits die
  // Ermuedungsrichtung — hier darf NICHT umgedreht werden.
  const keiner = katerAlsMuskeln({ chest: 0 })
  const voll = katerAlsMuskeln({ chest: 3 })
  assert.equal(keiner[0].color, 'var(--surface-2)', 'Stufe 0 ist unauffaellig.')
  assert.equal(voll[0].color, 'var(--neg)', 'Stufe 3 ist rot.')
})
