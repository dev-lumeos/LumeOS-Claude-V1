-- C-342: Formgebundene IE-Umrechnungen, nachvollziehbare Ableitungen und
-- Plan-Herkunft. Die Werte bleiben lesbar; die UI rechnet nicht selbst.

BEGIN;

-- C-344: Die Geltung einer Referenz ist maschinenlesbar. Das Feld war bis
-- jetzt nur im Kettenschritt 016 vorhanden und fehlte deshalb in der Live-DB.
ALTER TABLE nutrition.nutrient_reference_values
  ADD COLUMN IF NOT EXISTS applies_to_intake_sources text[] NOT NULL
    DEFAULT ARRAY['foods', 'fortified_foods', 'supplements', 'pharmacological'];

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'nutrition.nutrient_reference_values'::regclass
      AND conname = 'nutrient_reference_values_applies_to_intake_sources_check'
  ) THEN
    ALTER TABLE nutrition.nutrient_reference_values
      ADD CONSTRAINT nutrient_reference_values_applies_to_intake_sources_check
      CHECK (
        cardinality(applies_to_intake_sources) > 0
        AND applies_to_intake_sources <@ ARRAY['foods', 'fortified_foods', 'supplements', 'pharmacological']
      );
  END IF;
END $$;

-- Keine Zahl wird geaendert: nur ihre durch die jeweilige Quelle begrenzte
-- Aufnahmequelle. Damit werden Lebensmittelmengen nicht gegen Supplement-ULs
-- beurteilt.
UPDATE nutrition.nutrient_reference_values
SET applies_to_intake_sources = CASE nutrient_code
  WHEN 'MG' THEN ARRAY['supplements', 'pharmacological']
  WHEN 'NIA' THEN ARRAY['fortified_foods', 'supplements']
  WHEN 'FOLAC' THEN ARRAY['supplements']
  ELSE applies_to_intake_sources
END
WHERE reference_kind = 'UL'
  AND nutrient_code IN ('MG', 'NIA', 'FOLAC');

-- Die gepruefte Vorlage fuehrt abgeleitete Sportlerwerte. Ihre Quelle stuetzt
-- das Prinzip, nicht die Zielzahl; dieses Merkmal darf daher nicht nur im
-- Freitext stehen. Es wird fuer die vollstaendige 27er-Importliste genutzt.
ALTER TABLE nutrition.nutrient_reference_values
  ADD COLUMN IF NOT EXISTS is_derived boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS derivation_note text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'nutrition.nutrient_reference_values'::regclass
      AND conname = 'nutrient_reference_values_derived_note_check'
  ) THEN
    ALTER TABLE nutrition.nutrient_reference_values
      ADD CONSTRAINT nutrient_reference_values_derived_note_check
      CHECK (NOT is_derived OR NULLIF(btrim(derivation_note), '') IS NOT NULL);
  END IF;
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'nutrition.nutrient_reference_values'::regclass
      AND conname = 'nutrient_reference_values_ul_positive_check'
  ) THEN
    ALTER TABLE nutrition.nutrient_reference_values
      ADD CONSTRAINT nutrient_reference_values_ul_positive_check
      CHECK (
        reference_kind <> 'UL'
        OR (value_min IS NOT NULL AND value_min > 0 AND value_max IS NOT NULL AND value_max > 0)
      );
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS nutrition.nutrient_unit_conversion_factors (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nutrient_code  text NOT NULL REFERENCES nutrition.nutrient_defs(code) ON DELETE RESTRICT,
  form_code      text NOT NULL,
  form_label     text NOT NULL,
  from_unit      text NOT NULL,
  to_unit        text NOT NULL,
  factor         numeric(18,10) NOT NULL CHECK (factor > 0),
  source         text NOT NULL CHECK (length(btrim(source)) > 0),
  source_version text NOT NULL CHECK (length(btrim(source_version)) > 0),
  source_locator text NOT NULL CHECK (length(btrim(source_locator)) > 0),
  source_url     text NOT NULL CHECK (length(btrim(source_url)) > 0),
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT nutrient_unit_conversion_factors_scope_uq
    UNIQUE (nutrient_code, form_code, from_unit, to_unit)
);

COMMENT ON TABLE nutrition.nutrient_unit_conversion_factors IS
  'C-342: Offiziell belegte Umrechnungen je Naehrstoff und Form. Der Zielwert entsteht durch source_value * factor; es gibt absichtlich keinen pauschalen Vitamin-A-RAE-Faktor.';

CREATE INDEX IF NOT EXISTS nutrient_unit_conversion_factors_lookup_idx
  ON nutrition.nutrient_unit_conversion_factors (nutrient_code, from_unit, to_unit, form_code);

DROP TRIGGER IF EXISTS nutrient_unit_conversion_factors_touch_updated_at
  ON nutrition.nutrient_unit_conversion_factors;
CREATE TRIGGER nutrient_unit_conversion_factors_touch_updated_at
  BEFORE UPDATE ON nutrition.nutrient_unit_conversion_factors
  FOR EACH ROW EXECUTE FUNCTION nutrition.touch_updated_at();

ALTER TABLE nutrition.nutrient_unit_conversion_factors ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS nutrient_unit_conversion_factors_select
  ON nutrition.nutrient_unit_conversion_factors;
CREATE POLICY nutrient_unit_conversion_factors_select
  ON nutrition.nutrient_unit_conversion_factors
  FOR SELECT TO authenticated USING (true);
GRANT SELECT ON nutrition.nutrient_unit_conversion_factors TO authenticated;
GRANT ALL ON nutrition.nutrient_unit_conversion_factors TO service_role;

INSERT INTO nutrition.nutrient_unit_conversion_factors (
  nutrient_code, form_code, form_label, from_unit, to_unit, factor,
  source, source_version, source_locator, source_url
) VALUES
  ('VITA', 'retinol', 'Retinol', 'ug RAE', 'IU', 3.3333333333,
    'NIH Office of Dietary Supplements', 'Vitamin A Fact Sheet for Health Professionals, accessed 2026-08-30',
    'IU-to-RAE conversion: 1 IU retinol = 0.3 mcg RAE',
    'https://ods.od.nih.gov/factsheets/VitaminA-HealthProfessional/'),
  ('VITA', 'supplemental_beta_carotene', 'Beta-Carotin aus Supplementen', 'ug RAE', 'IU', 3.3333333333,
    'NIH Office of Dietary Supplements', 'Vitamin A Fact Sheet for Health Professionals, accessed 2026-08-30',
    'IU-to-RAE conversion: 1 IU supplemental beta-carotene = 0.3 mcg RAE',
    'https://ods.od.nih.gov/factsheets/VitaminA-HealthProfessional/'),
  ('VITA', 'dietary_beta_carotene', 'Beta-Carotin aus Lebensmitteln', 'ug RAE', 'IU', 20,
    'NIH Office of Dietary Supplements', 'Vitamin A Fact Sheet for Health Professionals, accessed 2026-08-30',
    'IU-to-RAE conversion: 1 IU dietary beta-carotene = 0.05 mcg RAE',
    'https://ods.od.nih.gov/factsheets/VitaminA-HealthProfessional/'),
  ('VITA', 'dietary_alpha_carotene', 'Alpha-Carotin aus Lebensmitteln', 'ug RAE', 'IU', 40,
    'NIH Office of Dietary Supplements', 'Vitamin A Fact Sheet for Health Professionals, accessed 2026-08-30',
    'IU-to-RAE conversion: 1 IU dietary alpha-carotene = 0.025 mcg RAE',
    'https://ods.od.nih.gov/factsheets/VitaminA-HealthProfessional/'),
  ('VITA', 'dietary_beta_cryptoxanthin', 'Beta-Cryptoxanthin aus Lebensmitteln', 'ug RAE', 'IU', 40,
    'NIH Office of Dietary Supplements', 'Vitamin A Fact Sheet for Health Professionals, accessed 2026-08-30',
    'IU-to-RAE conversion: 1 IU dietary beta-cryptoxanthin = 0.025 mcg RAE',
    'https://ods.od.nih.gov/factsheets/VitaminA-HealthProfessional/'),
  ('VITD', 'vitamin_d2', 'Vitamin D2 (Ergocalciferol)', 'ug', 'IU', 40,
    'NIH Office of Dietary Supplements', 'Vitamin D Fact Sheet for Health Professionals, accessed 2026-08-30',
    'Recommended intake table: 15 mcg equals 600 IU',
    'https://ods.od.nih.gov/factsheets/VitaminD-HealthProfessional/'),
  ('VITD', 'vitamin_d3', 'Vitamin D3 (Cholecalciferol)', 'ug', 'IU', 40,
    'NIH Office of Dietary Supplements', 'Vitamin D Fact Sheet for Health Professionals, accessed 2026-08-30',
    'Recommended intake table: 15 mcg equals 600 IU',
    'https://ods.od.nih.gov/factsheets/VitaminD-HealthProfessional/')
ON CONFLICT (nutrient_code, form_code, from_unit, to_unit) DO UPDATE SET
  form_label = EXCLUDED.form_label,
  factor = EXCLUDED.factor,
  source = EXCLUDED.source,
  source_version = EXCLUDED.source_version,
  source_locator = EXCLUDED.source_locator,
  source_url = EXCLUDED.source_url,
  updated_at = now();

-- C-342/G-269: Herkunft des Plans ist nicht die Messherkunft. Bestehende
-- Seed- und Altplaene bleiben NULL, weil ihr Produktursprung nicht belegt ist.
ALTER TABLE nutrition.meal_plans
  ADD COLUMN IF NOT EXISTS plan_origin text;
ALTER TABLE nutrition.meal_plans
  ALTER COLUMN plan_origin SET DEFAULT 'self_created';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'nutrition.meal_plans'::regclass
      AND conname = 'meal_plans_plan_origin_check'
  ) THEN
    ALTER TABLE nutrition.meal_plans
      ADD CONSTRAINT meal_plans_plan_origin_check
      CHECK (plan_origin IS NULL OR plan_origin IN ('self_created', 'coach_created', 'marketplace'));
  END IF;
END $$;

COMMENT ON COLUMN nutrition.meal_plans.plan_origin IS
  'C-342: Produktursprung eines Meal Plans: self_created, coach_created oder marketplace. NULL bedeutet bei Bestandsplaenen unbekannt und wird nicht geraten.';

-- E-29: Nutrition liest die Coach-Tabellen nicht direkt. Direkte
-- Bearbeitung durch den angemeldeten Coach erfordert volle Sicht, dessen
-- ausdrueckliches Auto-Apply und Stufe 5; der Vorgaenger ordnet
-- program_modification erst Stufe 5 zu. Niedrigere Stufen bleiben beim
-- bestaetigten Pending-Action-Weg.
CREATE OR REPLACE FUNCTION coach.darf_nutrition_plan_aendern(p_client uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $rights$
  SELECT EXISTS (
    SELECT 1
    FROM coach.client_permissions p
    JOIN coach.client_autonomy a
      ON a.coach_id = p.coach_id
     AND a.client_id = p.client_id
    WHERE p.coach_id = (SELECT auth.uid())
      AND p.client_id = p_client
      AND p.nutrition_visibility = 'full'
      AND p.nutrition_auto_apply
      AND a.nutrition_level >= 5
      AND (p.expires_at IS NULL OR p.expires_at > now())
  );
$rights$;

COMMENT ON FUNCTION coach.darf_nutrition_plan_aendern(uuid) IS
  'C-342/E-29: Einzige Coach-Naht fuer direkte Nutrition-Planbearbeitung. Wahr nur bei voller Sicht, nutrition_auto_apply und nutrition_level >= 5; alle anderen Faelle gehen ueber bestaetigte Pending Actions.';

GRANT EXECUTE ON FUNCTION coach.darf_nutrition_plan_aendern(uuid)
  TO authenticated, service_role;

COMMIT;
