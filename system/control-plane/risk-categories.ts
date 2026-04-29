/**
 * LUMEOS Risk Categories — Single Source of Truth
 * system/control-plane/risk-categories.ts
 *
 * Alle Kategorien, Routing-Regeln und Guards für High-Risk-Workorders.
 *
 * Import aus governance-validator.ts UND dispatcher.ts — nie duplizieren.
 *
 * Kategorien-Übersicht:
 *   standard      — normale Code-WOs, kein besonderer Schutz
 *   docs          — nur Dokumentation, kein Code
 *   i18n          — nur Übersetzungen
 *   test          — nur Testdateien
 *   db-migration  — Schema-Änderungen, Supabase
 *   security      — Sicherheitscode allgemein
 *   auth          — Authentifizierung, Sessions, Tokens
 *   rls           — Row Level Security, Supabase Policies
 *   medical       — health data, HIPAA-sensitive
 *   payments      — Zahlungslogik, finanzielle Daten
 *   shared-core   — shared packages, breaking changes möglich
 *   architecture  — strukturelle Änderungen, Interfaces
 *   release       — Deployment, CI/CD, Versionierung
 */

// ─── Typ-Definitionen ─────────────────────────────────────────────────────────

export type RiskCategory =
  | 'standard'
  | 'docs'
  | 'i18n'
  | 'test'
  | 'db-migration'
  | 'security'
  | 'auth'
  | 'rls'
  | 'medical'
  | 'payments'
  | 'shared-core'
  | 'architecture'
  | 'release'

export interface RiskProfile {
  /** Spark D (GPT-OSS Senior Reviewer) ist mandatory blocking */
  sparkD_mandatory: boolean
  /** Auto-Retry nach Pipeline-REWRITE erlaubt */
  auto_retry_allowed: boolean
  /** Human Approval vor Production-Step Pflicht */
  human_approval_required: boolean
  /** Hinweis auf empfohlene Pflicht-Gates */
  required_gates_hint: string[]
}

// ─── Risk-Matrix ──────────────────────────────────────────────────────────────

export const RISK_PROFILES: Record<RiskCategory, RiskProfile> = {
  standard: {
    sparkD_mandatory:       false,
    auto_retry_allowed:     true,
    human_approval_required: false,
    required_gates_hint:    ['typecheck-gate', 'test-gate', 'files-scope-gate'],
  },
  docs: {
    sparkD_mandatory:       false,
    auto_retry_allowed:     true,
    human_approval_required: false,
    required_gates_hint:    ['files-scope-gate'],
  },
  i18n: {
    sparkD_mandatory:       false,
    auto_retry_allowed:     true,
    human_approval_required: false,
    required_gates_hint:    ['files-scope-gate'],
  },
  test: {
    sparkD_mandatory:       false,
    auto_retry_allowed:     true,
    human_approval_required: false,
    required_gates_hint:    ['typecheck-gate', 'test-gate', 'files-scope-gate'],
  },
  'db-migration': {
    sparkD_mandatory:       true,
    auto_retry_allowed:     false,
    human_approval_required: true,
    required_gates_hint:    ['db-migration-gate', 'rollback-gate', 'typecheck-gate', 'test-gate', 'review-gate', 'files-scope-gate'],
  },
  security: {
    sparkD_mandatory:       true,
    auto_retry_allowed:     false,
    human_approval_required: false,
    required_gates_hint:    ['security-gate', 'review-gate', 'test-gate', 'files-scope-gate'],
  },
  auth: {
    sparkD_mandatory:       true,
    auto_retry_allowed:     false,
    human_approval_required: false,
    required_gates_hint:    ['security-gate', 'review-gate', 'test-gate', 'files-scope-gate'],
  },
  rls: {
    sparkD_mandatory:       true,
    auto_retry_allowed:     false,
    human_approval_required: false,
    required_gates_hint:    ['security-gate', 'review-gate', 'test-gate', 'files-scope-gate'],
  },
  medical: {
    sparkD_mandatory:       true,
    auto_retry_allowed:     false,
    human_approval_required: true,
    required_gates_hint:    ['security-gate', 'review-gate', 'test-gate', 'files-scope-gate', 'human-approval-gate'],
  },
  payments: {
    sparkD_mandatory:       true,
    auto_retry_allowed:     false,
    human_approval_required: true,
    required_gates_hint:    ['security-gate', 'review-gate', 'test-gate', 'files-scope-gate', 'human-approval-gate'],
  },
  'shared-core': {
    sparkD_mandatory:       true,
    auto_retry_allowed:     false,
    human_approval_required: true,
    required_gates_hint:    ['review-gate', 'typecheck-gate', 'test-gate', 'files-scope-gate', 'human-approval-gate'],
  },
  architecture: {
    sparkD_mandatory:       true,
    auto_retry_allowed:     false,
    human_approval_required: true,
    required_gates_hint:    ['review-gate', 'typecheck-gate', 'test-gate', 'files-scope-gate', 'human-approval-gate'],
  },
  release: {
    sparkD_mandatory:       true,
    auto_retry_allowed:     false,
    human_approval_required: true,
    required_gates_hint:    ['review-gate', 'test-gate', 'files-scope-gate', 'human-approval-gate'],
  },
}

// ─── Keyword-Map für Inferenz aus WO-Task ──────────────────────────────────────

const CATEGORY_KEYWORDS: Array<{ keywords: string[]; category: RiskCategory }> = [
  { keywords: ['migration', 'schema', 'alter table', 'create table', 'drop table', 'supabase/migrations'],    category: 'db-migration' },
  { keywords: ['auth', 'session', 'token', 'oauth', 'jwt', 'login', 'logout', 'authenticate'],               category: 'auth' },
  { keywords: ['rls', 'row level security', 'policy', 'policies'],                                            category: 'rls' },
  { keywords: ['medical', 'health data', 'patient', 'hipaa', 'diagnosis', 'treatment'],                       category: 'medical' },
  { keywords: ['payment', 'stripe', 'billing', 'invoice', 'subscription', 'checkout'],                        category: 'payments' },
  { keywords: ['shared-core', 'shared package', 'packages/', 'breaking change'],                              category: 'shared-core' },
  { keywords: ['architecture', 'restructure', 'refactor api', 'redesign', 'interface change'],                category: 'architecture' },
  { keywords: ['release', 'deploy', 'deployment', 'ci/cd', 'version bump', 'publish'],                       category: 'release' },
  { keywords: ['security', 'vulnerability', 'exploit', 'xss', 'csrf', 'injection', 'permissions', 'admin'],  category: 'security' },
  { keywords: ['i18n', 'translation', 'locale', 'locales/', 'i18n/'],                                        category: 'i18n' },
  { keywords: ['.test.ts', 'test file', 'unit test', 'integration test', '__tests__'],                       category: 'test' },
  { keywords: ['readme', 'documentation', 'jsdoc', 'changelog', 'docs/'],                                    category: 'docs' },
]

// ─── Öffentliche Funktionen ───────────────────────────────────────────────────

/** Alle validen Kategorie-Namen (für Schema-Enum und Validation). */
export const ALL_RISK_CATEGORIES: RiskCategory[] = Object.keys(RISK_PROFILES) as RiskCategory[]

/** Gibt das Risk-Profil für eine Kategorie zurück. Fallback: standard. */
export function getRiskProfile(category?: string | null): RiskProfile {
  if (!category) return RISK_PROFILES.standard
  const lower = category.toLowerCase() as RiskCategory
  return RISK_PROFILES[lower] ?? RISK_PROFILES.standard
}

/** Spark D ist mandatory für diese Kategorie. */
export function requiresSparkD(category?: string | null): boolean {
  return getRiskProfile(category).sparkD_mandatory
}

/** Auto-Retry nach Pipeline-REWRITE ist erlaubt. */
export function isAutoRetryAllowed(category?: string | null): boolean {
  return getRiskProfile(category).auto_retry_allowed
}

/** Human Approval ist vor Production-Step Pflicht. */
export function requiresHumanApproval(category?: string | null): boolean {
  return getRiskProfile(category).human_approval_required
}

/**
 * Inferiert die Kategorie aus dem WO-Task-Text.
 * Wird verwendet wenn kein explizites risk_category im WO vorhanden.
 * Explizites risk_category hat immer Vorrang.
 */
export function inferCategoryFromTask(task: string): RiskCategory {
  const lower = task.toLowerCase()
  for (const { keywords, category } of CATEGORY_KEYWORDS) {
    if (keywords.some(kw => lower.includes(kw))) return category
  }
  return 'standard'
}
