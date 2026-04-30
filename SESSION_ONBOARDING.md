# LUMEOS — Session Onboarding
# Stand: April 2026 | Lies das am Anfang jeder neuen Session

---

## Aktueller Stack (Phase 2 LIVE — alle 4 Sparks aktiv)

| Was | Wo | Status |
|---|---|---|
| Qwen3.6-35B FP8 | 192.168.0.128:8001 | ✅ Spark A — Orchestrator + Review |
| Qwen3-Coder-Next FP8 | 192.168.0.188:8001 | ✅ Spark B — Coding Worker |
| Gemma 4 FP8 | 192.168.0.99:8001 | ✅ Spark C — Fast Reviewer Tier 1 |
| GPT-OSS MXFP4 | 192.168.0.101:8001 | ✅ Spark D — Senior Reviewer Tier 2 |
| Escalation | Claude Code Max 200 | ✅ claude-opus-4-5 |

---

## Implementierungsstand (alles done)

| Block | Thema | Status |
|---|---|---|
| Block 6 | Review-Pipeline V2 (Auto-Retry, Metriken) | ✅ |
| A.1 | Workorder-Schema (risk_category, files_blocked, rollback_hint) | ✅ |
| A.2 | Files Enforcement (files_blocked + Post-Execution Scope Check) | ✅ |
| A.3 | Module-/File-Locks (Scope-Lock + DB-Migration-Lock, TTL 10min) | ✅ |
| A.4 | High-Risk-Matrix zentralisiert (risk-categories.ts, 13 Kategorien) | ✅ |
| B.1 | Run Summary Generator (JSON + Markdown, next_action Logik) | ✅ |
| B.2 | Morning Report | ✅ |
| B.3 | Failed WO Report | ✅ |
| B.4 | Model Quality Report | ✅ |
| C.1 | Kill-Switch / System Stop | ✅ |
| C.1b | Automatische Stop-Trigger (5 Regeln, Stop Rules Engine) | ✅ |
| C.2 | Approval Queue (State Machine, CLI) | ✅ |
| C.3 | Night-Run-Policy V1 | ✅ |
| D.1 | WO-State-Machine (WO_TRANSITIONS, formal erzwungen) | ✅ |
| D.2 | Scheduler Preflight (12 Checks, GO/HOLD/REJECT) | ✅ |
| E.1 | Completed WO Dossier Generator | ✅ |
| E.2 | Docs-Governance V1 (SSOT-Matrix, Drift-Checker) | ✅ |
| F | Spark Runtime Hardening | ⏳ bewusst offen |

---

## Letzter Commit

```
5d3c705  docs: refresh CLAUDE runtime instructions for workorder workflow
5a02e09  fix: WORKORDER_CREATION_HANDBOOK kleine Korrekturen
aa00c2f  docs: Workorder Creation Handbook + 4 Masterprompts
b1b2b58  docs: USER_MANUAL.md - Praxishandbuch fuer Tom
ed28cfd  fix(docs): E.2 DRIFT_BLOCKING - AGENTS.md aktualisiert
6eabae5  feat(governance): E.2 — Docs-Governance V1
157cb11  feat(reports): E.1 — Completed WO Dossier Generator
3aa7ebc  feat(governance): C.3 — Night-Run-Policy V1
be953b8  feat(governance): C.1b — Automatische Stop-Trigger
cb02cb9  feat(reports): B.4 — Model Quality Report
```

---

## Test-Stand

```
19/19  Preflight-Tests    (system/control-plane/__tests__/scheduler-preflight.test.ts)
18/18  Night-Run-Tests    (system/control-plane/__tests__/night-run-policy.test.ts)
15/15  Stop-Rules-Tests   (system/control-plane/__tests__/stop-rules.test.ts)
30/30  State-Machine      (system/state/__tests__/wo-state-machine.test.ts)
16/16  Lock-Tests         (system/state/__tests__/scope-locks.test.ts)
13/13  Stop-Tests         (system/state/__tests__/stop-rules.test.ts)
24/24  Approval-Tests     (system/approval/__tests__/approval-queue.test.ts)
22/22  Gateway-Tests      (system/agent-registry/__tests__/gateway.test.ts)
22/22  Pipeline-Tests     (system/control-plane/__tests__/review-pipeline.test.ts)
 6/6   V2-Verify          (system/control-plane/__tests__/dispatcher-v2-verify.ts)
tsc:   0 Fehler
```

---

## Dispatcher Flow

```
Workorder
  → isSystemStopped()             ← C.1 Kill-Switch (vor allem)
  → validateWorkorder() Schema
  → runPreflight() GO/HOLD/REJECT ← D.2 (12 Checks)
  → acquireScopeLock()            ← A.3
  → acquireDbMigrationLock()      ← A.3 (bei db-migration)
  → startRun() + auditJobStarted()
  → callModel() [Qwen3.6, enable_thinking=false]
  → validateOrchestratorIntent()  ← Governance Validator
  → authorizeToolCall()           ← Gateway v0.3.0 (files_blocked)
  → executeTool()
  → isPathInScope() Post-Check    ← A.2 Defense in Depth
  → runReviewPipeline()           ← Spark C → Spark D
  → enqueueApproval() wenn HUMAN_NEEDED ← C.2
  → releaseScopeLock() + releaseDbMigrationLock()
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

---

## Scheduler Preflight (D.2) — 12 Checks

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
| night_run_policy | HOLD |

Priorität: REJECT > HOLD > GO

---

## Night-Run-Policy (C.3)

| Kategorie | Night-Run |
|---|---|
| standard, docs, i18n, test | ✅ AUTONOMOUS |
| security, auth, rls, shared-core, architecture | ⚠️ CAUTIOUS (Spark D mandatory) |
| db-migration, payments, medical, release | 🔴 REQUIRES_PRIOR_APPROVAL |

```bash
npx tsx system/control-plane/night-run-policy.ts status
npx tsx system/control-plane/night-run-policy.ts check    # Exit 0 = ready
npx tsx system/control-plane/night-run-policy.ts activate
```

5 Readiness-Checks: Modus aktiv, System nicht gestoppt, Stop-Rules sauber, keine pending Approvals, keine laufenden Runs.

---

## Stop-Regeln (C.1b)

| Regel | Schwellwert |
|---|---|
| FAILED_RUNS_THRESHOLD | ≥ 5 failed Runs |
| HUMAN_NEEDED_PENDING_MAX | ≥ 3 pending Approvals |
| INVALID_JSON_SPIKE | ≥ 50% (min. 3 Samples) |
| FILES_SCOPE_VIOLATIONS | ≥ 2 Events |
| ESCALATION_RATE_SPIKE | ≥ 80% (min. 5 Reviews) |

```bash
npx tsx system/control-plane/stop-rules.ts --dry-run
```

---

## Approval Queue (C.2)

State Machine: `pending → granted | denied | expired`, `granted → consumed`

```bash
npx tsx system/approval/approval-cli.ts list
npx tsx system/approval/approval-cli.ts grant <id>
npx tsx system/approval/approval-cli.ts deny <id> "Grund"
```

Queue-Datei: `system/approval/queue.json`

---

## Governance Validator

### Erlaubte Enums
- **selected_agent:** micro-executor | db-migration-agent | security-specialist | review-agent
- **risk_level:** low | medium | high
- **gates:** db-migration-gate | rollback-gate | typecheck-gate | test-gate | review-gate | human-approval-gate | files-scope-gate | security-gate

### Stop-Conditions
NIEMALS positive Zustände: `approved`, `passed`, `granted`, `success`, `completed`

---

## Qwen3.6 Pflichtregeln

```json
{
  "chat_template_kwargs": { "enable_thinking": false },
  "temperature": 0.0
}
```

`/no_think` funktioniert NICHT — nur `chat_template_kwargs`.

---

## Risk-Kategorien (Single Source of Truth: risk-categories.ts)

| Kategorie | Spark D | Auto-Retry | Human Approval |
|---|---|---|---|
| standard / docs / i18n / test | ✗ | ✓ | ✗ |
| db-migration | ✓ | ✗ | ✓ |
| security / auth / rls | ✓ | ✗ | ✗ |
| medical / payments | ✓ | ✗ | ✓ |
| shared-core / architecture / release | ✓ | ✗ | ✓ |

---

## Reports

```bash
npx tsx system/reports/morning-report.ts
npx tsx system/reports/failed-wo-report.ts
npx tsx system/reports/model-quality-report.ts
npx tsx system/reports/run-summary-generator.ts --all
npx tsx system/reports/wo-dossier.ts --all-completed
npx tsx system/control-plane/docs-drift-checker.ts
```

---

## Workorder-Workflow (Masterprompts)

Tom nutzt diese Trigger — ich lese die jeweilige Datei automatisch:

| Trigger | Datei |
|---|---|
| `"Spec erstellen:"` | `docs/project/prompts/MASTERPROMPT_BRAINSTORM_TO_SPEC.md` |
| `"Workorders generieren:"` | `docs/project/prompts/MASTERPROMPT_SPEC_TO_WORKORDERS.md` |
| `"WOs reviewen:"` | `docs/project/prompts/MASTERPROMPT_WORKORDER_REVIEW.md` |
| `"Batch planen:"` | `docs/project/prompts/MASTERPROMPT_WORKORDER_BATCH_PLAN.md` |

Handbücher: `docs/project/USER_MANUAL.md` | `docs/project/WORKORDER_CREATION_HANDBOOK.md`

---

## Wichtige Dateien

```
system/control-plane/dispatcher.ts           — Haupt-Dispatcher
system/control-plane/risk-categories.ts      — Risk-Matrix (SSOT)
system/control-plane/governance-validator.ts — Validator
system/control-plane/scheduler-preflight.ts  — 12 Checks
system/control-plane/review-pipeline.ts      — Review Pipeline V2
system/control-plane/stop-rules.ts           — Stop-Regeln (C.1b)
system/control-plane/night-run-policy.ts     — Night-Run (C.3)
system/control-plane/docs-drift-checker.ts   — Docs-Drift (E.2)
system/state/state-manager.ts               — V1.4.0 (Locks, Stop, State-Machine)
system/state/audit-writer.ts                — Alle Audit-Events
system/agent-registry/authorize-tool-call.ts — Permission Gateway v0.3.0
system/approval/approval-queue.ts           — Approval Queue (C.2)
system/approval/approval-cli.ts             — CLI
system/workorders/schemas/workorder.schema.json — WO-Schema
system/reports/morning-report.ts            — Morning Report
system/reports/failed-wo-report.ts          — Failed WO Report
system/reports/model-quality-report.ts      — Model Quality Report
system/reports/run-summary-generator.ts     — Run Summary
system/reports/wo-dossier.ts               — WO Dossier
docs/project/DOCS_GOVERNANCE.md            — SSOT-Matrix, Drift-Regeln
```

---

## Docs-Governance (E.2)

10 SSOT-Dateien, 12 geprüfte Source-Doc-Paare.

```bash
npx tsx system/control-plane/docs-drift-checker.ts --blocking-only
# BLOCKING: 0 = sauber
```

---

## Offene Punkte

```
F  Spark Runtime Hardening (bewusst später):
   - systemd Services
   - HTTP Healthcheck-Timer
   - Reboot-Tests pro Spark
   - Auto-Restart bei hängendem vLLM
```
