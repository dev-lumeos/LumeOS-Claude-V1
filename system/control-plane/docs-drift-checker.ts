/**
 * LUMEOS Docs-Drift Checker — E.2
 * system/control-plane/docs-drift-checker.ts
 *
 * Prüft ob kritische Docs-Dateien gegenüber ihren Code-Quellen veraltet sind.
 * Nutzt Git-Last-Commit-Timestamps für den Vergleich.
 *
 * Drift-Klassen:
 *   DRIFT_BLOCKING — kritisch, macht System falsch (sofort beheben)
 *   DRIFT_WARNING  — suboptimal, sollte zeitnah behoben werden
 *   OK             — alles aktuell
 *
 * CLI:
 *   npx tsx system/control-plane/docs-drift-checker.ts
 *   npx tsx system/control-plane/docs-drift-checker.ts --blocking-only
 *   npx tsx system/control-plane/docs-drift-checker.ts --json
 */

import fs          from 'node:fs'
import path        from 'node:path'
import { execSync } from 'node:child_process'

// ─── Types ────────────────────────────────────────────────────────────────────

export type DriftClass = 'DRIFT_BLOCKING' | 'DRIFT_WARNING' | 'OK' | 'SKIP'

export interface DriftCheck {
  name:          string
  drift_class:   DriftClass
  source_file:   string
  doc_file:      string
  source_age_days: number | null
  doc_age_days:    number | null
  lag_days:      number | null   // doc_age - source_age (positiv = doc ist älter)
  reason:        string
  action?:       string
}

export interface DriftReport {
  checked_at:    string
  repo_root:     string
  total_checks:  number
  blocking:      number
  warnings:      number
  ok:            number
  checks:        DriftCheck[]
}

// ─── Git-Timestamp Utilities ─────────────────────────────────────────────────

function getRepoRoot(): string {
  try {
    return execSync('git rev-parse --show-toplevel', { encoding: 'utf8' }).trim()
  } catch {
    return process.cwd()
  }
}

function getGitLastModified(filePath: string, repoRoot: string): Date | null {
  const rel = path.relative(repoRoot, path.resolve(repoRoot, filePath))
  try {
    const ts = execSync(
      `git log -1 --format="%ct" -- "${rel}"`,
      { encoding: 'utf8', cwd: repoRoot }
    ).trim()
    if (!ts) return null
    return new Date(parseInt(ts, 10) * 1000)
  } catch { return null }
}

function fileExists(filePath: string, repoRoot: string): boolean {
  return fs.existsSync(path.resolve(repoRoot, filePath))
}

function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24))
}

// ─── Checks Konfiguration ─────────────────────────────────────────────────────

interface CheckDef {
  name:         string
  source_file:  string
  doc_file:     string
  drift_class:  DriftClass   // Schweregrad wenn doc älter als source
  action?:      string
  /** Maximale Lag-Toleranz in Tagen bevor Drift gemeldet wird */
  tolerance_days?: number
}

const CHECKS: CheckDef[] = [
  // ── BLOCKING: SSOT ↔ Runtime-Docs ──────────────────────────────────────────
  {
    name:        'risk-categories vs STACK_REFERENCE',
    source_file: 'system/control-plane/risk-categories.ts',
    doc_file:    'STACK_REFERENCE.md',
    drift_class: 'DRIFT_BLOCKING',
    tolerance_days: 1,
    action:      'STACK_REFERENCE.md § Risk-Kategorien / Agent Routing aktualisieren',
  },
  {
    name:        'risk-categories vs SESSION_ONBOARDING',
    source_file: 'system/control-plane/risk-categories.ts',
    doc_file:    'SESSION_ONBOARDING.md',
    drift_class: 'DRIFT_BLOCKING',
    tolerance_days: 1,
    action:      'SESSION_ONBOARDING.md § Governance Validator aktualisieren',
  },
  {
    name:        'workorder.schema.json vs SESSION_ONBOARDING',
    source_file: 'system/workorders/schemas/workorder.schema.json',
    doc_file:    'SESSION_ONBOARDING.md',
    drift_class: 'DRIFT_BLOCKING',
    tolerance_days: 1,
    action:      'SESSION_ONBOARDING.md § Workorder Format aktualisieren',
  },
  {
    name:        'model_routing.json vs STACK_REFERENCE',
    source_file: 'system/agent-registry/model_routing.json',
    doc_file:    'STACK_REFERENCE.md',
    drift_class: 'DRIFT_BLOCKING',
    tolerance_days: 1,
    action:      'STACK_REFERENCE.md § Agent Routing aktualisieren',
  },
  {
    name:        'agents.json vs AGENTS.md',
    source_file: 'system/agent-registry/agents.json',
    doc_file:    'AGENTS.md',
    drift_class: 'DRIFT_BLOCKING',
    tolerance_days: 2,
    action:      'AGENTS.md Agent-Tabelle aktualisieren',
  },

  // ── BLOCKING: Governance-Docs ───────────────────────────────────────────────
  {
    name:        'dispatcher.ts vs SESSION_ONBOARDING (Dispatcher Regeln)',
    source_file: 'system/control-plane/dispatcher.ts',
    doc_file:    'SESSION_ONBOARDING.md',
    drift_class: 'DRIFT_BLOCKING',
    tolerance_days: 3,
    action:      'SESSION_ONBOARDING.md § Dispatcher Regeln prüfen',
  },
  {
    name:        'governance-validator.ts vs SESSION_ONBOARDING',
    source_file: 'system/control-plane/governance-validator.ts',
    doc_file:    'SESSION_ONBOARDING.md',
    drift_class: 'DRIFT_BLOCKING',
    tolerance_days: 3,
    action:      'SESSION_ONBOARDING.md § Governance Validator prüfen',
  },

  // ── WARNING: System-Docs ───────────────────────────────────────────────────
  {
    name:        'stop-rules.ts vs SESSION_ONBOARDING',
    source_file: 'system/control-plane/stop-rules.ts',
    doc_file:    'SESSION_ONBOARDING.md',
    drift_class: 'DRIFT_WARNING',
    tolerance_days: 7,
    action:      'SESSION_ONBOARDING.md § Stop-Regeln Schwellwerte prüfen',
  },
  {
    name:        'night-run-policy.ts vs SESSION_ONBOARDING',
    source_file: 'system/control-plane/night-run-policy.ts',
    doc_file:    'SESSION_ONBOARDING.md',
    drift_class: 'DRIFT_WARNING',
    tolerance_days: 7,
    action:      'SESSION_ONBOARDING.md § Night-Run-Policy prüfen',
  },
  {
    name:        'scheduler-preflight.ts vs SESSION_ONBOARDING',
    source_file: 'system/control-plane/scheduler-preflight.ts',
    doc_file:    'SESSION_ONBOARDING.md',
    drift_class: 'DRIFT_WARNING',
    tolerance_days: 7,
    action:      'SESSION_ONBOARDING.md § Preflight prüfen',
  },
  {
    name:        'docs/project/STACK_REFERENCE vs root STACK_REFERENCE',
    source_file: 'STACK_REFERENCE.md',
    doc_file:    'docs/project/STACK_REFERENCE.md',
    drift_class: 'DRIFT_WARNING',
    tolerance_days: 3,
    action:      'docs/project/STACK_REFERENCE.md mit root synchronisieren',
  },
  {
    name:        'docs/project/SESSION_ONBOARDING vs root SESSION_ONBOARDING',
    source_file: 'SESSION_ONBOARDING.md',
    doc_file:    'docs/project/SESSION_ONBOARDING.md',
    drift_class: 'DRIFT_WARNING',
    tolerance_days: 3,
    action:      'docs/project/SESSION_ONBOARDING.md mit root synchronisieren',
  },
]

// ─── Checker ──────────────────────────────────────────────────────────────────

export function runDriftChecks(repoRoot: string = getRepoRoot()): DriftReport {
  const results: DriftCheck[] = []

  for (const def of CHECKS) {
    const srcExists = fileExists(def.source_file, repoRoot)
    const docExists = fileExists(def.doc_file,    repoRoot)

    // Quelle fehlt → skip (kein relevanter Check)
    if (!srcExists) {
      results.push({
        name: def.name, drift_class: 'SKIP',
        source_file: def.source_file, doc_file: def.doc_file,
        source_age_days: null, doc_age_days: null, lag_days: null,
        reason: `Source-Datei nicht gefunden: ${def.source_file}`,
      })
      continue
    }

    // Doc fehlt komplett → BLOCKING (existiert noch gar nicht)
    if (!docExists) {
      results.push({
        name: def.name, drift_class: 'DRIFT_BLOCKING',
        source_file: def.source_file, doc_file: def.doc_file,
        source_age_days: null, doc_age_days: null, lag_days: null,
        reason: `Docs-Datei fehlt: ${def.doc_file}`,
        action: `${def.doc_file} erstellen`,
      })
      continue
    }

    const srcDate = getGitLastModified(def.source_file, repoRoot)
    const docDate = getGitLastModified(def.doc_file,    repoRoot)

    if (!srcDate || !docDate) {
      results.push({
        name: def.name, drift_class: 'SKIP',
        source_file: def.source_file, doc_file: def.doc_file,
        source_age_days: null, doc_age_days: null, lag_days: null,
        reason: 'Git-Timestamp nicht verfügbar (neue Datei oder kein Git)',
      })
      continue
    }

    const now         = new Date()
    const srcAgeDays  = daysBetween(srcDate, now)
    const docAgeDays  = daysBetween(docDate, now)
    const lagDays     = docAgeDays - srcAgeDays  // positiv = doc ist älter als source

    const tolerance = def.tolerance_days ?? 1

    if (lagDays > tolerance) {
      results.push({
        name:           def.name,
        drift_class:    def.drift_class,
        source_file:    def.source_file,
        doc_file:       def.doc_file,
        source_age_days: srcAgeDays,
        doc_age_days:    docAgeDays,
        lag_days:        lagDays,
        reason:         `Docs ${lagDays} Tage hinter Source (Toleranz: ${tolerance}d)`,
        action:         def.action,
      })
    } else {
      results.push({
        name:           def.name,
        drift_class:    'OK',
        source_file:    def.source_file,
        doc_file:       def.doc_file,
        source_age_days: srcAgeDays,
        doc_age_days:    docAgeDays,
        lag_days:        lagDays,
        reason:         `Docs aktuell (Lag: ${lagDays}d, Toleranz: ${tolerance}d)`,
      })
    }
  }

  const blocking = results.filter(r => r.drift_class === 'DRIFT_BLOCKING').length
  const warnings = results.filter(r => r.drift_class === 'DRIFT_WARNING').length
  const ok       = results.filter(r => r.drift_class === 'OK').length

  return {
    checked_at:   new Date().toISOString(),
    repo_root:    repoRoot,
    total_checks: results.length,
    blocking,
    warnings,
    ok,
    checks: results,
  }
}

// ─── CLI ──────────────────────────────────────────────────────────────────────

async function main() {
  const args         = process.argv.slice(2)
  const blockingOnly = args.includes('--blocking-only')
  const jsonMode     = args.includes('--json')

  const report = runDriftChecks()

  if (jsonMode) {
    console.log(JSON.stringify(report, null, 2))
    return
  }

  const CLASS_ICON: Record<string, string> = {
    DRIFT_BLOCKING: '🔴',
    DRIFT_WARNING:  '🟡',
    OK:             '✅',
    SKIP:           '⬜',
  }

  console.log(`\n── Docs-Drift Report ──────────────────────────────`)
  console.log(`Geprüft: ${report.checked_at}`)
  console.log(`Repo:    ${report.repo_root}`)
  console.log()
  console.log(`🔴 BLOCKING:  ${report.blocking}`)
  console.log(`🟡 WARNING:   ${report.warnings}`)
  console.log(`✅ OK:        ${report.ok}`)
  console.log()

  const display = blockingOnly
    ? report.checks.filter(c => c.drift_class === 'DRIFT_BLOCKING')
    : report.checks.filter(c => c.drift_class !== 'SKIP' && c.drift_class !== 'OK')

  if (display.length === 0) {
    console.log(blockingOnly ? '✅ Keine blocking Drifts.' : '✅ Kein Drift — Docs aktuell.')
  } else {
    for (const c of display) {
      const icon = CLASS_ICON[c.drift_class] ?? '?'
      console.log(`${icon} ${c.name}`)
      console.log(`     ${c.reason}`)
      if (c.action) console.log(`     → ${c.action}`)
      console.log()
    }
  }

  if (!blockingOnly && report.ok > 0) {
    console.log(`── OK (${report.ok}) ──`)
    for (const c of report.checks.filter(x => x.drift_class === 'OK'))
      console.log(`✅ ${c.name} (Lag: ${c.lag_days}d)`)
    console.log()
  }

  process.exit(report.blocking > 0 ? 1 : 0)
}

const isMain = process.argv[1]?.includes('docs-drift-checker')
if (isMain) {
  main().catch(err => { console.error(err); process.exit(1) })
}
