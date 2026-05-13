import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

export const DEFAULT_SOURCE_PATH = 'docs/specs/Nutrition/01_current_specs/SPEC_06_DATABASE_SCHEMA.md'
export const DEFAULT_OUTPUT_PATH = 'docs/project/p1-005/P1-005-nutrient-defs-seed-candidate.md'

export const NUTRIENT_DEFS_SEED_COLUMNS = [
  'code',
  'name_de',
  'name_en',
  'name_th',
  'unit',
  'group_de',
  'group_en',
  'group_th',
  'sort_index',
  'display_tier',
  'is_always_computed',
  'is_partly_computed',
  'formula',
  'rda_male',
  'rda_female',
  'rda_unit',
] as const

export type NutrientDefsSeedColumn = typeof NUTRIENT_DEFS_SEED_COLUMNS[number]

export interface NutrientDefsSeedRow extends Record<NutrientDefsSeedColumn, string | number | boolean | null> {
  code: string
  name_de: string
  name_en: string
  name_th: string
  unit: string
  group_de: string
  group_en: string
  group_th: string
  sort_index: number
  display_tier: number
  is_always_computed: boolean
  is_partly_computed: boolean
  formula: string | null
  rda_male: string
  rda_female: string
  rda_unit: string
  source_ref: string
  rda_source_ref: string
}

export interface NutrientDefsSeedCandidate {
  columns: readonly NutrientDefsSeedColumn[]
  rows: NutrientDefsSeedRow[]
  expectedRowCount: number
  sourcePath: string
  seedSourceRef: string
  rdaSourceRef: string
  rdaUpdateCount: number
}

export interface ValidationResult {
  valid: boolean
  errors: string[]
}

interface SourceRange {
  startLine: number
  endLine: number
}

interface ParsedRda {
  rda_male: string
  rda_female: string
  rda_unit: string
}

function lineNumberAtOffset(source: string, offset: number): number {
  return source.slice(0, offset).split(/\r?\n/).length
}

function findSeedRange(source: string): SourceRange {
  const headingIndex = source.indexOf('### Seed-Daten: nutrient_defs')
  if (headingIndex === -1) throw new Error('nutrient_defs seed heading not found')
  const insertIndex = source.indexOf('INSERT INTO nutrition.nutrient_defs', headingIndex)
  if (insertIndex === -1) throw new Error('nutrient_defs INSERT block not found')
  const afterInsert = source.slice(insertIndex)
  const endMatch = /\n```\s*\r?\n/.exec(afterInsert)
  if (!endMatch) throw new Error('nutrient_defs INSERT code fence end not found')
  const endOffset = insertIndex + endMatch.index
  return {
    startLine: lineNumberAtOffset(source, headingIndex),
    endLine: lineNumberAtOffset(source, endOffset),
  }
}

function findRdaRange(source: string): SourceRange {
  const firstUpdate = source.indexOf('UPDATE nutrition.nutrient_defs SET rda_male=')
  if (firstUpdate === -1) {
    return { startLine: 0, endLine: 0 }
  }
  const afterFirst = source.slice(firstUpdate)
  const endMatch = /\n```\s*\r?\n/.exec(afterFirst)
  if (!endMatch) throw new Error('nutrient_defs RDA code fence end not found')
  const endOffset = firstUpdate + endMatch.index
  return {
    startLine: lineNumberAtOffset(source, firstUpdate),
    endLine: lineNumberAtOffset(source, endOffset),
  }
}

function extractValuesRegion(source: string): string {
  const insertIndex = source.indexOf('INSERT INTO nutrition.nutrient_defs')
  if (insertIndex === -1) throw new Error('nutrient_defs INSERT block not found')
  const valuesIndex = source.indexOf(') VALUES', insertIndex)
  if (valuesIndex === -1) throw new Error('nutrient_defs VALUES marker not found')

  let inQuote = false
  for (let i = valuesIndex + ') VALUES'.length; i < source.length; i += 1) {
    const ch = source[i]
    const next = source[i + 1]
    if (inQuote) {
      if (ch === '\'' && next === '\'') {
        i += 1
      } else if (ch === '\'') {
        inQuote = false
      }
      continue
    }
    if (ch === '\'') {
      inQuote = true
      continue
    }
    if (ch === ';') {
      return source.slice(valuesIndex + ') VALUES'.length, i)
    }
  }

  throw new Error('nutrient_defs VALUES terminator not found')
}

function tupleBodies(valuesRegion: string): string[] {
  const tuples: string[] = []
  let inQuote = false
  let depth = 0
  let start = -1
  for (let i = 0; i < valuesRegion.length; i += 1) {
    const ch = valuesRegion[i]
    const next = valuesRegion[i + 1]
    if (inQuote) {
      if (ch === '\'' && next === '\'') {
        i += 1
      } else if (ch === '\'') {
        inQuote = false
      }
      continue
    }
    if (ch === '-' && next === '-') {
      while (i < valuesRegion.length && valuesRegion[i] !== '\n') i += 1
      continue
    }
    if (ch === '\'') {
      inQuote = true
      continue
    }
    if (ch === '(') {
      if (depth === 0) start = i + 1
      depth += 1
      continue
    }
    if (ch === ')') {
      depth -= 1
      if (depth === 0 && start !== -1) {
        tuples.push(valuesRegion.slice(start, i))
        start = -1
      }
    }
  }
  if (depth !== 0 || inQuote) throw new Error('unterminated nutrient_defs tuple')
  return tuples
}

function splitSqlTuple(tuple: string): string[] {
  const fields: string[] = []
  let current = ''
  let inQuote = false
  for (let i = 0; i < tuple.length; i += 1) {
    const ch = tuple[i]
    const next = tuple[i + 1]
    if (inQuote) {
      current += ch
      if (ch === '\'' && next === '\'') {
        current += next
        i += 1
      } else if (ch === '\'') {
        inQuote = false
      }
      continue
    }
    if (ch === '\'') {
      inQuote = true
      current += ch
      continue
    }
    if (ch === ',') {
      fields.push(current.trim())
      current = ''
      continue
    }
    current += ch
  }
  if (current.trim()) fields.push(current.trim())
  if (inQuote) throw new Error('unterminated SQL string in nutrient_defs tuple')
  return fields
}

function parseSqlLiteral(token: string): string | number | boolean | null {
  const trimmed = token.trim()
  if (/^NULL$/i.test(trimmed)) return null
  if (/^true$/i.test(trimmed)) return true
  if (/^false$/i.test(trimmed)) return false
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) return Number(trimmed)
  if (trimmed.startsWith('\'') && trimmed.endsWith('\'')) {
    return trimmed.slice(1, -1).replace(/''/g, '\'')
  }
  throw new Error(`unsupported SQL literal: ${token}`)
}

function parseRdaUpdates(source: string): Map<string, ParsedRda> {
  const updates = new Map<string, ParsedRda>()
  const updateRe = /UPDATE nutrition\.nutrient_defs SET rda_male=([^,]+),\s*rda_female=([^,]+),\s*rda_unit='((?:''|[^'])*)'\s+WHERE code='((?:''|[^'])*)';/g
  let match: RegExpExecArray | null
  while ((match = updateRe.exec(source)) !== null) {
    const code = match[4].replace(/''/g, '\'')
    updates.set(code, {
      rda_male: match[1].trim(),
      rda_female: match[2].trim(),
      rda_unit: match[3].replace(/''/g, '\''),
    })
  }
  return updates
}

function markdownValue(value: string | number | boolean | null): string {
  if (value === null) return 'NULL'
  return String(value).replace(/\|/g, '\\|').replace(/\r?\n/g, ' ')
}

export function extractNutrientDefsSeedCandidate(source: string, sourcePath = DEFAULT_SOURCE_PATH): NutrientDefsSeedCandidate {
  const seedRange = findSeedRange(source)
  const rdaRange = findRdaRange(source)
  const seedSourceRef = `${sourcePath}:${seedRange.startLine}-${seedRange.endLine}`
  const rdaSourceRef = rdaRange.startLine > 0 ? `${sourcePath}:${rdaRange.startLine}-${rdaRange.endLine}` : ''
  const rdaUpdates = parseRdaUpdates(source)

  const rows = tupleBodies(extractValuesRegion(source)).map((tuple): NutrientDefsSeedRow => {
    const fields = splitSqlTuple(tuple).map(parseSqlLiteral)
    if (fields.length !== 11) {
      throw new Error(`nutrient_defs tuple has ${fields.length} fields instead of 11: ${tuple.slice(0, 80)}`)
    }
    const code = fields[0]
    if (typeof code !== 'string') throw new Error('nutrient_defs code must be a string')
    const rda = rdaUpdates.get(code) ?? { rda_male: '', rda_female: '', rda_unit: '' }
    return {
      code,
      name_de: String(fields[1]),
      name_en: String(fields[2]),
      name_th: '',
      unit: String(fields[3]),
      group_de: String(fields[4]),
      group_en: String(fields[5]),
      group_th: '',
      sort_index: Number(fields[6]),
      display_tier: Number(fields[7]),
      is_always_computed: Boolean(fields[8]),
      is_partly_computed: Boolean(fields[9]),
      formula: fields[10] === null ? null : String(fields[10]),
      rda_male: rda.rda_male,
      rda_female: rda.rda_female,
      rda_unit: rda.rda_unit,
      source_ref: seedSourceRef,
      rda_source_ref: rda.rda_male ? rdaSourceRef : '',
    }
  })

  return {
    columns: NUTRIENT_DEFS_SEED_COLUMNS,
    rows,
    expectedRowCount: 138,
    sourcePath,
    seedSourceRef,
    rdaSourceRef,
    rdaUpdateCount: rdaUpdates.size,
  }
}

export function buildSeedCandidateMarkdown(candidate: NutrientDefsSeedCandidate): string {
  const header = `| ${candidate.columns.join(' | ')} |`
  const separator = `| ${candidate.columns.map(() => '---').join(' | ')} |`
  const rows = candidate.rows.map(row =>
    `| ${candidate.columns.map(column => markdownValue(row[column])).join(' | ')} |`
  )

  return [
    '# P1-005 Nutrient Definitions Seed Candidate',
    '',
    'Status: REVIEW_ONLY_SEED_CANDIDATE',
    '',
    '## Purpose',
    '',
    'This artifact captures a deterministic review-only candidate for `nutrition.nutrient_defs` seed rows. It is generated from the approved SPEC_06 source text and is not executable.',
    '',
    '## Scope',
    '',
    '- Review-only seed candidate for `nutrition.nutrient_defs`.',
    '- Exactly 16 candidate columns are emitted.',
    "- `name_th` and `group_th` are intentionally empty strings because Thai translation seed work has not been opened.",
    '- RDA fields are copied only from explicit `UPDATE nutrition.nutrient_defs` examples in the same source file; rows without explicit updates keep empty RDA fields.',
    '',
    '## Source refs',
    '',
    `- Seed rows: \`${candidate.seedSourceRef}\``,
    ...(candidate.rdaSourceRef ? [`- RDA example updates: \`${candidate.rdaSourceRef}\``] : []),
    '',
    '## Expected row count',
    '',
    `Expected row count: ${candidate.expectedRowCount}`,
    `Extracted row count: ${candidate.rows.length}`,
    `RDA update rows merged: ${candidate.rdaUpdateCount}`,
    '',
    '## Review-only seed candidate table',
    '',
    header,
    separator,
    ...rows,
    '',
    '## Provenance discipline',
    '',
    `- Every table row is parsed from \`${candidate.seedSourceRef}\`.`,
    '- No nutrient code, label, unit, group, sort order, display tier, computation flag, formula, or RDA value was authored by an LLM.',
    '- Rows missing explicit RDA update examples retain empty `rda_male`, `rda_female`, and `rda_unit` fields.',
    '',
    '## Validation query',
    '',
    'DO NOT RUN until a later seed-execution boundary is explicitly opened.',
    '',
    '```sql',
    'select',
    '  count(*) as row_count,',
    '  count(*) filter (where name_th = \'\') as empty_name_th,',
    '  count(*) filter (where group_th = \'\') as empty_group_th',
    'from nutrition.nutrient_defs;',
    '```',
    '',
    '## Explicit exclusions',
    '',
    '- No seed execution is authorized.',
    '- No local DB apply is authorized.',
    '- No Supabase command is authorized.',
    '- No DEV or LIVE action is authorized.',
    '- No BLS import is authorized.',
    '- No raw BLS commit is authorized.',
    '- No migration execution is authorized.',
    '',
    '## Stop conditions',
    '',
    '- Stop if the source row count is not exactly 138.',
    '- Stop if any candidate row cannot be traced to the SPEC_06 seed block.',
    '- Stop if any row requires a value not present in the source text.',
    '- Stop if seed execution, DB apply, Supabase, BLS import, raw BLS commit, or migration execution is requested before a new execution boundary is opened.',
    '',
    '## Next local-only boundary',
    '',
    'Tom must explicitly approve a separate local-only seed execution boundary before any insert/apply command is run.',
    '',
  ].join('\n')
}

export function validateNutrientDefsSeedCandidate(markdown: string, candidate: NutrientDefsSeedCandidate): ValidationResult {
  const errors: string[] = []
  if (candidate.rows.length !== candidate.expectedRowCount) {
    errors.push(`row count ${candidate.rows.length} does not match expected ${candidate.expectedRowCount}`)
  }
  if (candidate.expectedRowCount !== 138) {
    errors.push(`expected row count must be 138, got ${candidate.expectedRowCount}`)
  }
  const duplicateCodes = candidate.rows
    .map(row => row.code)
    .filter((code, index, all) => all.indexOf(code) !== index)
  if (duplicateCodes.length > 0) {
    errors.push(`duplicate codes: ${[...new Set(duplicateCodes)].join(', ')}`)
  }
  for (const row of candidate.rows) {
    for (const column of candidate.columns) {
      if (!(column in row)) errors.push(`row ${row.code} missing column ${column}`)
    }
    if (row.name_th !== '') errors.push(`row ${row.code} has non-empty name_th`)
    if (row.group_th !== '') errors.push(`row ${row.code} has non-empty group_th`)
    if (row.source_ref !== candidate.seedSourceRef) errors.push(`row ${row.code} source_ref mismatch`)
  }
  if (!markdown.includes('Status: REVIEW_ONLY_SEED_CANDIDATE')) errors.push('missing review-only status')
  if (!markdown.includes(`Expected row count: ${candidate.expectedRowCount}`)) errors.push('missing expected row count')
  if (!markdown.includes('No seed execution is authorized')) errors.push('missing seed execution exclusion')
  if (!markdown.includes(candidate.seedSourceRef)) errors.push('missing seed source ref')
  return { valid: errors.length === 0, errors }
}

export function writeSeedCandidate(options: {
  sourcePath?: string
  outputPath?: string
  repoRoot?: string
} = {}): NutrientDefsSeedCandidate {
  const repoRoot = options.repoRoot ?? process.cwd()
  const sourcePath = options.sourcePath ?? DEFAULT_SOURCE_PATH
  const outputPath = options.outputPath ?? DEFAULT_OUTPUT_PATH
  const source = fs.readFileSync(path.resolve(repoRoot, sourcePath), 'utf8')
  const candidate = extractNutrientDefsSeedCandidate(source, sourcePath)
  const markdown = buildSeedCandidateMarkdown(candidate)
  const validation = validateNutrientDefsSeedCandidate(markdown, candidate)
  if (!validation.valid) {
    throw new Error(`nutrient_defs seed candidate validation failed: ${validation.errors.join('; ')}`)
  }
  const absoluteOutput = path.resolve(repoRoot, outputPath)
  fs.mkdirSync(path.dirname(absoluteOutput), { recursive: true })
  fs.writeFileSync(absoluteOutput, markdown, 'utf8')
  return candidate
}

function printUsage(): void {
  console.error('Usage: nutrient-defs-seed-extract.ts [--write] [--json] [--source <path>] [--output <path>]')
}

function argValue(args: string[], flag: string): string | undefined {
  const index = args.indexOf(flag)
  return index === -1 ? undefined : args[index + 1]
}

function main(): void {
  const args = process.argv.slice(2)
  if (args.includes('--help')) {
    printUsage()
    return
  }
  const sourcePath = argValue(args, '--source') ?? DEFAULT_SOURCE_PATH
  const outputPath = argValue(args, '--output') ?? DEFAULT_OUTPUT_PATH
  const source = fs.readFileSync(path.resolve(process.cwd(), sourcePath), 'utf8')
  const candidate = extractNutrientDefsSeedCandidate(source, sourcePath)
  const markdown = buildSeedCandidateMarkdown(candidate)
  const validation = validateNutrientDefsSeedCandidate(markdown, candidate)
  if (!validation.valid) {
    console.error(JSON.stringify({ ok: false, errors: validation.errors }, null, 2))
    process.exit(1)
  }
  if (args.includes('--write')) {
    const absoluteOutput = path.resolve(process.cwd(), outputPath)
    fs.mkdirSync(path.dirname(absoluteOutput), { recursive: true })
    fs.writeFileSync(absoluteOutput, markdown, 'utf8')
  }
  const result = {
    ok: true,
    sourcePath,
    outputPath,
    wrote: args.includes('--write'),
    columns: candidate.columns,
    rowCount: candidate.rows.length,
    expectedRowCount: candidate.expectedRowCount,
    seedSourceRef: candidate.seedSourceRef,
    rdaSourceRef: candidate.rdaSourceRef,
    rdaUpdateCount: candidate.rdaUpdateCount,
  }
  if (args.includes('--json')) console.log(JSON.stringify(result, null, 2))
  else console.log(`nutrient_defs seed candidate valid: rows=${result.rowCount}, columns=${result.columns.length}, output=${outputPath}`)
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  main()
}
