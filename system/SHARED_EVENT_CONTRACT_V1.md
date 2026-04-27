# LUMEOS Shared Event Contract V1
# Gemeinsames Audit-Event Format für beide Orchestrator-Modi
# Stand: 26. April 2026
# Status: VOLLSTÄNDIG IMPLEMENTIERT — beide Modi schreiben ins audit.jsonl

---

## ZWECK

Claude Code Hooks und Nemotron Gateway schreiben dasselbe Audit-Format.
Beide landen in: system/state/audit.jsonl (append-only, in .gitignore)

---

## IMPLEMENTIERUNGSSTATUS

| Modus | Implementierung | Status |
|---|---|---|
| Nemotron | `system/state/audit-writer.ts` | ✅ alle 20 Event-Typen |
| Claude Code | `.claude/hooks/post-tool.ps1` | ✅ tool_call_executed/failed |
| Schema | `system/state/shared_event.schema.json` | ✅ |

**Hinweis Claude Code Mode:** Schreibt nur `tool_call_executed` und `tool_call_failed`
(post-tool.ps1 läuft nach Write/Edit/MultiEdit). Job-Lifecycle Events
(job_started, job_completed etc.) fehlen im Claude Code Mode — werden erst
mit vollständiger Hook-Äquivalenz ergänzt.

---

## EVENT TYPEN (20 Types)

```
tool_call_requested      → Tool Call wurde angefragt
tool_call_allowed        → Tool Call wurde erlaubt
tool_call_blocked        → Tool Call wurde blockiert
tool_call_executed       → Tool Call wurde ausgeführt      ← Claude Code ✅
tool_call_failed         → Tool Call ist fehlgeschlagen    ← Claude Code ✅

job_started              → Workorder-Execution gestartet
job_completed            → Workorder-Execution abgeschlossen
job_failed               → Workorder-Execution fehlgeschlagen
job_blocked              → Workorder blockiert (Approval, Scope)

approval_required        → Human Approval angefordert
approval_granted         → Human Approval erteilt
approval_denied          → Human Approval verweigert
approval_expired         → Approval Token abgelaufen

mode_switch_started      → Spark Mode Switch initiiert
mode_switch_completed    → Spark Mode Switch abgeschlossen
mode_switch_failed       → Spark Mode Switch fehlgeschlagen

lock_acquired            → Spark Node gelockt
lock_released            → Spark Node freigegeben

orchestrator_started     → Orchestrator-Mode aktiviert
orchestrator_switched    → Orchestrator-Mode gewechselt
```

---

## EVENT SCHEMA

```typescript
interface AuditEvent {
  ts:                  string          // ISO 8601
  event:               EventType
  orchestration_mode:  'claude_code' | 'nemotron'
  severity?:           'info' | 'warning' | 'error' | 'critical'
  agent_id?:           string          // aus LUMEOS_AGENT_ID env
  workorder_id?:       string          // aus LUMEOS_WORKORDER_ID env
  run_id?:             string          // aus LUMEOS_RUN_ID env
  correlation_id?:     string
  tool?:               'read' | 'write' | 'bash' | 'mcp'
  target_path?:        string
  command?:            string
  mcp_tool?:           string
  allowed?:            boolean
  blocked_by?:         string
  reason?:             string
  error_code?:         string
  approval_id?:        string
  approved_by?:        string
  from_mode?:          string
  to_mode?:            string
  spark_node?:         string
  duration_ms?:        number
}
```

---

## BEISPIEL AUDIT ENTRIES

```jsonl
{"ts":"2026-04-26T10:00:00Z","event":"tool_call_executed","orchestration_mode":"claude_code","severity":"info","tool":"write","target_path":"services/nutrition-api/src/routes/diary.ts","allowed":true}
{"ts":"2026-04-26T10:01:00Z","event":"tool_call_executed","orchestration_mode":"nemotron","severity":"info","run_id":"RUN-20260426-0001","workorder_id":"WO-nutrition-001","agent_id":"micro-executor","tool":"write","target_path":"services/nutrition-api/src/routes/diary.ts","allowed":true}
```

---

## OPTIONALE ENV-VARIABLEN (Claude Code Mode)

Wenn gesetzt, werden diese Felder im audit.jsonl ergänzt:
```powershell
$env:LUMEOS_WORKORDER_ID = 'WO-nutrition-001'
$env:LUMEOS_AGENT_ID     = 'micro-executor'
$env:LUMEOS_RUN_ID       = 'RUN-20260426-0001'
```
