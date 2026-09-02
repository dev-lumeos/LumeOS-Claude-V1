-- C-380: Drei explizite Dev-Seed-Pläne, getrennt vom C-150-Aufbauplan.
--
-- Aufruf nach eigenes-konto-fuellen.sql (oder allein zur Wiederherstellung):
--   docker exec -i supabase_db_LumeOS-Claude-V1 psql -U postgres -d postgres \
--     < supabase/_pipeline/_testdaten/380_seed_meal_plan_variety.sql
--
-- Idempotent. Berührt ausschließlich die Einträge der drei benannten
-- Seed-Pläne auf dev@lumeos.app; weder Aufbau-Wochenplan noch Logs.
\set ON_ERROR_STOP on

BEGIN;

SELECT id AS dev_id
FROM auth.users
WHERE email = 'dev@lumeos.app'
\gset

DO $$
DECLARE
  v_dev_id uuid;
  v_plans integer;
  v_days integer;
  v_logs integer;
BEGIN
  SELECT id INTO v_dev_id FROM auth.users WHERE email = 'dev@lumeos.app';

  SELECT count(*) INTO v_plans
  FROM nutrition.meal_plans
  WHERE user_id = v_dev_id
    AND name IN ('Cut 4-Meal 2200', 'Lean bulk 3100', 'Buddy auto-plan');

  IF v_plans <> 3 THEN
    RAISE EXCEPTION 'C-380: erwartet drei bestehende Seed-Pläne auf dev, gefunden %', v_plans;
  END IF;

  SELECT count(*) INTO v_days
  FROM nutrition.meal_plan_weeks w
  JOIN nutrition.meal_plan_days d ON d.week_id = w.id
  JOIN nutrition.meal_plans mp ON mp.id = w.plan_id
  WHERE mp.user_id = v_dev_id
    AND mp.name IN ('Cut 4-Meal 2200', 'Lean bulk 3100', 'Buddy auto-plan');

  IF v_days < 21 THEN
    RAISE EXCEPTION 'C-380: erwartet mindestens die 21 Plantage der drei Seed-Pläne, gefunden %', v_days;
  END IF;

  SELECT count(*) INTO v_logs
  FROM nutrition.meal_plan_logs l
  JOIN nutrition.meal_plans mp ON mp.id = l.plan_id
  WHERE mp.user_id = v_dev_id
    AND mp.name IN ('Cut 4-Meal 2200', 'Lean bulk 3100', 'Buddy auto-plan');

  IF v_logs <> 0 THEN
    RAISE EXCEPTION 'C-380: die drei Seed-Pläne haben % Protokollzeilen und werden nicht ersetzt', v_logs;
  END IF;
END $$;

CREATE TEMP TABLE c380_plan_slots (
  plan_name text NOT NULL,
  position integer NOT NULL,
  name text NOT NULL,
  planned_time time NOT NULL,
  PRIMARY KEY (plan_name, position)
) ON COMMIT DROP;

INSERT INTO c380_plan_slots (plan_name, position, name, planned_time) VALUES
  ('Cut 4-Meal 2200', 1, 'Frühstück', '07:30'),
  ('Cut 4-Meal 2200', 2, 'Mittagessen', '12:30'),
  ('Cut 4-Meal 2200', 3, 'Nachmittagsmahlzeit', '16:00'),
  ('Cut 4-Meal 2200', 4, 'Abendessen', '19:30'),
  ('Lean bulk 3100', 1, 'Frühstück', '07:30'),
  ('Lean bulk 3100', 2, 'Mittagessen', '12:30'),
  ('Lean bulk 3100', 3, 'Pre-Workout-Mahlzeit', '16:00'),
  ('Lean bulk 3100', 4, 'Abendessen', '19:30'),
  ('Buddy auto-plan', 1, 'Frühstück', '07:30'),
  ('Buddy auto-plan', 2, 'Mittagessen', '12:30'),
  ('Buddy auto-plan', 3, 'Zwischenmahlzeit', '16:00'),
  ('Buddy auto-plan', 4, 'Abendessen', '19:30');

INSERT INTO nutrition.meal_plan_slots (plan_id, user_id, position, name, planned_time)
SELECT mp.id, mp.user_id, s.position, s.name, s.planned_time
FROM c380_plan_slots s
JOIN nutrition.meal_plans mp ON mp.name = s.plan_name
WHERE mp.user_id = :'dev_id'::uuid
ON CONFLICT (plan_id, position) DO UPDATE
  SET name = EXCLUDED.name,
      planned_time = EXCLUDED.planned_time;

-- C-403/E-62: `once`-Pläne beschreiben ihre gesamte Laufzeit. Die
-- vorhandene erste Woche bleibt die Vorlage; jede weitere Woche und ihre
-- sieben Tage werden ohne Löschen ergänzt und beim nächsten Kettenlauf
-- wiederhergestellt.
CREATE TEMP TABLE c380_plan_periods (
  plan_name text PRIMARY KEY,
  week_count integer NOT NULL CHECK (week_count > 0)
) ON COMMIT DROP;

INSERT INTO c380_plan_periods (plan_name, week_count) VALUES
  ('Cut 4-Meal 2200', 4),
  ('Lean bulk 3100', 12),
  ('Buddy auto-plan', 1);

WITH base_weeks AS (
  SELECT
    p.plan_name,
    p.week_count,
    mp.id AS plan_id,
    mp.user_id,
    w.id AS base_week_id,
    w.week_start,
    w.name
  FROM c380_plan_periods p
  JOIN nutrition.meal_plans mp
    ON mp.user_id = :'dev_id'::uuid AND mp.name = p.plan_name
  CROSS JOIN LATERAL (
    SELECT id, week_start, name
    FROM nutrition.meal_plan_weeks
    WHERE plan_id = mp.id
    ORDER BY week_start, id
    LIMIT 1
  ) w
)
INSERT INTO nutrition.meal_plan_weeks (
  plan_id, user_id, week_start, name, copied_from_week_id
)
SELECT
  b.plan_id,
  b.user_id,
  b.week_start + (period.week_offset * 7),
  b.name,
  CASE WHEN period.week_offset = 0 THEN NULL ELSE b.base_week_id END
FROM base_weeks b
CROSS JOIN LATERAL generate_series(0, b.week_count - 1) AS period(week_offset)
ON CONFLICT (plan_id, week_start) DO NOTHING;

INSERT INTO nutrition.meal_plan_days (
  week_id, user_id, plan_date, day_index
)
SELECT
  w.id,
  mp.user_id,
  w.week_start + (day.day_index - 1),
  day.day_index
FROM c380_plan_periods p
JOIN nutrition.meal_plans mp
  ON mp.user_id = :'dev_id'::uuid AND mp.name = p.plan_name
JOIN nutrition.meal_plan_weeks w ON w.plan_id = mp.id
CROSS JOIN LATERAL generate_series(1, 7) AS day(day_index)
ON CONFLICT (week_id, day_index) DO NOTHING;

CREATE TEMP TABLE c380_entries (
  plan_name text NOT NULL,
  day_index smallint NOT NULL,
  meal_type text NOT NULL,
  planned_time time NOT NULL,
  bls_code text NOT NULL,
  amount_g numeric NOT NULL,
  PRIMARY KEY (plan_name, day_index, meal_type)
) ON COMMIT DROP;

INSERT INTO c380_entries (plan_name, day_index, meal_type, planned_time, bls_code, amount_g) VALUES
  ('Cut 4-Meal 2200', 1, 'breakfast', '07:30', 'M713100', 500),
  ('Cut 4-Meal 2200', 1, 'lunch',     '12:30', 'V416172', 300),
  ('Cut 4-Meal 2200', 1, 'dinner',    '19:30', 'C351000', 250),
  ('Cut 4-Meal 2200', 1, 'snack',     '16:00', 'H120100', 75),
  ('Cut 4-Meal 2200', 2, 'breakfast', '07:30', 'M710100', 500),
  ('Cut 4-Meal 2200', 2, 'lunch',     '12:30', 'T410072', 300),
  ('Cut 4-Meal 2200', 2, 'dinner',    '19:30', 'E401000', 300),
  ('Cut 4-Meal 2200', 2, 'snack',     '16:00', 'H120100', 31),
  ('Cut 4-Meal 2200', 3, 'breakfast', '07:30', 'M141100', 700),
  ('Cut 4-Meal 2200', 3, 'lunch',     '12:30', 'V486172', 300),
  ('Cut 4-Meal 2200', 3, 'dinner',    '19:30', 'C351000', 300),
  ('Cut 4-Meal 2200', 3, 'snack',     '16:00', 'H120100', 50),
  ('Cut 4-Meal 2200', 4, 'breakfast', '07:30', 'M711100', 500),
  ('Cut 4-Meal 2200', 4, 'lunch',     '12:30', 'T410072', 300),
  ('Cut 4-Meal 2200', 4, 'dinner',    '19:30', 'C133000', 300),
  ('Cut 4-Meal 2200', 4, 'snack',     '16:00', 'H120100', 25),
  ('Cut 4-Meal 2200', 5, 'breakfast', '07:30', 'M713100', 400),
  ('Cut 4-Meal 2200', 5, 'lunch',     '12:30', 'U211162', 400),
  ('Cut 4-Meal 2200', 5, 'dinner',    '19:30', 'C351000', 300),
  ('Cut 4-Meal 2200', 5, 'snack',     '16:00', 'H120100', 45),
  ('Cut 4-Meal 2200', 6, 'breakfast', '07:30', 'M141100', 600),
  ('Cut 4-Meal 2200', 6, 'lunch',     '12:30', 'V416172', 300),
  ('Cut 4-Meal 2200', 6, 'dinner',    '19:30', 'E401000', 350),
  ('Cut 4-Meal 2200', 6, 'snack',     '16:00', 'H120100', 40),
  ('Cut 4-Meal 2200', 7, 'breakfast', '07:30', 'M710100', 500),
  ('Cut 4-Meal 2200', 7, 'lunch',     '12:30', 'U211162', 350),
  ('Cut 4-Meal 2200', 7, 'dinner',    '19:30', 'C351000', 300),
  ('Cut 4-Meal 2200', 7, 'snack',     '16:00', 'H120100', 45),
  ('Lean bulk 3100', 1, 'breakfast', '07:30', 'M141100', 600),
  ('Lean bulk 3100', 1, 'lunch',     '12:30', 'V416172', 300),
  ('Lean bulk 3100', 1, 'dinner',    '19:30', 'C351000', 500),
  ('Lean bulk 3100', 1, 'snack',     '16:00', 'H120100', 80),
  ('Lean bulk 3100', 2, 'breakfast', '07:30', 'M710100', 500),
  ('Lean bulk 3100', 2, 'lunch',     '12:30', 'T410072', 300),
  ('Lean bulk 3100', 2, 'dinner',    '19:30', 'E401000', 550),
  ('Lean bulk 3100', 2, 'snack',     '16:00', 'H120100', 35),
  ('Lean bulk 3100', 3, 'breakfast', '07:30', 'M141100', 700),
  ('Lean bulk 3100', 3, 'lunch',     '12:30', 'V486172', 250),
  ('Lean bulk 3100', 3, 'dinner',    '19:30', 'C351000', 600),
  ('Lean bulk 3100', 3, 'snack',     '16:00', 'H120100', 40),
  ('Lean bulk 3100', 4, 'breakfast', '07:30', 'M713100', 400),
  ('Lean bulk 3100', 4, 'lunch',     '12:30', 'T121902', 350),
  ('Lean bulk 3100', 4, 'dinner',    '19:30', 'E401000', 600),
  ('Lean bulk 3100', 4, 'snack',     '16:00', 'H120100', 60),
  ('Lean bulk 3100', 5, 'breakfast', '07:30', 'M141100', 600),
  ('Lean bulk 3100', 5, 'lunch',     '12:30', 'U211162', 400),
  ('Lean bulk 3100', 5, 'dinner',    '19:30', 'C351000', 520),
  ('Lean bulk 3100', 5, 'snack',     '16:00', 'H120100', 55),
  ('Lean bulk 3100', 6, 'breakfast', '07:30', 'M711100', 400),
  ('Lean bulk 3100', 6, 'lunch',     '12:30', 'T410072', 350),
  ('Lean bulk 3100', 6, 'dinner',    '19:30', 'C133000', 500),
  ('Lean bulk 3100', 6, 'snack',     '16:00', 'H120100', 50),
  ('Lean bulk 3100', 7, 'breakfast', '07:30', 'M141100', 600),
  ('Lean bulk 3100', 7, 'lunch',     '12:30', 'V486172', 250),
  ('Lean bulk 3100', 7, 'dinner',    '19:30', 'C133000', 550),
  ('Lean bulk 3100', 7, 'snack',     '16:00', 'H120100', 75),
  ('Buddy auto-plan', 1, 'breakfast', '07:30', 'M713100', 500),
  ('Buddy auto-plan', 1, 'lunch',     '12:30', 'V416172', 300),
  ('Buddy auto-plan', 1, 'dinner',    '19:30', 'C351000', 400),
  ('Buddy auto-plan', 1, 'snack',     '16:00', 'H120100', 70),
  ('Buddy auto-plan', 2, 'breakfast', '07:30', 'M141100', 700),
  ('Buddy auto-plan', 2, 'lunch',     '12:30', 'V416172', 350),
  ('Buddy auto-plan', 2, 'dinner',    '19:30', 'C351000', 400),
  ('Buddy auto-plan', 2, 'snack',     '16:00', 'H120100', 60),
  ('Buddy auto-plan', 3, 'breakfast', '07:30', 'M710100', 500),
  ('Buddy auto-plan', 3, 'lunch',     '12:30', 'T410072', 350),
  ('Buddy auto-plan', 3, 'dinner',    '19:30', 'E401000', 350),
  ('Buddy auto-plan', 3, 'snack',     '16:00', 'H120100', 60),
  ('Buddy auto-plan', 4, 'breakfast', '07:30', 'M711100', 500),
  ('Buddy auto-plan', 4, 'lunch',     '12:30', 'T121902', 350),
  ('Buddy auto-plan', 4, 'dinner',    '19:30', 'C351000', 450),
  ('Buddy auto-plan', 4, 'snack',     '16:00', 'H120100', 55),
  ('Buddy auto-plan', 5, 'breakfast', '07:30', 'M141100', 450),
  ('Buddy auto-plan', 5, 'lunch',     '12:30', 'V486172', 300),
  ('Buddy auto-plan', 5, 'dinner',    '19:30', 'E510000', 430),
  ('Buddy auto-plan', 5, 'snack',     '16:00', 'H120100', 70),
  ('Buddy auto-plan', 6, 'breakfast', '07:30', 'M141100', 500),
  ('Buddy auto-plan', 6, 'lunch',     '12:30', 'U211162', 400),
  ('Buddy auto-plan', 6, 'dinner',    '19:30', 'C351000', 420),
  ('Buddy auto-plan', 6, 'snack',     '16:00', 'H120100', 55),
  ('Buddy auto-plan', 7, 'breakfast', '07:30', 'M713100', 500),
  ('Buddy auto-plan', 7, 'lunch',     '12:30', 'T410072', 300),
  ('Buddy auto-plan', 7, 'dinner',    '19:30', 'C133000', 400),
  ('Buddy auto-plan', 7, 'snack',     '16:00', 'H120100', 50);

DO $$
DECLARE
  v_missing text;
BEGIN
  SELECT string_agg(e.bls_code, ', ' ORDER BY e.bls_code)
  INTO v_missing
  FROM c380_entries e
  LEFT JOIN nutrition.foods f ON f.bls_code = e.bls_code
  WHERE f.id IS NULL;

  IF v_missing IS NOT NULL THEN
    RAISE EXCEPTION 'C-380: BLS-Codes fehlen im Katalog: %', v_missing;
  END IF;
END $$;

INSERT INTO nutrition.meal_plan_entries (
  day_id, user_id, meal_type, planned_time, slot_order, entry_type,
  food_id, amount_g, note
)
SELECT
  d.id, mp.user_id, e.meal_type, e.planned_time, 1, 'bls',
  f.id, e.amount_g, 'C-380 Seed: abwechslungsreiche Vier-Mahlzeiten-Woche'
FROM c380_entries e
JOIN nutrition.meal_plans mp
  ON mp.user_id = :'dev_id'::uuid AND mp.name = e.plan_name
JOIN nutrition.meal_plan_weeks w ON w.plan_id = mp.id
JOIN nutrition.meal_plan_days d ON d.week_id = w.id AND d.day_index = e.day_index
JOIN nutrition.foods f ON f.bls_code = e.bls_code
WHERE NOT EXISTS (
  SELECT 1
  FROM nutrition.meal_plan_entries existing
  WHERE existing.day_id = d.id
    AND existing.meal_type = e.meal_type
    AND existing.slot_order = 1
);

DO $$
DECLARE
  v_dev_id uuid;
  v_entries integer;
BEGIN
  SELECT id INTO v_dev_id FROM auth.users WHERE email = 'dev@lumeos.app';

  SELECT count(*) INTO v_entries
  FROM nutrition.meal_plan_entries e
  JOIN nutrition.meal_plan_days d ON d.id = e.day_id
  JOIN nutrition.meal_plan_weeks w ON w.id = d.week_id
  JOIN nutrition.meal_plans mp ON mp.id = w.plan_id
  WHERE mp.user_id = v_dev_id
    AND mp.name IN ('Cut 4-Meal 2200', 'Lean bulk 3100', 'Buddy auto-plan');

  IF v_entries <> 476 THEN
    RAISE EXCEPTION 'C-380: % Positionen nach Einspielen statt 476', v_entries;
  END IF;
END $$;

COMMIT;
