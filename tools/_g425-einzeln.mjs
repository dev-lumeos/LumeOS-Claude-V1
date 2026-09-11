// G-425/A1+A2 - jeden Pfad EINZELN einfaerben und fotografieren.
//
// **Tom:** *„ich sehe die einzelnen muskeln und ich bin mir sicher,
// die sind einzeln ansteuerbar."*
//
// `[read]` **Die Komponente faerbt je FLAECHE, nicht je Pfad** —
// `koerperkarte.tsx:315` nimmt `farben[mid]` fuer alle Pfade einer
// Flaeche. **Also wird die SVG hier direkt gebaut**, aus denselben
// Daten, ohne die Datei zu aendern.
//
// `[cmd]` **Ein Pfad in Akzentfarbe, alle anderen grau** — dann ist
// zu sehen, welcher Muskel welcher ist.
import fs from 'node:fs'
import path from 'node:path'
import { chromium } from '@playwright/test'

const WURZEL = path.resolve(process.cwd())
const DATEI = path.join(WURZEL, 'packages/ui/src/koerperkarte-pfade.ts')
const s = fs.readFileSync(DATEI, 'utf8')

// ── Die Daten lesen, ohne die Datei zu aendern ────────────────────
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
  const eintrag = { side }
  for (const schl of ['paths', 'paths_front', 'paths_back']) {
    const g = b.rumpf.match(new RegExp(`${schl}:\\s*\\[([\\s\\S]*?)\\]`))
    if (!g) continue
    const pfade = [...g[1].matchAll(/"((?:[^"\\]|\\.)*)"/g)].map(x => x[1])
    if (pfade.length) eintrag[schl] = pfade
  }
  MUSKELN[b.name] = eintrag
}

// Der Umriss der Rueckansicht.
const UMRISS_HINTEN = (s.match(/export const UMRISS_HINTEN: string = "((?:[^"\\]|\\.)*)"/) ?? [])[1]
if (!UMRISS_HINTEN) { console.log('UMRISS_HINTEN nicht gefunden'); process.exit(1) }

// ── Die Rueckansicht als SVG ──────────────────────────────────────
//
// `[cmd]` **`VB_W`/`VB_H` aus `koerperkarte.tsx`** — nicht geraten.
const VB = (s0 => {
  const t = fs.readFileSync(path.join(WURZEL, 'packages/ui/src/koerperkarte.tsx'), 'utf8')
  const w = Number((t.match(/VB_W\s*=\s*(\d+)/) ?? [])[1])
  const h = Number((t.match(/VB_H\s*=\s*(\d+)/) ?? [])[1])
  return { w, h }
})()
console.log('viewBox:', VB.w, 'x', VB.h)

const GRAU = '#3a3d44'
const AKZENT = '#f0a05a'
const GRUND = '#16171a'

/** Alle Rueckenpfade, als flache Liste mit Herkunft. */
function rueckenPfade() {
  const liste = []
  for (const [name, m] of Object.entries(MUSKELN)) {
    let pfade
    if (m.side === 'both') pfade = m.paths_back
    else if (m.side === 'back') pfade = m.paths
    if (!pfade?.length) continue
    pfade.forEach((d, i) => liste.push({ flaeche: name, nr: i + 1, d }))
  }
  return liste
}

const alle = rueckenPfade()
console.log(`${alle.length} Pfade in der Rueckansicht\n`)

/** Eine SVG, in der genau EIN Pfad farbig ist. */
function svg(hervor) {
  const stuecke = alle.map(p => {
    const ist = hervor && p.flaeche === hervor.flaeche && p.nr === hervor.nr
    return `<path d="${p.d}" fill="${ist ? AKZENT : GRAU}"`
      + ` opacity="${ist ? 1 : 0.55}" />`
  }).join('')
  // `[cmd]` **Der Ausschnitt kommt aus den PFADEN, nicht geraten** -
  // die Rueckansicht liegt in der rechten Haelfte, aber `VB_W/2` als
  // linke Kante schnitt sie an. **Gemessen: x von 724 bis 1448.**
  const x0 = VB.w, breite = VB.w
  return `<svg xmlns="http://www.w3.org/2000/svg"`
    + ` viewBox="${x0} 0 ${breite} ${VB.h}"`
    + ` width="640" height="${Math.round(640 * VB.h / breite)}"`
    + ` style="display:block">`
    + `<rect x="${x0}" y="0" width="${breite}" height="${VB.h}" fill="${GRUND}"/>`
    + `<path d="${UMRISS_HINTEN}" fill="none" stroke="#6b7078" stroke-width="2"/>`
    + stuecke
    + '</svg>'
}

// ── Fotografieren ─────────────────────────────────────────────────
const ZIELE = (process.argv[2] === 'extra'
  ? [
    // `[read]` **Die Gegenprobe:** ist `triceps` ein Muskel mit drei
    // Koepfen (dann richtig zusammengefasst) oder mehrere?
    ...Array.from({ length: 3 }, (_, i) => ({ flaeche: 'triceps', nr: i + 1 })),
    ...Array.from({ length: 2 }, (_, i) => ({ flaeche: 'gluteal', nr: i + 1 })),
  ]
  : [
    ...Array.from({ length: 6 }, (_, i) => ({ flaeche: 'upper-back', nr: i + 1 })),
    ...Array.from({ length: 4 }, (_, i) => ({ flaeche: 'lower-back', nr: i + 1 })),
    ...Array.from({ length: 2 }, (_, i) => ({ flaeche: 'trapezius', nr: i + 1 })),
  ])

const b = await chromium.launch()
const c = await b.newContext({ colorScheme: 'dark' })
const p = await c.newPage()

fs.mkdirSync(path.join(WURZEL, 'docs/bilder/g425'), { recursive: true })

// Zuerst eine Uebersicht ohne Hervorhebung.
await p.setContent(`<body style="margin:0;background:${GRUND}">${svg(null)}</body>`)
await p.waitForTimeout(200)
await p.locator('svg').screenshot({ path: 'docs/bilder/g425/00-uebersicht.png' })
console.log('00-uebersicht.png')

for (const z of ZIELE) {
  await p.setContent(`<body style="margin:0;background:${GRUND}">${svg(z)}</body>`)
  await p.waitForTimeout(150)
  const name = `${z.flaeche}-${z.nr}`
  await p.locator('svg').screenshot({ path: `docs/bilder/g425/${name}.png` })
  const q = alle.find(x => x.flaeche === z.flaeche && x.nr === z.nr)
  const m = q?.d.match(/^M\s*([\d.]+)[ ,]+([\d.]+)/)
  console.log(`${name.padEnd(16)} x${Math.round(Number(m?.[1] ?? 0))
    .toString().padStart(5)} y${Math.round(Number(m?.[2] ?? 0)).toString().padStart(5)}`)
}

await b.close()
