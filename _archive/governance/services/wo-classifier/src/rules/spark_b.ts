// Stage 2 → spark_b (Precision / DB-touching / High-risk impl)
// services/wo-classifier/src/rules/spark_b.ts

import type { ClassifierRule } from './types'

export const sparkBRules: ClassifierRule[] = [
  {
    when: (i) => i.db_access === 'migration',
    reason: 'precision: db_access=migration',
    needs_db_check: true,
  },
  {
    when: (i) => i.db_access === 'write' && (i.risk === 'medium' || i.risk === 'high'),
    reason: 'precision: db_access=write + risk≥medium',
    needs_db_check: true,
  },
  {
    when: (i) => i.type === 'implementation' && i.complexity === 'high' && i.risk === 'high',
    reason: 'precision: high-complexity high-risk implementation',
  },
  {
    when: (i) => i.module === 'auth' && i.type === 'implementation',
    reason: 'precision: auth implementation',
  },
  {
    when: (i) => i.requires_schema_change === true && i.risk === 'medium',
    reason: 'precision: schema change + risk=medium',
    needs_db_check: true,
  },
]
