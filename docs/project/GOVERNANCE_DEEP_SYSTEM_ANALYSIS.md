# Governance Deep System Analysis

Generated: 2026-05-11

## 1. Executive Summary

The LumeOS governance/control-plane stack is substantially stronger than the product system it is meant to protect. The operator, doctor, invariant checker, agent contract checker, model runtime checker, dossier reporter, promotion governance, project profiles, Governance UI, Codex Worker bridge, and learning system all have real tests and stable JSON-facing outputs.

The solid parts are the deterministic safety layers: product gate enforcement, approval lifecycle checks, runtime artifact detection, batch status classification, safe cleanup dry-runs, Codex Worker timeout/final-state handling, learning record validation, and promotion governance. The targeted test suite passed across the core governance layers.

The fragile part is live runtime availability and runtime-state interpretation. Static model routing is clean, but a live endpoint check on 2026-05-11 showed all required Spark HTTP runtimes timing out, even with a 5000 ms timeout. Tom clarified that all DGX/Spark devices are intentionally powered down for rack installation (`planned_hardware_maintenance`). This is not a routing defect and must not trigger Spark routing fixes. It still means runtime-dependent autonomous/night/large runs are not allowed until the hardware maintenance window is over and endpoint health is re-proven. Codex/GPT-5.5 external routes are healthy by config, and MealCam is correctly optional/info-only.

The missing parts are mostly V2/V3 hardening rather than first-order safety: runtime history freshness, deeper project-profile portability, visual/browser smoke testing for the UI, richer profile-aware source-chain semantics, and more automated memory/handover maintenance.

Product work should remain closed. The governance stack is coherent enough for controlled governance/documentation work and narrow Codex senior-agent governance workorders, but it is not ready for product execution, BLS import, DB apply, broad autonomous runs, or night runs during planned DGX/Spark hardware maintenance.

## 2. Current System Map

| Layer | Status | Evidence | Main remaining issue |
|---|---|---|---|
| Operator / Batch Flow | V2 DONE | `batch-operator.test.ts` passed 19 tests; doctor passed 14 tests. | Real product batches remain policy-blocked; runtime-dependent execution must wait until planned hardware maintenance ends. |
| Dispatcher / Tool Execution | PARTIAL | Codex worker dispatcher tests passed; dispatcher has cleanup and final-state tests. | Spark model-call path depends on live endpoints; current endpoint downtime is planned maintenance, not routing failure. |
| Codex Worker | V1 DONE | Worker tests passed 16 tests; controlled smoke history exists; timeout/stdin/final-state fixes covered. | Enabled only for `senior-coding-agent`; broad automation intentionally blocked. |
| Approval Lifecycle | DONE | Invariant and batch-operator tests cover approvals, tokens, denied/expired cleanup, and no auto-grants. | Operation taxonomy still needs periodic review as new tools appear. |
| State / Cleanup / Stop Rules | V2 DONE | Invariant tests passed 16 tests; failed-run baselines and cleanup candidates are covered. | Stop-rule baseline lifecycle remains mostly CLI/manual. |
| Checkers | DONE | Invariant, contract, runtime static, learning checks all passed with 0 high/critical. | Endpoint health is unavailable due planned hardware maintenance; promotion review on `main` is noisy by design. |
| Reporting / Dossier | V2 DONE | Batch dossier tests passed 11 tests; autonomy handoff included. | Dossier is still command/result oriented and depends on explicit invocation. |
| Memory / Learning | V2 DONE | Learning check passed with 0 findings; suggestion tool returned 0 candidates and 5 duplicates. | Canonical memory and handover updates are still manual/reviewed, not automatically maintained. |
| Project Profiles | V1 DONE / PARTIAL | Profile loader tests passed; LumeOS profile active. | UI snapshot and many docs still assume LumeOS/Nutrition; second-project onboarding is not proven. |
| Governance UI | V2 DONE | Web typecheck, UI tests, and Next build passed. | No browser screenshot/visual regression suite; graph is lightweight, not full React Flow. |
| Workorder Factory | V1 DONE / PARTIAL | Factory tests passed 11 tests. | Free-form spec to structured plan remains prompt/skill-driven. |
| Agent / Skill / Model Routing | DONE / PARTIAL | Agent contract and model static checks passed. | Live Spark endpoint health cannot be proven during planned hardware maintenance. |
| Runtime Monitoring History | V1 DONE / RISK | History summary works and ignores stale removed routes. | Latest recorded history can be healthier than live endpoint state; freshness is not enforced. |
| Local Supabase / DB Safety | DOCS DONE | Product gate and forbidden command policies are documented. | No DB work should be run until Tom explicitly opens the gate. |
| Product Gate | CLOSED | Profile, handover, promotion, operator, and Codex policy all report closed/blocked. | Waiver/open path must remain explicit and auditable. |

## 3. Check Results

| Check/test | Result | Findings | Severity | Action |
|---|---:|---|---|---|
| `tsc --noEmit` | PASS | none | none | Keep required before promotion. |
| `governance-invariant-check --json --project lumeos` | PASS | critical=0 high=0 medium=0 | none | Keep as promotion gate. |
| `agent-contract-check --json` | PASS | critical=0 high=0 medium=0 | none | Keep as promotion gate. |
| `model-runtime-check --json` | PASS | static routing clean; Codex routes external_ok | none | Static config is clean. |
| `governance-learning-check --json --project lumeos` | PASS | critical=0 high=0 medium=0 low=0 | none | Learning records are complete. |
| `governance-learning-suggest --json` | PASS | 0 candidates, 5 duplicates | info | No new incident record needed. |
| `promotion-governance --review-branch main --json --project lumeos` | NON-ZERO | `git.branch_not_ahead`; `main..main count=0` | high in tool output | Treat as expected no-op review result, not a system bug. Use feature branches for promotion review. |
| `model-runtime-check --check-endpoints --timeout-ms 1500 --json` | FAIL | 13 high endpoint timeouts, 1 MealCam info | maintenance | Tom confirmed all DGX/Spark devices are down for rack installation. Do not treat as routing failure. |
| `model-runtime-check --check-endpoints --timeout-ms 5000 --json` | FAIL | Same 13 high endpoint timeouts | maintenance | Confirms endpoints unavailable during planned maintenance, not just too-short 1500 ms timeout. |
| Direct curl Spark A/B `/v1/models` | FAIL | connection timed out after 5s | maintenance | Expected during planned DGX/Spark hardware maintenance. |
| `batch-operator.test.ts` | PASS | 19 tests | none | Good coverage of status, approvals, cleanup, autonomy. |
| `operator-doctor.test.ts` | PASS | 14 tests | none | Doctor contract stable. |
| `governance-invariant-check.test.ts` | PASS | 16 tests | none | State invariant coverage is strong. |
| `agent-contract-check.test.ts` | PASS | 9 tests | none | Agent contract drift covered. |
| `model-runtime-check.test.ts` | PASS | 24 tests | none | Static, endpoint, optional, history cases covered. |
| `dispatcher-codex-worker.test.ts` | PASS | 8 tests | none | Codex gating and result mapping covered. |
| `codex-worker.test.ts` | PASS | 16 tests | none | Timeout, stdin close, parser, dry-run covered. |
| `batch-dossier.test.ts` | PASS | 11 tests | none | Dossier read/write and Codex metadata covered. |
| `governance-learning-check.test.ts` | PASS | 9 tests | none | Learning validation covered. |
| `governance-learning-suggest.test.ts` | PASS | 10 tests | none | Suggestion categories and drafts covered. |
| `wo-factory.test.ts` | PASS | 11 tests | none | Factory rejects missing source/scope/raw misuse. |
| `project-profile-loader.test.ts` | PASS | 7 tests | none | Profile loading and path safety covered. |
| `apps/web typecheck` | PASS | none | none | UI types clean. |
| `governance-ui.test.ts` | PASS | 26 tests | none | UI safety helpers covered. |
| `apps/web build` | PASS | Next build succeeded, 14 static pages | none | UI production build works. |

## 4. Critical Findings

No critical governance implementation findings were found by the read-only checks or targeted tests.

This does not mean the system is ready for product work. Live runtime endpoint checks are unavailable because DGX/Spark devices are intentionally powered down for rack installation, and that blocks autonomous/night/product execution until health is re-proven after maintenance.

## 5. High Findings

### H-001: Planned DGX/Spark hardware maintenance prevents runtime health proof

Evidence:

- `model-runtime-check --check-endpoints --timeout-ms 1500 --json`: `high=13`.
- `model-runtime-check --check-endpoints --timeout-ms 5000 --json`: `high=13`.
- Spark A `http://192.168.0.128:8001/v1/models`: curl timed out after 5s.
- Spark B `http://192.168.0.188:8001/v1/models`: curl timed out after 5s.
- Required affected routes include `context-builder`, `db-migration-agent`, `docs-agent`, `fast-reviewer-agent`, `governance-compiler`, `i18n-agent`, `micro-executor`, `orchestrator-agent`, `pre-review-agent`, `post-review-agent`, `review-agent`, `security-specialist`, and `test-agent`.
- Tom clarified the root condition: all DGX/Spark devices are shut down for rack installation (`planned_hardware_maintenance`).

Consequence: Spark-dependent autonomous/operator execution is not currently safe, but this is an infrastructure maintenance window, not a governance routing defect. Codex external runtime remains available by config, but the whole governance runtime should not be treated as fully proven until endpoint health is rechecked after maintenance.

Recommended action: Do not change Spark routing because of this downtime. After rack installation, run a read-only endpoint health check and record fresh runtime history before any autonomous/night/large/product run.

### H-002: Runtime history freshness can mask current endpoint failure

Evidence:

- `model-runtime-check --history-json` reported `overall_readiness: RUNTIME_DEGRADED` based on history through `2026-05-10T08:02:20.730Z`.
- Live endpoint checks on 2026-05-11 reported 13 high endpoint failures.

Consequence: Operator/Doctor/UI may show historical health that is less severe than current live health or planned maintenance unless users explicitly know the maintenance context.

Recommended fix: Add freshness metadata and a maintenance-aware status. If latest recorded endpoint check is older than a threshold or a maintenance flag is active, show `STALE` or `PLANNED_MAINTENANCE_RECHECK_REQUIRED` rather than implying a routing failure.

### H-003: Product gate must remain closed

Evidence:

- LumeOS profile has `product_gate.status: closed`.
- Invariant, learning, promotion, and runtime checks report product work blocked.
- Runtime endpoints cannot be health-checked during planned DGX/Spark rack maintenance.

Consequence: Product work, BLS import, DB apply, night runs, and broad autonomous execution remain unsafe during maintenance.

Recommended fix: Keep product gate closed until hardware maintenance ends, endpoint health is re-proven, a controlled planning/probe batch is explicitly opened by Tom, and promotion governance is clean on a feature branch.

## 6. Medium Findings

### M-001: Codex Worker config has a stale/ambiguous metadata field

Evidence:

- `system/workers/codex-worker.config.json` has `codex_worker_enabled: true` and `allow_dispatcher_integration: true`.
- The same file still says `"dispatcher_integration": "deferred"`.

Consequence: Humans and UI/reporting can misread Codex Worker as both enabled and deferred.

Recommended fix: Replace the stale string with a machine-checked enum such as `controlled_enabled`, or remove it and rely on the boolean gates.

### M-002: Senior review via Codex is conceptually enabled, but worker allowlist is coding-agent only

Evidence:

- `senior-reviewer-agent` routes to Codex/GPT-5.5 in `model_routing.json`.
- `codex-worker.config.json` allowlists only `senior-coding-agent`.
- Senior review smoke used the existing controlled path, but broad reviewer-agent dispatch is not enabled.

Consequence: The role mapping is correct, but operator behavior can still be confusing: senior review is Codex, yet Codex Worker dispatch only accepts the coding-agent ID.

Recommended fix: Either document that senior review workorders must use `senior-coding-agent` with a review objective, or add a separately gated `senior-reviewer-agent` Codex Worker path with tests.

### M-003: Project profiles are useful but not truly multi-project yet

Evidence:

- `lumeos.json` hardcodes `repo_root: D:/GitHub/LumeOS-Claude-V1`.
- UI snapshot reads `system/project-profiles/profiles/lumeos.json` directly.
- UI tests assert the repo root matches `LumeOS-Claude-V1`.
- Workorder/source-chain examples remain Nutrition-centric.

Consequence: LumeOS is profile-aware, but Beauty Club or another project cannot be attached without more migration.

Recommended fix: Add a profile selector or environment override to the UI snapshot/API layer, move default batch/source-chain semantics into profile fields, and add a second-project fixture test.

### M-004: Workorder factory still depends on structured inputs and domain-specific paths

Evidence:

- `wo-factory` tests validate structured plans.
- Source refs and examples are mostly Nutrition paths.
- The creative spec-to-decomposition step still lives in prompts/skills rather than deterministic code.

Consequence: Factory output quality is good after structured input exists, but the raw idea/spec to plan step remains human/model mediated.

Recommended fix: Add a deterministic plan validator for decomposition specs and profile-aware source bundles before `wo-factory` writes WOs.

### M-005: UI V2 has no real browser/visual regression gate

Evidence:

- UI typecheck, build, and helper tests pass.
- No Playwright/browser screenshot verification was run in this analysis.
- Existing tests verify source/components and command safety, not visual layout.

Consequence: The UI can regress visually while typecheck/build still pass.

Recommended fix: Add a lightweight local browser smoke that starts the app, opens all `/governance/*` routes, verifies styled shell/navigation/cards render, and captures screenshots.

### M-006: Runtime/Codex reports are ignored but contain large local transcripts

Evidence:

- `system/reports/codex-worker/` is ignored.
- Local report files contain prompts, command transcripts, local paths, and generated summaries.

Consequence: Ignored reports are not a commit risk, but they are local privacy/security artifacts and can confuse grep-based audits.

Recommended fix: Add retention/redaction guidance and a report summarizer that extracts metadata without scanning full prompt transcripts by default.

### M-007: Promotion review on `main` reports high by design

Evidence:

- Requested command `promotion-governance --review-branch main` returned `NEEDS_FIX` with `git.branch_not_ahead`.

Consequence: This is correct for a promotion target, but it is noisy as a health check.

Recommended fix: Add a dedicated `--status` or `--review-current` mode for health checks, or downgrade `branch_not_ahead` to info when the reviewed branch is `main`.

## 7. Low Findings / Cleanup

- Several older docs still reference Nutrition bootstrap batches and historical rerun commands. They are useful history but should be marked archival when no longer active.
- `system/OPEN_TODOS.md` and `docs/project/OPEN_TODOS.md` may be stale compared with the newer TODO register.
- Workorder graph is a lightweight dependency board, not a full graph engine. That is acceptable for V2 but should not be oversold.
- Learning suggestion duplicates still include historical noisy evidence. The duplicate handling works, but the output is verbose.
- Runtime history summary currently returns `RUNTIME_DEGRADED` when only optional MealCam is offline and required latest routes were previously OK. That is conservative, but the UI should explain optional degradation clearly.

## 8. Product Gate Assessment

Product work remains blocked.

Reasons:

- Profile product gate is closed.
- Product work policy remains explicit: no BLS import, no Nutrition product batches, no DB push/reset, no migration execution.
- Live required Spark endpoints cannot be used during planned rack-install maintenance.
- Runtime history is not fresh enough to override the planned maintenance state.

Partially allowed work:

- Governance/docs-only workorders.
- Read-only checks.
- Controlled Codex Worker governance/docs workorders that pass policy.
- Dossier/report/learning/profile/UI documentation work.

Not allowed:

- Product implementation.
- BLS import.
- Supabase DB push/reset/migration up.
- Production DB changes.
- Broad autonomous/night runs.

## 9. Codex Worker Assessment

Manual bridge: ready. It supports dry-run by default, execute only by explicit flag, hard timeout, stdin close, stdout-first final-state parsing, prompt/report artifacts, and no test-time real Codex execution.

Dispatcher integration: controlled-enabled for `senior-coding-agent`, not broad. It requires `codex_worker: true`, `runtime_type: codex-cli`, allowed agent, complete metadata, no approval requirement, product gate pass, and timeout.

Senior coding: ready for governance/docs workorders under the controlled policy.

Senior review: proven conceptually through a review smoke, and runtime routing maps `senior-reviewer-agent` to Codex/GPT-5.5. The operational worker path still uses the narrow `senior-coding-agent` allowlist unless extended.

Limitations:

- No product work while product gate is closed.
- No automatic retry loop.
- No broad agent allowlist.
- Runtime reports are ignored but locally verbose.
- Config metadata still says `dispatcher_integration: deferred` despite enabled booleans.

Safe use rules:

- Use only scoped governance/docs workorders.
- Require `codex_worker: true`.
- Keep timeout at or below max.
- Review reports before promotion.
- Do not commit runtime reports.

## 10. Runtime Assessment

Current readiness: blocked for Spark-dependent work due planned hardware maintenance.

Static routing:

- Clean.
- Codex senior routes are `codex-cli` and `external_ok`.
- DGX4/Spark D is lab-disabled and not productive.
- MealCam is optional/on-demand.

Live endpoint health:

- Spark A/B/C required endpoints timed out at both 1500 ms and 5000 ms because all DGX/Spark devices are intentionally powered down for rack installation.
- Codex external runtime is config/manual checked, not HTTP checked.
- MealCam offline is info and non-blocking.

History:

- Runtime history is useful and ignores removed DGX4 stale blockers.
- History can be stale relative to live status.

Need:

- Freshness threshold.
- Optional scheduled read-only endpoint recording after hardware maintenance ends.
- Deeper Spark/vLLM observability: process state, GPU memory, model loaded, queue depth, and `/v1/models` latency.

## 11. UI Assessment

Usable:

- All Governance UI routes build.
- Command allowlist and controlled-action tests pass.
- Product gate, profile, runtime, dossier, workorder graph, approval display, and autonomy handoff are represented.
- Approval center remains display-only for grant/deny.
- Raw CLI output is secondary/collapsible.

Weak:

- No browser screenshot/visual regression tests.
- Workorder graph is not a full React Flow graph.
- Runtime page can show history and current checks, but stale-history semantics need clearer UX.
- Promotion page can show scary `main` review failures unless helper text is prominent.

Next V2/V3 needs:

- Browser smoke and screenshot baseline.
- Runtime freshness badge.
- Dossier timeline filtering.
- Better approval detail drawer.
- Optional read-only polling for dashboard/runtime.

## 12. Project Profile Assessment

Portability status: partial.

What works:

- LumeOS profile loader validates required fields.
- Path traversal and forbidden/raw/runtime path detection are tested.
- Operator, doctor, Codex Worker, dossier, learning, promotion, invariant, source-chain, and UI use `--project lumeos` or profile defaults in key paths.

What remains hardcoded:

- LumeOS repo path in profile.
- UI snapshot directly reads `lumeos.json`.
- Default batch is a LumeOS/Nutrition governance batch.
- Source-chain standard is still Nutrition-specific.
- Factory test fixtures are Nutrition-specific.

Can a second project be added now?

Not without more work. A skeleton profile can exist, but a second live project needs profile-driven source-chain semantics, default batch selection, UI project selection or locked context, and non-Nutrition fixtures.

What should remain global:

- No Supabase reset/push without explicit Tom action.
- No production DB.
- No approval auto-grants.
- No runtime_state/queue manual edits.
- No runtime artifact commits.

## 13. Memory/Learning Assessment

Current state:

- Learning check is clean: critical=0, high=0, medium=0, low=0.
- Suggestion tool found no unrecorded candidates.
- Five historical duplicates are correctly matched to existing learning material.

Useful parts:

- Fixed incidents require commits, tests, durable rules, and recurrence detectors.
- Draft writing is explicit and limited to drafts.
- Canonical memory is not auto-written.

Gaps:

- Handover/canonical memory updates still rely on humans/agents remembering them.
- Duplicate output is verbose.
- Incident-to-roadmap linking is not yet first-class.

Recommended next:

- Add a reviewed memory-update proposal mode that writes a draft handover/canonical patch, not final memory.

## 14. Workorder Factory Assessment

What works:

- Generates valid WOs from structured plans.
- Rejects missing `source_refs`.
- Rejects outputs outside scope.
- Requires rollback hints for DB migration workorders.
- Rejects raw BLS as commit output.
- Produces batch dependency graph.
- Dry-run is read-only.

What still requires human/spec input:

- Free-form feature input to structured plan.
- Risk splitting across domains.
- Source chain choice for non-Nutrition projects.
- Product gate waiver decisions.

Risks:

- Generated WOs can be structurally valid while semantically weak if source refs are incomplete.
- Non-LumeOS projects need profile-specific source priority rules before factory output can be trusted.

## 15. Risk Register

| id | title | severity | affected layer | evidence | consequence | recommended fix | priority | effort |
|---|---|---|---|---|---|---|---|---|
| R-001 | Planned DGX/Spark hardware maintenance blocks runtime proof | high | runtime/model routing | Endpoint checks high=13, curl timeouts; Tom confirmed rack-install shutdown | Spark-dependent autonomous/operator work blocked during maintenance | Do not change routing; recheck endpoints after hardware returns | P0 | wait for maintenance, then 15m health check |
| R-002 | Runtime history lacks maintenance/freshness semantics | high | runtime history/UI/doctor | History says degraded from 2026-05-10, live check unavailable during planned maintenance | False confidence or false routing alarm | Add freshness and planned-maintenance status | P0 | 2-4h |
| R-003 | Product gate still closed | high | product gate/operator/promotion | Profile product_gate closed; maintenance blocks runtime proof | Product work unsafe | Keep closed until explicit Tom decision and post-maintenance runtime health | P0 | decision |
| R-004 | Codex config status string is contradictory | medium | Codex Worker config/docs | Booleans enabled; `dispatcher_integration` says deferred | Operator confusion | Normalize config field | P1 | <1h |
| R-005 | Senior review worker path naming is unclear | medium | Codex Worker/agent routing | `senior-reviewer-agent` Codex route, worker allowlist coding-agent only | Review WOs may choose wrong agent ID | Document or add gated reviewer path | P1 | 2-4h |
| R-006 | Project profiles not yet portable enough | medium | project profiles/UI/factory | UI hardcodes `lumeos.json`; Nutrition fixtures | Second project onboarding risky | Add project selector/fixtures/source-chain profile | P1 | 1-2d |
| R-007 | UI lacks visual regression | medium | Governance UI | Build/tests pass but no browser screenshots | Visual regressions missed | Add local browser smoke/screenshots | P1 | 0.5-1d |
| R-008 | Runtime reports are locally verbose | medium | Codex/reporting/security hygiene | Ignored reports contain prompts and command transcripts | Local leakage/noisy audits | Add retention/redaction/summarizer | P2 | 0.5d |
| R-009 | Promotion health check on main is noisy | medium | promotion governance/UI | `main` review returns high no-ahead | Confusing readiness checks | Add status/no-op mode | P2 | 1-2h |
| R-010 | Free-form spec to WO still model/manual | medium | workorder factory/source chain | Factory needs structured plan | Weak upstream specs can pass later validation | Add deterministic decomposition validator | P2 | 1-2d |
| R-011 | Memory updates still manual | low | learning/memory | Learning check passes but canonical updates are reviewed manually | Context drift possible | Add draft memory update proposal | P2 | 0.5-1d |
| R-012 | Old Nutrition docs remain active-looking | low | docs/runbooks | Historical run commands remain in docs | Operator confusion | Mark archival vs active | P3 | 0.5d |

## 16. Prioritized Roadmap

### P0

1. Add runtime maintenance/freshness semantics.
   - Why: planned hardware maintenance should not be misclassified as routing failure, and stale history should not imply current readiness.
   - Expected files: `model-runtime-check.ts`, runtime tests, UI runtime display.
   - Tests: model-runtime history tests, UI tests.
   - Effort: 2-4h.
   - Codex autonomous possible: yes, governance code only.

2. Post-maintenance runtime health proof.
   - Why: autonomous/night/large/product runs need fresh endpoint proof after DGX/Spark devices return.
   - Expected files: optional `docs/project/runtime/*` note; no routing changes unless health check proves config drift.
   - Tests: `model-runtime-check --check-endpoints --timeout-ms 5000 --json`.
   - Effort: 15m after hardware is back online.
   - Codex autonomous possible: no, depends on hardware state.

### P1

3. Normalize Codex Worker config and senior review policy.
   - Why: current config and role naming are confusing.
   - Expected files: `codex-worker.config.json`, dispatcher tests, docs.
   - Tests: dispatcher Codex worker tests, operator doctor tests.
   - Effort: 2-4h.
   - Codex autonomous possible: yes.

4. Add UI browser smoke/visual verification.
   - Why: UI can build while visually regressing.
   - Expected files: UI test harness/docs.
   - Tests: local browser smoke over `/governance/*`.
   - Effort: 0.5-1d.
   - Codex autonomous possible: yes.

5. Deepen project profile portability.
   - Why: Beauty Club cannot be attached safely yet.
   - Expected files: profile loader/UI/factory/source-chain tests.
   - Tests: second-project fixture tests.
   - Effort: 1-2d.
   - Codex autonomous possible: yes for code/docs, Tom needed for real repo policy.

### P2

6. Add deterministic decomposition-plan validator.
   - Why: factory is only as good as structured input.
   - Expected files: `system/workorders/cli` or `system/workorders/schemas`.
   - Tests: valid/invalid decomposition fixtures.
   - Effort: 1-2d.
   - Codex autonomous possible: yes.

7. Add report retention/redaction policy.
   - Why: ignored runtime reports are locally verbose.
   - Expected files: Codex Worker report summarizer/docs.
   - Tests: redaction tests.
   - Effort: 0.5d.
   - Codex autonomous possible: yes.

8. Add memory-update draft proposals.
   - Why: handover/canonical updates are still manual.
   - Expected files: `governance-learning-suggest.ts`, docs.
   - Tests: draft-only, no canonical write.
   - Effort: 0.5-1d.
   - Codex autonomous possible: yes.

### P3

9. Archive or label old Nutrition bootstrap docs.
   - Why: reduce operator confusion.
   - Expected files: docs only.
   - Tests: typecheck only.
   - Effort: 0.5d.
   - Codex autonomous possible: yes.

10. Add promotion `--status` mode.
    - Why: avoid noisy `main..main` high findings during health checks.
    - Expected files: `promotion-governance.ts`, tests, UI helper.
    - Tests: promotion tests.
    - Effort: 1-2h.
    - Codex autonomous possible: yes.

## 17. Do Not Do Yet

Do not do these until the stated conditions are met:

- Product work: only after Tom explicitly opens the product gate and post-maintenance runtime health is proven.
- BLS import: only after product gate opens and source-chain/product specs are explicitly approved.
- Supabase DB apply/push/reset/migration up: still forbidden in governance/operator paths.
- Night runs or broad autonomous execution: blocked during planned DGX/Spark hardware maintenance.
- Broad Codex Worker automation: keep restricted to controlled, scoped senior-agent governance workorders.
- Approval grants from UI or automation: not allowed.
- Manual edits to `runtime_state.json` or `queue.json`: not allowed.
- Committing runtime reports/history: not allowed.

## 18. Definition of Done for Full System

The governance system can be called "100 percent ready" only when all of the following are true:

1. Static checks are clean: invariant, agent contract, model runtime, learning, promotion.
2. Live required runtime endpoint checks are clean with fresh history.
3. Runtime history has freshness semantics and cannot mask current blocked status.
4. Product gate has an explicit Tom-approved open/waiver record for the exact product batch.
5. The selected product batch has source-chain validation, dossier, doctor output, and no pending approvals.
6. Supabase DB actions remain outside worker/operator automation unless separately approved by Tom.
7. Codex Worker is used only for scoped, approved senior-agent workorders.
8. UI has browser/visual smoke coverage for core governance pages.
9. A second project can be loaded from a profile fixture without copying governance core.
10. Every new STOP/FIX_REQUIRED/NEEDS_TOM_APPROVAL incident creates or updates a learning record or an explicit no-learning-needed decision.
11. Promotion governance can merge/push clean branches without runtime artifacts.
12. Handover and canonical memory reflect the current truth without overstating completion.
