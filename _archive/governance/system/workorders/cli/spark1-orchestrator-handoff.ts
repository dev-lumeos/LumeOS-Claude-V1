import fs from 'node:fs'
import path from 'node:path'

import {
  defaultCallModel,
  type ModelRoutingEntry,
  type Workorder,
} from '../../control-plane/dispatcher'
import { runModelRuntimeCheck } from '../../control-plane/model-runtime-check'
import {
  inferWorkorderType,
  mapAgentToValidatorTarget,
  normalizeOrchestratorIntent,
  parseOrchestratorIntent,
  validateOrchestratorIntent,
  extractFirstJsonObject,
  type OrchestratorIntent,
} from '../../control-plane/governance-validator'
import type { LoadedBatch } from './batch-loader'
import {
  SPARK1_ORCHESTRATION_MISSING_INTEGRATION,
  type OrchestrationModeStatus,
} from './orchestration-mode'

export interface Spark1WorkerAssignment {
  workorder_id: string
  assigned_agent: string
  rationale?: string
}

export interface Spark1OrchestratorHandoffResult {
  ok: boolean
  orchestration: OrchestrationModeStatus
  assignments: Spark1WorkerAssignment[]
  detail: string
}

export type OrchestratorModelCaller = (
  routing: ModelRoutingEntry,
  system: string,
  user: string,
) => Promise<string>

interface Spark1Intent extends OrchestratorIntent {
  worker_assignments?: Spark1WorkerAssignment[]
}

const ORCHESTRATOR_AGENT_ID = 'orchestrator-agent'

function loadRouting(): ModelRoutingEntry | null {
  const routingPath = path.resolve(process.cwd(), 'system/agent-registry/model_routing.json')
  if (!fs.existsSync(routingPath)) return null
  const routing = JSON.parse(fs.readFileSync(routingPath, 'utf8')) as Record<string, { default?: ModelRoutingEntry; phase1_fallback?: ModelRoutingEntry }>
  return routing[ORCHESTRATOR_AGENT_ID]?.phase1_fallback ?? routing[ORCHESTRATOR_AGENT_ID]?.default ?? null
}

function timeoutMsFor(route: ModelRoutingEntry): number {
  const routeWithTimeout = route as ModelRoutingEntry & { completion_probe_timeout_ms?: number; timeout_ms?: number }
  if (Number.isFinite(routeWithTimeout.completion_probe_timeout_ms) && Number(routeWithTimeout.completion_probe_timeout_ms) > 0) {
    return Number(routeWithTimeout.completion_probe_timeout_ms)
  }
  if (Number.isFinite(routeWithTimeout.timeout_ms) && Number(routeWithTimeout.timeout_ms) > 0) {
    return Number(routeWithTimeout.timeout_ms)
  }
  return 30000
}

function workorderSummary(batch: LoadedBatch): string {
  return batch.workorders.map(workorder => {
    const parsed = workorder.parsed
    const workorderId = typeof parsed.workorder_id === 'string' ? parsed.workorder_id : workorder.filename
    const agentId = typeof parsed.agent_id === 'string' ? parsed.agent_id : '<missing>'
    const risk = typeof parsed.risk_category === 'string' ? parsed.risk_category : '<missing>'
    const task = typeof parsed.task === 'string' ? parsed.task.replace(/\s+/g, ' ').slice(0, 500) : '<missing>'
    const blockedBy = Array.isArray(parsed.blocked_by) ? parsed.blocked_by.join(', ') : ''
    const scopeFiles = Array.isArray(parsed.scope_files)
      ? parsed.scope_files.filter((item): item is string => typeof item === 'string').join(', ')
      : ''
    return [
      `- workorder_id: ${workorderId}`,
      `  current_agent_id: ${agentId}`,
      `  risk_category: ${risk}`,
      `  blocked_by: ${blockedBy || '(none)'}`,
      `  scope_files: ${scopeFiles || '(none)'}`,
      `  task: ${task}`,
    ].join('\n')
  }).join('\n')
}

function buildSystemPrompt(): string {
  return [
    'You are Spark1 orchestrator-agent for the LumeOS governed batch operator.',
    'Inspect the batch/workorders and return exactly one JSON object. No prose.',
    'You are assigning the next worker path only; do not execute tools and do not write files.',
    'The JSON object must include the 6 OrchestratorIntent fields plus worker_assignments.',
    'worker_assignments must be an array of { "workorder_id": string, "assigned_agent": string, "rationale": string }.',
    'assigned_agent must match the current_agent_id when the existing workorder routing is already appropriate.',
    'Required exact JSON shape:',
    '{"selected_agent":"micro-executor","risk_level":"low","risks":[],"execution_order":["inspect batch","assign governed worker"],"required_gates":["files-scope-gate","review-gate"],"stop_conditions":[],"worker_assignments":[{"workorder_id":"WO-example-001","assigned_agent":"docs-agent","rationale":"existing governed route is appropriate"}]}',
  ].join('\n')
}

function buildUserPrompt(batch: LoadedBatch): string {
  return [
    `Batch path: ${batch.batchPath}`,
    `Batch status: ${batch.status || '(missing)'}`,
    '',
    'Workorders:',
    workorderSummary(batch),
    '',
    'Return a routing intent for this batch. Include one worker_assignments entry for each listed workorder.',
    'Do not include ToolRequest fields.',
  ].join('\n')
}

function parseSpark1Intent(output: string): Spark1Intent {
  const json = extractFirstJsonObject(output)
  if (!json) throw new Error('Spark1 orchestrator output did not contain a JSON object.')
  const parsed = JSON.parse(json) as Spark1Intent
  parseOrchestratorIntent(json)
  return parsed
}

function validateAssignments(batch: LoadedBatch, intent: Spark1Intent): { ok: boolean; detail: string; assignments: Spark1WorkerAssignment[] } {
  const assignments = Array.isArray(intent.worker_assignments) ? intent.worker_assignments : []
  if (assignments.length === 0) {
    return { ok: false, detail: 'Spark1 intent missing worker_assignments array.', assignments: [] }
  }

  const byId = new Map(batch.workorders.map(workorder => [String(workorder.parsed.workorder_id ?? workorder.filename), workorder]))
  for (const assignment of assignments) {
    if (!assignment || typeof assignment.workorder_id !== 'string' || typeof assignment.assigned_agent !== 'string') {
      return { ok: false, detail: 'Spark1 worker assignment must include string workorder_id and assigned_agent.', assignments }
    }
    const workorder = byId.get(assignment.workorder_id)
    if (!workorder) {
      return { ok: false, detail: `Spark1 assigned unknown workorder ${assignment.workorder_id}.`, assignments }
    }
    const expectedAgent = workorder.parsed.agent_id
    if (assignment.assigned_agent !== expectedAgent) {
      return {
        ok: false,
        detail: `Spark1 assigned ${assignment.workorder_id} to ${assignment.assigned_agent}, but current governed workorder route is ${String(expectedAgent)}.`,
        assignments,
      }
    }
  }

  for (const workorder of batch.workorders) {
    const workorderId = String(workorder.parsed.workorder_id ?? workorder.filename)
    if (!assignments.some(assignment => assignment.workorder_id === workorderId)) {
      return { ok: false, detail: `Spark1 did not assign workorder ${workorderId}.`, assignments }
    }
  }

  return { ok: true, detail: `Spark1 assigned ${assignments.length} workorder(s) to existing governed worker routes.`, assignments }
}

export async function runSpark1OrchestratorHandoff(
  batch: LoadedBatch,
  opts: { callModel?: OrchestratorModelCaller; skipRuntimeCheck?: boolean } = {},
): Promise<Spark1OrchestratorHandoffResult> {
  const base: OrchestrationModeStatus = {
    requested_orchestration_mode: 'spark1_orchestrated',
    actual_orchestration_mode: 'not_run',
    spark1_orchestrator_used: false,
    codex_role: 'none',
    worker_assignment_result: 'not assigned',
    missing_integration_point: '',
    reason: 'Spark1 orchestration was requested.',
    blocks_dispatch: true,
  }

  const route = loadRouting()
  if (!route) {
    return {
      ok: false,
      orchestration: {
        ...base,
        missing_integration_point: `${SPARK1_ORCHESTRATION_MISSING_INTEGRATION} Routing for ${ORCHESTRATOR_AGENT_ID} is missing.`,
        reason: 'Spark1/orchestrator-agent routing is unavailable.',
      },
      assignments: [],
      detail: `Routing for ${ORCHESTRATOR_AGENT_ID} is missing.`,
    }
  }

  if (!opts.skipRuntimeCheck) {
    const runtime = await runModelRuntimeCheck({
      agent: ORCHESTRATOR_AGENT_ID,
      checkEndpoints: true,
      probeMode: 'completion',
      timeoutMs: timeoutMsFor(route),
    })
    if (runtime.hasHighOrCriticalFindings) {
      const blocker = runtime.findings.find(item => item.blocks_operator)
      const detail = `${blocker?.message ?? runtime.readiness.reason} :: ${blocker?.evidence ?? runtime.next_required_action}`
      return {
        ok: false,
        orchestration: {
          ...base,
          missing_integration_point: detail,
          reason: 'Spark1/orchestrator-agent endpoint is unhealthy or unavailable.',
        },
        assignments: [],
        detail,
      }
    }
  }

  const firstWorkorder = batch.workorders[0]?.parsed as Workorder | undefined
  if (!firstWorkorder) {
    return {
      ok: false,
      orchestration: {
        ...base,
        missing_integration_point: 'Batch has no workorders for Spark1 assignment.',
        reason: 'Spark1/orchestrator-agent cannot assign an empty batch.',
      },
      assignments: [],
      detail: 'Batch has no workorders for Spark1 assignment.',
    }
  }

  const callModel = opts.callModel ?? defaultCallModel
  let lastInvalidDetail = ''
  let lastOutput = ''
  for (let attempt = 0; attempt < 3; attempt += 1) {
    let intent: Spark1Intent
    try {
      const userPrompt = attempt === 0
        ? buildUserPrompt(batch)
        : [
            'REWRITE_REQUEST: Your previous Spark1 routing intent was invalid.',
            `Invalid detail: ${lastInvalidDetail}`,
            'Return exactly one JSON object with all required fields:',
            'selected_agent, risk_level, risks, execution_order, required_gates, stop_conditions, worker_assignments.',
            'All array fields must be arrays, even when empty. Do not include prose or markdown fences.',
            `Previous output (truncated): ${lastOutput.slice(0, 500)}`,
            '',
            buildUserPrompt(batch),
          ].join('\n')
      lastOutput = await callModel(route, buildSystemPrompt(), userPrompt)
      intent = parseSpark1Intent(lastOutput)
    } catch (error) {
      lastInvalidDetail = error instanceof Error ? error.message : String(error)
      continue
    }

    const normalized = normalizeOrchestratorIntent(intent, firstWorkorder.agent_id, firstWorkorder.risk_category)
    const validation = validateOrchestratorIntent(normalized, {
      approvalTokenPresent: firstWorkorder.requires_approval === false,
      filesAllowed: firstWorkorder.scope_files ?? [],
      workorderType: inferWorkorderType(firstWorkorder.task),
      expectedAgent: mapAgentToValidatorTarget(firstWorkorder.agent_id),
    })
    if (validation.status !== 'PASS') {
      lastInvalidDetail = `Invalid Spark1 orchestrator intent: ${validation.status}${validation.field ? ` field=${validation.field}` : ''}${validation.reason ? ` reason=${validation.reason}` : ''}`
      continue
    }

    const assignmentValidation = validateAssignments(batch, intent)
    if (!assignmentValidation.ok) {
      lastInvalidDetail = assignmentValidation.detail
      continue
    }

    const assignmentText = assignmentValidation.assignments
      .map(assignment => `${assignment.workorder_id}->${assignment.assigned_agent}`)
      .join(', ')

    return {
      ok: true,
      orchestration: {
        requested_orchestration_mode: 'spark1_orchestrated',
        actual_orchestration_mode: 'spark1_orchestrated',
        spark1_orchestrator_used: true,
        codex_role: 'none',
        worker_assignment_result: assignmentText,
        missing_integration_point: '',
        reason: assignmentValidation.detail,
        blocks_dispatch: false,
      },
      assignments: assignmentValidation.assignments,
      detail: assignmentValidation.detail,
    }
  }

  const detail = lastInvalidDetail || 'Spark1/orchestrator-agent did not return a valid routing intent.'
  return {
    ok: false,
    orchestration: {
      ...base,
      missing_integration_point: detail,
      reason: 'Spark1/orchestrator-agent returned invalid routing intent.',
    },
    assignments: [],
    detail,
  }
}
