// G-465 — jede Probe muss rot werden koennen.
//
// [read] Dazu die KONTROLLE: eine Aenderung, die nichts Tragendes
// beruehrt, muss gruen bleiben — sonst misst die Reihe nur, dass
// jemand die Datei angefasst hat (Lehre aus G-460).
//
// [cmd] EINZEILIG suchen: die Dateien haben CRLF, und ein `\n` im
// Suchtext trifft nie (G-459, G-464 — dort dreimal passiert).
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const WEB = path.join(process.cwd(), 'apps', 'web')
const PROBE = 'src/app/v2/supplements/__tests__/g465-suchtempo.test.ts'

const FAELLE = [
  { probe: 'A1', datei: 'src/lib/allergien/allergie-read.ts',
    von: 'const antworten = await Promise.all(dieseRunde.map(runde => {',
    nach: 'const antworten = await Promise.all([].map(runde => {' },
  { probe: 'A2', datei: 'src/lib/allergien/allergie-read.ts',
    von: 'const BUENDEL = 10', nach: 'const BUENDEL = 99' },
  { probe: 'A3', datei: 'src/lib/allergien/allergie-read.ts',
    von: 'if (stueck.length < GROESSE) fertig = true',
    nach: 'if (false) fertig = true' },
  { probe: 'A4', datei: 'src/lib/allergien/allergie-read.ts',
    von: 'TREFFER_SPEICHER.get(userId)',
    nach: "TREFFER_SPEICHER.get('alle')" },
  { probe: 'A5', datei: 'src/lib/allergien/allergie-read.ts',
    von: 'if (!abgeschnitten) {', nach: 'if (true) {' },
  { probe: 'A6', datei: 'src/app/v2/settings/allergie-aktionen.ts',
    von: '  vergissAllergieTreffer()', nach: '  void 0' },
  { probe: 'A7', datei: 'src/lib/allergien/allergie-read.ts',
    von: 'const SPEICHER_MS = 60_000', nach: 'const SPEICHER_MS = 3_600_000' },
  // ══ DIE KONTROLLE ════════════════════════════════════════════════
  // [read] Ein Kommentar, der die bewachten Woerter ENTHAELT.
  { probe: 'KONTROLLE', kontrolle: true,
    datei: 'src/lib/allergien/allergie-read.ts',
    von: 'export type SchreibErgebnis',
    nach: '// Hinweis: frueher Promise.all, TREFFER_SPEICHER.set(userId,\n'
      + '// BUENDEL und SPEICHER_MS — nur als Wort in diesem Kommentar.\n'
      + 'export type SchreibErgebnis' },
]

function laeuft() {
  try {
    execFileSync('npx', ['tsx', '--test', PROBE],
      { cwd: WEB, encoding: 'utf8', stdio: 'pipe', shell: true })
    return true
  } catch { return false }
}

if (!laeuft()) {
  console.log('ABBRUCH: die Reihe ist schon ohne Sabotage rot.')
  process.exit(1)
}

const ergebnis = []
for (const f of FAELLE) {
  const p = path.join(WEB, f.datei)
  const orig = fs.readFileSync(p, 'utf8')
  if (!orig.includes(f.von)) {
    ergebnis.push({ probe: f.probe, stand: 'STELLE NICHT GEFUNDEN' })
    continue
  }
  fs.writeFileSync(p, orig.replace(f.von, f.nach))
  const gruen = laeuft()
  fs.writeFileSync(p, orig)
  const erwartet = f.kontrolle ? gruen : !gruen
  ergebnis.push({
    probe: f.probe, kontrolle: !!f.kontrolle, gruen,
    stand: erwartet ? 'OK' : (f.kontrolle ? 'ROT STATT GRUEN' : 'BLIND'),
  })
}

ergebnis.push({ probe: '(unveraendert)', gruen: laeuft(), stand: 'Rueckfall' })
console.log(JSON.stringify(ergebnis, null, 2))
const kaputt = ergebnis.filter(e => e.stand !== 'OK' && e.stand !== 'Rueckfall')
console.log(kaputt.length
  ? `\n${kaputt.length} PROBLEM(E)`
  : '\nAlle Proben koennen rot werden, die Kontrolle bleibt gruen.')
