/**
 * LUMEOS Stop Rules Engine — C.1b
 * system/control-plane/stop-rules.ts
 *
 * Automatische Stop-Trigger basierend auf messbaren Schwellwerten.
 * Baut auf C.1 (triggerSystemStop) auf.
 *
 * Regeln (alle konfigurierbar via StopRulesConfig):
 *   FAILED_RUNS_THRESHOLD    — Zu viele failed Runs in einer Session
 *   HUMAN_NEEDED_THRESHOLD   — Zu viele HUMAN_NEEDED ohne Entscheidung
 *   INVALID_JSON_SPIKE       — invalid_json Rate überschreitet Schwellwert
 *   FILES_SCOPE_VIOLATIONS   — Wiederholte Scope-Verstöße
 *   ESCALATION_RATE_SPIKE    — Eskalationsrate Spark C zu hoch
 *
 * Integration:
 *   - Läuft als eigenständiger Check via CLI
 *   - Kann in Preflight-Deps injiziert werden (Schritt checkSystemNotStopped)
 *   - Dispatcher kann nach Run-Finalisierung evaluieren
 *
 * CLI:
 *   npx tsx system/control-plane/stop-rules.ts
 *   npx tsx system/control-plane/stop-rules.ts --dry-run
 */

import fs   from 'node:fs'
import path from 'node:path'
import { triggerSystemStop, isSystemStopped } from '../state/state-manager'

// ─── Konfiguration ────────────────────────────────────────────────────────────

export interface StopRulesConfig {
  /** Maximale Anzahl failed Runs bevor Stop ausgelöst wird */
  failed_runs_threshold:        number
  /** Maximale Anzahl offener (pending) Human-Needed Approvals */
  human_needed_pending_max:     number
  /** Maximale invalid_json Rate pro Tier (0–1) */
  invalid_json_rate_max:        number
  /** Minimale Anzahl Reviews damit invalid_json Rate relevant ist */
  invalid_json_min_samples:     number
  /** Maximale Anzahl files_scope_violation Events */
  scope_violation_max:          number
  /** Maximale Eskalationsrate Spark C → Spark D (0–1) */
  escalation_rate_max:          number
  /** Minimale Anzahl Reviews damit Eskalationsrate relevant ist */
  escalation_min_samples:       number
}

export const DEFAULT_CONFIG: StopRulesConfig = {
  failed_runs_threshold:    5,
  human_needed_pending_max: 3,
  invalid_json_rate_max:    0.5,    // >50% invalid_json → Stop
  invalid_json_min_samples: 3,
  scope_violation_max:      2,
  escalation_rate_max:      0.8,    // >80% Escalation Rate → Stop
  escalation_min_samples:   5,
}

// ─── Rule-Result ──────────────────────────────────────────────────────────────

export interface StopRuleResult {
  rule:        string
  triggered:   boolean
  value:       number
  threshold:   number
  reason?:     string
}

export interface StopRulesEvaluation {
  evaluated_at:    string
  any_triggered:   boolean
  triggered_rules: StopRuleResult[]
  all_rules:       StopRuleResult[]
  system_already_stopped: boolean
}

// ─── Daten-Reader ─────────────────────────────────────────────────────────────

function readJsonl<T = any>(filepath: string): T[] {
  const abs = path.resolve(process.cwd(), filepath)
  if (!fs.existsSync(abs)) return []
  return fs.readFileSync(abs, 'utf8')
    .split('\n').filter(Boolean)
    .map(l => { try { return JSON.parse(l) } catch { return null } })
    .filter(Boolean) as T[]
}

function readJson<T = any>(filepath: string): T | null {
  const abs = path.resolve(process.cwd(), filepath)
  if (!fs.existsSync(abs)) return null
  try { return JSON.parse(fs.readFileSync(abs, 'utf8')) }
  catch { return null }
}

// ─── Einzelne Regeln ─────────────────────────────────────────────────────────

function checkFailedRuns(cfg: StopRulesConfig): StopRuleResult {
  const state = readJson<any>('system/state/runtime_state.json')
  const runs  = state?.active_runs ?? []
  const failed = runs.filter((r: any) => r.status === 'failed').length
  return {
    rule:      'FAILED_RUNS_THRESHOLD',
    triggered: failed >= cfg.failed_runs_threshold,
    value:     failed,
    threshold: cfg.failed_runs_threshold,
    reason:    failed >= cfg.failed_runs_threshold
      ? `${failed} failed Runs >= Schwellwert ${cfg.failed_runs_threshold}`
      : undefined,
  }
}

function checkHumanNeededPending(cfg: StopRulesConfig): StopRuleResult {
  const queue   = readJson<any>('system/approval/queue.json') ?? {}
  const pending = Object.values(queue).filter((i: any) => i.status === 'pending').length
  return {
    rule:      'HUMAN_NEEDED_PENDING_MAX',
    triggered: pending >= cfg.human_needed_pending_max,
    value:     pending,
    threshold: cfg.human_needed_pending_max,
    reason:    pending >= cfg.human_needed_pending_max
      ? `${pending} offene Approvals >= Schwellwert ${cfg.human_needed_pending_max}`
      : undefined,
  }
}

function checkInvalidJsonRate(cfg: StopRulesConfig): StopRuleResult {
  const metrics = readJsonl<any>('system/state/pipeline-metrics.jsonl')
  // Pro Tier auswerten — wenn irgendein Tier über dem Schwellwert
  const tiers: Record<string, { total: number; invalidJson: number }> = {}
  for (const m of metrics) {
    if (!m.tier) continue
    if (!tiers[m.tier]) tiers[m.tier] = { total: 0, invalidJson: 0 }
    tiers[m.tier].total++
    if ((m.outcome ?? '').toLowerCase() === 'invalid_json') tiers[m.tier].invalidJson++
  }

  let worstRate = 0
  let worstTier = ''
  let worstCount = 0
  for (const [tier, d] of Object.entries(tiers)) {
    if (d.total < cfg.invalid_json_min_samples) continue
    const rate = d.invalidJson / d.total
    if (rate > worstRate) { worstRate = rate; worstTier = tier; worstCount = d.total }
  }

  const triggered = worstRate >= cfg.invalid_json_rate_max
  return {
    rule:      'INVALID_JSON_SPIKE',
    triggered,
    value:     Math.round(worstRate * 100),
    threshold: Math.round(cfg.invalid_json_rate_max * 100),
    reason:    triggered
      ? `${worstTier}: ${Math.round(worstRate * 100)}% invalid_json (${worstCount} Reviews, Schwellwert ${Math.round(cfg.invalid_json_rate_max * 100)}%)`
      : undefined,
  }
}

function checkScopeViolations(cfg: StopRulesConfig): StopRuleResult {
  const audit = readJsonl<any>('system/state/audit.jsonl')
  const violations = audit.filter(e =>
    e.event === 'files_scope_violation' || e.event === 'scope_lock_conflict'
  ).length
  return {
    rule:      'FILES_SCOPE_VIOLATIONS',
    triggered: violations >= cfg.scope_violation_max,
    value:     violations,
    threshold: cfg.scope_violation_max,
    reason:    violations >= cfg.scope_violation_max
      ? `${violations} Scope-Verstöße >= Schwellwert ${cfg.scope_violation_max}`
      : undefined,
  }
}

function checkEscalationRate(cfg: StopRulesConfig): StopRuleResult {
  const audit  = readJsonl<any>('system/state/pipeline-audit.jsonl')
  // Nur Spark C auswerten — das ist die erste Tier
  const completed = audit.filter(e => e.event === 'review_completed' && e.tier === 'spark-c').length
  const escalated = audit.filter(e => e.event === 'review_escalated'  && e.tier === 'spark-c').length

  if (completed < cfg.escalation_min_samples) {
    return {
      rule: 'ESCALATION_RATE_SPIKE', triggered: false,
      value: 0, threshold: Math.round(cfg.escalation_rate_max * 100),
      reason: undefined,
    }
  }

  const rate    = escalated / completed
  const triggered = rate >= cfg.escalation_rate_max
  return {
    rule:      'ESCALATION_RATE_SPIKE',
    triggered,
    value:     Math.round(rate * 100),
    threshold: Math.round(cfg.escalation_rate_max * 100),
    reason:    triggered
      ? `spark-c Eskalationsrate ${Math.round(rate * 100)}% >= Schwellwert ${Math.round(cfg.escalation_rate_max * 100)}% (${completed} Reviews)`
      : undefined,
  }
}

// ─── Haupt-Evaluierung ────────────────────────────────────────────────────────

export function evaluateStopRules(
  config: StopRulesConfig = DEFAULT_CONFIG,
): StopRulesEvaluation {
  const stopStatus = isSystemStopped()

  const allRules: StopRuleResult[] = [
    checkFailedRuns(config),
    checkHumanNeededPending(config),
    checkInvalidJsonRate(config),
    checkScopeViolations(config),
    checkEscalationRate(config),
  ]

  const triggered = allRules.filter(r => r.triggered)

  return {
    evaluated_at:           new Date().toISOString(),
    any_triggered:          triggered.length > 0,
    triggered_rules:        triggered,
    all_rules:              allRules,
    system_already_stopped: stopStatus.stopped,
  }
}

/**
 * Evaluiert Stop-Regeln und löst System Stop aus wenn nötig.
 * Idempotent — kein doppelter Stop wenn bereits aktiv.
 * @param dryRun — wenn true: nur evaluieren, nicht auslösen
 * @returns Evaluation + ob Stop ausgelöst wurde
 */
export async function runStopRules(
  config: StopRulesConfig = DEFAULT_CONFIG,
  dryRun = false,
): Promise<{ evaluation: StopRulesEvaluation; stopped: boolean }> {
  const evaluation = evaluateStopRules(config)

  if (!evaluation.any_triggered || evaluation.system_already_stopped) {
    return { evaluation, stopped: false }
  }

  const reason = evaluation.triggered_rules
    .map(r => r.reason)
    .join(' | ')

  if (!dryRun) {
    await triggerSystemStop(reason, 'auto-stop-rules')
  }

  return { evaluation, stopped: !dryRun }
}

// ─── CLI ──────────────────────────────────────────────────────────────────────

async function main() {
  const args   = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')

  if (dryRun) console.log('\n🔍 Dry-Run Modus — kein Stop wird ausgelöst\n')

  const { evaluation, stopped } = await runStopRules(DEFAULT_CONFIG, dryRun)

  console.log(`Stop-Rules Evaluation: ${evaluation.evaluated_at}`)
  console.log(`System bereits gestoppt: ${evaluation.system_already_stopped}`)
  console.log()

  for (const rule of evaluation.all_rules) {
    const icon = rule.triggered ? '🔴' : '✅'
    const val  = rule.rule.includes('RATE') || rule.rule.includes('SPIKE')
      ? `${rule.value}% (max: ${rule.threshold}%)`
      : `${rule.value} (max: ${rule.threshold})`
    console.log(`${icon} ${rule.rule}: ${val}`)
    if (rule.triggered && rule.reason) console.log(`     → ${rule.reason}`)
  }

  console.log()
  if (evaluation.any_triggered) {
    if (stopped) {
      console.log(`⛔ SYSTEM STOP AUSGELÖST: ${evaluation.triggered_rules.map(r => r.rule).join(', ')}`)
      console.log(`   Aufheben: npx tsx -e "import {clearSystemStop} from './system/state/state-manager'; clearSystemStop()"`)
    } else {
      console.log(`⚠️  Stop-Regeln verletzt (Dry-Run — kein Stop ausgelöst)`)
    }
  } else {
    console.log(`✅ Alle Stop-Regeln OK — kein Stop nötig`)
  }
  console.log()
}

const isMain = process.argv[1]?.includes('stop-rules')
if (isMain) {
  main().catch(err => { console.error(err); process.exit(1) })
}
