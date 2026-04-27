/**
 * LUMEOS Dispatcher V1.2.3
 *
 * Execution Engine — verbindet alle Runtime-Schichten:
 *   Schema → State → Skills → Model → Tool Gate → Audit → Finalize
 *
 * Integration in scheduler-api:
 *   dispatch-loop.ts: onDispatch → dispatchWorkorder(wo, { callModel, executeTool })
 *
 * Pflicht-Reihenfolge (nie ändern):
 *   1.  validate workorder schema
 *   2.  create run_id
 *   3.  state.startRun()
 *   4.  audit job_started
 *   5.  load agent + routing + skills
 *   6.  call model (vLLM API)
 *   7.  parse tool request
 *   8.  audit tool_call_requested
 *   9.  approval gate (wenn nötig)
 *   10. authorizeToolCall()
 *   11. audit allowed/blocked
 *   12. executeTool()
 *   13. state.addWrittenFile() + consumeApproval() NUR bei Erfolg
 *   14. audit executed/failed
 *   15. finalizeRun()
 */

import fs   from 'node:fs'
import path from 'node:path'
import Ajv  from 'ajv'

import * as state  from '../state/state-manager'
import * as audit  from '../state/audit-writer'
import { checkApproval, consumeApproval, operationMayRequireApproval } from '../approval/approval-gate'
import { authorizeToolCall } from '../agent-registry/authorize-tool-call'
import { loadSkills, buildSystemPrompt } from './skill-loader'
import {
  parseOrchestratorIntent,
  validateOrchestratorIntent,
  inferWorkorderType,
  type OrchestratorIntent,
} from './governance-validator'

// Maximale Anzahl Rewrite-Loops bei Governance-Verletzungen
const MAX_REWRITE_LOOPS = 2

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Workorder {
  workorder_id:          string
  run_id?:               string
  agent_id:              string
  task:                  string
  scope_files:           string[]
  context_files:         string[]
  acceptance_files:      string[]
  acceptance_criteria:   string[]
  negative_constraints:  string[]
  required_skills:       string[]
  optional_skills:       string[]
  blocked_by:            string[]
  phase?:                number
  requires_approval?:    boolean
  quality_critical?:     boolean
  priority?:             string
  correlation_id?:       string
}

export interface ToolRequest {
  tool:                'read' | 'write' | 'bash' | 'mcp'
  targetPath?:         string
  content?:            string
  command?:            string
  mcpTool?:            string
  mcpOperation?:       string
  approvalId?:         string
  approval_operation?: string
}

export interface ToolResult {
  success: boolean
  output?: unknown
  error?:  string
}

export interface DispatchResult {
  status:       'completed' | 'failed' | 'blocked' | 'awaiting_approval'
  run_id:       string
  workorder_id: string
  error?:       string
}

interface ModelRoutingEntry {
  node: string; model: string; temperature: number; max_context: number
}

export interface DispatcherDeps {
  callModel:   (routing: ModelRoutingEntry, system: string, user: string) => Promise<string>
  executeTool: (req: ToolRequest) => Promise<ToolResult>
}

// ─── Config ───────────────────────────────────────────────────────────────────

const AGENTS_PATH    = path.resolve(process.cwd(), 'system/agent-registry/agents.json')
const ROUTING_PATH   = path.resolve(process.cwd(), 'system/agent-registry/model_routing.json')
const WO_SCHEMA_PATH = path.resolve(process.cwd(), 'system/workorders/schemas/workorder.schema.json')

function loadJson<T>(p: string): T { return JSON.parse(fs.readFileSync(p, 'utf8')) }
function generateRunId(): string {
  const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  return `RUN-${stamp}-${String(Date.now()).slice(-4)}`
}
function loadAgentSpec(specFile: string): string {
  const full = path.resolve(process.cwd(), specFile)
  return fs.existsSync(full) ? fs.readFileSync(full, 'utf8') : ''
}

// ─── Schema Validation ────────────────────────────────────────────────────────

const ajv = new Ajv({ strict: false })
let validate: ReturnType<typeof ajv.compile> | null = null

function validateWorkorder(wo: unknown): { valid: boolean; errors?: string } {
  if (!validate) {
    if (!fs.existsSync(WO_SCHEMA_PATH)) return { valid: true }
    validate = ajv.compile(loadJson(WO_SCHEMA_PATH))
  }
  const valid = validate(wo)
  if (!valid) return { valid: false, errors: ajv.errorsText(validate.errors) }
  return { valid: true }
}

// ─── Tool Parser — plain JSON + fenced JSON ───────────────────────────────────

export function parseToolRequest(modelOutput: string): ToolRequest | null {
  const isToolReq = (obj: any): obj is ToolRequest =>
    obj && typeof obj.tool === 'string' && ['read', 'write', 'bash', 'mcp'].includes(obj.tool)

  // 1. Fenced JSON
  const fenced = modelOutput.match(/```json\s*(\{[\s\S]*?\})\s*```/)
  if (fenced) { try { const r = JSON.parse(fenced[1]); if (isToolReq(r)) return r } catch {} }

  // 2. Plain JSON (ganzes Output)
  const trimmed = modelOutput.trim()
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    try { const r = JSON.parse(trimmed); if (isToolReq(r)) return r } catch {}
  }

  // 3. JSON-Block im Text
  const inline = modelOutput.match(/\{[^{}]*"tool"\s*:\s*"(?:read|write|bash|mcp)"[^{}]*\}/)
  if (inline) { try { const r = JSON.parse(inline[0]); if (isToolReq(r)) return r } catch {} }

  return null
}

// ─── Approval Operation Inferenz ─────────────────────────────────────────────

function determineApprovalOperation(_agentId: string, req: ToolRequest): string | null {
  if (req.approval_operation) return req.approval_operation   // explizit bevorzugen
  if (req.tool === 'write' && req.targetPath) {
    const p = req.targetPath.replace(/\\/g, '/')
    if (p.startsWith('supabase/migrations/') || p.startsWith('db/migrations/')) return 'write_migration'
    if (p === 'package.json') return 'modify_dependency'
  }
  return null
}

// ─── Default Tool Executor ────────────────────────────────────────────────────
// ACHTUNG: Nur hinter Gateway aufrufen — nie direkt

export async function defaultExecuteTool(req: ToolRequest): Promise<ToolResult> {
  try {
    switch (req.tool) {
      case 'read': {
        if (!req.targetPath) return { success: false, error: 'targetPath fehlt' }
        return { success: true, output: fs.readFileSync(path.resolve(process.cwd(), req.targetPath), 'utf8') }
      }
      case 'write': {
        if (!req.targetPath)         return { success: false, error: 'targetPath fehlt' }
        if (req.content === undefined) return { success: false, error: 'content fehlt für write' }
        const full = path.resolve(process.cwd(), req.targetPath)
        fs.mkdirSync(path.dirname(full), { recursive: true })
        fs.writeFileSync(full, req.content, 'utf8')
        return { success: true, output: `written: ${req.targetPath}` }
      }
      case 'bash': {
        if (!req.command) return { success: false, error: 'command fehlt' }
        const { execSync } = await import('node:child_process')
        return { success: true, output: execSync(req.command, { encoding: 'utf8', timeout: 30_000 }) }
      }
      case 'mcp': {
        return { success: true, output: `mcp:${req.mcpTool}/${req.mcpOperation} dispatched` }
      }
    }
  } catch (e: any) { return { success: false, error: e.message } }
  return { success: false, error: 'unknown tool' }
}

// ─── Default Model Caller ─────────────────────────────────────────────────────

export async function defaultCallModel(
  routing: ModelRoutingEntry, systemPrompt: string, userMessage: string
): Promise<string> {
  const nodeIps: Record<string, string> = {
    'spark-a': '192.168.0.128', 'spark-b': '192.168.0.188',
    'spark1':  '192.168.0.128', 'spark2':  '192.168.0.188',
    'rtx5090': '127.0.0.1',
  }
  const endpoint = `http://${nodeIps[routing.node] ?? '127.0.0.1'}:8001/v1/chat/completions`
  const resp = await fetch(endpoint, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: routing.model, temperature: routing.temperature, max_tokens: 4096,
      messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userMessage }] }),
  })
  if (!resp.ok) throw new Error(`vLLM Error: ${resp.status} ${resp.statusText}`)
  return ((await resp.json()) as any).choices?.[0]?.message?.content ?? ''
}

// ─── Haupt-Funktion ───────────────────────────────────────────────────────────

export async function dispatchWorkorder(
  wo: Workorder,
  deps: DispatcherDeps = { callModel: defaultCallModel, executeTool: defaultExecuteTool }
): Promise<DispatchResult> {

  // ORCHESTR_MODE lokal — nicht als Modulkonstante
  const orchestrationMode = state.getOrchestrationMode()

  // 1. Schema
  const schema = validateWorkorder(wo)
  if (!schema.valid)
    return { status: 'failed', run_id: 'INVALID', workorder_id: wo.workorder_id, error: `Schema: ${schema.errors}` }

  // 2. Run ID + State
  const runId = generateRunId()
  wo.run_id   = runId
  await state.startRun(runId, wo.workorder_id, wo.agent_id, wo.correlation_id)
  await state.startWorkorder(wo.workorder_id, wo.agent_id, runId)
  audit.auditJobStarted({ run_id: runId, workorder_id: wo.workorder_id, agent_id: wo.agent_id, orchestration_mode: orchestrationMode })

  const jobStart = Date.now()

  try {
    // 3. Agent + Routing
    const agents   = loadJson<Record<string, any>>(AGENTS_PATH)
    const routings = loadJson<Record<string, any>>(ROUTING_PATH)
    const agentDef = agents[wo.agent_id]
    const routing  = routings[wo.agent_id]
    if (!agentDef) throw new Error(`Agent nicht in Registry: ${wo.agent_id}`)
    if (!routing)  throw new Error(`Routing nicht definiert: ${wo.agent_id}`)
    const activeRoute = routing.phase1_fallback ?? routing.default

    // 4. Skills
    const skills = loadSkills({ agentId: wo.agent_id, agentType: agentDef.type,
      requiredSkills: wo.required_skills, optionalSkills: wo.optional_skills,
      alwaysLoad: agentDef.always_load_skills ?? [], tokenBudget: agentDef.skill_token_budget ?? 4000 })
    if (skills.blocked) {
      await state.endRun(runId, 'blocked')
      audit.auditJobFailed({ run_id: runId, workorder_id: wo.workorder_id, agent_id: wo.agent_id, orchestration_mode: orchestrationMode, reason: skills.errors.join('; ') })
      return { status: 'blocked', run_id: runId, workorder_id: wo.workorder_id, error: skills.errors.join('; ') }
    }

    // 5. Model + Governance Validator Loop
    const systemPrompt = buildSystemPrompt(loadAgentSpec(agentDef.spec_file), skills.loaded)
    const woType = inferWorkorderType(wo.task)

    let modelOutput = ''
    let intent: OrchestratorIntent | null = null
    let rewriteCount = 0

    while (rewriteCount <= MAX_REWRITE_LOOPS) {
      modelOutput = await deps.callModel(activeRoute, systemPrompt, rewriteCount === 0
        ? wo.task
        : `REWRITE_REQUEST: Vorheriger Output war ungültig. Behebe folgende Verletzung und gib nur valides JSON zurück: ${intent ? JSON.stringify(intent) : modelOutput}`
      )

      // Versuche Intent zu parsen
      try {
        intent = parseOrchestratorIntent(modelOutput)
      } catch (e: any) {
        rewriteCount++
        audit.writeAuditEvent({ event: 'governance_parse_error', run_id: runId,
          workorder_id: wo.workorder_id, agent_id: wo.agent_id,
          orchestration_mode: orchestrationMode, reason: e.message, rewrite_attempt: rewriteCount })
        if (rewriteCount > MAX_REWRITE_LOOPS) {
          await state.endRun(runId, 'failed')
          return { status: 'failed', run_id: runId, workorder_id: wo.workorder_id,
            error: `Governance: Model-Output nicht parsebar nach ${MAX_REWRITE_LOOPS} Rewrite-Versuchen` }
        }
        continue
      }

      // Governance validieren
      const validation = validateOrchestratorIntent(intent, {
        approvalTokenPresent: wo.requires_approval === false,
        filesAllowed: wo.scope_files ?? [],
        workorderType: woType,
      })

      if (validation.status === 'PASS') break

      audit.writeAuditEvent({ event: 'governance_violation', run_id: runId,
        workorder_id: wo.workorder_id, agent_id: wo.agent_id,
        orchestration_mode: orchestrationMode, validation_status: validation.status,
        reason: validation.reason, field: validation.field, rewrite_attempt: rewriteCount })

      if (validation.status === 'BLOCKED') {
        await state.endRun(runId, 'blocked')
        return { status: 'blocked', run_id: runId, workorder_id: wo.workorder_id,
          error: `Governance BLOCKED: ${validation.reason}` }
      }

      if (validation.status === 'FAIL') {
        await state.endRun(runId, 'failed')
        return { status: 'failed', run_id: runId, workorder_id: wo.workorder_id,
          error: `Governance FAIL: ${validation.reason}` }
      }

      // REWRITE — nächste Iteration
      rewriteCount++
      if (rewriteCount > MAX_REWRITE_LOOPS) {
        await state.endRun(runId, 'failed')
        return { status: 'failed', run_id: runId, workorder_id: wo.workorder_id,
          error: `Governance: REWRITE-Limit (${MAX_REWRITE_LOOPS}) erreicht. Letzte Verletzung: ${validation.reason}` }
      }
    }

    // 6. Tool Request parsen
    const toolReq = parseToolRequest(modelOutput)
    if (!toolReq) {
      await state.endRun(runId, 'completed')
      audit.auditJobCompleted({ run_id: runId, workorder_id: wo.workorder_id, agent_id: wo.agent_id, orchestration_mode: orchestrationMode, duration_ms: Date.now() - jobStart })
      return { status: 'completed', run_id: runId, workorder_id: wo.workorder_id }
    }

    // 7. Audit requested
    audit.writeAuditEvent({ event: 'tool_call_requested', orchestration_mode: orchestrationMode,
      run_id: runId, workorder_id: wo.workorder_id, agent_id: wo.agent_id,
      tool: toolReq.tool, target_path: toolReq.targetPath, command: toolReq.command })

    // 8. Approval Gate
    const approvalOp    = determineApprovalOperation(wo.agent_id, toolReq)
    const needsApproval = agentDef.requires_human_approval || approvalOp !== null

    if (needsApproval && toolReq.approvalId) {
      const gate = checkApproval({ approvalId: toolReq.approvalId, runId, workorderId: wo.workorder_id,
        agentId: wo.agent_id, tool: toolReq.tool, targetPath: toolReq.targetPath, command: toolReq.command })
      if (!gate.allowed) {
        audit.auditToolBlocked({ run_id: runId, workorder_id: wo.workorder_id, agent_id: wo.agent_id,
          orchestration_mode: orchestrationMode, tool: toolReq.tool, target_path: toolReq.targetPath,
          command: toolReq.command, blocked_by: gate.blockedBy ?? 'approval_gate', reason: gate.reason })
        await state.endRun(runId, 'blocked')
        return { status: 'blocked', run_id: runId, workorder_id: wo.workorder_id, error: gate.reason }
      }
    } else if (needsApproval && !toolReq.approvalId) {
      audit.auditApprovalRequired({ run_id: runId, workorder_id: wo.workorder_id, agent_id: wo.agent_id,
        orchestration_mode: orchestrationMode, tool: toolReq.tool, target_path: toolReq.targetPath,
        approval_id: `NEEDED:${approvalOp}` })
      await state.updateWorkorderStatus(wo.workorder_id, 'awaiting_approval')
      await state.endRun(runId, 'awaiting_approval')
      return { status: 'awaiting_approval', run_id: runId, workorder_id: wo.workorder_id }
    }

    // 9. Permission Gateway — mcpTool + mcpOperation weitergeleitet
    const ctx = { scope_files: wo.scope_files, context_files: wo.context_files,
      acceptance_files: wo.acceptance_files, already_written_files: state.getWrittenFiles(runId) }
    const auth = authorizeToolCall(
      { agentId: wo.agent_id, workorderId: wo.workorder_id, tool: toolReq.tool,
        targetPath: toolReq.targetPath, command: toolReq.command,
        mcpTool: toolReq.mcpTool, mcpOperation: toolReq.mcpOperation },
      ctx, { sparkMode: state.getSparkMode() }
    )

    if (!auth.allowed) {
      audit.auditToolBlocked({ run_id: runId, workorder_id: wo.workorder_id, agent_id: wo.agent_id,
        orchestration_mode: orchestrationMode, tool: toolReq.tool, target_path: toolReq.targetPath,
        command: toolReq.command, blocked_by: auth.blockedBy ?? 'permission_gateway', reason: auth.reason })
      await state.endRun(runId, 'blocked')
      return { status: 'blocked', run_id: runId, workorder_id: wo.workorder_id, error: auth.reason }
    }
    audit.auditToolAllowed({ run_id: runId, workorder_id: wo.workorder_id, agent_id: wo.agent_id,
      orchestration_mode: orchestrationMode, tool: toolReq.tool, target_path: toolReq.targetPath, command: toolReq.command })

    // 10. Tool ausführen
    const t0         = Date.now()
    const toolResult = await deps.executeTool(toolReq)

    // 11. State + Approval NUR bei Erfolg
    if (toolResult.success) {
      if (toolReq.tool === 'write' && toolReq.targetPath) await state.addWrittenFile(runId, toolReq.targetPath)
      if (toolReq.approvalId) await consumeApproval(toolReq.approvalId)
      audit.auditToolExecuted({ run_id: runId, workorder_id: wo.workorder_id, agent_id: wo.agent_id,
        orchestration_mode: orchestrationMode, tool: toolReq.tool, target_path: toolReq.targetPath,
        command: toolReq.command, duration_ms: Date.now() - t0 })
    } else {
      audit.auditToolFailed({ run_id: runId, workorder_id: wo.workorder_id, agent_id: wo.agent_id,
        orchestration_mode: orchestrationMode, tool: toolReq.tool, target_path: toolReq.targetPath,
        command: toolReq.command, reason: toolResult.error, error_code: 'TOOL_EXECUTION_FAILED' })
    }

    // 12. Finalize
    const finalStatus = toolResult.success ? 'completed' : 'failed'
    await state.endRun(runId, finalStatus)
    await state.updateWorkorderStatus(wo.workorder_id, toolResult.success ? 'done' : 'failed')
    toolResult.success
      ? audit.auditJobCompleted({ run_id: runId, workorder_id: wo.workorder_id, agent_id: wo.agent_id, orchestration_mode: orchestrationMode, duration_ms: Date.now() - jobStart })
      : audit.auditJobFailed({ run_id: runId, workorder_id: wo.workorder_id, agent_id: wo.agent_id, orchestration_mode: orchestrationMode, reason: toolResult.error })

    return { status: toolResult.success ? 'completed' : 'failed', run_id: runId, workorder_id: wo.workorder_id, error: toolResult.error }

  } catch (err: any) {
    await state.endRun(runId, 'failed')
    audit.auditJobFailed({ run_id: runId, workorder_id: wo.workorder_id, agent_id: wo.agent_id, orchestration_mode: orchestrationMode, reason: err.message, error_code: 'DISPATCHER_ERROR' })
    return { status: 'failed', run_id: runId, workorder_id: wo.workorder_id, error: err.message }
  }
}
