import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { guardMigrationContent } from '../../agent-registry/authorize-tool-call'

export interface VerificationCheck {
  name: string
  passed: boolean
  detail: string
}

export interface VerificationResult {
  passed: boolean
  checks: VerificationCheck[]
}

const MIGRATIONS_DIR = 'supabase/migrations'
const SCHEMA_FOUNDATION = '20240522_001_nutrition_schema_foundation.sql'
const FOOD_CORE = '20240522_002_nutrition_food_core_tables.sql'
const LEGACY_FOOD_CORE = '20240520_001_nutrition_food_core_tables.sql'

const EXPECTED_TABLE_ORDER = [
  'nutrient_defs',
  'food_categories',
  'foods',
  'food_nutrients',
  'food_aliases',
  'tag_definitions',
  'food_tags',
]

function check(name: string, passed: boolean, detail: string): VerificationCheck {
  return { name, passed, detail }
}

function readIfExists(filePath: string): string {
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : ''
}

function migrationNames(repoRoot: string): string[] {
  return fs.readdirSync(path.join(repoRoot, MIGRATIONS_DIR))
    .filter(name => name.endsWith('.sql'))
    .sort()
}

function stripComments(sql: string): string {
  return sql
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split(/\r?\n/)
    .map(line => line.replace(/--.*$/, ''))
    .join('\n')
}

function executableSql(sql: string): string {
  return stripComments(sql).replace(/\s+/g, ' ').trim()
}

function countSeedRows(sql: string, insertMarker: string, conflictMarker: string): number {
  const start = sql.indexOf(insertMarker)
  const end = sql.indexOf(conflictMarker, start)
  if (start < 0 || end < start) return -1
  return (sql.slice(start, end).match(/\n\s*\('/g) ?? []).length
}

function tableCreationOrder(sql: string): string[] {
  return [...sql.matchAll(/CREATE\s+TABLE\s+IF\s+NOT\s+EXISTS\s+nutrition\.([a-z_]+)/gi)]
    .map(match => match[1])
}

function foreignKeyTargets(sql: string): string[] {
  return [...sql.matchAll(/REFERENCES\s+nutrition\.([a-z_]+)/gi)]
    .map(match => match[1])
}

function hasExecutableRollback(sql: string): boolean {
  return /^\s*(DOWN|ROLLBACK|REVERT|UNDO)\s*:/im.test(executableSql(sql))
}

function hasForbiddenSupabaseCommand(sql: string): boolean {
  return /supabase\s+db\s+(push|reset)/i.test(sql)
}

function orderedBefore(names: string[], first: string, second: string): boolean {
  const firstIndex = names.indexOf(first)
  const secondIndex = names.indexOf(second)
  return firstIndex >= 0 && secondIndex >= 0 && firstIndex < secondIndex
}

export function verifyNutritionP1SchemaStatic(repoRoot = process.cwd()): VerificationResult {
  const names = migrationNames(repoRoot)
  const foundationPath = path.join(repoRoot, MIGRATIONS_DIR, SCHEMA_FOUNDATION)
  const foodCorePath = path.join(repoRoot, MIGRATIONS_DIR, FOOD_CORE)
  const legacyFoodCorePath = path.join(repoRoot, MIGRATIONS_DIR, LEGACY_FOOD_CORE)
  const foundationSql = readIfExists(foundationPath)
  const foodCoreSql = readIfExists(foodCorePath)
  const combinedSql = `${foundationSql}\n${foodCoreSql}`

  const checks: VerificationCheck[] = []
  checks.push(check('schema foundation migration exists', foundationSql.length > 0, SCHEMA_FOUNDATION))
  checks.push(check('food core migration exists', foodCoreSql.length > 0, FOOD_CORE))
  checks.push(check('legacy misordered food core migration absent', !fs.existsSync(legacyFoodCorePath), LEGACY_FOOD_CORE))
  checks.push(check(
    'schema foundation sorts before food core',
    orderedBefore(names, SCHEMA_FOUNDATION, FOOD_CORE),
    names.filter(name => name.includes('nutrition')).join(' -> '),
  ))

  checks.push(check(
    'nutrition schema is created in foundation',
    /CREATE\s+SCHEMA\s+IF\s+NOT\s+EXISTS\s+nutrition/i.test(foundationSql),
    'CREATE SCHEMA IF NOT EXISTS nutrition',
  ))
  checks.push(check(
    'pg_trgm extension is created before food core GIN trigram indexes',
    /CREATE\s+EXTENSION\s+IF\s+NOT\s+EXISTS\s+pg_trgm/i.test(foundationSql) && /gin_trgm_ops/i.test(foodCoreSql),
    'pg_trgm before gin_trgm_ops usage',
  ))
  checks.push(check(
    'pgcrypto extension is created before gen_random_uuid usage',
    /CREATE\s+EXTENSION\s+IF\s+NOT\s+EXISTS\s+pgcrypto/i.test(foundationSql) && /gen_random_uuid\(\)/i.test(foodCoreSql),
    'pgcrypto before gen_random_uuid() usage',
  ))

  const actualOrder = tableCreationOrder(foodCoreSql)
  checks.push(check(
    'food core tables are created in expected dependency order',
    EXPECTED_TABLE_ORDER.every((table, index) => actualOrder[index] === table),
    actualOrder.join(' -> '),
  ))

  const knownTables = new Set(actualOrder)
  const fkTargets = foreignKeyTargets(foodCoreSql)
  checks.push(check(
    'foreign keys reference tables created by the migration',
    fkTargets.every(target => knownTables.has(target)),
    fkTargets.join(', '),
  ))
  checks.push(check(
    'foreign key targets are created before dependent tables',
    fkTargets.every(target => {
      const targetIndex = actualOrder.indexOf(target)
      const referenceIndex = foodCoreSql.indexOf(`REFERENCES nutrition.${target}`)
      const prefixOrder = tableCreationOrder(foodCoreSql.slice(0, referenceIndex))
      return targetIndex >= 0 && prefixOrder.includes(target)
    }),
    'all REFERENCES nutrition.* targets precede their use',
  ))

  checks.push(check(
    'RLS is enabled on all seven food core tables',
    EXPECTED_TABLE_ORDER.every(table => new RegExp(`ALTER\\s+TABLE\\s+nutrition\\.${table}\\s+ENABLE\\s+ROW\\s+LEVEL\\s+SECURITY`, 'i').test(foodCoreSql)),
    EXPECTED_TABLE_ORDER.join(', '),
  ))
  checks.push(check(
    'policies are created through idempotent pg_policies guard',
    /pg_policies/i.test(foodCoreSql) && /IF\s+NOT\s+EXISTS\s*\(/i.test(foodCoreSql),
    'pg_policies guarded policy creation',
  ))

  checks.push(check(
    'no executable DOWN or rollback section',
    !hasExecutableRollback(combinedSql),
    'rollback text must remain comments only',
  ))
  checks.push(check(
    'no Supabase db push/reset commands in migrations',
    !hasForbiddenSupabaseCommand(combinedSql),
    'static SQL only',
  ))
  checks.push(check(
    'migration guard allows schema foundation',
    guardMigrationContent(foundationSql, 'db-migration-agent').allowed,
    SCHEMA_FOUNDATION,
  ))
  checks.push(check(
    'migration guard allows food core',
    guardMigrationContent(foodCoreSql, 'db-migration-agent').allowed,
    FOOD_CORE,
  ))

  checks.push(check(
    'nutrient_defs seed count is 138',
    countSeedRows(foodCoreSql, 'INSERT INTO nutrition.nutrient_defs', 'ON CONFLICT (code) DO UPDATE SET') === 138,
    String(countSeedRows(foodCoreSql, 'INSERT INTO nutrition.nutrient_defs', 'ON CONFLICT (code) DO UPDATE SET')),
  ))
  checks.push(check(
    'tag_definitions seed count is 16',
    countSeedRows(foodCoreSql, 'INSERT INTO nutrition.tag_definitions', 'ON CONFLICT (code) DO UPDATE SET') === 16,
    String(countSeedRows(foodCoreSql, 'INSERT INTO nutrition.tag_definitions', 'ON CONFLICT (code) DO UPDATE SET')),
  ))
  checks.push(check(
    'no placeholder nutrient seed text',
    !/few examples|placeholder/i.test(foodCoreSql),
    'no placeholder/few examples text',
  ))
  checks.push(check(
    'no deprecated RDA production seed',
    !/DEPRECATED|UPDATE\s+nutrition\.nutrient_defs\s+SET\s+rda_/i.test(foodCoreSql),
    'nutrient_reference_values remains separate',
  ))
  checks.push(check(
    'no nutrient_reference_values fake seed',
    !/nutrient_reference_values/i.test(foodCoreSql),
    'no reference value seed in WO-003 migration',
  ))

  return {
    passed: checks.every(item => item.passed),
    checks,
  }
}

export function formatVerificationReport(result: VerificationResult): string {
  const lines = [
    '# Nutrition P1-004 Static Schema Verification',
    '',
    `Result: ${result.passed ? 'PASS' : 'FAIL'}`,
    '',
    '| Check | Result | Detail |',
    '|---|---|---|',
  ]
  for (const item of result.checks) {
    lines.push(`| ${item.name} | ${item.passed ? 'PASS' : 'FAIL'} | ${item.detail.replace(/\|/g, '\\|')} |`)
  }
  return lines.join('\n')
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const result = verifyNutritionP1SchemaStatic()
  console.log(formatVerificationReport(result))
  process.exit(result.passed ? 0 : 1)
}
