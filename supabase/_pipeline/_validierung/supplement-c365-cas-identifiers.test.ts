// C-365: Die belegten CAS-Nummern sind eigene Kennungen, keine unsicheren
// cas_candidates. Peptidsequenzen bleiben ohne Leser und ohne Zielspalte.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const CONTAINER = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const DB = process.env.PGDATABASE ?? 'postgres'

const expected = [
  ['sub_dcb8ab1209', '137525-51-0'],
  ['sub_d4f140bc56', '885340-08-9'],
  ['sub_fcb3b6dc30', '77591-33-4'],
  ['sub_271e0f2373', '67727-97-3'],
  ['sub_d6690ba08f', '49557-75-7'],
  ['sub_73ea811e99', '597562-32-8'],
  ['sub_848a3aaf7f', '1627580-64-6'],
  ['sub_a21a1bf992', '221231-10-3'],
  ['sub_74cb0c22b1', '863288-34-0'],
  ['sub_18fdc6c754', '863288-34-0'],
  ['sub_55820f027f', '446262-89-1'],
  ['sub_16306ba3e5', '170851-70-4'],
  ['sub_50a7fb5f3c', '158861-67-7'],
  ['sub_a1c4492d17', '87616-84-0'],
  ['sub_60eed56d73', '140703-51-1'],
  ['sub_85c8d4ddec', '86168-78-7'],
  ['sub_313fdcf581', '218949-48-5'],
  ['sub_8bddfad866', '68562-41-4'],
  ['sub_f4dce63643', '946870-92-4'],
  ['sub_1c34a9f129', '112603-35-7'],
  ['sub_4d6afb6227', '80714-61-0'],
  ['sub_5959e28c02', '129954-34-3'],
  ['sub_12eddaf876', '62568-57-4'],
  ['sub_d9569c9e86', '1401708-83-5'],
  ['sub_e5dc9f8f1f', '175175-23-2'],
  ['sub_4b528225b1', '204271-66-9'],
  ['sub_7c0f9133e7', '45234-02-4'],
  ['sub_e092c450ce', '335591-03-2'],
  ['sub_a12cc12158', '307297-39-8'],
  ['sub_58ea56993c', '75921-69-6'],
  ['sub_15f568b407', '121062-08-6'],
  ['sub_36d3652f3c', '189691-06-3'],
  ['sub_d1b4922e08', '62304-98-7'],
]

function query<T>(sql: string): T {
  return JSON.parse(execFileSync('docker', [
    'exec', CONTAINER,
    'psql', '-X', '-q', '-U', 'postgres', '-d', DB,
    '-t', '-A', '-c', sql,
  ], { encoding: 'utf8' }).trim()) as T
}

test('C-365: alle 33 belegten CAS-Nummern liegen als eigene Kennung am vorhandenen Stoff', () => {
  const result = query<Array<{ slug: string; cas: string }>>(`
    SELECT COALESCE(json_agg(json_build_object('slug', s.slug, 'cas', i.identifier_value)
      ORDER BY s.slug), '[]'::json)
    FROM supplements.supplement_identifiers i
    JOIN supplements.supplements s ON s.id = i.supplement_id
    WHERE i.identifier_type = 'CAS'
      AND i.status = 'bekannt'
      AND i.source = 'kimi:c365';
  `)

  assert.deepEqual(result, expected
    .map(([slug, cas]) => ({ slug, cas }))
    .sort((a, b) => a.slug.localeCompare(b.slug)))
})

test('C-365: Peptidsequenzen erhalten ohne Leser keine Zielspalte', () => {
  const count = query<number>(`
    SELECT count(*)::integer
    FROM information_schema.columns
    WHERE table_schema = 'supplements'
      AND column_name ILIKE '%peptide%';
  `)

  assert.equal(count, 0)
})
