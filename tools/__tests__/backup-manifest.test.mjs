import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'

const root = process.cwd()
const script = join(root, 'tools', 'backup-manifest.mjs')

test('C-216: Manifest inventarisiert Backup-Dateien nach Zweck, ohne sie zu verändern', () => {
  const fixture = mkdtempSync(join(tmpdir(), 'lumeos-backup-manifest-'))
  const output = join(fixture, 'manifest.json')
  try {
    writeFileSync(join(fixture, 'g329-schirm.png'), 'screen', 'utf8')
    writeFileSync(join(fixture, 'c400-probe.mjs'), 'probe', 'utf8')
    writeFileSync(join(fixture, 'c380-before.sql'), 'snapshot', 'utf8')
    writeFileSync(join(fixture, 'unclassified.bin'), 'other', 'utf8')

    execFileSync(process.execPath, [script, '--root', fixture, '--out', output], {
      cwd: root,
      encoding: 'utf8',
    })

    const manifest = JSON.parse(readFileSync(output, 'utf8'))
    assert.equal(manifest.safety, 'read-only inventory; no source file is deleted, moved, or archived')
    assert.equal(manifest.summary.files, 4)
    assert.deepEqual(
      manifest.files.map(({ path, purpose, workItem }) => ({ path, purpose, workItem })),
      [
        { path: 'c380-before.sql', purpose: 'database_snapshot', workItem: 'C-380' },
        { path: 'c400-probe.mjs', purpose: 'probe_script', workItem: 'C-400' },
        { path: 'g329-schirm.png', purpose: 'screenshot', workItem: 'G-329' },
        { path: 'unclassified.bin', purpose: 'unclassified', workItem: null },
      ],
    )
    assert.equal(readFileSync(join(fixture, 'g329-schirm.png'), 'utf8'), 'screen')
    assert.equal(readFileSync(join(fixture, 'c400-probe.mjs'), 'utf8'), 'probe')
    assert.equal(readFileSync(join(fixture, 'c380-before.sql'), 'utf8'), 'snapshot')
  } finally {
    rmSync(fixture, { recursive: true, force: true })
  }
})
