// WO Classifier Schema
// packages/wo-core/src/classifier.ts
//
// Types consumed by services/wo-classifier (Port 9000) — the deterministic
// pre-router that runs before the Governance Compiler. Input is a Macro-WO
// produced by Brain (Tom or an upstream agent); output is the same WO
// annotated with a `routing` block specifying which Spark should pick it up
// and at what priority.

// ────────────────────────────────────────────────────────────────────────────
// Atomic enums
// ────────────────────────────────────────────────────────────────────────────

export type WOCategory =
  | 'implementation'
  | 'review'
  | 'migration'
  | 'docs'
  | 'test'
  | 'analysis'
  | 'planning'
  | 'governance'

export type WOModule =
  | 'nutrition'
  | 'training'
  | 'coach'
  | 'supplement'
  | 'medical'
  | 'auth'
  | 'infra'
  | 'marketplace'
  | 'cross'

export type WOComplexity = 'low' | 'medium' | 'high'

export type WORisk = 'low' | 'medium' | 'high'

export type DBAccess = 'none' | 'read' | 'write' | 'migration'

export type SparkTarget = 'spark_a' | 'spark_b' | 'spark_c' | 'spark_d'

export type WOPriority = 0 | 1 | 2 | 3 // 0=CRITICAL, 1=HIGH, 2=NORMAL, 3=LOW

export type ClassifierStatus = 'QUEUED' | 'REJECTED'

export type WOOriginator = 'human' | 'spark1' | 'spark4'

// ────────────────────────────────────────────────────────────────────────────
// Classifier I/O
// ────────────────────────────────────────────────────────────────────────────

export interface WOClassifierInput {
  id: string
  title: string
  type: WOCategory
  module: WOModule
  complexity: WOComplexity
  risk: WORisk
  requires_reasoning: boolean
  requires_schema_change: boolean
  db_access: DBAccess
  /** min 1 entry; the literal "*" alone is rejected at Stage 0. */
  files_allowed: string[]
  files_blocked?: string[]
  /** min 1 entry. */
  acceptance_criteria: string[]
  created_by: WOOriginator
}

export interface WORouting {
  assigned_spark: SparkTarget
  assigned_by: 'classifier'
  routing_reason: string
  needs_db_check: boolean
  priority: WOPriority
  status: ClassifierStatus
}

export interface WOClassifierOutput extends WOClassifierInput {
  routing: WORouting
}

export interface WOClassifierReject {
  status: 'REJECTED'
  error: string
  reason: string
  wo_id?: string
}
