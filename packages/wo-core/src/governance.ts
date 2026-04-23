// Governance Artefakt V3
// packages/wo-core/src/governance.ts
// Schema: system/control-plane/governance_artefakt_schema_v3.md

// === META ===
export interface GovernanceArtefaktMeta {
  schema_version: '3.0.0'
  wo_id: string
  source_macro: string
  compiled_by: string
  compiled_at: string // ISO8601
  artefakt_hash: string // SHA-256
}

// === EXECUTION CONTEXT ===
export interface TargetFile {
  path: string
  max_lines_changed: number
  must_exist: boolean
  checksum_before: string // SHA-256
}

export interface ForbiddenPatterns {
  imports: string[]
  functions: string[]
  regex: string[]
}

export interface RequiredType {
  name: string
  fields: string[]
  immutability: boolean
}

export interface InterfaceContract {
  function: string
  inputs: string[]
  outputs: string[]
  side_effects: 'none' | 'read' | 'write'
  max_cyclomatic: number
}

export interface ExecutionContext {
  target_files: TargetFile[]
  forbidden_patterns: ForbiddenPatterns
  required_types: RequiredType[]
  interface_contracts: InterfaceContract[]
}

// === DETERMINISM ===
export interface DeterminismConfig {
  temperature: 0.0
  seed: 42
  top_p: 1.0
  top_k: 1
  repetition_penalty: 1.0
}

// === ACCEPTANCE GATES ===
export interface StaticGate {
  type: 'ast_parse' | 'typecheck'
  command?: string
  must_pass: true
}

export interface DynamicGate {
  type: 'unit_test' | 'property_test'
  test_file?: string
  coverage_min?: number
  invariant?: string
  iterations?: number
}

export interface DeterminismGate {
  type: 'triple_hash'
  description: string
  variance_tolerance: 0
}

export interface AcceptanceGates {
  static: StaticGate[]
  dynamic: DynamicGate[]
  determinism: DeterminismGate[]
}

// === FAILURE HANDLING ===
export interface PatternAction {
  action: string
  target: string
}

export interface PatternDetection {
  same_failure_3x: PatternAction
  mixed_failures_3x: PatternAction
}

export interface FailureHandling {
  on_acceptance_fail: 'reject_and_recompile'
  max_recompile_attempts: number
  pattern_detection: PatternDetection
  on_max_exceeded: 'escalate_to_human'
}

// === FULL ARTEFAKT ===
export interface GovernanceArtefaktV3 {
  meta: GovernanceArtefaktMeta
  execution_context: ExecutionContext
  determinism: DeterminismConfig
  acceptance_gates: AcceptanceGates
  failure_handling: FailureHandling
}
