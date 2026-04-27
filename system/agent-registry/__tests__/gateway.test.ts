/**
 * LUMEOS Gateway Integration Tests V1.2
 * Tests für: Permission Gateway, Approval Gate, Skill Loader, State Manager
 *
 * Run:
 *   npx tsx --test system/agent-registry/__tests__/gateway.test.ts
 *
 * Voraussetzungen:
 *   - pnpm add -w -D tsx
 *   - Repo-Root als CWD (damit Registry-Files gefunden werden)
 */

import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { authorizeToolCall } from '../authorize-tool-call'
import { checkApproval, consumeApproval, createApprovalToken } from '../../approval/approval-gate'
import { loadSkills } from '../../control-plane/skill-loader'
import * as state from '../../state/state-manager'

// ─── Permission Gateway Tests ─────────────────────────────────────────────────

describe('Permission Gateway — ENV Protection', () => {

  it('.env blockiert', () => {
    const result = authorizeToolCall({ agentId: 'micro-executor', workorderId: 'WO-test-001', tool: 'read', targetPath: '.env' })
    assert.equal(result.allowed, false)
    assert.equal(result.blockedBy, 'global_env_policy')
  })

  it('.env.local blockiert', () => {
    const result = authorizeToolCall({ agentId: 'micro-executor', workorderId: 'WO-test-001', tool: 'read', targetPath: '.env.local' })
    assert.equal(result.allowed, false)
    assert.equal(result.blockedBy, 'global_env_policy')
  })

  it('config.env blockiert', () => {
    const result = authorizeToolCall({ agentId: 'micro-executor', workorderId: 'WO-test-001', tool: 'read', targetPath: 'config/app.env' })
    assert.equal(result.allowed, false)
  })
})

describe('Permission Gateway — Path Security', () => {

  it('../secret blockiert (Path Traversal)', () => {
    const result = authorizeToolCall({ agentId: 'micro-executor', workorderId: 'WO-test-001', tool: 'read', targetPath: '../secret/keys.json' })
    assert.equal(result.allowed, false)
    assert.equal(result.blockedBy, 'path_security')
  })

  it('Windows Absolute Path blockiert', () => {
    const result = authorizeToolCall({ agentId: 'micro-executor', workorderId: 'WO-test-001', tool: 'read', targetPath: 'D:\\Windows\\System32\\config' })
    assert.equal(result.allowed, false)
    assert.equal(result.blockedBy, 'path_security')
  })

  it('/etc/passwd blockiert (Unix Absolute)', () => {
    const result = authorizeToolCall({ agentId: 'micro-executor', workorderId: 'WO-test-001', tool: 'read', targetPath: '/etc/passwd' })
    assert.equal(result.allowed, false)
    assert.equal(result.blockedBy, 'path_security')
  })
})

describe('Permission Gateway — Bash Exact Match', () => {

  it('"pnpm test" erlaubt für micro-executor', () => {
    const result = authorizeToolCall({ agentId: 'micro-executor', workorderId: 'WO-test-001', tool: 'bash', command: 'pnpm test' })
    assert.equal(result.allowed, true)
  })

  it('"pnpm test && rm -rf ." blockiert', () => {
    const result = authorizeToolCall({ agentId: 'micro-executor', workorderId: 'WO-test-001', tool: 'bash', command: 'pnpm test && rm -rf .' })
    assert.equal(result.allowed, false)
    assert.equal(result.blockedBy, 'bash_exact_match')
  })
})

describe('Permission Gateway — Agent Type Enforcement', () => {

  it('review-agent: write blockiert', () => {
    const result = authorizeToolCall({ agentId: 'review-agent', workorderId: 'WO-test-001', tool: 'write', targetPath: 'services/api/routes.ts' })
    assert.equal(result.allowed, false)
    assert.equal(result.blockedBy, 'profile.write_allowed')
  })

  it('orchestrator-agent: bash blockiert', () => {
    const result = authorizeToolCall({ agentId: 'orchestrator-agent', workorderId: 'WO-test-001', tool: 'bash', command: 'pnpm test' })
    assert.equal(result.allowed, false)
    assert.equal(result.blockedBy, 'profile.bash_allowed')
  })

  it('unbekannter Agent blockiert', () => {
    const result = authorizeToolCall({ agentId: 'unknown-agent', workorderId: 'WO-test-001', tool: 'read', targetPath: 'src/app.ts' })
    assert.equal(result.allowed, false)
    assert.equal(result.blockedBy, 'agents_registry')
  })
})

describe('Permission Gateway — File Limits', () => {

  it('micro-executor: 4. File blockiert', () => {
    const result = authorizeToolCall(
      { agentId: 'micro-executor', workorderId: 'WO-test-001', tool: 'write', targetPath: 'd.ts' },
      { scope_files: ['a.ts', 'b.ts', 'c.ts', 'd.ts'], context_files: [], acceptance_files: [], already_written_files: ['a.ts', 'b.ts', 'c.ts'] }
    )
    assert.equal(result.allowed, false)
    assert.equal(result.blockedBy, 'limits.max_write_files')
  })
})

describe('Permission Gateway — Migration Guard', () => {

  it('micro-executor: supabase/migrations/ blockiert', () => {
    const result = authorizeToolCall({ agentId: 'micro-executor', workorderId: 'WO-test-001', tool: 'write', targetPath: 'supabase/migrations/001.sql' })
    assert.equal(result.allowed, false)
    assert.equal(result.blockedBy, 'migration_guard')
  })
})

describe('Permission Gateway — MiniMax Mode Guard', () => {

  it('senior-coding-agent in mode1 → blockiert', () => {
    const result = authorizeToolCall(
      { agentId: 'senior-coding-agent', workorderId: 'WO-test-001', tool: 'read', targetPath: 'src/app.ts' },
      { scope_files: [], context_files: [], acceptance_files: [], already_written_files: [] },
      { sparkMode: 'mode1' }
    )
    assert.equal(result.allowed, false)
    assert.equal(result.blockedBy, 'mode2_required')
  })

  it('test-agent in mode2 → blockiert', () => {
    const result = authorizeToolCall(
      { agentId: 'test-agent', workorderId: 'WO-test-001', tool: 'read', targetPath: 'src/app.ts' },
      { scope_files: [], context_files: [], acceptance_files: [], already_written_files: [] },
      { sparkMode: 'mode2' }
    )
    assert.equal(result.allowed, false)
    assert.equal(result.blockedBy, 'mode2_lock')
  })

  it('transitioning → alle blockiert', () => {
    const result = authorizeToolCall(
      { agentId: 'micro-executor', workorderId: 'WO-test-001', tool: 'read', targetPath: 'src/app.ts' },
      { scope_files: [], context_files: [], acceptance_files: [], already_written_files: [] },
      { sparkMode: 'transitioning' }
    )
    assert.equal(result.allowed, false)
    assert.equal(result.blockedBy, 'mode_transitioning')
  })
})
