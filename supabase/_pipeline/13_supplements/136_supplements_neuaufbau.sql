-- =============================================================
-- 136 -- Supplements-Neuaufbau: leere Zieltabellen (C-232)
-- Datum: 2026-08-23
-- Zweck: Neue Supplements-Zielstruktur neben den bestehenden Tabellen
--        anlegen. Keine Daten, kein Umhaengen, kein Loeschen.
-- Idempotent: CREATE IF NOT EXISTS, Policies per DROP + CREATE.
--
-- Ausgelassene Teile, bewusst nicht in C-232 gebaut:
--
-- TODO(C-233): Alterspruefung in user_supplement_settings ausgelassen.
-- Quelle: docs/specs/Supplements/SCHEMA_NEUAUFBAU.md, Abschnitt 9.
-- Grund: enhanced_mode, enhanced_accepted_at und enhanced_age_verified
-- werden nicht angelegt. Tom hat die Alters-/Tier-Entscheidung am
-- 2026-08-23 vertagt; reminder_times und low_stock_days bleiben, weil
-- sie nicht an eine Tarifentscheidung gebunden sind.
--
-- TODO(C-234): marketplace_product_id in user_supplement_cycles.
-- Quelle: docs/specs/Supplements/SCHEMA_NEUAUFBAU.md, Abschnitt 9.
-- Grund: Der Vorgaenger hatte eine Marketplace-Anbindung, dieses Repo
-- nicht. Der Verweis wird erst gebaut, wenn das Zielobjekt feststeht.
--
-- TODO(SCHEMA_NEUAUFBAU/enhanced_substances): nicht angelegt.
-- Quelle: docs/specs/Supplements/SCHEMA_NEUAUFBAU.md, Abschnitt 7.
-- Grund: enhanced_substances waere eine zweite Substanztabelle. Enhanced
-- ist hier ein Wert in supplement_groups; die Felder wandern spaeter in
-- die getrennten Informationsarten.
--
-- TODO(SCHEMA_NEUAUFBAU/supplement_knowledge): nicht angelegt.
-- Quelle: docs/specs/Supplements/SCHEMA_NEUAUFBAU.md, Abschnitt 7.
-- Grund: supplement_knowledge mischt description, usage_hint, safety_note
-- und goal_tags. Diese Informationen liegen im Zielschema getrennt in
-- supplements, supplement_dosing, supplement_safety und supplement_tags.
-- =============================================================

BEGIN;

CREATE SCHEMA IF NOT EXISTS supplements;

CREATE OR REPLACE FUNCTION supplements.touch_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TABLE IF NOT EXISTS supplements.supplement_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE CHECK (btrim(code) <> ''),
  label_de TEXT,
  label_en TEXT,
  label_th TEXT,
  min_experience_level TEXT CHECK (min_experience_level IS NULL OR min_experience_level IN ('beginner','advanced','pro','elite')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS supplements.supplement_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE CHECK (btrim(slug) <> ''),
  group_id UUID REFERENCES supplements.supplement_groups(id) ON DELETE RESTRICT,
  name_de TEXT,
  name_en TEXT,
  name_th TEXT,
  color_token TEXT,
  icon TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS supplements.supplement_tag_definitions (
  code TEXT PRIMARY KEY CHECK (btrim(code) <> ''),
  name_de TEXT,
  name_en TEXT,
  name_th TEXT,
  tag_type TEXT NOT NULL CHECK (btrim(tag_type) <> ''),
  is_exclusion_relevant BOOLEAN NOT NULL DEFAULT false,
  icon TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS supplements.supplements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE CHECK (btrim(slug) <> ''),
  group_id UUID REFERENCES supplements.supplement_groups(id) ON DELETE RESTRICT,
  category_id UUID REFERENCES supplements.supplement_categories(id) ON DELETE SET NULL,
  name_de TEXT,
  name_en TEXT,
  name_th TEXT,
  description_de TEXT,
  description_en TEXT,
  description_th TEXT,
  form TEXT,
  evidence_grade TEXT CHECK (evidence_grade IS NULL OR evidence_grade IN ('S','A','B','C','D','F')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  source TEXT NOT NULL DEFAULT 'neuaufbau_schema',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS supplements.supplement_aliases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplement_id UUID NOT NULL REFERENCES supplements.supplements(id) ON DELETE CASCADE,
  alias TEXT NOT NULL CHECK (btrim(alias) <> ''),
  locale TEXT,
  source TEXT NOT NULL CHECK (btrim(source) <> ''),
  confidence NUMERIC CHECK (confidence IS NULL OR (confidence >= 0 AND confidence <= 1)),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (supplement_id, alias, source)
);

CREATE TABLE IF NOT EXISTS supplements.supplement_tags (
  supplement_id UUID NOT NULL REFERENCES supplements.supplements(id) ON DELETE CASCADE,
  tag_code TEXT NOT NULL REFERENCES supplements.supplement_tag_definitions(code) ON DELETE RESTRICT,
  confidence NUMERIC CHECK (confidence IS NULL OR (confidence >= 0 AND confidence <= 1)),
  source TEXT NOT NULL DEFAULT 'neuaufbau_schema',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (supplement_id, tag_code)
);

CREATE TABLE IF NOT EXISTS supplements.supplement_portions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplement_id UUID NOT NULL REFERENCES supplements.supplements(id) ON DELETE CASCADE,
  name_de TEXT,
  name_en TEXT,
  name_th TEXT,
  amount NUMERIC(12,4) CHECK (amount IS NULL OR amount > 0),
  unit TEXT,
  is_default BOOLEAN NOT NULL DEFAULT false,
  source TEXT NOT NULL DEFAULT 'neuaufbau_schema',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS supplements.supplement_dosing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplement_id UUID NOT NULL REFERENCES supplements.supplements(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'unbekannt' CHECK (status IN ('bekannt','unbekannt','nicht_zutreffend')),
  official_label_dose JSONB,
  guideline_dose JSONB,
  studied_dose_ranges JSONB,
  anecdotal_dose_ranges JSONB,
  upper_limit JSONB,
  dose_unit TEXT,
  usage_hint_de TEXT,
  usage_hint_en TEXT,
  usage_hint_th TEXT,
  source TEXT NOT NULL DEFAULT 'neuaufbau_schema',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (official_label_dose IS NULL OR jsonb_typeof(official_label_dose) IN ('object','array','string','number')),
  CHECK (guideline_dose IS NULL OR jsonb_typeof(guideline_dose) IN ('object','array','string','number')),
  CHECK (studied_dose_ranges IS NULL OR jsonb_typeof(studied_dose_ranges) IN ('object','array')),
  CHECK (anecdotal_dose_ranges IS NULL OR jsonb_typeof(anecdotal_dose_ranges) IN ('object','array')),
  CHECK (upper_limit IS NULL OR jsonb_typeof(upper_limit) IN ('object','array','string','number'))
);

CREATE TABLE IF NOT EXISTS supplements.supplement_pharmacology (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplement_id UUID NOT NULL REFERENCES supplements.supplements(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'unbekannt' CHECK (status IN ('bekannt','unbekannt','nicht_zutreffend')),
  route TEXT,
  half_life JSONB,
  metabolism_de TEXT,
  metabolism_en TEXT,
  metabolism_th TEXT,
  bioavailability JSONB,
  time_to_peak JSONB,
  duration_of_action JSONB,
  elimination_de TEXT,
  elimination_en TEXT,
  elimination_th TEXT,
  source TEXT NOT NULL DEFAULT 'neuaufbau_schema',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS supplements.supplement_safety (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplement_id UUID NOT NULL REFERENCES supplements.supplements(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'unbekannt' CHECK (status IN ('bekannt','unbekannt','nicht_zutreffend')),
  pregnancy_status TEXT,
  pregnancy_note_de TEXT,
  pregnancy_note_en TEXT,
  pregnancy_note_th TEXT,
  lactation_status TEXT,
  common_side_effects_de TEXT[],
  common_side_effects_en TEXT[],
  common_side_effects_th TEXT[],
  serious_side_effects_de TEXT[],
  serious_side_effects_en TEXT[],
  serious_side_effects_th TEXT[],
  contraindications_de TEXT[],
  contraindications_en TEXT[],
  contraindications_th TEXT[],
  source TEXT NOT NULL DEFAULT 'neuaufbau_schema',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS supplements.supplement_quality (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplement_id UUID NOT NULL REFERENCES supplements.supplements(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'unbekannt' CHECK (status IN ('bekannt','unbekannt','nicht_zutreffend')),
  counterfeit_risk TEXT,
  contamination_risk TEXT,
  purity_considerations_de TEXT,
  purity_considerations_en TEXT,
  purity_considerations_th TEXT,
  storage_de TEXT,
  storage_en TEXT,
  storage_th TEXT,
  light_sensitive BOOLEAN,
  temperature_sensitive BOOLEAN,
  stability_de TEXT,
  stability_en TEXT,
  stability_th TEXT,
  source TEXT NOT NULL DEFAULT 'neuaufbau_schema',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS supplements.supplement_warnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplement_id UUID NOT NULL REFERENCES supplements.supplements(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'unbekannt' CHECK (status IN ('bekannt','unbekannt','nicht_zutreffend')),
  dose_ceiling JSONB,
  doctor_consult_flags TEXT[],
  no_ceiling_reason_de TEXT,
  no_ceiling_reason_en TEXT,
  no_ceiling_reason_th TEXT,
  warning_de TEXT,
  warning_en TEXT,
  warning_th TEXT,
  source TEXT NOT NULL DEFAULT 'neuaufbau_schema',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS supplements.supplement_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplement_id UUID NOT NULL REFERENCES supplements.supplements(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'unbekannt' CHECK (status IN ('bekannt','unbekannt','nicht_zutreffend')),
  overall_grade TEXT CHECK (overall_grade IS NULL OR overall_grade IN ('S','A','B','C','D','F')),
  summary_de TEXT,
  summary_en TEXT,
  summary_th TEXT,
  human_trials INTEGER CHECK (human_trials IS NULL OR human_trials >= 0),
  randomized_trials INTEGER CHECK (randomized_trials IS NULL OR randomized_trials >= 0),
  meta_analyses INTEGER CHECK (meta_analyses IS NULL OR meta_analyses >= 0),
  animal_only BOOLEAN,
  in_vitro_only BOOLEAN,
  source TEXT NOT NULL DEFAULT 'neuaufbau_schema',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS supplements.supplement_wada (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplement_id UUID NOT NULL REFERENCES supplements.supplements(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'unbekannt' CHECK (status IN ('bekannt','unbekannt','nicht_zutreffend')),
  wada_status TEXT,
  wada_category TEXT,
  detection_time_days NUMERIC(10,2) CHECK (detection_time_days IS NULL OR detection_time_days >= 0),
  note_de TEXT,
  note_en TEXT,
  note_th TEXT,
  source TEXT NOT NULL DEFAULT 'neuaufbau_schema',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS supplements.supplement_protocol_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplement_id UUID NOT NULL REFERENCES supplements.supplements(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'unbekannt' CHECK (status IN ('bekannt','unbekannt','nicht_zutreffend')),
  requires_pct BOOLEAN,
  requires_ai BOOLEAN,
  requires_serm BOOLEAN,
  aromatization TEXT,
  note_de TEXT,
  note_en TEXT,
  note_th TEXT,
  source TEXT NOT NULL DEFAULT 'neuaufbau_schema',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS supplements.supplement_aas_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplement_id UUID NOT NULL REFERENCES supplements.supplements(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'unbekannt' CHECK (status IN ('bekannt','unbekannt','nicht_zutreffend')),
  androgenic_rating NUMERIC(10,2),
  anabolic_rating NUMERIC(10,2),
  note_de TEXT,
  note_en TEXT,
  note_th TEXT,
  source TEXT NOT NULL DEFAULT 'neuaufbau_schema',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS supplements.supplement_organ_risks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplement_id UUID NOT NULL REFERENCES supplements.supplements(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'unbekannt' CHECK (status IN ('bekannt','unbekannt','nicht_zutreffend')),
  organ TEXT NOT NULL CHECK (btrim(organ) <> ''),
  risk_level TEXT,
  mechanism_de TEXT,
  mechanism_en TEXT,
  mechanism_th TEXT,
  note_de TEXT,
  note_en TEXT,
  note_th TEXT,
  source TEXT NOT NULL DEFAULT 'neuaufbau_schema',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS supplements.supplement_regulatory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplement_id UUID NOT NULL REFERENCES supplements.supplements(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'unbekannt' CHECK (status IN ('bekannt','unbekannt','nicht_zutreffend')),
  jurisdiction TEXT NOT NULL CHECK (btrim(jurisdiction) <> ''),
  legal_status TEXT,
  prescription_required BOOLEAN,
  approved_drug BOOLEAN,
  approved_supplement_ingredient BOOLEAN,
  note_de TEXT,
  note_en TEXT,
  note_th TEXT,
  source TEXT NOT NULL DEFAULT 'neuaufbau_schema',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS supplements.supplement_identifiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplement_id UUID NOT NULL REFERENCES supplements.supplements(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'unbekannt' CHECK (status IN ('bekannt','unbekannt','nicht_zutreffend')),
  identifier_type TEXT NOT NULL CHECK (btrim(identifier_type) <> ''),
  identifier_value TEXT NOT NULL CHECK (btrim(identifier_value) <> ''),
  evidence_provenance JSONB,
  source TEXT NOT NULL DEFAULT 'neuaufbau_schema',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS supplements.supplement_lab_effects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplement_id UUID NOT NULL REFERENCES supplements.supplements(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'unbekannt' CHECK (status IN ('bekannt','unbekannt','nicht_zutreffend')),
  lab_marker_id TEXT,
  loinc_code TEXT,
  effect_type TEXT,
  analyte_de TEXT,
  analyte_en TEXT,
  analyte_th TEXT,
  direction TEXT,
  mechanism_de TEXT,
  mechanism_en TEXT,
  mechanism_th TEXT,
  clinical_consequence_de TEXT,
  clinical_consequence_en TEXT,
  clinical_consequence_th TEXT,
  evidence TEXT,
  monitoring_link TEXT,
  source TEXT NOT NULL DEFAULT 'neuaufbau_schema',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS supplements.supplement_monitoring (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplement_id UUID NOT NULL REFERENCES supplements.supplements(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'unbekannt' CHECK (status IN ('bekannt','unbekannt','nicht_zutreffend')),
  lab_marker_id TEXT,
  loinc_code TEXT,
  frequency_de TEXT,
  frequency_en TEXT,
  frequency_th TEXT,
  rationale_de TEXT,
  rationale_en TEXT,
  rationale_th TEXT,
  source TEXT NOT NULL DEFAULT 'neuaufbau_schema',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS supplements.supplement_field_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplement_id UUID NOT NULL REFERENCES supplements.supplements(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'unbekannt' CHECK (status IN ('bekannt','unbekannt','nicht_zutreffend')),
  field_name TEXT NOT NULL CHECK (btrim(field_name) <> ''),
  source_id TEXT,
  as_of DATE,
  evidence_class TEXT,
  source_note_de TEXT,
  source_note_en TEXT,
  source_note_th TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS supplements.supplement_nutrients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplement_id UUID NOT NULL REFERENCES supplements.supplements(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'unbekannt' CHECK (status IN ('bekannt','unbekannt','nicht_zutreffend')),
  nutrient_code TEXT NOT NULL REFERENCES nutrition.nutrient_defs(code) ON DELETE RESTRICT,
  amount_per_serving NUMERIC(14,6),
  unit TEXT,
  conversion_factor NUMERIC(14,8),
  source TEXT NOT NULL DEFAULT 'neuaufbau_schema',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS supplements.intake_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  supplement_id UUID NOT NULL REFERENCES supplements.supplements(id) ON DELETE CASCADE,
  stack_item_id UUID REFERENCES supplements.stack_items(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'unbekannt' CHECK (status IN ('bekannt','unbekannt','nicht_zutreffend')),
  scheduled_time TIME,
  frequency TEXT,
  dose_amount NUMERIC(12,4),
  dose_unit TEXT,
  note_de TEXT,
  note_en TEXT,
  note_th TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS supplements.user_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  supplement_id UUID NOT NULL REFERENCES supplements.supplements(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'unbekannt' CHECK (status IN ('bekannt','unbekannt','nicht_zutreffend')),
  quantity_remaining NUMERIC(12,4),
  quantity_unit TEXT,
  purchased_at DATE,
  expires_at DATE,
  supplier TEXT,
  cost_per_unit NUMERIC(12,4),
  total_cost NUMERIC(12,4),
  reorder_flag BOOLEAN,
  source TEXT NOT NULL DEFAULT 'neuaufbau_schema',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS supplements.user_supplement_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  supplement_id UUID NOT NULL REFERENCES supplements.supplements(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'unbekannt' CHECK (status IN ('bekannt','unbekannt','nicht_zutreffend')),
  reminder_times TIME[],
  low_stock_days INTEGER CHECK (low_stock_days IS NULL OR low_stock_days >= 0),
  note_de TEXT,
  note_en TEXT,
  note_th TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE supplements.user_supplement_settings
  DROP COLUMN IF EXISTS enhanced_mode,
  DROP COLUMN IF EXISTS enhanced_accepted_at,
  DROP COLUMN IF EXISTS enhanced_age_verified;

CREATE TABLE IF NOT EXISTS supplements.stack_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplement_id UUID REFERENCES supplements.supplements(id) ON DELETE SET NULL,
  name_de TEXT,
  name_en TEXT,
  name_th TEXT,
  description_de TEXT,
  description_en TEXT,
  description_th TEXT,
  goal TEXT,
  source TEXT NOT NULL DEFAULT 'system' CHECK (source IN ('system','coach','community')),
  is_public BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS supplements.stack_template_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES supplements.stack_templates(id) ON DELETE CASCADE,
  supplement_id UUID NOT NULL REFERENCES supplements.supplements(id) ON DELETE RESTRICT,
  dose_amount NUMERIC(12,4),
  dose_unit TEXT,
  timing TEXT,
  frequency TEXT NOT NULL DEFAULT 'daily',
  tier TEXT NOT NULL DEFAULT 'good' CHECK (tier IN ('must','good','nice')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  source TEXT NOT NULL DEFAULT 'neuaufbau_schema',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS supplements.user_supplement_cycles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  supplement_id UUID NOT NULL REFERENCES supplements.supplements(id) ON DELETE RESTRICT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','paused','stopped')),
  source TEXT NOT NULL DEFAULT 'coach_suggested' CHECK (source IN ('coach_suggested','confirmed_by_user')),
  suggestion_source TEXT CHECK (suggestion_source IS NULL OR suggestion_source IN ('ai_suggested','marketplace_product','coach_recommendation','user_manual')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  paused_at TIMESTAMPTZ,
  stopped_at TIMESTAMPTZ,
  note_de TEXT,
  note_en TEXT,
  note_th TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_user_supplement_cycles_active
  ON supplements.user_supplement_cycles(user_id, supplement_id)
  WHERE status = 'active';

CREATE TABLE IF NOT EXISTS supplements.supplement_cycle_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_id UUID NOT NULL REFERENCES supplements.user_supplement_cycles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  supplement_id UUID NOT NULL REFERENCES supplements.supplements(id) ON DELETE RESTRICT,
  event_type TEXT NOT NULL CHECK (event_type IN ('created','confirmed','paused','resumed','stopped','reminder_set','reminder_removed')),
  metadata JSONB,
  note_de TEXT,
  note_en TEXT,
  note_th TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS supplements.supplement_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_id UUID NOT NULL REFERENCES supplements.user_supplement_cycles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  supplement_id UUID NOT NULL REFERENCES supplements.supplements(id) ON DELETE RESTRICT,
  time_of_day TIME NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  note_de TEXT,
  note_en TEXT,
  note_th TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (cycle_id, time_of_day)
);

CREATE TABLE IF NOT EXISTS supplements.supplement_protocols (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  supplement_id UUID NOT NULL REFERENCES supplements.supplements(id) ON DELETE RESTRICT,
  name_de TEXT,
  name_en TEXT,
  name_th TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','paused','completed')),
  schedule JSONB,
  source TEXT NOT NULL DEFAULT 'neuaufbau_schema',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS supplements.supplement_protocol_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  protocol_id UUID NOT NULL REFERENCES supplements.supplement_protocols(id) ON DELETE CASCADE,
  supplement_id UUID NOT NULL REFERENCES supplements.supplements(id) ON DELETE RESTRICT,
  dose_amount NUMERIC(12,4),
  dose_unit TEXT,
  timing TEXT,
  with_meal BOOLEAN NOT NULL DEFAULT false,
  note_de TEXT,
  note_en TEXT,
  note_th TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_supplements_group ON supplements.supplements(group_id);
CREATE INDEX IF NOT EXISTS idx_supplements_category ON supplements.supplements(category_id);
CREATE INDEX IF NOT EXISTS idx_supplement_categories_group ON supplements.supplement_categories(group_id);
CREATE INDEX IF NOT EXISTS idx_supplement_aliases_supplement ON supplements.supplement_aliases(supplement_id);
CREATE INDEX IF NOT EXISTS idx_supplement_tags_tag ON supplements.supplement_tags(tag_code);
CREATE INDEX IF NOT EXISTS idx_supplement_portions_supplement ON supplements.supplement_portions(supplement_id);
CREATE INDEX IF NOT EXISTS idx_supplement_dosing_supplement ON supplements.supplement_dosing(supplement_id);
CREATE INDEX IF NOT EXISTS idx_supplement_pharmacology_supplement ON supplements.supplement_pharmacology(supplement_id);
CREATE INDEX IF NOT EXISTS idx_supplement_safety_supplement ON supplements.supplement_safety(supplement_id);
CREATE INDEX IF NOT EXISTS idx_supplement_quality_supplement ON supplements.supplement_quality(supplement_id);
CREATE INDEX IF NOT EXISTS idx_supplement_warnings_supplement ON supplements.supplement_warnings(supplement_id);
CREATE INDEX IF NOT EXISTS idx_supplement_evidence_supplement ON supplements.supplement_evidence(supplement_id);
CREATE INDEX IF NOT EXISTS idx_supplement_wada_supplement ON supplements.supplement_wada(supplement_id);
CREATE INDEX IF NOT EXISTS idx_supplement_protocol_requirements_supplement ON supplements.supplement_protocol_requirements(supplement_id);
CREATE INDEX IF NOT EXISTS idx_supplement_aas_ratings_supplement ON supplements.supplement_aas_ratings(supplement_id);
CREATE INDEX IF NOT EXISTS idx_supplement_organ_risks_supplement ON supplements.supplement_organ_risks(supplement_id);
CREATE INDEX IF NOT EXISTS idx_supplement_regulatory_supplement ON supplements.supplement_regulatory(supplement_id);
CREATE INDEX IF NOT EXISTS idx_supplement_identifiers_supplement ON supplements.supplement_identifiers(supplement_id);
CREATE INDEX IF NOT EXISTS idx_supplement_lab_effects_supplement ON supplements.supplement_lab_effects(supplement_id);
CREATE INDEX IF NOT EXISTS idx_supplement_monitoring_supplement ON supplements.supplement_monitoring(supplement_id);
CREATE INDEX IF NOT EXISTS idx_supplement_field_sources_supplement ON supplements.supplement_field_sources(supplement_id);
CREATE INDEX IF NOT EXISTS idx_supplement_nutrients_supplement ON supplements.supplement_nutrients(supplement_id);
CREATE INDEX IF NOT EXISTS idx_intake_schedule_user ON supplements.intake_schedule(user_id);
CREATE INDEX IF NOT EXISTS idx_intake_schedule_supplement ON supplements.intake_schedule(supplement_id);
CREATE INDEX IF NOT EXISTS idx_user_inventory_user ON supplements.user_inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_user_inventory_supplement ON supplements.user_inventory(supplement_id);
CREATE INDEX IF NOT EXISTS idx_user_supplement_settings_user ON supplements.user_supplement_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_supplement_settings_supplement ON supplements.user_supplement_settings(supplement_id);
CREATE INDEX IF NOT EXISTS idx_stack_templates_supplement ON supplements.stack_templates(supplement_id);
CREATE INDEX IF NOT EXISTS idx_stack_template_items_template ON supplements.stack_template_items(template_id);
CREATE INDEX IF NOT EXISTS idx_stack_template_items_supplement ON supplements.stack_template_items(supplement_id);
CREATE INDEX IF NOT EXISTS idx_user_supplement_cycles_user ON supplements.user_supplement_cycles(user_id, status);
CREATE INDEX IF NOT EXISTS idx_user_supplement_cycles_supplement ON supplements.user_supplement_cycles(supplement_id);
CREATE INDEX IF NOT EXISTS idx_supplement_cycle_events_cycle ON supplements.supplement_cycle_events(cycle_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_supplement_cycle_events_user ON supplements.supplement_cycle_events(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_supplement_cycle_events_supplement ON supplements.supplement_cycle_events(supplement_id);
CREATE INDEX IF NOT EXISTS idx_supplement_reminders_user ON supplements.supplement_reminders(user_id, enabled);
CREATE INDEX IF NOT EXISTS idx_supplement_reminders_supplement ON supplements.supplement_reminders(supplement_id);
CREATE INDEX IF NOT EXISTS idx_supplement_protocols_user ON supplements.supplement_protocols(user_id, status);
CREATE INDEX IF NOT EXISTS idx_supplement_protocols_supplement ON supplements.supplement_protocols(supplement_id);
CREATE INDEX IF NOT EXISTS idx_supplement_protocol_items_protocol ON supplements.supplement_protocol_items(protocol_id);
CREATE INDEX IF NOT EXISTS idx_supplement_protocol_items_supplement ON supplements.supplement_protocol_items(supplement_id);

DO $$
DECLARE
  v_table text;
BEGIN
  FOREACH v_table IN ARRAY ARRAY[
    'supplement_groups','supplement_categories','supplement_tag_definitions','supplements',
    'supplement_aliases','supplement_tags','supplement_portions','supplement_dosing',
    'supplement_pharmacology','supplement_safety','supplement_quality','supplement_warnings',
    'supplement_evidence','supplement_wada','supplement_protocol_requirements','supplement_aas_ratings',
    'supplement_organ_risks','supplement_regulatory','supplement_identifiers','supplement_lab_effects',
    'supplement_monitoring','supplement_field_sources','supplement_nutrients',
    'intake_schedule','user_inventory','user_supplement_settings',
    'stack_templates','stack_template_items','user_supplement_cycles',
    'supplement_cycle_events','supplement_reminders','supplement_protocols',
    'supplement_protocol_items'
  ]
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS %I ON supplements.%I', v_table || '_touch_updated_at', v_table);
    EXECUTE format('CREATE TRIGGER %I BEFORE UPDATE ON supplements.%I FOR EACH ROW EXECUTE FUNCTION supplements.touch_updated_at()', v_table || '_touch_updated_at', v_table);
    EXECUTE format('ALTER TABLE supplements.%I ENABLE ROW LEVEL SECURITY', v_table);
    EXECUTE format('GRANT ALL ON supplements.%I TO service_role', v_table);
  END LOOP;
END $$;

GRANT SELECT ON
  supplements.supplement_groups,
  supplements.supplement_categories,
  supplements.supplement_tag_definitions,
  supplements.supplements,
  supplements.supplement_aliases,
  supplements.supplement_tags,
  supplements.supplement_portions,
  supplements.supplement_dosing,
  supplements.supplement_pharmacology,
  supplements.supplement_safety,
  supplements.supplement_quality,
  supplements.supplement_warnings,
  supplements.supplement_evidence,
  supplements.supplement_wada,
  supplements.supplement_protocol_requirements,
  supplements.supplement_aas_ratings,
  supplements.supplement_organ_risks,
  supplements.supplement_regulatory,
  supplements.supplement_identifiers,
  supplements.supplement_lab_effects,
  supplements.supplement_monitoring,
  supplements.supplement_field_sources,
  supplements.supplement_nutrients,
  supplements.stack_templates,
  supplements.stack_template_items
TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON
  supplements.intake_schedule,
  supplements.user_inventory,
  supplements.user_supplement_settings,
  supplements.user_supplement_cycles,
  supplements.supplement_cycle_events,
  supplements.supplement_reminders,
  supplements.supplement_protocols,
  supplements.supplement_protocol_items
TO authenticated;

DROP POLICY IF EXISTS supplement_groups_select ON supplements.supplement_groups;
CREATE POLICY supplement_groups_select ON supplements.supplement_groups FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS supplement_categories_select ON supplements.supplement_categories;
CREATE POLICY supplement_categories_select ON supplements.supplement_categories FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS supplement_tag_definitions_select ON supplements.supplement_tag_definitions;
CREATE POLICY supplement_tag_definitions_select ON supplements.supplement_tag_definitions FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS supplements_select ON supplements.supplements;
CREATE POLICY supplements_select ON supplements.supplements FOR SELECT TO authenticated USING (is_active);
DROP POLICY IF EXISTS supplement_aliases_select ON supplements.supplement_aliases;
CREATE POLICY supplement_aliases_select ON supplements.supplement_aliases FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS supplement_tags_select ON supplements.supplement_tags;
CREATE POLICY supplement_tags_select ON supplements.supplement_tags FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS supplement_portions_select ON supplements.supplement_portions;
CREATE POLICY supplement_portions_select ON supplements.supplement_portions FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS supplement_dosing_select ON supplements.supplement_dosing;
CREATE POLICY supplement_dosing_select ON supplements.supplement_dosing FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS supplement_pharmacology_select ON supplements.supplement_pharmacology;
CREATE POLICY supplement_pharmacology_select ON supplements.supplement_pharmacology FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS supplement_safety_select ON supplements.supplement_safety;
CREATE POLICY supplement_safety_select ON supplements.supplement_safety FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS supplement_quality_select ON supplements.supplement_quality;
CREATE POLICY supplement_quality_select ON supplements.supplement_quality FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS supplement_warnings_select ON supplements.supplement_warnings;
CREATE POLICY supplement_warnings_select ON supplements.supplement_warnings FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS supplement_evidence_select ON supplements.supplement_evidence;
CREATE POLICY supplement_evidence_select ON supplements.supplement_evidence FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS supplement_wada_select ON supplements.supplement_wada;
CREATE POLICY supplement_wada_select ON supplements.supplement_wada FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS supplement_protocol_requirements_select ON supplements.supplement_protocol_requirements;
CREATE POLICY supplement_protocol_requirements_select ON supplements.supplement_protocol_requirements FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS supplement_aas_ratings_select ON supplements.supplement_aas_ratings;
CREATE POLICY supplement_aas_ratings_select ON supplements.supplement_aas_ratings FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS supplement_organ_risks_select ON supplements.supplement_organ_risks;
CREATE POLICY supplement_organ_risks_select ON supplements.supplement_organ_risks FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS supplement_regulatory_select ON supplements.supplement_regulatory;
CREATE POLICY supplement_regulatory_select ON supplements.supplement_regulatory FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS supplement_identifiers_select ON supplements.supplement_identifiers;
CREATE POLICY supplement_identifiers_select ON supplements.supplement_identifiers FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS supplement_lab_effects_select ON supplements.supplement_lab_effects;
CREATE POLICY supplement_lab_effects_select ON supplements.supplement_lab_effects FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS supplement_monitoring_select ON supplements.supplement_monitoring;
CREATE POLICY supplement_monitoring_select ON supplements.supplement_monitoring FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS supplement_field_sources_select ON supplements.supplement_field_sources;
CREATE POLICY supplement_field_sources_select ON supplements.supplement_field_sources FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS supplement_nutrients_select ON supplements.supplement_nutrients;
CREATE POLICY supplement_nutrients_select ON supplements.supplement_nutrients FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS stack_templates_select ON supplements.stack_templates;
CREATE POLICY stack_templates_select ON supplements.stack_templates FOR SELECT TO authenticated USING (is_public);
DROP POLICY IF EXISTS stack_template_items_select ON supplements.stack_template_items;
CREATE POLICY stack_template_items_select ON supplements.stack_template_items FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM supplements.stack_templates t
    WHERE t.id = stack_template_items.template_id
      AND t.is_public
  )
);

DROP POLICY IF EXISTS intake_schedule_select ON supplements.intake_schedule;
DROP POLICY IF EXISTS intake_schedule_insert ON supplements.intake_schedule;
DROP POLICY IF EXISTS intake_schedule_update ON supplements.intake_schedule;
DROP POLICY IF EXISTS intake_schedule_delete ON supplements.intake_schedule;
CREATE POLICY intake_schedule_select ON supplements.intake_schedule FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
CREATE POLICY intake_schedule_insert ON supplements.intake_schedule FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY intake_schedule_update ON supplements.intake_schedule FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY intake_schedule_delete ON supplements.intake_schedule FOR DELETE TO authenticated USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS user_inventory_select ON supplements.user_inventory;
DROP POLICY IF EXISTS user_inventory_insert ON supplements.user_inventory;
DROP POLICY IF EXISTS user_inventory_update ON supplements.user_inventory;
DROP POLICY IF EXISTS user_inventory_delete ON supplements.user_inventory;
CREATE POLICY user_inventory_select ON supplements.user_inventory FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
CREATE POLICY user_inventory_insert ON supplements.user_inventory FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY user_inventory_update ON supplements.user_inventory FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY user_inventory_delete ON supplements.user_inventory FOR DELETE TO authenticated USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS user_supplement_settings_select ON supplements.user_supplement_settings;
DROP POLICY IF EXISTS user_supplement_settings_insert ON supplements.user_supplement_settings;
DROP POLICY IF EXISTS user_supplement_settings_update ON supplements.user_supplement_settings;
DROP POLICY IF EXISTS user_supplement_settings_delete ON supplements.user_supplement_settings;
CREATE POLICY user_supplement_settings_select ON supplements.user_supplement_settings FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
CREATE POLICY user_supplement_settings_insert ON supplements.user_supplement_settings FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY user_supplement_settings_update ON supplements.user_supplement_settings FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY user_supplement_settings_delete ON supplements.user_supplement_settings FOR DELETE TO authenticated USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS user_supplement_cycles_select ON supplements.user_supplement_cycles;
DROP POLICY IF EXISTS user_supplement_cycles_insert ON supplements.user_supplement_cycles;
DROP POLICY IF EXISTS user_supplement_cycles_update ON supplements.user_supplement_cycles;
DROP POLICY IF EXISTS user_supplement_cycles_delete ON supplements.user_supplement_cycles;
CREATE POLICY user_supplement_cycles_select ON supplements.user_supplement_cycles FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
CREATE POLICY user_supplement_cycles_insert ON supplements.user_supplement_cycles FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY user_supplement_cycles_update ON supplements.user_supplement_cycles FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY user_supplement_cycles_delete ON supplements.user_supplement_cycles FOR DELETE TO authenticated USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS supplement_cycle_events_select ON supplements.supplement_cycle_events;
DROP POLICY IF EXISTS supplement_cycle_events_insert ON supplements.supplement_cycle_events;
DROP POLICY IF EXISTS supplement_cycle_events_update ON supplements.supplement_cycle_events;
DROP POLICY IF EXISTS supplement_cycle_events_delete ON supplements.supplement_cycle_events;
CREATE POLICY supplement_cycle_events_select ON supplements.supplement_cycle_events FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
CREATE POLICY supplement_cycle_events_insert ON supplements.supplement_cycle_events FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY supplement_cycle_events_update ON supplements.supplement_cycle_events FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY supplement_cycle_events_delete ON supplements.supplement_cycle_events FOR DELETE TO authenticated USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS supplement_reminders_select ON supplements.supplement_reminders;
DROP POLICY IF EXISTS supplement_reminders_insert ON supplements.supplement_reminders;
DROP POLICY IF EXISTS supplement_reminders_update ON supplements.supplement_reminders;
DROP POLICY IF EXISTS supplement_reminders_delete ON supplements.supplement_reminders;
CREATE POLICY supplement_reminders_select ON supplements.supplement_reminders FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
CREATE POLICY supplement_reminders_insert ON supplements.supplement_reminders FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY supplement_reminders_update ON supplements.supplement_reminders FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY supplement_reminders_delete ON supplements.supplement_reminders FOR DELETE TO authenticated USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS supplement_protocols_select ON supplements.supplement_protocols;
DROP POLICY IF EXISTS supplement_protocols_insert ON supplements.supplement_protocols;
DROP POLICY IF EXISTS supplement_protocols_update ON supplements.supplement_protocols;
DROP POLICY IF EXISTS supplement_protocols_delete ON supplements.supplement_protocols;
CREATE POLICY supplement_protocols_select ON supplements.supplement_protocols FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
CREATE POLICY supplement_protocols_insert ON supplements.supplement_protocols FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY supplement_protocols_update ON supplements.supplement_protocols FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY supplement_protocols_delete ON supplements.supplement_protocols FOR DELETE TO authenticated USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS supplement_protocol_items_select ON supplements.supplement_protocol_items;
DROP POLICY IF EXISTS supplement_protocol_items_insert ON supplements.supplement_protocol_items;
DROP POLICY IF EXISTS supplement_protocol_items_update ON supplements.supplement_protocol_items;
DROP POLICY IF EXISTS supplement_protocol_items_delete ON supplements.supplement_protocol_items;
CREATE POLICY supplement_protocol_items_select ON supplements.supplement_protocol_items FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM supplements.supplement_protocols p
    WHERE p.id = supplement_protocol_items.protocol_id
      AND p.user_id = (SELECT auth.uid())
  )
);
CREATE POLICY supplement_protocol_items_insert ON supplements.supplement_protocol_items FOR INSERT TO authenticated WITH CHECK (
  EXISTS (
    SELECT 1 FROM supplements.supplement_protocols p
    WHERE p.id = supplement_protocol_items.protocol_id
      AND p.user_id = (SELECT auth.uid())
  )
);
CREATE POLICY supplement_protocol_items_update ON supplements.supplement_protocol_items FOR UPDATE TO authenticated USING (
  EXISTS (
    SELECT 1 FROM supplements.supplement_protocols p
    WHERE p.id = supplement_protocol_items.protocol_id
      AND p.user_id = (SELECT auth.uid())
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM supplements.supplement_protocols p
    WHERE p.id = supplement_protocol_items.protocol_id
      AND p.user_id = (SELECT auth.uid())
  )
);
CREATE POLICY supplement_protocol_items_delete ON supplements.supplement_protocol_items FOR DELETE TO authenticated USING (
  EXISTS (
    SELECT 1 FROM supplements.supplement_protocols p
    WHERE p.id = supplement_protocol_items.protocol_id
      AND p.user_id = (SELECT auth.uid())
  )
);

DO $$
DECLARE
  v_new_tables integer;
  v_non_empty integer;
  v_fk_tables integer;
BEGIN
  WITH expected(name) AS (
    VALUES
      ('supplement_groups'), ('supplement_categories'), ('supplement_tag_definitions'), ('supplements'),
      ('supplement_aliases'), ('supplement_tags'), ('supplement_portions'), ('supplement_dosing'),
      ('supplement_pharmacology'), ('supplement_safety'), ('supplement_quality'), ('supplement_warnings'),
      ('supplement_evidence'), ('supplement_wada'), ('supplement_protocol_requirements'), ('supplement_aas_ratings'),
      ('supplement_organ_risks'), ('supplement_regulatory'), ('supplement_identifiers'), ('supplement_lab_effects'),
      ('supplement_monitoring'), ('supplement_field_sources'), ('supplement_nutrients'),
      ('intake_schedule'), ('user_inventory'), ('user_supplement_settings'),
      ('stack_templates'), ('stack_template_items'), ('user_supplement_cycles'),
      ('supplement_cycle_events'), ('supplement_reminders'), ('supplement_protocols'),
      ('supplement_protocol_items')
  )
  SELECT count(*) INTO v_new_tables
  FROM expected e
  JOIN information_schema.tables t
    ON t.table_schema = 'supplements'
   AND t.table_name = e.name
   AND t.table_type = 'BASE TABLE';

  WITH fk_tables AS (
    SELECT DISTINCT c.conrelid::regclass::text AS table_name
    FROM pg_constraint c
    JOIN pg_class target ON target.oid = c.confrelid
    JOIN pg_namespace target_ns ON target_ns.oid = target.relnamespace
    JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = ANY(c.conkey)
    WHERE c.contype = 'f'
      AND target_ns.nspname = 'supplements'
      AND target.relname = 'supplements'
      AND a.attname = 'supplement_id'
  )
  SELECT count(*) INTO v_fk_tables
  FROM fk_tables
  WHERE table_name LIKE 'supplements.%';

  SELECT sum(row_count)::integer INTO v_non_empty
  FROM (
    SELECT (SELECT count(*) FROM supplements.supplement_groups) AS row_count UNION ALL
    SELECT (SELECT count(*) FROM supplements.supplement_categories) UNION ALL
    SELECT (SELECT count(*) FROM supplements.supplement_tag_definitions) UNION ALL
    SELECT (SELECT count(*) FROM supplements.supplements) UNION ALL
    SELECT (SELECT count(*) FROM supplements.supplement_aliases) UNION ALL
    SELECT (SELECT count(*) FROM supplements.supplement_tags) UNION ALL
    SELECT (SELECT count(*) FROM supplements.supplement_portions) UNION ALL
    SELECT (SELECT count(*) FROM supplements.supplement_dosing) UNION ALL
    SELECT (SELECT count(*) FROM supplements.supplement_pharmacology) UNION ALL
    SELECT (SELECT count(*) FROM supplements.supplement_safety) UNION ALL
    SELECT (SELECT count(*) FROM supplements.supplement_quality) UNION ALL
    SELECT (SELECT count(*) FROM supplements.supplement_warnings) UNION ALL
    SELECT (SELECT count(*) FROM supplements.supplement_evidence) UNION ALL
    SELECT (SELECT count(*) FROM supplements.supplement_wada) UNION ALL
    SELECT (SELECT count(*) FROM supplements.supplement_protocol_requirements) UNION ALL
    SELECT (SELECT count(*) FROM supplements.supplement_aas_ratings) UNION ALL
    SELECT (SELECT count(*) FROM supplements.supplement_organ_risks) UNION ALL
    SELECT (SELECT count(*) FROM supplements.supplement_regulatory) UNION ALL
    SELECT (SELECT count(*) FROM supplements.supplement_identifiers) UNION ALL
    SELECT (SELECT count(*) FROM supplements.supplement_lab_effects) UNION ALL
    SELECT (SELECT count(*) FROM supplements.supplement_monitoring) UNION ALL
    SELECT (SELECT count(*) FROM supplements.supplement_field_sources) UNION ALL
    SELECT (SELECT count(*) FROM supplements.supplement_nutrients) UNION ALL
    SELECT (SELECT count(*) FROM supplements.intake_schedule) UNION ALL
    SELECT (SELECT count(*) FROM supplements.user_inventory) UNION ALL
    SELECT (SELECT count(*) FROM supplements.user_supplement_settings) UNION ALL
    SELECT (SELECT count(*) FROM supplements.stack_templates) UNION ALL
    SELECT (SELECT count(*) FROM supplements.stack_template_items) UNION ALL
    SELECT (SELECT count(*) FROM supplements.user_supplement_cycles) UNION ALL
    SELECT (SELECT count(*) FROM supplements.supplement_cycle_events) UNION ALL
    SELECT (SELECT count(*) FROM supplements.supplement_reminders) UNION ALL
    SELECT (SELECT count(*) FROM supplements.supplement_protocols) UNION ALL
    SELECT (SELECT count(*) FROM supplements.supplement_protocol_items)
  ) counts;

  IF v_new_tables <> 33 THEN
    RAISE EXCEPTION 'C-232: % neue Tabellen vorhanden, erwartet 33', v_new_tables;
  END IF;
  IF v_fk_tables <> 29 THEN
    RAISE EXCEPTION 'C-232: % Tabellen mit supplement_id-FK auf supplements.supplements, erwartet 29', v_fk_tables;
  END IF;
  IF COALESCE(v_non_empty, 0) <> 0 THEN
    RAISE EXCEPTION 'C-232: neue Tabellen enthalten % Zeilen, erwartet 0', v_non_empty;
  END IF;

  RAISE NOTICE 'OK C-232: 33 neue Supplements-Tabellen leer angelegt, 29 supplement_id-FKs auf supplements.supplements.';
END $$;

COMMIT;
