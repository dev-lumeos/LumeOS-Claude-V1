// `new Date()` beim Rendern zerlegt die Hydration — G-390.
//
// ══ WARUM EIN WAECHTER UND KEIN KOMMENTAR ═══════════════════════════
//
// `[cmd]` **G-74 hat es behoben. G-388 hat es wieder eingebaut.**
// **Die Warnung stand woertlich in der Datei**, in die der Reiter
// eingehaengt ist (`supplements/ansicht.tsx:193`):
//
//     nie `new Date()`, das zerlegte die Hydration und rechnete im
//     Browser anders als beim Rendern
//
// `[read]` **Ein Kommentar warnt den, der ihn liest.** Der naechste
// baut in einer anderen Datei und sieht ihn nie. **Eine Regel, die
// nicht faellt, ist eine Bitte.**
//
// `[cmd]` **Die Wirkung reicht ueber die eigene Datei hinaus:**
// `tab-injektionen` wird in `ansicht.tsx` importiert, die Rechnung
// lief beim Anstrich der SCHALE. **Gemessen: der Fehler stand auf
// allen elf Reitern des Moduls**, nicht nur auf dem einen.
//
// ══ KEINE AUSNAHMELISTE, SONDERN EINE FORM ══════════════════════════
//
// `[cmd]` **Gemessen 2026-09-09: 11 Stellen mit `new Date()` als
// Code** in `apps/web/src/app/v2/` (27 Rohtreffer ? 16 davon sind
// Kommentare, die davor warnen).
//
// `[read]` **Nicht alle sind falsch**, und eine Liste der erlaubten
// altert nur nach oben (Erlaubnisliste). **Also eine FORM, die den
// Unterschied traegt:**
//
//     erlaubt   in einem Ereignisbehandler (onClick, onChange, ...)
//               -> laeuft NUR im Browser, nach der Hydration
//     erlaubt   in `useEffect`
//               -> laeuft NUR im Browser, nach dem ersten Anstrich
//     erlaubt   in einer Serverkomponente (keine `'use client'`)
//               -> laeuft NUR auf dem Server, es gibt keine zweite
//                  Rechnung, die abweichen koennte
//     ROT       alles andere: beim Rendern einer Client-Komponente,
//               einschliesslich `useState(() => new Date())` ? der
//               Initialisierer laeuft auf BEIDEN Seiten
//
// `[read]` **Wer eine dieser Formen benutzt, kommt ohne Eintrag
// durch.** Wer beim Rendern rechnet, faellt ? und die Meldung nennt
// die Form, die stattdessen geht.
//
// Aufruf: node tools/hydration-datum-pruefen.mjs

import { readFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'

const WURZEL = process.cwd()

function dateien() {
  const roh = execFileSync('git', ['ls-files', '--', 'apps/web/src/app/v2/'],
    { cwd: WURZEL, encoding: 'utf8' })
  return roh.split('\n').map(z => z.trim())
    .filter(f => (f.endsWith('.ts') || f.endsWith('.tsx'))
              && !f.includes('__tests__'))
}

/** Argumentlos. `new Date(x)` rechnet aus einem gegebenen Wert. */
const MUSTER = /\bnew Date\(\s*\)/

/**
 * Die Zeilen einer Datei ohne Kommentare.
 *
 * `[cmd]` **16 der 27 Rohtreffer stehen in Kommentaren** — fast alle
 * warnen vor genau diesem Fehler. **Wer sie mitzaehlt, meldet die
 * Warnung als Verstoss.**
 */
function codeZeilen(text) {
  const aus = []
  let imBlock = false
  text.split('\n').forEach((z, i) => {
    const t = z.trim()
    if (imBlock) { if (t.includes('*/')) imBlock = false; return }
    if (t.startsWith('/*')) { if (!t.includes('*/')) imBlock = true; return }
    if (t.startsWith('//') || t.startsWith('*')) return
    aus.push({ nr: i + 1, code: z.split('//')[0], roh: t })
  })
  return aus
}

/**
 * Steht die Stelle in einem Ereignisbehandler oder `useEffect`?
 *
 * `[read]` **Rueckwaerts gesucht, bis die Klammerbilanz aufgeht** —
 * das ist der Block, in dem die Zeile steht. Findet sich darin ein
 * `onX={` oder `useEffect(`, laeuft der Code nur im Browser.
 */
function imBrowserBlock(zeilen, index) {
  let tiefe = 0
  for (let i = index; i >= 0 && i > index - 60; i--) {
    const z = zeilen[i].code
    for (const c of [...z].reverse()) {
      if (c === '}' || c === ')') tiefe++
      else if (c === '{' || c === '(') {
        if (tiefe === 0) {
          // Offene Klammer: der Kopf steht in derselben Zeile davor.
          if (/\bon[A-Z]\w*\s*=\s*$/.test(z.slice(0, z.lastIndexOf(c)))
              || /\bon[A-Z]\w*\s*=\s*\{?\s*(\(\s*\)|\w+)?\s*=>\s*$/.test(z)
              || /\buseEffect\s*\($/.test(z.slice(0, z.lastIndexOf(c) + 1))) {
            return true
          }
        } else tiefe--
      }
    }
    if (/\buseEffect\s*\(/.test(z) && i < index) return true
    if (/\bon[A-Z]\w*\s*=\s*\{/.test(z) && i < index) return true
  }
  return false
}

const funde = []
for (const f of dateien()) {
  let text
  try { text = readFileSync(f, 'utf8') } catch { continue }
  if (!MUSTER.test(text)) continue
  // `[read]` **Eine Serverkomponente rechnet nur einmal** — dort gibt
  // es keine zweite Rechnung, die abweichen koennte.
  const istClient = /^['"]use client['"]/m.test(text)
  if (!istClient) continue

  const zeilen = codeZeilen(text)
  zeilen.forEach((z, i) => {
    if (!MUSTER.test(z.code)) return
    if (imBrowserBlock(zeilen, i)) return
    funde.push({ f, nr: z.nr, roh: z.roh.slice(0, 84) })
  })
}

if (funde.length === 0) {
  console.log('[hydration-datum] Kein `new Date()` beim Rendern einer '
    + 'Client-Komponente.')
  process.exit(0)
}

console.log('[hydration-datum] FEHLER: ' + funde.length
  + ' Stelle(n) rechnen beim Rendern mit der Uhr des Browsers.\n')
for (const x of funde) {
  console.log(`  ${x.f}:${x.nr}`)
  console.log(`     ${x.roh}`)
}
console.log('\n  Der Server rechnet mit SEINER Uhr, der Browser mit seiner —')
console.log('  die Hydration bricht, und zwar fuer die ganze Schale, wenn')
console.log('  die Datei von einer Ansicht importiert wird (G-390).')
console.log('\n  Erlaubt sind drei Formen, ohne Eintrag in eine Liste:')
console.log('    * in einem Ereignisbehandler (onClick, onChange, ...)')
console.log('    * in `useEffect`')
console.log('    * in einer Serverkomponente (ohne `use client`)')
console.log('  Sonst: den Tag als Prop hereingeben — serverseitig bestimmt.')
process.exit(1)
