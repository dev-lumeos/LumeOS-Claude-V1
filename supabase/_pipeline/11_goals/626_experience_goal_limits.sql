-- G-626: Grenzwerte aus Dossier 8.2, eine Datenzeile je Erfahrungsgrad.
-- Der historische phase_rate_rules-Katalog bleibt leer; er beschreibt
-- belegte Phasen-Spannen, nicht die hier freigegebenen UI-Grenzen.
BEGIN;

CREATE TABLE goals.experience_goal_limits (
  experience_level text PRIMARY KEY
    CHECK (experience_level IN ('beginner', 'advanced', 'pro', 'elite')),
  grade_rank smallint NOT NULL UNIQUE CHECK (grade_rank BETWEEN 0 AND 3),
  standard_loss_pct numeric(5,3) NOT NULL CHECK (standard_loss_pct > 0),
  standard_gain_pct numeric(5,3) NOT NULL CHECK (standard_gain_pct > 0),
  only_standard boolean NOT NULL,
  custom_values_allowed boolean NOT NULL,
  pace_warn_above_pct numeric(5,3),
  pace_block_above_pct numeric(5,3),
  diet_warn_after_weeks numeric(5,1),
  diet_block_after_weeks numeric(5,1),
  bmi_warn_below numeric(4,1),
  bmi_block_below numeric(4,1),
  kcal_male_warn_below integer,
  kcal_male_block_below integer,
  kcal_female_warn_below integer,
  kcal_female_block_below integer,
  custom_fat_warn_below_g_kg numeric(4,2),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (pace_warn_above_pct IS NULL OR pace_warn_above_pct > 0),
  CHECK (pace_block_above_pct IS NULL OR pace_block_above_pct > 0),
  CHECK (pace_warn_above_pct IS NULL OR pace_block_above_pct IS NULL
    OR pace_warn_above_pct <= pace_block_above_pct),
  CHECK (diet_warn_after_weeks IS NULL OR diet_warn_after_weeks > 0),
  CHECK (diet_block_after_weeks IS NULL OR diet_block_after_weeks > 0),
  CHECK (diet_warn_after_weeks IS NULL OR diet_block_after_weeks IS NULL
    OR diet_warn_after_weeks <= diet_block_after_weeks),
  CHECK (bmi_warn_below IS NULL OR bmi_warn_below > 0),
  CHECK (bmi_block_below IS NULL OR bmi_block_below > 0),
  CHECK (bmi_warn_below IS NULL OR bmi_block_below IS NULL
    OR bmi_block_below <= bmi_warn_below),
  CHECK (kcal_male_warn_below IS NULL OR kcal_male_warn_below > 0),
  CHECK (kcal_male_block_below IS NULL OR kcal_male_block_below > 0),
  CHECK (kcal_female_warn_below IS NULL OR kcal_female_warn_below > 0),
  CHECK (kcal_female_block_below IS NULL OR kcal_female_block_below > 0),
  CHECK (kcal_male_warn_below IS NULL OR kcal_male_block_below IS NULL
    OR kcal_male_block_below <= kcal_male_warn_below),
  CHECK (kcal_female_warn_below IS NULL OR kcal_female_block_below IS NULL
    OR kcal_female_block_below <= kcal_female_warn_below)
);

INSERT INTO goals.experience_goal_limits (
  experience_level, grade_rank, standard_loss_pct, standard_gain_pct,
  only_standard, custom_values_allowed, pace_warn_above_pct,
  pace_block_above_pct, diet_warn_after_weeks, diet_block_after_weeks,
  bmi_warn_below, bmi_block_below, kcal_male_warn_below,
  kcal_male_block_below, kcal_female_warn_below, kcal_female_block_below,
  custom_fat_warn_below_g_kg
) VALUES
  ('beginner', 0, 0.5, 0.3, true, false, NULL, NULL,
    NULL, 16, NULL, 18.5, NULL, 1500, NULL, 1200, NULL),
  ('advanced', 1, 0.5, 0.3, false, false, 0.75, 1.0,
    16, 20, 18.5, 17.5, 1500, 1300, 1200, 1000, NULL),
  ('pro', 2, 0.5, 0.3, false, true, 1.0, NULL,
    16, NULL, 18.5, NULL, 1500, NULL, 1200, NULL, 0.5),
  ('elite', 3, 0.5, 0.3, false, true, 1.0, NULL,
    16, NULL, 18.5, NULL, 1500, NULL, 1200, NULL, 0.5);

-- Die drei geerbten JSON-Mindestgrade lauten advanced, obwohl G-614 fuer
-- genau diese Codes pro festlegte. Nur diese redundanten Schluessel fallen
-- weg; z. B. coach_approval bleibt erhalten.
DO $g626_legacy$
BEGIN
  IF (SELECT count(*) FROM goals.goal_strategies
      WHERE requirements ? 'min_experience') <> 3
     OR EXISTS (
       SELECT 1 FROM goals.goal_strategies
       WHERE requirements ? 'min_experience'
         AND (code NOT IN ('aggressive_cut','contest_prep','expert_bb_annual')
              OR requirements->>'min_experience' <> 'advanced'
              OR min_erfahrung <> 'pro')
     ) THEN
    RAISE EXCEPTION 'G-626: historischer Mindestgrad weicht vom gemessenen Bestand ab';
  END IF;
END $g626_legacy$;

UPDATE goals.goal_strategies
SET requirements = requirements - 'min_experience'
WHERE requirements ? 'min_experience';

COMMENT ON TABLE goals.experience_goal_limits IS
  'G-626: freigegebene Grenzen aus Dossier 8.2; NULL bedeutet keine Schwelle. Programm-Mindestgrad bleibt goal_strategies.min_erfahrung.';
COMMENT ON COLUMN goals.goal_strategies.min_erfahrung IS
  'G-614/G-626: einziger Mindestgrad fuer Auswahl und Pruefung; drei widerspruechliche historische requirements.min_experience-Schluessel wurden entfernt.';

CREATE TRIGGER experience_goal_limits_touch_updated_at
  BEFORE UPDATE ON goals.experience_goal_limits
  FOR EACH ROW EXECUTE FUNCTION goals.touch_updated_at();

ALTER TABLE goals.experience_goal_limits ENABLE ROW LEVEL SECURITY;
CREATE POLICY experience_goal_limits_read ON goals.experience_goal_limits
  FOR SELECT TO authenticated USING (true);
REVOKE ALL ON goals.experience_goal_limits FROM PUBLIC, anon, authenticated, service_role;
GRANT SELECT ON goals.experience_goal_limits TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON goals.experience_goal_limits TO service_role;

-- Vorschau und Schreibwache rufen exakt diesen Vertrag auf. Positive
-- Prozentwerte in eigenen Werten werden anhand der Richtung signiert.
-- p_tdee_kcal ist nur die bereits berechnete Basis, keine zweite Formel.
CREATE FUNCTION goals.ziel_grenzen_pruefen(
  p_erfahrung text,
  p_richtung text,
  p_start_kg numeric,
  p_ziel_kg numeric,
  p_startdatum date,
  p_zieldatum date,
  p_programm_code text DEFAULT NULL,
  p_eigene_werte jsonb DEFAULT NULL,
  p_geschlecht text DEFAULT NULL,
  p_groesse_cm numeric DEFAULT NULL,
  p_tdee_kcal numeric DEFAULT NULL,
  p_tempo_override numeric DEFAULT NULL
)
RETURNS TABLE (schluessel text, art text, hinweis text)
LANGUAGE plpgsql STABLE SECURITY INVOKER SET search_path = ''
AS $$
DECLARE
  v_limit goals.experience_goal_limits%ROWTYPE;
  v_program goals.goal_strategies%ROWTYPE;
  v_rate numeric;
  v_tempo numeric;
  v_wochen numeric;
  v_ziel numeric;
  v_bmi numeric;
  v_kcal numeric;
  v_kcal_warn integer;
  v_kcal_block integer;
  v_fett numeric;
  v_min_rank smallint;
  v_warnung text;
BEGIN
  SELECT * INTO v_limit FROM goals.experience_goal_limits
  WHERE experience_level = p_erfahrung;
  IF NOT FOUND THEN
    RETURN QUERY SELECT 'erfahrung_fehlt'::text, 'sperre'::text,
      'Erfahrungsgrad fehlt oder ist unbekannt.'::text;
    RETURN;
  END IF;
  IF p_richtung NOT IN ('abnehmen', 'halten', 'aufbauen') OR p_richtung IS NULL THEN
    RETURN QUERY SELECT 'richtung_fehlt'::text, 'sperre'::text,
      'Waehle Abnehmen, Halten oder Aufbauen.'::text;
    RETURN;
  END IF;
  IF p_start_kg IS NULL OR p_start_kg <= 0 OR p_startdatum IS NULL THEN
    RETURN QUERY SELECT 'start_fehlt'::text, 'sperre'::text,
      'Startgewicht und Startdatum muessen vorliegen.'::text;
    RETURN;
  END IF;
  IF (p_programm_code IS NULL) = (p_eigene_werte IS NULL) THEN
    RETURN QUERY SELECT 'vorgehen_fehlt'::text, 'sperre'::text,
      'Waehle genau ein Programm oder eigene Werte.'::text;
    RETURN;
  END IF;

  IF p_programm_code IS NOT NULL THEN
    SELECT * INTO v_program FROM goals.goal_strategies WHERE code = p_programm_code;
    IF NOT FOUND THEN
      RETURN QUERY SELECT 'programm_unbekannt'::text, 'sperre'::text,
        'Das gewaehlte Programm ist nicht im Katalog.'::text;
      RETURN;
    END IF;
    IF v_program.auswahl_gruppe <> p_richtung THEN
      RETURN QUERY SELECT 'programm_richtung'::text, 'sperre'::text,
        'Das Programm gehoert nicht zu dieser Richtung.'::text;
    END IF;
    SELECT grade_rank INTO v_min_rank FROM goals.experience_goal_limits
    WHERE experience_level = v_program.min_erfahrung;
    IF v_limit.grade_rank < v_min_rank THEN
      RETURN QUERY SELECT 'programm_mindestgrad'::text, 'sperre'::text,
        format('%s ist erst ab %s waehlbar.', v_program.label, v_program.min_erfahrung);
    END IF;
    v_rate := coalesce(p_tempo_override, v_program.weight_change_target_percent,
      CASE WHEN p_richtung = 'halten' THEN 0 END);
    FOR v_warnung IN
      SELECT w FROM unnest(v_program.warnings) AS warning(w)
    LOOP
      RETURN QUERY SELECT format('programm_warnung_%s', left(md5(v_warnung), 12)),
        'warnung'::text, v_warnung;
    END LOOP;
  ELSE
    IF NOT v_limit.custom_values_allowed THEN
      RETURN QUERY SELECT 'eigene_werte_grad'::text, 'sperre'::text,
        'Eigene Werte sind erst ab Pro waehlbar.'::text;
    END IF;
    IF jsonb_typeof(p_eigene_werte) IS DISTINCT FROM 'object'
       OR jsonb_typeof(p_eigene_werte -> 'tempo_pct_kg_woche') IS DISTINCT FROM 'number'
       OR jsonb_typeof(p_eigene_werte -> 'protein_g_kg') IS DISTINCT FROM 'number'
       OR jsonb_typeof(p_eigene_werte -> 'fett_g_kg') IS DISTINCT FROM 'number' THEN
      RETURN QUERY SELECT 'eigene_werte_fehlen'::text, 'sperre'::text,
        'Eigene Werte brauchen Tempo, Protein und Fett als Zahlen.'::text;
      RETURN;
    END IF;
    v_tempo := (p_eigene_werte ->> 'tempo_pct_kg_woche')::numeric;
    v_fett := (p_eigene_werte ->> 'fett_g_kg')::numeric;
    IF v_tempo < 0 OR (p_richtung = 'halten' AND v_tempo <> 0)
       OR (p_eigene_werte ->> 'protein_g_kg')::numeric <= 0 OR v_fett <= 0 THEN
      RETURN QUERY SELECT 'eigene_werte_ungueltig'::text, 'sperre'::text,
        'Tempo und Makrowerte muessen zur Richtung passen und gueltig sein.'::text;
      RETURN;
    END IF;
    IF p_eigene_werte ? 'kcal' THEN
      IF jsonb_typeof(p_eigene_werte -> 'kcal') <> 'number' THEN
        RETURN QUERY SELECT 'kalorien_ungueltig'::text, 'sperre'::text,
          'Kalorien muessen eine Zahl sein.'::text;
        RETURN;
      END IF;
      v_kcal := (p_eigene_werte ->> 'kcal')::numeric;
    END IF;
    v_rate := CASE p_richtung WHEN 'abnehmen' THEN -v_tempo
      WHEN 'aufbauen' THEN v_tempo ELSE 0 END;
  END IF;

  IF v_rate IS NULL THEN
    RETURN QUERY SELECT 'tempo_fehlt'::text, 'sperre'::text,
      'Fuer dieses Vorgehen fehlt ein Wochen-Tempo.'::text;
    RETURN;
  END IF;
  IF (p_richtung = 'abnehmen' AND v_rate >= 0)
     OR (p_richtung = 'aufbauen' AND v_rate <= 0)
     OR (p_richtung = 'halten' AND v_rate <> 0) THEN
    RETURN QUERY SELECT 'tempo_richtung'::text, 'sperre'::text,
      'Das Wochen-Tempo passt nicht zur Richtung.'::text;
  END IF;
  v_tempo := abs(v_rate);

  IF p_ziel_kg IS NOT NULL AND p_ziel_kg <= 0 THEN
    RETURN QUERY SELECT 'zielgewicht_ungueltig'::text, 'sperre'::text,
      'Das Zielgewicht muss groesser als null sein.'::text;
  END IF;
  IF p_richtung = 'abnehmen' AND p_ziel_kg >= p_start_kg
     OR p_richtung = 'aufbauen' AND p_ziel_kg <= p_start_kg THEN
    RETURN QUERY SELECT 'zielrichtung'::text, 'sperre'::text,
      'Das Zielgewicht liegt gegen die gewaehlte Richtung.'::text;
  END IF;
  IF p_richtung = 'halten' AND p_ziel_kg IS NOT NULL THEN
    RETURN QUERY SELECT 'halten_ohne_zielgewicht'::text, 'sperre'::text,
      'Halten verwendet kein Zielgewicht.'::text;
  END IF;
  IF p_zieldatum IS NOT NULL THEN
    IF p_zieldatum <= p_startdatum THEN
      RETURN QUERY SELECT 'zieldatum'::text, 'sperre'::text,
        'Das Zieldatum muss nach dem Start liegen.'::text;
    ELSE
      v_wochen := (p_zieldatum - p_startdatum)::numeric / 7;
    END IF;
  ELSIF p_ziel_kg IS NOT NULL AND v_tempo > 0 THEN
    v_wochen := abs(p_ziel_kg - p_start_kg) / (p_start_kg * v_tempo / 100);
  END IF;
  IF p_richtung <> 'halten' AND p_ziel_kg IS NULL AND p_zieldatum IS NULL THEN
    RETURN QUERY SELECT 'ziel_oder_datum'::text, 'sperre'::text,
      'Nenne ein Zielgewicht oder ein Zieldatum.'::text;
  END IF;
  IF p_ziel_kg IS NOT NULL AND p_zieldatum IS NOT NULL AND v_wochen > 0
     AND abs(p_ziel_kg - p_start_kg) / p_start_kg * 100 / v_wochen > v_tempo + 0.0001 THEN
    RETURN QUERY SELECT 'vorgehen_zu_langsam'::text, 'sperre'::text,
      'Das gewaehlte Tempo erreicht das Zielgewicht nicht bis zum Datum.'::text;
  END IF;
  v_ziel := coalesce(p_ziel_kg, CASE WHEN v_wochen IS NOT NULL
    THEN p_start_kg + p_start_kg * v_rate / 100 * v_wochen END);

  IF v_limit.only_standard AND p_richtung <> 'halten' AND
     abs(v_tempo - CASE p_richtung WHEN 'abnehmen' THEN v_limit.standard_loss_pct
       ELSE v_limit.standard_gain_pct END) > 0.0001 THEN
    RETURN QUERY SELECT 'tempo_standard'::text, 'sperre'::text,
      'Beginner nutzen nur das Standardtempo der Richtung.'::text;
  ELSIF v_limit.pace_block_above_pct IS NOT NULL
      AND v_tempo > v_limit.pace_block_above_pct THEN
    RETURN QUERY SELECT 'tempo'::text, 'sperre'::text,
      format('Tempo %s %% pro Woche liegt ueber der Grenze fuer %s.', v_tempo, p_erfahrung);
  ELSIF v_limit.pace_warn_above_pct IS NOT NULL
      AND v_tempo > v_limit.pace_warn_above_pct THEN
    RETURN QUERY SELECT 'tempo'::text, 'warnung'::text,
      format('Tempo %s %% pro Woche braucht eine Bestaetigung.', v_tempo);
  END IF;

  IF p_richtung = 'abnehmen' AND v_wochen IS NOT NULL THEN
    IF v_limit.diet_block_after_weeks IS NOT NULL
       AND v_wochen > v_limit.diet_block_after_weeks THEN
      RETURN QUERY SELECT 'diaetdauer'::text, 'sperre'::text,
        format('Diaet ueber %s Wochen am Stueck ist fuer %s gesperrt.',
          v_limit.diet_block_after_weeks, p_erfahrung);
    ELSIF v_limit.diet_warn_after_weeks IS NOT NULL
       AND v_wochen > v_limit.diet_warn_after_weeks THEN
      RETURN QUERY SELECT 'diaetdauer'::text, 'warnung'::text,
        format('Diaet ueber %s Wochen am Stueck braucht eine Bestaetigung.',
          v_limit.diet_warn_after_weeks);
    END IF;
    IF p_programm_code IS NOT NULL AND v_program.max_duration_weeks IS NOT NULL
       AND v_wochen > v_program.max_duration_weeks THEN
      RETURN QUERY SELECT 'programm_dauer'::text,
        CASE WHEN v_limit.grade_rank >= 2 THEN 'warnung' ELSE 'sperre' END::text,
        format('%s ist auf hoechstens %s Wochen ausgelegt.',
          v_program.label, v_program.max_duration_weeks);
    END IF;
  END IF;

  IF v_ziel IS NOT NULL AND p_groesse_cm > 0 THEN
    v_bmi := v_ziel / power(p_groesse_cm / 100, 2);
    IF v_limit.bmi_block_below IS NOT NULL AND v_bmi < v_limit.bmi_block_below THEN
      RETURN QUERY SELECT 'ziel_bmi'::text, 'sperre'::text,
        format('Ziel-BMI %s liegt unter %s.', round(v_bmi, 1), v_limit.bmi_block_below);
    ELSIF v_limit.bmi_warn_below IS NOT NULL AND v_bmi < v_limit.bmi_warn_below THEN
      RETURN QUERY SELECT 'ziel_bmi'::text, 'warnung'::text,
        format('Ziel-BMI %s liegt unter %s.', round(v_bmi, 1), v_limit.bmi_warn_below);
    END IF;
  ELSIF p_richtung <> 'halten' THEN
    RETURN QUERY SELECT 'bmi_nicht_pruefbar'::text, 'sperre'::text,
      'Zielgewicht und Groesse fehlen fuer die BMI-Pruefung.'::text;
  END IF;

  IF v_kcal IS NULL AND p_tdee_kcal IS NOT NULL AND p_tdee_kcal > 0 THEN
    v_kcal := round(p_tdee_kcal + goals.kcal_delta_aus_zielrate(v_rate, p_start_kg), 1);
  END IF;
  IF v_kcal IS NULL THEN
    RETURN QUERY SELECT 'kalorien_nicht_pruefbar'::text, 'sperre'::text,
      'Ohne berechnete TDEE oder eigene Kalorien ist die Kaloriengrenze nicht pruefbar.'::text;
  ELSIF p_geschlecht IN ('male', 'female') THEN
    v_kcal_warn := CASE p_geschlecht WHEN 'male' THEN v_limit.kcal_male_warn_below
      ELSE v_limit.kcal_female_warn_below END;
    v_kcal_block := CASE p_geschlecht WHEN 'male' THEN v_limit.kcal_male_block_below
      ELSE v_limit.kcal_female_block_below END;
    IF v_kcal_block IS NOT NULL AND v_kcal < v_kcal_block THEN
      RETURN QUERY SELECT 'kalorien'::text, 'sperre'::text,
        format('%s kcal liegen unter der Grenze fuer %s.', v_kcal, p_erfahrung);
    ELSIF v_kcal_warn IS NOT NULL AND v_kcal < v_kcal_warn THEN
      RETURN QUERY SELECT 'kalorien'::text, 'warnung'::text,
        format('%s kcal liegen unter dem Orientierungswert.', v_kcal);
    END IF;
  ELSE
    RETURN QUERY SELECT 'kalorien_geschlecht'::text, 'warnung'::text,
      'Ohne maennlich/weiblich ist die geschlechtsspezifische Kaloriengrenze nicht pruefbar.'::text;
  END IF;
  IF p_eigene_werte IS NOT NULL AND v_fett IS NOT NULL
     AND v_limit.custom_fat_warn_below_g_kg IS NOT NULL
     AND v_fett < v_limit.custom_fat_warn_below_g_kg THEN
    RETURN QUERY SELECT 'fett_eigene_werte'::text, 'warnung'::text,
      format('Fett unter %s g/kg braucht eine Bestaetigung.',
        v_limit.custom_fat_warn_below_g_kg);
  END IF;
END;
$$;

COMMENT ON FUNCTION goals.ziel_grenzen_pruefen(text,text,numeric,numeric,date,date,text,jsonb,text,numeric,numeric,numeric) IS
  'G-626: eine Befundliste fuer Vorschau und Schreibwache. Tempo, Dauer, BMI, Kalorien und eigene Fettwerte kommen aus experience_goal_limits; Strategie-Mindestgrad und Warnungen aus goal_strategies.';
REVOKE ALL ON FUNCTION goals.ziel_grenzen_pruefen(text,text,numeric,numeric,date,date,text,jsonb,text,numeric,numeric,numeric)
  FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION goals.ziel_grenzen_pruefen(text,text,numeric,numeric,date,date,text,jsonb,text,numeric,numeric,numeric)
  TO authenticated, service_role;

COMMIT;
