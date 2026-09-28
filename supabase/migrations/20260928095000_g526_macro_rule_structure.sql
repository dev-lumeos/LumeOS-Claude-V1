-- G-526: Struktur fuer belegte Makroregeln, noch ohne fachliche Baender.
--
-- Die heutige Rechnung (Protein 2 g/kg Koerpergewicht, Fett 25 E%,
-- Faser 30 g/Tag) bleibt unveraendert. Insbesondere wird keine der in
-- G-521 nur als [wahrscheinlich] bewerteten Proteinspannen eingetragen.

BEGIN;

CREATE TABLE goals.nutrition_macro_rules (
  code text PRIMARY KEY,
  nutrient text NOT NULL,
  rule_kind text NOT NULL,
  basis text NOT NULL,
  unit text NOT NULL,

  -- NULL bedeutet: Regel gilt unabhaengig von diesem Merkmal.
  -- Die neun Phasen bleiben getrennte Werte; diese Struktur faltet sie nicht.
  phase_type text,
  experience_level text,

  lower_value numeric(8,3),
  upper_value numeric(8,3),

  -- open: fachliche Form bekannt, Wert noch unbelegt.
  -- assumption: Produktannahme, ausdruecklich kein Quellenwert.
  -- sourced: Wert mit konkreter Quelle und Fundstelle.
  evidence_status text NOT NULL,
  source_id text,
  source_locator text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT nutrition_macro_rules_code_format
    CHECK (code = lower(code) AND code ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  CONSTRAINT nutrition_macro_rules_nutrient
    CHECK (nutrient IN ('protein', 'fat', 'carbohydrate', 'fiber')),
  CONSTRAINT nutrition_macro_rules_kind
    CHECK (rule_kind IN ('target_range', 'hard_minimum', 'fixed_target')),
  CONSTRAINT nutrition_macro_rules_basis
    CHECK (basis IN ('lean_mass_kg', 'body_weight_kg', 'kcal', 'per_day')),
  CONSTRAINT nutrition_macro_rules_unit
    CHECK (unit IN ('g_per_kg', 'percent_kcal', 'g_per_day')),
  CONSTRAINT nutrition_macro_rules_basis_unit
    CHECK (
      (basis IN ('lean_mass_kg', 'body_weight_kg') AND unit = 'g_per_kg')
      OR (basis = 'kcal' AND unit = 'percent_kcal')
      OR (basis = 'per_day' AND unit = 'g_per_day')
    ),
  CONSTRAINT nutrition_macro_rules_phase_type
    CHECK (
      phase_type IS NULL
      OR phase_type IN (
        'fat_loss', 'lean_bulk', 'maintenance', 'recomp',
        'contest_prep', 'reverse_diet', 'expert_bb_annual',
        'mini_cut', 'peak_week'
      )
    ),
  CONSTRAINT nutrition_macro_rules_experience_level
    CHECK (
      experience_level IS NULL
      OR experience_level IN ('beginner', 'advanced', 'pro', 'elite')
    ),
  CONSTRAINT nutrition_macro_rules_evidence_status
    CHECK (evidence_status IN ('open', 'assumption', 'sourced')),
  CONSTRAINT nutrition_macro_rules_nonnegative
    CHECK (
      (lower_value IS NULL OR lower_value >= 0)
      AND (upper_value IS NULL OR upper_value >= 0)
    ),
  CONSTRAINT nutrition_macro_rules_open_has_no_values
    CHECK (
      evidence_status <> 'open'
      OR (lower_value IS NULL AND upper_value IS NULL)
    ),
  CONSTRAINT nutrition_macro_rules_value_shape
    CHECK (
      evidence_status = 'open'
      OR (rule_kind = 'target_range'
          AND lower_value IS NOT NULL
          AND upper_value IS NOT NULL
          AND lower_value <= upper_value)
      OR (rule_kind = 'hard_minimum'
          AND lower_value IS NOT NULL
          AND upper_value IS NULL)
      OR (rule_kind = 'fixed_target'
          AND lower_value IS NOT NULL
          AND upper_value = lower_value)
    ),
  CONSTRAINT nutrition_macro_rules_source_pair
    CHECK (num_nonnulls(source_id, source_locator) IN (0, 2)),
  CONSTRAINT nutrition_macro_rules_source_complete
    CHECK (
      evidence_status <> 'sourced'
      OR (
        NULLIF(btrim(source_id), '') IS NOT NULL
        AND NULLIF(btrim(source_locator), '') IS NOT NULL
      )
    )
);

COMMENT ON TABLE goals.nutrition_macro_rules IS
  'G-526: leere Regelstruktur fuer globale oder phasen-/erfahrungsabhaengige Makrobaender, harte Untergrenzen und Festwerte. Werte werden erst nach Beleg oder als ausdrueckliche Annahme eingetragen.';
COMMENT ON COLUMN goals.nutrition_macro_rules.phase_type IS
  'Optionaler Geltungsbereich ueber einen der neun unveraenderten Phasentypen; NULL gilt phasenunabhaengig.';
COMMENT ON COLUMN goals.nutrition_macro_rules.experience_level IS
  'Optionaler Geltungsbereich ueber den seit C-541 verpflichtenden Erfahrungsgrad; NULL gilt gradunabhaengig.';
COMMENT ON COLUMN goals.nutrition_macro_rules.basis IS
  'Bezugsmenge. Protein kann lean_mass_kg statt body_weight_kg verwenden; die Wahl eines Rueckfalls bei fehlendem Koerperfett ist nicht Teil dieser Tabelle.';
COMMENT ON COLUMN goals.nutrition_macro_rules.evidence_status IS
  'open ohne Zahl, assumption als sichtbar unbelegte Produktannahme oder sourced mit konkreter Quelle und Fundstelle.';

DROP TRIGGER IF EXISTS nutrition_macro_rules_touch_updated_at
  ON goals.nutrition_macro_rules;
CREATE TRIGGER nutrition_macro_rules_touch_updated_at
  BEFORE UPDATE ON goals.nutrition_macro_rules
  FOR EACH ROW EXECUTE FUNCTION goals.touch_updated_at();

COMMENT ON FUNCTION goals.berechne_zielwerte(UUID, DATE) IS
  'G-526 Zwischenstand: Protein 2 g/kg Koerpergewicht, Fett 25 E% und Faser 30 g/Tag bleiben technisch unveraendert. Faser 30 g/Tag ist [annahme] aus dem Projekt-Spec-Default, kein fachlich belegter Phasenparameter; Protein und Fett werden erst nach G-521 A1 und der Rate-/TDEE-Kette umgestellt.';

ALTER TABLE goals.nutrition_macro_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY nutrition_macro_rules_select
  ON goals.nutrition_macro_rules
  FOR SELECT
  TO authenticated
  USING (true);

GRANT USAGE ON SCHEMA goals TO authenticated, service_role;
REVOKE ALL ON TABLE goals.nutrition_macro_rules
  FROM PUBLIC, anon, authenticated, service_role;
GRANT SELECT ON TABLE goals.nutrition_macro_rules
  TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE goals.nutrition_macro_rules
  TO service_role;

COMMIT;
