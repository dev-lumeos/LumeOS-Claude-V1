// C-468/A1 - alle 23 Flaechen einzeln ansehen.
//
// `[read]` **G-425 hat fuenf angesehen, achtzehn sind ungeprueft.**
// `[cmd]` **Derselbe Weg wie dort:** ein Pfad in Akzentfarbe, alle
// anderen grau - die Zahlen sagen wo, das Bild sagt was.
//
// `[read]` **`packages/ui` wird NICHT angefasst** - die SVG entsteht
// hier aus denselben Daten.
import fs from 'node:fs'
import path from 'node:path'
import { chromium } from '@playwright/test'

const WURZEL = path.resolve(process.cwd())
const s = fs.readFileSync(
  path.join(WURZEL, 'packages/ui/src/koerperkarte-pfade.ts'), 'utf8')

const von = s.indexOf('export const MUSKELN')
const bis = s.indexOf('export const UMRISS_VORNE')
const blok = s.slice(von, bis)

/** Klammern zaehlen - ein nicht-gieriger Ausdruck laeuft ueber die Grenze. */
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

const MUSKELN = {}
for (const b of bloecke(blok)) {
  const side = (b.rumpf.match(/side:\s*'(\w+)'/) ?? [])[1] ?? '?'
  const e = { side }
  for (const schl of ['paths', 'paths_front', 'paths_back']) {
    const g = b.rumpf.match(new RegExp(`${schl}:\\s*\\[([\\s\\S]*?)\\]`))
    if (!g) continue
    const pf = [...g[1].matchAll(/"((?:[^"\\]|\\.)*)"/g)].map(x => x[1])
    if (pf.length) e[schl] = pf
  }
  MUSKELN[b.name] = e
}

const UMRISS_VORNE = (s.match(/export const UMRISS_VORNE: string = "((?:[^"\\]|\\.)*)"/) ?? [])[1]
const UMRISS_HINTEN = (s.match(/export const UMRISS_HINTEN: string = "((?:[^"\\]|\\.)*)"/) ?? [])[1]

const t = fs.readFileSync(path.join(WURZEL, 'packages/ui/src/koerperkarte.tsx'), 'utf8')
const VB_W = Number((t.match(/VB_W\s*=\s*(\d+)/) ?? [])[1])
const VB_H = Number((t.match(/VB_H\s*=\s*(\d+)/) ?? [])[1])

const GRAU = '#3a3d44', AKZENT = '#f0a05a', GRUND = '#16171a'

/** Alle Pfade einer Ansicht, flach. */
function pfadeFuer(hinten) {
  const liste = []
  for (const [name, m] of Object.entries(MUSKELN)) {
    let pf
    if (m.side === 'both') pf = hinten ? m.paths_back : m.paths_front
    else if ((m.side === 'back') === hinten) pf = m.paths
    if (!pf?.length) continue
    pf.forEach((d, i) => liste.push({ flaeche: name, nr: i + 1, d }))
  }
  return liste
}

function svg(hinten, hervor) {
  const alle = pfadeFuer(hinten)
  const x0 = hinten ? VB_W : 0
  const stuecke = alle.map(p => {
    const ist = hervor && p.flaeche === hervor.flaeche && p.nr === hervor.nr
    return `<path d="${p.d}" fill="${ist ? AKZENT : GRAU}" opacity="${ist ? 1 : 0.5}"/>`
  }).join('')
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x0} 0 ${VB_W} ${VB_H}"`
    + ` width="560" height="${Math.round(560 * VB_H / VB_W)}" style="display:block">`
    + `<rect x="${x0}" y="0" width="${VB_W}" height="${VB_H}" fill="${GRUND}"/>`
    + `<path d="${hinten ? UMRISS_HINTEN : UMRISS_VORNE}" fill="none" stroke="#6b7078" stroke-width="2"/>`
    + stuecke + '</svg>'
}

// Welche Flaeche, welche Ansicht?
const ZIEL = process.argv[2]
if (!ZIEL) {
  console.log('Aufruf: node tools/_c468-flaechen.mjs <flaeche> [front|back]')
  for (const [n, m] of Object.entries(MUSKELN)) {
    const f = m.paths?.length ?? m.paths_front?.length ?? 0
    const b = m.paths_back?.length ?? 0
    console.log(`  ${n.padEnd(12)} ${m.side.padEnd(6)} front=${f} back=${b}`)
  }
  process.exit(0)
}
const ANSICHT = process.argv[3] ?? 'front'
const hinten = ANSICHT === 'back'
const m = MUSKELN[ZIEL]
if (!m) { console.log('unbekannt:', ZIEL); process.exit(1) }
const pf = m.side === 'both' ? (hinten ? m.paths_back : m.paths_front) : m.paths
if (!pf?.length) { console.log(`${ZIEL} hat in ${ANSICHT} keine Pfade`); process.exit(0) }

const b = await chromium.launch()
const c = await b.newContext({ colorScheme: 'dark' })
const p = await c.newPage()
const ORDNER = path.join(WURZEL, 'docs/bilder/c468')
fs.mkdirSync(ORDNER, { recursive: true })

console.log(`${ZIEL} / ${ANSICHT}: ${pf.length} Pfade`)
for (let i = 0; i < pf.length; i++) {
  await p.setContent(`<body style="margin:0;background:${GRUND}">`
    + svg(hinten, { flaeche: ZIEL, nr: i + 1 }) + '</body>')
  await p.waitForTimeout(120)
  const name = `${ZIEL}-${ANSICHT}-${i + 1}`
  await p.locator('svg').screenshot({ path: path.join(ORDNER, `${name}.png`) })
  const mm = pf[i].match(/^M\s*([\d.]+)[ ,]+([\d.]+)/)
  console.log(`  ${name.padEnd(24)} x${Math.round(Number(mm?.[1] ?? 0))
    .toString().padStart(5)} y${Math.round(Number(mm?.[2] ?? 0)).toString().padStart(5)}`
    + `  ${String(pf[i].length).padStart(4)} Zeichen`)
}
await b.close()
