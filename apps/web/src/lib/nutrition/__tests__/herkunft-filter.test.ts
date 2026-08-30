// G-276 / G-251: der MealCam-Modus und die drei Filter.
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

import {
  FILTER_LAGE, vortagLageVon, VORTAG_SATZ,
} from '../herkunft-filter'

const lies = (f: string) => fs.readFileSync(path.join(process.cwd(), f), 'utf8')
const ohneKommentare = (f: string) => lies(f)
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
  .replace(/^[ \t]*\/\/.*$/gm, '')

// ── G-276: kein falscher Absender ────────────────────────────────

test('G-276: keine Oberflaeche schreibt mealcam ohne Foto', () => {
  // `[cmd]` **Gemessen am 2026-08-30:** der Knopf aus G-274 schrieb
  // `confirmation_mode: 'mealcam'`, **ohne dass fotografiert wurde.**
  // `[cmd]` **Einen Fotoweg gibt es nirgends** — `MealCamModal` ist
  // eine Attrappe („MealCam hat kein Modell").
  //
  // `[read]` **Ein Feld, das die Herkunft benennt, muss die Wahrheit
  // sagen** — sonst ist es schlimmer als keins.
  for (const datei of [
    'src/app/v2/nutrition/plan-eintraege.tsx',
    'src/app/v2/nutrition/mahlzeiten.tsx',
  ]) {
    assert.doesNotMatch(ohneKommentare(datei), /confirmation_mode: 'mealcam'/,
      `${datei} schreibt mealcam ohne Fotoweg (G-276).`)
  }
})

test('G-276: der Schreibweg kennt den Modus weiter', () => {
  // `[read]` **Die Spalte ist richtig, nur hatte sie keinen ehrlichen
  // Absender.** `[cmd]` Der CHECK erlaubt `mealcam` und `manual`;
  // **sobald der Fotoweg steht, wird der Wert gebraucht.**
  const s = ohneKommentare('src/lib/nutrition/plan-log-write.ts')
  assert.match(s, /z\.enum\(\['mealcam', 'manual'\]\)/,
    'Der Modus ist aus dem Schreibweg entfernt — dann fehlt er, wenn '
    + 'der Fotoweg kommt (G-276).')
})

// ── G-251: gemessen, nicht gebaut ────────────────────────────────

test('G-251: je Filter steht Quelle und Luecke fest', () => {
  // `[read]` **Der Auftrag verlangt: vor dem Bau messen, woraus jeder
  // kommt.** Das Ergebnis steht hier, damit es niemand zweimal misst.
  for (const k of ['favoriten', 'wie_gestern', 'eigene'] as const) {
    assert.ok(FILTER_LAGE[k].quelle.length > 0, `${k}: keine Quelle.`)
    assert.ok(FILTER_LAGE[k].fehlt.length > 0, `${k}: keine Luecke benannt.`)
  }
  // `[cmd]` **Gemessen: `food_search` liest `foods_custom` nicht.**
  assert.match(FILTER_LAGE.eigene.fehlt, /liest die Tabelle nicht/)
  // `[cmd]` **Und `liked` ist nur ein Rangschub, kein Filter.**
  assert.match(FILTER_LAGE.favoriten.fehlt, /Rangschub/)
})

test('G-251: „gestern war nichts" und „es gibt kein gestern"', () => {
  // **Der Auftrag fragt ausdruecklich danach.** `[cmd]` **Der Fall ist
  // real:** dev hat 180 Tage mit Posten ueber eine Spanne von 181 —
  // **eine Luecke.**
  //
  // `[read]` **Zwei verschiedene Aussagen.** Wer sie zusammenwirft,
  // behauptet am ersten Tag, der Nutzer habe gefastet.
  assert.equal(vortagLageVon(true, 12), 'posten')
  assert.equal(vortagLageVon(true, 0), 'leer')
  assert.equal(vortagLageVon(false, 0), 'kein_tag')
  assert.notEqual(VORTAG_SATZ.leer, VORTAG_SATZ.kein_tag)
  assert.match(VORTAG_SATZ.leer, /nichts erfasst/)
  assert.match(VORTAG_SATZ.kein_tag, /keinen Vortag/)
  assert.equal(VORTAG_SATZ.posten, '', 'Mit Posten braucht es keinen Satz.')
})

test('G-251: kein Filter wurde gebaut', () => {
  // `[cmd]` **7.140 Lebensmittel, 50 je Seite, EIN Favorit.**
  // `[read]` **Ein clientseitiger Filter faende fast immer nichts** —
  // und saehe kaputt aus, nicht leer. **Deshalb gemeldet.**
  const s = ohneKommentare('src/app/v2/nutrition/tab-foods.tsx')
  for (const wort of ['Favoriten', 'Wie gestern', 'Eigene Foods']) {
    assert.ok(!s.includes(`>${wort}<`),
      `Ein Filter "${wort}" ist gebaut, obwohl die Datenlage ihn nicht traegt (G-251).`)
  }
})
