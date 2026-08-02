# Incident: Invalid JSON Stop Rule Historical Retrigger

## Metadata

- incident_id: GOV-20260505-007
- date: 2026-05-05
- layer: stop_rules
- severity: medium
- status: fixed
- product_work_blocked: no
- autonomous_operator_blocked: yes

## Summary

The invalid_json stop rule could retrigger from historical metrics rather than only new incidents after acknowledgement. This blocked operator continuation even when the operator was dealing with already-known historical failures.

## Root Cause

Stop-rule evaluation did not consistently apply an acknowledgement baseline for invalid_json samples.

## Trigger

- command: `system/control-plane/stop-rules.ts --dry-run`
- workorder:
- run_id:
- approval_id:
- stop_rule: `INVALID_JSON_SPIKE`

## Fix

- commit: `1f796f5 fix(governance): add invalid-json stop rule baseline`
- files:
  - `system/control-plane/stop-rules.ts`
  - `system/state/state-manager.ts`
  - stop-rule tests
- behavior changed: invalid_json metrics before the baseline acknowledgement are ignored for retrigger decisions.

## Regression Test

- test_file: `system/control-plane/__tests__/stop-rules.test.ts`
- test_file: `system/state/__tests__/stop-rules.test.ts`
- test_name: invalid_json baseline acknowledgement coverage
- command: `cmd.exe /c node node_modules\tsx\dist\cli.mjs --test system\control-plane\__tests__\stop-rules.test.ts`

## Durable Rule

- rule_file: `docs/project/GOVERNANCE_SYSTEM_COMPLETION_PLAN.md`
- rule_text: Stop-rule triggers must be converted into baseline/acknowledge policies and learning records.

## Memory Update

- handover_updated: yes
- canonical_memory_updated: no
- agent_contract_updated: no
- workorder_template_updated: no

## Recurrence Detector

The stop-rule baseline logic is the detector. Governance Batch 003 should add a read-only checker that reports missing or stale baselines.

## Follow-up

Add stop-rule baseline status to Governance Batch 003 invariant checker.

