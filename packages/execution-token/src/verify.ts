// Execution Token — Verification
// packages/execution-token/src/verify.ts
// Used by DGX B to verify tokens before execution

import * as ed from '@noble/ed25519'
import { createHash } from 'crypto'
import type { ExecutionToken } from '@lumeos/wo-core'

// Use SHA-512 for Ed25519 (required by @noble/ed25519)
ed.etc.sha512Sync = (...m) => {
  const hash = createHash('sha512')
  m.forEach(msg => hash.update(msg))
  return new Uint8Array(hash.digest())
}

export interface VerificationResult {
  valid: boolean
  reason?: string
}

// In-memory nonce store (should be Redis in production)
const usedNonces = new Set<string>()

/**
 * Verify an ExecutionToken before allowing WO execution.
 * Checks: expiry, nonce (replay), signature.
 */
export async function verifyExecutionToken(
  token: ExecutionToken,
  publicKeyBase64: string
): Promise<VerificationResult> {
  const publicKey = Buffer.from(publicKeyBase64, 'base64')

  // 1. Expiry check
  const now = new Date()
  const expiresAt = new Date(token.expires_at)

  if (expiresAt < now) {
    return { valid: false, reason: 'Token expired' }
  }

  // 2. Nonce check (replay protection)
  if (usedNonces.has(token.nonce)) {
    return { valid: false, reason: 'Nonce already used (replay attack)' }
  }

  // 3. Signature verification
  const { signature, ...payload } = token
  const message = canonicalJson(payload)

  try {
    const signatureBytes = Buffer.from(signature, 'base64url')
    const isValid = await ed.verifyAsync(
      signatureBytes,
      new TextEncoder().encode(message),
      publicKey
    )

    if (!isValid) {
      return { valid: false, reason: 'Invalid signature' }
    }
  } catch (err) {
    return { valid: false, reason: 'Signature verification failed' }
  }

  // 4. Mark nonce as used
  usedNonces.add(token.nonce)

  // Cleanup old nonces (older than 10 minutes)
  // In production, use Redis with TTL
  scheduleNonceCleanup(token.nonce, 600_000)

  return { valid: true }
}

/**
 * Check if token is expired without full verification.
 */
export function isTokenExpired(token: ExecutionToken): boolean {
  return new Date(token.expires_at) < new Date()
}

/**
 * Extract public key fingerprint from token for key lookup.
 */
export function getTokenKeyId(token: ExecutionToken): string {
  return token.issuer_key_id
}

/**
 * Canonical JSON for deterministic verification.
 */
function canonicalJson(obj: object): string {
  return JSON.stringify(obj, Object.keys(obj).sort())
}

/**
 * Schedule nonce cleanup after TTL.
 */
function scheduleNonceCleanup(nonce: string, ttlMs: number): void {
  setTimeout(() => {
    usedNonces.delete(nonce)
  }, ttlMs)
}
