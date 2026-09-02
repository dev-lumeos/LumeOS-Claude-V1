-- C-396 / E-59: Die Struktur eines Plans ist von Nutzer-Slots getrennt.
CREATE TABLE nutrition.meal_plan_slots (
  plan_id UUID NOT NULL REFERENCES nutrition.meal_plans(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  position INTEGER NOT NULL CHECK (position > 0),
  name TEXT NOT NULL CHECK (btrim(name) <> ''),
  planned_time TIME NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (plan_id, position)
);

CREATE INDEX meal_plan_slots_user_plan_idx
  ON nutrition.meal_plan_slots(user_id, plan_id, position);

CREATE OR REPLACE FUNCTION nutrition.meal_plan_slots_owner_guard()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  plan_owner UUID;
BEGIN
  SELECT user_id INTO plan_owner
  FROM nutrition.meal_plans
  WHERE id = NEW.plan_id;

  IF plan_owner IS NULL THEN
    RAISE EXCEPTION 'meal_plan_slots.plan_id % existiert nicht', NEW.plan_id
      USING ERRCODE = '23503';
  END IF;
  IF NEW.user_id <> plan_owner THEN
    RAISE EXCEPTION 'meal_plan_slots.user_id (%) weicht vom Planbesitzer (%) ab', NEW.user_id, plan_owner
      USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER meal_plan_slots_owner_guard_trg
  BEFORE INSERT OR UPDATE OF plan_id, user_id ON nutrition.meal_plan_slots
  FOR EACH ROW EXECUTE FUNCTION nutrition.meal_plan_slots_owner_guard();
CREATE TRIGGER meal_plan_slots_touch_updated_at
  BEFORE UPDATE ON nutrition.meal_plan_slots
  FOR EACH ROW EXECUTE FUNCTION nutrition.touch_updated_at();

ALTER TABLE nutrition.meal_plan_slots ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE nutrition.meal_plan_slots FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON nutrition.meal_plan_slots TO authenticated;
GRANT ALL ON TABLE nutrition.meal_plan_slots TO service_role;

CREATE POLICY meal_plan_slots_select ON nutrition.meal_plan_slots
  FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
CREATE POLICY meal_plan_slots_insert ON nutrition.meal_plan_slots
  FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY meal_plan_slots_update ON nutrition.meal_plan_slots
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY meal_plan_slots_delete ON nutrition.meal_plan_slots
  FOR DELETE TO authenticated USING ((SELECT auth.uid()) = user_id);

COMMENT ON TABLE nutrition.meal_plan_slots IS
  'C-396/E-59: Benannte, zeitliche Struktur eines einzelnen Plans; nicht aus meal_slots oder meal_plan_entries ableiten.';
