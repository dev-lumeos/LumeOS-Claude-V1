import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { verifyNutritionP1SchemaStatic } from '../verify-p1-schema-static'

describe('Nutrition P1-004 static schema verification', () => {
  it('passes committed Nutrition P1 schema migration invariants', () => {
    const result = verifyNutritionP1SchemaStatic()
    assert.equal(
      result.passed,
      true,
      result.checks
        .filter(check => !check.passed)
        .map(check => `${check.name}: ${check.detail}`)
        .join('\n'),
    )
  })
})
