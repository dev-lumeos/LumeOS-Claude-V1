// A-96 — ein roter oder abgebrochener Nachtlauf raeumt hinter sich auf.
//
// `[cmd]` **03.10. rot, 06.10. abgebrochen:** beide liessen ihre Datenbank
// liegen (240 MB / 3,3 GB), der zweite auch einen halben Dump (418 MB),
// und der Status zeigte den gruenen Vortag. Tom hat von Hand entsorgt.
//
// `[read]` **Die Proben laufen auf echten Wegwerf-Datenbanken im Container,
// mit eigenem Praefix** (`lumeos_a96probe`) — der echte Nachtlauf
// (`lumeos_tageskette_*`) und die rund zwanzig fremden Datenbanken bleiben
// unberuehrt. `lumeos_andere` und ein Name, der dem Muster nur AEHNELT,
// muessen stehen bleiben.
import assert from 'node:assert/strict'
import { spawn, spawnSync } from 'node:child_process'
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'

const DAILY = 'tools/kettenlauf-taeglich.mjs'
const CONTAINER = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const PRAEFIX = 'lumeos_a96probe'
const DB = `${PRAEFIX}_20000101`

function psql(sql) {
  const r = spawnSync('docker', ['exec', CONTAINER, 'psql', '-U', 'postgres', '-d', 'postgres',
    '-v', 'ON_ERROR_STOP=1', '-Atc', sql], { encoding: 'utf8' })
  assert.equal(r.status, 0, r.stderr)
  return r.stdout.trim()
}
const gibt = name => psql(`SELECT count(*) FROM pg_database WHERE datname = '${name}'`) === '1'
const anlegen = name => { if (!gibt(name)) psql(`CREATE DATABASE "${name}"`) }
const weg = name => psql(`DROP DATABASE IF EXISTS "${name}"`)

function buehne() {
  const dir = mkdtempSync(join(tmpdir(), 'lumeos-a96-'))
  const runner = join(dir, 'runner.mjs')
  const publisher = join(dir, 'publisher.mjs')
  // Wie kette-ausfuehren.ts: erst die Datenbank anlegen, dann den halben
  // Dump schreiben — danach Exit, oder er haengt. `[read]` **Legt die
  // Probe die Datenbank VOR dem Start an, raeumt sie schon die
  // Startbereinigung weg** — und der Rot-Test waere aus dem falschen
  // Grund gruen.
  writeFileSync(runner, `
    import { writeFileSync } from 'node:fs'
    import { spawnSync } from 'node:child_process'
    const d = process.argv[process.argv.indexOf('--database') + 1]
    spawnSync('docker', ['exec', '${CONTAINER}', 'psql', '-U', 'postgres', '-d', 'postgres',
      '-c', 'CREATE DATABASE "' + d + '"'])
    const i = process.argv.indexOf('--checkpoint-dump')
    writeFileSync(process.argv[i + 1], 'halber dump')
    if (process.env.A96_HAENGT) setTimeout(() => {}, 600000)
    else {
      const exit = Number(process.env.A96_EXIT ?? 0)
      // Bei Gruen loescht kette-ausfuehren.ts seine Datenbank selbst.
      if (exit === 0) spawnSync('docker', ['exec', '${CONTAINER}', 'psql', '-U', 'postgres',
        '-d', 'postgres', '-c', 'DROP DATABASE "' + d + '"'])
      process.exit(exit)
    }
  `)
  writeFileSync(publisher, 'process.exit(0)\n')
  const env = { ...process.env, LUMEOS_KETTEN_RUNNER: runner, LUMEOS_GRUNDDATEN_PUBLISHER: publisher }
  const args = ['--manifest', join(dir, 'voll.json'), '--status', join(dir, 'status.json'),
    '--database', DB, '--praefix', PRAEFIX, '--dump-dir', join(dir, 'daten')]
  return { dir, env, args, status: () => JSON.parse(readFileSync(join(dir, 'status.json'), 'utf8')) }
}
const tmps = dir => existsSync(join(dir, 'daten'))
  ? readdirSync(join(dir, 'daten')).filter(n => n.endsWith('.tmp')) : []

test('A-96: ein roter Lauf loescht Datenbank und .tmp, Status failed mit log_ende, Log bleibt', () => {
  const b = buehne()
  try {
    const r = spawnSync(process.execPath, [DAILY, ...b.args],
      { encoding: 'utf8', env: { ...b.env, A96_EXIT: '7' } })
    assert.equal(r.status, 7)
    assert.equal(gibt(DB), false, 'die Datenbank des roten Laufs liegt noch')
    assert.deepEqual(tmps(b.dir), [], 'der halbe Dump liegt noch')
    const s = b.status()
    assert.equal(s.status, 'failed')
    assert.ok(Array.isArray(s.log_ende))
    assert.ok(existsSync(s.log), 'das Log ist weg — es ist der Beleg')
    assert.equal(existsSync(join(b.dir, `kettenlauf-laufend-${PRAEFIX}.json`)), false)
  } finally {
    weg(DB)
    rmSync(b.dir, { recursive: true, force: true })
  }
})

test('A-96: nach einem Abbruch raeumt der naechste Start auf — nur die Muster', async () => {
  const b = buehne()
  const fremde = ['lumeos_andere', `${PRAEFIX}_20000101_kopie`]
  try {
    for (const f of fremde) anlegen(f)

    // ── Der Lauf haengt und wird beendet (wie beim Freeze) ──────────
    const p = spawn(process.execPath, [DAILY, ...b.args],
      { env: { ...b.env, A96_HAENGT: '1' }, stdio: 'ignore' })
    const marke = join(b.dir, `kettenlauf-laufend-${PRAEFIX}.json`)
    for (let i = 0; i < 300 && !(existsSync(marke) && tmps(b.dir).length); i++) {
      await new Promise(r => setTimeout(r, 100))
    }
    assert.ok(existsSync(marke) && tmps(b.dir).length === 1, 'der Lauf kam nicht bis zum halben Dump')
    // Den ganzen Baum beenden — sonst haelt der haengende Laeufer die Datei.
    spawnSync('taskkill', ['/PID', String(p.pid), '/T', '/F'])
    await new Promise(r => p.once('exit', r))
    assert.ok(existsSync(marke), 'die Marke muss den Abbruch ueberleben')
    assert.equal(gibt(DB), true, 'der Laeufer hat seine Datenbank nicht angelegt')

    // ── Der naechste Start ──────────────────────────────────────────
    const r = spawnSync(process.execPath, [DAILY, ...b.args], { encoding: 'utf8', env: b.env })
    assert.equal(r.status, 0, r.stderr)
    const s = b.status()
    assert.equal(s.status, 'passed')
    assert.equal(s.vorlauf?.status, 'aborted')
    assert.equal(s.vorlauf?.database, DB)
    assert.deepEqual(s.aufgeraeumt?.datenbanken, [DB])
    assert.equal(s.aufgeraeumt?.dateien.length, 1)
    assert.match(s.aufgeraeumt.dateien[0], /^grunddaten-\d+-\d+\.tmp$/)
    assert.equal(gibt(DB), false)
    for (const f of fremde) assert.equal(gibt(f), true, `${f} wurde angefasst`)
    assert.equal(existsSync(marke), false)
  } finally {
    for (const f of [DB, ...fremde]) weg(f)
    rmSync(b.dir, { recursive: true, force: true })
  }
})

test('A-96: ein laufender Lauf wird nicht weggeraeumt', () => {
  const b = buehne()
  try {
    anlegen(DB)
    // Die Marke eines lebenden Prozesses — dieser hier.
    writeFileSync(join(b.dir, `kettenlauf-laufend-${PRAEFIX}.json`),
      JSON.stringify({ pid: process.pid, database: DB }))
    const r = spawnSync(process.execPath, [DAILY, ...b.args], { encoding: 'utf8', env: b.env })
    assert.equal(r.status, 1)
    assert.match(r.stderr, /laeuft noch/)
    assert.equal(gibt(DB), true, 'die Datenbank eines laufenden Laufs wurde geloescht')
  } finally {
    weg(DB)
    rmSync(b.dir, { recursive: true, force: true })
  }
})
