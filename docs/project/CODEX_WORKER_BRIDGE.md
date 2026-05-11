# Codex Worker Bridge

Date: 2026-05-09

## Purpose

The Codex Worker Bridge prepares controlled senior-agent workorders for non-interactive Codex CLI execution through `codex exec`.

It removes Tom's manual prompt-copy step without changing the governance gates. The bridge is dry-run by default, does not dispatch workorders by itself, and does not grant approvals.

## Commands

Dry-run a workorder prompt:

```powershell
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\workers\codex-worker.ts --workorder <workorder-file> --dry-run
```

Execute a workorder through Codex CLI:

```powershell
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\workers\codex-worker.ts --workorder <workorder-file> --execute
```

Execution has a hard timeout. The default is 120 seconds:

```powershell
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\workers\codex-worker.ts --workorder <workorder-file> --execute --timeout-ms 120000
```

On timeout the worker kills the child process, returns `FIX_REQUIRED`, writes a clear report, and does not retry automatically.

The worker closes child stdin immediately after spawn. Codex CLI prints "Reading additional input from stdin..." during normal `exec`; leaving stdin open makes non-interactive worker calls wait indefinitely.

Dry-run an existing prompt file:

```powershell
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\workers\codex-worker.ts --prompt-file <prompt-file> --dry-run
```

Execute an existing prompt file:

```powershell
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\workers\codex-worker.ts --prompt-file <prompt-file> --execute
```

Resume a Codex session:

```powershell
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\workers\codex-worker.ts --workorder <workorder-file> --execute --resume <session-id>
```

JSON output:

```powershell
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\workers\codex-worker.ts --workorder <workorder-file> --dry-run --json
```

Profile-aware dry-run:

```powershell
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\workers\codex-worker.ts --workorder <workorder-file> --dry-run --project lumeos
```

## Dry-run First

Default behavior is dry-run.

Dry-run:

- parses the workorder
- validates the path
- builds the Codex prompt
- previews the `codex exec` command shape
- does not call Codex
- does not write runtime reports

`--execute` is required before Codex is invoked.

## Artifacts

Generated prompt and execution reports are written under:

```text
system/reports/codex-worker/
```

The bridge writes artifacts only when:

- `--execute` is used
- `--write-prompt` is used

These reports are runtime artifacts and should not be committed by default.

Use the report retention summarizer to inspect local metadata without dumping prompt or transcript bodies:

```powershell
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\reports\report-retention-summarizer.ts --json
```

Retention and redaction policy is documented in `docs/project/REPORT_RETENTION_POLICY.md`.

## Safety Boundaries

Every generated prompt includes:

- repository path
- active project profile when `--project` is provided
- workorder id
- objective
- `scope_files`
- `files_blocked`
- `expected_outputs`
- acceptance criteria
- `source_refs`
- risk category
- forbidden commands
- validation commands
- final report format
- STOP conditions

The bridge tells Codex:

- no approval grants
- no Supabase `db push`
- no Supabase `db reset`
- no migration execution unless explicitly allowed and Tom-approved
- no production DB work
- no manual `runtime_state.json` edits
- no manual `queue.json` edits
- no product work outside scope
- no raw BLS file commits
- obey `scope_files`, `files_allowed`, and `files_blocked`
- stop at `DONE`, `NEEDS_TOM_APPROVAL`, `FIX_REQUIRED`, or `STOP`

When `--project lumeos` is active, the worker also reads the LumeOS profile for:

- `repo_root`
- `workorders_root`
- `raw_data_paths`
- `forbidden_paths`
- `forbidden_commands`
- `product_gate`
- `codex_worker_policy`

The profile can add restrictions and context. It cannot weaken global safety rules.

## Difference From Interactive Codex

Interactive Codex is Tom-driven.

The worker bridge is governance-driven:

- it constructs a constrained prompt from a workorder
- it runs `codex exec` non-interactively only when explicitly requested
- it captures stdout, stderr, exit code, duration, prompt path, and report path
- it parses the final state when possible
- it enforces a hard execution timeout and reports `FIX_REQUIRED` on timeout
- it closes stdin immediately so `codex exec` receives EOF instead of waiting for interactive input

## Senior Agent Integration

`senior-coding-agent` and `senior-reviewer-agent` are represented as:

- runtime: Codex CLI
- model: GPT-5.5
- healthcheck: config/manual

Current integration is controlled-enabled:

- `system/workers/codex-worker.config.json` exists
- `status` is `controlled_enabled`
- `codex_worker_enabled` is `true`
- `allow_dispatcher_integration` is `true`
- `allowed_agents` is limited to `senior-coding-agent` and `senior-reviewer-agent`
- automatic dispatcher execution also requires `codex_worker: true` on the workorder when `require_explicit_workorder_flag` is enabled
- `require_product_gate` is `true`
- `product_gate_open` is `false`

When enabled, dispatcher use is narrow:

- only `senior-coding-agent` and `senior-reviewer-agent`
- only `runtime_type: codex-cli`
- only workorders with `source_refs`, `scope_files`, `files_blocked`, and `expected_outputs`
- only narrow `scope_files`; broad roots and globs are rejected
- no pending human approval requirement
- no DB, Supabase, migration, approval-grant, runtime-state, queue-state, or raw BLS work
- product work remains blocked unless Tom explicitly opens the product gate
- hard timeout from config
- final state mapped to `completed`, `awaiting_approval`, `failed`, or `blocked`

`senior-reviewer-agent` is separately gated. It may review governance/docs/system workorders and may make scoped docs/governance file changes only when the workorder explicitly allows them. It must not become a broad implementation or approval-grant path.

Operator Doctor reports whether the Codex worker is ready or disabled. Batch dossiers include Codex worker report metadata when runtime reports exist.

## Forbidden Commands

The worker must not be used to run:

- `supabase db reset`
- `supabase db push`
- `supabase db push --linked`
- `supabase migration up`
- production DB commands
- migration execution without explicit Tom approval
- approval grants
- manual runtime-state edits
- manual approval-queue edits
- product batches outside the current gate

## Dispatcher Integration

The controlled dispatcher path is:

1. Operator selects `senior-coding-agent` or `senior-reviewer-agent`.
2. Operator verifies source-chain, invariant, agent-contract, learning, model-runtime, and product-gate checks.
3. The workorder opts in with `codex_worker: true`.
4. Dispatcher verifies the senior-agent route, required metadata, approval status, timeout config, and product-gate policy.
5. Dispatcher invokes the Codex worker through the internal bridge, not through a shell command string.
6. Dossier records prompt path, report path, stdout/stderr summaries, exit code, duration, timeout state, and final state.

If Tom needs to pause automatic senior-agent dispatch, set `codex_worker_enabled=false` or `allow_dispatcher_integration=false`.
