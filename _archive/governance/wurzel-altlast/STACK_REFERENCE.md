# LUMEOS — Stack & Architecture Reference
# Stand: April 2026 | Phase 2 AKTIV

---

## Hardware

| Node | IP | Port | Modell | Rolle | tok/s |
|---|---|---|---|---|---|
| Spark 1 (A) | 192.168.0.128 | 8001 | Qwen3.6-35B-A3B FP8 | Orchestrator + Review | ~52 single / 107 parallel |
| Spark 2 (B) | 192.168.0.188 | 8001 | Qwen3-Coder-Next FP8 | Coding Worker | ~47 |
| Spark 3 (C) | 192.168.0.99 | 8001 | Gemma 4 FP8 | Fast Reviewer | TBD |
| Spark 4 (D) | 192.168.0.101 | 8001 | GPT-OSS FP8 | Senior Reviewer | TBD |
| RTX 5090 | localhost | 8001 | Qwen3-VL 30B FP8 | MealCam Vision | TBD |
| Escalation | — | — | Claude Sonnet/Opus (Max 200) | Senior Coding | — |

---

## Agent Routing

| Agent | Node | Modell | Zweck |
|---|---|---|---|
| orchestrator-agent | spark-a | qwen3.6-35b-fp8 | Dispatch + Monitor |
| pre-review-agent | spark-a | qwen3.6-35b-fp8 | Vollständigkeit prüfen |
| post-review-agent | spark-a | qwen3.6-35b-fp8 | Output validieren |
| review-agent | spark-a | qwen3.6-35b-fp8 | Validation |
| governance-compiler | spark-a | qwen3.6-35b-fp8 | Governance |
| security-specialist | spark-a | qwen3.6-35b-fp8 | Security Audits |
| db-migration-agent | spark-a | qwen3.6-35b-fp8 | Schema Changes |
| micro-executor | spark-b | qwen3-coder-next-fp8 | TypeScript Patches |
| test-agent | spark-b | qwen3-coder-next-fp8 | Tests |
| fast-reviewer-agent | spark-c | gemma-4-fp8 | Fast Review (non-blocking) |
| senior-reviewer-agent | spark-d | gpt-oss-fp8 | Senior Review (blocking bei High-Risk) |
| senior-coding-agent | claude_code | claude-opus-4-5 | Escalation only |

---

## Qwen3.6 Pflichtregeln

**JEDER Request muss enthalten:**
```json
{
  "chat_template_kwargs": { "enable_thinking": false },
  "temperature": 0.0
}
```
- `/no_think` funktioniert NICHT
- Nur `message.content` auswerten — `reasoning_content` ignorieren
- Leerer Content → FAIL

---

## Risk-Kategorien (Single Source of Truth: risk-categories.ts)

| Kategorie | Spark D | Auto-Retry | Human Approval |
|---|---|---|---|
| standard / docs / i18n / test | ✗ | ✓ | ✗ |
| db-migration | ✓ | ✗ | ✓ |
| security / auth / rls | ✓ | ✗ | ✗ |
| medical / payments | ✓ | ✗ | ✓ |
| shared-core / architecture / release | ✓ | ✗ | ✓ |

**Explizites `risk_category` im WO hat immer Vorrang vor Task-Inferenz.**

---

## Governance Validator

Datei: `system/control-plane/governance-validator.ts`

### Erlaubte Enums
- **selected_agent:** micro-executor | db-migration-agent | security-specialist | review-agent
- **risk_level:** low | medium | high
- **gates:** db-migration-gate | rollback-gate | typecheck-gate | test-gate | review-gate | human-approval-gate | files-scope-gate | security-gate

### Stop-Conditions Regel
NIEMALS positive Zustände: `approved`, `passed`, `granted`, `success`, `completed`
Stop-Conditions müssen negativ/blockierend sein: `*_failed`, `*_missing`, `*_violation`

---

## Dispatcher Flow (aktuell)

```
Workorder
  → isSystemStopped()             ← C.1 Kill-Switch (vor allem)
  → validateWorkorder() Schema
  → runPreflight() GO/HOLD/REJECT ← D.2 (11 Checks)
  → acquireScopeLock()            ← A.3
  → acquireDbMigrationLock()      ← A.3 (bei db-migration)
  → startRun() + auditJobStarted()
  → loadAgent() + loadSkills()
  → callModel() [Qwen3.6, enable_thinking=false]
  → parseOrchestratorIntent()
  → validateOrchestratorIntent()  ← Governance Validator
      PASS     → weiter
      REWRITE  → max 2x neu an Qwen3.6
      FAIL     → sofort stoppen
      BLOCKED  → sofort stoppen (kein Rewrite)
  → parseToolRequest()
  → approvalGate()
  → authorizeToolCall()           ← Gateway v0.3.0 (files_blocked check)
  → executeTool()
  → isPathInScope() Post-Check    ← A.2 Defense in Depth
  → runReviewPipeline()           ← Spark C + D
  → addWrittenFile()
  → releaseScopeLock()            ← A.3
  → releaseDbMigrationLock()      ← A.3
  → auditLog + finalizeRun()
```

---

## WO-State-Machine (D.1)

```
queued            → [dispatched]
dispatched        → [running, done, failed, review, awaiting_approval]
running           → [done, failed, review, awaiting_approval]
review            → [dispatched, failed]
awaiting_approval → [dispatched, failed]
done              → []  ← terminal
failed            → []  ← terminal
```

Illegale Übergänge: blockiert + `audit.error.jsonl` Event.

---

## Scheduler Preflight (D.2) — 11 Checks

| Check | Verdict bei Fail |
|---|---|
| system_not_stopped | HOLD |
| schema_valid | REJECT |
| agent_exists | REJECT |
| scope_files_not_empty | REJECT |
| rollback_hint_required | REJECT |
| wo_not_terminal | REJECT |
| wo_not_running | HOLD |
| wo_not_awaiting_approval | HOLD |
| blocked_by_resolved | HOLD |
| scope_lock_free | HOLD |
| db_migration_lock_free | HOLD |

Priorität: REJECT > HOLD > GO

---

## System Stop (C.1)

```typescript
// Aktivieren
await triggerSystemStop('Grund', 'human')

// Prüfen (sync)
const s = isSystemStopped()  // { stopped: false } | { stopped: true, reason, stopped_at }

// Aufheben
await clearSystemStop()
```

Wenn aktiv: Dispatcher gibt sofort `{ status: 'blocked', run_id: 'SYSTEM_STOP' }` zurück.

---

## Services (Threadripper lokal)

| Service | Port | Zweck |
|---|---|---|
| WO-Classifier | 9000 | Deterministischer Pre-Router |
| SAT-Check | 9001 | Pre-Execution Gate |
| Scheduler | 9002 | WO Queue + Spark-Dispatch |
| Governance Compiler | 9003 | Macro-WO → GovernanceArtefakt |
| LightRAG | 9004 | Codebase Knowledge Graph |

---

## Offene TODOs (Phase 4/5)

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
