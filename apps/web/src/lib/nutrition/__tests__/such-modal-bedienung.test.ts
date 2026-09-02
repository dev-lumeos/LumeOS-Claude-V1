/**
 * G-321 — drei Befunde am Suchmodal.
 *
 * **Tom, 2026-09-02:** *„die suche ist ungluecklich gemacht, da ist
 * nicht klar dass man zuerst den suchen button klicken muss. das
 * modal muss bewegbar werden und es hat einen spaltenfehler drin."*
 *
 * `[read]` **Die Wächter messen die Wirkung, nicht das Wort** —
 * CLAUDE.md nennt vier Fälle (G-216, G-247, G-246, G-108), in denen
 * einer grün blieb, während die Sache kaputt war.
 */
import assert from 'node:assert/strict'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { test } from 'node:test'

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
// ══ G-336: die Ziehlogik steht jetzt in der gemeinsamen Huelle ══
//
// `[cmd]` **G-336 brauchte dieselbe Huelle fuer *Mahlzeit
// hinzufuegen*.** `[read]` **Eine Kopie waere eine zweite Wahrheit
// gewesen** — deshalb steht sie einmal in `zieh-modal.tsx`, und
// beide Modale benutzen sie.
//
// `[read]` **Die Zusagen unten sind unveraendert** — nur die Datei,
// in der sie gemessen werden, hat gewechselt.
const HUELLE = 'apps/web/src/app/v2/nutrition/zieh-modal.tsx'
const EDITOR = 'apps/web/src/app/v2/nutrition/plan-eintrag-editor.tsx'
const CSS = 'packages/ui/src/styles/v2.css'

test('die Dateiproben finden ihre Dateien — unabhängig vom Startort', () => {
  for (const f of [MODAL, EDITOR, CSS]) {
    assert.ok(fs.existsSync(path.join(WURZEL, f)), `${f} nicht gefunden`)
    assert.ok(lies(f).length > 500, `${f} ist verdächtig kurz`)
  }
  assert.ok(fs.existsSync(path.join(WURZEL, 'pnpm-workspace.yaml')),
    `WURZEL zeigt nicht auf das Repo: ${WURZEL}`)
})

// ══ 1. Kein Feld, das eine Eingabe vortäuscht ════════════════════════

test('G-321/1: das Lebensmittelfeld ist ein Knopf, kein Eingabefeld', () => {
  // **Tom:** *„da ist nicht klar dass man zuerst den suchen button
  // klicken muss."*
  //
  // `[cmd]` **`plan-eintrag-editor.tsx:248` trug einen
  // `placeholder`** — das ist ein Eingabefeld. `[cmd]` **Es öffnete
  // aber nur das Modal (Z. 319).**
  //
  // `[read]` **Wer hineintippt, erwartet Treffer und bekommt
  // nichts.**
  const e = ohneKommentare(EDITOR)

  // Die Wirkung: es gibt kein readOnly-Feld mehr, das nach Eingabe
  // aussieht.
  assert.doesNotMatch(e, /aria-label="Gewähltes Lebensmittel"/,
    'das Anzeigefeld ist zurück — es täuscht eine Eingabe vor')
  assert.doesNotMatch(e, /placeholder="— noch keines gewählt —"/,
    'der Platzhalter verspricht wieder eine Eingabe')

  // `[cmd]` **Und der Ersatz ist EIN Knopf** — nicht Feld plus Knopf.
  assert.match(e, /data-probe="lebensmittel-waehlen"/,
    'der Wählen-Knopf fehlt')
  const i = e.indexOf('data-probe="lebensmittel-waehlen"')
  const block = e.slice(Math.max(0, i - 300), i + 500)
  assert.match(block, /onClick=\{\(\) => setSuchen\(true\)\}/,
    'der Knopf öffnet das Modal nicht')
  // `[read]` **Der Knopf trägt den gewählten Namen ODER die
  // Aufforderung** — nie beides und nie nichts.
  assert.match(block, /\{gewaehltName \|\| 'Lebensmittel suchen …'\}/,
    'der Knopf sagt nicht, was gewählt ist')
})

test('G-321/1: das Modal setzt den Fokus ins Suchfeld', () => {
  // `[read]` **Sonst müsste man nach dem Öffnen erst klicken** — der
  // zweite Klick für dieselbe Absicht.
  // `[cmd]` **`aria-label="Lebensmittel suchen"` steht ZWEIMAL** —
  // an der Dialog-Hülle (Z. 331) und am Feld (Z. 453). `[read]` **Ein
  // `indexOf` trifft die Hülle**, und der Schnitt läge im Nichts —
  // genau der Fehler aus `waechter-zaehlen-nicht-suchen`.
  //
  // **Also am `<input>` geschnitten**, nicht am Label.
  const m = ohneKommentare(MODAL)
  const i = m.indexOf('placeholder="Lebensmittel suchen …"')
  assert.ok(i > 0, 'das Suchfeld fehlt')
  const a = m.lastIndexOf('<input', i)
  const b = m.indexOf('/>', i)
  assert.ok(a >= 0 && b > i, 'das Suchfeld steht in keinem <input>')
  const feld = m.slice(a, b)
  assert.match(feld, /autoFocus/,
    'das Suchfeld bekommt den Fokus nicht')
  assert.match(feld, /aria-label="Lebensmittel suchen"/,
    'das Suchfeld ist nicht benannt')
})

// ══ 2. Bewegbar ══════════════════════════════════════════════════════

test('G-321/2: das Modal lässt sich an der Titelleiste ziehen', () => {
  // **Tom:** *„das modal muss bewegbar werden."*
  //
  // `[cmd]` **Gemessen vorher: `drag` 0, `transform` 0,
  // `onMouseDown` 0.**
  const m = ohneKommentare(HUELLE)

  assert.match(m, /data-probe="titelleiste"/, 'die Titelleiste fehlt')
  const i = m.indexOf('data-probe="titelleiste"')
  const leiste = m.slice(i, i + 500)
  assert.match(leiste, /onMouseDown=\{zugStart\}/,
    'die Titelleiste startet keinen Zug')
  assert.match(leiste, /cursor: zieht \? 'grabbing' : 'grab'/,
    'die Titelleiste sieht nicht nach Ziehen aus')
  // `[read]` **Ohne das färbt sich der Titel beim Schieben blau.**
  assert.match(leiste, /userSelect: 'none'/,
    'beim Ziehen wird Text markiert')

  // `[cmd]` **Der Versatz wirkt über `transform`, nicht über
  // `top`/`left`** — die Hülle zentriert per Flex, ein
  // Positionswechsel liesse das Modal beim ersten Zug springen.
  assert.match(m, /transform: `translate\(\$\{versatz\.x\}px, \$\{versatz\.y\}px\)`/,
    'der Versatz wirkt nicht auf den Kasten')

  // `[cmd]` **Die Zuhörer hängen am `window`** — sonst reisst der Zug
  // ab, sobald die Maus den Kasten verlässt.
  assert.match(m, /window\.addEventListener\('mousemove'/,
    'die Mausbewegung wird nicht am Fenster verfolgt — der Zug reisst ab')
  assert.match(m, /window\.addEventListener\('mouseup'/,
    'das Loslassen wird nicht am Fenster verfolgt')
  assert.match(m, /window\.removeEventListener\('mousemove'/,
    'der Zuhörer wird nicht abgeräumt')

  // `[read]` **Nur die linke Taste** — sonst klebt das Modal nach
  // einem Rechtsklick an der Maus.
  assert.match(m, /if \(e\.button !== 0\) return/,
    'jede Maustaste startet einen Zug')
})

test('G-321/2: ein beendeter Zug schliesst das Modal nicht', () => {
  // `[read]` **Endet ein Zug auf der Hülle** — bei schnellem Schieben
  // nach aussen — **käme sonst ein Klick an, und das Modal schlösse
  // mitten in der Bewegung.**
  const m = ohneKommentare(HUELLE)
  assert.match(m, /if \(!zieht && e\.target === e\.currentTarget\) onClose\(\)/,
    'ein Zug, der auf der Hülle endet, schliesst das Modal')

  // `[cmd]` **Und die Kopfknöpfe starten keinen Zug** — sonst wäre
  // jeder Klick auf „Schliessen" ein Zug von 0 px.
  const zahl = (m.match(/onMouseDown=\{e => e\.stopPropagation\(\)\}/g) ?? []).length
  assert.equal(zahl, 2,
    `${zahl} von 2 Kopfknöpfen halten den Zug auf (Zurücksetzen, Schliessen)`)
})

test('G-321/2: Zurücksetzen erscheint nur, wenn verschoben wurde', () => {
  // `[read]` **Ein Knopf, der nichts tut, ist keiner.**
  const m = ohneKommentare(HUELLE)
  assert.match(m, /\{\(versatz\.x !== 0 \|\| versatz\.y !== 0\) && \(/,
    'der Zurücksetzen-Knopf steht auch bei unverschobenem Modal')
  assert.match(m, /onClick=\{\(\) => setVersatz\(\{ x: 0, y: 0 \}\)\}/,
    'Zurücksetzen setzt den Versatz nicht zurück')
})

test('G-336: das Suchmodal benutzt die gemeinsame Huelle', () => {
  // `[read]` **Sonst waeren die drei Waechter darueber gruen**,
  // waehrend das Suchmodal eine eigene Ziehlogik haelt — **sie
  // messen seit G-336 die Huelle, nicht das Modal.**
  const m = ohneKommentare(MODAL)
  assert.match(m, /<ZiehModal/, 'das Suchmodal benutzt die Huelle nicht')
  assert.doesNotMatch(m, /griff\.current = \{/,
    'das Suchmodal haelt wieder eine eigene Ziehlogik')
})

// ══ 3. Der Spaltenfehler ═════════════════════════════════════════════

test('G-321/3: die Trefferliste benutzt die Tabellenklasse', () => {
  // **Tom:** *„es hat einen spaltenfehler drin."*
  //
  // `[cmd]` **Hier stand `className="v2-tab"` — die Klasse für
  // REITER-Knöpfe.** `[cmd]` **Sie setzt `display: flex`**, und damit
  // gilt keine Spaltenbreite mehr.
  //
  // `[cmd]` **Gemessen am 2026-09-02 mit „banane", 24 Treffer:**
  // `thead` bei y=493, Zeile 1 bei y=275, Zeile 8 bei y=520 — **der
  // Kopf stand zwischen den Zeilen**, wie in Toms Bild.
  const m = ohneKommentare(MODAL)
  assert.match(m, /<table className="v2-tbl">/,
    'die Trefferliste benutzt nicht die Tabellenklasse')
  assert.doesNotMatch(m, /className="v2-tab"/,
    'die Reiter-Klasse ist zurück — sie setzt display:flex')
})

test('G-321/3: v2-tab ist eine Flexbox — deshalb war es falsch', () => {
  // `[read]` **Der Wächter prüft die URSACHE, nicht nur den Namen.**
  // `[cmd]` **Wäre `v2-tab` irgendwann keine Flexbox mehr, wäre die
  // Begründung oben hinfällig** — dann soll dieser Test daran
  // erinnern, statt still weiterzulaufen.
  const css = lies(CSS)
  const i = css.indexOf('.v2-tab {')
  assert.ok(i > 0, '.v2-tab gibt es nicht mehr — die Begründung prüfen')
  const regel = css.slice(i, css.indexOf('}', i))
  assert.match(regel, /display:\s*flex/,
    '.v2-tab ist keine Flexbox mehr — G-321s Begründung neu prüfen')

  // Und `.v2-tbl` ist die richtige: sie bringt die Breite selbst mit.
  const j = css.indexOf('.v2-tbl {')
  assert.ok(j > 0, '.v2-tbl fehlt')
  assert.match(css.slice(j, css.indexOf('}', j)), /width:\s*100%/,
    '.v2-tbl setzt keine Breite — dann braucht die Tabelle wieder eine')
})

test('G-321/3: die Zahlenspalten haben Breite und stehen rechts', () => {
  // `[cmd]` **Am Schirm gemessen (2026-09-02, „banane"):** kcal x=803
  // b=60, P x=863 b=50, C x=913 b=50, F x=963 b=50 — **jede Spalte
  // getrennt**, statt „79 1.3 15.9 0.4" in einem Block.
  const m = ohneKommentare(MODAL)
  const i = m.indexOf('<thead>')
  const j = m.indexOf('</thead>', i)
  assert.ok(i > 0 && j > i, 'der Tabellenkopf fehlt')
  const kopf = m.slice(i, j)

  // `[read]` **Gezählt, nicht gesucht** — eine fehlende Breite ist
  // genau der Fall, der die Spalten zusammenschiebt.
  const breiten = (kopf.match(/width: \d+/g) ?? []).length
  assert.equal(breiten, 6,
    `${breiten} von 6 Spalten haben eine feste Breite (Name läuft mit)`)
  const rechts = (kopf.match(/textAlign: 'right'/g) ?? []).length
  assert.equal(rechts, 5,
    `${rechts} von 5 Spalten stehen rechts (kcal, P, C, F, Aktion)`)
})
