// G-465 — fuenf Anfragen je Suche.
//
// ══ TOMS BEFUND ═════════════════════════════════════════════════════
//
// **Tom, 2026-09-08:** *„miss die suche in supplement produkte, das
// ist nicht bedienbar mit diesen wartezeiten."*
//
// ══ WO DIE ZEIT LAG ═════════════════════════════════════════════════
//
// `[cmd]` **Gemessen 2026-09-17 im Browser, EINE Route allein:**
//
//     Suche MIT Allergiefilter     15.804 ms
//     dieselbe mit `allergien=0`      353 ms
//
// `[read]` **45 mal so lang** — und die Datenbank beantwortet die
// Funktion in 40 ms. **Die Zeit lag in 57 Anfragen nacheinander,
// je 1.000 Zeilen, bei JEDEM Tastendruck.**
//
// ══ WAS HIER BEWACHT WIRD ═══════════════════════════════════════════
//
//     1  die Runden laufen gleichzeitig, nicht nacheinander
//     2  die Liste wird je Nutzer gemerkt
//     3  ein Schreibvorgang raeumt den Speicher
//     4  ein Fehlschlag wird NICHT gemerkt
import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

const WEB = process.cwd()
const lies = (p: string) => fs.readFileSync(path.join(WEB, 'src', p), 'utf8')

/**
 * Kommentare weg, bevor gesucht wird.
 *
 * `[cmd]` **G-455/G-166:** eine Probe fand ihren eigenen Erklaertext
 * und blieb gruen, obwohl die Sache fehlte.
 */
function ohneKommentare(q: string): string {
  return q.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
}

// ══ 1 — die Runden laufen gleichzeitig ══════════════════════════════

test('A1: die Seiten werden NICHT nacheinander geholt', () => {
  // ══ DER GEMESSENE GRUND ══════════════════════════════════════════
  //
  // `[cmd]` **Hier stand `for (…) { await c.rpc(…) }`** — 57 Runden,
  // jede wartet auf die vorige. **Nach der Umstellung auf Buendel:
  // 15.804 ms -> 3.200 ms** (dieselbe Antwort, 56.934 Produkte).
  const q = ohneKommentare(lies('lib/allergien/allergie-read.ts'))

  // `[read]` **Die Sache ist `Promise.all` ueber die Runden** — ein
  // `await` im Schleifenrumpf waere der alte Weg.
  assert.match(q, /Promise\.all\(\s*dieseRunde\.map/,
    'Die Runden laufen wieder nacheinander — das war der '
    + '15-Sekunden-Weg.')

  // `[cmd]` **Gegenprobe auf die Form:** im Rumpf der Rundenschleife
  // darf kein `await c.rpc` mehr stehen.
  const schleife = q.slice(q.indexOf('for (let start = 0'))
    .slice(0, 900)
  assert.doesNotMatch(schleife, /await\s+c\s*\.rpc/,
    'Im Schleifenrumpf steht wieder ein einzelnes `await c.rpc`.')
})

test('A2: die Buendel sind begrenzt', () => {
  // `[read]` **Nicht alle 60 auf einmal** — sonst stehen 60
  // gleichzeitige Anfragen gegen PostgREST, und der Engpass wandert
  // nur woanders hin.
  const q = ohneKommentare(lies('lib/allergien/allergie-read.ts'))
  const m = q.match(/const BUENDEL = (\d+)/)
  assert.ok(m, 'Es gibt keine Buendelgroesse.')
  const n = Number(m![1])
  assert.ok(n >= 2 && n <= 20,
    `Buendelgroesse ${n} — unter 2 ist es wieder nacheinander, `
    + 'ueber 20 steht ein Schwarm gegen die Datenbank.')
})

test('A3: eine unvolle Seite beendet das Holen', () => {
  // `[read]` **Sonst laufen alle 60 Runden, auch wenn die Liste nach
  // der dritten zu Ende ist** — 57 Anfragen fuer nichts.
  const q = ohneKommentare(lies('lib/allergien/allergie-read.ts'))
  assert.match(q, /if\s*\(stueck\.length\s*<\s*GROESSE\)\s*fertig\s*=\s*true/,
    'Eine unvolle Seite beendet das Holen nicht.')
})

// ══ 2 — der Kurzspeicher ════════════════════════════════════════════

test('A4: die Trefferliste wird je NUTZER gemerkt', () => {
  // `[read]` **Allergien sind Gesundheitsdaten.** `[cmd]` **Der
  // Schluessel MUSS die Kennung sein** — ein gemeinsamer Speicher
  // gaebe die Liste eines Nutzers an einen anderen.
  const q = ohneKommentare(lies('lib/allergien/allergie-read.ts'))
  assert.match(q, /TREFFER_SPEICHER\.get\(userId\)/,
    'Der Speicher wird nicht je Nutzer gelesen.')
  assert.match(q, /TREFFER_SPEICHER\.set\(userId/,
    'Der Speicher wird nicht je Nutzer geschrieben.')
})

test('A5: ein Fehlschlag wird NICHT gemerkt', () => {
  // ══ DER GRUND ════════════════════════════════════════════════════
  //
  // `[cmd]` **G-455: ein abgeschnittener Stand liess den Filter
  // aussehen, als griffe er nicht** — 42 von 500 Produkten haetten
  // ausfallen muessen, 0 fielen aus.
  //
  // `[read]` **Wuerde so ein Stand gemerkt, hielte die Stoerung eine
  // ganze Minute an, statt beim naechsten Versuch zu verschwinden.**
  const q = ohneKommentare(lies('lib/allergien/allergie-read.ts'))
  assert.match(q, /if\s*\(!abgeschnitten\)\s*\{[\s\S]{0,140}?TREFFER_SPEICHER\.set/,
    'Auch ein unvollstaendiger Stand wird gemerkt — dann haelt eine '
    + 'Stoerung eine Minute lang an.')
})

test('A6: der Schreibweg raeumt den Speicher', () => {
  // `[read]` **`revalidatePath` raeumt ihn NICHT** — er liegt im
  // Modul, nicht im Seitenspeicher von Next. `[cmd]` **Ohne das
  // Raeumen zeigte die Suche bis zu 60 Sekunden lang die alte
  // Allergienlage.**
  const q = ohneKommentare(lies('app/v2/settings/allergie-aktionen.ts'))
  assert.match(q, /vergissAllergieTreffer\(\)/,
    'Der Schreibweg raeumt den Kurzspeicher nicht — eine neue '
    + 'Allergie wirkte erst nach einer Minute.')
  // Und zwar in `frischen()`, das ALLE drei Schreibwege rufen.
  const f = q.slice(q.indexOf('function frischen')).slice(0, 400)
  assert.match(f, /vergissAllergieTreffer/,
    'Das Raeumen steht nicht in `frischen()` — dann raeumt nur '
    + 'einer der drei Schreibwege.')
})

test('A7: die Frist ist gesetzt und kurz', () => {
  // `[read]` **Ohne Frist gaebe es keinen Weg zurueck**, wenn eine
  // Aenderung am Schreibweg vorbei geschieht (Import, zweites
  // Fenster).
  const q = ohneKommentare(lies('lib/allergien/allergie-read.ts'))
  const m = q.match(/const SPEICHER_MS = ([\d_]+)/)
  assert.ok(m, 'Es gibt keine Frist.')
  const ms = Number(m![1].replace(/_/g, ''))
  assert.ok(ms > 0 && ms <= 300_000,
    `Frist ${ms} ms — 0 schaltet den Speicher ab, ueber 5 Minuten `
    + 'haelt eine Aenderung von aussen zu lange nach.')
})

// ══ 3 — die Kontrollprobe ═══════════════════════════════════════════

test('A8: KONTROLLE — das blosse Wort macht keine Probe rot', () => {
  // `[read]` **Ohne sie misst die Reihe nur, dass jemand die Datei
  // angefasst hat** (Lehre aus G-460).
  assert.ok(
    ohneKommentare('// Promise.all(dieseRunde.map\ncode')
      .indexOf('Promise.all') === -1,
    'ohneKommentare entfernt Zeilenkommentare nicht — dann finden '
    + 'die Proben ihre eigenen Erklaertexte.')
  assert.ok(
    ohneKommentare('/* TREFFER_SPEICHER.set(userId */\ncode')
      .indexOf('TREFFER_SPEICHER') === -1,
    'ohneKommentare entfernt Blockkommentare nicht.')
})
