# Governance UI V1

## Purpose

Governance UI V1 is a local operator console for the LumeOS governance and determinism system. It wraps existing governance CLIs and displays their read-only JSON or console output so Tom can inspect status, approvals, dossiers, runtime health, learning state, and promotion readiness without copying commands between chat and terminals.

This UI is governance/operator tooling. It is not product work.

## Start

From the repository root:

```powershell
cmd.exe /c pnpm --dir apps\web exec next dev -H 127.0.0.1 -p 5001
```

Open:

```text
http://127.0.0.1:5001/governance
```

If another dev server already uses port 5001, choose another local port and adjust the URL.

## Styling Requirements

The UI relies on Tailwind through:

- `apps/web/tailwind.config.js`
- `apps/web/postcss.config.js`
- `apps/web/src/app/globals.css`

The console uses governance-specific component classes such as `gov-shell`, `gov-sidebar`, `gov-panel`, `gov-card`, `gov-button`, `gov-table`, and `gov-code`. If the page appears as raw/default HTML, first verify that `postcss.config.js` exists and that `globals.css` is imported by `apps/web/src/app/layout.tsx`.

## Routes

- `/governance` - dashboard cards for product gate, git, checkers, approvals, and next action.
- `/governance/batches` - batch operator console.
- `/governance/doctor` - operator doctor diagnosis and one safe next action.
- `/governance/approvals` - approval queue viewer. No auto-grants.
- `/governance/dossiers` - batch dossier viewer.
- `/governance/workorders` - workorder table from dossier data.
- `/governance/promotion` - promotion review, merge, and push console.
- `/governance/learning` - handover, learning status, and learning checker.
- `/governance/runtime` - model runtime and endpoint health.
- `/governance/settings` - safety rules, forbidden commands, and allowlisted actions.

## Supported Commands

All command execution goes through `apps/web/src/lib/governance/command-runner.ts` and `command-allowlist.ts`.

Read-only actions:

- `git.status`
- `operator.status`
- `operator.dryRun`
- `operator.doctor`
- `invariant.check`
- `agentContract.check`
- `modelRuntime.check`
- `modelRuntime.checkEndpoints`
- `specSource.checkBatch`
- `learning.check`
- `dossier.batch`
- `promotion.review`
- `approvals.list`
- `approvals.all`

Controlled actions:

- `operator.continue`
- `operator.continueSafeCleanups`
- `dossier.write`
- `promotion.merge`
- `promotion.pushMain`

Controlled actions require typing `CONFIRM` in the UI. This confirmation does not bypass the CLI safety gates.

## Forbidden Commands

Governance UI V1 does not expose:

- `supabase db reset`
- `supabase db push`
- `supabase db push --linked`
- `supabase migration up`
- migration execution
- production database commands
- manual `runtime_state.json` edits
- manual `queue.json` edits
- approval grant automation
- raw BLS commit commands

## Safety Model

- The browser never builds shell strings from free text.
- The server uses `spawn` with argument arrays, not shell interpolation.
- Batch paths must be repo-relative and under `system/workorders`.
- Branch names are validated before promotion commands run.
- Command results capture command, exit code, stdout, stderr, parsed JSON, and timestamp.
- Output is redacted for common secret/key/token patterns before returning to the browser.
- Approval grant/deny execution is not implemented in V1.
- MealCam offline is shown as optional/on-demand information, not a governance blocker.

## Known Limitations

- Workorder graph is a V1 table fed by dossier output; React Flow graph rendering is deferred.
- Approval review is display-only; Tom still grants or denies through approved CLI workflow outside this UI.
- The UI is local-only and assumes the repository checkout is trusted.
- The dashboard snapshot runs several read-only CLIs and can take a few seconds.
- Controlled cleanup confirm buttons are not exposed directly; use the operator safe cleanup flow.
- Non-zero CLI exits with structured JSON are displayed as governance findings, not API transport failures.
- Promotion review on `main` is explained as a feature-branch workflow: `main..main` has no diff to review.
- The default batch path points at an existing governance batch, not a missing Nutrition P1-005 planning batch.

## Visual Verification

Minimum visual acceptance for V1:

- Dark sidebar navigation is visible.
- Top status bar is visible.
- Dashboard cards render with colored status badges.
- Buttons are styled and separated by read-only vs controlled action.
- Command output is shown in monospaced code panels.
- Tables use styled headers and row borders.
- The product work gate warning is visible.

## Next UI Phases

- React Flow workorder dependency graph.
- Saved local dossier views.
- Typed approval review forms with explicit non-auto grant workflow.
- Operator doctor embedded in every stopped batch result.
- Better parser adapters for non-JSON legacy CLI output.
- Local-only activity log for UI command runs.
