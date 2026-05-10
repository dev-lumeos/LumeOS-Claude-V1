import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { getProjectProfile, type ProjectProfile } from '../../project-profiles/project-profile-loader'

export type SpecSourceChainSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info'

export interface SpecSourceChainFinding {
  id: string
  severity: SpecSourceChainSeverity
  layer: string
  workorder: string
  message: string
  evidence: string
  suggested_action: string
  blocks_product_work: boolean
  blocks_operator: boolean
}

export interface SpecSourceChainSummary {
  critical: number
  high: number
  medium: number
  low: number
  info: number
}

export interface CheckedWorkorder {
  workorder_file: string
  workorder_id: string
  findings: SpecSourceChainFinding[]
}

export interface SpecSourceChainResult {
  schema_version: 1
  generated_at: string
  repo_root: string
  project_profile?: {
    project_id: string
    display_name: string
  }
  mode: 'workorder' | 'batch'
  product_work_gate: {
    status: 'blocked' | 'allowed_if_clean'
    reason: string
  }
  hasHighOrCriticalFindings: boolean
  exitCode: 0 | 1 | 2
  summary: SpecSourceChainSummary
  workorders: CheckedWorkorder[]
  findings: SpecSourceChainFinding[]
}

interface SpecSourceChainOptions {
  repoRoot?: string
  workorderFile?: string
  batchFile?: string
  projectId?: string
}

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

interface ParsedWorkorder {
  filePath: string
  relativePath: string
  workorderId: string
  yaml: Record<string, unknown>
  sourceRefs: SourceRefs | null
  content: string
}

const PRODUCT_GATE_REASON = 'BLS import blocked until Governance Batch 005 is merged and this checker passes, or Tom explicitly waives it.'
const NUTRITION_PREFIX = 'docs/specs/Nutrition/'
const NUTRITION_PRIORITY = ['module_index', 'current_specs', 'patches', 'sql_sources', 'adrs', 'reviews', 'raw_sources']

function finding(params: SpecSourceChainFinding): SpecSourceChainFinding {
  return params
}

function toPosix(value: string): string {
  return value.replace(/\\/g, '/')
}

function normalizeRelative(repoRoot: string, filePath: string): string {
  return toPosix(path.relative(repoRoot, path.resolve(filePath)))
}

function readText(filePath: string): string {
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : ''
}

function stripQuotes(value: string): string {
  return value.trim().replace(/^['"]|['"]$/g, '')
}

function parseScalar(value: string): unknown {
  const trimmed = value.trim()
  if (trimmed === 'true') return true
  if (trimmed === 'false') return false
  if (trimmed === 'null' || trimmed === '~') return null
  if (trimmed === '[]') return []
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    const inner = trimmed.slice(1, -1).trim()
    if (!inner) return []
    return inner.split(',').map(item => stripQuotes(item))
  }
  return stripQuotes(trimmed)
}

function extractYamlBlock(content: string): string {
  const match = /```yaml\s*([\s\S]*?)```/i.exec(content)
  return match ? match[1] : ''
}

function parseTopLevelYaml(yaml: string): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  const lines = yaml.split(/\r?\n/)
  let i = 0
  const keyRe = /^([A-Za-z_][A-Za-z0-9_]*):\s*(.*)$/

  while (i < lines.length) {
    const line = lines[i]
    const match = keyRe.exec(line)
    if (!match) {
      i += 1
      continue
    }

    const key = match[1]
    const value = match[2].trim()
    if (value === '|' || value === '|-' || value === '|+') {
      i += 1
      const block: string[] = []
      while (i < lines.length && (lines[i].startsWith(' ') || lines[i].trim() === '')) {
        block.push(lines[i].replace(/^  /, ''))
        i += 1
      }
      result[key] = block.join('\n')
      continue
    }

    if (value === '') {
      i += 1
      const array: string[] = []
      while (i < lines.length && /^\s+-\s+/.test(lines[i])) {
        array.push(stripQuotes(lines[i].replace(/^\s+-\s+/, '')))
        i += 1
      }
      if (array.length > 0) {
        result[key] = array
      }
      continue
    }

    result[key] = parseScalar(value)
    i += 1
  }

  return result
}

function parseSourceRefs(yaml: string): SourceRefs | null {
  const lines = yaml.split(/\r?\n/)
  const start = lines.findIndex(line => /^source_refs:\s*$/.test(line))
  if (start === -1) return null

  const refs: SourceRefs = {}
  let i = start + 1
  while (i < lines.length) {
    const line = lines[i]
    if (!line.trim()) {
      i += 1
      continue
    }
    if (/^[A-Za-z_][A-Za-z0-9_]*:\s*/.test(line)) break

    const scalar = /^  ([A-Za-z_][A-Za-z0-9_]*):\s*(.+)$/.exec(line)
    if (scalar) {
      ;(refs as Record<string, unknown>)[scalar[1]] = parseScalar(scalar[2])
      i += 1
      continue
    }

    const list = /^  ([A-Za-z_][A-Za-z0-9_]*):\s*$/.exec(line)
    if (list) {
      i += 1
      const values: string[] = []
      while (i < lines.length && /^\s{4}-\s+/.test(lines[i])) {
        values.push(stripQuotes(lines[i].replace(/^\s{4}-\s+/, '')))
        i += 1
      }
      ;(refs as Record<string, unknown>)[list[1]] = values
      continue
    }

    i += 1
  }

  return refs
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter(item => typeof item === 'string') : []
}

function isNutritionWorkorder(parsed: ParsedWorkorder): boolean {
  return parsed.relativePath.includes('/nutrition/') ||
    parsed.content.includes('docs/specs/Nutrition/') ||
    parsed.content.includes('WO-nutrition') ||
    parsed.content.includes('Nutrition')
}

function isProductWork(parsed: ParsedWorkorder): boolean {
  const content = parsed.content.toLowerCase()
  return content.includes('bls import') || content.includes('product work') || content.includes('nutrition p1-005')
}

function sourcePaths(refs: SourceRefs): string[] {
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

function pathExists(repoRoot: string, relativePath: string | undefined): boolean {
  return !!relativePath && fs.existsSync(path.join(repoRoot, relativePath))
}

function outputCovered(output: string, scopes: string[]): boolean {
  const normalized = toPosix(output)
  return scopes.some(scope => {
    const s = toPosix(scope)
    if (s.endsWith('/')) return normalized.startsWith(s)
    if (s.endsWith('/**')) return normalized.startsWith(s.slice(0, -3))
    return normalized === s
  })
}

function findWorkordersFromBatch(repoRoot: string, batchFile: string): string[] {
  const batchPath = path.resolve(batchFile)
  const content = readText(batchPath)
  const filenames = new Set<string>()
  const tableRowRe = /^\|\s*\d+\s*\|\s*`?([^`|]+?\.md)`?\s*\|/gm
  let match: RegExpExecArray | null
  while ((match = tableRowRe.exec(content)) !== null) {
    filenames.add(match[1].trim())
  }

  const batchDir = path.dirname(batchPath)
  const candidateDirs = [
    path.resolve(batchDir, '../drafts'),
    path.resolve(batchDir, '..'),
    batchDir,
  ]

  return [...filenames].map(filename => {
    if (path.isAbsolute(filename)) return filename
    for (const dir of candidateDirs) {
      const candidate = path.join(dir, filename)
      if (fs.existsSync(candidate)) return candidate
    }
    return path.join(candidateDirs[0], filename)
  })
}

function parseWorkorder(repoRoot: string, filePath: string): ParsedWorkorder {
  const resolved = path.resolve(filePath)
  const content = readText(resolved)
  const yaml = extractYamlBlock(content)
  const parsed = parseTopLevelYaml(yaml)
  const sourceRefs = parseSourceRefs(yaml)
  const workorderId = typeof parsed.workorder_id === 'string' ? parsed.workorder_id : path.basename(filePath, '.md')

  return {
    filePath: resolved,
    relativePath: normalizeRelative(repoRoot, resolved),
    workorderId,
    yaml: parsed,
    sourceRefs,
    content,
  }
}

function checkWorkorder(repoRoot: string, parsed: ParsedWorkorder): CheckedWorkorder {
  const findings: SpecSourceChainFinding[] = []
  const workorder = parsed.workorderId
  const sourceRefs = parsed.sourceRefs
  const nutrition = isNutritionWorkorder(parsed)

  if (!sourceRefs) {
    findings.push(finding({
      id: 'source_refs.legacy_missing',
      severity: 'medium',
      layer: 'spec_source_chain',
      workorder,
      message: 'Workorder has no source_refs block.',
      evidence: parsed.relativePath,
      suggested_action: 'Legacy workorders may remain unchanged, but new workorders should include source_refs.',
      blocks_product_work: false,
      blocks_operator: false,
    }))
  } else {
    if (!sourceRefs.module_index) {
      findings.push(finding({
        id: 'source_refs.module_index_missing',
        severity: 'high',
        layer: 'spec_source_chain',
        workorder,
        message: 'source_refs.module_index is missing.',
        evidence: JSON.stringify(sourceRefs),
        suggested_action: 'Add the module INDEX.md as the first source-chain reference.',
        blocks_product_work: true,
        blocks_operator: true,
      }))
    } else if (!pathExists(repoRoot, sourceRefs.module_index)) {
      findings.push(finding({
        id: 'source_refs.module_index_missing',
        severity: 'high',
        layer: 'spec_source_chain',
        workorder,
        message: 'source_refs.module_index points to a missing file.',
        evidence: sourceRefs.module_index,
        suggested_action: 'Create or correct the module INDEX.md reference.',
        blocks_product_work: true,
        blocks_operator: true,
      }))
    }

    for (const sourcePath of sourcePaths(sourceRefs)) {
      if (!pathExists(repoRoot, sourcePath)) {
        findings.push(finding({
          id: 'source_refs.file_missing',
          severity: 'high',
          layer: 'spec_source_chain',
          workorder,
          message: 'source_refs points to a missing file.',
          evidence: sourcePath,
          suggested_action: 'Correct the source_refs path or add the missing source document.',
          blocks_product_work: true,
          blocks_operator: true,
        }))
      }
    }

    if (nutrition) {
      if (sourceRefs.module_index !== 'docs/specs/Nutrition/INDEX.md') {
        findings.push(finding({
          id: 'source_refs.nutrition_module_index_wrong',
          severity: 'high',
          layer: 'spec_source_chain',
          workorder,
          message: 'Nutrition workorder does not reference docs/specs/Nutrition/INDEX.md as module index.',
          evidence: sourceRefs.module_index ?? 'missing',
          suggested_action: 'Use docs/specs/Nutrition/INDEX.md as the Nutrition source-chain entry point.',
          blocks_product_work: true,
          blocks_operator: true,
        }))
      }

      const currentSpecs = sourceRefs.current_specs ?? []
      const hasNutritionCurrentSpec = currentSpecs.some(item => item.startsWith(`${NUTRITION_PREFIX}01_current_specs/`))
      if (!hasNutritionCurrentSpec) {
        findings.push(finding({
          id: 'source_refs.current_spec_missing',
          severity: 'high',
          layer: 'spec_source_chain',
          workorder,
          message: 'Nutrition workorder does not reference a 01_current_specs primary SSOT.',
          evidence: JSON.stringify(currentSpecs),
          suggested_action: 'Reference the current Nutrition spec before patches, SQL sources, reviews, or raw files.',
          blocks_product_work: true,
          blocks_operator: true,
        }))
      }

      const priority = sourceRefs.ssot_priority ?? []
      const rawIndex = priority.indexOf('raw_sources')
      const currentIndex = priority.indexOf('current_specs')
      if (rawIndex !== -1 && (currentIndex === -1 || rawIndex < currentIndex) && hasNutritionCurrentSpec) {
        findings.push(finding({
          id: 'source_refs.raw_primary_over_spec',
          severity: 'high',
          layer: 'spec_source_chain',
          workorder,
          message: 'Raw sources are prioritized over current specs even though a current spec exists.',
          evidence: JSON.stringify(priority),
          suggested_action: 'Use raw BLS files only for provenance/validation when current specs exist.',
          blocks_product_work: true,
          blocks_operator: true,
        }))
      }

      if ((sourceRefs.raw_sources ?? []).some(item => item.includes('/00_raw/')) && sourceRefs.raw_sources_allowed !== true) {
        findings.push(finding({
          id: 'source_refs.raw_sources_not_allowed',
          severity: 'medium',
          layer: 'spec_source_chain',
          workorder,
          message: 'Raw source paths are referenced while raw_sources_allowed is not true.',
          evidence: JSON.stringify(sourceRefs.raw_sources),
          suggested_action: 'Set raw_sources_allowed: true only for provenance/validation references, not implementation SSOT.',
          blocks_product_work: false,
          blocks_operator: false,
        }))
      }

      for (const expected of NUTRITION_PRIORITY) {
        if (priority.includes(expected)) continue
        findings.push(finding({
          id: 'source_refs.ssot_priority_incomplete',
          severity: 'medium',
          layer: 'spec_source_chain',
          workorder,
          message: `Nutrition ssot_priority does not list ${expected}.`,
          evidence: JSON.stringify(priority),
          suggested_action: 'List the full Nutrition SSOT priority, with raw_sources last.',
          blocks_product_work: false,
          blocks_operator: false,
        }))
      }
    }
  }

  const expectedOutputs = asStringArray(parsed.yaml.expected_outputs)
  if (expectedOutputs.length === 0) {
    findings.push(finding({
      id: 'outputs.expected_outputs_missing',
      severity: sourceRefs ? 'high' : 'medium',
      layer: 'workorder_factory',
      workorder,
      message: 'Workorder does not list expected_outputs.',
      evidence: parsed.relativePath,
      suggested_action: 'Add expected_outputs and make acceptance criteria verify output completeness.',
      blocks_product_work: !!sourceRefs,
      blocks_operator: !!sourceRefs,
    }))
  }

  const scope = [...asStringArray(parsed.yaml.scope_files), ...asStringArray(parsed.yaml.files_allowed)]
  for (const output of expectedOutputs) {
    if (!outputCovered(output, scope)) {
      findings.push(finding({
        id: 'outputs.expected_not_in_scope',
        severity: 'high',
        layer: 'workorder_factory',
        workorder,
        message: 'Expected output is not covered by scope_files or files_allowed.',
        evidence: output,
        suggested_action: 'Add every expected output to scope_files/files_allowed or narrow expected_outputs.',
        blocks_product_work: true,
        blocks_operator: true,
      }))
    }
  }

  if (['db-migration', 'security', 'medical', 'payments'].includes(String(parsed.yaml.risk_category ?? '')) && asStringArray(parsed.yaml.files_blocked).length === 0) {
    findings.push(finding({
      id: 'scope.files_blocked_missing',
      severity: 'high',
      layer: 'workorder_factory',
      workorder,
      message: 'High-risk workorder does not define files_blocked.',
      evidence: String(parsed.yaml.risk_category),
      suggested_action: 'Add files_blocked to high-risk workorders.',
      blocks_product_work: true,
      blocks_operator: true,
    }))
  }

  const acceptance = asStringArray(parsed.yaml.acceptance_criteria).join('\n').toLowerCase()
  if (expectedOutputs.length > 0 && !/expected_outputs|output|complete|vollst/i.test(acceptance)) {
    findings.push(finding({
      id: 'outputs.acceptance_completeness_missing',
      severity: 'medium',
      layer: 'workorder_factory',
      workorder,
      message: 'Acceptance criteria do not mention output completeness.',
      evidence: acceptance,
      suggested_action: 'Make acceptance criteria assert expected output completeness.',
      blocks_product_work: false,
      blocks_operator: false,
    }))
  }

  const lower = parsed.content.toLowerCase()
  const riskyPlaceholderLine = parsed.content
    .split(/\r?\n/)
    .find(line => /few examples|placeholder seed|placeholder seeds|beispiel(?:e)?\s+seed|nur ein paar beispiele/i.test(line) && !/no |do not|never|niemals|keine?|forbid/i.test(line))
  if (riskyPlaceholderLine) {
    findings.push(finding({
      id: 'content.placeholder_seed_phrase',
      severity: 'high',
      layer: 'spec_source_chain',
      workorder,
      message: 'Workorder contains placeholder seed wording.',
      evidence: riskyPlaceholderLine.trim(),
      suggested_action: 'Require complete spec-derived seed data and forbid placeholder examples.',
      blocks_product_work: true,
      blocks_operator: true,
    }))
  }

  if (/20240101_001_example\.sql|example\.sql|targetPath:\s*["']?supabase\/migrations\/.*example/i.test(parsed.content)) {
    findings.push(finding({
      id: 'content.example_path_phrase',
      severity: 'high',
      layer: 'spec_source_chain',
      workorder,
      message: 'Workorder contains a usable example path phrase.',
      evidence: parsed.content.match(/.{0,50}(20240101_001_example\.sql|example\.sql).{0,50}/i)?.[0] ?? 'example path phrase',
      suggested_action: 'Use placeholders such as <WORKORDER_DERIVED_MIGRATION_PATH> and exact expected_outputs.',
      blocks_product_work: true,
      blocks_operator: true,
    }))
  }

  if (/invented nutrient|invent nutrient|fake nutrient|raw bls.*primary|00_raw.*primary source/i.test(parsed.content)) {
    findings.push(finding({
      id: 'content.invented_or_raw_primary_risk',
      severity: 'high',
      layer: 'spec_source_chain',
      workorder,
      message: 'Workorder wording risks invented data or raw-source primary implementation.',
      evidence: parsed.content.match(/.{0,50}(invented nutrient|fake nutrient|raw bls.*primary|00_raw.*primary source).{0,50}/i)?.[0] ?? 'invented/raw primary risk',
      suggested_action: 'Require current specs as SSOT and raw files for provenance only.',
      blocks_product_work: true,
      blocks_operator: true,
    }))
  }

  if (isProductWork(parsed)) {
    findings.push(finding({
      id: 'product_gate.blocked',
      severity: 'high',
      layer: 'product_work_gate',
      workorder,
      message: 'Product work remains blocked until Governance Batch 005 is merged and source-chain checks pass, or Tom waives the gate.',
      evidence: parsed.relativePath,
      suggested_action: 'Do not run product workorders until the product gate opens.',
      blocks_product_work: true,
      blocks_operator: false,
    }))
  }

  return {
    workorder_file: parsed.relativePath,
    workorder_id: workorder,
    findings,
  }
}

function summarize(findings: SpecSourceChainFinding[]): SpecSourceChainSummary {
  return {
    critical: findings.filter(f => f.severity === 'critical').length,
    high: findings.filter(f => f.severity === 'high').length,
    medium: findings.filter(f => f.severity === 'medium').length,
    low: findings.filter(f => f.severity === 'low').length,
    info: findings.filter(f => f.severity === 'info').length,
  }
}

export function runSpecSourceChainCheck(options: SpecSourceChainOptions = {}): SpecSourceChainResult {
  const repoRoot = options.repoRoot ?? process.cwd()
  const profile: ProjectProfile | undefined = options.projectId ? getProjectProfile(options.projectId, { repoRoot }) : undefined
  const workorderFiles = options.batchFile
    ? findWorkordersFromBatch(repoRoot, options.batchFile)
    : [options.workorderFile ?? '']

  if (!options.batchFile && !options.workorderFile) {
    return {
      schema_version: 1,
      generated_at: new Date().toISOString(),
      repo_root: repoRoot,
      ...(profile ? { project_profile: { project_id: profile.project_id, display_name: profile.display_name } } : {}),
      mode: 'workorder',
      product_work_gate: { status: 'blocked', reason: profile?.product_gate.reason ?? PRODUCT_GATE_REASON },
      hasHighOrCriticalFindings: true,
      exitCode: 2,
      summary: { critical: 0, high: 1, medium: 0, low: 0, info: 0 },
      workorders: [],
      findings: [finding({
        id: 'config.workorder_missing',
        severity: 'high',
        layer: 'tool_config',
        workorder: 'unknown',
        message: 'No workorder file or batch file provided.',
        evidence: 'missing input',
        suggested_action: 'Pass a workorder file or --batch <batch-file>.',
        blocks_product_work: true,
        blocks_operator: true,
      })],
    }
  }

  const checked: CheckedWorkorder[] = []
  for (const file of workorderFiles) {
    const parsed = parseWorkorder(repoRoot, file)
    checked.push(checkWorkorder(repoRoot, parsed))
  }

  const findings = checked.flatMap(item => item.findings)
  const summary = summarize(findings)
  const hasHighOrCriticalFindings = summary.critical > 0 || summary.high > 0

  return {
    schema_version: 1,
    generated_at: new Date().toISOString(),
    repo_root: repoRoot,
    ...(profile ? { project_profile: { project_id: profile.project_id, display_name: profile.display_name } } : {}),
    mode: options.batchFile ? 'batch' : 'workorder',
    product_work_gate: {
      status: 'blocked',
      reason: profile?.product_gate.reason ?? PRODUCT_GATE_REASON,
    },
    hasHighOrCriticalFindings,
    exitCode: hasHighOrCriticalFindings ? 1 : 0,
    summary,
    workorders: checked,
    findings,
  }
}

export function formatSpecSourceChainReport(result: SpecSourceChainResult): string {
  const lines = [
    '# Spec Source Chain Check',
    '',
    `Repo: ${result.repo_root}`,
    ...(result.project_profile ? [`Project profile: ${result.project_profile.project_id} (${result.project_profile.display_name})`] : []),
    `Generated: ${result.generated_at}`,
    `Mode: ${result.mode}`,
    `Product work gate: ${result.product_work_gate.reason}`,
    '',
    `Summary: critical=${result.summary.critical}, high=${result.summary.high}, medium=${result.summary.medium}, low=${result.summary.low}, info=${result.summary.info}`,
    '',
  ]

  for (const workorder of result.workorders) {
    lines.push(`## ${workorder.workorder_id}`)
    lines.push(`File: ${workorder.workorder_file}`)
    if (workorder.findings.length === 0) {
      lines.push('No findings.')
      lines.push('')
      continue
    }
    for (const item of workorder.findings) {
      lines.push(`- [${item.severity}] ${item.id} (${item.layer})`)
      lines.push(`  ${item.message}`)
      lines.push(`  Evidence: ${item.evidence}`)
      lines.push(`  Suggested action: ${item.suggested_action}`)
    }
    lines.push('')
  }

  return lines.join('\n')
}

function printUsage(): void {
  console.error('Usage: spec-source-chain-check.ts <workorder-file> [--json]')
  console.error('   or: spec-source-chain-check.ts --batch <batch-file> [--json]')
}

function main(): void {
  const args = process.argv.slice(2)
  const json = args.includes('--json')
  const projectIndex = args.indexOf('--project')
  const projectId = projectIndex !== -1 ? args[projectIndex + 1] : undefined
  const filtered = args.filter((arg, index) => arg !== '--json' && arg !== '--project' && index !== projectIndex + 1)
  const batchIndex = filtered.indexOf('--batch')

  let result: SpecSourceChainResult
  if (batchIndex !== -1) {
    const batchFile = filtered[batchIndex + 1]
    if (!batchFile || filtered.length !== 2) {
      printUsage()
      process.exit(2)
    }
    result = runSpecSourceChainCheck({ batchFile, projectId })
  } else if (filtered.length === 1) {
    result = runSpecSourceChainCheck({ workorderFile: filtered[0], projectId })
  } else {
    printUsage()
    process.exit(2)
  }

  if (json) {
    console.log(JSON.stringify(result, null, 2))
  } else {
    console.log(formatSpecSourceChainReport(result))
  }
  process.exit(result.exitCode)
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  main()
}
