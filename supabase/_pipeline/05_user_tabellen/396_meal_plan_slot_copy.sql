-- C-396 / E-59: Ein Selbstplan bekommt beim Anlegen eine eigene Slotkopie.
-- Gelieferte Plaene schreiben ihre Struktur selbst in meal_plan_slots.
CREATE OR REPLACE FUNCTION nutrition.copy_user_slots_to_new_self_created_plan()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO nutrition.meal_plan_slots(plan_id, user_id, position, name, planned_time)
  SELECT NEW.id, NEW.user_id, position, name, planned_time
  FROM nutrition.meal_slots
  WHERE user_id = NEW.user_id
  ON CONFLICT (plan_id, position) DO NOTHING;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION nutrition.copy_user_slots_to_new_self_created_plan() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION nutrition.copy_user_slots_to_new_self_created_plan() TO authenticated, service_role;

DROP TRIGGER IF EXISTS meal_plans_copy_slots_for_self_created_plan ON nutrition.meal_plans;
CREATE TRIGGER meal_plans_copy_slots_for_self_created_plan
  AFTER INSERT ON nutrition.meal_plans
  FOR EACH ROW
  WHEN (NEW.plan_origin = 'self_created')
  EXECUTE FUNCTION nutrition.copy_user_slots_to_new_self_created_plan();
