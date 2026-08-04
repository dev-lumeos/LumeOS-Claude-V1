# BATCH-GOVERNANCE-P1-004-dispatcher-reviewer-injection

## Status
completed *(2026-05-02)*

## Validation Result
- `pnpm tsc --noEmit` → **PASS** (EXIT=0)
- `npx tsx system/control-plane/__tests__/smoke-test.ts` → **9/9 PASS** (Test 6 jetzt `completed` mit Mock-Reviewer)
- `npx tsx --test system/control-plane/__tests__/dispatcher-fail-cleanup.test.ts` → **9/9 PASS** (FAIL-Pfade unverändert grün)
- Implementation Review (Spark-D Mandatory) → **PASS** (siehe Verdict in `REVIEW-IMPLEMENTATION-WO-GOVERNANCE-P1-008` aus dem Review-Turn vom 2026-05-02; Scope Compliance PASS, Production Behavior UNCHANGED, Mock-Reviewer-Output `ReviewOutput`-konform, Validator nicht umgangen, Review-Pipeline nicht deaktiviert, Test 6 nicht abgeschwächt)
- Implementation Commit: `1773f8a fix(governance): inject dispatcher reviewer dependency`

## Purpose
Add dispatcher review-pipeline dependency injection so smoke tests can mock reviewer behavior without calling Spark C/D, while production defaults remain unchanged.

This single-WO batch closes the last residual gap from `BATCH-GOVERNANCE-P1-003-dispatcher-fail-cleanup` follow-up testing: after WO-governance-007 (Smoke-Test Modernize) lifted the smoke-test mocks onto the current `OrchestratorIntent + ToolRequest` contract, smoke-test reaches 8/9 PASS — but **Test 6 (`test6_dispatcher_e2e_write`) still fails**. Root cause: after `executeTool()` succeeds, the dispatcher invokes `runReviewPipeline()` (`dispatcher.ts:586`) with hardcoded `callFastReviewer: callGemmaReviewer` (imported from `services/scheduler-api/src/vllm-adapter.ts:90`). `callGemmaReviewer` makes a real `fetch` to `process.env.SPARK_C_ENDPOINT ?? 'http://192.168.0.99:8001'`. The smoke-test has no Spark-C server and no mock injection-point → invalid_json → Spark-D escalation → invalid_json → HUMAN_NEEDED → `result.status === 'blocked'`.

`DispatcherDeps` (`dispatcher.ts:118`) currently exposes only `callModel` and `executeTool`. The reviewer adapter is not injectable from the outside, even though `PipelineDeps.callFastReviewer` (`review-pipeline.ts:50-60`) is already a documented injection seam — the gap is purely in the dispatcher's own deps surface.

WO-governance-008 extends `DispatcherDeps` with an **optional** `callFastReviewer?: ReviewerCall` field, defaulting to the existing hardcoded `callGemmaReviewer` via a `?? callGemmaReviewer` fallback at the single call-site. Production behavior (`dispatch-loop.ts` injecting only `callModel` and `executeTool`) remains BIT-IDENTICAL to the pre-WO-008 version. Smoke-test Test 6 then injects a deterministic `mockFastReviewer` returning a valid `ReviewOutput` PASS-JSON (`{ status: 'PASS', risk: 'LOW', confidence: 0.9, violations: [], recommendations: [], summary: 'mock spark-c pass', requires_claude: false }` — fields and casing per `governance-validator.ts:372-380`). With Spark-C PASS the pipeline returns `kind: 'done'` and never escalates to Spark-D (`review-pipeline.ts:358`), so Spark-D injection stays out of scope for this WO.

After this WO is implemented and approved, `smoke-test.ts` reaches 9/9 PASS without any real Spark-C/D network calls, and `BATCH-NUTRITION-P1-001-db-foundation` workflow tests inherit a deterministic regression baseline.

---

## Included Workorders

| Order | Filename | workorder_id | Title | Risk | Approval |
|---|---|---|---|---|---|
| 1 | `WO-GOVERNANCE-P1-008-dispatcher-reviewer-injection.md` | `WO-governance-008` | governance-dispatcher-reviewer-injection-v1 | `architecture` | required |

**Filename ↔ ID Mapping:** Filename folgt Auftrags-Convention `WO-GOVERNANCE-P1-NNN-...md`; `workorder_id` folgt Schema-Regex `^WO-[a-z]+-[0-9]+$` aus `system/workorders/schemas/workorder.schema.json`. Orchestrator/Scheduler nutzen das `workorder_id`-Feld.

---

## Approval Gate

- WO-governance-008 requires approval.
- Risk category: `architecture` (per `CLAUDE.md` Cautious — Spark D mandatory, no auto-retry).
- `requires_approval: true` is set in the WO YAML.
- No execution may happen before explicit approval.
- Approval is enqueued during dispatch (HUMAN_NEEDED gate via `enqueueApproval()`); Tom grants via `npx tsx system/approval/approval-cli.ts grant <approval_id>`.

---

## Execution Guard

- Must not modify `services/scheduler-api/**` (insbesondere `vllm-adapter.ts`).
- Must not modify `system/control-plane/governance-validator.ts`.
- Must not modify `system/control-plane/scheduler-preflight.ts`.
- Must not modify `system/control-plane/review-pipeline.ts` (existierender `PipelineDeps.callFastReviewer` reicht; ESCALATE-Pfad in `<on_error>`).
- Must not modify `system/workorders/cli/**` (batch-loader).
- Must not bypass Preflight.
- Must not bypass Governance Validator.
- Must not increase `MAX_REWRITE_LOOPS`.
- Must not edit `runtime_state.json` directly.
- Must not edit audit JSONL logs (`pipeline-audit.jsonl`, `audit.jsonl`, `audit.error.jsonl`) directly.
- Must not edit approval queue files (`system/approval/**`).
- Must not add `--force` / `--skip-review` / `--no-spark` / `--bypass` flags.
- Must not disable or conditionally skip the review pipeline call in the dispatcher.
- Must not weaken smoke-test Test 6 expectation to `blocked` — must remain `completed`.
- Must not weaken expectations of any other smoke-test or `dispatcher-fail-cleanup.test.ts` test.
- Must not delete audit history.
- Must not make `callFastReviewer` a required field in `DispatcherDeps` — must remain optional with `?? callGemmaReviewer` fallback.
- Must write audit events only via `system/state/audit-writer.ts`.
- Must not add new npm dependencies; must not modify `package.json`.
- Must not run Supabase commands (`supabase db push/reset/migration apply`).

---

## Expected Output

- `dispatcher.ts` `DispatcherDeps` interface gains an optional `callFastReviewer?: (systemPrompt: string, userMessage: string, maxTokens?: number) => Promise<string>` field with type-signature identical to `callGemmaReviewer`.
- `dispatcher.ts` `runReviewPipeline()` call uses `callFastReviewer: deps.callFastReviewer ?? callGemmaReviewer` as default-fallback at the single call-site (`dispatcher.ts:600`).
- Production-default behavior is BIT-IDENTICAL to the pre-WO-008 version when no `callFastReviewer` is supplied (`dispatch-loop.ts` injection unchanged).
- `smoke-test.ts` `test6_dispatcher_e2e_write` injects a deterministic `mockFastReviewer` returning the full `ReviewOutput` PASS contract: `{ status: 'PASS', risk: 'LOW', confidence: 0.9, violations: [], recommendations: [], summary: 'mock spark-c pass', requires_claude: false }`.
- `smoke-test.ts` Test 6 `result.status === 'completed'` — not `blocked`.
- `smoke-test.ts` reaches 9/9 PASS.
- `dispatcher-fail-cleanup.test.ts` remains all PASS (FAIL-paths short-circuit before `executeTool()`, so review-pipeline is not reached — kein Edit erwartet).
- `pnpm tsc --noEmit` clean.
- No changes to `services/scheduler-api/**`, `review-pipeline.ts`, `governance-validator.ts`, `scheduler-preflight.ts`, `package.json`, `system/state/**`, `system/approval/**`, `system/workorders/cli/**`, `apps/**`, `supabase/**`, `.env*`.
- Audit-Trail (`system/state/pipeline-audit.jsonl`) shows `review_completed` event for Test 6 with the injected reviewer (verifizierbar via existierenden `audit-writer`; kein direkter JSONL-Edit).

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

Run WO-governance-008 through the normal implementation workflow:

1. Tom grants approval via `npx tsx system/approval/approval-cli.ts grant <approval_id>` once the HUMAN_NEEDED gate triggers during dispatch.
2. Dispatcher resumes, `consumeApproval()` is called, the `senior-coding-agent` adds the optional `callFastReviewer` field to `DispatcherDeps`, the `?? callGemmaReviewer`-Fallback at the single call-site, and the `mockFastReviewer` injection in `smoke-test.ts` Test 6.
3. Review Pipeline V2 (Spark C → Spark D mandatory for `architecture`) reviews the implementation.
4. After `done → reviewed → closed`, validation:
   - `pnpm tsc --noEmit` clean.
   - `npx tsx system/control-plane/__tests__/smoke-test.ts` → 9/9 PASS (no `--test` flag — `smoke-test.ts` uses its own `runAll()`-Schleife).
   - `npx tsx --test system/control-plane/__tests__/dispatcher-fail-cleanup.test.ts` → all PASS.
   - Optional: `npx tsx system/workorders/cli/run-batch.ts system/workorders/nutrition/batches/BATCH-NUTRITION-P1-001-db-foundation.md --run` läuft mit deterministischem Smoke-Baseline weiter.
5. Followup workorder candidates (not part of this batch):
   - **Spark-D-Reviewer-Injection** — future WO, ergänzt `PipelineDeps.callSeniorReviewer` injizierbar (Edit an `review-pipeline.ts` nötig). Risk: `architecture`. Erst sinnvoll, wenn Edge-Cases mit Spark-C-Escalation getestet werden müssen.
   - **`risk_level`-Normalisierung** — future OrchestratorIntent field-normalization WO, analoges Pattern zu WO-005. Risk: `architecture`.
   - **Cleanup of `WO-NUTRITION-P1-001` Bootstrap-Workaround** — restore `agent_id: docs-agent`, remove the bootstrap note. Risk: `standard` or `docs`.

---

## Run Notes

- **Batch is ready for approval, not approved.**
- **This file does not approve execution.**
- Reines Planungsdokument. Kein Worker, kein Scheduler, kein Dispatch durch diese Datei.
- **Single-WO batch** — kein Parallel-Risk, kein Scope-Konflikt mit anderen offenen Batches.
- **Vorgänger-Batches:**
  - `BATCH-GOVERNANCE-P1-001-batch-loader-cli` (Status: `completed`) — Batch-Loader CLI als Workflow-Eintrittspunkt.
  - `BATCH-GOVERNANCE-P1-002-orchestrator-intent-contract` (Status: implementiert via `WO-governance-005`) — `selected_agent`-Normalisierung.
  - `BATCH-GOVERNANCE-P1-003-dispatcher-fail-cleanup` (Status: implementiert via `WO-governance-006`) — Try/Finally-Cleanup auf FAIL-Pfaden.
  - **WO-governance-007** (Smoke-Test Modernize, `risk_category: test`, autonom — kein Batch-Plan nötig, ausgeführt nach Fix-Pass) — Combined-OrchestratorIntent+ToolRequest Mocks für Tests 6/7A/7B + makeWO `negative_constraints` auf 4 Einträge erweitert (Schema-Konformität, Pre-Existing latente Schema-minItems-4-Bug behoben). Ergebnis: 8/9 PASS, Test 6 → architektonischer Blocker.
- **Verhältnis zu `BATCH-GOVERNANCE-P1-003`:** Komplementär. WO-006 fixt FAIL-Cleanup (Lock-Release). WO-008 schließt die letzte Lücke für deterministische Smoke-Test-Verifikation des Erfolgspfads (Worker → executeTool → Review → done).
- **Verhältnis zu `BATCH-NUTRITION-P1-001-db-foundation`:** Indirekter Vorgänger — sobald Smoke-Tests deterministisch grün sind, ist der Regression-Indikator vor Nutrition-Workflow-Tests stabil.
- **Default-Verhalten BIT-IDENTISCH zur Pre-WO-008-Version:** Production-`dispatch-loop.ts` injiziert nach wie vor nur `callModel` und `executeTool`; der `??`-Fallback greift auf das hartcodierte `callGemmaReviewer` — keine Verhaltensänderung in Production.
- **Spark-D bleibt absichtlich nicht-injizierbar in dieser WO** — bei Spark-C PASS wird `runSingleTier('spark-d', ...)` nicht aufgerufen (`review-pipeline.ts:358`). Eine zukünftige WO kann Spark-D-Injection für Edge-Cases (Escalation/BLOCKED-Tests) ergänzen.

---

*Batch-Plan erzeugt: 2026-05-02 — gemäß `WO-GOVERNANCE-P1-008-dispatcher-reviewer-injection.md` (Draft, nach Fix-Pass), `REVIEW-WO-GOVERNANCE-P1-008-dispatcher-reviewer-injection.md` (Verdict: PASS_WITH_FIXES → Pflicht-Fixes umgesetzt) und `BATCH-GOVERNANCE-P1-003-dispatcher-fail-cleanup.md` (Pattern-Vorlage).*
