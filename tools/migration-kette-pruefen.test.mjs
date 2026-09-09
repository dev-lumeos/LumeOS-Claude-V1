import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'

import {
  classifyMigrations,
  KNOWN_NON_CHAIN_MIGRATIONS,
} from './migration-kette-pruefen.mjs'

test('C-446: ein neuer nicht verketteter Migrationspfad ist rot, bekannter Bestand bleibt sichtbar', () => {
  const report = classifyMigrations({
    migrationFiles: [
      'supabase/migrations/20260902070454_c385_qualify_body_measurement_context.sql',
      'supabase/migrations/20260815180000_search_events.sql',
      'supabase/migrations/20990101000000_new_unlisted_migration.sql',
    ],
    chainPaths: new Set([
      'supabase/migrations/20260902070454_c385_qualify_body_measurement_context.sql',
    ]),
    liveVersions: new Set(['20260902070454']),
    knownNonChain: new Set([
      '20260815180000_search_events.sql',
    ]),
  })

  assert.deepEqual(report.inChainLive, [
    '20260902070454_c385_qualify_body_measurement_context.sql',
  ])
  assert.deepEqual(report.knownNonChainNotLive, [
    '20260815180000_search_events.sql',
  ])
  assert.deepEqual(report.newNonChainNotLive, [
    '20990101000000_new_unlisted_migration.sql',
  ])
  assert.equal(report.hasNewFindings, true)
})

test('C-446: das Root-Gate ruft den Migrations-Ketten-Waechter auf', () => {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'))
  assert.match(pkg.scripts.gate, /node tools\/migration-kette-pruefen\.mjs/)
})

test('C-447: die drei auf dev angewandten Migrationsdateien sind eigene Kettenschritte, nicht Ausnahmestand', () => {
  const required = [
    'supabase/migrations/20260829003109_c327_substance_group_membership.sql',
    'supabase/migrations/20260902070117_c327a_chelation_mineral_membership.sql',
    'supabase/migrations/20260902073914_c366_effective_tag_readers.sql',
  ]
  const manifest = JSON.parse(fs.readFileSync('supabase/_pipeline/kette.json', 'utf8'))
  const chainPaths = new Set(manifest.steps.map(step => step.path))

  for (const migration of required) {
    assert.equal(chainPaths.has(migration), true, `${migration} fehlt in kette.json`)
    assert.equal(KNOWN_NON_CHAIN_MIGRATIONS.has(migration.split('/').at(-1)), false,
      `${migration} darf nicht mehr Ausnahmestand sein`)
  }
})
