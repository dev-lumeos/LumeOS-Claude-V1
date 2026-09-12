// G-438/A5 - die Gegenprobe.
//
// **A5:** *„eine Flaeche gefaerbt ohne Listenwert -> faellt sie?"*
//
// **Tom (zu Weg 1):** *„trag eine Gegenprobe ein, die genau das
// prueft: ein geliehener Wert, der in den Schnitt oder in den
// Engpass einfliesst, muss rot werden."*
//
// `[cmd]` **Jede Sabotage wird zuerst auf ANKOMMEN geprueft.**
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const WURZEL = path.resolve(import.meta.dirname, '..')
const WEB = path.join(WURZEL, 'apps/web')

const D = {
  baum: path.join(WEB, 'src/lib/koerper/muskelbaum.ts'),
  zuordnung: path.join(WEB, 'src/lib/koerper/schluessel-gruppe.ts'),
  ebenen: path.join(WEB, 'src/lib/koerper/ebenen.ts'),
  kachel: path.join(WEB, 'src/app/v2/recovery/tab-messwerte.tsx'),
}
const ORIGINAL = Object.fromEntries(
  Object.entries(D).map(([k, p]) => [k, fs.readFileSync(p, 'utf8')]))
function zurueck() { for (const [k, p] of Object.entries(D)) fs.writeFileSync(p, ORIGINAL[k]) }

function laeuft() {
  try {
    execFileSync('npx', ['tsx', '--test',
      'src/lib/koerper/__tests__/g438-geliehen.test.ts',
      'src/lib/koerper/__tests__/g438-zuordnung.test.ts'],
      { cwd: WEB, stdio: 'pipe', shell: process.platform === 'win32' })
    return true
  } catch { return false }
}

const SABOTAGEN = [
  // ══ Toms drei Auflagen ══════════════════════════════════════════
  {
    name: 'AUFLAGE 2: geliehene Kinder fliessen in den SCHNITT ein',
    datei: 'baum',
    von: '    const mitZahl = kinder\n      .filter(k => !k.vonGruppe)',
    nach: '    const mitZahl = kinder\n      .filter(() => true)',
  },
  {
    name: 'AUFLAGE 3: ein geliehener Wert wird ENGPASS',
    datei: 'baum',
    von: '        k.wert != null && !k.vonGruppe ? { name: k.name, wert: k.wert } : null,',
    nach: '        k.wert != null ? { name: k.name, wert: k.wert } : null,',
  },
  {
    name: 'AUFLAGE 1: die Herkunft faellt aus dem Ergebnis',
    datei: 'baum',
    von: '    const vonGruppe = typeof roh === \'object\' && roh ? roh.vonGruppe : null',
    nach: '    const vonGruppe = null',
  },
  {
    name: 'AUFLAGE 1: die Liste schreibt die Herkunft nicht mehr an',
    datei: 'kachel',
    von: '                          Wert von {a.vonGruppe}',
    nach: '                          &nbsp;',
  },
  // ══ A2: der Widerspruch kommt zurueck ═══════════════════════════
  {
    name: 'A2: die Uebersetzung faellt weg — orange und „--" kehren zurueck',
    datei: 'zuordnung',
    von: "  triceps: 'Triceps',             // (305)  Kinder: die drei Koepfe",
    nach: '',
  },
  {
    name: 'A2: ein Name wird ERFUNDEN statt gemeldet',
    datei: 'zuordnung',
    von: "export const OHNE_GRUPPE: Array<{ slug: string; grund: string }> = [",
    nach: "export const OHNE_GRUPPE: Array<{ slug: string; grund: string }> = [\n  { slug: 'abductors', grund: 'zu kurz' },",
  },
  {
    name: 'A2: die C-482-Namen fallen wieder auf `name: null`',
    datei: 'ebenen',
    von: "    name: 'Triceps Brachii Long Head',",
    nach: '    name: null,',
  },
  // ══ Ein Schluessel faellt still weg ═════════════════════════════
  {
    name: 'ein Schluessel ist WEDER zugeordnet NOCH gemeldet',
    datei: 'zuordnung',
    von: "  chest: 'Chest',                 // (211)",
    nach: '',
  },
]

console.log('\n=== G-438 — die Gegenprobe ===\n')
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
    console.log(`          Sabotage kam NICHT an: "${s.von.trim().slice(0, 48)}…"`)
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
