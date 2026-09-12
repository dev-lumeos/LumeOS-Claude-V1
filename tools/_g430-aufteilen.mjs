// G-430/A1 - `upper-back` und `lower-back` aufteilen.
//
// ══ WARUM ALS SKRIPT UND NICHT VON HAND ═════════════════════════════
//
// `[cmd]` **Die Datei sagt es selbst** (Zeile 10-13): *,,MECHANISCH
// UEBERNOMMEN, nicht abgetippt. Ein Tippfehler in einer Bezierkurve
// faellt beim Lesen nicht auf, sondern erst als verzogener Muskel."*
//
// `[read]` **Also werden die Pfadzeichenketten VERSCHOBEN, nie
// getippt** - dieses Skript schneidet sie aus und setzt sie unter
// neuen Schluesseln wieder ein. **Kein Pfad wird neu gezeichnet.**
//
// ══ WELCHER PFAD WOHIN ══════════════════════════════════════════════
//
// `[cmd]` **AM BILD bestimmt, nicht aus Koordinaten** - die achtzehn
// Bilder aus G-425 liegen in `docs/bilder/g425/`, und ich habe
// `upper-back-1/2/3.png` dafuer noch einmal angesehen.
//
//     Pfad 1 / 4   kleines Dreieck OBEN am Schulterblatt,
//                  zwischen Wirbelsaeule und Schulter
//                  -> teres-minor (Rotatorenmanschette)
//     Pfad 2 / 5   schmale Sichel am AUSSENRAND des
//                  Schulterblatts, unter der hinteren Schulter
//                  -> teres-major
//     Pfad 3 / 6   BREITES Dreieck von der Achsel zur Taille,
//                  nach unten spitz -> latissimus
//     lower 1 / 4  Fleck seitlich ueber der Huefte -> flanke
//     lower 2 / 3  langes Band neben der Wirbelsaeule
//                  -> erector-spinae
//
// `[cmd]` **DER AUFTRAG NENNT EINE ANDERE ZUORDNUNG** - *,,Pfad 1/4
// Teres major, Pfad 2/5 Teres minor"*. **Am Bild ist es umgekehrt:**
// Pfad 2 ist die Sichel am Aussenrand (Teres major zieht zum
// Oberarm), Pfad 1 das Dreieck darueber.
//
// `[read]` **G-425 hat genau davor gewarnt:** *,,Bei einer
// gespiegelten Figur heisst groesseres x auf der linken
// Koerperhaelfte weiter zur Mitte - die Zahl allein sagt es nicht."*
//
// `[read]` **Die Reihenfolge im Array ist die Messreihenfolge** -
// Pfad 1-3 ist die linke Koerperhaelfte, 4-6 die rechte.
import fs from 'node:fs'
import path from 'node:path'

const WURZEL = path.resolve(import.meta.dirname, '..')
const ZIEL = path.join(WURZEL, 'packages/ui/src/koerperkarte-pfade.ts')
const text = fs.readFileSync(ZIEL, 'utf8')

/** Die Pfade eines Blocks herausschneiden - als ZEICHENKETTEN. */
function pfadeVon(name) {
  const anker = `    '${name}':{ side:'back', paths:[`
  const von = text.indexOf(anker)
  if (von < 0) throw new Error(`Block "${name}" nicht gefunden.`)
  const bis = text.indexOf('] },', von)
  if (bis < 0) throw new Error(`Ende von "${name}" nicht gefunden.`)
  const rumpf = text.slice(von + anker.length, bis)
  // Jede Zeile, die mit " beginnt, ist ein Pfad.
  const pfade = rumpf.split('\n').map(z => z.trim())
    .filter(z => z.startsWith('"'))
    .map(z => z.replace(/,$/, ''))
  return { von, bis: bis + '] },'.length, pfade }
}

const ub = pfadeVon('upper-back')
const lb = pfadeVon('lower-back')

console.log(`upper-back: ${ub.pfade.length} Pfade`)
console.log(`lower-back: ${lb.pfade.length} Pfade`)
if (ub.pfade.length !== 6) throw new Error('upper-back hat nicht 6 Pfade — die Messung aus G-425 gilt nicht mehr.')
if (lb.pfade.length !== 4) throw new Error('lower-back hat nicht 4 Pfade — die Messung aus G-425 gilt nicht mehr.')

// ── Die neue Zuordnung: je Flaeche ihre Pfade ───────────────────
//
// `[read]` **Index 0-basiert, die Messung 1-basiert:**
// Pfad 1 -> [0], Pfad 4 -> [3].
const NEU_UB = [
  ['teres-minor', [0, 3], 'Teres minor', 'Teres minor'],
  ['teres-major', [1, 4], 'Teres major', 'Teres major'],
  ['latissimus', [2, 5], 'Latissimus dorsi', 'Latissimus dorsi'],
]
const NEU_LB = [
  ['flanke', [0, 3], 'Flanke', 'Flank'],
  ['erector-spinae', [1, 2], 'Rückenstrecker', 'Erector spinae'],
]

function block(code, indizes, pfade) {
  const zeilen = indizes.map(i => `      ${pfade[i]},`).join('\n')
  return `    '${code}':{ side:'back', paths:[\n${zeilen}\n    ] },`
}

const ersatzUB = NEU_UB.map(([c, ix]) => block(c, ix, ub.pfade)).join('\n')
const ersatzLB = NEU_LB.map(([c, ix]) => block(c, ix, lb.pfade)).join('\n')

// `[read]` **Von hinten nach vorn ersetzen** - sonst verschieben sich
// die Indizes des zweiten Blocks (die Lehre aus `verschieben-braucht-
// eine-richtung`).
let neu = text
if (lb.von > ub.von) {
  neu = neu.slice(0, lb.von) + ersatzLB + neu.slice(lb.bis)
  neu = neu.slice(0, ub.von) + ersatzUB + neu.slice(ub.bis)
} else {
  neu = neu.slice(0, ub.von) + ersatzUB + neu.slice(ub.bis)
  neu = neu.slice(0, lb.von) + ersatzLB + neu.slice(lb.bis)
}

// ── Die Gegenprobe VOR dem Schreiben ────────────────────────────
//
// `[cmd]` **Jeder Pfad muss im Ergebnis genau einmal vorkommen** -
// verloren waere ein nicht gezeichneter Muskel, doppelt ein zweimal
// gezeichneter.
for (const [i, p] of [...ub.pfade, ...lb.pfade].entries()) {
  const n = neu.split(p).length - 1
  if (n !== 1) throw new Error(`Pfad ${i + 1} kommt ${n}x vor, erwartet 1x.`)
}
// Und die alten Schluessel duerfen weg sein.
for (const alt of ["'upper-back':", "'lower-back':"]) {
  if (neu.includes(alt)) throw new Error(`"${alt}" steht noch in der Datei.`)
}

fs.writeFileSync(ZIEL, neu)
console.log('\nGeschrieben. Neue Flaechen:')
for (const [c, ix] of [...NEU_UB, ...NEU_LB]) {
  console.log(`  ${c.padEnd(16)} Pfade ${ix.map(i => i + 1).join(', ')}`)
}
