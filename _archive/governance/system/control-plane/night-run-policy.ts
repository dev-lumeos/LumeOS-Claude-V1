/**
 * LUMEOS Night-Run-Policy V1 — C.3
 * system/control-plane/night-run-policy.ts
 *
 * Definiert was im autonomen Nacht-Betrieb erlaubt ist und was nicht.
 * Stellt sicher dass das System vor Night-Runs in einem sauberen Zustand ist.
 *
 * Konzept:
 *   - NightRunPolicy: Konfiguration was erlaubt/geblockt ist
 *   - checkNightRunReadiness(): Pre-Night-Check (Session-Level)
 *   - isAllowedInNightRun(): Per-WO-Check für einzelne Workorders
 *   - Integration in scheduler-preflight.ts als optionaler Check
 *
 * Erlaubte Kategorien (AUTONOMOUS_MODE):
 *   standard, docs, i18n, test
 *
 * Immer HOLD im Night-Run (brauchen Human Approval vor Start):
 *   db-migration, payments, medical, release
 *
 * Erlaubt mit erhöhter Vorsicht (Spark D mandatory, kein Auto-Retry):
 *   security, auth, rls, shared-core, architecture
 *
 * CLI:
 *   npx tsx system/control-plane/night-run-policy.ts check
 *   npx tsx system/control-plane/night-run-policy.ts status
 */

import fs   from 'node:fs'
import path from 'node:path'
import { evaluateStopRules, DEFAULT_CONFIG as STOP_DEFAULT } from './stop-rules'
import { isSystemStopped } from '../state/state-manager'
import type { RiskCategory } from './risk-categories'

// ─── Policy-Konfiguration ─────────────────────────────────────────────────────

/** Kategorien die vollständig autonom (ohne Human Approval) laufen dürfen. */
export const AUTONOMOUS_CATEGORIES: RiskCategory[] = [
  'standard', 'docs', 'i18n', 'test',
]

/**
 * Kategorien die im Night-Run IMMER einen Human-Approval-Token brauchen.
 * Kein Auto-Dispatch ohne vorherige Freigabe in queue.json.
 */
export const REQUIRES_PRIOR_APPROVAL: RiskCategory[] = [
  'db-migration', 'payments', 'medical', 'release',
]

/**
 * Kategorien die im Night-Run laufen dürfen, aber Spark D mandatory und
 * kein Auto-Retry bekommen (erhöhte Vorsicht).
 */
export const CAUTIOUS_CATEGORIES: RiskCategory[] = [
  'security', 'auth', 'rls', 'shared-core', 'architecture',
]

export interface NightRunPolicy {
  /** Night-Run-Modus aktiv */
  night_run_active:        boolean
  autonomous_categories:   RiskCategory[]
  requires_prior_approval: RiskCategory[]
  cautious_categories:     RiskCategory[]
  /** Maximale Anzahl paralleler Night-Run-WOs */
  max_parallel_runs:       number
  /** Stop-Rules werden vor jeder WO ausgewertet */
  enforce_stop_rules:      boolean
  /** Maximale Session-Laufzeit in Minuten */
  max_session_minutes:     number
}

export const DEFAULT_POLICY: NightRunPolicy = {
  night_run_active:        false,
  autonomous_categories:   AUTONOMOUS_CATEGORIES,
  requires_prior_approval: REQUIRES_PRIOR_APPROVAL,
  cautious_categories:     CAUTIOUS_CATEGORIES,
  max_parallel_runs:       2,
  enforce_stop_rules:      true,
  max_session_minutes:     480,   // 8 Stunden
}

// ─── Policy-Datei ─────────────────────────────────────────────────────────────

function getPolicyPath(): string {
  return path.resolve(process.cwd(), 'system/control-plane/night-run-policy.json')
}

export function loadPolicy(): NightRunPolicy {
  const p = getPolicyPath()
  if (!fs.existsSync(p)) return { ...DEFAULT_POLICY }
  try {
    const saved = JSON.parse(fs.readFileSync(p, 'utf8'))
    return { ...DEFAULT_POLICY, ...saved }
  } catch { return { ...DEFAULT_POLICY } }
}

export function savePolicy(policy: NightRunPolicy): void {
  const p   = getPolicyPath()
  const dir = path.dirname(p)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(p, JSON.stringify(policy, null, 2), 'utf8')
}

// ─── Per-WO-Check ─────────────────────────────────────────────────────────────

export type NightRunVerdict =
  | 'AUTONOMOUS'         // Darf ohne Human-Approval laufen
  | 'CAUTIOUS'           // Darf laufen, Spark D mandatory + kein Auto-Retry
  | 'REQUIRES_APPROVAL'  // Braucht vorherige Freigabe in Approval Queue
  | 'BLOCKED'            // Night-Run-Modus inaktiv oder andere Blockierung

export interface NightRunWoCheck {
  verdict:       NightRunVerdict
  risk_category: string
  reason:        string
}

/** Prüft ob eine WO mit der gegebenen Risk-Kategorie im Night-Run laufen darf. */
export function isAllowedInNightRun(
  riskCategory: string,
  policy: NightRunPolicy = loadPolicy(),
): NightRunWoCheck {
  if (!policy.night_run_active) {
    return { verdict: 'BLOCKED', risk_category: riskCategory,
      reason: 'Night-Run-Modus ist nicht aktiv' }
  }

  const cat = riskCategory as RiskCategory

  if (policy.autonomous_categories.includes(cat)) {
    return { verdict: 'AUTONOMOUS', risk_category: riskCategory,
      reason: `Kategorie '${cat}' ist für autonomen Betrieb zugelassen` }
  }

  if (policy.cautious_categories.includes(cat)) {
    return { verdict: 'CAUTIOUS', risk_category: riskCategory,
      reason: `Kategorie '${cat}' erfordert Spark D Review + kein Auto-Retry` }
  }

  if (policy.requires_prior_approval.includes(cat)) {
    return { verdict: 'REQUIRES_APPROVAL', risk_category: riskCategory,
      reason: `Kategorie '${cat}' erfordert Human Approval vor Night-Run Dispatch` }
  }

  // Unbekannte Kategorie → CAUTIOUS als sicherer Default
  return { verdict: 'CAUTIOUS', risk_category: riskCategory,
    reason: `Unbekannte Kategorie '${cat}' — Cautious-Modus als sicherer Default` }
}

// ─── Readiness-Check ──────────────────────────────────────────────────────────

export interface ReadinessCheck {
  name:    string
  passed:  boolean
  reason?: string
}

export interface NightRunReadiness {
  ready:        boolean
  checked_at:   string
  policy:       NightRunPolicy
  checks:       ReadinessCheck[]
  block_reason?: string
}

/** Vollständiger Pre-Night-Readiness-Check (Session-Level). */
export function checkNightRunReadiness(
  policy: NightRunPolicy = loadPolicy(),
): NightRunReadiness {
  const checks: ReadinessCheck[] = []

  // 1. Night-Run-Modus aktiviert?
  checks.push({
    name:   'night_run_mode_enabled',
    passed: policy.night_run_active,
    reason: policy.night_run_active ? undefined : 'night_run_active = false — Policy aktivieren',
  })

  // 2. System nicht gestoppt
  const stopStatus = isSystemStopped()
  checks.push({
    name:   'system_not_stopped',
    passed: !stopStatus.stopped,
    reason: stopStatus.stopped ? `System Stop aktiv: ${stopStatus.reason}` : undefined,
  })

  // 3. Stop-Rules: keine Verletzungen
  const stopEval = evaluateStopRules(STOP_DEFAULT)
  checks.push({
    name:   'stop_rules_clean',
    passed: !stopEval.any_triggered,
    reason: stopEval.any_triggered
      ? `Stop-Regeln verletzt: ${stopEval.triggered_rules.map(r => r.rule).join(', ')}`
      : undefined,
  })

  // 4. Approval Queue: keine offenen kritischen Approvals
  const queuePath = path.resolve(process.cwd(), 'system/approval/queue.json')
  let pendingApprovals = 0
  if (fs.existsSync(queuePath)) {
    try {
      const q = JSON.parse(fs.readFileSync(queuePath, 'utf8'))
      pendingApprovals = Object.values(q).filter((i: any) => i.status === 'pending').length
    } catch {}
  }
  checks.push({
    name:   'no_pending_approvals',
    passed: pendingApprovals === 0,
    reason: pendingApprovals > 0
      ? `${pendingApprovals} offene Approvals — erst entscheiden: npx tsx system/approval/approval-cli.ts list`
      : undefined,
  })

  // 5. Runtime-State: keine aktiven Runs
  const statePath = path.resolve(process.cwd(), 'system/state/runtime_state.json')
  let activeRunningCount = 0
  if (fs.existsSync(statePath)) {
    try {
      const s = JSON.parse(fs.readFileSync(statePath, 'utf8'))
      activeRunningCount = (s.active_runs ?? []).filter((r: any) => r.status === 'running').length
    } catch {}
  }
  checks.push({
    name:   'no_active_runs',
    passed: activeRunningCount === 0,
    reason: activeRunningCount > 0
      ? `${activeRunningCount} Runs aktiv — warten bis abgeschlossen`
      : undefined,
  })

  const allPassed   = checks.every(c => c.passed)
  const firstFailed = checks.find(c => !c.passed)

  return {
    ready:        allPassed,
    checked_at:   new Date().toISOString(),
    policy,
    checks,
    block_reason: firstFailed?.reason,
  }
}

// ─── Policy-Management ────────────────────────────────────────────────────────

/** Aktiviert Night-Run-Modus in der Policy-Datei. */
export function activateNightRun(): NightRunPolicy {
  const policy = loadPolicy()
  policy.night_run_active = true
  savePolicy(policy)
  return policy
}

/** Deaktiviert Night-Run-Modus in der Policy-Datei. */
export function deactivateNightRun(): NightRunPolicy {
  const policy = loadPolicy()
  policy.night_run_active = false
  savePolicy(policy)
  return policy
}

// ─── CLI ──────────────────────────────────────────────────────────────────────

async function main() {
  const cmd = process.argv[2]

  if (!cmd || cmd === 'status') {
    const policy    = loadPolicy()
    const readiness = checkNightRunReadiness(policy)
    const icon = readiness.ready ? '✅' : '🔴'

    console.log(`\n── Night-Run-Policy Status ──────────────────────`)
    console.log(`Night-Run Modus: ${policy.night_run_active ? '🌙 AKTIV' : '💤 INAKTIV'}`)
    console.log(`Bereit:          ${icon} ${readiness.ready ? 'READY' : 'NOT READY'}`)
    console.log()

    for (const c of readiness.checks) {
      const ci = c.passed ? '✅' : '🔴'
      console.log(`${ci} ${c.name}`)
      if (!c.passed && c.reason) console.log(`     → ${c.reason}`)
    }

    console.log()
    console.log(`Autonomous:   ${policy.autonomous_categories.join(', ')}`)
    console.log(`Cautious:     ${policy.cautious_categories.join(', ')}`)
    console.log(`Needs Approval: ${policy.requires_prior_approval.join(', ')}`)
    console.log()
    return
  }

  if (cmd === 'check') {
    const readiness = checkNightRunReadiness()
    console.log(readiness.ready
      ? `\n✅ Night-Run READY — System ist bereit\n`
      : `\n🔴 Night-Run NOT READY — ${readiness.block_reason}\n`)
    process.exit(readiness.ready ? 0 : 1)
  }

  if (cmd === 'activate') {
    activateNightRun()
    console.log(`\n🌙 Night-Run aktiviert. Status prüfen:`)
    console.log(`   npx tsx system/control-plane/night-run-policy.ts check\n`)
    return
  }

  if (cmd === 'deactivate') {
    deactivateNightRun()
    console.log(`\n💤 Night-Run deaktiviert.\n`)
    return
  }

  console.error(`Unbekannter Command: ${cmd}`)
  console.log('Commands: status | check | activate | deactivate')
  process.exit(1)
}

const isMain = process.argv[1]?.includes('night-run-policy')
if (isMain) {
  main().catch(err => { console.error(err); process.exit(1) })
}
