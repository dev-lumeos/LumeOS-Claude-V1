# Codex Dispatcher Smoke Plan

Date: 2026-05-10

## 1. Scope

This plan records the controlled dispatcher smoke path for the Codex Worker integration.

It does not permit product work, Supabase commands, migration execution, approvals, or broad Codex Worker use.

## 2. Current Config State

Current file:

```text
system/workers/codex-worker.config.json
```

Current controlled defaults:

```json
{
  "codex_worker_enabled": true,
  "allow_dispatcher_integration": true,
  "allowed_agents": ["senior-coding-agent"],
  "require_explicit_workorder_flag": true,
  "require_product_gate": true,
  "product_gate_open": false,
  "default_timeout_ms": 120000,
  "max_timeout_ms": 300000
}
```

Meaning:

- Manual Codex Worker Bridge is ready.
- Dispatcher integration code exists.
- Automatic dispatcher execution is enabled only for the narrow senior-agent path.
- Only `senior-coding-agent` is allowlisted.
- Workorders must explicitly opt in with `codex_worker: true`.
- Product work is blocked while `product_gate_open=false`.

## 3. Required Config State For Smoke

For a controlled smoke, confirm this config state:

```json
{
  "codex_worker_enabled": true,
  "allow_dispatcher_integration": true,
  "allowed_agents": ["senior-coding-agent"],
  "require_explicit_workorder_flag": true,
  "require_product_gate": true,
  "product_gate_open": false,
  "default_timeout_ms": 120000,
  "max_timeout_ms": 300000
}
```

This state is not a broad product/runtime opening. It is constrained by the agent allowlist, explicit workorder opt-in, metadata requirements, and product gate.

## 4. Test Workorder Requirements

The smoke workorder must be docs-only and must include:

- `agent_id: senior-coding-agent`
- `codex_worker: true`
- `requires_approval: false`
- `risk_category: docs`
- narrow `scope_files`
- explicit `files_blocked`
- explicit `expected_outputs`
- explicit `source_refs`
- no DB, Supabase, migration, approval, product, runtime-state, queue, or raw BLS scope

Draft workorder:

```text
system/workorders/adhoc/WO-codex-001.md
```

Expected output:

```text
docs/project/codex-dispatcher-smoke-test.md
```

## 5. Required Safety Gates

Before the smoke:

```powershell
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\control-plane\governance-invariant-check.ts --json
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\control-plane\agent-contract-check.ts --json
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\control-plane\model-runtime-check.ts --json
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\workers\codex-worker.ts --workorder system\workorders\adhoc\WO-codex-001.md --dry-run --json
cmd.exe /c node node_modules\typescript\bin\tsc --noEmit
```

All critical/high findings must be zero.

## 6. Forbidden Actions

Do not:

- run product work
- run BLS import
- run Supabase `db push`
- run Supabase `db reset`
- run `supabase migration up`
- execute migrations
- grant approvals
- edit `runtime_state.json` manually
- edit `queue.json` manually
- commit raw BLS files
- commit `system/reports/codex-worker/` runtime artifacts
- route any agent except `senior-coding-agent` through Codex Worker

## 7. Exact Command Sequence

Planned sequence for Tom-approved smoke:

1. Confirm clean state:

```powershell
git status --short --branch
```

2. Confirm the two config flags are enabled and product gate remains closed:

```json
"codex_worker_enabled": true,
"allow_dispatcher_integration": true,
"product_gate_open": false
```

3. Run read-only gates:

```powershell
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\control-plane\governance-invariant-check.ts --json
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\control-plane\agent-contract-check.ts --json
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\control-plane\model-runtime-check.ts --json
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\workers\codex-worker.ts --workorder system\workorders\adhoc\WO-codex-001.md --dry-run --json
```

4. Dispatch only the smoke workorder through the governed dispatcher path. Use the smallest existing CLI entrypoint that dispatches one workorder or a one-workorder smoke batch. Do not run a product batch.

5. Stop after one dispatch result. Do not retry automatically.

6. Verify:

```powershell
git status --short --branch
cmd.exe /c node node_modules\typescript\bin\tsc --noEmit
```

## 8. Disable Procedure

To pause the controlled senior-agent path, set:

```json
"codex_worker_enabled": false,
"allow_dispatcher_integration": false
```

Then verify:

```powershell
git diff -- system/workers/codex-worker.config.json
git status --short --branch
```

Do not commit runtime reports.

## 9. Success Criteria

The smoke succeeds only if:

- dispatcher routes only `senior-coding-agent` through Codex Worker
- Codex Worker exits before the hard timeout
- parsed final state is `DONE`
- expected docs-only output exists
- no files outside `scope_files` changed
- no forbidden commands ran
- Codex does not fail merely because the controlled config flags are enabled during execution
- the operator verifies the policy remains narrow after the dispatch attempt
- no runtime reports are committed

## 10. Failure Criteria

Classify as `FIX_REQUIRED` or `STOP` if:

- timeout occurs
- final state is not `DONE`
- any forbidden file changes
- any Supabase/migration/product command appears
- config opens any agent beyond `senior-coding-agent`
- `product_gate_open=true` without explicit Tom decision
- runtime state/approval queue diverges
- dispatcher routes any non-senior agent to Codex Worker

## 11. Why Disabled By Default

Codex Worker is powerful enough to modify the repo. Dispatcher integration therefore remains disabled by default because:

- Tom has not opened broad automatic senior-agent execution.
- Product work remains blocked unless explicitly opened.
- Codex Worker reports are runtime artifacts.
- The first dispatcher execution must prove lifecycle mapping, timeout behavior, final-state parsing, and cleanup behavior under one controlled docs-only workorder.
- Automatic enablement without a workorder opt-in would bypass the explicit governance gate Tom requested.

## 12. Exact Decision Point

Tom must explicitly approve real product use separately. Controlled senior-agent governance/docs use remains gated by workorder opt-in and checker policy.
