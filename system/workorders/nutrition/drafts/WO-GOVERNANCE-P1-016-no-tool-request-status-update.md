# WO-GOVERNANCE-P1-016 — No-Tool-Request Active Workorder Status Update V1

**Status:** closed
**Phase:** 1 — Governance Tooling
**Source:** Workflow-Test-Befund Nutrition Batch 001 Final Run nach State Cleanup (alle 6 historischen WO-nutrition-001 active_workorders entfernt via WO-010 + WO-015): `WO-nutrition-001 [dispatched] Dispatcher status: completed` — der Dispatcher liefert weiterhin `'completed'` für den no-tool-request-Pfad, releaset Locks (WO-014) und beendet den Run (`active_runs.status='completed'`), aktualisiert aber NICHT den `active_workorders.status` auf `'done'`. Folge: der frische `RUN-20260503-4291`-Eintrag in `active_workorders` bleibt mit `status: 'dispatched'` zurück, und WO-nutrition-002 trifft Preflight HOLD, weil `blocked_by: ['WO-nutrition-001']` als noch laufend gewertet wird. Das Symptom hat sich von "historische Akkumulation" (WO-015 fix) auf "Live-State pro Run" verschoben — gleiche blocked_by-Resolution-Logik, neuer Trigger.
**Template:** `system/workorders/templates/template_implementation_medium.md`
**Lifecycle:** `wo_generated` → `graph_validated` → `queue_released` → `ready` → `dispatched` → `running` → `done` → `reviewed` (architecture/Spark D mandatory) → `closed` (per `wo_lifecycle_v1.md`)

---

## Out of Scope

- Preflight blocked_by-Resolution-Logik (Option B verworfen — Preflight bleibt strict, keine Toleranz für `dispatched` mit terminalem `active_run`).
- `system_stop` Clear/Status (separate Followup `WO-stop-rule-cli`).
- `scope_locks` Cleanup-CLI (separate künftige WO).
- Approval-Queue-Tooling oder -Editierung.
- `batch-loader.ts` oder `system/workorders/cli/**` Änderungen.
- WO-010 Terminal-WO-Reset-CLI Verhalten (1:1 unverändert).
- WO-015 Stale-Dispatched-Cleanup-Pfad (1:1 unverändert).
- WO-006/WO-011 FAIL-Cleanup-Verhalten (1:1 unverändert).
- WO-014 Lock-Release-Pfade (1:1 unverändert).
- `state-manager.ts` Änderungen (`updateActiveWorkorderStatusByRun` bereits aus WO-011 vorhanden — NICHT ändern; nur aufrufen).
- `governance-validator.ts` Änderungen.
- `review-pipeline.ts` Änderungen.
- `risk-categories.ts` Änderungen.
- `WO_TRANSITIONS`-Tabelle (Transition `dispatched → done` ist bereits erlaubt — `state-manager.ts:252`).
- `OrchestratorIntent`-Type / Validator-§0-§8.
- Schema-Erweiterung von `RuntimeState` oder `ActiveWorkorder`.
- Workorder-File-Modifikationen (`*.md` Drafts oder Batches).
- Nutrition-DB-Implementation oder Supabase-Migration-Execution.
- Approval-Auto-Granting.

---

## Problem Statement

Nutrition Batch 001 Final Workflow Test nach Closure WO-005…015 + vollständiger Operator-Cleanup (4× `clear-stale-dispatched` + 2× `clear` für WO-nutrition-001):
- `pnpm tsc --noEmit` PASS.
- `npx tsx system/control-plane/__tests__/smoke-test.ts` 9/9 PASS.
- `npx tsx --test system/control-plane/__tests__/dispatcher-fail-cleanup.test.ts` 32/32 PASS.
- `npx tsx --test system/control-plane/__tests__/terminal-wo-reset-cli.test.ts` 65/65 PASS.
- Dry-run READY_TO_RUN.
- Pre-Run State: `WO-nutrition-001` 0 Einträge in `active_workorders`.
- Post-Run State: `WO-nutrition-001` 1 Eintrag — `RUN-20260503-4291`, `status: 'dispatched'`, dispatched_at frisch.
- `WO-nutrition-002 [preflight_blocked] Preflight HOLD`.
- Approval Queue: 0 Pending Approvals.

Per Code-Inspektion (`dispatcher.ts:530-544`):
```ts
const toolReq = parseToolRequest(modelOutput)
if (!toolReq) {
  await state.endRun(runId, 'completed')
  // WO-014: explicit lock-release before cleanupHandled=true
  await state.releaseScopeLock(runId)
  await state.releaseDbMigrationLock(runId)
  audit.auditScopeLockReleased({...reason: 'no-tool-request completed path'})
  cleanupHandled = true
  audit.auditJobCompleted({...})
  return { status: 'completed', run_id: runId, workorder_id: wo.workorder_id }
}
```

Die no-tool-request completed-Branch:
1. ✅ Setzt `active_runs.status` auf `'completed'` (via `endRun`).
2. ✅ Releaset `scope_lock` und `db_migration_lock` (WO-014).
3. ✅ Schreibt `auditScopeLockReleased` und `auditJobCompleted`.
4. ✅ Setzt `cleanupHandled = true` (verhindert finally-`failed`-Override per WO-006).
5. ❌ Setzt **NICHT** `active_workorders.status` auf `'done'`.

**Architektonisches Defizit:**
- WO-006 (FAIL-Cleanup) und WO-011 (run-id-spezifischer Status-Update) haben das Pattern für FAIL-Pfade etabliert.
- WO-014 (Lock-Release auf cleanupHandled-Pfaden) hat Locks symmetrisch zu FAIL-Pfaden freigegeben.
- WO-015 (Stale-Dispatched-Cleanup-CLI) hat das *historische* Akkumulations-Symptom adressiert.
- **Symmetrische Lücke:** der no-tool-request completed-Pfad aktualisiert weder den `active_workorders.status` (wie WO-011 es für FAIL-Pfade macht), noch wird die WO als `'done'` markiert.
- Bei `success`-Pfad mit Tool-Request (Zeile ~786) ruft der Dispatcher korrekt `updateActiveWorkorderStatusByRun(..., 'done')` auf. Bei no-tool-request completed fehlt dieser symmetrische Aufruf.

**Wirkung:**
- Jeder Run von WO-nutrition-001 hinterlässt einen frischen `dispatched`-Eintrag.
- Folge-WO mit `blocked_by: ['WO-nutrition-001']` (z. B. WO-nutrition-002) treffen Preflight HOLD, weil `dispatched` als noch laufend gewertet wird.
- Operator muss nach jedem Run mit `clear-stale-dispatched` (WO-015) bereinigen — das ist Cleanup einer im Dispatcher fehlenden Status-Markierung, nicht der korrekte Workflow.
- Das Symptom skaliert mit jedem Workflow-Test-Re-Run (1 zusätzlicher dispatched-Eintrag pro Run).

**Ziel:** Auf dem no-tool-request completed-Pfad in `dispatcher.ts` (~Zeile 530-544) zusätzlich `state.updateActiveWorkorderStatusByRun(wo.workorder_id, runId, 'done')` aufrufen, **bevor** `cleanupHandled = true` gesetzt wird. Das ist die symmetrische Komplettierung zu WO-014: WO-014 hat Lock-Release ergänzt, WO-016 ergänzt die fehlende Status-Markierung. Transition `dispatched → done` ist bereits in `WO_TRANSITIONS` erlaubt (`state-manager.ts:252`). `updateActiveWorkorderStatusByRun` existiert bereits aus WO-011 — nur Aufruf hinzufügen, keine State-Manager-Änderung. WO-006/011/014 FAIL- und Lock-Pfade bleiben 1:1. WO-010/015 Operator-CLI bleibt 1:1. Preflight bleibt strict.

---

## Architekturentscheidung (verbindlich)

**Variante 1 (Option A): Status-Update vor `cleanupHandled = true` auf dem no-tool-request completed-Pfad — symmetrisch zur WO-014-Edit-Stelle.**

Genau eine Code-Edit-Stelle in `dispatcher.ts`, ~Zeile 530-544:

```ts
const toolReq = parseToolRequest(modelOutput)
if (!toolReq) {
  await state.endRun(runId, 'completed')
  // WO-016: mark active_workorders as done so dependents can satisfy blocked_by
  await state.updateActiveWorkorderStatusByRun(wo.workorder_id, runId, 'done')
  // WO-014: explicit lock-release before cleanupHandled=true (release functions are idempotent)
  await state.releaseScopeLock(runId)
  await state.releaseDbMigrationLock(runId)
  audit.auditScopeLockReleased({
    run_id: runId, workorder_id: wo.workorder_id, agent_id: wo.agent_id,
    orchestration_mode: orchestrationMode,
    reason: 'no-tool-request completed path',
  })
  cleanupHandled = true
  audit.auditJobCompleted({...})
  return { status: 'completed', run_id: runId, workorder_id: wo.workorder_id }
}
```

Eigenschaften:
- **Run-id-spezifisch:** `updateActiveWorkorderStatusByRun(workorder_id, run_id, status)` matcht exakt einen Eintrag (WO-011 Pattern). Nicht `updateWorkorderStatus`, weil derselbe `workorder_id` mehrfach dispatched gewesen sein könnte.
- **Transition-Validität:** `WO_TRANSITIONS['dispatched']` enthält `'done'` (`state-manager.ts:252`); kein invalid-transition-Risiko.
- **Reihenfolge:** Status-Update **vor** Lock-Release, weil der State-Update logisch zuerst kommt (run completed → workorder done → locks released → cleanup done). Funktional vertauschbar (`updateActiveWorkorderStatusByRun` und `releaseScopeLock` mutieren disjunkte State-Bereiche), aber semantisch konsistent zum Erfolgs-Pfad mit Tool-Request (Zeile 786, gleiche Reihenfolge).
- **`cleanupHandled = true` Semantik unverändert:** flag verhindert weiterhin den finally-`failed`-Override. WO-006 finally bleibt 1:1.
- **WO-006/011/014 FAIL- und Lock-Pfade bleiben 1:1:** kein Edit an awaiting_approval, review, human-needed, FAIL-Branches.
- **`updateActiveWorkorderStatusByRun` ist no-op-safe:** wenn `0 Matches` (Race) → `{ updated: false, reason: 'no match' }` (keine Mutation, keine Throw). WO-011 hat das bereits getestet.
- **Audit:** kein neuer Audit-Event nötig — `auditJobCompleted` bleibt der primäre Marker; `auditScopeLockReleased` (WO-014) bleibt der Lock-Marker. Status-Update läuft ohne separaten Event-Schreib (gleicher Pfad wie der Erfolgs-mit-Tool-Request-Pfad).

Alternativen verworfen:
- **Variante 2 (Option B): Preflight `blocked_by`-Resolution toleriert `dispatched` mit terminalem `active_run`.** Verworfen per Tom-Entscheidung. Preflight bleibt strict; jede Status-Toleranz im Preflight würde die Schutzfunktion gegen wirklich-laufende WOs aushebeln und State-Inspektion komplexer machen.
- **Variante 3: Auto-`done`-Markierung im finally-Block.** Verworfen: finally läuft nur bei `!cleanupHandled`; die intentional-completed-Pfade setzen `cleanupHandled = true` und würden den finally-Update überspringen. Das spiegelt genau das aktuelle Symptom.
- **Variante 4: `removeStaleDispatchedActiveWorkorder`-Auto-Aufruf nach dispatch.** Verworfen: Dispatcher darf nicht in Operator-Tooling-Pfade eingreifen; State-History-Cleanup ist Operator-Verantwortung (WO-015).
- **Variante 5: Erweiterung von `endRun` um auto-`active_workorders`-Update.** Verworfen: würde Run-Bookkeeping mit WO-Bookkeeping verschmelzen; verletzt Single-Responsibility und macht State-Manager-Helper schwerer zu verstehen.

In allen Varianten:
- `runtime_state.json` wird **NIE** direkt per File-Write editiert — alle Mutations laufen über `state-manager.ts`'s `mutate()`-Lock (existing `updateActiveWorkorderStatusByRun`).
- Kein neuer Audit-Event-Schema-Edit; kein neuer EventType-String.
- Kein Eingriff in `governance-validator.ts`, `scheduler-preflight.ts`, `review-pipeline.ts`, `system/workorders/cli/**`, `system/approval/**`, `services/scheduler-api/**`, `risk-categories.ts`, `workorder.schema.json`, `terminal-wo-reset-cli.ts`.
- `state-manager.ts` bleibt 1:1 (existing Funktionen unverändert; keine neuen Helper).
- Production-Default-Verhalten:
  - **Erfolgs-Pfad mit Tool-Request:** unverändert (Zeile ~786 setzt bereits `'done'`).
  - **No-tool-request completed-Pfad:** setzt jetzt zusätzlich `'done'` — neue Symmetrie zur Erfolgs-mit-Tool-Variante.
  - **awaiting_approval-Pfad:** unverändert (`updateActiveWorkorderStatusByRun(..., 'awaiting_approval')` bereits aktiv).
  - **review-rewrite-Pfad:** unverändert (`updateActiveWorkorderStatusByRun(..., 'review')` bereits aktiv).
  - **human-needed-Pfad:** unverändert (`updateActiveWorkorderStatusByRun(..., 'awaiting_approval')` bereits aktiv).
  - **FAIL-Pfade (catch-Block):** unverändert (`updateActiveWorkorderStatusByRun(..., 'failed')` bereits aktiv).
  - **finally-Defense-in-Depth (WO-006):** unverändert.

---

## Workorder

```yaml
workorder_id: "WO-governance-016"
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
      - system/control-plane/dispatcher.ts
        (insbesondere: Zeile 530-544 no-tool-request completed-Pfad — die EINE
        Edit-Stelle. Zusätzlich Zeile 783-795 success-mit-Tool-Pfad als
        Symmetrie-Vorlage, Zeile 580-595 awaiting_approval-Pfad als
        Reihenfolge-Vorlage, Zeile 800-806 catch-Block, Zeile 807-831
        finally-Block. Bestätige dass WO-014-Lock-Release-Edits, WO-006-
        cleanupHandled-Flag-Semantik, WO-011-Status-Update-Pattern alle
        intakt bleiben.)
      - system/state/state-manager.ts
        (insbesondere: WO_TRANSITIONS Zeile 250-258 — bestätige dass
        dispatched → done erlaubt ist; updateActiveWorkorderStatusByRun
        Zeile ~408 — bestätige dass die Funktion 0/1/N-Match-Verhalten
        sauber zurückgibt und mutate()-atomic ist; KEINE Änderung an dieser
        Datei.)
      - system/control-plane/__tests__/dispatcher-fail-cleanup.test.ts
        (insbesondere: Test 9 'Erfolgsfall (no-tool-request)' Zeile 325-350 —
        prüft aktuell `notEqual(woEntry?.status, 'failed')`; muss nach WO-016
        auf `equal(woEntry?.status, 'done')` aktualisiert werden. Test 29
        'WO-014 E-1' Zeile 754-779 — prüft aktuell `notEqual(... 'failed')`
        mit Kommentar zu WO-006 Test 8 Behavior; muss nach WO-016 auf
        `equal('done')` aktualisiert werden. WO-014 E-2/E-3/E-4 (awaiting_
        approval / review / human-needed) bleiben 1:1.)
      - system/control-plane/__tests__/smoke-test.ts
        (Test 6 'Dispatcher E2E — write → completed' nutzt Tool-Request-Pfad
        und sollte unverändert PASS bleiben. Falls ein Test no-tool-request
        nutzt, ggf. Assertion auf 'done' ergänzen — aber primär durch
        9/9 PASS verifizieren.)
      - system/workorders/schemas/workorder.schema.json (read-only Referenz)
      - system/workorders/lifecycle/wo_lifecycle_v1.md
        (Lifecycle-Definition; 'done' ist terminaler Status für completed-
        Workorders.)
      - system/workorders/nutrition/batches/BATCH-NUTRITION-P1-001-db-foundation.md
        (Test-Anwendungsfall — nach WO-016-Closure soll WO-nutrition-002 nicht
        mehr durch unblocked WO-nutrition-001 Preflight HOLD treffen.)
      - system/workorders/nutrition/drafts/WO-GOVERNANCE-P1-011-dispatcher-terminal-status-on-fail.md
        (Pattern-Vorlage für updateActiveWorkorderStatusByRun-Aufruf.)
      - system/workorders/nutrition/drafts/WO-GOVERNANCE-P1-014-finally-lock-release-on-non-terminal-paths.md
        (Pattern-Vorlage für Edits an cleanupHandled = true-Pfaden;
        Reihenfolge-Vorlage für Status-Update + Lock-Release.)

      Identifiziere die exakte Stelle:
        - dispatcher.ts Zeile 530-544: no-tool-request completed-Pfad.
        - INS:
            await state.updateActiveWorkorderStatusByRun(wo.workorder_id, runId, 'done')
          DIREKT NACH:
            await state.endRun(runId, 'completed')
          UND VOR:
            await state.releaseScopeLock(runId)
        - Optional: Inline-Kommentar `// WO-016: mark active_workorders as done so dependents can satisfy blocked_by`
        - KEINE Änderung an anderen if/else-Branches in dispatcher.ts.
        - KEINE Änderung an state-manager.ts.

      Schreibe architecture_notes mit gewählter Variante (Variante 1 = Option A).
      Bestätige, dass:
        - scheduler-preflight.ts UNVERÄNDERT bleibt.
        - state-manager.ts UNVERÄNDERT bleibt (Helper bereits existent).
        - terminal-wo-reset-cli.ts UNVERÄNDERT bleibt (WO-010/015 1:1).
        - governance-validator.ts UNVERÄNDERT bleibt.
        - review-pipeline.ts UNVERÄNDERT bleibt.
        - WO-006 cleanupHandled-Flag-Semantik UNVERÄNDERT bleibt.
        - WO-014 Lock-Release-Block-Reihenfolge UNVERÄNDERT bleibt
          (Status-Update kommt VOR Lock-Release; Lock-Release-Block bleibt
          byte-identisch).
        - awaiting_approval / review / human-needed Pfade UNVERÄNDERT bleiben.
        - FAIL-Pfade (catch-Block, finally-Block) UNVERÄNDERT bleiben.
        - WO_TRANSITIONS UNVERÄNDERT bleibt.
    </analyze>

    <implement>
      Implementiere Variante 1 (Status-Update vor cleanupHandled = true auf
      no-tool-request completed-Pfad).

      Schritt 1 — dispatcher.ts: genau ein neuer await-Aufruf.

      In dispatcher.ts ~Zeile 530-544, im no-tool-request-Branch:

        if (!toolReq) {
          await state.endRun(runId, 'completed')
          // WO-016: mark active_workorders as done so dependents can satisfy blocked_by
          await state.updateActiveWorkorderStatusByRun(wo.workorder_id, runId, 'done')
          // WO-014: explicit lock-release before cleanupHandled=true (release functions are idempotent)
          await state.releaseScopeLock(runId)
          await state.releaseDbMigrationLock(runId)
          audit.auditScopeLockReleased({...})
          cleanupHandled = true
          audit.auditJobCompleted({...})
          return { status: 'completed', run_id: runId, workorder_id: wo.workorder_id }
        }

      KEINE Änderung an anderen Pfaden. KEINE neue State-Manager-Funktion.
      KEINE neue Audit-Event-Funktion. KEIN neuer Import (state und audit
      sind bereits importiert). KEIN Try/Catch um den neuen await — die
      Funktion ist no-op-safe (gibt {updated: false, reason: 'no match'} bei
      0 Matches zurück, ohne Throw).

      Schritt 2 — dispatcher-fail-cleanup.test.ts: zwei Test-Updates + ein
      neuer additiver Test.

      Update 1 (Test 9 'Erfolgsfall (no-tool-request)' ~Zeile 325-350):
        - assert.notEqual(woEntry?.status, 'failed', ...) → bleibt erhalten als
          Defense-in-Depth.
        - ZUSÄTZLICH: assert.equal(woEntry?.status, 'done',
          'WO-016: no-tool-request completed muss active_workorders auf done setzen').
        - Kommentar im Test aktualisieren: 'Pre-existing behavior' → 'Post-
          WO-016 behavior: WO-status wird auf done gesetzt'.

      Update 2 (Test 29 'WO-014 E-1: no-tool-request completed path releases
      scope_lock' ~Zeile 754-779):
        - assert.notEqual(woEntry?.status, 'failed', ...) → bleibt erhalten.
        - ZUSÄTZLICH: assert.equal(woEntry?.status, 'done',
          'WO-016: no-tool-request completed setzt active_workorders auf done').
        - Kommentar aktualisieren: 'WO-006 Test 8 Behavior: WO-Status bleibt
          dispatched' → 'Post-WO-016: WO-Status ist done (vorher dispatched per
          WO-006 Test 8 Behavior; WO-016 hat das symmetrisch zum success-mit-
          Tool-Pfad ergänzt).'

      Neuer Test (zusätzlich):
        - 'WO-016: no-tool-request completed → updateActiveWorkorderStatusByRun
          aufgerufen, active_workorders.status === done, locks released'.
        - Pre-populate active_workorders mit einem fresh dispatched-Entry für
          die Test-WO. Mock liefert OrchestratorIntent ohne Tool-Request.
          Nach Dispatch: assertet result.status === 'completed',
          woEntry.status === 'done', lockExistsFor(run_id) === false,
          dbMigrationLock-Status korrekt.
        - Verifikation der Reihenfolge per Source-Inspection oder via
          Side-Effect-Order: zuerst endRun, dann updateActiveWorkorderStatusByRun,
          dann releaseScopeLock + releaseDbMigrationLock.

      Test-Updates dürfen WO-014 E-2/E-3/E-4 NICHT verändern (awaiting_approval,
      review-rewrite, human-needed; bleiben 1:1).
      Test-Updates dürfen FAIL-Pfad-Tests (Tests 1-7, WO-011-Tests) NICHT
      verändern.

      Schritt 3 — smoke-test.ts: read-only Verifikation, keine Änderung
      erforderlich, falls 9/9 PASS bleibt.

      Falls Test 6 oder ein anderer Test im smoke-test.ts auf den no-tool-
      request-Pfad zugreift und auf den alten 'dispatched'-Status assertiert,
      analoge Update-Logik wie in dispatcher-fail-cleanup.test.ts: assertion
      auf 'done' aktualisieren. Andernfalls smoke-test.ts byte-identisch
      lassen.

      Final:
        - pnpm tsc --noEmit muss clean sein.
        - npx tsx --test system/control-plane/__tests__/dispatcher-fail-cleanup.test.ts
          → all PASS (32 bestehende inkl. 2 angepasste + 1 neuer = 33).
        - npx tsx system/control-plane/__tests__/smoke-test.ts
          → 9/9 PASS.
        - npx tsx --test system/control-plane/__tests__/terminal-wo-reset-cli.test.ts
          → 65/65 PASS (read-only Regressions-Check).
        - npx tsx system/workorders/cli/run-batch.ts
          system/workorders/nutrition/batches/BATCH-NUTRITION-P1-001-db-foundation.md
          --dry-run → READY_TO_RUN (read-only).
        - post_review_required: true.

      Implementer führt KEINEN Live-`--run` von BATCH-NUTRITION-P1-001 aus.
      Das ist eine Tom-Aktion nach Approval von Spark-D-Review und Closure.
    </implement>

    <constraints>
      Kein Bypass von Preflight oder Governance-Validator.
      Keine Erhöhung von MAX_REWRITE_LOOPS.
      Kein --force / --all / --bypass / --skip-validator Flag (keine CLI-
        Änderung in dieser WO).
      Keine Direkt-Manipulation von runtime_state.json per fs.writeFileSync —
        alle Mutations laufen über state-manager.ts mutate()-Lock
        (updateActiveWorkorderStatusByRun bereits aus WO-011).
      Keine Direkt-Manipulation von system/state/*.jsonl (audit-Logs).
      Keine Änderung an state-manager.ts.
      Keine Änderung an audit-writer.ts.
      Keine Änderung an scheduler-preflight.ts.
      Keine Änderung an governance-validator.ts.
      Keine Änderung an review-pipeline.ts.
      Keine Änderung an terminal-wo-reset-cli.ts.
      Keine Änderung an batch-loader.ts oder system/workorders/cli/**.
      Keine Änderung an services/scheduler-api/**.
      Keine Änderung an workorder.schema.json oder risk-categories.ts.
      Keine Mutation von approval-Queue-Dateien (system/approval/**).
      Kein system_stop berühren.
      Kein scope_locks berühren über das WO-014-bereits-implementierte
        Release-Pattern hinaus.
      Kein Workorder-File (.md) modifizieren.
      Keine neuen npm-Dependencies; package.json unverändert.
      Keine neuen exportierten Funktionen oder neue Imports im Dispatcher.
      Keine Veränderung der Reihenfolge endRun → releaseScopeLock →
        releaseDbMigrationLock (Status-Update wird ZWISCHEN endRun und
        releaseScopeLock eingefügt — minimaler Diff).
      KEIN Edit an awaiting_approval / review / human-needed / FAIL-Pfaden.
      KEIN Edit an success-mit-Tool-Pfad (Zeile ~786, bleibt 1:1).
      KEIN Edit an WO-006 finally-Block.
      KEIN Edit an WO-011 catch-Block.
      KEIN Edit an WO-014 Lock-Release-Aufrufen oder Audit-Reasons.
      KEIN Edit an WO_TRANSITIONS.
      post_review_required: true.
    </constraints>

    <on_error>
      Bei TypeScript-Fehler: {"status": "FAIL", "issues": ["tsc: ..."]}.
      Bei nötigem Edit von state-manager.ts: {"status": "STOP",
        "issues": ["state-manager.ts is files_blocked; updateActiveWorkorder-
        StatusByRun bereits aus WO-011 vorhanden — nur aufrufen, nicht ändern"]}.
      Bei nötigem Edit von scheduler-preflight.ts: {"status": "STOP",
        "issues": ["Preflight bleibt strict per Tom-Entscheidung gegen Variante 2"]}.
      Bei nötigem Edit von governance-validator.ts: {"status": "STOP"}.
      Bei nötigem Edit von review-pipeline.ts: {"status": "STOP"}.
      Bei nötigem Edit von terminal-wo-reset-cli.ts: {"status": "STOP"}.
      Bei nötigem Edit von services/scheduler-api/**: {"status": "STOP"}.
      Bei nötigem Edit von batch-loader.ts: {"status": "STOP"}.
      Bei nötigem Edit von workorder.schema.json: {"status": "STOP"}.
      Bei nötiger neuer npm-Dependency: {"status": "ESCALATE"}.
      Bei Migration / Schema-Änderung erkannt: {"status": "ESCALATE",
        "issues": ["route to db-migration-agent"]}.
      Bei Security-Befund: {"status": "STOP"}.
      Bei rotem Test nach Anpassung: {"status": "FAIL",
        "issues": ["test: <name> — actual=<x> expected=<y>"]}.
      Bei Notwendigkeit, ein anderes if/else-Branch in dispatcher.ts zu
        modifizieren: {"status": "ESCALATE",
        "issues": ["out of WO-016 scope — separate WO"]}.
      Bei mehrdeutigem Test-Update (z. B. unklar, ob smoke-test.ts angepasst
        werden muss): {"status": "ESCALATE"}.
      Bei fehlendem Kontext: {"status": "BLOCKED"}.
    </on_error>
  </task>

scope_files:
  - "system/control-plane/dispatcher.ts"
  - "system/control-plane/__tests__/dispatcher-fail-cleanup.test.ts"
  - "system/control-plane/__tests__/smoke-test.ts"

context_files:
  - "system/state/state-manager.ts"
  - "system/control-plane/scheduler-preflight.ts"
  - "system/workorders/schemas/workorder.schema.json"
  - "system/workorders/lifecycle/wo_lifecycle_v1.md"
  - "system/workorders/nutrition/batches/BATCH-NUTRITION-P1-001-db-foundation.md"
  - "system/workorders/nutrition/drafts/WO-GOVERNANCE-P1-006-dispatcher-fail-cleanup.md"
  - "system/workorders/nutrition/drafts/WO-GOVERNANCE-P1-011-dispatcher-terminal-status-on-fail.md"
  - "system/workorders/nutrition/drafts/WO-GOVERNANCE-P1-014-finally-lock-release-on-non-terminal-paths.md"
  - "system/workorders/nutrition/drafts/WO-GOVERNANCE-P1-015-state-history-cleanup.md"

acceptance_criteria:
  - "Im no-tool-request completed-Pfad in dispatcher.ts (~Zeile 530-544) wird state.updateActiveWorkorderStatusByRun(wo.workorder_id, runId, 'done') aufgerufen, BEVOR cleanupHandled = true gesetzt wird"
  - "Der neue Aufruf steht direkt NACH state.endRun(runId, 'completed') und VOR state.releaseScopeLock(runId) (Reihenfolge identisch zum success-mit-Tool-Pfad in dispatcher.ts ~Zeile 783-787)"
  - "Inline-Kommentar identifiziert den Aufruf als WO-016-Edit"
  - "Keine Änderung an awaiting_approval / review / human-needed / FAIL-/Tool-Request-Erfolgs-Pfaden in dispatcher.ts"
  - "Keine Änderung an WO-006 cleanupHandled-Flag-Semantik (flag bleibt = 'kein finally-failed-Status-Override')"
  - "Keine Änderung an WO-014 Lock-Release-Aufrufen (Reihenfolge: endRun → updateActiveWorkorderStatusByRun → releaseScopeLock → releaseDbMigrationLock → auditScopeLockReleased → cleanupHandled = true → auditJobCompleted → return)"
  - "Keine Änderung an WO-011 catch-Block oder WO-006 finally-Block"
  - "Keine Änderung an state-manager.ts (updateActiveWorkorderStatusByRun bereits vorhanden, Signatur 1:1)"
  - "Keine Änderung an audit-writer.ts (kein neuer EventType, keine neue Convenience-Funktion)"
  - "Keine Änderung an scheduler-preflight.ts (Preflight bleibt strict per Tom-Entscheidung)"
  - "Keine Änderung an governance-validator.ts, review-pipeline.ts, terminal-wo-reset-cli.ts"
  - "Keine Änderung an workorder.schema.json, risk-categories.ts, batch-loader.ts, services/scheduler-api/**"
  - "Keine Mutation von approval-Queue-Dateien (system/approval/**)"
  - "Kein neuer npm-Import; package.json unverändert"
  - "Test 'Erfolgsfall (no-tool-request)' in dispatcher-fail-cleanup.test.ts (~Zeile 325-350) prüft assert.equal(woEntry?.status, 'done') zusätzlich zu assert.notEqual('failed')"
  - "Test 'WO-014 E-1: no-tool-request completed path releases scope_lock' (~Zeile 754-779) prüft assert.equal(woEntry?.status, 'done') zusätzlich zu assert.notEqual('failed')"
  - "Neuer additiver Test 'WO-016: no-tool-request completed → status done + locks released' verifiziert: result.status === 'completed', woEntry.status === 'done', lockExistsFor(run_id) === false, dbMigrationLock unverletzt"
  - "WO-014 E-2 (awaiting_approval), E-3 (review-rewrite source-inspection), E-4 (human-needed) bleiben 1:1 unverändert"
  - "Bestehende Tests 1-7 in dispatcher-fail-cleanup.test.ts (FAIL-Pfade, WO-006/011) bleiben 1:1 unverändert"
  - "Test-Run: npx tsx --test system/control-plane/__tests__/dispatcher-fail-cleanup.test.ts → all PASS (32 bestehende inkl. 2 angepasste + 1 neuer = 33)"
  - "Test-Run: npx tsx system/control-plane/__tests__/smoke-test.ts → 9/9 PASS (read-only Regressions-Check; falls Anpassung nötig, dann auf 'done' assertieren)"
  - "Test-Run: npx tsx --test system/control-plane/__tests__/terminal-wo-reset-cli.test.ts → 65/65 PASS (read-only Regressions-Check; keine Code-Datei in scope)"
  - "Transition dispatched → done ist in WO_TRANSITIONS bereits erlaubt (state-manager.ts:252) — keine WO_TRANSITIONS-Änderung"
  - "Nach Closure: Nutrition Batch 001 --dry-run bleibt READY_TO_RUN"
  - "pnpm tsc --noEmit clean"

negative_constraints:
  - "NIEMALS außerhalb scope_files schreiben"
  - "NIEMALS state-manager.ts ändern (updateActiveWorkorderStatusByRun ist bereits vorhanden — nur aufrufen)"
  - "NIEMALS audit-writer.ts ändern (kein neuer EventType, keine neue Convenience)"
  - "NIEMALS scheduler-preflight.ts ändern (Variante 2 verworfen)"
  - "NIEMALS governance-validator.ts ändern"
  - "NIEMALS review-pipeline.ts ändern"
  - "NIEMALS terminal-wo-reset-cli.ts ändern (WO-010/015 1:1)"
  - "NIEMALS batch-loader.ts oder system/workorders/cli/** ändern"
  - "NIEMALS services/scheduler-api/** ändern"
  - "NIEMALS risk-categories.ts ändern"
  - "NIEMALS workorder.schema.json ändern"
  - "NIEMALS runtime_state.json direkt editieren — nur über state-manager.ts mutate()"
  - "NIEMALS system/state/*.jsonl direkt editieren — nur über audit-writer.ts"
  - "NIEMALS approval-Queue-Dateien (system/approval/**) editieren"
  - "NIEMALS system_stop berühren"
  - "NIEMALS scope_locks- oder db_migration_lock-Mutationen über die WO-014-bereits-implementierten Release-Aufrufe hinaus hinzufügen"
  - "NIEMALS Workorders ausführen (kein run-batch --run)"
  - "NIEMALS Migrationen ausführen oder Supabase-Befehle ausführen"
  - "NIEMALS Workorder-Files (*.md) modifizieren"
  - "NIEMALS package.json ändern"
  - "NIEMALS neue npm-Dependencies hinzufügen"
  - "NIEMALS bestehende Tests deaktivieren oder skip-pen (xtest/it.skip/test.skip/xit)"
  - "NIEMALS ENV-Dateien lesen oder schreiben"
  - "NIEMALS WO-006 cleanupHandled-Flag-Semantik ändern"
  - "NIEMALS WO-011 catch-Block-Verhalten ändern"
  - "NIEMALS WO-014 Lock-Release-Reihenfolge oder Audit-Reasons ändern"
  - "NIEMALS WO-014 E-2/E-3/E-4 Tests ändern (awaiting_approval/review-rewrite/human-needed)"
  - "NIEMALS finally-Block (WO-006) verändern"
  - "NIEMALS WO_TRANSITIONS in state-manager.ts ändern (dispatched → done bereits erlaubt)"
  - "NIEMALS awaiting_approval oder review auf done oder failed setzen"
  - "NIEMALS einen Try/Catch um den neuen updateActiveWorkorderStatusByRun-Aufruf bauen (Funktion ist no-op-safe per WO-011-Vorlage)"
  - "NIEMALS einen --force / --all / --bypass / --skip-validator Flag bauen (keine CLI-Änderung)"
  - "NIEMALS dispatcher-fail-cleanup.test.ts Tests 1-7 oder WO-014 E-2/E-3/E-4 ändern"

files_blocked:
  - "system/state/state-manager.ts"
  - "system/state/audit-writer.ts"
  - "system/control-plane/scheduler-preflight.ts"
  - "system/control-plane/governance-validator.ts"
  - "system/control-plane/review-pipeline.ts"
  - "system/control-plane/terminal-wo-reset-cli.ts"
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
  - "npx tsx --test system/control-plane/__tests__/dispatcher-fail-cleanup.test.ts"
  - "npx tsx system/control-plane/__tests__/smoke-test.ts"
  - "npx tsx --test system/control-plane/__tests__/terminal-wo-reset-cli.test.ts"
  - "npx tsx system/workorders/cli/run-batch.ts system/workorders/nutrition/batches/BATCH-NUTRITION-P1-001-db-foundation.md --dry-run"

required_skills: ["gsd-v2"]
optional_skills: ["typescript-pro", "debugging-strategies"]
blocked_by:      []
```

---

## Notes

- **Filename ↔ workorder_id:** Filename `WO-GOVERNANCE-P1-016-no-tool-request-status-update.md` folgt der Auftrags-Convention; `workorder_id: WO-governance-016` folgt der Schema-Regex `^WO-[a-z]+-[0-9]+$`. Orchestrator/Scheduler nutzen das `workorder_id`-Feld.
- **`requires_approval: true`** ist Pflicht für `risk_category: architecture` per `CLAUDE.md` Cautious-Regel (Spark D mandatory, kein Auto-Retry).
- **`agent_id: senior-coding-agent`** — registriert in `system/agent-registry/agents.json`, `type: executor_senior`. Wird durch `AGENT_VALIDATOR_MAP['senior-coding-agent'] = 'micro-executor'` (WO-005) korrekt zu `ALLOWED_AGENTS`-Wert normalisiert. `risk_level` wird via WO-009-Mapping auf `'medium'` normalisiert.
- **`rollback_hint` nicht erforderlich** per Schema if/then (nur bei `db-migration`).
- **Verhältnis zu WO-006 / WO-011 / WO-014 / WO-015:**
  - WO-006 etablierte FAIL-Cleanup mit cleanupHandled-Flag.
  - WO-011 fügte `updateActiveWorkorderStatusByRun` als run-id-spezifischen Status-Update hinzu.
  - WO-014 fügte explizites Lock-Release auf cleanupHandled = true-Pfaden hinzu.
  - WO-015 fügte audit-fähigen Cleanup für *historische* stale-dispatched-Einträge hinzu.
  - **WO-016** schließt die *Live-Symmetrie-Lücke*: der no-tool-request completed-Pfad markiert die Workorder jetzt aktiv als `'done'`, sodass abhängige WOs ihren `blocked_by`-Constraint sauber resolven können — ohne Preflight-Toleranz aufzuweichen, ohne Operator-Cleanup nach jedem Run.
- **Architekturentscheidung Option A (Status-Update vor cleanupHandled = true):** symmetrisch zu WO-014 (Lock-Release vor cleanupHandled = true). Kombiniert mit dem bereits existierenden `updateActiveWorkorderStatusByRun`-Helper aus WO-011 — additiv, ohne State-Manager-Änderung.
- **Architekturentscheidung Option B (Preflight-Toleranz) verworfen:** Preflight bleibt strict; jede Status-Toleranz würde die Schutzfunktion gegen wirklich-laufende WOs aushebeln und State-Inspektion komplexer machen.
- **Transition-Validität:** `WO_TRANSITIONS['dispatched']` enthält `'done'` (`state-manager.ts:252`). Kein invalid-transition-Risiko. Same-state-idempotent über `validateWoStatusTransition`.
- **`updateActiveWorkorderStatusByRun` ist no-op-safe:** bei 0 Matches (Race-Condition) gibt sie `{ updated: false, reason: 'no match' }` zurück, ohne Throw. Bei mehrdeutigem Match (sollte praktisch nie passieren, da run_id eindeutig) gibt sie `{ updated: false, reason: 'ambiguous match (N)' }` zurück. Beides ohne Side-Effect — daher kein Try/Catch im Dispatcher nötig.
- **`scope_files` enthält 3 Files:**
  - `dispatcher.ts` (Primary scope: 1 neuer await-Aufruf + 1 Inline-Kommentar).
  - `dispatcher-fail-cleanup.test.ts` (Secondary scope: 2 Test-Updates + 1 neuer Test).
  - `smoke-test.ts` (Tertiary scope: nur falls Test 6 oder ein anderer Test auf dem alten dispatched-Status assertiert; sonst byte-identisch).
- **`files_blocked` schließt `state-manager.ts`, `audit-writer.ts`, `scheduler-preflight.ts`, `governance-validator.ts`, `review-pipeline.ts`, `terminal-wo-reset-cli.ts`, `risk-categories.ts`, `workorder.schema.json`, `services/scheduler-api/**`, `system/workorders/cli/**`, `system/approval/**`, `runtime_state.json`, `*.jsonl`, `package.json`, ENV-Files explizit aus** — alle Mutations laufen über `state-manager.ts`-Helper, alle Audit-Events über `audit-writer.ts`-Convenience-Funktionen, beide bereits aus WO-011/006-Lifecycle vorhanden.
- **Audit-Trail:** kein neuer Audit-Event-Typ. Der bestehende `auditJobCompleted`-Aufruf (`event: 'job_completed'`) markiert weiterhin den Erfolg; `auditScopeLockReleased` (WO-014) markiert das Lock-Release. Der Status-Update läuft unter dem bestehenden `mutate()`-Lock und ist im `runtime_state.json`-Diff sichtbar (audit-fähig per `audit.error.jsonl` bei invalid-transition — was hier aber nicht vorkommen kann, da `dispatched → done` valide ist).
- **Lifecycle-Pfad:** Erwartet `done` → `reviewed` (architecture-review + Spark D mandatory) → `closed`. Auto-Retry **deaktiviert** für `architecture` per `CLAUDE.md` High-Risk-Regel.
- **Bezug zur Geschichte:**
  - Workflow-Test-Sequenz nach WO-005…015-Closure: tsc/smoke/fail-cleanup/terminal-cli alle PASS. Dry-run READY_TO_RUN. Live-Run ergibt: WO-nutrition-001 dispatched-completed mit fresh `RUN-20260503-4291` als `dispatched`-Eintrag (per WO-006 Test 8 Behavior, WO-014 hat das bewusst nicht angefasst).
  - WO-nutrition-002 trifft Preflight HOLD: `blocked_by: ['WO-nutrition-001']` ist nicht erfüllt, weil neuer dispatched-Eintrag als „aktiv laufend" gewertet wird.
  - WO-015-Operator-Cleanup ist möglich, aber nicht der korrekte Workflow — der Live-Eintrag ist kein "stale historical entry", sondern ein im Dispatcher fehlender Status-Update.
  - **Post-WO-016-Erwartung:** Nutrition Batch 001 `--run` (nach Tom-Approval und Closure) erreicht WO-nutrition-002 → erwartete Pause am `db-migration`-Approval-Gate (Tom-Approval erforderlich für DB-Migration). WO-nutrition-001-Eintrag bleibt nach Run als `'done'` in `active_workorders` (bzw. terminal-cleared via WO-010 wenn Operator es wünscht — beides spec-konform).
- **Scope-Klarstellung:**
  - **Primary scope:** `dispatcher.ts` (eine einzige Edit-Stelle: Zeile ~530-544, nur ein zusätzlicher await-Aufruf mit Inline-Kommentar).
  - **Secondary scope:** `dispatcher-fail-cleanup.test.ts` (zwei bestehende Tests aktualisieren, einen neuen Test ergänzen).
  - **Tertiary scope:** `smoke-test.ts` (read-only Verifikation; nur falls Test ein no-tool-request-Pfad-Verhalten assertiert, das jetzt 'done' wird).
- **Production-Default Verhalten:** vor WO-016: `dispatched`-Akkumulation, Folge-WO blockiert. Nach WO-016: WO wird sauber als `done` markiert, Folge-WO kann blocked_by resolven, Preflight passiert ohne HOLD.
- **Tom darf nicht selbst granten** — die WO-Approval folgt dem normalen Spark-D-Mandatory-Review-Flow.

---

*Draft erzeugt: 2026-05-03 — gemäß `template_implementation_medium.md`, Workflow-Test-Befund Nutrition Batch 001 Final Run nach WO-015-Closure (frischer dispatched-Eintrag bleibt nach no-tool-request completed liegen, WO-nutrition-002 Preflight HOLD trotz vollständig bereinigtem active_workorders-Stand), und WO-GOVERNANCE-P1-011 + WO-GOVERNANCE-P1-014 als Pattern-Vorlagen für additive Status-Update-Aufrufe ohne Signatur-Änderungen oder neue State-Manager-/Audit-Helper.*

---

## Completion Note

Implementation reviewed PASS. no-tool-request completed path now marks the matching active_workorders entry done via workorder_id + run_id while preserving active_runs completed, lock release, awaiting_approval/review semantics and failure cleanup. Code commit: `10c3ac6`.

*Closed: 2026-05-03.*
