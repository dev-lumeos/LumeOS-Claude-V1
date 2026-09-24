// G-117 — der Extended-Code soll nicht im Seitenbuendel liegen.
//
// ══ WAS HIER BEWACHT WIRD ══════════════════════════════════════════
//
// `[cmd]` **Gemessen am 2026-09-24 (Produktionsbau):** die
// Kennzeichen aus `tab-extended.tsx` standen in **einem von zehn**
// JS-Chunks der Seite — auch fuer jemanden, dessen Grad nicht
// reicht. **Nachher: in einem eigenen Chunk, der NICHT im
// Seitenmanifest steht.**
//
// `[read]` **Drei Wege fuehrten den Code ins Buendel, nicht einer:**
//
//     1  der statische Import von `tab-extended.tsx`  (behoben:
//        `dynamic`, Lademarke bleibt)
//     2  `EXTENDED_STACK` in `ansicht.tsx` fuer EINE Zahl
//        (behoben: Konstante)
//     3  ein TOTER Import in `tabs.tsx` — nie benutzt, trotzdem
//        ausgeliefert (behoben: entfernt)
//
// `[read]` **Der vierte Weg ist offen und gehoert Tom:**
// `mockup-referenz.tsx` zeigt dieselben Wirkstoffe unter der
// Trennlinie, fuer JEDEN. Das ist E-68/E-70 (die Mockup-Fassung
// bleibt, bis Tom sie abnimmt) — **kein Rueckfall, eine
// Entscheidung.** Deshalb bewacht diese Datei sie NICHT.
//
// ══ WARUM NICHT NUR NACH `dynamic` GESUCHT WIRD ════════════════════
//
// `[read]` **Ein Waechter, der das Wort `dynamic` findet, bleibt
// gruen, wenn jemand `ssr: false` daraus macht** — und genau das war
// der zurueckgenommene erste Versuch von 2026-08-20, der den Reiter
// leer machte. **Die Probe fragt deshalb nach der WIRKUNG:** kein
// statischer Wert-Import, `dynamic` vorhanden, `ssr` nicht `false`,
// und ein Ladehinweis.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

const HIER = path.join(process.cwd(), 'src', 'app', 'v2', 'supplements')
const lies = (n: string) => fs.readFileSync(path.join(HIER, n), 'utf8')

/** Kommentare raus — sonst faengt die Probe ihre eigene Begruendung.
 *  `[cmd]` Genau das ist am 2026-09-24 passiert: ein Kommentar in
 *  `ansicht.tsx` zitierte die Kennzeichen, und die Browserprobe
 *  fand sie im Entwicklungsbau in `page.js`. */
function ohneKommentare(s: string): string {
  return s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
}

test('G-117: `tab-extended` wird NICHT statisch importiert', () => {
  const code = ohneKommentare(lies('ansicht.tsx'))
  const statisch = /import\s*\{[^}]*\}\s*from\s*'\.\/tab-extended'/.test(code)
  assert.equal(statisch, false,
    'ansicht.tsx importiert tab-extended.tsx wieder statisch — damit '
    + 'liegt der Extended-Code fuer JEDEN im Seitenbuendel (G-117).')
})

test('G-117: der Reiter kommt ueber `dynamic` und bleibt serverseitig', () => {
  const code = ohneKommentare(lies('ansicht.tsx'))

  assert.match(code, /dynamic\(\s*\(\)\s*=>\s*import\('\.\/tab-extended'\)/,
    'Der dynamische Import von tab-extended.tsx fehlt.')

  // `[read]` **`ssr: false` ist der Rueckfall, nicht die Loesung** —
  // er hielt den Chunk heraus UND machte den Reiter leer
  // (gemessen 2026-08-20, zurueckgenommen).
  const block = code.slice(code.indexOf('dynamic('),
    code.indexOf('dynamic(') + 900)
  assert.equal(/ssr\s*:\s*false/.test(block), false,
    'ssr: false macht den Reiter leer — auch den Ladehinweis (G-117).')
  assert.match(block, /ssr\s*:\s*true/,
    'ssr: true muss ausdruecklich dastehen.')
  assert.match(block, /loading\s*:/,
    'Ein Ladehinweis gehoert dazu — kein leeres Feld (G-482/G-486).')
})

test('G-117: kein Wert-Import der Extended-Stoffliste in der Schale', () => {
  // `[read]` **Eine Zahl ist kein Grund, eine Stoffliste
  // auszuliefern.** `ansicht.tsx` brauchte nur `.length`.
  for (const datei of ['ansicht.tsx', 'tabs.tsx']) {
    const code = ohneKommentare(lies(datei))
    const holt = /import\s*\{[^}]*\bEXTENDED_(STACK|LABS)\b[^}]*\}\s*from\s*'\.\/daten'/
      .test(code)
    assert.equal(holt, false,
      `${datei} importiert EXTENDED_STACK/EXTENDED_LABS als WERT — das `
      + 'zieht die PED-Wirkstoffliste ins Seitenbuendel (G-117).')
  }
})

test('G-117: die abgeschriebene Zahl stimmt noch', () => {
  // `[read]` **Eine abgeschriebene Zahl ohne Waechter altert still.**
  // `ansicht.tsx` traegt `EXTENDED_ANZAHL` statt `.length`, damit der
  // Import wegfallen kann — dann muss jemand die Zahl nachhalten.
  const schale = ohneKommentare(lies('ansicht.tsx'))
  const m = schale.match(/const\s+EXTENDED_ANZAHL\s*=\s*(\d+)/)
  assert.ok(m, 'EXTENDED_ANZAHL fehlt in ansicht.tsx.')
  const behauptet = Number(m![1])

  // Die Wahrheit steht in `daten.ts` — gezaehlt, nicht geglaubt.
  const daten = lies('daten.ts')
  const von = daten.indexOf('export const EXTENDED_STACK')
  assert.ok(von >= 0, 'EXTENDED_STACK nicht in daten.ts gefunden.')
  const bis = daten.indexOf('export const', von + 10)
  const block = daten.slice(von, bis > von ? bis : undefined)
  const wirklich = (block.match(/^\s{4}name:\s*"/gm) ?? []).length

  assert.equal(behauptet, wirklich,
    `EXTENDED_ANZAHL sagt ${behauptet}, EXTENDED_STACK fuehrt `
    + `${wirklich} Wirkstoffe — das Zaehlerchen am Reiter luegt.`)
})

test('G-117: das serverseitige Gate bleibt (A5)', () => {
  // `[read]` **Die Buendelgrenze ERSETZT das Gate nicht, sie kommt
  // dazu.** Faellt `gate?.offen` weg, rendert der Reiter fuer jeden —
  // und holt sich den Chunk dann auch.
  const code = ohneKommentare(lies('ansicht.tsx'))
  assert.match(code, /gate\?\.offen\s*&&\s*\(?\s*<SuppExtended/,
    'Die serverseitige Bedingung vor <SuppExtended/> fehlt (A5).')

  // Und der Leseweg, der sie speist.
  const regeln = ohneKommentare(
    fs.readFileSync(path.join(process.cwd(), 'src', 'lib', 'supplements',
      'regeln-read.ts'), 'utf8'))
  assert.match(regeln, /reichtDerGrad\(grad\)/,
    'ladeGate() entscheidet nicht mehr ueber reichtDerGrad (A5).')
})
