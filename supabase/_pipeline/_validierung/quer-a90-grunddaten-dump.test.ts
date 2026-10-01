#!/usr/bin/env node
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'

import { pruefeGrunddatenManifest } from '../grunddaten-pruefen'

function sha256(content: string | Buffer): string {
  return createHash('sha256').update(content).digest('hex')
}

test('der eingecheckte Grunddaten-Dump passt zu seinen Quellen', () => {
  const result = pruefeGrunddatenManifest({
    root: process.cwd(),
    manifestPath: 'supabase/_pipeline/daten/grunddaten-dump.manifest.json',
  })

  assert.equal(result.sourcesChecked > 0, true)
  assert.equal(result.dumpBytes > 0, true)
})

test('eine unveraenderte Quelle ist gruen, dieselbe Quelle nach Aenderung rot', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'lumeos-a90-'))
  const sourcePath = 'quelle.txt'
  const dumpPath = 'grunddaten.dump'
  const manifestPath = 'manifest.json'
  fs.writeFileSync(path.join(root, sourcePath), 'stand-a', 'utf8')
  fs.writeFileSync(path.join(root, dumpPath), 'dump-a', 'utf8')
  fs.writeFileSync(path.join(root, manifestPath), JSON.stringify({
    format_version: 1,
    created_at: '2026-10-01T00:00:00.000Z',
    source_database: 'wegwerf_a90',
    source_chain_step: '537_backfill_materialized_meal_plan_days_count_daten',
    dump: {
      path: dumpPath,
      sha256: sha256('dump-a'),
      bytes: Buffer.byteLength('dump-a'),
    },
    sources: [{ path: sourcePath, sha256: sha256('stand-a') }],
  }), 'utf8')

  assert.doesNotThrow(() => pruefeGrunddatenManifest({ root, manifestPath }))

  fs.writeFileSync(path.join(root, sourcePath), 'stand-b', 'utf8')
  assert.throws(
    () => pruefeGrunddatenManifest({ root, manifestPath }),
    /Quelle geaendert: quelle\.txt/,
  )
})
