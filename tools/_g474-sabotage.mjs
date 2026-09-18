// G-474 — jede Probe muss rot werden koennen.
//
// [cmd] EINZEILIG suchen; Zeilenenden je Datei nachmessen (G-469).
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const WURZEL = process.cwd()
const WEB = path.join(WURZEL, 'apps', 'web')
const PROBE = 'src/lib/__tests__/g474-browserversion.test.ts'
const T = (n) => path.join(WURZEL, 'tools', n)

const FAELLE = [
  // Kein Werkzeug misst mehr gegen einen echten Browser.
  { probe: 'kein echter Browser (1)', datei: T('_g474-browserversionen.mjs'),
    von: "aus.push(await probe('Google Chrome (System)', { channel: 'chrome' }))",
    nach: '' },
  { probe: 'kein echter Browser (2)', datei: T('_g474-v2-echt.mjs'),
    von: 'const b = await chromium.launch({ headless: true, channel: KANAL })',
    nach: 'const b = await chromium.launch({ headless: true })' },
  // Die Belegkette prueft den Zwischenspeicher nicht mehr.
  { probe: 'ohne setCacheDisabled', datei: T('_g474-belegkette.mjs'),
    von: "await cdp.send('Network.setCacheDisabled', { cacheDisabled: true })",
    nach: "await cdp.send('Network.enable')" },
  // Sie faellt kein Urteil mehr.
  { probe: 'ohne Urteil', datei: T('_g474-belegkette.mjs'),
    von: '  ursacheBelegt: aus[0].stirbt && !aus[3].stirbt && aus[4].stirbt,',
    nach: '' },
  // Das Werkzeug startet den Server nicht mehr selbst.
  { probe: 'startet nicht mehr selbst', datei: T('_g474-anstrich.mjs'),
    von: "eigenerServer = spawn('npx', ['next', 'start', '-p', String(PORT)], {",
    nach: "eigenerServer = spawn('npx', ['echo', 'kein-start'], {" },
  // ══ DIE KONTROLLE ════════════════════════════════════════════════
  { probe: 'KONTROLLE', kontrolle: true, datei: T('_g474-belegkette.mjs'),
    von: "const BASIS = process.env.LUMEOS_BASIS ?? 'http://127.0.0.1:3251'",
    nach: "// Hinweis: frueher channel: 'chrome' und setCacheDisabled —\n"
      + "// nur als Wort in diesem Kommentar.\n"
      + "const BASIS = process.env.LUMEOS_BASIS ?? 'http://127.0.0.1:3251'" },
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
