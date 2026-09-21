import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const container = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const db = process.env.LUMEOS_C525_DATABASE
if (!db || db === 'postgres') throw new Error('C-525 braucht LUMEOS_C525_DATABASE als Wegwerf-Datenbank.')

function one<T>(sql: string): T {
  const output = execFileSync('docker', [
    'exec', container, 'psql', '-X', '-q', '-v', 'ON_ERROR_STOP=1', '-U', 'postgres', '-d', db,
    '-t', '-A', '-c', sql,
  ], { encoding: 'utf8' }).trim()
  const payload = output.match(/\{[\s\S]*\}/)?.[0]
  if (!payload) throw new Error(`Kein JSON-Ergebnis: ${output}`)
  return JSON.parse(payload) as T
}

test('C-525: kuratierte Suchbegriffe treffen nur die vier Food-Allergentags', () => {
  const tableExists = one<{ tableExists: boolean }>(`
    SELECT json_build_object(
      'tableExists', to_regclass('public.allergy_search_terms') IS NOT NULL
    );
  `)
  assert.equal(tableExists.tableExists, true)
  if (!tableExists.tableExists) return

  const result = one<{
    termCount: number
    brot: number
    weizen: number
    milch: number
    nuss: number
    soja: number
    glutenfrei: number
    vegan: number
    invented: number
  }>(`
    SELECT json_build_object(
      'termCount', coalesce((SELECT count(*) FROM public.allergy_search_terms), 0),
      'brot', (SELECT count(*) FROM public.allergy_catalog_suggestions('nahrung', 'brot', 20) WHERE catalog_code = 'nutrition:contains_gluten'),
      'weizen', (SELECT count(*) FROM public.allergy_catalog_suggestions('nahrung', 'weizen', 20) WHERE catalog_code = 'nutrition:contains_gluten'),
      'milch', (SELECT count(*) FROM public.allergy_catalog_suggestions('nahrung', 'milch', 20) WHERE catalog_code = 'nutrition:contains_lactose'),
      'nuss', (SELECT count(*) FROM public.allergy_catalog_suggestions('nahrung', 'nuss', 20) WHERE catalog_code = 'nutrition:contains_nuts'),
      'soja', (SELECT count(*) FROM public.allergy_catalog_suggestions('nahrung', 'soja', 20) WHERE catalog_code = 'nutrition:contains_soy'),
      'glutenfrei', (SELECT count(*) FROM public.allergy_catalog_suggestions('nahrung', 'glutenfrei', 20)),
      'vegan', (SELECT count(*) FROM public.allergy_catalog_suggestions('nahrung', 'vegan', 20) WHERE catalog_code = 'nutrition:vegan'),
      'invented', (SELECT count(*) FROM public.allergy_catalog_suggestions('nahrung', 'qzvwxjplk', 20))
    );
  `)
  assert.equal(result.termCount, 23)
  assert.deepEqual(
    { brot: result.brot, weizen: result.weizen, milch: result.milch, nuss: result.nuss, soja: result.soja },
    { brot: 1, weizen: 1, milch: 1, nuss: 1, soja: 1 },
  )
  assert.deepEqual(
    { glutenfrei: result.glutenfrei, vegan: result.vegan, invented: result.invented },
    { glutenfrei: 0, vegan: 0, invented: 0 },
  )
})

test('C-525: Suchwortschatz ist authentifiziert lesbar, aber nicht öffentlich', () => {
  const tableExists = one<{ tableExists: boolean }>(`
    SELECT json_build_object(
      'tableExists', to_regclass('public.allergy_search_terms') IS NOT NULL
    );
  `)
  if (!tableExists.tableExists) return

  const result = one<{ authenticated: boolean; anon: boolean }>(`
    SELECT json_build_object(
      'authenticated', has_table_privilege('authenticated', 'public.allergy_search_terms', 'SELECT'),
      'anon', has_table_privilege('anon', 'public.allergy_search_terms', 'SELECT')
    );
  `)
  assert.deepEqual(result, { authenticated: true, anon: false })
})
