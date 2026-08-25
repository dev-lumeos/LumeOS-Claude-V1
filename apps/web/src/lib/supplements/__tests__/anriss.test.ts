// G-177: der Anriss einer Klappe nennt Inhalt, nicht Spaltenzahl.
//
// ── DER BEFUND ──────────────────────────────────────────────────────
//
// Tom, 2026-08-23: *„das detail sieht erstens scheisse aus und
// zweitens alles ausser was ein user wirklich sehen will."*
//
// `[cmd]` **Bromocriptine zeigte fuenf zugeklappte Bloecke mit
// „N Felder"** — und darunter aufgeklappt einen Schemabericht, laenger
// als alles zusammen.
//
// `[cmd]` **Und „N Felder" zaehlte Spalten, nicht Angaben:**
// *„Sicherheit — 2 Felder"*, **beide `unbekannt`**. Die Zahl versprach
// Inhalt, den es nicht gab. Gemessen ueber die 290:
// `dosing.status` **115 unbekannt**, `safety.status` **53**.
import { test } from 'node:test'
import assert from 'node:assert/strict'

import { anriss } from '../substanz-anzeige'
import type { Block } from '../substanz-anzeige'

function block(felder: Array<[string, string]>): Block {
  return {
    titel: 'X',
    felder: felder.map(([label, wert]) => ({
      pfad: `x.${label}`, label, zeilen: wert ? [wert] : [], herkunft: null,
    })),
  }
}

test('ein kurzer Wert schlaegt seinen Feldnamen', () => {
  // `[cmd]` `not_prohibited` sagt mehr als „wada status".
  assert.equal(anriss(block([['wada status', 'not_prohibited']])), 'not_prohibited')
})

test('unbekannt zaehlt NICHT als Inhalt — der Fall Bromocriptine', () => {
  // `[cmd]` Genau die zwei Felder, die *„Sicherheit — 2 Felder"*
  // ergaben. Beide `unknown`, also nichts zu zeigen.
  const b = block([['pregnancy status', 'unknown'], ['lactation status', 'unknown']])
  assert.equal(anriss(b), 'keine Angaben',
    'Zwei Felder mit `unknown` sind keine zwei Angaben.')
})

test('true, false und blosse Zahlen sagen ohne ihr Feld nichts', () => {
  // `[cmd]` Der erste Entwurf riss `Rechtslage` als „usa · false ·
  // not_prohibited" an und `Evidenz` als „summary en · false · 0 · D".
  const b = block([['jurisdiction', 'usa'], ['approved drug', 'false'],
    ['human trials', '0']])
  const a = anriss(b)
  assert.equal(a.includes('false'), false, '`false` gehoert nicht in den Anriss.')
  assert.equal(/(^|·\s)0(\s·|$)/.test(a), false, 'Eine nackte 0 auch nicht.')
  assert.ok(a.includes('usa'), 'Der aussagekraeftige Wert bleibt.')
  assert.ok(a.includes('approved drug'), 'Statt `false` steht sein Feldname da.')
})

test('leere Sammlungen zaehlen nicht — der Fall Qualitaet', () => {
  // `[cmd]` `supplement_quality` traegt bei Creatine
  // `contamination_risk: "[]"` und `purity_considerations_en: "[]"` —
  // als Zeichenkette, nicht als Array. Der Anriss zeigte „[]".
  const b = block([['counterfeit risk', 'unknown'],
    ['contamination risk', '[]'], ['purity considerations en', '[]']])
  assert.equal(anriss(b), 'keine Angaben')
})

test('nichts drin heisst „keine Angaben", nicht „0 Felder"', () => {
  assert.equal(anriss(block([])), 'keine Angaben')
})

test('lange Werte werden am Trenner gekuerzt, nicht im Wort', () => {
  const b = block([
    ['a', 'lactation status'], ['b', 'insufficient_data'],
    ['c', 'pregnancy note en'], ['d', 'contraindications en'],
    ['e', 'common side effects en'],
  ])
  const a = anriss(b)
  assert.ok(a.length <= 66, `Zu lang: ${a.length}`)
  assert.ok(a.endsWith('…'), 'Gekuerztes endet mit Auslassung.')
  assert.equal(/\S…$/.test(a), false,
    'Gekuerzt wird am Trenner — nicht mitten im Wort.')
})
