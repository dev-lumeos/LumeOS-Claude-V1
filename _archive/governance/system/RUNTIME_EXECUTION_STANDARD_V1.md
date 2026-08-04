# LUMEOS Runtime Execution Standard V1
# Stand: 26. April 2026
# Konzept + Implementierungsreferenz

---

## FIXPUNKT

Claude Code + Tom → Workorder Generierung (immer, kein lokales Modell ersetzt das)

---

## DUAL-MODE SWITCH

```json
// claude_code Modus (Phase 1):
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

// nemotron Modus (Phase 2):
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

## DISPATCHER PFLICHT-REIHENFOLGE (nie ändern)

```
1.  validate workorder schema (ajv gegen workorder.schema.json)
2.  create run_id (RUN-YYYYMMDD-NNNN)
3.  state.startRun()
4.  audit: job_started
5.  load agent (agents.json) + routing (model_routing.json) + skills (skill_registry.json)
6.  call model (vLLM API — injizierbar für Tests)
7.  parse tool request (fenced JSON | plain JSON | inline JSON)
8.  audit: tool_call_requested
9.  approval gate (wenn nötig — approval_operation_types.json)
10. authorizeToolCall() (permissions.json + tool_profiles.json + micromatch)
11. audit: tool_call_allowed | tool_call_blocked
12. executeTool()
13. NUR bei Erfolg: state.addWrittenFile() + consumeApproval()
14. audit: tool_call_executed | tool_call_failed
15. finalizeRun() + updateWorkorderStatus()
```

---

## DATEIEN IM REPO

```
system/
├── agent-registry/
│   ├── agents.json                    ← Agent Registry
│   ├── permissions.json               ← Toolrechte pro Agent
│   ├── model_routing.json             ← Node + Modell pro Agent
│   ├── tool_profiles.json             ← Basis-Profile nach Agent-Typ
│   ├── skill_registry.json            ← 26 Skills (runtime/domain/pipeline)
│   ├── approval_operation_types.json  ← Risky Operations + Constraints
│   └── authorize-tool-call.ts         ← Permission Gateway V0.2.1
├── state/
│   ├── state-manager.ts               ← File Lock, Atomic Write, Run/WO/Lock
│   ├── audit-writer.ts                ← JSONL Audit Log
│   ├── runtime_state.schema.json      ← State Schema
│   └── shared_event.schema.json       ← Audit Event Schema
├── approval/
│   ├── approval-gate.ts               ← checkApproval() / consumeApproval()
│   └── approval.schema.json           ← Token Schema
├── control-plane/
│   ├── dispatcher.ts                  ← Execution Engine V1.2.3
│   ├── skill-loader.ts                ← Deterministisches Skill Loading
│   └── __tests__/
│       └── smoke-test.ts              ← 9 Tests incl. E2E mit Mock-Modell
└── workorders/schemas/
    └── workorder.schema.json          ← WO Schema (required/optional_skills)
```

---

## INTEGRATION IN SCHEDULER (Phase 2 — nach grünem Smoke Test)

```typescript
// services/scheduler-api/src/dispatch-loop.ts
// ALT:
await this.config.onDispatch(wo, targetNode)

// NEU:
import { dispatchWorkorder, defaultExecuteTool } from '../../system/control-plane/dispatcher'
import { createVllmAdapter } from './vllm-adapter'

await dispatchWorkorder(wo, {
  callModel: createVllmAdapter(targetNode),
  executeTool: defaultExecuteTool
})
```

---

## SMOKE TEST

```bash
cd D:\GitHub\LumeOS-Claude-V1

# Dependencies installieren (einmalig)
pnpm add -D ajv micromatch @types/micromatch tsx

# Test ausführen
npx tsx system/control-plane/__tests__/smoke-test.ts
```

---

## NEXT STEPS NACH GRÜNEM SMOKE TEST

1. Claude Code Workorder für dispatch-loop.ts Integration erstellen
2. vllm-adapter.ts schreiben (adapts bestehende VLLMClient an Dispatcher DispatcherDeps interface)
3. End-to-End Test mit echtem Spark B
4. .claude/agents/*.md nach V4.1 Standard updaten (Frontmatter + runtime_compat)
