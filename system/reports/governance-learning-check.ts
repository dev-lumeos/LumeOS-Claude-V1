import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { pathToFileURL } from 'node:url'
import { getProjectProfile, type ProjectProfile } from '../project-profiles/project-profile-loader'

export type LearningSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info'

export interface LearningFinding {
  id: string
  severity: LearningSeverity
  layer: string
  file: string
  message: string
  evidence: string
  suggested_action: string
  blocks_product_work: boolean
  blocks_operator: boolean
}

export interface IncidentLearningRecord {
  file: string
  incident_id: string
  date: string
  layer: string
  severity: string
  status: string
  root_cause: string
  trigger: string
  fix_commit: string
  fix_commit_note: string
  regression_test_file: string
  regression_test_missing_reason: string
  durable_rule_file: string
  durable_rule_text: string
  memory_update: string
  recurrence_detector: string
}

export interface LearningCheckResult {
  schema_version: 1
  generated_at: string
  repo_root: string
  project_profile?: {
    project_id: string
    display_name: string
    product_gate: ProjectProfile['product_gate']
  }
  product_work_gate: {
    status: 'blocked' | 'allowed'
    reason: string
  }
  summary: Record<LearningSeverity, number>
  incidents: IncidentLearningRecord[]
  open_incidents: string[]
  batch_summaries: string[]
  findings: LearningFinding[]
  exitCode: 0 | 1 | 2
}

const LEARNING_DIR = 'docs/project/governance-learning'
const HANDOVER = 'docs/project/CURRENT_GOVERNANCE_HANDOVER.md'
const README = `${LEARNING_DIR}/README.md`
const SCHEMA = `${LEARNING_DIR}/INCIDENT_LEARNING_SCHEMA.md`
const CHECKLIST = `${LEARNING_DIR}/INCIDENT_TO_REGRESSION_CHECKLIST.md`
const CANONICAL = 'system/memory/canonical/lumeos_canonical.md'
const STATUS_FILE = `${LEARNING_DIR}/CURRENT_LEARNING_STATUS.md`

function now(): string {
  return new Date().toISOString()
}

function toPosix(value: string): string {
  return value.replace(/\\/g, '/')
}

function rel(repoRoot: string, filePath: string): string {
  return toPosix(path.relative(repoRoot, path.resolve(repoRoot, filePath)))
}

function exists(repoRoot: string, relativePath: string): boolean {
  return fs.existsSync(path.join(repoRoot, relativePath))
}

function read(repoRoot: string, relativePath: string): string {
  const fullPath = path.join(repoRoot, relativePath)
  return fs.existsSync(fullPath) ? fs.readFileSync(fullPath, 'utf8') : ''
}

function finding(params: LearningFinding): LearningFinding {
  return params
}

function summarize(findings: LearningFinding[]): Record<LearningSeverity, number> {
  return {
    critical: findings.filter(item => item.severity === 'critical').length,
    high: findings.filter(item => item.severity === 'high').length,
    medium: findings.filter(item => item.severity === 'medium').length,
    low: findings.filter(item => item.severity === 'low').length,
    info: findings.filter(item => item.severity === 'info').length,
  }
}

function section(content: string, title: string): string {
  const escaped = title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = new RegExp(`## ${escaped}\\s*\\r?\\n([\\s\\S]*?)(?=\\r?\\n## |$)`, 'i').exec(content)
  return match ? match[1].trim() : ''
}

function metadataValue(content: string, key: string): string {
  const match = new RegExp(`^- ${key}:[ \\t]*(.*)$`, 'im').exec(content)
  return match ? match[1].trim().replace(/^`|`$/g, '') : ''
}

function bulletValue(block: string, key: string): string {
  const match = new RegExp(`^- ${key}:[ \\t]*(.*)$`, 'im').exec(block)
  return match ? match[1].trim().replace(/^`|`$/g, '') : ''
}

function firstCommit(value: string): string {
  const match = /[0-9a-f]{7,40}/i.exec(value)
  return match ? match[0] : ''
}

function commitExists(repoRoot: string, commit: string): boolean {
  if (!commit || /^(none|n\/a|not applicable|unknown)$/i.test(commit)) return true
  try {
    execFileSync('git', ['-C', repoRoot, 'cat-file', '-e', `${commit}^{commit}`], { stdio: 'ignore' })
    return true
  } catch {
    return false
  }
}

function hasMissingReason(record: IncidentLearningRecord): boolean {
  return /missing|not applicable|accepted|no regression|no test|open/i.test(record.regression_test_missing_reason)
}

function parseIncidentRecord(repoRoot: string, relativeFile: string): IncidentLearningRecord | null {
  const content = read(repoRoot, relativeFile)
  if (!/incident_id:/i.test(content)) return null
  const fix = section(content, 'Fix')
  const regression = section(content, 'Regression Test')
  const durable = section(content, 'Durable Rule')
  const memory = section(content, 'Memory Update')
  const recurrence = section(content, 'Recurrence Detector')
  return {
    file: relativeFile,
    incident_id: metadataValue(content, 'incident_id'),
    date: metadataValue(content, 'date'),
    layer: metadataValue(content, 'layer'),
    severity: metadataValue(content, 'severity'),
    status: metadataValue(content, 'status'),
    root_cause: section(content, 'Root Cause'),
    trigger: section(content, 'Trigger'),
    fix_commit: firstCommit(bulletValue(fix, 'commit')),
    fix_commit_note: bulletValue(fix, 'commit'),
    regression_test_file: bulletValue(regression, 'test_file'),
    regression_test_missing_reason: regression,
    durable_rule_file: bulletValue(durable, 'rule_file'),
    durable_rule_text: bulletValue(durable, 'rule_text'),
    memory_update: memory,
    recurrence_detector: recurrence,
  }
}

function listLearningFiles(repoRoot: string): string[] {
  const dir = path.join(repoRoot, LEARNING_DIR)
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir)
    .filter(name => name.endsWith('.md'))
    .map(name => `${LEARNING_DIR}/${name}`)
    .sort()
}

function isIncidentCandidate(relativeFile: string): boolean {
  const name = path.basename(relativeFile)
  return !['README.md', 'INCIDENT_LEARNING_SCHEMA.md', 'INCIDENT_TO_REGRESSION_CHECKLIST.md', 'CURRENT_LEARNING_STATUS.md'].includes(name)
    && !/summary|cleanup/i.test(name)
}

function validateRequiredDocs(repoRoot: string): LearningFinding[] {
  const findings: LearningFinding[] = []
  for (const file of [HANDOVER, README, SCHEMA, CHECKLIST]) {
    if (!exists(repoRoot, file)) {
      findings.push(finding({
        id: `required.${path.basename(file).toLowerCase().replace(/[^a-z0-9]+/g, '_')}_missing`,
        severity: file === HANDOVER || file === SCHEMA ? 'critical' : 'high',
        layer: 'memory_learning',
        file,
        message: 'Required governance learning file is missing.',
        evidence: file,
        suggested_action: `Create ${file}.`,
        blocks_product_work: true,
        blocks_operator: file === HANDOVER || file === SCHEMA,
      }))
    }
  }
  return findings
}

function validateHandoverAndCanonical(repoRoot: string): LearningFinding[] {
  const findings: LearningFinding[] = []
  const handover = read(repoRoot, HANDOVER)
  const canonical = read(repoRoot, CANONICAL)

  if (handover && !/Current date:\s*2026-05-05/i.test(handover)) {
    findings.push(finding({
      id: 'handover.current_date_missing',
      severity: 'low',
      layer: 'memory_learning',
      file: HANDOVER,
      message: 'Current handover does not state the current date.',
      evidence: 'Current date missing or stale.',
      suggested_action: 'Update CURRENT_GOVERNANCE_HANDOVER.md with the current date.',
      blocks_product_work: false,
      blocks_operator: false,
    }))
  }
  if (handover && !/Product Work Gate|product work .*blocked|BLS import .*blocked/is.test(handover)) {
    findings.push(finding({
      id: 'handover.product_gate_missing',
      severity: 'critical',
      layer: 'product_work_gate',
      file: HANDOVER,
      message: 'Current handover does not state the product work gate.',
      evidence: 'No product gate wording found.',
      suggested_action: 'Document whether product work is blocked or allowed.',
      blocks_product_work: true,
      blocks_operator: true,
    }))
  }
  if (canonical && /(governance (?:is )?(?:complete|done)|all governance (?:blocks|layers).*done)/i.test(canonical) && !/not complete/i.test(canonical)) {
    findings.push(finding({
      id: 'canonical.overstates_completion',
      severity: 'critical',
      layer: 'memory_learning',
      file: CANONICAL,
      message: 'Canonical memory appears to overstate governance completion.',
      evidence: 'Completion wording without not-complete qualifier.',
      suggested_action: 'Keep canonical memory compact and explicit about remaining governance gaps.',
      blocks_product_work: true,
      blocks_operator: true,
    }))
  }
  if (canonical && !/BLS import .*blocked|product work .*blocked/is.test(canonical)) {
    findings.push(finding({
      id: 'canonical.product_gate_missing',
      severity: 'critical',
      layer: 'product_work_gate',
      file: CANONICAL,
      message: 'Canonical memory does not state the product work gate.',
      evidence: 'No product gate wording found.',
      suggested_action: 'Record the compact current product gate truth in canonical memory.',
      blocks_product_work: true,
      blocks_operator: true,
    }))
  }
  return findings
}

function validateIncident(repoRoot: string, record: IncidentLearningRecord): LearningFinding[] {
  const findings: LearningFinding[] = []
  const required: Array<keyof IncidentLearningRecord> = [
    'incident_id',
    'date',
    'layer',
    'severity',
    'status',
    'root_cause',
    'trigger',
  ]
  for (const field of required) {
    if (!String(record[field] ?? '').trim()) {
      findings.push(finding({
        id: `incident.${String(field)}_missing`,
        severity: 'low',
        layer: 'memory_learning',
        file: record.file,
        message: `Incident record is missing ${String(field)}.`,
        evidence: record.file,
        suggested_action: `Add ${String(field)} to the incident record.`,
        blocks_product_work: false,
        blocks_operator: false,
      }))
    }
  }

  const fixedLike = /^(fixed|monitored)$/i.test(record.status)
  const fixCommitExplicitlyNotApplicable = /^(none|n\/a|not applicable|accepted-risk)$/i.test(record.fix_commit_note)
  if (fixedLike && !record.fix_commit && !fixCommitExplicitlyNotApplicable) {
    findings.push(finding({
      id: 'incident.fix_commit_missing',
      severity: 'high',
      layer: 'incident_to_regression',
      file: record.file,
      message: 'Fixed incident has no fix commit.',
      evidence: record.incident_id,
      suggested_action: 'Link the fix commit or reopen the incident.',
      blocks_product_work: true,
      blocks_operator: false,
    }))
  }
  if (record.fix_commit && !commitExists(repoRoot, record.fix_commit)) {
    findings.push(finding({
      id: 'incident.fix_commit_not_found',
      severity: 'high',
      layer: 'incident_to_regression',
      file: record.file,
      message: 'Referenced fix commit does not exist in git.',
      evidence: record.fix_commit,
      suggested_action: 'Correct the commit hash or fetch the missing history.',
      blocks_product_work: true,
      blocks_operator: false,
    }))
  }

  if (fixedLike && !record.regression_test_file && !hasMissingReason(record)) {
    findings.push(finding({
      id: 'incident.regression_test_missing',
      severity: 'high',
      layer: 'incident_to_regression',
      file: record.file,
      message: 'Fixed incident has no regression test or explicit missing-test reason.',
      evidence: record.incident_id,
      suggested_action: 'Add a regression test link or reopen with a missing-test reason.',
      blocks_product_work: true,
      blocks_operator: false,
    }))
  }
  if (record.regression_test_file && !exists(repoRoot, record.regression_test_file)) {
    findings.push(finding({
      id: 'incident.regression_test_not_found',
      severity: 'high',
      layer: 'incident_to_regression',
      file: record.file,
      message: 'Referenced regression test file does not exist.',
      evidence: record.regression_test_file,
      suggested_action: 'Correct the test path or add the missing test.',
      blocks_product_work: true,
      blocks_operator: false,
    }))
  }

  if (fixedLike && (!record.durable_rule_file || !record.durable_rule_text)) {
    findings.push(finding({
      id: 'incident.durable_rule_missing',
      severity: 'high',
      layer: 'incident_to_regression',
      file: record.file,
      message: 'Fixed incident lacks a durable rule file or rule text.',
      evidence: record.incident_id,
      suggested_action: 'Link the durable rule that prevents recurrence.',
      blocks_product_work: true,
      blocks_operator: false,
    }))
  }
  if (record.durable_rule_file && !exists(repoRoot, record.durable_rule_file)) {
    findings.push(finding({
      id: 'incident.durable_rule_file_not_found',
      severity: 'high',
      layer: 'incident_to_regression',
      file: record.file,
      message: 'Referenced durable rule file does not exist.',
      evidence: record.durable_rule_file,
      suggested_action: 'Correct the durable rule path or add the rule.',
      blocks_product_work: true,
      blocks_operator: false,
    }))
  }

  if (!/handover_updated:\s*yes/i.test(record.memory_update)) {
    findings.push(finding({
      id: 'incident.handover_update_missing',
      severity: 'low',
      layer: 'memory_learning',
      file: record.file,
      message: 'Incident does not record a handover update.',
      evidence: record.incident_id,
      suggested_action: 'Record handover update status.',
      blocks_product_work: false,
      blocks_operator: false,
    }))
  }
  if (!record.recurrence_detector.trim()) {
    findings.push(finding({
      id: 'incident.recurrence_detector_missing',
      severity: 'medium',
      layer: 'learning_feedback_loop',
      file: record.file,
      message: 'Incident has no recurrence detector or missing-detector plan.',
      evidence: record.incident_id,
      suggested_action: 'Name the checker/test that catches recurrence or the batch that must add it.',
      blocks_product_work: false,
      blocks_operator: false,
    }))
  }
  return findings
}

function validateBatchSummaries(batchSummaries: string[]): LearningFinding[] {
  const findings: LearningFinding[] = []
  if (batchSummaries.length === 0) {
    findings.push(finding({
      id: 'batch_summary.missing',
      severity: 'medium',
      layer: 'memory_learning',
      file: LEARNING_DIR,
      message: 'No governance batch summaries found.',
      evidence: LEARNING_DIR,
      suggested_action: 'Add batch learning summaries after governance batches.',
      blocks_product_work: false,
      blocks_operator: false,
    }))
  }
  return findings
}

export function runGovernanceLearningCheck(options: { repoRoot?: string; projectId?: string } = {}): LearningCheckResult {
  const repoRoot = options.repoRoot ?? process.cwd()
  const profile = options.projectId ? getProjectProfile(options.projectId, { repoRoot }) : undefined
  const files = listLearningFiles(repoRoot)
  const incidents = files
    .filter(isIncidentCandidate)
    .map(file => parseIncidentRecord(repoRoot, file))
    .filter((record): record is IncidentLearningRecord => record !== null)
  const batchSummaries = files.filter(file => /summary|cleanup/i.test(path.basename(file)) && !/SCHEMA|CHECKLIST|README|CURRENT/i.test(path.basename(file)))

  const findings = [
    ...validateRequiredDocs(repoRoot),
    ...validateHandoverAndCanonical(repoRoot),
    ...incidents.flatMap(record => validateIncident(repoRoot, record)),
    ...validateBatchSummaries(batchSummaries),
  ]
  const summary = summarize(findings)
  const hasBlocking = summary.critical > 0 || summary.high > 0
  return {
    schema_version: 1,
    generated_at: now(),
    repo_root: repoRoot,
    ...(profile ? {
      project_profile: {
        project_id: profile.project_id,
        display_name: profile.display_name,
        product_gate: profile.product_gate,
      },
    } : {}),
    product_work_gate: {
      status: profile?.product_gate.status === 'open' ? 'allowed' : 'blocked',
      reason: profile?.product_gate.reason ?? 'Product work remains blocked until Tom explicitly opens or waives the gate after reviewing governance readiness.',
    },
    summary,
    incidents,
    open_incidents: incidents.filter(record => /^open$/i.test(record.status)).map(record => record.file),
    batch_summaries: batchSummaries,
    findings,
    exitCode: hasBlocking ? 1 : 0,
  }
}

export function formatGovernanceLearningReport(result: LearningCheckResult): string {
  const lines = [
    '# Governance Learning Check',
    '',
    `Repo: ${result.repo_root}`,
    ...(result.project_profile ? [`Project profile: ${result.project_profile.project_id} (${result.project_profile.display_name})`] : []),
    `Generated: ${result.generated_at}`,
    `Product work gate: ${result.product_work_gate.reason}`,
    '',
    `Summary: critical=${result.summary.critical}, high=${result.summary.high}, medium=${result.summary.medium}, low=${result.summary.low}, info=${result.summary.info}`,
    `Incident records: ${result.incidents.length}`,
    `Open incidents: ${result.open_incidents.length}`,
    `Batch summaries: ${result.batch_summaries.length}`,
    '',
  ]
  if (result.findings.length === 0) {
    lines.push('No findings.')
  } else {
    lines.push('## Findings')
    for (const item of result.findings) {
      lines.push(`- [${item.severity}] ${item.id} (${item.layer}) ${item.file}`)
      lines.push(`  ${item.message}`)
      lines.push(`  Evidence: ${item.evidence}`)
      lines.push(`  Suggested action: ${item.suggested_action}`)
    }
  }
  return lines.join('\n')
}

export function buildLearningStatusMarkdown(result: LearningCheckResult): string {
  const missingTests = result.findings.filter(item => item.id.includes('regression_test')).length
  const missingRules = result.findings.filter(item => item.id.includes('durable_rule')).length
  return [
    '# Current Governance Learning Status',
    '',
    `Generated: ${result.generated_at}`,
    '',
    '## Summary',
    '',
    `- Total incident records: ${result.incidents.length}`,
    `- Open incidents: ${result.open_incidents.length}`,
    `- Fixed incidents: ${result.incidents.filter(item => /^fixed$/i.test(item.status)).length}`,
    `- Missing tests findings: ${missingTests}`,
    `- Missing durable rule findings: ${missingRules}`,
    `- Product work gate: ${result.product_work_gate.reason}`,
    '',
    '## Finding Counts',
    '',
    `- critical: ${result.summary.critical}`,
    `- high: ${result.summary.high}`,
    `- medium: ${result.summary.medium}`,
    `- low: ${result.summary.low}`,
    `- info: ${result.summary.info}`,
    '',
    '## Next Recommended Governance Action',
    '',
    result.summary.critical > 0 || result.summary.high > 0
      ? 'Fix critical/high learning findings before opening product work.'
      : 'Review whether Tom wants to open the product work gate or keep it closed.',
    '',
  ].join('\n')
}

export function writeLearningStatus(result: LearningCheckResult, repoRoot = process.cwd()): string {
  const target = path.join(repoRoot, STATUS_FILE)
  fs.mkdirSync(path.dirname(target), { recursive: true })
  fs.writeFileSync(target, buildLearningStatusMarkdown(result), 'utf8')
  return rel(repoRoot, STATUS_FILE)
}

function printUsage(): void {
  console.error('Usage: governance-learning-check.ts [--json] [--write-summary]')
  console.error('       governance-learning-check.ts --batch <batch-dossier-or-report> [--json]')
}

function main(): void {
  const args = process.argv.slice(2)
  const json = args.includes('--json')
  const writeSummary = args.includes('--write-summary')
  const projectIndex = args.indexOf('--project')
  const projectId = projectIndex !== -1 ? args[projectIndex + 1] : undefined
  const batchIndex = args.indexOf('--batch')
  if (batchIndex !== -1 && !args[batchIndex + 1]) {
    printUsage()
    process.exit(2)
  }

  try {
    const result = runGovernanceLearningCheck({ projectId })
    const written = writeSummary ? writeLearningStatus(result) : ''
    if (json) {
      console.log(JSON.stringify({ ...result, written_summary: written || undefined }, null, 2))
    } else {
      console.log(formatGovernanceLearningReport(result))
      if (written) console.log(`\nWritten summary: ${written}`)
    }
    process.exit(result.exitCode)
  } catch (error) {
    const message = (error as Error).message
    if (json) {
      console.log(JSON.stringify({
        schema_version: 1,
        generated_at: now(),
        findings: [finding({
          id: 'tool.error',
          severity: 'critical',
          layer: 'tool_config',
          file: '',
          message,
          evidence: message,
          suggested_action: 'Fix the checker invocation or repository layout.',
          blocks_product_work: true,
          blocks_operator: true,
        })],
      }, null, 2))
    } else {
      console.error(`governance-learning-check error: ${message}`)
    }
    process.exit(2)
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  main()
}
