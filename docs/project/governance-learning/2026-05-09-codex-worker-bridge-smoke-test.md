# Codex Worker Bridge Smoke Test

Date: 2026-05-09

## Scope

Governance/docs-only smoke test for the Codex Worker Bridge.

No product work, Supabase command, migration execution, approval grant, runtime state edit, queue edit, dispatcher auto-integration, or raw BLS commit was allowed.

## Workorder

- `system/workorders/adhoc/WO-codex-worker-smoke-001.md`
- Risk: `docs`
- Scope: `docs/project/codex-worker-smoke-test.md`

## Dry-run Result

Dry-run passed.

The generated prompt included:

- `scope_files`
- `files_blocked`
- forbidden commands
- final state contract
- source references
- validation command

Dry-run did not call Codex and did not write runtime reports.

## Execute Result

Execute was attempted once and then stopped by Tom because it hung for more than 14 minutes.

Root cause:

- The initial worker had no hard child-process timeout.
- This allowed `codex exec` to keep running without returning control to the worker.

Fix:

- `codex-worker.ts` now supports `--timeout-ms`.
- Default timeout is 120 seconds.
- On timeout, the worker returns `FIX_REQUIRED`, writes a clear report, and does not retry.
- Tests cover a mocked hanging child process.

Real execute was not retried after the timeout fix.

## Runtime Artifacts

Generated worker prompts/reports live under:

```text
system/reports/codex-worker/
```

That directory is ignored and must not be committed by default.

## Dispatcher Integration Readiness

Not yet.

The bridge can generate safe prompts and has timeout protection, but dispatcher integration should wait until Tom explicitly approves another controlled execute smoke after reviewing timeout behavior.
