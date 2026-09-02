-- C-385 / E-57: Lokaler Kettenzustand fuer Injektionsstellen und Quellen.
-- Die Struktur steht in der deploybaren Migration; alle Katalogdaten entstehen hier.
BEGIN;

INSERT INTO medical.injection_sites (
  id, route, display_name, minimum_rest_days, minimum_rest_days_reason,
  rotation_required, rotation_distance_mm, rotation_quadrant_interval_days
) VALUES
  ('deltoid', 'im', 'Deltoid', NULL, 'E-57: Keine wissenschaftlich validierte Mindest-Ruhezeit fuer wiederholte IM-Injektionen.', true, NULL, NULL),
  ('ventrogluteal', 'im', 'Ventrogluteal', NULL, 'E-57: Keine wissenschaftlich validierte Mindest-Ruhezeit fuer wiederholte IM-Injektionen.', true, NULL, NULL),
  ('vastus_lateralis', 'im', 'Vastus lateralis', NULL, 'E-57: Keine wissenschaftlich validierte Mindest-Ruhezeit fuer wiederholte IM-Injektionen.', true, NULL, NULL),
  ('subcutaneous', 'sc', 'Subkutan', NULL, 'E-57: Die SC-Quelle belegt Abstand und Zonenrotation, keine Ruhezeit in Tagen.', true, 10, 7)
ON CONFLICT (id) DO NOTHING;

INSERT INTO medical.injection_tissue_condition_guidance (
  condition_code, source_citation, avoidance_min_months, avoidance_max_months, rationale, evidence_type
) VALUES (
  'lipohypertrophy',
  'Klonoff et al., Advance Insulin Injection Technique and Education With FITTER Forward Expert Recommendations, Mayo Clinic Proceedings, 2025.',
  3, 6,
  'Gewebeschadenregel: bei Lipohypertrophie die betroffene Stelle 3-6 Monate nicht verwenden; keine verlaengerte Ruhezeit.',
  'guideline'
)
ON CONFLICT (condition_code) DO NOTHING;

INSERT INTO medical.injection_needle_recommendations (
  source_key, source_citation, route, site, medication_viscosity, gauge_range,
  length_range, body_size_modifier, applicability, evidence_type
) VALUES
  (
    'cdc_2026',
    'CDC, Vaccine Administration: Needle Gauge and Length, Stand 11.03.2026.',
    'im', 'deltoid', 'Nicht angegeben (Impfstoffleitlinie)', '22-25G',
    '25 mm; 25-38 mm; 38 mm',
    '<60 kg: 25 mm; 60-70 kg: 25 mm; Maenner 70-118 kg und Frauen 70-90 kg: 25-38 mm; Maenner >118 kg und Frauen >90 kg: 38 mm.',
    '{"all": true}'::jsonb, 'guideline'
  ),
  (
    'cook_2006',
    'Cook, Williamson, Pond, Vaccine, 2006 (Deltoid-Ultraschall).',
    'im', 'deltoid', 'Nicht angegeben', 'Nicht angegeben',
    '25 mm; bei Frauen mit BMI >35: 32 mm',
    'BMI <35: 25 mm ausreichend; Studie weist fuer Frauen mit BMI >35 auf 32 mm hin.',
    '{"bmi_max_exclusive": 35}'::jsonb, 'study'
  ),
  (
    'larkin_2018',
    'Larkin et al., Journal of Clinical Nursing, 2018 (Ultraschall, n=145).',
    'im', 'ventrogluteal', 'Nicht angegeben', 'Nicht angegeben',
    '32 mm; 38 mm',
    '32 mm fuer alle Maenner und normalgewichtige Frauen; 38 mm fuer alle Frauen.',
    '{"all": true}'::jsonb, 'study'
  ),
  (
    'zaybak_2007',
    'Zaybak et al., Journal of Advanced Nursing, 2007 (Ultraschall, n=119, BMI >=25).',
    'im', 'ventrogluteal', 'Nicht angegeben', 'Nicht angegeben',
    'Keine Nadellaenge angegeben; gemessene SC-Gewebedicke 38,2-53,8 mm',
    'BMI >=25: Uebergewicht 38,2 mm, Adipositas 43,1 mm, starke Adipositas 53,8 mm SC-Gewebe.',
    '{"bmi_min": 25}'::jsonb, 'study'
  ),
  (
    'open_rn_2023',
    'Open RN, Nursing Skills, 2. Auflage, 2023.',
    'im', 'vastus_lateralis', 'Waessrig: 20-25G; viskoes/oelig: 18-21G', '20-25G; 18-21G',
    '25-38 mm',
    'Route und Koerperbau bestimmen die Laenge; die Gauge-Angabe folgt der Viskositaet.',
    '{"all": true}'::jsonb, 'practice_rule'
  ),
  (
    'fitter_forward_2025',
    'Klonoff et al., FITTER Forward Expert Recommendations, Mayo Clinic Proceedings, 2025.',
    'sc', 'subcutaneous', 'Insulin', 'Nicht angegeben',
    'Pen 4 mm; Spritze 6 mm',
    'Unabhaengig vom BMI; ausserdem mindestens 10 mm Abstand und ein Quadrant je Woche.',
    '{"all": true}'::jsonb, 'guideline'
  ),
  (
    'spratt_2017',
    'Spratt et al., Journal of Clinical Endocrinology and Metabolism, 2017 (n=63).',
    'sc', 'subcutaneous', 'Testosteron in Oel', '25G',
    '16 mm',
    'Studienpopulation BMI 19,0-49,9.',
    '{"bmi_min": 19, "bmi_max": 49.9}'::jsonb, 'study'
  ),
  (
    'fda_xyosted_2019',
    'FDA, Xyosted NDA 209863, 2018/2019.',
    'sc', 'subcutaneous', 'Testosteron-Enanthat, 0,5 ml', '27G',
    '12,7 mm',
    'Festes Autoinjektor-System; keine allgemeine Koerperbau-Regel.',
    '{"all": true}'::jsonb, 'product_label'
  )
ON CONFLICT (source_key) DO NOTHING;

COMMIT;
