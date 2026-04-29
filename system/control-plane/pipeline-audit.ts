// system/control-plane/pipeline-audit.ts
//
// Pipeline-Audit-Events für die Review-Pipeline.
//
// Eigene Datei + eigene JSONL — bewusst getrennt von system/state/audit.jsonl,
// das die bestehende Tool-Authorization-/Dispatcher-Audit-Logik schreibt.
// Pipeline-Audit ist eine andere Domäne und soll die existierende Logik nicht
// stören.
//
// Schreibziel:  system/state/pipeline-audit.jsonl
//
// Siehe RULES.md Sektion 12 (Audit-Trail).

import fs from 'node:fs'
import path from 'node:path'
import type { ReviewState } from './governance-validator'

export type PipelineAuditEventName =
  | 'review_started'
  | 'review_completed'
  | 'review_escalated'
  | 'review_rewrite_loop'
  | 'claude_call_allowed'
  | 'claude_call_blocked'
  | 'human_review_required'

export type PipelineAuditTier =
  | 'spark-c'
  | 'spark-c-non-blocking'
  | 'spark-d'
  | 'claude'

export interface PipelineAuditEvent {
  event:        PipelineAuditEventName
  tier:         PipelineAuditTier
  wo_id:        string
  ts?:          string  // ISO timestamp, auto-set on write
  reason?:      string
  /**
   * Reviewer-Output Status. ReviewState bei valider Antwort,
   * 'INVALID_OUTPUT' wenn Reviewer kein parsebares JSON / Schema-Verletzung lieferte.
   * 'INVALID_OUTPUT' ist nur ein Audit-Marker — kein gültiger ReviewState der
   * in die Pipeline-Logik einfließt.
   */
  status?:      ReviewState | 'INVALID_OUTPUT'
  /**
   * Risk-Level. UPPERCASE wie im Reviewer-Contract, plus 'UNKNOWN' bei invalid_output.
   */
  risk?:        'LOW' | 'MEDIUM' | 'HIGH' | 'UNKNOWN'
  confidence?:  number
  loop_count?:  number
}

const DEFAULT_AUDIT_PATH = 'system/state/pipeline-audit.jsonl'

/**
 * File-based audit writer factory.
 * Schreibt jeden Event als JSON-Zeile mit auto-injected timestamp.
 *
 * Usage:
 *   const audit = createFileAuditWriter()
 *   const result = await runReviewPipeline(workerOut, wo, { callFastReviewer, audit })
 */
export function createFileAuditWriter(filepath: string = DEFAULT_AUDIT_PATH) {
  return function audit(event: PipelineAuditEvent): void {
    const dir = path.dirname(filepath)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    const enriched = { ts: new Date().toISOString(), ...event }
    fs.appendFileSync(filepath, JSON.stringify(enriched) + '\n', 'utf-8')
  }
}

/**
 * In-memory audit writer for tests — appends events to an array.
 *
 * Usage in tests:
 *   const events: PipelineAuditEvent[] = []
 *   const audit = createMemoryAuditWriter(events)
 *   await runReviewPipeline(..., { callFastReviewer, audit })
 *   // assert against events array
 */
export function createMemoryAuditWriter(sink: PipelineAuditEvent[]) {
  return function audit(event: PipelineAuditEvent): void {
    sink.push({ ts: new Date().toISOString(), ...event })
  }
}
