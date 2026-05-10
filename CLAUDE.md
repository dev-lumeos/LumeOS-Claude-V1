# CLAUDE.md — LumeOS Runtime Instructions

## Rolle

Du bist Claude im LumeOS-Repo.  
Du hilfst Tom beim Planen, Strukturieren, Reviewen und Erzeugen von Specs/Workorders.  
Du änderst Dateien nur, wenn Tom es explizit verlangt.

---

## Projektstatus

Das deterministische Governance-/Execution-System ist implementiert:

- Review-Pipeline V2
- Workorder-Schema
- Risk-Categories
- Files Enforcement
- Scope-/DB-Migration-Locks
- WO-State-Machine
- Scheduler Preflight
- System Stop + Stop Rules
- Approval Queue
- Night-Run-Policy
- Reporting Layer
- WO Dossiers
- Docs-Governance

Offen:
- Spark Runtime Hardening: systemd Services, HTTP Healthcheck-Timer, Reboot-Tests.

---

## Arbeitsprinzip

Nicht direkt "Feature bauen".  
Immer über:

```
Brainstorm → Spec → Workorders → Workorder Review → Batch Plan → Run → Reports
```

---

## Workorder-Workflow

Wenn Tom diese Trigger nutzt, lies die jeweilige Masterprompt-Datei automatisch und wende sie exakt an:

- **"Spec erstellen:"** → `docs/project/prompts/MASTERPROMPT_BRAINSTORM_TO_SPEC.md`
- **"Workorders generieren:"** → `docs/project/prompts/MASTERPROMPT_SPEC_TO_WORKORDERS.md`
- **"WOs reviewen:"** → `docs/project/prompts/MASTERPROMPT_WORKORDER_REVIEW.md`
- **"Batch planen:"** → `docs/project/prompts/MASTERPROMPT_WORKORDER_BATCH_PLAN.md`

Regeln:
- Erst passende Prompt-Datei lesen.
- Keine Workorders erzeugen, wenn die Spec nicht workorder-ready ist.
- Bei fehlenden Pflichtinformationen gezielt nachfragen.
- Keine High-Risk-WOs in autonome Night-Runs einplanen.
- Keine DB-Migration ohne rollback_hint.

---

## Wichtige Referenzen

- `docs/project/USER_MANUAL.md`
- `docs/project/WORKORDER_CREATION_HANDBOOK.md`
- `docs/project/DOCS_GOVERNANCE.md`
- `system/workorders/schemas/workorder.schema.json`
- `system/control-plane/risk-categories.ts`
- `system/control-plane/scheduler-preflight.ts`
- `system/control-plane/night-run-policy.ts`
- `system/control-plane/stop-rules.ts`
- `system/approval/approval-queue.ts`
- `system/reports/morning-report.ts`
- `system/reports/failed-wo-report.ts`
- `system/reports/model-quality-report.ts`
- `system/reports/wo-dossier.ts`

---

## Schreibregeln

- Keine Codeänderung ohne explizite Freigabe.
- Keine Commits oder Pushes ohne Tom.
- Keine Runtime-Hardening-Arbeiten mit Governance-Arbeiten vermischen.
- Keine alten BrainstormDocs als Current Truth verwenden.
- Bei Unsicherheit: nach aktuellem SSOT suchen, nicht raten.

---

## High-Risk-Regel

High-Risk — brauchen Prior Approval:
- `db-migration`, `payments`, `medical`, `release`

Cautious — senior review mandatory through Codex/GPT-5.5, kein Auto-Retry:
- `security`, `auth`, `rls`, `shared-core`, `architecture`

Autonom — dürfen ohne Approval laufen:
- `standard`, `docs`, `i18n`, `test`

Quelle: `system/control-plane/risk-categories.ts`

---

## Reports

Für den aktuellen Status:

```bash
npx tsx system/reports/morning-report.ts
npx tsx system/reports/failed-wo-report.ts
npx tsx system/reports/model-quality-report.ts
npx tsx system/reports/wo-dossier.ts --all-completed
npx tsx system/control-plane/docs-drift-checker.ts
```

---

## Veraltete Referenzen

Wenn alte Pfade, alte Skills oder alte Service-Flows gefunden werden, nicht verwenden.  
Stattdessen die aktuellen Referenzen oben nutzen.

---

## Aktueller Stack

- Spark A (192.168.0.128:8001): Qwen3.6-35B FP8 — Orchestrator + Review
- Spark B (192.168.0.188:8001): Qwen3-Coder-Next FP8 — Coding Worker
- Spark C (192.168.0.99:8001):  Gemma-4-26B FP8 — Fast Reviewer Tier 1
- Spark D / DGX4 (192.168.0.101:8001): disabled for productive governance; reserved for future DGX4/DGX5 MiniMax lab work.
- Senior review / escalation: Codex CLI with GPT-5.5 as Tom's productive senior engineering/review runtime.

Quelle: `STACK_REFERENCE.md`

---

*Brain only. System macht den Rest.*
