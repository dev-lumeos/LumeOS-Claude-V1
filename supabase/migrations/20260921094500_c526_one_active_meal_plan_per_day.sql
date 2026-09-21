BEGIN;

CREATE OR REPLACE FUNCTION nutrition.meal_plan_active_overlap_guard()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $guard$
DECLARE
  v_user_id uuid;
  v_plan_id uuid;
  v_plan_date date;
  v_conflict_plan_id uuid;
BEGIN
  IF TG_TABLE_NAME = 'meal_plans' THEN
    IF NEW.status <> 'active' THEN
      RETURN NEW;
    END IF;

    v_user_id := NEW.user_id;
    v_plan_id := NEW.id;

    PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext(v_user_id::text)::bigint);

    SELECT other.id, day_row.plan_date
      INTO v_conflict_plan_id, v_plan_date
    FROM nutrition.meal_plan_weeks AS own_week
    JOIN nutrition.meal_plan_days AS day_row ON day_row.week_id = own_week.id
    JOIN nutrition.meal_plan_weeks AS other_week ON other_week.user_id = v_user_id
    JOIN nutrition.meal_plan_days AS other_day
      ON other_day.week_id = other_week.id
     AND other_day.plan_date = day_row.plan_date
    JOIN nutrition.meal_plans AS other ON other.id = other_week.plan_id
    WHERE own_week.plan_id = v_plan_id
      AND other.id <> v_plan_id
      AND other.status = 'active'
    ORDER BY day_row.plan_date, other.id
    LIMIT 1;
  ELSE
    SELECT plan_row.user_id, plan_row.id
      INTO v_user_id, v_plan_id
    FROM nutrition.meal_plan_weeks AS week_row
    JOIN nutrition.meal_plans AS plan_row ON plan_row.id = week_row.plan_id
    WHERE week_row.id = NEW.week_id;

    IF NOT FOUND OR (SELECT status FROM nutrition.meal_plans WHERE id = v_plan_id) <> 'active' THEN
      RETURN NEW;
    END IF;

    PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext(v_user_id::text)::bigint);

    SELECT other.id, NEW.plan_date
      INTO v_conflict_plan_id, v_plan_date
    FROM nutrition.meal_plan_weeks AS other_week
    JOIN nutrition.meal_plan_days AS other_day ON other_day.week_id = other_week.id
    JOIN nutrition.meal_plans AS other ON other.id = other_week.plan_id
    WHERE other_week.user_id = v_user_id
      AND other.id <> v_plan_id
      AND other.status = 'active'
      AND other_day.plan_date = NEW.plan_date
    ORDER BY other.id
    LIMIT 1;
  END IF;

  IF v_conflict_plan_id IS NOT NULL THEN
    RAISE EXCEPTION
      'Aktiver Meal-Plan % überlappt am % mit aktivem Meal-Plan %',
      v_plan_id, v_plan_date, v_conflict_plan_id
      USING ERRCODE = '23514',
            CONSTRAINT = 'meal_plans_one_active_per_day';
  END IF;

  RETURN NEW;
END;
$guard$;

CREATE TRIGGER meal_plans_active_overlap_guard_trg
AFTER INSERT OR UPDATE OF status, user_id
ON nutrition.meal_plans
FOR EACH ROW EXECUTE FUNCTION nutrition.meal_plan_active_overlap_guard();

CREATE TRIGGER meal_plan_days_active_overlap_guard_trg
AFTER INSERT OR UPDATE OF week_id, user_id, plan_date
ON nutrition.meal_plan_days
FOR EACH ROW EXECUTE FUNCTION nutrition.meal_plan_active_overlap_guard();

REVOKE ALL ON FUNCTION nutrition.meal_plan_active_overlap_guard() FROM PUBLIC, anon, authenticated;

COMMENT ON FUNCTION nutrition.meal_plan_active_overlap_guard() IS
  'C-526: Active Meal-Pläne dürfen je Nutzerin und materialisiertem plan_date nicht überlappen. Assigned und paused dürfen dieselben Tage weiterhin abdecken.';

COMMIT;
