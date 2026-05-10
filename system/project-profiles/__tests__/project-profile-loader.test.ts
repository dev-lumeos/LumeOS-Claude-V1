import assert from 'node:assert/strict'
import { describe, it, beforeEach, afterEach } from 'node:test'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import {
  getProjectProfile,
  isForbiddenPath,
  isProductWorkAllowed,
  isRawLocalPath,
  isRuntimeArtifactPath,
  loadProjectProfile,
  resolveProjectPath,
} from '../project-profile-loader'

let tmpDir = ''

function writeProfile(projectId: string, overrides: Record<string, unknown> = {}): void {
  const profile = {
    profile_version: 1,
    project_id: projectId,
    display_name: 'Test Project',
    repo_root: tmpDir.replace(/\\/g, '/'),
    governance_root: 'system',
    specs_root: 'docs/specs',
    workorders_root: 'system/workorders',
    reports_root: 'system/reports',
    memory_root: 'system/memory',
    learning_root: 'docs/project/governance-learning',
    runtime_state_root: 'system/state',
    approval_root: 'system/approval',
    raw_data_paths: ['docs/specs/Nutrition/00_raw/'],
    ignored_local_paths: ['docs/specs/Nutrition/00_raw/', 'system/reports/codex-worker/'],
    product_gate: {
      status: 'closed',
      reason: 'Product work remains blocked.',
      conditional_planning_allowed: false,
    },
    forbidden_paths: ['.env', '.env.*', 'system/state/runtime_state.json', 'system/approval/queue.json', 'docs/specs/Nutrition/00_raw/**'],
    forbidden_commands: ['supabase db reset', 'supabase db push'],
    required_checkers: ['governance-invariant-check', 'agent-contract-check'],
    default_operator_batch: 'system/workorders/batches/BATCH-test.md',
    default_branch_prefix: 'goal/',
    promotion_policy: { require_clean_worktree: true },
    codex_worker_policy: {
      enabled: true,
      allowed_agents: ['senior-coding-agent'],
      require_explicit_workorder_flag: true,
      default_timeout_ms: 120000,
    },
    ...overrides,
  }
  const dir = path.join(tmpDir, 'system/project-profiles/profiles')
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(path.join(dir, `${projectId}.json`), JSON.stringify(profile, null, 2), 'utf8')
}

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lumeos-profile-'))
  writeProfile('lumeos')
})

afterEach(() => {
  if (tmpDir) fs.rmSync(tmpDir, { recursive: true, force: true })
})

describe('project profile loader', () => {
  it('loads the default LumeOS profile', () => {
    const profile = getProjectProfile(undefined, { repoRoot: tmpDir })
    assert.equal(profile.project_id, 'lumeos')
    assert.equal(profile.display_name, 'Test Project')
  })

  it('rejects invalid project ids', () => {
    assert.throws(
      () => getProjectProfile('../nope', { repoRoot: tmpDir }),
      /Invalid project profile id/,
    )
  })

  it('fails when a required field is missing', () => {
    writeProfile('broken', { display_name: undefined })
    assert.throws(
      () => loadProjectProfile('broken', { repoRoot: tmpDir }),
      /missing required field: display_name/,
    )
  })

  it('normalizes Windows-style paths inside the repo root', () => {
    const profile = getProjectProfile('lumeos', { repoRoot: tmpDir })
    const resolved = resolveProjectPath(profile, 'docs\\project\\README.md')
    assert.equal(resolved.replace(/\\/g, '/'), `${tmpDir.replace(/\\/g, '/')}/docs/project/README.md`)
  })

  it('blocks path traversal outside the repo root', () => {
    const profile = getProjectProfile('lumeos', { repoRoot: tmpDir })
    assert.throws(
      () => resolveProjectPath(profile, '../outside.md'),
      /outside repo root/,
    )
  })

  it('detects forbidden, runtime, and raw local paths', () => {
    const profile = getProjectProfile('lumeos', { repoRoot: tmpDir })
    assert.equal(isForbiddenPath(profile, '.env.local'), true)
    assert.equal(isForbiddenPath(profile, 'docs/specs/Nutrition/00_raw/bls/BLS.xlsx'), true)
    assert.equal(isRuntimeArtifactPath(profile, 'system/state/runtime_state.json'), true)
    assert.equal(isRawLocalPath(profile, 'docs/specs/Nutrition/00_raw/bls/BLS.xlsx'), true)
  })

  it('keeps product work closed by default', () => {
    const profile = getProjectProfile('lumeos', { repoRoot: tmpDir })
    const gate = isProductWorkAllowed(profile, { planningOnly: false })
    assert.equal(gate.allowed, false)
    assert.match(gate.reason, /blocked/i)
  })
})
