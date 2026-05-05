# Governance Batch 008 Summary - Operator Doctor / Autonomy Hardening

## Purpose

Make the Governance Operator self-diagnose common blockers and produce exactly one safe next action, so Tom does not have to manually stitch together operator status, runtime state, approvals, checkers, stop rules, and memory files.

## Files Created

- `system/workorders/cli/operator-doctor.ts`
- `system/workorders/cli/__tests__/operator-doctor.test.ts`

## Files Updated

- `system/workorders/cli/run-batch-operator.ts`
- `system/workorders/cli/batch-operator.ts`
- `system/workorders/cli/__tests__/batch-operator.test.ts`
- `docs/project/GOVERNANCE_OPERATOR_RUNBOOK.md`
- `docs/project/CURRENT_GOVERNANCE_HANDOVER.md`
- `docs/project/GOVERNANCE_SYSTEM_COMPLETION_PLAN.md`
- `system/memory/canonical/lumeos_canonical.md`

## Capabilities Added

- `--doctor` mode on the existing batch operator.
- `--doctor --json` machine-readable diagnosis.
- Read-only diagnosis for approvals, cleanup candidates, stop rules, invariant checker, agent-contract checker, spec-source-chain checker, dirty worktree, runtime artifacts, product gate, and memory/learning presence.
- Diagnosis categories include `CLEAN_READY`, `NEEDS_TOM_APPROVAL`, `NEEDS_SAFE_CLEANUP`, `STOP_RULE_BLOCKED`, `INVARIANT_BLOCKED`, `AGENT_CONTRACT_BLOCKED`, `SPEC_SOURCE_BLOCKED`, `DIRTY_WORKTREE`, `RUNTIME_ARTIFACTS_PRESENT`, `PRODUCT_GATE_BLOCKED`, `FIX_REQUIRED`, and `UNKNOWN`.
- Normal operator reports now include a doctor command next to the exact next command and dossier command.

## Safety

Doctor mode is read-only. It does not dispatch batches, apply cleanup, grant approvals, run Supabase commands, execute migrations, or edit runtime state.

## Product Work Gate

Product work remains blocked unless Tom explicitly opens or waives it.

## Tests

- Clean-ready diagnosis.
- Approval diagnosis without automatic grant.
- Safe cleanup diagnosis.
- Invariant, agent-contract, and spec-source-chain blockers.
- Dirty worktree blocker.
- Product gate blocker.
- Stable JSON shape.
- No mutation of supplied operator status.
- Exactly one final recommendation.

## Open Follow-Up

- Workorder Factory / Decomposition Automation.
- Memory/Learning Automation.
- Remaining reporting/promotion hardening as real usage exposes edge cases.
