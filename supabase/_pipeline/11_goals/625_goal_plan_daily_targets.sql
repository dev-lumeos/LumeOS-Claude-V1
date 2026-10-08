-- G-625: Eigene aktive Phasenwerte haben Vorrang vor alten Ziel-Snapshots.
-- Die Rechnung bleibt in goals.berechne_zielwerte; daily_reference liest
-- ueber den bestehenden goals.zielwerte_am-Vertrag.
BEGIN;

CREATE OR REPLACE FUNCTION goals.zielwerte_am(
  p_user_id uuid, p_stichtag date DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  gueltig_ab date, kcal numeric, protein_g numeric, carbs_g numeric,
  fat_g numeric, fiber_g numeric, linoleic_acid_g numeric,
  alpha_linolenic_acid_g numeric, herkunft text, tdee numeric,
  nutrition_goal text
)
LANGUAGE sql STABLE SECURITY INVOKER SET search_path='' AS $$
  WITH eigene_phase AS (
    SELECT gp.goal_id,gp.gueltig_ab
    FROM goals.phase_am(p_user_id,p_stichtag) gp
    JOIN goals.goal_phases raw ON raw.id=gp.phase_id
    WHERE raw.strategie_code='custom'
      AND raw.parameters ? 'g626_eigene_werte'
    ORDER BY gp.gueltig_ab DESC,gp.created_at DESC,gp.phase_id DESC
    LIMIT 1
  ),
  eigene_zeile AS (
    SELECT ep.gueltig_ab,z.kcal,z.protein_g,z.carbs_g,z.fat_g,z.fiber_g,
      z.linoleic_acid_g,z.alpha_linolenic_acid_g,
      CASE WHEN z.hindernis IS NULL THEN 'eigene_werte'
        ELSE z.hindernis END AS herkunft,
      z.tdee,z.nutrition_goal
    FROM eigene_phase ep
    CROSS JOIN LATERAL goals.berechne_zielwerte(
      p_user_id,ep.goal_id,p_stichtag) z
  ),
  gespeicherte_zeile AS (
    SELECT t.gueltig_ab,t.kcal,t.protein_g,t.carbs_g,t.fat_g,
      t.fiber_g,t.linoleic_acid_g,t.alpha_linolenic_acid_g,
      t.herkunft,t.tdee,t.nutrition_goal
    FROM goals.nutrition_targets t
    JOIN goals.goal_phases gp ON gp.id=t.phase_id AND gp.user_id=t.user_id
    JOIN goals.user_goals ug ON ug.id=gp.goal_id AND ug.user_id=gp.user_id
      AND ug.status='active'
    WHERE t.user_id=p_user_id AND t.gueltig_ab<=p_stichtag
      AND gp.gueltig_ab<=p_stichtag
      AND (gp.actual_end_date IS NULL OR gp.actual_end_date>=p_stichtag)
      AND NOT EXISTS (SELECT 1 FROM eigene_phase)
    ORDER BY t.gueltig_ab DESC
    LIMIT 1
  )
  SELECT * FROM eigene_zeile
  UNION ALL
  SELECT * FROM gespeicherte_zeile
  UNION ALL
  SELECT p_stichtag,z.kcal,z.protein_g,z.carbs_g,z.fat_g,z.fiber_g,
    z.linoleic_acid_g,z.alpha_linolenic_acid_g,
    z.hindernis,z.tdee,z.nutrition_goal
  FROM goals.berechne_zielwerte(p_user_id,p_stichtag) z
  WHERE NOT EXISTS (SELECT 1 FROM goals.phase_am(p_user_id,p_stichtag))
    AND NOT EXISTS (SELECT 1 FROM eigene_zeile)
    AND NOT EXISTS (SELECT 1 FROM gespeicherte_zeile);
$$;

COMMENT ON FUNCTION goals.zielwerte_am(uuid,date) IS
  'G-625: aktive eigene Phasenwerte aus derselben Zielrechnung; danach gespeicherter Phasensnapshot oder G-622-Erhaltung.';
REVOKE ALL ON FUNCTION goals.zielwerte_am(uuid,date) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION goals.zielwerte_am(uuid,date)
  TO authenticated,service_role;
COMMIT;
