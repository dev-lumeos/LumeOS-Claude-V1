#!/usr/bin/env node
// C-416: Lokaler Tageslauf. Das Ergebnis bleibt als kleiner Nachweis liegen,
// damit der Punktelauf auch dann sichtbar rot wird, wenn der Lauf nachts
// scheitert und niemand die Konsole offen hatte.
import {
  closeSync, existsSync, mkdirSync, openSync, readdirSync, readFileSync, renameSync, rmSync,
  statSync, writeFileSync,
} from 'node:fs'
import { spawnSync } from 'node:child_process'
import { basename, dirname, resolve } from 'node:path'

const DEFAULT_MANIFEST = 'supabase/_pipeline/kette-voll.json'
const DEFAULT_STATUS = 'backup/_manifests/kettenlauf-status.json'
const DEFAULT_DUMP_DIR = 'supabase/_pipeline/daten'
const DEFAULT_DUMP_MANIFEST = 'supabase/_pipeline/daten/grunddaten-dump.manifest.json'
const CHECKPOINT_STEP = '537_backfill_materialized_meal_plan_days_count_daten'
const RUNNER = process.env.LUMEOS_KETTEN_RUNNER ?? 'supabase/_pipeline/kette-ausfuehren.ts'
const PUBLISHER = process.env.LUMEOS_GRUNDDATEN_PUBLISHER ?? 'supabase/_pipeline/grunddaten-erneuern.ts'
// Derselbe Container wie in kette-ausfuehren.ts.
const CONTAINER = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'

function option(name) {
  const index = process.argv.indexOf(name)
  return index < 0 ? undefined : process.argv[index + 1]
}

// A-96: `--praefix` gibt es nur, damit eine Probe ihre EIGENEN Waisen
// anlegen und wegraeumen kann, ohne einen echten Nachtlauf anzufassen.
const praefix = option('--praefix') ?? 'lumeos_tageskette'
if (!/^[a-z][a-z0-9_]*$/.test(praefix)) throw new Error(`--praefix ungueltig: ${praefix}`)

// A-96: ortsbezogen. Mit toISOString() hiess der Lauf vom 04.10. um 04:00
// (Bangkok) "20261003" - nach dem UTC-Vortag.
function defaultDatabase() {
  const j = new Date()
  const day = `${j.getFullYear()}${String(j.getMonth() + 1).padStart(2, '0')}${String(j.getDate()).padStart(2, '0')}`
  return `${praefix}_${day}`
}

const manifest = resolve(option('--manifest') ?? DEFAULT_MANIFEST)
const statusPath = resolve(option('--status') ?? DEFAULT_STATUS)
const database = option('--database') ?? defaultDatabase()
const dumpDir = resolve(option('--dump-dir') ?? DEFAULT_DUMP_DIR)
const dumpManifest = resolve(option('--dump-manifest') ?? DEFAULT_DUMP_MANIFEST)
const startedAt = new Date()
const candidate = resolve(dumpDir, `grunddaten-${startedAt.toISOString().replace(/[-:.TZ]/g, '')}-${process.pid}.tmp`)

// A-96: die Ausgabe des Laufs geht in eine Datei neben den Status. Vorher
// ging sie mit stdio 'inherit' in eine Konsole, die nachts niemand sieht -
// der Grund eines roten Laufs stand nur im Postgres-Containerlog.
const logPath = resolve(dirname(statusPath), `kettenlauf-${database}.log`)
mkdirSync(dirname(logPath), { recursive: true })
const logFd = openSync(logPath, 'w')

function logAuszug(zeilen = 60) {
  try {
    return readFileSync(logPath, 'utf8').split(/\r?\n/).filter(Boolean).slice(-zeilen)
  } catch {
    return []
  }
}

// ══ A-96: ein roter oder abgebrochener Lauf raeumt hinter sich auf ══════
//
// `[cmd]` **Gemessen 2026-10-06:** ein roter Lauf (03.10.) liess seine
// Datenbank liegen (240 MB) — `kette-ausfuehren.ts` behaelt sie bei Rot
// absichtlich „zur Pruefung". Ein abgebrochener (06.10., Freeze) liess die
// Datenbank (3,3 GB) UND den halben Dump `grunddaten-<zeit>-<pid>.tmp`
// (418 MB) liegen, und der Status zeigte weiter den gruenen Vortag.
//
// `[read]` **Bei Rot raeumt dieser Lauf selbst auf** — der Beleg ist das
// Log, nicht die Datenbank. **Ein Abbruch kann nicht mehr aufraeumen**;
// deshalb liegt waehrend des Laufs eine Marke neben dem Status, und der
// NAECHSTE Start erkennt daran den abgebrochenen Vorlauf.
//
// `[read]` **Weggeraeumt wird nur, was genau auf die Muster passt** — im
// Container liegen rund zwanzig fremde Datenbanken (`c511_final`,
// `g562_baseline` …), und keine davon darf in ein loses Muster fallen.
const WAISEN_DB = new RegExp(`^${praefix}_\\d{8}$`)
const WAISEN_TMP = /^grunddaten-\d{14,17}-\d+\.tmp$/
const markePath = resolve(dirname(statusPath), `kettenlauf-laufend-${praefix}.json`)
// ponytail: Windows vergibt PIDs neu. Eine Marke, die aelter ist als jeder
// echte Lauf (gemessen ~13 min), gilt deshalb als verwaist, auch wenn ihre
// PID gerade einem fremden Prozess gehoert.
const MARKE_MAX_STUNDEN = 6

function psql(sql) {
  const r = spawnSync('docker', ['exec', CONTAINER, 'psql', '-U', 'postgres', '-d', 'postgres',
    '-v', 'ON_ERROR_STOP=1', '-Atc', sql], { encoding: 'utf8' })
  if (r.status !== 0) throw new Error(`psql: ${(r.stderr || r.error?.message || '').trim()}`)
  return r.stdout
}

function datenbankLoeschen(name) {
  // Nur die eigenen Verbindungen beenden — wie dropDatabase() in
  // kette-ausfuehren.ts (C-416).
  psql(`SELECT pg_terminate_backend(pid) FROM pg_stat_activity
        WHERE datname = '${name.replace(/'/g, "''")}' AND usename = current_user;`)
  psql(`DROP DATABASE IF EXISTS "${name.replace(/"/g, '""')}";`)
}

/** Raeumt die Waisen weg und sagt, was es war. Fehler werden vermerkt, nicht geworfen. */
function waisenRaeumen() {
  const weg = { datenbanken: [], dateien: [], fehler: [] }
  try {
    for (const n of psql('SELECT datname FROM pg_database;').split(/\r?\n/)) {
      if (!WAISEN_DB.test(n)) continue
      datenbankLoeschen(n)
      weg.datenbanken.push(n)
    }
  } catch (f) {
    weg.fehler.push(String(f?.message ?? f))
  }
  if (existsSync(dumpDir)) {
    for (const n of readdirSync(dumpDir)) {
      if (!WAISEN_TMP.test(n)) continue
      rmSync(resolve(dumpDir, n), { force: true })
      weg.dateien.push(n)
    }
  }
  return weg.datenbanken.length || weg.dateien.length || weg.fehler.length ? weg : null
}

function lebt(pid) {
  try {
    process.kill(pid, 0)
    return true
  } catch (f) {
    return f.code === 'EPERM'
  }
}

let vorlauf = null
let aufgeraeumt = null

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
    log: logPath,
    ...(status === 'failed' ? { log_ende: logAuszug() } : {}),
    ...(dump ? { grunddaten_dump: dump } : {}),
    ...(vorlauf ? { vorlauf } : {}),
    ...(aufgeraeumt ? { aufgeraeumt } : {}),
  }
  mkdirSync(dirname(statusPath), { recursive: true })
  const temporary = `${statusPath}.tmp`
  writeFileSync(temporary, `${JSON.stringify(report, null, 2)}\n`, 'utf8')
  renameSync(temporary, statusPath)
}

// ── Vor dem Start: laeuft noch einer, oder ist einer abgebrochen? ─────
if (existsSync(markePath)) {
  let m = {}
  try {
    m = JSON.parse(readFileSync(markePath, 'utf8'))
  } catch {
    // Eine unlesbare Marke stammt von einem Lauf, der beim Schreiben starb.
  }
  const alterStunden = (Date.now() - statSync(markePath).mtimeMs) / 3_600_000
  if (m.pid && lebt(m.pid) && alterStunden < MARKE_MAX_STUNDEN) {
    console.error(`[kettenlauf] ein Lauf laeuft noch (PID ${m.pid}, ${m.database}); nichts angefasst.`)
    closeSync(logFd)
    process.exit(1)
  }
  vorlauf = { status: 'aborted', started_at: m.started_at ?? null, database: m.database ?? null, pid: m.pid ?? null }
}
aufgeraeumt = waisenRaeumen()
if (vorlauf) {
  // `[read]` **Sofort festhalten** — stirbt auch dieser Lauf, steht der
  // Abbruch im Status, nicht der gruene Vortag.
  writeStatus('aborted', null)
  console.error(`[kettenlauf] Vorlauf ${vorlauf.database} abgebrochen; aufgeraeumt: ${JSON.stringify(aufgeraeumt)}`)
}
writeFileSync(markePath, `${JSON.stringify({
  pid: process.pid, started_at: startedAt.toISOString(), database, candidate: basename(candidate),
}, null, 2)}\n`, 'utf8')

mkdirSync(dumpDir, { recursive: true })
const result = spawnSync('pnpm', [
  'exec', 'tsx', RUNNER,
  '--manifest', manifest,
  '--database', database,
  '--checkpoint-step', CHECKPOINT_STEP,
  '--checkpoint-dump', candidate,
], {
  cwd: process.cwd(),
  stdio: ['ignore', logFd, logFd],
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
    stdio: ['ignore', logFd, logFd],
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
  // A-96: die Datenbank eines roten Laufs bleibt nicht liegen — der Beleg
  // ist das Log (`log_ende`). Scheitert das Loeschen, steht es im Status,
  // und der naechste Start versucht es ueber das Muster erneut.
  try {
    datenbankLoeschen(database)
  } catch (f) {
    aufgeraeumt = { datenbanken: [], dateien: [], ...aufgeraeumt,
      fehler: [...(aufgeraeumt?.fehler ?? []), String(f?.message ?? f)] }
  }
  writeStatus('failed', exitCode)
  console.error(`[kettenlauf] Tageslauf rot; Datenbank ${database} geloescht, Log bleibt; Nachweis: ${statusPath}`)
  process.exitCode = exitCode
}

rmSync(markePath, { force: true })
closeSync(logFd)
