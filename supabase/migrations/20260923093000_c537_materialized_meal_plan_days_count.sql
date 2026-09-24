BEGIN;

-- C-537/E-87: Sobald ein Plan materialisierte Tage hat, ist deren Zahl die
-- einzige Wahrheit fuer seine Laufzeit. `days_count` bleibt fuer leere
-- Entwuerfe frei belegbar; bei wenigstens einem Plantag wird es automatisch
-- auf die tatsaechliche Abdeckung normalisiert.
CREATE OR REPLACE FUNCTION nutrition.meal_plan_materialized_days_count(p_plan_id uuid)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $function$
  SELECT pg_catalog.count(*)::integer
  FROM nutrition.meal_plan_weeks AS week_row
  JOIN nutrition.meal_plan_days AS day_row ON day_row.week_id = week_row.id
  WHERE week_row.plan_id = p_plan_id;
$function$;

CREATE OR REPLACE FUNCTION nutrition.sync_meal_plan_materialized_days_count(p_plan_id uuid)
RETURNS void
LANGUAGE plpgsql
VOLATILE
SECURITY INVOKER
SET search_path = ''
AS $function$
DECLARE
  v_days_count integer;
BEGIN
  v_days_count := nutrition.meal_plan_materialized_days_count(p_plan_id);

  -- `days_count > 0` ist ein bestehender Vertrag. Ein Plan ohne Tage bleibt
  -- deshalb ein Entwurf statt eine ungueltige Null-Laufzeit.
  IF v_days_count > 0 THEN
    UPDATE nutrition.meal_plans AS plan_row
       SET days_count = v_days_count
     WHERE plan_row.id = p_plan_id
       AND plan_row.days_count IS DISTINCT FROM v_days_count;
  END IF;
END;
$function$;

CREATE OR REPLACE FUNCTION nutrition.meal_plan_days_count_guard()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $function$
DECLARE
  v_days_count integer;
BEGIN
  v_days_count := nutrition.meal_plan_materialized_days_count(NEW.id);

  -- `ablaufKlaeren` schreibt rollover_count. Dieser BEFORE-Trigger macht
  -- dessen days_count im selben UPDATE aus den wirklich vorhandenen Tagen.
  -- Dasselbe gilt fuer einen falschen direkten days_count-Schreibversuch.
  IF v_days_count > 0 THEN
    NEW.days_count := v_days_count;
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION nutrition.meal_plan_days_count_sync()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $function$
DECLARE
  v_old_plan_id uuid;
  v_new_plan_id uuid;
BEGIN
  IF TG_OP IN ('DELETE', 'UPDATE') THEN
    SELECT week_row.plan_id INTO v_old_plan_id
    FROM nutrition.meal_plan_weeks AS week_row
    WHERE week_row.id = OLD.week_id;
    IF v_old_plan_id IS NOT NULL THEN
      PERFORM nutrition.sync_meal_plan_materialized_days_count(v_old_plan_id);
    END IF;
  END IF;

  IF TG_OP IN ('INSERT', 'UPDATE') THEN
    SELECT week_row.plan_id INTO v_new_plan_id
    FROM nutrition.meal_plan_weeks AS week_row
    WHERE week_row.id = NEW.week_id;
    IF v_new_plan_id IS NOT NULL
       AND v_new_plan_id IS DISTINCT FROM v_old_plan_id THEN
      PERFORM nutrition.sync_meal_plan_materialized_days_count(v_new_plan_id);
    END IF;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$function$;

DROP TRIGGER IF EXISTS meal_plans_rollover_days_count_sync_trg ON nutrition.meal_plans;
CREATE TRIGGER meal_plans_rollover_days_count_sync_trg
BEFORE UPDATE OF rollover_count, days_count
ON nutrition.meal_plans
FOR EACH ROW EXECUTE FUNCTION nutrition.meal_plan_days_count_guard();

DROP TRIGGER IF EXISTS meal_plan_days_count_sync_trg ON nutrition.meal_plan_days;
CREATE TRIGGER meal_plan_days_count_sync_trg
AFTER INSERT OR DELETE OR UPDATE OF week_id
ON nutrition.meal_plan_days
FOR EACH ROW EXECUTE FUNCTION nutrition.meal_plan_days_count_sync();

REVOKE ALL ON FUNCTION nutrition.meal_plan_materialized_days_count(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION nutrition.sync_meal_plan_materialized_days_count(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION nutrition.meal_plan_days_count_guard() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION nutrition.meal_plan_days_count_sync() FROM PUBLIC, anon, authenticated;

COMMENT ON FUNCTION nutrition.meal_plan_materialized_days_count(uuid) IS
  'C-537/E-87: Anzahl der tatsaechlich materialisierten Tage eines Meal-Plans; massgeblich fuer days_count sobald mindestens ein Tag existiert.';
COMMENT ON FUNCTION nutrition.meal_plan_days_count_guard() IS
  'C-537: Ein Rollover- oder days_count-Update normalisiert days_count auf die materialisierte Planlaenge.';
COMMENT ON FUNCTION nutrition.meal_plan_days_count_sync() IS
  'C-537: Neue, verschobene oder entfernte Plantage ziehen days_count ihres Plans nach.';

COMMIT;
