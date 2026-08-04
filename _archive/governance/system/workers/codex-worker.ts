import { spawn, spawnSync, type ChildProcessWithoutNullStreams } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { performance } from 'node:perf_hooks'

import { extractFirstYamlBlock, parseSimpleYaml } from '../workorders/cli/batch-loader'
import {
  getProjectProfile,
  isForbiddenPath,
  isRawLocalPath,
  type ProjectProfile,
} from '../project-profiles/project-profile-loader'

export type FinalState = 'DONE' | 'NEEDS_TOM_APPROVAL' | 'FIX_REQUIRED' | 'STOP' | 'UNKNOWN'

export type CodexWorkerMode = 'dry-run' | 'execute'
export type CodexWorkerStatus = 'disabled' | 'manual_only' | 'controlled_enabled'

export type CodexWorkerArgs = {
  workorderFile?: string
  promptFile?: string
  execute: boolean
  dryRun: boolean
  writePrompt: boolean
  json: boolean
  timeoutMs: number
  projectId?: string
  resumeSessionId?: string
}

export type WorkorderInput = {
  file: string
  raw: string
  parsed: Record<string, unknown>
}

export type CodexSpawnResult = {
  exitCode: number
  stdout: string
  stderr: string
  timedOut?: boolean
}

export type CodexSpawn = (command: string, args: string[], options: { cwd: string; timeoutMs: number }) => Promise<CodexSpawnResult>

export type CodexWorkerResult = {
  mode: CodexWorkerMode
  exitCode: number
  command: string
  args: string[]
  durationMs: number
  prompt: string
  promptPath?: string
  reportPath?: string
  stdout: string
  stderr: string
  finalState: FinalState
  timedOut?: boolean
}

export type CodexWorkerConfig = {
  status: CodexWorkerStatus | string
  codex_worker_enabled: boolean
  allow_dispatcher_integration: boolean
  allowed_agents: string[]
  require_explicit_workorder_flag: boolean
  require_product_gate: boolean
  product_gate_open: boolean
  default_timeout_ms: number
  max_timeout_ms: number
}

type RunOptions = {
  repoRoot?: string
  spawn?: CodexSpawn
}

const FINAL_STATES: FinalState[] = ['NEEDS_TOM_APPROVAL', 'FIX_REQUIRED', 'DONE', 'STOP']
const DEFAULT_TIMEOUT_MS = 120_000
const DEFAULT_MAX_TIMEOUT_MS = 300_000

const PROMPT_ALLOWED_ROOTS = [
  'docs/project/',
  'system/prompts/',
  'system/workorders/',
]

const PROMPT_BLOCKED_ROOTS = [
  'system/state/',
  'system/approval/',
  'docs/specs/Nutrition/00_raw/',
]

const CORE_FORBIDDEN_COMMANDS = [
  'No approval grants.',
  'No Supabase db push.',
  'No Supabase db reset.',
  'No Supabase migration execution unless the workorder explicitly allows it and Tom has approved it.',
  'No production database changes.',
  'No manual runtime_state.json edits.',
  'No manual queue.json edits.',
  'No product work outside the workorder scope.',
  'No raw BLS file commits.',
  'Obey FILES_ALLOWED, SCOPE_FILES, and FILES_BLOCKED.',
]

export function defaultCodexWorkerConfig(): CodexWorkerConfig {
  return {
    status: 'disabled',
    codex_worker_enabled: false,
    allow_dispatcher_integration: false,
    allowed_agents: ['senior-coding-agent'],
    require_explicit_workorder_flag: true,
    require_product_gate: true,
    product_gate_open: false,
    default_timeout_ms: DEFAULT_TIMEOUT_MS,
    max_timeout_ms: DEFAULT_MAX_TIMEOUT_MS,
  }
}

function deriveCodexWorkerStatus(input: Record<string, unknown>): CodexWorkerStatus | string {
  if (input.status === 'disabled' || input.status === 'manual_only' || input.status === 'controlled_enabled') {
    return input.status
  }
  if (typeof input.status === 'string') return input.status
  if (input.codex_worker_enabled === true && input.allow_dispatcher_integration === true) return 'controlled_enabled'
  if (input.codex_worker_enabled === true) return 'manual_only'
  return 'disabled'
}

export function normalizeCodexWorkerConfig(value: unknown): CodexWorkerConfig {
  const defaults = defaultCodexWorkerConfig()
  if (!value || typeof value !== 'object') return defaults
  const input = value as Record<string, unknown>
  const allowedAgents = Array.isArray(input.allowed_agents)
    ? input.allowed_agents.filter((item): item is string => typeof item === 'string')
    : defaults.allowed_agents
  const defaultTimeout = typeof input.default_timeout_ms === 'number' && Number.isFinite(input.default_timeout_ms)
    ? input.default_timeout_ms
    : defaults.default_timeout_ms
  const maxTimeout = typeof input.max_timeout_ms === 'number' && Number.isFinite(input.max_timeout_ms)
    ? input.max_timeout_ms
    : defaults.max_timeout_ms
  return {
    status: deriveCodexWorkerStatus(input),
    codex_worker_enabled: input.codex_worker_enabled === true,
    allow_dispatcher_integration: input.allow_dispatcher_integration === true,
    allowed_agents: allowedAgents,
    require_explicit_workorder_flag: input.require_explicit_workorder_flag !== false,
    require_product_gate: input.require_product_gate !== false,
    product_gate_open: input.product_gate_open === true,
    default_timeout_ms: Math.min(defaultTimeout, maxTimeout),
    max_timeout_ms: maxTimeout,
  }
}

export function validateCodexWorkerConfig(config: CodexWorkerConfig): { valid: true } | { valid: false; reason: string } {
  if (!['disabled', 'manual_only', 'controlled_enabled'].includes(config.status)) {
    return { valid: false, reason: `unknown codex worker status: ${String(config.status)}` }
  }
  if (config.status === 'controlled_enabled' && (!config.codex_worker_enabled || !config.allow_dispatcher_integration)) {
    return { valid: false, reason: 'status=controlled_enabled requires codex_worker_enabled=true and allow_dispatcher_integration=true' }
  }
  if (config.status === 'manual_only' && (!config.codex_worker_enabled || config.allow_dispatcher_integration)) {
    return { valid: false, reason: 'status=manual_only requires codex_worker_enabled=true and allow_dispatcher_integration=false' }
  }
  if (config.status === 'disabled' && (config.codex_worker_enabled || config.allow_dispatcher_integration)) {
    return { valid: false, reason: 'status=disabled requires codex_worker_enabled=false and allow_dispatcher_integration=false' }
  }
  if (config.allowed_agents.some(agent => !['senior-coding-agent', 'senior-reviewer-agent'].includes(agent))) {
    return { valid: false, reason: 'allowed_agents may only contain senior-coding-agent and senior-reviewer-agent' }
  }
  return { valid: true }
}

export function loadCodexWorkerConfig(repoRoot = process.cwd()): CodexWorkerConfig {
  const configPath = path.join(repoRoot, 'system/workers/codex-worker.config.json')
  if (!fs.existsSync(configPath)) return defaultCodexWorkerConfig()
  return normalizeCodexWorkerConfig(JSON.parse(fs.readFileSync(configPath, 'utf8')))
}

function normalizeRelativePath(input: string): string {
  return input.replace(/\\/g, '/').replace(/^\/+/, '')
}

function isSubPath(parent: string, child: string): boolean {
  const relative = path.relative(parent, child)
  return relative === '' || (!!relative && !relative.startsWith('..') && !path.isAbsolute(relative))
}

function repoPath(repoRoot: string, relativePath: string): string {
  if (path.isAbsolute(relativePath)) {
    throw new Error('Only repo-relative paths are allowed')
  }
  const normalized = normalizeRelativePath(relativePath)
  if (normalized.includes('../') || normalized === '..') {
    throw new Error('Path traversal is not allowed')
  }
  const fullPath = path.resolve(repoRoot, normalized)
  if (!isSubPath(repoRoot, fullPath)) {
    throw new Error('Path must remain inside the repository')
  }
  return fullPath
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => typeof item === 'string')
}

function listBlock(items: string[], empty = '(none listed)'): string {
  if (!items.length) return `- ${empty}`
  return items.map(item => `- ${item}`).join('\n')
}

export function parseCodexWorkerArgs(args: string[]): CodexWorkerArgs {
  const parsed: CodexWorkerArgs = {
    execute: false,
    dryRun: true,
    writePrompt: false,
    json: false,
    timeoutMs: DEFAULT_TIMEOUT_MS,
  }

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    if (arg === '--workorder') {
      parsed.workorderFile = args[++i]
    } else if (arg === '--prompt-file') {
      parsed.promptFile = args[++i]
    } else if (arg === '--execute') {
      parsed.execute = true
      parsed.dryRun = false
    } else if (arg === '--dry-run') {
      parsed.execute = false
      parsed.dryRun = true
    } else if (arg === '--write-prompt') {
      parsed.writePrompt = true
    } else if (arg === '--json') {
      parsed.json = true
    } else if (arg === '--resume') {
      parsed.resumeSessionId = args[++i]
    } else if (arg === '--timeout-ms') {
      const value = Number(args[++i])
      if (!Number.isFinite(value) || value <= 0) {
        throw new Error('--timeout-ms must be a positive number')
      }
      parsed.timeoutMs = value
    } else if (arg === '--project') {
      parsed.projectId = args[++i]
    } else {
      throw new Error(`Unknown argument: ${arg}`)
    }
  }

  if (parsed.workorderFile && parsed.promptFile) {
    throw new Error('Use either --workorder or --prompt-file, not both')
  }
  if (!parsed.workorderFile && !parsed.promptFile) {
    throw new Error('Provide --workorder <file> or --prompt-file <file>')
  }
  if (parsed.resumeSessionId && !parsed.execute) {
    throw new Error('--resume requires --execute')
  }
  return parsed
}

export function validateWorkorderPath(repoRoot: string, workorderFile: string, profile?: ProjectProfile): string {
  const normalized = normalizeRelativePath(workorderFile)
  const workordersRoot = profile?.workorders_root ?? 'system/workorders'
  if (!normalized.startsWith(`${workordersRoot.replace(/\\/g, '/').replace(/\/$/, '')}/`)) {
    throw new Error(`Workorder path must be under ${workordersRoot}/`)
  }
  if (!normalized.endsWith('.md')) {
    throw new Error('Workorder path must point to a Markdown file')
  }
  const fullPath = repoPath(repoRoot, normalized)
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Workorder file not found: ${normalized}`)
  }
  return fullPath
}

export function validatePromptPath(repoRoot: string, promptFile: string, profile?: ProjectProfile): string {
  const normalized = normalizeRelativePath(promptFile)
  if (!normalized.endsWith('.md') && !normalized.endsWith('.txt')) {
    throw new Error('Prompt path must point to a Markdown or text file')
  }
  if (PROMPT_BLOCKED_ROOTS.some(root => normalized.startsWith(root)) || (profile && (isForbiddenPath(profile, normalized) || isRawLocalPath(profile, normalized)))) {
    throw new Error(`Prompt path is blocked: ${normalized}`)
  }
  const allowedRoots = profile
    ? [...PROMPT_ALLOWED_ROOTS, `${profile.workorders_root.replace(/\\/g, '/').replace(/\/$/, '')}/`]
    : PROMPT_ALLOWED_ROOTS
  if (!allowedRoots.some(root => normalized.startsWith(root))) {
    throw new Error(`Prompt path must be under one of: ${allowedRoots.join(', ')}`)
  }
  const fullPath = repoPath(repoRoot, normalized)
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Prompt file not found: ${normalized}`)
  }
  return fullPath
}

export function loadWorkorderInput(repoRoot: string, workorderFile: string, profile?: ProjectProfile): WorkorderInput {
  const fullPath = validateWorkorderPath(repoRoot, workorderFile, profile)
  const raw = fs.readFileSync(fullPath, 'utf8')
  const yaml = extractFirstYamlBlock(raw)
  if (!yaml) {
    throw new Error(`Workorder has no YAML block: ${workorderFile}`)
  }
  const input = {
    file: normalizeRelativePath(workorderFile),
    raw,
    parsed: parseSimpleYaml(yaml),
  }
  if (profile) validateWorkorderAgainstProfile(input, profile)
  return input
}

function validateWorkorderAgainstProfile(input: WorkorderInput, profile: ProjectProfile): void {
  const parsed = input.parsed
  const writeCandidates = [
    ...asStringArray(parsed.scope_files),
    ...asStringArray(parsed.files_allowed),
    ...asStringArray(parsed.expected_outputs),
    ...asStringArray(parsed.acceptance_files),
  ]
  for (const candidate of writeCandidates) {
    if (isForbiddenPath(profile, candidate) || isRawLocalPath(profile, candidate)) {
      throw new Error(`Workorder references profile-forbidden output/scope path: ${candidate}`)
    }
  }
}

function forbiddenCommands(profile?: ProjectProfile): string[] {
  const profileCommands = profile?.forbidden_commands.map(command => `No ${command}.`) ?? []
  return [...CORE_FORBIDDEN_COMMANDS, ...profileCommands]
}

export function buildPromptFromWorkorder(input: WorkorderInput, repoRoot = process.cwd(), profile?: ProjectProfile): string {
  const wo = input.parsed
  const workorderId = asString(wo.workorder_id, path.basename(input.file, '.md'))
  const objective = asString(wo.objective) || asString(wo.task) || asString(wo.title, '(not specified)')
  const scopeFiles = [...asStringArray(wo.scope_files), ...asStringArray(wo.files_allowed)]
  const contextFiles = asStringArray(wo.context_files)
  const filesBlocked = asStringArray(wo.files_blocked)
  const expectedOutputs = [...asStringArray(wo.expected_outputs), ...asStringArray(wo.acceptance_files)]
  const acceptanceCriteria = asStringArray(wo.acceptance_criteria)
  const negativeConstraints = asStringArray(wo.negative_constraints)
  const sourceRefs = asStringArray(wo.source_refs)
  const validationCommands = asStringArray(wo.validation_commands)
  const riskCategory = asString(wo.risk_category, 'unknown')

  const projectSection = profile
    ? `## Project Profile
- project_id: ${profile.project_id}
- display_name: ${profile.display_name}
- repo_root: ${profile.repo_root}
- workorders_root: ${profile.workorders_root}
- product_gate: ${profile.product_gate.status} - ${profile.product_gate.reason}
- raw_local_paths:
${listBlock(profile.raw_data_paths)}
- forbidden_paths:
${listBlock(profile.forbidden_paths)}
`
    : ''

  const agentId = asString(wo.agent_id, 'senior-coding-agent')
  const roleRule = agentId === 'senior-reviewer-agent'
    ? 'You are operating as a senior reviewer. Prefer read/review conclusions and only make scoped docs/governance edits when the workorder explicitly allows them.'
    : 'You are operating as a senior coding agent for scoped governance implementation.'

  return `# Codex Worker Prompt

You are Codex CLI running as the ${profile?.display_name ?? 'LumeOS'} ${agentId}.
${roleRule}

## Repository
${repoRoot}

${projectSection}

## Workorder
- file: ${input.file}
- workorder_id: ${workorderId}
- risk_category: ${riskCategory}

## Objective
${objective.trim()}

## Source References
${listBlock(sourceRefs)}

## Scope Files / Files Allowed
${listBlock(scopeFiles)}

## Context Files / Read-only References
${listBlock(contextFiles)}

## Files Blocked
${listBlock(filesBlocked)}

## Expected Outputs
${listBlock(expectedOutputs)}

## Acceptance Criteria
${listBlock(acceptanceCriteria)}

## Workorder Negative Constraints
${listBlock(negativeConstraints)}

## Required Validation Commands
${listBlock(validationCommands)}

## Forbidden Commands And Actions
${listBlock(forbiddenCommands(profile))}

## Safety Rules
- Do not grant approvals.
- Do not run Supabase db push, Supabase db reset, or migration execution unless explicitly allowed by the workorder and Tom-approved.
- Do not modify production systems.
- Do not manually edit runtime_state.json or queue.json.
- Do not commit runtime artifacts.
- Do not commit raw BLS files.
- Stop if the requested work conflicts with files_blocked, source_refs, product gates, or governance rules.

## STOP conditions
Return one of these final states:
- DONE
- NEEDS_TOM_APPROVAL
- FIX_REQUIRED
- STOP

## Required Final Report Format
# Codex Worker Result

## 1. Final State
DONE / NEEDS_TOM_APPROVAL / FIX_REQUIRED / STOP

## 2. Files Changed

## 3. Validation

## 4. Blockers

## 5. Exact Next Action For Tom
One action only.
`
}

export function buildCodexCommand(prompt: string, resumeSessionId?: string): { command: string; args: string[] } {
  const codexEntrypoint = resolveCodexEntrypoint()
  const command = codexEntrypoint.command
  const prefixArgs = codexEntrypoint.args
  if (resumeSessionId) {
    return { command, args: [...prefixArgs, 'exec', 'resume', resumeSessionId, prompt] }
  }
  return { command, args: [...prefixArgs, 'exec', prompt] }
}

function resolveCodexEntrypoint(): { command: string; args: string[] } {
  const explicitJs = process.env.CODEX_CLI_JS
  if (explicitJs) {
    return { command: process.execPath, args: [explicitJs] }
  }

  if (process.platform === 'win32') {
    const appData = process.env.APPDATA
    if (appData) {
      const npmCodexJs = path.join(appData, 'npm', 'node_modules', '@openai', 'codex', 'bin', 'codex.js')
      if (fs.existsSync(npmCodexJs)) {
        return { command: process.execPath, args: [npmCodexJs] }
      }
    }
  }

  return { command: 'codex', args: [] }
}

export function parseFinalState(output: string): FinalState {
  for (const state of FINAL_STATES) {
    const pattern = new RegExp(`\\b${state}\\b`, 'i')
    if (pattern.test(output)) return state
  }
  return 'UNKNOWN'
}

export function resolveFinalState(spawned: CodexSpawnResult): FinalState {
  if (spawned.timedOut) return 'FIX_REQUIRED'

  const stdoutState = parseFinalState(spawned.stdout)
  if (stdoutState !== 'UNKNOWN') return stdoutState

  if (spawned.exitCode !== 0) {
    const stderrState = parseFinalState(spawned.stderr)
    if (stderrState !== 'UNKNOWN') return stderrState
    return 'FIX_REQUIRED'
  }

  return 'UNKNOWN'
}

function timestamp(): string {
  return new Date().toISOString().replace(/[:.]/g, '-')
}

function safeId(input: string): string {
  return input.replace(/[^A-Za-z0-9_-]/g, '-').replace(/-+/g, '-').slice(0, 80) || 'codex-worker'
}

function ensureReportDir(repoRoot: string): string {
  const reportDir = path.join(repoRoot, 'system/reports/codex-worker')
  fs.mkdirSync(reportDir, { recursive: true })
  return reportDir
}

export function spawnProcessWithTimeout(command: string, args: string[], options: { cwd: string; timeoutMs: number }): Promise<CodexSpawnResult> {
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      cwd: options.cwd,
      shell: false,
      windowsHide: true,
      stdio: 'pipe',
    })
    let stdout = ''
    let stderr = ''
    let settled = false
    const timeout = setTimeout(() => {
      if (settled) return
      settled = true
      stderr += `Codex worker timed out after ${options.timeoutMs}ms. Child process was killed.`
      killChildProcessTree(child)
      resolve({ exitCode: 1, stdout, stderr, timedOut: true })
    }, options.timeoutMs)

    function settle(result: CodexSpawnResult): void {
      if (settled) return
      settled = true
      clearTimeout(timeout)
      resolve(result)
    }

    child.stdout?.on('data', chunk => { stdout += String(chunk) })
    child.stderr?.on('data', chunk => { stderr += String(chunk) })
    child.stdin?.end()
    child.on('error', error => {
      settle({ exitCode: 2, stdout, stderr: `${stderr}${String(error.message)}` })
    })
    child.on('close', code => {
      settle({ exitCode: code ?? 2, stdout, stderr })
    })
  })
}

function killChildProcessTree(child: ChildProcessWithoutNullStreams): void {
  if (process.platform === 'win32' && child.pid) {
    spawnSync('taskkill.exe', ['/PID', String(child.pid), '/T', '/F'], {
      windowsHide: true,
      stdio: 'ignore',
    })
    return
  }
  child.kill('SIGKILL')
}

function writePrompt(repoRoot: string, id: string, prompt: string): string {
  const reportDir = ensureReportDir(repoRoot)
  const promptPath = path.join(reportDir, `${timestamp()}-${safeId(id)}-prompt.md`)
  fs.writeFileSync(promptPath, prompt, 'utf8')
  return normalizeRelativePath(promptPath)
}

function writeReport(repoRoot: string, id: string, result: CodexWorkerResult): string {
  const reportDir = ensureReportDir(repoRoot)
  const reportPath = path.join(reportDir, `${timestamp()}-${safeId(id)}-report.md`)
  fs.writeFileSync(reportPath, `# Codex Worker Execution Report

## Command
\`${result.command} ${result.args.slice(0, -1).join(' ')} <prompt>\`

## Exit Code
${result.exitCode}

## Final State
${result.finalState}

## Duration
${Math.round(result.durationMs)} ms

## Stdout
\`\`\`
${result.stdout}
\`\`\`

## Stderr
\`\`\`
${result.stderr}
\`\`\`
`, 'utf8')
  return normalizeRelativePath(reportPath)
}

export async function runCodexWorkerPrompt(
  id: string,
  prompt: string,
  args: Pick<CodexWorkerArgs, 'execute' | 'writePrompt' | 'timeoutMs' | 'resumeSessionId'>,
  options: RunOptions = {},
): Promise<CodexWorkerResult> {
  const repoRoot = path.resolve(options.repoRoot ?? process.cwd())
  const spawnImpl = options.spawn ?? spawnProcessWithTimeout
  const command = buildCodexCommand(prompt, args.resumeSessionId)
  const start = performance.now()
  let promptPath: string | undefined
  let reportPath: string | undefined

  if (args.writePrompt || args.execute) {
    promptPath = writePrompt(repoRoot, id, prompt)
  }

  if (!args.execute) {
    return {
      mode: 'dry-run',
      exitCode: 0,
      command: command.command,
      args: command.args,
      durationMs: performance.now() - start,
      prompt,
      promptPath,
      stdout: '',
      stderr: '',
      finalState: 'UNKNOWN',
    }
  }

  let timeout: NodeJS.Timeout | undefined
  const timeoutPromise = new Promise<CodexSpawnResult>(resolve => {
    timeout = setTimeout(() => {
      resolve({
        exitCode: 1,
        stdout: '',
        stderr: `Codex worker timed out after ${args.timeoutMs}ms. Child process was killed or did not return control.`,
        timedOut: true,
      })
    }, args.timeoutMs)
  })
  const spawned = await Promise.race([
    spawnImpl(command.command, command.args, { cwd: repoRoot, timeoutMs: args.timeoutMs }),
    timeoutPromise,
  ])
  if (timeout) clearTimeout(timeout)
  const finalState = resolveFinalState(spawned)
  const result: CodexWorkerResult = {
    mode: 'execute',
    exitCode: spawned.exitCode,
    command: command.command,
    args: command.args,
    durationMs: performance.now() - start,
    prompt,
    promptPath,
    stdout: spawned.stdout,
    stderr: spawned.stderr,
    finalState,
    timedOut: spawned.timedOut,
  }
  reportPath = writeReport(repoRoot, id, result)
  return { ...result, reportPath }
}

export async function runCodexWorker(args: CodexWorkerArgs, options: RunOptions = {}): Promise<CodexWorkerResult> {
  const repoRoot = path.resolve(options.repoRoot ?? process.cwd())
  const profile = args.projectId ? getProjectProfile(args.projectId, { repoRoot }) : undefined

  let prompt = ''
  let id = 'prompt'
  if (args.workorderFile) {
    const input = loadWorkorderInput(repoRoot, args.workorderFile, profile)
    id = asString(input.parsed.workorder_id, path.basename(args.workorderFile, '.md'))
    prompt = buildPromptFromWorkorder(input, repoRoot, profile)
  } else if (args.promptFile) {
    const fullPath = validatePromptPath(repoRoot, args.promptFile, profile)
    id = path.basename(args.promptFile, path.extname(args.promptFile))
    prompt = fs.readFileSync(fullPath, 'utf8')
  }

  return runCodexWorkerPrompt(id, prompt, args, options)
}

function formatText(result: CodexWorkerResult): string {
  const visibleArgs = result.args.slice(0, -1).join(' ')
  return `# Codex Worker Bridge

mode: ${result.mode}
exit_code: ${result.exitCode}
final_state: ${result.finalState}
command: ${result.command} ${visibleArgs} <prompt>
prompt_path: ${result.promptPath ?? '(not written)'}
report_path: ${result.reportPath ?? '(not written)'}

## Prompt Preview
\`\`\`
${result.prompt}
\`\`\`

## Stdout
\`\`\`
${result.stdout}
\`\`\`

## Stderr
\`\`\`
${result.stderr}
\`\`\`
`
}

async function main(): Promise<void> {
  try {
    const args = parseCodexWorkerArgs(process.argv.slice(2))
    args.projectId = args.projectId ?? 'lumeos'
    const result = await runCodexWorker(args)
    if (args.json) {
      process.stdout.write(`${JSON.stringify(result, null, 2)}\n`)
    } else {
      process.stdout.write(formatText(result))
    }
    process.exitCode = result.exitCode === 0 ? 0 : 1
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    process.stderr.write(`Codex worker error: ${message}\n`)
    process.exitCode = 2
  }
}

if (require.main === module) {
  void main()
}
