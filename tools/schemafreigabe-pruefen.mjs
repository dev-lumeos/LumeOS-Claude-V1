#!/usr/bin/env node
// Prueft, ob Supabase/PostgREST alle Schemata freigibt, die der
// Sollstand als Anwendungsschemata erwartet. PGRST106 faellt sonst erst
// in der Oberflaeche auf.
import fs from 'node:fs'

const configPath = process.argv[2] ?? 'supabase/config.toml'
const sollPath = process.argv[3] ?? 'supabase/_pipeline/daten/schema-sollstand.json'

function tomlSchemas(text) {
  const match = text.match(/^\s*schemas\s*=\s*\[([^\]]*)\]/m)
  if (!match) return null
  const values = []
  const re = /"([^"]+)"/g
  let m
  while ((m = re.exec(match[1])) !== null) values.push(m[1])
  return values
}

const configText = fs.readFileSync(configPath, 'utf8')
const configSchemas = tomlSchemas(configText)
if (!configSchemas) {
  console.error(`[schemafreigabe] FEHLER: keine schemas-Liste in ${configPath}`)
  process.exit(1)
}

const soll = JSON.parse(fs.readFileSync(sollPath, 'utf8'))
const defaults = new Set(['public', 'graphql_public'])
const expected = new Set(['nutrition'])

for (const row of soll.fremde_schemata ?? []) {
  if (row.schema) expected.add(row.schema)
}
for (const row of soll.fremde_funktionen ?? []) {
  if (row.schema) expected.add(row.schema)
}

const configured = new Set(configSchemas)
const missing = [...expected].filter(schema => !configured.has(schema)).sort()
const unexpected = [...configured]
  .filter(schema => !defaults.has(schema) && !expected.has(schema))
  .sort()

if (missing.length || unexpected.length) {
  console.error('[schemafreigabe] FEHLER: config.toml und schema-sollstand.json laufen auseinander')
  if (missing.length) {
    console.error(`  In config.toml fehlen: ${missing.join(', ')}`)
  }
  if (unexpected.length) {
    console.error(`  In config.toml freigegeben, aber nicht im Sollstand: ${unexpected.join(', ')}`)
  }
  process.exit(1)
}

console.log(`[schemafreigabe] ${configSchemas.length} config-Schemata geprueft; ${expected.size} Anwendungsschemata freigegeben.`)
