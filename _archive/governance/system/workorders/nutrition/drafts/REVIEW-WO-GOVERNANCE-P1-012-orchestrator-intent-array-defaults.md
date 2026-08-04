# REVIEW-WO-GOVERNANCE-P1-012-orchestrator-intent-array-defaults.md

**Reviewed Draft:** `system/workorders/nutrition/drafts/WO-GOVERNANCE-P1-012-orchestrator-intent-array-defaults.md`
**Reviewer:** Claude (Brain) · Workorder-Reviewer
**Review-Datum:** 2026-05-03

---

## Verdict

**PASS**

Architektur-Entscheidung sauber, Scope minimal, alle bestehenden Validator/Lock/State-Garantien explizit verankert, Pattern 1:1 zu WO-005/009. Eine LOW-Anmerkung zur Reason-Wording-Präzision (kein Blocker).

---

## Findings

| Severity | Finding | Fix |
|---|---|---|
| INFO | **Schema-konform:** `workorder_id` matched `^WO-[a-z]+-[0-9]+$`; alle Pflichtfelder; `negative_constraints`=30 (≥4); `acceptance_criteria`=28 (≥1); `scope_files`=4 (≥1); `task` enthält XML-Block; `rollback_hint` nicht nötig (nicht db-migration); `risk_category` ∈ enum; `priority` ∈ enum; `phase` ∈ enum. | — |
| INFO | **Template-konform:** `template_implementation_medium.md`-Struktur (XML-Task `<analyze>/<implement>/<constraints>/<on_error>`, `agent_id: senior-coding-agent`, `post_review_required: true`, 4 Files innerhalb 3-15-Range). | — |
| INFO | **`risk_category: architecture` korrekt:** Eingriff in `validateOrchestratorIntent`-Public-Behavior (neuer §0-Block vor §1 selected_agent) ist klassisch architecture per `CLAUDE.md` Cautious-Block. Spark-D-Mandatory-Review eingehalten. | — |
| INFO | **`requires_approval: true` korrekt** für `risk_category: architecture`. | — |
| INFO | **`agent_id: senior-coding-agent` korrekt:** Existiert in `agents.json`; via `AGENT_VALIDATOR_MAP` (WO-005) zu `'micro-executor'` normalisiert; via `RISK_CATEGORY_TO_RISK_LEVEL_MAP` (WO-009) `risk_level: 'medium'`. | — |
| INFO | **Scope minimal und angemessen:** 4 Files. `governance-validator.ts` (Primary, neuer §0-Block); `dispatcher.ts` (allowed aber Edit explizit als "nicht erwartet" markiert — defensive Inclusion); 2 Test-Files. | — |
| INFO | **`files_blocked` korrekt verriegelt 13 Patterns:** `terminal-wo-reset-cli.ts` (WO-010 unverändert), `scheduler-preflight.ts`, `review-pipeline.ts`, `risk-categories.ts`, `system/state/**`, `system/approval/**`, `services/scheduler-api/**`, `system/workorders/cli/**`, `workorder.schema.json`, `package.json`, `.env*`. Lückenlos. | — |
| INFO | **Fix ist tatsächlich nur OrchestratorIntent Array-Robustheit:** Out-of-Scope-Block + Constraints + 30 negative_constraints schließen explizit aus: Validator-Bypass, Strenge-Schwächung, MAX_REWRITE_LOOPS-Anpassung, `parseOrchestratorIntent`/`normalizeOrchestratorIntent`-Edit, `OrchestratorIntent`-Type-Änderung, Dispatcher-Edit, neue State-Manager/Audit-Writer-Helper. Reiner Validator-Defensive-Layer. | — |
| INFO | **selected_agent + risk_level Normalisierung unverändert:** WO-005/009-Layer (`parseOrchestratorIntent`, `normalizeOrchestratorIntent`, `AGENT_VALIDATOR_MAP`, `RISK_CATEGORY_TO_RISK_LEVEL_MAP`) explizit als out-of-scope und in negative_constraints verankert. §0 wird VOR §1/§2 eingefügt, ohne deren Bodies zu ändern. | — |
| INFO | **Validator nicht umgangen:** §1-§8 Logik 1:1 erhalten. §0 ist additiver Pre-Check, kein Bypass. Strenge bleibt: Array-Felder müssen Arrays sein → bei Verletzung deterministisches REWRITE statt TypeError. | — |
| INFO | **`MAX_REWRITE_LOOPS = 2` unverändert:** AC + Constraint + negative_constraint dreifach verankert. | — |
| INFO | **`ALLOWED_GATES`/`ALLOWED_RISK_LEVELS`/`ALLOWED_AGENTS` unverändert:** explizit in negative_constraints. `AGENT_VALIDATOR_MAP` und `RISK_CATEGORY_TO_RISK_LEVEL_MAP` ebenfalls unangetastet. | — |
| INFO | **Invalid/missing Arrays kontrolliert behandelt:** §0 retournt `{ status: 'REWRITE', reason: 'Feld "..." muss ein Array sein, war: <typeof>', field: '...' }` bei `!Array.isArray(intent[field])`. Bei undefined → REWRITE (nicht TypeError). Bei String/Object/Number → REWRITE. Bei null → explizit als `'null'` benannt (statt irreführendes `'object'`). REWRITE-Loop läuft bis `MAX_REWRITE_LOOPS`, dann FAIL mit Reason "REWRITE-Limit erreicht. Letzte Verletzung: Feld muss ein Array sein". | — |
| INFO | **Element-Type-Robustheit indirekt gesichert:** §0 prüft nur Array-Top-Level. Ungültige Element-Typen (z. B. `required_gates: [null, 123]`) werden von §3 `ALLOWED_GATES.has(gate)` als "Unbekannte Gate-ID" abgewiesen → korrekt deterministisches REWRITE. Kein zusätzlicher §0-Element-Check nötig. | — |
| INFO | **`OrchestratorIntent`-TypeScript-Interface unverändert:** explizit in negative_constraints. TypeScript-Cast in `parseOrchestratorIntent` (`as OrchestratorIntent`) bleibt; Runtime-Defensive ist §0-Aufgabe. Sauberer Layer-Cut zwischen Compile-Time-Type und Runtime-Validation. | — |
| INFO | **WO-006 Lock-Release + WO-011 Run-id-spezifischer Status-Update intakt:** Constraint + AC verankern dies. Bei §0-REWRITE-Limit-FAIL wird active_workorders[(woId, runId)].status korrekt auf `'failed'` gesetzt (durch WO-011-Helper im REWRITE-Limit-Pfad in dispatcher.ts:485 — bereits implementiert). Lock-Release im finally-Block (WO-006) bleibt unverändert. | — |
| INFO | **Acceptance Criteria messbar:** 28 ACs, davon 25 binär verifizierbar (Code-Inspektion auf `Array.isArray`-Check, Existenz des §0-Blocks, Validator-Strenge-Prüfung, Test-Lauf-Counts, REWRITE-Reason-Pattern-Match, Batch-Dry-Run-Outcome). | — |
| INFO | **Validation-Commands passend:** `pnpm tsc --noEmit` + `npx tsx system/control-plane/__tests__/smoke-test.ts` (ohne `--test` — korrekt, eigene `runAll()`-Schleife) + `npx tsx --test system/control-plane/__tests__/dispatcher-fail-cleanup.test.ts` (mit `--test` — korrekt, `node:test`) + Batch-Dry-Run als E2E-Smoke. | — |
| INFO | **`<on_error>` umfassend:** TypeScript-Fehler, Breaking-Change in Validator-API, Edits an `parseOrchestratorIntent`/`normalizeOrchestratorIntent`/`OrchestratorIntent`-Type/`dispatcher.ts`, out-of-scope-Files, neue Dependency, Migration, Security, rote Tests, WO-006/009/011-Behaviour-Bruch — alle Pfade mit klaren ESCALATE/STOP-Triggers. | — |
| INFO | **Lifecycle korrekt:** `done → reviewed → closed` (architecture → Spark-D mandatory) per `wo_lifecycle_v1.md`. Auto-Retry deaktiviert per `CLAUDE.md` High-Risk-Regel. | — |
| INFO | **6 additive Tests planen alle 4 Array-Felder ab:** undefined-Pfad pro Feld (4× Test C-1/3/5 + execution_order), non-array-Pfad (Test C-2/4), und Negativ-Protect (Test C-6). Eindeutige `scope_files` pro Test (`services/wo012-NNN/...`) analog zu WO-011-Pattern verhindert Lock-Konflikte. Bestehende 17 Tests bleiben unverändert. | — |
| INFO | **Pattern-Konsistenz mit WO-005/009:** WO-005 fixt `selected_agent`-Existenz + Mapping (defensive Layer für String-Feld); WO-009 fixt `risk_level`-Existenz + Mapping (defensive Layer für String-Feld); WO-012 schließt die Symmetrie für die 4 Array-Felder. Architektur konsistent. | — |
| INFO | **Architektur-Variante 1 (zentrale Pre-Validation) vs Variante 2 (inline-defensive) sauber begründet:** Variante 1 = 1 Stelle, kompakt, wartbar. Variante 2 = 4-5 Stellen, verstreut. Variante 3 (Zod) verworfen wegen Dependency. Variante 5 (silent → []) verworfen wegen verwischter Semantik. | — |
| LOW | **Reason-Wording bei `typeof []`:** Falls (theoretisch) ein nicht-strukturiert-typisiertes Validator-Aufrufer ein Array über `as` zur Laufzeit fälschlich als Array deklariert hätte (was nicht passiert, da §0 `Array.isArray` zuerst prüft), wäre `typeof` von `[]` `'object'` — wäre verwirrend in Debug-Output. Nicht-blockierend, da §0-Logik korrekt: nur bei `!Array.isArray` triggert die Reason; Arrays passieren §0 ohne Reason-Generierung. Falls noch sauberer: ein `describe(v)`-Helper, der `'array'`/`'object'`/`'null'`/`'undefined'`/typeof unterscheidet. | Optional: kleiner `describe(v: unknown): string`-Helper im Validator-File. Aber: aktuelle Lösung (`value === null ? 'null' : typeof value`) ist klar genug für Operator-Debugging. KEIN Blocker. |

---

## Batch Readiness

**Ready** — kein blocker-level Finding. Architektur-Variante 1 ist sauber begründet, Scope minimal, alle Sicherheits-/Strenge-Garantien aus WO-005/006/007/008/009/010/011 explizit verankert, Tests-Plan deckt alle 4 Array-Felder ab. WO ist ready für `BATCH-GOVERNANCE-P1-008-orchestrator-intent-array-defaults` und Approval-Gate (`requires_approval: true`).

---

## Required Fixes

**Keine.** Die WO ist batch-ready. LOW-Finding zur Reason-Wording-Präzision ist optional und nicht blockierend.

---

## Recommended Next Step

1. **Single-WO-Batch erstellen** (`BATCH-GOVERNANCE-P1-008-orchestrator-intent-array-defaults.md`) analog zu BATCH-005/006/007.
2. **Approval-Gate** (`requires_approval: true`) durch Tom (`npx tsx system/approval/approval-cli.ts grant <approval_id>`).
3. **Senior-Coding-Agent ausführt:** neuer §0-Block in `governance-validator.ts:280` (vor §1 selected_agent); 6 additive Tests in `dispatcher-fail-cleanup.test.ts`. `dispatcher.ts` und `smoke-test.ts` voraussichtlich ungeändert.
4. **Spark-D Mandatory Review** vor `done → reviewed → closed`.
5. **Validation:** `pnpm tsc --noEmit`, `smoke-test.ts` (9/9), `dispatcher-fail-cleanup.test.ts` (17 + ≥6 = ≥23 PASS), Batch-Dry-Run READY_TO_RUN.
6. **Tom-Aktion nach Closure (Verifikation):** Re-Run `BATCH-NUTRITION-P1-001-db-foundation` `--run`. Erwartung: kein TypeError mehr; falls Modell-Output unvollständig, dann kontrolliertes REWRITE-Limit-FAIL mit klarer Validator-Reason ("Feld ... muss ein Array sein") und WO-011-konformem `failed`-Status auf neuem `active_workorders`-Eintrag.
7. **Optional Followup-WO** (LOW-Finding nicht-blockierend, kann ignoriert werden):
   - `WO-governance-013-validator-typeof-helper` — kleiner `describe(v: unknown): string`-Helper für klarere Reason-Wording. Risk: `architecture` (Validator-Touch). Nur wenn Tom expliziten Wert in der Reason-Präzision sieht.

**Übersicht der bereits geplanten Followup-WOs (aus Batch-007/Vorgänger):**
- `WO-governance-013-finally-lock-release-on-non-terminal-paths` (latentes WO-006-Lock-Leak)
- `WO-governance-014-state-history-cleanup` (historische stuck-`dispatched`-Einträge)
- `WO-governance-015-validator-normalize-tests` (dedicated Mapping-Tests)
- Spark-D-Reviewer-Injection
- WO-NUTRITION-P1-001 Bootstrap-Cleanup

---

*Review erzeugt: 2026-05-03 — gemäß `MASTERPROMPT_WORKORDER_REVIEW.md`, gegen `workorder.schema.json`, `wo_lifecycle_v1.md`, `template_implementation_medium.md`, `governance-validator.ts` (`OrchestratorIntent`-Interface, `validateOrchestratorIntent` §1-§8, `ValidationResult`-Type, alle for-of-Iteration-Stellen Zeile 300/311/326/360/376/390), `dispatcher.ts` (Outer Catch-Block + WO-011-FAIL-Status-Update), und WO-005/009 als Pattern-Vorlagen für defensive Validator-Layer.*
