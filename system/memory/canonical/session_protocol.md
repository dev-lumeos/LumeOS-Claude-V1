# Session Memory Protocol

## Session Start

1. Read `docs/project/CURRENT_GOVERNANCE_HANDOVER.md`.
2. Read `docs/project/GOVERNANCE_SYSTEM_COMPLETION_PLAN.md`.
3. Read `system/memory/canonical/lumeos_canonical.md`.
4. Read the relevant records in `docs/project/governance-learning/` when working on governance, operator, approval, stop-rule, dispatcher, memory, or learning behavior.
5. Read recent ADRs when the work changes durable architecture decisions.

## Session End

1. Update `docs/project/CURRENT_GOVERNANCE_HANDOVER.md` after every governance batch.
2. Add or update `docs/project/governance-learning/YYYY-MM-DD-<incident>.md` for every governance incident touched.
3. Update `system/memory/canonical/lumeos_canonical.md` only for compact current truths, not long incident history.
4. Create an ADR only for durable architecture decisions.
5. Commit memory/docs updates with the batch or fix that made them necessary.

## Rule

Chat history is not durable memory. If a future run needs to know it, write it to handover, canonical memory, an ADR, or an incident learning record.

