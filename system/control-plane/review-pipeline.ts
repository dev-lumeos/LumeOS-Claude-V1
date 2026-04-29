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
  validateReviewOutput,
  requiresSeniorReview,
  type ReviewOutput,
} from './governance-validator'
import { callGPTOSSReviewer } from '../../services/scheduler-api/src/vllm-adapter'
import type { PipelineAuditEvent } from './pipeline-audit'

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
  output: string  // Worker-Output (z.B. von Spark 2 / micro-executor)
  diff?: string
  metadata?: Record<string, unknown>
}

export interface PipelineDeps {
  /**
   * Spark 3 (Gemma 4) Reviewer Call.
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
}

export type PipelineResult =
  | { kind: 'done'; finalTier: PipelineTier; review: ReviewOutput }
  | { kind: 'rewrite'; tier: PipelineTier; reason: string }
  | { kind: 'human_needed'; reason: string; lastTier: PipelineTier }

const REWRITE_LIMIT = 2
const CONFIDENCE_THRESHOLD = 0.75

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Strict JSON parse — kein silent fallback (RULES.md Sektion 8).
 */
function parseReviewerJson(content: string): ReviewOutput {
  if (!content) {
    throw new Error('EMPTY_REVIEWER_CONTENT')
  }
  return JSON.parse(content) as ReviewOutput
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
  spark3Findings?: ReviewOutput,
): { systemPrompt: string; userMessage: string } {
  const tierLabel = tier === 'spark-c' ? 'fast-reviewer' : 'senior-reviewer'

  const systemPrompt = [
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
}

async function runSingleTier(
  tier: 'spark-c' | 'spark-d',
  wo: PipelineWorkorder,
  result: PipelineWorkerResult,
  deps: PipelineDeps,
  spark3Findings?: ReviewOutput,
): Promise<TierOutcome> {
  let rewriteCount = 0
  const { systemPrompt, userMessage } = buildReviewPrompt(wo, result, tier, spark3Findings)

  const callReviewer =
    tier === 'spark-c' ? deps.callFastReviewer : callGPTOSSReviewer

  await deps.audit?.({ event: 'review_started', tier, wo_id: wo.wo_id })

  while (rewriteCount <= REWRITE_LIMIT) {
    let raw: string
    try {
      raw = await callReviewer(systemPrompt, userMessage, 800)
    } catch (err) {
      // Reviewer-Call selbst fehlgeschlagen → wie schema_violation behandeln
      return { failureReason: 'invalid_json' }
    }

    let review: ReviewOutput
    try {
      review = parseReviewerJson(raw)
      validateReviewOutput(review)
    } catch {
      return { failureReason: 'invalid_json' }
    }

    review = applyEscalationOverrides(review)

    await deps.audit?.({
      event: 'review_completed',
      tier,
      wo_id: wo.wo_id,
      status: review.status,
      risk: review.risk,
      confidence: review.confidence,
    })

    if (review.status === 'PASS') {
      return { review }
    }

    if (review.status === 'ESCALATE') {
      return { review, failureReason: 'escalate' }
    }

    if (review.status === 'FAIL') {
      // Reviewer sagt FAIL — terminal für diese Tier, nach oben eskalieren
      return { review, failureReason: 'escalate' }
    }

    if (review.status === 'REWRITE') {
      rewriteCount++
      await deps.audit?.({
        event: 'review_rewrite_loop',
        tier,
        wo_id: wo.wo_id,
        loop_count: rewriteCount,
      })

      if (rewriteCount > REWRITE_LIMIT) {
        return { review, failureReason: 'rewrite_limit_exceeded' }
      }

      // Caller muss Worker neu laufen lassen — Pipeline kann hier nicht
      // re-execute. Wir geben den Hinweis zurück, der äußere Caller
      // entscheidet ob er den Worker erneut anstößt und uns dann nochmal aufruft.
      // Für V1: Rewrite ist terminal innerhalb der Pipeline.
      return { review, failureReason: 'rewrite_pending' }
    }
  }

  // Unreachable — alle Status sind oben behandelt
  return { failureReason: 'invalid_json' }
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

  // ── Spark 3 (Gemma 4) ──
  // Läuft IMMER, auch bei High-Risk. Bei High-Risk ist sein PASS aber
  // nicht ausschlaggebend — Spark 4 muss trotzdem entscheiden.
  const spark3Outcome = await runSingleTier('spark-c', wo, result, deps)

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
      reason: spark3Outcome.failureReason ?? 'unknown',
    })
  } else {
    // High-Risk: Spark 3 wird non-blocking geloggt
    await deps.audit?.({
      event: 'review_completed',
      tier: 'spark-c-non-blocking',
      wo_id: wo.wo_id,
      status: spark3Outcome.review?.status,
      risk: spark3Outcome.review?.risk,
      confidence: spark3Outcome.review?.confidence,
      reason: 'high-risk-mandatory-spark-d',
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
        : 'spark-d ESCALATE → Claude needed'

  await deps.audit?.({
    event: 'review_escalated',
    tier: 'spark-d',
    wo_id: wo.wo_id,
    reason,
  })

  await deps.audit?.({
    event: 'human_review_required',
    tier: 'claude',
    wo_id: wo.wo_id,
    reason: 'spark-d escalated, Claude not auto-invoked in V1',
  })

  return {
    kind: 'human_needed',
    reason,
    lastTier: 'spark-d',
  }
}
