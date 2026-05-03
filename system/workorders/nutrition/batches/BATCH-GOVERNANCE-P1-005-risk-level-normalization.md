# BATCH-GOVERNANCE-P1-005-risk-level-normalization

## Status
ready_for_approval

## Purpose
Fix OrchestratorIntent `risk_level` normalization so dispatch runs cannot fail with `risk_level` undefined.

This single-WO batch closes the last known Validator-Pipeline-FAIL source identified during the post-`clearSystemStop` Nutrition Batch 001 `--run` (`RUN-20260503-8238`): after WO-005/006/007/008 Closure the dispatcher reaches the Governance Validator, but the Claude Code orchestrator model output is not delivering `risk_level` reliably. Validator §2 (`governance-validator.ts:223-229`) rejects `risk_level: undefined` → REWRITE × 2 → FAIL. The pattern is exactly what `selected_agent` showed pre-WO-005.

WO-governance-009 extends `governance-validator.ts` with a new `RISK_CATEGORY_TO_RISK_LEVEL_MAP` (13 RiskCategory entries fully covered: `docs`/`standard`/`test`/`i18n` → `low`; `architecture`/`security`/`auth`/`rls`/`shared-core` → `medium`; `db-migration`/`payments`/`medical`/`release` → `high`) and a `mapRiskCategoryToRiskLevel` helper. `normalizeOrchestratorIntent()` gains an optional THIRD parameter `workorderRiskCategory?: string` (positions 1+2 unchanged: `intent`, `workorderAgentId`). The dispatcher passes `wo.risk_category` through. Model-supplied valid `risk_level` still wins; only missing/invalid values get filled from the mapping. Validator §2-Strenge bleibt unverändert. Internal refactor of the function body from early-returns to an Accumulator-Pattern is allowed and necessary so the new `risk_level` block can run after the `selected_agent` block — but the WO-005 `selected_agent` normalization must remain functionally identical (same input → same output, same pass-through cases).

After this WO is implemented and approved, `BATCH-NUTRITION-P1-001-db-foundation` `--run` no longer fails on `Ungültiger risk_level: undefined` for `WO-nutrition-001` (`risk_category: docs` → `'low'`). `WO-nutrition-002`/`WO-nutrition-003` are expected to pause at the approval gate (`risk_category: db-migration` → `'high'` + `requires_approval: true`) — that pause is a desired outcome, not a failure.

---

## Included Workorders

| Order | Filename | workorder_id | Title | Risk | Approval |
|---|---|---|---|---|---|
| 1 | `WO-GOVERNANCE-P1-009-risk-level-normalization.md` | `WO-governance-009` | governance-risk-level-normalization-v1 | `architecture` | required |

**Filename ↔ ID Mapping:** Filename folgt Auftrags-Convention `WO-GOVERNANCE-P1-NNN-...md`; `workorder_id` folgt Schema-Regex `^WO-[a-z]+-[0-9]+$` aus `system/workorders/schemas/workorder.schema.json`. Orchestrator/Scheduler nutzen das `workorder_id`-Feld.

---

## Approval Gate

- WO-governance-009 requires approval.
- Risk category: `architecture` (per `CLAUDE.md` Cautious — Spark D mandatory, no auto-retry).
- `requires_approval: true` is set in the WO YAML.
- No execution may happen before explicit approval.
- Approval is enqueued during dispatch (HUMAN_NEEDED gate via `enqueueApproval()`); Tom grants via `npx tsx system/approval/approval-cli.ts grant <approval_id>`.

---

## Execution Guard

- Must not bypass `governance-validator` or `scheduler-preflight`.
- Must not remove or weaken Validator §1 (`selected_agent`-Check).
- Must not remove or weaken Validator §2 (`risk_level`-Check).
- Must not change `selected_agent` normalization semantics from WO-005 (interner struktureller Refactor von early-Returns auf Accumulator-Pattern erlaubt, sofern Verhalten 1:1 erhalten bleibt).
- Must not increase `MAX_REWRITE_LOOPS` (bleibt 2).
- Must not extend `ALLOWED_RISK_LEVELS` (`'low' | 'medium' | 'high'` bleiben).
- Must not modify `batch-loader.ts` (`system/workorders/cli/**`).
- Must not modify `services/scheduler-api/**`.
- Must not modify `system/control-plane/risk-categories.ts` (Single-Source-of-Truth bleibt).
- Must not modify `system/control-plane/scheduler-preflight.ts`.
- Must not modify `system/control-plane/review-pipeline.ts`.
- Must not modify `system/workorders/schemas/workorder.schema.json` (`risk_category` enum bleibt).
- Must not edit `runtime_state.json` directly.
- Must not edit audit JSONL logs (`pipeline-audit.jsonl`, `audit.jsonl`, `audit.error.jsonl`) directly.
- Must not edit approval queue files (`system/approval/**`).
- Must not introduce a new audit-event type — reuse existing `'orchestrator_intent_normalized'` from WO-005.
- Must not add `--force` / `--skip-validator` / `--bypass` flags.
- Must not execute Supabase commands (`supabase db push/reset/migration apply`).
- Must not modify `package.json` and must not add new npm dependencies.
- Must not disable or skip existing tests in `smoke-test.ts` or `dispatcher-fail-cleanup.test.ts`.
- Must not weaken any test expectation (smoke-test 9/9, fail-cleanup 9/9).
- Must write audit events only via `system/state/audit-writer.ts`.

---

## Expected Output

- `governance-validator.ts` gains `RISK_CATEGORY_TO_RISK_LEVEL_MAP` covering all 13 RiskCategory values:
  - `docs`, `standard`, `test`, `i18n` → `'low'`
  - `architecture`, `security`, `auth`, `rls`, `shared-core` → `'medium'`
  - `db-migration`, `payments`, `medical`, `release` → `'high'`
- `governance-validator.ts` gains exported helper `mapRiskCategoryToRiskLevel(riskCategory: string | undefined): 'low' | 'medium' | 'high' | undefined`.
- `normalizeOrchestratorIntent()` accepts an optional THIRD parameter `workorderRiskCategory?: string` (positions 1+2 unchanged: `intent`, `workorderAgentId`); existing 2-arg callers remain backward-compatible.
- Body refactored from early-returns to Accumulator-Pattern (`let result: OrchestratorIntent = intent; ... return result`), preserving WO-005 `selected_agent` functional behavior 1:1.
- Model-supplied valid `risk_level` (∈ `ALLOWED_RISK_LEVELS`) keeps precedence — Mapping-Default greift NUR bei undefined/leer/ungültig.
- `dispatcher.ts` passes `wo.risk_category` as the THIRD parameter to `normalizeOrchestratorIntent()`.
- `pnpm tsc --noEmit` clean.
- `npx tsx system/control-plane/__tests__/smoke-test.ts` → 9/9 PASS (Mocks aus WO-007 enthalten bereits `risk_level`; keine Mock-Anpassung erwartet).
- `npx tsx --test system/control-plane/__tests__/dispatcher-fail-cleanup.test.ts` → all PASS.
- `npx tsx system/workorders/cli/run-batch.ts system/workorders/nutrition/batches/BATCH-NUTRITION-P1-001-db-foundation.md --dry-run` → READY_TO_RUN.
- `npx tsx ... --run` → `WO-nutrition-001` (`docs`) PASS-iert Validator §2 (kein "Ungültiger risk_level: undefined" mehr); `WO-nutrition-002`/`WO-nutrition-003` (`db-migration`) pausieren am Approval-Gate (`requires_approval: true` — keine Auto-Grant durch dieses WO).
- Audit-Trail (`system/state/pipeline-audit.jsonl`) zeigt `'orchestrator_intent_normalized'`-Events für `risk_level`-Normalisierungs-Fälle (existierender Audit-Writer; kein direkter JSONL-Edit, kein neuer Event-Typ).
- Existierende `governance-validator-normalize.test.ts`-Tests (WO-005) bleiben grün (read-only-Verifikation; Test-Datei NICHT in `scope_files` — falls Anpassung nötig wäre → ESCALATE).
- No changes to `services/scheduler-api/**`, `risk-categories.ts`, `review-pipeline.ts`, `scheduler-preflight.ts`, `package.json`, `system/state/**`, `system/approval/**`, `system/workorders/cli/**`, `system/workorders/schemas/**`, `apps/**`, `supabase/**`, `.env*`.

---

## Lifecycle Path

Per `system/workorders/lifecycle/wo_lifecycle_v1.md`:

```
wo_generated → graph_validated → queue_released
  → ready (no blocked_by)
  → dispatched → running
  → done
  → reviewed (architecture review + Spark D mandatory)
  → closed
```

Auto-Retry **disabled** for `architecture` per `CLAUDE.md` High-Risk-Regel.

---

## Next Step After Approval

Run WO-governance-009 through the normal implementation workflow:

1. Tom grants approval via `npx tsx system/approval/approval-cli.ts grant <approval_id>` once the HUMAN_NEEDED gate triggers during dispatch.
2. Dispatcher resumes, `consumeApproval()` is called, the `senior-coding-agent` adds `RISK_CATEGORY_TO_RISK_LEVEL_MAP` + `mapRiskCategoryToRiskLevel` + the third optional parameter to `normalizeOrchestratorIntent()` + Accumulator-Pattern-Refactor in `governance-validator.ts`, plus `wo.risk_category`-Pass-Through in `dispatcher.ts`.
3. Review Pipeline V2 (Spark C → Spark D mandatory for `architecture`) reviews the implementation.
4. After `done → reviewed → closed`, validation:
   - `pnpm tsc --noEmit` clean.
   - `npx tsx system/control-plane/__tests__/smoke-test.ts` → 9/9 PASS (kein `--test` Flag — eigene `runAll()`-Schleife).
   - `npx tsx --test system/control-plane/__tests__/dispatcher-fail-cleanup.test.ts` → all PASS.
   - `npx tsx system/workorders/cli/run-batch.ts system/workorders/nutrition/batches/BATCH-NUTRITION-P1-001-db-foundation.md --dry-run` → READY_TO_RUN.
   - `npx tsx ... --run` → `WO-nutrition-001` PASS-iert Validator §2; `WO-nutrition-002/003` pausieren am Approval-Gate. Stop-Rule-Counter (Schwellwert 5) bleibt unter Limit (≤ 1 expected new failure dadurch).
5. Followup workorder candidates (not part of this batch):
   - **`WO-governance-010-validator-normalize-tests`** — dedicated Mapping-/Helper-Tests in `governance-validator-normalize.test.ts`, Risk: `test` (autonom, kein Approval).
   - **Spark-D-Reviewer-Injection** — `PipelineDeps.callSeniorReviewer` injizierbar (Edit an `review-pipeline.ts`), Risk: `architecture`.
   - **Cleanup of `WO-NUTRITION-P1-001` Bootstrap-Workaround** — restore `agent_id: docs-agent`, remove the bootstrap note (Risk: `standard` oder `docs`).
   - **Stop-Rule CLI** — `WO-governance-011-stop-rule-cli` für Operator-Friendly `clear`/`status`-Ops mit Audit-Event (Risk: `architecture`).

---

## Run Notes

- **Batch is ready for approval, not approved.**
- **This file does not approve execution.**
- Reines Planungsdokument. Kein Worker, kein Scheduler, kein Dispatch durch diese Datei.
- **Single-WO batch** — kein Parallel-Risk, kein Scope-Konflikt mit anderen offenen Batches.
- **Vorgänger-Batches:**
  - `BATCH-GOVERNANCE-P1-001-batch-loader-cli` (Status: `completed`) — Batch-Loader CLI als Workflow-Eintrittspunkt.
  - `BATCH-GOVERNANCE-P1-002-orchestrator-intent-contract` (Status: closed via `WO-governance-005`) — `selected_agent`-Normalisierung.
  - `BATCH-GOVERNANCE-P1-003-dispatcher-fail-cleanup` (Status: closed via `WO-governance-006`) — Try/Finally-Cleanup auf FAIL-Pfaden.
  - `BATCH-GOVERNANCE-P1-004-dispatcher-reviewer-injection` (Status: completed via `WO-governance-008`, Commit `1773f8a`) — `DispatcherDeps.callFastReviewer`-Injection.
  - **WO-governance-007** (Smoke-Test Modernize, `risk_category: test`, autonom — kein Batch-Plan; closed nach WO-008) — Combined-OrchestratorIntent+ToolRequest Mocks.
- **Verhältnis zu BATCH-002:** Komplementär. WO-005 fixt `selected_agent`-Normalisierung (Validator §1). WO-009 fixt `risk_level`-Normalisierung (Validator §2). Beide WOs nutzen identisches Mapping-Layer-Pattern und denselben Audit-Event.
- **Verhältnis zu `BATCH-NUTRITION-P1-001-db-foundation`:** Direkter Bootstrap-Vorgänger — solange `risk_level: undefined` Validator-FAIL produziert, kann der Nutrition-Bootstrap-Workflow nicht abgeschlossen werden. Nach WO-009 erreicht `WO-nutrition-001` Validator-PASS, `WO-nutrition-002/003` pausieren regulär am Approval-Gate.
- **Audit-Event-Wiederverwendung:** Selber Event-Typ wie WO-005 (`'orchestrator_intent_normalized'`); kein neuer Event, kein `audit-writer.ts`-Edit.
- **Production-Default Verhalten unverändert:** `normalizeOrchestratorIntent(intent, agentId)` ohne dritten Parameter funktioniert weiter (Backward-Compatibility). Fehlende `workorderRiskCategory` → kein Mapping-Fallback → Validator entscheidet deterministisch wie heute.
- **Stop-Rule-Bewusstsein:** Aktueller failed-runs-Counter steht laut letztem Re-Run auf ≥ 1 (`RUN-20260503-8238`). Eine erfolgreiche Closure dieses WOs reduziert weitere Re-Run-Failures; falls die Stop-Rule während WO-009-Implementation/Review erneut auslöst, ist `clearSystemStop()` über die offizielle State-Manager-Funktion durch Tom autorisierbar (analog zum Vorlauf von 2026-05-03).

---

*Batch-Plan erzeugt: 2026-05-03 — gemäß `WO-GOVERNANCE-P1-009-risk-level-normalization.md` (Draft, nach Fix-Pass), `REVIEW-WO-GOVERNANCE-P1-009-risk-level-normalization.md` (Verdict: PASS_WITH_FIXES → Pflicht-Fixes umgesetzt) und `BATCH-GOVERNANCE-P1-004-dispatcher-reviewer-injection.md` (Pattern-Vorlage).*
