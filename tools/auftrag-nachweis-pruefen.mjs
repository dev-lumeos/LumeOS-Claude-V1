#!/usr/bin/env node
// Waechter: kein Auftrag verlangt einen vollen Kettenlauf als Nachweis.
//
// Anlass (Tom, 2026-10-01, 14:26): «das war das letztemal wo ich so einen
// scheiss sehe und auf dich oder einen agenten solange warten muss weil du
// nicht faehig bist richtige und logische auftraege zu geben.»
//
// `[cmd]` Gemessen an A-86 am 2026-10-01: der Testdatenschritt, um den es
// in dem Auftrag ging, kostet 7,076 s. Der volle Aufbau, den der Auftrag
// als Nachweis verlangte, kostet 1.300,7 s. Also 7 Sekunden Arbeit und
// 1.301 Sekunden Nachweis.
//
// `[read]` Die Regel steht in docs/punkte/00-LIESMICH.md unter «Was ein
// Auftrag als Nachweis verlangen darf». Dieser Waechter zaehlt sie nach,
// weil eine Regel, die nirgends nachgezaehlt wird, zur Empfehlung wird -
// dreimal belegt in LAUFEND.
//
// Geprueft werden nur Auftraege, die RAUS sind oder rausgehen:
// laufend_<agent>/ und laufend_<agent>/next/. Erledigte Punkte tragen
// ihre Geschichte und werden nicht umgeschrieben.
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const WURZEL = process.cwd()
const PUNKTE = join(WURZEL, 'docs', 'punkte')

// Formulierungen, die einen vollen Lauf verlangen. Bewusst eng: es geht
// um die FORDERUNG, nicht um die Erwaehnung in einem Befund.
const MUSTER = [
  /vollen?\s+Kettenlauf/i,
  /Kettenlauf\s+(gruen|grün)/i,
  /voller\s+Lauf\s+(gruen|grün)/i,
  /Laufzeit\s+vorher\s+und\s+nachher/i,
]

function dateien(verzeichnis) {
  const treffer = []
  for (const name of readdirSync(verzeichnis)) {
    const pfad = join(verzeichnis, name)
    if (statSync(pfad).isDirectory()) {
      if (name.startsWith('laufend_') || name === 'next') treffer.push(...dateien(pfad))
      continue
    }
    if (!name.endsWith('.md')) continue
    const rel = relative(WURZEL, pfad).replace(/\\/g, '/')
    if (!rel.includes('/laufend_')) continue
    treffer.push(pfad)
  }
  return treffer
}

const befunde = []
for (const pfad of dateien(PUNKTE)) {
  const text = readFileSync(pfad, 'utf8')
  // `[read]` Ein abgenommener Punkt traegt seine Geschichte und wird
  // nicht umgeschrieben - auch wenn er noch in laufend_ liegt, weil ein
  // Umzug an EPERM gescheitert ist (A-89).
  if (/^erledigt:/m.test(text)) continue
  // Nur der Abschnitt, der Nachweise verlangt - nicht die Befundlage.
  const ab = text.search(/\*\*Zu belegen:/)
  const bereich = ab < 0 ? text : text.slice(ab)
  for (const muster of MUSTER) {
    const m = bereich.match(muster)
    if (m) {
      befunde.push([relative(WURZEL, pfad).replace(/\\/g, '/'), m[0]])
      break
    }
  }
}

if (befunde.length === 0) {
  console.log('[nachweis] gruen: kein laufender Auftrag verlangt einen vollen Kettenlauf.')
  process.exit(0)
}

console.error('[nachweis] ROT: ein Auftrag verlangt einen vollen Kettenlauf.')
console.error('')
for (const [pfad, stelle] of befunde) {
  console.error(`  ${pfad}`)
  console.error(`    verlangt: "${stelle}"`)
}
console.error('')
console.error('  Ein voller Lauf dauert 1.459,7 s. Verlangt wird der')
console.error('  GEAENDERTE Schritt und seine Probe, gegen eine')
console.error('  Wegwerf-Datenbank - plus die Schrittzahl aus kette.json.')
console.error('  Der volle Lauf laeuft naechtlich, einmal.')
console.error('  Siehe docs/punkte/00-LIESMICH.md, "Was ein Auftrag als')
console.error('  Nachweis verlangen darf".')
process.exit(1)
