// G-433 - je Pfad die LAGE: welcher Strang ist welcher?
//
// `[read]` **Vor dem Aufteilen muss klar sein, WELCHER Pfad welcher
// Muskel ist** - sonst haengt der Name am falschen Strang.
//
// `[cmd]` **Die Lage kommt aus dem absoluten `M`-Startpunkt** - x
// sagt aussen/innen, y sagt oben/unten. **Das Bild entscheidet,
// diese Zahlen ordnen nur.**
import fs from 'node:fs'
import path from 'node:path'

const WURZEL = path.resolve(import.meta.dirname, '..')
const s = fs.readFileSync(
  path.join(WURZEL, 'packages/ui/src/koerperkarte-pfade.ts'), 'utf8')
const t = fs.readFileSync(path.join(WURZEL, 'packages/ui/src/koerperkarte.tsx'), 'utf8')
const VB_W = Number((t.match(/VB_W\s*=\s*(\d+)/) ?? [])[1])

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
const ZIELE = process.argv.slice(2)
if (ZIELE.length === 0) { console.log('Aufruf: node tools/_g433-lage.mjs <flaeche> [...]'); process.exit(0) }

for (const b of bloecke(blok)) {
  if (!ZIELE.includes(b.name)) continue
  const side = (b.rumpf.match(/side:\s*'(\w+)'/) ?? [])[1] ?? '?'
  for (const schl of ['paths', 'paths_front', 'paths_back']) {
    const g = b.rumpf.match(new RegExp(`${schl}:\\s*\\[([\\s\\S]*?)\\]`))
    if (!g) continue
    const pf = [...g[1].matchAll(/"((?:[^"\\]|\\.)*)"/g)].map(x => x[1])
    if (!pf.length) continue
    const hinten = schl === 'paths_back' || (schl === 'paths' && side === 'back')
    const x0 = hinten ? VB_W : 0
    const mitte = x0 + VB_W / 2
    console.log(`\n--- ${b.name} / ${hinten ? 'back' : 'front'} (${pf.length} Pfade)`)
    const zeilen = pf.map((d, i) => {
      const m = d.match(/^M\s*([\d.]+)[ ,]+([\d.]+)/)
      const x = Math.round(Number(m?.[1] ?? 0)), y = Math.round(Number(m?.[2] ?? 0))
      return { nr: i + 1, x, y, len: d.length, seite: x < mitte ? 'links' : 'rechts' }
    })
    // Je Seite nach x sortiert - so sieht man aussen/innen.
    for (const seite of ['links', 'rechts']) {
      const s2 = zeilen.filter(z => z.seite === seite).sort((a, b2) => a.x - b2.x)
      if (!s2.length) continue
      console.log(`   ${seite}:`)
      for (const z of s2) {
        console.log(`     Pfad ${String(z.nr).padStart(2)}  x=${String(z.x).padStart(4)}`
          + `  y=${String(z.y).padStart(4)}  ${String(z.len).padStart(5)} Zeichen`)
      }
    }
  }
}
