# Incident: Read-Only Spec Approval Misclassification

## Metadata

- incident_id: GOV-20260505-006
- date: 2026-05-05
- layer: approval_lifecycle
- severity: medium
- status: fixed
- product_work_blocked: no
- autonomous_operator_blocked: yes

## Summary

A read-only spec access was treated as a db-migration human approval. That created an unnecessary Tom approval stop even though the operation was only context reading.

## Root Cause

The approval gate logic treated db-migration-agent activity too broadly. Human approval must be required for writes and sensitive operations, not harmless read-only context access.

## Trigger

- command: Governance Operator approval stop
- workorder: `WO-nutrition-003`
- run_id: `RUN-20260504-1928`
- approval_id: `APP-20260504-721838`
- stop_rule:

## Fix

- commit: `e6eb876 fix(approval): allow read-only context without human gate`
- files:
  - `system/control-plane/dispatcher.ts`
  - approval/dispatcher tests
- behavior changed: read-only context access does not require human migration approval.

## Regression Test

- test_file: `system/control-plane/__tests__/dispatcher-fail-cleanup.test.ts`
- test_name: read-only context access without human approval coverage
- command: `cmd.exe /c node node_modules\tsx\dist\cli.mjs --test system\control-plane\__tests__\dispatcher-fail-cleanup.test.ts`

## Durable Rule

- rule_file: `docs/project/GOVERNANCE_SYSTEM_COMPLETION_PLAN.md`
- rule_text: Read-only context access must not require a db-migration human gate.

## Memory Update

- handover_updated: yes
- canonical_memory_updated: no
- agent_contract_updated: no
- workorder_template_updated: no

## Recurrence Detector

Governance Batch 003 should include approval-operation invariant checks, and Batch 004 should verify db-migration-agent read/write approval contract wording.

## Follow-up

Implement approval-operation checks in Governance Batch 003.

