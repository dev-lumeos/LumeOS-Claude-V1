import assert from 'node:assert/strict'
import { describe, it, beforeEach, afterEach } from 'node:test'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { runSsotSyncCheck } from '../ssot-sync-check'

let tmpDir = ''

function setup(): void {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lumeos-ssot-sync-'))
}

function cleanup(): void {
  if (tmpDir) fs.rmSync(tmpDir, { recursive: true, force: true })
}

beforeEach(setup)
afterEach(cleanup)

function write(relativePath: string, content = 'content\n'): void {
  const fullPath = path.join(tmpDir, relativePath)
  fs.mkdirSync(path.dirname(fullPath), { recursive: true })
  fs.writeFileSync(fullPath, content, 'utf8')
}

describe('SSOT sync checker', () => {
  it('reports runtime/model routing changes without mapped SSOT docs', () => {
    write('system/agent-registry/model_routing.json', '{}\n')

    const result = runSsotSyncCheck({
      repoRoot: tmpDir,
      gitStatus: ' M system/agent-registry/model_routing.json\n',
    })

    assert.equal(result.summary.high, 1)
    assert.equal(result.findings[0]?.id, 'ssot_sync.runtime_model.missing_ssot_update')
  })

  it('allows runtime/model routing changes when mapped SSOT docs are touched', () => {
    write('system/agent-registry/model_routing.json', '{}\n')
    write('docs/project/STACK_REFERENCE.md', '# Stack\n')

    const result = runSsotSyncCheck({
      repoRoot: tmpDir,
      gitStatus: [
        ' M system/agent-registry/model_routing.json',
        ' M docs/project/STACK_REFERENCE.md',
      ].join('\n'),
    })

    assert.equal(result.findings.length, 0)
  })

  it('reports workflow/operator changes without runbook handover or TODO SSOT docs', () => {
    write('system/workorders/cli/run-batch-operator.ts', 'export {}\n')

    const result = runSsotSyncCheck({
      repoRoot: tmpDir,
      gitStatus: ' M system/workorders/cli/run-batch-operator.ts\n',
    })

    assert.equal(result.summary.medium, 1)
    assert.equal(result.findings[0]?.id, 'ssot_sync.workflow_governance.missing_ssot_update')
  })

  it('reports product-gate changes without gate SSOT docs', () => {
    write('system/project-profiles/profiles/lumeos.json', '{}\n')

    const result = runSsotSyncCheck({
      repoRoot: tmpDir,
      gitStatus: ' M system/project-profiles/profiles/lumeos.json\n',
    })

    assert.equal(result.summary.high, 1)
    assert.equal(result.findings[0]?.id, 'ssot_sync.product_gate.missing_ssot_update')
  })

  it('accepts a structured auditable N/A marker', () => {
    write('system/workorders/cli/run-batch-operator.ts', [
      '// SSOT_SYNC' + '_CHECK: N/A (domain=workflow_governance; reason=refactor only changes private helper names and no operator behavior, runbook, gate, or TODO semantics change)',
      'export {}',
      '',
    ].join('\n'))

    const result = runSsotSyncCheck({
      repoRoot: tmpDir,
      gitStatus: ' M system/workorders/cli/run-batch-operator.ts\n',
    })

    assert.equal(result.findings.length, 0)
    assert.equal(result.na_declarations.length, 1)
  })
})
