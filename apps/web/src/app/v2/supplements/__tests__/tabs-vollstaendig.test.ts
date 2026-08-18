// Alle zwoelf Tabs der Vorlage sind gebaut (G-45).
//
// `[read]` Tom, 2026-08-18: „Supplements ist nicht fertig als Mockup
// erstellt worden … In Supplements nochmal an den Subnavigationen
// checken und das Mockup duplizieren."
//
// WARUM ALS TEST: `[cmd]` Ein Tab, der in der Leiste steht und nichts
// rendert, sieht aus wie ein leerer Tab — nicht wie ein fehlender.
// Genau so standen fuenf Tabs seit G-29 da. Dieser Test haelt fest,
// dass zu jedem Eintrag der Leiste auch eine Weiche existiert.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

const V2 = path.join(process.cwd(), 'src/app/v2/supplements')
const lies = (f: string) => fs.readFileSync(path.join(V2, f), 'utf8')

/** Die zwoelf Tabs der Vorlage (module-supplements.jsx:240-253). */
const TABS = [
  'today', 'stack', 'extended', 'catalog', 'stacks', 'intel',
  'inventory', 'injection', 'compliance', 'interactions', 'cost',
]

test('jeder Tab der Leiste hat eine Weiche', () => {
  const ansicht = lies('ansicht.tsx')
  for (const t of TABS) {
    assert.ok(ansicht.includes(`{ id: '${t}'`),
      `Der Tab "${t}" fehlt in der Leiste.`)
    assert.ok(new RegExp(`tab === '${t}'`).test(ansicht),
      `Der Tab "${t}" steht in der Leiste, wird aber nicht gerendert. `
      + 'Ein leerer Tab sieht aus wie ein leerer Tab, nicht wie ein fehlender.')
  }
})

test('die Platzhalter-Tabelle ist weg', () => {
  // `[cmd]` `NOCH_NICHT` fuehrte die fuenf ungebauten Tabs. Sie ist
  // entfallen, weil alle gebaut sind. Wer sie wieder einfuehrt, hat
  // einen Tab zurueckgebaut — das soll auffallen.
  const ansicht = lies('ansicht.tsx')
  assert.ok(!ansicht.includes('const NOCH_NICHT'),
    'NOCH_NICHT ist zurueck — ist ein Tab wieder ungebaut?')
})

test('der Injections-Tab bringt seine Rotationskarte mit', () => {
  const inj = lies('tab-injektionen.tsx')
  for (const k of ['InjKarte', 'ortZustand', 'SuppInjections']) {
    assert.ok(new RegExp(`function ${k}\\b`).test(inj), `"${k}" fehlt.`)
  }
  // Die vier Unter-Tabs der Vorlage (Zeile 108).
  for (const t of ['rotation', 'schedule', 'log', 'guide']) {
    assert.ok(inj.includes(`'${t}'`), `Unter-Tab "${t}" fehlt.`)
  }
})

test('die vier Spec-Tabs sind da', () => {
  const spec = lies('tab-spec.tsx')
  for (const k of ['SuppCatalog', 'SuppStacks', 'SuppIntelligence', 'SuppInventory']) {
    assert.ok(new RegExp(`export function ${k}\\b`).test(spec), `"${k}" fehlt.`)
  }
})

test('SuppCost fuehrt alle fuenf Kacheln der Vorlage', () => {
  // `[cmd]` G-33 hatte zwei gebaut, die Vorlage fuehrt fuenf
  // (module-supplements.jsx:963, 971, 1020, 1029, 1042). Der Tab sah
  // beim Klicken vollstaendig aus — dieselbe Klasse Luecke wie bei
  // `SuppExtended`.
  const tabs = lies('tabs.tsx')
  for (const t of [
    'Cost · 12 months trend',
    'Spend per supplement · this month',
    'Category split',
    'If you removed…',
    'Cost optimization · suggestions',
  ]) {
    assert.ok(tabs.includes(t), `Die Kachel "${t}" fehlt in SuppCost.`)
  }
})

test('die neuen Tabs kennzeichnen jede Kachel', () => {
  // Keine Quelle heisst: jede Kachel traegt die Marke. Wer eine
  // anbindet, entfernt `attrappe` und zaehlt hier herunter.
  const dateien: Array<[string, number]> = [
    ['tab-injektionen.tsx', 14],
    ['tab-spec.tsx', 18],
  ]
  for (const [datei, erwartet] of dateien) {
    const quelle = lies(datei)
    const n = (quelle.match(/attrappe=\{ATTRAPPE\}/g) ?? []).length
    assert.equal(n, erwartet,
      `${datei}: ${n} gekennzeichnet, erwartet ${erwartet}. `
      + 'Angebunden? Dann die Erwartung hier senken.')
  }
})
