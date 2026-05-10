import assert from 'node:assert/strict'
import { afterEach, beforeEach, describe, it } from 'node:test'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { dispatchWorkorder, type Workorder } from '../dispatcher'
import type { CodexWorkerResult } from '../../workers/codex-worker'

let tmpDir = ''
const realCwd = process.cwd()

function write(relativePath: string, content: string): void {
  const fullPath = path.join(tmpDir, relativePath)
  fs.mkdirSync(path.dirname(fullPath), { recursive: true })
  fs.writeFileSync(fullPath, content, 'utf8')
}

function setup(): void {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lumeos-dispatcher-codex-'))
  process.chdir(tmpDir)
  write('system/workorders/schemas/workorder.schema.json', JSON.stringify({
    type: 'object',
    required: ['workorder_id', 'agent_id', 'task', 'scope_files', 'acceptance_criteria', 'negative_constraints'],
  }))
  write('system/agent-registry/agents.json', JSON.stringify({
    'senior-coding-agent': {
      type: 'executor_senior',
      spec_file: '.claude/agents/senior-coding-agent.md',
      always_load_skills: [],
      skill_token_budget: 2000,
      requires_human_approval: false,
    },
    'micro-executor': {
      type: 'executor',
      spec_file: '.claude/agents/micro-executor.md',
      always_load_skills: [],
      skill_token_budget: 2000,
      requires_human_approval: false,
    },
  }))
  write('system/agent-registry/model_routing.json', JSON.stringify({
    'senior-coding-agent': {
      default: {
        node: 'codex-cli',
        runtime_type: 'codex-cli',
        model: 'gpt-5.5',
        temperature: 0,
        max_context: 200000,
      },
    },
    'micro-executor': {
      default: {
        node: 'spark-b',
        model: 'qwen3-coder-next-fp8',
        temperature: 0,
        max_context: 32768,
      },
    },
  }))
  write('system/agent-registry/permissions.json', JSON.stringify({}))
  write('system/agent-registry/tool_profiles.json', JSON.stringify({ profiles: {} }))
  write('system/agent-registry/skill_registry.json', JSON.stringify({}))
  write('system/agent-registry/approval_operation_types.json', JSON.stringify({}))
  write('.claude/agents/senior-coding-agent.md', '# senior coding agent')
  write('.claude/agents/micro-executor.md', '# micro executor')
  write('system/workers/codex-worker.config.json', JSON.stringify({
    codex_worker_enabled: false,
    allow_dispatcher_integration: false,
    allowed_agents: ['senior-coding-agent'],
    require_explicit_workorder_flag: true,
    default_timeout_ms: 120000,
    max_timeout_ms: 300000,
  }))
}

function cleanup(): void {
  process.chdir(realCwd)
  if (tmpDir) fs.rmSync(tmpDir, { recursive: true, force: true })
}

beforeEach(setup)
afterEach(cleanup)

function makeWorkorder(overrides: Partial<Workorder> & Record<string, unknown> = {}): Workorder & Record<string, unknown> {
  return {
    workorder_id: 'WO-codex-001',
    agent_id: 'senior-coding-agent',
    task: 'Update one governance documentation file in the allowed scope only.',
    scope_files: ['docs/project/test.md'],
    context_files: [],
    acceptance_files: ['docs/project/test.md'],
    acceptance_criteria: ['Output file exists', 'No forbidden commands are used'],
    negative_constraints: ['No Supabase commands', 'No approvals', 'No runtime state edits', 'No queue edits'],
    required_skills: [],
    optional_skills: [],
    blocked_by: [],
    risk_category: 'docs',
    files_blocked: ['system/state/**', 'system/approval/**', 'supabase/**'],
    expected_outputs: ['docs/project/test.md'],
    source_refs: ['docs/project/GOVERNANCE_SYSTEM_COMPLETION_PLAN.md'],
    codex_worker: true,
    ...overrides,
  }
}

function doneResult(finalState: CodexWorkerResult['finalState']): CodexWorkerResult {
  return {
    mode: 'execute',
    exitCode: finalState === 'DONE' ? 0 : 1,
    command: 'codex',
    args: ['exec', '<prompt>'],
    durationMs: 10,
    prompt: 'prompt',
    stdout: `Final State: ${finalState}`,
    stderr: '',
    finalState,
  }
}

describe('dispatcher codex worker integration', () => {
  it('does not invoke Codex when config is disabled', async () => {
    let codexCalls = 0
    let modelCalls = 0
    const result = await dispatchWorkorder(makeWorkorder(), {
      callModel: async () => {
        modelCalls++
        return JSON.stringify({
          selected_agent: 'senior-coding-agent',
          risk_level: 'low',
          risks: [],
          execution_order: ['complete'],
          required_gates: ['files-scope-gate', 'review-gate', 'human-approval-gate'],
          stop_conditions: ['production_execution_without_approval_token'],
        })
      },
      executeTool: async () => ({ success: true }),
      runCodexWorker: async () => {
        codexCalls++
        return doneResult('DONE')
      },
    })

    assert.equal(result.status, 'completed')
    assert.equal(modelCalls, 1)
    assert.equal(codexCalls, 0)
  })

  it('refuses Codex worker for non-senior agents', async () => {
    let codexCalls = 0
    const result = await dispatchWorkorder(makeWorkorder({
      agent_id: 'micro-executor',
    }), {
      callModel: async () => JSON.stringify({
        selected_agent: 'micro-executor',
        risk_level: 'low',
        risks: [],
        execution_order: ['complete'],
        required_gates: ['files-scope-gate', 'review-gate', 'human-approval-gate'],
        stop_conditions: ['production_execution_without_approval_token'],
      }),
      executeTool: async () => ({ success: true }),
      codexWorkerConfig: {
        codex_worker_enabled: true,
        allow_dispatcher_integration: true,
        allowed_agents: ['senior-coding-agent'],
        require_explicit_workorder_flag: true,
        default_timeout_ms: 120000,
        max_timeout_ms: 300000,
      },
      runCodexWorker: async () => {
        codexCalls++
        return doneResult('DONE')
      },
    })

    assert.equal(result.status, 'completed')
    assert.equal(codexCalls, 0)
  })

  it('uses Codex worker for senior-coding-agent when config and workorder opt-in pass', async () => {
    let codexCalls = 0
    let modelCalls = 0
    const result = await dispatchWorkorder(makeWorkorder(), {
      callModel: async () => {
        modelCalls++
        throw new Error('model call should not run when Codex worker is enabled')
      },
      executeTool: async () => ({ success: true }),
      codexWorkerConfig: {
        codex_worker_enabled: true,
        allow_dispatcher_integration: true,
        allowed_agents: ['senior-coding-agent'],
        require_explicit_workorder_flag: true,
        default_timeout_ms: 120000,
        max_timeout_ms: 300000,
      },
      runCodexWorker: async (workorder, options) => {
        codexCalls++
        assert.equal(workorder.workorder_id, 'WO-codex-001')
        assert.equal(options.timeoutMs, 120000)
        return doneResult('DONE')
      },
    })

    assert.equal(result.status, 'completed')
    assert.equal(codexCalls, 1)
    assert.equal(modelCalls, 0)
  })

  it('maps Codex timeout to FIX_REQUIRED failed dispatch result', async () => {
    const result = await dispatchWorkorder(makeWorkorder(), {
      callModel: async () => { throw new Error('not expected') },
      executeTool: async () => ({ success: true }),
      codexWorkerConfig: {
        codex_worker_enabled: true,
        allow_dispatcher_integration: true,
        allowed_agents: ['senior-coding-agent'],
        require_explicit_workorder_flag: true,
        default_timeout_ms: 120000,
        max_timeout_ms: 300000,
      },
      runCodexWorker: async () => ({
        ...doneResult('FIX_REQUIRED'),
        timedOut: true,
        stderr: 'Codex worker timed out after 120000ms.',
      }),
    })

    assert.equal(result.status, 'failed')
    assert.match(result.error ?? '', /CODEX_WORKER_FIX_REQUIRED/)
  })

  it('maps NEEDS_TOM_APPROVAL to paused awaiting approval result', async () => {
    const result = await dispatchWorkorder(makeWorkorder(), {
      callModel: async () => { throw new Error('not expected') },
      executeTool: async () => ({ success: true }),
      codexWorkerConfig: {
        codex_worker_enabled: true,
        allow_dispatcher_integration: true,
        allowed_agents: ['senior-coding-agent'],
        require_explicit_workorder_flag: true,
        default_timeout_ms: 120000,
        max_timeout_ms: 300000,
      },
      runCodexWorker: async () => doneResult('NEEDS_TOM_APPROVAL'),
    })

    assert.equal(result.status, 'awaiting_approval')
    assert.match(result.error ?? '', /CODEX_WORKER_NEEDS_TOM_APPROVAL/)
  })
})
