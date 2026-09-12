// G-432/A1 - stimmt `pfadnamen.ts` mit der Karte ueberein?
//
// `[read]` **Die Tabelle ist eine Sammlung von Behauptungen ueber die
// Pfaddatei.** `[cmd]` **Eine abgeschriebene Zahl altert still** -
// also wird je Flaeche und Ansicht nachgezaehlt.
import fs from 'node:fs'
import path from 'node:path'

const WURZEL = path.resolve(import.meta.dirname, '..')
const s = fs.readFileSync(
  path.join(WURZEL, 'packages/ui/src/koerperkarte-pfade.ts'), 'utf8')

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
/** Die Wahrheit: je Flaeche und Ansicht die Pfadzahl. */
const IST = new Map()
for (const b of bloecke(blok)) {
  const side = (b.rumpf.match(/side:\s*'(\w+)'/) ?? [])[1] ?? '?'
  for (const schl of ['paths', 'paths_front', 'paths_back']) {
    const g = b.rumpf.match(new RegExp(`${schl}:\\s*\\[([\\s\\S]*?)\\]`))
    if (!g) continue
    const n = [...g[1].matchAll(/"((?:[^"\\]|\\.)*)"/g)].length
    if (!n) continue
    const ansicht = schl === 'paths_back' ? 'back'
      : schl === 'paths_front' ? 'front'
        : (side === 'back' ? 'back' : 'front')
    IST.set(`${b.name}/${ansicht}`, n)
  }
}

// Die Behauptungen aus `pfadnamen.ts`.
const quelle = fs.readFileSync(
  path.join(WURZEL, 'apps/web/src/lib/koerper/pfadnamen.ts'), 'utf8')
const SOLL = new Map()
const re = /flaeche:\s*'([a-z-]+)',\s*ansicht:\s*'(front|back)',\s*pfade:\s*(\d+)/g
let m
while ((m = re.exec(quelle)) !== null) SOLL.set(`${m[1]}/${m[2]}`, Number(m[3]))

console.log(`\n=== Pfadtabelle gegen die Karte ===\n`)
console.log(`  Karte:  ${IST.size} Flaeche/Ansicht-Paare, `
  + `${[...IST.values()].reduce((a, b) => a + b, 0)} Pfade`)
console.log(`  Tabelle: ${SOLL.size} Paare, `
  + `${[...SOLL.values()].reduce((a, b) => a + b, 0)} Pfade\n`)

let fehler = 0
for (const [k, n] of IST) {
  if (!SOLL.has(k)) { console.log(`  FEHLT in der Tabelle: ${k} (${n} Pfade)`); fehler += 1; continue }
  if (SOLL.get(k) !== n) {
    console.log(`  ${k.padEnd(26)} Karte ${n}, Tabelle ${SOLL.get(k)}`)
    fehler += 1
  }
}
for (const k of SOLL.keys()) {
  if (!IST.has(k)) { console.log(`  ERFUNDEN in der Tabelle: ${k}`); fehler += 1 }
}

console.log(`\n${fehler === 0 ? 'DIE TABELLE STIMMT.' : `${fehler} Abweichungen.`}`)
