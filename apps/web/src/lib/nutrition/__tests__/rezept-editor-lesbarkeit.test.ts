/**
 * G-326 — der Rezepteditor und die Detailansicht lesen sich.
 *
 * **Tom, 2026-09-02:** *„name (beschriftungsfeld oben und darunter
 * die ganze breite als namefeld, unnoetig)."* — *„wieso zwei
 * totale?"* — *„detailansicht dasselbe, da muessen die einzelmakros
 * rein und auch die saubere trennung unten."*
 *
 * `[read]` **Die Wächter messen die Wirkung, nicht das Wort** —
 * CLAUDE.md nennt vier Fälle (G-216, G-247, G-246, G-108), in denen
 * einer grün blieb, während die Sache kaputt war.
 */
import assert from 'node:assert/strict'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { test } from 'node:test'

import { jePortion, summeVon, type ZutatEntwurf } from '../rezept-lage'

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

test('die Dateiprobe findet ihre Datei — unabhängig vom Startort', () => {
  assert.ok(fs.existsSync(path.join(WURZEL, REZEPTE)), `${REZEPTE} nicht gefunden`)
  assert.ok(lies(REZEPTE).length > 500, `${REZEPTE} ist verdächtig kurz`)
  assert.ok(fs.existsSync(path.join(WURZEL, 'pnpm-workspace.yaml')),
    `WURZEL zeigt nicht auf das Repo: ${WURZEL}`)
})

// ══ 1+2 · Der Kopf ═══════════════════════════════════════════════════

test('G-326: Name und die vier Felder teilen sich eine Breite', () => {
  // **Tom:** *„name (beschriftungsfeld oben und darunter die ganze
  // breite als namefeld, unnoetig)."*
  //
  // `[cmd]` **Am 2026-09-02 gemessen: Namensfeld 778 px, die vier
  // darunter 598 px.** `[cmd]` **Nach dem Umbau: beide 598.**
  //
  // `[read]` **Die Wirkung, nicht das Wort:** beide liegen in
  // DERSELBEN Hülle, deshalb kann das eine nicht breiter werden als
  // das andere.
  const r = ohneKommentare(REZEPTE)
  assert.match(r, /data-probe="kopf-block"/, 'die gemeinsame Hülle fehlt')
  assert.match(r, /data-probe="kopf-felder"/, 'die Felderreihe ist nicht markiert')

  const i = r.indexOf('data-probe="kopf-block"')
  const j = r.indexOf('data-probe="kopf-felder"')
  assert.ok(i > 0 && j > i,
    'die Felderreihe liegt nicht IN der gemeinsamen Hülle')

  // `[cmd]` **Das Namensfeld liegt dazwischen** — sonst wäre es
  // ausserhalb und könnte wieder über die volle Breite laufen.
  const k = r.indexOf('aria-label="Rezeptname"')
  assert.ok(k > i && k < j,
    'das Namensfeld steht nicht in der gemeinsamen Hülle')

  // `[read]` **`width: '100%'` heisst: so breit wie die Hülle** —
  // eine feste Pixelzahl wäre beim nächsten Umbau schon falsch.
  const block = r.slice(i, j)
  assert.match(block, /style=\{\{ width: '100%' \}\}/,
    'das Namensfeld füllt die Hülle nicht')
})

// ══ 3 · Das Grammfeld ════════════════════════════════════════════════

test('G-326: das Grammfeld trägt vierstellige Mengen', () => {
  // **Tom:** *„56 px zeigen `44(` statt `440`."*
  //
  // `[cmd]` **Mit `4400` und derselben Polsterung gemessen
  // (2026-09-02):**
  //
  //     56 px   scrollWidth 63 > clientWidth 54   abgeschnitten
  //     64 px   scrollWidth 63 > clientWidth 62   abgeschnitten
  //     72 px   scrollWidth 70 = clientWidth 70   passt
  //
  // `[read]` **76, nicht 72** — Reserve für die Zahlenpfeile.
  const r = ohneKommentare(REZEPTE)
  assert.match(r, /style=\{\{ width: 76, flex: 'none' \}\}/,
    'das Grammfeld ist zu schmal oder wächst wieder')

  // `[cmd]` **`flex: 'none'` muss bleiben** — ohne es war das Feld
  // 262 px breit (G-325).
  const i = r.indexOf('width: 76, flex: ')
  assert.ok(i > 0, 'die Breite steht nicht mit flex zusammen')

  // `[read]` **Und die Ursache wird mitgeprüft**: wäre `.v2-feld`
  // kein Flex-Kind mehr, wäre die Begründung hinfällig.
  const css = lies('packages/ui/src/styles/v2.css')
  const j = css.indexOf('.v2-feld {')
  assert.ok(j > 0, '.v2-feld gibt es nicht mehr')
  assert.match(css.slice(j, css.indexOf('}', j)), /flex:\s*1/,
    '.v2-feld setzt kein flex:1 mehr — G-326s Begründung neu prüfen')
})

// ══ 4 · Die Vorschau ═════════════════════════════════════════════════

test('G-326: die Vorschau ist abgesetzt und hat zwei getrennte Spalten', () => {
  // **Tom:** *„eine sichtbare Trennung gegen die Zutatenliste
  // darueber."* — **und** *„zwei erkennbare Spalten mit Trennung
  // dazwischen."*
  const r = ohneKommentare(REZEPTE)
  assert.match(r, /data-probe="vorschau-block"/, 'der Vorschaublock fehlt')
  assert.match(r, /data-probe="spaltentrenner"/, 'die Linie zwischen den Spalten fehlt')

  const i = r.indexOf('data-probe="vorschau-block"')
  const block = r.slice(i, i + 1800)
  // Die Absetzung nach oben.
  assert.match(block, /className="v2-divider"/,
    'die Vorschau ist nicht gegen die Zutatenliste abgesetzt')
  // `[cmd]` **Die Linie hat eine Breite** — ein `div` ohne
  // Hintergrund wäre unsichtbar.
  assert.match(block, /width: 1, background: 'var\(--border\)'/,
    'der Spaltentrenner ist unsichtbar')
})

test('G-326: die Überschriften sagen, was die Spalten sind', () => {
  // **Tom:** *„wieso zwei totale?"* `[read]` **`GESAMT` und `JE
  // PORTION (2)` sagen nicht, dass das eine das andere geteilt durch
  // zwei ist.**
  const r = ohneKommentare(REZEPTE)
  assert.match(r, /Ganzes Rezept \(\$\{z\(zutaten, 0\)\}/,
    'die linke Spalte heisst nicht „Ganzes Rezept" mit Zutatenzahl')
  assert.match(r, /Eine Portion \(von \$\{z\(portionen, 0\)\}\)/,
    'die rechte Spalte sagt nicht, von wie vielen Portionen')

  // `[cmd]` **Die alten Überschriften sind weg** — sonst stünden
  // beide da.
  assert.doesNotMatch(r, /je Portion \(\{z\(portionen, 0\)\}\)/,
    'die alte Überschrift lebt weiter')

  // `[read]` **Die Klammer hängt am Portionenfeld** — sie ist keine
  // feste Zahl.
  assert.doesNotMatch(r, /Eine Portion \(von 2\)/,
    'die Portionenzahl ist fest verdrahtet')
})

// ══ Die Detailansicht ════════════════════════════════════════════════

test('G-326: die Detailansicht zeigt Makros je Zutat', () => {
  // **Tom:** *„detailansicht dasselbe, da muessen die einzelmakros
  // rein."*
  //
  // `[cmd]` **Am 2026-09-02 gemessen, vorher:** *„Hafer Flocken |
  // 80 g"* — Name und Menge, sonst nichts.
  const r = ohneKommentare(REZEPTE)
  assert.match(r, /data-probe="detail-zutat"/, 'die Zutatzeile ist nicht markiert')
  assert.match(r, /data-probe="detail-makros"/, 'die Makros fehlen in der Karte')

  // `[cmd]` **Gerechnet mit `vorschauFuer`** — dieselbe Funktion wie
  // im Editor, kein zweiter Rechenweg.
  const i = r.indexOf('data-probe="detail-zutat"')
  const vor = r.lastIndexOf('vorschauFuer', i)
  assert.ok(vor > 0 && i - vor < 400,
    'die Detailmakros werden nicht mit vorschauFuer gerechnet')

  // `[read]` **Alle vier, und ein Strich bei `null`.**
  const block = r.slice(i, i + 1400)
  for (const w of ['m.kcal', 'm.protein', 'm.fett', 'm.kh']) {
    assert.ok(block.includes(w), `${w} fehlt in der Detailzeile`)
  }
  const striche = (block.match(/=== null \? '—'/g) ?? []).length
  assert.equal(striche, 4,
    `${striche} von 4 Werten schreiben bei null einen Strich`)
})

test('G-326: die Karte ruft DIESELBE Vorschau wie der Editor', () => {
  // **Tom:** *„die karte zeigt nur kcal und protein, im editor
  // stehen vier."*
  //
  // `[cmd]` **Die Karte hatte eine eigene Fassung** — deshalb liefen
  // sie auseinander. `[read]` **Eine zweite Fassung ist immer der
  // Grund, warum zwei Anzeigen Verschiedenes sagen.**
  const r = ohneKommentare(REZEPTE)

  // Die Wirkung: `Vorschau` wird zweimal gerufen, und es gibt nur
  // eine Definition.
  //
  // `[cmd]` **BERICHTIGT in der Sabotageprobe:** hier stand
  // `/<Vorschau/g` — **und `<VorschauKarte` enthält das.** Die
  // Sabotage „Karte ruft eine andere Komponente" kam durch.
  //
  // `[read]` **Das ist der Fehler aus CLAUDE.md** — ein unverankertes
  // Muster aus einem NAMEN (G-187, G-197, G-201). **Ein Bauteilname
  // endet vor `\s`, `/` oder `>`.**
  const rufe = (r.match(/<Vorschau(?=[\s/>])/g) ?? []).length
  assert.equal(rufe, 2,
    `${rufe} von 2 Stellen rufen die geteilte Vorschau (Editor, Karte)`)
  // `[read]` **Auch hier verankert** — `function VorschauKarte(`
  // enthielte `function Vorschau` nicht, weil `(` folgt; die Klammer
  // ist die Verankerung. **Sie steht ausdrücklich da, damit sie beim
  // nächsten Umbau nicht wegfällt.**
  const defs = (r.match(/function Vorschau\(/g) ?? []).length
  assert.equal(defs, 1, `${defs} Definitionen von Vorschau — es darf eine geben`)

  // `[cmd]` **Und die alte Zweiwert-Fassung ist weg.**
  assert.doesNotMatch(r, /<div className="v2-eyebrow" style=\{\{ fontSize: 9 \}\}>je Portion<\/div>/,
    'die eigene Fassung der Karte lebt weiter')
})

// ══ Die Rechnung bleibt unberührt ════════════════════════════════════

test('G-326: eine Portion ist das Rezept geteilt durch n', () => {
  // **Der Auftrag:** *„Keine Werte ändern — die Rechnung stimmt."*
  //
  // `[cmd]` **Am Schirm gemessen (2026-09-02):** 1.746 kcal gesamt,
  // bei 4 Portionen 437 — und 1746 ÷ 4 = 436,5.
  const gesamt = {
    kcal: 1746, protein: 72.9, fett: 30, kohlenhydrate: 268.2,
  }
  const je = jePortion(gesamt, 4)
  assert.equal(je.kcal, 436.5, 'die Portion ist nicht das Rezept durch 4')
  assert.equal(je.protein, 18.2)
  assert.equal(je.fett, 7.5)
  assert.equal(je.kohlenhydrate, 67.1)

  // `[read]` **Bei einer Portion sind beide Spalten gleich** — das
  // ist richtig, und die Überschriften sagen jetzt warum.
  assert.deepEqual(jePortion(gesamt, 1), gesamt)
})

test('G-326: ohne Portionen gibt es keine Portion', () => {
  // `[read]` **Nicht unendlich viel, sondern `null`** — der CHECK
  // verlangt `servings > 0`, das Formular darf während der Eingabe
  // leer sein.
  const gesamt = { kcal: 500, protein: 20, fett: 10, kohlenhydrate: 60 }
  assert.equal(jePortion(gesamt, 0).kcal, null)
  assert.equal(jePortion(gesamt, Number.NaN).kcal, null)
})

test('G-326: eine Lücke macht die Summe unbestimmbar — unverändert', () => {
  // `[read]` **Die Zusage aus G-325 gilt weiter** — dieser Wächter
  // hält sie fest, weil G-326 dieselbe Anzeige anfasst.
  const zutaten: ZutatEntwurf[] = [
    {
      food_id: 'a', name: 'Hafer', amount_g: 80,
      enercc_100: 348, prot625_100: 13.24, fat_100: 6.66, cho_100: 53.3,
    },
    {
      food_id: 'b', name: 'Lücke', amount_g: 100,
      enercc_100: null, prot625_100: null, fat_100: null, cho_100: null,
    },
  ]
  assert.equal(summeVon(zutaten).kcal, null,
    'aus einer Lücke wurde eine Zahl')
})
