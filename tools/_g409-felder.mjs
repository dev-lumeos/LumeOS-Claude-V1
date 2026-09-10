// G-409/A4: je Datenkonstante die Felder der Vorlage gegen die
// gebauten.
//
// `[read]` **Nicht Kacheln zaehlen** — G-407 hat gezeigt, dass die
// Vorlage `<Card>` uneinheitlich benutzt und eine Kachelzahl in
// beide Richtungen falsch ist. `[cmd]` **Felder sind zaehlbar:**
// ein Feld der Vorlage wird im Code gelesen oder nicht.
//
// `[cmd]` **ACHTUNG BEIM AENDERN:** die Muster stehen als
// `RegExp`-Literale da, nicht als Zeichenketten. **Ein
// `new RegExp('\\.x\\b')` ueberlebt den Weg durch eine Shell nicht**
// — dort wurde aus `\\b` ein Rueckschritt-Zeichen, und die Probe
// meldete „0 % gebaut" fuer Felder, die sichtbar benutzt sind.
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

const D = 'docs/spezifikation/10-plattform/design-system/coach-portal-draft'
const A = 'apps/coach/src/components/draft'
mkdirSync('docs/bilder/g409', { recursive: true })

// 1. Welche Konstante traegt welche Felder (Vorlage)?
const felder = new Map()
for (const f of readdirSync(D).filter(x => x.endsWith('.jsx'))) {
  const t = readFileSync(join(D, f), 'utf8')
  for (const m of t.matchAll(/^const ([A-Z][A-Z_0-9]*) = /gm)) {
    const rest = t.slice(m.index + m[0].length, m.index + m[0].length + 700)
    const keys = [...rest.matchAll(/[{,]\s*([a-zA-Z_]\w*)\s*:/g)].map(x => x[1])
    if (keys.length) felder.set(m[1], [...new Set(keys)])
  }
}

// 2. Welche Felder benutzen die gebauten Ansichten?
const quelle = readdirSync(A).filter(x => x.endsWith('.tsx'))
  .map(f => readFileSync(join(A, f), 'utf8')).join('\n')
// `[read]` **Kommentarzeilen weg** — sonst zaehlt eine Begruendung
// als Benutzung, und die Probe findet ihre eigene Erklaerung.
const code = quelle.split('\n').filter(z => !z.trim().startsWith('//')).join('\n')

/**
 * Konstanten, die als NACHSCHLAGEWERK benutzt werden.
 *
 * `[cmd]` **Gemessen:** `(CN_TAGS as Record<...>)[n.tag]` liest den
 * Schluessel zur Laufzeit.  **Alle ihre Schluessel sind
 * damit in Gebrauch** — die Probe kann das nicht am Namen sehen und
 * meldete sie sonst faelschlich als fehlend.
 */
const NACHSCHLAGE = new Set([
  'CN_TAGS', 'CAL_KIND', 'NC_KIND', 'STATUS_STYLE', 'CD_PERMS',
])

/** Wird `feld` im Code als Eigenschaft gelesen oder destrukturiert? */
function benutzt(feld, konstante) {
  if (NACHSCHLAGE.has(konstante)) return true
  // `.feld` — Eigenschaftszugriff
  if (new RegExp(String.raw`\.${feld}\b`).test(code)) return true
  // `[l, feld]` oder `{ feld }` — Destrukturierung
  if (new RegExp(String.raw`[[{,]\s*${feld}\s*[\],}]`).test(code)) return true
  // `feld:` als Schluessel einer weitergegebenen Struktur
  if (new RegExp(String.raw`\b${feld}:\s`).test(code)) return true
  return false
}

const zeilen = []
for (const [k, fs] of felder) {
  if (!code.includes(k)) continue          // Konstante gar nicht benutzt
  const da = fs.filter(f => benutzt(f, k))
  zeilen.push({
    konstante: k, felder: fs.length, gebaut: da.length,
    fehlend: fs.filter(f => !da.includes(f)),
  })
}

zeilen.sort((a, b) => b.fehlend.length - a.fehlend.length || a.konstante.localeCompare(b.konstante))
console.log('Konstante              Felder  gebaut  fehlend')
for (const z of zeilen) {
  console.log(
    `${z.konstante.padEnd(22)} ${String(z.felder).padStart(5)}`
    + ` ${String(z.gebaut).padStart(7)} ${String(z.fehlend.length).padStart(8)}`
    + `  ${z.fehlend.slice(0, 7).join(' ')}`)
}
const F = zeilen.reduce((s, z) => s + z.felder, 0)
const G = zeilen.reduce((s, z) => s + z.gebaut, 0)
console.log(`\nbenutzte Konstanten: ${zeilen.length}`)
console.log(`Felder der Vorlage : ${F}`)
console.log(`davon gebaut       : ${G}  (${Math.round(G / F * 100)} %)`)
console.log(`fehlend            : ${F - G}`)
writeFileSync('docs/bilder/g409/felder.json', JSON.stringify(zeilen, null, 1))
