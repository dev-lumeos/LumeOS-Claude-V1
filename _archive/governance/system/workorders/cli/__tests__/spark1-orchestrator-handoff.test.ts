import assert from 'node:assert/strict'
import { afterEach, beforeEach, describe, it } from 'node:test'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { runDryRun } from '../batch-operator'
import { loadBatch, runDispatch } from '../batch-loader'
import { runSpark1OrchestratorHandoff } from '../spark1-orchestrator-handoff'
import { resolveOrchestrationMode } from '../orchestration-mode'

let tmpDir = ''
const realCwd = process.cwd()

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lumeos-spark1-handoff-'))
  for (const dir of [
    'system/workorders/nutrition/batches',
    'system/workorders/nutrition/drafts',
    'system/workorders/schemas',
    'system/agent-registry',
  ]) {
    fs.mkdirSync(path.join(tmpDir, dir), { recursive: true })
  }
  writeFixture()
  process.chdir(tmpDir)
})

afterEach(() => {
  process.chdir(realCwd)
  if (tmpDir) fs.rmSync(tmpDir, { recursive: true, force: true })
})

function write(relativePath: string, content: string): void {
  const fullPath = path.join(tmpDir, relativePath)
  fs.mkdirSync(path.dirname(fullPath), { recursive: true })
  fs.writeFileSync(fullPath, content, 'utf8')
}

function writeFixture(): void {
  write('system/agent-registry/model_routing.json', JSON.stringify({
    'orchestrator-agent': {
      default: {
        node: 'spark-a',
        port: 8001,
        model: 'qwen3.6-35b-fp8',
        endpoint: 'http://192.168.0.128:8001',
        temperature: 0,
        max_context: 800,
      },
    },
  }, null, 2))
  write('system/workorders/schemas/workorder.schema.json', JSON.stringify({
    type: 'object',
    required: ['workorder_id', 'agent_id', 'task', 'scope_files', 'acceptance_criteria', 'negative_constraints'],
    properties: {
      workorder_id: { type: 'string' },
      agent_id: { type: 'string' },
      task: { type: 'string' },
      scope_files: { type: 'array', items: { type: 'string' } },
      acceptance_criteria: { type: 'array', items: { type: 'string' } },
      negative_constraints: { type: 'array', items: { type: 'string' } },
      risk_category: { type: 'string' },
      requires_approval: { type: 'boolean' },
      blocked_by: { type: 'array', items: { type: 'string' } },
      documentation_impact: { type: 'object' },
    },
  }, null, 2))
  write('system/workorders/nutrition/batches/BATCH-test.md', [
    '# Batch',
    '',
    '## Status',
    'ready_to_run',
    '',
    '## Included Workorders',
    '| Order | File | Workorder ID | Title | Risk | Approval |',
    '|---|---|---|---|---|---|',
    '| 1 | WO-test-001.md | WO-test-001 | Docs | docs | no |',
  ].join('\n'))
  write('system/workorders/nutrition/drafts/WO-test-001.md', [
    '```yaml',
    'workorder_id: WO-test-001',
    'agent_id: docs-agent',
    'task: Write a local docs report.',
    'risk_category: docs',
    'requires_approval: false',
    'blocked_by: []',
    'scope_files: ["docs/project/test.md"]',
    'documentation_impact:',
    '  required: false',
    '  domains:',
    '    - "none"',
    '  ssot_files: []',
    '  documentation_agent_required: false',
    '  na_reason: "Spark1 handoff fixture does not change SSOT docs or accepted behavior."',
    'acceptance_criteria: ["docs updated"]',
    'negative_constraints: ["no db work", "no supabase", "no queue edit", "no runtime edit"]',
    '```',
  ].join('\n'))
}

function batchPath(): string {
  return path.join(tmpDir, 'system/workorders/nutrition/batches/BATCH-test.md')
}

function validSpark1Intent(assignedAgent = 'docs-agent'): string {
  return JSON.stringify({
    selected_agent: 'micro-executor',
    risk_level: 'low',
    risks: [],
    execution_order: ['assign WO-test-001 to docs-agent'],
    required_gates: ['files-scope-gate', 'review-gate'],
    stop_conditions: [],
    worker_assignments: [
      { workorder_id: 'WO-test-001', assigned_agent: assignedAgent, rationale: 'existing governed route is appropriate' },
    ],
  })
}

describe('Spark1 orchestrator handoff', () => {
  it('accepts valid Spark1 worker assignment intent', async () => {
    const batch = loadBatch(batchPath())
    const result = await runSpark1OrchestratorHandoff(batch, {
      skipRuntimeCheck: true,
      callModel: async () => validSpark1Intent(),
    })

    assert.equal(result.ok, true)
    assert.equal(result.orchestration.actual_orchestration_mode, 'spark1_orchestrated')
    assert.equal(result.orchestration.spark1_orchestrator_used, true)
    assert.equal(result.orchestration.codex_role, 'none')
    assert.match(result.orchestration.worker_assignment_result, /WO-test-001->docs-agent/)
  })

  it('blocks invalid Spark1 worker assignment intent', async () => {
    const batch = loadBatch(batchPath())
    const result = await runSpark1OrchestratorHandoff(batch, {
      skipRuntimeCheck: true,
      callModel: async () => validSpark1Intent('micro-executor'),
    })

    assert.equal(result.ok, false)
    assert.equal(result.orchestration.blocks_dispatch, true)
    assert.match(result.detail, /current governed workorder route is docs-agent/)
  })

  it('surfaces handoff failures as orchestration_blocked dispatch outcomes', async () => {
    const batch = loadBatch(batchPath())
    const orchestration = resolveOrchestrationMode('spark1_orchestrated')
    const outcomes = await runDispatch(batch, {
      orchestration,
      spark1Handoff: async () => ({
        ok: false,
        orchestration: {
          ...orchestration,
          blocks_dispatch: true,
          missing_integration_point: 'Spark1 endpoint unavailable',
          reason: 'Spark1/orchestrator-agent endpoint is unhealthy or unavailable.',
        },
        assignments: [],
        detail: 'Spark1 endpoint unavailable',
      }),
    })

    assert.equal(outcomes[0]?.status, 'orchestration_blocked')
    assert.equal(orchestration.blocks_dispatch, true)
    assert.match(orchestration.missing_integration_point, /Spark1 endpoint unavailable/)
  })

  it('dry-run invokes Spark1 handoff when spark1_orchestrated is requested', async () => {
    const handoff = await runSpark1OrchestratorHandoff(loadBatch(batchPath()), {
      skipRuntimeCheck: true,
      callModel: async () => validSpark1Intent(),
    })
    const result = await runDryRun(batchPath(), {
      orchestrationMode: 'spark1_orchestrated',
      spark1Handoff: async () => handoff,
    })

    assert.equal(result.exitCode, 0)
    assert.match(result.report, /actual_orchestration_mode: spark1_orchestrated/)
    assert.match(result.report, /spark1_orchestrator_used: yes/)
    assert.match(result.report, /worker_assignment_result: WO-test-001->docs-agent/)
  })
})
