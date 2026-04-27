# LUMEOS Hook Compatibility Matrix V1
# Claude Code Hooks vs Nemotron Gateway
# Stand: 26. April 2026
# Status: PreToolUse ✅ integriert — PostToolUse/Finalize via dispatcher.ts V1.2.3

---

## MAPPING

| Claude Code Hook | Trigger | Nemotron Äquivalent | Status |
|---|---|---|---|
| PreToolUse | Vor jedem Tool Call | authorizeToolCall() | ✅ via dispatcher.ts |
| PostToolUse | Nach jedem Tool Call | audit.jsonl + state update | ✅ via dispatcher.ts |
| Stop hook | Agent beendet sich | endRun() + auditJobCompleted() | ✅ via dispatcher.ts |
| Subagent spawn | Sub-Agent gestartet | dispatcher.dispatchWorkorder() | ✅ konzeptionell |
| Permission prompt | User muss bestätigen | approval-gate.ts | ✅ via dispatcher.ts |

**Update:** dispatcher.ts V1.2.3 implementiert die komplette Kette —
PreToolUse, PostToolUse, Finalization und Approval Gate sind alle integriert.

---

## ÄQUIVALENZ-BEWERTUNG (aktuell)

| Kriterium | Claude Code | Nemotron | Gleichwertig? |
|---|---|---|---|
| Pre-Execution Gate | ✅ hooks/pre-tool.ps1 | ✅ authorizeToolCall() | Ja |
| Post-Execution Log | ✅ hooks/post-tool.ps1 | ✅ audit-writer.ts | Ja |
| State Update nach Tool | ✅ nativ | ✅ state.addWrittenFile() | Ja |
| Human Approval Gate | ✅ nativ | ✅ approval-gate.ts | Ja |
| Job Finalization | ✅ nativ | ✅ endRun() | Ja |
| Audit Vollständigkeit | ✅ nativ | ✅ 20 Event-Typen | Ja |

---

## IMPLEMENTIERT IN dispatcher.ts V1.2.3

```
Pflicht-Reihenfolge:
  1.  validate workorder schema
  2.  create run_id
  3.  state.startRun()           ← Job Start
  4.  audit job_started
  5.  load agent + routing + skills
  6.  call model (vLLM)
  7.  parse tool request
  8.  audit tool_call_requested
  9.  checkApproval() wenn nötig  ← Permission Prompt Äquivalent
  10. authorizeToolCall()          ← PreToolUse Äquivalent
  11. audit allowed/blocked
  12. executeTool()
  13. state.addWrittenFile()       ← PostToolUse Äquivalent
  14. consumeApproval() NUR bei Erfolg
  15. audit executed/failed
  16. endRun() + updateWOStatus() ← Stop Hook Äquivalent
```

---

## NOCH OFFENE UNTERSCHIEDE (Phase 2)

| Thema | Claude Code | Nemotron | Lücke |
|---|---|---|---|
| Tool Loop (multi-turn) | nativ | Single-turn in V1.2.3 | Multi-turn noch nicht |
| Mode 2 Switch | manuell | mode-controller.ts | noch nicht gebaut |
