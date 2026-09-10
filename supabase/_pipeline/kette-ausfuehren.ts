#!/usr/bin/env node
// C-43: Fuehrt die lokale Supabase-Aufbaukette aus supabase/_pipeline/kette.json
// gegen eine Wegwerf-Datenbank aus.
//
// Absichtlich schlicht: keine Parallelisierung, keine Resume-Logik. Die Kette
// bricht beim ersten Fehler ab und faehrt danach die Abschlusspruefung.
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

type PipelineStep = {
  id: string
  path: string
  kind: 'sql' | 'tsx'
  creates: string
  depends_on: string[]
}

type PipelineManifest = {
  name: string
  version: number
  steps: PipelineStep[]
}

const ROOT = process.cwd()
const CONTAINER = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const ADMIN_DB = 'postgres'
const DEFAULT_MANIFEST = 'supabase/_pipeline/kette.json'
const CHECK_SCRIPT = 'supabase/_pipeline/_validierung/schema-vollstaendigkeit-pruefen.ts'

type Args = {
  manifest: string
  database: string
  keepDatabase: boolean
}

function fail(message: string): never {
  console.error(message)
  process.exit(1)
}

function parseArgs(): Args {
  const args = process.argv.slice(2)
  let manifest = DEFAULT_MANIFEST
  let database = `lumeos_kette_${new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14)}`
  let keepDatabase = false

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    if (arg === '--manifest') {
      manifest = args[++i] ?? fail('--manifest braucht einen Pfad')
    } else if (arg === '--database') {
      database = args[++i] ?? fail('--database braucht einen Namen')
    } else if (arg === '--keep-database') {
      keepDatabase = true
    } else {
      fail(`Unbekanntes Argument: ${arg}`)
    }
  }

  if (database === ADMIN_DB) {
    fail('Abbruch: postgres ist die laufende Datenbank. Dieser Ausfuehrer nutzt nur Wegwerf-Datenbanken.')
  }
  if (!/^[a-z][a-z0-9_]*$/i.test(database)) {
    fail(`Ungueltiger Datenbankname: ${database}`)
  }

  return { manifest, database, keepDatabase }
}

function run(command: string, args: string[], options: {
  input?: string
  env?: NodeJS.ProcessEnv
  stdio?: 'pipe' | 'inherit'
} = {}) {
  const useShell = process.platform === 'win32' && command === 'pnpm'
  const result = spawnSync(command, args, {
    cwd: ROOT,
    input: options.input,
    env: options.env ?? process.env,
    encoding: 'utf8',
    maxBuffer: 512 * 1024 * 1024,
    shell: useShell,
    stdio: options.stdio,
  })

  if (result.stdout) process.stdout.write(result.stdout)
  if (result.stderr) process.stderr.write(result.stderr)

  if (result.status !== 0) {
    const code = result.status ?? 1
    const detail = result.error ? `: ${result.error.message}` : ''
    throw new Error(`${command} ${args.join(' ')} schlug fehl (Exit ${code})${detail}`)
  }
}

function runCapture(command: string, args: string[]): string {
  const result = spawnSync(command, args, {
    cwd: ROOT,
    encoding: 'utf8',
    maxBuffer: 512 * 1024 * 1024,
  })
  if (result.stderr) process.stderr.write(result.stderr)
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(' ')} schlug fehl (Exit ${result.status ?? 1})`)
  }
  return result.stdout
}

function sql(db: string, text: string): void {
  run('docker', [
    'exec', '-i', CONTAINER,
    'psql', '-U', 'postgres', '-d', db,
    '-v', 'ON_ERROR_STOP=1',
    '-f', '-',
  ], { input: text })
}

function sqlCommand(db: string, text: string): void {
  run('docker', [
    'exec', CONTAINER,
    'psql', '-U', 'postgres', '-d', db,
    '-v', 'ON_ERROR_STOP=1',
    '-c', text,
  ])
}

function quoteIdent(identifier: string): string {
  return `"${identifier.replace(/"/g, '""')}"`
}

function readManifest(file: string): PipelineManifest {
  const manifest = JSON.parse(fs.readFileSync(file, 'utf8')) as PipelineManifest
  const ids = new Set<string>()
  for (const step of manifest.steps) {
    if (ids.has(step.id)) fail(`${file}: doppelte Schritt-ID ${step.id}`)
    ids.add(step.id)
    if (step.kind !== 'sql' && step.kind !== 'tsx') fail(`${file}: ${step.id} hat ungueltige Art ${step.kind}`)
    if (!fs.existsSync(step.path)) fail(`${file}: ${step.id} verweist auf fehlenden Pfad ${step.path}`)
  }
  for (const step of manifest.steps) {
    for (const dep of step.depends_on) {
      if (dep === 'auth_stub') continue
      if (!ids.has(dep)) fail(`${file}: ${step.id} haengt von unbekanntem Schritt ${dep} ab`)
      const depIndex = manifest.steps.findIndex(s => s.id === dep)
      const stepIndex = manifest.steps.findIndex(s => s.id === step.id)
      if (depIndex > stepIndex) fail(`${file}: ${step.id} steht vor seiner Abhaengigkeit ${dep}`)
    }
  }
  return manifest
}

function backupLiveSchema(): string {
  fs.mkdirSync('backup/schema', { recursive: true })
  const stamp = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14)
  const target = path.join('backup', 'schema', `${stamp}_c43_vor_kettenlauf.sql`)
  const dump = runCapture('docker', [
    'exec', CONTAINER,
    'pg_dump', '-U', 'postgres', '-d', ADMIN_DB, '--schema-only',
  ])
  fs.writeFileSync(target, dump, 'utf8')
  return target
}

function createDatabase(db: string): void {
  sqlCommand(ADMIN_DB, `DROP DATABASE IF EXISTS ${quoteIdent(db)};`)
  sqlCommand(ADMIN_DB, `CREATE DATABASE ${quoteIdent(db)};`)
}

function dropDatabase(db: string): void {
  sqlCommand(ADMIN_DB, `
    SELECT pg_terminate_backend(pid)
    FROM pg_stat_activity
    WHERE datname = '${db.replace(/'/g, "''")}'
      AND usename = current_user;
  `)
  sqlCommand(ADMIN_DB, `DROP DATABASE IF EXISTS ${quoteIdent(db)};`)
}

function installAuthStub(db: string): void {
  sql(db, `
    CREATE SCHEMA IF NOT EXISTS auth;
    CREATE TABLE IF NOT EXISTS auth.users (
      id uuid PRIMARY KEY,
      email text,
      raw_app_meta_data jsonb DEFAULT '{}'::jsonb,
      created_at timestamptz DEFAULT now()
    );
    CREATE OR REPLACE FUNCTION auth.uid()
    RETURNS uuid
    LANGUAGE sql
    STABLE
    AS $$
      SELECT nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
    $$;
    GRANT USAGE ON SCHEMA auth TO authenticated, service_role;
    GRANT EXECUTE ON FUNCTION auth.uid() TO authenticated, service_role;
  `)
}

// C-429: Storage ist im lokalen Supabase-Dienst an die laufende Datenbank
// gebunden. Wegwerf-Datenbanken brauchen daher nur fuer Schema-, RLS- und
// Referenztests das kleine Metadaten-Gegenstueck; es speichert keine Bytes.
function installStorageStub(db: string): void {
  sql(db, `
    CREATE SCHEMA IF NOT EXISTS storage;
    CREATE TABLE IF NOT EXISTS storage.buckets (
      id text PRIMARY KEY,
      name text NOT NULL UNIQUE,
      public boolean NOT NULL DEFAULT false,
      file_size_limit bigint,
      allowed_mime_types text[]
    );
    CREATE TABLE IF NOT EXISTS storage.objects (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      bucket_id text NOT NULL REFERENCES storage.buckets(id) ON DELETE CASCADE,
      name text NOT NULL,
      owner_id text,
      metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now(),
      UNIQUE (bucket_id, name)
    );
    CREATE OR REPLACE FUNCTION storage.foldername(p_name text)
    RETURNS text[]
    LANGUAGE sql
    IMMUTABLE
    AS $$ SELECT string_to_array(p_name, '/') $$;
    GRANT USAGE ON SCHEMA storage TO authenticated, service_role;
    GRANT SELECT, INSERT, UPDATE, DELETE ON storage.objects TO authenticated;
    GRANT ALL ON storage.buckets, storage.objects TO service_role;
    ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;
    ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
  `)
}

function extractZip(zipFile: string): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'lumeos-kette-'))
  run('tar', ['-xf', path.resolve(zipFile), '-C', dir])
  return dir
}

function prepareImportFiles(): void {
  const blsDir = extractZip('supabase/_data/bls_4_0_local_import.zip')
  const fatDir = extractZip('supabase/_data/bls_4_0_fettsaeuren.zip')

  run('docker', ['exec', CONTAINER, 'sh', '-lc',
    'mkdir -p /tmp/p1-005-bls-local-import /tmp/bls-fettsaeuren'])
  run('docker', ['cp', path.join(blsDir, 'foods.csv'), `${CONTAINER}:/tmp/p1-005-bls-local-import/foods.csv`])
  run('docker', ['cp', path.join(blsDir, 'food_nutrients.csv'), `${CONTAINER}:/tmp/p1-005-bls-local-import/food_nutrients.csv`])
  run('docker', ['cp', path.join(fatDir, 'fehlende_fettsaeuren.csv'), `${CONTAINER}:/tmp/bls-fettsaeuren/fehlende_fettsaeuren.csv`])
}

function runStep(db: string, step: PipelineStep): void {
  if (step.kind === 'sql') {
    const text = fs.readFileSync(step.path, 'utf8')
    sql(db, text)
    return
  }

  run('pnpm', ['exec', 'tsx', step.path], {
    env: {
      ...process.env,
      PGDATABASE: db,
      LUMEOS_DB_CONTAINER: CONTAINER,
    },
  })
}

function runFinalCheck(db: string): void {
  run('pnpm', ['exec', 'tsx', CHECK_SCRIPT], {
    env: {
      ...process.env,
      PGDATABASE: db,
      LUMEOS_DB_CONTAINER: CONTAINER,
    },
    stdio: 'inherit',
  })
}

const started = Date.now()
const args = parseArgs()
const manifest = readManifest(args.manifest)
let created = false
let success = false

console.log(`Kette: ${args.manifest} (${manifest.steps.length} Schritte)`)
console.log(`Datenbank: ${args.database}`)

try {
  const backup = backupLiveSchema()
  console.log(`Schema-Backup: ${backup}`)
  createDatabase(args.database)
  created = true
  installAuthStub(args.database)
  installStorageStub(args.database)
  prepareImportFiles()

  for (const step of manifest.steps) {
    const t0 = Date.now()
    console.log(`\n== ${step.id} ${step.path}`)
    runStep(args.database, step)
    console.log(`OK ${step.id}: ${((Date.now() - t0) / 1000).toFixed(1)}s`)
  }

  console.log('\n== Abschlusspruefung')
  runFinalCheck(args.database)
  success = true
  console.log(`\nKETTE OK: ${((Date.now() - started) / 1000).toFixed(1)}s`)
} catch (error) {
  console.error('\nKETTE FEHLGESCHLAGEN')
  console.error(error instanceof Error ? error.message : String(error))
  if (created) {
    console.error(`Wegwerf-Datenbank bleibt zur Pruefung erhalten: ${args.database}`)
  }
  process.exitCode = 1
} finally {
  if (success && !args.keepDatabase) {
    dropDatabase(args.database)
    console.log(`Wegwerf-Datenbank geloescht: ${args.database}`)
  } else if (success && args.keepDatabase) {
    console.log(`Wegwerf-Datenbank behalten: ${args.database}`)
  }
}
