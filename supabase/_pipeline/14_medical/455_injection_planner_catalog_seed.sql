-- C-455: Verbatim Planner-Katalogkonfiguration. Das ist kein klinischer
-- Quellenersatz; minimum_rest_days aus E-57 wird hier absichtlich nicht beruehrt.
BEGIN;

WITH planner_site (
  id, max_volume_ml, rest_days, body_view, x_pct, y_pct,
  needle_gauge, needle_length_in, landmark_note, difficulty, body_area_code
) AS (
  VALUES
    ('glute_l', 3.0::numeric, 7::smallint, 'back', 38::smallint, 55::smallint, '23G', 1.50::numeric, 'Ventro-dorsal upper outer quadrant', 'standard', 'gluteal'),
    ('glute_r', 3.0::numeric, 7::smallint, 'back', 62::smallint, 55::smallint, '23G', 1.50::numeric, 'Ventro-dorsal upper outer quadrant', 'standard', 'gluteal'),
    ('vglute_l', 2.5::numeric, 7::smallint, 'front', 33::smallint, 52::smallint, '23G', 1.25::numeric, 'Safest IM site; no sciatic risk', 'standard', 'gluteal'),
    ('vglute_r', 2.5::numeric, 7::smallint, 'front', 67::smallint, 52::smallint, '23G', 1.25::numeric, 'Safest IM site; no sciatic risk', 'standard', 'gluteal'),
    ('quad_l', 2.0::numeric, 5::smallint, 'front', 37::smallint, 74::smallint, '25G', 1.00::numeric, 'Vastus lateralis; outer third', 'standard', 'quadriceps'),
    ('quad_r', 2.0::numeric, 5::smallint, 'front', 63::smallint, 74::smallint, '25G', 1.00::numeric, 'Vastus lateralis; outer third', 'standard', 'quadriceps'),
    ('delt_l', 1.0::numeric, 5::smallint, 'front', 19::smallint, 27::smallint, '25G', 1.00::numeric, '3 finger-widths below acromion', 'standard', 'deltoids'),
    ('delt_r', 1.0::numeric, 5::smallint, 'front', 81::smallint, 27::smallint, '25G', 1.00::numeric, '3 finger-widths below acromion', 'standard', 'deltoids'),
    ('lat_l', 1.5::numeric, 7::smallint, 'back', 24::smallint, 40::smallint, '25G', 1.00::numeric, 'Advanced site; thin muscle', 'advanced', 'latissimus'),
    ('lat_r', 1.5::numeric, 7::smallint, 'back', 76::smallint, 40::smallint, '25G', 1.00::numeric, 'Advanced site; thin muscle', 'advanced', 'latissimus'),
    ('abd_l', 1.0::numeric, 3::smallint, 'front', 42::smallint, 44::smallint, '29G', 0.50::numeric, '2 cm from navel; pinch fold', 'standard', 'abs'),
    ('abd_r', 1.0::numeric, 3::smallint, 'front', 58::smallint, 44::smallint, '29G', 0.50::numeric, '2 cm from navel; pinch fold', 'standard', 'abs'),
    ('sq_delt_l', 0.5::numeric, 3::smallint, 'front', 15::smallint, 33::smallint, '29G', 0.50::numeric, 'Posterior upper arm fat pad', 'standard', 'deltoids'),
    ('sq_delt_r', 0.5::numeric, 3::smallint, 'front', 85::smallint, 33::smallint, '29G', 0.50::numeric, 'Posterior upper arm fat pad', 'standard', 'deltoids'),
    ('thigh_sq_l', 1.0::numeric, 3::smallint, 'front', 31::smallint, 66::smallint, '29G', 0.50::numeric, 'Anterolateral fat pad', 'standard', 'quadriceps'),
    ('thigh_sq_r', 1.0::numeric, 3::smallint, 'front', 69::smallint, 66::smallint, '29G', 0.50::numeric, 'Anterolateral fat pad', 'standard', 'quadriceps')
)
UPDATE medical.injection_sites AS site
SET max_volume_ml = source.max_volume_ml,
    rest_days = source.rest_days,
    body_view = source.body_view,
    x_pct = source.x_pct,
    y_pct = source.y_pct,
    needle_gauge = source.needle_gauge,
    needle_length_in = source.needle_length_in,
    landmark_note = source.landmark_note,
    difficulty = source.difficulty,
    is_active = true,
    body_area_code = source.body_area_code
FROM planner_site AS source
WHERE site.id = source.id;

DO $$
BEGIN
  IF (
    SELECT count(*)
    FROM medical.injection_sites
    WHERE max_volume_ml IS NOT NULL AND rest_days IS NOT NULL AND body_view IS NOT NULL
      AND x_pct IS NOT NULL AND y_pct IS NOT NULL AND needle_gauge IS NOT NULL
      AND needle_length_in IS NOT NULL AND landmark_note IS NOT NULL
      AND difficulty IS NOT NULL AND is_active AND body_area_code IS NOT NULL
  ) <> 16 THEN
    RAISE EXCEPTION 'C-455: nicht alle 16 Katalogorte tragen die Planner-Konfiguration';
  END IF;
END;
$$;

COMMIT;
