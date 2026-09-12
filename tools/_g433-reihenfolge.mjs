// G-433 - die kleinere Flaeche zuletzt zeichnen.
//
// ══ DER BEFUND ══════════════════════════════════════════════════════
//
// `[cmd]` **Am Schirm gemessen** (`tools/_g433-schirm.mjs`):
// `adductor-brevis` **war zu 100 % unerreichbar** - kein Punkt eines
// 29x29-Rasters traf ihn, an seiner Stelle lag `adductor-magnus`.
//
// `[read]` **Er IST gezeichnet** (`tafel-adductor-brevis-front.png`
// zeigt zwei schmale Keile) - **aber der Magnus wird spaeter
// gerendert und liegt darueber.**
//
// `[read]` **SVG kennt kein z-index** - die Reihenfolge im Dokument
// entscheidet. **Also wird der kleinere Block nach hinten
// verschoben**, nicht die Komponente geaendert: `packages/ui` gehoert
// allen Apps, und eine Sortierregel dort traefe jede Karte.
//
// `[cmd]` **Kein Pfad wird veraendert** - nur die Reihenfolge zweier
// Bloecke.
import fs from 'node:fs'
import path from 'node:path'

const WURZEL = path.resolve(import.meta.dirname, '..')
const ZIEL = path.join(WURZEL, 'packages/ui/src/koerperkarte-pfade.ts')
let text = fs.readFileSync(ZIEL, 'utf8')

const zaehle = (s) => [...s.slice(s.indexOf('export const MUSKELN'),
  s.indexOf('export const UMRISS_VORNE')).matchAll(/"(M[^"]{20,})"/g)].length
const VORHER = zaehle(text)

/** Einen Block als Text herausschneiden. */
function schneide(code) {
  const anker = `    '${code}': {`
  const von = text.indexOf(anker)
  if (von < 0) throw new Error(`Block "${code}" nicht gefunden.`)
  // Bis zur schliessenden Klammer auf derselben Ebene, samt Komma.
  let tiefe = 0, i = von, inStr = null
  for (; i < text.length; i++) {
    const c = text[i]
    if (inStr) { if (c === '\\') i += 1; else if (c === inStr) inStr = null; continue }
    if (c === '"' || c === "'") inStr = c
    else if (c === '{') tiefe += 1
    else if (c === '}') { tiefe -= 1; if (tiefe === 0) break }
  }
  let bis = i + 1
  if (text[bis] === ',') bis += 1
  if (text[bis] === '\n') bis += 1
  return { von, bis, inhalt: text.slice(von, bis) }
}

// `[read]` **Der KLEINERE zuletzt** - er soll oben liegen.
const KLEIN = 'adductor-brevis'
const GROSS = 'adductor-magnus'

const k = schneide(KLEIN)
console.log(`\n${KLEIN}: ${k.inhalt.length} Zeichen ausgeschnitten`)
text = text.slice(0, k.von) + text.slice(k.bis)

// Hinter den groesseren Block setzen.
const g = schneide(GROSS)
text = text.slice(0, g.bis) + k.inhalt + text.slice(g.bis)
console.log(`hinter ${GROSS} eingefuegt`)

// ── Die Gegenprobe VOR dem Schreiben ────────────────────────────
if (zaehle(text) !== VORHER) {
  throw new Error(`Pfadzahl geaendert: ${VORHER} -> ${zaehle(text)}`)
}
const iK = text.indexOf(`    '${KLEIN}': {`)
const iG = text.indexOf(`    '${GROSS}': {`)
if (iK < iG) throw new Error(`"${KLEIN}" steht immer noch VOR "${GROSS}".`)

fs.writeFileSync(ZIEL, text)
console.log(`\nGeschrieben. Pfade unveraendert: ${zaehle(text)}`)
