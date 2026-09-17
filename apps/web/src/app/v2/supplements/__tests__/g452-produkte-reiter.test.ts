// G-452 — der Produkte-Reiter.
//
// ══ WAS HIER BEWACHT WIRD ══════════════════════════════════════════
//
// `[read]` **Drei Sachen, die der Auftrag ausdruecklich verlangt** —
// und je eine Probe, die rot wird, wenn sie kippt:
//
//     1  Zeilen OHNE Menge werden gezeigt
//     2  Mischungen stehen eingerueckt unter ihrem Kopf
//     3  was LumeOS nicht kennt, ist erkennbar
//
// **plus die Stelle des Reiters** — links neben `catalog`.
//
// ══ WARUM DIE RECHNUNG UND NICHT DER QUELLTEXT GEPRUEFT WIRD ═══════
//
// `[read]` **`etikettZeilen` wird AUFGERUFEN, nicht gesucht.** `[cmd]`
// **Ein Waechter, der `blend_id` im Text findet, bleibt gruen, wenn
// die Einrueckung verdreht ist** — dieselbe Lehre wie in
// `g428-reiter-und-vorlage.test.ts`.
//
// `[read]` **Die Probedaten sind die GEMESSENEN**, nicht erfundene:
// die Zeilen 12 bis 15 von `21cfe048` (MRI N.O. Black Powder) und die
// Zeilen 13/17 von `7bd745e2` (Dr. Mercola Miracle Whey), beide am
// 2026-09-14 gegen die laufende Instanz gelesen.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

import {
  etikettZeilen, mengeText, bekanntZaehlen, portionText,
} from '../../../../lib/supplements/produkt-etikett'
import type { InhaltsZeile } from '../../../../lib/supplements/produkte-read'

const V2 = path.join(process.cwd(), 'src/app/v2/supplements')
const lies = (f: string) => fs.readFileSync(path.join(V2, f), 'utf8')

function zeile(z: Partial<InhaltsZeile> & { id: string }): InhaltsZeile {
  return {
    ingredient_name: z.id,
    ingredient_category: null,
    amount_per_serving: null,
    unit: null,
    amount_qualifier: 'not_stated',
    blend_id: null,
    reihenfolge: null,
    ist_wirkstoff: true,
    bekannt: false,
    // G-464: die Einstufung aus C-505. `null` = wie vor G-464.
    content_class: null,
    ...z,
  }
}

/**
 * Die gemessene Mischung aus `21cfe048`.
 *
 * `[cmd]` **Zeile 13 traegt 3000 mg und `blend_id = null`**; die
 * Zeilen 14 und 15 tragen `blend_id` = deren `id` und KEINE Menge.
 */
const MISCHUNG: InhaltsZeile[] = [
  zeile({ id: 'protein', ingredient_name: 'Protein', reihenfolge: 12 }),
  zeile({
    id: 'blend-kopf', ingredient_name: 'Proprietary Blend for Size & Recovery',
    amount_per_serving: 3000, unit: 'mg', amount_qualifier: 'exact', reihenfolge: 13,
  }),
  zeile({
    id: 'akg', ingredient_name: 'L-Arginine Alpha-Ketoglutarate',
    blend_id: 'blend-kopf', reihenfolge: 14,
  }),
  zeile({
    id: 'hcl', ingredient_name: 'L-Arginine Hydrochloride',
    blend_id: 'blend-kopf', reihenfolge: 15,
  }),
]

test('G-452/2: eine Mischung traegt die Menge, ihre Zutaten stehen eingerueckt', () => {
  const z = etikettZeilen(MISCHUNG)

  // Die Etikettreihenfolge bleibt die der Packung.
  assert.deepEqual(z.map(x => x.id),
    ['protein', 'blend-kopf', 'akg', 'hcl'])

  const kopf = z.find(x => x.id === 'blend-kopf')!
  assert.equal(kopf.istMischung, true, 'Der Kopf ist nicht als Mischung erkannt.')
  assert.equal(kopf.eingerueckt, false, 'Der Kopf steht faelschlich eingerueckt.')
  assert.equal(mengeText(kopf), '3000 mg', 'Die Gesamtmenge fehlt am Kopf.')

  for (const id of ['akg', 'hcl']) {
    const k = z.find(x => x.id === id)!
    assert.equal(k.eingerueckt, true, `${id} steht nicht eingerueckt.`)
    assert.equal(k.istMischung, false, `${id} gilt faelschlich als Mischung.`)
    // `[read]` **Die Zutat einer Mischung hat KEINE Einzelmenge** —
    // das ist die Aussage der Packung, nicht eine Luecke.
    assert.equal(mengeText(k), null, `${id} zeigt eine Menge, die es nicht gibt.`)
  }

  // `[read]` **Eine Zeile ausserhalb der Mischung bleibt unberuehrt.**
  assert.equal(z.find(x => x.id === 'protein')!.eingerueckt, false)
})

test('G-452/1: eine Zeile ohne Menge verschwindet nicht und bekommt keine Null', () => {
  // `[cmd]` **Die gemessenen Zeilen 13 und 17 von Dr. Mercola** —
  // `Vitamin A` und `Whey Protein concentrate`, beide `not_stated`.
  const roh: InhaltsZeile[] = [
    zeile({
      id: 'protein', ingredient_name: 'Protein', amount_per_serving: 32,
      unit: 'g', amount_qualifier: 'exact', reihenfolge: 12, bekannt: false,
    }),
    zeile({ id: 'vit-a', ingredient_name: 'Vitamin A', reihenfolge: 13, bekannt: true }),
    zeile({
      id: 'whey', ingredient_name: 'Whey Protein concentrate',
      reihenfolge: 17, ist_wirkstoff: false,
    }),
  ]
  const z = etikettZeilen(roh)

  // **Alle drei stehen da** — die ohne Menge werden nicht gefiltert.
  assert.equal(z.length, 3, 'Eine Zeile ohne Menge ist verlorengegangen.')
  assert.ok(z.some(x => x.ingredient_name === 'Vitamin A'))
  assert.ok(z.some(x => x.ingredient_name === 'Whey Protein concentrate'))

  // `[read]` **`null` heisst „die Anzeige setzt den Hinweis"** — nicht
  // `'0'` und nicht `'—'`, beides saehe aus wie eine Angabe.
  assert.equal(mengeText(z.find(x => x.id === 'vit-a')!), null)
  assert.equal(mengeText(z.find(x => x.id === 'whey')!), null)
  assert.equal(mengeText(z.find(x => x.id === 'protein')!), '32 g')
})

test('G-452: die geschweiften Klammern der DSLD-Einheit kommen nicht auf den Schirm', () => {
  // `[cmd]` **Gemessen: `Calories` traegt die Einheit `{Calories}`.**
  const z = zeile({
    id: 'kcal', ingredient_name: 'Calories', amount_per_serving: 160,
    unit: '{Calories}', amount_qualifier: 'exact', reihenfolge: 1,
  })
  assert.equal(mengeText(z), '160 Calories')
})

test('G-452: die Vergleichszeichen der Menge stehen davor', () => {
  // `[cmd]` **`less_than` 14.598, `greater_than` 737** — gemessen
  // 2026-09-14 ueber 3.000.982 Zeilen. `[read]` **Ohne das Zeichen
  // waere `< 1 g` als `1 g` gelesen: eine Obergrenze als Messwert.**
  assert.equal(mengeText(zeile({
    id: 'a', amount_per_serving: 1, unit: 'g', amount_qualifier: 'less_than',
  })), '< 1 g')
  assert.equal(mengeText(zeile({
    id: 'b', amount_per_serving: 1, unit: 'g', amount_qualifier: 'greater_than',
  })), '> 1 g')
})

test('G-452/3: was LumeOS kennt, wird gezaehlt — zwei Zahlen, keine Quote', () => {
  const roh = [
    zeile({ id: 'a', bekannt: true }),
    zeile({ id: 'b', bekannt: false }),
    zeile({ id: 'c', bekannt: false }),
  ]
  assert.deepEqual(bekanntZaehlen(roh), { bekannt: 1, gesamt: 3 })
  // `[read]` **Auch der Fall „gar nichts bekannt" hat eine Zahl** —
  // `[cmd]` bei 89,9 % aller Zeilen ohne `supplement_id` ist er der
  // haeufige, und eine leere Anzeige waere dort die Regel.
  assert.deepEqual(bekanntZaehlen([zeile({ id: 'x' })]), { bekannt: 0, gesamt: 1 })
})

test('G-452: Zeilen ohne Reihenfolge haengen hinten an, statt eine zu erfinden', () => {
  const z = etikettZeilen([
    zeile({ id: 'ohne' }),
    zeile({ id: 'zwei', reihenfolge: 2 }),
    zeile({ id: 'eins', reihenfolge: 1 }),
  ])
  assert.deepEqual(z.map(x => x.id), ['eins', 'zwei', 'ohne'])
})

test('G-452: die Portion behaelt die Klammerangabe des Herstellers', () => {
  // `[cmd]` **Gemessen bei Dr. Mercola: `40` + `Gram(s) [2 scoops]`.**
  assert.equal(portionText(40, 'Gram(s) [2 scoops]'), '40 Gram(s) [2 scoops]')
  assert.equal(portionText(null, null), null)
  // `[read]` **Eine Groesse ohne Einheit bleibt die Groesse** — keine
  // geratene Einheit.
  assert.equal(portionText(1, null), '1')
})

/** Die Reiter — aus `ansicht.tsx` gelesen, nicht abgeschrieben. */
function reiterAusDerLeiste(): string[] {
  const muster = /\{ id: '([a-z]+)', label: t\(/g
  const ids: string[] = []
  let m: RegExpExecArray | null
  const ansicht = lies('ansicht.tsx')
  while ((m = muster.exec(ansicht)) !== null) ids.push(m[1])
  return ids
}

test('A1: der Produkte-Reiter steht LINKS NEBEN catalog', () => {
  const ids = reiterAusDerLeiste()
  const p = ids.indexOf('produkte')
  const c = ids.indexOf('catalog')
  assert.ok(p >= 0, 'Der Reiter "produkte" fehlt in der Leiste.')
  assert.ok(c >= 0, 'Der Reiter "catalog" fehlt in der Leiste.')
  // `[read]` **`p === c - 1`, nicht `p < c`** — *„links neben"* ist
  // eine Nachbarschaft, keine Rangfolge. `[cmd]` **Mit `<` bliebe der
  // Waechter gruen, wenn jemand den Reiter an den Anfang schoebe.**
  assert.equal(p, c - 1,
    `produkte steht auf ${p}, catalog auf ${c} — erwartet: direkt davor.`)
})

test('A8: die zehn anderen Reiter stehen unveraendert in ihrer Reihenfolge', () => {
  const ids = reiterAusDerLeiste()
  // `[read]` **Die Liste OHNE den neuen muss die alte sein** — so
  // faellt die Probe, wenn der Einbau einen anderen verschoben hat.
  assert.deepEqual(ids.filter(x => x !== 'produkte'), [
    'today', 'stack', 'extended', 'catalog', 'stacks', 'intel',
    'inventory', 'injection', 'compliance', 'interactions', 'cost',
  ])
})

test('A2: der Reiter oeffnet auf On Market, und die Zahl ist die gemessene', () => {
  const quelle = lies('tab-produkte.tsx')
  // `[read]` **Der Standard wird als Konstante gesetzt und als
  // Anfangszustand benutzt** — beides wird geprueft, weil eine
  // Konstante ohne Verwender nichts entscheidet.
  // ══ G-467: DER WERT LIEGT JETZT IN DER LAGEDATEI ═══════════════
  //
  // `[cmd]` **Hier stand `/const STANDARD_STATUS = 'On Market'/`** —
  // und die Probe wurde rot, als G-467 den Wert nach
  // `produkt-filter-lage.ts` zog. **Der gespeicherte Filter und der
  // Reiter muessen sich ueber DENSELBEN Wert einig sein.**
  //
  // `[read]` **Die Sache ist unveraendert:** der Reiter oeffnet auf
  // *On Market*. `[read]` **Die Probe hat die ZEILE bewacht, nicht
  // den WERT** — jetzt wird der Wert gelesen, wo er steht.
  const lage = fs.readFileSync(
    path.join(process.cwd(), 'src/lib/supplements/produkt-filter-lage.ts'),
    'utf8')
  assert.match(lage, /export const STANDARD_STATUS = 'On Market'/,
    'Der Standard-Marktstatus ist nicht mehr On Market.')
  assert.match(quelle, /const STANDARD_STATUS = FILTER_STANDARD_STATUS/,
    'Der Reiter hat wieder einen eigenen Wert — dann driftet er '
    + 'gegen den gespeicherten Filter.')
  assert.match(quelle, /React\.useState<string \| null>\(STANDARD_STATUS\)/,
    'Der Anfangszustand des Marktfilters ist nicht STANDARD_STATUS.')
  // `[cmd]` **Die drei gemessenen Zahlen** (2026-09-14).
  assert.ok(quelle.includes('121.959'), 'Die On-Market-Zahl fehlt.')
  assert.ok(quelle.includes('92.821'), 'Die Off-Market-Zahl fehlt.')
  assert.ok(quelle.includes('214.780'), 'Die Gesamtzahl fehlt.')
})

test('G-452: die Suche wird nicht nachgebaut — C-495 wird gerufen', () => {
  const read = fs.readFileSync(
    path.join(process.cwd(), 'src/lib/supplements/produkte-read.ts'), 'utf8')
  // `[read]` **Die drei Namen aus C-495 stehen als Aufruf da.**
  assert.match(read, /rpc\('search_supplier_products'/)
  assert.match(read, /rpc\('supplier_product_detail'/)
  assert.match(read, /from\('supplier_product_brands'\)/)
  // `[cmd]` **Und KEINE eigene Aehnlichkeitsrechnung** — der Auftrag
  // verbietet sie ausdruecklich. `[read]` Der Rueckfall darf `ilike`,
  // mehr nicht; `similarity`/`levenshtein`/`trgm` im Code hiesse, dass
  // hier eine zweite Suche entstanden ist.
  assert.doesNotMatch(read, /levenshtein|soundex|metaphone/i,
    'Hier ist eine eigene Fehlertoleranz entstanden — C-495 liefert sie.')
})
