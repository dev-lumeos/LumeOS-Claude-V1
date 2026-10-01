import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'

const CHECKER = 'tools/kettenlauf-status-pruefen.mjs'
const DAILY_RUNNER = 'tools/kettenlauf-taeglich.mjs'

function run(...args) {
  return spawnSync(process.execPath, [CHECKER, ...args], {
    cwd: process.cwd(),
    encoding: 'utf8',
  })
}

test('C-416: ein fehlgeschlagener Tageslauf wird vom Waechter rot gemeldet', () => {
  const dir = mkdtempSync(join(tmpdir(), 'lumeos-c416-'))
  const status = join(dir, 'kettenlauf-status.json')
  try {
    writeFileSync(status, JSON.stringify({
      version: 1,
      status: 'failed',
      finished_at: new Date().toISOString(),
      database: 'lumeos_c416_broken',
      exit_code: 1,
    }))

    const result = run('--status', status)

    assert.equal(result.status, 1)
    assert.match(result.stderr, /\[kettenlauf\] ROT: letzter Lauf fehlgeschlagen/)
    assert.match(result.stderr, /lumeos_c416_broken/)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

test('C-416: ein eingebauter Kettenbruch schreibt den roten Status', () => {
  const dir = mkdtempSync(join(tmpdir(), 'lumeos-c416-'))
  const manifest = join(dir, 'bruch.json')
  const status = join(dir, 'kettenlauf-status.json')
  try {
    writeFileSync(manifest, JSON.stringify({
      name: 'C-416 test break',
      version: 1,
      steps: [{
        id: 'bruch',
        path: 'supabase/_pipeline/nicht-vorhanden.sql',
        kind: 'sql',
        creates: 'absichtlicher Bruch',
        depends_on: [],
      }],
    }))

    const dailyResult = spawnSync(process.execPath, [DAILY_RUNNER,
      '--manifest', manifest,
      '--status', status,
      '--database', 'lumeos_c416_broken',
    ], { cwd: process.cwd(), encoding: 'utf8' })

    assert.equal(dailyResult.status, 1)
    const report = JSON.parse(readFileSync(status, 'utf8'))
    assert.equal(report.status, 'failed')
    assert.equal(report.database, 'lumeos_c416_broken')

    const check = run('--status', status)
    assert.equal(check.status, 1)
    assert.match(check.stderr, /lumeos_c416_broken/)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

test('C-416: ein frischer gruener Tageslauf bleibt still', () => {
  const dir = mkdtempSync(join(tmpdir(), 'lumeos-c416-'))
  const status = join(dir, 'kettenlauf-status.json')
  try {
    writeFileSync(status, JSON.stringify({
      version: 1,
      status: 'passed',
      finished_at: new Date().toISOString(),
      database: 'lumeos_c416_green',
      duration_seconds: 266.6,
      exit_code: 0,
    }))

    const result = run('--status', status)

    assert.equal(result.status, 0)
    assert.match(result.stdout, /\[kettenlauf\] gruen: letzter Lauf vor 0h/)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

test('C-416: die Bereinigung beendet keine fremden Superuser-Verbindungen', () => {
  const source = readFileSync('supabase/_pipeline/kette-ausfuehren.ts', 'utf8')

  assert.match(source, /WHERE datname = '\$\{db\.replace[\s\S]+?\}'\s+AND usename = current_user;/)
})

function writeA91Fakes(dir) {
  const runner = join(dir, 'runner.mjs')
  const publisher = join(dir, 'publisher.mjs')
  writeFileSync(runner, `
    import { writeFileSync } from 'node:fs'
    const index = process.argv.indexOf('--checkpoint-dump')
    if (index >= 0) writeFileSync(process.argv[index + 1], 'candidate')
    process.exit(Number(process.env.A91_FAKE_RUNNER_EXIT ?? 0))
  `)
  writeFileSync(publisher, `
    import { writeFileSync } from 'node:fs'
    writeFileSync(process.env.A91_FAKE_PUBLISH_MARKER, 'called')
  `)
  return { runner, publisher }
}

test('A-91: ein roter Vollauf verwirft den Kandidaten und veroeffentlicht keinen Dump', () => {
  const dir = mkdtempSync(join(tmpdir(), 'lumeos-a91-red-'))
  const status = join(dir, 'status.json')
  const marker = join(dir, 'published')
  const { runner, publisher } = writeA91Fakes(dir)
  try {
    const result = spawnSync(process.execPath, [DAILY_RUNNER,
      '--manifest', join(dir, 'voll.json'),
      '--status', status,
      '--database', 'lumeos_a91_red',
      '--dump-dir', dir,
    ], {
      cwd: process.cwd(),
      encoding: 'utf8',
      env: {
        ...process.env,
        A91_FAKE_RUNNER_EXIT: '23',
        A91_FAKE_PUBLISH_MARKER: marker,
        LUMEOS_KETTEN_RUNNER: runner,
        LUMEOS_GRUNDDATEN_PUBLISHER: publisher,
      },
    })

    assert.notEqual(result.status, 0)
    assert.equal(existsSync(marker), false)
    assert.equal(JSON.parse(readFileSync(status, 'utf8')).status, 'failed')
    assert.equal(
      readdirSync(dir).some(name => name.endsWith('.tmp')),
      false,
    )
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

test('A-91: erst ein gruener Vollauf ruft die atomare Veroeffentlichung auf', () => {
  const dir = mkdtempSync(join(tmpdir(), 'lumeos-a91-green-'))
  const status = join(dir, 'status.json')
  const marker = join(dir, 'published')
  const { runner, publisher } = writeA91Fakes(dir)
  try {
    const result = spawnSync(process.execPath, [DAILY_RUNNER,
      '--manifest', join(dir, 'voll.json'),
      '--status', status,
      '--database', 'lumeos_a91_green',
      '--dump-dir', dir,
    ], {
      cwd: process.cwd(),
      encoding: 'utf8',
      env: {
        ...process.env,
        A91_FAKE_PUBLISH_MARKER: marker,
        LUMEOS_KETTEN_RUNNER: runner,
        LUMEOS_GRUNDDATEN_PUBLISHER: publisher,
      },
    })

    assert.equal(result.status, 0)
    assert.equal(readFileSync(marker, 'utf8'), 'called')
    assert.equal(JSON.parse(readFileSync(status, 'utf8')).status, 'passed')
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})
