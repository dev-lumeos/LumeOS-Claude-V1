// G-37: die abgeleiteten Werte einer Stack-Position.
//
// `[read]` Nur die reine Rechnung wird geprueft — kein Netz, keine
// Datenbank. Die Zahlen stammen aus der Messung auf `dev@lumeos.app`
// vom 2026-08-18, damit ein Rechenfehler gegen einen echten Fall
// auffaellt und nicht gegen einen ausgedachten.
import test from 'node:test'
import assert from 'node:assert/strict'

import { ableiten } from '../stack-read'

test('Kosten und Reichweite aus Dosis, Portion und Preis', () => {
  // `[cmd]` Creatine: 5 g Tagesdosis, Portion 5 g, 0,15 €/Portion,
  // Bestand 180 g, Schwelle 50.
  const r = ableiten(5, 180, 50, { serving_size: 5, cost_per_serving: 0.15 })
  assert.equal(r.portionen_pro_tag, 1)
  assert.ok(Math.abs((r.kosten_pro_tag ?? 0) - 0.15) < 1e-9)
  assert.equal(r.tage_bis_leer, 180)
  assert.equal(r.unter_schwelle, false)
})

test('unter der Schwelle wird als solches erkannt', () => {
  // `[cmd]` Vitamin D3: Bestand 4, Schwelle 7 — der eine Fall im
  // Register, an dem `refillUrgent` haengt.
  const r = ableiten(5000, 4, 7, { serving_size: 5000, cost_per_serving: 0.08 })
  assert.equal(r.unter_schwelle, true)
  assert.equal(r.tage_bis_leer, 4)
})

test('ohne Preis bleibt die Kostenzahl leer statt null zu werden', () => {
  // `null` heisst „nicht rechenbar". Eine 0 waere die Behauptung, es
  // koste nichts.
  // Omega-3: 2 g Tagesdosis bei 2 g Portion = 1 Portion/Tag,
  // Bestand 30 reicht also 30 Tage.
  const r = ableiten(2, 30, 10, { serving_size: 2, cost_per_serving: null })
  assert.equal(r.kosten_pro_tag, null)
  assert.equal(r.portionen_pro_tag, 1)
  assert.equal(r.tage_bis_leer, 30)
})

test('ohne Portionsgroesse ist weder Kosten noch Reichweite ableitbar', () => {
  const r = ableiten(400, 24, 10, { serving_size: null, cost_per_serving: 0.15 })
  assert.equal(r.portionen_pro_tag, null)
  assert.equal(r.kosten_pro_tag, null)
  assert.equal(r.tage_bis_leer, null)
  // Die Schwelle haengt nicht an der Portionsgroesse.
  assert.equal(r.unter_schwelle, false)
})

test('ohne Bestand gibt es keine Schwellenaussage', () => {
  const r = ableiten(5, null, 50, { serving_size: 5, cost_per_serving: 0.15 })
  assert.equal(r.unter_schwelle, null)
  assert.equal(r.tage_bis_leer, null)
})

test('Portionsgroesse 0 fuehrt nicht zu Unendlich', () => {
  // Division durch null waere `Infinity` und wuerde als Zahl angezeigt.
  const r = ableiten(5, 180, 50, { serving_size: 0, cost_per_serving: 0.15 })
  assert.equal(r.portionen_pro_tag, null)
  assert.equal(r.kosten_pro_tag, null)
  assert.equal(r.tage_bis_leer, null)
})

test('die Monatssumme der vier gemessenen Positionen ergibt 20,40', () => {
  // `[cmd]` Gegenprobe zur Messung: Creatine 0,15 + D3 0,08 +
  // Omega-3 0,30 + Magnesium 0,15 = 0,68 €/Tag = 20,40 €/30 Tage.
  const positionen: Array<[number, number, number]> = [
    [5, 5, 0.15],
    [5000, 5000, 0.08],
    [2, 2, 0.30],
    [400, 400, 0.15],
  ]
  const tag = positionen.reduce((s, [dose, portion, preis]) =>
    s + (ableiten(dose, null, null, { serving_size: portion, cost_per_serving: preis })
      .kosten_pro_tag ?? 0), 0)
  assert.ok(Math.abs(tag - 0.68) < 1e-9, `Tageskosten ${tag}, erwartet 0,68`)
  assert.ok(Math.abs(tag * 30 - 20.4) < 1e-9, `Monat ${tag * 30}, erwartet 20,40`)
})
