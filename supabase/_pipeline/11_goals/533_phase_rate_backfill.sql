-- G-533 A2/A3: Zwei vor E1 angelegte Lean-Bulk-Phasen erhalten ihre
-- Zielrate aus dem gespeicherten Kaloriendelta und dem gemessenen Gewicht
-- am Phasenbeginn. Ohne genau dieses Gewicht wird nichts geraten.

BEGIN;

DO $g533$
DECLARE
  v_target_count integer;
  v_updated_count integer := 0;
  v_bad_rows text;
  v_rate numeric(5,3);
  r record;
BEGIN
  SELECT count(*)::integer
  INTO v_target_count
  FROM goals.goal_phases gp
  WHERE gp.phase_type = 'lean_bulk'
    AND gp.zielrate_pct_kg_woche IS NULL
    AND gp.parameters ? 'calorie_surplus_kcal';

  IF v_target_count NOT IN (0, 2) THEN
    RAISE EXCEPTION
      'G-533: erwartet 0 oder 2 alte Lean-Bulk-Phasen, gefunden: %',
      v_target_count;
  END IF;

  SELECT string_agg(gp.id::text, ', ' ORDER BY gp.id::text)
  INTO v_bad_rows
  FROM goals.goal_phases gp
  WHERE gp.phase_type = 'lean_bulk'
    AND gp.zielrate_pct_kg_woche IS NULL
    AND gp.parameters ? 'calorie_surplus_kcal'
    AND (
      jsonb_typeof(gp.parameters -> 'calorie_surplus_kcal')
        IS DISTINCT FROM 'number'
      OR CASE
        WHEN jsonb_typeof(gp.parameters -> 'calorie_surplus_kcal') = 'number'
          THEN (gp.parameters ->> 'calorie_surplus_kcal')::numeric <= 0
        ELSE false
      END
    );

  IF v_bad_rows IS NOT NULL THEN
    RAISE EXCEPTION
      'G-533: calorie_surplus_kcal ist fuer Phase(n) nicht positiv numerisch: %',
      v_bad_rows;
  END IF;

  SELECT string_agg(
    format('%s (Nutzer %s, Start %s)', gp.id, gp.user_id, gp.gueltig_ab),
    ', ' ORDER BY gp.id::text
  )
  INTO v_bad_rows
  FROM goals.goal_phases gp
  LEFT JOIN LATERAL (
    SELECT
      count(*)::integer AS measurement_count,
      max(bm.weight_kg) AS weight_kg
    FROM goals.body_measurements bm
    WHERE bm.user_id = gp.user_id
      AND bm.measurement_date = gp.gueltig_ab
  ) measured ON true
  WHERE gp.phase_type = 'lean_bulk'
    AND gp.zielrate_pct_kg_woche IS NULL
    AND gp.parameters ? 'calorie_surplus_kcal'
    AND (
      measured.measurement_count <> 1
      OR measured.weight_kg IS NULL
      OR measured.weight_kg <= 0
    );

  IF v_bad_rows IS NOT NULL THEN
    RAISE EXCEPTION
      'G-533: Gewicht am gueltig_ab fehlt oder ist nicht eindeutig fuer Phase(n): %',
      v_bad_rows;
  END IF;

  FOR r IN
    SELECT
      gp.id,
      (gp.parameters ->> 'calorie_surplus_kcal')::numeric AS surplus_kcal,
      measured.weight_kg
    FROM goals.goal_phases gp
    JOIN LATERAL (
      SELECT bm.weight_kg
      FROM goals.body_measurements bm
      WHERE bm.user_id = gp.user_id
        AND bm.measurement_date = gp.gueltig_ab
    ) measured ON true
    WHERE gp.phase_type = 'lean_bulk'
      AND gp.zielrate_pct_kg_woche IS NULL
      AND gp.parameters ? 'calorie_surplus_kcal'
    ORDER BY gp.id
  LOOP
    v_rate := round((r.surplus_kcal / (11 * r.weight_kg))::numeric, 3);

    IF v_rate <= 0 THEN
      RAISE EXCEPTION
        'G-533: abgeleitete Lean-Bulk-Rate ist fuer Phase % nicht positiv',
        r.id;
    END IF;

    UPDATE goals.goal_phases gp
    SET zielrate_pct_kg_woche = v_rate,
        parameters = gp.parameters - 'calorie_surplus_kcal'
    WHERE gp.id = r.id;

    v_updated_count := v_updated_count + 1;
  END LOOP;

  IF v_updated_count <> v_target_count THEN
    RAISE EXCEPTION
      'G-533: erwartet % aktualisierte Phase(n), aktualisiert: %',
      v_target_count,
      v_updated_count;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM goals.goal_phases gp
    WHERE gp.parameters ? 'calorie_surplus_kcal'
  ) THEN
    RAISE EXCEPTION
      'G-533: calorie_surplus_kcal blieb in goals.goal_phases.parameters zurueck';
  END IF;
END
$g533$;

ALTER TABLE goals.goal_phases
  VALIDATE CONSTRAINT goal_phases_zielrate_passt_zur_art;

DO $g533_validate$
BEGIN
  IF NOT COALESCE((
    SELECT c.convalidated
    FROM pg_constraint c
    WHERE c.conrelid = 'goals.goal_phases'::regclass
      AND c.conname = 'goal_phases_zielrate_passt_zur_art'
  ), false) THEN
    RAISE EXCEPTION 'G-533: Phasenart-CHECK ist nicht VALID';
  END IF;
END
$g533_validate$;

COMMIT;
