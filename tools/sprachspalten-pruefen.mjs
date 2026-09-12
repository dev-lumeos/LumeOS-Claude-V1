import { execFileSync } from 'node:child_process'
import fs from 'node:fs'

const container = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const database = process.env.PGDATABASE ?? 'postgres'
const soll = JSON.parse(fs.readFileSync('supabase/_pipeline/daten/sprachspalten-sollstand.json', 'utf8'))
const ausnahmen = new Map(soll.ausnahmen.map(x => [`${x.schema}.${x.table}.${x.column}`, x.grund]))
const output = execFileSync('docker', [
  'exec', container, 'psql', '-X', '-q', '-U', 'postgres', '-d', database, '-t', '-A', '-F', '|', '-c', `
    SELECT d.table_schema, d.table_name, d.column_name,
      EXISTS (SELECT 1 FROM information_schema.columns x WHERE x.table_schema=d.table_schema AND x.table_name=d.table_name AND x.column_name=regexp_replace(d.column_name, '_de$', '_en')) AS has_en,
      EXISTS (SELECT 1 FROM information_schema.columns x WHERE x.table_schema=d.table_schema AND x.table_name=d.table_name AND x.column_name=regexp_replace(d.column_name, '_de$', '_th')) AS has_th
    FROM information_schema.columns d
    WHERE d.table_schema NOT IN ('pg_catalog', 'information_schema') AND d.column_name ~ '_de$'
    ORDER BY 1, 2, 3;
  `,
], { encoding: 'utf8' }).trim()
const rows = output ? output.split(/\r?\n/).map(line => {
  const [schema, table, column, hasEn, hasTh] = line.split('|')
  return { schema, table, column, hasEn: hasEn === 't', hasTh: hasTh === 't' }
}) : []
const missing = rows.filter(row => (!row.hasEn || !row.hasTh) && !ausnahmen.has(`${row.schema}.${row.table}.${row.column}`))
const stale = [...ausnahmen.keys()].filter(key => !rows.some(row => `${row.schema}.${row.table}.${row.column}` === key && (!row.hasEn || !row.hasTh)))
if (missing.length || stale.length) {
  console.error(`[sprachspalten] ROT: ${missing.length} unbegruendete Sprachluecke(n), ${stale.length} veraltete Ausnahme(n).`)
  for (const row of missing) console.error(`  ${row.schema}.${row.table}.${row.column}: ${row.hasEn ? '' : '_en fehlt '}${row.hasTh ? '' : '_th fehlt'}`.trim())
  for (const key of stale) console.error(`  veraltete Ausnahme: ${key}`)
  process.exit(1)
}
console.log(`[sprachspalten] gruen: ${rows.length} _de-Spalten, ${ausnahmen.size} begruendete interne Ausnahme(n).`)
