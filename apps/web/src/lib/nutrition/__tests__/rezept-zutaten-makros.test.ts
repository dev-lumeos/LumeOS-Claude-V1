/**
 * G-323 / G-325 — das Suchmodal im Rezept, und die Makros je Zutat.
 *
 * **Tom, 2026-09-02:** *„das modal ist perfekt, wieso nutzen wir das
 * nicht auch fuer rezepte? anstatt das pulldown wo nur kalorien
 * zeigt."*
 *
 * **Und:** *„die einzelpositionen sollen die makros anzeigen wenn man
 * da editiert weiss man nichts mehr."*
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
import { summeVon, type ZutatEntwurf } from '../rezept-lage'

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

const REZEPTE = 'apps/web/src/app/v2/nutrition/rezepte-echt.tsx'
const LESEN = 'apps/web/src/lib/nutrition/rezept-lesen.ts'
const MODAL = 'apps/web/src/app/v2/nutrition/food-such-modal.tsx'
const CSS = 'packages/ui/src/styles/v2.css'

test('die Dateiproben finden ihre Dateien — unabhängig vom Startort', () => {
  for (const f of [REZEPTE, LESEN, MODAL, CSS]) {
    assert.ok(fs.existsSync(path.join(WURZEL, f)), `${f} nicht gefunden`)
    assert.ok(lies(f).length > 500, `${f} ist verdächtig kurz`)
  }
  assert.ok(fs.existsSync(path.join(WURZEL, 'pnpm-workspace.yaml')),
    `WURZEL zeigt nicht auf das Repo: ${WURZEL}`)
})

// ══ G-323: keine zweite Suche mehr ═══════════════════════════════════

test('G-323: ZutatSuche ist entfernt, nicht auskommentiert', () => {
  // `[cmd]` **95 Zeilen mit eigenem `fetch`, eigener Trefferliste.**
  // `[cmd]` **Ihr fehlten ALLE ACHT Lehren** (in G-320 gemessen).
  //
  // `[read]` **A-59: entfernt, nicht auskommentiert** — deshalb wird
  // MIT Kommentaren geprüft: ein auskommentierter Block fiele hier
  // durch.
  const roh = lies(REZEPTE)
  assert.doesNotMatch(roh, /function ZutatSuche\(/,
    'ZutatSuche lebt weiter — auch auskommentiert ist sie da')

  // `[cmd]` **Und sie ruft die Suchroute nicht mehr selbst.**
  const r = ohneKommentare(REZEPTE)
  assert.doesNotMatch(r, /\/api\/nutrition\/foods/,
    'die Rezeptseite ruft die Suchroute selbst — das ist die zweite Suche')
  assert.match(r, /<FoodSuchModal/,
    'das Suchmodal wird nicht benutzt')
})

test('G-323: der Knopf öffnet das Modal, kein Feld täuscht Eingabe vor', () => {
  // `[read]` **Dieselbe Form wie im Planner (G-321)** — ein Feld mit
  // Platzhalter würde eine Eingabe versprechen, die es nicht gibt.
  const r = ohneKommentare(REZEPTE)
  assert.match(r, /data-probe="zutat-suchen"/, 'der Suchknopf fehlt')
  const i = r.indexOf('data-probe="zutat-suchen"')
  const block = r.slice(Math.max(0, i - 200), i + 400)
  assert.match(block, /onClick=\{\(\) => setSuchen\(true\)\}/,
    'der Knopf öffnet das Modal nicht')
  assert.match(r, /\{suchen && \(\s*<FoodSuchModal/,
    'das Modal hängt an keinem Zustand')
})

test('G-323: der Rezeptkontext trägt kein Tagesziel', () => {
  // **Der Auftrag:** *„Miss, ob SuchKontext das trennen kann oder ob
  // es ein Feld braucht."*
  //
  // `[cmd]` **Gemessen: er konnte es nicht** — `datum`, `slot` und
  // `ziel` waren Pflichtfelder, und der Anzeigeblock schrieb *„am
  // {datum}"*. `[read]` **Für ein Rezept wäre beides falsch.**
  const r = ohneKommentare(REZEPTE)
  const i = r.indexOf('<FoodSuchModal')
  const auf = r.slice(i, r.indexOf('/>', i))
  assert.match(auf, /art: 'rezept'/,
    'das Rezept ruft das Modal im Tagesmodus')
  assert.match(auf, /rezeptName: name/,
    'der Kontext nennt das Rezept nicht')
  assert.match(auf, /zutaten: zutaten\.length/,
    'der Kontext sagt nicht, was schon drin ist')
  // `[read]` **Kein Tagesziel, kein Datum, keine Mahlzeit.**
  for (const feld of ['ziel:', 'datum:', 'slot:']) {
    assert.ok(!auf.includes(feld),
      `der Rezeptkontext trägt „${feld}" — ein Rezept hat das nicht`)
  }

  // `[cmd]` **Und das Modal unterscheidet die beiden Fälle** — sonst
  // hilft der Typ nichts.
  const m = ohneKommentare(MODAL)
  assert.match(m, /export type RezeptKontext = \{/,
    'es gibt keinen eigenen Rezeptkontext')
  assert.match(m, /kontext\.art === 'tag' \?/,
    'die Anzeige unterscheidet die beiden Fälle nicht')
  // Die Tageslage wird im Rezeptfall gar nicht erst gerechnet.
  assert.match(m, /kontext\.art === 'tag'\s*\n?\s*\? tagesLage\(/,
    'die Tageslage wird auch für Rezepte gerechnet — sie hat dort keine Bedeutung')
})

// ══ G-325: die Makros je Zutat ═══════════════════════════════════════

test('G-325: die Zutatenzeile zeigt Menge und vier Makros', () => {
  // **Tom:** *„das eingabefeld gramm kleiner dafuer alle makros
  // sauber auflisten von der menge die eingegeben wird."*
  const r = ohneKommentare(REZEPTE)
  assert.match(r, /data-probe="zutat-zeile"/, 'die Zutatenzeile ist nicht markiert')
  assert.match(r, /data-probe="zutat-makros"/, 'die Makros fehlen')

  // `[cmd]` **Gerechnet mit `vorschauFuer`** — dieselbe Funktion wie
  // im Suchmodal, kein zweiter Rechenweg.
  assert.match(r, /vorschauFuer\(\{[\s\S]{0,200}?\}, x\.amount_g\)/,
    'die Makros werden nicht aus der eingegebenen Menge gerechnet')

  // `[read]` **Alle vier stehen da** — gezählt, nicht gesucht.
  const i = r.indexOf('data-probe="zutat-makros"')
  const block = r.slice(i, r.indexOf('</span>', r.indexOf('trash', i)))
  for (const w of ['m.kcal', 'm.protein', 'm.fett', 'm.kh']) {
    assert.ok(block.includes(w), `${w} fehlt in der Zeile`)
  }
  // `[read]` **Ein Strich heisst „nicht ermittelbar", nicht 0.**
  const striche = (block.match(/=== null \? '—'/g) ?? []).length
  assert.equal(striche, 4,
    `${striche} von 4 Werten schreiben bei null einen Strich`)
})

test('G-325: das Grammfeld ist schmal — und flex:none macht es wirksam', () => {
  // `[cmd]` **`.v2-feld` setzt `flex: 1`** (v2.css:1396). `[cmd]`
  // **Ohne `flex: 'none'` war das Feld 262 px breit statt 56** — am
  // 2026-09-02 am Schirm gemessen.
  const r = ohneKommentare(REZEPTE)
  assert.match(r, /style=\{\{ width: 56, flex: 'none' \}\}/,
    'das Grammfeld ist nicht schmal oder wächst wieder')

  // `[read]` **Die Ursache wird mitgeprüft** — wäre `.v2-feld` kein
  // Flex-Kind mehr, wäre die Begründung hinfällig.
  const css = lies(CSS)
  const i = css.indexOf('.v2-feld {')
  assert.ok(i > 0, '.v2-feld gibt es nicht mehr')
  assert.match(css.slice(i, css.indexOf('}', i)), /flex:\s*1/,
    '.v2-feld setzt kein flex:1 mehr — G-325s Begründung neu prüfen')
})

test('G-325: der Leseweg liefert die Werte je 100 g', () => {
  // `[cmd]` **Ohne sie zeigten bestehende Rezepte vier Striche** —
  // am 2026-09-02 gemessen, bevor es verdrahtet war.
  const l = ohneKommentare(LESEN)
  assert.match(l, /enercc_100: number \| null/,
    'RezeptZutat trägt keine Nährwerte je 100 g')
  assert.match(l, /rpc\(\s*'food_nutrient_snapshot'/,
    'die Werte kommen nicht aus food_nutrient_snapshot')
  assert.match(l, /p_amount_g: 100/,
    'die Werte werden nicht auf 100 g bezogen')

  // `[read]` **Gleichzeitig, nicht je Zutat** — sonst kostet jede
  // Zeile eine Rundreise (G-252).
  assert.match(l, /await Promise\.all\(foodIds\.map\(id => db\.rpc\(/,
    'die Nährwerte werden nacheinander geholt')

  // `[cmd]` **Und das Formular reicht sie durch** — hier stand
  // viermal `null`.
  const r = ohneKommentare(REZEPTE)
  assert.match(r, /enercc_100: x\.enercc_100/,
    'das Formular verwirft die gelesenen Nährwerte')
  assert.doesNotMatch(r, /enercc_100: null, prot625_100: null/,
    'das Formular setzt die Nährwerte wieder auf null')
})

// ══ Die Rechnung ═════════════════════════════════════════════════════

test('G-325: die Zeilenwerte stimmen mit food_nutrient_snapshot', () => {
  // `[cmd]` **Am 2026-09-02 gegen die Datenbank geprüft**, Rezept
  // „Banane-Joghurt-Haferflocken" auf `dev@lumeos.app`:
  //
  //     Hafer Flocken   80 g   278.4 kcal  10.6 P   5.3 F   42.6 C
  //     Joghurt        250 g   120.0 kcal  13.2 P   0.3 F   14.6 C
  //     Banane roh     120 g    94.8 kcal   1.6 P   0.5 F   19.1 C
  //
  // `[read]` **Die Zahlen stehen hier, damit die Zusage messbar ist.**
  const hafer = { enercc: 348, prot625: 13.24, fat: 6.66, cho: 53.3 }
  const v = vorschauFuer(hafer, 80)
  assert.equal(v.kcal, 278.4, 'die kcal weichen vom Snapshot ab')
  assert.equal(v.protein, 10.6)
  assert.equal(v.fett, 5.3)
  assert.equal(v.kh, 42.6)

  // `[cmd]` **Und bei 300 g** — am Schirm gemessen: 1.044 / 39,7 /
  // 20,0 / 159,9.
  const w = vorschauFuer(hafer, 300)
  assert.equal(w.kcal, 1044)
  assert.equal(w.protein, 39.7)
  assert.equal(w.fett, 20)
  assert.equal(w.kh, 159.9)
})

test('G-325: die Summe bleibt die Summe der Zeilen', () => {
  // **Der Auftrag:** *„Summe — bleibt die Summe der Zeilen."*
  //
  // `[read]` **Zwei Rechenwege für dieselbe Zahl sind zwei
  // Wahrheiten.** `summeVon` und `vorschauFuer` müssen
  // zusammenpassen, sonst zeigt die Zeile etwas anderes als die
  // Summe darunter.
  const zutaten: ZutatEntwurf[] = [
    {
      food_id: 'a', name: 'Hafer', amount_g: 80,
      enercc_100: 348, prot625_100: 13.24, fat_100: 6.66, cho_100: 53.3,
    },
    {
      food_id: 'b', name: 'Joghurt', amount_g: 250,
      enercc_100: 48, prot625_100: 5.28, fat_100: 0.12, cho_100: 5.84,
    },
  ]
  const summe = summeVon(zutaten)
  const zeilen = zutaten.map(z => vorschauFuer({
    enercc: z.enercc_100, prot625: z.prot625_100,
    fat: z.fat_100, cho: z.cho_100,
  }, z.amount_g))

  const addiert = (w: (v: typeof zeilen[0]) => number | null) =>
    Math.round(zeilen.reduce((s, z) => s + (w(z) ?? 0), 0) * 10) / 10

  assert.equal(summe.kcal, addiert(z => z.kcal),
    'die Summe weicht von den Zeilen ab')
  assert.equal(summe.protein, addiert(z => z.protein))
  assert.equal(summe.fett, addiert(z => z.fett))
  assert.equal(summe.kohlenhydrate, addiert(z => z.kh))
})

test('G-325: eine Zutat ohne Werte macht die Summe unbestimmbar', () => {
  // `[read]` **`null` heisst nicht ermittelbar, nicht 0** — hat EINE
  // Zutat keinen Wert, ist die Summe unvollständig und sagt es
  // (`bls-fehlend-heisst-nicht-null`).
  const summe = summeVon([
    {
      food_id: 'a', name: 'Hafer', amount_g: 80,
      enercc_100: 348, prot625_100: 13.24, fat_100: 6.66, cho_100: 53.3,
    },
    {
      food_id: 'b', name: 'Lücke', amount_g: 100,
      enercc_100: null, prot625_100: null, fat_100: null, cho_100: null,
    },
  ])
  assert.equal(summe.kcal, null, 'aus einer Lücke wurde eine Zahl')

  // Und die Zeile selbst zeigt einen Strich, keine 0.
  const v = vorschauFuer(
    { enercc: null, prot625: null, fat: null, cho: null }, 100)
  assert.equal(v.kcal, null, 'eine Zutat ohne Wert zeigt 0 statt eines Strichs')
})
