--
-- PostgreSQL database dump
--

\restrict CLd0XFkMyvPFcXRw7O7cPnfMc2v8EXpl8QkxtLmA3PmgPdKdsYoNYXrPvfPPniG

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

SET default_tablespace = '';

SET default_table_access_method = heap;

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
-- Name: food_preference_items food_pref_items_owner; Type: POLICY; Schema: nutrition; Owner: postgres
--

CREATE POLICY food_pref_items_owner ON nutrition.food_preference_items USING (((auth.uid())::text = (user_id)::text));


--
-- Name: food_preference_items; Type: ROW SECURITY; Schema: nutrition; Owner: postgres
--

ALTER TABLE nutrition.food_preference_items ENABLE ROW LEVEL SECURITY;

--
-- Name: food_preferences; Type: ROW SECURITY; Schema: nutrition; Owner: postgres
--

ALTER TABLE nutrition.food_preferences ENABLE ROW LEVEL SECURITY;

--
-- Name: food_preferences food_prefs_owner; Type: POLICY; Schema: nutrition; Owner: postgres
--

CREATE POLICY food_prefs_owner ON nutrition.food_preferences USING (((auth.uid())::text = (user_id)::text));


--
-- PostgreSQL database dump complete
--

\unrestrict CLd0XFkMyvPFcXRw7O7cPnfMc2v8EXpl8QkxtLmA3PmgPdKdsYoNYXrPvfPPniG

