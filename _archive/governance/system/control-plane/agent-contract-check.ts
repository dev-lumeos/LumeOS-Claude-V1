import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

export type AgentContractSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info'

export interface AgentContractFinding {
  id: string
  severity: AgentContractSeverity
  layer: string
  file: string
  message: string
  evidence: string
  suggested_action: string
  blocks_product_work: boolean
  blocks_operator: boolean
}

export interface AgentContractSummary {
  critical: number
  high: number
  medium: number
  low: number
  info: number
}

export interface AgentContractCheckResult {
  schema_version: 1
  generated_at: string
  repo_root: string
  hasHighOrCriticalFindings: boolean
  exitCode: 0 | 1 | 2
  summary: AgentContractSummary
  product_work_gate: {
    status: 'blocked'
    reason: string
  }
  findings: AgentContractFinding[]
}

interface AgentContractCheckOptions {
  repoRoot?: string
}

interface AgentsRegistry {
  agents?: Array<{
    id?: string
    spec_file?: string
    requires_human_approval?: boolean
  }>
  [agentId: string]: unknown
}

interface ModelRouting {
  routes?: Record<string, { model?: string; temperature?: number; [key: string]: unknown }>
  [key: string]: unknown
}

type ApprovalOperationConfig = Record<string, {
  allowed_paths?: string[]
  requires_human_approval?: boolean
  manual_only?: boolean
  [key: string]: unknown
}>

const PRODUCT_GATE_REASON = 'BLS import blocked until Governance Batch 005 is complete or Tom waives it.'

function finding(params: AgentContractFinding): AgentContractFinding {
  return params
}

function readText(repoRoot: string, relativePath: string): string {
  const fullPath = path.join(repoRoot, relativePath)
  return fs.existsSync(fullPath) ? fs.readFileSync(fullPath, 'utf8') : ''
}

function readJson<T>(repoRoot: string, relativePath: string, fallback: T): T {
  const fullPath = path.join(repoRoot, relativePath)
  if (!fs.existsSync(fullPath)) return fallback
  try {
    return JSON.parse(fs.readFileSync(fullPath, 'utf8')) as T
  } catch {
    return fallback
  }
}

function toPosix(relativePath: string): string {
  return relativePath.split(path.sep).join('/')
}

function listFiles(root: string, predicate: (relativePath: string) => boolean): string[] {
  const results: string[] = []
  if (!fs.existsSync(root)) return results

  function walk(current: string): void {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      if (entry.name === 'node_modules' || entry.name === '.git') continue
      const fullPath = path.join(current, entry.name)
      const relativePath = toPosix(path.relative(root, fullPath))
      if (entry.isDirectory()) {
        walk(fullPath)
      } else if (predicate(relativePath)) {
        results.push(relativePath)
      }
    }
  }

  walk(root)
  return results.sort()
}

function hasNegativeMarker(line: string): boolean {
  const lower = line.toLowerCase()
  return [
    'do not',
    'don\'t',
    'must not',
    'not allowed',
    'never',
    'forbidden',
    'niemals',
    'nicht erlaubt',
    'nicht verwenden',
    'darf nicht',
    'duerfen nicht',
    'dürfen nicht',
    'no literal',
    'no usable',
  ].some(marker => lower.includes(marker))
}

function hasNearbyNegativeMarker(lines: string[], index: number): boolean {
  const start = Math.max(0, index - 8)
  return lines.slice(start, index + 1).some(hasNegativeMarker)
}

function summarize(findings: AgentContractFinding[]): AgentContractSummary {
  return {
    critical: findings.filter(f => f.severity === 'critical').length,
    high: findings.filter(f => f.severity === 'high').length,
    medium: findings.filter(f => f.severity === 'medium').length,
    low: findings.filter(f => f.severity === 'low').length,
    info: findings.filter(f => f.severity === 'info').length,
  }
}

function parseSkillFrontmatter(content: string): { ok: true; fields: Record<string, string>; body: string } | { ok: false; reason: string } {
  if (!content.startsWith('---\n') && !content.startsWith('---\r\n')) {
    return { ok: false, reason: 'missing opening frontmatter delimiter' }
  }

  const lines = content.split(/\r?\n/)
  let closeIndex = -1
  for (let i = 1; i < lines.length; i += 1) {
    if (lines[i].trim() === '---') {
      closeIndex = i
      break
    }
  }
  if (closeIndex === -1) return { ok: false, reason: 'missing closing frontmatter delimiter' }

  const fields: Record<string, string> = {}
  for (const line of lines.slice(1, closeIndex)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const match = /^([A-Za-z0-9_-]+):\s*(.+)$/.exec(trimmed)
    if (!match) return { ok: false, reason: `parser-unsafe YAML line: ${trimmed}` }
    fields[match[1]] = match[2].replace(/^['"]|['"]$/g, '').trim()
  }

  return { ok: true, fields, body: lines.slice(closeIndex + 1).join('\n') }
}

function checkSkillFiles(repoRoot: string): AgentContractFinding[] {
  const findings: AgentContractFinding[] = []
  const skillFiles = listFiles(path.join(repoRoot, '.agents/skills'), relative => relative.endsWith('/SKILL.md') || relative === 'SKILL.md')

  for (const relative of skillFiles) {
    const file = `.agents/skills/${relative}`
    const content = readText(repoRoot, file)
    const parsed = parseSkillFrontmatter(content)

    if (!parsed.ok) {
      findings.push(finding({
        id: parsed.reason.includes('opening') || parsed.reason.includes('closing')
          ? 'skill.frontmatter_missing'
          : 'skill.frontmatter_invalid',
        severity: 'high',
        layer: 'skill_contract',
        file,
        message: `SKILL.md frontmatter is invalid: ${parsed.reason}`,
        evidence: parsed.reason,
        suggested_action: 'Add parser-safe YAML frontmatter with name and description before the skill body.',
        blocks_product_work: true,
        blocks_operator: false,
      }))
      continue
    }

    for (const key of ['name', 'description']) {
      if (!parsed.fields[key]) {
        findings.push(finding({
          id: 'skill.frontmatter_required_field_missing',
          severity: 'high',
          layer: 'skill_contract',
          file,
          message: `SKILL.md frontmatter is missing required field: ${key}`,
          evidence: JSON.stringify(parsed.fields),
          suggested_action: 'Add required skill frontmatter fields: name and description.',
          blocks_product_work: true,
          blocks_operator: false,
        }))
      }
    }

    if (!parsed.body.trim()) {
      findings.push(finding({
        id: 'skill.body_missing',
        severity: 'high',
        layer: 'skill_contract',
        file,
        message: 'SKILL.md has no body after frontmatter.',
        evidence: 'empty body',
        suggested_action: 'Add explicit usage guidance after frontmatter.',
        blocks_product_work: true,
        blocks_operator: false,
      }))
    }

    if (/\ball\s+tools\b|\bany\s+tool\b|\bwildcard\s+tool\b/i.test(parsed.body)) {
      findings.push(finding({
        id: 'skill.unsafe_generic_tool_wildcard',
        severity: 'medium',
        layer: 'skill_contract',
        file,
        message: 'Skill body appears to describe broad generic tool access.',
        evidence: parsed.body.match(/.{0,40}(\ball\s+tools\b|\bany\s+tool\b|\bwildcard\s+tool\b).{0,40}/i)?.[0] ?? 'generic tool wording',
        suggested_action: 'Narrow the skill wording to explicit tools and safety boundaries.',
        blocks_product_work: false,
        blocks_operator: false,
      }))
    }
  }

  return findings
}

function checkAgentFiles(repoRoot: string): AgentContractFinding[] {
  const findings: AgentContractFinding[] = []
  const agentFiles = listFiles(path.join(repoRoot, '.claude/agents'), relative => relative.endsWith('.md'))
  const orchestratorContract = readText(repoRoot, 'system/prompts/orchestration/orchestrator_intent_contract.md')
  const dispatcher = readText(repoRoot, 'system/control-plane/dispatcher.ts')
  const dbAgent = readText(repoRoot, '.claude/agents/db-migration-agent.md')

  for (const relative of agentFiles) {
    const file = `.claude/agents/${relative}`
    const content = readText(repoRoot, file)
    const lines = content.split(/\r?\n/)

    for (const [index, line] of lines.entries()) {
      if (/targetPath/i.test(line) && /(?:20240101_001_example|example\.sql)/i.test(line) && !hasNegativeMarker(line)) {
        findings.push(finding({
          id: 'agent.literal_example_migration_target',
          severity: 'high',
          layer: 'agent_contract',
          file,
          message: 'Agent contract contains a usable literal example migration target path.',
          evidence: line.trim(),
          suggested_action: 'Replace usable example paths with <WORKORDER_DERIVED_MIGRATION_PATH> placeholders.',
          blocks_product_work: true,
          blocks_operator: true,
        }))
      }

      if (/top-level/i.test(line) && /status|migration_files|rollback_plan/i.test(line) && !hasNearbyNegativeMarker(lines, index)) {
        findings.push(finding({
          id: 'agent.competing_output_contract',
          severity: 'high',
          layer: 'agent_contract',
          file,
          message: 'Agent contract appears to allow competing top-level runtime output fields.',
          evidence: line.trim(),
          suggested_action: 'Runtime-facing agents must return one OrchestratorIntent JSON contract only.',
          blocks_product_work: true,
          blocks_operator: true,
        }))
      }

      if (/read/i.test(line) && /requires human approval|human approval.*required|human approval.*mandatory/i.test(line)) {
        findings.push(finding({
          id: 'agent.read_context_human_gate',
          severity: 'high',
          layer: 'agent_contract',
          file,
          message: 'Agent contract describes read-only context access as human-gated.',
          evidence: line.trim(),
          suggested_action: 'Clarify that read-only context access is not a db-migration human approval.',
          blocks_product_work: true,
          blocks_operator: true,
        }))
      }
    }
  }

  const runtimeContractFiles = [
    { file: '.claude/agents/db-migration-agent.md', content: dbAgent },
    { file: 'system/prompts/orchestration/orchestrator_intent_contract.md', content: orchestratorContract },
  ]

  for (const item of runtimeContractFiles) {
    if (!item.content) continue
    const lower = item.content.toLowerCase()
    const hasJsonOnly = lower.includes('json') && (lower.includes('orchestratorintent') || lower.includes('orchestrator intent'))
    const forbidsProse = lower.includes('no prose') || lower.includes('prosa') || lower.includes('no markdown') || lower.includes('kein markdown')
    const forbidsThinking = lower.includes('<thinking>') && (lower.includes('no ') || lower.includes('never') || lower.includes('kein') || lower.includes('not allowed'))
    if (!hasJsonOnly || !forbidsProse || !forbidsThinking) {
      findings.push(finding({
        id: 'agent.json_only_contract_missing',
        severity: 'high',
        layer: 'agent_contract',
        file: item.file,
        message: 'Runtime-facing contract does not clearly require JSON-only output without visible thinking.',
        evidence: `json=${hasJsonOnly}; prose_forbidden=${forbidsProse}; thinking_forbidden=${forbidsThinking}`,
        suggested_action: 'Require OrchestratorIntent JSON-only output, no prose/Markdown, and no visible thinking.',
        blocks_product_work: true,
        blocks_operator: true,
      }))
    }
  }

  if (!/selected_agent/i.test(orchestratorContract) || !/drift|match|must/i.test(orchestratorContract)) {
    findings.push(finding({
      id: 'orchestrator.selected_agent_drift_rule_missing',
      severity: 'high',
      layer: 'agent_contract',
      file: 'system/prompts/orchestration/orchestrator_intent_contract.md',
      message: 'OrchestratorIntent contract does not clearly forbid selected_agent drift.',
      evidence: 'selected_agent drift invariant missing',
      suggested_action: 'Document that selected_agent must match the workorder agent and cannot be changed by model output.',
      blocks_product_work: true,
      blocks_operator: true,
    }))
  }

  if (!/expectedAgent/i.test(dispatcher) || !/validateOrchestratorIntent|normalizeOrchestratorIntent/i.test(dispatcher)) {
    findings.push(finding({
      id: 'dispatcher.selected_agent_guard_missing',
      severity: 'high',
      layer: 'dispatcher',
      file: 'system/control-plane/dispatcher.ts',
      message: 'Dispatcher does not visibly enforce expected agent validation.',
      evidence: 'expectedAgent validation not found',
      suggested_action: 'Validate OrchestratorIntent against the workorder agent before dispatch approval logic.',
      blocks_product_work: true,
      blocks_operator: true,
    }))
  }

  if (dbAgent && !/human approval/i.test(dbAgent)) {
    findings.push(finding({
      id: 'db_migration_agent.write_approval_rule_missing',
      severity: 'high',
      layer: 'agent_contract',
      file: '.claude/agents/db-migration-agent.md',
      message: 'db-migration-agent does not state that migration writes require approval.',
      evidence: 'human approval not found',
      suggested_action: 'Require human approval for migration writes and keep Supabase execution forbidden.',
      blocks_product_work: true,
      blocks_operator: true,
    }))
  }

  if (dbAgent && !/security-specialist|post-write|post review|post-review|review/i.test(dbAgent)) {
    findings.push(finding({
      id: 'db_migration_agent.post_write_review_missing',
      severity: 'high',
      layer: 'agent_contract',
      file: '.claude/agents/db-migration-agent.md',
      message: 'db-migration-agent does not require post-write review.',
      evidence: 'post-write/security review not found',
      suggested_action: 'Require security-specialist or equivalent review after migration writes.',
      blocks_product_work: true,
      blocks_operator: true,
    }))
  }

  if (dbAgent && /supabase\s+db\s+(?:push|reset)/i.test(dbAgent)) {
    const unsafeLine = dbAgent.split(/\r?\n/).find(line =>
      /supabase\s+db\s+(?:push|reset)/i.test(line) &&
      !hasNegativeMarker(line) &&
      !/tom-only|tom only|human-only|manual only|forbidden/i.test(line)
    )
    if (unsafeLine) {
      findings.push(finding({
        id: 'db_migration_agent.supabase_execution_allowed',
        severity: 'high',
        layer: 'agent_contract',
        file: '.claude/agents/db-migration-agent.md',
        message: 'db-migration-agent appears to allow Supabase execution commands.',
        evidence: unsafeLine.trim(),
        suggested_action: 'Mark Supabase db push/reset as forbidden or Tom-only instructions.',
        blocks_product_work: true,
        blocks_operator: true,
      }))
    }
  }

  return findings
}

function checkRegistry(repoRoot: string): AgentContractFinding[] {
  const findings: AgentContractFinding[] = []
  const registry = readJson<AgentsRegistry>(repoRoot, 'system/agent-registry/agents.json', { agents: [] })
  const routing = readJson<ModelRouting>(repoRoot, 'system/agent-registry/model_routing.json', { routes: {} })
  const agentFiles = new Set(listFiles(path.join(repoRoot, '.claude/agents'), relative => relative.endsWith('.md')).map(file => `.claude/agents/${file}`))
  const registryEntries = registry.agents ?? Object.entries(registry)
    .filter(([key, value]) => !key.startsWith('_') && value && typeof value === 'object' && !Array.isArray(value))
    .map(([id, value]) => ({ id, ...(value as Record<string, unknown>) }))
  const registryAgents = new Map(registryEntries.filter(agent => agent.id).map(agent => [agent.id as string, agent]))

  for (const agent of registryEntries) {
    if (!agent.id) continue
    if (agent.spec_file && !fs.existsSync(path.join(repoRoot, agent.spec_file))) {
      findings.push(finding({
        id: 'registry.agent_spec_missing',
        severity: 'high',
        layer: 'agent_registry',
        file: 'system/agent-registry/agents.json',
        message: `Registry agent ${agent.id} points to missing spec file.`,
        evidence: `${agent.id} -> ${agent.spec_file}`,
        suggested_action: 'Add the agent spec file or correct the registry spec_file path.',
        blocks_product_work: true,
        blocks_operator: true,
      }))
    }
  }

  for (const file of agentFiles) {
    const expectedId = path.basename(file, '.md')
    if (!registryAgents.has(expectedId)) {
      findings.push(finding({
        id: 'registry.agent_file_unregistered',
        severity: 'medium',
        layer: 'agent_registry',
        file,
        message: `Agent file ${file} is not represented in agents.json.`,
        evidence: expectedId,
        suggested_action: 'Register the agent if it is runtime-facing, or document it as a non-runtime/support-only agent.',
        blocks_product_work: false,
        blocks_operator: false,
      }))
    }
  }

  for (const [agentId, route] of Object.entries(routing.routes ?? {})) {
    const specPath = `.claude/agents/${agentId}.md`
    if (!registryAgents.has(agentId) && !agentFiles.has(specPath)) {
      findings.push(finding({
        id: 'model_routing.unknown_agent',
        severity: 'medium',
        layer: 'model_routing',
        file: 'system/agent-registry/model_routing.json',
        message: `Model routing references unknown agent ${agentId}.`,
        evidence: JSON.stringify(route),
        suggested_action: 'Add the agent registry/spec entry or remove stale routing.',
        blocks_product_work: false,
        blocks_operator: false,
      }))
    }
  }

  return findings
}

function checkModelRoutingPolicy(repoRoot: string): AgentContractFinding[] {
  const findings: AgentContractFinding[] = []
  const routingText = readText(repoRoot, 'system/agent-registry/model_routing.json')
  const dispatcher = readText(repoRoot, 'system/control-plane/dispatcher.ts')
  const routing = readJson<ModelRouting>(repoRoot, 'system/agent-registry/model_routing.json', { routes: {} })
  const hasQwen36Route = Object.values(routing.routes ?? {}).some(route => String(route.model ?? '').toLowerCase().includes('qwen3.6'))

  if (hasQwen36Route) {
    const routingDocumentsThinkingOff = /enable_thinking/i.test(routingText) && /false/i.test(routingText)
    const dispatcherSetsThinkingOff = /enable_thinking\s*]\s*=\s*false|enable_thinking\s*=\s*false/i.test(dispatcher)
    const dispatcherRequestsJsonObject = /response_format/i.test(dispatcher) && /json_object/i.test(dispatcher)
    if (!routingDocumentsThinkingOff || !dispatcherSetsThinkingOff) {
      findings.push(finding({
        id: 'model_routing.qwen_thinking_policy_missing',
        severity: 'high',
        layer: 'model_routing',
        file: 'system/agent-registry/model_routing.json',
        message: 'qwen3.6 routing does not have a durable thinking-off policy enforced by dispatcher API options.',
        evidence: `routing_documents_enable_thinking_false=${routingDocumentsThinkingOff}; dispatcher_sets_enable_thinking_false=${dispatcherSetsThinkingOff}`,
        suggested_action: 'Document qwen3.6 enable_thinking:false and enforce it in dispatcher request options.',
        blocks_product_work: true,
        blocks_operator: true,
      }))
    }

    if (!dispatcherRequestsJsonObject) {
      findings.push(finding({
        id: 'model_routing.json_object_response_missing',
        severity: 'high',
        layer: 'model_routing',
        file: 'system/control-plane/dispatcher.ts',
        message: 'Dispatcher does not request JSON object response format for qwen3.6 JSON-only paths.',
        evidence: 'response_format json_object not found',
        suggested_action: 'Use API-level JSON object response format where available instead of prompt-only reliance.',
        blocks_product_work: true,
        blocks_operator: true,
      }))
    }
  }

  return findings
}

function checkApprovalOperations(repoRoot: string): AgentContractFinding[] {
  const findings: AgentContractFinding[] = []
  const operations = readJson<ApprovalOperationConfig>(repoRoot, 'system/agent-registry/approval_operation_types.json', {})

  for (const required of ['write_migration', 'write_docs']) {
    if (!operations[required]) {
      findings.push(finding({
        id: 'approval_operation.required_operation_missing',
        severity: 'high',
        layer: 'approval_lifecycle',
        file: 'system/agent-registry/approval_operation_types.json',
        message: `Required approval operation is missing: ${required}`,
        evidence: Object.keys(operations).join(', '),
        suggested_action: `Add ${required} with narrow allowed paths and explicit approval semantics.`,
        blocks_product_work: true,
        blocks_operator: true,
      }))
    }
  }

  for (const [operation, config] of Object.entries(operations)) {
    const paths = config.allowed_paths ?? []
    if (/write_any|any_write|write_all/i.test(operation)) {
      findings.push(finding({
        id: 'approval_operation.broad_write_any',
        severity: 'high',
        layer: 'approval_lifecycle',
        file: 'system/agent-registry/approval_operation_types.json',
        message: `Broad write operation is not allowed: ${operation}`,
        evidence: JSON.stringify(config),
        suggested_action: 'Replace broad write operations with narrow operation-specific path scopes.',
        blocks_product_work: true,
        blocks_operator: true,
      }))
    }

    for (const allowedPath of paths) {
      const broad = allowedPath === '**' ||
        allowedPath === '*' ||
        /^supabase\/\*\*$/i.test(allowedPath) ||
        /^system\/\*\*$/i.test(allowedPath)
      if (broad && /^write/i.test(operation)) {
        findings.push(finding({
          id: 'approval_operation.broad_path',
          severity: 'high',
          layer: 'approval_lifecycle',
          file: 'system/agent-registry/approval_operation_types.json',
          message: `Write operation ${operation} has a broad allowed path.`,
          evidence: allowedPath,
          suggested_action: 'Narrow write operation paths, e.g. supabase/migrations/** for migration writes.',
          blocks_product_work: true,
          blocks_operator: true,
        }))
      }
    }

    if (/^read/i.test(operation) && (config.requires_human_approval || config.manual_only)) {
      findings.push(finding({
        id: 'approval_operation.read_human_gate',
        severity: 'high',
        layer: 'approval_lifecycle',
        file: 'system/agent-registry/approval_operation_types.json',
        message: `Read-only operation ${operation} is human-gated.`,
        evidence: JSON.stringify(config),
        suggested_action: 'Keep read-only context operations outside human approval unless there is a specific high-risk reason.',
        blocks_product_work: true,
        blocks_operator: true,
      }))
    }
  }

  return findings
}

function checkSkillRegistry(repoRoot: string): AgentContractFinding[] {
  const findings: AgentContractFinding[] = []
  const registryPath = path.join(repoRoot, 'system/agent-registry/skill_registry.json')
  if (!fs.existsSync(registryPath)) return findings

  const registry = readJson<Record<string, unknown> & { skills?: Array<{ id?: string; path?: string }> }>(repoRoot, 'system/agent-registry/skill_registry.json', { skills: [] })
  const registrySkills = registry.skills ?? Object.entries(registry)
    .filter(([key, value]) => !key.startsWith('_') && value && typeof value === 'object' && !Array.isArray(value))
    .map(([id, value]) => ({ id, ...(value as Record<string, unknown>) }))
  const diskSkillFiles = listFiles(path.join(repoRoot, '.agents/skills'), relative => relative.endsWith('/SKILL.md') || relative === 'SKILL.md')
  const diskSkillIds = new Set(diskSkillFiles.map(file => file.split('/')[0]))
  const registrySkillIds = new Set(registrySkills.map(skill => skill.id).filter(Boolean) as string[])

  for (const skill of registrySkills) {
    if (!skill.id || !skill.path) continue
    if (!fs.existsSync(path.join(repoRoot, skill.path))) {
      findings.push(finding({
        id: 'skill_registry.path_missing',
        severity: 'medium',
        layer: 'skill_contract',
        file: 'system/agent-registry/skill_registry.json',
        message: `Skill registry path is missing for ${skill.id}.`,
        evidence: skill.path,
        suggested_action: 'Update skill_registry.json to the parser-safe SKILL.md location or document the registry as legacy.',
        blocks_product_work: false,
        blocks_operator: false,
      }))
    }
  }

  for (const skillId of diskSkillIds) {
    if (!registrySkillIds.has(skillId)) {
      findings.push(finding({
        id: 'skill_registry.disk_skill_unregistered',
        severity: 'medium',
        layer: 'skill_contract',
        file: `.agents/skills/${skillId}/SKILL.md`,
        message: `Skill exists on disk but is not listed in skill_registry.json: ${skillId}`,
        evidence: skillId,
        suggested_action: 'Add registry entry if the registry is authoritative, or document the registry as legacy.',
        blocks_product_work: false,
        blocks_operator: false,
      }))
    }
  }

  return findings
}

export function runAgentContractCheck(options: AgentContractCheckOptions = {}): AgentContractCheckResult {
  const repoRoot = options.repoRoot ?? process.cwd()
  const findings = [
    ...checkAgentFiles(repoRoot),
    ...checkSkillFiles(repoRoot),
    ...checkRegistry(repoRoot),
    ...checkSkillRegistry(repoRoot),
    ...checkModelRoutingPolicy(repoRoot),
    ...checkApprovalOperations(repoRoot),
  ]
  const summary = summarize(findings)
  const hasHighOrCriticalFindings = summary.critical > 0 || summary.high > 0

  return {
    schema_version: 1,
    generated_at: new Date().toISOString(),
    repo_root: repoRoot,
    hasHighOrCriticalFindings,
    exitCode: hasHighOrCriticalFindings ? 1 : 0,
    summary,
    product_work_gate: {
      status: 'blocked',
      reason: PRODUCT_GATE_REASON,
    },
    findings,
  }
}

export function formatAgentContractReport(result: AgentContractCheckResult): string {
  const lines = [
    '# Agent & Skill Contract Check',
    '',
    `Repo: ${result.repo_root}`,
    `Generated: ${result.generated_at}`,
    `Product work gate: ${result.product_work_gate.reason}`,
    '',
    `Summary: critical=${result.summary.critical}, high=${result.summary.high}, medium=${result.summary.medium}, low=${result.summary.low}, info=${result.summary.info}`,
    '',
  ]

  if (result.findings.length === 0) {
    lines.push('No findings.')
    return lines.join('\n')
  }

  lines.push('Findings:')
  for (const item of result.findings) {
    lines.push(`- [${item.severity}] ${item.id} (${item.layer}) ${item.file}`)
    lines.push(`  ${item.message}`)
    lines.push(`  Evidence: ${item.evidence}`)
    lines.push(`  Suggested action: ${item.suggested_action}`)
  }

  return lines.join('\n')
}

function main(): void {
  const args = process.argv.slice(2)
  const json = args.includes('--json')
  const unknown = args.filter(arg => arg !== '--json')
  if (unknown.length > 0) {
    console.error(`Unknown arguments: ${unknown.join(', ')}`)
    process.exit(2)
  }

  try {
    const result = runAgentContractCheck()
    if (json) {
      console.log(JSON.stringify(result, null, 2))
    } else {
      console.log(formatAgentContractReport(result))
    }
    process.exit(result.exitCode)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    if (json) {
      console.log(JSON.stringify({
        schema_version: 1,
        generated_at: new Date().toISOString(),
        error: message,
      }, null, 2))
    } else {
      console.error(`Agent contract check failed: ${message}`)
    }
    process.exit(2)
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  main()
}
