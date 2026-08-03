--
-- PostgreSQL database dump
--

\restrict eSeBYc7UfDXZ1U1QyjmGdvbCbrCsSeY6RmAzbBYgcdF5OQX468BagJqkPJc9amK

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: nutrition; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA nutrition;


ALTER SCHEMA nutrition OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: food_aliases; Type: TABLE; Schema: nutrition; Owner: postgres
--

CREATE TABLE nutrition.food_aliases (
    food_id uuid NOT NULL,
    alias text NOT NULL,
    locale text DEFAULT 'de'::text NOT NULL,
    source text DEFAULT 'editorial'::text NOT NULL,
    CONSTRAINT food_aliases_source_check CHECK ((source = ANY (ARRAY['editorial'::text, 'ai_generated'::text, 'user'::text])))
);


ALTER TABLE nutrition.food_aliases OWNER TO postgres;

--
-- Name: food_categories; Type: TABLE; Schema: nutrition; Owner: postgres
--

CREATE TABLE nutrition.food_categories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    slug text NOT NULL,
    name_de text NOT NULL,
    name_en text DEFAULT ''::text NOT NULL,
    name_th text,
    parent_id uuid,
    level integer NOT NULL,
    icon text,
    sort_order integer DEFAULT 0,
    bls_hint text,
    CONSTRAINT food_categories_level_check CHECK ((level = ANY (ARRAY[1, 2, 3, 4])))
);


ALTER TABLE nutrition.food_categories OWNER TO postgres;

--
-- Name: food_curation_candidates; Type: TABLE; Schema: nutrition; Owner: postgres
--

CREATE TABLE nutrition.food_curation_candidates (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    food_id uuid,
    target_type text NOT NULL,
    target_field text NOT NULL,
    proposed_value text DEFAULT ''::text NOT NULL,
    proposed_value_id uuid,
    source text NOT NULL,
    reason text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    reviewer text DEFAULT 'local_curation_foundation'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT food_curation_candidates_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'accepted'::text, 'rejected'::text, 'superseded'::text]))),
    CONSTRAINT food_curation_candidates_target_type_check CHECK ((target_type = ANY (ARRAY['category_assignment'::text, 'display_name'::text, 'alias'::text, 'preference_item_mapping'::text])))
);


ALTER TABLE nutrition.food_curation_candidates OWNER TO postgres;

--
-- Name: food_curation_decisions; Type: TABLE; Schema: nutrition; Owner: postgres
--

CREATE TABLE nutrition.food_curation_decisions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    candidate_id uuid NOT NULL,
    decision text NOT NULL,
    reviewer text NOT NULL,
    reason text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT food_curation_decisions_decision_check CHECK ((decision = ANY (ARRAY['accepted'::text, 'rejected'::text, 'superseded'::text])))
);


ALTER TABLE nutrition.food_curation_decisions OWNER TO postgres;

--
-- Name: food_nutrients; Type: TABLE; Schema: nutrition; Owner: postgres
--

CREATE TABLE nutrition.food_nutrients (
    food_id uuid NOT NULL,
    nutrient_code text NOT NULL,
    value numeric(12,5) NOT NULL,
    data_source text DEFAULT 'bls_4_0'::text NOT NULL
);


ALTER TABLE nutrition.food_nutrients OWNER TO postgres;

--
-- Name: food_preference_items; Type: TABLE; Schema: nutrition; Owner: postgres
--

CREATE TABLE nutrition.food_preference_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    preference text NOT NULL,
    strength text DEFAULT 'neutral'::text NOT NULL,
    target_type text NOT NULL,
    food_id uuid,
    category_id uuid,
    tag_code text,
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


ALTER TABLE nutrition.food_preference_items OWNER TO postgres;

--
-- Name: food_preferences; Type: TABLE; Schema: nutrition; Owner: postgres
--

CREATE TABLE nutrition.food_preferences (
    user_id uuid NOT NULL,
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


ALTER TABLE nutrition.food_preferences OWNER TO postgres;

--
-- Name: food_tags; Type: TABLE; Schema: nutrition; Owner: postgres
--

CREATE TABLE nutrition.food_tags (
    food_id uuid NOT NULL,
    tag_code text NOT NULL,
    confidence numeric(3,2) DEFAULT 1.0 NOT NULL,
    CONSTRAINT food_tags_confidence_check CHECK (((confidence >= (0)::numeric) AND (confidence <= (1)::numeric)))
);


ALTER TABLE nutrition.food_tags OWNER TO postgres;

--
-- Name: foods; Type: TABLE; Schema: nutrition; Owner: postgres
--

CREATE TABLE nutrition.foods (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    bls_code text NOT NULL,
    name_de text NOT NULL,
    name_en text,
    name_th text DEFAULT ''::text NOT NULL,
    name_display text,
    sort_weight integer DEFAULT 500 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    name_display_en text,
    name_display_th text,
    category_id uuid,
    processing_level text DEFAULT 'raw'::text,
    is_prepared_dish boolean DEFAULT false NOT NULL,
    CONSTRAINT foods_processing_level_check CHECK ((processing_level = ANY (ARRAY['raw'::text, 'minimally_processed'::text, 'processed'::text, 'ultra_processed'::text, 'cooked'::text, 'fermented'::text, 'smoked'::text, 'dried'::text, 'canned'::text, 'fortified'::text]))),
    CONSTRAINT foods_sort_weight_check CHECK (((sort_weight >= 0) AND (sort_weight <= 1000)))
);


ALTER TABLE nutrition.foods OWNER TO postgres;

--
-- Name: nutrient_defs; Type: TABLE; Schema: nutrition; Owner: postgres
--

CREATE TABLE nutrition.nutrient_defs (
    code text NOT NULL,
    name_de text NOT NULL,
    name_en text NOT NULL,
    unit text NOT NULL,
    group_de text NOT NULL,
    group_en text NOT NULL,
    sort_index integer NOT NULL,
    display_tier integer DEFAULT 2 NOT NULL,
    is_always_computed boolean DEFAULT false NOT NULL,
    is_partly_computed boolean DEFAULT false NOT NULL,
    formula text,
    rda_male numeric(10,3),
    rda_female numeric(10,3),
    rda_unit text,
    name_th text DEFAULT ''::text NOT NULL,
    group_th text DEFAULT ''::text NOT NULL,
    CONSTRAINT nutrient_defs_display_tier_check CHECK ((display_tier = ANY (ARRAY[1, 2, 3])))
);


ALTER TABLE nutrition.nutrient_defs OWNER TO postgres;

--
-- Name: tag_definitions; Type: TABLE; Schema: nutrition; Owner: postgres
--

CREATE TABLE nutrition.tag_definitions (
    code text NOT NULL,
    name_de text NOT NULL,
    name_en text NOT NULL,
    tag_type text NOT NULL,
    is_exclusion_relevant boolean DEFAULT false NOT NULL,
    icon text,
    sort_order integer DEFAULT 0,
    requires_macro_check boolean DEFAULT false,
    macro_rule jsonb,
    CONSTRAINT tag_definitions_tag_type_check CHECK ((tag_type = ANY (ARRAY['ingredient'::text, 'diet'::text, 'allergen'::text, 'fitness'::text, 'gym'::text, 'processing'::text])))
);


ALTER TABLE nutrition.tag_definitions OWNER TO postgres;

--
-- Name: food_aliases food_aliases_pkey; Type: CONSTRAINT; Schema: nutrition; Owner: postgres
--

ALTER TABLE ONLY nutrition.food_aliases
    ADD CONSTRAINT food_aliases_pkey PRIMARY KEY (food_id, alias, locale);


--
-- Name: food_categories food_categories_pkey; Type: CONSTRAINT; Schema: nutrition; Owner: postgres
--

ALTER TABLE ONLY nutrition.food_categories
    ADD CONSTRAINT food_categories_pkey PRIMARY KEY (id);


--
-- Name: food_categories food_categories_slug_key; Type: CONSTRAINT; Schema: nutrition; Owner: postgres
--

ALTER TABLE ONLY nutrition.food_categories
    ADD CONSTRAINT food_categories_slug_key UNIQUE (slug);


--
-- Name: food_curation_candidates food_curation_candidates_pkey; Type: CONSTRAINT; Schema: nutrition; Owner: postgres
--

ALTER TABLE ONLY nutrition.food_curation_candidates
    ADD CONSTRAINT food_curation_candidates_pkey PRIMARY KEY (id);


--
-- Name: food_curation_decisions food_curation_decisions_pkey; Type: CONSTRAINT; Schema: nutrition; Owner: postgres
--

ALTER TABLE ONLY nutrition.food_curation_decisions
    ADD CONSTRAINT food_curation_decisions_pkey PRIMARY KEY (id);


--
-- Name: food_nutrients food_nutrients_pkey; Type: CONSTRAINT; Schema: nutrition; Owner: postgres
--

ALTER TABLE ONLY nutrition.food_nutrients
    ADD CONSTRAINT food_nutrients_pkey PRIMARY KEY (food_id, nutrient_code);


--
-- Name: food_preference_items food_preference_items_pkey; Type: CONSTRAINT; Schema: nutrition; Owner: postgres
--

ALTER TABLE ONLY nutrition.food_preference_items
    ADD CONSTRAINT food_preference_items_pkey PRIMARY KEY (id);


--
-- Name: food_preferences food_preferences_pkey; Type: CONSTRAINT; Schema: nutrition; Owner: postgres
--

ALTER TABLE ONLY nutrition.food_preferences
    ADD CONSTRAINT food_preferences_pkey PRIMARY KEY (user_id);


--
-- Name: food_tags food_tags_pkey; Type: CONSTRAINT; Schema: nutrition; Owner: postgres
--

ALTER TABLE ONLY nutrition.food_tags
    ADD CONSTRAINT food_tags_pkey PRIMARY KEY (food_id, tag_code);


--
-- Name: foods foods_bls_code_key; Type: CONSTRAINT; Schema: nutrition; Owner: postgres
--

ALTER TABLE ONLY nutrition.foods
    ADD CONSTRAINT foods_bls_code_key UNIQUE (bls_code);


--
-- Name: foods foods_pkey; Type: CONSTRAINT; Schema: nutrition; Owner: postgres
--

ALTER TABLE ONLY nutrition.foods
    ADD CONSTRAINT foods_pkey PRIMARY KEY (id);


--
-- Name: nutrient_defs nutrient_defs_pkey; Type: CONSTRAINT; Schema: nutrition; Owner: postgres
--

ALTER TABLE ONLY nutrition.nutrient_defs
    ADD CONSTRAINT nutrient_defs_pkey PRIMARY KEY (code);


--
-- Name: tag_definitions tag_definitions_pkey; Type: CONSTRAINT; Schema: nutrition; Owner: postgres
--

ALTER TABLE ONLY nutrition.tag_definitions
    ADD CONSTRAINT tag_definitions_pkey PRIMARY KEY (code);


--
-- Name: food_curation_candidates_food_idx; Type: INDEX; Schema: nutrition; Owner: postgres
--

CREATE INDEX food_curation_candidates_food_idx ON nutrition.food_curation_candidates USING btree (food_id);


--
-- Name: food_curation_candidates_status_idx; Type: INDEX; Schema: nutrition; Owner: postgres
--

CREATE INDEX food_curation_candidates_status_idx ON nutrition.food_curation_candidates USING btree (status);


--
-- Name: food_curation_decisions_candidate_idx; Type: INDEX; Schema: nutrition; Owner: postgres
--

CREATE INDEX food_curation_decisions_candidate_idx ON nutrition.food_curation_decisions USING btree (candidate_id);


--
-- Name: food_nutrients_food_idx; Type: INDEX; Schema: nutrition; Owner: postgres
--

CREATE INDEX food_nutrients_food_idx ON nutrition.food_nutrients USING btree (food_id);


--
-- Name: food_nutrients_nutrient_code_idx; Type: INDEX; Schema: nutrition; Owner: postgres
--

CREATE INDEX food_nutrients_nutrient_code_idx ON nutrition.food_nutrients USING btree (nutrient_code);


--
-- Name: foods_bls_code_idx; Type: INDEX; Schema: nutrition; Owner: postgres
--

CREATE INDEX foods_bls_code_idx ON nutrition.foods USING btree (bls_code);


--
-- Name: foods_sort_weight_idx; Type: INDEX; Schema: nutrition; Owner: postgres
--

CREATE INDEX foods_sort_weight_idx ON nutrition.foods USING btree (sort_weight DESC);


--
-- Name: idx_food_aliases_alias_trgm; Type: INDEX; Schema: nutrition; Owner: postgres
--

CREATE INDEX idx_food_aliases_alias_trgm ON nutrition.food_aliases USING gin (alias public.gin_trgm_ops);


--
-- Name: idx_food_aliases_food; Type: INDEX; Schema: nutrition; Owner: postgres
--

CREATE INDEX idx_food_aliases_food ON nutrition.food_aliases USING btree (food_id);


--
-- Name: idx_food_categories_level; Type: INDEX; Schema: nutrition; Owner: postgres
--

CREATE INDEX idx_food_categories_level ON nutrition.food_categories USING btree (level);


--
-- Name: idx_food_categories_parent; Type: INDEX; Schema: nutrition; Owner: postgres
--

CREATE INDEX idx_food_categories_parent ON nutrition.food_categories USING btree (parent_id);


--
-- Name: idx_food_pref_items_category; Type: INDEX; Schema: nutrition; Owner: postgres
--

CREATE INDEX idx_food_pref_items_category ON nutrition.food_preference_items USING btree (category_id);


--
-- Name: idx_food_pref_items_tag; Type: INDEX; Schema: nutrition; Owner: postgres
--

CREATE INDEX idx_food_pref_items_tag ON nutrition.food_preference_items USING btree (tag_code);


--
-- Name: idx_food_pref_items_user; Type: INDEX; Schema: nutrition; Owner: postgres
--

CREATE INDEX idx_food_pref_items_user ON nutrition.food_preference_items USING btree (user_id);


--
-- Name: idx_food_tags_code; Type: INDEX; Schema: nutrition; Owner: postgres
--

CREATE INDEX idx_food_tags_code ON nutrition.food_tags USING btree (tag_code);


--
-- Name: idx_food_tags_food; Type: INDEX; Schema: nutrition; Owner: postgres
--

CREATE INDEX idx_food_tags_food ON nutrition.food_tags USING btree (food_id);


--
-- Name: idx_foods_category; Type: INDEX; Schema: nutrition; Owner: postgres
--

CREATE INDEX idx_foods_category ON nutrition.foods USING btree (category_id);


--
-- Name: idx_foods_name_display; Type: INDEX; Schema: nutrition; Owner: postgres
--

CREATE INDEX idx_foods_name_display ON nutrition.foods USING gin (name_display public.gin_trgm_ops);


--
-- Name: idx_foods_sort_weight; Type: INDEX; Schema: nutrition; Owner: postgres
--

CREATE INDEX idx_foods_sort_weight ON nutrition.foods USING btree (sort_weight DESC);


--
-- Name: nutrient_defs_group_sort_idx; Type: INDEX; Schema: nutrition; Owner: postgres
--

CREATE INDEX nutrient_defs_group_sort_idx ON nutrition.nutrient_defs USING btree (group_en, sort_index);


--
-- Name: food_aliases food_aliases_food_id_fkey; Type: FK CONSTRAINT; Schema: nutrition; Owner: postgres
--

ALTER TABLE ONLY nutrition.food_aliases
    ADD CONSTRAINT food_aliases_food_id_fkey FOREIGN KEY (food_id) REFERENCES nutrition.foods(id) ON DELETE CASCADE;


--
-- Name: food_categories food_categories_parent_id_fkey; Type: FK CONSTRAINT; Schema: nutrition; Owner: postgres
--

ALTER TABLE ONLY nutrition.food_categories
    ADD CONSTRAINT food_categories_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES nutrition.food_categories(id);


--
-- Name: food_curation_candidates food_curation_candidates_food_id_fkey; Type: FK CONSTRAINT; Schema: nutrition; Owner: postgres
--

ALTER TABLE ONLY nutrition.food_curation_candidates
    ADD CONSTRAINT food_curation_candidates_food_id_fkey FOREIGN KEY (food_id) REFERENCES nutrition.foods(id) ON DELETE CASCADE;


--
-- Name: food_curation_decisions food_curation_decisions_candidate_id_fkey; Type: FK CONSTRAINT; Schema: nutrition; Owner: postgres
--

ALTER TABLE ONLY nutrition.food_curation_decisions
    ADD CONSTRAINT food_curation_decisions_candidate_id_fkey FOREIGN KEY (candidate_id) REFERENCES nutrition.food_curation_candidates(id) ON DELETE CASCADE;


--
-- Name: food_nutrients food_nutrients_food_id_fkey; Type: FK CONSTRAINT; Schema: nutrition; Owner: postgres
--

ALTER TABLE ONLY nutrition.food_nutrients
    ADD CONSTRAINT food_nutrients_food_id_fkey FOREIGN KEY (food_id) REFERENCES nutrition.foods(id) ON DELETE CASCADE;


--
-- Name: food_nutrients food_nutrients_nutrient_code_fkey; Type: FK CONSTRAINT; Schema: nutrition; Owner: postgres
--

ALTER TABLE ONLY nutrition.food_nutrients
    ADD CONSTRAINT food_nutrients_nutrient_code_fkey FOREIGN KEY (nutrient_code) REFERENCES nutrition.nutrient_defs(code);


--
-- Name: food_preference_items food_preference_items_category_id_fkey; Type: FK CONSTRAINT; Schema: nutrition; Owner: postgres
--

ALTER TABLE ONLY nutrition.food_preference_items
    ADD CONSTRAINT food_preference_items_category_id_fkey FOREIGN KEY (category_id) REFERENCES nutrition.food_categories(id);


--
-- Name: food_preference_items food_preference_items_food_id_fkey; Type: FK CONSTRAINT; Schema: nutrition; Owner: postgres
--

ALTER TABLE ONLY nutrition.food_preference_items
    ADD CONSTRAINT food_preference_items_food_id_fkey FOREIGN KEY (food_id) REFERENCES nutrition.foods(id);


--
-- Name: food_preference_items food_preference_items_tag_code_fkey; Type: FK CONSTRAINT; Schema: nutrition; Owner: postgres
--

ALTER TABLE ONLY nutrition.food_preference_items
    ADD CONSTRAINT food_preference_items_tag_code_fkey FOREIGN KEY (tag_code) REFERENCES nutrition.tag_definitions(code);


--
-- Name: food_tags food_tags_food_id_fkey; Type: FK CONSTRAINT; Schema: nutrition; Owner: postgres
--

ALTER TABLE ONLY nutrition.food_tags
    ADD CONSTRAINT food_tags_food_id_fkey FOREIGN KEY (food_id) REFERENCES nutrition.foods(id) ON DELETE CASCADE;


--
-- Name: food_tags food_tags_tag_code_fkey; Type: FK CONSTRAINT; Schema: nutrition; Owner: postgres
--

ALTER TABLE ONLY nutrition.food_tags
    ADD CONSTRAINT food_tags_tag_code_fkey FOREIGN KEY (tag_code) REFERENCES nutrition.tag_definitions(code);


--
-- Name: foods foods_category_id_fkey; Type: FK CONSTRAINT; Schema: nutrition; Owner: postgres
--

ALTER TABLE ONLY nutrition.foods
    ADD CONSTRAINT foods_category_id_fkey FOREIGN KEY (category_id) REFERENCES nutrition.food_categories(id);


--
-- Name: food_aliases; Type: ROW SECURITY; Schema: nutrition; Owner: postgres
--

ALTER TABLE nutrition.food_aliases ENABLE ROW LEVEL SECURITY;

--
-- Name: food_aliases food_aliases_select; Type: POLICY; Schema: nutrition; Owner: postgres
--

CREATE POLICY food_aliases_select ON nutrition.food_aliases FOR SELECT TO authenticated USING (true);


--
-- Name: food_categories; Type: ROW SECURITY; Schema: nutrition; Owner: postgres
--

ALTER TABLE nutrition.food_categories ENABLE ROW LEVEL SECURITY;

--
-- Name: food_categories food_categories_select; Type: POLICY; Schema: nutrition; Owner: postgres
--

CREATE POLICY food_categories_select ON nutrition.food_categories FOR SELECT TO authenticated USING (true);


--
-- Name: food_curation_candidates; Type: ROW SECURITY; Schema: nutrition; Owner: postgres
--

ALTER TABLE nutrition.food_curation_candidates ENABLE ROW LEVEL SECURITY;

--
-- Name: food_curation_decisions; Type: ROW SECURITY; Schema: nutrition; Owner: postgres
--

ALTER TABLE nutrition.food_curation_decisions ENABLE ROW LEVEL SECURITY;

--
-- Name: food_nutrients; Type: ROW SECURITY; Schema: nutrition; Owner: postgres
--

ALTER TABLE nutrition.food_nutrients ENABLE ROW LEVEL SECURITY;

--
-- Name: food_nutrients food_nutrients_select; Type: POLICY; Schema: nutrition; Owner: postgres
--

CREATE POLICY food_nutrients_select ON nutrition.food_nutrients FOR SELECT TO authenticated USING (true);


--
-- Name: food_preference_items; Type: ROW SECURITY; Schema: nutrition; Owner: postgres
--

ALTER TABLE nutrition.food_preference_items ENABLE ROW LEVEL SECURITY;

--
-- Name: food_preference_items food_preference_items_delete; Type: POLICY; Schema: nutrition; Owner: postgres
--

CREATE POLICY food_preference_items_delete ON nutrition.food_preference_items FOR DELETE TO authenticated USING ((auth.uid() = user_id));


--
-- Name: food_preference_items food_preference_items_insert; Type: POLICY; Schema: nutrition; Owner: postgres
--

CREATE POLICY food_preference_items_insert ON nutrition.food_preference_items FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));


--
-- Name: food_preference_items food_preference_items_select; Type: POLICY; Schema: nutrition; Owner: postgres
--

CREATE POLICY food_preference_items_select ON nutrition.food_preference_items FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: food_preference_items food_preference_items_update; Type: POLICY; Schema: nutrition; Owner: postgres
--

CREATE POLICY food_preference_items_update ON nutrition.food_preference_items FOR UPDATE TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: food_preferences; Type: ROW SECURITY; Schema: nutrition; Owner: postgres
--

ALTER TABLE nutrition.food_preferences ENABLE ROW LEVEL SECURITY;

--
-- Name: food_preferences food_preferences_delete; Type: POLICY; Schema: nutrition; Owner: postgres
--

CREATE POLICY food_preferences_delete ON nutrition.food_preferences FOR DELETE TO authenticated USING ((auth.uid() = user_id));


--
-- Name: food_preferences food_preferences_insert; Type: POLICY; Schema: nutrition; Owner: postgres
--

CREATE POLICY food_preferences_insert ON nutrition.food_preferences FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));


--
-- Name: food_preferences food_preferences_select; Type: POLICY; Schema: nutrition; Owner: postgres
--

CREATE POLICY food_preferences_select ON nutrition.food_preferences FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: food_preferences food_preferences_update; Type: POLICY; Schema: nutrition; Owner: postgres
--

CREATE POLICY food_preferences_update ON nutrition.food_preferences FOR UPDATE TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: food_tags; Type: ROW SECURITY; Schema: nutrition; Owner: postgres
--

ALTER TABLE nutrition.food_tags ENABLE ROW LEVEL SECURITY;

--
-- Name: food_tags food_tags_select; Type: POLICY; Schema: nutrition; Owner: postgres
--

CREATE POLICY food_tags_select ON nutrition.food_tags FOR SELECT TO authenticated USING (true);


--
-- Name: foods; Type: ROW SECURITY; Schema: nutrition; Owner: postgres
--

ALTER TABLE nutrition.foods ENABLE ROW LEVEL SECURITY;

--
-- Name: foods foods_select; Type: POLICY; Schema: nutrition; Owner: postgres
--

CREATE POLICY foods_select ON nutrition.foods FOR SELECT TO authenticated USING (true);


--
-- Name: nutrient_defs; Type: ROW SECURITY; Schema: nutrition; Owner: postgres
--

ALTER TABLE nutrition.nutrient_defs ENABLE ROW LEVEL SECURITY;

--
-- Name: nutrient_defs nutrient_defs_select; Type: POLICY; Schema: nutrition; Owner: postgres
--

CREATE POLICY nutrient_defs_select ON nutrition.nutrient_defs FOR SELECT TO authenticated USING (true);


--
-- Name: tag_definitions; Type: ROW SECURITY; Schema: nutrition; Owner: postgres
--

ALTER TABLE nutrition.tag_definitions ENABLE ROW LEVEL SECURITY;

--
-- Name: tag_definitions tag_definitions_select; Type: POLICY; Schema: nutrition; Owner: postgres
--

CREATE POLICY tag_definitions_select ON nutrition.tag_definitions FOR SELECT TO authenticated USING (true);


--
-- Name: SCHEMA nutrition; Type: ACL; Schema: -; Owner: postgres
--

GRANT USAGE ON SCHEMA nutrition TO authenticated;
GRANT USAGE ON SCHEMA nutrition TO service_role;


--
-- Name: TABLE food_aliases; Type: ACL; Schema: nutrition; Owner: postgres
--

GRANT SELECT ON TABLE nutrition.food_aliases TO authenticated;
GRANT ALL ON TABLE nutrition.food_aliases TO service_role;


--
-- Name: TABLE food_categories; Type: ACL; Schema: nutrition; Owner: postgres
--

GRANT SELECT ON TABLE nutrition.food_categories TO authenticated;
GRANT ALL ON TABLE nutrition.food_categories TO service_role;


--
-- Name: TABLE food_curation_candidates; Type: ACL; Schema: nutrition; Owner: postgres
--

GRANT ALL ON TABLE nutrition.food_curation_candidates TO service_role;


--
-- Name: TABLE food_curation_decisions; Type: ACL; Schema: nutrition; Owner: postgres
--

GRANT ALL ON TABLE nutrition.food_curation_decisions TO service_role;


--
-- Name: TABLE food_nutrients; Type: ACL; Schema: nutrition; Owner: postgres
--

GRANT SELECT ON TABLE nutrition.food_nutrients TO authenticated;
GRANT ALL ON TABLE nutrition.food_nutrients TO service_role;


--
-- Name: TABLE food_preference_items; Type: ACL; Schema: nutrition; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE nutrition.food_preference_items TO authenticated;
GRANT ALL ON TABLE nutrition.food_preference_items TO service_role;


--
-- Name: TABLE food_preferences; Type: ACL; Schema: nutrition; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE nutrition.food_preferences TO authenticated;
GRANT ALL ON TABLE nutrition.food_preferences TO service_role;


--
-- Name: TABLE food_tags; Type: ACL; Schema: nutrition; Owner: postgres
--

GRANT SELECT ON TABLE nutrition.food_tags TO authenticated;
GRANT ALL ON TABLE nutrition.food_tags TO service_role;


--
-- Name: TABLE foods; Type: ACL; Schema: nutrition; Owner: postgres
--

GRANT SELECT ON TABLE nutrition.foods TO authenticated;
GRANT ALL ON TABLE nutrition.foods TO service_role;


--
-- Name: TABLE nutrient_defs; Type: ACL; Schema: nutrition; Owner: postgres
--

GRANT SELECT ON TABLE nutrition.nutrient_defs TO authenticated;
GRANT ALL ON TABLE nutrition.nutrient_defs TO service_role;


--
-- Name: TABLE tag_definitions; Type: ACL; Schema: nutrition; Owner: postgres
--

GRANT SELECT ON TABLE nutrition.tag_definitions TO authenticated;
GRANT ALL ON TABLE nutrition.tag_definitions TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: nutrition; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA nutrition GRANT SELECT ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA nutrition GRANT ALL ON TABLES TO service_role;


--
-- PostgreSQL database dump complete
--

\unrestrict eSeBYc7UfDXZ1U1QyjmGdvbCbrCsSeY6RmAzbBYgcdF5OQX468BagJqkPJc9amK

