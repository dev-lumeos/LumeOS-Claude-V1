// SAT-Check: Scope Reachability
// services/sat-check/src/checks/scope-reachability.ts
// Validates target_files exist and line budgets are reasonable

import { readFileSync, existsSync, statSync } from 'fs'
import { createHash } from 'crypto'
import { resolve } from 'path'
import type { GovernanceArtefaktV3, SATCheckResult } from '@lumeos/wo-core'

interface ScopeCheckResult {
  result: SATCheckResult
  errors: string[]
  file_states: FileState[]
}

interface FileState {
  path: string
  exists: boolean
  line_count: number
  checksum_match: boolean
  budget_feasible: boolean
}

/**
 * Check if all target_files are reachable and within line budgets.
 * - must_exist files must exist
 * - checksum_before must match current file hash
 * - max_lines_changed must be <= 50% of file size (heuristic)
 */
export function checkScopeReachability(
  artefakt: GovernanceArtefaktV3,
  workspaceRoot: string = process.cwd()
): ScopeCheckResult {
  const targetFiles = artefakt.execution_context.target_files
  const errors: string[] = []
  const fileStates: FileState[] = []

  for (const target of targetFiles) {
    const filePath = resolve(workspaceRoot, target.path)
    const state: FileState = {
      path: target.path,
      exists: false,
      line_count: 0,
      checksum_match: false,
      budget_feasible: false
    }

    // Check existence
    if (!existsSync(filePath)) {
      if (target.must_exist) {
        errors.push(`File must exist but not found: ${target.path}`)
      }
      fileStates.push(state)
      continue
    }

    state.exists = true

    try {
      const content = readFileSync(filePath, 'utf-8')
      const lines = content.split('\n')
      state.line_count = lines.length

      // Checksum verification
      const actualChecksum = 'sha256:' + createHash('sha256')
        .update(content)
        .digest('hex')
        .substring(0, 8) // Short hash for comparison

      // Allow partial match (first 8 chars) or full match
      const expectedPrefix = target.checksum_before.replace('sha256:', '').substring(0, 8)
      const actualPrefix = actualChecksum.replace('sha256:', '').substring(0, 8)

      state.checksum_match = expectedPrefix === actualPrefix ||
        target.checksum_before === 'sha256:any' // Allow wildcard for new files

      if (!state.checksum_match) {
        errors.push(`Checksum mismatch for ${target.path}: expected ${expectedPrefix}, got ${actualPrefix}`)
      }

      // Line budget heuristic: max_lines_changed should be <= 50% of file
      // This prevents unrealistic expectations
      const maxReasonable = Math.max(state.line_count * 0.5, 20) // At least 20 lines
      state.budget_feasible = target.max_lines_changed <= maxReasonable

      if (!state.budget_feasible) {
        errors.push(`Line budget ${target.max_lines_changed} exceeds 50% of file size (${state.line_count} lines): ${target.path}`)
      }

    } catch (err) {
      errors.push(`Cannot read file: ${target.path}`)
    }

    fileStates.push(state)
  }

  return {
    result: errors.length === 0 ? 'pass' : 'reject',
    errors,
    file_states: fileStates
  }
}
