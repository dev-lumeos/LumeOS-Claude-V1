-- STATUS: DRAFT — NICHT ANWENDEN (Job D-12, Rückbau 2026-08-02)
-- Die beiden Preference-Tabellen, die bislang in KEINER Migrationsdatei
-- stehen (verwaiste Tabellen 1+2 von 4). Quelle: pg_dump 2026-08-01
-- (backup/rescue/2026-08-01_verwaiste_tabellen.sql), RLS und Policies am
-- 2026-08-02 per pg_policies gegenverifiziert.
-- Vermutliche historische Quelle des DDL:
-- docs/project/p1-005/P1-005-local-preferences-foundation.sql [annahme].
--
-- Die einzigen zwei RLS-Policies der gesamten Datenbank liegen hier und
-- nutzen auth.uid() — faktische Vorentscheidung Richtung Supabase-Auth
-- (ADR-002/ADR-003 nachdokumentieren, offene Frage O-3). Sie werden hier
-- 1:1 reproduziert, nicht bewertet.
-- Hinweis: Die Policies haben KEINE Rollenbindung (kein TO authenticated)
-- und keinen expliziten Befehl (FOR ALL implizit) — exakt wie im Container.

-- UP

CREATE TABLE nutrition.food_preferences (
    user_id uuid PRIMARY KEY,
    diet_type text DEFAULT 'omnivore'::text,
    allergies text[] DEFAULT '{}'::text[],
    intolerances text[] DEFAULT '{}'::text[],
    general_exclusions text[] DEFAULT '{}'::text[],
    preferred_cuisines text[] DEFAULT '{}'::text[],
    meals_per_day integer DEFAULT 3,
    snacks_per_day integer DEFAULT 1,
    cooking_skill text DEFAULT 'intermediate'::text,
    prep_time_max_min integer DEFAULT 30,
    budget_level text DEFAULT 'medium'::text,
    meal_prep_ok boolean DEFAULT false,
    planner_notes text DEFAULT ''::text,
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT food_preferences_budget_level_check CHECK ((budget_level = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text, 'no_limit'::text]))),
    CONSTRAINT food_preferences_cooking_skill_check CHECK ((cooking_skill = ANY (ARRAY['beginner'::text, 'intermediate'::text, 'advanced'::text]))),
    CONSTRAINT food_preferences_diet_type_check CHECK ((diet_type = ANY (ARRAY['omnivore'::text, 'pescatarian'::text, 'vegetarian'::text, 'vegan'::text, 'keto'::text, 'paleo'::text, 'mediterranean'::text, 'custom'::text]))),
    CONSTRAINT food_preferences_meals_per_day_check CHECK ((meals_per_day = ANY (ARRAY[2, 3, 4, 5, 6]))),
    CONSTRAINT food_preferences_prep_time_max_min_check CHECK ((prep_time_max_min = ANY (ARRAY[15, 20, 30, 45, 60]))),
    CONSTRAINT food_preferences_snacks_per_day_check CHECK ((snacks_per_day = ANY (ARRAY[0, 1, 2, 3])))
);

CREATE TABLE nutrition.food_preference_items (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL,
    preference text NOT NULL,
    strength text DEFAULT 'neutral'::text NOT NULL,
    target_type text NOT NULL,
    food_id uuid REFERENCES nutrition.foods(id),
    category_id uuid REFERENCES nutrition.food_categories(id),
    tag_code text REFERENCES nutrition.tag_definitions(code),
    cuisine_code text,
    exclusion_preset_code text,
    catalog_item_code text,
    source text DEFAULT 'user'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT food_preference_items_exactly_one_target CHECK (((((((((food_id IS NOT NULL))::integer + ((category_id IS NOT NULL))::integer) + ((tag_code IS NOT NULL))::integer) + ((NULLIF(cuisine_code, ''::text) IS NOT NULL))::integer) + ((NULLIF(exclusion_preset_code, ''::text) IS NOT NULL))::integer) + ((NULLIF(catalog_item_code, ''::text) IS NOT NULL))::integer) = 1)),
    CONSTRAINT food_preference_items_preference_check CHECK ((preference = ANY (ARRAY['liked'::text, 'disliked'::text, 'hard_exclude'::text]))),
    CONSTRAINT food_preference_items_strength_check CHECK ((strength = ANY (ARRAY['hard_exclude'::text, 'strong_avoid'::text, 'soft_dislike'::text, 'neutral'::text, 'like'::text, 'boost'::text]))),
    CONSTRAINT food_preference_items_target_type_check CHECK ((target_type = ANY (ARRAY['food'::text, 'category'::text, 'tag'::text, 'cuisine'::text, 'exclusion_preset'::text, 'catalog_item'::text])))
);

CREATE INDEX idx_food_pref_items_category ON nutrition.food_preference_items USING btree (category_id);
CREATE INDEX idx_food_pref_items_tag ON nutrition.food_preference_items USING btree (tag_code);
CREATE INDEX idx_food_pref_items_user ON nutrition.food_preference_items USING btree (user_id);

ALTER TABLE nutrition.food_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition.food_preference_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY food_prefs_owner ON nutrition.food_preferences USING (((auth.uid())::text = (user_id)::text));
CREATE POLICY food_pref_items_owner ON nutrition.food_preference_items USING (((auth.uid())::text = (user_id)::text));

-- DOWN (Rollback)
-- DROP POLICY IF EXISTS food_pref_items_owner ON nutrition.food_preference_items;
-- DROP POLICY IF EXISTS food_prefs_owner ON nutrition.food_preferences;
-- DROP TABLE IF EXISTS nutrition.food_preference_items;
-- DROP TABLE IF EXISTS nutrition.food_preferences;
