// G-489 — die Sabotageprobe zum Waechter.
import { readFileSync, writeFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import path from 'node:path'

const WURZEL = path.resolve(import.meta.dirname, '..')
const W = (p) => path.join(WURZEL, 'apps/web/src', p)
const TEST = 'src/lib/nutrition/__tests__/g489-supplement-im-plan.test.ts'

const LAGE = W('lib/nutrition/plan-eintrag-lage.ts')
const GHOST = W('app/v2/nutrition/ghost-eintrag.tsx')
const LOGWRITE = W('lib/nutrition/plan-log-write.ts')
const LESEN = W('lib/nutrition/plan-lesen.ts')
const STACK = W('lib/supplements/stack-write.ts')

const SCHAEDEN = [
  [LAGE, 'supplement faellt aus den Eintragsarten',
   "export const EINTRAG_TYPEN = ['recipe', 'bls', 'custom', 'supplement'] as const",
   "export const EINTRAG_TYPEN = ['recipe', 'bls', 'custom'] as const"],
  [LAGE, 'der Supplementzweig im CHECK faellt weg',
   "  if (f.entry_type === 'supplement') {",
   '  if (false) {'],
  // [read] Die GRENZE verschieben statt den Block abschalten.
  [LAGE, 'ein Supplementeintrag darf eine Quelle-Id tragen',
   '    if (gesetzt !== 0) {', '    if (gesetzt !== 99) {'],
  [LAGE, 'das Mengenfeld kommt zurueck',
   "  if (typ === 'supplement') return 'keines'",
   "  if (typ === 'supplementX') return 'keines'"],
  // [read] KEIN Praefix-Schaden: `record_supplier_product_intake` ist
  // ein Praefix von `…intakeX`, und die Zusicherung traefe weiter
  // (dieselbe Falle wie in G-492 bei `substanz-add`).
  [STACK, 'das Einloesen ruft C-519 nicht',
   "await c.rpc('record_supplier_product_intake', {",
   "await c.rpc('irgendwas_anderes', {"],
  [STACK, 'die Einnahme haengt an keiner Mahlzeit',
   '    p_meal_id: eingabe.meal_id,', '    p_meal_id: null,'],
  [STACK, 'die RPC-Rueckgabe wird als Objekt gelesen',
   "  const id = typeof data === 'string'", '  const id = false'],
  [STACK, 'die Referenz wird nicht gelesen',
   ".from('meal_plan_product_references')",
   ".from('ganz_andere_tabelle')"],
  [LOGWRITE, 'der Supplementzweig faellt weg',
   "  if (eintrag.entryType === 'supplement') {", '  if (false) {'],
  [LOGWRITE, 'der geteilte Leseweg wird umgangen',
   'planProduktverweise', 'xPlanProduktverweise'],
  [LESEN, 'der Plan liest die Referenz nicht mehr',
   'planProduktverweise', 'xPlanProduktverweise'],
  [GHOST, 'der Bestaetigen-Knopf wird wieder gesperrt',
   'disabled={laeuft || (posten.length === 0 && !eintrag.supplement)}',
   'disabled={laeuft || posten.length === 0}'],
  [GHOST, 'der Leersatz nennt wieder den falschen Grund',
   '        {posten.length === 0 && !eintrag.supplement && (',
   '        {posten.length === 0 && ('],
  [GHOST, 'die Portion des Supplements verschwindet',
   '             data-probe="ghost-supplement">',
   '             data-probe="ghost-supplementX">'],
]

// [read] Der FREMDE Waechter (G-298) wurde entschaerft -- er
// verlangte fuer JEDEN Typ eine Einheit, und `supplement` hat kein
// Mengenfeld. Eine gelockerte Zusicherung braucht einen Beleg, dass
// sie noch rot werden kann.
const FREMD = [
  [LAGE, 'G-298: eine Einheit faellt weg',
   "  amount_g: 'g',", "  amount_g: '',"],
]

const KONTROLLE = [LAGE, 'KONTROLLE (muss GRUEN bleiben)',
  "  if (typ === 'supplement') return 'keines'",
  "  if (typ === 'supplement') { return 'keines' }"]

const laeufMit = (datei) => {
  try {
    execFileSync('npx', ['tsx', '--test', datei], {
      cwd: path.join(WURZEL, 'apps/web'), stdio: 'pipe', shell: true,
    })
    return true
  } catch { return false }
}
const FREMD_TEST = 'src/lib/nutrition/__tests__/plan-eintrag-lage.test.ts'

const laeuft = () => {
  try {
    execFileSync('npx', ['tsx', '--test', TEST], {
      cwd: path.join(WURZEL, 'apps/web'), stdio: 'pipe', shell: true,
    })
    return true
  } catch { return false }
}

let gut = 0, gesamt = 0
const sicherung = new Map()
for (const [datei] of [...SCHAEDEN, ...FREMD, KONTROLLE]) {
  if (!sicherung.has(datei)) sicherung.set(datei, readFileSync(datei, 'utf8'))
}
try {
  for (const [datei, name, suche, ersatz] of [...SCHAEDEN, ...FREMD, KONTROLLE]) {
    const fremd = name.startsWith('G-298')
    const kontrolle = name.startsWith('KONTROLLE')
    gesamt++
    const original = sicherung.get(datei)
    const kaputt = original.replaceAll(suche, ersatz)
    if (kaputt === original) {
      console.log(`  ??  ${name}: SUCHTEXT NICHT GEFUNDEN -- Schaden kam nie an`)
      continue
    }
    writeFileSync(datei, kaputt)
    const gruen = fremd ? laeufMit(FREMD_TEST) : laeuft()
    const ok = kontrolle ? gruen : !gruen
    if (ok) gut++
    console.log(`  ${ok ? 'OK' : '!!'}  ${gruen ? 'GRUEN' : 'ROT  '}  ${name}`)
    writeFileSync(datei, original)
  }
} finally {
  for (const [datei, inhalt] of sicherung) writeFileSync(datei, inhalt)
}
console.log(`\n${gut}/${gesamt}`)
process.exit(gut === gesamt ? 0 : 1)
