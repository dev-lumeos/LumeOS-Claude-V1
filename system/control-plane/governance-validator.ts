/**
 * LUMEOS Governance Validator
 * system/control-plane/governance-validator.ts
 *
 * Validiert Qwen3.6 Orchestrator-Output vor executeTool().
 * Alle Entscheidungen sind deterministisch — kein LLM beteiligt.
 *
 * Pflicht-Reihenfolge im Dispatcher:
 *   callModel() → parseOrchestratorIntent() → validateOrchestratorIntent() → executeTool()
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface OrchestratorIntent {
  selected_agent:   string
  risk_level:       string
  risks:            string[]
  execution_order:  string[]
  required_gates:   string[]
  stop_conditions:  string[]
}

export type ValidationStatus = 'PASS' | 'FAIL' | 'BLOCKED' | 'REWRITE'

export interface ValidationResult {
  status:  ValidationStatus
  reason?: string
  field?:  string
}

export interface ValidationContext {
  approvalTokenPresent: boolean
  filesAllowed:         string[]
  workorderType?:       'db-migration' | 'security' | 'standard'
}

// ─── Enums ────────────────────────────────────────────────────────────────────

const ALLOWED_AGENTS = new Set([
  'micro-executor',
  'db-migration-agent',
  'security-specialist',
  'review-agent',
])

const ALLOWED_GATES = new Set([
  'db-migration-gate',
  'rollback-gate',
  'typecheck-gate',
  'test-gate',
  'review-gate',
  'human-approval-gate',
  'files-scope-gate',
  'security-gate',
])

const ALLOWED_RISK_LEVELS = new Set(['low', 'medium', 'high'])

// Strings die NICHT in execution_order erlaubt sind wenn kein Approval-Token
const PRODUCTION_KEYWORDS = [
  'production',
  'prod',
  'live',
  'deploy',
  'release',
  'apply_migration_to_production',
  'apply to production',
  'ci/cd production',
]

// Positive Zustände die NICHT in stop_conditions erlaubt sind
// Stop-Conditions müssen blockierend/negativ sein
const POSITIVE_STATE_KEYWORDS = [
  'approved',
  'passed',
  'granted',
  'success',
  'completed',
]

// Gates die bei DB-Migrations-Agent Pflicht sind
const DB_MIGRATION_REQUIRED_GATES = [
  'db-migration-gate',
  'rollback-gate',
  'typecheck-gate',
  'test-gate',
  'review-gate',
  'files-scope-gate',
]

// Gates die bei Security-WOs Pflicht sind
const SECURITY_REQUIRED_GATES = [
  'security-gate',
  'review-gate',
  'test-gate',
  'files-scope-gate',
]

// Keywords die einen WO als Security-relevant markieren
const SECURITY_KEYWORDS = [
  'auth',
  'rls',
  'policy',
  'permissions',
  'medical',
  'admin',
  'middleware',
]

// ─── Parser ───────────────────────────────────────────────────────────────────

/**
 * Parst den Qwen3.6 Output als OrchestratorIntent.
 * Wirft bei leerem oder nicht-parsebarem Output.
 */
export function parseOrchestratorIntent(content: string): OrchestratorIntent {
  const trimmed = content.trim()
  if (!trimmed) throw new Error('QWEN_EMPTY_CONTENT')

  // Fenced JSON
  const fenced = trimmed.match(/```json\s*(\{[\s\S]*?\})\s*```/)
  if (fenced) return JSON.parse(fenced[1]) as OrchestratorIntent

  // Plain JSON
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    return JSON.parse(trimmed) as OrchestratorIntent
  }

  throw new Error(`QWEN_NOT_JSON: ${trimmed.slice(0, 100)}`)
}

// ─── Validator ────────────────────────────────────────────────────────────────

/**
 * Validiert einen OrchestratorIntent gegen alle Governance-Regeln.
 * Gibt PASS, FAIL, BLOCKED oder REWRITE zurück.
 *
 * REWRITE: Dispatcher kann bis MAX_REWRITE_LOOPS=2 einen Rewrite-Request senden.
 * FAIL:    Sofortiger Stopp, Audit-Log.
 * BLOCKED: FILES_ALLOWED Verletzung — kein automatischer Rewrite.
 */
export function validateOrchestratorIntent(
  intent: OrchestratorIntent,
  context: ValidationContext,
): ValidationResult {

  // ── 1. selected_agent Enum ───────────────────────────────────────────────
  if (!ALLOWED_AGENTS.has(intent.selected_agent)) {
    return {
      status: 'REWRITE',
      reason: `Unbekannter Agent: ${intent.selected_agent}`,
      field: 'selected_agent',
    }
  }

  // ── 2. risk_level Enum ───────────────────────────────────────────────────
  if (!ALLOWED_RISK_LEVELS.has(intent.risk_level)) {
    return {
      status: 'REWRITE',
      reason: `Ungültiger risk_level: ${intent.risk_level}`,
      field: 'risk_level',
    }
  }

  // ── 3. Gate IDs müssen aus ALLOWED_GATES stammen ────────────────────────
  for (const gate of intent.required_gates) {
    if (!ALLOWED_GATES.has(gate)) {
      return {
        status: 'REWRITE',
        reason: `Unbekannte Gate-ID: ${gate}`,
        field: 'required_gates',
      }
    }
  }

  // ── 4. Stop-Conditions dürfen KEINE positiven Zustände enthalten ─────────
  for (const condition of intent.stop_conditions) {
    const lower = condition.toLowerCase()
    for (const kw of POSITIVE_STATE_KEYWORDS) {
      if (lower.includes(kw)) {
        return {
          status: 'REWRITE',
          reason: `stop_condition enthält positiven Zustand "${kw}": ${condition}`,
          field: 'stop_conditions',
        }
      }
    }
  }

  // ── 5. Production-Block wenn kein Approval-Token ─────────────────────────
  if (!context.approvalTokenPresent) {
    for (const step of intent.execution_order) {
      const lower = step.toLowerCase()
      for (const kw of PRODUCTION_KEYWORDS) {
        if (lower.includes(kw)) {
          return {
            status: 'FAIL',
            reason: `Production-Step in execution_order ohne approval_token: ${step}`,
            field: 'execution_order',
          }
        }
      }
    }

    // human-approval-gate Pflicht wenn kein Token
    if (!intent.required_gates.includes('human-approval-gate')) {
      return {
        status: 'REWRITE',
        reason: 'human-approval-gate fehlt wenn approval_token_present=false',
        field: 'required_gates',
      }
    }

    // stop_condition Pflicht wenn kein Token
    if (!intent.stop_conditions.includes('production_execution_without_approval_token')) {
      return {
        status: 'REWRITE',
        reason: 'stop_condition "production_execution_without_approval_token" fehlt',
        field: 'stop_conditions',
      }
    }
  }

  // ── 6. DB-Migration: Pflicht-Gates ───────────────────────────────────────
  if (intent.selected_agent === 'db-migration-agent') {
    for (const required of DB_MIGRATION_REQUIRED_GATES) {
      if (!intent.required_gates.includes(required)) {
        return {
          status: 'REWRITE',
          reason: `DB-Migration: Pflicht-Gate fehlt: ${required}`,
          field: 'required_gates',
        }
      }
    }
  }

  // ── 7. Security-WOs: Pflicht-Gates ───────────────────────────────────────
  const isSecurityWO = context.workorderType === 'security'
    || intent.selected_agent === 'security-specialist'

  if (isSecurityWO) {
    for (const required of SECURITY_REQUIRED_GATES) {
      if (!intent.required_gates.includes(required)) {
        return {
          status: 'REWRITE',
          reason: `Security-WO: Pflicht-Gate fehlt: ${required}`,
          field: 'required_gates',
        }
      }
    }
  }

  // ── 8. FILES_ALLOWED Scope-Check ─────────────────────────────────────────
  // Nur wenn filesAllowed explizit gesetzt — kein check bei leerem Array
  if (context.filesAllowed.length > 0) {
    for (const step of intent.execution_order) {
      // Prüft ob der Step einen Dateipfad enthält der nicht in filesAllowed ist
      const pathMatch = step.match(/["']([^"']+\.[a-z]{2,4})["']/i)
      if (pathMatch) {
        const filePath = pathMatch[1]
        const allowed = context.filesAllowed.some(f =>
          filePath.startsWith(f) || filePath === f
        )
        if (!allowed) {
          return {
            status: 'BLOCKED',
            reason: `FILES_ALLOWED Verletzung: ${filePath} nicht in scope`,
            field: 'execution_order',
          }
        }
      }
    }
  }

  return { status: 'PASS' }
}

// ─── Workorder-Typ Inferenz ───────────────────────────────────────────────────

/**
 * Erkennt den WO-Typ anhand des Tasks für Validator-Kontext.
 */
export function inferWorkorderType(task: string): ValidationContext['workorderType'] {
  const lower = task.toLowerCase()
  if (lower.includes('migration') || lower.includes('schema') || lower.includes('alter table')) {
    return 'db-migration'
  }
  if (SECURITY_KEYWORDS.some(kw => lower.includes(kw))) {
    return 'security'
  }
  return 'standard'
}
