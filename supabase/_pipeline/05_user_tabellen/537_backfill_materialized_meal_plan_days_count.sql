-- C-537/E-87 -- Bestehende Planlaufzeiten sind Daten, keine Struktur.
-- Idempotent: nur abweichende Plaene mit wenigstens einem materialisierten
-- Tag werden auf ihre tatsaechliche Tageszahl nachgezogen.
BEGIN;

WITH materialized AS (
  SELECT
    plan_row.id,
    pg_catalog.count(day_row.id)::integer AS days_count
  FROM nutrition.meal_plans AS plan_row
  JOIN nutrition.meal_plan_weeks AS week_row ON week_row.plan_id = plan_row.id
  JOIN nutrition.meal_plan_days AS day_row ON day_row.week_id = week_row.id
  GROUP BY plan_row.id
)
UPDATE nutrition.meal_plans AS plan_row
   SET days_count = materialized.days_count
  FROM materialized
 WHERE plan_row.id = materialized.id
   AND plan_row.days_count IS DISTINCT FROM materialized.days_count;

COMMIT;
