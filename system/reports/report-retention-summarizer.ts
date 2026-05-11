import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { pathToFileURL } from 'node:url'

export type ReportCategory =
  | 'codex_worker_report'
  | 'runtime_history'
  | 'browser_smoke_artifact'
  | 'batch_dossier'
  | 'learning_draft'
  | 'transient_cli_output'
  | 'unknown'

export type SensitiveFlag =
  | 'absolute_path'
  | 'command_transcript'
  | 'email'
  | 'long_prompt'
  | 'raw_output'
  | 'secret_like'

export interface ReportRetentionSummaryItem {
  path: string
  file_type: string
  size_bytes: number
  modified_at: string
  category: ReportCategory
  likely_sensitive_flags: SensitiveFlag[]
  recommended_action: string
  ignored_by_policy: boolean
  appears_tracked: boolean
  contains_body: false
}

export interface ReportRetentionSummary {
  schema_version: 1
  generated_at: string
  repo_root: string
  summary: {
    total_files: number
    ignored_local_files: number
    tracked_policy_violations: number
    likely_sensitive_files: number
  }
  reports: ReportRetentionSummaryItem[]
  cleanup_guidance: {
    default_mode: 'dry-run'
    apply_supported: false
    allowed_roots: string[]
    protected_roots: string[]
  }
  exitCode: 0 | 1 | 2
}

export interface RedactionResult {
  redacted: string
  flags: SensitiveFlag[]
}

export interface CleanupPlan {
  mode: 'dry-run'
  delete_candidates: string[]
  protected_paths: string[]
  note: string
}

interface SummaryOptions {
  repoRoot?: string
  generatedAt?: string
  trackedFiles?: string[]
}

const IGNORED_SCAN_ROOTS = [
  'system/reports/codex-worker',
  'system/reports/model-runtime-history',
  'tmp/governance-ui-browser-smoke',
]

const PROTECTED_ROOTS = [
  'docs/project',
  'docs/project/governance-learning',
  'system/memory/canonical',
]

const SECRET_RE = /\b(?:[A-Z0-9_]*(?:API[_-]?KEY|TOKEN|SECRET|PASSWORD)[A-Z0-9_]*\s*=\s*[^\s]+|Bearer\s+[A-Za-z0-9._~+/=-]{20,}|sk-[A-Za-z0-9_-]{12,})\b/g
const EMAIL_RE = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi
const WINDOWS_ABSOLUTE_RE = /[A-Za-z]:\\[^\r\n"'`<>]+/g
const POSIX_ABSOLUTE_RE = /\/(?:Users|home|mnt|tmp|var|opt)\/[^\r\n"'`<>]+/g

function now(): string {
  return new Date().toISOString()
}

function toPosix(value: string): string {
  return value.replace(/\\/g, '/')
}

function walkFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return []
  const output: string[] = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) output.push(...walkFiles(fullPath))
    else output.push(fullPath)
  }
  return output.sort()
}

function readSample(filePath: string): string {
  const handle = fs.openSync(filePath, 'r')
  try {
    const buffer = Buffer.alloc(8192)
    const bytes = fs.readSync(handle, buffer, 0, buffer.length, 0)
    return buffer.subarray(0, bytes).toString('utf8')
  } finally {
    fs.closeSync(handle)
  }
}

function categoryFor(relativePath: string): ReportCategory {
  const normalized = toPosix(relativePath)
  if (normalized.startsWith('system/reports/codex-worker/')) return 'codex_worker_report'
  if (normalized.startsWith('system/reports/model-runtime-history/')) return 'runtime_history'
  if (normalized.startsWith('tmp/governance-ui-browser-smoke/')) return 'browser_smoke_artifact'
  if (normalized.startsWith('system/reports/dossiers/')) return 'batch_dossier'
  if (normalized.startsWith('docs/project/governance-learning/drafts/')) return 'learning_draft'
  if (normalized.startsWith('tmp/') || normalized.endsWith('.log')) return 'transient_cli_output'
  return 'unknown'
}

function isIgnoredByPolicy(category: ReportCategory): boolean {
  return category === 'codex_worker_report' ||
    category === 'runtime_history' ||
    category === 'browser_smoke_artifact' ||
    category === 'transient_cli_output'
}

function recommendedAction(item: { ignored: boolean; tracked: boolean; category: ReportCategory }): string {
  if (item.ignored && item.tracked) return 'unstage_or_remove_from_git'
  if (item.ignored) return 'retain_local_or_delete_manually'
  if (item.category === 'batch_dossier') return 'review_before_commit'
  if (item.category === 'learning_draft') return 'review_and_promote_or_delete'
  return 'review_policy'
}

function detectFlags(sample: string): SensitiveFlag[] {
  const flags = new Set<SensitiveFlag>()
  if (SECRET_RE.test(sample)) flags.add('secret_like')
  SECRET_RE.lastIndex = 0
  if (EMAIL_RE.test(sample)) flags.add('email')
  EMAIL_RE.lastIndex = 0
  if (WINDOWS_ABSOLUTE_RE.test(sample) || POSIX_ABSOLUTE_RE.test(sample)) flags.add('absolute_path')
  WINDOWS_ABSOLUTE_RE.lastIndex = 0
  POSIX_ABSOLUTE_RE.lastIndex = 0
  if (/##\s*(Prompt|Generated Prompt)|PROMPT|SOURCE REFERENCES/i.test(sample) && sample.length > 1200) flags.add('long_prompt')
  if (/##\s*(Stdout|Stderr|Command|Transcript)|exit code|cmd\.exe|powershell/i.test(sample)) flags.add('command_transcript')
  if (/##\s*(Raw Output|Output|Logs)|```[\s\S]{1000,}/i.test(sample)) flags.add('raw_output')
  return [...flags].sort()
}

export function redactReportContent(content: string, options: { repoRoot?: string } = {}): RedactionResult {
  const flags = detectFlags(content)
  let redacted = content
  if (options.repoRoot) {
    const escapedRoot = options.repoRoot.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    redacted = redacted.replace(new RegExp(`${escapedRoot}[^\\r\\n"'\\\`<>]*`, 'gi'), '[REDACTED_LOCAL_PATH]')
  }
  redacted = redacted
    .replace(SECRET_RE, '[REDACTED_SECRET]')
    .replace(EMAIL_RE, '[REDACTED_EMAIL]')
    .replace(WINDOWS_ABSOLUTE_RE, '[REDACTED_LOCAL_PATH]')
    .replace(POSIX_ABSOLUTE_RE, '[REDACTED_LOCAL_PATH]')
    .replace(/(##\s*(?:Prompt|Generated Prompt|Stdout|Stderr|Raw Output|Transcript)[\s\S]*?)(?=\n##\s|\n#\s|$)/gi, (_match, header) => {
      const firstLine = String(header).split(/\r?\n/)[0]
      return `${firstLine}\n[REDACTED_LARGE_BLOCK]`
    })
  return {
    redacted,
    flags: [...new Set([...flags, ...detectFlags(redacted)])].filter(flag => flags.includes(flag)).sort(),
  }
}

function trackedFilesFromGit(repoRoot: string): string[] {
  const result = spawnSync('git', ['ls-files'], { cwd: repoRoot, encoding: 'utf8' })
  if (result.status !== 0) return []
  return result.stdout.split(/\r?\n/).filter(Boolean).map(toPosix)
}

function itemForFile(repoRoot: string, filePath: string, tracked: Set<string>): ReportRetentionSummaryItem {
  const relativePath = toPosix(path.relative(repoRoot, filePath))
  const stat = fs.statSync(filePath)
  const category = categoryFor(relativePath)
  const ignored = isIgnoredByPolicy(category)
  const appearsTracked = tracked.has(relativePath)
  const sample = readSample(filePath)
  return {
    path: relativePath,
    file_type: path.extname(filePath).replace(/^\./, '') || 'unknown',
    size_bytes: stat.size,
    modified_at: stat.mtime.toISOString(),
    category,
    likely_sensitive_flags: detectFlags(sample),
    recommended_action: recommendedAction({ ignored, tracked: appearsTracked, category }),
    ignored_by_policy: ignored,
    appears_tracked: appearsTracked,
    contains_body: false,
  }
}

export function runReportRetentionSummary(options: SummaryOptions = {}): ReportRetentionSummary {
  const repoRoot = path.resolve(options.repoRoot ?? process.cwd())
  const tracked = new Set((options.trackedFiles ?? trackedFilesFromGit(repoRoot)).map(toPosix))
  const reports = IGNORED_SCAN_ROOTS
    .flatMap(root => walkFiles(path.join(repoRoot, root)))
    .map(filePath => itemForFile(repoRoot, filePath, tracked))
    .sort((a, b) => a.path.localeCompare(b.path))
  const trackedViolations = reports.filter(item => item.ignored_by_policy && item.appears_tracked).length
  return {
    schema_version: 1,
    generated_at: options.generatedAt ?? now(),
    repo_root: repoRoot,
    summary: {
      total_files: reports.length,
      ignored_local_files: reports.filter(item => item.ignored_by_policy).length,
      tracked_policy_violations: trackedViolations,
      likely_sensitive_files: reports.filter(item => item.likely_sensitive_flags.length > 0).length,
    },
    reports,
    cleanup_guidance: {
      default_mode: 'dry-run',
      apply_supported: false,
      allowed_roots: IGNORED_SCAN_ROOTS,
      protected_roots: PROTECTED_ROOTS,
    },
    exitCode: trackedViolations > 0 ? 1 : 0,
  }
}

export function buildReportCleanupPlan(options: { repoRoot?: string } = {}): CleanupPlan {
  const repoRoot = path.resolve(options.repoRoot ?? process.cwd())
  const summary = runReportRetentionSummary({ repoRoot })
  const protectedPaths = [
    'docs/project/CURRENT_GOVERNANCE_HANDOVER.md',
    'docs/project/GOVERNANCE_TODO_REGISTER.json',
    ...walkFiles(path.join(repoRoot, 'docs/project/governance-learning'))
      .filter(filePath => !toPosix(path.relative(repoRoot, filePath)).includes('/drafts/'))
      .map(filePath => toPosix(path.relative(repoRoot, filePath))),
  ].sort()
  return {
    mode: 'dry-run',
    delete_candidates: summary.reports
      .filter(item => item.ignored_by_policy && !item.appears_tracked)
      .map(item => item.path),
    protected_paths: protectedPaths,
    note: 'Dry-run only. Delete candidates are local ignored artifacts and must be removed manually if Tom chooses.',
  }
}

function argAfter(args: string[], flag: string): string | undefined {
  const index = args.indexOf(flag)
  return index === -1 ? undefined : args[index + 1]
}

function formatReport(summary: ReportRetentionSummary, cleanup: CleanupPlan | null): string {
  const lines = [
    '# Governance Report Retention Summary',
    '',
    `Repo: ${summary.repo_root}`,
    `Generated: ${summary.generated_at}`,
    `Files: ${summary.summary.total_files}`,
    `Ignored local: ${summary.summary.ignored_local_files}`,
    `Tracked policy violations: ${summary.summary.tracked_policy_violations}`,
    `Likely sensitive: ${summary.summary.likely_sensitive_files}`,
    '',
  ]
  for (const item of summary.reports) {
    lines.push(`- ${item.path}`)
    lines.push(`  category=${item.category} size=${item.size_bytes} ignored=${item.ignored_by_policy} tracked=${item.appears_tracked}`)
    lines.push(`  flags=${item.likely_sensitive_flags.join(',') || 'none'} action=${item.recommended_action}`)
  }
  if (cleanup) {
    lines.push('', '## Cleanup Dry Run')
    lines.push(...cleanup.delete_candidates.map(item => `- ${item}`))
    lines.push('', cleanup.note)
  }
  return lines.join('\n')
}

function main(): number {
  const args = process.argv.slice(2)
  const json = args.includes('--json')
  const cleanupDryRun = args.includes('--cleanup-dry-run')
  const repoRoot = argAfter(args, '--repo-root')
  try {
    const summary = runReportRetentionSummary({ repoRoot })
    const cleanup = cleanupDryRun ? buildReportCleanupPlan({ repoRoot }) : null
    if (json) console.log(JSON.stringify({ ...summary, cleanup_plan: cleanup ?? undefined }, null, 2))
    else console.log(formatReport(summary, cleanup))
    return summary.exitCode
  } catch (error) {
    if (json) {
      console.log(JSON.stringify({
        schema_version: 1,
        generated_at: now(),
        error: error instanceof Error ? error.message : String(error),
        exitCode: 2,
      }, null, 2))
    } else {
      console.error(`report-retention-summarizer error: ${error instanceof Error ? error.message : String(error)}`)
    }
    return 2
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  process.exitCode = main()
}
