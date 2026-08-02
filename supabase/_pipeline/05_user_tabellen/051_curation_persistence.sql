-- P1-005 local-only curation persistence foundation.
--
-- Scope:
-- - Creates auditable local tables for future human/admin curation review.
-- - Supports category assignment, display-name, alias, and preference-item mapping decisions.
-- - Does not mutate nutrition.foods, nutrition.food_aliases, nutrition.food_categories,
--   nutrition.food_preferences, or nutrition.food_preference_items.
-- - Does not create human-friendly names or aliases.
-- - Local Supabase/Test DB only. Do not run against DEV or LIVE.

CREATE TABLE IF NOT EXISTS nutrition.food_curation_candidates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  food_id uuid REFERENCES nutrition.foods(id) ON DELETE CASCADE,
  target_type text NOT NULL CHECK (target_type IN ('category_assignment', 'display_name', 'alias', 'preference_item_mapping')),
  target_field text NOT NULL,
  proposed_value text NOT NULL DEFAULT '',
  proposed_value_id uuid NULL,
  source text NOT NULL,
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'superseded')),
  reviewer text NOT NULL DEFAULT 'local_curation_foundation',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS food_curation_candidates_food_idx
  ON nutrition.food_curation_candidates(food_id);

CREATE INDEX IF NOT EXISTS food_curation_candidates_status_idx
  ON nutrition.food_curation_candidates(status);

CREATE TABLE IF NOT EXISTS nutrition.food_curation_decisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid NOT NULL REFERENCES nutrition.food_curation_candidates(id) ON DELETE CASCADE,
  decision text NOT NULL CHECK (decision IN ('accepted', 'rejected', 'superseded')),
  reviewer text NOT NULL,
  reason text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS food_curation_decisions_candidate_idx
  ON nutrition.food_curation_decisions(candidate_id);
