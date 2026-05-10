# Governance UI V2

## Purpose

Governance UI V2 upgrades the local operator console with clearer visual review surfaces for workorders, dossiers, doctor findings, approvals, runtime routes, and next actions.

The UI remains local-only governance tooling. It does not open product work, run migrations, grant approvals, or bypass the existing CLI gates.

## Start

From the repository root:

```powershell
cmd.exe /c pnpm --dir apps\web exec next dev -H 127.0.0.1 -p 5001
```

Open:

```text
http://127.0.0.1:5001/governance
```

## V2 Additions

- Workorder Graph: a lightweight dependency board fed by batch dossier JSON. It shows workorder nodes, dependency chips, status, risk, approval state, output completeness, and a selected-node detail panel.
- Dossier Timeline: the dossier page now defaults to structured summary and timeline sections for runs, approvals, reviews, cleanups, checker results, outputs, git state, final state, and next action.
- Doctor Summary: the doctor page now highlights diagnosis, blockers, checkers, cleanup candidates, runtime findings, and one next action before raw output.
- Approval Center: approvals are grouped by pending, granted, denied, consumed, and expired. Grant/deny commands are display/copy only; no approval execution is implemented.
- Runtime Center: runtime routes render as cards with required/optional state, endpoint status, runtime type, Codex external runtime labeling, JSON/thinking policy hints, and MealCam optional/on-demand handling.
- Next Action UX: next action cards separate action text from copyable command blocks.
- Raw Output: stdout/stderr remains available in collapsible panels for audit/debugging, but parsed JSON summaries are preferred.

## Safety Model

V2 preserves the V1 safety model:

- All execution goes through the central command allowlist.
- Command execution uses argument arrays, not shell interpolation.
- Batch paths remain repo-relative under `system/workorders`.
- Branch names are validated before promotion commands.
- Controlled actions still require typed `CONFIRM`.
- Approval grant/deny execution is not implemented.
- Forbidden Supabase, migration, product batch, runtime state, queue state, and raw BLS actions are not exposed.
- Product work remains closed unless Tom explicitly opens it.

## Known Limitations

- The graph is a lightweight dependency board, not React Flow.
- Graph details depend on what batch dossier JSON exposes; source refs and scope details may be empty for older workorders.
- No live polling toggle is implemented yet; refresh is manual.
- Approval execution remains intentionally absent.
- Dossier timeline quality depends on structured dossier JSON; raw markdown/stdout remains available for fallback.

## Future V2+ Work

- React Flow graph with pan/zoom and edge labels.
- Saved local dossier history.
- Approval detail drawer with richer risk review.
- Runtime health timeline.
- Read-only polling toggle for dashboard snapshots.
