/**
 * G-320 — die Lebensmittelsuche als Modal.
 *
 * **Tom, 2026-09-02:** *„offen planner ist die lebensmittelsuche die
 * muss gleich aufgebaut sein wie die suche in food db."*
 *
 * `[read]` **Die Wächter messen die Wirkung, nicht das Wort** —
 * CLAUDE.md nennt vier Fälle (G-216, G-247, G-246, G-108), in denen
 * einer grün blieb, während die Sache kaputt war.
 */
import assert from 'node:assert/strict'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { test } from 'node:test'

import {
  vorschauFuer, tagesLage, mengeAusPortion,
} from '../menge-rechnen'
import { sucheParams, LEERE_LAGE, MODAL_GROESSE } from '../food-suche-hook'

// `[cmd]` **Pfad aus der Lage DIESER Datei** — mit `process.cwd()`
// grün aus der Wurzel und rot im Gate (G-291, A-63).
const WURZEL = path.resolve(
  path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')),
  '../../../../../..',
)
const lies = (f: string) => fs.readFileSync(path.join(WURZEL, f), 'utf8')
const ohneKommentare = (f: string) => lies(f)
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
  .replace(/^[ \t]*\/\/.*$/gm, '')

const MODAL = 'apps/web/src/app/v2/nutrition/food-such-modal.tsx'
const EDITOR = 'apps/web/src/app/v2/nutrition/plan-eintrag-editor.tsx'
const PLANNER = 'apps/web/src/app/v2/nutrition/tab-planner-echt.tsx'
const HOOK = 'apps/web/src/lib/nutrition/food-suche-hook.ts'

test('die Dateiproben finden ihre Dateien — unabhängig vom Startort', () => {
  for (const f of [MODAL, EDITOR, PLANNER, HOOK]) {
    assert.ok(fs.existsSync(path.join(WURZEL, f)), `${f} nicht gefunden`)
    assert.ok(lies(f).length > 500, `${f} ist verdächtig kurz`)
  }
  assert.ok(fs.existsSync(path.join(WURZEL, 'pnpm-workspace.yaml')),
    `WURZEL zeigt nicht auf das Repo: ${WURZEL}`)
})

// ══ 1. Die Sackgasse ist weg ═════════════════════════════════════════

test('G-320: der Satz „noch nicht angebunden" ist weg', () => {
  // `[cmd]` **Er stand in `plan-eintrag-editor.tsx:201`.** `[read]`
  // **Ein ehrlicher Satz, aber eine Sackgasse** — genau die Art, die
  // G-311 geschlossen hat.
  //
  // `[cmd]` **Ohne Kommentare geprüft** — A-59: entfernt, nicht
  // auskommentiert.
  const e = ohneKommentare(EDITOR)
  assert.doesNotMatch(e, /noch nicht angebunden/,
    'die Sackgasse steht wieder im Planner')

  // `[read]` **Und der Ersatz ist ein Knopf, der etwas tut** — nicht
  // ein anderer Satz.
  assert.match(e, /onClick=\{\(\) => setSuchen\(true\)\}/,
    'der Suchen-Knopf öffnet nichts')
  assert.match(e, /\{suchen && \(\s*<FoodSuchModal/,
    'das Modal hängt an keinem Zustand')
})

// ══ 2. Keine sechste Suche ═══════════════════════════════════════════

test('G-320: das Modal sucht über den geteilten Hook', () => {
  // `[cmd]` **Gemessen am 2026-09-02: fünf Dateien rufen
  // `/api/nutrition/foods` selbst** — `tab-foods`, `mahlzeiten`,
  // `rezepte-echt`, `tab-vorlieben`, `erfassen`.
  //
  // `[read]` **Die sechste zu bauen wäre der Fehler, vor dem der
  // Auftrag warnt.** **Also prüft der Wächter die Wirkung: ruft das
  // Modal die Route SELBST?**
  const m = ohneKommentare(MODAL)
  assert.doesNotMatch(m, /\/api\/nutrition\/foods/,
    'das Modal ruft die Suchroute selbst — das ist die sechste Suche')
  assert.match(m, /useFoodSuche\(/,
    'das Modal benutzt den geteilten Hook nicht')

  // `[cmd]` **Und die Sortierung kommt aus `food-sortierung.ts`** —
  // keine eigene Liste, sonst gäbe es zwei Wahrheiten darüber, wonach
  // sich sortieren lässt.
  assert.match(m, /ALLE_SORTIERUNGEN\.map/,
    'das Modal führt eine eigene Sortierliste')
  assert.match(m, /sortiereSeite\(/,
    'das Modal sortiert die Seite selbst statt über G-70')
})

test('G-320: der Hook trägt die sechs Lehren — als Wirkung geprüft', () => {
  // `[read]` **Nicht: steht `G-133` im Text.** `[cmd]` **Sondern:
  // landet `ohne` in der Adresse?** — das ist der Unterschied
  // zwischen einem Kommentar und einem Wächter.
  const lage = {
    ...LEERE_LAGE,
    suche: 'reis',
    kategorie: 'getreide',
    tags: new Set(['vegan', 'bio']),
    ohne: new Set(['nuts']),
    herkunft: 'eigene' as const,
    seite: 2,
  }
  const p = sucheParams(lage, MODAL_GROESSE)

  // G-154: die Vorlieben sind die Konfiguration des Katalogs.
  assert.equal(p.get('prefs'), '1', 'prefs=1 fehlt — G-154')
  // G-112: mehrere Tags, sortiert (sonst ist dieselbe Auswahl zweimal
  // eine andere Adresse).
  assert.equal(p.get('tags'), 'bio,vegan', 'die Tags fehlen oder sind unsortiert')
  // G-133: der Ausschluss geht an die Suchfunktion.
  assert.equal(p.get('ohne'), 'nuts', 'ohne fehlt — G-133')
  // G-251: die Herkunft ebenso — sie entscheidet `total`.
  assert.equal(p.get('herkunft'), 'eigene', 'herkunft fehlt — G-251')
  // Das Blättern rechnet den Versatz.
  assert.equal(p.get('offset'), String(2 * MODAL_GROESSE),
    'der Versatz stimmt nicht — Seite 3 zeigte Seite 1')

  // `[cmd]` **Leere Filter stehen NICHT in der Adresse** — sonst
  // wäre `tags=` ein Filter auf nichts.
  const leer = sucheParams({ ...LEERE_LAGE, suche: 'reis' }, MODAL_GROESSE)
  assert.equal(leer.get('tags'), null, 'ein leeres Tag-Set steht in der Adresse')
  assert.equal(leer.get('ohne'), null, 'ein leeres ohne-Set steht in der Adresse')
  assert.equal(leer.get('herkunft'), null, 'eine leere Herkunft steht in der Adresse')
})

// ══ 3. FoodAmountInput — die Rechnung ════════════════════════════════

test('G-320: die Vorschau rechnet wie food_nutrient_snapshot', () => {
  // `[cmd]` **Am 2026-09-02 gegen die Datenbank geprüft, Hammeltalg:**
  //
  //     food_nutrient_snapshot(..., 150)   1120.5 kcal   122.0 g Fett
  //     747 * 150 / 100                    1120.5 kcal   122.0 g Fett
  //
  // `[read]` **Die Zahlen stehen hier, damit die Zusage messbar ist**
  // — nicht als Kommentar, sondern als Gleichheit.
  const talg = { enercc: '747.00000', prot625: '3.9', fat: '81.3', cho: '0.0' }
  const v = vorschauFuer(talg, 150)
  assert.equal(v.kcal, 1120.5, 'die kcal weichen vom Snapshot ab')
  assert.equal(v.fett, 122.0, 'das Fett weicht vom Snapshot ab')

  // Und bei 100 g steht der Ausgangswert.
  assert.equal(vorschauFuer(talg, 100).kcal, 747)
})

test('G-320: ein fehlender Nährwert wird nicht 0', () => {
  // `[read]` **Die Lehre aus `bls-fehlend-heisst-nicht-null`:** ein
  // Stück Fleisch ohne Vitamin-C-Wert hat nicht null Vitamin C.
  // **Eine 0 wäre eine Behauptung.**
  const luecke = { enercc: '112', prot625: null, fat: '3.41', cho: '' }
  const v = vorschauFuer(luecke, 150)
  assert.equal(v.kcal, 168, 'der vorhandene Wert wird nicht gerechnet')
  assert.equal(v.protein, null, 'ein fehlender Wert wurde zu 0')
  assert.equal(v.kh, null, 'ein leerer Wert wurde zu 0')
})

test('G-320: eine unsinnige Menge ergibt keine Zahl', () => {
  const f = { enercc: '112', prot625: '20.4', fat: '3.41', cho: '0' }
  assert.equal(vorschauFuer(f, Number.NaN).kcal, null, 'NaN ergab eine Zahl')
  assert.equal(vorschauFuer(f, -50).kcal, null, 'eine negative Menge ergab eine Zahl')
  assert.equal(vorschauFuer(f, 0).kcal, 0, '0 g sind 0 kcal — das stimmt')
})

test('G-320: die Portion rechnet die Gramm', () => {
  const p = [
    { name_de: 'Scheibe', amount_g: 30, is_default: true },
    { name_de: 'Packung', amount_g: 250, is_default: false },
  ]
  assert.equal(mengeAusPortion(p, 'Scheibe', 2), 60)
  assert.equal(mengeAusPortion(p, 'Packung', 0.5), 125)
  // `[read]` **Unbekannte Portion oder unsinnige Anzahl: `null`** —
  // das Grammfeld bleibt dann, was es war.
  assert.equal(mengeAusPortion(p, 'gibtsnicht', 1), null)
  assert.equal(mengeAusPortion(p, 'Scheibe', 0), null)
  assert.equal(mengeAusPortion(p, 'Scheibe', -1), null)
})

// ══ 4. Der Kontext ═══════════════════════════════════════════════════

test('G-320: der Tageskontext rechnet, wo der Nutzer landet', () => {
  // **Der Auftrag:** *„Wer mittags 800 kcal einträgt, soll sehen, wo
  // er landet."* `[cmd]` **Die Seed-Pläne tragen 2.200, 3.100, 2.700.**
  const l = tagesLage(1400, 800, 2200)
  assert.equal(l.summe, 2200)
  assert.equal(l.anteil, 100)
  assert.equal(l.ueber, false, '2200 von 2200 ist nicht darüber')

  // Darüber wird als solches gemeldet — die Anzeige färbt danach.
  const u = tagesLage(1800, 800, 2200)
  assert.equal(u.summe, 2600)
  assert.equal(u.anteil, 118)
  assert.equal(u.ueber, true, 'die Überschreitung wird nicht gemeldet')
})

test('G-320: ohne Tagesziel gibt es keinen Anteil', () => {
  // `[read]` **`null`, nicht 0 %.** **0 % hiesse „nichts vom Ziel",
  // und das ist etwas anderes als „kein Ziel gesetzt".**
  const l = tagesLage(1400, 800, null)
  assert.equal(l.summe, 2200, 'die Summe fehlt, obwohl sie bekannt ist')
  assert.equal(l.anteil, null, 'ohne Ziel entstand ein Anteil')
  assert.equal(l.ueber, false)
  // Ein Ziel von 0 ist kein Ziel.
  assert.equal(tagesLage(1400, 800, 0).anteil, null)
})

test('G-320: ohne jede Zahl bleibt die Summe null', () => {
  // `[read]` **Ein Tag ohne ermittelbare Werte hat nicht 0 kcal.**
  const l = tagesLage(null, null, 2200)
  assert.equal(l.summe, null, 'aus zwei Unbekannten wurde eine 0')
  assert.equal(l.anteil, null)
})

// ══ 5. Die Verdrahtung ═══════════════════════════════════════════════

test('G-320: der Kontext kommt aus dem Plan, nicht aus dem Modal', () => {
  // `[read]` **Ein Modal, das sein Tagesziel selbst lädt, wäre eine
  // zweite Wahrheit über denselben Plan.**
  const p = ohneKommentare(PLANNER)
  assert.match(p, /ziel=\{d\.plan\?\.target_kcal \?\? null\}/,
    'das Tagesziel kommt nicht aus dem Plan')
  assert.match(p, /tagesSumme=\{tagesSummeVon\(t\.eintraege\)\}/,
    'die Tagessumme wird nicht aus den Einträgen gerechnet')

  // `[cmd]` **Aus den Einträgen gerechnet, nicht neu geladen** —
  // `PlanEintrag.kcal` steht seit G-298 im Leseweg.
  assert.doesNotMatch(p, /rpc\('food_nutrient_snapshot'/,
    'der Planner lädt die Nährwerte ein zweites Mal')

  // Und das Modal schreibt nicht selbst — es gibt zurück.
  const m = ohneKommentare(MODAL)
  assert.doesNotMatch(m, /method: 'POST'/,
    'das Modal schreibt selbst — dann ist es an einen Schreibweg gebunden')
  assert.match(m, /onWaehlen: \(food: NutritionFoodSearchRow, mengeG: number\)/,
    'das Modal gibt Lebensmittel und Menge nicht zurück')
})

test('G-320: der Typwechsel setzt auch den Namen zurück', () => {
  // `[read]` **Bleibt er stehen, zeigt das Feld ein Lebensmittel an,
  // das nicht mehr gewählt ist** — die stille Falschaussage aus
  // `zahl-stimmt-aussage-nicht`.
  const e = ohneKommentare(EDITOR)
  const i = e.indexOf('const typWechseln')
  assert.ok(i > 0, 'typWechseln nicht gefunden')
  const block = e.slice(i, e.indexOf('}', e.indexOf('setFehler(null)', i)))
  assert.match(block, /setGewaehltName\(''\)/,
    'der Name bleibt beim Typwechsel stehen')
})
