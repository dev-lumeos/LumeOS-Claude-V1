// G-431 - die Pfadzahlen SELBST nachzaehlen.
//
// `[read]` **Eine Zahl im Auftrag ist eine Ausgangsvermutung.**
// `[cmd]` **G-425 hat zweimal eine Auftragszahl widerlegt:**
// `lower-back` hatte vier Pfade statt zwei, und 23 Flaechen statt 21
// (die zwei mit Bindestrich standen in Anfuehrungszeichen).
import fs from 'node:fs'
import path from 'node:path'

const WURZEL = path.resolve(import.meta.dirname, '..')
const s = fs.readFileSync(
  path.join(WURZEL, 'packages/ui/src/koerperkarte-pfade.ts'), 'utf8')

/** Klammern zaehlen - ein nicht-gieriger Ausdruck laeuft ueber. */
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

const blok = s.slice(s.indexOf('export const MUSKELN'), s.indexOf('export const UMRISS_VORNE'))
const roh = bloecke(blok)
if (roh.length < 20) throw new Error(`nur ${roh.length} Flaechen geparst — das Muster passt nicht`)

const zeilen = []
for (const b of roh) {
  const side = (b.rumpf.match(/side:\s*'(\w+)'/) ?? [])[1] ?? '?'
  const z = { name: b.name, side, front: 0, back: 0 }
  for (const schl of ['paths', 'paths_front', 'paths_back']) {
    const g = b.rumpf.match(new RegExp(`${schl}:\\s*\\[([\\s\\S]*?)\\]`))
    if (!g) continue
    const n = [...g[1].matchAll(/"((?:[^"\\]|\\.)*)"/g)].length
    if (schl === 'paths') { if (side === 'back') z.back = n; else z.front = n }
    else if (schl === 'paths_front') z.front = n
    else z.back = n
  }
  zeilen.push(z)
}

console.log(`\n=== ${zeilen.length} Flaechen, Pfade je Ansicht ===\n`)
console.log('  Flaeche          Seite   front  back   max')
console.log('  ' + '-'.repeat(46))
const ueber2 = []
for (const z of zeilen.sort((a, b) => Math.max(b.front, b.back) - Math.max(a.front, a.back))) {
  const max = Math.max(z.front, z.back)
  console.log(`  ${z.name.padEnd(16)} ${z.side.padEnd(7)} ${String(z.front).padStart(5)}`
    + ` ${String(z.back).padStart(5)} ${String(max).padStart(5)}`)
  if (max > 2) ueber2.push(z.name)
}
console.log(`\nMehr als 2 Pfade je Ansicht: ${ueber2.length}`)
console.log(`  ${ueber2.join(', ')}`)
console.log(`\nSumme aller Pfade: ${zeilen.reduce((a, z) => a + z.front + z.back, 0)}`)
