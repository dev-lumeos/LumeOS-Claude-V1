# WO-GOVERNANCE-P1-014 — Lock-Release on Non-Terminal Paths V1

**Status:** closed
**Phase:** 1 — Governance Tooling
**Source:** Workflow-Test-Befund nach Closure von WO-005/006/007/008/009/010/011/012/013: `BATCH-NUTRITION-P1-001-db-foundation` `--run` produziert erstmals `WO-nutrition-001 [dispatched] Dispatcher status: completed`. Aber `WO-nutrition-002 [preflight_blocked] Preflight HOLD` — der nachfolgende WO wird vom Preflight gehalten, vermutlich wegen Scope-Lock-Konflikt aus dem completed-no-tool-request-Pfad von WO-001. Dispatcher-Code-Inspektion bestätigt: 4 `cleanupHandled = true`-Pfade rufen NICHT `releaseScopeLock(runId)` / `releaseDbMigrationLock(runId)` vor Return auf, und der finally-Block ist `if (!cleanupHandled)`-gegated → Locks bleiben bis TTL-Expiry (10 Min) reserviert.
**Template:** `system/workorders/templates/template_implementation_medium.md`
**Lifecycle:** `wo_generated` → `graph_validated` → `queue_released` → `ready` → `dispatched` → `running` → `done` → `reviewed` (architecture/Spark D mandatory) → `closed` (per `wo_lifecycle_v1.md`)

---

## Out of Scope

- Historical stuck-`dispatched`-Einträge in `active_workorders` (separate Followup `WO-015-state-history-cleanup`).
- Terminal-WO-Reset-CLI Änderungen (WO-010 unangetastet).
- `system_stop` CLI (separate Followup `WO-016-stop-rule-cli`).
- `selected_agent`/`risk_level`/Array-Defensive/Prompt-Contract-Änderungen (bereits in WO-005/009/012/013 erledigt).
- Dispatcher FAIL/Cleanup-Logik (bereits in WO-006/011 — bleibt 1:1 erhalten).
- Smoke-Test/Reviewer-Injection (bereits in WO-007/008 erledigt).
- Batch-Loader-Änderungen.
- Nutrition-DB-Implementation oder Supabase-Migration-Execution.
- Approval-Auto-Granting.
- `MAX_REWRITE_LOOPS`-Anpassung.
- Validator-Strenge-Änderungen.
- Schema-Erweiterung von `OrchestratorIntent` Type.
- Lifecycle-Transition-Tabelle (`WO_TRANSITIONS`) ändern.

---

## Problem Statement

Nach Closure der WO-005-bis-WO-013-Sequenz erreicht `BATCH-NUTRITION-P1-001-db-foundation` `--run` erstmals einen erfolgreichen Dispatch:
```
WO-nutrition-001  [dispatched]  Dispatcher status: completed
WO-nutrition-002  [preflight_blocked]  Preflight HOLD
```

Dispatcher-Code-Inspektion (`grep -nE "cleanupHandled = true|releaseScopeLock|releaseDbMigrationLock"`) zeigt 4 Pfade, die `cleanupHandled = true` setzen, aber NICHT vor Return Locks freigeben:

| Zeile | Pfad | Status-Wert | Lock-Release vor Return? |
|---|---|---|---|
| 531-536 | no-tool-request completed | `completed`-Result, WO-Status bleibt `dispatched` | **NEIN** |
| ~543 (gefolgt von 533) | (siehe oben — ist Zeile 533 `cleanupHandled = true` für no-tool-request) | — | — |
| ~573-577 | Approval-Gate awaiting_approval | `awaiting_approval` | **NEIN** |
| ~685-689 | Review-Pipeline review (Rewrite-Limit) | `review` | **NEIN** |
| ~712-716 | Review-Pipeline human-needed | `awaiting_approval` | **NEIN** |

Der WO-006-finally-Block (Zeile ~789) ist gated:
```ts
} finally {
  if (!cleanupHandled) {
    try { await state.updateActiveWorkorderStatusByRun(wo.workorder_id, runId, 'failed') } catch { ... }
    await state.releaseScopeLock(runId)
    await state.releaseDbMigrationLock(runId)
    audit.auditScopeLockReleased({ ... reason: 'finally cleanup on early failure path' })
  }
}
```

Bei `cleanupHandled = true` läuft der finally-Block NICHT. Bei FAIL-Pfaden (WO-011) ist das Lock-Release explizit per `cleanupHandled = false`-Branch oder im Catch-Block (Zeile 770-772) gelöst — **bei intentional-non-terminalen Pfaden fehlt es**.

**Wirkung im Live-Workflow:**
1. WO-nutrition-001 läuft durch den no-tool-request-Pfad → `result.status === 'completed'`, aber `scope_lock` für `services/nutrition-api/src/...` bleibt reserviert.
2. WO-nutrition-002 hat `blocked_by: WO-nutrition-001` (laut Batch-Spec) erfüllt, geht an Preflight.
3. Scope-Lock-Check in Preflight findet überlappende `scope_files` mit dem stale-active Lock von RUN-20260503-1044 → `HOLD`.
4. Operator muss 10 Min auf TTL-Expiry warten ODER manuell intervenieren.

**Architektonisches Defizit:**
- WO-006 hat Lock-Release auf FAIL-Pfaden gelöst.
- WO-011 hat run-id-spezifischen Status-Update gelöst.
- **Symmetrische Lücke:** intentional-non-terminale Pfade releasen Locks weder explizit noch über finally.
- `cleanupHandled = true` ist als "verhindere falsche `failed`-Überschreibung im finally" gedacht, blockiert aber gleichzeitig den Lock-Release-Teil des finally-Blocks. Single-Flag, doppelte Verantwortung.

**Ziel:** Auf den 4 intentional-non-terminalen Pfaden VOR `cleanupHandled = true` und VOR Return explizit `releaseScopeLock(runId)` und `releaseDbMigrationLock(runId)` aufrufen. WO-006 finally-Block-Garantie für FAIL-Pfade bleibt 1:1 erhalten. WO-011 Run-id-spezifischer Status-Update bleibt 1:1 erhalten. `awaiting_approval`/`review`/`completed`-Status-Werte bleiben unverändert. Pattern: Lock-Release ist Pflicht-Cleanup nach `acquireScopeLock` — auf JEDEM Return-Pfad — unabhängig vom Status-Wert.

---

## Architekturentscheidung (verbindlich)

**Variante 1: Explizites Lock-Release vor `cleanupHandled = true` auf jedem intentional-non-terminalen Pfad (Default).**

Statt das `cleanupHandled`-Flag zu refactorieren oder den finally-Block zu trennen, werden die 4 Pfade einzeln um explizite Lock-Release-Aufrufe ergänzt:

```ts
// Pre-existing pattern (intentional non-terminal):
await state.endRun(runId, '<status>')
await state.updateActiveWorkorderStatusByRun(wo.workorder_id, runId, '<status>')
// + WO-014: Explicit lock-release (was missing)
await state.releaseScopeLock(runId)
await state.releaseDbMigrationLock(runId)
audit.auditScopeLockReleased({
  run_id: runId, workorder_id: wo.workorder_id, agent_id: wo.agent_id,
  orchestration_mode: orchestrationMode,
  reason: 'intentional non-terminal path: <kontext>',
})
cleanupHandled = true
return { status: '<status>', ... }
```

Eigenschaften:
- **Idempotent:** `releaseScopeLock` und `releaseDbMigrationLock` sind in `state-manager.ts` bereits idempotent (mehrfacher Aufruf safe). WO-006 nutzt das im finally-Block. Doppel-Release auf Erfolgs-Pfaden (Zeile ~755-756 + neue Stellen) ist unkritisch.
- **`cleanupHandled = true` Semantik unverändert:** flag verhindert weiterhin den finally-`failed`-Status-Update. Lock-Release ist nun explizit pre-flag. Single-Responsibility-Wiederherstellung: flag = "kein finally-Override des Status".
- **WO-006 finally-Block bleibt 1:1:** für unerwartete Throw-Pfade ohne expliziten Cleanup wirkt finally weiterhin als Defense-in-Depth.
- **WO-011 Run-id-spezifischer Status-Update bleibt 1:1:** alle 4 Pfade nutzen weiterhin `updateActiveWorkorderStatusByRun(wo.workorder_id, runId, '<status>')` für non-terminale Status-Werte.
- **Audit-Trail:** existierender `auditScopeLockReleased`-Event mit `reason`-Beschreibung des Pfads.

Konkrete Pfade:

1. **No-tool-request completed (Zeile ~531-536):**
   ```ts
   if (!toolReq) {
     await state.endRun(runId, 'completed')
     // WO-014: release locks before cleanupHandled=true
     await state.releaseScopeLock(runId)
     await state.releaseDbMigrationLock(runId)
     audit.auditScopeLockReleased({ ... reason: 'no-tool-request completed path' })
     cleanupHandled = true
     audit.auditJobCompleted(...)
     return { status: 'completed', ... }
   }
   ```
   `active_workorders[(woId, runId)].status` bleibt `dispatched` per WO-006-Test 8 (kein expliziter Status-Update auf `done` für no-tool-request — pre-existing Behavior, NICHT geändert).

2. **Approval-Gate awaiting_approval (Zeile ~573-577):**
   ```ts
   await state.updateActiveWorkorderStatusByRun(wo.workorder_id, runId, 'awaiting_approval')
   await state.endRun(runId, 'awaiting_approval')
   // WO-014: release locks before cleanupHandled=true
   await state.releaseScopeLock(runId)
   await state.releaseDbMigrationLock(runId)
   audit.auditScopeLockReleased({ ... reason: 'approval-gate awaiting_approval' })
   cleanupHandled = true
   return { status: 'awaiting_approval', ... }
   ```

3. **Review-Pipeline review (Zeile ~685-689):**
   ```ts
   await state.endRun(runId, 'failed')
   await state.updateActiveWorkorderStatusByRun(wo.workorder_id, runId, 'review')
   // WO-014: release locks before cleanupHandled=true
   await state.releaseScopeLock(runId)
   await state.releaseDbMigrationLock(runId)
   audit.auditScopeLockReleased({ ... reason: 'review-pipeline rewrite — wo in review' })
   cleanupHandled = true
   ...
   return { status: 'failed', ... }
   ```

4. **Review-Pipeline human-needed (Zeile ~712-716):**
   ```ts
   await state.endRun(runId, 'blocked')
   await state.updateActiveWorkorderStatusByRun(wo.workorder_id, runId, 'awaiting_approval')
   // WO-014: release locks before cleanupHandled=true
   await state.releaseScopeLock(runId)
   await state.releaseDbMigrationLock(runId)
   audit.auditScopeLockReleased({ ... reason: 'review-pipeline human-needed — wo in awaiting_approval' })
   cleanupHandled = true
   ...
   return { status: 'blocked', ... }
   ```

NICHT geändert:
- **Erfolgs-Pfad mit Tool-Request (Zeile ~755-757):** ruft bereits `releaseScopeLock` und `releaseDbMigrationLock` und setzt `cleanupHandled = true`. Bleibt 1:1.
- **Outer Catch-Block (Zeile ~770-772):** ruft bereits Locks-Release. Bleibt 1:1.
- **Finally-Block (Zeile ~789-792):** `if (!cleanupHandled)`-gated; Lock-Release dort wirkt für Edge-Cases. Bleibt 1:1.
- **WO-006 FAIL-Pfade:** alle reinen FAIL-Returns (Validator-FAIL/BLOCKED, REWRITE-Limit, Tool-Auth-Block, Skill-Loader-Block, Files-Scope-Violation Post-Check, callModel-Exception) setzen `cleanupHandled = false` und überlassen Lock-Release dem finally — bleibt 1:1.
- **WO-011 Run-id-spezifischer Status-Update:** unverändert. Alle 4 WO-014-Pfade nutzen weiterhin `updateActiveWorkorderStatusByRun`.
- **`state-manager.ts`:** kein Edit (Lock-Release-Funktionen sind idempotent existing API).
- **`governance-validator.ts`/`scheduler-preflight.ts`/`review-pipeline.ts`/`terminal-wo-reset-cli.ts`:** kein Edit.

Alternativen verworfen:
- **Variante 2: `cleanupHandled` in zwei Flags trennen** (`statusHandled` + `lockHandled`) — würde WO-006-Test-Asserts brechen; größere Diff-Fläche; verändert Semantik aller bestehenden Pfade. Verworfen.
- **Variante 3: finally-Block ungated über cleanupHandled für Lock-Release** — z. B. Lock-Release IMMER in finally, Status-Update nur bei `!cleanupHandled`. Sauberer, aber Doppel-Release-Spam-Audit-Events bei Erfolgs-Pfaden. Variante 1 ist additiv ohne Existing-Behavior-Touch.
- **Variante 4: Helper-Funktion `releaseLocksAndAudit(runId, woId, reason)`** — bündelt 3 Aufrufe pro Pfad. Architektonisch sauber, aber Diff-Fläche ähnlich. Reserviert für Phase-2-Refactoring-WO.

In allen Varianten:
- `runtime_state.json` wird **NIE** direkt per File-Write editiert — alle Mutations über `state-manager.ts` `mutate()`-Lock.
- Audit-Events ausschließlich über `audit-writer.ts`.
- `releaseScopeLock`/`releaseDbMigrationLock` Idempotenz in `state-manager.ts` bleibt — kein Verhaltens-Edit.
- WO-006/011 Garantien 1:1 erhalten.
- Kein neuer Audit-Event-Typ.

---

## Workorder

```yaml
workorder_id: "WO-governance-014"
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
        (besonders die 4 cleanupHandled = true-Pfade:
         - no-tool-request completed (Zeile ~531-536)
         - approval-gate awaiting_approval (Zeile ~573-577)
         - review-pipeline review (Zeile ~685-689)
         - review-pipeline human-needed (Zeile ~712-716)
         und den finally-Block (~789-792) gated mit if (!cleanupHandled);
         Erfolgs-Pfad mit Tool-Request (~755-757) als Pattern-Vorlage für
         expliziten Lock-Release vor cleanupHandled = true)
      - system/state/state-manager.ts
        (releaseScopeLock und releaseDbMigrationLock sind idempotent;
         kein Edit dort nötig — Helper sind bereits multi-call-safe;
         Doku-Kommentar-Erweiterung erlaubt, kein Verhaltens-Edit)
      - system/state/audit-writer.ts
        (auditScopeLockReleased-Convenience existiert; kein neuer Event-Typ nötig)
      - system/control-plane/__tests__/dispatcher-fail-cleanup.test.ts
        (28 bestehende Tests müssen grün bleiben; additive Tests verifizieren
         Lock-Release auf den 4 non-terminalen Pfaden)
      - system/control-plane/__tests__/smoke-test.ts
        (Test 6/7A/7B-Mocks aus WO-007 sehen Erfolgs-Pfade — keine Mock-Anpassung
         erwartet; read-only-Verifikation)
      - system/workorders/lifecycle/wo_lifecycle_v1.md
        (Status-Transitionen unverändert)
      - system/workorders/nutrition/drafts/WO-GOVERNANCE-P1-006-dispatcher-fail-cleanup.md
        (Pattern-Vorlage — Try/Finally Defense-in-Depth)
      - system/workorders/nutrition/drafts/WO-GOVERNANCE-P1-011-dispatcher-terminal-status-on-fail.md
        (Pattern-Vorlage — run-id-spezifischer Status-Update; bleibt unangetastet)
      - system/workorders/nutrition/batches/BATCH-NUTRITION-P1-001-db-foundation.md
        (Live-Befund: WO-nutrition-002 [preflight_blocked] Preflight HOLD nach
         WO-nutrition-001 completed-no-tool-request → Lock-Leak-Beweis)

      Identifiziere die exakten Stellen pro Pfad:
        - Zeilennummer im aktuellen dispatcher.ts.
        - Pre-existing Lock-Release-Aufrufe? (true/false — erwartet false für alle 4)
        - Status-Wert pro Pfad: 'completed' (no-tool), 'awaiting_approval'
          (approval-gate, human-needed), 'review' (review-rewrite).
        - Audit-Reason-String pro Pfad (kontextspezifisch).

      Schreibe architecture_notes mit:
        - gewählter Variante (Variante 1 = Default)
        - Bestätigung: cleanupHandled = true Semantik unverändert
        - Bestätigung: WO-006 FAIL-Cleanup unverändert
        - Bestätigung: WO-011 run-id-Status-Update unverändert
        - Bestätigung: state-manager.ts kein Behavior-Edit
        - Bestätigung: governance-validator.ts/scheduler-preflight.ts/review-pipeline.ts kein Edit
    </analyze>

    <implement>
      Implementiere Variante 1 (explizites Lock-Release vor cleanupHandled = true
      auf den 4 intentional-non-terminalen Pfaden).

      Schritt 1 — dispatcher.ts: pro identifiziertem Pfad einfügen:
        await state.releaseScopeLock(runId)
        await state.releaseDbMigrationLock(runId)
        audit.auditScopeLockReleased({
          run_id: runId,
          workorder_id: wo.workorder_id,
          agent_id: wo.agent_id,
          orchestration_mode: orchestrationMode,
          reason: '<pfad-spezifischer Kontext>',
        })

      Position: VOR `cleanupHandled = true`, NACH `state.endRun(...)` und
      `state.updateActiveWorkorderStatusByRun(...)`.

      Konkrete Pfade:
        A) no-tool-request completed (Zeile ~531-536):
           reason: 'no-tool-request completed path'
        B) approval-gate awaiting_approval (Zeile ~573-577):
           reason: 'approval-gate awaiting_approval'
        C) review-pipeline review-rewrite (Zeile ~685-689):
           reason: 'review-pipeline rewrite — wo in review'
        D) review-pipeline human-needed (Zeile ~712-716):
           reason: 'review-pipeline human-needed — wo in awaiting_approval'

      Schritt 2 — state-manager.ts: KEIN Behavior-Edit. Optional Doku-Kommentar
      auf releaseScopeLock und releaseDbMigrationLock ergänzen, der die
      Idempotenz und WO-014-Wiederverwendung dokumentiert. Kein Pflicht-Edit.

      Schritt 3 — Tests:

      A) smoke-test.ts: read-only-Verifikation. Test 6 (Erfolgsfall mit
      Tool-Request, scope_lock released) bleibt grün; Test 7A (awaiting_approval)
      und Test 7B (blocked) bleiben grün. Falls smoke-test 7A explizit
      lockExistsFor false prüft, ist das nach WO-014 erfüllt — nach pre-WO-014
      Stand möglicherweise nicht; Test bleibt aber grün, da der Test bisher
      nur auf result.status === 'awaiting_approval' prüft (ohne Lock-Assertion).

      B) dispatcher-fail-cleanup.test.ts: bestehende 28 Tests bleiben grün.
      Additive Tests (mindestens 4 — einer pro Pfad):

      Test E-1: no-tool-request completed → scope_lock released.
        Mock callModel: liefert validen OrchestratorIntent OHNE Tool-Request.
        Erwartung: result.status === 'completed';
                   lockExistsFor(result.run_id) === false;
                   active_workorders[(woId, runId)].status === 'dispatched'
                   (pre-existing Behavior, no-tool-request setzt Status nicht
                   auf 'done' — WO-006 Test 8 unverändert).

      Test E-2: approval-gate awaiting_approval → scope_lock released.
        Mock callModel: liefert OrchestratorIntent + ToolRequest mit
        approval-pflichtigem Tool (z. B. supabase migration), KEIN approvalId.
        Erwartung: result.status === 'awaiting_approval';
                   lockExistsFor(result.run_id) === false;
                   active_workorders[(woId, runId)].status === 'awaiting_approval'.

      Test E-3: review-pipeline review-rewrite → scope_lock released.
        Mock-Setup: review-pipeline returnt 'rewrite' nach erfolgreichem
        executeTool. Erwartung: result.status === 'failed' (REWRITE_REQUIRED);
        lockExistsFor(result.run_id) === false;
        active_workorders[(woId, runId)].status === 'review'.
        Hinweis: dieser Test braucht callFastReviewer-Mock (WO-008-Helper),
        der ein review-rewrite-Outcome simuliert.

      Test E-4: review-pipeline human-needed → scope_lock released.
        Analog zu E-3, aber Mock-Reviewer triggert human-needed-Pfad.
        Erwartung: result.status === 'blocked' (HUMAN_NEEDED);
        lockExistsFor(result.run_id) === false;
        active_workorders[(woId, runId)].status === 'awaiting_approval'.

      Tests verwenden eindeutige scope_files pro Test (services/wo014-NNN/...)
      analog zu WO-011/012/013-Pattern. Existing fail-cleanup Tests aus WO-006
      verwenden lockExistsFor — gleicher Helper.

      WICHTIG:
        - cleanupHandled = true bleibt erhalten — verhindert weiterhin
          finally-failed-Status-Override.
        - Status-Werte (completed/awaiting_approval/review/awaiting_approval)
          sind UNVERÄNDERT.
        - Tests dürfen NICHT die Status-Erwartung auf 'done' oder 'failed'
          verschieben.
        - WO-006 Lock-Release-Garantie auf FAIL-Pfaden bleibt 1:1.
        - WO-011 Run-id-spezifischer Status-Update bleibt 1:1.

      Final:
        - pnpm tsc --noEmit clean.
        - smoke-test.ts → 9/9 PASS bleibt.
        - dispatcher-fail-cleanup.test.ts → 28 + ≥4 = ≥32 PASS.
        - Nutrition Batch 001 dry-run → READY_TO_RUN bleibt.
        - Nach Closure: BATCH-NUTRITION-P1-001 --run sollte WO-nutrition-001
          completed UND WO-nutrition-002 erreichen (entweder dispatched oder
          am Approval-Gate pausierend — beides Spec-konform).
        - post_review_required: true.
    </implement>

    <constraints>
      Kein Bypass von Preflight oder Governance-Validator.
      Keine Erhöhung von MAX_REWRITE_LOOPS.
      Kein --force / --skip-validator / --bypass Flag.
      Keine Direkt-Manipulation von runtime_state.json oder system/state/*.jsonl.
      Keine Änderung an services/scheduler-api/**.
      Keine Änderung an batch-loader.ts oder system/workorders/cli/**.
      Keine Änderung an scheduler-preflight.ts.
      Keine Änderung an review-pipeline.ts.
      Keine Änderung an governance-validator.ts.
      Keine Änderung an terminal-wo-reset-cli.ts (WO-010).
      Keine Änderung an risk-categories.ts.
      Keine Änderung an workorder.schema.json.
      Keine Änderung an OrchestratorIntent-Type oder Validator-§0-§8.
      Keine Änderung an parseOrchestratorIntent oder normalizeOrchestratorIntent.
      Keine neuen npm-Dependencies; package.json unverändert.
      cleanupHandled = true Semantik bleibt: flag verhindert finally-failed-Status-
        Override; Lock-Release ist nun explizit pre-flag.
      Status-Werte auf den 4 non-terminalen Pfaden bleiben unverändert
        (completed, awaiting_approval, review, awaiting_approval).
      WO-006 finally-Block bleibt 1:1 (gated mit if (!cleanupHandled), wirkt für
        unerwartete Throw-Pfade als Defense-in-Depth).
      WO-006 Lock-Release-Garantie auf FAIL-Pfaden bleibt 1:1 erhalten — alle
        9 dispatcher-fail-cleanup-Tests aus WO-006-Bestand bleiben grün.
      WO-011 Run-id-spezifischer Status-Update bleibt 1:1 erhalten — alle 8
        WO-011-Tests bleiben grün.
      WO-012 Validator-§0-Array-Defensive bleibt 1:1 erhalten.
      WO-013 OrchestratorIntent-Contract-Prompt bleibt 1:1 erhalten.
      releaseScopeLock und releaseDbMigrationLock Idempotenz in state-manager.ts
        bleibt — kein Verhaltens-Edit dort.
      Kein neuer Audit-Event-Typ — bestehender auditScopeLockReleased wird
        wiederverwendet mit pfad-spezifischem reason.
      post_review_required: true.
    </constraints>

    <on_error>
      Bei TypeScript-Fehler: {"status": "FAIL", "issues": ["tsc: ..."]}.
      Bei Breaking Change in dispatcher-Public-API erkannt: {"status": "ESCALATE"}.
      Bei nötigem Edit von state-manager.ts releaseScopeLock-Behavior:
        {"status": "ESCALATE", "issues": ["state-manager release-Behavior-Change requires separate WO"]}.
      Bei nötigem Edit von governance-validator.ts: {"status": "STOP"}.
      Bei nötigem Edit von scheduler-preflight.ts: {"status": "STOP"}.
      Bei nötigem Edit von review-pipeline.ts: {"status": "STOP"}.
      Bei nötigem Edit von terminal-wo-reset-cli.ts: {"status": "STOP"}.
      Bei nötigem Edit von services/scheduler-api/**: {"status": "STOP"}.
      Bei nötigem Edit von batch-loader.ts: {"status": "STOP"}.
      Bei nötiger neuer npm-Dependency: {"status": "ESCALATE"}.
      Bei rotem Test in dispatcher-fail-cleanup.test.ts oder smoke-test.ts:
        {"status": "FAIL", "issues": ["test: <name> — actual=<x> expected=<y>"]}.
      Bei Behaviour-Bruch in einem WO-006/009/011/012/013-Test:
        {"status": "ESCALATE"}.
      Bei Status-Wert-Drift auf einem der 4 non-terminalen Pfade
        (completed/awaiting_approval/review): {"status": "ESCALATE",
        "issues": ["status value must remain unchanged"]}.
      Bei mehrdeutigem Refusal-Verhalten: {"status": "ESCALATE"}.
      Bei fehlendem Kontext: {"status": "BLOCKED"}.
    </on_error>
  </task>

scope_files:
  - "system/control-plane/dispatcher.ts"
  - "system/state/state-manager.ts"
  - "system/control-plane/__tests__/dispatcher-fail-cleanup.test.ts"
  - "system/control-plane/__tests__/smoke-test.ts"

context_files:
  - "system/state/audit-writer.ts"
  - "system/control-plane/governance-validator.ts"
  - "system/control-plane/scheduler-preflight.ts"
  - "system/control-plane/review-pipeline.ts"
  - "system/workorders/lifecycle/wo_lifecycle_v1.md"
  - "system/workorders/nutrition/drafts/WO-GOVERNANCE-P1-006-dispatcher-fail-cleanup.md"
  - "system/workorders/nutrition/drafts/WO-GOVERNANCE-P1-011-dispatcher-terminal-status-on-fail.md"
  - "system/workorders/nutrition/batches/BATCH-NUTRITION-P1-001-db-foundation.md"

acceptance_criteria:
  - "no-tool-request completed-Pfad (dispatcher.ts ~531-536): VOR cleanupHandled = true werden releaseScopeLock(runId) und releaseDbMigrationLock(runId) aufgerufen, gefolgt von auditScopeLockReleased mit reason: 'no-tool-request completed path'"
  - "approval-gate awaiting_approval-Pfad (dispatcher.ts ~573-577): VOR cleanupHandled = true werden releaseScopeLock(runId) und releaseDbMigrationLock(runId) aufgerufen, gefolgt von auditScopeLockReleased mit reason: 'approval-gate awaiting_approval'"
  - "review-pipeline review-Pfad (dispatcher.ts ~685-689): VOR cleanupHandled = true werden releaseScopeLock(runId) und releaseDbMigrationLock(runId) aufgerufen, gefolgt von auditScopeLockReleased mit reason: 'review-pipeline rewrite — wo in review'"
  - "review-pipeline human-needed-Pfad (dispatcher.ts ~712-716): VOR cleanupHandled = true werden releaseScopeLock(runId) und releaseDbMigrationLock(runId) aufgerufen, gefolgt von auditScopeLockReleased mit reason: 'review-pipeline human-needed — wo in awaiting_approval'"
  - "active_workorders status auf den 4 non-terminalen Pfaden bleibt UNVERÄNDERT: 'dispatched' (no-tool-request, WO-006 Test 8 Behavior), 'awaiting_approval' (approval-gate), 'review' (review-rewrite), 'awaiting_approval' (human-needed)"
  - "Erfolgs-Pfad mit Tool-Request (Zeile ~755-757) bleibt 1:1 — bestehende releaseScopeLock + cleanupHandled-Sequenz unverändert"
  - "Outer Catch-Block (Zeile ~770-772) bleibt 1:1 — bestehender Lock-Release unverändert"
  - "Finally-Block (Zeile ~789-792) bleibt 1:1 — gated mit if (!cleanupHandled), wirkt für unerwartete Throw-Pfade"
  - "WO-006 FAIL-Cleanup-Logik bleibt 1:1 erhalten — alle reinen FAIL-Pfade ohne cleanupHandled = true setzen weiterhin fail-Status via finally"
  - "WO-011 Run-id-spezifischer Status-Update bleibt 1:1 — alle 4 WO-014-Pfade nutzen weiterhin updateActiveWorkorderStatusByRun"
  - "state-manager.ts releaseScopeLock und releaseDbMigrationLock Idempotenz bleibt unverändert (Doku-Kommentar erlaubt; kein Behavior-Edit)"
  - "Kein neuer Audit-Event-Typ — bestehender auditScopeLockReleased wird wiederverwendet"
  - "Bestehende 28 Tests in dispatcher-fail-cleanup.test.ts bleiben grün (9 WO-006 + 8 WO-011 + 7 WO-012 + 4 WO-013)"
  - "Bestehende 9/9 Tests in smoke-test.ts bleiben grün"
  - "Mindestens 4 additive Tests in dispatcher-fail-cleanup.test.ts: Test E-1 no-tool-request, Test E-2 approval-gate, Test E-3 review-rewrite, Test E-4 human-needed — alle prüfen lockExistsFor(result.run_id) === false UND korrekter active_workorders status"
  - "Tests verwenden eindeutige scope_files pro Test (services/wo014-NNN/...)"
  - "MAX_REWRITE_LOOPS unverändert (2)"
  - "Kein Validator-Bypass eingeführt"
  - "Kein --force/--skip-validator/--bypass Flag"
  - "Keine Direkt-Manipulation von runtime_state.json oder system/state/*.jsonl"
  - "Keine Änderung an services/scheduler-api/**, batch-loader.ts, scheduler-preflight.ts, review-pipeline.ts, governance-validator.ts, terminal-wo-reset-cli.ts, risk-categories.ts, workorder.schema.json"
  - "Keine neuen npm-Dependencies"
  - "OrchestratorIntent-Type unverändert"
  - "WO_TRANSITIONS und ActiveWorkorder.status-Union unverändert"
  - "pnpm tsc --noEmit clean"
  - "Nutrition Batch 001 Dry-Run bleibt PASS (READY_TO_RUN)"
  - "Erwartung nach Closure: BATCH-NUTRITION-P1-001 --run erreicht WO-nutrition-002 (entweder erfolgreicher Dispatch ODER pausiert am db-migration Approval-Gate). Die spezifische Outcome hängt von Modell-Output ab; verifizierbar ist nur, dass kein Preflight HOLD durch stale scope_lock von WO-001 mehr auftritt."

negative_constraints:
  - "NIEMALS außerhalb scope_files schreiben"
  - "NIEMALS runtime_state.json direkt editieren"
  - "NIEMALS system/state/*.jsonl direkt editieren"
  - "NIEMALS Preflight umgehen oder deaktivieren"
  - "NIEMALS Governance Validator umgehen oder MAX_REWRITE_LOOPS erhöhen"
  - "NIEMALS terminal-wo-reset-cli.ts ändern (WO-010 — Operator-Tooling unverändert)"
  - "NIEMALS batch-loader.ts oder system/workorders/cli/** ändern"
  - "NIEMALS scheduler-preflight.ts ändern"
  - "NIEMALS review-pipeline.ts ändern"
  - "NIEMALS governance-validator.ts ändern"
  - "NIEMALS services/scheduler-api/** ändern"
  - "NIEMALS risk-categories.ts ändern"
  - "NIEMALS workorder.schema.json ändern"
  - "NIEMALS OrchestratorIntent-Type oder Validator-Logik ändern"
  - "NIEMALS state-manager.ts releaseScopeLock oder releaseDbMigrationLock Verhalten ändern (Idempotenz bewahren — nur Kommentare)"
  - "NIEMALS state-manager.ts mutate()-Lock oder file-lock-Pattern ändern"
  - "NIEMALS WO_TRANSITIONS-Tabelle oder ActiveWorkorder.status-Union ändern"
  - "NIEMALS cleanupHandled-Flag-Semantik ändern (flag bleibt = 'kein finally-failed-Status-Override')"
  - "NIEMALS Status-Werte auf den 4 non-terminalen Pfaden auf 'failed' oder 'done' ändern"
  - "NIEMALS WO-006 FAIL-Pfade modifizieren (alle reinen FAIL-Returns ohne cleanupHandled = true bleiben unverändert)"
  - "NIEMALS WO-006 finally-Block-Logik ändern (gated mit if (!cleanupHandled))"
  - "NIEMALS WO-011 updateActiveWorkorderStatusByRun-Aufrufe entfernen oder modifizieren"
  - "NIEMALS WO-012 Validator-§0-Block schwächen oder entfernen"
  - "NIEMALS WO-013 Contract-Prompt-Injection oder REWRITE-Hint ändern"
  - "NIEMALS Audit-History (audit.jsonl, audit.error.jsonl, pipeline-audit.jsonl) löschen oder rewriten"
  - "NIEMALS einen neuen Audit-Event-Typ einführen (existierendes auditScopeLockReleased nutzen)"
  - "NIEMALS Approval-Queue-Dateien (system/approval/**) editieren"
  - "NIEMALS Supabase-Befehle ausführen (supabase db push/reset/migration apply)"
  - "NIEMALS package.json ändern"
  - "NIEMALS neue npm-Dependencies hinzufügen"
  - "NIEMALS bestehende Tests deaktivieren oder skip-pen (xtest/it.skip/test.skip/xit)"
  - "NIEMALS Test-Anzahl in smoke-test.ts oder dispatcher-fail-cleanup.test.ts reduzieren"
  - "NIEMALS ein --force / --skip-validator / --bypass Flag einbauen"
  - "NIEMALS ENV-Dateien lesen oder schreiben"

files_blocked:
  - "services/scheduler-api/**"
  - "system/workorders/cli/**"
  - "system/approval/**"
  - "system/control-plane/governance-validator.ts"
  - "system/control-plane/scheduler-preflight.ts"
  - "system/control-plane/review-pipeline.ts"
  - "system/control-plane/terminal-wo-reset-cli.ts"
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
  - "npx tsx --test system/control-plane/__tests__/dispatcher-fail-cleanup.test.ts"
  - "npx tsx system/control-plane/__tests__/smoke-test.ts"
  - "npx tsx system/workorders/cli/run-batch.ts system/workorders/nutrition/batches/BATCH-NUTRITION-P1-001-db-foundation.md --dry-run"

required_skills: ["gsd-v2"]
optional_skills: ["typescript-pro", "nodejs-best-practices", "debugging-strategies"]
blocked_by:      []
```

---

## Notes

- **Filename ↔ workorder_id:** Filename `WO-GOVERNANCE-P1-014-finally-lock-release-on-non-terminal-paths.md` folgt der Auftrags-Convention; `workorder_id: WO-governance-014` folgt der Schema-Regex `^WO-[a-z]+-[0-9]+$`. Orchestrator/Scheduler nutzen das `workorder_id`-Feld.
- **`requires_approval: true`** ist Pflicht für `risk_category: architecture` per `CLAUDE.md` Cautious-Regel (Spark D mandatory, kein Auto-Retry).
- **`agent_id: senior-coding-agent`** — registriert in `system/agent-registry/agents.json`. Wird durch `AGENT_VALIDATOR_MAP['senior-coding-agent'] = 'micro-executor'` (WO-005) korrekt zu `ALLOWED_AGENTS`-Wert normalisiert; via `RISK_CATEGORY_TO_RISK_LEVEL_MAP` (WO-009) wird `risk_level` auf `'medium'` aufgefüllt.
- **`rollback_hint` nicht erforderlich** per Schema if/then (nicht db-migration).
- **Verhältnis zur WO-005-bis-WO-013-Sequenz:**
  - WO-005/009/012/013: Validator/Modell-Output-Vertrags-Schicht (alle PASS).
  - WO-006: Lock-Release auf FAIL-Pfaden via Try/Finally (PASS).
  - WO-011: run-id-spezifischer Status-Update (PASS).
  - WO-007/008: Smoke-Test/Reviewer-Injection (PASS).
  - WO-010: Operator-CLI Terminal-WO-Reset (PASS).
  - **WO-014** schließt den symmetrischen Lock-Release-Gap auf intentional-non-terminalen Pfaden — WO-006 wirkt auf FAIL-Pfade, WO-014 auf completed/awaiting_approval/review-Pfade. Beide zusammen garantieren, dass JEDER Return-Pfad nach `acquireScopeLock` Locks freigibt.
- **`scope_files` enthält 4 Files** — `dispatcher.ts` (Primary, 4 Pfad-Edits), `state-manager.ts` (defensiv, nur Doku-Kommentar erlaubt — kein Behavior-Edit), 2 Test-Files. Konsistent mit `template_implementation_medium.md` (3-15 Files).
- **`files_blocked` schließt explizit aus:** `governance-validator.ts`, `scheduler-preflight.ts`, `review-pipeline.ts`, `terminal-wo-reset-cli.ts`, `risk-categories.ts`, `workorder.schema.json`, `services/scheduler-api/**`, `system/workorders/cli/**`, `system/approval/**`, `runtime_state.json`/`*.jsonl`-Audits, `package.json`, `.env*`. Lückenlos.
- **State-Machine-Sicherheit:** `releaseScopeLock` und `releaseDbMigrationLock` sind in `state-manager.ts` bereits idempotent (multi-call-safe). Doppel-Release-Aufrufe (z. B. neue WO-014-Stelle + finally-Block bei unerwarteter Exception) sind unkritisch. Audit-Event-Spam ist minimal: `auditScopeLockReleased` wird pro Pfad einmal geschrieben; finally schreibt eigene `'finally cleanup on early failure path'`-Reason — beide unterscheidbar.
- **Audit-Trail:** Bestehender `auditScopeLockReleased`-Event-Typ wird wiederverwendet mit pfad-spezifischem `reason`-Feld. Kein neuer Event-Typ. Audit-Layer bleibt 1:1.
- **Lifecycle-Pfad:** Erwartet `done` → `reviewed` (architecture-review + Spark D mandatory) → `closed`. Auto-Retry **deaktiviert** für `architecture` per `CLAUDE.md` High-Risk-Regel.
- **Bezug zur Geschichte:**
  - Pre-WO-014 Live-Befund (BATCH-NUTRITION-P1-001 Workflow-Test 2026-05-03):
    - WO-nutrition-001 erstmals erfolgreich dispatched (`completed` per no-tool-request-Pfad, dank WO-013).
    - WO-nutrition-002 [preflight_blocked] Preflight HOLD — Symptom des Lock-Leaks.
  - Post-WO-014-Erwartung: WO-nutrition-002 wird vom Preflight nicht mehr durch stale Scope-Lock von WO-001 blockiert; Re-Run sollte beide WOs erreichen (WO-001 completed, WO-002 entweder dispatched oder am Approval-Gate pausierend — beides spec-konform).
- **Production-Default Verhalten:** Bei Modell-Output mit Tool-Request greift weiterhin der existierende Erfolgs-Pfad (Zeile ~755-757) — bit-identisch unverändert. Nur die 4 cleanupHandled = true-Pfade bekommen explizites Lock-Release. Kein neuer Code-Pfad bei Default-Tool-Request-Aufruf.
- **Tom darf nicht selbst granten** — die WO-Approval folgt dem normalen Spark-D-Mandatory-Review-Flow.

---

*Draft erzeugt: 2026-05-03 — gemäß `template_implementation_medium.md`, `wo_factory_prompt.md`, BATCH-NUTRITION-P1-001 Workflow-Test-Befund (Preflight HOLD nach WO-001 completed-no-tool-request), und WO-GOVERNANCE-P1-006 + WO-GOVERNANCE-P1-011 als Pattern-Vorlagen für Lock-Release-Symmetrie zwischen FAIL- und intentional-non-terminalen Pfaden.*

---

## Completion Note

Implementation reviewed PASS. Locks are released on no-tool-request completed, awaiting_approval, review and human-needed awaiting_approval paths while preserving status semantics. WO-006 fail cleanup and WO-011 run-id status update remain intact. dispatcher-fail-cleanup.test.ts 32/32 PASS. smoke-test.ts 9/9 PASS. Code commit: b681402.

*Closed: 2026-05-03.*
