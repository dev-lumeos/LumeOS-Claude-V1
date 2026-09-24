#!/usr/bin/env node
// A-50: eine Spalte faellt in der Kette -- zeigt noch ein Lesepfad darauf?
//
// `[read]` Ein `.select()` auf eine entfernte Spalte laesst jede Zeile
// scheitern. Tests und Kommentare sind keine Lesepfade; gesucht werden nur
// PostgREST-Zugriffsformen (`select`, Filter, Sortierung und jsonb).
//
// G-460: Der Waechter sucht die Zugriffsform, nie nur ein gleichnamiges Wort.
// G-490: Der Vertrag ist `schema.tabelle.spalte`, nie nur `spalte`: dieselbe
// Spalte kann in einer anderen Tabelle weiterhin korrekt bestehen.
//
// Aufruf:
//     node tools/gefallene-spalten-pruefen.mjs
//     node tools/gefallene-spalten-pruefen.mjs --liste
import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const WURZEL = process.cwd()
const NUR_LISTE = process.argv.includes('--liste')

function dateien(...muster) {
  const roh = execFileSync('git', ['ls-files', '--', ...muster],
    { cwd: WURZEL, encoding: 'utf8' })
  return roh.split('\n').map(z => z.trim()).filter(Boolean)
}

const lies = (rel) => {
  try {
    return fs.readFileSync(path.join(WURZEL, rel), 'utf8')
  } catch {
    return ''
  }
}

const IDENT = '(?:"[^"]+"|[A-Za-z_][A-Za-z0-9_$]*)'
const RX_ALTER_TABLE = new RegExp(
  `alter\\s+table\\s+(?:if\\s+exists\\s+)?(?:only\\s+)?(${IDENT}(?:\\s*\\.\\s*${IDENT})?)\\s+([\\s\\S]*?)(?=;)`,
  'gi',
)
const RX_DROP = new RegExp(
  `\\bdrop\\s+column\\s+(?:(?:if\\s+exists)\\s+)?(${IDENT})`,
  'gi',
)
const RX_ADD = new RegExp(
  `\\badd\\s+column\\s+(?:(?:if\\s+not\\s+exists)\\s+)?(${IDENT})`,
  'gi',
)

function unquote(identifier) {
  return identifier.trim().replace(/^"|"$/g, '').replace(/""/g, '"')
}

function relationName(raw) {
  const parts = raw.split('.').map(unquote)
  return (parts.length === 1 ? ['public', parts[0]] : parts).join('.').toLowerCase()
}

/**
 * Liest die letzte Spaltenaktion je **Relation und Spalte**.
 *
 * Die Reihenfolge bleibt Dateiname, dann Textposition. Damit gilt weiter:
 * ein Drop mit spaeterem Add in derselben Relation ist kein gefallener
 * Vertrag; ein Add derselben Spalte in einer anderen Relation aber auch
 * keine Wiederherstellung.
 */
export function findDroppedColumns(files) {
  /** `${relation}\0${column}` -> letzte Aktion */
  const state = new Map()

  for (const { file, sql } of files) {
    for (const statement of sql.matchAll(RX_ALTER_TABLE)) {
      const relation = relationName(statement[1])
      const ereignisse = []
      for (const drop of statement[2].matchAll(RX_DROP)) {
        ereignisse.push({
          pos: (statement.index ?? 0) + (drop.index ?? 0),
          action: 'drop',
          column: unquote(drop[1]).toLowerCase(),
        })
      }
      for (const add of statement[2].matchAll(RX_ADD)) {
        ereignisse.push({
          pos: (statement.index ?? 0) + (add.index ?? 0),
          action: 'add',
          column: unquote(add[1]).toLowerCase(),
        })
      }
      ereignisse.sort((a, b) => a.pos - b.pos)
      for (const event of ereignisse) {
        state.set(`${relation}\0${event.column}`, {
          ...event, relation, source: file,
        })
      }
    }
  }

  return [...state.values()]
    .filter(event => event.action === 'drop')
    .map(event => ({ relation: event.relation, column: event.column, source: event.source }))
    .sort((a, b) => a.relation.localeCompare(b.relation) || a.column.localeCompare(b.column))
}

function ohneKommentare(t) {
  return t
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^[ \t]*\/\/.*$/gm, '')
}

/** Formen, in denen ein Spaltenname eine Datenbankspalte meint. */
function spaltenzugriffe(name) {
  const n = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return [
    new RegExp("\\.select\\(\\s*[\\x60'\"][^\\x60'\"]*(?<![A-Za-z0-9_])" + n + "(?![A-Za-z0-9_])"),
    new RegExp("\\.(eq|neq|gt|gte|lt|lte|like|ilike|is|in|contains|order|filter|not)\\(\\s*[\\x60'\"]" + n + "[\\x60'\"]"),
    new RegExp("->>?\\s*[\\x60'\"]" + n + "[\\x60'\"]"),
  ]
}

function querySegments(source) {
  const segments = []
  const clean = ohneKommentare(source)
  const schemaAliases = new Map()
  const tableAliases = new Map()

  for (const match of clean.matchAll(new RegExp(
    `\\b(?:const|let|var)\\s+([A-Za-z_$][A-Za-z0-9_$]*)\\s*=\\s*[^;]*?\\.schema\\(\\s*['"](${IDENT})['"]\\s*\\)`,
    'g',
  ))) {
    schemaAliases.set(match[1], unquote(match[2]).toLowerCase())
  }

  const direct = new RegExp(
    `(?:\\.\\s*schema\\(\\s*['"](${IDENT})['"]\\s*\\)\\s*)?\\.\\s*from\\(\\s*['"](${IDENT}(?:\\.${IDENT})?)['"]\\s*\\)`,
    'g',
  )
  for (const match of clean.matchAll(direct)) {
    const rawTable = unquote(match[2])
    const relation = rawTable.includes('.')
      ? relationName(rawTable)
      : `${match[1] ? unquote(match[1]).toLowerCase() : 'public'}.${rawTable.toLowerCase()}`
    const start = match.index ?? 0
    const end = clean.indexOf(';', start)
    segments.push({ relation, source: clean.slice(start, end < 0 ? clean.length : end) })
  }

  for (const match of clean.matchAll(new RegExp(
    `\\b(?:const|let|var)\\s+([A-Za-z_$][A-Za-z0-9_$]*)\\s*=\\s*([\\s\\S]*?)\\.from\\(\\s*['"](${IDENT}(?:\\.${IDENT})?)['"]\\s*\\)`,
    'g',
  ))) {
    const tableAlias = match[1]
    const prefix = match[2]
    const rawTable = unquote(match[3])
    const directSchema = prefix.match(new RegExp(`\\.schema\\(\\s*['"](${IDENT})['"]\\s*\\)`))
    const schemaVariable = prefix.match(/([A-Za-z_$][A-Za-z0-9_$]*)\s*$/)
    const schema = directSchema
      ? unquote(directSchema[1]).toLowerCase()
      : schemaVariable ? schemaAliases.get(schemaVariable[1]) : undefined
    tableAliases.set(tableAlias, rawTable.includes('.')
      ? relationName(rawTable)
      : `${schema ?? 'public'}.${rawTable.toLowerCase()}`)
  }

  for (const [alias, relation] of tableAliases) {
    const call = new RegExp(`\\b${alias}\\s*\\.[A-Za-z_$][A-Za-z0-9_$]*\\s*\\(`, 'g')
    for (const match of clean.matchAll(call)) {
      const start = match.index ?? 0
      const end = clean.indexOf(';', start)
      segments.push({ relation, source: clean.slice(start, end < 0 ? clean.length : end) })
    }
  }

  return segments
}

/** Findet nur Datenbankzugriffe auf die konkrete gefallene Relation. */
export function findLiveReads(dropped, files) {
  const findings = []
  for (const { file, source } of files) {
    for (const segment of querySegments(source)) {
      for (const field of dropped) {
        if (field.relation !== segment.relation) continue
        if (spaltenzugriffe(field.column).some(rx => rx.test(segment.source))) {
          findings.push({
            column: field.column,
            source: field.source,
            file,
            relation: field.relation,
          })
        }
      }
    }
  }
  return findings.sort((a, b) => a.file.localeCompare(b.file)
    || a.relation.localeCompare(b.relation) || a.column.localeCompare(b.column))
}

function main() {
  const sql = dateien('supabase/**/*.sql', 'supabase/**/*.ts').sort()
  const gefallen = findDroppedColumns(sql.map(file => ({ file, sql: lies(file) })))
  const code = dateien('apps/**/*.ts', 'apps/**/*.tsx', 'packages/**/*.ts',
    'packages/**/*.tsx')
    .filter(p => !/(^|\/)__tests__\//.test(p) && !/\.test\.tsx?$/.test(p))
  const funde = findLiveReads(gefallen, code.map(file => ({ file, source: lies(file) })))

  if (NUR_LISTE) {
    console.log(`[gefallene-spalten] ${gefallen.length} gefallene Relation-Spalten:`)
    for (const g of gefallen) {
      const count = funde.filter(f => f.relation === g.relation && f.column === g.column).length
      console.log(`  ${count ? 'GELESEN ' : 'still   '} ${`${g.relation}.${g.column}`.padEnd(54)} ${g.source}`)
    }
    return
  }

  if (funde.length) {
    console.error('[gefallene-spalten] FEHLER: '
      + `${funde.length} Lesestelle(n) zeigen auf eine gefallene Relation-Spalte.`)
    for (const f of funde) {
      console.error(`  ${f.file}`)
      console.error(`      liest \`${f.relation}.${f.column}\` -- geworfen in ${f.source}`)
    }
    console.error('')
    console.error('  Ein `.select()` auf eine fehlende Spalte laesst JEDE Zeile')
    console.error('  scheitern -- die Kachel faellt still auf den Entwurf zurueck')
    console.error('  (gemessen in G-160: `acwr_used` nach C-215).')
    process.exitCode = 1
    return
  }

  console.log(`[gefallene-spalten] ${gefallen.length} gefallene Relation-Spalten geprueft, `
    + `${code.length} Codedateien -- kein lebender Lesepfad darauf.`)
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main()
}
