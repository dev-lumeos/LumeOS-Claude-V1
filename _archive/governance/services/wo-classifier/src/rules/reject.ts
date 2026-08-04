// Stage 0 — Reject preflight.
// services/wo-classifier/src/rules/reject.ts

import type { WOClassifierInput } from '@lumeos/wo-core'

export interface RejectResult {
  rejected: boolean
  reason?: string
}

const REQUIRED_FIELDS: Array<keyof WOClassifierInput> = [
  'id',
  'title',
  'type',
  'module',
  'complexity',
  'risk',
  'requires_reasoning',
  'requires_schema_change',
  'db_access',
  'files_allowed',
  'acceptance_criteria',
  'created_by',
]

export function checkRejectPreflight(input: WOClassifierInput): RejectResult {
  const missing: string[] = []
  for (const f of REQUIRED_FIELDS) {
    const v = input[f]
    if (v === undefined || v === null) missing.push(f)
    else if (typeof v === 'string' && v.length === 0) missing.push(f)
  }
  if (missing.length > 0) {
    return { rejected: true, reason: `Missing fields: ${missing.join(', ')}` }
  }

  if (!Array.isArray(input.files_allowed) || input.files_allowed.length === 0) {
    return { rejected: true, reason: 'files_allowed must contain at least one entry' }
  }
  if (input.files_allowed.length === 1 && input.files_allowed[0] === '*') {
    return {
      rejected: true,
      reason: 'files_allowed cannot be a single wildcard "*"; declare explicit scope',
    }
  }

  if (!Array.isArray(input.acceptance_criteria) || input.acceptance_criteria.length === 0) {
    return { rejected: true, reason: 'acceptance_criteria must contain at least one entry' }
  }

  if (input.requires_schema_change && input.created_by !== 'human') {
    return {
      rejected: true,
      reason: `requires_schema_change requires created_by='human' (got '${input.created_by}')`,
    }
  }

  return { rejected: false }
}
