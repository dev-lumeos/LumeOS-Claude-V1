# system/state

Status: ACTIVE_CORE / TOOL-MANAGED RUNTIME STATE

This folder contains state code, schemas, tests, and tool-managed runtime
artifacts used by governed execution.

## What Lives Here

- State manager and schemas used by control-plane and operator tooling.
- Runtime state files such as `runtime_state.json`.
- Audit and pipeline JSONL logs.
- Stop-rule and pipeline metrics artifacts.

## Manual Edit Rule

Do not manually edit runtime state, queue mirrors, locks, audit logs, or
pipeline metrics. Use official CLIs and cleanup mechanisms.

Examples of official paths:

- stop-rule inspect/dry-run/baseline tools;
- approval lifecycle tools;
- batch operator cleanup mechanisms;
- state manager APIs used by governed commands.

## Runtime Artifacts

Audit logs and pipeline metrics are evidence of governed runs. They should be
read for diagnosis, not edited by hand.

The audit flags `system/state/pipeline-metrics.jsonl` for policy review because
it behaves like a runtime artifact while currently being tracked. Do not resolve
that by ad hoc editing; handle it through a future governed policy workorder.

## Cleanup Rule

No Phase 1 cleanup is authorized here. This README only explains how to treat
state files safely.
