import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'

const script = 'supabase/_pipeline/13_supplements/512_dsld_serving_size_backfill.py'
const source = 'docs/ssot/daten/DSLD-full-database-XLSX'
const database = process.env.PGDATABASE ?? 'postgres'

if (!existsSync(script) || !existsSync(source)) throw new Error('C-512: DSLD-Quelle oder Backfill-Helfer fehlt')
const result = spawnSync('python', [script, '--database', database, '--source', source], {
  cwd: process.cwd(), encoding: 'utf8', maxBuffer: 4 * 1024 * 1024, env: process.env,
})
if (result.stdout) process.stdout.write(result.stdout)
if (result.stderr) process.stderr.write(result.stderr)
if (result.status !== 0) throw new Error(`C-512: Serving-Size-Backfill fehlgeschlagen (Exit ${result.status ?? 1})`)
