# P1-005 Local Curation + Preference Preview Hardening

Status: implemented local-only slice

## Scope

This slice implements the next local Nutrition Human Layer foundation:

- Local-only curation decision persistence foundation.
- Read-only `/nutrition/curation` improvements for unassigned foods, aliases, tags, category coverage, candidate table status, and preference mapping status.
- Preference-aware search preview metadata hardening on `/api/nutrition/foods/smart-preview` and `/nutrition`.

## Curation Persistence Boundary

Created local-only SQL candidate:

- `docs/project/p1-005/P1-005-local-curation-persistence-foundation.sql`
- `docs/project/p1-005/P1-005-local-curation-persistence-validation.sql`

Tables:

- `nutrition.food_curation_candidates`
- `nutrition.food_curation_decisions`

The tables are for future auditable human/admin review. This slice does not expose write controls in the UI and does not mutate `nutrition.foods`, category assignments, display names, aliases, preference rows, or BLS/nutrient values.

## Curation UI V1

`/nutrition/curation` now exposes:

- local curation persistence table status
- unassigned/categorized filter modes
- alias presence filters
- sort modes for category-missing first, sort weight, macro relevance, and name
- unassigned food examples with BLS code, source label, macros, alias count, tags, status, and unresolved reason
- preference group mapping workbench with mapped/unresolved status and item-level unresolved counts

No save, accept, reject, or apply buttons are present.

## Preference Mapping Status

Current deterministic mapping boundary remains:

- Supported exclusions: `no_offal`, `no_processed_meat`, `no_shellfish`, `no_pork`, `no_red_meat`, `no_dairy`
- Unresolved exclusions: `no_raw_fish`, `no_gluten`
- Food preference groups: mapped only where an existing Human Layer category slug is deterministic
- Food preference items: not mapped to `food_id`; all item-level mappings remain curation-gated

## Smart Preview Hardening

`/api/nutrition/foods/smart-preview` now includes per-result `preference_reasons` in addition to:

- `applied_preferences`
- `unresolved_preferences`
- `excluded_count`
- `boosted_count`
- `suppressed_count`
- `preference_score`
- `preference_notes`

The `/nutrition` page shows applied preferences, unresolved preferences, and preview result reasons. This remains local-only preview behavior, not production Smart Search.

## Deferred

- P5 category coverage improvement is deferred until additional deterministic source rules are reviewed.
- P6 alias expansion is deferred because current aliases already use source-backed normalized variants; no invented synonyms are allowed.
- Preference persistence UI is deferred until a governed local write flow is explicitly opened.
- Diary logging and MealItem creation remain out of scope.

## Safety

No DEV/LIVE, Supabase Cloud, production DB, raw BLS commit, invented values, invented names, invented aliases, RDA changes, diary write flow, MealItem creation, production routing, MiniMax routing, service restart, manual runtime state edit, or manual queue edit is part of this slice.
