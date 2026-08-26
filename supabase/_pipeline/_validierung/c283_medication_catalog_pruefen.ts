import { execFileSync } from 'node:child_process'

function option(name: string): string | undefined {
  const index = process.argv.indexOf(name)
  return index === -1 ? undefined : process.argv[index + 1]
}

const DB = option('--database') ?? process.env.PGDATABASE ?? 'postgres'
const expectedAtcValue = option('--expected-atc')
const expectedAtc = expectedAtcValue === undefined ? 490 : Number(expectedAtcValue)

if (!Number.isInteger(expectedAtc) || expectedAtc < 0) {
  throw new Error('--expected-atc braucht eine nichtnegative ganze Zahl')
}

function query(sql: string): string[] {
  const output = execFileSync(
    'docker',
    ['exec', 'supabase_db_LumeOS-Claude-V1', 'psql', '-U', 'postgres', '-d', DB, '-At', '-v', 'ON_ERROR_STOP=1', '-c', sql],
    { encoding: 'utf8' },
  ).trim()
  return output === '' ? [] : output.split('\n')
}

function scalar(sql: string): number {
  const rows = query(sql)
  if (rows.length !== 1 || !/^\d+$/.test(rows[0])) {
    throw new Error(`Unerwartete Skalarantwort: ${rows.join(' | ')}`)
  }
  return Number(rows[0])
}

const requiredColumns = [
  'pharmacology',
  'dosage_models',
  'food_interactions',
  'evidence_provenance',
]
const existingColumns = new Set(query(`
  SELECT column_name
  FROM information_schema.columns
  WHERE table_schema = 'medical'
    AND table_name = 'medication_active_substances'
    AND column_name = ANY(ARRAY['pharmacology', 'dosage_models', 'food_interactions', 'evidence_provenance'])
`))
const errors: string[] = []

for (const column of requiredColumns) {
  if (!existingColumns.has(column)) errors.push(`Spalte medical.medication_active_substances.${column} fehlt`)
}

if (errors.length === 0) {
  const checks: Array<[string, number, number]> = [
    ['atc_code', scalar(`SELECT count(*) FROM medical.medication_active_substances WHERE atc_code IS NOT NULL`), expectedAtc],
    ['cas_number', scalar(`SELECT count(*) FROM medical.medication_active_substances WHERE cas_number IS NOT NULL`), 56],
    ['rxnorm_code', scalar(`SELECT count(*) FROM medical.medication_active_substances WHERE rxnorm_code IS NOT NULL`), 113],
    ['unii_code', scalar(`SELECT count(*) FROM medical.medication_active_substances WHERE unii_code IS NOT NULL`), 420],
    ['routes', scalar(`SELECT count(*) FROM medical.medication_active_substances WHERE cardinality(routes) > 0`), 334],
    ['raw_drug_class', scalar(`SELECT count(*) FROM medical.medication_active_substances WHERE cardinality(raw_drug_class) > 0`), 498],
    ['pharmacology', scalar(`SELECT count(*) FROM medical.medication_active_substances WHERE pharmacology <> '{}'::jsonb`), 498],
    ['dosage_models', scalar(`SELECT count(*) FROM medical.medication_active_substances WHERE dosage_models <> '[]'::jsonb`), 56],
    ['food_interactions', scalar(`SELECT count(*) FROM medical.medication_active_substances WHERE food_interactions <> '[]'::jsonb`), 11],
    ['evidence_provenance', scalar(`SELECT count(*) FROM medical.medication_active_substances WHERE evidence_provenance <> '{}'::jsonb`), 498],
    ['raw.pregnancy', scalar(`SELECT count(*) FROM medical.medication_active_substances WHERE raw -> 'pregnancy' <> 'null'::jsonb`), 1],
    ['raw.lactation', scalar(`SELECT count(*) FROM medical.medication_active_substances WHERE raw -> 'lactation' <> 'null'::jsonb`), 0],
    ['raw.fertility', scalar(`SELECT count(*) FROM medical.medication_active_substances WHERE raw -> 'fertility' <> 'null'::jsonb`), 0],
  ]

  for (const [name, actual, expected] of checks) {
    if (actual !== expected) errors.push(`${name}: ${actual}, erwartet ${expected}`)
    else console.log(`OK ${name}: ${actual}`)
  }
}

if (errors.length > 0) {
  console.error('C-283 Medikamentenkatalog nicht vollstaendig:')
  for (const error of errors) console.error(`- ${error}`)
  process.exit(1)
}

console.log('C-283 Medikamentenkatalog vollstaendig.')
