import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'

const TOOL = path.join(process.cwd(), 'tools', 'supplement-kern-dubletten-pruefen.mjs')

function run(report) {
  execFileSync(process.execPath, [TOOL], {
    env: { ...process.env, C276_REPORT: report },
    encoding: 'utf8',
  })
}

test('der Dublettenbericht bleibt bei gleichem Befund bytegleich', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'lumeos-c276-'))
  const report = path.join(dir, 'report.json')

  try {
    run(report)
    const first = fs.readFileSync(report, 'utf8')
    assert.equal(Object.hasOwn(JSON.parse(first), 'checked_at'), false)

    run(report)
    assert.equal(fs.readFileSync(report, 'utf8'), first)
  } finally {
    fs.rmSync(dir, { recursive: true, force: true })
  }
})
