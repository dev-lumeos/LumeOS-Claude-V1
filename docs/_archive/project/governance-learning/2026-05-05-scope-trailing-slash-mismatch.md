# Incident: Scope Trailing Slash Mismatch

## Metadata

- incident_id: GOV-20260505-008
- date: 2026-05-05
- layer: permission_gateway
- severity: medium
- status: fixed
- product_work_blocked: no
- autonomous_operator_blocked: yes

## Summary

Directory scopes with trailing slashes were not treated consistently as directory scopes. A valid file under an allowed directory could be rejected as out of scope.

## Root Cause

Path normalization and scope matching did not consistently interpret `scope_files` entries ending in `/` as allowing files underneath that directory.

## Trigger

- command: dispatcher post-execution scope enforcement / permission gateway
- workorder: Nutrition migration/type output workorders
- run_id:
- approval_id:
- stop_rule:

## Fix

- commit: `ca39e58 fix(governance): treat trailing slash scopes as directories`
- files:
  - `system/agent-registry/authorize-tool-call.ts`
  - `system/agent-registry/__tests__/gateway.test.ts`
- behavior changed: trailing slash scopes are treated as directory scopes consistently.

## Regression Test

- test_file: `system/agent-registry/__tests__/gateway.test.ts`
- test_name: `Directory-Scope mit trailing slash erlaubt Dateien darunter konsistent`
- command: `cmd.exe /c node node_modules\tsx\dist\cli.mjs --test system\agent-registry\__tests__\gateway.test.ts`

## Durable Rule

- rule_file: `docs/project/GOVERNANCE_SYSTEM_COMPLETION_PLAN.md`
- rule_text: Scope enforcement must treat explicit directory scopes consistently and reject only true out-of-scope paths.

## Memory Update

- handover_updated: yes
- canonical_memory_updated: no
- agent_contract_updated: no
- workorder_template_updated: no

## Recurrence Detector

The permission gateway test is the direct detector. Governance Batch 003 should add runtime/report checks for repeated `files_scope_violation` events.

## Follow-up

Add scope violation trend reporting to Governance Batch 003 or Batch 006.

