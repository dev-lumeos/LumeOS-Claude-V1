-- C-501 — Zusatzdaten fuer die leeren, bereits lesbaren Modulpfade.
--
-- Aufruf: NACH testdaten-einspielen.ts und eigenes-konto-fuellen.sql.
-- Ausschliesslich dev@lumeos.app; die drei Zeilen sind klar markiert und
-- werden bei jedem Lauf ersetzt. Sie sind UI-Szenarien, keine Therapie-
-- oder Dosierungsempfehlung. Fortschrittsfotos werden hier bewusst nicht
-- erzeugt: ihre Metazeile ohne echtes privates Storage-Objekt waere tot.
\set ON_ERROR_STOP on

BEGIN;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'dev@lumeos.app') THEN
    RAISE EXCEPTION 'C-501 braucht dev@lumeos.app; erst eigenes-konto-fuellen.sql ausfuehren';
  END IF;
END $$;

DELETE FROM medical.user_medications
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'dev@lumeos.app')
  AND source_detail = 'C-501 dev UI seed';

WITH plan(canonical_name, dose_amount, dose_unit, doses_per_day, route,
          start_date, end_date, is_active, indication, notes,
          monitoring, monitoring_frequency, last_test, next_due, monitoring_overdue) AS (
  VALUES
    ('Metformin'::text, 500::numeric, 'mg'::text, 2::numeric, 'oral'::text,
     current_date - 180, NULL::date, true,
     'C-501 UI-Szenario: aktive Katalogbindung'::text,
     'Testdaten, keine Dosierungsempfehlung.'::text,
     true, 'quarterly'::text, current_date - 70, current_date + 20, false),
    ('Amlodipine'::text, 5::numeric, 'mg'::text, 1::numeric, 'oral'::text,
     current_date - 365, NULL::date, true,
     'C-501 UI-Szenario: Monitoring ueberfaellig'::text,
     'Testdaten, keine Dosierungsempfehlung.'::text,
     true, 'quarterly'::text, current_date - 105, current_date - 7, true),
    ('Atorvastatin'::text, 20::numeric, 'mg'::text, 1::numeric, 'oral'::text,
     current_date - 420, current_date - 31, false,
     'C-501 UI-Szenario: abgesetzter Eintrag'::text,
     'Testdaten, keine Dosierungsempfehlung.'::text,
     false, NULL::text, NULL::date, NULL::date, false)
)
INSERT INTO medical.user_medications (
  id, user_id, active_substance_id, name, drug_class, cyp_profile,
  dose_amount, dose_unit, doses_per_day, route, start_date, end_date,
  is_active, indication, notes, measurement_source, source_detail,
  source_kind, source_actor, source_recorded_at,
  monitoring, monitoring_frequency, last_test, next_due, monitoring_overdue
)
SELECT
  CASE p.canonical_name
    WHEN 'Metformin' THEN 'c5010000-0000-0000-0000-000000000001'::uuid
    WHEN 'Amlodipine' THEN 'c5010000-0000-0000-0000-000000000002'::uuid
    WHEN 'Atorvastatin' THEN 'c5010000-0000-0000-0000-000000000003'::uuid
  END,
  u.id, s.id, s.canonical_name, s.drug_class, s.cyp_profile,
  p.dose_amount, p.dose_unit, p.doses_per_day, p.route, p.start_date, p.end_date,
  p.is_active, p.indication, p.notes, 'seed', 'C-501 dev UI seed',
  'seed', 'C-501 Testdaten', now(),
  p.monitoring, p.monitoring_frequency, p.last_test, p.next_due, p.monitoring_overdue
FROM plan p
JOIN medical.medication_active_substances s ON s.canonical_name = p.canonical_name
CROSS JOIN (SELECT id FROM auth.users WHERE email = 'dev@lumeos.app') u;

DO $$
DECLARE
  v_seeded integer;
  v_foreign integer;
BEGIN
  SELECT count(*) INTO v_seeded
  FROM medical.user_medications
  WHERE source_detail = 'C-501 dev UI seed';

  SELECT count(*) INTO v_foreign
  FROM medical.user_medications um
  JOIN auth.users u ON u.id = um.user_id
  WHERE um.source_detail = 'C-501 dev UI seed'
    AND u.email <> 'dev@lumeos.app';

  IF v_seeded <> 3 OR v_foreign <> 0 THEN
    RAISE EXCEPTION 'C-501 erwartete 3 dev-Zeilen und 0 fremde; ist: %, %', v_seeded, v_foreign;
  END IF;
END $$;

COMMIT;
