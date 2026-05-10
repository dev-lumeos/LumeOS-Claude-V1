import { spawnSync } from 'node:child_process'
import { pathToFileURL } from 'node:url'
import {
  getProjectProfile,
  isForbiddenPath,
  isRawLocalPath,
  isRuntimeArtifactPath,
  type ProjectProfile,
} from '../project-profiles/project-profile-loader'

export type PromotionDecision = 'MERGE_READY' | 'NEEDS_FIX' | 'DO_NOT_MERGE' | 'NEEDS_TOM_WAIVER'
export type PromotionSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info'
export type PromotionPathCategory =
  | 'code'
  | 'docs'
  | 'tests'
  | 'workorders'
  | 'migrations'
  | 'project_outputs'
  | 'runtime_artifact'
  | 'raw_local_data'
  | 'unknown'

export interface PromotionFinding {
  id: string
  severity: PromotionSeverity
  layer: string
  file?: string
  message: string
  evidence: string
  suggested_action: string
  blocks_merge: boolean
  requires_tom: boolean
}

export interface PromotionChangedFile {
  status: string
  path: string
  category: PromotionPathCategory
}

export interface PromotionRequiredCheck {
  id: string
  command: string
  reason: string
  status: 'required' | 'recommended' | 'passed' | 'failed' | 'not_run'
  output?: string
}

export interface PromotionReviewResult {
  schema_version: 1
  generated_at: string
  branch: string
  current_branch: string
  decision: PromotionDecision
  product_work_gate: {
    status: 'blocked'
    reason: string
  }
  git: {
    worktree_clean: boolean
    target_branch_exists: boolean
    main_exists: boolean
    ahead_of_main: number
    merge_conflict_risk: boolean
  }
  diff_stat: string
  changed_files: PromotionChangedFile[]
  required_checks: PromotionRequiredCheck[]
  summary: Record<PromotionSeverity, number>
  findings: PromotionFinding[]
  next_action: string
}

export interface PromotionActionResult {
  success: boolean
  action: 'merge' | 'push'
  review?: PromotionReviewResult
  findings: PromotionFinding[]
  commands: string[]
  output: string
  next_action: string
}

export interface PromotionCommandResult {
  code: number
  stdout: string
  stderr: string
}

export type PromotionCommandRunner = (args: string[]) => PromotionCommandResult

interface PromotionOptions {
  repoRoot?: string
  runner?: PromotionCommandRunner
  runChecks?: boolean
  generatedAt?: string
  projectId?: string
}

const TSX = 'cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs'
const PRODUCT_GATE_REASON = 'Product work remains blocked until promotion governance is complete and Tom explicitly opens or waives the gate.'

function defaultRunner(repoRoot: string): PromotionCommandRunner {
  return (args) => {
    const result = spawnSync('git', args, {
      cwd: repoRoot,
      encoding: 'utf8',
      shell: false,
    })
    return { code: result.status ?? 1, stdout: result.stdout ?? '', stderr: result.stderr ?? '' }
  }
}

function commandRunner(repoRoot: string, command: string): PromotionCommandResult {
  const result = spawnSync(command, { cwd: repoRoot, encoding: 'utf8', shell: true })
  return { code: result.status ?? 1, stdout: result.stdout ?? '', stderr: result.stderr ?? '' }
}

function finding(params: PromotionFinding): PromotionFinding {
  return params
}

function trim(value: string): string {
  return value.trim()
}

function toPosix(value: string): string {
  return value.replace(/\\/g, '/')
}

export function classifyPromotionPath(filePath: string, profile?: ProjectProfile): PromotionPathCategory {
  const p = toPosix(filePath)
  if (profile && isRuntimeArtifactPath(profile, p)) return 'runtime_artifact'
  if (profile && isRawLocalPath(profile, p)) return 'raw_local_data'
  if (
    p === 'system/state/runtime_state.json' ||
    p === 'system/approval/queue.json' ||
    p === 'system/approval/approvals.json' ||
    p.startsWith('system/state/') ||
    /^system\/state\/.*\.lock$/.test(p)
  ) return 'runtime_artifact'
  if (p === '.env' || p.startsWith('.env.')) return 'runtime_artifact'
  if (p.startsWith('docs/specs/Nutrition/00_raw/')) return 'raw_local_data'
  if (p.startsWith('system/workorders/')) return 'workorders'
  if (p.startsWith('supabase/migrations/') && p.endsWith('.sql')) return 'migrations'
  if (p.includes('/__tests__/') || p.endsWith('.test.ts')) return 'tests'
  if (p.startsWith('docs/')) return 'docs'
  if (p.startsWith('packages/types/') || p.startsWith('docs/specs/')) return 'project_outputs'
  if (p.startsWith('system/') || p.startsWith('services/') || p.startsWith('apps/') || p.startsWith('packages/')) return 'code'
  return 'unknown'
}

function isProductWork(filePath: string, profile?: ProjectProfile): boolean {
  const p = toPosix(filePath)
  if (isGovernanceToolingPath(p)) return false
  if (profile && isForbiddenPath(profile, p) && !isRuntimeArtifactPath(profile, p) && !isRawLocalPath(profile, p)) return true
  if (p.startsWith('services/nutrition-api/') || p.startsWith('apps/') || p.startsWith('packages/')) return true
  if (p.startsWith('docs/specs/Nutrition/') && !p.includes('/06_workorder_planning/')) return true
  return false
}

function isGovernanceToolingPath(filePath: string): boolean {
  const p = toPosix(filePath)
  return (
    p.startsWith('apps/web/src/app/governance/') ||
    p.startsWith('apps/web/src/app/api/governance/') ||
    p.startsWith('apps/web/src/components/governance/') ||
    p.startsWith('apps/web/src/lib/governance/') ||
    p === 'apps/web/next.config.js' ||
    p === 'apps/web/next.config.ts' ||
    p === 'apps/web/postcss.config.js' ||
    p === 'apps/web/next-env.d.ts' ||
    p === 'apps/web/tsconfig.json' ||
    p === 'apps/web/src/app/globals.css'
  )
}

function parseNameStatus(output: string, profile?: ProjectProfile): PromotionChangedFile[] {
  return output.split(/\r?\n/)
    .filter(Boolean)
    .map(line => {
      const [status, ...rest] = line.split(/\t/)
      const filePath = rest[rest.length - 1] ?? ''
      return { status, path: filePath, category: classifyPromotionPath(filePath, profile) }
    })
}

function countBySeverity(findings: PromotionFinding[]): Record<PromotionSeverity, number> {
  return {
    critical: findings.filter(item => item.severity === 'critical').length,
    high: findings.filter(item => item.severity === 'high').length,
    medium: findings.filter(item => item.severity === 'medium').length,
    low: findings.filter(item => item.severity === 'low').length,
    info: findings.filter(item => item.severity === 'info').length,
  }
}

function checkCommand(id: string, command: string, reason: string): PromotionRequiredCheck {
  return { id, command, reason, status: 'recommended' }
}

function requiredChecks(changedFiles: PromotionChangedFile[]): PromotionRequiredCheck[] {
  const checks = [
    checkCommand('typecheck', 'cmd.exe /c node node_modules\\typescript\\bin\\tsc --noEmit', 'TypeScript must pass before merge.'),
    checkCommand('governance_invariant', `${TSX} system\\control-plane\\governance-invariant-check.ts`, 'Runtime drift must be clean before promotion.'),
    checkCommand('agent_contract', `${TSX} system\\control-plane\\agent-contract-check.ts`, 'Agent and skill contracts must not have critical/high drift.'),
  ]
  if (changedFiles.some(item => item.category === 'workorders')) {
    checks.push(checkCommand('spec_source_chain', `${TSX} system\\workorders\\cli\\spec-source-chain-check.ts --batch <changed-batch-file>`, 'Changed workorders/batches must pass source-chain validation.'))
    checks.push(checkCommand('batch_dossier', `${TSX} system\\reports\\batch-dossier.ts --batch <changed-batch-file>`, 'Changed workorder batches should have a dossier before promotion.'))
  }
  if (changedFiles.some(item => item.category === 'migrations')) {
    checks.push(checkCommand('migration_guard', 'migration static guard for changed supabase/migrations/*.sql', 'Changed migrations must pass static migration guard.'))
  }
  return checks
}

function addForbiddenArtifactFindings(findings: PromotionFinding[], changedFiles: PromotionChangedFile[]): void {
  for (const item of changedFiles) {
    if (item.category === 'runtime_artifact') {
      findings.push(finding({
        id: 'artifact.runtime',
        severity: 'critical',
        layer: 'runtime_artifact_policy',
        file: item.path,
        message: 'Runtime or secret artifact is present in the branch diff.',
        evidence: `${item.status}\t${item.path}`,
        suggested_action: 'Remove runtime/secret artifact from the branch; do not commit runtime state.',
        blocks_merge: true,
        requires_tom: false,
      }))
    }
    if (item.category === 'raw_local_data') {
      findings.push(finding({
        id: 'artifact.raw_local_data',
        severity: 'critical',
        layer: 'raw_data_policy',
        file: item.path,
        message: 'Raw BLS/local data is present in the branch diff.',
        evidence: `${item.status}\t${item.path}`,
        suggested_action: 'Keep raw BLS files local and ignored; remove them from the branch.',
        blocks_merge: true,
        requires_tom: false,
      }))
    }
  }
}

function runOptionalChecks(repoRoot: string, checks: PromotionRequiredCheck[]): PromotionRequiredCheck[] {
  return checks.map(check => {
    if (check.command.includes('<changed-batch-file>') || check.id === 'migration_guard') {
      return { ...check, status: 'not_run' }
    }
    const result = commandRunner(repoRoot, check.command)
    return {
      ...check,
      status: result.code === 0 ? 'passed' : 'failed',
      output: `${result.stdout}${result.stderr}`.trim(),
    }
  })
}

function decide(findings: PromotionFinding[], checks: PromotionRequiredCheck[]): PromotionDecision {
  if (findings.some(item => item.blocks_merge && item.severity === 'critical')) return 'DO_NOT_MERGE'
  if (findings.some(item => item.requires_tom)) return 'NEEDS_TOM_WAIVER'
  if (checks.some(item => item.status === 'failed')) return 'NEEDS_FIX'
  if (findings.some(item => item.blocks_merge)) return 'NEEDS_FIX'
  return 'MERGE_READY'
}

function nextAction(decision: PromotionDecision, branch: string): string {
  if (decision === 'MERGE_READY') return `${TSX} system\\control-plane\\promotion-governance.ts --merge-branch ${branch}`
  if (decision === 'NEEDS_TOM_WAIVER') return 'Tom must explicitly waive the closed product work gate before merge.'
  if (decision === 'DO_NOT_MERGE') return 'Remove blocking artifacts or unsafe changes, then rerun promotion review.'
  return 'Fix failed checks or findings, then rerun promotion review.'
}

export function reviewBranch(branch: string, options: PromotionOptions = {}): PromotionReviewResult {
  const repoRoot = options.repoRoot ?? process.cwd()
  const profile = options.projectId ? getProjectProfile(options.projectId, { repoRoot }) : undefined
  const runner = options.runner ?? defaultRunner(repoRoot)
  const findings: PromotionFinding[] = []

  const currentBranch = trim(runner(['rev-parse', '--abbrev-ref', 'HEAD']).stdout)
  const status = runner(['status', '--short'])
  const worktreeClean = trim(status.stdout) === ''
  if (!worktreeClean) {
    findings.push(finding({
      id: 'git.dirty_worktree',
      severity: 'critical',
      layer: 'git',
      message: 'Worktree is dirty.',
      evidence: status.stdout.trim(),
      suggested_action: 'Commit or clean intended changes before promotion review.',
      blocks_merge: true,
      requires_tom: false,
    }))
  }

  const mainExists = runner(['show-ref', '--verify', '--quiet', 'refs/heads/main']).code === 0
  const targetExists = runner(['show-ref', '--verify', '--quiet', `refs/heads/${branch}`]).code === 0
  if (!mainExists) {
    findings.push(finding({
      id: 'git.main_missing',
      severity: 'critical',
      layer: 'git',
      message: 'Local main branch is missing.',
      evidence: 'refs/heads/main not found',
      suggested_action: 'Create or fetch main before promotion.',
      blocks_merge: true,
      requires_tom: false,
    }))
  }
  if (!targetExists) {
    findings.push(finding({
      id: 'git.target_missing',
      severity: 'critical',
      layer: 'git',
      message: 'Target branch is missing.',
      evidence: `refs/heads/${branch} not found`,
      suggested_action: 'Check the branch name or fetch the branch.',
      blocks_merge: true,
      requires_tom: false,
    }))
  }

  const ahead = parseInt(trim(runner(['rev-list', '--count', `main..${branch}`]).stdout) || '0', 10)
  if (targetExists && mainExists && ahead <= 0) {
    findings.push(finding({
      id: 'git.branch_not_ahead',
      severity: 'high',
      layer: 'git',
      message: 'Target branch has no commits ahead of main.',
      evidence: `main..${branch} count=${ahead}`,
      suggested_action: 'Confirm the correct target branch.',
      blocks_merge: true,
      requires_tom: false,
    }))
  }

  const ancestor = runner(['merge-base', '--is-ancestor', branch, 'main'])
  const mergeTree = runner(['merge-tree', 'main', branch])
  const conflictRisk = /<<<<<<<|changed in both|CONFLICT/i.test(`${mergeTree.stdout}\n${mergeTree.stderr}`) || ancestor.code === 0
  if (conflictRisk && ahead > 0) {
    findings.push(finding({
      id: 'git.conflict_risk',
      severity: 'high',
      layer: 'git',
      message: 'Potential merge conflict or already-merged branch detected.',
      evidence: mergeTree.stdout.slice(0, 500),
      suggested_action: 'Inspect merge status manually; do not auto-resolve conflicts.',
      blocks_merge: true,
      requires_tom: false,
    }))
  }

  const diffName = runner(['diff', '--name-status', `main..${branch}`])
  const changedFiles = parseNameStatus(diffName.stdout, profile)
  const diffStat = runner(['diff', '--stat', `main..${branch}`]).stdout.trim()
  addForbiddenArtifactFindings(findings, changedFiles)

  if (changedFiles.some(item => isProductWork(item.path, profile))) {
    findings.push(finding({
      id: 'product.gate_closed',
      severity: 'high',
      layer: 'product_work_gate',
      message: 'Branch contains product work while the product work gate is closed.',
      evidence: changedFiles.filter(item => isProductWork(item.path, profile)).map(item => item.path).join(', '),
      suggested_action: 'Get an explicit Tom waiver or defer product work.',
      blocks_merge: true,
      requires_tom: true,
    }))
  }

  let checks = requiredChecks(changedFiles)
  if (options.runChecks) checks = runOptionalChecks(repoRoot, checks)
  const decision = decide(findings, checks)

  return {
    schema_version: 1,
    generated_at: options.generatedAt ?? new Date().toISOString(),
    branch,
    current_branch: currentBranch,
    decision,
    product_work_gate: { status: 'blocked', reason: profile?.product_gate.reason ?? PRODUCT_GATE_REASON },
    git: {
      worktree_clean: worktreeClean,
      target_branch_exists: targetExists,
      main_exists: mainExists,
      ahead_of_main: Number.isFinite(ahead) ? ahead : 0,
      merge_conflict_risk: conflictRisk,
    },
    diff_stat: diffStat,
    changed_files: changedFiles,
    required_checks: checks,
    summary: countBySeverity(findings),
    findings,
    next_action: nextAction(decision, branch),
  }
}

export function promoteMergeBranch(branch: string, options: PromotionOptions = {}): PromotionActionResult {
  const repoRoot = options.repoRoot ?? process.cwd()
  const runner = options.runner ?? defaultRunner(repoRoot)
  const review = reviewBranch(branch, { ...options, repoRoot, runner })
  const commands: string[] = []
  const findings: PromotionFinding[] = []
  if (review.decision !== 'MERGE_READY') {
    return {
      success: false,
      action: 'merge',
      review,
      findings: review.findings,
      commands,
      output: 'Merge refused because review is not MERGE_READY.',
      next_action: review.next_action,
    }
  }

  for (const args of [
    ['switch', 'main'],
    ['merge', branch],
  ]) {
    commands.push(args.join(' '))
    const result = runner(args)
    if (result.code !== 0) {
      findings.push(finding({
        id: args[0] === 'merge' ? 'merge.failed_or_conflicted' : 'merge.switch_main_failed',
        severity: 'critical',
        layer: 'git',
        message: 'Promotion merge command failed.',
        evidence: `${result.stdout}${result.stderr}`.trim(),
        suggested_action: 'Stop and inspect conflicts or git state manually.',
        blocks_merge: true,
        requires_tom: false,
      }))
      return {
        success: false,
        action: 'merge',
        review,
        findings,
        commands,
        output: `${result.stdout}${result.stderr}`.trim(),
        next_action: 'Resolve git conflict/state manually; do not auto-resolve.',
      }
    }
  }

  const tsc = commandRunner(repoRoot, 'cmd.exe /c node node_modules\\typescript\\bin\\tsc --noEmit')
  commands.push('cmd.exe /c node node_modules\\typescript\\bin\\tsc --noEmit')
  if (tsc.code !== 0) {
    findings.push(finding({
      id: 'post_merge.typecheck_failed',
      severity: 'critical',
      layer: 'validation',
      message: 'Typecheck failed after merge.',
      evidence: `${tsc.stdout}${tsc.stderr}`.trim(),
      suggested_action: 'Fix typecheck on main before push.',
      blocks_merge: true,
      requires_tom: false,
    }))
    return {
      success: false,
      action: 'merge',
      review,
      findings,
      commands,
      output: `${tsc.stdout}${tsc.stderr}`.trim(),
      next_action: 'Fix post-merge typecheck failure before push.',
    }
  }

  return {
    success: true,
    action: 'merge',
    review,
    findings: [],
    commands,
    output: 'Merge completed and typecheck passed.',
    next_action: `${TSX} system\\control-plane\\promotion-governance.ts --push-main`,
  }
}

export function pushMain(options: PromotionOptions = {}): PromotionActionResult {
  const repoRoot = options.repoRoot ?? process.cwd()
  const runner = options.runner ?? defaultRunner(repoRoot)
  const findings: PromotionFinding[] = []
  const commands: string[] = []
  const currentBranch = trim(runner(['rev-parse', '--abbrev-ref', 'HEAD']).stdout)
  const status = runner(['status', '--short'])
  const ahead = parseInt(trim(runner(['rev-list', '--count', 'origin/main..main']).stdout) || '0', 10)

  if (currentBranch !== 'main') {
    findings.push(finding({
      id: 'push.not_main',
      severity: 'critical',
      layer: 'git',
      message: 'Push refused because current branch is not main.',
      evidence: currentBranch,
      suggested_action: 'Switch to main before pushing.',
      blocks_merge: true,
      requires_tom: false,
    }))
  }
  if (trim(status.stdout) !== '') {
    findings.push(finding({
      id: 'push.dirty_worktree',
      severity: 'critical',
      layer: 'git',
      message: 'Push refused because worktree is dirty.',
      evidence: status.stdout.trim(),
      suggested_action: 'Clean or commit changes before pushing.',
      blocks_merge: true,
      requires_tom: false,
    }))
  }
  if (!Number.isFinite(ahead) || ahead <= 0) {
    findings.push(finding({
      id: 'push.not_ahead',
      severity: 'high',
      layer: 'git',
      message: 'Push refused because main is not ahead of origin/main.',
      evidence: `origin/main..main count=${ahead}`,
      suggested_action: 'Confirm there is a merge commit to push.',
      blocks_merge: true,
      requires_tom: false,
    }))
  }
  if (findings.length > 0) {
    return { success: false, action: 'push', findings, commands, output: 'Push refused.', next_action: 'Fix push readiness findings and rerun --push-main.' }
  }

  commands.push('push origin main')
  const push = runner(['push', 'origin', 'main'])
  if (push.code !== 0) {
    findings.push(finding({
      id: 'push.failed',
      severity: 'critical',
      layer: 'git',
      message: 'git push origin main failed.',
      evidence: `${push.stdout}${push.stderr}`.trim(),
      suggested_action: 'Inspect git remote/auth/network state.',
      blocks_merge: true,
      requires_tom: false,
    }))
  }
  return {
    success: findings.length === 0,
    action: 'push',
    findings,
    commands,
    output: `${push.stdout}${push.stderr}`.trim() || 'Push completed.',
    next_action: findings.length === 0 ? 'Start Governance Batch 008 - Operator Doctor / Autonomy Hardening.' : 'Fix push failure and rerun --push-main.',
  }
}

function formatFindings(findings: PromotionFinding[]): string[] {
  if (findings.length === 0) return ['  (none)']
  return findings.map(item => `- [${item.severity}] ${item.id}: ${item.message}${item.file ? ` (${item.file})` : ''}`)
}

export function formatPromotionReview(result: PromotionReviewResult): string {
  return [
    '# Promotion Governance Review',
    `Branch: ${result.branch}`,
    `Current branch: ${result.current_branch}`,
    `Decision: ${result.decision}`,
    '',
    '## Git',
    `worktree_clean: ${result.git.worktree_clean}`,
    `target_branch_exists: ${result.git.target_branch_exists}`,
    `main_exists: ${result.git.main_exists}`,
    `ahead_of_main: ${result.git.ahead_of_main}`,
    `merge_conflict_risk: ${result.git.merge_conflict_risk}`,
    '',
    '## Changed Files',
    ...(result.changed_files.length === 0 ? ['  (none)'] : result.changed_files.map(item => `- ${item.status} ${item.path} [${item.category}]`)),
    '',
    '## Required Checks',
    ...result.required_checks.map(item => `- ${item.id}: ${item.status} - ${item.command}`),
    '',
    '## Findings',
    ...formatFindings(result.findings),
    '',
    '## Exact Next Action',
    result.next_action,
  ].join('\n')
}

export function formatPromotionAction(result: PromotionActionResult): string {
  return [
    `# Promotion Governance ${result.action === 'merge' ? 'Merge' : 'Push'}`,
    `success: ${result.success}`,
    '',
    '## Commands',
    ...(result.commands.length === 0 ? ['  (none)'] : result.commands.map(item => `- git ${item}`)),
    '',
    '## Output',
    result.output || '(none)',
    '',
    '## Findings',
    ...formatFindings(result.findings),
    '',
    '## Exact Next Action',
    result.next_action,
  ].join('\n')
}

function parseArgs(argv: string[]): { mode?: 'review' | 'merge' | 'push'; branch?: string; json: boolean; runChecks: boolean; projectId?: string } {
  const json = argv.includes('--json')
  const runChecks = argv.includes('--run-checks')
  const projectIndex = argv.indexOf('--project')
  const projectId = projectIndex !== -1 ? argv[projectIndex + 1] : undefined
  const reviewIndex = argv.indexOf('--review-branch')
  const mergeIndex = argv.indexOf('--merge-branch')
  if (reviewIndex !== -1) return { mode: 'review', branch: argv[reviewIndex + 1], json, runChecks, projectId }
  if (mergeIndex !== -1) return { mode: 'merge', branch: argv[mergeIndex + 1], json, runChecks: false, projectId }
  if (argv.includes('--push-main')) return { mode: 'push', json, runChecks, projectId }
  return { json, runChecks, projectId }
}

function main(): number {
  const args = parseArgs(process.argv.slice(2))
  if (args.mode === 'review' && args.branch) {
    const result = reviewBranch(args.branch, { runChecks: args.runChecks, projectId: args.projectId })
    console.log(args.json ? JSON.stringify(result, null, 2) : formatPromotionReview(result))
    return result.decision === 'MERGE_READY' ? 0 : 1
  }
  if (args.mode === 'merge' && args.branch) {
    const result = promoteMergeBranch(args.branch, { runChecks: true, projectId: args.projectId })
    console.log(args.json ? JSON.stringify(result, null, 2) : formatPromotionAction(result))
    return result.success ? 0 : 1
  }
  if (args.mode === 'push') {
    const result = pushMain()
    console.log(args.json ? JSON.stringify(result, null, 2) : formatPromotionAction(result))
    return result.success ? 0 : 1
  }
  console.error([
    'Usage:',
    `${TSX} system\\control-plane\\promotion-governance.ts --review-branch <branch> [--json] [--run-checks]`,
    `${TSX} system\\control-plane\\promotion-governance.ts --merge-branch <branch> [--json]`,
    `${TSX} system\\control-plane\\promotion-governance.ts --push-main [--json]`,
  ].join('\n'))
  return 2
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  process.exitCode = main()
}
