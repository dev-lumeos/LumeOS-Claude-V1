// G-432 - die Gegenprobe.
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
  pfade: path.join(WEB, 'src/lib/koerper/pfadnamen.ts'),
  baum: path.join(WEB, 'src/lib/koerper/muskelbaum.ts'),
  karte: path.join(WURZEL, 'packages/ui/src/koerperkarte-pfade.ts'),
  checkin: path.join(WEB, 'src/app/v2/recovery/tab-checkin.tsx'),
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
const BA = 'src/lib/koerper/__tests__/g432-muskelbaum.test.ts'

const SABOTAGEN = [
  {
    name: 'ein erfundener Muskelname (Vastus Lateralis)',
    datei: 'ebenen', probe: EB,
    von: "    kinder: ['Rectus Femoris'],",
    nach: "    kinder: ['Rectus Femoris', 'Vastus Lateralis'],",
  },
  {
    name: 'quadriceps gilt wieder als einzelner Muskel',
    datei: 'ebenen', probe: EB,
    von: "    name: 'Quadriceps', weg: ['Legs', 'Quadriceps'], art: 'gruppe',",
    nach: "    name: 'Quadriceps', weg: ['Legs', 'Quadriceps'], art: 'muskel',",
  },
  {
    name: 'calves verliert seine Gruppe `Lower Legs`',
    datei: 'ebenen', probe: EB,
    von: "    name: 'Calves', weg: ['Legs', 'Lower Legs', 'Calves'], art: 'gruppe',",
    nach: "    name: 'Calves', weg: ['Legs', 'Calves'], art: 'gruppe',",
  },
  {
    name: 'eine Gruppe verliert ihren Grund',
    datei: 'ebenen', probe: EB,
    von: "    grund: 'Der Internus liegt unter dem Externus — gezeichnet ist nur '\n      + 'die äußere Schicht (C-468).',",
    nach: '',
  },
  {
    name: 'ein Umriss bekommt einen Muskelnamen',
    datei: 'ebenen', probe: EB,
    von: "  knees: { name: null, weg: [], art: 'umriss', kinder: [] },",
    nach: "  knees: { name: null, weg: [], art: 'umriss', kinder: ['Soleus'] },",
  },
  {
    name: 'die Pfadsumme stimmt nicht mehr (ein Pfad verschwindet)',
    datei: 'pfade', probe: BA,
    von: "{ flaeche: 'abs', ansicht: 'front', pfade: 8,",
    nach: "{ flaeche: 'abs', ansicht: 'front', pfade: 7,",
  },
  {
    name: 'ein Umriss traegt ploetzlich einen Namen',
    datei: 'pfade', probe: BA,
    von: "  { flaeche: 'knees', ansicht: 'front', pfade: 4, art: 'umriss',\n    name: null,",
    nach: "  { flaeche: 'knees', ansicht: 'front', pfade: 4, art: 'umriss',\n    name: 'Calves',",
  },
  {
    name: 'eine Begruendung aus dem Bild faellt weg',
    datei: 'pfade', probe: BA,
    von: "bild: 'je Arm ein Bauch an der Vorderseite' }",
    nach: "bild: '—' }",
  },
  {
    name: 'der Baum laesst die Luecken weg',
    datei: 'baum', probe: BA,
    von: '      flaeche: klein[k.name.toLowerCase()] ?? null,',
    nach: "      flaeche: klein[k.name.toLowerCase()] ?? 'irgendwas',",
  },
  {
    name: 'die Zugehoerigkeit nennt den Elternteil statt der Wurzel',
    datei: 'baum', probe: BA,
    von: '  return weg.length > 0 ? weg[0] : null',
    nach: '  return weg.length > 1 ? weg[weg.length - 2] : null',
  },
  {
    name: 'die Tiefensperre im Baum faellt weg',
    datei: 'baum', probe: BA,
    von: '    const kinder = ebene >= 6 ? [] : knoten',
    nach: '    const kinder = ebene >= 100000 ? [] : knoten',
  },
  {
    name: 'der Klick waehlt wieder die GRUPPE statt des Muskels',
    datei: 'checkin', probe: 'src/app/v2/recovery/__tests__/g431-modal.test.ts',
    von: '              setSelFlaeche([id])',
    nach: '              setSelFlaeche(slug ? flaechenFuer(slug) : null)',
  },
]

console.log('\n=== G-432 — die Gegenprobe ===\n')
zurueck()
const g = [laeuft(EB), laeuft(BA)]
console.log(`Gesund: Ebenen ${g[0] ? 'GRUEN' : 'ROT'}, Baum ${g[1] ? 'GRUEN' : 'ROT'}\n`)
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
  + `Baum ${laeuft(BA) ? 'GRUEN' : 'ROT'}`)
console.log(`\n${alleRot ? 'ALLE SABOTAGEN ROT.' : 'NICHT alle rot — siehe oben.'}`)
