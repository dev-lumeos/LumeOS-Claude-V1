// G-247 / E-24: Zeitraum, Spanne und Verlauf.
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

import {
  ZEITRAEUME, ZEITRAUM_STANDARD, ZEITRAUM_TEXT,
  spanneVon, spitzeUeberschreitet, spannenSatz, lueckenSatzZeitraum,
  abdeckungsSatz, skalaVon, tagesLageImVerlauf, LEERE_SPANNE,
  type Tageswert,
} from '../mikro-zeitraum'

const tag = (d: string, v: number | null, c = true): Tageswert =>
  ({ entry_date: d, total_value: v, value_complete: c })

test('G-247: die vier Zeitraeume sind die des Mockups', () => {
  // `[cmd]` `module-nutrition-nutrients.jsx:485` fuehrt
  // `["today","7d","30d","90d"]`.
  assert.deepEqual([...ZEITRAEUME], [1, 7, 30, 90])
  assert.equal(ZEITRAUM_STANDARD, 1,
    'Der Standard bleibt der Tag — die Oberflaeche laeuft im Tagesmodus (G-247).')
  assert.equal(ZEITRAUM_TEXT[1], 'Heute')
})

// ── Der Schnitt ──────────────────────────────────────────────────

test('G-247: der Schnitt mittelt die Tage MIT Wert, nicht das Fenster', () => {
  // `[read]` Ein Tag ohne Erfassung ist keine Null — dieselbe Regel
  // wie C-48 und G-239. Wer ihn mitmittelt, drueckt den Schnitt.
  const s = spanneVon([
    tag('2026-05-30', 60), tag('2026-05-31', null), tag('2026-06-01', 40),
  ])
  assert.equal(s.schnitt, 50, 'Der leere Tag darf nicht als 0 zaehlen (G-247).')
  assert.equal(s.tage, 2)
})

test('G-247: ohne Tageswerte gibt es keinen Schnitt, keine Null', () => {
  assert.deepEqual(spanneVon([]), LEERE_SPANNE)
  assert.equal(spanneVon([tag('2026-06-01', null)]).schnitt, null)
})

// ── Die Spanne, der Kern von E-24 ────────────────────────────────

test('G-247 E-24: die Spanne nennt beide Enden MIT Tag', () => {
  // **Tom:** „mit dem Zusatz, wann sie waren. Eine Ueberschreitung
  // an drei aufeinanderfolgenden Tagen sieht anders aus als drei
  // verstreute."
  const s = spanneVon([
    tag('2026-05-30', 20.1), tag('2026-05-31', 74.8), tag('2026-06-01', 40),
  ])
  assert.equal(s.kleinster, 20.1)
  assert.equal(s.groesster, 74.8)
  assert.equal(s.kleinster_tag, '2026-05-30')
  assert.equal(s.groesster_tag, '2026-05-31')
  const satz = spannenSatz(s, 'mg')
  assert.match(satz, /2026-05-31/, 'Der Tag der Spitze fehlt (E-24).')
  assert.match(satz, /aus 3 Tagen/)
})

test('G-247 E-24: die Spitze schlaegt durch, wo der Schnitt sie verdeckt', () => {
  // `[cmd]` **Vitamin A auf dev, 90 Tage bis 2026-06-01:** Schnitt
  // 2.820 µg, Spitze 5.865 µg, Grenze 3.000 µg — 6 von 12 Tagen
  // darueber, der Schnitt darunter.
  const s = spanneVon([
    tag('2026-05-25', 900), tag('2026-05-26', 5865), tag('2026-05-27', 1200),
  ])
  assert.ok(s.schnitt !== null && s.schnitt <= 3000, 'Vorbedingung: Schnitt unter Grenze')
  assert.equal(spitzeUeberschreitet(s, 'upper_limit', 3000), true)
})

test('G-247: bei einem ZIELWERT ist ein hoher Tag keine Warnung', () => {
  // `[read]` C-48 Regel 2 gilt auch im Zeitraum: ein einzelner hoher
  // Tag gegen ein PRI ist ein guter Tag, keine Ueberschreitung.
  const s = spanneVon([tag('2026-05-30', 100), tag('2026-05-31', 5000)])
  assert.equal(spitzeUeberschreitet(s, 'target', 3000), false)
  assert.equal(spitzeUeberschreitet(s, null, 3000), false)
})

test('G-247: ohne Ueberschreitung meldet die Spanne nichts', () => {
  const s = spanneVon([tag('2026-05-30', 100), tag('2026-05-31', 200)])
  assert.equal(spitzeUeberschreitet(s, 'upper_limit', 3000), false)
})

// ── Regel 1 im Zeitraum ──────────────────────────────────────────

test('G-247: Luecken im Zeitraum werden gezaehlt und benannt', () => {
  // `[cmd]` **Ueber 90 Tage auf dev sind 973 von 1.794 Tageszeilen
  // unvollstaendig — alle 138 Naehrstoffe betroffen.** Im Tagesmodus
  // war das die Ausnahme, im Zeitraum ist es der Normalfall.
  const s = spanneVon([
    tag('2026-05-30', 60, false), tag('2026-05-31', 40, true),
  ])
  assert.equal(s.tage_unvollstaendig, 1)
  const satz = lueckenSatzZeitraum(s)
  assert.match(satz, /An einem der Tage/)
  assert.match(satz, /zu niedrig/,
    'Die Richtung des Fehlers fehlt (C-48 Regel 1).')
})

test('G-247: ohne Luecke kein Satz', () => {
  assert.equal(lueckenSatzZeitraum(spanneVon([tag('2026-06-01', 10)])), '')
})

// ── Die Abdeckung ────────────────────────────────────────────────

test('G-247: ein kurzes Fenster wird benannt, nicht beschoenigt', () => {
  // `[cmd]` **Auf dev beginnen die Daten am 2026-05-20.** Ein
  // 90-Tage-Fenster bis 2026-06-01 findet nur 13 Tage — dieselbe
  // Zahl wie das 30-Tage-Fenster. „90 Tage" waere eine Behauptung.
  const s = spanneVon(Array.from({ length: 13 },
    (_, i) => tag(`2026-05-${20 + i}`, 100)))
  assert.match(abdeckungsSatz(s, 90), /13 von 90 Tagen/)
  assert.equal(abdeckungsSatz(s, 7), '',
    'Ein volles Fenster braucht keinen Hinweis (G-247).')
  assert.equal(abdeckungsSatz(s, 1), '',
    'Im Tagesmodus gibt es keine Abdeckungsfrage (G-247).')
})

// ── Der Verlauf, drei Linien ─────────────────────────────────────

test('G-247 E-24: die Skala haelt die Obergrenze im Bild', () => {
  // `[read]` Sonst faellt die Grenze aus dem Rahmen, und der
  // Betrachter haelt den hoechsten Balken fuer die Grenze.
  const skala = skalaVon(
    [{ tag: '2026-06-01', wert: 100, vollstaendig: true }],
    { mittelwert: 100, zielwert: 750, obergrenze: 3000 })
  assert.ok(skala >= 3000, 'Die Obergrenze liegt ausserhalb der Skala (E-24).')
})

test('G-247 E-24: der Tag wird gegen die richtige Linie gefaerbt', () => {
  // `[read]` C-48 Regel 2 im Bild: gegen die Obergrenze faerbt ein
  // hoher Wert rot, gegen den Zielwert gruen.
  const linien = { mittelwert: 2800, zielwert: 750, obergrenze: 3000 }
  assert.equal(tagesLageImVerlauf(5865, linien, 'upper_limit'), 'zu_viel')
  assert.equal(tagesLageImVerlauf(900, linien, 'upper_limit'), 'gedeckt')
  assert.equal(tagesLageImVerlauf(900, linien, 'target'), 'gedeckt')
  assert.equal(tagesLageImVerlauf(100, linien, 'target'), 'zu_wenig')
  assert.equal(tagesLageImVerlauf(null, linien, 'target'), null)
})

// ── Die Anzeige haelt sich daran ─────────────────────────────────

const ohneKommentare = (p: string) => fs.readFileSync(path.join(process.cwd(), p), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^[ \t]*\/\/.*$/gm, '')

test('G-247: die Zeitraum-Datei bewertet nicht selbst', () => {
  // `[read]` Die Bewertung steht in `mikro-lage.ts` (G-239) und in
  // der Datenbank. Hier waere sie eine dritte Wahrheit.
  const s = ohneKommentare('src/lib/nutrition/mikro-zeitraum.ts')
  assert.doesNotMatch(s, /reference_status|reference_pct\b/,
    'Der Zeitraum greift in die Bewertung (G-239, G-247).')
})

test('G-247: der Verlauf erscheint nur bei 7/30/90', () => {
  // `[read]` Im Tagesmodus ist der Tag die Spanne — ein Verlauf aus
  // einem Punkt sagt nichts.
  const s = ohneKommentare('src/app/v2/nutrition/mikro-ansicht.tsx')
  assert.match(s, /zeitraum !== 1/,
    'Der Verlauf ist nicht auf 7/30/90 begrenzt (G-247).')
})

test('G-247: die Pillen filtern, mit „alle" voran', () => {
  // `[read]` **Erste Fassung prueste nur, ob `setFilter` im Text
  // steht** — eine Sabotage, die `setFilter` zur leeren Funktion
  // machte, kam durch. Geprueft wird jetzt die WIRKUNG: dass die
  // Liste nach dem Zustand gefiltert wird und der Zustand
  // veraenderbar ist.
  const s = ohneKommentare('src/app/v2/nutrition/mikro-ansicht.tsx')
  assert.match(s, /React\.useState<Lage \| 'alle'>\('alle'\)/,
    'Der Filterzustand ist nicht veraenderbar (G-247).')
  assert.match(s, /filter === 'alle' \? stoffe : stoffe\.filter\(/,
    'Die Liste wird nicht nach dem Filter geschnitten (G-247).')
  assert.match(s, /aria-pressed=\{aktiv\}/,
    'Der gewaehlte Filter ist per Tastatur nicht erkennbar (G-247).')
})
