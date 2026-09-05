-- 411 -- MealCam-Rezeptvorschlaege fuer die Admin-Kuration (E-66)
--
-- Ein Rezept ist keine Food-Feldmutation: Es besitzt eine geordnete Liste
-- aus Zutaten und Mengen. Der Snapshot bleibt nach Aenderung oder Loeschen
-- des Nutzerrezepts pruefbar; recipe_id ist deshalb nur eine optionale Spur.

\set ON_ERROR_STOP on

BEGIN;

CREATE TABLE IF NOT EXISTS nutrition.recipe_curation_candidates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id uuid REFERENCES nutrition.recipes(id) ON DELETE SET NULL,
  recipe_owner_id uuid NOT NULL,
  name_de text NOT NULL CHECK (length(btrim(name_de)) >= 2),
  description text,
  instructions text,
  cuisine_code text,
  cooking_skill text,
  prep_time_min integer CHECK (prep_time_min IS NULL OR prep_time_min >= 0),
  cook_time_min integer CHECK (cook_time_min IS NULL OR cook_time_min >= 0),
  servings numeric(8,3) NOT NULL CHECK (servings > 0),
  tags text[] NOT NULL DEFAULT '{}'::text[],
  submitted_via text NOT NULL DEFAULT 'mealcam' CHECK (submitted_via = 'mealcam'),
  reason text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'rejected', 'superseded')),
  reviewer text NOT NULL DEFAULT 'mealcam_submission',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS recipe_curation_candidates_status_idx
  ON nutrition.recipe_curation_candidates(status, created_at);

CREATE INDEX IF NOT EXISTS recipe_curation_candidates_recipe_idx
  ON nutrition.recipe_curation_candidates(recipe_id);

DROP TRIGGER IF EXISTS recipe_curation_candidates_touch_updated_at
  ON nutrition.recipe_curation_candidates;
CREATE TRIGGER recipe_curation_candidates_touch_updated_at
  BEFORE UPDATE ON nutrition.recipe_curation_candidates
  FOR EACH ROW EXECUTE FUNCTION nutrition.touch_updated_at();

CREATE TABLE IF NOT EXISTS nutrition.recipe_curation_candidate_ingredients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid NOT NULL REFERENCES nutrition.recipe_curation_candidates(id) ON DELETE CASCADE,
  sort_order integer NOT NULL CHECK (sort_order >= 0),
  food_source text NOT NULL CHECK (food_source IN ('bls', 'custom')),
  food_id uuid REFERENCES nutrition.foods(id) ON DELETE SET NULL,
  custom_food_id uuid REFERENCES nutrition.foods_custom(id) ON DELETE SET NULL,
  food_name_snapshot text NOT NULL CHECK (length(btrim(food_name_snapshot)) > 0),
  amount_g numeric(10,2) NOT NULL CHECK (amount_g > 0),
  portion_name text,
  portion_quantity numeric(10,3),
  portion_amount_g numeric(10,2),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS recipe_curation_candidate_ingredients_candidate_idx
  ON nutrition.recipe_curation_candidate_ingredients(candidate_id, sort_order, id);

CREATE TABLE IF NOT EXISTS nutrition.recipe_curation_decisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid NOT NULL REFERENCES nutrition.recipe_curation_candidates(id) ON DELETE CASCADE,
  decision text NOT NULL CHECK (decision IN ('accepted', 'rejected', 'superseded')),
  reviewer text NOT NULL,
  reason text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS recipe_curation_decisions_candidate_idx
  ON nutrition.recipe_curation_decisions(candidate_id);

ALTER TABLE nutrition.recipe_curation_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition.recipe_curation_candidate_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition.recipe_curation_decisions ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON
  nutrition.recipe_curation_candidates,
  nutrition.recipe_curation_candidate_ingredients,
  nutrition.recipe_curation_decisions
TO authenticated;

GRANT ALL ON
  nutrition.recipe_curation_candidates,
  nutrition.recipe_curation_candidate_ingredients,
  nutrition.recipe_curation_decisions
TO service_role;

DROP POLICY IF EXISTS recipe_curation_candidates_select_admin
  ON nutrition.recipe_curation_candidates;
CREATE POLICY recipe_curation_candidates_select_admin
  ON nutrition.recipe_curation_candidates
  FOR SELECT TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS recipe_curation_candidate_ingredients_select_admin
  ON nutrition.recipe_curation_candidate_ingredients;
CREATE POLICY recipe_curation_candidate_ingredients_select_admin
  ON nutrition.recipe_curation_candidate_ingredients
  FOR SELECT TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS recipe_curation_decisions_select_admin
  ON nutrition.recipe_curation_decisions;
CREATE POLICY recipe_curation_decisions_select_admin
  ON nutrition.recipe_curation_decisions
  FOR SELECT TO authenticated USING (public.is_admin());

COMMENT ON TABLE nutrition.recipe_curation_candidates IS
  'C-411/E-66: eigenstaendige MealCam-Rezeptvorschlaege fuer die Admin-Kuration; kein target_type in food_curation_candidates.';
COMMENT ON TABLE nutrition.recipe_curation_candidate_ingredients IS
  'C-411/E-66: geordneter Zutaten- und Mengensnapshot eines Rezeptkandidaten; kein proposed_value-Text.';
COMMENT ON COLUMN nutrition.recipe_curation_candidates.submitted_via IS
  'C-411/E-66: Herkunft des Kurationsvorschlags, getrennt von recipes.source. Der Recipe-source-Wert mealcam ist nur vorgeschlagen, nicht entschieden.';

COMMIT;
