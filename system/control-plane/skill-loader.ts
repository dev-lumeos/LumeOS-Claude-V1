/**
 * LUMEOS Skill Loader V1.1
 * Deterministisches Skill Loading via skill_registry.json.
 * Hard fail bei fehlenden required Skills.
 * Fehlende Skill-Datei = error (kein stiller leerer String).
 */

import fs   from 'node:fs'
import path from 'node:path'

interface SkillRegistryEntry {
  type:                'runtime' | 'domain' | 'pipeline'
  path:                string
  max_tokens:          number
  pipeline_only:       boolean
  default_priority:    string
  allowed_agent_types: string[]
}

interface SkillRegistry { [name: string]: SkillRegistryEntry }

export interface LoadedSkill { name: string; content: string; tokens: number }

export interface LoadSkillsResult {
  loaded:  LoadedSkill[]
  errors:  string[]
  blocked: boolean
}

interface LoadSkillsInput {
  agentId:        string
  agentType:      string
  requiredSkills: string[]
  optionalSkills: string[]
  alwaysLoad:     string[]
  tokenBudget:    number
}

const REGISTRY_PATH = path.resolve(process.cwd(), 'system/agent-registry/skill_registry.json')

function loadRegistry(): SkillRegistry {
  if (!fs.existsSync(REGISTRY_PATH)) return {}
  try { return JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8')) }
  catch { return {} }
}

function validateSkill(name: string, agentType: string, registry: SkillRegistry): { valid: boolean; reason?: string } {
  const entry = registry[name]
  if (!entry) return { valid: false, reason: `Skill nicht in Registry: ${name}` }
  if (entry.pipeline_only) return { valid: false, reason: `Pipeline-Skill nicht im Dispatch erlaubt: ${name}` }
  if (entry.allowed_agent_types.length > 0 && !entry.allowed_agent_types.includes(agentType))
    return { valid: false, reason: `Skill ${name} nicht erlaubt für Agent-Typ: ${agentType}` }
  return { valid: true }
}

function estimateTokens(text: string): number { return Math.ceil(text.length / 4) }

function loadSkillFile(skillPath: string, maxTokens: number): { content: string | null; error?: string } {
  const fullPath = path.resolve(process.cwd(), skillPath)
  if (!fs.existsSync(fullPath)) return { content: null, error: `Skill-Datei nicht gefunden: ${skillPath}` }
  try {
    const content  = fs.readFileSync(fullPath, 'utf8')
    const maxChars = maxTokens * 4
    return { content: content.length <= maxChars ? content : content.slice(0, maxChars) + '\n[... gekürzt ...]' }
  } catch (e: any) {
    return { content: null, error: `Fehler beim Lesen von ${skillPath}: ${e.message}` }
  }
}

export function loadSkills(input: LoadSkillsInput): LoadSkillsResult {
  const registry  = loadRegistry()
  const loaded:   LoadedSkill[] = []
  const errors:   string[]      = []
  let   usedTokens = 0
  let   blocked    = false
  const seen        = new Set<string>()

  const tryAdd = (name: string): boolean => { if (seen.has(name)) return true; seen.add(name); return false }

  // Priorität 1: required_skills — hard fail
  for (const name of input.requiredSkills) {
    if (tryAdd(name)) continue
    const check = validateSkill(name, input.agentType, registry)
    if (!check.valid) { errors.push(`[REQUIRED] ${check.reason}`); blocked = true; continue }
    const entry = registry[name]
    const file  = loadSkillFile(entry.path, entry.max_tokens)
    if (!file.content) { errors.push(`[REQUIRED] ${file.error}`); blocked = true; continue }
    const tokens = estimateTokens(file.content)
    loaded.push({ name, content: file.content, tokens })
    usedTokens += tokens
  }

  if (blocked) return { loaded: [], errors, blocked: true }

  // Priorität 2: always_load_skills
  for (const name of input.alwaysLoad) {
    if (tryAdd(name)) continue
    const check = validateSkill(name, input.agentType, registry)
    if (!check.valid) { errors.push(`[ALWAYS_LOAD] ${check.reason}`); continue }
    const remaining = input.tokenBudget - usedTokens
    if (remaining <= 0) continue
    const entry = registry[name]
    const file  = loadSkillFile(entry.path, Math.min(entry.max_tokens, remaining))
    if (!file.content) { errors.push(`[ALWAYS_LOAD] ${file.error}`); continue }
    const tokens = estimateTokens(file.content)
    loaded.push({ name, content: file.content, tokens })
    usedTokens += tokens
  }

  // Priorität 3: optional_skills — skip wenn Budget knapp
  for (const name of input.optionalSkills) {
    if (tryAdd(name)) continue
    const check = validateSkill(name, input.agentType, registry)
    if (!check.valid) { errors.push(`[OPTIONAL] ${check.reason}`); continue }
    const remaining = input.tokenBudget - usedTokens
    if (remaining <= 0) break
    const entry = registry[name]
    const file  = loadSkillFile(entry.path, Math.min(entry.max_tokens, remaining))
    if (!file.content) { errors.push(`[OPTIONAL] ${file.error}`); continue }
    const tokens = estimateTokens(file.content)
    loaded.push({ name, content: file.content, tokens })
    usedTokens += tokens
  }

  return { loaded, errors, blocked: false }
}

export function buildSystemPrompt(agentSpec: string, skills: LoadedSkill[]): string {
  if (!skills.length) return agentSpec
  const blocks = skills.map(s => `<skill name="${s.name}">\n${s.content}\n</skill>`).join('\n\n')
  return `${agentSpec}\n\n<loaded_skills>\n${blocks}\n</loaded_skills>`
}

export function validateWorkorderSkills(requiredSkills: string[], optionalSkills: string[], agentType: string): { valid: boolean; errors: string[] } {
  const registry = loadRegistry()
  const errors:  string[] = []
  for (const name of requiredSkills) { const c = validateSkill(name, agentType, registry); if (!c.valid) errors.push(`[required] ${c.reason}`) }
  for (const name of optionalSkills) { const c = validateSkill(name, agentType, registry); if (!c.valid) errors.push(`[optional] ${c.reason}`) }
  return { valid: errors.length === 0, errors }
}
