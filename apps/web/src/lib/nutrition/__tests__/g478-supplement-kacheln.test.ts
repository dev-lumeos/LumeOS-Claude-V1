// G-478 — die Kacheln fuer Supplemente in der Mahlzeit.
//
// `[read]` **Gemessen wird die SACHE, nicht das Wort**: dass ein
// Supplement-Posten den Leser ueberlebt, und dass die Liste ihn an
// `food_source` erkennt — nicht, dass irgendwo „supplement" steht.
//
// `[cmd]` **Der tragende Fall:** `meal_items_amount_g_check` verlangt
// `amount_g IS NULL` fuer Supplemente. `[read]` **Der Leser warf bis
// G-478 jede Zeile ohne `amount_g` weg** — ohne Fehler, ohne Meldung.
// Jede Supplement-Zeile waere unsichtbar geblieben, obwohl sie in der
// Datenbank steht.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

import { parseStoredMealItems } from '../diary-model'

const HIER = path.resolve(__dirname, '..', '..', '..')
const lies = (p: string) => readFileSync(path.join(HIER, p), 'utf8')

const MEAL_ID = '22222222-2222-2222-2222-222222222222'
const ITEM_ID = '33333333-3333-3333-3333-333333333333'
const PRODUKT = '44444444-4444-4444-4444-444444444444'

// Die Zeile, wie die Datenbank sie nach G-475 wirklich traegt —
// `amount_g` NULL, dafuer Portion, Anzahl und Stand.
const SUPPLEMENT_ZEILE = {
  id: ITEM_ID,
  meal_id: MEAL_ID,
  food_id: null,
  food_name: 'Gold Standard 100% Whey Vanilla Ice Cream',
  food_source: 'supplement',
  amount_g: null,
  supplement_product_id: PRODUKT,
  supplement_serving_size: '31 Gram(s)',
  supplement_serving_quantity: 1,
  supplement_nutrient_status: 'available',
  enercc: 120,
  prot625: 24,
}

test('G-478/A1: eine Supplement-Zeile ohne amount_g ueberlebt den Leser', () => {
  const gelesen = parseStoredMealItems([SUPPLEMENT_ZEILE])
  assert.equal(gelesen.length, 1,
    'die Zeile wurde verworfen — `amount_g === null` darf ein Supplement nicht ausschliessen')
  assert.equal(gelesen[0].amount_g, null)
  assert.equal(gelesen[0].food_source, 'supplement')
})

test('G-478/A1: Portion, Anzahl und Stand kommen mit', () => {
  const [p] = parseStoredMealItems([SUPPLEMENT_ZEILE])
  assert.equal(p.supplement_serving_size, '31 Gram(s)')
  assert.equal(p.supplement_serving_quantity, 1)
  assert.equal(p.supplement_nutrient_status, 'available')
})

test('G-478: ein Lebensmittel OHNE amount_g faellt weiter weg', () => {
  // `[read]` **Die Gegenprobe zur Lockerung** — sonst haette man den
  // Filter einfach abgeschaltet statt ihn zu verzweigen.
  const ohne = parseStoredMealItems([
    { ...SUPPLEMENT_ZEILE, food_source: 'bls', supplement_product_id: null },
  ])
  assert.equal(ohne.length, 0,
    'ohne `amount_g` und ohne `food_source=supplement` darf nichts durchkommen')
})

test('G-478/A2: die Liste verzweigt an food_source, nicht am Namen', () => {
  const q = lies(path.join('app', 'v2', 'nutrition', 'mahlzeiten.tsx'))
  assert.match(q, /food_source\s*===\s*'supplement'/,
    'die Zeile muss an `food_source` entscheiden — ein Namensvergleich altert')
  assert.match(q, /supplement_serving_quantity/,
    'die Menge eines Supplements ist die Anzahl, nicht das Gewicht')
})

test('G-478/A2: der Anteil wird aus den Posten gezogen, nicht geschaetzt', () => {
  // `[cmd]` **`daily_summary` zaehlt Supplemente bereits mit** — die
  // Zeile korrigiert nichts, sie zerlegt. `[read]` **Deshalb muss sie
  // auf `food_source` filtern**: eine zweite, unabhaengig gerechnete
  // Summe koennte von der ersten abweichen und niemand saehe es.
  const q = lies(path.join('app', 'v2', 'nutrition', 'mahlzeiten.tsx'))
  const i = q.indexOf('const supp = items.reduce')
  assert.notEqual(i, -1, 'die Zerlegung fehlt')
  const block = q.slice(i, i + 420)
  assert.match(block, /food_source\s*!==\s*'supplement'/,
    'der Anteil filtert nicht auf food_source')
  assert.match(block, /enercc/, 'der Anteil zaehlt keine Kalorien')
  assert.match(q, /data-probe="kopf-supplement-anteil"/,
    'die Zeile ist am Schirm nicht auffindbar')
  // `[read]` **„davon" sagt, dass es ENTHALTEN ist** — ohne das Wort
  // liest sich die Zahl wie ein Zuschlag.
  const zeile = q.slice(q.indexOf('kopf-supplement-anteil'), q.indexOf('kopf-supplement-anteil') + 400)
  assert.match(zeile, /davon/,
    'ohne „davon" liest sich der Anteil wie ein Zuschlag zur Summe')
})

test('G-478/A5: der Satz ohne Naehrwerte hat genau eine Quelle', () => {
  const lage = lies(path.join('lib', 'nutrition', 'supplement-posten-lage.ts'))
  assert.match(lage, /OHNE_NAEHRWERTE_SATZ/)
  // `[cmd]` **G-480: die Datei heisst jetzt anders.**
  // `supplement-modal.tsx` ist entfernt — der Weg fuehrt ueber die
  // EINE Suche (`module-nutrition.jsx:557`). `[read]` **Die
  // Zusicherung selbst bleibt unveraendert**: der Satz wird
  // IMPORTIERT, nicht abgeschrieben.
  const modal = lies(path.join('app', 'v2', 'nutrition', 'food-such-modal.tsx'))
  assert.match(modal, /OHNE_NAEHRWERTE_SATZ/,
    'das Modal muss den Satz IMPORTIEREN — abgeschrieben altern zwei Fassungen auseinander')
  assert.doesNotMatch(modal, /keine N[äa]hrwerte hinterlegt/,
    'der Satz steht im Modal noch einmal woertlich')
})

test('G-478: die Route nimmt die Naehrwerte NICHT aus der Anfrage', () => {
  // `[read]` **Der Trigger prueft den Schnappschuss gegen das belegte
  // Produkt** (C513). `[cmd]` **Wer die Werte aus der Anfrage uebernimmt,
  // laesst den Aufrufer bestimmen, was gegessen wurde.**
  const route = lies(path.join('app', 'api', 'nutrition', 'diary', 'route.ts'))
  const zweig = route.slice(route.indexOf("art === 'supplement'"))
  assert.ok(zweig.length > 0, "der Zweig `art === 'supplement'` fehlt")
  const kopf = zweig.slice(0, 1600)
  assert.doesNotMatch(kopf, /\benercc\b|\bprot625\b|nutrients\s*:/,
    'die Route reicht Naehrwerte aus der Anfrage durch')
  assert.match(kopf, /legeSupplementPostenAn/,
    'die Route muss den geprueften Schreibweg rufen')
})

test('G-478/A6: das Modal ueberschreibt die blassen Erbklassen', () => {
  // `[cmd]` **Gemessen: `.v2-dim` und `.v2-eyebrow` kommen auf 2,88:1**
  // und fallen unter WCAG AA. `[read]` **Sie liegen in `packages/ui`
  // und werden 1.565 mal benutzt** — die Korrektur gehoert auf die
  // eigene Flaeche.
  const css = lies(path.join('app', 'globals.css'))
  const stelle = css.indexOf("[data-probe='supplement-add'] .v2-dim")
  assert.notEqual(stelle, -1, 'die Ueberschreibung fehlt')
  const block = css.slice(stelle, stelle + 260)
  assert.match(block, /\.v2-eyebrow/, 'nur eine der beiden Klassen ist gefasst')
  assert.match(block, /--fg-muted/,
    '--fg-dim misst 2,88:1 — die Ueberschreibung muss auf --fg-muted zeigen')
})
