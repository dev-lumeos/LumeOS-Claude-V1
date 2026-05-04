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

import { requiresSparkD, inferCategoryFromTask, type RiskCategory } from './risk-categories'

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
  expectedAgent?:       string
}

// ─── Enums ────────────────────────────────────────────────────────────────────

const ALLOWED_AGENTS = new Set([
  'micro-executor',
  'db-migration-agent',
  'security-specialist',
  'review-agent',
])

/**
 * V1 Hardcoded-Map: workorder.agent_id → validator-target selected_agent.
 *
 * Wird ausschließlich von normalizeOrchestratorIntent() konsultiert, wenn das
 * Modell-Output kein gültiges selected_agent enthält. Validator-Strenge bleibt
 * unberührt: validateOrchestratorIntent() sieht entweder einen ALLOWED_AGENTS-
 * Wert (→ PASS) oder einen ungültigen Wert (→ REWRITE).
 *
 * Phase 2 (eigene WO): agents.json[validator_target_agent]-Feld oder separate
 * Mapping-Datei. V1 hält die Map bewusst hier inline.
 */
export const AGENT_VALIDATOR_MAP: Record<string, string> = {
  'docs-agent':          'micro-executor',
  'test-agent':          'micro-executor',
  'i18n-agent':          'micro-executor',
  'mealcam-agent':       'micro-executor',
  'context-builder':     'micro-executor',
  'governance-compiler': 'micro-executor',
  'senior-coding-agent': 'micro-executor',
  'micro-executor':      'micro-executor',
  'db-migration-agent':  'db-migration-agent',
  'security-specialist': 'security-specialist',
  'review-agent':        'review-agent',
}

/**
 * Schlägt einen Validator-Target-Agent für die WO-`agent_id` aus der Hardcoded-Map nach.
 * Gibt undefined zurück wenn die `agent_id` unbekannt ist — Validator entscheidet dann
 * deterministisch (REWRITE/FAIL über die bestehenden ALLOWED_AGENTS-Regeln).
 */
export function mapAgentToValidatorTarget(workorderAgentId: string): string | undefined {
  return AGENT_VALIDATOR_MAP[workorderAgentId]
}

/**
 * V1 Hardcoded-Map: workorder.risk_category → OrchestratorIntent.risk_level.
 *
 * Wird ausschließlich von normalizeOrchestratorIntent() konsultiert, wenn das
 * Modell-Output kein gültiges risk_level enthält. Validator-Strenge bleibt
 * unberührt: validateOrchestratorIntent() sieht entweder einen ALLOWED_RISK_LEVELS-
 * Wert (→ PASS) oder einen ungültigen Wert (→ REWRITE).
 *
 * Mapping deckt alle 13 RiskCategory-Werte aus risk-categories.ts ab und folgt der
 * CLAUDE.md High-Risk-Regel:
 *   - Autonom (low):    docs, standard, test, i18n
 *   - Cautious (medium): architecture, security, auth, rls, shared-core
 *   - High-Risk (high):  db-migration, payments, medical, release
 */
export const RISK_CATEGORY_TO_RISK_LEVEL_MAP: Record<string, 'low' | 'medium' | 'high'> = {
  'docs':         'low',
  'standard':     'low',
  'test':         'low',
  'i18n':         'low',
  'architecture': 'medium',
  'security':     'medium',
  'auth':         'medium',
  'rls':          'medium',
  'shared-core':  'medium',
  'db-migration': 'high',
  'payments':     'high',
  'medical':      'high',
  'release':      'high',
}

/**
 * Schlägt einen risk_level für die WO-`risk_category` aus der Hardcoded-Map nach.
 * Gibt undefined zurück wenn die `risk_category` undefined/leer/unbekannt ist —
 * Validator entscheidet dann deterministisch (REWRITE/FAIL über die bestehenden
 * ALLOWED_RISK_LEVELS-Regeln).
 */
export function mapRiskCategoryToRiskLevel(
  riskCategory: string | undefined,
): 'low' | 'medium' | 'high' | undefined {
  if (!riskCategory) return undefined
  return RISK_CATEGORY_TO_RISK_LEVEL_MAP[riskCategory]
}

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

// ─── Normalizer ───────────────────────────────────────────────────────────────

/**
 * Normalisiert intent.selected_agent (gegen ALLOWED_AGENTS) und intent.risk_level
 * (gegen ALLOWED_RISK_LEVELS).
 *
 * selected_agent (WO-005, funktional unverändert):
 *   - Falls intent.selected_agent in ALLOWED_AGENTS: unverändert (PASS-Kandidat).
 *   - Falls undefined / leer / nicht in ALLOWED_AGENTS: lookup über AGENT_VALIDATOR_MAP
 *     (Schlüssel: workorder.agent_id).
 *   - Falls workorder.agent_id nicht in der Map: selected_agent unverändert lassen —
 *     Validator entscheidet dann deterministisch (REWRITE → FAIL bei Limit).
 *
 * risk_level (WO-009):
 *   - Falls intent.risk_level in ALLOWED_RISK_LEVELS: unverändert (Modell-Wert gewinnt).
 *   - Falls undefined / leer / nicht in ALLOWED_RISK_LEVELS: lookup über
 *     RISK_CATEGORY_TO_RISK_LEVEL_MAP (Schlüssel: workorder.risk_category).
 *   - Falls workorder.risk_category undefined oder nicht in der Map: risk_level
 *     unverändert lassen — Validator entscheidet dann deterministisch
 *     (REWRITE → FAIL bei Limit).
 *
 * Implementierungsmuster: Accumulator (kein early-Return), damit beide
 * Normalisierungs-Schichten unabhängig voneinander auf demselben Result laufen können.
 * Wird vom Dispatcher zwischen parseOrchestratorIntent() und validateOrchestratorIntent()
 * aufgerufen.
 *
 * Mutiert intent NICHT — gibt ein neues Objekt zurück, wenn mindestens ein Feld
 * normalisiert wurde, sonst die ursprüngliche Referenz.
 */
export function normalizeOrchestratorIntent(
  intent: OrchestratorIntent,
  workorderAgentId: string,
  workorderRiskCategory?: string,
): OrchestratorIntent {
  let result: OrchestratorIntent = intent

  // ── selected_agent (WO-005) ──────────────────────────────────────────────
  const currentAgent = result.selected_agent
  if (typeof currentAgent !== 'string' || !ALLOWED_AGENTS.has(currentAgent)) {
    const mappedAgent = mapAgentToValidatorTarget(workorderAgentId)
    if (mappedAgent) {
      result = { ...result, selected_agent: mappedAgent }
    }
  }

  // ── risk_level (WO-009) ──────────────────────────────────────────────────
  const currentRiskLevel = result.risk_level
  if (typeof currentRiskLevel !== 'string' || !ALLOWED_RISK_LEVELS.has(currentRiskLevel)) {
    const mappedRiskLevel = mapRiskCategoryToRiskLevel(workorderRiskCategory)
    if (mappedRiskLevel) {
      result = { ...result, risk_level: mappedRiskLevel }
    }
  }

  return result
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

  // ── 0. Array-Felder Defensive (WO-012) ──────────────────────────────────
  // OrchestratorIntent-TypeScript-Type deklariert string[] für die 4 Pflicht-
  // Array-Felder, aber Modell-Output ist Runtime-Daten ohne Compile-Time-
  // Garantie. Iteration über non-array (undefined/null/string/object) würde
  // TypeError werfen ("intent.required_gates is not iterable"). Stattdessen
  // kontrolliertes REWRITE mit klarer Reason.
  //
  // Element-Typen werden NICHT hier geprüft — Validator §3 (ALLOWED_GATES)
  // und §4-§8 fangen ungültige Element-Werte deterministisch ab.
  const ARRAY_FIELDS: ReadonlyArray<'risks' | 'execution_order' | 'required_gates' | 'stop_conditions'> = [
    'risks', 'execution_order', 'required_gates', 'stop_conditions',
  ]
  for (const field of ARRAY_FIELDS) {
    const value = intent[field]
    if (!Array.isArray(value)) {
      const typeLabel = value === null ? 'null' : typeof value
      return {
        status: 'REWRITE',
        reason: `Feld "${field}" muss ein Array sein, war: ${typeLabel}`,
        field,
      }
    }
  }

  // ── 1. selected_agent Enum ───────────────────────────────────────────────
  if (!ALLOWED_AGENTS.has(intent.selected_agent)) {
    return {
      status: 'REWRITE',
      reason: `Unbekannter Agent: ${intent.selected_agent}`,
      field: 'selected_agent',
    }
  }

  if (context.expectedAgent && intent.selected_agent !== context.expectedAgent) {
    return {
      status: 'REWRITE',
      reason: `selected_agent mismatch: expected ${context.expectedAgent}, got ${intent.selected_agent}`,
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
  const isDbMigrationWO = context.expectedAgent === 'db-migration-agent'
    || (!context.expectedAgent && context.workorderType === 'db-migration' && intent.selected_agent === 'db-migration-agent')

  if (isDbMigrationWO) {
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

// ─── Review Pipeline ──────────────────────────────────────────────────────────
//
// NUR im Pipeline-Kontext nutzen — siehe system/control-plane/RULES.md.
// Bestehender Validator-Flow oben ist davon NICHT betroffen.
//
// High-Risk-Routing: requiresSparkD() aus risk-categories.ts (Single Source of Truth).

export type ReviewState = 'PASS' | 'REWRITE' | 'ESCALATE' | 'FAIL'

const ALLOWED_REVIEW_STATES = new Set<ReviewState>(['PASS', 'REWRITE', 'ESCALATE', 'FAIL'])
const ALLOWED_REVIEW_RISK_LEVELS = new Set(['LOW', 'MEDIUM', 'HIGH'])

export interface ReviewOutput {
  status:           ReviewState
  risk:             'LOW' | 'MEDIUM' | 'HIGH'
  confidence:       number
  violations:       string[]
  recommendations:  string[]
  summary:          string
  requires_claude:  boolean
}

/**
 * Validiert einen Reviewer-Output (Spark 3 / Spark 4) gegen das Output-Contract.
 * Wirft bei Schema-Verletzung — Caller entscheidet ob das ESCALATE oder REWRITE auslöst.
 *
 * Reviewer-Risk-Casing ist UPPERCASE (LOW/MEDIUM/HIGH) — anders als
 * Orchestrator-risk_level (lowercase). Bewusst getrennte Domänen.
 */
export function validateReviewOutput(output: any): true {
  if (!output || typeof output !== 'object') {
    throw new Error('Invalid review output: not an object')
  }

  const { status, risk, confidence } = output

  if (!ALLOWED_REVIEW_STATES.has(status)) {
    throw new Error(`Invalid review status: ${status}`)
  }

  if (!ALLOWED_REVIEW_RISK_LEVELS.has(risk)) {
    throw new Error(`Invalid risk level: ${risk}`)
  }

  if (typeof confidence !== 'number' || confidence < 0 || confidence > 1) {
    throw new Error(`Invalid confidence: ${confidence}`)
  }

  return true
}

/**
 * Prüft ob ein Workorder die Spark-4-Pflicht auslöst.
 * Delegiert an requiresSparkD() aus risk-categories.ts (Single Source of Truth).
 * Spark 3 läuft trotzdem (non-blocking, run-and-log) — siehe RULES.md Sektion 3.
 */
export function requiresSeniorReview(category?: string): boolean {
  return requiresSparkD(category)
}
