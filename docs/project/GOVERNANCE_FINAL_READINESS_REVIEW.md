# Governance Final Readiness Review

Generated: 2026-05-11

Branch reviewed: `goal/governance-final-readiness-review`

## 1. Final State

FIX_REQUIRED

The integrated core governance stack is healthy on static/read-only checks, but the repository is not ready to call the recent hardening sequence fully integrated. Several required milestone branches exist in git history but are not present on this review branch or `main`, and required gates/files are missing.

This is not a DGX/Spark routing defect. Tom confirmed all DGX/Spark devices are offline for rack installation, so endpoint downtime is planned hardware maintenance and was not tested here.

## 2. Executive Conclusion

What is solid:

- TypeScript compile passes.
- Invariant checker is clean: critical=0, high=0, medium=0.
- Agent contract checker is clean: critical=0, high=0, medium=0.
- Static model runtime checker is clean without endpoint checks.
- Product gate remains closed.
- Learning checker and learning suggestion are clean.
- Promotion governance `--status` mode is present and avoids the noisy `main..main` high finding.
- Existing operator doctor, batch dossier, Codex worker, dispatcher Codex worker, workorder factory, project profile, promotion, and Governance UI helper tests pass.

What is fragile or missing:

- Recent hardening milestones are split across feature branches and are not integrated into this review branch/main.
- Governance UI browser smoke command is missing from this branch.
- Decomposition Plan Validator test/file is missing from this branch.
- Report Retention Summarizer test/file is missing from this branch.
- Memory Update Draft Proposal mode is missing from this branch.
- Codex Worker config still has contradictory status semantics: `codex_worker_enabled=true`, `allow_dispatcher_integration=true`, but `dispatcher_integration="deferred"`.
- Codex Worker allowlist still contains only `senior-coding-agent`; `senior-reviewer-agent` is not separately gated in the worker config.
- Project Profiles V2 second fixture is not active in this branch; only `example-beauty-club.json.example` and `lumeos.json` are present.
- Current handover/TODO content partially describes work that exists on other branches, not on this branch.

Product work should remain closed.

## 3. Checks Run

| Check/Test | Result | Findings | Severity | Action |
|---|---:|---|---|---|
| `cmd.exe /c node node_modules\typescript\bin\tsc --noEmit` | PASS | exit 0 | none | no action |
| `governance-invariant-check --json --project lumeos` | PASS | critical=0 high=0 medium=0 low=0 info=0 | none | no action |
| `agent-contract-check --json` | PASS | critical=0 high=0 medium=0 low=0 info=0 | none | no action |
| `model-runtime-check --json --project lumeos` | PASS | endpoint checks disabled; Spark routes not checked; Codex external routes OK | none | no endpoint checks during rack work |
| `governance-learning-check --json --project lumeos` | PASS | critical=0 high=0 medium=0 low=0 info=0 | none | no action |
| `governance-learning-suggest --json` | PASS | total_candidates=0, unrecorded_high_or_critical=0, duplicates=5 | none | no action |
| `promotion-governance --status --json --project lumeos` | WARN | high=0, info=1 `git.upstream_unknown` for review branch | info | set upstream only if needed |
| `project-profile-loader.test.ts` | PASS | 7/7 tests passed | none | no action |
| `decomposition-plan-validator.test.ts` | FAIL | file not found | high | integrate validator branch before readiness |
| `wo-factory.test.ts` | PASS | 11/11 tests passed | none | no action |
| `codex-worker.test.ts` | PASS | 16/16 tests passed | none | no action |
| `dispatcher-codex-worker.test.ts` | PASS | 8/8 tests passed | none | no action |
| `operator-doctor.test.ts` | PASS | 14/14 tests passed | none | no action |
| `batch-dossier.test.ts` | PASS | 11/11 tests passed | none | no action |
| `report-retention-summarizer.test.ts` | FAIL | file not found | high | integrate report retention branch before readiness |
| `governance-learning-suggest.test.ts` | PASS | 10/10 tests passed | none | no action |
| `governance-learning-check.test.ts` | PASS | 9/9 tests passed | none | no action |
| `promotion-governance.test.ts` | PASS | 19/19 tests passed | none | no action |
| `pnpm --dir apps\web typecheck` | PASS | exit 0 | none | no action |
| `pnpm --dir apps\web build` | PASS | Next build succeeded; 14 static pages generated | none | no action |
| `governance-ui.test.ts` | PASS | 26/26 tests passed | none | no action |
| `pnpm governance:ui:smoke` | FAIL | command not found | high | integrate UI smoke branch/script before readiness |

## 4. Gate Status

| Gate | Status | Evidence |
|---|---|---|
| Product work | CLOSED | profile product gate says blocked; no product work was run |
| Supabase/DB/migrations | BLOCKED | no Supabase or migration commands run; existing policy unchanged |
| Approval grants | BLOCKED | no approval command run; UI helper tests keep approval center display-only |
| Runtime state/queue manual edits | BLOCKED | no manual edits performed |
| Runtime reports/history commits | BLOCKED | no runtime artifacts committed |
| DGX/Spark endpoint status | PLANNED_MAINTENANCE | no endpoint checks run; offline state must not trigger routing fixes |
| Codex broad automation | BLOCKED | controlled dispatcher tests pass, but config status still needs normalization |
| Promotion health | AVAILABLE | `--status` mode exists and reports no high findings |

## 5. Recent Milestone Integration Review

| Milestone | Expected | Current Branch Evidence | Status |
|---|---|---|---|
| Runtime History V2 maintenance/freshness semantics | status categories and planned maintenance JSON | not confirmed in current `model-runtime-check --json`; TODO still open | FIX_REQUIRED |
| Codex Worker controlled_enabled + senior-reviewer gating | normalized status enum, reviewer allowlist | config still says `dispatcher_integration: "deferred"` and allowlist has only `senior-coding-agent` | FIX_REQUIRED |
| Governance UI browser smoke gate | script and Playwright smoke files | `pnpm governance:ui:smoke` command not found; smoke files absent | FIX_REQUIRED |
| Project Profiles V2 second fixture | validating fixture profile | only `example-beauty-club.json.example` and `lumeos.json` present | FIX_REQUIRED |
| Decomposition Plan Validator | validator/test present | test file missing | FIX_REQUIRED |
| Report Retention Summarizer | summarizer/test present | test file missing | FIX_REQUIRED |
| Memory Update Draft Proposal Mode | draft proposal CLI/tests | proposal mode file not present on branch | FIX_REQUIRED |
| Promotion `--status` Mode | status CLI/tests | present and passing | DONE |

Relevant branch-only commits found:

- `1a2ea9f` or equivalent runtime-history V2 work was not present on this branch.
- `a99eaaf` or equivalent Codex Worker config/reviewer policy work was not present on this branch.
- `c715f15` / `ea50148` UI browser smoke work exists on separate branches, not this branch.
- `62ca11a` project profile fixture work exists on separate branches, not this branch.
- `2eb477d` decomposition validator exists on a separate branch, not this branch.
- `10e2bb0` report retention summarizer exists on a separate branch, not this branch.
- `d9a99f0` memory update draft proposal work exists on a separate branch, not this branch.
- `a225e9e` promotion status mode is present on this branch.

## 6. Open TODO Classification

| TODO | Title | Classification | Readiness Impact |
|---|---|---|---|
| GOV-TODO-001 | Re-prove Spark A/B/C endpoint health after planned rack maintenance | POST_RACK | blocks night/large/autonomous runtime-dependent runs |
| GOV-TODO-002 | Add runtime history freshness and planned-maintenance semantics | FIX_REQUIRED | expected recent hardening not integrated here |
| GOV-TODO-003 | Normalize Codex Worker dispatcher integration config status | FIX_REQUIRED | config contradiction remains |
| GOV-TODO-004 | Clarify or implement senior-reviewer Codex Worker dispatch policy | FIX_REQUIRED | reviewer worker path not separately gated here |
| GOV-TODO-005 | Add Governance UI browser smoke and visual regression coverage | FIX_REQUIRED | smoke command missing here |
| GOV-TODO-006 | Deepen project profile portability with second-project fixture | FUTURE_MULTI_PROJECT / FIX_REQUIRED | fixture not integrated here |
| GOV-TODO-007 | Add deterministic decomposition-plan validator | FIX_REQUIRED | validator gate missing here |
| GOV-TODO-008 | Add ignored runtime report retention and redaction policy | FIX_REQUIRED | summarizer gate missing here |
| GOV-TODO-009 | Add promotion governance health/status mode | CLOSE_READY | present and passing |
| GOV-TODO-010 | Add draft memory update proposal workflow | OPTIONAL_AUTOMATION / FIX_REQUIRED | expected recent hardening not integrated here |
| GOV-TODO-011 | Mark old Nutrition bootstrap docs as archival or active | DOCS_CLEANUP | not blocking governance validation |

## 7. Remaining Blockers

High:

- Hardening branches are not merged into a single current branch/main. The system cannot be considered final-ready until these branches are integrated or explicitly abandoned.
- Browser smoke gate is missing.
- Decomposition Plan Validator is missing.
- Report Retention Summarizer is missing.
- Codex Worker config semantics are contradictory and reviewer-worker gating is absent on this branch.

Post-rack:

- Re-run DGX/Spark endpoint checks only after rack installation is complete. Do not route-fix based on planned hardware downtime.

## 8. What Is Safe Now

- Read-only governance checks.
- Operator status/doctor/dossier read-only flows.
- Promotion health status.
- Docs-only governance work.
- Codex Worker controlled governance path only within existing gates and only where current config permits.
- UI build and helper-level validation.

## 9. What Remains Forbidden

- Product work.
- BLS import.
- Nutrition feature batches.
- Supabase `db push`, `db reset`, migration execution, or production DB changes.
- Approval grants.
- Manual edits to `system/state/runtime_state.json`.
- Manual edits to `system/approval/queue.json`.
- Runtime report/history commits.
- DGX/Spark endpoint checks during planned rack installation.
- Broad Codex automation.
- Canonical memory writes without review.

## 10. Exact Next Action After Rack Work

Run read-only runtime endpoint validation and record fresh history only after Tom confirms DGX/Spark hardware is back online:

```powershell
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\control-plane\model-runtime-check.ts --check-endpoints --timeout-ms 5000 --record-history --json --project lumeos
```

## 11. Exact Next Action Before Any Product Gate Opening

Integrate or deliberately close out the missing hardening branches, then rerun this final readiness matrix without endpoint checks while rack maintenance is active.

