#!/usr/bin/env node
// C-416: Der Punktelauf liest das Ergebnis des lokalen Tageslaufs.
// Der Waechter schreibt und loescht nichts; ein fehlender, alter oder roter
// Nachweis wird bewusst als Fehler an die Person weitergegeben, die pnpm gate
// oder den Punktelauf ausfuehrt.
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const DEFAULT_STATUS = 'backup/_manifests/kettenlauf-status.json'
const MAX_AGE_HOURS = 36

function option(name) {
  const index = process.argv.indexOf(name)
  return index < 0 ? undefined : process.argv[index + 1]
}

const statusPath = resolve(option('--status') ?? DEFAULT_STATUS)
// G-660: derselbe Waechter liest auch den Beitragslauf (`--name beitragslauf`).
const name = option('--name') ?? 'kettenlauf'

function rot(message) {
  console.error(`[${name}] ROT: ${message}`)
  process.exit(1)
}

if (!existsSync(statusPath)) {
  rot(`kein Tageslauf-Nachweis: ${statusPath}`)
}

let report
try {
  report = JSON.parse(readFileSync(statusPath, 'utf8'))
} catch (error) {
  rot(`unlesbarer Tageslauf-Nachweis: ${statusPath} (${error.message})`)
}

if (report?.version !== 1 || typeof report.finished_at !== 'string') {
  rot(`ungueltiger Tageslauf-Nachweis: ${statusPath}`)
}

if (report.status !== 'passed') {
  const gefallen = Array.isArray(report.schritte) ? report.schritte.find(x => x.status === 'failed') : null
  rot(`letzter Lauf ${report.status === 'aborted' ? 'abgebrochen, Nachlauf startet nicht' : 'fehlgeschlagen'} (${gefallen ? `Schritt ${gefallen.funktion}: ${String(gefallen.fehler ?? '').slice(0, 200)}` : `DB ${report.database ?? 'unbekannt'}`}, Exit ${report.exit_code ?? 'unbekannt'}): ${statusPath}`)
}

const finishedAt = new Date(report.finished_at)
if (Number.isNaN(finishedAt.getTime())) {
  rot(`ungueltiger Abschlusszeitpunkt: ${statusPath}`)
}

const ageHours = (Date.now() - finishedAt.getTime()) / 3_600_000
if (ageHours > MAX_AGE_HOURS) {
  rot(`letzter gruener Lauf vor ${Math.floor(ageHours)}h, faellig nach ${MAX_AGE_HOURS}h: ${statusPath}`)
}

console.log(`[${name}] gruen: letzter Lauf vor ${Math.max(0, Math.floor(ageHours))}h (${report.duration_seconds ?? '?'}s)`)
