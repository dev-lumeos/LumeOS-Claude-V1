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
import { buildSystemPrompt } from '../skill-loader'
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

  it('Erfolgsfall (no-tool-request) → result.status completed, WO-Status done, finally darf nicht auf failed überschreiben', async () => {
    // Modell liefert gültigen OrchestratorIntent ohne Tool-Request.
    // Post-WO-016 behavior: result.status = 'completed', WO-status wird auf
    // 'done' gesetzt via updateActiveWorkorderStatusByRun (vorher 'dispatched'
    // per WO-006 Test 8 Behavior; WO-016 hat das symmetrisch zum success-mit-
    // Tool-Pfad ergänzt). Mein cleanupHandled-Flag verhindert weiterhin, dass
    // finally den Status auf 'failed' überschreibt.
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
    const woEntry = findActiveWo('WO-test-009')
    // Defense-in-Depth: 'failed' ist explizit ausgeschlossen (WO-006 finally darf nicht überschreiben).
    assert.notEqual(woEntry?.status, 'failed', `WO-Status darf NICHT 'failed' sein, war: ${woEntry?.status}`)
    // WO-016: no-tool-request completed muss active_workorders auf 'done' setzen.
    assert.equal(woEntry?.status, 'done', `WO-016: WO-Status muss 'done' sein nach no-tool-request completed, war: ${woEntry?.status}`)
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

  // ─── WO-011: Run-id-spezifischer Status-Update + Multi-Dispatch ────────────

  it('WO-011: Validator-FAIL setzt run-id-spezifischen Eintrag auf failed', async () => {
    fs.mkdirSync(`${TEST_DIR}/services/wo011-101/src`, { recursive: true })
    fs.writeFileSync(`${TEST_DIR}/services/wo011-101/src/file.ts`, '// fixture')
    const mockCallModel = async () => 'NOT JSON'
    const wo = makeWO({
      workorder_id: 'WO-multidispatch-101',
      scope_files:  ['services/wo011-101/src/file.ts'],
    })
    const result = await dispatchWorkorder(wo as any, { callModel: mockCallModel, executeTool: defaultExecuteTool })
    assert.equal(result.status, 'failed', `result.status: ${result.status}, run_id: ${result.run_id}, error: ${result.error}`)
    const woEntry = state.getAllActiveWorkorders().find(
      w => w.workorder_id === 'WO-multidispatch-101' && w.run_id === result.run_id,
    )
    assert.ok(woEntry, `entry must exist for run_id=${result.run_id}`)
    assert.equal(woEntry?.status, 'failed', `Erwartet status='failed', war: ${woEntry?.status}`)
  })

  it('WO-011: Tool-Auth Block setzt run-id-spezifischen Eintrag auf failed', async () => {
    fs.mkdirSync(`${TEST_DIR}/services/wo011-102/src`, { recursive: true })
    fs.writeFileSync(`${TEST_DIR}/services/wo011-102/src/file.ts`, '// fixture')
    const mockCallModel = async () => JSON.stringify({
      selected_agent:  'micro-executor',
      risk_level:      'low',
      risks:           [],
      execution_order: ['write outside scope'],
      required_gates:  ['human-approval-gate', 'review-gate'],
      stop_conditions: ['production_execution_without_approval_token'],
      tool: 'write',
      targetPath: 'apps/forbidden/file.ts',
      content: '// out of scope',
    })
    const wo = makeWO({
      workorder_id: 'WO-multidispatch-102',
      scope_files:  ['services/wo011-102/src/file.ts'],
    })
    const result = await dispatchWorkorder(wo as any, { callModel: mockCallModel, executeTool: defaultExecuteTool })
    assert.equal(result.status, 'blocked', `result.status: ${result.status}, error: ${result.error}`)
    const woEntry = state.getAllActiveWorkorders().find(
      w => w.workorder_id === 'WO-multidispatch-102' && w.run_id === result.run_id,
    )
    assert.equal(woEntry?.status, 'failed')
  })

  it('WO-011: callModel Exception setzt run-id-spezifischen Eintrag auf failed (catch-Pfad)', async () => {
    fs.mkdirSync(`${TEST_DIR}/services/wo011-103/src`, { recursive: true })
    fs.writeFileSync(`${TEST_DIR}/services/wo011-103/src/file.ts`, '// fixture')
    const mockCallModel = async () => { throw new Error('mock_callmodel_throws') }
    const wo = makeWO({
      workorder_id: 'WO-multidispatch-103',
      scope_files:  ['services/wo011-103/src/file.ts'],
    })
    const result = await dispatchWorkorder(wo as any, { callModel: mockCallModel, executeTool: defaultExecuteTool })
    assert.equal(result.status, 'failed', `result.status: ${result.status}, error: ${result.error}`)
    const woEntry = state.getAllActiveWorkorders().find(
      w => w.workorder_id === 'WO-multidispatch-103' && w.run_id === result.run_id,
    )
    assert.equal(woEntry?.status, 'failed')
  })

  it('WO-011 CRITICAL: Multi-Dispatch derselben WO — nur aktueller run-id-Eintrag wird auf failed gesetzt, alter dispatched-Eintrag bleibt unverändert', async () => {
    // Reproduziert das Live-State-Szenario: alter dispatched-Eintrag (z. B. aus
    // einem stuck-dispatched Run vor WO-011) bleibt unverändert; nur der NEUE
    // run-id-Eintrag wird auf failed gesetzt. Beweist dass updateActiveWorkorderStatusByRun
    // run-spezifisch trifft und den Find-Key-Mismatch (workorder_id-only) auflöst.
    //
    // Hinweis: Setup-Status muss 'dispatched' sein (nicht 'failed'), weil
    // scheduler-preflight 'failed' als terminal blockt und Re-Dispatch verhindert.
    // Das ist genau der Live-State, den WO-011 fixt.
    fs.mkdirSync(`${TEST_DIR}/services/wo011-104/src`, { recursive: true })
    fs.writeFileSync(`${TEST_DIR}/services/wo011-104/src/file.ts`, '// fixture')
    const oldRunId = 'RUN-20260101-OLD0'
    await state.startWorkorder('WO-multidispatch-104', 'micro-executor', oldRunId)
    // Status bleibt 'dispatched' (default aus startWorkorder).
    const oldBefore = state.getAllActiveWorkorders().find(
      w => w.workorder_id === 'WO-multidispatch-104' && w.run_id === oldRunId,
    )
    assert.equal(oldBefore?.status, 'dispatched', 'Setup: alter Eintrag ist dispatched (stuck)')

    const mockCallModel = async () => 'NOT JSON'  // FAIL-Mock
    const wo = makeWO({
      workorder_id: 'WO-multidispatch-104',
      scope_files:  ['services/wo011-104/src/file.ts'],
    })
    const result = await dispatchWorkorder(wo as any, { callModel: mockCallModel, executeTool: defaultExecuteTool })
    assert.equal(result.status, 'failed', `result.status: ${result.status}, error: ${result.error}`)
    assert.notEqual(result.run_id, oldRunId, 'Neuer Run muss eigene run_id haben')

    // Beweis: 2 Einträge — alter UNVERÄNDERT auf 'dispatched', neuer auf 'failed'.
    const all = state.getAllActiveWorkorders().filter(w => w.workorder_id === 'WO-multidispatch-104')
    assert.equal(all.length, 2, `Erwartet 2 Einträge, war: ${all.length}`)
    const oldEntry = all.find(w => w.run_id === oldRunId)
    const newEntry = all.find(w => w.run_id === result.run_id)
    assert.equal(oldEntry?.status, 'dispatched', `Alter Eintrag (run_id=${oldRunId}) muss dispatched bleiben (Find-Key-Schutz), war: ${oldEntry?.status}`)
    assert.equal(newEntry?.status, 'failed', `Neuer Eintrag (run_id=${result.run_id}) muss failed sein, war: ${newEntry?.status}`)
  })

  it('WO-011: updateActiveWorkorderStatusByRun no-match → updated:false', async () => {
    const r = await state.updateActiveWorkorderStatusByRun('WO-does-not-exist', 'RUN-NONE', 'failed')
    assert.equal(r.updated, false)
    assert.equal(r.reason, 'no match')
  })

  it('WO-011: updateActiveWorkorderStatusByRun ambiguous match → updated:false, no mutation', async () => {
    // Setup: 2 Einträge mit gleicher (workorder_id, run_id) — sollte praktisch nie
    // passieren, aber wir testen die Schutz-Funktion.
    const ambiguousRun = 'RUN-AMBI-001'
    await state.startWorkorder('WO-multidispatch-105', 'micro-executor', ambiguousRun)
    await state.startWorkorder('WO-multidispatch-105', 'micro-executor', ambiguousRun)
    const before = state.getAllActiveWorkorders().filter(
      w => w.workorder_id === 'WO-multidispatch-105' && w.run_id === ambiguousRun,
    )
    assert.equal(before.length, 2)
    const r = await state.updateActiveWorkorderStatusByRun('WO-multidispatch-105', ambiguousRun, 'failed')
    assert.equal(r.updated, false)
    assert.match(r.reason ?? '', /ambiguous/)
    const after = state.getAllActiveWorkorders().filter(
      w => w.workorder_id === 'WO-multidispatch-105' && w.run_id === ambiguousRun,
    )
    assert.equal(after.filter(w => w.status === 'dispatched').length, 2, 'Beide Einträge bleiben dispatched (no mutation)')
  })

  it('WO-011: updateActiveWorkorderStatusByRun same-state idempotent', async () => {
    const runId = 'RUN-IDEMP-001'
    await state.startWorkorder('WO-multidispatch-106', 'micro-executor', runId)
    const r1 = await state.updateActiveWorkorderStatusByRun('WO-multidispatch-106', runId, 'failed')
    assert.equal(r1.updated, true)
    const r2 = await state.updateActiveWorkorderStatusByRun('WO-multidispatch-106', runId, 'failed')
    assert.equal(r2.updated, true, 'Same-state idempotent: zweiter Aufruf returnt updated:true')
  })

  it('WO-011: updateActiveWorkorderStatusByRun berührt nur matching Eintrag', async () => {
    const runIdA = 'RUN-ISO-A'
    const runIdB = 'RUN-ISO-B'
    await state.startWorkorder('WO-multidispatch-107', 'micro-executor', runIdA)
    await state.startWorkorder('WO-multidispatch-107', 'micro-executor', runIdB)
    const r = await state.updateActiveWorkorderStatusByRun('WO-multidispatch-107', runIdA, 'failed')
    assert.equal(r.updated, true)
    const all = state.getAllActiveWorkorders().filter(w => w.workorder_id === 'WO-multidispatch-107')
    const a = all.find(w => w.run_id === runIdA)
    const b = all.find(w => w.run_id === runIdB)
    assert.equal(a?.status, 'failed')
    assert.equal(b?.status, 'dispatched', 'Anderer Eintrag muss unverändert dispatched sein')
  })

  // ─── WO-012: OrchestratorIntent Array-Felder Defensive ─────────────────────

  it('WO-012: missing required_gates → kontrollierter REWRITE/FAIL, kein TypeError', async () => {
    fs.mkdirSync(`${TEST_DIR}/services/wo012-201/src`, { recursive: true })
    fs.writeFileSync(`${TEST_DIR}/services/wo012-201/src/file.ts`, '// fixture')
    const mockCallModel = async () => JSON.stringify({
      selected_agent:  'micro-executor',
      risk_level:      'low',
      risks:           [],
      execution_order: [],
      // required_gates fehlt → §0 returnt REWRITE, kein TypeError
      stop_conditions: [],
    })
    const wo = makeWO({
      workorder_id: 'WO-multidispatch-201',
      scope_files:  ['services/wo012-201/src/file.ts'],
    })
    const result = await dispatchWorkorder(wo as any, { callModel: mockCallModel, executeTool: defaultExecuteTool })
    assert.equal(result.status, 'failed', `Erwartet failed nach REWRITE-Limit, war: ${result.status}`)
    assert.match(result.error ?? '', /required_gates.*muss ein Array sein/, `Reason muss §0-Array-Defensive enthalten, war: ${result.error}`)
    assert.doesNotMatch(result.error ?? '', /is not iterable/, 'KEIN TypeError-Crash')
    const woEntry = state.getAllActiveWorkorders().find(
      w => w.workorder_id === 'WO-multidispatch-201' && w.run_id === result.run_id,
    )
    assert.equal(woEntry?.status, 'failed', 'WO-011 Run-id-Update wirkt auf REWRITE-Limit-FAIL')
    assert.equal(lockExistsFor(result.run_id), false, 'WO-006 Lock-Release wirkt')
  })

  it('WO-012: non-array required_gates (String) → kontrollierter REWRITE/FAIL', async () => {
    fs.mkdirSync(`${TEST_DIR}/services/wo012-202/src`, { recursive: true })
    fs.writeFileSync(`${TEST_DIR}/services/wo012-202/src/file.ts`, '// fixture')
    const mockCallModel = async () => JSON.stringify({
      selected_agent:  'micro-executor',
      risk_level:      'low',
      risks:           [],
      execution_order: [],
      required_gates:  'review-gate',  // String statt Array
      stop_conditions: [],
    })
    const wo = makeWO({
      workorder_id: 'WO-multidispatch-202',
      scope_files:  ['services/wo012-202/src/file.ts'],
    })
    const result = await dispatchWorkorder(wo as any, { callModel: mockCallModel, executeTool: defaultExecuteTool })
    assert.equal(result.status, 'failed')
    assert.match(result.error ?? '', /required_gates.*muss ein Array sein.*war: string/, `Reason muss typeof string nennen, war: ${result.error}`)
    assert.doesNotMatch(result.error ?? '', /is not iterable/)
  })

  it('WO-012: missing stop_conditions → kontrollierter REWRITE/FAIL', async () => {
    fs.mkdirSync(`${TEST_DIR}/services/wo012-203/src`, { recursive: true })
    fs.writeFileSync(`${TEST_DIR}/services/wo012-203/src/file.ts`, '// fixture')
    const mockCallModel = async () => JSON.stringify({
      selected_agent:  'micro-executor',
      risk_level:      'low',
      risks:           [],
      execution_order: [],
      required_gates:  [],
      // stop_conditions fehlt
    })
    const wo = makeWO({
      workorder_id: 'WO-multidispatch-203',
      scope_files:  ['services/wo012-203/src/file.ts'],
    })
    const result = await dispatchWorkorder(wo as any, { callModel: mockCallModel, executeTool: defaultExecuteTool })
    assert.equal(result.status, 'failed')
    assert.match(result.error ?? '', /stop_conditions.*muss ein Array sein/, `Reason: ${result.error}`)
  })

  it('WO-012: non-array stop_conditions (object) → kontrollierter REWRITE/FAIL', async () => {
    fs.mkdirSync(`${TEST_DIR}/services/wo012-204/src`, { recursive: true })
    fs.writeFileSync(`${TEST_DIR}/services/wo012-204/src/file.ts`, '// fixture')
    const mockCallModel = async () => JSON.stringify({
      selected_agent:  'micro-executor',
      risk_level:      'low',
      risks:           [],
      execution_order: [],
      required_gates:  [],
      stop_conditions: { foo: 'bar' },  // object statt Array
    })
    const wo = makeWO({
      workorder_id: 'WO-multidispatch-204',
      scope_files:  ['services/wo012-204/src/file.ts'],
    })
    const result = await dispatchWorkorder(wo as any, { callModel: mockCallModel, executeTool: defaultExecuteTool })
    assert.equal(result.status, 'failed')
    assert.match(result.error ?? '', /stop_conditions.*muss ein Array sein.*war: object/, `Reason: ${result.error}`)
  })

  it('WO-012: missing risks → kontrollierter REWRITE/FAIL', async () => {
    fs.mkdirSync(`${TEST_DIR}/services/wo012-205/src`, { recursive: true })
    fs.writeFileSync(`${TEST_DIR}/services/wo012-205/src/file.ts`, '// fixture')
    const mockCallModel = async () => JSON.stringify({
      selected_agent:  'micro-executor',
      risk_level:      'low',
      // risks fehlt
      execution_order: [],
      required_gates:  [],
      stop_conditions: [],
    })
    const wo = makeWO({
      workorder_id: 'WO-multidispatch-205',
      scope_files:  ['services/wo012-205/src/file.ts'],
    })
    const result = await dispatchWorkorder(wo as any, { callModel: mockCallModel, executeTool: defaultExecuteTool })
    assert.equal(result.status, 'failed')
    assert.match(result.error ?? '', /risks.*muss ein Array sein/, `Reason: ${result.error}`)
  })

  it('WO-012: missing execution_order → kontrollierter REWRITE/FAIL', async () => {
    fs.mkdirSync(`${TEST_DIR}/services/wo012-206/src`, { recursive: true })
    fs.writeFileSync(`${TEST_DIR}/services/wo012-206/src/file.ts`, '// fixture')
    const mockCallModel = async () => JSON.stringify({
      selected_agent:  'micro-executor',
      risk_level:      'low',
      risks:           [],
      // execution_order fehlt
      required_gates:  [],
      stop_conditions: [],
    })
    const wo = makeWO({
      workorder_id: 'WO-multidispatch-206',
      scope_files:  ['services/wo012-206/src/file.ts'],
    })
    const result = await dispatchWorkorder(wo as any, { callModel: mockCallModel, executeTool: defaultExecuteTool })
    assert.equal(result.status, 'failed')
    assert.match(result.error ?? '', /execution_order.*muss ein Array sein/, `Reason: ${result.error}`)
  })

  it('WO-012: null required_gates → REWRITE/FAIL mit "war: null"', async () => {
    fs.mkdirSync(`${TEST_DIR}/services/wo012-207/src`, { recursive: true })
    fs.writeFileSync(`${TEST_DIR}/services/wo012-207/src/file.ts`, '// fixture')
    const mockCallModel = async () => JSON.stringify({
      selected_agent:  'micro-executor',
      risk_level:      'low',
      risks:           [],
      execution_order: [],
      required_gates:  null,
      stop_conditions: [],
    })
    const wo = makeWO({
      workorder_id: 'WO-multidispatch-207',
      scope_files:  ['services/wo012-207/src/file.ts'],
    })
    const result = await dispatchWorkorder(wo as any, { callModel: mockCallModel, executeTool: defaultExecuteTool })
    assert.equal(result.status, 'failed')
    assert.match(result.error ?? '', /required_gates.*muss ein Array sein.*war: null/, `null muss explizit benannt sein, nicht typeof object: ${result.error}`)
  })

  // ─── WO-013: OrchestratorIntent System-Prompt Contract ─────────────────────

  it('WO-013: buildSystemPrompt injiziert Contract-Block wenn Datei existiert', () => {
    const contractDir  = path.resolve(process.cwd(), 'system/prompts/orchestration')
    const contractFile = path.resolve(contractDir, 'orchestrator_intent_contract.md')
    fs.mkdirSync(contractDir, { recursive: true })
    fs.writeFileSync(contractFile, '# CONTRACT_STUB_FOR_TEST\nMUST output JSON\n', 'utf8')

    const prompt = buildSystemPrompt('AGENT_SPEC_X', [])
    assert.match(prompt, /<orchestrator_intent_contract>/, 'Block-Header muss enthalten sein')
    assert.match(prompt, /CONTRACT_STUB_FOR_TEST/, 'Contract-Inhalt muss enthalten sein')
    assert.match(prompt, /AGENT_SPEC_X/, 'agentSpec muss erhalten bleiben')

    fs.unlinkSync(contractFile)  // cleanup für nächsten Test
  })

  it('WO-013: buildSystemPrompt graceful fallback ohne Contract-Datei', () => {
    const contractFile = path.resolve(process.cwd(), 'system/prompts/orchestration/orchestrator_intent_contract.md')
    if (fs.existsSync(contractFile)) fs.unlinkSync(contractFile)

    const prompt = buildSystemPrompt('AGENT_SPEC_Y', [])
    assert.equal(prompt, 'AGENT_SPEC_Y', 'Ohne Contract-Datei: agentSpec unverändert, kein Block, kein Crash')
    assert.doesNotMatch(prompt, /<orchestrator_intent_contract>/)
  })

  it('WO-013: buildSystemPrompt korrekte Reihenfolge agentSpec → contract → loaded_skills', () => {
    const contractDir  = path.resolve(process.cwd(), 'system/prompts/orchestration')
    const contractFile = path.resolve(contractDir, 'orchestrator_intent_contract.md')
    fs.mkdirSync(contractDir, { recursive: true })
    fs.writeFileSync(contractFile, 'CONTRACT_BODY', 'utf8')

    const prompt = buildSystemPrompt('AGENT_SPEC_Z', [
      { name: 'gsd-v2', content: 'SKILL_BODY', priority: 'normal', tokenCost: 0 } as any,
    ])
    const idxAgent    = prompt.indexOf('AGENT_SPEC_Z')
    const idxContract = prompt.indexOf('<orchestrator_intent_contract>')
    const idxSkills   = prompt.indexOf('<loaded_skills>')
    assert.ok(idxAgent >= 0 && idxContract >= 0 && idxSkills >= 0, 'Alle drei Blöcke müssen enthalten sein')
    assert.ok(idxAgent < idxContract, 'agentSpec muss VOR contract stehen')
    assert.ok(idxContract < idxSkills, 'contract muss VOR loaded_skills stehen')

    fs.unlinkSync(contractFile)
  })

  it('WO-013: REWRITE-Hint enthält Validator-Reason und fordert vollständiges JSON', async () => {
    fs.mkdirSync(`${TEST_DIR}/services/wo013-301/src`, { recursive: true })
    fs.writeFileSync(`${TEST_DIR}/services/wo013-301/src/file.ts`, '// fixture')
    // 1. callModel: liefert Intent ohne required_gates → §0 REWRITE
    // 2. callModel: muss userMessage mit "Validator reason:" und "Field:" empfangen
    const userMessages: string[] = []
    const mockCallModel = async (_routing: any, _system: string, user: string) => {
      userMessages.push(user)
      // Beide Aufrufe liefern denselben fehlerhaften Intent — nach 2 REWRITES → FAIL
      return JSON.stringify({
        selected_agent:  'micro-executor',
        risk_level:      'low',
        risks:           [],
        execution_order: [],
        // required_gates fehlt → §0 (WO-012) returnt REWRITE
        stop_conditions: [],
      })
    }
    const wo = makeWO({
      workorder_id: 'WO-multidispatch-301',
      scope_files:  ['services/wo013-301/src/file.ts'],
    })
    const result = await dispatchWorkorder(wo as any, { callModel: mockCallModel, executeTool: defaultExecuteTool })
    assert.equal(result.status, 'failed')
    assert.ok(userMessages.length >= 2, `Erwartet ≥2 callModel-Aufrufe (initial + ≥1 retry), war: ${userMessages.length}`)
    const retryMessage = userMessages[1]
    assert.match(retryMessage, /Validator reason:/, `2. userMessage muss strukturierten "Validator reason:" enthalten, war: ${retryMessage.slice(0, 200)}`)
    assert.match(retryMessage, /Field:/, `2. userMessage muss "Field:" enthalten`)
    assert.match(retryMessage, /required_gates/, `Field-Name aus Validator-Result muss durchgereicht werden`)
    assert.match(retryMessage, /COMPLETE JSON object/, `Anweisung "vollständiges JSON" muss vorhanden sein`)
    assert.match(retryMessage, /all 6 OrchestratorIntent fields/, `Hint muss alle 6 Felder erwähnen`)
  })

  // ─── WO-014: Lock-Release on Non-Terminal/Completed Paths ─────────────────

  it('WO-014 E-1: no-tool-request completed path releases scope_lock', async () => {
    fs.mkdirSync(`${TEST_DIR}/services/wo014-401/src`, { recursive: true })
    fs.writeFileSync(`${TEST_DIR}/services/wo014-401/src/file.ts`, '// fixture')
    // Mock liefert valides OrchestratorIntent OHNE Tool-Request (kein 'tool'-Feld) → no-tool-request completed path.
    const mockCallModel = async () => JSON.stringify({
      selected_agent:  'micro-executor',
      risk_level:      'low',
      risks:           [],
      execution_order: ['analyze'],
      required_gates:  ['files-scope-gate', 'review-gate', 'human-approval-gate'],
      stop_conditions: ['production_execution_without_approval_token'],
    })
    const wo = makeWO({
      workorder_id: 'WO-multidispatch-401',
      scope_files:  ['services/wo014-401/src/file.ts'],
    })
    const result = await dispatchWorkorder(wo as any, { callModel: mockCallModel, executeTool: defaultExecuteTool })
    assert.equal(result.status, 'completed', `Erwartet completed, war: ${result.status}: ${result.error}`)
    assert.equal(lockExistsFor(result.run_id), false, 'WO-014: scope_lock muss freigegeben sein nach completed-no-tool-request')
    const woEntry = state.getAllActiveWorkorders().find(
      w => w.workorder_id === 'WO-multidispatch-401' && w.run_id === result.run_id,
    )
    // Post-WO-016: WO-Status ist 'done' (vorher 'dispatched' per WO-006 Test 8 Behavior; WO-016 hat
    // das symmetrisch zum success-mit-Tool-Pfad ergänzt). 'failed' bleibt explizit ausgeschlossen.
    assert.notEqual(woEntry?.status, 'failed', `WO-Status darf NICHT 'failed' sein, war: ${woEntry?.status}`)
    assert.equal(woEntry?.status, 'done', `WO-016: WO-Status muss 'done' sein nach no-tool-request completed, war: ${woEntry?.status}`)
  })

  it('WO-014 E-2: approval-gate awaiting_approval path releases scope_lock', async () => {
    fs.mkdirSync(`${TEST_DIR}/supabase/migrations`, { recursive: true })
    // Mock liefert OrchestratorIntent + write-Tool auf approval-pflichtigen Pfad (supabase/migrations) OHNE approvalId.
    // → triggert approval-gate Pfad → awaiting_approval.
    const mockCallModel = async () => JSON.stringify({
      selected_agent:  'micro-executor',
      risk_level:      'high',
      risks:           ['db migration without approval'],
      execution_order: ['await_approval'],
      required_gates:  ['human-approval-gate', 'review-gate', 'db-migration-gate', 'rollback-gate', 'typecheck-gate', 'test-gate', 'files-scope-gate'],
      stop_conditions: ['production_execution_without_approval_token'],
      tool: 'write',
      targetPath: 'supabase/migrations/402_test.sql',
      content: 'CREATE TABLE wo014_402 (id UUID PRIMARY KEY);',
    })
    const wo = makeWO({
      workorder_id: 'WO-multidispatch-402',
      scope_files:  ['supabase/migrations/402_test.sql'],
      risk_category: 'db-migration',
      rollback_hint: 'DROP TABLE IF EXISTS wo014_402;',
    })
    const result = await dispatchWorkorder(wo as any, { callModel: mockCallModel, executeTool: defaultExecuteTool })
    assert.equal(result.status, 'awaiting_approval', `Erwartet awaiting_approval, war: ${result.status}: ${result.error}`)
    assert.equal(lockExistsFor(result.run_id), false, 'WO-014: scope_lock muss freigegeben sein nach approval-gate awaiting_approval')
    const woEntry = state.getAllActiveWorkorders().find(
      w => w.workorder_id === 'WO-multidispatch-402' && w.run_id === result.run_id,
    )
    assert.equal(woEntry?.status, 'awaiting_approval', `Status muss awaiting_approval sein, war: ${woEntry?.status}`)
  })

  it('WO-014 E-3: review-pipeline rewrite path — lock-release verified by code-inspection', () => {
    // Der review-pipeline rewrite-Pfad (dispatcher.ts ~703-718) ist in dieser Test-Fixture
    // nicht isoliert ausführbar: Spark-C REWRITE eskaliert zu Spark-D, der NICHT injizierbar
    // ist (Phase-2-Followup WO-018-Spark-D-Reviewer-Injection). REWRITE löpt deshalb
    // unweigerlich auf den human-needed-Pfad (durch E-4 abgedeckt).
    //
    // Stattdessen statische Verifikation der WO-014-Edit-Stelle per source-inspection:
    // der review-rewrite-Branch (rund um cleanupHandled = true für Status 'review')
    // muss releaseScopeLock + releaseDbMigrationLock VOR cleanupHandled aufrufen.
    const dispatcherSrc = fs.readFileSync(
      path.resolve(REAL_CWD, 'system/control-plane/dispatcher.ts'), 'utf8',
    )
    // Find the review-rewrite block: status 'review' assignment, then check lock-release follows.
    const rewriteIdx = dispatcherSrc.indexOf("updateActiveWorkorderStatusByRun(wo.workorder_id, runId, 'review')")
    assert.ok(rewriteIdx > 0, 'review-rewrite block must exist in dispatcher.ts')
    const cleanupIdx = dispatcherSrc.indexOf("cleanupHandled = true", rewriteIdx)
    assert.ok(cleanupIdx > rewriteIdx, 'cleanupHandled = true must follow review status update')
    const between = dispatcherSrc.slice(rewriteIdx, cleanupIdx)
    assert.match(between, /releaseScopeLock\(runId\)/, 'WO-014: releaseScopeLock must be called before cleanupHandled=true on review-rewrite path')
    assert.match(between, /releaseDbMigrationLock\(runId\)/, 'WO-014: releaseDbMigrationLock must be called before cleanupHandled=true on review-rewrite path')
    assert.match(between, /review-pipeline rewrite/, 'WO-014: auditScopeLockReleased reason must mention review-pipeline rewrite')
  })

  it('WO-014 E-4: review-pipeline human-needed path releases scope_lock', async () => {
    fs.mkdirSync(`${TEST_DIR}/services/wo014-404/src`, { recursive: true })
    fs.writeFileSync(`${TEST_DIR}/services/wo014-404/src/file.ts`, '// fixture')
    // Spark-C ESCALATEs (low confidence) → goes to Spark-D. Spark-D returns invalid_json
    // (no callSeniorReviewer mock) → review-pipeline returns 'human_needed' → awaiting_approval.
    const mockCallModel = async () => JSON.stringify({
      selected_agent:  'micro-executor',
      risk_level:      'low',
      risks:           [],
      execution_order: ['edit_file'],
      required_gates:  ['files-scope-gate', 'review-gate', 'human-approval-gate'],
      stop_conditions: ['production_execution_without_approval_token'],
      tool: 'write',
      targetPath: 'services/wo014-404/src/file.ts',
      content: '// updated by wo014-404',
    })
    const mockFastReviewer = async () => JSON.stringify({
      status:           'ESCALATE',
      risk:             'HIGH',
      confidence:       0.5,
      violations:       ['mock escalate trigger'],
      recommendations:  ['needs senior review'],
      summary:          'mock spark-c escalate',
      requires_claude:  true,
    })
    const wo = makeWO({
      workorder_id: 'WO-multidispatch-404',
      scope_files:  ['services/wo014-404/src/file.ts'],
    })
    const result = await dispatchWorkorder(wo as any, {
      callModel: mockCallModel,
      executeTool: defaultExecuteTool,
      callFastReviewer: mockFastReviewer,
    })
    // Spark-C ESCALATE + Spark-D invalid_json → human-needed path → result.status === 'blocked', WO-Status === 'awaiting_approval'.
    assert.equal(lockExistsFor(result.run_id), false, 'WO-014: scope_lock muss freigegeben sein nach review-pipeline human-needed')
    const woEntry = state.getAllActiveWorkorders().find(
      w => w.workorder_id === 'WO-multidispatch-404' && w.run_id === result.run_id,
    )
    assert.equal(woEntry?.status, 'awaiting_approval', `Status muss 'awaiting_approval' sein nach human-needed, war: ${woEntry?.status}`)
  })

  // ─── WO-016: No-Tool-Request Active Workorder Status Update ────────────────

  it('WO-016: no-tool-request completed path → status done, scope_lock released, active_runs completed', async () => {
    fs.mkdirSync(`${TEST_DIR}/services/wo016-501/src`, { recursive: true })
    fs.writeFileSync(`${TEST_DIR}/services/wo016-501/src/file.ts`, '// fixture')
    // Mock liefert valides OrchestratorIntent OHNE Tool-Request → no-tool-request completed path.
    const mockCallModel = async () => JSON.stringify({
      selected_agent:  'micro-executor',
      risk_level:      'low',
      risks:           [],
      execution_order: ['analyze'],
      required_gates:  ['files-scope-gate', 'review-gate', 'human-approval-gate'],
      stop_conditions: ['production_execution_without_approval_token'],
    })
    const wo = makeWO({
      workorder_id: 'WO-multidispatch-501',
      scope_files:  ['services/wo016-501/src/file.ts'],
    })
    const result = await dispatchWorkorder(wo as any, { callModel: mockCallModel, executeTool: defaultExecuteTool })

    assert.equal(result.status, 'completed', `Erwartet completed, war: ${result.status}: ${result.error}`)

    // active_workorders: status muss 'done' sein (WO-016).
    const woEntry = state.getAllActiveWorkorders().find(
      w => w.workorder_id === 'WO-multidispatch-501' && w.run_id === result.run_id,
    )
    assert.equal(woEntry?.status, 'done', `WO-016: active_workorders.status muss 'done' sein, war: ${woEntry?.status}`)

    // WO-014: scope_lock + db_migration_lock weiterhin freigegeben.
    assert.equal(lockExistsFor(result.run_id), false, 'WO-014: scope_lock muss freigegeben sein')
    const dbLock = state.isDbMigrationLocked()
    assert.equal(dbLock.locked, false, 'WO-014: db_migration_lock muss freigegeben sein')

    // active_runs.status muss 'completed' bleiben (endRun-Aufruf vor Status-Update).
    const run = state.getActiveRunByRunId(result.run_id!)
    assert.ok(run, 'active_runs Eintrag muss existieren')
    assert.equal(run?.status, 'completed', `active_runs.status muss 'completed' sein, war: ${run?.status}`)
  })

  it('WO-016: dispatcher source-inspection — updateActiveWorkorderStatusByRun(...,"done") direkt nach endRun(...,"completed") und vor releaseScopeLock', () => {
    const dispatcherSrc = fs.readFileSync(
      path.resolve(REAL_CWD, 'system/control-plane/dispatcher.ts'), 'utf8',
    )
    // Locate the no-tool-request branch and verify the WO-016 status-update appears
    // between endRun(...'completed') and releaseScopeLock — symmetrisch zur WO-014-Reihenfolge.
    const branchIdx = dispatcherSrc.indexOf('if (!toolReq) {')
    assert.ok(branchIdx > 0, 'no-tool-request branch must exist in dispatcher.ts')
    const endRunIdx = dispatcherSrc.indexOf("endRun(runId, 'completed')", branchIdx)
    assert.ok(endRunIdx > branchIdx, 'endRun(...,"completed") must follow the if (!toolReq) branch')
    const releaseIdx = dispatcherSrc.indexOf('releaseScopeLock(runId)', endRunIdx)
    assert.ok(releaseIdx > endRunIdx, 'releaseScopeLock must follow endRun within the branch')
    const between = dispatcherSrc.slice(endRunIdx, releaseIdx)
    assert.match(
      between,
      /updateActiveWorkorderStatusByRun\(\s*wo\.workorder_id\s*,\s*runId\s*,\s*'done'\s*\)/,
      'WO-016: updateActiveWorkorderStatusByRun(...,"done") must be called between endRun and releaseScopeLock',
    )
  })

})
