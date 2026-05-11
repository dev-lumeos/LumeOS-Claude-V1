import assert from 'node:assert/strict'
import { beforeEach, afterEach, describe, it } from 'node:test'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import {
  buildReportCleanupPlan,
  redactReportContent,
  runReportRetentionSummary,
} from '../report-retention-summarizer'

let tmpDir = ''

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lumeos-report-retention-'))
})

afterEach(() => {
  if (tmpDir) fs.rmSync(tmpDir, { recursive: true, force: true })
})

function write(relativePath: string, content: string): void {
  const fullPath = path.join(tmpDir, relativePath)
  fs.mkdirSync(path.dirname(fullPath), { recursive: true })
  fs.writeFileSync(fullPath, content, 'utf8')
}

describe('report retention summarizer', () => {
  it('summarizes ignored Codex reports without dumping prompt bodies', () => {
    const prompt = 'PROMPT_BODY '.repeat(80)
    write('system/reports/codex-worker/RUN-1-report.md', [
      '# Codex Worker Report',
      '',
      '## Prompt',
      prompt,
      '',
      '## Final State',
      'DONE',
    ].join('\n'))

    const result = runReportRetentionSummary({ repoRoot: tmpDir })
    const report = result.reports[0]

    assert.equal(result.summary.total_files, 1)
    assert.equal(report.category, 'codex_worker_report')
    assert.equal(report.ignored_by_policy, true)
    assert.equal(report.contains_body, false)
    assert.doesNotMatch(JSON.stringify(report), /PROMPT_BODY/)
    assert.equal(report.recommended_action, 'retain_local_or_delete_manually')
  })

  it('flags and redacts sensitive-looking tokens, emails, and local absolute paths', () => {
    const content = [
      'OPENAI_API_KEY=sk-test1234567890abcdef',
      'Contact tom@example.com',
      'Local path D:\\GitHub\\LumeOS-Claude-V1\\system\\reports\\codex-worker\\x.md',
      'Bearer abcdefghijklmnopqrstuvwxyz123456',
    ].join('\n')

    const redacted = redactReportContent(content, { repoRoot: 'D:\\GitHub\\LumeOS-Claude-V1' })

    assert.deepEqual(redacted.flags.sort(), ['absolute_path', 'email', 'secret_like'].sort())
    assert.doesNotMatch(redacted.redacted, /sk-test/)
    assert.doesNotMatch(redacted.redacted, /tom@example\.com/)
    assert.doesNotMatch(redacted.redacted, /D:\\GitHub/)
    assert.match(redacted.redacted, /\[REDACTED_SECRET\]/)
    assert.match(redacted.redacted, /\[REDACTED_EMAIL\]/)
    assert.match(redacted.redacted, /\[REDACTED_LOCAL_PATH\]/)
  })

  it('classifies runtime history and browser smoke artifacts as ignored local artifacts', () => {
    write('system/reports/model-runtime-history/history.jsonl', '{"route_id":"senior-coding-agent"}\n')
    write('tmp/governance-ui-browser-smoke/governance.png', 'fakepng')

    const result = runReportRetentionSummary({ repoRoot: tmpDir })
    const categories = result.reports.map(item => item.category).sort()

    assert.deepEqual(categories, ['browser_smoke_artifact', 'runtime_history'])
    assert.equal(result.reports.every(item => item.ignored_by_policy), true)
  })

  it('protects canonical docs and learning records from cleanup plans', () => {
    write('docs/project/CURRENT_GOVERNANCE_HANDOVER.md', '# Handover\n')
    write('docs/project/governance-learning/2026-05-10-incident.md', '# Incident\n')
    write('system/reports/codex-worker/old-report.md', '# old\n')

    const plan = buildReportCleanupPlan({ repoRoot: tmpDir })

    assert.equal(plan.mode, 'dry-run')
    assert.equal(plan.protected_paths.includes('docs/project/CURRENT_GOVERNANCE_HANDOVER.md'), true)
    assert.equal(plan.protected_paths.includes('docs/project/governance-learning/2026-05-10-incident.md'), true)
    assert.equal(fs.existsSync(path.join(tmpDir, 'system/reports/codex-worker/old-report.md')), true)
    assert.deepEqual(plan.delete_candidates, ['system/reports/codex-worker/old-report.md'])
  })

  it('marks accidentally tracked ignored reports', () => {
    write('system/reports/codex-worker/tracked-report.md', '# tracked\n')

    const result = runReportRetentionSummary({
      repoRoot: tmpDir,
      trackedFiles: ['system/reports/codex-worker/tracked-report.md'],
    })

    assert.equal(result.reports[0]?.appears_tracked, true)
    assert.equal(result.reports[0]?.recommended_action, 'unstage_or_remove_from_git')
  })
})
