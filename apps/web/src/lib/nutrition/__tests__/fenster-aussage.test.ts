// G-108 / G-250: was der Mittelwert verschweigt, und die zwei Achsen.
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

import {
  mittelwertSatz, zeigtMittelwertHinweis, achsenGehenAuseinander,
  achsenVermerk, ZWEI_ACHSEN_CODES,
} from '../fenster-aussage'
import { GEDECKT_AB } from '../mikro-lage'

// ── G-108: der Hinweis auf den Mittelwert ────────────────────────

test('G-108: bei einem Tag gibt es keinen Mittelwert-Hinweis', () => {
  // `[cmd]` Bei `Heute` steht die Tagessumme, kein Schnitt — der
  // Hinweis waere dort schlicht falsch.
  assert.equal(zeigtMittelwertHinweis(1), false)
  assert.equal(mittelwertSatz(1), '')
})

test('G-108: ab zwei Tagen steht der Hinweis', () => {
  for (const f of [7, 30, 90]) {
    assert.equal(zeigtMittelwertHinweis(f), true, `Fenster ${f}`)
    assert.notEqual(mittelwertSatz(f), '', `Fenster ${f}`)
  }
})

test('G-108: der Hinweis nennt beide Haelften und die Traegheit', () => {
  // `[read]` **Der Satz muss die gemessene Lage treffen:** die Auswahl
  // aendert sich beim Fensterwechsel kaum. `[cmd]` Gemessen am
  // 2026-08-29: dieselben zwoelf Codes bei 7, 30 und 90 Tagen.
  const s = mittelwertSatz(30)
  assert.match(s, /Schnitt über den Zeitraum/)
  assert.match(s, /Hälfte/)
  assert.match(s, /ändert sich kaum/)
})

test('G-108: der Hinweis behauptet keine Zahl', () => {
  // `[read]` Er nennt die Grenze der gezeigten Zahlen, nicht eine
  // eigene — eine Zahl waere hier eine zweite Wahrheit.
  assert.doesNotMatch(mittelwertSatz(90), /\d/)
})

// ── G-250: die zwei Achsen ───────────────────────────────────────

test('G-250: sechs Codes tragen ein persoenliches Ziel, nicht 60', () => {
  // `[cmd]` **Der Punkt sagte 60 — gemessen sind es SECHS.**
  // `goals.nutrition_targets` fuehrt genau sechs Naehrstoffspalten.
  assert.equal(ZWEI_ACHSEN_CODES.length, 6)
  assert.deepEqual([...ZWEI_ACHSEN_CODES].sort(),
    ['CHO', 'ENERCC', 'F18:2CN6', 'F18:3CN3', 'FAT', 'PROT625'])
})

test('G-250: die Liste deckt sich mit MAKRO_ZIEL im Leseweg', () => {
  // `[read]` **Wirkung, nicht Wort:** die Liste hier muss dieselben
  // Codes nennen wie die Stelle, die das Ziel tatsaechlich zuweist.
  // Laeuft eine auseinander, zeigt der Reiter einen Vermerk fuer
  // einen Code, der gar kein persoenliches Ziel hat.
  const quelle = fs.readFileSync(
    path.join(process.cwd(), 'src/lib/nutrition/naehrstoff-ordnung.ts'), 'utf8')
  const block = /const MAKRO_ZIEL[\s\S]*?\n\}/.exec(quelle)
  assert.ok(block, 'MAKRO_ZIEL nicht gefunden.')
  for (const code of ZWEI_ACHSEN_CODES) {
    const gesucht = code.includes(':') ? `'${code}'` : code
    assert.ok(block[0].includes(gesucht),
      `${code} fehlt in MAKRO_ZIEL — die Liste ist veraltet.`)
  }
  // Und umgekehrt: keine Zuweisung, die hier fehlt.
  const zeilen = block[0].match(/^\s+'?[A-Za-z0-9:]+'?:\s*z =>/gm) ?? []
  assert.equal(zeilen.length, ZWEI_ACHSEN_CODES.length,
    `MAKRO_ZIEL hat ${zeilen.length} Zuweisungen, die Liste ${ZWEI_ACHSEN_CODES.length}.`)
})

test('G-250: der gemessene Widerspruch wird erkannt', () => {
  // `[cmd]` **F18:3CN3 am 2026-08-29, dev, 30 Tage:** 85,7 % des
  // persoenlichen Ziels (gedeckt) gegen 51,6 % der Referenz (zu
  // wenig). **Der eine Fall von dreien.**
  assert.equal(achsenGehenAuseinander(85.7, 51.6, GEDECKT_AB), true)
})

test('G-250: uebereinstimmende Achsen erzeugen keinen Vermerk', () => {
  // `[cmd]` PROT625: 96,8 % des Ziels, 192,7 % der Referenz — beide
  // gedeckt. F18:2CN6: 57,7 % und 46,1 % — beide zu wenig.
  assert.equal(achsenGehenAuseinander(96.8, 192.7, GEDECKT_AB), false)
  assert.equal(achsenGehenAuseinander(57.7, 46.1, GEDECKT_AB), false)
})

test('G-250: ohne zweite Achse kein Widerspruch', () => {
  // `[cmd]` ENERCC, CHO und FAT liefern keinen `reference_pct` —
  // `energy_share` beziehungsweise gar kein Wert. `[read]` **Kein
  // Vergleich ist etwas anderes als ein uebereinstimmender.**
  assert.equal(achsenGehenAuseinander(97.0, null, GEDECKT_AB), false)
  assert.equal(achsenGehenAuseinander(null, 51.6, GEDECKT_AB), false)
  assert.equal(achsenGehenAuseinander(null, null, GEDECKT_AB), false)
})

test('G-250: der Vermerk nennt beide Zahlen und beide Herkuenfte', () => {
  // `[read]` **G-250 verlangt: die Zeile muss sagen, welche sie
  // meint.** Der Vermerk nennt beide, damit die Zeile nicht raten
  // laesst.
  const v = achsenVermerk(85.7, 51.6)
  assert.match(v, /86 % deines Ziels/)
  assert.match(v, /52 % der wissenschaftlichen Referenz/)
})

// ── Die Anzeige haelt sich daran ─────────────────────────────────

const ohneKommentare = (f: string) => fs.readFileSync(path.join(process.cwd(), f), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^[ \t]*\/\/.*$/gm, '')

test('G-108: der Reiter zeigt den Hinweis', () => {
  // `[read]` **Wirkung, nicht Wort.** Eine erste Fassung suchte nur
  // `mittelwertSatz(` im Quelltext — eine Sabotage, die die Bedingung
  // durch `false` ersetzte, ueberlebte das: der Aufruf stand ja noch
  // da, nur nie ausgefuehrt. **Geprueft wird jetzt die Bedingung
  // selbst.**
  const s = ohneKommentare('src/app/v2/nutrition/naehrstoff-ordnung-tab.tsx')
  const block = /\{([^{}]*zeigtMittelwertHinweis[^{}]*)&&\s*\(/.exec(s)
  assert.ok(block,
    'Der Hinweis haengt nicht an `zeigtMittelwertHinweis` (G-108).')
  assert.match(block[1], /zeigtMittelwertHinweis\(\s*d\.fenster\s*\)/,
    'Die Bedingung prueft nicht das Fenster der Ordnung (G-108).')
  assert.match(s, /mittelwertSatz\(\s*d\.fenster\s*\)/,
    'Der Satz wird nicht mit dem Fenster gebildet (G-108).')
})

test('G-108: keine zweite Ansicht neben die bestehende', () => {
  // `[cmd]` **Dreimal passiert** — G-249, G-11, in G-253 verhindert.
  // `[read]` **Wirkung, nicht Wort:** geprueft wird, dass der Reiter
  // GENAU EINE Ordnung rendert.
  const s = ohneKommentare('src/app/v2/nutrition/ansicht.tsx')
  const treffer = s.match(/<NaehrstoffOrdnungTab/g) ?? []
  assert.equal(treffer.length, 1,
    `Der Reiter rendert die Ordnung ${treffer.length}-mal (G-108).`)
})
