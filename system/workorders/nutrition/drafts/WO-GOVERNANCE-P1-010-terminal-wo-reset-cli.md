# WO-GOVERNANCE-P1-010 — Terminal Workorder Reset CLI V1

**Status:** draft
**Phase:** 1 — Governance Tooling
**Source:** Workflow-Test-Befund Nutrition Batch 001 `--run` nach Closure von WO-005/006/007/008/009: `WO-nutrition-001` ist in `system/state/runtime_state.json` `active_workorders` als `status: failed` aus `RUN-20260503-8238` eingetragen. `scheduler-preflight.ts:144-146` rejectet jeden Re-Run als "WO ist terminal (failed)". Bisher mussten solche stale terminalen Einträge über manuelle State-Cleanup-Ausnahmen oder direkte JSON-Edits entfernt werden — das ist nicht dauerhaft akzeptabel und nicht audit-fähig.
**Template:** `system/workorders/templates/template_implementation_medium.md`
**Lifecycle:** `wo_generated` → `graph_validated` → `queue_released` → `ready` → `dispatched` → `running` → `done` → `reviewed` (architecture/Spark D mandatory) → `closed` (per `wo_lifecycle_v1.md`)

---

## Out of Scope

- `system_stop` Clear/Status (separate künftige WO `WO-governance-011-stop-rule-cli`).
- `scope_locks` Cleanup (separate künftige WO — bewusst nicht in dieser CLI).
- Approval-Queue-Tooling oder -Editierung.
- `batch-loader.ts` oder `system/workorders/cli/**` Änderungen.
- `dispatcher.ts` Cleanup-Logik (bereits in WO-006 abgedeckt).
- `risk_level` / `selected_agent`-Normalisierung (bereits in WO-005/009 abgedeckt).
- Nutrition-DB-Implementation oder Supabase-Migration-Execution.
- Approval-Auto-Granting.
- Automatische Cleanup-Logik im Dispatcher oder Preflight (bewusst manuell, operator-driven).
- Run-Summaries / Reports / Audit-Log-Bereinigung.
- Workorder-File-Modifikationen (`*.md` Drafts oder Batches).
- Schema-Erweiterung von `RuntimeState` oder `ActiveWorkorder`.

---

## Problem Statement

Nach Closure von WO-005/006/007/008/009 ist die Validator- und Dispatcher-Pipeline stabil: `tsc` PASS, `smoke-test.ts` 9/9 PASS, `dispatcher-fail-cleanup.test.ts` 9/9 PASS, Nutrition Batch 001 `--dry-run` READY_TO_RUN. Beim Pflicht-`--run`-Test während WO-009-Closure produzierte `WO-nutrition-001` jedoch keinen Validator-FAIL mehr (`risk_level: undefined` ist eliminiert), sondern einen **Preflight-REJECT** mit Reason "WO ist terminal (failed): WO-nutrition-001". Die Ursache: ein stale Eintrag in `system/state/runtime_state.json` `active_workorders`:

```json
{
  "workorder_id": "WO-nutrition-001",
  "run_id":       "RUN-20260503-8238",
  "agent_id":     "micro-executor",
  "status":       "failed",
  ...
}
```

`scheduler-preflight.ts:140-146` lehnt jeden Re-Run mit dieser `workorder_id` ab. Identisches Pattern haben wir während WO-005/006/007/008-Iterationen wiederholt manuell aufgelöst (mehrere Tom-autorisierte State-Cleanup-Ausnahmen; siehe Run-Notes der Batches 003-005).

**Architektonisches Defizit:**
- Es gibt aktuell keine offizielle Operator-CLI, um stale terminale `active_workorders`-Einträge anzuzeigen oder gezielt zu entfernen.
- Direktes `runtime_state.json`-Editing ist explizit verboten und nicht audit-fähig.
- Ad-hoc-Aufrufe von State-Manager-Funktionen via `npx tsx -e ...` sind nicht reproduzierbar, nicht parametrisiert und schreiben kein dediziertes Audit-Event.
- Jeder Workflow-Test-Failure verlangt damit eine wiederkehrende Tom-Aktion, die nicht in den normalen Operator-Flow gehört.

**Wirkung:**
- BATCH-NUTRITION-P1-001 `--run`-Iterationen erfordern Operator-Intervention zwischen den Versuchen.
- Künftige Workflow-Tests werden denselben Blocker reproduzieren.
- Audit-Trail über die Cleanup-Aktion fehlt — keine nachvollziehbare Historie, wer wann welche WO zurücksetzte.

**Ziel:** Eine schmale, sichere, auditfähige Operator-CLI, die nur explizite Cleanup-Operationen auf eindeutig identifizierten terminalen Einträgen erlaubt — ohne Bypass von Preflight, ohne Validator-Touchpunkt, ohne `system_stop`-Clear, ohne `scope_locks`-Cleanup, ohne Approval-Queue-Edit, ohne Audit-Log-Modifikation. Erweitert `state-manager.ts` minimal um zwei Helper (`getAllActiveWorkorders()`, `removeTerminalActiveWorkorder()`) und nutzt den existierenden `audit-writer.ts` für ein neues `'terminal_workorder_reset'`-Event (additive Erweiterung, keine Signatur-Änderung).

---

## Architekturentscheidung (verbindlich)

**Variante 1: Standalone-CLI + minimale State-Manager-Helper-Erweiterung (Default).**

Drei Komponenten:

1. **`system/control-plane/terminal-wo-reset-cli.ts` (neu)** — Standalone-CLI mit `tsx` ausführbar. Sub-Commands:
   - `list` — Read-only-Übersicht aller `active_workorders`, gruppiert nach Status.
   - `show <workorder_id>` — Read-only Detail-Inspektion eines spezifischen Eintrags.
   - `clear <workorder_id> --run-id <run_id> [--dry-run | --confirm]` — Cleanup-Operation. Default-Modus = `--dry-run` (Read-only-Vorschau). `--confirm` triggert die State-Mutation.
2. **`system/state/state-manager.ts` (additive Helper, keine Signatur-Änderung an existierenden Funktionen)** — zwei neue exportierte Funktionen:
   - `getAllActiveWorkorders(): ActiveWorkorder[]` — gibt eine read-only-Kopie von `s.active_workorders` zurück.
   - `removeTerminalActiveWorkorder(workorderId: string, runId: string): { removed: boolean; entry?: ActiveWorkorder; reason?: string }` — entfernt **genau einen** Eintrag mit exaktem `workorder_id`-und-`run_id`-Match, **NUR** wenn `entry.status ∈ {'failed','done','blocked'}`. Refused bei mehrdeutigem Match, bei nicht-terminaler Status, bei keinem Match. Atomic via existierendem `mutate()`-Lock-Pattern.
3. **`system/state/audit-writer.ts` (additive Helper)** — eine neue exportierte Convenience-Funktion `auditTerminalWorkorderReset(p)` analog zu `auditJobFailed` etc., die `writeAuditEvent({ event: 'terminal_workorder_reset', severity: 'warning', ...p })` aufruft. Kein neues `AuditEvent`-Schema-Feld nötig — `event`-String-Erweiterung reicht.

CLI-Sicherheits-Pflicht-Verhalten:
- Default ist Read-only. Mutation **nur** bei `clear ... --confirm`.
- `clear` verlangt **beide** Argumente (`<workorder_id>` + `--run-id <run_id>`) — kein Wildcard, kein Cleanup-aller-failed-WOs.
- `clear` lehnt nicht-terminale Status (`dispatched`, `running`, `awaiting_approval`, `review`) ab.
- `clear` lehnt mehrdeutige oder leere Matches ab.
- `clear` schreibt vor jeder Mutation ein Audit-Event über `auditTerminalWorkorderReset`.
- Kein `--force`-Flag, kein `--all`-Flag, kein `--bypass`-Flag.

Alternativen verworfen:
- **Variante 2: CLI als Sub-Command des `batch-loader`** — `batch-loader.ts` ist explizit out-of-scope (`files_blocked`); separate CLI hält den Operator-Flow klar getrennt von Workorder-Dispatch.
- **Variante 3: Auto-Cleanup im Preflight** — Preflight darf nicht mutieren (Single-Responsibility); jede automatische Cleanup-Logik würde die Schutzfunktion gegen Re-Run-of-failed-WOs aushebeln.
- **Variante 4: Erweiterung der existierenden `clearSystemStop()`-Pattern um eine generische "clear-all"-Helper** — zu breit; CLI fordert exakte WO+Run-Match.
- **Variante 5: Reset über Workorder-Lifecycle-Transition** — `failed → ready` ist in `wo_lifecycle_v1.md` nicht erlaubt; eine Reset-Aktion ist semantisch ein Cleanup, kein Lifecycle-Übergang. CLI entfernt den Eintrag aus `active_workorders`, sodass der nächste Dispatch ihn als "neue WO" behandelt.

In allen Varianten:
- `runtime_state.json` wird **NIE** direkt per File-Write editiert — alle Mutations laufen über `state-manager.ts`'s `mutate()`-Lock.
- Kein neuer Audit-Event-Schema-Edit; nur ein neuer `event`-String-Wert.
- Kein Eingriff in `dispatcher.ts`, `governance-validator.ts`, `scheduler-preflight.ts`, `review-pipeline.ts`, `system/workorders/cli/**`, `system/approval/**`, `services/scheduler-api/**`.
- Production-Default-Verhalten unverändert: ohne CLI-Aufruf bleibt jeder WO-/Lock-/Audit-Pfad bit-identisch.

---

## Workorder

```yaml
workorder_id: "WO-governance-010"
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
      - system/state/state-manager.ts
        (insbesondere: ActiveWorkorder-Interface, RuntimeState-Layout,
        mutate()/readState()-Pattern, startWorkorder/updateWorkorderStatus,
        clearSystemStop als Vorlage für eine atomic-Mutation-Funktion mit
        Audit-Anbindung)
      - system/state/audit-writer.ts
        (writeAuditEvent-Signatur, AuditEvent-Type, existierende Convenience-Funktionen
        wie auditJobFailed/auditScopeLockReleased als Pattern-Vorlage)
      - system/control-plane/scheduler-preflight.ts
        (Zeile 140-148: Terminal-Status-Reject-Logik — verstehen, welche Status
        Preflight als terminal blockiert: 'done', 'failed' explizit; CLI muss
        konsistent diese als Clear-Targets erlauben + zusätzlich 'blocked')
      - system/workorders/lifecycle/wo_lifecycle_v1.md
        (Terminal-Status-Definition; 'failed', 'done', 'closed', 'cancelled'
        als terminal; CLI sollte 'failed', 'done', 'blocked' erlauben — 'closed'/
        'cancelled' bewusst NICHT, da diese operativ abgeschlossene Endzustände sind)
      - system/workorders/schemas/workorder.schema.json (read-only Referenz)
      - system/workorders/nutrition/batches/BATCH-NUTRITION-P1-001-db-foundation.md
        (Test-Anwendungsfall — nach Cleanup soll dry-run weiterhin PASS bleiben)
      - system/workorders/nutrition/drafts/WO-NUTRITION-P1-001-audit-existing-state.md
        (konkrete WO, deren stale RUN-20260503-8238 die Motivation ist)
      - system/workorders/nutrition/drafts/WO-GOVERNANCE-P1-005-orchestrator-intent-contract.md
      - system/workorders/nutrition/drafts/WO-GOVERNANCE-P1-006-dispatcher-fail-cleanup.md
      - system/workorders/nutrition/drafts/WO-GOVERNANCE-P1-009-risk-level-normalization.md
        (Pattern-Vorlagen für architecture-WOs mit Audit-Event-Wiederverwendung)

      Identifiziere die exakten Stellen und neuen Komponenten:
        - state-manager.ts: existierende read/mutate-Helper-Pattern; neue Helper
          getAllActiveWorkorders() und removeTerminalActiveWorkorder() platzieren
          (bevorzugt nahe updateWorkorderStatus, ~Zeile 297 ff).
        - audit-writer.ts: neue Convenience-Funktion auditTerminalWorkorderReset
          analog zu auditScopeLockReleased; AuditEvent-Type ggf. um event-String-
          Literal erweitern (additiv, keine Pflichtfeld-Änderung).
        - terminal-wo-reset-cli.ts: argv-Parser, Sub-Command-Dispatch, Output-
          Formatter; nutzt EXKLUSIV state-manager.ts und audit-writer.ts für
          alle Datenoperationen.
        - terminal-wo-reset-cli.test.ts: Test-Setup mit process.chdir auf temp-Dir
          (Pattern aus dispatcher-fail-cleanup.test.ts), node:test describe/it.

      Verstehe die CLI-Interaktion mit clearSystemStop()-Pattern als Inspiration:
      offizielle State-Manager-Funktion + atomic mutate + Audit. Aber CLI-spezifisch:
        - Mutation darf nur via Sub-Command 'clear ... --confirm' geschehen.
        - 'list' und 'show' und 'clear ... --dry-run' sind read-only.
        - Exit-Codes: 0 = success, 1 = invalid usage / refused, 2 = no match / ambiguous.

      Schreibe architecture_notes mit gewählter Variante (Variante 1 = Default).
      Bestätige, dass:
        - dispatcher.ts / governance-validator.ts / scheduler-preflight.ts / review-pipeline.ts UNVERÄNDERT bleiben.
        - runtime_state.json NIE direkt per File-Write editiert wird (auch nicht im CLI).
        - kein --force / --all / --bypass Flag eingeführt wird.
        - kein scope_lock und kein system_stop in dieser CLI berührt wird.
    </analyze>

    <implement>
      Implementiere Variante 1 (Standalone-CLI + minimale State-Manager- und
      Audit-Writer-Erweiterung).

      Schritt 1 — state-manager.ts: zwei neue exportierte Helper.

        /**
         * Read-only-Kopie aller active_workorders-Einträge (für CLI-Inspektion).
         * Mutiert State NICHT.
         */
        export function getAllActiveWorkorders(): ActiveWorkorder[] {
          return [...readState().active_workorders]
        }

        /**
         * Entfernt GENAU einen active_workorders-Eintrag mit exaktem
         * workorder_id-und-run_id-Match. Refused wenn:
         *   - kein Match gefunden
         *   - mehr als ein Match gefunden
         *   - status nicht in {'failed','done','blocked'}
         * Atomic via mutate()-Lock. Idempotent: zweiter Aufruf nach erfolgreichem
         * Remove gibt { removed: false, reason: 'no match' } zurück.
         */
        export async function removeTerminalActiveWorkorder(
          workorderId: string,
          runId: string,
        ): Promise<{ removed: boolean; entry?: ActiveWorkorder; reason?: string }> {
          const TERMINAL_CLEARABLE: ReadonlySet<ActiveWorkorder['status']> =
            new Set(['failed', 'done', 'blocked'])

          let outcome: { removed: boolean; entry?: ActiveWorkorder; reason?: string } = {
            removed: false,
            reason:  'unknown',
          }

          await mutate(s => {
            const matches = s.active_workorders.filter(
              w => w.workorder_id === workorderId && w.run_id === runId,
            )
            if (matches.length === 0) {
              outcome = { removed: false, reason: 'no match' }
              return
            }
            if (matches.length > 1) {
              outcome = { removed: false, reason: `ambiguous match (${matches.length})` }
              return
            }
            const target = matches[0]
            if (!TERMINAL_CLEARABLE.has(target.status)) {
              outcome = {
                removed: false,
                entry:   target,
                reason:  `non-terminal status: ${target.status}`,
              }
              return
            }
            s.active_workorders = s.active_workorders.filter(
              w => !(w.workorder_id === workorderId && w.run_id === runId),
            )
            outcome = { removed: true, entry: target }
          })

          return outcome
        }

      KEINE Änderung an existierenden state-manager-Funktionen. KEINE Mutation
      von scope_locks, db_migration_lock, system_stop, approvals, audit_tokens,
      active_runs in diesen Helpern.

      Schritt 2 — audit-writer.ts: neue Convenience-Funktion.

        export const auditTerminalWorkorderReset = (
          p: Base & Pick<AuditEvent, 'reason'>,
        ) =>
          writeAuditEvent({
            event: 'terminal_workorder_reset',
            severity: 'warning',
            ...p,
          })

      Falls AuditEvent.event als Union-Typ enumeriert ist (statt freier String),
      Union additiv um 'terminal_workorder_reset' erweitern. Wenn AuditEvent als
      free-form-String typisiert ist, keine Type-Anpassung nötig.

      Schritt 3 — terminal-wo-reset-cli.ts: neuer Standalone-CLI-Entry-Point.

      CLI-Verhalten (siehe Architekturentscheidung):
        - `list` → console.table-formatierte Liste, gruppiert nach Status.
          Exit 0 immer.
        - `show <workorder_id>` → Detail-JSON eines passenden Eintrags
          (oder Hinweis bei mehreren Matches mit Auflistung der run_ids).
          Exit 0 bei Match, Exit 2 bei keinem Match.
        - `clear <workorder_id> --run-id <run_id> --dry-run`:
            - Lädt Eintrag, zeigt was entfernt würde, mutiert NICHTS, schreibt
              KEIN Audit-Event.
            - Exit 0 bei terminalem Match (würde-cleanup-Vorschau).
            - Exit 1 bei nicht-terminal / mehrdeutig / kein Match (Refusal mit Reason).
        - `clear <workorder_id> --run-id <run_id> --confirm`:
            - Schreibt VOR der Mutation ein Audit-Event via
              auditTerminalWorkorderReset (event_id, run_id, workorder_id,
              reason: 'operator-initiated cleanup of terminal active_workorders entry').
            - Ruft removeTerminalActiveWorkorder auf.
            - Bei outcome.removed===true: Exit 0 mit Confirmation.
            - Bei outcome.removed===false: Exit 1 mit reason.
        - Ohne Sub-Command: Hilfe-Text + Exit 1.
        - Ohne --dry-run UND ohne --confirm bei `clear`: Default = --dry-run (sicher).

      ABSOLUTE VERBOTE im CLI-Implementer-Code:
        - KEIN fs.writeFileSync auf runtime_state.json oder *.jsonl.
        - KEIN direktes Editieren von approval-tokens, scope_locks, system_stop.
        - KEIN Aufruf von triggerSystemStop / clearSystemStop / acquireScopeLock /
          releaseScopeLock / startRun / endRun.
        - KEINE neuen npm-Dependencies (verwende nur node:fs/path/process/util und
          state-manager + audit-writer).
        - KEIN child_process.exec / spawn.

      Schritt 4 — terminal-wo-reset-cli.test.ts: dedicated Tests.

      Test-Setup (Pattern aus dispatcher-fail-cleanup.test.ts):
        - process.chdir auf TEST_DIR mit minimaler runtime_state.json-Struktur.
        - Pre-populate active_workorders mit 4 Test-Einträgen:
            (a) WO-test-001 / RUN-001 / status: failed   (terminal — clearable)
            (b) WO-test-002 / RUN-002 / status: done     (terminal — clearable)
            (c) WO-test-003 / RUN-003 / status: blocked  (terminal — clearable)
            (d) WO-test-004 / RUN-004 / status: dispatched (non-terminal — refuse)

      Test-Cases (mindestens):
        1. getAllActiveWorkorders() liefert alle 4 Einträge.
        2. removeTerminalActiveWorkorder('WO-test-001', 'RUN-001') → removed:true.
        3. Doppelter Aufruf removeTerminalActiveWorkorder('WO-test-001', 'RUN-001')
           → removed:false, reason:'no match' (Idempotenz).
        4. removeTerminalActiveWorkorder('WO-test-004', 'RUN-004')
           → removed:false, reason enthält 'non-terminal'.
        5. Non-existenter (workorder_id, run_id) → removed:false, reason:'no match'.
        6. Manuelle Pre-population mit zwei Einträgen für gleiches (wo, run) →
           removed:false, reason enthält 'ambiguous'.
        7. CLI: list-Sub-Command via spawn(`tsx terminal-wo-reset-cli.ts list`)
           → Exit 0, Output enthält alle workorder_ids.
        8. CLI: clear --dry-run mutiert NICHT (active_workorders unverändert).
        9. CLI: clear --confirm mutiert (active_workorders ohne den Eintrag).
        10. CLI: clear ohne --run-id refused (Exit 1).
        11. CLI: clear gegen non-terminal status refused (Exit 1).
        12. Audit-File enthält 'terminal_workorder_reset'-Event nur nach --confirm.

      Tests verwenden node:test describe/it, kein Vitest, keine neuen Dependencies.

      Final:
        - pnpm tsc --noEmit muss clean sein.
        - npx tsx --test system/control-plane/__tests__/terminal-wo-reset-cli.test.ts
          → all PASS.
        - npx tsx system/control-plane/terminal-wo-reset-cli.ts list
          → Exit 0 (auf live runtime_state.json).
        - npx tsx system/control-plane/terminal-wo-reset-cli.ts clear WO-nutrition-001
          --run-id RUN-20260503-8238 --dry-run
          → Exit 0, Vorschau "would remove 1 entry: status=failed", State unverändert.
        - Nutrition Batch 001 --dry-run → READY_TO_RUN bleibt.
        - post_review_required: true.

      Implementer führt KEINEN tatsächlichen --confirm-Cleanup im Rahmen dieser
      WO aus. Das ist eine Tom-Aktion nach Approval von Spark-D-Review und
      Closure dieser WO.
    </implement>

    <constraints>
      Kein Bypass von Preflight oder Governance-Validator.
      Keine Erhöhung von MAX_REWRITE_LOOPS.
      Kein --force / --all / --bypass / --skip-validator Flag.
      Keine Direkt-Manipulation von runtime_state.json per fs.writeFileSync — alle
        Mutations laufen über state-manager.ts mutate()-Lock.
      Keine Direkt-Manipulation von system/state/*.jsonl (audit-Logs).
      Keine Änderung an dispatcher.ts.
      Keine Änderung an governance-validator.ts.
      Keine Änderung an scheduler-preflight.ts.
      Keine Änderung an review-pipeline.ts.
      Keine Änderung an batch-loader.ts oder system/workorders/cli/**.
      Keine Änderung an services/scheduler-api/**.
      Keine Änderung an workorder.schema.json oder risk-categories.ts.
      Keine Mutation von approval-Queue-Dateien (system/approval/**).
      Kein system_stop berühren (kein triggerSystemStop, kein clearSystemStop-Aufruf).
      Kein scope_locks berühren (kein acquire/release).
      Kein Workorder-File (.md) modifizieren.
      Keine neuen npm-Dependencies; package.json unverändert.
      Default-Modus von 'clear' ohne explizites Flag = --dry-run (sicher).
      Mutation NUR mit explizitem --confirm.
      Audit-Event NUR vor erfolgreicher Mutation; Dry-Run schreibt KEIN Audit.
      post_review_required: true.
    </constraints>

    <on_error>
      Bei TypeScript-Fehler: {"status": "FAIL", "issues": ["tsc: ..."]}.
      Bei Breaking Change in state-manager-Public-API erkannt
        (z. B. Signaturänderung an existierenden Funktionen): {"status": "ESCALATE"}.
      Bei nötigem Edit von dispatcher.ts: {"status": "STOP"}.
      Bei nötigem Edit von governance-validator.ts: {"status": "STOP"}.
      Bei nötigem Edit von scheduler-preflight.ts: {"status": "STOP"}.
      Bei nötigem Edit von services/scheduler-api/**: {"status": "STOP"}.
      Bei nötigem Edit von batch-loader.ts: {"status": "STOP"}.
      Bei nötigem Edit von workorder.schema.json: {"status": "STOP"}.
      Bei nötiger neuer npm-Dependency: {"status": "ESCALATE"}.
      Bei Migration / Schema-Änderung erkannt: {"status": "ESCALATE", "issues": ["route to db-migration-agent"]}.
      Bei Security-Befund (z. B. Cleanup einer security-WO): {"status": "STOP"}.
      Bei rotem Test nach Anpassung: {"status": "FAIL", "issues": ["test: <name> — actual=<x> expected=<y>"]}.
      Bei Notwendigkeit, system_stop oder scope_locks zu berühren: {"status": "ESCALATE", "issues": ["out of WO-010 scope — separate WO"]}.
      Bei mehrdeutigem Refusal-Verhalten (z. B. ambiguous match unklar): {"status": "ESCALATE"}.
      Bei fehlendem Kontext: {"status": "BLOCKED"}.
    </on_error>
  </task>

scope_files:
  - "system/control-plane/terminal-wo-reset-cli.ts"
  - "system/state/state-manager.ts"
  - "system/state/audit-writer.ts"
  - "system/control-plane/__tests__/terminal-wo-reset-cli.test.ts"

context_files:
  - "system/control-plane/scheduler-preflight.ts"
  - "system/control-plane/__tests__/dispatcher-fail-cleanup.test.ts"
  - "system/workorders/schemas/workorder.schema.json"
  - "system/workorders/lifecycle/wo_lifecycle_v1.md"
  - "system/workorders/nutrition/batches/BATCH-NUTRITION-P1-001-db-foundation.md"
  - "system/workorders/nutrition/drafts/WO-NUTRITION-P1-001-audit-existing-state.md"
  - "system/workorders/nutrition/drafts/WO-GOVERNANCE-P1-005-orchestrator-intent-contract.md"
  - "system/workorders/nutrition/drafts/WO-GOVERNANCE-P1-006-dispatcher-fail-cleanup.md"
  - "system/workorders/nutrition/drafts/WO-GOVERNANCE-P1-009-risk-level-normalization.md"

acceptance_criteria:
  - "Neue exportierte Funktion getAllActiveWorkorders(): ActiveWorkorder[] in state-manager.ts liefert read-only-Kopie aller active_workorders-Einträge"
  - "Neue exportierte Funktion removeTerminalActiveWorkorder(workorderId, runId) in state-manager.ts entfernt GENAU einen Eintrag bei exaktem Match und terminalem Status (failed|done|blocked)"
  - "removeTerminalActiveWorkorder verweigert Mutation und liefert reason bei: kein Match, mehrdeutigem Match (>1), nicht-terminalem Status"
  - "removeTerminalActiveWorkorder mutiert NUR active_workorders — keine Berührung von scope_locks, db_migration_lock, system_stop, approvals, audit_tokens, active_runs"
  - "Bestehende state-manager.ts-Funktionen bleiben in Signatur und Verhalten unverändert"
  - "Neue Convenience-Funktion auditTerminalWorkorderReset in audit-writer.ts schreibt event 'terminal_workorder_reset' via writeAuditEvent (kein direkter JSONL-Edit)"
  - "Bestehende audit-writer-Convenience-Funktionen bleiben unverändert (keine Signatur-Änderung)"
  - "Neue CLI system/control-plane/terminal-wo-reset-cli.ts unterstützt Sub-Commands: list, show <workorder_id>, clear <workorder_id> --run-id <run_id> [--dry-run | --confirm]"
  - "CLI 'list' ist read-only und gibt active_workorders gruppiert nach Status aus"
  - "CLI 'show <workorder_id>' ist read-only und gibt Detail-Information; Exit 2 bei keinem Match"
  - "CLI 'clear ... --dry-run' ist read-only — KEIN Audit-Event, KEINE State-Mutation"
  - "CLI 'clear ... --confirm' schreibt Audit-Event via auditTerminalWorkorderReset VOR der Mutation"
  - "CLI 'clear' ohne --confirm UND ohne --dry-run defaults zu --dry-run-Verhalten (sicher)"
  - "CLI 'clear' verlangt sowohl <workorder_id> als auch --run-id <run_id> als Pflicht-Argumente"
  - "CLI verweigert clear bei nicht-terminalem Status (dispatched/running/awaiting_approval/review) mit klarem Refusal-Output und Exit 1"
  - "CLI verweigert clear bei mehrdeutigem Match mit Exit 1"
  - "CLI verweigert clear bei keinem Match mit Exit 2"
  - "CLI verweigert unbekannte Sub-Commands mit Exit 1 und Hilfe-Text"
  - "CLI editiert NIEMALS runtime_state.json direkt per fs.writeFileSync — alle Mutations über state-manager.ts"
  - "CLI editiert NIEMALS system/state/*.jsonl direkt — alle Audit-Events über audit-writer.ts"
  - "CLI berührt NIEMALS approval queue (system/approval/**)"
  - "CLI berührt NIEMALS system_stop (kein triggerSystemStop, kein clearSystemStop)"
  - "CLI berührt NIEMALS scope_locks (kein acquire/release)"
  - "CLI führt KEINE Workorders aus (kein dispatchWorkorder-Aufruf, kein run-batch-Aufruf)"
  - "CLI führt KEINE Migrationen aus (kein supabase-Befehl, kein db-migration-Lock)"
  - "Kein --force / --all / --bypass / --skip-validator Flag eingeführt"
  - "Keine neuen npm-Dependencies; package.json unverändert"
  - "Keine Änderung an dispatcher.ts, governance-validator.ts, scheduler-preflight.ts, review-pipeline.ts, batch-loader.ts, services/scheduler-api/**, workorder.schema.json, risk-categories.ts"
  - "Tests in system/control-plane/__tests__/terminal-wo-reset-cli.test.ts decken mindestens 12 Szenarien ab (siehe Implement-Block) und sind alle grün"
  - "pnpm tsc --noEmit clean"
  - "npx tsx --test system/control-plane/__tests__/terminal-wo-reset-cli.test.ts → all PASS"
  - "npx tsx system/control-plane/terminal-wo-reset-cli.ts list → Exit 0 mit korrekter Ausgabe"
  - "npx tsx system/control-plane/terminal-wo-reset-cli.ts clear WO-nutrition-001 --run-id RUN-20260503-8238 --dry-run → Exit 0, Vorschau zeigt 1 zu entfernenden Eintrag, State unverändert (verifiziert via getAllActiveWorkorders)"
  - "Nach Closure dieser WO: Nutrition Batch 001 --dry-run bleibt READY_TO_RUN"
  - "smoke-test.ts bleibt 9/9 PASS (read-only-Verifikation)"
  - "dispatcher-fail-cleanup.test.ts bleibt 9/9 PASS (read-only-Verifikation)"

negative_constraints:
  - "NIEMALS außerhalb scope_files schreiben"
  - "NIEMALS runtime_state.json direkt per fs.writeFileSync editieren — nur über state-manager.ts mutate()"
  - "NIEMALS system/state/*.jsonl direkt editieren — nur über audit-writer.ts"
  - "NIEMALS approval-Queue-Dateien (system/approval/**) editieren"
  - "NIEMALS system_stop berühren (kein triggerSystemStop / clearSystemStop in dieser CLI)"
  - "NIEMALS scope_locks berühren (kein acquire/release in dieser CLI)"
  - "NIEMALS Workorders ausführen (kein dispatchWorkorder, kein run-batch-Aufruf)"
  - "NIEMALS Migrationen ausführen oder Supabase-Befehle ausführen"
  - "NIEMALS Workorder-Files (*.md) modifizieren"
  - "NIEMALS dispatcher.ts ändern"
  - "NIEMALS governance-validator.ts ändern"
  - "NIEMALS scheduler-preflight.ts ändern"
  - "NIEMALS review-pipeline.ts ändern"
  - "NIEMALS batch-loader.ts oder system/workorders/cli/** ändern"
  - "NIEMALS services/scheduler-api/** ändern"
  - "NIEMALS risk-categories.ts ändern"
  - "NIEMALS workorder.schema.json ändern"
  - "NIEMALS Validator umgehen oder MAX_REWRITE_LOOPS erhöhen"
  - "NIEMALS bestehende state-manager-Funktionen in Signatur oder Verhalten ändern (nur ADDITIVE Helper)"
  - "NIEMALS bestehende audit-writer-Convenience-Funktionen in Signatur ändern (nur ADDITIVE Helper)"
  - "NIEMALS ein --force / --all / --bypass / --skip-validator Flag einbauen"
  - "NIEMALS broad cleanup ohne exaktes (workorder_id, run_id)-Paar zulassen"
  - "NIEMALS nicht-terminale Workorders (dispatched/running/awaiting_approval/review) löschen"
  - "NIEMALS Audit-Event vor Dry-Run schreiben (Audit NUR bei --confirm + erfolgreicher Mutation)"
  - "NIEMALS package.json ändern"
  - "NIEMALS neue npm-Dependencies hinzufügen"
  - "NIEMALS bestehende Tests deaktivieren oder skip-pen (xtest/it.skip/test.skip/xit)"
  - "NIEMALS ENV-Dateien lesen oder schreiben"
  - "NIEMALS child_process.exec/spawn im CLI-Body verwenden (nur über node:test im Test-File)"

files_blocked:
  - "services/scheduler-api/**"
  - "system/workorders/cli/**"
  - "system/approval/**"
  - "system/control-plane/dispatcher.ts"
  - "system/control-plane/governance-validator.ts"
  - "system/control-plane/scheduler-preflight.ts"
  - "system/control-plane/review-pipeline.ts"
  - "system/control-plane/risk-categories.ts"
  - "system/state/runtime_state.json"
  - "system/state/runtime_state.lock"
  - "system/state/audit.jsonl"
  - "system/state/audit.error.jsonl"
  - "system/state/pipeline-audit.jsonl"
  - "system/state/pipeline-audit-live.jsonl"
  - "system/workorders/schemas/**"
  - "apps/**"
  - "supabase/**"
  - "package.json"
  - ".env"
  - ".env.*"

validation_commands:
  - "pnpm tsc --noEmit"
  - "npx tsx --test system/control-plane/__tests__/terminal-wo-reset-cli.test.ts"
  - "npx tsx system/control-plane/terminal-wo-reset-cli.ts list"
  - "npx tsx system/control-plane/terminal-wo-reset-cli.ts clear WO-nutrition-001 --run-id RUN-20260503-8238 --dry-run"
  - "npx tsx system/workorders/cli/run-batch.ts system/workorders/nutrition/batches/BATCH-NUTRITION-P1-001-db-foundation.md --dry-run"

required_skills: ["gsd-v2"]
optional_skills: ["typescript-pro", "nodejs-best-practices", "debugging-strategies"]
blocked_by:      []
```

---

## Notes

- **Filename ↔ workorder_id:** Filename `WO-GOVERNANCE-P1-010-terminal-wo-reset-cli.md` folgt der Auftrags-Convention; `workorder_id: WO-governance-010` folgt der Schema-Regex `^WO-[a-z]+-[0-9]+$`. Orchestrator/Scheduler nutzen das `workorder_id`-Feld.
- **`requires_approval: true`** ist Pflicht für `risk_category: architecture` per `CLAUDE.md` Cautious-Regel (Spark D mandatory, kein Auto-Retry).
- **`agent_id: senior-coding-agent`** — registriert in `system/agent-registry/agents.json`, `type: executor_senior`. Wird durch `AGENT_VALIDATOR_MAP['senior-coding-agent'] = 'micro-executor'` (WO-005) korrekt zu `ALLOWED_AGENTS`-Wert normalisiert. `risk_level` wird via WO-009-Mapping auf `'medium'` normalisiert.
- **`rollback_hint` nicht erforderlich** per Schema if/then (nur bei `db-migration`).
- **Verhältnis zu WO-005 / WO-006 / WO-007 / WO-008 / WO-009:**
  - WO-005/009 normalisieren OrchestratorIntent-Felder (Validator-Pipeline-FAIL-Vermeidung).
  - WO-006 sorgt für Lock-Release auf FAIL-Pfaden.
  - WO-007/008 modernisieren Smoke-Tests + Reviewer-Injection.
  - **WO-010** schließt den Operator-Workflow-Gap: bietet eine offizielle, audit-fähige CLI für die wiederkehrende Cleanup-Aufgabe nach FAIL-Iterationen — Tom muss nicht mehr ad-hoc `npx tsx -e ...`-Aufrufe machen oder State-Cleanup-Ausnahmen autorisieren.
- **Architekturentscheidung für `'failed' | 'done' | 'blocked'` als clearable:** Diese drei Status sind in `wo_lifecycle_v1.md` als terminal-aber-nicht-finally definiert (`done` ist technisch fertig aber operativ noch nicht abgeschlossen; `failed` ist Fehlerausgang; `blocked` ist eine Pre-Execution-Refusal). `closed` und `cancelled` sind operativ-finale Endzustände — diese soll die CLI bewusst NICHT clearen, weil das die Audit-Historie verzerren würde. Wenn ein WO in `closed` oder `cancelled` ist, gehört der Eintrag zur Run-History, nicht zur stale-Bereinigung.
- **`scope_files` enthält 4 Files** — neue CLI + 2 erweiterte State/Audit-Files + neue Test-Datei. Konsistent mit `template_implementation_medium.md` (3-15 Files erlaubt).
- **`files_blocked` schließt `runtime_state.json` und `*.jsonl`-Audit-Logs explizit aus** — alle Mutations nur über `state-manager.ts` und `audit-writer.ts`. Das ist die zentrale Sicherheits-Garantie.
- **`files_blocked` schließt `dispatcher.ts`, `governance-validator.ts`, `scheduler-preflight.ts`, `review-pipeline.ts`, `risk-categories.ts`, `workorder.schema.json`, `services/scheduler-api/**`, `system/workorders/cli/**` aus** — die CLI ist ein neuer, unabhängiger Operator-Touchpoint, nicht eine Erweiterung bestehender Pipelines.
- **Audit-Event `'terminal_workorder_reset'`** ist additive Erweiterung des `event`-Strings — falls `AuditEvent.event` als Union-Typ existiert, wird er additiv erweitert (keine Breaking-Change). Convenience-Funktion `auditTerminalWorkorderReset` analog zu `auditScopeLockReleased` aus WO-006.
- **Lifecycle-Pfad:** Erwartet `done` → `reviewed` (architecture-review + Spark D mandatory) → `closed`. Auto-Retry **deaktiviert** für `architecture` per `CLAUDE.md` High-Risk-Regel.
- **Bezug zur Geschichte:**
  - Manuelle State-Cleanup-Ausnahmen während WO-005/006/007/008-Iterationen: `RUN-20260502-3657`, `RUN-20260502-5008`, `RUN-20260502-6627`, `RUN-20260502-7276`, `RUN-20260502-9507` — alle ad-hoc per State-Cleanup-Agent oder direktem JSON-Edit (nicht-audit-fähig, nicht-reproduzierbar).
  - Aktuell stale: `WO-nutrition-001` / `RUN-20260503-8238` (status: failed) blockiert Re-Run von BATCH-NUTRITION-P1-001.
  - Post-WO-010-Erwartung: Tom führt `npx tsx system/control-plane/terminal-wo-reset-cli.ts clear WO-nutrition-001 --run-id RUN-20260503-8238 --dry-run` (Vorschau), dann `... --confirm` (mit Audit-Event). Anschließend re-runt BATCH-NUTRITION-P1-001 ohne weitere Operator-Intervention (sofern WO-009 alle Validator-FAILs verhindert).
- **Scope-Klarstellung:**
  - **Primary scope:** `terminal-wo-reset-cli.ts` (neue CLI) + `terminal-wo-reset-cli.test.ts` (neue Tests).
  - **Secondary scope:** `state-manager.ts` (zwei additive Helper) und `audit-writer.ts` (eine additive Convenience-Funktion). Keine Verhaltens- oder Signatur-Änderung an existierenden Funktionen.
- **Production-Default Verhalten unverändert:** Die CLI ist ein optionaler Operator-Touchpoint. Ohne CLI-Aufruf bleibt der gesamte Dispatch-/Preflight-/Validator-/Audit-Pfad bit-identisch.
- **Tom darf nicht selbst granten** — die WO-Approval folgt dem normalen Spark-D-Mandatory-Review-Flow.

---

*Draft erzeugt: 2026-05-03 — gemäß `template_implementation_medium.md`, `wo_factory_prompt.md`, Workflow-Test-Befund-Sequenz nach WO-009-Closure (stale `RUN-20260503-8238`-Blocker), und WO-GOVERNANCE-P1-006 + WO-GOVERNANCE-P1-009 als Pattern-Vorlagen.*
