// G-428/A3 - die Gegenprobe: faellt der Waechter am kaputten Zustand?
//
// `[read]` **Ein Waechter, der laeuft und nichts findet, ist von
// einem, der nichts prueft, nicht zu unterscheiden** - ausser man
// baut den Fehler ein.
//
// `[cmd]` **Jede Probe prueft ZUERST, ob die Sabotage ANKAM** - eine
// Ersetzung, die ins Leere lief, ergaebe ein GRUEN, das nur bedeutet
// "nichts geaendert". **Die Lehre aus `sabotage-muss-ankommen`.**
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const WURZEL = path.resolve(import.meta.dirname, '..')
const WEB = path.join(WURZEL, 'apps/web')
const PROBE = 'src/app/v2/supplements/__tests__/g428-reiter-und-vorlage.test.ts'

const D = {
  hook: path.join(WEB, 'src/lib/tab-url.ts'),
  ansicht: path.join(WEB, 'src/app/v2/supplements/ansicht.tsx'),
  extended: path.join(WEB, 'src/app/v2/supplements/tab-extended.tsx'),
}

/** Der Ausgangszustand, um jederzeit zurueckzukoennen. */
const ORIGINAL = Object.fromEntries(
  Object.entries(D).map(([k, p]) => [k, fs.readFileSync(p, 'utf8')]))

function zurueck() {
  for (const [k, p] of Object.entries(D)) fs.writeFileSync(p, ORIGINAL[k])
}

function laeuft() {
  try {
    execFileSync('npx', ['tsx', '--test', PROBE],
      { cwd: WEB, stdio: 'pipe', shell: process.platform === 'win32' })
    return true
  } catch { return false }
}

const SABOTAGEN = [
  {
    name: 'die Klammer faellt weg (der alte Zustand)',
    datei: 'hook',
    von: 'bekannt && bekannt.length > 0 && !bekannt.includes(roh)',
    nach: 'false',
  },
  {
    name: 'die Klammer dreht sich um (nur Bekannte werden geklammert)',
    datei: 'hook',
    von: '!bekannt.includes(roh)',
    nach: 'bekannt.includes(roh)',
  },
  {
    name: 'die leere Liste verschluckt jeden Reiter',
    datei: 'hook',
    von: 'bekannt && bekannt.length > 0 &&',
    nach: 'bekannt &&',
  },
  {
    name: 'der Hook nimmt keine Liste mehr entgegen',
    datei: 'hook',
    von: 'bekannt?: readonly string[],',
    nach: '',
  },
  {
    name: 'supplements uebergibt seine Liste nicht mehr',
    datei: 'ansicht',
    von: "useTabParam('today', bekannteReiter)",
    nach: "useTabParam('today')",
  },
  {
    name: 'die Liste wird abgeschrieben statt abgeleitet',
    datei: 'ansicht',
    von: 'return tabs(s => s, 0, null, 0).map(x => x.id)',
    nach: "return ['today', 'stack']",
  },
  {
    name: 'der Reiter "injection" faellt aus der Leiste',
    datei: 'ansicht',
    von: "{ id: 'injection', label: t('tabInjektionen'), icon: 'medical' },",
    nach: '',
  },
  {
    name: 'die Protokollkachel wird entfernt (Schreibweg weg)',
    datei: 'ansicht',
    von: '<ProtokollKarte',
    nach: '<React.Fragment key="x" /> && false && <ProtokollKarte',
  },
  {
    name: 'die Kacheln stehen wieder VOR der Vorlage',
    datei: 'ansicht',
    von: 'protokolle={(',
    nach: 'nichts={(',
  },
  {
    name: 'die echte Protokollkachel rutscht UNTER die Attrappe',
    datei: 'extended',
    von: '{protokolle}',
    nach: '',
    // Sie wird unten wieder eingefuegt - siehe `zusatz`.
    zusatz: { von: '<CycleTimeline />', nach: '{protokolle}\n          <CycleTimeline />' },
  },
  {
    // `[cmd]` **Die erste Fassung dieser Sabotage kam NICHT an:** sie
    // suchte `'{zyklen}\n          <CycleTimeline />'` - die Datei hat
    // CRLF, das Muster LF. **Ein `FEHLER` statt eines falschen GRUEN,
    // weil die Probe zuerst fragt, ob die Ersetzung greift.**
    name: 'die echte Zyklenkachel rutscht UNTER die Zeitleiste',
    datei: 'extended',
    von: '{zyklen}',
    nach: '',
    zusatz: { von: '<CycleTimeline />', nach: '<CycleTimeline />\n          {zyklen}' },
  },
]

console.log('\n=== G-428/A3 — die Gegenprobe ===\n')
console.log('Zuerst: laeuft die Probe im gesunden Zustand?')
zurueck()
const gesund = laeuft()
console.log(`  ${gesund ? 'GRUEN' : 'ROT'}  (erwartet GRUEN)\n`)
if (!gesund) { console.log('Abbruch: die Probe ist schon rot.'); process.exit(1) }

let alleRot = true
for (const s of SABOTAGEN) {
  zurueck()
  const p = D[s.datei]
  const vorher = fs.readFileSync(p, 'utf8')

  // `[cmd]` **KAM DIE SABOTAGE AN?** Ohne diese Frage misst ein
  // GRUEN nur, dass nichts passiert ist.
  if (!vorher.includes(s.von)) {
    console.log(`  ${'FEHLER'.padEnd(7)} ${s.name}`)
    console.log(`          die Sabotage kam NICHT an — "${s.von.slice(0, 50)}" nicht gefunden`)
    alleRot = false
    continue
  }
  let nachher = vorher.replace(s.von, s.nach)
  if (s.zusatz) nachher = nachher.replace(s.zusatz.von, s.zusatz.nach)
  fs.writeFileSync(p, nachher)

  const nochGruen = laeuft()
  console.log(`  ${(nochGruen ? 'GRUEN' : 'ROT').padEnd(7)} ${s.name}`)
  if (nochGruen) {
    console.log('          ^^ der Waechter ist an dieser Stelle BLIND')
    alleRot = false
  }
}

zurueck()
console.log(`\nZurueckgesetzt. Probe wieder ${laeuft() ? 'GRUEN' : 'ROT'}.`)
console.log(`\n${alleRot ? 'ALLE SABOTAGEN ROT.' : 'NICHT alle rot — siehe oben.'}`)
