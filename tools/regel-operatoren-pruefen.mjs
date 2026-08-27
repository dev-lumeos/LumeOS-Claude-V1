import { spawnSync } from 'node:child_process'

const CONTAINER = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const DB = process.env.PGDATABASE ?? 'postgres'
const EXPECTED_UNSUPPORTED_RULES = 25
const EXPECTED_HIGH_RULES = [
  'wr_drug_hyperkalemia_lab',
  'wr_drug_testosterone_hct',
  'wr_lab_biotin',
  'wr_lab_vitc_glucose',
]
const SEP = '\u0001'

function psql(sql) {
  const result = spawnSync('docker', [
    'exec', '-i', CONTAINER,
    'psql', '-U', 'postgres', '-d', DB,
    '-t', '-A', '-F', SEP, '-v', 'ON_ERROR_STOP=1', '-c', sql,
  ], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
  if (result.status !== 0) {
    process.stderr.write(result.stdout)
    process.stderr.write(result.stderr)
    process.exit(result.status ?? 1)
  }
  return result.stdout.trim()
}

const rows = psql(`
  SELECT
    r.rule_id,
    r.severity,
    array_agg(DISTINCT condition->>'op' ORDER BY condition->>'op') AS unsupported_operators
  FROM supplements.rule_catalog r
  CROSS JOIN LATERAL jsonb_path_query(r.conditions, '$.** ? (@.op.type() == "string")') condition
  WHERE NOT supplements.rule_operator_supported(
    r.rule_id,
    COALESCE(condition->>'module', ''),
    COALESCE(condition->>'field', ''),
    condition->>'op'
  )
  GROUP BY r.rule_id, r.severity
  ORDER BY r.rule_id;
`)
  .split(/\r?\n/)
  .filter(Boolean)
  .map((line) => {
    const [ruleId, severity, operators] = line.split(SEP)
    return { ruleId, severity, operators }
  })

const actualHigh = rows
  .filter((row) => row.severity === 'high')
  .map((row) => row.ruleId)
  .sort()
const expectedHigh = [...EXPECTED_HIGH_RULES].sort()
const errors = []

console.log(`[regel-operatoren] unauswertbare Regeln: ${rows.length}, Soll: ${EXPECTED_UNSUPPORTED_RULES}`)
for (const row of rows) console.log(`  ${row.severity}: ${row.ruleId} (${row.operators})`)

if (rows.length !== EXPECTED_UNSUPPORTED_RULES) {
  errors.push(`Sollstand verletzt: ${rows.length} unauswertbare Regeln, erwartet exakt ${EXPECTED_UNSUPPORTED_RULES}`)
}
if (JSON.stringify(actualHigh) !== JSON.stringify(expectedHigh)) {
  errors.push(`High-Regeln abweichend: ${actualHigh.join(', ') || '(keine)'}`)
}

if (errors.length) {
  console.error('[regel-operatoren] ROT:')
  for (const error of errors) console.error(`  ${error}`)
  process.exit(1)
}

console.log('[regel-operatoren] gruen: Sollstand und vier High-Regeln stimmen.')
