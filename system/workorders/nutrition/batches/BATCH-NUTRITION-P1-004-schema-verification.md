# BATCH-NUTRITION-P1-004-schema-verification

## Status
ready_for_operator

## Purpose

Dedicated static verification batch for Nutrition P1 schema migrations after Batch 001 and before BLS import work.

This batch verifies ordering and non-destructive SQL invariants only. It must not execute Supabase migrations.

## Included Workorders

| Order | Filename | workorder_id | Title | Risk | Approval |
|---|---|---|---|---|---|
| 1 | `WO-NUTRITION-P1-004-schema-verification.md` | `WO-nutrition-004` | Nutrition Local Schema Verification | `test` | not required |

## Execution Guard

- Do not run `supabase db push`.
- Do not run `supabase db reset`.
- Do not execute migrations.
- Do not import BLS data.
- Do not modify raw BLS files.
- Use static verification only.

## Expected Outputs

| WO | Output |
|---|---|
| WO-nutrition-004 | `docs/specs/Nutrition/06_workorder_planning/schema_verification/P1-004-static-schema-verification-report.md`, `system/workorders/nutrition/verify-p1-schema-static.ts`, and `system/workorders/nutrition/__tests__/verify-p1-schema-static.test.ts` |
