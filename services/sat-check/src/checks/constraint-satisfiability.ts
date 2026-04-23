// SAT-Check: Constraint Satisfiability
// services/sat-check/src/checks/constraint-satisfiability.ts
// Validates forbidden_patterns are not present in target files

import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'
import type { GovernanceArtefaktV3, SATCheckResult } from '@lumeos/wo-core'

interface ConstraintCheckResult {
  result: SATCheckResult
  violations: ConstraintViolation[]
}

interface ConstraintViolation {
  file: string
  constraint_type: 'forbidden_import' | 'forbidden_function' | 'forbidden_pattern'
  pattern: string
  line?: number
}

/**
 * Check that forbidden_patterns are not already present in target files.
 * This is a pre-execution gate to ensure constraints are satisfiable.
 */
export function checkConstraintSatisfiability(
  artefakt: GovernanceArtefaktV3,
  workspaceRoot: string = process.cwd()
): ConstraintCheckResult {
  const { forbidden_patterns } = artefakt.execution_context
  const targetFiles = artefakt.execution_context.target_files
  const violations: ConstraintViolation[] = []

  for (const target of targetFiles) {
    const filePath = resolve(workspaceRoot, target.path)

    if (!existsSync(filePath)) continue

    try {
      const content = readFileSync(filePath, 'utf-8')
      const lines = content.split('\n')

      // Check forbidden imports
      for (const forbiddenImport of forbidden_patterns.imports) {
        const importPattern = new RegExp(
          `(import|require).*['"\`]${escapeRegex(forbiddenImport)}['"\`]`,
          'gm'
        )
        const match = importPattern.exec(content)
        if (match) {
          const lineNum = content.substring(0, match.index).split('\n').length
          violations.push({
            file: target.path,
            constraint_type: 'forbidden_import',
            pattern: forbiddenImport,
            line: lineNum
          })
        }
      }

      // Check forbidden functions
      for (const forbiddenFunc of forbidden_patterns.functions) {
        const funcPattern = new RegExp(
          `\\b${escapeRegex(forbiddenFunc)}\\s*\\(`,
          'gm'
        )
        const match = funcPattern.exec(content)
        if (match) {
          const lineNum = content.substring(0, match.index).split('\n').length
          violations.push({
            file: target.path,
            constraint_type: 'forbidden_function',
            pattern: forbiddenFunc,
            line: lineNum
          })
        }
      }

      // Check forbidden regex patterns
      for (const regexStr of forbidden_patterns.regex) {
        try {
          const pattern = new RegExp(regexStr, 'gm')
          const match = pattern.exec(content)
          if (match) {
            const lineNum = content.substring(0, match.index).split('\n').length
            violations.push({
              file: target.path,
              constraint_type: 'forbidden_pattern',
              pattern: regexStr,
              line: lineNum
            })
          }
        } catch {
          // Invalid regex — skip but log
          console.warn(`Invalid forbidden regex: ${regexStr}`)
        }
      }

    } catch (err) {
      // File read error — conservative pass (already checked in scope_reachability)
      continue
    }
  }

  return {
    result: violations.length === 0 ? 'pass' : 'reject',
    violations
  }
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
