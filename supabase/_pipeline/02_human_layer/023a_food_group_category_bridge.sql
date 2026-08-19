-- =============================================================
-- 023a - Bruecke food_categories -> food_groups
-- Datum: 2026-08-19. Laeuft NACH 023.
-- =============================================================
--
-- C-99: food_groups sind Anzeigegruppen, food_categories sind
-- BLS-Feinkategorien. Das ist eine n:1-Beziehung; deshalb sitzt der
-- Fremdschluessel an food_categories, nicht an foods.
--
-- Der Schritt lernt aus den 4.903 bereits kategorisierten Foods:
-- Jede dort belegte Kategorie ist praefixrein. Wo der sichtbare
-- Anzeigegruppen-Code nicht dem BLS-Praefix entspricht (N/P/Q), wird
-- explizit aus der bestehenden Kategorienwurzel zugeordnet.
--
-- Ergaenzend werden nur sichere Null-Kategorie-Bloecke gesetzt:
--   N   -> getraenke
--   X/Y -> fertiggerichte-zubereitungen
-- Die 73 U/V-Reste bleiben leer, weil sie Fleisch, Wild, Schnecken,
-- Brotaufstriche, Suppen und Saucen mischen.
-- =============================================================

BEGIN;

ALTER TABLE nutrition.food_categories
  ADD COLUMN IF NOT EXISTS food_group_code TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'food_categories_food_group_code_fkey'
      AND conrelid = 'nutrition.food_categories'::regclass
  ) THEN
    ALTER TABLE nutrition.food_categories
      ADD CONSTRAINT food_categories_food_group_code_fkey
      FOREIGN KEY (food_group_code) REFERENCES nutrition.food_groups(code);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_food_categories_food_group_code
  ON nutrition.food_categories(food_group_code);

COMMENT ON COLUMN nutrition.food_categories.food_group_code IS
  'C-99: n:1-Bruecke von BLS-Feinkategorien zu nutrition.food_groups. '
  'NULL heisst: keine eindeutige Anzeigegruppe belegbar.';

UPDATE nutrition.food_categories
SET food_group_code = NULL;

-- 1) Aus belegten Kategorien lernen: 32 Kategorien mit Foods,
-- alle praefixrein. R und Q werden auf die vorhandenen Anzeigegruppen
-- uebersetzt: N = Fette/Oele, P = Getraenke, Q = Wuerzmittel.
WITH learned AS (
  SELECT
    f.category_id,
    CASE MIN(substr(f.bls_code, 1, 1))
      WHEN 'Q' THEN 'N'
      WHEN 'R' THEN 'Q'
      WHEN 'N' THEN 'P'
      ELSE MIN(substr(f.bls_code, 1, 1))
    END AS group_code
  FROM nutrition.foods f
  WHERE f.category_id IS NOT NULL
  GROUP BY f.category_id
  HAVING COUNT(DISTINCT substr(f.bls_code, 1, 1)) = 1
)
UPDATE nutrition.food_categories c
SET food_group_code = learned.group_code
FROM learned
WHERE c.id = learned.category_id;

-- 2) Wurzeln, deren Anzeigegruppe aus der bestehenden Kategorie selbst
-- eindeutig ist, obwohl darunter derzeit keine oder gemischte Foods
-- haengen.
WITH explicit(slug, group_code) AS (
  VALUES
    ('getraenke', 'P'),
    ('fette-oele', 'N'),
    ('wuerzmittel-gewuerze', 'Q')
)
UPDATE nutrition.food_categories c
SET food_group_code = explicit.group_code
FROM explicit
WHERE c.slug = explicit.slug;

-- 3) Eindeutige Elternbeziehung nach unten vererben. Mischwurzeln wie
-- fleisch-gefluegel, getreide-brot-pasta und fertiggerichte bleiben
-- auf der Wurzel NULL; ihre belegten Unterkategorien tragen die Gruppe.
WITH RECURSIVE inherited AS (
  SELECT id, parent_id, food_group_code
  FROM nutrition.food_categories
  WHERE parent_id IS NULL
  UNION ALL
  SELECT
    child.id,
    child.parent_id,
    COALESCE(child.food_group_code, inherited.food_group_code) AS food_group_code
  FROM nutrition.food_categories child
  JOIN inherited ON inherited.id = child.parent_id
)
UPDATE nutrition.food_categories c
SET food_group_code = inherited.food_group_code
FROM inherited
WHERE c.id = inherited.id
  AND c.food_group_code IS NULL
  AND inherited.food_group_code IS NOT NULL;

-- 4) Sichere Foods ohne Feinkategorie nachziehen.
UPDATE nutrition.foods
SET category_id = (SELECT id FROM nutrition.food_categories WHERE slug = 'getraenke')
WHERE category_id IS NULL
  AND bls_code LIKE 'N%';

UPDATE nutrition.foods
SET category_id = (SELECT id FROM nutrition.food_categories WHERE slug = 'fertiggerichte-zubereitungen')
WHERE category_id IS NULL
  AND (bls_code LIKE 'X%' OR bls_code LIKE 'Y%');

-- Selbstkontrolle: Die alten 4.903 Kategoriezuweisungen muessen durch
-- die Bruecke erreichbar bleiben. Bei Misch-/Gerichtswurzeln greift der
-- Praefix-Fallback in 073; das ist hier bewusst nicht als Kategorie-FK
-- modelliert.
DO $$
DECLARE
  v_categories_with_group int;
  v_foods_categorized int;
  v_foods_uncategorized int;
  v_unsafe int;
BEGIN
  SELECT COUNT(*) INTO v_categories_with_group
  FROM nutrition.food_categories
  WHERE food_group_code IS NOT NULL;

  SELECT COUNT(*) FILTER (WHERE category_id IS NOT NULL),
         COUNT(*) FILTER (WHERE category_id IS NULL)
    INTO v_foods_categorized, v_foods_uncategorized
  FROM nutrition.foods;

  SELECT COUNT(*) INTO v_unsafe
  FROM nutrition.foods
  WHERE category_id IS NULL
    AND substr(bls_code, 1, 1) NOT IN ('U', 'V');

  IF v_categories_with_group = 0 THEN
    RAISE EXCEPTION 'Keine food_categories.food_group_code gesetzt';
  END IF;
  IF v_foods_categorized <> 7067 OR v_foods_uncategorized <> 73 THEN
    RAISE EXCEPTION 'Unerwartete Kategorieabdeckung: % kategorisiert, % leer',
      v_foods_categorized, v_foods_uncategorized;
  END IF;
  IF v_unsafe <> 0 THEN
    RAISE EXCEPTION '% nicht-U/V-Foods ohne Kategorie geblieben', v_unsafe;
  END IF;

  RAISE NOTICE 'OK: % Kategorien mit food_group_code, % Foods kategorisiert, % bewusst leer',
    v_categories_with_group, v_foods_categorized, v_foods_uncategorized;
END $$;

COMMIT;
