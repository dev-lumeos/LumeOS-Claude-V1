import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { pathToFileURL } from 'node:url'

export type SsotSyncSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info'

export interface SsotSyncFinding {
  id: string
  severity: SsotSyncSeverity
  layer: string
  message: string
  evidence: string
  suggested_action: string
  blocks_product_work: boolean
  blocks_operator: boolean
}

export interface SsotSyncSummary {
  critical: number
  high: number
  medium: number
  low: number
  info: number
}

export interface SsotNaDeclaration {
  domain: string
  path: string
  reason: string
}

export interface SsotSyncResult {
  schema_version: 1
  generated_at: string
  repo_root: string
  summary: SsotSyncSummary
  hasHighOrCriticalFindings: boolean
  exitCode: 0 | 1
  findings: SsotSyncFinding[]
  changed_paths: string[]
  na_declarations: SsotNaDeclaration[]
}

interface GitStatusEntry {
  code: string
  path: string
}

interface SsotDomainRule {
  domain: string
  severity: SsotSyncSeverity
  changedPath: (path: string) => boolean
  ssotPath: (path: string) => boolean
  docs: string[]
}

const SSOT_NA_RE = /SSOT_SYNC_CHECK:\s*N\/A\s*\(\s*domain=([a-z0-9_-]+)\s*;\s*reason=([^)]+?)\s*\)/gi

const DOMAIN_RULES: SsotDomainRule[] = [
  {
    domain: 'runtime_model',
    severity: 'high',
    changedPath: p =>
      p === 'system/agent-registry/agents.json' ||
      p === 'system/agent-registry/model_routing.json' ||
      p.startsWith('system/model-tiers/') ||
      p === 'system/control-plane/model-runtime-check.ts' ||
      p === 'system/control-plane/vllm-adapter.ts',
    ssotPath: p =>
      p === 'docs/project/STACK_REFERENCE.md' ||
      p.startsWith('docs/project/runtime/') ||
      p === 'system/model-tiers/model_registry_v2.md' ||
      p === 'system/model-tiers/model_tiers_v2.md' ||
      p === 'docs/project/CURRENT_GOVERNANCE_HANDOVER.md' ||
      p === 'docs/project/GOVERNANCE_TODO_REGISTER.json' ||
      p === 'docs/project/OPEN_TODOS.md',
    docs: [
      'docs/project/STACK_REFERENCE.md',
      'docs/project/runtime/*',
      'system/model-tiers/model_registry_v2.md',
      'system/model-tiers/model_tiers_v2.md',
      'docs/project/CURRENT_GOVERNANCE_HANDOVER.md',
      'docs/project/GOVERNANCE_TODO_REGISTER.json',
      'docs/project/OPEN_TODOS.md',
    ],
  },
  {
    domain: 'workflow_governance',
    severity: 'medium',
    changedPath: p =>
      p.startsWith('system/workorders/cli/') ||
      p.startsWith('system/control-plane/') ||
      p.startsWith('system/reports/') ||
      p.startsWith('system/approval/') ||
      p.startsWith('system/workers/'),
    ssotPath: p =>
      p === 'docs/project/GOVERNANCE_OPERATOR_RUNBOOK.md' ||
      p === 'docs/project/CURRENT_GOVERNANCE_HANDOVER.md' ||
      p === 'docs/project/GOVERNANCE_TODO_REGISTER.json' ||
      p === 'docs/project/OPEN_TODOS.md' ||
      p === 'system/workorders/cli/README.md',
    docs: [
      'docs/project/GOVERNANCE_OPERATOR_RUNBOOK.md',
      'docs/project/CURRENT_GOVERNANCE_HANDOVER.md',
      'docs/project/GOVERNANCE_TODO_REGISTER.json',
      'docs/project/OPEN_TODOS.md',
      'system/workorders/cli/README.md',
    ],
  },
  {
    domain: 'product_gate',
    severity: 'high',
    changedPath: p =>
      p.startsWith('system/project-profiles/profiles/') ||
      p === 'system/project-profiles/project-profile-loader.ts' ||
      p === 'docs/project/PRODUCT_WORK_GATE.md' ||
      p === 'docs/project/FIRST_PRODUCT_GATE_OPENING_PROPOSAL.md',
    ssotPath: p =>
      p === 'docs/project/PRODUCT_WORK_GATE.md' ||
      p === 'docs/project/FIRST_PRODUCT_GATE_OPENING_PROPOSAL.md' ||
      p === 'docs/project/CURRENT_GOVERNANCE_HANDOVER.md' ||
      p === 'docs/project/GOVERNANCE_TODO_REGISTER.json',
    docs: [
      'docs/project/PRODUCT_WORK_GATE.md',
      'docs/project/FIRST_PRODUCT_GATE_OPENING_PROPOSAL.md',
      'docs/project/CURRENT_GOVERNANCE_HANDOVER.md',
      'docs/project/GOVERNANCE_TODO_REGISTER.json',
    ],
  },
  {
    domain: 'infra_runtime',
    severity: 'high',
    changedPath: p => p.startsWith('infra/systemd/') || p.startsWith('infra/vllm/'),
    ssotPath: p =>
      p === 'infra/systemd/README.md' ||
      /^infra\/vllm\/[^/]+\/setup\.md$/.test(p) ||
      p === 'docs/project/STACK_REFERENCE.md' ||
      p.startsWith('docs/project/runtime/') ||
      p === 'docs/project/OPEN_TODOS.md',
    docs: [
      'infra/systemd/README.md',
      'infra/vllm/*/setup.md',
      'docs/project/STACK_REFERENCE.md',
      'docs/project/runtime/*',
      'docs/project/OPEN_TODOS.md',
    ],
  },
]

function toPosix(value: string): string {
  return value.replace(/\\/g, '/')
}

function parseGitStatus(shortStatus: string): GitStatusEntry[] {
  return shortStatus
    .split(/\r?\n/)
    .filter(line => line && !line.startsWith('## '))
    .map(line => {
      const rawPath = line.slice(3).trim()
      const pathPart = rawPath.includes(' -> ') ? rawPath.split(' -> ').pop() ?? rawPath : rawPath
      return {
        code: line.slice(0, 2).trim() || line.slice(0, 2),
        path: toPosix(pathPart),
      }
    })
}

function gitStatus(repoRoot: string): string {
  const result = spawnSync('git', ['status', '--short', '--branch'], {
    cwd: repoRoot,
    encoding: 'utf8',
    shell: false,
  })
  return result.stdout ?? ''
}

function summarize(findings: SsotSyncFinding[]): SsotSyncSummary {
  return {
    critical: findings.filter(f => f.severity === 'critical').length,
    high: findings.filter(f => f.severity === 'high').length,
    medium: findings.filter(f => f.severity === 'medium').length,
    low: findings.filter(f => f.severity === 'low').length,
    info: findings.filter(f => f.severity === 'info').length,
  }
}

function readChangedFile(repoRoot: string, relativePath: string): string {
  const fullPath = path.join(repoRoot, relativePath)
  if (!fs.existsSync(fullPath) || fs.statSync(fullPath).isDirectory()) return ''
  try {
    return fs.readFileSync(fullPath, 'utf8')
  } catch {
    return ''
  }
}

function collectNaDeclarations(repoRoot: string, paths: string[]): SsotNaDeclaration[] {
  const declarations: SsotNaDeclaration[] = []
  for (const changedPath of paths) {
    const content = readChangedFile(repoRoot, changedPath)
    for (const match of content.matchAll(SSOT_NA_RE)) {
      const domain = match[1]?.trim() ?? ''
      const reason = match[2]?.trim() ?? ''
      if (domain && reason.length >= 24) {
        declarations.push({ domain, path: changedPath, reason })
      }
    }
  }
  return declarations
}

function hasNaForDomain(declarations: SsotNaDeclaration[], domain: string): boolean {
  return declarations.some(item => item.domain === domain)
}

function findingFor(rule: SsotDomainRule, changed: string[]): SsotSyncFinding {
  return {
    id: `ssot_sync.${rule.domain}.missing_ssot_update`,
    severity: rule.severity,
    layer: 'ssot_sync',
    message: `${rule.domain} files changed without a mapped SSOT documentation/TODO update or structured N/A declaration`,
    evidence: `changed=${changed.join(', ')}; required_one_of=${rule.docs.join(', ')}`,
    suggested_action: `Update one mapped SSOT file for ${rule.domain}, or add an auditable marker: SSOT_SYNC_CHECK: N/A (domain=${rule.domain}; reason=<specific reason>).`,
    blocks_product_work: ['runtime_model', 'product_gate', 'infra_runtime'].includes(rule.domain),
    blocks_operator: true,
  }
}

function todoCompletionFinding(): SsotSyncFinding {
  return {
    id: 'ssot_sync.completed_todo.missing_register_pair',
    severity: 'medium',
    layer: 'ssot_sync',
    message: 'TODO completion/update touched only one TODO SSOT file',
    evidence: 'Completed TODOs require both docs/project/OPEN_TODOS.md and docs/project/GOVERNANCE_TODO_REGISTER.json to change together.',
    suggested_action: 'Update both OPEN_TODOS.md and GOVERNANCE_TODO_REGISTER.json when closing or materially changing TODO state.',
    blocks_product_work: false,
    blocks_operator: true,
  }
}

function readRepoFile(repoRoot: string, relativePath: string): string | null {
  const fullPath = path.join(repoRoot, relativePath)
  if (!fs.existsSync(fullPath) || fs.statSync(fullPath).isDirectory()) return null
  try {
    return fs.readFileSync(fullPath, 'utf8')
  } catch {
    return null
  }
}

function normalizeStatus(value: unknown): string {
  return typeof value === 'string' ? value.trim().toLowerCase() : ''
}

function isOpenTodoStatus(status: unknown): boolean {
  const normalized = normalizeStatus(status)
  return !!normalized && !['done', 'completed', 'fixed', 'closed', 'cancelled', 'canceled'].includes(normalized)
}

function checkOpenTodoConsistency(repoRoot: string): SsotSyncFinding[] {
  const openTodos = readRepoFile(repoRoot, 'docs/project/OPEN_TODOS.md')
  const registerRaw = readRepoFile(repoRoot, 'docs/project/GOVERNANCE_TODO_REGISTER.json')
  if (openTodos === null || registerRaw === null) return []

  let register: { items?: Array<{ id?: string; status?: string }> }
  try {
    register = JSON.parse(registerRaw) as { items?: Array<{ id?: string; status?: string }> }
  } catch {
    return []
  }

  const markdownIds = [...new Set([...openTodos.matchAll(/\bGOV-TODO-\d+\b/g)].map(match => match[0]))].sort()
  const registerIds = [...new Set((register.items ?? [])
    .filter(item => isOpenTodoStatus(item.status))
    .map(item => item.id)
    .filter((id): id is string => typeof id === 'string' && /^GOV-TODO-\d+$/.test(id)))]
    .sort()

  const missingInMarkdown = registerIds.filter(id => !markdownIds.includes(id))
  const missingInRegister = markdownIds.filter(id => !registerIds.includes(id))
  if (missingInMarkdown.length === 0 && missingInRegister.length === 0) return []

  return [{
    id: 'ssot_sync.open_todos.register_mismatch',
    severity: 'medium',
    layer: 'ssot_sync',
    message: 'OPEN_TODOS open GOV-TODO IDs do not match GOVERNANCE_TODO_REGISTER open items',
    evidence: `missing_in_open_todos=${missingInMarkdown.join(',') || '<none>'}; missing_or_not_open_in_register=${missingInRegister.join(',') || '<none>'}`,
    suggested_action: 'Make OPEN_TODOS.md list the same open GOV-TODO IDs as GOVERNANCE_TODO_REGISTER.json, or close/reframe stale register items.',
    blocks_product_work: false,
    blocks_operator: true,
  }]
}

interface RuntimeRoleExpectation {
  id: string
  label: string
  patterns: RegExp[]
}

const RUNTIME_ROLE_FILES = [
  'docs/project/STACK_REFERENCE.md',
  'system/model-tiers/model_registry_v2.md',
  'system/model-tiers/model_tiers_v2.md',
]

const RUNTIME_ROLE_EXPECTATIONS: RuntimeRoleExpectation[] = [
  {
    id: 'spark1_orchestrator',
    label: 'DGX1/Spark1 workflow-ready orchestrator',
    patterns: [/DGX1\s*\/\s*Spark1/i, /orchestrator-agent|orchestrator/i, /workflow-ready|handoff proven/i],
  },
  {
    id: 'spark2_worker',
    label: 'DGX2/Spark2 workflow-ready coding/docs worker',
    patterns: [/DGX2\s*\/\s*Spark2/i, /coding\/docs|coding\/docs\/test|worker/i, /workflow-ready/i],
  },
  {
    id: 'spark3_nemotron_reviewer',
    label: 'DGX3/Spark3 Nemotron controlled reviewer/specialist candidate',
    patterns: [/DGX3\s*\/\s*Spark3/i, /Nemotron/i, /controlled reviewer|controlled_reviewer|specialist candidate|reviewer\/specialist/i, /not default|not production|controlled only|explicit workflow tests/i],
  },
  {
    id: 'dgx45_minimax_lab',
    label: 'DGX4/5 MiniMax lab-only runtime',
    patterns: [/DGX4\/5|DGX4|Spark4/i, /MiniMax/i, /lab-only|lab runtime|Hermes-test/i, /not production routing|not productive governance/i],
  },
]

function checkRuntimeRoleConsistency(repoRoot: string): SsotSyncFinding[] {
  const loaded = RUNTIME_ROLE_FILES
    .map(file => ({ file, content: readRepoFile(repoRoot, file) }))
    .filter((item): item is { file: string; content: string } => item.content !== null)
  if (loaded.length === 0) return []

  const mismatches: string[] = []
  for (const doc of loaded) {
    for (const expectation of RUNTIME_ROLE_EXPECTATIONS) {
      if (!expectation.patterns.every(pattern => pattern.test(doc.content))) {
        mismatches.push(`${doc.file}:${expectation.id}`)
      }
    }
  }
  if (mismatches.length === 0) return []

  return [{
    id: 'ssot_sync.runtime_roles.cross_file_mismatch',
    severity: 'medium',
    layer: 'ssot_sync',
    message: 'Runtime role SSOT files do not agree on current Spark/DGX role assignments',
    evidence: mismatches.join(', '),
    suggested_action: 'Align STACK_REFERENCE.md, model_registry_v2.md, and model_tiers_v2.md on DGX1/Spark1, DGX2/Spark2, DGX3/Nemotron, and DGX4/5 MiniMax lab roles.',
    blocks_product_work: false,
    blocks_operator: true,
  }]
}

function checkHandoverTodoConsistency(repoRoot: string): SsotSyncFinding[] {
  const handover = readRepoFile(repoRoot, 'docs/project/CURRENT_GOVERNANCE_HANDOVER.md')
  const registerRaw = readRepoFile(repoRoot, 'docs/project/GOVERNANCE_TODO_REGISTER.json')
  if (handover === null || registerRaw === null) return []

  let register: { items?: Array<{ id?: string; status?: string }> }
  try {
    register = JSON.parse(registerRaw) as { items?: Array<{ id?: string; status?: string }> }
  } catch {
    return []
  }

  const staleClaims: string[] = []
  for (const item of register.items ?? []) {
    if (typeof item.id !== 'string') continue
    const status = normalizeStatus(item.status)
    if (!['done', 'completed', 'fixed', 'closed'].includes(status)) continue
    const idIndex = handover.indexOf(item.id)
    if (idIndex === -1) continue
    const window = handover.slice(Math.max(0, idIndex - 160), idIndex + 280)
    const claimsBlocked = /blocked_pending_tom_decision|\b(blocked|pending|waiting|requires Tom)\b/i.test(window)
    const explainedHistorical = /\b(superseded|historical|archived|closed|done|completed)\b/i.test(window)
    if (claimsBlocked && !explainedHistorical) staleClaims.push(item.id)
  }

  if (staleClaims.length === 0) return []
  return [{
    id: 'ssot_sync.handover.done_todo_claimed_blocked',
    severity: 'medium',
    layer: 'ssot_sync',
    message: 'Active handover claims a done TODO is still blocked or pending',
    evidence: `todo_ids=${staleClaims.join(',')}`,
    suggested_action: 'Move the old blocker into Archived/Historical Notes or explain that it is superseded/done.',
    blocks_product_work: false,
    blocks_operator: true,
  }]
}

function checkChangedWorkorderDocumentationImpact(repoRoot: string, changedPaths: string[]): SsotSyncFinding[] {
  const findings: SsotSyncFinding[] = []
  const workorderPaths = changedPaths.filter(p =>
    /^system\/workorders\/.+\/drafts\/.+\.md$/.test(p) ||
    /^system\/workorders\/.+\/batches\/.+\.md$/.test(p),
  )
  for (const file of workorderPaths) {
    const content = readRepoFile(repoRoot, file)
    if (!content) continue
    if (file.includes('/drafts/') && !/documentation_impact:\s*\n/i.test(content)) {
      findings.push({
        id: 'ssot_sync.workorder.documentation_impact_missing',
        severity: 'high',
        layer: 'ssot_sync',
        message: 'Changed governed workorder is missing documentation_impact metadata',
        evidence: file,
        suggested_action: 'Declare documentation_impact or mark the workorder historical with the structured N/A reason before it can be DONE.',
        blocks_product_work: false,
        blocks_operator: true,
      })
    }
    if (/documentation_impact:\s*\n[\s\S]*?domains:\s*\n\s*-\s*"?none"?/i.test(content)) {
      const reason = /na_reason:\s*"?([^"\n]+)"?/i.exec(content)?.[1]?.trim() ?? ''
      if (reason.length < 24 || /^(n\/a|na|none|not applicable|no docs?|no impact)$/i.test(reason)) {
        findings.push({
          id: 'ssot_sync.workorder.documentation_na_generic',
          severity: 'high',
          layer: 'ssot_sync',
          message: 'Changed workorder uses documentation_impact none without a specific auditable N/A reason',
          evidence: file,
          suggested_action: 'Replace the generic N/A with a concrete reason that can be audited in the dossier.',
          blocks_product_work: false,
          blocks_operator: true,
        })
      }
    }
  }
  return findings
}

export function runSsotSyncCheck(opts: { repoRoot?: string; gitStatus?: string } = {}): SsotSyncResult {
  const repoRoot = path.resolve(opts.repoRoot ?? process.cwd())
  const entries = parseGitStatus(opts.gitStatus ?? gitStatus(repoRoot))
    .filter(entry => entry.code !== '!!')
  const changedPaths = [...new Set(entries.map(entry => entry.path))]
  const declarations = collectNaDeclarations(repoRoot, changedPaths)
  const findings: SsotSyncFinding[] = []

  for (const rule of DOMAIN_RULES) {
    const domainChanges = changedPaths.filter(rule.changedPath)
    if (domainChanges.length === 0) continue
    const hasMappedSsotUpdate = changedPaths.some(rule.ssotPath)
    if (!hasMappedSsotUpdate && !hasNaForDomain(declarations, rule.domain)) {
      findings.push(findingFor(rule, domainChanges))
    }
  }

  const openTodosChanged = changedPaths.includes('docs/project/OPEN_TODOS.md')
  const registerChanged = changedPaths.includes('docs/project/GOVERNANCE_TODO_REGISTER.json')
  if (openTodosChanged !== registerChanged && !hasNaForDomain(declarations, 'completed_todo')) {
    findings.push(todoCompletionFinding())
  }
  findings.push(...checkOpenTodoConsistency(repoRoot))
  findings.push(...checkRuntimeRoleConsistency(repoRoot))
  findings.push(...checkHandoverTodoConsistency(repoRoot))
  findings.push(...checkChangedWorkorderDocumentationImpact(repoRoot, changedPaths))

  const summary = summarize(findings)
  const hasHighOrCriticalFindings = summary.critical > 0 || summary.high > 0
  return {
    schema_version: 1,
    generated_at: new Date().toISOString(),
    repo_root: repoRoot,
    summary,
    hasHighOrCriticalFindings,
    exitCode: hasHighOrCriticalFindings ? 1 : 0,
    findings,
    changed_paths: changedPaths,
    na_declarations: declarations,
  }
}

export function formatSsotSyncReport(result: SsotSyncResult): string {
  const lines = [
    '# SSOT Sync Check',
    '',
    `Generated: ${result.generated_at}`,
    `Repo: ${result.repo_root}`,
    '',
    '## Summary',
    '',
    `critical: ${result.summary.critical}`,
    `high: ${result.summary.high}`,
    `medium: ${result.summary.medium}`,
    `low: ${result.summary.low}`,
    `info: ${result.summary.info}`,
    '',
    '## Findings',
  ]
  if (result.findings.length === 0) {
    lines.push('')
    lines.push('(none)')
  } else {
    for (const item of result.findings) {
      lines.push('')
      lines.push(`- ${item.id} [${item.severity}]`)
      lines.push(`  message: ${item.message}`)
      lines.push(`  evidence: ${item.evidence}`)
      lines.push(`  suggested_action: ${item.suggested_action}`)
    }
  }
  lines.push('')
  lines.push('## N/A Declarations')
  if (result.na_declarations.length === 0) {
    lines.push('')
    lines.push('(none)')
  } else {
    for (const item of result.na_declarations) {
      lines.push(`- ${item.domain}: ${item.path} - ${item.reason}`)
    }
  }
  return lines.join('\n')
}

function main(): number {
  const args = process.argv.slice(2)
  const json = args.includes('--json')
  const unknown = args.filter(arg => arg !== '--json')
  if (unknown.length > 0) {
    console.error(`Unknown flag(s): ${unknown.join(', ')}`)
    return 2
  }
  const result = runSsotSyncCheck()
  if (json) {
    console.log(JSON.stringify(result, null, 2))
  } else {
    console.log(formatSsotSyncReport(result))
  }
  return result.findings.length > 0 ? 1 : 0
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  process.exitCode = main()
}
