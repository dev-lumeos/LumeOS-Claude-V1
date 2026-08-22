// G-110: das Gate von Extended.
//
// `[read]` Warum diese Funktion einen Test bekommt: Bis G-110 war das
// Gate ein `useState(false)` — **wer klickte, sah die Protokolle**
// (G-92). Die Entscheidung, wer durchkommt, ist jetzt eine Regel; ein
// Test haelt sie fest, damit sie nicht beim naechsten Umbau kippt.
import test from 'node:test'
import assert from 'node:assert/strict'

import { reichtDerGrad, GRAD_FUER_EXTENDED } from '../regeln-read'

test('ohne Angabe kommt niemand durch', () => {
  // `[cmd]` Der Live-Zustand am 2026-08-20: alle 7 Profile NULL.
  assert.equal(reichtDerGrad(null), false)
  assert.equal(reichtDerGrad(''), false)
})

test('Anfaenger reicht nicht', () => {
  assert.equal(reichtDerGrad('beginner'), false)
})

test('ab der gesetzten Stufe ist offen', () => {
  // `[cmd]` **G-167 (2026-08-22): von `advanced` auf `pro`.** Hier
  // stand `assert.equal(GRAD_FUER_EXTENDED, 'advanced')` — die Pruefung
  // hat den Wechsel gemeldet, wie sie soll.
  //
  // `[read]` **Tom, 2026-08-22:** *„es ist noch nicht definiert, also
  // legen wir es jetzt auf pro und elite."* Die Grenze ist ein
  // Provisorium; `EXTENDED_VORLAEUFIG` sagt es in der Oberflaeche.
  assert.equal(GRAD_FUER_EXTENDED, 'pro')
  assert.equal(reichtDerGrad('pro'), true)
})

test('advanced reicht seit G-167 nicht mehr', () => {
  assert.equal(reichtDerGrad('advanced'), false)
})

test('hoehere Stufen reichen auch', () => {
  assert.equal(reichtDerGrad('elite'), true)
})

test('ein unbekannter Wert reicht nicht', () => {
  // `[read]` Die Datenbank hat einen CHECK auf die vier Werte — aber
  // ein Gate, das bei Unbekanntem oeffnet, waere die falsche Richtung.
  assert.equal(reichtDerGrad('halbgott'), false)
  assert.equal(reichtDerGrad('ADVANCED'), false)
})
