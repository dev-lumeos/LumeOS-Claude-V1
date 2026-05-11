import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

export type ModelRuntimeSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info'
export type ModelRuntimeOverallStatus =
  | 'HEALTHY'
  | 'DEGRADED_OPTIONAL'
  | 'BLOCKED_REQUIRED_FAILURE'
  | 'STALE_HISTORY'
  | 'PLANNED_MAINTENANCE'
  | 'RECHECK_REQUIRED'
  | 'UNKNOWN_NOT_CHECKED'
export type ModelRuntimeFreshnessStatus = 'fresh' | 'stale' | 'not_checked' | 'unknown' | 'maintenance'

export interface ModelRuntimeMaintenanceState {
  planned_maintenance: boolean
  classification?: 'planned_hardware_maintenance' | string
  reason?: string
  started_at?: string
  affected_nodes?: string[]
  affected_runtime_types?: string[]
  blocks_runtime_dependent_runs?: boolean
  requires_recheck_after?: boolean
}

export interface ModelRuntimeReadiness {
  overall_status: ModelRuntimeOverallStatus
  readiness: 'ready' | 'degraded' | 'blocked' | 'unknown'
  reason: string
  freshness_status: ModelRuntimeFreshnessStatus
  last_checked_at?: string
  age_ms: number | null
  age_minutes: number | null
  stale_after_minutes: number
  planned_maintenance: boolean
  maintenance_classification?: string
  blocking_impact: string
  next_required_action: string
}

export interface ModelRuntimeFinding {
  id: string
  severity: ModelRuntimeSeverity
  layer: string
  agent?: string
  model?: string
  endpoint?: string
  message: string
  evidence: string
  suggested_action: string
  blocks_operator: boolean
  blocks_product_work: boolean
}

export interface ModelRuntimeSummary {
  critical: number
  high: number
  medium: number
  low: number
  info: number
}

export interface ModelRuntimeRoute {
  agent: string
  node?: string
  model?: string
  endpoint?: string
  runtime_type?: 'openai-compatible-http' | 'vllm' | 'codex-cli' | 'external' | string
  healthcheck?: 'http' | 'config' | 'manual' | string
  temperature?: number
  optional_runtime?: boolean
  runtime_required?: 'always' | 'on_demand' | string
  json_required: boolean
  qwen_thinking_off_required: boolean
  endpoint_status?: 'not_checked' | 'ok' | 'unreachable' | 'optional_offline' | 'external_ok' | 'planned_maintenance'
  latency_ms?: number | null
  timed_out?: boolean
}

export interface ModelRuntimeCheckResult {
  schema_version: 1
  generated_at: string
  repo_root: string
  check_endpoints: boolean
  overall_status: ModelRuntimeOverallStatus
  readiness: ModelRuntimeReadiness
  freshness_status: ModelRuntimeFreshnessStatus
  last_checked_at?: string
  planned_maintenance: {
    active: boolean
    classification?: string
    reason?: string
  }
  blocking_impact: string
  next_required_action: string
  hasHighOrCriticalFindings: boolean
  exitCode: 0 | 1 | 2
  summary: ModelRuntimeSummary
  product_work_gate: {
    status: 'blocked'
    reason: string
  }
  routes: ModelRuntimeRoute[]
  findings: ModelRuntimeFinding[]
}

export interface ModelRuntimeCheckOptions {
  repoRoot?: string
  projectId?: string
  agent?: string
  checkEndpoints?: boolean
  timeoutMs?: number
  fetchImpl?: typeof fetch
  recordHistory?: boolean
  historyDir?: string
  plannedMaintenance?: ModelRuntimeMaintenanceState
  staleAfterMinutes?: number
  now?: Date
}

export interface ModelRuntimeHistoryRecord {
  timestamp: string
  project_id: string
  route_id: string
  agent: string
  model?: string
  runtime_type: string
  endpoint?: string
  required: boolean
  optional: boolean
  endpoint_status: string
  latency_ms: number | null
  timed_out: boolean
  severity: ModelRuntimeSeverity
  finding_ids: string[]
  product_gate_state: string
  check_endpoints: boolean
}

export interface ModelRuntimeHistoryRouteSummary {
  route_id: string
  agent: string
  model?: string
  runtime_type: string
  endpoint?: string
  current_route: boolean
  required: boolean
  optional: boolean
  last_status: string
  failures_count: number
  timeout_count: number
  average_latency_ms: number | null
  max_latency_ms: number | null
  last_ok?: string
  last_failure?: string
  finding_ids: string[]
}

export interface ModelRuntimeHistorySummary {
  generated_at: string
  project_id: string
  history_path: string
  total_records: number
  total_checks: number
  time_range: { from?: string; to?: string }
  overall_readiness: 'RUNTIME_HEALTHY' | 'RUNTIME_DEGRADED' | 'RUNTIME_BLOCKED' | 'UNKNOWN'
  overall_status: ModelRuntimeOverallStatus
  readiness: ModelRuntimeReadiness
  freshness_status: ModelRuntimeFreshnessStatus
  last_checked_at?: string
  age_ms: number | null
  age_minutes: number | null
  stale_after_minutes: number
  planned_maintenance: {
    active: boolean
    classification?: string
    reason?: string
  }
  blocking_impact: string
  next_required_action: string
  routes: ModelRuntimeHistoryRouteSummary[]
}

type AgentsRegistry = Record<string, any> & {
  agents?: Array<{ id?: string; spec_file?: string; type?: string }>
}

type ModelRoutingFile = Record<string, any> & {
  routes?: Record<string, any>
}

const PRODUCT_GATE_REASON = 'Product work remains blocked unless Tom explicitly opens it; autonomous/night/large runs remain blocked until model runtime health is proven.'
const DEFAULT_TIMEOUT_MS = 1500
const DEFAULT_STALE_AFTER_MINUTES = 60
const DEFAULT_PROJECT_ID = 'lumeos'
const HISTORY_DIR = 'system/reports/model-runtime-history'
const HISTORY_FILE = 'history.jsonl'
const LATEST_FILE = 'latest.json'
const MAINTENANCE_FILE = 'system/control-plane/runtime-maintenance.json'

function readText(repoRoot: string, relativePath: string): string {
  const fullPath = path.join(repoRoot, relativePath)
  return fs.existsSync(fullPath) ? fs.readFileSync(fullPath, 'utf8') : ''
}

function readJson<T>(repoRoot: string, relativePath: string, fallback: T): { value: T; error?: string } {
  const fullPath = path.join(repoRoot, relativePath)
  if (!fs.existsSync(fullPath)) return { value: fallback, error: `missing file: ${relativePath}` }
  try {
    return { value: JSON.parse(fs.readFileSync(fullPath, 'utf8')) as T }
  } catch (error) {
    return { value: fallback, error: error instanceof Error ? error.message : String(error) }
  }
}

function loadRuntimeMaintenance(repoRoot: string): ModelRuntimeMaintenanceState {
  const fromFile = readJson<ModelRuntimeMaintenanceState | null>(repoRoot, MAINTENANCE_FILE, null)
  if (fromFile.value && typeof fromFile.value === 'object') {
    return {
      ...fromFile.value,
      planned_maintenance: fromFile.value.planned_maintenance === true,
    }
  }

  const envValue = process.env.LUMEOS_RUNTIME_PLANNED_MAINTENANCE
  if (envValue && envValue !== '0' && envValue.toLowerCase() !== 'false') {
    return {
      planned_maintenance: true,
      classification: envValue === '1' || envValue.toLowerCase() === 'true' ? 'planned_hardware_maintenance' : envValue,
      reason: 'Runtime endpoint downtime is marked as planned maintenance by environment.',
      blocks_runtime_dependent_runs: true,
      requires_recheck_after: true,
    }
  }

  return { planned_maintenance: false }
}

function activeMaintenance(state?: ModelRuntimeMaintenanceState): ModelRuntimeMaintenanceState {
  return state?.planned_maintenance === true ? state : { planned_maintenance: false }
}

function maintenanceAffectsRoute(route: ModelRuntimeRoute, state: ModelRuntimeMaintenanceState): boolean {
  if (!state.planned_maintenance) return false
  const node = String(route.node ?? '').toLowerCase()
  const endpoint = String(route.endpoint ?? '').toLowerCase()
  const runtimeType = String(route.runtime_type ?? '').toLowerCase()
  const affectedNodes = (state.affected_nodes ?? []).map(item => item.toLowerCase())
  const affectedRuntimeTypes = (state.affected_runtime_types ?? []).map(item => item.toLowerCase())

  if (affectedNodes.some(item => node.includes(item))) return true
  if (affectedRuntimeTypes.includes(runtimeType)) return true
  return /spark|dgx/.test(node) || /192\.168\.0\./.test(endpoint)
}

function maintenanceSummary(state: ModelRuntimeMaintenanceState): ModelRuntimeCheckResult['planned_maintenance'] {
  return {
    active: state.planned_maintenance === true,
    classification: state.planned_maintenance ? state.classification ?? 'planned_hardware_maintenance' : undefined,
    reason: state.planned_maintenance ? state.reason ?? 'Runtime endpoints are under planned hardware maintenance.' : undefined,
  }
}

function finding(params: ModelRuntimeFinding): ModelRuntimeFinding {
  return params
}

function summarize(findings: ModelRuntimeFinding[]): ModelRuntimeSummary {
  return {
    critical: findings.filter(f => f.severity === 'critical').length,
    high: findings.filter(f => f.severity === 'high').length,
    medium: findings.filter(f => f.severity === 'medium').length,
    low: findings.filter(f => f.severity === 'low').length,
    info: findings.filter(f => f.severity === 'info').length,
  }
}

function registryAgents(registry: AgentsRegistry): Array<{ id: string; spec_file?: string; type?: string }> {
  if (Array.isArray(registry.agents)) {
    return registry.agents
      .filter(agent => typeof agent.id === 'string')
      .map(agent => ({ id: agent.id as string, spec_file: agent.spec_file, type: agent.type }))
  }

  return Object.entries(registry)
    .filter(([key, value]) => !key.startsWith('_') && key !== 'agents' && value && typeof value === 'object' && !Array.isArray(value))
    .map(([id, value]) => ({ id, spec_file: (value as any).spec_file, type: (value as any).type }))
}

function routingEntries(routing: ModelRoutingFile): ModelRuntimeRoute[] {
  const source = routing.routes && typeof routing.routes === 'object'
    ? routing.routes
    : Object.fromEntries(Object.entries(routing).filter(([key]) => !key.startsWith('_') && key !== 'routes'))

  return Object.entries(source)
    .flatMap(([agent, value]) => {
      if (!value || typeof value !== 'object') return []
      const route = 'default' in value && value.default && typeof value.default === 'object' ? value.default : value
      return [{
        agent,
        node: route.node,
        model: route.model,
        endpoint: route.endpoint,
        runtime_type: route.runtime_type,
        healthcheck: route.healthcheck,
        temperature: typeof route.temperature === 'number' ? route.temperature : undefined,
        optional_runtime: route.optional_runtime === true,
        runtime_required: route.runtime_required,
        json_required: false,
        qwen_thinking_off_required: false,
        endpoint_status: 'not_checked' as const,
      }]
    })
    .sort((a, b) => a.agent.localeCompare(b.agent))
}

function agentSpecRequiresJson(spec: string): boolean {
  return /OrchestratorIntent JSON|JSON object|JSON-only|reines JSON|Return exactly one .*JSON/i.test(spec)
}

function isQwen36(model: string | undefined): boolean {
  return !!model && /qwen3\.6|qwen3-?6/i.test(model)
}

function isExternalNonEndpointNode(node: string | undefined): boolean {
  return !!node && /claude[_-]?code|codex|external/i.test(node)
}

function isConfigCheckedExternalRuntime(route: ModelRuntimeRoute): boolean {
  const runtimeType = String(route.runtime_type ?? '').toLowerCase()
  return runtimeType === 'codex-cli' ||
    runtimeType === 'external' ||
    (!route.endpoint && isExternalNonEndpointNode(route.node))
}

function isEndpointRuntime(route: ModelRuntimeRoute): boolean {
  const runtimeType = String(route.runtime_type ?? '').toLowerCase()
  if (runtimeType === 'codex-cli' || runtimeType === 'external') return false
  if (runtimeType === 'openai-compatible-http' || runtimeType === 'vllm') return true
  return !!route.endpoint && !isExternalNonEndpointNode(route.node)
}

function dispatcherPolicy(dispatcher: string): {
  timeout: boolean
  retry: boolean
  thinkingOff: boolean
  jsonObject: boolean
} {
  return {
    timeout: /AbortController|AbortSignal|timeout|MODEL_CALL_TIMEOUT/i.test(dispatcher) && /signal/i.test(dispatcher),
    retry: /retry|attempt|for\s*\(|while\s*\(/i.test(dispatcher),
    thinkingOff: /enable_thinking\s*]\s*=\s*false|enable_thinking\s*=\s*false/i.test(dispatcher),
    jsonObject: /response_format/i.test(dispatcher) && /json_object/i.test(dispatcher),
  }
}

function endpointModelsUrl(endpoint: string): string {
  const trimmed = endpoint.replace(/\/$/, '')
  return trimmed.endsWith('/v1') ? `${trimmed}/models` : `${trimmed}/v1/models`
}

function endpointFailureFinding(
  route: ModelRuntimeRoute,
  evidence: string,
  explicitlyTargeted: boolean,
  maintenance: ModelRuntimeMaintenanceState,
): ModelRuntimeFinding {
  if (maintenanceAffectsRoute(route, maintenance)) {
    route.endpoint_status = 'planned_maintenance'
    return finding({
      id: 'model_runtime.planned_hardware_maintenance',
      severity: 'info',
      layer: 'model_runtime',
      agent: route.agent,
      model: route.model,
      endpoint: route.endpoint,
      message: 'Runtime endpoint is unavailable during planned DGX/Spark hardware maintenance.',
      evidence,
      suggested_action: 'Do not change routing for this outage; re-run endpoint checks after hardware maintenance ends.',
      blocks_operator: true,
      blocks_product_work: true,
    })
  }

  if (route.optional_runtime && !explicitlyTargeted) {
    route.endpoint_status = 'optional_offline'
    return finding({
      id: 'model_runtime.optional_endpoint_offline',
      severity: 'info',
      layer: 'model_runtime',
      agent: route.agent,
      model: route.model,
      endpoint: route.endpoint,
      message: 'Optional runtime offline; not blocking current governance work.',
      evidence,
      suggested_action: 'Start or validate this endpoint only when a matching MealCam/Vision workorder or explicit runtime run requires it.',
      blocks_operator: false,
      blocks_product_work: false,
    })
  }

  return finding({
    id: 'model_runtime.endpoint_unreachable',
    severity: 'high',
    layer: 'model_runtime',
    agent: route.agent,
    model: route.model,
    endpoint: route.endpoint,
    message: 'Model endpoint health check failed.',
    evidence,
    suggested_action: 'Check Spark/vLLM service health and routing before continuing autonomous work.',
    blocks_operator: true,
    blocks_product_work: true,
  })
}

async function checkEndpoint(
  route: ModelRuntimeRoute,
  options: Required<Pick<ModelRuntimeCheckOptions, 'timeoutMs'>> & Pick<ModelRuntimeCheckOptions, 'fetchImpl'> & {
    explicitlyTargeted: boolean
    maintenance: ModelRuntimeMaintenanceState
  },
): Promise<ModelRuntimeFinding | null> {
  if (!isEndpointRuntime(route)) {
    route.endpoint_status = 'external_ok'
    route.latency_ms = null
    route.timed_out = false
    return null
  }
  if (!route.endpoint) return null
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs)
  const startedAt = Date.now()
  try {
    const response = await (options.fetchImpl ?? fetch)(endpointModelsUrl(route.endpoint), {
      method: 'GET',
      signal: controller.signal,
    })
    route.latency_ms = Date.now() - startedAt
    route.timed_out = false
    if (!response.ok) {
      route.endpoint_status = 'unreachable'
      return endpointFailureFinding(route, `HTTP ${response.status} ${response.statusText}`, options.explicitlyTargeted, options.maintenance)
    }
    route.endpoint_status = 'ok'
    return null
  } catch (error) {
    route.latency_ms = Date.now() - startedAt
    route.timed_out = error instanceof Error
      ? /abort|timeout|timed/i.test(error.name) || /abort|timeout|timed/i.test(error.message)
      : /abort|timeout|timed/i.test(String(error))
    route.endpoint_status = 'unreachable'
    return endpointFailureFinding(route, error instanceof Error ? error.message : String(error), options.explicitlyTargeted, options.maintenance)
  } finally {
    clearTimeout(timeout)
  }
}

function staticFindings(repoRoot: string, agentFilter?: string): { routes: ModelRuntimeRoute[]; findings: ModelRuntimeFinding[] } {
  const findings: ModelRuntimeFinding[] = []
  const agentsJson = readJson<AgentsRegistry>(repoRoot, 'system/agent-registry/agents.json', {})
  const routingJson = readJson<ModelRoutingFile>(repoRoot, 'system/agent-registry/model_routing.json', {})
  if (agentsJson.error) {
    findings.push(finding({
      id: 'model_runtime.agents_config_error',
      severity: 'critical',
      layer: 'model_runtime',
      message: 'Agent registry could not be read.',
      evidence: agentsJson.error,
      suggested_action: 'Restore parser-safe system/agent-registry/agents.json.',
      blocks_operator: true,
      blocks_product_work: true,
    }))
  }
  if (routingJson.error) {
    findings.push(finding({
      id: 'model_runtime.routing_config_error',
      severity: 'critical',
      layer: 'model_runtime',
      message: 'Model routing config could not be read.',
      evidence: routingJson.error,
      suggested_action: 'Restore parser-safe system/agent-registry/model_routing.json.',
      blocks_operator: true,
      blocks_product_work: true,
    }))
  }

  const agents = registryAgents(agentsJson.value)
  const knownAgents = new Set(agents.map(agent => agent.id))
  const routeList = routingEntries(routingJson.value)
    .filter(route => !agentFilter || route.agent === agentFilter)
  const routesByAgent = new Map(routeList.map(route => [route.agent, route]))
  const dispatcher = readText(repoRoot, 'system/control-plane/dispatcher.ts')
  const policy = dispatcherPolicy(dispatcher)
  const routingText = readText(repoRoot, 'system/agent-registry/model_routing.json')
  const routingDocumentsThinkingOff = /enable_thinking/i.test(routingText) && /false/i.test(routingText)

  for (const route of routeList) {
    if (!knownAgents.has(route.agent)) {
      findings.push(finding({
        id: 'model_runtime.route_unknown_agent',
        severity: 'medium',
        layer: 'model_runtime',
        agent: route.agent,
        model: route.model,
        endpoint: route.endpoint,
        message: 'Model routing references an agent not present in agents.json.',
        evidence: route.agent,
        suggested_action: 'Add the agent to agents.json or remove stale routing.',
        blocks_operator: false,
        blocks_product_work: false,
      }))
    }

    if (!route.model) {
      findings.push(finding({
        id: 'model_runtime.model_missing',
        severity: 'high',
        layer: 'model_runtime',
        agent: route.agent,
        endpoint: route.endpoint,
        message: 'Routed agent is missing a model.',
        evidence: JSON.stringify(route),
        suggested_action: 'Add an explicit model to model_routing.json for this agent.',
        blocks_operator: true,
        blocks_product_work: true,
      }))
    }

    if (isConfigCheckedExternalRuntime(route)) {
      route.endpoint_status = 'external_ok'
    }

    if (!route.endpoint && !isConfigCheckedExternalRuntime(route)) {
      findings.push(finding({
        id: 'model_runtime.endpoint_missing',
        severity: 'high',
        layer: 'model_runtime',
        agent: route.agent,
        model: route.model,
        message: 'Routed local model is missing endpoint metadata.',
        evidence: JSON.stringify(route),
        suggested_action: 'Add the expected OpenAI-compatible endpoint to model_routing.json.',
        blocks_operator: true,
        blocks_product_work: true,
      }))
    }

    if (isQwen36(route.model)) {
      route.qwen_thinking_off_required = true
      if (!routingDocumentsThinkingOff || !policy.thinkingOff) {
        findings.push(finding({
          id: 'model_runtime.qwen_thinking_policy_missing',
          severity: 'high',
          layer: 'model_runtime',
          agent: route.agent,
          model: route.model,
          endpoint: route.endpoint,
          message: 'Qwen3.6 route lacks enforced enable_thinking:false policy.',
          evidence: `routing_documents=${routingDocumentsThinkingOff}; dispatcher_sets=${policy.thinkingOff}`,
          suggested_action: 'Document enable_thinking:false in routing and enforce it in dispatcher request options.',
          blocks_operator: true,
          blocks_product_work: true,
        }))
      }
    }
  }

  for (const agent of agents.filter(agent => !agentFilter || agent.id === agentFilter)) {
    const route = routesByAgent.get(agent.id)
    const spec = agent.spec_file ? readText(repoRoot, agent.spec_file) : ''
    const jsonRequired = agentSpecRequiresJson(spec)
    if (route) route.json_required = jsonRequired

    if (!route && agent.type !== 'executor_senior') {
      findings.push(finding({
        id: 'model_runtime.agent_route_missing',
        severity: 'medium',
        layer: 'model_runtime',
        agent: agent.id,
        message: 'Agent has no route in model_routing.json.',
        evidence: agent.id,
        suggested_action: 'Add routing metadata or document that the agent is not runtime-dispatched.',
        blocks_operator: false,
        blocks_product_work: false,
      }))
    }

    if (jsonRequired && !policy.jsonObject) {
      findings.push(finding({
        id: 'model_runtime.json_response_policy_missing',
        severity: 'high',
        layer: 'model_runtime',
        agent: agent.id,
        model: route?.model,
        endpoint: route?.endpoint,
        message: 'JSON-only runtime agent lacks dispatcher JSON object response mode.',
        evidence: agent.spec_file ?? agent.id,
        suggested_action: 'Request response_format json_object for JSON-only model paths where the API supports it.',
        blocks_operator: true,
        blocks_product_work: true,
      }))
    }
  }

  if (!policy.timeout) {
    findings.push(finding({
      id: 'model_runtime.timeout_policy_missing',
      severity: 'high',
      layer: 'model_runtime',
      message: 'Dispatcher model calls do not show a bounded timeout policy.',
      evidence: 'AbortController/signal timeout not found in dispatcher.ts',
      suggested_action: 'Add a bounded model-call timeout so unavailable Spark endpoints stop cleanly.',
      blocks_operator: true,
      blocks_product_work: true,
    }))
  }

  if (!policy.retry) {
    findings.push(finding({
      id: 'model_runtime.retry_policy_missing',
      severity: 'medium',
      layer: 'model_runtime',
      message: 'Dispatcher model calls do not show a bounded retry policy.',
      evidence: 'retry/attempt loop not found in dispatcher.ts',
      suggested_action: 'Retry network/timeout failures at most once and avoid retrying governance validation errors forever.',
      blocks_operator: false,
      blocks_product_work: false,
    }))
  }

  return { routes: routeList, findings }
}

function legacyReadiness(status: ModelRuntimeOverallStatus): ModelRuntimeHistorySummary['overall_readiness'] {
  if (status === 'HEALTHY') return 'RUNTIME_HEALTHY'
  if (status === 'BLOCKED_REQUIRED_FAILURE' || status === 'PLANNED_MAINTENANCE') return 'RUNTIME_BLOCKED'
  if (status === 'UNKNOWN_NOT_CHECKED' || status === 'STALE_HISTORY' || status === 'RECHECK_REQUIRED') return 'UNKNOWN'
  return 'RUNTIME_DEGRADED'
}

function computeCheckReadiness(params: {
  checkEndpoints: boolean
  routes: ModelRuntimeRoute[]
  summary: ModelRuntimeSummary
  generatedAt: string
  maintenance: ModelRuntimeMaintenanceState
  staleAfterMinutes: number
}): ModelRuntimeReadiness {
  const maintenance = activeMaintenance(params.maintenance)
  const optionalDegraded = params.routes.some(route => route.endpoint_status === 'optional_offline')
  const requiredEndpointFailed = params.routes.some(route => {
    if (route.optional_runtime || route.runtime_required === 'on_demand') return false
    return route.endpoint_status === 'unreachable' || route.timed_out === true
  })
  const hasHighOrCritical = params.summary.critical > 0 || params.summary.high > 0

  if (maintenance.planned_maintenance) {
    return {
      overall_status: 'PLANNED_MAINTENANCE',
      readiness: 'blocked',
      reason: maintenance.reason ?? 'DGX/Spark endpoints are unavailable because of planned hardware maintenance.',
      freshness_status: params.checkEndpoints ? 'maintenance' : 'not_checked',
      last_checked_at: params.checkEndpoints ? params.generatedAt : undefined,
      age_ms: null,
      age_minutes: null,
      stale_after_minutes: params.staleAfterMinutes,
      planned_maintenance: true,
      maintenance_classification: maintenance.classification ?? 'planned_hardware_maintenance',
      blocking_impact: 'Blocks runtime-dependent autonomous/night/large runs; does not indicate a routing defect.',
      next_required_action: 'After maintenance ends, run model-runtime-check --check-endpoints --record-history before autonomous/night/large runs.',
    }
  }

  if (hasHighOrCritical || requiredEndpointFailed) {
    return {
      overall_status: 'BLOCKED_REQUIRED_FAILURE',
      readiness: 'blocked',
      reason: 'A required runtime route has a high/critical finding or endpoint failure.',
      freshness_status: params.checkEndpoints ? 'fresh' : 'not_checked',
      last_checked_at: params.checkEndpoints ? params.generatedAt : undefined,
      age_ms: null,
      age_minutes: null,
      stale_after_minutes: params.staleAfterMinutes,
      planned_maintenance: false,
      blocking_impact: 'Blocks runtime-dependent autonomous/night/large runs until fixed or rechecked.',
      next_required_action: 'Fix the required runtime finding and re-run model-runtime-check --check-endpoints --record-history.',
    }
  }

  if (!params.checkEndpoints) {
    return {
      overall_status: 'UNKNOWN_NOT_CHECKED',
      readiness: 'unknown',
      reason: 'Static runtime routing passed; endpoint health has not been checked in this command.',
      freshness_status: 'not_checked',
      age_ms: null,
      age_minutes: null,
      stale_after_minutes: params.staleAfterMinutes,
      planned_maintenance: false,
      blocking_impact: 'Runtime-dependent autonomous/night/large runs require a fresh endpoint check.',
      next_required_action: 'Run model-runtime-check --check-endpoints --record-history before runtime-dependent autonomous/night/large runs.',
    }
  }

  if (optionalDegraded) {
    return {
      overall_status: 'DEGRADED_OPTIONAL',
      readiness: 'degraded',
      reason: 'Only optional/on-demand runtime routes are offline.',
      freshness_status: 'fresh',
      last_checked_at: params.generatedAt,
      age_ms: null,
      age_minutes: null,
      stale_after_minutes: params.staleAfterMinutes,
      planned_maintenance: false,
      blocking_impact: 'Does not block governance unless a matching optional runtime workorder is active.',
      next_required_action: 'Start or recheck optional runtimes only when a matching workorder requires them.',
    }
  }

  return {
    overall_status: 'HEALTHY',
    readiness: 'ready',
    reason: 'Active required runtime routes are healthy for this check.',
    freshness_status: 'fresh',
    last_checked_at: params.generatedAt,
    age_ms: null,
    age_minutes: null,
    stale_after_minutes: params.staleAfterMinutes,
    planned_maintenance: false,
    blocking_impact: 'No runtime-health blocker from this check.',
    next_required_action: 'Continue with governance-only work; keep product work closed unless Tom opens it.',
  }
}

function resultFrom(
  repoRoot: string,
  checkEndpoints: boolean,
  routes: ModelRuntimeRoute[],
  findings: ModelRuntimeFinding[],
  maintenance: ModelRuntimeMaintenanceState,
  staleAfterMinutes: number,
): ModelRuntimeCheckResult {
  const summary = summarize(findings)
  const hasHighOrCriticalFindings = summary.critical > 0 || summary.high > 0
  const generatedAt = new Date().toISOString()
  const readiness = computeCheckReadiness({
    checkEndpoints,
    routes,
    summary,
    generatedAt,
    maintenance,
    staleAfterMinutes,
  })
  return {
    schema_version: 1,
    generated_at: generatedAt,
    repo_root: repoRoot,
    check_endpoints: checkEndpoints,
    overall_status: readiness.overall_status,
    readiness,
    freshness_status: readiness.freshness_status,
    last_checked_at: readiness.last_checked_at,
    planned_maintenance: maintenanceSummary(activeMaintenance(maintenance)),
    blocking_impact: readiness.blocking_impact,
    next_required_action: readiness.next_required_action,
    hasHighOrCriticalFindings,
    exitCode: hasHighOrCriticalFindings ? 1 : 0,
    summary,
    product_work_gate: {
      status: 'blocked',
      reason: PRODUCT_GATE_REASON,
    },
    routes,
    findings,
  }
}

function historyDirectory(repoRoot: string, override?: string): string {
  return override ? path.resolve(repoRoot, override) : path.join(repoRoot, HISTORY_DIR)
}

function historyPath(repoRoot: string, override?: string): string {
  return path.join(historyDirectory(repoRoot, override), HISTORY_FILE)
}

function latestPath(repoRoot: string, override?: string): string {
  return path.join(historyDirectory(repoRoot, override), LATEST_FILE)
}

const severityRank: Record<ModelRuntimeSeverity, number> = {
  info: 0,
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
}

function highestSeverity(findings: ModelRuntimeFinding[]): ModelRuntimeSeverity {
  return findings.reduce<ModelRuntimeSeverity>((highest, item) =>
    severityRank[item.severity] > severityRank[highest] ? item.severity : highest, 'info')
}

function routeHistoryRecord(result: ModelRuntimeCheckResult, route: ModelRuntimeRoute, projectId: string): ModelRuntimeHistoryRecord {
  const routeFindings = result.findings.filter(item => item.agent === route.agent || (!item.agent && item.model === route.model))
  const runtimeType = route.runtime_type ?? (isEndpointRuntime(route) ? 'openai-compatible-http' : 'external')
  const required = route.optional_runtime !== true && route.runtime_required !== 'on_demand'
  return {
    timestamp: result.generated_at,
    project_id: projectId,
    route_id: route.agent,
    agent: route.agent,
    model: route.model,
    runtime_type: runtimeType,
    endpoint: route.endpoint,
    required,
    optional: !required,
    endpoint_status: route.endpoint_status ?? 'not_checked',
    latency_ms: typeof route.latency_ms === 'number' ? route.latency_ms : null,
    timed_out: route.timed_out === true,
    severity: highestSeverity(routeFindings),
    finding_ids: routeFindings.map(item => item.id),
    product_gate_state: result.product_work_gate.status,
    check_endpoints: result.check_endpoints,
  }
}

export function recordsFromModelRuntimeCheck(result: ModelRuntimeCheckResult, projectId = DEFAULT_PROJECT_ID): ModelRuntimeHistoryRecord[] {
  return result.routes.map(route => routeHistoryRecord(result, route, projectId))
}

export function recordModelRuntimeHistory(result: ModelRuntimeCheckResult, options: { repoRoot?: string; projectId?: string; historyDir?: string } = {}): void {
  const repoRoot = options.repoRoot ?? result.repo_root
  const projectId = options.projectId ?? DEFAULT_PROJECT_ID
  const dir = historyDirectory(repoRoot, options.historyDir)
  fs.mkdirSync(dir, { recursive: true })
  const records = recordsFromModelRuntimeCheck(result, projectId)
  fs.appendFileSync(historyPath(repoRoot, options.historyDir), records.map(record => JSON.stringify(record)).join('\n') + '\n', 'utf8')
  fs.writeFileSync(latestPath(repoRoot, options.historyDir), `${JSON.stringify({
    schema_version: 1,
    generated_at: new Date().toISOString(),
    project_id: projectId,
    check: result,
    records,
    summary: summarizeModelRuntimeHistory(records, historyPath(repoRoot, options.historyDir), new Set(result.routes.map(route => route.agent))),
  }, null, 2)}\n`, 'utf8')
}

function readHistoryRecords(repoRoot: string, historyDir?: string, maxHistory?: number): ModelRuntimeHistoryRecord[] {
  const filePath = historyPath(repoRoot, historyDir)
  if (!fs.existsSync(filePath)) return []
  const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/).filter(Boolean)
  const selected = typeof maxHistory === 'number' && maxHistory > 0 ? lines.slice(-maxHistory) : lines
  return selected.flatMap(line => {
    try {
      const record = JSON.parse(line) as ModelRuntimeHistoryRecord
      return record && typeof record === 'object' ? [record] : []
    } catch {
      return []
    }
  })
}

function average(values: number[]): number | null {
  if (values.length === 0) return null
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length)
}

function isFailureRecord(record: ModelRuntimeHistoryRecord): boolean {
  if (record.endpoint_status === 'optional_offline') return true
  if (record.endpoint_status === 'unreachable') return true
  return severityRank[record.severity] >= severityRank.medium
}

function currentRuntimeRouteIds(repoRoot: string): Set<string> | undefined {
  try {
    return new Set(staticFindings(repoRoot).routes.map(route => route.agent))
  } catch {
    return undefined
  }
}

function computeHistoryReadiness(params: {
  records: ModelRuntimeHistoryRecord[]
  routes: ModelRuntimeHistoryRouteSummary[]
  latestByRoute: Map<string, ModelRuntimeHistoryRecord>
  generatedAt: string
  staleAfterMinutes: number
  maintenance: ModelRuntimeMaintenanceState
  now: Date
}): ModelRuntimeReadiness {
  const maintenance = activeMaintenance(params.maintenance)
  const timestamps = params.records.map(record => record.timestamp).sort()
  const lastCheckedAt = timestamps[timestamps.length - 1]
  const ageMs = lastCheckedAt ? Math.max(0, params.now.getTime() - new Date(lastCheckedAt).getTime()) : null
  const ageMinutes = typeof ageMs === 'number' ? Math.round(ageMs / 60000) : null

  if (maintenance.planned_maintenance) {
    return {
      overall_status: 'PLANNED_MAINTENANCE',
      readiness: 'blocked',
      reason: maintenance.reason ?? 'DGX/Spark endpoints are unavailable because of planned hardware maintenance.',
      freshness_status: 'maintenance',
      last_checked_at: lastCheckedAt,
      age_ms: ageMs,
      age_minutes: ageMinutes,
      stale_after_minutes: params.staleAfterMinutes,
      planned_maintenance: true,
      maintenance_classification: maintenance.classification ?? 'planned_hardware_maintenance',
      blocking_impact: 'Blocks runtime-dependent autonomous/night/large runs; does not indicate a routing defect.',
      next_required_action: 'After maintenance ends, run model-runtime-check --check-endpoints --record-history before autonomous/night/large runs.',
    }
  }

  if (!lastCheckedAt) {
    return {
      overall_status: 'UNKNOWN_NOT_CHECKED',
      readiness: 'unknown',
      reason: 'No runtime history has been recorded yet.',
      freshness_status: 'unknown',
      age_ms: null,
      age_minutes: null,
      stale_after_minutes: params.staleAfterMinutes,
      planned_maintenance: false,
      blocking_impact: 'Runtime-dependent autonomous/night/large runs require a fresh endpoint check.',
      next_required_action: 'Run model-runtime-check --check-endpoints --record-history.',
    }
  }

  if (typeof ageMinutes === 'number' && ageMinutes > params.staleAfterMinutes) {
    return {
      overall_status: 'STALE_HISTORY',
      readiness: 'unknown',
      reason: `Latest runtime history is ${ageMinutes} minutes old and exceeds the ${params.staleAfterMinutes} minute freshness threshold.`,
      freshness_status: 'stale',
      last_checked_at: lastCheckedAt,
      age_ms: ageMs,
      age_minutes: ageMinutes,
      stale_after_minutes: params.staleAfterMinutes,
      planned_maintenance: false,
      blocking_impact: 'Stale history cannot prove current readiness for runtime-dependent autonomous/night/large runs.',
      next_required_action: 'Record a fresh endpoint check before runtime-dependent autonomous/night/large runs.',
    }
  }

  const requiredBlocked = params.routes.some(route => {
    if (!route.current_route || !route.required) return false
    const latest = params.latestByRoute.get(route.route_id)
    if (!latest) return false
    return latest.endpoint_status === 'unreachable' ||
      latest.timed_out ||
      severityRank[latest.severity] >= severityRank.high ||
      latest.finding_ids.some(id => !id.includes('optional') && !id.includes('planned_hardware_maintenance'))
  })

  if (requiredBlocked) {
    return {
      overall_status: 'BLOCKED_REQUIRED_FAILURE',
      readiness: 'blocked',
      reason: 'Latest active required runtime history contains a required route failure.',
      freshness_status: 'fresh',
      last_checked_at: lastCheckedAt,
      age_ms: ageMs,
      age_minutes: ageMinutes,
      stale_after_minutes: params.staleAfterMinutes,
      planned_maintenance: false,
      blocking_impact: 'Blocks runtime-dependent autonomous/night/large runs until fixed or rechecked.',
      next_required_action: 'Fix the required runtime failure and record a fresh endpoint check.',
    }
  }

  const optionalDegraded = params.routes.some(route => route.current_route && !route.required && route.last_status === 'optional_offline')
  if (optionalDegraded) {
    return {
      overall_status: 'DEGRADED_OPTIONAL',
      readiness: 'degraded',
      reason: 'Latest active failures are optional/on-demand runtime routes.',
      freshness_status: 'fresh',
      last_checked_at: lastCheckedAt,
      age_ms: ageMs,
      age_minutes: ageMinutes,
      stale_after_minutes: params.staleAfterMinutes,
      planned_maintenance: false,
      blocking_impact: 'Does not block governance unless a matching optional runtime workorder is active.',
      next_required_action: 'Recheck optional runtimes only when matching work requires them.',
    }
  }

  return {
    overall_status: 'HEALTHY',
    readiness: 'ready',
    reason: 'Latest active required runtime history is healthy.',
    freshness_status: 'fresh',
    last_checked_at: lastCheckedAt,
    age_ms: ageMs,
    age_minutes: ageMinutes,
    stale_after_minutes: params.staleAfterMinutes,
    planned_maintenance: false,
    blocking_impact: 'No current runtime-history blocker.',
    next_required_action: 'Continue governance-only work; keep product work closed unless Tom opens it.',
  }
}

function summarizeModelRuntimeHistory(
  records: ModelRuntimeHistoryRecord[],
  filePath: string,
  currentRouteIds?: Set<string>,
  options: { staleAfterMinutes?: number; maintenance?: ModelRuntimeMaintenanceState; now?: Date } = {},
): ModelRuntimeHistorySummary {
  const byRoute = new Map<string, ModelRuntimeHistoryRecord[]>()
  for (const record of records) {
    const bucket = byRoute.get(record.route_id) ?? []
    bucket.push(record)
    byRoute.set(record.route_id, bucket)
  }

  const routes = Array.from(byRoute.entries()).map(([routeId, routeRecords]) => {
    const sorted = [...routeRecords].sort((a, b) => a.timestamp.localeCompare(b.timestamp))
    const latest = sorted[sorted.length - 1]
    const failures = sorted.filter(isFailureRecord)
    const latencies = sorted.map(item => item.latency_ms).filter((value): value is number => typeof value === 'number')
    const findingIds = Array.from(new Set(sorted.flatMap(item => item.finding_ids)))
    const currentRoute = currentRouteIds ? currentRouteIds.has(routeId) : true
    return {
      route_id: routeId,
      agent: latest.agent,
      model: latest.model,
      runtime_type: latest.runtime_type,
      endpoint: latest.endpoint,
      current_route: currentRoute,
      required: latest.required,
      optional: latest.optional,
      last_status: latest.endpoint_status,
      failures_count: failures.length,
      timeout_count: sorted.filter(item => item.timed_out).length,
      average_latency_ms: average(latencies),
      max_latency_ms: latencies.length > 0 ? Math.max(...latencies) : null,
      last_ok: [...sorted].reverse().find(item => item.endpoint_status === 'ok' || item.endpoint_status === 'external_ok')?.timestamp,
      last_failure: failures[failures.length - 1]?.timestamp,
      finding_ids: findingIds,
    }
  }).sort((a, b) => a.agent.localeCompare(b.agent))

  const latestByRoute = new Map<string, ModelRuntimeHistoryRecord>()
  for (const record of records) {
    const previous = latestByRoute.get(record.route_id)
    if (!previous || previous.timestamp.localeCompare(record.timestamp) < 0) latestByRoute.set(record.route_id, record)
  }
  const timestamps = records.map(record => record.timestamp).sort()
  const generatedAt = new Date().toISOString()
  const readiness = computeHistoryReadiness({
    records,
    routes,
    latestByRoute,
    generatedAt,
    staleAfterMinutes: options.staleAfterMinutes ?? DEFAULT_STALE_AFTER_MINUTES,
    maintenance: activeMaintenance(options.maintenance),
    now: options.now ?? new Date(),
  })
  return {
    generated_at: generatedAt,
    project_id: records[0]?.project_id ?? DEFAULT_PROJECT_ID,
    history_path: filePath,
    total_records: records.length,
    total_checks: new Set(records.map(record => record.timestamp)).size,
    time_range: {
      from: timestamps[0],
      to: timestamps[timestamps.length - 1],
    },
    overall_readiness: legacyReadiness(readiness.overall_status),
    overall_status: readiness.overall_status,
    readiness,
    freshness_status: readiness.freshness_status,
    last_checked_at: readiness.last_checked_at,
    age_ms: readiness.age_ms,
    age_minutes: readiness.age_minutes,
    stale_after_minutes: readiness.stale_after_minutes,
    planned_maintenance: maintenanceSummary(activeMaintenance(options.maintenance)),
    blocking_impact: readiness.blocking_impact,
    next_required_action: readiness.next_required_action,
    routes,
  }
}

export function readModelRuntimeHistorySummary(options: {
  repoRoot?: string
  historyDir?: string
  maxHistory?: number
  staleAfterMinutes?: number
  plannedMaintenance?: ModelRuntimeMaintenanceState
  now?: Date
} = {}): ModelRuntimeHistorySummary {
  const repoRoot = options.repoRoot ?? process.cwd()
  const filePath = historyPath(repoRoot, options.historyDir)
  return summarizeModelRuntimeHistory(
    readHistoryRecords(repoRoot, options.historyDir, options.maxHistory),
    filePath,
    currentRuntimeRouteIds(repoRoot),
    {
      staleAfterMinutes: options.staleAfterMinutes,
      maintenance: options.plannedMaintenance ?? loadRuntimeMaintenance(repoRoot),
      now: options.now,
    },
  )
}

export function runModelRuntimeCheck(options?: ModelRuntimeCheckOptions & { checkEndpoints?: false }): ModelRuntimeCheckResult
export function runModelRuntimeCheck(options: ModelRuntimeCheckOptions & { checkEndpoints: true }): Promise<ModelRuntimeCheckResult>
export function runModelRuntimeCheck(options: ModelRuntimeCheckOptions = {}): ModelRuntimeCheckResult | Promise<ModelRuntimeCheckResult> {
  const repoRoot = options.repoRoot ?? process.cwd()
  const checkEndpoints = options.checkEndpoints === true
  const maintenance = activeMaintenance(options.plannedMaintenance ?? loadRuntimeMaintenance(repoRoot))
  const staleAfterMinutes = options.staleAfterMinutes ?? DEFAULT_STALE_AFTER_MINUTES
  const { routes, findings } = staticFindings(repoRoot, options.agent)

  if (!checkEndpoints) {
    const result = resultFrom(repoRoot, false, routes, findings, maintenance, staleAfterMinutes)
    if (options.recordHistory) recordModelRuntimeHistory(result, { repoRoot, projectId: options.projectId, historyDir: options.historyDir })
    return result
  }

  return Promise.all(routes.map(route => checkEndpoint(route, {
      timeoutMs: options.timeoutMs ?? DEFAULT_TIMEOUT_MS,
      fetchImpl: options.fetchImpl,
      explicitlyTargeted: options.agent === route.agent,
      maintenance,
    }))).then(endpointFindings => {
      const result = resultFrom(repoRoot, true, routes, [
        ...findings,
        ...endpointFindings.filter(Boolean) as ModelRuntimeFinding[],
      ], maintenance, staleAfterMinutes)
      if (options.recordHistory) recordModelRuntimeHistory(result, { repoRoot, projectId: options.projectId, historyDir: options.historyDir })
      return result
    })
}

export function formatModelRuntimeReport(result: ModelRuntimeCheckResult): string {
  const lines = [
    '# Model Runtime Check',
    '',
    `Repo: ${result.repo_root}`,
    `Generated: ${result.generated_at}`,
    `Endpoint health checked: ${result.check_endpoints}`,
    `Runtime status: ${result.overall_status}`,
    `Freshness: ${result.freshness_status}`,
    `Reason: ${result.readiness.reason}`,
    `Next action: ${result.next_required_action}`,
    `Product work gate: ${result.product_work_gate.reason}`,
    '',
    `Summary: critical=${result.summary.critical}, high=${result.summary.high}, medium=${result.summary.medium}, low=${result.summary.low}, info=${result.summary.info}`,
    '',
    '## Routes',
  ]

  if (result.routes.length === 0) {
    lines.push('(none)')
  } else {
    for (const route of result.routes) {
      lines.push(`- ${route.agent}: model=${route.model ?? 'missing'} endpoint=${route.endpoint ?? 'missing'} endpoint_status=${route.endpoint_status ?? 'not_checked'}`)
    }
  }

  lines.push('', '## Findings')
  if (result.findings.length === 0) {
    lines.push('No findings.')
  } else {
    for (const item of result.findings) {
      const target = [item.agent, item.model, item.endpoint].filter(Boolean).join(' ')
      lines.push(`- [${item.severity}] ${item.id}${target ? ` (${target})` : ''}`)
      lines.push(`  ${item.message}`)
      lines.push(`  Evidence: ${item.evidence}`)
      lines.push(`  Suggested action: ${item.suggested_action}`)
    }
  }

  return lines.join('\n')
}

export function formatModelRuntimeHistorySummary(summary: ModelRuntimeHistorySummary): string {
  const lines = [
    '# Model Runtime History Summary',
    '',
    `Generated: ${summary.generated_at}`,
    `Project: ${summary.project_id}`,
    `History: ${summary.history_path}`,
    `Readiness: ${summary.overall_readiness}`,
    `Status: ${summary.overall_status}`,
    `Freshness: ${summary.freshness_status}`,
    `Last checked: ${summary.last_checked_at ?? 'n/a'}`,
    `Age minutes: ${summary.age_minutes ?? 'n/a'}`,
    `Reason: ${summary.readiness.reason}`,
    `Next action: ${summary.next_required_action}`,
    `Total records: ${summary.total_records}`,
    `Total checks: ${summary.total_checks}`,
    `Time range: ${summary.time_range.from ?? 'n/a'} -> ${summary.time_range.to ?? 'n/a'}`,
    '',
    '## Routes',
  ]

  if (summary.routes.length === 0) {
    lines.push('(no runtime history recorded yet)')
  } else {
    for (const route of summary.routes) {
      lines.push(`- ${route.agent}: last_status=${route.last_status} required=${route.required} failures=${route.failures_count} timeouts=${route.timeout_count} avg_latency_ms=${route.average_latency_ms ?? 'n/a'} max_latency_ms=${route.max_latency_ms ?? 'n/a'}`)
      if (route.last_failure) lines.push(`  last_failure=${route.last_failure}`)
      if (route.last_ok) lines.push(`  last_ok=${route.last_ok}`)
    }
  }

  return lines.join('\n')
}

async function main(): Promise<number> {
  const args = process.argv.slice(2)
  const json = args.includes('--json')
  const historyJson = args.includes('--history-json')
  const historySummary = args.includes('--history-summary') || historyJson
  const recordHistory = args.includes('--record-history')
  const checkEndpoints = args.includes('--check-endpoints')
  const agentIndex = args.indexOf('--agent')
  const agent = agentIndex >= 0 ? args[agentIndex + 1] : undefined
  const timeoutIndex = args.indexOf('--timeout-ms')
  const timeoutMs = timeoutIndex >= 0 ? Number(args[timeoutIndex + 1]) : DEFAULT_TIMEOUT_MS
  const maxHistoryIndex = args.indexOf('--max-history')
  const maxHistory = maxHistoryIndex >= 0 ? Number(args[maxHistoryIndex + 1]) : undefined
  const staleAfterIndex = args.indexOf('--stale-after-minutes')
  const staleAfterMinutes = staleAfterIndex >= 0 ? Number(args[staleAfterIndex + 1]) : DEFAULT_STALE_AFTER_MINUTES
  const plannedMaintenance = args.includes('--planned-hardware-maintenance')
    ? {
        planned_maintenance: true,
        classification: 'planned_hardware_maintenance',
        reason: 'DGX/Spark endpoints are unavailable because of planned hardware maintenance.',
        blocks_runtime_dependent_runs: true,
        requires_recheck_after: true,
      } satisfies ModelRuntimeMaintenanceState
    : undefined
  const projectIndex = args.indexOf('--project')
  const projectId = projectIndex >= 0 ? args[projectIndex + 1] : DEFAULT_PROJECT_ID
  const allowed = new Set([
    '--json',
    '--history-json',
    '--history-summary',
    '--record-history',
    '--check-endpoints',
    '--agent',
    agent ?? '',
    '--timeout-ms',
    timeoutIndex >= 0 ? args[timeoutIndex + 1] : '',
    '--max-history',
    maxHistoryIndex >= 0 ? args[maxHistoryIndex + 1] : '',
    '--stale-after-minutes',
    staleAfterIndex >= 0 ? args[staleAfterIndex + 1] : '',
    '--planned-hardware-maintenance',
    '--project',
    projectId,
  ])
  const unknown = args.filter(arg => !allowed.has(arg))
  if (
    unknown.length > 0 ||
    (agentIndex >= 0 && !agent) ||
    (timeoutIndex >= 0 && !Number.isFinite(timeoutMs)) ||
    (maxHistoryIndex >= 0 && !Number.isFinite(maxHistory)) ||
    (staleAfterIndex >= 0 && !Number.isFinite(staleAfterMinutes)) ||
    (projectIndex >= 0 && !projectId)
  ) {
    console.error('Usage: npx tsx system/control-plane/model-runtime-check.ts [--json] [--check-endpoints] [--record-history] [--history-summary|--history-json] [--max-history <n>] [--stale-after-minutes <n>] [--planned-hardware-maintenance] [--agent <agent-id>] [--timeout-ms <ms>] [--project <id>]')
    return 2
  }

  try {
    if (historySummary) {
      const summary = readModelRuntimeHistorySummary({ maxHistory, staleAfterMinutes, plannedMaintenance })
      console.log(historyJson ? JSON.stringify(summary, null, 2) : formatModelRuntimeHistorySummary(summary))
      return summary.overall_status === 'BLOCKED_REQUIRED_FAILURE' ? 1 : 0
    }

    const result = await runModelRuntimeCheck({ checkEndpoints, agent, timeoutMs, recordHistory, projectId, staleAfterMinutes, plannedMaintenance })
    console.log(json ? JSON.stringify(result, null, 2) : formatModelRuntimeReport(result))
    return result.exitCode
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    if (json) {
      console.log(JSON.stringify({
        schema_version: 1,
        generated_at: new Date().toISOString(),
        error: message,
      }, null, 2))
    } else {
      console.error(`Model runtime check failed: ${message}`)
    }
    return 2
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  main().then(code => { process.exitCode = code })
}
