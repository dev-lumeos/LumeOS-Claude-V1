// system/control-plane/pipeline-metrics.ts
//
// Pipeline-Metrics JSONL — misst Latenz, Outcome und Escalation-Rate
// pro Tier-Aufruf der Review-Pipeline.
//
// Schreibziel: system/state/pipeline-metrics.jsonl
//
// Separate Datei, separate Domäne — kein Mix mit pipeline-audit.jsonl
// oder audit.jsonl. Metrics sind für Auswertung/Kalibrierung gedacht,
// nicht für Compliance-Audit.
//
// Metriken pro Event:
//   - Latenz pro Tier (Spark C vs Spark D)
//   - Outcome (PASS / REWRITE / ESCALATE / invalid_json / rewrite_limit_exceeded)
//   - Confidence-Distribution (Threshold-Kalibrierung)
//   - Escalation-Flag (ob Tier zum nächsten Tier eskaliert hat)
//   - Rewrite-Count (Cross-Run-Zähler aus State)

import fs   from 'node:fs'
import path from 'node:path'

// ─── Types ────────────────────────────────────────────────────────────────────

export type MetricOutcome =
  | 'PASS'
  | 'REWRITE'
  | 'ESCALATE'
  | 'FAIL'
  | 'invalid_json'
  | 'rewrite_limit_exceeded'

export interface PipelineMetricEvent {
  timestamp:     string        // ISO
  run_id?:       string
  wo_id:         string
  tier:          string        // 'spark-c' | 'spark-d'
  outcome:       MetricOutcome
  confidence?:   number        // 0.0–1.0 — nur bei valider Reviewer-Antwort
  latency_ms:    number        // Zeit vom Tier-Start bis Return
  escalated:     boolean       // true wenn dieser Tier zum nächsten Tier eskaliert
  rewrite_count: number        // aktueller Rewrite-Count (aus State oder lokal)
  high_risk?:    boolean       // ob der WO als High-Risk eingestuft wurde
}

const DEFAULT_METRICS_PATH = 'system/state/pipeline-metrics.jsonl'

// ─── Writers ─────────────────────────────────────────────────────────────────

/**
 * File-based metrics writer factory.
 * Schreibt jeden Event als JSON-Zeile mit auto-injected timestamp (wenn fehlt).
 *
 * Usage:
 *   const writeMetric = createFileMetricsWriter()
 *   await runReviewPipeline(workerOut, wo, { callFastReviewer, writeMetric })
 */
export function createFileMetricsWriter(
  filepath: string = DEFAULT_METRICS_PATH,
): (event: PipelineMetricEvent) => void {
  return function writeMetric(event: PipelineMetricEvent): void {
    const dir = path.dirname(filepath)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    const enriched = { ...event, timestamp: event.timestamp || new Date().toISOString() }
    fs.appendFileSync(filepath, JSON.stringify(enriched) + '\n', 'utf-8')
  }
}

/**
 * In-memory metrics writer for tests — appends events to an array.
 *
 * Usage in tests:
 *   const metrics: PipelineMetricEvent[] = []
 *   const writeMetric = createMemoryMetricsWriter(metrics)
 *   await runReviewPipeline(..., { callFastReviewer, writeMetric })
 *   // assert against metrics array
 */
export function createMemoryMetricsWriter(
  sink: PipelineMetricEvent[],
): (event: PipelineMetricEvent) => void {
  return function writeMetric(event: PipelineMetricEvent): void {
    sink.push({ ...event, timestamp: event.timestamp || new Date().toISOString() })
  }
}
