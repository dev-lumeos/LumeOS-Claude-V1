# Nutrition Schema Design: Missing Tables

**Branch:** `feat/design-missing-nutrition-core-schema`
**Date:** 2026-03-28
**Status:** DESIGN READY

---

## Current State

### Confirmed Working Tables (nutrition schema)

| Table | Purpose | Status |
|-------|---------|--------|
| `foods` | Food database with macros per 100g | WORKING |
| `nutrient_components` | Nutrient definitions | WORKING |
| `food_nutrients` | Food-nutrient values | WORKING |
| `food_portions` | Predefined portions per food | WORKING |
| `diary_days` | Daily diary container with pre-computed totals | WORKING |
| `diary_entries` | Individual food logs per day | WORKING |
| `water_entries` | Water intake logs | WORKING |

### Missing Tables (confirmed needed for complete nutrition module)

| Table | Purpose | Priority |
|-------|---------|----------|
| `recipes` | User-created recipes (composite foods) | P1 |
| `recipe_items` | Ingredients within a recipe | P1 |
| `weight_logs` | Body weight tracking history | P2 |
| `user_targets` | Current nutrition targets per user | P2 |
| `user_target_logs` | Append-only history of target changes | P2 |

---

## 1. RECIPES TABLE

### Why Needed

Users need to create custom recipes (e.g., "My Protein Smoothie") that:
- Combine multiple foods into a single loggable item
- Calculate aggregated macros automatically
- Can be logged to the diary like any other food
- Support portion scaling (e.g., "1 serving = 1/4 of recipe")

Without recipes, users must log each ingredient separately every time, which is unusable for daily meal tracking.

### Schema Design

```sql
-- =============================================================================
-- nutrition.recipes
-- =============================================================================
-- User-created composite foods (recipes).
-- Macros are pre-computed from recipe_items for fast retrieval.

CREATE TABLE nutrition.recipes (
  -- Identity
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Metadata
  name            TEXT NOT NULL,
  description     TEXT,
  servings        NUMERIC(6,2) NOT NULL DEFAULT 1,  -- How many servings the recipe makes

  -- Pre-computed totals (per full recipe)
  total_weight_g      NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_energy_kcal   NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_energy_kj     NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_protein_g     NUMERIC(10,3) NOT NULL DEFAULT 0,
  total_fat_g         NUMERIC(10,3) NOT NULL DEFAULT 0,
  total_carbs_g       NUMERIC(10,3) NOT NULL DEFAULT 0,
  total_fiber_g       NUMERIC(10,3) NOT NULL DEFAULT 0,
  total_sugar_g       NUMERIC(10,3) NOT NULL DEFAULT 0,

  -- Per-serving macros (computed: total / servings)
  serving_weight_g    NUMERIC(10,2) GENERATED ALWAYS AS (total_weight_g / NULLIF(servings, 0)) STORED,
  serving_energy_kcal NUMERIC(10,2) GENERATED ALWAYS AS (total_energy_kcal / NULLIF(servings, 0)) STORED,
  serving_protein_g   NUMERIC(10,3) GENERATED ALWAYS AS (total_protein_g / NULLIF(servings, 0)) STORED,
  serving_fat_g       NUMERIC(10,3) GENERATED ALWAYS AS (total_fat_g / NULLIF(servings, 0)) STORED,
  serving_carbs_g     NUMERIC(10,3) GENERATED ALWAYS AS (total_carbs_g / NULLIF(servings, 0)) STORED,

  -- Status
  is_active       BOOLEAN NOT NULL DEFAULT true,
  is_public       BOOLEAN NOT NULL DEFAULT false,  -- Future: sharing

  -- Timestamps
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_recipes_user_id ON nutrition.recipes(user_id);
CREATE INDEX idx_recipes_user_active ON nutrition.recipes(user_id, is_active) WHERE is_active = true;

-- RLS
ALTER TABLE nutrition.recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own recipes"
  ON nutrition.recipes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recipes"
  ON nutrition.recipes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recipes"
  ON nutrition.recipes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own recipes"
  ON nutrition.recipes FOR DELETE
  USING (auth.uid() = user_id);
```

### Design Decisions

1. **Pre-computed totals**: Macros are stored on the recipe row (not computed at query time) for performance. Updated via trigger when recipe_items change.

2. **Generated serving columns**: PostgreSQL computed columns for per-serving values. Eliminates division bugs in application code.

3. **`servings` field**: Allows "this recipe makes 4 servings" so users can log "1 serving" rather than calculating fractions.

4. **No `category` field**: Omitted to avoid scope creep. Can be added later if needed.

5. **No `image_url` field**: Omitted. Not required for core functionality.

---

## 2. RECIPE_ITEMS TABLE

### Why Needed

A recipe is composed of multiple food items with specific amounts. This table stores the ingredients.

### Schema Design

```sql
-- =============================================================================
-- nutrition.recipe_items
-- =============================================================================
-- Ingredients within a recipe.
-- Each item references a food and specifies an amount.

CREATE TABLE nutrition.recipe_items (
  -- Identity
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id       UUID NOT NULL REFERENCES nutrition.recipes(id) ON DELETE CASCADE,
  food_id         UUID NOT NULL REFERENCES nutrition.foods(id) ON DELETE RESTRICT,

  -- Amount
  amount_grams    NUMERIC(10,2) NOT NULL,

  -- Pre-computed macros for this item (food macros * amount_grams / 100)
  energy_kcal     NUMERIC(10,2) NOT NULL DEFAULT 0,
  energy_kj       NUMERIC(10,2) NOT NULL DEFAULT 0,
  protein_g       NUMERIC(10,3) NOT NULL DEFAULT 0,
  fat_g           NUMERIC(10,3) NOT NULL DEFAULT 0,
  carbs_g         NUMERIC(10,3) NOT NULL DEFAULT 0,
  fiber_g         NUMERIC(10,3) NOT NULL DEFAULT 0,
  sugar_g         NUMERIC(10,3) NOT NULL DEFAULT 0,

  -- Order
  sort_order      INTEGER NOT NULL DEFAULT 0,

  -- Timestamps
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_recipe_items_recipe_id ON nutrition.recipe_items(recipe_id);

-- RLS (inherits from recipe via FK, but explicit policy for clarity)
ALTER TABLE nutrition.recipe_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own recipe items"
  ON nutrition.recipe_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM nutrition.recipes r
      WHERE r.id = recipe_items.recipe_id AND r.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own recipe items"
  ON nutrition.recipe_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM nutrition.recipes r
      WHERE r.id = recipe_items.recipe_id AND r.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own recipe items"
  ON nutrition.recipe_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM nutrition.recipes r
      WHERE r.id = recipe_items.recipe_id AND r.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own recipe items"
  ON nutrition.recipe_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM nutrition.recipes r
      WHERE r.id = recipe_items.recipe_id AND r.user_id = auth.uid()
    )
  );
```

### Trigger: Update Recipe Totals

```sql
-- =============================================================================
-- Trigger: Recalculate recipe totals when items change
-- =============================================================================

CREATE OR REPLACE FUNCTION nutrition.recalculate_recipe_totals()
RETURNS TRIGGER AS $$
BEGIN
  -- Determine which recipe_id to update
  DECLARE
    target_recipe_id UUID;
  BEGIN
    IF TG_OP = 'DELETE' THEN
      target_recipe_id := OLD.recipe_id;
    ELSE
      target_recipe_id := NEW.recipe_id;
    END IF;

    -- Recalculate totals from all items
    UPDATE nutrition.recipes
    SET
      total_weight_g = COALESCE((
        SELECT SUM(amount_grams) FROM nutrition.recipe_items WHERE recipe_id = target_recipe_id
      ), 0),
      total_energy_kcal = COALESCE((
        SELECT SUM(energy_kcal) FROM nutrition.recipe_items WHERE recipe_id = target_recipe_id
      ), 0),
      total_energy_kj = COALESCE((
        SELECT SUM(energy_kj) FROM nutrition.recipe_items WHERE recipe_id = target_recipe_id
      ), 0),
      total_protein_g = COALESCE((
        SELECT SUM(protein_g) FROM nutrition.recipe_items WHERE recipe_id = target_recipe_id
      ), 0),
      total_fat_g = COALESCE((
        SELECT SUM(fat_g) FROM nutrition.recipe_items WHERE recipe_id = target_recipe_id
      ), 0),
      total_carbs_g = COALESCE((
        SELECT SUM(carbs_g) FROM nutrition.recipe_items WHERE recipe_id = target_recipe_id
      ), 0),
      total_fiber_g = COALESCE((
        SELECT SUM(fiber_g) FROM nutrition.recipe_items WHERE recipe_id = target_recipe_id
      ), 0),
      total_sugar_g = COALESCE((
        SELECT SUM(sugar_g) FROM nutrition.recipe_items WHERE recipe_id = target_recipe_id
      ), 0),
      updated_at = now()
    WHERE id = target_recipe_id;

    RETURN COALESCE(NEW, OLD);
  END;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_recipe_items_recalculate
  AFTER INSERT OR UPDATE OR DELETE ON nutrition.recipe_items
  FOR EACH ROW
  EXECUTE FUNCTION nutrition.recalculate_recipe_totals();
```

### Design Decisions

1. **Pre-computed macros per item**: Stored on insert/update to avoid repeated food lookups.

2. **ON DELETE RESTRICT for food_id**: Prevents deleting a food that's used in recipes. Alternative: ON DELETE CASCADE (would orphan recipes).

3. **No `portion_id` field**: Items use `amount_grams` directly. If a user picks "1 cup", the service converts to grams before insert.

4. **`sort_order`**: Allows users to order ingredients (e.g., by importance or cooking order).

---

## 3. WEIGHT_LOGS TABLE

### Why Needed

Weight tracking is essential for:
- TDEE calculation accuracy
- Goal progress monitoring (cut/bulk tracking)
- Historical trend analysis
- Body composition insights (when combined with body fat %)

Without weight logs, the app cannot track progress toward body composition goals.

### Schema Design

```sql
-- =============================================================================
-- nutrition.weight_logs
-- =============================================================================
-- User body weight history.
-- Used for TDEE adjustments and goal tracking.

CREATE TABLE nutrition.weight_logs (
  -- Identity
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Measurement
  logged_date     DATE NOT NULL,
  weight_kg       NUMERIC(5,2) NOT NULL,  -- Max 999.99 kg
  body_fat_pct    NUMERIC(4,1),           -- Optional: 0.0 - 99.9%

  -- Context (optional)
  notes           TEXT,
  source          TEXT DEFAULT 'manual',  -- 'manual', 'scale_sync', 'import'

  -- Timestamps
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_weight_logs_user_date ON nutrition.weight_logs(user_id, logged_date DESC);
CREATE UNIQUE INDEX idx_weight_logs_user_date_unique ON nutrition.weight_logs(user_id, logged_date);

-- RLS
ALTER TABLE nutrition.weight_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own weight logs"
  ON nutrition.weight_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own weight logs"
  ON nutrition.weight_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own weight logs"
  ON nutrition.weight_logs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own weight logs"
  ON nutrition.weight_logs FOR DELETE
  USING (auth.uid() = user_id);
```

### Design Decisions

1. **`logged_date` (DATE)**: One entry per day. If user logs multiple times, they update or we keep latest.

2. **UNIQUE constraint on (user_id, logged_date)**: Enforces one weight per day. Service layer can implement "update or insert" logic.

3. **`body_fat_pct` optional**: Advanced metric, not required for basic tracking.

4. **`source` field**: Distinguishes manual entry from potential future integrations (smart scales, imports).

5. **No `unit` field**: Always stored as kg. Conversion to lbs happens in the presentation layer.

6. **No `time` field**: Weight should be logged at consistent time (e.g., morning fasted), but we don't enforce time storage.

---

## 4. USER_TARGETS TABLE

### Why Needed

Users need persistent daily nutrition targets for:
- Displaying progress bars (consumed vs. target)
- Scoring daily adherence
- Adjusting targets when goals change (cut → maintain → bulk)

Without persisted targets, the app must recalculate TDEE on every request, and users cannot override computed values.

### Table Name Choice: `user_targets`

| Candidate | Rejected Because |
|-----------|-----------------|
| `nutrition_targets` | Redundant prefix (already in nutrition schema) |
| `nutrition_goals` | Conflicts with pm schema naming; "goals" implies long-term objectives |
| `daily_targets` | Implies per-day storage; this is current-state |
| `macro_targets` | Too narrow (includes water, fiber) |
| **`user_targets`** | **CHOSEN**: Clear ownership, minimal, describes what it stores |

### Current + Historical

**Decision: Two tables**

1. `user_targets` = current active row per user (fast reads)
2. `user_target_logs` = append-only history (traceability)

Rationale:
- Progress must be traceable over time
- Historical targets cannot be reliably reconstructed (user may override computed values)
- Logs enable: "What were my targets when I lost 5kg last month?"

### Schema Design

```sql
-- =============================================================================
-- nutrition.user_targets
-- =============================================================================
-- Current nutrition targets for a user.
-- One row per user (current-only, not historical).
-- Stores both computed TDEE and user-adjustable targets.

CREATE TABLE nutrition.user_targets (
  -- Identity (PK = user_id, one row per user)
  user_id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- TDEE calculation inputs (snapshot at time of last calculation)
  weight_kg       NUMERIC(5,2) NOT NULL,
  height_cm       NUMERIC(5,1) NOT NULL,
  age             INTEGER NOT NULL,
  sex             TEXT NOT NULL CHECK (sex IN ('male', 'female')),
  activity_level  TEXT NOT NULL CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'active', 'very_active')),

  -- TDEE outputs
  bmr             INTEGER NOT NULL,           -- Basal Metabolic Rate
  tdee            INTEGER NOT NULL,           -- Total Daily Energy Expenditure

  -- Goal adjustment
  goal            TEXT NOT NULL DEFAULT 'maintain' CHECK (goal IN ('cut', 'maintain', 'lean_bulk', 'bulk')),
  calorie_adjustment INTEGER NOT NULL DEFAULT 0,  -- e.g., -500 for cut

  -- Final targets (TDEE + adjustment, then macro split)
  calories        INTEGER NOT NULL,
  protein_g       INTEGER NOT NULL,
  carbs_g         INTEGER NOT NULL,
  fat_g           INTEGER NOT NULL,
  fiber_g         INTEGER NOT NULL DEFAULT 30,
  water_ml        INTEGER NOT NULL DEFAULT 2800,

  -- Timestamps
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- No additional index needed; user_id is PK

-- RLS
ALTER TABLE nutrition.user_targets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own targets"
  ON nutrition.user_targets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own targets"
  ON nutrition.user_targets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own targets"
  ON nutrition.user_targets FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own targets"
  ON nutrition.user_targets FOR DELETE
  USING (auth.uid() = user_id);
```

### Design Decisions

1. **`user_id` as PK**: Enforces exactly one row per user. No separate `id` column needed.

2. **Snapshot of inputs**: Stores `weight_kg`, `height_cm`, etc. at calculation time. If user updates profile, targets don't auto-change until recalculated.

3. **Separate `tdee` and `calories`**: `tdee` is the computed maintenance value. `calories` = `tdee` + `calorie_adjustment`. User sees both.

4. **INTEGER for targets**: Grams/ml precision is sufficient. No decimals needed for daily targets.

5. **CHECK constraints for enums**: `sex`, `activity_level`, `goal` are constrained at DB level.

6. **No `is_active` flag**: One row per user, always active. Delete to clear.

7. **`fiber_g` and `water_ml` defaults**: Common recommendations (30g fiber, 2.8L water). User can override.

### Workflow

1. User completes onboarding or updates profile
2. Service calculates BMR → TDEE → applies goal adjustment
3. Service upserts `user_targets` row
4. Service appends to `user_target_logs` (see section 5)
5. Diary and scoring services read from `user_targets`

---

## 5. USER_TARGET_LOGS TABLE

### Why Needed

Progress traceability requires knowing what targets were active at any point in time:
- "What were my targets when I started my cut?"
- "How have my targets changed over the past 6 months?"
- Auditing for coaching/support scenarios

### Relationship to user_targets

| Table | Purpose | Cardinality |
|-------|---------|-------------|
| `user_targets` | Current active snapshot | 1 per user |
| `user_target_logs` | Append-only history | Many per user |

**Workflow:**
1. When `user_targets` is inserted or updated, a log entry is appended to `user_target_logs`
2. Logs are immutable (INSERT only, no UPDATE/DELETE by application)
3. The most recent log entry should match `user_targets` current values

### Schema Design

```sql
-- =============================================================================
-- nutrition.user_target_logs
-- =============================================================================
-- Append-only history of target changes.
-- Each row is a snapshot of targets at a point in time.

CREATE TABLE nutrition.user_target_logs (
  -- Identity
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- TDEE calculation inputs (snapshot)
  weight_kg       NUMERIC(5,2) NOT NULL,
  height_cm       NUMERIC(5,1) NOT NULL,
  age             INTEGER NOT NULL,
  sex             TEXT NOT NULL,
  activity_level  TEXT NOT NULL,

  -- TDEE outputs
  bmr             INTEGER NOT NULL,
  tdee            INTEGER NOT NULL,

  -- Goal
  goal            TEXT NOT NULL,
  calorie_adjustment INTEGER NOT NULL,

  -- Final targets
  calories        INTEGER NOT NULL,
  protein_g       INTEGER NOT NULL,
  carbs_g         INTEGER NOT NULL,
  fat_g           INTEGER NOT NULL,
  fiber_g         INTEGER NOT NULL,
  water_ml        INTEGER NOT NULL,

  -- Change context
  source          TEXT NOT NULL DEFAULT 'user',  -- 'user', 'onboarding', 'recalc', 'import'
  reason          TEXT,                          -- Optional: "Goal changed to cut", "Weight updated"

  -- Timestamp (when this target became active)
  effective_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_user_target_logs_user_effective
  ON nutrition.user_target_logs(user_id, effective_at DESC);

-- RLS
ALTER TABLE nutrition.user_target_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own target logs"
  ON nutrition.user_target_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own target logs"
  ON nutrition.user_target_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- NOTE: No UPDATE or DELETE policies - logs are append-only
```

### Design Decisions

1. **Separate `id` column**: Unlike `user_targets`, logs need unique IDs for each entry.

2. **No FK to `user_targets`**: Logs are independent snapshots. If `user_targets` row is deleted, logs remain for historical reference.

3. **No CHECK constraints on enums**: Logs preserve whatever value was active at the time, even if enums change later.

4. **`source` field**: Tracks what triggered the change:
   - `user`: Manual user edit
   - `onboarding`: Initial setup
   - `recalc`: Automatic recalculation (e.g., after weight log)
   - `import`: Data migration/import

5. **`reason` field**: Optional human-readable context for debugging/support.

6. **`effective_at`**: When this target became active. Defaults to now(), but could be backdated for imports.

7. **No UPDATE/DELETE RLS policies**: Enforces append-only at the policy level. Service layer should also enforce this.

8. **Index on (user_id, effective_at DESC)**: Optimizes "get latest N targets for user" queries.

### Trigger: Auto-log on user_targets change

```sql
-- =============================================================================
-- Trigger: Log target changes automatically
-- =============================================================================

CREATE OR REPLACE FUNCTION nutrition.log_target_change()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO nutrition.user_target_logs (
    user_id, weight_kg, height_cm, age, sex, activity_level,
    bmr, tdee, goal, calorie_adjustment,
    calories, protein_g, carbs_g, fat_g, fiber_g, water_ml,
    source, reason, effective_at
  ) VALUES (
    NEW.user_id, NEW.weight_kg, NEW.height_cm, NEW.age, NEW.sex, NEW.activity_level,
    NEW.bmr, NEW.tdee, NEW.goal, NEW.calorie_adjustment,
    NEW.calories, NEW.protein_g, NEW.carbs_g, NEW.fat_g, NEW.fiber_g, NEW.water_ml,
    'user',  -- Default source; service can override via separate insert
    CASE
      WHEN TG_OP = 'INSERT' THEN 'Initial targets set'
      ELSE 'Targets updated'
    END,
    now()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_user_targets_log
  AFTER INSERT OR UPDATE ON nutrition.user_targets
  FOR EACH ROW
  EXECUTE FUNCTION nutrition.log_target_change();
```

**Note:** The trigger provides automatic logging. For more granular `source` and `reason` values, the service layer can:
1. Disable trigger temporarily, OR
2. Insert to `user_target_logs` manually with specific values, then update `user_targets`

---

---

## 6. NUTRITION HISTORY MODEL

### Principle

Progress must be traceable over time. The system must support real historical analysis for:
- Meals (what was eaten)
- Macros (protein, carbs, fat, calories)
- Micros (vitamins, minerals)
- Targets (what goals were active)

Do not rely on reconstructing everything from mutable source data.

### History Coverage

| Data Type | Raw Logs (Events) | Daily Snapshots (Aggregated) |
|-----------|-------------------|------------------------------|
| **Meals** | `diary_entries` | — |
| **Macros** | `diary_entries.*_g` | `diary_days.total_*` |
| **Micros** | `diary_entries.nutrients_snapshot` | `diary_days.nutrients_snapshot` |
| **Water** | `water_entries` | `diary_days.total_water_drink_ml` |
| **Targets** | `user_target_logs` | `diary_days.target_*` (NEW) |
| **Weight** | `weight_logs` | — |

### Tables as Raw Logs (Immutable)

| Table | What It Logs | Notes |
|-------|-------------|-------|
| `diary_entries` | Food items logged | Pre-computed macros/micros frozen at log time |
| `water_entries` | Water intake events | Amount frozen at log time |
| `weight_logs` | Body weight | One per day |
| `user_target_logs` | Target changes | Append-only history |

### Tables as Daily Snapshots

| Table | Snapshot Fields |
|-------|-----------------|
| `diary_days` | `total_*` (macros), `nutrients_snapshot` (micros), `target_*` (NEW) |

### Required Addition: Target Snapshot on diary_days

**Problem:** Cannot answer "Did I hit my protein target on March 15th?" without knowing what the target was on that day.

**Solution:** Add target snapshot fields to `diary_days`:

```sql
-- =============================================================================
-- ALTER nutrition.diary_days - Add target snapshot fields
-- =============================================================================
-- These fields capture the user's targets at the time the diary day was created.
-- Frozen for historical accuracy - not updated if targets change later.

ALTER TABLE nutrition.diary_days
  ADD COLUMN IF NOT EXISTS target_calories    INTEGER,
  ADD COLUMN IF NOT EXISTS target_protein_g   INTEGER,
  ADD COLUMN IF NOT EXISTS target_carbs_g     INTEGER,
  ADD COLUMN IF NOT EXISTS target_fat_g       INTEGER,
  ADD COLUMN IF NOT EXISTS target_fiber_g     INTEGER,
  ADD COLUMN IF NOT EXISTS target_water_ml    INTEGER;
```

**Workflow:**
1. When `getOrCreateDiaryDay()` creates a new row, copy current values from `user_targets`
2. Values are frozen for that day
3. Mid-day target changes do NOT update existing diary_days

---

## Summary: Proposed Changes

### Tables to Create

| Table | Schema | Priority | Migration |
|-------|--------|----------|-----------|
| `recipes` | nutrition | P1 | `001_create_recipes.sql` |
| `recipe_items` | nutrition | P1 | `001_create_recipes.sql` |
| `weight_logs` | nutrition | P2 | `002_create_weight_logs.sql` |
| `user_targets` | nutrition | P2 | `003_create_user_targets.sql` |
| `user_target_logs` | nutrition | P2 | `003_create_user_targets.sql` |

### Tables to Alter

| Table | Change | Migration |
|-------|--------|-----------|
| `diary_days` | Add `target_*` columns | `004_add_diary_days_targets.sql` |

---

## Migration Files

After approval, create:
1. `supabase/migrations/001_create_recipes.sql` - recipes + recipe_items + trigger
2. `supabase/migrations/002_create_weight_logs.sql` - weight_logs
3. `supabase/migrations/003_create_user_targets.sql` - user_targets + user_target_logs + trigger
4. `supabase/migrations/004_add_diary_days_targets.sql` - ALTER diary_days add target_* columns

---

## Grants (add to 001_schema_access.sql)

```sql
-- NUTRITION.RECIPES (user data - authenticated only)
GRANT SELECT, INSERT, UPDATE, DELETE ON nutrition.recipes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON nutrition.recipes TO service_role;

-- NUTRITION.RECIPE_ITEMS (user data - authenticated only)
GRANT SELECT, INSERT, UPDATE, DELETE ON nutrition.recipe_items TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON nutrition.recipe_items TO service_role;

-- NUTRITION.WEIGHT_LOGS (user data - authenticated only)
GRANT SELECT, INSERT, UPDATE, DELETE ON nutrition.weight_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON nutrition.weight_logs TO service_role;

-- NUTRITION.USER_TARGETS (user data - authenticated only)
GRANT SELECT, INSERT, UPDATE, DELETE ON nutrition.user_targets TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON nutrition.user_targets TO service_role;

-- NUTRITION.USER_TARGET_LOGS (user data - append-only for users)
GRANT SELECT, INSERT ON nutrition.user_target_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON nutrition.user_target_logs TO service_role;
```

---

## What Changed vs. Previous Design

| Item | Previous | Revised |
|------|----------|---------|
| `nutrition_targets` | DEFER (use pm.nutrition_goals) | **CREATE as `nutrition.user_targets`** |
| pm schema dependency | Expected pm.nutrition_goals | **Removed** - nutrition is self-contained |
| Target history | Current-only | **Added `user_target_logs`** (append-only) |
| Table name | `nutrition_targets` | **`user_targets`** + **`user_target_logs`** |

---

## Open Questions

1. **Recipe nesting**: Should recipes support other recipes as ingredients? (Recommended: NO for v1)
2. **Recipe sharing**: Should `is_public` recipes be queryable by other users? (Recommended: DEFER)
3. **Weight log frequency**: Allow multiple entries per day? (Recommended: NO, one per day)

---

## Final Status

**DESIGN READY**

All five tables are fully specified:
- `nutrition.recipes`
- `nutrition.recipe_items`
- `nutrition.weight_logs`
- `nutrition.user_targets`
- `nutrition.user_target_logs`

Next step: Create migration SQL files upon approval.
