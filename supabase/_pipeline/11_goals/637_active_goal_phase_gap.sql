-- G-637: Eine Phasenluecke bei aktivem Steuerziel bleibt eine markierte
-- Erhaltung; der letzte abgeschlossene Abschnitt ist separat lesbar.
BEGIN;

CREATE FUNCTION goals.ziel_ohne_laufende_phase_am(
  p_user_id uuid, p_stichtag date DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  goal_id uuid, letzte_phase_id uuid, letzte_phase_ende date,
  recommended_next text
)
LANGUAGE sql STABLE SECURITY INVOKER SET search_path='' AS $$
  SELECT g.id, letzte.id, letzte.actual_end_date, letzte.recommended_next
  FROM goals.user_goals g
  LEFT JOIN LATERAL (
    SELECT p.id,p.actual_end_date,p.recommended_next
    FROM goals.goal_phases p
    WHERE p.goal_id=g.id AND p.user_id=g.user_id
      AND p.actual_end_date<p_stichtag
    ORDER BY p.gueltig_ab DESC,p.created_at DESC,p.id DESC
    LIMIT 1
  ) letzte ON true
  WHERE g.user_id=p_user_id AND g.goal_role='controlling'
    AND g.status='active' AND g.gueltig_ab<=p_stichtag
    AND NOT EXISTS (SELECT 1 FROM goals.phase_am(p_user_id,p_stichtag))
  LIMIT 1;
$$;
REVOKE ALL ON FUNCTION goals.ziel_ohne_laufende_phase_am(uuid,date)
  FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION goals.ziel_ohne_laufende_phase_am(uuid,date)
  TO authenticated,service_role;

ALTER FUNCTION goals.berechne_zielwerte(uuid,date)
  RENAME TO berechne_zielwerte_g637_basis;
CREATE FUNCTION goals.berechne_zielwerte(
  p_user_id uuid, p_stichtag date DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  bmr numeric,tdee numeric,kcal numeric,protein_g numeric,
  carbs_g numeric,fat_g numeric,fiber_g numeric,
  linoleic_acid_g numeric,alpha_linolenic_acid_g numeric,
  nutrition_goal text,kalorienfaktor numeric,hindernis text,
  fehlende_felder text[],tdee_herkunft text,tdee_history_id uuid,
  zielrate_pct_kg_woche numeric,body_weight_kg numeric,goal_id uuid,
  letzte_phase_id uuid,letzte_phase_ende date,recommended_next text
)
LANGUAGE sql STABLE SECURITY INVOKER SET search_path='' AS $$
  SELECT b.bmr,b.tdee,b.kcal,b.protein_g,b.carbs_g,b.fat_g,
    b.fiber_g,b.linoleic_acid_g,b.alpha_linolenic_acid_g,
    b.nutrition_goal,b.kalorienfaktor,
    CASE WHEN gap.goal_id IS NOT NULL AND b.hindernis='kein_aktives_ziel'
      THEN 'ziel_ohne_laufende_phase' ELSE b.hindernis END,
    b.fehlende_felder,b.tdee_herkunft,b.tdee_history_id,
    b.zielrate_pct_kg_woche,b.body_weight_kg,
    coalesce(gap.goal_id,b.goal_id),gap.letzte_phase_id,
    gap.letzte_phase_ende,gap.recommended_next
  FROM goals.berechne_zielwerte_g637_basis(p_user_id,p_stichtag) b
  LEFT JOIN LATERAL goals.ziel_ohne_laufende_phase_am(
    p_user_id,p_stichtag) gap ON true;
$$;
REVOKE ALL ON FUNCTION goals.berechne_zielwerte(uuid,date)
  FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION goals.berechne_zielwerte(uuid,date)
  TO authenticated,service_role;

ALTER FUNCTION nutrition.daily_reference_assessment(uuid,date)
  RENAME TO daily_reference_assessment_g637_basis;
CREATE FUNCTION nutrition.daily_reference_assessment(
  p_user_id uuid,p_entry_date date
)
RETURNS TABLE (
  user_id uuid,entry_date date,nutrient_code text,nutrient_name_de text,
  nutrient_unit text,nutrient_display_tier integer,actual_value numeric,
  missing_count integer,value_complete boolean,reference_kind text,
  reference_direction text,reference_value_min numeric,
  reference_value_max numeric,reference_unit text,reference_basis text,
  reference_applies_to_intake_sources text[],reference_pct numeric,
  reference_pct_min numeric,reference_pct_max numeric,reference_status text,
  profile_age_years integer,profile_biological_sex text,
  profile_is_pregnant boolean,profile_is_lactating boolean,
  source text,source_locator text,notes text
)
LANGUAGE sql STABLE SECURITY INVOKER SET search_path='' AS $$
  SELECT a.user_id,a.entry_date,a.nutrient_code,a.nutrient_name_de,
    a.nutrient_unit,a.nutrient_display_tier,a.actual_value,
    a.missing_count,a.value_complete,a.reference_kind,
    a.reference_direction,a.reference_value_min,a.reference_value_max,
    a.reference_unit,
    CASE WHEN a.nutrient_code IN ('F18:2CN6','F18:3CN3')
      AND a.reference_kind='AI'
      AND a.reference_basis='goals_target_from_energy_percent'
      AND EXISTS (SELECT 1 FROM goals.ziel_ohne_laufende_phase_am(
        p_user_id,p_entry_date))
      THEN 'maintenance_active_goal_without_phase'
      ELSE a.reference_basis END,
    a.reference_applies_to_intake_sources,a.reference_pct,
    a.reference_pct_min,a.reference_pct_max,a.reference_status,
    a.profile_age_years,a.profile_biological_sex,a.profile_is_pregnant,
    a.profile_is_lactating,a.source,a.source_locator,a.notes
  FROM nutrition.daily_reference_assessment_g637_basis(
    p_user_id,p_entry_date) a;
$$;
REVOKE ALL ON FUNCTION nutrition.daily_reference_assessment(uuid,date)
  FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION nutrition.daily_reference_assessment(uuid,date)
  TO authenticated,service_role;
COMMIT;
