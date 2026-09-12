// G-430/A1+A2 - je NEUE Flaeche ein Bild.
//
// `[read]` **Nicht je Pfad wie in C-468, sondern je FLAECHE** - die
// Frage ist, ob `latissimus` als EINE anwaehlbare Flaeche dasteht,
// nicht ob ein einzelner Pfad da ist.
//
// `[cmd]` **Die SVG entsteht aus denselben Daten wie die Karte** -
// `packages/ui` wird dafuer nicht angefasst.
import fs from 'node:fs'
import path from 'node:path'
import { chromium } from '@playwright/test'

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
if (Object.keys(MUSKELN).length < 20) throw new Error('zu wenige Flaechen geparst')

const UMRISS_VORNE = (s.match(/export const UMRISS_VORNE: string = "((?:[^"\\]|\\.)*)"/) ?? [])[1]
const UMRISS_HINTEN = (s.match(/export const UMRISS_HINTEN: string = "((?:[^"\\]|\\.)*)"/) ?? [])[1]
const t = fs.readFileSync(path.join(WURZEL, 'packages/ui/src/koerperkarte.tsx'), 'utf8')
const VB_W = Number((t.match(/VB_W\s*=\s*(\d+)/) ?? [])[1])
const VB_H = Number((t.match(/VB_H\s*=\s*(\d+)/) ?? [])[1])

const GRAU = '#3a3d44', AKZENT = '#f0a05a', GRUND = '#16171a'

function pfadeFuer(hinten) {
  const liste = []
  for (const [name, m] of Object.entries(MUSKELN)) {
    let pf
    if (m.side === 'both') pf = hinten ? m.paths_back : m.paths_front
    else if ((m.side === 'back') === hinten) pf = m.paths
    if (!pf?.length) continue
    pf.forEach(d => liste.push({ flaeche: name, d }))
  }
  return liste
}

/** Eine ganze FLAECHE hervorheben - alle ihre Pfade. */
function svg(hinten, flaeche) {
  const alle = pfadeFuer(hinten)
  const x0 = hinten ? VB_W : 0
  const stuecke = alle.map(p => {
    const ist = p.flaeche === flaeche
    return `<path d="${p.d}" fill="${ist ? AKZENT : GRAU}" opacity="${ist ? 1 : 0.45}"/>`
  }).join('')
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x0} 0 ${VB_W} ${VB_H}"`
    + ` width="520" height="${Math.round(520 * VB_H / VB_W)}" style="display:block">`
    + `<rect x="${x0}" y="0" width="${VB_W}" height="${VB_H}" fill="${GRUND}"/>`
    + `<path d="${hinten ? UMRISS_HINTEN : UMRISS_VORNE}" fill="none" stroke="#6b7078" stroke-width="2"/>`
    + stuecke + '</svg>'
}

const ORDNER = path.join(WURZEL, 'docs/bilder/g430')
fs.mkdirSync(ORDNER, { recursive: true })

const b = await chromium.launch()
const p = await (await b.newContext({ colorScheme: 'dark' })).newPage()

const ZIELE = process.argv.slice(2)
if (ZIELE.length === 0) {
  console.log('Aufruf: node tools/_g430-flaechenbild.mjs <flaeche> [...]')
  console.log('Flaechen:', Object.keys(MUSKELN).join(', '))
  process.exit(0)
}

for (const f of ZIELE) {
  if (!MUSKELN[f]) { console.log(`  ${f.padEnd(16)} GIBT ES NICHT`); continue }
  const hinten = MUSKELN[f].side === 'back'
    || (MUSKELN[f].side === 'both' && !MUSKELN[f].paths_front)
  const markup = svg(hinten, f)
  await p.setContent(`<body style="margin:0;background:${GRUND}">${markup}</body>`)
  const ziel = path.join(ORDNER, `${f}.png`)
  await p.locator('svg').screenshot({ path: ziel })
  const anzahl = (MUSKELN[f].paths ?? MUSKELN[f].paths_back ?? MUSKELN[f].paths_front ?? []).length
  console.log(`  ${f.padEnd(16)} ${anzahl} Pfade -> docs/bilder/g430/${f}.png`)
}

await b.close()
