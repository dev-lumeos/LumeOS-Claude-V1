# WO-GOVERNANCE-P1-011 — Dispatcher Terminal-Status-on-FAIL V1

**Status:** closed
**Completion Note:** Implementation reviewed PASS. Dispatcher failure paths now update the correct active_workorders entry by workorder_id + run_id. active_workorders no longer remains falsely dispatched/running for new failed runs. Lock-release behavior remains intact. dispatcher-fail-cleanup.test.ts 17/17 PASS. smoke-test.ts 9/9 PASS. *(closed: 2026-05-03)*
**Phase:** 1 — Governance Tooling
**Source:** Read-only Operator-Diagnose nach Closure von WO-005/006/007/008/009/010 mit Terminal-WO-Reset-CLI: `WO-nutrition-001` hat 3 Einträge in `active_workorders` — eine `failed` (`RUN-20260502-3836`) und **zwei `dispatched`** (`RUN-20260502-6627`, `RUN-20260503-8238`), obwohl beide Runs nach Validator-FAIL terminal beendet sind. Terminal-WO-Reset-CLI verweigert korrekt das Cleanup non-terminaler `dispatched`-Einträge — der Defekt liegt im Dispatcher: WO-006 Try/Finally garantiert Lock-Release, aber `active_workorders.status` wird nicht in allen FAIL-Pfaden auf `'failed'` gesetzt.
**Template:** `system/workorders/templates/template_implementation_medium.md`
**Lifecycle:** `wo_generated` → `graph_validated` → `queue_released` → `ready` → `dispatched` → `running` → `done` → `reviewed` (architecture/Spark D mandatory) → `closed` (per `wo_lifecycle_v1.md`)

---

## Out of Scope

- Terminal-WO-Reset-CLI Änderungen (`terminal-wo-reset-cli.ts` — bereits in WO-010 implementiert, korrekte Schutz-Funktion).
- `system_stop` CLI (separate Followup `WO-governance-012-stop-rule-cli`).
- `scope_lock` Cleanup-CLI (separate künftige WO).
- `selected_agent`-Normalisierung (bereits in WO-005).
- `risk_level`-Normalisierung (bereits in WO-009).
- Batch-Loader Änderungen (`system/workorders/cli/**`).
- Nutrition-DB-Implementation oder Supabase-Migration-Execution.
- Approval-Auto-Granting.
- Validator-Logik-Änderungen.
- Preflight-Logik-Änderungen.
- Review-Pipeline-Änderungen.
- `awaiting_approval` oder `review` als terminal-failed überschreiben (bewusst nicht-terminal — Re-Dispatch-Pfade).
- WO-Schema-Änderung (`ActiveWorkorder.status`-Union bleibt).
- Lock-Release-Verhalten aus WO-006 (bleibt 1:1 erhalten).

---

## Problem Statement

WO-006 hat den Dispatcher um Try/Finally Defense-in-Depth erweitert:
- Scope-Locks und DB-Migration-Locks werden auf jedem FAIL-Pfad freigegeben.
- `dispatcher-fail-cleanup.test.ts` 9/9 PASS verifiziert dies.

WO-006 löst aber **NUR** das Lock-Release-Problem. Der `active_workorders.status`-Pfad ist unvollständig:

1. `dispatcher.ts:367` setzt `let cleanupHandled = false` nach `acquireScopeLock()`.
2. Mehrere Pfade setzen `cleanupHandled = true` BEVOR sie ohne `updateWorkorderStatus(workorderId, 'failed')` zurückkehren:
   - **Zeile 490:** `parseToolRequest` returnt `null` → `cleanupHandled = true`, WO-Status bleibt `dispatched`. Per WO-006-Test 8 ist dies INTENDED (Erfolgsfall ohne Tool-Request, WO bleibt für Re-Dispatch in `dispatched`).
   - **Zeilen 533, 644, 671:** Approval-Gate, Review-Pipeline-Rewrite, Review-Pipeline-Human-Needed → `cleanupHandled = true`, WO bewusst in `awaiting_approval`/`review`. Korrekt (intentional non-terminal).
3. **Lücke (eigentliche Root-Cause):** `state-manager.ts:367` definiert `updateWorkorderStatus(workorderId, status)` mit `s.active_workorders.find(w => w.workorder_id === workorderId)` — matcht **NUR per `workorder_id`**, NICHT per `run_id`. Aber `dispatcher.ts:240` (`startWorkorder`) pusht bei jedem Dispatch einen NEUEN Eintrag in `active_workorders`. Bei wiederholtem Dispatch derselben `workorder_id` (Re-Run nach FAIL) entstehen mehrere Einträge mit unterschiedlichen `run_id`s. Konsequenz:
   - `dispatched → failed` IST in `WO_TRANSITIONS.dispatched` erlaubt — keine Exception, kein Catch-Swallow.
   - `updateWorkorderStatus(workorderId, 'failed')` findet den **ERSTEN** matching-Eintrag (z. B. einen schon abgeschlossenen `failed`-Eintrag aus einem vorigen Run).
   - `validateWoStatusTransition('failed', 'failed')` ist same-state-idempotent (Zeile 267) → no-op auf den falschen Eintrag.
   - Der **aktuelle** dispatched-Eintrag (mit der neuen `run_id`) bleibt unverändert in `'dispatched'`.
4. **Beobachtet im Live-State** nach realen Workflow-Test-Iterationen:
   - `WO-nutrition-001 / RUN-20260502-6627 / status: dispatched` (sollte `failed` sein — Validator-FAIL)
   - `WO-nutrition-001 / RUN-20260503-8238 / status: dispatched` (sollte `failed` sein — Validator-FAIL)
   - Beide Runs sind in `active_runs` als `failed` markiert; nur `active_workorders` blieb in `dispatched`.

**Wirkung:**
- Terminal-WO-Reset-CLI (WO-010) verweigert korrekt das Cleanup dieser Einträge (`'dispatched'` ist nicht clearable). Operator hat keine sichere offizielle Cleanup-Möglichkeit — die WO-006/WO-010-Kette ist für Validator-FAIL-Restzustand unvollständig.
- Preflight (`scheduler-preflight.ts`) sieht beim nächsten Re-Run-Versuch einen `dispatched`-Eintrag, der laufende Arbeit suggeriert (obwohl nichts läuft). Aktuell rejected Preflight bei `failed`/`done` als terminal, NICHT bei `dispatched` — also ist das nicht direkt re-run-blockierend; aber semantisch ist der State falsch.
- Multi-Run-Aggregation und Reports zeigen falsche Active-WO-Counts.
- Audit-Trail bleibt korrekt (`active_runs` ist `failed`), aber State-Konsistenz ist verletzt.

**Architektonisches Defizit:**
- **Find-Key-Mismatch in `updateWorkorderStatus`:** Funktion matcht per `workorder_id`-only, kann aber bei Multi-Dispatch derselben WO mehrere Einträge nicht eindeutig adressieren. Run-spezifischer Status-Update ist nicht möglich.
- Synchronisationslücke zwischen `active_runs.status` (Run-Lifecycle, run-id-keyed) und `active_workorders.status` (WO-Lifecycle, workorder-id-keyed mit duplizierten Einträgen).
- `cleanupHandled = true` ist als **Schutz** gegen finally-Überschreibung intentioneller non-terminaler Status (`awaiting_approval`, `review`, no-tool-request-Erfolg) gedacht — nicht als generischer Skip-Marker für FAIL-Pfade.
- Aktueller `finally`-Block (Zeile 741) verwendet `updateWorkorderStatus(workorderId, 'failed')` mit demselben Find-Key-Mismatch. Selbst wenn `cleanupHandled = false` und finally läuft, trifft die Mutation den falschen Eintrag.

**Ziel:** Sicherstellen, dass jeder FAIL-Pfad nach `startRun()` UND `acquireScopeLock()` den **aktuellen run-id-spezifischen** `active_workorders`-Eintrag zuverlässig auf `'failed'` setzt — UND dass intentional-non-terminale Pfade (`awaiting_approval`, `review`, no-tool-request-Erfolg) explizit erhalten bleiben. Lösung: neuer additiver State-Manager-Helper `updateActiveWorkorderStatusByRun(workorderId, runId, status)` der per (workorder_id, run_id)-Paar matcht (analog zu WO-010 `removeTerminalActiveWorkorder`). Existierender `updateWorkorderStatus` bleibt unverändert für Pre-Dispatch-Pfade ohne `runId`. Die Try/Finally-Lock-Release-Architektur aus WO-006 bleibt 1:1 unverändert.

---

## Architekturentscheidung (verbindlich)

**Variante 1: Neuer additiver run-id-spezifischer State-Manager-Helper + explizite Aufrufe auf jedem FAIL-Pfad nach `startRun` (Default).**

Zwei zusammenwirkende Änderungen:

**A) Neuer additiver State-Manager-Helper** in `state-manager.ts` (kein Behavior-Edit an bestehenden Funktionen):

```ts
export async function updateActiveWorkorderStatusByRun(
  workorderId: string,
  runId: string,
  status: ActiveWorkorder['status'],
): Promise<{ updated: boolean; reason?: string }>
```

Eigenschaften:
- Matcht per `w.workorder_id === workorderId && w.run_id === runId` (analog zu WO-010 `removeTerminalActiveWorkorder`).
- Wendet `validateWoStatusTransition` an; same-state idempotent.
- Atomar via existierendem `mutate()`-Lock.
- Bei genau 1 Match + valider Transition → mutiert genau diesen einen Eintrag, returnt `{ updated: true }`.
- Bei 0 Matches → `{ updated: false, reason: 'no match' }` (no-op, sicher).
- Bei mehrdeutigem Match (>1 Eintrag mit gleicher `(workorder_id, run_id)` — sollte praktisch nie passieren, da `startWorkorder` neue Einträge mit neuen `run_id`s erzeugt) → `{ updated: false, reason: 'ambiguous match (N)' }`.
- Bei invalider Transition → `{ updated: false, reason: 'invalid transition: <from> → <to>' }`; appendInvalidTransition wird wie bei `updateWorkorderStatus` aufgerufen.
- Berührt KEINE anderen `active_workorders`-Einträge.

**B) Dispatcher-FAIL-Pfade nutzen den neuen Helper:**

Statt sich auf den `finally`-Block-Catch oder den workorder-id-only `updateWorkorderStatus` zu verlassen, setzt jeder FAIL-Return innerhalb des try-Body **nach `startRun`** explizit:

```ts
await state.updateActiveWorkorderStatusByRun(wo.workorder_id, runId, 'failed')
```

BEVOR `return { status: 'failed' | 'blocked', ... }`. Begründung:

1. **Run-spezifisch:** `(workorder_id, run_id)`-Paar identifiziert genau den aktuellen Eintrag, auch bei Multi-Dispatch derselben WO.
2. **Deterministisch:** Pfad-für-Pfad-Update ist nachvollziehbar; finally-Block bleibt nur Defense-in-Depth.
3. **Idempotent:** Same-state-idempotent über `validateWoStatusTransition` (Zeile 267: `if (from === to) return { valid: true }`).
4. **Audit-symmetrisch:** appendInvalidTransition-Audit-Pfad bleibt erhalten.
5. **Schutz für intentional-non-terminale Pfade:** `cleanupHandled = true`-Pfade (`awaiting_approval`, `review`, no-tool-request) bleiben unverändert — sie setzen explizit ihren intended Status mit dem **alten oder neuen** Helper VOR `cleanupHandled = true`.
6. **Finally-Block bleibt Defense-in-Depth:** Greift nur noch bei unvorhergesehenen Throw-Pfaden; wird auf den **neuen** Helper umgestellt (`runId` ist im finally-Scope verfügbar — siehe Variable-Lifetime in `dispatcher.ts:367`).
7. **Pre-Dispatch-Pfade (Zeilen 331/354) bleiben mit `updateWorkorderStatus`:** Dort ist noch keine `runId` verfügbar (`startWorkorder` wurde noch nicht aufgerufen oder das WO ist schon der frische Eintrag) — Mehrdeutigkeit bei `startWorkorder` direkt im Dispatch-Cycle ist ausgeschlossen.

Konkrete FAIL-Pfade die auf den neuen Helper `updateActiveWorkorderStatusByRun(woId, runId, 'failed')` umgestellt werden (auf Basis aktueller `dispatcher.ts`-Inspektion):

**A) FAIL-Pfade ohne bestehende `updateWorkorderStatus`-Stelle — neuen Helper hinzufügen:**
- **Validator-REWRITE-Limit erreicht** (Parse-Error nach 2 Rewrites).
- **Validator-REWRITE-Limit erreicht** (Validation-Error nach 2 Rewrites).
- **Validator FAIL-Direkt** (Validator returnt `'FAIL'` ohne Rewrite-Versuch).
- **Validator BLOCKED** (Validator returnt `'BLOCKED'` durch FILES_ALLOWED-Verletzung).
- **Tool-Auth Block** (Permissions-Check rejected).
- **Approval-Gate Block ohne approval_id** (FAIL-Variante; mit approval_id geht zu `awaiting_approval` — bleibt unverändert).
- **Skill-Loader Block** (skill-loader meldet Fehler).
- **callModel Exception** (Model-Adapter wirft, im inneren try-Block).

**B) FAIL-Pfade mit bereits-existierender `updateWorkorderStatus`-Stelle — auf neuen Helper UMSTELLEN (nicht doppelt setzen):**
- **Files-Scope-Violation Post-Execution** (`dispatcher.ts:580`): hat bereits `updateWorkorderStatus(workorderId, 'failed')`. Auf `updateActiveWorkorderStatusByRun(workorderId, runId, 'failed')` umstellen, sonst wirkt der Find-Key-Mismatch weiterhin.
- **Tool-Result-Failed** (`dispatcher.ts:709`): hat bereits `updateWorkorderStatus(workorderId, toolResult.success ? 'done' : 'failed')`. Auf run-id-spezifische Variante umstellen — sowohl `'done'` als auch `'failed'` brauchen den neuen Helper, da der Find-Key-Mismatch in beide Richtungen wirkt.

**C) Outer Catch-Block:** Jede unerwartete Exception nach `startRun` — auf neuen Helper umstellen.

**D) WO-006 finally-Block (`dispatcher.ts:741-752`):** `try { updateWorkorderStatus(workorderId, 'failed') } catch` ersetzen durch `try { updateActiveWorkorderStatusByRun(workorderId, runId, 'failed') } catch` — `runId` ist im finally-Scope verfügbar (Variable-Lifetime ab Zeile 367 ähnlich `cleanupHandled`).

**E) `endRun(runId, 'failed')` separat:** NUR ergänzen wo der Pfad noch keinen `state.endRun`-Aufruf vor dem Return hat. Same-state idempotent, Doppel-Aufruf safe. Cross-check pro Pfad mit `grep -n "endRun" dispatcher.ts`.

NICHT geändert:
- **Erfolgs-Pfad** (`updateWorkorderStatus('done')` Zeile 709 bei `toolResult.success`).
- **No-Tool-Request-Pfad** (Zeile 487-492 — `cleanupHandled = true`, WO bleibt `dispatched` für Re-Dispatch).
- **Approval-Gate awaiting_approval-Pfad** (Zeile 531-533 — `cleanupHandled = true`, WO in `awaiting_approval`).
- **Review-Pipeline review-Pfad** (Zeile 643-644 — `cleanupHandled = true`, WO in `review`).
- **Review-Pipeline human-needed-Pfad** (Zeile 670-671 — `cleanupHandled = true`, WO in `awaiting_approval`).
- **WO-006 Try/Finally Lock-Release-Block** (Zeile 741-752 — bleibt strukturell unverändert; nur die Notwendigkeit, dass dieser Block den WO-Status setzt, sinkt).

Alternativen verworfen:
- **Variante 2: Nur den `finally`-Block fixen** — `try { updateWorkorderStatus(... 'failed') } catch` swallowed Transitions-Errors. Wenn z. B. ein Pfad `cleanupHandled = true` setzt aber den Status nicht ändert, läuft `finally` nicht. Variante 2 löst nur einen Teil des Problems.
- **Variante 3: Helper-Funktion `failRun(runId, woId, reason)`** — bündelt updateWorkorderStatus/endRun/audit/release. Architektonisch sauber, aber WO-Spec-Vertrag begrenzt Scope auf Existing-Pattern-Erweiterung. Reserviert für eine zukünftige Refactoring-WO.
- **Variante 4: `cleanupHandled` umkehren auf `terminalStatusSet`** — würde WO-006-Logik umstrukturieren. Stört bestehende `dispatcher-fail-cleanup.test.ts`-Asserts.
- **Variante 5: Auto-Sync via state-manager** (z. B. `endRun(runId, 'failed')` setzt automatisch zugeordnete `active_workorders.status === 'failed'`). Cross-Cutting-Konzern in `state-manager.ts`, würde Tests breaken; größere Architektur-Entscheidung.

In allen Varianten:
- `runtime_state.json` wird **NIE** direkt per File-Write editiert.
- Audit-Events laufen ausschließlich über `audit-writer.ts`.
- WO-006 Lock-Release-Verhalten 1:1 erhalten.
- Validator/Preflight/Review-Pipeline unverändert.
- Test-Anzahl in `dispatcher-fail-cleanup.test.ts` und `smoke-test.ts` bleibt mindestens gleich; neue Tests additiv.

---

## Workorder

```yaml
workorder_id: "WO-governance-011"
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
        (besonders: alle FAIL-Returns innerhalb der Worker-Retry-Loop;
        cleanupHandled-Setpunkte Zeilen ~490, 533, 644, 671, 712, 726;
        finally-Block Zeile 741-752 mit try { updateWorkorderStatus('failed') } catch;
        Erfolgs-Pfad Zeile 709 mit updateWorkorderStatus(toolResult.success ? 'done' : 'failed');
        frühe Pfade Zeilen 331/354 die updateWorkorderStatus('failed') VOR cleanupHandled-Block setzen)
      - system/state/state-manager.ts
        (WO_TRANSITIONS Zeile 250: dispatched/running/review/awaiting_approval → failed
        sind alle erlaubt; same-state idempotent Zeile 267; updateWorkorderStatus
        Zeile 297 mit validateWoStatusTransition + appendInvalidTransition für
        rejected transitions in audit.error.jsonl)
      - system/control-plane/__tests__/dispatcher-fail-cleanup.test.ts
        (Pattern für DispatcherDeps-Mocks mit OrchestratorIntent + ToolRequest;
        bestehende Lock-Release-Tests Zeile 9/9 — bleiben grün; Erfolgs-Test 8
        verifiziert no-tool-request Pfad mit notEqual(status, 'failed') —
        Behaviour-Erhaltung ist Pflicht)
      - system/control-plane/__tests__/smoke-test.ts
        (Test 6/7A/7B mit OrchestratorIntent + ToolRequest Mocks aus WO-007;
        Erfolgs- und Approval-Pfade dürfen NICHT auf failed kippen)
      - system/control-plane/terminal-wo-reset-cli.ts
        (read-only Referenz; kein Edit. CLI verweigert korrekt
        non-terminale dispatched-Einträge — WO-011 sorgt dafür, dass
        nach FAIL der Status 'failed' ist, sodass CLI Cleanup erlaubt.)
      - system/workorders/lifecycle/wo_lifecycle_v1.md
        (failed/done als terminal; awaiting_approval/review als
        intentional non-terminal mit Re-Dispatch-Pfad)
      - system/workorders/nutrition/drafts/WO-GOVERNANCE-P1-006-dispatcher-fail-cleanup.md
        (Pattern-Vorlage; Try/Finally-Architektur bleibt 1:1)
      - system/workorders/nutrition/drafts/WO-GOVERNANCE-P1-010-terminal-wo-reset-cli.md
        (Referenz für die Operator-Aufrufseite; CLI darf NICHT geändert werden)

      Identifiziere alle FAIL/Block-Returns innerhalb dispatchWorkorder() nach
      acquireScopeLock und nach startRun, und kategorisiere pro Pfad:

        A) Pfade OHNE bestehende updateWorkorderStatus-Stelle: müssen
           updateActiveWorkorderStatusByRun(woId, runId, 'failed') NEU
           hinzubekommen.
        B) Pfade MIT bestehender updateWorkorderStatus(workorderId, ...)-Stelle:
           müssen UMGESTELLT werden auf updateActiveWorkorderStatusByRun
           (sonst greift der Find-Key-Mismatch weiterhin und der Aufruf
           trifft den falschen Eintrag). KEIN doppeltes Setzen.
        C) WO-006 finally-Block (Zeile 741-752): try{updateWorkorderStatus}catch
           ersetzen durch try{updateActiveWorkorderStatusByRun}catch (runId ist
           im finally-Scope verfügbar).
        D) Pre-Dispatch-Pfade VOR startRun (Zeilen 331/354): bleiben mit
           updateWorkorderStatus (workorder_id-only). Dort gibt es noch keine
           Multi-Dispatch-Mehrdeutigkeit — der frische dispatched-Eintrag aus
           startWorkorder ist eindeutig identifizierbar.
        E) Intentional-non-terminale Pfade (Zeilen 487-492 no-tool-request,
           531-533 awaiting_approval, 643-644 review, 670-671 human-needed):
           NUR den Status-Wert prüfen — werden nach WO-011 ebenfalls auf
           updateActiveWorkorderStatusByRun umgestellt (mit jeweiligem
           intended Status, nicht 'failed'), damit Multi-Dispatch-Konsistenz
           auch hier gilt. WICHTIG: KEINE Status-Wert-Änderung — nur
           Helper-Wechsel.

      Erfasse pro Pfad:
        - Zeilennummer im aktuellen dispatcher.ts.
        - Kategorie (A/B/C/D/E).
        - Wird cleanupHandled gesetzt? (true/false)
        - Wird updateWorkorderStatus oder updateActiveWorkorderStatusByRun
          benötigt?
        - Wird endRun aufgerufen? (true/false — falls false, ergänzen)

      Belegte Pfade aus aktueller dispatcher.ts-Inspektion:
        - Zeile 386 (Skill-Loader Block): A
        - Zeile 420 (Validator REWRITE-Limit Parse-Error): A
        - Zeile 467 (Validator BLOCKED): A
        - Zeile 473 (Validator FAIL-Direct): A
        - Zeile 481 (Validator REWRITE-Limit Validation-Error): A
        - Zeile 512 (Approval-Gate Block ohne approval_id): A
        - Zeile 531-533 (Approval-Gate awaiting_approval): E (UNVERÄNDERT-Status)
        - Zeile 554 (Tool-Auth Block): A
        - Zeile 580-581 (Files-Scope-Violation Post-Check): B (UMSTELLEN)
        - Zeile 643-644 (Review-Pipeline review): E (UNVERÄNDERT-Status)
        - Zeile 670-671 (Review-Pipeline awaiting_approval): E (UNVERÄNDERT-Status)
        - Zeile 709-718 (Tool-Result success/failed): B (UMSTELLEN — beide Werte)
        - Zeile 487-492 (no-tool-request completed): E (UNVERÄNDERT-Status,
          aber finally-Block muss seinen updateWorkorderStatus auch durch
          updateActiveWorkorderStatusByRun ersetzen, damit später-falls der
          Pfad doch ein finally trifft, der run-id-spezifische Eintrag
          getroffen wird)
        - Zeile 741-752 (Outer finally-Block): C
        - Outer Catch-Block (vor finally): A

      Schreibe architecture_notes mit gewählter Variante (Variante 1 = Default
      mit additivem Helper) plus Begründung warum andere Varianten verworfen.
    </analyze>

    <implement>
      Implementiere Variante 1 (additiver Helper + run-id-spezifische
      Aufrufe in dispatcher.ts).

      Schritt 1 — state-manager.ts: NEUER additiver Helper.

        export async function updateActiveWorkorderStatusByRun(
          workorderId: string,
          runId: string,
          status: ActiveWorkorder['status'],
        ): Promise<{ updated: boolean; reason?: string }> {
          let outcome: { updated: boolean; reason?: string } = {
            updated: false,
            reason:  'unknown',
          }
          await mutate(s => {
            const matches = s.active_workorders.filter(
              w => w.workorder_id === workorderId && w.run_id === runId,
            )
            if (matches.length === 0) {
              outcome = { updated: false, reason: 'no match' }
              return
            }
            if (matches.length > 1) {
              outcome = { updated: false, reason: `ambiguous match (${matches.length})` }
              return
            }
            const target = matches[0]
            const validation = validateWoStatusTransition(target.status, status)
            if (!validation.valid) {
              appendInvalidTransition(workorderId, target.status, status, validation.reason)
              outcome = { updated: false, reason: `invalid transition: ${target.status} → ${status}` }
              return
            }
            target.status = status
            outcome = { updated: true }
          })
          return outcome
        }

      WICHTIG:
        - KEINE Behavior-Änderung an bestehendem updateWorkorderStatus oder
          validateWoStatusTransition (negative_constraint).
        - additiver Helper, kein Signatur-Change an existierenden Funktionen.
        - berührt KEINE anderen active_workorders-Einträge.
        - berührt KEINE scope_locks/db_migration_lock/system_stop/approvals/
          active_runs.
        - same-state idempotent über validateWoStatusTransition.

      Schritt 2 — dispatcher.ts: pro identifiziertem FAIL-Pfad nach startRun
      EXPLIZIT setzen (Kategorie A + B + C aus <analyze>):

        await state.updateActiveWorkorderStatusByRun(wo.workorder_id, runId, 'failed')
        await state.endRun(runId, 'failed')   // wenn nicht bereits gesetzt
        // existierendes Audit-Event bleibt unverändert
        return { status: 'failed' | 'blocked', ... }

      Reihenfolge auf jedem FAIL-Pfad nach startRun:
        1. (optional) bestehendes Audit-Event schreiben.
        2. await state.updateActiveWorkorderStatusByRun(wo.workorder_id, runId, 'failed')
        3. await state.endRun(runId, 'failed')   // wenn der Pfad das nicht schon tut
        4. cleanupHandled = true   // optional — finally-Block ist same-state-idempotent
        5. return ...

      Schritt 2a (Kategorie A — neue Aufrufe ergänzen):
        - Zeile 386 (Skill-Loader Block)
        - Zeile 420 (Validator REWRITE-Limit Parse-Error)
        - Zeile 467 (Validator BLOCKED)
        - Zeile 473 (Validator FAIL-Direct)
        - Zeile 481 (Validator REWRITE-Limit Validation-Error)
        - Zeile 512 (Approval-Gate Block ohne approval_id)
        - Zeile 554 (Tool-Auth Block)
        - Outer Catch-Block (jede unerwartete Exception)
        - callModel Exception (im inneren try)

      Schritt 2b (Kategorie B — bestehende Aufrufe UMSTELLEN, nicht doppelt setzen):
        - Zeile 580-581 (Files-Scope-Violation Post-Check):
            await state.updateWorkorderStatus(wo.workorder_id, 'failed')
          ersetzen durch:
            await state.updateActiveWorkorderStatusByRun(wo.workorder_id, runId, 'failed')
        - Zeile 709 (Tool-Result success/failed):
            await state.updateWorkorderStatus(wo.workorder_id, toolResult.success ? 'done' : 'failed')
          ersetzen durch:
            await state.updateActiveWorkorderStatusByRun(wo.workorder_id, runId, toolResult.success ? 'done' : 'failed')

      Schritt 2c (Kategorie C — finally-Block umstellen, Zeile 741-752):
            try { await state.updateWorkorderStatus(wo.workorder_id, 'failed') } catch { ... }
          ersetzen durch:
            try { await state.updateActiveWorkorderStatusByRun(wo.workorder_id, runId, 'failed') } catch { ... }
          (runId ist im finally-Scope verfügbar — Variable-Lifetime ab Zeile 367.)

      Schritt 2d (Kategorie D — frühe Pfade UNVERÄNDERT):
        - Zeilen 331/354 (Scope-Lock-Konflikt, DB-Migration-Lock-Konflikt) rufen
          bereits updateWorkorderStatus('failed') auf — bleiben mit dem
          alten Helper. Begründung: dort ist startWorkorder gerade frisch
          aufgerufen, der Eintrag ist eindeutig identifizierbar — keine
          Multi-Dispatch-Mehrdeutigkeit möglich.

      Schritt 2e (Kategorie E — intentional-non-terminale Pfade STATUS UNVERÄNDERT,
      nur Helper-Wechsel):
        - Zeile ~487-492 (parseToolRequest === null, completed): bisher KEIN
          updateWorkorderStatus-Aufruf nach startRun (cleanupHandled=true
          schützt finally-Überschreibung). KEINE Änderung — Status-Erhaltung
          bleibt per cleanupHandled=true (WO-006 Test 8 Behaviour).
        - Zeile ~531-533 (Approval-Gate awaiting_approval): updateWorkorderStatus
          → updateActiveWorkorderStatusByRun mit Status 'awaiting_approval'.
        - Zeile ~643-644 (Review-Pipeline review): updateWorkorderStatus →
          updateActiveWorkorderStatusByRun mit Status 'review'.
        - Zeile ~670-671 (Review-Pipeline human-needed): updateWorkorderStatus
          → updateActiveWorkorderStatusByRun mit Status 'awaiting_approval'.
        WICHTIG: KEINE Status-Wert-Änderung — nur Helper-Wechsel, sodass
        Multi-Dispatch-Konsistenz auch für intentional-non-terminale Pfade
        gilt (verhindert dass ein voriger Eintrag fälschlich auf
        'awaiting_approval'/'review' gesetzt wird).

      Schritt 3 — Test-Erweiterung in dispatcher-fail-cleanup.test.ts:
      Bestehende 9 Tests bleiben grün. Additive Tests:

      A) Single-Dispatch FAIL-Path-Tests (run-id-spezifisch verifizieren):
        - Validator-FAIL-Pfad: nach FAIL ist active_workorders-Eintrag mit
          dieser run_id auf status === 'failed'.
        - Validator-BLOCKED-Pfad: dito.
        - Tool-Auth-Block: dito.
        - Files-Scope-Violation Post-Check: dito.
        - callModel Exception: dito.

      B) Multi-Dispatch-Same-WO-Test (CRITICAL — verifiziert Find-Key-Fix):
        - Setup: 2 active_workorders-Einträge mit gleicher workorder_id
          (z. B. WO-test-001), unterschiedlichen run_id (RUN-A failed,
          RUN-B dispatched).
        - dispatchWorkorder gegen RUN-B (mit FAIL-Mock callModel).
        - Erwartung: NACH dem Run sind BEIDE Einträge auf 'failed':
            - RUN-A bleibt auf 'failed' (war schon)
            - RUN-B wechselt von 'dispatched' zu 'failed'
        - Pre-WO-011 würde dieser Test rot werden (RUN-B bliebe 'dispatched').

      C) State-Manager-Helper-Tests (für updateActiveWorkorderStatusByRun):
        - Eindeutiger Match + valide Transition: { updated: true }.
        - 0 Matches: { updated: false, reason: 'no match' }.
        - Mehrdeutiger Match: { updated: false, reason: 'ambiguous match' }.
        - Invalide Transition (z. B. 'done' → 'failed'):
          { updated: false, reason: 'invalid transition' } UND
          appendInvalidTransition wurde aufgerufen.
        - Same-state idempotent ('failed' → 'failed'): { updated: true } no-op.
        - Berührt nur den matching Eintrag, andere active_workorders bleiben.
        - Berührt KEINE scope_locks/system_stop/approvals/active_runs.

      D) Negativ-Tests (Schutz für intentional-non-terminale Pfade):
        - Erfolgs-Pfad mit Tool-Request: status === 'done' (UNVERÄNDERT).
        - Erfolgs-Pfad ohne Tool-Request: status NICHT 'failed' (WO-006 Test 8).
        - Approval-awaiting-Pfad: status === 'awaiting_approval' (UNVERÄNDERT).
        - Review-Pfad: status === 'review' (UNVERÄNDERT).
        - Multi-Dispatch + intentional-non-terminal: zwei Einträge, einer
          terminal-failed, der andere dispatched → Approval-Gate triggers
          → nur der NEUE Eintrag wechselt zu 'awaiting_approval', der ALTE
          'failed'-Eintrag bleibt 'failed'.

      Schritt 4 — smoke-test.ts: read-only-Verifikation. Test 6/7A/7B-Mocks
      sollten weiter grün laufen ohne Anpassung — sie testen den
      Erfolgs-/awaiting_approval-/blocked-Pfad mit korrektem
      OrchestratorIntent. Falls ein Test versehentlich rot wird, ist das ein
      Hinweis auf Behaviour-Bruch — STOP und ESCALATE.

      Final:
        - pnpm tsc --noEmit clean.
        - dispatcher-fail-cleanup.test.ts → all PASS (mind. 9 + neue additive).
        - smoke-test.ts → 9/9 PASS.
        - Nach einem failed Workflow-Run sollte die Terminal-WO-Reset-CLI
          den Eintrag erfolgreich (Dry-Run + Confirm) cleanen können —
          live ohne diese WO nicht möglich, mit dieser WO ja.
        - post_review_required: true.
    </implement>

    <constraints>
      Kein Bypass von Preflight oder Governance-Validator.
      Keine Erhöhung von MAX_REWRITE_LOOPS.
      Kein --force / --skip-validator / --bypass Flag.
      Keine Direkt-Manipulation von runtime_state.json oder system/state/*.jsonl.
      Keine Änderung an services/scheduler-api/**.
      Keine Änderung an batch-loader.ts.
      Keine Änderung an scheduler-preflight.ts.
      Keine Änderung an review-pipeline.ts.
      Keine Änderung an governance-validator.ts.
      Keine Änderung an terminal-wo-reset-cli.ts (WO-010 — read-only Referenz).
      Keine Änderung an risk-categories.ts.
      Keine Änderung an workorder.schema.json.
      Keine neuen npm-Dependencies; package.json unverändert.
      WO-006 Lock-Release-Verhalten bleibt 1:1 erhalten.
      WO-006 Erfolgs-Test (Test 8: no-tool-request → status nicht 'failed') bleibt grün.
      Approval-Gate awaiting_approval-Pfad bleibt unverändert (status: 'awaiting_approval').
      Review-Pipeline review-/awaiting_approval-Pfade bleiben unverändert.
      Erfolgs-Pfad (toolResult.success → 'done') bleibt unverändert.
      ActiveWorkorder.status-Union bleibt unverändert.
      WO_TRANSITIONS bleibt unverändert.
      Audit-Events nur über audit-writer.ts; kein direkter JSONL-Edit.
      post_review_required: true.
    </constraints>

    <on_error>
      Bei TypeScript-Fehler: {"status": "FAIL", "issues": ["tsc: ..."]}.
      Bei Breaking Change in dispatcher-Public-API erkannt: {"status": "ESCALATE"}.
      Bei nötigem Edit von state-manager.ts updateWorkorderStatus oder
        validateWoStatusTransition Behavior: {"status": "ESCALATE",
        "issues": ["state-manager behavior change requires separate WO"]}.
      Bei nötigem Edit von services/scheduler-api/**: {"status": "STOP"}.
      Bei nötigem Edit von batch-loader.ts: {"status": "STOP"}.
      Bei nötigem Edit von governance-validator.ts: {"status": "STOP"}.
      Bei nötigem Edit von scheduler-preflight.ts: {"status": "STOP"}.
      Bei nötigem Edit von review-pipeline.ts: {"status": "STOP"}.
      Bei nötigem Edit von terminal-wo-reset-cli.ts: {"status": "STOP"}.
      Bei nötiger neuer npm-Dependency: {"status": "ESCALATE"}.
      Bei Migration / Schema-Änderung erkannt: {"status": "ESCALATE",
        "issues": ["route to db-migration-agent"]}.
      Bei Security-Befund: {"status": "STOP"}.
      Bei rotem Test in dispatcher-fail-cleanup.test.ts oder smoke-test.ts
        nach Anpassung: {"status": "FAIL", "issues": ["test: <name> — actual=<x> expected=<y>"]}.
      Bei Behaviour-Bruch in einem WO-006-Test (Lock-Release oder
        cleanupHandled-Pfad): {"status": "ESCALATE"}.
      Bei mehrdeutigem FAIL-Pfad-Identifier: {"status": "ESCALATE"}.
      Bei fehlendem Kontext: {"status": "BLOCKED"}.
    </on_error>
  </task>

scope_files:
  - "system/control-plane/dispatcher.ts"
  - "system/state/state-manager.ts"
  - "system/control-plane/__tests__/dispatcher-fail-cleanup.test.ts"
  - "system/control-plane/__tests__/smoke-test.ts"

context_files:
  - "system/control-plane/terminal-wo-reset-cli.ts"
  - "system/state/audit-writer.ts"
  - "system/control-plane/scheduler-preflight.ts"
  - "system/workorders/schemas/workorder.schema.json"
  - "system/workorders/lifecycle/wo_lifecycle_v1.md"
  - "system/workorders/nutrition/drafts/WO-GOVERNANCE-P1-006-dispatcher-fail-cleanup.md"
  - "system/workorders/nutrition/drafts/WO-GOVERNANCE-P1-010-terminal-wo-reset-cli.md"

acceptance_criteria:
  - "Neuer additiver Helper updateActiveWorkorderStatusByRun(workorderId, runId, status) existiert in state-manager.ts und matcht per (workorder_id, run_id)-Paar"
  - "updateActiveWorkorderStatusByRun ist atomar via mutate()-Lock, wendet validateWoStatusTransition an, ist same-state idempotent, returnt { updated: true } bei Erfolg und { updated: false, reason } bei no-match/ambiguous/invalid-transition"
  - "updateActiveWorkorderStatusByRun berührt KEINE anderen active_workorders-Einträge und KEINE scope_locks/db_migration_lock/system_stop/approvals/active_runs"
  - "Bestehender updateWorkorderStatus(workorderId, status) ist in Signatur und Verhalten UNVERÄNDERT (für Pre-Dispatch-Pfade Zeilen 331/354 weiter genutzt)"
  - "Bestehender validateWoStatusTransition ist in Signatur und Verhalten UNVERÄNDERT"
  - "Jeder dispatcher.ts FAIL-Pfad NACH startRun (Kategorie A in <analyze>), der status: 'failed' oder 'blocked' returnt, ruft VOR dem Return updateActiveWorkorderStatusByRun(wo.workorder_id, runId, 'failed') auf"
  - "Bestehende updateWorkorderStatus-Aufrufe NACH startRun (Kategorie B: Zeile 580 Files-Scope-Violation, Zeile 709 Tool-Result success/failed) sind auf updateActiveWorkorderStatusByRun UMGESTELLT (kein doppeltes Setzen)"
  - "WO-006 finally-Block (Zeile 741) verwendet updateActiveWorkorderStatusByRun(workorderId, runId, 'failed') statt updateWorkorderStatus"
  - "Frühe Pfade VOR startRun (Zeile 331 Scope-Lock-Konflikt, Zeile 354 DB-Migration-Lock-Konflikt) verwenden weiterhin updateWorkorderStatus (kein Multi-Dispatch-Risiko)"
  - "Intentional-non-terminale Pfade (Approval-Gate Zeile 531-533, Review-Pipeline Zeile 643-644 + 670-671) sind auf updateActiveWorkorderStatusByRun UMGESTELLT mit jeweils gleichem Status-Wert (awaiting_approval / review / awaiting_approval) — KEINE Status-Wert-Änderung"
  - "Multi-Dispatch-Same-WO-Test: nach 2 active_workorders-Einträgen mit gleicher workorder_id und unterschiedlichen run_ids (RUN-A failed, RUN-B dispatched) und FAIL-Run gegen RUN-B sind BEIDE Einträge auf 'failed' (RUN-A bleibt failed, RUN-B wechselt von dispatched zu failed)"
  - "Jeder catch/exception-Pfad nach startRun setzt active_workorders[].status auf 'failed'"
  - "Validator FAIL-Pfad (Direct + REWRITE-Limit Parse + REWRITE-Limit Validation): active_workorders[].status === 'failed' nach FAIL"
  - "Validator BLOCKED-Pfad (FILES_ALLOWED-Verletzung): active_workorders[].status === 'failed' nach BLOCKED"
  - "Tool-Authorization-Block-Pfad: active_workorders[].status === 'failed' nach Block"
  - "Files-Scope-Violation Post-Check-Pfad: active_workorders[].status === 'failed' nach Block"
  - "callModel Exception-Pfad: active_workorders[].status === 'failed' nach Catch"
  - "Skill-Loader Block-Pfad: active_workorders[].status === 'failed' nach Block"
  - "Tool-Result-Failed-Pfad: active_workorders[].status === 'failed' (bestehender Pfad bleibt; Verifikation)"
  - "Approval-Gate Block-Pfad MIT awaiting_approval: active_workorders[].status === 'awaiting_approval' UNVERÄNDERT"
  - "Review-Pipeline Rewrite-Pfad (review): active_workorders[].status === 'review' UNVERÄNDERT"
  - "Review-Pipeline Human-Needed-Pfad: active_workorders[].status === 'awaiting_approval' UNVERÄNDERT"
  - "Erfolgs-Pfad mit Tool-Request: active_workorders[].status === 'done' UNVERÄNDERT"
  - "Erfolgs-Pfad OHNE Tool-Request (parseToolRequest === null): active_workorders[].status NICHT 'failed' (WO-006 Test 8 Behaviour bleibt 1:1)"
  - "Frühe Scope-Lock-Konflikt-Pfade (Zeilen 331/354): active_workorders[].status === 'failed' UNVERÄNDERT (bereits korrekt)"
  - "Lock-Release-Verhalten aus WO-006 (releaseScopeLock + releaseDbMigrationLock auf jedem FAIL-Pfad) bleibt 1:1 erhalten — alle 9 dispatcher-fail-cleanup.test.ts Tests bleiben grün"
  - "MAX_REWRITE_LOOPS unverändert (2)"
  - "Kein Validator-Bypass eingeführt"
  - "Kein --force/--skip-validator/--bypass Flag"
  - "Keine Direkt-Manipulation von runtime_state.json oder system/state/*.jsonl"
  - "Keine Änderung an services/scheduler-api/**, governance-validator.ts, scheduler-preflight.ts, review-pipeline.ts, terminal-wo-reset-cli.ts, risk-categories.ts, workorder.schema.json, package.json"
  - "Keine neuen npm-Dependencies"
  - "ActiveWorkorder.status-Union und WO_TRANSITIONS unverändert"
  - "Audit-Events nur über audit-writer.ts; kein neuer Audit-Event-Typ erforderlich"
  - "Neue additive Tests in dispatcher-fail-cleanup.test.ts decken mindestens 5 FAIL-Pfade ab und verifizieren active_workorders[].status === 'failed' nach jedem"
  - "Bestehende dispatcher-fail-cleanup.test.ts Tests (9/9) bleiben grün"
  - "smoke-test.ts bleibt 9/9 PASS"
  - "pnpm tsc --noEmit clean"
  - "Nach einem simulierten failed Run kann terminal-wo-reset-cli.ts clear ... --confirm den Eintrag erfolgreich entfernen (CLI selbst NICHT geändert; Verifikation per neuem Test mit dispatcher-fail + manuelles getAllActiveWorkorders().find(...).status === 'failed')"

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
  - "NIEMALS state-manager.ts updateWorkorderStatus oder validateWoStatusTransition Verhalten ändern (Doku-Kommentar erlaubt; Behavior-Edit nicht)"
  - "NIEMALS WO_TRANSITIONS-Tabelle ändern"
  - "NIEMALS ActiveWorkorder.status-Union erweitern oder reduzieren"
  - "NIEMALS awaiting_approval oder review als 'failed' überschreiben (intentional non-terminal mit Re-Dispatch-Pfad)"
  - "NIEMALS no-tool-request-Erfolgs-Pfad (parseToolRequest === null) auf 'failed' setzen — WO-006 Test 8 Behaviour bleibt"
  - "NIEMALS Approval-awaiting-Pfad auf 'failed' überschreiben"
  - "NIEMALS Review-Pipeline review-/awaiting_approval-Pfade auf 'failed' überschreiben"
  - "NIEMALS WO-006 Lock-Release-Verhalten ändern (releaseScopeLock + releaseDbMigrationLock auf jedem FAIL-Pfad bleibt)"
  - "NIEMALS bestehende dispatcher-fail-cleanup.test.ts oder smoke-test.ts Tests deaktivieren oder skip-pen"
  - "NIEMALS Test-Anzahl in dispatcher-fail-cleanup.test.ts oder smoke-test.ts reduzieren"
  - "NIEMALS Audit-History (audit.jsonl, audit.error.jsonl, pipeline-audit.jsonl) löschen oder rewriten"
  - "NIEMALS package.json ändern"
  - "NIEMALS neue npm-Dependencies hinzufügen"
  - "NIEMALS ENV-Dateien lesen oder schreiben"
  - "NIEMALS Supabase-Befehle ausführen (supabase db push/reset/migration apply)"
  - "NIEMALS ein --force / --skip-validator / --bypass Flag einbauen"

files_blocked:
  - "services/scheduler-api/**"
  - "system/workorders/cli/**"
  - "system/approval/**"
  - "system/control-plane/terminal-wo-reset-cli.ts"
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
  - "npx tsx --test system/control-plane/__tests__/dispatcher-fail-cleanup.test.ts"
  - "npx tsx system/control-plane/__tests__/smoke-test.ts"

required_skills: ["gsd-v2"]
optional_skills: ["typescript-pro", "nodejs-best-practices", "debugging-strategies"]
blocked_by:      []
```

---

## Notes

- **Filename ↔ workorder_id:** Filename `WO-GOVERNANCE-P1-011-dispatcher-terminal-status-on-fail.md` folgt der Auftrags-Convention; `workorder_id: WO-governance-011` folgt der Schema-Regex `^WO-[a-z]+-[0-9]+$`. Orchestrator/Scheduler nutzen das `workorder_id`-Feld.
- **`requires_approval: true`** ist Pflicht für `risk_category: architecture` per `CLAUDE.md` Cautious-Regel (Spark D mandatory, kein Auto-Retry).
- **`agent_id: senior-coding-agent`** — registriert in `system/agent-registry/agents.json`. Wird durch `AGENT_VALIDATOR_MAP['senior-coding-agent'] = 'micro-executor'` (WO-005) zu `ALLOWED_AGENTS`-Wert normalisiert; via `RISK_CATEGORY_TO_RISK_LEVEL_MAP` (WO-009) wird `risk_level` auf `'medium'` aufgefüllt.
- **`rollback_hint` nicht erforderlich** per Schema if/then (nicht db-migration).
- **Verhältnis zu WO-005 / WO-006 / WO-007 / WO-008 / WO-009 / WO-010:**
  - WO-005/009: Validator-Pipeline-Normalisierung (Pipeline-FAIL-Vermeidung).
  - WO-006: Lock-Release auf FAIL-Pfaden (Try/Finally Defense-in-Depth).
  - WO-007/008: Smoke-Test/Reviewer-Injection.
  - WO-010: Terminal-WO-Reset-CLI (Operator-Tooling).
  - **WO-011** schließt die Lücke zwischen WO-006 und WO-010: WO-006 fixt Locks, WO-011 fixt `active_workorders.status`-Synchronisation auf FAIL — sodass die WO-010-CLI nach einem failed Run den Eintrag tatsächlich cleanen kann.
- **`scope_files` enthält 4 Files** — `dispatcher.ts` (Primary) + `state-manager.ts` (nur Doku-Kommentar erlaubt, kein Behavior-Edit) + 2 Test-Files. Konsistent mit `template_implementation_medium.md` (3-15 Files).
- **`files_blocked` schließt `terminal-wo-reset-cli.ts` explizit aus** — die CLI aus WO-010 ist read-only-Referenz; ihre Schutz-Funktion (Refusal von non-terminalen `dispatched`-Einträgen) bleibt unverändert. WO-011 sorgt dafür, dass der Status nach FAIL korrekt auf `'failed'` steht, sodass die CLI clearen kann.
- **`files_blocked` schließt `governance-validator.ts`, `scheduler-preflight.ts`, `review-pipeline.ts`, `risk-categories.ts`, `workorder.schema.json`** explizit aus — die Validator/Preflight/Review-Logik bleibt unverändert. WO-011 ist ein Dispatcher-Synchronisation-Fix, kein Validator-/Preflight-/Review-Eingriff.
- **`files_blocked` schließt `runtime_state.json` und alle `*.jsonl`-Audit-Logs** explizit aus — alle Mutations laufen über `state-manager.ts` (`updateWorkorderStatus`, `endRun`) und `audit-writer.ts`.
- **State-Machine-Sicherheit:** `WO_TRANSITIONS` (Zeile 250 in `state-manager.ts`) erlaubt `dispatched/running/review/awaiting_approval → failed` — alle für die Implementation relevanten Übergänge sind valide. `same-state idempotent` (Zeile 267) schützt vor Doppel-Aufrufen, falls ein Pfad aus historischen Gründen `updateWorkorderStatus('failed')` schon gesetzt hat.
- **Lifecycle-Pfad:** Erwartet `done` → `reviewed` (architecture-review + Spark D mandatory) → `closed`. Auto-Retry **deaktiviert** für `architecture` per `CLAUDE.md` High-Risk-Regel.
- **Bezug zur Geschichte:**
  - Pre-WO-011 Live-State (post-WO-010-Closure):
    - `WO-nutrition-001 / RUN-20260502-3836 / status: failed` ← clearable
    - `WO-nutrition-001 / RUN-20260502-6627 / status: dispatched` ← STALE (Validator-FAIL hinterließ `dispatched`)
    - `WO-nutrition-001 / RUN-20260503-8238 / status: dispatched` ← STALE (Validator-FAIL hinterließ `dispatched`)
  - Post-WO-011-Erwartung: nach jedem failed Run ist der WO-Status `'failed'` — Operator kann die Einträge mit der WO-010-CLI sauber cleanen.
- **Production-Default-Verhalten:** Erfolgsfall, awaiting_approval, review-Pfade bleiben BIT-IDENTISCH. Nur FAIL-Pfade werden präzisiert.
- **Tom darf nicht selbst granten** — die WO-Approval folgt dem normalen Spark-D-Mandatory-Review-Flow.

---

*Draft erzeugt: 2026-05-03 — gemäß `template_implementation_medium.md`, `wo_factory_prompt.md`, Operator-Diagnose nach WO-010-Closure (stale `dispatched`-Einträge in `active_workorders`), und WO-GOVERNANCE-P1-006 als Pattern-Vorlage für Try/Finally-Architektur.*
