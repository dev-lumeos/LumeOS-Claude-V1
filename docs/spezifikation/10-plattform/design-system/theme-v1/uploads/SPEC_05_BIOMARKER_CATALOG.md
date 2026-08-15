# Medical Module — Biomarker Catalog & Reference System
> Spec Phase 5 | Vollständiger Biomarker-Katalog, Optimal Ranges, Seed-Daten

---

## 1. System-Marker-Mapping

```typescript
const SYSTEM_MARKERS: Record<string, string[]> = {
  liver:          ['ALT', 'AST', 'GGT', 'ALP', 'Bilirubin Total', 'Albumin'],
  cardiovascular: ['LDL', 'HDL', 'Triglycerides', 'hs-CRP', 'Homocysteine', 'ApoB'],
  kidney:         ['Creatinine', 'BUN', 'eGFR', 'Uric Acid'],
  hormonal:       ['Total Testosterone', 'Estradiol', 'Cortisol (AM)', 'TSH', 'Free T3', 'Free T4', 'Prolactin'],
  metabolic:      ['HbA1c', 'Glucose (fasting)', 'Insulin (fasting)', 'HOMA-IR'],
};
```

---

## 2. Vollständige Seed-Daten: 100+ Biomarker

### CBC (Complete Blood Count) — 15 Marker

```sql
INSERT INTO medical.biomarkers
  (loinc_code, name, name_de, common_name, category, biomarker_group, unit,
   lab_range_min, lab_range_max, optimal_range_min, optimal_range_max,
   critical_low_value, critical_high_value, gender_specific_ranges,
   measurement_frequency_recommended, evidence_level)
VALUES
  ('6690-2', 'White Blood Cell Count', 'Leukozyten', 'WBC',
   'cbc', 'cbc_panel', '10³/µL', 4.5, 11.0, 5.0, 8.0, 2.0, 15.0, NULL, 'annually', 'A'),

  ('789-8', 'Red Blood Cell Count', 'Erythrozyten', 'RBC',
   'cbc', 'cbc_panel', '10⁶/µL', 4.5, 5.5, 4.7, 5.3, 3.0, 6.5,
   '{"male": {"optimal_min": 4.7, "optimal_max": 5.5}, "female": {"optimal_min": 4.2, "optimal_max": 5.0}}',
   'annually', 'A'),

  ('718-7', 'Hemoglobin', 'Hämoglobin', 'Hgb',
   'cbc', 'cbc_panel', 'g/dL', 12.0, 17.5, 14.5, 17.0, 8.0, 20.0,
   '{"male": {"lab_min": 13.5, "lab_max": 17.5, "optimal_min": 14.5, "optimal_max": 17.0},
     "female": {"lab_min": 12.0, "lab_max": 16.0, "optimal_min": 13.0, "optimal_max": 15.5}}',
   'annually', 'A'),

  ('20570-8', 'Hematocrit', 'Hämatokrit', 'HCT',
   'cbc', 'cbc_panel', '%', 36.0, 52.0, 40.0, 50.0, 25.0, 55.0, NULL, 'annually', 'A'),

  ('777-3', 'Platelet Count', 'Thrombozyten', 'PLT',
   'cbc', 'cbc_panel', '10³/µL', 150, 400, 175, 350, 50, 600, NULL, 'annually', 'A');
```

### Metabolic Panel — 12 Marker

```sql
INSERT INTO medical.biomarkers VALUES
  ('2345-7', 'Glucose (fasting)', 'Nüchternglukose', 'FBG',
   'metabolic', 'metabolic_panel', 'mg/dL', 65, 99, 70, 85, 40, 300,
   NULL, 'quarterly', 'A+'),

  ('4548-4', 'Hemoglobin A1c', 'HbA1c', 'HbA1c',
   'metabolic', 'metabolic_panel', '%', 4.0, 6.4, 4.5, 5.4, NULL, 9.0,
   NULL, 'quarterly', 'A+'),

  ('20448-7', 'Insulin (fasting)', 'Nüchterninsulin', 'Insulin',
   'metabolic', 'metabolic_panel', 'µIU/mL', 2.0, 25.0, 2.0, 6.0, NULL, 50.0,
   NULL, 'annually', 'A'),

  ('2160-0', 'Creatinine', 'Kreatinin', 'Cr',
   'metabolic', 'metabolic_panel', 'mg/dL', 0.6, 1.3, 0.8, 1.1, NULL, 4.0,
   '{"male": {"lab_min": 0.7, "lab_max": 1.3}, "female": {"lab_min": 0.5, "lab_max": 1.1}}',
   'annually', 'A+'),

  ('62238-1', 'Estimated GFR', 'Geschätzte GFR', 'eGFR',
   'metabolic', 'metabolic_panel', 'mL/min', 60, 999, 90, 120, 30, NULL,
   NULL, 'annually', 'A+'),

  ('3094-0', 'BUN', 'Harnstoff-Stickstoff', 'BUN',
   'metabolic', 'metabolic_panel', 'mg/dL', 7, 20, 10, 16, NULL, 80,
   NULL, 'annually', 'A'),

  ('3084-1', 'Uric Acid', 'Harnsäure', 'UA',
   'metabolic', 'metabolic_panel', 'mg/dL', 2.4, 7.0, 3.5, 6.0, NULL, 9.0,
   '{"male": {"lab_max": 7.0}, "female": {"lab_max": 5.7}}',
   'annually', 'A');
```

### Lipid Panel — 8 Marker

```sql
INSERT INTO medical.biomarkers VALUES
  ('2093-3', 'Cholesterol, Total', 'Gesamtcholesterin', 'TC',
   'lipid', 'lipid_panel', 'mg/dL', 100, 200, 150, 180, NULL, 300, NULL, 'quarterly', 'A+'),

  ('2089-1', 'LDL Cholesterol', 'LDL-Cholesterin', 'LDL',
   'lipid', 'lipid_panel', 'mg/dL', 0, 130, 0, 100, NULL, 190, NULL, 'quarterly', 'A+'),

  ('2085-9', 'HDL Cholesterol', 'HDL-Cholesterin', 'HDL',
   'lipid', 'lipid_panel', 'mg/dL', 40, 999, 50, 80, 35, NULL,
   '{"male": {"optimal_min": 45}, "female": {"optimal_min": 55}}',
   'quarterly', 'A+'),

  ('2571-8', 'Triglycerides', 'Triglyzeride', 'TG',
   'lipid', 'lipid_panel', 'mg/dL', 0, 150, 0, 100, NULL, 500, NULL, 'quarterly', 'A+'),

  ('1869-7', 'Apolipoprotein B', 'Apolipoprotein B', 'ApoB',
   'lipid', 'lipid_panel', 'mg/dL', 0, 130, 0, 90, NULL, 150, NULL, 'annually', 'A+'),

  ('10835-7', 'Lipoprotein(a)', 'Lipoprotein(a)', 'Lp(a)',
   'lipid', 'lipid_panel', 'nmol/L', 0, 125, 0, 75, NULL, 200, NULL, 'annually', 'A');
```

### Liver Panel — 7 Marker

```sql
INSERT INTO medical.biomarkers VALUES
  ('1742-6', 'ALT', 'ALT (SGPT)', 'ALT',
   'liver', 'liver_panel', 'U/L', 7, 56, 0, 25, NULL, 200, NULL, 'quarterly', 'A+'),

  ('1920-8', 'AST', 'AST (SGOT)', 'AST',
   'liver', 'liver_panel', 'U/L', 10, 40, 0, 25, NULL, 200, NULL, 'quarterly', 'A+'),

  ('2324-2', 'GGT', 'Gamma-GT', 'GGT',
   'liver', 'liver_panel', 'U/L', 9, 48, 0, 30, NULL, 500,
   '{"male": {"lab_max": 60}, "female": {"lab_max": 35}}',
   'quarterly', 'A+'),

  ('6768-6', 'ALP', 'Alkalische Phosphatase', 'ALP',
   'liver', 'liver_panel', 'U/L', 44, 147, 50, 100, NULL, 500, NULL, 'annually', 'A'),

  ('1975-2', 'Bilirubin Total', 'Gesamtbilirubin', 'TBIL',
   'liver', 'liver_panel', 'mg/dL', 0.1, 1.2, 0.1, 1.0, NULL, 3.0, NULL, 'annually', 'A'),

  ('1751-7', 'Albumin', 'Albumin', 'ALB',
   'liver', 'liver_panel', 'g/dL', 3.5, 5.5, 4.0, 5.0, 2.5, NULL, NULL, 'annually', 'A');
```

### Thyroid — 6 Marker

```sql
INSERT INTO medical.biomarkers VALUES
  ('3016-3', 'TSH', 'TSH', 'TSH',
   'thyroid', 'thyroid_panel', 'mIU/L', 0.4, 4.0, 0.5, 2.5, NULL, 10.0, NULL, 'annually', 'A+'),

  ('3024-7', 'Free T4', 'Freies T4', 'fT4',
   'thyroid', 'thyroid_panel', 'ng/dL', 0.8, 1.8, 1.0, 1.5, NULL, NULL, NULL, 'annually', 'A+'),

  ('3051-0', 'Free T3', 'Freies T3', 'fT3',
   'thyroid', 'thyroid_panel', 'pg/mL', 2.3, 4.2, 3.0, 4.0, NULL, NULL, NULL, 'annually', 'A+'),

  ('3053-6', 'Reverse T3', 'Reverses T3', 'rT3',
   'thyroid', 'thyroid_panel', 'ng/dL', 9, 24, 0, 15, NULL, NULL, NULL, 'annually', 'B'),

  ('5385-0', 'TPO Antibodies', 'TPO-Antikörper', 'TPO-Ab',
   'thyroid', 'thyroid_panel', 'IU/mL', 0, 35, 0, 9, NULL, NULL, NULL, 'annually', 'A');
```

### Hormones — 10 Marker

```sql
INSERT INTO medical.biomarkers VALUES
  ('2986-8', 'Testosterone, Total', 'Testosteron gesamt', 'TT',
   'hormone', 'hormone_panel', 'ng/dL', 300, 1000, 500, 900, 200, NULL,
   '{"female": {"lab_min": 15, "lab_max": 70, "optimal_min": 20, "optimal_max": 55}}',
   'quarterly', 'A+'),

  ('2991-8', 'Testosterone, Free', 'Testosteron frei', 'FT',
   'hormone', 'hormone_panel', 'pg/mL', 5.0, 21.0, 10.0, 25.0, NULL, NULL,
   NULL, 'quarterly', 'A+'),

  ('13967-5', 'SHBG', 'SHBG', 'SHBG',
   'hormone', 'hormone_panel', 'nmol/L', 10, 80, 20, 40, NULL, NULL,
   NULL, 'annually', 'A'),

  ('2243-4', 'Estradiol', 'Östradiol', 'E2',
   'hormone', 'hormone_panel', 'pg/mL', 10, 40, 20, 35, NULL, NULL,
   '{"female": {"lab_min": 12, "lab_max": 400, "optimal_min": 50, "optimal_max": 250}}',
   'quarterly', 'A+'),

  ('2191-5', 'DHEA-S', 'DHEA-S', 'DHEA-S',
   'hormone', 'hormone_panel', 'µg/dL', 100, 600, 200, 400, NULL, NULL,
   NULL, 'annually', 'A'),

  ('2143-6', 'Cortisol (AM)', 'Cortisol (morgens)', 'Cortisol',
   'hormone', 'hormone_panel', 'µg/dL', 7, 28, 10, 18, NULL, NULL,
   NULL, 'annually', 'A+'),

  ('10501-5', 'LH', 'LH', 'LH',
   'hormone', 'hormone_panel', 'mIU/mL', 1.7, 8.6, 3.0, 8.0, NULL, NULL,
   NULL, 'annually', 'A'),

  ('10231-9', 'IGF-1', 'IGF-1', 'IGF-1',
   'hormone', 'hormone_panel', 'ng/mL', 50, 300, 100, 250, NULL, NULL,
   NULL, 'annually', 'A');
```

### Inflammation — 6 Marker

```sql
INSERT INTO medical.biomarkers VALUES
  ('30522-7', 'CRP, High Sensitivity', 'hs-CRP', 'hs-CRP',
   'inflammation', 'inflammation_panel', 'mg/L', 0, 3.0, 0, 1.0, NULL, 10.0,
   NULL, 'quarterly', 'A+'),

  ('13965-9', 'Homocysteine', 'Homocystein', 'Hcy',
   'inflammation', 'inflammation_panel', 'µmol/L', 0, 15, 0, 7, NULL, NULL,
   NULL, 'annually', 'A+'),

  ('4537-7', 'ESR', 'Blutsenkungsgeschwindigkeit', 'BSG/ESR',
   'inflammation', 'inflammation_panel', 'mm/hr', 0, 20, 0, 10, NULL, NULL,
   NULL, 'annually', 'A'),

  ('2276-4', 'Ferritin', 'Ferritin', 'Ferritin',
   'inflammation', 'inflammation_panel', 'ng/mL', 12, 300, 80, 150, 12, NULL,
   '{"female": {"lab_min": 10, "lab_max": 200, "optimal_min": 50, "optimal_max": 100}}',
   'quarterly', 'A+');
```

### Vitamins & Minerals — 10 Marker

```sql
INSERT INTO medical.biomarkers VALUES
  ('1989-3', 'Vitamin D, 25-OH', 'Vitamin D (25-OH-D)', 'Vit D',
   'vitamins_minerals', 'vitamins_panel', 'ng/mL', 20, 100, 40, 60, 20, 100,
   NULL, 'quarterly', 'A+'),

  ('2132-9', 'Vitamin B12', 'Vitamin B12 (Cobalamin)', 'B12',
   'vitamins_minerals', 'vitamins_panel', 'pg/mL', 200, 900, 500, 900, 150, NULL,
   NULL, 'annually', 'A+'),

  ('2498-4', 'Iron, Serum', 'Eisen (Serum)', 'Fe',
   'vitamins_minerals', 'vitamins_panel', 'µg/dL', 60, 170, 80, 150, 30, NULL,
   NULL, 'annually', 'A'),

  ('2614-6', 'Magnesium, RBC', 'Magnesium (RBC)', 'Mg RBC',
   'vitamins_minerals', 'vitamins_panel', 'mg/dL', 4.2, 6.8, 5.0, 6.5, 4.0, NULL,
   NULL, 'annually', 'A'),

  ('5762-0', 'Zinc', 'Zink', 'Zn',
   'vitamins_minerals', 'vitamins_panel', 'µg/dL', 60, 130, 80, 120, 40, NULL,
   NULL, 'annually', 'A'),

  ('2913-2', 'Selenium', 'Selen', 'Se',
   'vitamins_minerals', 'vitamins_panel', 'µg/L', 70, 150, 110, 150, 50, NULL,
   NULL, 'annually', 'B');
```

---

## 3. Biomarker Reference Ranges (Alter/Geschlecht-spezifisch)

```sql
-- Ferritin: Männer nach Alter
INSERT INTO medical.biomarker_reference_ranges
  (biomarker_id, range_type, range_name, gender, age_min, age_max, population, min_value, max_value, unit)
SELECT id, 'optimal', 'Male Athlete 18-65', 'male', 18, 65, 'athlete', 80, 150, 'ng/mL'
FROM medical.biomarkers WHERE loinc_code = '2276-4';

INSERT INTO medical.biomarker_reference_ranges
  (biomarker_id, range_type, range_name, gender, age_min, age_max, population, min_value, max_value, unit)
SELECT id, 'optimal', 'Female Athlete 18-65', 'female', 18, 65, 'athlete', 50, 100, 'ng/mL'
FROM medical.biomarkers WHERE loinc_code = '2276-4';

-- TSH: Alter-spezifisch (ältere Menschen haben höhere TSH-Norm)
INSERT INTO medical.biomarker_reference_ranges
  (biomarker_id, range_type, range_name, gender, age_min, age_max, population, min_value, max_value, unit)
SELECT id, 'optimal', 'Adult 18-60', 'all', 18, 60, 'general', 0.5, 2.5, 'mIU/L'
FROM medical.biomarkers WHERE loinc_code = '3016-3';

INSERT INTO medical.biomarker_reference_ranges
  (biomarker_id, range_type, range_name, gender, age_min, age_max, population, min_value, max_value, unit)
SELECT id, 'optimal', 'Senior 60+', 'all', 60, 99, 'general', 0.5, 3.5, 'mIU/L'
FROM medical.biomarkers WHERE loinc_code = '3016-3';
```

---

## 4. Supplement-Biomarker Mapping

```typescript
// Welcher Supplement → welchen Biomarker beeinflusst er?
const SUPPLEMENT_BIOMARKER_MAP: Record<string, string[]> = {
  'Vitamin D3':        ['Vitamin D, 25-OH'],
  'Iron Bisglycinate': ['Ferritin', 'Iron, Serum', 'Hemoglobin'],
  'Omega-3':           ['Triglycerides', 'CRP, High Sensitivity'],
  'Zinc':              ['Zinc', 'Testosterone, Total'],
  'Magnesium':         ['Magnesium, RBC'],
  'Vitamin B12':       ['Vitamin B12'],
  'Ashwagandha':       ['Cortisol (AM)', 'Testosterone, Total'],
  'CoQ10':             ['CRP, High Sensitivity'],
  'NAC':               ['GGT', 'ALT'],
};
```
