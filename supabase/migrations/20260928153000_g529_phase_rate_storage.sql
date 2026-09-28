-- G-529 A5/A7/A8: die gewaehlte Rate liegt typisiert an der Phase;
-- belegte Spannen liegen getrennt im leeren Regelkatalog.

BEGIN;

ALTER TABLE goals.goal_phases
  ADD COLUMN zielrate_pct_kg_woche numeric(5,3);

ALTER TABLE goals.goal_phases
  ADD CONSTRAINT goal_phases_zielrate_aussengrenze
  CHECK (
    zielrate_pct_kg_woche IS NULL
    OR zielrate_pct_kg_woche BETWEEN -2.5 AND 1.5
  );

-- Zwei bestehende lean_bulk-Testzeilen haben noch keine Rate. Sie werden nicht
-- geraten. NOT VALID toleriert nur diesen gemeldeten Altbestand; neue und
-- geaenderte Zeilen muessen die Artregel sofort erfuellen.
ALTER TABLE goals.goal_phases
  ADD CONSTRAINT goal_phases_zielrate_passt_zur_art
  CHECK (
    (phase_type IN ('fat_loss', 'mini_cut')
      AND zielrate_pct_kg_woche IS NOT NULL
      AND zielrate_pct_kg_woche < 0)
    OR (phase_type = 'lean_bulk'
      AND zielrate_pct_kg_woche IS NOT NULL
      AND zielrate_pct_kg_woche > 0)
    OR (phase_type = 'maintenance'
      AND (zielrate_pct_kg_woche IS NULL OR abs(zielrate_pct_kg_woche) <= 0.1))
    OR (phase_type IN (
        'peak_week', 'expert_bb_annual',
        'contest_prep', 'reverse_diet', 'recomp'
      )
      AND zielrate_pct_kg_woche IS NULL)
  ) NOT VALID;

COMMENT ON COLUMN goals.goal_phases.zielrate_pct_kg_woche IS
  'Gewaehlt: prozentuale Koerpergewichtsaenderung je Woche. contest_prep, reverse_diet und recomp erzwingen NULL; G-530 kann contest_prep spaeter je Unterphase anders modellieren. Ziel-kcal werden aus der Rate abgeleitet.';

CREATE TABLE goals.phase_rate_rules (
  code text PRIMARY KEY,
  phase_type text NOT NULL,
  experience_level text,
  lower_value numeric(5,3),
  upper_value numeric(5,3),
  evidence_status text NOT NULL,
  source_id text,
  source_locator text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT phase_rate_rules_code_format
    CHECK (code = lower(code) AND code ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  CONSTRAINT phase_rate_rules_phase_type CHECK (
    phase_type IN (
      'fat_loss', 'lean_bulk', 'maintenance', 'recomp',
      'contest_prep', 'reverse_diet', 'expert_bb_annual',
      'mini_cut', 'peak_week'
    )
  ),
  CONSTRAINT phase_rate_rules_experience_level CHECK (
    experience_level IS NULL
    OR experience_level IN ('beginner', 'advanced', 'pro', 'elite')
  ),
  CONSTRAINT phase_rate_rules_scope_uq
    UNIQUE NULLS NOT DISTINCT (phase_type, experience_level),
  CONSTRAINT phase_rate_rules_evidence_status
    CHECK (evidence_status IN ('open', 'assumption', 'sourced')),
  CONSTRAINT phase_rate_rules_open_has_no_values CHECK (
    evidence_status <> 'open'
    OR (lower_value IS NULL AND upper_value IS NULL)
  ),
  CONSTRAINT phase_rate_rules_value_shape CHECK (
    evidence_status = 'open'
    OR (
      lower_value IS NOT NULL
      AND upper_value IS NOT NULL
      AND lower_value <= upper_value
      AND lower_value >= -2.5
      AND upper_value <= 1.5
    )
  ),
  CONSTRAINT phase_rate_rules_source_pair
    CHECK (num_nonnulls(source_id, source_locator) IN (0, 2)),
  CONSTRAINT phase_rate_rules_source_complete CHECK (
    evidence_status <> 'sourced'
    OR (
      NULLIF(btrim(source_id), '') IS NOT NULL
      AND NULLIF(btrim(source_locator), '') IS NOT NULL
    )
  )
);

COMMENT ON TABLE goals.phase_rate_rules IS
  'G-529: leerer, quellpflichtiger Katalog erlaubter Zielraten-Spannen je Phasenart. [wahrscheinlich]-Spannen werden nicht eingetragen.';
COMMENT ON COLUMN goals.phase_rate_rules.lower_value IS
  'Untere Grenze in Prozent Koerpergewicht je Woche; open traegt keine Zahl.';
COMMENT ON COLUMN goals.phase_rate_rules.upper_value IS
  'Obere Grenze in Prozent Koerpergewicht je Woche; open traegt keine Zahl.';
COMMENT ON COLUMN goals.phase_rate_rules.evidence_status IS
  'open ohne Zahl, assumption als sichtbare Annahme oder sourced mit Quelle und konkreter Fundstelle.';

CREATE FUNCTION goals.validate_goal_phase_rate()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  -- Beide Schreibrichtungen nehmen dasselbe Transaktionsschloss. So kann
  -- keine parallele Phasen- und Regelzeile getrennt bestehen und gemeinsam
  -- erst nach dem Commit ungueltig werden.
  PERFORM pg_catalog.pg_advisory_xact_lock(529);

  IF NEW.zielrate_pct_kg_woche IS NULL THEN
    RETURN NEW;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM goals.phase_rate_rules r
    JOIN public.profiles p ON p.id = NEW.user_id
    WHERE r.phase_type = NEW.phase_type
      AND r.evidence_status = 'sourced'
      AND (r.experience_level IS NULL OR r.experience_level = p.experience_level)
      AND (
        NEW.zielrate_pct_kg_woche < r.lower_value
        OR NEW.zielrate_pct_kg_woche > r.upper_value
      )
  ) THEN
    RAISE EXCEPTION
      'goal_phase_rate_outside_sourced_range: phase %, rate %',
      NEW.phase_type,
      NEW.zielrate_pct_kg_woche
      USING ERRCODE = '23514';
  END IF;

  RETURN NEW;
END;
$$;

CREATE FUNCTION goals.validate_phase_rate_rule()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  PERFORM pg_catalog.pg_advisory_xact_lock(529);

  IF NEW.evidence_status = 'sourced' AND EXISTS (
    SELECT 1
    FROM goals.goal_phases gp
    JOIN public.profiles p ON p.id = gp.user_id
    WHERE gp.phase_type = NEW.phase_type
      AND (NEW.experience_level IS NULL OR NEW.experience_level = p.experience_level)
      AND gp.zielrate_pct_kg_woche IS NOT NULL
      AND (
        gp.zielrate_pct_kg_woche < NEW.lower_value
        OR gp.zielrate_pct_kg_woche > NEW.upper_value
      )
  ) THEN
    RAISE EXCEPTION
      'phase_rate_rule_conflicts_with_goal_phases: phase %, range %..%',
      NEW.phase_type,
      NEW.lower_value,
      NEW.upper_value
      USING ERRCODE = '23514';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER goal_phases_validate_rate
  BEFORE INSERT OR UPDATE OF phase_type, zielrate_pct_kg_woche
  ON goals.goal_phases
  FOR EACH ROW EXECUTE FUNCTION goals.validate_goal_phase_rate();

CREATE TRIGGER phase_rate_rules_validate
  BEFORE INSERT OR UPDATE OF phase_type, experience_level, lower_value, upper_value, evidence_status
  ON goals.phase_rate_rules
  FOR EACH ROW EXECUTE FUNCTION goals.validate_phase_rate_rule();

CREATE TRIGGER phase_rate_rules_touch_updated_at
  BEFORE UPDATE ON goals.phase_rate_rules
  FOR EACH ROW EXECUTE FUNCTION goals.touch_updated_at();

ALTER TABLE goals.phase_rate_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY phase_rate_rules_select
  ON goals.phase_rate_rules
  FOR SELECT
  TO authenticated
  USING (true);

GRANT USAGE ON SCHEMA goals TO authenticated, service_role;
REVOKE ALL ON TABLE goals.phase_rate_rules
  FROM PUBLIC, anon, authenticated, service_role;
GRANT SELECT ON TABLE goals.phase_rate_rules TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE goals.phase_rate_rules
  TO service_role;

REVOKE ALL ON FUNCTION goals.validate_goal_phase_rate()
  FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION goals.validate_phase_rate_rule()
  FROM PUBLIC, anon, authenticated, service_role;

-- Triggerfunktionen brauchen keinen direkten API-Aufruf; Ausfuehrung erfolgt
-- ausschliesslich ueber Tabellenoperationen.

-- E1 dreht G-511 hier auf die nun vorhandene, typisierte Rate um. Der TDEE
-- kommt aus G-524: letzte verlaessliche adaptive Reihenzeile, sonst Formel.
-- Die vier Hindernisnamen bleiben der in apps/ verdrahtete Vertrag.
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
    gp.zielrate_pct_kg_woche
  FROM (SELECT 1) singleton
  LEFT JOIN LATERAL (
    SELECT p.id, p.phase_type, p.zielrate_pct_kg_woche
    FROM goals.goal_phases p
    WHERE p.user_id = p_user_id
      AND p.gueltig_ab <= p_stichtag
      AND (p.actual_end_date IS NULL OR p.actual_end_date >= p_stichtag)
    ORDER BY p.gueltig_ab DESC, p.created_at DESC, p.id DESC
    LIMIT 1
  ) gp ON true
),
gerechnet AS (
  SELECT
    f.bmr,
    f.body_weight_kg,
    f.fehlende_felder,
    b.tdee,
    b.tdee_herkunft,
    b.tdee_history_id,
    ph.phase_id,
    ph.phase_type,
    ph.zielrate_pct_kg_woche,
    CASE
      WHEN ph.phase_id IS NULL
        OR cardinality(f.fehlende_felder) > 0
        OR ph.zielrate_pct_kg_woche IS NULL
        OR b.tdee IS NULL
      THEN NULL
      ELSE round((
        b.tdee
        + goals.kcal_delta_aus_zielrate(
            ph.zielrate_pct_kg_woche,
            f.body_weight_kg
          )
      )::numeric, 1)
    END AS kcal_wert
  FROM formel f
  CROSS JOIN basis b
  CROSS JOIN phase ph
),
makros AS (
  SELECT
    g.*,
    CASE WHEN g.kcal_wert IS NULL THEN NULL
         ELSE round((g.body_weight_kg * 2)::numeric, 1) END AS protein_wert,
    CASE WHEN g.kcal_wert IS NULL THEN NULL
         ELSE round((g.kcal_wert * 0.25 / 9)::numeric, 1) END AS fett_wert,
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
  NULL::numeric,
  CASE
    WHEN m.phase_id IS NULL THEN 'keine_aktive_phase'
    WHEN cardinality(m.fehlende_felder) > 0 THEN 'profil_unvollstaendig'
    WHEN m.zielrate_pct_kg_woche IS NULL THEN 'phasenparameter_fehlt'
    ELSE NULL
  END,
  m.fehlende_felder,
  m.tdee_herkunft,
  m.tdee_history_id,
  m.zielrate_pct_kg_woche,
  m.body_weight_kg
FROM makros m;
$$;

REVOKE ALL ON FUNCTION goals.berechne_zielwerte(uuid, date)
  FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION goals.berechne_zielwerte(uuid, date)
  TO authenticated, service_role;

COMMENT ON FUNCTION goals.berechne_zielwerte(uuid, date) IS
  'G-511/E1: Ziel-kcal = verlaesslicher adaptiver TDEE (sonst Formel) + 11 x Zielrate in Prozent KG/Woche x Profilgewicht. Fehlende Rate bleibt phasenparameter_fehlt. G-526 bleibt unveraendert: Faser 30 g/Tag ist [annahme]; Protein und Fett warten auf G-521 A1.';

COMMIT;
