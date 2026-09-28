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
    OR (phase_type IN ('peak_week', 'expert_bb_annual')
      AND zielrate_pct_kg_woche IS NULL)
    -- A6 bleibt eine Messfrage: diese drei Protokolle duerfen leer bleiben;
    -- eine spaetere Entscheidung kann ihre zulaessige Form verschaerfen.
    OR phase_type IN ('contest_prep', 'reverse_diet', 'recomp')
  ) NOT VALID;

COMMENT ON COLUMN goals.goal_phases.zielrate_pct_kg_woche IS
  'Gewaehlt: prozentuale Koerpergewichtsaenderung je Woche. NULL fuer Protokolle ohne eigene Rate oder noch nicht kuratierte Altzeilen; Ziel-kcal werden daraus abgeleitet.';

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

COMMIT;
