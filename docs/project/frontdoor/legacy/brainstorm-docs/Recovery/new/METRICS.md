# Recovery Module — Metriken & Algorithmen

## 1. Recovery Score Formel (3 Modi)

### Modus 1: manual (MVP — immer verfügbar)

```typescript
score = (
  ((sleep_quality ?? 7) / 10)                       * 30 +
  (Math.min(sleep_hours ?? 7, 8) / 8)               * 15 +
  ((subjective_feeling ?? 7) / 10)                   * 15 +
  (1 - getAvgSoreness(soreness) / 3)                 * 10 +
  calcTrainingLoadScore(acwr)                        * 15 +
  (nutrition_compliance ?? 70) / 100                 * 10 +
  MOOD_SCORE[mood ?? 'neutral'] / 100                *  5
) + Math.min(modalityBonus, 5)
```

### Modus 2: hrv (mit HRV-Daten)

```typescript
score = (
  calcHRVScore(rmssd, baseline)   * 0.25 +   // HRV: 25%
  (sleep_quality / 10)            * 0.15 +
  (sleep_hours / 8)               * 0.15 +
  (subjective_feeling / 10)       * 0.10 +
  (1 - avgSoreness / 3)           * 0.10 +
  calcTrainingLoadScore(acwr)     * 0.15 +
  (nutrition_compliance / 100)    * 0.10
) * 100 + modalityBonus
```

### Modus 3: wearable (mit Sleep Stages + HRV)

```typescript
score = (
  calcHRVScore(rmssd, baseline)            * 0.25 +
  (sleep_efficiency ?? 85) / 100           * 0.10 +
  (total_sleep_min / 480)                  * 0.10 +
  calcDeepSleepScore(deep_sleep_min)       * 0.10 +
  (subjective_feeling / 10)                * 0.10 +
  (1 - avgSoreness / 3)                    * 0.10 +
  calcTrainingLoadScore(acwr)              * 0.15 +
  (nutrition_compliance / 100)             * 0.05
) * 100 + modalityBonus
```

---

## 2. Mood Multiplier

```typescript
const MOOD_SCORE = { motivated: 100, good: 80, neutral: 60, tired: 30, sick: 10 };
```

---

## 3. Readiness Levels

| Score | Level | Empfehlung |
|---|---|---|
| 90–100 | excellent | high_intensity — PR-Tag |
| 80–89 | good | moderate_to_high |
| 70–79 | moderate | moderate |
| 60–69 | poor | light |
| < 60 | rest | rest / deload |

---

## 4. Muscle Recovery Curve

### Base Curve (lineare Interpolation)

| Stunden seit Training | Recovery % |
|---|---|
| 0–12h | 10–30% |
| 12–24h | 30–50% |
| 24–48h | 50–75% |
| 48–72h | 75–90% |
| 72–96h | 90–100% |
| 96h+ | 100% |

### Modifikatoren

| Faktor | Wert | Modifier |
|---|---|---|
| Volume: 1–4 Sets | — | ×1.15 |
| Volume: 5–8 Sets | — | ×1.05 |
| Volume: 9–12 Sets | — | ×1.00 |
| Volume: 13–18 Sets | — | ×0.85 |
| Volume: 19–24 Sets | — | ×0.70 |
| Volume: 25+ Sets | — | ×0.50 |
| Sleep Quality ≥8.5 | — | ×1.15 |
| Sleep Quality 7–8.5 | — | ×1.00 |
| Sleep Quality 5–7 | — | ×0.85 |
| Sleep Quality <5 | — | ×0.65 |
| Protein ≥90% + Kalorien ≥95% | — | ×1.10 |
| Protein ≥80% | — | ×1.00 |
| Protein <80% | — | ×0.80 |
| Protein <60% + Deficit >500 | — | ×0.60 |
| Soreness 0 | — | ×1.10 |
| Soreness 1 | — | ×1.00 |
| Soreness 2 | — | ×0.75 |
| Soreness 3 | — | ×0.50 |

---

## 5. HRV Score Berechnung

```typescript
function calcHRVScore(rmssd: number, baseline: HRVBaseline): number {
  if (baseline.data_points < 7) return 70;  // Zu wenig Daten
  const z = (rmssd - baseline.avg_rmssd) / Math.max(baseline.stddev_rmssd, 1);
  return Math.max(0, Math.min(100, Math.round(70 + z * 15)));
}
// Z = +2 → ~100, Z = 0 → 70, Z = -2 → ~40
```

---

## 6. HRV Baseline: 30-Tage Rolling Average

```typescript
function updateBaseline(userId: string, newRMSSD: number) {
  const last30 = getLastNMeasurements(userId, 30);
  const all = [...last30, newRMSSD];
  return {
    avg_rmssd:    mean(all),
    stddev_rmssd: stddev(all),
    data_points:  all.length,
  };
}
```

---

## 7. ACWR (Acute/Chronic Workload Ratio)

```
acute  = Σ volume_kg letzte 7 Tage
chronic = Ø volume_kg pro Woche der letzten 28 Tage
ACWR   = acute / chronic
```

| ACWR | Status | Training-Score |
|---|---|---|
| 0.8–1.2 | Optimal | 100 |
| 1.2–1.5 | Erhöhtes Risiko | 60–99 (linear) |
| > 1.5 | Sehr hohes Risiko | < 60 |
| < 0.8 | Undertraining | 85 |

---

## 8. Modality Bonus

```typescript
const MODALITY_BONUS = {
  massage: 2.5, sauna: 2.0, contrast_therapy: 2.0,
  cold_plunge: 1.5, nap: 1.5, meditation: 1.0, breathwork: 1.0,
  yoga: 0.75, stretching: 0.5, foam_rolling: 0.5, active_recovery: 0.5,
};
const MAX_DAILY_BONUS = 5.0;
```

---

## 9. Übertraining Score

```typescript
const SIGNALS = [
  { id: 'hrv_low',    active: hrv_7d_avg < baseline * 0.90, days: 7 },
  { id: 'score_low',  active: recovery_3d_avg < 55,          days: 3 },
  { id: 'sleep_poor', active: sleep_quality_3d < 6,          days: 3 },
  { id: 'fatigue',    active: subjective_3d <= 4,             days: 3 },
  { id: 'soreness',   active: soreness_high_days >= 3,        days: 7 },
  { id: 'acwr_high',  active: current_acwr > 1.5,             days: 1 },
  { id: 'mood_low',   active: motivation_5d <= 3,             days: 5 },
  { id: 'performance',active: training_trend === 'declining', days: 7 },
];

// 0–2: none, 3–4: moderate, 5–6: high, 7+: critical
```

---

## 10. Typische Muskel-Recovery Zeiten

| Gruppe | Normal | Heavy |
|---|---|---|
| Quadriceps, Hamstrings, Glutes | 72h | 96–120h |
| Chest, Back, Shoulders | 48–72h | 72–96h |
| Biceps, Triceps | 36–48h | 48–72h |
| Forearms, Core, Calves | 24–48h | 48–72h |
