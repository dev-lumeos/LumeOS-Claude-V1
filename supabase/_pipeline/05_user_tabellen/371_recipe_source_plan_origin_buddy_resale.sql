-- C-371/C-374/C-375, E-39/E-40/E-42:
-- Herkunft und Weiterverkaufsrecht vorsehen, ohne Coach-, Marketplace-
-- oder Buddy-Schreibweg zu bauen. measurement_source bleibt Messherkunft.

BEGIN;

-- Bestehende Rezepte sind eigene V1-Rezepte; ihr fachlicher Ursprung ist
-- daher belegbar `user`. Bestehende Planurspruenge bleiben weiterhin NULL,
-- weil sie vor C-342 nicht nachweisbar sind.
ALTER TABLE nutrition.recipes
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'user';

ALTER TABLE nutrition.recipes
  DROP CONSTRAINT IF EXISTS recipes_source_check;
ALTER TABLE nutrition.recipes
  ADD CONSTRAINT recipes_source_check
  CHECK (source IN ('user', 'coach', 'marketplace', 'buddy'));

ALTER TABLE nutrition.meal_plans
  DROP CONSTRAINT IF EXISTS meal_plans_plan_origin_check;
ALTER TABLE nutrition.meal_plans
  ADD CONSTRAINT meal_plans_plan_origin_check
  CHECK (plan_origin IS NULL OR plan_origin IN ('self_created', 'coach_created', 'marketplace', 'buddy'));

-- E-42: Der Nutzer darf immer bearbeiten. Dieses Flag ist ausschliesslich
-- der fuer die Anzeige vorbereitete Weiterverkaufsschutz.
ALTER TABLE nutrition.recipes
  ADD COLUMN IF NOT EXISTS darf_weiterverkaufen boolean NOT NULL DEFAULT true;
ALTER TABLE nutrition.meal_plans
  ADD COLUMN IF NOT EXISTS darf_weiterverkaufen boolean NOT NULL DEFAULT true;

COMMENT ON COLUMN nutrition.recipes.source IS
  'C-371/E-39: Fachlicher Ursprung eines Rezepts: user, coach, marketplace oder buddy; getrennt von measurement_source.';
COMMENT ON COLUMN nutrition.meal_plans.plan_origin IS
  'C-374/E-40: Produktursprung eines Meal Plans: self_created, coach_created, marketplace oder buddy. NULL bedeutet bei Bestandsplaenen unbekannt und wird nicht geraten.';
COMMENT ON COLUMN nutrition.recipes.darf_weiterverkaufen IS
  'C-375/E-42: Weiterverkaufsrecht, kein Bearbeitungsrecht. Neue und bestehende eigene Datensaetze starten mit true.';
COMMENT ON COLUMN nutrition.meal_plans.darf_weiterverkaufen IS
  'C-375/E-42: Weiterverkaufsrecht, kein Bearbeitungsrecht. Neue und bestehende eigene Datensaetze starten mit true.';

COMMIT;
