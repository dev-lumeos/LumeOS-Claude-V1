# Product Work Gate

STATUS: CURRENT GOVERNANCE REFERENCE

Current date: 2026-05-11.

## Decision

Product work is closed unless Tom explicitly opens a specific product gate.

The LumeOS default project profile records this policy in `system/project-profiles/profiles/lumeos.json`. Profile-aware tools may read that policy, but the profile does not grant approval, execute work, open the product gate, or override Tom's gate decision.

## Allowed Work

No product execution is currently allowed. Allowed governance-only work may include:

- Governance docs and runbook cleanup.
- Read-only governance checks.
- Generation of governance reports.
- Static validation.

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
