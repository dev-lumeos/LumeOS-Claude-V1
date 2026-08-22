// Das Gate von Extended — alle vier Stufen einzeln (G-167).
//
// `[read]` **Tom, 2026-08-22:** *„es ist noch nicht definiert, also
// legen wir es jetzt auf pro und elite."*
//
// `[cmd]` **Vier Stufen, nicht zwei.** Der Auftrag verlangt jede
// einzeln: `beginner` und `advanced` gesperrt, `pro` und `elite` offen,
// ohne Angabe gesperrt. Eine Pruefung, die nur die Grenze testet,
// uebersieht eine verrutschte Reihenfolge.
import { test } from 'node:test'
import assert from 'node:assert/strict'

import {
  EXTENDED_VORLAEUFIG, GRADE, GRAD_FUER_EXTENDED, reichtDerGrad,
} from '../extended-regel'

test('offen sind genau pro und elite', () => {
  assert.equal(reichtDerGrad('beginner'), false, 'beginner muss gesperrt sein')
  assert.equal(reichtDerGrad('advanced'), false, 'advanced muss gesperrt sein')
  assert.equal(reichtDerGrad('pro'), true, 'pro muss offen sein')
  assert.equal(reichtDerGrad('elite'), true, 'elite muss offen sein')
})

test('ohne gesetzten Grad bleibt es zu', () => {
  // `[read]` Wer nichts angibt, bekommt nicht im Zweifel Zugang.
  assert.equal(reichtDerGrad(null), false)
  assert.equal(reichtDerGrad(''), false)
})

test('ein unbekannter Wert oeffnet nichts', () => {
  // `[cmd]` `indexOf` gibt -1, und -1 >= 2 ist falsch. Ohne diese
  // Pruefung koennte ein Tippfehler in der Datenbank das Gate oeffnen.
  assert.equal(reichtDerGrad('profi'), false)
  assert.equal(reichtDerGrad('PRO'), false)
})

test('die Grenze steht auf pro — nicht mehr auf advanced', () => {
  // `[cmd]` G-167 hat sie verschoben. Faellt sie zurueck, schlaegt das
  // hier an, bevor es jemand in der Oberflaeche sieht.
  assert.equal(GRAD_FUER_EXTENDED, 'pro')
  assert.equal(GRADE.indexOf(GRAD_FUER_EXTENDED), 2,
    'pro ist die dritte von vier Stufen')
})

test('der Provisoriums-Satz traegt seine drei Aussagen', () => {
  // `[read]` **Ohne diesen Satz wird die Regel in vier Wochen als
  // Entscheidung gelesen** — genau so sind die fuenf Banner
  // entstanden, die G-155 gefunden hat. Der Test haelt fest, WAS er
  // sagen muss, nicht wie er formuliert ist.
  const t = EXTENDED_VORLAEUFIG.toLowerCase()
  assert.match(t, /vorlaeufig|vorläufig/, 'muss sagen, dass es vorlaeufig ist')
  assert.match(t, /offen|nicht entschieden|noch nicht/,
    'muss sagen, dass es noch nicht entschieden ist')
  assert.match(t, /modul/, 'muss das zubuchbare Modul als Moeglichkeit nennen')
  assert.match(t, /tarif/, 'muss die Tarifstufe als Moeglichkeit nennen')
  assert.match(t, /pro und elite/, 'muss die geltende Zwischenregel nennen')
})
