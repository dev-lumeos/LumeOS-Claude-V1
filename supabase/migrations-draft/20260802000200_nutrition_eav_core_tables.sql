-- STATUS: DRAFT — NICHT ANWENDEN (Job D-12, Rückbau 2026-08-02)
-- Die 7 EAV-Core-Tabellen exakt in der Gestalt, die der Container am
-- 2026-08-02 tatsächlich hat (Quelle: pg_dump 2026-08-01, Spalten/Indizes/
-- RLS am 2026-08-02 per docker exec psql gegenverifiziert).
--
-- BEWUSSTE Abweichungen zur historischen Migration 20240522_002 — der
-- Container hat diese Objekte NICHT, sie werden hier deshalb NICHT angelegt:
--   - keine 11 denormalisierten Makro-Spalten auf `foods` (enercc, prot625, …)
--   - keine Funktion nutrition.auto_tag_food(), kein Trigger trg_foods_auto_tag
--   - keine trgm-GIN-Indizes (pg_trgm fehlt im Container)
--   - kein RLS, keine Policies auf diesen 7 Tabellen (offene Frage O-3)
--   - keine Grants an authenticated / service_role (offene Frage O-2)
-- Zusätzlich enthalten, weil im Container vorhanden:
--   - name_th / group_th auf nutrient_defs (aus Slice 20260513_002)
--   - name_th, name_display_en, name_display_th, category_id,
--     processing_level, is_prepared_dish auf foods (aus
--     docs/project/p1-005/P1-005-local-food-human-layer.sql)
--   - DOPPELTER Index auf foods(sort_weight DESC): foods_sort_weight_idx UND
--     idx_foods_sort_weight existieren beide im Container. Beide werden
--     reproduziert, damit reset == Ist. Offene Frage O-4 (einen droppen?).
--
-- Seeds (138 nutrient_defs, 16 tag_definitions, 518 Kategorien, 7.140 foods,
-- 698.092 food_nutrients, …) sind DATEN, nicht Struktur — sie kommen aus
-- backup/data/, nicht aus dieser Migration. Offene Frage O-5 (Seed-Strategie).

-- UP

-- 1. nutrient_defs — Attribut-Katalog des EAV
CREATE TABLE nutrition.nutrient_defs (
    code text PRIMARY KEY,
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

CREATE INDEX nutrient_defs_group_sort_idx ON nutrition.nutrient_defs USING btree (group_en, sort_index);

-- 2. food_categories — Hierarchie (4 Ebenen, self-reference)
CREATE TABLE nutrition.food_categories (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    slug text NOT NULL UNIQUE,
    name_de text NOT NULL,
    name_en text DEFAULT ''::text NOT NULL,
    name_th text,
    parent_id uuid REFERENCES nutrition.food_categories(id),
    level integer NOT NULL,
    icon text,
    sort_order integer DEFAULT 0,
    bls_hint text,
    CONSTRAINT food_categories_level_check CHECK ((level = ANY (ARRAY[1, 2, 3, 4])))
);

CREATE INDEX idx_food_categories_level ON nutrition.food_categories USING btree (level);
CREATE INDEX idx_food_categories_parent ON nutrition.food_categories USING btree (parent_id);

-- 3. foods — Entity-Tabelle (14 Spalten, KEINE Makro-Spalten)
CREATE TABLE nutrition.foods (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    bls_code text NOT NULL UNIQUE,
    name_de text NOT NULL,
    name_en text,
    name_th text DEFAULT ''::text NOT NULL,
    name_display text,
    sort_weight integer DEFAULT 500 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    name_display_en text,
    name_display_th text,
    category_id uuid REFERENCES nutrition.food_categories(id),
    processing_level text DEFAULT 'raw'::text,
    is_prepared_dish boolean DEFAULT false NOT NULL,
    CONSTRAINT foods_processing_level_check CHECK ((processing_level = ANY (ARRAY['raw'::text, 'minimally_processed'::text, 'processed'::text, 'ultra_processed'::text, 'cooked'::text, 'fermented'::text, 'smoked'::text, 'dried'::text, 'canned'::text, 'fortified'::text]))),
    CONSTRAINT foods_sort_weight_check CHECK (((sort_weight >= 0) AND (sort_weight <= 1000)))
);

CREATE INDEX foods_bls_code_idx ON nutrition.foods USING btree (bls_code);
CREATE INDEX foods_sort_weight_idx ON nutrition.foods USING btree (sort_weight DESC);
CREATE INDEX idx_foods_category ON nutrition.foods USING btree (category_id);
-- Duplikat zu foods_sort_weight_idx — im Container vorhanden, daher reproduziert (O-4):
CREATE INDEX idx_foods_sort_weight ON nutrition.foods USING btree (sort_weight DESC);

-- 4. food_nutrients — EAV-Kern
CREATE TABLE nutrition.food_nutrients (
    food_id uuid NOT NULL REFERENCES nutrition.foods(id) ON DELETE CASCADE,
    nutrient_code text NOT NULL REFERENCES nutrition.nutrient_defs(code),
    value numeric(12,5) NOT NULL,
    data_source text DEFAULT 'bls_4_0'::text NOT NULL,
    PRIMARY KEY (food_id, nutrient_code)
);

CREATE INDEX food_nutrients_food_idx ON nutrition.food_nutrients USING btree (food_id);
CREATE INDEX food_nutrients_nutrient_code_idx ON nutrition.food_nutrients USING btree (nutrient_code);

-- 5. food_aliases
CREATE TABLE nutrition.food_aliases (
    food_id uuid NOT NULL REFERENCES nutrition.foods(id) ON DELETE CASCADE,
    alias text NOT NULL,
    locale text DEFAULT 'de'::text NOT NULL,
    source text DEFAULT 'editorial'::text NOT NULL,
    CONSTRAINT food_aliases_source_check CHECK ((source = ANY (ARRAY['editorial'::text, 'ai_generated'::text, 'user'::text]))),
    PRIMARY KEY (food_id, alias, locale)
);

CREATE INDEX idx_food_aliases_food ON nutrition.food_aliases USING btree (food_id);

-- 6. tag_definitions
CREATE TABLE nutrition.tag_definitions (
    code text PRIMARY KEY,
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

-- 7. food_tags
CREATE TABLE nutrition.food_tags (
    food_id uuid NOT NULL REFERENCES nutrition.foods(id) ON DELETE CASCADE,
    tag_code text NOT NULL REFERENCES nutrition.tag_definitions(code),
    confidence numeric(3,2) DEFAULT 1.0 NOT NULL,
    CONSTRAINT food_tags_confidence_check CHECK (((confidence >= (0)::numeric) AND (confidence <= (1)::numeric))),
    PRIMARY KEY (food_id, tag_code)
);

CREATE INDEX idx_food_tags_code ON nutrition.food_tags USING btree (tag_code);
CREATE INDEX idx_food_tags_food ON nutrition.food_tags USING btree (food_id);

-- DOWN (Rollback)
-- DROP TABLE IF EXISTS nutrition.food_tags;
-- DROP TABLE IF EXISTS nutrition.tag_definitions;
-- DROP TABLE IF EXISTS nutrition.food_aliases;
-- DROP TABLE IF EXISTS nutrition.food_nutrients;
-- DROP TABLE IF EXISTS nutrition.foods;
-- DROP TABLE IF EXISTS nutrition.food_categories;
-- DROP TABLE IF EXISTS nutrition.nutrient_defs;
