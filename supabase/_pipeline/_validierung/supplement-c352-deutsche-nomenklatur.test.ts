// C-352: Nur regelbasierte deutsche Stoffschreibweisen werden gesetzt.
// Trivial-, Handels- und Forschungsnamen bleiben absichtlich beim EN-Rueckfall.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const CONTAINER = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const DB = process.env.PGDATABASE ?? 'postgres'

const expected = [
  ['sub_b3777be16d', 'Acetyl-L-Carnitin'],
  ['sub_7504c16f98', 'Anastrozol'],
  ['sub_ba827fc312', 'Berberin'],
  ['sub_baec078bee', 'Beta-Alanin'],
  ['sub_f14e403589', 'Beta-Carotin'],
  ['sub_b30d752d32', 'Bromocriptin'],
  ['caffeine', 'Koffein'],
  ['sub_21eaf09b6b', 'Cholinbitartrat'],
  ['sub_5fcb987b01', 'Citrullinmalat'],
  ['sub_3701d02096', 'Kreatinhydrochlorid'],
  ['sub_9f9bb8c160', 'Kreatinmonohydrat'],
  ['sub_6251e6e553', 'Kreatinnitrat'],
  ['folate-b9', 'Folat (B9)'],
  ['glucosamine', 'Glucosamin'],
  ['sub_bcf4e6fe9e', 'L-Carnitin-L-tartrat'],
  ['sub_26bd715a8f', 'L-Citrullin'],
  ['sub_8f0587d87f', 'Semaglutid'],
  ['sub_a5bfaf045f', 'Taurin'],
  ['sub_af6dc7a9dd', 'Tirzepatid'],
  ['zinc', 'Zink'],
]

function query<T>(sql: string): T {
  return JSON.parse(execFileSync('docker', [
    'exec', CONTAINER,
    'psql', '-X', '-q', '-U', 'postgres', '-d', DB,
    '-t', '-A', '-c', sql,
  ], { encoding: 'utf8' }).trim()) as T
}

test('C-352: genau die 20 gesicherten Nomenklaturfaelle haben name_de', () => {
  const result = query<Array<{ slug: string; name_de: string }>>(`
    SELECT coalesce(json_agg(json_build_object('slug', slug, 'name_de', name_de)
      ORDER BY slug), '[]'::json)
    FROM supplements.supplements
    WHERE slug = ANY(ARRAY[${expected.map(([slug]) => `'${slug}'`).join(', ')}])
      AND im_katalog;
  `)

  assert.deepEqual(result, expected
    .map(([slug, name_de]) => ({ slug, name_de }))
    .sort((a, b) => a.slug.localeCompare(b.slug)))
})

test('C-352: alle anderen sichtbaren Katalogeintraege bleiben beim EN-Rueckfall', () => {
  const count = query<number>(`
    SELECT count(*)::integer
    FROM supplements.supplements
    WHERE im_katalog AND name_de IS NOT NULL;
  `)

  assert.equal(count, 20)
})
