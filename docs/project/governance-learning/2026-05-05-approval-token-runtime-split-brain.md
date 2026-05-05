# Incident: Approval Token Runtime Split-Brain

## Metadata

- incident_id: GOV-20260505-001
- date: 2026-05-05
- layer: approval_lifecycle
- severity: high
- status: fixed
- product_work_blocked: yes
- autonomous_operator_blocked: yes

## Summary

Approval queue items, runtime approval mirrors, and dispatcher enforcement tokens could diverge. The operator then saw contradictory approval state and Tom had to reason manually about whether cleanup or redispatch was safe.

## Root Cause

The approval lifecycle had multiple storage views with incomplete synchronization: queue grants did not always create dispatcher tokens, granted tokens were not always discoverable for redispatch, denied queue items did not update runtime approval mirrors, and cleanup logic did not consistently prioritize enforcement-token usability.

## Trigger

- command: `approval-cli grant`, `approval-cli deny`, operator `--continue --apply-safe-cleanups`
- workorder: `WO-nutrition-003`
- run_id: multiple Nutrition Batch 001 runs
- approval_id: multiple, including `APP-20260504-271771`
- stop_rule:

## Fix

- commit: `f8c2844 fix(approval): bridge queue grants to dispatcher tokens`
- commit: `8c86a12 fix(approval): allow granted approvals to resume dispatch`
- commit: `85edb4d fix(governance): clear expired approval workorders safely`
- commit: `a52ad2e fix(governance): use enforcement token for expired approval cleanup`
- commit: `15090ae fix(approval): sync denied queue approvals to runtime state`
- files:
  - `system/approval/approval-queue.ts`
  - `system/approval/approval-gate.ts`
  - `system/control-plane/terminal-wo-reset-cli.ts`
  - `system/state/state-manager.ts`
- behavior changed: approval decisions now synchronize queue/runtime/token state more consistently, and official cleanup refuses pending or usable approvals while allowing denied/expired/unusable approval blockers.

## Regression Test

- test_file: `system/approval/__tests__/approval-queue.test.ts`
- test_name: `grantApprovalForDispatch`, denied approval runtime sync tests, redispatch token lookup tests
- test_file: `system/control-plane/__tests__/terminal-wo-reset-cli.test.ts`
- test_name: `Expired Approval Cleanup - CLI clear-expired-approval`
- command: `cmd.exe /c node node_modules\tsx\dist\cli.mjs --test system\approval\__tests__\approval-queue.test.ts`

## Durable Rule

- rule_file: `docs/project/GOVERNANCE_SYSTEM_COMPLETION_PLAN.md`
- rule_text: Approval queue, runtime approval item, and enforcement token must stay synchronized; cleanup must refuse pending usable approvals and allow denied/expired/unusable approval blockers only through official cleanup paths.

## Memory Update

- handover_updated: yes
- canonical_memory_updated: yes
- agent_contract_updated: no
- workorder_template_updated: no

## Recurrence Detector

Governance Batch 003 must add a read-only invariant checker for approval queue/token/runtime divergence, stale awaiting_approval entries, and locks pointing to non-running runs.

## Follow-up

Implement Governance Batch 003 - Invariant Checker.

