import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { mapDispatchStatusToWOState } from './workorder-repository'

describe('mapDispatchStatusToWOState', () => {
  it('preserves non-success dispatcher semantics for scheduler persistence', () => {
    assert.equal(mapDispatchStatusToWOState('completed'), 'done')
    assert.equal(mapDispatchStatusToWOState('failed'), 'failed')
    assert.equal(mapDispatchStatusToWOState('blocked'), 'blocked')
    assert.equal(mapDispatchStatusToWOState('awaiting_approval'), 'blocked')
  })
})
