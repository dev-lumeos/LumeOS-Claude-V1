/**
 * G-412 — die letzten Attrappen in Nutrition
 *
 * **Tom, 2026-09-08:** *„aus meiner sicht, was ich in der ui noch
 * nicht angebunden sehe: Nutrition score, Pre-workout window,
 * Micronutrient snapshot, Below threshold."*
 *
 * `[read]` **Die Proben messen nicht, DASS etwas gebaut ist** — das
 * steht am Schirm. **Sondern dass die Entscheidungen halten:** keine
 * erfundene Zahl, kein Rueckfall auf einen Vorgabewert, und die
 * sieben uebrigen Referenzbloecke bleiben.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import { stufenFaktor, stufeGilt, nutritionScore }
  from '../stufenfaktor'

const HIER = dirname(fileURLToPath(import.meta.url))
const WEB = join(HIER, '..', '..', '..')
const NUT = join(WEB, 'app', 'v2', 'nutrition')

const ohneKommentar = (p: string) => readFileSync(p, 'utf8').split('\n')
  .filter(z => !z.trim().startsWith('//') && !z.trim().startsWith('*'))
  .join('\n')

test('die vier Attrappen sind entfallen', () => {
  // `[cmd]` **Score angebunden, die anderen drei doppelt.**
  const t = ohneKommentar(join(NUT, 'ansicht.tsx'))
  for (const name of ['NutritionScoreCard', 'PreWorkoutOptimizer',
    'MicronutrientSnapshot', 'BelowThreshold']) {
    assert.ok(!t.includes(`<${name}`), `${name} wird noch gerendert`)
  }
  // Und die echte Kachel steht da.
  assert.match(t, /<ScoreEcht\b/)
})

test('sieben Referenzbloecke bleiben, der Diary faellt', () => {
  // **Tom:** *„und dann kann die mockup-referenz-linie und alles
  // darunter weg."* — `[cmd]` **NUR im Diary-Block.**
  const t = ohneKommentar(join(NUT, 'ansicht.tsx'))
  assert.ok(!t.includes('<NutritionDiaryReferenz'),
    'Der Diary-Referenzblock steht noch')
  const uebrig = ['NutritionNutrientsReferenz', 'NutritionInsightsReferenz',
    'NutritionPlansReferenz', 'NutritionPrefsReferenz',
    'NutritionPlannerReferenz', 'EinkaufReferenz', 'NutritionFoodsReferenz']
  for (const n of uebrig) {
    assert.ok(t.includes(`<${n}`), `${n} fehlt — die sieben bleiben`)
  }
  assert.equal(uebrig.length, 7)
})

test('der Score raet keinen Stufenfaktor', () => {
  // `[read]` **G-283/G-228: `pro` hat keinen belegten Faktor.**
  // `[cmd]` **Ein Rueckfall auf 0,90 gab `pro` den Wert von
  // `intermediate`** — kein Absturz, nur eine falsche Zahl.
  assert.equal(stufenFaktor('pro'), null)
  assert.equal(stufeGilt('pro'), true)
  assert.equal(stufenFaktor('gibtesnicht'), null)
  assert.equal(stufeGilt('gibtesnicht'), false)
  // Ohne Faktor kein Score.
  const voll = { protein: 1, calorie: 1, carbs: 1, fat: 1, fiber: 1 }
  assert.equal(nutritionScore(voll, 'pro'), null)
  assert.equal(nutritionScore(voll, 'advanced'), 1)
})

test('der Stufenfaktor liegt ausserhalb der Client-Grenze', () => {
  // `[cmd]` **Am Schirm gemessen:** die Tabelle stand in
  // `diary-entwurf.tsx` (`'use client'`), die Score-Kachel ist eine
  // Server-Komponente — **`stufenFaktor is not a function`, 0
  // Karten.** `[read]` **`tsc` blieb gruen.**
  const lib = join(WEB, 'lib', 'nutrition', 'stufenfaktor.ts')
  assert.ok(existsSync(lib), 'stufenfaktor.ts fehlt')
  // `[cmd]` **Kommentarzeilen weg** — die Datei ERKLAERT, warum sie
  // kein `'use client'` traegt, und der erste Anlauf fand genau
  // diese Erklaerung. `[read]` **Die Marke steht in Zeile 1**, sonst
  // wirkt sie nicht.
  const ersteZeile = readFileSync(lib, 'utf8').trimStart().slice(0, 40)
  assert.ok(!ersteZeile.includes('use client'),
    'Die Tabelle darf keine Client-Datei sein')
  // Und die Kachel holt sie von dort, nicht aus dem Entwurf.
  const karte = ohneKommentar(join(NUT, 'score-echt.tsx'))
  assert.match(karte, /from '\.\.\/\.\.\/\.\.\/lib\/nutrition\/stufenfaktor'/)
})

test('kein Ballaststoffziel wird erfunden', () => {
  // `[cmd]` **Gemessen ueber alle Spalten mit „fib": nur Zufuhr,
  // kein Ziel.** `[read]` **Der fuenfte Anteil bleibt offen**, und
  // die Kachel sagt es.
  const t = ohneKommentar(join(WEB, 'lib', 'nutrition', 'score-read.ts'))
  assert.match(t, /zielFeld: null/,
    'Der Ballaststoffanteil braucht `zielFeld: null` — es gibt kein Ziel')
  assert.match(t, /KEIN_FIBT_ZIEL/)
})

test('die Verlaufsgrafik ist die der Vorlage', () => {
  // `[cmd]` **`module-charts-pro.jsx:115`:** geglaettet (`Q`),
  // Verlauf 0,22 -> 0, Flaeche nur bei `si === 0`, Punkte nur bis 16,
  // zweite Reihe gestrichelt `"3 3"`.
  // `[cmd]` **`WEB` zeigt auf `apps/web/src`** — von dort sind es
  // vier Ebenen zur Wurzel, nicht zwei.
  const t = ohneKommentar(
    join(WEB, '..', '..', '..', 'packages', 'ui', 'src', 'primitives.tsx'))
  assert.match(t, /const glatt = /, 'Die Glaettung fehlt')
  assert.match(t, /stopOpacity="0\.22"/, 'Der Verlauf fehlt')
  assert.match(t, /strokeDasharray=\{gestrichelt \? '3 3'/, 'Die Strichelung fehlt')
  assert.match(t, /pts\.length <= 16/, 'Die Punktgrenze fehlt')
})

test('die Waermekarte erfindet keine Zellen', () => {
  // `[cmd]` **Die Vorlage fuellt sie mit `Math.random()`**
  // (`module-nutrition.jsx:399`). `[read]` **Hier kommen die Werte
  // aus `micronutrient_snapshot`**, und eine Luecke bleibt leer.
  const t = ohneKommentar(join(NUT, 'mikro-trend.tsx'))
  assert.ok(!t.includes('Math.random'), 'Die Waermekarte wuerfelt')
  assert.match(t, /anteil === null/, 'Leere Zellen brauchen einen eigenen Fall')
  const read = ohneKommentar(join(WEB, 'lib', 'nutrition', 'mikro-trend-read.ts'))
  assert.match(read, /Promise\.all/,
    'Dreissig Aufrufe muessen gleichzeitig laufen, nicht nacheinander')
})

test('die Tagesdeckung ist auf zwei Drittel begrenzt', () => {
  // `[cmd]` **Am Schirm gemessen: 616 px vorher, 411 nachher.**
  // `[read]` **Die Hoehe steht INLINE** — eine Regel in
  // `nutrition.css` blieb wirkungslos, weil ein Inline-Stil gewinnt.
  const t = ohneKommentar(join(NUT, 'ansicht.tsx'))
  assert.match(t, /maxHeight: 255/,
    'Der Scrollkasten der Tagesdeckung braucht die begrenzte Hoehe')
})

test('Macro split traegt die drei Zeilen der Vorlage', () => {
  // `[cmd]` **`module-nutrition.jsx:386-390`**, nach der Trennlinie:
  // hoechster Tag, niedrigster Tag, Tage am Ziel ±100.
  //
  // `[read]` **Alle drei aus `d.reihe`** — derselben Tagesreihe, die
  // die Verlaufsgrafik zeichnet. **Kein zweiter Leseweg**, sonst
  // koennten die beiden verschiedene Zahlen zeigen.
  const t = ohneKommentar(join(NUT, 'insights-echt.tsx'))
  assert.match(t, /Hoechster Tag/)
  assert.match(t, /Niedrigster Tag/)
  assert.match(t, /Tage am Ziel/)
  // `[cmd]` **Die Toleranz steht in der Vorlage: ±100.**
  assert.match(t, /<= 100/, 'Die Toleranz ±100 fehlt')
  // `[read]` **Ohne Ziel keine Quote** — sonst behauptete die Zeile
  // „0 von 14", wo in Wahrheit das Ziel fehlt.
  assert.match(t, /kein Kalorienziel hinterlegt/)
})

test('die Verlaufsgrafik zeigt das Ziel gestrichelt', () => {
  // `[cmd]` **Die Vorlage ruft `LineChart` mit ZWEI Reihen:** Zufuhr
  // in `--acc-nutri`, Ziel flach in `--fg-dim`.
  // `[cmd]` **`range={[1500, 3200]}`, `h={180}`** — feste Grenzen.
  const t = ohneKommentar(join(NUT, 'insights-echt.tsx'))
  assert.match(t, /range=\{\[1500, 3200\]\}/, 'Die festen Grenzen fehlen')
  assert.match(t, /h=\{180\}/, 'Die Hoehe 180 fehlt')
  assert.match(t, /dashed: true/, 'Die Ziellinie ist nicht gestrichelt')
  // `[read]` **Ohne Ziel nur EINE Reihe** — eine flache Linie auf
  // einem geratenen Wert waere eine Aussage ueber den Nutzer.
  assert.match(t, /zielKcal === null/)
})
