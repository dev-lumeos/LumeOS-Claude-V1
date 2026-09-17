// G-467 — die Filter werden gespeichert.
//
// ══ TOMS BEFUND, ZUM ZWEITEN MAL ════════════════════════════════════
//
// **Tom, 2026-09-08:** *„meine filtereinstellungen werden nicht
// gespeichert"* — und, zwei Stunden spaeter, mit dem Grund:
//
// > wenn endlich die filters speicherbar waeren und ich meine
// > favoriten marken vernuenftig setzen koennte, wuerden die daten
// > automatisch schrumpfen
//
// `[cmd]` **Gemessen 2026-09-17: mit Filter 0,7 kB statt 101,1 kB**
// — **100 kB weniger je Seitenaufruf.**
//
// ══ WAS HIER BEWACHT WIRD ═══════════════════════════════════════════
//
//     1  was gespeichert wird — und was NICHT (die Suche)
//     2  die Vorgabe fuer einen Nutzer ohne Zeile
//     3  die Leiste startet offen
//     4  die Trefferzahl ist erklaert
import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

import {
  FILTER_SCHLUESSEL, VORGABE, ausJson, istVorgabe, aktiveFilter,
  trefferSatz, STANDARD_STATUS,
} from '../../../../lib/supplements/produkt-filter-lage'

const WEB = process.cwd()
const lies = (p: string) => fs.readFileSync(path.join(WEB, 'src', p), 'utf8')

function ohneKommentare(q: string): string {
  return q.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
}

// ══ 1 — der Schluessel passt zum CHECK der Tabelle ══════════════════

test('A1: der Schluessel erfuellt den CHECK von C-504', () => {
  // `[cmd]` **Gemessen 2026-09-17:**
  // `CHECK (preference_key ~ '^[a-z0-9_.:-]{3,120}$')`
  //
  // `[read]` **Eine Auswahl ist eine Zusage** — was hier steht, muss
  // die Datenbank annehmen. **Ein Grossbuchstabe, und jeder Schreib-
  // vorgang faellt.**
  assert.match(FILTER_SCHLUESSEL, /^[a-z0-9_.:-]{3,120}$/,
    'Der Schluessel faellt am CHECK der Tabelle.')
})

// ══ 2 — was gespeichert wird und was nicht ══════════════════════════

test('A2: die SUCHEINGABE wird nicht gespeichert', () => {
  // **Der Auftrag woertlich:** *„NICHT die Sucheingabe — die ist
  // augenblicklich."*
  //
  // `[read]` **Die Zusage haengt an ZWEI Stellen:** am Typ (es gibt
  // kein Feld) und an der Pruefung (ein geschicktes Feld faellt weg).
  const gepruft = ausJson({
    status: 'On Market', kategorie: null, form: null, marken: [],
    allergienAn: true, leisteOffen: true,
    frage: 'whey', suche: 'whey', text: 'whey',
  })
  assert.equal(JSON.stringify(gepruft).includes('whey'), false,
    'Ein Suchwort ueberlebt die Pruefung — dann steht es in der '
    + 'Datenbank.')

  // `[cmd]` **Und der Reiter schickt es auch nicht mit** — `frage`
  // steht weder im Objekt noch in den Abhaengigkeiten des Effekts.
  const q = ohneKommentare(lies('app/v2/supplements/tab-produkte.tsx'))
  const effekt = q.slice(q.indexOf('const stand: ProduktFilter'))
    .slice(0, 700)
  assert.doesNotMatch(effekt, /\bfrage\b/,
    'Der Speichereffekt kennt `frage` — dann wandert die Suche mit.')
})

test('A3: alle fuenf Filter werden gespeichert', () => {
  // **Der Auftrag:** *„Marktstatus, Kategorie, Form, Marken, ob
  // Allergien ausgeblendet sind."*
  const voll = ausJson({
    status: null, kategorie: 'vitamin', form: 'Capsule [E0159]',
    marken: ['NOW Foods', 'Thorne'], allergienAn: false,
    leisteOffen: false,
  })
  assert.equal(voll.status, null, 'Der Marktstatus faellt weg.')
  assert.equal(voll.kategorie, 'vitamin')
  assert.equal(voll.form, 'Capsule [E0159]')
  assert.deepEqual(voll.marken, ['NOW Foods', 'Thorne'])
  assert.equal(voll.allergienAn, false)
  assert.equal(voll.leisteOffen, false)
})

test('A4: `null` beim Status heisst „alle", nicht „fehlt"', () => {
  // `[read]` **Der gefaehrliche Fall:** wer *„Alle Marktstatus"*
  // waehlt, speichert `null`. `[cmd]` **Wuerde `null` als *fehlt*
  // gelesen, bekaeme er beim naechsten Aufruf wieder *On Market*** —
  // und der Filter sieht aus, als wuerde er nicht gespeichert.
  assert.equal(ausJson({ status: null }).status, null,
    '`null` wird als „fehlt" gelesen — dann kippt „Alle" zurueck '
    + 'auf die Vorgabe.')
  // Ohne das Feld dagegen gilt die Vorgabe.
  assert.equal(ausJson({}).status, STANDARD_STATUS)
})

// ══ 3 — die Vorgabe ════════════════════════════════════════════════

test('A5: ein Nutzer ohne Zeile bekommt die Vorgabe', () => {
  // **A5 des Auftrags:** *„Gegenprobe: ein Nutzer ohne gespeicherte
  // Filter -> Vorgabe."*
  assert.deepEqual(ausJson(null), VORGABE)
  assert.deepEqual(ausJson(undefined), VORGABE)
  // `[read]` **Auch Unsinn ergibt die Vorgabe, nicht einen Absturz.**
  assert.deepEqual(ausJson('kaputt'), VORGABE)
  assert.deepEqual(ausJson([1, 2, 3]), VORGABE)
})

test('A6: die Vorgabe wird geloescht, nicht geschrieben', () => {
  // `[read]` **Sonst stuende nach dem ersten Zuruecksetzen eine Zeile
  // da, die nichts aussagt** — und A5 waere nicht mehr herstellbar.
  assert.equal(istVorgabe(VORGABE), true)
  assert.equal(istVorgabe({ ...VORGABE, kategorie: 'vitamin' }), false)
  assert.equal(istVorgabe({ ...VORGABE, marken: ['NOW Foods'] }), false)

  const q = ohneKommentare(lies('lib/supplements/produkt-filter-read.ts'))
  assert.match(q, /if\s*\(istVorgabe\(filter\)\)[\s\S]{0,200}?\.delete\(\)/,
    'Die Vorgabe wird geschrieben statt geloescht.')
})

// ══ 4 — die Leiste startet offen ════════════════════════════════════

test('A7: die Filterleiste startet OFFEN', () => {
  // **Tom:** *„die zusatzfilter sollen bei start eingeblendet sein."*
  assert.equal(VORGABE.leisteOffen, true,
    'Die Leiste startet zu — dann sieht niemand die Filter, und '
    + 'jeder bekommt 214.780 Produkte.')

  // `[cmd]` **Und der Reiter nimmt die Vorgabe, nicht `false`.**
  const q = ohneKommentare(lies('app/v2/supplements/tab-produkte.tsx'))
  assert.match(q, /useState\(VORGABE\.leisteOffen\)/,
    'Der Reiter setzt den Startwert selbst — dann driftet er gegen '
    + 'die gespeicherte Vorgabe.')
})

// ══ 5 — die Trefferzahl ist erklaert ════════════════════════════════

test('A8: die drei Zahlen sagen, was sie bedeuten', () => {
  // **Aus dem G-465-Bericht:** *„Die Leiste zeigt weiterhin 214.780,
  // die Trefferliste sind 445 — das ist richtig, aber ohne
  // Erklaerung verwirrend."*
  const teil = trefferSatz(445, 121959)
  assert.match(teil, /445/, 'Die geladene Zahl fehlt.')
  assert.match(teil, /121\.959/, 'Die Trefferzahl fehlt.')
  assert.match(teil, /geladen/,
    'Der Satz sagt nicht, dass es um das GELADENE Fenster geht.')

  // `[read]` **Alles geladen ist ein eigener Fall** — „445 von 445"
  // waere richtig und trotzdem eine Zumutung.
  assert.match(trefferSatz(2, 2), /^Alle 2 Treffer geladen/)

  // `[read]` **Null Treffer ist eine Auskunft ueber den FILTER**,
  // kein Fehler.
  assert.match(trefferSatz(0, 0), /Kein Produkt passt/)

  // `[cmd]` **Unscharf heisst: die Zahl ist eine Untergrenze** — bei
  // mehr als 150 Allergie-Ausschluessen zieht der Leseweg nach dem
  // Lesen ab (G-455), und `gesamt` stimmt dann nicht genau.
  assert.match(trefferSatz(418, 39523, true), /mindestens/,
    'Eine unscharfe Zahl wird als genau ausgegeben.')
})

test('A9: der Filterknopf zaehlt nur GESETZTE Filter', () => {
  // `[read]` **Der Marktstatus zaehlt nur, wenn er NICHT die Vorgabe
  // ist** — sonst traegt der Knopf ab Werk eine 1.
  assert.equal(aktiveFilter(VORGABE), 0,
    'Die Vorgabe zaehlt als gesetzter Filter.')
  assert.equal(aktiveFilter({ ...VORGABE, kategorie: 'vitamin' }), 1)
  assert.equal(
    aktiveFilter({ ...VORGABE, marken: ['A', 'B'], kategorie: 'x' }), 3,
    'Jede Marke muss einzeln zaehlen.')
  // Der abgeschaltete Allergiefilter ist eine Einstellung.
  assert.equal(aktiveFilter({ ...VORGABE, allergienAn: false }), 1)
})

// ══ 6 — die Kontrollprobe ═══════════════════════════════════════════

test('A10: KONTROLLE — das blosse Wort macht keine Probe rot', () => {
  // `[read]` **Ohne sie misst die Reihe nur, dass jemand die Datei
  // angefasst hat** (Lehre aus G-460).
  assert.ok(ohneKommentare('// frage\ncode').indexOf('frage') === -1,
    'ohneKommentare entfernt Zeilenkommentare nicht.')
  assert.ok(ohneKommentare('{/* istVorgabe */}\ncode').indexOf('istVorgabe') === -1,
    'ohneKommentare entfernt JSX-Kommentare nicht.')
})
