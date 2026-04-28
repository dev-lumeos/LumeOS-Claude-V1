# Recovery Module — Feature Specs
> Spec Phase 4 | Features, Regeln, Implementierungsdetails

---

## Feature 1: Morning Check-in

### Design-Prinzip: <30 Sekunden
Einzige tägliche Pflicht-Interaktion. Muss schnell sein.

### UI-Elemente
- **Schlaf-Stunden:** Slider (0–12h, 0.5er Schritte), Default: 8h
- **Schlafqualität:** Emoji-Slider 😫–🤩 (1–10)
- **Empfinden:** Numerischer Slider 1–10
- **Muskelkater Body Map:** react-body-highlighter, 18 Muskelgruppen, 4 Stufen (0–3)
- **Stimmung:** 5 Buttons mit Emojis (motivated/good/neutral/tired/sick)

### Auto-Prompt
Wenn nach 10:00 Uhr kein Checkin für heute: Banner auf Home-Screen.
Buddy erinnert morgens via Pending Actions.

### UPSERT
Kann beliebig oft überschrieben werden am selben Tag.
Neuer Checkin → Score wird neu berechnet.

### Optionale Felder (Progressive Disclosure)
"Mehr hinzufügen ▼" → Stress-Level, Alkohol, Koffein, Screen-Time, HRV, Schmerz-Bereiche.

---

## Feature 2: Recovery Score

### Score-Formel (Pure Function)

**MVP (ohne HRV/Wearable):**
```typescript
score = (
  (sleep_quality / 10)                             * 30 +  // 30%
  (Math.min(sleep_hours, 8) / 8)                   * 15 +  // 15%
  (subjective_feeling / 10)                        * 15 +  // 15%
  (1 - getAvgSoreness(soreness) / 3)               * 10 +  // 10%
  training_load_score                              * 15 +  // 15% (von Training-Modul)
  nutrition_score                                  * 10 +  // 10% (von Nutrition-Modul)
  MOOD_MULTIPLIER[mood]                            *  5    //  5%
) + modality_bonus;                                        // 0–5 Bonus
```

**Mit HRV (Full Score):**
```typescript
// HRV ersetzt Teile des subjektiven Inputs
score = (
  (sleep_quality / 10)       * 15 +   // reduziert von 30% auf 15%
  (sleep_hours / 8)          * 15 +
  hrv_score                  * 25 +   // HRV: 25% Gewicht
  (subjective_feeling / 10)  * 10 +
  (1 - avgSoreness / 3)      * 10 +
  training_load_score        * 15 +
  nutrition_score            * 10 +   // Sleep Quality: 15%→10% freigegeben
) + modality_bonus;
```

### Mood Multiplier
```typescript
const MOOD_MULTIPLIER = {
  motivated: 1.0,   // 5 Punkte
  good:       0.8,  // 4 Punkte
  neutral:    0.6,  // 3 Punkte
  tired:      0.3,  // 1.5 Punkte
  sick:       0.1,  // 0.5 Punkte
};
```

### Training Load Score (0–1, dann ×15)
```typescript
function calcTrainingLoadScore(acwr: number): number {
  // ACWR = Acute/Chronic Workload Ratio
  // Optimal: 0.8–1.3 → Score 1.0
  // < 0.8 (Undertraining): Score 0.9
  // > 1.3 (Overreaching): Score sinkt
  // > 1.5: Score 0.3
  if (acwr >= 0.8 && acwr <= 1.3) return 1.0;
  if (acwr < 0.8) return 0.9;
  if (acwr <= 1.5) return 1.3 - (acwr - 1.3) * 2;
  return Math.max(0.1, 1.5 - acwr);
}
```

**Wenn kein Training-Modul verfügbar:** neutraler Wert (0.7).

### Modality Bonus
```typescript
const MODALITY_BONUS = {
  sauna: 2.0, cold_plunge: 1.5, contrast_therapy: 2.0,
  massage: 2.5, foam_rolling: 0.5, stretching: 0.5,
  yoga: 0.75, meditation: 1.0, breathwork: 1.0,
  nap: 1.5, active_recovery: 0.5,
};
const MAX_DAILY_BONUS = 5.0;
```

### Readiness Levels
| Score | Level | Empfehlung |
|---|---|---|
| 90–100 | excellent | Maximale Intensität, PR-Tag |
| 80–89 | good | Normales Training |
| 70–79 | moderate | Moderate Intensität |
| 60–69 | poor | Leichtes Training |
| 40–59 | rest | Rest Day empfohlen |
| < 40 | rest | Pflicht-Pause, Arzt bei Persistenz |

---

## Feature 3: Muscle Recovery Map

### Berechnung pro Muskelgruppe
```typescript
function calcMuscleRecovery(
  muscle: string,
  hoursSinceTraining: number,
  sets: number,
  volumeKg: number,
  checkin: RecoveryCheckin
): number {

  // 1. Base Recovery Curve
  let base: number;
  if (hoursSinceTraining < 12)      base = lerp(10, 30, hoursSinceTraining / 12);
  else if (hoursSinceTraining < 24) base = lerp(30, 50, (hoursSinceTraining - 12) / 12);
  else if (hoursSinceTraining < 48) base = lerp(50, 75, (hoursSinceTraining - 24) / 24);
  else if (hoursSinceTraining < 72) base = lerp(75, 90, (hoursSinceTraining - 48) / 24);
  else if (hoursSinceTraining < 96) base = lerp(90, 100, (hoursSinceTraining - 72) / 24);
  else base = 100;

  // 2. Volume Modifier (mehr Sets = langsamer)
  const volumeMod =
    sets <= 6  ? 1.10 :
    sets <= 12 ? 1.00 :
    sets <= 18 ? 0.85 :
    sets <= 24 ? 0.70 : 0.50;

  // 3. Sleep Modifier
  const sleepQ = checkin.sleep_quality ?? 7;
  const sleepMod =
    sleepQ >= 8.5 ? 1.15 :
    sleepQ >= 7   ? 1.00 :
    sleepQ >= 5   ? 0.85 : 0.65;

  // 4. Nutrition Modifier (aus Nutrition-Modul)
  const protein_pct = checkin._protein_pct ?? 1.0;  // injiziert beim Berechnen
  const calorie_pct = checkin._calorie_pct ?? 1.0;
  const nutritionMod =
    protein_pct >= 0.9 && calorie_pct >= 0.95 ? 1.1  :
    protein_pct >= 0.8                          ? 1.0  :
    protein_pct >= 0.6                          ? 0.8  : 0.6;

  // 5. Soreness Modifier
  const sorenessVal = checkin.soreness?.[MUSCLE_SLUG_MAP[muscle]] ?? 0;
  const sorenessMod =
    sorenessVal === 0 ? 1.1  :
    sorenessVal === 1 ? 1.0  :
    sorenessVal === 2 ? 0.75 : 0.50;

  return Math.min(100, Math.round(base * volumeMod * sleepMod * nutritionMod * sorenessMod));
}
```

### 18 Muskelgruppen (für Body Map)
```typescript
const MUSCLE_GROUPS_BODYMAP = [
  'trapezius', 'upper_back', 'lower_back', 'chest',
  'biceps', 'triceps', 'forearm', 'front_deltoids', 'back_deltoids',
  'abs', 'obliques', 'adductor', 'hamstring',
  'quadriceps', 'abductors', 'calves', 'gluteal', 'neck'
];

// Mapping: Training-Modul MuscleGroup Namen → Body Map Slugs
const MUSCLE_SLUG_MAP: Record<string, string> = {
  'Pectoralis Major': 'chest',
  'Latissimus Dorsi': 'upper_back',
  'Quadriceps':       'quadriceps',
  'Hamstrings':       'hamstring',
  'Gluteus Maximus':  'gluteal',
  'Triceps Brachii':  'triceps',
  'Biceps Brachii':   'biceps',
  'Rectus Abdominis': 'abs',
  // ...
};
```

### Farbcoding
- 🟢 > 80%: Ready
- 🟡 50–80%: Recovering
- 🔴 < 50%: Not Ready

---

## Feature 4: HRV Integration

### Phone Camera Messung (PPG)
- 60 Sekunden, Zeigefinger auf Kameralinse + Flashlight
- PPG-Signal → R-R Intervalle → RMSSD Berechnung
- Accuracy: r=0.98 vs. Chest Strap (HRV4Training Paper)
- Limitation: Bewegungsartefakte, schlechte Beleuchtung

### HRV Score Berechnung (vs. persönliche Baseline)
```typescript
function calcHRVScore(rmssd: number, baseline: HRVBaseline): number {
  const deviation = (rmssd - baseline.avg_rmssd) / baseline.stddev_rmssd;
  // Z-Score normalisiert auf 0–100
  // Z = +2 → 100, Z = 0 → 70, Z = -2 → 30, Z ≤ -3 → 0
  const score = 70 + deviation * 15;
  return Math.max(0, Math.min(100, Math.round(score)));
}
```

### Baseline-Update (täglich)
Rolling 30-Tage Average. Wird täglich nach neuer Messung aktualisiert.

---

## Feature 5: Sleep Tracking

### Manuelle Eingabe (MVP)
Schlafstunden + Qualität im Morning Check-in.

### Wearable-Import (Phase 2)
Apple HealthKit / Google Health Connect:
- Schlafdauer total
- Deep Sleep %, REM Sleep %
- Sleep Efficiency (Zeit geschlafen / Zeit im Bett)
- Schlafphasen in Minuten

### Sleep Score für Recovery
```typescript
function calcSleepScore(data: SleepData | null, checkin: RecoveryCheckin): number {
  if (data) {
    // Wearable-Daten vorhanden
    const efficiencyScore = data.sleep_efficiency / 100;
    const durationScore   = Math.min(data.total_sleep_minutes / 480, 1.0); // vs. 8h
    const deepScore       = Math.min((data.deep_sleep_minutes ?? 0) / 90, 1.0); // vs. 90min ideal
    return Math.round((efficiencyScore * 0.4 + durationScore * 0.4 + deepScore * 0.2) * 100);
  }
  // Nur subjektive Daten
  const qualityScore   = (checkin.sleep_quality ?? 7) / 10;
  const durationScore  = Math.min((checkin.sleep_hours ?? 7) / 8, 1.0);
  return Math.round((qualityScore * 0.6 + durationScore * 0.4) * 100);
}
```

---

## Feature 6: Recovery Modality Tracking

### Effectiveness Tracking (2-stufig)
1. **Sofort:** Unmittelbar nach der Aktivität (1–10)
2. **Next-Day:** Am nächsten Morgen optional bewertbar
   "Wie hat sich die gestrige Sauna auf dich ausgewirkt?"

### Score-Delta Berechnung
Automatisch: Recovery Score vor Modalität vs. Score am nächsten Tag.
`next_day_score_delta = score(day+1) - score(day)`

### Modality Bonus: Maximierung
Auch wenn User 3 Modalitäten am Tag macht → Max-Bonus = 5 Punkte.
Vermeidet Manipulation des Scores durch excessive Logging.

---

## Feature 7: Übertraining Detection

### Signal-System (8 Signale)
```typescript
const OVERTRAINING_SIGNALS = [
  { id: 'hrv_low',      check: (d: UserData) => d.hrv_7d_avg < d.hrv_baseline * 0.90 },
  { id: 'rhr_high',     check: (d) => d.resting_hr_avg > d.rhr_baseline + 5 },
  { id: 'sleep_poor',   check: (d) => d.sleep_quality_3d_avg < 6 },
  { id: 'fatigue',      check: (d) => d.subjective_3d_avg <= 4 },
  { id: 'soreness',     check: (d) => d.soreness_hotspot_days >= 3 },
  { id: 'score_low',    check: (d) => d.recovery_score_3d_avg < 55 },
  { id: 'mood_low',     check: (d) => d.motivation_5d_avg <= 3 },
  { id: 'performance',  check: (d) => d.training_trend === 'declining' },
];
```

### Severity-Protokoll
- 0–2 Signale: Normal
- 3–4: `moderate` — Warnung + Deload-Vorschlag
- 5–6: `high` — Deload-Woche dringend empfohlen
- 7+: `critical` — Pflicht-Pause + Arzt-Empfehlung

### Alert-Status
`active` → User liest → `acknowledged` → User hat Problem gelöst → `resolved`
Kein neuer Alert solange einer aktiv.

---

## Feature 8: Recovery Protocols

System-definierte Protokoll-Vorlagen für häufige Szenarien:

| Protokoll | Ziel | Dauer | Aktivitäten |
|---|---|---|---|
| Active Recovery Week | Allgemeine Erholung | 7 Tage | Light Cardio, Yoga, Stretching |
| Passive Deload | Übertraining | 7 Tage | Volumen −50%, viel Schlaf |
| Sleep Optimization | Schlechter Schlaf | 14 Tage | Schlafhygiene, Supplementation |
| Injury Protocol | Verletzung | 7–14 Tage | RICE, Physio, Modified Training |

Protokoll-Aktivierung → Daily Tasks in "Heute"-Ansicht (wie Ghost Entries).

---

## Feature 9: Wearable Sync (Phase 2)

### Apple HealthKit Daten
- `HKCategoryTypeIdentifierSleepAnalysis`
- `HKQuantityTypeIdentifierHeartRateVariabilitySDNN`
- `HKQuantityTypeIdentifierRestingHeartRate`
- `HKQuantityTypeIdentifierBloodOxygen`
- `HKQuantityTypeIdentifierRespiratoryRate`

### Sync-Strategie
- Background Observer (iOS) → alle 15 Minuten
- Beim App-Öffnen: sofortiger Pull der letzten 24h
- Conflict Resolution: Wearable-Daten haben Vorrang vor manuellen wenn `device_confidence > 0.8`

---

## Feature 10: Pending Actions

`GET /api/recovery/pending-actions`

**Auslöser:**

| Typ | Bedingung | Priorität |
|---|---|---|
| morning_checkin | Kein Checkin heute nach 10:00 | high |
| overtraining_alert | Active Alert nicht bestätigt | high |
| protocol_task | Protokoll-Aktivität heute offen | normal |
| hrv_measurement | Kein HRV seit 3+ Tagen (wenn User nutzt) | normal |
| next_day_modality | Gestrige Modality-Bewertung ausstehend | low |
