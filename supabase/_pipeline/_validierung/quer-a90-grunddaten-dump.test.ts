#!/usr/bin/env node
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'

import { berechneQuellPruefsumme, pruefeGrunddatenManifest } from '../grunddaten-pruefen'

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

function schreibeA94Fixture(root: string): string {
  const manifestPath = 'manifest.json'
  fs.writeFileSync(path.join(root, 'quelle.txt'), 'stand-a', 'utf8')
  fs.writeFileSync(path.join(root, 'grunddaten.dump'), 'dump-a', 'utf8')
  fs.writeFileSync(path.join(root, manifestPath), JSON.stringify({
    format_version: 1,
    created_at: '2026-10-01T00:00:00.000Z',
    source_database: 'wegwerf_a94',
    source_chain_step: 'zwischenstand',
    dump: {
      path: 'grunddaten.dump',
      sha256: sha256('dump-a'),
      bytes: Buffer.byteLength('dump-a'),
    },
    sources: [{ path: 'quelle.txt', sha256: sha256('stand-a') }],
  }), 'utf8')
  return manifestPath
}

function erneuereA94(root: string, manifestPath: string) {
  return spawnSync(process.execPath, [
    '--import', 'tsx',
    path.resolve('supabase/_pipeline/grunddaten-erneuern.ts'),
    'rehash',
    '--root', root,
    '--manifest', manifestPath,
    '--reason', 'A-94 Gegenprobe: quellneutrale Ausfuehrungsaenderung',
  ], { cwd: process.cwd(), encoding: 'utf8' })
}

test('A-94: ein begruendeter Quellen-Nachzug laesst Dump und Herkunft unveraendert', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'lumeos-a94-rehash-'))
  try {
    const manifestPath = schreibeA94Fixture(root)
    fs.writeFileSync(path.join(root, 'quelle.txt'), 'stand-b', 'utf8')

    const result = erneuereA94(root, manifestPath)

    assert.equal(result.status, 0, result.stderr)
    const manifest = JSON.parse(fs.readFileSync(path.join(root, manifestPath), 'utf8'))
    assert.equal(manifest.created_at, '2026-10-01T00:00:00.000Z')
    assert.equal(manifest.source_database, 'wegwerf_a94')
    assert.equal(manifest.dump.sha256, sha256('dump-a'))
    assert.equal(manifest.sources[0].sha256, sha256('stand-b'))
    assert.equal(manifest.source_compatibility_checks.length, 1)
    assert.equal(manifest.source_compatibility_checks[0].changes[0].previous_sha256, sha256('stand-a'))
    assert.equal(manifest.source_compatibility_checks[0].changes[0].compatible_sha256, sha256('stand-b'))
    assert.doesNotThrow(() => pruefeGrunddatenManifest({ root, manifestPath }))
    assert.deepEqual(fs.readdirSync(root).filter(name => name.endsWith('.tmp')), [])
  } finally {
    fs.rmSync(root, { recursive: true, force: true })
  }
})

test('A-94: ein manipulierter Dump verhindert den Quellen-Nachzug atomar', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'lumeos-a94-dump-'))
  try {
    const manifestPath = schreibeA94Fixture(root)
    const manifestFile = path.join(root, manifestPath)
    const vorher = fs.readFileSync(manifestFile, 'utf8')
    fs.writeFileSync(path.join(root, 'quelle.txt'), 'stand-b', 'utf8')
    fs.writeFileSync(path.join(root, 'grunddaten.dump'), 'dump-manipuliert', 'utf8')

    const result = erneuereA94(root, manifestPath)

    assert.notEqual(result.status, 0)
    assert.match(result.stderr, /Dump(?:groesse| geaendert)/)
    assert.equal(fs.readFileSync(manifestFile, 'utf8'), vorher)
    assert.deepEqual(fs.readdirSync(root).filter(name => name.endsWith('.tmp')), [])
  } finally {
    fs.rmSync(root, { recursive: true, force: true })
  }
})

test('A-94: Validierungsproben gehoeren nicht zum Datenherkunftshash', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'lumeos-a94-chain-'))
  try {
    fs.mkdirSync(path.join(root, '_validierung'))
    fs.writeFileSync(path.join(root, 'produzent.sql'), 'select 1;', 'utf8')
    fs.writeFileSync(path.join(root, '_validierung', 'probe.test.ts'), 'stand-a', 'utf8')
    fs.writeFileSync(path.join(root, 'ende.sql'), 'select 2;', 'utf8')
    fs.writeFileSync(path.join(root, 'kette.json'), JSON.stringify({
      steps: [
        { id: 'produzent', path: 'produzent.sql' },
        { id: 'probe', path: '_validierung/probe.test.ts' },
        { id: 'ende', path: 'ende.sql' },
      ],
    }), 'utf8')
    const source = { path: 'kette.json', sha256: '', kind: 'chain' as const, through_step: 'ende' }
    const vorher = berechneQuellPruefsumme(root, source)

    fs.writeFileSync(path.join(root, '_validierung', 'probe.test.ts'), 'stand-b', 'utf8')
    const nachProbe = berechneQuellPruefsumme(root, source)
    fs.writeFileSync(path.join(root, 'produzent.sql'), 'select 3;', 'utf8')
    const nachProduzent = berechneQuellPruefsumme(root, source)

    assert.equal(nachProbe, vorher)
    assert.notEqual(nachProduzent, vorher)
  } finally {
    fs.rmSync(root, { recursive: true, force: true })
  }
})
