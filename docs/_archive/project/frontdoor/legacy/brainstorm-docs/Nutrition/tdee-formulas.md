# TDEE & Macro Formulas — Technical Reference

## BMR Formulas

### 1. Mifflin-St Jeor (Recommended Default)
```
Men:   BMR = (10 × weight_kg) + (6.25 × height_cm) - (5 × age) + 5
Women: BMR = (10 × weight_kg) + (6.25 × height_cm) - (5 × age) - 161
```
- **Best for:** General population
- **Accuracy:** ±10% for most people
- **Source:** Mifflin et al. (1990), most validated modern formula

### 2. Katch-McArdle (With Body Fat %)
```
BMR = 370 + (21.6 × LBM_kg)
LBM = weight_kg × (1 - bodyfat% / 100)
```
- **Best for:** Athletes, low/high BF% individuals
- **Requires:** Body fat percentage
- **More accurate** than Mifflin for lean or obese individuals

### 3. Cunningham (Athletes)
```
BMR = 500 + (22 × LBM_kg)
```
- **Best for:** Highly trained athletes
- **Gives higher values** (accounts for higher metabolic rate in trained individuals)
- **Source:** Cunningham (1991)

### 4. Harris-Benedict Revised
```
Men:   BMR = (13.397 × weight_kg) + (4.799 × height_cm) - (5.677 × age) + 88.362
Women: BMR = (9.247 × weight_kg) + (3.098 × height_cm) - (4.330 × age) + 447.593
```
- **Historical standard**, still widely used
- Less accurate than Mifflin-St Jeor for overweight individuals

---

## Activity Multipliers (PAL)

| Level | Multiplier | Description | Examples |
|-------|-----------|-------------|----------|
| Sedentary | 1.2 | Desk job, no exercise | Office worker |
| Lightly Active | 1.375 | Light exercise 1-3 days/week | Casual gym-goer |
| Moderately Active | 1.55 | Moderate exercise 3-5 days/week | Regular lifter |
| Very Active | 1.725 | Hard exercise 6-7 days/week | Serious athlete |
| Extremely Active | 1.9 | Very hard exercise + physical job | Pro athlete, laborer |

```
TDEE_estimated = BMR × PAL
```

---

## Adaptive TDEE (MacroFactor Approach)

```
// Better than formulas: learn from ACTUAL data

// Weekly calculation:
weight_change_kg = avg_weight_this_week - avg_weight_last_week
calories_from_weight_change = weight_change_kg × 7700  // 7700 kcal per kg
avg_daily_intake = sum(logged_calories_7days) / 7

TDEE_actual = avg_daily_intake - (calories_from_weight_change / 7)

// Example:
// Ate avg 2,500 kcal/day, lost 0.3kg this week
// calories_from_change = 0.3 × 7700 = 2,310 kcal over 7 days = 330/day
// TDEE_actual = 2,500 + 330 = 2,830 kcal/day
// (Higher than expected — user burns more than estimated)

// Smoothing: use exponential moving average over 3-4 weeks
TDEE_smoothed = 0.4 × TDEE_this_week + 0.3 × TDEE_last_week + 0.2 × TDEE_2ago + 0.1 × TDEE_3ago
```

---

## Macro Calculations

### Protein
| Goal | g/kg Bodyweight | g/kg LBM | Source |
|------|----------------|----------|--------|
| Sedentary (RDA) | 0.8 | — | WHO/USDA |
| General Fitness | 1.2-1.6 | — | ACSM |
| Muscle Building | 1.6-2.2 | — | Morton 2018 Meta-Analysis |
| Fat Loss (preserve muscle) | 1.8-2.7 | 2.3-3.1 | Helms 2014 |
| Contest Prep | 2.3-3.1 | — | Helms 2014, ISSN |
| Aggressive Cut | 2.3-3.1 | — | Higher protein spares more muscle |
| Elderly (>65) | 1.2-1.6 | — | PROT-AGE Study |

### Fat
| Goal | % of Calories | g/kg BW | Notes |
|------|-------------|---------|-------|
| Minimum | 15-20% | 0.3-0.5 | Hormonal minimum |
| Standard | 25-35% | 0.8-1.2 | Recommended range |
| Low-Fat (cutting) | 20-25% | 0.5-0.8 | Functional minimum |
| Keto | 65-75% | — | Specialized |
| Contest Prep | 15-25% | ≥0.5 | Never below 0.5g/kg |

### Carbs
```
Carbs_g = (Total_kcal - (Protein_g × 4) - (Fat_g × 9)) / 4
// Carbs fill remaining calories after protein and fat are set
```

### Fiber
```
Minimum: 14g per 1000 kcal
Target: 25-35g/day
Upper: 40-50g/day (more can cause GI issues)
```

---

## Goal-Specific Calorie Targets

| Goal | Calorie Delta from TDEE | Rate of Change |
|------|------------------------|----------------|
| Aggressive Cut | -750 to -1000 | 1.0-1.5% BW/week |
| Moderate Fat Loss | -400 to -600 | 0.5-0.75% BW/week |
| Slow Fat Loss | -200 to -400 | 0.25-0.5% BW/week |
| Maintenance | ±100 | ~0 |
| Lean Bulk | +200 to +400 | 0.25-0.5% BW/month |
| Moderate Bulk | +400 to +600 | 0.5-1.0% BW/month |
| Aggressive Bulk | +600 to +1000 | 1.0-1.5% BW/month |
| Recomp | ±0 (cycling ±200) | Strength ↑, BF% ↓ |
| Reverse Diet | +50-150/week | Slow weight stabilization |

---

## Micronutrient Targets (Goal-Relevant)

| Nutrient | RDA | Athletes | Why it matters |
|----------|-----|---------|----------------|
| **Vitamin D** | 600 IU | 2,000-5,000 IU | Testosterone, Recovery, Immune |
| **Magnesium** | 400mg | 400-600mg | Sleep, Recovery, Cramps |
| **Zinc** | 11mg | 15-30mg | Testosterone, Immune |
| **Iron** | 8mg (M), 18mg (F) | 15-20mg | Oxygen transport, Energy |
| **Calcium** | 1000mg | 1000-1500mg | Bone density |
| **Omega-3** | 250mg EPA+DHA | 1-3g EPA+DHA | Inflammation, Recovery |
| **B12** | 2.4μg | 5-10μg | Energy, Nervous System |
| **Sodium** | <2,300mg | 3,000-5,000mg | Electrolytes (athletes sweat!) |
| **Potassium** | 2,600-3,400mg | 3,500-4,700mg | Muscle function |

---

## References
- Mifflin MD et al. (1990). Am J Clin Nutr. 51(2):241-7
- Helms ER et al. (2014). JISSN. 11:20
- Morton RW et al. (2018). Br J Sports Med. 52(6):376-384
- ISSN Position Stands on Protein, Energy Availability
- Cunningham JJ (1991). Am J Clin Nutr. 54:963-9
- Katch-McArdle formula
- MacroFactor Expenditure Algorithm (macrofactor.com/research)
- RP Strength Volume Landmarks (rpstrength.com)
