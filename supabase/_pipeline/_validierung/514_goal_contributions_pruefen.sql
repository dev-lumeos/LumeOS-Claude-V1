-- G-514: Vertrag und beide gebauten Lieferwege gegen deterministische
-- Wegwerf-Testdaten auf den bekannten Nachweiskonten.
-- Dieser Nachweis laeuft ausschliesslich auf einer Wegwerf-Datenbank.

BEGIN;

DO $$
DECLARE
  v_test_user uuid;
  v_dev_user uuid;
  v_goal_id uuid := gen_random_uuid();
  v_dev_goal_id uuid := gen_random_uuid();
  v_zero_date date;
  v_expected integer;
  v_actual integer;
BEGIN
  IF to_regclass('goals.goal_contributions') IS NULL THEN
    RAISE EXCEPTION 'G-514: goals.goal_contributions fehlt';
  END IF;

  INSERT INTO auth.users (id, email, raw_app_meta_data, created_at)
  SELECT
    '20000000-0000-0000-0000-000000000901'::uuid,
    'test-user@lumeos.local',
    '{"provider":"email","seed":"g514_probe"}'::jsonb,
    now()
  WHERE NOT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'test-user@lumeos.local'
  );

  INSERT INTO auth.users (id, email, raw_app_meta_data, created_at)
  SELECT
    '10000000-0000-0000-0000-000000000101'::uuid,
    'dev@lumeos.app',
    '{"provider":"email","seed":"g514_probe"}'::jsonb,
    now()
  WHERE NOT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'dev@lumeos.app'
  );

  SELECT id INTO STRICT v_test_user
  FROM auth.users
  WHERE email = 'test-user@lumeos.local';

  SELECT id INTO STRICT v_dev_user
  FROM auth.users
  WHERE email = 'dev@lumeos.app';

  INSERT INTO recovery.scores (
    user_id, entry_date, score,
    sleep_quality_score, sleep_duration_score,
    subjective_feeling_score, soreness_score,
    training_load_score, nutrition_score, mood_score,
    sleep_quality_points, sleep_duration_points,
    subjective_feeling_points, soreness_points,
    training_load_points, nutrition_points, mood_points,
    source_detail
  ) VALUES
    (v_test_user, DATE '2026-09-14', 80,
     80, 80, 80, 80, 80, 80, 80,
     1, 1, 1, 1, 1, 1, 1, 'g514_probe'),
    (v_test_user, DATE '2026-09-15', 0,
     0, 0, 0, 0, 0, 0, 0,
     0, 0, 0, 0, 0, 0, 0, 'g514_probe'),
    (v_dev_user, DATE '2026-11-06', 74.9,
     75, 75, 75, 75, 75, 75, 74.3,
     1, 1, 1, 1, 1, 1, 1, 'g514_future_probe')
  ON CONFLICT (user_id, entry_date) DO NOTHING;

  INSERT INTO supplements.intake_logs (
    user_id, intake_date, status,
    supplement_name_snapshot, dose_snapshot, dose_unit_snapshot,
    source_detail
  ) VALUES
    (v_test_user, DATE '2026-09-14', 'taken',
     'G-514 Probe', 1, 'serving', 'g514_probe'),
    (v_test_user, DATE '2026-09-15', 'skipped',
     'G-514 Probe', 1, 'serving', 'g514_probe');

  INSERT INTO goals.user_goals (
    id, user_id, goal_type, subtype, title, gueltig_ab,
    status, priority, is_primary
  ) VALUES (
    v_goal_id, v_test_user, 'health', 'g514_probe',
    'G-514 Wegwerfprobe', DATE '2026-06-18',
    'active', 1, false
  );

  INSERT INTO goals.user_goals (
    id, user_id, goal_type, subtype, title, gueltig_ab,
    status, priority, is_primary
  ) VALUES (
    v_dev_goal_id, v_dev_user, 'health', 'g514_future_probe',
    'G-514 Zukunftsprobe', DATE '2026-06-18',
    'active', 1, false
  );

  PERFORM goals.refresh_recovery_contributions(
    v_test_user,
    DATE '2026-09-29'
  );
  PERFORM goals.refresh_supplement_contributions(
    v_test_user,
    DATE '2026-09-29'
  );
  PERFORM goals.refresh_recovery_contributions(
    v_dev_user,
    DATE '2026-09-29'
  );

  SELECT count(*)::integer INTO v_expected
  FROM recovery.scores s
  WHERE s.user_id = v_test_user
    AND s.entry_date BETWEEN DATE '2026-06-18' AND DATE '2026-09-29';

  SELECT count(*)::integer INTO v_actual
  FROM goals.goal_contributions c
  WHERE c.goal_id = v_goal_id
    AND c.module = 'recovery';

  IF v_actual <> v_expected THEN
    RAISE EXCEPTION
      'G-514 recovery: % Beitraege, erwartet %', v_actual, v_expected;
  END IF;

  SELECT count(*)::integer INTO v_expected
  FROM supplements.daily_intake_summary s
  WHERE s.user_id = v_test_user
    AND s.intake_date BETWEEN DATE '2026-06-18' AND DATE '2026-09-29';

  SELECT count(*)::integer INTO v_actual
  FROM goals.goal_contributions c
  WHERE c.goal_id = v_goal_id
    AND c.module = 'supplements';

  IF v_actual <> v_expected THEN
    RAISE EXCEPTION
      'G-514 supplements: % Beitraege, erwartet %', v_actual, v_expected;
  END IF;

  -- Ein tatsaechlicher Zukunftswert existiert, darf aber nicht geschrieben sein.
  IF NOT EXISTS (
    SELECT 1
    FROM recovery.scores s
    WHERE s.user_id = v_dev_user
      AND s.entry_date = DATE '2026-11-06'
  ) THEN
    RAISE EXCEPTION 'G-514 Gegenprobe fehlt: recovery 2026-11-06';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM goals.goal_contributions c
    WHERE c.goal_id = v_dev_goal_id
      AND c.module = 'recovery'
      AND c.contribution_date = DATE '2026-11-06'
  ) THEN
    RAISE EXCEPTION 'G-514 Zukunftswert 2026-11-06 wurde eingerechnet';
  END IF;

  -- Eine echte 0 bleibt eine vorhandene Zeile, nicht "fehlend".
  SELECT s.intake_date INTO STRICT v_zero_date
  FROM supplements.daily_intake_summary s
  WHERE s.user_id = v_test_user
    AND s.intake_date >= DATE '2026-06-18'
    AND s.intake_date <= DATE '2026-09-29'
    AND s.compliance_pct = 0
  ORDER BY s.intake_date
  LIMIT 1;

  IF NOT EXISTS (
    SELECT 1
    FROM goals.goal_contributions c
    WHERE c.goal_id = v_goal_id
      AND c.module = 'supplements'
      AND c.contribution_date = v_zero_date
      AND c.contribution_score = 0
      AND c.missing_reason IS NULL
  ) THEN
    RAISE EXCEPTION 'G-514 ein Supplements-Score 0 blieb nicht als Wert erhalten';
  END IF;

  -- Ohne Quellwert gibt es keine Zeile; das ist von der vorhandenen 0
  -- datenbankseitig unterscheidbar.
  IF EXISTS (
    SELECT 1
    FROM supplements.daily_intake_summary s
    WHERE s.user_id = v_test_user
      AND s.intake_date = DATE '2026-09-16'
  ) OR EXISTS (
    SELECT 1
    FROM goals.goal_contributions c
    WHERE c.goal_id = v_goal_id
      AND c.module = 'supplements'
      AND c.contribution_date = DATE '2026-09-16'
  ) THEN
    RAISE EXCEPTION 'G-514 ein fehlender Supplements-Tag wurde zur Zeile';
  END IF;

  -- Ein ausdruecklich nicht rechenbarer Beitrag ist wiederum eine Zeile,
  -- aber nur zusammen mit seinem Grund.
  INSERT INTO goals.goal_contributions (
    goal_id, user_id, contribution_date, module,
    contribution_score, missing_reason, details
  ) VALUES (
    v_goal_id, v_test_user, DATE '2026-09-17', 'medical',
    NULL, 'kein_medical_score', '{"probe":true}'::jsonb
  );

  IF NOT EXISTS (
    SELECT 1
    FROM goals.goal_contributions c
    WHERE c.goal_id = v_goal_id
      AND c.module = 'medical'
      AND c.contribution_date = DATE '2026-09-17'
      AND c.contribution_score IS NULL
      AND c.missing_reason = 'kein_medical_score'
  ) THEN
    RAISE EXCEPTION 'G-514 NULL plus Grund ist nicht speicherbar';
  END IF;

  BEGIN
    INSERT INTO goals.goal_contributions (
      goal_id, user_id, contribution_date, module,
      contribution_score, details
    ) VALUES (
      v_goal_id, v_test_user, DATE '2026-09-18', 'medical',
      NULL, '{}'::jsonb
    );
    RAISE EXCEPTION 'G-514 NULL ohne Grund wurde angenommen';
  EXCEPTION
    WHEN check_violation THEN NULL;
  END;

  BEGIN
    INSERT INTO goals.goal_contributions (
      goal_id, user_id, contribution_date, module,
      contribution_score, missing_reason, details
    ) VALUES (
      v_goal_id, v_test_user, DATE '2026-09-19', 'medical',
      0, 'darf_bei_nullwert_nicht_stehen', '{}'::jsonb
    );
    RAISE EXCEPTION 'G-514 Score 0 mit Fehlgrund wurde angenommen';
  EXCEPTION
    WHEN check_violation THEN NULL;
  END;

  BEGIN
    INSERT INTO goals.goal_contributions (
      goal_id, user_id, contribution_date, module,
      contribution_score, details
    ) VALUES (
      v_goal_id, v_test_user, DATE '2026-09-20', 'unbekannt',
      50, '{}'::jsonb
    );
    RAISE EXCEPTION 'G-514 unbekanntes Modul wurde angenommen';
  EXCEPTION
    WHEN check_violation THEN NULL;
  END;

  BEGIN
    INSERT INTO goals.goal_contributions (
      goal_id, user_id, contribution_date, module,
      contribution_score, details
    ) VALUES (
      v_goal_id, v_test_user, DATE '2026-09-20', 'training',
      100.01, '{}'::jsonb
    );
    RAISE EXCEPTION 'G-514 Score ausserhalb 0..100 wurde angenommen';
  EXCEPTION
    WHEN check_violation THEN NULL;
  END;

  BEGIN
    INSERT INTO goals.goal_contributions (
      goal_id, user_id, contribution_date, module,
      contribution_score, details
    ) VALUES (
      v_goal_id, v_test_user, DATE '2026-09-20', 'training',
      50, '[]'::jsonb
    );
    RAISE EXCEPTION 'G-514 details ohne Objekt wurden angenommen';
  EXCEPTION
    WHEN check_violation THEN NULL;
  END;

  BEGIN
    INSERT INTO goals.goal_contributions (
      goal_id, user_id, contribution_date, module,
      contribution_score, details
    )
    SELECT
      c.goal_id, c.user_id, c.contribution_date, c.module,
      c.contribution_score, c.details
    FROM goals.goal_contributions c
    WHERE c.goal_id = v_goal_id
      AND c.module = 'recovery'
    ORDER BY c.contribution_date
    LIMIT 1;
    RAISE EXCEPTION 'G-514 doppelter Ziel-Modul-Tag wurde angenommen';
  EXCEPTION
    WHEN unique_violation THEN NULL;
  END;

  RAISE NOTICE
    'G-514 OK: test-user recovery %, supplements %, Nullwert-Tag %, Zukunft ausgeschlossen',
    (SELECT count(*) FROM goals.goal_contributions c
      WHERE c.goal_id = v_goal_id AND c.module = 'recovery'),
    (SELECT count(*) FROM goals.goal_contributions c
      WHERE c.goal_id = v_goal_id AND c.module = 'supplements'),
    v_zero_date;
END;
$$;

ROLLBACK;
