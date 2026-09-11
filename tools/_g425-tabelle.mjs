// G-425/A4 - Pfade je Flaeche gegen Muskeln je Flaeche.
//
// `[read]` **Zwei verschiedene Zahlen, die leicht verwechselt
// werden:**
//
//     Pfade    wie viele SVG-Formen die Flaeche zeichnet
//     Muskeln  wie viele Namen aus `muskel-ebenen.ts` darauf zeigen
//
// `[cmd]` **`104-muskelkarte.md:526` fuehrt die MUSKELZAHL**, nicht
// die Pfadzahl — der Auftrag nennt sie als Pfadzahl. **Bei
// `upper-back` sind beide zufaellig 6.**
import fs from 'node:fs'
import path from 'node:path'

const WURZEL = path.resolve(process.cwd())
const s = fs.readFileSync(
  path.join(WURZEL, 'packages/ui/src/koerperkarte-pfade.ts'), 'utf8')

const von = s.indexOf('export const MUSKELN')
const bis = s.indexOf('export const UMRISS_VORNE')
const blok = s.slice(von, bis)

function bloecke(text) {
  const aus = []
  const re = /\n {4}'?([a-z_-]+)'?:\s*\{/g
  let m
  while ((m = re.exec(text)) !== null) {
    let tiefe = 1, i = m.index + m[0].length, inStr = null
    for (; i < text.length && tiefe > 0; i++) {
      const c = text[i]
      if (inStr) { if (c === '\\') i += 1; else if (c === inStr) inStr = null; continue }
      if (c === '"' || c === "'" || c === '`') inStr = c
      else if (c === '{') tiefe += 1
      else if (c === '}') tiefe -= 1
    }
    aus.push({ name: m[1], rumpf: text.slice(m.index + m[0].length, i - 1) })
    re.lastIndex = i
  }
  return aus
}

const pfadZahl = {}
const seiten = {}
for (const b of bloecke(blok)) {
  seiten[b.name] = (b.rumpf.match(/side:\s*'(\w+)'/) ?? [])[1] ?? '?'
  let n = 0
  for (const schl of ['paths', 'paths_front', 'paths_back']) {
    const g = b.rumpf.match(new RegExp(`${schl}:\\s*\\[([\\s\\S]*?)\\]`))
    if (!g) continue
    n += [...g[1].matchAll(/"((?:[^"\\]|\\.)*)"/g)].length
  }
  pfadZahl[b.name] = n
}

// Die Muskelzuordnung.
const e = fs.readFileSync(
  path.join(WURZEL, 'apps/web/src/app/v2/recovery/muskel-ebenen.ts'), 'utf8')
const muskeln = {}
for (const m of e.matchAll(/^\s*'?([\w '-]+?)'?:\s*'([a-z-]+)',/gm)) {
  const flaeche = m[2]
  ;(muskeln[flaeche] ??= []).push(m[1])
}

const namen = Object.keys(pfadZahl).sort()
console.log('Flaeche       Seite   Pfade  Muskeln   Muskelnamen')
console.log('-'.repeat(78))
let mehrPfade = 0
for (const n of namen) {
  const p = pfadZahl[n]
  const ms = muskeln[n] ?? []
  if (p > 1) mehrPfade += 1
  console.log(`${n.padEnd(13)} ${seiten[n].padEnd(6)} ${String(p).padStart(5)}`
    + `  ${String(ms.length).padStart(7)}   ${ms.slice(0, 4).join(', ')}`
    + (ms.length > 4 ? ` (+${ms.length - 4})` : ''))
}
console.log('-'.repeat(78))
console.log(`${namen.length} Flaechen, ${mehrPfade} davon mit mehr als einem Pfad.`)
console.log(`${Object.values(pfadZahl).reduce((a, b) => a + b, 0)} Pfade insgesamt.`)
