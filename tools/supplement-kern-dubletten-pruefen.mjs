import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const CONTAINER = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const DB = process.env.PGDATABASE ?? 'postgres'
const OUTPUT = process.env.C276_REPORT ?? path.join('backup', 'c276', 'supplement-kern-dubletten.json')

function psql(sql) {
  const result = spawnSync('docker', ['exec', '-i', CONTAINER, 'psql', '-U', 'postgres', '-d', DB, '-t', '-A', '-F', '\t', '-v', 'ON_ERROR_STOP=1', '-c', sql], {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  })
  if (result.status !== 0) {
    process.stderr.write(result.stdout)
    process.stderr.write(result.stderr)
    process.exit(result.status ?? 1)
  }
  return result.stdout.trim()
}

function core(name) {
  return String(name ?? '')
    .replace(/\s*\([^)]*\)/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
}

const allowed = new Map([
  ['boron', {
    slugs: ['sub_057f2c3be5', 'sub_0d4c636691'],
    reason: 'Boron und hormonal cross-ref sind getrennte sichtbare Eintraege, keine Salzformen.',
  }],
  ['caffeine', {
    slugs: ['caffeine', 'sub_98d523f968'],
    reason: 'Caffeine und fat-loss context cross-ref bleiben getrennt; anhydrous caffeine ist Unterform.',
  }],
  ['panaxginseng', {
    slugs: ['sub_026ab84197', 'sub_c0d2ce1e64'],
    reason: 'American und Korean red ginseng bleiben getrennte botanische Formen ohne Sammelnamen.',
  }],
  ['vitaminb3', {
    slugs: ['sub_2baf990d69', 'sub_7dc88a93db'],
    reason: 'Nicotinic acid und nicotinamide unterscheiden sich pharmakologisch.',
  }],
  ['vitamink2', {
    slugs: ['vitamin-k2-mk7', 'sub_0b5c620106'],
    reason: 'MK-4 und MK-7 bleiben getrennt; die Kimi-MK-7-Dublette ist Unterform.',
  }],
  ['zinc', {
    slugs: ['zinc', 'sub_a11e729d29'],
    reason: 'Zinc und testosterone-context cross-ref bleiben getrennt; Salzformen sind Unterformen.',
  }],
])

const rowsRaw = psql(`
  SELECT slug, coalesce(name_en, name_de, slug) AS name
  FROM supplements.supplements
  WHERE im_katalog
    AND parent_id IS NULL
  ORDER BY slug;
`)

const visibleChildrenRaw = psql(`
  SELECT slug, coalesce(name_en, name_de, slug) AS name
  FROM supplements.supplements
  WHERE im_katalog
    AND parent_id IS NOT NULL
  ORDER BY name, slug;
`)

const rows = rowsRaw
  ? rowsRaw.split(/\r?\n/).map((line) => {
      const [slug, name] = line.split('\t')
      return { slug, name, core: core(name) }
    })
  : []

const visibleChildren = visibleChildrenRaw
  ? visibleChildrenRaw.split(/\r?\n/).map((line) => {
      const [slug, name] = line.split('\t')
      return { slug, name }
    })
  : []

if (process.env.C277_NEGATIVPROBE === '1') {
  visibleChildren.push({ slug: 'c277_negativprobe_child', name: 'C277 Negativprobe Child' })
}

if (process.env.C276_NEGATIVPROBE === '1') {
  rows.push({ slug: 'c276_negativprobe_vitamin_c', name: 'Vitamin C (Negativprobe)', core: 'vitaminc' })
}

const groups = new Map()
for (const row of rows) {
  if (!row.core) continue
  const existing = groups.get(row.core) ?? []
  existing.push(row)
  groups.set(row.core, existing)
}

const duplicateGroups = [...groups.entries()]
  .filter(([, entries]) => entries.length > 1)
  .map(([nameCore, entries]) => ({ core: nameCore, entries }))

const classified = []
const unknown = []
for (const group of duplicateGroups) {
  const expected = allowed.get(group.core)
  const actualSlugs = group.entries.map((entry) => entry.slug).sort()
  const expectedSlugs = expected?.slugs.toSorted() ?? []
  const ok = expected && JSON.stringify(actualSlugs) === JSON.stringify(expectedSlugs)
  const item = {
    core: group.core,
    count: group.entries.length,
    slugs: actualSlugs,
    names: group.entries.map((entry) => entry.name).sort(),
    reason: expected?.reason ?? null,
  }
  if (ok) classified.push(item)
  else unknown.push(item)
}

const report = {
  checked_at: new Date().toISOString(),
  top_level_rows: rows.length,
  visible_children: visibleChildren.length,
  duplicate_groups: duplicateGroups.length,
  allowed_duplicate_groups: classified.length,
  unknown_duplicate_groups: unknown.length,
  negative_probe: process.env.C276_NEGATIVPROBE === '1',
  visibility_negative_probe: process.env.C277_NEGATIVPROBE === '1',
  visible_children_rows: visibleChildren,
  allowed: classified,
  unknown,
}

fs.mkdirSync(path.dirname(OUTPUT), { recursive: true })
fs.writeFileSync(OUTPUT, JSON.stringify(report, null, 2) + '\n', { encoding: 'utf8' })

console.log(`[supplement-kern] ${rows.length} Top-Level-Eintraege geprueft`)
console.log(`[supplement-kern] ${visibleChildren.length} sichtbare Unterformen`)
console.log(`[supplement-kern] ${duplicateGroups.length} Kerndubletten-Gruppe(n), davon ${classified.length} erlaubt, ${unknown.length} unbekannt`)

if (visibleChildren.length > 0) {
  console.error(`[supplement-kern] ROT: ${visibleChildren.length} Unterform(en) sind im obersten Katalog sichtbar, siehe ${OUTPUT}`)
  for (const child of visibleChildren.slice(0, 20)) {
    console.error(`  ${child.slug}: ${child.name}`)
  }
  process.exit(1)
}

if (unknown.length > 0) {
  console.error(`[supplement-kern] ROT: ${unknown.length} unbekannte Kerndubletten-Gruppe(n), siehe ${OUTPUT}`)
  for (const group of unknown) {
    console.error(`  ${group.core}: ${group.names.join(' | ')}`)
  }
  process.exit(1)
}

console.log(`[supplement-kern] sauber, Bericht: ${OUTPUT}`)
