# Governance Batch 007 Summary - Promotion / Merge Governance

## Purpose

Make branch review, merge, push, and post-merge verification deterministic so Tom does not have to manually reconstruct merge safety from chat, git status, check outputs, and artifact policy.

## Files Created

- `system/control-plane/promotion-governance.ts`
- `system/control-plane/__tests__/promotion-governance.test.ts`

## Files Updated

- `docs/project/CURRENT_GOVERNANCE_HANDOVER.md`
- `docs/project/GOVERNANCE_SYSTEM_COMPLETION_PLAN.md`
- `system/memory/canonical/lumeos_canonical.md`

## Capabilities Added

- `--review-branch <branch>` reports merge readiness without mutating the repo.
- `--review-branch <branch> --json` emits machine-readable findings.
- `--merge-branch <branch>` runs review first, refuses non-ready branches, switches to `main`, merges, stops on conflicts, and runs typecheck.
- `--push-main` requires `main`, a clean worktree, and `main` ahead of `origin/main` before pushing.
- Changed files are grouped as code, docs, tests, workorders, migrations, project outputs, runtime artifacts, raw local data, and unknown.
- Runtime artifacts, raw BLS files, `.env` files, and product-work-gate violations are blocking findings.
- Migration diffs require migration guard review.
- Workorder diffs require spec-source-chain and dossier review.

## Product Work Gate

Product work remains blocked. Promotion governance detects product-work diffs and returns `NEEDS_TOM_WAIVER` when the gate is closed.

## Tests

- Promotion review ready state.
- Dirty worktree refusal.
- Runtime artifact refusal.
- Raw BLS refusal.
- Product gate waiver requirement.
- Migration guard requirement.
- Workorder source-chain requirement.
- Merge refusal when review is not ready.
- Push refusal outside `main`.
- Stable JSON shape and path classification.

## Open Follow-Up

- Governance Batch 008 - Operator Doctor / Autonomy Hardening.
- Workorder Factory / Decomposition Automation.
- Memory/Learning Automation.
