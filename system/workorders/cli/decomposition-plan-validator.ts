import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import {
  getProjectProfile,
  isForbiddenPath,
  isProductWorkAllowed,
  isRawLocalPath,
  isRuntimeArtifactPath,
  type ProjectProfile,
} from '../../project-profiles/project-profile-loader'

export type DecompositionSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info'

export interface DecompositionFinding {
  id: string
  severity: DecompositionSeverity
  path: string
  message: string
  recommended_fix: string
  blocks_factory: boolean
  blocked_by_product_gate?: boolean
}

export interface DecompositionPlanValidationResult {
  schema_version: 1
  generated_at: string
  plan_file?: string
  profile_id: string
  profile_display_name: string
  valid: boolean
  blocked_by_product_gate: boolean
  summary: Record<DecompositionSeverity, number>
  findings: DecompositionFinding[]
  normalized_plan_summary?: {
    plan_id: string
    objective: string
    subtask_count: number
    expected_outputs: string[]
  }
  exitCode: 0 | 1 | 2
}

type SourceRefs = {
  module_index?: string
  current_specs?: string[]
  patches?: string[]
  sql_sources?: string[]
  adrs?: string[]
  reviews?: string[]
  raw_sources?: string[]
  raw_sources_allowed?: boolean
  ssot_priority?: string[]
}

type PlanTask = Record<string, unknown> & {
  id?: string
  title?: string
  objective?: string
  task?: string
  source_refs?: SourceRefs
  expected_outputs?: string[]
  scope_files?: string[]
  files_allowed?: string[]
  files_blocked?: string[]
  acceptance_criteria?: string[]
  acceptance_hints?: string[]
  discovery_only?: boolean
  risk_category?: string
  agent_id?: string
  requires_approval?: boolean
}

type DecompositionPlan = Record<string, unknown> & {
  plan_id?: string
  feature_id?: string
  project_id?: string
  project?: string
  module?: string
  objective?: string
  source_refs?: SourceRefs
  constraints?: string[]
  non_goals?: string[]
  expected_outputs?: string[]
  workorders?: PlanTask[]
  subtasks?: PlanTask[]
}

const BLOCKING_SEVERITIES = new Set<DecompositionSeverity>(['critical', 'high'])
const PRODUCT_KEYWORDS = [
  /\bproduct implementation\b/i,
  /\bfeature implementation\b/i,
  /\bexecute(?:s|d)?\s+bls\s+import\b/i,
  /\bstart(?:s|ed)?\s+bls\s+import\b/i,
  /\bnutrition\s+feature\b/i,
  /\bbeauty club\s+feature\b/i,
]
const DB_KEYWORDS = [
  /\brun\s+supabase\b/i,
  /\bsupabase\s+db\s+(push|reset|write|migration)\b/i,
  /\bcreate\s+supabase\s+migration\b/i,
  /\brun\s+migration\b/i,
  /\bexecute\s+migration\b/i,
  /\bproduction\s+db\b/i,
]
const APPROVAL_GRANT_RE = /\b(approval\s+(grant|auto-grant|consume|approve)|grant\s+approval|auto-grant\s+approval)\b/i
const RUNTIME_REPORT_ARTIFACT_RE = /^(system\/reports\/(codex-worker|model-runtime-history)\/|tmp\/|\.next\/|logs\/)/i

function now(): string {
  return new Date().toISOString()
}

function toPosix(value: string): string {
  return value.replace(/\\/g, '/')
}

function finding(params: DecompositionFinding): DecompositionFinding {
  return params
}

function summarize(findings: DecompositionFinding[]): Record<DecompositionSeverity, number> {
  return {
    critical: findings.filter(item => item.severity === 'critical').length,
    high: findings.filter(item => item.severity === 'high').length,
    medium: findings.filter(item => item.severity === 'medium').length,
    low: findings.filter(item => item.severity === 'low').length,
    info: findings.filter(item => item.severity === 'info').length,
  }
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter(item => typeof item === 'string') : []
}

function extractJsonPlan(content: string): DecompositionPlan {
  const trimmed = content.trim()
  if (trimmed.startsWith('{')) return JSON.parse(trimmed) as DecompositionPlan
  const match = /```json\s*([\s\S]*?)```/i.exec(content)
  if (!match) throw new Error('Decomposition plan must contain a JSON object or JSON code block.')
  return JSON.parse(match[1]) as DecompositionPlan
}

function allText(plan: DecompositionPlan, task?: PlanTask): string {
  return [
    plan.objective,
    ...(asStringArray(plan.constraints)),
    ...(asStringArray(plan.non_goals)),
    task?.title,
    task?.objective,
    task?.task,
    task?.risk_category,
    task?.agent_id,
    ...(asStringArray(task?.acceptance_criteria)),
    ...(asStringArray(task?.acceptance_hints)),
  ].filter(Boolean).join('\n')
}

function taskList(plan: DecompositionPlan): PlanTask[] {
  const tasks = Array.isArray(plan.workorders) ? plan.workorders : plan.subtasks
  return Array.isArray(tasks) ? tasks.filter(item => item && typeof item === 'object') as PlanTask[] : []
}

function sourceRefsFor(plan: DecompositionPlan, task?: PlanTask): SourceRefs | undefined {
  return task?.source_refs ?? plan.source_refs
}

function expectedOutputsFor(plan: DecompositionPlan, task?: PlanTask): string[] {
  return task ? asStringArray(task.expected_outputs) : asStringArray(plan.expected_outputs)
}

function outputCovered(output: string, scopes: string[]): boolean {
  const normalized = toPosix(output)
  return scopes.some(scope => {
    const candidate = toPosix(scope)
    if (candidate.endsWith('/')) return normalized.startsWith(candidate)
    if (candidate.endsWith('/**')) return normalized.startsWith(candidate.slice(0, -3))
    if (candidate === '*') return true
    return normalized === candidate
  })
}

function pathAllowedByProfile(profile: ProjectProfile, filePath: string): boolean {
  const normalized = toPosix(filePath)
  const allowed = profile.allowed_domain_paths ?? []
  if (allowed.length === 0) return true
  return allowed.some(prefix => {
    const normalizedPrefix = toPosix(prefix)
    if (normalizedPrefix.endsWith('/')) return normalized.startsWith(normalizedPrefix)
    if (normalizedPrefix.endsWith('/**')) return normalized.startsWith(normalizedPrefix.slice(0, -3))
    return normalized === normalizedPrefix
  })
}

function validateTopLevel(plan: DecompositionPlan, profile: ProjectProfile): DecompositionFinding[] {
  const findings: DecompositionFinding[] = []
  const planId = typeof plan.plan_id === 'string' ? plan.plan_id : typeof plan.feature_id === 'string' ? plan.feature_id : ''
  const hasProjectId = typeof plan.project_id === 'string' || typeof plan.project === 'string'
  const projectId = typeof plan.project_id === 'string' ? plan.project_id : typeof plan.project === 'string' ? plan.project : profile.project_id

  if (!planId) {
    findings.push(finding({
      id: 'plan.id_missing',
      severity: 'high',
      path: 'plan_id',
      message: 'Decomposition plan must define plan_id or feature_id.',
      recommended_fix: 'Add a stable plan_id or feature_id before workorder generation.',
      blocks_factory: true,
    }))
  }
  if (!hasProjectId) {
    findings.push(finding({
      id: 'plan.project_id_missing',
      severity: 'high',
      path: 'project_id',
      message: 'Decomposition plan must declare the intended project/profile id.',
      recommended_fix: `Add project_id "${profile.project_id}".`,
      blocks_factory: true,
    }))
  }
  if (projectId !== profile.project_id) {
    findings.push(finding({
      id: 'plan.project_profile_mismatch',
      severity: 'high',
      path: 'project_id',
      message: 'Decomposition plan project id does not match the selected profile.',
      recommended_fix: `Use project_id "${profile.project_id}" or run the validator with the intended --project.`,
      blocks_factory: true,
    }))
  }
  if (typeof plan.objective !== 'string' || plan.objective.trim().length < 5) {
    findings.push(finding({
      id: 'plan.objective_missing',
      severity: 'high',
      path: 'objective',
      message: 'Decomposition plan must define a concrete objective.',
      recommended_fix: 'Add a concise objective describing the governance outcome.',
      blocks_factory: true,
    }))
  }
  if (!sourceRefsFor(plan)) {
    findings.push(finding({
      id: 'plan.source_refs_missing',
      severity: 'high',
      path: 'source_refs',
      message: 'Decomposition plan must define source_refs.',
      recommended_fix: 'Add source_refs with at least module_index and current_specs where applicable.',
      blocks_factory: true,
    }))
  }
  if (asStringArray(plan.constraints).length === 0) {
    findings.push(finding({
      id: 'plan.constraints_missing',
      severity: 'medium',
      path: 'constraints',
      message: 'Decomposition plan has no constraints.',
      recommended_fix: 'Add safety and scope constraints for downstream workers.',
      blocks_factory: false,
    }))
  }
  if (asStringArray(plan.non_goals).length === 0) {
    findings.push(finding({
      id: 'plan.non_goals_missing',
      severity: 'medium',
      path: 'non_goals',
      message: 'Decomposition plan has no non_goals.',
      recommended_fix: 'Add non_goals so model/manual decomposition cannot expand scope.',
      blocks_factory: false,
    }))
  }
  if (taskList(plan).length === 0) {
    findings.push(finding({
      id: 'plan.subtasks_missing',
      severity: 'high',
      path: 'workorders',
      message: 'Decomposition plan must contain workorders or subtasks.',
      recommended_fix: 'Add at least one planned work unit.',
      blocks_factory: true,
    }))
  }
  return findings
}

function validatePathList(profile: ProjectProfile, paths: string[], basePath: string, output: boolean, allowBroadWildcard = false): DecompositionFinding[] {
  const findings: DecompositionFinding[] = []
  for (const filePath of paths) {
    const normalized = toPosix(filePath)
    if (!allowBroadWildcard && (normalized === '*' || normalized === '**' || normalized === '**/*' || normalized.endsWith('/**/*'))) {
      findings.push(finding({
        id: 'scope.broad_wildcard',
        severity: 'high',
        path: basePath,
        message: 'Broad wildcard scope is not allowed unless the task is explicit discovery-only.',
        recommended_fix: 'Replace broad wildcards with narrow files/directories or mark the subtask discovery_only with no commit outputs.',
        blocks_factory: true,
      }))
    }
    if (isForbiddenPath(profile, normalized) || isRuntimeArtifactPath(profile, normalized) || normalized === 'system/state/runtime_state.json' || normalized === 'system/approval/queue.json') {
      findings.push(finding({
        id: output ? 'outputs.forbidden_path' : 'scope.forbidden_path',
        severity: 'high',
        path: basePath,
        message: 'Plan references a forbidden or runtime state path.',
        recommended_fix: 'Remove forbidden/runtime-state/approval-state paths from scope and outputs.',
        blocks_factory: true,
      }))
    }
    if (output && RUNTIME_REPORT_ARTIFACT_RE.test(normalized)) {
      findings.push(finding({
        id: 'outputs.runtime_artifact',
        severity: 'high',
        path: basePath,
        message: 'Runtime report/history artifacts cannot be expected commit outputs.',
        recommended_fix: 'Keep runtime reports local/ignored and move durable conclusions into reviewed docs.',
        blocks_factory: true,
      }))
    }
    if (output && (isRawLocalPath(profile, normalized) || /\/00_raw\//.test(normalized))) {
      findings.push(finding({
        id: 'outputs.raw_data_forbidden',
        severity: 'high',
        path: basePath,
        message: 'Raw data files cannot be commit outputs.',
        recommended_fix: 'Use raw data only as local read-only provenance, never expected_outputs.',
        blocks_factory: true,
      }))
    }
    if (output && !pathAllowedByProfile(profile, normalized)) {
      findings.push(finding({
        id: 'outputs.outside_profile_domain',
        severity: 'high',
        path: basePath,
        message: 'Expected output is outside the selected profile allowed_domain_paths.',
        recommended_fix: 'Move the output under an allowed profile domain path or update the profile after review.',
        blocks_factory: true,
      }))
    }
  }
  return findings
}

function validateTask(plan: DecompositionPlan, task: PlanTask, index: number, profile: ProjectProfile): DecompositionFinding[] {
  const findings: DecompositionFinding[] = []
  const basePath = `workorders[${index}]`
  const id = typeof task.id === 'string' ? task.id : ''
  const title = typeof task.title === 'string' ? task.title : typeof task.objective === 'string' ? task.objective : ''
  const refs = sourceRefsFor(plan, task)
  const expectedOutputs = expectedOutputsFor(plan, task)
  const scopeFiles = asStringArray(task.scope_files)
  const filesAllowed = asStringArray(task.files_allowed)
  const filesBlocked = asStringArray(task.files_blocked)
  const discoveryOnly = task.discovery_only === true

  if (!id) findings.push(finding({
    id: 'subtask.id_missing',
    severity: 'high',
    path: `${basePath}.id`,
    message: 'Subtask must define a stable id.',
    recommended_fix: 'Add a stable subtask/workorder id.',
    blocks_factory: true,
  }))
  if (!title) findings.push(finding({
    id: 'subtask.objective_missing',
    severity: 'high',
    path: `${basePath}.title`,
    message: 'Subtask must define a title or objective.',
    recommended_fix: 'Add title/objective to the planned work unit.',
    blocks_factory: true,
  }))
  if (!refs) findings.push(finding({
    id: 'subtask.source_refs_missing',
    severity: 'high',
    path: `${basePath}.source_refs`,
    message: 'Subtask must have source_refs directly or inherited from the plan.',
    recommended_fix: 'Add source_refs at plan or subtask level.',
    blocks_factory: true,
  }))
  if (!discoveryOnly && scopeFiles.length === 0 && filesAllowed.length === 0) findings.push(finding({
    id: 'subtask.scope_missing',
    severity: 'high',
    path: `${basePath}.scope_files`,
    message: 'Subtask must define allowed scope files or be explicit discovery-only.',
    recommended_fix: 'Add scope_files/files_allowed or set discovery_only with no commit outputs.',
    blocks_factory: true,
  }))
  if (!discoveryOnly && expectedOutputs.length === 0) findings.push(finding({
    id: 'subtask.expected_outputs_missing',
    severity: 'high',
    path: `${basePath}.expected_outputs`,
    message: 'Subtask must define expected_outputs.',
    recommended_fix: 'Add expected_outputs for the planned work unit.',
    blocks_factory: true,
  }))
  if (asStringArray(task.acceptance_criteria).length === 0 && asStringArray(task.acceptance_hints).length === 0) findings.push(finding({
    id: 'subtask.acceptance_missing',
    severity: 'high',
    path: `${basePath}.acceptance_criteria`,
    message: 'Subtask must include acceptance criteria or acceptance hints.',
    recommended_fix: 'Add acceptance criteria that prove output completeness.',
    blocks_factory: true,
  }))

  findings.push(...validatePathList(profile, [...scopeFiles, ...filesAllowed], `${basePath}.scope_files`, false, discoveryOnly))
  findings.push(...validatePathList(profile, expectedOutputs, `${basePath}.expected_outputs`, true))

  for (const output of expectedOutputs) {
    if (!discoveryOnly && !outputCovered(output, [...scopeFiles, ...filesAllowed])) {
      findings.push(finding({
        id: 'outputs.expected_not_in_scope',
        severity: 'high',
        path: `${basePath}.expected_outputs`,
        message: 'Expected output is not covered by scope_files or files_allowed.',
        recommended_fix: 'Add every expected output to scope_files/files_allowed or narrow expected_outputs.',
        blocks_factory: true,
      }))
    }
  }

  const text = allText(plan, task)
  const productGate = isProductWorkAllowed(profile, { planningOnly: false })
  if (PRODUCT_KEYWORDS.some(re => re.test(text)) && !productGate.allowed) {
    findings.push(finding({
      id: 'product_gate.blocked',
      severity: 'high',
      path: basePath,
      message: 'Product implementation is blocked by the selected project profile product gate.',
      recommended_fix: productGate.reason,
      blocks_factory: true,
      blocked_by_product_gate: true,
    }))
  }
  const dbLike = DB_KEYWORDS.some(re => re.test(text)) || expectedOutputs.some(item => toPosix(item).startsWith('supabase/'))
  if (dbLike && (!task.requires_approval || !productGate.allowed)) {
    findings.push(finding({
      id: 'db_or_migration.blocked',
      severity: 'high',
      path: basePath,
      message: 'DB/Supabase/migration work is not acceptable while product gate is closed or approval is missing.',
      recommended_fix: 'Keep DB/Supabase/migration work out of generated plans until Tom explicitly opens the gate and approval policy is satisfied.',
      blocks_factory: true,
      blocked_by_product_gate: !productGate.allowed,
    }))
  }
  if (APPROVAL_GRANT_RE.test(text)) {
    findings.push(finding({
      id: 'approval_grant.forbidden',
      severity: 'critical',
      path: basePath,
      message: 'Plans may not grant, auto-grant, consume, or approve governance approvals.',
      recommended_fix: 'Replace approval execution with display-only review instructions for Tom.',
      blocks_factory: true,
    }))
  }
  if (!discoveryOnly && filesBlocked.length === 0) {
    findings.push(finding({
      id: 'subtask.files_blocked_missing',
      severity: 'medium',
      path: `${basePath}.files_blocked`,
      message: 'Subtask does not declare files_blocked.',
      recommended_fix: 'Add files_blocked so downstream workers receive explicit stop boundaries.',
      blocks_factory: false,
    }))
  }

  return findings
}

export function parseDecompositionPlan(content: string): DecompositionPlan {
  return extractJsonPlan(content)
}

export function validateDecompositionPlan(plan: DecompositionPlan, options: { projectId?: string; repoRoot?: string; planFile?: string } = {}): DecompositionPlanValidationResult {
  const repoRoot = options.repoRoot ?? process.cwd()
  const profile = getProjectProfile(options.projectId ?? String(plan.project_id ?? plan.project ?? 'lumeos'), { repoRoot })
  const tasks = taskList(plan)
  const findings = [
    ...validateTopLevel(plan, profile),
    ...tasks.flatMap((task, index) => validateTask(plan, task, index, profile)),
  ]
  const summary = summarize(findings)
  const valid = !findings.some(item => BLOCKING_SEVERITIES.has(item.severity))
  const expectedOutputs = tasks.flatMap(task => expectedOutputsFor(plan, task))

  return {
    schema_version: 1,
    generated_at: now(),
    plan_file: options.planFile,
    profile_id: profile.project_id,
    profile_display_name: profile.display_name,
    valid,
    blocked_by_product_gate: findings.some(item => item.blocked_by_product_gate),
    summary,
    findings,
    normalized_plan_summary: {
      plan_id: String(plan.plan_id ?? plan.feature_id ?? ''),
      objective: String(plan.objective ?? ''),
      subtask_count: tasks.length,
      expected_outputs: expectedOutputs,
    },
    exitCode: valid ? 0 : 1,
  }
}

export function validateDecompositionPlanFile(planFile: string, options: { projectId?: string; repoRoot?: string } = {}): DecompositionPlanValidationResult {
  const repoRoot = options.repoRoot ?? process.cwd()
  const resolved = path.resolve(planFile)
  const relative = toPosix(path.relative(repoRoot, resolved))
  try {
    const plan = parseDecompositionPlan(fs.readFileSync(resolved, 'utf8'))
    return validateDecompositionPlan(plan, { ...options, repoRoot, planFile: relative })
  } catch (error) {
    const profile = getProjectProfile(options.projectId ?? 'lumeos', { repoRoot })
    const findings = [finding({
      id: 'tool.plan_parse_failed',
      severity: 'critical',
      path: relative,
      message: error instanceof Error ? error.message : String(error),
      recommended_fix: 'Provide a valid JSON decomposition plan file.',
      blocks_factory: true,
    })]
    return {
      schema_version: 1,
      generated_at: now(),
      plan_file: relative,
      profile_id: profile.project_id,
      profile_display_name: profile.display_name,
      valid: false,
      blocked_by_product_gate: false,
      summary: summarize(findings),
      findings,
      exitCode: 2,
    }
  }
}

export function formatDecompositionPlanValidation(result: DecompositionPlanValidationResult): string {
  const lines = [
    '# Decomposition Plan Validator',
    '',
    `Profile: ${result.profile_id} (${result.profile_display_name})`,
    `Plan: ${result.plan_file ?? '(inline)'}`,
    `Valid: ${result.valid ? 'yes' : 'no'}`,
    `Summary: critical=${result.summary.critical}, high=${result.summary.high}, medium=${result.summary.medium}, low=${result.summary.low}, info=${result.summary.info}`,
    '',
  ]
  if (result.findings.length === 0) {
    lines.push('No findings.')
  } else {
    for (const item of result.findings) {
      lines.push(`- [${item.severity}] ${item.id} at ${item.path}`)
      lines.push(`  ${item.message}`)
      lines.push(`  Recommended fix: ${item.recommended_fix}`)
    }
  }
  return lines.join('\n')
}

function argAfter(args: string[], flag: string): string | undefined {
  const index = args.indexOf(flag)
  return index === -1 ? undefined : args[index + 1]
}

function main(): void {
  const args = process.argv.slice(2)
  const planFile = argAfter(args, '--plan')
  const projectId = argAfter(args, '--project')
  const json = args.includes('--json')
  if (!planFile) {
    console.error('Usage: decomposition-plan-validator.ts --plan <path> [--project lumeos] [--json]')
    process.exit(2)
  }
  const result = validateDecompositionPlanFile(planFile, { projectId })
  console.log(json ? JSON.stringify(result, null, 2) : formatDecompositionPlanValidation(result))
  process.exit(result.exitCode)
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  main()
}
