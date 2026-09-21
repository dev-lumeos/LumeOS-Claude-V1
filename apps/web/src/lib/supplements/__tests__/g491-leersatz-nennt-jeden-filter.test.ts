// G-491 — die Produkttabelle bleibt im Browser leer.
//
// **Tom, 2026-09-21:** *„Die Daten kommen, der Schirm zeigt sie
// nicht."*
//
// `[cmd]` **Gemessen am 2026-09-21** (`tools/_g491-anteile.mjs`, je
// Filter EINZELN angelegt, API-Treffer je Begriff):
//
//     "Micronized Creatine Monohydrate"
//       200  smart    ohne Filter
//         0  einfach  + kategorie=protein
//        10  einfach  + form=Powder [E0162]
//         2  smart    + marke=Optimum Nutrition
//         0  einfach  ALLE VIER (gespeicherter Stand)
//
// `[cmd]` **Alle 18 Zeilen dieses Namens SIND Powder** (gemessen in
// `supplements.supplier_products`) — **es war die MARKE, die sie
// nahm.** `[read]` **Der Leersatz behauptete die KATEGORIE**, und
// `form` kam ueberhaupt nicht vor.
//
// `[read]` **Ein Vermerk mit falschem Grund ist schlimmer als
// keiner** — er schickt den Leser zum falschen Regler.
import assert from 'node:assert/strict'
import test from 'node:test'

import {
  VORGABE, aktiveFilter, grundFuerLeer, wirkendeFilter,
  type ProduktFilter,
} from '../produkt-filter-lage'

// `[read]` **Genau der Stand, der am 2026-09-21 gespeichert war** —
// gelesen aus `public.user_display_preferences`, Schluessel
// `supplements.produkt_filter`.
const GEMESSEN: ProduktFilter = {
  status: 'On Market',
  kategorie: 'protein',
  form: 'Powder [E0162]',
  marken: ['Optimum Nutrition'],
  allergienAn: true,
  leisteOffen: true,
}

test('G-491/A2: der Satz nennt JEDEN wirkenden Filter', () => {
  const satz = grundFuerLeer('Micronized Creatine Monohydrate',
                             GEMESSEN, 'einfach')
  // `[read]` **Je Filter eine eigene Zusicherung** — eine Frage nach
  // dem Ganzen faellt nicht, wenn ein Teil faellt.
  assert.ok(satz.includes('protein'), `Kategorie fehlt: ${satz}`)
  assert.ok(satz.includes('Powder [E0162]'), `Form fehlt: ${satz}`)
  assert.ok(satz.includes('Optimum Nutrition'), `Marke fehlt: ${satz}`)
  assert.ok(satz.includes('Allergenmeidung'), `Allergien fehlen: ${satz}`)
  assert.ok(satz.includes('Micronized Creatine Monohydrate'),
            `Suchwort fehlt: ${satz}`)
})

test('G-491/A2: die Form allein wird genannt', () => {
  // `[cmd]` **Der Fall, den die alte Fassung GAR NICHT kannte:** nur
  // eine Darreichungsform gesetzt. `[read]` **Sie sagte dann „Keine
  // Treffer" und verschwieg den Filter vollstaendig.**
  const nurForm: ProduktFilter = { ...VORGABE, form: 'Capsule [E0159]' }
  const satz = grundFuerLeer('Whey', nurForm, 'einfach')
  assert.ok(satz.includes('Capsule [E0159]'), `Form fehlt: ${satz}`)
})

test('G-491/A2: die Marke allein wird genannt', () => {
  const nurMarke: ProduktFilter = { ...VORGABE, marken: ['Optimum Nutrition'] }
  const satz = grundFuerLeer('Creatine', nurMarke, 'einfach')
  assert.ok(satz.includes('Optimum Nutrition'), `Marke fehlt: ${satz}`)
  // `[read]` **Und sie darf keine Kategorie erfinden** — genau das
  // tat die alte Fassung.
  assert.ok(!satz.includes('Kategorie'),
            `erfindet eine Kategorie: ${satz}`)
})

test('G-491: mehrere Marken werden gezaehlt, nicht aufgezaehlt', () => {
  const drei: ProduktFilter = {
    ...VORGABE, marken: ['A', 'B', 'C'], allergienAn: false,
  }
  const satz = grundFuerLeer('Whey', drei, 'einfach')
  assert.ok(satz.includes('3 gewählte Marken'), satz)
})

test('G-491: ohne Filter nennt der Satz keinen', () => {
  // `[read]` **Die Allergenmeidung steht in der VORGABE auf `true`**
  // — sie wirkt also, und gehoert deshalb in den Satz. `[cmd]` **Der
  // Fall ohne jeden wirkenden Filter braucht sie auf `false`.**
  const leer: ProduktFilter = { ...VORGABE, allergienAn: false }
  assert.deepEqual(wirkendeFilter(leer), [])
  assert.equal(grundFuerLeer('Whey', leer, 'smart'), 'Keine Treffer für „Whey“.')
})

test('G-491: der Vorgabestatus steht NICHT im Satz', () => {
  // `[read]` **`On Market` ist die Vorgabe** — stuende sie im Satz,
  // saehe jeder Leersatz nach einem gesetzten Filter aus. `[cmd]`
  // **Dieselbe Regel wie in `aktiveFilter`.**
  const leer: ProduktFilter = { ...VORGABE, allergienAn: false }
  assert.ok(!grundFuerLeer('Whey', leer, 'smart').includes('On Market'))
  // `[cmd]` **Abseits der Vorgabe zaehlt er dagegen** — in beiden.
  const alle: ProduktFilter = { ...leer, status: null }
  assert.ok(grundFuerLeer('Whey', alle, 'smart').includes('Status'))
  assert.equal(aktiveFilter(alle), 2)
})

test('G-491/A2: der gefallene Suchweg steht im Satz', () => {
  // `[cmd]` **Gemessen: `weg` kippt von `smart` auf `einfach`, sobald
  // EIN Filter gesetzt ist.** `[cmd]` *„Ultraplex Vitamin D3"* findet
  // ohne Filter 200 Zeilen, mit jedem einzelnen 0 — **die Smartsuche
  // (C-495) faellt weg, `ILIKE` bleibt.**
  //
  // `[read]` **Ohne diesen Satz sieht es aus, als gaebe es das
  // Produkt nicht.**
  const mitFilter = grundFuerLeer('Ultraplex Vitamin D3', GEMESSEN, 'einfach')
  assert.ok(mitFilter.includes('genauen Text'), mitFilter)
  assert.ok(mitFilter.includes('Smartsuche'), mitFilter)
  // `[cmd]` **Laeuft die Smartsuche, darf der Satz sie nicht
  // beschuldigen.**
  const ohne = grundFuerLeer('Ultraplex Vitamin D3', GEMESSEN, 'smart')
  assert.ok(!ohne.includes('Smartsuche'), ohne)
})

test('G-491: ein Abfragefehler schlaegt alles', () => {
  const satz = grundFuerLeer('Whey', GEMESSEN, 'einfach', 'timeout')
  assert.ok(satz.includes('timeout'), satz)
  assert.ok(!satz.includes('Kategorie'), satz)
})

test('G-491: ohne Suchwort nennt der Satz nur die Filter', () => {
  const satz = grundFuerLeer('   ', GEMESSEN, 'einfach')
  assert.ok(satz.startsWith('Kein Produkt passt zu '), satz)
  assert.ok(satz.includes('Powder [E0162]'), satz)
})
