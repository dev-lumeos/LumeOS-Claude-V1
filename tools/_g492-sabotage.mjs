// G-492 — die Sabotageprobe zum Waechter.
//
// [read] Ein Waechter, der nur gruen werden kann, misst nichts.
// Jeder Schaden MUSS rot werden -- und die KONTROLLE muss gruen
// bleiben, sonst faellt der Waechter auf jede Aenderung.
//
// [cmd] Bleibt ein Schaden gruen, gibt es VIER Ursachen: blinder
// Waechter / der Schaden kam nie an / er war zu weich / ein zweites
// Vorkommen erfuellt die Zusicherung weiter.
import { readFileSync, writeFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import path from 'node:path'

const WURZEL = path.resolve(import.meta.dirname, '..')
const W = (p) => path.join(WURZEL, 'apps/web/src', p)
const TEST = 'src/lib/supplements/__tests__/g492-aktion-als-modal.test.ts'

const REITER = W('lib/supplements/produkt-reiter-lage.ts')
const AKTIONLAGE = W('lib/supplements/produkt-aktion-lage.ts')
const LISTE = W('app/v2/supplements/tab-produkte.tsx')
const AKTION = W('app/v2/supplements/produkt-aktion.tsx')
const SUBSTANZ = W('app/v2/supplements/substanz-tafel.tsx')
const TAFEL = W('app/v2/supplements/produkt-tafel.tsx')
const LEISTE = W('app/v2/supplements/tafel-reiterleiste.tsx')

// [read] Je Schaden EINE Sache, und EINZEILIG gesucht -- ein
// mehrzeiliger Suchtext trifft in einer CRLF-Datei nie.
const SCHAEDEN = [
  [REITER, 'der Etikett-Reiter faellt weg',
   "    { id: 'etikett', titel: 'Etikett', zahl: null, wartet: true },", ''],
  [REITER, 'die Reiterfolge wird vertauscht',
   "    { id: 'anwendung', titel: 'Anwendung', zahl: null, wartet: false },",
   "    { id: 'zzz', titel: 'Anwendung', zahl: null, wartet: false },"],
  [REITER, 'der erste Reiter ist nicht mehr der Ueberblick',
   "  return 'ueberblick'", "  return 'anwendung'"],
  [REITER, 'der Ueberblick zeigt eine hingeschriebene Null',
   '      zahl: etikettZeilen > 0 ? etikettZeilen : null, wartet: false },',
   '      zahl: etikettZeilen, wartet: false },'],
  [REITER, 'der Wartesatz verspricht nichts mehr',
   "    satz: 'Die Warnhinweise vom Etikett werden noch übernommen.',",
   "    satz: 'Nichts da.',"],
  [REITER, 'die Quelle des Etikett-Reiters faellt weg',
   "    quelle: 'DSLD-Etikettseite · dsld.od.nih.gov/label/<dsld_id>',",
   "    quelle: '',"],
  [AKTIONLAGE, 'die Vorschau rechnet die Anzahl NICHT mit',
   '    teile.push(`${Math.round(portion.enercc * n)} kcal`)',
   '    teile.push(`${Math.round(portion.enercc)} kcal`)'],
  [AKTIONLAGE, 'die Vorschau schreibt eine Null hin',
   '  if (portion.enercc !== null) {', '  if (portion.enercc !== undefined) {'],
  // [read] Die GRENZE verschieben statt den Block abschalten -- ein
  // abgeschalteter Block faellt oft auf eine spaetere Regel durch.
  [AKTIONLAGE, 'eine Anzahl von 0 ergibt einen Satz',
   '  if (!Number.isFinite(n) || n <= 0) return null',
   '  if (!Number.isFinite(n) || n < 0) return null'],
  [LISTE, 'der Add-Knopf steht hinter Details',
   '                                data-probe="zeile-add"',
   '                                data-probe="zeile-addX"'],
  [LISTE, 'der Add-Knopf klappt die Zeile auf',
   '                                onClick={() => setAddZeile(p)}>',
   '                                onClick={() => schalteZeile(p.id)}>'],
  [AKTION, 'das Modal baut den Schreibweg nach',
   '          <ProduktAktion\n', '          <XProduktAktion\n'],
  // [cmd] Erster Lauf: `substanz-add` -> `substanz-addX` blieb GRUEN.
  // [read] Kein blinder Waechter, sondern ein zu WEICHER Schaden:
  // `substanz-add` ist ein PRAEFIX von `substanz-addX`, und die
  // Zusicherung traf weiter.
  //
  // [cmd] Jetzt wird die AKTION aus der Leiste genommen -- genau die
  // Sache, die A12 zusichert. Der Knopf verschwindet damit aus dem
  // `<TafelReiterleiste>`-Block.
  [SUBSTANZ, 'die Substanz-Aktion steht nicht mehr in der Leiste',
   '        aktion={<>', '        nichtAktion={<>'],
  [TAFEL, 'die Produkt-Tafel verliert die geteilte Leiste',
   "import { TafelReiterleiste } from './tafel-reiterleiste'",
   "// import { TafelReiterleiste } from './tafel-reiterleiste'"],
  [LEISTE, 'die Leiste verschwindet bei EINEM Reiter',
   '  if (reiter.length === 0 && !aktion) return null',
   '  if (reiter.length <= 1) return null'],
]

// [read] Die Kontrolle MUSS gruen bleiben: eine Aenderung, die die
// Sache nicht beruehrt.
const KONTROLLE = [REITER, 'KONTROLLE (muss GRUEN bleiben)',
  "export function ersterProduktReiter(): ProduktReiterId {",
  "export function ersterProduktReiter(): ProduktReiterId { /* Notiz */"]

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
    // [read] replaceAll, nicht replace -- sonst bleibt das zweite
    // Vorkommen stehen und der Schaden kommt nicht an (G-478).
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
