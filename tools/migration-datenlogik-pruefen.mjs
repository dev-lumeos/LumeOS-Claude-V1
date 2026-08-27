import fs from 'node:fs'
import path from 'node:path'

const migrationDir = path.resolve('supabase/migrations')
const baselineTriggerException = {
  file: '20260805120000_baseline_structure.sql',
  functionName: 'public.handle_new_user',
  command: 'INSERT',
  // Der Auth-Trigger legt beim Anlegen eines Auth-Users genau das zugehoerige
  // Profil an. Das ist Strukturverhalten, kein Katalog-Backfill.
  requiredSql: 'INSERT INTO public.profiles (id)',
}
const dataCommands = /\b(insert|update|copy|delete|truncate|merge)\b/gi

function ohneKommentareUndStrings(sql) {
  let out = ''
  for (let i = 0; i < sql.length;) {
    if (sql.startsWith('--', i)) {
      const end = sql.indexOf('\n', i)
      i = end === -1 ? sql.length : end
    } else if (sql.startsWith('/*', i)) {
      const end = sql.indexOf('*/', i + 2)
      i = end === -1 ? sql.length : end + 2
    } else if (sql[i] === "'") {
      i++
      while (i < sql.length) {
        if (sql[i] === "'" && sql[i + 1] === "'") i += 2
        else if (sql[i++] === "'") break
      }
      out += ' '
    } else if (sql[i] === '"') {
      i++
      while (i < sql.length) {
        if (sql[i] === '"' && sql[i + 1] === '"') i += 2
        else if (sql[i++] === '"') break
      }
      out += ' '
    } else if (sql[i] === '$') {
      const tag = sql.slice(i).match(/^\$[A-Za-z_0-9]*\$/)?.[0]
      if (tag) {
        const end = sql.indexOf(tag, i + tag.length)
        i = end === -1 ? sql.length : end + tag.length
        out += ' '
      } else out += sql[i++]
    } else out += sql[i++]
  }
  return out
}

function commandsInStatement(sql) {
  return ohneKommentareUndStrings(sql)
    .split(';')
    .flatMap((statement) => {
      const match = statement.match(/^\s*(?:with\b[\s\S]*?\b)?(insert|update|copy|delete|truncate|merge)\b/i)
      return match ? [match[1].toUpperCase()] : []
    })
}

function commandsInDollarBlocks(sql, file) {
  const blocks = []
  const pattern = /\$([A-Za-z_0-9]*)\$([\s\S]*?)\$\1\$/g
  for (const match of sql.matchAll(pattern)) {
    const body = match[2]
    const prefix = sql.slice(Math.max(0, (match.index ?? 0) - 500), match.index)
    const sanitizedBody = ohneKommentareUndStrings(body)
    const commands = [...sanitizedBody.matchAll(dataCommands)]
      .map((entry) => entry[1].toUpperCase())
    if (!commands.length) continue

    const isNamedBaselineException = file === baselineTriggerException.file &&
      new RegExp(`CREATE FUNCTION ${baselineTriggerException.functionName.replace('.', '\\.')}`, 'i').test(prefix) &&
      commands.length === 1 && commands[0] === baselineTriggerException.command &&
      sanitizedBody.includes(baselineTriggerException.requiredSql)
    if (!isNamedBaselineException) blocks.push(...commands)
  }
  return blocks
}

function findingsInFile(file, sql) {
  return [
    ...commandsInStatement(sql),
    ...commandsInDollarBlocks(sql, file),
  ].map((command) => `${file}: ${command}`)
}

function findingsInDirectory() {
  return fs.readdirSync(migrationDir)
    .filter((file) => file.endsWith('.sql'))
    .flatMap((file) => findingsInFile(file, fs.readFileSync(path.join(migrationDir, file), 'utf8')))
}

function selfTest() {
  const probes = [
    ['insert', 'INSERT INTO c291_probe VALUES (1);', 1],
    ['update', 'UPDATE c291_probe SET value = 1;', 1],
    ['copy', 'COPY c291_probe FROM STDIN;', 1],
    ['delete', 'DELETE FROM c291_probe;', 1],
    ['truncate', 'TRUNCATE c291_probe;', 1],
    ['merge', 'MERGE INTO c291_probe AS target USING c291_source AS source ON false WHEN NOT MATCHED THEN INSERT VALUES (1);', 1],
    ['do_insert', 'DO $$ BEGIN INSERT INTO c291_probe VALUES (1); END $$;', 1],
    ['alter', 'ALTER TABLE c291_probe ADD COLUMN c291_marker text;', 0],
  ]

  const existing = findingsInDirectory()
  if (existing.length) throw new Error(`Selbstprobe braucht zuerst saubere Migrationen: ${existing.join(', ')}`)

  for (const [name, sql, expected] of probes) {
    const file = `9999999999_c291_${name}.sql`
    const target = path.join(migrationDir, file)
    fs.writeFileSync(target, sql, { encoding: 'utf8', flag: 'wx' })
    try {
      const findings = findingsInDirectory().filter((finding) => finding.startsWith(`${file}:`))
      if (findings.length !== expected) {
        throw new Error(`${name}: ${findings.length} Meldungen, erwartet ${expected} (${findings.join(', ')})`)
      }
      console.log(`[migration-datenlogik] Selbstprobe ${name}: ${findings.length} Meldung(en)`)
    } finally {
      fs.unlinkSync(target)
    }
  }
  console.log('[migration-datenlogik] Selbstprobe erfolgreich; temporaere Migrationen entfernt.')
}

if (process.argv.includes('--self-test')) {
  selfTest()
  process.exit(0)
}

const findings = findingsInDirectory()
if (findings.length) {
  console.error('Migrationen duerfen keine Datenlogik enthalten:')
  for (const finding of findings) console.error(`- ${finding}`)
  process.exit(1)
}

console.log('Migrationen enthalten keine Datenlogik; benannte Ausnahme: 20260805120000_baseline_structure.sql public.handle_new_user().')
