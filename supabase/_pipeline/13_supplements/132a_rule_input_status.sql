-- =============================================================
-- 132a -- Kimi-Regeln: Eingangsstatus statt stilles Durchfallen (C-132)
-- Datum: 2026-08-20
-- Zweck: Plattformpfade aus module_field_spec.json als aufloesbare
--        Eingaben ausweisen. Regeln selbst werden hier NICHT importiert.
--
-- Ergebnis:
--   supplements.platform_input_status(user_id, date) liefert je Pfad
--   available / no_data / partial / incomplete / missing_input.
-- =============================================================

BEGIN;

CREATE OR REPLACE FUNCTION supplements.platform_input_status(
  p_user_id UUID,
  p_entry_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  input_path TEXT,
  input_status TEXT,
  missing_reason TEXT,
  detail JSONB
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_stack_items integer;
  v_stack_matches integer;
  v_medications integer;
  v_conditions integer;
  v_labs integer;
  v_daily integer;
  v_age integer;
  v_profile_weight numeric;
  v_profile_sex text;
  v_pregnancy_planned boolean;
  v_training_week integer;
BEGIN
  SELECT count(*) INTO v_stack_items
  FROM supplements.user_stacks us
  JOIN supplements.stack_items si ON si.stack_id = us.id
  WHERE us.user_id = p_user_id
    AND us.is_active
    AND si.is_active;

  SELECT count(DISTINCT si.id) INTO v_stack_matches
  FROM supplements.user_stacks us
  JOIN supplements.stack_items si ON si.stack_id = us.id
  JOIN supplements.supplements s ON s.id = si.supplement_id
  WHERE us.user_id = p_user_id
    AND us.is_active
    AND si.is_active
    AND s.slug LIKE 'sub\_%' ESCAPE '\';

  SELECT count(*) INTO v_medications
  FROM medical.user_medications
  WHERE user_id = p_user_id
    AND is_active
    AND start_date <= p_entry_date
    AND (end_date IS NULL OR end_date >= p_entry_date);

  SELECT count(*) INTO v_conditions
  FROM medical.user_conditions
  WHERE user_id = p_user_id
    AND status IN ('active', 'planned', 'unknown')
    AND (start_date IS NULL OR start_date <= p_entry_date)
    AND (end_date IS NULL OR end_date >= p_entry_date);

  SELECT count(*) INTO v_labs
  FROM medical.lab_reports r
  JOIN medical.lab_result_values v ON v.report_id = r.id
  WHERE r.user_id = p_user_id
    AND r.report_date <= p_entry_date;

  SELECT count(*) INTO v_daily
  FROM nutrition.daily_summary
  WHERE user_id = p_user_id
    AND entry_date = p_entry_date;

  SELECT
    date_part('year', age(p_entry_date, birth_date))::integer,
    body_weight_kg,
    biological_sex,
    CASE
      WHEN pregnancy_started_on IS NOT NULL
       AND pregnancy_started_on <= p_entry_date
       AND (pregnancy_ended_on IS NULL OR pregnancy_ended_on >= p_entry_date)
      THEN true
      ELSE false
    END
  INTO v_age, v_profile_weight, v_profile_sex, v_pregnancy_planned
  FROM public.profiles
  WHERE id = p_user_id;

  SELECT count(*) INTO v_training_week
  FROM training.workout_sessions
  WHERE user_id = p_user_id
    AND status = 'completed'
    AND session_date BETWEEN p_entry_date - 6 AND p_entry_date;

  RETURN QUERY VALUES
    (
      'medical.medications',
      CASE WHEN v_medications > 0 THEN 'available' ELSE 'no_data' END,
      CASE WHEN v_medications > 0 THEN NULL ELSE 'no active medication rows for day' END,
      jsonb_build_object('active_medications', v_medications)
    ),
    (
      'medical.medications[].drug_class',
      CASE WHEN v_medications > 0 THEN 'available' ELSE 'no_data' END,
      CASE WHEN v_medications > 0 THEN NULL ELSE 'no active medication rows for day' END,
      jsonb_build_object('active_medications', v_medications)
    ),
    (
      'medical.medications[].cyp_profile',
      CASE WHEN v_medications > 0 THEN 'available' ELSE 'no_data' END,
      CASE WHEN v_medications > 0 THEN NULL ELSE 'no active medication rows for day' END,
      jsonb_build_object('active_medications', v_medications)
    ),
    (
      'medical.conditions',
      CASE WHEN v_conditions > 0 THEN 'available' ELSE 'no_data' END,
      CASE WHEN v_conditions > 0 THEN NULL ELSE 'no active condition rows for day' END,
      jsonb_build_object('active_conditions', v_conditions)
    ),
    (
      'medical.labs',
      CASE WHEN v_labs > 0 THEN 'available' ELSE 'no_data' END,
      CASE WHEN v_labs > 0 THEN NULL ELSE 'no lab values up to day' END,
      jsonb_build_object('lab_values_up_to_day', v_labs)
    ),
    (
      'supplements.stack',
      CASE WHEN v_stack_items > 0 THEN 'available' ELSE 'no_data' END,
      CASE WHEN v_stack_items > 0 THEN NULL ELSE 'no active stack items' END,
      jsonb_build_object('active_stack_items', v_stack_items)
    ),
    (
      'supplements.stack_item.substance_id',
      CASE
        WHEN v_stack_items = 0 THEN 'no_data'
        WHEN v_stack_matches = v_stack_items THEN 'available'
        WHEN v_stack_matches > 0 THEN 'partial'
        ELSE 'missing_input'
      END,
      CASE
        WHEN v_stack_items = 0 THEN 'no active stack items'
        WHEN v_stack_matches = v_stack_items THEN NULL
        WHEN v_stack_matches > 0 THEN 'some stack items have no Kimi substance bridge'
        ELSE 'no stack item has a Kimi substance bridge'
      END,
      jsonb_build_object('active_stack_items', v_stack_items, 'matched_stack_items', v_stack_matches)
    ),
    (
      'supplements.daily_totals',
      CASE
        WHEN v_stack_items = 0 THEN 'no_data'
        WHEN v_stack_matches = v_stack_items THEN 'available'
        WHEN v_stack_matches > 0 THEN 'partial'
        ELSE 'missing_input'
      END,
      CASE
        WHEN v_stack_items = 0 THEN 'no active stack items'
        WHEN v_stack_matches = v_stack_items THEN NULL
        WHEN v_stack_matches > 0 THEN 'daily totals can only be computed for bridged stack items'
        ELSE 'daily totals need substance bridge'
      END,
      jsonb_build_object('active_stack_items', v_stack_items, 'matched_stack_items', v_stack_matches)
    ),
    (
      'supplements.daily_total_mg',
      CASE
        WHEN v_stack_items = 0 THEN 'no_data'
        WHEN v_stack_matches = v_stack_items THEN 'available'
        WHEN v_stack_matches > 0 THEN 'partial'
        ELSE 'missing_input'
      END,
      CASE
        WHEN v_stack_items = 0 THEN 'no active stack items'
        WHEN v_stack_matches = v_stack_items THEN NULL
        WHEN v_stack_matches > 0 THEN 'daily total mg can only be computed for bridged stack items'
        ELSE 'daily total mg needs substance bridge'
      END,
      jsonb_build_object('active_stack_items', v_stack_items, 'matched_stack_items', v_stack_matches)
    ),
    (
      'nutrition.daily.protein_g',
      CASE
        WHEN v_daily = 0 THEN 'no_data'
        WHEN EXISTS (
          SELECT 1 FROM nutrition.daily_summary
          WHERE user_id = p_user_id AND entry_date = p_entry_date
            AND prot625_missing = 0
        ) THEN 'available'
        ELSE 'incomplete'
      END,
      CASE
        WHEN v_daily = 0 THEN 'no daily_summary row'
        WHEN EXISTS (
          SELECT 1 FROM nutrition.daily_summary
          WHERE user_id = p_user_id AND entry_date = p_entry_date
            AND prot625_missing = 0
        ) THEN NULL
        ELSE 'protein has missing counter'
      END,
      COALESCE((
        SELECT jsonb_build_object('protein_g', prot625, 'missing', prot625_missing)
        FROM nutrition.daily_summary
        WHERE user_id = p_user_id AND entry_date = p_entry_date
      ), '{}'::jsonb)
    ),
    (
      'nutrition.protein_intake_g_per_kg',
      CASE
        WHEN v_daily = 0 THEN 'no_data'
        WHEN v_profile_weight IS NULL THEN 'missing_input'
        WHEN EXISTS (
          SELECT 1 FROM nutrition.daily_summary
          WHERE user_id = p_user_id AND entry_date = p_entry_date
            AND prot625_missing = 0
        ) THEN 'available'
        ELSE 'incomplete'
      END,
      CASE
        WHEN v_daily = 0 THEN 'no daily_summary row'
        WHEN v_profile_weight IS NULL THEN 'profile body_weight_kg missing'
        WHEN EXISTS (
          SELECT 1 FROM nutrition.daily_summary
          WHERE user_id = p_user_id AND entry_date = p_entry_date
            AND prot625_missing = 0
        ) THEN NULL
        ELSE 'protein has missing counter'
      END,
      COALESCE((
        SELECT jsonb_build_object(
          'protein_g', prot625,
          'body_weight_kg', v_profile_weight,
          'protein_g_per_kg',
          CASE WHEN v_profile_weight > 0 THEN round(prot625 / v_profile_weight, 3) ELSE NULL END,
          'missing', prot625_missing
        )
        FROM nutrition.daily_summary
        WHERE user_id = p_user_id AND entry_date = p_entry_date
      ), jsonb_build_object('body_weight_kg', v_profile_weight))
    ),
    (
      'nutrition.d_vitamin_dietary_low',
      CASE
        WHEN v_daily = 0 THEN 'no_data'
        WHEN EXISTS (
          SELECT 1 FROM nutrition.daily_reference_assessment(p_user_id, p_entry_date)
          WHERE nutrient_code = 'VITD'
            AND reference_status = 'complete'
            AND reference_pct IS NOT NULL
        ) THEN 'available'
        ELSE 'partial'
      END,
      CASE
        WHEN v_daily = 0 THEN 'no daily_summary row'
        WHEN EXISTS (
          SELECT 1 FROM nutrition.daily_reference_assessment(p_user_id, p_entry_date)
          WHERE nutrient_code = 'VITD'
            AND reference_status = 'complete'
            AND reference_pct IS NOT NULL
        ) THEN NULL
        ELSE 'vitamin D assessment not complete for day'
      END,
      COALESCE((
        SELECT jsonb_build_object('reference_pct', reference_pct, 'reference_status', reference_status)
        FROM nutrition.daily_reference_assessment(p_user_id, p_entry_date)
        WHERE nutrient_code = 'VITD'
        LIMIT 1
      ), '{}'::jsonb)
    ),
    (
      'nutrition.magnesium_dietary_low',
      CASE
        WHEN v_daily = 0 THEN 'no_data'
        WHEN EXISTS (
          SELECT 1 FROM nutrition.daily_reference_assessment(p_user_id, p_entry_date)
          WHERE nutrient_code = 'MG'
            AND reference_status = 'complete'
            AND reference_pct IS NOT NULL
        ) THEN 'available'
        ELSE 'partial'
      END,
      CASE
        WHEN v_daily = 0 THEN 'no daily_summary row'
        WHEN EXISTS (
          SELECT 1 FROM nutrition.daily_reference_assessment(p_user_id, p_entry_date)
          WHERE nutrient_code = 'MG'
            AND reference_status = 'complete'
            AND reference_pct IS NOT NULL
        ) THEN NULL
        ELSE 'magnesium assessment not complete for day'
      END,
      COALESCE((
        SELECT jsonb_build_object('reference_pct', reference_pct, 'reference_status', reference_status)
        FROM nutrition.daily_reference_assessment(p_user_id, p_entry_date)
        WHERE nutrient_code = 'MG'
        LIMIT 1
      ), '{}'::jsonb)
    ),
    (
      'nutrition.caffeine_mg_day',
      'partial',
      'caffeine is not a dedicated daily_summary nutrient; only indirect food records exist',
      '{}'::jsonb
    ),
    (
      'profile.age',
      CASE WHEN v_age IS NULL THEN 'missing_input' ELSE 'available' END,
      CASE WHEN v_age IS NULL THEN 'profile birth_date missing' ELSE NULL END,
      jsonb_build_object('age', v_age)
    ),
    (
      'profile.sex',
      CASE WHEN v_profile_sex IS NULL THEN 'missing_input' ELSE 'available' END,
      CASE WHEN v_profile_sex IS NULL THEN 'profile biological_sex missing' ELSE NULL END,
      jsonb_build_object('sex', v_profile_sex)
    ),
    (
      'profile.pregnancy_planned',
      'available',
      NULL,
      jsonb_build_object('pregnancy_planned', v_pregnancy_planned)
    ),
    (
      'training.resistance_sessions_per_week',
      CASE WHEN v_training_week > 0 THEN 'available' ELSE 'no_data' END,
      CASE WHEN v_training_week > 0 THEN NULL ELSE 'no completed training sessions in 7 day window' END,
      jsonb_build_object('completed_sessions_7d', v_training_week)
    ),
    (
      'training.load_spike',
      'no_data',
      'ACWR was removed from recovery scoring in C-215; no load spike model is built',
      jsonb_build_object('completed_sessions_7d', v_training_week)
    ),
    (
      'sleep.sleep_latency_min',
      'missing_input',
      'sleep schema is not built',
      '{}'::jsonb
    ),
    (
      'medical.symptoms',
      'missing_input',
      'symptoms table is not built',
      '{}'::jsonb
    ),
    (
      'medical.lab_draw_scheduled_within_days',
      'missing_input',
      'scheduled lab draw model is not built',
      '{}'::jsonb
    ),
    (
      'nutrition.daily.fish_servings_week',
      'missing_input',
      'fish servings are not derived from meal_items',
      '{}'::jsonb
    ),
    (
      'nutrition.daily.dairy_servings_day',
      'missing_input',
      'dairy servings are not derived from meal_items',
      '{}'::jsonb
    ),
    (
      'profile.athlete_tested_pool',
      'missing_input',
      'profile has no athlete_tested_pool field',
      '{}'::jsonb
    ),
    (
      'lifestyle.indoor_dominant',
      'missing_input',
      'lifestyle/profile has no indoor_dominant field',
      '{}'::jsonb
    ),
    (
      'location.low_sun',
      'missing_input',
      'location/climate input is not built',
      '{}'::jsonb
    ),
    (
      'supplements.computed.stimulant_load_mg_caffeine_equiv',
      'missing_input',
      'stimulant equivalence computation is not built',
      '{}'::jsonb
    ),
    (
      'sleep.quality_score',
      'missing_input',
      'sleep schema is not built',
      '{}'::jsonb
    ),
    (
      'sleep.tracked_nights',
      'missing_input',
      'sleep schema is not built',
      '{}'::jsonb
    );
END;
$$;

COMMENT ON FUNCTION supplements.platform_input_status(UUID, DATE) IS
  'C-132: Diagnostik fuer Kimi-Regel-Eingaenge. Fehlen wird als missing_input/no_data/partial gemeldet, nicht als false.';

GRANT EXECUTE ON FUNCTION supplements.platform_input_status(UUID, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION supplements.platform_input_status(UUID, DATE) TO service_role;

DO $$
DECLARE
  v_has_missing boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'supplements'
      AND p.proname = 'platform_input_status'
  ) INTO v_has_missing;

  IF NOT v_has_missing THEN
    RAISE EXCEPTION 'C-132: platform_input_status fehlt';
  END IF;

  RAISE NOTICE 'OK C-132: platform_input_status meldet fehlende Regel-Eingaenge ausdruecklich';
END $$;

COMMIT;
