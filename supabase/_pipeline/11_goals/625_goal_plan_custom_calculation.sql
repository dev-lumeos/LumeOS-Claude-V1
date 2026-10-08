-- G-625: Die vorhandene Zielrechnung bleibt Basis fuer Profile, TDEE und
-- Phasenauswahl. Nur die Makro-/Kalorienwerte einer eigenen Phase kommen
-- aus deren bestaetigten eigenen Werten.
BEGIN;

ALTER FUNCTION goals.berechne_zielwerte(uuid,uuid,date)
  RENAME TO berechne_zielwerte_g625_basis;

CREATE FUNCTION goals.berechne_zielwerte(
  p_user_id uuid,p_goal_id uuid,p_stichtag date DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  bmr numeric,tdee numeric,kcal numeric,protein_g numeric,carbs_g numeric,
  fat_g numeric,fiber_g numeric,linoleic_acid_g numeric,
  alpha_linolenic_acid_g numeric,nutrition_goal text,kalorienfaktor numeric,
  hindernis text,fehlende_felder text[],tdee_herkunft text,
  tdee_history_id uuid,zielrate_pct_kg_woche numeric,body_weight_kg numeric,
  goal_id uuid
)
LANGUAGE sql STABLE SECURITY INVOKER SET search_path='' AS $$
  WITH basis AS (
    SELECT * FROM goals.berechne_zielwerte_g625_basis(
      p_user_id,p_goal_id,p_stichtag)
  ),
  eigene AS (
    SELECT gp.parameters->'g626_eigene_werte' AS werte,
      pos.richtung
    FROM goals.goal_phases gp
    LEFT JOIN goals.goal_program_positions pos ON pos.goal_phase_id=gp.id
    WHERE gp.user_id=p_user_id AND gp.goal_id=p_goal_id
      AND gp.strategie_code='custom'
      AND gp.parameters ? 'g626_eigene_werte'
      AND gp.gueltig_ab<=p_stichtag
      AND (gp.actual_end_date IS NULL OR gp.actual_end_date>=p_stichtag)
    ORDER BY gp.gueltig_ab DESC,gp.created_at DESC,gp.id DESC
    LIMIT 1
  ),
  grundlage AS (
    SELECT b.*,e.werte,e.richtung,f.body_weight_kg AS aktuelles_gewicht,
      CASE WHEN e.werte IS NULL THEN b.kcal
        WHEN b.tdee IS NULL OR b.tdee<=0
          OR b.body_weight_kg IS NULL OR b.body_weight_kg<=0
          OR cardinality(b.fehlende_felder)>0 THEN NULL
        WHEN e.werte ? 'kcal_pct_erhaltung'
          THEN round(b.tdee*(1+
            (e.werte->>'kcal_pct_erhaltung')::numeric/100),1)
        ELSE round(b.tdee+goals.kcal_delta_aus_zielrate(
          CASE e.richtung WHEN 'abnehmen' THEN
            -(e.werte->>'tempo_pct_kg_woche')::numeric
          WHEN 'aufbauen' THEN
            (e.werte->>'tempo_pct_kg_woche')::numeric
          ELSE 0 END,b.body_weight_kg),1)
      END AS eigene_kcal
    FROM basis b
    LEFT JOIN eigene e ON true
    LEFT JOIN LATERAL goals.formula_tdee(p_user_id,p_stichtag) f ON true
  ),
  makros AS (
    SELECT g.*,
      CASE WHEN g.werte IS NULL THEN g.protein_g
        WHEN g.eigene_kcal>0 AND g.aktuelles_gewicht>0
          THEN round(g.aktuelles_gewicht*
            (g.werte->>'protein_g_kg')::numeric,1)
      END AS eigenes_protein,
      CASE WHEN g.werte IS NULL THEN g.fat_g
        WHEN g.eigene_kcal>0 AND g.aktuelles_gewicht>0
          THEN round(g.aktuelles_gewicht*
            (g.werte->>'fett_g_kg')::numeric,1)
      END AS eigenes_fett
    FROM grundlage g
  )
  SELECT
    m.bmr,m.tdee,
    m.eigene_kcal,
    m.eigenes_protein,
    CASE WHEN m.werte IS NULL THEN m.carbs_g
      WHEN m.eigene_kcal>0 AND m.eigenes_protein IS NOT NULL
        AND m.eigenes_fett IS NOT NULL
        THEN round(greatest(m.eigene_kcal-
          (m.eigenes_protein*4+m.eigenes_fett*9),0)/4,1)
    END,
    m.eigenes_fett,
    CASE WHEN m.werte IS NULL THEN m.fiber_g
      WHEN m.eigene_kcal>0 THEN 30.0::numeric END,
    CASE WHEN m.werte IS NULL THEN m.linoleic_acid_g
      WHEN m.eigene_kcal>0 THEN round(m.eigene_kcal*0.04/9,1) END,
    CASE WHEN m.werte IS NULL THEN m.alpha_linolenic_acid_g
      WHEN m.eigene_kcal>0 THEN round(m.eigene_kcal*0.005/9,1) END,
    CASE WHEN m.werte IS NULL THEN m.nutrition_goal
      WHEN m.richtung='abnehmen' THEN 'lose_weight'
      WHEN m.richtung='aufbauen' THEN 'gain_muscle'
      ELSE 'maintain' END,
    CASE WHEN m.werte IS NULL THEN m.kalorienfaktor
      WHEN m.eigene_kcal>0 THEN round(m.eigene_kcal/nullif(m.tdee,0),3)
    END,
    CASE WHEN m.werte IS NULL THEN m.hindernis
      WHEN m.eigene_kcal>0 AND m.aktuelles_gewicht>0 THEN NULL
      ELSE coalesce(nullif(m.hindernis,'phasenparameter_fehlt'),
        'erhaltung_nicht_berechenbar') END,
    m.fehlende_felder,m.tdee_herkunft,m.tdee_history_id,
    CASE WHEN m.werte IS NULL THEN m.zielrate_pct_kg_woche
      WHEN m.richtung='abnehmen' THEN
        -(m.werte->>'tempo_pct_kg_woche')::numeric
      WHEN m.richtung='aufbauen' THEN
        (m.werte->>'tempo_pct_kg_woche')::numeric
      ELSE 0 END,m.body_weight_kg,m.goal_id
  FROM makros m;
$$;

REVOKE ALL ON FUNCTION goals.berechne_zielwerte(uuid,uuid,date)
  FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION goals.berechne_zielwerte(uuid,uuid,date)
  TO authenticated,service_role;
COMMENT ON FUNCTION goals.berechne_zielwerte(uuid,uuid,date) IS
  'G-625: eigene Phasenwerte fuer kcal/Protein/Fett aus TDEE und aktuellem Gewicht; die G-563-Rechnung bleibt Basis.';
COMMIT;
