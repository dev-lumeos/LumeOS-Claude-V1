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
- Runtime Center: runtime routes render as cards with required/optional state, endpoint status, runtime type, Codex external runtime labeling, JSON/thinking policy hints, MealCam optional/on-demand handling, and explicit local history summary actions.
- Next Action UX: next action cards separate action text from copyable command blocks.
- Autonomy Handoff: Doctor and Dossier views surface the `autonomy_handoff` contract with final state, blocker type, dossier command, learning suggestion, safe cleanup dry-run, Codex Worker eligibility, and one next action.
- Raw Output: stdout/stderr remains available in collapsible panels for audit/debugging, but parsed JSON summaries are preferred.

## Project Profile Display

The Settings page shows the active project profile context:

- project id, display name, profile kind, and active flag
- repo/spec/workorder roots
- default governance batch
- product gate reason
- raw data paths and allowed domain paths
- Codex Worker policy

The UI defaults to `lumeos`. The snapshot API can load a selected profile for read-only context, including inactive fixture profiles, but V2 does not expose project activation or mutation controls.

## Runtime History UI

The Runtime page exposes four read-only/operator-safe buttons:

- Run static check
- Check endpoints
- Record endpoint check
- Show history summary

Only **Record endpoint check** writes ignored local runtime history under `system/reports/model-runtime-history/`. It still uses short `/v1/models` endpoint checks and does not send workorder prompts.

The history summary view shows runtime V2 status, freshness, last check time, age, overall readiness, total checks, total records, per-route last status, average/max latency, timeout count, failure count, last OK, and last failure.

When `system/control-plane/runtime-maintenance.json` marks DGX/Spark planned maintenance active, the Runtime page shows a planned-maintenance banner instead of scary routing-failure language. This state blocks runtime-dependent autonomous/night/large runs, but it does not ask Tom to fix Spark routing while the hardware is intentionally powered down. After maintenance ends, Tom must record a fresh endpoint check before large or autonomous runtime-dependent work.

## Browser Smoke / Visual Verification

Governance UI V2 has a lightweight local browser smoke gate:

```powershell
cmd.exe /c pnpm governance:ui:smoke
```

The smoke starts the local Next app on `127.0.0.1:5001`, visits every `/governance` route, verifies the governance shell/navigation and route-specific content, checks that generic Next.js error pages are absent, and captures screenshots.

Screenshot and Playwright artifacts are generated under:

```text
tmp/governance-ui-browser-smoke/
```

This directory is ignored and must not be committed. The smoke does not click endpoint-health buttons, controlled actions, approval actions, or product-work controls. It does not require DGX/Spark hardware.

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
- Runtime history is local-only and ignored; another checkout starts with `UNKNOWN` until a recorded check is run.
- Approval execution remains intentionally absent.
- Dossier timeline quality depends on structured dossier JSON; raw markdown/stdout remains available for fallback.
- Autonomy handoff detail depends on updated operator/doctor/dossier JSON; older command results may show the empty-state panel.

## Future V2+ Work

- React Flow graph with pan/zoom and edge labels.
- Saved local dossier history.
- Approval detail drawer with richer risk review.
- Runtime health timeline.
- Read-only polling toggle for dashboard snapshots.
