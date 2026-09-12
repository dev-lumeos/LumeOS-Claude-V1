#!/usr/bin/env node
// `[cmd]` C-Codex, 2026-09-12: lean-ctx `hook codex-pretooluse`
// gibt bei jedem geprueften Eingabeformat eine LEERE Ausgabe
// zurueck (exit 0). Codex liest das als "invalid pre-tool-use
// JSON output" und bricht die Sitzung ab.
//
// `[read]` Leer heisst bei lean-ctx: keine Aenderung noetig.
// Diese Huelle uebersetzt das in gueltiges JSON.
//
// `[cmd]` Die .cmd startet unter Windows NICHT ueber spawn
// (EINVAL, errno -4071) -- deshalb wird die .js direkt gerufen.
import { spawn } from 'node:child_process'

const LEAN = 'C:/Users/User/AppData/Roaming/npm/node_modules/lean-ctx-bin/bin/lean-ctx.js'
const unterbefehl = process.argv[2] || 'codex-pretooluse'

let ein = ''
process.stdin.setEncoding('utf8')
for await (const stueck of process.stdin) ein += stueck

const durchwinken = () => {
  process.stdout.write(JSON.stringify({ continue: true }))
  process.exit(0)
}

let kind
try {
  kind = spawn(process.execPath, [LEAN, 'hook', unterbefehl], {
    stdio: ['pipe', 'pipe', 'pipe'], windowsHide: true,
  })
} catch { durchwinken() }

kind.on('error', durchwinken)
kind.stdin.on('error', () => {})
kind.stdin.write(ein)
kind.stdin.end()

let aus = ''
kind.stdout.on('data', (d) => { aus += d })
kind.stderr.on('data', () => {})

kind.on('close', () => {
  if (aus.trim().length > 0) { process.stdout.write(aus); process.exit(0) }
  durchwinken()
})
