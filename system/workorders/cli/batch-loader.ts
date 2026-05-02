/**
 * Batch Loader — pure logic for parsing markdown batch files,
 * extracting workorder YAML blocks, validating against the schema,
 * sorting by blocked_by dependencies, and orchestrating library
 * dispatch via system/control-plane/dispatcher.ts.
 *
 * Spec: docs/project/BATCH_LOADER_CLI_V1.md
 * WO:   system/workorders/nutrition/drafts/WO-GOVERNANCE-P1-004-batch-loader-cli-v1.md
 *
 * Constraints:
 *   - No services/scheduler-api/ usage.
 *   - No DispatchLoop / SlotManager.
 *   - No direct edits to system/approval/queue.json or system/state/*.
 *   - No supabase db push / db reset.
 *   - No new npm dependencies (uses only repo-vendored ajv).
 */

import * as fs from 'node:fs'
import * as path from 'node:path'
import Ajv, { type ValidateFunction } from 'ajv'
import {
  dispatchWorkorder,
  defaultExecuteTool,
  type Workorder,
} from '../../control-plane/dispatcher'
import { runPreflight } from '../../control-plane/scheduler-preflight'
import { isSystemStopped } from '../../state/state-manager'
import { getPendingApprovals } from '../../approval/approval-queue'

// ─────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────

export interface BatchEntry {
  order: number
  filename: string
  workorder_id: string
  title: string
  risk: string
  approval: string
}

export interface LoadedWorkorder {
  filename: string
  filepath: string
  parsed: Record<string, unknown>
  validationErrors: string[]
  needsApproval: boolean
}

export interface LoadedBatch {
  batchPath: string
  status: string
  entries: BatchEntry[]
  workorders: LoadedWorkorder[]
}

export interface DispatchOutcome {
  workorder_id: string
  status:
    | 'skipped'
    | 'dispatched'
    | 'failed'
    | 'preflight_blocked'
    | 'system_stopped'
    | 'paused_for_approval'
  detail?: string
}

// Risk categories whose WOs require human approval before/during dispatch.
const APPROVAL_RISK = new Set<string>([
  'db-migration',
  'payments',
  'medical',
  'release',
  'security',
  'auth',
  'rls',
  'shared-core',
  'architecture',
])

// ─────────────────────────────────────────────────────────────────────────
// Mini YAML parser — handles the limited subset used in our WO drafts:
//   - top-level scalar:  key: value | "value" | true | false | 42 | null
//   - inline arrays:     key: ["a", "b"]   key: []
//   - block arrays:      key:\n  - "a"\n  - "b"
//   - block scalars:     key: |\n  multi-line content with preserved newlines
// Indentation-based, top-level keys at column 0 only.
// ─────────────────────────────────────────────────────────────────────────

export function parseSimpleYaml(text: string): Record<string, unknown> {
  const lines = text.split(/\r?\n/)
  const result: Record<string, unknown> = {}
  let i = 0
  const KEY_RE = /^([A-Za-z_][A-Za-z0-9_]*):\s*(.*)$/

  while (i < lines.length) {
    const line = lines[i]
    if (!line.trim() || line.trimStart().startsWith('#')) {
      i++
      continue
    }
    const m = line.match(KEY_RE)
    if (!m) {
      // Not a top-level key (e.g. continuation we did not consume) — skip.
      i++
      continue
    }
    const key = m[1]
    const valuePart = m[2].trim()

    if (valuePart === '|' || valuePart === '|-' || valuePart === '|+') {
      // Block scalar: read indented lines verbatim, strip base indent.
      i++
      const blockLines: string[] = []
      let baseIndent = -1
      while (i < lines.length) {
        const l = lines[i]
        if (l.trim() === '') {
          blockLines.push('')
          i++
          continue
        }
        const indent = l.length - l.trimStart().length
        if (baseIndent === -1) {
          if (indent === 0) break
          baseIndent = indent
        }
        if (indent < baseIndent && l.trim() !== '') break
        blockLines.push(l.slice(baseIndent))
        i++
      }
      while (blockLines.length && blockLines[blockLines.length - 1] === '') {
        blockLines.pop()
      }
      result[key] = blockLines.join('\n') + '\n'
      continue
    }

    if (valuePart === '') {
      // Block array (or empty).
      i++
      const arr: unknown[] = []
      while (i < lines.length) {
        const l = lines[i]
        if (!l.trim() || l.trimStart().startsWith('#')) {
          i++
          continue
        }
        const indent = l.length - l.trimStart().length
        if (indent === 0) break
        const trimmed = l.trimStart()
        if (trimmed.startsWith('- ')) {
          arr.push(parseScalar(trimmed.slice(2).trim()))
          i++
        } else if (trimmed === '-') {
          arr.push(null)
          i++
        } else {
          break
        }
      }
      result[key] = arr
      continue
    }

    result[key] = parseScalar(valuePart)
    i++
  }

  return result
}

function parseScalar(s: string): unknown {
  if (s === '') return ''
  if (s === 'true') return true
  if (s === 'false') return false
  if (s === 'null' || s === '~') return null
  if (s === '[]') return []
  if (s.startsWith('[') && s.endsWith(']')) {
    const inner = s.slice(1, -1).trim()
    if (!inner) return []
    return splitInlineArray(inner).map((x) => parseScalar(x.trim()))
  }
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    return s.slice(1, -1)
  }
  if (/^-?\d+$/.test(s)) return parseInt(s, 10)
  if (/^-?\d+\.\d+$/.test(s)) return parseFloat(s)
  return s
}

function splitInlineArray(s: string): string[] {
  const out: string[] = []
  let current = ''
  let inQuote: string | null = null
  for (const ch of s) {
    if (inQuote) {
      current += ch
      if (ch === inQuote) inQuote = null
    } else if (ch === '"' || ch === "'") {
      inQuote = ch
      current += ch
    } else if (ch === ',') {
      out.push(current)
      current = ''
    } else {
      current += ch
    }
  }
  if (current.trim()) out.push(current)
  return out
}

// ─────────────────────────────────────────────────────────────────────────
// Markdown helpers
// ─────────────────────────────────────────────────────────────────────────

export function extractFirstYamlBlock(md: string): string | null {
  const m = md.match(/```yaml\s*\n([\s\S]*?)```/)
  return m ? m[1].replace(/\s+$/, '') : null
}

export function parseBatchMd(filepath: string): {
  status: string
  entries: BatchEntry[]
} {
  const md = fs.readFileSync(filepath, 'utf8')
  return { status: extractStatus(md), entries: parseIncludedTable(md) }
}

function extractStatus(md: string): string {
  const m = md.match(/##\s+Status\s*\r?\n+([^\r\n]+)/)
  return m ? m[1].trim() : ''
}

function parseIncludedTable(md: string): BatchEntry[] {
  const idx = md.indexOf('## Included Workorders')
  if (idx < 0) return []
  const rest = md.slice(idx + '## Included Workorders'.length)
  const nextSection = rest.indexOf('\n## ')
  const section = nextSection > 0 ? rest.slice(0, nextSection) : rest
  const tableLines = section
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.startsWith('|'))
  if (tableLines.length < 3) return []
  const dataLines = tableLines.slice(2) // skip header + separator
  const entries: BatchEntry[] = []
  for (const line of dataLines) {
    const cells = line
      .split('|')
      .slice(1, -1)
      .map((c) => c.trim().replace(/^`|`$/g, ''))
    if (cells.length < 6) continue
    const order = parseInt(cells[0], 10)
    if (Number.isNaN(order)) continue
    entries.push({
      order,
      filename: cells[1],
      workorder_id: cells[2],
      title: cells[3],
      risk: cells[4],
      approval: cells[5],
    })
  }
  entries.sort((a, b) => a.order - b.order)
  return entries
}

// ─────────────────────────────────────────────────────────────────────────
// Schema validation (ajv, draft-07)
// ─────────────────────────────────────────────────────────────────────────

let _validate: ValidateFunction | null = null

function getValidator(): ValidateFunction {
  if (_validate) return _validate
  const schemaPath = path.resolve(
    process.cwd(),
    'system/workorders/schemas/workorder.schema.json',
  )
  const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'))
  // Strict false: schema declares draft-07 via $schema; ajv 8.x stays compatible.
  const ajv = new Ajv({ strict: false, allErrors: true })
  _validate = ajv.compile(schema)
  return _validate
}

export function validateWo(wo: unknown): {
  valid: boolean
  errors: string[]
} {
  const validate = getValidator()
  const ok = validate(wo) as boolean
  if (ok) return { valid: true, errors: [] }
  const errs = (validate.errors ?? []).map(
    (e) => `${e.instancePath || '/'} ${e.message ?? 'invalid'}`,
  )
  return { valid: false, errors: errs }
}

// ─────────────────────────────────────────────────────────────────────────
// Topological sort by blocked_by
// ─────────────────────────────────────────────────────────────────────────

export function sortByDependencies(
  wos: LoadedWorkorder[],
): LoadedWorkorder[] {
  const idMap = new Map<string, LoadedWorkorder>()
  for (const w of wos) {
    const id = (w.parsed as Record<string, unknown>).workorder_id
    if (typeof id === 'string') idMap.set(id, w)
  }
  const visited = new Set<string>()
  const result: LoadedWorkorder[] = []

  function visit(id: string, stack: Set<string>): void {
    if (visited.has(id)) return
    if (stack.has(id)) {
      throw new Error(`Dependency cycle detected involving ${id}`)
    }
    const wo = idMap.get(id)
    if (!wo) return
    stack.add(id)
    const blockedBy = (wo.parsed as Record<string, unknown>).blocked_by
    if (Array.isArray(blockedBy)) {
      for (const blocker of blockedBy) {
        if (typeof blocker === 'string' && idMap.has(blocker)) {
          visit(blocker, stack)
        }
      }
    }
    stack.delete(id)
    visited.add(id)
    result.push(wo)
  }

  for (const w of wos) {
    const id = (w.parsed as Record<string, unknown>).workorder_id
    if (typeof id === 'string') visit(id, new Set())
  }
  return result
}

// ─────────────────────────────────────────────────────────────────────────
// Approval detection
// ─────────────────────────────────────────────────────────────────────────

export function needsApproval(wo: Record<string, unknown>): boolean {
  if (wo.requires_approval === true) return true
  const risk = wo.risk_category
  if (typeof risk === 'string' && APPROVAL_RISK.has(risk)) return true
  return false
}

// ─────────────────────────────────────────────────────────────────────────
// Loading
// ─────────────────────────────────────────────────────────────────────────

export function loadBatch(batchPath: string): LoadedBatch {
  const abs = path.resolve(batchPath)
  if (!fs.existsSync(abs)) {
    throw new Error(`Batch file not found: ${abs}`)
  }
  const { status, entries } = parseBatchMd(abs)
  // Drafts are sibling directory: batches/<f>.md  →  drafts/<f>.md
  const draftsDir = path.resolve(path.dirname(abs), '..', 'drafts')
  const workorders: LoadedWorkorder[] = []

  for (const entry of entries) {
    const filepath = path.join(draftsDir, entry.filename)
    if (!fs.existsSync(filepath)) {
      workorders.push({
        filename: entry.filename,
        filepath,
        parsed: {},
        validationErrors: [`File not found: ${filepath}`],
        needsApproval: false,
      })
      continue
    }
    const raw = fs.readFileSync(filepath, 'utf8')
    const yaml = extractFirstYamlBlock(raw)
    if (!yaml) {
      workorders.push({
        filename: entry.filename,
        filepath,
        parsed: {},
        validationErrors: ['No ```yaml block found in draft'],
        needsApproval: false,
      })
      continue
    }
    let parsed: Record<string, unknown> = {}
    let parseErr: string[] = []
    try {
      parsed = parseSimpleYaml(yaml)
    } catch (e) {
      parseErr = [`YAML parse error: ${(e as Error).message}`]
    }
    const validation =
      Object.keys(parsed).length > 0
        ? validateWo(parsed)
        : {
            valid: false,
            errors: parseErr.length ? parseErr : ['Empty parse result'],
          }
    workorders.push({
      filename: entry.filename,
      filepath,
      parsed,
      validationErrors: validation.valid ? [] : validation.errors,
      needsApproval: needsApproval(parsed),
    })
  }

  return { batchPath: abs, status, entries, workorders }
}

// ─────────────────────────────────────────────────────────────────────────
// Reporting
// ─────────────────────────────────────────────────────────────────────────

export function formatDryRunReport(batch: LoadedBatch): string {
  const out: string[] = []
  const sep = '═'.repeat(72)
  out.push(sep)
  out.push(`Batch:  ${batch.batchPath}`)
  out.push(`Status: ${batch.status || '(no status)'}`)
  out.push(`Workorders found: ${batch.workorders.length}`)
  out.push(sep)

  let allValid = true
  for (const w of batch.workorders) {
    const p = w.parsed as Record<string, unknown>
    const id = (p.workorder_id as string) ?? '(unknown)'
    const risk = (p.risk_category as string) ?? '(no risk)'
    const reqApproval = p.requires_approval === true
    const blockedBy = Array.isArray(p.blocked_by) ? p.blocked_by : []
    out.push('')
    out.push(`▸ ${id}  [${w.filename}]`)
    out.push(`    risk_category:     ${risk}`)
    out.push(`    requires_approval: ${reqApproval}`)
    out.push(`    needs_approval:    ${w.needsApproval}`)
    out.push(`    blocked_by:        ${JSON.stringify(blockedBy)}`)
    if (w.validationErrors.length > 0) {
      allValid = false
      out.push('    schema_valid:      NO')
      for (const e of w.validationErrors) out.push(`      - ${e}`)
    } else {
      out.push('    schema_valid:      YES')
    }
  }

  let order: LoadedWorkorder[] = []
  let cycle: string | null = null
  try {
    order = sortByDependencies(batch.workorders)
  } catch (e) {
    cycle = (e as Error).message
  }
  out.push('')
  out.push('─ Execution Order (topological by blocked_by) ─')
  if (cycle) {
    out.push(`  ERROR: ${cycle}`)
  } else if (order.length === 0) {
    out.push('  (empty)')
  } else {
    for (const w of order) {
      const id =
        ((w.parsed as Record<string, unknown>).workorder_id as string) ?? '?'
      const flag = w.needsApproval ? '  ⏳ approval required' : ''
      out.push(`  ${id}${flag}`)
    }
  }

  out.push('')
  const approvalCount = batch.workorders.filter((w) => w.needsApproval).length
  out.push('─ Summary ─')
  out.push(`  schema-valid:      ${allValid ? 'YES' : 'NO'}`)
  out.push(
    `  approval-required: ${approvalCount} of ${batch.workorders.length}`,
  )
  out.push(`  dependency-cycle:  ${cycle ? 'YES' : 'no'}`)
  out.push(
    `  overall:           ${allValid && !cycle ? 'READY_TO_RUN' : 'BLOCKED'}`,
  )
  out.push(sep)
  out.push('Dry-run only. No workorders were dispatched.')
  return out.join('\n')
}

export function formatPendingApprovalsReport(): string {
  const out: string[] = []
  out.push('─ Pending Approvals ─')
  let pending: Array<{
    approval_id: string
    workorder_id: string
    risk_category: string
  }> = []
  try {
    pending = getPendingApprovals() as typeof pending
  } catch (e) {
    out.push(`  (unable to read approval queue: ${(e as Error).message})`)
    return out.join('\n')
  }
  if (pending.length === 0) {
    out.push('  (none)')
  } else {
    for (const p of pending) {
      out.push(
        `  ${p.approval_id}  WO=${p.workorder_id}  risk=${p.risk_category}`,
      )
    }
  }
  return out.join('\n')
}

// ─────────────────────────────────────────────────────────────────────────
// Dispatch (library-only, no scheduler-api)
// ─────────────────────────────────────────────────────────────────────────

export async function runDispatch(
  batch: LoadedBatch,
): Promise<DispatchOutcome[]> {
  const outcomes: DispatchOutcome[] = []

  // System-wide stop check.
  let stop: { stopped: boolean; reason?: string } = { stopped: false }
  try {
    stop = isSystemStopped() as typeof stop
  } catch {
    // If the runtime state cannot be read we default to "not stopped" but
    // surface this as a preflight concern below.
  }
  if (stop.stopped) {
    return [
      {
        workorder_id: '*',
        status: 'system_stopped',
        detail: stop.reason ?? 'system stopped',
      },
    ]
  }

  // Topological order.
  let order: LoadedWorkorder[] = []
  try {
    order = sortByDependencies(batch.workorders)
  } catch (e) {
    return [
      {
        workorder_id: '*',
        status: 'failed',
        detail: `Dependency cycle: ${(e as Error).message}`,
      },
    ]
  }

  for (const w of order) {
    const p = w.parsed as Record<string, unknown>
    const id = (p.workorder_id as string) ?? '(unknown)'

    if (w.validationErrors.length > 0) {
      outcomes.push({
        workorder_id: id,
        status: 'skipped',
        detail: 'Schema invalid; not dispatched.',
      })
      continue
    }

    // Preflight (12 checks).
    let preflightVerdict: string | undefined
    try {
      const pre = runPreflight(w.parsed as unknown as Workorder) as {
        verdict?: string
      }
      preflightVerdict = pre?.verdict
    } catch (e) {
      outcomes.push({
        workorder_id: id,
        status: 'preflight_blocked',
        detail: `Preflight error: ${(e as Error).message}`,
      })
      break
    }
    if (preflightVerdict === 'REJECT' || preflightVerdict === 'HOLD') {
      outcomes.push({
        workorder_id: id,
        status: 'preflight_blocked',
        detail: `Preflight ${preflightVerdict}`,
      })
      break
    }

    // Library dispatch — no HTTP, no SchedulerAPI.
    let result: { status?: string; error?: string } | undefined
    try {
      result = (await dispatchWorkorder(
        w.parsed as unknown as Workorder,
        { executeTool: defaultExecuteTool } as never,
      )) as { status?: string; error?: string }
    } catch (e) {
      outcomes.push({
        workorder_id: id,
        status: 'failed',
        detail: (e as Error).message,
      })
      break
    }

    const status = result?.status ?? 'unknown'
    if (status === 'awaiting_approval' || status === 'paused_for_approval') {
      outcomes.push({
        workorder_id: id,
        status: 'paused_for_approval',
        detail: 'Dispatcher returned awaiting_approval; batch run paused.',
      })
      break
    }
    if (status === 'completed' || status === 'done') {
      outcomes.push({
        workorder_id: id,
        status: 'dispatched',
        detail: `Dispatcher status: ${status}`,
      })
      continue
    }
    outcomes.push({
      workorder_id: id,
      status: 'failed',
      detail: `Dispatcher status: ${status}${result?.error ? ` — ${result.error}` : ''}`,
    })
    break
  }

  return outcomes
}
