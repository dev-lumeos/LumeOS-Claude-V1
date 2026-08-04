import assert from 'node:assert/strict'
import { describe, it, beforeEach, afterEach } from 'node:test'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import {
  formatAgentContractReport,
  runAgentContractCheck,
  type AgentContractFinding,
} from '../agent-contract-check'

let tmpDir = ''
const realCwd = process.cwd()

function setup(): void {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lumeos-agent-contract-check-'))
  for (const dir of [
    '.claude/agents',
    '.agents/skills/valid-skill',
    'system/agent-registry',
    'system/prompts/orchestration',
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
  write('.claude/agents/db-migration-agent.md', `---
name: db-migration-agent
description: Supabase migration specialist.
---

# db-migration-agent

Dispatcher-Runtime Output Contract:
- Return exactly one OrchestratorIntent JSON object.
- No prose, no Markdown, no visible <thinking>.
- selected_agent must match the workorder agent and must not drift.
- For migration writes, use targetPath from the workorder-derived migration path.
- Do not use literal example paths such as 20240101_001_example.sql.
- Read-only context access does not require human approval.
- Migration writes require human approval and post-write security-specialist review.
- Supabase db push and Supabase db reset are forbidden except Tom-only documented instructions.
`)
  write('.agents/skills/valid-skill/SKILL.md', `---
name: valid-skill
description: Valid parser-safe skill.
---

# Valid Skill

Use for focused test fixtures.
`)
  writeJson('system/agent-registry/agents.json', {
    agents: [
      {
        id: 'db-migration-agent',
        spec_file: '.claude/agents/db-migration-agent.md',
        requires_human_approval: true,
      },
    ],
  })
  writeJson('system/agent-registry/model_routing.json', {
    _qwen3_6_notes: 'enable_thinking must be false for qwen3.6 routes.',
    routes: {
      'db-migration-agent': {
        model: 'qwen3.6-35b-fp8',
        temperature: 0,
      },
    },
  })
  writeJson('system/agent-registry/approval_operation_types.json', {
    write_migration: {
      allowed_paths: ['supabase/migrations/**'],
      requires_human_approval: true,
    },
    write_docs: {
      allowed_paths: ['docs/**'],
      requires_human_approval: false,
    },
  })
  write('system/prompts/orchestration/orchestrator_intent_contract.md', `# OrchestratorIntent Contract

Return exactly one JSON object. No prose, no Markdown, no visible <thinking>.
selected_agent must match the workorder agent and cannot drift.
Use targetPath: <WORKORDER_DERIVED_TARGET_PATH>.
`)
  write('system/control-plane/dispatcher.ts', `
const requestBody: Record<string, unknown> = {}
if (routing.model.toLowerCase().includes('qwen3.6')) {
  requestBody.enable_thinking = false
  requestBody.response_format = { type: 'json_object' }
}
validateOrchestratorIntent(intent, { expectedAgent: workorder.agent_id })
`)
}

function runCheck(repoRoot = tmpDir) {
  return runAgentContractCheck({ repoRoot })
}

function finding(result: { findings: AgentContractFinding[] }, id: string): AgentContractFinding | undefined {
  return result.findings.find(item => item.id === id)
}

describe('agent contract checker', () => {
  it('valid agent and skill contracts pass', () => {
    const result = runCheck()

    assert.equal(result.exitCode, 0)
    assert.equal(result.summary.critical, 0)
    assert.equal(result.summary.high, 0)
  })

  it('reports competing runtime output contracts as high', () => {
    write('.claude/agents/db-migration-agent.md', `---
name: db-migration-agent
description: Broken contract.
---

Dispatcher-Runtime Output Contract:
- Return OrchestratorIntent JSON.
- Top-level output includes status, migration_files, rollback_plan.
`)

    const result = runCheck()
    const item = finding(result, 'agent.competing_output_contract')

    assert.equal(result.exitCode, 1)
    assert.equal(item?.severity, 'high')
    assert.equal(item?.blocks_operator, true)
  })

  it('blocks literal usable example migration target paths', () => {
    write('.claude/agents/db-migration-agent.md', `---
name: db-migration-agent
description: Broken path example.
---

Dispatcher-Runtime Output Contract:
Return exactly one OrchestratorIntent JSON object.

Example:
{ "operation": "write_migration", "targetPath": "supabase/migrations/20240101_001_example.sql" }
`)

    const result = runCheck()
    const item = finding(result, 'agent.literal_example_migration_target')

    assert.equal(result.exitCode, 1)
    assert.equal(item?.severity, 'high')
  })

  it('reports missing YAML frontmatter in SKILL.md as high', () => {
    write('.agents/skills/valid-skill/SKILL.md', '# Missing Frontmatter\n\nBody exists.\n')

    const result = runCheck()
    const item = finding(result, 'skill.frontmatter_missing')

    assert.equal(result.exitCode, 1)
    assert.equal(item?.severity, 'high')
    assert.match(item?.file ?? '', /SKILL\.md$/)
  })

  it('accepts parser-safe skill frontmatter with body', () => {
    const result = runCheck()

    assert.equal(finding(result, 'skill.frontmatter_missing'), undefined)
    assert.equal(finding(result, 'skill.frontmatter_invalid'), undefined)
    assert.equal(finding(result, 'skill.body_missing'), undefined)
  })

  it('reports qwen3.6 routing without thinking-off API policy', () => {
    writeJson('system/agent-registry/model_routing.json', {
      routes: {
        'db-migration-agent': {
          model: 'qwen3.6-35b-fp8',
        },
      },
    })
    write('system/control-plane/dispatcher.ts', 'const requestBody = {}\n')

    const result = runCheck()
    const item = finding(result, 'model_routing.qwen_thinking_policy_missing')

    assert.equal(result.exitCode, 1)
    assert.equal(item?.severity, 'high')
  })

  it('reports broad unsafe approval operation paths', () => {
    writeJson('system/agent-registry/approval_operation_types.json', {
      write_migration: {
        allowed_paths: ['supabase/**'],
        requires_human_approval: true,
      },
      write_docs: {
        allowed_paths: ['docs/**'],
      },
      write_any: {
        allowed_paths: ['**'],
      },
    })

    const result = runCheck()

    assert.equal(finding(result, 'approval_operation.broad_write_any')?.severity, 'high')
    assert.equal(finding(result, 'approval_operation.broad_path')?.severity, 'high')
  })

  it('returns stable JSON output shape and human report', () => {
    const result = runCheck()
    const report = formatAgentContractReport(result)

    assert.equal(result.schema_version, 1)
    assert.equal(typeof result.generated_at, 'string')
    assert.equal(typeof result.summary.info, 'number')
    assert.ok(Array.isArray(result.findings))
    assert.match(report, /Agent & Skill Contract Check/)
  })

  it('real repository has no critical or high agent contract findings', () => {
    const result = runAgentContractCheck({ repoRoot: realCwd })

    assert.equal(result.summary.critical, 0)
    assert.equal(result.summary.high, 0)
    assert.equal(result.exitCode, 0)
  })
})
