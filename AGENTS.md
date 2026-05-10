# Agent Instructions

<!-- lean-ctx -->
## lean-ctx

Prefer lean-ctx MCP tools over native equivalents for token savings.
Full rules: @LEAN-CTX.md
<!-- /lean-ctx -->

---

## Agent Registry — Stand April 2026

Source of Truth: `system/agent-registry/agents.json` + `system/agent-registry/model_routing.json`

### Execution Agents

| Agent | Node | Modell | Typ | Human Approval | Zweck |
|---|---|---|---|---|---|
| `micro-executor` | Spark B | qwen3-coder-next-fp8 | executor | nein | TypeScript Patches, max 3 Files |
| `senior-coding-agent` | Codex CLI | gpt-5.5 | executor_senior | nein | Komplexe Multi-File Tasks, Eskalation |
| `db-migration-agent` | Spark A | qwen3.6-35b-fp8 | db_specialist | **ja** | Supabase Migrations + RLS Policies |
| `test-agent` | Spark B | qwen3-coder-next-fp8 | executor | nein | Unit- und Integration-Tests |
| `i18n-agent` | Spark B | qwen3-coder-next-fp8 | executor | nein | DE/EN/TH Locale Files |
| `docs-agent` | Spark B | qwen3-coder-next-fp8 | executor | nein | JSDoc, API Docs, README |
| `mealcam-agent` | RTX 5090 | qwen3-vl-30b-a3b-fp8 | vision | nein | Food Recognition, JSON Output only |

### Orchestration + Review Agents

| Agent | Node | Modell | Typ | Zweck |
|---|---|---|---|---|
| `orchestrator-agent` | Spark A | qwen3.6-35b-fp8 | orchestrator | Dispatch, Monitoring, Coordination |
| `review-agent` | Spark A | qwen3.6-35b-fp8 | reviewer | Pre/Post-Review WOs + Outputs |
| `pre-review-agent` | Spark A | qwen3.6-35b-fp8 | reviewer | Vollständigkeit prüfen vor Dispatch |
| `post-review-agent` | Spark A | qwen3.6-35b-fp8 | reviewer | Output validieren nach Execution |
| `governance-compiler` | Spark A | qwen3.6-35b-fp8 | governance | Macro-WO → GovernanceArtefaktV3 |
| `context-builder` | Spark A | qwen3.6-35b-fp8 | context | File Discovery, Symbol Tracing |
| `security-specialist` | Spark A | qwen3.6-35b-fp8 | reviewer | Security Review: RLS, Auth, SQL |

### Review Pipeline Tiers (Phase 2)

| Tier | Node | Modell | Rolle | Eskalation bei |
|---|---|---|---|---|
| `fast-reviewer-agent` | Spark C | gemma-4-26B-A4B-it | Tier 1 Fast Review | ESCALATE / low confidence / invalid_json / rewrite limit |
| `senior-reviewer-agent` | Codex CLI | gpt-5.5 | Tier 2 Senior Review | Final repo-aware senior review |

### Hardware-Mapping

| Node | IP | Port | Modell |
|---|---|---|---|
| Spark A | 192.168.0.128 | 8001 | Qwen3.6-35B-A3B FP8 |
| Spark B | 192.168.0.188 | 8001 | Qwen3-Coder-Next FP8 |
| Spark C | 192.168.0.99 | 8001 | Gemma-4-26B-A4B-it FP8 |
| Spark D / DGX4 | 192.168.0.101 | 8001 | Disabled for productive governance; future DGX4/DGX5 MiniMax lab |
| RTX 5090 | localhost | 8001 | Qwen3-VL-30B FP8 |
| Codex CLI | — | — | GPT-5.5 (produktive Senior-Engineering-Instanz) |

### Qwen3.6 Pflichtregeln

```
enable_thinking: false  (MUSS bei jedem Request — /no_think funktioniert NICHT)
temperature: 0.0
Output: reines JSON — kein Reasoning sichtbar
```

### Eskalations-Kette

```
micro-executor → (2x failed review) → senior-coding-agent (Codex/GPT-5.5)
fast-reviewer-agent → (ESCALATE) → senior-reviewer-agent (Codex/GPT-5.5)
DGX4/Spark D → lab-only, not required for normal governance/operator runtime checks
```

### Pflicht-Verkettungen

```
db-migration-agent → MUSS danach: security-specialist
```
