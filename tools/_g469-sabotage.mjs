// G-469 — jede Probe muss rot werden koennen.
//
// [cmd] EINZEILIG suchen: die Dateien haben CRLF, und ein `\n` im
// Suchtext trifft nie (G-459, G-464, G-467 — dort je gestolpert).
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const WURZEL = process.cwd()
const WEB = path.join(WURZEL, 'apps', 'web')
const PROBE = 'src/app/v2/supplements/__tests__/g469-ladezeit-befund.test.ts'

const FAELLE = [
  { probe: 'A1a', datei: path.join(WEB, 'scripts/gate-build.js'),
    von: "process.env.LUMEOS_DIST_DIR || '.next-gate'",
    nach: "process.env.LUMEOS_DIST_DIR || '.next'" },
  { probe: 'A1b', datei: path.join(WEB, 'next.config.js'),
    von: "process.env.LUMEOS_DIST_DIR || '.next'",
    nach: "process.env.LUMEOS_DIST_DIR || '.next-dev'" },
  { probe: 'A2', datei: path.join(WURZEL, '.gitignore'),
    von: '.next-gate/', nach: '#.next-gate/' },
  // [cmd] `if (!geladen) return` steht ZWEIMAL. `replace` traf die
  // ERSTE (den Speichereffekt) — die Probe blieb zu Recht gruen, denn
  // die Sperre im SUCHEFFEKT stand noch. [read] Die Sabotage muss die
  // Stelle treffen, um die es geht: die vor dem Suchaufruf.
  { probe: 'A3', datei: path.join(WEB, 'src/app/v2/supplements/tab-produkte.tsx'),
    // [cmd] DIESE Datei hat LF, nicht CRLF — nachgemessen, nicht
    // angenommen. Ein pauschales `\r\n` fand die Stelle nicht.
    von: 'if (!geladen) return\n    const zeit = setTimeout(async',
    nach: 'const zeit = setTimeout(async' },
  { probe: 'A4a', datei: path.join(WEB, 'src/lib/allergien/allergie-read.ts'),
    von: 'const antworten = await Promise.all(dieseRunde.map(runde => {',
    nach: 'const antworten = await Promise.all([].map(runde => {' },
  { probe: 'A4b', datei: path.join(WEB, 'src/lib/allergien/allergie-read.ts'),
    von: 'TREFFER_SPEICHER.get(userId)', nach: "TREFFER_SPEICHER.get('x')" },
  { probe: 'A5', datei: path.join(WEB, 'src/lib/supplements/produkt-filter-lage.ts'),
    von: 'export function trefferSatz', nach: 'function trefferSatz' },
  // ══ DIE KONTROLLE ════════════════════════════════════════════════
  // [read] Ein Kommentar, der die bewachten Woerter ENTHAELT.
  { probe: 'KONTROLLE', kontrolle: true,
    datei: path.join(WEB, 'src/lib/allergien/allergie-read.ts'),
    von: 'export type SchreibErgebnis',
    nach: '// Hinweis: frueher Promise.all, TREFFER_SPEICHER.get(userId),\n'
      + '// trefferSatz und .next-gate — nur als Wort in diesem Kommentar.\n'
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
  const orig = fs.readFileSync(f.datei, 'utf8')
  if (!orig.includes(f.von)) {
    ergebnis.push({ probe: f.probe, stand: 'STELLE NICHT GEFUNDEN' })
    continue
  }
  fs.writeFileSync(f.datei, orig.replace(f.von, f.nach))
  const gruen = laeuft()
  fs.writeFileSync(f.datei, orig)
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
