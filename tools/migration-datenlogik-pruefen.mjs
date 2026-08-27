import fs from 'node:fs'
import path from 'node:path'

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

function datenbefehle(sql) {
  return ohneKommentareUndStrings(sql)
    .split(';')
    .flatMap((statement) => {
      const match = statement.match(/^\s*(?:with\b[\s\S]*?\b)?(insert|update|copy)\b/i)
      return match ? [match[1].toUpperCase()] : []
    })
}

const migrationDir = path.resolve('supabase/migrations')
const findings = fs.readdirSync(migrationDir)
  .filter((file) => file.endsWith('.sql'))
  .flatMap((file) => datenbefehle(fs.readFileSync(path.join(migrationDir, file), 'utf8'))
    .map((command) => `${file}: ${command}`))

if (process.argv.includes('--negative')) {
  findings.push(...datenbefehle('INSERT INTO example VALUES (1)').map((command) => `negative-fixture.sql: ${command}`))
}

if (findings.length) {
  console.error('Migrationen duerfen keine Datenlogik enthalten:')
  for (const finding of findings) console.error(`- ${finding}`)
  process.exit(1)
}

console.log('Migrationen enthalten keine INSERT-, UPDATE- oder COPY-Statements.')
