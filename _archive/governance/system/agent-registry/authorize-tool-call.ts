/**
 * LUMEOS Permission Gateway V0.2.1
 *
 * Jeder Tool Call eines Agenten läuft durch diese Datei.
 * Kein LLM hat direkten Filesystem- oder Bash-Zugriff.
 *
 * Source of Truth:
 *   system/agent-registry/agents.json
 *   system/agent-registry/permissions.json
 *   system/agent-registry/tool_profiles.json
 *
 * TODO V0.3:
 *   - MCP Operation-Level (read vs write vs delete pro Tool)
 *   - network_allowed Enforcement
 *   - SQL AST Guard statt Regex
 */

export const PERMISSION_GATE_VERSION = '0.3.0'

import fs          from 'node:fs'
import path        from 'node:path'
import micromatch  from 'micromatch'

// Dynamic loads — CWD-relativ damit Smoke Test und Production gleich arbeiten
const REGISTRY_DIR = path.resolve(process.cwd(), 'system/agent-registry')

function loadRegistry() {
  const agents      = JSON.parse(fs.readFileSync(path.join(REGISTRY_DIR, 'agents.json'), 'utf8'))
  const permissions = JSON.parse(fs.readFileSync(path.join(REGISTRY_DIR, 'permissions.json'), 'utf8'))
  const toolProfiles = JSON.parse(fs.readFileSync(path.join(REGISTRY_DIR, 'tool_profiles.json'), 'utf8'))
  return { agents, permissions, toolProfiles }
}

// ─── Typen ───────────────────────────────────────────────────────────────────

type ToolOperation = 'read' | 'write' | 'bash' | 'mcp'
type SparkMode     = 'mode1' | 'mode2' | 'transitioning'

interface ToolCallRequest {
  agentId:       string
  workorderId:   string
  tool:          ToolOperation
  targetPath?:   string
  command?:      string
  mcpTool?:      string
  mcpOperation?: string          // TODO V0.3
}

interface WorkorderContext {
  scope_files:           string[]
  context_files:         string[]
  acceptance_files:      string[]
  already_written_files: string[]
  /** A.2: Pfade die der Worker explizit nicht berühren darf. */
  files_blocked?:        string[]
}

interface RunContext {
  sparkMode: SparkMode
}

interface AuthResult {
  allowed:    boolean
  reason?:    string
  blockedBy?: string
}

// ─── Pfad-Normalisierung + Path Traversal Block ──────────────────────────────

function normalizeRepoPath(input: string): string {
  const forward = input.replace(/\\/g, '/')

  // Windows-Absolutpfade: D:/... C:/...
  if (/^[A-Za-z]:\//.test(forward))
    throw new Error(`Windows absolute path blocked: ${input}`)

  // Unix-Absolutpfade
  if (forward.startsWith('/'))
    throw new Error(`Absolute path blocked: ${input}`)

  const normalized = path.posix.normalize(forward)

  // Path Traversal
  if (normalized.startsWith('../') || normalized === '..')
    throw new Error(`Path traversal blocked: ${input}`)

  return normalized
}

// ─── Repo-Readonly Blocklist ──────────────────────────────────────────────────

const REPO_READONLY_BLOCKED = [
  '.git/**', 'node_modules/**', 'dist/**',
  'build/**', '.next/**', 'coverage/**', 'logs/**',
]

function isRepoReadonlyBlocked(target: string): boolean {
  return micromatch.isMatch(target, REPO_READONLY_BLOCKED)
}

// ─── Glob-basierte Pfadprüfung ────────────────────────────────────────────────

function pathIsAllowed(rawTarget: string, allowedPatterns: string[]): boolean {
  const target = normalizeRepoPath(rawTarget)
  return allowedPatterns.some(pattern => {
    if (pattern === '__repo_readonly__') return !isRepoReadonlyBlocked(target)
    if (pattern === target)             return true
    if (pattern.replace(/\\/g, '/').endsWith('/')) {
      const dir = normalizeRepoPath(pattern)
      return target.startsWith(dir)
    }
    return micromatch.isMatch(target, pattern)
  })
}

/**
 * A.2: Öffentliche Utility für Post-Execution Scope-Check im Dispatcher.
 * Prüft ob ein Pfad innerhalb der erlaubten scope_files liegt.
 * Nutzt dieselbe micromatch-Logik wie interne Pfadprüfung.
 */
export function isPathInScope(targetPath: string, scopeFiles: string[]): boolean {
  if (scopeFiles.length === 0) return true  // kein Scope definiert → kein Check
  try { return pathIsAllowed(targetPath, scopeFiles) }
  catch { return false }
}

// ─── ENV-Schutz ──────────────────────────────────────────────────────────────

function isEnvFile(input: string): boolean {
  const p        = normalizeRepoPath(input)
  const filename = p.split('/').pop() ?? p
  return (
    filename === '.env'          ||
    filename.startsWith('.env.') ||
    filename.endsWith('.env')    ||
    p.includes('/.env')          ||
    p.includes('/.env.')
  )
}

// ─── Dependency-File Guard ───────────────────────────────────────────────────

const DEPENDENCY_FILES = [
  'package.json', 'pnpm-lock.yaml', 'package-lock.json', 'yarn.lock', 'bun.lockb',
]

function isDependencyFile(input: string): boolean {
  const p = normalizeRepoPath(input)
  return DEPENDENCY_FILES.some(f => p.endsWith(f))
}

// ─── Migration-Path Guard ────────────────────────────────────────────────────

function isMigrationPath(input: string): boolean {
  const p = normalizeRepoPath(input)
  return p.startsWith('supabase/migrations/') || p.startsWith('db/migrations/')
}

// ─── Variable-Auflösung ──────────────────────────────────────────────────────

function resolvePath(raw: string, ctx: WorkorderContext): string[] {
  const map: Record<string, string[]> = {
    '$WORKORDER.scope_files':      ctx.scope_files,
    '$WORKORDER.context_files':    ctx.context_files,
    '$WORKORDER.acceptance_files': ctx.acceptance_files,
    '$RUN.diff':                   ['__git_diff__'],
    '$RUN.logs':                   ['__run_logs__'],
    'repo_readonly':               ['__repo_readonly__'],
  }
  return map[raw] ?? [raw]
}

function resolveAll(rawPaths: string[], ctx: WorkorderContext): string[] {
  return rawPaths.flatMap(p => resolvePath(p, ctx))
}

// ─── SQL Guard ───────────────────────────────────────────────────────────────

const ROLLBACK_SECTION_RE = /\b(DOWN|ROLLBACK|REVERT|UNDO)\b/i
const ROLLBACK_SECTION_MARKER_RE = /^\s*--\s*(DOWN|ROLLBACK|REVERT|UNDO)\s*:?\s*$/i

function stripSqlComments(sql: string): string {
  let out = ''
  let inBlock = false
  for (let i = 0; i < sql.length; i++) {
    const ch = sql[i]
    const next = sql[i + 1]
    if (inBlock) {
      if (ch === '*' && next === '/') {
        inBlock = false
        i++
      } else if (ch === '\n') {
        out += '\n'
      } else {
        out += ' '
      }
      continue
    }
    if (ch === '/' && next === '*') {
      inBlock = true
      out += '  '
      i++
      continue
    }
    if (ch === '-' && next === '-') {
      while (i < sql.length && sql[i] !== '\n') i++
      out += '\n'
      continue
    }
    out += ch
  }
  return out
}

function splitSqlStatements(sqlWithoutComments: string): string[] {
  return sqlWithoutComments
    .split(';')
    .map(s => s.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
}

function findBlockedSqlStatement(statement: string): string | null {
  const normalized = statement.toUpperCase()
  if (/\bDROP\s+SCHEMA\b/.test(normalized)) return 'DROP SCHEMA'
  if (/\bDROP\s+TABLE\b/.test(normalized)) return 'DROP TABLE'
  if (/\bTRUNCATE\b/.test(normalized)) return 'TRUNCATE'
  if (/\bREVOKE\b/.test(normalized)) return 'REVOKE'
  if (/\bALTER\s+TABLE\b[\s\S]*\bDROP\s+COLUMN\b/.test(normalized)) return 'ALTER TABLE DROP COLUMN'
  if (/\bDROP\s+POLICY\b/.test(normalized)) return 'DROP POLICY'
  if (/\bDROP\s+INDEX\b/.test(normalized)) return 'DROP INDEX'
  if (/\bDELETE\s+FROM\b/.test(normalized) && !/\bWHERE\b/.test(normalized)) return 'DELETE FROM without WHERE'
  return null
}

function firstExecutableAfterRollbackSection(sql: string): string | null {
  let inRollbackSection = false
  let inBlock = false
  for (const rawLine of sql.split(/\r?\n/)) {
    let executable = ''
    for (let i = 0; i < rawLine.length; i++) {
      const ch = rawLine[i]
      const next = rawLine[i + 1]
      if (inBlock) {
        if (ch === '*' && next === '/') {
          inBlock = false
          i++
        }
        continue
      }
      if (ch === '/' && next === '*') {
        inBlock = true
        i++
        continue
      }
      if (ch === '-' && next === '-') break
      executable += ch
    }
    if (ROLLBACK_SECTION_MARKER_RE.test(rawLine)) inRollbackSection = true
    const trimmed = executable.trim()
    if (inRollbackSection && trimmed) return trimmed
  }
  return null
}

export function guardMigrationContent(sql: string, agentId: string): AuthResult {
  if (agentId !== 'db-migration-agent')
    return { allowed: false, reason: 'Nur db-migration-agent darf Migrations schreiben', blockedBy: 'agent_type' }

  const rawLower = sql.toLowerCase()
  for (const command of ['supabase db push --linked', 'supabase db push', 'supabase db reset']) {
    if (rawLower.includes(command))
      return { allowed: false, reason: `Supabase command in migration content blocked: ${command}`, blockedBy: 'migration_guard' }
  }

  const rollbackExecutable = firstExecutableAfterRollbackSection(sql)
  if (rollbackExecutable) {
    return { allowed: false, reason: `Executable SQL after rollback section blocked: ${rollbackExecutable}`, blockedBy: 'migration_guard' }
  }

  for (const statement of splitSqlStatements(stripSqlComments(sql))) {
    const blocked = findBlockedSqlStatement(statement)
    if (blocked)
      return { allowed: false, reason: `Destruktives SQL gesperrt: ${blocked}`, blockedBy: 'migration_guard' }
  }
  return { allowed: true }
}

// ─── MiniMax Mode Guard ───────────────────────────────────────────────────────

const REQUIRES_MODE2   = ['senior-coding-agent']
const BLOCKED_IN_MODE2 = ['security-specialist', 'test-agent', 'i18n-agent', 'docs-agent']

export function checkModeAvailability(agentId: string, mode: SparkMode): AuthResult {
  if (mode === 'transitioning')
    return { allowed: false, reason: 'Spark 3+4 wechseln den Mode — bitte warten', blockedBy: 'mode_transitioning' }

  if (mode === 'mode2' && BLOCKED_IN_MODE2.includes(agentId))
    return { allowed: false, reason: `${agentId} gesperrt während MiniMax Mode 2 aktiv ist`, blockedBy: 'mode2_lock' }

  if (REQUIRES_MODE2.includes(agentId) && mode !== 'mode2')
    return { allowed: false, reason: `${agentId} benötigt Mode 2 — erst über Nemotron aktivieren`, blockedBy: 'mode2_required' }

  return { allowed: true }
}

// ─── Haupt-Funktion ───────────────────────────────────────────────────────────

export function authorizeToolCall(
  req:    ToolCallRequest,
  ctx:    WorkorderContext = { scope_files: [], context_files: [], acceptance_files: [], already_written_files: [] },
  runCtx: RunContext       = { sparkMode: 'mode1' }
): AuthResult {

  // 0. Registry laden (CWD-relativ — funktioniert in Tests + Production gleich)
  const { agents, permissions, toolProfiles } = loadRegistry()

  // 1. Agent muss in agents.json UND permissions.json stehen
  const agent = agents[req.agentId]
  if (!agent)
    return { allowed: false, reason: `Unbekannter Agent: ${req.agentId}`, blockedBy: 'agents_registry' }

  const perms = permissions[req.agentId]
  if (!perms)
    return { allowed: false, reason: `Keine Permissions für: ${req.agentId}`, blockedBy: 'permissions_registry' }

  // 2. Tool Profile laden und mit Agent-Permissions zusammenführen
  const profile = toolProfiles.profiles?.[agent.type] ?? {}
  const limits  = { ...profile, ...(perms.limits ?? {}) }

  // 3. MiniMax Mode Guard — aktiv enforced
  const modeCheck = checkModeAvailability(req.agentId, runCtx.sparkMode)
  if (!modeCheck.allowed) return modeCheck

  // 4. ENV global gesperrt
  if (req.targetPath) {
    try {
      if (isEnvFile(req.targetPath))
        return { allowed: false, reason: `.env gesperrt: ${req.targetPath}`, blockedBy: 'global_env_policy' }
    } catch (e: any) {
      return { allowed: false, reason: e.message, blockedBy: 'path_security' }
    }
  }

  // 5. Tool-spezifische Prüfungen
  switch (req.tool) {

    case 'read': {
      if (!req.targetPath)
        return { allowed: false, reason: 'targetPath fehlt', blockedBy: 'validation' }
      try {
        const allowed = resolveAll(perms.read ?? [], ctx)
        if (!pathIsAllowed(req.targetPath, allowed))
          return { allowed: false, reason: `Lesen nicht erlaubt: ${req.targetPath}`, blockedBy: 'permissions.read' }
      } catch (e: any) {
        return { allowed: false, reason: e.message, blockedBy: 'path_security' }
      }
      return { allowed: true }
    }

    case 'write': {
      if (!req.targetPath)
        return { allowed: false, reason: 'targetPath fehlt', blockedBy: 'validation' }

      try { normalizeRepoPath(req.targetPath) }
      catch (e: any) { return { allowed: false, reason: e.message, blockedBy: 'path_security' } }

      // A.2: files_blocked — explizit verbotene Pfade, höchste Priorität
      if (ctx.files_blocked && ctx.files_blocked.length > 0) {
        try {
          if (pathIsAllowed(req.targetPath, ctx.files_blocked))
            return { allowed: false, reason: `Datei in files_blocked: ${req.targetPath}`, blockedBy: 'files_blocked_policy' }
        } catch (e: any) {
          return { allowed: false, reason: e.message, blockedBy: 'path_security' }
        }
      }

      // Tool-Profil: write_allowed hart prüfen
      if (profile.write_allowed === false)
        return { allowed: false, reason: `${req.agentId} darf laut Tool-Profil nicht schreiben`, blockedBy: 'profile.write_allowed' }

      const writePaths: string[] = perms.write ?? []
      if (writePaths.length === 0)
        return { allowed: false, reason: `${req.agentId} hat keine Schreibrechte`, blockedBy: 'permissions.write' }

      if (limits.dependency_changes === false && isDependencyFile(req.targetPath))
        return { allowed: false, reason: `Dependency-Datei gesperrt: ${req.targetPath}`, blockedBy: 'limits.dependency_changes' }

      if (isMigrationPath(req.targetPath) && req.agentId !== 'db-migration-agent')
        return { allowed: false, reason: 'Nur db-migration-agent darf Migrations schreiben', blockedBy: 'migration_guard' }

      const allowed = resolveAll(writePaths, ctx)
      if (!pathIsAllowed(req.targetPath, allowed))
        return { allowed: false, reason: `Schreiben nicht erlaubt: ${req.targetPath}`, blockedBy: 'permissions.write' }

      const maxFiles = limits.max_write_files as number | undefined
      if (maxFiles !== undefined) {
        const written = new Set([...ctx.already_written_files, req.targetPath])
        if (written.size > maxFiles)
          return { allowed: false, reason: `max_write_files überschritten: ${written.size}/${maxFiles}`, blockedBy: 'limits.max_write_files' }
      }

      return { allowed: true }
    }

    case 'bash': {
      if (!req.command)
        return { allowed: false, reason: 'command fehlt', blockedBy: 'validation' }

      if (profile.bash_allowed === false)
        return { allowed: false, reason: `${req.agentId} darf kein Bash ausführen`, blockedBy: 'profile.bash_allowed' }

      const allowedCmds: string[] = perms.bash ?? []
      if (allowedCmds.length === 0)
        return { allowed: false, reason: `Keine Bash-Kommandos für ${req.agentId}`, blockedBy: 'permissions.bash' }

      // EXAKTER Match — verhindert "pnpm test && rm -rf ."
      if (!allowedCmds.includes(req.command.trim()))
        return { allowed: false, reason: `Bash nicht in Allowlist: "${req.command}"`, blockedBy: 'bash_exact_match' }

      return { allowed: true }
    }

    case 'mcp': {
      // TODO V0.3: mcpOperation (read/write/delete) pro Tool prüfen
      if (!req.mcpTool)
        return { allowed: false, reason: 'mcpTool fehlt', blockedBy: 'validation' }

      // Tool-Profil: supabase_allowed hart prüfen
      if (req.mcpTool === 'supabase' && profile.supabase_allowed === false)
        return { allowed: false, reason: 'Supabase laut Tool-Profil gesperrt', blockedBy: 'profile.supabase_allowed' }

      if (!(perms.mcp ?? {})[req.mcpTool])
        return { allowed: false, reason: `MCP nicht erlaubt: ${req.mcpTool}`, blockedBy: 'permissions.mcp' }

      return { allowed: true }
    }

    default:
      return { allowed: false, reason: `Unbekannte Operation: ${req.tool}`, blockedBy: 'validation' }
  }
}
