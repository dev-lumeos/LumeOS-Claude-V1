# Medical Module — Import Pipeline
> Spec Phase 8 | Seed-Daten Scripts für Biomarker-Katalog

---

## Übersicht

Der Biomarker-Katalog ist kuratiert — kein automatischer Import aus LOINC-Rohdaten.
Alle Werte sind research-basiert (Healthmatters, Peer-reviewed Literature,
Functional Medicine Standards, ISSN Position Stands).

```
Schritt 1: Biomarker Katalog (9 Kategorien, 100+ Marker)
Schritt 2: Alter/Geschlecht-spezifische Reference Ranges
Schritt 3: Biomarker Population Statistics (Seed-Werte)
Schritt 4: Verifikation
```

---

## Phase 1: Biomarker Seed (Zusammenfassung)

Vollständige INSERT-Statements in SPEC_05 definiert.

```sql
-- Reihenfolge der Seed-Dateien
\i 01_seed_biomarkers_cbc.sql          -- 15 CBC Marker
\i 02_seed_biomarkers_metabolic.sql    -- 12 Metabolic Marker
\i 03_seed_biomarkers_lipid.sql        -- 8 Lipid Marker
\i 04_seed_biomarkers_liver.sql        -- 7 Liver Marker
\i 05_seed_biomarkers_thyroid.sql      -- 6 Thyroid Marker
\i 06_seed_biomarkers_hormone.sql      -- 10 Hormone Marker
\i 07_seed_biomarkers_inflammation.sql -- 6 Inflammation Marker
\i 08_seed_biomarkers_vitamins.sql     -- 10 Vitamins/Minerals Marker
\i 09_seed_biomarkers_cancer.sql       -- 5 Cancer Screening Marker
```

---

## Phase 2: Reference Ranges (Alter/Geschlecht)

Ergänzende Ranges für Marker mit bekannten demographischen Unterschieden.

```sql
-- Ferritin: Geschlecht-spezifisch
INSERT INTO medical.biomarker_reference_ranges
  (biomarker_id, range_type, range_name, gender, age_min, age_max, population, min_value, max_value, unit, evidence_level)
SELECT id, 'optimal', 'Male Athlete 18-65', 'male', 18, 65, 'athlete', 80, 150, 'ng/mL', 'A'
FROM medical.biomarkers WHERE loinc_code = '2276-4';

SELECT id, 'optimal', 'Female Athlete 18-65', 'female', 18, 65, 'athlete', 50, 100, 'ng/mL', 'A'
FROM medical.biomarkers WHERE loinc_code = '2276-4';

-- TSH: Alter-spezifisch
INSERT INTO medical.biomarker_reference_ranges
  (biomarker_id, range_type, range_name, gender, age_min, age_max, population, min_value, max_value, unit, evidence_level)
VALUES
  ((SELECT id FROM medical.biomarkers WHERE loinc_code = '3016-3'),
   'optimal', 'Adult 18-60', 'all', 18, 60, 'general', 0.5, 2.5, 'mIU/L', 'A+'),
  ((SELECT id FROM medical.biomarkers WHERE loinc_code = '3016-3'),
   'optimal', 'Senior 60+', 'all', 60, 99, 'general', 0.5, 3.5, 'mIU/L', 'A');

-- Testosterone: Alter-spezifisch (Männer)
INSERT INTO medical.biomarker_reference_ranges
  (biomarker_id, range_type, range_name, gender, age_min, age_max, population, min_value, max_value, unit, evidence_level)
VALUES
  ((SELECT id FROM medical.biomarkers WHERE loinc_code = '2986-8'),
   'optimal', 'Male 18-40', 'male', 18, 40, 'athlete', 550, 900, 'ng/dL', 'A+'),
  ((SELECT id FROM medical.biomarkers WHERE loinc_code = '2986-8'),
   'optimal', 'Male 40-60', 'male', 40, 60, 'general', 450, 800, 'ng/dL', 'A'),
  ((SELECT id FROM medical.biomarkers WHERE loinc_code = '2986-8'),
   'optimal', 'Male 60+', 'male', 60, 99, 'general', 350, 700, 'ng/dL', 'A');

-- Vitamin D: Longevity Optimal Range
INSERT INTO medical.biomarker_reference_ranges
  (biomarker_id, range_type, range_name, gender, age_min, age_max, population, min_value, max_value, unit, evidence_level)
VALUES
  ((SELECT id FROM medical.biomarkers WHERE loinc_code = '1989-3'),
   'optimal', 'Longevity Optimal', 'all', 18, 99, 'longevity', 50, 80, 'ng/mL', 'B'),
  ((SELECT id FROM medical.biomarkers WHERE loinc_code = '1989-3'),
   'optimal', 'General Optimal', 'all', 18, 99, 'general', 40, 60, 'ng/mL', 'A+');

-- Hemoglobin: Geschlecht-spezifisch bereits in biomarkers.gender_specific_ranges
-- Ergänzende Range-Rows für Abfrage-Kompatibilität:
INSERT INTO medical.biomarker_reference_ranges
  (biomarker_id, range_type, range_name, gender, age_min, age_max, population, min_value, max_value, unit, evidence_level)
VALUES
  ((SELECT id FROM medical.biomarkers WHERE loinc_code = '718-7'),
   'lab_standard', 'Male Adult', 'male', 18, 99, 'general', 13.5, 17.5, 'g/dL', 'A+'),
  ((SELECT id FROM medical.biomarkers WHERE loinc_code = '718-7'),
   'lab_standard', 'Female Adult', 'female', 18, 99, 'general', 12.0, 16.0, 'g/dL', 'A+');
```

---

## Phase 3: Population Statistics (Seed-Werte)

Basiert auf NHANES-Daten (öffentlich, kostenlos).

```sql
-- LDL: US Adult Male 18-65 (NHANES)
INSERT INTO medical.biomarker_population_statistics
  (biomarker_id, age_group, gender, population_type, sample_size,
   mean_value, median_value, percentile_25, percentile_75,
   percentile_10, percentile_90, unit)
VALUES
  ((SELECT id FROM medical.biomarkers WHERE loinc_code = '2089-1'),
   '18-65', 'male', 'general', 8500,
   128.0, 124.0, 103.0, 149.0, 85.0, 172.0, 'mg/dL'),

  ((SELECT id FROM medical.biomarkers WHERE loinc_code = '2086-7'),
   '18-65', 'male', 'general', 8500,
   46.0, 44.0, 37.0, 54.0, 32.0, 61.0, 'mg/dL');

-- Vitamin D: US Adult (NHANES, bekannter Mangel)
INSERT INTO medical.biomarker_population_statistics
  (biomarker_id, age_group, gender, population_type, sample_size,
   mean_value, median_value, percentile_25, percentile_75, unit)
VALUES
  ((SELECT id FROM medical.biomarkers WHERE loinc_code = '1989-3'),
   '18-65', 'all', 'general', 12000,
   24.5, 23.0, 16.0, 31.0, 'ng/mL');
-- Hinweis: ~41% der US-Bevölkerung ist Vitamin D defizient (<20 ng/mL)
```

---

## Phase 4: Verifikation

```sql
-- Gesamt-Übersicht
SELECT 'biomarkers' AS t, COUNT(*) FROM medical.biomarkers
UNION ALL
SELECT 'reference_ranges', COUNT(*) FROM medical.biomarker_reference_ranges
UNION ALL
SELECT 'population_stats', COUNT(*) FROM medical.biomarker_population_statistics;

-- Alle 9 Kategorien vorhanden?
SELECT category, COUNT(*) as count
FROM medical.biomarkers
GROUP BY category
ORDER BY category;
-- Erwartet: 9 Zeilen, CBC ~15, Metabolic ~12, Lipid ~8, ...

-- LOINC-Code Coverage
SELECT COUNT(*) as with_loinc, COUNT(*) FILTER (WHERE loinc_code IS NULL) as missing_loinc
FROM medical.biomarkers;
-- Ziel: <10 ohne LOINC-Code

-- Optimal Ranges Coverage
SELECT COUNT(*) as total,
       COUNT(*) FILTER (WHERE optimal_range_min IS NOT NULL) as with_optimal
FROM medical.biomarkers;
-- Ziel: >80% haben Optimal Ranges

-- Critical Values Coverage
SELECT COUNT(*) as total,
       COUNT(*) FILTER (WHERE critical_low_value IS NOT NULL OR critical_high_value IS NOT NULL) as with_critical
FROM medical.biomarkers;

-- Trigger Test
INSERT INTO medical.user_biomarker_results
  (user_id, biomarker_id, value, unit, test_date, data_source)
SELECT '00000000-0000-0000-0000-000000000001', id, 45, 'ng/mL', CURRENT_DATE, 'manual'
FROM medical.biomarkers WHERE loinc_code = '2276-4';  -- Ferritin 45 → sollte 'normal' sein (Lab 12-300), nicht optimal (80-150)

SELECT value, current_flag, critical_flag
FROM medical.user_biomarker_results
WHERE user_id = '00000000-0000-0000-0000-000000000001'
  AND test_date = CURRENT_DATE;
-- Erwartetes Ergebnis: current_flag='normal', critical_flag=false
```

---

## Dateistruktur

```
src/import/medical/
  01_seed_biomarkers_cbc.sql
  02_seed_biomarkers_metabolic.sql
  03_seed_biomarkers_lipid.sql
  04_seed_biomarkers_liver.sql
  05_seed_biomarkers_thyroid.sql
  06_seed_biomarkers_hormone.sql
  07_seed_biomarkers_inflammation.sql
  08_seed_biomarkers_vitamins.sql
  09_seed_biomarkers_cancer.sql
  10_seed_reference_ranges.sql
  11_seed_population_stats.sql
  12_verify.sql
  run_all.sh
```

---

## OCR Entity Matching (Biomarker Name → LOINC)

```typescript
// Fuzzy Matching: OCR-Name → Biomarker ID
const OCR_NAME_ALIASES: Record<string, string> = {
  // Englische Varianten
  'cholesterol': '2093-3',
  'total cholesterol': '2093-3',
  'chol': '2093-3',
  'ldl': '2089-1',
  'ldl cholesterol': '2089-1',
  'ldl-c': '2089-1',
  'hdl': '2085-9',
  'triglycerides': '2571-8',
  'trigs': '2571-8',
  'tg': '2571-8',
  'alt': '1742-6', 'sgpt': '1742-6',
  'ast': '1920-8', 'sgot': '1920-8',
  'tsh': '3016-3',
  'ft4': '3024-7', 'free t4': '3024-7', 't4 free': '3024-7',
  'ft3': '3051-0', 'free t3': '3051-0',
  'testosterone': '2986-8', 'total testosterone': '2986-8',
  'vitamin d': '1989-3', '25-oh vitamin d': '1989-3', '25(oh)d': '1989-3',
  'ferritin': '2276-4',
  'b12': '2132-9', 'vitamin b12': '2132-9',
  'hba1c': '4548-4', 'hemoglobin a1c': '4548-4', 'glycated hemoglobin': '4548-4',
  'crp': '30522-7', 'hs-crp': '30522-7', 'c-reactive protein': '30522-7',
  // Deutsche Varianten
  'gesamtcholesterin': '2093-3',
  'cholesterin gesamt': '2093-3',
  'triglyzeride': '2571-8',
  'testosteron gesamt': '2986-8',
  'vitamin d 25-oh': '1989-3',
  'nüchternblutzucker': '2345-7', 'nüchternglukose': '2345-7',
};

function matchBiomarkerName(ocrName: string): string | null {
  const normalized = ocrName.toLowerCase().trim().replace(/[^a-z0-9äöü\s-]/g, '');
  return OCR_NAME_ALIASES[normalized] ?? null;
}
```
