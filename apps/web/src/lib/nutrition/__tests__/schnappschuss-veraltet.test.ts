// Der ueberholte Schnappschuss — G-223.
//
// `[cmd]` **SPEC_10:** *„der Knopf erscheint, wenn die
// Lebensmitteldaten neuer sind als der Schnappschuss."*
//
// `[read]` **Geprueft wird die ENTSCHEIDUNG, nicht die Anzeige** —
// die ist am Schirm gemessen (A4: ein Knopf an der veralteten Zeile,
// null danach). `[read]` **Sie steht als eigene Funktion da, damit
// sie pruefbar ist:** eine Bedingung im JSX prueft nur das Wort.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import { istSchnappschussVeraltet } from '../diary-model'

test('neuerer Bestand als Schnappschuss: veraltet', () => {
  assert.equal(istSchnappschussVeraltet({
    frozen_at: '2026-08-01T00:00:00Z',
    food_updated_at: '2026-08-15T00:00:00Z',
  }), true)
})

test('Schnappschuss neuer als Bestand: nicht veraltet', () => {
  // `[cmd]` Der Normalfall in den Daten: alle 9065 Zeilen sind am
  // 2026-08-23 oder spaeter eingefroren, `foods` zuletzt am 08-15.
  assert.equal(istSchnappschussVeraltet({
    frozen_at: '2026-09-06T00:00:00Z',
    food_updated_at: '2026-08-15T00:00:00Z',
  }), false)
})

test('gleicher Zeitpunkt: nicht veraltet', () => {
  // `[read]` `>` und nicht `>=` — wer im selben Augenblick einfriert,
  // hat den Stand gerechnet.
  const t = '2026-08-15T00:00:00Z'
  assert.equal(istSchnappschussVeraltet({ frozen_at: t, food_updated_at: t }), false)
})

test('ohne Bestand kein Urteil — manueller Posten', () => {
  // `[read]` `food_id IS NULL` bei `manual` und `custom`: es gibt
  // keinen Bestand, gegen den sich vergleichen liesse. **Das ist
  // nicht „aktuell", sondern nicht entscheidbar** — und ein Knopf
  // waere hier ein Regler ohne Wirkung (C-426).
  assert.equal(istSchnappschussVeraltet({
    frozen_at: '2026-08-01T00:00:00Z', food_updated_at: null,
  }), false)
})

test('ohne Schnappschuss kein Urteil', () => {
  assert.equal(istSchnappschussVeraltet({
    frozen_at: null, food_updated_at: '2026-08-15T00:00:00Z',
  }), false)
})

test('unlesbares Datum faellt nicht auf true zurueck', () => {
  // `[read]` Ein kaputter Zeitstempel darf keinen Knopf erzeugen —
  // sonst stuende er dauerhaft da und liesse sich nicht wegklicken.
  assert.equal(istSchnappschussVeraltet({
    frozen_at: 'kein Datum', food_updated_at: '2026-08-15T00:00:00Z',
  }), false)
})

// ── Der Leseweg muss die zwei Felder holen ──────────────────────────
//
// `[cmd]` Der Pfad kommt aus `import.meta.url`, nicht aus `cwd` —
// sonst ist die Probe aus der Wurzel gruen und faellt im Gate.
const HIER = dirname(fileURLToPath(import.meta.url))
const WRITE = readFileSync(join(HIER, '..', 'diary-write.ts'), 'utf8')

function ohneKommentare(s: string): string {
  return s.split('\n').filter(z => !z.trimStart().startsWith('//')).join('\n')
}

test('die Abfrage holt frozen_at und den Bestand mit', () => {
  const w = ohneKommentare(WRITE)
  assert.match(w, /\.select\('[^']*frozen_at[^']*'\)/,
    'die Abfrage holt frozen_at nicht — ohne ihn ist nichts vergleichbar')
  assert.match(w, /\.select\('[^']*foods!left\(updated_at\)[^']*'\)/,
    'die Abfrage holt den Bestand nicht mit')
})

test('der Verbund ist left, nicht inner', () => {
  // `[cmd]` **Mit `!inner` fielen manuelle Posten und eigene
  // Lebensmittel aus der Liste** — beide haben `food_id IS NULL`.
  // **Das Tagebuch waere stillschweigend kuerzer** (Klasse G-348).
  const w = ohneKommentare(WRITE)
  assert.ok(!/foods!inner\(/.test(w),
    'foods!inner wuerde Zeilen ohne food_id verschlucken')
})
