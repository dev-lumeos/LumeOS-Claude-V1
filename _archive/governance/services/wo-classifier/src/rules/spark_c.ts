// Stage 3 → spark_c (Bulk) — STUB: hardware not yet available; falls back to spark_b.
// services/wo-classifier/src/rules/spark_c.ts

import type { ClassifierRule } from './types'

export const sparkCRules: ClassifierRule[] = [
  {
    when: (i) => i.type === 'implementation' && i.complexity === 'low' && i.risk === 'low',
    reason: 'bulk: low impl',
  },
  {
    when: (i) =>
      i.type === 'implementation' &&
      i.complexity === 'medium' &&
      i.risk === 'low' &&
      i.db_access === 'none',
    reason: 'bulk: medium impl, no DB',
  },
  {
    when: (i) => i.type === 'docs' && i.module !== 'cross',
    reason: 'bulk: single-module docs',
  },
  {
    when: (i) => i.type === 'test' && i.complexity === 'low',
    reason: 'bulk: low-complexity test',
  },
]
