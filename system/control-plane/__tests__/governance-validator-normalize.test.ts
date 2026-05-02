/**
 * Tests für normalizeOrchestratorIntent + AGENT_VALIDATOR_MAP.
 *
 * Sichert die V1-Hardcoded-Map und ihre Wirkung VOR validateOrchestratorIntent ab.
 * Validator-Strenge ist nicht Teil dieses Tests — separate Test-Suite oder
 * Inline-Smoke-Tests.
 *
 * Run:
 *   npx tsx --test system/control-plane/__tests__/governance-validator-normalize.test.ts
 */

import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  AGENT_VALIDATOR_MAP,
  mapAgentToValidatorTarget,
  normalizeOrchestratorIntent,
  validateOrchestratorIntent,
  type OrchestratorIntent,
} from '../governance-validator'

// ─── Fixtures ─────────────────────────────────────────────────────────────────

function intent(overrides: Partial<OrchestratorIntent> = {}): OrchestratorIntent {
  return {
    selected_agent:  'micro-executor',
    risk_level:      'low',
    risks:           [],
    execution_order: [],
    required_gates:  ['human-approval-gate', 'review-gate'],
    stop_conditions: ['production_execution_without_approval_token'],
    ...overrides,
  }
}

// ─── AGENT_VALIDATOR_MAP — Inhalt ────────────────────────────────────────────

describe('AGENT_VALIDATOR_MAP', () => {

  it('mapped docs/test/i18n/mealcam/context-builder/governance-compiler/senior-coding → micro-executor', () => {
    assert.equal(AGENT_VALIDATOR_MAP['docs-agent'],          'micro-executor')
    assert.equal(AGENT_VALIDATOR_MAP['test-agent'],          'micro-executor')
    assert.equal(AGENT_VALIDATOR_MAP['i18n-agent'],          'micro-executor')
    assert.equal(AGENT_VALIDATOR_MAP['mealcam-agent'],       'micro-executor')
    assert.equal(AGENT_VALIDATOR_MAP['context-builder'],     'micro-executor')
    assert.equal(AGENT_VALIDATOR_MAP['governance-compiler'], 'micro-executor')
    assert.equal(AGENT_VALIDATOR_MAP['senior-coding-agent'], 'micro-executor')
    assert.equal(AGENT_VALIDATOR_MAP['micro-executor'],      'micro-executor')
  })

  it('db-migration-agent → db-migration-agent (identity)', () => {
    assert.equal(AGENT_VALIDATOR_MAP['db-migration-agent'], 'db-migration-agent')
  })

  it('security-specialist → security-specialist (identity)', () => {
    assert.equal(AGENT_VALIDATOR_MAP['security-specialist'], 'security-specialist')
  })

  it('review-agent → review-agent (identity)', () => {
    assert.equal(AGENT_VALIDATOR_MAP['review-agent'], 'review-agent')
  })

  it('alle Mapping-Targets liegen in ALLOWED_AGENTS', () => {
    const allowed = new Set(['micro-executor', 'db-migration-agent', 'security-specialist', 'review-agent'])
    for (const target of Object.values(AGENT_VALIDATOR_MAP)) {
      assert.ok(allowed.has(target), `Mapping-Target nicht in ALLOWED_AGENTS: ${target}`)
    }
  })

})

// ─── mapAgentToValidatorTarget — Helper ──────────────────────────────────────

describe('mapAgentToValidatorTarget', () => {

  it('bekannte agent_id → mapped target', () => {
    assert.equal(mapAgentToValidatorTarget('docs-agent'),         'micro-executor')
    assert.equal(mapAgentToValidatorTarget('db-migration-agent'), 'db-migration-agent')
  })

  it('unbekannte agent_id → undefined', () => {
    assert.equal(mapAgentToValidatorTarget('unknown-agent'), undefined)
    assert.equal(mapAgentToValidatorTarget(''),              undefined)
  })

})

// ─── normalizeOrchestratorIntent — Verhalten ─────────────────────────────────

describe('normalizeOrchestratorIntent', () => {

  it('lässt einen bereits gültigen selected_agent unverändert', () => {
    const input  = intent({ selected_agent: 'micro-executor' })
    const result = normalizeOrchestratorIntent(input, 'docs-agent')
    assert.equal(result.selected_agent, 'micro-executor')
    assert.equal(result, input, 'Sollte das Original-Objekt zurückgeben (Identität bei No-Op)')
  })

  it('lässt einen bereits gültigen db-migration-agent unverändert', () => {
    const input  = intent({ selected_agent: 'db-migration-agent' })
    const result = normalizeOrchestratorIntent(input, 'db-migration-agent')
    assert.equal(result.selected_agent, 'db-migration-agent')
  })

  it('ersetzt undefined selected_agent über AGENT_VALIDATOR_MAP[docs-agent] → micro-executor', () => {
    const input  = intent({ selected_agent: undefined as any })
    const result = normalizeOrchestratorIntent(input, 'docs-agent')
    assert.equal(result.selected_agent, 'micro-executor')
    assert.notEqual(result, input, 'Sollte ein neues Objekt zurückgeben (Immutability)')
  })

  it('ersetzt selected_agent das nicht in ALLOWED_AGENTS ist', () => {
    const input  = intent({ selected_agent: 'docs-agent' as any })
    const result = normalizeOrchestratorIntent(input, 'docs-agent')
    assert.equal(result.selected_agent, 'micro-executor')
  })

  it('ersetzt leeren string selected_agent über workorder.agent_id', () => {
    const input  = intent({ selected_agent: '' as any })
    const result = normalizeOrchestratorIntent(input, 'test-agent')
    assert.equal(result.selected_agent, 'micro-executor')
  })

  it('für db-migration-agent WO bleibt selected_agent db-migration-agent', () => {
    const input  = intent({ selected_agent: undefined as any })
    const result = normalizeOrchestratorIntent(input, 'db-migration-agent')
    assert.equal(result.selected_agent, 'db-migration-agent')
  })

  it('für unbekannte WO-agent_id bleibt intent unverändert (Validator entscheidet)', () => {
    const input  = intent({ selected_agent: undefined as any })
    const result = normalizeOrchestratorIntent(input, 'unknown-agent')
    assert.equal(result.selected_agent, undefined)
    assert.equal(result, input)
  })

  it('mutiert das Eingabe-Intent nicht (Immutability)', () => {
    const input  = intent({ selected_agent: undefined as any })
    const before = { ...input }
    normalizeOrchestratorIntent(input, 'docs-agent')
    assert.deepEqual(input, before)
  })

})

// ─── Integration: parse → normalize → validate ───────────────────────────────

describe('Integration normalize → validate', () => {

  it('Modell-Output ohne selected_agent + WO docs-agent → Validator PASS', () => {
    const fromModel = intent({ selected_agent: undefined as any })
    const normalized = normalizeOrchestratorIntent(fromModel, 'docs-agent')
    const validation = validateOrchestratorIntent(normalized, {
      approvalTokenPresent: true,                 // Skip production-keyword + human-approval-gate Pflichten
      filesAllowed: [],
    })
    assert.equal(validation.status, 'PASS')
  })

  it('Modell-Output mit fremdem selected_agent + WO db-migration-agent → Validator PASS nach Normalize', () => {
    const fromModel = intent({
      selected_agent: 'unknown-coder' as any,
      required_gates: [
        'db-migration-gate', 'rollback-gate', 'typecheck-gate',
        'test-gate', 'review-gate', 'files-scope-gate',
      ],
    })
    const normalized = normalizeOrchestratorIntent(fromModel, 'db-migration-agent')
    assert.equal(normalized.selected_agent, 'db-migration-agent')
    const validation = validateOrchestratorIntent(normalized, {
      approvalTokenPresent: true,
      filesAllowed: [],
    })
    assert.equal(validation.status, 'PASS')
  })

  it('unbekannte WO-agent_id + ungültiger Modell-Output → Validator REWRITE (kein Bypass)', () => {
    const fromModel = intent({ selected_agent: undefined as any })
    const normalized = normalizeOrchestratorIntent(fromModel, 'unknown-agent')
    const validation = validateOrchestratorIntent(normalized, {
      approvalTokenPresent: true,
      filesAllowed: [],
    })
    assert.equal(validation.status, 'REWRITE')
    assert.match(validation.reason ?? '', /Unbekannter Agent/)
  })

})
