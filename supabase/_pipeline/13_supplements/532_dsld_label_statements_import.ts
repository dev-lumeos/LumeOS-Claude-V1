#!/usr/bin/env node
// C-532: DSLD Label Statements stay raw; this step does not interpret claims.
import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'

const script = 'supabase/_pipeline/13_supplements/532_dsld_label_statements_import.py'
const source = 'docs/ssot/daten/DSLD-full-database-XLSX'
const database = process.env.PGDATABASE ?? 'postgres'

if (!existsSync(script)) throw new Error(`C-532: Importhelfer fehlt: ${script}`)
if (!existsSync(source)) throw new Error(`C-532: DSLD-Quelle fehlt: ${source}`)

const result = spawnSync('python', [script, '--database', database, '--source', source], {
  cwd: process.cwd(),
  encoding: 'utf8',
  maxBuffer: 16 * 1024 * 1024,
  env: process.env,
})
if (result.stdout) process.stdout.write(result.stdout)
if (result.stderr) process.stderr.write(result.stderr)
if (result.status !== 0) throw new Error(`C-532: DSLD-Label-Import fehlgeschlagen (Exit ${result.status ?? 1})`)
