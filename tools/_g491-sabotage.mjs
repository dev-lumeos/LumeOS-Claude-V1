// G-491 — die Sabotageprobe zum Waechter.
//
// [read] Ein Waechter, der nur gruen werden kann, misst nichts.
// Jeder Schaden MUSS rot werden -- und die KONTROLLE muss gruen
// bleiben, sonst faellt der Waechter auf jede Aenderung und sagt
// damit auch nichts.
import { readFileSync, writeFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import path from 'node:path'

const WURZEL = path.resolve(import.meta.dirname, '..')
const LAGE = path.join(WURZEL, 'apps/web/src/lib/supplements/produkt-filter-lage.ts')
const TEST = 'src/lib/supplements/__tests__/g491-leersatz-nennt-jeden-filter.test.ts'

// [read] Je Schaden EINE Sache -- ein Schaden, der zwei Regeln
// trifft, sagt nicht, welche der Waechter sieht.
const SCHAEDEN = [
  ['Kategorie verschwiegen',
   "  if (f.kategorie) aus.push(`Kategorie „${f.kategorie}“`)",
   '  if (false) aus.push(`Kategorie`)'],
  ['Form verschwiegen',
   "  if (f.form) aus.push(`Darreichungsform „${f.form}“`)",
   '  if (false) aus.push(`Darreichungsform`)'],
  ['Marke verschwiegen',
   "  if (f.marken.length === 1) aus.push(`Marke „${f.marken[0]}“`)",
   '  if (false) aus.push(`Marke`)'],
  ['Allergenmeidung verschwiegen',
   "  if (f.allergienAn) aus.push('deine Allergenmeidung')",
   "  if (false) aus.push('deine Allergenmeidung')"],
  ['Mehrzahl der Marken faellt weg',
   '  else if (f.marken.length > 1) aus.push(`${f.marken.length} gewählte Marken`)',
   '  else if (f.marken.length > 99) aus.push(`${f.marken.length} gewählte Marken`)'],
  // [read] Die Grenze VERSCHIEBEN statt den Block abschalten -- ein
  // abgeschalteter Block faellt oft auf eine spaetere Regel durch
  // und bleibt gruen (G-484).
  ['Vorgabestatus wird mitgezaehlt',
   '  if (f.status !== VORGABE.status) {',
   '  if (f.status !== undefined) {'],
  ['der gefallene Suchweg wird verschwiegen',
   "  const wegSatz = weg === 'einfach'",
   "  const wegSatz = weg === 'NIEMALS'"],
  ['der Suchweg wird IMMER beschuldigt',
   "  const wegSatz = weg === 'einfach'",
   '  const wegSatz = true'],
  // [read] EINZEILIG suchen -- ein mehrzeiliger Suchtext trifft in
  // einer CRLF-Datei nie, und der Schaden kaeme nie an.
  ['nur der erste Filter wird genannt',
   "    : `${aktiv.slice(0, -1).join(', ')} und ${aktiv[aktiv.length - 1]}`",
   '    : aktiv[0]'],
  ['der Abfragefehler wird geschluckt',
   '  if (fehler) return `Die Abfrage ist fehlgeschlagen: ${fehler}`',
   '  if (false) return `Die Abfrage ist fehlgeschlagen: ${fehler}`'],
  ['das Suchwort faellt aus dem Satz',
   '  return `Kein Produkt enthält „${q}“ und passt zugleich zu ${liste}.${wegSatz}`',
   '  return `Kein Produkt passt zugleich zu ${liste}.${wegSatz}`'],
]

// [read] Die Kontrolle MUSS gruen bleiben: eine Aenderung, die die
// Sache nicht beruehrt. Faellt sie rot, prueft der Waechter die
// Zeilenform statt der Regel.
const KONTROLLE = ['KONTROLLE (muss GRUEN bleiben)',
  "  if (f.allergienAn) aus.push('deine Allergenmeidung')",
  "  if (f.allergienAn) { aus.push('deine Allergenmeidung') }"]

const ORIGINAL = readFileSync(LAGE, 'utf8')
const laeuft = () => {
  try {
    execFileSync('npx', ['tsx', '--test', TEST], {
      cwd: path.join(WURZEL, 'apps/web'), stdio: 'pipe', shell: true,
    })
    return true
  } catch { return false }
}

let gut = 0, gesamt = 0
try {
  for (const [name, suche, ersatz] of [...SCHAEDEN, KONTROLLE]) {
    const kontrolle = name.startsWith('KONTROLLE')
    gesamt++
    // [read] replaceAll, nicht replace -- sonst bleibt das zweite
    // Vorkommen stehen und der Schaden kommt nicht an (G-478).
    const kaputt = ORIGINAL.replaceAll(suche, ersatz)
    if (kaputt === ORIGINAL) {
      console.log(`  ?? ${name}: SUCHTEXT NICHT GEFUNDEN -- Schaden kam nie an`)
      continue
    }
    writeFileSync(LAGE, kaputt)
    const gruen = laeuft()
    const ok = kontrolle ? gruen : !gruen
    if (ok) gut++
    console.log(`  ${ok ? 'OK' : '!!'}  ${gruen ? 'GRUEN' : 'ROT  '}  ${name}`)
    writeFileSync(LAGE, ORIGINAL)
  }
} finally {
  writeFileSync(LAGE, ORIGINAL)
}
console.log(`\n${gut}/${gesamt}`)
process.exit(gut === gesamt ? 0 : 1)
