-- C-441: Der Katalog folgt den seitigen IDs der Injection-Planner-Spec.
-- Klinische Ruhezeiten und starre Nadeldaten bleiben gemaess E-57/C-385
-- bewusst nicht an der Stelle gespeichert.
BEGIN;

DO $$
BEGIN
  -- Alte, unspezifische Katalog-IDs duerfen nur dann entfallen, wenn sie
  -- keine medizinische Historie mehr referenzieren. Ein Abbruch ist ehrlicher
  -- als die Umdeutung einer bestehenden Injektion oder Gewebezustandszeile.
  IF EXISTS (
    SELECT 1
    FROM medical.injection_logs
    WHERE injection_site_id IN ('deltoid', 'vastus_lateralis', 'ventrogluteal', 'subcutaneous')
  ) OR EXISTS (
    SELECT 1
    FROM medical.injection_site_conditions
    WHERE injection_site_id IN ('deltoid', 'vastus_lateralis', 'ventrogluteal', 'subcutaneous')
  ) THEN
    RAISE EXCEPTION 'C-441: alte Injektionsort-IDs werden noch referenziert; keine historische Umdeutung';
  END IF;

  DELETE FROM medical.injection_sites
  WHERE id IN ('deltoid', 'vastus_lateralis', 'ventrogluteal', 'subcutaneous');
END;
$$;

INSERT INTO medical.injection_sites (
  id, route, display_name, minimum_rest_days, minimum_rest_days_reason,
  rotation_required, rotation_distance_mm, rotation_quadrant_interval_days
) VALUES
  ('glute_l', 'im', 'Gluteus L', NULL, 'E-57: Keine wissenschaftlich validierte Mindest-Ruhezeit fuer wiederholte IM-Injektionen.', true, NULL, NULL),
  ('glute_r', 'im', 'Gluteus R', NULL, 'E-57: Keine wissenschaftlich validierte Mindest-Ruhezeit fuer wiederholte IM-Injektionen.', true, NULL, NULL),
  ('vglute_l', 'im', 'Ventrogluteal L', NULL, 'E-57: Keine wissenschaftlich validierte Mindest-Ruhezeit fuer wiederholte IM-Injektionen.', true, NULL, NULL),
  ('vglute_r', 'im', 'Ventrogluteal R', NULL, 'E-57: Keine wissenschaftlich validierte Mindest-Ruhezeit fuer wiederholte IM-Injektionen.', true, NULL, NULL),
  ('quad_l', 'im', 'Quadriceps L', NULL, 'E-57: Keine wissenschaftlich validierte Mindest-Ruhezeit fuer wiederholte IM-Injektionen.', true, NULL, NULL),
  ('quad_r', 'im', 'Quadriceps R', NULL, 'E-57: Keine wissenschaftlich validierte Mindest-Ruhezeit fuer wiederholte IM-Injektionen.', true, NULL, NULL),
  ('delt_l', 'im', 'Deltoid L', NULL, 'E-57: Keine wissenschaftlich validierte Mindest-Ruhezeit fuer wiederholte IM-Injektionen.', true, NULL, NULL),
  ('delt_r', 'im', 'Deltoid R', NULL, 'E-57: Keine wissenschaftlich validierte Mindest-Ruhezeit fuer wiederholte IM-Injektionen.', true, NULL, NULL),
  ('lat_l', 'im', 'Latissimus L', NULL, 'E-57: Keine wissenschaftlich validierte Mindest-Ruhezeit fuer wiederholte IM-Injektionen.', true, NULL, NULL),
  ('lat_r', 'im', 'Latissimus R', NULL, 'E-57: Keine wissenschaftlich validierte Mindest-Ruhezeit fuer wiederholte IM-Injektionen.', true, NULL, NULL),
  ('abd_l', 'sc', 'Abdomen L', NULL, 'E-57: Die SC-Quelle belegt Abstand und Zonenrotation, keine Ruhezeit in Tagen.', true, 10, 7),
  ('abd_r', 'sc', 'Abdomen R', NULL, 'E-57: Die SC-Quelle belegt Abstand und Zonenrotation, keine Ruhezeit in Tagen.', true, 10, 7),
  ('sq_delt_l', 'sc', 'SubQ Deltoid L', NULL, 'E-57: Die SC-Quelle belegt Abstand und Zonenrotation, keine Ruhezeit in Tagen.', true, 10, 7),
  ('sq_delt_r', 'sc', 'SubQ Deltoid R', NULL, 'E-57: Die SC-Quelle belegt Abstand und Zonenrotation, keine Ruhezeit in Tagen.', true, 10, 7),
  ('thigh_sq_l', 'sc', 'SubQ Thigh L', NULL, 'E-57: Die SC-Quelle belegt Abstand und Zonenrotation, keine Ruhezeit in Tagen.', true, 10, 7),
  ('thigh_sq_r', 'sc', 'SubQ Thigh R', NULL, 'E-57: Die SC-Quelle belegt Abstand und Zonenrotation, keine Ruhezeit in Tagen.', true, 10, 7)
ON CONFLICT (id) DO UPDATE
SET route = EXCLUDED.route,
    display_name = EXCLUDED.display_name,
    minimum_rest_days = EXCLUDED.minimum_rest_days,
    minimum_rest_days_reason = EXCLUDED.minimum_rest_days_reason,
    rotation_required = EXCLUDED.rotation_required,
    rotation_distance_mm = EXCLUDED.rotation_distance_mm,
    rotation_quadrant_interval_days = EXCLUDED.rotation_quadrant_interval_days;

DO $$
DECLARE
  v_site_count integer;
  v_legacy_count integer;
BEGIN
  SELECT count(*) INTO v_site_count FROM medical.injection_sites;
  SELECT count(*) INTO v_legacy_count
  FROM medical.injection_sites
  WHERE id IN ('deltoid', 'vastus_lateralis', 'ventrogluteal', 'subcutaneous');

  IF v_site_count <> 16 OR v_legacy_count <> 0 THEN
    RAISE EXCEPTION 'C-441: Injektionsorte % / alte IDs % statt 16 / 0', v_site_count, v_legacy_count;
  END IF;
END;
$$;

COMMENT ON TABLE medical.injection_sites IS
  'C-385/E-57/C-441: Seitige Injektionsort-IDs mit Rotationsregel; Ruhezeiten und starre Nadelwerte werden nicht erfunden.';

COMMIT;
