# Goals Module — Goal Phase Models

## Phase State Machine Overview

```
ONBOARDING
    ↓ (User wählt Ziel)
┌──────────┬──────────┬──────────┬──────────┬────────────┐
│ FAT_LOSS │ LEAN_BULK│MAINTENANCE│  RECOMP  │CONTEST_PREP│
└────┬─────┴────┬─────┴──────────┴──────────┴────┬───────┘
     ↓          ↓                                  ↓
 REVERSE    MINI_CUT                          PEAK_WEEK
  _DIET     (opt.)                                 ↓
     ↓          ↓                             REVERSE
     └──────────┴──────────────────────────────DIET
                    → NEW PHASE (User wählt)

EXPERT_BB_ANNUAL: 12-Monats Zyklus (automatische Transitions)
```

---

## Phase 1: FAT_LOSS

```json
{
  "moderate": {
    "calorie_deficit":    { "min": -400, "max": -600 },
    "rate_of_loss":       "0.5–0.75% BW/week",
    "protein_g_per_kg":   { "min": 1.8, "max": 2.4 },
    "fat_min_g_per_kg":   0.5,
    "max_duration_weeks": 20,
    "diet_break":         { "every_weeks": 8, "duration_weeks": 1 }
  },
  "aggressive": {
    "calorie_deficit":    { "min": -750, "max": -1000 },
    "rate_of_loss":       "1.0–1.5% BW/week",
    "protein_g_per_kg":   { "min": 2.3, "max": 3.1 },
    "max_duration_weeks": 8,
    "diet_break":         { "every_weeks": 4, "duration_weeks": 1 }
  },
  "guards": [
    "strength_loss > 10% → reduce_deficit",
    "weekly_loss > 1.0kg → increase_calories (+150)",
    "duration > max_duration → force_transition"
  ],
  "transitions_to": ["REVERSE_DIET", "MAINTENANCE", "LEAN_BULK"]
}
```

---

## Phase 2: LEAN_BULK

```json
{
  "calorie_surplus":    { "min": 200, "max": 400 },
  "rate_of_gain":       "0.25–0.5% BW/month",
  "protein_g_per_kg":   { "min": 1.6, "max": 2.2 },
  "fat_pct_calories":   { "min": 25, "max": 35 },
  "max_duration_weeks": 52,
  "guards": [
    "bf_increase > 2% in 4 weeks → reduce_surplus (-100 kcal)",
    "weight_gain > 1kg/week → surplus too high",
    "no_strength_progress 3+ weeks → check_training"
  ],
  "transitions_to": ["MINI_CUT", "MAINTENANCE", "CONTEST_PREP"]
}
```

---

## Phase 3: MAINTENANCE

```json
{
  "calorie_target":     "TDEE ± 100",
  "protein_g_per_kg":   { "min": 1.4, "max": 2.0 },
  "duration":           "indefinite",
  "purpose": ["Stabilisierung nach Cut/Bulk", "Langfristige Ernährung", "Lifestyle Mode"],
  "transitions_to": ["FAT_LOSS", "LEAN_BULK", "RECOMP", "CONTEST_PREP"]
}
```

---

## Phase 4: REVERSE_DIET

```json
{
  "weekly_calorie_increase": { "min": 50, "max": 150 },
  "primary_macro_increase":  "carbs",
  "protein":                 "maintain",
  "max_duration_weeks":      16,
  "exit_conditions": [
    "reached_estimated_tdee",
    "weight_gain > 0.5kg/week (zu schnell)",
    "user_satisfied"
  ],
  "guards": [
    "weekly_weight_gain > 0.5kg → slow_down_increase",
    "hunger_normalized → close_to_tdee"
  ],
  "transitions_to": ["MAINTENANCE", "LEAN_BULK", "FAT_LOSS"]
}
```

---

## Phase 5: CONTEST_PREP

```json
{
  "total_duration_weeks": { "min": 16, "max": 24 },
  "sub_phases": [
    { "name": "early",   "weeks": "24-16", "deficit": -300, "cardio": "low" },
    { "name": "mid",     "weeks": "16-8",  "deficit": -600, "cardio": "moderate" },
    { "name": "late",    "weeks": "8-2",   "deficit": -750, "cardio": "high" },
    { "name": "peak_week", "weeks": 1,     "special": true }
  ],
  "protein_g_per_kg": { "min": 2.3, "max": 3.1 },
  "refeeds": {
    "start_after_week": 8,
    "frequency":        "1-2× pro Woche",
    "type":             "High Carb, moderate Kalorien"
  },
  "peak_week": {
    "carb_depletion_days": 3,
    "carb_load_days":      2,
    "sodium_manipulation": true
  },
  "guards": [
    "BF% < 5% (M) oder < 10% (F) → Gesundheitswarnung",
    "strength_loss > 20% → reduce_deficit",
    "hormonal_symptoms → medical_check"
  ],
  "transitions_to": ["REVERSE_DIET"]
}
```

---

## Phase 6: RECOMP

```json
{
  "strategy": {
    "calorie_cycling": {
      "training_days": "+200 vom TDEE",
      "rest_days":     "-300 vom TDEE",
      "weekly_average": "~Maintenance"
    }
  },
  "protein_g_per_kg": { "min": 2.0, "max": 2.4 },
  "success_metrics": ["BF% fallend", "Kraft steigend", "Gewicht stabil"],
  "best_for": ["Anfänger", "Nach Trainingspause", "Übergewicht mit Muscle Memory"],
  "transitions_to": ["LEAN_BULK", "FAT_LOSS"]
}
```

---

## Phase 7: EXPERT_BB_ANNUAL

```json
{
  "annual_plan": [
    { "months": "1-4",   "phase": "LEAN_BULK",     "focus": "Masseaufbau" },
    { "months": "5-6",   "phase": "MAINTENANCE",   "focus": "Transition" },
    { "months": "7-10",  "phase": "CONTEST_PREP",  "focus": "Diäten" },
    { "month":  11,      "phase": "PEAK_WEEK+SHOW","focus": "Wettkampf" },
    { "month":  12,      "phase": "REVERSE_DIET",  "focus": "Recovery" }
  ],
  "auto_transitions": true,
  "coach_override": true,
  "requires": ["experience_level >= advanced"]
}
```

---

## Adaptive Adjustment Algorithm

```typescript
function weeklyAdjustment(data: WeeklyData, phase: PhaseType): Adjustment {
  const { weightTrend, calorieAdherence, strengthTrend, hrv7d } = data;

  if (phase === 'fat_loss') {
    if (weightTrend > -0.1 && calorieAdherence > 85)
      return { action: 'reduce_calories', amount: -100, reason: 'Plateau trotz guter Adherence' };
    if (weightTrend < -1.0)
      return { action: 'increase_calories', amount: +150, reason: 'Verlust zu schnell' };
    if (strengthTrend < -10)
      return { action: 'increase_protein', amount: +20, reason: 'Krafterhalt' };
  }

  if (phase === 'lean_bulk') {
    if (weightTrend > 0.75)
      return { action: 'reduce_calories', amount: -100, reason: 'Zu schnelle Zunahme' };
    if (weightTrend < 0.1 && calorieAdherence > 85)
      return { action: 'increase_calories', amount: +100, reason: 'Unzureichender Überschuss' };
  }

  if (hrv7d < hrv_baseline * 0.85)
    return { action: 'recovery_alert', reason: 'HRV sinkt — Deload erwägen' };

  return { action: 'no_change', reason: 'On track' };
}
```

---

## Phase Transition Guards (alle Phasen)

| Guard | Kondition | Aktion |
|---|---|---|
| Gewichtsverlust zu schnell | >1kg/Woche bei FAT_LOSS | +150 kcal |
| Gewichtsverlust zu langsam | <0.1kg/Woche + >85% Adherence | −100 kcal |
| Kraft schwindet | >10% Rückgang compound lifts | +20g Protein |
| Übertraining | HRV <85% Baseline für 5+ Tage | Deload empfehlen |
| Max. Phasendauer | Erreicht max_duration_weeks | Transition empfehlen |
| Contest Prep kritisch | BF% <5% (M) / <10% (F) | Gesundheitswarnung |
| Zu schnelle Masse | >0.75kg/Woche bei LEAN_BULK | −100 kcal |
