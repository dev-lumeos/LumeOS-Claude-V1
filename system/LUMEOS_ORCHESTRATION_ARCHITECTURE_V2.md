# LUMEOS Orchestration Architecture V2
# Stand: 26. April 2026
# Status: IMPLEMENTIERT — Runtime 90% integriert, 9/9 Smoke Tests grün

---

## FIXPUNKT — NICHT VERHANDELBAR

```
Claude Code + Tom → Workorder Generierung (immer)
```

Kein lokales Modell ersetzt das. Workorder-Generierung erfordert
Architekturverständnis, korrektes Scope-Cutting und präzise Atomic Task Definition.

---

## KERNPRINZIPIEN

```
1. Ein aktiver Orchestrator       — kein Mischbetrieb
2. Ein canonical state            — kein paralleler Runtime-State
3. Ein Dispatch Flow              — kein doppelter Dispatch
4. Gleicher Execution Contract    — beide Modi, gleicher Output
5. Gemeinsame Governance-Schicht  — Approval + Audit in beiden Modi
```

---

## DER SWITCH — RUNTIME PROFIL

```json
// Claude Code Modus (Phase 1 — aktiv):
{
  "orchestration": {
    "mode": "claude_code",
    "orchestrator_backend": "claude_code",
    "canonical_state": "system/state/runtime_state.json",
    "tool_enforcement": "claude_hooks",
    "agent_backend": "claude_subagents",
    "skill_backend": "claude_native",
    "approval_backend": "shared",
    "audit_backend": "shared"
  }
}

// Nemotron Modus (Phase 2 — nach Benchmark):
{
  "orchestration": {
    "mode": "nemotron",
    "orchestrator_backend": "nemotron",
    "canonical_state": "system/state/runtime_state.json",
    "tool_enforcement": "authorize_tool_call",
    "agent_backend": "vllm_api",
    "skill_backend": "explicit_skill_injection",
    "approval_backend": "shared",
    "audit_backend": "shared"
  }
}
```

---

## .claude/agents/*.md — DUAL-USE

```
Claude Code Modus:   Claude Code spawnt Sub-Agenten nativ
Nemotron Modus:      Nemotron liest als System-Prompt Template
```

### Erforderliches Frontmatter (V4.1 Standard)

```yaml
---
agent_id: micro-executor
runtime_compat:
  claude_code: true
  nemotron: true
prompt_template: true
requires_registry_permissions: true
---
```

Regel:
- MD-Datei = Verhalten / Rolle / Output Contract
- JSON Registry = Rechte / Routing / Enforcement

---

## IMPLEMENTIERTER STACK (Stand 26. April 2026)

```
system/agent-registry/
  agents.json ✅ permissions.json ✅ model_routing.json ✅
  tool_profiles.json ✅ skill_registry.json ✅
  approval_operation_types.json ✅ authorize-tool-call.ts ✅ V0.2.1

system/state/
  state-manager.ts ✅ audit-writer.ts ✅
  runtime_state.schema.json ✅ shared_event.schema.json ✅

system/approval/
  approval-gate.ts ✅ approval.schema.json ✅

system/control-plane/
  dispatcher.ts ✅ V1.2.3  skill-loader.ts ✅
  __tests__/smoke-test.ts ✅ (9/9 grün)

services/scheduler-api/src/
  vllm-adapter.ts ✅  wo-adapter.ts ✅
  index.ts ✅ (dispatchLoop aktiv, onDispatch → dispatchWorkorder())
```

---

## SWITCH-BENCHMARK (vor Nemotron-Wechsel)

| Test | Zielwert |
|---|---|
| Gateway Test Suite | 100% pass |
| Unauthorized Tool Calls | 0 erlaubt |
| Bash/ENV/PathTraversal geblockt | 100% |
| 20 parallele Dummy-Jobs | ohne State-Kollision |
| 50-Turn WO-State | keine verlorenen Locks |
| Mode Switch drain→lock→activate | fehlerfrei |
| Approval Gate DB/Migration | blockiert ohne Token |
| Audit Completeness | 100% Tool Calls geloggt |
| WO Dispatch Accuracy | ≥95% richtiger Agent |
| Gleicher WO → schema-kompatibler Output | beide Modi |

---

## BEGLEITDOKUMENTE

| Dokument | Status |
|---|---|
| RUNTIME_EXECUTION_STANDARD_V1.md | ✅ implementiert |
| HOOK_COMPATIBILITY_MATRIX_V1.md | ✅ dokumentiert |
| SKILL_RESOLUTION_STANDARD_V1.md | ✅ dokumentiert |
| AGENT_SKILL_STANDARD_V4.1_FINAL.md | ✅ standard definiert |
| PERMISSION_GATEWAY_ROADMAP_V03.md | ✅ V0.3 geplant |
