import assert from 'node:assert/strict'
import { describe, it, beforeEach, afterEach } from 'node:test'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import {
  formatModelRuntimeReport,
  runModelRuntimeCheck,
  type ModelRuntimeFinding,
} from '../model-runtime-check'

let tmpDir = ''
const realCwd = process.cwd()

function setup(): void {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lumeos-model-runtime-check-'))
  for (const dir of [
    '.claude/agents',
    'system/agent-registry',
    'system/control-plane',
  ]) {
    fs.mkdirSync(path.join(tmpDir, dir), { recursive: true })
  }
  writeValidFixture()
  process.chdir(tmpDir)
}

function cleanup(): void {
  process.chdir(realCwd)
  if (tmpDir) fs.rmSync(tmpDir, { recursive: true, force: true })
}

beforeEach(setup)
afterEach(cleanup)

function write(relativePath: string, content: string): void {
  const fullPath = path.join(tmpDir, relativePath)
  fs.mkdirSync(path.dirname(fullPath), { recursive: true })
  fs.writeFileSync(fullPath, content, 'utf8')
}

function writeJson(relativePath: string, value: unknown): void {
  write(relativePath, `${JSON.stringify(value, null, 2)}\n`)
}

function writeValidFixture(): void {
  writeJson('system/agent-registry/agents.json', {
    'db-migration-agent': {
      type: 'db_specialist',
      spec_file: '.claude/agents/db-migration-agent.md',
      requires_human_approval: true,
    },
    'docs-agent': {
      type: 'executor',
      spec_file: '.claude/agents/docs-agent.md',
      requires_human_approval: false,
    },
  })
  writeJson('system/agent-registry/model_routing.json', {
    _qwen3_6_notes: {
      enable_thinking: 'MUST be false for each request.',
    },
    'db-migration-agent': {
      default: {
        node: 'spark-a',
        endpoint: 'http://192.168.0.128:8001',
        model: 'qwen3.6-35b-fp8',
        temperature: 0,
      },
    },
    'docs-agent': {
      default: {
        node: 'spark-b',
        endpoint: 'http://192.168.0.188:8001',
        model: 'qwen3-coder-next-fp8',
        temperature: 0,
      },
    },
  })
  write('.claude/agents/db-migration-agent.md', `# db-migration-agent

Dispatcher-Runtime Output Contract:
- Return exactly one OrchestratorIntent JSON object.
- No visible <thinking>.
`)
  write('.claude/agents/docs-agent.md', `# docs-agent

Return concise implementation output.
`)
  write('system/control-plane/dispatcher.ts', `
const MODEL_CALL_TIMEOUT_MS = 15000
async function defaultCallModel(routing) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), MODEL_CALL_TIMEOUT_MS)
  try {
    const requestBody = {}
    if (routing.model.toLowerCase().includes('qwen3.6')) {
      requestBody.enable_thinking = false
      requestBody.response_format = { type: 'json_object' }
    }
    return await fetch(routing.endpoint + '/v1/chat/completions', { signal: controller.signal })
  } catch (error) {
    if (String(error).includes('timeout')) return await fetch(routing.endpoint + '/v1/chat/completions', { signal: controller.signal })
    throw error
  } finally {
    clearTimeout(timeout)
  }
}
`)
}

function runCheck() {
  return runModelRuntimeCheck({ repoRoot: tmpDir, checkEndpoints: false })
}

function finding(result: { findings: ModelRuntimeFinding[] }, id: string): ModelRuntimeFinding | undefined {
  return result.findings.find(item => item.id === id)
}

describe('model runtime checker', () => {
  it('valid routing config passes', () => {
    const result = runCheck()

    assert.equal(result.exitCode, 0)
    assert.equal(result.summary.critical, 0)
    assert.equal(result.summary.high, 0)
  })

  it('reports unknown model reference as high', () => {
    writeJson('system/agent-registry/model_routing.json', {
      'db-migration-agent': {
        default: {
          node: 'spark-a',
          endpoint: 'http://192.168.0.128:8001',
          temperature: 0,
        },
      },
    })

    const result = runCheck()
    const item = finding(result, 'model_runtime.model_missing')

    assert.equal(result.exitCode, 1)
    assert.equal(item?.severity, 'high')
  })

  it('reports qwen3.6 route without thinking-off policy as high', () => {
    write('system/control-plane/dispatcher.ts', 'async function defaultCallModel() { return fetch("/v1/chat/completions") }\n')

    const result = runCheck()
    const item = finding(result, 'model_runtime.qwen_thinking_policy_missing')

    assert.equal(result.exitCode, 1)
    assert.equal(item?.severity, 'high')
  })

  it('reports JSON-only agent without JSON response mode as high', () => {
    write('system/control-plane/dispatcher.ts', `
const MODEL_CALL_TIMEOUT_MS = 15000
async function defaultCallModel(routing) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), MODEL_CALL_TIMEOUT_MS)
  try {
    const requestBody = {}
    if (routing.model.toLowerCase().includes('qwen3.6')) {
      requestBody.enable_thinking = false
    }
    return await fetch(routing.endpoint + '/v1/chat/completions', { signal: controller.signal })
  } finally {
    clearTimeout(timeout)
  }
}
`)

    const result = runCheck()
    const item = finding(result, 'model_runtime.json_response_policy_missing')

    assert.equal(result.exitCode, 1)
    assert.equal(item?.severity, 'high')
  })

  it('reports endpoint unreachable cleanly when endpoint checks are enabled', async () => {
    const result = await runModelRuntimeCheck({
      repoRoot: tmpDir,
      checkEndpoints: true,
      timeoutMs: 10,
      fetchImpl: async () => {
        throw new Error('connect ECONNREFUSED')
      },
    })

    const item = finding(result, 'model_runtime.endpoint_unreachable')
    assert.equal(result.exitCode, 1)
    assert.equal(item?.severity, 'high')
    assert.match(item?.evidence ?? '', /ECONNREFUSED/)
  })

  it('endpoint timeout does not hang tests', async () => {
    const result = await runModelRuntimeCheck({
      repoRoot: tmpDir,
      checkEndpoints: true,
      timeoutMs: 1,
      fetchImpl: (_url, init) => new Promise((_resolve, reject) => {
        const signal = init?.signal as AbortSignal | undefined
        signal?.addEventListener('abort', () => reject(new Error('aborted')))
      }),
    })

    assert.equal(finding(result, 'model_runtime.endpoint_unreachable')?.severity, 'high')
  })

  it('returns stable JSON output shape and human report', () => {
    const result = runCheck()
    const report = formatModelRuntimeReport(result)

    assert.deepEqual(Object.keys(result).sort(), [
      'check_endpoints',
      'exitCode',
      'findings',
      'generated_at',
      'hasHighOrCriticalFindings',
      'product_work_gate',
      'repo_root',
      'routes',
      'schema_version',
      'summary',
    ].sort())
    assert.match(report, /Model Runtime Check/)
  })

  it('checker is read-only for repository files', () => {
    const before = fs.readdirSync(tmpDir, { recursive: true }).sort()

    runCheck()

    assert.deepEqual(fs.readdirSync(tmpDir, { recursive: true }).sort(), before)
  })

  it('real repository has no critical or high static runtime findings', () => {
    const result = runModelRuntimeCheck({ repoRoot: realCwd, checkEndpoints: false })

    assert.equal(result.summary.critical, 0)
    assert.equal(result.summary.high, 0)
    assert.equal(result.exitCode, 0)
  })
})
