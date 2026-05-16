# Nutrition Module — TDEE, Scoring & Makro-Formeln

## BMR-Formeln

### 1. Mifflin-St Jeor (Standard, empfohlen)
```
Men:   BMR = (10 × weight_kg) + (6.25 × height_cm) - (5 × age) + 5
Women: BMR = (10 × weight_kg) + (6.25 × height_cm) - (5 × age) - 161
```
Genauigkeit: ±10% für die meisten Menschen. Beste validierte moderne Formel.

### 2. Katch-McArdle (mit Körperfett %)
```
LBM  = weight_kg × (1 - bodyfat% / 100)
BMR  = 370 + (21.6 × LBM_kg)
```
Besser für Athleten und Personen mit sehr hohem/niedrigem Körperfettanteil.

### 3. Cunningham (Hochtrainierte Athleten)
```
BMR = 500 + (22 × LBM_kg)
```
Gibt höhere Werte — berücksichtigt höheren Metabolismus bei trainierten Personen.

### 4. Harris-Benedict (Klassisch, historisch)
```
Men:   BMR = (13.397 × weight_kg) + (4.799 × height_cm) - (5.677 × age) + 88.362
Women: BMR = (9.247 × weight_kg)  + (3.098 × height_cm) - (4.330 × age) + 447.593
```

---

## Aktivitäts-Multiplikatoren (PAL)

| Level | Multiplikator | Beschreibung |
|---|---|---|
| Sedentary | 1.2 | Bürojob, kein Sport |
| Lightly Active | 1.375 | Leichter Sport 1–3×/Woche |
| Moderately Active | 1.55 | Mittlerer Sport 3–5×/Woche |
| Very Active | 1.725 | Intensiver Sport 6–7×/Woche |
| Extremely Active | 1.9 | Sehr intensiv + körperl. Arbeit |

```
TDEE_estimated = BMR × PAL
```

---

## Adaptive TDEE (MacroFactor-Ansatz)

Besser als Formeln: aus echten Daten lernen.

```
// Wöchentliche Berechnung:
weight_change_kg       = avg_weight_this_week - avg_weight_last_week
calories_from_change   = weight_change_kg × 7700   // 7.700 kcal pro kg
avg_daily_intake       = sum(logged_calories_7days) / 7

TDEE_actual = avg_daily_intake - (calories_from_change / 7)

// Beispiel:
// Avg. 2.500 kcal/Tag gegessen, 0.3kg abgenommen
// calories_from_change = 0.3 × 7.700 = 2.310 kcal / 7 = 330/Tag
// TDEE_actual = 2.500 + 330 = 2.830 kcal/Tag

// Glättung (exponentieller gleitender Durchschnitt):
TDEE_smoothed = 0.40 × TDEE_this_week
              + 0.30 × TDEE_last_week
              + 0.20 × TDEE_2ago
              + 0.10 × TDEE_3ago
```

---

## Kaloriendefizit/-überschuss nach Ziel

| Ziel | Kalorien-Delta | Veränderungsrate |
|---|---|---|
| Aggressive Cut | -750 bis -1.000 | 1,0–1,5% KG/Woche |
| Moderate Fat Loss | -400 bis -600 | 0,5–0,75% KG/Woche |
| Slow Fat Loss | -200 bis -400 | 0,25–0,5% KG/Woche |
| Maintenance | ±100 | ~0 |
| Lean Bulk | +200 bis +400 | 0,25–0,5% KG/Monat |
| Moderate Bulk | +400 bis +600 | 0,5–1,0% KG/Monat |
| Aggressive Bulk | +600 bis +1.000 | 1,0–1,5% KG/Monat |
| Recomp | ±0 (Cycling ±200) | Kraft ↑, KF% ↓ |
| Reverse Diet | +50–150/Woche | Langsame Stabilisierung |

---

## Protein-Empfehlungen

| Ziel | g/kg Körpergewicht | Quelle |
|---|---|---|
| Sedentary (RDA) | 0.8 | WHO/USDA |
| General Fitness | 1.2–1.6 | ACSM |
| Muskelaufbau | 1.6–2.2 | Morton 2018 Meta-Analysis |
| Fat Loss (Muskelerhalt) | 1.8–2.7 | Helms 2014 |
| Contest Prep | 2.3–3.1 | ISSN |
| Ältere (>65) | 1.2–1.6 | PROT-AGE Study |

---

## Fett-Empfehlungen

| Ziel | % der Kalorien | g/kg KG |
|---|---|---|
| Hormonelles Minimum | 15–20% | 0.3–0.5 |
| Standard | 25–35% | 0.8–1.2 |
| Low-Fat (Cutting) | 20–25% | 0.5–0.8 |
| Keto | 65–75% | — |
| Contest Prep | 15–25% | ≥0.5 (niemals unter 0.5g/kg) |

---

## Kohlenhydrate

```
Carbs_g = (Total_kcal - (Protein_g × 4) - (Fat_g × 9)) / 4
// KH füllen die verbleibenden Kalorien nach Protein und Fett
```

**Ballaststoffe:**
- Minimum: 14g pro 1.000 kcal
- Ziel: 25–35g/Tag
- Obere Grenze: 40–50g/Tag

---

## Nutrition Score Formel

```typescript
// packages/scoring/src/nutrition.ts → calcNutritionScore()

Score = (
  proteinCompliance × 0.30 +   // Höchste Priorität
  calorieCompliance × 0.25 +
  carbsCompliance   × 0.15 +
  fatCompliance     × 0.15 +
  fiberCompliance   × 0.15
) × level_multiplier × 100
```

### Level-Multiplier

| Level | Multiplier | Bedeutung |
|---|---|---|
| beginner | 0.75 | 75% vom Target = 100% Score |
| intermediate | 0.90 | 90% = 100% |
| advanced | 1.00 | 100% = 100% |
| elite | 1.10 | 110% = 100% |

### Score-Thresholds

| Score | Status | Bedeutung |
|---|---|---|
| ≥ 80 | `ok` | Grün — Ziele erfüllt |
| 50–79 | `warn` | Gelb — Verbesserungsbedarf |
| < 50 | `block` | Rot — Signifikantes Defizit |

---

## Mikronährstoff-RDA (Ziel-relevant)

| Nährstoff | RDA | Athleten | Relevanz |
|---|---|---|---|
| Vitamin D | 600 IU (15μg) | 2.000–5.000 IU | Testosteron, Recovery, Immunsystem |
| Magnesium | 400mg | 400–600mg | Schlaf, Recovery, Krämpfe |
| Zink | 11mg | 15–30mg | Testosteron, Immunsystem |
| Eisen | 8mg (M) / 18mg (F) | 15–20mg | Sauerstofftransport, Energie |
| Calcium | 1.000mg | 1.000–1.500mg | Knochendichte |
| Omega-3 | 250mg EPA+DHA | 1–3g EPA+DHA | Entzündung, Recovery |
| B12 | 2.4μg | 5–10μg | Energie, Nervensystem |
| Natrium | <2.300mg | 3.000–5.000mg | Elektrolyte (Athleten schwitzen!) |
| Kalium | 2.600–3.400mg | 3.500–4.700mg | Muskelfunktion |

---

## Mikronährstoff 3-Tier System

| Tier | Nährstoffe | Sichtbarkeit |
|---|---|---|
| Tier 1 — Essential (15) | Ca, Fe, Mg, P, K, Zn, Vit A/D/E/K/C/B1/B2/B3/B6 | Immer sichtbar (Free) |
| Tier 2 — Athlete (+8) | Cu, Mn, Se, Iodine, Folate, B12, B5, Biotin | Plus-Tier |
| Tier 3 — Medical (100+) | Alle BLS-Nährstoffe inkl. Aminosäuren, Fettsäuren | Pro-Tier |

---

## Quellen

- Mifflin MD et al. (1990). Am J Clin Nutr. 51(2):241-7
- Helms ER et al. (2014). JISSN. 11:20
- Morton RW et al. (2018). Br J Sports Med. 52(6):376-384
- Cunningham JJ (1991). Am J Clin Nutr. 54:963-9
- ISSN Position Stands on Protein, Energy Availability
- MacroFactor Expenditure Algorithm (macrofactor.com/research)
- PROT-AGE Study Group — Protein for Elderly
