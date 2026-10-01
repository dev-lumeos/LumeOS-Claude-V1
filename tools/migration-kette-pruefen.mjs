// C-446: Die Aufbaukette muss jede versionierte Migration kennen. Der
// gemessene Altbestand bleibt sichtbar; nur eine neue Luecke macht das Gate rot.
//
// AUFRUF: node tools/migration-kette-pruefen.mjs             Arbeitsbaum
//         node tools/migration-kette-pruefen.mjs --staging   der Commit
//
// NACHTRAG 2026-10-01 (A-82): `--staging` liest den Zustand NACH dem
// Commit statt den Arbeitsbaum.
//
// ANLASS, gemessen: `fs.readdirSync(MIGRATIONS)` und die Manifestdatei
// kamen aus dem Arbeitsbaum. Schreibt ein Agent dort eine neue
// Migration, waehrend der Orchestrator eine Dokumentdatei committet, so
// faellt DIESER Commit mit ,,ROT neu, ohne Kettenschritt" ? an einer
// Datei, die der Commit nicht traegt. `[read]` **Damit konnte niemand
// committen, solange ein Agent in `supabase/` baute**, und das hat am
// 2026-09-30 zwei Stunden gekostet.
//
// `[read]` **Der Zustand nach dem Commit ist: was in HEAD steht, plus
// die hinzugefuegten und geaenderten Pfade aus dem Staging, minus die
// geloeschten.** Nicht der Arbeitsbaum, und nicht nur das Staging ? ein
// Commit, der eine Dokumentdatei traegt, muss die Migrationen aus HEAD
// weiter sehen.
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const MIGRATIONS = path.join(ROOT, 'supabase', 'migrations')
const MANIFEST = path.join(ROOT, 'supabase', '_pipeline', 'kette.json')
const CONTAINER = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'

/** A-82: den Zustand nach dem Commit lesen, nicht den Arbeitsbaum. */
const AUS_STAGING = process.argv.includes('--staging')

function git(args) {
  return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8' })
    .split(/\r?\n/).filter(Boolean)
}

/** Die Migrationsdateien, die der Commit haben wird. */
function migrationenAusStaging() {
  const inHead = git(['ls-tree', '-r', '--name-only', 'HEAD',
    '--', 'supabase/migrations'])
  const dazu = git(['diff', '--cached', '--name-only', '--diff-filter=ACM',
    '--', 'supabase/migrations'])
  const weg = new Set(git(['diff', '--cached', '--name-only',
    '--diff-filter=D', '--', 'supabase/migrations']))
  const menge = new Set([...inHead, ...dazu]
    .map(p => p.replace(/\\/g, '/'))
    .filter(p => p.endsWith('.sql')))
  for (const p of weg) menge.delete(p.replace(/\\/g, '/'))
  return [...menge].sort()
}

/**
 * Das Manifest, wie der Commit es haben wird.
 *
 * `[read]` Auch das Manifest lag im Arbeitsbaum ? ein Agent, der einen
 * Kettenschritt eintraegt und noch nicht stagt, haette den Befund
 * sonst andersherum verdeckt.
 */
function manifestAusStaging() {
  try {
    return execFileSync('git', ['show', ':supabase/_pipeline/kette.json'],
      { cwd: ROOT, encoding: 'utf8' })
  } catch {
    // Nicht im Staging: dann gilt die Fassung aus HEAD.
    return execFileSync('git', ['show', 'HEAD:supabase/_pipeline/kette.json'],
      { cwd: ROOT, encoding: 'utf8' })
  }
}

// `[cmd]` **2026-09-08, C-448: die Liste ist LEER.** Tom hat die acht
// toten Migrationen nach `backup/tote-migrationen/` verschoben ? sie
// waren in C-447 einzeln geprueft und alle von der Pipeline abgedeckt.
//
// `[read]` **Eine Liste, die es nicht gibt, kann nicht veralten.**
// **Jede Migrationsdatei ohne Kettenschritt macht das Gate jetzt
// rot** ? ohne Ausnahme.
export const KNOWN_NON_CHAIN_MIGRATIONS = new Set([])

function versionOf(file) {
  const match = path.basename(file).match(/^(\d+)_/)
  if (!match) throw new Error(`Keine Migrationsversion im Dateinamen: ${file}`)
  return match[1]
}

export function classifyMigrations({ migrationFiles, chainPaths, liveVersions, knownNonChain }) {
  const report = {
    inChainLive: [],
    inChainNotLive: [],
    knownNonChainLive: [],
    knownNonChainNotLive: [],
    newNonChainLive: [],
    newNonChainNotLive: [],
  }

  for (const file of migrationFiles) {
    const name = path.basename(file)
    const version = versionOf(name)
    const inChain = chainPaths.has(file)
    const live = liveVersions.has(version)
    if (inChain && live) report.inChainLive.push(name)
    else if (inChain) report.inChainNotLive.push(name)
    else if (knownNonChain.has(name) && live) report.knownNonChainLive.push(name)
    else if (knownNonChain.has(name)) report.knownNonChainNotLive.push(name)
    else if (live) report.newNonChainLive.push(name)
    else report.newNonChainNotLive.push(name)
  }

  report.hasNewFindings = report.newNonChainLive.length > 0 || report.newNonChainNotLive.length > 0
  return report
}

function readLiveVersions() {
  try {
    const output = execFileSync('docker', [
      'exec', CONTAINER, 'psql', '-X', '-q', '-v', 'ON_ERROR_STOP=1',
      '-U', 'postgres', '-d', 'postgres', '-At', '-c',
      'SELECT version FROM supabase_migrations.schema_migrations ORDER BY version;',
    ], { cwd: ROOT, encoding: 'utf8' })
    return new Set(output.split(/\r?\n/).filter(Boolean))
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error)
    throw new Error(`supabase_migrations.schema_migrations ist nicht lesbar: ${detail}`)
  }
}

function run() {
  const rohManifest = AUS_STAGING
    ? manifestAusStaging()
    : fs.readFileSync(MANIFEST, 'utf8')
  const manifest = JSON.parse(rohManifest)
  const chainPaths = new Set(manifest.steps.map(step => step.path.replace(/\\/g, '/')))
  const migrationFiles = AUS_STAGING
    ? migrationenAusStaging()
    : fs.readdirSync(MIGRATIONS)
      .filter(name => name.endsWith('.sql'))
      .sort()
      .map(name => `supabase/migrations/${name}`)
  const report = classifyMigrations({
    migrationFiles,
    chainPaths,
    liveVersions: readLiveVersions(),
    knownNonChain: KNOWN_NON_CHAIN_MIGRATIONS,
  })

  const quelle = AUS_STAGING ? 'im Commit' : 'im Arbeitsbaum'
  console.log(`[migration-kette] ${migrationFiles.length} Dateien ${quelle}: `
    + `Kette+live ${report.inChainLive.length}, Kette+nicht-live ${report.inChainNotLive.length}, `
    + `Bestand+live ${report.knownNonChainLive.length}, Bestand+nicht-live ${report.knownNonChainNotLive.length}.`)
  for (const name of [...report.knownNonChainLive, ...report.knownNonChainNotLive]) {
    const live = report.knownNonChainLive.includes(name) ? 'live' : 'nicht-live'
    console.log(`[migration-kette] BESTAND ${live}: ${name}`)
  }
  for (const name of [...report.newNonChainLive, ...report.newNonChainNotLive]) {
    const live = report.newNonChainLive.includes(name) ? 'live' : 'nicht-live'
    console.log(`[migration-kette] ROT neu ${live}, ohne Kettenschritt: ${name}`)
  }
  if (report.hasNewFindings) process.exit(1)
  console.log('[migration-kette] gruen: keine neue Migration ohne Kettenschritt.')
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) run()
