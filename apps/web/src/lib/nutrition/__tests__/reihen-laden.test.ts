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

test('G-260: die Dauerregel ist angebunden', () => {
  // `[cmd]` **C-323 baute die Regel, G-108 band sie bewusst nicht
  // an** (zusammen 7,7 s). `[cmd]` **Nach G-252 trug der Reiter es.**
  //
  // `[cmd]` **A-62, 2026-08-30: dieser Waechter hat sich umgedreht.**
  // Er verlangte `flagVon(` und `getNaehrstoffDauer(` im Leseweg —
  // richtig, solange der Browser zaehlte. **Seit G-273 zaehlt die
  // Datenbank** (`reference_assessment_window_flags`), und beide
  // Namen stehen dort nicht mehr.
  //
  // `[read]` **Was gleich bleibt, ist die Wirkung:** der Reiter
  // liefert Flags. **Darauf prueft er jetzt.**
  const s = ohneKommentare(ORDNUNG)
  assert.match(s, /flags = sortiere\(gefunden\)/,
    'Die Flags werden nicht mehr gebildet (G-260).')
  assert.match(s, /flagTage = bewertet/,
    'Der Nenner wird nicht mitgegeben (G-260).')
})

test('G-260: im Tagesmodus wird die Fensterfunktion nicht gerufen', () => {
  // `[read]` **Ein Tag hat keine Dauer** — und der Aufruf kostet
  // 1.844 ms bei 90 Tagen. Ihn im Tagesmodus zu sparen ist die
  // billigste Ersparnis, die es gibt.
  // `[cmd]` **A-62, 2026-08-30: auch dieser Waechter hat sich mit
  // G-273 gedreht** — er nannte `getNaehrstoffDauer`, das es nicht
  // mehr gibt. **Die Regel bleibt, der Name aendert sich.**
  const s = ohneKommentare(ORDNUNG)
  const eine = s.replace(/\s+/g, ' ')
  const zeile = eine.includes('fenster === 1 ? Promise.resolve([]) : getFlags(')
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


// ── G-273: die Zaehlung kommt aus der Datenbank ──────────────────

test('G-273: der Reiter ruft die zaehlende Funktion', () => {
  // `[cmd]` **`reference_assessment_window_flags` steht seit dem
  // 2026-08-30 live** (C-349) — in G-273 war sie nur in der Pipeline.
  //
  // `[cmd]` **Ergebnisgleichheit belegt, dev, drei Fenster:**
  // 7 Tage 9 Flags, 30 Tage 11, 90 Tage 10 — **Code, getroffene Tage
  // und Nenner identisch mit der Client-Regel.**
  const s = ohneKommentare(ORDNUNG)
  assert.match(s, /getFlags\(stichtag, fenster\)/,
    'Die zaehlende Funktion wird nicht gerufen (G-273).')
  assert.doesNotMatch(s, /getNaehrstoffDauer\(/,
    'Der alte Weg mit 8,3 MB jsonb wird noch benutzt (G-273).')
})

test('G-273: die Ausnahmeliste bleibt im Code', () => {
  // `[cmd]` **Drei Obergrenzen gelten laut Quelle nicht fuer Nahrung**
  // (MG, NIA, FOLAC — C-323). `[read]` **Die Datenbank kennt sie
  // nicht** — sie zaehlt nur Tage. **Die Einordnung bleibt hier.**
  const s = ohneKommentare(ORDNUNG)
  assert.match(s, /GRENZE_NUR_SUPPLEMENT/,
    'Die Supplement-Ausnahme faellt weg — dann warnt MG 88-mal falsch (G-273).')
  assert.match(s, /'grenze_nur_supplement'/,
    'Die Ausnahme wird nicht mehr zugewiesen (G-273).')
})

test('G-273: der Nenner kommt aus der Funktion, nicht geraten', () => {
  // `[read]` **`assessed_day_count` ist der Nenner** — wer ihn aus
  // der Zeilenzahl schaetzte, bekaeme bei Luecken etwas anderes.
  const s = ohneKommentare(ORDNUNG)
  assert.match(s, /bewertet: z\.assessed_day_count/,
    'Der Nenner stammt nicht aus der Funktion (G-273).')
  assert.match(s, /tage: z\.triggered_day_count/,
    'Die getroffenen Tage stammen nicht aus der Funktion (G-273).')
})
