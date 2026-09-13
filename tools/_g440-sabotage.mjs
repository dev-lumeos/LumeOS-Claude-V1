// G-440/A7 - die Gegenprobe.
//
// **A7:** *„eine feste Tabelle eingebaut -> faellt sie?"*
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
  rechnung: path.join(WEB, 'src/lib/training/muskelzustand.ts'),
  kachel: path.join(WEB, 'src/app/v2/recovery/tab-messwerte.tsx'),
}
const ORIGINAL = Object.fromEntries(
  Object.entries(D).map(([k, p]) => [k, fs.readFileSync(p, 'utf8')]))
function zurueck() { for (const [k, p] of Object.entries(D)) fs.writeFileSync(p, ORIGINAL[k]) }

function laeuft() {
  try {
    execFileSync('npx', ['tsx', '--test',
      'src/lib/training/__tests__/g440-muskelzustand.test.ts',
      'src/lib/koerper/__tests__/g440-datenquellen.test.ts'],
      { cwd: WEB, stdio: 'pipe', shell: process.platform === 'win32' })
    return true
  } catch { return false }
}

const SABOTAGEN = [
  // ══ A7: die feste Tabelle kehrt zurueck ═════════════════════════
  {
    name: 'A7: die Kachel liest wieder aus MUSCLE_STATE',
    datei: 'kachel',
    von: '            const st = id ? muskelzustand?.zustaende[id] : undefined\n            if (!st) return null',
    nach: '            const st = MUSCLE_STATE[a.flaeche ?? ""]\n            if (!st) return null',
  },
  {
    name: 'A7: eine NEUE feste Messtabelle wird angelegt',
    datei: 'kachel',
    von: 'export function RecMuscleMap(',
    nach: 'export const ERFUNDEN = { brust: { hours: 38, sets: 14 } }\n\nexport function RecMuscleMap(',
  },
  // ══ A3: das unehrliche Etikett ══════════════════════════════════
  {
    name: 'A3: die Marke „echte Daten" kommt zurueck',
    datei: 'kachel',
    von: '        actions={<Pill variant={etikett.ton}>{etikett.marke}</Pill>}\n      >\n        {/* G-26: die anatomische Karte',
    nach: '        actions={<Pill variant="pos">echte Daten</Pill>}\n      >\n        {/* G-26: die anatomische Karte',
  },
  {
    name: 'A4: das Etikett verschweigt die ungewichtete Rolle',
    datei: 'kachel',
    von: "    teile.push('ein Satz zählt für jeden zugeordneten Muskel gleich '",
    nach: "    teile.push('' + (''",
  },
  {
    name: 'A4: das Etikett verschweigt Schlaf und Ernaehrung',
    datei: 'kachel',
    von: "  teile.push('Schlaf und Ernährung aus dem Entwurf')",
    nach: '  // weggelassen',
  },
  // ══ A1: die Rechnung ════════════════════════════════════════════
  {
    name: 'A1: der Datumsfilter faellt weg — Sammler ohne Datum',
    datei: 'rechnung',
    von: 'if (!sitzung?.session_date) continue',
    nach: 'if (!sitzung) continue',
  },
  {
    name: 'A1: die Saetze zaehlen ueber ALLE Sitzungen statt der juengsten',
    datei: 'rechnung',
    von: '      sets: s.proSitzung.get(juengste) ?? 0,',
    nach: '      sets: Array.from(s.proSitzung.values()).reduce((x, y) => x + y, 0),',
  },
  {
    name: 'A1: die AELTESTE Sitzung gewinnt statt der juengsten',
    datei: 'rechnung',
    von: '      if (!juengstesDatum || datum > juengstesDatum) {',
    nach: '      if (!juengstesDatum || datum < juengstesDatum) {',
  },
  {
    name: 'A4: der Deckungsbericht behauptet gewichtete Rollen',
    datei: 'rechnung',
    von: '    rollenUngewichtet: true,',
    nach: '    rollenUngewichtet: false,',
  },
]

console.log('\n=== G-440 — die Gegenprobe ===\n')
zurueck()
const gesund = laeuft()
console.log(`Gesund: ${gesund ? 'GRUEN' : 'ROT'}\n`)
if (!gesund) { console.log('Abbruch: schon rot.'); process.exit(1) }

let alleRot = true
for (const s of SABOTAGEN) {
  zurueck()
  const p = D[s.datei]
  const vorher = fs.readFileSync(p, 'utf8')
  if (!vorher.includes(s.von)) {
    console.log(`  ${'FEHLER'.padEnd(7)} ${s.name}`)
    console.log(`          Sabotage kam NICHT an: "${s.von.trim().slice(0, 46)}…"`)
    alleRot = false
    continue
  }
  fs.writeFileSync(p, vorher.replace(s.von, s.nach))
  const nochGruen = laeuft()
  console.log(`  ${(nochGruen ? 'GRUEN' : 'ROT').padEnd(7)} ${s.name}`)
  if (nochGruen) { console.log('          ^^ BLIND'); alleRot = false }
}

zurueck()
console.log(`\nZurueckgesetzt: ${laeuft() ? 'GRUEN' : 'ROT'}`)
console.log(`\n${alleRot ? 'ALLE SABOTAGEN ROT.' : 'NICHT alle rot — siehe oben.'}`)
