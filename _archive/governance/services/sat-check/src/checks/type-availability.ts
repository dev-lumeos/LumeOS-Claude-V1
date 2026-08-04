// SAT-Check: Type Availability
// services/sat-check/src/checks/type-availability.ts
// Checks if required_types from GovernanceArtefakt exist in codebase

import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'
import type { GovernanceArtefaktV3, SATCheckResult } from '@lumeos/wo-core'

interface TypeCheckResult {
  result: SATCheckResult
  missing_types: string[]
  found_types: string[]
}

/**
 * Check if all required_types from the artefakt exist in target files.
 * Uses simple regex-based detection (not full AST parse).
 * Conservative: rejects if type cannot be confirmed.
 */
export function checkTypeAvailability(
  artefakt: GovernanceArtefaktV3,
  workspaceRoot: string = process.cwd()
): TypeCheckResult {
  const requiredTypes = artefakt.execution_context?.required_types ?? []
  const targetFiles = artefakt.execution_context?.target_files ?? []

  // If no required types, automatic pass
  if (requiredTypes.length === 0) {
    return {
      result: 'pass',
      missing_types: [],
      found_types: []
    }
  }

  const missing: string[] = []
  const found: string[] = []

  for (const reqType of requiredTypes) {
    const typeName = reqType.name
    let typeFound = false

    // Search in target files and common type locations
    const searchPaths = [
      ...targetFiles.map(f => f.path),
      'packages/types/src/**/*.ts',
      'packages/contracts/src/**/*.ts'
    ]

    for (const targetFile of targetFiles) {
      const filePath = resolve(workspaceRoot, targetFile.path)

      if (!existsSync(filePath)) continue

      try {
        const content = readFileSync(filePath, 'utf-8')

        // Check for type/interface definition
        const typePatterns = [
          new RegExp(`(type|interface)\\s+${typeName}\\s*(=|\\{|<)`, 'm'),
          new RegExp(`export\\s+(type|interface)\\s+${typeName}`, 'm')
        ]

        for (const pattern of typePatterns) {
          if (pattern.test(content)) {
            typeFound = true
            break
          }
        }

        if (typeFound) break
      } catch {
        // File read error — conservative reject
        continue
      }
    }

    if (typeFound) {
      found.push(typeName)
    } else {
      missing.push(typeName)
    }
  }

  return {
    result: missing.length === 0 ? 'pass' : 'reject',
    missing_types: missing,
    found_types: found
  }
}
