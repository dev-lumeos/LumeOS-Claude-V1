# Incident: Operator DONE Ambiguity

## Metadata

- incident_id: GOV-20260505-003
- date: 2026-05-05
- layer: operator_cli
- severity: high
- status: fixed
- product_work_blocked: yes
- autonomous_operator_blocked: yes

## Summary

The operator reported `DONE` after runtime blockers were cleaned, but it was initially unclear whether all batch workorder outputs actually existed. This could have let product work continue with missing outputs.

## Root Cause

The first operator end-state model emphasized active blockers and cleanup state. Output completion had to become a first-class condition for `DONE`.

## Trigger

- command: `run-batch-operator.ts <batch> --status`
- workorder: Nutrition Batch 001 workorders
- run_id:
- approval_id:
- stop_rule:

## Fix

- commit: `c1c1a2e feat(governance): add batch operator CLI`
- commit: follow-up operator tests and runbook updates on `goal/governance-operator-loop`
- files:
  - `system/workorders/cli/batch-operator.ts`
  - `system/workorders/cli/run-batch-operator.ts`
  - `system/workorders/cli/__tests__/batch-operator.test.ts`
  - `docs/project/GOVERNANCE_OPERATOR_RUNBOOK.md`
- behavior changed: operator `DONE` now requires no active batch workorders and every expected output inferred from the batch workorders to exist.

## Regression Test

- test_file: `system/workorders/cli/__tests__/batch-operator.test.ts`
- test_name: `does not treat missing expected workorder outputs as DONE`
- test_name: `reports DONE only when every expected output exists`
- command: `cmd.exe /c node node_modules\tsx\dist\cli.mjs --test system\workorders\cli\__tests__\batch-operator.test.ts`

## Durable Rule

- rule_file: `docs/project/GOVERNANCE_OPERATOR_RUNBOOK.md`
- rule_text: `DONE` means no active batch workorders remain and every expected output inferred from the batch WOs exists.

## Memory Update

- handover_updated: yes
- canonical_memory_updated: yes
- agent_contract_updated: no
- workorder_template_updated: no

## Recurrence Detector

The operator output-completion check is the current detector. Governance Batch 006 should include the same output classification in unified batch dossiers.

## Follow-up

Implement Governance Batch 006 - Reporting & Dossier Hardening.

