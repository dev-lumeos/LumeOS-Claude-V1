// G-430 - die Gegenprobe: faellt der Waechter am kaputten Zustand?
//
// `[read]` **Ein Waechter, der laeuft und nichts findet, ist von
// einem, der nichts prueft, nicht zu unterscheiden.**
//
// `[cmd]` **Jede Probe prueft ZUERST, ob die Sabotage ANKAM** - eine
// Ersetzung, die ins Leere lief, ergaebe ein GRUEN, das nur bedeutet
// "nichts geaendert".
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const WURZEL = path.resolve(import.meta.dirname, '..')
const WEB = path.join(WURZEL, 'apps/web')

const D = {
  rechnung: path.join(WEB, 'src/lib/koerper/hierarchie.ts'),
  pfade: path.join(WURZEL, 'packages/ui/src/koerperkarte-pfade.ts'),
  ebenen: path.join(WEB, 'src/app/v2/recovery/muskel-ebenen.ts'),
  zuordnung: path.join(WEB, 'src/app/v2/recovery/muskel-zuordnung.ts'),
}

const ORIGINAL = Object.fromEntries(
  Object.entries(D).map(([k, p]) => [k, fs.readFileSync(p, 'utf8')]))

function zurueck() {
  for (const [k, p] of Object.entries(D)) fs.writeFileSync(p, ORIGINAL[k])
}

/** Die Proben, die diese Sabotage fangen soll. */
function laeuft(muster) {
  try {
    execFileSync('npx', ['tsx', '--test', muster],
      { cwd: WEB, stdio: 'pipe', shell: process.platform === 'win32' })
    return true
  } catch { return false }
}

const HIER = 'src/lib/koerper/__tests__/g430-hierarchie.test.ts'
const RECO = 'src/app/v2/recovery/__tests__/*.test.ts'

const SABOTAGEN = [
  {
    name: 'kinderVon liefert nur die erste Ebene (keine Enkel)',
    datei: 'rechnung', probe: HIER,
    von: '  let rand = [start.id]\n  let runden = 0\n  while (rand.length > 0 && runden < 10) {',
    nach: '  let rand = [start.id]\n  let runden = 0\n  while (rand.length > 0 && runden < 1) {',
  },
  {
    name: 'die Zyklensperre faellt weg',
    datei: 'rechnung', probe: HIER,
    von: 'while (rand.length > 0 && runden < 10) {',
    nach: 'while (rand.length > 0 && runden < 10000) {',
  },
  {
    name: 'pfadZu dreht die Reihenfolge um',
    datei: 'rechnung', probe: HIER,
    von: '    aus.unshift(k)',
    nach: '    aus.push(k)',
  },
  {
    name: 'elternteilVon nennt die Wurzel statt des Elternteils',
    datei: 'rechnung', probe: HIER,
    von: '  return flaechen.find(x => x.id === f.parent_id) ?? null\n}',
    nach: '  return flaechen.find(x => !x.parent_id) ?? null\n}',
  },
  {
    name: 'die Bruecke meldet nicht mehr, dass sie geerbt hat',
    datei: 'rechnung', probe: HIER,
    von: '  return { eltern: elternteilVon(flaechen, alt), ueberBruecke: true }',
    nach: '  return { eltern: elternteilVon(flaechen, alt), ueberBruecke: false }',
  },
  {
    name: 'die Bruecke greift auch fuer Flaechen AUS der Tabelle',
    datei: 'rechnung', probe: HIER,
    von: '  const direkt = elternteilVon(flaechen, code)\n  if (direkt) return { eltern: direkt, ueberBruecke: false }',
    nach: '  const direkt = null as ReturnType<typeof elternteilVon>\n  if (direkt) return { eltern: direkt, ueberBruecke: false }',
  },
  {
    name: 'eine Luecke verliert ihren Grund',
    datei: 'rechnung', probe: HIER,
    von: "    grund: 'liegt unter dem Gastrocnemius — die Wade ist ein Pfadsatz' },",
    nach: "    grund: '' },",
  },
  {
    name: 'der Latissimus verliert einen Pfad (nur noch links)',
    datei: 'pfade', probe: HIER,
    von: "    'latissimus':{ side:'back', paths:[\n",
    nach: "    'latissimus':{ side:'back', paths:[\n      \"M0 0\",\n",
  },
  {
    name: 'sechs Namen fallen wieder auf EINE Flaeche',
    datei: 'ebenen', probe: RECO,
    von: "  'latissimus dorsi': 'latissimus',",
    nach: "  'latissimus dorsi': 'trapezius',",
  },
  {
    name: 'der Ruecken faerbt wieder nur EINE Flaeche',
    datei: 'zuordnung', probe: RECO,
    von: "  upper_back: ['latissimus', 'teres-major', 'teres-minor'],",
    nach: "  upper_back: 'latissimus',",
  },
  {
    name: 'flaechenFuer gibt bei einer Liste nichts zurueck',
    datei: 'zuordnung', probe: RECO,
    von: '  return Array.isArray(v) ? v : [v]',
    nach: '  return Array.isArray(v) ? [] : [v]',
  },
]

console.log('\n=== G-430 — die Gegenprobe ===\n')
zurueck()
const g1 = laeuft(HIER), g2 = laeuft(RECO)
console.log(`Gesund: Hierarchie ${g1 ? 'GRUEN' : 'ROT'}, Recovery ${g2 ? 'GRUEN' : 'ROT'}\n`)
if (!g1 || !g2) { console.log('Abbruch: schon rot.'); process.exit(1) }

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
  if (nochGruen) {
    console.log('          ^^ der Waechter ist an dieser Stelle BLIND')
    alleRot = false
  }
}

zurueck()
console.log(`\nZurueckgesetzt: Hierarchie ${laeuft(HIER) ? 'GRUEN' : 'ROT'}, `
  + `Recovery ${laeuft(RECO) ? 'GRUEN' : 'ROT'}`)
console.log(`\n${alleRot ? 'ALLE SABOTAGEN ROT.' : 'NICHT alle rot — siehe oben.'}`)
