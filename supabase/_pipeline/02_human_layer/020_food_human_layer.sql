-- P1-005 Local Food Taxonomy / Human Layer Foundation
-- LOCAL ONLY. Do not apply to DEV/LIVE.
-- Source refs:
-- - docs/specs/Nutrition/01_current_specs/SPEC_05_FOOD_TAXONOMY.md
-- - docs/specs/Nutrition/01_current_specs/SPEC_06_DATABASE_SCHEMA.md
-- - docs/specs/Nutrition/01_current_specs/SPEC_04_FEATURES.md
-- - docs/specs/Nutrition/01_current_specs/SPEC_08_IMPORT_PIPELINE.md
-- Boundary: deterministic schema/category/tag/alias foundation. No unsourced foods, nutrient values, aliases, or display names.

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
  macro_rule jsonb,
  filter_group text CHECK (filter_group IS NULL OR filter_group IN ('dietary_pattern','nutrient','processing','allergen'))
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
  source text NOT NULL DEFAULT 'editorial' CHECK (source IN ('editorial','ai_generated','user','derived','curated_nebenname')),
  PRIMARY KEY (food_id, alias, locale)
);
CREATE INDEX IF NOT EXISTS idx_food_aliases_food ON nutrition.food_aliases(food_id);

-- Category seed: Level 1 through Level 4 categories extracted from SPEC_05 headings and nested bullets.
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
VALUES ('fisch-meeresfruechte', 'FISCH & MEERESFRÜCHTE', '', '', NULL, 1, '🐟', 970, 'BLS prefix T')
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
VALUES ('milch-kaese', 'MILCH & KÄSE', '', '', NULL, 1, '🥛', 1360, 'BLS prefix M')
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
VALUES ('eier', 'EIER', '', '', NULL, 1, '🥚', 1860, 'BLS prefix E')
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
VALUES ('getreide-brot-pasta', 'GETREIDE, BROT & PASTA', '', '', NULL, 1, '🌾', 1870, 'BLS prefixes B,C')
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
VALUES ('gemuese', 'GEMÜSE', '', '', NULL, 1, '🥦', 2260, 'BLS prefixes G,K')
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
VALUES ('obst', 'OBST', '', '', NULL, 1, '🍎', 2850, 'BLS prefix F')
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
VALUES ('huelsenfruechte-nuesse-samen', 'HÜLSENFRÜCHTE, NÜSSE & SAMEN', '', '', NULL, 1, '🫘', 3320, 'BLS prefix H')
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
VALUES ('fette-oele', 'FETTE & ÖLE', '', '', NULL, 1, '🫒', 3770, 'BLS prefix Q')
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
VALUES ('suesses-snacks', 'SÜSSES & SNACKS', '', '', NULL, 1, '🍬', 4000, 'BLS prefix S')
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
VALUES ('getraenke', 'GETRÄNKE', '', '', NULL, 1, '🥤', 4320, 'BLS prefix P')
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
VALUES ('fertiggerichte-zubereitungen', '🍽️ FERTIGGERICHTE & ZUBEREITUNGEN', '', '', NULL, 1, '', 4620, 'prepared dish scope; BLS category varies')
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
VALUES ('wuerzmittel-gewuerze', 'WÜRZMITTEL & GEWÜRZE', '', '', NULL, 1, '🧂', 4970, 'BLS prefix R')
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
VALUES ('kalbfleisch', 'Kalbfleisch', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'fleisch-gefluegel'), 2, '', 140, '')
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
VALUES ('schweinefleisch', 'Schweinefleisch', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'fleisch-gefluegel'), 2, '', 190, '')
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
VALUES ('gefluegel', 'Geflügel', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'fleisch-gefluegel'), 2, '', 270, '')
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
VALUES ('lamm-schaf', 'Lamm & Schaf', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'fleisch-gefluegel'), 2, '', 430, '')
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
VALUES ('wild', 'Wild', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'fleisch-gefluegel'), 2, '', 490, '')
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
VALUES ('innereien', 'Innereien', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'fleisch-gefluegel'), 2, '', 610, '')
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
VALUES ('wurstwaren-aufschnitt', 'Wurstwaren & Aufschnitt', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'fleisch-gefluegel'), 2, '', 760, '')
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
VALUES ('fetter-seefisch', 'Fetter Seefisch', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'fisch-meeresfruechte'), 2, '', 980, '')
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
VALUES ('magerer-seefisch', 'Magerer Seefisch', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'fisch-meeresfruechte'), 2, '', 1050, '')
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
VALUES ('suesswasserfisch', 'Süßwasserfisch', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'fisch-meeresfruechte'), 2, '', 1120, '')
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
VALUES ('raeucherfisch-fischprodukte', 'Räucherfisch & Fischprodukte', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'fisch-meeresfruechte'), 2, '', 1180, '')
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
VALUES ('schalentiere', 'Schalentiere', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'fisch-meeresfruechte'), 2, '', 1240, '')
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
VALUES ('weichtiere-andere', 'Weichtiere & Andere', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'fisch-meeresfruechte'), 2, '', 1290, '')
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
VALUES ('trinkmilch-sahne', 'Trinkmilch & Sahne', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'milch-kaese'), 2, '', 1370, '')
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
VALUES ('joghurt-quark', 'Joghurt & Quark', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'milch-kaese'), 2, '', 1470, '')
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
VALUES ('kaese-hartkaese-45-trockenmasse', 'Käse — Hartkäse (>45% Trockenmasse)', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'milch-kaese'), 2, '', 1560, '')
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
VALUES ('kaese-schnittkaese', 'Käse — Schnittkäse', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'milch-kaese'), 2, '', 1620, '')
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
VALUES ('kaese-weichkaese', 'Käse — Weichkäse', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'milch-kaese'), 2, '', 1670, '')
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
VALUES ('kaese-frischkaese', 'Käse — Frischkäse', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'milch-kaese'), 2, '', 1710, '')
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
VALUES ('kaese-schimmelkaese', 'Käse — Schimmelkäse', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'milch-kaese'), 2, '', 1790, '')
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
VALUES ('butter-milchfette', 'Butter & Milchfette', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'milch-kaese'), 2, '', 1820, '')
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
VALUES ('brot', 'Brot', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'getreide-brot-pasta'), 2, '', 1880, '')
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
VALUES ('rohe-koerner-flocken-pseudogetreide', 'Rohe Körner, Flocken & Pseudogetreide', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'getreide-brot-pasta'), 2, '', 1950, '')
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
VALUES ('mehl-staerke', 'Mehl & Stärke', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'getreide-brot-pasta'), 2, '', 2060, '')
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
VALUES ('pasta-teigwaren', 'Pasta & Teigwaren', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'getreide-brot-pasta'), 2, '', 2130, '')
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
VALUES ('backwaren-gebaeck-snack-kategorie', 'Backwaren & Gebäck (Snack-Kategorie)', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'getreide-brot-pasta'), 2, '', 2200, '')
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
VALUES ('blattgemuese-salate', 'Blattgemüse & Salate', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'gemuese'), 2, '', 2270, '')
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
VALUES ('kreuzbluetler-brassica', 'Kreuzblütler (Brassica)', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'gemuese'), 2, '', 2340, '')
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
VALUES ('fruchtgemuese', 'Fruchtgemüse', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'gemuese'), 2, '', 2410, '')
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
VALUES ('wurzel-knollengemuese', 'Wurzel- & Knollengemüse', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'gemuese'), 2, '', 2490, '')
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
VALUES ('zwiebeln-lauch', 'Zwiebeln & Lauch', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'gemuese'), 2, '', 2570, '')
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
VALUES ('pilze', 'Pilze', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'gemuese'), 2, '', 2640, '')
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
VALUES ('kartoffeln', 'Kartoffeln', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'gemuese'), 2, '', 2710, '')
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
VALUES ('spargel-artischocken', 'Spargel & Artischocken', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'gemuese'), 2, '', 2760, '')
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
VALUES ('sprossen-keimlinge', 'Sprossen & Keimlinge', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'gemuese'), 2, '', 2800, '')
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
VALUES ('beerenfruechte', 'Beerenfrüchte', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'obst'), 2, '', 2860, '')
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
VALUES ('kernobst', 'Kernobst', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'obst'), 2, '', 2950, '')
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
VALUES ('steinobst', 'Steinobst', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'obst'), 2, '', 2980, '')
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
VALUES ('zitrusfruechte', 'Zitrusfrüchte', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'obst'), 2, '', 3040, '')
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
VALUES ('exotisches-tropisches-obst', 'Exotisches & Tropisches Obst', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'obst'), 2, '', 3100, '')
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
VALUES ('melonen', 'Melonen', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'obst'), 2, '', 3210, '')
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
VALUES ('trockenfruechte', 'Trockenfrüchte', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'obst'), 2, '', 3250, '')
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
VALUES ('huelsenfruechte', 'Hülsenfrüchte', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'huelsenfruechte-nuesse-samen'), 2, '', 3330, '')
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
VALUES ('sojaprodukte', 'Sojaprodukte', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'huelsenfruechte-nuesse-samen'), 2, '', 3430, '')
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
VALUES ('nuesse', 'Nüsse', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'huelsenfruechte-nuesse-samen'), 2, '', 3500, '')
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
VALUES ('erdnuesse-erdnussprodukte', 'Erdnüsse & Erdnussprodukte', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'huelsenfruechte-nuesse-samen'), 2, '', 3600, '')
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
VALUES ('samen-kerne', 'Samen & Kerne', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'huelsenfruechte-nuesse-samen'), 2, '', 3630, '')
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
VALUES ('nussmuse-saaten-pasten', 'Nussmuse & Saaten-Pasten', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'huelsenfruechte-nuesse-samen'), 2, '', 3720, '')
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
VALUES ('pflanzliche-oele', 'Pflanzliche Öle', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'fette-oele'), 2, '', 3780, '')
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
VALUES ('tierische-fette', 'Tierische Fette', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'fette-oele'), 2, '', 3890, '')
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
VALUES ('margarine-streichfette', 'Margarine & Streichfette', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'fette-oele'), 2, '', 3960, '')
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
VALUES ('schokolade-kakao', 'Schokolade & Kakao', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'suesses-snacks'), 2, '', 4010, '')
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
VALUES ('zucker-suessungsmittel', 'Zucker & Süßungsmittel', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'suesses-snacks'), 2, '', 4090, '')
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
VALUES ('eis-suessspeisen', 'Eis & Süßspeisen', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'suesses-snacks'), 2, '', 4180, '')
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
VALUES ('chips-salzgebaeck', 'Chips & Salzgebäck', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'suesses-snacks'), 2, '', 4220, '')
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
VALUES ('suessigkeiten-confiserie', 'Süßigkeiten & Confiserie', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'suesses-snacks'), 2, '', 4270, '')
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
VALUES ('wasser', 'Wasser', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'getraenke'), 2, '', 4330, '')
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
VALUES ('kaffee-tee', 'Kaffee & Tee', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'getraenke'), 2, '', 4370, '')
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
VALUES ('fruchtsaefte-smoothies', 'Fruchtsäfte & Smoothies', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'getraenke'), 2, '', 4430, '')
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
VALUES ('softdrinks-limonaden', 'Softdrinks & Limonaden', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'getraenke'), 2, '', 4470, '')
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
VALUES ('sportgetraenke-isotonische', 'Sportgetränke & Isotonische', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'getraenke'), 2, '', 4520, '')
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
VALUES ('alkoholische-getraenke', 'Alkoholische Getränke', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'getraenke'), 2, '', 4560, '')
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
VALUES ('bruehen-suppen', 'Brühen & Suppen', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'fertiggerichte-zubereitungen'), 2, '', 4630, '')
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
VALUES ('fleischgerichte-zubereitet', 'Fleischgerichte (zubereitet)', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'fertiggerichte-zubereitungen'), 2, '', 4680, '')
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
VALUES ('fischgerichte-zubereitet', 'Fischgerichte (zubereitet)', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'fertiggerichte-zubereitungen'), 2, '', 4730, '')
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
VALUES ('eier-zubereitungen', 'Eier-Zubereitungen', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'fertiggerichte-zubereitungen'), 2, '', 4770, '')
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
VALUES ('vegetarisch-vegan-zubereitet', 'Vegetarisch/Vegan (zubereitet)', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'fertiggerichte-zubereitungen'), 2, '', 4810, '')
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
VALUES ('pasta-getreidegerichte-zubereitet', 'Pasta & Getreidegerichte (zubereitet)', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'fertiggerichte-zubereitungen'), 2, '', 4850, '')
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
VALUES ('desserts-zubereitet', 'Desserts (zubereitet)', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'fertiggerichte-zubereitungen'), 2, '', 4890, '')
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
VALUES ('tiefkuehlprodukte', 'Tiefkühlprodukte', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'fertiggerichte-zubereitungen'), 2, '', 4930, '')
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
VALUES ('gewuerze-kraeuter', 'Gewürze & Kräuter', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'wuerzmittel-gewuerze'), 2, '', 4980, '')
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
VALUES ('saucen-dips-marinaden', 'Saucen, Dips & Marinaden', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'wuerzmittel-gewuerze'), 2, '', 5030, '')
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
VALUES ('essig', 'Essig', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'wuerzmittel-gewuerze'), 2, '', 5110, '')
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
VALUES ('salze', 'Salze', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'wuerzmittel-gewuerze'), 2, '', 5150, '')
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
VALUES ('rindfleisch-rinderhackfleisch-u0xxxx-rind', 'Rinderhackfleisch (U0xxxx Rind)', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'rindfleisch'), 3, '', 30, '')
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
VALUES ('rindfleisch-rindersteaks-braten', 'Rindersteaks & Braten', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'rindfleisch'), 3, '', 40, '')
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
VALUES ('rindfleisch-rindfleisch-konserven-saucen', 'Rindfleisch Konserven & Saucen', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'rindfleisch'), 3, '', 130, '')
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
VALUES ('kalbfleisch-kalbsschnitzel-roulade', 'Kalbsschnitzel & Roulade', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'kalbfleisch'), 3, '', 150, '')
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
VALUES ('kalbfleisch-kalbsfilet-steaks', 'Kalbsfilet & Steaks', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'kalbfleisch'), 3, '', 160, '')
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
VALUES ('kalbfleisch-kalbsgulasch-braten', 'Kalbsgulasch & Braten', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'kalbfleisch'), 3, '', 170, '')
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
VALUES ('kalbfleisch-kalbshackfleisch', 'Kalbshackfleisch', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'kalbfleisch'), 3, '', 180, '')
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
VALUES ('schweinefleisch-schweinefilet-medaillons', 'Schweinefilet & Medaillons', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'schweinefleisch'), 3, '', 200, '')
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
VALUES ('schweinefleisch-schweinekoteletts-nacken', 'Schweinekoteletts & Nacken', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'schweinefleisch'), 3, '', 210, '')
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
VALUES ('schweinefleisch-schweinebauch-wamme', 'Schweinebauch & Wamme', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'schweinefleisch'), 3, '', 220, '')
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
VALUES ('schweinefleisch-schweinespeck-rueckenspeck', 'Schweinespeck & Rückenspeck', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'schweinefleisch'), 3, '', 230, '')
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
VALUES ('schweinefleisch-schweinehackfleisch', 'Schweinehackfleisch', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'schweinefleisch'), 3, '', 240, '')
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
VALUES ('schweinefleisch-schmorbraten-gulasch-schwein', 'Schmorbraten & Gulasch (Schwein)', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'schweinefleisch'), 3, '', 250, '')
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
VALUES ('schweinefleisch-poekelwaren-schinken-roh', 'Pökelwaren & Schinken (roh)', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'schweinefleisch'), 3, '', 260, '')
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
VALUES ('gefluegel-haehnchen', 'Hähnchen', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'gefluegel'), 3, '', 280, '')
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
VALUES ('gefluegel-pute-truthahn', 'Pute/Truthahn', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'gefluegel'), 3, '', 330, '')
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
VALUES ('gefluegel-ente', 'Ente', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'gefluegel'), 3, '', 370, '')
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
VALUES ('gefluegel-gans', 'Gans', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'gefluegel'), 3, '', 410, '')
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
VALUES ('gefluegel-poularde-sonstiges-hausgefluegel', 'Poularde & sonstiges Hausgeflügel', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'gefluegel'), 3, '', 420, '')
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
VALUES ('lamm-schaf-lammkeule-lammruecken', 'Lammkeule & Lammrücken', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'lamm-schaf'), 3, '', 440, '')
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
VALUES ('lamm-schaf-lammkoteletts-lammcarre', 'Lammkoteletts & Lammcarré', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'lamm-schaf'), 3, '', 450, '')
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
VALUES ('lamm-schaf-lammschulter-lammhaxe', 'Lammschulter & Lammhaxe', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'lamm-schaf'), 3, '', 460, '')
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
VALUES ('lamm-schaf-lammhackfleisch', 'Lammhackfleisch', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'lamm-schaf'), 3, '', 470, '')
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
VALUES ('lamm-schaf-schaf-hammel', 'Schaf & Hammel', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'lamm-schaf'), 3, '', 480, '')
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
VALUES ('wild-hase-kaninchen', 'Hase & Kaninchen', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'wild'), 3, '', 500, '')
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
VALUES ('wild-hirsch-reh', 'Hirsch & Reh', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'wild'), 3, '', 540, '')
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
VALUES ('wild-wildschwein', 'Wildschwein', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'wild'), 3, '', 550, '')
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
VALUES ('wild-wildgefluegel', 'Wildgeflügel', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'wild'), 3, '', 560, '')
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
VALUES ('wild-sonstiges-wild-rentier-pferd-ziege', 'Sonstiges Wild (Rentier, Pferd, Ziege)', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'wild'), 3, '', 600, '')
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
VALUES ('innereien-leber', 'Leber', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'innereien'), 3, '', 620, '')
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
VALUES ('innereien-herz', 'Herz', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'innereien'), 3, '', 670, '')
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
VALUES ('innereien-niere', 'Niere', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'innereien'), 3, '', 690, '')
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
VALUES ('innereien-lunge', 'Lunge', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'innereien'), 3, '', 700, '')
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
VALUES ('innereien-gehirn', 'Gehirn', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'innereien'), 3, '', 710, '')
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
VALUES ('innereien-magen-kutteln', 'Magen & Kutteln', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'innereien'), 3, '', 720, '')
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
VALUES ('innereien-zunge', 'Zunge', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'innereien'), 3, '', 730, '')
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
VALUES ('innereien-bries-thymus', 'Bries (Thymus)', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'innereien'), 3, '', 740, '')
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
VALUES ('innereien-blut-blutprodukte', 'Blut & Blutprodukte', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'innereien'), 3, '', 750, '')
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
VALUES ('wurstwaren-aufschnitt-kochwurst', 'Kochwurst', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'wurstwaren-aufschnitt'), 3, '', 770, '')
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
VALUES ('wurstwaren-aufschnitt-bruehwurst', 'Brühwurst', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'wurstwaren-aufschnitt'), 3, '', 810, '')
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
VALUES ('wurstwaren-aufschnitt-rohwurst', 'Rohwurst', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'wurstwaren-aufschnitt'), 3, '', 860, '')
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
VALUES ('wurstwaren-aufschnitt-rohpoekelware-schinken', 'Rohpökelware & Schinken', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'wurstwaren-aufschnitt'), 3, '', 910, '')
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
VALUES ('fetter-seefisch-lachs-atlantischer-lachs', 'Lachs & Atlantischer Lachs', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'fetter-seefisch'), 3, '', 990, '')
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
VALUES ('fetter-seefisch-hering', 'Hering', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'fetter-seefisch'), 3, '', 1000, '')
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
VALUES ('fetter-seefisch-makrele', 'Makrele', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'fetter-seefisch'), 3, '', 1010, '')
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
VALUES ('fetter-seefisch-thunfisch', 'Thunfisch', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'fetter-seefisch'), 3, '', 1020, '')
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
VALUES ('fetter-seefisch-sardine-sardelle', 'Sardine & Sardelle', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'fetter-seefisch'), 3, '', 1030, '')
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
VALUES ('fetter-seefisch-heilbutt', 'Heilbutt', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'fetter-seefisch'), 3, '', 1040, '')
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
VALUES ('magerer-seefisch-kabeljau-dorsch', 'Kabeljau & Dorsch', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'magerer-seefisch'), 3, '', 1060, '')
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
VALUES ('magerer-seefisch-seelachs-pollack', 'Seelachs & Pollack', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'magerer-seefisch'), 3, '', 1070, '')
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
VALUES ('magerer-seefisch-scholle-seezunge', 'Scholle & Seezunge', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'magerer-seefisch'), 3, '', 1080, '')
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
VALUES ('magerer-seefisch-steinbutt', 'Steinbutt', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'magerer-seefisch'), 3, '', 1090, '')
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
VALUES ('magerer-seefisch-rotbarsch', 'Rotbarsch', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'magerer-seefisch'), 3, '', 1100, '')
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
VALUES ('magerer-seefisch-forelle-meerforelle', 'Forelle (Meerforelle)', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'magerer-seefisch'), 3, '', 1110, '')
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
VALUES ('suesswasserfisch-forelle-regenbogen-bach', 'Forelle (Regenbogen, Bach)', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'suesswasserfisch'), 3, '', 1130, '')
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
VALUES ('suesswasserfisch-karpfen', 'Karpfen', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'suesswasserfisch'), 3, '', 1140, '')
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
VALUES ('suesswasserfisch-zander-barsch', 'Zander & Barsch', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'suesswasserfisch'), 3, '', 1150, '')
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
VALUES ('suesswasserfisch-hecht', 'Hecht', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'suesswasserfisch'), 3, '', 1160, '')
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
VALUES ('suesswasserfisch-aal', 'Aal', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'suesswasserfisch'), 3, '', 1170, '')
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
VALUES ('raeucherfisch-fischprodukte-raeucherlachs', 'Räucherlachs', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'raeucherfisch-fischprodukte'), 3, '', 1190, '')
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
VALUES ('raeucherfisch-fischprodukte-bueckling-raeucherhering', 'Bückling (Räucherhering)', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'raeucherfisch-fischprodukte'), 3, '', 1200, '')
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
VALUES ('raeucherfisch-fischprodukte-makrele-geraeuchert', 'Makrele geräuchert', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'raeucherfisch-fischprodukte'), 3, '', 1210, '')
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
VALUES ('raeucherfisch-fischprodukte-fischkonserven-thunfisch-sardinen-in-oel-wasser', 'Fischkonserven (Thunfisch, Sardinen in Öl/Wasser)', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'raeucherfisch-fischprodukte'), 3, '', 1220, '')
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
VALUES ('raeucherfisch-fischprodukte-fischpaste-kaviar', 'Fischpaste & Kaviar', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'raeucherfisch-fischprodukte'), 3, '', 1230, '')
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
VALUES ('schalentiere-garnelen-shrimps', 'Garnelen & Shrimps', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'schalentiere'), 3, '', 1250, '')
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
VALUES ('schalentiere-hummer-langusten', 'Hummer & Langusten', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'schalentiere'), 3, '', 1260, '')
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
VALUES ('schalentiere-krabben-taschenkrebse', 'Krabben & Taschenkrebse', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'schalentiere'), 3, '', 1270, '')
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
VALUES ('schalentiere-flusskrebse', 'Flusskrebse', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'schalentiere'), 3, '', 1280, '')
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
VALUES ('weichtiere-andere-miesmuscheln', 'Miesmuscheln', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'weichtiere-andere'), 3, '', 1300, '')
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
VALUES ('weichtiere-andere-jakobsmuscheln-venusmuscheln', 'Jakobsmuscheln & Venusmuscheln', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'weichtiere-andere'), 3, '', 1310, '')
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
VALUES ('weichtiere-andere-austern', 'Austern', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'weichtiere-andere'), 3, '', 1320, '')
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
VALUES ('weichtiere-andere-tintenfisch-calamari', 'Tintenfisch & Calamari', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'weichtiere-andere'), 3, '', 1330, '')
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
VALUES ('weichtiere-andere-oktopus', 'Oktopus', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'weichtiere-andere'), 3, '', 1340, '')
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
VALUES ('weichtiere-andere-schnecken-escargot', 'Schnecken & Escargot', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'weichtiere-andere'), 3, '', 1350, '')
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
VALUES ('trinkmilch-sahne-vollmilch-3-5-fett', 'Vollmilch (3,5% Fett)', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'trinkmilch-sahne'), 3, '', 1380, '')
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
VALUES ('trinkmilch-sahne-fettarme-milch-1-5', 'Fettarme Milch (1,5%)', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'trinkmilch-sahne'), 3, '', 1390, '')
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
VALUES ('trinkmilch-sahne-magermilch', 'Magermilch', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'trinkmilch-sahne'), 3, '', 1400, '')
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
VALUES ('trinkmilch-sahne-laktosefreie-milch', 'Laktosefreie Milch', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'trinkmilch-sahne'), 3, '', 1410, '')
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
VALUES ('trinkmilch-sahne-h-milch', 'H-Milch', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'trinkmilch-sahne'), 3, '', 1420, '')
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
VALUES ('trinkmilch-sahne-schlagsahne-30-fett', 'Schlagsahne (>30% Fett)', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'trinkmilch-sahne'), 3, '', 1430, '')
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
VALUES ('trinkmilch-sahne-saure-sahne-creme-fraiche', 'Saure Sahne & Crème fraîche', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'trinkmilch-sahne'), 3, '', 1440, '')
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
VALUES ('trinkmilch-sahne-kaffeerahm-10-15-fett', 'Kaffeerahm (10-15% Fett)', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'trinkmilch-sahne'), 3, '', 1450, '')
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
VALUES ('trinkmilch-sahne-kondensmilch-milchpulver', 'Kondensmilch & Milchpulver', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'trinkmilch-sahne'), 3, '', 1460, '')
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
VALUES ('joghurt-quark-naturjoghurt-3-5-1-5-0-1', 'Naturjoghurt (3,5%, 1,5%, 0,1%)', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'joghurt-quark'), 3, '', 1480, '')
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
VALUES ('joghurt-quark-griechischer-joghurt-10-fett', 'Griechischer Joghurt (>10% Fett)', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'joghurt-quark'), 3, '', 1490, '')
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
VALUES ('joghurt-quark-skyr', 'Skyr', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'joghurt-quark'), 3, '', 1500, '')
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
VALUES ('joghurt-quark-kefir', 'Kefir', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'joghurt-quark'), 3, '', 1510, '')
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
VALUES ('joghurt-quark-buttermilch', 'Buttermilch', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'joghurt-quark'), 3, '', 1520, '')
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
VALUES ('joghurt-quark-magerquark', 'Magerquark', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'joghurt-quark'), 3, '', 1530, '')
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
VALUES ('joghurt-quark-speisequark-10-20-40-fett', 'Speisequark (10%, 20%, 40% Fett)', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'joghurt-quark'), 3, '', 1540, '')
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
VALUES ('joghurt-quark-huettenkaese-cottage-cheese', 'Hüttenkäse/Cottage Cheese', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'joghurt-quark'), 3, '', 1550, '')
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
VALUES ('kaese-hartkaese-45-trockenmasse-parmesan-grana-padano', 'Parmesan & Grana Padano', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'kaese-hartkaese-45-trockenmasse'), 3, '', 1570, '')
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
VALUES ('kaese-hartkaese-45-trockenmasse-emmentaler-gruyere', 'Emmentaler & Gruyère', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'kaese-hartkaese-45-trockenmasse'), 3, '', 1580, '')
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
VALUES ('kaese-hartkaese-45-trockenmasse-bergkaese-allgaeuer-kaese', 'Bergkäse & Allgäuer Käse', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'kaese-hartkaese-45-trockenmasse'), 3, '', 1590, '')
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
VALUES ('kaese-hartkaese-45-trockenmasse-gouda-gereift-12-monate', 'Gouda gereift (>12 Monate)', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'kaese-hartkaese-45-trockenmasse'), 3, '', 1600, '')
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
VALUES ('kaese-hartkaese-45-trockenmasse-manchego-pecorino', 'Manchego & Pecorino', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'kaese-hartkaese-45-trockenmasse'), 3, '', 1610, '')
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
VALUES ('kaese-schnittkaese-gouda-edamer-jung-mittelalt', 'Gouda & Edamer (jung/mittelalt)', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'kaese-schnittkaese'), 3, '', 1630, '')
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
VALUES ('kaese-schnittkaese-tilsiter-butterkaese', 'Tilsiter & Butterkäse', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'kaese-schnittkaese'), 3, '', 1640, '')
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
VALUES ('kaese-schnittkaese-havarti-edam', 'Havarti & Edam', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'kaese-schnittkaese'), 3, '', 1650, '')
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
VALUES ('kaese-schnittkaese-appenzeller', 'Appenzeller', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'kaese-schnittkaese'), 3, '', 1660, '')
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
VALUES ('kaese-weichkaese-brie-camembert', 'Brie & Camembert', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'kaese-weichkaese'), 3, '', 1680, '')
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
VALUES ('kaese-weichkaese-limburger-muenster', 'Limburger & Münster', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'kaese-weichkaese'), 3, '', 1690, '')
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
VALUES ('kaese-weichkaese-taleggio', 'Taleggio', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'kaese-weichkaese'), 3, '', 1700, '')
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
VALUES ('kaese-frischkaese-mozzarella-kuh-bueffel', 'Mozzarella (Kuh, Büffel)', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'kaese-frischkaese'), 3, '', 1720, '')
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
VALUES ('kaese-frischkaese-ricotta', 'Ricotta', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'kaese-frischkaese'), 3, '', 1730, '')
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
VALUES ('kaese-frischkaese-frischkaese-doppelrahm-kraeuter-natur', 'Frischkäse (Doppelrahm, Kräuter, Natur)', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'kaese-frischkaese'), 3, '', 1740, '')
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
VALUES ('kaese-frischkaese-mascarpone', 'Mascarpone', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'kaese-frischkaese'), 3, '', 1750, '')
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
VALUES ('kaese-frischkaese-feta-salzlakenkaese', 'Feta (Salzlakenkäse)', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'kaese-frischkaese'), 3, '', 1760, '')
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
VALUES ('kaese-frischkaese-hirtenkaese-halloumi', 'Hirtenkäse & Halloumi', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'kaese-frischkaese'), 3, '', 1770, '')
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
VALUES ('kaese-frischkaese-burrata', 'Burrata', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'kaese-frischkaese'), 3, '', 1780, '')
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
VALUES ('kaese-schimmelkaese-blauschimmel-roquefort-gorgonzola-bleu-d-auvergne', 'Blauschimmel: Roquefort, Gorgonzola, Bleu d''Auvergne', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'kaese-schimmelkaese'), 3, '', 1800, '')
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
VALUES ('kaese-schimmelkaese-weissschimmel-brie-de-meaux-camembert-normandie', 'Weißschimmel: Brie de Meaux, Camembert Normandie', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'kaese-schimmelkaese'), 3, '', 1810, '')
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
VALUES ('butter-milchfette-butter-gesuesst-gesaeuert-ungesalzen', 'Butter (gesüßt, gesäuert, ungesalzen)', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'butter-milchfette'), 3, '', 1830, '')
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
VALUES ('butter-milchfette-ghee-butterschmalz', 'Ghee & Butterschmalz', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'butter-milchfette'), 3, '', 1840, '')
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
VALUES ('butter-milchfette-halbfettbutter', 'Halbfettbutter', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'butter-milchfette'), 3, '', 1850, '')
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
VALUES ('brot-vollkornbrot-roggenvollkorn-dinkelvollkorn', 'Vollkornbrot (Roggenvollkorn, Dinkelvollkorn)', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'brot'), 3, '', 1890, '')
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
VALUES ('brot-roggenmischbrot-sauerteigbrot', 'Roggenmischbrot & Sauerteigbrot', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'brot'), 3, '', 1900, '')
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
VALUES ('brot-weissbrot-toastbrot', 'Weißbrot & Toastbrot', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'brot'), 3, '', 1910, '')
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
VALUES ('brot-broetchen-semmeln', 'Brötchen & Semmeln', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'brot'), 3, '', 1920, '')
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
VALUES ('brot-knaeckebrot-crispbread', 'Knäckebrot & Crispbread', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'brot'), 3, '', 1930, '')
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
VALUES ('brot-mehrkornbrot', 'Mehrkornbrot', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'brot'), 3, '', 1940, '')
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
VALUES ('rohe-koerner-flocken-pseudogetreide-haferflocken-hafer-ganz', 'Haferflocken & Hafer (ganz)', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'rohe-koerner-flocken-pseudogetreide'), 3, '', 1960, '')
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
VALUES ('rohe-koerner-flocken-pseudogetreide-weizen-ganz-bulgur-griess', 'Weizen (ganz, Bulgur, Grieß)', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'rohe-koerner-flocken-pseudogetreide'), 3, '', 1970, '')
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
VALUES ('rohe-koerner-flocken-pseudogetreide-dinkel-emmer', 'Dinkel & Emmer', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'rohe-koerner-flocken-pseudogetreide'), 3, '', 1980, '')
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
VALUES ('rohe-koerner-flocken-pseudogetreide-roggen-gerste-ganz-graupen', 'Roggen & Gerste (ganz, Graupen)', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'rohe-koerner-flocken-pseudogetreide'), 3, '', 1990, '')
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
VALUES ('rohe-koerner-flocken-pseudogetreide-buchweizen', 'Buchweizen', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'rohe-koerner-flocken-pseudogetreide'), 3, '', 2000, '')
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
VALUES ('rohe-koerner-flocken-pseudogetreide-quinoa', 'Quinoa', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'rohe-koerner-flocken-pseudogetreide'), 3, '', 2010, '')
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
VALUES ('rohe-koerner-flocken-pseudogetreide-reis-weiss-vollkorn-basmati-jasmin-parboiled', 'Reis (weiß, Vollkorn, Basmati, Jasmin, Parboiled)', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'rohe-koerner-flocken-pseudogetreide'), 3, '', 2020, '')
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
VALUES ('rohe-koerner-flocken-pseudogetreide-hirse-amaranth', 'Hirse & Amaranth', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'rohe-koerner-flocken-pseudogetreide'), 3, '', 2030, '')
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
VALUES ('rohe-koerner-flocken-pseudogetreide-mais-ganz-mehl-polenta', 'Mais (ganz, Mehl, Polenta)', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'rohe-koerner-flocken-pseudogetreide'), 3, '', 2040, '')
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
VALUES ('rohe-koerner-flocken-pseudogetreide-teff', 'Teff', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'rohe-koerner-flocken-pseudogetreide'), 3, '', 2050, '')
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
VALUES ('mehl-staerke-weizenmehl-typ-405-550-812-1050', 'Weizenmehl (Typ 405, 550, 812, 1050)', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'mehl-staerke'), 3, '', 2070, '')
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
VALUES ('mehl-staerke-vollkornmehl-weizen-dinkel-roggen', 'Vollkornmehl (Weizen, Dinkel, Roggen)', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'mehl-staerke'), 3, '', 2080, '')
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
VALUES ('mehl-staerke-reismehl-maismehl', 'Reismehl & Maismehl', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'mehl-staerke'), 3, '', 2090, '')
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
VALUES ('mehl-staerke-kartoffelstaerke-tapioka', 'Kartoffelstärke & Tapioka', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'mehl-staerke'), 3, '', 2100, '')
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
VALUES ('mehl-staerke-speisestaerke', 'Speisestärke', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'mehl-staerke'), 3, '', 2110, '')
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
VALUES ('mehl-staerke-glutenfreies-mehl', 'Glutenfreies Mehl', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'mehl-staerke'), 3, '', 2120, '')
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
VALUES ('pasta-teigwaren-normale-pasta-spaghetti-penne-fusilli-etc', 'Normale Pasta (Spaghetti, Penne, Fusilli, etc.)', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'pasta-teigwaren'), 3, '', 2140, '')
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
VALUES ('pasta-teigwaren-vollkornpasta', 'Vollkornpasta', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'pasta-teigwaren'), 3, '', 2150, '')
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
VALUES ('pasta-teigwaren-eiernudeln', 'Eiernudeln', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'pasta-teigwaren'), 3, '', 2160, '')
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
VALUES ('pasta-teigwaren-glasnudeln-reisnudeln', 'Glasnudeln & Reisnudeln', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'pasta-teigwaren'), 3, '', 2170, '')
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
VALUES ('pasta-teigwaren-gnocchi-spaetzle-roh', 'Gnocchi & Spätzle (roh)', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'pasta-teigwaren'), 3, '', 2180, '')
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
VALUES ('pasta-teigwaren-gefuellte-pasta-tortellini-ravioli-roh-getrocknet', 'Gefüllte Pasta (Tortellini, Ravioli — roh/getrocknet)', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'pasta-teigwaren'), 3, '', 2190, '')
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
VALUES ('backwaren-gebaeck-snack-kategorie-kekse-plaetzchen', 'Kekse & Plätzchen', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'backwaren-gebaeck-snack-kategorie'), 3, '', 2210, '')
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
VALUES ('backwaren-gebaeck-snack-kategorie-lebkuchen-weihnachtsgebaeck', 'Lebkuchen & Weihnachtsgebäck', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'backwaren-gebaeck-snack-kategorie'), 3, '', 2220, '')
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
VALUES ('backwaren-gebaeck-snack-kategorie-croissants-blaetterteig', 'Croissants & Blätterteig', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'backwaren-gebaeck-snack-kategorie'), 3, '', 2230, '')
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
VALUES ('backwaren-gebaeck-snack-kategorie-kuchen-hefeteilchen-baeckerei', 'Kuchen & Hefeteilchen (Bäckerei)', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'backwaren-gebaeck-snack-kategorie'), 3, '', 2240, '')
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
VALUES ('backwaren-gebaeck-snack-kategorie-zwieback-knaeckebrot', 'Zwieback & Knäckebrot', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'backwaren-gebaeck-snack-kategorie'), 3, '', 2250, '')
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
VALUES ('blattgemuese-salate-spinat-mangold', 'Spinat & Mangold', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'blattgemuese-salate'), 3, '', 2280, '')
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
VALUES ('blattgemuese-salate-gruenkohl-wirsing', 'Grünkohl & Wirsing', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'blattgemuese-salate'), 3, '', 2290, '')
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
VALUES ('blattgemuese-salate-blattsalate-rucola-feldsalat-kopfsalat-eisberg-lollo', 'Blattsalate (Rucola, Feldsalat, Kopfsalat, Eisberg, Lollo)', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'blattgemuese-salate'), 3, '', 2300, '')
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
VALUES ('blattgemuese-salate-radicchio-chicoree-endivie', 'Radicchio & Chicorée & Endivie', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'blattgemuese-salate'), 3, '', 2310, '')
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
VALUES ('blattgemuese-salate-pak-choi-chinakohl', 'Pak Choi & Chinakohl', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'blattgemuese-salate'), 3, '', 2320, '')
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
VALUES ('blattgemuese-salate-rucola', 'Rucola', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'blattgemuese-salate'), 3, '', 2330, '')
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
VALUES ('kreuzbluetler-brassica-brokkoli', 'Brokkoli', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'kreuzbluetler-brassica'), 3, '', 2350, '')
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
VALUES ('kreuzbluetler-brassica-blumenkohl', 'Blumenkohl', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'kreuzbluetler-brassica'), 3, '', 2360, '')
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
VALUES ('kreuzbluetler-brassica-weisskohl-rotkohl-savoyerkohl', 'Weißkohl & Rotkohl & Savoyerkohl', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'kreuzbluetler-brassica'), 3, '', 2370, '')
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
VALUES ('kreuzbluetler-brassica-rosenkohl', 'Rosenkohl', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'kreuzbluetler-brassica'), 3, '', 2380, '')
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
VALUES ('kreuzbluetler-brassica-kohlrabi', 'Kohlrabi', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'kreuzbluetler-brassica'), 3, '', 2390, '')
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
VALUES ('kreuzbluetler-brassica-gruenkohl', 'Grünkohl', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'kreuzbluetler-brassica'), 3, '', 2400, '')
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
VALUES ('fruchtgemuese-tomaten-fleischtomaten-kirschtomaten-rispentomaten', 'Tomaten (Fleischtomaten, Kirschtomaten, Rispentomaten)', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'fruchtgemuese'), 3, '', 2420, '')
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
VALUES ('fruchtgemuese-paprika-rot-gelb-gruen-orange', 'Paprika (rot, gelb, grün, orange)', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'fruchtgemuese'), 3, '', 2430, '')
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
VALUES ('fruchtgemuese-zucchini-kuerbis', 'Zucchini & Kürbis', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'fruchtgemuese'), 3, '', 2440, '')
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
VALUES ('fruchtgemuese-aubergine', 'Aubergine', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'fruchtgemuese'), 3, '', 2450, '')
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
VALUES ('fruchtgemuese-gurke', 'Gurke', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'fruchtgemuese'), 3, '', 2460, '')
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
VALUES ('fruchtgemuese-avocado', 'Avocado', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'fruchtgemuese'), 3, '', 2470, '')
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
VALUES ('fruchtgemuese-artischocke', 'Artischocke', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'fruchtgemuese'), 3, '', 2480, '')
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
VALUES ('wurzel-knollengemuese-karotten-moehren-roh-gekocht', 'Karotten & Möhren (roh, gekocht)', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'wurzel-knollengemuese'), 3, '', 2500, '')
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
VALUES ('wurzel-knollengemuese-rote-bete', 'Rote Bete', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'wurzel-knollengemuese'), 3, '', 2510, '')
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
VALUES ('wurzel-knollengemuese-pastinaken-petersilienwurzel', 'Pastinaken & Petersilienwurzel', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'wurzel-knollengemuese'), 3, '', 2520, '')
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
VALUES ('wurzel-knollengemuese-knollensellerie', 'Knollensellerie', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'wurzel-knollengemuese'), 3, '', 2530, '')
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
VALUES ('wurzel-knollengemuese-radieschen-rettich', 'Radieschen & Rettich', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'wurzel-knollengemuese'), 3, '', 2540, '')
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
VALUES ('wurzel-knollengemuese-meerrettich', 'Meerrettich', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'wurzel-knollengemuese'), 3, '', 2550, '')
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
VALUES ('wurzel-knollengemuese-schwarzwurzel', 'Schwarzwurzel', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'wurzel-knollengemuese'), 3, '', 2560, '')
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
VALUES ('zwiebeln-lauch-zwiebeln-weiss-gelb-rot', 'Zwiebeln (weiß, gelb, rot)', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'zwiebeln-lauch'), 3, '', 2580, '')
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
VALUES ('zwiebeln-lauch-fruehlingszwiebeln', 'Frühlingszwiebeln', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'zwiebeln-lauch'), 3, '', 2590, '')
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
VALUES ('zwiebeln-lauch-knoblauch', 'Knoblauch', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'zwiebeln-lauch'), 3, '', 2600, '')
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
VALUES ('zwiebeln-lauch-schalotten', 'Schalotten', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'zwiebeln-lauch'), 3, '', 2610, '')
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
VALUES ('zwiebeln-lauch-lauch-porree', 'Lauch/Porree', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'zwiebeln-lauch'), 3, '', 2620, '')
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
VALUES ('zwiebeln-lauch-schnittlauch-eher-kraeuter', 'Schnittlauch (→ eher Kräuter)', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'zwiebeln-lauch'), 3, '', 2630, '')
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
VALUES ('pilze-champignons-weiss-braun', 'Champignons (weiß, braun)', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'pilze'), 3, '', 2650, '')
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
VALUES ('pilze-steinpilze-pfifferlinge', 'Steinpilze & Pfifferlinge', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'pilze'), 3, '', 2660, '')
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
VALUES ('pilze-austernpilze-shiitake', 'Austernpilze & Shiitake', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'pilze'), 3, '', 2670, '')
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
VALUES ('pilze-kraeuterseitlinge', 'Kräuterseitlinge', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'pilze'), 3, '', 2680, '')
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
VALUES ('pilze-trueffel', 'Trüffel', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'pilze'), 3, '', 2690, '')
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
VALUES ('pilze-getrocknete-pilze', 'Getrocknete Pilze', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'pilze'), 3, '', 2700, '')
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
VALUES ('kartoffeln-kartoffeln-roh', 'Kartoffeln (roh)', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'kartoffeln'), 3, '', 2720, '')
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
VALUES ('kartoffeln-kartoffeln-gekocht-gedaempft', 'Kartoffeln (gekocht, gedämpft)', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'kartoffeln'), 3, '', 2730, '')
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
VALUES ('kartoffeln-suesskartoffeln', 'Süßkartoffeln', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'kartoffeln'), 3, '', 2740, '')
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
VALUES ('kartoffeln-yams', 'Yams', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'kartoffeln'), 3, '', 2750, '')
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
VALUES ('spargel-artischocken-weisser-spargel', 'Weißer Spargel', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'spargel-artischocken'), 3, '', 2770, '')
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
VALUES ('spargel-artischocken-gruener-spargel', 'Grüner Spargel', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'spargel-artischocken'), 3, '', 2780, '')
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
VALUES ('spargel-artischocken-artischocken', 'Artischocken', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'spargel-artischocken'), 3, '', 2790, '')
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
VALUES ('sprossen-keimlinge-alfalfasprossen', 'Alfalfasprossen', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'sprossen-keimlinge'), 3, '', 2810, '')
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
VALUES ('sprossen-keimlinge-mungbohnensprossen', 'Mungbohnensprossen', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'sprossen-keimlinge'), 3, '', 2820, '')
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
VALUES ('sprossen-keimlinge-linsensprossen', 'Linsensprossen', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'sprossen-keimlinge'), 3, '', 2830, '')
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
VALUES ('sprossen-keimlinge-radieschensprossen', 'Radieschensprossen', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'sprossen-keimlinge'), 3, '', 2840, '')
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
VALUES ('beerenfruechte-erdbeeren', 'Erdbeeren', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'beerenfruechte'), 3, '', 2870, '')
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
VALUES ('beerenfruechte-himbeeren', 'Himbeeren', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'beerenfruechte'), 3, '', 2880, '')
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
VALUES ('beerenfruechte-brombeeren', 'Brombeeren', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'beerenfruechte'), 3, '', 2890, '')
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
VALUES ('beerenfruechte-blaubeeren-heidelbeeren', 'Blaubeeren & Heidelbeeren', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'beerenfruechte'), 3, '', 2900, '')
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
VALUES ('beerenfruechte-johannisbeeren-rot-schwarz-weiss', 'Johannisbeeren (rot, schwarz, weiß)', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'beerenfruechte'), 3, '', 2910, '')
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
VALUES ('beerenfruechte-stachelbeeren', 'Stachelbeeren', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'beerenfruechte'), 3, '', 2920, '')
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
VALUES ('beerenfruechte-cranberries-preiselbeeren', 'Cranberries & Preiselbeeren', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'beerenfruechte'), 3, '', 2930, '')
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
VALUES ('beerenfruechte-goji-beeren', 'Goji-Beeren', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'beerenfruechte'), 3, '', 2940, '')
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
VALUES ('kernobst-aepfel-diverse-sorten', 'Äpfel (diverse Sorten)', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'kernobst'), 3, '', 2960, '')
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
VALUES ('kernobst-birnen', 'Birnen', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'kernobst'), 3, '', 2970, '')
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
VALUES ('steinobst-kirschen-suess-sauer', 'Kirschen (süß, sauer)', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'steinobst'), 3, '', 2990, '')
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
VALUES ('steinobst-pfirsiche-nektarinen', 'Pfirsiche & Nektarinen', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'steinobst'), 3, '', 3000, '')
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
VALUES ('steinobst-pflaumen-zwetschgen', 'Pflaumen & Zwetschgen', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'steinobst'), 3, '', 3010, '')
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
VALUES ('steinobst-aprikosen-mirabellen', 'Aprikosen & Mirabellen', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'steinobst'), 3, '', 3020, '')
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
VALUES ('steinobst-sauerkirschen', 'Sauerkirschen', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'steinobst'), 3, '', 3030, '')
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
VALUES ('zitrusfruechte-orangen-mandarinen', 'Orangen & Mandarinen', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'zitrusfruechte'), 3, '', 3050, '')
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
VALUES ('zitrusfruechte-clementinen-satsumas', 'Clementinen & Satsumas', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'zitrusfruechte'), 3, '', 3060, '')
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
VALUES ('zitrusfruechte-grapefruit-pampelmuse', 'Grapefruit & Pampelmuse', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'zitrusfruechte'), 3, '', 3070, '')
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
VALUES ('zitrusfruechte-zitronen-limetten', 'Zitronen & Limetten', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'zitrusfruechte'), 3, '', 3080, '')
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
VALUES ('zitrusfruechte-blutorangen', 'Blutorangen', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'zitrusfruechte'), 3, '', 3090, '')
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
VALUES ('exotisches-tropisches-obst-bananen-kochbananen', 'Bananen & Kochbananen', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'exotisches-tropisches-obst'), 3, '', 3110, '')
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
VALUES ('exotisches-tropisches-obst-mango', 'Mango', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'exotisches-tropisches-obst'), 3, '', 3120, '')
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
VALUES ('exotisches-tropisches-obst-papaya', 'Papaya', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'exotisches-tropisches-obst'), 3, '', 3130, '')
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
VALUES ('exotisches-tropisches-obst-ananas', 'Ananas', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'exotisches-tropisches-obst'), 3, '', 3140, '')
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
VALUES ('exotisches-tropisches-obst-kiwi-gruen-gelb', 'Kiwi (grün, gelb)', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'exotisches-tropisches-obst'), 3, '', 3150, '')
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
VALUES ('exotisches-tropisches-obst-granatapfel', 'Granatapfel', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'exotisches-tropisches-obst'), 3, '', 3160, '')
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
VALUES ('exotisches-tropisches-obst-feigen-frisch', 'Feigen (frisch)', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'exotisches-tropisches-obst'), 3, '', 3170, '')
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
VALUES ('exotisches-tropisches-obst-litschi-rambutan', 'Litschi & Rambutan', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'exotisches-tropisches-obst'), 3, '', 3180, '')
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
VALUES ('exotisches-tropisches-obst-jackfrucht', 'Jackfrucht', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'exotisches-tropisches-obst'), 3, '', 3190, '')
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
VALUES ('exotisches-tropisches-obst-drachenfrucht', 'Drachenfrucht', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'exotisches-tropisches-obst'), 3, '', 3200, '')
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
VALUES ('melonen-wassermelone', 'Wassermelone', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'melonen'), 3, '', 3220, '')
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
VALUES ('melonen-honigmelone-galiamelone', 'Honigmelone & Galiamelone', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'melonen'), 3, '', 3230, '')
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
VALUES ('melonen-cantaloupmelone', 'Cantaloupmelone', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'melonen'), 3, '', 3240, '')
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
VALUES ('trockenfruechte-rosinen-sultaninen', 'Rosinen & Sultaninen', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'trockenfruechte'), 3, '', 3260, '')
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
VALUES ('trockenfruechte-getrocknete-aprikosen', 'Getrocknete Aprikosen', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'trockenfruechte'), 3, '', 3270, '')
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
VALUES ('trockenfruechte-datteln-getrocknet', 'Datteln (getrocknet)', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'trockenfruechte'), 3, '', 3280, '')
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
VALUES ('trockenfruechte-getrocknete-pflaumen-backpflaumen', 'Getrocknete Pflaumen/Backpflaumen', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'trockenfruechte'), 3, '', 3290, '')
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
VALUES ('trockenfruechte-feigen-getrocknet', 'Feigen (getrocknet)', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'trockenfruechte'), 3, '', 3300, '')
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
VALUES ('trockenfruechte-cranberries-getrocknet-oft-gezuckert', 'Cranberries getrocknet (oft gezuckert)', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'trockenfruechte'), 3, '', 3310, '')
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
VALUES ('huelsenfruechte-linsen-rote-gruene-schwarze-beluga-puy', 'Linsen (rote, grüne, schwarze, Beluga, Puy)', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'huelsenfruechte'), 3, '', 3340, '')
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
VALUES ('huelsenfruechte-kichererbsen', 'Kichererbsen', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'huelsenfruechte'), 3, '', 3350, '')
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
VALUES ('huelsenfruechte-schwarze-bohnen', 'Schwarze Bohnen', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'huelsenfruechte'), 3, '', 3360, '')
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
VALUES ('huelsenfruechte-kidneybohnen', 'Kidneybohnen', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'huelsenfruechte'), 3, '', 3370, '')
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
VALUES ('huelsenfruechte-weisse-bohnen-cannellini-navy', 'Weiße Bohnen (Cannellini, Navy)', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'huelsenfruechte'), 3, '', 3380, '')
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
VALUES ('huelsenfruechte-erbsen-gruen-gelb-getrocknet', 'Erbsen (grün, gelb, getrocknet)', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'huelsenfruechte'), 3, '', 3390, '')
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
VALUES ('huelsenfruechte-edamame-sojabohnen-frisch-gefroren', 'Edamame & Sojabohnen (frisch/gefroren)', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'huelsenfruechte'), 3, '', 3400, '')
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
VALUES ('huelsenfruechte-dicke-bohnen-ackerbohnen', 'Dicke Bohnen/Ackerbohnen', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'huelsenfruechte'), 3, '', 3410, '')
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
VALUES ('huelsenfruechte-mungbohnen', 'Mungbohnen', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'huelsenfruechte'), 3, '', 3420, '')
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
VALUES ('sojaprodukte-tofu-fest-seide-geraeuchert', 'Tofu (fest, Seide, geräuchert)', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'sojaprodukte'), 3, '', 3440, '')
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
VALUES ('sojaprodukte-tempeh', 'Tempeh', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'sojaprodukte'), 3, '', 3450, '')
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
VALUES ('sojaprodukte-seitan-weizengluten-achtung-gluten', 'Seitan (Weizengluten — Achtung: Gluten!)', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'sojaprodukte'), 3, '', 3460, '')
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
VALUES ('sojaprodukte-sojamilch-sojakefir', 'Sojamilch & Sojakefir', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'sojaprodukte'), 3, '', 3470, '')
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
VALUES ('sojaprodukte-sojaprotein-isoliert-texturiert-tvp', 'Sojaprotein isoliert/texturiert (TVP)', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'sojaprodukte'), 3, '', 3480, '')
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
VALUES ('sojaprodukte-miso', 'Miso', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'sojaprodukte'), 3, '', 3490, '')
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
VALUES ('nuesse-walnuesse', 'Walnüsse', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'nuesse'), 3, '', 3510, '')
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
VALUES ('nuesse-mandeln-roh-geroestet-blanchiert', 'Mandeln (roh, geröstet, blanchiert)', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'nuesse'), 3, '', 3520, '')
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
VALUES ('nuesse-haselnuesse', 'Haselnüsse', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'nuesse'), 3, '', 3530, '')
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
VALUES ('nuesse-cashewnuesse', 'Cashewnüsse', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'nuesse'), 3, '', 3540, '')
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
VALUES ('nuesse-paranuesse', 'Paranüsse', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'nuesse'), 3, '', 3550, '')
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
VALUES ('nuesse-pistazien', 'Pistazien', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'nuesse'), 3, '', 3560, '')
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
VALUES ('nuesse-macadamia', 'Macadamia', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'nuesse'), 3, '', 3570, '')
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
VALUES ('nuesse-pekannuesse', 'Pekannüsse', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'nuesse'), 3, '', 3580, '')
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
VALUES ('nuesse-kokosnuss-frisch-geraspelt-kokosmehl', 'Kokosnuss (frisch, geraspelt, Kokosmehl)', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'nuesse'), 3, '', 3590, '')
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
VALUES ('erdnuesse-erdnussprodukte-erdnuesse-roh-geroestet-gesalzen', 'Erdnüsse (roh, geröstet, gesalzen)', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'erdnuesse-erdnussprodukte'), 3, '', 3610, '')
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
VALUES ('erdnuesse-erdnussprodukte-erdnussbutter-creamy-crunchy', 'Erdnussbutter (creamy, crunchy)', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'erdnuesse-erdnussprodukte'), 3, '', 3620, '')
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
VALUES ('samen-kerne-kuerbiskerne', 'Kürbiskerne', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'samen-kerne'), 3, '', 3640, '')
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
VALUES ('samen-kerne-sonnenblumenkerne', 'Sonnenblumenkerne', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'samen-kerne'), 3, '', 3650, '')
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
VALUES ('samen-kerne-leinsamen-ganz-geschrotet', 'Leinsamen (ganz, geschrotet)', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'samen-kerne'), 3, '', 3660, '')
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
VALUES ('samen-kerne-chiasamen', 'Chiasamen', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'samen-kerne'), 3, '', 3670, '')
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
VALUES ('samen-kerne-hanfsamen', 'Hanfsamen', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'samen-kerne'), 3, '', 3680, '')
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
VALUES ('samen-kerne-sesam-weiss-schwarz', 'Sesam (weiß, schwarz)', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'samen-kerne'), 3, '', 3690, '')
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
VALUES ('samen-kerne-mohn', 'Mohn', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'samen-kerne'), 3, '', 3700, '')
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
VALUES ('samen-kerne-flohsamenschalen', 'Flohsamenschalen', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'samen-kerne'), 3, '', 3710, '')
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
VALUES ('nussmuse-saaten-pasten-mandelmus', 'Mandelmus', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'nussmuse-saaten-pasten'), 3, '', 3730, '')
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
VALUES ('nussmuse-saaten-pasten-tahini-sesammus', 'Tahini (Sesammus)', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'nussmuse-saaten-pasten'), 3, '', 3740, '')
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
VALUES ('nussmuse-saaten-pasten-cashewmus', 'Cashewmus', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'nussmuse-saaten-pasten'), 3, '', 3750, '')
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
VALUES ('nussmuse-saaten-pasten-sonnenblumenkernmus', 'Sonnenblumenkernmus', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'nussmuse-saaten-pasten'), 3, '', 3760, '')
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
VALUES ('pflanzliche-oele-olivenoel-nativ-extra-raffiniert', 'Olivenöl (nativ extra, raffiniert)', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'pflanzliche-oele'), 3, '', 3790, '')
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
VALUES ('pflanzliche-oele-rapsoel-kalt-gepresst-raffiniert', 'Rapsöl (kalt gepresst, raffiniert)', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'pflanzliche-oele'), 3, '', 3800, '')
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
VALUES ('pflanzliche-oele-kokosoel-nativ-raffiniert-kokosfett', 'Kokosöl (nativ, raffiniert/Kokosfett)', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'pflanzliche-oele'), 3, '', 3810, '')
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
VALUES ('pflanzliche-oele-leinoel', 'Leinöl', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'pflanzliche-oele'), 3, '', 3820, '')
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
VALUES ('pflanzliche-oele-hanfoel', 'Hanföl', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'pflanzliche-oele'), 3, '', 3830, '')
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
VALUES ('pflanzliche-oele-walnussoel-haselnussoel', 'Walnussöl & Haselnussöl', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'pflanzliche-oele'), 3, '', 3840, '')
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
VALUES ('pflanzliche-oele-avocadooel', 'Avocadoöl', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'pflanzliche-oele'), 3, '', 3850, '')
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
VALUES ('pflanzliche-oele-sesamoel', 'Sesamöl', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'pflanzliche-oele'), 3, '', 3860, '')
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
VALUES ('pflanzliche-oele-sonnenblumenoel-disteloel', 'Sonnenblumenöl & Distelöl', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'pflanzliche-oele'), 3, '', 3870, '')
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
VALUES ('pflanzliche-oele-kuerbiskernoel', 'Kürbiskernöl', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'pflanzliche-oele'), 3, '', 3880, '')
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
VALUES ('tierische-fette-butter-gesuesst-gesaeuert-rohmilch', 'Butter (gesüßt, gesäuert, Rohmilch)', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'tierische-fette'), 3, '', 3900, '')
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
VALUES ('tierische-fette-ghee-butterschmalz', 'Ghee / Butterschmalz', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'tierische-fette'), 3, '', 3910, '')
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
VALUES ('tierische-fette-schweineschmalz', 'Schweineschmalz', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'tierische-fette'), 3, '', 3920, '')
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
VALUES ('tierische-fette-gaenseschmalz-entenschmalz', 'Gänseschmalz & Entenschmalz', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'tierische-fette'), 3, '', 3930, '')
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
VALUES ('tierische-fette-rindertalg', 'Rindertalg', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'tierische-fette'), 3, '', 3940, '')
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
VALUES ('tierische-fette-fischoel-lebertran-supplement', 'Fischöl & Lebertran (Supplement', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'tierische-fette'), 3, '', 3950, '')
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
VALUES ('margarine-streichfette-pflanzenmargarine', 'Pflanzenmargarine', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'margarine-streichfette'), 3, '', 3970, '')
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
VALUES ('margarine-streichfette-halbfettbutter-halbfettmargarine', 'Halbfettbutter & Halbfettmargarine', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'margarine-streichfette'), 3, '', 3980, '')
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
VALUES ('margarine-streichfette-pflanzliche-butteralternativen', 'Pflanzliche Butteralternativen', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'margarine-streichfette'), 3, '', 3990, '')
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
VALUES ('schokolade-kakao-dunkle-schokolade-70-kakao', 'Dunkle Schokolade (≥70% Kakao)', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'schokolade-kakao'), 3, '', 4020, '')
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
VALUES ('schokolade-kakao-dunkle-schokolade-50-70', 'Dunkle Schokolade (50–70%)', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'schokolade-kakao'), 3, '', 4030, '')
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
VALUES ('schokolade-kakao-vollmilchschokolade', 'Vollmilchschokolade', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'schokolade-kakao'), 3, '', 4040, '')
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
VALUES ('schokolade-kakao-weisse-schokolade', 'Weiße Schokolade', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'schokolade-kakao'), 3, '', 4050, '')
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
VALUES ('schokolade-kakao-kakaopulver-ungesuesst', 'Kakaopulver (ungesüßt)', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'schokolade-kakao'), 3, '', 4060, '')
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
VALUES ('schokolade-kakao-kakaobutter-kakao-nibs', 'Kakaobutter & Kakao-Nibs', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'schokolade-kakao'), 3, '', 4070, '')
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
VALUES ('schokolade-kakao-schokoladenriegel-gefuellt-nuss-nougat', 'Schokoladenriegel (gefüllt, Nuss-Nougat)', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'schokolade-kakao'), 3, '', 4080, '')
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
VALUES ('zucker-suessungsmittel-weisszucker-rohzucker', 'Weißzucker & Rohzucker', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'zucker-suessungsmittel'), 3, '', 4100, '')
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
VALUES ('zucker-suessungsmittel-puderzucker', 'Puderzucker', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'zucker-suessungsmittel'), 3, '', 4110, '')
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
VALUES ('zucker-suessungsmittel-honig-bluetenhonig-waldhonig', 'Honig (Blütenhonig, Waldhonig)', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'zucker-suessungsmittel'), 3, '', 4120, '')
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
VALUES ('zucker-suessungsmittel-agavensirup-ahornsirup', 'Agavensirup & Ahornsirup', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'zucker-suessungsmittel'), 3, '', 4130, '')
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
VALUES ('zucker-suessungsmittel-kokosbluetenzucker', 'Kokosblütenzucker', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'zucker-suessungsmittel'), 3, '', 4140, '')
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
VALUES ('zucker-suessungsmittel-erythrit-xylit', 'Erythrit & Xylit', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'zucker-suessungsmittel'), 3, '', 4150, '')
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
VALUES ('zucker-suessungsmittel-stevia-natuerlich', 'Stevia (natürlich)', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'zucker-suessungsmittel'), 3, '', 4160, '')
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
VALUES ('zucker-suessungsmittel-kunstsuessstoffe-aspartam-saccharin', 'Kunstsüßstoffe (Aspartam, Saccharin)', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'zucker-suessungsmittel'), 3, '', 4170, '')
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
VALUES ('eis-suessspeisen-speiseeis-sahneeis-fruchteis-sorbet', 'Speiseeis (Sahneeis, Fruchteis, Sorbet)', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'eis-suessspeisen'), 3, '', 4190, '')
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
VALUES ('eis-suessspeisen-pudding-wackelpudding', 'Pudding & Wackelpudding', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'eis-suessspeisen'), 3, '', 4200, '')
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
VALUES ('eis-suessspeisen-mousse-creme', 'Mousse & Creme', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'eis-suessspeisen'), 3, '', 4210, '')
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
VALUES ('chips-salzgebaeck-kartoffelchips-stapelchips', 'Kartoffelchips & Stapelchips', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'chips-salzgebaeck'), 3, '', 4230, '')
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
VALUES ('chips-salzgebaeck-popcorn-gesalzen-suess', 'Popcorn (gesalzen, süß)', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'chips-salzgebaeck'), 3, '', 4240, '')
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
VALUES ('chips-salzgebaeck-salzgebaeck-brezeln-cracker', 'Salzgebäck, Brezeln, Cracker', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'chips-salzgebaeck'), 3, '', 4250, '')
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
VALUES ('chips-salzgebaeck-reiswaffeln-maiswaffeln', 'Reiswaffeln & Maiswaffeln', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'chips-salzgebaeck'), 3, '', 4260, '')
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
VALUES ('suessigkeiten-confiserie-gummibaerchen-fruchtgummi', 'Gummibärchen & Fruchtgummi', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'suessigkeiten-confiserie'), 3, '', 4280, '')
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
VALUES ('suessigkeiten-confiserie-bonbons-lollies', 'Bonbons & Lollies', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'suessigkeiten-confiserie'), 3, '', 4290, '')
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
VALUES ('suessigkeiten-confiserie-marzipan-nougat', 'Marzipan & Nougat', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'suessigkeiten-confiserie'), 3, '', 4300, '')
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
VALUES ('suessigkeiten-confiserie-marshmallows', 'Marshmallows', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'suessigkeiten-confiserie'), 3, '', 4310, '')
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
VALUES ('wasser-stilles-mineralwasser', 'Stilles Mineralwasser', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'wasser'), 3, '', 4340, '')
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
VALUES ('wasser-sprudelwasser', 'Sprudelwasser', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'wasser'), 3, '', 4350, '')
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
VALUES ('wasser-trinkwasser', 'Trinkwasser', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'wasser'), 3, '', 4360, '')
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
VALUES ('kaffee-tee-kaffee-espresso-filterkaffee-instantkaffee', 'Kaffee (Espresso, Filterkaffee, Instantkaffee)', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'kaffee-tee'), 3, '', 4380, '')
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
VALUES ('kaffee-tee-cappuccino-kaffeezubereitungen-mit-milch-zucker', 'Cappuccino & Kaffeezubereitungen (mit Milch/Zucker)', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'kaffee-tee'), 3, '', 4390, '')
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
VALUES ('kaffee-tee-schwarztee-gruentee', 'Schwarztee & Grüntee', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'kaffee-tee'), 3, '', 4400, '')
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
VALUES ('kaffee-tee-kraeutertee-fruechtetee', 'Kräutertee & Früchtetee', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'kaffee-tee'), 3, '', 4410, '')
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
VALUES ('kaffee-tee-matcha', 'Matcha', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'kaffee-tee'), 3, '', 4420, '')
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
VALUES ('fruchtsaefte-smoothies-orangensaft-apfelsaft-traubensaft', 'Orangensaft, Apfelsaft, Traubensaft', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'fruchtsaefte-smoothies'), 3, '', 4440, '')
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
VALUES ('fruchtsaefte-smoothies-gemuesesaefte-tomatensaft-karottensaft', 'Gemüsesäfte (Tomatensaft, Karottensaft)', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'fruchtsaefte-smoothies'), 3, '', 4450, '')
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
VALUES ('fruchtsaefte-smoothies-smoothies', 'Smoothies', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'fruchtsaefte-smoothies'), 3, '', 4460, '')
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
VALUES ('softdrinks-limonaden-cola-energy-drinks', 'Cola & Energy Drinks', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'softdrinks-limonaden'), 3, '', 4480, '')
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
VALUES ('softdrinks-limonaden-limonaden-zitrone-orange', 'Limonaden (Zitrone, Orange)', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'softdrinks-limonaden'), 3, '', 4490, '')
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
VALUES ('softdrinks-limonaden-eistee-gesuesst', 'Eistee gesüßt', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'softdrinks-limonaden'), 3, '', 4500, '')
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
VALUES ('softdrinks-limonaden-zuckerfreie-varianten-diet-coke-etc', 'Zuckerfreie Varianten (Diet Coke etc.)', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'softdrinks-limonaden'), 3, '', 4510, '')
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
VALUES ('sportgetraenke-isotonische-isotonische-getraenke', 'Isotonische Getränke', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'sportgetraenke-isotonische'), 3, '', 4530, '')
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
VALUES ('sportgetraenke-isotonische-elektrolyt-drinks', 'Elektrolyt-Drinks', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'sportgetraenke-isotonische'), 3, '', 4540, '')
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
VALUES ('sportgetraenke-isotonische-sportgetraenke-mit-kohlenhydraten', 'Sportgetränke (mit Kohlenhydraten)', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'sportgetraenke-isotonische'), 3, '', 4550, '')
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
VALUES ('alkoholische-getraenke-bier-hell-dunkel-alkoholfrei', 'Bier (hell, dunkel, alkoholfrei)', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'alkoholische-getraenke'), 3, '', 4570, '')
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
VALUES ('alkoholische-getraenke-wein-rot-weiss-rose-schaumwein', 'Wein (Rot, Weiß, Rosé, Schaumwein)', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'alkoholische-getraenke'), 3, '', 4580, '')
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
VALUES ('alkoholische-getraenke-spirituosen-vodka-whisky-rum-gin', 'Spirituosen (Vodka, Whisky, Rum, Gin)', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'alkoholische-getraenke'), 3, '', 4590, '')
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
VALUES ('alkoholische-getraenke-cider-obstwein', 'Cider & Obstwein', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'alkoholische-getraenke'), 3, '', 4600, '')
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
VALUES ('alkoholische-getraenke-likoere', 'Liköre', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'alkoholische-getraenke'), 3, '', 4610, '')
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
VALUES ('bruehen-suppen-fleischbruehen-consomme-rind-huhn-wild', 'Fleischbrühen & Consommé (Rind, Huhn, Wild)', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'bruehen-suppen'), 3, '', 4640, '')
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
VALUES ('bruehen-suppen-gemuesebruehe', 'Gemüsebrühe', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'bruehen-suppen'), 3, '', 4650, '')
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
VALUES ('bruehen-suppen-fischbruehe', 'Fischbrühe', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'bruehen-suppen'), 3, '', 4660, '')
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
VALUES ('bruehen-suppen-fertigsuppen-tomatensuppe-linsensuppe', 'Fertigsuppen (Tomatensuppe, Linsensuppe)', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'bruehen-suppen'), 3, '', 4670, '')
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
VALUES ('fleischgerichte-zubereitet-braten-schmorgerichte-zubereitet', 'Braten & Schmorgerichte (zubereitet)', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'fleischgerichte-zubereitet'), 3, '', 4690, '')
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
VALUES ('fleischgerichte-zubereitet-kurzgebratenes-steak-kotelett-zubereitet', 'Kurzgebratenes (Steak, Kotelett — zubereitet)', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'fleischgerichte-zubereitet'), 3, '', 4700, '')
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
VALUES ('fleischgerichte-zubereitet-hackfleischgerichte-frikadellen-bouletten', 'Hackfleischgerichte (Frikadellen, Bouletten)', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'fleischgerichte-zubereitet'), 3, '', 4710, '')
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
VALUES ('fleischgerichte-zubereitet-fast-food-burger-nuggets-doener', 'Fast Food (Burger, Nuggets, Döner)', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'fleischgerichte-zubereitet'), 3, '', 4720, '')
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
VALUES ('fischgerichte-zubereitet-gebratener-gegrillter-fisch', 'Gebratener/gegrillter Fisch', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'fischgerichte-zubereitet'), 3, '', 4740, '')
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
VALUES ('fischgerichte-zubereitet-fischstaebchen-panade', 'Fischstäbchen & Panade', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'fischgerichte-zubereitet'), 3, '', 4750, '')
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
VALUES ('fischgerichte-zubereitet-sushi-sashimi', 'Sushi & Sashimi', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'fischgerichte-zubereitet'), 3, '', 4760, '')
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
VALUES ('eier-zubereitungen-ruehrei-spiegelei-omelette', 'Rührei, Spiegelei, Omelette', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'eier-zubereitungen'), 3, '', 4780, '')
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
VALUES ('eier-zubereitungen-hartgekochte-eier-wird-in-eier-rohwaren-auch-erfasst', 'Hartgekochte Eier (→ wird in Eier Rohwaren auch erfasst)', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'eier-zubereitungen'), 3, '', 4790, '')
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
VALUES ('eier-zubereitungen-quiche-souffle', 'Quiche & Soufflé', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'eier-zubereitungen'), 3, '', 4800, '')
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
VALUES ('vegetarisch-vegan-zubereitet-gemuesegerichte-zubereitet', 'Gemüsegerichte (zubereitet)', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'vegetarisch-vegan-zubereitet'), 3, '', 4820, '')
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
VALUES ('vegetarisch-vegan-zubereitet-tofu-gerichte', 'Tofu-Gerichte', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'vegetarisch-vegan-zubereitet'), 3, '', 4830, '')
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
VALUES ('vegetarisch-vegan-zubereitet-vegane-fleischersatzprodukte', 'Vegane Fleischersatzprodukte', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'vegetarisch-vegan-zubereitet'), 3, '', 4840, '')
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
VALUES ('pasta-getreidegerichte-zubereitet-nudeln-mit-sauce-zubereitet', 'Nudeln mit Sauce (zubereitet)', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'pasta-getreidegerichte-zubereitet'), 3, '', 4860, '')
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
VALUES ('pasta-getreidegerichte-zubereitet-risotto-reisgerichte-zubereitet', 'Risotto & Reisgerichte (zubereitet)', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'pasta-getreidegerichte-zubereitet'), 3, '', 4870, '')
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
VALUES ('pasta-getreidegerichte-zubereitet-spaetzle-zubereitet', 'Spätzle (zubereitet)', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'pasta-getreidegerichte-zubereitet'), 3, '', 4880, '')
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
VALUES ('desserts-zubereitet-milchdesserts-creme-brulee', 'Milchdesserts & Crème brûlée', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'desserts-zubereitet'), 3, '', 4900, '')
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
VALUES ('desserts-zubereitet-mehlspeisen-apfelstrudel-palatschinken', 'Mehlspeisen (Apfelstrudel, Palatschinken)', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'desserts-zubereitet'), 3, '', 4910, '')
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
VALUES ('desserts-zubereitet-torten-kuchen-baeckerei-konditorei', 'Torten & Kuchen (Bäckerei/Konditorei)', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'desserts-zubereitet'), 3, '', 4920, '')
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
VALUES ('tiefkuehlprodukte-tk-gemuese', 'TK-Gemüse', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'tiefkuehlprodukte'), 3, '', 4940, '')
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
VALUES ('tiefkuehlprodukte-tk-fisch-meeresfruechte', 'TK-Fisch & -Meeresfrüchte', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'tiefkuehlprodukte'), 3, '', 4950, '')
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
VALUES ('tiefkuehlprodukte-tk-fertiggerichte-pizza-lasagne', 'TK-Fertiggerichte (Pizza, Lasagne)', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'tiefkuehlprodukte'), 3, '', 4960, '')
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
VALUES ('gewuerze-kraeuter-trockene-gewuerze-pfeffer-paprika-kurkuma-etc', 'Trockene Gewürze (Pfeffer, Paprika, Kurkuma, etc.)', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'gewuerze-kraeuter'), 3, '', 4990, '')
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
VALUES ('gewuerze-kraeuter-kraeuter-getrocknet-oregano-thymian-basilikum', 'Kräuter getrocknet (Oregano, Thymian, Basilikum)', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'gewuerze-kraeuter'), 3, '', 5000, '')
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
VALUES ('gewuerze-kraeuter-kraeuter-frisch-eher-unter-gemuese-unterkategorie-kraeuter', 'Kräuter frisch (→ eher unter Gemüse, Unterkategorie Kräuter)', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'gewuerze-kraeuter'), 3, '', 5010, '')
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
VALUES ('gewuerze-kraeuter-gewuerzmischungen', 'Gewürzmischungen', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'gewuerze-kraeuter'), 3, '', 5020, '')
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
VALUES ('saucen-dips-marinaden-tomatenprodukte-ketchup-tomatenmark-passata', 'Tomatenprodukte (Ketchup, Tomatenmark, Passata)', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'saucen-dips-marinaden'), 3, '', 5040, '')
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
VALUES ('saucen-dips-marinaden-mayonnaise-aioli', 'Mayonnaise & Aioli', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'saucen-dips-marinaden'), 3, '', 5050, '')
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
VALUES ('saucen-dips-marinaden-senf-mittelscharf-dijon-suess', 'Senf (mittelscharf, Dijon, süß)', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'saucen-dips-marinaden'), 3, '', 5060, '')
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
VALUES ('saucen-dips-marinaden-sojasosse-tamari', 'Sojasoße & Tamari', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'saucen-dips-marinaden'), 3, '', 5070, '')
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
VALUES ('saucen-dips-marinaden-worcestershire-fischsosse', 'Worcestershire & Fischsoße', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'saucen-dips-marinaden'), 3, '', 5080, '')
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
VALUES ('saucen-dips-marinaden-bbq-sauce-grillmarinaden', 'BBQ-Sauce & Grillmarinaden', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'saucen-dips-marinaden'), 3, '', 5090, '')
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
VALUES ('saucen-dips-marinaden-salatdressings', 'Salatdressings', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'saucen-dips-marinaden'), 3, '', 5100, '')
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
VALUES ('essig-apfelessig', 'Apfelessig', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'essig'), 3, '', 5120, '')
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
VALUES ('essig-balsamico', 'Balsamico', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'essig'), 3, '', 5130, '')
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
VALUES ('essig-weissweinessig-rotweinessig', 'Weißweinessig & Rotweinessig', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'essig'), 3, '', 5140, '')
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
VALUES ('salze-speisesalz-meersalz', 'Speisesalz & Meersalz', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'salze'), 3, '', 5160, '')
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
VALUES ('salze-jodsalz', 'Jodsalz', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'salze'), 3, '', 5170, '')
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
VALUES ('salze-kraeutersalze', 'Kräutersalze', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'salze'), 3, '', 5180, '')
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
VALUES ('rindfleisch-rindersteaks-braten-filet-tenderloin', 'Filet & Tenderloin', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'rindfleisch-rindersteaks-braten'), 4, '', 50, '')
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
VALUES ('rindfleisch-rindersteaks-braten-rumpsteak-entrecote', 'Rumpsteak & Entrecôte', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'rindfleisch-rindersteaks-braten'), 4, '', 60, '')
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
VALUES ('rindfleisch-rindersteaks-braten-gulasch-bratenfleisch-bug', 'Gulasch & Bratenfleisch (Bug)', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'rindfleisch-rindersteaks-braten'), 4, '', 70, '')
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
VALUES ('rindfleisch-rindersteaks-braten-rindsbrust-rippen', 'Rindsbrust & Rippen', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'rindfleisch-rindersteaks-braten'), 4, '', 80, '')
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
VALUES ('rindfleisch-rindersteaks-braten-tafelspitz-kochfleisch', 'Tafelspitz & Kochfleisch', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'rindfleisch-rindersteaks-braten'), 4, '', 90, '')
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
VALUES ('rindfleisch-rindersteaks-braten-keule-hinterhesse', 'Keule & Hinterhesse', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'rindfleisch-rindersteaks-braten'), 4, '', 100, '')
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
VALUES ('rindfleisch-rindersteaks-braten-roastbeef', 'Roastbeef', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'rindfleisch-rindersteaks-braten'), 4, '', 110, '')
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
VALUES ('rindfleisch-rindersteaks-braten-rinderblut-sonderschnitte', 'Rinderblut & Sonderschnitte', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'rindfleisch-rindersteaks-braten'), 4, '', 120, '')
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
VALUES ('gefluegel-haehnchen-haehnchenbrust-filet', 'Hähnchenbrust & Filet', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'gefluegel-haehnchen'), 4, '', 290, '')
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
VALUES ('gefluegel-haehnchen-haehnchenschenkel-fluegel', 'Hähnchenschenkel & Flügel', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'gefluegel-haehnchen'), 4, '', 300, '')
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
VALUES ('gefluegel-haehnchen-haehnchen-ganz', 'Hähnchen ganz', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'gefluegel-haehnchen'), 4, '', 310, '')
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
VALUES ('gefluegel-haehnchen-suppenhuhn', 'Suppenhuhn', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'gefluegel-haehnchen'), 4, '', 320, '')
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
VALUES ('gefluegel-pute-truthahn-putenbrust', 'Putenbrust', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'gefluegel-pute-truthahn'), 4, '', 340, '')
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
VALUES ('gefluegel-pute-truthahn-putenschenkel', 'Putenschenkel', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'gefluegel-pute-truthahn'), 4, '', 350, '')
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
VALUES ('gefluegel-pute-truthahn-pute-ganz', 'Pute ganz', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'gefluegel-pute-truthahn'), 4, '', 360, '')
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
VALUES ('gefluegel-ente-entenbrust', 'Entenbrust', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'gefluegel-ente'), 4, '', 380, '')
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
VALUES ('gefluegel-ente-entenschenkel', 'Entenschenkel', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'gefluegel-ente'), 4, '', 390, '')
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
VALUES ('gefluegel-ente-ente-ganz', 'Ente ganz', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'gefluegel-ente'), 4, '', 400, '')
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
VALUES ('wild-hase-kaninchen-kaninchen-fleisch', 'Kaninchen Fleisch', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'wild-hase-kaninchen'), 4, '', 510, '')
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
VALUES ('wild-hase-kaninchen-hase-fleisch', 'Hase Fleisch', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'wild-hase-kaninchen'), 4, '', 520, '')
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
VALUES ('wild-hase-kaninchen-wildkaninchen', 'Wildkaninchen', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'wild-hase-kaninchen'), 4, '', 530, '')
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
VALUES ('wild-wildgefluegel-wildente', 'Wildente', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'wild-wildgefluegel'), 4, '', 570, '')
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
VALUES ('wild-wildgefluegel-fasan-rebhuhn', 'Fasan & Rebhuhn', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'wild-wildgefluegel'), 4, '', 580, '')
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
VALUES ('wild-wildgefluegel-wachtel', 'Wachtel', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'wild-wildgefluegel'), 4, '', 590, '')
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
VALUES ('innereien-leber-rinderleber', 'Rinderleber', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'innereien-leber'), 4, '', 630, '')
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
VALUES ('innereien-leber-schweineleber', 'Schweineleber', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'innereien-leber'), 4, '', 640, '')
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
VALUES ('innereien-leber-kalbsleber', 'Kalbsleber', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'innereien-leber'), 4, '', 650, '')
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
VALUES ('innereien-leber-gefluegelleber-haehnchen-ente-gans', 'Geflügelleber (Hähnchen, Ente, Gans)', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'innereien-leber'), 4, '', 660, '')
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
VALUES ('innereien-herz-rinderherz-schweineherz-haehnchenherz', 'Rinderherz, Schweineherz, Hähnchenherz', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'innereien-herz'), 4, '', 680, '')
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
VALUES ('wurstwaren-aufschnitt-kochwurst-leberwurst-pasteten', 'Leberwurst & Pasteten', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'wurstwaren-aufschnitt-kochwurst'), 4, '', 780, '')
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
VALUES ('wurstwaren-aufschnitt-kochwurst-blutwurst-suelze', 'Blutwurst & Sülze', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'wurstwaren-aufschnitt-kochwurst'), 4, '', 790, '')
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
VALUES ('wurstwaren-aufschnitt-kochwurst-presswurst', 'Presswurst', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'wurstwaren-aufschnitt-kochwurst'), 4, '', 800, '')
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
VALUES ('wurstwaren-aufschnitt-bruehwurst-wiener-frankfurter-wuerstchen', 'Wiener & Frankfurter Würstchen', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'wurstwaren-aufschnitt-bruehwurst'), 4, '', 820, '')
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
VALUES ('wurstwaren-aufschnitt-bruehwurst-lyoner-mortadella', 'Lyoner & Mortadella', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'wurstwaren-aufschnitt-bruehwurst'), 4, '', 830, '')
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
VALUES ('wurstwaren-aufschnitt-bruehwurst-fleischkaese-leberkaese', 'Fleischkäse & Leberkäse', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'wurstwaren-aufschnitt-bruehwurst'), 4, '', 840, '')
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
VALUES ('wurstwaren-aufschnitt-bruehwurst-gefluegelwurst', 'Geflügelwurst', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'wurstwaren-aufschnitt-bruehwurst'), 4, '', 850, '')
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
VALUES ('wurstwaren-aufschnitt-rohwurst-salami-schwein-rind-gefluegel', 'Salami (Schwein, Rind, Geflügel)', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'wurstwaren-aufschnitt-rohwurst'), 4, '', 870, '')
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
VALUES ('wurstwaren-aufschnitt-rohwurst-mettwurst-teewurst', 'Mettwurst & Teewurst', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'wurstwaren-aufschnitt-rohwurst'), 4, '', 880, '')
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
VALUES ('wurstwaren-aufschnitt-rohwurst-chorizo', 'Chorizo', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'wurstwaren-aufschnitt-rohwurst'), 4, '', 890, '')
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
VALUES ('wurstwaren-aufschnitt-rohwurst-cervelatwurst', 'Cervelatwurst', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'wurstwaren-aufschnitt-rohwurst'), 4, '', 900, '')
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
VALUES ('wurstwaren-aufschnitt-rohpoekelware-schinken-schwarzwaelder-schinken', 'Schwarzwälder Schinken', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'wurstwaren-aufschnitt-rohpoekelware-schinken'), 4, '', 920, '')
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
VALUES ('wurstwaren-aufschnitt-rohpoekelware-schinken-lachsschinken', 'Lachsschinken', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'wurstwaren-aufschnitt-rohpoekelware-schinken'), 4, '', 930, '')
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
VALUES ('wurstwaren-aufschnitt-rohpoekelware-schinken-prosciutto-parmaschinken', 'Prosciutto & Parmaschinken', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'wurstwaren-aufschnitt-rohpoekelware-schinken'), 4, '', 940, '')
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
VALUES ('wurstwaren-aufschnitt-rohpoekelware-schinken-kasseler', 'Kasseler', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'wurstwaren-aufschnitt-rohpoekelware-schinken'), 4, '', 950, '')
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
VALUES ('wurstwaren-aufschnitt-rohpoekelware-schinken-speck-geraeuchert', 'Speck geräuchert', '', '', (SELECT id FROM nutrition.food_categories WHERE slug = 'wurstwaren-aufschnitt-rohpoekelware-schinken'), 4, '', 960, '')
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
  name_display_de = COALESCE(NULLIF(name_display_de, ''), name_de),
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
  WHEN bls_code LIKE 'U0%' AND (lower(name_de) LIKE '%hack%' OR lower(name_de) LIKE '%hackfleisch%') THEN (SELECT id FROM nutrition.food_categories WHERE slug='rindfleisch-rinderhackfleisch-u0xxxx-rind')
  WHEN (bls_code LIKE 'U0%' OR bls_code LIKE 'U1%' OR bls_code LIKE 'U2%') AND (lower(name_de) LIKE '%filet%' OR lower(name_de) LIKE '%lende%' OR lower(name_de) LIKE '%steak%') THEN (SELECT id FROM nutrition.food_categories WHERE slug='rindfleisch-rindersteaks-braten')
  WHEN bls_code LIKE 'U0%' OR bls_code LIKE 'U1%' OR bls_code LIKE 'U2%' THEN (SELECT id FROM nutrition.food_categories WHERE slug='rindfleisch')
  WHEN bls_code LIKE 'U3%' OR bls_code LIKE 'U4%' THEN (SELECT id FROM nutrition.food_categories WHERE slug='kalbfleisch')
  WHEN bls_code LIKE 'U5%' OR bls_code LIKE 'U6%' THEN (SELECT id FROM nutrition.food_categories WHERE slug='schweinefleisch')
  WHEN bls_code LIKE 'U7%' OR bls_code LIKE 'U8%' THEN (SELECT id FROM nutrition.food_categories WHERE slug='lamm-schaf')
  WHEN bls_code LIKE 'V4%' AND lower(name_de) LIKE '%brust%' THEN (SELECT id FROM nutrition.food_categories WHERE slug='gefluegel-haehnchen-haehnchenbrust-filet')
  WHEN bls_code LIKE 'V4%' AND lower(name_de) LIKE '%pute%' THEN (SELECT id FROM nutrition.food_categories WHERE slug='gefluegel-pute-truthahn')
  WHEN bls_code LIKE 'V4%' THEN (SELECT id FROM nutrition.food_categories WHERE slug='gefluegel-haehnchen')
  WHEN bls_code LIKE 'V5%' OR bls_code LIKE 'V6%' THEN (SELECT id FROM nutrition.food_categories WHERE slug='innereien')
  WHEN bls_code LIKE 'W%' THEN (SELECT id FROM nutrition.food_categories WHERE slug='wurstwaren-aufschnitt')
  WHEN bls_code LIKE 'M%' AND lower(name_de) LIKE '%joghurt%' THEN (SELECT id FROM nutrition.food_categories WHERE slug='joghurt-quark')
  WHEN bls_code LIKE 'M%' AND (lower(name_de) LIKE '%käse%' OR lower(name_de) LIKE '%kaese%' OR lower(name_de) LIKE '%quark%' OR lower(name_de) LIKE '%mozzarella%' OR lower(name_de) LIKE '%gouda%' OR lower(name_de) LIKE '%camembert%') THEN (SELECT id FROM nutrition.food_categories WHERE slug='kaese-frischkaese')
  WHEN bls_code LIKE 'M%' THEN (SELECT id FROM nutrition.food_categories WHERE slug='trinkmilch-sahne')
  WHEN bls_code LIKE 'E%' THEN (SELECT id FROM nutrition.food_categories WHERE slug='eier')
  WHEN bls_code LIKE 'B%' THEN (SELECT id FROM nutrition.food_categories WHERE slug='brot')
  WHEN bls_code LIKE 'D%' THEN (SELECT id FROM nutrition.food_categories WHERE slug='backwaren-gebaeck-snack-kategorie')
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

-- =============================================================
-- sort_weight nach SPEC_05_FOOD_TAXONOMY, Abschnitt "Sort Weight System"
-- =============================================================
-- ERZEUGT aus supabase/_pipeline/daten/sortweight-formel.json durch
-- supabase/_pipeline/_ableitung/sortweight-sql-erzeugen.ts.
-- NICHT von Hand aendern — die Formel steht in der Datendatei, sonst
-- driften beide auseinander.
--
-- Vorher stand hier eine Fassung nach SPEC_08_IMPORT_PIPELINE. Die
-- Unterschiede und die Ablösung sind in docs/ssot/51-sortweight-formel.md
-- belegt (dritter Teil). Kurz:
--   * SPEC_08 kannte 8 Core-Codes, SPEC_05 kennt 30.
--   * SPEC_08 hatte keine Innereien-, Blut- und Fettgewebe-Abzuege.
--   * SPEC_08 zog X/Y zusaetzlich -300 ab, obwohl die Basis die
--     Warengruppe schon kodiert (Doppelbestrafung, siehe unten).
--
-- ZWEI REGELN DER SPEC SIND GESTRICHEN; EINE GREIFT ERST SPAETER:
--   * ultra_processed (-250): 020 laeuft vor dem kuratierten Tag-Import.
--     C-100 fuellt processing_level in 027_lebensmittel-tags.ts und
--     aktualisiert sort_weight danach ueber sortweight-berechnen.ts.
--   * fertiggericht (-300, X/Y) und alkohol (-300, P): GESTRICHEN.
--     Doppelbestrafung — die Basis kodiert die Warengruppe bereits
--     (X 200, Y 240, P 180). `[cmd]` Mit dem Abzug standen alle 119
--     P-Eintraege auf 0 (eine einzige Stufe), dazu 1.114 von 1.165 X
--     und 862 von 885 Y.
--
-- EINE ABWEICHUNG VON DER SPEC, bewusst und entschieden:
--   * whole_food (+60) feuert bei Zubereitungscode 100 ODER 000.
--     Die Spec nennt nur 100. `[read]` 44-bls-codestruktur.md: 000
--     heisst nicht "roh", sondern "keine Zubereitungsvariante" —
--     Haferflocken, Skyr und Olivenoel tragen 000, weil sie keine
--     Rohform HABEN. nutrition.such_rang_zubereitung behandelt beide
--     seit Block 32 gleichrangig; Code schlaegt Spec.
--
-- `[cmd]` Abnahme: MealCam-Massstab 34 von 37 (vorher 31), 145
-- Nullwerte statt 2.165, 95 Stufen statt 93.
-- =============================================================
UPDATE nutrition.foods f
SET sort_weight = LEAST(1000, GREATEST(0,
  -- Basis nach Warengruppe
  CASE substring(f.bls_code from 1 for 1)
    WHEN 'B' THEN 520
    WHEN 'C' THEN 700
    WHEN 'D' THEN 340
    WHEN 'E' THEN 750
    WHEN 'F' THEN 660
    WHEN 'G' THEN 660
    WHEN 'H' THEN 650
    WHEN 'K' THEN 550
    WHEN 'M' THEN 660
    WHEN 'N' THEN 400
    WHEN 'P' THEN 180
    WHEN 'Q' THEN 460
    WHEN 'R' THEN 360
    WHEN 'S' THEN 240
    WHEN 'T' THEN 700
    WHEN 'U' THEN 780
    WHEN 'V' THEN 760
    WHEN 'W' THEN 440
    WHEN 'X' THEN 200
    WHEN 'Y' THEN 240
    ELSE 400
  END
  -- Sonderfaelle: die Spec teilt E, U und V nach Untergruppe
  + CASE
      WHEN substring(f.bls_code from 1 for 1) = 'E' AND nutrition.search_fold(COALESCE(f.name_de,'')) ~ '\m(teigwaren|nudeln|spaetzle)\M' THEN 580 - 750
      WHEN substring(f.bls_code from 1 for 1) = 'U' AND (nutrition.search_fold(COALESCE(f.name_de,'')) ~ '\m(fettgewebe|speck|flomen|wamme)\M'
                            OR nutrition.search_fold(COALESCE(f.name_de,'')) ~ '^[a-z]+ schwarte\M') THEN 100 - 780
      WHEN substring(f.bls_code from 1 for 1) = 'V' AND nutrition.search_fold(COALESCE(f.name_de,'')) ~ '\m(leber|herz|magen|niere)\M' THEN 300 - 760
      ELSE 0
    END
  -- Zuschlaege
  + CASE WHEN f.bls_code IN (
        'B101000','C133000','C352000','E111100','E113100','F502100',
        'F503100','G211100','G312100','G543100','G561100','G620100',
        'H120100','H210100','H725100','H861000','K110100','K420100',
        'M141100','M710100','M711100','M713100','Q120000','T102100',
        'T121100','T410100','U010100','U211100','V416100','V486100'
      ) THEN 200 ELSE 0 END
  + CASE WHEN COALESCE(prot.value, -1) >= 20 THEN 80 ELSE 0 END
  + CASE WHEN COALESCE(prot.value, -1) >= 30 THEN 120 ELSE 0 END
  + CASE WHEN COALESCE(prot.value, -1) >= 20 AND fat.value IS NOT NULL
              AND fat.value <= 5 THEN 50 ELSE 0 END
  + CASE WHEN COALESCE(n3.value, -1) >= 1 THEN 40 ELSE 0 END
  + CASE WHEN COALESCE(fibt.value, -1) >= 6 THEN 30 ELSE 0 END
  + CASE WHEN substring(f.bls_code from 5 for 3) IN ('100','000') AND substring(f.bls_code from 1 for 1) IN ('C','G','F','H','T') THEN 60 ELSE 0 END
  + CASE WHEN nutrition.search_fold(COALESCE(f.name_de,'')) ~ '\m(hummer|kaviar|trueffel)\M' THEN 100 ELSE 0 END
  -- Grundform: nicht aus der Spec, sondern aus Block 32. Ohne sie
  -- faellt "Banane roh" hinter "Banane getrocknet".
  + CASE WHEN (substring(f.bls_code from 5 for 3) IN ('100','000') AND NOT nutrition.search_fold(COALESCE(f.name_de,'')) ~ '\m(gebraten|gekocht|gegrillt|paniert|geschmort|gebacken|frittiert|geduenstet|pochiert)\M') THEN 120 ELSE 0 END
  -- Abzuege
  + CASE WHEN (substring(f.bls_code from 5 for 3) IN ('100','000') AND NOT nutrition.search_fold(COALESCE(f.name_de,'')) ~ '\m(gebraten|gekocht|gegrillt|paniert|geschmort|gebacken|frittiert|geduenstet|pochiert)\M') THEN 0 ELSE -150 END
  + CASE WHEN nutrition.search_fold(COALESCE(f.name_de,'')) ~ '\m(gesuesst|gezuckert|dragiert|kandiert)\M' THEN -100 ELSE 0 END
  + CASE WHEN nutrition.search_fold(COALESCE(f.name_de,'')) ~ '\mkonserve\M' AND substring(f.bls_code from 1 for 1) <> 'T' THEN -80 ELSE 0 END
  + CASE WHEN nutrition.search_fold(COALESCE(f.name_de,'')) ~ '\m(herz|herzen|niere|nieren|magen|kutteln|bries|zunge|euter)\M'
         THEN -400 ELSE 0 END
  + CASE WHEN nutrition.search_fold(COALESCE(f.name_de,'')) ~ '\mleber'
              AND NOT nutrition.search_fold(COALESCE(f.name_de,'')) ~ '\m(leberkaese|leberwurst|leberpastete|leberknoedel|leberterrine)\M'
         THEN -380 ELSE 0 END
  + CASE WHEN nutrition.search_fold(COALESCE(f.name_de,'')) ~ '\m(hirn|gehirn|lunge|milz)\M' THEN -450 ELSE 0 END
  + CASE WHEN nutrition.search_fold(COALESCE(f.name_de,'')) ~ '\mblut' THEN -500 ELSE 0 END
  + CASE WHEN nutrition.search_fold(COALESCE(f.name_de,'')) ~ '\mfettgewebe\M' THEN -500 ELSE 0 END
  + CASE WHEN nutrition.search_fold(COALESCE(f.name_de,'')) ~ '\mknochenmark\M' THEN -450 ELSE 0 END
  -- Schwarte nur, wenn das Stueck die Schwarte IST. `[cmd]` 8 Eintraege
  -- heissen "(mit|ohne) Fett und Schwarte" und meinen ein Bratenstueck;
  -- vier davon fielen sonst von 480 auf 0.
  + CASE WHEN (nutrition.search_fold(COALESCE(f.name_de,'')) ~ '^[a-z]+ schwarte\M' OR nutrition.search_fold(COALESCE(f.name_de,'')) ~ '\mschwarten\M')
              AND NOT nutrition.search_fold(COALESCE(f.name_de,'')) ~ '\mschwarten und\M' THEN -430 ELSE 0 END
  + CASE WHEN nutrition.search_fold(COALESCE(f.name_de,'')) ~ '\ms (i|ii|iii|iv|v|vi|vii|viii|ix|x|xi|xii)\M' THEN -200 ELSE 0 END
))
FROM nutrition.foods source_food
LEFT JOIN nutrition.food_nutrients prot ON prot.food_id = source_food.id AND prot.nutrient_code = 'PROT625'
LEFT JOIN nutrition.food_nutrients fat  ON fat.food_id  = source_food.id AND fat.nutrient_code  = 'FAT'
LEFT JOIN nutrition.food_nutrients fibt ON fibt.food_id = source_food.id AND fibt.nutrient_code = 'FIBT'
LEFT JOIN nutrition.food_nutrients n3   ON n3.food_id   = source_food.id AND n3.nutrient_code   = 'FAPUN3'
WHERE f.id = source_food.id;

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
