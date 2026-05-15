import fs from 'node:fs'
import path from 'node:path'

export type FoodCategorySeed = {
  slug: string
  name_de: string
  name_en: string
  name_th: string
  parent_slug: string | null
  level: 1 | 2 | 3 | 4
  icon: string
  sort_order: number
  bls_hint: string
}

export type TagDefinitionSeed = {
  code: string
  name_de: string
  name_en: string
  tag_type: 'diet' | 'allergen' | 'processing'
  is_exclusion_relevant: boolean
  icon: string
  sort_order: number
  requires_macro_check: boolean
  macro_rule: Record<string, string | number> | null
}

const L1_BLS_HINTS: Record<string, string> = {
  'fleisch-gefluegel': 'BLS prefixes U,V,W',
  'fisch-meeresfruechte': 'BLS prefix T',
  'milch-kaese': 'BLS prefix M',
  eier: 'BLS prefix E',
  'getreide-brot-pasta': 'BLS prefixes B,C',
  gemuese: 'BLS prefixes G,K',
  obst: 'BLS prefix F',
  'huelsenfruechte-nuesse-samen': 'BLS prefix H',
  'fette-oele': 'BLS prefix Q',
  'suesses-snacks': 'BLS prefix S',
  getraenke: 'BLS prefix P',
  'fertiggerichte-zubereitungen': 'prepared dish scope; BLS category varies',
  'wuerzmittel-gewuerze': 'BLS prefix R',
}

export const V1_TAG_DEFINITIONS: TagDefinitionSeed[] = [
  { code: 'high_protein', name_de: 'Proteinreich', name_en: 'High protein', tag_type: 'diet', is_exclusion_relevant: false, icon: '', sort_order: 10, requires_macro_check: true, macro_rule: { nutrient_code: 'PROT625', op: '>=', value: 20 } },
  { code: 'low_carb', name_de: 'Low-Carb', name_en: 'Low carb', tag_type: 'diet', is_exclusion_relevant: false, icon: '', sort_order: 20, requires_macro_check: true, macro_rule: { nutrient_code: 'CHO', op: '<=', value: 10 } },
  { code: 'low_fat', name_de: 'Fettarm', name_en: 'Low fat', tag_type: 'diet', is_exclusion_relevant: false, icon: '', sort_order: 30, requires_macro_check: true, macro_rule: { nutrient_code: 'FAT', op: '<=', value: 3 } },
  { code: 'high_fiber', name_de: 'Ballaststoffreich', name_en: 'High fiber', tag_type: 'diet', is_exclusion_relevant: false, icon: '', sort_order: 40, requires_macro_check: true, macro_rule: { nutrient_code: 'FIBT', op: '>=', value: 6 } },
  { code: 'vegan', name_de: 'Vegan', name_en: 'Vegan', tag_type: 'diet', is_exclusion_relevant: true, icon: '', sort_order: 50, requires_macro_check: false, macro_rule: null },
  { code: 'vegetarian', name_de: 'Vegetarisch', name_en: 'Vegetarian', tag_type: 'diet', is_exclusion_relevant: true, icon: '', sort_order: 60, requires_macro_check: false, macro_rule: null },
  { code: 'gluten_free', name_de: 'Glutenfrei', name_en: 'Gluten free', tag_type: 'diet', is_exclusion_relevant: true, icon: '', sort_order: 70, requires_macro_check: false, macro_rule: null },
  { code: 'lactose_free', name_de: 'Laktosefrei', name_en: 'Lactose free', tag_type: 'diet', is_exclusion_relevant: true, icon: '', sort_order: 80, requires_macro_check: false, macro_rule: null },
  { code: 'nut_free', name_de: 'Nussfrei', name_en: 'Nut free', tag_type: 'allergen', is_exclusion_relevant: true, icon: '', sort_order: 90, requires_macro_check: false, macro_rule: null },
  { code: 'halal', name_de: 'Halal', name_en: 'Halal', tag_type: 'diet', is_exclusion_relevant: false, icon: '', sort_order: 100, requires_macro_check: false, macro_rule: null },
  { code: 'kosher', name_de: 'Koscher', name_en: 'Kosher', tag_type: 'diet', is_exclusion_relevant: false, icon: '', sort_order: 110, requires_macro_check: false, macro_rule: null },
  { code: 'spicy', name_de: 'Scharf', name_en: 'Spicy', tag_type: 'diet', is_exclusion_relevant: false, icon: '', sort_order: 120, requires_macro_check: false, macro_rule: null },
  { code: 'thai_food', name_de: 'Thai Food', name_en: 'Thai food', tag_type: 'diet', is_exclusion_relevant: false, icon: '', sort_order: 130, requires_macro_check: false, macro_rule: null },
  { code: 'mediterranean', name_de: 'Mediterran', name_en: 'Mediterranean', tag_type: 'diet', is_exclusion_relevant: false, icon: '', sort_order: 140, requires_macro_check: false, macro_rule: null },
  { code: 'processed_food', name_de: 'Verarbeitet', name_en: 'Processed food', tag_type: 'processing', is_exclusion_relevant: false, icon: '', sort_order: 150, requires_macro_check: false, macro_rule: null },
  { code: 'ultra_processed', name_de: 'Hochverarbeitet', name_en: 'Ultra-processed', tag_type: 'processing', is_exclusion_relevant: false, icon: '', sort_order: 160, requires_macro_check: false, macro_rule: null },
]

function stripLeadingEmoji(value: string): { icon: string; title: string } {
  const trimmed = value.trim()
  const match = trimmed.match(/^(\p{Extended_Pictographic})\s+(.+)$/u)
  if (!match) return { icon: '', title: trimmed }
  return { icon: match[1] ?? '', title: match[2] ?? trimmed }
}

export function slugifyCategoryName(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/&/g, ' ')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function normalizeSourceAlias(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFC')
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function extractCategorySeeds(markdown: string): FoodCategorySeed[] {
  const lines = markdown.split(/\r?\n/)
  const rows: FoodCategorySeed[] = []
  let inTree = false
  let sort = 0
  let currentParent: FoodCategorySeed | null = null
  let currentLevel2: FoodCategorySeed | null = null
  let currentLevel3: FoodCategorySeed | null = null

  for (const line of lines) {
    if (line.startsWith('## Category Tree')) {
      inTree = true
      continue
    }
    if (inTree && line.startsWith('## Semantic Tags')) break
    if (!inTree) continue

    const l1 = line.match(/^###\s+(.+)$/)
    if (l1) {
      const { icon, title } = stripLeadingEmoji(l1[1] ?? '')
      const slug = slugifyCategoryName(title)
      currentParent = {
        slug,
        name_de: title,
        name_en: '',
        name_th: '',
        parent_slug: null,
        level: 1,
        icon,
        sort_order: sort += 10,
        bls_hint: L1_BLS_HINTS[slug] ?? '',
      }
      rows.push(currentParent)
      currentLevel2 = null
      currentLevel3 = null
      continue
    }

    const l2 = line.match(/^####\s+(.+)$/)
    if (l2 && currentParent) {
      const title = l2[1] ?? ''
      currentLevel2 = {
        slug: slugifyCategoryName(title),
        name_de: title,
        name_en: '',
        name_th: '',
        parent_slug: currentParent.slug,
        level: 2,
        icon: '',
        sort_order: sort += 10,
        bls_hint: '',
      }
      currentLevel3 = null
      rows.push(currentLevel2)
      continue
    }

    const level4 = line.match(/^\s{2,}-\s+(.+)$/)
    if (level4 && currentLevel3) {
      const title = cleanBulletTitle(level4[1] ?? '')
      const slug = `${currentLevel3.slug}-${slugifyCategoryName(title)}`
      rows.push({
        slug,
        name_de: title,
        name_en: '',
        name_th: '',
        parent_slug: currentLevel3.slug,
        level: 4,
        icon: '',
        sort_order: sort += 10,
        bls_hint: '',
      })
      continue
    }

    const level3 = line.match(/^-\s+(.+)$/)
    if (level3 && currentLevel2) {
      const title = cleanBulletTitle(level3[1] ?? '')
      const slug = `${currentLevel2.slug}-${slugifyCategoryName(title)}`
      currentLevel3 = {
        slug,
        name_de: title,
        name_en: '',
        name_th: '',
        parent_slug: currentLevel2.slug,
        level: 3,
        icon: '',
        sort_order: sort += 10,
        bls_hint: '',
      }
      rows.push(currentLevel3)
    }
  }

  const seen = new Set<string>()
  return rows.filter(row => {
    if (!row.slug || seen.has(row.slug)) return false
    seen.add(row.slug)
    return true
  })
}

function cleanBulletTitle(value: string): string {
  return value
    .replace(/\s+â†’.+$/u, '')
    .replace(/\s+→.+$/u, '')
    .trim()
}

function sql(value: string): string {
  return `'${value.replace(/'/g, "''")}'`
}

function categoryInsertSql(row: FoodCategorySeed): string {
  const parent = row.parent_slug
    ? `(SELECT id FROM nutrition.food_categories WHERE slug = ${sql(row.parent_slug)})`
    : 'NULL'
  return `INSERT INTO nutrition.food_categories (slug, name_de, name_en, name_th, parent_id, level, icon, sort_order, bls_hint)
VALUES (${sql(row.slug)}, ${sql(row.name_de)}, ${sql(row.name_en)}, ${sql(row.name_th)}, ${parent}, ${row.level}, ${sql(row.icon)}, ${row.sort_order}, ${sql(row.bls_hint)})
ON CONFLICT (slug) DO UPDATE SET
  name_de = EXCLUDED.name_de,
  name_en = EXCLUDED.name_en,
  name_th = EXCLUDED.name_th,
  parent_id = EXCLUDED.parent_id,
  level = EXCLUDED.level,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  bls_hint = EXCLUDED.bls_hint;`
}

function tagInsertSql(row: TagDefinitionSeed): string {
  return `INSERT INTO nutrition.tag_definitions (code, name_de, name_en, tag_type, is_exclusion_relevant, icon, sort_order, requires_macro_check, macro_rule)
VALUES (${sql(row.code)}, ${sql(row.name_de)}, ${sql(row.name_en)}, ${sql(row.tag_type)}, ${row.is_exclusion_relevant}, ${sql(row.icon)}, ${row.sort_order}, ${row.requires_macro_check}, ${row.macro_rule ? sql(JSON.stringify(row.macro_rule)) + '::jsonb' : 'NULL'})
ON CONFLICT (code) DO UPDATE SET
  name_de = EXCLUDED.name_de,
  name_en = EXCLUDED.name_en,
  tag_type = EXCLUDED.tag_type,
  is_exclusion_relevant = EXCLUDED.is_exclusion_relevant,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  requires_macro_check = EXCLUDED.requires_macro_check,
  macro_rule = EXCLUDED.macro_rule;`
}

export function buildHumanLayerSql(categories: FoodCategorySeed[]): string {
  const l1 = categories.filter(row => row.level === 1)
  const l2 = categories.filter(row => row.level === 2)
  const l3 = categories.filter(row => row.level === 3)
  const l4 = categories.filter(row => row.level === 4)

  return `-- P1-005 Local Food Taxonomy / Human Layer Foundation
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

-- Category seed: Level 1 through Level 4 categories extracted from SPEC_05 headings and nested bullets.
${l1.map(categoryInsertSql).join('\n')}
${l2.map(categoryInsertSql).join('\n')}
${l3.map(categoryInsertSql).join('\n')}
${l4.map(categoryInsertSql).join('\n')}

-- Deterministic V1 tag definitions from SPEC_04/SPEC_05.
${V1_TAG_DEFINITIONS.map(tagInsertSql).join('\n')}

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

-- Deterministic local sort_weight refresh based on SPEC_08 scoring rules.
UPDATE nutrition.foods f
SET sort_weight = LEAST(1000, GREATEST(0,
  CASE substring(f.bls_code from 1 for 1)
    WHEN 'C' THEN 700
    WHEN 'E' THEN 680
    WHEN 'F' THEN 660
    WHEN 'G' THEN 660
    WHEN 'H' THEN 650
    WHEN 'K' THEN 550
    WHEN 'M' THEN 660
    WHEN 'T' THEN 700
    WHEN 'B' THEN 520
    WHEN 'D' THEN 340
    WHEN 'Q' THEN 460
    WHEN 'R' THEN 360
    WHEN 'S' THEN 240
    WHEN 'N' THEN 400
    WHEN 'P' THEN 180
    WHEN 'X' THEN 200
    WHEN 'Y' THEN 240
    WHEN 'W' THEN 440
    ELSE 400
  END
  + CASE
      WHEN f.bls_code IN ('V416100','V486100','U010100','U211100','C133000','C352000','E111100','E113100')
        OR f.bls_code LIKE 'T102%' OR f.bls_code LIKE 'T103%' OR f.bls_code LIKE 'T302%' OR f.bls_code LIKE 'T306%' THEN 200
      ELSE 0
    END
  + CASE
      WHEN COALESCE(protein.value, 0) >= 30 THEN 120
      WHEN COALESCE(protein.value, 0) >= 20 THEN 80
      ELSE 0
    END
  + CASE WHEN COALESCE(protein.value, 0) >= 20 AND COALESCE(fat.value, 999) <= 5 THEN 50 ELSE 0 END
  + CASE WHEN substring(f.bls_code from 1 for 1) IN ('X','Y') THEN -300 ELSE 0 END
  + CASE WHEN lower(f.name_de) LIKE '%gesüßt%' OR lower(f.name_de) LIKE '%gezuckert%' OR lower(f.name_de) LIKE '%instant%' THEN -100 ELSE 0 END
  + CASE WHEN lower(f.name_de) LIKE '%konserve%' OR lower(f.name_de) LIKE '%dose%' THEN -80 ELSE 0 END
  + CASE WHEN lower(f.name_de) LIKE '%gekocht%' OR lower(f.name_de) LIKE '%gebraten%' THEN -150 ELSE 0 END
))
FROM nutrition.foods source_food
LEFT JOIN nutrition.food_nutrients protein ON protein.food_id = source_food.id AND protein.nutrient_code = 'PROT625'
LEFT JOIN nutrition.food_nutrients fat ON fat.food_id = source_food.id AND fat.nutrient_code = 'FAT'
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
`
}

export function buildHumanLayerReportSql(): string {
  return `
SELECT 'foods_total', COUNT(*)::text FROM nutrition.foods
UNION ALL SELECT 'food_nutrients_total', COUNT(*)::text FROM nutrition.food_nutrients
UNION ALL SELECT 'food_categories_total', COUNT(*)::text FROM nutrition.food_categories
UNION ALL SELECT 'food_categories_level_1', COUNT(*)::text FROM nutrition.food_categories WHERE level=1
UNION ALL SELECT 'food_categories_level_2', COUNT(*)::text FROM nutrition.food_categories WHERE level=2
UNION ALL SELECT 'food_categories_level_3', COUNT(*)::text FROM nutrition.food_categories WHERE level=3
UNION ALL SELECT 'food_categories_level_4', COUNT(*)::text FROM nutrition.food_categories WHERE level=4
UNION ALL SELECT 'orphan_category_parents', COUNT(*)::text FROM nutrition.food_categories c WHERE c.parent_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM nutrition.food_categories p WHERE p.id=c.parent_id)
UNION ALL SELECT 'tag_definitions_total', COUNT(*)::text FROM nutrition.tag_definitions
UNION ALL SELECT 'food_tags_total', COUNT(*)::text FROM nutrition.food_tags
UNION ALL SELECT 'food_aliases_total', COUNT(*)::text FROM nutrition.food_aliases
UNION ALL SELECT 'foods_categorized', COUNT(*)::text FROM nutrition.foods WHERE category_id IS NOT NULL
UNION ALL SELECT 'foods_uncategorized', COUNT(*)::text FROM nutrition.foods WHERE category_id IS NULL
UNION ALL SELECT 'sort_weight_populated', COUNT(*)::text FROM nutrition.foods WHERE sort_weight IS NOT NULL
UNION ALL SELECT 'sort_weight_missing', COUNT(*)::text FROM nutrition.foods WHERE sort_weight IS NULL
UNION ALL SELECT 'missing_nutrient_fk', COUNT(*)::text FROM nutrition.food_nutrients fn WHERE NOT EXISTS (SELECT 1 FROM nutrition.nutrient_defs nd WHERE nd.code=fn.nutrient_code)
UNION ALL SELECT 'orphan_food_nutrients', COUNT(*)::text FROM nutrition.food_nutrients fn WHERE NOT EXISTS (SELECT 1 FROM nutrition.foods f WHERE f.id=fn.food_id)
UNION ALL SELECT 'utf8_suspect_foods', COUNT(*)::text FROM nutrition.foods WHERE name_de LIKE '%??%' OR name_de LIKE '%�%'
ORDER BY 1;
`
}

function main(): void {
  const repoRoot = process.cwd()
  const specPath = path.join(repoRoot, 'docs/specs/Nutrition/01_current_specs/SPEC_05_FOOD_TAXONOMY.md')
  const outPath = path.join(repoRoot, 'docs/project/p1-005/P1-005-local-food-human-layer.sql')
  const reportSqlPath = path.join(repoRoot, 'docs/project/p1-005/P1-005-local-food-human-layer-validation.sql')
  const markdown = fs.readFileSync(specPath, 'utf8')
  const categories = extractCategorySeeds(markdown)
  fs.writeFileSync(outPath, buildHumanLayerSql(categories), 'utf8')
  fs.writeFileSync(reportSqlPath, buildHumanLayerReportSql(), 'utf8')
  console.log(JSON.stringify({
    status: 'generated',
    migration_sql: path.relative(repoRoot, outPath).replace(/\\/g, '/'),
    validation_sql: path.relative(repoRoot, reportSqlPath).replace(/\\/g, '/'),
    category_rows: categories.length,
    category_level_1: categories.filter(row => row.level === 1).length,
    category_level_2: categories.filter(row => row.level === 2).length,
    category_level_3: categories.filter(row => row.level === 3).length,
    category_level_4: categories.filter(row => row.level === 4).length,
    tag_definitions: V1_TAG_DEFINITIONS.length,
  }, null, 2))
}

if (require.main === module) {
  main()
}
