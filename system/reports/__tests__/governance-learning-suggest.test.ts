import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { suggestGovernanceLearning } from '../governance-learning-suggest'

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

  it('classifies model runtime blockers as regression learning candidates', () => {
    const suggestion = suggestGovernanceLearning({
      finalState: 'MODEL_RUNTIME_BLOCKED',
      blockers: ['senior-reviewer-agent timeout'],
    })

    assert.equal(suggestion.learning_recommended, true)
    assert.equal(suggestion.suggested_record_type, 'regression')
  })
})
