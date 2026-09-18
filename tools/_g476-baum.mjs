// G-476 — welchen Baum toetet `taskkill /F /T` wirklich?
//
// [read] Gemessen wird an einem EIGENEN, harmlosen Baum: ein
// `cmd.exe`, darunter ein `node`, das schlaeft. Kein fremder
// Prozess wird angefasst.
//
// [cmd] Die Frage: reicht `/T` ueber die Kindeskinder hinaus?
import { spawn, execFileSync } from 'node:child_process'

function lebt(pid) {
  try {
    const o = execFileSync('tasklist', ['/FI', `PID eq ${pid}`], { encoding: 'utf8' })
    return o.includes(String(pid))
  } catch { return false }
}

// Ein Baum wie in `_g474-anstrich.mjs`: shell:true -> cmd -> node
const kind = spawn('npx', ['node', '-e', 'setTimeout(()=>{}, 60000)'],
  { shell: true, stdio: 'ignore' })
await new Promise(r => setTimeout(r, 3000))

// Wer haengt unter dem cmd?
let baum = []
try {
  const o = execFileSync('powershell', ['-NoProfile', '-Command',
    `Get-CimInstance Win32_Process | Where-Object { $_.ParentProcessId -eq ${kind.pid} } | ForEach-Object { "$($_.ProcessId) $($_.Name)" }`],
    { encoding: 'utf8', timeout: 60000 })
  baum = o.trim().split('\n').filter(Boolean)
} catch (e) { baum = ['(nicht ermittelbar)'] }

const vorher = { cmdPid: kind.pid, cmdLebt: lebt(kind.pid), kinder: baum }

// Genau der Aufruf aus _g474-anstrich.mjs — aber der Fehler wird
// AUFGEFANGEN, denn genau er ist der Befund.
let taskkill = 'ok'
try {
  execFileSync('taskkill', ['/F', '/T', '/PID', String(kind.pid)],
    { stdio: 'ignore' })
} catch (e) {
  // [cmd] 128 heisst „Prozess nicht gefunden" — das cmd war schon
  // weg. [read] Und ein freier PID kann NEU VERGEBEN sein.
  taskkill = `Fehler ${e.status}`
}
await new Promise(r => setTimeout(r, 1500))

console.log(JSON.stringify({
  vorher,
  taskkill,
  nachher: { cmdLebt: lebt(kind.pid) },
  // Die Sache: `/T` nimmt den ganzen Unterbaum mit.
  hinweis: 'Getoetet wird cmd.pid UND alles darunter (/T).',
}, null, 2))
