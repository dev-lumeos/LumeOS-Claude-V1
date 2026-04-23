# Agent Registry V1

---

## Model Tiers

### Lokal (DGX Spark)

| Tier | Modell | Node |
|------|--------|------|
| `fp8_bulk` | Qwen3.6-35B-A3B FP8 | Spark A |
| `fp4_light` | Gemma 4 4B / Phi-4 Mini NVFP4 | Spark A |
| `quality` | Qwen3.5-122B-A10B NVFP4 | Spark B (Orchestrator) |
| `review` | DeepSeek-R1 8B distill NVFP4 | Spark B |

> fp8_bulk → fp4_bulk sobald NVFP4-Quant für Qwen3.6 verfügbar

### Remote (OpenRouter API only)

| Tier | Modell |
|------|--------|
| `escalation_1` | Claude Code Opus (primary) |
| `escalation_2` | Qwen3.6-Plus |
| `escalation_3` | MiniMax M2.5 |
| `escalation_4` | Gemini 3.1 Pro |
| `escalation_5` | Claude Opus 4.6 (Last Resort) |
| `macro_executor` | Kimi K2.6 |

---

## Escalation Chain

```
quality exhausted
  → Claude Code Opus (primary escalation)
  → Qwen3.6-Plus
  → MiniMax M2.5
  → Gemini 3.1 Pro
  → Claude Opus 4.6
  → Human Review (zwingend)
```

### Remote Escalation Sperren

| Failure Class | Remote | Grund |
|---------------|--------|-------|
| `technical_transient` | ✅ nur wenn nicht node-spezifisch | — |
| `semantic_output` | ✅ | — |
| `scope_violation` | ⚠️ nur quality tier | Kein Modell-Problem |
| `technical_persistent` | ❌ Node-Reroute zuerst | — |
| `dependency_invalid` | ❌ | → graph_repair_pending |
| `guardrail_violation` | ❌ | → sofort Human |

---

## Brain Agents (Claude Code — extern)

### claude_planner / spec-analyst
```yaml
agent_id: spec-analyst
role: chat → rawdata → spec → decomposition_spec
execution: external (Claude Code)
scheduler_controlled: false
node: null
model_tier: null
```

### wo-writer
```yaml
agent_id: wo-writer
role: decomposition_spec → workorders (LLM Stage)
execution: external (Claude Code)
scheduler_controlled: false
node: null
```

---

## System Agents (Deterministik)

### orchestrator
```yaml
agent_id: orchestrator
role: graph validation, retry decisions, failure classification
allowed_layers: [meta, graph, scheduling, retry]
allowed_wo_types: [GRAPH_VALIDATE, RETRY_DECISION, FAILURE_CLASSIFY]
default_model_tier: quality
hard_limits:
  no_code_execution: true
  no_direct_file_changes: true
  no_planning: true
```

### review-agent
```yaml
agent_id: review-agent
role: validate WO output against acceptance criteria
default_model_tier: review
escalation_model_tier: quality
hard_limits:
  read_only: true
  max_scope_files: 10
```

### context-builder-agent
```yaml
agent_id: context-builder-agent
role: discovery, file location, symbol tracing
default_model_tier: review
hard_limits:
  read_only: true
  output_format: file_list_and_reference_map
```

### security-specialist
```yaml
agent_id: security-specialist
role: security review, guardrail validation, policy enforcement
default_model_tier: quality
escalation_model_tier: escalation_1
hard_limits:
  read_only: true
  no_code_changes: true
```

---

## Daily Worker Agents (Spark A)

### ts-patch-agent
```yaml
agent_id: ts-patch-agent
role: TypeScript patches, refactors
allowed_layers: [types, service]
default_model_tier: fp8_bulk
escalation_model_tier: quality
hard_limits: {max_scope_files: 3, no_schema_changes: true}
```

### api-mapping-agent
```yaml
agent_id: api-mapping-agent
role: API response field mapping
allowed_layers: [service]
default_model_tier: fp8_bulk
hard_limits: {max_scope_files: 3, no_new_endpoints: true}
```

### ui-restore-agent
```yaml
agent_id: ui-restore-agent
role: UI component restore and binding
allowed_layers: [ui]
default_model_tier: fp8_bulk
hard_limits: {max_scope_files: 3, no_layout_redesign: true}
```

### db-migration-agent
```yaml
agent_id: db-migration-agent
role: schema and migration changes
allowed_layers: [db]
default_model_tier: quality
hard_limits: {max_scope_files: 2, no_destructive_migrations: true}
```

### test-agent
```yaml
agent_id: test-agent
role: unit and integration test generation
allowed_layers: [tests]
default_model_tier: fp8_bulk
hard_limits: {max_scope_files: 3, no_production_code_changes: true}
```

### i18n-agent
```yaml
agent_id: i18n-agent
role: translation and i18n string management
allowed_layers: [config, docs]
default_model_tier: fp4_light
hard_limits:
  max_scope_files: 5  # Ausnahme: low-risk text domain
  string_keys_immutable: true
```

### docs-agent
```yaml
agent_id: docs-agent
role: documentation generation
allowed_layers: [docs]
default_model_tier: fp4_light
hard_limits:
  max_scope_files: 5  # Ausnahme: low-risk text domain
  no_code_changes: true
```

---

## Macro Executor

### kimi-k26-executor
```yaml
agent_id: kimi-k26-executor
role: macro WO execution via agent swarm
execution: remote (OpenRouter API)
model_tier: macro_executor
scheduler_controlled: true
accepts_macro_wo: true
hard_limits:
  acceptance_check_required: true   # Review Agent Pflicht nach Execution
  no_scheduler_interference: true
```

---

*Agent Registry V1 — festgezogen*
