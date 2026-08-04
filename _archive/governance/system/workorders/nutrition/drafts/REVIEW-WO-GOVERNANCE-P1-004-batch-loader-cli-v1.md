# REVIEW-WO-GOVERNANCE-P1-004-batch-loader-cli-v1.md

> Review der Draft-Workorder `WO-GOVERNANCE-P1-004-batch-loader-cli-v1.md`
> Reviewer: Opus | Datum: 2026-05-02
> Quellen: `BATCH_LOADER_CLI_V1.md`, `workorder.schema.json`, `template_implementation_medium.md`, `wo_lifecycle_v1.md`, `dispatcher.ts`, `scheduler-preflight.ts`, `state-manager.ts`, `approval-queue.ts`

---

## Verdict

**PASS**

Der Draft ist schema-kompatibel, template-konform, scope-eng, architecture-risk korrekt, library-only ohne Scheduler-Service-Nutzung, dry-run-sicher, mit messbaren Acceptance Criteria und ohne Direkt-Editing kritischer Runtime-State-Dateien. Es wurden keine echten Fixes gefunden, nur drei dokumentationsbezogene Minor-Hinweise.

---

## Findings

| Severity | Finding | Fix |
|---|---|---|
| OK | Schema-Compliance: `workorder_id` matched Regex `^WO-[a-z]+-[0-9]+$` (`WO-governance-004`); alle Pflichtfelder vorhanden; `negative_constraints` = 12 (≥ 4); `acceptance_criteria` = 16 (≥ 1); `risk_category: architecture` ist im Enum. | — |
| OK | Schema if/then: `architecture` benötigt **kein** `rollback_hint` (nur `db-migration` triggert if/then). Trotzdem ist Rollback-Hinweis im Notes-Block dokumentiert (DELETE-Statement aus Spec §11). | — |
| OK | Template `template_implementation_medium.md` korrekt umgesetzt: `senior-coding-agent`, XML-Task mit allen 4 Blöcken (`<analyze>`/`<implement>`/`<constraints>`/`<on_error>`), `post_review_required: true` in `<constraints>` vermerkt, `required_skills: ["gsd-v2"]`. | — |
| OK | Scope: 3 neue Dateien (`run-batch.ts`, `batch-loader.ts`, `README.md`) — deutlich unter dem 15-File-Limit für Medium. Keine Edits an existierenden Dateien. | — |
| OK | Architecture-Risk + `requires_approval: true` korrekt — gemäß `CLAUDE.md` High-Risk-Regel ist `architecture` Cautious mit Spark D mandatory; mit Prior-Approval-Anforderung explizit gesetzt. | — |
| OK | Library-only-Pfad: explizit "über `dispatchWorkorder()` aus `system/control-plane/dispatcher.ts`" + Hinweis auf `smoke-test.ts` als Muster. `services/scheduler-api/**`, `DispatchLoop`, `SlotManager`, HTTP `/dispatch` sind in `negative_constraints` UND in `<on_error>` (STOP) explizit blockiert. | — |
| OK | Dry-run-Sicherheit: AC "--dry-run führt keine Workorder aus (kein Aufruf von dispatchWorkorder)" + negative_constraint "NIEMALS Workorders im --dry-run-Modus ausführen" + Default-Verhalten unbekannter Args = dry-run. | — |
| OK | Runtime-State / Approval-Queue: `files_blocked` enthält `system/approval/queue.json`, `system/state/runtime_state.json`, `system/state/*.jsonl`; negative_constraints sperren manuelle Edits zusätzlich. | — |
| OK | Acceptance Criteria messbar: konkrete WO-IDs (WO-nutrition-001/002/003), konkrete Dateipfade, konkrete Validation-Commands inkl. `pnpm tsc --noEmit` + ausführbarer dry-run-Befehl. | — |
| OK | `files_blocked` enthält die kritischen Library-Pfade (`dispatcher.ts`, `scheduler-preflight.ts`, `state-manager.ts`, `approval-queue.ts`, `approval-gate.ts`) — read-only-Imports bleiben erlaubt, Writes auf diese Dateien werden vom Permission Gateway abgewiesen (Defense-in-Depth). | — |
| OK | `package.json` in `files_blocked` — verhindert versehentliche neue npm-Dependencies. AC fordert "Keine neuen npm-Dependencies hinzugefügt". | — |
| OK | `<on_error>` deckt alle relevanten Fehlfälle ab: tsc-FAIL, scheduler-api-Import-STOP, neue npm-Dep-ESCALATE, Migration/Schema-ESCALATE, mehrdeutiges Markdown-Format-ESCALATE. | — |
| Minor | `js-yaml` und `ajv` werden als "bereits Repo-Dependency" angenommen. `ajv` ist als devDependency in `package.json` belegt; `js-yaml` ist nicht verifiziert in dieser Review. Wenn `js-yaml` fehlt, würde der Worker per `<on_error>` ESCALATE — kein Schema-/Sicherheitsfehler, aber Risiko für FAIL/ESCALATE-Latenz. | Optional vor Dispatch: kurzer `grep "js-yaml" package.json`-Check, oder im Task-Block fallback "wenn js-yaml fehlt → minimaler eigener YAML-Parser für ein einfaches Schema OK". Kein Blocker. |
| Minor | Filename `WO-GOVERNANCE-P1-004-...md` liegt unter `system/workorders/nutrition/drafts/`, obwohl Modul `governance` ist. Im WO-Notes dokumentiert. Für Orchestrator/Scheduler unerheblich (nutzt `workorder_id`-Feld), für menschliche Suche aber leicht irreführend. | Optional: bei spätestens v2-Konvention ein eigener Pfad `system/workorders/governance/drafts/`. Kein V1-Blocker. |
| Minor | `validation_commands` enthält den dry-run-Befehl gegen den existierenden Nutrition-Batch — das ist eine sinnvolle End-to-End-Validierung. Allerdings nur effektiv, wenn der Worker im Validation-Step Schreibrechte für CLI-Output hat (stdout). Schema-Default `pnpm tsc --noEmit` deckt das ohnehin ab. | — |

---

## Batch Readiness

**Ready**

Der Draft ist bereit, in einen Batch-Plan aufgenommen zu werden. Empfohlen als eigener Single-WO-Batch (`BATCH-GOVERNANCE-P1-001`) oder integriert in den nächsten Governance-Tooling-Batch — nicht in `BATCH-NUTRITION-P1-001-db-foundation`, da `governance-batch-loader-cli-v1` unabhängig vom Nutrition-DB-Track ist und vor dessen Approval-Run produktiv sein muss, um den Nutrition-Batch überhaupt sicher zu testen.

---

## Required Fixes

Keine echten Fixes erforderlich.

Optionale Klarstellungen (kein Batch-Blocker):

1. **Optional:** Vor Dispatch verifizieren, dass `js-yaml` in `package.json` als Dependency vorhanden ist, oder im Task-Block einen Fallback (minimaler eigener Parser für YAML-Frontmatter-ähnliches Format) zulassen — verhindert ESCALATE-Schleife.
2. **Optional:** WO-Notes-Block um Hinweis erweitern, dass `governance-batch-loader-cli-v1` Vorbedingung für jede Library-basierte Batch-Ausführung ist und damit `BATCH-NUTRITION-P1-001` operativ blockiert (bis es einen Loader gibt, kann der Nutrition-Batch nicht über den Workflow-Pfad getestet werden — nur über Ad-hoc-Scripts wie `smoke-test.ts`).

---

*Review erzeugt: 2026-05-02 — gemäß `BATCH_LOADER_CLI_V1.md`, `workorder.schema.json`, `template_implementation_medium.md`, `wo_lifecycle_v1.md`.*
