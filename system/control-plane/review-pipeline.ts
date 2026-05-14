// system/control-plane/review-pipeline.ts
//
// Review-Pipeline — separate Schicht über dem Dispatcher.
// Implementiert Spark 2 → Spark 3 → Spark 4 → Claude Tiered Escalation.
//
// Single Source of Truth: system/control-plane/RULES.md
//
// Diese Datei wird NICHT automatisch in dispatcher.ts integriert.
// Tom entscheidet später wann/wo runReviewPipeline() aufgerufen wird.
//
// Design-Entscheidungen (siehe Session vom April 2026):
//   - Option C: Pipeline ruft callGPTOSSReviewer() direkt auf, keine
//     Routing-Indirektion über createVllmCallModel.
//   - Rewrite-Counter sind lokal pro Pipeline-Aufruf (V1). State-Persistierung
//     kommt mit V2 wenn Pipeline echt integriert wird.
//   - High-Risk Flow: Spark 3 läuft trotzdem (run-and-log), aber Spark 4 ist
//     mandatory blocking. Spark-3-Findings werden an Spark 4 weitergereicht.
//   - Reviewer-Risk-Casing: UPPERCASE (LOW/MEDIUM/HIGH).

import {
  extractFirstJsonObject,
  validateReviewOutput,
  requiresSeniorReview,
  type ReviewOutput,
} from './governance-validator'
import { callGPTOSSReviewer } from '../../services/scheduler-api/src/vllm-adapter'
import type { PipelineAuditEvent } from './pipeline-audit'
import type { PipelineMetricEvent, MetricOutcome } from './pipeline-metrics'

// ─── Types ────────────────────────────────────────────────────────────────────

export type PipelineTier = 'spark-c' | 'spark-d' | 'claude'

export interface PipelineWorkorder {
  wo_id: string
  category?: string  // 'auth' | 'rls' | 'migration' | 'security' | ...
  task: string
  changed_files?: string[]
  files_allowed?: string[]
}

export interface PipelineWorkerResult {
  wo_id: string
  /** V2: run_id für persistierten Rewrite-Counter. Optional für Backward-Compat. */
  run_id?: string
  output: string  // Worker-Output (z.B. von Spark 2 / micro-executor)
  diff?: string
  metadata?: Record<string, unknown>
}

export interface PipelineDeps {
  /**
   * Spark 3 reviewer call.
   * Caller injects this — Pipeline kennt keine konkrete Implementierung.
   * Erwartete Signatur analog callGPTOSSReviewer.
   */
  callFastReviewer: (
    systemPrompt: string,
    userMessage: string,
    maxTokens?: number,
  ) => Promise<string>

  /**
   * Audit-Logger. Optional — wenn nicht gesetzt, wird gestummt geloggt.
   * Siehe pipeline-audit.ts für File- und Memory-Writer.
   */
  audit?: (event: PipelineAuditEvent) => void | Promise<void>

  /**
   * V2: Liest persistierten Rewrite-Count für run_id + tier.
   * Wenn nicht gesetzt → lokaler Counter (V1 Backward-Compat).
   */
  getRewriteCount?: (runId: string, tier: PipelineTier) => number

  /**
   * V2: Inkrementiert persistierten Rewrite-Count für run_id + tier.
   * Wenn nicht gesetzt → kein persistenter State (V1 Backward-Compat).
   */
  incrementRewriteCount?: (runId: string, tier: PipelineTier) => Promise<void>

  /**
   * V2: Metrics Writer — schreibt einen Metric-Event pro Tier-Abschluss.
   * Wenn nicht gesetzt → keine Metriken (Backward-Compat).
   * Siehe pipeline-metrics.ts für File- und Memory-Writer.
   */
  writeMetric?: (event: PipelineMetricEvent) => void | Promise<void>

  /**
   * When true, the configured fast reviewer is mandatory. Invalid/unavailable
   * fast-reviewer output blocks instead of silently escalating to Spark D.
   */
  requireFastReviewerPass?: boolean

  /**
   * Output contract expected from the fast reviewer route. The controlled
   * Nemotron route returns a compact JSON object that is normalized into the
   * internal ReviewOutput contract before validation.
   */
  fastReviewerContract?: 'legacy' | 'nemotron'
}

export type PipelineResult =
  | { kind: 'done'; finalTier: PipelineTier; review: ReviewOutput }
  | { kind: 'rewrite'; tier: PipelineTier; reason: string }
  | { kind: 'human_needed'; reason: string; lastTier: PipelineTier }

const REWRITE_LIMIT = 2
const CONFIDENCE_THRESHOLD = 0.75

// ─── Helpers ──────────────────────────────────────────────────────────────────

function normalizeNemotronReviewOutput(output: any): ReviewOutput {
  if (!output || typeof output !== 'object') {
    throw new Error('Invalid Nemotron review output: not an object')
  }

  const status = typeof output.status === 'string'
    ? output.status.trim().toUpperCase()
    : ''
  if (!['PASS', 'FAIL', 'BLOCKED'].includes(status)) {
    throw new Error(`Invalid Nemotron review status: ${String(output.status)}`)
  }
  if (typeof output.summary !== 'string' || output.summary.trim().length === 0) {
    throw new Error('Invalid Nemotron review summary')
  }
  if (typeof output.confidence !== 'number' || output.confidence < 0 || output.confidence > 1) {
    throw new Error(`Invalid Nemotron review confidence: ${String(output.confidence)}`)
  }
  if (output.reviewer !== 'nemotron-review-agent') {
    throw new Error(`Invalid Nemotron reviewer id: ${String(output.reviewer)}`)
  }
  if (!Array.isArray(output.findings)) {
    throw new Error('Invalid Nemotron findings: expected array')
  }

  const findings = output.findings.map((finding: unknown) => {
    if (typeof finding === 'string') return finding
    if (finding && typeof finding === 'object') return JSON.stringify(finding)
    return String(finding)
  })

  return {
    status: status === 'BLOCKED' ? 'ESCALATE' : status,
    risk: status === 'PASS' ? 'LOW' : 'HIGH',
    confidence: output.confidence,
    violations: status === 'PASS' ? [] : findings,
    recommendations: [],
    summary: output.summary.trim(),
    requires_claude: status !== 'PASS',
    findings,
    reviewer: 'nemotron-review-agent',
  }
}

/**
 * Strict JSON parse by default. The controlled Nemotron route gets one bounded
 * extraction of the first JSON object, then deterministic schema validation.
 */
function parseReviewerJson(
  content: string,
  contract: PipelineDeps['fastReviewerContract'] = 'legacy',
): ReviewOutput {
  const trimmed = content.trim()
  if (!trimmed) {
    throw new Error('EMPTY_REVIEWER_CONTENT')
  }
  const jsonText = trimmed.startsWith('{') && trimmed.endsWith('}')
    ? trimmed
    : extractFirstJsonObject(trimmed)
  if (!jsonText) {
    throw new Error('REVIEWER_NOT_JSON')
  }
  const parsed = JSON.parse(jsonText)
  return contract === 'nemotron'
    ? normalizeNemotronReviewOutput(parsed)
    : parsed as ReviewOutput
}

/**
 * Override-Trigger anwenden — wenn status=PASS aber Reviewer signalisiert
 * Unsicherheit (low confidence ODER requires_claude=true), wird PASS zu ESCALATE.
 *
 * Siehe RULES.md Sektion 4 (Confidence Routing) und Sektion 7 (Output-Contract).
 */
function applyEscalationOverrides(review: ReviewOutput): ReviewOutput {
  if (review.status !== 'PASS') return review
  if (review.confidence < CONFIDENCE_THRESHOLD) {
    return { ...review, status: 'ESCALATE' }
  }
  if (review.requires_claude === true) {
    return { ...review, status: 'ESCALATE' }
  }
  return review
}

/**
 * Build review prompt für Spark 3 / Spark 4.
 */
function buildReviewPrompt(
  wo: PipelineWorkorder,
  result: PipelineWorkerResult,
  tier: 'spark-c' | 'spark-d',
  contract: PipelineDeps['fastReviewerContract'] = 'legacy',
  spark3Findings?: ReviewOutput,
): { systemPrompt: string; userMessage: string } {
  const tierLabel = tier === 'spark-c' ? 'fast-reviewer' : 'senior-reviewer'

  const systemPrompt = tier === 'spark-c' && contract === 'nemotron'
    ? [
      'You are nemotron-review-agent, the controlled DGX3 reviewer for LUMEOS governed workflow tests.',
      'You are read-only. Review only the worker output against the workorder scope and acceptance criteria.',
      'Return ONLY one valid JSON object in message content. No markdown. No prose. No code fences.',
      'Do not put the answer in reasoning. The workflow ignores reasoning and reads content.trim() only.',
      'JSON schema:',
      '{',
      '  "status": "PASS | FAIL | BLOCKED",',
      '  "summary": "short review summary",',
      '  "findings": ["string"],',
      '  "confidence": 0.0,',
      '  "reviewer": "nemotron-review-agent"',
      '}',
      'You as reviewer are read-only, but the worker output may include authorized scoped changes from the workorder.',
      'Use PASS only when the output is within the authorized workorder scope, complete, validated, and not unsafe. Use FAIL for fixable quality/scope problems. Use BLOCKED for unsafe or unverifiable output.',
    ].join('\n')
    : [
    `You are the ${tierLabel} for LUMEOS workorders.`,
    'Return ONLY valid JSON matching this schema, no other text:',
    '{',
    '  "status":           "PASS | REWRITE | ESCALATE",',
    '  "risk":             "LOW | MEDIUM | HIGH",',
    '  "confidence":       0.0,',
    '  "violations":       ["string"],',
    '  "recommendations":  ["string"],',
    '  "summary":          "string",',
    '  "requires_claude":  false',
    '}',
  ].join('\n')

  const ctx: Record<string, unknown> = {
    wo_id: wo.wo_id,
    category: wo.category ?? 'standard',
    task: wo.task,
    changed_files: wo.changed_files ?? [],
    files_allowed: wo.files_allowed ?? [],
    worker_output: result.output,
  }
  if (result.diff) ctx.diff = result.diff
  if (spark3Findings) ctx.spark3_findings = spark3Findings

  return { systemPrompt, userMessage: JSON.stringify(ctx, null, 2) }
}

// ─── Single-Tier Reviewer Helper ──────────────────────────────────────────────

interface TierOutcome {
  /** Validated review output (after confidence gate). */
  review?: ReviewOutput
  /** Reason if tier could not produce a usable review. */
  failureReason?:
    | 'invalid_json'
    | 'schema_violation'
    | 'rewrite_limit_exceeded'
    | 'low_confidence'
    | 'escalate'
    | 'rewrite_pending'
    | 'reviewer_unavailable'
}

async function runSingleTier(
  tier: 'spark-c' | 'spark-d',
  wo: PipelineWorkorder,
  result: PipelineWorkerResult,
  deps: PipelineDeps,
  runId?: string,
  spark3Findings?: ReviewOutput,
): Promise<TierOutcome> {
  const contract = tier === 'spark-c' ? deps.fastReviewerContract : 'legacy'
  const { systemPrompt, userMessage } = buildReviewPrompt(wo, result, tier, contract, spark3Findings)

  const callReviewer =
    tier === 'spark-c' ? deps.callFastReviewer : callGPTOSSReviewer

  await deps.audit?.({ event: 'review_started', tier, wo_id: wo.wo_id, run_id: runId })

  const tierStart = Date.now()

  /** Helper: schreibt Metric-Event und gibt TierOutcome zurück. */
  const emitMetric = (
    outcome: TierOutcome,
    metricOutcome: MetricOutcome,
    escalated: boolean,
    confidence?: number,
  ): TierOutcome => {
    if (deps.writeMetric) {
      const rewriteCount = (runId && deps.getRewriteCount)
        ? deps.getRewriteCount(runId, tier)
        : 0
      deps.writeMetric({
        timestamp:     new Date().toISOString(),
        run_id:        runId,
        wo_id:         wo.wo_id,
        tier,
        outcome:       metricOutcome,
        confidence,
        latency_ms:    Date.now() - tierStart,
        escalated,
        rewrite_count: rewriteCount,
      })
    }
    return outcome
  }

  // V2: Persistierten Counter prüfen — Loop-Erkennung über Worker-Re-Runs hinweg.
  // Wenn Counter bereits am Limit → sofort ESCALATE, kein Reviewer-Call nötig.
  if (runId && deps.getRewriteCount) {
    const persistedCount = deps.getRewriteCount(runId, tier)
    if (persistedCount >= REWRITE_LIMIT) {
      await deps.audit?.({
        event: 'review_rewrite_loop',
        tier,
        wo_id: wo.wo_id,
        run_id: runId,
        loop_count: persistedCount,
      })
      return emitMetric({ failureReason: 'rewrite_limit_exceeded' }, 'rewrite_limit_exceeded', true)
    }
  }

  // Lokaler Counter als Fallback wenn keine persistenten Counter-Funcs (V1 Compat).
  let localRewriteCount = 0

  while (localRewriteCount <= REWRITE_LIMIT) {
    let raw: string
    try {
      raw = await callReviewer(systemPrompt, userMessage, 800)
    } catch (err) {
      return emitMetric({ failureReason: 'reviewer_unavailable' }, 'reviewer_unavailable', true)
    }

    let review: ReviewOutput
    try {
      review = parseReviewerJson(raw, contract)
      validateReviewOutput(review)
    } catch {
      return emitMetric({ failureReason: 'invalid_json' }, 'invalid_json', true)
    }

    review = applyEscalationOverrides(review)

    await deps.audit?.({
      event: 'review_completed',
      tier,
      wo_id: wo.wo_id,
      run_id: runId,
      status: review.status,
      risk: review.risk,
      confidence: review.confidence,
    })

    if (review.status === 'PASS') {
      return emitMetric({ review }, 'PASS', false, review.confidence)
    }

    if (review.status === 'ESCALATE') {
      return emitMetric({ review, failureReason: 'escalate' }, 'ESCALATE', true, review.confidence)
    }

    if (review.status === 'FAIL') {
      // Reviewer sagt FAIL — terminal für diese Tier, nach oben eskalieren
      return emitMetric({ review, failureReason: 'escalate' }, 'FAIL', true, review.confidence)
    }

    if (review.status === 'REWRITE') {
      // V2: Persistierten Counter inkrementieren wenn verfügbar.
      if (runId && deps.incrementRewriteCount) {
        await deps.incrementRewriteCount(runId, tier)
      }
      localRewriteCount++

      // Effektiven Count bestimmen (persistent wenn verfügbar, sonst lokal).
      const effectiveCount = (runId && deps.getRewriteCount)
        ? deps.getRewriteCount(runId, tier)
        : localRewriteCount

      await deps.audit?.({
        event: 'review_rewrite_loop',
        tier,
        wo_id: wo.wo_id,
        run_id: runId,
        loop_count: effectiveCount,
      })

      if (effectiveCount >= REWRITE_LIMIT) {
        return emitMetric(
          { review, failureReason: 'rewrite_limit_exceeded' },
          'rewrite_limit_exceeded', true, review.confidence,
        )
      }

      // Caller muss Worker neu laufen lassen — Pipeline kann hier nicht
      // re-execute. Wir geben den Hinweis zurück, der äußere Caller
      // entscheidet ob er den Worker erneut anstößt und uns dann nochmal aufruft.
      return emitMetric(
        { review, failureReason: 'rewrite_pending' },
        'REWRITE', false, review.confidence,
      )
    }
  }

  // Unreachable — alle Status sind oben behandelt
  return emitMetric({ failureReason: 'invalid_json' }, 'invalid_json', true)
}

// ─── Main Pipeline ────────────────────────────────────────────────────────────

/**
 * Run the review pipeline:
 *   Worker output → Spark 3 (Gemma 4) → Spark 4 (GPT-OSS) → Claude
 *
 * High-Risk (auth/rls/migration/security):
 *   Spark 3 runs anyway (non-blocking, run-and-log).
 *   Spark 3 PASS does NOT approve.
 *   Spark 3 findings forwarded to Spark 4.
 *   Spark 4 is mandatory blocking.
 *
 * Returns:
 *   { kind: 'done' }          → review accepted, pipeline complete
 *   { kind: 'rewrite' }       → caller should re-run worker, then call pipeline again
 *   { kind: 'human_needed' }  → terminal, automated pipeline stops
 *
 * Note: This V1 does NOT call Claude itself. When Spark 4 escalates,
 * we return human_needed with the trigger reason. Caller (dispatcher)
 * decides if and how Claude is invoked, applying the Claude Usage Rule
 * gate (RULES.md Sektion 5).
 */
export async function runReviewPipeline(
  result: PipelineWorkerResult,
  wo: PipelineWorkorder,
  deps: PipelineDeps,
): Promise<PipelineResult> {
  const highRisk = requiresSeniorReview(wo.category)
  const runId = result.run_id

  // ── Spark 3 (Gemma 4) ──
  // Läuft IMMER, auch bei High-Risk. Bei High-Risk ist sein PASS aber
  // nicht ausschlaggebend — Spark 4 muss trotzdem entscheiden.
  const spark3Outcome = await runSingleTier('spark-c', wo, result, deps, runId)

  if (!highRisk) {
    // Normaler Flow: Spark 3 PASS akzeptiert
    if (spark3Outcome.review && !spark3Outcome.failureReason) {
      return { kind: 'done', finalTier: 'spark-c', review: spark3Outcome.review }
    }

    if (spark3Outcome.failureReason === 'rewrite_pending') {
      return {
        kind: 'rewrite',
        tier: 'spark-c',
        reason: 'spark-c REWRITE — caller should re-run worker',
      }
    }
    // Sonst: ESCALATE / invalid_json / rewrite_limit_exceeded → Spark 4
    await deps.audit?.({
      event: 'review_escalated',
      tier: 'spark-c',
      wo_id: wo.wo_id,
      run_id: runId,
      reason: spark3Outcome.failureReason ?? 'unknown',
    })
    if (deps.requireFastReviewerPass) {
      return {
        kind: 'human_needed',
        reason: `fast reviewer required but did not pass: ${spark3Outcome.failureReason ?? 'unknown'}`,
        lastTier: 'spark-c',
      }
    }
  } else {
    // High-Risk: Spark 3 wird non-blocking geloggt
    // Fallbacks für invalid_output Fälle — sonst hätten wir status: undefined im JSONL
    await deps.audit?.({
      event: 'review_completed',
      tier: 'spark-c-non-blocking',
      wo_id: wo.wo_id,
      run_id: runId,
      status: spark3Outcome.review?.status ?? 'INVALID_OUTPUT',
      risk: spark3Outcome.review?.risk ?? 'UNKNOWN',
      confidence: spark3Outcome.review?.confidence ?? 0,
      reason: spark3Outcome.failureReason ?? 'high-risk-mandatory-spark-d',
    })
  }

  // ── Spark 4 (GPT-OSS) ──
  // Läuft entweder weil Spark 3 escaliert hat oder weil High-Risk.
  // Spark-3-Findings werden als Kontext mitgegeben (auch bei rewrite_limit).
  const spark3Findings = spark3Outcome.review

  const spark4Outcome = await runSingleTier(
    'spark-d',
    wo,
    result,
    deps,
    runId,
    spark3Findings,
  )

  if (spark4Outcome.review && !spark4Outcome.failureReason) {
    return { kind: 'done', finalTier: 'spark-d', review: spark4Outcome.review }
  }

  if (spark4Outcome.failureReason === 'rewrite_pending') {
    return {
      kind: 'rewrite',
      tier: 'spark-d',
      reason: 'spark-d REWRITE — caller should re-run worker',
    }
  }

  // Spark 4 escaliert / FAIL / invalid_json / rewrite_limit → Claude
  // V1: wir rufen Claude NICHT direkt auf. Caller entscheidet.
  const reason =
    spark4Outcome.failureReason === 'rewrite_limit_exceeded'
      ? 'spark-d rewrite_limit_exceeded → Claude needed'
      : spark4Outcome.failureReason === 'invalid_json'
        ? 'spark-d invalid_json → Claude needed'
        : spark4Outcome.failureReason === 'reviewer_unavailable'
          ? 'spark-d reviewer_unavailable → Claude needed'
          : 'spark-d ESCALATE → Claude needed'

  await deps.audit?.({
    event: 'review_escalated',
    tier: 'spark-d',
    wo_id: wo.wo_id,
    run_id: runId,
    reason,
  })

  await deps.audit?.({
    event: 'human_review_required',
    tier: 'claude',
    wo_id: wo.wo_id,
    run_id: runId,
    reason: 'spark-d escalated, Claude not auto-invoked in V1',
  })

  return {
    kind: 'human_needed',
    reason,
    lastTier: 'spark-d',
  }
}
