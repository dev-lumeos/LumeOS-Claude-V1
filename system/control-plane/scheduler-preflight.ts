/**
 * LUMEOS Scheduler Preflight — D.2
 * system/control-plane/scheduler-preflight.ts
 *
 * Prüft vor jedem Dispatch: Ist diese WO jetzt dispatchbar?
 *
 * Ergebnis:
 *   GO     — WO kann sofort dispatcht werden
 *   HOLD   — Temporäre Bedingung, retry after delay (Lock, Dependency, Status)
 *   REJECT — Permanente Bedingung, manuelle Intervention nötig (Schema, Terminal, Config)
 *
 * Integration im Dispatcher: runPreflight() vor startRun().
 * Kann auch vom Scheduler standalone aufgerufen werden.
 */

import fs   from 'node:fs'
import path from 'node:path'
import Ajv  from 'ajv'

import type { Workorder } from './dispatcher'
import { checkScopeConflict, isDbMigrationLocked, isSystemStopped } from '../state/state-manager'
import { inferCategoryFromTask }                   from './risk-categories'

// ─── Types ────────────────────────────────────────────────────────────────────

export type PreflightVerdict = 'GO' | 'HOLD' | 'REJECT'

export interface PreflightCheck {
  name:    string
  passed:  boolean
  verdict: PreflightVerdict   // GO = passed, HOLD/REJECT = failed mit dieser Schwere
  reason?: string
}

export interface PreflightResult {
  verdict:      PreflightVerdict
  workorder_id: string
  reason?:      string           // Zusammenfassung des ersten blockierenden Checks
  checks:       PreflightCheck[]
  checked_at:   string
}

// ─── Interne Deps (austauschbar für Tests) ────────────────────────────────────

export interface PreflightDeps {
  /** Gibt aktive Workorders zurück (status + workorder_id). */
  getActiveWorkorders: () => Array<{ workorder_id: string; status: string }>
  /** Prüft Scope-Konflikt mit aktiven Locks. */
  checkScopeConflict:  (scopeFiles: string[]) => { conflicting_run_id: string; conflicting_files: string[] } | null
  /** Prüft DB-Migration-Lock. */
  isDbMigrationLocked: () => { locked: boolean; run_id?: string }
  /** Lädt agents.json. */
  loadAgents:          () => Record<string, any>
  /** C.1: Prüft ob System Stop aktiv ist. */
  isSystemStopped:     () => { stopped: boolean; reason?: string }
}

function makeDefaultDeps(): PreflightDeps {
  const AGENTS_PATH    = path.resolve(process.cwd(), 'system/agent-registry/agents.json')
  const loadAgents = (): Record<string, any> => {
    if (!fs.existsSync(AGENTS_PATH)) return {}
    try { return JSON.parse(fs.readFileSync(AGENTS_PATH, 'utf8')) }
    catch { return {} }
  }
  return {
    getActiveWorkorders: () => {
      const statePath = path.resolve(process.cwd(), 'system/state/runtime_state.json')
      if (!fs.existsSync(statePath)) return []
      try { return JSON.parse(fs.readFileSync(statePath, 'utf8')).active_workorders ?? [] }
      catch { return [] }
    },
    checkScopeConflict,
    isDbMigrationLocked,
    isSystemStopped,
    loadAgents,
  }
}

// ─── Schema Validator (lazy) ──────────────────────────────────────────────────

const ajv = new Ajv({ strict: false })
let validateSchema: ReturnType<typeof ajv.compile> | null = null

function validateWorkorderSchema(wo: unknown): { valid: boolean; errors?: string } {
  const schemaPath = path.resolve(process.cwd(), 'system/workorders/schemas/workorder.schema.json')
  if (!validateSchema && fs.existsSync(schemaPath)) {
    try { validateSchema = ajv.compile(JSON.parse(fs.readFileSync(schemaPath, 'utf8'))) }
    catch { return { valid: true } }  // Schema nicht ladbar → skip
  }
  if (!validateSchema) return { valid: true }
  const valid = validateSchema(wo)
  if (!valid) return { valid: false, errors: ajv.errorsText(validateSchema.errors) }
  return { valid: true }
}

// ─── Einzelne Checks ─────────────────────────────────────────────────────────

function checkSystemNotStopped(deps: PreflightDeps): PreflightCheck {
  const name = 'system_not_stopped'
  const stop = deps.isSystemStopped()
  if (stop.stopped)
    return { name, passed: false, verdict: 'HOLD', reason: `System Stop aktiv: ${stop.reason}` }
  return { name, passed: true, verdict: 'GO' }
}

function checkSchema(wo: Workorder): PreflightCheck {
  const name = 'schema_valid'
  const result = validateWorkorderSchema(wo)
  if (!result.valid)
    return { name, passed: false, verdict: 'REJECT', reason: `Schema ungültig: ${result.errors}` }
  return { name, passed: true, verdict: 'GO' }
}

function checkAgentExists(wo: Workorder, deps: PreflightDeps): PreflightCheck {
  const name = 'agent_exists'
  const agents = deps.loadAgents()
  if (!agents[wo.agent_id])
    return { name, passed: false, verdict: 'REJECT', reason: `Agent nicht in Registry: ${wo.agent_id}` }
  return { name, passed: true, verdict: 'GO' }
}

function checkScopeFilesNotEmpty(wo: Workorder): PreflightCheck {
  const name = 'scope_files_not_empty'
  if (!wo.scope_files || wo.scope_files.length === 0)
    return { name, passed: false, verdict: 'REJECT', reason: 'scope_files ist leer — kein schreibbarer Scope definiert' }
  return { name, passed: true, verdict: 'GO' }
}

function checkRollbackHint(wo: Workorder): PreflightCheck {
  const name = 'rollback_hint_required'
  const category = wo.risk_category ?? inferCategoryFromTask(wo.task)
  if (category === 'db-migration' && !wo.rollback_hint)
    return { name, passed: false, verdict: 'REJECT', reason: 'db-migration WO benötigt rollback_hint' }
  return { name, passed: true, verdict: 'GO' }
}

function checkWoNotTerminal(wo: Workorder, deps: PreflightDeps): PreflightCheck {
  const name = 'wo_not_terminal'
  const active = deps.getActiveWorkorders()
  const existing = active.find(w => w.workorder_id === wo.workorder_id)
  if (!existing) return { name, passed: true, verdict: 'GO' }  // neue WO
  if (existing.status === 'done')
    return { name, passed: false, verdict: 'REJECT', reason: `WO ist terminal (done): ${wo.workorder_id}` }
  if (existing.status === 'failed')
    return { name, passed: false, verdict: 'REJECT', reason: `WO ist terminal (failed): ${wo.workorder_id}` }
  return { name, passed: true, verdict: 'GO' }
}

function checkWoNotCurrentlyRunning(wo: Workorder, deps: PreflightDeps): PreflightCheck {
  const name = 'wo_not_running'
  const active = deps.getActiveWorkorders()
  const existing = active.find(w => w.workorder_id === wo.workorder_id)
  if (existing?.status === 'running')
    return { name, passed: false, verdict: 'HOLD', reason: `WO wird bereits ausgeführt: ${wo.workorder_id}` }
  return { name, passed: true, verdict: 'GO' }
}

function checkWoNotAwaitingApproval(wo: Workorder, deps: PreflightDeps): PreflightCheck {
  const name = 'wo_not_awaiting_approval'
  const active = deps.getActiveWorkorders()
  const existing = active.find(w => w.workorder_id === wo.workorder_id)
  if (existing?.status === 'awaiting_approval')
    return { name, passed: false, verdict: 'HOLD', reason: `WO wartet auf Human Approval: ${wo.workorder_id}` }
  return { name, passed: true, verdict: 'GO' }
}

function checkBlockedByResolved(wo: Workorder, deps: PreflightDeps): PreflightCheck {
  const name = 'blocked_by_resolved'
  if (!wo.blocked_by || wo.blocked_by.length === 0)
    return { name, passed: true, verdict: 'GO' }
  const active = deps.getActiveWorkorders()
  const activeMap = new Map(active.map(w => [w.workorder_id, w.status]))
  const unresolved = wo.blocked_by.filter(depId => {
    const status = activeMap.get(depId)
    return status !== 'done'   // nicht dispatched ODER nicht done
  })
  if (unresolved.length > 0)
    return { name, passed: false, verdict: 'HOLD',
      reason: `Abhängigkeiten noch nicht erledigt: [${unresolved.join(', ')}]` }
  return { name, passed: true, verdict: 'GO' }
}

function checkScopeLock(wo: Workorder, deps: PreflightDeps): PreflightCheck {
  const name = 'scope_lock_free'
  if (!wo.scope_files || wo.scope_files.length === 0)
    return { name, passed: true, verdict: 'GO' }
  const conflict = deps.checkScopeConflict(wo.scope_files)
  if (conflict)
    return { name, passed: false, verdict: 'HOLD',
      reason: `Scope-Lock Konflikt: Dateien [${conflict.conflicting_files.join(', ')}] gesperrt von Run ${conflict.conflicting_run_id}` }
  return { name, passed: true, verdict: 'GO' }
}

function checkDbMigrationLock(wo: Workorder, deps: PreflightDeps): PreflightCheck {
  const name = 'db_migration_lock_free'
  const category = wo.risk_category ?? inferCategoryFromTask(wo.task)
  if (category !== 'db-migration')
    return { name, passed: true, verdict: 'GO' }
  const lockStatus = deps.isDbMigrationLocked()
  if (lockStatus.locked)
    return { name, passed: false, verdict: 'HOLD',
      reason: `DB-Migration-Lock aktiv: gesperrt von Run ${lockStatus.run_id}` }
  return { name, passed: true, verdict: 'GO' }
}

// ─── Haupt-Funktion ───────────────────────────────────────────────────────────

/**
 * Führt alle Preflight-Checks für eine WO durch.
 * Reihenfolge: REJECT-Checks zuerst, dann HOLD-Checks.
 * Bricht bei erstem REJECT oder HOLD nicht ab — sammelt alle Checks.
 * Gesamtergebnis: schlechteste Einzelbewertung (REJECT > HOLD > GO).
 */
export function runPreflight(
  wo: Workorder,
  deps: PreflightDeps = makeDefaultDeps(),
): PreflightResult {
  const checks: PreflightCheck[] = [
    // C.1: System Stop — höchste Priorität, vor allen anderen Checks
    checkSystemNotStopped(deps),
    // REJECT-Checks (permanente Bedingungen)
    checkSchema(wo),
    checkAgentExists(wo, deps),
    checkScopeFilesNotEmpty(wo),
    checkRollbackHint(wo),
    checkWoNotTerminal(wo, deps),
    // HOLD-Checks (temporäre Bedingungen)
    checkWoNotCurrentlyRunning(wo, deps),
    checkWoNotAwaitingApproval(wo, deps),
    checkBlockedByResolved(wo, deps),
    checkScopeLock(wo, deps),
    checkDbMigrationLock(wo, deps),
  ]

  // Gesamtverd: schlechtestes Einzelergebnis
  const firstReject = checks.find(c => !c.passed && c.verdict === 'REJECT')
  const firstHold   = checks.find(c => !c.passed && c.verdict === 'HOLD')

  let verdict: PreflightVerdict = 'GO'
  let reason: string | undefined

  if (firstReject) {
    verdict = 'REJECT'
    reason  = firstReject.reason
  } else if (firstHold) {
    verdict = 'HOLD'
    reason  = firstHold.reason
  }

  return { verdict, workorder_id: wo.workorder_id, reason, checks, checked_at: new Date().toISOString() }
}
