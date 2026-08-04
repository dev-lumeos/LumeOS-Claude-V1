import assert from 'node:assert/strict'
import { describe, it, beforeEach, afterEach } from 'node:test'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import {
  runGovernanceLearningCheck,
  writeLearningStatus,
} from '../governance-learning-check'

let tmpDir = ''

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lumeos-learning-check-'))
  writeRequiredDocs()
  writeIncident()
})

afterEach(() => {
  if (tmpDir) fs.rmSync(tmpDir, { recursive: true, force: true })
})

function write(relativePath: string, content: string): void {
  const fullPath = path.join(tmpDir, relativePath)
  fs.mkdirSync(path.dirname(fullPath), { recursive: true })
  fs.writeFileSync(fullPath, content, 'utf8')
}

function remove(relativePath: string): void {
  fs.rmSync(path.join(tmpDir, relativePath), { force: true })
}

function writeRequiredDocs(): void {
  write('docs/project/CURRENT_GOVERNANCE_HANDOVER.md', [
    '# Current Governance Handover',
    '',
    'Current date: 2026-05-05.',
    '',
    '## Current Product Work Gate',
    'BLS import and Nutrition product work remain blocked.',
  ].join('\n'))
  write('docs/project/governance-learning/README.md', '# Governance Learning Log\n')
  write('docs/project/governance-learning/INCIDENT_LEARNING_SCHEMA.md', '# Incident Learning Schema\n')
  write('docs/project/governance-learning/INCIDENT_TO_REGRESSION_CHECKLIST.md', '# Incident To Regression Checklist\n')
  write('docs/project/governance-learning/2026-05-05-governance-batch-summary.md', '# Summary\n')
  write('system/memory/canonical/lumeos_canonical.md', [
    '# Canonical',
    '',
    'The deterministic governance system is functional and not complete.',
    'BLS import and product work remain blocked.',
  ].join('\n'))
  write('system/control-plane/__tests__/example.test.ts', 'test fixture\n')
  write('docs/project/GOVERNANCE_SYSTEM_COMPLETION_PLAN.md', 'Example/template paths must never become real tool targets.\n')
}

function writeIncident(overrides: Partial<{
  commit: string
  testFile: string
  durableRuleFile: string
  durableRuleText: string
  recurrenceDetector: string
  status: string
}> = {}): void {
  const commit = overrides.commit ?? 'not applicable'
  const testFile = overrides.testFile ?? 'system/control-plane/__tests__/example.test.ts'
  const ruleFile = overrides.durableRuleFile ?? 'docs/project/GOVERNANCE_SYSTEM_COMPLETION_PLAN.md'
  const ruleText = overrides.durableRuleText ?? 'Example/template paths must never become real tool targets.'
  const recurrence = overrides.recurrenceDetector ?? 'Agent contract checker detects this class.'
  const status = overrides.status ?? 'fixed'
  write('docs/project/governance-learning/2026-05-05-example.md', [
    '# Incident: Example',
    '',
    '## Metadata',
    '',
    '- incident_id: GOV-20260505-999',
    '- date: 2026-05-05',
    '- layer: agent_contract',
    '- severity: high',
    `- status: ${status}`,
    '- product_work_blocked: yes',
    '- autonomous_operator_blocked: yes',
    '',
    '## Summary',
    '',
    'An incident happened.',
    '',
    '## Root Cause',
    '',
    'A concrete contract gap existed.',
    '',
    '## Trigger',
    '',
    '- command: test',
    '- workorder: WO-test-001',
    '- run_id:',
    '- approval_id:',
    '- stop_rule:',
    '',
    '## Fix',
    '',
    `- commit: ${commit}`,
    '- files:',
    '  - `system/control-plane/example.ts`',
    '- behavior changed: safer behavior',
    '',
    '## Regression Test',
    '',
    `- test_file: ${testFile}`,
    '- test_name: catches behavior',
    '- command: test command',
    '',
    '## Durable Rule',
    '',
    `- rule_file: ${ruleFile}`,
    `- rule_text: ${ruleText}`,
    '',
    '## Memory Update',
    '',
    '- handover_updated: yes',
    '- canonical_memory_updated: yes',
    '- agent_contract_updated: no',
    '- workorder_template_updated: no',
    '',
    '## Recurrence Detector',
    '',
    recurrence,
    '',
    '## Follow-up',
    '',
    'none',
  ].join('\n'))
}

function finding(id: string) {
  return runGovernanceLearningCheck({ repoRoot: tmpDir }).findings.find(item => item.id === id)
}

describe('governance learning checker', () => {
  it('passes a complete incident record', () => {
    const result = runGovernanceLearningCheck({ repoRoot: tmpDir })

    assert.equal(result.exitCode, 0)
    assert.equal(result.summary.critical, 0)
    assert.equal(result.summary.high, 0)
    assert.equal(result.incidents.length, 1)
  })

  it('reports missing regression test as high', () => {
    writeIncident({ testFile: '' })

    assert.equal(finding('incident.regression_test_missing')?.severity, 'high')
  })

  it('reports missing durable rule as high', () => {
    writeIncident({ durableRuleFile: '', durableRuleText: '' })

    assert.equal(finding('incident.durable_rule_missing')?.severity, 'high')
  })

  it('reports missing handover as critical', () => {
    remove('docs/project/CURRENT_GOVERNANCE_HANDOVER.md')

    assert.equal(finding('required.current_governance_handover_md_missing')?.severity, 'critical')
  })

  it('reports stale canonical completion claim as critical', () => {
    write('system/memory/canonical/lumeos_canonical.md', 'All governance blocks are done.\n')

    assert.equal(finding('canonical.overstates_completion')?.severity, 'critical')
  })

  it('reports missing referenced commit as high', () => {
    writeIncident({ commit: 'deadbee' })

    assert.equal(finding('incident.fix_commit_not_found')?.severity, 'high')
  })

  it('reports missing referenced test file as high', () => {
    writeIncident({ testFile: 'system/control-plane/__tests__/missing.test.ts' })

    assert.equal(finding('incident.regression_test_not_found')?.severity, 'high')
  })

  it('keeps JSON output shape stable', () => {
    const result = runGovernanceLearningCheck({ repoRoot: tmpDir })

    assert.deepEqual(Object.keys(result).sort(), [
      'batch_summaries',
      'exitCode',
      'findings',
      'generated_at',
      'incidents',
      'open_incidents',
      'product_work_gate',
      'repo_root',
      'schema_version',
      'summary',
    ].sort())
  })

  it('write-summary writes only the current learning status file', () => {
    const before = fs.existsSync(path.join(tmpDir, 'docs/project/governance-learning/CURRENT_LEARNING_STATUS.md'))
    const result = runGovernanceLearningCheck({ repoRoot: tmpDir })
    const written = writeLearningStatus(result, tmpDir)

    assert.equal(before, false)
    assert.equal(written, 'docs/project/governance-learning/CURRENT_LEARNING_STATUS.md')
    assert.match(fs.readFileSync(path.join(tmpDir, written), 'utf8'), /Current Governance Learning Status/)
  })
})
