#!/usr/bin/env tsx
/**
 * Control Plane End-to-End Integration Test
 * tools/scripts/test-control-plane-e2e.ts
 *
 * Tests the complete Control Plane lifecycle without LLM calls:
 * 1. Create dummy GovernanceArtefaktV3
 * 2. Call SAT-Check Service (Port 9001)
 * 3. Sign and verify Execution Token
 * 4. Write WO to local Supabase (workorders table)
 * 5. Check Scheduler status (Port 9002)
 *
 * Usage: pnpm tsx tools/scripts/test-control-plane-e2e.ts
 *
 * Prerequisites:
 * - supabase start (local Supabase running)
 * - SAT-Check service running on port 9001
 * - Scheduler service running on port 9002
 */

import { createClient } from '@supabase/supabase-js'
import { createHash, randomBytes } from 'crypto'
import * as ed from '@noble/ed25519'

// ============================================
// CONFIG
// ============================================
const SAT_CHECK_URL = 'http://127.0.0.1:9001'
const SCHEDULER_URL = 'http://127.0.0.1:9002'
const SUPABASE_URL = 'http://127.0.0.1:54321'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-local-supabase-service-role-key'

// Setup Ed25519 SHA-512
ed.etc.sha512Sync = (...m: Uint8Array[]) => {
  const hash = createHash('sha512')
  m.forEach(msg => hash.update(msg))
  return new Uint8Array(hash.digest())
}

// ============================================
// TYPES (inline to avoid import issues)
// ============================================
interface GovernanceArtefaktV3 {
  meta: {
    schema_version: '3.0.0'
    wo_id: string
    source_macro: string
    compiled_by: string
    compiled_at: string
    artefakt_hash: string
  }
  execution_context: {
    target_files: Array<{
      path: string
      max_lines_changed: number
      must_exist: boolean
      checksum_before: string
    }>
    forbidden_patterns: {
      imports: string[]
      functions: string[]
      regex: string[]
    }
    required_types: Array<{
      name: string
      fields: string[]
      immutability: boolean
    }>
    interface_contracts: Array<{
      function: string
      inputs: string[]
      outputs: string[]
      side_effects: 'none' | 'read' | 'write'
      max_cyclomatic: number
    }>
  }
  determinism: {
    temperature: 0.0
    seed: 42
    top_p: 1.0
    top_k: 1
    repetition_penalty: 1.0
  }
  acceptance_gates: {
    static: Array<{ type: string; command?: string; must_pass: true }>
    dynamic: Array<{ type: string; test_file?: string; coverage_min?: number }>
    determinism: Array<{ type: string; description: string; variance_tolerance: 0 }>
  }
  failure_handling: {
    on_acceptance_fail: 'reject_and_recompile'
    max_recompile_attempts: number
    pattern_detection: {
      same_failure_3x: { action: string; target: string }
      mixed_failures_3x: { action: string; target: string }
    }
    on_max_exceeded: 'escalate_to_human'
  }
}

interface SATCheckOutput {
  result: 'pass' | 'reject'
  checks: {
    type_availability: 'pass' | 'reject'
    scope_reachability: 'pass' | 'reject'
    constraint_satisfiability: 'pass' | 'reject'
  }
  failure_code?: string
  constraint_hint?: string
}

// ============================================
// TEST HELPERS
// ============================================
function log(step: string, status: '✅' | '❌' | '⏳', message: string) {
  console.log(`[${step}] ${status} ${message}`)
}

function createDummyArtefakt(): GovernanceArtefaktV3 {
  const woId = `WO-test-e2e-${Date.now()}`
  const artefaktHash = 'sha256:' + createHash('sha256')
    .update(woId)
    .digest('hex')
    .substring(0, 16)

  return {
    meta: {
      schema_version: '3.0.0',
      wo_id: woId,
      source_macro: 'e2e-test-macro',
      compiled_by: 'test-runner',
      compiled_at: new Date().toISOString(),
      artefakt_hash: artefaktHash
    },
    execution_context: {
      target_files: [
        {
          path: 'packages/wo-core/src/types.ts',
          max_lines_changed: 10,
          must_exist: true,
          checksum_before: 'sha256:any' // Wildcard for test
        }
      ],
      forbidden_patterns: {
        imports: ['axios', 'lodash'],
        functions: ['eval', 'exec'],
        regex: []
      },
      required_types: [],
      interface_contracts: []
    },
    determinism: {
      temperature: 0.0,
      seed: 42,
      top_p: 1.0,
      top_k: 1,
      repetition_penalty: 1.0
    },
    acceptance_gates: {
      static: [{ type: 'typecheck', command: 'tsc --noEmit', must_pass: true }],
      dynamic: [],
      determinism: [{ type: 'triple_hash', description: 'test', variance_tolerance: 0 }]
    },
    failure_handling: {
      on_acceptance_fail: 'reject_and_recompile',
      max_recompile_attempts: 3,
      pattern_detection: {
        same_failure_3x: { action: 'recompile', target: 'dgx_a' },
        mixed_failures_3x: { action: 'escalate', target: 'opus' }
      },
      on_max_exceeded: 'escalate_to_human'
    }
  }
}

// ============================================
// TEST STEPS
// ============================================
async function step1_createArtefakt(): Promise<GovernanceArtefaktV3> {
  log('Step 1', '⏳', 'Creating dummy GovernanceArtefaktV3...')

  const artefakt = createDummyArtefakt()

  log('Step 1', '✅', `Created artefakt: ${artefakt.meta.wo_id}`)
  log('Step 1', '✅', `Hash: ${artefakt.meta.artefakt_hash}`)

  return artefakt
}

async function step2_satCheck(artefakt: GovernanceArtefaktV3): Promise<SATCheckOutput> {
  log('Step 2', '⏳', `Calling SAT-Check at ${SAT_CHECK_URL}...`)

  try {
    // First check health
    const healthRes = await fetch(`${SAT_CHECK_URL}/health`)
    if (!healthRes.ok) {
      throw new Error(`SAT-Check health check failed: ${healthRes.status}`)
    }

    // Run SAT check
    const res = await fetch(`${SAT_CHECK_URL}/check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(artefakt)
    })

    if (!res.ok) {
      const error = await res.text()
      throw new Error(`SAT-Check failed: ${res.status} - ${error}`)
    }

    const output: SATCheckOutput = await res.json()

    log('Step 2', '✅', `SAT-Check result: ${output.result}`)
    log('Step 2', '✅', `  type_availability: ${output.checks.type_availability}`)
    log('Step 2', '✅', `  scope_reachability: ${output.checks.scope_reachability}`)
    log('Step 2', '✅', `  constraint_satisfiability: ${output.checks.constraint_satisfiability}`)

    if (output.result === 'reject') {
      log('Step 2', '❌', `Rejection hint: ${output.constraint_hint}`)
    }

    return output

  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ECONNREFUSED') {
      log('Step 2', '❌', 'SAT-Check service not running. Start with: pnpm --filter @lumeos/sat-check dev')
      throw err
    }
    throw err
  }
}

async function step3_executionToken(
  artefakt: GovernanceArtefaktV3,
  satResult: SATCheckOutput
): Promise<{ token: object; verified: boolean }> {
  log('Step 3', '⏳', 'Signing Execution Token...')

  // Generate ephemeral key pair for test
  const privateKey = ed.utils.randomPrivateKey()
  const publicKey = await ed.getPublicKeyAsync(privateKey)

  const publicKeyFingerprint = createHash('sha256')
    .update(publicKey)
    .digest('hex')
    .substring(0, 16)

  // Create token payload
  const now = new Date()
  const payload = {
    token_id: crypto.randomUUID(),
    artefakt_hash: artefakt.meta.artefakt_hash,
    wo_id: artefakt.meta.wo_id,
    issued_at: now.toISOString(),
    expires_at: new Date(now.getTime() + 300_000).toISOString(),
    nonce: randomBytes(32).toString('hex'),
    sat_check_results: satResult.checks,
    issuer: 'threadripper-control-plane',
    issuer_key_id: publicKeyFingerprint
  }

  // Sign
  const message = JSON.stringify(payload, Object.keys(payload).sort())
  const signature = await ed.signAsync(
    new TextEncoder().encode(message),
    privateKey
  )
  const signatureB64 = Buffer.from(signature).toString('base64url')

  const token = { ...payload, signature: signatureB64 }

  log('Step 3', '✅', `Token signed: ${token.token_id}`)
  log('Step 3', '✅', `Issuer key: ${publicKeyFingerprint}`)

  // Verify
  log('Step 3', '⏳', 'Verifying signature...')

  const { signature: sig, ...verifyPayload } = token
  const verifyMessage = JSON.stringify(verifyPayload, Object.keys(verifyPayload).sort())
  const verified = await ed.verifyAsync(
    Buffer.from(sig, 'base64url'),
    new TextEncoder().encode(verifyMessage),
    publicKey
  )

  log('Step 3', verified ? '✅' : '❌', `Signature verification: ${verified ? 'PASSED' : 'FAILED'}`)

  return { token, verified }
}

async function step4_writeToSupabase(
  artefakt: GovernanceArtefaktV3
): Promise<{ success: boolean; id?: string }> {
  log('Step 4', '⏳', `Writing WO to Supabase at ${SUPABASE_URL}...`)

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false }
    })

    // Insert workorder
    const { data, error } = await supabase
      .from('workorders')
      .insert({
        wo_id: artefakt.meta.wo_id,
        batch_id: 'test-batch-e2e',
        wo_type: 'micro',
        agent_type: 'ts-patch-agent',
        state: 'wo_generated',
        phase: '1',
        scope_files: artefakt.execution_context.target_files.map(f => f.path),
        task: ['E2E test task'],
        acceptance_auto_checks: ['typecheck'],
        source_subtask_id: 'test-subtask'
      })
      .select('id, wo_id')
      .single()

    if (error) {
      log('Step 4', '❌', `Supabase error: ${error.message}`)
      return { success: false }
    }

    log('Step 4', '✅', `WO written: ${data.wo_id}`)
    log('Step 4', '✅', `DB ID: ${data.id}`)

    // Also write governance artefakt
    const { error: artefaktError } = await supabase
      .from('governance_artefacts')
      .insert({
        artefakt_hash: artefakt.meta.artefakt_hash,
        wo_id: artefakt.meta.wo_id,
        source_macro: artefakt.meta.source_macro,
        compiled_by: artefakt.meta.compiled_by,
        compiled_at: artefakt.meta.compiled_at,
        artefakt_json: artefakt,
        sat_check_result: 'pass'
      })

    if (artefaktError) {
      log('Step 4', '❌', `Artefakt insert error: ${artefaktError.message}`)
    } else {
      log('Step 4', '✅', 'Governance artefakt stored')
    }

    return { success: true, id: data.id }

  } catch (err) {
    log('Step 4', '❌', `Supabase connection failed: ${(err as Error).message}`)
    log('Step 4', '❌', 'Is local Supabase running? (supabase start)')
    return { success: false }
  }
}

async function step5_schedulerStatus(): Promise<{ connected: boolean; state?: string }> {
  log('Step 5', '⏳', `Checking Scheduler at ${SCHEDULER_URL}...`)

  try {
    const healthRes = await fetch(`${SCHEDULER_URL}/health`)
    if (!healthRes.ok) {
      throw new Error(`Scheduler health check failed: ${healthRes.status}`)
    }

    const statusRes = await fetch(`${SCHEDULER_URL}/status`)
    if (!statusRes.ok) {
      throw new Error(`Scheduler status failed: ${statusRes.status}`)
    }

    const status = await statusRes.json()

    log('Step 5', '✅', `Scheduler state: ${status.state}`)
    log('Step 5', '✅', `Spark A slots: ${status.slots?.['spark-a']?.available ?? 'N/A'} available`)
    log('Step 5', '✅', `Spark B slots: ${status.slots?.['spark-b']?.available ?? 'N/A'} available`)

    return { connected: true, state: status.state }

  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ECONNREFUSED') {
      log('Step 5', '❌', 'Scheduler service not running. Start with: pnpm --filter @lumeos/scheduler-api dev')
      return { connected: false }
    }
    throw err
  }
}

// ============================================
// MAIN
// ============================================
async function main() {
  console.log('\n' + '='.repeat(60))
  console.log('  LumeOS Control Plane E2E Test')
  console.log('='.repeat(60) + '\n')

  const results: Record<string, boolean> = {}

  try {
    // Step 1: Create dummy artefakt
    const artefakt = await step1_createArtefakt()
    results['step1'] = true

    // Step 2: SAT-Check
    let satResult: SATCheckOutput
    try {
      satResult = await step2_satCheck(artefakt)
      results['step2'] = satResult.result === 'pass'
    } catch {
      results['step2'] = false
      satResult = {
        result: 'pass',
        checks: {
          type_availability: 'pass',
          scope_reachability: 'pass',
          constraint_satisfiability: 'pass'
        }
      }
      log('Step 2', '⏳', 'Skipped (service not running) - using mock result')
    }

    // Step 3: Execution Token
    const { verified } = await step3_executionToken(artefakt, satResult)
    results['step3'] = verified

    // Step 4: Write to Supabase
    const { success: dbSuccess } = await step4_writeToSupabase(artefakt)
    results['step4'] = dbSuccess

    // Step 5: Scheduler Status
    let schedulerResult: { connected: boolean }
    try {
      schedulerResult = await step5_schedulerStatus()
      results['step5'] = schedulerResult.connected
    } catch {
      results['step5'] = false
      log('Step 5', '⏳', 'Skipped (service not running)')
    }

  } catch (err) {
    console.error('\n❌ Test failed with error:', err)
    process.exit(1)
  }

  // Summary
  console.log('\n' + '='.repeat(60))
  console.log('  SUMMARY')
  console.log('='.repeat(60))

  const allPassed = Object.values(results).every(r => r)
  const passCount = Object.values(results).filter(r => r).length
  const totalCount = Object.keys(results).length

  console.log(`\n  ${passCount}/${totalCount} steps passed\n`)

  Object.entries(results).forEach(([step, passed]) => {
    console.log(`  ${passed ? '✅' : '❌'} ${step}`)
  })

  console.log('\n' + '='.repeat(60))

  if (allPassed) {
    console.log('  ✅ ALL TESTS PASSED')
  } else {
    console.log('  ⚠️  SOME TESTS FAILED OR SKIPPED')
    console.log('  Make sure all services are running:')
    console.log('    - supabase start')
    console.log('    - pnpm --filter @lumeos/sat-check dev')
    console.log('    - pnpm --filter @lumeos/scheduler-api dev')
  }
  console.log('='.repeat(60) + '\n')

  process.exit(allPassed ? 0 : 1)
}

main()
