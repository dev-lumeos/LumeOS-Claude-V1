# Product Work Gate

STATUS: CURRENT GOVERNANCE REFERENCE

Current date: 2026-05-11.

## Decision

Product work is closed unless Tom explicitly opens a specific product gate.

The LumeOS default project profile records this policy in `system/project-profiles/profiles/lumeos.json`. Profile-aware tools may read that policy, but the profile does not grant approval, execute work, open the product gate, or override Tom's gate decision.

## Current Scoped Exception

As of 2026-05-12, Tom approved one narrow scoped exception only:

- `Nutrition / BLS / P1-005 preparation`

This exception allows planning, validation, source-chain review, workorder-readiness review, and non-dispatching governance/operator checks only.

This exception does not allow:

- BLS import execution
- Supabase commands
- migration execution
- DB apply or production DB work
- product batch execution
- Nutrition feature implementation
- approval grants

General product work remains closed.

## Machine-Readable Narrow Exception

The LumeOS profile now includes one exact per-batch execution allowlist entry:

- `system/workorders/nutrition/batches/BATCH-NUTRITION-P1-005-SOURCE-CHAIN-READINESS.md`

Rules:

- exact repo-relative batch path match only
- no wildcard paths
- no directory-wide allow
- no profile-wide `open` or `conditional` widening
- all other product batches remain blocked

This allowlist exists only so profile-aware source-chain and doctor checks can treat that one executable-scoped batch as a narrow exception without opening broader product work.

## Allowed Work

No product execution is currently allowed. Allowed governance-only work may include:

- Governance docs and runbook cleanup.
- Read-only governance checks.
- Generation of governance reports.
- Static validation.
- Scoped `Nutrition / BLS / P1-005 preparation` planning/readiness work exactly as approved in `docs/project/FIRST_PRODUCT_GATE_OPENING_PROPOSAL.md`.

## Forbidden Work

The closed product gate does not allow:

- `supabase db push`
- `supabase db reset`
- Production database changes.
- Migration execution.
- Real BLS bulk import execution.
- Committing raw BLS files.
- Invented BLS, food, nutrient, or category values.
- Bypassing the Governance Operator or checkers.
- Auto-granting approvals.
- Autonomous, night, or large product runs.

## Mandatory Gates

Any product-related workorder or batch must pass:

- `system/control-plane/governance-invariant-check.ts`
- `system/control-plane/agent-contract-check.ts`
- `system/workorders/cli/spec-source-chain-check.ts`
- `system/reports/governance-learning-check.ts`
- Governance Batch Operator status/dry-run/doctor as appropriate.
- `system/control-plane/promotion-governance.ts` before merge.

## BLS Policy

Raw BLS files remain local-only and ignored.

Raw files may be inspected read-only for source validation and planning. They must not be committed, modified, or used as the primary source when a higher-priority current spec exists.

The profile raw-data policy includes `docs/specs/Nutrition/00_raw/` so profile-aware artifact checks can classify raw BLS files without hardcoding the path in every checker.

## Runtime Hardening Requirement

Spark Runtime Hardening is required before autonomous, night, or large product runs.

## Approval Policy

Tom approvals remain required. The conditional gate does not permit automatic approval grants.

For migration or SQL-sensitive work, any grant allows only the scoped file write or review action stated by the approval. It does not allow database execution.

## Non-Interactive Autonomy Policy

Governed workflow runs must not repeatedly ask Tom for approval during safe preparation work. After Tom defines goals, scope, and forbidden actions, the workflow continues automatically until it reaches a true execution boundary.

### Mode: `AUTO_CONTINUE`

Proceed without asking Tom again when the next step stays inside already approved safe scope.

Examples:

- read-only analysis
- docs-only changes
- draft-only workorders
- draft-only batches
- source-chain review
- readiness reports
- validators
- `wo-factory --dry-run`
- operator `--status`
- operator `--dry-run`
- operator `--doctor`
- non-dispatching reports and dossiers
- handover / TODO updates
- safe preparation work inside an already approved narrow scope

### Mode: `AUTO_PLAN_AROUND`

If the next useful step touches a risky domain, do not stop immediately. First create the safest non-executing alternative and continue automatically with that draft/read-only path.

Examples:

- DB needed -> create schema review, SQL draft, rollback plan, no apply
- Supabase needed -> create command plan, no command execution
- migration needed -> create migration candidate, rollback, local dry-run plan, no execution
- BLS import needed -> create source-chain review, sample plan, import plan, no import
- raw BLS needed -> create source inventory, no raw commit
- runtime state needed -> create diagnosis report, no manual edit
- queue state needed -> create queue proposal, no queue edit
- production routing needed -> create routing proposal or test-profile plan, no production change
- broad product gate needed -> create narrow proposal only, no broad opening

### Mode: `STOP_AND_REPORT`

Stop only when no safe non-executing path remains and the next step would cross a real execution boundary.

Examples:

- irreversible execution is next
- all read-only, draft-only, and dry-run options are exhausted
- the next step requires real DB, Supabase, migration, or import execution
- the next step requires dispatcher execution
- the next step requires Codex Worker execute
- the next step requires approval grant
- the next step requires queue or runtime-state mutation
- the next step requires production routing change
- the next step requires a broad product-gate opening

When stopping, report the exact boundary and next Tom decision. Do not wait interactively during safe preparation work.
