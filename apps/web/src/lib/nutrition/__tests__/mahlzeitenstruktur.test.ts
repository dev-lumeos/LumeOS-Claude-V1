/**
 * G-72 / G-99 / G-322 — die acht Spalten, je nach Reife.
 *
 * **E-47** ordnet sie einzeln zu: drei wirken, drei sind ausgesetzt,
 * zwei bleiben liegen.
 *
 * `[read]` **Die Wächter messen die Wirkung, nicht das Wort** —
 * CLAUDE.md nennt vier Fälle (G-216, G-247, G-246, G-108), in denen
 * einer grün blieb, während die Sache kaputt war.
 */
import assert from 'node:assert/strict'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { test } from 'node:test'

import { rasterZeilen } from '../plan-model'

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

const PREFS = 'apps/web/src/app/v2/nutrition/tab-vorlieben.tsx'
const DIARY = 'apps/web/src/app/v2/nutrition/mahlzeiten.tsx'
const SEITE = 'apps/web/src/app/v2/nutrition/page.tsx'
const SETTINGS = 'apps/web/src/app/v2/settings/formular.tsx'
const FOODS = 'apps/web/src/app/v2/nutrition/tab-foods.tsx'

test('die Dateiproben finden ihre Dateien — unabhängig vom Startort', () => {
  for (const f of [PREFS, DIARY, SEITE, SETTINGS, FOODS]) {
    assert.ok(fs.existsSync(path.join(WURZEL, f)), `${f} nicht gefunden`)
    assert.ok(lies(f).length > 500, `${f} ist verdächtig kurz`)
  }
  assert.ok(fs.existsSync(path.join(WURZEL, 'pnpm-workspace.yaml')),
    `WURZEL zeigt nicht auf das Repo: ${WURZEL}`)
})

// ══ 1 · Drei sind ausgesetzt, mit Begründung ═════════════════════════

test('G-99: die drei ohne Wirkung stehen als Kommentar, nicht als Feld', () => {
  // `[cmd]` **G-99 hat gemessen, warum sie nichts tun koennen:**
  // `recipes` traegt `cooking_skill` und `prep_time_min` — **aber
  // nichts filtert danach, und ein Preisfeld gibt es nicht.**
  //
  // ══ BERICHTIGT IN G-335 ═════════════════════════
  //
  // **Tom, 2026-09-02:** *,,mahlzeitenstruktur muessen wir mit meine
  // mahlzeiten verschmelzen."*
  //
  // `[cmd]` **Die Kachel *Mahlzeitenstruktur* ist weg** — mit ihr
  // der Kommentarblock, der die drei Spalten begruendete.
  //
  // `[read]` **Was G-99 sichert, gilt unveraendert:** sie haben KEIN
  // Feld. **Der Waechter prueft jetzt nur noch das** — die
  // Begruendung steht im Punkt G-99, nicht mehr im Quelltext einer
  // Kachel, die es nicht gibt.
  const ohne = ohneKommentare(PREFS)
  for (const spalte of ['cooking_skill', 'prep_time_max_min', 'budget_level']) {
    assert.ok(!ohne.includes(spalte),
      `${spalte} hat ein Feld — es kann heute nichts bewirken`)
  }
})

// ══ 2 · Drei wirken ══════════════════════════════════════════════════

test('G-72/G-335: die Mahlzeitenzahl kommt aus der Slotliste', () => {
  // ══ BERICHTIGT IN G-335 ═════════════════════════
  //
  // `[cmd]` **Hier standen Felder fuer `meals_per_day` und
  // `snacks_per_day`.** `[cmd]` **Daneben standen fuenf benannte
  // Zeilen** — **zwei Wahrheiten ueber dieselbe Zahl.**
  //
  // `[read]` **Die Slotliste ist die genauere** — sie kennt Anzahl,
  // Namen UND Zeiten. **Die zwei Zahlenfelder sind weg.**
  const p = ohneKommentare(PREFS)
  assert.doesNotMatch(p, /data-probe="meals-per-day"/,
    'das Feld fuer die Mahlzeitenzahl ist zurueck — zwei Wahrheiten')
  assert.doesNotMatch(p, /data-probe="snacks-per-day"/,
    'das Snack-Feld ist zurueck')

  // `[read]` **`meal_prep_ok` bleibt** — der Auftrag sagt es, und
  // Vorkochen ist keine Mahlzeitenzahl.
  assert.match(p, /data-probe="meal-prep-ok"/, 'Vorkochen ist verschwunden')
  assert.match(p, /meal_prep_ok: e\.target\.checked/,
    'Vorkochen wird nicht mehr gespeichert')

  // `[cmd]` **Und die Slotliste steht da**, wo die Zahlen standen.
  assert.match(p, /<SlotsFormular start=\{d\.slots\}/,
    'die Slotliste fehlt — dann gibt es gar keine Mahlzeitenzahl mehr')
})

test('G-72/G-335: die Diary-Reihen folgen der Slotliste', () => {
  // ══ BERICHTIGT IN G-335 ═════════════════════════
  //
  // `[cmd]` **Hier stand, dass der Wirkungssatz aus `rasterZeilen`
  // kommt** — der Satz gehoerte zur Kachel, die es nicht mehr gibt.
  //
  // `[cmd]` **Gemessen: `meals_per_day` hatte genau zwei
  // Verwendungen** — die Kachel und `page.tsx:195`.
  //
  // `[read]` **Was bleibt, ist die Wirkung:** hat der Nutzer Slots,
  // bestimmen SIE die Reihen. **Sonst `rasterZeilen`** — der
  // Rueckfall fuer Nutzer ohne Slots.
  const s = ohneKommentare(SEITE)
  assert.match(s, /if \(mahlzeitSlots\.length > 0\) \{\s*\n\s*slots = SLOTS\.slice\(0, mahlzeitSlots\.length\)/,
    'die Diary-Reihen folgen der Slotliste nicht')
  assert.match(s, /rasterZeilen\(g\.meals_per_day, g\.snacks_per_day\)\.zeilen/,
    'der Rueckfall fuer Nutzer ohne Slots ist weg')
})

test('G-72: das Tagebuch hört auf die Vorlieben', () => {
  // `[cmd]` **Hier stand eine feste Liste aus fünf Slots** — wer zwei
  // Mahlzeiten isst, sah trotzdem fünf leere Karten.
  const d = ohneKommentare(DIARY)
  assert.match(d, /const reihen: MealType\[\] = slots && slots\.length > 0/,
    'das Tagebuch nimmt die Slots nicht entgegen')
  assert.match(d, /const leereSlots = reihen\.filter\(/,
    'die leeren Karten kommen nicht aus den Reihen')

  // `[read]` **Die Vorlage bleibt als Rückfall** — eine zu lange
  // Liste ist besser als eine leere.
  assert.match(d, /: VORLAGE\b/,
    'ohne lesbare Vorlieben bleibt die Liste leer')

  // `[cmd]` **Und die Seite lädt sie** — dieselbe Funktion wie der
  // Planner.
  const s = ohneKommentare(SEITE)
  assert.match(s, /rasterZeilen\(g\.meals_per_day, g\.snacks_per_day\)\.zeilen/,
    'die Seite rechnet die Reihen nicht aus den Vorlieben')
  assert.match(s, /slots=\{slots\}/, 'die Reihen werden nicht durchgereicht')
})

test('G-72: rasterZeilen rechnet, was der Satz behauptet', () => {
  // `[cmd]` **dev: `meals_per_day` 4, `snacks_per_day` 1** — am
  // 2026-09-02 gemessen, und im Tagebuch stehen vier Slots.
  const vier = rasterZeilen(4, 1)
  assert.deepEqual(vier.zeilen, ['breakfast', 'lunch', 'dinner', 'snack'])

  // Zwei Mahlzeiten ohne Snack: zwei Reihen.
  assert.deepEqual(rasterZeilen(2, 0).zeilen, ['breakfast', 'lunch'])

  // `[read]` **Ohne Angabe die Vorlage** — nicht null Reihen.
  assert.ok(rasterZeilen(null, null).zeilen.length > 0,
    'ohne meals_per_day bleibt die Liste leer')
})

test('G-72: die Einstellungen verweisen, statt zweitzuschreiben', () => {
  // `[cmd]` **Gemessen: das Formular schreibt nach `/api/profile`**
  // (`user_profiles`), **die Struktur liegt in
  // `nutrition.food_preferences`.**
  //
  // `[read]` **Zwei Formulare, die dieselbe Spalte setzen, laufen bei
  // jedem Speichern gegeneinander.**
  const s = ohneKommentare(SETTINGS)
  assert.match(s, /data-probe="struktur-verweis"/, 'der Verweis fehlt')
  assert.match(s, /\/v2\/nutrition\?tab=prefs/,
    'der Verweis führt nicht zu den Vorlieben')

  // Die Wirkung: KEIN zweites Eingabefeld.
  for (const spalte of ['meals_per_day', 'snacks_per_day', 'meal_prep_ok']) {
    assert.ok(!s.includes(spalte),
      `${spalte} wird in den Einstellungen zweitgeschrieben`)
  }
})

// ══ 3 · Zwei bleiben liegen ══════════════════════════════════════════

test('G-72: planner_notes wird gespeichert, nicht ausgewertet', () => {
  const p = ohneKommentare(PREFS)
  assert.match(p, /data-probe="planner-notes"/, 'das Notizfeld fehlt')
  assert.match(p, /planner_notes: e\.target\.value/,
    'die Notiz wird nicht gespeichert')

  // `[read]` **Der Hinweis sagt, dass sie noch nichts bewirkt** —
  // statt eine Wirkung zu versprechen, die es nicht gibt.
  const roh = lies(PREFS)
  assert.match(roh, /noch nicht\s*\n?\s*ausgewertet/,
    'der Hinweis verschweigt, dass die Notiz nicht ausgewertet wird')
})

test('G-72: preferred_cuisines bleibt bewusst weg', () => {
  // `[cmd]` **Sie steht in der Datenbank** (`{mediterranean}` auf
  // dev), **hier aber nicht** — E-47.
  //
  // `[cmd]` **BERICHTIGT in G-335:** der Schnitt hing an der Kachel
  // *Mahlzeitenstruktur*, die es nicht mehr gibt. **Jetzt ueber die
  // ganze Datei** — die Zusage ist ohnehin eine Abwesenheit.
  const p = ohneKommentare(PREFS)
  assert.ok(!p.includes('preferred_cuisines'),
    'preferred_cuisines hat ein Feld bekommen — E-47 laesst sie liegen')
})

// ══ 4 · G-322: die Bauteile ══════════════════════════════════════════

test('G-322: tab-foods exportiert seine Bauteile', () => {
  // `[cmd]` **Bis G-322 exportierte die Datei GENAU EIN Bauteil.**
  // `[cmd]` **Die Folge: G-320 musste die Trefferliste neu bauen.**
  const f = lies(FOODS)
  const bauteile = [
    'PILLEN', 'SEITE_GROESSE', 'FILTERGRUPPEN', 'UNVERTRAEGLICH_LABEL',
    'filterLabel', 'FilterChip', 'facettenZahl', 'SortKopf', 'zahl', 'makro',
  ]
  for (const b of bauteile) {
    assert.match(f, new RegExp(`export (const|function) ${b}\\b`),
      `${b} ist nicht exportiert`)
  }

  // `[read]` **Gezählt, nicht gesucht** — elf Exporte: die zehn plus
  // der Reiter selbst.
  const zahlExporte = (f.match(/^export (const|function|type) /gm) ?? []).length
  assert.equal(zahlExporte, 11,
    `${zahlExporte} Exporte — erwartet 11 (10 Bauteile + NutritionFoodsTab)`)
})

test('G-322: DaumenKnoepfe war nie in tab-foods', () => {
  // `[cmd]` **Der G-320-Kommentar zählte sie fälschlich mit.**
  // `[cmd]` **Sie steht seit jeher in `daumen.tsx`** und wird
  // importiert.
  //
  // `[read]` **Die Berichtigung gehört geprüft** — sonst steht die
  // falsche Zahl in zwei Dateien und niemand misst nach.
  const f = ohneKommentare(FOODS)
  assert.match(f, /import \{ DaumenKnoepfe, type Daumen \} from '\.\/daumen'/,
    'DaumenKnoepfe wird nicht aus daumen.tsx importiert')
  assert.ok(fs.existsSync(path.join(WURZEL, 'apps/web/src/app/v2/nutrition/daumen.tsx')),
    'daumen.tsx gibt es nicht')

  // Und das Suchmodal nennt die Zahl nicht mehr falsch.
  const m = lies('apps/web/src/app/v2/nutrition/food-such-modal.tsx')
  assert.match(m, /BERICHTIGT in G-322/,
    'der falsche G-320-Kommentar steht noch unberichtigt da')
})
