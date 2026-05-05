# Local Supabase Transaction Dry-run Report

Date: 2026-05-05

## 1. Scope

This report documents Tom-approved local-only transaction validation of the committed Nutrition migrations against the existing local Supabase database.

Safety boundaries:

- Local database only: `127.0.0.1:54322`.
- No production database access.
- No `supabase db reset`.
- No `supabase db push`.
- No `supabase migration up`.
- No import.
- No BLS data load.
- No `COMMIT`.
- The dry-run was executed in one `psql` session and ended with explicit `ROLLBACK`.

## 2. Commands Run

Read-only preflight:

- `git status --short --branch`
- `git branch --show-current`
- `SELECT` nutrition schema existence
- `SELECT` Nutrition migration history entries
- `SELECT` governance table existence

Transaction dry-run:

- Copied the two committed migration files into the local Supabase DB container as temporary files.
- Copied a temporary dry-run SQL driver into the local Supabase DB container.
- Executed one local `psql` session with:
  - `BEGIN`
  - migration 001 SQL
  - migration 002 SQL
  - validation `SELECT`s
  - `ROLLBACK`

Read-only post-check:

- `SELECT` nutrition schema existence
- `SELECT` migration history
- `SELECT` governance table existence

No Supabase migration command was run.

## 3. Migration Files Tested

| Order | File | Result |
| ---: | --- | --- |
| 1 | `supabase/migrations/20240522_001_nutrition_schema_foundation.sql` | succeeded inside transaction |
| 2 | `supabase/migrations/20240522_002_nutrition_food_core_tables.sql` | succeeded inside transaction |

## 4. Preflight Read-only State

| Check | Result |
| --- | --- |
| Git branch | `main` |
| Git worktree before report | clean |
| Local DB target | `127.0.0.1:54322/postgres` |
| Production URL involved | no |
| `nutrition` schema existed before dry-run | no |
| Nutrition migration history entries existed before dry-run | no |
| Public governance tables existed before dry-run | yes |

Governance tables found:

| Schema | Table |
| --- | --- |
| `public` | `execution_tokens` |
| `public` | `governance_artefacts` |
| `public` | `wo_failure_events` |
| `public` | `workorders` |

## 5. Transaction Result

| Step | Result |
| --- | --- |
| `BEGIN` | succeeded |
| Migration 001 | succeeded |
| Migration 002 | succeeded |
| Validation `SELECT`s | succeeded |
| `ROLLBACK` | executed |

Notices:

- `pgcrypto` extension already existed and was skipped.
- `nutrition` schema creation in migration 002 observed the schema created by migration 001 inside the same transaction and skipped duplicate creation.

No SQL errors were reported.

## 6. Validation Results Inside Transaction

### Nutrition Schema

| Check | Result |
| --- | --- |
| `nutrition` schema exists | true |

### Nutrition Tables

Tables visible inside the transaction:

| Table |
| --- |
| `food_aliases` |
| `food_categories` |
| `food_nutrients` |
| `food_tags` |
| `foods` |
| `nutrient_defs` |
| `tag_definitions` |

### Seed Counts

| Check | Result | Expected |
| --- | ---: | ---: |
| `nutrition.nutrient_defs` count | 138 | 138 |
| `nutrition.tag_definitions` count | 16 | 16 |

### RLS

RLS was enabled on all seven Nutrition tables:

| Table | RLS Enabled |
| --- | --- |
| `food_aliases` | true |
| `food_categories` | true |
| `food_nutrients` | true |
| `food_tags` | true |
| `foods` | true |
| `nutrient_defs` | true |
| `tag_definitions` | true |

### Policies

Seven SELECT policies were visible for authenticated role access:

| Table | Policy | Command | Roles |
| --- | --- | --- | --- |
| `food_aliases` | `food_aliases_select` | `SELECT` | `authenticated` |
| `food_categories` | `food_categories_select` | `SELECT` | `authenticated` |
| `food_nutrients` | `food_nutrients_select` | `SELECT` | `authenticated` |
| `food_tags` | `food_tags_select` | `SELECT` | `authenticated` |
| `foods` | `foods_select_all` | `SELECT` | `authenticated` |
| `nutrient_defs` | `nutrient_defs_select` | `SELECT` | `authenticated` |
| `tag_definitions` | `tag_defs_select` | `SELECT` | `authenticated` |

### Indexes

Twenty-one Nutrition indexes were visible inside the transaction:

| Table | Index |
| --- | --- |
| `food_aliases` | `food_aliases_pkey` |
| `food_aliases` | `idx_food_aliases_alias_trgm` |
| `food_categories` | `food_categories_pkey` |
| `food_categories` | `food_categories_slug_key` |
| `food_categories` | `idx_food_categories_level` |
| `food_categories` | `idx_food_categories_parent` |
| `food_nutrients` | `food_nutrients_pkey` |
| `food_nutrients` | `idx_food_nutrients_code` |
| `food_nutrients` | `idx_food_nutrients_food` |
| `food_tags` | `food_tags_pkey` |
| `food_tags` | `idx_food_tags_code` |
| `food_tags` | `idx_food_tags_food` |
| `foods` | `foods_bls_code_key` |
| `foods` | `foods_pkey` |
| `foods` | `idx_foods_bls_code` |
| `foods` | `idx_foods_category` |
| `foods` | `idx_foods_name_de_trgm` |
| `foods` | `idx_foods_name_display` |
| `foods` | `idx_foods_sort_weight` |
| `nutrient_defs` | `nutrient_defs_pkey` |
| `tag_definitions` | `tag_definitions_pkey` |

### Unexpected Public Writes

`pg_stat_user_tables` estimates outside `nutrition` remained `0` rows for public governance tables during validation:

| Table | Estimated Rows |
| --- | ---: |
| `public.execution_tokens` | 0 |
| `public.governance_artefacts` | 0 |
| `public.wo_failure_events` | 0 |
| `public.workorders` | 0 |

## 7. Rollback

`ROLLBACK` was explicitly executed and reported by `psql`.

Rollback marker observed:

```text
DRY_RUN_ROLLBACK_EXECUTED
```

No `COMMIT` was executed.

## 8. Post-Rollback State

Read-only post-check results:

| Check | Result |
| --- | --- |
| `nutrition` schema exists after rollback | false |
| Local migration history after rollback | `20260423120000 control_plane_tables` only |
| Public governance tables still present | yes |

Governance tables after rollback:

| Schema | Table |
| --- | --- |
| `public` | `execution_tokens` |
| `public` | `governance_artefacts` |
| `public` | `wo_failure_events` |
| `public` | `workorders` |

## 9. Errors

No SQL errors were reported during the transaction dry-run.

## 10. Recommendation

The committed Nutrition migrations passed the local transaction dry-run and rolled back cleanly.

Recommended next step: Tom may approve a cloned-local-DB validation or an explicit additive local apply plan. Direct additive apply to the main local DB should still require a separate explicit approval.
