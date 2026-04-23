# Execution Token Spec V1 — LumeOS
# Status: FESTGEZOGEN — 23. April 2026
# Signatur: Ed25519 (Threadripper Control Plane)

---

## Zweck

Der Execution-Token ist der kryptographische Beweis dass:
1. Das Governance-Artefakt den SAT-Check bestanden hat
2. Der Threadripper als Control Plane die Ausführung authorisiert
3. Keine Replay-Attacks möglich sind (Nonce + Expiry)

DGX B akzeptiert KEINE Execution ohne validen Token.

---

## Token Interface (TypeScript)

```typescript
interface ExecutionToken {
  // Identity
  token_id: string           // UUID v4 — eindeutig pro Execution
  artefakt_hash: string      // SHA-256 des Governance-Artefakt
  wo_id: string

  // Temporal
  issued_at: string          // ISO8601 UTC
  expires_at: string         // issued_at + 300s (5 Minuten)
  nonce: string              // 32-byte random hex — Replay-Protection

  // SAT-Check Results
  sat_check_results: {
    type_availability: 'pass' | 'reject'
    scope_reachability: 'pass' | 'reject'
    constraint_satisfiability: 'pass' | 'reject'
  }

  // Issuer
  issuer: 'threadripper-control-plane'
  issuer_key_id: string      // Ed25519 Public Key Fingerprint

  // Signature — Ed25519 über alle Felder außer signature
  signature: string          // Base64url encoded
}
```

---

## Signing (Threadripper)

```typescript
import { sign } from '@noble/ed25519'

function createExecutionToken(
  artefakt: GovernanceArtefaktV3,
  satResults: SATCheckOutput,
  privateKey: Uint8Array
): ExecutionToken {
  const payload: Omit<ExecutionToken, 'signature'> = {
    token_id: crypto.randomUUID(),
    artefakt_hash: artefakt.meta.artefakt_hash,
    wo_id: artefakt.meta.wo_id,
    issued_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 300_000).toISOString(),
    nonce: crypto.getRandomValues(new Uint8Array(32)).toHex(),
    sat_check_results: satResults.checks,
    issuer: 'threadripper-control-plane',
    issuer_key_id: getPublicKeyFingerprint(privateKey)
  }

  const message = JSON.stringify(payload, Object.keys(payload).sort())
  const signature = sign(message, privateKey)

  return { ...payload, signature: base64url(signature) }
}
```

---

## Verification (DGX B)

```typescript
import { verify } from '@noble/ed25519'

function verifyExecutionToken(
  token: ExecutionToken,
  publicKey: Uint8Array
): boolean {
  // 1. Expiry check
  if (new Date(token.expires_at) < new Date()) return false

  // 2. Nonce check (gegen Replay-DB)
  if (nonceAlreadyUsed(token.nonce)) return false

  // 3. Signature verify
  const { signature, ...payload } = token
  const message = JSON.stringify(payload, Object.keys(payload).sort())
  return verify(base64urlDecode(signature), message, publicKey)
}
```

---

## Key Management

```
Threadripper: Ed25519 Private Key → signiert Tokens
DGX A:        Ed25519 Public Key  → kein Signing
DGX B:        Ed25519 Public Key  → verifiziert Tokens
```

- Private Key liegt nur auf Threadripper
- Public Key wird bei System-Start an DGX B übertragen
- Key-Rotation: neuer Key → neues Key-ID — alte Tokens expire nach 5min

*Execution Token Spec V1 — FESTGEZOGEN*
