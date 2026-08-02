# Incident: Selected Agent Mismatch

## Metadata

- incident_id: GOV-20260505-004
- date: 2026-05-05
- layer: governance_validator
- severity: high
- status: fixed
- product_work_blocked: yes
- autonomous_operator_blocked: yes

## Summary

Model output selected an agent inconsistent with the workorder. In the observed class, a wrong selected agent could route the run through inappropriate DB-migration gates or bypass the intended governance path.

## Root Cause

The model-produced `OrchestratorIntent.selected_agent` was treated as part of runtime intent but had to be constrained by the workorder agent. Without an expected-agent check, model drift could change the gate set.

## Trigger

- command: dispatcher model/intent validation
- workorder: governance and Nutrition workorders
- run_id:
- approval_id:
- stop_rule:

## Fix

- commit: `ba91cf2 fix(governance): reject orchestrator agent mismatch`
- files:
  - `system/control-plane/governance-validator.ts`
  - `system/control-plane/dispatcher.ts`
  - related governance-validator tests
- behavior changed: validator rejects or rewrites selected_agent mismatch instead of accepting model-selected agent drift.

## Regression Test

- test_file: `system/control-plane/__tests__/governance-validator.test.ts`
- test_file: `system/control-plane/__tests__/db-migration-agent-contract.test.ts`
- test_name: selected_agent expected-agent mismatch coverage
- command: `cmd.exe /c node node_modules\tsx\dist\cli.mjs --test system\control-plane\__tests__\db-migration-agent-contract.test.ts`

## Durable Rule

- rule_file: `docs/project/GOVERNANCE_SYSTEM_COMPLETION_PLAN.md`
- rule_text: Model output cannot change the selected agent away from the workorder agent.

## Memory Update

- handover_updated: yes
- canonical_memory_updated: yes
- agent_contract_updated: no
- workorder_template_updated: no

## Recurrence Detector

Governance Batch 004 must add an agent-contract checker and routing-policy checker that confirms selected_agent cannot drift from the workorder agent.

## Follow-up

Implement Governance Batch 004 - Agent & Skill Contract Validation.

