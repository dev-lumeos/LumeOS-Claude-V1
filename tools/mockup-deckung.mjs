// `[cmd]` **G-359, 2026-09-07.** Tom: *,,nun sehe ich dass
// tonnenweise zeugs einfach weg ist aus der ui."*
//
// `[cmd]` **Gemessen: 1.343 von 2.488 Mockup-Elementen fehlen.**
//
// `[read]` **Der Waechter misst nicht, ob etwas angebunden ist** —
// **er misst, ob es SICHTBAR ist.** `[read]` **Eine Attrappe zaehlt
// als sichtbar.**
//
// `[read]` **E-69: die Attrappe faellt erst mit Toms Abnahme** —
// **also darf die Zahl nur sinken, wenn er zugestimmt hat.**

import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs'
import { join } from 'node:path'

const MOCKUPS = 'docs/spezifikation/10-plattform/design-system/theme-v1'
const V2 = 'apps/web/src/app/v2'
const STAND = 'docs/spezifikation/10-plattform/design-system/mockup-deckung.json'
const VERWORFEN = 'docs/spezifikation/10-plattform/design-system/mockup-verworfen.json'

/** `[read]` Beschriftungen: Text zwischen Tags, und label/title-Zuweisungen. */
function texte(pfad) {
  const t = readFileSync(pfad, 'utf8')
  const s = new Set()
  for (const m of t.matchAll(/>([A-Za-z][A-Za-z0-9 \-/&.']{3,34})</g)) {
    s.add(m[1].trim())
  }
  for (const m of t.matchAll(/(?:label|title|name|heading)\s*[:=]\s*['"]([^'"]{4,34})['"]/g)) {
    s.add(m[1].trim())
  }
  for (const x of [...s]) {
    if (/^(https?|M |px|rgb)/.test(x)) s.delete(x)
  }
  return s
}

function alleTexte(verzeichnis, endung) {
  const s = new Set()
  if (!existsSync(verzeichnis)) return s
  for (const e of readdirSync(verzeichnis, { withFileTypes: true })) {
    const p = join(verzeichnis, e.name)
    if (e.isDirectory()) {
      for (const x of alleTexte(p, endung)) s.add(x)
    } else if (e.name.endsWith(endung)) {
      for (const x of texte(p)) s.add(x)
    }
  }
  return s
}

if (!existsSync(MOCKUPS)) {
  console.log('[mockup] kein theme-v1 - nichts zu pruefen.')
  process.exit(0)
}

// `[read]` **E-70: drei Zustaende.** **Verworfenes zaehlt nicht als
// fehlend** - **es ist eine Entscheidung, kein Verlust.**
const verworfen = new Map()
if (existsSync(VERWORFEN)) {
  try {
    const roh = JSON.parse(readFileSync(VERWORFEN, 'utf8'))
    for (const e of roh.verworfen ?? []) {
      if (!e.modul || !e.element) continue
      if (!verworfen.has(e.modul)) verworfen.set(e.modul, new Set())
      verworfen.get(e.modul).add(e.element)
    }
  } catch { /* `[read]` unlesbar heisst: nichts verworfen */ }
}

const je = new Map()
for (const f of readdirSync(MOCKUPS)) {
  if (!f.startsWith('module-') || !f.endsWith('.jsx')) continue
  const modul = f.replace('module-', '').replace('.jsx', '').split('-')[0]
  if (!je.has(modul)) je.set(modul, new Set())
  for (const x of texte(join(MOCKUPS, f))) je.get(modul).add(x)
}

const zeilen = []
let gesM = 0, gesF = 0
for (const [modul, mock] of [...je].sort()) {
  const d = join(V2, modul)
  if (!existsSync(d)) {
    zeilen.push({ modul, mockup: mock.size, fehlt: null })
    continue
  }
  const ui = alleTexte(d, '.tsx')
  const weg = verworfen.get(modul) ?? new Set()
  let fehlt = 0
  for (const x of mock) if (!ui.has(x) && !weg.has(x)) fehlt += 1
  gesM += mock.size
  gesF += fehlt
  zeilen.push({ modul, mockup: mock.size, fehlt, verworfen: weg.size })
}

let gesV = 0
for (const s of verworfen.values()) gesV += s.size
console.log(`[mockup] ${gesM - gesF - gesV} von ${gesM} sichtbar, `
  + `${gesV} verworfen, ${gesF} fehlen`)

// `[read]` **Der Vergleich mit dem letzten Stand.** **Steigt die
// Zahl, ist etwas verschwunden** - **und das ist immer ein Fehler.**
let vorher = null
if (existsSync(STAND)) {
  try { vorher = JSON.parse(readFileSync(STAND, 'utf8')) } catch { vorher = null }
}

if (vorher && typeof vorher.fehlt === 'number') {
  if (gesF > vorher.fehlt) {
    console.log(`[mockup] ROT: ${gesF - vorher.fehlt} Element(e) sind seit`
      + ` ${vorher.gemessen} aus der UI verschwunden.`)
    console.log('[mockup] E-68: nicht anbindbar heisst als Attrappe sichtbar bleiben.')
    for (const z of zeilen.filter(x => x.fehlt !== null).sort((a, b) => b.fehlt - a.fehlt).slice(0, 5)) {
      console.log(`  ${z.modul.padEnd(14)} ${String(z.fehlt).padStart(5)} von ${z.mockup}`)
    }
    process.exit(1)
  }
  if (gesF < vorher.fehlt) {
    console.log(`[mockup] ${vorher.fehlt - gesF} Element(e) zurueckgebracht.`
      + ' Stand mit --schreiben festhalten.')
  }
}

if (process.argv.includes('--schreiben')) {
  const { writeFileSync } = await import('node:fs')
  writeFileSync(STAND, JSON.stringify({
    gemessen: new Date().toISOString().slice(0, 10),
    gesamt: gesM, sichtbar: gesM - gesF - gesV,
    verworfen: gesV, fehlt: gesF, je: zeilen
  }, null, 2) + '\n', 'utf8')
  console.log(`[mockup] Stand festgehalten: ${gesF} fehlen.`)
}
