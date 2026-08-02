# Incident: Dispatcher callModel dependency injection failure

## Metadata

- incident_id: GOV-20260510-001
- date: 2026-05-10
- layer: dispatcher_failed
- severity: high
- status: fixed
- product_work_blocked: yes
- autonomous_operator_blocked: yes

## Summary

The Memory/Learning V2 suggestion tool found an unrecorded historical `DISPATCHER_FAILED` candidate in `system/state/audit.jsonl`. The failed run was `RUN-20260502-3657` for `WO-nutrition-001` with `docs-agent`, and the recorded reason was `deps.callModel is not a function`. This blocked operator autonomy because dispatcher execution failed before normal governance outcome handling could complete.

## Root Cause

`system/workorders/cli/batch-loader.ts` called `dispatchWorkorder()` with a partial dependency object that provided `executeTool` but omitted `callModel`. Because `dispatchWorkorder()` received an explicit dependency object, it did not fall back to its default dependency object for missing fields, and the dispatcher later called `deps.callModel(...)` on an undefined value.

## Trigger

- command: governance dispatcher/operator execution recorded in `system/state/audit.jsonl`
- workorder: WO-nutrition-001
- run_id: RUN-20260502-3657
- approval_id:
- stop_rule:

Evidence:

```json
{"ts":"2026-05-02T07:20:33.703Z","severity":"error","event":"job_failed","run_id":"RUN-20260502-3657","workorder_id":"WO-nutrition-001","agent_id":"docs-agent","orchestration_mode":"claude_code","reason":"deps.callModel is not a function","error_code":"DISPATCHER_ERROR"}
```

## Fix

- commit: 90403043f937ffdbb52c36c1af2aa5a5e845b5a1 fix(workorders): provide callModel dependency in batch loader
- files:
  - `system/workorders/cli/batch-loader.ts`
- behavior changed: `batch-loader.ts` now imports `defaultCallModel` and passes both `callModel: defaultCallModel` and `executeTool: defaultExecuteTool` into `dispatchWorkorder()`.

## Regression Test

- test_file: system/workorders/cli/__tests__/batch-loader.test.ts
- test_name: runDispatch passes callModel and executeTool to dispatcher dependencies
- command: cmd.exe /c node node_modules\tsx\dist\cli.mjs --test system\workorders\cli\__tests__\batch-loader.test.ts

## Durable Rule

- rule_file: docs/project/GOVERNANCE_SYSTEM_COMPLETION_PLAN.md
- rule_text: Dispatcher dependencies must be complete at each explicit injection boundary. A partial dispatcher dependency object must not omit required runtime functions such as `callModel`, and this boundary must be covered by a regression test.

## Memory Update

- handover_updated: yes
- canonical_memory_updated: no
- agent_contract_updated: no
- workorder_template_updated: no

## Recurrence Detector

`system/reports/governance-learning-suggest.ts` detects `DISPATCHER_FAILED` candidates from audit output, and `system/workorders/cli/__tests__/batch-loader.test.ts` now verifies that `runDispatch()` provides a valid `callModel` dependency whenever it passes explicit dispatcher dependencies.

## Follow-up

none
