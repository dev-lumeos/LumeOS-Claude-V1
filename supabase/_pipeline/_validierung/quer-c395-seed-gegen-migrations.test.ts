import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const root = path.resolve('.')

function read(relativePath: string) {
  return readFileSync(path.join(root, relativePath), 'utf8')
}

test('C-395: Katalog- und Ableitungsdaten liegen nur in registrierten Kettenschritten', () => {
  assert.doesNotThrow(() => execFileSync(
    process.execPath,
    ['tools/migration-datenlogik-pruefen.mjs'],
    { cwd: root, stdio: 'pipe' },
  ))

  const chain = JSON.parse(read('supabase/_pipeline/kette.json')) as {
    steps: Array<{ id: string; path: string }>
  }
  assert.deepEqual(
    chain.steps
      .filter((step) => ['385_schema', '385'].includes(step.id))
      .map(({ id, path }) => ({ id, path })),
    [
      { id: '385_schema', path: 'supabase/migrations/20260902070205_c385_injection_site_model.sql' },
      { id: '385', path: 'supabase/_pipeline/14_medical/385_injection_site_seed.sql' },
    ],
  )

  const injectionSeed = read('supabase/_pipeline/14_medical/385_injection_site_seed.sql')
  for (const site of ['deltoid', 'ventrogluteal', 'vastus_lateralis', 'subcutaneous']) {
    assert.match(injectionSeed, new RegExp(`'${site}'`))
  }
  for (const source of [
    'cdc_2026', 'cook_2006', 'larkin_2018', 'zaybak_2007',
    'open_rn_2023', 'fitter_forward_2025', 'spratt_2017', 'fda_xyosted_2019',
  ]) {
    assert.match(injectionSeed, new RegExp(`'${source}'`))
  }
  assert.match(injectionSeed, /'lipohypertrophy'/)

  const chelationSeed = read('supabase/_pipeline/13_supplements/327a_chelation_mineral_membership.sql')
  assert.match(chelationSeed, /wr_chelation_timing/)
  assert.match(chelationSeed, /INSERT INTO supplements\.substance_group_memberships/)
})
