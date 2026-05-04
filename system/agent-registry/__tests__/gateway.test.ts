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

import { authorizeToolCall, guardMigrationContent, isPathInScope } from '../authorize-tool-call'
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

describe('Permission Gateway — A.2 FILES_BLOCKED + SCOPE Enforcement', () => {

  it('files_blocked: Write auf gesperrten Pfad → BLOCKED', () => {
    const result = authorizeToolCall(
      { agentId: 'micro-executor', workorderId: 'WO-test-001', tool: 'write', targetPath: 'services/auth/middleware.ts' },
      {
        scope_files: ['services/auth/middleware.ts'],
        context_files: [], acceptance_files: [], already_written_files: [],
        files_blocked: ['services/auth/**'],
      }
    )
    assert.equal(result.allowed, false)
    assert.equal(result.blockedBy, 'files_blocked_policy')
  })

  it('files_blocked: Write auf nicht-gesperrten Pfad → PASS', () => {
    const result = authorizeToolCall(
      { agentId: 'micro-executor', workorderId: 'WO-test-001', tool: 'write', targetPath: 'services/nutrition-api/src/utils/helper.ts' },
      {
        scope_files: ['services/nutrition-api/src/utils/helper.ts'],
        context_files: [], acceptance_files: [], already_written_files: [],
        files_blocked: ['services/auth/**'],
      }
    )
    assert.equal(result.allowed, true)
  })

  it('files_blocked: exakter Pfad-Match → BLOCKED', () => {
    const result = authorizeToolCall(
      { agentId: 'micro-executor', workorderId: 'WO-test-001', tool: 'write', targetPath: 'packages/types/src/index.ts' },
      {
        scope_files: ['packages/types/src/index.ts'],
        context_files: [], acceptance_files: [], already_written_files: [],
        files_blocked: ['packages/types/src/index.ts'],
      }
    )
    assert.equal(result.allowed, false)
    assert.equal(result.blockedBy, 'files_blocked_policy')
  })

  it('Write außerhalb scope_files → BLOCKED (permissions.write)', () => {
    const result = authorizeToolCall(
      { agentId: 'micro-executor', workorderId: 'WO-test-001', tool: 'write', targetPath: 'services/other/file.ts' },
      {
        scope_files: ['services/nutrition-api/src/utils/helper.ts'],
        context_files: [], acceptance_files: [], already_written_files: [],
      }
    )
    assert.equal(result.allowed, false)
    assert.equal(result.blockedBy, 'permissions.write')
  })

  it('Write innerhalb scope_files → PASS', () => {
    const result = authorizeToolCall(
      { agentId: 'micro-executor', workorderId: 'WO-test-001', tool: 'write', targetPath: 'services/nutrition-api/src/utils/helper.ts' },
      {
        scope_files: ['services/nutrition-api/src/utils/helper.ts'],
        context_files: [], acceptance_files: [], already_written_files: [],
      }
    )
    assert.equal(result.allowed, true)
  })

  it('Directory-Scope mit trailing slash erlaubt Dateien darunter konsistent', () => {
    assert.equal(
      isPathInScope(
        'supabase/migrations/20240522_001_nutrition_schema_foundation.sql',
        ['supabase/migrations/'],
      ),
      true,
    )
  })

  it('Glob-Scope erlaubt Dateien darunter konsistent', () => {
    assert.equal(
      isPathInScope(
        'supabase/migrations/20240522_001_nutrition_schema_foundation.sql',
        ['supabase/migrations/**'],
      ),
      true,
    )
  })

  it('Directory-Scope blockiert Geschwister und fremde Pfade', () => {
    const scope = ['supabase/migrations/']
    assert.equal(isPathInScope('supabase/seed.sql', scope), false)
    assert.equal(isPathInScope('services/api/foo.ts', scope), false)
    assert.equal(isPathInScope('.env', scope), false)
  })

  it('db-migration-agent: Directory-Scope und Gateway erlauben denselben Migrationspfad', () => {
    const targetPath = 'supabase/migrations/20240522_001_nutrition_schema_foundation.sql'
    const result = authorizeToolCall(
      { agentId: 'db-migration-agent', workorderId: 'WO-nutrition-002', tool: 'write', targetPath },
      {
        scope_files: ['supabase/migrations/'],
        context_files: [],
        acceptance_files: [],
        already_written_files: [],
      },
    )
    assert.equal(result.allowed, true, result.reason)
    assert.equal(isPathInScope(targetPath, ['supabase/migrations/']), true)
  })

  it('Read-only Agent (review-agent): Write immer BLOCKED', () => {
    const result = authorizeToolCall(
      { agentId: 'review-agent', workorderId: 'WO-test-001', tool: 'write', targetPath: 'services/api/routes.ts' },
      {
        scope_files: ['services/api/routes.ts'],
        context_files: [], acceptance_files: [], already_written_files: [],
        files_blocked: [],
      }
    )
    assert.equal(result.allowed, false)
    assert.equal(result.blockedBy, 'profile.write_allowed')
  })
})

describe('Migration SQL Guardrail', () => {
  it('erlaubt Schema-Foundation mit kommentiertem Rollback-Beispiel', () => {
    const sql = `
      CREATE SCHEMA IF NOT EXISTS nutrition;
      CREATE EXTENSION IF NOT EXISTS pg_trgm;
      CREATE EXTENSION IF NOT EXISTS pgcrypto;
      GRANT USAGE ON SCHEMA nutrition TO authenticated, service_role;

      -- Rollback:
      -- REVOKE USAGE ON SCHEMA nutrition FROM authenticated, service_role;
      -- DROP SCHEMA IF EXISTS nutrition;
    `

    const result = guardMigrationContent(sql, 'db-migration-agent')
    assert.equal(result.allowed, true, result.reason)
  })

  it('blockiert ausführbares DROP SCHEMA nach DOWN-Sektion', () => {
    const sql = `
      CREATE SCHEMA IF NOT EXISTS nutrition;
      -- DOWN
      DROP SCHEMA IF EXISTS nutrition;
    `

    const result = guardMigrationContent(sql, 'db-migration-agent')
    assert.equal(result.allowed, false)
    assert.equal(result.blockedBy, 'migration_guard')
    assert.match(result.reason ?? '', /DROP SCHEMA/)
  })

  it('blockiert ausführbares REVOKE nach DOWN-Sektion', () => {
    const sql = `
      CREATE SCHEMA IF NOT EXISTS nutrition;
      -- ROLLBACK
      REVOKE USAGE ON SCHEMA nutrition FROM authenticated;
    `

    const result = guardMigrationContent(sql, 'db-migration-agent')
    assert.equal(result.allowed, false)
    assert.equal(result.blockedBy, 'migration_guard')
    assert.match(result.reason ?? '', /REVOKE/)
  })

  it('blockiert ausführbares DROP TABLE', () => {
    const result = guardMigrationContent('DROP TABLE nutrition.foods;', 'db-migration-agent')
    assert.equal(result.allowed, false)
    assert.match(result.reason ?? '', /DROP TABLE/)
  })

  it('blockiert DELETE FROM ohne WHERE', () => {
    const result = guardMigrationContent('DELETE FROM nutrition.foods;', 'db-migration-agent')
    assert.equal(result.allowed, false)
    assert.match(result.reason ?? '', /DELETE FROM without WHERE/)
  })

  it('blockiert ALTER TABLE DROP COLUMN', () => {
    const result = guardMigrationContent('ALTER TABLE nutrition.foods DROP COLUMN calories;', 'db-migration-agent')
    assert.equal(result.allowed, false)
    assert.match(result.reason ?? '', /DROP COLUMN/)
  })

  it('blockiert Supabase DB Commands im Migrationsinhalt', () => {
    const result = guardMigrationContent('-- operator note\nsupabase db push --linked', 'db-migration-agent')
    assert.equal(result.allowed, false)
    assert.match(result.reason ?? '', /supabase db push/)
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
