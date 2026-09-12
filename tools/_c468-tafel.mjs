// C-468/A1 - eine TAFEL je Flaeche: alle Pfade nebeneinander.
//
// `[read]` **Achtzehn Flaechen einzeln durchzusehen kostet ein Bild
// je Pfad** - 158 Pfade insgesamt. `[cmd]` **Eine Tafel zeigt alle
// Pfade EINER Flaeche nebeneinander**, jeder fuer sich
// hervorgehoben, mit Nummer.
//
// `[read]` **Dieselbe Aussage, ein Bild statt acht** - und die
// Nachbarschaft ist mit einem Blick zu sehen.
import fs from 'node:fs'
import path from 'node:path'
import { chromium } from '@playwright/test'

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

const GRAU = '#33363c', AKZENT = '#f0a05a', GRUND = '#16171a'

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

/**
 * Ein Kaestchen je Pfad, mit Nummer.
 *
 * `[read]` **Nur der Rumpfausschnitt** - bei einem Oberschenkel
 * braucht es keinen Kopf. `[cmd]` **Der Ausschnitt kommt aus den
 * Pfaden der Flaeche selbst.**
 */
function kaestchen(hinten, flaeche, nr, alle, kasten) {
  const x0 = hinten ? VB_W : 0
  const stuecke = alle.map(p => {
    const ist = p.flaeche === flaeche && p.nr === nr
    return `<path d="${p.d}" fill="${ist ? AKZENT : GRAU}" opacity="${ist ? 1 : 0.45}"/>`
  }).join('')
  const { x, y, w, h } = kasten
  return `<div style="text-align:center">`
    + `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x} ${y} ${w} ${h}"`
    + ` width="150" height="${Math.round(150 * h / w)}" style="display:block">`
    + `<rect x="${x0}" y="0" width="${VB_W}" height="${VB_H}" fill="${GRUND}"/>`
    + `<path d="${hinten ? UMRISS_HINTEN : UMRISS_VORNE}" fill="none" stroke="#6b7078" stroke-width="3"/>`
    + stuecke + '</svg>'
    + `<div style="color:#e8e6e3;font:12px sans-serif;padding:3px">${nr}</div></div>`
}

/** Der Rahmen um alle Pfade der Flaeche, mit Rand. */
function ausschnitt(pfade, hinten) {
  let minX = 1e9, minY = 1e9, maxX = -1e9, maxY = -1e9
  for (const p of pfade) {
    // `[cmd]` **Nur die Koordinatenpaare, nicht jede Zahl** - ein
    // `a`-Bogen traegt Radien und Winkel, die keine Punkte sind und
    // den Rahmen aufblaehen.
    for (const m of p.d.matchAll(/[MLCQST]\s*(-?\d+\.?\d*)[ ,]+(-?\d+\.?\d*)/gi)) {
      const x = Number(m[1]), y = Number(m[2])
      if (x < minX) minX = x; if (x > maxX) maxX = x
      if (y < minY) minY = y; if (y > maxY) maxY = y
    }
  }
  const rand = Math.max((maxX - minX), (maxY - minY)) * 0.25
  return {
    x: minX - rand, y: minY - rand,
    w: (maxX - minX) + rand * 2, h: (maxY - minY) + rand * 2,
  }
}

const ZIEL = process.argv[2]
const ANSICHT = process.argv[3] ?? 'front'
const hinten = ANSICHT === 'back'
const m = MUSKELN[ZIEL]
if (!m) { console.log('unbekannt:', ZIEL); process.exit(1) }
const pf = m.side === 'both' ? (hinten ? m.paths_back : m.paths_front) : m.paths
if (!pf?.length) { console.log(`${ZIEL}/${ANSICHT}: keine Pfade`); process.exit(0) }

const alle = pfadeFuer(hinten)
const meine = alle.filter(p => p.flaeche === ZIEL)
const kasten = ausschnitt(meine, hinten)

const b = await chromium.launch()
const c = await b.newContext({ colorScheme: 'dark' })
const p = await c.newPage()
const ORDNER = path.join(WURZEL, 'docs/bilder/c468')
fs.mkdirSync(ORDNER, { recursive: true })

const inhalt = meine.map(x => kaestchen(hinten, ZIEL, x.nr, alle, kasten)).join('')
await p.setContent(`<body style="margin:0;background:${GRUND};display:flex;`
  + `flex-wrap:wrap;gap:6px;padding:8px;width:max-content">${inhalt}</body>`)
await p.waitForTimeout(200)
await p.screenshot({ path: path.join(ORDNER, `tafel-${ZIEL}-${ANSICHT}.png`), fullPage: true })
console.log(`tafel-${ZIEL}-${ANSICHT}.png  ${meine.length} Pfade`)
for (const x of meine) {
  const mm = x.d.match(/^M\s*([\d.]+)[ ,]+([\d.]+)/)
  console.log(`  #${String(x.nr).padStart(2)}  x${Math.round(Number(mm?.[1] ?? 0))
    .toString().padStart(5)} y${Math.round(Number(mm?.[2] ?? 0)).toString().padStart(5)}`)
}
await b.close()
