// G-473 — jede Probe muss rot werden koennen.
//
// [cmd] EINZEILIG suchen, und die Zeilenenden je Datei nachmessen
// (G-469: `tab-produkte.tsx` hat LF, `client.ts` CRLF).
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const WURZEL = process.cwd()
const WEB = path.join(WURZEL, 'apps', 'web')
const PROBE = 'src/lib/__tests__/g473-quellkarten.test.ts'
const CFG = path.join(WEB, 'next.config.js')
const BAU = path.join(WEB, 'scripts/gate-build.js')

const FAELLE = [
  // Der Schalter faellt weg — der naechste Absturz ist unlesbar.
  { probe: 'Schalter weg', datei: CFG,
    von: "productionBrowserSourceMaps: process.env.LUMEOS_SOURCEMAPS === '1',",
    nach: '' },
  // Fest an — jeder Bau zahlt mit.
  { probe: 'fest an', datei: CFG,
    von: "productionBrowserSourceMaps: process.env.LUMEOS_SOURCEMAPS === '1',",
    nach: 'productionBrowserSourceMaps: true,' },
  // Jeder Wert schaltet ein, auch `0`.
  { probe: 'jeder Wert', datei: CFG,
    von: "productionBrowserSourceMaps: process.env.LUMEOS_SOURCEMAPS === '1',",
    nach: 'productionBrowserSourceMaps: !!process.env.LUMEOS_SOURCEMAPS,' },
  // Die Trennung vom Dev-Server faellt.
  { probe: 'Bau nach .next', datei: BAU,
    von: "process.env.LUMEOS_DIST_DIR || '.next-gate'",
    nach: "process.env.LUMEOS_DIST_DIR || '.next'" },
  // ══ DIE KONTROLLE ════════════════════════════════════════════════
  { probe: 'KONTROLLE', kontrolle: true, datei: CFG,
    von: 'const nextConfig = {',
    nach: '// Hinweis: frueher productionBrowserSourceMaps: true —\n'
      + '// nur als Wort in diesem Kommentar.\nconst nextConfig = {' },
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
