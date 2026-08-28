-- C-328: count_risk_flag_gte zaehlt nur true-Flags je unterschiedlichem
-- Wirkstoff. Mehrere Erfassungen desselben Wirkstoffs sind keine Kombination.
CREATE OR REPLACE FUNCTION supplements.rule_operator_supported(
  p_rule_id TEXT,
  p_module TEXT,
  p_field TEXT,
  p_operator TEXT
)
RETURNS BOOLEAN
LANGUAGE sql
IMMUTABLE
SET search_path = ''
AS $$
  SELECT CASE
    WHEN p_operator = 'contains'
      AND p_module = 'medical'
      AND p_field IN ('medications[].drug_class', 'medications[].cyp_profile') THEN true
    WHEN p_operator = 'contains_any'
      AND p_module = 'medical'
      AND p_field IN ('conditions', 'labs[].analyte', 'medications[].drug_class') THEN true
    WHEN p_operator = 'contains_any_class'
      AND p_module = 'medical' AND p_field = 'medications' THEN true
    WHEN p_operator IN ('contains_any_group', 'contains_any_substance', 'count_group_gte')
      AND p_module = 'supplements' AND p_field = 'stack' THEN true
    WHEN p_operator IN ('contains_cyp_inducer', 'contains_cyp_inhibitor', 'contains_cyp_substrate',
                         'contains_medication', 'count_risk_flag_gte')
      AND p_module = 'medical' AND p_field = 'medications' THEN true
    WHEN p_operator IN ('missing_analyte_within_months', 'lab_above')
      AND p_module = 'medical' AND p_field = 'labs'
      AND (p_operator <> 'lab_above' OR p_rule_id IN (
        'wr_drug_hyperkalemia_lab',
        'wr_drug_testosterone_hct'
      )) THEN true
    -- C-133 kennt drei individuell implementierte DSL-Regeln.
    WHEN p_operator = 'dsl'
      AND p_rule_id IN ('gap_protein_training', 'gap_magnesium_intake', 'gap_folate_pregnancy_plan') THEN true
    ELSE false
  END;
$$;

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
  v_unsupported_operators TEXT[];
  v_unsupported_conditions JSONB;
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

  -- Ein Flag wird pro aktivem Wirkstoff gezaehlt, nicht pro Schluessel und
  -- nicht pro doppelt erfasstem Produkt. Nur true darf eine Risiko-Kombination
  -- tragen.
  SELECT COALESCE(array_agg(flag_key), '{}') INTO v_med_risk_flags
  FROM (
    SELECT mas.id, key AS flag_key
    FROM medical.user_medications um
    JOIN medical.medication_active_substances mas ON mas.id = um.active_substance_id
    CROSS JOIN LATERAL jsonb_object_keys(COALESCE(mas.risk_flags, '{}'::jsonb)) key
    WHERE um.user_id = p_user_id
      AND um.is_active
      AND um.start_date <= p_entry_date
      AND (um.end_date IS NULL OR um.end_date >= p_entry_date)
      AND COALESCE((mas.risk_flags->>key)::boolean, false)
    GROUP BY mas.id, key
  ) counted_flags;

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

  SELECT COALESCE(array_agg(DISTINCT s.slug), '{}') INTO v_stack_substances
  FROM supplements.user_stacks us
  JOIN supplements.stack_items si ON si.stack_id = us.id
  JOIN supplements.supplements s ON s.id = si.supplement_id
  WHERE us.user_id = p_user_id
    AND us.is_active
    AND si.is_active
    AND s.slug LIKE 'sub\_%' ESCAPE '\';

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
    -- Rekursiv, damit ein innerer Operator unter any_of nicht verborgen bleibt.
    SELECT
      COALESCE(array_agg(DISTINCT condition->>'op' ORDER BY condition->>'op'), '{}'),
      COALESCE(jsonb_agg(DISTINCT condition), '[]'::jsonb)
    INTO v_unsupported_operators, v_unsupported_conditions
    FROM jsonb_path_query(v_rule.conditions, '$.** ? (@.op.type() == "string")') condition
    WHERE NOT supplements.rule_operator_supported(
      v_rule.rule_id,
      COALESCE(condition->>'module', ''),
      COALESCE(condition->>'field', ''),
      condition->>'op'
    );

    IF COALESCE(array_length(v_unsupported_operators, 1), 0) > 0 THEN
      rule_id := v_rule.rule_id;
      rule_type := v_rule.rule_type;
      message_key := v_rule.message_key;
      message_de := v_rule.message_de;
      severity := v_rule.severity;
      recommended_action_type := COALESCE(v_rule.recommended_action_type, 'physician_referral');
      evaluation_state := 'unsupported_operator';
      missing_inputs := '{}';
      matched_context := jsonb_build_object(
        'unsupported_operators', v_unsupported_operators,
        'unsupported_conditions', v_unsupported_conditions,
        'input_coverage_status', v_rule.input_coverage_status,
        'input_paths', v_rule.input_paths,
        'static_missing_inputs', v_rule.missing_input_paths
      );
      RETURN NEXT;
      CONTINUE;
    END IF;

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
      ELSIF v_module = 'medical' AND v_field = 'labs' AND v_op = 'lab_above' THEN
        -- Nur exakt benannte, sicher normalisierbare Messwerte zaehlen. Ein
        -- anderer Analyt oder eine unbekannte Einheit darf keine Warnung ausloesen.
        v_ok := v_ok AND EXISTS (
          SELECT 1
          FROM medical.lab_reports r
          JOIN medical.lab_result_values lv
            ON lv.report_id = r.id
           AND lv.user_id = r.user_id
          CROSS JOIN LATERAL (
            SELECT CASE
              WHEN lower(btrim(v_value->>'analyte')) IN ('hematocrit', 'haematocrit', 'haematokrit')
               AND lower(btrim(lv.unit_snapshot)) IN ('%', 'percent', 'prozent')
                THEN lv.value_numeric / 100
              WHEN lower(btrim(v_value->>'analyte')) IN ('hematocrit', 'haematocrit', 'haematokrit')
               AND lower(btrim(lv.unit_snapshot)) IN ('l/l', 'fraction', 'ratio')
                THEN lv.value_numeric
              WHEN lower(btrim(v_value->>'analyte')) IN ('potassium', 'kalium')
               AND lower(replace(btrim(lv.unit_snapshot), ' ', '')) IN ('mmol/l', 'mmol/liter')
                THEN lv.value_numeric
              ELSE NULL
            END AS normalized_value
          ) normalized
          WHERE r.user_id = p_user_id
            AND r.report_date <= p_entry_date
            AND lower(btrim(lv.marker_name_snapshot)) = lower(btrim(v_value->>'analyte'))
            AND lv.value_numeric IS NOT NULL
            AND normalized.normalized_value > (v_value->>'value')::numeric
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

COMMENT ON FUNCTION supplements.rule_operator_supported(TEXT, TEXT, TEXT, TEXT) IS
  'C-313b/C-313 Weg 2/C-328: Zentraler Operatorvertrag fuer rule_assessment und den Gate-Waechter.';
COMMENT ON FUNCTION supplements.rule_assessment(UUID, DATE) IS
  'C-133/C-313b/C-313 Weg 2/C-328: Nutzerbezogene Regelauswertung mit counted true risk flags sowie fulfilled, not_fulfilled, missing_input oder unsupported_operator.';

GRANT EXECUTE ON FUNCTION supplements.rule_operator_supported(TEXT, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION supplements.rule_operator_supported(TEXT, TEXT, TEXT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION supplements.rule_assessment(UUID, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION supplements.rule_assessment(UUID, DATE) TO service_role;

