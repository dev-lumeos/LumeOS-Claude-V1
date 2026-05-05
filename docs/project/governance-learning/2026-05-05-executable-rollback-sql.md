# Incident: Executable Rollback SQL

## Metadata

- incident_id: GOV-20260505-005
- date: 2026-05-05
- layer: migration_guard
- severity: high
- status: fixed
- product_work_blocked: yes
- autonomous_operator_blocked: yes

## Summary

Migration content could include executable DOWN/rollback statements. This is unsafe in the worker-generated migration path because rollback notes are allowed as documentation, but executable destructive rollback SQL must not be written into migrations without explicit review.

## Root Cause

The migration guard did not sufficiently distinguish commented rollback notes from executable SQL after DOWN/ROLLBACK markers.

## Trigger

- command: db-migration-agent migration write guard
- workorder: Nutrition migration workorders
- run_id:
- approval_id:
- stop_rule:

## Fix

- commit: `9f8b847 fix(governance): block destructive rollback SQL in migrations`
- commit: `6fe8322 fix(governance): allow commented rollback headers`
- files:
  - `system/agent-registry/authorize-tool-call.ts`
  - `system/agent-registry/__tests__/gateway.test.ts`
- behavior changed: executable SQL after rollback/DOWN sections is blocked, while comment-only rollback headers remain allowed.

## Regression Test

- test_file: `system/agent-registry/__tests__/gateway.test.ts`
- test_name: `blockiert ausführbares DROP SCHEMA nach DOWN-Sektion`
- test_name: `blockiert ausführbares REVOKE nach DOWN-Sektion`
- command: `cmd.exe /c node node_modules\tsx\dist\cli.mjs --test system\agent-registry\__tests__\gateway.test.ts`

## Durable Rule

- rule_file: `docs/project/GOVERNANCE_SYSTEM_COMPLETION_PLAN.md`
- rule_text: Rollback/DOWN sections in migrations must not be executable.

## Memory Update

- handover_updated: yes
- canonical_memory_updated: yes
- agent_contract_updated: no
- workorder_template_updated: no

## Recurrence Detector

The migration guard is the direct detector. Governance Batch 004 should also check agent and workorder templates so they ask for rollback notes without encouraging executable DOWN blocks.

## Follow-up

Implement Governance Batch 004 template/agent contract validation for migration rollback wording.

