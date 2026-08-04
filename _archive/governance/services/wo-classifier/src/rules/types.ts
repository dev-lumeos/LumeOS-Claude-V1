// services/wo-classifier/src/rules/types.ts

import type { SparkTarget, WOClassifierInput } from '@lumeos/wo-core'

export interface ClassifierRule {
  /** Predicate that returns true when this rule applies. */
  when: (input: WOClassifierInput) => boolean
  /** Routing reason emitted into WORouting.routing_reason on match. */
  reason: string
  /** Set to true when the rule implies a DB pre-flight (RLS / migration check). */
  needs_db_check?: boolean
}

export interface RuleStage {
  stage: 0 | 1 | 2 | 3 | 4
  target: SparkTarget | 'REJECT'
  rules: ClassifierRule[]
}
