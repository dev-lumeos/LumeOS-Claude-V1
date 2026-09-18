// G-476 — ueberlebt die cmd-Huelle den Server, den sie startet?
//
// [read] Wenn NEIN, ist `kind.pid` nach kurzer Zeit ein TOTER PID —
// und Windows vergibt PIDs neu. Ein spaeteres `taskkill /F /T` auf
// diese Nummer trifft dann irgendeinen fremden Prozess MIT SEINEM
// GANZEN BAUM.
import { spawn, execFileSync } from 'node:child_process'
import net from 'node:net'
import path from 'node:path'

const PORT = 3299   // frei, nicht 3200/3220
const WEB = path.join(process.cwd(), 'apps', 'web')

function lebt(pid) {
  try {
    return execFileSync('tasklist', ['/FI', `PID eq ${pid}`], { encoding: 'utf8' })
      .includes(String(pid))
  } catch { return false }
}
function belegt(port) {
  return new Promise(r => {
    const s = net.createConnection({ port, host: '127.0.0.1' })
    s.on('connect', () => { s.destroy(); r(true) })
    s.on('error', () => r(false))
    setTimeout(() => { s.destroy(); r(false) }, 1200)
  })
}

// ══ G-476: nur mit ausdruecklicher Erlaubnis ══════════════════════
//
// [read] Diese Probe MUSS einen Server starten — sie misst ja, wie
// lange die cmd-Huelle lebt. [cmd] Aber nicht ungefragt: ohne
// `LUMEOS_START=1` sagt sie, was sie braucht, und hoert auf.
if (process.env.LUMEOS_START !== "1") {
  console.log(JSON.stringify({
    fehler: "Diese Probe startet einen Produktionsbau auf Port "
      + PORT + " — das braucht LUMEOS_START=1.",
    hinweis: "Sie beendet NUR ihren eigenen Bau, ueber den Port, ohne /T.",
  }, null, 2))
  process.exit(1)
}

// Genau wie in _g474-anstrich.mjs gestartet.
const kind = spawn('npx', ['next', 'start', '-p', String(PORT)], {
  cwd: WEB, shell: true, stdio: 'ignore',
  env: { ...process.env, LUMEOS_DIST_DIR: '.next-gate' },
})
const spur = []
for (let i = 0; i < 12; i++) {
  await new Promise(r => setTimeout(r, 1000))
  spur.push({ s: i + 1, huelleLebt: lebt(kind.pid), portOffen: await belegt(PORT) })
  if (spur.at(-1).portOffen && !spur.at(-1).huelleLebt) break
}

// Aufraeumen: NUR den Prozess am Port, nicht den PID der Huelle.
//
// [cmd] Ueber `netstat`, NICHT ueber PowerShell — `Get-CimInstance`
// und `Get-NetTCPConnection` brauchten hier ueber 60 s und liessen
// das Skript in die Frist laufen.
function pidAmPort(port) {
  try {
    const o = execFileSync('netstat', ['-ano'], { encoding: 'utf8', timeout: 20000 })
    for (const z of o.split(/\r?\n/)) {
      // Nur LISTENING-Zeilen (deutsch: ABHOEREN) mit genau diesem Port.
      if (!new RegExp(`[:.]${port}\s`).test(z)) continue
      if (!/ABH|LISTEN/i.test(z)) continue
      const t = z.trim().split(/\s+/)
      const pid = t[t.length - 1]
      if (/^\d+$/.test(pid) && pid !== '0') return pid
    }
  } catch { /* nichts */ }
  return null
}

let beendet = null
const amPort = pidAmPort(PORT)
if (amPort) {
  try {
    // OHNE `/T`: nur dieser eine Prozess, kein Baum.
    execFileSync('taskkill', ['/F', '/PID', amPort], { stdio: 'ignore' })
    beendet = amPort
  } catch (e) { beendet = `Fehler bei ${amPort}` }
} else {
  beendet = '(kein Prozess am Port gefunden)'
}

console.log(JSON.stringify({
  huellePid: kind.pid, spur,
  huelleUeberlebtDenServer: spur.some(x => x.portOffen && x.huelleLebt),
  beendeterPortProzess: beendet,
}, null, 2))
