import assert from 'node:assert/strict'
import { afterEach, beforeEach, describe, it } from 'node:test'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import {
  runMemoryUpdateProposalMode,
  runGovernanceLearningSuggest,
  suggestGovernanceLearning,
  writeMemoryUpdateDrafts,
  writeGovernanceLearningDrafts,
} from '../governance-learning-suggest'

let tmpDir = ''

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lumeos-learning-suggest-'))
  writeRequiredDocs()
})

afterEach(() => {
  if (tmpDir) fs.rmSync(tmpDir, { recursive: true, force: true })
})

function write(relativePath: string, content: string): void {
  const fullPath = path.join(tmpDir, relativePath)
  fs.mkdirSync(path.dirname(fullPath), { recursive: true })
  fs.writeFileSync(fullPath, content, 'utf8')
}

function writeJson(relativePath: string, value: unknown): void {
  write(relativePath, JSON.stringify(value, null, 2))
}

function writeRequiredDocs(): void {
  write('docs/project/governance-learning/README.md', '# Governance Learning\n')
  write('docs/project/governance-learning/INCIDENT_LEARNING_SCHEMA.md', '# Schema\n')
  write('docs/project/governance-learning/INCIDENT_TO_REGRESSION_CHECKLIST.md', '# Checklist\n')
  write('docs/project/CURRENT_GOVERNANCE_HANDOVER.md', [
    '# Current Governance Handover',
    '',
    '- Product work remains closed unless Tom explicitly opens it.',
    '- Runtime hardware downtime is planned_hardware_maintenance while DGX/Spark devices are installed into the rack.',
    '- Codex Worker dispatch is controlled_enabled for senior governance agents; broad automation remains forbidden.',
    '- Project Profiles include inactive fixture-beauty-club only.',
  ].join('\n'))
  writeJson('docs/project/GOVERNANCE_TODO_REGISTER.json', {
    generated_at: '2026-05-11T00:00:00Z',
    items: [
      {
        id: 'GOV-TODO-010',
        title: 'Add draft memory update proposal workflow',
        layer: 'memory_learning',
        severity: 'low',
        priority: 'P2',
        status: 'done',
        evidence: 'Memory update proposal workflow is implemented.',
        recommended_action: 'Use memory proposal draft mode for reviewed handover/canonical suggestions.',
        dependencies: [],
        estimated_effort: '0.5d',
        codex_autonomous_possible: true,
        blocks_product_work: false,
        source_files: ['system/reports/governance-learning-suggest.ts'],
      },
    ],
  })
}

function writeExistingIncident(): void {
  write('docs/project/governance-learning/2026-05-05-codex-timeout.md', [
    '# Incident: Codex timeout',
    '',
    '## Metadata',
    '',
    '- incident_id: GOV-20260505-123',
    '- date: 2026-05-05',
    '- layer: codex_worker',
    '- severity: high',
    '- status: fixed',
    '',
    '## Root Cause',
    '',
    'CODEX_WORKER_TIMEOUT occurred.',
  ].join('\n'))
}

describe('governance learning suggestion helper', () => {
  it('does not recommend learning for normal ready states', () => {
    const suggestion = suggestGovernanceLearning({ finalState: 'READY_TO_RUN' })

    assert.equal(suggestion.learning_recommended, false)
    assert.equal(suggestion.action, 'none')
  })

  it('recommends incident learning for fix-required states', () => {
    const suggestion = suggestGovernanceLearning({
      finalState: 'FIX_REQUIRED',
      blockers: ['unexpected dirty worktree'],
    })

    assert.equal(suggestion.learning_recommended, true)
    assert.equal(suggestion.action, 'create_incident_record')
    assert.match(suggestion.reason, /unexpected dirty worktree/)
  })

  it('no inputs returns no candidates and clean exit', () => {
    const result = runGovernanceLearningSuggest({ repoRoot: tmpDir })

    assert.equal(result.exitCode, 0)
    assert.equal(result.candidates.length, 0)
    assert.equal(result.summary.total_candidates, 0)
  })

  it('dossier FIX_REQUIRED produces an incident candidate', () => {
    writeJson('dossier.json', {
      final_state: 'FIX_REQUIRED',
      autonomy_handoff: {
        blocker_type: 'SPEC_SOURCE_BLOCKED',
        blockers: ['missing source_refs'],
      },
    })

    const result = runGovernanceLearningSuggest({ repoRoot: tmpDir, fromDossier: 'dossier.json' })
    const candidate = result.candidates[0]

    assert.equal(result.exitCode, 1)
    assert.equal(candidate.category, 'SPEC_SOURCE_BLOCKED')
    assert.equal(candidate.regression_test_needed, true)
    assert.match(candidate.evidence, /missing source_refs/)
  })

  it('codex timeout report produces CODEX_WORKER_TIMEOUT candidate', () => {
    write('system/reports/codex-worker/timeout-report.md', [
      '# Codex Worker Report',
      '',
      '## Final State',
      'FIX_REQUIRED',
      '',
      '## Stderr',
      'Timed out after 120000ms',
    ].join('\n'))

    const result = runGovernanceLearningSuggest({ repoRoot: tmpDir })

    assert.equal(result.exitCode, 1)
    assert.equal(result.candidates[0]?.category, 'CODEX_WORKER_TIMEOUT')
  })

  it('existing incident duplicate marks duplicate_of', () => {
    writeExistingIncident()
    write('system/reports/codex-worker/timeout-report.md', 'CODEX_WORKER_TIMEOUT timed out\n')

    const result = runGovernanceLearningSuggest({ repoRoot: tmpDir })

    assert.equal(result.candidates.length, 0)
    assert.equal(result.duplicates[0]?.duplicate_of, 'docs/project/governance-learning/2026-05-05-codex-timeout.md')
  })

  it('write-drafts writes only under drafts and never canonical memory', () => {
    writeJson('dossier.json', { final_state: 'FIX_REQUIRED', autonomy_handoff: { blocker_type: 'DIRTY_WORKTREE' } })
    const result = runGovernanceLearningSuggest({ repoRoot: tmpDir, fromDossier: 'dossier.json' })
    const written = writeGovernanceLearningDrafts(result, { repoRoot: tmpDir })

    assert.equal(written.length, 1)
    assert.match(written[0], /^docs\/project\/governance-learning\/drafts\//)
    assert.equal(fs.existsSync(path.join(tmpDir, 'system/memory/canonical/lumeos_canonical.md')), false)
  })

  it('keeps JSON output shape stable', () => {
    const result = runGovernanceLearningSuggest({ repoRoot: tmpDir })

    assert.deepEqual(Object.keys(result).sort(), [
      'candidates',
      'duplicates',
      'exitCode',
      'generated_at',
      'product_gate_status',
      'recommended_next_action',
      'repo_root',
      'schema_version',
      'summary',
    ].sort())
  })

  it('product gate false positive is classified correctly from dossier evidence', () => {
    writeJson('dossier.json', {
      final_state: 'FIX_REQUIRED',
      autonomy_handoff: {
        blocker_type: 'PRODUCT_GATE_BLOCKED',
        blockers: ['product work gate blocks Codex worker dispatch for governance smoke'],
      },
    })

    const result = runGovernanceLearningSuggest({ repoRoot: tmpDir, fromDossier: 'dossier.json' })

    assert.equal(result.candidates[0]?.category, 'PRODUCT_GATE_FALSE_POSITIVE')
  })

  it('invalid_json metric spike produces candidate', () => {
    write('system/state/pipeline-metrics.jsonl', [
      JSON.stringify({ event: 'invalid_json', run_id: 'RUN-1' }),
      JSON.stringify({ event: 'invalid_json', run_id: 'RUN-2' }),
      JSON.stringify({ event: 'invalid_json', run_id: 'RUN-3' }),
    ].join('\n'))

    const result = runGovernanceLearningSuggest({ repoRoot: tmpDir })

    assert.equal(result.candidates[0]?.category, 'INVALID_JSON_SPIKE')
    assert.equal(result.exitCode, 1)
  })

  it('memory proposal dry-run outputs reviewed proposals and writes nothing', () => {
    const result = runMemoryUpdateProposalMode({ repoRoot: tmpDir })

    assert.equal(result.exitCode, 0)
    assert.ok(result.proposals.length >= 3)
    assert.equal(result.proposals.every(item => item.requires_tom_review), true)
    assert.equal(result.product_gate_status.status, 'blocked')
    assert.equal(fs.existsSync(path.join(tmpDir, 'docs/project/governance-learning/memory-update-drafts')), false)
    assert.equal(fs.existsSync(path.join(tmpDir, 'system/memory/canonical/lumeos_canonical.md')), false)
  })

  it('memory proposal draft writing only writes review drafts', () => {
    const result = runMemoryUpdateProposalMode({ repoRoot: tmpDir })
    const written = writeMemoryUpdateDrafts(result, { repoRoot: tmpDir })

    assert.ok(written.length > 0)
    assert.equal(written.every(item => item.startsWith('docs/project/governance-learning/memory-update-drafts/')), true)
    assert.equal(fs.existsSync(path.join(tmpDir, 'docs/project/CURRENT_GOVERNANCE_HANDOVER.md')), true)
    assert.equal(fs.existsSync(path.join(tmpDir, 'system/memory/canonical/lumeos_canonical.md')), false)
  })

  it('memory proposals keep product gate closed and runtime maintenance draft-only', () => {
    const result = runMemoryUpdateProposalMode({ repoRoot: tmpDir })

    const runtime = result.proposals.find(item => item.category === 'runtime_status_update')
    assert.ok(runtime)
    assert.match(runtime.suggested_memory_text, /planned_hardware_maintenance/)
    assert.doesNotMatch(JSON.stringify(result.proposals), /product gate open/i)
    assert.equal(result.product_gate_status.status, 'blocked')
  })

  it('memory proposals do not promote Beauty Club fixture to active', () => {
    write('docs/project/CURRENT_GOVERNANCE_HANDOVER.md', 'fixture-beauty-club active project should not happen\n')

    const result = runMemoryUpdateProposalMode({ repoRoot: tmpDir })

    assert.equal(result.proposals.some(item => /Beauty Club.*active/i.test(item.suggested_memory_text)), false)
    assert.match(result.conflict_notes.join('\n'), /Beauty Club fixture/i)
  })

  it('memory proposals flag broad Codex automation and block explicit DB suggestions', () => {
    write('docs/project/CURRENT_GOVERNANCE_HANDOVER.md', [
      'Product work remains closed.',
      'Broad Codex automation enabled.',
    ].join('\n'))
    write('unsafe-memory-source.md', 'Run supabase db push and execute migrations.')

    const result = runMemoryUpdateProposalMode({ repoRoot: tmpDir, fromFile: 'unsafe-memory-source.md' })

    assert.match(result.conflict_notes.join('\n'), /broad Codex automation/i)
    assert.equal(result.blocked_suggestions.some(item => item.reason === 'forbidden_action_policy'), true)
    assert.equal(result.blocked_suggestions.some(item => item.reason === 'broad_automation_risk'), true)
    assert.equal(result.proposals.some(item => /supabase db push|execute migrations/i.test(item.suggested_memory_text)), false)
  })

  it('memory proposal JSON shape is stable and includes source refs', () => {
    const result = runMemoryUpdateProposalMode({ repoRoot: tmpDir })
    const proposal = result.proposals[0]

    assert.deepEqual(Object.keys(result).sort(), [
      'blocked_suggestions',
      'conflict_notes',
      'exitCode',
      'generated_at',
      'product_gate_status',
      'proposals',
      'recommended_next_action',
      'repo_root',
      'schema_version',
      'summary',
    ].sort())
    assert.ok(proposal.source_refs.length > 0)
    assert.equal(proposal.requires_tom_review, true)
  })
})
