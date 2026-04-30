/**
 * LUMEOS Model Quality Report — B.4
 * system/reports/model-quality-report.ts
 *
 * Misst Qualität und Performance jedes Review-Tiers anhand von
 * pipeline-metrics.jsonl und pipeline-audit.jsonl.
 *
 * Kennzahlen pro Tier:
 *   - Review-Anzahl
 *   - PASS / FAIL / REWRITE / ESCALATE / invalid_json Rate
 *   - Ø Latenz
 *   - Escalation Rate (→ nächster Tier)
 *   - Confidence-Mittelwert und -Streuung
 *   - Rewrite-Rate
 *
 * Output:
 *   system/reports/model-quality-report.md
 *   system/reports/model-quality-summary.json
 *
 * CLI:
 *   npx tsx system/reports/model-quality-report.ts
 *   npx tsx system/reports/model-quality-report.ts --since 2026-04-29
 */

import fs   from 'node:fs'
import path from 'node:path'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TierStats {
  tier:                 string
  total_reviews:        number
  pass_count:           number
  fail_count:           number
  rewrite_count:        number
  escalate_count:       number
  invalid_json_count:   number
  human_needed_count:   number
  pass_rate_pct:        number
  escalation_rate_pct:  number
  rewrite_rate_pct:     number
  invalid_json_rate_pct: number
  avg_latency_ms:       number
  p95_latency_ms:       number
  avg_confidence:       number | null
  min_confidence:       number | null
  max_confidence:       number | null
}

export interface EscalationChain {
  from_tier:       string
  to_tier:         string
  escalation_count: number
  escalation_rate_pct: number
}

export interface ModelQualitySummary {
  generated_at:     string
  since?:           string
  tiers:            TierStats[]
  escalation_chains: EscalationChain[]
  total_reviews:    number
  overall_pass_rate_pct: number
  overall_human_needed:  number
}

// ─── Reader ───────────────────────────────────────────────────────────────────

function readJsonl<T = any>(filepath: string): T[] {
  const abs = path.resolve(process.cwd(), filepath)
  if (!fs.existsSync(abs)) return []
  return fs.readFileSync(abs, 'utf8')
    .split('\n').filter(Boolean)
    .map(line => { try { return JSON.parse(line) } catch { return null } })
    .filter(Boolean) as T[]
}

// ─── Aggregation ──────────────────────────────────────────────────────────────

function percentile(values: number[], p: number): number {
  if (!values.length) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const idx = Math.ceil((p / 100) * sorted.length) - 1
  return sorted[Math.max(0, idx)]
}

function avg(values: number[]): number {
  if (!values.length) return 0
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length)
}

function avgFloat(values: number[]): number | null {
  if (!values.length) return null
  const v = values.reduce((a, b) => a + b, 0) / values.length
  return Math.round(v * 1000) / 1000
}

function pct(count: number, total: number): number {
  if (!total) return 0
  return Math.round((count / total) * 100)
}

export function buildTierStats(
  tier: string,
  metricsRows: any[],
  auditRows: any[],
): TierStats {
  // Metriken aus pipeline-metrics.jsonl (wenn vorhanden)
  const mRows = metricsRows.filter(r => r.tier === tier)
  // Audit-Completions aus pipeline-audit.jsonl
  const aRows = auditRows.filter(r => r.tier === tier && r.event === 'review_completed')

  // Latenz bevorzugt aus Metrics (hat latency_ms), sonst aus Audit nicht verfügbar
  const latencies    = mRows.map(r => r.latency_ms).filter(n => typeof n === 'number')

  // Status/Outcome: kombiniere beide Quellen
  const allStatuses  = [
    ...mRows.map(r => (r.outcome ?? '').toUpperCase()),
    ...aRows.filter(r => !mRows.some(m => m.wo_id === r.wo_id)).map(r => (r.status ?? '').toUpperCase()),
  ]

  const total        = Math.max(mRows.length, aRows.length, allStatuses.length)
  const pass         = allStatuses.filter(s => s === 'PASS').length
  const fail         = allStatuses.filter(s => s === 'FAIL').length
  const rewrite      = allStatuses.filter(s => s === 'REWRITE').length
  const escalate     = allStatuses.filter(s => s === 'ESCALATE').length
  const invalidJson  = allStatuses.filter(s => s === 'INVALID_JSON').length
  // human_needed aus Audit
  const humanNeeded  = auditRows.filter(r => r.tier === tier && r.event === 'human_review_required').length

  // Escalated aus Metrics
  const escalatedM   = mRows.filter(r => r.escalated === true).length
  const escalatedA   = auditRows.filter(r => r.tier === tier && r.event === 'review_escalated').length
  const escalatedCount = Math.max(escalatedM, escalatedA, escalate)

  // Confidence aus Audit (hat konsistentere Werte)
  const confidences  = [
    ...mRows.map(r => r.confidence).filter(n => typeof n === 'number'),
    ...aRows.filter(r => !mRows.some(m => m.wo_id === r.wo_id)).map(r => r.confidence).filter(n => typeof n === 'number'),
  ]

  return {
    tier,
    total_reviews:         total,
    pass_count:            pass,
    fail_count:            fail,
    rewrite_count:         rewrite,
    escalate_count:        escalate,
    invalid_json_count:    invalidJson,
    human_needed_count:    humanNeeded,
    pass_rate_pct:         pct(pass, total),
    escalation_rate_pct:   pct(escalatedCount, total),
    rewrite_rate_pct:      pct(rewrite, total),
    invalid_json_rate_pct: pct(invalidJson, total),
    avg_latency_ms:        avg(latencies),
    p95_latency_ms:        percentile(latencies, 95),
    avg_confidence:        avgFloat(confidences),
    min_confidence:        confidences.length ? Math.min(...confidences) : null,
    max_confidence:        confidences.length ? Math.max(...confidences) : null,
  }
}

export function generateModelQualityReport(since?: string): ModelQualitySummary {
  const allMetrics = readJsonl<any>('system/state/pipeline-metrics.jsonl')
  const allAudit   = readJsonl<any>('system/state/pipeline-audit.jsonl')

  const sinceMs = since ? new Date(since).getTime() : 0
  const metrics = allMetrics.filter(r => !sinceMs || new Date(r.timestamp).getTime() >= sinceMs)
  const audit   = allAudit.filter(r => !sinceMs || new Date(r.ts).getTime() >= sinceMs)

  // Alle Tier-Namen aus beiden Quellen sammeln
  const tierNames = [...new Set([
    ...metrics.map(r => r.tier).filter(Boolean),
    ...audit.filter(r => r.event === 'review_completed').map(r => r.tier).filter(Boolean),
  ])].sort()

  const tiers = tierNames.map(tier => buildTierStats(tier, metrics, audit))

  // Escalation Chains (A → B) aus Audit
  const chains: EscalationChain[] = []
  const escEvents = audit.filter(r => r.event === 'review_escalated')
  const tierIndex: Record<string, number> = {}
  tierNames.forEach((t, i) => { tierIndex[t] = i })

  for (const tier of tierNames) {
    const escFromTier = escEvents.filter(r => r.tier === tier)
    if (escFromTier.length === 0) continue
    const nextTier = tierNames.find(t => tierIndex[t] > tierIndex[tier])
    if (!nextTier) continue
    const tierTotal = tiers.find(t => t.tier === tier)?.total_reviews ?? 0
    chains.push({
      from_tier:           tier,
      to_tier:             nextTier,
      escalation_count:    escFromTier.length,
      escalation_rate_pct: pct(escFromTier.length, tierTotal),
    })
  }

  const totalAll      = tiers.reduce((a, t) => a + t.total_reviews, 0)
  const totalPass     = tiers.reduce((a, t) => a + t.pass_count, 0)
  const humanNeededAll= tiers.reduce((a, t) => a + t.human_needed_count, 0)

  return {
    generated_at:          new Date().toISOString(),
    since,
    tiers,
    escalation_chains:     chains,
    total_reviews:         totalAll,
    overall_pass_rate_pct: pct(totalPass, totalAll),
    overall_human_needed:  humanNeededAll,
  }
}

// ─── Markdown Renderer ────────────────────────────────────────────────────────

export function renderModelQualityMarkdown(summary: ModelQualitySummary): string {
  const lines: string[] = []

  lines.push(`# Model Quality Report`)
  lines.push(``)
  lines.push(`**Generiert:** ${summary.generated_at}`)
  if (summary.since) lines.push(`**Zeitraum:** seit ${summary.since}`)
  lines.push(``)
  lines.push(`**Gesamtstatistik:** ${summary.total_reviews} Reviews | Pass-Rate: ${summary.overall_pass_rate_pct}% | Human Needed: ${summary.overall_human_needed}`)
  lines.push(``)

  if (summary.tiers.length === 0) {
    lines.push(`_Keine Metriken vorhanden._`)
    return lines.join('\n')
  }

  // ── Tier-Übersicht ──────────────────────────────────────────────────────────
  lines.push(`## Tier-Übersicht`)
  lines.push(``)
  lines.push(`| Tier | Reviews | PASS | REWRITE | ESCALATE | invalid_json | Pass-Rate | Esc-Rate | Ø Latenz |`)
  lines.push(`|------|---------|------|---------|----------|-------------|-----------|----------|----------|`)
  for (const t of summary.tiers) {
    const invJ = t.invalid_json_count > 0 ? `${t.invalid_json_count} (${t.invalid_json_rate_pct}%)` : `—`
    lines.push(`| ${t.tier} | ${t.total_reviews} | ${t.pass_count} (${t.pass_rate_pct}%) | ${t.rewrite_count} (${t.rewrite_rate_pct}%) | ${t.escalate_count} (${t.escalation_rate_pct}%) | ${invJ} | **${t.pass_rate_pct}%** | ${t.escalation_rate_pct}% | ${t.avg_latency_ms}ms |`)
  }
  lines.push(``)

  // ── Latenz ─────────────────────────────────────────────────────────────────
  const tiersWithLatency = summary.tiers.filter(t => t.avg_latency_ms > 0)
  if (tiersWithLatency.length > 0) {
    lines.push(`## Latenz-Detail`)
    lines.push(``)
    lines.push(`| Tier | Ø Latenz | P95 Latenz |`)
    lines.push(`|------|----------|------------|`)
    for (const t of tiersWithLatency) {
      lines.push(`| ${t.tier} | ${t.avg_latency_ms}ms | ${t.p95_latency_ms}ms |`)
    }
    lines.push(``)
  }

  // ── Confidence ─────────────────────────────────────────────────────────────
  const tiersWithConf = summary.tiers.filter(t => t.avg_confidence !== null)
  if (tiersWithConf.length > 0) {
    lines.push(`## Confidence-Verteilung`)
    lines.push(``)
    lines.push(`| Tier | Ø Confidence | Min | Max |`)
    lines.push(`|------|-------------|-----|-----|`)
    for (const t of tiersWithConf) {
      lines.push(`| ${t.tier} | ${t.avg_confidence} | ${t.min_confidence} | ${t.max_confidence} |`)
    }
    lines.push(``)
  }

  // ── Escalation Chains ──────────────────────────────────────────────────────
  if (summary.escalation_chains.length > 0) {
    lines.push(`## Escalation Chains`)
    lines.push(``)
    for (const c of summary.escalation_chains) {
      lines.push(`- **${c.from_tier} → ${c.to_tier}:** ${c.escalation_count} Escalations (${c.escalation_rate_pct}% der ${c.from_tier}-Reviews)`)
    }
    lines.push(``)
  }

  // ── Tier-Details ───────────────────────────────────────────────────────────
  for (const t of summary.tiers) {
    lines.push(`## ${t.tier} — Detail`)
    lines.push(``)
    lines.push(`| Kennzahl | Wert |`)
    lines.push(`|----------|------|`)
    lines.push(`| Reviews gesamt | ${t.total_reviews} |`)
    lines.push(`| PASS | ${t.pass_count} (${t.pass_rate_pct}%) |`)
    lines.push(`| FAIL | ${t.fail_count} |`)
    lines.push(`| REWRITE | ${t.rewrite_count} (${t.rewrite_rate_pct}%) |`)
    lines.push(`| ESCALATE | ${t.escalate_count} (${t.escalation_rate_pct}%) |`)
    if (t.invalid_json_count > 0) lines.push(`| invalid_json | ${t.invalid_json_count} (${t.invalid_json_rate_pct}%) |`)
    if (t.human_needed_count > 0) lines.push(`| Human Needed | ${t.human_needed_count} |`)
    if (t.avg_latency_ms > 0) {
      lines.push(`| Ø Latenz | ${t.avg_latency_ms}ms |`)
      lines.push(`| P95 Latenz | ${t.p95_latency_ms}ms |`)
    }
    if (t.avg_confidence !== null) {
      lines.push(`| Ø Confidence | ${t.avg_confidence} |`)
      lines.push(`| Confidence Min/Max | ${t.min_confidence} / ${t.max_confidence} |`)
    }
    lines.push(``)
  }

  return lines.join('\n')
}

// ─── Writer ───────────────────────────────────────────────────────────────────

export function writeModelQualityReport(
  summary: ModelQualitySummary,
  outputDir = 'system/reports',
): { jsonPath: string; mdPath: string } {
  const absDir = path.resolve(process.cwd(), outputDir)
  if (!fs.existsSync(absDir)) fs.mkdirSync(absDir, { recursive: true })

  const jsonPath = path.join(absDir, 'model-quality-summary.json')
  const mdPath   = path.join(absDir, 'model-quality-report.md')

  fs.writeFileSync(jsonPath, JSON.stringify(summary, null, 2), 'utf8')
  fs.writeFileSync(mdPath,   renderModelQualityMarkdown(summary), 'utf8')

  return { jsonPath, mdPath }
}

// ─── CLI ──────────────────────────────────────────────────────────────────────

async function main() {
  const args  = process.argv.slice(2)
  const since = args.find(a => /^\d{4}-\d{2}-\d{2}/.test(a))

  const summary = generateModelQualityReport(since)
  const { jsonPath, mdPath } = writeModelQualityReport(summary)

  console.log(`\n✓ Model Quality Report:`)
  console.log(`  JSON: ${jsonPath}`)
  console.log(`  MD:   ${mdPath}`)
  console.log()
  console.log(renderModelQualityMarkdown(summary))
}

const isMain = process.argv[1]?.includes('model-quality-report')
if (isMain) {
  main().catch(err => { console.error(err); process.exit(1) })
}
