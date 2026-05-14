-- P1-005 Local Food Taxonomy / Human Layer Foundation
-- LOCAL ONLY. Do not apply to DEV/LIVE.
-- Source refs:
-- - docs/specs/Nutrition/01_current_specs/SPEC_05_FOOD_TAXONOMY.md
-- - docs/specs/Nutrition/01_current_specs/SPEC_06_DATABASE_SCHEMA.md
-- - docs/specs/Nutrition/01_current_specs/SPEC_04_FEATURES.md
-- - docs/specs/Nutrition/01_current_specs/SPEC_08_IMPORT_PIPELINE.md
-- Boundary: deterministic schema/category/tag/alias foundation. No invented foods, nutrient values, aliases, or display names.

BEGIN;

CREATE TABLE IF NOT EXISTS nutrition.food_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name_de text NOT NULL,
  name_en text NOT NULL DEFAULT '',
  name_th text,
  parent_id uuid REFERENCES nutrition.food_categories(id),
  level integer NOT NULL CHECK (level IN (1,2,3,4)),
  icon text,
  sort_order integer DEFAULT 0,
  bls_hint text
);
CREATE INDEX IF NOT EXISTS idx_food_categories_parent ON nutrition.food_categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_food_categories_level ON nutrition.food_categories(level);

ALTER TABLE nutrition.foods ADD COLUMN IF NOT EXISTS name_display_en text;
ALTER TABLE nutrition.foods ADD COLUMN IF NOT EXISTS name_display_th text;
ALTER TABLE nutrition.foods ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES nutrition.food_categories(id);
ALTER TABLE nutrition.foods ADD COLUMN IF NOT EXISTS processing_level text DEFAULT 'raw';
ALTER TABLE nutrition.foods ADD COLUMN IF NOT EXISTS is_prepared_dish boolean NOT NULL DEFAULT false;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'foods_processing_level_check'
      AND conrelid = 'nutrition.foods'::regclass
  ) THEN
    ALTER TABLE nutrition.foods ADD CONSTRAINT foods_processing_level_check
      CHECK (processing_level IN ('raw','minimally_processed','processed','ultra_processed','cooked','fermented','smoked','dried','canned','fortified'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_foods_category ON nutrition.foods(category_id);
CREATE INDEX IF NOT EXISTS idx_foods_sort_weight ON nutrition.foods(sort_weight DESC);

CREATE TABLE IF NOT EXISTS nutrition.tag_definitions (
  code text PRIMARY KEY,
  name_de text NOT NULL,
  name_en text NOT NULL,
  tag_type text NOT NULL CHECK (tag_type IN ('ingredient','diet','allergen','fitness','gym','processing')),
  is_exclusion_relevant boolean NOT NULL DEFAULT false,
  icon text,
  sort_order integer DEFAULT 0,
  requires_macro_check boolean DEFAULT false,
  macro_rule jsonb
);

CREATE TABLE IF NOT EXISTS nutrition.food_tags (
  food_id uuid NOT NULL REFERENCES nutrition.foods(id) ON DELETE CASCADE,
  tag_code text NOT NULL REFERENCES nutrition.tag_definitions(code),
  confidence numeric(3,2) NOT NULL DEFAULT 1.0 CHECK (confidence BETWEEN 0 AND 1),
  PRIMARY KEY (food_id, tag_code)
);
CREATE INDEX IF NOT EXISTS idx_food_tags_food ON nutrition.food_tags(food_id);
CREATE INDEX IF NOT EXISTS idx_food_tags_code ON nutrition.food_tags(tag_code);

CREATE TABLE IF NOT EXISTS nutrition.food_aliases (
  food_id uuid NOT NULL REFERENCES nutrition.foods(id) ON DELETE CASCADE,
  alias text NOT NULL,
  locale text NOT NULL DEFAULT 'de',
  source text NOT NULL DEFAULT 'editorial' CHECK (source IN ('editorial','ai_generated','user')),
  PRIMARY KEY (food_id, alias, locale)
);
CREATE INDEX IF NOT EXISTS idx_food_aliases_food ON nutrition.food_aliases(food_id);

-- Category seed: all Level 1 and Level 2 categories extracted from SPEC_05.
INSERT INTO nutrition.food_categories (slug, name_de, name_en, name_th, parent_id, level, icon, sort_order, bls_hint)
VALUES ('fleisch-gefluegel', 'FLEISCH & GEFLÜGEL', '', '', NULL, 1, '🥩', 10, 'BLS prefixes U,V,W')
ON CONFLICT (slug) DO UPDATE SET
  name_de = EXCLUDED.name_de,
  name_en = EXCLUDED.name_en,
  name_th = EXCLUDED.name_th,
  parent_id = EXCLUDED.parent_id,
  level = EXCLUDED.level,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  bls_hint = EXCLUDED.bls_hint;
INSERT INTO nutrition.food_categories (slug, name_de, name_en, name_th, parent_id, level, icon, sort_order, bls_hint)
VALUES ('fisch-meeresfruechte', 'FISCH & MEERESFRÜCHTE', '', '', NULL, 1, '🐟', 100, 'BLS prefix T')
ON CONFLICT (slug) DO UPDATE SET
  name_de = EXCLUDED.name_de,
  name_en = EXCLUDED.name_en,
  name_th = EXCLUDED.name_th,
  parent_id = EXCLUDED.parent_id,
  level = EXCLUDED.level,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  bls_hint = EXCLUDED.bls_hint;
INSERT INTO nutrition.food_categories (slug, name_de, name_en, name_th, parent_id, level, icon, sort_order, bls_hint)
VALUES ('milch-kaese', 'MILCH & KÄSE', '', '', NULL, 1, '🥛', 170, 'BLS prefix M')
ON CONFLICT (slug) DO UPDATE SET
  name_de = EXCLUDED.name_de,
  name_en = EXCLUDED.name_en,
  name_th = EXCLUDED.name_th,
  parent_id = EXCLUDED.parent_id,
  level = EXCLUDED.level,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  bls_hint = EXCLUDED.bls_hint;
INSERT INTO nutrition.food_categories (slug, name_de, name_en, name_th, parent_id, level, icon, sort_order, bls_hint)
VALUES ('eier', 'EIER', '', '', NULL, 1, '🥚', 260, 'BLS prefix E')
ON CONFLICT (slug) DO UPDATE SET
  name_de = EXCLUDED.name_de,
  name_en = EXCLUDED.name_en,
  name_th = EXCLUDED.name_th,
  parent_id = EXCLUDED.parent_id,
  level = EXCLUDED.level,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  bls_hint = EXCLUDED.bls_hint;
INSERT INTO nutrition.food_categories (slug, name_de, name_en, name_th, parent_id, level, icon, sort_order, bls_hint)
VALUES ('getreide-brot-pasta', 'GETREIDE, BROT & PASTA', '', '', NULL, 1, '🌾', 270, 'BLS prefixes B,C')
ON CONFLICT (slug) DO UPDATE SET
  name_de = EXCLUDED.name_de,
  name_en = EXCLUDED.name_en,
  name_th = EXCLUDED.name_th,
  parent_id = EXCLUDED.parent_id,
  level = EXCLUDED.level,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  bls_hint = EXCLUDED.bls_hint;
INSERT INTO nutrition.food_categories (slug, name_de, name_en, name_th, parent_id, level, icon, sort_order, bls_hint)
VALUES ('gemuese', 'GEMÜSE', '', '', NULL, 1, '🥦', 330, 'BLS prefixes G,K')
ON CONFLICT (slug) DO UPDATE SET
  name_de = EXCLUDED.name_de,
  name_en = EXCLUDED.name_en,
  name_th = EXCLUDED.name_th,
  parent_id = EXCLUDED.parent_id,
  level = EXCLUDED.level,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  bls_hint = EXCLUDED.bls_hint;
INSERT INTO nutrition.food_categories (slug, name_de, name_en, name_th, parent_id, level, icon, sort_order, bls_hint)
VALUES ('obst', 'OBST', '', '', NULL, 1, '🍎', 430, 'BLS prefix F')
ON CONFLICT (slug) DO UPDATE SET
  name_de = EXCLUDED.name_de,
  name_en = EXCLUDED.name_en,
  name_th = EXCLUDED.name_th,
  parent_id = EXCLUDED.parent_id,
  level = EXCLUDED.level,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  bls_hint = EXCLUDED.bls_hint;
INSERT INTO nutrition.food_categories (slug, name_de, name_en, name_th, parent_id, level, icon, sort_order, bls_hint)
VALUES ('huelsenfruechte-nuesse-samen', 'HÜLSENFRÜCHTE, NÜSSE & SAMEN', '', '', NULL, 1, '🫘', 510, 'BLS prefix H')
ON CONFLICT (slug) DO UPDATE SET
  name_de = EXCLUDED.name_de,
  name_en = EXCLUDED.name_en,
  name_th = EXCLUDED.name_th,
  parent_id = EXCLUDED.parent_id,
  level = EXCLUDED.level,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  bls_hint = EXCLUDED.bls_hint;
INSERT INTO nutrition.food_categories (slug, name_de, name_en, name_th, parent_id, level, icon, sort_order, bls_hint)
VALUES ('fette-oele', 'FETTE & ÖLE', '', '', NULL, 1, '🫒', 580, 'BLS prefix Q')
ON CONFLICT (slug) DO UPDATE SET
  name_de = EXCLUDED.name_de,
  name_en = EXCLUDED.name_en,
  name_th = EXCLUDED.name_th,
  parent_id = EXCLUDED.parent_id,
  level = EXCLUDED.level,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  bls_hint = EXCLUDED.bls_hint;
INSERT INTO nutrition.food_categories (slug, name_de, name_en, name_th, parent_id, level, icon, sort_order, bls_hint)
VALUES ('suesses-snacks', 'SÜSSES & SNACKS', '', '', NULL, 1, '🍬', 620, 'BLS prefix S')
ON CONFLICT (slug) DO UPDATE SET
  name_de = EXCLUDED.name_de,
  name_en = EXCLUDED.name_en,
  name_th = EXCLUDED.name_th,
  parent_id = EXCLUDED.parent_id,
  level = EXCLUDED.level,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  bls_hint = EXCLUDED.bls_hint;
INSERT INTO nutrition.food_categories (slug, name_de, name_en, name_th, parent_id, level, icon, sort_order, bls_hint)
VALUES ('getraenke', 'GETRÄNKE', '', '', NULL, 1, '🥤', 680, 'BLS prefix P')
ON CONFLICT (slug) DO UPDATE SET
  name_de = EXCLUDED.name_de,
  name_en = EXCLUDED.name_en,
  name_th = EXCLUDED.name_th,
  parent_id = EXCLUDED.parent_id,
  level = EXCLUDED.level,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  bls_hint = EXCLUDED.bls_hint;
INSERT INTO nutrition.food_categories (slug, name_de, name_en, name_th, parent_id, level, icon, sort_order, bls_hint)
VALUES ('fertiggerichte-zubereitungen', '🍽️ FERTIGGERICHTE & ZUBEREITUNGEN', '', '', NULL, 1, '', 750, 'prepared dish scope; BLS category varies')
ON CONFLICT (slug) DO UPDATE SET
  name_de = EXCLUDED.name_de,
  name_en = EXCLUDED.name_en,
  name_th = EXCLUDED.name_th,
  parent_id = EXCLUDED.parent_id,
  level = EXCLUDED.level,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  bls_hint = EXCLUDED.bls_hint;
INSERT INTO nutrition.food_categories (slug, name_de, name_en, name_th, parent_id, level, icon, sort_order, bls_hint)
VALUES ('wuerzmittel-gewuerze', 'WÜRZMITTEL & GEWÜRZE', '', '', NULL, 1, '🧂', 840, 'BLS prefix R')
ON CONFLICT (slug) DO UPDATE SET
  name_de = EXCLUDED.name_de,
  name_en = EXCLUDED.name_en,
  name_th = EXCLUDED.name_th,
  parent_id = EXCLUDED.parent_id,
  level = EXCLUDED.level,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  bls_hint = EXCLUDED.bls_hint;
INSERT INTO nutrition.food_categories (slug, name_de, name_en, name_th, parent_id, level, icon, sort_order, bls_hint)
VALUES ('rindfleisch', 'Rindfleisch', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'fleisch-gefluegel'), 2, '', 20, '')
ON CONFLICT (slug) DO UPDATE SET
  name_de = EXCLUDED.name_de,
  name_en = EXCLUDED.name_en,
  name_th = EXCLUDED.name_th,
  parent_id = EXCLUDED.parent_id,
  level = EXCLUDED.level,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  bls_hint = EXCLUDED.bls_hint;
INSERT INTO nutrition.food_categories (slug, name_de, name_en, name_th, parent_id, level, icon, sort_order, bls_hint)
VALUES ('kalbfleisch', 'Kalbfleisch', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'fleisch-gefluegel'), 2, '', 30, '')
ON CONFLICT (slug) DO UPDATE SET
  name_de = EXCLUDED.name_de,
  name_en = EXCLUDED.name_en,
  name_th = EXCLUDED.name_th,
  parent_id = EXCLUDED.parent_id,
  level = EXCLUDED.level,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  bls_hint = EXCLUDED.bls_hint;
INSERT INTO nutrition.food_categories (slug, name_de, name_en, name_th, parent_id, level, icon, sort_order, bls_hint)
VALUES ('schweinefleisch', 'Schweinefleisch', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'fleisch-gefluegel'), 2, '', 40, '')
ON CONFLICT (slug) DO UPDATE SET
  name_de = EXCLUDED.name_de,
  name_en = EXCLUDED.name_en,
  name_th = EXCLUDED.name_th,
  parent_id = EXCLUDED.parent_id,
  level = EXCLUDED.level,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  bls_hint = EXCLUDED.bls_hint;
INSERT INTO nutrition.food_categories (slug, name_de, name_en, name_th, parent_id, level, icon, sort_order, bls_hint)
VALUES ('gefluegel', 'Geflügel', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'fleisch-gefluegel'), 2, '', 50, '')
ON CONFLICT (slug) DO UPDATE SET
  name_de = EXCLUDED.name_de,
  name_en = EXCLUDED.name_en,
  name_th = EXCLUDED.name_th,
  parent_id = EXCLUDED.parent_id,
  level = EXCLUDED.level,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  bls_hint = EXCLUDED.bls_hint;
INSERT INTO nutrition.food_categories (slug, name_de, name_en, name_th, parent_id, level, icon, sort_order, bls_hint)
VALUES ('lamm-schaf', 'Lamm & Schaf', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'fleisch-gefluegel'), 2, '', 60, '')
ON CONFLICT (slug) DO UPDATE SET
  name_de = EXCLUDED.name_de,
  name_en = EXCLUDED.name_en,
  name_th = EXCLUDED.name_th,
  parent_id = EXCLUDED.parent_id,
  level = EXCLUDED.level,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  bls_hint = EXCLUDED.bls_hint;
INSERT INTO nutrition.food_categories (slug, name_de, name_en, name_th, parent_id, level, icon, sort_order, bls_hint)
VALUES ('wild', 'Wild', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'fleisch-gefluegel'), 2, '', 70, '')
ON CONFLICT (slug) DO UPDATE SET
  name_de = EXCLUDED.name_de,
  name_en = EXCLUDED.name_en,
  name_th = EXCLUDED.name_th,
  parent_id = EXCLUDED.parent_id,
  level = EXCLUDED.level,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  bls_hint = EXCLUDED.bls_hint;
INSERT INTO nutrition.food_categories (slug, name_de, name_en, name_th, parent_id, level, icon, sort_order, bls_hint)
VALUES ('innereien', 'Innereien', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'fleisch-gefluegel'), 2, '', 80, '')
ON CONFLICT (slug) DO UPDATE SET
  name_de = EXCLUDED.name_de,
  name_en = EXCLUDED.name_en,
  name_th = EXCLUDED.name_th,
  parent_id = EXCLUDED.parent_id,
  level = EXCLUDED.level,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  bls_hint = EXCLUDED.bls_hint;
INSERT INTO nutrition.food_categories (slug, name_de, name_en, name_th, parent_id, level, icon, sort_order, bls_hint)
VALUES ('wurstwaren-aufschnitt', 'Wurstwaren & Aufschnitt', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'fleisch-gefluegel'), 2, '', 90, '')
ON CONFLICT (slug) DO UPDATE SET
  name_de = EXCLUDED.name_de,
  name_en = EXCLUDED.name_en,
  name_th = EXCLUDED.name_th,
  parent_id = EXCLUDED.parent_id,
  level = EXCLUDED.level,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  bls_hint = EXCLUDED.bls_hint;
INSERT INTO nutrition.food_categories (slug, name_de, name_en, name_th, parent_id, level, icon, sort_order, bls_hint)
VALUES ('fetter-seefisch', 'Fetter Seefisch', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'fisch-meeresfruechte'), 2, '', 110, '')
ON CONFLICT (slug) DO UPDATE SET
  name_de = EXCLUDED.name_de,
  name_en = EXCLUDED.name_en,
  name_th = EXCLUDED.name_th,
  parent_id = EXCLUDED.parent_id,
  level = EXCLUDED.level,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  bls_hint = EXCLUDED.bls_hint;
INSERT INTO nutrition.food_categories (slug, name_de, name_en, name_th, parent_id, level, icon, sort_order, bls_hint)
VALUES ('magerer-seefisch', 'Magerer Seefisch', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'fisch-meeresfruechte'), 2, '', 120, '')
ON CONFLICT (slug) DO UPDATE SET
  name_de = EXCLUDED.name_de,
  name_en = EXCLUDED.name_en,
  name_th = EXCLUDED.name_th,
  parent_id = EXCLUDED.parent_id,
  level = EXCLUDED.level,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  bls_hint = EXCLUDED.bls_hint;
INSERT INTO nutrition.food_categories (slug, name_de, name_en, name_th, parent_id, level, icon, sort_order, bls_hint)
VALUES ('suesswasserfisch', 'Süßwasserfisch', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'fisch-meeresfruechte'), 2, '', 130, '')
ON CONFLICT (slug) DO UPDATE SET
  name_de = EXCLUDED.name_de,
  name_en = EXCLUDED.name_en,
  name_th = EXCLUDED.name_th,
  parent_id = EXCLUDED.parent_id,
  level = EXCLUDED.level,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  bls_hint = EXCLUDED.bls_hint;
INSERT INTO nutrition.food_categories (slug, name_de, name_en, name_th, parent_id, level, icon, sort_order, bls_hint)
VALUES ('raeucherfisch-fischprodukte', 'Räucherfisch & Fischprodukte', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'fisch-meeresfruechte'), 2, '', 140, '')
ON CONFLICT (slug) DO UPDATE SET
  name_de = EXCLUDED.name_de,
  name_en = EXCLUDED.name_en,
  name_th = EXCLUDED.name_th,
  parent_id = EXCLUDED.parent_id,
  level = EXCLUDED.level,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  bls_hint = EXCLUDED.bls_hint;
INSERT INTO nutrition.food_categories (slug, name_de, name_en, name_th, parent_id, level, icon, sort_order, bls_hint)
VALUES ('schalentiere', 'Schalentiere', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'fisch-meeresfruechte'), 2, '', 150, '')
ON CONFLICT (slug) DO UPDATE SET
  name_de = EXCLUDED.name_de,
  name_en = EXCLUDED.name_en,
  name_th = EXCLUDED.name_th,
  parent_id = EXCLUDED.parent_id,
  level = EXCLUDED.level,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  bls_hint = EXCLUDED.bls_hint;
INSERT INTO nutrition.food_categories (slug, name_de, name_en, name_th, parent_id, level, icon, sort_order, bls_hint)
VALUES ('weichtiere-andere', 'Weichtiere & Andere', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'fisch-meeresfruechte'), 2, '', 160, '')
ON CONFLICT (slug) DO UPDATE SET
  name_de = EXCLUDED.name_de,
  name_en = EXCLUDED.name_en,
  name_th = EXCLUDED.name_th,
  parent_id = EXCLUDED.parent_id,
  level = EXCLUDED.level,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  bls_hint = EXCLUDED.bls_hint;
INSERT INTO nutrition.food_categories (slug, name_de, name_en, name_th, parent_id, level, icon, sort_order, bls_hint)
VALUES ('trinkmilch-sahne', 'Trinkmilch & Sahne', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'milch-kaese'), 2, '', 180, '')
ON CONFLICT (slug) DO UPDATE SET
  name_de = EXCLUDED.name_de,
  name_en = EXCLUDED.name_en,
  name_th = EXCLUDED.name_th,
  parent_id = EXCLUDED.parent_id,
  level = EXCLUDED.level,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  bls_hint = EXCLUDED.bls_hint;
INSERT INTO nutrition.food_categories (slug, name_de, name_en, name_th, parent_id, level, icon, sort_order, bls_hint)
VALUES ('joghurt-quark', 'Joghurt & Quark', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'milch-kaese'), 2, '', 190, '')
ON CONFLICT (slug) DO UPDATE SET
  name_de = EXCLUDED.name_de,
  name_en = EXCLUDED.name_en,
  name_th = EXCLUDED.name_th,
  parent_id = EXCLUDED.parent_id,
  level = EXCLUDED.level,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  bls_hint = EXCLUDED.bls_hint;
INSERT INTO nutrition.food_categories (slug, name_de, name_en, name_th, parent_id, level, icon, sort_order, bls_hint)
VALUES ('kaese-hartkaese-45-trockenmasse', 'Käse — Hartkäse (>45% Trockenmasse)', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'milch-kaese'), 2, '', 200, '')
ON CONFLICT (slug) DO UPDATE SET
  name_de = EXCLUDED.name_de,
  name_en = EXCLUDED.name_en,
  name_th = EXCLUDED.name_th,
  parent_id = EXCLUDED.parent_id,
  level = EXCLUDED.level,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  bls_hint = EXCLUDED.bls_hint;
INSERT INTO nutrition.food_categories (slug, name_de, name_en, name_th, parent_id, level, icon, sort_order, bls_hint)
VALUES ('kaese-schnittkaese', 'Käse — Schnittkäse', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'milch-kaese'), 2, '', 210, '')
ON CONFLICT (slug) DO UPDATE SET
  name_de = EXCLUDED.name_de,
  name_en = EXCLUDED.name_en,
  name_th = EXCLUDED.name_th,
  parent_id = EXCLUDED.parent_id,
  level = EXCLUDED.level,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  bls_hint = EXCLUDED.bls_hint;
INSERT INTO nutrition.food_categories (slug, name_de, name_en, name_th, parent_id, level, icon, sort_order, bls_hint)
VALUES ('kaese-weichkaese', 'Käse — Weichkäse', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'milch-kaese'), 2, '', 220, '')
ON CONFLICT (slug) DO UPDATE SET
  name_de = EXCLUDED.name_de,
  name_en = EXCLUDED.name_en,
  name_th = EXCLUDED.name_th,
  parent_id = EXCLUDED.parent_id,
  level = EXCLUDED.level,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  bls_hint = EXCLUDED.bls_hint;
INSERT INTO nutrition.food_categories (slug, name_de, name_en, name_th, parent_id, level, icon, sort_order, bls_hint)
VALUES ('kaese-frischkaese', 'Käse — Frischkäse', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'milch-kaese'), 2, '', 230, '')
ON CONFLICT (slug) DO UPDATE SET
  name_de = EXCLUDED.name_de,
  name_en = EXCLUDED.name_en,
  name_th = EXCLUDED.name_th,
  parent_id = EXCLUDED.parent_id,
  level = EXCLUDED.level,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  bls_hint = EXCLUDED.bls_hint;
INSERT INTO nutrition.food_categories (slug, name_de, name_en, name_th, parent_id, level, icon, sort_order, bls_hint)
VALUES ('kaese-schimmelkaese', 'Käse — Schimmelkäse', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'milch-kaese'), 2, '', 240, '')
ON CONFLICT (slug) DO UPDATE SET
  name_de = EXCLUDED.name_de,
  name_en = EXCLUDED.name_en,
  name_th = EXCLUDED.name_th,
  parent_id = EXCLUDED.parent_id,
  level = EXCLUDED.level,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  bls_hint = EXCLUDED.bls_hint;
INSERT INTO nutrition.food_categories (slug, name_de, name_en, name_th, parent_id, level, icon, sort_order, bls_hint)
VALUES ('butter-milchfette', 'Butter & Milchfette', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'milch-kaese'), 2, '', 250, '')
ON CONFLICT (slug) DO UPDATE SET
  name_de = EXCLUDED.name_de,
  name_en = EXCLUDED.name_en,
  name_th = EXCLUDED.name_th,
  parent_id = EXCLUDED.parent_id,
  level = EXCLUDED.level,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  bls_hint = EXCLUDED.bls_hint;
INSERT INTO nutrition.food_categories (slug, name_de, name_en, name_th, parent_id, level, icon, sort_order, bls_hint)
VALUES ('brot', 'Brot', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'getreide-brot-pasta'), 2, '', 280, '')
ON CONFLICT (slug) DO UPDATE SET
  name_de = EXCLUDED.name_de,
  name_en = EXCLUDED.name_en,
  name_th = EXCLUDED.name_th,
  parent_id = EXCLUDED.parent_id,
  level = EXCLUDED.level,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  bls_hint = EXCLUDED.bls_hint;
INSERT INTO nutrition.food_categories (slug, name_de, name_en, name_th, parent_id, level, icon, sort_order, bls_hint)
VALUES ('rohe-koerner-flocken-pseudogetreide', 'Rohe Körner, Flocken & Pseudogetreide', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'getreide-brot-pasta'), 2, '', 290, '')
ON CONFLICT (slug) DO UPDATE SET
  name_de = EXCLUDED.name_de,
  name_en = EXCLUDED.name_en,
  name_th = EXCLUDED.name_th,
  parent_id = EXCLUDED.parent_id,
  level = EXCLUDED.level,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  bls_hint = EXCLUDED.bls_hint;
INSERT INTO nutrition.food_categories (slug, name_de, name_en, name_th, parent_id, level, icon, sort_order, bls_hint)
VALUES ('mehl-staerke', 'Mehl & Stärke', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'getreide-brot-pasta'), 2, '', 300, '')
ON CONFLICT (slug) DO UPDATE SET
  name_de = EXCLUDED.name_de,
  name_en = EXCLUDED.name_en,
  name_th = EXCLUDED.name_th,
  parent_id = EXCLUDED.parent_id,
  level = EXCLUDED.level,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  bls_hint = EXCLUDED.bls_hint;
INSERT INTO nutrition.food_categories (slug, name_de, name_en, name_th, parent_id, level, icon, sort_order, bls_hint)
VALUES ('pasta-teigwaren', 'Pasta & Teigwaren', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'getreide-brot-pasta'), 2, '', 310, '')
ON CONFLICT (slug) DO UPDATE SET
  name_de = EXCLUDED.name_de,
  name_en = EXCLUDED.name_en,
  name_th = EXCLUDED.name_th,
  parent_id = EXCLUDED.parent_id,
  level = EXCLUDED.level,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  bls_hint = EXCLUDED.bls_hint;
INSERT INTO nutrition.food_categories (slug, name_de, name_en, name_th, parent_id, level, icon, sort_order, bls_hint)
VALUES ('backwaren-gebaeck-snack-kategorie', 'Backwaren & Gebäck (Snack-Kategorie)', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'getreide-brot-pasta'), 2, '', 320, '')
ON CONFLICT (slug) DO UPDATE SET
  name_de = EXCLUDED.name_de,
  name_en = EXCLUDED.name_en,
  name_th = EXCLUDED.name_th,
  parent_id = EXCLUDED.parent_id,
  level = EXCLUDED.level,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  bls_hint = EXCLUDED.bls_hint;
INSERT INTO nutrition.food_categories (slug, name_de, name_en, name_th, parent_id, level, icon, sort_order, bls_hint)
VALUES ('blattgemuese-salate', 'Blattgemüse & Salate', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'gemuese'), 2, '', 340, '')
ON CONFLICT (slug) DO UPDATE SET
  name_de = EXCLUDED.name_de,
  name_en = EXCLUDED.name_en,
  name_th = EXCLUDED.name_th,
  parent_id = EXCLUDED.parent_id,
  level = EXCLUDED.level,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  bls_hint = EXCLUDED.bls_hint;
INSERT INTO nutrition.food_categories (slug, name_de, name_en, name_th, parent_id, level, icon, sort_order, bls_hint)
VALUES ('kreuzbluetler-brassica', 'Kreuzblütler (Brassica)', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'gemuese'), 2, '', 350, '')
ON CONFLICT (slug) DO UPDATE SET
  name_de = EXCLUDED.name_de,
  name_en = EXCLUDED.name_en,
  name_th = EXCLUDED.name_th,
  parent_id = EXCLUDED.parent_id,
  level = EXCLUDED.level,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  bls_hint = EXCLUDED.bls_hint;
INSERT INTO nutrition.food_categories (slug, name_de, name_en, name_th, parent_id, level, icon, sort_order, bls_hint)
VALUES ('fruchtgemuese', 'Fruchtgemüse', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'gemuese'), 2, '', 360, '')
ON CONFLICT (slug) DO UPDATE SET
  name_de = EXCLUDED.name_de,
  name_en = EXCLUDED.name_en,
  name_th = EXCLUDED.name_th,
  parent_id = EXCLUDED.parent_id,
  level = EXCLUDED.level,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  bls_hint = EXCLUDED.bls_hint;
INSERT INTO nutrition.food_categories (slug, name_de, name_en, name_th, parent_id, level, icon, sort_order, bls_hint)
VALUES ('wurzel-knollengemuese', 'Wurzel- & Knollengemüse', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'gemuese'), 2, '', 370, '')
ON CONFLICT (slug) DO UPDATE SET
  name_de = EXCLUDED.name_de,
  name_en = EXCLUDED.name_en,
  name_th = EXCLUDED.name_th,
  parent_id = EXCLUDED.parent_id,
  level = EXCLUDED.level,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  bls_hint = EXCLUDED.bls_hint;
INSERT INTO nutrition.food_categories (slug, name_de, name_en, name_th, parent_id, level, icon, sort_order, bls_hint)
VALUES ('zwiebeln-lauch', 'Zwiebeln & Lauch', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'gemuese'), 2, '', 380, '')
ON CONFLICT (slug) DO UPDATE SET
  name_de = EXCLUDED.name_de,
  name_en = EXCLUDED.name_en,
  name_th = EXCLUDED.name_th,
  parent_id = EXCLUDED.parent_id,
  level = EXCLUDED.level,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  bls_hint = EXCLUDED.bls_hint;
INSERT INTO nutrition.food_categories (slug, name_de, name_en, name_th, parent_id, level, icon, sort_order, bls_hint)
VALUES ('pilze', 'Pilze', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'gemuese'), 2, '', 390, '')
ON CONFLICT (slug) DO UPDATE SET
  name_de = EXCLUDED.name_de,
  name_en = EXCLUDED.name_en,
  name_th = EXCLUDED.name_th,
  parent_id = EXCLUDED.parent_id,
  level = EXCLUDED.level,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  bls_hint = EXCLUDED.bls_hint;
INSERT INTO nutrition.food_categories (slug, name_de, name_en, name_th, parent_id, level, icon, sort_order, bls_hint)
VALUES ('kartoffeln', 'Kartoffeln', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'gemuese'), 2, '', 400, '')
ON CONFLICT (slug) DO UPDATE SET
  name_de = EXCLUDED.name_de,
  name_en = EXCLUDED.name_en,
  name_th = EXCLUDED.name_th,
  parent_id = EXCLUDED.parent_id,
  level = EXCLUDED.level,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  bls_hint = EXCLUDED.bls_hint;
INSERT INTO nutrition.food_categories (slug, name_de, name_en, name_th, parent_id, level, icon, sort_order, bls_hint)
VALUES ('spargel-artischocken', 'Spargel & Artischocken', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'gemuese'), 2, '', 410, '')
ON CONFLICT (slug) DO UPDATE SET
  name_de = EXCLUDED.name_de,
  name_en = EXCLUDED.name_en,
  name_th = EXCLUDED.name_th,
  parent_id = EXCLUDED.parent_id,
  level = EXCLUDED.level,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  bls_hint = EXCLUDED.bls_hint;
INSERT INTO nutrition.food_categories (slug, name_de, name_en, name_th, parent_id, level, icon, sort_order, bls_hint)
VALUES ('sprossen-keimlinge', 'Sprossen & Keimlinge', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'gemuese'), 2, '', 420, '')
ON CONFLICT (slug) DO UPDATE SET
  name_de = EXCLUDED.name_de,
  name_en = EXCLUDED.name_en,
  name_th = EXCLUDED.name_th,
  parent_id = EXCLUDED.parent_id,
  level = EXCLUDED.level,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  bls_hint = EXCLUDED.bls_hint;
INSERT INTO nutrition.food_categories (slug, name_de, name_en, name_th, parent_id, level, icon, sort_order, bls_hint)
VALUES ('beerenfruechte', 'Beerenfrüchte', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'obst'), 2, '', 440, '')
ON CONFLICT (slug) DO UPDATE SET
  name_de = EXCLUDED.name_de,
  name_en = EXCLUDED.name_en,
  name_th = EXCLUDED.name_th,
  parent_id = EXCLUDED.parent_id,
  level = EXCLUDED.level,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  bls_hint = EXCLUDED.bls_hint;
INSERT INTO nutrition.food_categories (slug, name_de, name_en, name_th, parent_id, level, icon, sort_order, bls_hint)
VALUES ('kernobst', 'Kernobst', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'obst'), 2, '', 450, '')
ON CONFLICT (slug) DO UPDATE SET
  name_de = EXCLUDED.name_de,
  name_en = EXCLUDED.name_en,
  name_th = EXCLUDED.name_th,
  parent_id = EXCLUDED.parent_id,
  level = EXCLUDED.level,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  bls_hint = EXCLUDED.bls_hint;
INSERT INTO nutrition.food_categories (slug, name_de, name_en, name_th, parent_id, level, icon, sort_order, bls_hint)
VALUES ('steinobst', 'Steinobst', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'obst'), 2, '', 460, '')
ON CONFLICT (slug) DO UPDATE SET
  name_de = EXCLUDED.name_de,
  name_en = EXCLUDED.name_en,
  name_th = EXCLUDED.name_th,
  parent_id = EXCLUDED.parent_id,
  level = EXCLUDED.level,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  bls_hint = EXCLUDED.bls_hint;
INSERT INTO nutrition.food_categories (slug, name_de, name_en, name_th, parent_id, level, icon, sort_order, bls_hint)
VALUES ('zitrusfruechte', 'Zitrusfrüchte', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'obst'), 2, '', 470, '')
ON CONFLICT (slug) DO UPDATE SET
  name_de = EXCLUDED.name_de,
  name_en = EXCLUDED.name_en,
  name_th = EXCLUDED.name_th,
  parent_id = EXCLUDED.parent_id,
  level = EXCLUDED.level,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  bls_hint = EXCLUDED.bls_hint;
INSERT INTO nutrition.food_categories (slug, name_de, name_en, name_th, parent_id, level, icon, sort_order, bls_hint)
VALUES ('exotisches-tropisches-obst', 'Exotisches & Tropisches Obst', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'obst'), 2, '', 480, '')
ON CONFLICT (slug) DO UPDATE SET
  name_de = EXCLUDED.name_de,
  name_en = EXCLUDED.name_en,
  name_th = EXCLUDED.name_th,
  parent_id = EXCLUDED.parent_id,
  level = EXCLUDED.level,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  bls_hint = EXCLUDED.bls_hint;
INSERT INTO nutrition.food_categories (slug, name_de, name_en, name_th, parent_id, level, icon, sort_order, bls_hint)
VALUES ('melonen', 'Melonen', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'obst'), 2, '', 490, '')
ON CONFLICT (slug) DO UPDATE SET
  name_de = EXCLUDED.name_de,
  name_en = EXCLUDED.name_en,
  name_th = EXCLUDED.name_th,
  parent_id = EXCLUDED.parent_id,
  level = EXCLUDED.level,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  bls_hint = EXCLUDED.bls_hint;
INSERT INTO nutrition.food_categories (slug, name_de, name_en, name_th, parent_id, level, icon, sort_order, bls_hint)
VALUES ('trockenfruechte', 'Trockenfrüchte', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'obst'), 2, '', 500, '')
ON CONFLICT (slug) DO UPDATE SET
  name_de = EXCLUDED.name_de,
  name_en = EXCLUDED.name_en,
  name_th = EXCLUDED.name_th,
  parent_id = EXCLUDED.parent_id,
  level = EXCLUDED.level,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  bls_hint = EXCLUDED.bls_hint;
INSERT INTO nutrition.food_categories (slug, name_de, name_en, name_th, parent_id, level, icon, sort_order, bls_hint)
VALUES ('huelsenfruechte', 'Hülsenfrüchte', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'huelsenfruechte-nuesse-samen'), 2, '', 520, '')
ON CONFLICT (slug) DO UPDATE SET
  name_de = EXCLUDED.name_de,
  name_en = EXCLUDED.name_en,
  name_th = EXCLUDED.name_th,
  parent_id = EXCLUDED.parent_id,
  level = EXCLUDED.level,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  bls_hint = EXCLUDED.bls_hint;
INSERT INTO nutrition.food_categories (slug, name_de, name_en, name_th, parent_id, level, icon, sort_order, bls_hint)
VALUES ('sojaprodukte', 'Sojaprodukte', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'huelsenfruechte-nuesse-samen'), 2, '', 530, '')
ON CONFLICT (slug) DO UPDATE SET
  name_de = EXCLUDED.name_de,
  name_en = EXCLUDED.name_en,
  name_th = EXCLUDED.name_th,
  parent_id = EXCLUDED.parent_id,
  level = EXCLUDED.level,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  bls_hint = EXCLUDED.bls_hint;
INSERT INTO nutrition.food_categories (slug, name_de, name_en, name_th, parent_id, level, icon, sort_order, bls_hint)
VALUES ('nuesse', 'Nüsse', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'huelsenfruechte-nuesse-samen'), 2, '', 540, '')
ON CONFLICT (slug) DO UPDATE SET
  name_de = EXCLUDED.name_de,
  name_en = EXCLUDED.name_en,
  name_th = EXCLUDED.name_th,
  parent_id = EXCLUDED.parent_id,
  level = EXCLUDED.level,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  bls_hint = EXCLUDED.bls_hint;
INSERT INTO nutrition.food_categories (slug, name_de, name_en, name_th, parent_id, level, icon, sort_order, bls_hint)
VALUES ('erdnuesse-erdnussprodukte', 'Erdnüsse & Erdnussprodukte', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'huelsenfruechte-nuesse-samen'), 2, '', 550, '')
ON CONFLICT (slug) DO UPDATE SET
  name_de = EXCLUDED.name_de,
  name_en = EXCLUDED.name_en,
  name_th = EXCLUDED.name_th,
  parent_id = EXCLUDED.parent_id,
  level = EXCLUDED.level,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  bls_hint = EXCLUDED.bls_hint;
INSERT INTO nutrition.food_categories (slug, name_de, name_en, name_th, parent_id, level, icon, sort_order, bls_hint)
VALUES ('samen-kerne', 'Samen & Kerne', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'huelsenfruechte-nuesse-samen'), 2, '', 560, '')
ON CONFLICT (slug) DO UPDATE SET
  name_de = EXCLUDED.name_de,
  name_en = EXCLUDED.name_en,
  name_th = EXCLUDED.name_th,
  parent_id = EXCLUDED.parent_id,
  level = EXCLUDED.level,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  bls_hint = EXCLUDED.bls_hint;
INSERT INTO nutrition.food_categories (slug, name_de, name_en, name_th, parent_id, level, icon, sort_order, bls_hint)
VALUES ('nussmuse-saaten-pasten', 'Nussmuse & Saaten-Pasten', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'huelsenfruechte-nuesse-samen'), 2, '', 570, '')
ON CONFLICT (slug) DO UPDATE SET
  name_de = EXCLUDED.name_de,
  name_en = EXCLUDED.name_en,
  name_th = EXCLUDED.name_th,
  parent_id = EXCLUDED.parent_id,
  level = EXCLUDED.level,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  bls_hint = EXCLUDED.bls_hint;
INSERT INTO nutrition.food_categories (slug, name_de, name_en, name_th, parent_id, level, icon, sort_order, bls_hint)
VALUES ('pflanzliche-oele', 'Pflanzliche Öle', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'fette-oele'), 2, '', 590, '')
ON CONFLICT (slug) DO UPDATE SET
  name_de = EXCLUDED.name_de,
  name_en = EXCLUDED.name_en,
  name_th = EXCLUDED.name_th,
  parent_id = EXCLUDED.parent_id,
  level = EXCLUDED.level,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  bls_hint = EXCLUDED.bls_hint;
INSERT INTO nutrition.food_categories (slug, name_de, name_en, name_th, parent_id, level, icon, sort_order, bls_hint)
VALUES ('tierische-fette', 'Tierische Fette', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'fette-oele'), 2, '', 600, '')
ON CONFLICT (slug) DO UPDATE SET
  name_de = EXCLUDED.name_de,
  name_en = EXCLUDED.name_en,
  name_th = EXCLUDED.name_th,
  parent_id = EXCLUDED.parent_id,
  level = EXCLUDED.level,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  bls_hint = EXCLUDED.bls_hint;
INSERT INTO nutrition.food_categories (slug, name_de, name_en, name_th, parent_id, level, icon, sort_order, bls_hint)
VALUES ('margarine-streichfette', 'Margarine & Streichfette', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'fette-oele'), 2, '', 610, '')
ON CONFLICT (slug) DO UPDATE SET
  name_de = EXCLUDED.name_de,
  name_en = EXCLUDED.name_en,
  name_th = EXCLUDED.name_th,
  parent_id = EXCLUDED.parent_id,
  level = EXCLUDED.level,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  bls_hint = EXCLUDED.bls_hint;
INSERT INTO nutrition.food_categories (slug, name_de, name_en, name_th, parent_id, level, icon, sort_order, bls_hint)
VALUES ('schokolade-kakao', 'Schokolade & Kakao', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'suesses-snacks'), 2, '', 630, '')
ON CONFLICT (slug) DO UPDATE SET
  name_de = EXCLUDED.name_de,
  name_en = EXCLUDED.name_en,
  name_th = EXCLUDED.name_th,
  parent_id = EXCLUDED.parent_id,
  level = EXCLUDED.level,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  bls_hint = EXCLUDED.bls_hint;
INSERT INTO nutrition.food_categories (slug, name_de, name_en, name_th, parent_id, level, icon, sort_order, bls_hint)
VALUES ('zucker-suessungsmittel', 'Zucker & Süßungsmittel', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'suesses-snacks'), 2, '', 640, '')
ON CONFLICT (slug) DO UPDATE SET
  name_de = EXCLUDED.name_de,
  name_en = EXCLUDED.name_en,
  name_th = EXCLUDED.name_th,
  parent_id = EXCLUDED.parent_id,
  level = EXCLUDED.level,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  bls_hint = EXCLUDED.bls_hint;
INSERT INTO nutrition.food_categories (slug, name_de, name_en, name_th, parent_id, level, icon, sort_order, bls_hint)
VALUES ('eis-suessspeisen', 'Eis & Süßspeisen', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'suesses-snacks'), 2, '', 650, '')
ON CONFLICT (slug) DO UPDATE SET
  name_de = EXCLUDED.name_de,
  name_en = EXCLUDED.name_en,
  name_th = EXCLUDED.name_th,
  parent_id = EXCLUDED.parent_id,
  level = EXCLUDED.level,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  bls_hint = EXCLUDED.bls_hint;
INSERT INTO nutrition.food_categories (slug, name_de, name_en, name_th, parent_id, level, icon, sort_order, bls_hint)
VALUES ('chips-salzgebaeck', 'Chips & Salzgebäck', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'suesses-snacks'), 2, '', 660, '')
ON CONFLICT (slug) DO UPDATE SET
  name_de = EXCLUDED.name_de,
  name_en = EXCLUDED.name_en,
  name_th = EXCLUDED.name_th,
  parent_id = EXCLUDED.parent_id,
  level = EXCLUDED.level,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  bls_hint = EXCLUDED.bls_hint;
INSERT INTO nutrition.food_categories (slug, name_de, name_en, name_th, parent_id, level, icon, sort_order, bls_hint)
VALUES ('suessigkeiten-confiserie', 'Süßigkeiten & Confiserie', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'suesses-snacks'), 2, '', 670, '')
ON CONFLICT (slug) DO UPDATE SET
  name_de = EXCLUDED.name_de,
  name_en = EXCLUDED.name_en,
  name_th = EXCLUDED.name_th,
  parent_id = EXCLUDED.parent_id,
  level = EXCLUDED.level,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  bls_hint = EXCLUDED.bls_hint;
INSERT INTO nutrition.food_categories (slug, name_de, name_en, name_th, parent_id, level, icon, sort_order, bls_hint)
VALUES ('wasser', 'Wasser', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'getraenke'), 2, '', 690, '')
ON CONFLICT (slug) DO UPDATE SET
  name_de = EXCLUDED.name_de,
  name_en = EXCLUDED.name_en,
  name_th = EXCLUDED.name_th,
  parent_id = EXCLUDED.parent_id,
  level = EXCLUDED.level,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  bls_hint = EXCLUDED.bls_hint;
INSERT INTO nutrition.food_categories (slug, name_de, name_en, name_th, parent_id, level, icon, sort_order, bls_hint)
VALUES ('kaffee-tee', 'Kaffee & Tee', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'getraenke'), 2, '', 700, '')
ON CONFLICT (slug) DO UPDATE SET
  name_de = EXCLUDED.name_de,
  name_en = EXCLUDED.name_en,
  name_th = EXCLUDED.name_th,
  parent_id = EXCLUDED.parent_id,
  level = EXCLUDED.level,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  bls_hint = EXCLUDED.bls_hint;
INSERT INTO nutrition.food_categories (slug, name_de, name_en, name_th, parent_id, level, icon, sort_order, bls_hint)
VALUES ('fruchtsaefte-smoothies', 'Fruchtsäfte & Smoothies', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'getraenke'), 2, '', 710, '')
ON CONFLICT (slug) DO UPDATE SET
  name_de = EXCLUDED.name_de,
  name_en = EXCLUDED.name_en,
  name_th = EXCLUDED.name_th,
  parent_id = EXCLUDED.parent_id,
  level = EXCLUDED.level,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  bls_hint = EXCLUDED.bls_hint;
INSERT INTO nutrition.food_categories (slug, name_de, name_en, name_th, parent_id, level, icon, sort_order, bls_hint)
VALUES ('softdrinks-limonaden', 'Softdrinks & Limonaden', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'getraenke'), 2, '', 720, '')
ON CONFLICT (slug) DO UPDATE SET
  name_de = EXCLUDED.name_de,
  name_en = EXCLUDED.name_en,
  name_th = EXCLUDED.name_th,
  parent_id = EXCLUDED.parent_id,
  level = EXCLUDED.level,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  bls_hint = EXCLUDED.bls_hint;
INSERT INTO nutrition.food_categories (slug, name_de, name_en, name_th, parent_id, level, icon, sort_order, bls_hint)
VALUES ('sportgetraenke-isotonische', 'Sportgetränke & Isotonische', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'getraenke'), 2, '', 730, '')
ON CONFLICT (slug) DO UPDATE SET
  name_de = EXCLUDED.name_de,
  name_en = EXCLUDED.name_en,
  name_th = EXCLUDED.name_th,
  parent_id = EXCLUDED.parent_id,
  level = EXCLUDED.level,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  bls_hint = EXCLUDED.bls_hint;
INSERT INTO nutrition.food_categories (slug, name_de, name_en, name_th, parent_id, level, icon, sort_order, bls_hint)
VALUES ('alkoholische-getraenke', 'Alkoholische Getränke', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'getraenke'), 2, '', 740, '')
ON CONFLICT (slug) DO UPDATE SET
  name_de = EXCLUDED.name_de,
  name_en = EXCLUDED.name_en,
  name_th = EXCLUDED.name_th,
  parent_id = EXCLUDED.parent_id,
  level = EXCLUDED.level,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  bls_hint = EXCLUDED.bls_hint;
INSERT INTO nutrition.food_categories (slug, name_de, name_en, name_th, parent_id, level, icon, sort_order, bls_hint)
VALUES ('bruehen-suppen', 'Brühen & Suppen', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'fertiggerichte-zubereitungen'), 2, '', 760, '')
ON CONFLICT (slug) DO UPDATE SET
  name_de = EXCLUDED.name_de,
  name_en = EXCLUDED.name_en,
  name_th = EXCLUDED.name_th,
  parent_id = EXCLUDED.parent_id,
  level = EXCLUDED.level,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  bls_hint = EXCLUDED.bls_hint;
INSERT INTO nutrition.food_categories (slug, name_de, name_en, name_th, parent_id, level, icon, sort_order, bls_hint)
VALUES ('fleischgerichte-zubereitet', 'Fleischgerichte (zubereitet)', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'fertiggerichte-zubereitungen'), 2, '', 770, '')
ON CONFLICT (slug) DO UPDATE SET
  name_de = EXCLUDED.name_de,
  name_en = EXCLUDED.name_en,
  name_th = EXCLUDED.name_th,
  parent_id = EXCLUDED.parent_id,
  level = EXCLUDED.level,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  bls_hint = EXCLUDED.bls_hint;
INSERT INTO nutrition.food_categories (slug, name_de, name_en, name_th, parent_id, level, icon, sort_order, bls_hint)
VALUES ('fischgerichte-zubereitet', 'Fischgerichte (zubereitet)', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'fertiggerichte-zubereitungen'), 2, '', 780, '')
ON CONFLICT (slug) DO UPDATE SET
  name_de = EXCLUDED.name_de,
  name_en = EXCLUDED.name_en,
  name_th = EXCLUDED.name_th,
  parent_id = EXCLUDED.parent_id,
  level = EXCLUDED.level,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  bls_hint = EXCLUDED.bls_hint;
INSERT INTO nutrition.food_categories (slug, name_de, name_en, name_th, parent_id, level, icon, sort_order, bls_hint)
VALUES ('eier-zubereitungen', 'Eier-Zubereitungen', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'fertiggerichte-zubereitungen'), 2, '', 790, '')
ON CONFLICT (slug) DO UPDATE SET
  name_de = EXCLUDED.name_de,
  name_en = EXCLUDED.name_en,
  name_th = EXCLUDED.name_th,
  parent_id = EXCLUDED.parent_id,
  level = EXCLUDED.level,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  bls_hint = EXCLUDED.bls_hint;
INSERT INTO nutrition.food_categories (slug, name_de, name_en, name_th, parent_id, level, icon, sort_order, bls_hint)
VALUES ('vegetarisch-vegan-zubereitet', 'Vegetarisch/Vegan (zubereitet)', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'fertiggerichte-zubereitungen'), 2, '', 800, '')
ON CONFLICT (slug) DO UPDATE SET
  name_de = EXCLUDED.name_de,
  name_en = EXCLUDED.name_en,
  name_th = EXCLUDED.name_th,
  parent_id = EXCLUDED.parent_id,
  level = EXCLUDED.level,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  bls_hint = EXCLUDED.bls_hint;
INSERT INTO nutrition.food_categories (slug, name_de, name_en, name_th, parent_id, level, icon, sort_order, bls_hint)
VALUES ('pasta-getreidegerichte-zubereitet', 'Pasta & Getreidegerichte (zubereitet)', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'fertiggerichte-zubereitungen'), 2, '', 810, '')
ON CONFLICT (slug) DO UPDATE SET
  name_de = EXCLUDED.name_de,
  name_en = EXCLUDED.name_en,
  name_th = EXCLUDED.name_th,
  parent_id = EXCLUDED.parent_id,
  level = EXCLUDED.level,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  bls_hint = EXCLUDED.bls_hint;
INSERT INTO nutrition.food_categories (slug, name_de, name_en, name_th, parent_id, level, icon, sort_order, bls_hint)
VALUES ('desserts-zubereitet', 'Desserts (zubereitet)', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'fertiggerichte-zubereitungen'), 2, '', 820, '')
ON CONFLICT (slug) DO UPDATE SET
  name_de = EXCLUDED.name_de,
  name_en = EXCLUDED.name_en,
  name_th = EXCLUDED.name_th,
  parent_id = EXCLUDED.parent_id,
  level = EXCLUDED.level,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  bls_hint = EXCLUDED.bls_hint;
INSERT INTO nutrition.food_categories (slug, name_de, name_en, name_th, parent_id, level, icon, sort_order, bls_hint)
VALUES ('tiefkuehlprodukte', 'Tiefkühlprodukte', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'fertiggerichte-zubereitungen'), 2, '', 830, '')
ON CONFLICT (slug) DO UPDATE SET
  name_de = EXCLUDED.name_de,
  name_en = EXCLUDED.name_en,
  name_th = EXCLUDED.name_th,
  parent_id = EXCLUDED.parent_id,
  level = EXCLUDED.level,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  bls_hint = EXCLUDED.bls_hint;
INSERT INTO nutrition.food_categories (slug, name_de, name_en, name_th, parent_id, level, icon, sort_order, bls_hint)
VALUES ('gewuerze-kraeuter', 'Gewürze & Kräuter', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'wuerzmittel-gewuerze'), 2, '', 850, '')
ON CONFLICT (slug) DO UPDATE SET
  name_de = EXCLUDED.name_de,
  name_en = EXCLUDED.name_en,
  name_th = EXCLUDED.name_th,
  parent_id = EXCLUDED.parent_id,
  level = EXCLUDED.level,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  bls_hint = EXCLUDED.bls_hint;
INSERT INTO nutrition.food_categories (slug, name_de, name_en, name_th, parent_id, level, icon, sort_order, bls_hint)
VALUES ('saucen-dips-marinaden', 'Saucen, Dips & Marinaden', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'wuerzmittel-gewuerze'), 2, '', 860, '')
ON CONFLICT (slug) DO UPDATE SET
  name_de = EXCLUDED.name_de,
  name_en = EXCLUDED.name_en,
  name_th = EXCLUDED.name_th,
  parent_id = EXCLUDED.parent_id,
  level = EXCLUDED.level,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  bls_hint = EXCLUDED.bls_hint;
INSERT INTO nutrition.food_categories (slug, name_de, name_en, name_th, parent_id, level, icon, sort_order, bls_hint)
VALUES ('essig', 'Essig', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'wuerzmittel-gewuerze'), 2, '', 870, '')
ON CONFLICT (slug) DO UPDATE SET
  name_de = EXCLUDED.name_de,
  name_en = EXCLUDED.name_en,
  name_th = EXCLUDED.name_th,
  parent_id = EXCLUDED.parent_id,
  level = EXCLUDED.level,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  bls_hint = EXCLUDED.bls_hint;
INSERT INTO nutrition.food_categories (slug, name_de, name_en, name_th, parent_id, level, icon, sort_order, bls_hint)
VALUES ('salze', 'Salze', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'wuerzmittel-gewuerze'), 2, '', 880, '')
ON CONFLICT (slug) DO UPDATE SET
  name_de = EXCLUDED.name_de,
  name_en = EXCLUDED.name_en,
  name_th = EXCLUDED.name_th,
  parent_id = EXCLUDED.parent_id,
  level = EXCLUDED.level,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  bls_hint = EXCLUDED.bls_hint;

-- Deterministic V1 tag definitions from SPEC_04/SPEC_05.
INSERT INTO nutrition.tag_definitions (code, name_de, name_en, tag_type, is_exclusion_relevant, icon, sort_order, requires_macro_check, macro_rule)
VALUES ('high_protein', 'Proteinreich', 'High protein', 'diet', false, '', 10, true, '{"nutrient_code":"PROT625","op":">=","value":20}'::jsonb)
ON CONFLICT (code) DO UPDATE SET
  name_de = EXCLUDED.name_de,
  name_en = EXCLUDED.name_en,
  tag_type = EXCLUDED.tag_type,
  is_exclusion_relevant = EXCLUDED.is_exclusion_relevant,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  requires_macro_check = EXCLUDED.requires_macro_check,
  macro_rule = EXCLUDED.macro_rule;
INSERT INTO nutrition.tag_definitions (code, name_de, name_en, tag_type, is_exclusion_relevant, icon, sort_order, requires_macro_check, macro_rule)
VALUES ('low_carb', 'Low-Carb', 'Low carb', 'diet', false, '', 20, true, '{"nutrient_code":"CHO","op":"<=","value":10}'::jsonb)
ON CONFLICT (code) DO UPDATE SET
  name_de = EXCLUDED.name_de,
  name_en = EXCLUDED.name_en,
  tag_type = EXCLUDED.tag_type,
  is_exclusion_relevant = EXCLUDED.is_exclusion_relevant,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  requires_macro_check = EXCLUDED.requires_macro_check,
  macro_rule = EXCLUDED.macro_rule;
INSERT INTO nutrition.tag_definitions (code, name_de, name_en, tag_type, is_exclusion_relevant, icon, sort_order, requires_macro_check, macro_rule)
VALUES ('low_fat', 'Fettarm', 'Low fat', 'diet', false, '', 30, true, '{"nutrient_code":"FAT","op":"<=","value":3}'::jsonb)
ON CONFLICT (code) DO UPDATE SET
  name_de = EXCLUDED.name_de,
  name_en = EXCLUDED.name_en,
  tag_type = EXCLUDED.tag_type,
  is_exclusion_relevant = EXCLUDED.is_exclusion_relevant,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  requires_macro_check = EXCLUDED.requires_macro_check,
  macro_rule = EXCLUDED.macro_rule;
INSERT INTO nutrition.tag_definitions (code, name_de, name_en, tag_type, is_exclusion_relevant, icon, sort_order, requires_macro_check, macro_rule)
VALUES ('high_fiber', 'Ballaststoffreich', 'High fiber', 'diet', false, '', 40, true, '{"nutrient_code":"FIBT","op":">=","value":6}'::jsonb)
ON CONFLICT (code) DO UPDATE SET
  name_de = EXCLUDED.name_de,
  name_en = EXCLUDED.name_en,
  tag_type = EXCLUDED.tag_type,
  is_exclusion_relevant = EXCLUDED.is_exclusion_relevant,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  requires_macro_check = EXCLUDED.requires_macro_check,
  macro_rule = EXCLUDED.macro_rule;
INSERT INTO nutrition.tag_definitions (code, name_de, name_en, tag_type, is_exclusion_relevant, icon, sort_order, requires_macro_check, macro_rule)
VALUES ('vegan', 'Vegan', 'Vegan', 'diet', true, '', 50, false, NULL)
ON CONFLICT (code) DO UPDATE SET
  name_de = EXCLUDED.name_de,
  name_en = EXCLUDED.name_en,
  tag_type = EXCLUDED.tag_type,
  is_exclusion_relevant = EXCLUDED.is_exclusion_relevant,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  requires_macro_check = EXCLUDED.requires_macro_check,
  macro_rule = EXCLUDED.macro_rule;
INSERT INTO nutrition.tag_definitions (code, name_de, name_en, tag_type, is_exclusion_relevant, icon, sort_order, requires_macro_check, macro_rule)
VALUES ('vegetarian', 'Vegetarisch', 'Vegetarian', 'diet', true, '', 60, false, NULL)
ON CONFLICT (code) DO UPDATE SET
  name_de = EXCLUDED.name_de,
  name_en = EXCLUDED.name_en,
  tag_type = EXCLUDED.tag_type,
  is_exclusion_relevant = EXCLUDED.is_exclusion_relevant,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  requires_macro_check = EXCLUDED.requires_macro_check,
  macro_rule = EXCLUDED.macro_rule;
INSERT INTO nutrition.tag_definitions (code, name_de, name_en, tag_type, is_exclusion_relevant, icon, sort_order, requires_macro_check, macro_rule)
VALUES ('gluten_free', 'Glutenfrei', 'Gluten free', 'diet', true, '', 70, false, NULL)
ON CONFLICT (code) DO UPDATE SET
  name_de = EXCLUDED.name_de,
  name_en = EXCLUDED.name_en,
  tag_type = EXCLUDED.tag_type,
  is_exclusion_relevant = EXCLUDED.is_exclusion_relevant,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  requires_macro_check = EXCLUDED.requires_macro_check,
  macro_rule = EXCLUDED.macro_rule;
INSERT INTO nutrition.tag_definitions (code, name_de, name_en, tag_type, is_exclusion_relevant, icon, sort_order, requires_macro_check, macro_rule)
VALUES ('lactose_free', 'Laktosefrei', 'Lactose free', 'diet', true, '', 80, false, NULL)
ON CONFLICT (code) DO UPDATE SET
  name_de = EXCLUDED.name_de,
  name_en = EXCLUDED.name_en,
  tag_type = EXCLUDED.tag_type,
  is_exclusion_relevant = EXCLUDED.is_exclusion_relevant,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  requires_macro_check = EXCLUDED.requires_macro_check,
  macro_rule = EXCLUDED.macro_rule;
INSERT INTO nutrition.tag_definitions (code, name_de, name_en, tag_type, is_exclusion_relevant, icon, sort_order, requires_macro_check, macro_rule)
VALUES ('nut_free', 'Nussfrei', 'Nut free', 'allergen', true, '', 90, false, NULL)
ON CONFLICT (code) DO UPDATE SET
  name_de = EXCLUDED.name_de,
  name_en = EXCLUDED.name_en,
  tag_type = EXCLUDED.tag_type,
  is_exclusion_relevant = EXCLUDED.is_exclusion_relevant,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  requires_macro_check = EXCLUDED.requires_macro_check,
  macro_rule = EXCLUDED.macro_rule;
INSERT INTO nutrition.tag_definitions (code, name_de, name_en, tag_type, is_exclusion_relevant, icon, sort_order, requires_macro_check, macro_rule)
VALUES ('halal', 'Halal', 'Halal', 'diet', false, '', 100, false, NULL)
ON CONFLICT (code) DO UPDATE SET
  name_de = EXCLUDED.name_de,
  name_en = EXCLUDED.name_en,
  tag_type = EXCLUDED.tag_type,
  is_exclusion_relevant = EXCLUDED.is_exclusion_relevant,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  requires_macro_check = EXCLUDED.requires_macro_check,
  macro_rule = EXCLUDED.macro_rule;
INSERT INTO nutrition.tag_definitions (code, name_de, name_en, tag_type, is_exclusion_relevant, icon, sort_order, requires_macro_check, macro_rule)
VALUES ('kosher', 'Koscher', 'Kosher', 'diet', false, '', 110, false, NULL)
ON CONFLICT (code) DO UPDATE SET
  name_de = EXCLUDED.name_de,
  name_en = EXCLUDED.name_en,
  tag_type = EXCLUDED.tag_type,
  is_exclusion_relevant = EXCLUDED.is_exclusion_relevant,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  requires_macro_check = EXCLUDED.requires_macro_check,
  macro_rule = EXCLUDED.macro_rule;
INSERT INTO nutrition.tag_definitions (code, name_de, name_en, tag_type, is_exclusion_relevant, icon, sort_order, requires_macro_check, macro_rule)
VALUES ('spicy', 'Scharf', 'Spicy', 'diet', false, '', 120, false, NULL)
ON CONFLICT (code) DO UPDATE SET
  name_de = EXCLUDED.name_de,
  name_en = EXCLUDED.name_en,
  tag_type = EXCLUDED.tag_type,
  is_exclusion_relevant = EXCLUDED.is_exclusion_relevant,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  requires_macro_check = EXCLUDED.requires_macro_check,
  macro_rule = EXCLUDED.macro_rule;
INSERT INTO nutrition.tag_definitions (code, name_de, name_en, tag_type, is_exclusion_relevant, icon, sort_order, requires_macro_check, macro_rule)
VALUES ('thai_food', 'Thai Food', 'Thai food', 'diet', false, '', 130, false, NULL)
ON CONFLICT (code) DO UPDATE SET
  name_de = EXCLUDED.name_de,
  name_en = EXCLUDED.name_en,
  tag_type = EXCLUDED.tag_type,
  is_exclusion_relevant = EXCLUDED.is_exclusion_relevant,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  requires_macro_check = EXCLUDED.requires_macro_check,
  macro_rule = EXCLUDED.macro_rule;
INSERT INTO nutrition.tag_definitions (code, name_de, name_en, tag_type, is_exclusion_relevant, icon, sort_order, requires_macro_check, macro_rule)
VALUES ('mediterranean', 'Mediterran', 'Mediterranean', 'diet', false, '', 140, false, NULL)
ON CONFLICT (code) DO UPDATE SET
  name_de = EXCLUDED.name_de,
  name_en = EXCLUDED.name_en,
  tag_type = EXCLUDED.tag_type,
  is_exclusion_relevant = EXCLUDED.is_exclusion_relevant,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  requires_macro_check = EXCLUDED.requires_macro_check,
  macro_rule = EXCLUDED.macro_rule;
INSERT INTO nutrition.tag_definitions (code, name_de, name_en, tag_type, is_exclusion_relevant, icon, sort_order, requires_macro_check, macro_rule)
VALUES ('processed_food', 'Verarbeitet', 'Processed food', 'processing', false, '', 150, false, NULL)
ON CONFLICT (code) DO UPDATE SET
  name_de = EXCLUDED.name_de,
  name_en = EXCLUDED.name_en,
  tag_type = EXCLUDED.tag_type,
  is_exclusion_relevant = EXCLUDED.is_exclusion_relevant,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  requires_macro_check = EXCLUDED.requires_macro_check,
  macro_rule = EXCLUDED.macro_rule;
INSERT INTO nutrition.tag_definitions (code, name_de, name_en, tag_type, is_exclusion_relevant, icon, sort_order, requires_macro_check, macro_rule)
VALUES ('ultra_processed', 'Hochverarbeitet', 'Ultra-processed', 'processing', false, '', 160, false, NULL)
ON CONFLICT (code) DO UPDATE SET
  name_de = EXCLUDED.name_de,
  name_en = EXCLUDED.name_en,
  tag_type = EXCLUDED.tag_type,
  is_exclusion_relevant = EXCLUDED.is_exclusion_relevant,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  requires_macro_check = EXCLUDED.requires_macro_check,
  macro_rule = EXCLUDED.macro_rule;

-- Provisional/source-backed display fields. Values remain source labels, not curated human copy.
UPDATE nutrition.foods
SET
  name_display = COALESCE(NULLIF(name_display, ''), name_de),
  name_display_en = COALESCE(NULLIF(name_display_en, ''), name_en),
  name_display_th = COALESCE(name_display_th, '');

-- Deterministic category assignment using BLS prefix and explicit SPEC_08-style code/name rules.
UPDATE nutrition.foods
SET category_id = CASE
  WHEN bls_code LIKE 'T102%' OR bls_code LIKE 'T103%' OR bls_code LIKE 'T106%' THEN (SELECT id FROM nutrition.food_categories WHERE slug='fetter-seefisch')
  WHEN bls_code LIKE 'T5%' OR bls_code LIKE 'T6%' THEN (SELECT id FROM nutrition.food_categories WHERE slug='suesswasserfisch')
  WHEN bls_code LIKE 'T73%' THEN (SELECT id FROM nutrition.food_categories WHERE slug='schalentiere')
  WHEN bls_code LIKE 'T78%' OR bls_code LIKE 'T79%' THEN (SELECT id FROM nutrition.food_categories WHERE slug='weichtiere-andere')
  WHEN bls_code LIKE 'T%' THEN (SELECT id FROM nutrition.food_categories WHERE slug='magerer-seefisch')
  WHEN bls_code LIKE 'U0%' OR bls_code LIKE 'U1%' OR bls_code LIKE 'U2%' THEN (SELECT id FROM nutrition.food_categories WHERE slug='rindfleisch')
  WHEN bls_code LIKE 'U3%' OR bls_code LIKE 'U4%' THEN (SELECT id FROM nutrition.food_categories WHERE slug='kalbfleisch')
  WHEN bls_code LIKE 'U5%' OR bls_code LIKE 'U6%' THEN (SELECT id FROM nutrition.food_categories WHERE slug='schweinefleisch')
  WHEN bls_code LIKE 'U7%' OR bls_code LIKE 'U8%' THEN (SELECT id FROM nutrition.food_categories WHERE slug='lamm-schaf')
  WHEN bls_code LIKE 'V4%' THEN (SELECT id FROM nutrition.food_categories WHERE slug='gefluegel')
  WHEN bls_code LIKE 'V5%' OR bls_code LIKE 'V6%' THEN (SELECT id FROM nutrition.food_categories WHERE slug='innereien')
  WHEN bls_code LIKE 'W%' THEN (SELECT id FROM nutrition.food_categories WHERE slug='wurstwaren-aufschnitt')
  WHEN bls_code LIKE 'M%' AND lower(name_de) LIKE '%joghurt%' THEN (SELECT id FROM nutrition.food_categories WHERE slug='joghurt-quark')
  WHEN bls_code LIKE 'M%' AND (lower(name_de) LIKE '%käse%' OR lower(name_de) LIKE '%kaese%' OR lower(name_de) LIKE '%quark%' OR lower(name_de) LIKE '%mozzarella%' OR lower(name_de) LIKE '%gouda%' OR lower(name_de) LIKE '%camembert%') THEN (SELECT id FROM nutrition.food_categories WHERE slug='kaese-frischkaese')
  WHEN bls_code LIKE 'M%' THEN (SELECT id FROM nutrition.food_categories WHERE slug='trinkmilch-sahne')
  WHEN bls_code LIKE 'E%' THEN (SELECT id FROM nutrition.food_categories WHERE slug='eier')
  WHEN bls_code LIKE 'B%' THEN (SELECT id FROM nutrition.food_categories WHERE slug='brot')
  WHEN bls_code LIKE 'C%' AND lower(name_de) LIKE '%pasta%' THEN (SELECT id FROM nutrition.food_categories WHERE slug='pasta-teigwaren')
  WHEN bls_code LIKE 'C%' THEN (SELECT id FROM nutrition.food_categories WHERE slug='rohe-koerner-flocken-pseudogetreide')
  WHEN bls_code LIKE 'G%' THEN (SELECT id FROM nutrition.food_categories WHERE slug='gemuese')
  WHEN bls_code LIKE 'K%' THEN (SELECT id FROM nutrition.food_categories WHERE slug='kartoffeln')
  WHEN bls_code LIKE 'F%' THEN (SELECT id FROM nutrition.food_categories WHERE slug='obst')
  WHEN bls_code LIKE 'H%' THEN (SELECT id FROM nutrition.food_categories WHERE slug='huelsenfruechte-nuesse-samen')
  WHEN bls_code LIKE 'Q%' THEN (SELECT id FROM nutrition.food_categories WHERE slug='pflanzliche-oele')
  WHEN bls_code LIKE 'S%' THEN (SELECT id FROM nutrition.food_categories WHERE slug='suesses-snacks')
  WHEN bls_code LIKE 'P%' THEN (SELECT id FROM nutrition.food_categories WHERE slug='getraenke')
  WHEN bls_code LIKE 'R%' THEN (SELECT id FROM nutrition.food_categories WHERE slug='wuerzmittel-gewuerze')
  ELSE category_id
END
WHERE category_id IS NULL;

-- Deterministic macro-derived V1 food tags only. Manual/cuisine/religious tags stay deferred.
INSERT INTO nutrition.food_tags (food_id, tag_code, confidence)
SELECT food_id, 'high_protein', 1.0 FROM nutrition.food_nutrients WHERE nutrient_code='PROT625' AND value >= 20
ON CONFLICT DO NOTHING;
INSERT INTO nutrition.food_tags (food_id, tag_code, confidence)
SELECT food_id, 'low_carb', 1.0 FROM nutrition.food_nutrients WHERE nutrient_code='CHO' AND value <= 10
ON CONFLICT DO NOTHING;
INSERT INTO nutrition.food_tags (food_id, tag_code, confidence)
SELECT food_id, 'low_fat', 1.0 FROM nutrition.food_nutrients WHERE nutrient_code='FAT' AND value <= 3
ON CONFLICT DO NOTHING;
INSERT INTO nutrition.food_tags (food_id, tag_code, confidence)
SELECT food_id, 'high_fiber', 1.0 FROM nutrition.food_nutrients WHERE nutrient_code='FIBT' AND value >= 6
ON CONFLICT DO NOTHING;

-- Source-backed aliases only: exact BLS DE label, exact source EN label when present, and deterministic normalized DE label variant.
INSERT INTO nutrition.food_aliases (food_id, alias, locale, source)
SELECT id, name_de, 'de', 'editorial'
FROM nutrition.foods
WHERE COALESCE(name_de, '') <> ''
ON CONFLICT DO NOTHING;

INSERT INTO nutrition.food_aliases (food_id, alias, locale, source)
SELECT id, name_en, 'en', 'editorial'
FROM nutrition.foods
WHERE COALESCE(name_en, '') <> ''
ON CONFLICT DO NOTHING;

INSERT INTO nutrition.food_aliases (food_id, alias, locale, source)
SELECT id,
  trim(regexp_replace(
    replace(replace(replace(replace(lower(name_de), 'ä', 'ae'), 'ö', 'oe'), 'ü', 'ue'), 'ß', 'ss'),
    '[^[:alnum:]]+', ' ', 'g'
  )),
  'de',
  'editorial'
FROM nutrition.foods
WHERE COALESCE(name_de, '') <> ''
  AND trim(regexp_replace(
    replace(replace(replace(replace(lower(name_de), 'ä', 'ae'), 'ö', 'oe'), 'ü', 'ue'), 'ß', 'ss'),
    '[^[:alnum:]]+', ' ', 'g'
  )) <> ''
  AND trim(regexp_replace(
    replace(replace(replace(replace(lower(name_de), 'ä', 'ae'), 'ö', 'oe'), 'ü', 'ue'), 'ß', 'ss'),
    '[^[:alnum:]]+', ' ', 'g'
  )) <> name_de
ON CONFLICT DO NOTHING;

COMMIT;
