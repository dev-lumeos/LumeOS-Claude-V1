# DRAFT - Incident: Dispatcher dependency injection failure

DRAFT - review before promoting to a final incident record.

## Metadata

- incident_id: GOV-20260510-DRAFT-DISPATCHER-FAILED
- date: 2026-05-10
- layer: dispatcher_failed
- severity: high
- status: open
- product_work_blocked: yes
- autonomous_operator_blocked: yes

## Summary

The Memory/Learning V2 suggestion tool found an unrecorded historical `DISPATCHER_FAILED` candidate in `system/state/audit.jsonl`. The failed run was `RUN-20260502-3657` for `WO-nutrition-001` with `docs-agent`, and the recorded reason was `deps.callModel is not a function`. This class can block operator autonomy because dispatcher execution failed before normal governance outcome handling could complete.

## Root Cause

The root cause was a batch-loader dependency injection bug. `system/workorders/cli/batch-loader.ts` called `dispatchWorkorder()` with a partial dependency object that provided `executeTool` but omitted `callModel`. Because `dispatchWorkorder()` received an explicit deps object, it did not fall back to its default dependency object for missing fields, and the dispatcher later called `deps.callModel(...)` on an undefined value.

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
  - `system/workorders/cli/batch-operator.ts`
  - `system/workorders/cli/batch-loader.ts`
- behavior changed: `batch-loader.ts` now imports `defaultCallModel` and passes both `callModel: defaultCallModel` and `executeTool: defaultExecuteTool` into `dispatchWorkorder()`.

## Regression Test

- test_file: not found
- test_name: not found
- command:

Related coverage exists for dispatcher `callModel` exception cleanup paths in `system/control-plane/__tests__/dispatcher-fail-cleanup.test.ts`, including `callModel Exception -> scope_lock released über catch-Pfad` and `WO-011: callModel Exception setzt run-id-spezifischen Eintrag auf failed (catch-Pfad)`. Those tests verify failure cleanup after a model-call exception, but they do not directly prove that `batch-loader.ts` always injects a valid `callModel` dependency.

This draft remains `status: open` because the exact fix commit is confirmed, but a direct regression test for the missing `callModel` dependency in `batch-loader.ts` was not found.

## Durable Rule

- rule_file: docs/project/GOVERNANCE_SYSTEM_COMPLETION_PLAN.md
- rule_text: Dispatcher dependencies must be validated at the execution boundary. A missing model-call function must fail with a classified governance/tooling error and must be covered by a regression test before product gates are opened.

## Memory Update

- handover_updated: no
- canonical_memory_updated: no
- agent_contract_updated: no
- workorder_template_updated: no

## Recurrence Detector

`system/reports/governance-learning-suggest.ts` now detects `DISPATCHER_FAILED` candidates from audit output. A promoted final incident should link a concrete batch-loader/operator regression test that prevents `deps.callModel is not a function` from recurring.

## Follow-up

Add or identify a direct regression test proving `runDispatch()`/`batch-loader.ts` passes a valid `callModel` dependency into `dispatchWorkorder()`. Then promote this draft to a final incident record.
