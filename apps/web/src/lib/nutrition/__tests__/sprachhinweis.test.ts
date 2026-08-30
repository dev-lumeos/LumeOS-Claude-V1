// C-177 / E-36: der Hinweis bei Thai.
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

const lies = (f: string) => fs.readFileSync(path.join(process.cwd(), f), 'utf8')
const ohneKommentare = (f: string) => lies(f)
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
  .replace(/^[ \t]*\/\/.*$/gm, '')

const WAHL = 'src/components/shell/sprachwahl.tsx'

test('C-177: die Sprachauswahl behaelt alle drei Sprachen', () => {
  // **Tom, 2026-08-30:** *„lassen wir die sprachauswahl"*.
  // `[read]` **Der Auftrag verbietet ausdruecklich, TH zu entfernen** —
  // die Wahl bleibt, nur bekommt sie einen Hinweis.
  const s = lies('src/i18n/sprachen.ts')
  assert.match(s, /SPRACHEN = \['de', 'en', 'th'\]/,
    'Thai ist aus der Sprachliste entfernt (C-177).')
})

test('C-177: Thai wird gesetzt UND weist hin', () => {
  // `[read]` **Erst setzen, dann hinweisen.** Ein Hinweis VOR dem
  // Setzen waere eine Rueckfrage — die hat Tom nicht verlangt.
  const s = ohneKommentare(WAHL)
  // Das Cookie wird fuer JEDE Sprache geschrieben, ohne Ausnahme.
  const setzen = /document\.cookie = `\$\{SPRACH_COOKIE\}=\$\{s\}/.exec(s)
  assert.ok(setzen, 'Die Sprache wird nicht mehr gesetzt (C-177).')
  const vorCookie = s.slice(0, setzen.index)
  assert.doesNotMatch(vorCookie, /if \(s === 'th'\) return/,
    'Thai wird vor dem Setzen abgefangen — dann ist die Wahl unwirksam (C-177).')
  // Und danach steht der Hinweis.
  assert.match(s, /if \(s === 'th'\) setHinweis\(true\)/,
    'Bei Thai erscheint kein Hinweis (C-177).')
})

test('C-177: der Baustein wird benutzt, nicht nachgebaut', () => {
  // `[cmd]` **`packages/ui/src/in-entwicklung.tsx`, 39 Aufrufer.**
  // `[read]` **Nichts zu bauen, nur ein weiterer Aufrufer** — ein
  // eigenes Modal waere die zweite Ansicht.
  const s = ohneKommentare(WAHL)
  assert.match(s, /import \{ InEntwicklung \} from '@lumeos\/ui'/,
    'Der gemeinsame Baustein wird nicht benutzt (C-177).')
  assert.match(s, /<InEntwicklung/, 'Der Hinweis wird nicht gerendert (C-177).')
  assert.doesNotMatch(s, /className="v2-modal-veil"/,
    'Hier entsteht ein zweites Modal statt des Bausteins (C-177).')
})

test('C-177: der Hinweis sagt nicht, die Wahl tue nichts', () => {
  // `[cmd]` **Gemessen am 2026-08-30:** nach der Wahl steht
  // `lumeos-sprache=th` im Cookie, die Oberflaeche uebersetzt sich.
  //
  // `[read]` **Der Standardsatz des Bausteins waere hier falsch** —
  // *„er tut noch nichts"* stimmt fuer einen toten Knopf, nicht fuer
  // eine wirksame Wahl mit ungedeckter Datenschicht. **Ohne
  // `teilweise` kaeme er zurueck, und niemand wuerde es merken.**
  const s = ohneKommentare(WAHL)
  const ruf = /<InEntwicklung[\s\S]*?\/>/.exec(s)
  assert.ok(ruf, 'Der Aufruf wurde nicht gefunden (C-177).')
  assert.match(ruf[0], /(?<![a-z0-9_])teilweise(?![a-z0-9_])/,
    'Ohne `teilweise` behauptet der Hinweis, die Sprachwahl tue nichts (C-177).')
})

test('C-177: `teilweise` unterdrueckt den Satz wirklich', () => {
  // `[read]` **Die Wirkung pruefen, nicht das Wort** — ein Prop, das
  // nirgends abgefragt wird, ist Zierde. Der Satz muss im Baustein an
  // der Bedingung haengen.
  const b = fs.readFileSync(
    path.join(process.cwd(), '../../packages/ui/src/in-entwicklung.tsx'), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[ \t]*\/\/.*$/gm, '')
  assert.match(b, /\{!teilweise && \([\s\S]*?er tut noch nichts/,
    'Der Standardsatz haengt nicht an `teilweise` (C-177).')
  // Und die uebrigen Aufrufer bleiben beim alten Verhalten.
  // `[cmd]` **Gemessen am 2026-08-30:** 135 Aufrufe von
  // `InEntwicklung`/`InEntwicklungKnopf` in `apps/` und `packages/`,
  // **genau einer** setzt `teilweise` — der aus C-177. Der Auftrag
  // sprach von 39; das ist die Zahl einer Variante, nicht die Summe.
  assert.match(b, /teilweise = false/,
    '`teilweise` hat keinen Standardwert — die 134 uebrigen Aufrufer aendern sich (C-177).')
})

test('C-177: der Grund traegt die Datenfrage, nicht eine Bauzeit', () => {
  // `[cmd]` **Gemessen am 2026-08-30:** `food_aliases` hat 32.845
  // Zeilen — **25.705 `de`, 7.140 `en`, 0 `th`.**
  //
  // `[read]` **Der Auftrag verlangt es ausdruecklich:** *„Das ist
  // etwas anderes als ‚noch nicht gebaut' — es ist eine Datenfrage."*
  // `[read]` **Ohne Kommentare lesen.** Die erste Fassung dieses
  // Waechters las die Datei roh — und fand `BLS 4.0` im Kommentar
  // DARUEBER, waehrend die Konstante schon sabotiert war. **Genau der
  // Fehler aus G-186:** der Waechter fand den Namen im eigenen Text.
  const s = ohneKommentare(WAHL)
  const grund = /const THAI_GRUND =[\s\S]*?offen\.'/.exec(s)
  assert.ok(grund, 'THAI_GRUND wurde nicht gefunden (C-177).')
  assert.match(grund[0], /32\.845/, 'Die gemessene Zahl fehlt (C-177).')
  assert.match(grund[0], /BLS 4\.0/, 'Die Quelle wird nicht benannt (C-177).')
  assert.match(grund[0], /offen/, 'Die offene Frage wird nicht benannt (C-177).')
  // Und er behauptet keinen Zeitpunkt.
  assert.doesNotMatch(grund[0], /demnächst|bald|in Kürze|geplant für/,
    'Der Grund verspricht einen Zeitpunkt, den niemand kennt (C-177).')
})

test('C-177: DE und EN bleiben ohne Hinweis', () => {
  // `[read]` **Sie sind gedeckt** — 25.705 und 7.140 Aliase.
  const s = ohneKommentare(WAHL)
  assert.doesNotMatch(s, /s === 'de'.*setHinweis|s === 'en'.*setHinweis/,
    'Auch DE oder EN zeigen einen Hinweis (C-177).')
})
