# P1-005 Local Nutrition Foundation V1 Cut

Milestone: LumeOS Nutrition Local Foundation V1 + Governance Workflow Baseline  
Cut date: 2026-05-15  
Status: LOCAL FOUNDATION V1 COMPLETE / NOT DEV-LIVE READY

## Summary

This milestone freezes the current local-only Nutrition product foundation and the
governance workflow baseline proven while building it.

The local Nutrition foundation is usable for further local product development,
but it is not complete and not DEV/LIVE-ready. No Supabase Cloud, DEV, LIVE, or
production database work is authorized by this milestone.

## Database State

| Object | Current state |
|---|---:|
| `nutrition.nutrient_defs` | 138 rows |
| `nutrition.foods` | 7140 rows |
| `nutrition.food_nutrients` | 698092 rows |
| `nutrition.food_categories` | 518 rows |
| Level 1 categories | 13 |
| Level 2 categories | 75 |
| Level 3 categories | 385 |
| Level 4 categories | 45 |
| Categorized foods | 4903 |
| Unassigned foods | 2237 |
| Foods with `sort_weight` | 7140 |
| `nutrition.tag_definitions` | 16 rows |
| `nutrition.food_tags` | 9265 rows |
| `nutrition.food_aliases` | 21420 rows |
| `nutrition.food_preferences` | table exists, 0 rows |
| `nutrition.food_preference_items` | table exists, 0 rows |
| `nutrition.food_curation_candidates` | table exists, 0 rows |
| `nutrition.food_curation_decisions` | table exists, 0 rows |

Validation at this cut:

- `nutrition.food_nutrients.nutrient_code` has no missing `nutrient_defs(code)` FK targets.
- `nutrition.food_nutrients.food_id` has no orphan food references.
- `nutrition.food_categories.parent_id` has no orphan parent references.
- UTF-8 validation is clean for the local food and nutrient data checked during the governed batches.

## Visible Local Surfaces

- `http://127.0.0.1:5001/nutrition`
- `http://127.0.0.1:5001/nutrition/curation`
- `GET /api/nutrition/foods`
- `GET /api/nutrition/foods/categories`
- `GET /api/nutrition/foods/smart-preview`
- `GET /api/nutrition/curation`
- `GET /api/nutrition/preferences/catalog`

## Completed Product Features

- Local BLS `nutrient_defs` schema foundation.
- Thai i18n schema fields for `nutrient_defs`.
- Deterministic `nutrient_defs` seed candidate and local seed application.
- UTF-8 correction and validation for German nutrient text.
- Local `foods` and `food_nutrients` schema foundation.
- Deterministic full local BLS food import from `BLS_4_0_Daten_2025_DE.xlsx`.
- Local `foods` and `food_nutrients` populated with 7140 foods and 698092 nutrient values.
- Local Food Search V1.
- Food detail with linked nutrient table resolved through `nutrient_defs`.
- Human Layer foundation.
- Category tree foundation through L4 where deterministic.
- Deterministic category assignment for 4903 foods.
- V1 visible tag definitions.
- Deterministic/source-backed `food_tags`.
- Source-backed aliases only.
- Search normalization with German umlaut support.
- Category filters.
- V1 tag filters.
- Sort modes: `relevance`, `protein_desc`, `kcal_asc`, `name_asc`.
- Pagination/load-more controls.
- Preference catalog foundation from old platform screenshots.
- Read-only Preferences catalog API.
- Preference-aware Smart Preview.
- Deterministic hard exclusions supported in preview:
  - `no_offal`
  - `no_processed_meat`
  - `no_shellfish`
  - `no_pork`
  - `no_red_meat`
  - `no_dairy`
- Unresolved exclusions documented:
  - `no_raw_fish`
  - `no_gluten`
- Curation UI V1.
- Preference mapping workbench.
- Human Layer gap analysis.
- Alias coverage analysis.
- Curation persistence tables created locally, with no rows inserted.
- Deterministic V2 Wild category mapping applied:
  - SPEC_05 evidence: `game_meat | Wild | V2xxxx (Hirsch, Wildschwein, Reh)`.
  - Target: local category slug `wild`, id `86faea12-9082-456b-9528-34359ad065ba`, level 2.
  - Parent path: `FLEISCH & GEFLUEGEL > Wild`.
  - Scope: currently unassigned foods where `bls_code LIKE 'V2%'`.
  - Affected rows: 49.
  - Categorized foods moved from 4854 to 4903.
  - Unassigned foods moved from 2286 to 2237.

## Completed Governed Workstreams

- P1-005 import-preparation planning outputs.
- Schema-only local Nutrition foundation.
- Thai i18n local schema correction.
- Deterministic `nutrient_defs` seed and UTF-8 correction.
- Local Food Foundation.
- Local BLS food sample staging.
- Full local deterministic BLS import expansion.
- Local Food Search / Food Detail.
- Local Food Taxonomy / Human Layer foundation.
- Preferences + Human Layer Curation foundation.
- Preference-aware search preview and read-only curation dashboard.
- Curation persistence foundation and smart-preview hardening.
- Human Layer gap and alias coverage analysis.
- V2 Wild category apply.

## Completed Governance Baseline

- Spark1 orchestration is proven.
- Spark2 / Codex Worker path has been used for governed product work.
- DGX3 / Nemotron reviewer path is proven for explicit governed review.
- Nemotron review PASS evidence exists across multiple product batches, including the V2 Wild apply batch with confidence `0.99`.
- `documentation_impact` is required in active/new workorders.
- `documentation_started` and `documentation_completed` audit events are used.
- `SSOT_SYNC_CHECK` is active and wired into governance invariants.
- Cross-file SSOT consistency checking is active.
- Dossiers are generated for product batches.
- Stop-rule baseline mechanism works through official governed tooling.
- Bounded review payloads are implemented for Nemotron.
- Codex Worker timeout/reporting mismatch is fixed in dossier reporting.

## Current Limitations

- 2237 foods remain unassigned.
- Remaining category mappings require separate deterministic evidence.
- Human-friendly display names are not curated.
- Curated aliases are not implemented.
- Exact item-to-food mappings for the preference catalog are mostly unresolved.
- `no_raw_fish` requires preparation/raw-state metadata.
- `no_gluten` requires deterministic allergen/ingredient tagging.
- Preference persistence UI is not implemented.
- Smart Search with persisted user state is not implemented.
- Diary logging is not implemented.
- MealItem creation is not implemented.
- Serving/portion model is not implemented.
- Food amount input is not implemented.
- Meal schedule persistence is not implemented.
- Daily nutrition summary is not implemented.
- Macro dashboard is not implemented.
- RDA / `nutrient_reference_values` candidate remains open.
- DEV/LIVE are not set up.
- Supabase Cloud is not used.

## Open Product TODOs

1. Analyze remaining 2237 unassigned foods and apply only rules backed by deterministic SPEC_05 / BLS-prefix evidence.
2. Build curated display-name and alias governance without inventing names or synonyms.
3. Add deterministic preparation/raw-state and ingredient/allergen metadata before applying `no_raw_fish` or `no_gluten`.
4. Build local preference persistence UI and persisted Smart Search only after the local write path is explicitly gated.
5. Build diary, MealItem, serving/portion, amount input, and meal schedule foundations only after separate approval.
6. Build daily nutrition summary and macro dashboard after diary/meal data foundations exist.
7. Create a separate verified RDA / `nutrient_reference_values` source candidate.
8. Define a future local-to-DEV/LIVE promotion plan; no DEV/LIVE action is authorized now.

## Recommended Next Product Sequence

1. Continue Human Layer coverage analysis for remaining unassigned foods.
2. Apply the next category rule only if deterministic evidence is as strong as the completed V2 Wild slice.
3. Prepare curated display-name / alias governance, still with no invented labels.
4. Design the local preference persistence workflow before implementing write UI.
5. Only after that, revisit diary/MealItem and daily summary foundations.

## Safety Boundary

This milestone does not authorize:

- DEV or LIVE promotion.
- Supabase Cloud use.
- Production DB writes.
- New migrations outside explicitly opened local-only boundaries.
- Raw BLS commits.
- BLS import expansion beyond the already completed local deterministic import.
- RDA value changes.
- Invented food values, nutrient values, aliases, display names, or category mappings.
- Diary write flow or MealItem creation.
- Production routing changes.
- MiniMax production routing.
