import { execFileSync } from 'node:child_process'

function option(name: string): string | undefined {
  const index = process.argv.indexOf(name)
  return index === -1 ? undefined : process.argv[index + 1]
}

const DB = option('--database') ?? process.env.PGDATABASE ?? 'postgres'
const expectedAtc = Number(option('--expected-atc') ?? '490')
const expectedReproductive = Number(option('--expected-reproductive') ?? '417')

if (![expectedAtc, expectedReproductive].every((value) => Number.isInteger(value) && value >= 0)) {
  throw new Error('Erwartungswerte muessen nichtnegative ganze Zahlen sein')
}

function scalar(sql: string): number {
  const output = execFileSync(
    'docker',
    ['exec', 'supabase_db_LumeOS-Claude-V1', 'psql', '-U', 'postgres', '-d', DB, '-At', '-v', 'ON_ERROR_STOP=1', '-c', sql],
    { encoding: 'utf8' },
  ).trim()
  if (!/^\d+$/.test(output)) throw new Error(`Unerwartete Skalarantwort: ${output}`)
  return Number(output)
}

const checks: Array<[string, number, number]> = [
  ['atc_code', scalar(`SELECT count(*) FROM medical.medication_active_substances WHERE atc_code IS NOT NULL AND atc_code <> ''`), expectedAtc],
  ['reproductive records', scalar(`SELECT count(*) FROM medical.medication_reproductive_evidence`), expectedReproductive],
  ['reproductive pregnancy', scalar(`SELECT count(*) FROM medical.medication_reproductive_evidence WHERE pregnancy IS NOT NULL AND pregnancy <> '{}'::jsonb`), 270],
  ['reproductive lactation', scalar(`SELECT count(*) FROM medical.medication_reproductive_evidence WHERE lactation IS NOT NULL AND lactation <> '{}'::jsonb`), 270],
  ['reproductive fertility', scalar(`SELECT count(*) FROM medical.medication_reproductive_evidence WHERE fertility IS NOT NULL AND fertility <> '{}'::jsonb`), 274],
  ['reproductive missing pregnancy/lactation', scalar(`SELECT count(*) FROM medical.medication_reproductive_evidence WHERE missing_pregnancy_lactation <> '{}'::jsonb`), 415],
  ['reproductive missing fertility', scalar(`SELECT count(*) FROM medical.medication_reproductive_evidence WHERE missing_fertility_sex <> '{}'::jsonb`), 357],
  ['PK records', scalar(`SELECT count(*) FROM medical.medication_pk_evidence`), 407],
  ['renal/hepatic records', scalar(`SELECT count(*) FROM medical.medication_renal_hepatic_evidence`), 391],
  ['clinical context records', scalar(`SELECT count(*) FROM medical.medication_clinical_context_evidence`), 107],
  ['Thailand records', scalar(`SELECT count(*) FROM medical.medication_thailand_regulatory_evidence`), 477],
  ['Thailand substance records', scalar(`SELECT count(*) FROM medical.medication_thailand_regulatory_evidence WHERE active_substance_id IS NOT NULL`), 476],
  ['orphan PK records in supplements', scalar(`SELECT count(*) FROM supplements.entity_pk WHERE source = 'kimi:medication_pk_enrichment_crawl_038' AND entity_id LIKE 'drug_%'`), 0],
  ['orphan renal/reproductive records in supplements', scalar(`SELECT count(*) FROM supplements.entity_renal_hepatic WHERE source IN ('kimi:medication_renal_hepatic_enrichment', 'kimi:medication_reproductive_enrichment') AND entity_id LIKE 'drug_%'`), 0],
]

const errors: string[] = []
for (const [name, actual, expected] of checks) {
  if (actual === expected) console.log(`OK ${name}: ${actual}`)
  else errors.push(`${name}: ${actual}, erwartet ${expected}`)
}

if (errors.length > 0) {
  console.error('C-286 Medikamenten-Enrichments unvollstaendig:')
  for (const error of errors) console.error(`- ${error}`)
  process.exit(1)
}

console.log('C-286 Medikamenten-Enrichments vollstaendig.')
