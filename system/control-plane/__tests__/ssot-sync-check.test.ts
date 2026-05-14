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
  it('reports OPEN_TODOS and TODO register open item drift', () => {
    write('docs/project/OPEN_TODOS.md', [
      '# Open',
      '',
      '### GOV-TODO-001: Runtime policy',
      '',
    ].join('\n'))
    write('docs/project/GOVERNANCE_TODO_REGISTER.json', JSON.stringify({
      items: [
        { id: 'GOV-TODO-001', status: 'open', title: 'Runtime policy' },
        { id: 'GOV-TODO-002', status: 'open', title: 'Missing from markdown' },
      ],
    }))

    const result = runSsotSyncCheck({ repoRoot: tmpDir, gitStatus: '' })

    assert.equal(result.summary.medium, 1)
    assert.equal(result.findings[0]?.id, 'ssot_sync.open_todos.register_mismatch')
  })

  it('allows OPEN_TODOS and TODO register when open IDs match', () => {
    write('docs/project/OPEN_TODOS.md', [
      '# Open',
      '',
      '### GOV-TODO-001: Runtime policy',
      '### GOV-TODO-002: MiniMax lab',
      '',
    ].join('\n'))
    write('docs/project/GOVERNANCE_TODO_REGISTER.json', JSON.stringify({
      items: [
        { id: 'GOV-TODO-001', status: 'open', title: 'Runtime policy' },
        { id: 'GOV-TODO-002', status: 'open', title: 'MiniMax lab' },
        { id: 'GOV-TODO-003', status: 'done', title: 'Closed' },
      ],
    }))

    const result = runSsotSyncCheck({ repoRoot: tmpDir, gitStatus: '' })

    assert.equal(result.findings.some(item => item.id === 'ssot_sync.open_todos.register_mismatch'), false)
  })

  it('reports runtime role drift across stack reference and model tier docs', () => {
    write('docs/project/STACK_REFERENCE.md', 'DGX1 / Spark1 orchestrator-agent\nDGX2 / Spark2 coding/docs worker\nDGX3 / Spark3 controlled reviewer/specialist candidate\nDGX4/5 MiniMax M2.7 NVFP4 lab-only\n')
    write('system/model-tiers/model_registry_v2.md', 'DGX1 / Spark1 orchestrator-agent\nDGX2 / Spark2 coding/docs worker\nDGX3 / Spark3 coding worker\nDGX4/5 MiniMax M2.7 NVFP4 lab-only\n')
    write('system/model-tiers/model_tiers_v2.md', 'DGX1 / Spark1 orchestrator-agent\nDGX2 / Spark2 coding/docs worker\nDGX3 / Spark3 controlled reviewer/specialist candidate\nDGX4/5 MiniMax M2.7 NVFP4 lab-only\n')

    const result = runSsotSyncCheck({ repoRoot: tmpDir, gitStatus: '' })

    assert.equal(result.findings.some(item => item.id === 'ssot_sync.runtime_roles.cross_file_mismatch'), true)
  })

  it('reports active handover claiming a done TODO remains blocked', () => {
    write('docs/project/CURRENT_GOVERNANCE_HANDOVER.md', 'GOV-TODO-001 remains blocked_pending_tom_decision for current work.\n')
    write('docs/project/GOVERNANCE_TODO_REGISTER.json', JSON.stringify({
      items: [
        { id: 'GOV-TODO-001', status: 'done', title: 'Closed boundary' },
      ],
    }))

    const result = runSsotSyncCheck({ repoRoot: tmpDir, gitStatus: '' })

    assert.equal(result.findings.some(item => item.id === 'ssot_sync.handover.done_todo_claimed_blocked'), true)
  })

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

    assert.equal(result.findings.some(item => item.id === 'ssot_sync.runtime_model.missing_ssot_update'), false)
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
