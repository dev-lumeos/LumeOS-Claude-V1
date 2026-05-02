# WO-GOVERNANCE-P1-004 — Batch Loader CLI V1

**Status:** closed
**Phase:** 1 — Governance Tooling
**Completion Note:** Bootstrap execution completed successfully. This was a one-time bootstrap exception because no official batch-loader entrypoint existed before this WO. Validation: `pnpm tsc --noEmit` clean, dry-run against `BATCH-NUTRITION-P1-001-db-foundation.md` returns Exit 0 with all three Nutrition WOs schema-valide. See `BATCH-GOVERNANCE-P1-001-batch-loader-cli.md` §Validation Result.
**Source:** `docs/project/BATCH_LOADER_CLI_V1.md` §11 Workorder-Kandidat
**Template:** `system/workorders/templates/template_implementation_medium.md`
**Lifecycle:** `wo_generated` → `graph_validated` → `queue_released` → `ready` → `dispatched` → `running` → `done` → `reviewed` → `closed` (per `wo_lifecycle_v1.md`)

---

## Out of Scope

- Scheduler-Service-Integration (`services/scheduler-api/**`) — `--use-scheduler-service`-Flag ist Phase 2
- Resume nach Approval (`--resume`-Modus) — Phase 2
- Production-DB-Push (`supabase db push --linked`) — bleibt manuell durch Tom
- UI / Web-Frontend
- Batch-History-Automation
- Markdown-Batch-Format V2
- Approval-Auto-Granting (existiert nicht und soll nicht existieren)
- Parallel-Dispatch nicht-konfliktärer WOs (V1: strikt sequenziell)

---

## Architekturentscheidung (verbindlich)

Per `Batch Loader Dispatch Path Inspection`:

**Library-Aufruf, kein HTTP gegen Scheduler-Service.**

Verwenden:
- `system/control-plane/dispatcher.ts` → `dispatchWorkorder()`, `defaultExecuteTool`
- `system/control-plane/scheduler-preflight.ts` → `runPreflight()`
- `system/state/state-manager.ts` → `isSystemStopped()`, ggf. State-Reads für Pre-Dispatch-Checks
- `system/approval/approval-queue.ts` → `getPendingApprovals()` für Run-Summary-Ausgabe

**NICHT verwenden:**
- `services/scheduler-api/**`
- HTTP `POST /dispatch`
- `DispatchLoop`
- `SlotManager`
- Supabase `workorder-repository`

---

## Workorder

```yaml
workorder_id: "WO-governance-004"
agent_id:     "senior-coding-agent"
phase:        1
priority:     "normal"
quality_critical: false
requires_approval: true
risk_category: "architecture"

task: |
  <task>
    <analyze>
      Lies zuerst alle scope_files und context_files vollständig:
      - docs/project/BATCH_LOADER_CLI_V1.md (Spec — Pflichtreferenz)
      - system/workorders/schemas/workorder.schema.json (Validation-Quelle)
      - system/workorders/lifecycle/wo_lifecycle_v1.md (State-Erwartungen)
      - system/control-plane/dispatcher.ts (Library-Eintritt — dispatchWorkorder, defaultExecuteTool, Workorder-Type)
      - system/control-plane/scheduler-preflight.ts (runPreflight für GO/HOLD/REJECT)
      - system/state/state-manager.ts (isSystemStopped + State-Reads)
      - system/approval/approval-queue.ts (getPendingApprovals)
      - system/workorders/nutrition/batches/BATCH-NUTRITION-P1-001-db-foundation.md (Test-Input)
      - die drei referenzierten Drafts in system/workorders/nutrition/drafts/

      Verstehe das Markdown-Batch-Format:
      - Sektion "## Included Workorders" als Tabelle mit Spalten Filename / workorder_id / Title / Risk / Approval
      - Sektion "## Execution Order" und "## Dependency Chain"
      - Status-Sektion ("## Status") muss "ready_for_approval" sein bevor --run akzeptiert wird

      Verstehe das WO-Draft-Format:
      - YAML im ersten ```yaml-Codeblock pro Datei
      - workorder_id im YAML ist Source-of-Truth (nicht der Filename)

      Plane die drei Files (run-batch.ts, batch-loader.ts, README.md):
      - run-batch.ts = CLI-Argument-Parsing + Modi-Steuerung + Top-Level-Output
      - batch-loader.ts = pure Logik: Markdown parsen, YAMLs extrahieren, Schema validieren,
                          Dependency-Order berechnen, Approval-Bedarf ermitteln
      - README.md = kurze Bedienungsdoku für den CLI

      Erkenne Breaking-Change-Risiken: KEINE Änderungen außerhalb scope_files.
      Schreibe architecture_notes mit:
      - Library-Aufruf-Pattern (gleich wie smoke-test.ts)
      - YAML-Parser-Wahl (z. B. js-yaml — falls als Repo-Dependency verfügbar; sonst pragmatisch)
      - JSON-Schema-Validator (ajv ist im Root als devDependency verfügbar)
    </analyze>

    <implement>
      Implementiere einen CLI Entry Point, der Markdown-Batch-Dateien liest, enthaltene Workorder-Drafts findet, YAML/WO-Blöcke extrahiert, gegen workorder.schema.json validiert, Dependency-Reihenfolge prüft und im --run-Modus über dispatchWorkorder() aus system/control-plane/dispatcher.ts startet.

      File 1 — system/workorders/cli/run-batch.ts (CLI-Entry):
      - Parse argv: <batch-file> [--dry-run | --run]
      - Default-Verhalten ohne Modus oder mit unbekanntem Argument: dry-run (sicherer Default)
      - Importiere batch-loader.ts und rufe Top-Level-Funktionen
      - Output strukturiert nach stdout (Text-Report)
      - Exit-Codes: 0 = Erfolg, 1 = Validierungs-/Schema-Fehler, 2 = Stop-Rules/Preflight blockiert,
        3 = Approval pausierend (kein Fehler, sondern Hinweis)

      File 2 — system/workorders/cli/batch-loader.ts (Library-Logik):
      - parseBatchMd(path): liest Markdown-Batch, extrahiert "Included Workorders"-Tabelle und Status-Sektion
      - resolveWoDrafts(batchDir, filenames): löst Filenames relativ zum drafts/-Ordner desselben Moduls
      - extractWoYaml(mdPath): extrahiert ersten ```yaml-Codeblock und parsed via js-yaml
      - validateWo(wo): nutzt ajv mit workorder.schema.json
      - sortByDependencies(wos): topologische Sortierung über blocked_by
      - identifyApprovalNeeds(wos): markiert WOs mit risk_category aus High-Risk-Liste
                                    (db-migration, payments, medical, release) ODER requires_approval=true
      - runDryRun(wos): formatierter Text-Bericht (Status / Reihenfolge / Approval-Liste / Gesamtstatus)
      - runDispatch(wos): pro WO sequenziell:
          1. isSystemStopped() prüfen — Abbruch bei stop
          2. runPreflight(wo) — Abbruch bei REJECT, pausieren bei HOLD
          3. dispatchWorkorder(wo, { executeTool: defaultExecuteTool }) aufrufen
          4. DispatchResult auswerten — bei awaiting_approval: pausieren mit klarer
             Hinweismeldung incl. approval_id
          5. Bei done: nächste WO der sortierten Liste
          6. Am Ende: getPendingApprovals() für Status-Übersicht ausgeben

      File 3 — system/workorders/cli/README.md (Bedienungsdoku):
      - Synopsis und Beispiele aus BATCH_LOADER_CLI_V1.md §6/§7
      - Sicherheitsregeln aus §8
      - Out-of-Scope V1 aus §9
      - Verweis auf BATCH_LOADER_CLI_V1.md als Master-Spec

      post_review_required: true immer setzen.
    </implement>

    <constraints>
      Kein Scope Creep. Nur run-batch.ts, batch-loader.ts und README.md schreiben.
      Keine Änderungen an dispatcher.ts, scheduler-preflight.ts, state-manager.ts, approval-queue.ts oder approval-gate.ts.
      KEINE HTTP-Aufrufe gegen services/scheduler-api/.
      KEINE Imports aus services/scheduler-api/, packages/scheduler-core/ oder DispatchLoop/SlotManager.
      KEINE Supabase-Imports.
      KEIN supabase db push.
      KEIN supabase db reset.
      Markdown-Parser pragmatisch (Regex/String-Split zulässig wenn keine MD-Lib Dependency).
      JSON-Schema-Validator: ajv (bereits Repo-Dependency).
      YAML-Parser: js-yaml falls bereits Repo-Dependency; sonst FAIL mit Hinweis.
      Auf neue npm-Dependencies verzichten — wenn unvermeidbar: ESCALATE.
      Strikte Dependency-Reihenfolge in --run-Modus. Keine Parallelität in V1.
      post_review_required: true.
    </constraints>

    <on_error>
      Bei TypeScript-Fehler: {"status": "FAIL", "issues": ["tsc: ..."]}.
      Bei Breaking Change erkannt ohne Task: {"status": "ESCALATE"}.
      Bei nötigem Import aus services/scheduler-api/: {"status": "STOP", "issues": ["scheduler-service usage not allowed in V1"]}.
      Bei nötiger neuer npm-Dependency außer js-yaml/ajv (sofern bereits vorhanden): {"status": "ESCALATE"}.
      Bei Migration / Schema-Änderung erkannt: {"status": "ESCALATE", "issues": ["route to db-migration-agent"]}.
      Bei Security-Befund: {"status": "STOP"}.
      Bei fehlendem Kontext (Spec oder Schema-Datei nicht lesbar): {"status": "BLOCKED"}.
      Bei mehrdeutigem Markdown-Batch-Format: {"status": "ESCALATE"}.
    </on_error>
  </task>

scope_files:
  - "system/workorders/cli/run-batch.ts"
  - "system/workorders/cli/batch-loader.ts"
  - "system/workorders/cli/README.md"

context_files:
  - "docs/project/BATCH_LOADER_CLI_V1.md"
  - "system/workorders/schemas/workorder.schema.json"
  - "system/workorders/lifecycle/wo_lifecycle_v1.md"
  - "system/control-plane/dispatcher.ts"
  - "system/control-plane/scheduler-preflight.ts"
  - "system/state/state-manager.ts"
  - "system/approval/approval-queue.ts"
  - "system/approval/approval-gate.ts"
  - "system/workorders/nutrition/batches/BATCH-NUTRITION-P1-001-db-foundation.md"
  - "system/workorders/nutrition/drafts/WO-NUTRITION-P1-001-audit-existing-state.md"
  - "system/workorders/nutrition/drafts/WO-NUTRITION-P1-002-core-schema-foundation.md"
  - "system/workorders/nutrition/drafts/WO-NUTRITION-P1-003-food-core-tables.md"
  - "system/control-plane/__tests__/smoke-test.ts"

acceptance_criteria:
  - "CLI unterstützt --dry-run"
  - "CLI unterstützt --run"
  - "--dry-run liest BATCH-NUTRITION-P1-001-db-foundation.md und zeigt WO-nutrition-001, WO-nutrition-002 und WO-nutrition-003 korrekt"
  - "--dry-run validiert alle drei WOs gegen workorder.schema.json (Pflichtfelder, Regex, db-migration if/then)"
  - "--dry-run zeigt Approval-Bedarf für WO-nutrition-002 und WO-nutrition-003"
  - "--dry-run führt keine Workorder aus (kein Aufruf von dispatchWorkorder)"
  - "--run nutzt dispatchWorkorder() direkt als Library-Import aus system/control-plane/dispatcher.ts, nicht services/scheduler-api/"
  - "--run respektiert Dependency-Reihenfolge gemäß blocked_by-Feldern (topologische Sortierung)"
  - "--run stoppt bei HOLD oder REJECT aus runPreflight() mit klarer Fehlermeldung"
  - "--run führt KEIN supabase db push und KEIN supabase db reset aus"
  - "db-migration-WOs (WO-nutrition-002, WO-nutrition-003) laufen nicht produktiv ohne Approval — Run pausiert bei awaiting_approval"
  - "Pending Approvals werden am Ende des Runs via getPendingApprovals() angezeigt"
  - "Keine Datei außerhalb scope_files wird geändert (Files-Scope-Gateway prüft Post-Execution)"
  - "TypeScript kompiliert ohne Fehler (pnpm tsc --noEmit)"
  - "Alle bestehenden Tests grün (pnpm test)"
  - "Keine neuen npm-Dependencies hinzugefügt (außer falls js-yaml/ajv bereits vorhanden — keine package.json-Änderung)"

negative_constraints:
  - "NIEMALS außerhalb scope_files schreiben"
  - "NIEMALS services/scheduler-api/** ändern oder importieren"
  - "NIEMALS HTTP-POST gegen Scheduler-Service (POST /dispatch) aufrufen"
  - "NIEMALS DispatchLoop oder SlotManager importieren oder nutzen"
  - "NIEMALS supabase db push oder supabase db reset ausführen"
  - "NIEMALS Approval Queue (system/approval/queue.json) manuell editieren"
  - "NIEMALS Runtime-State-Dateien (system/state/runtime_state.json, *.jsonl) direkt editieren"
  - "NIEMALS Workorders im --dry-run-Modus ausführen"
  - "NIEMALS ENV-Dateien lesen oder schreiben"
  - "NIEMALS Schema- oder Migration-Changes (→ db-migration-agent)"
  - "NIEMALS bestehende Tests deaktivieren oder skip-pen"
  - "NIEMALS package.json um neue npm-Dependencies erweitern"

files_blocked:
  - "services/**"
  - "apps/**"
  - "supabase/**"
  - "infra/**"
  - ".env"
  - ".env.*"
  - "system/approval/queue.json"
  - "system/state/runtime_state.json"
  - "system/state/*.jsonl"
  - "system/control-plane/dispatcher.ts"
  - "system/control-plane/scheduler-preflight.ts"
  - "system/state/state-manager.ts"
  - "system/approval/approval-queue.ts"
  - "system/approval/approval-gate.ts"
  - "package.json"

validation_commands:
  - "pnpm tsc --noEmit"
  - "npx tsx system/workorders/cli/run-batch.ts system/workorders/nutrition/batches/BATCH-NUTRITION-P1-001-db-foundation.md --dry-run"

required_skills: ["gsd-v2"]
optional_skills: ["typescript-pro", "nodejs-best-practices"]
blocked_by:      []
```

---

## Notes

- **Filename ↔ workorder_id:** Filename `WO-GOVERNANCE-P1-004-batch-loader-cli-v1.md` folgt der Auftrags-Convention; `workorder_id: WO-governance-004` folgt der Schema-Regex `^WO-[a-z]+-[0-9]+$`. Orchestrator/Scheduler nutzen das `workorder_id`-Feld.
- **`requires_approval: true`** ist Pflicht für `risk_category: architecture` per `CLAUDE.md` "Cautious — Spark D mandatory, kein Auto-Retry" und per High-Risk-Regel mit Prior-Approval-Anforderung für strukturelle Änderungen.
- **`rollback_hint` nicht erforderlich** per Schema if/then (nur bei `db-migration`). Trotzdem dokumentiert in `BATCH_LOADER_CLI_V1.md` §11: "DELETE system/workorders/cli/run-batch.ts; restore unchanged Dispatcher/Approval/Reports."
- **`files_blocked` enthält die kritischen Library-Dateien** (`dispatcher.ts`, `scheduler-preflight.ts`, `state-manager.ts`, `approval-queue.ts`, `approval-gate.ts`) — der Loader nutzt sie nur als Imports/Reads, ändert sie nicht.
- **Lifecycle-Pfad:** Erwartet `done` → `reviewed` (architecture-review + Spark D) → `closed`. Architecture-Risk verlangt cautious Run, kein Auto-Retry.
- **Standorts-Hinweis:** Der WO-Draft liegt unter `system/workorders/nutrition/drafts/`, weil dort die Phase-1-Drafts gepflegt werden — der WO selbst ist aber `governance`-getagged (Modul `governance`). Die Verzeichnis-Konvention ist Auftrags-bestimmt.

---

*Draft erzeugt: 2026-05-02 — gemäß `BATCH_LOADER_CLI_V1.md` §11, `template_implementation_medium.md`, `wo_factory_prompt.md` und `Batch Loader Dispatch Path Inspection` (USE_LIBRARY_DISPATCH).*
