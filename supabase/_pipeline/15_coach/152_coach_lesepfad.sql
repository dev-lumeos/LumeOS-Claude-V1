-- =============================================================
-- 152 — Der Coach-Lesepfad (F-07)
-- Datum: 2026-08-20
-- Zweck:
--   Bis hier referenzierte kein Modulschema coach.client_permissions
--   (Entwurf F-06, 4.2) — auch mit erteilter full-Freigabe las ein
--   Coach null Zeilen. Dieser Schritt setzt die Freigabe durch, in der
--   Datenbank, nicht in der Anwendung:
--
--   * stufe 'full'    -> zusaetzliche SELECT-Policies auf den
--                        Nutzerdaten-Tabellen der sechs Module.
--   * stufe 'summary' -> definierte Aggregate je Modul als
--                        SECURITY-DEFINER-Funktionen mit eigener
--                        Freigabepruefung — kein Zeilenzugriff.
--   * stufe 'none'    -> nichts; die Funktionen melden
--                        freigegeben=false statt Daten.
--
-- DIE REGEL STEHT AN EINER STELLE: coach.hat_sicht(). Wer eine
-- weitere Tabelle oeffnet, ruft sie — er schreibt die Stufenlogik
-- nicht neu (Repo-Regel: Ableitungsregeln nur an einer Stelle).
--
-- ZUORDNUNG: Die Sicht folgt dem SCHEMA. goals.nutrition_targets
--   faellt damit unter die goals-Sicht, Koerpermasse ebenso. Ob
--   Koerpermasse eine eigene Sicht braucht, ist T5 (Tom, offen).
--
-- T4 (summary je Modul) — konservative Wahl, hier dokumentiert:
--   nutrition:   Tage mit Eintrag + Tagesschnitt kcal/P/C/F (7 Tage).
--                Keine Mahlzeiten, keine Positionen.
--   training:    Einheiten, Saetze, Volumen (30 Tage), letzte Einheit.
--                Keine Uebungen, keine Gewichte je Satz.
--   recovery:    Score-Schnitt (7 Tage), letzter Score + Datum.
--                Kein Schlaf, kein HRV, keine Checkin-Rohdaten.
--   goals:       Zahl aktiver Ziele, letztes Gewicht + 30-Tage-Delta.
--                Keine Zieltexte, keine Umfaenge.
--   supplements: Einnahmen geplant/genommen (7 Tage).
--                Keine Substanznamen, kein Stack.
--   medical:     Zahl der Befunde + Datum des letzten. KEINE Werte,
--                keine Marker, keine Referenzbereiche (Art. 9; die
--                mittlere Stufe zeigt bei Medical nur, DASS Befunde
--                existieren).
--   Alles Zahlen und Daten — keine Bewertungen, keine Ampeln.
--
-- Kein Dashboard-Cache, keine materialisierte Sicht: ein Widerruf
-- wirkt beim naechsten Request (F-06, 4.2; Spec-Befund N-15).
-- =============================================================

BEGIN;

-- -------------------------------------------------------------
-- Die eine Stelle: Sichtpruefung Coach -> Klient je Modul.
-- SECURITY INVOKER reicht: die RLS von client_permissions laesst den
-- Coach seine eigenen Zeilen lesen (150). expires_at wird beachtet.
-- STABLE: liest nur, haengt von auth.uid() und now() ab.
-- -------------------------------------------------------------
CREATE OR REPLACE FUNCTION coach.hat_sicht(
  p_client uuid,
  p_modul text,
  p_stufe text DEFAULT 'full'
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM coach.client_permissions p
    WHERE p.coach_id = (SELECT auth.uid())
      AND p.client_id = p_client
      AND (p.expires_at IS NULL OR p.expires_at > now())
      AND (
        CASE p_modul
          WHEN 'nutrition'   THEN p.nutrition_visibility
          WHEN 'training'    THEN p.training_visibility
          WHEN 'recovery'    THEN p.recovery_visibility
          WHEN 'goals'       THEN p.goals_visibility
          WHEN 'supplements' THEN p.supplements_visibility
          WHEN 'medical'     THEN p.medical_visibility
          WHEN 'buddy'       THEN p.buddy_visibility
        END
      ) = ANY (
        CASE WHEN p_stufe = 'full'
          THEN ARRAY['full']
          ELSE ARRAY['summary', 'full']
        END
      )
  );
$$;

COMMENT ON FUNCTION coach.hat_sicht(uuid, text, text) IS
  'Die eine Stelle der Sichtpruefung: hat der angemeldete Coach fuer diesen Klienten in diesem Modul mindestens diese Stufe? Beachtet expires_at.';

-- -------------------------------------------------------------
-- full: SELECT-Policies je Nutzerdaten-Tabelle. Nur SELECT — der
-- Schreibweg des Coaches laeuft ausschliesslich ueber
-- coach.pending_actions (ein Durchsetzungspunkt, F-06 4.3).
-- Kindtabellen ohne user_id gehen ueber die Elterntabelle, nach dem
-- Muster der bestehenden Owner-Policies (106, 130).
-- -------------------------------------------------------------

-- nutrition (3)
DROP POLICY IF EXISTS meals_coach_read ON nutrition.meals;
CREATE POLICY meals_coach_read ON nutrition.meals
  FOR SELECT TO authenticated USING (coach.hat_sicht(user_id, 'nutrition', 'full'));

DROP POLICY IF EXISTS meal_items_coach_read ON nutrition.meal_items;
CREATE POLICY meal_items_coach_read ON nutrition.meal_items
  FOR SELECT TO authenticated USING (coach.hat_sicht(user_id, 'nutrition', 'full'));

DROP POLICY IF EXISTS water_logs_coach_read ON nutrition.water_logs;
CREATE POLICY water_logs_coach_read ON nutrition.water_logs
  FOR SELECT TO authenticated USING (coach.hat_sicht(user_id, 'nutrition', 'full'));

-- training (3)
DROP POLICY IF EXISTS workout_sessions_coach_read ON training.workout_sessions;
CREATE POLICY workout_sessions_coach_read ON training.workout_sessions
  FOR SELECT TO authenticated USING (coach.hat_sicht(user_id, 'training', 'full'));

DROP POLICY IF EXISTS workout_exercises_coach_read ON training.workout_exercises;
CREATE POLICY workout_exercises_coach_read ON training.workout_exercises
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM training.workout_sessions s
      WHERE s.id = workout_session_id
        AND coach.hat_sicht(s.user_id, 'training', 'full')
    )
  );

DROP POLICY IF EXISTS workout_sets_coach_read ON training.workout_sets;
CREATE POLICY workout_sets_coach_read ON training.workout_sets
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1
      FROM training.workout_exercises we
      JOIN training.workout_sessions s ON s.id = we.workout_session_id
      WHERE we.id = workout_exercise_id
        AND coach.hat_sicht(s.user_id, 'training', 'full')
    )
  );

-- recovery (3)
DROP POLICY IF EXISTS recovery_checkins_coach_read ON recovery.checkins;
CREATE POLICY recovery_checkins_coach_read ON recovery.checkins
  FOR SELECT TO authenticated USING (coach.hat_sicht(user_id, 'recovery', 'full'));

DROP POLICY IF EXISTS recovery_scores_coach_read ON recovery.scores;
CREATE POLICY recovery_scores_coach_read ON recovery.scores
  FOR SELECT TO authenticated USING (coach.hat_sicht(user_id, 'recovery', 'full'));

DROP POLICY IF EXISTS recovery_modality_log_coach_read ON recovery.modality_log;
CREATE POLICY recovery_modality_log_coach_read ON recovery.modality_log
  FOR SELECT TO authenticated USING (coach.hat_sicht(user_id, 'recovery', 'full'));

-- goals (6) — die Sicht folgt dem Schema: nutrition_targets und
-- Koerpermasse liegen in goals und fallen unter die goals-Sicht.
DROP POLICY IF EXISTS user_goals_coach_read ON goals.user_goals;
CREATE POLICY user_goals_coach_read ON goals.user_goals
  FOR SELECT TO authenticated USING (coach.hat_sicht(user_id, 'goals', 'full'));

DROP POLICY IF EXISTS goal_phases_coach_read ON goals.goal_phases;
CREATE POLICY goal_phases_coach_read ON goals.goal_phases
  FOR SELECT TO authenticated USING (coach.hat_sicht(user_id, 'goals', 'full'));

DROP POLICY IF EXISTS goal_milestones_coach_read ON goals.goal_milestones;
CREATE POLICY goal_milestones_coach_read ON goals.goal_milestones
  FOR SELECT TO authenticated USING (coach.hat_sicht(user_id, 'goals', 'full'));

DROP POLICY IF EXISTS body_measurements_coach_read ON goals.body_measurements;
CREATE POLICY body_measurements_coach_read ON goals.body_measurements
  FOR SELECT TO authenticated USING (coach.hat_sicht(user_id, 'goals', 'full'));

DROP POLICY IF EXISTS body_circumferences_coach_read ON goals.body_circumferences;
CREATE POLICY body_circumferences_coach_read ON goals.body_circumferences
  FOR SELECT TO authenticated USING (coach.hat_sicht(user_id, 'goals', 'full'));

DROP POLICY IF EXISTS nutrition_targets_coach_read ON goals.nutrition_targets;
CREATE POLICY nutrition_targets_coach_read ON goals.nutrition_targets
  FOR SELECT TO authenticated USING (coach.hat_sicht(user_id, 'goals', 'full'));

-- supplements (3)
DROP POLICY IF EXISTS user_stacks_coach_read ON supplements.user_stacks;
CREATE POLICY user_stacks_coach_read ON supplements.user_stacks
  FOR SELECT TO authenticated USING (coach.hat_sicht(user_id, 'supplements', 'full'));

DROP POLICY IF EXISTS stack_items_coach_read ON supplements.stack_items;
CREATE POLICY stack_items_coach_read ON supplements.stack_items
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM supplements.user_stacks us
      WHERE us.id = stack_id
        AND coach.hat_sicht(us.user_id, 'supplements', 'full')
    )
  );

DROP POLICY IF EXISTS intake_logs_coach_read ON supplements.intake_logs;
CREATE POLICY intake_logs_coach_read ON supplements.intake_logs
  FOR SELECT TO authenticated USING (coach.hat_sicht(user_id, 'supplements', 'full'));

-- medical (4) — full heisst full; die Voreinstellung der Freigabe ist
-- none, und die Einwilligung vergibt nur der Klient (150).
DROP POLICY IF EXISTS lab_reports_coach_read ON medical.lab_reports;
CREATE POLICY lab_reports_coach_read ON medical.lab_reports
  FOR SELECT TO authenticated USING (coach.hat_sicht(user_id, 'medical', 'full'));

DROP POLICY IF EXISTS lab_result_values_coach_read ON medical.lab_result_values;
CREATE POLICY lab_result_values_coach_read ON medical.lab_result_values
  FOR SELECT TO authenticated USING (coach.hat_sicht(user_id, 'medical', 'full'));

DROP POLICY IF EXISTS user_medications_coach_read ON medical.user_medications;
CREATE POLICY user_medications_coach_read ON medical.user_medications
  FOR SELECT TO authenticated USING (coach.hat_sicht(user_id, 'medical', 'full'));

DROP POLICY IF EXISTS user_conditions_coach_read ON medical.user_conditions;
CREATE POLICY user_conditions_coach_read ON medical.user_conditions
  FOR SELECT TO authenticated USING (coach.hat_sicht(user_id, 'medical', 'full'));

-- -------------------------------------------------------------
-- summary: ein Aggregat je Modul, SECURITY DEFINER mit eigener
-- Freigabepruefung. Definer ist noetig, weil die mittlere Stufe
-- gerade KEINEN Zeilenzugriff bedeutet — die Funktion liest vorbei
-- an RLS und gibt nur das definierte Aggregat heraus.
-- Jede Funktion prueft zuerst selbst; ohne Freigabe kommt
-- {"freigegeben": false} und sonst nichts.
-- -------------------------------------------------------------

CREATE OR REPLACE FUNCTION coach.summary_nutrition(p_client uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v jsonb;
BEGIN
  IF NOT coach.hat_sicht(p_client, 'nutrition', 'summary') THEN
    RETURN jsonb_build_object('freigegeben', false);
  END IF;

  SELECT jsonb_build_object(
    'freigegeben', true,
    'tage', 7,
    'tage_mit_eintrag', count(*),
    'kcal_schnitt', round(avg(t.enercc)),
    'protein_g_schnitt', round(avg(t.prot625)),
    'carbs_g_schnitt', round(avg(t.cho)),
    'fat_g_schnitt', round(avg(t.fat)),
    'letzter_eintrag', max(t.entry_date)
  )
  INTO v
  FROM (
    SELECT m.entry_date,
           sum(mi.enercc) AS enercc,
           sum(mi.prot625) AS prot625,
           sum(mi.cho) AS cho,
           sum(mi.fat) AS fat
    FROM nutrition.meals m
    JOIN nutrition.meal_items mi ON mi.meal_id = m.id
    WHERE m.user_id = p_client
      AND m.entry_date > current_date - 7
    GROUP BY m.entry_date
  ) t;

  RETURN v;
END;
$$;

CREATE OR REPLACE FUNCTION coach.summary_training(p_client uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v jsonb;
BEGIN
  IF NOT coach.hat_sicht(p_client, 'training', 'summary') THEN
    RETURN jsonb_build_object('freigegeben', false);
  END IF;

  SELECT jsonb_build_object(
    'freigegeben', true,
    'tage', 30,
    'einheiten_30d', count(*),
    'saetze_30d', COALESCE(sum(s.total_sets), 0),
    'volumen_kg_30d', round(COALESCE(sum(s.total_volume_kg), 0)),
    'letzte_einheit', max(s.session_date)
  )
  INTO v
  FROM training.workout_sessions s
  WHERE s.user_id = p_client
    AND s.session_date > current_date - 30;

  RETURN v;
END;
$$;

CREATE OR REPLACE FUNCTION coach.summary_recovery(p_client uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v jsonb;
BEGIN
  IF NOT coach.hat_sicht(p_client, 'recovery', 'summary') THEN
    RETURN jsonb_build_object('freigegeben', false);
  END IF;

  SELECT jsonb_build_object(
    'freigegeben', true,
    'tage', 7,
    'score_schnitt_7d', round(avg(sc.score), 1),
    'letzter_score', (
      SELECT s2.score FROM recovery.scores s2
      WHERE s2.user_id = p_client
      ORDER BY s2.entry_date DESC LIMIT 1
    ),
    'letzter_tag', max(sc.entry_date)
  )
  INTO v
  FROM recovery.scores sc
  WHERE sc.user_id = p_client
    AND sc.entry_date > current_date - 7;

  RETURN v;
END;
$$;

CREATE OR REPLACE FUNCTION coach.summary_goals(p_client uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_gewicht numeric;
  v_gewicht_datum date;
  v_gewicht_vor30 numeric;
  v_aktive integer;
BEGIN
  IF NOT coach.hat_sicht(p_client, 'goals', 'summary') THEN
    RETURN jsonb_build_object('freigegeben', false);
  END IF;

  SELECT count(*) INTO v_aktive
  FROM goals.user_goals g
  WHERE g.user_id = p_client AND g.status = 'active';

  SELECT bm.weight_kg, bm.measurement_date
  INTO v_gewicht, v_gewicht_datum
  FROM goals.body_measurements bm
  WHERE bm.user_id = p_client AND bm.weight_kg IS NOT NULL
  ORDER BY bm.measurement_date DESC
  LIMIT 1;

  SELECT bm.weight_kg
  INTO v_gewicht_vor30
  FROM goals.body_measurements bm
  WHERE bm.user_id = p_client
    AND bm.weight_kg IS NOT NULL
    AND bm.measurement_date <= current_date - 30
  ORDER BY bm.measurement_date DESC
  LIMIT 1;

  RETURN jsonb_build_object(
    'freigegeben', true,
    'aktive_ziele', v_aktive,
    'gewicht_kg', v_gewicht,
    'gewicht_datum', v_gewicht_datum,
    'gewicht_delta_30d_kg',
      CASE WHEN v_gewicht IS NULL OR v_gewicht_vor30 IS NULL
        THEN NULL
        ELSE round(v_gewicht - v_gewicht_vor30, 1)
      END
  );
END;
$$;

CREATE OR REPLACE FUNCTION coach.summary_supplements(p_client uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v jsonb;
BEGIN
  IF NOT coach.hat_sicht(p_client, 'supplements', 'summary') THEN
    RETURN jsonb_build_object('freigegeben', false);
  END IF;

  SELECT jsonb_build_object(
    'freigegeben', true,
    'tage', 7,
    'einnahmen_7d', count(*),
    'genommen_7d', count(*) FILTER (WHERE il.status = 'taken'),
    'letzter_tag', max(il.intake_date)
  )
  INTO v
  FROM supplements.intake_logs il
  WHERE il.user_id = p_client
    AND il.intake_date > current_date - 7;

  RETURN v;
END;
$$;

CREATE OR REPLACE FUNCTION coach.summary_medical(p_client uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v jsonb;
BEGIN
  IF NOT coach.hat_sicht(p_client, 'medical', 'summary') THEN
    RETURN jsonb_build_object('freigegeben', false);
  END IF;

  -- Bewusst nur Existenz und Datum: keine Werte, keine Marker,
  -- keine Referenzbereiche (Art. 9 DSGVO; F-06, Abschnitt 4.2).
  SELECT jsonb_build_object(
    'freigegeben', true,
    'befunde_gesamt', count(*),
    'letzter_befund', max(lr.report_date)
  )
  INTO v
  FROM medical.lab_reports lr
  WHERE lr.user_id = p_client;

  RETURN v;
END;
$$;

-- -------------------------------------------------------------
-- Die Klientenliste des Portals. DEFINER, weil auth.users fuer
-- authenticated unerreichbar ist und public.profiles keinen Namen
-- traegt — herausgegeben werden nur E-Mail und Anzeigename der
-- EIGENEN Klienten (coach_id = auth.uid()), sonst nichts.
-- -------------------------------------------------------------
CREATE OR REPLACE FUNCTION coach.klienten()
RETURNS TABLE (
  relationship_id uuid,
  client_id uuid,
  status text,
  started_at timestamptz,
  invited_at timestamptz,
  invite_note text,
  email text,
  display_name text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT
    r.id,
    r.client_id,
    r.status,
    r.started_at,
    r.created_at,
    r.invite_note,
    u.email::text,
    COALESCE(u.raw_app_meta_data->>'full_name', split_part(u.email::text, '@', 1))
  FROM coach.relationships r
  JOIN auth.users u ON u.id = r.client_id
  WHERE r.coach_id = (SELECT auth.uid());
$$;

COMMENT ON FUNCTION coach.klienten() IS
  'Beziehungen des angemeldeten Coaches mit E-Mail und Anzeigenamen. DEFINER nur fuer den auth.users-Join; die WHERE-Klausel bindet an auth.uid().';

-- DEFINER-Funktionen: Ausfuehrung nur fuer Angemeldete, nicht public.
REVOKE ALL ON FUNCTION coach.summary_nutrition(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION coach.summary_training(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION coach.summary_recovery(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION coach.summary_goals(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION coach.summary_supplements(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION coach.summary_medical(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION coach.klienten() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION coach.klienten() TO authenticated;
GRANT EXECUTE ON FUNCTION coach.hat_sicht(uuid, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION coach.summary_nutrition(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION coach.summary_training(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION coach.summary_recovery(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION coach.summary_goals(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION coach.summary_supplements(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION coach.summary_medical(uuid) TO authenticated;

DO $$
DECLARE
  v_policies integer;
  v_funktionen integer;
BEGIN
  SELECT count(*) INTO v_policies
  FROM pg_policies
  WHERE policyname LIKE '%_coach_read'
    AND schemaname IN ('nutrition', 'training', 'recovery', 'goals', 'supplements', 'medical');

  IF v_policies <> 22 THEN
    RAISE EXCEPTION '152: % coach_read-Policies statt 22', v_policies;
  END IF;

  SELECT count(*) INTO v_funktionen
  FROM pg_proc p
  JOIN pg_namespace n ON n.oid = p.pronamespace
  WHERE n.nspname = 'coach'
    AND p.proname IN (
      'hat_sicht', 'summary_nutrition', 'summary_training',
      'summary_recovery', 'summary_goals', 'summary_supplements',
      'summary_medical', 'klienten'
    );

  IF v_funktionen <> 8 THEN
    RAISE EXCEPTION '152: % Funktionen statt 8', v_funktionen;
  END IF;

  RAISE NOTICE 'OK: Coach-Lesepfad — 22 full-Policies, 6 summary-Funktionen, Klientenliste, eine Sichtregel';
END $$;

COMMIT;
