// G-660: der taegliche Beitragslauf. Gegen einen Schein-PostgREST in diesem Prozess —
// nie gegen die laufende Datenbank. Geprueft wird die Wirkung: Reihenfolge, Schluessel,
// Statusdatei, Exit-Code und dass der Waechter einen roten Lauf rot meldet.
import assert from 'node:assert/strict'
import { spawn, spawnSync } from 'node:child_process'
import { createServer } from 'node:http'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'

const LAEUFER = 'tools/beitragslauf-taeglich.py'
const CHECKER = 'tools/kettenlauf-status-pruefen.mjs'

async function mitServer(antwort, fn) {
  const anfragen = []
  const server = createServer((req, res) => {
    let rumpf = ''
    req.on('data', c => { rumpf += c })
    req.on('end', () => {
      anfragen.push({ url: req.url, profil: req.headers['content-profile'], schluessel: req.headers.authorization, rumpf })
      const [code, body] = antwort(req.url)
      res.writeHead(code, { 'Content-Type': 'application/json' }).end(JSON.stringify(body))
    })
  })
  await new Promise(r => server.listen(0, '127.0.0.1', r))
  try {
    return await fn(`http://127.0.0.1:${server.address().port}`, anfragen)
  } finally {
    server.close()
  }
}

function laufen(url, dir, ...extra) {
  return new Promise(resolve => {
    const p = spawn('python', [LAEUFER, '--status', join(dir, 's.json'), '--protokoll', join(dir, 'l.log'), ...extra], {
      env: { ...process.env, SUPABASE_URL: url, SUPABASE_SERVICE_ROLE_KEY: 'probe-schluessel' }, windowsHide: true,
    })
    let err = ''
    p.stderr.on('data', c => { err += c })
    p.on('close', code => resolve({ code, err }))
  })
}

test('G-660: gruen — beide Funktionen in der Reihenfolge, als service_role, im Schema goals', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'lumeos-g660-'))
  try {
    await mitServer(() => [200, { geschriebene_zeilen: 3 }], async (url, anfragen) => {
      const r = await laufen(url, dir)
      assert.equal(r.code, 0, r.err)
      assert.deepEqual(anfragen.map(a => a.url), ['/rest/v1/rpc/run_goal_contribution_catchup', '/rest/v1/rpc/record_weekly_adjustments'])
      assert.ok(anfragen.every(a => a.profil === 'goals' && a.schluessel === 'Bearer probe-schluessel'))
      assert.ok(anfragen.every(a => a.rumpf === '{}'), 'ohne --nur gehen keine Argumente mit (Vorgabe: bis gestern, alle Konten)')
    })
    const s = JSON.parse(readFileSync(join(dir, 's.json'), 'utf8'))
    assert.equal(s.status, 'passed')
    assert.equal(s.schritte.length, 2)
    assert.match(readFileSync(join(dir, 'l.log'), 'utf8'), / passed run_goal_contribution_catchup=passed record_weekly_adjustments=passed/)
    const c = spawnSync(process.execPath, [CHECKER, '--status', join(dir, 's.json'), '--name', 'beitragslauf'], { encoding: 'utf8' })
    assert.equal(c.status, 0, c.stderr)
    assert.match(c.stdout, /\[beitragslauf\] gruen/)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

test('G-660: rot — Schritt 1 scheitert, Schritt 2 laeuft nicht, der Waechter meldet den Schritt', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'lumeos-g660-'))
  try {
    await mitServer(u => (u.endsWith('run_goal_contribution_catchup') ? [500, { message: 'probe kaputt' }] : [200, {}]), async (url, anfragen) => {
      const r = await laufen(url, dir)
      assert.equal(r.code, 1)
      assert.equal(anfragen.length, 1, 'Schritt 2 lief trotz rotem Schritt 1')
    })
    const s = JSON.parse(readFileSync(join(dir, 's.json'), 'utf8'))
    assert.equal(s.status, 'failed')
    assert.deepEqual(s.schritte.map(x => x.status), ['failed', 'uebersprungen'])
    const c = spawnSync(process.execPath, [CHECKER, '--status', join(dir, 's.json'), '--name', 'beitragslauf'], { encoding: 'utf8' })
    assert.equal(c.status, 1)
    assert.match(c.stderr, /\[beitragslauf\] ROT: letzter Lauf fehlgeschlagen \(Schritt run_goal_contribution_catchup: HTTP 500/)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

test('G-660: --nur schraenkt auf die genannten Konten ein', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'lumeos-g660-'))
  try {
    await mitServer(() => [200, {}], async (url, anfragen) => {
      const r = await laufen(url, dir, '--nur', 'a1,b2')
      assert.equal(r.code, 0, r.err)
      assert.ok(anfragen.every(a => a.rumpf === '{"p_user_ids": ["a1", "b2"]}'), anfragen[0]?.rumpf)
    })
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})
