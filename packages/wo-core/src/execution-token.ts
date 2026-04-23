// Execution Token V1
// packages/wo-core/src/execution-token.ts
// Schema: system/control-plane/execution_token_spec_v1.md

export type SATCheckResult = 'pass' | 'reject'

export interface SATCheckResults {
  type_availability: SATCheckResult
  scope_reachability: SATCheckResult
  constraint_satisfiability: SATCheckResult
}

export interface SATCheckOutput {
  result: 'pass' | 'reject'
  execution_token?: ExecutionToken
  failure_code?: string
  constraint_hint?: string
  checks: SATCheckResults
}

export interface ExecutionToken {
  // Identity
  token_id: string // UUID v4
  artefakt_hash: string // SHA-256 of GovernanceArtefaktV3
  wo_id: string

  // Temporal
  issued_at: string // ISO8601 UTC
  expires_at: string // issued_at + 300s (5 minutes)
  nonce: string // 32-byte random hex — Replay-Protection

  // SAT-Check Results
  sat_check_results: SATCheckResults

  // Issuer
  issuer: 'threadripper-control-plane'
  issuer_key_id: string // Ed25519 Public Key Fingerprint

  // Signature — Ed25519 over all fields except signature
  signature: string // Base64url encoded
}

// Token payload without signature (for signing/verification)
export type ExecutionTokenPayload = Omit<ExecutionToken, 'signature'>

// Token expiry duration in milliseconds (5 minutes)
export const TOKEN_EXPIRY_MS = 300_000
