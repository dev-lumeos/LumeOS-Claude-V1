# LUMEOS — Session Onboarding
# Lies das am Anfang jeder neuen Session

---

## Aktueller Stack (Phase 2 AKTIV)

| Was | Wo | Status |
|---|---|---|
| Qwen3.6-35B FP8 | 192.168.0.128:8001 | ✅ Orchestrator |
| Qwen3-Coder-Next FP8 | 192.168.0.188:8001 | ✅ Coding Worker |
| Gemma 4 FP8 | 192.168.0.99:8001 | ✅ Spark C (Fast Reviewer) |
| GPT-OSS FP8 | 192.168.0.101:8001 | ✅ Spark D (Senior Reviewer) |
| Governance Validator | system/control-plane/governance-validator.ts | ✅ aktiv |
| Dispatcher | system/control-plane/dispatcher.ts | ✅ REWRITE_LOOP max 2 |
| Review Pipeline V2 | system/control-plane/review-pipeline.ts | ✅ Auto-Retry, Metriken |
| Risk Categories | system/control-plane/risk-categories.ts | ✅ Single Source of Truth |
| Scheduler Preflight | system/control-plane/scheduler-preflight.ts | ✅ GO/HOLD/REJECT |
| WO-State-Machine | system/state/state-manager.ts | ✅ D.1 formal |
| Scope-Locks | system/state/state-manager.ts | ✅ A.3 aktiv |
| System Stop | system/state/state-manager.ts | ✅ C.1 Kill-Switch |
| Files Enforcement | system/agent-registry/authorize-tool-call.ts | ✅ v0.3.0 |
| Run Summary | system/reports/run-summary-generator.ts | ✅ B.1 aktiv |
| tsc --noEmit | services/scheduler-api | ✅ 0 Fehler |

---

## Letzter Commit

```
9532a59  feat(governance): C.1 — Kill-Switch / System Stop
e4f2712  feat(governance): D.2 — Scheduler Preflight GO/HOLD/REJECT
fff067a  feat(governance): D.1 — WO-State-Machine formal definiert
d3d3d28  feat(governance): A.3 — Module-/File-Locks
1e81e2b  feat(reports): B.1 — Run Summary Generator
621d930  feat(governance): A.2 — FILES_BLOCKED Enforcement
57528c2  feat(governance): A.1 + A.4 — WO-Schema + Risk-Categories
```

---

## Test-Stand (aktuell)

```
13/13  Stop-Tests         (system/state/__tests__/stop-rules.test.ts)
19/19  Preflight-Tests    (system/control-plane/__tests__/scheduler-preflight.test.ts)
30/30  State-Machine      (system/state/__tests__/wo-state-machine.test.ts)
16/16  Lock-Tests         (system/state/__tests__/scope-locks.test.ts)
22/22  Gateway-Tests      (system/agent-registry/__tests__/gateway.test.ts)
22/22  Pipeline-Tests     (system/control-plane/__tests__/review-pipeline.test.ts)
 6/6   V2-Verify          (system/control-plane/__tests__/dispatcher-v2-verify.ts)
tsc:   0 Fehler
```

---

## Was in dieser Session implementiert wurde

### Abgeschlossen ✅
- **A.1** Workorder-Schema finalisiert (risk_category, files_blocked, rollback_hint, validation_commands)
- **A.4** High-Risk-Matrix zentralisiert (risk-categories.ts, 13 Kategorien)
- **A.2** FILES_BLOCKED + Post-Execution Scope Enforcement
- **B.1** Run Summary Generator (JSON + Markdown, next_action Logik)
- **A.3** Module-/File-Locks (Scope-Lock + DB-Migration-Lock, TTL 10min)
- **D.1** WO-State-Machine (WO_TRANSITIONS, validateWoStatusTransition, enforcement)
- **D.2** Scheduler Preflight (11 Checks, GO/HOLD/REJECT)
- **C.1** Kill-Switch / System Stop (triggerSystemStop, clearSystemStop, isSystemStopped)

---

## Wichtigste Entscheidungen

1. **risk-categories.ts ist Single Source of Truth** — governance-validator.ts UND dispatcher.ts importieren daraus, niemals duplizieren
2. **enable_thinking=false ist Pflicht** bei jedem Qwen3.6 Request
3. **Stop-Conditions dürfen keine positiven Zustände enthalten** (approved/passed/granted)
4. **Governance Validator vor executeTool()** — deterministisch, kein LLM
5. **Preflight läuft vor startRun()** — kein Run startet bei HOLD/REJECT
6. **System Stop vor Preflight** — globale Notbremse, alle Runs blockiert
7. **WO-Status done/failed sind terminal** — keine Übergänge möglich
8. **Scope-Lock atomar** — Konflikt-Check + Setzen in einer Mutex-Operation
9. **Escalation = Claude Sonnet/Opus via Claude Code Max 200** — kein OpenRouter

---

## Nächste Blöcke (Phase 4/5)

```
C.2  Approval Queue formalisieren       ← NÄCHSTER
B.3  Failed WO Report
B.2  Morning Report
C.3  Night-Run-Policy V1
B.4  Model Quality Report
E.1  Completed WO Dossier
E.2  Docs-Governance
F.   Spark Runtime Hardening (Phase 6, später separat)
```

---

## Relevante Dateien

```
system/control-plane/dispatcher.ts           — Haupt-Dispatcher
system/control-plane/governance-validator.ts — Validator
system/control-plane/risk-categories.ts      — Risk-Matrix (Single Source of Truth)
system/control-plane/scheduler-preflight.ts  — D.2 Preflight
system/control-plane/review-pipeline.ts      — Review Pipeline V2
system/state/state-manager.ts               — V1.4.0 (Locks, Stop, State-Machine)
system/state/audit-writer.ts                — Alle Audit-Events
system/agent-registry/authorize-tool-call.ts — Permission Gateway v0.3.0
system/reports/run-summary-generator.ts     — B.1 Run Summary
services/scheduler-api/src/vllm-adapter.ts  — callModel() mit enable_thinking
system/agent-registry/model_routing.json    — Agent → Node Mapping
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
**Neue Pflichtfelder (A.1):** risk_category, rollback_hint (bei db-migration)

---

## Was Claude Desktop hier tut

- Architektur-Partner für Tom
- Workorder-Generierung (XML Format)
- Stack-Entscheidungen dokumentieren
- Kein direkter Zugriff auf laufende Services
- Kein Deployment, kein State-Change
