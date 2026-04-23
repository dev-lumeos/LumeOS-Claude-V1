// triple_hash — Determinism Verification
// packages/vllm-client/src/triple-hash.ts
// 3 sequential calls with Seed 42, compare AST hashes

import { createHash } from 'crypto'
import { VLLMClient, ChatMessage, CompletionOptions } from './client'

export interface TripleHashResult {
  deterministic: boolean
  hashes: string[]
  outputs: string[]
  variance: number // 0 = identical, 1+ = different
}

/**
 * Determinism parameters per governance_artefakt_schema_v3.md
 */
const DETERMINISM_OPTIONS: CompletionOptions = {
  temperature: 0.0,
  seed: 42,
  top_p: 1.0,
  top_k: 1
}

/**
 * Execute triple_hash check: 3 sequential generations with identical params.
 * Returns true only if all 3 outputs have identical AST hashes.
 *
 * Per governance spec: variance_tolerance: 0 (bitidentisch oder Reject)
 */
export async function tripleHashCheck(
  client: VLLMClient,
  messages: ChatMessage[],
  options: CompletionOptions = {}
): Promise<TripleHashResult> {
  const opts = { ...DETERMINISM_OPTIONS, ...options }
  const outputs: string[] = []
  const hashes: string[] = []

  // 3 sequential calls (not parallel — ensures determinism)
  for (let i = 0; i < 3; i++) {
    const response = await client.chat(messages, opts)
    const output = response.choices[0]?.message?.content ?? ''

    outputs.push(output)
    hashes.push(computeASTHash(output))
  }

  // Check if all hashes are identical
  const uniqueHashes = new Set(hashes)
  const variance = uniqueHashes.size - 1 // 0 = all same, 1 = 2 different, 2 = all different

  return {
    deterministic: variance === 0,
    hashes,
    outputs,
    variance
  }
}

/**
 * Compute AST-like hash of code output.
 * Normalizes whitespace to focus on structural content.
 */
function computeASTHash(code: string): string {
  // Normalize: remove comments, normalize whitespace
  const normalized = code
    .replace(/\/\/.*$/gm, '') // Remove single-line comments
    .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim()

  return createHash('sha256').update(normalized).digest('hex').substring(0, 16)
}

/**
 * Execute code generation with triple_hash verification.
 * Returns the output only if deterministic, otherwise throws.
 */
export async function generateWithVerification(
  client: VLLMClient,
  messages: ChatMessage[],
  options: CompletionOptions = {}
): Promise<string> {
  const result = await tripleHashCheck(client, messages, options)

  if (!result.deterministic) {
    throw new TripleHashMismatchError(result)
  }

  return result.outputs[0] // All identical, return first
}

/**
 * Error thrown when triple_hash check fails.
 */
export class TripleHashMismatchError extends Error {
  result: TripleHashResult

  constructor(result: TripleHashResult) {
    super(
      `triple_hash failed: ${result.variance + 1} unique outputs. ` +
      `Hashes: ${result.hashes.join(', ')}`
    )
    this.name = 'TripleHashMismatchError'
    this.result = result
  }
}
