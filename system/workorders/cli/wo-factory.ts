import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { extractFirstYamlBlock, loadBatch, parseSimpleYaml, validateWo } from './batch-loader'
import { validateDecompositionPlan, type DecompositionFinding } from './decomposition-plan-validator'
import { runSpecSourceChainCheck, type SpecSourceChainResult } from './spec-source-chain-check'

type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info'
type FactoryStatus = 'READY_TO_WRITE' | 'WROTE_FILES' | 'FIX_REQUIRED'
type RiskCategory =
  | 'standard'
  | 'docs'
  | 'i18n'
  | 'test'
  | 'db-migration'
  | 'security'
  | 'auth'
  | 'rls'
  | 'medical'
  | 'payments'
  | 'shared-core'
  | 'architecture'
  | 'release'

interface SourceRefs {
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

interface PlanWorkorder {
  id: string
  title: string
  agent_id: string
  risk_category: RiskCategory | string
  task: string
  expected_outputs: string[]
  scope_files: string[]
  files_allowed?: string[]
  files_blocked?: string[]
  acceptance_criteria: string[]
  negative_constraints: string[]
  blocked_by?: string[]
  context_files?: string[]
  validation_commands?: string[]
  requires_approval?: boolean
  rollback_hint?: string
  phase?: number
  priority?: string
  quality_critical?: boolean
  source_refs?: SourceRefs
  mixed_risk?: boolean
}

interface FactoryPlan {
  module: string
  batch_id: string
  batch_title: string
  status?: string
  source_refs: SourceRefs
  objectives?: string[]
  non_goals?: string[]
  constraints?: string[]
  workorders: PlanWorkorder[]
}

export interface FactoryFinding {
  id: string
  severity: Severity
  layer: string
  workorder?: string
  message: string
  evidence: string
  suggested_action: string
  blocks_write: boolean
  blocks_operator: boolean
}

export interface GeneratedWorkorder {
  workorder_id: string
  filename: string
  title: string
  risk_category: string
  requires_approval: boolean
  blocked_by: string[]
  expected_outputs: string[]
  markdown: string
}

export interface FactoryResult {
  schema_version: 1
  generated_at: string
  status: FactoryStatus
  plan_file?: string
  out_dir?: string
  batch_file?: string
  workorders: GeneratedWorkorder[]
  findings: FactoryFinding[]
  summary: Record<Severity, number>
  validation_commands: string[]
  written_files: string[]
}

export interface ValidateResult {
  schema_version: 1
  generated_at: string
  target: string
  mode: 'workorder' | 'batch'
  findings: FactoryFinding[]
  summary: Record<Severity, number>
  source_chain?: SpecSourceChainResult
  exitCode: 0 | 1 | 2
}

const HIGH_RISK = new Set<string>([
  'db-migration',
  'security',
  'auth',
  'rls',
  'medical',
  'payments',
  'shared-core',
  'architecture',
  'release',
])

const VALID_RISKS = new Set<string>([
  'standard',
  'docs',
  'i18n',
  'test',
  ...HIGH_RISK,
])

const FORBIDDEN_OUTPUT_PREFIXES = [
  'system/state/',
  'system/approval/',
  'docs/specs/Nutrition/00_raw/',
]

function now(): string {
  return new Date().toISOString()
}

function toPosix(value: string): string {
  return value.replace(/\\/g, '/')
}

function finding(params: FactoryFinding): FactoryFinding {
  return params
}

function summarize(findings: FactoryFinding[]): Record<Severity, number> {
  return {
    critical: findings.filter(item => item.severity === 'critical').length,
    high: findings.filter(item => item.severity === 'high').length,
    medium: findings.filter(item => item.severity === 'medium').length,
    low: findings.filter(item => item.severity === 'low').length,
    info: findings.filter(item => item.severity === 'info').length,
  }
}

function hasBlockingFindings(findings: FactoryFinding[]): boolean {
  return findings.some(item => item.severity === 'critical' || item.severity === 'high')
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter(item => typeof item === 'string') : []
}

function extractJsonPlan(content: string): FactoryPlan {
  const trimmed = content.trim()
  if (trimmed.startsWith('{')) return JSON.parse(trimmed) as FactoryPlan
  const match = /```json\s*([\s\S]*?)```/i.exec(content)
  if (!match) {
    throw new Error('Factory plan must contain a JSON code block.')
  }
  return JSON.parse(match[1]) as FactoryPlan
}

function sourceRefsFor(plan: FactoryPlan, wo: PlanWorkorder): SourceRefs {
  return wo.source_refs ?? plan.source_refs
}

function sourceRefsPaths(refs: SourceRefs): string[] {
  return [
    refs.module_index,
    ...(refs.current_specs ?? []),
    ...(refs.patches ?? []),
    ...(refs.sql_sources ?? []),
    ...(refs.adrs ?? []),
    ...(refs.reviews ?? []),
    ...(refs.raw_sources ?? []),
  ].filter(Boolean) as string[]
}

function outputCovered(output: string, scopes: string[]): boolean {
  const normalized = toPosix(output)
  return scopes.some(scope => {
    const candidate = toPosix(scope)
    if (candidate.endsWith('/')) return normalized.startsWith(candidate)
    if (candidate.endsWith('/**')) return normalized.startsWith(candidate.slice(0, -3))
    return normalized === candidate
  })
}

function defaultApproval(risk: string, explicit?: boolean): boolean {
  return explicit === true || HIGH_RISK.has(risk)
}

function slug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48) || 'workorder'
}

function validatePlanShape(plan: FactoryPlan): FactoryFinding[] {
  const findings: FactoryFinding[] = []
  for (const field of ['module', 'batch_id', 'batch_title', 'source_refs', 'workorders'] as const) {
    if (!(field in plan)) {
      findings.push(finding({
        id: `plan.${field}_missing`,
        severity: 'high',
        layer: 'workorder_factory',
        message: `Factory plan is missing ${field}.`,
        evidence: field,
        suggested_action: `Add ${field} to the structured factory plan.`,
        blocks_write: true,
        blocks_operator: true,
      }))
    }
  }
  if (!Array.isArray(plan.workorders) || plan.workorders.length === 0) {
    findings.push(finding({
      id: 'plan.workorders_empty',
      severity: 'high',
      layer: 'workorder_factory',
      message: 'Factory plan has no workorders.',
      evidence: JSON.stringify(plan.workorders ?? null),
      suggested_action: 'Add at least one atomic workorder.',
      blocks_write: true,
      blocks_operator: true,
    }))
  }
  return findings
}

function validateSourceRefs(plan: FactoryPlan, wo: PlanWorkorder): FactoryFinding[] {
  const refs = sourceRefsFor(plan, wo)
  const findings: FactoryFinding[] = []
  if (!refs || typeof refs !== 'object') {
    findings.push(finding({
      id: 'source_refs.missing',
      severity: 'high',
      layer: 'spec_source_chain',
      workorder: wo.id,
      message: 'Workorder has no source_refs.',
      evidence: wo.id,
      suggested_action: 'Provide source_refs at the plan or workorder level.',
      blocks_write: true,
      blocks_operator: true,
    }))
    return findings
  }
  if (!refs.module_index) {
    findings.push(finding({
      id: 'source_refs.module_index_missing',
      severity: 'high',
      layer: 'spec_source_chain',
      workorder: wo.id,
      message: 'source_refs.module_index is missing.',
      evidence: JSON.stringify(refs),
      suggested_action: 'Resolve the module INDEX.md before generating workorders.',
      blocks_write: true,
      blocks_operator: true,
    }))
  }
  if (plan.module.toLowerCase() === 'nutrition') {
    const currentSpecs = refs.current_specs ?? []
    if (refs.module_index !== 'docs/specs/Nutrition/INDEX.md') {
      findings.push(finding({
        id: 'source_refs.nutrition_module_index_wrong',
        severity: 'high',
        layer: 'spec_source_chain',
        workorder: wo.id,
        message: 'Nutrition workorder must use docs/specs/Nutrition/INDEX.md as module index.',
        evidence: refs.module_index ?? 'missing',
        suggested_action: 'Use the Nutrition INDEX.md source-chain entrypoint.',
        blocks_write: true,
        blocks_operator: true,
      }))
    }
    if (!currentSpecs.some(item => item.startsWith('docs/specs/Nutrition/01_current_specs/'))) {
      findings.push(finding({
        id: 'source_refs.current_spec_missing',
        severity: 'high',
        layer: 'spec_source_chain',
        workorder: wo.id,
        message: 'Nutrition workorder lacks a 01_current_specs primary SSOT.',
        evidence: JSON.stringify(currentSpecs),
        suggested_action: 'Reference the current Nutrition spec before raw sources or fragments.',
        blocks_write: true,
        blocks_operator: true,
      }))
    }
    const priority = refs.ssot_priority ?? []
    const rawIndex = priority.indexOf('raw_sources')
    const currentIndex = priority.indexOf('current_specs')
    if (rawIndex !== -1 && (currentIndex === -1 || rawIndex < currentIndex)) {
      findings.push(finding({
        id: 'source_refs.raw_primary_over_spec',
        severity: 'high',
        layer: 'spec_source_chain',
        workorder: wo.id,
        message: 'Raw sources are prioritized over current specs.',
        evidence: JSON.stringify(priority),
        suggested_action: 'Use raw files only for provenance/validation when current specs exist.',
        blocks_write: true,
        blocks_operator: true,
      }))
    }
  }
  return findings
}

function validateWorkorder(plan: FactoryPlan, wo: PlanWorkorder): FactoryFinding[] {
  const findings: FactoryFinding[] = []
  const requiredFields: Array<keyof PlanWorkorder> = [
    'id',
    'title',
    'agent_id',
    'risk_category',
    'task',
    'expected_outputs',
    'scope_files',
    'acceptance_criteria',
    'negative_constraints',
  ]
  for (const field of requiredFields) {
    const value = wo[field]
    if (value === undefined || value === null || (Array.isArray(value) && value.length === 0) || value === '') {
      findings.push(finding({
        id: `workorder.${String(field)}_missing`,
        severity: 'high',
        layer: 'workorder_factory',
        workorder: wo.id,
        message: `Workorder is missing ${String(field)}.`,
        evidence: String(field),
        suggested_action: `Add ${String(field)} to the workorder plan item.`,
        blocks_write: true,
        blocks_operator: true,
      }))
    }
  }

  const risk = String(wo.risk_category ?? '')
  if (!VALID_RISKS.has(risk)) {
    findings.push(finding({
      id: 'risk.unknown',
      severity: 'high',
      layer: 'workorder_factory',
      workorder: wo.id,
      message: 'Workorder uses an unknown risk category.',
      evidence: risk,
      suggested_action: 'Use an existing workorder.schema.json risk_category.',
      blocks_write: true,
      blocks_operator: true,
    }))
  }
  if (wo.mixed_risk === true || risk.includes(',') || Array.isArray((wo as unknown as Record<string, unknown>).risk_categories)) {
    findings.push(finding({
      id: 'risk.mixed',
      severity: 'high',
      layer: 'workorder_factory',
      workorder: wo.id,
      message: 'Workorder mixes risk categories.',
      evidence: risk,
      suggested_action: 'Split mixed-risk work into separate workorders.',
      blocks_write: true,
      blocks_operator: true,
    }))
  }

  const scope = [...(wo.scope_files ?? []), ...(wo.files_allowed ?? [])]
  for (const output of wo.expected_outputs ?? []) {
    const normalized = toPosix(output)
    if (!outputCovered(normalized, scope)) {
      findings.push(finding({
        id: 'outputs.expected_not_in_scope',
        severity: 'high',
        layer: 'workorder_factory',
        workorder: wo.id,
        message: 'Expected output is not covered by scope_files or files_allowed.',
        evidence: output,
        suggested_action: 'Add expected output to scope_files/files_allowed or narrow expected_outputs.',
        blocks_write: true,
        blocks_operator: true,
      }))
    }
    if (FORBIDDEN_OUTPUT_PREFIXES.some(prefix => normalized.startsWith(prefix)) || normalized === '.env' || normalized.startsWith('.env.')) {
      findings.push(finding({
        id: 'outputs.forbidden_artifact',
        severity: 'high',
        layer: 'runtime_artifact_policy',
        workorder: wo.id,
        message: 'Expected output targets raw data, runtime state, approval state, or env files.',
        evidence: output,
        suggested_action: 'Remove raw/runtime/env paths from expected_outputs.',
        blocks_write: true,
        blocks_operator: true,
      }))
    }
  }

  if (risk === 'db-migration' && !(wo.rollback_hint && wo.rollback_hint.trim().length >= 5)) {
    findings.push(finding({
      id: 'db_migration.rollback_hint_missing',
      severity: 'high',
      layer: 'workorder_factory',
      workorder: wo.id,
      message: 'db-migration workorder lacks rollback_hint.',
      evidence: wo.id,
      suggested_action: 'Add rollback documentation or a concrete rollback_hint before generation.',
      blocks_write: true,
      blocks_operator: true,
    }))
  }

  if (HIGH_RISK.has(risk) && (!wo.files_blocked || wo.files_blocked.length === 0)) {
    findings.push(finding({
      id: 'scope.files_blocked_missing',
      severity: 'high',
      layer: 'workorder_factory',
      workorder: wo.id,
      message: 'High-risk workorder lacks files_blocked.',
      evidence: risk,
      suggested_action: 'Add files_blocked for high-risk workorders.',
      blocks_write: true,
      blocks_operator: true,
    }))
  }

  const joined = [
    wo.task,
    ...(wo.acceptance_criteria ?? []),
    ...(wo.negative_constraints ?? []),
    ...(plan.constraints ?? []),
  ].join('\n')
  const riskyPlaceholder = joined.match(/few examples|placeholder seeds?|20240101_001_example\.sql|example\.sql/i)
  if (riskyPlaceholder) {
    findings.push(finding({
      id: 'content.placeholder_or_example_leak',
      severity: 'high',
      layer: 'workorder_factory',
      workorder: wo.id,
      message: 'Workorder plan contains placeholder/example wording that can leak into execution.',
      evidence: riskyPlaceholder[0],
      suggested_action: 'Use exact expected outputs or non-usable placeholders such as <WORKORDER_DERIVED_MIGRATION_PATH>.',
      blocks_write: true,
      blocks_operator: true,
    }))
  }

  if (/supabase\s+db\s+(push|reset)/i.test(joined)) {
    findings.push(finding({
      id: 'commands.supabase_execution_forbidden',
      severity: 'high',
      layer: 'workorder_factory',
      workorder: wo.id,
      message: 'Workorder plan references Supabase db push/reset.',
      evidence: joined.match(/supabase\s+db\s+(push|reset)/i)?.[0] ?? 'supabase command',
      suggested_action: 'Remove database execution commands from generated workorders.',
      blocks_write: true,
      blocks_operator: true,
    }))
  }

  findings.push(...validateSourceRefs(plan, wo))
  return findings
}

function yamlScalar(value: string | number | boolean): string {
  if (typeof value === 'boolean') return value ? 'true' : 'false'
  if (typeof value === 'number') return String(value)
  return JSON.stringify(value)
}

function yamlArray(key: string, values: string[] | undefined): string[] {
  const lines = [`${key}:`]
  for (const value of values ?? []) lines.push(`  - ${yamlScalar(value)}`)
  if (!values || values.length === 0) lines.push('  []')
  return lines
}

function renderSourceRefs(refs: SourceRefs): string[] {
  const lines = ['source_refs:']
  if (refs.module_index) lines.push(`  module_index: ${yamlScalar(refs.module_index)}`)
  for (const key of ['current_specs', 'patches', 'sql_sources', 'adrs', 'reviews', 'raw_sources'] as const) {
    lines.push(`  ${key}:`)
    for (const item of refs[key] ?? []) lines.push(`    - ${yamlScalar(item)}`)
  }
  lines.push(`  raw_sources_allowed: ${refs.raw_sources_allowed === true ? 'true' : 'false'}`)
  lines.push('  ssot_priority:')
  for (const item of refs.ssot_priority ?? []) lines.push(`    - ${item}`)
  return lines
}

function renderWorkorderMarkdown(plan: FactoryPlan, wo: PlanWorkorder): GeneratedWorkorder {
  const risk = String(wo.risk_category)
  const requiresApproval = defaultApproval(risk, wo.requires_approval)
  const filename = `${wo.id}-${slug(wo.title)}.md`
  const sourceRefs = sourceRefsFor(plan, wo) ?? {}
  const yamlLines = [
    `workorder_id: ${wo.id}`,
    `agent_id: ${wo.agent_id}`,
    `risk_category: ${risk}`,
    `requires_approval: ${requiresApproval ? 'true' : 'false'}`,
    ...(wo.phase ? [`phase: ${wo.phase}`] : []),
    ...(wo.priority ? [`priority: ${wo.priority}`] : []),
    ...(wo.quality_critical !== undefined ? [`quality_critical: ${wo.quality_critical ? 'true' : 'false'}`] : []),
    'task: |',
    ...wo.task.split(/\r?\n/).map(line => `  ${line}`),
    ...renderSourceRefs(sourceRefs),
    ...yamlArray('expected_outputs', wo.expected_outputs),
    ...yamlArray('scope_files', wo.scope_files),
    ...yamlArray('files_allowed', wo.files_allowed ?? wo.scope_files),
    ...yamlArray('context_files', wo.context_files ?? sourceRefsPaths(sourceRefs)),
    ...yamlArray('files_blocked', wo.files_blocked ?? []),
    ...yamlArray('acceptance_criteria', wo.acceptance_criteria),
    ...yamlArray('negative_constraints', wo.negative_constraints),
    ...yamlArray('blocked_by', wo.blocked_by ?? []),
    ...yamlArray('validation_commands', wo.validation_commands ?? ['cmd.exe /c node node_modules\\typescript\\bin\\tsc --noEmit']),
    ...(wo.rollback_hint ? [`rollback_hint: ${yamlScalar(wo.rollback_hint)}`] : []),
  ]
  const markdown = [
    `# ${wo.title}`,
    '',
    'Status: draft',
    `Source: ${plan.batch_id}`,
    'Generated by: system/workorders/cli/wo-factory.ts',
    '',
    '## Workorder',
    '',
    '```yaml',
    ...yamlLines,
    '```',
    '',
    '## Out of Scope',
    '',
    ...(plan.non_goals ?? ['No implementation outside this workorder scope.']).map(item => `- ${item}`),
    '',
    '## Factory Notes',
    '',
    '- Generated from a structured factory plan.',
    '- Validate with spec-source-chain-check before operator execution.',
  ].join('\n')

  return {
    workorder_id: wo.id,
    filename,
    title: wo.title,
    risk_category: risk,
    requires_approval: requiresApproval,
    blocked_by: wo.blocked_by ?? [],
    expected_outputs: wo.expected_outputs,
    markdown,
  }
}

function renderBatchMarkdown(plan: FactoryPlan, workorders: GeneratedWorkorder[]): string {
  const lines = [
    `# ${plan.batch_title}`,
    '',
    '## Status',
    plan.status ?? 'draft',
    '',
    '## Batch Metadata',
    `- Batch ID: ${plan.batch_id}`,
    `- Module: ${plan.module}`,
    '- Generated by: system/workorders/cli/wo-factory.ts',
    '',
    '## Included Workorders',
    '| Order | Filename | workorder_id | Title | Risk | Approval |',
    '|---|---|---|---|---|---|',
  ]
  workorders.forEach((wo, index) => {
    lines.push(`| ${index + 1} | \`${wo.filename}\` | \`${wo.workorder_id}\` | ${wo.title} | ${wo.risk_category} | ${wo.requires_approval ? 'yes' : 'no'} |`)
  })
  lines.push(
    '',
    '## Dependency Graph',
  )
  for (const wo of workorders) {
    lines.push(`- ${wo.workorder_id}: ${wo.blocked_by.length > 0 ? `blocked_by ${wo.blocked_by.join(', ')}` : 'no blockers'}`)
  }
  lines.push(
    '',
    '## Expected Outputs',
  )
  for (const wo of workorders) {
    lines.push(`- ${wo.workorder_id}`)
    for (const output of wo.expected_outputs) lines.push(`  - ${output}`)
  }
  lines.push(
    '',
    '## Validation Plan',
    '- Run spec-source-chain-check on this batch before operator execution.',
    '- Run governance-invariant-check before product or batch work.',
    '- Run agent-contract-check before product or batch work.',
    '- Run operator dry-run before continue/run.',
  )
  return lines.join('\n')
}

function factoryFindingFromDecomposition(item: DecompositionFinding): FactoryFinding {
  return {
    id: `decomposition.${item.id}`,
    severity: item.severity,
    layer: 'decomposition_plan',
    message: item.message,
    evidence: item.path,
    suggested_action: item.recommended_fix,
    blocks_write: item.blocks_factory,
    blocks_operator: item.blocks_factory,
  }
}

export function runFactory(planFile: string, outDir: string, options: { write?: boolean; projectId?: string } = {}): FactoryResult {
  const resolvedPlan = path.resolve(planFile)
  const content = fs.readFileSync(resolvedPlan, 'utf8')
  const plan = extractJsonPlan(content)
  const decompositionValidation = validateDecompositionPlan(plan as unknown as Record<string, unknown>, {
    projectId: options.projectId,
    repoRoot: process.cwd(),
    planFile: toPosix(path.relative(process.cwd(), resolvedPlan)),
  })
  const findings = [
    ...decompositionValidation.findings
      .filter(item => item.severity === 'critical' || item.severity === 'high')
      .map(factoryFindingFromDecomposition),
    ...validatePlanShape(plan),
    ...(Array.isArray(plan.workorders) ? plan.workorders.flatMap(wo => validateWorkorder(plan, wo)) : []),
  ]
  const workorders = Array.isArray(plan.workorders) ? plan.workorders.map(wo => renderWorkorderMarkdown(plan, wo)) : []
  const summary = summarize(findings)
  const status: FactoryStatus = hasBlockingFindings(findings)
    ? 'FIX_REQUIRED'
    : options.write
      ? 'WROTE_FILES'
      : 'READY_TO_WRITE'
  const resolvedOut = path.resolve(outDir)
  const batchFile = path.join(resolvedOut, 'batches', `${plan.batch_id}.md`)
  const writtenFiles: string[] = []

  if (options.write && status === 'WROTE_FILES') {
    const draftsDir = path.join(resolvedOut, 'drafts')
    const batchesDir = path.join(resolvedOut, 'batches')
    fs.mkdirSync(draftsDir, { recursive: true })
    fs.mkdirSync(batchesDir, { recursive: true })
    for (const wo of workorders) {
      const target = path.join(draftsDir, wo.filename)
      fs.writeFileSync(target, wo.markdown, 'utf8')
      writtenFiles.push(toPosix(path.relative(process.cwd(), target)))
    }
    fs.writeFileSync(batchFile, renderBatchMarkdown(plan, workorders), 'utf8')
    writtenFiles.push(toPosix(path.relative(process.cwd(), batchFile)))
  }

  return {
    schema_version: 1,
    generated_at: now(),
    status,
    plan_file: toPosix(path.relative(process.cwd(), resolvedPlan)),
    out_dir: toPosix(path.relative(process.cwd(), resolvedOut)),
    batch_file: toPosix(path.relative(process.cwd(), batchFile)),
    workorders,
    findings,
    summary,
    validation_commands: [
      `cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs system\\workorders\\cli\\spec-source-chain-check.ts --batch ${toPosix(path.relative(process.cwd(), batchFile))}${options.projectId ? ` --project ${options.projectId}` : ''}`,
      `cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs system\\control-plane\\governance-invariant-check.ts${options.projectId ? ` --project ${options.projectId}` : ''}`,
      'cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs system\\control-plane\\agent-contract-check.ts',
      `cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs system\\workorders\\cli\\run-batch-operator.ts ${toPosix(path.relative(process.cwd(), batchFile))} --dry-run`,
    ],
    written_files: writtenFiles,
  }
}

export function validateFactoryTarget(targetPath: string): ValidateResult {
  const resolved = path.resolve(targetPath)
  const content = fs.existsSync(resolved) ? fs.readFileSync(resolved, 'utf8') : ''
  const mode: 'workorder' | 'batch' = content.includes('## Included Workorders') ? 'batch' : 'workorder'
  const findings: FactoryFinding[] = []
  let sourceChain: SpecSourceChainResult | undefined

  if (!fs.existsSync(resolved)) {
    findings.push(finding({
      id: 'target.missing',
      severity: 'critical',
      layer: 'workorder_factory',
      message: 'Validation target does not exist.',
      evidence: targetPath,
      suggested_action: 'Pass an existing workorder or batch file.',
      blocks_write: true,
      blocks_operator: true,
    }))
  } else if (mode === 'workorder') {
    const yaml = extractFirstYamlBlock(content)
    if (!yaml) {
      findings.push(finding({
        id: 'workorder.yaml_missing',
        severity: 'high',
        layer: 'workorder_schema',
        message: 'Workorder has no YAML block.',
        evidence: targetPath,
        suggested_action: 'Add a workorder YAML block.',
        blocks_write: true,
        blocks_operator: true,
      }))
    } else {
      const parsed = parseSimpleYaml(yaml)
      const validation = validateWo(parsed)
      for (const error of validation.errors) {
        findings.push(finding({
          id: 'workorder.schema_invalid',
          severity: 'high',
          layer: 'workorder_schema',
          workorder: typeof parsed.workorder_id === 'string' ? parsed.workorder_id : undefined,
          message: 'Workorder schema validation failed.',
          evidence: error,
          suggested_action: 'Fix the workorder YAML to satisfy workorder.schema.json.',
          blocks_write: true,
          blocks_operator: true,
        }))
      }
      sourceChain = runSpecSourceChainCheck({ workorderFile: resolved })
    }
  } else {
    const loaded = loadBatch(resolved)
    for (const wo of loaded.workorders) {
      for (const error of wo.validationErrors) {
        findings.push(finding({
          id: 'batch.workorder_schema_invalid',
          severity: 'high',
          layer: 'workorder_schema',
          workorder: typeof wo.parsed.workorder_id === 'string' ? wo.parsed.workorder_id : wo.filename,
          message: 'Batch references an invalid workorder.',
          evidence: error,
          suggested_action: 'Fix the referenced workorder before operator execution.',
          blocks_write: true,
          blocks_operator: true,
        }))
      }
    }
    sourceChain = runSpecSourceChainCheck({ batchFile: resolved })
  }

  if (sourceChain) {
    for (const item of sourceChain.findings.filter(item => item.severity === 'critical' || item.severity === 'high')) {
      findings.push(finding({
        id: `source_chain.${item.id}`,
        severity: item.severity,
        layer: item.layer,
        workorder: item.workorder,
        message: item.message,
        evidence: item.evidence,
        suggested_action: item.suggested_action,
        blocks_write: item.blocks_product_work,
        blocks_operator: item.blocks_operator,
      }))
    }
  }

  const summary = summarize(findings)
  return {
    schema_version: 1,
    generated_at: now(),
    target: toPosix(path.relative(process.cwd(), resolved)),
    mode,
    findings,
    summary,
    source_chain: sourceChain,
    exitCode: !fs.existsSync(resolved) ? 2 : hasBlockingFindings(findings) ? 1 : 0,
  }
}

export function formatFactoryReport(result: FactoryResult): string {
  const lines = [
    '# Workorder Factory',
    '',
    `Status: ${result.status}`,
    `Plan: ${result.plan_file ?? '(none)'}`,
    `Output dir: ${result.out_dir ?? '(none)'}`,
    `Batch file: ${result.batch_file ?? '(none)'}`,
    `Summary: critical=${result.summary.critical}, high=${result.summary.high}, medium=${result.summary.medium}, low=${result.summary.low}, info=${result.summary.info}`,
    '',
  ]
  if (result.findings.length > 0) {
    lines.push('## Findings')
    for (const item of result.findings) {
      lines.push(`- [${item.severity}] ${item.id}${item.workorder ? ` (${item.workorder})` : ''}: ${item.message}`)
      lines.push(`  Evidence: ${item.evidence}`)
      lines.push(`  Suggested action: ${item.suggested_action}`)
    }
    lines.push('')
  }
  lines.push('## Proposed Workorders')
  for (const wo of result.workorders) {
    lines.push(`- ${wo.workorder_id}: ${wo.filename} (${wo.risk_category}, approval=${wo.requires_approval ? 'yes' : 'no'})`)
  }
  lines.push('', '## Validation Commands')
  for (const command of result.validation_commands) lines.push(`- ${command}`)
  if (result.written_files.length > 0) {
    lines.push('', '## Written Files')
    for (const file of result.written_files) lines.push(`- ${file}`)
  }
  return lines.join('\n')
}

export function formatValidateReport(result: ValidateResult): string {
  const lines = [
    '# Workorder Factory Validation',
    '',
    `Target: ${result.target}`,
    `Mode: ${result.mode}`,
    `Summary: critical=${result.summary.critical}, high=${result.summary.high}, medium=${result.summary.medium}, low=${result.summary.low}, info=${result.summary.info}`,
    '',
  ]
  if (result.findings.length === 0) {
    lines.push('No blocking findings.')
  } else {
    for (const item of result.findings) {
      lines.push(`- [${item.severity}] ${item.id}${item.workorder ? ` (${item.workorder})` : ''}: ${item.message}`)
      lines.push(`  Evidence: ${item.evidence}`)
      lines.push(`  Suggested action: ${item.suggested_action}`)
    }
  }
  return lines.join('\n')
}

function printUsage(): void {
  console.error('Usage:')
  console.error('  wo-factory.ts --from-plan <plan-file> --out <output-dir> [--project lumeos] [--dry-run|--write] [--json]')
  console.error('  wo-factory.ts --validate <workorder-or-batch> [--json]')
}

function argAfter(args: string[], flag: string): string | undefined {
  const index = args.indexOf(flag)
  return index === -1 ? undefined : args[index + 1]
}

function main(): void {
  const args = process.argv.slice(2)
  const json = args.includes('--json')
  try {
    const validateTarget = argAfter(args, '--validate')
    if (validateTarget) {
      const result = validateFactoryTarget(validateTarget)
      console.log(json ? JSON.stringify(result, null, 2) : formatValidateReport(result))
      process.exit(result.exitCode)
    }

    const planFile = argAfter(args, '--from-plan')
    const outDir = argAfter(args, '--out')
    const projectId = argAfter(args, '--project')
    if (!planFile || !outDir) {
      printUsage()
      process.exit(2)
    }
    const write = args.includes('--write')
    const result = runFactory(planFile, outDir, { write, projectId })
    console.log(json ? JSON.stringify(result, null, 2) : formatFactoryReport(result))
    process.exit(hasBlockingFindings(result.findings) ? 1 : 0)
  } catch (error) {
    const message = (error as Error).message
    if (json) {
      console.log(JSON.stringify({
        schema_version: 1,
        generated_at: now(),
        status: 'FIX_REQUIRED',
        findings: [finding({
          id: 'tool.error',
          severity: 'critical',
          layer: 'tool_config',
          message,
          evidence: message,
          suggested_action: 'Fix the factory input or CLI invocation.',
          blocks_write: true,
          blocks_operator: true,
        })],
      }, null, 2))
    } else {
      console.error(`wo-factory error: ${message}`)
    }
    process.exit(2)
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  main()
}
