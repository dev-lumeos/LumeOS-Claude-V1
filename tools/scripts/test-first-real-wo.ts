/**
 * First Real Work Order E2E Test
 * tools/scripts/test-first-real-wo.ts
 *
 * Runs a complete WO lifecycle:
 * 1. Macro-WO → Governance Compiler (Spark A)
 * 2. GovernanceArtefaktV3 → SAT-Check
 * 3. SAT Pass → Execution Token (Ed25519)
 * 4. WO → Supabase
 * 5. Execution → Spark B (deterministic)
 * 6. triple_hash verification
 * 7. Result → Supabase
 */

import { createClient } from '@supabase/supabase-js'
import { createExecutionToken, verifyExecutionToken } from '@lumeos/execution-token'
import { VLLMClient } from '@lumeos/vllm-client'
import type { GovernanceArtefaktV3 } from '@lumeos/wo-core'
import * as crypto from 'crypto'

// ============ CONFIG ============

const CONFIG = {
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321',
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  },
  services: {
    governanceCompiler: `http://localhost:${process.env.GOVERNANCE_COMPILER_PORT || 9003}`,
    satCheck: `http://localhost:${process.env.SAT_CHECK_PORT || 9001}`,
    scheduler: `http://localhost:${process.env.SCHEDULER_PORT || 9002}`
  },
  spark: {
    a: process.env.SPARK_A_ENDPOINT || 'http://192.168.0.128:8001',
    b: process.env.SPARK_B_ENDPOINT || 'http://192.168.0.188:8001'
  },
  keys: {
    privateKey: process.env.ED25519_PRIVATE_KEY || '',
    publicKey: process.env.ED25519_PUBLIC_KEY || ''
  }
}

// ============ MACRO-WO DEFINITION ============

const MACRO_WO = {
  wo_id: 'WO-agent-core-env-001',
  task_description: `Fix NODE_PROFILES and TIER_ENDPOINTS in packages/agent-core/src/registry.ts to use environment variables instead of hardcoded hostnames.

Current code has hardcoded URLs like 'http://spark-a:8001' and 'http://spark-b:8001'.
Replace with process.env.SPARK_A_ENDPOINT and process.env.SPARK_B_ENDPOINT.

Changes required:
1. NODE_PROFILES['spark-a'].endpoint → process.env.SPARK_A_ENDPOINT || 'http://192.168.0.128:8001'
2. NODE_PROFILES['spark-b'].endpoint → process.env.SPARK_B_ENDPOINT || 'http://192.168.0.188:8001'
3. TIER_ENDPOINTS values → use same pattern with fallbacks

Maintain TypeScript types. Ensure code compiles.`,
  target_files: ['packages/agent-core/src/registry.ts'],
  constraints: {
    max_lines_per_file: 30,
    forbidden_imports: ['axios', 'node-fetch', 'got'],
    forbidden_patterns: ['eval', 'exec', 'Function\\(']
  },
  acceptance_criteria: [
    'All endpoint URLs use process.env with fallback',
    'TypeScript compiles without errors',
    'No hardcoded spark-a or spark-b hostnames remain',
    'Fallback values match .env.example'
  ]
}

// ============ MICRO EXECUTOR PROMPT ============

const MICRO_EXECUTOR_PROMPT = `Du bist ein deterministischer Code-Executor für LumeOS.

## Aufgabe
Führe die folgende Änderung aus. Generiere NUR den geänderten Code.

## Regeln
1. Ändere NUR die spezifizierten Files
2. Halte dich EXAKT an die Constraints
3. Generiere KEINEN erklärenden Text, NUR Code
4. Beginne mit \`\`\`typescript und ende mit \`\`\`

## Task
{task_description}

## Target Files
{target_files}

## Current File Content
{current_content}

## Output Format
Generiere den kompletten neuen Inhalt der Datei:

\`\`\`typescript
// Dein Code hier
\`\`\`
`

// ============ UTILITIES ============

function log(step: string, message: string, data?: unknown) {
  const timestamp = new Date().toISOString()
  console.log(`\n[${timestamp}] === ${step} ===`)
  console.log(message)
  if (data) {
    console.log(JSON.stringify(data, null, 2))
  }
}

function sha256(content: string): string {
  return crypto.createHash('sha256').update(content).digest('hex')
}

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers
    }
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`HTTP ${response.status}: ${error}`)
  }

  return response.json()
}

// ============ STEP 1: GOVERNANCE COMPILER ============

async function step1_compileGovernanceArtefakt(): Promise<GovernanceArtefaktV3> {
  log('STEP 1', 'Compiling Macro-WO to GovernanceArtefaktV3 via Spark A')

  const response = await fetchJson<{ artefakt: GovernanceArtefaktV3; raw_output: string }>(
    `${CONFIG.services.governanceCompiler}/compile`,
    {
      method: 'POST',
      body: JSON.stringify({ macro_wo: MACRO_WO })
    }
  )

  log('STEP 1', 'Governance Artefakt compiled', {
    wo_id: response.artefakt.meta.wo_id,
    artefakt_hash: response.artefakt.meta.artefakt_hash,
    target_files: response.artefakt.execution_context.target_files.length
  })

  return response.artefakt
}

// ============ STEP 2: SAT-CHECK ============

interface SATCheckResult {
  pass: boolean
  checks: {
    type_availability: { pass: boolean; details: string }
    scope_reachability: { pass: boolean; details: string }
    constraint_satisfiability: { pass: boolean; details: string }
  }
}

async function step2_satCheck(artefakt: GovernanceArtefaktV3): Promise<SATCheckResult> {
  log('STEP 2', 'Running SAT-Check')

  const response = await fetchJson<SATCheckResult>(
    `${CONFIG.services.satCheck}/check`,
    {
      method: 'POST',
      body: JSON.stringify({ artefakt })
    }
  )

  log('STEP 2', `SAT-Check ${response.pass ? 'PASSED' : 'FAILED'}`, response.checks)

  if (!response.pass) {
    throw new Error('SAT-Check failed')
  }

  return response
}

// ============ STEP 3: EXECUTION TOKEN ============

interface TokenResult {
  token: string
  verified: boolean
}

async function step3_createToken(
  artefakt: GovernanceArtefaktV3,
  satResult: SATCheckResult
): Promise<TokenResult> {
  log('STEP 3', 'Creating Ed25519 signed Execution Token')

  const token = await createExecutionToken(
    {
      wo_id: artefakt.meta.wo_id,
      artefakt_hash: artefakt.meta.artefakt_hash,
      sat_check_output: {
        pass: satResult.pass,
        checked_at: new Date().toISOString(),
        checks: {
          type_availability: satResult.checks.type_availability.pass,
          scope_reachability: satResult.checks.scope_reachability.pass,
          constraint_satisfiability: satResult.checks.constraint_satisfiability.pass
        }
      }
    },
    CONFIG.keys.privateKey
  )

  // Verify the token
  const verified = await verifyExecutionToken(token, CONFIG.keys.publicKey)

  log('STEP 3', `Token created and ${verified ? 'VERIFIED' : 'VERIFICATION FAILED'}`, {
    token_length: token.length,
    verified
  })

  return { token, verified }
}

// ============ STEP 4: WRITE TO SUPABASE ============

async function step4_writeToSupabase(
  artefakt: GovernanceArtefaktV3,
  token: string
): Promise<string> {
  log('STEP 4', 'Writing WO to Supabase')

  const supabase = createClient(CONFIG.supabase.url, CONFIG.supabase.serviceKey)

  // Write governance artefakt
  const { error: artefaktError } = await supabase
    .from('governance_artefacts')
    .insert({
      wo_id: artefakt.meta.wo_id,
      artefakt_hash: artefakt.meta.artefakt_hash,
      schema_version: artefakt.meta.schema_version,
      compiled_by: artefakt.meta.compiled_by,
      compiled_at: artefakt.meta.compiled_at,
      artefakt_json: artefakt
    })

  if (artefaktError) {
    throw new Error(`Failed to write artefakt: ${artefaktError.message}`)
  }

  // Write workorder
  const { data: wo, error: woError } = await supabase
    .from('workorders')
    .insert({
      wo_id: artefakt.meta.wo_id,
      status: 'dispatched',
      artefakt_hash: artefakt.meta.artefakt_hash,
      execution_token: token,
      assigned_node: 'spark-b',
      dispatched_at: new Date().toISOString()
    })
    .select()
    .single()

  if (woError) {
    throw new Error(`Failed to write workorder: ${woError.message}`)
  }

  log('STEP 4', 'WO written to Supabase', { wo_id: wo.wo_id, status: wo.status })

  return wo.wo_id
}

// ============ STEP 5: EXECUTE ON SPARK B ============

interface ExecutionResult {
  code: string
  usage: { prompt_tokens: number; completion_tokens: number }
}

async function step5_executeOnSparkB(
  artefakt: GovernanceArtefaktV3
): Promise<ExecutionResult> {
  log('STEP 5', 'Executing WO on Spark B (deterministic)')

  // Read current file content
  const fs = await import('fs')
  const path = await import('path')
  const workspaceRoot = process.env.WORKSPACE_ROOT || process.cwd()
  const targetFile = artefakt.execution_context.target_files[0].path
  const fullPath = path.resolve(workspaceRoot, targetFile)
  const currentContent = fs.readFileSync(fullPath, 'utf-8')

  // Build prompt
  const prompt = MICRO_EXECUTOR_PROMPT
    .replace('{task_description}', MACRO_WO.task_description)
    .replace('{target_files}', MACRO_WO.target_files.join('\n'))
    .replace('{current_content}', currentContent)

  // Create client for Spark B
  const client = new VLLMClient(CONFIG.spark.b, 'qwen3-coder-30b')

  // Execute with deterministic params
  const response = await client.complete(prompt, {
    temperature: artefakt.determinism.temperature,
    seed: artefakt.determinism.seed,
    top_p: artefakt.determinism.top_p,
    top_k: artefakt.determinism.top_k,
    max_tokens: 4096
  })

  const code = response.choices[0]?.text || ''

  log('STEP 5', 'Execution complete', {
    output_length: code.length,
    tokens: response.usage
  })

  return {
    code,
    usage: response.usage
  }
}

// ============ STEP 6: TRIPLE HASH VERIFICATION ============

interface TripleHashResult {
  pass: boolean
  hashes: string[]
  warning?: string
}

async function step6_tripleHash(
  artefakt: GovernanceArtefaktV3
): Promise<TripleHashResult> {
  log('STEP 6', 'Running triple_hash verification (3 sequential calls)')

  const fs = await import('fs')
  const path = await import('path')
  const workspaceRoot = process.env.WORKSPACE_ROOT || process.cwd()
  const targetFile = artefakt.execution_context.target_files[0].path
  const fullPath = path.resolve(workspaceRoot, targetFile)
  const currentContent = fs.readFileSync(fullPath, 'utf-8')

  const prompt = MICRO_EXECUTOR_PROMPT
    .replace('{task_description}', MACRO_WO.task_description)
    .replace('{target_files}', MACRO_WO.target_files.join('\n'))
    .replace('{current_content}', currentContent)

  const client = new VLLMClient(CONFIG.spark.b, 'qwen3-coder-30b')
  const hashes: string[] = []

  for (let i = 0; i < 3; i++) {
    log('STEP 6', `triple_hash call ${i + 1}/3`)

    const response = await client.complete(prompt, {
      temperature: 0.0,
      seed: 42,
      top_p: 1.0,
      top_k: 1,
      max_tokens: 4096
    })

    const code = response.choices[0]?.text || ''
    const hash = sha256(code)
    hashes.push(hash)

    log('STEP 6', `Call ${i + 1} hash: ${hash.slice(0, 16)}...`)
  }

  // Check if all hashes match
  const allMatch = hashes.every(h => h === hashes[0])

  if (allMatch) {
    log('STEP 6', 'triple_hash PASSED - all outputs identical', { hash: hashes[0].slice(0, 16) })
    return { pass: true, hashes }
  } else {
    log('STEP 6', 'DETERMINISM_WARNING: triple_hash outputs differ!', { hashes: hashes.map(h => h.slice(0, 16)) })
    return {
      pass: false,
      hashes,
      warning: 'DETERMINISM_WARNING: Outputs differ across 3 identical calls'
    }
  }
}

// ============ STEP 7: SAVE RESULT ============

async function step7_saveResult(
  woId: string,
  executionResult: ExecutionResult,
  tripleHashResult: TripleHashResult
): Promise<void> {
  log('STEP 7', 'Saving result to Supabase')

  const supabase = createClient(CONFIG.supabase.url, CONFIG.supabase.serviceKey)

  const status = tripleHashResult.pass ? 'done' : 'done_with_warning'

  const { error } = await supabase
    .from('workorders')
    .update({
      status,
      completed_at: new Date().toISOString(),
      result_json: {
        code_length: executionResult.code.length,
        triple_hash: tripleHashResult,
        usage: executionResult.usage
      }
    })
    .eq('wo_id', woId)

  if (error) {
    throw new Error(`Failed to update workorder: ${error.message}`)
  }

  log('STEP 7', `Result saved. Status: ${status}`)
}

// ============ MAIN ============

async function main() {
  console.log('\n' + '='.repeat(60))
  console.log('LumeOS First Real Work Order E2E Test')
  console.log('='.repeat(60))
  console.log('\nMacro-WO:', MACRO_WO.wo_id)
  console.log('Task:', MACRO_WO.task_description.split('\n')[0])
  console.log('Target:', MACRO_WO.target_files.join(', '))

  try {
    // Step 1: Compile Governance Artefakt
    const artefakt = await step1_compileGovernanceArtefakt()

    // Step 2: SAT-Check
    const satResult = await step2_satCheck(artefakt)

    // Step 3: Create Execution Token
    const { token, verified } = await step3_createToken(artefakt, satResult)
    if (!verified) throw new Error('Token verification failed')

    // Step 4: Write to Supabase
    const woId = await step4_writeToSupabase(artefakt, token)

    // Step 5: Execute on Spark B
    const executionResult = await step5_executeOnSparkB(artefakt)

    // Step 6: Triple Hash Verification
    const tripleHashResult = await step6_tripleHash(artefakt)

    // Step 7: Save Result
    await step7_saveResult(woId, executionResult, tripleHashResult)

    // Final Report
    console.log('\n' + '='.repeat(60))
    console.log('E2E TEST COMPLETE')
    console.log('='.repeat(60))
    console.log('\nResults:')
    console.log(`  WO ID: ${woId}`)
    console.log(`  SAT-Check: PASS`)
    console.log(`  Token: VERIFIED`)
    console.log(`  Execution: COMPLETE`)
    console.log(`  triple_hash: ${tripleHashResult.pass ? 'PASS' : 'WARN'}`)

    if (tripleHashResult.warning) {
      console.log(`\n  WARNING: ${tripleHashResult.warning}`)
    }

    console.log('\n  Generated code preview:')
    console.log('  ' + executionResult.code.slice(0, 200).replace(/\n/g, '\n  ') + '...')

    console.log('\n' + '='.repeat(60))
    console.log('SUCCESS: First real WO lifecycle complete!')
    console.log('='.repeat(60))

  } catch (error) {
    console.error('\n' + '='.repeat(60))
    console.error('E2E TEST FAILED')
    console.error('='.repeat(60))
    console.error(error)
    process.exit(1)
  }
}

main()
