# Training Module — Scoring & Progression

## 1. Training Compliance Score (→ Goals)

```typescript
score = (
  session_adherence_pct  × 0.40 +   // Geplante vs. absolvierte Sessions
  volume_in_landmarks_pct × 0.30 +   // Muskelgruppen im MAV-Bereich
  strength_trend_pct     × 0.20 +   // Positive Stärke-Entwicklung
  muscle_balance_score   × 0.10     // Push/Pull/Legs Balance
) × 100
```

**Thresholds:** ok ≥ 80 | warn 50–79 | block < 50

---

## 2. 1RM Formeln

**Brzycki** (Standard, reps 1–30):
```
1RM = weight / (1.0278 - 0.0278 × reps)
```

**Epley** (Alternative):
```
1RM = weight × (1 + reps/30)
```

**Rep-zu-1RM Prozentsatz:**
| Reps | %1RM |
|---|---|
| 1 | 100% |
| 3 | 93% |
| 5 | 87% |
| 8 | 80% |
| 10 | 75% |
| 12 | 70% |
| 15 | 65% |

---

## 3. Progressive Overload Modelle

### Modell 1: Linear
```
Wenn alle Sets in Rep-Range → weight += increment (default 2.5kg)
Anwendung: Beginner, konsistente Progression
```

### Modell 2: Double Progression (Standard)
```
Phase 1 (Reps): Wenn noch nicht bei max_reps → Reps steigern
Phase 2 (Gewicht): Wenn alle Sets bei max_reps stable → weight += increment, Reps reset auf min
Anwendung: Hypertrophie, Intermediate
```

### Modell 3: Wave Loading
```
Intensitäts-Welle: [75%, 85%, 95%, Deload 65%]
Week 1 → 75%, Week 2 → 85%, Week 3 → 95%, Week 4 → Deload
Anwendung: Periodisiertes Krafttraining
```

### Modell 4: RPE-Autoregulation
```
targetRPE = 8.0 (konfigurierbar)
Wenn session_rpe > max_rpe → weight × 0.95
Wenn session_rpe < min_rpe → weight × 1.03
Anwendung: Advanced, tagesabhängige Anpassung
```

### Modell 5: DUP (Daily Undulating Periodization)
```
Rotation: Kraft (3-5 Reps, 87-93% 1RM) → Hypertrophie (8-12, 70-80%) → Power (2-4, 85-90%)
Wechsel: täglich oder pro Session
Anwendung: Variiertes Stimuli-Training, Advanced
```

---

## 4. Deload Detection

```typescript
// Einer der folgenden Trigger:
- Reps fallen 3 Sätze hintereinander ab
- RPE > 9 in 2+ Sessions in Folge
- Keine Progression für deload_threshold Sessions (default: 3)
- User-Feedback: Performance 😩 in 2+ Sessions

// Deload-Protokoll:
weight = current × (1 - deload_percentage)    // default: -10%
sets   = round(target_sets × 0.67)            // ~2/3 Sätze
duration: 1 Woche, dann Wiederaufnahme
```

---

## 5. ACWR (Acute/Chronic Workload Ratio)

```
acute  = Trainingsvolumen letzte 7 Tage (kg)
chronic = Trainingsvolumen letzte 28 Tage Ø/Woche (kg)
ACWR   = acute / chronic
```

| ACWR | Status | Training-Score Modifier |
|---|---|---|
| < 0.8 | Undertraining | 0.85 |
| 0.8–1.2 | Optimal (Sweet Spot) | 1.0 |
| 1.2–1.5 | Erhöhtes Risiko | 0.7–0.9 |
| > 1.5 | Sehr hohes Risiko | < 0.5 |

---

## 6. Volume Landmarks (Population Defaults, Sets/Woche)

| Muskelgruppe | MV | MEV | MAV | MRV |
|---|---|---|---|---|
| Chest | 8 | 10 | 16 | 22 |
| Back | 8 | 10 | 18 | 24 |
| Shoulders | 6 | 8 | 14 | 20 |
| Biceps | 4 | 6 | 10 | 16 |
| Triceps | 4 | 6 | 10 | 16 |
| Quads | 6 | 8 | 14 | 22 |
| Hamstrings | 4 | 6 | 10 | 18 |
| Glutes | 4 | 6 | 12 | 18 |
| Calves | 6 | 8 | 12 | 18 |
| Abs | 0 | 4 | 10 | 16 |

**Feedback-Loop Personalisierung:**
```
IF pump_avg ≥ 2.5 AND soreness_avg ≤ 1.5 → personal_mav += 1
IF soreness_avg ≥ 2.5 AND pump_avg ≤ 1.5 → personal_mrv = current_sets
Mindestens 5 Feedback-Einträge für Anpassung
```

---

## 7. Muscle Balance Score

```typescript
// Push = Chest + Anterior Deltoid + Triceps Sets/Woche
// Pull = Lats + Rhomboids + Posterior Deltoid + Biceps Sets/Woche
// Legs = Quads + Hamstrings + Glutes Sets/Woche

push_pull_ratio = push_sets / pull_sets
// Ideal: 0.8–1.2
// > 1.5 → "too_much_push" → Score −30
// < 0.7 → "too_much_pull" → Score −20

legs_pct = legs_sets / total_sets
// < 25% → Score −20
```

---

## 8. Strength Standards

Vergleich mit Bevölkerungswerten (Brzycki 1RM / Körpergewicht Multiplier).

| Level | Bench Press (Männer) | Squat | Deadlift |
|---|---|---|---|
| Beginner | 0.5× BW | 0.75× BW | 1.0× BW |
| Novice | 0.75× BW | 1.25× BW | 1.5× BW |
| Intermediate | 1.0× BW | 1.5× BW | 2.0× BW |
| Advanced | 1.5× BW | 2.0× BW | 2.5× BW |
| Elite | 2.0× BW | 2.5× BW | 3.0× BW |
