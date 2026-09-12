// G-431/A2 - `hamstring` in lateral und medial teilen.
//
// ══ WAS DAS BILD ZEIGT ══════════════════════════════════════════════
//
// `[cmd]` **Acht Pfade, je Seite vier**
// (`docs/bilder/g431/tafel-hamstring-back.png`):
//
//     links   1 aussen-Rand   2 breit AUSSEN
//             3 breit INNEN   4 schmal innen
//     rechts  5 6 7 8, gespiegelt
//
// `[read]` **Das sind ZWEI Muskelgruppen je Seite**, nicht eine:
// aussen der `Biceps Femoris`, innen `Semitendinosus` und
// `Semimembranosus`. **Beide Namen fuehrt `training.muscle_groups`.**
//
// `[cmd]` **Anders als `quadriceps`** - dort liegt EINE grosse Masse
// mit zwei schmalen Raendern, hier liegen ZWEI breite Straenge
// nebeneinander.
//
// `[read]` **Die Pfade bleiben UNVERAENDERT.**
import fs from 'node:fs'
import path from 'node:path'

const WURZEL = path.resolve(import.meta.dirname, '..')
const ZIEL = path.join(WURZEL, 'packages/ui/src/koerperkarte-pfade.ts')
const text = fs.readFileSync(ZIEL, 'utf8')

const m = text.match(/\n {4}'?hamstring'?:\s*\{ side:'back', paths:\[/)
if (!m) throw new Error('Block `hamstring` nicht gefunden.')
const von = m.index + 1
const kopf = m[0].slice(1)
const bis = text.indexOf('] },', von)
if (bis < 0) throw new Error('Ende von `hamstring` nicht gefunden.')

const pfade = text.slice(von + kopf.length, bis).split('\n').map(z => z.trim())
  .filter(z => z.startsWith('"')).map(z => z.replace(/,$/, ''))

console.log(`hamstring: ${pfade.length} Pfade`)
if (pfade.length !== 8) {
  throw new Error(`hamstring hat ${pfade.length} Pfade, erwartet 8.`)
}

// ── Welcher Pfad wohin ──────────────────────────────────────────
//
// `[cmd]` **Am Bild bestimmt**, `hamstring-back-1..8.png`:
//
//     1, 2   linke Seite, AUSSEN   -> biceps-femoris
//     3, 4   linke Seite, INNEN    -> semitendinosus
//     5, 6   rechte Seite, INNEN   -> semitendinosus
//     7, 8   rechte Seite, AUSSEN  -> biceps-femoris
//
// `[read]` **Die Reihenfolge ist NICHT symmetrisch** - links laeuft
// sie von aussen nach innen, rechts von innen nach aussen. **Am Bild
// nachgesehen, nicht aus dem Index geschlossen** (die Lehre aus
// G-425).
const NEU = [
  ['biceps-femoris', [0, 1, 6, 7]],
  ['semitendinosus', [2, 3, 4, 5]],
]

function block(code, indizes) {
  const zeilen = indizes.map(i => `      ${pfade[i]},`).join('\n')
  return `    '${code}':{ side:'back', paths:[\n${zeilen}\n    ] },`
}

const ersatz = NEU.map(([c, ix]) => block(c, ix)).join('\n')
const neu = text.slice(0, von) + ersatz + text.slice(bis + '] },'.length)

for (const [i, p] of pfade.entries()) {
  const n = neu.split(p).length - 1
  if (n !== 1) throw new Error(`Pfad ${i + 1} kommt ${n}x vor, erwartet 1x.`)
}
if (/\n {4}'?hamstring'?:/.test(neu)) throw new Error('`hamstring` steht noch in der Datei.')

fs.writeFileSync(ZIEL, neu)
console.log('\nGeschrieben:')
for (const [c, ix] of NEU) console.log(`  ${c.padEnd(17)} Pfade ${ix.map(i => i + 1).join(', ')}`)
