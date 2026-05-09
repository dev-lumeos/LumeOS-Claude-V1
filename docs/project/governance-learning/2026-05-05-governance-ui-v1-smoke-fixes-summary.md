# Governance UI V1 Smoke Fixes Summary

## Purpose

Capture the follow-up fixes from the Governance UI V1 smoke test.

## Fixes

- Changed the default batch path to an existing governance batch instead of the missing Nutrition P1-005 planning batch.
- Added helper text that batch paths should point to existing files under `system/workorders/`.
- Added UI classification for command results so structured non-zero governance output is shown as a governance finding rather than an API failure.
- Added result badges for `PASS`, `BLOCKED`, `NEEDS_FIX`, `NEEDS_APPROVAL`, and `API_ERROR`.
- Added a Promotion page helper explaining that promotion review is intended for feature branches and that `main..main` has no diff to review.
- Moved raw CLI output into a clearly labeled collapsible panel when parsed JSON is available.

## Safety

No product work was performed. No Supabase commands, migrations, approval grants, batch continues, merge/push buttons, or runtime state edits were added.

## Validation

The Governance UI safety tests cover the default batch path, structured governance blocker classification, unstructured API error classification, and the Promotion `main` helper text.
