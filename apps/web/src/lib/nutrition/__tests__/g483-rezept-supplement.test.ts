// G-483 — Supplemente in Rezepten, nicht in Planeintraegen.
//
// **Tom, 2026-09-19:** *„ja klar kann ich zb 500ml milch/blaubeeren
// und whey protein ein rezept fuer meinen eigenen shake machen"* —
// und der Grund, warum es kein Stack ist: *„er kann keinen shake in
// den stack legen, weil wir da milch nicht kennen"*.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const SRC = path.resolve(__dirname, '..', '..', '..')
const lies = (p: string) => readFileSync(path.join(SRC, p), 'utf8')
const ohneKommentare = (q: string) => q
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^\s*\/\/.*$/gm, '')

test('G-483/A1: das Rezept ruft die C-519-Funktion', () => {
  // `[cmd]` **`supplements.add_supplier_product_to_recipe` schreibt
  // Zutat UND Produktverweis** — gerufen, nicht nachgebaut (G-481).
  const w = ohneKommentare(lies('lib/nutrition/rezept-write.ts'))
  assert.match(w, /add_supplier_product_to_recipe/,
    'der Schreibweg ruft die Funktion nicht')
  assert.match(w, /p_recipe_id/, 'ohne Rezept-Id entsteht keine Zutat')
  assert.match(w, /p_serving_quantity/, 'die Anzahl fehlt')
})

test('G-483/A1: der Rezeptsatz traegt KEINE Supplementzutat', () => {
  // `[cmd]` **`recipe_ingredients_amount_g_check`: bei `supplement`
  // MUSS `amount_g` NULL sein.** `[read]` **Eine Supplementzutat
  // durch den Lebensmittelvertrag zu schicken hiesse, ihn zu
  // beluegen** — sie kommt ueber die Funktion.
  const q = ohneKommentare(lies('app/v2/nutrition/rezepte-echt.tsx'))
  assert.match(q, /filter\(x => !istSupplementEntwurf\(x\)\)/,
    'Supplementzutaten gehen in den Rezeptsatz — dort haben sie kein food_id')
  assert.match(q, /art: 'supplement_zutat'/,
    'sie werden nicht ueber die eigene Art geschrieben')
})

test('G-483/A3+A4: der Planeintrag bietet KEINE Supplemente an', () => {
  // `[cmd]` **GEMESSEN am 2026-09-19:** `nutrition.meal_plan_entries`
  // hat KEINE Supplementspalte — weder `supplement_product_id` noch
  // einen Verweis.
  //
  // `[read]` **Eine Filterpille dort fuehrte in eine Liste, aus der
  // man nichts waehlen kann** — schlimmer als keine (G-480).
  for (const datei of ['plan-eintrag-editor.tsx', 'ghost-eintrag.tsx']) {
    const q = lies(path.join('app', 'v2', 'nutrition', datei))
    assert.doesNotMatch(q, /onSupplement=/,
      `${datei} bietet Supplemente an, die Datenbank kann sie nicht tragen`)
  }
  // Und die beiden, die es koennen:
  for (const datei of ['mahlzeiten.tsx', 'rezepte-echt.tsx']) {
    const q = lies(path.join('app', 'v2', 'nutrition', datei))
    assert.match(q, /onSupplement=/,
      `${datei} reicht den Schreibweg nicht durch`)
  }
})

test('G-483/A5: die Formregel wird WIEDERVERWENDET', () => {
  // `[read]` **Nicht nachgebaut** — `sucheSupplemente` filtert bereits
  // ueber `darfInMahlzeit`, und das Rezept nutzt dieselbe Suche.
  const r = ohneKommentare(lies('lib/nutrition/supplement-posten-read.ts'))
  assert.match(r, /darfInMahlzeit/,
    'die Suche wendet die Formregel nicht an')
  const q = ohneKommentare(lies('app/v2/nutrition/rezepte-echt.tsx'))
  assert.doesNotMatch(q, /MEAL_FORMEN|produktform\.like/,
    'das Rezept baut die Formregel nach, statt sie zu benutzen')
})

test('G-483: eine Supplementzutat zeigt Portion statt Gramm', () => {
  // `[read]` **`amount_g` ist NULL** (CHECK) — `mengeAnzeige`
  // schriebe „0 g", und das ist eine Behauptung.
  const q = ohneKommentare(lies('app/v2/nutrition/rezepte-echt.tsx'))
  assert.match(q, /food_source === 'supplement'/,
    'die Zeile unterscheidet die Quelle nicht')
  assert.match(q, /serving_quantity \?\? 1\}\s*×|serving_quantity \?\? 1\}\s*&times;|\$\{z\(zt\.supplement\?\.serving_quantity \?\? 1, 0\)\} ×/,
    'die Anzahl wird nicht als Portion gezeigt')
})

test('G-483: der Leseweg holt den Produktverweis aus EINER Datei', () => {
  // `[cmd]` **G-138: die `supplements`-Tabellen gehoeren einer
  // Datei.** `[read]` **Verschoben, nicht den Waechter gelockert**
  // (wie G-475 und G-485).
  const l = ohneKommentare(lies('lib/nutrition/rezept-lesen.ts'))
  assert.match(l, /produktverweise/,
    'der Rezept-Leseweg holt die Verweise nicht')
  assert.doesNotMatch(l, /recipe_product_references/,
    'der Rezept-Leseweg greift selbst auf die supplements-Tabelle zu')
  const sw = ohneKommentare(lies('lib/supplements/stack-write.ts'))
  assert.match(sw, /recipe_product_references/,
    'der Zugriff liegt nicht in stack-write.ts')
})
