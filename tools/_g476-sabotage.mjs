// G-476 — jede Probe muss rot werden koennen.
//
// [cmd] Der wichtigste Fall ist der URSPRUNGSZUSTAND: `taskkill /F
// /T` auf die gemerkte PID zurueckbauen. Wird die Reihe dann nicht
// rot, haette sie Toms Dev-Server wieder sterben lassen.
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const WURZEL = process.cwd()
const WEB = path.join(WURZEL, 'apps', 'web')
const PROBE = 'src/lib/__tests__/g476-werkzeug-beendet-nur-eigenes.test.ts'
const T = (n) => path.join(WURZEL, 'tools', n)

const FAELLE = [
  // ══ DER URSPRUNGSZUSTAND ═════════════════════════════════════════
  { probe: 'URSPRUNG (/T zurueck)', datei: T('_g474-anstrich.mjs'),
    von: "      execFileSync('taskkill', ['/F', '/PID', pid], { stdio: 'ignore' })",
    nach: "      execFileSync('taskkill', ['/F', '/T', '/PID', pid], { stdio: 'ignore' })" },
  // Ueber die gemerkte PID statt ueber den Port.
  { probe: 'gemerkte PID', datei: T('_g474-anstrich.mjs'),
    von: '  const pid = pidAmPort(PORT)',
    nach: '  const pid = String(eigenerServer.pid)' },
  // Das Tor faellt weg — startet wieder ungefragt.
  { probe: 'ohne LUMEOS_START', datei: T('_g474-anstrich.mjs'),
    von: 'const DARF_STARTEN = process.env.LUMEOS_START === "1"',
    nach: 'const DARF_STARTEN = true' },
  // Die Liste der Starter ist leer — dann prueft nichts mehr.
  { probe: 'kein Starter mehr', datei: T('_g474-anstrich.mjs'),
    von: "  eigenerServer = spawn('npx', ['next', 'start', '-p', String(PORT)], {",
    nach: "  eigenerServer = spawn('npx', ['echo', 'nichts'], {" },
  // ══ DIE KONTROLLE ════════════════════════════════════════════════
  { probe: 'KONTROLLE', kontrolle: true, datei: T('_g474-anstrich.mjs'),
    von: 'const PORT = Number(process.env.LUMEOS_PORT ?? 3251)',
    nach: "// Hinweis: frueher taskkill '/T' und eigenerServer.pid —\n"
      + '// nur als Wort in diesem Kommentar.\n'
      + 'const PORT = Number(process.env.LUMEOS_PORT ?? 3251)' },
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
