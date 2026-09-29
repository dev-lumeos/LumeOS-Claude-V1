-- G-536: Zielwerte lesen ausgelieferte Defaults aus goal_strategies.
-- goal_phases.parameters bleibt die persoenliche Override-Ebene; unbekannte
-- Metadaten (source, note, reason) werden nicht als Rechenwert interpretiert.

BEGIN;

DROP FUNCTION goals.berechne_zielwerte(uuid, date);
CREATE FUNCTION goals.berechne_zielwerte(
  p_user_id uuid,
  p_stichtag date DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  bmr numeric,
  tdee numeric,
  kcal numeric,
  protein_g numeric,
  carbs_g numeric,
  fat_g numeric,
  fiber_g numeric,
  linoleic_acid_g numeric,
  alpha_linolenic_acid_g numeric,
  nutrition_goal text,
  kalorienfaktor numeric,
  hindernis text,
  fehlende_felder text[],
  tdee_herkunft text,
  tdee_history_id uuid,
  zielrate_pct_kg_woche numeric,
  body_weight_kg numeric
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
WITH formel AS (
  SELECT * FROM goals.formula_tdee(p_user_id, p_stichtag)
),
basis AS (
  SELECT * FROM goals.tdee_basis_am(p_user_id, p_stichtag)
),
phase AS (
  SELECT
    gp.id AS phase_id,
    gp.phase_type,
    gp.strategie_code,
    gp.parameters,
    gp.zielrate_pct_kg_woche,
    s.tdee_modifier AS katalog_tdee_modifier,
    s.weight_change_target_percent AS katalog_zielrate,
    s.protein_per_kg AS katalog_protein_per_kg,
    s.fat_percent AS katalog_fat_percent
  FROM (SELECT 1) singleton
  LEFT JOIN LATERAL (
    SELECT p.*
    FROM goals.goal_phases p
    WHERE p.user_id = p_user_id
      AND p.gueltig_ab <= p_stichtag
      AND (p.actual_end_date IS NULL OR p.actual_end_date >= p_stichtag)
    ORDER BY p.gueltig_ab DESC, p.created_at DESC, p.id DESC
    LIMIT 1
  ) gp ON true
  LEFT JOIN goals.goal_strategies s ON s.code = gp.strategie_code
),
werte AS (
  SELECT
    ph.*,
    CASE
      WHEN ph.parameters ? 'tdee_modifier'
        AND jsonb_typeof(ph.parameters -> 'tdee_modifier') = 'number'
        THEN (ph.parameters ->> 'tdee_modifier')::numeric
      ELSE ph.katalog_tdee_modifier
    END AS tdee_modifier,
    CASE
      WHEN ph.parameters ? 'protein_per_kg'
        AND jsonb_typeof(ph.parameters -> 'protein_per_kg') = 'number'
        THEN (ph.parameters ->> 'protein_per_kg')::numeric
      ELSE ph.katalog_protein_per_kg
    END AS protein_per_kg,
    CASE
      WHEN ph.parameters ? 'fat_percent'
        AND jsonb_typeof(ph.parameters -> 'fat_percent') = 'number'
        THEN (ph.parameters ->> 'fat_percent')::numeric
      ELSE ph.katalog_fat_percent
    END AS fat_percent,
    coalesce(ph.zielrate_pct_kg_woche, ph.katalog_zielrate) AS effektive_zielrate,
    (
      (ph.parameters ? 'tdee_modifier' AND (
        jsonb_typeof(ph.parameters -> 'tdee_modifier') <> 'number'
        OR CASE WHEN jsonb_typeof(ph.parameters -> 'tdee_modifier') = 'number'
          THEN (ph.parameters ->> 'tdee_modifier')::numeric NOT BETWEEN -0.40 AND 0.25
          ELSE false END
      ))
      OR (ph.parameters ? 'protein_per_kg' AND (
        jsonb_typeof(ph.parameters -> 'protein_per_kg') <> 'number'
        OR CASE WHEN jsonb_typeof(ph.parameters -> 'protein_per_kg') = 'number'
          THEN (ph.parameters ->> 'protein_per_kg')::numeric NOT BETWEEN 1.2 AND 3.5
          ELSE false END
      ))
      OR (ph.parameters ? 'fat_percent' AND (
        jsonb_typeof(ph.parameters -> 'fat_percent') <> 'number'
        OR CASE WHEN jsonb_typeof(ph.parameters -> 'fat_percent') = 'number'
          THEN (ph.parameters ->> 'fat_percent')::numeric NOT BETWEEN 0.15 AND 0.40
          ELSE false END
      ))
    ) AS override_ungueltig
  FROM phase ph
),
gerechnet AS (
  SELECT
    f.bmr,
    f.body_weight_kg,
    f.fehlende_felder,
    b.tdee,
    b.tdee_herkunft,
    b.tdee_history_id,
    w.phase_id,
    w.phase_type,
    w.strategie_code,
    w.tdee_modifier,
    w.protein_per_kg,
    w.fat_percent,
    w.effektive_zielrate,
    w.override_ungueltig,
    CASE
      WHEN w.phase_id IS NULL
        OR cardinality(f.fehlende_felder) > 0
        OR w.strategie_code IS NULL
        OR w.tdee_modifier IS NULL
        OR w.protein_per_kg IS NULL
        OR w.fat_percent IS NULL
        OR w.override_ungueltig
        OR b.tdee IS NULL
      THEN NULL
      ELSE round((b.tdee * (1 + w.tdee_modifier))::numeric, 1)
    END AS kcal_wert
  FROM formel f
  CROSS JOIN basis b
  CROSS JOIN werte w
),
makros AS (
  SELECT
    g.*,
    CASE WHEN g.kcal_wert IS NULL THEN NULL
         ELSE round((g.body_weight_kg * g.protein_per_kg)::numeric, 1) END AS protein_wert,
    CASE WHEN g.kcal_wert IS NULL THEN NULL
         ELSE round((g.kcal_wert * g.fat_percent / 9)::numeric, 1) END AS fett_wert,
    CASE WHEN g.kcal_wert IS NULL THEN NULL ELSE 30.0::numeric END AS fiber_wert,
    CASE WHEN g.kcal_wert IS NULL THEN NULL
         ELSE round((g.kcal_wert * 0.04 / 9)::numeric, 1) END AS linolsaeure_wert,
    CASE WHEN g.kcal_wert IS NULL THEN NULL
         ELSE round((g.kcal_wert * 0.005 / 9)::numeric, 1) END AS alpha_linolensaeure_wert
  FROM gerechnet g
)
SELECT
  m.bmr,
  m.tdee,
  m.kcal_wert,
  m.protein_wert,
  CASE WHEN m.kcal_wert IS NULL THEN NULL
       ELSE round(greatest(
         m.kcal_wert - (m.protein_wert * 4 + m.fett_wert * 9),
         0
       ) / 4, 1)
  END,
  m.fett_wert,
  m.fiber_wert,
  m.linolsaeure_wert,
  m.alpha_linolensaeure_wert,
  CASE m.phase_type
    WHEN 'fat_loss' THEN 'lose_weight'
    WHEN 'mini_cut' THEN 'lose_weight'
    WHEN 'lean_bulk' THEN 'gain_muscle'
    WHEN 'maintenance' THEN 'maintain'
    WHEN 'recomp' THEN 'recomposition'
    ELSE NULL
  END,
  m.tdee_modifier,
  CASE
    WHEN m.phase_id IS NULL THEN 'keine_aktive_phase'
    WHEN cardinality(m.fehlende_felder) > 0 THEN 'profil_unvollstaendig'
    WHEN m.strategie_code IS NULL
      OR m.tdee_modifier IS NULL
      OR m.protein_per_kg IS NULL
      OR m.fat_percent IS NULL
      OR m.override_ungueltig
      THEN 'phasenparameter_fehlt'
    ELSE NULL
  END,
  m.fehlende_felder,
  m.tdee_herkunft,
  m.tdee_history_id,
  m.effektive_zielrate,
  m.body_weight_kg
FROM makros m;
$$;

REVOKE ALL ON FUNCTION goals.berechne_zielwerte(uuid, date)
  FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION goals.berechne_zielwerte(uuid, date)
  TO authenticated, service_role;

COMMENT ON FUNCTION goals.berechne_zielwerte(uuid, date) IS
  'G-536: TDEE-Faktor, Protein und Fett kommen aus goal_strategies; numerische persoenliche Overrides liegen in goal_phases.parameters. Die Instanzrate ueberschreibt die Katalograte. Hindernisnamen bleiben stabil.';

COMMIT;
