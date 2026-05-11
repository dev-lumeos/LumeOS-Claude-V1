# Current Governance Handover

## Status

Current date: 2026-05-10.

`main` is pushed through Runtime Monitoring History and DGX4 productive routing removal. The active branch is implementing Operator Autonomy / Dossier / Learning V2 hardening.

## Current Truth

- Governance Batch Operator exists and is the preferred way to run workorder batches.
- Operator modes:
  - `--status`
  - `--dry-run`
  - `--continue`
  - `--continue --apply-safe-cleanups`
- Nutrition Batch 001 reached operator `DONE`.
- Nutrition P1-004 schema verification reached `DONE` and is pushed to `origin/main`.
- Governance Gap Analysis Plan is pushed to `origin/main`.
- Governance Batch 002 created durable memory and learning records.
- Governance Batch 003 added a read-only invariant checker.
- Governance runtime drift cleanup made the invariant checker report zero critical/high findings.
- Governance Batch 004 adds a read-only Agent & Skill Contract Checker.
- Governance Batch 005 adds a read-only Spec Source Chain Checker and Workorder Source Chain Standard.
- Governance Batch 006 adds a read-only Batch Dossier Reporter and operator dossier suggestions.
- Governance Batch 007 adds a deterministic Promotion / Merge Governance CLI. It also has a `--status` health mode for current-branch promotion readiness without treating `main..main` as a failed feature-branch review.
- Governance Batch 008 adds read-only Operator Doctor mode.
- Workorder Factory / Decomposition Automation adds a deterministic structured-plan to workorder/batch CLI. A decomposition-plan validator now blocks unsafe or underspecified structured plans before factory output generation.
- Memory/Learning Automation adds a read-only governance learning checker.
- Memory/Learning V2 adds read-only incident suggestion from dossier, autonomy, audit, pipeline metrics, runtime history, and Codex Worker outputs. Draft writing is explicit and limited to `docs/project/governance-learning/drafts/`.
- Memory Update Draft Proposals add reviewed, draft-only suggestions for handover/canonical memory updates. They write only under `docs/project/governance-learning/memory-update-drafts/` with explicit `--write-drafts` and never write canonical or external memory.
- Spark Runtime / Model Runtime Hardening adds a read-only model-runtime checker and dispatcher timeout/retry policy.
- Runtime Monitoring History adds explicit ignored local history for model/Spark/Codex endpoint checks, latency, timeouts, and route readiness trends.
- Runtime history readiness is normalized against current active productive routes and now includes V2 freshness/status fields: `overall_status`, `freshness_status`, `last_checked_at`, `age_minutes`, `blocking_impact`, and `next_required_action`. Stale history returns `STALE_HISTORY` and must not be used as proof of current readiness.
- Report Retention / Redaction Policy adds a read-only metadata summarizer for ignored local Codex/runtime/browser-smoke artifacts. It does not dump prompt/transcript bodies, does not delete files, and does not write canonical memory.
- Deep analysis on 2026-05-11 found static governance checks clean. Live required Spark A/B/C endpoint checks timed out at both 1500 ms and 5000 ms because all DGX/Spark devices are intentionally powered down for rack installation (`planned_hardware_maintenance`). Do not treat this as a routing defect or perform Spark routing fixes. Codex external routes remain config-healthy and MealCam remains optional/info-only. Night, large, and autonomous runs remain blocked until post-maintenance endpoint health is re-proven.
- Planned DGX/Spark maintenance is recorded in `system/control-plane/runtime-maintenance.json`; model runtime checks classify affected endpoint downtime as `PLANNED_MAINTENANCE` and require a recheck after maintenance ends.
- Model Runtime Routing Cleanup marks MealCam/Vision runtime optional/on-demand and resolves reviewer route registry drift.
- Codex/GPT-5.5 is the productive senior engineering and repo-aware review runtime for `senior-coding-agent`, `senior-reviewer-agent`, and final escalations.
- Codex Worker Bridge adds a dry-run-first `codex exec` integration point for controlled senior agents.
- Governance Batch 010 adds the dispatcher/operator/dossier integration point for Codex Worker.
- Codex Worker dispatch status is `controlled_enabled` for `senior-coding-agent` and `senior-reviewer-agent` only. It still requires explicit `codex_worker: true`, `runtime_type: codex-cli`, complete metadata, narrow scope, blocked files, expected outputs, source refs, no approval-grant/DB/Supabase/migration work, and product-gate policy pass.
- Governance UI V1 adds a local operator console around the existing governance CLIs.
- Governance UI V2 adds a lightweight workorder dependency board, structured dossier timeline, improved doctor/approval/runtime summaries, copyable next-action commands, and collapsible raw output.
- Governance UI browser smoke is available through `cmd.exe /c pnpm governance:ui:smoke`; it visits all `/governance` routes, checks the shell/content, and writes ignored screenshots under `tmp/governance-ui-browser-smoke/` without DGX/Spark endpoint checks.
- Project Profiles add the reusable project configuration layer for governance paths, forbidden artifacts, raw local data, product-gate policy, operator/doctor context, Codex Worker prompt safety, and profile-aware command defaults. The active default profile is `lumeos`.
- Project Profiles V2 adds an inactive `fixture-beauty-club` profile, schema-backed `profile_kind` / `active` metadata, profile path traversal rejection, read-only UI snapshot selected-profile loading, and non-Nutrition source-chain fixture coverage. This does not activate real Beauty Club product work or assume a real Beauty Club repo path.
- Operator Autonomy V2 adds a stable `autonomy_handoff` object to operator/doctor/dossier JSON and report output. It includes final state, blocker type, dossier command, learning suggestion, cleanup dry-run when safe, Codex Worker eligibility, product-gate status, forbidden actions, and one exact next action.
- Product work remains closed unless Tom explicitly opens it.
- Raw BLS files are local-only and ignored.
- Supabase `db push`, `db reset`, production DB commands, and migration execution remain forbidden unless Tom explicitly runs them outside the worker/operator flow.

## Read First

Use these files before starting more governance or product work:

- `docs/project/GOVERNANCE_SYSTEM_COMPLETION_PLAN.md`
- `docs/project/CURRENT_GOVERNANCE_HANDOVER.md`
- `docs/project/governance-learning/README.md`
- `docs/project/governance-learning/INCIDENT_LEARNING_SCHEMA.md`
- `docs/project/GOVERNANCE_OPERATOR_RUNBOOK.md`
- `docs/project/PRODUCT_WORK_GATE.md`
- `docs/project/WORKORDER_FACTORY_AUTOMATION.md`
- `docs/project/MODEL_RUNTIME_HARDENING.md`
- `docs/project/CODEX_WORKER_BRIDGE.md`
- `docs/project/PROJECT_PROFILES.md`
- `docs/project/GOVERNANCE_UI_V1.md`
- `docs/project/GOVERNANCE_UI_V2.md`
- `docs/project/GOVERNANCE_UI_USAGE_GUIDE.md`
- `docs/project/governance-learning/CURRENT_LEARNING_STATUS.md`
- `AGENTS.md`
- `CLAUDE.md`
- `system/memory/canonical/lumeos_canonical.md`

The completion plan is the current truth for remaining governance gaps. Canonical memory contains only compact truths and must not replace the completion plan or incident records.

## Current Product Work Gate

Product work is not freely open and is currently closed unless Tom explicitly opens it.

Allowed only after Tom explicitly opens the appropriate gate:

- Planning-only product work.
- BLS import planning and preflight.
- Local read-only raw file inspection.
- Generation of reports and spec-linked workorders.
- Static validation.
- Governance checker runs.
- Governance Operator dry-run.
- Governance Operator continue only if no database execution, migration execution, or real bulk import occurs.

Forbidden:

- `supabase db push`
- `supabase db reset`
- Production database changes.
- Migration execution.
- Real BLS bulk import execution.
- Committing raw BLS files.
- Invented BLS, food, nutrient, or category values.
- Bypassing the Governance Operator or checkers.
- Auto-granting approvals.
- Autonomous, night, or large product runs.

Reason:

- Runtime invariant checking is available through `system/control-plane/governance-invariant-check.ts`.
- Agent and skill contract checking is available through `system/control-plane/agent-contract-check.ts`.
- Spec source-chain checking is available through `system/workorders/cli/spec-source-chain-check.ts`.
- Governance learning checking is available through `system/reports/governance-learning-check.ts`.
- Batch dossier reporting is available through `system/reports/batch-dossier.ts`.
- Learning suggestions are available through `system/reports/governance-learning-suggest.ts`; it is read-only unless explicitly called with `--write-drafts`, which writes review drafts only under `docs/project/governance-learning/drafts/`.
- Memory update proposals are available through `system/reports/governance-learning-suggest.ts --memory-proposals`; it is read-only unless explicitly called with `--write-drafts`, which writes review drafts only under `docs/project/governance-learning/memory-update-drafts/`.
- Report retention summaries are available through `system/reports/report-retention-summarizer.ts`; it is read-only and reports metadata only for ignored local artifacts.
- Promotion governance is available through `system/control-plane/promotion-governance.ts`; use `--status` for health/no-op status and `--review-branch <branch>` for strict feature-branch promotion review.
- Operator Doctor is available through `system/workorders/cli/run-batch-operator.ts <batch-file> --doctor`.
- Operator, Doctor, and Dossier outputs expose `autonomy_handoff` so STOP/FIX/approval states are self-explaining and tied to dossier/learning next steps.
- Model runtime checking is available through `system/control-plane/model-runtime-check.ts`.
- Runtime history can be recorded explicitly with `system/control-plane/model-runtime-check.ts --check-endpoints --record-history --json --project lumeos`; generated files under `system/reports/model-runtime-history/` are ignored runtime artifacts.
- Runtime history summaries separate current readiness from historical failures. Active required routes with latest `ok` or `external_ok` status are not blocked by stale removed/lab route records or older failures for the same route.
- Current invariant checker result after cleanup: `critical=0`, `high=0`, `medium=0`.
- Static model-runtime checker result after hardening: `critical=0`, `high=0`; endpoint health must still be proven for autonomous, night, or large product runs.
- Spark D / DGX4 endpoint diagnosis is documented in `docs/project/runtime/SPARK_D_RUNTIME_DIAGNOSIS.md`; DGX4 is reachable but port `8001` is not accepting HTTP connections, so it has been removed from productive governance routing and reserved for future DGX4/DGX5 lab work.
- `senior-reviewer-agent` now uses Codex CLI / GPT-5.5 and is config/manual checked, not HTTP endpoint checked.
- `senior-coding-agent` uses Codex CLI / GPT-5.5 and is config/manual checked, not HTTP endpoint checked.
- `system/workers/codex-worker.ts` can generate and execute constrained `codex exec` prompts.
- Controlled dispatcher use requires `status=controlled_enabled`, `codex_worker_enabled=true`, `allow_dispatcher_integration=true`, `senior-coding-agent` or `senior-reviewer-agent`, `runtime_type: codex-cli`, workorder `codex_worker: true`, complete source/scope/output metadata, no approval requirement, no broad scope, no DB/Supabase/migration/approval-grant work, and product-gate policy pass.
- Project profile loading is available through `system/project-profiles/project-profile-loader.ts`; the LumeOS profile is `system/project-profiles/profiles/lumeos.json` and keeps product work closed by default.
- MealCam/Vision runtime is optional/on-demand and may be offline during normal governance work.
- Raw BLS files remain local-only and ignored.

## Model Runtime Hardening Output

- `system/control-plane/model-runtime-check.ts`
- `system/control-plane/__tests__/model-runtime-check.test.ts`
- `system/workers/codex-worker.ts`
- `system/workers/codex-worker.config.json`
- `docs/project/MODEL_RUNTIME_HARDENING.md`
- `docs/project/CODEX_WORKER_BRIDGE.md`
- `docs/project/governance-learning/2026-05-05-spark-runtime-hardening-summary.md`
- `docs/project/governance-learning/2026-05-05-codex-senior-runtime-integration.md`
- `docs/project/governance-learning/2026-05-09-codex-worker-bridge.md`

Run:

```powershell
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\control-plane\model-runtime-check.ts
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\control-plane\model-runtime-check.ts --json
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\control-plane\model-runtime-check.ts --check-endpoints --timeout-ms 1500
```

Rules:

- Default mode is read-only and does not call endpoints.
- `--check-endpoints` performs short `/v1/models` health checks only.
- No workorder prompts are sent by the checker.
- Dispatcher model calls now have bounded timeout and one retry for runtime failures.
- Operator Doctor includes model-runtime findings and still emits one safe next action.
- `mealcam-agent` is optional/on-demand. Its endpoint is only blocking when a MealCam/Vision workorder or explicit Tom request requires it.
- `senior-coding-agent` and `senior-reviewer-agent` are Codex CLI / GPT-5.5. They have no vLLM endpoint and should show as external/config-checked.
- Codex Worker Bridge is dry-run by default and uses non-interactive `codex exec` only with `--execute`.
- Generated Codex worker prompts/reports under `system/reports/codex-worker/` are runtime artifacts and should not be committed by default.
- Use `system/reports/report-retention-summarizer.ts --json` to inspect ignored Codex/runtime/browser-smoke artifact metadata without dumping prompt or transcript bodies.
- Operator Doctor reports Codex Worker as ready or disabled. Batch dossiers include Codex Worker report metadata when ignored runtime reports exist.

## Governance UI V1 Output

- `apps/web/src/app/governance/*`
- `apps/web/src/app/api/governance/*`
- `apps/web/src/components/governance/GovernanceConsole.tsx`
- `apps/web/src/lib/governance/*`
- `docs/project/GOVERNANCE_UI_V1.md`
- `docs/project/GOVERNANCE_UI_USAGE_GUIDE.md`
- `docs/project/governance-learning/2026-05-05-governance-ui-v1-summary.md`
- `docs/project/governance-learning/2026-05-05-governance-ui-v1-smoke-fixes-summary.md`

Run:

```powershell
cmd.exe /c pnpm --dir apps\web exec next dev -H 127.0.0.1 -p 5001
```

Open:

```text
http://127.0.0.1:5001/governance
```

Rules:

- UI commands go through a central allowlist.
- Read-only commands do not require confirmation.
- Controlled actions require typing `CONFIRM`.
- Approval grants are not executable in V1.
- Supabase reset/push, migration execution, production DB commands, runtime state edits, queue edits, and product batch execution are not exposed.
- Tailwind styling requires `apps/web/postcss.config.js`; if the page appears unstyled, verify PostCSS and `globals.css` first.
- The default batch path points to an existing governance batch, not missing Nutrition P1-005 product planning.
- Structured non-zero governance JSON is displayed as a governance finding, not an API transport failure.

## Project Profiles Output

- `system/project-profiles/project-profile-loader.ts`
- `system/project-profiles/project-profile.schema.json`
- `system/project-profiles/profiles/lumeos.json`
- `system/project-profiles/profiles/fixture-beauty-club.json`
- `system/project-profiles/profiles/example-beauty-club.json.example`
- `docs/project/PROJECT_PROFILES.md`
- `docs/project/governance-learning/2026-05-10-project-profiles.md`

Profile-aware commands:

```powershell
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\control-plane\governance-invariant-check.ts --json --project lumeos
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\control-plane\promotion-governance.ts --status --json --project lumeos
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\control-plane\promotion-governance.ts --review-branch <branch> --json --project lumeos
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\reports\batch-dossier.ts --batch <batch-file> --json --project lumeos
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\workorders\cli\spec-source-chain-check.ts <workorder-file> --json --project lumeos
```

Rules:

- `lumeos` remains the default profile.
- The profile defines governance/spec/workorder/report/memory roots, raw local paths, ignored local paths, forbidden paths, forbidden commands, required checkers, product-gate policy, promotion policy, and Codex Worker policy.
- The batch operator, operator doctor, Codex Worker, batch dossier, learning checker, promotion governance, invariant checker, source-chain checker, and Governance UI are profile-aware for LumeOS defaults.
- Raw BLS files remain local-only through profile policy.
- The profile layer does not open product work and does not authorize Supabase reset, push, migration execution, approval grants, or production DB commands.
- Beauty Club exists only as an inactive fixture/example profile. No external project path is assumed and no Beauty Club product work is active.
- Spec-source-chain checking remains Nutrition-aware for LumeOS; a fully generic source-chain graph is future profile work.

## Workorder Factory Output

- `system/workorders/cli/wo-factory.ts`
- `system/workorders/cli/decomposition-plan-validator.ts`
- `system/workorders/cli/__tests__/wo-factory.test.ts`
- `system/workorders/cli/__tests__/decomposition-plan-validator.test.ts`
- `docs/project/WORKORDER_FACTORY_AUTOMATION.md`
- `docs/project/governance-learning/2026-05-05-workorder-factory-automation-summary.md`

Run:

```powershell
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\workorders\cli\wo-factory.ts --from-plan <plan-file> --out <output-dir> --dry-run
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\workorders\cli\wo-factory.ts --from-plan <plan-file> --out <output-dir> --write
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\workorders\cli\wo-factory.ts --validate <workorder-or-batch>
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\workorders\cli\decomposition-plan-validator.ts --plan <plan-file> --project lumeos --json
```

Rules:

- Factory input is a Markdown file with a deterministic JSON plan block.
- Decomposition plans must include stable plan/project identity, objective, source_refs, constraints, non_goals, scoped subtasks, expected outputs, and acceptance criteria.
- The validator is profile-aware and supports the inactive `fixture-beauty-club` profile for non-Nutrition fixture coverage only.
- Dry-run writes nothing.
- `--write` creates draft workorders and a batch only after high/critical factory findings are clear.
- Factory does not dispatch, grant approvals, run Supabase commands, execute migrations, or import BLS data.
- Generated batches must still pass source-chain, invariant, and agent-contract checks before operator execution.

## Memory/Learning Automation Output

- `system/reports/governance-learning-check.ts`
- `system/reports/__tests__/governance-learning-check.test.ts`
- `docs/project/governance-learning/CURRENT_LEARNING_STATUS.md`
- `docs/project/governance-learning/2026-05-05-memory-learning-automation-summary.md`

Run:

```powershell
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\reports\governance-learning-check.ts
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\reports\governance-learning-check.ts --json
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\reports\governance-learning-check.ts --write-summary
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\reports\governance-learning-suggest.ts --memory-proposals --json
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\reports\governance-learning-suggest.ts --memory-proposals --write-drafts
```

Rules:

- Default mode is read-only.
- `--write-summary` writes only `docs/project/governance-learning/CURRENT_LEARNING_STATUS.md`.
- Memory update proposal mode is draft-only and requires Tom review before any handover/canonical memory update.
- The checker does not edit runtime state, approval state, audit history, or run history.
- It verifies incident metadata, fix commits, regression tests, durable rules, recurrence detectors, handover state, canonical memory, and product-gate wording.

## Safe Next Governance Batch

Run the next controlled planning/probe batch only after Tom confirms the required local model endpoint health, or continue with deeper observability work.

Goal:

- The conditional gate permits only planning/probe work, not import execution.
- Endpoint health still blocks autonomous, night, and large product runs until proven for the required model routes.

## Do Not Do

- Do not start real Nutrition P1-005 BLS import execution.
- Do not grant approvals automatically.
- Do not run Supabase `db push` or `db reset`.
- Do not execute migrations.
- Do not edit `system/state/runtime_state.json` or `system/approval/queue.json` manually.
- Do not commit runtime artifacts.
- Do not use raw BLS files as primary schema source when a current spec exists.
- Do not start product work outside the conditional planning/probe gate.

## Incident Records Created In Governance Batch 002

- `docs/project/governance-learning/2026-05-05-approval-token-runtime-split-brain.md`
- `docs/project/governance-learning/2026-05-05-example-migration-path-leak.md`
- `docs/project/governance-learning/2026-05-05-operator-done-ambiguity.md`
- `docs/project/governance-learning/2026-05-05-selected-agent-mismatch.md`
- `docs/project/governance-learning/2026-05-05-executable-rollback-sql.md`
- `docs/project/governance-learning/2026-05-05-read-only-spec-approval-misclassification.md`
- `docs/project/governance-learning/2026-05-05-invalid-json-stop-rule-retrigger.md`
- `docs/project/governance-learning/2026-05-05-scope-trailing-slash-mismatch.md`

## Governance Batch 003 Output

- `system/control-plane/governance-invariant-check.ts`
- `system/control-plane/__tests__/governance-invariant-check.test.ts`
- `docs/project/governance-learning/2026-05-05-governance-batch-003-summary.md`

Run:

```powershell
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\control-plane\governance-invariant-check.ts
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\control-plane\governance-invariant-check.ts --json
```

## Governance Batch 004 Output

- `system/control-plane/agent-contract-check.ts`
- `system/control-plane/__tests__/agent-contract-check.test.ts`
- `docs/project/governance-learning/2026-05-05-governance-batch-004-summary.md`

Run:

```powershell
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\control-plane\agent-contract-check.ts
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\control-plane\agent-contract-check.ts --json
```

## Governance Batch 005 Output

- `system/workorders/cli/spec-source-chain-check.ts`
- `system/workorders/cli/__tests__/spec-source-chain-check.test.ts`
- `docs/project/WORKORDER_SOURCE_CHAIN_STANDARD.md`
- `docs/project/governance-learning/2026-05-05-governance-batch-005-summary.md`

Run:

```powershell
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\workorders\cli\spec-source-chain-check.ts <workorder-file>
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\workorders\cli\spec-source-chain-check.ts <workorder-file> --json
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\workorders\cli\spec-source-chain-check.ts --batch <batch-file>
```

## Governance Batch 006 Output

- `system/reports/batch-dossier.ts`
- `system/reports/__tests__/batch-dossier.test.ts`
- `docs/project/governance-learning/2026-05-05-governance-batch-006-summary.md`

Run:

```powershell
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\reports\batch-dossier.ts --batch <batch-file>
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\reports\batch-dossier.ts --batch <batch-file> --json
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\reports\batch-dossier.ts --batch <batch-file> --write
```

Rules:

- Without `--write`, the dossier prints only and must not dirty the repo.
- With `--write`, Markdown and JSON reports are written under `system/reports/batches/`.
- The Governance Operator suggests the dossier command when it reaches a safe stop.

## Governance Batch 007 Output

- `system/control-plane/promotion-governance.ts`
- `system/control-plane/__tests__/promotion-governance.test.ts`
- `docs/project/governance-learning/2026-05-05-governance-batch-007-summary.md`

Run:

```powershell
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\control-plane\promotion-governance.ts --status
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\control-plane\promotion-governance.ts --status --json
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\control-plane\promotion-governance.ts --review-branch <branch>
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\control-plane\promotion-governance.ts --review-branch <branch> --json
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\control-plane\promotion-governance.ts --merge-branch <branch>
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\control-plane\promotion-governance.ts --push-main
```

Rules:

- Review classifies changed files, forbidden artifacts, product-gate impact, and required checks.
- Status mode reports current branch health and upstream status. On `main`, it does not treat `main..main` no-op state as a high `branch_not_ahead` finding.
- Strict review mode still reports `git.branch_not_ahead` as high when a real promotion target has no commits ahead of `main`.
- Merge runs review first and refuses unless the decision is `MERGE_READY`.
- Merge checks out `main`, merges the target branch, stops on conflicts, and runs typecheck.
- Push requires `main`, clean worktree, and `main` ahead of `origin/main`.
- Push is explicit; merge does not push automatically.

## Governance Batch 008 Output

- `system/workorders/cli/operator-doctor.ts`
- `system/workorders/cli/__tests__/operator-doctor.test.ts`
- `docs/project/governance-learning/2026-05-05-governance-batch-008-summary.md`

Run:

```powershell
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\workorders\cli\run-batch-operator.ts <batch-file> --doctor
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\workorders\cli\run-batch-operator.ts <batch-file> --doctor --json
```

Rules:

- Doctor is read-only.
- Doctor does not dispatch, grant approvals, apply cleanup, run Supabase commands, or execute migrations.
- Doctor returns one diagnosis and exactly one next action.
- Normal operator reports include a doctor command for safe-stop diagnosis.

## Recent Incidents To Remember

- No-tool success left active workorders open.
- Scheduler collapsed blocked/awaiting approval into failed.
- Approval queue, runtime approval item, and token state diverged.
- Granted approvals were not redispatchable until token logic was fixed.
- Historical failed run and invalid JSON stop rules retriggered.
- db-migration-agent output contract conflicted with dispatcher expectations.
- Qwen returned thinking/prose instead of JSON until API options were fixed.
- Directory scope trailing slash mismatch caused false violations.
- Executable rollback/DOWN SQL had to be blocked.
- selected_agent mismatch could bypass correct gates.
- Example migration path leaked into real tool request.
- Approval deny did not sync runtime mirror.
- Read-only spec access incorrectly required migration approval.
- Operator `DONE` initially meant "no blockers" rather than "outputs complete".
- Spec source-chain enforcement now exists as a checker; target product work still must pass it before BLS import.
- Batch-loader dispatcher dependency injection once omitted `callModel`; `runDispatch()` now has direct regression coverage for passing `defaultCallModel` and `defaultExecuteTool`.
