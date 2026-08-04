# WO-GOVERNANCE-P1-015 — State History Cleanup (Stale Dispatched) V1

**Status:** closed
**Phase:** 1 — Governance Tooling
**Source:** Workflow-Test-Befund Nutrition Batch 001 `--run` nach Closure von WO-005/006/007/008/009/010/011/012/013/014: `WO-nutrition-001` läuft erfolgreich durch den `no-tool-request completed`-Pfad, Lock-Release durch WO-014 funktioniert, **aber WO-nutrition-002 trifft weiterhin Preflight HOLD**. Ursache (per `terminal-wo-reset-cli.ts show WO-nutrition-001` verifiziert): 6 historische `active_workorders`-Einträge für WO-nutrition-001 mit Status `dispatched` (4×) und `failed` (2×) — Run-IDs: `RUN-20260502-6627`, `RUN-20260503-8238`, `RUN-20260503-1044`, `RUN-20260503-8969`, `RUN-20260503-7133`, `RUN-20260503-6009`. Die `failed`-Einträge sind via WO-010 clearable; die 4 `dispatched`-Einträge sind nicht clearable (WO-010 erlaubt nur `failed|done` per `TERMINAL_CLEARABLE`-Gate in `state-manager.ts:327-328`) — bewusst so, um laufende Workorders zu schützen. Diese 4 Einträge sind aber **nicht mehr wirklich laufend** (kein zugehöriger `active_runs`-Eintrag in `'running'`-Status, dispatched_at ist > 1 h alt). Sie blockieren `blocked_by`-/Preflight-Resolution für Folge-WOs auf Dauer.
**Template:** `system/workorders/templates/template_implementation_medium.md`
**Lifecycle:** `wo_generated` → `graph_validated` → `queue_released` → `ready` → `dispatched` → `running` → `done` → `reviewed` (architecture/Spark D mandatory) → `closed` (per `wo_lifecycle_v1.md`)

---

## Out of Scope

- `system_stop` Clear/Status (separate Followup `WO-016-stop-rule-cli`).
- `scope_locks` Cleanup-CLI (separate künftige WO — bewusst nicht Teil von Operator-State-Tools).
- Approval-Queue-Tooling oder -Editierung.
- `batch-loader.ts` oder `system/workorders/cli/**` Änderungen.
- `dispatcher.ts` Cleanup-Logik (bereits in WO-006/011/014 abgedeckt — bleibt 1:1).
- `scheduler-preflight.ts` Verhalten ändern (Preflight bleibt strict; CLI ist Operator-Cleanup, kein Auto-Cleanup im Preflight).
- `risk-categories.ts` Änderungen.
- `governance-validator.ts` Änderungen.
- `review-pipeline.ts` Änderungen.
- Validator-Strenge-Änderungen.
- Schema-Erweiterung von `RuntimeState` oder `ActiveWorkorder` (`status`-Union bleibt 1:1).
- Lifecycle-Transition-Tabelle (`WO_TRANSITIONS`) ändern.
- WO-010 Default-`failed|done`-Clear-Verhalten lockern.
- Auto-Cleanup bei Dispatcher-Start oder Preflight-Fail.
- Workorder-File-Modifikationen (`*.md` Drafts oder Batches).
- Nutrition-DB-Implementation oder Supabase-Migration-Execution.
- Approval-Auto-Granting.

---

## Problem Statement

Nutrition Batch 001 Final Workflow Test nach Closure WO-014 (commit `b681402`):
- `pnpm tsc --noEmit` PASS.
- `npx tsx system/control-plane/__tests__/smoke-test.ts` 9/9 PASS.
- `npx tsx --test system/control-plane/__tests__/dispatcher-fail-cleanup.test.ts` 32/32 PASS.
- Dry-run READY_TO_RUN.
- `WO-nutrition-001 [dispatched] Dispatcher status: completed` — Lock wird durch WO-014 freigegeben.
- `WO-nutrition-002 [preflight_blocked] Preflight HOLD` — weiterhin.
- Approval Queue: 0 Pending Approvals.

Per `npx tsx system/control-plane/terminal-wo-reset-cli.ts show WO-nutrition-001`:

```text
Found 6 entry/entries for workorder_id=WO-nutrition-001:
  RUN-20260502-6627  status: dispatched  dispatched_at: 2026-05-02T09:35:46.646Z
  RUN-20260503-8238  status: dispatched  dispatched_at: 2026-05-03T04:35:18.255Z
  RUN-20260503-7133  status: failed      dispatched_at: 2026-05-03T07:59:07.152Z
  RUN-20260503-6009  status: failed      dispatched_at: 2026-05-03T08:29:46.030Z
  RUN-20260503-1044  status: dispatched  dispatched_at: 2026-05-03T09:35:41.062Z
  RUN-20260503-8969  status: dispatched  dispatched_at: 2026-05-03T10:18:38.988Z
```

Die zwei `failed`-Einträge sind per WO-010 (`clear --confirm`) bereinigbar. Die vier `dispatched`-Einträge sind per `TERMINAL_CLEARABLE = new Set(['failed','done'])` (`state-manager.ts:327-328`) **bewusst NICHT clearable** — Schutz gegen Operator-Fehler, der einen wirklich laufenden Workorder zerstören würde.

**Architektonisches Defizit:**
- Es gibt **kein audit-fähiges Operator-Tooling**, um historisch-stale `dispatched`-Einträge zu bereinigen, deren zugehöriger Run **nachweislich nicht mehr läuft**.
- "Nachweislich nicht mehr laufend" ist objektiv prüfbar:
  - **Evidence A:** Es existiert ein `active_runs`-Eintrag mit gleichem `run_id` und terminalem Status (`'completed' | 'failed' | 'blocked'`).
  - **Evidence B:** Es existiert **kein** `active_runs`-Eintrag mit gleichem `run_id` (Run-Bookkeeping wurde `endRun()`-bereinigt) UND `dispatched_at` ist älter als ein Operator-vorgegebener Schwellwert.
  - **Evidence C:** Operator gibt `--older-than-minutes <N>` an UND `dispatched_at` liegt > N Minuten zurück, ohne dass `active_runs` einen `'running'`-Status zeigt.
- Direkt-Edit von `runtime_state.json` ist explizit verboten und nicht audit-fähig.
- Ad-hoc `npx tsx -e ...` Aufrufe sind nicht reproduzierbar, parametrisierbar oder auditfähig.
- Die WO-010-Default-Pfade (`failed|done` clearable) **dürfen nicht aufgeweicht werden** — sie schützen gegen Lösch-Versehen normaler Workorders.

**Wirkung im Live-Workflow:**
1. WO-nutrition-001 produziert pro Run einen neuen `active_workorders`-Eintrag (per `state.startWorkorder(...)`, `state-manager.ts:240`) mit Status `dispatched`. Im no-tool-request completed-Pfad bleibt der Status erwartungsgemäß `dispatched` (WO-006 Test 8 Behavior; kein expliziter Update auf `'done'`).
2. `runtime_state.json` akkumuliert mit jedem Workflow-Test einen weiteren `dispatched`-Eintrag.
3. Preflight (`scheduler-preflight.ts:140-148`) lehnt nachfolgende `blocked_by: ['WO-nutrition-001']`-WOs ab, da der `blocked_by`-Resolver einen oder mehrere nicht-`done`/-nicht-`failed`-Einträge findet, die als „laufend" gelten.
4. Operator hat keinen audit-fähigen Weg, die alten `dispatched`-Einträge zu bereinigen, ohne entweder `runtime_state.json` direkt zu editieren (verboten) oder das WO-010-Gate aufzuweichen (gefährlich).

**Ziel:** Erweitere die existierende Operator-CLI um einen schmalen, sicheren, evidence-gated Cleanup-Pfad für **nachweislich-stale `dispatched`-Einträge**:
- Default-Verhalten von WO-010-`clear` bleibt 1:1 (`failed|done`-only, keine Aufweichung).
- Stale-Dispatched-Cleanup verlangt **separates explizites Flag** oder **separaten Sub-Command** (z. B. `--include-stale-dispatched` ODER `clear-stale-dispatched`).
- Zusätzlich Pflicht: exaktes `<workorder_id>` + `--run-id <run_id>` + `--confirm` + Stale-Evidence (Optionen oben).
- Refusal bei: keiner Evidence, mehrdeutigem Match, fehlendem Match, `active_runs` zeigt `'running'`/`'awaiting_approval'`, fehlendem `--older-than-minutes`-Wert wenn Evidence A/B nicht zutrifft.
- Audit-Event-Differenzierung: neuer Event-String `'stale_dispatched_workorder_cleanup'` (NICHT `'terminal_workorder_reset'`), damit Forensic-Trail klar zwischen normaler Terminal-Cleanup und Stale-Dispatched-Cleanup unterscheidet.

---

## Architekturentscheidung (verbindlich)

**Variante 1: Eigener Sub-Command `clear-stale-dispatched` + additive State-Manager- und Audit-Helper (Default).**

Drei Komponenten:

1. **`system/control-plane/terminal-wo-reset-cli.ts` (additiver Sub-Command, kein Eingriff in `clear`):**
   - `list` (unverändert).
   - `show <workorder_id>` (unverändert).
   - `clear <workorder_id> --run-id <run_id> [--dry-run | --confirm]` (UNVERÄNDERT — `failed|done`-only).
   - **NEU:** `clear-stale-dispatched <workorder_id> --run-id <run_id> [--older-than-minutes <N>] [--dry-run | --confirm]`
     - Default ohne `--older-than-minutes`: nur clearbar wenn `active_runs`-Eintrag mit gleichem `run_id` terminal (Evidence A) ODER gar kein `active_runs`-Eintrag UND `dispatched_at` > 60 Minuten alt (Evidence B mit Default-Schwelle).
     - Mit `--older-than-minutes <N>`: Operator-vorgegebene Schwelle; akzeptiert nur wenn `dispatched_at` > N Minuten alt UND `active_runs` zeigt für diesen `run_id` keinen `'running'`-Status.
     - Refused, wenn Evidence nicht erfüllbar oder `active_runs`-Eintrag aktiv `'running'` ist.
2. **`system/state/state-manager.ts` (additive Helper, keine Signatur-Änderung an existierenden Funktionen):**
   - `getActiveRunByRunId(runId: string): Run | undefined` — read-only Convenience, gibt `s.active_runs.find(r => r.run_id === runId)` zurück. (Bestehender `getActiveRuns()`-Helper filtert nur auf `'running'` und ist daher nicht ausreichend.)
   - `removeStaleDispatchedActiveWorkorder(workorderId: string, runId: string, evidence: { kind: 'active_run_terminal'|'no_active_run_and_age'|'operator_threshold', ageMinutes?: number }): Promise<{ removed: boolean; entry?: ActiveWorkorder; reason?: string }>` — entfernt **GENAU einen** Eintrag mit exaktem `workorder_id`+`run_id`-Match, **NUR** wenn `entry.status === 'dispatched'` UND mindestens eine der Evidence-Bedingungen erfüllt ist UND `active_runs` für diesen `run_id` NICHT `'running'`/`'awaiting_approval'` zeigt. Refused bei: kein Match, mehrdeutiger Match (>1), Status ≠ `'dispatched'`, fehlender Evidence, `active_runs` aktiv. Atomic via existierendem `mutate()`-Lock-Pattern.
   - `TERMINAL_CLEARABLE`-Gate in `removeTerminalActiveWorkorder` bleibt 1:1 `['failed','done']`. Neuer Helper hat eigenes Gate `STALE_DISPATCHED_CLEARABLE = ['dispatched']` und eigene Evidence-Logik.
3. **`system/state/audit-writer.ts` (additive Erweiterung):**
   - `EventType`-Union additiv um `'stale_dispatched_workorder_cleanup'` erweitert.
   - `defaultSeverity()`-Map additiv um `'stale_dispatched_workorder_cleanup' → 'warning'` erweitert.
   - Neue exportierte Convenience-Funktion `auditStaleDispatchedWorkorderCleanup(p: Base & Pick<AuditEvent, 'reason'>)` analog zu `auditTerminalWorkorderReset`.
   - Bestehende `auditTerminalWorkorderReset`-Convenience bleibt 1:1.

CLI-Sicherheits-Pflicht-Verhalten:
- Default ist Read-only. Mutation **nur** bei `clear-stale-dispatched ... --confirm`.
- Mutation verlangt **alle** Argumente: `<workorder_id>` + `--run-id <run_id>` + `--confirm` + erfolgreiche Evidence-Prüfung.
- Default ohne explizites `--older-than-minutes`: 60 Minuten Schwelle für Evidence B, dokumentiert in Hilfe-Text.
- `clear-stale-dispatched` lehnt ab:
  - Keine Argumente: usage error, Exit 1.
  - Status ≠ `'dispatched'`: Refusal, Exit 1.
  - `active_runs` zeigt `'running'` oder `'awaiting_approval'` für `run_id`: Refusal, Exit 1.
  - Evidence-Bedingungen nicht erfüllt (z. B. `dispatched_at` < Schwelle, `active_runs` `'running'`): Refusal, Exit 1.
  - Mehrdeutiger Match (>1): Refusal, Exit 1.
  - Kein Match: Exit 2.
- Audit-Event NUR vor erfolgreicher `--confirm`-Mutation; Dry-Run schreibt KEIN Audit (analog WO-010).
- Kein `--force`-Flag, kein `--all`-Flag, kein `--bypass`-Flag, kein Wildcard.

**Einheitliches Exit-Code-Schema (verbindlich, identisch zu WO-010):**
- **Exit 0** = Erfolg ODER read-only Operation erfolgreich (auch `--dry-run`-Vorschau eines clearbaren Eintrags).
- **Exit 1** = usage error / refusal / unsafe request / fehlende Evidence / non-clearable Status / ambiguous match.
- **Exit 2** = no exact match found.

Alternativen verworfen:
- **Variante 2: WO-010-`clear` um ein `--include-stale-dispatched`-Flag erweitern.** Verworfen: erhöht Cognitive Load auf demselben Sub-Command (zwei sehr unterschiedliche Sicherheitsprofile in einer Code-Pfad), erschwert Audit-Trail-Differenzierung (gleicher Event-String). Sub-Command-Trennung ist sauberer.
- **Variante 3: Auto-Cleanup im Preflight bei `dispatched_at > X Minuten alt`.** Verworfen: Preflight darf nicht mutieren (Single-Responsibility); Auto-Cleanup würde Sicherheitsgarantie aushebeln, dass Preflight nur read-only-Entscheidungen trifft.
- **Variante 4: Auto-Cleanup im Dispatcher-Start (vor `startWorkorder()`).** Verworfen: Dispatcher hat keine Operator-Aufgabe; auto-mutation könnte Race-Conditions mit anderen Operator-Aktionen erzeugen.
- **Variante 5: Erweiterung von `removeTerminalActiveWorkorder` um zusätzlichen `dispatched`-Pfad mit Evidence.** Verworfen: existierende Funktion hat klare, dokumentierte Semantik (`failed|done`-only); Erweiterung würde Single-Responsibility brechen und Tests/Docs pre-existierender Aufrufer destabilisieren.
- **Variante 6: Reset über Workorder-Lifecycle-Transition `dispatched → failed → cleanup`.** Verworfen: `dispatched → failed` würde Audit-Events mit falscher Reason erzeugen (kein echter Failure); zudem ist die Transition für laufende Runs riskant.

In allen Varianten:
- `runtime_state.json` wird **NIE** direkt per File-Write editiert — alle Mutations laufen über `state-manager.ts`'s `mutate()`-Lock.
- Kein neuer Audit-Event-Schema-Edit der `AuditEvent`-Pflichtfelder; nur ein neuer `EventType`-String-Wert (additiv).
- Kein Eingriff in `dispatcher.ts`, `governance-validator.ts`, `scheduler-preflight.ts`, `review-pipeline.ts`, `system/workorders/cli/**`, `system/approval/**`, `services/scheduler-api/**`, `risk-categories.ts`, `workorder.schema.json`.
- Production-Default-Verhalten unverändert: ohne CLI-Aufruf bleibt jeder WO-/Lock-/Audit-Pfad bit-identisch. WO-010-`clear`-Default-Verhalten bleibt 1:1 (`failed|done`-only).

---

## Workorder

```yaml
workorder_id: "WO-governance-015"
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
      - system/control-plane/terminal-wo-reset-cli.ts
        (existierende argv-Parser-Logik, Sub-Command-Dispatch, Output-
        Formatter; existierende `clear`-Implementierung als Pattern-Vorlage
        für neuen `clear-stale-dispatched`-Sub-Command).
      - system/state/state-manager.ts
        (insbesondere: ActiveWorkorder-Interface (Zeile ~32) mit status-Union
        'queued'|'dispatched'|'running'|'review'|'awaiting_approval'|'done'|'failed';
        Run-Interface (Zeile ~21) mit status-Union 'running'|'completed'|'failed'|
        'blocked'|'awaiting_approval'; mutate()/readState()-Pattern; bestehender
        getActiveRuns()-Helper (Zeile ~237) filtert nur 'running' und ist daher
        NICHT ausreichend für Evidence-Prüfung; bestehender
        removeTerminalActiveWorkorder mit TERMINAL_CLEARABLE-Gate als
        Pattern-Vorlage).
      - system/state/audit-writer.ts
        (writeAuditEvent-Signatur, EventType-Union (Zeile ~10), defaultSeverity-
        Map (Zeile ~95), bestehende auditTerminalWorkorderReset-Convenience-
        Funktion (Zeile ~141) als Pattern-Vorlage).
      - system/control-plane/scheduler-preflight.ts
        (Zeile 140-148: Terminal-/blocked_by-Resolution-Logik; verstehen WARUM
        stale-dispatched-Einträge Preflight HOLD verursachen — KEINE Änderung
        an dieser Datei).
      - system/control-plane/__tests__/terminal-wo-reset-cli.test.ts
        (Test-Setup-Pattern: process.chdir auf TEST_DIR mit minimaler
        runtime_state.json; node:test describe/it; Pre-population von
        active_workorders und active_runs).
      - system/workorders/schemas/workorder.schema.json (read-only Referenz)
      - system/workorders/lifecycle/wo_lifecycle_v1.md
        (Terminal-Status-Definitionen; Klärung dass `dispatched` KEIN terminaler
        WO-Lifecycle-Status ist — er bezeichnet "Worker hat WO erhalten und
        führt aus" oder "WO wurde an Worker übergeben"; nach Run-Abschluss
        sollte `active_workorders.status` auf `done`/`failed` aktualisiert
        werden — WO-014 hat das für intentional-non-terminale Pfade explizit
        nicht angefasst, daher das stale-dispatched-Symptom).
      - system/workorders/nutrition/batches/BATCH-NUTRITION-P1-001-db-foundation.md
        (Test-Anwendungsfall — nach Cleanup soll WO-nutrition-002 Preflight HOLD
        nicht mehr durch stale-dispatched WO-nutrition-001-Einträge ausgelöst
        werden).
      - system/workorders/nutrition/drafts/WO-GOVERNANCE-P1-010-terminal-wo-reset-cli.md
        (Pattern-Vorlage für Operator-CLI mit Audit-Event-Wiederverwendung).
      - system/workorders/nutrition/drafts/WO-GOVERNANCE-P1-011-dispatcher-terminal-status-on-fail.md
        (Pattern-Vorlage für additive State-Manager-Helper ohne Signatur-
        Änderung an existierenden Funktionen).
      - system/workorders/nutrition/drafts/WO-GOVERNANCE-P1-014-finally-lock-release-on-non-terminal-paths.md
        (verstehen: WO-014 hat Lock-Release auf `cleanupHandled = true`-Pfaden
        gefixt, aber den active_workorders.status `'dispatched'` auf dem
        no-tool-request completed-Pfad bewusst NICHT auf `'done'` aktualisiert
        — daher das stale-dispatched-Symptom für WO-nutrition-001 nach
        wiederholten Workflow-Tests).

      Identifiziere die exakten Stellen und neuen Komponenten:
        - state-manager.ts: neue Helper getActiveRunByRunId und
          removeStaleDispatchedActiveWorkorder platzieren (bevorzugt nahe
          removeTerminalActiveWorkorder, ~Zeile 320 ff). Bestehender
          getActiveRuns-Helper bleibt 1:1.
        - audit-writer.ts: EventType-Union additiv um
          'stale_dispatched_workorder_cleanup' erweitern; defaultSeverity-Map
          additiv erweitern; neue Convenience-Funktion
          auditStaleDispatchedWorkorderCleanup analog zu
          auditTerminalWorkorderReset.
        - terminal-wo-reset-cli.ts: neuer Sub-Command-Branch
          'clear-stale-dispatched'; argv-Parser für --run-id,
          --older-than-minutes, --dry-run, --confirm; Hilfe-Text aktualisieren
          (alphabetische Sub-Command-Liste). Bestehender 'clear'-Branch bleibt
          1:1 (kein Verhaltensänderung, kein neues Flag).
        - terminal-wo-reset-cli.test.ts: additive Tests für neuen Sub-Command.

      Verstehe den Sicherheits-Vertrag:
        - Default-Verhalten von WO-010-`clear` bleibt unverändert
          (`failed|done`-only). KEIN Aufweichen.
        - Stale-Dispatched-Cleanup ist eigener, separater, evidence-gated
          Sub-Command — Kognitive und Audit-Trennung von Terminal-Cleanup.
        - Audit-Event-String-Differenzierung: 'stale_dispatched_workorder_cleanup'
          (neu) vs. 'terminal_workorder_reset' (existing) — Forensic-Trail
          eindeutig auswertbar.
        - Evidence-Bedingungen sind der einzige Cleanup-Trigger für `dispatched`-
          Einträge — kein Wildcard, kein Force, kein Bulk.

      Schreibe architecture_notes mit gewählter Variante (Variante 1 = Default).
      Bestätige, dass:
        - dispatcher.ts / governance-validator.ts / scheduler-preflight.ts /
          review-pipeline.ts / risk-categories.ts UNVERÄNDERT bleiben.
        - runtime_state.json NIE direkt per File-Write editiert wird.
        - kein --force / --all / --bypass / --skip-validator Flag eingeführt wird.
        - kein scope_lock, kein system_stop, keine Approval-Queue in dieser CLI
          berührt wird.
        - kein Workorder ausgeführt, keine Migration ausgeführt, kein Supabase-
          Befehl ausgeführt wird.
        - WO-010-`clear`-Default-Verhalten 1:1 bleibt.
        - bestehende state-manager-Funktionen in Signatur und Verhalten
          unverändert bleiben.
        - bestehende audit-writer-Convenience-Funktionen in Signatur unverändert
          bleiben.
    </analyze>

    <implement>
      Implementiere Variante 1 (eigener Sub-Command `clear-stale-dispatched` +
      additive State-Manager- und Audit-Writer-Helper).

      Schritt 1 — state-manager.ts: zwei neue exportierte Helper.

        /**
         * Read-only-Lookup eines active_runs-Eintrags per run_id.
         * Anders als getActiveRuns() (filtert nur 'running'), gibt diese
         * Funktion den Eintrag in JEDEM Status zurück — gebraucht für
         * Stale-Evidence-Prüfung.
         */
        export function getActiveRunByRunId(runId: string): Run | undefined {
          return readState().active_runs.find(r => r.run_id === runId)
        }

        /**
         * Entfernt GENAU einen active_workorders-Eintrag mit Status
         * 'dispatched', wenn nachweislich stale.
         *
         * Evidence-Bedingungen (mindestens eine muss erfüllt sein):
         *   - 'active_run_terminal':
         *       active_runs hat Eintrag mit gleichem run_id und Status
         *       in {'completed','failed','blocked'}.
         *   - 'no_active_run_and_age':
         *       Kein active_runs-Eintrag mit diesem run_id UND
         *       (now - dispatched_at) > ageMinutes (Default 60).
         *   - 'operator_threshold':
         *       (now - dispatched_at) > ageMinutes UND active_runs zeigt
         *       für diesen run_id KEINEN 'running'/'awaiting_approval'-Status.
         *
         * Hard refusal bei:
         *   - kein Match
         *   - mehrdeutigem Match (>1)
         *   - status !== 'dispatched'
         *   - active_runs zeigt 'running' oder 'awaiting_approval' für run_id
         *   - Evidence-Bedingungen nicht erfüllt
         *
         * Atomic via mutate()-Lock. Idempotent: zweiter Aufruf nach
         * erfolgreichem Remove gibt { removed: false, reason: 'no match' } zurück.
         */
        export async function removeStaleDispatchedActiveWorkorder(
          workorderId: string,
          runId: string,
          evidence: {
            kind: 'active_run_terminal' | 'no_active_run_and_age' | 'operator_threshold'
            ageMinutes?: number
          },
        ): Promise<{ removed: boolean; entry?: ActiveWorkorder; reason?: string }>

      WICHTIG:
        - Implementer muss innerhalb der Funktion zusätzlich verifizieren,
          dass die deklarierte Evidence tatsächlich gegen den aktuellen
          State stimmt (Operator könnte die falsche Kind-Markierung
          übergeben). State-of-the-world prüft die Funktion, NICHT der CLI-
          Code.
        - active_runs-Eintrag wird NICHT mutiert — nur active_workorders.
        - Default-ageMinutes = 60, falls evidence.ageMinutes nicht gesetzt.
        - Refusal-Reasons sind sprechend ('non-dispatched status: <s>',
          'active run still running', 'evidence insufficient: <details>',
          'no match', 'ambiguous match (<n>)').

      KEINE Änderung an existierenden state-manager-Funktionen
      (`removeTerminalActiveWorkorder`, `getAllActiveWorkorders`, `getActiveRuns`,
      `startWorkorder`, `endRun`, `acquireScopeLock`, `releaseScopeLock`,
      `releaseDbMigrationLock`, `updateActiveWorkorderStatusByRun`,
      `updateWorkorderStatus`, etc.). KEINE Mutation von scope_locks,
      db_migration_lock, system_stop, approvals, audit_tokens, active_runs in
      diesen Helpern.

      Schritt 2 — audit-writer.ts: additive Erweiterung.

        // EventType-Union: additiv erweitern (existing Member bleiben)
        export type EventType =
          | ... (existing members) ...
          | 'stale_dispatched_workorder_cleanup'

        // defaultSeverity: additiv erweitern (Standard 'warning')
        // ergänze 'stale_dispatched_workorder_cleanup' im Severity-Map mit 'warning'

        export const auditStaleDispatchedWorkorderCleanup = (
          p: Base & Pick<AuditEvent, 'reason'>,
        ) =>
          writeAuditEvent({
            event:    'stale_dispatched_workorder_cleanup',
            severity: 'warning',
            ...p,
          })

      Klarstellung:
        - Audit wird AUSSCHLIESSLICH über audit-writer.ts geschrieben
          (auditStaleDispatchedWorkorderCleanup → writeAuditEvent → File-Write
          intern in audit-writer.ts).
        - Keine direkte JSONL-Editierung der system/state/*.jsonl-Dateien.
        - Bestehende auditTerminalWorkorderReset-Convenience bleibt 1:1.

      Schritt 3 — terminal-wo-reset-cli.ts: neuer Sub-Command-Branch.

      Bestehende argv-Parser-Logik für `clear` als Vorlage; erweitere um
      `clear-stale-dispatched`-Sub-Command:

        case 'clear-stale-dispatched': return await cmdClearStaleDispatched(rest)

      cmdClearStaleDispatched-Verhalten (siehe Architekturentscheidung-
      Exit-Code-Schema: Exit 0 = Erfolg/read-only-OK, Exit 1 = usage error/
      refusal/unsafe, Exit 2 = no exact match found):

        - argv-Parser akzeptiert: <workorder_id>, --run-id <run_id>,
          --older-than-minutes <N> (optional, Default 60), --dry-run, --confirm.
        - Ohne --dry-run UND ohne --confirm: Default = --dry-run-Verhalten.
        - --dry-run UND --confirm gleichzeitig: Exit 1.
        - Fehlende Pflicht-Argumente: Exit 1, klarer Refusal-Text.
        - Lookup via getAllActiveWorkorders() + Filter auf (workorder_id, run_id).
        - Lookup via getActiveRunByRunId(run_id) für Evidence-Prüfung.
        - Evidence-Auswahl-Logik (CLI bestimmt evidence.kind, State-Manager
          verifiziert):
            - Wenn active_run mit run_id existiert UND status in
              {'completed','failed','blocked'}: kind='active_run_terminal'.
            - Wenn kein active_run mit run_id existiert UND
              (now - dispatched_at) > ageMinutes: kind='no_active_run_and_age'.
            - Wenn Operator --older-than-minutes <N> explizit setzt:
              kind='operator_threshold' mit ageMinutes=N.
            - Sonst Refusal mit Reason 'evidence insufficient' (Exit 1).
        - --dry-run: Vorschau "would remove 1 stale-dispatched entry: ...
          (evidence: <kind>, age=<m>min, active_run=<status_or_none>)".
          Mutiert NICHTS, schreibt KEIN Audit. Exit 0 bei clearbarem Match;
          Exit 1 bei Evidence-Fehlen oder non-dispatched Status; Exit 2 bei
          keinem Match.
        - --confirm: Schreibt VOR der Mutation ein Audit-Event via
          auditStaleDispatchedWorkorderCleanup(reason: 'operator-initiated
          cleanup of stale dispatched active_workorders entry; evidence=<kind>;
          age=<m>min'). Ruft removeStaleDispatchedActiveWorkorder auf.
            - Bei outcome.removed===true: Exit 0 mit Confirmation.
            - Bei outcome.removed===false UND outcome.reason==='no match': Exit 2.
            - Bei outcome.removed===false UND outcome.reason!=='no match'
              (non-dispatched / ambiguous / evidence-failure / active running):
              Exit 1.

      Hilfe-Text-Update:
        - terminal-wo-reset-cli ohne Sub-Command: zeige beide Sub-Commands
          (`clear` und `clear-stale-dispatched`) mit jeweils einer Zeile
          Beschreibung. Beide haben getrennte Sicherheitsprofile.

      ABSOLUTE VERBOTE im CLI-Implementer-Code:
        - KEIN fs.writeFileSync auf runtime_state.json oder *.jsonl.
        - KEIN direktes Editieren von approval-tokens, scope_locks, system_stop.
        - KEIN Aufruf von triggerSystemStop / clearSystemStop / acquireScopeLock /
          releaseScopeLock / startRun / endRun / removeTerminalActiveWorkorder
          mit gefälschtem Status.
        - KEIN Bulk-Cleanup, kein Wildcard, kein --force, kein --all,
          kein --bypass, kein --skip-validator.
        - KEINE neuen npm-Dependencies (verwende nur node:fs/path/process/util,
          state-manager und audit-writer).
        - KEIN child_process.exec / spawn im CLI-Body.

      Schritt 4 — terminal-wo-reset-cli.test.ts: dedicated additive Tests.

      Test-Setup (Pattern aus existing terminal-wo-reset-cli.test.ts):
        - process.chdir auf TEST_DIR mit minimaler runtime_state.json-Struktur.
        - Pre-populate active_workorders und active_runs mit kontrollierten
          Test-Einträgen für jede Evidence-Variante.

      Test-Cases (mindestens):
        1. getActiveRunByRunId('RUN-existing-running') liefert Run mit status=running.
        2. getActiveRunByRunId('RUN-non-existent') liefert undefined.
        3. removeStaleDispatchedActiveWorkorder gegen non-dispatched Status
           ('failed') → removed:false, reason enthält 'non-dispatched status'.
        4. removeStaleDispatchedActiveWorkorder gegen dispatched Status mit
           active_run.status='running' → removed:false, reason enthält
           'active run still running'.
        5. removeStaleDispatchedActiveWorkorder gegen dispatched Status mit
           active_run.status='completed', evidence.kind='active_run_terminal'
           → removed:true.
        6. removeStaleDispatchedActiveWorkorder gegen dispatched Status ohne
           active_run-Eintrag, dispatched_at vor 120 Min, evidence.kind=
           'no_active_run_and_age' (Default 60) → removed:true.
        7. removeStaleDispatchedActiveWorkorder gegen dispatched Status ohne
           active_run-Eintrag, dispatched_at vor 5 Min, evidence.kind=
           'no_active_run_and_age' (Default 60) → removed:false, reason
           enthält 'evidence insufficient'.
        8. removeStaleDispatchedActiveWorkorder gegen dispatched Status mit
           --older-than-minutes=10, dispatched_at vor 30 Min, evidence.kind=
           'operator_threshold' → removed:true.
        9. Mehrdeutiger Match (zwei Einträge mit gleichem wo+run) → removed:false,
           reason enthält 'ambiguous'.
       10. Non-existenter Match → removed:false, reason='no match'.
       11. Idempotenz: zweiter Aufruf nach erfolgreichem Remove → removed:false,
           reason='no match'.
       12. CLI: clear-stale-dispatched ohne Sub-Command-Argumente → Exit 1.
       13. CLI: clear-stale-dispatched ohne --run-id → Exit 1.
       14. CLI: clear-stale-dispatched mit --dry-run UND --confirm → Exit 1.
       15. CLI: clear-stale-dispatched gegen dispatched-Eintrag mit gültiger
           Evidence im --dry-run → Exit 0, State unverändert, KEIN Audit-Event.
       16. CLI: clear-stale-dispatched gegen dispatched-Eintrag mit gültiger
           Evidence im --confirm → Exit 0, State mutiert, Audit-Event geschrieben
           mit event-String 'stale_dispatched_workorder_cleanup'.
       17. CLI: clear-stale-dispatched gegen non-dispatched Status (failed/done)
           → Exit 1, Refusal.
       18. CLI: clear-stale-dispatched gegen unbekannten (workorder_id, run_id)
           → Exit 2.
       19. CLI: clear-stale-dispatched gegen dispatched-Eintrag mit aktivem
           active_run.status='running' → Exit 1, Refusal mit
           reason 'active run still running'.
       20. WO-010 Default-Pfad bleibt unverändert: clear gegen dispatched-
           Eintrag → Exit 1 (existing behavior, unverändert).
       21. Audit-File enthält 'stale_dispatched_workorder_cleanup'-Event nur
           nach --confirm (kein Audit-Event nach --dry-run); Event-String
           ist NICHT 'terminal_workorder_reset' (Differenzierung).
       22. Bestehende WO-010-Tests bleiben 1:1 grün (keine Regression).

      Tests verwenden node:test describe/it, kein Vitest, keine neuen Dependencies.

      Final:
        - pnpm tsc --noEmit muss clean sein.
        - npx tsx --test system/control-plane/__tests__/terminal-wo-reset-cli.test.ts
          → all PASS (existing + neue).
        - npx tsx system/control-plane/terminal-wo-reset-cli.ts list
          → Exit 0 (auf live runtime_state.json).
        - npx tsx system/control-plane/terminal-wo-reset-cli.ts show WO-nutrition-001
          → Exit 0, zeigt 6 Einträge.
        - npx tsx system/control-plane/terminal-wo-reset-cli.ts clear-stale-dispatched
          WO-nutrition-001 --run-id RUN-20260503-7133 --dry-run
          → Exit 1 (Refusal: status='failed', nicht 'dispatched';
          Operator soll WO-010-`clear` für failed-Einträge nutzen).
        - npx tsx system/control-plane/terminal-wo-reset-cli.ts clear-stale-dispatched
          WO-nutrition-001 --run-id RUN-20260502-6627 --dry-run
          → Exit 0 (Vorschau: stale-dispatched, age > 60min, kein active_run);
          State unverändert.
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
      Kein active_runs berühren (read-only via getActiveRunByRunId).
      Kein Workorder-File (.md) modifizieren.
      Keine neuen npm-Dependencies; package.json unverändert.
      Default-Modus von 'clear-stale-dispatched' ohne explizites Flag = --dry-run (sicher).
      Mutation NUR mit explizitem --confirm UND erfolgreicher Evidence-Prüfung.
      Audit-Event NUR vor erfolgreicher Mutation; Dry-Run schreibt KEIN Audit.
      WO-010 `clear`-Default-Verhalten bleibt 1:1 (`failed|done`-only).
      Bestehende state-manager-Funktionen bleiben in Signatur und Verhalten unverändert.
      Bestehende audit-writer-Convenience-Funktionen bleiben in Signatur unverändert.
      Bestehende WO-010-Tests bleiben 1:1 grün.
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
      Bei nötigem Edit von risk-categories.ts: {"status": "STOP"}.
      Bei nötigem Aufweichen des WO-010-`clear`-Default-Verhaltens
        (failed|done-only-Gate): {"status": "STOP"}.
      Bei nötigem Touch von approval-queue, system_stop, scope_locks
        in CLI/State-Manager-Helpern: {"status": "STOP"}.
      Bei nötiger neuer npm-Dependency: {"status": "ESCALATE"}.
      Bei Migration / Schema-Änderung erkannt: {"status": "ESCALATE", "issues": ["route to db-migration-agent"]}.
      Bei Security-Befund (z. B. Cleanup einer security-WO): {"status": "STOP"}.
      Bei rotem Test nach Anpassung: {"status": "FAIL", "issues": ["test: <name> — actual=<x> expected=<y>"]}.
      Bei mehrdeutigem Refusal-Verhalten (z. B. Evidence-Logik unklar): {"status": "ESCALATE"}.
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
  - "system/workorders/nutrition/drafts/WO-GOVERNANCE-P1-010-terminal-wo-reset-cli.md"
  - "system/workorders/nutrition/drafts/WO-GOVERNANCE-P1-011-dispatcher-terminal-status-on-fail.md"
  - "system/workorders/nutrition/drafts/WO-GOVERNANCE-P1-014-finally-lock-release-on-non-terminal-paths.md"

acceptance_criteria:
  - "Neue exportierte Funktion getActiveRunByRunId(runId): Run | undefined in state-manager.ts liefert read-only Lookup eines active_runs-Eintrags in JEDEM Status (nicht nur 'running')"
  - "Neue exportierte Funktion removeStaleDispatchedActiveWorkorder(workorderId, runId, evidence) in state-manager.ts entfernt GENAU einen active_workorders-Eintrag bei exaktem Match, Status === 'dispatched', erfüllter Evidence (active_run_terminal | no_active_run_and_age | operator_threshold) und nicht-laufendem active_run"
  - "removeStaleDispatchedActiveWorkorder verifiziert Evidence-Bedingungen unabhängig von der CLI-Deklaration (state-of-the-world-Prüfung in der Funktion)"
  - "removeStaleDispatchedActiveWorkorder verweigert Mutation und liefert sprechende reason bei: kein Match, mehrdeutigem Match, nicht-'dispatched' Status, active_run.status === 'running' oder 'awaiting_approval', fehlender Evidence (z. B. dispatched_at unterhalb Schwelle)"
  - "removeStaleDispatchedActiveWorkorder mutiert NUR active_workorders — keine Berührung von scope_locks, db_migration_lock, system_stop, approvals, audit_tokens, active_runs"
  - "Bestehende state-manager-Funktionen (removeTerminalActiveWorkorder, getAllActiveWorkorders, getActiveRuns, startWorkorder, endRun, acquireScopeLock, releaseScopeLock, releaseDbMigrationLock, updateActiveWorkorderStatusByRun, updateWorkorderStatus) bleiben in Signatur und Verhalten unverändert"
  - "EventType-Union in audit-writer.ts additiv um 'stale_dispatched_workorder_cleanup' erweitert; defaultSeverity-Map additiv um diesen Event mit 'warning' erweitert"
  - "Neue Convenience-Funktion auditStaleDispatchedWorkorderCleanup in audit-writer.ts schreibt event 'stale_dispatched_workorder_cleanup' via writeAuditEvent (kein direkter JSONL-Edit)"
  - "Bestehende auditTerminalWorkorderReset-Convenience und alle anderen audit-writer-Funktionen bleiben in Signatur und Verhalten unverändert"
  - "CLI in system/control-plane/terminal-wo-reset-cli.ts erhält neuen Sub-Command 'clear-stale-dispatched <workorder_id> --run-id <run_id> [--older-than-minutes <N>] [--dry-run | --confirm]'"
  - "CLI 'clear-stale-dispatched' verlangt sowohl <workorder_id> als auch --run-id <run_id> als Pflicht-Argumente"
  - "CLI 'clear-stale-dispatched' Default ohne explizites Flag = --dry-run-Verhalten (sicher; kein Audit, keine Mutation)"
  - "CLI 'clear-stale-dispatched ... --dry-run' ist read-only — KEIN Audit-Event, KEINE State-Mutation; zeigt Vorschau 'would remove 1 stale-dispatched entry: ...' bei clearbarem Match"
  - "CLI 'clear-stale-dispatched ... --confirm' schreibt Audit-Event via auditStaleDispatchedWorkorderCleanup VOR der Mutation; Event-String ist 'stale_dispatched_workorder_cleanup' (NICHT 'terminal_workorder_reset')"
  - "CLI verweigert clear-stale-dispatched bei Status !== 'dispatched' mit klarem Refusal-Output und Exit 1"
  - "CLI verweigert clear-stale-dispatched wenn active_runs für run_id 'running' oder 'awaiting_approval' zeigt mit Exit 1"
  - "CLI verweigert clear-stale-dispatched bei nicht erfüllten Evidence-Bedingungen (z. B. dispatched_at unterhalb Schwelle, kein terminaler active_run) mit Exit 1"
  - "CLI verweigert clear-stale-dispatched bei mehrdeutigem Match mit Exit 1"
  - "CLI verweigert clear-stale-dispatched bei keinem Match mit Exit 2 (sowohl --dry-run als auch --confirm)"
  - "CLI Exit-Code-Schema einheitlich angewandt (identisch zu WO-010): Exit 0 = Erfolg/read-only-OK; Exit 1 = usage error/refusal/unsafe; Exit 2 = no exact match found"
  - "CLI editiert NIEMALS runtime_state.json direkt per fs.writeFileSync — alle Mutations über state-manager.ts"
  - "CLI editiert NIEMALS system/state/*.jsonl direkt — alle Audit-Events über audit-writer.ts"
  - "CLI berührt NIEMALS approval queue (system/approval/**)"
  - "CLI berührt NIEMALS system_stop (kein triggerSystemStop, kein clearSystemStop)"
  - "CLI berührt NIEMALS scope_locks (kein acquire/release)"
  - "CLI berührt NIEMALS active_runs (read-only Lookup via getActiveRunByRunId)"
  - "CLI führt KEINE Workorders aus (kein dispatchWorkorder-Aufruf, kein run-batch-Aufruf)"
  - "CLI führt KEINE Migrationen aus (kein supabase-Befehl, kein db-migration-Lock)"
  - "Kein --force / --all / --bypass / --skip-validator Flag eingeführt"
  - "Keine neuen npm-Dependencies; package.json unverändert"
  - "Keine Änderung an dispatcher.ts, governance-validator.ts, scheduler-preflight.ts, review-pipeline.ts, batch-loader.ts, services/scheduler-api/**, workorder.schema.json, risk-categories.ts"
  - "WO-010 `clear`-Sub-Command bleibt 1:1 unverändert (failed|done-only Gate, gleiche Audit-Event-String 'terminal_workorder_reset')"
  - "Audit-Trail differenziert eindeutig zwischen 'terminal_workorder_reset' (WO-010) und 'stale_dispatched_workorder_cleanup' (WO-015)"
  - "Tests in system/control-plane/__tests__/terminal-wo-reset-cli.test.ts decken mindestens 22 Szenarien ab (siehe Implement-Block: 11 State-Manager-/Helper-Tests, 8 CLI-Sub-Command-Tests inkl. Refusals und Exit-Codes, 1 WO-010-Regressions-Test, 1 Audit-Differenzierungs-Test, 1 Idempotenz-Test) und sind alle grün"
  - "pnpm tsc --noEmit clean"
  - "npx tsx --test system/control-plane/__tests__/terminal-wo-reset-cli.test.ts → all PASS (bestehende WO-010-Tests + neue WO-015-Tests)"
  - "npx tsx system/control-plane/terminal-wo-reset-cli.ts show WO-nutrition-001 → Exit 0 mit 6 Einträgen"
  - "npx tsx system/control-plane/terminal-wo-reset-cli.ts clear-stale-dispatched WO-nutrition-001 --run-id RUN-20260502-6627 --dry-run → Exit 0, Vorschau zeigt 1 stale-dispatched-Entry, State unverändert (verifiziert via getAllActiveWorkorders)"
  - "npx tsx system/control-plane/terminal-wo-reset-cli.ts clear-stale-dispatched WO-nutrition-001 --run-id RUN-20260503-7133 --dry-run → Exit 1, Refusal (status=failed, nicht dispatched; Hinweis: WO-010 clear nutzen)"
  - "Nach Closure dieser WO: Nutrition Batch 001 --dry-run bleibt READY_TO_RUN"
  - "smoke-test.ts bleibt 9/9 PASS (read-only-Verifikation)"
  - "dispatcher-fail-cleanup.test.ts bleibt 32/32 PASS (read-only-Verifikation)"

negative_constraints:
  - "NIEMALS außerhalb scope_files schreiben"
  - "NIEMALS runtime_state.json direkt per fs.writeFileSync editieren — nur über state-manager.ts mutate()"
  - "NIEMALS system/state/*.jsonl direkt editieren — nur über audit-writer.ts"
  - "NIEMALS approval-Queue-Dateien (system/approval/**) editieren"
  - "NIEMALS system_stop berühren (kein triggerSystemStop / clearSystemStop in dieser CLI)"
  - "NIEMALS scope_locks berühren (kein acquire/release in dieser CLI)"
  - "NIEMALS active_runs mutieren (read-only Lookup via getActiveRunByRunId)"
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
  - "NIEMALS WO-010 `clear`-Default-Verhalten aufweichen (failed|done-only Gate bleibt)"
  - "NIEMALS bestehende state-manager-Funktionen in Signatur oder Verhalten ändern (nur ADDITIVE Helper)"
  - "NIEMALS bestehende audit-writer-Convenience-Funktionen in Signatur ändern (nur ADDITIVE Helper)"
  - "NIEMALS Validator umgehen oder MAX_REWRITE_LOOPS erhöhen"
  - "NIEMALS ein --force / --all / --bypass / --skip-validator Flag einbauen"
  - "NIEMALS broad cleanup ohne exaktes (workorder_id, run_id)-Paar zulassen"
  - "NIEMALS wildcard cleanup zulassen"
  - "NIEMALS dispatched-Einträge ohne explizite, im State-Manager verifizierte Evidence löschen"
  - "NIEMALS dispatched-Einträge löschen, wenn active_runs für diesen run_id 'running' oder 'awaiting_approval' zeigt"
  - "NIEMALS Audit-Event vor Dry-Run schreiben (Audit NUR bei --confirm + erfolgreicher Mutation)"
  - "NIEMALS Audit-Event-String 'terminal_workorder_reset' für stale-dispatched-Cleanup verwenden (Differenzierung Pflicht)"
  - "NIEMALS package.json ändern"
  - "NIEMALS neue npm-Dependencies hinzufügen"
  - "NIEMALS bestehende WO-010-Tests deaktivieren oder skip-pen (xtest/it.skip/test.skip/xit)"
  - "NIEMALS ENV-Dateien lesen oder schreiben"
  - "NIEMALS child_process.exec/spawn im CLI-Body verwenden (nur über node:test im Test-File)"

files_blocked:
  - "system/control-plane/dispatcher.ts"
  - "system/control-plane/governance-validator.ts"
  - "system/control-plane/scheduler-preflight.ts"
  - "system/control-plane/review-pipeline.ts"
  - "system/control-plane/risk-categories.ts"
  - "system/workorders/cli/**"
  - "system/approval/**"
  - "services/scheduler-api/**"
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
  - "npx tsx system/control-plane/terminal-wo-reset-cli.ts show WO-nutrition-001"
  - "npx tsx system/control-plane/terminal-wo-reset-cli.ts clear-stale-dispatched WO-nutrition-001 --run-id RUN-20260502-6627 --dry-run"
  - "npx tsx system/workorders/cli/run-batch.ts system/workorders/nutrition/batches/BATCH-NUTRITION-P1-001-db-foundation.md --dry-run"

required_skills: ["gsd-v2"]
optional_skills: ["typescript-pro", "nodejs-best-practices", "debugging-strategies"]
blocked_by:      []
```

---

## Notes

- **Filename ↔ workorder_id:** Filename `WO-GOVERNANCE-P1-015-state-history-cleanup.md` folgt der Auftrags-Convention; `workorder_id: WO-governance-015` folgt der Schema-Regex `^WO-[a-z]+-[0-9]+$`. Orchestrator/Scheduler nutzen das `workorder_id`-Feld.
- **`requires_approval: true`** ist Pflicht für `risk_category: architecture` per `CLAUDE.md` Cautious-Regel (Spark D mandatory, kein Auto-Retry).
- **`agent_id: senior-coding-agent`** — registriert in `system/agent-registry/agents.json`, `type: executor_senior`. Wird durch `AGENT_VALIDATOR_MAP['senior-coding-agent'] = 'micro-executor'` (WO-005) korrekt zu `ALLOWED_AGENTS`-Wert normalisiert. `risk_level` wird via WO-009-Mapping auf `'medium'` normalisiert.
- **`rollback_hint` nicht erforderlich** per Schema if/then (nur bei `db-migration`).
- **Verhältnis zu WO-010 / WO-011 / WO-014:**
  - WO-010 etablierte die CLI mit `clear`-Sub-Command für `failed|done`-Einträge.
  - WO-011 fügte `updateActiveWorkorderStatusByRun` für run-id-spezifische Status-Updates hinzu.
  - WO-014 fügte explizites Lock-Release auf `cleanupHandled = true`-Pfaden hinzu, ließ aber bewusst die `active_workorders.status`-Aktualisierung auf dem no-tool-request completed-Pfad unangetastet (Status bleibt `'dispatched'`).
  - **WO-015** schließt die letzte Operator-Tooling-Lücke: bietet einen audit-fähigen, evidence-gated Cleanup-Pfad für nachweislich-stale `dispatched`-Einträge, ohne die WO-010-Schutzregel für laufende Workorders aufzuweichen.
- **Architekturentscheidung für separaten Sub-Command `clear-stale-dispatched`:** Trennung von `clear` (existing, `failed|done`-only) und `clear-stale-dispatched` (neu, evidence-gated `dispatched`-only) erhöht
  1. Audit-Trail-Klarheit (zwei verschiedene Event-Strings),
  2. Sicherheits-Profil-Klarheit (zwei verschiedene Refusal-Logiken),
  3. Reduziert Cognitive Load auf bestehender `clear`-Code-Pfad.
- **Evidence-Bedingungen sind die Sicherheits-Garantie**, dass WO-015 keinen wirklich-laufenden Workorder zerstören kann. Die Funktion verifiziert Evidence selbst gegen den State (nicht nur die CLI-Deklaration), sodass auch bei Operator-Fehler (falsche `--older-than-minutes`-Angabe) ein wirklich-laufender Run nicht gelöscht wird.
- **`active_runs` ist read-only**: WO-015 mutiert nur `active_workorders`. `active_runs` wird ausschließlich gelesen (für Evidence-Prüfung) — das schützt das `Run`-Bookkeeping.
- **`scope_files` enthält 4 Files** — bestehende CLI + 2 erweiterte State/Audit-Files + bestehende Test-Datei. Konsistent mit `template_implementation_medium.md` (3-15 Files erlaubt). Alle 4 Files identisch zu WO-010-`scope_files` (additive Erweiterung der existierenden Operator-CLI-Komponenten).
- **`files_blocked` schließt `runtime_state.json` und `*.jsonl`-Audit-Logs explizit aus** — alle Mutations nur über `state-manager.ts` und `audit-writer.ts`. Das ist die zentrale Sicherheits-Garantie.
- **`files_blocked` schließt `dispatcher.ts`, `governance-validator.ts`, `scheduler-preflight.ts`, `review-pipeline.ts`, `risk-categories.ts`, `workorder.schema.json`, `services/scheduler-api/**`, `system/workorders/cli/**` aus** — die CLI-Erweiterung ist additive Operator-Tooling, keine Pipeline-Änderung.
- **Audit-Event `'stale_dispatched_workorder_cleanup'`** ist additive Erweiterung des `EventType`-Strings — ergänzt das bereits existierende `'terminal_workorder_reset'` mit eindeutigem Forensic-Trail. Convenience-Funktion `auditStaleDispatchedWorkorderCleanup` analog zu `auditTerminalWorkorderReset` aus WO-010.
- **Lifecycle-Pfad:** Erwartet `done` → `reviewed` (architecture-review + Spark D mandatory) → `closed`. Auto-Retry **deaktiviert** für `architecture` per `CLAUDE.md` High-Risk-Regel.
- **Bezug zur Geschichte:**
  - Nach Closure WO-005..014 ist die Validator-/Dispatcher-/Lock-/Status-Update-/Operator-Reset-Pipeline funktional — bis auf historische `dispatched`-Akkumulation in `active_workorders` durch wiederholte Workflow-Tests des `no-tool-request completed`-Pfads (per Design unverändert).
  - Aktuell stale: `WO-nutrition-001` mit 4× `dispatched`-Einträgen (`RUN-20260502-6627`, `RUN-20260503-8238`, `RUN-20260503-1044`, `RUN-20260503-8969`); zusätzlich 2× `failed`-Einträge (per WO-010 clearable: `RUN-20260503-7133`, `RUN-20260503-6009`).
  - Post-WO-015-Erwartung: Tom führt für die 4 `dispatched`-Einträge `clear-stale-dispatched ... --dry-run` (Vorschau) und dann `... --confirm` (mit Audit-Event), zusätzlich für die 2 `failed`-Einträge bestehendes WO-010 `clear ... --confirm`. Anschließend re-runt BATCH-NUTRITION-P1-001 → erwartet, dass WO-nutrition-002 nun den `db-migration`-Approval-Gate erreicht und auf Tom-Approval pausiert.
- **Scope-Klarstellung:**
  - **Primary scope:** `terminal-wo-reset-cli.ts` (additiver Sub-Command) + `terminal-wo-reset-cli.test.ts` (additive Tests).
  - **Secondary scope:** `state-manager.ts` (zwei additive Helper) und `audit-writer.ts` (eine additive EventType-Erweiterung + eine additive Convenience-Funktion). Keine Verhaltens- oder Signatur-Änderung an existierenden Funktionen.
- **Production-Default Verhalten unverändert:** Die CLI-Erweiterung ist additiver Operator-Touchpoint. Ohne Aufruf des neuen `clear-stale-dispatched`-Sub-Commands bleibt der gesamte Dispatch-/Preflight-/Validator-/Audit-Pfad bit-identisch. WO-010-`clear` bleibt 1:1 verwendbar wie zuvor.
- **Tom darf nicht selbst granten** — die WO-Approval folgt dem normalen Spark-D-Mandatory-Review-Flow.

---

*Draft erzeugt: 2026-05-03 — gemäß `template_implementation_medium.md`, Workflow-Test-Befund Nutrition Batch 001 Final Run nach WO-014-Closure (4× stuck-`dispatched`-Einträge für WO-nutrition-001 in `active_workorders`), und WO-GOVERNANCE-P1-010 + WO-GOVERNANCE-P1-011 + WO-GOVERNANCE-P1-014 als Pattern-Vorlagen für additive State-Manager-/Audit-/CLI-Erweiterungen ohne Signatur-Änderungen an existierenden Funktionen.*

---

## Completion Note

Implementation reviewed PASS. Safe stale-dispatched active_workorder cleanup implemented. Existing terminal reset behavior remains unchanged. clear-stale-dispatched requires exact workorder_id and run_id, dry-run by default, --confirm for mutation, and verified stale evidence. terminal-wo-reset-cli.test.ts 65/65 PASS.

*Closed: 2026-05-03.*
