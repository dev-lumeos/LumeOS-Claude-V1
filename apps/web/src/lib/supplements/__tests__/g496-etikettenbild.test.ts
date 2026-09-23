// G-496 — das Etikett als Bild, Toms Fund.
//
// **Tom, 2026-09-08:** *„versuch mal die produktid auf diese url mit
// dieser logik zu binden"* — und aus dem API-Guide des
// `nih-dsld-client`:
//
//     Bild   api.ods.od.nih.gov/dsld/s3/pdf/thumbnails/<id>.jpg
//     PDF    api.ods.od.nih.gov/dsld/s3/pdf/<id>.pdf
//
// `[cmd]` **Gemessen 2026-09-23 an zwanzig Ids**
// (`tools/_g496-messen.mjs`):
//
//                  trifft   Median   Median-Dauer
//     JPEG          20/20    21 KB       291 ms
//     PDF           20/20   274 KB       320 ms
//
// `[read]` **Die Adresse geht aus der ID, nicht aus dem blanken
// Dateinamen** — darum fielen die sieben Versuche aus G-495.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const SRC = path.resolve(__dirname, '..', '..', '..')
const lies = (p: string) => readFileSync(path.join(SRC, p), 'utf8')
const ohneKommentare = (q: string) => q
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^\s*\/\/.*$/gm, '')

const ROUTE = 'app/api/supplements/etikett/route.ts'
const TAFEL = 'app/v2/supplements/produkt-tafel.tsx'

test('G-496/A11: die Route benutzt Toms Bildadresse', () => {
  const q = ohneKommentare(lies(ROUTE))
  // `[cmd]` **`s3/pdf/thumbnails/<id>.jpg`** — gemessen 20/20.
  assert.match(q, /dsld\/s3\/pdf\/thumbnails\//,
    'Die Route holt das Bild nicht unter der gemessenen Adresse.')
  assert.match(q, /\$\{roh\}\.jpg/,
    'Die Adresse wird nicht aus der Kennung gebaut.')
})

test('G-496/A12: kein PDF, kein Betrachter, kein Rendern', () => {
  const t = ohneKommentare(lies(TAFEL))
  // `[read]` **Weg a und b aus dem Auftrag fallen weg** — die NIH
  // schickt `X-Frame-Options: DENY` (gemessen), und ein Wandler
  // fehlt (weder Paket noch Systembefehl).
  assert.doesNotMatch(t, /<iframe|<embed|<object/,
    'Die Tafel bettet wieder ein Dokument ein — das Bild genuegt.')
  assert.match(t, /data-probe="etikett-bild"/,
    'Die Tafel zeigt kein Bild.')
})

test('G-496: die Antwort wird auf ECHTES JPEG geprueft', () => {
  const q = ohneKommentare(lies(ROUTE))
  // `[cmd]` **Die Falle aus G-495:** die Schnittstelle antwortet auf
  // unbekannte Pfade mit 200 und HTML, S3 mit 403 und XML.
  // `[read]` **Ein Statuscode allein belegt nichts** — die ersten
  // drei Bytes schon (`FF D8 FF`).
  assert.match(q, /0xFF && k\[1\] === 0xD8 && k\[2\] === 0xFF/,
    'Die Route glaubt dem Statuscode, statt die Bytes zu pruefen.')
})

test('G-496: die Kennung wird geprueft, nicht durchgereicht', () => {
  const q = ohneKommentare(lies(ROUTE))
  // `[read]` **Die Adresse wird aus Nutzereingabe gebaut** — ohne
  // Pruefung waere dieser Server ein Bote fuer fremde Ziele.
  assert.match(q, /\/\^\\d\{1,12\}\$\//,
    'Die `dsld_id` wird nicht auf Ziffern geprueft.')
  assert.match(q, /auth\.getUser\(\)/,
    'Die Route ist ohne Sitzung erreichbar.')
})

test('G-496/A13: die Grenze 1.000/Stunde ist vermerkt und behandelt', () => {
  const roh = lies(ROUTE)
  // `[cmd]` **Aus dem Guide:** *„No API key needed for up to 1.000
  // requests/hour per IP"*, darueber `429` mit `Retry-After`.
  assert.match(roh, /1\.000 requests\/hour|1\.000 Abrufe je Stunde|1\.000 je Stunde/,
    'Die Grenze steht nicht im Code.')
  const q = ohneKommentare(roh)
  // `[read]` **Ein eigener Zweig** — wer die Grenze reisst, soll das
  // erfahren und nicht „kein Etikett" lesen.
  assert.match(q, /status === 429/,
    'Die Grenze wird mit „kein Etikett" verwechselt.')
  assert.match(q, /retry-after/i,
    '`Retry-After` wird nicht weitergereicht.')
})

test('G-496/A14: die Quelle steht, wo das Bild steht', () => {
  const t = ohneKommentare(lies(TAFEL))
  // `[cmd]` **CC0 1.0 — gemeinfrei, und trotzdem zu nennen.**
  // `[read]` **Am Bild, nicht nur im Quelltext.**
  assert.match(t, /data-probe="etikett-quelle"/,
    'Die Quelle steht nicht auf dem Schirm.')
  assert.match(t, /National Institutes of Health/,
    'Die Quelle nennt die NIH nicht.')
  assert.match(t, /Office of Dietary Supplements/,
    'Die Quelle nennt das ODS nicht.')
  assert.match(t, /CC0/,
    'Die Lizenz fehlt.')
})

test('G-496/A5+A7: Rueckfallfeld und Link in jedem Zustand', () => {
  const t = ohneKommentare(lies(TAFEL))
  assert.match(t, /data-probe="etikett-rueckfall"/,
    'Es gibt kein Rueckfallfeld.')
  // `[read]` **Der Link haengt NICHT am Zustand** — er ist berechnet,
  // nicht abgerufen, und faellt in keinem der drei Faelle aus.
  const i = t.indexOf('data-probe="etikett-link"')
  assert.ok(i > 0, 'Es gibt keinen NIH-Link.')
  const davor = t.slice(Math.max(0, i - 400), i)
  assert.doesNotMatch(davor, /stand === 'da' &&|stand === 'ohne' &&/,
    'Der NIH-Link haengt an einem Zustand — er soll immer stehen.')
})

test('G-496: das Bild darf nicht „lazy" und zugleich versteckt sein', () => {
  const t = ohneKommentare(lies(TAFEL))
  // ══ DER FEHLER, DEN DIE MESSUNG GEFUNDEN HAT ═══════════════════
  //
  // `[cmd]` **Gemessen 2026-09-23: das Bild wurde NIE abgerufen** —
  // `netz: []`, und die Flaeche blieb auf *„lädt …"* stehen.
  //
  // `[read]` **Ein `loading="lazy"`-Bild mit `display: none` ist nie
  // im Sichtfeld** — also laedt es nie, also wird es nie sichtbar.
  // **Die Bedingung verhinderte genau das Ereignis, auf das sie
  // wartete.**
  const i = t.indexOf('data-probe="etikett-bild"')
  assert.ok(i > 0, 'Das Bild fehlt.')
  const block = t.slice(Math.max(0, i - 300), i + 400)
  assert.doesNotMatch(block, /loading="lazy"/,
    'Das Bild ist wieder „lazy" — versteckt laedt es dann nie.')
  assert.doesNotMatch(block, /display: stand === 'da'/,
    'Das Bild wird wieder ueber `display` versteckt — dann laedt es nie.')
})
