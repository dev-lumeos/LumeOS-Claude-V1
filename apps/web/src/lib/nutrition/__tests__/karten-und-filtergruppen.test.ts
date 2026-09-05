/**
 * G-136 / G-134 — vier Karten statt *Sonstige*, drei Filterfragen.
 *
 * **E-48:** `WATER`, `OA`, `ALC` bekommen eigene Karten, `ASH` geht
 * zu den Elementen — **aber keines davon als `parent_code`.**
 *
 * **E-49:** `diet` mischt Ernährungsform, Nährwert und Verarbeitung.
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
  KARTEN_REIHENFOLGE, KARTEN_ERKLAERUNG, karteFuerWurzel,
} from '../naehrstoff-anzeige'

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

const TAB = 'apps/web/src/app/v2/nutrition/naehrstoff-ordnung-tab.tsx'
const FOODS = 'apps/web/src/app/v2/nutrition/tab-foods.tsx'
const INSIGHTS = 'apps/web/src/lib/nutrition/insights-read.ts'

test('die Dateiproben finden ihre Dateien — unabhängig vom Startort', () => {
  for (const f of [TAB, FOODS, INSIGHTS]) {
    assert.ok(fs.existsSync(path.join(WURZEL, f)), `${f} nicht gefunden`)
    assert.ok(lies(f).length > 500, `${f} ist verdächtig kurz`)
  }
  assert.ok(fs.existsSync(path.join(WURZEL, 'pnpm-workspace.yaml')),
    `WURZEL zeigt nicht auf das Repo: ${WURZEL}`)
})

// ══ G-136 / E-48: die vier Wurzeln ═══════════════════════════════════

test('G-136: die vier Wurzeln bekommen ihre Karte', () => {
  // `[cmd]` **Gemessen am 2026-09-02:** `WATER`, `ALC`, `OA` und
  // `ASH` tragen alle `group_de = 'Makronährstoffe'` und fielen damit
  // in die Sammelkarte *Sonstige*.
  //
  // `[read]` **Die Wirkung, nicht das Wort:** die Funktion, die die
  // Karte vergibt, wird gerufen.
  assert.equal(karteFuerWurzel('WATER', 'Makronährstoffe'), 'Wasser')
  assert.equal(karteFuerWurzel('OA', 'Makronährstoffe'), 'Organische Säuren')
  assert.equal(karteFuerWurzel('ALC', 'Makronährstoffe'), 'Genussmittel')
  assert.equal(karteFuerWurzel('ASH', 'Makronährstoffe'), 'Elemente')

  // `[read]` **Und *Sonstige* bleibt** — eine stumm weggelassene
  // Wurzel wäre derselbe Fehler wie eine Null statt eines
  // Fehlzählers. `[cmd]` **Am 2026-09-02 fällt nur noch `CHORL`
  // (Cholesterin) hinein.**
  // ══ BERICHTIGT IN G-343 (E-63) ══════════════════════════════
  //
  // `[cmd]` **Hier stand `('CHORL', 'Sonstige Nährstoffe') ===
  // 'Sonstige'`** — grün, obwohl die Gruppe live nicht mehr
  // existiert (0 Zeilen in `nutrient_defs`).
  //
  // `[read]` **Der Test reichte die Gruppe selbst hinein** — damit
  // prüfte er seine eigene Annahme, nicht den Bestand.
  assert.equal(karteFuerWurzel('CHORL', 'Fettbegleitstoffe'),
    'Fettbegleitstoffe', 'CHORL gehoert zu den Fettbegleitstoffen (E-63)')
  assert.equal(karteFuerWurzel('NT', 'Makronährstoffe'), 'Protein',
    'NT faellt wieder in einen Rest (E-63)')
})

test('G-136: FIBT bleibt bei den Kohlenhydraten, ohne parent_code', () => {
  // **Der Auftrag:** *„FIBT bleibt bei den Kohlenhydraten, ABER nicht
  // als Kind von CHO."*
  //
  // `[cmd]` **G-291 hat gemessen, warum:** als Kind gerechnet ergäben
  // die Teile **320,78 gegen 281,86** — mehr als das Ganze, und die
  // Differenz wäre negativ.
  assert.equal(karteFuerWurzel('FIBT', 'Makronährstoffe'), 'Kohlenhydrate')
  assert.equal(karteFuerWurzel('CHO', 'Makronährstoffe'), 'Kohlenhydrate')

  // `[cmd]` **Die Hierarchie hält es getrennt:** im Makro-Baum steht
  // `FIBT` als eigener Knoten NEBEN `CHO`, nicht in dessen Kinderliste.
  const i = ohneKommentare(INSIGHTS)
  assert.match(i, /knoten\('CHO', \[knoten\('SUGAR'\), knoten\('STARCH'\), knoten\('POLYL'\)\]\),\s*\n\s*knoten\('FIBT'\),/,
    'FIBT steht nicht als eigener Knoten neben CHO')
})

test('G-136: Karte und Hierarchie sind getrennt', () => {
  // **Der Auftrag:** *„Kein `parent_code` für FIBT oder ASH."*
  //
  // `[read]` **Diese Datei vergibt Karten** — sie darf keine
  // Hierarchie setzen. `[cmd]` **Ein `parent_code` hier wäre die
  // Vermischung, die E-48 ausschliesst.**
  const a = ohneKommentare('apps/web/src/lib/nutrition/naehrstoff-anzeige.ts')
  assert.doesNotMatch(a, /parent_code/,
    'die Kartenzuordnung fasst die Hierarchie an')

  // `[cmd]` **Und `ASH` steht in keiner Kinderliste** — sonst zählte
  // die Elemente-Karte Summe UND Bestandteile.
  const i = ohneKommentare(INSIGHTS)
  assert.doesNotMatch(i, /knoten\('ASH'/,
    'ASH ist ein Knoten im Baum geworden — dann zählt es doppelt')
})

test('G-136: die Karten stehen in fester Reihenfolge', () => {
  // `[read]` **Die neuen stehen VOR *Sonstige*** — die Sammelkarte
  // ist das Ende, nicht die Mitte.
  //
  // ══ NACHGEZOGEN IN G-343 (E-63) ═════════════════════════════
  //
  // `[cmd]` **Hier standen elf Karten.** `[cmd]` **`Fettbegleitstoffe`
  // fehlte** — die Gruppe steht seit dem 02.09. live, `CHORL` traegt
  // sie, und `naehrstoff-ordnung.ts:620` gab ihr deshalb den
  // Sortierwert `length`: **am Schirm stand sie als LETZTE, hinter
  // *Genussmittel*.**
  //
  // `[read]` **E-63 sagt, wohin:** *„Sichtbar bei den Lipiden"* —
  // **direkt hinter *Fette*, wie `FIBT` bei den Kohlenhydraten.**
  const erwartet = [
    'Kohlenhydrate', 'Fette', 'Fettbegleitstoffe', 'Protein',
    'Fettlösliche Vitamine', 'Wasserlösliche Vitamine',
    'Elemente', 'Energie',
    'Wasser', 'Organische Säuren', 'Genussmittel',
    'Sonstige',
  ]
  assert.deepEqual([...KARTEN_REIHENFOLGE], erwartet,
    'die Kartenreihenfolge stimmt nicht')
  assert.equal(KARTEN_REIHENFOLGE[KARTEN_REIHENFOLGE.length - 1], 'Sonstige',
    '*Sonstige* steht nicht am Ende')
})

test('G-136: die Erklärungen stehen nur, wo der Name irreführt', () => {
  // `[read]` **Vier von elf Karten tragen einen Satz.** `[read]`
  // **Ein Satz, der nichts hinzufügt, wird beim Lesen übersprungen
  // und macht die nächsten wertlos.**
  const mit = Object.keys(KARTEN_ERKLAERUNG).sort()
  assert.deepEqual(mit, ['Elemente', 'Genussmittel', 'Organische Säuren', 'Wasser'],
    `Erklärungen stehen bei ${JSON.stringify(mit)}`)

  // `[cmd]` **Der ASH-Satz nennt, was der Auftrag verlangt:** Summe
  // der Mineralstoffe, über 500 Grad, keine Energie.
  const ash = KARTEN_ERKLAERUNG.Elemente
  for (const wort of ['Summe aller Mineralstoffe', '500 Grad', 'keine']) {
    assert.ok(ash.includes(wort), `„${wort}" fehlt im Rohasche-Satz`)
  }

  // `[cmd]` **Und der Wasser-Satz verweist auf das Wassermodul** —
  // `hydration.tsx` trägt die Bilanz bereits (`logged_ml` +
  // `food_ml`), hier steht nur der Wasseranteil.
  assert.match(KARTEN_ERKLAERUNG.Wasser, /Wassermodul/,
    'der Wasser-Satz verweist nicht auf die vorhandene Bilanz')
})

test('G-136: die Oberfläche zeigt die Erklärung', () => {
  // `[read]` **Ohne das wäre das Feld folgenlos** — genau der Fall,
  // den `anzeige-geprueft-quelle-vergessen` beschreibt, nur
  // umgekehrt.
  const t = ohneKommentare(TAB)
  assert.match(t, /data-probe="karten-erklaerung"/,
    'die Erklärung wird nicht angezeigt')
  assert.match(t, /\{KARTEN_ERKLAERUNG\[g\.name\] && \(/,
    'die Erklärung hängt nicht am Kartennamen')

  // `[cmd]` **Ausserhalb von `{offen && (`** — wer die Karte
  // zuklappt, soll trotzdem wissen, was sie zeigt.
  const i = t.indexOf('data-probe="karten-erklaerung"')
  const j = t.indexOf('{offen && (')
  assert.ok(i > 0 && j > i,
    'die Erklärung steht im aufgeklappten Teil — zugeklappt ist sie weg')
})

// ══ G-134 / E-49: die drei Filterfragen ══════════════════════════════

test('G-134: halal und kosher sind erreichbar', () => {
  // `[cmd]` **Gemessen am 2026-09-02:** beide Tags stehen seit jeher
  // in `tag_definitions` (`sort_order` 130, 140) — **aber in keiner
  // Filtergruppe.** `[read]` **Ein vorhandener Filter, den niemand
  // findet, ist so gut wie keiner.**
  const f = ohneKommentare(FOODS)
  // `[cmd]` **Der Schnitt endet bei `],`, nicht beim ersten `},`** —
  // jede Option ist selbst ein Objekt und schliesst mit `},`. **Ein
  // Schnitt dorthin traf nur die erste Zeile** und meldete
  // `vegetarian` als fehlend, obwohl es dastand.
  const i = f.indexOf("titel: 'Ernährungsform'")
  assert.ok(i > 0, 'die Ernährungsform-Gruppe fehlt')
  const a = f.indexOf('optionen: [', i)
  const b = f.indexOf('\n    ],', a)
  assert.ok(a > 0 && b > a, 'die Optionsliste hat kein Ende')
  const block = f.slice(a, b)

  for (const code of ['vegan', 'vegetarian', 'halal', 'kosher']) {
    assert.ok(block.includes(`code: '${code}'`),
      `${code} fehlt in der Ernährungsform`)
  }
})

test('G-134: thai_food ist geparkt, mit Vermerk', () => {
  // **E-49:** *„`thai_food` fällt heraus — eine Küche."*
  //
  // `[read]` **Sie steht trotzdem da, bis `preferred_cuisines`
  // kommt** — sonst wäre der Tag unerreichbar. **Aber der Vermerk
  // sagt, dass sie hier nicht hingehört.**
  const f = ohneKommentare(FOODS)
  assert.match(f, /code: 'thai_food'/, 'thai_food ist verschwunden')
  assert.match(f, /label: 'Thai \(Kueche — geparkt\)'/,
    'thai_food steht ohne Vermerk in der Ernährungsform')
})

test('G-134: die drei Fragen stehen getrennt', () => {
  // `[cmd]` **`diet` trägt neun Tags** — vier Nährwertangaben, zwei
  // Ernährungsformen, `halal`, `kosher`, `thai_food`. `[read]` **Die
  // Oberfläche trennt sie; `tag_type` bleibt, wie es ist.**
  const f = ohneKommentare(FOODS)
  const gruppen = Array.from(f.matchAll(/titel: '([^']+)',\s*\n\s*art:/g), m => m[1])
  assert.deepEqual(gruppen, ['Ernährungsform', 'Nährwert', 'Verarbeitung'],
    `die Filtergruppen sind ${JSON.stringify(gruppen)}`)

  // Die Nährwertangaben stehen NICHT bei der Ernährungsform.
  const i = f.indexOf("titel: 'Ernährungsform'")
  const a = f.indexOf('optionen: [', i)
  const b = f.indexOf('\n    ],', a)
  const block = f.slice(a, b)
  for (const code of ['high_protein', 'low_carb', 'whole_food']) {
    assert.ok(!block.includes(`code: '${code}'`),
      `${code} steht in der Ernährungsform — das ist eine andere Frage`)
  }
})
