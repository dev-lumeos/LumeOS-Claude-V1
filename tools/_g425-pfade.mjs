// G-425/A4 - wie viele Pfade hat jede der 21 Flaechen?
//
// `[read]` **Aus der Datei gelesen, nicht aus der SSOT abgeschrieben**
// - `104-muskelkarte.md:526` fuehrt eine Pfadzahl, und ob sie noch
// stimmt, ist genau die Frage.
//
// `[cmd]` **Je Pfad der absolute Startpunkt** (`M x y`), damit sich
// links/rechts und oben/unten unterscheiden lassen.
import fs from 'node:fs'
import path from 'node:path'

const DATEI = path.resolve(process.cwd(),
  'packages/ui/src/koerperkarte-pfade.ts')
const s = fs.readFileSync(DATEI, 'utf8')

// Der MUSKELN-Block.
const von = s.indexOf('export const MUSKELN')
const bis = s.indexOf('export const UMRISS_VORNE')
const blok = s.slice(von, bis)

/** Der erste `M x y` eines Pfades - der absolute Startpunkt. */
function start(d) {
  const m = d.match(/^\s*M\s*(-?[\d.]+)[ ,]+(-?[\d.]+)/)
  return m ? { x: Math.round(Number(m[1])), y: Math.round(Number(m[2])) } : null
}

// Je Flaeche: side, paths, paths_front, paths_back.
//
// `[cmd]` **Klammern ZAEHLEN, nicht auf `\n    },` hoffen** - der
// erste Anlauf mit nicht-gieriger Suche lief ueber die Grenze und
// meldete fuer `chest` sechs `paths_back` (die von `upper-back`).
// **Fuenf Flaechen statt 21, und die Zahlen falsch.**
function bloecke(text) {
  const aus = []
  // `[cmd]` **Auch die Schluessel IN ANFUEHRUNGSZEICHEN** -
  // `'upper-back'` und `'lower-back'` heissen so, weil ein
  // Bindestrich keinen nackten Schluessel erlaubt. **Mein erster
  // Anlauf fand sie nicht und meldete 21 statt 23 Flaechen.**
  const re = /\n {4}'?([a-z_-]+)'?:\s*\{/g
  let m
  while ((m = re.exec(text)) !== null) {
    let tiefe = 1
    let i = m.index + m[0].length
    let inStr = null
    for (; i < text.length && tiefe > 0; i++) {
      const c = text[i]
      if (inStr) {
        if (c === '\\') i += 1
        else if (c === inStr) inStr = null
        continue
      }
      if (c === '"' || c === "'" || c === '`') inStr = c
      else if (c === '{') tiefe += 1
      else if (c === '}') tiefe -= 1
    }
    aus.push({ name: m[1], rumpf: text.slice(m.index + m[0].length, i - 1) })
    re.lastIndex = i
  }
  return aus
}

const flaechen = []
for (const t of bloecke(blok)) {
  const name = t.name
  const rumpf = t.rumpf
  const side = (rumpf.match(/side:\s*'(\w+)'/) ?? [])[1] ?? '?'
  const label = (rumpf.match(/label:\s*'([^']+)'/) ?? [])[1] ?? ''

  const gruppen = {}
  for (const schl of ['paths', 'paths_front', 'paths_back']) {
    const g = rumpf.match(new RegExp(`${schl}:\\s*\\[([\\s\\S]*?)\\]`))
    if (!g) continue
    // Jeder Pfad steht als "..." im Array.
    const pfade = [...g[1].matchAll(/"((?:[^"\\]|\\.)*)"/g)].map(m => m[1])
    if (pfade.length > 0) {
      gruppen[schl] = pfade.map((d, i) => ({
        nr: i + 1, laenge: d.length, start: start(d),
      }))
    }
  }
  flaechen.push({ name, label, side, gruppen })
}

console.log(`${flaechen.length} Flaechen in MUSKELN\n`)

let mehr = 0
for (const f of flaechen) {
  const summe = Object.values(f.gruppen).reduce((n, g) => n + g.length, 0)
  if (summe > 1) mehr += 1
  const teile = Object.entries(f.gruppen)
    .map(([k, g]) => `${k}=${g.length}`).join(' ')
  console.log(`${f.name.padEnd(12)} ${f.side.padEnd(6)} ${String(summe).padStart(2)} Pfade   ${teile}`)
  for (const [k, g] of Object.entries(f.gruppen)) {
    for (const p of g) {
      console.log(`    ${k} #${p.nr}  x${String(p.start?.x ?? '?').padStart(5)}`
        + ` y${String(p.start?.y ?? '?').padStart(5)}   ${String(p.laenge).padStart(4)} Zeichen`)
    }
  }
}

console.log(`\n${mehr} von ${flaechen.length} Flaechen haben mehr als einen Pfad.`)
