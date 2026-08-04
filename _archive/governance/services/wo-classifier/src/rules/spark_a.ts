// Stage 1 → spark_a (Governance / High-reasoning)
// services/wo-classifier/src/rules/spark_a.ts
//
// spark_a is also the implicit catch-all fallback when no other stage matches.
// Explicit rules below are evaluated in order; first match wins.

import type { ClassifierRule } from './types'

export const sparkARules: ClassifierRule[] = [
  {
    when: (i) => i.type === 'planning' || i.type === 'governance',
    reason: 'governance: type=planning|governance',
  },
  {
    when: (i) => i.type === 'analysis' && i.risk === 'high',
    reason: 'governance: high-risk analysis',
  },
  {
    when: (i) => i.requires_reasoning === true && i.risk === 'high',
    reason: 'governance: requires_reasoning + risk=high',
  },
  {
    when: (i) => i.module === 'cross' && i.complexity === 'high',
    reason: 'governance: cross-module + complexity=high',
  },
  {
    when: (i) => i.requires_schema_change === true && i.risk === 'high',
    reason: 'governance: schema change + risk=high',
  },
]

/** Fallback reason when no other stage matched. */
export const SPARK_A_FALLBACK_REASON = 'governance: fallback (no other stage matched)'
