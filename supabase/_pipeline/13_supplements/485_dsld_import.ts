#!/usr/bin/env node
// C-485: DSLD stays in docs/ssot/daten; this numbered data step streams it
// through PostgreSQL COPY. No generated CSV is committed or retained.
import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import path from 'node:path'

const script = 'supabase/_pipeline/13_supplements/485_dsld_import.py'
const source = 'docs/ssot/daten/DSLD-full-database-XLSX'
const database = process.env.PGDATABASE ?? 'postgres'

if (!existsSync(script)) throw new Error(`C-485: Importhelfer fehlt: ${script}`)
if (!existsSync(source)) throw new Error(`C-485: DSLD-Quelle fehlt: ${source}`)

const result = spawnSync('python', [script, '--database', database, '--source', source], {
  cwd: process.cwd(),
  encoding: 'utf8',
  maxBuffer: 16 * 1024 * 1024,
  env: process.env,
})
if (result.stdout) process.stdout.write(result.stdout)
if (result.stderr) process.stderr.write(result.stderr)
if (result.status !== 0) throw new Error(`C-485: DSLD-Import fehlgeschlagen (Exit ${result.status ?? 1})`)

console.log(`C-485: DSLD-Import abgeschlossen (${path.basename(source)})`)
