// G-431/A1 - je Pfad ein Bild, wie in G-425.
//
// `[read]` **Die Zahlen sagen wo, das Bild sagt was** - das ist die
// Lehre aus G-425, und dort hat sie eine Vorannahme widerlegt:
// *,,Bei einer gespiegelten Figur heisst groesseres x auf der linken
// Koerperhaelfte weiter zur Mitte."*
//
// ══ WAS DIESE FASSUNG ANDERS MACHT ══════════════════════════════════
//
// `[cmd]` **C-468 zeichnet die ganze Figur** - bei einem Pfad von
// 40 px Hoehe auf 1400 px Figur sieht man die Form nicht.
// **Hier wird ZUSAETZLICH ein Ausschnitt gerendert**, der um den
// hervorgehobenen Pfad herum zuschneidet.
//
// `[read]` **`packages/ui` wird nicht angefasst** - die SVG entsteht
// hier aus denselben Daten.
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
    pf.forEach((d, i) => liste.push({ flaeche: name, nr: i + 1, d }))
  }
  return liste
}

/**
 * Der Kasten eines Pfades - aus den ABSOLUTEN Befehlen.
 *
 * `[cmd]` **Die erste Fassung las jedes Zahlenpaar** - und traf damit
 * auch Bezier-Stuetzpunkte in RELATIVER Schreibweise (`c`, `l`, `v`)
 * und die Flags von `A`. **Gemessen: `hamstring` Pfad 1 ergab Breite
 * 971 bei einer Figur von 724 px** - unmoeglich.
 *
 * `[read]` **Jetzt nur `M` und `L` in GROSSschreibung** - das sind
 * die absoluten Ankerpunkte. **Sie reichen zum Zuschneiden**, und
 * ein falscher Ausschnitt waere schlimmer als keiner.
 */
function kasten(d) {
  const xs = [], ys = []
  const re = /([ML])\s*(-?\d+(?:\.\d+)?)[ ,]+(-?\d+(?:\.\d+)?)/g
  let m
  while ((m = re.exec(d)) !== null) { xs.push(Number(m[2])); ys.push(Number(m[3])) }
  if (xs.length === 0) return null
  return {
    x0: Math.min(...xs), x1: Math.max(...xs),
    y0: Math.min(...ys), y1: Math.max(...ys),
  }
}

/**
 * Ein Pfad hervorgehoben, moeglichst nah dran.
 *
 * `[read]` **Ohne brauchbaren Kasten die ganze Figur** - lieber ein
 * kleines Bild als ein falsch zugeschnittenes.
 */
function svg(hinten, hervor) {
  const alle = pfadeFuer(hinten)
  const x0 = hinten ? VB_W : 0
  const k = kasten(hervor.d)
  if (k && (k.x1 - k.x0) > 1 && (k.y1 - k.y0) > 1) {
    const pad = Math.max(70, (k.x1 - k.x0) * 0.8, (k.y1 - k.y0) * 0.35)
    const bx = Math.max(x0, k.x0 - pad)
    const by = Math.max(0, k.y0 - pad)
    const bw = Math.min(VB_W - (bx - x0), (k.x1 - k.x0) + pad * 2)
    const bh = Math.min(VB_H - by, (k.y1 - k.y0) + pad * 2)
    return baue(alle, hervor, `${bx} ${by} ${bw} ${bh}`,
      460, Math.round(460 * bh / bw), hinten, bx, by, bw, bh)
  }
  return baue(alle, hervor, `${x0} 0 ${VB_W} ${VB_H}`,
    420, Math.round(420 * VB_H / VB_W), hinten, x0, 0, VB_W, VB_H)
}

function baue(alle, hervor, vb, breite, hoehe, hinten, bx, by, bw, bh) {
  const stuecke = alle.map(p => {
    const ist = p.flaeche === hervor.flaeche && p.nr === hervor.nr
    return `<path d="${p.d}" fill="${ist ? AKZENT : GRAU}" opacity="${ist ? 1 : 0.45}"/>`
  }).join('')
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}"`
    + ` width="${breite}" height="${hoehe}" style="display:block">`
    + `<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" fill="${GRUND}"/>`
    + `<path d="${hinten ? UMRISS_HINTEN : UMRISS_VORNE}" fill="none" stroke="#6b7078" stroke-width="2"/>`
    + stuecke + '</svg>'
}

const ZIEL = process.argv[2]
const ANSICHT = process.argv[3] ?? 'front'
if (!ZIEL) {
  console.log('Aufruf: node tools/_g431-pfadbilder.mjs <flaeche> [front|back]')
  process.exit(0)
}
const hinten = ANSICHT === 'back'
const m = MUSKELN[ZIEL]
if (!m) { console.log('unbekannt:', ZIEL); process.exit(1) }
const pf = m.side === 'both' ? (hinten ? m.paths_back : m.paths_front) : m.paths
if (!pf?.length) { console.log(`${ZIEL} hat in ${ANSICHT} keine Pfade`); process.exit(0) }

const ORDNER = path.join(WURZEL, 'docs/bilder/g431')
fs.mkdirSync(ORDNER, { recursive: true })

const b = await chromium.launch()
const p = await (await b.newContext({ colorScheme: 'dark' })).newPage()

console.log(`${ZIEL} / ${ANSICHT}: ${pf.length} Pfade`)
for (let i = 0; i < pf.length; i++) {
  const hervor = { flaeche: ZIEL, nr: i + 1, d: pf[i] }
  // Der Ausschnitt - darauf sieht man die Form.
  await p.setContent(`<body style="margin:0;background:${GRUND}">`
    + svg(hinten, hervor) + "</body>")
  await p.waitForTimeout(110)
  await p.locator('svg').screenshot({
    path: path.join(ORDNER, `${ZIEL}-${ANSICHT}-${i + 1}.png`) })
  const mm = pf[i].match(/^M\s*([\d.]+)[ ,]+([\d.]+)/)
  const k = kasten(pf[i])
  console.log(`  ${i + 1}`.padEnd(5)
    + `x${Math.round(Number(mm?.[1] ?? 0)).toString().padStart(5)}`
    + ` y${Math.round(Number(mm?.[2] ?? 0)).toString().padStart(5)}`
    + `   Breite ${Math.round((k?.x1 ?? 0) - (k?.x0 ?? 0)).toString().padStart(4)}`
    + ` Hoehe ${Math.round((k?.y1 ?? 0) - (k?.y0 ?? 0)).toString().padStart(4)}`)
}
await b.close()
console.log(`  -> docs/bilder/g431/${ZIEL}-${ANSICHT}-*.png`)
