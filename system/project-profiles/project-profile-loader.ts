import fs from 'node:fs'
import path from 'node:path'

export type ProductGateStatus = 'closed' | 'conditional' | 'open'
export type ProjectProfileKind = 'active' | 'fixture' | 'example'

export type ProjectProfile = {
  profile_version: number
  project_id: string
  display_name: string
  profile_kind: ProjectProfileKind
  active: boolean
  repo_root: string
  governance_root: string
  specs_root: string
  workorders_root: string
  reports_root: string
  memory_root: string
  learning_root: string
  runtime_state_root: string
  approval_root: string
  raw_data_paths: string[]
  ignored_local_paths: string[]
  product_gate: {
    status: ProductGateStatus
    reason: string
    conditional_planning_allowed: boolean
  }
  forbidden_paths: string[]
  forbidden_commands: string[]
  required_checkers: string[]
  default_operator_batch: string
  default_governance_batch?: string
  default_branch_prefix: string
  source_chain_policy?: Record<string, unknown>
  allowed_domain_paths?: string[]
  runtime_policy?: Record<string, unknown>
  docs_entrypoints?: string[]
  ui_settings?: Record<string, unknown>
  promotion_policy: Record<string, unknown>
  codex_worker_policy: {
    enabled: boolean
    allowed_agents: string[]
    require_explicit_workorder_flag: boolean
    default_timeout_ms: number
  }
}

type LoadOptions = {
  repoRoot?: string
  profilesRoot?: string
}

type ProductGateContext = {
  planningOnly?: boolean
}

const DEFAULT_PROJECT_ID = 'lumeos'
const PROJECT_ID_RE = /^[a-z][a-z0-9_-]*$/

const REQUIRED_FIELDS: Array<keyof ProjectProfile> = [
  'profile_version',
  'project_id',
  'display_name',
  'repo_root',
  'governance_root',
  'specs_root',
  'workorders_root',
  'reports_root',
  'memory_root',
  'learning_root',
  'runtime_state_root',
  'approval_root',
  'raw_data_paths',
  'ignored_local_paths',
  'product_gate',
  'forbidden_paths',
  'forbidden_commands',
  'required_checkers',
  'default_operator_batch',
  'default_branch_prefix',
  'promotion_policy',
  'codex_worker_policy',
]

function toPosix(value: string): string {
  return value.replace(/\\/g, '/')
}

function normalizeRelativePath(value: string): string {
  return toPosix(value).replace(/^\/+/, '').replace(/\/+$/, value.endsWith('/') ? '/' : '')
}

function assertRepoRelativePath(value: string, field: string): void {
  const normalized = toPosix(value)
  if (path.posix.isAbsolute(normalized) || normalized.split('/').includes('..')) {
    throw new Error(`Project profile path must be repo-relative for ${field}: ${value}`)
  }
}

function validateProjectId(projectId: string): void {
  if (!PROJECT_ID_RE.test(projectId)) {
    throw new Error(`Invalid project profile id: ${projectId}`)
  }
}

function profilesRoot(repoRoot: string, options: LoadOptions): string {
  return options.profilesRoot ?? path.join(repoRoot, 'system/project-profiles/profiles')
}

function assertStringArray(profile: ProjectProfile, field: keyof ProjectProfile): void {
  if (!Array.isArray(profile[field]) || !(profile[field] as unknown[]).every(item => typeof item === 'string')) {
    throw new Error(`Project profile ${profile.project_id} field must be string[]: ${String(field)}`)
  }
}

function normalizeProfile(profile: ProjectProfile, repoRoot: string): ProjectProfile {
  const rootFields: Array<keyof ProjectProfile> = [
    'governance_root',
    'specs_root',
    'workorders_root',
    'reports_root',
    'memory_root',
    'learning_root',
    'runtime_state_root',
    'approval_root',
  ]
  for (const field of rootFields) {
    assertRepoRelativePath(String(profile[field] ?? ''), String(field))
  }
  for (const [field, values] of Object.entries({
    raw_data_paths: profile.raw_data_paths,
    ignored_local_paths: profile.ignored_local_paths,
    forbidden_paths: profile.forbidden_paths,
    allowed_domain_paths: profile.allowed_domain_paths ?? [],
    docs_entrypoints: profile.docs_entrypoints ?? [],
  })) {
    for (const value of values) assertRepoRelativePath(value, field)
  }
  if (profile.default_operator_batch) assertRepoRelativePath(profile.default_operator_batch, 'default_operator_batch')
  if (profile.default_governance_batch) assertRepoRelativePath(profile.default_governance_batch, 'default_governance_batch')

  return {
    ...profile,
    profile_kind: profile.profile_kind ?? 'active',
    active: profile.active ?? profile.profile_kind !== 'fixture',
    repo_root: path.resolve(profile.repo_root || repoRoot),
    governance_root: normalizeRelativePath(profile.governance_root),
    specs_root: normalizeRelativePath(profile.specs_root),
    workorders_root: normalizeRelativePath(profile.workorders_root),
    reports_root: normalizeRelativePath(profile.reports_root),
    memory_root: normalizeRelativePath(profile.memory_root),
    learning_root: normalizeRelativePath(profile.learning_root),
    runtime_state_root: normalizeRelativePath(profile.runtime_state_root),
    approval_root: normalizeRelativePath(profile.approval_root),
    raw_data_paths: profile.raw_data_paths.map(normalizeRelativePath),
    ignored_local_paths: profile.ignored_local_paths.map(normalizeRelativePath),
    forbidden_paths: profile.forbidden_paths.map(normalizeRelativePath),
    allowed_domain_paths: (profile.allowed_domain_paths ?? []).map(normalizeRelativePath),
    docs_entrypoints: (profile.docs_entrypoints ?? []).map(normalizeRelativePath),
  }
}

function validateProfile(profile: ProjectProfile): void {
  for (const field of REQUIRED_FIELDS) {
    if (profile[field] === undefined || profile[field] === null || profile[field] === '') {
      throw new Error(`Project profile ${profile.project_id ?? 'unknown'} missing required field: ${String(field)}`)
    }
  }
  if (!PROJECT_ID_RE.test(profile.project_id)) {
    throw new Error(`Invalid project profile id: ${profile.project_id}`)
  }
  if (!['active', 'fixture', 'example'].includes(profile.profile_kind)) {
    throw new Error(`Project profile ${profile.project_id} has invalid profile_kind.`)
  }
  if (profile.profile_kind !== 'active' && profile.active) {
    throw new Error(`Project profile ${profile.project_id} cannot be active when profile_kind is ${profile.profile_kind}.`)
  }
  assertStringArray(profile, 'raw_data_paths')
  assertStringArray(profile, 'ignored_local_paths')
  assertStringArray(profile, 'forbidden_paths')
  assertStringArray(profile, 'forbidden_commands')
  assertStringArray(profile, 'required_checkers')
  if (profile.allowed_domain_paths !== undefined && !Array.isArray(profile.allowed_domain_paths)) {
    throw new Error(`Project profile ${profile.project_id} allowed_domain_paths must be string[].`)
  }
  if (profile.docs_entrypoints !== undefined && !Array.isArray(profile.docs_entrypoints)) {
    throw new Error(`Project profile ${profile.project_id} docs_entrypoints must be string[].`)
  }
  if (!['closed', 'conditional', 'open'].includes(profile.product_gate.status)) {
    throw new Error(`Project profile ${profile.project_id} has invalid product gate status.`)
  }
  if (!Array.isArray(profile.codex_worker_policy.allowed_agents)) {
    throw new Error(`Project profile ${profile.project_id} codex_worker_policy.allowed_agents must be string[].`)
  }
}

export function loadProjectProfile(projectId: string, options: LoadOptions = {}): ProjectProfile {
  validateProjectId(projectId)
  const repoRoot = path.resolve(options.repoRoot ?? process.cwd())
  const filePath = path.join(profilesRoot(repoRoot, options), `${projectId}.json`)
  if (!fs.existsSync(filePath)) {
    throw new Error(`Project profile not found: ${projectId}`)
  }
  const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8')) as ProjectProfile
  const profile = normalizeProfile(parsed, repoRoot)
  validateProfile(profile)
  return profile
}

export function getProjectProfile(projectId?: string, options: LoadOptions = {}): ProjectProfile {
  const id = projectId ?? process.env.LUMEOS_PROJECT_PROFILE ?? DEFAULT_PROJECT_ID
  return loadProjectProfile(id, options)
}

export function resolveProjectPath(profile: ProjectProfile, relativePath: string): string {
  const repoRoot = path.resolve(profile.repo_root)
  const normalized = relativePath.replace(/\\/g, '/')
  if (path.isAbsolute(normalized)) {
    const absolute = path.resolve(normalized)
    const rel = path.relative(repoRoot, absolute)
    if (rel.startsWith('..') || path.isAbsolute(rel)) {
      throw new Error(`Resolved path is outside repo root: ${relativePath}`)
    }
    return absolute
  }
  const absolute = path.resolve(repoRoot, normalized)
  const rel = path.relative(repoRoot, absolute)
  if (rel.startsWith('..') || path.isAbsolute(rel)) {
    throw new Error(`Resolved path is outside repo root: ${relativePath}`)
  }
  return absolute
}

function globToRegExp(pattern: string): RegExp {
  const normalized = normalizeRelativePath(pattern)
  const escaped = normalized
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*\*/g, '.*')
    .replace(/\*/g, '[^/]*')
  return new RegExp(`^${escaped}$`)
}

function pathMatches(patterns: string[], filePath: string): boolean {
  const normalized = normalizeRelativePath(filePath)
  return patterns.some(pattern => {
    const p = normalizeRelativePath(pattern)
    if (p.endsWith('/')) return normalized.startsWith(p)
    if (p.endsWith('/**')) return normalized.startsWith(p.slice(0, -3))
    if (p.includes('*')) return globToRegExp(p).test(normalized)
    return normalized === p
  })
}

export function isForbiddenPath(profile: ProjectProfile, filePath: string): boolean {
  return pathMatches(profile.forbidden_paths, filePath)
}

export function isRuntimeArtifactPath(profile: ProjectProfile, filePath: string): boolean {
  const normalized = normalizeRelativePath(filePath)
  return normalized.startsWith(`${profile.runtime_state_root}/`) ||
    normalized === `${profile.approval_root}/queue.json` ||
    normalized === `${profile.approval_root}/approvals.json` ||
    /^system\/state\/.*\.lock$/.test(normalized)
}

export function isRawLocalPath(profile: ProjectProfile, filePath: string): boolean {
  return pathMatches(profile.raw_data_paths, filePath)
}

export function isProductWorkAllowed(profile: ProjectProfile, context: ProductGateContext = {}): { allowed: boolean; reason: string } {
  if (profile.product_gate.status === 'open') return { allowed: true, reason: profile.product_gate.reason }
  if (profile.product_gate.status === 'conditional' && context.planningOnly && profile.product_gate.conditional_planning_allowed) {
    return { allowed: true, reason: profile.product_gate.reason }
  }
  return { allowed: false, reason: profile.product_gate.reason }
}
