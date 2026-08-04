import fs from 'node:fs'
import path from 'node:path'

import { getNutritionPreferenceCatalog, summarizePreferenceCatalog } from '../../../apps/web/src/lib/nutrition/preferences-catalog'

function sql(value: string): string {
  return `'${value.replace(/'/g, "''")}'`
}

export function buildPreferencesFoundationSql(): string {
  return `-- P1-005 Local Nutrition Preferences + Human Layer Curation Foundation
-- LOCAL ONLY. Do not apply to DEV/LIVE.
-- Source refs:
-- - docs/specs/Nutrition/01_current_specs/SPEC_01_MODULE_CONTRACT.md
-- - docs/specs/Nutrition/01_current_specs/SPEC_02_ENTITIES.md
-- - docs/specs/Nutrition/01_current_specs/SPEC_03_USER_FLOWS.md
-- - docs/specs/Nutrition/01_current_specs/SPEC_04_FEATURES.md
-- - docs/specs/Nutrition/01_current_specs/SPEC_05_FOOD_TAXONOMY.md
-- - docs/specs/Nutrition/01_current_specs/SPEC_06_DATABASE_SCHEMA.md
-- - docs/specs/Nutrition/01_current_specs/SPEC_07_API.md
-- - docs/specs/Nutrition/01_current_specs/SPEC_10_COMPONENTS.md
-- Boundary: preferences schema foundation only. No user preference writes, diary logging, MealItem creation, or Smart Search application.

BEGIN;

CREATE TABLE IF NOT EXISTS nutrition.food_preferences (
  user_id UUID PRIMARY KEY,
  diet_type TEXT DEFAULT 'omnivore'
    CHECK (diet_type IN ('omnivore','pescatarian','vegetarian','vegan','keto','paleo','mediterranean','custom')),
  allergies TEXT[] DEFAULT '{}',
  intolerances TEXT[] DEFAULT '{}',
  general_exclusions TEXT[] DEFAULT '{}',
  preferred_cuisines TEXT[] DEFAULT '{}',
  meals_per_day INTEGER DEFAULT 3 CHECK (meals_per_day IN (2,3,4,5,6)),
  snacks_per_day INTEGER DEFAULT 1 CHECK (snacks_per_day IN (0,1,2,3)),
  cooking_skill TEXT DEFAULT 'intermediate'
    CHECK (cooking_skill IN ('beginner','intermediate','advanced')),
  prep_time_max_min INTEGER DEFAULT 30 CHECK (prep_time_max_min IN (15,20,30,45,60)),
  budget_level TEXT DEFAULT 'medium'
    CHECK (budget_level IN ('low','medium','high','no_limit')),
  meal_prep_ok BOOLEAN DEFAULT false,
  planner_notes TEXT DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE nutrition.food_preferences
  ADD COLUMN IF NOT EXISTS general_exclusions TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS meals_per_day INTEGER DEFAULT 3,
  ADD COLUMN IF NOT EXISTS snacks_per_day INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS meal_prep_ok BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS planner_notes TEXT DEFAULT '';

ALTER TABLE nutrition.food_preferences ENABLE ROW LEVEL SECURITY;
DO $policy$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'nutrition'
      AND tablename = 'food_preferences'
      AND policyname = 'food_prefs_owner'
  ) THEN
    CREATE POLICY food_prefs_owner ON nutrition.food_preferences
      USING (auth.uid()::text = user_id::text);
  END IF;
END
$policy$;

CREATE TABLE IF NOT EXISTS nutrition.food_preference_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  preference TEXT NOT NULL CHECK (preference IN ('liked','disliked','hard_exclude')),
  strength TEXT NOT NULL DEFAULT 'neutral'
    CHECK (strength IN ('hard_exclude','strong_avoid','soft_dislike','neutral','like','boost')),
  target_type TEXT NOT NULL CHECK (target_type IN ('food','category','tag','cuisine','exclusion_preset','catalog_item')),
  food_id UUID REFERENCES nutrition.foods(id),
  category_id UUID REFERENCES nutrition.food_categories(id),
  tag_code TEXT REFERENCES nutrition.tag_definitions(code),
  cuisine_code TEXT,
  exclusion_preset_code TEXT,
  catalog_item_code TEXT,
  source TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT food_preference_items_exactly_one_target CHECK (
    (food_id IS NOT NULL)::int +
    (category_id IS NOT NULL)::int +
    (tag_code IS NOT NULL)::int +
    (NULLIF(cuisine_code, '') IS NOT NULL)::int +
    (NULLIF(exclusion_preset_code, '') IS NOT NULL)::int +
    (NULLIF(catalog_item_code, '') IS NOT NULL)::int = 1
  )
);

ALTER TABLE nutrition.food_preference_items
  ADD COLUMN IF NOT EXISTS strength TEXT NOT NULL DEFAULT 'neutral',
  ADD COLUMN IF NOT EXISTS cuisine_code TEXT,
  ADD COLUMN IF NOT EXISTS exclusion_preset_code TEXT,
  ADD COLUMN IF NOT EXISTS catalog_item_code TEXT,
  ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'user';

CREATE INDEX IF NOT EXISTS idx_food_pref_items_user ON nutrition.food_preference_items(user_id);
CREATE INDEX IF NOT EXISTS idx_food_pref_items_category ON nutrition.food_preference_items(category_id);
CREATE INDEX IF NOT EXISTS idx_food_pref_items_tag ON nutrition.food_preference_items(tag_code);

ALTER TABLE nutrition.food_preference_items ENABLE ROW LEVEL SECURITY;
DO $policy$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'nutrition'
      AND tablename = 'food_preference_items'
      AND policyname = 'food_pref_items_owner'
  ) THEN
    CREATE POLICY food_pref_items_owner ON nutrition.food_preference_items
      USING (auth.uid()::text = user_id::text);
  END IF;
END
$policy$;

COMMIT;
`
}

export function buildPreferencesValidationSql(): string {
  const catalog = getNutritionPreferenceCatalog()
  const summary = summarizePreferenceCatalog(catalog)
  return `-- P1-005 Local Nutrition Preferences Foundation Validation
SELECT 'food_preferences_exists', (to_regclass('nutrition.food_preferences') IS NOT NULL)::text;
SELECT 'food_preference_items_exists', (to_regclass('nutrition.food_preference_items') IS NOT NULL)::text;
SELECT 'food_preferences_rows', COUNT(*)::text FROM nutrition.food_preferences;
SELECT 'food_preference_items_rows', COUNT(*)::text FROM nutrition.food_preference_items;
SELECT 'preference_catalog_diet_types', ${summary.diet_types}::text;
SELECT 'preference_catalog_allergies_intolerances', ${summary.allergies_intolerances}::text;
SELECT 'preference_catalog_general_exclusions', ${summary.general_exclusions}::text;
SELECT 'preference_catalog_cuisines', ${summary.cuisines}::text;
SELECT 'preference_catalog_food_groups', ${summary.food_preference_groups}::text;
SELECT 'preference_catalog_food_items', ${summary.food_preference_items}::text;
SELECT 'mapped_general_exclusions', ${summary.mapped_general_exclusions}::text;
SELECT 'unresolved_general_exclusions', ${summary.unresolved_general_exclusions}::text;
SELECT 'orphan_preference_categories', COUNT(*)::text
FROM nutrition.food_preference_items fpi
WHERE fpi.category_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM nutrition.food_categories fc WHERE fc.id = fpi.category_id);
SELECT 'orphan_preference_tags', COUNT(*)::text
FROM nutrition.food_preference_items fpi
WHERE fpi.tag_code IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM nutrition.tag_definitions td WHERE td.code = fpi.tag_code);
`
}

export function buildPreferencesReport(): string {
  const catalog = getNutritionPreferenceCatalog()
  const summary = summarizePreferenceCatalog(catalog)
  const mappedExclusions = catalog.general_exclusions.filter(item => item.mapping_status === 'mapped')
  const unresolvedExclusions = catalog.general_exclusions.filter(item => item.mapping_status !== 'mapped')
  return `# P1-005 Local Nutrition Preferences + Human Layer Curation Foundation

Status: \`LOCAL_ONLY_APPLIED\`

## Scope

This slice creates the local Nutrition Preferences schema foundation and a
read-only preference catalog/API/preview. It does not persist real user
preferences, enable Smart Search filtering, build diary logging, create
MealItems, or write DEV/LIVE.

## Screenshot Requirements Coverage

| Requirement | Coverage |
|---|---|
| Diet type | Catalogued: ${summary.diet_types} options |
| Allergies / intolerances | Catalogued as hard constraints: ${summary.allergies_intolerances} options |
| General exclusions | Catalogued: ${summary.general_exclusions} presets |
| Likes/dislikes on foods/categories/tags | Catalogued as ${summary.food_preference_groups} groups and ${summary.food_preference_items} items; item-level food mapping remains curation-gated |
| Preferred cuisines | Catalogued: ${summary.cuisines} options |
| Meal structure | Catalogued: meals/day 2-6 and snacks/day 0-3 |
| Cooking level | Catalogued: beginner/intermediate/advanced |
| Prep time | Catalogued: 15/20/30/45/60 minutes |
| Meal prep | Added local schema field \`meal_prep_ok\` |
| Budget | Catalogued and schema-backed: low/medium/high/no_limit |
| Planner notes | Added local schema field \`planner_notes\` |
| Preference strength/conflicts | Patched into local boundary: hard_exclude/strong_avoid/soft_dislike/neutral/like/boost |
| Smart Search implication | Documented only; application deferred until deterministic mappings are ready |

## Spec Gap Patch

The current specs cover the core tables, API, components, and Smart Search
scoring. The old platform screenshots make these fields more explicit and are
captured by \`docs/project/p1-005/P1-005-preferences-spec-gap-patch.md\`:

- general exclusion presets
- exact cuisine code list
- meal/snack counts
- \`meal_prep_ok\`
- \`planner_notes\`
- preference strength model
- mapping from UI catalog items to food/category/tag/cuisine/exclusion targets

## Local DB Foundation

Applied local-only SQL:

- \`docs/project/p1-005/P1-005-local-preferences-foundation.sql\`

Created/extended local tables:

- \`nutrition.food_preferences\`
- \`nutrition.food_preference_items\`

No rows are inserted for real users in this slice.

## Catalog Summary

| Catalog area | Count |
|---|---:|
| Diet types | ${summary.diet_types} |
| Allergies / intolerances | ${summary.allergies_intolerances} |
| General exclusions | ${summary.general_exclusions} |
| Cuisines | ${summary.cuisines} |
| Preference groups | ${summary.food_preference_groups} |
| Preference items | ${summary.food_preference_items} |

## Mapped vs Unresolved

Mapped general exclusions:

${mappedExclusions.map(item => `- \`${item.code}\` -> ${item.mapped_target_type}: ${(item.mapped_codes ?? []).map(code => `\`${code}\``).join(', ')}`).join('\n')}

Unresolved general exclusions:

${unresolvedExclusions.map(item => `- \`${item.code}\`: ${item.mapping_note ?? 'requires future deterministic mapping'}`).join('\n')}

Food preference item rows from the old UI are kept as a curation catalog. They
are not forced to BLS \`food_id\` values because exact deterministic matches are
not guaranteed. Group-level deterministic category mappings are recorded where
safe; item-level mappings require a future curated/admin workflow.

## Smart Search Boundary

- hard exclusions remove foods only after deterministic category/tag/food
  mappings exist
- allergies and general exclusions are hard constraints
- likes boost ranking
- dislikes lower ranking unless configured as hard exclusions
- priority is food > category > tag
- cuisines remain catalog values until curated/source-backed cuisine mappings
  exist

## Validation

Run:

\`\`\`powershell
cmd.exe /c "docker cp docs\\project\\p1-005\\P1-005-local-preferences-foundation-validation.sql supabase_db_LumeOS-Claude-V1:/tmp/P1-005-local-preferences-foundation-validation.sql && docker exec supabase_db_LumeOS-Claude-V1 psql -U postgres -d postgres -At -f /tmp/P1-005-local-preferences-foundation-validation.sql"
\`\`\`
`
}

export function generatePreferencesFoundation(repoRoot = process.cwd()) {
  const outDir = path.join(repoRoot, 'docs/project/p1-005')
  fs.mkdirSync(outDir, { recursive: true })
  const sqlPath = path.join(outDir, 'P1-005-local-preferences-foundation.sql')
  const validationPath = path.join(outDir, 'P1-005-local-preferences-foundation-validation.sql')
  const reportPath = path.join(outDir, 'P1-005-local-preferences-foundation-report.md')
  fs.writeFileSync(sqlPath, buildPreferencesFoundationSql(), 'utf8')
  fs.writeFileSync(validationPath, buildPreferencesValidationSql(), 'utf8')
  fs.writeFileSync(reportPath, buildPreferencesReport(), 'utf8')
  return {
    status: 'generated',
    migration_sql: path.relative(repoRoot, sqlPath).replace(/\\/g, '/'),
    validation_sql: path.relative(repoRoot, validationPath).replace(/\\/g, '/'),
    report: path.relative(repoRoot, reportPath).replace(/\\/g, '/'),
    summary: summarizePreferenceCatalog(),
  }
}

if (import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  console.log(JSON.stringify(generatePreferencesFoundation(), null, 2))
}
