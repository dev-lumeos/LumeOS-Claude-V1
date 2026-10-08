-- G-622: Ohne aktive Phase gelten berechnete Erhaltungswerte mit offenem
-- Herkunftsmarker. TDEE und Makroparameter kommen aus bestehenden Lesern.
BEGIN;

CREATE OR REPLACE FUNCTION goals.berechne_zielwerte(
  p_user_id uuid,
  p_stichtag date DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  bmr numeric, tdee numeric, kcal numeric, protein_g numeric,
  carbs_g numeric, fat_g numeric, fiber_g numeric,
  linoleic_acid_g numeric, alpha_linolenic_acid_g numeric,
  nutrition_goal text, kalorienfaktor numeric, hindernis text,
  fehlende_felder text[], tdee_herkunft text, tdee_history_id uuid,
  zielrate_pct_kg_woche numeric, body_weight_kg numeric, goal_id uuid
)
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_goal_id uuid;
  v_phase_count integer;
BEGIN
  SELECT max(p.goal_id::text)::uuid, count(*)::integer
  INTO v_goal_id, v_phase_count
  FROM goals.phase_am(p_user_id, p_stichtag) p;

  IF v_phase_count > 1 THEN
    RAISE EXCEPTION
      'nutrition_targets: mehrere aktive Phasen am Gueltigkeitstag; Zielbezug fehlt'
      USING ERRCODE = '23514';
  END IF;

  IF v_phase_count = 1 THEN
    RETURN QUERY SELECT z.*
    FROM goals.berechne_zielwerte(p_user_id, v_goal_id, p_stichtag) z;
    RETURN;
  END IF;

  RETURN QUERY
  WITH grundlage AS (
    SELECT
      f.bmr, f.body_weight_kg, b.tdee, b.tdee_herkunft,
      b.tdee_history_id, m.protein_per_kg, m.fat_percent,
      (f.body_weight_kg > 0 AND b.tdee > 0
        AND m.protein_per_kg > 0 AND m.fat_percent > 0) AS bereit
    FROM goals.formula_tdee(p_user_id, p_stichtag) f
    CROSS JOIN goals.tdee_basis_am(p_user_id, p_stichtag) b
    LEFT JOIN goals.goal_strategies m ON m.code = 'maintain'
  ),
  makros AS (
    SELECT g.*,
      CASE WHEN g.bereit THEN round(g.tdee, 1) END AS kcal_wert,
      CASE WHEN g.bereit THEN round(g.body_weight_kg * g.protein_per_kg, 1)
      END AS protein_wert,
      CASE WHEN g.bereit THEN round(g.tdee * g.fat_percent / 9, 1)
      END AS fett_wert
    FROM grundlage g
  )
  SELECT
    m.bmr,
    m.tdee,
    m.kcal_wert,
    m.protein_wert,
    CASE WHEN m.bereit THEN round(greatest(
      m.kcal_wert - (m.protein_wert * 4 + m.fett_wert * 9), 0
    ) / 4, 1) END AS carbs_g,
    m.fett_wert,
    CASE WHEN m.bereit THEN 30.0::numeric END AS fiber_g,
    CASE WHEN m.bereit THEN round(m.kcal_wert * 0.04 / 9, 1)
    END AS linoleic_acid_g,
    CASE WHEN m.bereit THEN round(m.kcal_wert * 0.005 / 9, 1)
    END AS alpha_linolenic_acid_g,
    CASE WHEN m.bereit THEN 'maintain'::text END AS nutrition_goal,
    CASE WHEN m.bereit THEN 1.0::numeric END AS kalorienfaktor,
    CASE WHEN m.bereit THEN 'kein_aktives_ziel'::text
      ELSE 'erhaltung_nicht_berechenbar'::text END AS hindernis,
    CASE WHEN m.bereit THEN ARRAY[]::text[] ELSE array_remove(ARRAY[
      CASE WHEN m.body_weight_kg IS NULL OR m.body_weight_kg <= 0
        THEN 'body_weight_kg' END,
      CASE WHEN m.tdee IS NULL OR m.tdee <= 0 THEN 'tdee' END,
      CASE WHEN m.protein_per_kg IS NULL OR m.fat_percent IS NULL
        THEN 'maintain_macro_rules' END
    ]::text[], NULL) END AS fehlende_felder,
    m.tdee_herkunft,
    m.tdee_history_id,
    NULL::numeric AS zielrate_pct_kg_woche,
    m.body_weight_kg,
    NULL::uuid AS goal_id
  FROM makros m;
END;
$$;

COMMENT ON FUNCTION goals.berechne_zielwerte(uuid, date) IS
  'G-622: mit aktiver Phase deren Zielwerte; sonst vorhandene TDEE-Basis und maintain-Makroparameter, klar als kein_aktives_ziel markiert.';

REVOKE ALL ON FUNCTION goals.berechne_zielwerte(uuid, date) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION goals.berechne_zielwerte(uuid, date)
  TO authenticated, service_role;

CREATE OR REPLACE FUNCTION goals.zielwerte_am(
  p_user_id uuid,
  p_stichtag date DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  gueltig_ab date, kcal numeric, protein_g numeric, carbs_g numeric,
  fat_g numeric, fiber_g numeric, linoleic_acid_g numeric,
  alpha_linolenic_acid_g numeric, herkunft text, tdee numeric,
  nutrition_goal text
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  WITH aktive_zeile AS (
    SELECT t.gueltig_ab, t.kcal, t.protein_g, t.carbs_g, t.fat_g,
           t.fiber_g, t.linoleic_acid_g, t.alpha_linolenic_acid_g,
           t.herkunft, t.tdee, t.nutrition_goal
    FROM goals.nutrition_targets t
    JOIN goals.goal_phases gp ON gp.id = t.phase_id AND gp.user_id = t.user_id
    JOIN goals.user_goals ug ON ug.id = gp.goal_id AND ug.user_id = gp.user_id
      AND ug.status = 'active'
    WHERE t.user_id = p_user_id
      AND t.gueltig_ab <= p_stichtag
      AND gp.gueltig_ab <= p_stichtag
      AND (gp.actual_end_date IS NULL OR gp.actual_end_date >= p_stichtag)
    ORDER BY t.gueltig_ab DESC
    LIMIT 1
  )
  SELECT * FROM aktive_zeile
  UNION ALL
  SELECT p_stichtag, z.kcal, z.protein_g, z.carbs_g, z.fat_g,
         z.fiber_g, z.linoleic_acid_g, z.alpha_linolenic_acid_g,
         z.hindernis, z.tdee, z.nutrition_goal
  FROM goals.berechne_zielwerte(p_user_id, p_stichtag) z
  WHERE NOT EXISTS (SELECT 1 FROM goals.phase_am(p_user_id, p_stichtag))
    AND NOT EXISTS (SELECT 1 FROM aktive_zeile);
$$;

COMMENT ON FUNCTION goals.zielwerte_am(uuid, date) IS
  'G-622: gespeichertes Tagesziel einer aktiven Phase oder markierter Erhaltungs-Rueckfall ohne aktive Phase; kein berechenbarer Wert bleibt NULL.';

REVOKE ALL ON FUNCTION goals.zielwerte_am(uuid, date) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION goals.zielwerte_am(uuid, date)
  TO authenticated, service_role;

COMMIT;
