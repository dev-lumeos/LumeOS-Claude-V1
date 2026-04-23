// SAT-Check Routes
// services/sat-check/src/routes/check.ts

import { Hono } from 'hono'
import type { GovernanceArtefaktV3, SATCheckOutput } from '@lumeos/wo-core'
import { checkTypeAvailability } from '../checks/type-availability'
import { checkScopeReachability } from '../checks/scope-reachability'
import { checkConstraintSatisfiability } from '../checks/constraint-satisfiability'

export const checkRoutes = new Hono()

// POST /check — Run SAT-Check on GovernanceArtefaktV3
checkRoutes.post('/', async (c) => {
  const body = await c.req.json<{ artefakt?: GovernanceArtefaktV3 } | GovernanceArtefaktV3>()

  // Support both {artefakt: {...}} and direct artefakt
  const artefakt: GovernanceArtefaktV3 = 'artefakt' in body && body.artefakt
    ? body.artefakt
    : body as GovernanceArtefaktV3

  const workspaceRoot = process.env.WORKSPACE_ROOT || process.cwd()

  // Run all three checks
  const typeResult = checkTypeAvailability(artefakt, workspaceRoot)
  const scopeResult = checkScopeReachability(artefakt, workspaceRoot)
  const constraintResult = checkConstraintSatisfiability(artefakt, workspaceRoot)

  // Aggregate results — conservative: any reject = overall reject
  const allPass =
    typeResult.result === 'pass' &&
    scopeResult.result === 'pass' &&
    constraintResult.result === 'pass'

  const output: SATCheckOutput = {
    result: allPass ? 'pass' : 'reject',
    checks: {
      type_availability: typeResult.result,
      scope_reachability: scopeResult.result,
      constraint_satisfiability: constraintResult.result
    }
  }

  // Add failure details if rejected
  if (!allPass) {
    const hints: string[] = []

    if (typeResult.result === 'reject') {
      hints.push(`Missing types: ${typeResult.missing_types.join(', ')}`)
    }
    if (scopeResult.result === 'reject') {
      hints.push(`Scope errors: ${scopeResult.errors.join('; ')}`)
    }
    if (constraintResult.result === 'reject') {
      const violations = constraintResult.violations
        .map(v => `${v.file}:${v.line} - ${v.constraint_type}: ${v.pattern}`)
        .join('; ')
      hints.push(`Constraint violations: ${violations}`)
    }

    output.failure_code = 'SAT_CHECK_FAILED'
    output.constraint_hint = hints.join(' | ')
  }

  return c.json(output)
})

// GET /check/health — Check service readiness
checkRoutes.get('/health', (c) => {
  return c.json({ ready: true })
})
