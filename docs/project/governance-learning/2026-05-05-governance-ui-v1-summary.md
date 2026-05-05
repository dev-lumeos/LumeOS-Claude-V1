# Governance UI V1 Summary

## Purpose

Governance UI V1 adds a local visual operator console around the existing governance CLIs. The goal is to reduce manual copying between chat, terminals, operator reports, dossiers, and runtime checker output.

## Files Created

- `apps/web/src/app/governance/*`
- `apps/web/src/app/api/governance/*`
- `apps/web/src/components/governance/GovernanceConsole.tsx`
- `apps/web/src/lib/governance/*`
- `apps/web/src/lib/governance/__tests__/governance-ui.test.ts`
- `docs/project/GOVERNANCE_UI_V1.md`

## Safety Boundaries

- Read-only by default.
- Controlled actions require typed `CONFIRM`.
- No Supabase reset, push, migration execution, production database command, runtime state edit, queue edit, approval auto-grant, or product batch execution is exposed.
- Commands run through a central allowlist.
- Command output is redacted before it reaches the browser.

## Product Work Gate

Product work remains blocked unless Tom explicitly opens it. The UI does not open the gate and does not start product work.

## Follow-up

- Add React Flow graph rendering after the table-backed workorder view is stable.
- Add saved local dossier views.
- Add richer approval review display without auto-granting.
