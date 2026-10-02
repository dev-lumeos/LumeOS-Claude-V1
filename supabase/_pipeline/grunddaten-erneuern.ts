#!/usr/bin/env node
// A-91: Der Vollaufbau erzeugt am C-537-Zwischenstand einen Kandidaten.
// Erst ein vollstaendig gruener Tageslauf veroeffentlicht Dump und Manifest.
import { execFileSync, spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

import {
  berechneDateiPruefsumme,
  berechneQuellPruefsumme,
  pruefeGrunddatenDump,
  pruefeGrunddatenManifest,
  type GrunddatenManifest,
} from './grunddaten-pruefen'

const ROOT = process.cwd()
const CONTAINER = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const ADMIN_DB = 'postgres'
const DEFAULT_MANIFEST = 'supabase/_pipeline/daten/grunddaten-dump.manifest.json'
const SOURCE_STEP = '537_backfill_materialized_meal_plan_days_count_daten'
const RETAIN_DUMPS = 2

type KompatibilitaetsOptionen = {
  root: string
  manifestPath: string
  reason: string
  now?: Date
}

function fail(message: string): never {
  throw new Error(message)
}

function option(name: string): string | undefined {
  const index = process.argv.indexOf(name)
  return index < 0 ? undefined : process.argv[index + 1]
}

function requireOption(name: string): string {
  return option(name) ?? fail(`${name} fehlt`)
}

function quoteIdent(identifier: string): string {
  return `"${identifier.replace(/"/g, '""')}"`
}

function assertDatabaseName(database: string): void {
  if (database === ADMIN_DB || !/^[a-z][a-z0-9_]*$/i.test(database)) {
    fail(`Ungueltiger Wegwerf-Datenbankname: ${database}`)
  }
}

function run(command: string, args: string[], options: { env?: NodeJS.ProcessEnv; input?: string } = {}): void {
  const result = spawnSync(command, args, {
    cwd: ROOT,
    env: options.env ?? process.env,
    input: options.input,
    encoding: 'utf8',
    maxBuffer: 512 * 1024 * 1024,
    shell: process.platform === 'win32' && command === 'pnpm',
  })
  if (result.stdout) process.stdout.write(result.stdout)
  if (result.stderr) process.stderr.write(result.stderr)
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(' ')} schlug fehl (Exit ${result.status ?? 1})`)
  }
}

function sql(database: string, text: string): void {
  run('docker', [
    'exec', '-i', CONTAINER,
    'psql', '-U', 'postgres', '-d', database,
    '-v', 'ON_ERROR_STOP=1', '-f', '-',
  ], { input: text })
}

function adminSql(text: string): void {
  run('docker', [
    'exec', CONTAINER,
    'psql', '-U', 'postgres', '-d', ADMIN_DB,
    '-v', 'ON_ERROR_STOP=1', '-c', text,
  ])
}

function dropDatabase(database: string): void {
  adminSql(`
    SELECT pg_terminate_backend(pid)
    FROM pg_stat_activity
    WHERE datname = '${database.replace(/'/g, "''")}'
      AND usename = current_user;
  `)
  adminSql(`DROP DATABASE IF EXISTS ${quoteIdent(database)};`)
}

function cleanupDerivedData(database: string): void {
  sql(database, `
    UPDATE nutrition.nutrient_defs SET parent_code = NULL;
    TRUNCATE nutrition.nutrient_details;

    UPDATE nutrition.foods
    SET name_display_de = NULL,
        name_display_en = NULL,
        processing_level = NULL;

    DELETE FROM nutrition.food_aliases
    WHERE source IN ('curated_nebenname', 'curated_suchbegriff');

    DELETE FROM nutrition.food_tags
    WHERE tag_code = ANY (ARRAY[
      'whole_food', 'ultra_processed', 'vegan', 'vegetarian',
      'contains_nuts', 'contains_gluten', 'contains_lactose',
      'thai_food', 'halal', 'kosher'
    ]);

    TRUNCATE nutrition.foods_portions;
    TRUNCATE nutrition.micronutrient_overview_items;
  `)

  // 027 berechnet sort_weight nach processing_level neu. Nach dem Leeren
  // muss die Vorstufe wieder aus derselben Formel entstehen; ein festes
  // Rueckschreiben der 7.140 Werte waere eine zweite Wahrheit.
  run('pnpm', [
    'exec', 'tsx',
    'supabase/_pipeline/_ableitung/sortweight-berechnen.ts',
    '--anwenden',
  ], {
    env: {
      ...process.env,
      PGDATABASE: database,
      LUMEOS_DB_CONTAINER: CONTAINER,
    },
  })
}

function dumpDatabase(database: string, output: string): void {
  fs.mkdirSync(path.dirname(output), { recursive: true })
  const fd = fs.openSync(output, 'w')
  let failure: Error | undefined
  try {
    const result = spawnSync('docker', [
      'exec', CONTAINER,
      'pg_dump', '-U', 'postgres', '-d', database,
      '-Fc', '-Z6', '--no-owner', '--exclude-schema=supabase_migrations',
    ], {
      cwd: ROOT,
      stdio: ['ignore', fd, 'inherit'],
    })
    if (result.status !== 0) {
      failure = new Error(`pg_dump fuer ${database} schlug fehl (Exit ${result.status ?? 1})`)
    }
  } catch (error) {
    failure = error instanceof Error ? error : new Error(String(error))
  } finally {
    fs.closeSync(fd)
  }
  if (failure) {
    fs.rmSync(output, { force: true })
    throw failure
  }
}

export function erzeugeKandidaten(sourceDatabase: string, outputFile: string): void {
  assertDatabaseName(sourceDatabase)
  const snapshotDatabase = `${sourceDatabase}_a91_snapshot`.slice(0, 63)
  assertDatabaseName(snapshotDatabase)
  dropDatabase(snapshotDatabase)
  try {
    adminSql(`CREATE DATABASE ${quoteIdent(snapshotDatabase)} TEMPLATE ${quoteIdent(sourceDatabase)};`)
    cleanupDerivedData(snapshotDatabase)
    dumpDatabase(snapshotDatabase, path.resolve(outputFile))
  } finally {
    dropDatabase(snapshotDatabase)
  }
}

function relativeRepoPath(file: string): string {
  const relative = path.relative(ROOT, path.resolve(file)).replace(/\\/g, '/')
  if (relative.startsWith('../') || path.isAbsolute(relative)) fail(`Pfad ausserhalb des Repos: ${file}`)
  return relative
}

function gitCommit(): string {
  return execFileSync('git', ['rev-parse', 'HEAD'], { cwd: ROOT, encoding: 'utf8' }).trim()
}

function timestampForFile(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')
}

function resolveUnterRoot(root: string, relativePath: string): string {
  const absoluteRoot = path.resolve(root)
  const absolute = path.resolve(absoluteRoot, relativePath)
  const prefix = `${absoluteRoot}${path.sep}`
  if (absolute !== absoluteRoot && !absolute.startsWith(prefix)) {
    fail(`Pfad ausserhalb des Repos: ${relativePath}`)
  }
  return absolute
}

export function erneuereQuellPruefsummen(options: KompatibilitaetsOptionen): GrunddatenManifest {
  const root = path.resolve(options.root)
  const manifestFile = resolveUnterRoot(root, options.manifestPath)
  const reason = options.reason.trim()
  if (!reason) fail('--reason fehlt')
  if (!fs.existsSync(manifestFile)) fail(`Grunddaten-Manifest fehlt: ${options.manifestPath}`)

  const previousText = fs.readFileSync(manifestFile, 'utf8')
  const previous = JSON.parse(previousText) as GrunddatenManifest
  pruefeGrunddatenDump({ root, manifestPath: options.manifestPath })

  const sources = previous.sources.map(source => ({
    ...source,
    sha256: berechneQuellPruefsumme(root, source),
  }))
  const changes = sources.flatMap((source, index) => {
    const previousSource = previous.sources[index]
    return source.sha256 === previousSource.sha256
      ? []
      : [{
          path: source.path,
          previous_sha256: previousSource.sha256,
          compatible_sha256: source.sha256,
        }]
  })
  if (changes.length === 0) fail('Keine geaenderte Quelle zum Nachziehen')

  const manifest: GrunddatenManifest = {
    ...previous,
    format_version: 2,
    sources,
    source_compatibility_checks: [
      ...(previous.source_compatibility_checks ?? []),
      {
        checked_at: (options.now ?? new Date()).toISOString(),
        reason,
        changes,
      },
    ],
  }
  const temporary = `${manifestFile}.${process.pid}.tmp`
  try {
    fs.writeFileSync(temporary, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')
    pruefeGrunddatenManifest({ root, manifestPath: path.relative(root, temporary) })
    try {
      fs.renameSync(temporary, manifestFile)
    } catch (error) {
      const code = error && typeof error === 'object' && 'code' in error ? String(error.code) : 'unbekannt'
      throw new Error(`Manifestwechsel fehlgeschlagen (${code}); das alte Manifest bleibt aktiv.`, { cause: error })
    }
    return manifest
  } catch (error) {
    fs.rmSync(temporary, { force: true })
    throw error
  }
}

function retainRecentDumps(dumpDir: string, protectedFiles: Set<string>): void {
  const dumps = fs.readdirSync(dumpDir)
    .filter(name => /^grunddaten-.*\.dump$/.test(name))
    .map(name => path.resolve(dumpDir, name))
    .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs)

  const keep = new Set(dumps.slice(0, RETAIN_DUMPS))
  for (const file of protectedFiles) keep.add(path.resolve(file))
  for (const file of dumps) {
    if (keep.has(file)) continue
    try {
      fs.rmSync(file)
    } catch (error) {
      const code = error && typeof error === 'object' && 'code' in error ? String(error.code) : 'unbekannt'
      console.warn(`[A-91] Alter Dump bleibt vorlaeufig liegen (${code}); naechster gruener Lauf versucht erneut: ${file}`)
    }
  }
}

export function veroeffentlicheKandidaten(options: {
  candidate: string
  manifestPath: string
  sourceDatabase: string
  now?: Date
}): GrunddatenManifest {
  const candidate = path.resolve(options.candidate)
  const manifestFile = path.resolve(options.manifestPath)
  if (!fs.existsSync(candidate)) fail(`Dump-Kandidat fehlt: ${candidate}`)

  const previous = JSON.parse(fs.readFileSync(manifestFile, 'utf8')) as GrunddatenManifest
  if (!Array.isArray(previous.sources) || previous.sources.length !== 19) {
    fail(`Herkunftsmanifest muss genau 19 Quellen tragen, ist ${previous.sources?.length ?? 0}`)
  }

  const now = options.now ?? new Date()
  const finalDump = path.join(path.dirname(manifestFile), `grunddaten-${timestampForFile(now)}.dump`)
  const manifestTemporary = `${manifestFile}.${process.pid}.tmp`
  let dumpPublished = false

  try {
    fs.renameSync(candidate, finalDump)
    dumpPublished = true

    const manifest: GrunddatenManifest & { source_git_commit: string } = {
      format_version: 1,
      created_at: now.toISOString(),
      source_database: options.sourceDatabase,
      source_chain_step: SOURCE_STEP,
      source_git_commit: gitCommit(),
      dump: {
        path: relativeRepoPath(finalDump),
        sha256: berechneDateiPruefsumme(finalDump),
        bytes: fs.statSync(finalDump).size,
      },
      sources: previous.sources.map(source => ({
        ...source,
        sha256: berechneQuellPruefsumme(ROOT, source),
      })),
    }

    fs.writeFileSync(manifestTemporary, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')
    // Vor dem Zeigerwechsel muss der komplette neue Stand bereits gruen
    // sein. Danach darf kein Prueffehler den neuen Dump wieder entfernen.
    const checked = pruefeGrunddatenManifest({
      root: ROOT,
      manifestPath: relativeRepoPath(manifestTemporary),
    })
    try {
      fs.renameSync(manifestTemporary, manifestFile)
    } catch (error) {
      const code = error && typeof error === 'object' && 'code' in error ? String(error.code) : 'unbekannt'
      throw new Error(
        `Manifestwechsel fehlgeschlagen (${code}); der alte Dump bleibt aktiv. ` +
        'Der neue, noch nicht referenzierte Dump wird entfernt.',
        { cause: error },
      )
    }

    retainRecentDumps(path.dirname(manifestFile), new Set([finalDump, previous.dump.path]))
    console.log(
      `[A-91] Grunddaten veroeffentlicht: ${relativeRepoPath(finalDump)}, ` +
      `${checked.sourcesChecked} Quellen, ${checked.dumpBytes} Bytes`,
    )
    return manifest
  } catch (error) {
    fs.rmSync(manifestTemporary, { force: true })
    if (dumpPublished) {
      try {
        fs.rmSync(finalDump)
      } catch (cleanupError) {
        const code = cleanupError && typeof cleanupError === 'object' && 'code' in cleanupError
          ? String(cleanupError.code)
          : 'unbekannt'
        console.warn(`[A-91] Unreferenzierter Dump konnte nicht entfernt werden (${code}): ${finalDump}`)
      }
    }
    throw error
  }
}

function main(): void {
  const command = process.argv[2]
  if (command === 'snapshot') {
    erzeugeKandidaten(requireOption('--database'), requireOption('--output'))
    return
  }
  if (command === 'publish') {
    veroeffentlicheKandidaten({
      candidate: requireOption('--candidate'),
      manifestPath: option('--manifest') ?? DEFAULT_MANIFEST,
      sourceDatabase: requireOption('--source-database'),
    })
    return
  }
  if (command === 'rehash') {
    const root = option('--root') ?? ROOT
    const manifestPath = option('--manifest') ?? DEFAULT_MANIFEST
    const manifest = erneuereQuellPruefsummen({
      root,
      manifestPath,
      reason: requireOption('--reason'),
    })
    const changes = manifest.source_compatibility_checks?.at(-1)?.changes.length ?? 0
    console.log(`[A-94] Quellen atomar nachgezogen: ${changes} Manifestquelle(n); Dump unveraendert.`)
    return
  }
  fail('Aufruf: grunddaten-erneuern.ts snapshot|publish|rehash ...')
}

try {
  main()
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
}
