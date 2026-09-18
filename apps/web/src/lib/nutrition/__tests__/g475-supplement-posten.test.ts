// G-475 — Supplemente in der Mahlzeit.
//
// **Tom, 2026-09-18:** *„wann kommt eigentlich das todo, dass ich in
// nutrition diary auch supplements wie whey hinzufuegen kann?"*
//
// ══ WAS DIE DATENBANK VERLANGT ══════════════════════════════════════
//
// `[cmd]` **Gemessen 2026-09-18 an `nutrition.meal_items`:**
//
//     amount_g            MUSS NULL sein bei 'supplement'
//     serving_quantity    NOT NULL und > 0
//     nutrient_status     'available' | 'no_nutrients_available'
//     portion_*           alle drei NULL
//
// `[cmd]` **Und der Trigger PRUEFT den Schnappschuss, er fuellt ihn
// nicht** — ein erster Versuch schickte nur Produkt, Portion und
// Anzahl und fiel sofort:
//
//     C513: supplement nutrient snapshot differs from its evidenced
//           product serving
//
// `[cmd]` **Mit vollem Schnappschuss angenommen:** Portion
// `31 Gram(s)`, Anzahl 1 -> **120 kcal, 24 g Protein** — genau die
// Zahlen von Toms Etikett.
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

import {
  DOPPELT_MINUTEN, OHNE_NAEHRWERTE_SATZ,
  doppeltSatz, fragtNach, hatNaehrwerte, portionsLabel,
  pruefePosten, standFuer, vorschau,
  type SupplementPosten,
} from '../supplement-posten-lage'

const WEB = process.cwd()
const lies = (p: string) => fs.readFileSync(path.join(WEB, 'src', p), 'utf8')

function ohneKommentare(q: string): string {
  return q.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
}

const POSTEN: SupplementPosten = {
  meal_id: '11111111-1111-1111-1111-111111111111',
  product_id: '13b746bd-1c65-41d1-a346-275e49fe8e27',
  serving_size: '31 Gram(s)',
  serving_quantity: 1,
  nutrient_status: 'available',
  food_name: 'ON Gold Standard Whey',
}

// ══ 1 — die CHECKs sind eine Zusage ═════════════════════════════════

test('A1: ein Posten ohne Portion faellt, wenn Naehrwerte da sind', () => {
  // `[cmd]` **Der Trigger wirft** *„requires an evidenced serving
  // size"*. `[read]` **Der Nutzer soll einen Satz sehen, keine
  // Postgres-Meldung.**
  assert.equal(pruefePosten(POSTEN), null)
  assert.match(
    pruefePosten({ ...POSTEN, serving_size: null }) ?? '',
    /Portionsgröße/)
})

test('A2: die Anzahl muss groesser als 0 sein', () => {
  // `[cmd]` **`meal_items_supplement_snapshot_check`:**
  // `supplement_serving_quantity > 0`.
  for (const q of [0, -1, Number.NaN]) {
    assert.match(
      pruefePosten({ ...POSTEN, serving_quantity: q }) ?? '',
      /größer als 0/, `Anzahl ${q} wird angenommen.`)
  }
  assert.equal(pruefePosten({ ...POSTEN, serving_quantity: 0.5 }), null)
})

test('A3: ein Produkt OHNE Naehrwerte darf keine Portion tragen', () => {
  // `[cmd]` **Der Trigger:** *„product without measured nutrients
  // must remain visibly unknown"* — **kein `serving_size`, kein
  // Naehrwert.**
  const ohne: SupplementPosten = {
    ...POSTEN, serving_size: null, nutrient_status: 'no_nutrients_available',
  }
  assert.equal(pruefePosten(ohne), null)
  assert.match(
    pruefePosten({ ...ohne, serving_size: '31 Gram(s)' }) ?? '',
    /keine hinterlegte Portionsgröße/)
})

// ══ 2 — A5: was bei einem Produkt ohne Naehrwerte dasteht ═══════════

test('A4: ohne Portionen ist der Stand „no_nutrients_available"', () => {
  assert.equal(hatNaehrwerte({ portionen: [] }), false)
  assert.equal(standFuer({ portionen: [] }), 'no_nutrients_available')
  assert.equal(
    standFuer({ portionen: [{ serving_size: '1 Scoop', enercc: 120, prot625: 24, fat: 1, cho: 3 }] }),
    'available')
})

test('A5: der Satz sagt, was fehlt — und was trotzdem passiert', () => {
  // `[read]` **Kein „0 kcal"** — das waere eine Behauptung. **Kein
  // Strich** — der saehe aus wie ein fehlender Wert.
  assert.match(OHNE_NAEHRWERTE_SATZ, /keine Nährwerte/)
  assert.match(OHNE_NAEHRWERTE_SATZ, /erfasst/,
    'Der Satz sagt nicht, dass der Posten trotzdem entsteht.')
  assert.doesNotMatch(OHNE_NAEHRWERTE_SATZ, /\b0\s*kcal\b/,
    'Der Satz behauptet 0 kcal — das ist eine Zahl, keine Auskunft.')
})

// ══ 3 — A4 des Auftrags: mehrere Portionsgroessen ═══════════════════

test('A6: die Portionszeile traegt die Zahlen, die die Wahl tragen', () => {
  // `[cmd]` **2.760 Produkte haben mehr als eine Portion** (gemessen)
  // — **ohne Zahlen daneben ist die Wahl blind.**
  const t = portionsLabel({
    serving_size: '31 Gram(s)', enercc: 120, prot625: 24, fat: 1, cho: 3,
  })
  assert.match(t, /31 Gram\(s\)/)
  assert.match(t, /120 kcal/)
  assert.match(t, /24 g Protein/)

  // `[read]` **Ohne Naehrwerte bleibt die Groesse allein stehen** —
  // keine erfundene Null.
  assert.equal(
    portionsLabel({ serving_size: '1 Scoop', enercc: null, prot625: null, fat: null, cho: null }),
    '1 Scoop')
})

test('A7: die Vorschau rechnet mal Anzahl — und nur zur Anzeige', () => {
  const w = { serving_size: '31 Gram(s)', enercc: 120, prot625: 24, fat: 1, cho: 3 }
  assert.deepEqual(vorschau(w, 1), { enercc: 120, prot625: 24 })
  assert.deepEqual(vorschau(w, 2), { enercc: 240, prot625: 48 })
  // `[read]` **Halbe Portionen sind erlaubt** — der CHECK verlangt
  // nur `> 0`.
  assert.deepEqual(vorschau(w, 0.5), { enercc: 60, prot625: 12 })
  // Ohne Wahl keine Zahl — kein Rueckfall auf 0.
  assert.deepEqual(vorschau(null, 1), { enercc: null, prot625: null })
})

// ══ 4 — A6 des Auftrags: die Nachfrage ══════════════════════════════

test('A8: dieselbe Einnahme innerhalb 60 Minuten loest die Frage aus', () => {
  const einnahmen = [
    { product_id: 'whey', minutenHer: 12 },
    { product_id: 'mag', minutenHer: 5 },
  ]
  const a = fragtNach(einnahmen, 'whey')
  assert.equal(a.frage, true)
  assert.equal(a.frage === true ? a.minutenHer : null, 12)

  // `[read]` **Aelter als das Fenster ist eine ZWEITE Einnahme**, kein
  // Doppeleintrag.
  assert.equal(
    fragtNach([{ product_id: 'whey', minutenHer: DOPPELT_MINUTEN + 1 }], 'whey').frage,
    false)
  // Ein anderes Mittel geht niemanden etwas an.
  assert.equal(fragtNach(einnahmen, 'kreatin').frage, false)
})

test('A9: die Frage ist eine FRAGE, keine Fehlermeldung', () => {
  // `[read]` **Wer sein Whey abhakt und dann ins Tagebuch schreibt,
  // hat es vielleicht wirklich zweimal genommen.** **Die Oberflaeche
  // entscheidet das nicht.**
  const t = doppeltSatz('ON Gold Standard Whey', 12)
  assert.match(t, /12 Minuten/)
  assert.match(t, /\?$/, 'Der Satz ist keine Frage.')
  assert.match(t, /behalten/i)
  // Einzahl bei einer Minute.
  assert.match(doppeltSatz('X', 1), /1 Minute\b/)
})

// ══ 5 — der Schreibweg haelt sich an die CHECKs ═════════════════════

test('A10: der Schreibweg setzt amount_g auf NULL', () => {
  // `[cmd]` **`meal_items_amount_g_check`:** bei `'supplement'` MUSS
  // `amount_g` NULL sein. `[read]` **Gramm sind die falsche Einheit**
  // — ein Scoop ist keine Menge in Gramm, sondern eine Portion.
  const q = ohneKommentare(lies('lib/nutrition/supplement-posten-read.ts'))
  // `[cmd]` **Der Wortanfang MUSS mit** — `/amount_g:\s*null/` traf
  // auch `portion_amount_g: null` in derselben Datei, und eine
  // Sabotage auf `amount_g: 1` blieb gruen (gemessen 2026-09-18).
  assert.match(q, /(?<![A-Za-z_])amount_g:\s*null/,
    'Der Schreibweg setzt `amount_g` nicht auf NULL — der CHECK '
    + 'weist die Zeile ab.')
  assert.match(q, /portion_name:\s*null/,
    'Die Portionsspalten muessen NULL bleiben (CHECK).')
})

test('A11: der Schnappschuss wird GESCHRIEBEN, nicht dem Trigger ueberlassen', () => {
  // ══ DER GEMESSENE GRUND ══════════════════════════════════════════
  //
  // `[cmd]` **Ein erster Versuch schickte nur Produkt, Portion und
  // Anzahl** — die Datenbank wies ihn ab: *„snapshot differs from
  // its evidenced product serving"*. **Der Trigger ist ein
  // Waechter, kein Rechner.**
  const q = ohneKommentare(lies('lib/nutrition/supplement-posten-read.ts'))
  assert.match(q, /for \(const m of MAKROS\) grund\[m\] = mal\(o\[m\]\)/,
    'Die Makros werden nicht aus der Option uebernommen.')
  assert.match(q, /grund\.nutrients = mikro/,
    'Die Mikronaehrstoffe fehlen — der Trigger vergleicht sie mit.')
  // `[cmd]` **`jsonb_strip_nulls` im Trigger** — `null` im Objekt
  // waere eine Abweichung.
  assert.match(q, /if \(z !== null\) mikro\[schluessel\] = z/,
    'Nullwerte landen im nutrients-Objekt — dann weicht es ab.')
})

test('A12: ohne Naehrwerte bleibt ALLES leer', () => {
  const q = ohneKommentare(lies('lib/nutrition/supplement-posten-read.ts'))
  const zweig = q.slice(q.indexOf("if (p.nutrient_status === 'no_nutrients_available')"))
    .slice(0, 400)
  assert.match(zweig, /supplement_serving_size = null/)
  assert.match(zweig, /grund\[m\] = null/)
  assert.match(zweig, /grund\.nutrients = \{\}/,
    'Ohne Naehrwerte muss `nutrients` ein leeres Objekt sein.')
})

// ══ 6 — die Kontrollprobe ═══════════════════════════════════════════

test('A13: KONTROLLE — das blosse Wort macht keine Probe rot', () => {
  assert.ok(ohneKommentare('// amount_g: null\ncode').indexOf('amount_g') === -1,
    'ohneKommentare entfernt Zeilenkommentare nicht — dann findet '
    + 'die Probe ihre eigene Begruendung.')
})
