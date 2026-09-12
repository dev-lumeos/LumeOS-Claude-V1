// G-431 - die Gegenprobe.
//
// `[read]` **Ein Waechter, der laeuft und nichts findet, ist von
// einem, der nichts prueft, nicht zu unterscheiden.**
//
// `[cmd]` **Jede Probe prueft ZUERST, ob die Sabotage ANKAM.**
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const WURZEL = path.resolve(import.meta.dirname, '..')
const WEB = path.join(WURZEL, 'apps/web')

const D = {
  pfade: path.join(WURZEL, 'packages/ui/src/koerperkarte-pfade.ts'),
  rechnung: path.join(WEB, 'src/lib/koerper/hierarchie.ts'),
  ebenen: path.join(WEB, 'src/app/v2/recovery/muskel-ebenen.ts'),
  zuordnung: path.join(WEB, 'src/app/v2/recovery/muskel-zuordnung.ts'),
  modale: path.join(WEB, 'src/app/v2/recovery/modale.tsx'),
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

const BUENDEL = 'src/lib/koerper/__tests__/g431-buendel.test.ts'
const RECO = 'src/app/v2/recovery/__tests__/*.test.ts'
const MODAL = 'src/app/v2/recovery/__tests__/g431-modal.test.ts'

const SABOTAGEN = [
  {
    name: 'gluteal wird wieder zusammengefuehrt',
    datei: 'pfade', probe: BUENDEL,
    von: "    'gluteus-medius':{ side:'back', paths:[",
    nach: "    'gluteal':{ side:'back', paths:[",
  },
  {
    name: 'ein Pfad des Beinbeugers faellt weg',
    datei: 'pfade', probe: BUENDEL,
    von: "    'biceps-femoris':{ side:'back', paths:[\n",
    nach: "    'biceps-femoris':{ side:'back', paths:[\n      \"M0 0\",\n",
  },
  {
    name: 'quadriceps wird doch geteilt',
    datei: 'pfade', probe: BUENDEL,
    von: '    quadriceps: { side:',
    nach: '    quadriceps_x: { side:',
  },
  {
    name: 'der Umriss `knees` verliert Pfade',
    datei: 'pfade', probe: BUENDEL,
    von: '    knees:      { side:',
    nach: '    knees_x:    { side:',
  },
  {
    name: 'die Bruecke kennt das Gesaess nicht mehr',
    datei: 'rechnung', probe: BUENDEL,
    von: "  'gluteus-maximus': 'gluteal',",
    nach: "",
  },
  {
    name: 'ein Muskelname faellt auf die alte Flaeche zurueck',
    datei: 'ebenen', probe: RECO,
    von: "  'Gluteus Maximus': 'gluteus-maximus',",
    nach: "  'Gluteus Maximus': 'trapezius',",
  },
  {
    name: 'das Gesaess-Kuerzel faerbt wieder nur EINE Flaeche',
    datei: 'zuordnung', probe: RECO,
    von: "  gluteal: ['gluteus-maximus', 'gluteus-medius'],",
    nach: "  gluteal: 'gluteus-maximus',",
  },
  {
    name: 'das Modal schluesselt eine Gruppe nicht mehr auf',
    datei: 'modale', probe: MODAL,
    von: '        const istGruppe = flaechen.length > 1',
    nach: '        const istGruppe = false',
  },
  {
    name: 'das Modal zeigt beim KIND auch die Gruppenfassung',
    datei: 'modale', probe: MODAL,
    von: '        const istGruppe = flaechen.length > 1',
    nach: '        const istGruppe = true',
  },
  {
    name: 'je Kind faellt der eigene Wert weg',
    datei: 'modale', probe: MODAL,
    von: "                  const wert = MUSCLE_STATE[KARTE_ZU_RECOVERY[f] ?? '']",
    nach: '                  const wert = null',
  },
]

console.log('\n=== G-431 — die Gegenprobe ===\n')
zurueck()
const g = [laeuft(BUENDEL), laeuft(RECO), laeuft(MODAL)]
console.log(`Gesund: Buendel ${g[0] ? 'GRUEN' : 'ROT'}, Recovery ${g[1] ? 'GRUEN' : 'ROT'}, `
  + `Modal ${g[2] ? 'GRUEN' : 'ROT'}\n`)
if (!g.every(Boolean)) { console.log('Abbruch: schon rot.'); process.exit(1) }

let alleRot = true
for (const s of SABOTAGEN) {
  zurueck()
  const p = D[s.datei]
  const vorher = fs.readFileSync(p, 'utf8')
  if (!vorher.includes(s.von)) {
    console.log(`  ${'FEHLER'.padEnd(7)} ${s.name}`)
    console.log(`          Sabotage kam NICHT an: "${s.von.slice(0, 46)}…"`)
    alleRot = false
    continue
  }
  fs.writeFileSync(p, vorher.replace(s.von, s.nach))
  const nochGruen = laeuft(s.probe)
  console.log(`  ${(nochGruen ? 'GRUEN' : 'ROT').padEnd(7)} ${s.name}`)
  if (nochGruen) { console.log('          ^^ BLIND'); alleRot = false }
}

zurueck()
console.log(`\nZurueckgesetzt: Buendel ${laeuft(BUENDEL) ? 'GRUEN' : 'ROT'}, `
  + `Recovery ${laeuft(RECO) ? 'GRUEN' : 'ROT'}, Modal ${laeuft(MODAL) ? 'GRUEN' : 'ROT'}`)
console.log(`\n${alleRot ? 'ALLE SABOTAGEN ROT.' : 'NICHT alle rot — siehe oben.'}`)
