#!/usr/bin/env node
// C-133: Kimi-Warn-, Gap- und Medikamentenregeln als Daten.
// Die Regeln bleiben JSON-Daten aus dem Kimi-Bestand; die DB-Funktion
// wertet nur vorhandene LumeOS-Eingaenge aus und meldet fehlende Eingaenge
// als eigenen Zustand.
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const CONTAINER = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const DB = process.env.PGDATABASE ?? 'postgres'
const BASE = 'backup/kimi-research/Kimi_Agent/supplement_performance_database/data/platform'
const FILES = ['warning_rules.jsonl', 'nutrient_gap_rules.jsonl', 'medication_rules.jsonl'] as const
const EXPECTED_COUNTS: Record<string, number> = {
  warning: 29,
  nutrient_gap: 15,
  medication: 20,
}

type JsonObject = Record<string, unknown>
type Rule = JsonObject & {
  id: string
  type?: string
  severity?: string
  priority_lane?: string
  priority_rank?: number
  conditions?: JsonObject[]
  effects?: JsonObject[]
  message_key?: string
  message_de?: string
  recommended_action_type?: string
  modules_involved?: string[]
  substance_ids?: string[]
  substance_group_ids?: string[]
  substance_names_for_display?: string[]
  legal_supplement_candidates_ids?: string[]
  legal_supplement_candidates_names?: string[]
  evidence?: JsonObject[]
  gap_condition?: string
  version?: number
}
type Status = 'auswertbar' | 'teilweise' | 'blockiert'

function fail(message: string): never {
  console.error(message)
  process.exit(1)
}

function readJsonl(file: string): Rule[] {
  const full = path.join(BASE, file)
  if (!fs.existsSync(full)) fail(`${full} fehlt. C-133 braucht den Kimi-Plattformbestand.`)
  return fs.readFileSync(full, 'utf8')
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line, index) => {
      try {
        return JSON.parse(line) as Rule
      } catch (error) {
        fail(`${full}:${index + 1}: JSON ungueltig (${String(error)})`)
      }
    })
}

const available = new Set([
  'medical.medications',
  'medical.medications[].drug_class',
  'medical.medications[].cyp_profile',
  'medical.conditions',
  'medical.labs',
  'supplements.stack',
  'supplements.stack_item.substance_id',
  'supplements.daily_totals',
  'nutrition.protein_intake_g_per_kg',
  'nutrition.daily.protein_g',
  'training.resistance_sessions_per_week',
  'training.load_spike',
  'profile.age',
  'profile.sex',
  'profile.pregnancy_planned',
])

const partial = new Set([
  'nutrition.d_vitamin_dietary_low',
  'nutrition.magnesium_dietary_low',
  'nutrition.caffeine_mg_day',
])

const missingAliases = new Map([
  ['medical.symptoms', 'medical.symptoms'],
  ['medical.lab_draw_scheduled_within_days', 'medical.lab_draw_scheduled_within_days'],
  ['medical.labs[].analyte', 'medical.labs[].analyte'],
  ['medical.glucose_meter_user', 'medical.glucose_meter_user'],
  ['medical.$ANY', 'medical.$ANY'],
  ['supplements.daily_total_mg', 'supplements.daily_total_mg'],
  ['supplements.computed.stimulant_load_mg_caffeine_equiv', 'supplements.computed.stimulant_load_mg_caffeine_equiv'],
  ['nutrition.fish_servings_per_week', 'nutrition.daily.fish_servings_week'],
  ['nutrition.dairy_servings_per_day', 'nutrition.daily.dairy_servings_day'],
  ['nutrition.dairy_servings_day', 'nutrition.daily.dairy_servings_day'],
  ['diet.type', 'nutrition.diet_type'],
  ['duration', 'nutrition.tracked_duration'],
  ['fatigue.reported', 'medical.symptoms'],
  ['training.endurance_duration', 'training.endurance_duration'],
  ['training.high_sweat_rate', 'training.high_sweat_rate'],
  ['training.strength_focus', 'training.strength_focus'],
  ['training.high_impact', 'training.high_impact'],
  ['training.load_high', 'training.load_high'],
  ['user.opt', 'profile.user_opt_in'],
  ['renal.function', 'medical.labs'],
  ['profile.joint_complaints', 'medical.symptoms'],
  ['profile.high_screen_time', 'profile.high_screen_time'],
  ['location.low_sun', 'location.low_sun'],
  ['lifestyle.indoor_dominant', 'profile.indoor_dominant'],
  ['profile.indoor_dominant', 'profile.indoor_dominant'],
  ['profile.athlete_tested_pool', 'profile.athlete_tested_pool'],
  ['season.winter', 'season.winter'],
  ['sleep.sleep_latency_min', 'sleep.sleep_latency_min'],
  ['sleep.sleep_latency_high', 'sleep.sleep_latency_min'],
  ['sleep.quality_score', 'sleep.quality_score'],
  ['sleep.quality_drop', 'sleep.quality_score'],
  ['sleep.tracked_nights', 'sleep.tracked_nights'],
])

function ruleType(file: string): 'warning' | 'nutrient_gap' | 'medication' {
  if (file === 'warning_rules.jsonl') return 'warning'
  if (file === 'nutrient_gap_rules.jsonl') return 'nutrient_gap'
  return 'medication'
}

function conditionInputs(rule: Rule): string[] {
  const out = new Set<string>()
  for (const c of rule.conditions ?? []) {
    const module = String(c.module ?? '')
    const field = String(c.field ?? '')
    if (field === '(see gap_condition)' && typeof rule.gap_condition === 'string') {
      for (const token of rule.gap_condition.match(/[a-z]+(?:\.[a-z0-9_]+)+/gi) ?? []) {
        out.add(missingAliases.get(token) ?? token)
      }
    } else {
      out.add(missingAliases.get(`${module}.${field}`) ?? `${module}.${field}`)
    }
  }
  return [...out]
}

function inputStatus(input: string): 'available' | 'partial' | 'missing' {
  if (available.has(input)) return 'available'
  if (partial.has(input)) return 'partial'
  return 'missing'
}

function coverageStatus(inputs: string[]): Status {
  const statuses = inputs.map(inputStatus)
  if (statuses.length > 0 && statuses.every(status => status === 'available')) return 'auswertbar'
  if (statuses.some(status => status === 'available' || status === 'partial')) return 'teilweise'
  return 'blockiert'
}

function csvCell(value: string): string {
  return `"${value.replace(/"/g, '""')}"`
}

const rows: Array<JsonObject> = []
for (const file of FILES) {
  for (const rule of readJsonl(file)) {
    const inputs = conditionInputs(rule)
    const missing = inputs.filter(input => inputStatus(input) === 'missing')
    rows.push({
      rule_id: rule.id,
      rule_type: ruleType(file),
      rule_kind: rule.type ?? null,
      severity: rule.severity ?? null,
      priority_lane: rule.priority_lane ?? null,
      priority_rank: rule.priority_rank ?? null,
      conditions: rule.conditions ?? [],
      effects: rule.effects ?? [],
      message_key: rule.message_key ?? null,
      message_de: rule.message_de ?? null,
      recommended_action_type: rule.recommended_action_type ?? null,
      modules_involved: rule.modules_involved ?? [],
      input_paths: inputs,
      input_coverage_status: coverageStatus(inputs),
      missing_input_paths: missing,
      substance_ids: rule.substance_ids ?? rule.legal_supplement_candidates_ids ?? [],
      substance_group_ids: rule.substance_group_ids ?? [],
      substance_names_for_display: rule.substance_names_for_display ?? rule.legal_supplement_candidates_names ?? [],
      evidence: rule.evidence ?? [],
      gap_condition: rule.gap_condition ?? null,
      source_file: file,
      source_version: rule.version ?? null,
      raw: rule,
    })
  }
}

if (rows.length !== 64) fail(`Kimi-Regeln: ${rows.length}, erwartet 64`)
for (const [type, expected] of Object.entries(EXPECTED_COUNTS)) {
  const actual = rows.filter(row => row.rule_type === type).length
  if (actual !== expected) fail(`${type}: ${actual}, erwartet ${expected}`)
}

const payload = rows.map(row => csvCell(JSON.stringify(row))).join('\n')
const sql = `
BEGIN;

CREATE TABLE IF NOT EXISTS supplements.rule_catalog (
  rule_id                    TEXT PRIMARY KEY CHECK (btrim(rule_id) <> ''),
  rule_type                  TEXT NOT NULL CHECK (rule_type IN ('warning', 'nutrient_gap', 'medication')),
  rule_kind                  TEXT,
  severity                   TEXT,
  priority_lane              TEXT,
  priority_rank              INTEGER,
  conditions                 JSONB NOT NULL DEFAULT '[]'::jsonb,
  effects                    JSONB NOT NULL DEFAULT '[]'::jsonb,
  message_key                TEXT NOT NULL CHECK (btrim(message_key) <> ''),
  message_de                 TEXT,
  recommended_action_type    TEXT,
  modules_involved           TEXT[] NOT NULL DEFAULT '{}',
  input_paths                TEXT[] NOT NULL DEFAULT '{}',
  input_coverage_status      TEXT NOT NULL CHECK (input_coverage_status IN ('auswertbar', 'teilweise', 'blockiert')),
  missing_input_paths        TEXT[] NOT NULL DEFAULT '{}',
  substance_ids              TEXT[] NOT NULL DEFAULT '{}',
  substance_group_ids        TEXT[] NOT NULL DEFAULT '{}',
  substance_names_for_display TEXT[] NOT NULL DEFAULT '{}',
  evidence                   JSONB NOT NULL DEFAULT '[]'::jsonb,
  gap_condition              TEXT,
  source_file                TEXT NOT NULL,
  source_version             INTEGER,
  raw                        JSONB NOT NULL,
  source                     TEXT NOT NULL DEFAULT 'kimi_platform_crawl_021A',
  imported_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                 TIMESTAMPTZ NOT NULL DEFAULT now(),

  CHECK (jsonb_typeof(conditions) = 'array'),
  CHECK (jsonb_typeof(effects) = 'array'),
  CHECK (jsonb_typeof(evidence) = 'array')
);

CREATE INDEX IF NOT EXISTS rule_catalog_type_idx
  ON supplements.rule_catalog(rule_type, priority_rank);
CREATE INDEX IF NOT EXISTS rule_catalog_inputs_idx
  ON supplements.rule_catalog USING gin(input_paths);
CREATE INDEX IF NOT EXISTS rule_catalog_substances_idx
  ON supplements.rule_catalog USING gin(substance_ids);

DROP TRIGGER IF EXISTS rule_catalog_touch_updated_at
  ON supplements.rule_catalog;
CREATE TRIGGER rule_catalog_touch_updated_at
  BEFORE UPDATE ON supplements.rule_catalog
  FOR EACH ROW EXECUTE FUNCTION supplements.touch_updated_at();

ALTER TABLE supplements.rule_catalog ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS rule_catalog_select ON supplements.rule_catalog;
CREATE POLICY rule_catalog_select
  ON supplements.rule_catalog FOR SELECT TO authenticated USING (true);

GRANT SELECT ON supplements.rule_catalog TO authenticated;
GRANT ALL ON supplements.rule_catalog TO service_role;

CREATE TEMP TABLE tmp_kimi_rules (payload jsonb NOT NULL) ON COMMIT DROP;
\\copy tmp_kimi_rules(payload) FROM STDIN WITH (FORMAT csv)
${payload}
\\.

INSERT INTO supplements.rule_catalog (
  rule_id, rule_type, rule_kind, severity, priority_lane, priority_rank,
  conditions, effects, message_key, message_de, recommended_action_type,
  modules_involved, input_paths, input_coverage_status, missing_input_paths,
  substance_ids, substance_group_ids, substance_names_for_display, evidence,
  gap_condition, source_file, source_version, raw
)
SELECT
  payload->>'rule_id',
  payload->>'rule_type',
  NULLIF(payload->>'rule_kind', ''),
  NULLIF(payload->>'severity', ''),
  NULLIF(payload->>'priority_lane', ''),
  NULLIF(payload->>'priority_rank', '')::integer,
  payload->'conditions',
  payload->'effects',
  payload->>'message_key',
  NULLIF(payload->>'message_de', ''),
  NULLIF(payload->>'recommended_action_type', ''),
  COALESCE(ARRAY(SELECT jsonb_array_elements_text(COALESCE(payload->'modules_involved', '[]'::jsonb))), '{}'),
  COALESCE(ARRAY(SELECT jsonb_array_elements_text(COALESCE(payload->'input_paths', '[]'::jsonb))), '{}'),
  payload->>'input_coverage_status',
  COALESCE(ARRAY(SELECT jsonb_array_elements_text(COALESCE(payload->'missing_input_paths', '[]'::jsonb))), '{}'),
  COALESCE(ARRAY(SELECT jsonb_array_elements_text(COALESCE(payload->'substance_ids', '[]'::jsonb))), '{}'),
  COALESCE(ARRAY(SELECT jsonb_array_elements_text(COALESCE(payload->'substance_group_ids', '[]'::jsonb))), '{}'),
  COALESCE(ARRAY(SELECT jsonb_array_elements_text(COALESCE(payload->'substance_names_for_display', '[]'::jsonb))), '{}'),
  COALESCE(payload->'evidence', '[]'::jsonb),
  NULLIF(payload->>'gap_condition', ''),
  payload->>'source_file',
  NULLIF(payload->>'source_version', '')::integer,
  payload->'raw'
FROM tmp_kimi_rules
ON CONFLICT (rule_id) DO UPDATE SET
  rule_type = EXCLUDED.rule_type,
  rule_kind = EXCLUDED.rule_kind,
  severity = EXCLUDED.severity,
  priority_lane = EXCLUDED.priority_lane,
  priority_rank = EXCLUDED.priority_rank,
  conditions = EXCLUDED.conditions,
  effects = EXCLUDED.effects,
  message_key = EXCLUDED.message_key,
  message_de = EXCLUDED.message_de,
  recommended_action_type = EXCLUDED.recommended_action_type,
  modules_involved = EXCLUDED.modules_involved,
  input_paths = EXCLUDED.input_paths,
  input_coverage_status = EXCLUDED.input_coverage_status,
  missing_input_paths = EXCLUDED.missing_input_paths,
  substance_ids = EXCLUDED.substance_ids,
  substance_group_ids = EXCLUDED.substance_group_ids,
  substance_names_for_display = EXCLUDED.substance_names_for_display,
  evidence = EXCLUDED.evidence,
  gap_condition = EXCLUDED.gap_condition,
  source_file = EXCLUDED.source_file,
  source_version = EXCLUDED.source_version,
  raw = EXCLUDED.raw,
  updated_at = now();

CREATE OR REPLACE FUNCTION supplements.rule_assessment(
  p_user_id UUID DEFAULT auth.uid(),
  p_entry_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  rule_id TEXT,
  rule_type TEXT,
  message_key TEXT,
  message_de TEXT,
  severity TEXT,
  recommended_action_type TEXT,
  evaluation_state TEXT,
  missing_inputs TEXT[],
  matched_context JSONB
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_auth_uid UUID := auth.uid();
  v_med_traits TEXT[];
  v_med_names TEXT[];
  v_med_risk_flags TEXT[];
  v_conditions TEXT[];
  v_stack_substances TEXT[];
  v_stack_items INTEGER;
  v_lab_names TEXT[];
  v_rule supplements.rule_catalog%ROWTYPE;
  v_missing TEXT[];
  v_group_missing TEXT[];
  v_ok BOOLEAN;
  v_condition JSONB;
  v_module TEXT;
  v_field TEXT;
  v_op TEXT;
  v_value JSONB;
  v_needed TEXT[];
  v_count INTEGER;
  v_protein_per_kg NUMERIC;
  v_training_week INTEGER;
  v_vitd_pct NUMERIC;
  v_mg_pct NUMERIC;
  v_input_status JSONB;
BEGIN
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'rule_assessment braucht user_id oder auth.uid()';
  END IF;
  IF v_auth_uid IS NOT NULL AND v_auth_uid <> p_user_id THEN
    RAISE EXCEPTION 'rule_assessment darf nur eigene Regeln auswerten';
  END IF;

  SELECT COALESCE(array_agg(DISTINCT trait), '{}') INTO v_med_traits
  FROM (
    SELECT unnest(um.drug_class || um.cyp_profile) AS trait
    FROM medical.user_medications um
    WHERE um.user_id = p_user_id
      AND um.is_active
      AND um.start_date <= p_entry_date
      AND (um.end_date IS NULL OR um.end_date >= p_entry_date)
  ) t
  WHERE trait IS NOT NULL AND btrim(trait) <> '';

  SELECT COALESCE(array_agg(DISTINCT lower(um.name)), '{}') INTO v_med_names
  FROM medical.user_medications um
  WHERE um.user_id = p_user_id
    AND um.is_active
    AND um.start_date <= p_entry_date
    AND (um.end_date IS NULL OR um.end_date >= p_entry_date);

  SELECT COALESCE(array_agg(DISTINCT key), '{}') INTO v_med_risk_flags
  FROM medical.user_medications um
  JOIN medical.medication_active_substances mas ON mas.id = um.active_substance_id
  CROSS JOIN LATERAL jsonb_object_keys(COALESCE(mas.risk_flags, '{}'::jsonb)) key
  WHERE um.user_id = p_user_id
    AND um.is_active
    AND um.start_date <= p_entry_date
    AND (um.end_date IS NULL OR um.end_date >= p_entry_date)
    AND COALESCE((mas.risk_flags->>key)::boolean, false);

  SELECT COALESCE(array_agg(DISTINCT condition_code), '{}') INTO v_conditions
  FROM medical.user_conditions
  WHERE user_id = p_user_id
    AND status IN ('active', 'planned', 'unknown')
    AND (start_date IS NULL OR start_date <= p_entry_date)
    AND (end_date IS NULL OR end_date >= p_entry_date);

  SELECT count(*) INTO v_stack_items
  FROM supplements.user_stacks us
  JOIN supplements.stack_items si ON si.stack_id = us.id
  WHERE us.user_id = p_user_id
    AND us.is_active
    AND si.is_active;

  SELECT COALESCE(array_agg(DISTINCT kimi_substance_id), '{}') INTO v_stack_substances
  FROM supplements.stack_item_substance_matches
  WHERE user_id = p_user_id
    AND is_active
    AND kimi_substance_id IS NOT NULL;

  SELECT COALESCE(array_agg(DISTINCT lower(v.marker_name_snapshot)), '{}') INTO v_lab_names
  FROM medical.lab_reports r
  JOIN medical.lab_result_values v ON v.report_id = r.id
  WHERE r.user_id = p_user_id
    AND r.report_date <= p_entry_date;

  SELECT round(ds.prot625 / NULLIF(p.body_weight_kg, 0), 3)
    INTO v_protein_per_kg
  FROM nutrition.daily_summary ds
  JOIN public.profiles p ON p.id = ds.user_id
  WHERE ds.user_id = p_user_id
    AND ds.entry_date = p_entry_date
    AND ds.prot625_missing = 0;

  SELECT count(*) INTO v_training_week
  FROM training.workout_sessions
  WHERE user_id = p_user_id
    AND status = 'completed'
    AND session_date BETWEEN p_entry_date - 6 AND p_entry_date;

  SELECT
    max(reference_pct) FILTER (WHERE nutrient_code = 'VITD'),
    max(reference_pct) FILTER (WHERE nutrient_code = 'MG')
  INTO v_vitd_pct, v_mg_pct
  FROM nutrition.daily_reference_assessment(p_user_id, p_entry_date)
  WHERE nutrient_code IN ('VITD', 'MG');

  SELECT COALESCE(jsonb_agg(to_jsonb(s)), '[]'::jsonb) INTO v_input_status
  FROM supplements.platform_input_status(p_user_id, p_entry_date) s;

  FOR v_rule IN
    SELECT *
    FROM supplements.rule_catalog
    ORDER BY priority_rank NULLS LAST, rule_id
  LOOP
    SELECT COALESCE(array_agg(DISTINCT s.input_path), '{}') INTO v_missing
    FROM jsonb_to_recordset(v_input_status) AS s(
      input_path text,
      input_status text,
      missing_reason text,
      detail jsonb
    )
    WHERE s.input_path = ANY(v_rule.input_paths)
      AND s.input_status IN ('missing_input', 'partial', 'incomplete');

    v_group_missing := '{}';
    IF EXISTS (
      SELECT 1
      FROM jsonb_array_elements(v_rule.conditions) c
      WHERE c->>'op' IN ('contains_any_group', 'count_group_gte')
    )
    AND COALESCE(array_length(v_rule.substance_ids, 1), 0) = 0
    AND COALESCE(array_length(v_rule.substance_group_ids, 1), 0) > 0 THEN
      v_group_missing := ARRAY['supplements.substance_group_membership'];
    END IF;

    IF COALESCE(array_length(v_missing, 1), 0) > 0
       OR COALESCE(array_length(v_group_missing, 1), 0) > 0 THEN
      rule_id := v_rule.rule_id;
      rule_type := v_rule.rule_type;
      message_key := v_rule.message_key;
      message_de := v_rule.message_de;
      severity := v_rule.severity;
      recommended_action_type := COALESCE(v_rule.recommended_action_type, 'physician_referral');
      evaluation_state := 'missing_input';
      missing_inputs := (SELECT ARRAY(SELECT DISTINCT unnest(v_missing || v_rule.missing_input_paths || v_group_missing)));
      matched_context := jsonb_build_object(
        'input_coverage_status', v_rule.input_coverage_status,
        'input_paths', v_rule.input_paths,
        'static_missing_inputs', v_rule.missing_input_paths
      );
      RETURN NEXT;
      CONTINUE;
    END IF;

    v_ok := true;
    FOR v_condition IN SELECT * FROM jsonb_array_elements(v_rule.conditions)
    LOOP
      v_module := v_condition->>'module';
      v_field := v_condition->>'field';
      v_op := v_condition->>'op';
      v_value := v_condition->'value';
      v_needed := '{}';

      IF v_module = 'medical' AND v_field IN ('medications[].drug_class', 'medications[].cyp_profile') THEN
        IF v_op = 'contains' THEN
          v_ok := v_ok AND (v_value #>> '{}' = ANY(v_med_traits));
        ELSIF v_op = 'contains_any' THEN
          SELECT COALESCE(array_agg(elem), '{}') INTO v_needed FROM jsonb_array_elements_text(v_value) elem;
          v_ok := v_ok AND (v_med_traits && v_needed);
        ELSE
          v_ok := false;
        END IF;
      ELSIF v_module = 'medical' AND v_field = 'medications' THEN
        IF v_op = 'contains_cyp_substrate' THEN
          v_ok := v_ok AND ((v_value->>'enzyme') || '_substrate' = ANY(v_med_traits));
        ELSIF v_op = 'contains_cyp_inducer' THEN
          v_ok := v_ok AND ((v_value->>'enzyme') || '_inducer' = ANY(v_med_traits));
        ELSIF v_op = 'contains_cyp_inhibitor' THEN
          v_ok := v_ok AND ((v_value->>'enzyme') || '_inhibitor' = ANY(v_med_traits));
        ELSIF v_op = 'contains_medication' THEN
          v_ok := v_ok AND lower(v_value #>> '{}') = ANY(v_med_names);
        ELSIF v_op = 'contains_any_class' THEN
          SELECT COALESCE(array_agg(elem), '{}') INTO v_needed
          FROM jsonb_array_elements(v_value) outer_arr,
               jsonb_array_elements_text(outer_arr) elem;
          v_ok := v_ok AND (v_med_traits && v_needed);
        ELSIF v_op = 'count_risk_flag_gte' THEN
          SELECT count(*) INTO v_count FROM unnest(v_med_risk_flags) f WHERE f = v_value->>'flag';
          v_ok := v_ok AND v_count >= COALESCE((v_value->>'count')::integer, 1);
        ELSE
          v_ok := false;
        END IF;
      ELSIF v_module = 'supplements' AND v_field = 'stack' THEN
        IF v_op IN ('contains_any_substance', 'contains_any_group') THEN
          v_ok := v_ok AND (v_stack_substances && v_rule.substance_ids);
        ELSIF v_op = 'count_group_gte' THEN
          SELECT count(*) INTO v_count FROM unnest(v_stack_substances) s WHERE s = ANY(v_rule.substance_ids);
          v_ok := v_ok AND v_count >= COALESCE((v_value->>'count')::integer, 1);
        ELSE
          v_ok := false;
        END IF;
      ELSIF v_module = 'supplements' AND v_field = 'daily_total_mg' THEN
        v_ok := false;
      ELSIF v_module = 'medical' AND v_field = 'conditions' AND v_op = 'contains_any' THEN
        SELECT COALESCE(array_agg(elem), '{}') INTO v_needed FROM jsonb_array_elements_text(v_value) elem;
        v_ok := v_ok AND (v_conditions && v_needed);
      ELSIF v_module = 'medical' AND v_field = 'labs' AND v_op = 'missing_analyte_within_months' THEN
        v_ok := v_ok AND NOT EXISTS (
          SELECT 1 FROM unnest(v_lab_names) n WHERE n LIKE '%' || lower(v_value->>'analyte') || '%'
        );
      ELSIF v_module = 'medical' AND v_field = 'labs[].analyte' THEN
        IF v_op = 'contains_any' THEN
          SELECT COALESCE(array_agg(lower(elem)), '{}') INTO v_needed FROM jsonb_array_elements_text(v_value) elem;
          v_ok := v_ok AND EXISTS (
            SELECT 1 FROM unnest(v_lab_names) n JOIN unnest(v_needed) w ON n LIKE '%' || w || '%'
          );
        ELSE
          v_ok := false;
        END IF;
      ELSIF v_field = '(see gap_condition)' THEN
        IF v_rule.rule_id = 'gap_protein_training' THEN
          v_ok := v_ok AND COALESCE(v_protein_per_kg < 1.2 AND v_training_week >= 2, false);
        ELSIF v_rule.rule_id = 'gap_magnesium_intake' THEN
          v_ok := v_ok AND COALESCE(v_mg_pct < 80, false);
        ELSIF v_rule.rule_id = 'gap_folate_pregnancy_plan' THEN
          v_ok := v_ok AND EXISTS (
            SELECT 1
            FROM jsonb_to_recordset(v_input_status) AS s(
              input_path text,
              input_status text,
              missing_reason text,
              detail jsonb
            )
            WHERE input_path = 'profile.pregnancy_planned'
              AND detail->>'pregnancy_planned' = 'true'
          );
        ELSE
          v_ok := false;
        END IF;
      ELSE
        v_ok := false;
      END IF;
    END LOOP;

    rule_id := v_rule.rule_id;
    rule_type := v_rule.rule_type;
    message_key := v_rule.message_key;
    message_de := v_rule.message_de;
    severity := v_rule.severity;
    recommended_action_type := CASE
      WHEN v_rule.rule_type = 'nutrient_gap' THEN COALESCE(v_rule.recommended_action_type, 'information')
      ELSE COALESCE(v_rule.recommended_action_type, 'physician_referral')
    END;
    evaluation_state := CASE WHEN v_ok THEN 'fulfilled' ELSE 'not_fulfilled' END;
    missing_inputs := '{}';
    matched_context := jsonb_build_object(
      'medication_traits', v_med_traits,
      'stack_substances', v_stack_substances,
      'conditions', v_conditions,
      'protein_g_per_kg', v_protein_per_kg,
      'resistance_sessions_7d', v_training_week,
      'rule_substance_ids', v_rule.substance_ids
    );
    RETURN NEXT;
  END LOOP;
END;
$$;

COMMENT ON TABLE supplements.rule_catalog IS
  'C-133: Kimi-Warn-, Gap- und Medikamentenregeln als Katalogdaten. Keine Dosierungsempfehlung; Risiko-Effekt ist physician_referral.';
COMMENT ON FUNCTION supplements.rule_assessment(UUID, DATE) IS
  'C-133: Nutzerbezogene dreistufige Regelauswertung: fulfilled, not_fulfilled, missing_input. SECURITY INVOKER und auth.uid-Schutz.';

GRANT EXECUTE ON FUNCTION supplements.rule_assessment(UUID, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION supplements.rule_assessment(UUID, DATE) TO service_role;

DO $$
DECLARE
  v_warning integer;
  v_gap integer;
  v_medication integer;
BEGIN
  SELECT count(*) FILTER (WHERE rule_type = 'warning'),
         count(*) FILTER (WHERE rule_type = 'nutrient_gap'),
         count(*) FILTER (WHERE rule_type = 'medication')
  INTO v_warning, v_gap, v_medication
  FROM supplements.rule_catalog;

  IF v_warning <> ${EXPECTED_COUNTS.warning} THEN
    RAISE EXCEPTION 'C-133 warning_rules: %, erwartet ${EXPECTED_COUNTS.warning}', v_warning;
  END IF;
  IF v_gap <> ${EXPECTED_COUNTS.nutrient_gap} THEN
    RAISE EXCEPTION 'C-133 nutrient_gap_rules: %, erwartet ${EXPECTED_COUNTS.nutrient_gap}', v_gap;
  END IF;
  IF v_medication <> ${EXPECTED_COUNTS.medication} THEN
    RAISE EXCEPTION 'C-133 medication_rules: %, erwartet ${EXPECTED_COUNTS.medication}', v_medication;
  END IF;

  RAISE NOTICE 'OK C-133: Regeln warning %, gap %, medication %',
    v_warning, v_gap, v_medication;
END $$;

COMMIT;
`

const result = spawnSync(
  'docker',
  ['exec', '-i', CONTAINER, 'psql', '-U', 'postgres', '-d', DB, '-v', 'ON_ERROR_STOP=1', '-f', '-'],
  { input: sql, encoding: 'utf8', maxBuffer: 128 * 1024 * 1024 },
)
if (result.stdout) process.stdout.write(result.stdout)
if (result.stderr) process.stderr.write(result.stderr)
if (result.status !== 0) process.exit(result.status ?? 1)

console.log(`C-133: ${rows.length} Regeln importiert`)
