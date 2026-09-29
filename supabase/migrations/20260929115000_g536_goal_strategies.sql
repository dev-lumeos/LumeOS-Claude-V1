-- G-536: der ausgelieferte Strategiekatalog ist eine eigene, nur lesbare
-- Schicht. Nutzerphasen verweisen auf eine Strategie und behalten ihr
-- parameters-Objekt als persoenliche Override-Ebene.

BEGIN;

CREATE TABLE goals.goal_strategies (
  code text PRIMARY KEY,
  label text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL,
  category text NOT NULL,
  tier text NOT NULL,

  tdee_modifier numeric(5,3),
  weight_change_target_percent numeric(5,3),
  max_duration_weeks smallint,
  protein_per_kg numeric(4,2),
  fat_percent numeric(4,3),

  macro_cycling boolean NOT NULL DEFAULT false,
  refeed_schedule boolean NOT NULL DEFAULT false,
  auto_adjust boolean NOT NULL DEFAULT false,
  peak_week boolean NOT NULL DEFAULT false,
  badge text,
  warnings text[] NOT NULL DEFAULT '{}'::text[],
  requirements jsonb NOT NULL DEFAULT '{}'::jsonb,

  guards text[] NOT NULL DEFAULT '{}'::text[],
  next_codes text[] NOT NULL DEFAULT '{}'::text[],
  exits text[] NOT NULL DEFAULT '{}'::text[],
  success text[] NOT NULL DEFAULT '{}'::text[],
  best_for text[] NOT NULL DEFAULT '{}'::text[],
  purpose text[] NOT NULL DEFAULT '{}'::text[],
  editor_modes text[] NOT NULL DEFAULT ARRAY['params']::text[],

  sub_phases jsonb NOT NULL DEFAULT '[]'::jsonb,
  annual jsonb NOT NULL DEFAULT '[]'::jsonb,
  refeeds jsonb,
  peak_week_details jsonb,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT goal_strategies_code_format
    CHECK (code ~ '^[a-z][a-z0-9_]*$'),
  CONSTRAINT goal_strategies_category_check
    CHECK (category IN ('fat_loss', 'muscle_gain', 'hybrid', 'contest_prep', 'recovery', 'expert')),
  CONSTRAINT goal_strategies_tier_check
    CHECK (tier IN ('simple', 'advanced')),
  CONSTRAINT goal_strategies_tdee_modifier_check
    CHECK (tdee_modifier IS NULL OR tdee_modifier BETWEEN -0.40 AND 0.25),
  CONSTRAINT goal_strategies_weight_change_check
    CHECK (
      weight_change_target_percent IS NULL
      OR weight_change_target_percent BETWEEN -2.5 AND 1.5
    ),
  CONSTRAINT goal_strategies_duration_check
    CHECK (max_duration_weeks IS NULL OR max_duration_weeks >= 1),
  CONSTRAINT goal_strategies_protein_check
    CHECK (protein_per_kg IS NULL OR protein_per_kg BETWEEN 1.2 AND 3.5),
  CONSTRAINT goal_strategies_fat_check
    CHECK (fat_percent IS NULL OR fat_percent BETWEEN 0.15 AND 0.40),
  CONSTRAINT goal_strategies_requirements_object
    CHECK (jsonb_typeof(requirements) = 'object'),
  CONSTRAINT goal_strategies_sub_phases_array
    CHECK (jsonb_typeof(sub_phases) = 'array'),
  CONSTRAINT goal_strategies_annual_array
    CHECK (jsonb_typeof(annual) = 'array'),
  CONSTRAINT goal_strategies_refeeds_object
    CHECK (refeeds IS NULL OR jsonb_typeof(refeeds) = 'object'),
  CONSTRAINT goal_strategies_peak_week_details_object
    CHECK (peak_week_details IS NULL OR jsonb_typeof(peak_week_details) = 'object'),
  CONSTRAINT goal_strategies_editor_modes_check
    CHECK (
      editor_modes <@ ARRAY[
        'variants', 'params', 'guards', 'duration', 'subphases',
        'refeeds', 'peakweek', 'anchor', 'annual', 'overrides',
        'cycling', 'exits'
      ]::text[]
    )
);

COMMENT ON TABLE goals.goal_strategies IS
  'G-536: ausgelieferte Goal-Strategien. Der Katalog bleibt unveraendert; goals.goal_phases.parameters traegt persoenliche Overrides.';
COMMENT ON COLUMN goals.goal_strategies.weight_change_target_percent IS
  'Vorgabe in Prozent Koerpergewicht je Woche; goal_phases.zielrate_pct_kg_woche kann sie je Nutzerphase ueberschreiben.';
COMMENT ON COLUMN goals.goal_strategies.editor_modes IS
  'Editor-Reiter aus module-goals-editor.jsx PE_MODES; params ist dessen ausdruecklicher Rueckfall.';
COMMENT ON COLUMN goals.goal_strategies.sub_phases IS
  'Datensaetze der Unterphasen, nicht eine Liste von Beschriftungen.';
COMMENT ON COLUMN goals.goal_strategies.annual IS
  'Datensaetze des Jahreszyklus, nicht eine Liste von Beschriftungen.';

DROP TRIGGER IF EXISTS goal_strategies_touch_updated_at
  ON goals.goal_strategies;
CREATE TRIGGER goal_strategies_touch_updated_at
  BEFORE UPDATE ON goals.goal_strategies
  FOR EACH ROW EXECUTE FUNCTION goals.touch_updated_at();

ALTER TABLE goals.goal_strategies ENABLE ROW LEVEL SECURITY;

CREATE POLICY goal_strategies_select
  ON goals.goal_strategies
  FOR SELECT TO authenticated
  USING (true);

REVOKE ALL ON TABLE goals.goal_strategies
  FROM PUBLIC, anon, authenticated, service_role;
GRANT SELECT ON TABLE goals.goal_strategies TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE goals.goal_strategies TO service_role;

ALTER TABLE goals.goal_phases
  ADD COLUMN strategie_code text;

ALTER TABLE goals.goal_phases
  ADD CONSTRAINT goal_phases_strategie_code_fkey
  FOREIGN KEY (strategie_code)
  REFERENCES goals.goal_strategies(code)
  ON UPDATE RESTRICT
  ON DELETE RESTRICT;

CREATE INDEX goal_phases_strategie_code_idx
  ON goals.goal_phases (strategie_code)
  WHERE strategie_code IS NOT NULL;

COMMENT ON COLUMN goals.goal_phases.strategie_code IS
  'G-536: ausgelieferte Strategie dieser Nutzerphase; parameters enthaelt ausschliesslich persoenliche Overrides und Metadaten.';

-- Die Rate hat jetzt einen Katalog-Default. Eine Instanzrate ist deshalb fuer
-- fat_loss, mini_cut und lean_bulk nicht mehr zwingend, ihr Vorzeichen bleibt
-- aber geprueft, sobald der Nutzer sie ueberschreibt.
ALTER TABLE goals.goal_phases
  DROP CONSTRAINT goal_phases_zielrate_passt_zur_art;
ALTER TABLE goals.goal_phases
  ADD CONSTRAINT goal_phases_zielrate_passt_zur_art
  CHECK (
    (phase_type IN ('fat_loss', 'mini_cut')
      AND (zielrate_pct_kg_woche IS NULL OR zielrate_pct_kg_woche < 0))
    OR (phase_type = 'lean_bulk'
      AND (zielrate_pct_kg_woche IS NULL OR zielrate_pct_kg_woche > 0))
    OR (phase_type = 'maintenance'
      AND (zielrate_pct_kg_woche IS NULL OR abs(zielrate_pct_kg_woche) <= 0.1))
    OR (phase_type IN (
      'peak_week', 'expert_bb_annual', 'contest_prep', 'reverse_diet', 'recomp'
    ) AND zielrate_pct_kg_woche IS NULL)
  );

-- Nicht jede Strategie hat eine Gewichtsrate (z. B. maintain, recomp,
-- reverse_diet). Die erklaerende Phasenreferenz bleibt Pflicht; die Rate ist
-- nur dann ein Snapshot, wenn Katalog oder Nutzerphase eine Rate fuehren.
ALTER TABLE goals.nutrition_targets
  DROP CONSTRAINT nutrition_targets_formula_inputs_required;
ALTER TABLE goals.nutrition_targets
  ADD CONSTRAINT nutrition_targets_formula_inputs_required
  CHECK (
    herkunft <> 'formel'
    OR (
      body_weight_kg IS NOT NULL
      AND tdee_herkunft IS NOT NULL
      AND (
        (tdee_herkunft = 'formula' AND tdee_history_id IS NULL)
        OR (tdee_herkunft = 'adaptive' AND tdee_history_id IS NOT NULL)
      )
    )
  ) NOT VALID;

COMMIT;
