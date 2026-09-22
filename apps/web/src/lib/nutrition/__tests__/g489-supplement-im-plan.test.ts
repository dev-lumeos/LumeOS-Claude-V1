// G-489 — die Ghost-UI kennt keine Supplemente.
//
// **Tom, seit zwei Tagen offen:** *„meal plans sollte das ebenfalls
// moeglich sein, supplements mit einzubinden"*
//
// `[cmd]` **Gemessen 2026-09-22, VOR dem Auftrag:**
//
//     meal_plan_entries               648 bls, 108 recipe, 0 supplement
//     meal_plan_product_references    0 Zeilen
//
// `[read]` **Es fehlte nicht nur das Bestaetigen** — es gab keinen
// Weg hinein.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

import {
  EINTRAG_TYPEN, bauEintrag, feldFuer, verletztCheck,
} from '../plan-eintrag-lage'

const SRC = path.resolve(__dirname, '..', '..', '..')
const lies = (p: string) => readFileSync(path.join(SRC, p), 'utf8')
const ohneKommentare = (q: string) => q
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^\s*\/\/.*$/gm, '')

const GHOST = 'app/v2/nutrition/ghost-eintrag.tsx'
const LOGWRITE = 'lib/nutrition/plan-log-write.ts'
const LESEN = 'lib/nutrition/plan-lesen.ts'
const STACK = 'lib/supplements/stack-write.ts'

test('G-489/A1: `supplement` ist eine Eintragsart', () => {
  // `[cmd]` **Der CHECK kennt sie seit C-524:**
  // `entry_type = ANY (ARRAY['recipe','bls','custom','supplement'])`.
  assert.ok((EINTRAG_TYPEN as readonly string[]).includes('supplement'),
    'Ein Supplement kann gar nicht in einen Plan.')
})

test('G-489/A1: ein Supplementeintrag traegt KEINE Quelle-Id', () => {
  // `[cmd]` **Der Zielcheck verlangt genau das:**
  // `recipe_id IS NULL AND food_id IS NULL AND custom_food_id IS NULL
  //  AND amount_g IS NULL AND planned_servings IS NULL`.
  //
  // `[read]` **Alle anderen Arten tragen GENAU EINE** — deshalb
  // meldete `verletztCheck` vorher *„gesetzt sind 0"*.
  const f = bauEintrag({
    typ: 'supplement', quelleId: 'egal', mahlzeit: 'pre_workout', menge: 1,
  })
  assert.equal(f.recipe_id, null)
  assert.equal(f.food_id, null)
  assert.equal(f.custom_food_id, null)
  assert.equal(f.amount_g, null)
  assert.equal(f.planned_servings, null)
  assert.equal(verletztCheck(f), null,
    'Der Bausatz eines Supplementeintrags verletzt den CHECK.')
})

test('G-489: ein Supplementeintrag hat kein Mengenfeld', () => {
  // `[read]` **Die Menge steht in der Referenz** (`serving_size`,
  // `serving_quantity`), nicht im Planeintrag.
  assert.equal(feldFuer('supplement'), 'keines')
  assert.equal(feldFuer('recipe'), 'planned_servings')
  assert.equal(feldFuer('bls'), 'amount_g')
})

test('G-489: ein Supplementeintrag MIT Quelle-Id faellt durch', () => {
  // `[read]` **Die Probe muss in BEIDE Richtungen wirken** — sonst
  // liesse sie eine Mischung durch, die die Datenbank ablehnt.
  const kaputt = {
    entry_type: 'supplement' as const, meal_type: 'pre_workout' as const,
    recipe_id: null, food_id: 'f1', custom_food_id: null,
    planned_servings: null, amount_g: null, note: null,
  }
  assert.ok(verletztCheck(kaputt) !== null,
    'Ein Supplementeintrag mit food_id wird durchgelassen.')
})

test('G-489/A3: das Bestaetigen ruft die C-519-Funktion', () => {
  const q = ohneKommentare(lies(STACK))
  // **Codex, C-524:** *„die Referenz LESEN und nach dem Anlegen der
  // Mahlzeit `record_supplier_product_intake(…, meal_id)` aufrufen."*
  assert.match(q, /record_supplier_product_intake/,
    'Der Einloeseweg ruft C-519 nicht.')
  assert.match(q, /p_meal_id: eingabe\.meal_id/,
    'Die Einnahme haengt an keiner Mahlzeit.')
  // `[cmd]` **`RETURNS uuid`** — `data` IST die Id (G-484: `data.id`
  // war `undefined`, und der Code meldete einen Fehler ueber einen
  // Erfolg).
  assert.match(q, /typeof data === 'string'/,
    'Die RPC-Rueckgabe wird als Objekt gelesen — `RETURNS uuid` liefert den Wert selbst.')
})

test('G-489/A3: der Supplementweg steht VOR der Postenpruefung', () => {
  const q = ohneKommentare(lies(LOGWRITE))
  const zweig = q.indexOf("eintrag.entryType === 'supplement'")
  const pruefung = q.indexOf('eintrag.posten.length === 0')
  assert.ok(zweig > 0, 'Es gibt keinen Supplementzweig.')
  assert.ok(pruefung > 0, 'Die Postenpruefung fehlt.')
  // `[read]` **Sonst meldete der Weg *„keine Lebensmittel
  // hinterlegt"*** — ein Vermerk mit falschem Grund (G-491).
  assert.ok(zweig < pruefung,
    'Die Postenpruefung faengt den Supplementeintrag ab.')
})

test('G-489: die Referenz wird ueber die EINE Datei gelesen', () => {
  // `[cmd]` **G-138: genau eine Datei darf `supplements`-Tabellen
  // anfassen.** `[read]` **Der Waechter prueft die DATEI, nicht die
  // Zeile** — verschoben, nicht gelockert (G-475, G-485).
  const q = ohneKommentare(lies(STACK))
  assert.match(q, /from\('meal_plan_product_references'\)/,
    '`stack-write.ts` liest die C-524-Referenz nicht.')
  for (const datei of [LESEN, LOGWRITE]) {
    const f = ohneKommentare(lies(datei))
    assert.doesNotMatch(f, /from\('meal_plan_product_references'\)/,
      `${datei}: greift selbst auf eine \`supplements\`-Tabelle zu.`)
    assert.match(f, /planProduktverweise/,
      `${datei}: benutzt den geteilten Leseweg nicht.`)
  }
})

test('G-489/A4: der Knopf bleibt fuer ein Supplement bedienbar', () => {
  const q = ohneKommentare(lies(GHOST))
  // `[cmd]` **Hier stand `posten.length === 0`** — und ein
  // Supplementeintrag traegt keine Posten. `[cmd]` **Gemessen: der
  // Knopf war `disabled`.**
  //
  // `[read]` **Ein Ghost, den man nicht einloesen kann, ist
  // schlimmer als keiner** — er sieht aus wie ein Angebot.
  //
  // `[cmd]` **Gemessen: der Ausdruck steht ZWEIMAL in der Datei** —
  // einmal am Knopf, einmal am Leersatz. `[read]` **Eine Zusicherung
  // auf den blossen Text war deshalb blind:** die Sabotage am Knopf
  // blieb gruen, weil der Leersatz sie weiter erfuellte (die vierte
  // Ursache aus der Sabotagelehre).
  //
  // `[cmd]` **Geprueft wird jetzt das `disabled` DES KNOPFES.**
  assert.match(q, /disabled=\{laeuft \|\| \(posten\.length === 0 && !eintrag\.supplement\)\}/,
    'Der Bestaetigen-Knopf ist fuer Supplementeintraege gesperrt.')
})

test('G-489: der Leersatz nennt nicht den falschen Grund', () => {
  const q = ohneKommentare(lies(GHOST))
  // `[read]` **Die Lehre aus G-491:** ein Vermerk mit falschem Grund
  // ist schlimmer als keiner. **Es IST etwas hinterlegt, nur kein
  // Lebensmittel.**
  assert.match(q, /posten\.length === 0 && !eintrag\.supplement &&/,
    '„keine Lebensmittel hinterlegt" trifft auch Supplementeintraege.')
  assert.match(q, /data-probe="ghost-supplement"/,
    'Die Portion des Supplements wird nicht gezeigt.')
})
