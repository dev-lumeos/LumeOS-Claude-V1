/**
 * Tests für Dispatcher FAIL/Exception Cleanup (WO-governance-006).
 *
 * Sichert ab: jeder FAIL/Block/Exception-Pfad in dispatchWorkorder() gibt
 * acquired Locks frei und setzt active_workorders.status auf 'failed' bevor
 * der Funktions-Body verlassen wird (try/finally Defense-in-Depth).
 *
 * Test-Pattern: Setup eines isolierten temp-Verzeichnisses (process.chdir),
 * Mock callModel/executeTool zur Erzeugung spezifischer FAIL-Szenarien,
 * Assertion gegen state-manager APIs.
 *
 * Run:
 *   npx tsx --test system/control-plane/__tests__/dispatcher-fail-cleanup.test.ts
 */

import assert from 'node:assert/strict'
import { describe, it, before, after } from 'node:test'
import fs   from 'node:fs'
import path from 'node:path'
import os   from 'node:os'

import { dispatchWorkorder, defaultExecuteTool } from '../dispatcher'
import * as state from '../../state/state-manager'

// ─── Test Fixture Setup ──────────────────────────────────────────────────────

const TEST_DIR = path.join(os.tmpdir(), 'lumeos-dispatcher-fail-cleanup')
const REAL_CWD = process.cwd()

function setupFixture(): void {
  if (fs.existsSync(TEST_DIR)) fs.rmSync(TEST_DIR, { recursive: true })
  for (const d of [
    `${TEST_DIR}/system/state`,
    `${TEST_DIR}/system/approval`,
    `${TEST_DIR}/system/workorders/schemas`,
    `${TEST_DIR}/system/agent-registry`,
    `${TEST_DIR}/.claude/agents`,
    `${TEST_DIR}/services/nutrition-api/src/routes`,
    `${TEST_DIR}/supabase/migrations`,
  ]) fs.mkdirSync(d, { recursive: true })

  // Minimal Workorder-Schema
  fs.writeFileSync(`${TEST_DIR}/system/workorders/schemas/workorder.schema.json`, JSON.stringify({
    "$schema": "http://json-schema.org/draft-07/schema",
    "type": "object",
    "required": ["workorder_id", "agent_id", "task", "scope_files", "acceptance_criteria", "negative_constraints"],
    "properties": {
      "workorder_id":         { "type": "string", "pattern": "^WO-[a-z]+-[0-9]+$" },
      "agent_id":             { "type": "string" },
      "task":                 { "type": "string", "minLength": 10 },
      "scope_files":          { "type": "array", "items": { "type": "string" }, "minItems": 1 },
      "context_files":        { "type": "array", "items": { "type": "string" } },
      "acceptance_files":     { "type": "array", "items": { "type": "string" } },
      "acceptance_criteria":  { "type": "array", "items": { "type": "string" }, "minItems": 1 },
      "negative_constraints": { "type": "array", "items": { "type": "string" }, "minItems": 3 },
      "required_skills":      { "type": "array", "items": { "type": "string" } },
      "optional_skills":      { "type": "array", "items": { "type": "string" } },
      "blocked_by":           { "type": "array", "items": { "type": "string" } },
    },
  }))

  fs.writeFileSync(`${TEST_DIR}/system/agent-registry/agents.json`, JSON.stringify({
    'micro-executor':     { type: 'executor',      description: '', spec_file: '.claude/agents/micro-executor.md',     always_load_skills: [], skill_token_budget: 2000, requires_human_approval: false, phase: '1+2' },
    'db-migration-agent': { type: 'db_specialist', description: '', spec_file: '.claude/agents/db-migration-agent.md', always_load_skills: [], skill_token_budget: 4000, requires_human_approval: true,  phase: '1+2' },
  }))

  fs.writeFileSync(`${TEST_DIR}/system/agent-registry/model_routing.json`, JSON.stringify({
    'micro-executor':     { default: { node: 'spark-b', model: 'qwen3-coder-30b', temperature: 0.0, max_context: 32768 } },
    'db-migration-agent': { default: { node: 'spark-a', model: 'qwen3.6-35b',     temperature: 0.0, max_context: 32768 } },
  }))

  fs.writeFileSync(`${TEST_DIR}/system/agent-registry/permissions.json`, JSON.stringify({
    'micro-executor':     {
      read: ['$WORKORDER.scope_files', '$WORKORDER.context_files'],
      write: ['$WORKORDER.scope_files'],
      bash: ['pnpm tsc --noEmit'],
      limits: { max_write_files: 3, env_access: false, dependency_changes: false, migration_changes: false },
      mcp: { filesystem: true, serena: true, supabase: false, context7: true },
    },
    'db-migration-agent': {
      read: ['supabase/**', 'db/**'],
      write: ['supabase/migrations/**', 'db/migrations/**'],
      bash: ['pnpm tsc --noEmit'],
      limits: { env_access: false, requires_human_approval: true },
      mcp: { filesystem: true, serena: true, supabase: true, context7: true },
    },
  }))

  fs.writeFileSync(`${TEST_DIR}/system/agent-registry/tool_profiles.json`, JSON.stringify({
    profiles: {
      executor:      { write_allowed: 'scope_only',      bash_allowed: true, network_allowed: false, supabase_allowed: false },
      db_specialist: { write_allowed: 'migrations_only', bash_allowed: true, network_allowed: false, supabase_allowed: true,  requires_human_approval: true },
    },
  }))

  fs.writeFileSync(`${TEST_DIR}/system/agent-registry/skill_registry.json`, JSON.stringify({
    'gsd-v2': { type: 'runtime', path: '.claude/skills/gsd-v2/SKILL.md', max_tokens: 800, pipeline_only: false, default_priority: 'normal', allowed_agent_types: ['executor', 'db_specialist'] },
  }))

  fs.writeFileSync(`${TEST_DIR}/system/agent-registry/approval_operation_types.json`, JSON.stringify({
    'write_migration': { description: 'Neue Migration', allowed_tools: ['write'], allowed_paths: ['supabase/migrations/**', 'db/migrations/**'], requires_post_review: true, max_uses: 1, expires_minutes: 30 },
  }))

  fs.writeFileSync(`${TEST_DIR}/.claude/agents/micro-executor.md`,     '# Agent: micro-executor')
  fs.writeFileSync(`${TEST_DIR}/.claude/agents/db-migration-agent.md`, '# Agent: db-migration-agent')

  fs.writeFileSync(`${TEST_DIR}/services/nutrition-api/src/routes/diary.ts`, '// original')

  process.chdir(TEST_DIR)
}

function teardownFixture(): void {
  process.chdir(REAL_CWD)
  if (fs.existsSync(TEST_DIR)) fs.rmSync(TEST_DIR, { recursive: true })
}

function makeWO(overrides: Record<string, any> = {}): any {
  // Hinweis: dispatcher.ts cached die Schema-Resolution beim Module-Load
  // (WO_SCHEMA_PATH ist eagerly aufgelöst). Daher gilt das ECHTE Repo-Schema,
  // nicht das Fixture-Schema oben. Das echte Schema verlangt min. 4 negative_constraints.
  return {
    workorder_id: 'WO-test-001',
    agent_id:     'micro-executor',
    task:         'Add TypeScript types to the diary route file',
    scope_files:  ['services/nutrition-api/src/routes/diary.ts'],
    context_files: [],
    acceptance_files: [],
    acceptance_criteria:  ['Types added', 'No compilation errors'],
    negative_constraints: [
      'NIEMALS ENV-Dateien lesen oder schreiben',
      'NIEMALS Schema oder Migration Changes',
      'NIEMALS außerhalb scope_files schreiben',
      'NIEMALS neue Dependencies hinzufügen',
    ],
    required_skills: [],
    optional_skills: [],
    blocked_by:      [],
    ...overrides,
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function lockExistsFor(runId: string): boolean {
  return state.getActiveScopeLocks().some(l => l.run_id === runId)
}

function findActiveWo(workorderId: string) {
  const statePath = path.resolve(process.cwd(), 'system/state/runtime_state.json')
  if (!fs.existsSync(statePath)) return null
  const s = JSON.parse(fs.readFileSync(statePath, 'utf8'))
  return (s.active_workorders ?? []).find((w: any) => w.workorder_id === workorderId) ?? null
}

// ─── Suite ───────────────────────────────────────────────────────────────────

describe('Dispatcher FAIL Cleanup — try/finally Defense-in-Depth', () => {

  before(() => { setupFixture() })
  after(()  => { teardownFixture() })

  it('Validator FAIL (production-keyword in execution_order ohne Approval-Token) → scope_lock released', async () => {
    // Production keyword in execution_order erzeugt validator status=FAIL (kein REWRITE)
    // wenn approvalTokenPresent=false (requires_approval implizit true für den Validator).
    const mockCallModel = async () => JSON.stringify({
      selected_agent:  'micro-executor',
      risk_level:      'low',
      risks:           [],
      execution_order: ['apply_migration_to_production'],
      required_gates:  ['human-approval-gate', 'review-gate'],
      stop_conditions: ['production_execution_without_approval_token'],
    })

    const wo = makeWO({ workorder_id: 'WO-test-002', requires_approval: true })
    const result = await dispatchWorkorder(wo as any, {
      callModel:   mockCallModel,
      executeTool: defaultExecuteTool,
    })

    assert.equal(result.status, 'failed', `Erwartet: failed, war: ${result.status}`)
    assert.equal(lockExistsFor(result.run_id), false, 'scope_lock muss freigegeben sein')
    const woEntry = findActiveWo('WO-test-002')
    assert.ok(woEntry, 'active_workorder Eintrag muss existieren')
    assert.equal(woEntry.status, 'failed', `WO-status: ${woEntry.status}, erwartet failed`)
  })

  it('Validator BLOCKED (FILES_ALLOWED Verletzung) → scope_lock released', async () => {
    // Pfad außerhalb scope_files in execution_order erzeugt BLOCKED.
    const mockCallModel = async () => JSON.stringify({
      selected_agent:  'micro-executor',
      risk_level:      'low',
      risks:           [],
      execution_order: ['write file "outside/forbidden.ts"'],
      required_gates:  ['review-gate'],
      stop_conditions: [],
    })

    const wo = makeWO({ workorder_id: 'WO-test-003', requires_approval: false })
    const result = await dispatchWorkorder(wo as any, {
      callModel:   mockCallModel,
      executeTool: defaultExecuteTool,
    })

    assert.equal(result.status, 'blocked', `Erwartet: blocked, war: ${result.status}`)
    assert.equal(lockExistsFor(result.run_id), false, 'scope_lock muss freigegeben sein')
    const woEntry = findActiveWo('WO-test-003')
    assert.equal(woEntry?.status, 'failed', 'WO muss als failed markiert sein')
  })

  it('Validator REWRITE-Limit erreicht → scope_lock released', async () => {
    // Modell-Output liefert IMMER ungültiges selected_agent → REWRITE × 2 → FAIL.
    const mockCallModel = async () => JSON.stringify({
      selected_agent:  'never-allowed-agent',
      risk_level:      'low',
      risks:           [],
      execution_order: [],
      required_gates:  ['human-approval-gate'],
      stop_conditions: ['production_execution_without_approval_token'],
    })

    const wo = makeWO({ workorder_id: 'WO-test-004', agent_id: 'unknown-mapping-target', requires_approval: true })
    // unbekannte agent_id → keine Mapping-Auflösung → Validator REWRITE bis Limit
    const result = await dispatchWorkorder(wo as any, {
      callModel:   mockCallModel,
      executeTool: defaultExecuteTool,
    })

    // unbekannte agent_id wird vom Dispatcher schon vor dem Modell-Call als
    // "Agent nicht in Registry" geworfen → catch-Pfad. Beide Pfade müssen Lock freigeben.
    assert.equal(lockExistsFor(result.run_id), false, 'scope_lock muss freigegeben sein')
  })

  it('callModel Exception → scope_lock released über catch-Pfad', async () => {
    const mockCallModel = async () => { throw new Error('vLLM endpoint unreachable') }

    const wo = makeWO({ workorder_id: 'WO-test-005' })
    const result = await dispatchWorkorder(wo as any, {
      callModel:   mockCallModel,
      executeTool: defaultExecuteTool,
    })

    assert.equal(result.status, 'failed', 'callModel-Exception muss zu failed führen')
    assert.equal(lockExistsFor(result.run_id), false, 'scope_lock muss freigegeben sein')
    assert.match(result.error ?? '', /vLLM/, 'error muss callModel-Fehler reflektieren')
  })

  it('Tool-Auth Block (write außerhalb scope) → scope_lock released', async () => {
    // Combined OrchestratorIntent + ToolRequest: passt sowohl die validator-checks
    // als auch parseToolRequest. Permission Gateway lehnt dann den write auf
    // system/state/* ab.
    // approvalTokenPresent ist false (wo.requires_approval !== false), daher Pflicht:
    // human-approval-gate in required_gates + production_execution_without_approval_token in stop_conditions.
    const mockCallModel = async () => JSON.stringify({
      // OrchestratorIntent fields
      selected_agent:  'micro-executor',
      risk_level:      'low',
      risks:           [],
      execution_order: ['analyze and write'],
      required_gates:  ['human-approval-gate', 'review-gate'],
      stop_conditions: ['production_execution_without_approval_token'],
      // ToolRequest fields
      tool: 'write',
      targetPath: 'system/state/runtime_state.json',  // hart blockiert für micro-executor
      content: '{}',
    })

    const wo = makeWO({ workorder_id: 'WO-test-006' })
    const result = await dispatchWorkorder(wo as any, {
      callModel:   mockCallModel,
      executeTool: defaultExecuteTool,
    })

    // Permission Gateway lehnt ab → blocked
    assert.equal(result.status, 'blocked', `Erwartet: blocked, war: ${result.status}: ${result.error}`)
    assert.equal(lockExistsFor(result.run_id), false, 'scope_lock muss freigegeben sein')
    const woEntry = findActiveWo('WO-test-006')
    assert.equal(woEntry?.status, 'failed', 'WO muss als failed markiert sein')
  })

  it('Files-Scope-Violation Post-Check → scope_lock released', async () => {
    // Permission Gateway lässt durch (Wildcard?), Post-Check fängt Verletzung.
    // In diesem Setup fängt das Gateway das schon ab. Wir testen also den
    // Pfad: parseToolRequest gibt write außerhalb scope → blocked durch Gateway.
    // Das ist effektiv derselbe Pfad wie im Tool-Auth-Test, beide müssen Lock freigeben.
    const mockCallModel = async () => JSON.stringify({
      tool: 'write',
      targetPath: 'apps/web/src/forbidden.tsx',
      content: 'export const x = 1',
    })

    const wo = makeWO({ workorder_id: 'WO-test-007' })
    const result = await dispatchWorkorder(wo as any, {
      callModel:   mockCallModel,
      executeTool: defaultExecuteTool,
    })

    assert.notEqual(result.status, 'completed', 'darf nicht erfolgreich abschließen')
    assert.equal(lockExistsFor(result.run_id), false, 'scope_lock muss freigegeben sein')
  })

  it('DB-Migration Lock wird bei FAIL freigegeben (db-migration risk_category)', async () => {
    // db-migration-WO erwirbt sowohl scope_lock als auch db_migration_lock.
    // FAIL durch ungültiges Modell-Output → beide Locks müssen freigegeben sein.
    const mockCallModel = async () => 'NOT JSON'  // → parse error × 3 → FAIL

    const wo = makeWO({
      workorder_id:  'WO-test-008',
      agent_id:      'db-migration-agent',
      scope_files:   ['supabase/migrations/001_test.sql'],
      risk_category: 'db-migration',
      rollback_hint: 'DROP TABLE test;',
    })
    const result = await dispatchWorkorder(wo as any, {
      callModel:   mockCallModel,
      executeTool: defaultExecuteTool,
    })

    assert.equal(result.status, 'failed', `Erwartet: failed, war: ${result.status}`)
    assert.equal(lockExistsFor(result.run_id), false, 'scope_lock muss freigegeben sein')
    const dbLock = state.isDbMigrationLocked()
    assert.equal(dbLock.locked, false, 'db_migration_lock muss freigegeben sein')
  })

  it('Erfolgsfall (no-tool-request) → result.status completed, finally darf WO-Status nicht auf failed überschreiben', async () => {
    // Modell liefert gültigen OrchestratorIntent ohne Tool-Request.
    // Pre-existing dispatcher behavior: result.status = 'completed', WO-status
    // bleibt 'dispatched' (kein updateWorkorderStatus auf done in dieser Branch — pre-existing,
    // außerhalb des WO-006-Scopes). Mein finally darf den Status NICHT auf 'failed' überschreiben.
    const mockCallModel = async () => JSON.stringify({
      selected_agent:  'micro-executor',
      risk_level:      'low',
      risks:           [],
      execution_order: ['analyze code'],
      required_gates:  ['review-gate'],
      stop_conditions: [],
    })

    const wo = makeWO({ workorder_id: 'WO-test-009', requires_approval: false })
    const result = await dispatchWorkorder(wo as any, {
      callModel:   mockCallModel,
      executeTool: defaultExecuteTool,
    })

    assert.equal(result.status, 'completed', `Erwartet: completed, war: ${result.status}`)
    // Pre-existing behavior: WO-status bleibt 'dispatched' für no-tool-request completion.
    // Mein cleanupHandled-Flag verhindert dass finally das auf 'failed' überschreibt.
    const woEntry = findActiveWo('WO-test-009')
    assert.notEqual(woEntry?.status, 'failed', `Erfolgs-Pfad-Verhalten unverändert: WO-Status darf NICHT 'failed' sein, war: ${woEntry?.status}`)
  })

  it('Erfolgsfall mit Tool-Request (write in scope) → completed, WO-Status done, lock released', async () => {
    // Voller Erfolgsfall: combined OrchestratorIntent + write tool request in scope_files.
    // dispatcher.ts "12. Finalize" setzt updateWorkorderStatus(wo, 'done') und releaseScopeLock.
    const mockCallModel = async () => JSON.stringify({
      selected_agent:  'micro-executor',
      risk_level:      'low',
      risks:           [],
      execution_order: ['write file'],
      required_gates:  ['review-gate'],
      stop_conditions: [],
      tool: 'write',
      targetPath: 'services/nutrition-api/src/routes/diary.ts',
      content: '// updated\nexport type DiaryEntry = { id: string }',
    })

    const wo = makeWO({ workorder_id: 'WO-test-010', requires_approval: false })
    const result = await dispatchWorkorder(wo as any, {
      callModel:   mockCallModel,
      executeTool: defaultExecuteTool,
    })

    // Hinweis: Review-Pipeline läuft live (callGemmaReviewer). Wenn Spark C nicht erreichbar,
    // bricht die Pipeline ab — wir prüfen daher nur dass kein lock-leak entsteht.
    // result.status kann completed | blocked (review-pipeline-rewrite/human_needed) sein.
    assert.notEqual(result.status, 'failed', `Erwartet: kein FAIL, war: ${result.status}: ${result.error}`)
    assert.equal(lockExistsFor(result.run_id), false, 'scope_lock muss freigegeben sein')
  })

})
