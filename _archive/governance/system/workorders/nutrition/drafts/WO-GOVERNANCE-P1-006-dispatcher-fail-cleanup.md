# WO-GOVERNANCE-P1-006 — Dispatcher FAIL/Cleanup V1

**Status:** draft
**Phase:** 1 — Governance Tooling
**Source:** Workflow-Test-Befunde nach `WO-governance-004` (Batch-Loader) und `WO-governance-005` (OrchestratorIntent-Contract); wiederholte Diagnosen "Preflight HOLD: Scope-Lock Konflikt von Run RUN-...".
**Template:** `system/workorders/templates/template_implementation_medium.md`
**Lifecycle:** `wo_generated` → `graph_validated` → `queue_released` → `ready` → `dispatched` → `running` → `done` → `reviewed` (architecture/Spark D mandatory) → `closed` (per `wo_lifecycle_v1.md`)

---

## Out of Scope

- `risk_level`-Normalisierung (future OrchestratorIntent field-normalization WO, analoges Pattern zu WO-005).
- `selected_agent`-Normalisierung (bereits in WO-005 erledigt).
- Batch Loader CLI Änderungen (`system/workorders/cli/**`).
- Supabase Migration Execution.
- Approval-Auto-Granting (existiert nicht und soll nicht existieren).
- Nutrition DB Implementation.
- Preflight-Logik-Änderungen außer Audit-Hinzufügen.
- TTL-Verkürzung der Scope-Lock-Expiry.
- Runtime-State-Schema-Änderung (bestehendes Schema bleibt).

---

## Problem Statement

Wiederholte fehlgeschlagene `--run`-Versuche im Bootstrap-Workflow-Test hinterlassen **stale Einträge** in `system/state/runtime_state.json`:

- **Stale Scope-Locks** mit aktiver TTL (10 min). Nächster `--run` findet `scope_lock_free HOLD` und blockiert. Beobachtet z. B. mit `RUN-20260502-3657`, `RUN-20260502-5008`, `RUN-20260502-6627`.
- **Stale `active_workorders`-Einträge** in Status `dispatched` oder `running`. Beobachtet bei mehrfachen Test-Runs gleicher `workorder_id` (z. B. `WO-nutrition-001`) — alte Einträge verschwinden nicht.

**Ursache:** Der Dispatcher hat zwar `releaseScopeLock()` und `releaseDbMigrationLock()` Aufrufe, aber sie greifen nicht auf **allen** FAIL/EXCEPTION-Pfaden. Konkret beobachtet:

- **Governance-Validator FAIL/REWRITE-Limit:** Pipeline bricht ab mit `await state.endRun(runId, 'failed')`, aber **kein** `releaseScopeLock(runId)` davor (siehe Code-Pfad in `dispatcher.ts` rund um die Rewrite-Loop FAIL-Returns).
- **Schema-Parse-Fail nach Rewrite-Limit:** Gleiche Stelle, gleiches Verhalten.
- **Tool-Auth Block / Approval-Gate Block:** kein `releaseScopeLock()` vor Return.
- **Files-Scope-Violation Post-Check:** `releaseScopeLock()` fehlt im Block-Return.

Der einzige Pfad, der `releaseScopeLock()` zuverlässig aufruft, ist der **Erfolgsfall am Schleifenende** (Zeile mit "12. Finalize") und der **äußere catch-Block** (DISPATCHER_ERROR).

**Wirkung:** Jeder fehlgeschlagene `--run` reichert `runtime_state.json` mit unbereinigten Einträgen an, die manuelles Cleanup verlangen oder eine 10-Minuten-Wartepause auf TTL-Expiry erzwingen.

**Ziel:** Sicherstellen, dass jeder FAIL/EXCEPTION-Pfad die zuvor erworbenen Locks freigibt UND `active_workorders.status` auf einen Terminal-Wert (`failed`) setzt — **bevor** die Funktion zurückkehrt. Kein neues Lifecycle-Konzept, kein Bypass — nur die existierende Cleanup-Logik konsequent ans Ende jedes FAIL-Pfads ziehen.

---

## Architekturentscheidung (verbindlich)

Die Lösung ist **defensives Cleanup auf jedem Return-Pfad**, nicht eine architekturweite Refactorierung. Drei legitime Implementierungsmuster:

1. **Try/Finally-Wrapper** um den Hauptlauf nach `acquireScopeLock()` — `finally`-Block ruft immer `releaseScopeLock()` und `releaseDbMigrationLock()` auf, idempotent. WO-State auf `failed`/`done` wird im `try`-Pfad gesetzt; `finally` macht nur Lock-Release. (Empfohlen — kleinste, robusteste Änderung.)
2. **Cleanup-Helper-Funktion** `cleanupRunOnFailure(runId, woId, reason)` die alle Cleanup-Schritte bündelt. Jeder FAIL-Return ruft sie vor Return. Etwas verbose, aber explizit.
3. **State-Manager-Hook** der bei `endRun(runId, 'failed')` automatisch Locks freigibt. Erweitert `state-manager.ts` um Cleanup-Verantwortung. Größere Änderung als nötig.

**Empfehlung im Spec-Body:** **Variante 1 (Try/Finally)** als Default — minimaler Eingriff in bestehende Pipeline-Logik, konsistent mit Node/JS-Idiom für Resource-Cleanup. Implementer-Entscheidung im Spark-D-Review möglich.

In allen Varianten:
- `releaseScopeLock()` und `releaseDbMigrationLock()` sind **idempotent** (per state-manager.ts bereits — Doppelaufrufe sind sicher).
- `active_workorders` wird auf Terminal-Status gesetzt **bevor** der Lock freigegeben wird (Reihenfolge: Status → Locks → endRun).
- Audit-Event auf jedem FAIL-Pfad (über `audit-writer.ts`, kein direktes JSONL-Editieren).

---

## Workorder

```yaml
workorder_id: "WO-governance-006"
agent_id:     "senior-coding-agent"
phase:        1
priority:     "normal"
quality_critical: false
requires_approval: true
risk_category: "architecture"

task: |
  <task>
    <analyze>
      Lies vollständig:
      - system/control-plane/dispatcher.ts (Pipeline-Pfade; alle Return-Statements aus den
        FAIL-Branches; aktueller try/catch-Aufbau ab Schritt 2 "Run ID + State")
      - system/state/state-manager.ts (Signaturen von acquireScopeLock, releaseScopeLock,
        acquireDbMigrationLock, releaseDbMigrationLock, updateWorkorderStatus, endRun;
        Idempotenz-Garantien)
      - system/state/audit-writer.ts (verfügbare Audit-Events; insbesondere auditScopeLockReleased,
        auditJobFailed, writeAuditEvent)
      - system/control-plane/scheduler-preflight.ts (welche Conditions HOLD vs REJECT setzen;
        Verhalten bei stale active_workorders)
      - system/workorders/schemas/workorder.schema.json
      - system/workorders/lifecycle/wo_lifecycle_v1.md
      - system/workorders/nutrition/drafts/WO-GOVERNANCE-P1-005-orchestrator-intent-contract.md
        (als Beispiel für saubere Architektur-WO im selben Modul)
      - system/workorders/nutrition/batches/BATCH-GOVERNANCE-P1-002-orchestrator-intent-contract.md
        (Batch-Pattern)

      Identifiziere ALLE Return-Pfade in dispatcher.ts nach `acquireScopeLock()`, die folgende
      Cleanup-Schritte NICHT zuverlässig durchführen:
        - releaseScopeLock(runId)
        - releaseDbMigrationLock(runId)
        - updateWorkorderStatus(workorderId, 'failed') wenn Run abgebrochen wird
        - endRun(runId, <terminal>)
        - audit-Event über audit-writer.ts

      Belegte Lücken (zumindest):
        - Governance-Validator BLOCKED-Return
        - Governance-Validator FAIL-Return
        - REWRITE-Limit-erreicht-Return (sowohl parse-error als auch validation-error)
        - Tool-Auth Block-Return
        - Approval-Gate Block-Return (mit oder ohne approval_id)
        - Skill-Loader Block-Return
        - Tool-Result-Failed (führt aktuell weiter zu finalize, prüfe ob Lock-Release greift)
        - Files-Scope-Violation Post-Execution-Block
        - Review-Pipeline Rewrite-Return
        - Review-Pipeline Human-Needed-Return
      Erfasse die genaue Zeilen-Lage und welche Cleanup-Schritte fehlen.

      Schreibe architecture_notes mit gewählter Variante (1=Try/Finally Default,
      2=Cleanup-Helper, 3=State-Manager-Hook) plus Begründung warum andere Varianten verworfen.
    </analyze>

    <implement>
      Implementiere die im architecture_notes gewählte Variante. Default: Variante 1 (Try/Finally).

      Variante 1 — Try/Finally-Wrapper:
      - Direkt nach `acquireScopeLock()` (oder dem äquivalenten Erfolgs-Branch) eine try/finally-
        Struktur einführen, sodass jeder vorzeitige Return im try-Body durch den finally-Block
        läuft.
      - Im finally-Block:
          await state.releaseScopeLock(runId)         // idempotent
          await state.releaseDbMigrationLock(runId)   // idempotent
          // KEIN endRun hier — endRun wird im Erfolgs- oder im jeweiligen FAIL-Pfad gesetzt
          // KEIN updateWorkorderStatus hier — wird kontextabhängig im FAIL-Pfad gesetzt
          // Ein Audit-Event "scope_lock_released" wird via audit-writer geschrieben falls noch nicht
          // (auditScopeLockReleased mit reason: "cleanup on exit")
      - Vor jedem FAIL-Return im try-Body sicherstellen, dass:
          1. await state.updateWorkorderStatus(wo.workorder_id, 'failed') aufgerufen wird
             (sofern Status noch nicht terminal gesetzt ist)
          2. await state.endRun(runId, '<terminal>') aufgerufen wird ('failed' | 'blocked')
          3. ein Audit-Event über audit-writer.ts geschrieben wird
        Erst danach `return { status, ... }` — der finally-Block übernimmt dann die Locks.

      Reihenfolge auf jedem FAIL-Pfad VERBINDLICH:
        updateWorkorderStatus → endRun → audit-Event → return
        finally: releaseScopeLock → releaseDbMigrationLock → audit (wenn nicht schon)

      Variante 2 (Cleanup-Helper) und Variante 3 (State-Manager-Hook) nur wenn architecture_notes
      Variante 1 verwirft. Variante 3 erfordert separate Zustimmung wegen größerer Schnittstelle.

      In allen Varianten:
      - Idempotenz von releaseScopeLock und releaseDbMigrationLock prüfen und ggf. in
        state-manager.ts dokumentieren (Kommentar) — KEINE Verhaltensänderung dort.
      - Falls audit-writer.ts erweitert werden muss: nur additive Events, keine Signaturänderungen.
      - Tests in system/control-plane/__tests__/dispatcher-fail-cleanup.test.ts die simulieren:
          a) Governance-Validator FAIL → Lock am Ende released
          b) Tool-Auth Block → Lock released
          c) Approval-Gate Block → Lock released
          d) Files-Scope-Violation → Lock released, WO-Status = failed
          e) Erfolgsfall unverändert: keine Doppel-Release-Fehler
      - Tests nutzen DispatcherDeps Mocks (callModel/executeTool), kein echter Spark-Call.
      - post_review_required: true setzen.
    </implement>

    <constraints>
      Kein neuer Bypass von Preflight oder Governance-Validator.
      Keine Erhöhung von MAX_REWRITE_LOOPS.
      Kein --force/--skip-cleanup Flag.
      Keine Direkt-Manipulation von runtime_state.json.
      Keine Direkt-Manipulation von system/state/*.jsonl.
      Keine Änderung an services/scheduler-api/.
      Keine Änderung an batch-loader.ts.
      Keine Änderung an governance-validator.ts (nicht in scope).
      Keine Änderung an scheduler-preflight.ts (nur Read).
      releaseScopeLock und releaseDbMigrationLock müssen idempotent bleiben — KEIN Verhalten ändern.
      Audit-Events nur über audit-writer.ts; kein direktes JSONL-Schreiben.
      Erfolgs-Pfad-Verhalten unverändert — bestehende Tests müssen ohne Änderung grün bleiben.
      post_review_required: true.
    </constraints>

    <on_error>
      Bei TypeScript-Fehler: {"status": "FAIL", "issues": ["tsc: ..."]}.
      Bei Breaking Change in dispatcher-Public-API erkannt: {"status": "ESCALATE"}.
      Bei nötigem Edit von state-manager.ts releaseScopeLock-Logik (außer Kommentaren): {"status": "ESCALATE", "issues": ["state-manager release logic change requires separate WO"]}.
      Bei nötigem Edit von services/scheduler-api/: {"status": "STOP"}.
      Bei nötigem Edit von batch-loader.ts: {"status": "STOP"}.
      Bei nötiger neuer npm-Dependency: {"status": "ESCALATE"}.
      Bei Migration / Schema-Änderung erkannt: {"status": "ESCALATE", "issues": ["route to db-migration-agent"]}.
      Bei Security-Befund: {"status": "STOP"}.
      Bei mehrdeutigem Cleanup-Pfad (Reihenfolge nicht ableitbar): {"status": "ESCALATE"}.
      Bei fehlendem Kontext: {"status": "BLOCKED"}.
    </on_error>
  </task>

scope_files:
  - "system/control-plane/dispatcher.ts"
  - "system/state/state-manager.ts"
  - "system/state/audit-writer.ts"
  - "system/control-plane/__tests__/dispatcher-fail-cleanup.test.ts"

context_files:
  - "system/control-plane/scheduler-preflight.ts"
  - "system/workorders/schemas/workorder.schema.json"
  - "system/workorders/lifecycle/wo_lifecycle_v1.md"
  - "system/workorders/nutrition/drafts/WO-GOVERNANCE-P1-005-orchestrator-intent-contract.md"
  - "system/workorders/nutrition/batches/BATCH-GOVERNANCE-P1-002-orchestrator-intent-contract.md"
  - "system/control-plane/__tests__/smoke-test.ts"
  - "system/control-plane/__tests__/scheduler-preflight.test.ts"
  - "system/workorders/nutrition/batches/BATCH-NUTRITION-P1-001-db-foundation.md"

acceptance_criteria:
  - "Scope-Lock wird auf JEDEM Dispatcher-FAIL-Pfad nach acquireScopeLock() zuverlässig freigegeben (try/finally oder äquivalent)"
  - "DB-Migration-Lock wird auf JEDEM Dispatcher-FAIL-Pfad nach acquireDbMigrationLock() zuverlässig freigegeben"
  - "active_workorders bleibt nach FAIL nicht in 'dispatched' oder 'running' — Status wird auf 'failed' aktualisiert vor Return"
  - "Jeder FAIL-Pfad schreibt mindestens ein Audit-Event über audit-writer.ts (auditJobFailed, writeAuditEvent oder spezifisches Event)"
  - "Erfolgsfall-Verhalten unverändert: bestehende dispatcher-Tests + smoke-test bleiben grün ohne Anpassung"
  - "Nach einem fehlgeschlagenen --run von Nutrition Batch 001 ist KEIN neuer stale Scope-Lock in runtime_state.json (manuelle Verifikation oder neuer Test)"
  - "Kein manuelles runtime_state.json-Cleanup mehr nötig nach Validator-FAIL oder Model-Error"
  - "MAX_REWRITE_LOOPS bleibt unverändert (2)"
  - "Kein --force / --skip-cleanup Flag eingeführt"
  - "Preflight-Checks unverändert"
  - "Governance-Validator-Aufruf-Stelle unverändert"
  - "pnpm tsc --noEmit clean"
  - "Bestehende Tests in system/control-plane/__tests__/ und system/state/__tests__/ bleiben grün"
  - "Neue Tests in system/control-plane/__tests__/dispatcher-fail-cleanup.test.ts decken mindestens 5 FAIL-Pfade ab (Validator FAIL, Validator BLOCKED, Tool-Auth Block, Files-Scope-Violation, Approval-Gate Block) und verifizieren Lock-Release"
  - "Audit-Trail (system/state/pipeline-audit.jsonl) zeigt Cleanup-Events nach FAIL nachvollziehbar (Verifikation per existierendem audit-writer; kein direkter JSONL-Edit)"

negative_constraints:
  - "NIEMALS außerhalb scope_files schreiben"
  - "NIEMALS runtime_state.json direkt editieren"
  - "NIEMALS system/state/*.jsonl direkt editieren"
  - "NIEMALS Preflight-Checks bypassen oder deaktivieren"
  - "NIEMALS Governance-Validator bypassen oder MAX_REWRITE_LOOPS erhöhen"
  - "NIEMALS batch-loader.ts ändern (out of scope)"
  - "NIEMALS services/scheduler-api/** ändern"
  - "NIEMALS scheduler-preflight.ts ändern (nur Read als context)"
  - "NIEMALS governance-validator.ts ändern (nicht in scope, separate WO-005)"
  - "NIEMALS ein --force / --skip-cleanup / --bypass Flag einbauen"
  - "NIEMALS Audit-History (pipeline-audit.jsonl, audit.jsonl) löschen oder rewriten"
  - "NIEMALS releaseScopeLock oder releaseDbMigrationLock Verhalten in state-manager.ts ändern (Idempotenz bewahren — nur Kommentare)"
  - "NIEMALS package.json um neue npm-Dependencies erweitern"
  - "NIEMALS bestehende Tests deaktivieren oder skip-pen"
  - "NIEMALS Workorder-Schema (system/workorders/schemas/workorder.schema.json) ändern"
  - "NIEMALS ENV-Dateien lesen oder schreiben"
  - "NIEMALS supabase db push oder supabase db reset ausführen"

files_blocked:
  - "services/scheduler-api/**"
  - "system/workorders/cli/**"
  - "system/approval/**"
  - "system/state/runtime_state.json"
  - "system/state/runtime_state.lock"
  - "system/state/audit.jsonl"
  - "system/state/audit.error.jsonl"
  - "system/state/pipeline-audit.jsonl"
  - "system/state/pipeline-audit-live.jsonl"
  - "apps/**"
  - "supabase/**"
  - ".env"
  - ".env.*"
  - "package.json"
  - "system/workorders/schemas/workorder.schema.json"
  - "system/control-plane/governance-validator.ts"
  - "system/control-plane/scheduler-preflight.ts"

validation_commands:
  - "pnpm tsc --noEmit"
  - "npx tsx --test system/control-plane/__tests__/"
  - "npx tsx --test system/state/__tests__/"

required_skills: ["gsd-v2"]
optional_skills: ["typescript-pro", "nodejs-best-practices", "debugging-strategies"]
blocked_by:      []
```

---

## Notes

- **Filename ↔ workorder_id:** Filename `WO-GOVERNANCE-P1-006-dispatcher-fail-cleanup.md` folgt der Auftrags-Convention; `workorder_id: WO-governance-006` folgt der Schema-Regex `^WO-[a-z]+-[0-9]+$`. Orchestrator/Scheduler nutzen das `workorder_id`-Feld.
- **`requires_approval: true`** ist Pflicht für `risk_category: architecture` per `CLAUDE.md` Cautious + High-Risk-Regel.
- **`rollback_hint` nicht erforderlich** per Schema if/then (nur bei `db-migration`).
- **Verhältnis zu WO-005:** Komplementär. WO-005 fixt die selected_agent-Lücke (Pipeline-FAIL-Vermeidung). WO-006 fixt die Cleanup-Lücke (FAIL-Folge-Cleanup). Beide WOs zusammen entkoppeln den Bootstrap-Test-Workflow von manuellem State-Cleanup.
- **`files_blocked`** schließt explizit die State-/Audit-JSONL- und runtime_state-Dateien aus — die werden indirekt über `state-manager.ts` und `audit-writer.ts` mutiert, nicht direkt.
- **`files_blocked`** schließt `governance-validator.ts` und `scheduler-preflight.ts` explizit aus — beide sind nur Read-Context, nicht Modifikations-Ziel.
- **`scope_files` enthält `state-manager.ts`** — aber per `<constraints>` darf dort nur **Kommentar/Doku** ergänzt werden (Idempotenz-Doku der release-Funktionen). Keine Verhaltensänderung. Audit-Writer kann additiv erweitert werden, aber nur ohne Signaturänderung bestehender Events.
- **Scope-Klarstellung:**
  - **Primary scope:** `system/control-plane/dispatcher.ts` + `system/control-plane/__tests__/dispatcher-fail-cleanup.test.ts` — hier findet die eigentliche Implementierung statt (Cleanup-Logik + Tests).
  - **Secondary scope:** `system/state/state-manager.ts` und `system/state/audit-writer.ts` — nur falls für die Cleanup-Logik bestehende Helper benötigt werden, die aktuell fehlen oder dokumentiert werden müssen. Keine Verhaltens- oder Signaturänderungen an bestehenden Funktionen.
- **Lifecycle-Pfad:** Erwartet `done` → `reviewed` (architecture-review + Spark D mandatory) → `closed`. Auto-Retry **deaktiviert** für `architecture` per `CLAUDE.md` High-Risk-Regel.
- **Bezug zur Geschichte:** Beobachtete stale Locks in unsere Workflow-Tests:
  - `RUN-20260502-3657` (callModel-Bug-FAIL) — manuell bereinigt
  - `RUN-20260502-5008` (Validator-FAIL "Unbekannter Agent") — manuell bereinigt + Scope-Lock manuell entfernt
  - `RUN-20260502-6627` (Validator-FAIL "Ungültiger risk_level") — aktuell stale, blockiert nächsten --run
  Nach Implementierung dieser WO sollten alle vier zukünftig automatisch bereinigt werden.

---

*Draft erzeugt: 2026-05-02 — gemäß `template_implementation_medium.md`, `wo_factory_prompt.md`, Workflow-Test-Befund-Sequenz, und WO-GOVERNANCE-P1-005 als Pattern-Vorlage.*
