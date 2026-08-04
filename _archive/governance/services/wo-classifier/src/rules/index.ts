// services/wo-classifier/src/rules/index.ts
//
// Routing dispatcher. Stages are evaluated in fixed order; first explicit
// match wins. Spark C and D are not yet deployed — their matches transparently
// fall back to spark_b with the original reason annotated. When none of stages
// 1-4 match, spark_a is used as the catch-all fallback.

import type {
  WOClassifierInput,
  WORouting,
  WOPriority,
  SparkTarget,
} from '@lumeos/wo-core'

import { sparkARules, SPARK_A_FALLBACK_REASON } from './spark_a'
import { sparkBRules } from './spark_b'
import { sparkCRules } from './spark_c'
import { sparkDRules } from './spark_d'
import type { ClassifierRule } from './types'

const SPARK_C_AVAILABLE = false
const SPARK_D_AVAILABLE = false

interface MatchResult {
  rule: ClassifierRule
  origin: SparkTarget
  effective: SparkTarget
}

function findFirstMatch(rules: ClassifierRule[], input: WOClassifierInput): ClassifierRule | null {
  for (const r of rules) if (r.when(input)) return r
  return null
}

function fallbackOrSelf(target: SparkTarget): SparkTarget {
  if (target === 'spark_c' && !SPARK_C_AVAILABLE) return 'spark_b'
  if (target === 'spark_d' && !SPARK_D_AVAILABLE) return 'spark_b'
  return target
}

export function getPriority(input: WOClassifierInput): WOPriority {
  if (input.risk === 'high' || input.requires_schema_change) return 1 // HIGH
  if (input.risk === 'medium') return 2 // NORMAL
  if (input.type === 'docs') return 3 // LOW
  return 2 // NORMAL
}

export function classify(input: WOClassifierInput): WORouting {
  // Stage order: 1 (a), 2 (b), 3 (c), 4 (d). spark_a is also catch-all.
  const stages: Array<{ origin: SparkTarget; rules: ClassifierRule[] }> = [
    { origin: 'spark_a', rules: sparkARules },
    { origin: 'spark_b', rules: sparkBRules },
    { origin: 'spark_c', rules: sparkCRules },
    { origin: 'spark_d', rules: sparkDRules },
  ]

  let matched: MatchResult | null = null
  for (const stage of stages) {
    const r = findFirstMatch(stage.rules, input)
    if (r) {
      matched = { rule: r, origin: stage.origin, effective: fallbackOrSelf(stage.origin) }
      break
    }
  }

  if (!matched) {
    return {
      assigned_spark: 'spark_a',
      assigned_by: 'classifier',
      routing_reason: SPARK_A_FALLBACK_REASON,
      needs_db_check: false,
      priority: getPriority(input),
      status: 'QUEUED',
    }
  }

  const reason =
    matched.origin !== matched.effective
      ? `${matched.rule.reason} → ${matched.effective} (${matched.origin} not yet available)`
      : matched.rule.reason

  return {
    assigned_spark: matched.effective,
    assigned_by: 'classifier',
    routing_reason: reason,
    needs_db_check: matched.rule.needs_db_check === true,
    priority: getPriority(input),
    status: 'QUEUED',
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Introspection — exposed via GET /rules
// ────────────────────────────────────────────────────────────────────────────

export interface RuleDescriptor {
  stage: 1 | 2 | 3 | 4
  origin: SparkTarget
  effective: SparkTarget
  reason: string
  needs_db_check: boolean
}

export function getAllRules(): RuleDescriptor[] {
  const out: RuleDescriptor[] = []
  const stages: Array<{ stage: 1 | 2 | 3 | 4; origin: SparkTarget; rules: ClassifierRule[] }> = [
    { stage: 1, origin: 'spark_a', rules: sparkARules },
    { stage: 2, origin: 'spark_b', rules: sparkBRules },
    { stage: 3, origin: 'spark_c', rules: sparkCRules },
    { stage: 4, origin: 'spark_d', rules: sparkDRules },
  ]
  for (const s of stages) {
    for (const r of s.rules) {
      out.push({
        stage: s.stage,
        origin: s.origin,
        effective: fallbackOrSelf(s.origin),
        reason: r.reason,
        needs_db_check: r.needs_db_check === true,
      })
    }
  }
  return out
}
