// Stage 4 → spark_d (Specialist) — STUB: hardware not yet available; falls back to spark_b.
// services/wo-classifier/src/rules/spark_d.ts

import type { ClassifierRule } from './types'

const SENSITIVE_REVIEW_MODULES = new Set(['nutrition', 'supplement', 'medical'])

export const sparkDRules: ClassifierRule[] = [
  {
    when: (i) => i.type === 'test' && (i.complexity === 'medium' || i.complexity === 'high'),
    reason: 'specialist: medium/high test',
  },
  {
    when: (i) => i.type === 'review' && SENSITIVE_REVIEW_MODULES.has(i.module),
    reason: 'specialist: review of sensitive domain (nutrition/supplement/medical)',
  },
  {
    when: (i) => i.type === 'review' && i.db_access !== 'none',
    reason: 'specialist: review with DB access',
  },
  {
    when: (i) => i.type === 'docs' && i.module === 'cross',
    reason: 'specialist: cross-module docs',
  },
  {
    when: (i) => i.requires_schema_change === true,
    reason: 'specialist: schema change (parallel to spark_b)',
  },
]
