#!/usr/bin/env node
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const CONTAINER = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const DB = process.env.PGDATABASE ?? 'postgres'
const OUTPUT = process.env.KENNUNGEN_REPORT ?? 'backup/c267/supplement-kennungen-konflikte.json'

function runPsql(sql) {
  const result = spawnSync('docker', [
    'exec', CONTAINER,
    'psql', '-U', 'postgres', '-d', DB,
    '-t', '-A', '-F', '\t',
    '-v', 'ON_ERROR_STOP=1',
    '-c', sql,
  ], {
    encoding: 'utf8',
    maxBuffer: 128 * 1024 * 1024,
  })
  if (result.status !== 0) {
    process.stderr.write(result.stdout)
    process.stderr.write(result.stderr)
    process.exit(result.status ?? 1)
  }
  return result.stdout.trim()
}

function rows(sql) {
  const out = runPsql(sql)
  if (!out) return []
  return out.split(/\r?\n/).map(line => JSON.parse(line))
}

function scalar(sql) {
  const out = runPsql(sql)
  return out.split(/\r?\n/).find(Boolean) ?? ''
}

function norm(value) {
  return String(value ?? '').trim().toLowerCase()
}

function words(value) {
  return new Set(norm(value)
    .replace(/\([^)]*\)/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .split(/\s+/)
    .filter(w => w.length >= 4 && !['with', 'context', 'cross', 'entry'].includes(w)))
}

const substances = rows(`
WITH ids AS (
  SELECT
    s.id,
    s.slug,
    coalesce(s.name_de, s.name_en, s.slug) AS name,
    max(i.identifier_value) FILTER (WHERE i.identifier_type = 'UNII') AS unii,
    max(i.identifier_value) FILTER (WHERE i.identifier_type = 'PubChem_CID') AS pubchem_cid,
    max(i.identifier_value) FILTER (WHERE i.identifier_type = 'molecular_formula') AS molecular_formula,
    max(i.identifier_value) FILTER (WHERE i.identifier_type = 'InChIKey') AS inchikey,
    max(i.identifier_value) FILTER (WHERE i.identifier_type = 'ChEMBL_ID') AS chembl_id
  FROM supplements.supplements s
  JOIN supplements.supplement_identifiers i ON i.supplement_id = s.id
  GROUP BY s.id, s.slug, coalesce(s.name_de, s.name_en, s.slug)
)
SELECT jsonb_build_object(
  'id', id,
  'slug', slug,
  'name', name,
  'unii', unii,
  'pubchem_cid', pubchem_cid,
  'molecular_formula', molecular_formula,
  'inchikey', inchikey,
  'chembl_id', chembl_id
)::text
FROM ids
WHERE pubchem_cid IS NOT NULL
  AND molecular_formula IS NOT NULL
  AND inchikey IS NOT NULL;
`)

const pubchemConflictTableExists = scalar(`
SELECT CASE WHEN to_regclass('supplements.pubchem_conflict_records') IS NULL THEN '0' ELSE '1' END;
`) === '1'

const pubchemConflictRecords = pubchemConflictTableExists
  ? rows(`
SELECT jsonb_build_object('entity_id', entity_id, 'resolution_status', resolution_status)::text
FROM supplements.pubchem_conflict_records
WHERE entity_id IS NOT NULL;
`)
  : []
const knownConflictEntityIds = new Set(pubchemConflictRecords.map(row => row.entity_id))
const truePubchemConflictCount = pubchemConflictRecords
  .filter(row => row.resolution_status === 'OPEN_TRUE_CONFLICT')
  .length
const legacyC267KnownConflictKeys = new Set([
  // C-267: Chromium und Chromium picolinate laufen ueber dieselbe UNII
  // mit unterschiedlichen Triaden. Kimis PubChem-Records aus C-272
  // enthalten diesen Altfund nicht, daher bleibt er explizit belegt.
  'sub_03e86b16d2|sub_b7423d9551',
])

if (process.env.KENNUNGEN_NEGATIVPROBE === '1') {
  const byStableUnii = new Map()
  for (const row of substances) {
    if (!row.unii) continue
    if (!byStableUnii.has(row.unii)) byStableUnii.set(row.unii, [])
    byStableUnii.get(row.unii).push(row)
  }
  const stableGroup = [...byStableUnii.values()].find(group => {
    if (group.length < 2) return false
    const triads = new Set(group.map(row => `${row.pubchem_cid}|${row.molecular_formula}|${row.inchikey}`))
    return triads.size === 1
  })
  if (!stableGroup) {
    console.error('[kennungen] NEGATIVPROBE nicht moeglich: keine gleiche-UNII-Gruppe mit gleicher Triade gefunden')
    process.exit(1)
  }
  stableGroup[0].molecular_formula = `${stableGroup[0].molecular_formula}_NEGATIVPROBE`
  stableGroup[0].negativprobe = true
}

const byUnii = new Map()
for (const row of substances) {
  if (!row.unii) continue
  if (!byUnii.has(row.unii)) byUnii.set(row.unii, [])
  byUnii.get(row.unii).push(row)
}

const conflicts = []
for (const [unii, group] of byUnii) {
  if (group.length < 2) continue
  const triads = new Map()
  for (const row of group) {
    const triad = `${row.pubchem_cid}|${row.molecular_formula}|${row.inchikey}`
    if (!triads.has(triad)) triads.set(triad, [])
    triads.get(triad).push(row)
  }
  if (triads.size <= 1) continue
  conflicts.push({
    type: 'SAME_UNII_DIFFERENT_CID_FORMULA_INCHIKEY',
    unii,
    reason: 'Dieselbe UNII steht fuer dieselbe Substanz, aber PubChem_CID, molecular_formula und/oder InChIKey laufen auseinander.',
    groups: [...triads.entries()].map(([triad, members]) => ({ triad, members })),
  })
}

const caffeineHit = conflicts.some(conflict =>
  JSON.stringify(conflict).toLowerCase().includes('caffeine') &&
  JSON.stringify(conflict).includes('6435808')
)

function conflictKey(conflict) {
  return conflict.groups
    .flatMap(group => group.members.map(row => row.slug))
    .sort()
    .join('|')
}

const classified = conflicts.map(conflict => ({
  ...conflict,
  key: conflictKey(conflict),
  known: legacyC267KnownConflictKeys.has(conflictKey(conflict)) || conflict.groups
    .flatMap(group => group.members.map(row => row.slug))
    .some(slug => knownConflictEntityIds.has(slug)),
}))
const unknownConflicts = classified.filter(conflict => !conflict.known)

fs.mkdirSync(path.dirname(OUTPUT), { recursive: true })
fs.writeFileSync(OUTPUT, JSON.stringify({
  checked: substances.length,
  known_conflicts: classified.filter(conflict => conflict.known),
  unknown_conflicts: unknownConflicts,
}, null, 2) + '\n', 'utf8')

console.log(`[kennungen] ${substances.length} Substanzen mit CID/Formel/InChIKey geprueft`)
console.log(`[kennungen] ${knownConflictEntityIds.size} bekannte PubChem-Konflikt-Entity(s) aus supplements.pubchem_conflict_records, davon ${truePubchemConflictCount} echte Konflikte`)
console.log(`[kennungen] ${conflicts.length} Konfliktgruppe(n)`)
for (const conflict of classified) {
  const names = conflict.groups.flatMap(group => group.members.map(row => `${row.slug} ${row.name}`)).join(' | ')
  console.log(`  ${conflict.known ? 'GELB' : 'ROT'} ${conflict.type}: ${names}`)
}

if (!caffeineHit) {
  console.error('[kennungen] ROT: Koffein-Gegenprobe nicht gefunden')
  process.exit(1)
}
if (unknownConflicts.length > 0) {
  console.error(`[kennungen] ROT: ${unknownConflicts.length} neue Kennungskonfliktgruppe(n), siehe ${OUTPUT}`)
  process.exit(1)
}
console.log(`[kennungen] ${classified.length} bekannte C-267-Konfliktgruppe(n), 0 neue.`)
