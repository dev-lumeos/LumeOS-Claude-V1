/**
 * G-329 / G-330 — Ghost-Einträge wie normale Einträge.
 *
 * **Tom, 2026-09-02:** *„die ghosteintraege des mealplanners brauchen
 * bearbeiten (fuer manuelle aenderungen) und mealcam (fuer visuelle
 * bestaetigung oder korrektur), und die positionen sollen gleich
 * abgebildet sein wie in den normalen eintraegen."*
 *
 * **Und, präzisiert:** *„es sind FUENF Werte, nicht vier — das
 * Gewicht gehoert dazu."* — *„die spalten muessen senkrecht
 * fluchten."*
 *
 * `[read]` **Die Wächter messen die Wirkung, nicht das Wort** —
 * CLAUDE.md nennt vier Fälle (G-216, G-247, G-246, G-108), in denen
 * einer grün blieb, während die Sache kaputt war.
 */
import assert from 'node:assert/strict'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { test } from 'node:test'

import { vorschauFuer } from '../menge-rechnen'

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

const GHOST = 'apps/web/src/app/v2/nutrition/ghost-eintrag.tsx'
const MAHLZEITEN = 'apps/web/src/app/v2/nutrition/mahlzeiten.tsx'
const LESEN = 'apps/web/src/lib/nutrition/plan-lesen.ts'
const LOGWRITE = 'apps/web/src/lib/nutrition/plan-log-write.ts'

/** Der Tabellenkopf einer Datei — geschnitten, nicht gesucht. */
function spaltenKopf(quelle: string, marke: string): string {
  const i = quelle.indexOf(`data-probe="${marke}"`)
  assert.ok(i > 0, `${marke} nicht gefunden`)
  const j = quelle.indexOf('</thead>', i)
  assert.ok(j > i, `${marke} hat kein Ende`)
  return quelle.slice(i, j)
}

test('die Dateiproben finden ihre Dateien — unabhängig vom Startort', () => {
  for (const f of [GHOST, MAHLZEITEN, LESEN, LOGWRITE]) {
    assert.ok(fs.existsSync(path.join(WURZEL, f)), `${f} nicht gefunden`)
    assert.ok(lies(f).length > 500, `${f} ist verdächtig kurz`)
  }
  assert.ok(fs.existsSync(path.join(WURZEL, 'pnpm-workspace.yaml')),
    `WURZEL zeigt nicht auf das Repo: ${WURZEL}`)
})

// ══ G-330: die Kopfzeile ═════════════════════════════════════════════

test('G-330: die Kopfsumme trägt fünf Werte', () => {
  // **Tom:** *„dann zaehlt die auch fuer den inhalt."*
  //
  // `[cmd]` **Hier stand *413 kcal · 23g P*** — zwei von fünf.
  // `[cmd]` **Das Gewicht gehört dazu** — Tom: *„die einzige Angabe,
  // die man direkt nachwiegen kann."*
  const m = ohneKommentare(MAHLZEITEN)

  // Die Wirkung: die Summe rechnet alle fünf.
  assert.match(m, /g: a\.g \+ \(it\.amount_g \?\? 0\)/,
    'die Summe zählt das Gewicht nicht')
  assert.match(m, /k: a\.k \+ \(it\.cho \?\? 0\)/,
    'die Summe zählt die Kohlenhydrate nicht')
  assert.match(m, /f: a\.f \+ \(it\.fat \?\? 0\)/,
    'die Summe zählt das Fett nicht')

  // `[read]` **Und alle fünf stehen in der Kopfzeile** — gezählt,
  // nicht gesucht.
  const i = m.indexOf('data-probe="kopf-summe"')
  assert.ok(i > 0, 'die Kopfsumme ist nicht markiert')
  const block = m.slice(i, m.indexOf('</span>', m.indexOf('.map', i)))
  for (const w of ['summe.g', 'summe.kcal', 'summe.p', 'summe.k', 'summe.f']) {
    assert.ok(block.includes(w), `${w} fehlt in der Kopfzeile`)
  }
})

test('G-330: die Beschriftung steht in der Tabelle, nicht in der Kopfzeile', () => {
  // **Tom:** *„die spalten muessen senkrecht fluchten: die
  // Ueberschrift steht ueber derselben Spalte wie der Einzelwert
  // darunter."*
  //
  // `[cmd]` **Ein erster Versuch setzte sie in die Kopfzeile, mit
  // gerechnetem Abstand.** `[cmd]` **Gemessen: 66 px daneben** —
  // rechts der Summe stehen zwei Knöpfe. **Der Ausgleich verschob
  // dann die ganze Karte.**
  //
  // `[read]` **Im `<thead>` fluchtet sie von selbst** — dieselbe
  // Tabelle, dieselben Spalten, kein gerechneter Abstand.
  const m = ohneKommentare(MAHLZEITEN)
  const kopf = spaltenKopf(m, 'spalten-kopf')

  // Die fünf Kürzel, in Toms Reihenfolge.
  const kuerzel = Array.from(kopf.matchAll(/>([A-Z]+)<\/th>/g), x => x[1])
  assert.deepEqual(kuerzel, ['G', 'KCAL', 'P', 'K', 'F'],
    `die Spalten heissen ${JSON.stringify(kuerzel)} — erwartet G/KCAL/P/K/F`)

  // `[cmd]` **Dieselben Breiten wie die Positionszeile** — sonst
  // fluchtet nichts.
  for (const b of [44, 58, 40, 40, 40]) {
    assert.ok(kopf.includes(`width: ${b}`),
      `Spaltenbreite ${b} fehlt im Kopf`)
  }

  // `[read]` **Und die Kopfzeile trägt KEINE eigene Beschriftung
  // mehr** — sonst stünde sie zweimal, einmal daneben.
  const i = m.indexOf('data-probe="kopf-summe"')
  const summe = m.slice(i, m.indexOf('</span>', m.indexOf('.map', i)))
  assert.doesNotMatch(summe, /toUpperCase\(\)/,
    'die Kopfzeile beschriftet wieder selbst — das fluchtet nicht')
})

// ══ G-329: dieselbe Zeilenform ═══════════════════════════════════════

test('G-329: die Ghost-Zeile hat dieselben Spalten wie die normale', () => {
  // **Tom:** *„die positionen sollen gleich abgebildet sein wie in
  // den normalen eintraegen."*
  //
  // `[cmd]` **Vorher: Name, Mengenfeld, kcal** — drei Angaben.
  const g = ohneKommentare(GHOST)
  const m = ohneKommentare(MAHLZEITEN)

  const gk = spaltenKopf(g, 'ghost-spalten')
  const mk = spaltenKopf(m, 'spalten-kopf')

  // `[read]` **Die Wirkung: dieselben Kürzel UND dieselben Breiten.**
  const gKuerzel = Array.from(gk.matchAll(/>([A-Z]+)<\/th>/g), x => x[1])
  const mKuerzel = Array.from(mk.matchAll(/>([A-Z]+)<\/th>/g), x => x[1])
  assert.deepEqual(gKuerzel, mKuerzel,
    'Ghost und Diary haben verschiedene Spalten')

  const breiten = (s: string) =>
    Array.from(s.matchAll(/width: (\d+)/g), x => x[1])
  assert.deepEqual(breiten(gk), breiten(mk),
    'Ghost und Diary haben verschiedene Spaltenbreiten — dann fluchtet nichts')
})

test('G-329: die Ghost-Zeile rechnet aus der eingegebenen Menge', () => {
  // `[read]` **Das Mengenfeld bleibt** — ein Ghost-Eintrag ist ein
  // Vorschlag, den man ändern darf.
  //
  // `[cmd]` **Deshalb Werte je 100 g, nicht je Menge** — ein fester
  // Wert wäre nach der ersten Änderung falsch.
  const g = ohneKommentare(GHOST)
  assert.match(g, /vorschauFuer\(\{[\s\S]{0,200}?\},\s*Number\.isFinite\(g\) \? g : 0\)/,
    'die Ghost-Zeile rechnet nicht aus dem Mengenfeld')
  assert.match(g, /const g = Number\(mengen\[p\.food_id\] \?\? p\.amount_g\)/,
    'die Menge kommt nicht aus dem Eingabefeld')

  // `[read]` **Vier Werte, und ein Strich bei `null`.**
  const i = g.indexOf('data-probe="ghost-zeile"')
  const block = g.slice(i, g.indexOf('</tr>', i))
  for (const w of ['m.kcal', 'm.protein', 'm.kh', 'm.fett']) {
    assert.ok(block.includes(w), `${w} fehlt in der Ghost-Zeile`)
  }
  const striche = (block.match(/=== null \? '—'/g) ?? []).length
  assert.equal(striche, 4,
    `${striche} von 4 Werten schreiben bei null einen Strich`)
})

test('G-329: der Ghost-Kopf traegt dieselben fuenf Werte', () => {
  // **Tom, 2026-09-02:** *,,ghost entries haben im header noch keine
  // totals."*
  //
  // `[cmd]` **Der Kopf zeigte NUR kcal** — die Zeilen darunter
  // tragen seit G-329 fuenf Werte.
  const g = ohneKommentare(GHOST)
  assert.match(g, /data-probe="ghost-kopf-summe"/,
    'die Kopfsumme ist nicht markiert')

  const i = g.indexOf('data-probe="ghost-kopf-summe"')
  const block = g.slice(i, g.indexOf('</span>', g.indexOf('.map', i)))
  for (const w of ['summen.g', 'summen.kcal', 'summen.p', 'summen.k', 'summen.f']) {
    assert.ok(block.includes(w), `${w} fehlt im Ghost-Kopf`)
  }
})

test('G-329: der Ghost-Kopf rechnet ueber die BEARBEITETE Liste', () => {
  // `[cmd]` **Vorher rechnete er ueber `eintrag.posten`** — die
  // GEPLANTEN. `[read]` **Eine entfernte Zutat blieb in der Summe,
  // eine hinzugefuegte fehlte** — der Kopf sagte etwas anderes als
  // die Zeilen darunter.
  //
  // `[cmd]` **Am 2026-09-02 gemessen:** 450 g / 493 kcal, nach dem
  // Entfernen der Haferflocken (80 g, 278 kcal) **370 g / 215 kcal**.
  const g = ohneKommentare(GHOST)
  assert.match(g, /const summen = posten\.reduce\(/,
    'die Kopfsumme rechnet nicht ueber die bearbeitete Liste')
  assert.doesNotMatch(g, /const summen = eintrag\.posten\.reduce\(/,
    'die Kopfsumme rechnet wieder ueber die geplanten Posten')

  // `[read]` **Dieselbe Rechnung wie in der Zeile** — sonst
  // widersprechen sich Kopf und Zeilen.
  const i = g.indexOf('const summen = posten.reduce(')
  const block = g.slice(i, g.indexOf('}, { g: 0', i))
  assert.match(block, /vorschauFuer\(/,
    'der Kopf rechnet mit einem zweiten Weg')

  // `[cmd]` **Und die Menge kommt aus dem Eingabefeld**, nicht aus
  // dem Plan — sonst folgte der Kopf einer Mengenaenderung nicht.
  assert.match(block, /Number\(mengen\[p\.food_id\] \?\? p\.amount_g\)/,
    'der Kopf folgt der eingegebenen Menge nicht')
})

test('G-329: der Leseweg liefert die Werte je 100 g', () => {
  // `[cmd]` **Vorher nahm er nur `enercc` und verwarf drei** — die
  // Abfrage lieferte alle vier.
  const l = ohneKommentare(LESEN)
  assert.match(l, /p_amount_g: 100/,
    'die Ghost-Posten bekommen keine Werte je 100 g')
  assert.match(l, /je100JePosten\.set\(/,
    'die Werte je 100 g werden nicht zugeordnet')

  // `[read]` **Gleichzeitig, nicht je Posten** — sonst kostet jede
  // Zeile eine Rundreise (G-252).
  assert.match(l, /const werteJe100 = await Promise\.all\(flach\.map\(/,
    'die Werte werden nacheinander geholt')

  // `[cmd]` **Und alle vier kommen an der Zeile an.**
  for (const f of ['enercc_100:', 'prot625_100:', 'fat_100:', 'cho_100:']) {
    assert.ok(l.includes(f), `${f} fehlt im Leseweg`)
  }
})

// ══ G-329: Bearbeiten ════════════════════════════════════════════════

test('G-329: Zutaten lassen sich entfernen und hinzufügen', () => {
  // **Tom:** *„bearbeiten (fuer manuelle aenderungen)."*
  //
  // `[cmd]` **Vorher liess sich nur die Menge ändern.**
  // `[read]` **Tauschen ist entfernen plus hinzufügen** — deshalb
  // genügen zwei Wege.
  const g = ohneKommentare(GHOST)
  assert.match(g, /data-probe="ghost-entfernen"/, 'der Entfernen-Knopf fehlt')
  assert.match(g, /data-probe="ghost-zutat-suchen"/, 'der Hinzufügen-Knopf fehlt')

  // Die Wirkung: die Liste entsteht aus geplant minus entfernt plus neu.
  assert.match(g, /\[\.\.\.eintrag\.posten\.filter\(p => !entfernt\.has\(p\.food_id\)\), \.\.\.dazu\]/,
    'entfernte und neue Zutaten wirken nicht auf die Liste')

  // `[cmd]` **Und eine Änderung geht als Abweichung mit** — sonst
  // nähme `bestaetigen` die geplanten Posten und die Bearbeitung
  // ginge still verloren.
  assert.match(g, /if \(entfernt\.size > 0 \|\| dazu\.length > 0\) abweichend = true/,
    'entfernte oder neue Zutaten gelten nicht als Abweichung')

  // `[read]` **Keine vierte Suche** — dasselbe Modal wie Planner und
  // Rezept.
  assert.match(g, /<FoodSuchModal/, 'das geteilte Suchmodal wird nicht benutzt')
  assert.doesNotMatch(g, /\/api\/nutrition\/foods/,
    'die Ghost-Karte sucht selbst — das wäre die vierte Suche')
})

test('G-329: Bearbeiten ändert den TAG, nicht den Plan', () => {
  // **Die Auftragsfrage:** *„ändert Bearbeiten den Plan oder nur
  // diesen Tag?"*
  //
  // `[cmd]` **Gemessen am 2026-09-02 im Schreibweg:**
  // `planEintragBestaetigen` schreibt nach `meals` (`createMeal`),
  // `meal_items` (`addMealItem`) und `meal_plan_logs` — **es fasst
  // `meal_plan_entries` nicht an.**
  //
  // `[read]` **Und das ist richtig so:** ein Ghost-Eintrag zeigt eine
  // Planposition, er ist keine. **Wer heute mehr isst, hat nicht den
  // Plan geändert.**
  const w = ohneKommentare(LOGWRITE)
  const i = w.indexOf('export async function planEintragBestaetigen')
  assert.ok(i > 0, 'planEintragBestaetigen nicht gefunden')
  const j = w.indexOf('export async function ', i + 30)
  const rumpf = w.slice(i, j > i ? j : undefined)

  // Die Wirkung: kein Schreibzugriff auf die Planpositionen.
  assert.doesNotMatch(rumpf, /from\('meal_plan_entries'\)[\s\S]{0,120}?\.(update|insert|delete|upsert)\(/,
    'bestaetigen schreibt in meal_plan_entries — dann ändert es den Plan')
  assert.match(rumpf, /addMealItem\(/, 'bestaetigen schreibt nicht ins Tagebuch')
  assert.match(rumpf, /from\('meal_plan_logs'\)/, 'bestaetigen schreibt keinen Log')

  // `[cmd]` **Und die Ghost-Karte selbst schreibt nirgends hin** —
  // ihre Änderungen leben im Zustand und gehen als `mengen` mit.
  const g = ohneKommentare(GHOST)
  assert.doesNotMatch(g, /art: 'eintrag(_aendern)?'/,
    'die Ghost-Karte schreibt in den Plan')
})

// ══ G-329: MealCam ═══════════════════════════════════════════════════

test('G-329: MealCam steht an der Ghost-Karte, mit Vermerk', () => {
  // **Tom:** *„mealcam (fuer visuelle bestaetigung oder korrektur)."*
  // `[cmd]` **Flow 4:** *„confirm via MealCam or manually."*
  //
  // `[read]` **Eine Attrappe an der richtigen Stelle ist besser als
  // keine an der falschen** — aber sie sagt, dass sie eine ist.
  const g = ohneKommentare(GHOST)
  assert.match(g, /data-probe="ghost-mealcam"/, 'der MealCam-Knopf fehlt')
  assert.match(g, /<InEntwicklung/,
    'MealCam täuscht eine Funktion vor, die es nicht gibt')

  // `[cmd]` **Der Vermerk nennt den Grund** — G-276, kein Modell.
  const i = g.indexOf('<InEntwicklung')
  const block = g.slice(i, g.indexOf('/>', i))
  assert.match(block, /G-276/,
    'der Vermerk nennt nicht, woran es hängt')
})

// ══ Die Rechnung ═════════════════════════════════════════════════════

test('G-329: die Zeilenwerte stimmen mit food_nutrient_snapshot', () => {
  // `[cmd]` **Am 2026-09-02 gegen die Datenbank geprüft**, „Hafer
  // Flocken" (348 kcal/100 g) bei 200 g:
  //
  //     food_nutrient_snapshot(…, 200)   696.0 kcal  26.4 P  106.6 K  13.3 F
  //     348 * 200 / 100                  696.0 kcal  26.4 P  106.6 K  13.3 F
  const hafer = { enercc: 348, prot625: 13.2, fat: 6.66, cho: 53.3 }
  const v = vorschauFuer(hafer, 200)
  assert.equal(v.kcal, 696, 'die kcal weichen vom Snapshot ab')
  assert.equal(v.protein, 26.4)
  assert.equal(v.fett, 13.3)
  assert.equal(v.kh, 106.6)

  // Und bei der geplanten Menge von 80 g.
  assert.equal(vorschauFuer(hafer, 80).kcal, 278.4)
})

test('G-329: ein fehlender Nährwert bleibt ein Strich', () => {
  // `[read]` **`bls-fehlend-heisst-nicht-null`** — eine 0 wäre eine
  // Behauptung.
  const v = vorschauFuer(
    { enercc: 348, prot625: null, fat: null, cho: null }, 100)
  assert.equal(v.kcal, 348)
  assert.equal(v.protein, null, 'ein fehlender Wert wurde zu 0')
})
