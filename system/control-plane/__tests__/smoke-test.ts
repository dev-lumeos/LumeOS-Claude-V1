/**
 * LUMEOS Runtime Smoke Test V1.2.3
 *
 * Run:
 *   cd D:\GitHub\LumeOS-Claude-V1
 *   npx tsx system/control-plane/__tests__/smoke-test.ts
 *
 * Voraussetzungen:
 *   pnpm add -D ajv micromatch @types/micromatch tsx
 */

import assert from 'node:assert/strict'
import fs     from 'node:fs'
import path   from 'node:path'
import os     from 'node:os'

import { dispatchWorkorder, parseToolRequest, defaultExecuteTool } from '../dispatcher'
import * as state from '../../state/state-manager'
import * as audit from '../../state/audit-writer'
import * as gate  from '../../approval/approval-gate'
import { loadSkills } from '../skill-loader'

// ─── Setup ────────────────────────────────────────────────────────────────────

const TEST_DIR = path.join(os.tmpdir(), 'lumeos-smoke-test')

function setup(): void {
  if (fs.existsSync(TEST_DIR)) fs.rmSync(TEST_DIR, { recursive: true })
  const dirs = [
    `${TEST_DIR}/system/state`, `${TEST_DIR}/system/approval`,
    `${TEST_DIR}/system/workorders/schemas`, `${TEST_DIR}/system/agent-registry`,
    `${TEST_DIR}/.claude/agents`, `${TEST_DIR}/services/nutrition-api/src/routes`,
    `${TEST_DIR}/supabase/migrations`,
  ]
  dirs.forEach(d => fs.mkdirSync(d, { recursive: true }))

  // workorder.schema.json
  fs.writeFileSync(`${TEST_DIR}/system/workorders/schemas/workorder.schema.json`, JSON.stringify({
    "$schema": "http://json-schema.org/draft-07/schema", "type": "object",
    "required": ["workorder_id", "agent_id", "task", "scope_files", "acceptance_criteria", "negative_constraints"],
    "properties": {
      "workorder_id": { "type": "string", "pattern": "^WO-[a-z]+-[0-9]+$" },
      "agent_id": { "type": "string" }, "task": { "type": "string", "minLength": 10 },
      "scope_files": { "type": "array", "items": { "type": "string" }, "minItems": 1 },
      "context_files": { "type": "array", "items": { "type": "string" } },
      "acceptance_files": { "type": "array", "items": { "type": "string" } },
      "acceptance_criteria": { "type": "array", "items": { "type": "string" }, "minItems": 1 },
      "negative_constraints": { "type": "array", "items": { "type": "string" }, "minItems": 3 },
      "required_skills": { "type": "array", "items": { "type": "string" } },
      "optional_skills": { "type": "array", "items": { "type": "string" } },
      "blocked_by": { "type": "array", "items": { "type": "string" } },
    }
  }))

  fs.writeFileSync(`${TEST_DIR}/system/agent-registry/agents.json`, JSON.stringify({
    'micro-executor': { type: 'executor', description: 'Test executor', spec_file: '.claude/agents/micro-executor.md', always_load_skills: [], skill_token_budget: 2000, requires_human_approval: false, phase: '1+2' },
    'db-migration-agent': { type: 'db_specialist', description: 'DB migrations', spec_file: '.claude/agents/db-migration-agent.md', always_load_skills: [], skill_token_budget: 4000, requires_human_approval: true, phase: '1+2' }
  }))

  fs.writeFileSync(`${TEST_DIR}/system/agent-registry/model_routing.json`, JSON.stringify({
    'micro-executor':     { default: { node: 'spark-b', model: 'qwen3-coder-30b', temperature: 0.0, max_context: 32768 } },
    'db-migration-agent': { default: { node: 'spark-a', model: 'qwen3.6-35b',     temperature: 0.0, max_context: 32768 } }
  }))

  fs.writeFileSync(`${TEST_DIR}/system/agent-registry/permissions.json`, JSON.stringify({
    'micro-executor': {
      read: ['$WORKORDER.scope_files', '$WORKORDER.context_files'],
      write: ['$WORKORDER.scope_files'],
      bash: ['pnpm test', 'pnpm tsc --noEmit', 'pnpm lint', 'pnpm build'],
      limits: { max_write_files: 3, env_access: false, dependency_changes: false, migration_changes: false },
      mcp: { filesystem: true, serena: true, supabase: false, context7: true }
    },
    'db-migration-agent': {
      read: ['supabase/**', 'db/**', 'packages/types/**'],
      write: ['supabase/migrations/**', 'db/migrations/**'],
      bash: ['pnpm tsc --noEmit', 'supabase db diff', 'supabase migration list'],
      limits: { env_access: false, requires_human_approval: true },
      mcp: { filesystem: true, serena: true, supabase: true, context7: true }
    }
  }))

  fs.writeFileSync(`${TEST_DIR}/system/agent-registry/tool_profiles.json`, JSON.stringify({
    profiles: {
      executor:     { write_allowed: 'scope_only', bash_allowed: true,  network_allowed: false, supabase_allowed: false },
      db_specialist: { write_allowed: 'migrations_only', bash_allowed: true, network_allowed: false, supabase_allowed: true, requires_human_approval: true }
    }
  }))

  fs.writeFileSync(`${TEST_DIR}/system/agent-registry/skill_registry.json`, JSON.stringify({
    'gsd-v2':   { type: 'runtime',  path: '.claude/skills/gsd-v2/SKILL.md', max_tokens: 800, pipeline_only: false, default_priority: 'normal', allowed_agent_types: ['executor', 'executor_senior', 'reviewer', 'db_specialist'] },
    'wo-writer': { type: 'pipeline', path: '.claude/skills/wo-writer/SKILL.md', max_tokens: 1000, pipeline_only: true, default_priority: 'pipeline_only', allowed_agent_types: [] }
  }))

  fs.writeFileSync(`${TEST_DIR}/system/agent-registry/approval_operation_types.json`, JSON.stringify({
    'write_migration': { description: 'Neue Migration', allowed_tools: ['write'], allowed_paths: ['supabase/migrations/**', 'db/migrations/**'], requires_post_review: true, max_uses: 1, expires_minutes: 30 },
    'apply_migration_local': { description: 'Migration lokal', allowed_tools: ['bash'], exact_command_required: true, requires_post_review: true, max_uses: 1, expires_minutes: 15 }
  }))

  fs.writeFileSync(`${TEST_DIR}/.claude/agents/micro-executor.md`, '# Agent: micro-executor\nTest executor agent.')
  fs.writeFileSync(`${TEST_DIR}/services/nutrition-api/src/routes/diary.ts`, '// original content')

  process.chdir(TEST_DIR)
  console.log(`  → Test-Dir: ${TEST_DIR}`)
}

function makeWO(overrides: Record<string, any> = {}): any {
  return {
    workorder_id: 'WO-nutrition-001', agent_id: 'micro-executor',
    task: 'Add TypeScript types to the diary route file',
    scope_files: ['services/nutrition-api/src/routes/diary.ts'],
    context_files: [], acceptance_files: [],
    acceptance_criteria: ['Types added', 'No compilation errors'],
    negative_constraints: ['NIEMALS ENV ändern', 'NIEMALS Schema ändern', 'NIEMALS außerhalb scope'],
    required_skills: [], optional_skills: [], blocked_by: [],
    ...overrides,
  }
}

// ─── Tests ────────────────────────────────────────────────────────────────────

async function test1_workorder_schema() {
  console.log('\n[Test 1] Workorder Schema-Struktur')
  const wo = makeWO()
  assert.ok(/^WO-[a-z]+-[0-9]+$/.test(wo.workorder_id))
  assert.ok(wo.negative_constraints.length >= 3)
  assert.ok(wo.scope_files.length >= 1)
  console.log('  ✓')
}

async function test2_state_lifecycle() {
  console.log('\n[Test 2] State Manager Lifecycle')
  const runId = 'RUN-20260426-001'
  await state.startRun(runId, 'WO-nutrition-001', 'micro-executor')
  assert.equal(state.getWrittenFiles(runId).length, 0)
  await state.addWrittenFile(runId, 'services/nutrition-api/src/routes/diary.ts')
  assert.equal(state.getWrittenFiles(runId).length, 1)
  await state.endRun(runId, 'completed')
  console.log('  ✓')
}

async function test3_approval_flow() {
  console.log('\n[Test 3] Approval Gate — check → consume → blocked')
  const token = await gate.createApprovalToken({
    approval_id: 'APP-SMOKE-001', run_id: 'RUN-20260426-001',
    workorder_id: 'WO-nutrition-001', agent_id: 'db-migration-agent',
    operation: 'write_migration', scope: ['supabase/migrations/001.sql'],
    approved_by: 'tom', approved_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 600_000).toISOString(),
    single_use: true, max_uses: 1, requires_post_review: true,
  })
  assert.equal(token.status, 'granted')

  const check = gate.checkApproval({ approvalId: 'APP-SMOKE-001', runId: 'RUN-20260426-001',
    workorderId: 'WO-nutrition-001', agentId: 'db-migration-agent',
    tool: 'write', targetPath: 'supabase/migrations/001.sql' })
  assert.equal(check.allowed, true)
  assert.equal(state.readApprovalTokens()['APP-SMOKE-001'].use_count, 0, 'Nicht konsumiert nach check')

  await gate.consumeApproval('APP-SMOKE-001')
  assert.equal(state.readApprovalTokens()['APP-SMOKE-001'].status, 'consumed')

  const check2 = gate.checkApproval({ approvalId: 'APP-SMOKE-001', runId: 'RUN-20260426-001',
    workorderId: 'WO-nutrition-001', agentId: 'db-migration-agent',
    tool: 'write', targetPath: 'supabase/migrations/001.sql' })
  assert.equal(check2.allowed, false)
  console.log('  ✓')
}

async function test4_audit_writer() {
  console.log('\n[Test 4] Audit Writer')
  audit.auditJobStarted({ run_id: 'RUN-T4', workorder_id: 'WO-T4', agent_id: 'micro-executor', orchestration_mode: 'nemotron' })
  audit.auditToolAllowed({ run_id: 'RUN-T4', workorder_id: 'WO-T4', agent_id: 'micro-executor', orchestration_mode: 'nemotron', tool: 'write', target_path: 'services/nutrition-api/src/routes/diary.ts' })
  audit.auditJobCompleted({ run_id: 'RUN-T4', workorder_id: 'WO-T4', agent_id: 'micro-executor', orchestration_mode: 'nemotron', duration_ms: 500 })

  const logPath = path.resolve(process.cwd(), 'system/state/audit.jsonl')
  assert.ok(fs.existsSync(logPath))
  const lines = fs.readFileSync(logPath, 'utf8').trim().split('\n').filter(Boolean)
  assert.ok(lines.length >= 3)
  lines.forEach(l => { const e = JSON.parse(l); assert.ok(e.ts && e.event && e.orchestration_mode) })
  console.log(`  ✓ (${lines.length} Events)`)
}

async function test5_skill_loader() {
  console.log('\n[Test 5] Skill Loader — Pipeline-Skill blockiert')
  const r1 = loadSkills({ agentId: 'micro-executor', agentType: 'executor', requiredSkills: ['wo-writer'], optionalSkills: [], alwaysLoad: [], tokenBudget: 5000 })
  assert.equal(r1.blocked, true)
  assert.ok(r1.errors.some(e => e.includes('[REQUIRED]')))
  const r2 = loadSkills({ agentId: 'micro-executor', agentType: 'executor', requiredSkills: [], optionalSkills: ['nonexistent'], alwaysLoad: [], tokenBudget: 5000 })
  assert.equal(r2.blocked, false)
  console.log('  ✓')
}

async function test6_dispatcher_e2e_write() {
  console.log('\n[Test 6] Dispatcher E2E — write → completed')
  const mockCallModel = async () => JSON.stringify({
    tool: 'write', targetPath: 'services/nutrition-api/src/routes/diary.ts',
    content: '// Updated\nexport type DiaryEntry = { id: string; date: string }',
  })
  const result = await dispatchWorkorder(makeWO(), { callModel: mockCallModel, executeTool: defaultExecuteTool })
  assert.equal(result.status, 'completed', `Erwartet: completed — ${result.error}`)
  const content = fs.readFileSync('services/nutrition-api/src/routes/diary.ts', 'utf8')
  assert.ok(content.includes('DiaryEntry'))
  const events = fs.readFileSync('system/state/audit.jsonl', 'utf8').trim().split('\n').filter(Boolean).map(JSON.parse)
  assert.ok(events.some((e: any) => e.event === 'job_completed'))
  assert.ok(events.some((e: any) => e.event === 'tool_call_allowed'))
  console.log('  ✓')
}

async function test7a_migration_awaiting_approval() {
  console.log('\n[Test 7A] micro-executor Migration ohne Approval → awaiting_approval')
  const mockCallModel = async () => JSON.stringify({
    tool: 'write', targetPath: 'supabase/migrations/001_add_diary.sql',
    content: 'CREATE TABLE diary_days (...)',
  })
  const result = await dispatchWorkorder(
    makeWO({ workorder_id: 'WO-nutrition-002', scope_files: ['supabase/migrations/001_add_diary.sql'] }),
    { callModel: mockCallModel, executeTool: defaultExecuteTool }
  )
  assert.equal(result.status, 'awaiting_approval', `Erwartet: awaiting_approval — ${result.status}`)
  console.log('  ✓')
}

async function test7b_migration_blocked_by_gateway() {
  console.log('\n[Test 7B] micro-executor Migration mit Approval → blocked (gateway)')
  await gate.createApprovalToken({
    approval_id: 'APP-T7B-001', run_id: 'WILL-BE-SET',
    workorder_id: 'WO-nutrition-003', agent_id: 'micro-executor',
    operation: 'write_migration', scope: ['supabase/migrations/001_add_diary.sql'],
    approved_by: 'tom', approved_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 600_000).toISOString(),
    single_use: true, max_uses: 1, requires_post_review: true,
  })
  const mockCallModel = async () => JSON.stringify({
    tool: 'write', targetPath: 'supabase/migrations/001_add_diary.sql',
    content: 'CREATE TABLE diary_days (...)',
    approvalId: 'APP-T7B-001', approval_operation: 'write_migration',
  })
  const result = await dispatchWorkorder(
    makeWO({ workorder_id: 'WO-nutrition-003', scope_files: ['supabase/migrations/001_add_diary.sql'] }),
    { callModel: mockCallModel, executeTool: defaultExecuteTool }
  )
  assert.equal(result.status, 'blocked', `Erwartet: blocked — ${result.status}`)
  console.log(`  ✓ blockiert durch: ${result.error}`)
}

async function test8_parse_tool_request() {
  console.log('\n[Test 8] parseToolRequest — plain + fenced + null')
  const r1 = parseToolRequest('```json\n{"tool":"write","targetPath":"src/app.ts","content":"export {}"}\n```')
  assert.ok(r1 && r1.tool === 'write' && r1.targetPath === 'src/app.ts')
  const r2 = parseToolRequest('{"tool":"bash","command":"pnpm test"}')
  assert.ok(r2 && r2.tool === 'bash' && r2.command === 'pnpm test')
  const r3 = parseToolRequest('Analyse abgeschlossen. Keine Änderungen nötig.')
  assert.equal(r3, null)
  console.log('  ✓')
}

// ─── Runner ───────────────────────────────────────────────────────────────────

async function runAll() {
  console.log('══════════════════════════════════════════════')
  console.log('LUMEOS Runtime Smoke Test V1.2.3')
  console.log('══════════════════════════════════════════════')
  setup()

  const tests = [
    { name: 'Workorder Schema',           fn: test1_workorder_schema },
    { name: 'State Manager Lifecycle',    fn: test2_state_lifecycle },
    { name: 'Approval Gate Flow',         fn: test3_approval_flow },
    { name: 'Audit Writer',               fn: test4_audit_writer },
    { name: 'Skill Loader',               fn: test5_skill_loader },
    { name: 'Dispatcher E2E write',       fn: test6_dispatcher_e2e_write },
    { name: 'Migration → awaiting',       fn: test7a_migration_awaiting_approval },
    { name: 'Migration + Approval → blocked', fn: test7b_migration_blocked_by_gateway },
    { name: 'parseToolRequest',           fn: test8_parse_tool_request },
  ]

  let passed = 0, failed = 0
  for (const { name, fn } of tests) {
    try { await fn(); passed++ }
    catch (err: any) {
      console.error(`  ✗ FEHLGESCHLAGEN [${name}]: ${err.message}`)
      if (err.actual !== undefined) console.error(`    actual: ${JSON.stringify(err.actual)} | expected: ${JSON.stringify(err.expected)}`)
      failed++
    }
  }

  console.log('\n══════════════════════════════════════════════')
  console.log(`Ergebnis: ${passed}/${tests.length} bestanden, ${failed} fehlgeschlagen`)
  console.log('══════════════════════════════════════════════')
  if (failed > 0) process.exit(1)
}

runAll().catch(err => { console.error('Abgebrochen:', err); process.exit(1) })
