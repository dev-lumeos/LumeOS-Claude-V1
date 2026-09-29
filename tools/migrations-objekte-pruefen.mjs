#!/usr/bin/env node
// C-554: Das Migrationsregister ist Buchhaltung, kein Strukturbeweis.
// Dieses Werkzeug liest ausschliesslich DDL-Klauseln aus Migrationsdateien
// und misst die genannten Objekte gegen die ausgewaehlte Datenbank.
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const MIGRATIONS = path.join(ROOT, 'supabase', 'migrations')
const CONTAINER = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'

const IDENT = String.raw`(?:"(?:[^"]|"")*"|[A-Za-z_][A-Za-z0-9_$]*)`
const QNAME = String.raw`${IDENT}(?:\s*\.\s*${IDENT})?`

function unquoteIdentifier(value) {
  const trimmed = value.trim()
  if (trimmed.startsWith('"')) return trimmed.slice(1, -1).replace(/""/g, '"')
  return trimmed.toLowerCase()
}

function qualifiedName(value) {
  const parts = value.match(new RegExp(IDENT, 'g'))?.map(unquoteIdentifier) ?? []
  if (parts.length !== 2) {
    throw new Error(`C-554: persistentes Objekt ohne explizites Schema: ${value.trim()}`)
  }
  return { schema: parts[0], name: parts[1] }
}

function splitTopLevelStatements(sql) {
  const statements = []
  let start = 0
  let index = 0
  let state = 'normal'
  let dollarTag = ''
  let blockDepth = 0

  while (index < sql.length) {
    const here = sql.slice(index)
    if (state === 'normal') {
      if (here.startsWith('--')) {
        state = 'line_comment'
        index += 2
        continue
      }
      if (here.startsWith('/*')) {
        state = 'block_comment'
        blockDepth = 1
        index += 2
        continue
      }
      if (sql[index] === "'") {
        state = 'single_quote'
        index += 1
        continue
      }
      if (sql[index] === '"') {
        state = 'double_quote'
        index += 1
        continue
      }
      const dollar = here.match(/^\$[A-Za-z_][A-Za-z0-9_]*\$|^\$\$/)?.[0]
      if (dollar) {
        state = 'dollar_quote'
        dollarTag = dollar
        index += dollar.length
        continue
      }
      if (sql[index] === ';') {
        statements.push(sql.slice(start, index + 1))
        start = index + 1
      }
      index += 1
      continue
    }

    if (state === 'line_comment') {
      if (sql[index] === '\n') state = 'normal'
      index += 1
      continue
    }
    if (state === 'block_comment') {
      if (here.startsWith('/*')) {
        blockDepth += 1
        index += 2
      } else if (here.startsWith('*/')) {
        blockDepth -= 1
        index += 2
        if (blockDepth === 0) state = 'normal'
      } else index += 1
      continue
    }
    if (state === 'single_quote') {
      if (here.startsWith("''")) index += 2
      else if (sql[index] === "'") {
        state = 'normal'
        index += 1
      } else index += 1
      continue
    }
    if (state === 'double_quote') {
      if (here.startsWith('""')) index += 2
      else if (sql[index] === '"') {
        state = 'normal'
        index += 1
      } else index += 1
      continue
    }
    if (state === 'dollar_quote') {
      if (here.startsWith(dollarTag)) {
        state = 'normal'
        index += dollarTag.length
      } else index += 1
    }
  }

  if (sql.slice(start).trim()) statements.push(sql.slice(start))
  return statements
}

function stripLeadingComments(statement) {
  return statement.replace(/^(?:\s|--[^\n]*(?:\n|$)|\/\*[\s\S]*?\*\/)+/, '')
}

function maskCommentsAndStrings(sql) {
  let result = ''
  let index = 0
  let state = 'normal'
  let blockDepth = 0
  while (index < sql.length) {
    const here = sql.slice(index)
    if (state === 'normal') {
      if (here.startsWith('--')) {
        state = 'line_comment'
        result += '  '
        index += 2
      } else if (here.startsWith('/*')) {
        state = 'block_comment'
        blockDepth = 1
        result += '  '
        index += 2
      } else if (sql[index] === "'") {
        state = 'single_quote'
        result += ' '
        index += 1
      } else {
        result += sql[index]
        index += 1
      }
      continue
    }
    if (state === 'line_comment') {
      if (sql[index] === '\n') {
        state = 'normal'
        result += '\n'
      } else result += ' '
      index += 1
      continue
    }
    if (state === 'block_comment') {
      if (here.startsWith('/*')) {
        blockDepth += 1
        result += '  '
        index += 2
      } else if (here.startsWith('*/')) {
        blockDepth -= 1
        result += '  '
        index += 2
        if (blockDepth === 0) state = 'normal'
      } else {
        result += sql[index] === '\n' ? '\n' : ' '
        index += 1
      }
      continue
    }
    if (state === 'single_quote') {
      if (here.startsWith("''")) {
        result += '  '
        index += 2
      } else if (sql[index] === "'") {
        state = 'normal'
        result += ' '
        index += 1
      } else {
        result += sql[index] === '\n' ? '\n' : ' '
        index += 1
      }
    }
  }
  return result
}

function dollarBody(statement) {
  const opening = statement.match(/\$[A-Za-z_][A-Za-z0-9_]*\$|\$\$/)
  if (!opening || opening.index === undefined) return ''
  const start = opening.index + opening[0].length
  const end = statement.lastIndexOf(opening[0])
  return end >= start ? statement.slice(start, end) : ''
}

function extractAlterColumns(sql) {
  const clean = maskCommentsAndStrings(sql)
  const objects = []
  const alter = new RegExp(
    String.raw`\bALTER\s+TABLE\s+(?:IF\s+EXISTS\s+)?(?:ONLY\s+)?(${QNAME})\s+([\s\S]*?)(?=;|$)`,
    'gi',
  )
  for (const match of clean.matchAll(alter)) {
    const relation = qualifiedName(match[1])
    const actions = match[2]
    const addColumn = new RegExp(
      String.raw`(?:^|,)\s*ADD\s+(?:COLUMN\s+)?(?:IF\s+NOT\s+EXISTS\s+)?(${IDENT})(?=\s|,|$)`,
      'gi',
    )
    for (const add of actions.matchAll(addColumn)) {
      const column = unquoteIdentifier(add[1])
      if (['constraint', 'primary', 'foreign', 'unique', 'check'].includes(column)) continue
      objects.push({ kind: 'column', ...relation, column })
    }
  }
  return objects
}

export function extractCreatedObjects(sql) {
  const objects = []
  for (const rawStatement of splitTopLevelStatements(sql)) {
    const statement = stripLeadingComments(rawStatement)
    const create = statement.match(new RegExp(
      String.raw`^CREATE\s+(?:OR\s+REPLACE\s+)?(MATERIALIZED\s+VIEW|TABLE|VIEW|FUNCTION|TYPE)\s+(?:IF\s+NOT\s+EXISTS\s+)?(${QNAME})`,
      'i',
    ))
    if (create) {
      const kind = create[1].toLowerCase().replace(/\s+/g, '_')
      objects.push({ kind, ...qualifiedName(create[2]) })
    }

    if (/^ALTER\s+TABLE\b/i.test(statement)) {
      objects.push(...extractAlterColumns(statement))
    } else if (/^DO\s+/i.test(statement)) {
      objects.push(...extractAlterColumns(dollarBody(statement)))
    }
  }

  const seen = new Set()
  return objects.filter(object => {
    const key = [object.kind, object.schema, object.name, object.column ?? ''].join('\u0000')
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function sqlLiteral(value) {
  return `'${String(value).replace(/'/g, "''")}'`
}

export function parsePsqlBoolean(value) {
  return value === 't' || value === 'true'
}

export function buildExistenceSql(objects) {
  const values = objects.map((object, index) => `(${index}, ${sqlLiteral(object.kind)}, `
    + `${sqlLiteral(object.schema)}, ${sqlLiteral(object.name)}, `
    + `${object.column ? sqlLiteral(object.column) : 'NULL'})`).join(',\n')
  return `
    WITH objects(ord, kind, schema_name, object_name, column_name) AS (
      VALUES ${values}
    )
    SELECT o.ord || E'\\t' || CASE o.kind
      WHEN 'table' THEN EXISTS (
        SELECT 1 FROM information_schema.tables t
        WHERE t.table_schema = o.schema_name AND t.table_name = o.object_name
          AND t.table_type = 'BASE TABLE'
      )
      WHEN 'view' THEN EXISTS (
        SELECT 1 FROM information_schema.views v
        WHERE v.table_schema = o.schema_name AND v.table_name = o.object_name
      )
      WHEN 'materialized_view' THEN EXISTS (
        SELECT 1 FROM pg_catalog.pg_matviews v
        WHERE v.schemaname = o.schema_name AND v.matviewname = o.object_name
      )
      WHEN 'function' THEN EXISTS (
        SELECT 1 FROM information_schema.routines r
        WHERE r.routine_schema = o.schema_name AND r.routine_name = o.object_name
          AND r.routine_type = 'FUNCTION'
      )
      WHEN 'type' THEN EXISTS (
        SELECT 1 FROM information_schema.user_defined_types t
        WHERE t.user_defined_type_schema = o.schema_name
          AND t.user_defined_type_name = o.object_name
      )
      WHEN 'column' THEN EXISTS (
        SELECT 1 FROM information_schema.columns c
        WHERE c.table_schema = o.schema_name AND c.table_name = o.object_name
          AND c.column_name = o.column_name
      )
      ELSE false
    END
    FROM objects o ORDER BY o.ord;
  `
}

function queryExistence(objects, database) {
  if (objects.length === 0) return []
  const sql = buildExistenceSql(objects)
  const output = execFileSync('docker', [
    'exec', CONTAINER, 'psql', '-X', '-q', '-v', 'ON_ERROR_STOP=1',
    '-U', 'postgres', '-d', database, '-At', '-c', sql,
  ], { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
  const result = Array(objects.length).fill(false)
  for (const line of output.trim().split(/\r?\n/).filter(Boolean)) {
    const [index, exists] = line.split('\t')
    result[Number(index)] = parsePsqlBoolean(exists)
  }
  return result
}

function liveVersions(database) {
  const output = execFileSync('docker', [
    'exec', CONTAINER, 'psql', '-X', '-q', '-v', 'ON_ERROR_STOP=1',
    '-U', 'postgres', '-d', database, '-At', '-c',
    'SELECT version FROM supabase_migrations.schema_migrations ORDER BY version;',
  ], { cwd: ROOT, encoding: 'utf8' })
  return new Set(output.split(/\r?\n/).filter(Boolean))
}

function parseArgs(argv) {
  const result = { database: 'postgres', files: [], includeRegistered: false }
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]
    if (arg === '--database') result.database = argv[++index]
    else if (arg === '--file') result.files.push(argv[++index])
    else if (arg === '--include-registered') result.includeRegistered = true
    else throw new Error(`Unbekannter Parameter: ${arg}`)
  }
  if (!result.database || result.files.some(file => !file)) {
    throw new Error('--database und --file brauchen jeweils einen Wert')
  }
  return result
}

function objectLabel(object) {
  const base = `${object.kind} ${object.schema}.${object.name}`
  return object.kind === 'column' ? `${base}.${object.column}` : base
}

function run() {
  const args = parseArgs(process.argv.slice(2))
  let files
  if (args.files.length > 0) {
    files = args.files.map(file => path.resolve(ROOT, file))
  } else {
    const registered = args.includeRegistered ? new Set() : liveVersions(args.database)
    files = fs.readdirSync(MIGRATIONS)
      .filter(name => name.endsWith('.sql'))
      .sort()
      .filter(name => args.includeRegistered || !registered.has(name.match(/^(\d+)_/)?.[1]))
      .map(name => path.join(MIGRATIONS, name))
  }

  const measuredFiles = files.map(file => ({
    file,
    objects: extractCreatedObjects(fs.readFileSync(file, 'utf8')),
  }))
  const allObjects = measuredFiles.flatMap(entry => entry.objects)
  const allExists = queryExistence(allObjects, args.database)
  let objectIndex = 0
  const rows = []
  for (const entry of measuredFiles) {
    if (entry.objects.length === 0) {
      rows.push({ file: path.basename(entry.file), object: '(kein CREATE/ADD-Objekt)', status: '-' })
    } else {
      entry.objects.forEach(object => {
        rows.push({
          file: path.basename(entry.file),
          object: objectLabel(object),
          status: allExists[objectIndex] ? 'da' : 'fehlt',
        })
        objectIndex += 1
      })
    }
  }

  console.log('Datei | Objekt | Zustand')
  console.log('--- | --- | ---')
  for (const row of rows) console.log(`${row.file} | ${row.object} | ${row.status}`)
  console.log('\nDatei | da | fehlt')
  console.log('--- | ---: | ---:')
  let totalPresent = 0
  let totalMissing = 0
  for (const file of files) {
    const own = rows.filter(row => row.file === path.basename(file))
    const present = own.filter(row => row.status === 'da').length
    const missing = own.filter(row => row.status === 'fehlt').length
    totalPresent += present
    totalMissing += missing
    console.log(`${path.basename(file)} | ${present} | ${missing}`)
  }
  console.log(`GESAMT ${files.length} Dateien | ${totalPresent} | ${totalMissing}`)
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) run()
