import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

export type ModelRuntimeSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info'

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
  endpoint_status?: 'not_checked' | 'ok' | 'unreachable' | 'external_ok'
}

export interface ModelRuntimeCheckResult {
  schema_version: 1
  generated_at: string
  repo_root: string
  check_endpoints: boolean
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
  agent?: string
  checkEndpoints?: boolean
  timeoutMs?: number
  fetchImpl?: typeof fetch
}

type AgentsRegistry = Record<string, any> & {
  agents?: Array<{ id?: string; spec_file?: string; type?: string }>
}

type ModelRoutingFile = Record<string, any> & {
  routes?: Record<string, any>
}

const PRODUCT_GATE_REASON = 'Product work remains blocked unless Tom explicitly opens it; autonomous/night/large runs remain blocked until model runtime health is proven.'
const DEFAULT_TIMEOUT_MS = 1500

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

function endpointFailureFinding(route: ModelRuntimeRoute, evidence: string, explicitlyTargeted: boolean): ModelRuntimeFinding {
  if (route.optional_runtime && !explicitlyTargeted) {
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

async function checkEndpoint(route: ModelRuntimeRoute, options: Required<Pick<ModelRuntimeCheckOptions, 'timeoutMs'>> & Pick<ModelRuntimeCheckOptions, 'fetchImpl'> & { explicitlyTargeted: boolean }): Promise<ModelRuntimeFinding | null> {
  if (!isEndpointRuntime(route)) {
    route.endpoint_status = 'external_ok'
    return null
  }
  if (!route.endpoint) return null
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs)
  try {
    const response = await (options.fetchImpl ?? fetch)(endpointModelsUrl(route.endpoint), {
      method: 'GET',
      signal: controller.signal,
    })
    if (!response.ok) {
      route.endpoint_status = 'unreachable'
      return endpointFailureFinding(route, `HTTP ${response.status} ${response.statusText}`, options.explicitlyTargeted)
    }
    route.endpoint_status = 'ok'
    return null
  } catch (error) {
    route.endpoint_status = 'unreachable'
    return endpointFailureFinding(route, error instanceof Error ? error.message : String(error), options.explicitlyTargeted)
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

function resultFrom(repoRoot: string, checkEndpoints: boolean, routes: ModelRuntimeRoute[], findings: ModelRuntimeFinding[]): ModelRuntimeCheckResult {
  const summary = summarize(findings)
  const hasHighOrCriticalFindings = summary.critical > 0 || summary.high > 0
  return {
    schema_version: 1,
    generated_at: new Date().toISOString(),
    repo_root: repoRoot,
    check_endpoints: checkEndpoints,
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

export function runModelRuntimeCheck(options?: ModelRuntimeCheckOptions & { checkEndpoints?: false }): ModelRuntimeCheckResult
export function runModelRuntimeCheck(options: ModelRuntimeCheckOptions & { checkEndpoints: true }): Promise<ModelRuntimeCheckResult>
export function runModelRuntimeCheck(options: ModelRuntimeCheckOptions = {}): ModelRuntimeCheckResult | Promise<ModelRuntimeCheckResult> {
  const repoRoot = options.repoRoot ?? process.cwd()
  const checkEndpoints = options.checkEndpoints === true
  const { routes, findings } = staticFindings(repoRoot, options.agent)

  if (!checkEndpoints) return resultFrom(repoRoot, false, routes, findings)

  return Promise.all(routes.map(route => checkEndpoint(route, {
      timeoutMs: options.timeoutMs ?? DEFAULT_TIMEOUT_MS,
      fetchImpl: options.fetchImpl,
      explicitlyTargeted: options.agent === route.agent,
    }))).then(endpointFindings => resultFrom(repoRoot, true, routes, [
    ...findings,
    ...endpointFindings.filter(Boolean) as ModelRuntimeFinding[],
  ]))
}

export function formatModelRuntimeReport(result: ModelRuntimeCheckResult): string {
  const lines = [
    '# Model Runtime Check',
    '',
    `Repo: ${result.repo_root}`,
    `Generated: ${result.generated_at}`,
    `Endpoint health checked: ${result.check_endpoints}`,
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

async function main(): Promise<number> {
  const args = process.argv.slice(2)
  const json = args.includes('--json')
  const checkEndpoints = args.includes('--check-endpoints')
  const agentIndex = args.indexOf('--agent')
  const agent = agentIndex >= 0 ? args[agentIndex + 1] : undefined
  const timeoutIndex = args.indexOf('--timeout-ms')
  const timeoutMs = timeoutIndex >= 0 ? Number(args[timeoutIndex + 1]) : DEFAULT_TIMEOUT_MS
  const allowed = new Set(['--json', '--check-endpoints', '--agent', agent ?? '', '--timeout-ms', timeoutIndex >= 0 ? args[timeoutIndex + 1] : ''])
  const unknown = args.filter(arg => !allowed.has(arg))
  if (unknown.length > 0 || (agentIndex >= 0 && !agent) || (timeoutIndex >= 0 && !Number.isFinite(timeoutMs))) {
    console.error('Usage: npx tsx system/control-plane/model-runtime-check.ts [--json] [--check-endpoints] [--agent <agent-id>] [--timeout-ms <ms>]')
    return 2
  }

  try {
    const result = await runModelRuntimeCheck({ checkEndpoints, agent, timeoutMs })
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
