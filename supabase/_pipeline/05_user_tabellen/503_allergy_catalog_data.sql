BEGIN;

-- SPEC_06_DATABASE_SCHEMA.md belegt die Nahrungserkennung fuer
-- tofu|soja|tempeh. Der heutige Tagkatalog verwendet contains_* statt
-- des dort beschriebenen allergen_soy; keine freie Namensheuristik.
INSERT INTO nutrition.tag_definitions (
  code, name_de, name_en, tag_type, is_exclusion_relevant,
  icon, sort_order, requires_macro_check, macro_rule, filter_group
) VALUES (
  'contains_soy', 'Enthaelt Soja', 'Contains soy', 'allergen', true,
  '', 115, false, NULL, 'allergen'
)
ON CONFLICT (code) DO UPDATE SET
  name_de = EXCLUDED.name_de,
  name_en = EXCLUDED.name_en,
  tag_type = EXCLUDED.tag_type,
  is_exclusion_relevant = EXCLUDED.is_exclusion_relevant,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  requires_macro_check = EXCLUDED.requires_macro_check,
  macro_rule = EXCLUDED.macro_rule,
  filter_group = EXCLUDED.filter_group;

INSERT INTO nutrition.food_tags (food_id, tag_code, confidence)
SELECT f.id, 'contains_soy', 1.0
FROM nutrition.foods f
WHERE nutrition.search_fold(f.name_de) ~ '(soja|tofu|tempeh)'
ON CONFLICT DO NOTHING;

-- C-498 schrieb vor der Katalogbindung nur lokale Kurzcodes.
UPDATE public.allergen_aliases
SET stoff_code = 'supplements:magnesium_stearate'
WHERE stoff_code = 'magnesium_stearate';

-- Milchzucker (Laktose) ist ein direkter BLS-Name (S116000), kein geratenes
-- Zutaten-Synonym. Die Aliaszeile dient ausschliesslich der Vorschlagssuche.
INSERT INTO public.allergen_aliases (stoff_code, alias_text, source_id, evidence_class) VALUES
  ('nutrition:contains_lactose', 'Laktose', 'nutrition:tag_definitions:contains_lactose', 'A'),
  ('nutrition:contains_lactose', 'Milchzucker', 'bls:S116000', 'A'),
  ('nutrition:contains_lactose', 'Milchzucker (Laktose)', 'bls:S116000', 'A')
ON CONFLICT (stoff_code, alias_text) DO UPDATE SET
  source_id = EXCLUDED.source_id,
  evidence_class = EXCLUDED.evidence_class;

-- Expliziter Auftrag: nur dev@lumeos.app wird aus den drei vorhandenen,
-- semantisch bekannten C-498-Kurzcodes auf die echten Katalog-IDs gehoben.
UPDATE public.user_allergies ua
SET stoff_code = CASE ua.stoff_code
  WHEN 'lactose' THEN 'nutrition:contains_lactose'
  WHEN 'soja' THEN 'nutrition:contains_soy'
  WHEN 'magnesium_stearate' THEN 'supplements:magnesium_stearate'
  ELSE ua.stoff_code
END
FROM auth.users u
WHERE u.id = ua.user_id
  AND u.email = 'dev@lumeos.app'
  AND ua.stoff_code IN ('lactose', 'soja', 'magnesium_stearate');

DO $$
DECLARE
  v_soy integer;
BEGIN
  SELECT count(*) INTO v_soy FROM nutrition.food_tags WHERE tag_code = 'contains_soy';
  IF v_soy = 0 THEN RAISE EXCEPTION 'C-503: contains_soy hat keine getaggten Foods'; END IF;
END;
$$;

COMMIT;
