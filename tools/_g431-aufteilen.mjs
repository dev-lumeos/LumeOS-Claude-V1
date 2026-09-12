// G-431/A2 - `gluteal` aufteilen. Sonst nichts.
//
// ══ WARUM NUR DIESE EINE ════════════════════════════════════════════
//
// `[cmd]` **Zwoelf Flaechen geprueft, je Pfad ein Bild**
// (`docs/bilder/g431/`). **Elf bleiben zusammen**, eine wird geteilt.
//
// `[read]` **Die Regel aus G-425:** EIN Muskel mit mehreren Koepfen
// bleibt EIN Muskel (`triceps`: acht Pfade, drei Koepfe). **Nur wo
// VERSCHIEDENE Muskeln in einem Schluessel stecken, wird getrennt.**
//
// `[cmd]` **`gluteal` am Bild:** je Seite eine GROSSE Masse und eine
// KLEINE Kappe oben aussen. **Das sind zwei Muskeln**, und
// `training.muscle_groups` fuehrt beide Namen:
// `Gluteus Maximus` und `Gluteus Medius`.
//
// `[read]` **Die Pfade bleiben UNVERAENDERT** - nur die Zuordnung.
import fs from 'node:fs'
import path from 'node:path'

const WURZEL = path.resolve(import.meta.dirname, '..')
const ZIEL = path.join(WURZEL, 'packages/ui/src/koerperkarte-pfade.ts')
const text = fs.readFileSync(ZIEL, 'utf8')

const anker = "    gluteal:    { side:'back', paths:["
let von = text.indexOf(anker)
let kopf = anker
if (von < 0) {
  // Die Einrueckung kann abweichen - dann Zeile fuer Zeile suchen.
  const m = text.match(/\n {4}'?gluteal'?:\s*\{ side:'back', paths:\[/)
  if (!m) throw new Error('Block `gluteal` nicht gefunden.')
  von = m.index + 1
  kopf = m[0].slice(1)
}
const bis = text.indexOf('] },', von)
if (bis < 0) throw new Error('Ende von `gluteal` nicht gefunden.')

const rumpf = text.slice(von + kopf.length, bis)
const pfade = rumpf.split('\n').map(z => z.trim())
  .filter(z => z.startsWith('"')).map(z => z.replace(/,$/, ''))

console.log(`gluteal: ${pfade.length} Pfade`)
if (pfade.length !== 4) {
  throw new Error(`gluteal hat ${pfade.length} Pfade, erwartet 4 — die Messung gilt nicht mehr.`)
}

// ── Welcher Pfad wohin ──────────────────────────────────────────
//
// `[cmd]` **Am Bild bestimmt** (`tafel-gluteal-back.png`):
//
//     Pfad 1   kleine Kappe oben aussen, LINKS   -> medius
//     Pfad 2   grosse Masse, LINKS               -> maximus
//     Pfad 3   kleine Kappe oben aussen, RECHTS  -> medius
//     Pfad 4   grosse Masse, RECHTS              -> maximus
const NEU = [
  ['gluteus-medius', [0, 2]],
  ['gluteus-maximus', [1, 3]],
]

function block(code, indizes) {
  const zeilen = indizes.map(i => `      ${pfade[i]},`).join('\n')
  return `    '${code}':{ side:'back', paths:[\n${zeilen}\n    ] },`
}

const ersatz = NEU.map(([c, ix]) => block(c, ix)).join('\n')
const neu = text.slice(0, von) + ersatz + text.slice(bis + '] },'.length)

// ── Die Gegenprobe VOR dem Schreiben ────────────────────────────
for (const [i, p] of pfade.entries()) {
  const n = neu.split(p).length - 1
  if (n !== 1) throw new Error(`Pfad ${i + 1} kommt ${n}x vor, erwartet 1x.`)
}
if (/\n {4}'?gluteal'?:/.test(neu)) throw new Error('`gluteal` steht noch in der Datei.')

fs.writeFileSync(ZIEL, neu)
console.log('\nGeschrieben:')
for (const [c, ix] of NEU) console.log(`  ${c.padEnd(17)} Pfade ${ix.map(i => i + 1).join(', ')}`)
