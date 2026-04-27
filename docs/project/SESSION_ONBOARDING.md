# LUMEOS — Session Onboarding
# Lies das am Anfang jeder neuen Session

---

## Aktueller Stack (Phase 1)

| Was | Wo | Status |
|---|---|---|
| Qwen3.6-35B FP8 | 192.168.0.128:8001 | ✅ Orchestrator |
| Qwen3-Coder-Next FP8 | 192.168.0.188:8001 | ✅ Coding Worker |
| Governance Validator | system/control-plane/governance-validator.ts | ✅ aktiv |
| Dispatcher | system/control-plane/dispatcher.ts | ✅ REWRITE_LOOP max 2 |
| tsc --noEmit | services/scheduler-api | ✅ 0 Fehler |

---

## Wichtigste Entscheidungen dieser Session

1. **Nemotron Super ist zu groß für Spark 1 zusammen mit anderen Modellen** — 69.54 GiB Weights allein
2. **Qwen3.6-35B ist der Orchestrator** — nicht Nemotron (falscher Use-Case für Orchestration)
3. **enable_thinking=false ist Pflicht** bei jedem Qwen3.6 Request — /no_think funktioniert nicht
4. **Governance Validator vor executeTool()** — deterministische Validierung, kein LLM
5. **Stop-Conditions dürfen keine positiven Zustände enthalten** (approved/passed/granted)
6. **Escalation = Claude Sonnet/Opus via Claude Code Max 200** — kein OpenRouter, kein MiniMax

---

## Was Claude Desktop hier tut

- Architektur-Partner für Tom
- Workorder-Generierung (XML Format)
- Stack-Entscheidungen dokumentieren
- Kein direkter Zugriff auf laufende Services
- Kein Deployment, kein State-Change

---

## Relevante Dateien

```
system/control-plane/dispatcher.ts           — Haupt-Dispatcher
system/control-plane/governance-validator.ts — Validator (NEU)
services/scheduler-api/src/vllm-adapter.ts   — callModel() mit enable_thinking
system/agent-registry/model_routing.json     — Agent → Node Mapping
docs/project/STACK_REFERENCE.md              — Hardware + Routing Referenz
```

---

## Workorder Format

```xml
<task>
  <analyze>Was verstehe ich aus dem Task?</analyze>
  <implement>Was muss ich konkret tun?</implement>
  <constraints>
    <negative_constraints>["NIEMALS X", "NIEMALS Y"]</negative_constraints>
  </constraints>
  <on_error>{"status": "FAIL", "reason": "..."}</on_error>
</task>
```

**Pflichtfelder:** agent_id, scope_files, acceptance_criteria, negative_constraints (min 4)
