// Execution Token — Signing
// packages/execution-token/src/sign.ts
// Ed25519 signing on Threadripper Control Plane

import * as ed from '@noble/ed25519'
import { createHash, randomBytes } from 'crypto'
import type {
  ExecutionToken,
  ExecutionTokenPayload,
  SATCheckResults,
  GovernanceArtefaktV3,
  TOKEN_EXPIRY_MS
} from '@lumeos/wo-core'

// Use SHA-512 for Ed25519 (required by @noble/ed25519)
ed.etc.sha512Sync = (...m) => {
  const hash = createHash('sha512')
  m.forEach(msg => hash.update(msg))
  return new Uint8Array(hash.digest())
}

/**
 * Create and sign an ExecutionToken after successful SAT-Check.
 * Only called by Threadripper Control Plane.
 */
export async function createExecutionToken(
  artefakt: GovernanceArtefaktV3,
  satResults: SATCheckResults,
  privateKeyBase64: string
): Promise<ExecutionToken> {
  const privateKey = Buffer.from(privateKeyBase64, 'base64')
  const publicKey = await ed.getPublicKeyAsync(privateKey)

  const now = new Date()
  const expiresAt = new Date(now.getTime() + 300_000) // 5 minutes

  const payload: ExecutionTokenPayload = {
    token_id: crypto.randomUUID(),
    artefakt_hash: artefakt.meta.artefakt_hash,
    wo_id: artefakt.meta.wo_id,
    issued_at: now.toISOString(),
    expires_at: expiresAt.toISOString(),
    nonce: randomBytes(32).toString('hex'),
    sat_check_results: satResults,
    issuer: 'threadripper-control-plane',
    issuer_key_id: getPublicKeyFingerprint(publicKey)
  }

  // Sign the canonical JSON representation
  const message = canonicalJson(payload)
  const signature = await ed.signAsync(
    new TextEncoder().encode(message),
    privateKey
  )

  return {
    ...payload,
    signature: Buffer.from(signature).toString('base64url')
  }
}

/**
 * Generate Ed25519 key pair for first-time setup.
 * Returns Base64-encoded keys.
 */
export async function generateKeyPair(): Promise<{
  privateKey: string
  publicKey: string
}> {
  const privateKey = ed.utils.randomPrivateKey()
  const publicKey = await ed.getPublicKeyAsync(privateKey)

  return {
    privateKey: Buffer.from(privateKey).toString('base64'),
    publicKey: Buffer.from(publicKey).toString('base64')
  }
}

/**
 * Get fingerprint of public key (first 16 chars of SHA-256).
 */
export function getPublicKeyFingerprint(publicKey: Uint8Array): string {
  const hash = createHash('sha256').update(publicKey).digest('hex')
  return hash.substring(0, 16)
}

/**
 * Canonical JSON for deterministic signing.
 * Keys sorted alphabetically.
 */
function canonicalJson(obj: object): string {
  return JSON.stringify(obj, Object.keys(obj).sort())
}
