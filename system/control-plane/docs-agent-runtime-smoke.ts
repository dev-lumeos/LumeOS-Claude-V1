import fs from 'node:fs'
import path from 'node:path'
import { buildSystemPrompt } from './skill-loader'
import { extractFirstJsonObject } from './governance-validator'

interface SmokeCase {
  id: string
  description: string
  system: string
  user: string
  max_tokens: number
  requireToolWrite?: {
    targetPath: string
  }
}

interface SmokeResult {
  id: string
  description: string
  ok: boolean
  status?: number
  statusText?: string
  latency_ms: number
  content_chars?: number
  evidence: string
}

function argValue(args: string[], name: string, fallback = ''): string {
  const index = args.indexOf(name)
  return index >= 0 ? args[index + 1] ?? fallback : fallback
}

function hasArg(args: string[], name: string): boolean {
  return args.includes(name)
}

function readJson<T>(relativePath: string): T {
  return JSON.parse(fs.readFileSync(path.resolve(process.cwd(), relativePath), 'utf8')) as T
}

function extractTaskFromWorkorder(relativePath: string): string {
  const text = fs.readFileSync(path.resolve(process.cwd(), relativePath), 'utf8')
  const match = text.match(/task:\s*\|\r?\n([\s\S]*?)\n\nsource_refs:/)
  if (!match) return text
  return match[1].replace(/^  /gm, '')
}

function endpointChatCompletionsUrl(endpoint: string): string {
  const trimmed = endpoint.replace(/\/$/, '')
  return trimmed.endsWith('/v1') ? `${trimmed}/chat/completions` : `${trimmed}/v1/chat/completions`
}

async function runCase(
  endpoint: string,
  model: string,
  temperature: number,
  timeoutMs: number,
  item: SmokeCase,
  fetchImpl: typeof fetch = fetch,
): Promise<SmokeResult> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  const startedAt = Date.now()
  try {
    const response = await fetchImpl(endpointChatCompletionsUrl(endpoint), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        temperature,
        max_tokens: item.max_tokens,
        messages: [
          { role: 'system', content: item.system },
          { role: 'user', content: item.user },
        ],
      }),
      signal: controller.signal,
    })
    const text = await response.text()
    const latency = Date.now() - startedAt
    if (!response.ok) {
      return {
        id: item.id,
        description: item.description,
        ok: false,
        status: response.status,
        statusText: response.statusText,
        latency_ms: latency,
        evidence: text.replace(/\s+/g, ' ').trim().slice(0, 500),
      }
    }
    let content = ''
    try {
      const payload = JSON.parse(text)
      content = payload?.choices?.[0]?.message?.content ?? ''
    } catch {
      content = ''
    }
    if (item.requireToolWrite) {
      const candidate = extractFirstJsonObject(content)
      if (!candidate) {
        return {
          id: item.id,
          description: item.description,
          ok: false,
          status: response.status,
          statusText: response.statusText,
          latency_ms: latency,
          content_chars: content.length,
          evidence: `dispatcher payload did not contain a complete JSON object; tail=${content.slice(-240)}`,
        }
      }
      try {
        const parsed = JSON.parse(candidate) as Record<string, unknown>
        const ok = parsed.tool === 'write' && parsed.targetPath === item.requireToolWrite.targetPath && typeof parsed.content === 'string' && parsed.content.trim().length > 0
        return {
          id: item.id,
          description: item.description,
          ok,
          status: response.status,
          statusText: response.statusText,
          latency_ms: latency,
          content_chars: content.length,
          evidence: ok
            ? `write:${String(parsed.targetPath)} content_chars=${String(parsed.content).length}`
            : `dispatcher payload missing expected write ToolRequest for ${item.requireToolWrite.targetPath}`,
        }
      } catch (error) {
        return {
          id: item.id,
          description: item.description,
          ok: false,
          status: response.status,
          statusText: response.statusText,
          latency_ms: latency,
          content_chars: content.length,
          evidence: error instanceof Error ? `dispatcher payload JSON parse failed: ${error.message}` : 'dispatcher payload JSON parse failed',
        }
      }
    }
    return {
      id: item.id,
      description: item.description,
      ok: typeof content === 'string' && content.trim().length > 0,
      status: response.status,
      statusText: response.statusText,
      latency_ms: latency,
      content_chars: content.length,
      evidence: content.trim().slice(0, 500) || text.replace(/\s+/g, ' ').trim().slice(0, 500),
    }
  } catch (error) {
    return {
      id: item.id,
      description: item.description,
      ok: false,
      latency_ms: Date.now() - startedAt,
      evidence: error instanceof Error ? `${error.name}: ${error.message}` : String(error),
    }
  } finally {
    clearTimeout(timeout)
  }
}

export async function runDocsAgentRuntimeSmoke(options: {
  agent?: string
  timeoutMs?: number
  includeDispatcherPayload?: boolean
  fetchImpl?: typeof fetch
} = {}): Promise<{
  schema_version: 1
  generated_at: string
  agent: string
  endpoint: string
  model: string
  timeout_ms: number
  ok: boolean
  results: SmokeResult[]
}> {
  const agent = options.agent ?? 'docs-agent'
  const routing = readJson<Record<string, any>>('system/agent-registry/model_routing.json')
  const agents = readJson<Record<string, any>>('system/agent-registry/agents.json')
  const route = routing[agent]?.default
  if (!route?.endpoint || !route?.model) throw new Error(`No endpoint/model route found for ${agent}`)
  const timeoutMs = options.timeoutMs ?? Number(route.timeout_ms ?? route.completion_probe_timeout_ms ?? 30000)
  const agentSpec = fs.readFileSync(path.resolve(process.cwd(), agents[agent].spec_file), 'utf8')
  const dispatcherSystem = buildSystemPrompt(agentSpec, [])
  const cases: SmokeCase[] = [
    {
      id: 'tiny_completion',
      description: 'Tiny /v1/chat/completions proof',
      system: 'Return exactly OK.',
      user: 'health-check',
      max_tokens: 16,
    },
    {
      id: 'medium_docs_markdown',
      description: 'Medium docs-style markdown completion',
      system: 'You are docs-agent. Produce complete markdown artifacts.',
      user: 'Create a concise markdown review document with sections: Title, Purpose, Scope, Source refs, Expected row count, Validation query, Explicit exclusions. Mention expected row count 138 and do not execute anything.',
      max_tokens: 900,
    },
  ]
  if (options.includeDispatcherPayload !== false) {
    cases.push({
      id: 'seed_candidate_dispatcher_payload',
      description: 'Dispatcher-shaped WO-nutrition-012 first model call',
      system: dispatcherSystem,
      user: extractTaskFromWorkorder('system/workorders/nutrition/WO-NUTRITION-P1-012-nutrient-defs-seed-candidate.md'),
      max_tokens: Number(route.max_tokens ?? 4096),
      requireToolWrite: {
        targetPath: 'docs/project/p1-005/P1-005-nutrient-defs-seed-candidate.md',
      },
    })
  }
  const results: SmokeResult[] = []
  for (const item of cases) {
    results.push(await runCase(route.endpoint, route.model, Number(route.temperature ?? 0), timeoutMs, item, options.fetchImpl))
  }
  return {
    schema_version: 1,
    generated_at: new Date().toISOString(),
    agent,
    endpoint: route.endpoint,
    model: route.model,
    timeout_ms: timeoutMs,
    ok: results.every(item => item.ok),
    results,
  }
}

async function main(): Promise<void> {
  const args = process.argv.slice(2)
  const agent = argValue(args, '--agent', 'docs-agent')
  const timeoutArg = argValue(args, '--timeout-ms', '')
  const result = await runDocsAgentRuntimeSmoke({
    agent,
    timeoutMs: timeoutArg ? Number(timeoutArg) : undefined,
    includeDispatcherPayload: !hasArg(args, '--skip-dispatcher-payload'),
  })
  if (hasArg(args, '--json')) {
    console.log(JSON.stringify(result, null, 2))
  } else {
    console.log(`# docs-agent runtime smoke: ${result.ok ? 'PASS' : 'FAIL'}`)
    for (const item of result.results) {
      console.log(`${item.ok ? 'PASS' : 'FAIL'} ${item.id} ${item.latency_ms}ms ${item.evidence.slice(0, 160)}`)
    }
  }
  if (!result.ok) process.exit(1)
}

if (import.meta.url === pathToFileUrl(process.argv[1])) {
  main().catch(error => {
    console.error(error instanceof Error ? error.message : String(error))
    process.exit(1)
  })
}

function pathToFileUrl(filePath: string | undefined): string {
  if (!filePath) return ''
  return new URL(`file:///${path.resolve(filePath).replace(/\\/g, '/')}`).href
}
