# Agent Registry V2 — LumeOS
# Status: AKTIV — Phase 1 (2 Sparks)
# Erstellt: April 2026

---

## Architektur

```
Brain (Claude + Tom)
  → Workorder erstellen + Executor definieren

Workflow:
  Claude → Workorder
         → [pre-review-agent]   Qwen3.6 prüft Vollständigkeit
         → [orchestrator-agent] Nemotron dispatcht (Phase 1: Qwen3.6)
         → [executor]           Definierter Agent führt aus
         → [post-review-agent]  Qwen3.6 prüft Output vs Workorder
         → Approval Gate
         → Tom
```

---

## Tier Referenz

Siehe `system/model-tiers/model_tiers_v2.md` für Modell-Konfigurationen.

| Tier | Phase 1 Node | Phase 2 Node |
|------|-------------|-------------|
| `orchestrator` | Spark 1 (Qwen3.6) | Spark 1 (Nemotron) |
| `review` | Spark 1 (Qwen3.6) | Spark 1 (Qwen3.6) |
| `coding` | Spark 2 (Qwen3-Coder-Next) | Spark 2 (Qwen3-Coder-Next) |
| `intelligence` | Remote (MiniMax M2.7) | Spark 3+4 (MiniMax M2.7) |
| `reasoning` | Remote (DeepSeek-R1) | Spark 3 (DeepSeek-R1) |
| `test_review` | Spark 1 (Qwen3.6) | Spark 4 (GLM-4.7-Flash) |
| `sidekick` | Spark 2 (Qwen3-Coder) | Spark 4 (Qwen3.5 9B) |
| `vision` | RTX 5090 | RTX 5090 |

---

## Brain Agents (Claude Code — extern)

### spec-analyst
```yaml
agent_id: spec-analyst
role: Chat → RawData → Spec → Decomposition Spec
execution: external (Claude Code)
scheduler_controlled: false
model_tier: null
node: null
tools:
  - filesystem_read
  - serena_symbol_search
  - lightrag_query
  - memory_read
```

### wo-writer
```yaml
agent_id: wo-writer
role: Decomposition Spec → Workorders
execution: external (Claude Code)
scheduler_controlled: false
model_tier: null
node: null
tools:
  - filesystem_write
  - wo_schema_validator
```

---

## System Agents

### orchestrator-agent
```yaml
agent_id: orchestrator-agent
role: Runtime Dispatch + Monitoring + Agent Coordination
model_tier: orchestrator  # Phase 1: Qwen3.6 / Phase 2: Nemotron
default_temp: 0.6
thinking: ON
context_window: 131072  # Phase 1 / 1000000 Phase 2

responsibilities:
  - WO-Queue überwachen
  - Jobs an korrekte Executor-Agenten dispatchen
  - Mode 1 / Mode 2 entscheiden (Phase 2)
  - Fehlerklassifizierung + Retry-Entscheidungen
  - Parallele Job-Koordination

allowed_operations:
  - read_wo_queue
  - dispatch_to_agent
  - set_wo_state
  - trigger_retry
  - escalate_to_human

hard_limits:
  no_code_execution: true
  no_direct_file_changes: true
  no_planning: true
  no_schema_changes: true
```

### pre-review-agent
```yaml
agent_id: pre-review-agent
role: Workorder Validation vor Execution
model_tier: review  # Qwen3.6 Phase 1+2
default_temp: 0.0
seed: 42
thinking: ON

responsibilities:
  - Workorder Vollständigkeit prüfen
  - Negative Constraints vorhanden?
  - Executor korrekt zugewiesen?
  - Scope-Größe realistisch?
  - Freigabe ODER zurück an Claude mit Feedback

output:
  approved: boolean
  issues: string[]
  suggestions: string[]

hard_limits:
  read_only: true
  no_execution: true
  max_wo_size_files: 20
```

### post-review-agent
```yaml
agent_id: post-review-agent
role: Output Validation nach Execution
model_tier: review  # Qwen3.6 Phase 1+2
default_temp: 0.0
seed: 42
thinking: ON

responsibilities:
  - Output gegen Workorder prüfen
  - Negative Constraints eingehalten?
  - Offensichtliche Bugs detektieren
  - Output-Contract erfüllt?
  - Freigabe ODER zurück an Executor

output:
  approved: boolean
  violations: string[]
  bugs: string[]
  quality_score: 0-10

hard_limits:
  read_only: true
  no_execution: true
  max_scope_files: 10
```

### context-builder-agent
```yaml
agent_id: context-builder-agent
role: File Discovery + Symbol Tracing + Context Assembly
model_tier: review  # Phase 1: Qwen3.6
default_temp: 0.0
thinking: ON

responsibilities:
  - Relevante Files für WO identifizieren
  - Symbol-Referenzen tracen via Serena
  - File-Group aus Registry laden
  - Context-Map für Executor aufbauen

output_format: file_list_and_reference_map

tools:
  - serena_find_symbol
  - serena_find_referencing_symbols
  - lightrag_query
  - filesystem_read
  - file_group_registry

hard_limits:
  read_only: true
  output_format: file_list_and_reference_map
```

### security-specialist
```yaml
agent_id: security-specialist
role: Security Review + Guardrail Validation
model_tier: reasoning  # Phase 1: Remote DeepSeek / Phase 2: Spark 3
default_temp: 0.6
thinking: ON

responsibilities:
  - RLS Policies prüfen
  - Auth Flows validieren
  - SQL Injection Risiken identifizieren
  - ENV Handling prüfen
  - Supabase Permission Checks
  - OWASP Top 10 Check

triggers:
  - alle db-migration-agent Outputs
  - alle api-changes
  - auth-flow-changes

output:
  risk_level: low|medium|high|critical
  findings: SecurityFinding[]
  recommendations: string[]

hard_limits:
  read_only: true
  no_code_changes: true
  escalate_on: [critical]
```

---

## Execution Agents

### coding-agent
```yaml
agent_id: coding-agent
role: Primärer Code-Produzent
model_tier: coding  # Qwen3-Coder-Next Phase 1+2
default_temp: 0.0
seed: 42
thinking: OFF
tool_call_parser: qwen3_coder

responsibilities:
  - TypeScript / Hono API Implementation
  - Next.js Frontend Components
  - Bug Fixes + Refactors
  - Feature Implementation nach Workorder

max_parallel_jobs: 20  # Phase 1 / 30 Phase 2

allowed_layers:
  - types
  - service
  - ui
  - tests
  - config

hard_limits:
  max_scope_files: 5
  no_schema_changes: true
  no_migration_changes: true
  no_env_changes: true
  no_auth_changes: true
```

### senior-coding-agent
```yaml
agent_id: senior-coding-agent
role: Komplexe Code-Tasks die coding-agent überfordern
model_tier: intelligence  # Phase 1: Remote MiniMax / Phase 2: Spark 3+4
default_temp: 1.0
thinking: ON
tool_call_parser: minimax_m2

activation: escalation_from_coding_agent

responsibilities:
  - Multi-File Refactors > 5 Files
  - Architektur-kritische Implementierungen
  - Komplexe API Redesigns
  - Recovery von gescheiterten coding-agent Jobs

hard_limits:
  max_scope_files: 15
  no_schema_changes: true
  acceptance_check_required: true
```

### db-migration-agent
```yaml
agent_id: db-migration-agent
role: Schema und Migration Changes
model_tier: review  # Qwen3.6 — braucht höchste Präzision
default_temp: 0.0
seed: 42
thinking: ON

responsibilities:
  - Supabase Migrations schreiben
  - RLS Policies definieren
  - Schema-Änderungen nach Spec
  - Rollback-Strategien dokumentieren

post_execution:
  - security-specialist (mandatory)
  - post-review-agent (mandatory)

hard_limits:
  max_scope_files: 2
  no_destructive_migrations: true
  always_reversible: true
  requires_security_review: true
  requires_human_approval: true
```

---

## Specialist Agents

### test-agent
```yaml
agent_id: test-agent
role: Unit + Integration Test Generation
model_tier: test_review  # Phase 1: Qwen3.6 / Phase 2: GLM-4.7-Flash
default_temp: 0.0
seed: 42
thinking: ON

responsibilities:
  - Unit Tests für neue Functions
  - Integration Tests für API Endpoints
  - Edge Cases identifizieren
  - Test-Coverage sicherstellen

allowed_layers:
  - tests

hard_limits:
  max_scope_files: 5
  no_production_code_changes: true
```

### i18n-agent
```yaml
agent_id: i18n-agent
role: Übersetzungen + i18n String Management
model_tier: sidekick  # Phase 1: Qwen3-Coder / Phase 2: Qwen3.5 9B
default_temp: 0.0
seed: 42
thinking: OFF

responsibilities:
  - i18n Keys übersetzen (DE/EN/TH)
  - Neue Keys zu Locale-Files hinzufügen
  - Konsistenz über alle Sprachen sicherstellen

allowed_layers:
  - config
  - docs

hard_limits:
  max_scope_files: 10
  string_keys_immutable: true
  no_code_changes: true
```

### docs-agent
```yaml
agent_id: docs-agent
role: Dokumentations-Generierung
model_tier: sidekick  # Phase 1: Qwen3-Coder / Phase 2: Qwen3.5 9B
default_temp: 0.0
seed: 42
thinking: OFF

responsibilities:
  - JSDoc für neue Functions
  - API Dokumentation
  - Changelog Einträge
  - README Updates

allowed_layers:
  - docs

hard_limits:
  max_scope_files: 10
  no_code_changes: true
```

### mealcam-agent
```yaml
agent_id: mealcam-agent
role: Food Recognition + Nutrition Data Extraction
model_tier: vision  # RTX 5090 — Qwen3-VL 30B FP8
default_temp: 0.2

responsibilities:
  - Photo → Food Items identifizieren
  - Mengen schätzen
  - Strukturierten JSON Output produzieren
  - Input für Nutrition Pipeline

output_schema:
  foods:
    - name: string
      amount_g: number
      confidence: 0-1
      category: string

hard_limits:
  output_format: json_strict
  no_hallucinated_foods: true
  confidence_threshold: 0.7
```

---

## Escalation Chain

```
coding-agent exhausted / confidence low
  → senior-coding-agent (intelligence tier)
  → post-review-agent (mandatory)
  → Human Review (bei critical failures)

security-specialist findet CRITICAL
  → sofort Human Review
  → kein Auto-Deploy

db-migration-agent
  → security-specialist (mandatory)
  → Human Approval (immer)
```

---

## Remote Escalation Sperren

| Failure Class | Remote Erlaubt | Grund |
|---------------|----------------|-------|
| `technical_transient` | ✅ | Node-Problem, Remote OK |
| `semantic_output` | ✅ | Modell-Problem, besser Remote |
| `scope_violation` | ⚠️ nur review tier | Kein Modell-Problem |
| `technical_persistent` | ❌ Node-Reroute zuerst | — |
| `dependency_invalid` | ❌ | → graph_repair_pending |
| `guardrail_violation` | ❌ | → sofort Human |

---

*Agent Registry V2 — Phase 1 aktiv, Phase 2 ready*
