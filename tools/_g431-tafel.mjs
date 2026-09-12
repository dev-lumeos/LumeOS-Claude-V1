// G-431/A1 - alle Pfade einer Flaeche NEBENEINANDER.
//
// `[read]` **Die Frage von A2 ist ein VERGLEICH** - „ist Pfad 3 ein
// anderer Muskel als Pfad 1?" laesst sich an einem Einzelbild nicht
// beantworten. **Eine Tafel zeigt sie nebeneinander.**
//
// `[cmd]` **Zusaetzlich eine Zeile, die je Pfad eine EIGENE Farbe
// gibt** - so sieht man auf einen Blick, wie sich die Flaeche
// zerlegt, ohne acht Bilder zu vergleichen.
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

const GRAU = '#31343a', GRUND = '#16171a'
// Zwoelf gut unterscheidbare Toene - mehr Pfade hat keine Flaeche
// je Ansicht (Maximum: obliques 16, dort wiederholt es sich).
const TOENE = ['#f0a05a', '#5ac8f0', '#8ef05a', '#f05a8e', '#c88ef0',
  '#f0e05a', '#5af0c8', '#f07a5a', '#7a8ef0', '#b0f05a', '#f05ac8', '#5af07a',
  '#e08a4a', '#4ab8e0', '#7ee04a', '#e04a7e']

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

/** Die ganze Figur, EIN Pfad hervorgehoben. */
function einzeln(hinten, flaeche, nr) {
  const x0 = hinten ? VB_W : 0
  const stuecke = pfadeFuer(hinten).map(p => {
    const ist = p.flaeche === flaeche && p.nr === nr
    return `<path d="${p.d}" fill="${ist ? TOENE[0] : GRAU}" opacity="${ist ? 1 : 0.5}"/>`
  }).join('')
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x0} 0 ${VB_W} ${VB_H}"`
    + ` width="210" height="${Math.round(210 * VB_H / VB_W)}" style="display:block">`
    + `<rect x="${x0}" y="0" width="${VB_W}" height="${VB_H}" fill="${GRUND}"/>`
    + `<path d="${hinten ? UMRISS_HINTEN : UMRISS_VORNE}" fill="none" stroke="#6b7078" stroke-width="2"/>`
    + stuecke + '</svg>'
}

/** Alle Pfade der Flaeche, je eine eigene Farbe. */
function bunt(hinten, flaeche) {
  const x0 = hinten ? VB_W : 0
  const stuecke = pfadeFuer(hinten).map(p => {
    const ist = p.flaeche === flaeche
    return `<path d="${p.d}" fill="${ist ? TOENE[(p.nr - 1) % TOENE.length] : GRAU}"`
      + ` opacity="${ist ? 1 : 0.4}"/>`
  }).join('')
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x0} 0 ${VB_W} ${VB_H}"`
    + ` width="330" height="${Math.round(330 * VB_H / VB_W)}" style="display:block">`
    + `<rect x="${x0}" y="0" width="${VB_W}" height="${VB_H}" fill="${GRUND}"/>`
    + `<path d="${hinten ? UMRISS_HINTEN : UMRISS_VORNE}" fill="none" stroke="#6b7078" stroke-width="2"/>`
    + stuecke + '</svg>'
}

const ZIEL = process.argv[2]
const ANSICHT = process.argv[3] ?? 'front'
if (!ZIEL) { console.log('Aufruf: node tools/_g431-tafel.mjs <flaeche> [front|back]'); process.exit(0) }
const hinten = ANSICHT === 'back'
const m = MUSKELN[ZIEL]
if (!m) { console.log('unbekannt:', ZIEL); process.exit(1) }
const pf = m.side === 'both' ? (hinten ? m.paths_back : m.paths_front) : m.paths
if (!pf?.length) { console.log(`${ZIEL}/${ANSICHT}: keine Pfade`); process.exit(0) }

const ORDNER = path.join(WURZEL, 'docs/bilder/g431')
fs.mkdirSync(ORDNER, { recursive: true })

const b = await chromium.launch()
const p = await (await b.newContext({ colorScheme: 'dark' })).newPage()

const kacheln = pf.map((_, i) => `<figure style="margin:0">`
  + `<figcaption style="color:#cfd3da;font:600 13px monospace;padding:3px 0">`
  + `${i + 1}</figcaption>${einzeln(hinten, ZIEL, i + 1)}</figure>`).join('')

await p.setContent(`<body style="margin:0;background:${GRUND};padding:10px">`
  + `<div style="color:#f0a05a;font:700 16px monospace;padding:4px 0 10px">`
  + `${ZIEL} / ${ANSICHT} — ${pf.length} Pfade</div>`
  + `<div style="display:flex;gap:8px;align-items:flex-start">`
  + `<figure style="margin:0"><figcaption style="color:#cfd3da;font:600 13px monospace;padding:3px 0">`
  + `alle, je eigene Farbe</figcaption>${bunt(hinten, ZIEL)}</figure>`
  + `<div style="display:flex;flex-wrap:wrap;gap:6px;max-width:900px">${kacheln}</div>`
  + `</div></body>`)
await p.waitForTimeout(200)
const ziel = path.join(ORDNER, `tafel-${ZIEL}-${ANSICHT}.png`)
await p.locator('body').screenshot({ path: ziel })
console.log(`${ZIEL}/${ANSICHT}: ${pf.length} Pfade -> docs/bilder/g431/tafel-${ZIEL}-${ANSICHT}.png`)
await b.close()
