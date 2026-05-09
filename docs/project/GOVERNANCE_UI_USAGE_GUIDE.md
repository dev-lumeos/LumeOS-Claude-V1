# Governance UI Usage Guide

## 1. Purpose

The Governance UI is a local operator console for the LumeOS governance and determinism system. It helps Tom inspect governance status, batches, approvals, dossiers, runtime health, learning state, and promotion readiness without copying outputs between ChatGPT, Codex, Claude, and terminals.

This UI is governance/operator tooling. It is not product work.

## 2. Start Command

From the repository root:

```powershell
cmd.exe /c pnpm --dir apps\web exec next dev -H 127.0.0.1 -p 5001
```

## 3. URL

```text
http://127.0.0.1:5001/governance
```

## 4. Safety Rules

- Product work remains blocked unless Tom explicitly opens it.
- No Supabase db reset.
- No Supabase db push.
- No migration execution.
- No production DB access or changes.
- No automatic approval grants.
- No raw BLS file commits.
- Controlled actions require explicit confirmation.
- Approval Center is display-only in V1.

## 5. Navigation Overview

- `/governance` - Dashboard for the product gate, git state, invariant check, agent contract check, runtime check, learning check, approvals, and next action.
- `/governance/batches` - Batch console for operator status, dry-run, doctor, continue, and continue with safe cleanups.
- `/governance/doctor` - Read-only diagnosis and one safe next action.
- `/governance/approvals` - Pending, granted, and denied approval visibility. No auto-grant in V1.
- `/governance/dossiers` - Generate and view batch dossier JSON/Markdown through the existing CLI.
- `/governance/workorders` - Workorder table from dossier data. React Flow graph is future work.
- `/governance/promotion` - Branch review, merge readiness, and controlled merge/push flow.
- `/governance/learning` - Current handover and learning status.
- `/governance/runtime` - Model runtime routes, endpoint health, and optional MealCam route handling.
- `/governance/settings` - Repo path, forbidden commands, allowlisted actions, product gate, and raw BLS policy.

## 6. Normal Operator Workflow

1. Open the Dashboard.
2. Check the Product Gate and status cards.
3. Go to Batches.
4. Enter or confirm an existing batch path under `system/workorders/`.
5. Run Operator doctor first.
6. Run dry-run.
7. Only then run continue if the result is safe.
8. If an approval appears, stop and review it.
9. Use Dossiers for the final report.
10. Use Promotion only for merge/push governance.

## 7. Recommended First Test

Use a safe existing batch and read-only actions only:

- Dashboard refresh
- Runtime static check
- Runtime endpoint check
- Learning check
- Batch operator status
- Doctor
- Dossier JSON

Do not run controlled actions unless Tom explicitly decides.

## 8. Controlled Actions

The UI exposes these controlled actions:

- Operator continue
- Operator continue with safe cleanups
- Promotion merge
- Promotion push
- Dossier write

They require confirmation and still use the existing CLI gates. Confirmation in the UI does not bypass governance.

## 9. Forbidden Actions

The Governance UI must not expose or execute:

- `supabase db reset`
- `supabase db push`
- `supabase migration up`
- migration execution
- approval auto-grants
- product batch execution without gate opening
- manual `runtime_state.json` edits
- manual `queue.json` edits

## 10. Known Limitations

- Workorder graph is table-first in V1.
- Approval grant/deny execution is not implemented in V1.
- Dossier viewer is still command/result oriented.
- No live polling yet.
- No screenshot or visual regression tests yet.
- UI depends on local CLI tools and the repository path.

## 11. Troubleshooting

- If the page does not load, check whether the dev server is running.
- If a command fails, inspect the command result panel.
- If a command returns `NEEDS_FIX`, `BLOCKED`, or `NEEDS_APPROVAL` with parsed JSON, treat it as a governance finding, not a UI/API transport failure.
- If Promotion review is run on `main`, `main..main` has no feature-branch diff to review; use Promotion review on feature branches.
- If runtime status is empty, run the runtime check.
- If port 5001 is occupied, use another port and adjust the URL.
- If Codex asks about branch creation, branch creation is pre-approved when the worktree is clean.
- If a Node path issue appears, use the existing local Node fallback only if it is documented.

## 12. Next UI Improvements

- React Flow workorder graph.
- Better approval detail viewer.
- Better dossier timeline.
- Live refresh and polling.
- Runtime health timeline.
- Merge/promotion UX improvements.
