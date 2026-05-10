import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import fs from 'node:fs'
import path from 'node:path'

import {
  COMMAND_DEFINITIONS,
  DEFAULT_BATCH_PATH,
  assertKnownAction,
  getCommandDefinition,
  requiresConfirmation,
  validateBatchPath,
} from '../command-allowlist'
import { commandPlanFor } from '../command-runner'
import { parseJsonFromStdout, redactSecrets } from '../redact'
import { findRepoRoot } from '../repo-root'
import { classifyCommandResult, isMealCamOptionalOfflineNonBlocking, productGateText, toneFromSummary } from '../status'

describe('governance UI safety helpers', () => {
  it('blocks non-allowlisted command actions', () => {
    assert.throws(() => assertKnownAction('supabase db reset'), /not allowlisted/)
  })

  it('returns null for unknown or event-shaped UI actions', () => {
    assert.equal(getCommandDefinition('missing.action'), null)
    assert.equal(getCommandDefinition({ type: 'click' }), null)
  })

  it('does not expose forbidden Supabase commands in the allowlist', () => {
    const serialized = JSON.stringify(COMMAND_DEFINITIONS)
    assert.doesNotMatch(serialized, /supabase db reset/)
    assert.doesNotMatch(serialized, /supabase db push/)
    assert.doesNotMatch(serialized, /supabase migration up/)
  })

  it('validates batch paths under system workorders only', () => {
    assert.equal(
      validateBatchPath('system/workorders/nutrition/batches/BATCH.md'),
      'system/workorders/nutrition/batches/BATCH.md',
    )
    assert.throws(() => validateBatchPath('supabase/migrations/example.sql'), /system\/workorders/)
    assert.throws(() => validateBatchPath('system/workorders/../state/runtime_state.json'), /system\/workorders/)
  })

  it('controlled operator actions require explicit confirmation', () => {
    assert.equal(requiresConfirmation('operator.continue'), true)
    assert.equal(requiresConfirmation('operator.continueSafeCleanups'), true)
    assert.throws(() => commandPlanFor({ action: 'operator.continue' }), /requires explicit confirmation/)
    const plan = commandPlanFor({ action: 'operator.continue', confirmed: true })
    assert.deepEqual(plan.args.slice(-1), ['--continue'])
  })

  it('resolves known read-only and controlled action definitions', () => {
    assert.equal(getCommandDefinition('operator.status')?.controlled, false)
    assert.equal(getCommandDefinition('operator.continue')?.controlled, true)
  })

  it('approval center has no executable grant action', () => {
    assert.ok(!Object.keys(COMMAND_DEFINITIONS).some(action => action.includes('grant')))
  })

  it('parses JSON from command stdout and redacts secrets', () => {
    assert.deepEqual(parseJsonFromStdout('noise\n{"ok":true}\n'), { ok: true })
    assert.match(redactSecrets('api_key=abc123'), /api_key=\[REDACTED\]/)
  })

  it('maps product gate and summary status for dashboard cards', () => {
    assert.equal(toneFromSummary({ critical: 0, high: 0, medium: 0 }), 'pass')
    assert.equal(toneFromSummary({ critical: 0, high: 1 }), 'blocked')
    assert.match(productGateText({
      product_work_gate: { status: 'blocked', reason: 'Tom has not opened product work.' },
    }), /blocked/)
  })

  it('treats optional MealCam offline as non-blocking', () => {
    assert.equal(isMealCamOptionalOfflineNonBlocking({
      findings: [{
        id: 'model_runtime.optional_endpoint_offline',
        agent: 'mealcam-agent',
        severity: 'info',
        blocks_operator: false,
      }],
    }), true)
  })

  it('dossier command uses JSON without write by default', () => {
    const plan = commandPlanFor({
      action: 'dossier.batch',
      batchPath: 'system/workorders/nutrition/batches/BATCH.md',
    })
    assert.ok(plan.args.includes('--json'))
    assert.ok(!plan.args.includes('--write'))
    assert.ok(plan.args.includes('--project'))
    assert.ok(plan.args.includes('lumeos'))
  })

  it('profile-aware read commands use the default LumeOS profile', () => {
    const invariant = commandPlanFor({ action: 'invariant.check' })
    const promotion = commandPlanFor({ action: 'promotion.review', branch: 'goal/test' })

    assert.deepEqual(invariant.args.slice(-3), ['--json', '--project', 'lumeos'])
    assert.ok(promotion.args.includes('--project'))
    assert.ok(promotion.args.includes('lumeos'))
  })

  it('defaults to an existing governance batch instead of missing P1-005 product planning', () => {
    const root = findRepoRoot(process.cwd())
    assert.equal(DEFAULT_BATCH_PATH.includes('P1-005'), false)
    assert.equal(fs.existsSync(path.join(root, DEFAULT_BATCH_PATH)), true)
  })

  it('classifies structured non-zero governance output as governance blocker, not API error', () => {
    assert.deepEqual(classifyCommandResult({
      exitCode: 2,
      stderr: '',
      parsedJson: {
        final_diagnosis: 'SPEC_SOURCE_BLOCKED',
        next_action: 'Run spec source chain check',
      },
    }).label, 'NEEDS_FIX')
  })

  it('classifies unstructured non-zero output as API error', () => {
    assert.deepEqual(classifyCommandResult({
      exitCode: 1,
      stderr: 'Batch file not found',
      parsedJson: null,
    }).label, 'API_ERROR')
  })

  it('documents the main branch promotion helper in the console', () => {
    const root = findRepoRoot(process.cwd())
    const consoleComponent = fs.readFileSync(path.join(root, 'apps/web/src/components/governance/GovernanceConsole.tsx'), 'utf8')
    assert.match(consoleComponent, /Promotion review is for feature branches/)
    assert.match(consoleComponent, /main\.\.main/)
  })

  it('batch console can plan status and doctor commands', () => {
    const status = commandPlanFor({ action: 'operator.status', batchPath: 'system/workorders/x/BATCH.md' })
    const doctor = commandPlanFor({ action: 'operator.doctor', batchPath: 'system/workorders/x/BATCH.md' })
    assert.ok(status.args.includes('--status'))
    assert.ok(doctor.args.includes('--doctor'))
    assert.ok(doctor.args.includes('--json'))
  })

  it('finds the repository root from the web app subtree', () => {
    const root = findRepoRoot(process.cwd())
    assert.match(root.replace(/\\/g, '/'), /LumeOS-Claude-V1$/)
  })

  it('has Tailwind/PostCSS styling wired for the governance console', () => {
    const root = findRepoRoot(process.cwd())
    assert.equal(fs.existsSync(path.join(root, 'apps/web/postcss.config.js')), true)
    const globals = fs.readFileSync(path.join(root, 'apps/web/src/app/globals.css'), 'utf8')
    const consoleComponent = fs.readFileSync(path.join(root, 'apps/web/src/components/governance/GovernanceConsole.tsx'), 'utf8')

    assert.match(globals, /@tailwind base/)
    assert.match(globals, /\.gov-shell/)
    assert.match(consoleComponent, /gov-sidebar/)
    assert.match(consoleComponent, /Product gate closed/)
    assert.match(consoleComponent, /Project Profile/)
  })

  it('runtime page displays runtime type for external Codex routes', () => {
    const root = findRepoRoot(process.cwd())
    const consoleComponent = fs.readFileSync(path.join(root, 'apps/web/src/components/governance/GovernanceConsole.tsx'), 'utf8')

    assert.match(consoleComponent, /Runtime/)
    assert.match(consoleComponent, /runtime_type/)
  })
})
