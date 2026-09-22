// G-493 — die Sabotageprobe zum Waechter.
//
// [read] Bleibt ein Schaden gruen, gibt es VIER Ursachen: blinder
// Waechter / kam nie an / zu weich / zweites Vorkommen.
import { readFileSync, writeFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import path from 'node:path'

const WURZEL = path.resolve(import.meta.dirname, '..')
const W = (p) => path.join(WURZEL, 'apps/web/src', p)
const M = (p) => path.join(WURZEL, 'apps/web/messages', p)
const TEST = 'src/lib/supplements/__tests__/g493-modal-nachbessern.test.ts'

const LISTE = W('app/v2/supplements/tab-produkte.tsx')
const TAFEL = W('app/v2/supplements/produkt-tafel.tsx')
const SUBSTANZ = W('app/v2/supplements/substanz-detail.tsx')
const AKTION = W('app/v2/supplements/produkt-aktion.tsx')
const SCHREIB = W('lib/supplements/stack-write.ts')
const LESEN = W('lib/supplements/stack-read.ts')
const DE = M('de.json')

// [read] Je Schaden EINE Sache, EINZEILIG gesucht (CRLF).
const SCHAEDEN = [
  [LISTE, 'die Liste sagt wieder Add',
   "                          {tA('hinzufuegen')}",
   '                          Add'],
  [TAFEL, 'die Tafel schreibt das Wort wieder hin',
   "            {tA('hinzufuegen')}", '            Hinzufügen'],
  [SUBSTANZ, 'die Substanzen sagen wieder Add',
   "                            {tA('hinzufuegen')}",
   '                            Add'],
  [DE, 'der deutsche Schluessel faellt weg',
   '    "hinzufuegen": "Hinzufügen",', '    "hinzufuegenX": "Hinzufügen",'],
  [AKTION, 'die neue Mahlzeit laeuft NICHT ueber den Diary-Weg',
   "          art: 'mahlzeit',", "          art: 'mahlzeitX',"],
  [AKTION, 'die Kategorien werden nachgebaut',
   "import { kategorieAuswahl } from '../../../lib/nutrition/slots-lage'",
   "// import { kategorieAuswahl } from '../../../lib/nutrition/slots-lage'"],
  [AKTION, 'dem Formular fehlt die Uhrzeit',
   '                       aria-label="Uhrzeit der Mahlzeit" data-probe="neue-zeit"',
   '                       aria-label="Uhrzeit der Mahlzeit" data-probe="neue-zeitX"'],
  [AKTION, 'dem Formular fehlt der Oeffner',
   '                    data-probe="neue-mahlzeit-oeffnen"',
   '                    data-probe="neue-mahlzeit-oeffnenX"'],
  [SCHREIB, 'der Insert schreibt die Produktspalte nicht',
   '      supplier_product_id: eingabe.supplier_product_id ?? null,',
   '      supplier_product_id: null,'],
  [LESEN, 'der Leseweg holt die Spalte nicht',
   '        supplement_id, supplier_product_id', '        supplement_id'],
  [AKTION, 'die Kruecke kehrt zurueck',
   '          supplier_product_id: produktId,',
   '          notes: `Produkt-Id ${produktId}`,'],
]

// [read] Die Kontrolle MUSS gruen bleiben.
const KONTROLLE = [AKTION, 'KONTROLLE (muss GRUEN bleiben)',
  '  const [neueOffen, setNeueOffen] = React.useState(false)',
  '  const [neueOffen, setNeueOffen] = React.useState<boolean>(false)']

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
for (const [datei] of [...SCHAEDEN, KONTROLLE]) {
  if (!sicherung.has(datei)) sicherung.set(datei, readFileSync(datei, 'utf8'))
}
try {
  for (const [datei, name, suche, ersatz] of [...SCHAEDEN, KONTROLLE]) {
    const kontrolle = name.startsWith('KONTROLLE')
    gesamt++
    const original = sicherung.get(datei)
    const kaputt = original.replaceAll(suche, ersatz)
    if (kaputt === original) {
      console.log(`  ??  ${name}: SUCHTEXT NICHT GEFUNDEN -- Schaden kam nie an`)
      continue
    }
    writeFileSync(datei, kaputt)
    const gruen = laeuft()
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
