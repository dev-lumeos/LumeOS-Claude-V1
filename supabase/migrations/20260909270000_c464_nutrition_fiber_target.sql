-- =============================================================
-- C-464 — Ballaststoffziel in Goals-Nutrition-Targets
-- Datum: 2026-09-11
-- Zweck: Der gemessene Tageswert nutrition.daily_summary.fibt bekommt
--        ein explizites Tagesziel. Die zwei bestehenden Fettsaeureziele
--        sind formelbasiert; Fiber folgt derselben gespeicherten
--        Zielwert-Bauform, mit dem in Nutrition SPEC_01 genannten
--        Fallback von 30 g/Tag.
-- =============================================================

BEGIN;

ALTER TABLE goals.nutrition_targets
  ADD COLUMN IF NOT EXISTS fiber_g NUMERIC(6,1);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'nutrition_targets_fiber_check'
      AND conrelid = 'goals.nutrition_targets'::regclass
  ) THEN
    ALTER TABLE goals.nutrition_targets
      ADD CONSTRAINT nutrition_targets_fiber_check
      CHECK (fiber_g IS NULL OR (fiber_g >= 0 AND fiber_g <= 100));
  END IF;
END $$;

-- Bestehende Formel-Zeilen tragen dieselbe explizite Spec-Vorgabe wie neue
-- Formel-Zeilen. Manuell leere Ziele bleiben absichtlich leer: NULL kann
-- weiterhin „nicht gesetzt“ bedeuten und darf nicht nacherfunden werden.
UPDATE goals.nutrition_targets
SET fiber_g = 30.0
WHERE herkunft = 'formel'
  AND fiber_g IS NULL;

COMMENT ON COLUMN goals.nutrition_targets.fiber_g IS
  'C-464: Ballaststoffziel in g/Tag. Formel-Zielwerte nutzen den in Nutrition SPEC_01 genannten Fallback 30 g/Tag; NULL bleibt fuer manuell nicht gesetzte Ziele moeglich.';

-- Der RETURNS-Typ erweitert sich um fiber_g und braucht deshalb einen
-- Neuaufbau. Beide Funktionen haben vor C-464 keine registrierten
-- Abhaengigkeiten (gemessen auf dev am 2026-09-11).
DROP FUNCTION IF EXISTS goals.zielwerte_am(UUID, DATE);
DROP FUNCTION IF EXISTS goals.berechne_zielwerte(UUID, DATE);

CREATE FUNCTION goals.berechne_zielwerte(
  p_user_id UUID,
  p_stichtag DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  bmr             NUMERIC,
  tdee            NUMERIC,
  kcal            NUMERIC,
  protein_g       NUMERIC,
  carbs_g         NUMERIC,
  fat_g           NUMERIC,
  fiber_g         NUMERIC,
  linoleic_acid_g NUMERIC,
  alpha_linolenic_acid_g NUMERIC,
  nutrition_goal  TEXT,
  kalorienfaktor  NUMERIC,
  hindernis       TEXT,
  fehlende_felder TEXT[]
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
WITH profil AS (
  SELECT
    p.birth_date,
    p.biological_sex,
    p.height_cm,
    p.body_weight_kg,
    p.activity_level,
    p.nutrition_goal,
    CASE WHEN p.birth_date IS NULL THEN NULL
         ELSE EXTRACT(YEAR FROM age(p_stichtag, p.birth_date))::INTEGER
    END AS alter_jahre
  FROM public.profiles p
  WHERE p.id = p_user_id
),
profil_eins AS (
  SELECT
    pr.birth_date, pr.biological_sex, pr.height_cm, pr.body_weight_kg,
    pr.activity_level, pr.nutrition_goal, pr.alter_jahre,
    ARRAY_REMOVE(ARRAY[
      CASE WHEN pr.birth_date     IS NULL THEN 'birth_date'     END,
      CASE WHEN pr.biological_sex IS NULL THEN 'biological_sex' END,
      CASE WHEN pr.height_cm      IS NULL THEN 'height_cm'      END,
      CASE WHEN pr.body_weight_kg IS NULL THEN 'body_weight_kg' END,
      CASE WHEN pr.activity_level IS NULL THEN 'activity_level' END,
      CASE WHEN pr.nutrition_goal IS NULL THEN 'nutrition_goal' END
    ], NULL) AS fehlend
  FROM (SELECT 1) seed
  LEFT JOIN profil pr ON true
),
faktoren AS (
  SELECT * FROM (VALUES
    ('sedentary',   1.200::NUMERIC),
    ('light',       1.375),
    ('moderate',    1.550),
    ('active',      1.725),
    ('very_active', 1.900)
  ) AS f(stufe, faktor)
),
zuschlaege AS (
  SELECT * FROM (VALUES
    ('lose_weight',   -0.20::NUMERIC),
    ('maintain',       0.00),
    ('gain_muscle',    0.10),
    ('recomposition',  0.00),
    ('performance',    0.10)
  ) AS z(ziel, faktor)
),
gerechnet AS (
  SELECT
    p.*,
    f.faktor AS akt_faktor,
    z.faktor AS ziel_faktor,
    CASE
      WHEN p.body_weight_kg IS NULL OR p.height_cm IS NULL
        OR p.alter_jahre IS NULL OR p.biological_sex IS NULL THEN NULL
      ELSE ROUND(
        10 * p.body_weight_kg + 6.25 * p.height_cm - 5 * p.alter_jahre
        + CASE WHEN p.biological_sex = 'male' THEN 5 ELSE -161 END, 1)
    END AS bmr_wert
  FROM profil_eins p
  LEFT JOIN faktoren   f ON f.stufe = p.activity_level
  LEFT JOIN zuschlaege z ON z.ziel  = p.nutrition_goal
),
abgeleitet AS (
  SELECT
    g.*,
    ROUND(g.bmr_wert * g.akt_faktor, 1) AS tdee_wert,
    ROUND(g.bmr_wert * g.akt_faktor * (1 + g.ziel_faktor), 1) AS kcal_wert
  FROM gerechnet g
),
makros AS (
  SELECT
    a.*,
    ROUND(a.body_weight_kg * 2, 1) AS protein_wert,
    ROUND(a.kcal_wert * 0.25 / 9, 1) AS fett_wert,
    30.0::NUMERIC AS fiber_wert,
    ROUND(a.kcal_wert * 0.04 / 9, 1) AS linolsaeure_wert,
    ROUND(a.kcal_wert * 0.005 / 9, 1) AS alpha_linolensaeure_wert
  FROM abgeleitet a
)
SELECT
  m.bmr_wert,
  m.tdee_wert,
  m.kcal_wert,
  m.protein_wert,
  CASE WHEN m.kcal_wert IS NULL THEN NULL
       ELSE ROUND(GREATEST(m.kcal_wert - (m.protein_wert * 4 + m.fett_wert * 9), 0) / 4, 1)
  END,
  m.fett_wert,
  m.fiber_wert,
  m.linolsaeure_wert,
  m.alpha_linolensaeure_wert,
  m.nutrition_goal,
  m.ziel_faktor,
  CASE
    WHEN cardinality(m.fehlend) > 0 THEN 'profil_unvollstaendig'
    WHEN m.ziel_faktor IS NULL      THEN 'zielrichtung_ohne_faktor'
    ELSE NULL
  END,
  m.fehlend
FROM makros m;
$$;

COMMENT ON FUNCTION goals.berechne_zielwerte(UUID, DATE) IS
  'Zielwerte aus dem Profil (GO-04). REINE Funktion: Mifflin-St Jeor, Makros, Linolsaeure 4 E%, Alpha-Linolensaeure 0,5 E% und C-464-Fiber 30 g/Tag gemaess Nutrition SPEC_01.';

GRANT EXECUTE ON FUNCTION goals.berechne_zielwerte(UUID, DATE)
  TO authenticated, service_role;

CREATE FUNCTION goals.zielwerte_am(
  p_user_id UUID,
  p_stichtag DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  gueltig_ab   DATE,
  kcal         NUMERIC,
  protein_g    NUMERIC,
  carbs_g      NUMERIC,
  fat_g        NUMERIC,
  fiber_g      NUMERIC,
  linoleic_acid_g NUMERIC,
  alpha_linolenic_acid_g NUMERIC,
  herkunft     TEXT,
  tdee         NUMERIC,
  nutrition_goal TEXT
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT t.gueltig_ab, t.kcal, t.protein_g, t.carbs_g, t.fat_g, t.fiber_g,
         t.linoleic_acid_g, t.alpha_linolenic_acid_g,
         t.herkunft, t.tdee, t.nutrition_goal
  FROM goals.nutrition_targets t
  WHERE t.user_id = p_user_id
    AND t.gueltig_ab <= p_stichtag
  ORDER BY t.gueltig_ab DESC
  LIMIT 1;
$$;

COMMENT ON FUNCTION goals.zielwerte_am(UUID, DATE) IS
  'Die an einem Tag gueltigen Zielwerte einschliesslich C-464-Fiberziel — die juengste Zeile, deren gueltig_ab nicht nach dem Stichtag liegt.';

GRANT EXECUTE ON FUNCTION goals.zielwerte_am(UUID, DATE)
  TO authenticated, service_role;

-- C-381 schreibt beim Bestaetigen eines Coach-Vorschlags eine neue,
-- zeitgueltige Zielzeile. Sie muss das neue Feld explizit mitnehmen; sonst
-- wuerde genau dieser Schreibweg den 15%-Scoreanteil wieder verlieren.
CREATE OR REPLACE FUNCTION coach.bestaetige_aktion(p_action_id uuid)
RETURNS TABLE (
  action_id uuid,
  target_valid_from date,
  protein_g numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $function$
DECLARE
  v_actor uuid := auth.uid();
  v_action coach.pending_actions%ROWTYPE;
  v_target goals.nutrition_targets%ROWTYPE;
  v_delta numeric;
  v_new_protein numeric;
  v_note text;
  v_created_target boolean;
BEGIN
  IF v_actor IS NULL THEN
    RAISE EXCEPTION 'Anmeldung erforderlich' USING ERRCODE = '42501';
  END IF;

  SELECT pa.* INTO v_action
  FROM coach.pending_actions AS pa
  WHERE pa.id = p_action_id
    AND pa.client_id = v_actor
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Aktion ist nicht fuer diesen Klienten bestaetigbar'
      USING ERRCODE = '42501';
  END IF;
  IF v_action.status <> 'pending' THEN
    RAISE EXCEPTION 'Aktion ist nicht mehr offen' USING ERRCODE = 'P0001';
  END IF;
  IF v_action.expires_at <= statement_timestamp() THEN
    RAISE EXCEPTION 'Aktion ist abgelaufen' USING ERRCODE = 'P0001';
  END IF;
  IF v_action.module <> 'nutrition'
     OR v_action.action_type <> 'adjust_macro_targets' THEN
    RAISE EXCEPTION 'Aktionstyp ist nicht ausfuehrbar' USING ERRCODE = '22023';
  END IF;
  IF jsonb_typeof(v_action.payload) <> 'object'
     OR NOT (v_action.payload ? 'protein_g_delta')
     OR jsonb_typeof(v_action.payload -> 'protein_g_delta') <> 'number'
     OR (v_action.payload ? 'reason' AND jsonb_typeof(v_action.payload -> 'reason') <> 'string')
     OR EXISTS (
       SELECT 1
       FROM jsonb_object_keys(v_action.payload) AS payload_key(key)
       WHERE payload_key.key NOT IN ('protein_g_delta', 'reason')
     ) THEN
    RAISE EXCEPTION 'Payload fuer adjust_macro_targets ist ungueltig'
      USING ERRCODE = '22023';
  END IF;

  v_delta := (v_action.payload ->> 'protein_g_delta')::numeric;
  IF v_delta = 0 THEN
    RAISE EXCEPTION 'protein_g_delta darf nicht null sein' USING ERRCODE = '22023';
  END IF;

  PERFORM 1 FROM auth.users AS u WHERE u.id = v_action.client_id FOR UPDATE;
  SELECT nt.* INTO v_target
  FROM goals.nutrition_targets AS nt
  WHERE nt.user_id = v_action.client_id
    AND nt.gueltig_ab <= current_date
  ORDER BY nt.gueltig_ab DESC
  LIMIT 1
  FOR UPDATE;

  IF NOT FOUND OR v_target.protein_g IS NULL THEN
    RAISE EXCEPTION 'Kein bestimmbarer Protein-Zielwert fuer diese Aktion'
      USING ERRCODE = 'P0001';
  END IF;

  v_new_protein := v_target.protein_g + v_delta;
  IF v_new_protein < 0 OR v_new_protein > 500 THEN
    RAISE EXCEPTION 'Protein-Zielwert liegt ausserhalb des erlaubten Bereichs'
      USING ERRCODE = '22023';
  END IF;

  v_note := concat_ws(E'\n', NULLIF(v_target.notiz, ''),
    'Coach-Bestaetigung: ' || COALESCE(NULLIF(v_action.payload ->> 'reason', ''), 'adjust_macro_targets'));
  v_created_target := v_target.gueltig_ab <> current_date;

  IF v_created_target THEN
    INSERT INTO goals.nutrition_targets (
      user_id, gueltig_ab, kcal, protein_g, carbs_g, fat_g, fiber_g,
      linoleic_acid_g, alpha_linolenic_acid_g, herkunft, tdee,
      nutrition_goal, notiz
    ) VALUES (
      v_target.user_id, current_date, v_target.kcal, v_new_protein,
      v_target.carbs_g, v_target.fat_g, v_target.fiber_g,
      v_target.linoleic_acid_g, v_target.alpha_linolenic_acid_g, 'manuell', v_target.tdee,
      v_target.nutrition_goal, v_note
    );
  ELSE
    UPDATE goals.nutrition_targets AS nt
    SET protein_g = v_new_protein,
        herkunft = 'manuell',
        notiz = v_note,
        updated_at = statement_timestamp()
    WHERE nt.user_id = v_target.user_id
      AND nt.gueltig_ab = current_date;
  END IF;

  UPDATE coach.pending_actions AS pa
  SET status = 'confirmed',
      confirmed_at = statement_timestamp(),
      confirmed_by = v_actor
  WHERE pa.id = v_action.id;

  INSERT INTO coach.action_log (
    pending_action_id, coach_id, client_id, module, action_type,
    payload_snapshot, undo_data, executed_by
  ) VALUES (
    v_action.id, v_action.coach_id, v_action.client_id,
    v_action.module, v_action.action_type, v_action.payload,
    jsonb_build_object(
      'target_valid_from', current_date,
      'created_target_row', v_created_target,
      'target_before', jsonb_build_object(
        'gueltig_ab', v_target.gueltig_ab,
        'kcal', v_target.kcal,
        'protein_g', v_target.protein_g,
        'carbs_g', v_target.carbs_g,
        'fat_g', v_target.fat_g,
        'fiber_g', v_target.fiber_g,
        'linoleic_acid_g', v_target.linoleic_acid_g,
        'alpha_linolenic_acid_g', v_target.alpha_linolenic_acid_g,
        'herkunft', v_target.herkunft,
        'tdee', v_target.tdee,
        'nutrition_goal', v_target.nutrition_goal,
        'notiz', v_target.notiz
      )
    ),
    v_actor
  );

  RETURN QUERY SELECT v_action.id, current_date, v_new_protein;
END;
$function$;

REVOKE ALL ON FUNCTION coach.bestaetige_aktion(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION coach.bestaetige_aktion(uuid) TO authenticated, service_role;

COMMENT ON FUNCTION coach.bestaetige_aktion(uuid) IS
  'C-381/G-151, C-464: Atomare Klientenbestaetigung einer erlaubten Coach-Aktion; beim zeitgueltigen Zielwertwechsel bleibt fiber_g erhalten.';

COMMIT;
