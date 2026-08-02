# Medical Module — Biomarker Database

## Übersicht

Kuratierte Datenbank mit 100+ Biomarkern in 9 Kategorien. Alle mit LOINC-Code.
Dual-Range System: Lab Range (klinisch normal) + Optimal Range (performanz-optimal).

---

## 9 Kategorien

| Kategorie | Slug | Deutsch | Marker-Anzahl |
|---|---|---|---|
| Complete Blood Count | cbc | Blutbild | ~15 |
| Metabolic Panel | metabolic | Stoffwechsel | ~15 |
| Lipid Panel | lipid | Blutfette | ~8 |
| Liver Panel | liver | Leberwerte | ~7 |
| Thyroid | thyroid | Schilddrüse | ~8 |
| Hormones | hormone | Hormone | ~15 |
| Inflammation | inflammation | Entzündungsmarker | ~6 |
| Vitamins & Minerals | vitamins_minerals | Vitamine & Mineralien | ~12 |
| Cancer Screening | cancer_screening | Tumormarker | ~5 |

---

## Seed-Daten: Kern-Biomarker mit Optimal Ranges

### Complete Blood Count (CBC)

| Marker | LOINC | Unit | Lab Min | Lab Max | Optimal Min | Optimal Max | Critical Low | Critical High |
|---|---|---|---|---|---|---|---|---|
| WBC | 6690-2 | 10³/µL | 4.5 | 11.0 | 5.0 | 8.0 | 2.0 | 15.0 |
| RBC | 789-8 | 10⁶/µL | 4.5 | 5.5 | 4.7 | 5.3 | 3.0 | 6.5 |
| Hemoglobin | 718-7 | g/dL | 13.5 | 17.5 | 14.5 | 17.0 | 8.0 | 20.0 |
| Hematocrit | 20570-8 | % | 38.3 | 48.6 | 40 | 48 | 25 | 55 |
| Platelets | 777-3 | 10³/µL | 150 | 400 | 175 | 350 | 50 | 600 |

### Metabolic Panel

| Marker | LOINC | Unit | Lab Opt.Min | Lab Opt.Max | Critical |
|---|---|---|---|---|---|
| Glucose (fasting) | 2345-7 | mg/dL | 65–99 | Optimal: 70–85 | >300 |
| HbA1c | 4548-4 | % | <6.5 | Optimal: <5.4 | >9 |
| Insulin (fasting) | 20448-7 | µIU/mL | 2–25 | Optimal: 2–6 | — |
| HOMA-IR | calc | ratio | <2.0 | Optimal: <1.0 | >4 |
| Creatinine (M) | 2160-0 | mg/dL | 0.7–1.3 | Optimal: 0.8–1.1 | >4 |
| eGFR | 62238-1 | mL/min | >60 | Optimal: >90 | <30 |
| BUN | 3094-0 | mg/dL | 7–20 | Optimal: 10–16 | >80 |
| Uric Acid | 3084-1 | mg/dL | 2.4–7.0 | Optimal: 3.5–6.0 | >9 |

### Lipid Panel

| Marker | LOINC | Unit | Lab Normal | Optimal | Critical |
|---|---|---|---|---|---|
| Total Cholesterol | 2093-3 | mg/dL | <200 | 150–180 | >300 |
| LDL | 2089-1 | mg/dL | <130 | <100 | >190 |
| HDL (M) | 2085-9 | mg/dL | >40 | >50 | <35 |
| Triglycerides | 2571-8 | mg/dL | <150 | <100 | >500 |
| ApoB | 1869-7 | mg/dL | <130 | <90 | >150 |
| Lp(a) | 10835-7 | nmol/L | <125 | <75 | >200 |

### Liver Panel

| Marker | LOINC | Unit | Optimal | Critical |
|---|---|---|---|---|
| ALT | 1742-6 | U/L | <25 | >200 |
| AST | 1920-8 | U/L | <25 | >200 |
| GGT | 2324-2 | U/L | <30 | >500 |
| ALP | 6768-6 | U/L | 44–147 | >500 |
| Bilirubin Total | 1975-2 | mg/dL | 0.1–1.0 | >3.0 |
| Albumin | 1751-7 | g/dL | 3.5–5.5 | <2.5 |

### Thyroid

| Marker | LOINC | Unit | Lab Normal | Optimal |
|---|---|---|---|---|
| TSH | 3016-3 | mIU/L | 0.4–4.0 | 0.5–2.5 |
| Free T4 | 3024-7 | ng/dL | 0.8–1.8 | 1.0–1.5 |
| Free T3 | 3051-0 | pg/mL | 2.3–4.2 | 3.0–4.0 |
| Reverse T3 | 3053-6 | ng/dL | 9–24 | <15 |
| TPO Antibodies | 5385-0 | IU/mL | <35 | <9 |

### Hormones (Männer)

| Marker | LOINC | Unit | Lab Normal | Optimal |
|---|---|---|---|---|
| Total Testosterone | 2986-8 | ng/dL | 300–1000 | 500–900 |
| Free Testosterone | 2991-8 | pg/mL | 5.0–21.0 | 10–25 |
| SHBG | 13967-5 | nmol/L | 10–80 | 20–40 |
| Estradiol (E2) | 2243-4 | pg/mL | <39 (M) | 20–35 |
| DHEA-S | 2191-5 | µg/dL | 100–600 | 200–400 |
| Cortisol (AM) | 2143-6 | µg/dL | 7–28 | 10–18 |
| LH | 10501-5 | mIU/mL | 1.7–8.6 | 3–8 |
| IGF-1 | 10231-9 | ng/mL | Age-adj. | Age-adj. |
| Prolactin | 15081-6 | ng/mL | 2–18 | 4–15 |

### Inflammation

| Marker | LOINC | Unit | Lab Normal | Optimal |
|---|---|---|---|---|
| hs-CRP | 30522-7 | mg/L | <3.0 | <1.0 |
| Homocysteine | 13965-9 | µmol/L | <15 | <7 |
| ESR | 4537-7 | mm/hr | <20 | <10 |
| Ferritin (M) | 2276-4 | ng/mL | 12–300 | 80–150 (Athlete) |
| Fibrinogen | 3255-7 | mg/dL | 200–400 | 200–300 |

### Vitamins & Minerals

| Marker | LOINC | Unit | Lab Normal | Optimal |
|---|---|---|---|---|
| Vitamin D (25-OH) | 1989-3 | ng/mL | 20–100 | 40–60 |
| Vitamin B12 | 2132-9 | pg/mL | 200–900 | 500–900 |
| Folate | 2132-9 | ng/mL | >3.0 | >10 |
| Iron (serum) | 2498-4 | µg/dL | 60–170 | 80–150 |
| Ferritin | 2276-4 | ng/mL | 12–300 | 80–150 |
| Magnesium (RBC) | 2614-6 | mg/dL | 4.2–6.8 | 5.0–6.5 |
| Zinc | 5762-0 | µg/dL | 60–130 | 80–120 |
| Selenium | 2913-2 | µg/L | 70–150 | 110–150 |

---

## Algorithmus: Biomarker Flag Berechnung

```typescript
function calcBiomarkerFlag(
  value: number,
  biomarker: Biomarker,
  gender: 'male' | 'female',
  age: number
): BiomarkerFlag {
  // 1. Gender/Age-spezifische Range laden
  const range = getApplicableRange(biomarker, gender, age);

  // 2. Critical Check (sofort-Arzt)
  if (value <= biomarker.critical_low_value)  return 'critical_low';
  if (value >= biomarker.critical_high_value) return 'critical_high';

  // 3. Optimal Range Check
  if (value >= range.optimal_min && value <= range.optimal_max) return 'optimal';

  // 4. Lab Normal Range Check
  if (value >= range.lab_min && value <= range.lab_max) return 'normal';

  // 5. Auffällig
  if (value < range.lab_min) return 'low';
  return 'high';
}

type BiomarkerFlag = 'optimal' | 'normal' | 'low' | 'high' | 'critical_low' | 'critical_high';
```

---

## Farbcoding

| Flag | Farbe | Bedeutung |
|---|---|---|
| optimal | 🟢 Dunkelgrün | Im optimalen Bereich |
| normal | 🟡 Gelb | Im Labor-Normal-Bereich, aber nicht optimal |
| low / high | 🟠 Orange | Ausserhalb Labor-Normal, aber nicht kritisch |
| critical_low / critical_high | 🔴 Rot | Sofort-Arzt empfohlen |

---

## Import-Dateistruktur

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
  11_verify.sql
  run_all.sh
```
