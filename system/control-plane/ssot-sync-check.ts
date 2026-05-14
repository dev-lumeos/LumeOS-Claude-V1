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
