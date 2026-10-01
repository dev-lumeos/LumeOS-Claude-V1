-- G-563: Zielwerte gehoeren zu einer Phase eines konkreten Ziels. Die
-- nutzerweite Signatur bleibt fuer bestehende Aufrufer erhalten, darf bei
-- mehreren gueltigen Zielphasen aber keine davon still auswaehlen.

BEGIN;

DROP FUNCTION IF EXISTS goals.berechne_zielwerte(uuid, uuid, date);
CREATE FUNCTION goals.berechne_zielwerte(
  p_user_id uuid,
  p_goal_id uuid,
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
  body_weight_kg numeric,
  goal_id uuid
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
    gp.goal_id,
    gp.phase_type,
    gp.strategie_code,
    gp.parameters,
    gp.gueltig_ab,
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
      AND p.goal_id = p_goal_id
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
      (ph.parameters ? 'protein_per_kg' AND (
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
phasengewicht AS (
  SELECT
    w.*,
    coalesce(g.measurement_count, 0) AS measurement_count,
    g.weight_kg AS rate_body_weight_kg
  FROM werte w
  LEFT JOIN LATERAL (
    SELECT
      count(*)::integer AS measurement_count,
      max(bm.weight_kg) AS weight_kg
    FROM goals.body_measurements bm
    WHERE bm.user_id = p_user_id
      AND bm.measurement_date = (
        SELECT max(latest.measurement_date)
        FROM goals.body_measurements latest
        WHERE latest.user_id = p_user_id
          AND latest.measurement_date <= w.gueltig_ab
      )
  ) g ON w.phase_id IS NOT NULL
),
gerechnet AS (
  SELECT
    f.bmr,
    f.body_weight_kg AS profile_body_weight_kg,
    CASE
      WHEN w.phase_id IS NOT NULL
        AND (
          w.measurement_count <> 1
          OR w.rate_body_weight_kg IS NULL
          OR w.rate_body_weight_kg <= 0
        )
      THEN f.fehlende_felder || ARRAY['body_measurement_weight_kg']::text[]
      ELSE f.fehlende_felder
    END AS fehlende_felder,
    b.tdee,
    b.tdee_herkunft,
    b.tdee_history_id,
    w.phase_id,
    w.goal_id,
    w.phase_type,
    w.strategie_code,
    w.tdee_modifier,
    w.protein_per_kg,
    w.fat_percent,
    w.effektive_zielrate,
    w.rate_body_weight_kg,
    w.override_ungueltig,
    CASE
      WHEN w.phase_id IS NULL
        OR cardinality(f.fehlende_felder) > 0
        OR w.measurement_count <> 1
        OR w.rate_body_weight_kg IS NULL
        OR w.rate_body_weight_kg <= 0
        OR w.strategie_code IS NULL
        OR w.effektive_zielrate IS NULL
        OR w.protein_per_kg IS NULL
        OR w.fat_percent IS NULL
        OR w.override_ungueltig
        OR b.tdee IS NULL
      THEN NULL
      ELSE round((
        b.tdee + goals.kcal_delta_aus_zielrate(
          w.effektive_zielrate,
          w.rate_body_weight_kg
        )
      )::numeric, 1)
    END AS kcal_wert
  FROM formel f
  CROSS JOIN basis b
  CROSS JOIN phasengewicht w
),
makros AS (
  SELECT
    g.*,
    CASE WHEN g.kcal_wert IS NULL THEN NULL
         ELSE round((g.profile_body_weight_kg * g.protein_per_kg)::numeric, 1) END AS protein_wert,
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
      OR m.effektive_zielrate IS NULL
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
  m.rate_body_weight_kg,
  m.goal_id
FROM makros m;
$$;

REVOKE ALL ON FUNCTION goals.berechne_zielwerte(uuid, uuid, date)
  FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION goals.berechne_zielwerte(uuid, uuid, date)
  TO authenticated, service_role;

COMMENT ON FUNCTION goals.berechne_zielwerte(uuid, uuid, date) IS
  'G-563: Zielwerte einer konkreten Zielphase. Das Ergebnis nennt goal_id; die Instanzrate ueberschreibt die Katalograte.';

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
  body_weight_kg numeric,
  goal_id uuid
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

  RETURN QUERY
  SELECT z.*
  FROM goals.berechne_zielwerte(p_user_id, v_goal_id, p_stichtag) z;
END;
$$;

REVOKE ALL ON FUNCTION goals.berechne_zielwerte(uuid, date)
  FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION goals.berechne_zielwerte(uuid, date)
  TO authenticated, service_role;

COMMENT ON FUNCTION goals.berechne_zielwerte(uuid, date) IS
  'G-563: strikter Altvertrag. Delegiert nur bei hoechstens einer Nutzerphase; mehrere Zielphasen werfen 23514 statt still eine auszuwaehlen.';

CREATE OR REPLACE FUNCTION goals.nutrition_target_assign_phase()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_phase_id uuid;
  v_goal_id uuid;
  v_phase_count integer;
  v_target record;
BEGIN
  SELECT
    max(p.phase_id::text)::uuid,
    max(p.goal_id::text)::uuid,
    count(*)::integer
  INTO v_phase_id, v_goal_id, v_phase_count
  FROM goals.phase_am(NEW.user_id, NEW.gueltig_ab) p;

  IF v_phase_count = 0 THEN
    RAISE EXCEPTION 'nutrition_targets: keine aktive Phase am Gueltigkeitstag'
      USING ERRCODE = '23514';
  END IF;

  IF v_phase_count > 1 THEN
    RAISE EXCEPTION
      'nutrition_targets: mehrere aktive Phasen am Gueltigkeitstag; Zielbezug fehlt'
      USING ERRCODE = '23514';
  END IF;

  IF NEW.phase_id IS NOT NULL AND NEW.phase_id <> v_phase_id THEN
    RAISE EXCEPTION 'nutrition_targets: phase_id ist am Gueltigkeitstag nicht die aktive Phase'
      USING ERRCODE = '23514';
  END IF;
  NEW.phase_id := v_phase_id;

  IF NEW.herkunft = 'formel' THEN
    SELECT * INTO STRICT v_target
    FROM goals.berechne_zielwerte(NEW.user_id, v_goal_id, NEW.gueltig_ab);

    IF v_target.hindernis IS NOT NULL THEN
      RAISE EXCEPTION 'nutrition_targets: %', v_target.hindernis
        USING ERRCODE = '23514';
    END IF;

    NEW.kcal := v_target.kcal;
    NEW.protein_g := v_target.protein_g;
    NEW.carbs_g := v_target.carbs_g;
    NEW.fat_g := v_target.fat_g;
    NEW.fiber_g := v_target.fiber_g;
    NEW.linoleic_acid_g := v_target.linoleic_acid_g;
    NEW.alpha_linolenic_acid_g := v_target.alpha_linolenic_acid_g;
    NEW.tdee := v_target.tdee;
    NEW.nutrition_goal := v_target.nutrition_goal;
    NEW.zielrate_pct_kg_woche := v_target.zielrate_pct_kg_woche;
    NEW.body_weight_kg := v_target.body_weight_kg;
    NEW.tdee_herkunft := v_target.tdee_herkunft;
    NEW.tdee_history_id := v_target.tdee_history_id;
  ELSE
    NEW.zielrate_pct_kg_woche := NULL;
    NEW.body_weight_kg := NULL;
    NEW.tdee_herkunft := NULL;
    NEW.tdee_history_id := NULL;
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION goals.nutrition_target_assign_phase()
  FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION goals.nutrition_target_assign_phase()
  TO authenticated, service_role;

COMMENT ON FUNCTION goals.nutrition_target_assign_phase() IS
  'G-563: der eindeutige Zielbezug der Phase wird an die Zielwertrechnung durchgereicht; mehrere Nutzerphasen bleiben ein ausdrueckliches Hindernis.';

COMMIT;
