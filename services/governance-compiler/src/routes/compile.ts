// Compile Routes — Macro-WO to GovernanceArtefaktV3
// services/governance-compiler/src/routes/compile.ts

import { Hono } from 'hono'
import { VLLMClient } from '@lumeos/vllm-client'
import type { GovernanceArtefaktV3 } from '@lumeos/wo-core'
import * as yaml from 'yaml'
import * as crypto from 'crypto'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

// Get directory of this file (ESM compatible)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Macro-WO Input Schema
interface MacroWO {
  wo_id: string
  task_description: string
  target_files: string[]
  constraints: {
    max_lines_per_file: number
    forbidden_imports: string[]
    forbidden_patterns: string[]
  }
  acceptance_criteria: string[]
}

interface CompileRequest {
  macro_wo: MacroWO
}

interface CompileResponse {
  artefakt: GovernanceArtefaktV3
  raw_output: string
}

export const compileRoutes = new Hono()

// Find workspace root by looking for CLAUDE.md
function findWorkspaceRoot(): string {
  if (process.env.WORKSPACE_ROOT) {
    return process.env.WORKSPACE_ROOT
  }

  // Start from this file's directory and walk up
  // __dirname = services/governance-compiler/src/routes
  let dir = __dirname
  for (let i = 0; i < 10; i++) {
    if (fs.existsSync(path.join(dir, 'CLAUDE.md'))) {
      return dir
    }
    const parent = path.dirname(dir)
    if (parent === dir) break
    dir = parent
  }

  // Fallback: assume we're in services/governance-compiler/src/routes
  return path.resolve(__dirname, '../../../..')
}

// Load governance compiler prompt
function loadPrompt(): string {
  const workspaceRoot = findWorkspaceRoot()
  const promptPath = path.resolve(
    workspaceRoot,
    'system/prompts/governance/governance_compiler_prompt.md'
  )
  return fs.readFileSync(promptPath, 'utf-8')
}

// Calculate SHA-256 hash
function sha256(content: string): string {
  return 'sha256:' + crypto.createHash('sha256').update(content).digest('hex').slice(0, 16)
}

// Calculate file checksum
function calculateFileChecksum(filePath: string): string {
  const workspaceRoot = findWorkspaceRoot()
  const fullPath = path.resolve(workspaceRoot, filePath)

  if (!fs.existsSync(fullPath)) {
    return 'sha256:FILE_NOT_FOUND'
  }

  const content = fs.readFileSync(fullPath, 'utf-8')
  return sha256(content)
}

// Calculate artefakt hash (over all fields except artefakt_hash itself)
function calculateArtefaktHash(artefakt: GovernanceArtefaktV3): string {
  const copy = JSON.parse(JSON.stringify(artefakt))
  copy.meta.artefakt_hash = ''
  return sha256(JSON.stringify(copy))
}

// Parse YAML output to GovernanceArtefaktV3
function parseArtefakt(rawOutput: string): GovernanceArtefaktV3 {
  let yamlContent = rawOutput

  // Remove <think>...</think> blocks (Qwen reasoning)
  yamlContent = yamlContent.replace(/<think>[\s\S]*?<\/think>/g, '')

  // Remove markdown code block if present
  const yamlMatch = yamlContent.match(/```ya?ml\n?([\s\S]*?)```/)
  if (yamlMatch) {
    yamlContent = yamlMatch[1]
  }

  // Find the start of YAML (should start with 'meta:')
  const metaIndex = yamlContent.indexOf('meta:')
  if (metaIndex > 0) {
    yamlContent = yamlContent.substring(metaIndex)
  }

  // Trim whitespace
  yamlContent = yamlContent.trim()

  // Parse YAML
  const parsed = yaml.parse(yamlContent)

  return parsed as GovernanceArtefaktV3
}

// POST /compile - Compile Macro-WO to GovernanceArtefaktV3
compileRoutes.post('/', async (c) => {
  try {
    const body = await c.req.json<CompileRequest>()
    const { macro_wo } = body

    if (!macro_wo || !macro_wo.wo_id) {
      return c.json({ error: 'Invalid macro_wo: wo_id required' }, 400)
    }

    // Create vLLM client for Spark A
    const sparkAEndpoint = process.env.SPARK_A_ENDPOINT || 'http://192.168.0.128:8001'
    const client = new VLLMClient(sparkAEndpoint, 'qwen3.6-35b-fp8')

    // Load prompt template
    const promptTemplate = loadPrompt()

    // Format the input
    const macroWoYaml = yaml.stringify({ macro_wo })
    const fullPrompt = `${promptTemplate}\n\n## Dein Input:\n\n\`\`\`yaml\n${macroWoYaml}\`\`\`\n\nGeneriere jetzt das GovernanceArtefaktV3:`

    // Call Spark A with governance-friendly params
    const response = await client.complete(fullPrompt, {
      temperature: 0.3,  // Slightly creative for constraint extraction
      max_tokens: 4096
    })

    // Extract text from response
    const rawOutput = response.choices[0]?.text || ''

    // Parse the output
    const artefakt = parseArtefakt(rawOutput)

    // Enrich with calculated values
    artefakt.meta.compiled_at = new Date().toISOString()

    // Calculate checksums for target files
    artefakt.execution_context.target_files = artefakt.execution_context.target_files.map(tf => ({
      ...tf,
      checksum_before: calculateFileChecksum(tf.path)
    }))

    // Calculate artefakt hash
    artefakt.meta.artefakt_hash = calculateArtefaktHash(artefakt)

    return c.json<CompileResponse>({
      artefakt,
      raw_output: rawOutput
    })

  } catch (error) {
    console.error('Compile error:', error)
    return c.json({
      error: 'Compilation failed',
      details: error instanceof Error ? error.message : String(error)
    }, 500)
  }
})

// GET / - Service info
compileRoutes.get('/', (c) => {
  return c.json({
    service: 'governance-compiler',
    endpoint: '/compile',
    methods: ['POST'],
    input: 'MacroWO',
    output: 'GovernanceArtefaktV3',
    spark: process.env.SPARK_A_ENDPOINT || 'http://192.168.0.128:8001'
  })
})
