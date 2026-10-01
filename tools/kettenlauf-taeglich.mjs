#!/usr/bin/env node
// C-416: Lokaler Tageslauf. Das Ergebnis bleibt als kleiner Nachweis liegen,
// damit der Punktelauf auch dann sichtbar rot wird, wenn der Lauf nachts
// scheitert und niemand die Konsole offen hatte.
import { mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { dirname, resolve } from 'node:path'

const DEFAULT_MANIFEST = 'supabase/_pipeline/kette-voll.json'
const DEFAULT_STATUS = 'backup/_manifests/kettenlauf-status.json'
const DEFAULT_DUMP_DIR = 'supabase/_pipeline/daten'
const DEFAULT_DUMP_MANIFEST = 'supabase/_pipeline/daten/grunddaten-dump.manifest.json'
const CHECKPOINT_STEP = '537_backfill_materialized_meal_plan_days_count_daten'
const RUNNER = process.env.LUMEOS_KETTEN_RUNNER ?? 'supabase/_pipeline/kette-ausfuehren.ts'
const PUBLISHER = process.env.LUMEOS_GRUNDDATEN_PUBLISHER ?? 'supabase/_pipeline/grunddaten-erneuern.ts'

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
const dumpDir = resolve(option('--dump-dir') ?? DEFAULT_DUMP_DIR)
const dumpManifest = resolve(option('--dump-manifest') ?? DEFAULT_DUMP_MANIFEST)
const startedAt = new Date()
const candidate = resolve(dumpDir, `grunddaten-${startedAt.toISOString().replace(/[-:.TZ]/g, '')}-${process.pid}.tmp`)

function writeStatus(status, exitCode, dump) {
  const report = {
    version: 1,
    status,
    started_at: startedAt.toISOString(),
    finished_at: new Date().toISOString(),
    duration_seconds: Number(((Date.now() - startedAt.getTime()) / 1000).toFixed(1)),
    database,
    manifest,
    exit_code: exitCode,
    ...(dump ? { grunddaten_dump: dump } : {}),
  }
  mkdirSync(dirname(statusPath), { recursive: true })
  const temporary = `${statusPath}.tmp`
  writeFileSync(temporary, `${JSON.stringify(report, null, 2)}\n`, 'utf8')
  renameSync(temporary, statusPath)
}

mkdirSync(dumpDir, { recursive: true })
const result = spawnSync('pnpm', [
  'exec', 'tsx', RUNNER,
  '--manifest', manifest,
  '--database', database,
  '--checkpoint-step', CHECKPOINT_STEP,
  '--checkpoint-dump', candidate,
], {
  cwd: process.cwd(),
  stdio: 'inherit',
  shell: process.platform === 'win32',
})

const exitCode = result.status ?? 1
if (exitCode === 0) {
  const publish = spawnSync('pnpm', [
    'exec', 'tsx', PUBLISHER,
    'publish',
    '--candidate', candidate,
    '--manifest', dumpManifest,
    '--source-database', database,
  ], {
    cwd: process.cwd(),
    stdio: 'inherit',
    shell: process.platform === 'win32',
  })
  const publishExit = publish.status ?? 1
  if (publishExit === 0) {
    let dump
    try {
      dump = JSON.parse(readFileSync(dumpManifest, 'utf8')).dump?.path
    } catch {
      // Der Publisher ist fuer den Manifestnachweis verantwortlich. Der
      // optionale Statushinweis darf den gruenen Lauf nicht umdeuten.
    }
    writeStatus('passed', 0, dump)
    console.log(`[kettenlauf] Tageslauf gruen; Grunddaten erneuert; Nachweis: ${statusPath}`)
  } else {
    rmSync(candidate, { force: true })
    writeStatus('failed', publishExit)
    console.error(`[kettenlauf] Vollauf gruen, Grunddatenwechsel rot; alter Dump bleibt aktiv; Nachweis: ${statusPath}`)
    process.exitCode = publishExit
  }
} else {
  rmSync(candidate, { force: true })
  writeStatus('failed', exitCode)
  console.error(`[kettenlauf] Tageslauf rot; Nachweis: ${statusPath}`)
  process.exitCode = exitCode
}
