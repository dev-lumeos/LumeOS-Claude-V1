// Die Daten und Formeln des Medical-Moduls.
//
// QUELLE: theme-v1/module-medical-data.jsx (298 Zeilen).
//
// `[cmd]` **Diese Datei ist neu in der Vorlagenwelt.** Bei keinem der
// bisherigen sechs Module gab es eine reine Datendatei — Recovery hatte
// `-engine.jsx` mit Formeln, aber ohne Katalog. Hier liegt der
// Biomarker-Katalog: 48 Marker mit LOINC-Code, Doppelbereich (Labor
// und Optimum) und Verlauf.
//
// **Die Formeln bleiben stehen.** Dieselbe Regel wie beim Nutrition
// score (G-05), Training score (G-16), Recovery (G-21) und Goals
// (G-28): `calcBiomarkerFlag`, `calcSystemScore`,
// `calcOverallHealthScore`, `calcBiomarkerTrend` und
// `calcSupplementEffectiveness` sind uebernommen, nicht erfunden. Ein
// Test legt sie daneben.
//
// GEAENDERT IST NUR DAS TECHNISCHE: TypeScript statt JS, benannte
// Exporte statt `Object.assign(window, …)`.
//
// `[cmd]` KEINE HYDRATIONSFALLE: Anders als bei Goals kommt in den
// drei Medical-Dateien weder `Math.random()` noch `Date.now()` vor —
// geprueft. Die Verlaeufe sind feste Zahlenreihen.
//
// `[cmd]` ALLES IST ATTRAPPE. Ein `medical`-Schema gibt es nicht.

// ── Das Sechs-Flaggen-Verfahren (SPEC_09 §2) ────────────────────
// [cmd] module-medical-data.jsx:5-13.
export const FLAG_SCORE: Record<string, number> = {
  optimal: 100, normal: 75, low: 40, high: 40, critical_low: 10, critical_high: 10,
}

export const FLAG_META: Record<string, { label: string; c: string; icon: string }> = {
  optimal: { label: 'Optimal', c: 'var(--pos)', icon: 'check' },
  normal: { label: 'Normal', c: 'var(--acc-recov)', icon: 'check' },
  low: { label: 'Low', c: 'var(--warn)', icon: 'trend_down' },
  high: { label: 'High', c: 'var(--warn)', icon: 'trend_up' },
  critical_low: { label: 'Critical low', c: 'var(--neg)', icon: 'alert' },
  critical_high: { label: 'Critical high', c: 'var(--neg)', icon: 'alert' },
}

export type Biomarker = {
  id: string; loinc: string; name: string; de: string; abbr: string; cat: string
  unit: string
  lab_min: number | null; lab_max: number | null
  optimal_min: number | null; optimal_max: number | null
  critical_low: number | null; critical_high: number | null
  value: number; prio: number; freq: string; ev: string
  hist: number[]; sig: string
  fasting?: boolean
  gender_ranges?: Record<string, { optimal_min?: number; optimal_max?: number; lab_min?: number; lab_max?: number }>
}

/**
 * Die Flagge eines Messwerts.
 *
 * `[cmd]` module-medical-data.jsx:15-25. Die Reihenfolge der Pruefungen
 * ist wesentlich: kritisch schlaegt optimal, optimal schlaegt normal.
 * Wer sie umstellt, bekommt fuer denselben Wert eine andere Flagge.
 */
export function calcBiomarkerFlag(value: number, b: Biomarker, gender = 'male'): string {
  const g = b.gender_ranges?.[gender] ?? {}
  const optMin = g.optimal_min ?? b.optimal_min
  const optMax = g.optimal_max ?? b.optimal_max
  const labMin = g.lab_min ?? b.lab_min
  const labMax = g.lab_max ?? b.lab_max
  if (b.critical_low != null && value <= b.critical_low) return 'critical_low'
  if (b.critical_high != null && value >= b.critical_high) return 'critical_high'
  if (optMin != null && optMax != null && value >= optMin && value <= optMax) return 'optimal'
  if (labMin != null && labMax != null && value >= labMin && value <= labMax) return 'normal'
  if (labMin != null && value < labMin) return 'low'
  return 'high'
}

// ── Der Katalog · 9 Kategorien, LOINC, Doppelbereiche ───────────
// [cmd] module-medical-data.jsx:28-96 — 48 Marker, unveraendert.
export const BIOMARKERS: Biomarker[] = [
  // CBC
  { id: 'hgb', loinc: '718-7', name: 'Hemoglobin', de: 'Hämoglobin', abbr: 'Hb', cat: 'cbc', unit: 'g/dL', lab_min: 13.5, lab_max: 17.5, optimal_min: 14.5, optimal_max: 16.5, critical_low: 8, critical_high: 20, value: 15.8, prio: 90, freq: 'quarterly', ev: 'A', hist: [15.0, 15.2, 15.5, 15.6, 15.8, 15.8], sig: 'Oxygen transport capacity. Low = anemia, high = polycythemia (TRT risk).' },
  { id: 'hct', loinc: '4544-3', name: 'Hematocrit', de: 'Hämatokrit', abbr: 'HCT', cat: 'cbc', unit: '%', lab_min: 39, lab_max: 50, optimal_min: 42, optimal_max: 47, critical_low: 30, critical_high: 54, value: 48, prio: 95, freq: 'quarterly', ev: 'A', hist: [44, 45, 45, 46, 47, 48], sig: 'Red cell volume fraction. TRT commonly elevates — >52% warrants phlebotomy discussion.' },
  { id: 'rbc', loinc: '789-8', name: 'RBC Count', de: 'Erythrozyten', abbr: 'RBC', cat: 'cbc', unit: 'M/µL', lab_min: 4.5, lab_max: 5.9, optimal_min: 4.8, optimal_max: 5.5, critical_low: 3.0, critical_high: 7.0, value: 5.4, prio: 60, freq: 'quarterly', ev: 'A', hist: [5.1, 5.2, 5.2, 5.3, 5.4, 5.4], sig: 'Red blood cell count.' },
  { id: 'wbc', loinc: '6690-2', name: 'WBC Count', de: 'Leukozyten', abbr: 'WBC', cat: 'cbc', unit: 'K/µL', lab_min: 4.0, lab_max: 11.0, optimal_min: 4.5, optimal_max: 7.0, critical_low: 2.0, critical_high: 20, value: 6.2, prio: 60, freq: 'quarterly', ev: 'A', hist: [6.4, 6.1, 6.0, 6.3, 6.2, 6.2], sig: 'Immune cell count. Elevated = infection or inflammation.' },
  { id: 'plt', loinc: '777-3', name: 'Platelets', de: 'Thrombozyten', abbr: 'PLT', cat: 'cbc', unit: 'K/µL', lab_min: 150, lab_max: 400, optimal_min: 200, optimal_max: 300, critical_low: 50, critical_high: 600, value: 248, prio: 50, freq: 'annually', ev: 'A', hist: [240, 244, 250, 246, 248, 248], sig: 'Clotting cells.' },

  // Metabolic
  { id: 'glu', loinc: '1558-6', name: 'Glucose (fasting)', de: 'Nüchternglukose', abbr: 'GLU', cat: 'metabolic', unit: 'mg/dL', lab_min: 70, lab_max: 99, optimal_min: 75, optimal_max: 88, critical_low: 50, critical_high: 200, value: 102, prio: 98, freq: 'quarterly', ev: 'A+', hist: [88, 92, 94, 96, 99, 102], sig: 'Fasting blood sugar. Rising trend on GH secretagogues is expected — watch for >110.', fasting: true },
  { id: 'hba1c', loinc: '4548-4', name: 'HbA1c', de: 'Langzeitzucker', abbr: 'HbA1c', cat: 'metabolic', unit: '%', lab_min: 4.0, lab_max: 5.7, optimal_min: 4.6, optimal_max: 5.2, critical_low: 3.5, critical_high: 8.0, value: 5.4, prio: 97, freq: 'quarterly', ev: 'A+', hist: [5.2, 5.3, 5.3, 5.4, 5.4, 5.4], sig: '3-month average glucose. Best single metabolic marker.' },
  { id: 'ins', loinc: '20448-7', name: 'Insulin (fasting)', de: 'Insulin nüchtern', abbr: 'INS', cat: 'metabolic', unit: 'µIU/mL', lab_min: 2.6, lab_max: 24.9, optimal_min: 2.0, optimal_max: 6.0, critical_low: 1.0, critical_high: 40, value: 7.4, prio: 92, freq: 'quarterly', ev: 'A', hist: [5.2, 5.8, 6.2, 6.8, 7.1, 7.4], sig: "Fasting insulin. Lab 'normal' up to 25 is far above metabolically optimal.", fasting: true },
  { id: 'homa', loinc: '—', name: 'HOMA-IR', de: 'HOMA-IR', abbr: 'HOMA', cat: 'metabolic', unit: 'index', lab_min: 0, lab_max: 2.9, optimal_min: 0.5, optimal_max: 1.5, critical_low: null, critical_high: 5.0, value: 1.86, prio: 90, freq: 'quarterly', ev: 'A', hist: [1.13, 1.32, 1.44, 1.61, 1.73, 1.86], sig: 'Insulin resistance index = (glucose × insulin) / 405.' },

  // Lipid
  { id: 'ldl', loinc: '13457-7', name: 'LDL Cholesterol', de: 'LDL', abbr: 'LDL', cat: 'lipid', unit: 'mg/dL', lab_min: 0, lab_max: 130, optimal_min: 0, optimal_max: 80, critical_low: null, critical_high: 190, value: 102, prio: 95, freq: 'quarterly', ev: 'A+', hist: [118, 112, 108, 104, 102, 102], sig: 'Primary atherogenic particle carrier.' },
  { id: 'hdl', loinc: '2085-9', name: 'HDL Cholesterol', de: 'HDL', abbr: 'HDL', cat: 'lipid', unit: 'mg/dL', lab_min: 40, lab_max: 100, optimal_min: 55, optimal_max: 90, critical_low: 25, critical_high: null, value: 58, prio: 88, freq: 'quarterly', ev: 'A', hist: [48, 52, 54, 56, 57, 58], sig: 'Reverse cholesterol transport. Oral AAS suppress this sharply.' },
  { id: 'tg', loinc: '2571-8', name: 'Triglycerides', de: 'Triglyceride', abbr: 'TG', cat: 'lipid', unit: 'mg/dL', lab_min: 0, lab_max: 150, optimal_min: 0, optimal_max: 80, critical_low: null, critical_high: 500, value: 78, prio: 88, freq: 'quarterly', ev: 'A', hist: [102, 96, 90, 84, 80, 78], sig: 'Blood fats. Highly diet-responsive.', fasting: true },
  { id: 'chol', loinc: '2093-3', name: 'Total Cholesterol', de: 'Gesamtcholesterin', abbr: 'TC', cat: 'lipid', unit: 'mg/dL', lab_min: 0, lab_max: 200, optimal_min: 140, optimal_max: 190, critical_low: null, critical_high: 300, value: 184, prio: 80, freq: 'quarterly', ev: 'A', hist: [192, 188, 186, 184, 185, 184], sig: 'Total circulating cholesterol.' },
  { id: 'apob', loinc: '1884-6', name: 'ApoB', de: 'Apolipoprotein B', abbr: 'ApoB', cat: 'lipid', unit: 'mg/dL', lab_min: 0, lab_max: 130, optimal_min: 0, optimal_max: 80, critical_low: null, critical_high: 160, value: 88, prio: 93, freq: 'quarterly', ev: 'A+', hist: [104, 98, 94, 90, 88, 88], sig: 'Particle count — better CV risk predictor than LDL-C.' },

  // Liver
  { id: 'alt', loinc: '1742-6', name: 'ALT', de: 'ALT (GPT)', abbr: 'ALT', cat: 'liver', unit: 'U/L', lab_min: 0, lab_max: 40, optimal_min: 10, optimal_max: 26, critical_low: null, critical_high: 120, value: 28, prio: 92, freq: 'quarterly', ev: 'A', hist: [24, 26, 27, 28, 28, 28], sig: 'Liver enzyme. Elevated by oral 17-aa compounds and heavy training.' },
  { id: 'ast', loinc: '1920-8', name: 'AST', de: 'AST (GOT)', abbr: 'AST', cat: 'liver', unit: 'U/L', lab_min: 0, lab_max: 40, optimal_min: 10, optimal_max: 26, critical_low: null, critical_high: 120, value: 22, prio: 88, freq: 'quarterly', ev: 'A', hist: [20, 21, 22, 22, 23, 22], sig: 'Liver + muscle enzyme. Rises after intense training — not liver-specific.' },
  { id: 'ggt', loinc: '2324-2', name: 'GGT', de: 'Gamma-GT', abbr: 'GGT', cat: 'liver', unit: 'U/L', lab_min: 0, lab_max: 60, optimal_min: 5, optimal_max: 20, critical_low: null, critical_high: 200, value: 24, prio: 85, freq: 'quarterly', ev: 'A', hist: [18, 20, 21, 22, 23, 24], sig: 'Most liver-specific of the enzymes. Alcohol and oral compounds raise it.' },
  { id: 'alp', loinc: '6768-6', name: 'ALP', de: 'Alk. Phosphatase', abbr: 'ALP', cat: 'liver', unit: 'U/L', lab_min: 40, lab_max: 130, optimal_min: 50, optimal_max: 90, critical_low: null, critical_high: 300, value: 72, prio: 60, freq: 'annually', ev: 'B', hist: [70, 71, 72, 73, 72, 72], sig: 'Liver + bone enzyme.' },
  { id: 'bili', loinc: '1975-2', name: 'Bilirubin Total', de: 'Bilirubin', abbr: 'TBIL', cat: 'liver', unit: 'mg/dL', lab_min: 0.2, lab_max: 1.2, optimal_min: 0.3, optimal_max: 0.9, critical_low: null, critical_high: 3.0, value: 0.7, prio: 60, freq: 'quarterly', ev: 'B', hist: [0.6, 0.7, 0.7, 0.8, 0.7, 0.7], sig: 'Heme breakdown product.' },
  { id: 'alb', loinc: '1751-7', name: 'Albumin', de: 'Albumin', abbr: 'ALB', cat: 'liver', unit: 'g/dL', lab_min: 3.5, lab_max: 5.0, optimal_min: 4.2, optimal_max: 4.8, critical_low: 2.5, critical_high: null, value: 4.5, prio: 65, freq: 'annually', ev: 'B', hist: [4.4, 4.4, 4.5, 4.5, 4.5, 4.5], sig: 'Main plasma protein · liver synthesis capacity.' },

  // Kidney
  { id: 'crea', loinc: '2160-0', name: 'Creatinine', de: 'Kreatinin', abbr: 'CREA', cat: 'kidney', unit: 'mg/dL', lab_min: 0.7, lab_max: 1.3, optimal_min: 0.8, optimal_max: 1.1, critical_low: null, critical_high: 2.0, value: 1.14, prio: 90, freq: 'quarterly', ev: 'A', hist: [1.05, 1.08, 1.10, 1.12, 1.13, 1.14], sig: 'Muscle metabolite. Elevated in high-muscle athletes without kidney issue — use cystatin C to confirm.' },
  { id: 'bun', loinc: '3094-0', name: 'BUN', de: 'Harnstoff-N', abbr: 'BUN', cat: 'kidney', unit: 'mg/dL', lab_min: 7, lab_max: 20, optimal_min: 10, optimal_max: 16, critical_low: null, critical_high: 50, value: 18, prio: 70, freq: 'quarterly', ev: 'B', hist: [16, 17, 17, 18, 18, 18], sig: 'Protein metabolism byproduct. High-protein diets raise it.' },
  { id: 'egfr', loinc: '33914-3', name: 'eGFR', de: 'eGFR', abbr: 'eGFR', cat: 'kidney', unit: 'mL/min', lab_min: 90, lab_max: 130, optimal_min: 95, optimal_max: 130, critical_low: 45, critical_high: null, value: 88, prio: 92, freq: 'quarterly', ev: 'A', hist: [95, 94, 92, 90, 89, 88], sig: 'Filtration rate estimate. Creatinine-based eGFR underestimates in muscular individuals.' },
  { id: 'ua', loinc: '3084-1', name: 'Uric Acid', de: 'Harnsäure', abbr: 'UA', cat: 'kidney', unit: 'mg/dL', lab_min: 3.4, lab_max: 7.0, optimal_min: 3.5, optimal_max: 5.5, critical_low: null, critical_high: 10, value: 6.2, prio: 70, freq: 'quarterly', ev: 'B', hist: [5.6, 5.8, 5.9, 6.0, 6.1, 6.2], sig: 'Purine metabolite. High = gout risk.' },

  // Thyroid
  { id: 'tsh', loinc: '3016-3', name: 'TSH', de: 'TSH', abbr: 'TSH', cat: 'thyroid', unit: 'mIU/L', lab_min: 0.4, lab_max: 4.5, optimal_min: 0.8, optimal_max: 2.0, critical_low: 0.1, critical_high: 10, value: 1.8, prio: 90, freq: 'quarterly', ev: 'A', hist: [1.9, 1.8, 1.7, 1.8, 1.9, 1.8], sig: 'Pituitary thyroid signal. Lab range far wider than functional optimum.' },
  { id: 'ft3', loinc: '3051-0', name: 'Free T3', de: 'fT3', abbr: 'fT3', cat: 'thyroid', unit: 'pg/mL', lab_min: 2.3, lab_max: 4.2, optimal_min: 3.2, optimal_max: 4.0, critical_low: 1.5, critical_high: 6.0, value: 3.1, prio: 88, freq: 'quarterly', ev: 'A', hist: [3.4, 3.3, 3.2, 3.2, 3.1, 3.1], sig: 'Active thyroid hormone. Drops in caloric deficit.' },
  { id: 'ft4', loinc: '3024-7', name: 'Free T4', de: 'fT4', abbr: 'fT4', cat: 'thyroid', unit: 'ng/dL', lab_min: 0.8, lab_max: 1.8, optimal_min: 1.1, optimal_max: 1.6, critical_low: 0.4, critical_high: 3.0, value: 1.3, prio: 75, freq: 'quarterly', ev: 'A', hist: [1.3, 1.3, 1.3, 1.4, 1.3, 1.3], sig: 'Storage thyroid hormone.' },
  { id: 'rt3', loinc: '—', name: 'Reverse T3', de: 'rT3', abbr: 'rT3', cat: 'thyroid', unit: 'ng/dL', lab_min: 8, lab_max: 25, optimal_min: 8, optimal_max: 15, critical_low: null, critical_high: 40, value: 19, prio: 65, freq: 'annually', ev: 'B', hist: [15, 16, 17, 18, 18, 19], sig: 'Inactive T3 form. Rises under chronic stress and deficit.' },

  // Hormone
  { id: 'tt', loinc: '2986-8', name: 'Total Testosterone', de: 'Gesamt-Testosteron', abbr: 'TT', cat: 'hormone', unit: 'ng/dL', lab_min: 300, lab_max: 1000, optimal_min: 600, optimal_max: 900, critical_low: 150, critical_high: 1500, value: 712, prio: 99, freq: 'quarterly', ev: 'A+', hist: [580, 620, 650, 680, 700, 712], gender_ranges: { male: { optimal_min: 600, optimal_max: 900 }, female: { optimal_min: 15, optimal_max: 70 } }, sig: 'Primary androgen. Trough measurement on TRT is what matters.' },
  { id: 'ft', loinc: '2991-8', name: 'Free Testosterone', de: 'Freies Testosteron', abbr: 'fT', cat: 'hormone', unit: 'ng/dL', lab_min: 9, lab_max: 30, optimal_min: 15, optimal_max: 25, critical_low: 4, critical_high: 50, value: 18.4, prio: 97, freq: 'quarterly', ev: 'A', hist: [12, 14, 15.5, 17, 18, 18.4], sig: 'Bioavailable fraction. SHBG-dependent.' },
  { id: 'e2', loinc: '2243-4', name: 'Estradiol (sens.)', de: 'Östradiol', abbr: 'E2', cat: 'hormone', unit: 'pg/mL', lab_min: 10, lab_max: 40, optimal_min: 20, optimal_max: 35, critical_low: 5, critical_high: 80, value: 26, prio: 96, freq: 'quarterly', ev: 'A', hist: [22, 28, 32, 25, 27, 26], sig: 'Aromatized testosterone. Both too low and too high cause symptoms.' },
  { id: 'shbg', loinc: '13967-5', name: 'SHBG', de: 'SHBG', abbr: 'SHBG', cat: 'hormone', unit: 'nmol/L', lab_min: 10, lab_max: 57, optimal_min: 20, optimal_max: 40, critical_low: 5, critical_high: 100, value: 32, prio: 85, freq: 'quarterly', ev: 'A', hist: [36, 35, 34, 33, 32, 32], sig: 'Binding globulin. Determines free fraction.' },
  { id: 'lh', loinc: '10501-5', name: 'LH', de: 'LH', abbr: 'LH', cat: 'hormone', unit: 'IU/L', lab_min: 1.7, lab_max: 8.6, optimal_min: 3.0, optimal_max: 6.0, critical_low: 0.2, critical_high: 20, value: 4.2, prio: 82, freq: 'quarterly', ev: 'A', hist: [4.0, 4.1, 4.3, 4.0, 4.1, 4.2], sig: 'Pituitary signal to testes. Suppressed by exogenous testosterone unless HCG used.' },
  { id: 'fsh', loinc: '15067-2', name: 'FSH', de: 'FSH', abbr: 'FSH', cat: 'hormone', unit: 'IU/L', lab_min: 1.5, lab_max: 12.4, optimal_min: 2.0, optimal_max: 8.0, critical_low: 0.2, critical_high: 25, value: 3.8, prio: 75, freq: 'quarterly', ev: 'A', hist: [4.0, 3.9, 3.9, 3.8, 3.8, 3.8], sig: 'Spermatogenesis signal.' },
  { id: 'prl', loinc: '2842-3', name: 'Prolactin', de: 'Prolaktin', abbr: 'PRL', cat: 'hormone', unit: 'ng/mL', lab_min: 2, lab_max: 18, optimal_min: 4, optimal_max: 12, critical_low: null, critical_high: 50, value: 9.4, prio: 78, freq: 'quarterly', ev: 'A', hist: [8.8, 9.0, 9.2, 9.1, 9.3, 9.4], sig: 'Elevated by 19-nor compounds. Causes libido and erectile issues.' },
  { id: 'cort', loinc: '2143-6', name: 'Cortisol (AM)', de: 'Cortisol', abbr: 'CORT', cat: 'hormone', unit: 'µg/dL', lab_min: 6, lab_max: 23, optimal_min: 10, optimal_max: 18, critical_low: 3, critical_high: 35, value: 16.2, prio: 86, freq: 'quarterly', ev: 'A', hist: [14.8, 15.2, 15.6, 15.9, 16.0, 16.2], sig: 'Stress hormone. Morning draw only. Rises with training load and sleep debt.' },
  { id: 'igf1', loinc: '2484-4', name: 'IGF-1', de: 'IGF-1', abbr: 'IGF-1', cat: 'hormone', unit: 'ng/mL', lab_min: 115, lab_max: 355, optimal_min: 180, optimal_max: 280, critical_low: 50, critical_high: 500, value: 286, prio: 88, freq: 'quarterly', ev: 'A', hist: [180, 210, 240, 270, 282, 286], sig: 'GH downstream marker. Elevated by MK-677 and exogenous GH.' },
  { id: 'dhea', loinc: '2191-5', name: 'DHEA-S', de: 'DHEA-S', abbr: 'DHEA', cat: 'hormone', unit: 'µg/dL', lab_min: 100, lab_max: 500, optimal_min: 250, optimal_max: 450, critical_low: 30, critical_high: 800, value: 328, prio: 70, freq: 'annually', ev: 'B', hist: [310, 315, 320, 324, 326, 328], sig: 'Adrenal androgen precursor.' },

  // Inflammation
  { id: 'crp', loinc: '30522-7', name: 'hs-CRP', de: 'hs-CRP', abbr: 'hsCRP', cat: 'inflammation', unit: 'mg/L', lab_min: 0, lab_max: 3.0, optimal_min: 0, optimal_max: 0.8, critical_low: null, critical_high: 10, value: 0.6, prio: 94, freq: 'quarterly', ev: 'A+', hist: [0.7, 0.6, 0.5, 0.7, 0.6, 0.6], sig: 'Systemic inflammation. Best single longevity marker in the panel.' },
  { id: 'hcy', loinc: '13965-9', name: 'Homocysteine', de: 'Homocystein', abbr: 'HCY', cat: 'inflammation', unit: 'µmol/L', lab_min: 5, lab_max: 15, optimal_min: 5, optimal_max: 8, critical_low: null, critical_high: 30, value: 9.8, prio: 82, freq: 'annually', ev: 'A', hist: [11.2, 10.8, 10.4, 10.1, 9.9, 9.8], sig: 'Methylation marker. B12/folate/B6 responsive.' },
  { id: 'esr', loinc: '4537-7', name: 'ESR', de: 'BSG', abbr: 'ESR', cat: 'inflammation', unit: 'mm/h', lab_min: 0, lab_max: 15, optimal_min: 0, optimal_max: 8, critical_low: null, critical_high: 50, value: 6, prio: 55, freq: 'annually', ev: 'B', hist: [7, 6, 6, 7, 6, 6], sig: 'Non-specific inflammation.' },

  // Vitamins + minerals
  { id: 'vitd', loinc: '14635-7', name: 'Vitamin D (25-OH)', de: 'Vitamin D', abbr: '25-OH-D', cat: 'vitamins_minerals', unit: 'ng/mL', lab_min: 30, lab_max: 100, optimal_min: 50, optimal_max: 80, critical_low: 12, critical_high: 150, value: 48, prio: 96, freq: 'quarterly', ev: 'A+', hist: [22, 28, 36, 42, 46, 48], sig: 'Hormone, not vitamin. Lab floor of 30 is deficiency-avoidance, not optimum.' },
  { id: 'b12', loinc: '2132-9', name: 'Vitamin B12', de: 'Vitamin B12', abbr: 'B12', cat: 'vitamins_minerals', unit: 'pg/mL', lab_min: 200, lab_max: 900, optimal_min: 500, optimal_max: 800, critical_low: 150, critical_high: 2000, value: 612, prio: 85, freq: 'annually', ev: 'A', hist: [480, 520, 560, 588, 600, 612], sig: 'Neurological and hematological cofactor.' },
  { id: 'fol', loinc: '2284-8', name: 'Folate', de: 'Folsäure', abbr: 'FOL', cat: 'vitamins_minerals', unit: 'ng/mL', lab_min: 3, lab_max: 20, optimal_min: 10, optimal_max: 20, critical_low: 2, critical_high: null, value: 12.4, prio: 70, freq: 'annually', ev: 'A', hist: [10.8, 11.2, 11.8, 12.0, 12.2, 12.4], sig: 'Methylation cofactor with B12.' },
  { id: 'fer', loinc: '2276-4', name: 'Ferritin', de: 'Ferritin', abbr: 'FER', cat: 'vitamins_minerals', unit: 'ng/mL', lab_min: 12, lab_max: 300, optimal_min: 80, optimal_max: 150, critical_low: 12, critical_high: 500, value: 142, prio: 95, freq: 'quarterly', ev: 'A+', hist: [88, 102, 118, 128, 138, 142], sig: 'Iron store. Lab range 12–300 is uselessly wide — athletes need 80–150.' },
  { id: 'mg', loinc: '2601-3', name: 'Magnesium (RBC)', de: 'Magnesium', abbr: 'MG', cat: 'vitamins_minerals', unit: 'mg/dL', lab_min: 4.2, lab_max: 6.8, optimal_min: 5.6, optimal_max: 6.8, critical_low: 3.0, critical_high: null, value: 5.9, prio: 84, freq: 'annually', ev: 'A', hist: [5.2, 5.4, 5.6, 5.7, 5.8, 5.9], sig: 'RBC magnesium reflects tissue stores — serum does not.' },
  { id: 'zn', loinc: '5763-8', name: 'Zinc (serum)', de: 'Zink', abbr: 'ZN', cat: 'vitamins_minerals', unit: 'µg/dL', lab_min: 70, lab_max: 120, optimal_min: 90, optimal_max: 120, critical_low: 40, critical_high: 200, value: 96, prio: 78, freq: 'annually', ev: 'B', hist: [84, 88, 91, 94, 95, 96], sig: 'Immune and testosterone cofactor.' },

  // Cancer screening
  { id: 'psa', loinc: '2857-1', name: 'PSA', de: 'PSA', abbr: 'PSA', cat: 'cancer_screening', unit: 'ng/mL', lab_min: 0, lab_max: 2.5, optimal_min: 0, optimal_max: 1.0, critical_low: null, critical_high: 4.0, value: 0.9, prio: 90, freq: 'annually', ev: 'A', hist: [0.7, 0.8, 0.8, 0.9, 0.9, 0.9], sig: 'Prostate marker. Mandatory monitoring on TRT.' },
]

// [cmd] module-medical-data.jsx:98-110.
export const BIOMARKER_CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'cbc', label: 'CBC' },
  { id: 'metabolic', label: 'Metabolic' },
  { id: 'lipid', label: 'Lipid' },
  { id: 'liver', label: 'Liver' },
  { id: 'kidney', label: 'Kidney' },
  { id: 'thyroid', label: 'Thyroid' },
  { id: 'hormone', label: 'Hormone' },
  { id: 'inflammation', label: 'Inflammation' },
  { id: 'vitamins_minerals', label: 'Vitamins & minerals' },
  { id: 'cancer_screening', label: 'Screening' },
]

// ── Systemwerte (SPEC_09 §1) ────────────────────────────────────
// [cmd] module-medical-data.jsx:113-127.
export const SYSTEM_MARKERS: Record<string, string[]> = {
  liver: ['ALT', 'AST', 'GGT', 'ALP', 'TBIL', 'ALB'],
  cardiovascular: ['LDL', 'HDL', 'TG', 'hsCRP', 'HCY', 'ApoB'],
  kidney: ['CREA', 'BUN', 'eGFR', 'UA'],
  hormonal: ['TT', 'E2', 'CORT', 'TSH', 'fT3', 'PRL'],
  metabolic: ['HbA1c', 'GLU', 'INS', 'HOMA'],
}

export const SYSTEM_WEIGHTS: Record<string, number> = {
  cardiovascular: 0.25, metabolic: 0.25, hormonal: 0.20, liver: 0.15, kidney: 0.15,
}

export const SYSTEM_META: Record<string, { label: string; de: string; c: string }> = {
  liver: { label: 'Liver', de: 'Leber', c: 'var(--acc-nutri)' },
  cardiovascular: { label: 'Cardiovascular', de: 'Herz-Kreislauf', c: 'var(--neg)' },
  kidney: { label: 'Kidney', de: 'Niere', c: 'var(--acc-recov)' },
  hormonal: { label: 'Hormonal', de: 'Hormone', c: 'var(--acc-medic)' },
  metabolic: { label: 'Metabolic', de: 'Stoffwechsel', c: 'var(--acc-goals)' },
}

export type Systemwert = {
  score: number | null
  status: string
  marker_count: number
  missing: number
}

/** [cmd] module-medical-data.jsx:129-145. */
export function calcSystemScore(system: string): Systemwert {
  const names = SYSTEM_MARKERS[system]
  const scores: number[] = []
  names.forEach(n => {
    const b = BIOMARKERS.find(x => x.abbr === n || x.name === n)
    if (!b) return
    scores.push(FLAG_SCORE[calcBiomarkerFlag(b.value, b)] ?? 50)
  })
  if (!scores.length) return { score: null, status: 'no_data', marker_count: 0, missing: names.length }
  const avg = scores.reduce((s, v) => s + v, 0) / scores.length
  return {
    score: Math.round(avg),
    status: avg >= 85 ? 'optimal' : avg >= 65 ? 'normal' : avg >= 40 ? 'warn' : 'critical',
    marker_count: scores.length,
    missing: names.length - scores.length,
  }
}

/** [cmd] module-medical-data.jsx:146-154. Die Gewichtung bleibt. */
export function calcOverallHealthScore() {
  let total = 0
  let totalW = 0
  Object.entries(SYSTEM_WEIGHTS).forEach(([sys, w]) => {
    const s = calcSystemScore(sys)
    if (s.score != null) { total += s.score * w; totalW += w }
  })
  const score = totalW > 0 ? Math.round(total / totalW) : 0
  return {
    score,
    status: score >= 85 ? 'optimal' : score >= 70 ? 'good' : score >= 55 ? 'fair' : 'poor',
    data_completeness: totalW,
  }
}

// ── Trend als lineare Regression (SPEC_09 §4) ───────────────────
export type Trend = {
  direction: string; strength: string; slope: number
  change_pct: number; projected: number | null; n: number
}

/** [cmd] module-medical-data.jsx:157-172. */
export function calcBiomarkerTrend(hist: number[]): Trend {
  const n = hist.length
  if (n < 3) return { direction: 'insufficient_data', strength: 'negligible', slope: 0, change_pct: 0, projected: null, n }
  const xs = hist.map((_, i) => i)
  const ys = hist
  const meanX = xs.reduce((s, x) => s + x, 0) / n
  const meanY = ys.reduce((s, y) => s + y, 0) / n
  const slope = xs.reduce((s, x, i) => s + (x - meanX) * (ys[i] - meanY), 0)
    / Math.max(xs.reduce((s, x) => s + (x - meanX) ** 2, 0), 1)
  const pct = meanY > 0 ? Math.abs(slope) / meanY * 100 * (n - 1) : 0
  return {
    direction: pct < 5 ? 'stable' : slope > 0 ? 'rising' : 'falling',
    strength: pct < 5 ? 'negligible' : pct < 15 ? 'mild' : 'significant',
    slope: Math.round(slope * 100) / 100,
    change_pct: meanY > 0 ? Math.round((ys[n - 1] - ys[0]) / ys[0] * 100) : 0,
    projected: Math.round((ys[n - 1] + slope) * 10) / 10,
    n,
  }
}

// ── Symptome (E6 + F5) ──────────────────────────────────────────
// [cmd] module-medical-data.jsx:192-207.
export const SYMPTOM_BIOMARKER_MAP: Record<string, string[]> = {
  fatigue: ['Ferritin', 'Hemoglobin', 'Vitamin D (25-OH)', 'TSH', 'Free T3', 'Cortisol (AM)'],
  brain_fog: ['TSH', 'Vitamin B12', 'Vitamin D (25-OH)', 'Glucose (fasting)'],
  low_libido: ['Total Testosterone', 'Estradiol (sens.)', 'SHBG', 'Prolactin'],
  poor_sleep: ['Cortisol (AM)', 'Magnesium (RBC)', 'Vitamin D (25-OH)'],
  weight_gain: ['TSH', 'Insulin (fasting)', 'HOMA-IR', 'Cortisol (AM)'],
  joint_pain: ['hs-CRP', 'Vitamin D (25-OH)', 'Uric Acid'],
  poor_recovery: ['hs-CRP', 'Total Testosterone', 'Ferritin', 'Cortisol (AM)'],
}

export type Symptom = {
  id: string; name: string; label: string; cat: string; severity: number
  onset: string; resolved: string | null
  triggers: string[]; relieving: string[]; impact: number; photos: number
}

export const SYMPTOMS: Symptom[] = [
  { id: 's1', name: 'poor_sleep', label: 'Poor sleep', cat: 'sleep', severity: 5, onset: '2026-08-09', resolved: null, triggers: ['late caffeine', 'training after 19:00'], relieving: ['magnesium', 'earlier cutoff'], impact: 6, photos: 0 },
  { id: 's2', name: 'joint_pain', label: 'Right elbow pain', cat: 'physical', severity: 4, onset: '2026-07-28', resolved: null, triggers: ['heavy pressing'], relieving: ['BPC-157', 'eccentrics'], impact: 5, photos: 2 },
  { id: 's3', name: 'fatigue', label: 'Afternoon fatigue', cat: 'physical', severity: 3, onset: '2026-08-11', resolved: '2026-08-14', triggers: ['deficit day', 'poor sleep'], relieving: ['carb refeed'], impact: 4, photos: 0 },
  { id: 's4', name: 'brain_fog', label: 'Brain fog', cat: 'mental', severity: 3, onset: '2026-08-02', resolved: '2026-08-05', triggers: ['low carb'], relieving: ['food'], impact: 3, photos: 0 },
]

// ── Medikamente mit Ueberwachung (F6) ───────────────────────────
export type Medikament = {
  id: string; name: string; type: string; dosage: string; frequency: string
  start: string | null; indication: string; monitoring: boolean
  monitoring_frequency: string | null; last_test: string | null
  next_due: string | null; monitoring_overdue: boolean; status: string
  targets: string[]; side_effects: string[]; interactions: string[]
  physician: string | null; rx: string | null
}

// [cmd] module-medical-data.jsx:210-216.
export const MEDICATIONS_V2: Medikament[] = [
  { id: 'm1', name: 'Testosterone Cypionate', type: 'prescription', dosage: '150 mg', frequency: 'twice_weekly', start: '2024-09-12', indication: 'Primary hypogonadism', monitoring: true, monitoring_frequency: 'quarterly', last_test: '2026-04-23', next_due: '2026-07-22', monitoring_overdue: true, status: 'active', targets: ['TT', 'fT', 'E2', 'HCT', 'PSA'], side_effects: ['mild acne'], interactions: ['warfarin (monitor INR)'], physician: 'Dr. M. Kessler', rx: 'RX-44102' },
  { id: 'm2', name: 'HCG', type: 'prescription', dosage: '500 IU', frequency: 'twice_weekly', start: '2024-09-12', indication: 'Testicular preservation', monitoring: true, monitoring_frequency: 'quarterly', last_test: '2026-04-23', next_due: '2026-07-22', monitoring_overdue: true, status: 'active', targets: ['LH', 'FSH', 'E2'], side_effects: [], interactions: [], physician: 'Dr. M. Kessler', rx: 'RX-44103' },
  { id: 'm3', name: 'Anastrozole', type: 'prescription', dosage: '0.25 mg', frequency: 'every_3rd_day', start: '2024-10-04', indication: 'Estrogen control', monitoring: true, monitoring_frequency: 'quarterly', last_test: '2026-04-23', next_due: '2026-07-22', monitoring_overdue: true, status: 'active', targets: ['E2'], side_effects: ['joint dryness'], interactions: [], physician: 'Dr. M. Kessler', rx: 'RX-44104' },
  { id: 'm4', name: 'MK-677', type: 'supplement', dosage: '10 mg', frequency: 'daily', start: '2026-03-30', indication: 'Recovery / sleep depth', monitoring: true, monitoring_frequency: 'monthly', last_test: '2026-04-23', next_due: '2026-05-23', monitoring_overdue: true, status: 'active', targets: ['IGF-1', 'GLU', 'HbA1c'], side_effects: ['increased appetite', 'water retention'], interactions: [], physician: 'Dr. M. Kessler', rx: null },
  { id: 'm5', name: 'Ibuprofen 400', type: 'otc', dosage: '400 mg', frequency: 'as_needed', start: null, indication: 'Elbow flare-ups', monitoring: false, monitoring_frequency: null, last_test: null, next_due: null, monitoring_overdue: false, status: 'active', targets: [], side_effects: [], interactions: ['reduces effect of antihypertensives'], physician: null, rx: null },
]

// ── Warnungen (SPEC_09 §3) ──────────────────────────────────────
export type Warnung = {
  id: string; type: string; severity: 'critical' | 'warning' | 'info'
  action: string
  biomarker?: Biomarker; flag?: string; value?: number
  medication?: Medikament
}

/**
 * [cmd] module-medical-data.jsx:175-189.
 *
 * `[read]` Der Text „Contact your doctor immediately" steht so in der
 * Vorlage und bleibt. Das Modul diagnostiziert nicht — es verweist.
 */
export function generateAlerts(): Warnung[] {
  const alerts: Warnung[] = []
  BIOMARKERS.forEach(b => {
    const flag = calcBiomarkerFlag(b.value, b)
    if (flag === 'critical_low' || flag === 'critical_high') {
      alerts.push({ id: `AL-${b.id}`, biomarker: b, flag, type: flag, severity: 'critical', value: b.value, action: 'Contact your doctor immediately' })
    } else if (flag === 'low' || flag === 'high') {
      alerts.push({ id: `AL-${b.id}`, biomarker: b, flag, type: 'out_of_range', severity: 'warning', value: b.value, action: 'Discuss with your doctor' })
    }
  })
  MEDICATIONS_V2.filter(m => m.monitoring_overdue).forEach(m => {
    alerts.push({ id: `AL-med-${m.id}`, medication: m, type: 'monitoring_overdue', severity: 'info', action: 'Schedule bloodwork' })
  })
  const rang: Record<string, number> = { critical: 0, warning: 1, info: 2 }
  return alerts.sort((a, b) => rang[a.severity] - rang[b.severity])
}

// ── Wirksamkeit von Praeparaten (F7) ────────────────────────────
// [cmd] module-medical-data.jsx:219-227.
export const SUPPLEMENT_BIOMARKER_MAP = [
  { supplement: 'Vitamin D3 + K2', biomarker: 'vitd', start: '2024-04-02' },
  { supplement: 'Omega-3 EPA/DHA', biomarker: 'crp', start: '2024-01-08' },
  { supplement: 'Omega-3 EPA/DHA', biomarker: 'tg', start: '2024-01-08' },
  { supplement: 'Magnesium Glycinate', biomarker: 'mg', start: '2024-06-15' },
  { supplement: 'Zinc Picolinate', biomarker: 'zn', start: '2025-02-01' },
  { supplement: 'MK-677', biomarker: 'igf1', start: '2026-03-30' },
  { supplement: 'MK-677', biomarker: 'glu', start: '2026-03-30' },
]

export type Wirksamkeit = {
  supplement: string; biomarker: string; start: string
  biomarkerObj: Biomarker
  baseline: number; latest: number; changePct: number
  baselineFlag: string; latestFlag: string; status: string
}

/** [cmd] module-medical-data.jsx:229-245. */
export function calcSupplementEffectiveness(
  entry: typeof SUPPLEMENT_BIOMARKER_MAP[number],
): Wirksamkeit | null {
  const b = BIOMARKERS.find(x => x.id === entry.biomarker)
  if (!b) return null
  // Vereinfacht wie in der Vorlage: zweiter Verlaufswert = vorher,
  // letzter = nachher.
  const before = b.hist[1]
  const latest = b.hist[b.hist.length - 1]
  const changePct = Math.round((latest - before) / before * 100)
  const baselineFlag = calcBiomarkerFlag(before, b)
  const latestFlag = calcBiomarkerFlag(latest, b)
  const becameOptimal = latestFlag === 'optimal' && baselineFlag !== 'optimal'
  const improving = (['critical_low', 'low', 'normal'].includes(baselineFlag) && latest > before)
    || (['critical_high', 'high', 'normal'].includes(baselineFlag) && latest < before)
  return {
    ...entry, biomarkerObj: b,
    baseline: before, latest, changePct, baselineFlag, latestFlag,
    status: becameOptimal ? 'effective'
      : improving && Math.abs(changePct) >= 10 ? 'partial'
        : Math.abs(changePct) < 5 ? 'no_change' : 'inconclusive',
  }
}

// ── Zusammenhaenge (F8) ─────────────────────────────────────────
// [cmd] module-medical-data.jsx:248-255.
export const CORRELATIONS = [
  { id: 'c1', biomarker: 'hs-CRP', module: 'training', metric: 'weekly volume', finding: 'hs-CRP rises above 1.0 mg/L in weeks exceeding 20 sets per muscle group', n: 7, r: 0.68, direction: 'positive', confidence: 'moderate' },
  { id: 'c2', biomarker: 'HbA1c', module: 'nutrition', metric: 'compliance score', finding: 'HbA1c improves when nutrition compliance holds above 80% for 8+ weeks', n: 5, r: -0.74, direction: 'negative', confidence: 'moderate' },
  { id: 'c3', biomarker: 'Ferritin', module: 'recovery', metric: 'sleep score', finding: 'Ferritin below 100 ng/mL coincides with sleep scores 8 points lower on average', n: 6, r: 0.52, direction: 'positive', confidence: 'weak' },
  { id: 'c4', biomarker: 'Total Testosterone', module: 'recovery', metric: 'ACWR', finding: 'Testosterone trough drops when acute:chronic workload ratio exceeds 1.5', n: 4, r: -0.61, direction: 'negative', confidence: 'weak' },
  { id: 'c5', biomarker: 'Vitamin D (25-OH)', module: 'supplements', metric: 'D3 intake log', finding: 'Vitamin D rose 22 → 48 ng/mL across 24 months of consistent 4000 IU dosing', n: 6, r: 0.94, direction: 'positive', confidence: 'strong' },
  { id: 'c6', biomarker: 'Glucose (fasting)', module: 'supplements', metric: 'MK-677 cycle', finding: 'Fasting glucose climbed 14 mg/dL within 7 weeks of MK-677 initiation', n: 4, r: 0.88, direction: 'positive', confidence: 'strong' },
]

// ── Laborberichte und OCR (E4 + F2) ─────────────────────────────
// [cmd] module-medical-data.jsx:258-265.
export const LAB_REPORTS = [
  { id: 'LR-006', date: '2026-04-23', lab: 'MVZ Lab Berlin', status: 'completed', markers: 34, needs_review: 0, file: 'Q2-2026-panel.pdf', size: '1.4 MB' },
  { id: 'LR-005', date: '2026-03-25', lab: 'MVZ Lab Berlin', status: 'completed', markers: 8, needs_review: 0, file: 'MK677-baseline.pdf', size: '320 KB' },
  { id: 'LR-004', date: '2026-01-18', lab: 'MVZ Lab Berlin', status: 'completed', markers: 32, needs_review: 2, file: 'Q1-2026-panel.pdf', size: '1.2 MB' },
  { id: 'LR-003', date: '2025-10-22', lab: 'MVZ Lab Berlin', status: 'completed', markers: 31, needs_review: 0, file: 'Q4-2025-panel.pdf', size: '1.3 MB' },
  { id: 'LR-002', date: '2025-07-15', lab: 'Synlab München', status: 'completed', markers: 28, needs_review: 1, file: 'Q3-2025-panel.pdf', size: '1.2 MB' },
  { id: 'LR-001', date: '2024-08-22', lab: 'MVZ Lab Berlin', status: 'completed', markers: 24, needs_review: 0, file: 'baseline-hypogonadism.pdf', size: '1.1 MB' },
]

export type OcrZeile = {
  raw: string; matched: string | null; loinc: string | null
  value: number; unit: string; conf: number; action: string
  converted?: { to: string; factor: number; result: number }
}

/**
 * [cmd] module-medical-data.jsx:267-280.
 *
 * `[read]` **Das ist dieselbe Aufgabe wie unsere Lebensmittel-Aliase**,
 * nur fuer Laborwerte: „Hämoglobin" muss auf „Hemoglobin" treffen,
 * „GPT (ALAT)" auf „ALT". Das Vorgaengerrepo hat dafuer eine fertige
 * Synonymliste — siehe Bericht.
 */
export const OCR_EXTRACTED: OcrZeile[] = [
  { raw: 'Hämoglobin', matched: 'Hemoglobin', loinc: '718-7', value: 15.8, unit: 'g/dL', conf: 0.97, action: 'auto' },
  { raw: 'Hämatokrit', matched: 'Hematocrit', loinc: '4544-3', value: 48, unit: '%', conf: 0.96, action: 'auto' },
  { raw: 'Testosteron gesamt', matched: 'Total Testosterone', loinc: '2986-8', value: 712, unit: 'ng/dL', conf: 0.94, action: 'auto' },
  { raw: 'Östradiol sensitiv', matched: 'Estradiol (sens.)', loinc: '2243-4', value: 26, unit: 'pg/mL', conf: 0.91, action: 'auto' },
  { raw: 'Glucose nüchtern', matched: 'Glucose (fasting)', loinc: '1558-6', value: 5.66, unit: 'mmol/L', conf: 0.89, action: 'auto', converted: { to: 'mg/dL', factor: 18.02, result: 102 } },
  { raw: 'Ferritin', matched: 'Ferritin', loinc: '2276-4', value: 142, unit: 'ng/mL', conf: 0.95, action: 'auto' },
  { raw: '25-OH-Vitamin D3', matched: 'Vitamin D (25-OH)', loinc: '14635-7', value: 48, unit: 'ng/mL', conf: 0.88, action: 'auto' },
  { raw: 'hs-CRP', matched: 'hs-CRP', loinc: '30522-7', value: 0.6, unit: 'mg/L', conf: 0.93, action: 'auto' },
  { raw: 'Kreatinin', matched: 'Creatinine', loinc: '2160-0', value: 101, unit: 'µmol/L', conf: 0.82, action: 'review', converted: { to: 'mg/dL', factor: 0.0113, result: 1.14 } },
  { raw: 'GPT (ALAT)', matched: 'ALT', loinc: '1742-6', value: 28, unit: 'U/L', conf: 0.76, action: 'review' },
  { raw: 'Freies T3', matched: 'Free T3', loinc: '3051-0', value: 3.1, unit: 'pg/mL', conf: 0.71, action: 'review' },
  { raw: 'Lp(a)', matched: null, loinc: null, value: 28, unit: 'mg/dL', conf: 0.54, action: 'reject' },
]

// [cmd] module-medical-data.jsx:282-289.
export const UNIT_CONVERSIONS = [
  { analyte: 'Cholesterol', from: 'mmol/L', to: 'mg/dL', factor: 38.67 },
  { analyte: 'Glucose', from: 'mmol/L', to: 'mg/dL', factor: 18.02 },
  { analyte: 'Creatinine', from: 'µmol/L', to: 'mg/dL', factor: 0.0113 },
  { analyte: 'Testosterone', from: 'nmol/L', to: 'ng/dL', factor: 28.82 },
  { analyte: 'Cortisol', from: 'nmol/L', to: 'µg/dL', factor: 0.0362 },
  { analyte: 'Triglycerides', from: 'mmol/L', to: 'mg/dL', factor: 88.57 },
]
