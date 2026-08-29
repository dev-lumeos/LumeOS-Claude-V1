// G-252 / G-259 / G-260: das Holen der Tageswerte und die Anbindung.
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

const lies = (f: string) => fs.readFileSync(path.join(process.cwd(), f), 'utf8')
const ohneKommentare = (f: string) => lies(f)
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^[ \t]*\/\/.*$/gm, '')

const ORDNUNG = 'src/lib/nutrition/naehrstoff-ordnung.ts'
const LESEN = 'src/lib/nutrition/reference-assessment-read.ts'

// ── G-252: die Seiten laufen gleichzeitig ────────────────────────

test('G-252: die Seiten werden nicht nacheinander geholt', () => {
  // `[cmd]` **Gemessen am 2026-08-29:** jede der 13 Seiten kostet
  // dieselben ~238 ms, weil der `OFFSET` die Sortierung ueber alle
  // 12.420 Zeilen wiederholt. **Nacheinander 3.093 ms, ein Zug
  // 238 ms.**
  //
  // `[read]` **Wirkung, nicht Wort:** geprueft wird, dass in
  // `ladeReihen` KEIN `await` innerhalb einer Schleife steht — genau
  // das war die Ursache.
  const s = ohneKommentare(ORDNUNG)
  const fn = /async function ladeReihen\([\s\S]*?\n\}/.exec(s)
  assert.ok(fn, 'ladeReihen nicht gefunden.')
  assert.doesNotMatch(fn[0], /for\s*\([^)]*\)\s*\{[\s\S]*?await/,
    'ladeReihen wartet in einer Schleife — die Seiten laufen nacheinander (G-252).')
  assert.match(fn[0], /Promise\.all\(/,
    'ladeReihen holt die Seiten nicht gleichzeitig (G-252).')
})

test('G-252: die Seitenzahl wird gezaehlt, nicht geraten', () => {
  // `[read]` Ohne `count` muesste die Schleife wieder nacheinander
  // laufen, um das Ende zu finden — genau das, was entfernt wurde.
  const s = ohneKommentare(ORDNUNG)
  const fn = /async function ladeReihen\([\s\S]*?\n\}/.exec(s)
  assert.ok(fn)
  assert.match(fn[0], /count:\s*'exact'/,
    'Die Zeilenzahl wird nicht vorher bestimmt (G-252).')
  assert.match(fn[0], /head:\s*true/,
    'Die Zaehlung holt die Zeilen mit — das kostet doppelt (G-252).')
})

test('G-252: der PostgREST-Deckel bleibt beachtet', () => {
  // `[cmd]` **1.000 Zeilen je Anfrage, `max_rows` in
  // `supabase/config.toml`.** `[read]` Wer die Seitengroesse
  // hochsetzt, bekommt stumm weniger Zeilen — die G-249-Falle.
  const s = ohneKommentare(ORDNUNG)
  const seite = /const SEITE = (\d+)/.exec(s)
  assert.ok(seite, 'SEITE nicht gefunden.')
  assert.ok(Number(seite[1]) <= 1000,
    `SEITE ist ${seite[1]} — ueber dem PostgREST-Deckel von 1.000 (G-249).`)
})

// ── G-259: der tote Leseweg ist weg ──────────────────────────────

test('G-259: getNaehrstoffZeitraum ist geloescht', () => {
  // `[cmd]` **Ohne Aufrufer, und mit der G-249-Falle:**
  // `.limit(20000)` fuer 12.420 Zeilen ohne Blaetterung.
  const s = lies(LESEN)
  assert.doesNotMatch(s, /export async function getNaehrstoffZeitraum/,
    'getNaehrstoffZeitraum steht wieder da (G-259).')
  assert.doesNotMatch(s, /export type NaehrstoffTag/,
    'Der Typ NaehrstoffTag steht wieder da (G-259).')
})

test('G-259: kein .limit ueber dem Deckel im Leseweg', () => {
  // `[read]` **Die Falle selbst, nicht nur ihr Traeger:** ein
  // `.limit()` ueber 1.000 verspricht Zeilen, die PostgREST nicht
  // liefert.
  for (const datei of [LESEN, ORDNUNG]) {
    const treffer = (ohneKommentare(datei).match(/\.limit\(\d+\)/g) ?? [])
      .filter(t => Number(/\d+/.exec(t)?.[0] ?? 0) > 1000)
    assert.deepEqual(treffer, [],
      `${datei} verspricht mehr Zeilen, als PostgREST liefert (G-249).`)
  }
})

// ── G-260: die Dauerregel ist angebunden ─────────────────────────

test('G-260: flagVon hat einen Aufrufer', () => {
  // `[cmd]` **C-323 baute die Regel, G-108 band sie bewusst nicht
  // an** (zusammen 7,7 s). `[cmd]` **Nach G-252 traegt der Reiter
  // es:** 3.426 ms ohne, 6.397 ms mit — unter den neun Sekunden aus
  // C-189.
  const s = ohneKommentare(ORDNUNG)
  assert.match(s, /flagVon\(/,
    'Die Dauerregel ist nicht angebunden (G-260).')
  assert.match(s, /getNaehrstoffDauer\(/,
    'Die Tageswerte fuer die Flags werden nicht geladen (G-260).')
})

test('G-260: im Tagesmodus wird die Fensterfunktion nicht gerufen', () => {
  // `[read]` **Ein Tag hat keine Dauer** — und der Aufruf kostet
  // 1.844 ms bei 90 Tagen. Ihn im Tagesmodus zu sparen ist die
  // billigste Ersparnis, die es gibt.
  const s = ohneKommentare(ORDNUNG)
  const zeile = /fenster === 1\s*\n?\s*\?\s*Promise\.resolve\(\[\]\)\s*\n?\s*:\s*getNaehrstoffDauer/
    .test(s.replace(/\s+/g, ' '))
    || /fenster === 1 \? Promise\.resolve\(\[\]\) : getNaehrstoffDauer/
      .test(s.replace(/\s+/g, ' '))
  assert.ok(zeile,
    'Die Fensterfunktion laeuft auch im Tagesmodus (G-260).')
})

test('G-260: der Reiter zeigt die Flags', () => {
  // `[read]` **Wirkung, nicht Wort** — geprueft wird die Bedingung
  // mit ihrem Feld, nicht nur der Name.
  const s = ohneKommentare('src/app/v2/nutrition/naehrstoff-ordnung-tab.tsx')
  assert.match(s, /d\.flagTage !== null &&/,
    'Der Flag-Absatz haengt nicht an `flagTage` (G-260).')
  assert.match(s, /d\.flags\.map\(/,
    'Die Flags werden nicht ausgegeben (G-260).')
  assert.match(s, /dauerSatz\(f\)/,
    'Die Dauer wird nicht genannt — dann ist es wieder eine Zahl ohne Zeitraum (G-260).')
})

test('G-260: keine zweite Ansicht neben die bestehende', () => {
  // `[cmd]` **Dreimal passiert** — G-249, G-11, in G-253 verhindert.
  const s = ohneKommentare('src/app/v2/nutrition/ansicht.tsx')
  const treffer = s.match(/<NaehrstoffOrdnungTab/g) ?? []
  assert.equal(treffer.length, 1,
    `Der Reiter rendert die Ordnung ${treffer.length}-mal (G-260).`)
})
