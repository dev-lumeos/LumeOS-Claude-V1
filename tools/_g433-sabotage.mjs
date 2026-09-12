// G-433 - die Gegenprobe zur Aufteilung.
//
// `[read]` **Ein Waechter, der laeuft und nichts findet, ist von
// einem, der nichts prueft, nicht zu unterscheiden.**
//
// `[cmd]` **Jede Sabotage wird zuerst auf ANKOMMEN geprueft.**
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const WURZEL = path.resolve(import.meta.dirname, '..')
const WEB = path.join(WURZEL, 'apps/web')

const D = {
  ebenen: path.join(WEB, 'src/lib/koerper/ebenen.ts'),
  karte: path.join(WURZEL, 'packages/ui/src/koerperkarte-pfade.ts'),
  zuordnung: path.join(WEB, 'src/app/v2/recovery/muskel-zuordnung.ts'),
  ebenenMap: path.join(WEB, 'src/app/v2/recovery/muskel-ebenen.ts'),
}
const ORIGINAL = Object.fromEntries(
  Object.entries(D).map(([k, p]) => [k, fs.readFileSync(p, 'utf8')]))
function zurueck() { for (const [k, p] of Object.entries(D)) fs.writeFileSync(p, ORIGINAL[k]) }

function laeuft(muster) {
  try {
    execFileSync('npx', ['tsx', '--test', muster],
      { cwd: WEB, stdio: 'pipe', shell: process.platform === 'win32' })
    return true
  } catch { return false }
}

const EB = 'src/lib/koerper/__tests__/g432-ebenen.test.ts'
const BU = 'src/lib/koerper/__tests__/g431-buendel.test.ts'
const RE = 'src/app/v2/recovery/__tests__/*.test.ts'

const SABOTAGEN = [
  {
    name: 'ein erfundener Name fuer den Vastus lateralis',
    datei: 'ebenen', probe: EB,
    von: "  'vastus-lateralis': {\n    name: null,",
    nach: "  'vastus-lateralis': {\n    name: 'Vastus Lateralis',",
  },
  {
    name: 'die Achillessehne gilt wieder als Muskel',
    datei: 'ebenen', probe: EB,
    von: "  achillessehne: {\n    name: null, weg: [], art: 'sehne', kinder: [],",
    nach: "  achillessehne: {\n    name: null, weg: [], art: 'muskel', kinder: [],",
  },
  {
    name: 'eine Luecke verliert ihre Begruendung',
    datei: 'ebenen', probe: EB,
    von: "  'gastrocnemius-lateralis': {\n    name: null, weg: [], art: 'muskel', kinder: [],\n    grund:",
    nach: "  'gastrocnemius-lateralis': {\n    name: null, weg: [], art: 'muskel', kinder: [],\n    ungenutzt:",
  },
  {
    name: 'quadriceps wird wieder zusammengefuehrt',
    datei: 'karte', probe: EB,
    von: "    'rectus-femoris':{ side:'front', paths:[",
    nach: "    quadriceps:{ side:'front', paths:[",
  },
  {
    name: 'der Rectus abdominis verliert einen Pfad',
    datei: 'karte', probe: BU,
    von: "    'rectus-abdominis':{ side:'front', paths:[\n",
    nach: "    'rectus-abdominis':{ side:'front', paths:[\n      \"M0 0\",\n",
  },
  {
    name: 'die Achillessehne verschwindet aus der Karte',
    datei: 'karte', probe: EB,
    von: "    'achillessehne': {",
    nach: "    'achillessehne_x': {",
  },
  {
    name: 'das Waden-Kuerzel faerbt wieder nur EINE Flaeche',
    datei: 'zuordnung', probe: RE,
    von: "  calves: ['gastrocnemius-lateralis', 'gastrocnemius-medialis', 'achillessehne'],",
    nach: "  calves: 'gastrocnemius-lateralis',",
  },
  {
    name: 'ein Muskelname faellt auf die alte Flaeche zurueck',
    datei: 'ebenenMap', probe: RE,
    von: "  'Rectus Femoris': 'rectus-femoris',",
    nach: "  'Rectus Femoris': 'trapezius',",
  },
]

console.log('\n=== G-433 — die Gegenprobe ===\n')
zurueck()
const g = [laeuft(EB), laeuft(BU), laeuft(RE)]
console.log(`Gesund: Ebenen ${g[0] ? 'GRUEN' : 'ROT'}, Buendel ${g[1] ? 'GRUEN' : 'ROT'}, `
  + `Recovery ${g[2] ? 'GRUEN' : 'ROT'}\n`)
if (!g.every(Boolean)) { console.log('Abbruch: schon rot.'); process.exit(1) }

let alleRot = true
for (const s of SABOTAGEN) {
  zurueck()
  const p = D[s.datei]
  const vorher = fs.readFileSync(p, 'utf8')
  if (!vorher.includes(s.von)) {
    console.log(`  ${'FEHLER'.padEnd(7)} ${s.name}`)
    console.log(`          Sabotage kam NICHT an: "${s.von.slice(0, 44)}…"`)
    alleRot = false
    continue
  }
  fs.writeFileSync(p, vorher.replace(s.von, s.nach))
  const nochGruen = laeuft(s.probe)
  console.log(`  ${(nochGruen ? 'GRUEN' : 'ROT').padEnd(7)} ${s.name}`)
  if (nochGruen) { console.log('          ^^ BLIND'); alleRot = false }
}

zurueck()
console.log(`\nZurueckgesetzt: Ebenen ${laeuft(EB) ? 'GRUEN' : 'ROT'}, `
  + `Buendel ${laeuft(BU) ? 'GRUEN' : 'ROT'}, Recovery ${laeuft(RE) ? 'GRUEN' : 'ROT'}`)
console.log(`\n${alleRot ? 'ALLE SABOTAGEN ROT.' : 'NICHT alle rot — siehe oben.'}`)
