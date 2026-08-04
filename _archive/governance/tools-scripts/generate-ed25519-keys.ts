/**
 * tools/scripts/generate-ed25519-keys.ts
 *
 * Generate a fresh Ed25519 keypair in the exact format consumed by
 * @lumeos/execution-token (createExecutionToken / verifyExecutionToken):
 * raw 32-byte private key + raw 32-byte public key, both base64-encoded.
 *
 * Output formats:
 *   default      → KEY=value lines, suitable for appending to .env
 *   --shell      → `export KEY=value` lines, suitable for `eval $(...)`
 *   --json       → JSON object {"privateKey":"...","publicKey":"..."}
 *
 * Examples:
 *   npx tsx tools/scripts/generate-ed25519-keys.ts >> .env
 *   eval "$(npx tsx tools/scripts/generate-ed25519-keys.ts --shell)"
 *   npx tsx tools/scripts/generate-ed25519-keys.ts --json
 *
 * SECURITY: this writes a real private key to stdout. Do NOT commit the .env
 * file (already covered by .gitignore). Treat the private key as a secret
 * even though it's "only" for local dev — it signs Execution Tokens that
 * gate vLLM execution on your Sparks.
 */

import * as ed from '@noble/ed25519'
import { createHash } from 'node:crypto'

// @noble/ed25519 needs a sync sha512 hook for the legacy non-async paths.
ed.etc.sha512Sync = (...m) => {
  const h = createHash('sha512')
  for (const msg of m) h.update(msg)
  return new Uint8Array(h.digest())
}

type Format = 'env' | 'shell' | 'json'

function parseFormat(argv: string[]): Format {
  if (argv.includes('--shell')) return 'shell'
  if (argv.includes('--json')) return 'json'
  return 'env'
}

async function main(): Promise<void> {
  const format = parseFormat(process.argv.slice(2))

  const priv = ed.utils.randomPrivateKey()
  const pub = await ed.getPublicKeyAsync(priv)
  const privB64 = Buffer.from(priv).toString('base64')
  const pubB64 = Buffer.from(pub).toString('base64')

  switch (format) {
    case 'json':
      process.stdout.write(
        JSON.stringify({ privateKey: privB64, publicKey: pubB64 }) + '\n'
      )
      return
    case 'shell':
      process.stdout.write(`export ED25519_PRIVATE_KEY="${privB64}"\n`)
      process.stdout.write(`export ED25519_PUBLIC_KEY="${pubB64}"\n`)
      return
    case 'env':
    default:
      process.stdout.write(`ED25519_PRIVATE_KEY=${privB64}\n`)
      process.stdout.write(`ED25519_PUBLIC_KEY=${pubB64}\n`)
      return
  }
}

main().catch((err) => {
  console.error(`generate-ed25519-keys: ${err instanceof Error ? err.message : String(err)}`)
  process.exit(1)
})
