import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { describe, it, beforeEach, afterEach } from 'node:test'
import { runDocsAgentRuntimeSmoke } from '../docs-agent-runtime-smoke'

let tmpDir = ''
let originalCwd = ''

function write(relativePath: string, content: string): void {
  const fullPath = path.join(tmpDir, relativePath)
  fs.mkdirSync(path.dirname(fullPath), { recursive: true })
  fs.writeFileSync(fullPath, content, 'utf8')
}

describe('docs-agent runtime smoke', () => {
  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lumeos-docs-agent-smoke-'))
    originalCwd = process.cwd()
    process.chdir(tmpDir)
    write('system/agent-registry/model_routing.json', JSON.stringify({
      'docs-agent': {
        default: {
          endpoint: 'http://spark2.test:8001',
          model: 'qwen3-coder-next-fp8',
          temperature: 0,
          timeout_ms: 120000,
        },
      },
    }))
    write('system/agent-registry/agents.json', JSON.stringify({
      'docs-agent': { spec_file: '.claude/agents/docs-agent.md' },
    }))
    write('.claude/agents/docs-agent.md', '# docs-agent\n')
    write('system/prompts/orchestration/orchestrator_intent_contract.md', 'Return OrchestratorIntent JSON.')
    write('system/workorders/nutrition/WO-NUTRITION-P1-012-nutrient-defs-seed-candidate.md', [
      '```yaml',
      'task: |',
      '  Produce the seed candidate.',
      '',
      'source_refs:',
      '  module_index: docs/specs/Nutrition/INDEX.md',
      '```',
    ].join('\n'))
  })

  afterEach(() => {
    process.chdir(originalCwd)
    fs.rmSync(tmpDir, { recursive: true, force: true })
  })

  it('runs tiny, medium, and dispatcher-shaped docs-agent probes', async () => {
    const seenBodies: any[] = []
    const result = await runDocsAgentRuntimeSmoke({
      fetchImpl: async (_url, init) => {
        const body = JSON.parse(String(init?.body ?? '{}'))
        seenBodies.push(body)
        const isDispatcherPayload = String(body.messages?.[1]?.content ?? '').includes('Produce the seed candidate')
        const content = isDispatcherPayload
          ? JSON.stringify({
              selected_agent: 'micro-executor',
              risk_level: 'low',
              risks: [],
              execution_order: [],
              required_gates: ['review-gate', 'files-scope-gate'],
              stop_conditions: ['scope_violation'],
              tool: 'write',
              targetPath: 'docs/project/p1-005/P1-005-nutrient-defs-seed-candidate.md',
              content: '# Seed Candidate\n\n## Purpose\nComplete review artifact.',
            })
          : 'OK'
        return new Response(JSON.stringify({
          choices: [{ message: { content } }],
        }), { status: 200 })
      },
    })

    assert.equal(result.ok, true)
    assert.deepEqual(result.results.map(item => item.id), [
      'tiny_completion',
      'medium_docs_markdown',
      'seed_candidate_dispatcher_payload',
    ])
    assert.equal(seenBodies[2].max_tokens, 4096)
    assert.match(seenBodies[2].messages[0].content, /orchestrator_intent_contract/)
    assert.match(seenBodies[2].messages[1].content, /Produce the seed candidate/)
  })

  it('reports failed completion probes with evidence', async () => {
    const result = await runDocsAgentRuntimeSmoke({
      includeDispatcherPayload: false,
      fetchImpl: async () => new Response('RuntimeError: Triton Error [CUDA]: operation not permitted', {
        status: 500,
        statusText: 'Internal Server Error',
      }),
    })

    assert.equal(result.ok, false)
    assert.equal(result.results.length, 2)
    assert.equal(result.results[0].status, 500)
    assert.match(result.results[0].evidence, /Triton Error/)
  })
})
