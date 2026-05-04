import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { filterApprovalResumeCandidates, mapDispatchStatusToWOState } from './workorder-repository'

describe('mapDispatchStatusToWOState', () => {
  it('preserves non-success dispatcher semantics for scheduler persistence', () => {
    assert.equal(mapDispatchStatusToWOState('completed'), 'done')
    assert.equal(mapDispatchStatusToWOState('failed'), 'failed')
    assert.equal(mapDispatchStatusToWOState('blocked'), 'blocked')
    assert.equal(mapDispatchStatusToWOState('awaiting_approval'), 'blocked')
  })
})

describe('filterApprovalResumeCandidates', () => {
  const readyWo = {
    wo_id: 'WO-ready',
    agent_type: 'micro-executor',
    state: 'ready',
  }
  const blockedWo = {
    wo_id: 'WO-blocked',
    agent_type: 'db-migration-agent',
    state: 'blocked',
  }

  it('keeps ready WOs and only resumes blocked WOs with granted approval', () => {
    const result = filterApprovalResumeCandidates(
      [readyWo, blockedWo] as any,
      ({ workorderId, agentId }) =>
        workorderId === 'WO-blocked' && agentId === 'db-migration-agent',
    )

    assert.deepEqual(result.map(wo => wo.wo_id), ['WO-ready', 'WO-blocked'])
  })

  it('does not load blocked WOs without granted approval', () => {
    const result = filterApprovalResumeCandidates(
      [readyWo, blockedWo] as any,
      () => false,
    )

    assert.deepEqual(result.map(wo => wo.wo_id), ['WO-ready'])
  })
})
