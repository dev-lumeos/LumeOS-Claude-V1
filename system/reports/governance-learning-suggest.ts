import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import type { AutonomyFinalState } from './autonomy-handoff'

export type GovernanceLearningSuggestionAction =
  | 'none'
  | 'create_incident_record'
  | 'update_existing_learning_record'
  | 'add_regression_test'
  | 'update_handover_or_memory'

export interface GovernanceLearningSuggestionInput {
  finalState: AutonomyFinalState | string
  blockers?: string[]
  dossierPath?: string
}

export interface GovernanceLearningSuggestion {
  action: GovernanceLearningSuggestionAction
  learning_recommended: boolean
  reason: string
  suggested_record_type: 'none' | 'incident' | 'regression' | 'memory_update'
  suggested_next_step: string
}

const INCIDENT_STATES = new Set([
  'FIX_REQUIRED',
  'STOP_RULE_BLOCKED',
  'INVARIANT_BLOCKED',
  'AGENT_CONTRACT_BLOCKED',
  'SPEC_SOURCE_BLOCKED',
  'MODEL_RUNTIME_BLOCKED',
  'PRODUCT_GATE_BLOCKED',
  'DIRTY_WORKTREE',
])

export function suggestGovernanceLearning(input: GovernanceLearningSuggestionInput): GovernanceLearningSuggestion {
  const finalState = String(input.finalState)
  if (!INCIDENT_STATES.has(finalState)) {
    return {
      action: 'none',
      learning_recommended: false,
      reason: `${finalState} does not require a learning record by default.`,
      suggested_record_type: 'none',
      suggested_next_step: 'No learning artifact is required unless Tom identifies a new durable lesson.',
    }
  }

  const blockerText = input.blockers?.filter(Boolean).join('; ') || 'No blocker detail provided.'
  return {
    action: 'create_incident_record',
    learning_recommended: true,
    reason: `${finalState} is incident-like and should be reviewed for durable learning. Blockers: ${blockerText}`,
    suggested_record_type: finalState === 'MODEL_RUNTIME_BLOCKED' ? 'regression' : 'incident',
    suggested_next_step: 'Create a governance learning record that links the blocker, fix, validation, and regression test.',
  }
}

function parseArgs(args: string[]): { finalState: string; blockers: string[]; dossierPath?: string; json: boolean; writeDraft: boolean } {
  const finalStateIndex = args.indexOf('--final-state')
  const dossierIndex = args.indexOf('--dossier')
  const blockersIndex = args.indexOf('--blockers')
  return {
    finalState: finalStateIndex !== -1 ? args[finalStateIndex + 1] : 'UNKNOWN',
    blockers: blockersIndex !== -1 ? args[blockersIndex + 1]?.split('|').filter(Boolean) ?? [] : [],
    dossierPath: dossierIndex !== -1 ? args[dossierIndex + 1] : undefined,
    json: args.includes('--json'),
    writeDraft: args.includes('--write-draft'),
  }
}

function writeDraft(suggestion: GovernanceLearningSuggestion, finalState: string, repoRoot = process.cwd()): string {
  const draftsDir = path.join(repoRoot, 'docs/project/governance-learning/drafts')
  fs.mkdirSync(draftsDir, { recursive: true })
  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  const filePath = path.join(draftsDir, `${stamp}-${finalState.toLowerCase()}-learning-draft.md`)
  fs.writeFileSync(filePath, [
    '# Governance Learning Draft',
    '',
    `Final state: ${finalState}`,
    `Recommended: ${suggestion.learning_recommended ? 'yes' : 'no'}`,
    `Action: ${suggestion.action}`,
    `Record type: ${suggestion.suggested_record_type}`,
    '',
    '## Reason',
    suggestion.reason,
    '',
    '## Suggested Next Step',
    suggestion.suggested_next_step,
    '',
  ].join('\n'), 'utf8')
  return path.relative(repoRoot, filePath).replace(/\\/g, '/')
}

function main(): number {
  const opts = parseArgs(process.argv.slice(2))
  const suggestion = suggestGovernanceLearning({
    finalState: opts.finalState,
    blockers: opts.blockers,
    dossierPath: opts.dossierPath,
  })
  const output = opts.writeDraft
    ? { ...suggestion, draft_path: writeDraft(suggestion, opts.finalState) }
    : suggestion
  if (opts.json) {
    console.log(JSON.stringify(output, null, 2))
  } else {
    console.log(`# Governance Learning Suggestion

recommended: ${suggestion.learning_recommended ? 'yes' : 'no'}
action: ${suggestion.action}
record_type: ${suggestion.suggested_record_type}
reason: ${suggestion.reason}
next_step: ${suggestion.suggested_next_step}`)
  }
  return 0
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  process.exitCode = main()
}
