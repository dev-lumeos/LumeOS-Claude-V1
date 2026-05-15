# P1-005 Local Preference Preview + Curation Validation

Status: PASS - local-only validation report for `WO-nutrition-025`

## Scope

This report validates the already-implemented local preference-aware Food Search preview and read-only Human Layer curation surface for:

- Batch: `BATCH-NUTRITION-P1-005-LOCAL-PREFERENCE-PREVIEW-CURATION`
- Workorder: `WO-nutrition-025`
- Visible pages:
  - `http://127.0.0.1:5001/nutrition?q=kuerbis&exclusions=no_dairy&liked_tags=high_fiber`
  - `http://127.0.0.1:5001/nutrition/curation`
- API routes:
  - `GET /api/nutrition/foods`
  - `GET /api/nutrition/foods/smart-preview`
  - `GET /api/nutrition/curation`
  - `GET /api/nutrition/preferences/catalog`

No application behavior, schema, seed data, BLS data, RDA values, diary flow, or MealItem flow is changed by this validation output.

## Baseline Counts

Observed from the local curation API response:

| Item | Count |
| --- | ---: |
| foods | 7140 |
| food_nutrients | 698092 |
| assigned foods | 4854 |
| unassigned foods | 2286 |
| tag_definitions | 16 |
| food_tags | 9265 |
| food_aliases | 21420 |

The unassigned food count remains `2286`.

## Probe Results

| Probe | Result | Evidence |
| --- | --- | --- |
| `GET /api/nutrition/foods?q=kuerbis&limit=3` | PASS | HTTP 200, `total=49`, result payload contained hits. |
| `GET /api/nutrition/foods/smart-preview?q=kuerbis&exclusions=no_dairy,no_gluten&liked_tags=high_fiber&limit=3` | PASS | HTTP 200, `total=49`, `excluded_count=0`, `boosted_count=16`, `suppressed_count=0`. |
| `GET /api/nutrition/curation` | PASS | HTTP 200, local curation counts returned, read-only policy returned. |
| `GET /api/nutrition/preferences/catalog` | PASS | HTTP 200, response contained `ok`, `summary`, and `catalog`. |
| `/nutrition?q=kuerbis&exclusions=no_dairy&liked_tags=high_fiber` | PASS | HTTP 200, page content contains `Preference-aware preview` and the BLS source-label note. |
| `/nutrition/curation` | PASS | HTTP 200, page content contains `Human Layer Curation` and unassigned-food content. |

## Preference Preview Behavior

Supported deterministic hard exclusions:

- `no_offal`
- `no_processed_meat`
- `no_shellfish`
- `no_pork`
- `no_red_meat`
- `no_dairy`

The smart-preview probe confirmed `no_dairy` is applied as a hard exclusion against `category:milch-kaese`.

Unresolved exclusions remain visible and are not applied:

- `no_raw_fish`
- `no_gluten`

The smart-preview probe confirmed `no_gluten` remains unresolved with the reason that ingredient-level or explicit allergen tags are not available in the current local V1 tag foundation.

Likes and dislikes are category/tag-level preview ranking adjustments only. The probe confirmed `high_fiber` is applied as a `like` effect against `tag:high_fiber`. No food-id guessing is used.

## Curation Surface Behavior

The curation API reports:

- `general_exclusions`: 6 mapped, 2 unresolved (`no_raw_fish`, `no_gluten`)
- `food_preference_groups`: 16 mapped, 2 unresolved (`veal`, `sauces_extras`)
- `food_preference_items`: 230 total, 230 unresolved
- UI mode: `read_only`
- writes enabled: `false`
- display-name strategy: source-backed provisional only
- alias strategy: source-label normalized variants only

The `/nutrition/curation` page loads and exposes the read-only curation dashboard. It is for inspection and curation planning only; it does not save mappings or mutate local data.

## Safety Confirmation

Validated behavior is local-only and read-only:

- No DB writes.
- No schema changes.
- No seed/import execution.
- No raw BLS commit.
- No invented aliases.
- No invented display names.
- No invented categories.
- No invented food values.
- No invented nutrient values.
- No RDA changes.
- No diary write flow.
- No MealItem creation.
- No DEV/LIVE or Supabase Cloud action.

## Result

The missing validation output for `WO-nutrition-025` is complete. The implemented preference preview and curation surfaces match the governed scope: deterministic preference preview where source-backed, explicit unresolved boundaries where mapping is not deterministic, and read-only curation visibility for the remaining Human Layer work.
