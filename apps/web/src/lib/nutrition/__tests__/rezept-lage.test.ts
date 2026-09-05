// G-289 / G-288 / G-300 / G-301: Rezepte, Einkaufslisten, Flow 3.
//
// **Grundlage: `SPEC_03` Flow 3, 7, 8. Entscheidung `E-39`.**
//
// `[read]` **Die Waechter messen die Wirkung, nicht das Wort.**
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  QUELLEN, quelleVon, quellenEtikett,
  summeVon, jePortion, skaliert, mengeAnzeige, fortschritt,
  KOENNEN, KOENNEN_VORGABE, KOENNEN_LABEL, SPEC_LUECKEN,
  UNVOLLSTAENDIG_SATZ,
  type ZutatEntwurf,
} from '../rezept-lage'

// `[cmd]` **Pfad aus der Lage DIESER Datei, nicht aus `process.cwd()`**
// — sonst gruen aus der Wurzel und rot im Gate (G-291).
const WURZEL = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)), '../../../../../..',
)
const lies = (f: string) => fs.readFileSync(path.join(WURZEL, f), 'utf8')
const ohneKommentare = (f: string) => lies(f)
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
  .replace(/^[ \t]*\/\/.*$/gm, '')

const UI = 'apps/web/src/app/v2/nutrition/rezepte-echt.tsx'
const SCHREIB = 'apps/web/src/lib/nutrition/rezept-write.ts'
const LESEN = 'apps/web/src/lib/nutrition/rezept-lesen.ts'
const ROUTE = 'apps/web/src/app/api/nutrition/rezept/route.ts'
const PLANTAB = 'apps/web/src/app/v2/nutrition/tab-plans.tsx'
const PLANLAGE = 'apps/web/src/lib/nutrition/plan-lage.ts'

const zutat = (g: number, kcal: number | null): ZutatEntwurf => ({
  food_id: 'x', name: 'X', amount_g: g,
  enercc_100: kcal, prot625_100: kcal, fat_100: kcal, cho_100: kcal,
})

test('die Dateiproben finden ihre Dateien — unabhaengig vom Startort', () => {
  for (const f of [UI, SCHREIB, LESEN, ROUTE, PLANTAB, PLANLAGE]) {
    assert.ok(fs.existsSync(path.join(WURZEL, f)), `${f} nicht gefunden`)
    assert.ok(lies(f).length > 500, `${f} ist verdaechtig kurz`)
  }
  assert.ok(fs.existsSync(path.join(WURZEL, 'pnpm-workspace.yaml')),
    `WURZEL zeigt nicht auf das Repo: ${WURZEL}`)
})

// ══ FLOW 7, SCHRITT 3: die Live-Vorschau ═════════════════════════

test('G-289: die Summe rechnet je 100 g auf die Menge hoch', () => {
  // 200 g bei 100 kcal/100 g = 200 kcal.
  assert.equal(summeVon([zutat(200, 100)]).kcal, 200)
  assert.equal(summeVon([zutat(50, 100)]).kcal, 50)
  assert.equal(summeVon([zutat(200, 100), zutat(100, 50)]).kcal, 250)
  assert.equal(summeVon([]).kcal, null, 'ohne Zutat gibt es keine Summe')
})

test('G-289: EINE Zutat ohne Wert macht die Summe unbestimmbar', () => {
  // `[read]` **`null` heisst „nicht ermittelbar", nicht 0** — dieselbe
  // Regel wie beim BLS (`bls-fehlend-heisst-nicht-null`).
  // **Waere es 0, saehe ein unvollstaendiges Rezept magerer aus, als
  // es ist.**
  const gemischt = summeVon([zutat(200, 100), zutat(100, null)])
  assert.equal(gemischt.kcal, null)
  assert.notEqual(gemischt.kcal, 200, 'die Luecke wurde uebergangen')
  assert.match(UNVOLLSTAENDIG_SATZ, /unvollständig/)
})

test('G-289: je Portion teilt — und teilt nicht durch null', () => {
  // `[cmd]` **`recipe_nutrition(id, p_servings)` TEILT NICHT** — der
  // Rumpf rechnet `amount_g * servings_used / servings`, also
  // SKALIERT er. `[cmd]` **Gemessen: ein 1-Portionen-Rezept liefert
  // bei `p_servings = 2` das Doppelte, nicht die Haelfte.**
  // `[read]` **Deshalb teilt die Anzeige selbst.**
  const g = { kcal: 1310, protein: 40, fett: 20, kohlenhydrate: 100 }
  assert.equal(jePortion(g, 4).kcal, 327.5)
  assert.equal(jePortion(g, 1).kcal, 1310)
  // Waehrend der Eingabe darf das Feld leer sein.
  assert.equal(jePortion(g, 0).kcal, null)
  assert.equal(jePortion(g, -1).kcal, null)
  assert.equal(jePortion(g, Number.NaN).kcal, null)
})

// ══ FLOW 8: die Skalierung ═══════════════════════════════════════

test('G-288: die Menge skaliert auf die Zielportionen', () => {
  // `[cmd]` **Gemessen im Browser: 250 g bei 4 Portionen -> 500 g bei
  // 8.** `[read]` **Der Faktor ist Ziel geteilt durch Rezept** — der
  // vertauschte Bruch faellt hier auf.
  assert.equal(skaliert(250, 4, 8), 500)
  assert.equal(skaliert(150, 4, 8), 300)
  // Gleiche Zahl heisst gleiche Menge — die Probe gegen den Bruch.
  assert.equal(skaliert(250, 4, 4), 250)
  // Halbieren geht auch.
  assert.equal(skaliert(250, 4, 2), 125)
  assert.equal(skaliert(250, 0, 4), null, 'ohne Rezeptportionen kein Faktor')
  assert.equal(skaliert(250, 4, 0), null)
})

test('G-288: die Einheit kommt aus dem Posten, nicht aus einer Annahme', () => {
  // `[cmd]` **Flow 8 zeigt in seinem Beispiel *„40ml"* fuer Oel**, und
  // `shopping_list_items` traegt dafuer `unit_display`. `[cmd]` **Die
  // Bestandsliste im Repo enthaelt genau so einen Posten (250 ml).**
  // `[read]` **Milliliter aus Gramm zu rechnen waere eine
  // Dichteannahme** — die Einheit wird durchgereicht.
  assert.equal(mengeAnzeige(500), '500 g')
  assert.equal(mengeAnzeige(250, 'ml'), '250 ml')
  assert.equal(mengeAnzeige(null), '—')
  assert.equal(mengeAnzeige(0.55), '0,6 g')
})

test('G-288: der Fortschritt zaehlt abgehakte Posten', () => {
  assert.deepEqual(fortschritt([]), { erledigt: 0, gesamt: 0, anteil: null })
  assert.deepEqual(fortschritt([{ is_checked: true }, { is_checked: false }]),
    { erledigt: 1, gesamt: 2, anteil: 50 })
  // `[read]` **Bei null Posten gibt es keinen Anteil, nicht 0 %.**
  assert.equal(fortschritt([]).anteil, null)
})

// ══ FLOW 3: die Herkunft — vorsehen, nicht bauen ═════════════════

test('G-289/E-39: eigene Rezepte tragen KEIN Etikett', () => {
  // `[cmd]` **`SPEC_03` Flow 3, Schritt 2: *„Eigene (source: user) —
  // ohne Label"*.** `[read]` **Wenn alles ein Etikett traegt,
  // unterscheidet keines mehr.**
  assert.equal(quellenEtikett('user'), null)
  assert.equal(quellenEtikett('coach', 'Dr. Meier'), 'Von Dr. Meier')
  assert.equal(quellenEtikett('marketplace', 'Meal Prep XL'),
    'Gekauft: Meal Prep XL')
  assert.equal(quellenEtikett('buddy'), 'Erstellt von Buddy')
  // Ohne Detail bleibt das Etikett trotzdem lesbar.
  assert.match(quellenEtikett('coach', null) ?? '', /Coach/)
})

test('G-289: die Herkunft ist ABGELEITET — die Spalte gibt es nicht', () => {
  // `[cmd]` **Gemessen am 2026-08-31: `recipes` hat 17 Spalten, davon
  // `measurement_source` und `source_detail` — KEINE `source`.**
  // `[read]` **Der Auftrag und E-39 sagen, `Recipe.source` trage die
  // Werte schon. Das stimmt fuer das Schema nicht.**
  //
  // `[read]` **`measurement_source` ist etwas anderes:** es sagt, WIE
  // gemessen wurde (`manual`, `seed`), nicht WER es erstellt hat.
  // **Die beiden zu verwechseln waere der Fehler, den `plan_origin`
  // bei den Plaenen vermeidet.**
  assert.equal(quelleVon(null), 'user')
  assert.equal(quelleVon('seed'), 'user', 'measurement_source ist keine Quelle')
  assert.equal(quelleVon('manual'), 'user')
  assert.equal(quelleVon('coach'), 'coach')
  assert.equal(QUELLEN.length, 4)
})

// ══ WAS IN DER SPEC FEHLT — gemeldet, nicht ausgedacht ═══════════

test('G-289: die Spec-Luecken sind benannt, nicht gefuellt', () => {
  // **Auftrag: *„Wenn ein Schritt in der Spec fehlt: melden, nicht
  // ausdenken."*** `[cmd]` **C-370 ist genau so entstanden.**
  assert.ok(SPEC_LUECKEN.length >= 3, 'die Luecken sind nicht festgehalten')
  const texte = SPEC_LUECKEN.map(l => `${l.flow} ${l.fehlt} ${l.was}`).join(' ')
  assert.match(texte, /Teilen \/ Exportieren/)
  assert.match(texte, /cooking_skill/)
  assert.match(texte, /löschen/)

  // Und die Wirkung: kein erfundener Teilen-Knopf.
  const u = ohneKommentare(UI)
  assert.doesNotMatch(u, /(?<![a-zA-Z0-9_])navigator\.share(?![a-zA-Z0-9_])/,
    'ein Teilen-Weg ist erfunden worden')
  assert.doesNotMatch(u, /Exportieren<\/button>/,
    'ein Export-Knopf ist entstanden, den die Spec nicht beschreibt')
})

test('G-289: cooking_skill hat eine Vorgabe — der CHECK verlangt sie', () => {
  // `[cmd]` **NOT NULL mit CHECK auf drei Werte** — ohne Angabe
  // schlaegt der Insert fehl. `[cmd]` **Flow 7 nennt das Feld nicht.**
  assert.ok((KOENNEN as readonly string[]).includes(KOENNEN_VORGABE))
  assert.equal(KOENNEN.length, 3)
  for (const k of KOENNEN) assert.ok(KOENNEN_LABEL[k], `${k} ohne Beschriftung`)
})

// ══ DIE VERDRAHTUNG ══════════════════════════════════════════════

test('G-289/G-350: die VIER Vorgaenge sind in der Route erreichbar', () => {
  // `[cmd]` **A-59/G-192: ein Schreibweg ohne Aufrufer ist tot.**
  //
  // ══ NACHGEZOGEN IN G-350, 2026-09-07 ═════════════════
  //
  // `[cmd]` **Es waren fuenf; `posten_haken` ist entfernt.**
  // **G-345 hat `postenAbhaken` gebaut** (die Liste haengt seit
  // E-64 an drei Orten), **und damit gab es zwei Wege auf
  // `is_checked`.**
  //
  // `[read]` **Dieselbe Regel, andere Richtung:** der Waechter hielt
  // einen Weg am Leben, der seinen Aufrufer verloren hatte.
  const r = ohneKommentare(ROUTE)
  for (const art of ['rezept', 'rezept_aendern', 'rezept_loggen',
                     'einkaufsliste']) {
    assert.match(r, new RegExp(`art === '${art}'`), `${art} fehlt in der Route`)
  }

  // `[cmd]` **Und der entfernte darf nicht zurueckkommen** — sonst
  // gibt es wieder zwei Wege.
  assert.doesNotMatch(r, /art === 'posten_haken'/,
    'posten_haken ist zurueck — der Weg steht in einkaufsliste-aktionen.ts (G-350)')
})

test('G-289: das Loggen benutzt den Schreibweg aus G-272 — keinen zweiten', () => {
  // `[cmd]` **Flow 7, Schritt 5: *„Meal + MealItems, Naehrstoffe
  // eingefroren"*.** `[read]` **Das Einfrieren macht
  // `computeFrozenNutrients` in `addMealItem`** — ein eigener Insert
  // hier waere die zweite Kopie derselben Regel, und zwei Kopien
  // driften.
  const s = ohneKommentare(SCHREIB)
  assert.match(s, /import \{ createMeal, addMealItem \} from '\.\/diary-write'/,
    'der Mahlzeit-Schreibweg wird nicht wiederverwendet')
  assert.match(s, /await addMealItem\(/, 'die Positionen entstehen nicht darueber')
  // Und KEIN eigener Insert in meal_items.
  assert.doesNotMatch(s, /from\('meal_items'\)/,
    'es entsteht ein zweiter Weg in meal_items')
  assert.doesNotMatch(s, /computeFrozenNutrients/,
    'die Einfrierregel ist ein zweites Mal abgeschrieben')
})

test('G-289: eine Zeile je Zutat — kein Sammeleintrag', () => {
  // `[cmd]` **`ADR_GHOST_ENTRY_RECIPE`: ein Rezept ist eine Vorlage.**
  // `[read]` **Ein „Rezept als Einheit bestaetigen" gibt es nicht** —
  // es braeche die Mengen-Anpassbarkeit je Zutat.
  const s = ohneKommentare(SCHREIB)
  const start = s.indexOf('export async function rezeptLoggen')
  assert.notEqual(start, -1)
  const block = s.slice(start, start + 2600)
  // Die Wirkung: eine SCHLEIFE ueber die Zutaten.
  assert.match(block, /for \(const z of liste\)/,
    'die Positionen entstehen nicht je Zutat')
  assert.match(block, /positionen \+= 1/, 'die Zeilen werden nicht gezaehlt')
  // Und die Menge wird skaliert, nicht uebernommen.
  assert.match(block, /Number\(z\.amount_g\) \* skalierung/,
    'die Menge wird nicht auf die Portionen skaliert')
})

test('G-288: die Liste entsteht aus einem REZEPT — der CHECK verlangt es', () => {
  // `[cmd]` **`shopping_lists_source_target_check`: bei
  // `source_type = 'recipe'` MUSS `recipe_id` gesetzt und
  // `meal_plan_week_id` leer sein.**
  const s = ohneKommentare(SCHREIB)
  assert.match(s, /source_type: 'recipe'/, 'die Liste traegt keine Rezeptquelle')
  assert.match(s, /meal_plan_week_id: null/,
    'die Planwoche wird nicht ausdruecklich geleert')
  assert.match(s, /recipe_id: eingabe\.recipe_id/)
})

test('G-288: die widerlegte Behauptung ist berichtigt', () => {
  // `[cmd]` **Der Satz sagte: *„Sie entsteht aus einer Planwoche"*.**
  // `[cmd]` **`SPEC_03` Flow 8 sagt: *„Rezept oeffnen ->
  // Einkaufsliste erstellen"*.**
  const p = lies(PLANLAGE)
  const start = p.indexOf('export const KEINE_EINKAUFSLISTE_SATZ')
  assert.notEqual(start, -1, 'der Satz fehlt')
  const satz = p.slice(start, start + 300)
  assert.doesNotMatch(satz, /aus einer Planwoche/,
    'die widerlegte Behauptung steht wieder da')
  assert.match(satz, /aus einem Rezept/, 'der Satz nennt die richtige Quelle')
})

test('G-301: die drei Unterreiter sind weg — Flow 3 kennt eine Uebersicht', () => {
  // `[cmd]` **`Active plan` / `Plan library` / `Shopping list` stehen
  // in keiner Spec.** `[cmd]` **Flow 3, Schritt 2: *„Uebersicht zeigt
  // alle verfuegbaren Plaene"*** — und ein Plan DARIN traegt
  // `status: active`.
  const t = ohneKommentare(PLANTAB)
  assert.doesNotMatch(t, /'Active plan'/, 'der Unterreiter ist zurueck')
  assert.doesNotMatch(t, /'Plan library'/, 'der Unterreiter ist zurueck')
  assert.doesNotMatch(t, /'Shopping list'\]/, 'der Unterreiter ist zurueck')
  // Die Wirkung: kein Umschaltzustand mehr.
  assert.doesNotMatch(t, /setTab\(/, 'es gibt wieder einen Unterreiter-Zustand')
})

test('G-289/G-300: die Suche sitzt IM Rezept — Flow 7, Schritt 3', () => {
  // ══ BERICHTIGT IN G-323 ═════════════════════════
  //
  // `[cmd]` **Hier stand `/api/nutrition/foods?q=` und
  // `aria-label="Menge in Gramm"`** — beides Teile der eigenen
  // `ZutatSuche`.
  //
  // **Tom, 2026-09-02:** *,,das modal ist perfekt, wieso nutzen wir
  // das nicht auch fuer rezepte?"*
  //
  // `[read]` **Was der Waechter sichert, gilt weiter:** die Suche
  // sitzt IM Rezept, Flow 7 Schritt 3. **Sie ruft jetzt nur nicht
  // mehr selbst** — `FoodSuchModal` tut es, mit acht Lehren, die
  // `ZutatSuche` fehlten (G-320).
  //
  // `[read]` **Und die Mengeneingabe steht im Modal** (`FoodAmountInput`),
  // nicht mehr hier.
  const u = ohneKommentare(UI)
  assert.match(u, /<FoodSuchModal/,
    'die Zutatensuche ruft die Lebensmittelsuche nicht')
  assert.match(u, /art: 'rezept'/,
    'das Modal wird nicht im Rezeptmodus gerufen')
  // Live-Vorschau: Gesamt UND je Portion, nicht eines von beiden.
  assert.match(u, /Live-Vorschau/)
  // `[cmd]` **BERICHTIGT in G-326: der Wortlaut hat sich geaendert.**
  // **Tom, 2026-09-02:** *,,wieso zwei totale?"* — aus *je Portion*
  // wurde *Eine Portion (von n)*, damit die Ueberschrift sagt, was
  // die Spalte ist.
  //
  // `[read]` **Was der Waechter sichert, gilt weiter:** die Vorschau
  // zeigt Gesamt UND je Portion, nicht eines von beiden.
  assert.match(u, /Eine Portion \(von /)
  assert.match(u, /Ganzes Rezept \(/)
  assert.match(u, /jePortion\(gesamt, portionen\)/,
    'die Vorschau rechnet je Portion nicht')
})

test('G-289: die Naehrwerte der Suche werden in Zahlen gewandelt', () => {
  // `[cmd]` **`NutritionFoodSearchRow` liefert `enercc: string`** —
  // gemessen am Typ. `[read]` **Ohne Umwandlung rechnete die Vorschau
  // mit Text, und `NaN` saehe aus wie ein fehlender Wert.**
  // `[cmd]` **BERICHTIGT in G-323: die Quelle heisst jetzt `f`**,
  // nicht `gewaehlt` — das Modal reicht das Lebensmittel als
  // Argument, statt es selbst im Zustand zu halten.
  //
  // `[read]` **Der Grund fuer die Umwandlung gilt unveraendert:**
  // `NutritionFoodSearchRow` liefert Zeichenketten.
  const u = ohneKommentare(UI)
  assert.match(u, /function zahlOderNull/, 'die Umwandlung fehlt')
  assert.match(u, /enercc_100: zahlOderNull\(f\.enercc\)/,
    'die kcal werden ungewandelt uebernommen')
  // `[read]` **Alle vier, gezaehlt** — eine vergessene Zeile faellt
  // sonst nicht auf.
  const zahl = (u.match(/zahlOderNull\(f\./g) ?? []).length
  assert.equal(zahl, 4,
    `${zahl} von 4 Naehrwerten werden gewandelt`)
})
