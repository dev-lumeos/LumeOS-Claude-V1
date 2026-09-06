#!/usr/bin/env node
// C-416: Lokaler Tageslauf. Das Ergebnis bleibt als kleiner Nachweis liegen,
// damit der Punktelauf auch dann sichtbar rot wird, wenn der Lauf nachts
// scheitert und niemand die Konsole offen hatte.
import { mkdirSync, renameSync, writeFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { dirname, resolve } from 'node:path'

const DEFAULT_MANIFEST = 'supabase/_pipeline/kette.json'
const DEFAULT_STATUS = 'backup/_manifests/kettenlauf-status.json'
const RUNNER = 'supabase/_pipeline/kette-ausfuehren.ts'

function option(name) {
  const index = process.argv.indexOf(name)
  return index < 0 ? undefined : process.argv[index + 1]
}

function defaultDatabase() {
  const day = new Date().toISOString().slice(0, 10).replaceAll('-', '')
  return `lumeos_tageskette_${day}`
}

const manifest = resolve(option('--manifest') ?? DEFAULT_MANIFEST)
const statusPath = resolve(option('--status') ?? DEFAULT_STATUS)
const database = option('--database') ?? defaultDatabase()
const startedAt = new Date()

function writeStatus(status, exitCode) {
  const report = {
    version: 1,
    status,
    started_at: startedAt.toISOString(),
    finished_at: new Date().toISOString(),
    duration_seconds: Number(((Date.now() - startedAt.getTime()) / 1000).toFixed(1)),
    database,
    manifest,
    exit_code: exitCode,
  }
  mkdirSync(dirname(statusPath), { recursive: true })
  const temporary = `${statusPath}.tmp`
  writeFileSync(temporary, `${JSON.stringify(report, null, 2)}\n`, 'utf8')
  renameSync(temporary, statusPath)
}

const result = spawnSync('pnpm', [
  'exec', 'tsx', RUNNER,
  '--manifest', manifest,
  '--database', database,
], {
  cwd: process.cwd(),
  stdio: 'inherit',
  shell: process.platform === 'win32',
})

const exitCode = result.status ?? 1
if (exitCode === 0) {
  writeStatus('passed', 0)
  console.log(`[kettenlauf] Tageslauf gruen; Nachweis: ${statusPath}`)
} else {
  writeStatus('failed', exitCode)
  console.error(`[kettenlauf] Tageslauf rot; Nachweis: ${statusPath}`)
  process.exitCode = exitCode
}
